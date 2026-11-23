<script setup>
import { computed } from 'vue'
const props = defineProps({ items: Array, format: { type: Function, default: v => v }, color: { type: String, default: 'var(--primary)' } })
const max = computed(() => Math.max(1, ...props.items.map(i => i.value)))
</script>
<template>
  <div class="stack">
    <div v-for="i in items" :key="i.label">
      <div class="row between small"><span>{{ i.label }}</span><span class="strong">{{ format(i.value) }}</span></div>
      <div class="progress" style="height:8px;margin-top:4px"><div :style="{ width: (i.value / max * 100) + '%', background: i.color || color }" /></div>
    </div>
  </div>
</template>
