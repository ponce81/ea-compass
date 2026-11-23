<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { db, get, related, typeLabels } from '../store'
import { money } from '../utils/format'
import PageHead from '../components/PageHead.vue'
import Tag from '../components/Tag.vue'

const route = useRoute()
const router = useRouter()
const type = computed(() => route.query.type || 'application')
const id = computed(() => route.query.id || db[{ capability: 'capabilities', application: 'applications', data: 'dataObjects', technology: 'technologies', project: 'projects', investment: 'investments', goal: 'goals' }[type.value]]?.[0]?.id)
const entity = computed(() => get(type.value, id.value))
const groups = computed(() => related(type.value, id.value).filter(g => g.ids.length))

const colors = { capability: '#e0a100', application: '#3b82f6', data: '#0d9488', technology: '#16a34a', project: '#ec4899', investment: '#ec4899', goal: '#8b5cf6' }
const collections = { capability: 'capabilities', application: 'applications', data: 'dataObjects', technology: 'technologies', project: 'projects', investment: 'investments', goal: 'goals' }
const options = computed(() => db[collections[type.value]] || [])

function pick (t, i) { router.push({ name: 'explorer', query: { type: t, id: i } }) }
function setType (t) { pick(t, db[collections[t]][0].id) }

// Facts shown on the focus card
const facts = computed(() => {
  const e = entity.value
  if (!e) return []
  switch (type.value) {
    case 'application': return [['Lifecycle', e.lifecycle, true], ['TIME', e.time, true], ['Cost / yr', money(e.annualCost)], ['Owner', e.owner]]
    case 'capability': return e.level === 2 ? [['Maturity', `${e.maturity} → ${e.targetMaturity}`], ['Importance', e.importance, true], ['Owner', e.owner]] : [['Owner', e.owner]]
    case 'data': return [['Classification', e.classification, true], ['Owner', e.owner], ['Quality', e.quality + '%']]
    case 'technology': return [['Radar', e.radar, true], ['Vendor', e.vendor], ['End of support', e.eol || '–']]
    case 'project': return [['Phase', e.phase, true], ['RAG', e.rag, true], ['Budget', money(e.budget)]]
    case 'investment': return [['Category', e.category, true], ['Status', e.status, true]]
    case 'goal': return [['KPI', e.kpi], ['Target', `${e.target}${e.unit}`]]
  }
  return []
})

// Grouped column layout: focus element in the centre, relationship groups
// balanced across four columns (two on each side).
const W = 900, ROW = 32, HEAD = 26
const COLS = [95, 270, 630, 805]
const layout = computed(() => {
  const load = [0, 0, 0, 0]
  const cols = [[], [], [], []]
  for (const g of groups.value.slice().sort((a, b) => b.ids.length - a.ids.length)) {
    const k = load.indexOf(Math.min(...load))
    cols[k].push(g)
    load[k] += HEAD + g.ids.length * ROW
  }
  const H = Math.max(360, Math.max(...load) + 40)
  const nodes = [], heads = []
  cols.forEach((gs, k) => {
    let y = (H - load[k]) / 2
    for (const g of gs) {
      heads.push({ x: COLS[k], y: y + 14, label: g.label, type: g.type })
      y += HEAD
      for (const i of g.ids) {
        nodes.push({ type: g.type, id: i, group: g.label, x: COLS[k], y: y + ROW / 2 - 2, side: k < 2 ? -1 : 1, name: get(g.type, i)?.name || i })
        y += ROW
      }
    }
  })
  return { H, nodes, heads }
})
const CX = W / 2
const edge = n => {
  const cy = layout.value.H / 2
  const sx = CX + n.side * 80
  const ex = n.x - n.side * 80
  const mx = (sx + ex) / 2
  return `M ${sx} ${cy} C ${mx} ${cy}, ${mx} ${n.y}, ${ex} ${n.y}`
}
</script>

<template>
  <PageHead eyebrow="Cross-domain traceability" title="Impact Explorer"
            subtitle="Select any architecture element to see everything connected to it – across business, application, data, technology and the change portfolio.">
    <select :value="type" @change="setType($event.target.value)">
      <option v-for="(l, t) in typeLabels" :key="t" :value="t">{{ l }}</option>
    </select>
    <select :value="id" style="min-width:240px" @change="pick(type, $event.target.value)">
      <option v-for="o in options" :key="o.id" :value="o.id">{{ o.name }}</option>
    </select>
  </PageHead>

  <div v-if="entity" class="grid g-3">
    <div class="card span-2" style="padding:8px">
      <svg :viewBox="`0 0 ${W} ${layout.H}`" width="100%" style="display:block">
        <path v-for="n in layout.nodes" :key="'l' + n.type + n.id + n.group" :d="edge(n)" fill="none" :stroke="colors[n.type]" stroke-opacity=".35" stroke-width="1.5" />
        <text v-for="h in layout.heads" :key="h.label" :x="h.x - 80" :y="h.y" font-size="10.5" font-weight="700" letter-spacing=".04em" :fill="colors[h.type]">{{ h.label.toUpperCase() }}</text>
        <g v-for="n in layout.nodes" :key="n.type + n.id + n.group" style="cursor:pointer" @click="pick(n.type, n.id)">
          <rect :x="n.x - 80" :y="n.y - 13" width="160" height="26" rx="6" fill="#fff" :stroke="colors[n.type]" stroke-width="1.2" />
          <rect :x="n.x - 80" :y="n.y - 13" width="5" height="26" rx="2" :fill="colors[n.type]" />
          <text :x="n.x + 3" :y="n.y + 4" text-anchor="middle" font-size="11" fill="#0f172a">{{ n.name.length > 25 ? n.name.slice(0, 24) + '…' : n.name }}</text>
        </g>
        <g>
          <rect :x="CX - 80" :y="layout.H / 2 - 32" width="160" height="64" rx="12" :fill="colors[type]" />
          <text :x="CX" :y="layout.H / 2 - 8" text-anchor="middle" font-size="10" fill="#fff" opacity=".85">{{ typeLabels[type].toUpperCase() }}</text>
          <text :x="CX" :y="layout.H / 2 + 12" text-anchor="middle" font-size="13" font-weight="700" fill="#fff">{{ entity.name.length > 20 ? entity.name.slice(0, 19) + '…' : entity.name }}</text>
        </g>
      </svg>
      <div class="legend" style="padding:0 10px 8px">
        <span v-for="(c, t) in colors" :key="t"><i :style="{ background: c }" />{{ typeLabels[t] }}</span>
      </div>
    </div>
    <div class="card">
      <div class="subtle">{{ typeLabels[type] }} · {{ entity.id }}</div>
      <h2 style="font-size:18px;margin:2px 0 10px">{{ entity.name }}</h2>
      <p v-if="entity.description" class="muted small" style="margin-bottom:10px">{{ entity.description }}</p>
      <dl class="kv">
        <template v-for="[k, v, tag] in facts" :key="k"><dt>{{ k }}</dt><dd><Tag v-if="tag" :value="v" /><template v-else>{{ v }}</template></dd></template>
      </dl>
      <div v-for="g in groups" :key="g.label" class="mt">
        <h4 class="subtle" style="text-transform:uppercase;letter-spacing:.05em;margin-bottom:6px">{{ g.label }} ({{ g.ids.length }})</h4>
        <div class="row">
          <button v-for="i in g.ids" :key="i" class="chip" @click="pick(g.type, i)"><span class="bar" :style="{ background: colors[g.type] }" />{{ get(g.type, i)?.name }}</button>
        </div>
      </div>
      <div v-if="!groups.length" class="empty mt">No relationships recorded.</div>
    </div>
  </div>
  <div v-else class="card empty">Element not found.</div>
</template>
