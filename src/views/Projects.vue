<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { db, get } from '../store'
import { money, fmtMonth } from '../utils/format'
import PageHead from '../components/PageHead.vue'
import Tag from '../components/Tag.vue'
import EntityChip from '../components/EntityChip.vue'

const route = useRoute()
const phase = ref('')
const expanded = ref(route.query.highlight || null)
const list = computed(() => db.projects.filter(p => !phase.value || p.phase === phase.value))
const phases = ['Idea', 'Initiation', 'Planning', 'Execution', 'Closing']
const ragDot = { Green: 'd-green', Amber: 'd-amber', Red: 'd-red' }
const totals = computed(() => ({
  budget: list.value.reduce((s, p) => s + p.budget, 0),
  spent: list.value.reduce((s, p) => s + p.spent, 0)
}))
</script>

<template>
  <PageHead eyebrow="Phase G – Implementation Governance" title="Projects" color="var(--c-implementation)"
            subtitle="Change initiatives, their architectural scope and compliance status.">
    <router-link to="/projects/new" class="btn primary">+ Plan new project</router-link>
  </PageHead>

  <div class="card">
    <div class="row" style="margin-bottom:12px">
      <div class="seg">
        <button :class="{ on: !phase }" @click="phase = ''">All ({{ db.projects.length }})</button>
        <button v-for="ph in phases" :key="ph" :class="{ on: phase === ph }" @click="phase = ph">{{ ph }} ({{ db.projects.filter(p => p.phase === ph).length }})</button>
      </div>
      <span class="subtle" style="margin-left:auto">Budget {{ money(totals.budget) }} · spent {{ money(totals.spent) }}</span>
    </div>
    <div class="table-wrap">
      <table>
        <thead><tr><th>Project</th><th>Phase</th><th>RAG</th><th>Timeline</th><th>Budget</th><th>Capabilities</th><th>App impact</th><th>Arch. review</th></tr></thead>
        <tbody>
          <template v-for="p in list" :key="p.id">
            <tr class="clickable" :style="route.query.highlight === p.id ? { background: '#f0fdf4' } : null" @click="expanded = expanded === p.id ? null : p.id">
              <td><div class="strong">{{ p.name }}</div><div class="subtle">{{ p.id }} · {{ p.manager }}</div></td>
              <td><Tag :value="p.phase" /></td>
              <td class="nowrap"><span class="dot" :class="ragDot[p.rag]" /> {{ p.rag }}</td>
              <td class="small nowrap">{{ fmtMonth(p.start) }} – {{ fmtMonth(p.end) }}</td>
              <td style="min-width:130px"><div class="progress"><div :style="{ width: Math.min(100, p.spent / p.budget * 100) + '%' }" /></div><div class="subtle">{{ money(p.spent) }} / {{ money(p.budget) }}</div></td>
              <td class="small">{{ p.capabilityIds.length }}</td>
              <td><div class="row">
                <Tag v-if="p.impacts.filter(i => i.change === 'Introduce').length" :value="`+${p.impacts.filter(i => i.change === 'Introduce').length}`" t="green" />
                <Tag v-if="p.impacts.filter(i => i.change === 'Modify').length" :value="`~${p.impacts.filter(i => i.change === 'Modify').length}`" t="blue" />
                <Tag v-if="p.impacts.filter(i => i.change === 'Retire').length" :value="`−${p.impacts.filter(i => i.change === 'Retire').length}`" t="red" />
              </div></td>
              <td><Tag :value="p.archReview" /></td>
            </tr>
            <tr v-if="expanded === p.id">
              <td colspan="8" style="background:#fafbfd;padding:16px">
                <div class="grid g-3">
                  <div>
                    <h4 class="subtle" style="margin-bottom:6px">CAPABILITIES IN SCOPE</h4>
                    <div class="row"><EntityChip v-for="c in p.capabilityIds" :key="c" type="capability" :id="c" /></div>
                    <h4 class="subtle" style="margin:12px 0 6px">INVESTMENT</h4>
                    <EntityChip v-if="p.investmentId" type="investment" :id="p.investmentId" />
                    <div v-if="get('investment', p.investmentId)" class="row mt"><EntityChip v-for="g in get('investment', p.investmentId).goalIds" :key="g" type="goal" :id="g" /></div>
                  </div>
                  <div>
                    <h4 class="subtle" style="margin-bottom:6px">APPLICATION IMPACT</h4>
                    <div class="stack"><div v-for="i in p.impacts" :key="i.appId" class="row between"><EntityChip type="application" :id="i.appId" /><Tag :value="i.change" /></div></div>
                  </div>
                  <div>
                    <h4 class="subtle" style="margin-bottom:6px">MILESTONES</h4>
                    <div class="stack small"><div v-for="m in p.milestones" :key="m.name">◆ {{ m.name }} <span class="subtle">· {{ fmtMonth(m.date) }}</span></div></div>
                    <div v-if="!p.milestones.length" class="empty">No milestones defined.</div>
                    <div v-if="p.issues" class="alert warn mt small">{{ p.issues }}</div>
                    <div class="mt small muted">Architect: {{ p.architect }}</div>
                  </div>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </div>
</template>
