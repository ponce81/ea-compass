<script setup>
import { ref, computed } from 'vue'
import { db, techForApp, monthsUntil } from '../store'
import { money, fmtMonth, domainColor } from '../utils/format'
import PageHead from '../components/PageHead.vue'
import Tag from '../components/Tag.vue'
import EntityChip from '../components/EntityChip.vue'

const tab = ref('principles')
const openAdr = ref(null)
const reviewQueue = computed(() => db.projects.filter(p => p.archReview !== 'Approved').sort((a, b) => a.start.localeCompare(b.start)))
const techDebt = computed(() => db.applications
  .filter(a => !['Retired', 'Plan'].includes(a.lifecycle))
  .map(a => {
    const tech = techForApp(a)
    const hold = tech.filter(t => t.radar === 'Hold')
    const expired = tech.filter(t => t.eol && monthsUntil(t.eol) < 0)
    return { a, hold, expired, score: hold.length * 2 + expired.length * 3 + (a.criticality === 'Mission critical' ? 2 : 0) }
  })
  .filter(x => x.hold.length)
  .sort((x, y) => y.score - x.score))
</script>

<template>
  <PageHead eyebrow="Architecture Governance · Requirements Management" title="Principles & Decisions"
            subtitle="Architecture principles, decision records (ADRs), the Architecture Review Board queue and compliance.">
    <div class="seg">
      <button :class="{ on: tab === 'principles' }" @click="tab = 'principles'">Principles</button>
      <button :class="{ on: tab === 'adr' }" @click="tab = 'adr'">Decisions (ADR)</button>
      <button :class="{ on: tab === 'arb' }" @click="tab = 'arb'">Review board</button>
      <button :class="{ on: tab === 'compliance' }" @click="tab = 'compliance'">Compliance</button>
    </div>
  </PageHead>

  <div v-if="tab === 'principles'" class="grid g-2">
    <div v-for="p in db.principles" :key="p.id" class="card" :style="{ borderTop: `3px solid ${domainColor[p.domain]}` }">
      <div class="row between"><span class="subtle">{{ p.id }} · {{ p.domain }}</span></div>
      <h2 style="margin:4px 0 8px">{{ p.name }}</h2>
      <p>{{ p.statement }}</p>
      <dl class="kv mt" style="grid-template-columns:100px 1fr">
        <dt>Rationale</dt><dd class="muted">{{ p.rationale }}</dd>
        <dt>Implications</dt><dd class="muted">{{ p.implications }}</dd>
      </dl>
    </div>
  </div>

  <div v-else-if="tab === 'adr'" class="card">
    <table>
      <thead><tr><th>ID</th><th>Decision</th><th>Domain</th><th>Status</th><th>Date</th></tr></thead>
      <tbody>
        <template v-for="d in db.adrs" :key="d.id">
          <tr class="clickable" @click="openAdr = openAdr === d.id ? null : d.id">
            <td class="subtle nowrap">{{ d.id }}</td><td class="strong">{{ d.title }}</td><td class="muted">{{ d.domain }}</td><td><Tag :value="d.status" /></td><td class="muted nowrap">{{ fmtMonth(d.date) }}</td>
          </tr>
          <tr v-if="openAdr === d.id"><td colspan="5" style="background:#fafbfd">
            <dl class="kv" style="grid-template-columns:120px 1fr;padding:6px 0">
              <dt>Context</dt><dd>{{ d.context }}</dd><dt>Decision</dt><dd>{{ d.decision }}</dd><dt>Consequences</dt><dd>{{ d.consequences }}</dd>
            </dl>
          </td></tr>
        </template>
      </tbody>
    </table>
  </div>

  <div v-else-if="tab === 'arb'" class="card">
    <div class="card-head"><div><h2>Architecture Review Board queue</h2><p>Projects not yet fully approved</p></div></div>
    <table>
      <thead><tr><th>Project</th><th>Phase</th><th>Start</th><th>Budget</th><th>Architect</th><th>Review status</th></tr></thead>
      <tbody>
        <tr v-for="p in reviewQueue" :key="p.id">
          <td><EntityChip type="project" :id="p.id" /></td><td><Tag :value="p.phase" /></td><td class="nowrap">{{ fmtMonth(p.start) }}</td><td>{{ money(p.budget) }}</td><td class="muted">{{ p.architect }}</td><td><Tag :value="p.archReview" /></td>
        </tr>
      </tbody>
    </table>
  </div>

  <div v-else class="card">
    <div class="card-head"><div><h2>Technology compliance (PR8 – Standardized Technology)</h2><p>Live applications depending on "Hold" technologies, ranked by risk</p></div></div>
    <table>
      <thead><tr><th>Application</th><th>Criticality</th><th>TIME</th><th>Hold technologies</th><th>Out of support</th><th>Exit plan</th></tr></thead>
      <tbody>
        <tr v-for="x in techDebt" :key="x.a.id">
          <td><EntityChip type="application" :id="x.a.id" /></td>
          <td><Tag :value="x.a.criticality" /></td>
          <td><Tag :value="x.a.time" /></td>
          <td><div class="row"><span v-for="t in x.hold" :key="t.id" class="tag t-red">{{ t.name }}</span></div></td>
          <td><div class="row"><span v-for="t in x.expired" :key="t.id" class="tag t-red">{{ t.name }} ({{ fmtMonth(t.eol) }})</span></div><span v-if="!x.expired.length" class="subtle">–</span></td>
          <td>
            <template v-if="db.projects.some(p => p.impacts.some(i => i.appId === x.a.id && i.change === 'Retire'))"><Tag value="Covered by project" t="green" /></template>
            <Tag v-else value="Missing" t="amber" />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
