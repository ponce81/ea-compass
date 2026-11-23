<script setup>
import { ref, reactive, computed } from 'vue'
import { Pencil, Plus, Trash2, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, AlertTriangle, Check } from 'lucide-vue-next'
import {
  db, l1Caps, childrenOf, appsForCap, capInvestment, projectsForCap, get,
  addCapability, updateCapability, moveCapability, deleteCapability, capabilityUsage, validateCapability
} from '../store'
import { money } from '../utils/format'
import PageHead from '../components/PageHead.vue'
import Drawer from '../components/Drawer.vue'
import Tag from '../components/Tag.vue'
import EntityChip from '../components/EntityChip.vue'

const tab = ref('map')
const lens = ref('gap')
const lenses = [
  { id: 'maturity', label: 'Maturity' },
  { id: 'gap', label: 'Maturity gap' },
  { id: 'importance', label: 'Strategic importance' },
  { id: 'coverage', label: 'App coverage' },
  { id: 'investment', label: 'Investment' }
]
const maxInv = computed(() => Math.max(1, ...db.capabilities.filter(c => c.level === 2).map(c => capInvestment(c.id))))

function heat (c) {
  const apps = appsForCap(c.id, { activeOnly: true }).length
  switch (lens.value) {
    case 'maturity': return { bg: ['#fee2e2', '#fde2c4', '#fef3c7', '#dcfce7', '#bbf7d0'][c.maturity - 1], label: `Maturity ${c.maturity}/5` }
    case 'gap': { const g = Math.max(0, c.targetMaturity - c.maturity); return { bg: ['#dcfce7', '#fef9c3', '#fed7aa', '#fecaca'][Math.min(3, g)], label: g ? `Gap +${g} (${c.maturity}→${c.targetMaturity})` : 'No gap' } }
    case 'importance': return { bg: { High: '#e9d5ff', Medium: '#f3e8ff', Low: '#faf5ff' }[c.importance], label: `${c.importance} importance` }
    case 'coverage': return { bg: apps === 0 ? '#fecaca' : apps === 1 ? '#dcfce7' : apps === 2 ? '#dbeafe' : '#fed7aa', label: apps === 0 ? 'No IT support' : apps > 2 ? `${apps} apps – redundancy?` : `${apps} app(s)` }
    case 'investment': { const v = capInvestment(c.id); const f = v / maxInv.value; return { bg: `rgba(37, 99, 235, ${0.06 + f * 0.5})`, label: v ? money(v) : 'No investment' } }
  }
}
const legend = computed(() => ({
  maturity: [['#fee2e2', '1 Initial'], ['#fde2c4', '2'], ['#fef3c7', '3 Defined'], ['#dcfce7', '4'], ['#bbf7d0', '5 Optimized']],
  gap: [['#dcfce7', 'No gap'], ['#fef9c3', '+1'], ['#fed7aa', '+2'], ['#fecaca', '+3 or more']],
  importance: [['#e9d5ff', 'High'], ['#f3e8ff', 'Medium'], ['#faf5ff', 'Low']],
  coverage: [['#fecaca', 'None'], ['#dcfce7', '1 app'], ['#dbeafe', '2 apps'], ['#fed7aa', '3+ apps (redundancy)']],
  investment: [['rgba(37,99,235,.08)', 'Low'], ['rgba(37,99,235,.3)', 'Medium'], ['rgba(37,99,235,.56)', 'High']]
})[lens.value])

// ---------------------------------------------------------------- drawer
const editMode = ref(false)
const selected = ref(null)
const mode = ref('view') // view | edit | create | delete
const sel = computed(() => selected.value && get('capability', selected.value))
const selApps = computed(() => sel.value ? appsForCap(sel.value.id) : [])
const selProjects = computed(() => sel.value ? projectsForCap(sel.value.id) : [])
const selStreams = computed(() => sel.value ? db.valueStreams.filter(v => v.stages.some(s => s.capabilityIds.includes(sel.value.id))) : [])
const drawerOpen = computed(() => !!sel.value || mode.value === 'create')
const toast = ref('')
function notify (m) { toast.value = m; setTimeout(() => (toast.value = ''), 2500) }

function open (id) { selected.value = id; mode.value = 'view'; error.value = '' }
function close () { selected.value = null; mode.value = 'view'; error.value = '' }

// form (create & edit)
const form = reactive({ level: 2, parentId: null, name: '', owner: '', description: '', maturity: 2, targetMaturity: 3, importance: 'Medium' })
const error = ref('')
function startCreate (level, parentId = null) {
  Object.assign(form, { level, parentId, name: '', owner: '', description: '', maturity: 2, targetMaturity: 3, importance: 'Medium' })
  selected.value = null; error.value = ''; mode.value = 'create'
}
function startEdit () {
  const c = sel.value
  Object.assign(form, { level: c.level, parentId: c.parentId, name: c.name, owner: c.owner || '', description: c.description || '', maturity: c.maturity ?? 2, targetMaturity: c.targetMaturity ?? 3, importance: c.importance || 'Medium' })
  error.value = ''; mode.value = 'edit'
}
const formPayload = () => form.level === 1
  ? { level: 1, name: form.name, owner: form.owner }
  : { level: 2, parentId: form.parentId, name: form.name, owner: form.owner, description: form.description, maturity: form.maturity, targetMaturity: form.targetMaturity, importance: form.importance }
const liveError = computed(() => (form.name.trim() ? validateCapability({ ...formPayload(), name: form.name }, mode.value === 'edit' ? selected.value : null) : null))
function save () {
  try {
    if (mode.value === 'create') {
      const id = addCapability(formPayload())
      open(id)
      notify(`${form.level === 1 ? 'Domain' : 'Capability'} "${form.name.trim()}" added`)
    } else {
      updateCapability(selected.value, formPayload())
      mode.value = 'view'
      notify('Changes saved')
    }
  } catch (e) { error.value = e.message }
}
function move (dir) { moveCapability(selected.value, dir) }
const siblings = computed(() => sel.value ? db.capabilities.filter(c => c.level === sel.value.level && c.parentId === sel.value.parentId) : [])
const pos = computed(() => siblings.value.indexOf(sel.value))

// delete
const usage = computed(() => (sel.value && mode.value === 'delete' ? capabilityUsage(sel.value.id) : null))
const usageCount = computed(() => usage.value ? usage.value.applications.length + usage.value.projects.length + usage.value.investments.length + usage.value.valueStreams.length + usage.value.diagrams.length : 0)
const replaceWith = ref('')
const replacementOptions = computed(() => l1Caps().map(d => ({ d, caps: childrenOf(d.id).filter(c => c.id !== selected.value) })).filter(g => g.caps.length))
function startDelete () { replaceWith.value = ''; error.value = ''; mode.value = 'delete' }
function confirmDelete () {
  const name = sel.value.name
  try {
    deleteCapability(selected.value, { replaceWith: replaceWith.value || null })
    close()
    notify(`"${name}" deleted${replaceWith.value ? ` – links moved to "${get('capability', replaceWith.value)?.name}"` : ''}`)
  } catch (e) { error.value = e.message }
}
</script>

<template>
  <PageHead eyebrow="Phase B – Business Architecture" title="Business Capabilities" color="var(--c-business)"
            subtitle="What the business does, independent of how. Use the lenses to find gaps, redundancies and where money is going.">
    <button v-if="tab === 'map'" class="btn" :class="{ primary: editMode }" @click="editMode = !editMode">
      <component :is="editMode ? Check : Pencil" :size="15" />{{ editMode ? 'Done editing' : 'Edit map' }}
    </button>
    <div class="seg"><button :class="{ on: tab === 'map' }" @click="tab = 'map'">Capability map</button><button :class="{ on: tab === 'vs' }" @click="tab = 'vs'">Value streams</button></div>
  </PageHead>

  <template v-if="tab === 'map'">
    <div v-if="editMode" class="alert info small" style="margin-bottom:12px">
      <Pencil :size="15" style="flex-shrink:0" />Edit mode: add domains and capabilities with the + buttons, click any capability to rename, re-rate, reorder, move or delete it. Changes are kept until the page is reloaded.
    </div>
    <div class="card">
      <div class="row between" style="margin-bottom:16px">
        <div class="seg"><button v-for="l in lenses" :key="l.id" :class="{ on: lens === l.id }" @click="lens = l.id">{{ l.label }}</button></div>
        <div class="legend"><span v-for="[c, t] in legend" :key="t"><i :style="{ background: c, border: '1px solid #e2e8f0' }" />{{ t }}</span></div>
      </div>
      <div class="capmap" :style="{ gridTemplateColumns: `repeat(${Math.max(1, l1Caps().length)}, minmax(140px, 1fr))${editMode ? ' 110px' : ''}` }">
        <div v-for="l1 in l1Caps()" :key="l1.id" class="l1" :class="{ editing: editMode }">
          <div class="l1-head" :class="{ sel: selected === l1.id }" @click="open(l1.id)">
            <div class="strong">{{ l1.name }}</div><div class="subtle">{{ l1.owner }}</div>
          </div>
          <div v-for="c in childrenOf(l1.id)" :key="c.id" class="l2" :class="{ sel: selected === c.id }" :style="{ background: heat(c).bg }" @click="open(c.id)">
            <div class="strong small">{{ c.name }}</div>
            <div class="subtle" style="color:#475569">{{ heat(c).label }}</div>
          </div>
          <button v-if="editMode" class="add-btn" @click="startCreate(2, l1.id)"><Plus :size="14" />Add capability</button>
        </div>
        <button v-if="editMode" class="add-domain" @click="startCreate(1)"><Plus :size="18" /><span>Add capability domain</span></button>
      </div>
      <div v-if="!l1Caps().length" class="empty">No capabilities yet. <a href="#" @click.prevent="editMode = true; startCreate(1)">Add the first capability domain</a>.</div>
    </div>
  </template>

  <template v-else>
    <div v-for="vs in db.valueStreams" :key="vs.id" class="card" style="margin-bottom:16px">
      <div class="card-head"><div><h2>{{ vs.name }}</h2><p>Primary stakeholder: {{ vs.stakeholder }}</p></div></div>
      <div class="vs">
        <div v-for="(st, i) in vs.stages" :key="st.name" class="vs-stage">
          <div class="vs-chevron" :class="{ first: i === 0 }">{{ st.name }}</div>
          <div class="stack" style="padding:10px 4px">
            <div v-for="cid in st.capabilityIds.filter(x => get('capability', x))" :key="cid" class="l2 small" :style="{ background: heat(get('capability', cid)).bg }" @click="open(cid)">
              <div class="strong">{{ get('capability', cid).name }}</div>
              <div class="subtle" style="color:#475569">{{ appsForCap(cid, { activeOnly: true }).map(a => a.name).join(', ') || 'No IT support' }}</div>
            </div>
            <div v-if="!st.capabilityIds.some(x => get('capability', x))" class="empty small">No capability mapped</div>
          </div>
        </div>
      </div>
    </div>
  </template>

  <Drawer :open="drawerOpen"
          :title="mode === 'create' ? (form.level === 1 ? 'New capability domain' : 'New capability') : sel?.name"
          :subtitle="mode === 'create' ? (form.level === 2 ? `in ${get('capability', form.parentId)?.name}` : 'Level 1') : sel ? `Capability ${sel.id} · Level ${sel.level}` : ''"
          @close="close">
    <template #tags><Tag v-if="mode === 'view' && sel?.importance" :value="sel.importance">{{ sel.importance }} importance</Tag></template>

    <!-- view -->
    <template v-if="mode === 'view' && sel">
      <div class="row" style="margin-bottom:16px">
        <button class="btn" @click="startEdit"><Pencil :size="14" />Edit</button>
        <button class="btn" :disabled="pos <= 0" :title="sel.level === 1 ? 'Move left' : 'Move up'" @click="move(-1)"><component :is="sel.level === 1 ? ArrowLeft : ArrowUp" :size="14" /></button>
        <button class="btn" :disabled="pos >= siblings.length - 1" :title="sel.level === 1 ? 'Move right' : 'Move down'" @click="move(1)"><component :is="sel.level === 1 ? ArrowRight : ArrowDown" :size="14" /></button>
        <button v-if="sel.level === 1" class="btn" @click="startCreate(2, sel.id)"><Plus :size="14" />Add capability</button>
        <button class="btn danger" style="margin-left:auto" @click="startDelete"><Trash2 :size="14" />Delete</button>
      </div>
      <div class="drawer-section">
        <p class="muted" v-if="sel.description">{{ sel.description }}</p>
        <dl class="kv mt">
          <dt>Owner</dt><dd>{{ sel.owner || '–' }}</dd>
          <template v-if="sel.level === 2"><dt>Domain</dt><dd>{{ get('capability', sel.parentId)?.name }}</dd><dt>Maturity</dt><dd>{{ sel.maturity }} / 5 → target {{ sel.targetMaturity }} / 5</dd></template>
          <template v-else><dt>Capabilities</dt><dd>{{ childrenOf(sel.id).length }}</dd></template>
          <dt>Investment</dt><dd>{{ money(capInvestment(sel.id)) }}</dd>
        </dl>
      </div>
      <div class="drawer-section"><h4>Supporting applications ({{ selApps.length }})</h4>
        <div class="stack"><div v-for="a in selApps" :key="a.id" class="row between"><EntityChip type="application" :id="a.id" /><div class="row"><Tag :value="a.lifecycle" /><Tag :value="a.time" /></div></div></div>
        <div v-if="!selApps.length" class="empty">No applications support this capability.</div>
      </div>
      <div class="drawer-section"><h4>Projects</h4>
        <div class="row"><EntityChip v-for="p in selProjects" :key="p.id" type="project" :id="p.id" /></div>
        <div v-if="!selProjects.length" class="empty">No projects.</div>
      </div>
      <div class="drawer-section" v-if="selStreams.length"><h4>Value streams</h4>
        <div class="row"><span v-for="v in selStreams" :key="v.id" class="tag t-amber">{{ v.name }}</span></div>
      </div>
      <router-link :to="{ name: 'explorer', query: { type: 'capability', id: sel.id } }" class="btn">Open in Impact Explorer →</router-link>
    </template>

    <!-- create / edit -->
    <form v-else-if="mode === 'create' || mode === 'edit'" class="stack" style="gap:12px" @submit.prevent="save">
      <label class="field">Name *<input v-model="form.name" type="text" maxlength="80" autofocus :placeholder="form.level === 1 ? 'e.g. Sustainability' : 'e.g. Carbon Accounting'" /></label>
      <label v-if="form.level === 2" class="field">Capability domain (level 1)
        <select v-model="form.parentId"><option v-for="d in l1Caps()" :key="d.id" :value="d.id">{{ d.name }}</option></select>
      </label>
      <label class="field">Owner<input v-model="form.owner" type="text" maxlength="80" placeholder="e.g. Head of Sales Ops" /></label>
      <template v-if="form.level === 2">
        <div class="grid g-3">
          <label class="field">Current maturity<select v-model.number="form.maturity"><option v-for="n in 5" :key="n" :value="n">{{ n }}</option></select></label>
          <label class="field">Target maturity<select v-model.number="form.targetMaturity"><option v-for="n in 5" :key="n" :value="n">{{ n }}</option></select></label>
          <label class="field">Importance<select v-model="form.importance"><option>High</option><option>Medium</option><option>Low</option></select></label>
        </div>
        <p class="subtle" style="margin-top:-4px">Maturity: 1 Initial · 2 Repeatable · 3 Defined · 4 Managed · 5 Optimized</p>
        <label class="field">Description<textarea v-model="form.description" rows="3" maxlength="400" placeholder="What does the business do here, independent of how?" /></label>
      </template>
      <div v-if="mode === 'edit' && form.level === 2 && form.parentId !== sel?.parentId" class="alert info small">The capability moves to "{{ get('capability', form.parentId)?.name }}". Its ID ({{ sel.id }}) and all links stay the same.</div>
      <div v-if="error || liveError" class="alert bad small"><AlertTriangle :size="15" />{{ error || liveError }}</div>
      <div class="row" style="justify-content:flex-end">
        <button type="button" class="btn" @click="mode === 'create' ? close() : (mode = 'view')">Cancel</button>
        <button type="submit" class="btn primary" :disabled="!form.name.trim() || !!liveError">{{ mode === 'create' ? 'Add' : 'Save changes' }}</button>
      </div>
    </form>

    <!-- delete -->
    <template v-else-if="mode === 'delete' && sel && usage">
      <template v-if="usage.children.length">
        <div class="alert warn"><AlertTriangle :size="16" style="flex-shrink:0" />"{{ sel.name }}" still contains {{ usage.children.length }} capabilities. Move them to another domain or delete them first.</div>
        <div class="row mt"><button class="btn" @click="mode = 'view'">Back</button></div>
      </template>
      <template v-else>
        <p style="margin-bottom:12px">Delete <b>{{ sel.name }}</b>?</p>
        <div v-if="!usageCount" class="alert ok small">Nothing references this capability – it can be deleted safely.</div>
        <template v-else>
          <div class="alert warn small" style="flex-direction:column;gap:6px">
            <b>This capability is referenced by:</b>
            <span v-if="usage.applications.length">{{ usage.applications.length }} application(s): {{ usage.applications.map(a => a.name).join(', ') }}</span>
            <span v-if="usage.projects.length">{{ usage.projects.length }} project(s): {{ usage.projects.map(p => p.name).join(', ') }}</span>
            <span v-if="usage.investments.length">{{ usage.investments.length }} investment(s): {{ usage.investments.map(i => i.name).join(', ') }}</span>
            <span v-if="usage.valueStreams.length">{{ usage.valueStreams.length }} value stream(s): {{ usage.valueStreams.map(v => v.name).join(', ') }}</span>
            <span v-if="usage.diagrams.length">{{ usage.diagrams.length }} saved ArchiMate view(s)</span>
          </div>
          <label class="field mt">What should happen to these links?
            <select v-model="replaceWith">
              <option value="">Remove the links</option>
              <optgroup v-for="g in replacementOptions" :key="g.d.id" :label="`Move links to… (${g.d.name})`">
                <option v-for="c in g.caps" :key="c.id" :value="c.id">{{ c.name }}</option>
              </optgroup>
            </select>
          </label>
          <p class="subtle" style="margin-top:6px">Moving links is useful when merging two capabilities. Diagram shapes stay on their views; their repository link is moved or removed.</p>
        </template>
        <div v-if="error" class="alert bad small mt"><AlertTriangle :size="15" />{{ error }}</div>
        <div class="row mt" style="justify-content:flex-end">
          <button class="btn" @click="mode = 'view'">Cancel</button>
          <button class="btn danger-solid" @click="confirmDelete"><Trash2 :size="14" />Delete{{ replaceWith ? ' & move links' : '' }}</button>
        </div>
      </template>
    </template>
  </Drawer>

  <Transition name="fade"><div v-if="toast" class="toast">{{ toast }}</div></Transition>
</template>

<style scoped>
.capmap { display: grid; grid-template-columns: repeat(6, minmax(150px, 1fr)); gap: 12px; overflow-x: auto; }
.l1 { background: #fffbeb; border: 1px solid #fde68a; border-radius: 10px; padding: 8px; display: flex; flex-direction: column; gap: 8px; }
.l1-head { padding: 6px 6px 8px; border-bottom: 2px solid var(--c-business); cursor: pointer; border-radius: 6px 6px 0 0; }
.l1-head:hover { background: rgba(224, 161, 0, .08); }
.l1-head.sel, .l2.sel { box-shadow: 0 0 0 2px #2563eb; }
.l2 { border-radius: 7px; padding: 9px 10px; border: 1px solid rgba(15, 23, 42, .08); cursor: pointer; transition: transform .1s, box-shadow .1s; min-height: 58px; }
.l2:hover { transform: translateY(-1px); box-shadow: 0 4px 10px rgba(0, 0, 0, .08); }
.l1.editing .l2 { cursor: pointer; }
.add-btn { display: flex; align-items: center; justify-content: center; gap: 4px; white-space: nowrap; border: 1.5px dashed #e0a100; border-radius: 7px; background: rgba(255, 255, 255, .6); color: #92400e; padding: 9px; font: inherit; font-size: 12.5px; cursor: pointer; }
.add-btn:hover { background: #fff; }
.add-domain { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; min-height: 140px; padding: 8px; text-align: center; font-size: 12.5px; border: 2px dashed #e0a100; border-radius: 10px; background: #fffdf5; color: #92400e; font: inherit; font-weight: 600; cursor: pointer; }
.add-domain:hover { background: #fffbeb; }
.btn.danger { color: #b91c1c; }
.btn.danger:hover { border-color: #fca5a5; background: #fef2f2; }
.btn.danger-solid { background: #dc2626; border-color: #dc2626; color: #fff; }
.btn.danger-solid:hover { background: #b91c1c; }
.toast { position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%); background: #0f172a; color: #fff; padding: 9px 16px; border-radius: 8px; font-size: 13px; z-index: 60; }
.vs { display: flex; gap: 4px; overflow-x: auto; }
.vs-stage { flex: 1; min-width: 160px; }
.vs-chevron { background: var(--c-business); color: #fff; font-weight: 600; padding: 10px 22px; clip-path: polygon(0 0, calc(100% - 14px) 0, 100% 50%, calc(100% - 14px) 100%, 0 100%, 14px 50%); }
.vs-chevron.first { clip-path: polygon(0 0, calc(100% - 14px) 0, 100% 50%, calc(100% - 14px) 100%, 0 100%); }
</style>
