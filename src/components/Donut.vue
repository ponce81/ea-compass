<script setup>
import { computed } from 'vue'
const props = defineProps({
  segments: Array, // [{ label, value, color }]
  size: { type: Number, default: 150 },
  centerValue: [String, Number],
  centerLabel: String,
  format: { type: Function, default: v => v }
})
const r = 54
const C = 2 * Math.PI * r
const total = computed(() => props.segments.reduce((s, x) => s + x.value, 0) || 1)
const arcs = computed(() => {
  let off = 0
  return props.segments.map(s => {
    const len = (s.value / total.value) * C
    const a = { ...s, dash: `${len} ${C - len}`, offset: -off }
    off += len
    return a
  })
})
</script>
<template>
  <div class="row" style="gap:20px;flex-wrap:nowrap">
    <svg :width="size" :height="size" viewBox="0 0 140 140" style="flex-shrink:0">
      <circle cx="70" cy="70" :r="r" fill="none" stroke="#eef1f6" stroke-width="18" />
      <circle v-for="a in arcs" :key="a.label" cx="70" cy="70" :r="r" fill="none" :stroke="a.color" stroke-width="18"
              :stroke-dasharray="a.dash" :stroke-dashoffset="a.offset" transform="rotate(-90 70 70)" />
      <text x="70" y="68" text-anchor="middle" font-size="20" font-weight="700" fill="#0f172a">{{ centerValue }}</text>
      <text x="70" y="86" text-anchor="middle" font-size="10" fill="#94a3b8">{{ centerLabel }}</text>
    </svg>
    <div class="stack" style="flex:1;min-width:0">
      <div v-for="s in segments" :key="s.label" class="row between small" style="flex-wrap:nowrap">
        <span class="row" style="flex-wrap:nowrap"><i class="dot" :style="{ background: s.color }" />{{ s.label }}</span>
        <span class="strong">{{ format(s.value) }}</span>
      </div>
    </div>
  </div>
</template>
