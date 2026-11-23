<script setup>
// Create / edit / delete form for applications, interfaces, data objects and technologies.
// Fields come from the shared schema (same rules as the Excel import).
import { ref, reactive, computed, watch } from 'vue'
import { Trash2, AlertTriangle, Plus, X } from 'lucide-vue-next'
import { db, specFor, validateEntity, saveEntity, deleteEntity, entityUsage, defaultRoadmap, ROADMAP_STATES, nameOf } from '../store'
import { fmtMonth } from '../utils/format'
import MultiPick from './MultiPick.vue'

const props = defineProps({
  type: { type: String, required: true }, // application | interface | data | technology
  id: { type: String, default: null }, // null = create
  preset: { type: Object, default: () => ({}) },
  startMode: { type: String, default: 'form' } // 'form' | 'delete'
})
const emit = defineEmits(['done', 'cancel'])

const COLL = { application: 'applications', interface: 'interfaces', data: 'dataObjects', technology: 'technologies' }
const coll = COLL[props.type]
const spec = specFor(coll)
const fields = spec.columns.filter(f => f.key !== 'id')
const existing = props.id ? db[coll].find(x => x.id === props.id) : null
const mode = ref(props.startMode) // form | delete

// working copy
const form = reactive(JSON.parse(JSON.stringify(existing ?? { ...spec.defaults, ...(spec.noName ? {} : { name: '' }), ...props.preset })))
for (const f of fields) if (!(f.key in form)) form[f.key] = f.type === 'refs' ? [] : f.type === 'bool' ? false : null
if (coll === 'dataObjects' && !form.crud) form.crud = {}
// the system of record always has full access
if (coll === 'dataObjects') watch(() => form.masterAppId, m => { if (m && !form.crud[m]) form.crud[m] = 'CRUD' })

// applications: status per plateau
const roadmap = ref(props.id ? [...(db.appRoadmap[props.id] || defaultRoadmap(form.lifecycle))] : defaultRoadmap(form.lifecycle))
const roadmapTouched = ref(false)
watch(() => form.lifecycle, l => { if (!props.id && !roadmapTouched.value) roadmap.value = defaultRoadmap(l) })
// SaaS applications are hosted by the vendor
if (coll === 'applications') watch(() => form.type, t => { if (t === 'SaaS') form.hosting = 'SaaS' })

// options for selects
const optionsFor = f => {
  if (f.ref === 'capabilities') return db.capabilities.map(c => ({ value: c.id, label: c.name, group: c.level === 1 ? 'Capability domains' : db.capabilities.find(p => p.id === c.parentId)?.name }))
  if (f.ref === 'technologies') return db.technologies.map(t => ({ value: t.id, label: t.name, group: t.category }))
  if (f.ref === 'dataObjects') return db.dataObjects.map(d => ({ value: d.id, label: d.name, group: d.domain }))
  return db[f.ref].filter(x => x.id !== props.id).map(x => ({ value: x.id, label: x.name }))
}
const wide = f => f.type === 'refs' || f.key === 'description' || f.key === 'name'

// validation (shown after the first save attempt, name/duplicates live)
const tried = ref(false)
const cleaned = () => {
  const d = { ...form }
  for (const f of fields) if (d[f.key] === '' && f.type !== 'str') d[f.key] = null
  return d
}
const errors = computed(() => validateEntity(coll, cleaned(), props.id))
const shown = computed(() => (tried.value ? errors.value : (errors.value.name && form.name ? { name: errors.value.name } : {})))
const saveError = ref('')

function save () {
  tried.value = true
  if (Object.keys(errors.value).length) return
  try {
    const id = saveEntity(coll, { ...cleaned(), id: props.id || undefined }, coll === 'applications' ? { roadmap: roadmap.value } : {})
    emit('done', { action: props.id ? 'updated' : 'created', id, name: form.name || `${nameOf('application', form.from)} → ${nameOf('application', form.to)}` })
  } catch (e) { saveError.value = e.message }
}

// data objects: CRUD access per application
const crudApps = computed(() => Object.keys(form.crud || {}))
const addCrudApp = ref('')
function toggleCrud (app, ch) {
  const cur = form.crud[app] || ''
  const next = 'CRUD'.split('').filter(c => (c === ch ? !cur.includes(c) : cur.includes(c))).join('')
  if (next) form.crud[app] = next
  else delete form.crud[app]
}
function removeCrud (app) { delete form.crud[app] }
function addCrud () { if (addCrudApp.value) { form.crud[addCrudApp.value] = 'R'; addCrudApp.value = '' } }

// delete
const usage = computed(() => (props.id ? entityUsage(props.type, props.id) : null))
const replaceWith = ref('')
const replaceOptions = computed(() => db[coll].filter(x => x.id !== props.id))
const LABEL = {
  application: { remove: 'Remove the links', move: 'Move links to successor application…', hint: 'Removing deletes interfaces to/from this application; data objects it masters lose their system of record.' },
  data: { remove: 'Remove from interfaces', move: 'Move to data object…', hint: '' },
  technology: { remove: 'Remove from applications', move: 'Replace with technology…', hint: 'Use "replace" when an application migrates, e.g. Java 8 → Java 21.' },
  interface: { remove: '', move: '', hint: '' }
}[props.type]
const usageLines = computed(() => {
  const u = usage.value; if (!u) return []
  const L = []
  if (u.interfaces?.length) L.push(`${u.interfaces.length} interface(s)`)
  if (u.dataObjects?.length) L.push(`${u.dataObjects.length} data object(s)${u.mastered?.length ? ` – system of record for ${u.mastered.map(d => d.name).join(', ')}` : ''}`)
  if (u.projects?.length) L.push(`${u.projects.length} project(s): ${u.projects.map(p => p.name).join(', ')}`)
  if (u.investments?.length) L.push(`${u.investments.length} investment(s): ${u.investments.map(i => i.name).join(', ')}`)
  if (u.applications?.length) L.push(`${u.applications.length} application(s): ${u.applications.map(a => a.name).join(', ')}`)
  if (u.diagrams?.length) L.push(`${u.diagrams.length} saved ArchiMate view(s)`)
  return L
})
function confirmDelete () {
  try {
    const name = existing.name || `${nameOf('application', existing.from)} → ${nameOf('application', existing.to)}`
    deleteEntity(props.type, props.id, { replaceWith: replaceWith.value || null })
    emit('done', { action: 'deleted', id: props.id, name, replacedBy: replaceWith.value ? nameOf(props.type === 'data' ? 'data' : props.type, replaceWith.value) : null })
  } catch (e) { saveError.value = e.message }
}
</script>

<template>
  <!-- form -->
  <form v-if="mode === 'form'" class="ee" novalidate @submit.prevent="save">
    <div class="grid g-2" style="gap:12px">
      <label v-for="f in fields" :key="f.key" class="field" :class="{ 'span-2': wide(f), invalid: shown[f.key] }">
        <span>{{ f.header }}{{ f.required ? ' *' : '' }}</span>
        <MultiPick v-if="f.type === 'refs'" v-model="form[f.key]" :options="optionsFor(f)" :placeholder="`Add ${f.header.toLowerCase()}…`" />
        <select v-else-if="f.type === 'ref'" v-model="form[f.key]">
          <option :value="null">—</option>
          <option v-for="o in optionsFor(f)" :key="o.value" :value="o.value">{{ o.label }}</option>
        </select>
        <select v-else-if="f.type === 'enum'" v-model="form[f.key]">
          <option v-for="v in f.values" :key="v" :value="v">{{ v }}</option>
        </select>
        <span v-else-if="f.type === 'bool'" class="row" style="padding:6px 0"><input v-model="form[f.key]" type="checkbox" /> {{ form[f.key] ? 'Yes' : 'No' }}</span>
        <input v-else-if="f.type === 'int' || f.type === 'num'" v-model.number="form[f.key]" type="number" :min="f.min" :max="f.max" :step="f.type === 'int' ? 1 : 'any'" />
        <input v-else-if="f.type === 'month'" v-model="form[f.key]" type="month" />
        <textarea v-else-if="f.key === 'description'" v-model="form[f.key]" rows="3" maxlength="500" />
        <input v-else v-model="form[f.key]" type="text" maxlength="120" />
        <small v-if="shown[f.key]" class="err">{{ shown[f.key] }}</small>
      </label>
    </div>

    <!-- application: status per plateau -->
    <div v-if="coll === 'applications'" class="extra">
      <div class="extra-head">Status per plateau <span class="subtle">· drives the Roadmap, Target & Gaps and Transition Views</span></div>
      <div class="grid g-4" style="gap:8px">
        <label v-for="(p, i) in db.plateaus" :key="p.id" class="field">
          <span>{{ p.name }} <span class="subtle">{{ fmtMonth(p.date) }}</span></span>
          <select v-model="roadmap[i]" @change="roadmapTouched = true"><option v-for="s in ROADMAP_STATES" :key="String(s)" :value="s">{{ s ?? '—' }}</option></select>
        </label>
      </div>
    </div>

    <!-- data object: CRUD -->
    <div v-if="coll === 'dataObjects'" class="extra">
      <div class="extra-head">Application access <span class="subtle">· C create · R read · U update · D delete</span></div>
      <table class="crud">
        <tbody>
          <tr v-for="app in crudApps" :key="app">
            <td>{{ nameOf('application', app) }} <span v-if="form.masterAppId === app" class="tag t-teal">system of record</span></td>
            <td v-for="ch in 'CRUD'" :key="ch"><label class="crud-box" :class="{ on: (form.crud[app] || '').includes(ch) }"><input type="checkbox" :checked="(form.crud[app] || '').includes(ch)" @change="toggleCrud(app, ch)" />{{ ch }}</label></td>
            <td><button type="button" class="icon-btn" :aria-label="`Remove ${nameOf('application', app)}`" @click="removeCrud(app)"><X :size="14" /></button></td>
          </tr>
        </tbody>
      </table>
      <div class="row" style="margin-top:6px">
        <select v-model="addCrudApp"><option value="">Add application…</option><option v-for="a in db.applications.filter(a => !crudApps.includes(a.id))" :key="a.id" :value="a.id">{{ a.name }}</option></select>
        <button type="button" class="btn" :disabled="!addCrudApp" @click="addCrud"><Plus :size="14" />Add</button>
      </div>
      <small v-if="shown.crud" class="err">{{ shown.crud }}</small>
    </div>

    <div v-if="tried && Object.keys(errors).length" class="alert bad small mt"><AlertTriangle :size="15" />Please fix the highlighted fields.</div>
    <div v-if="saveError" class="alert bad small mt"><AlertTriangle :size="15" />{{ saveError }}</div>
    <div class="row mt" style="justify-content:flex-end">
      <button v-if="id" type="button" class="btn danger" style="margin-right:auto" @click="mode = 'delete'"><Trash2 :size="14" />Delete</button>
      <button type="button" class="btn" @click="$emit('cancel')">Cancel</button>
      <button type="submit" class="btn primary">{{ id ? 'Save changes' : 'Create' }}</button>
    </div>
  </form>

  <!-- delete -->
  <div v-else class="ee">
    <p style="margin-bottom:12px">Delete <b>{{ existing.name || `${nameOf('application', existing.from)} → ${nameOf('application', existing.to)}` }}</b>?</p>
    <template v-if="type !== 'interface'">
      <div v-if="!usageLines.length" class="alert ok small">Nothing references this {{ type === 'data' ? 'data object' : type }} – it can be deleted safely.</div>
      <template v-else>
        <div class="alert warn small" style="flex-direction:column;gap:4px">
          <b>Referenced by:</b>
          <span v-for="l in usageLines" :key="l">{{ l }}</span>
        </div>
        <label class="field mt">What should happen to these links?
          <select v-model="replaceWith">
            <option value="">{{ LABEL.remove }}</option>
            <optgroup :label="LABEL.move"><option v-for="o in replaceOptions" :key="o.id" :value="o.id">{{ o.name }}</option></optgroup>
          </select>
        </label>
        <p v-if="LABEL.hint && (type !== 'application' || !replaceWith)" class="subtle" style="margin-top:6px">{{ LABEL.hint }}</p>
      </template>
    </template>
    <div v-if="saveError" class="alert bad small mt"><AlertTriangle :size="15" />{{ saveError }}</div>
    <div class="row mt" style="justify-content:flex-end">
      <button class="btn" @click="mode = 'form'">Back</button>
      <button class="btn danger-solid" @click="confirmDelete"><Trash2 :size="14" />Delete{{ replaceWith ? (type === 'technology' ? ' & replace' : ' & move links') : '' }}</button>
    </div>
  </div>
</template>

<style scoped>
.field.invalid input, .field.invalid select, .field.invalid textarea, .field.invalid :deep(.chips) { border-color: #f87171; }
.err { color: #b91c1c; font-size: 12px; font-weight: 500; }
.extra { margin-top: 18px; padding-top: 14px; border-top: 1px solid var(--border); }
.extra-head { font-weight: 600; font-size: 13px; margin-bottom: 8px; }
.crud { width: auto; }
.crud td { padding: 4px 6px; border-bottom: 1px solid #f0f3f7; font-size: 13px; }
.crud-box { display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 26px; border: 1px solid var(--border); border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 12px; color: var(--text-3); }
.crud-box { position: relative; }
.crud-box input { position: absolute; opacity: 0; width: 0; height: 0; }
.crud-box:focus-within { outline: 2px solid var(--primary); outline-offset: 1px; }
.crud-box.on { background: #ccfbf1; border-color: #5eead4; color: #115e59; }
.btn.danger { color: #b91c1c; }
.btn.danger:hover { border-color: #fca5a5; background: #fef2f2; }
.btn.danger-solid { background: #dc2626; border-color: #dc2626; color: #fff; }
.btn.danger-solid:hover { background: #b91c1c; }
</style>
