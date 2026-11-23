<script setup>
import { computed } from 'vue'
import { AppWindow, Wallet, FolderKanban, AlertTriangle, TrendingDown, Building2 } from 'lucide-vue-next'
import { db, YEARS, CURRENT_YEAR, currentApps, invYear, monthsUntil, appsForTech, runCostAt, l2Caps } from '../store'
import { money, categoryColor, timeColor, fmtMonth } from '../utils/format'
import PageHead from '../components/PageHead.vue'
import Kpi from '../components/Kpi.vue'
import BarChart from '../components/BarChart.vue'
import Donut from '../components/Donut.vue'
import Tag from '../components/Tag.vue'
import EntityChip from '../components/EntityChip.vue'

const apps = computed(() => currentApps())
const runCost = computed(() => apps.value.reduce((s, a) => s + a.annualCost, 0))
const targetRun = computed(() => runCostAt(3))
const changeBudget = computed(() => db.investments.filter(i => i.status !== 'Idea').reduce((s, i) => s + invYear(i, CURRENT_YEAR), 0))
const atRisk = computed(() => db.projects.filter(p => p.rag !== 'Green'))
const eolTech = computed(() => db.technologies
  .filter(t => t.eol && monthsUntil(t.eol) <= 12 && appsForTech(t.id).some(a => a.lifecycle !== 'Retired'))
  .map(t => ({ ...t, months: monthsUntil(t.eol), apps: appsForTech(t.id).length }))
  .sort((a, b) => a.months - b.months))
const gaps = computed(() => l2Caps().map(c => ({ ...c, gap: c.targetMaturity - c.maturity })).filter(c => c.gap >= 2).sort((a, b) => b.gap - a.gap))

const chartYears = YEARS.slice(1)
const invSeries = computed(() => ['Run', 'Grow', 'Transform'].map(cat => ({
  name: cat, color: categoryColor[cat],
  values: chartYears.map(y => db.investments.filter(i => i.category === cat).reduce((s, i) => s + invYear(i, y), 0))
})))
const timeSeg = computed(() => ['Invest', 'Tolerate', 'Migrate', 'Eliminate'].map(t => ({ label: t, color: timeColor[t], value: apps.value.filter(a => a.time === t).length })))
const ragDot = { Green: 'd-green', Amber: 'd-amber', Red: 'd-red' }
const activeProjects = computed(() => db.projects.filter(p => ['Execution', 'Planning'].includes(p.phase)))
</script>

<template>
  <PageHead eyebrow="Enterprise Architecture Overview" title="Dashboard"
            subtitle="Health of the architecture landscape, change portfolio and key risks at a glance." />

  <div class="grid g-6">
    <Kpi label="Applications in use" :value="apps.length" :icon="AppWindow" color="var(--c-application)" :hint="`${db.applications.filter(a => a.lifecycle === 'Plan').length} planned`" />
    <Kpi label="Application run cost / yr" :value="money(runCost)" :icon="Wallet" color="var(--c-application)" :hint="`Target: ${money(targetRun)}`" :hint-tone="targetRun <= runCost ? 'good' : 'bad'" />
    <Kpi :label="`Change budget ${CURRENT_YEAR}`" :value="money(changeBudget)" :icon="TrendingDown" color="var(--c-implementation)" :hint="`${db.investments.length} investments`" />
    <Kpi label="Projects at risk" :value="atRisk.length" :icon="FolderKanban" color="#f59e0b" :hint="`of ${db.projects.length} projects`" hint-tone="bad" />
    <Kpi label="Tech EOL ≤ 12 months" :value="eolTech.length" :icon="AlertTriangle" color="#dc2626" hint="incl. already expired" hint-tone="bad" />
    <Kpi label="Capability gaps (≥2)" :value="gaps.length" :icon="Building2" color="var(--c-business)" :hint="`of ${l2Caps().length} capabilities`" />
  </div>

  <div class="grid g-3 mt">
    <div class="card span-2">
      <div class="card-head">
        <div><h2>IT investments by year</h2><p>Run · Grow · Transform (all statuses incl. ideas)</p></div>
        <router-link to="/investments" class="small">Open investments →</router-link>
      </div>
      <BarChart :labels="chartYears" :series="invSeries" :format="money" :highlight="CURRENT_YEAR" />
    </div>
    <div class="card">
      <div class="card-head"><div><h2>Application portfolio (TIME)</h2><p>Gartner TIME classification</p></div></div>
      <Donut :segments="timeSeg" :center-value="apps.length" center-label="applications" />
      <div class="alert info mt small">
        {{ timeSeg[2].value + timeSeg[3].value }} applications are flagged for migration or elimination.
      </div>
    </div>
  </div>

  <div class="grid g-3 mt">
    <div class="card span-2">
      <div class="card-head"><div><h2>Active projects</h2><p>Execution and planning phase</p></div><router-link to="/roadmap" class="small">Roadmap →</router-link></div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Project</th><th>Phase</th><th>RAG</th><th>Timeline</th><th>Budget used</th><th>Arch. review</th></tr></thead>
          <tbody>
            <tr v-for="p in activeProjects" :key="p.id">
              <td><EntityChip type="project" :id="p.id" /></td>
              <td><Tag :value="p.phase" /></td>
              <td class="nowrap"><span class="dot" :class="ragDot[p.rag]" /> {{ p.rag }}</td>
              <td class="small muted nowrap">{{ fmtMonth(p.start) }} – {{ fmtMonth(p.end) }}</td>
              <td style="min-width:140px">
                <div class="progress"><div :style="{ width: Math.min(100, p.spent / p.budget * 100) + '%' }" /></div>
                <div class="subtle">{{ money(p.spent) }} / {{ money(p.budget) }}</div>
              </td>
              <td><Tag :value="p.archReview" /></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div class="card">
      <div class="card-head"><div><h2>Technology lifecycle risks</h2><p>End of support within 12 months</p></div></div>
      <div class="stack">
        <div v-for="t in eolTech" :key="t.id" class="row between" style="flex-wrap:nowrap">
          <div><EntityChip type="technology" :id="t.id" /><div class="subtle" style="margin-top:3px">{{ t.apps }} app(s) · EOL {{ fmtMonth(t.eol) }}</div></div>
          <Tag :value="t.months < 0 ? 'Expired' : `${t.months} mo`" :t="t.months < 0 ? 'red' : 'amber'" />
        </div>
      </div>
    </div>
  </div>

  <div class="grid g-2 mt">
    <div class="card">
      <div class="card-head"><div><h2>Largest capability gaps</h2><p>Target maturity – current maturity</p></div><router-link to="/business" class="small">Capability map →</router-link></div>
      <div class="stack">
        <div v-for="c in gaps.slice(0, 7)" :key="c.id" class="row between" style="flex-wrap:nowrap">
          <EntityChip type="capability" :id="c.id" />
          <div class="row" style="flex-wrap:nowrap">
            <span class="subtle">{{ c.maturity }} → {{ c.targetMaturity }}</span>
            <Tag :value="`+${c.gap}`" :t="c.gap >= 3 ? 'red' : 'amber'" />
          </div>
        </div>
      </div>
    </div>
    <div class="card">
      <div class="card-head"><div><h2>Strategic goals</h2><p>KPI progress toward target</p></div><router-link to="/strategy" class="small">Strategy →</router-link></div>
      <div class="stack" style="gap:12px">
        <div v-for="g in db.goals" :key="g.id">
          <div class="row between small"><span class="strong">{{ g.name }}</span><span class="muted">{{ g.kpi }}: {{ g.current }}{{ g.unit }} → {{ g.target }}{{ g.unit }}</span></div>
          <div class="progress" style="margin-top:5px"><div :style="{ width: Math.max(4, Math.abs(g.current - g.baseline) / Math.abs(g.target - g.baseline) * 100) + '%', background: 'var(--c-motivation)' }" /></div>
        </div>
      </div>
    </div>
  </div>
</template>
