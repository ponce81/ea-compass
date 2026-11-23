<script setup>
import { ref, computed } from 'vue'
import { db, l1Caps, childrenOf, appState, isLive, runCostAt, projectsForApp } from '../store'
import { money } from '../utils/format'
import PageHead from '../components/PageHead.vue'
import Kpi from '../components/Kpi.vue'
import Tag from '../components/Tag.vue'
import EntityChip from '../components/EntityChip.vue'

const from = ref(0)
const to = ref(3)
const onlyChanges = ref(false)

const appsAt = (capId, idx) => db.applications.filter(a => a.capabilityIds.includes(capId) && (isLive(appState(a.id, idx)) || (idx > from.value && appState(a.id, idx) === 'Planned')))

const rows = computed(() => l1Caps().map(l1 => ({
  l1,
  caps: childrenOf(l1.id).map(c => {
    const base = appsAt(c.id, from.value)
    const target = appsAt(c.id, to.value)
    const removed = base.filter(a => !target.includes(a))
    const added = target.filter(a => !base.includes(a))
    const kept = base.filter(a => target.includes(a))
    let gap = 'No change'
    if (added.length && removed.length) gap = 'Replace'
    else if (added.length) gap = 'New'
    else if (removed.length) gap = target.length ? 'Consolidate' : 'Uncovered'
    const modified = kept.filter(a => projectsForApp(a.id).some(p => p.impacts.some(i => i.appId === a.id && i.change === 'Modify')))
    if (gap === 'No change' && modified.length) gap = 'Enhance'
    return { c, base, target, removed, added, kept, modified, gap }
  }).filter(r => !onlyChanges.value || r.gap !== 'No change')
})).filter(g => g.caps.length))

const gapTone = { Replace: 'purple', New: 'green', Consolidate: 'blue', Uncovered: 'red', Enhance: 'teal', 'No change': 'grey' }
const allCaps = computed(() => rows.value.flatMap(g => g.caps))
const appsCount = idx => db.applications.filter(a => isLive(appState(a.id, idx))).length
const retiring = computed(() => db.applications.filter(a => isLive(appState(a.id, from.value)) && !isLive(appState(a.id, to.value)) && appState(a.id, to.value) !== 'Planned'))
const introduced = computed(() => db.applications.filter(a => !isLive(appState(a.id, from.value)) && (isLive(appState(a.id, to.value)) || appState(a.id, to.value) === 'Planned')))
const costDelta = computed(() => runCostAt(to.value) - runCostAt(from.value))
const onPremShare = idx => {
  const live = db.applications.filter(a => isLive(appState(a.id, idx)))
  return live.length ? Math.round(live.filter(a => a.hosting === 'On-Prem').length / live.length * 100) : 0
}
</script>

<template>
  <PageHead eyebrow="Phase E – Opportunities & Solutions" title="Target Architecture & Gap Analysis" color="var(--c-implementation)"
            subtitle="Compare any two plateaus. Gaps between baseline and target become work packages for the roadmap.">
    <router-link to="/states" class="btn">Transition views & export →</router-link>
    <div class="row">
      <select v-model.number="from"><option v-for="(p, i) in db.plateaus" :key="p.id" :value="i" :disabled="i >= to">{{ p.name }} ({{ p.date }})</option></select>
      <span class="subtle">→</span>
      <select v-model.number="to"><option v-for="(p, i) in db.plateaus" :key="p.id" :value="i" :disabled="i <= from">{{ p.name }} ({{ p.date }})</option></select>
    </div>
  </PageHead>

  <div class="grid g-4">
    <Kpi label="Live applications" :value="`${appsCount(from)} → ${appsCount(to)}`" :hint="`${retiring.length} retired · ${introduced.length} introduced`" />
    <Kpi label="Application run cost / yr" :value="money(runCostAt(to))" :hint="`${costDelta <= 0 ? '' : '+'}${money(costDelta)} vs ${db.plateaus[from].name}`" :hint-tone="costDelta <= 0 ? 'good' : 'bad'" />
    <Kpi label="On-premises share" :value="`${onPremShare(to)}%`" :hint="`was ${onPremShare(from)}% (Cloud-first principle)`" :hint-tone="onPremShare(to) < onPremShare(from) ? 'good' : ''" />
    <Kpi label="Capabilities changing" :value="allCaps.filter(r => r.gap !== 'No change').length" :hint="`${allCaps.filter(r => r.gap === 'Uncovered').length} would lose IT support`" :hint-tone="allCaps.some(r => r.gap === 'Uncovered') ? 'bad' : 'good'" />
  </div>

  <div class="card mt">
    <div class="card-head">
      <div><h2>Gap analysis by capability</h2><p>Applications supporting each capability in {{ db.plateaus[from].name }} vs {{ db.plateaus[to].name }}</p></div>
      <label class="row small"><input v-model="onlyChanges" type="checkbox" /> Only show changes</label>
    </div>
    <div class="table-wrap">
      <table>
        <thead><tr><th style="width:220px">Capability</th><th>{{ db.plateaus[from].name }}</th><th>{{ db.plateaus[to].name }}</th><th>Gap</th><th>Maturity</th></tr></thead>
        <tbody>
          <template v-for="g in rows" :key="g.l1.id">
            <tr><td colspan="5" style="background:#fffbeb" class="strong">{{ g.l1.name }}</td></tr>
            <tr v-for="r in g.caps" :key="r.c.id">
              <td><EntityChip type="capability" :id="r.c.id" /></td>
              <td><div class="row">
                <span v-for="a in r.base" :key="a.id" class="chip" :style="r.removed.includes(a) ? { textDecoration: 'line-through', color: '#b91c1c', background: '#fef2f2' } : null">{{ a.name }}</span>
                <span v-if="!r.base.length" class="subtle">–</span>
              </div></td>
              <td><div class="row">
                <span v-for="a in r.target" :key="a.id" class="chip" :style="r.added.includes(a) ? { color: '#166534', background: '#f0fdf4', borderColor: '#86efac' } : null">{{ r.added.includes(a) ? '+ ' : '' }}{{ a.name }}</span>
                <span v-if="!r.target.length" class="tag t-red">No support</span>
              </div></td>
              <td><Tag :value="r.gap" :t="gapTone[r.gap]" /></td>
              <td class="nowrap small">{{ r.c.maturity }} → {{ r.c.targetMaturity }}</td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </div>

  <div class="grid g-2 mt">
    <div class="card">
      <div class="card-head"><div><h2>Applications retired</h2><p>Decommissioning work packages</p></div></div>
      <div class="stack"><div v-for="a in retiring" :key="a.id" class="row between"><EntityChip type="application" :id="a.id" /><span class="subtle">saves {{ money(a.annualCost) }} / yr</span></div></div>
      <div v-if="!retiring.length" class="empty">None.</div>
    </div>
    <div class="card">
      <div class="card-head"><div><h2>Applications introduced</h2><p>New solution building blocks</p></div></div>
      <div class="stack"><div v-for="a in introduced" :key="a.id" class="row between"><EntityChip type="application" :id="a.id" /><span class="subtle">+{{ money(a.annualCost) }} / yr (est.)</span></div></div>
      <div v-if="!introduced.length" class="empty">None.</div>
    </div>
  </div>
</template>
