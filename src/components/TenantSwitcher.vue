<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ChevronDown, Check, Plus, Building } from 'lucide-vue-next'
import { tenantState, activeTenant, switchTenant } from '../store'
import { initials } from '../utils/format'

const router = useRouter()
const route = useRoute()
const open = ref(false)
const root = ref(null)
const q = ref('')
const current = computed(() => activeTenant())
const list = computed(() => tenantState.list.filter(t => !q.value || (t.name + t.industry + t.country).toLowerCase().includes(q.value.toLowerCase())))

function pick (id) {
  open.value = false
  q.value = ''
  if (id === tenantState.activeId) return
  switchTenant(id)
  // drop element ids from the URL – they belong to the previous client
  if (Object.keys(route.query).length) router.replace({ path: route.path })
}
function go (path) { open.value = false; router.push(path) }
const onDoc = e => { if (root.value && !root.value.contains(e.target)) open.value = false }
onMounted(() => document.addEventListener('mousedown', onDoc))
onBeforeUnmount(() => document.removeEventListener('mousedown', onDoc))
</script>

<template>
  <div ref="root" class="switcher">
    <button class="current" :title="`Client: ${current?.name}`" @click="open = !open">
      <span class="avatar" :style="{ background: current?.color }">{{ initials(current?.name || '?') }}</span>
      <span class="text">
        <span class="name">{{ current?.name }}</span>
        <span class="meta">{{ current?.industry }} · {{ current?.country }}</span>
      </span>
      <ChevronDown :size="15" class="chev" />
    </button>
    <div v-if="open" class="menu">
      <div class="menu-head">Switch client</div>
      <input v-if="tenantState.list.length > 5" v-model="q" type="text" placeholder="Find client…" class="find" />
      <button v-for="t in list" :key="t.id" class="item" :class="{ on: t.id === tenantState.activeId }" @click="pick(t.id)">
        <span class="avatar sm" :style="{ background: t.color }">{{ initials(t.name) }}</span>
        <span class="text">
          <span class="name">{{ t.name }}</span>
          <span class="meta">{{ t.industry }} · {{ t.country }}</span>
        </span>
        <Check v-if="t.id === tenantState.activeId" :size="15" color="#2563eb" />
      </button>
      <div class="menu-foot">
        <button class="foot-btn" @click="go('/clients?new=1')"><Plus :size="14" />New client</button>
        <button class="foot-btn" @click="go('/clients')"><Building :size="14" />All clients</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.switcher { position: relative; }
.current { display: flex; align-items: center; gap: 10px; border: 1px solid var(--border); background: #fff; border-radius: 9px; padding: 5px 10px 5px 6px; cursor: pointer; font: inherit; min-width: 230px; text-align: left; }
.current:hover { border-color: #cbd5e1; background: var(--surface-2); }
.avatar { width: 30px; height: 30px; border-radius: 7px; color: #fff; font-weight: 700; font-size: 12px; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; }
.avatar.sm { width: 26px; height: 26px; font-size: 11px; }
.text { display: flex; flex-direction: column; min-width: 0; flex: 1; }
.name { font-weight: 600; font-size: 13px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: var(--text); }
.meta { font-size: 11px; color: var(--text-3); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.chev { color: var(--text-3); }
.menu { position: absolute; top: 46px; left: 0; width: 320px; background: #fff; border: 1px solid var(--border); border-radius: 10px; box-shadow: 0 12px 32px rgba(15, 23, 42, .16); padding: 6px; z-index: 50; }
.menu-head { font-size: 11px; text-transform: uppercase; letter-spacing: .06em; color: var(--text-3); font-weight: 600; padding: 6px 8px; }
.find { width: 100%; margin-bottom: 4px; }
.item { display: flex; align-items: center; gap: 10px; width: 100%; border: 0; background: none; padding: 7px 8px; border-radius: 7px; cursor: pointer; font: inherit; text-align: left; }
.item:hover { background: var(--surface-2); }
.item.on { background: var(--primary-soft); }
.menu-foot { display: flex; gap: 4px; border-top: 1px solid var(--border); margin-top: 6px; padding-top: 6px; }
.foot-btn { flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px; border: 0; background: none; padding: 7px; border-radius: 7px; cursor: pointer; font: inherit; font-size: 13px; color: var(--text-2); }
.foot-btn:hover { background: var(--surface-2); color: var(--text); }
</style>
