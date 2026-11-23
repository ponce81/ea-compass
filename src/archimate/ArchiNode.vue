<script setup>
import { computed } from 'vue'
import { Handle, Position } from '@vue-flow/core'
import { NodeResizer } from '@vue-flow/node-resizer'
import { ELEMENTS, fillOf, strokeOf } from './notation'

defineOptions({ inheritAttrs: false })
const props = defineProps({ id: String, data: Object, selected: Boolean })
const el = computed(() => ELEMENTS[props.data.atype])
const sides = ['Top', 'Right', 'Bottom', 'Left']
const STATUS = { new: '#16a34a', phaseout: '#d97706', planned: '#2563eb' }
const border = computed(() => (props.selected ? '#2563eb' : STATUS[props.data.status] || strokeOf(props.data.atype)))
</script>

<template>
  <NodeResizer :is-visible="selected" :min-width="90" :min-height="44" color="#2563eb" />
  <div class="am-node" :class="[el.shape, { selected, invalid: data.invalid, container: data.container, [`st-${data.status}`]: data.status }]"
       :style="{ background: data.atype === 'Grouping' ? 'rgba(255,255,255,.35)' : fillOf(data.atype), borderColor: border }"
       :title="`${el.name}${data.refId ? ' · linked to repository' : ''}`">
    <svg class="glyph" viewBox="0 0 16 16"><path :d="el.glyph" fill="none" stroke="#1e293b" stroke-width="1.1" stroke-linejoin="round" /></svg>
    <span v-if="data.refId" class="link-dot" title="Linked to repository element" />
    <div class="label" :class="{ top: data.atype === 'Grouping' || data.container }">{{ data.name }}</div>
    <Handle v-for="s in sides" :id="s" :key="s" type="source" :position="Position[s]" class="am-handle" />
  </div>
</template>

<style scoped>
.am-node { width: 100%; height: 100%; border: 1.3px solid; border-radius: 2px; position: relative; display: flex; align-items: center; justify-content: center; padding: 8px 22px 6px 8px; box-sizing: border-box; font-size: 12px; color: #0f172a; box-shadow: 1px 1px 0 rgba(0,0,0,.06); }
.am-node.round { border-radius: 10px; }
.am-node.pill { border-radius: 999px; padding-left: 16px; }
.am-node.group { border-style: dashed; align-items: flex-start; justify-content: flex-start; }
.am-node.selected { box-shadow: 0 0 0 2px rgba(37, 99, 235, .25); }
.label { text-align: center; line-height: 1.25; overflow: hidden; word-break: break-word; }
.label.top { font-weight: 600; text-align: left; }
.am-node.container { align-items: flex-start; justify-content: flex-start; }
.am-node.st-new { border-width: 2.2px; }
.am-node.st-phaseout, .am-node.st-planned { border-width: 2px; border-style: dashed; }
.am-node.st-planned { opacity: .7; }
.glyph { position: absolute; top: 4px; right: 5px; width: 15px; height: 15px; }
.link-dot { position: absolute; left: 5px; top: 5px; width: 6px; height: 6px; border-radius: 50%; background: #2563eb; }
.am-handle { width: 8px; height: 8px; background: #fff; border: 1.5px solid #64748b; opacity: 0; transition: opacity .15s; }
.am-node:hover .am-handle, .am-node.selected .am-handle { opacity: 1; }
</style>
