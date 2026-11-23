<script setup>
defineProps({ label: String, value: [String, Number], hint: String, hintTone: String, icon: Object, color: String })
</script>
<template>
  <div class="card kpi">
    <div class="label"><component :is="icon" v-if="icon" :size="15" :color="color" />{{ label }}</div>
    <div class="value">{{ value }}</div>
    <div v-if="hint" class="hint" :class="hintTone">{{ hint }}</div>
  </div>
</template>
