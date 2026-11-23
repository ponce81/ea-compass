<script setup>
import { ref, computed } from 'vue'
import { db, nameOf, uniq } from '../store'
import { Plus } from 'lucide-vue-next'
import Drawer from '../components/Drawer.vue'
import EntityEditor from '../components/EntityEditor.vue'
import PageHead from '../components/PageHead.vue'
import Tag from '../components/Tag.vue'
import EntityChip from '../components/EntityChip.vue'
import HBars from '../components/HBars.vue'

const tab = ref('catalog')
const domains = computed(() => uniq(db.dataObjects.map(d => d.domain)))
const fDomain = ref('')
const rows = computed(() => db.dataObjects.filter(d => !fDomain.value || d.domain === fDomain.value))

const matrixApps = computed(() => uniq(db.dataObjects.flatMap(d => Object.keys(d.crud)))
  .map(id => db.applications.find(a => a.id === id)).filter(Boolean).sort((a, b) => a.name.localeCompare(b.name)))
const qualityColor = q => (q >= 85 ? '#16a34a' : q >= 70 ? '#f59e0b' : '#dc2626')
const issues = computed(() => {
  const out = []
  for (const d of db.dataObjects) {
    const creators = Object.entries(d.crud).filter(([, v]) => v.includes('C')).map(([k]) => k)
    if (creators.length > 1) out.push({ d, msg: `${creators.length} applications create ${d.name} records (${creators.map(c => nameOf('application', c)).join(', ')}) – violates Single System of Record.`, level: 'warn' })
    const master = db.applications.find(a => a.id === d.masterAppId)
    if (master && ['Phase-out', 'Retired'].includes(master.lifecycle)) out.push({ d, msg: `System of record ${master.name} is in ${master.lifecycle}.`, level: 'bad' })
    if (master && master.time === 'Migrate' && ['Confidential', 'Restricted'].includes(d.classification)) out.push({ d, msg: `${d.classification} data mastered in ${master.name} (Migrate) – plan successor master.`, level: 'info' })
  }
  return out
})
// editing
const editor = ref(null) // { id: string | null, startMode }
const toast = ref('')
function onDone (r) {
  editor.value = null
  toast.value = `${r.name} ${r.action}${r.replacedBy ? ` – links moved to ${r.replacedBy}` : ''}`
  setTimeout(() => (toast.value = ''), 2800)
}
const cellClass = v => (v.includes('C') ? 'c-create' : v.includes('U') ? 'c-update' : 'c-read')
</script>

<template>
  <PageHead eyebrow="Phase C – Information Systems Architecture" title="Data Architecture" color="var(--c-data)"
            subtitle="Business data objects, ownership, classification, systems of record and data usage across applications.">
    <button class="btn primary" @click="editor = { id: null }"><Plus :size="15" />New data object</button>
    <div class="seg">
      <button :class="{ on: tab === 'catalog' }" @click="tab = 'catalog'">Data catalog</button>
      <button :class="{ on: tab === 'crud' }" @click="tab = 'crud'">CRUD matrix</button>
      <button :class="{ on: tab === 'quality' }" @click="tab = 'quality'">Quality & issues</button>
    </div>
  </PageHead>

  <div v-if="tab === 'catalog'" class="card">
    <div class="row" style="margin-bottom:12px">
      <select v-model="fDomain"><option value="">All domains</option><option v-for="d in domains" :key="d">{{ d }}</option></select>
      <span class="subtle" style="margin-left:auto">{{ rows.length }} data objects · {{ rows.filter(d => d.pii).length }} contain personal data</span>
    </div>
    <div class="table-wrap">
      <table>
        <thead><tr><th>Data object</th><th>Domain</th><th>Classification</th><th>PII</th><th>Data owner</th><th>System of record</th><th>Used by</th><th class="right">Records</th><th>Quality</th></tr></thead>
        <tbody>
          <tr v-for="d in rows" :key="d.id" class="clickable" title="Click to edit" @click="editor = { id: d.id }">
            <td class="strong">{{ d.name }}</td>
            <td class="muted">{{ d.domain }}</td>
            <td><Tag :value="d.classification" /></td>
            <td><Tag v-if="d.pii" value="PII" t="purple" /></td>
            <td class="muted small">{{ d.owner }}</td>
            <td @click.stop><EntityChip v-if="d.masterAppId" type="application" :id="d.masterAppId" /><span v-else class="tag t-red">none</span></td>
            <td class="muted">{{ Object.keys(d.crud).length }} apps</td>
            <td class="right">{{ d.records }}</td>
            <td style="min-width:110px">
              <div class="row" style="flex-wrap:nowrap"><div class="progress" style="flex:1"><div :style="{ width: d.quality + '%', background: qualityColor(d.quality) }" /></div><span class="small">{{ d.quality }}%</span></div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <div v-else-if="tab === 'crud'" class="card">
    <div class="card-head">
      <div><h2>Application × data object (CRUD)</h2><p>C = Create · R = Read · U = Update · D = Delete · ★ = system of record</p></div>
      <div class="legend"><span><i class="c-create" />Creates</span><span><i class="c-update" />Updates</span><span><i class="c-read" />Reads</span></div>
    </div>
    <div class="table-wrap">
      <table class="crud">
        <thead><tr><th>Application</th><th v-for="d in db.dataObjects" :key="d.id" class="vert"><span>{{ d.name }}</span></th></tr></thead>
        <tbody>
          <tr v-for="a in matrixApps" :key="a.id">
            <td class="nowrap"><EntityChip type="application" :id="a.id" /></td>
            <td v-for="d in db.dataObjects" :key="d.id" class="cell">
              <span v-if="d.crud[a.id]" :class="cellClass(d.crud[a.id])">{{ d.crud[a.id] }}{{ d.masterAppId === a.id ? ' ★' : '' }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <div v-else class="grid g-3">
    <div class="card">
      <div class="card-head"><div><h2>Data quality score</h2><p>Completeness, validity & uniqueness</p></div></div>
      <HBars :items="db.dataObjects.slice().sort((a, b) => a.quality - b.quality).map(d => ({ label: d.name, value: d.quality, color: qualityColor(d.quality) }))" :format="v => v + '%'" />
    </div>
    <div class="card span-2">
      <div class="card-head"><div><h2>Architecture findings</h2><p>Derived automatically from the repository</p></div></div>
      <div class="stack">
        <div v-for="(i, k) in issues" :key="k" class="alert" :class="i.level"><b>{{ i.d.name }}</b> {{ i.msg }}</div>
      </div>
    </div>
  </div>

  <Drawer :open="!!editor" :title="editor?.id ? `Edit ${nameOf('data', editor.id)}` : 'New data object'" :subtitle="editor?.id ? `Data object ${editor.id}` : 'Data object'" @close="editor = null">
    <EntityEditor v-if="editor" :key="String(editor.id)" type="data" :id="editor.id" @done="onDone" @cancel="editor = null" />
    <router-link v-if="editor?.id" :to="{ name: 'explorer', query: { type: 'data', id: editor.id } }" class="btn mt">Open in Impact Explorer →</router-link>
  </Drawer>
  <Transition name="fade"><div v-if="toast" class="toast">{{ toast }}</div></Transition>
</template>

<style scoped>
.crud th.vert { height: 120px; vertical-align: bottom; padding: 4px; }
.crud th.vert span { writing-mode: vertical-rl; transform: rotate(180deg); text-transform: none; letter-spacing: 0; font-size: 12px; color: var(--text-2); }
.crud td.cell { text-align: center; padding: 4px; border-left: 1px solid #f0f3f7; }
.crud td.cell span { display: inline-block; min-width: 42px; padding: 3px 4px; border-radius: 5px; font-size: 11px; font-weight: 600; }
.c-create { background: #ccfbf1; color: #115e59; }
.c-update { background: #dbeafe; color: #1e40af; }
.c-read { background: #f1f5f9; color: #475569; }
.legend i { border: 1px solid #e2e8f0; }
</style>
