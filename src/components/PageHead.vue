<script setup>
defineProps({ eyebrow: String, title: String, subtitle: String, color: String })
</script>
<template>
  <div class="page-head">
    <div>
      <div class="eyebrow" :style="color ? { color } : null">{{ eyebrow }}</div>
      <h1>{{ title }}</h1>
      <p v-if="subtitle">{{ subtitle }}</p>
    </div>
    <div class="row"><slot /></div>
  </div>
</template>
