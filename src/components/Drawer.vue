<script setup>
import { watch, onBeforeUnmount } from 'vue'
import { X } from 'lucide-vue-next'
const props = defineProps({ open: Boolean, title: String, subtitle: String })
const emit = defineEmits(['close'])
// Esc closes the drawer
const onKey = e => { if (e.key === 'Escape') emit('close') }
watch(() => props.open, o => (o ? window.addEventListener('keydown', onKey) : window.removeEventListener('keydown', onKey)), { immediate: true })
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>
<template>
  <Teleport to="body">
    <Transition name="fade"><div v-if="open" class="drawer-backdrop" @click="$emit('close')" /></Transition>
    <Transition name="slide">
      <aside v-if="open" class="drawer">
        <div class="drawer-head">
          <div>
            <div class="subtle">{{ subtitle }}</div>
            <h2 style="font-size:18px">{{ title }}</h2>
            <div class="row" style="margin-top:8px"><slot name="tags" /></div>
          </div>
          <button class="icon-btn" title="Close (Esc)" @click="$emit('close')"><X :size="18" /></button>
        </div>
        <div class="drawer-body"><slot /></div>
      </aside>
    </Transition>
  </Teleport>
</template>
