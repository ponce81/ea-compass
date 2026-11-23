<script setup>
import { tone } from '../utils/format'
defineProps({ value: [String, Number], t: String })
</script>
<template>
  <span v-if="value != null" class="tag" :class="'t-' + (t || tone(value))"><slot>{{ value }}</slot></span>
</template>
