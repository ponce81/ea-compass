<script setup>
// Stacked vertical bar chart (pure SVG)
import { computed, ref } from 'vue'
const props = defineProps({
  labels: Array,
  series: Array, // [{ name, color, values: [] }]
  height: { type: Number, default: 240 },
  format: { type: Function, default: v => v },
  highlight: [String, Number]
})
const W = 640
const P = { l: 56, r: 10, t: 16, b: 28 }
const hover = ref(null)
const totals = computed(() => props.labels.map((_, i) => props.series.reduce((s, se) => s + (se.values[i] || 0), 0)))
const max = computed(() => Math.max(1, ...totals.value) * 1.12)
const innerH = computed(() => props.height - P.t - P.b)
const bw = computed(() => (W - P.l - P.r) / props.labels.length)
const bars = computed(() => props.labels.map((label, i) => {
  let y = props.height - P.b
  const segs = props.series.map(se => {
    const v = se.values[i] || 0
    const h = (v / max.value) * innerH.value
    y -= h
    return { x: P.l + i * bw.value + bw.value * 0.2, y, w: bw.value * 0.6, h, color: se.color, name: se.name, v }
  })
  return { label, segs, total: totals.value[i], cx: P.l + i * bw.value + bw.value / 2, top: y }
}))
const ticks = computed(() => [0, 0.25, 0.5, 0.75, 1].map(f => ({ v: (max.value / 1.12) * f * 1.12, y: props.height - P.b - f * innerH.value })))
</script>
<template>
  <div>
    <svg :viewBox="`0 0 ${W} ${height}`" width="100%" style="display:block;overflow:visible">
      <g v-for="t in ticks" :key="t.y">
        <line :x1="P.l" :x2="W - P.r" :y1="t.y" :y2="t.y" stroke="#eef1f6" />
        <text :x="P.l - 8" :y="t.y + 4" text-anchor="end" font-size="11" fill="#94a3b8">{{ format(t.v) }}</text>
      </g>
      <g v-for="(b, i) in bars" :key="b.label" @mouseenter="hover = i" @mouseleave="hover = null">
        <rect :x="b.cx - bw / 2" :y="P.t" :width="bw" :height="innerH" :fill="hover === i ? '#f4f7fb' : 'transparent'" />
        <rect v-for="s in b.segs" :key="s.name" :x="s.x" :y="s.y" :width="s.w" :height="Math.max(0, s.h)" :fill="s.color" rx="2" />
        <text :x="b.cx" :y="b.top - 5" text-anchor="middle" font-size="11" font-weight="600" fill="#334155">{{ b.total ? format(b.total) : '' }}</text>
        <text :x="b.cx" :y="height - 8" text-anchor="middle" font-size="12" :font-weight="String(b.label) === String(highlight) ? 700 : 400" :fill="String(b.label) === String(highlight) ? '#2563eb' : '#64748b'">{{ b.label }}</text>
      </g>
    </svg>
    <div class="legend" style="margin-top:8px">
      <span v-for="s in series" :key="s.name"><i :style="{ background: s.color }" />{{ s.name }}</span>
      <span v-if="hover !== null" style="margin-left:auto" class="strong">
        {{ bars[hover].label }}: <template v-for="(s, k) in bars[hover].segs" :key="s.name">{{ k ? ' · ' : '' }}{{ s.name }} {{ format(s.v) }}</template>
      </span>
    </div>
  </div>
</template>
