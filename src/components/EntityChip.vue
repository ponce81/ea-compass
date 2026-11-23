<script setup>
import { computed } from 'vue'
import { get } from '../store'
const props = defineProps({ type: String, id: String, label: String })
const colors = { capability: 'var(--c-business)', application: 'var(--c-application)', data: 'var(--c-data)', technology: 'var(--c-technology)', project: 'var(--c-implementation)', investment: 'var(--c-implementation)', goal: 'var(--c-motivation)' }
const e = computed(() => get(props.type, props.id))
</script>
<template>
  <router-link v-if="e" class="chip" :to="{ name: 'explorer', query: { type, id } }" :title="'Open in Impact Explorer'">
    <span class="bar" :style="{ background: colors[type] }" />{{ label || e.name }}<slot />
  </router-link>
</template>
