<script setup>
// Multi-select with chips and a searchable option list.
import { ref, computed } from 'vue'
import { X } from 'lucide-vue-next'
const props = defineProps({ modelValue: { type: Array, default: () => [] }, options: Array, placeholder: { type: String, default: 'Add…' } })
const emit = defineEmits(['update:modelValue'])
const q = ref('')
const open = ref(false)
const label = v => props.options.find(o => o.value === v)?.label ?? v
const available = computed(() => props.options.filter(o => !props.modelValue.includes(o.value) && (!q.value || (o.label + ' ' + (o.group || '')).toLowerCase().includes(q.value.toLowerCase()))))
const groups = computed(() => {
  const m = new Map()
  for (const o of available.value) { const g = o.group || ''; if (!m.has(g)) m.set(g, []); m.get(g).push(o) }
  return [...m.entries()]
})
function add (v) { emit('update:modelValue', [...props.modelValue, v]); q.value = '' }
function remove (v) { emit('update:modelValue', props.modelValue.filter(x => x !== v)) }
const onBlur = () => setTimeout(() => (open.value = false), 150)
</script>
<template>
  <div class="mp">
    <div class="chips">
      <span v-for="v in modelValue" :key="v" class="mp-chip">{{ label(v) }}<button type="button" :aria-label="`Remove ${label(v)}`" @click="remove(v)"><X :size="12" /></button></span>
      <input v-model="q" type="text" :placeholder="modelValue.length ? '' : placeholder" @focus="open = true" @blur="onBlur" @keydown.enter.prevent="available[0] && (add(available[0].value), open = false)" @keydown.esc.stop="open = false" @input="open = true" />
    </div>
    <div v-if="open && available.length" class="mp-list">
      <template v-for="[g, opts] in groups" :key="g">
        <div v-if="g" class="mp-group">{{ g }}</div>
        <button v-for="o in opts" :key="o.value" type="button" class="mp-opt" @mousedown.prevent="add(o.value)">{{ o.label }}</button>
      </template>
    </div>
  </div>
</template>
<style scoped>
.mp { position: relative; }
.chips { display: flex; flex-wrap: wrap; gap: 4px; padding: 4px; border: 1px solid var(--border); border-radius: 8px; background: #fff; min-height: 36px; }
.chips:focus-within { border-color: var(--primary); }
.chips input { border: 0; outline: 0; flex: 1; min-width: 90px; padding: 3px 4px; font: inherit; }
.mp-chip { display: inline-flex; align-items: center; gap: 3px; background: var(--primary-soft); color: #1e3a8a; border-radius: 6px; padding: 2px 4px 2px 8px; font-size: 12.5px; }
.mp-chip button { border: 0; background: none; cursor: pointer; color: #1e3a8a; display: inline-flex; padding: 2px; border-radius: 4px; }
.mp-chip button:hover { background: #dbeafe; }
.mp-list { position: absolute; z-index: 5; top: calc(100% + 4px); left: 0; right: 0; max-height: 220px; overflow-y: auto; background: #fff; border: 1px solid var(--border); border-radius: 8px; box-shadow: 0 10px 24px rgba(0,0,0,.12); padding: 4px; }
.mp-group { font-size: 11px; text-transform: uppercase; letter-spacing: .05em; color: var(--text-3); padding: 6px 8px 2px; }
.mp-opt { display: block; width: 100%; text-align: left; border: 0; background: none; padding: 6px 8px; border-radius: 6px; font: inherit; font-size: 13px; cursor: pointer; }
.mp-opt:hover { background: var(--primary-soft); }
</style>
