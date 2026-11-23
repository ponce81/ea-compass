<script setup>
import { ref, computed } from 'vue'
import { db, get, dataForApp, techForApp, interfacesForApp, projectsForApp, holdTechCount, nameOf } from '../store'
import { money, timeColor } from '../utils/format'
import PageHead from '../components/PageHead.vue'
import Drawer from '../components/Drawer.vue'
import Tag from '../components/Tag.vue'
import EntityChip from '../components/EntityChip.vue'
import EntityEditor from '../components/EntityEditor.vue'
import { Plus, Pencil, Trash2 } from 'lucide-vue-next'

const tab = ref('inventory')
const q = ref('')
const fLifecycle = ref('')
const fTime = ref('')
const sortKey = ref('name')
const sortDir = ref(1)
function sortBy (k) { sortDir.value = sortKey.value === k ? -sortDir.value : 1; sortKey.value = k }

const rows = computed(() => db.applications
  .filter(a => !q.value || (a.name + a.vendor + a.owner).toLowerCase().includes(q.value.toLowerCase()))
  .filter(a => !fLifecycle.value || a.lifecycle === fLifecycle.value)
  .filter(a => !fTime.value || a.time === fTime.value)
  .slice()
  .sort((a, b) => (a[sortKey.value] > b[sortKey.value] ? 1 : -1) * sortDir.value))
const totalCost = computed(() => rows.value.reduce((s, a) => s + a.annualCost, 0))

// --- portfolio matrix
const matrixApps = computed(() => db.applications.filter(a => a.lifecycle !== 'Retired'))
const maxCost = computed(() => Math.max(...matrixApps.value.map(a => a.annualCost)))
const S = 520, PAD = 40
function pos (a, i) {
  const jx = ((i * 37) % 11 - 5) * 4.5
  const jy = ((i * 53) % 13 - 6) * 4
  return {
    x: PAD + ((a.technicalFit - 0.5) / 5) * (S - 2 * PAD) + jx,
    y: S - PAD - ((a.businessFit - 0.5) / 5) * (S - 2 * PAD) + jy,
    r: 6 + Math.sqrt(a.annualCost / maxCost.value) * 18
  }
}
const hoverApp = ref(null)

// --- drawer
const selected = ref(null)
const sel = computed(() => selected.value && get('application', selected.value))

// editing: { type: 'application' | 'interface', id: string | null, startMode }
const editor = ref(null)
const toast = ref('')
function notify (m) { toast.value = m; setTimeout(() => (toast.value = ''), 2800) }
const closeDrawer = () => { selected.value = null; editor.value = null }
function onDone (r) {
  editor.value = null
  if (r.action === 'deleted' && selected.value === r.id) selected.value = null
  if (r.action === 'created' && !r.id.startsWith('F')) selected.value = r.id
  notify(`${r.name} ${r.action}${r.replacedBy ? ` – links moved to ${r.replacedBy}` : ''}`)
}
const drawerTitle = computed(() => {
  const e = editor.value
  if (!e) return sel.value?.name
  if (e.type === 'interface') return e.id ? `Interface ${e.id}` : 'New interface'
  if (!e.id) return 'New application'
  return `${e.startMode === 'delete' ? 'Delete' : 'Edit'} ${nameOf('application', e.id)}`
})
const plateauNames = computed(() => db.plateaus.map(p => p.name))
</script>

<template>
  <PageHead eyebrow="Phase C – Information Systems Architecture" title="Application Portfolio" color="var(--c-application)"
            subtitle="Inventory, rationalization (TIME) and integration landscape of all applications.">
    <button v-if="tab === 'interfaces'" class="btn primary" @click="selected = null; editor = { type: 'interface', id: null }"><Plus :size="15" />New interface</button>
    <button v-else class="btn primary" @click="selected = null; editor = { type: 'application', id: null }"><Plus :size="15" />New application</button>
    <div class="seg">
      <button :class="{ on: tab === 'inventory' }" @click="tab = 'inventory'">Inventory</button>
      <button :class="{ on: tab === 'matrix' }" @click="tab = 'matrix'">Portfolio matrix</button>
      <button :class="{ on: tab === 'interfaces' }" @click="tab = 'interfaces'">Interfaces</button>
    </div>
  </PageHead>

  <div v-if="tab === 'inventory'" class="card">
    <div class="row" style="margin-bottom:12px">
      <input v-model="q" type="text" placeholder="Filter by name, vendor, owner…" style="width:260px" />
      <select v-model="fLifecycle"><option value="">All lifecycles</option><option v-for="l in ['Plan','Active','Phase-out','Retired']" :key="l">{{ l }}</option></select>
      <select v-model="fTime"><option value="">All TIME</option><option v-for="t in ['Invest','Tolerate','Migrate','Eliminate']" :key="t">{{ t }}</option></select>
      <span class="subtle" style="margin-left:auto">{{ rows.length }} applications · {{ money(totalCost) }} / yr</span>
    </div>
    <div class="table-wrap">
      <table>
        <thead><tr>
          <th class="sortable" @click="sortBy('name')">Application</th>
          <th class="sortable" @click="sortBy('vendor')">Vendor</th>
          <th>Type</th><th>Hosting</th>
          <th class="sortable" @click="sortBy('lifecycle')">Lifecycle</th>
          <th class="sortable" @click="sortBy('time')">TIME</th>
          <th class="sortable" @click="sortBy('criticality')">Criticality</th>
          <th class="sortable right" @click="sortBy('businessFit')">Bus. fit</th>
          <th class="sortable right" @click="sortBy('technicalFit')">Tech. fit</th>
          <th class="sortable right" @click="sortBy('annualCost')">Cost / yr</th>
          <th>Tech debt</th>
        </tr></thead>
        <tbody>
          <tr v-for="a in rows" :key="a.id" class="clickable" @click="selected = a.id">
            <td><div class="strong">{{ a.name }}</div><div class="subtle">{{ a.owner }}</div></td>
            <td class="muted">{{ a.vendor }}</td>
            <td><Tag :value="a.type" /></td>
            <td class="muted">{{ a.hosting }}</td>
            <td><Tag :value="a.lifecycle" /></td>
            <td><Tag :value="a.time" /></td>
            <td><Tag :value="a.criticality" /></td>
            <td class="right">{{ a.businessFit }}</td>
            <td class="right">{{ a.technicalFit }}</td>
            <td class="right nowrap">{{ money(a.annualCost) }}<span v-if="a.estimatedCost" class="subtle"> (est.)</span></td>
            <td><Tag v-if="holdTechCount(a)" :value="`${holdTechCount(a)} Hold`" t="red" /><span v-else class="subtle">–</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <div v-else-if="tab === 'matrix'" class="grid g-3">
    <div class="card span-2">
      <div class="card-head"><div><h2>Business fit vs. technical fit</h2><p>Bubble size = annual cost · colour = TIME decision</p></div></div>
      <svg :viewBox="`0 0 ${S} ${S}`" width="100%" style="max-width:640px;display:block;margin:auto">
        <rect :x="PAD" :y="PAD" :width="(S - 2 * PAD) / 2" :height="(S - 2 * PAD) / 2" fill="#fffbeb" />
        <rect :x="S / 2" :y="PAD" :width="(S - 2 * PAD) / 2" :height="(S - 2 * PAD) / 2" fill="#f0fdf4" />
        <rect :x="PAD" :y="S / 2" :width="(S - 2 * PAD) / 2" :height="(S - 2 * PAD) / 2" fill="#fef2f2" />
        <rect :x="S / 2" :y="S / 2" :width="(S - 2 * PAD) / 2" :height="(S - 2 * PAD) / 2" fill="#eff6ff" />
        <text :x="PAD + 8" :y="PAD + 18" font-size="13" font-weight="700" fill="#b45309">MIGRATE</text>
        <text :x="S - PAD - 8" :y="PAD + 18" font-size="13" font-weight="700" fill="#15803d" text-anchor="end">INVEST</text>
        <text :x="PAD + 8" :y="S - PAD - 8" font-size="13" font-weight="700" fill="#b91c1c">ELIMINATE</text>
        <text :x="S - PAD - 8" :y="S - PAD - 8" font-size="13" font-weight="700" fill="#1d4ed8" text-anchor="end">TOLERATE</text>
        <text :x="S / 2" :y="S - 10" text-anchor="middle" font-size="12" fill="#64748b">Technical fit →</text>
        <text :x="14" :y="S / 2" text-anchor="middle" font-size="12" fill="#64748b" :transform="`rotate(-90 14 ${S / 2})`">Business fit →</text>
        <g v-for="(a, i) in matrixApps" :key="a.id" style="cursor:pointer" @click="selected = a.id" @mouseenter="hoverApp = a" @mouseleave="hoverApp = null">
          <circle :cx="pos(a, i).x" :cy="pos(a, i).y" :r="pos(a, i).r" :fill="timeColor[a.time]" fill-opacity=".72" stroke="#fff" stroke-width="1.5"
                  :stroke-dasharray="a.lifecycle === 'Plan' ? '3 2' : null" />
        </g>
        <g v-if="hoverApp">
          <rect :x="Math.min(S - 200, pos(hoverApp, matrixApps.indexOf(hoverApp)).x + 10)" :y="pos(hoverApp, matrixApps.indexOf(hoverApp)).y - 30" width="190" height="40" rx="6" fill="#0f172a" />
          <text :x="Math.min(S - 200, pos(hoverApp, matrixApps.indexOf(hoverApp)).x + 10) + 10" :y="pos(hoverApp, matrixApps.indexOf(hoverApp)).y - 13" fill="#fff" font-size="12" font-weight="600">{{ hoverApp.name }}</text>
          <text :x="Math.min(S - 200, pos(hoverApp, matrixApps.indexOf(hoverApp)).x + 10) + 10" :y="pos(hoverApp, matrixApps.indexOf(hoverApp)).y + 2" fill="#cbd5e1" font-size="11">{{ hoverApp.time }} · {{ money(hoverApp.annualCost) }}</text>
        </g>
      </svg>
    </div>
    <div class="card">
      <div class="card-head"><div><h2>Rationalization summary</h2><p>Run cost per TIME decision</p></div></div>
      <div class="stack" style="gap:14px">
        <div v-for="t in ['Invest', 'Tolerate', 'Migrate', 'Eliminate']" :key="t">
          <div class="row between"><Tag :value="t" /><span class="strong">{{ money(matrixApps.filter(a => a.time === t && a.lifecycle !== 'Plan').reduce((s, a) => s + a.annualCost, 0)) }}</span></div>
          <div class="subtle" style="margin-top:4px">{{ matrixApps.filter(a => a.time === t).map(a => a.name).join(' · ') }}</div>
        </div>
      </div>
      <div class="alert info mt small">Dashed bubbles are planned applications (estimated cost).</div>
    </div>
  </div>

  <div v-else class="card">
    <div class="card-head"><div><h2>Interface catalog</h2><p>{{ db.interfaces.length }} interfaces · {{ db.interfaces.filter(i => i.via === 'A16').length }} still via MuleSoft (Hold)</p></div></div>
    <div class="table-wrap">
      <table>
        <thead><tr><th>ID</th><th>Source</th><th></th><th>Target</th><th>Via</th><th>Data</th><th>Protocol</th><th>Frequency</th></tr></thead>
        <tbody>
          <tr v-for="f in db.interfaces" :key="f.id" class="clickable" title="Click to edit" @click="selected = null; editor = { type: 'interface', id: f.id }">
            <td class="subtle">{{ f.id }}</td>
            <td><EntityChip type="application" :id="f.from" /></td>
            <td class="subtle">→</td>
            <td><EntityChip type="application" :id="f.to" /></td>
            <td><Tag v-if="f.via" :value="nameOf('application', f.via)" :t="f.via === 'A16' ? 'amber' : 'blue'" /><span v-else class="subtle">point-to-point</span></td>
            <td><div class="row"><EntityChip v-for="d in f.dataIds" :key="d" type="data" :id="d" /></div></td>
            <td class="muted">{{ f.protocol }}</td>
            <td class="muted">{{ f.frequency }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <Drawer :open="!!sel || !!editor" :title="drawerTitle" :subtitle="editor ? (editor.type === 'interface' ? 'Integration' : 'Application') : sel ? `${sel.id} · ${sel.vendor} · ${sel.type}` : ''" @close="closeDrawer">
    <template #tags><template v-if="sel && !editor"><Tag :value="sel.lifecycle" /><Tag :value="sel.time" /><Tag :value="sel.criticality" /></template></template>
    <EntityEditor v-if="editor" :key="`${editor.type}-${editor.id}-${editor.startMode}`" :type="editor.type" :id="editor.id" :start-mode="editor.startMode || 'form'" :preset="editor.preset || {}"
                  @done="onDone" @cancel="editor = null" />
    <template v-else-if="sel">
      <div class="row" style="margin-bottom:16px">
        <button class="btn" @click="editor = { type: 'application', id: sel.id }"><Pencil :size="14" />Edit</button>
        <button class="btn" :title="`New interface from ${sel.name}`" @click="editor = { type: 'interface', id: null, preset: { from: sel.id } }"><Plus :size="14" />Interface</button>
        <button class="btn danger" style="margin-left:auto" @click="editor = { type: 'application', id: sel.id, startMode: 'delete' }"><Trash2 :size="14" />Delete</button>
      </div>
      <div class="drawer-section">
        <p class="muted">{{ sel.description }}</p>
        <dl class="kv mt">
          <dt>Business owner</dt><dd>{{ sel.owner }}</dd>
          <dt>Hosting</dt><dd>{{ sel.hosting }}</dd>
          <dt>Go-live</dt><dd>{{ sel.goLive }}</dd>
          <dt>Users</dt><dd>{{ sel.users.toLocaleString() }}</dd>
          <dt>Annual cost</dt><dd>{{ money(sel.annualCost, { short: false }) }}{{ sel.estimatedCost ? ' (estimate)' : '' }}</dd>
          <dt>Business / tech fit</dt><dd>{{ sel.businessFit }} / 5 · {{ sel.technicalFit }} / 5</dd>
        </dl>
      </div>
      <div class="drawer-section"><h4>Roadmap</h4>
        <div class="row"><span v-for="(p, i) in plateauNames" :key="p" class="small">{{ p }}: <Tag :value="db.appRoadmap[sel.id]?.[i] || '—'" /></span></div>
      </div>
      <div class="drawer-section"><h4>Capabilities</h4><div class="row"><EntityChip v-for="c in sel.capabilityIds" :key="c" type="capability" :id="c" /></div></div>
      <div class="drawer-section"><h4>Data objects (CRUD)</h4>
        <div class="row"><EntityChip v-for="d in dataForApp(sel.id)" :key="d.id" type="data" :id="d.id"><span class="subtle">{{ d.crud[sel.id] }}</span></EntityChip></div>
        <div v-if="!dataForApp(sel.id).length" class="empty">None recorded.</div>
      </div>
      <div class="drawer-section"><h4>Technology stack</h4>
        <div class="row"><EntityChip v-for="t in techForApp(sel)" :key="t.id" type="technology" :id="t.id"><Tag :value="t.radar" /></EntityChip></div>
        <div v-if="!techForApp(sel).length" class="empty">SaaS – managed by vendor.</div>
      </div>
      <div class="drawer-section"><h4>Interfaces ({{ interfacesForApp(sel.id).length }})</h4>
        <div class="stack small">
          <div v-for="f in interfacesForApp(sel.id)" :key="f.id">{{ nameOf('application', f.from) }} → {{ nameOf('application', f.to) }} <span class="subtle">· {{ f.protocol }}{{ f.via ? ' via ' + nameOf('application', f.via) : '' }}</span></div>
        </div>
      </div>
      <div class="drawer-section"><h4>Projects</h4>
        <div class="stack"><div v-for="p in projectsForApp(sel.id)" :key="p.id" class="row between"><EntityChip type="project" :id="p.id" /><Tag :value="p.impacts.find(i => i.appId === sel.id).change" /></div></div>
        <div v-if="!projectsForApp(sel.id).length" class="empty">No projects impact this application.</div>
      </div>
      <router-link :to="{ name: 'explorer', query: { type: 'application', id: sel.id } }" class="btn">Open in Impact Explorer →</router-link>
    </template>
  </Drawer>
  <Transition name="fade"><div v-if="toast" class="toast">{{ toast }}</div></Transition>
</template>

<style scoped>
.btn.danger { color: #b91c1c; }
.btn.danger:hover { border-color: #fca5a5; background: #fef2f2; }
</style>
