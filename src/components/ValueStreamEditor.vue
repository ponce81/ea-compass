<script setup>
// Create / edit / delete a value stream: name, stakeholder and ordered stages with their capabilities.
import { ref, reactive, computed } from 'vue'
import { Plus, Trash2, ArrowUp, ArrowDown, X, AlertTriangle } from 'lucide-vue-next'
import { db, validateValueStream, saveValueStream, deleteValueStream } from '../store'
import MultiPick from './MultiPick.vue'

const props = defineProps({
  id: { type: String, default: null }, // null = create
  startMode: { type: String, default: 'form' } // 'form' | 'delete'
})
const emit = defineEmits(['done', 'cancel'])

const existing = props.id ? db.valueStreams.find(v => v.id === props.id) : null
const mode = ref(props.startMode)
// each stage gets a stable key so reordering keeps inputs with their stage (stripped on save)
let k = 0
const stage = (s = { name: '', capabilityIds: [] }) => ({ name: s.name, capabilityIds: [...s.capabilityIds], _k: k++ })
const form = reactive(existing
  ? { name: existing.name, stakeholder: existing.stakeholder || '', stages: existing.stages.map(stage) }
  : { name: '', stakeholder: '', stages: [stage()] })

// level-2 capabilities, grouped by their domain
const capOptions = computed(() => db.capabilities.filter(c => c.level === 2)
  .map(c => ({ value: c.id, label: c.name, group: db.capabilities.find(p => p.id === c.parentId)?.name })))

function addStage () { form.stages.push(stage()) }
function removeStage (i) { form.stages.splice(i, 1) }
function moveStage (i, dir) {
  const j = i + dir
  if (j < 0 || j >= form.stages.length) return
  const [s] = form.stages.splice(i, 1)
  form.stages.splice(j, 0, s)
}

const tried = ref(false)
const errors = computed(() => validateValueStream(form, props.id))
const shown = computed(() => (tried.value ? errors.value : (errors.value.name && form.name ? { name: errors.value.name } : {})))
const saveError = ref('')

function save () {
  tried.value = true
  if (Object.keys(errors.value).length) return
  try {
    const id = saveValueStream({ ...form, id: props.id || undefined })
    emit('done', { action: props.id ? 'updated' : 'created', id, name: form.name.trim() })
  } catch (e) { saveError.value = e.message }
}
function confirmDelete () {
  try {
    deleteValueStream(props.id)
    emit('done', { action: 'deleted', id: props.id, name: existing.name })
  } catch (e) { saveError.value = e.message }
}
</script>

<template>
  <form v-if="mode === 'form'" novalidate @submit.prevent="save">
    <div class="grid g-2" style="gap:12px">
      <label class="field" :class="{ invalid: shown.name }"><span>Name *</span>
        <input v-model="form.name" type="text" maxlength="80" placeholder="e.g. Order-to-Cash" />
        <small v-if="shown.name" class="err">{{ shown.name }}</small>
      </label>
      <label class="field"><span>Primary stakeholder</span>
        <input v-model="form.stakeholder" type="text" maxlength="80" placeholder="e.g. Customer" />
      </label>
    </div>

    <div class="extra">
      <div class="extra-head">Stages <span class="subtle">· in order, each with the capabilities it relies on</span></div>
      <ol class="stages">
        <li v-for="(s, i) in form.stages" :key="s._k" class="stage" :class="{ invalid: shown[`stage-${i}`] }">
          <div class="stage-head">
            <span class="num">{{ i + 1 }}</span>
            <input v-model="s.name" type="text" maxlength="60" :placeholder="`Stage ${i + 1} name`" :aria-label="`Stage ${i + 1} name`" />
            <button type="button" class="icon-btn" :disabled="i === 0" :aria-label="`Move stage ${i + 1} up`" title="Move up" @click="moveStage(i, -1)"><ArrowUp :size="15" /></button>
            <button type="button" class="icon-btn" :disabled="i === form.stages.length - 1" :aria-label="`Move stage ${i + 1} down`" title="Move down" @click="moveStage(i, 1)"><ArrowDown :size="15" /></button>
            <button type="button" class="icon-btn" :aria-label="`Remove stage ${i + 1}`" title="Remove stage" @click="removeStage(i)"><X :size="15" /></button>
          </div>
          <MultiPick v-model="s.capabilityIds" :options="capOptions" placeholder="Add capabilities…" />
          <small v-if="shown[`stage-${i}`]" class="err">{{ shown[`stage-${i}`] }}</small>
        </li>
      </ol>
      <button type="button" class="btn" @click="addStage"><Plus :size="14" />Add stage</button>
      <small v-if="shown.stages" class="err" style="display:block;margin-top:6px">{{ shown.stages }}</small>
    </div>

    <div v-if="tried && Object.keys(errors).length" class="alert bad small mt"><AlertTriangle :size="15" />Please fix the highlighted fields.</div>
    <div v-if="saveError" class="alert bad small mt"><AlertTriangle :size="15" />{{ saveError }}</div>
    <div class="row mt" style="justify-content:flex-end">
      <button v-if="id" type="button" class="btn danger" style="margin-right:auto" @click="mode = 'delete'"><Trash2 :size="14" />Delete</button>
      <button type="button" class="btn" @click="$emit('cancel')">Cancel</button>
      <button type="submit" class="btn primary">{{ id ? 'Save changes' : 'Create' }}</button>
    </div>
  </form>

  <div v-else>
    <p style="margin-bottom:12px">Delete the value stream <b>{{ existing.name }}</b> with its {{ existing.stages.length }} stage(s)?</p>
    <div class="alert ok small">The capabilities themselves are not affected – only this value stream and its stage mapping are removed.</div>
    <div v-if="saveError" class="alert bad small mt"><AlertTriangle :size="15" />{{ saveError }}</div>
    <div class="row mt" style="justify-content:flex-end">
      <button class="btn" @click="id && startMode === 'delete' ? $emit('cancel') : (mode = 'form')">{{ startMode === 'delete' ? 'Cancel' : 'Back' }}</button>
      <button class="btn danger-solid" @click="confirmDelete"><Trash2 :size="14" />Delete value stream</button>
    </div>
  </div>
</template>

<style scoped>
.err { color: #b91c1c; font-size: 12px; font-weight: 500; }
.field.invalid input { border-color: #f87171; }
.extra { margin-top: 18px; padding-top: 14px; border-top: 1px solid var(--border); }
.extra-head { font-weight: 600; font-size: 13px; margin-bottom: 10px; }
.stages { list-style: none; padding: 0; margin: 0 0 10px; display: grid; gap: 10px; }
.stage { border: 1px solid var(--border); border-left: 4px solid var(--c-business); border-radius: 8px; padding: 10px; display: grid; gap: 8px; background: #fffdf7; }
.stage.invalid { border-color: #f87171; border-left-color: #dc2626; }
.stage-head { display: flex; align-items: center; gap: 6px; }
.stage-head input { flex: 1; min-width: 0; font-weight: 600; }
.num { width: 22px; height: 22px; border-radius: 50%; background: var(--c-business); color: #fff; font-size: 11.5px; font-weight: 700; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; }
.icon-btn:disabled { opacity: .3; cursor: not-allowed; }
.btn.danger-solid { background: #dc2626; border-color: #dc2626; color: #fff; }
.btn.danger-solid:hover { background: #b91c1c; }
</style>
