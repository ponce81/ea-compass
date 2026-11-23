<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  LayoutDashboard, Target, Building2, AppWindow, Database, Server, GitCompareArrows,
  Map as MapIcon, FolderKanban, Wallet, ShieldCheck, Network, Search, Compass, Shapes, FileSpreadsheet, Building, Layers
} from 'lucide-vue-next'
import { searchAll, typeLabels, db, tenantState, activeTenant } from './store'
import TenantSwitcher from './components/TenantSwitcher.vue'

const router = useRouter()
const q = ref('')
const focused = ref(false)
const results = computed(() => (q.value.trim().length < 2 ? [] : searchAll(q.value.trim()).slice(0, 14)))

const onBlur = () => setTimeout(() => (focused.value = false), 150)

function go (r) {
  router.push({ name: 'explorer', query: { type: r.type, id: r.id } })
  q.value = ''
}

const tenant = computed(() => activeTenant())

// environment badge (same build for dev and prod – detected from the host name)
const host = window.location.hostname
const envBadge = host.includes('ea-compass-dev') ? 'DEV' : (host === 'localhost' || host === '127.0.0.1') ? 'LOCAL' : null
const version = import.meta.env.VITE_APP_VERSION || 'local build'

const nav = [
  { group: 'Consultant', items: [
    { to: '/clients', label: 'Clients', icon: Building }
  ] },
  { group: 'Overview', items: [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/strategy', label: 'Strategy & Motivation', icon: Target, color: 'var(--c-motivation)' }
  ] },
  { group: 'Architecture Domains', items: [
    { to: '/business', label: 'Business', icon: Building2, color: 'var(--c-business)' },
    { to: '/applications', label: 'Applications', icon: AppWindow, color: 'var(--c-application)' },
    { to: '/data', label: 'Data', icon: Database, color: 'var(--c-data)' },
    { to: '/technology', label: 'Technology', icon: Server, color: 'var(--c-technology)' }
  ] },
  { group: 'Planning', items: [
    { to: '/target', label: 'Target & Gaps', icon: GitCompareArrows, color: 'var(--c-implementation)' },
    { to: '/states', label: 'Transition Views', icon: Layers, color: 'var(--c-implementation)' },
    { to: '/roadmap', label: 'Roadmap', icon: MapIcon, color: 'var(--c-implementation)' },
    { to: '/projects', label: 'Projects', icon: FolderKanban, color: 'var(--c-implementation)' },
    { to: '/investments', label: 'IT Investments', icon: Wallet, color: 'var(--c-implementation)' }
  ] },
  { group: 'Governance', items: [
    { to: '/governance', label: 'Principles & Decisions', icon: ShieldCheck },
    { to: '/explorer', label: 'Impact Explorer', icon: Network }
  ] },
  { group: 'Modeling & Data', items: [
    { to: '/modeler', label: 'ArchiMate Modeler', icon: Shapes },
    { to: '/import', label: 'Excel Import', icon: FileSpreadsheet }
  ] }
]
</script>

<template>
  <div class="layout">
    <aside class="sidebar">
      <div class="brand">
        <Compass :size="26" color="#60a5fa" />
        <div>EA Compass<small>Consultant workspace</small></div>
      </div>
      <div v-for="g in nav" :key="g.group" class="nav-group">
        <div class="nav-group-title">{{ g.group }}</div>
        <router-link v-for="i in g.items" :key="i.to" :to="i.to" class="nav-link">
          <component :is="i.icon" :size="16" />
          {{ i.label }}
          <span v-if="i.color" class="dom" :style="{ background: i.color }" />
        </router-link>
      </div>
      <div class="version" :title="`Version ${version}`">{{ version }}</div>
    </aside>

    <div class="main">
      <header class="topbar" :style="{ borderTop: `3px solid ${tenant?.color}` }">
        <TenantSwitcher />
        <div class="search">
          <Search :size="15" class="icon" />
          <input v-model="q" placeholder="Search capabilities, applications, data, technologies, projects…"
                 @focus="focused = true" @blur="onBlur" @keydown.enter="results[0] && go(results[0])" />
          <div v-if="focused && results.length" class="search-results">
            <button v-for="r in results" :key="r.type + r.id" @mousedown.prevent="go(r)">
              <span>{{ r.name }}</span><span class="subtle">{{ typeLabels[r.type] }}</span>
            </button>
          </div>
        </div>
        <span v-if="envBadge" class="env-badge" :class="envBadge.toLowerCase()" :title="`Environment: ${envBadge}`">{{ envBadge }}</span>
        <div style="margin-left:auto" class="row subtle">
          Mock data · {{ db.applications.length }} applications · {{ db.projects.length }} projects
        </div>
      </header>
      <main class="content">
        <router-view :key="tenantState.activeId" />
      </main>
    </div>
  </div>
</template>
