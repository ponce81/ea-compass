<script setup>
import { ref, computed } from 'vue'
import { db, YEARS, CURRENT_YEAR, invTotal, invYear, invPeriod, l1Caps, capIdsDeep, currentApps } from '../store'
import { money, pct, categoryColor } from '../utils/format'
import PageHead from '../components/PageHead.vue'
import Kpi from '../components/Kpi.vue'
import BarChart from '../components/BarChart.vue'
import Donut from '../components/Donut.vue'
import HBars from '../components/HBars.vue'
import Tag from '../components/Tag.vue'
import EntityChip from '../components/EntityChip.vue'

const horizon = ref('all') // all | current | future
const includeIdeas = ref(true)
const statusFilter = ref('')

const inHorizon = inv => {
  const ys = Object.keys(inv.budget).map(Number)
  if (horizon.value === 'current') return ys.some(y => y <= CURRENT_YEAR) && inv.status !== 'Idea' && inv.status !== 'Proposed'
  if (horizon.value === 'future') return ys.some(y => y > CURRENT_YEAR) || ['Idea', 'Proposed'].includes(inv.status)
  return true
}
const list = computed(() => db.investments
  .filter(inHorizon)
  .filter(i => includeIdeas.value || i.status !== 'Idea')
  .filter(i => !statusFilter.value || i.status === statusFilter.value)
  .slice().sort((a, b) => b.priority - a.priority))

const series = computed(() => ['Run', 'Grow', 'Transform'].map(cat => ({
  name: cat, color: categoryColor[cat], values: YEARS.map(y => list.value.filter(i => i.category === cat).reduce((s, i) => s + invYear(i, y), 0))
})))
const statusSeries = computed(() => {
  const st = [['Completed', '#94a3b8'], ['In Progress', '#2563eb'], ['Approved', '#16a34a'], ['Proposed', '#f59e0b'], ['Idea', '#a78bfa']]
  return st.map(([s, c]) => ({ name: s, color: c, values: YEARS.map(y => list.value.filter(i => i.status === s).reduce((sum, i) => sum + invYear(i, y), 0)) }))
})
const chartMode = ref('category')

const total = computed(() => list.value.reduce((s, i) => s + invTotal(i), 0))
const capex = computed(() => list.value.reduce((s, i) => s + invTotal(i) * i.capexShare, 0))
const thisYear = computed(() => list.value.reduce((s, i) => s + invYear(i, CURRENT_YEAR), 0))
const future = computed(() => list.value.reduce((s, i) => s + YEARS.filter(y => y > CURRENT_YEAR).reduce((t, y) => t + invYear(i, y), 0), 0))
const runCost = computed(() => currentApps().reduce((s, a) => s + a.annualCost, 0))
const runVsChange = computed(() => {
  const run = runCost.value + list.value.filter(i => i.category === 'Run').reduce((s, i) => s + invYear(i, CURRENT_YEAR), 0)
  const change = list.value.filter(i => i.category !== 'Run').reduce((s, i) => s + invYear(i, CURRENT_YEAR), 0)
  return { run, change, ratio: run / (run + change || 1) }
})

const byGoal = computed(() => db.goals.map((g, k) => ({
  label: g.name, color: ['#8b5cf6', '#2563eb', '#14b8a6', '#f59e0b', '#ef4444'][k],
  value: list.value.filter(i => i.goalIds.includes(g.id)).reduce((s, i) => s + invTotal(i) / i.goalIds.length, 0)
})))
const byCap = computed(() => l1Caps().map(c => {
  const ids = capIdsDeep(c.id)
  return { label: c.name, value: list.value.filter(i => i.capabilityIds.some(x => ids.includes(x))).reduce((s, i) => s + invTotal(i), 0), color: 'var(--c-business)' }
}).sort((a, b) => b.value - a.value))
</script>

<template>
  <PageHead eyebrow="IT Portfolio Management" title="IT Investments" color="var(--c-implementation)"
            subtitle="Current and future IT investments, classified as Run / Grow / Transform and traced to goals and capabilities.">
    <div class="seg">
      <button :class="{ on: horizon === 'all' }" @click="horizon = 'all'">All</button>
      <button :class="{ on: horizon === 'current' }" @click="horizon = 'current'">Current (committed)</button>
      <button :class="{ on: horizon === 'future' }" @click="horizon = 'future'">Future (pipeline)</button>
    </div>
    <label class="row small"><input v-model="includeIdeas" type="checkbox" /> Include ideas</label>
  </PageHead>

  <div class="grid g-4">
    <Kpi label="Total portfolio" :value="money(total)" :hint="`${list.length} investments · ${pct(capex / (total || 1))} CAPEX`" />
    <Kpi :label="`Spend ${CURRENT_YEAR}`" :value="money(thisYear)" hint="change budget this year" />
    <Kpi :label="`Pipeline ${CURRENT_YEAR + 1}+`" :value="money(future)" hint="future years" />
    <Kpi :label="`Run vs change ${CURRENT_YEAR}`" :value="`${Math.round(runVsChange.ratio * 100)} / ${100 - Math.round(runVsChange.ratio * 100)}`" :hint="`Run ${money(runVsChange.run)} · Change ${money(runVsChange.change)}`" />
  </div>

  <div class="grid g-3 mt">
    <div class="card span-2">
      <div class="card-head">
        <div><h2>Investment profile by year</h2><p>Budget per year</p></div>
        <div class="seg"><button :class="{ on: chartMode === 'category' }" @click="chartMode = 'category'">By category</button><button :class="{ on: chartMode === 'status' }" @click="chartMode = 'status'">By status</button></div>
      </div>
      <BarChart :labels="YEARS" :series="chartMode === 'category' ? series : statusSeries" :format="money" :highlight="CURRENT_YEAR" />
    </div>
    <div class="card">
      <div class="card-head"><div><h2>By strategic goal</h2><p>Total budget, split evenly across goals</p></div></div>
      <Donut :segments="byGoal" :center-value="money(total)" center-label="total" :format="money" />
    </div>
  </div>

  <div class="grid g-3 mt">
    <div class="card span-2">
      <div class="card-head">
        <div><h2>Investment register</h2><p>Sorted by priority score</p></div>
        <select v-model="statusFilter"><option value="">All statuses</option><option v-for="s in ['Completed','In Progress','Approved','Proposed','Idea']" :key="s">{{ s }}</option></select>
      </div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Investment</th><th>Category</th><th>Status</th><th>Period</th><th class="right">Total</th><th class="right">{{ CURRENT_YEAR }}</th><th class="right">ROI</th><th class="right">Priority</th></tr></thead>
          <tbody>
            <tr v-for="i in list" :key="i.id">
              <td><EntityChip type="investment" :id="i.id" /><div class="subtle" style="margin-top:3px">{{ i.benefit }}</div></td>
              <td><Tag :value="i.category" /></td>
              <td><Tag :value="i.status" /></td>
              <td class="nowrap muted">{{ invPeriod(i) }}</td>
              <td class="right nowrap strong">{{ money(invTotal(i)) }}</td>
              <td class="right nowrap">{{ invYear(i, CURRENT_YEAR) ? money(invYear(i, CURRENT_YEAR)) : '–' }}</td>
              <td class="right">{{ i.roi != null ? pct(i.roi) : 'mandatory' }}</td>
              <td class="right"><span class="tag" :class="i.priority >= 80 ? 't-green' : i.priority >= 60 ? 't-blue' : 't-grey'">{{ i.priority }}</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div class="card">
      <div class="card-head"><div><h2>By capability domain</h2><p>Where change money goes</p></div></div>
      <HBars :items="byCap" :format="money" />
    </div>
  </div>
</template>
