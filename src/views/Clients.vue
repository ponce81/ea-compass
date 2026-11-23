<script setup>
import { ref, reactive, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Plus, ShieldCheck, ArrowRight, BookOpen } from 'lucide-vue-next'
import { tenantState, tenantSnapshot, switchTenant, createTenant, CURRENT_YEAR } from '../store'
import { libraryPrinciples, referenceCapabilities, baselineRadar } from '../data/library'
import { money, initials, fmtMonth } from '../utils/format'
import PageHead from '../components/PageHead.vue'
import Tag from '../components/Tag.vue'

const route = useRoute()
const router = useRouter()

function stats (id) {
  const d = tenantSnapshot(id)
  const apps = d.applications.filter(a => a.lifecycle !== 'Plan' && a.lifecycle !== 'Retired')
  const cur = d.company.currency
  return {
    currency: cur,
    apps: apps.length,
    runCost: money(apps.reduce((s, a) => s + a.annualCost, 0), { currency: cur }),
    projects: d.projects.length,
    atRisk: d.projects.filter(p => p.rag !== 'Green').length,
    change: money(d.investments.filter(i => i.status !== 'Idea').reduce((s, i) => s + (i.budget[CURRENT_YEAR] || 0), 0), { currency: cur }),
    gaps: d.capabilities.filter(c => c.level === 2 && c.targetMaturity - c.maturity >= 2).length,
    caps: d.capabilities.filter(c => c.level === 2).length
  }
}
const cards = computed(() => tenantState.list.map(t => ({ ...t, s: stats(t.id) })))

function open (id) {
  switchTenant(id)
  router.push('/')
}

// ---- new client
const showNew = ref(route.query.new === '1')
const colors = ['#2563eb', '#0d9488', '#7c3aed', '#db2777', '#ea580c', '#16a34a', '#0891b2', '#475569']
const form = reactive({ name: '', industry: '', country: '', currency: 'CHF', color: colors[4], options: { principles: true, capabilities: true, radar: true } })
const valid = computed(() => form.name.trim().length >= 2 && !tenantState.list.some(t => t.name.toLowerCase() === form.name.trim().toLowerCase()))
function create () {
  if (!valid.value) return
  createTenant({ ...form, name: form.name.trim(), industry: form.industry.trim() || 'Not specified', country: form.country.trim() || '—', options: { ...form.options } })
  router.push('/')
}
</script>

<template>
  <PageHead eyebrow="Consultant workspace" title="Clients"
            subtitle="Each client is a separate, isolated repository. Switching clients swaps all data – nothing is shared or visible across clients.">
    <button class="btn primary" @click="showNew = !showNew"><Plus :size="15" />New client</button>
  </PageHead>

  <div v-if="showNew" class="card" style="margin-bottom:16px">
    <div class="card-head"><div><h2>New client</h2><p>Creates an empty, isolated tenant – optionally seeded from your practice library</p></div></div>
    <div class="grid g-2">
      <div class="grid g-2">
        <label class="field">Company name<input v-model="form.name" type="text" placeholder="e.g. Contour Logistics AG" /></label>
        <label class="field">Industry<input v-model="form.industry" type="text" placeholder="e.g. Logistics" /></label>
        <label class="field">Country<input v-model="form.country" type="text" placeholder="e.g. Switzerland" /></label>
        <label class="field">Currency<select v-model="form.currency"><option>CHF</option><option>EUR</option><option>USD</option><option>GBP</option></select></label>
        <div class="field span-2">Colour (helps you see at a glance which client you are in)
          <div class="row" style="margin-top:4px">
            <button v-for="c in colors" :key="c" class="swatch" :class="{ on: form.color === c }" :style="{ background: c }" :aria-label="`Colour ${c}`" @click="form.color = c" />
          </div>
        </div>
      </div>
      <div>
        <div class="small strong muted row" style="margin-bottom:8px"><BookOpen :size="15" />Start from practice library</div>
        <label class="opt"><input v-model="form.options.principles" type="checkbox" /> <span><b>Architecture principles</b><span class="subtle"> · {{ libraryPrinciples.length }} principles</span></span></label>
        <label class="opt"><input v-model="form.options.capabilities" type="checkbox" /> <span><b>Reference capability map</b><span class="subtle"> · cross-industry, {{ referenceCapabilities.filter(c => c.level === 2).length }} capabilities</span></span></label>
        <label class="opt"><input v-model="form.options.radar" type="checkbox" /> <span><b>Baseline technology radar</b><span class="subtle"> · {{ baselineRadar.length }} technologies</span></span></label>
        <div class="alert info small mt"><ShieldCheck :size="15" style="flex-shrink:0" />Only generic library content is copied. No data from other clients is ever used to seed a new client.</div>
      </div>
    </div>
    <div class="row mt" style="justify-content:flex-end">
      <span v-if="form.name.trim() && !valid" class="small" style="color:#dc2626">A client with this name already exists.</span>
      <button class="btn" @click="showNew = false">Cancel</button>
      <button class="btn primary" :disabled="!valid" @click="create">Create client & open</button>
    </div>
  </div>

  <div class="grid g-3">
    <div v-for="t in cards" :key="t.id" class="card client" :class="{ active: t.id === tenantState.activeId }" :style="{ borderTopColor: t.color }">
      <div class="row between" style="flex-wrap:nowrap">
        <div class="row" style="flex-wrap:nowrap;gap:12px">
          <span class="avatar" :style="{ background: t.color }">{{ initials(t.name) }}</span>
          <div><h2>{{ t.name }}</h2><div class="subtle">{{ t.industry }} · {{ t.country }}</div></div>
        </div>
        <Tag v-if="t.id === tenantState.activeId" value="Current" t="blue" />
        <Tag v-else-if="t.isNew" value="New" t="green" />
      </div>
      <dl class="kv mt" style="grid-template-columns:120px 1fr">
        <dt>Your role</dt><dd>{{ t.role }}</dd>
        <dt>Engagement</dt><dd>{{ t.engagement }} since {{ fmtMonth(t.since) }}</dd>
        <dt>Currency</dt><dd>{{ t.s.currency }}</dd>
      </dl>
      <div class="stats">
        <div><b>{{ t.s.apps }}</b><span>applications</span></div>
        <div><b>{{ t.s.runCost }}</b><span>run cost / yr</span></div>
        <div><b>{{ t.s.change }}</b><span>change {{ CURRENT_YEAR }}</span></div>
        <div><b>{{ t.s.projects }}</b><span>projects<template v-if="t.s.atRisk"> · <em>{{ t.s.atRisk }} at risk</em></template></span></div>
        <div><b>{{ t.s.gaps }}/{{ t.s.caps }}</b><span>capability gaps</span></div>
      </div>
      <button class="btn mt" style="width:100%;justify-content:center" @click="open(t.id)">
        {{ t.id === tenantState.activeId ? 'Go to dashboard' : 'Switch to this client' }} <ArrowRight :size="15" />
      </button>
    </div>
  </div>

  <div class="alert info small mt"><ShieldCheck :size="15" style="flex-shrink:0" />
    Prototype note: in the planned SaaS each client becomes its own tenant (own database on Neon). Here, tenants are separated in the browser; new clients and edits stay in memory until reload, saved ArchiMate views are stored per client.
  </div>
</template>

<style scoped>
.client { border-top: 4px solid; }
.client.active { box-shadow: 0 0 0 2px var(--primary-soft), var(--shadow); }
.avatar { width: 40px; height: 40px; border-radius: 9px; color: #fff; font-weight: 700; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; }
.stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-top: 14px; padding-top: 14px; border-top: 1px solid var(--border); }
.stats div { display: flex; flex-direction: column; }
.stats b { font-size: 16px; }
.stats span { font-size: 12px; color: var(--text-3); }
.stats em { color: #d97706; font-style: normal; font-weight: 600; }
.swatch { width: 26px; height: 26px; border-radius: 7px; border: 2px solid transparent; cursor: pointer; }
.swatch.on { border-color: #0f172a; box-shadow: inset 0 0 0 2px #fff; }
.opt { display: flex; gap: 8px; align-items: flex-start; padding: 6px 0; font-size: 13px; cursor: pointer; }
</style>
