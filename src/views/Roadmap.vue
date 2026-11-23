<script setup>
import { ref, computed } from 'vue'
import { db, TODAY } from '../store'
import { fmtMonth, money } from '../utils/format'
import PageHead from '../components/PageHead.vue'
import Tag from '../components/Tag.vue'
import EntityChip from '../components/EntityChip.vue'

const START = 2025, END = 2029
const TOTAL = (END - START + 1) * 12
const idx = ym => { const [y, m] = ym.split('-').map(Number); return (y - START) * 12 + (m - 1) }
const pctX = i => Math.max(0, Math.min(100, (i / TOTAL) * 100))
const years = Array.from({ length: END - START + 1 }, (_, i) => START + i)
const todayX = pctX((TODAY.getFullYear() - START) * 12 + TODAY.getMonth() + TODAY.getDate() / 31)

const groupBy = ref('phase')
const phaseOrder = ['Execution', 'Planning', 'Initiation', 'Idea', 'Closing']
const phaseColor = { Execution: '#2563eb', Planning: '#14b8a6', Initiation: '#f59e0b', Idea: '#a78bfa', Closing: '#94a3b8' }
const projects = computed(() => db.projects.slice().sort((a, b) =>
  groupBy.value === 'phase' ? phaseOrder.indexOf(a.phase) - phaseOrder.indexOf(b.phase) || a.start.localeCompare(b.start) : a.start.localeCompare(b.start)))

const onlyChanging = ref(true)
const appRows = computed(() => db.applications
  .filter(a => db.appRoadmap[a.id])
  .filter(a => !onlyChanging.value || new Set(db.appRoadmap[a.id]).size > 1)
  .sort((a, b) => a.name.localeCompare(b.name)))
const stateStyle = {
  Active: { background: '#dcfce7', color: '#166534' },
  Planned: { background: '#dbeafe', color: '#1e40af' },
  'Phase-out': { background: '#fef3c7', color: '#92400e' },
  Retired: { background: '#f1f5f9', color: '#94a3b8' }
}
</script>

<template>
  <PageHead eyebrow="Phase F – Migration Planning" title="Architecture Roadmap" color="var(--c-implementation)"
            subtitle="Projects over time, aligned with the transition architectures (plateaus) they deliver.">
    <div class="seg"><button :class="{ on: groupBy === 'phase' }" @click="groupBy = 'phase'">By phase</button><button :class="{ on: groupBy === 'start' }" @click="groupBy = 'start'">By start date</button></div>
    <router-link to="/projects/new" class="btn primary">+ Plan new project</router-link>
  </PageHead>

  <div class="card">
    <div class="gantt">
      <div class="g-label head">Project</div>
      <div class="g-track head">
        <div v-for="y in years" :key="y" class="g-year" :style="{ left: pctX((y - START) * 12) + '%', width: (100 / years.length) + '%' }">{{ y }}</div>
      </div>

      <div class="g-label plateau-label subtle">Plateaus</div>
      <div class="g-track">
        <div v-for="p in db.plateaus" :key="p.id" class="plateau" :style="{ left: pctX(idx(p.date) + 1) + '%' }" :title="p.description">
          <span>{{ p.name }}</span>
        </div>
      </div>

      <template v-for="p in projects" :key="p.id">
        <div class="g-label">
          <EntityChip type="project" :id="p.id" />
          <div class="subtle" style="margin-top:2px">{{ money(p.budget) }} · <Tag :value="p.phase" /></div>
        </div>
        <div class="g-track">
          <div v-for="y in years" :key="y" class="g-grid" :style="{ left: pctX((y - START) * 12) + '%' }" />
          <div class="g-bar" :style="{ left: pctX(idx(p.start)) + '%', width: (pctX(idx(p.end) + 1) - pctX(idx(p.start))) + '%', background: phaseColor[p.phase], opacity: p.phase === 'Idea' ? 0.6 : 1 }"
               :title="`${p.name}: ${fmtMonth(p.start)} – ${fmtMonth(p.end)}`">
            <span class="dot" :class="{ Green: 'd-green', Amber: 'd-amber', Red: 'd-red' }[p.rag]" style="border:1.5px solid #fff" />
            <span class="g-bar-text">{{ fmtMonth(p.start) }} – {{ fmtMonth(p.end) }}</span>
          </div>
          <div v-for="m in p.milestones" :key="m.name" class="milestone" :style="{ left: pctX(idx(m.date) + 0.5) + '%' }" :title="`${m.name} (${fmtMonth(m.date)})`" />
        </div>
      </template>
      <div class="today" :style="{ left: `calc(240px + (100% - 240px) * ${todayX / 100})` }"><span>Today</span></div>
    </div>
    <div class="legend mt">
      <span v-for="(c, ph) in phaseColor" :key="ph"><i :style="{ background: c }" />{{ ph }}</span>
      <span><i style="background:#0f172a;transform:rotate(45deg);width:8px;height:8px" />Milestone</span>
      <span><span class="dot d-green" /> RAG status</span>
    </div>
  </div>

  <div class="card mt">
    <div class="card-head">
      <div><h2>Application lifecycle across plateaus</h2><p>Baseline → transition architectures → target</p></div>
      <label class="row small"><input v-model="onlyChanging" type="checkbox" /> Only applications that change</label>
    </div>
    <div class="table-wrap">
      <table>
        <thead><tr><th>Application</th><th v-for="p in db.plateaus" :key="p.id">{{ p.name }}<div class="subtle" style="text-transform:none;letter-spacing:0">{{ fmtMonth(p.date) }}</div></th></tr></thead>
        <tbody>
          <tr v-for="a in appRows" :key="a.id">
            <td><EntityChip type="application" :id="a.id" /></td>
            <td v-for="(s, i) in db.appRoadmap[a.id]" :key="i" style="padding:4px">
              <div class="state" :style="stateStyle[s] || { background: 'transparent', color: '#cbd5e1' }">{{ s || '—' }}</div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.gantt { display: grid; grid-template-columns: 240px 1fr; position: relative; }
.g-label { padding: 8px 10px 8px 0; border-bottom: 1px solid #f0f3f7; min-height: 52px; }
.g-label.head, .g-track.head { min-height: 30px; border-bottom: 1px solid var(--border); font-size: 11.5px; text-transform: uppercase; letter-spacing: .05em; color: var(--text-3); font-weight: 600; }
.g-track { position: relative; border-bottom: 1px solid #f0f3f7; min-height: 52px; }
.g-year { position: absolute; top: 8px; text-align: center; border-left: 1px solid var(--border); }
.g-grid { position: absolute; top: 0; bottom: 0; border-left: 1px dashed #eef1f6; }
.g-bar { position: absolute; top: 14px; height: 24px; border-radius: 6px; display: flex; align-items: center; gap: 6px; padding: 0 8px; color: #fff; font-size: 11.5px; overflow: hidden; white-space: nowrap; box-shadow: 0 1px 2px rgba(0,0,0,.1); }
.g-bar-text { overflow: hidden; text-overflow: ellipsis; }
.milestone { position: absolute; top: 40px; width: 9px; height: 9px; background: #0f172a; transform: translateX(-50%) rotate(45deg); }
.plateau-label { min-height: 40px; display: flex; align-items: center; }
.plateau { position: absolute; top: 6px; transform: translateX(-100%); border-right: 3px solid var(--c-implementation); padding: 2px 8px; font-size: 11.5px; font-weight: 600; color: #be185d; background: #fdf2f8; border-radius: 4px 0 0 4px; white-space: nowrap; }
.today { position: absolute; top: 0; bottom: 0; border-left: 2px solid #ef4444; pointer-events: none; }
.today span { position: absolute; top: -2px; left: 4px; font-size: 10.5px; font-weight: 700; color: #ef4444; background: #fff; padding: 0 3px; }
.state { text-align: center; padding: 5px 8px; border-radius: 6px; font-size: 12px; font-weight: 600; }
</style>
