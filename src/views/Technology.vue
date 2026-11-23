<script setup>
import { ref, computed } from 'vue'
import { db, appsForTech, monthsUntil, nameOf } from '../store'
import { Plus } from 'lucide-vue-next'
import Drawer from '../components/Drawer.vue'
import EntityEditor from '../components/EntityEditor.vue'
import { radarColor, fmtMonth } from '../utils/format'
import PageHead from '../components/PageHead.vue'
import Tag from '../components/Tag.vue'
import EntityChip from '../components/EntityChip.vue'

const tab = ref('radar')
const quadrants = ['Languages & Frameworks', 'Platforms & Infrastructure', 'Data & Integration', 'Tools & Practices']
const rings = [
  { id: 'Adopt', from: 0, to: 0.42 },
  { id: 'Trial', from: 0.42, to: 0.64 },
  { id: 'Assess', from: 0.64, to: 0.83 },
  { id: 'Hold', from: 0.83, to: 1 }
]
const C = 300, R = 280
const hover = ref(null)

const blips = computed(() => {
  const out = []
  let n = 1
  quadrants.forEach((q, qi) => {
    rings.forEach(ring => {
      const items = db.technologies.filter(t => t.category === q && t.radar === ring.id)
      items.forEach((t, j) => {
        const ang = (qi * 90 + ((j + 1) * 90) / (items.length + 1) - 180) * Math.PI / 180
        const rr = R * (ring.from + (ring.to - ring.from) * (j % 2 ? 0.35 : 0.65))
        out.push({ ...t, n: n++, x: C + Math.cos(ang) * rr, y: C + Math.sin(ang) * rr, qi })
      })
    })
  })
  return out
})
const quadLabelPos = [{ x: 12, y: 18, a: 'start' }, { x: 588, y: 18, a: 'end' }, { x: 588, y: 592, a: 'end' }, { x: 12, y: 592, a: 'start' }]

const lifecycle = computed(() => db.technologies
  .map(t => ({ ...t, months: monthsUntil(t.eol), apps: appsForTech(t.id) }))
  .sort((a, b) => (a.months ?? 999) - (b.months ?? 999)))
// editing
const editor = ref(null) // { id: string | null, startMode }
const toast = ref('')
function onDone (r) {
  editor.value = null
  toast.value = `${r.name} ${r.action}${r.replacedBy ? ` – links moved to ${r.replacedBy}` : ''}`
  setTimeout(() => (toast.value = ''), 2800)
}
const status = m => (m == null ? { v: 'No EOL', t: 'grey' } : m < 0 ? { v: 'Expired', t: 'red' } : m <= 12 ? { v: `${m} months`, t: 'amber' } : { v: `${m} months`, t: 'green' })
</script>

<template>
  <PageHead eyebrow="Phase D – Technology Architecture" title="Technology Standards" color="var(--c-technology)"
            subtitle="Technology radar (Adopt / Trial / Assess / Hold) and lifecycle risk of the technologies the application landscape depends on.">
    <button class="btn primary" @click="editor = { id: null }"><Plus :size="15" />New technology</button>
    <div class="seg"><button :class="{ on: tab === 'radar' }" @click="tab = 'radar'">Tech radar</button><button :class="{ on: tab === 'lifecycle' }" @click="tab = 'lifecycle'">Lifecycle & EOL</button></div>
  </PageHead>

  <div v-if="tab === 'radar'" class="grid g-3">
    <div class="card span-2">
      <svg viewBox="0 0 600 600" width="100%" style="max-width:680px;display:block;margin:auto">
        <circle v-for="r in rings.slice().reverse()" :key="r.id" :cx="C" :cy="C" :r="R * r.to" :fill="{ Adopt: '#f0fdf4', Trial: '#eff6ff', Assess: '#fffbeb', Hold: '#fef2f2' }[r.id]" stroke="#e2e8f0" />
        <line :x1="C - R" :x2="C + R" :y1="C" :y2="C" stroke="#cbd5e1" />
        <line :x1="C" :x2="C" :y1="C - R" :y2="C + R" stroke="#cbd5e1" />
        <text v-for="r in rings" :key="r.id + 't'" :x="C + 4" :y="C - R * r.to + 14" font-size="11" font-weight="700" :fill="radarColor[r.id]">{{ r.id.toUpperCase() }}</text>
        <text v-for="(q, i) in quadrants" :key="q" :x="quadLabelPos[i].x" :y="quadLabelPos[i].y" :text-anchor="quadLabelPos[i].a" font-size="13" font-weight="700" fill="#334155">{{ q }}</text>
        <g v-for="b in blips" :key="b.id" style="cursor:pointer" @mouseenter="hover = b" @mouseleave="hover = null" @click="editor = { id: b.id }">
          <circle :cx="b.x" :cy="b.y" r="10" :fill="radarColor[b.radar]" :stroke="hover?.id === b.id ? '#0f172a' : '#fff'" stroke-width="2" />
          <text :x="b.x" :y="b.y + 4" text-anchor="middle" font-size="10" font-weight="700" fill="#fff">{{ b.n }}</text>
        </g>
        <g v-if="hover">
          <rect :x="Math.min(400, hover.x + 12)" :y="hover.y - 34" width="190" height="42" rx="6" fill="#0f172a" />
          <text :x="Math.min(400, hover.x + 12) + 10" :y="hover.y - 16" fill="#fff" font-size="12" font-weight="600">{{ hover.name }}</text>
          <text :x="Math.min(400, hover.x + 12) + 10" :y="hover.y" fill="#cbd5e1" font-size="11">{{ hover.radar }} · used by {{ appsForTech(hover.id).length }} app(s)</text>
        </g>
      </svg>
    </div>
    <div class="card">
      <div v-for="(q, qi) in quadrants" :key="q" style="margin-bottom:16px">
        <h3 style="margin-bottom:6px">{{ q }}</h3>
        <div v-for="b in blips.filter(x => x.qi === qi)" :key="b.id" class="row small radar-item" style="padding:2px 0;flex-wrap:nowrap" @mouseenter="hover = b" @mouseleave="hover = null" @click="editor = { id: b.id }">
          <span class="dot" :style="{ background: radarColor[b.radar], width: '18px', height: '18px', color: '#fff', fontSize: '10px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }">{{ b.n }}</span>
          <span :class="{ strong: hover?.id === b.id }">{{ b.name }}</span>
        </div>
      </div>
    </div>
  </div>

  <div v-else class="card">
    <div class="card-head"><div><h2>Technology lifecycle</h2><p>Vendor end-of-support dates and dependent applications</p></div></div>
    <div class="table-wrap">
      <table>
        <thead><tr><th>Technology</th><th>Category</th><th>Vendor</th><th>Radar</th><th>End of support</th><th>Remaining</th><th>Dependent applications</th></tr></thead>
        <tbody>
          <tr v-for="t in lifecycle" :key="t.id" class="clickable" title="Click to edit" @click="editor = { id: t.id }">
            <td class="strong">{{ t.name }}</td>
            <td class="muted small">{{ t.category }}</td>
            <td class="muted">{{ t.vendor }}</td>
            <td><Tag :value="t.radar" /></td>
            <td class="nowrap">{{ fmtMonth(t.eol) }}</td>
            <td><Tag :value="status(t.months).v" :t="status(t.months).t" /></td>
            <td @click.stop><div class="row"><EntityChip v-for="a in t.apps" :key="a.id" type="application" :id="a.id" /></div><span v-if="!t.apps.length" class="subtle">–</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <Drawer :open="!!editor" :title="editor?.id ? `Edit ${nameOf('technology', editor.id)}` : 'New technology'" :subtitle="editor?.id ? `Technology ${editor.id}` : 'Technology'" @close="editor = null">
    <EntityEditor v-if="editor" :key="String(editor.id)" type="technology" :id="editor.id" @done="onDone" @cancel="editor = null" />
    <router-link v-if="editor?.id" :to="{ name: 'explorer', query: { type: 'technology', id: editor.id } }" class="btn mt">Open in Impact Explorer →</router-link>
  </Drawer>
  <Transition name="fade"><div v-if="toast" class="toast">{{ toast }}</div></Transition>
</template>

<style scoped>
.radar-item { cursor: pointer; border-radius: 6px; }
.radar-item:hover { background: var(--surface-2); }
</style>
