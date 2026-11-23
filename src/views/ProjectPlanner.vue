<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Check, AlertTriangle, Info, XCircle, CheckCircle2 } from 'lucide-vue-next'
import { db, tenantState, l1Caps, childrenOf, get, nameOf, dataForApp, techForApp, interfacesForApp, addPlannedProject, nextId, uniq, invYear, YEARS } from '../store'
import { money, fmtMonth } from '../utils/format'
import PageHead from '../components/PageHead.vue'
import Tag from '../components/Tag.vue'
import EntityChip from '../components/EntityChip.vue'

const router = useRouter()
const step = ref(1)
const steps = ['Basics', 'Capability scope', 'Application impact', 'Impact analysis', 'Submit']

// Example values only for the Acme demo client; other clients start with an empty form
const demo = tenantState.activeId === 'acme'
const form = reactive({
  name: demo ? 'Customer Self-Service Analytics' : '',
  description: demo ? 'Give B2B customers self-service insights on orders, invoices and service cases in the customer portal.' : '',
  sponsor: 'CCO',
  category: 'Grow',
  goalIds: demo ? ['G1', 'G3'] : [],
  start: '2027-04',
  end: '2028-03',
  budget: 900000,
  capexShare: 0.6,
  capabilityIds: demo ? ['C1.4', 'C1.3'] : [],
  impacts: {}, // appId -> 'Modify' | 'Retire' | 'Introduce'
  newApps: [] // { name, hosting, type, annualCost, capabilityIds }
})
const newApp = reactive({ name: '', hosting: 'SaaS', type: 'SaaS', annualCost: 100000 })

const toggle = (arr, v) => { const i = arr.indexOf(v); i >= 0 ? arr.splice(i, 1) : arr.push(v) }

// ---- Step 3: candidates = apps supporting selected capabilities
const candidates = computed(() => db.applications
  .filter(a => a.lifecycle !== 'Retired' && a.capabilityIds.some(c => form.capabilityIds.includes(c))))
const otherApps = computed(() => db.applications.filter(a => a.lifecycle !== 'Retired' && !candidates.value.includes(a)))
const extraAppId = ref('')
const extraApps = ref([])
const impactRows = computed(() => [...candidates.value, ...extraApps.value.map(id => get('application', id))])
function addExtra () { if (extraAppId.value && !extraApps.value.includes(extraAppId.value)) extraApps.value.push(extraAppId.value); extraAppId.value = '' }
function addNewApp () {
  if (!newApp.name.trim()) return
  form.newApps.push({ ...newApp, name: newApp.name.trim(), capabilityIds: [...form.capabilityIds] })
  newApp.name = ''
}
// default suggestion
if (demo) { form.impacts.A20 = 'Modify'; form.impacts.A14 = 'Modify' }

const impacted = computed(() => Object.entries(form.impacts).filter(([, v]) => v).map(([appId, change]) => ({ app: get('application', appId), change })).filter(x => x.app))

// ---- Step 4: automated architecture impact analysis
const startY = computed(() => Number(form.start.slice(0, 4)))
const endY = computed(() => Number(form.end.slice(0, 4)))
const months = computed(() => {
  const [y1, m1] = form.start.split('-').map(Number); const [y2, m2] = form.end.split('-').map(Number)
  return Math.max(1, (y2 - y1) * 12 + (m2 - m1) + 1)
})
const budgetSplit = computed(() => {
  const out = {}
  const [y1, m1] = form.start.split('-').map(Number)
  for (let i = 0; i < months.value; i++) {
    const y = y1 + Math.floor((m1 - 1 + i) / 12)
    out[y] = (out[y] || 0) + form.budget / months.value
  }
  for (const k in out) out[k] = Math.round(out[k] / 1000) * 1000
  return out
})

const analysis = computed(() => {
  const apps = impacted.value.map(x => x.app)
  const data = uniq(apps.flatMap(a => dataForApp(a.id)))
  const ifaces = uniq(apps.flatMap(a => interfacesForApp(a.id)))
  const findings = []

  // PR2 – reuse before buy before build
  for (const n of form.newApps) {
    const strategic = db.applications.filter(a => a.time === 'Invest' && a.capabilityIds.some(c => n.capabilityIds.includes(c)))
    if (strategic.length) findings.push({ level: 'warn', principle: 'PR2', text: `New application "${n.name}" overlaps with strategic application(s): ${strategic.map(a => a.name).join(', ')}. Document why reuse is not possible.` })
    if (n.hosting === 'On-Prem') findings.push({ level: 'bad', principle: 'PR3', text: `"${n.name}" is planned on-premises – requires a Cloud-first exception.` })
  }
  // PR8 – Hold technologies
  for (const { app, change } of impacted.value) {
    const hold = techForApp(app).filter(t => t.radar === 'Hold')
    if (change === 'Modify' && hold.length) findings.push({ level: 'warn', principle: 'PR8', text: `Modifying ${app.name}, which runs on Hold technologies (${hold.map(t => t.name).join(', ')}). Consider including re-platforming in scope.` })
    if (change === 'Modify' && ['Eliminate', 'Migrate'].includes(app.time)) findings.push({ level: 'bad', principle: 'PR2', text: `${app.name} is classified "${app.time}" – investing in it contradicts the portfolio strategy.` })
  }
  // PR5 – system of record
  for (const { app, change } of impacted.value.filter(x => x.change === 'Retire')) {
    const mastered = db.dataObjects.filter(d => d.masterAppId === app.id)
    if (mastered.length) findings.push({ level: 'bad', principle: 'PR5', text: `Retiring ${app.name} removes the system of record for ${mastered.map(d => d.name).join(', ')}. Define a successor master.` })
    const ifs = interfacesForApp(app.id)
    if (ifs.length) findings.push({ level: 'warn', principle: 'PR6', text: `${ifs.length} interface(s) of ${app.name} must be re-routed or decommissioned.` })
  }
  // PR7 – security
  const sensitive = data.filter(d => ['Confidential', 'Restricted'].includes(d.classification))
  if (sensitive.length) findings.push({ level: 'info', principle: 'PR7', text: `Touches ${sensitive.length} Confidential/Restricted data objects (${sensitive.map(d => d.name).join(', ')}) – security & privacy review required.` })
  // PR6 – integration via MuleSoft (Hold)
  const mule = ifaces.filter(i => i.via === 'A16')
  if (mule.length) findings.push({ level: 'info', principle: 'PR6', text: `${mule.length} affected interface(s) still run via MuleSoft (Hold). Build new integrations on Azure Integration Services.` })

  // Overlap with other projects
  const overlaps = db.projects.filter(p => p.phase !== 'Closing' && p.start <= form.end && p.end >= form.start)
    .map(p => ({ p, apps: p.impacts.filter(i => form.impacts[i.appId]).map(i => i.appId) }))
    .filter(x => x.apps.length)
  for (const o of overlaps) findings.push({ level: 'warn', principle: null, text: `Overlaps with ${o.p.name} (${fmtMonth(o.p.start)}–${fmtMonth(o.p.end)}) on ${o.apps.map(id => nameOf('application', id)).join(', ')}. Coordinate release planning.` })

  if (!form.goalIds.length) findings.push({ level: 'bad', principle: 'PR1', text: 'Project is not linked to any strategic goal.' })

  // Budget pressure
  const yearLoad = YEARS.map(y => ({ y, existing: db.investments.filter(i => i.status !== 'Idea').reduce((s, i) => s + invYear(i, y), 0), add: budgetSplit.value[y] || 0 }))

  const runDelta = form.newApps.reduce((s, n) => s + Number(n.annualCost || 0), 0) - impacted.value.filter(x => x.change === 'Retire').reduce((s, x) => s + x.app.annualCost, 0)
  const score = Math.max(0, 100 - findings.filter(f => f.level === 'bad').length * 20 - findings.filter(f => f.level === 'warn').length * 8)
  return { apps, data, ifaces, findings, overlaps, yearLoad, runDelta, score }
})
const levelIcon = { bad: XCircle, warn: AlertTriangle, info: Info }

const canNext = computed(() => [
  form.name.trim() && form.start && form.end && form.end >= form.start && form.budget > 0,
  form.capabilityIds.length > 0,
  impacted.value.length + form.newApps.length > 0,
  true, true
][step.value - 1])

function submit () {
  const projectId = nextId('P', 'projects')
  const investmentId = nextId('I', 'investments')
  let appNum = Math.max(...db.applications.map(a => parseInt(a.id.slice(1), 10)))
  const newApps = form.newApps.map(n => ({
    id: 'A' + String(++appNum).padStart(2, '0'), name: n.name, vendor: 'tbd', type: n.type, hosting: n.hosting, lifecycle: 'Plan', time: 'Invest',
    businessFit: 4, technicalFit: 4, criticality: 'Business operational', owner: form.sponsor, users: 0, annualCost: Number(n.annualCost), goLive: endY.value,
    capabilityIds: n.capabilityIds, techIds: [], description: form.description, estimatedCost: true
  }))
  const impacts = [...impacted.value.map(x => ({ appId: x.app.id, change: x.change })), ...newApps.map(a => ({ appId: a.id, change: 'Introduce' }))]
  addPlannedProject({
    newApps,
    investment: { id: investmentId, name: form.name, category: form.category, status: 'Proposed', sponsor: form.sponsor, goalIds: [...form.goalIds], capabilityIds: [...form.capabilityIds], appIds: impacts.map(i => i.appId), projectId, budget: budgetSplit.value, capexShare: form.capexShare, roi: null, priority: analysis.value.score, benefit: form.description },
    project: { id: projectId, name: form.name, investmentId, phase: 'Idea', start: form.start, end: form.end, budget: form.budget, spent: 0, rag: 'Green', manager: 'tbd', architect: 'tbd', archReview: 'Pending', capabilityIds: [...form.capabilityIds], impacts, milestones: [], issues: analysis.value.findings.filter(f => f.level === 'bad').map(f => f.text).join(' ') || undefined }
  })
  router.push({ name: 'projects', query: { highlight: projectId } })
}
</script>

<template>
  <PageHead eyebrow="Phase E/F – Opportunities, Solutions & Migration Planning" title="Plan a new IT project" color="var(--c-implementation)"
            subtitle="Scope a project against the architecture repository. EA Compass analyses impact, principle compliance, overlaps and budget before the idea reaches the Architecture Board." />

  <div class="steps">
    <button v-for="(s, i) in steps" :key="s" class="step" :class="{ on: step === i + 1, done: step > i + 1 }" @click="i + 1 < step && (step = i + 1)">
      <span class="num"><Check v-if="step > i + 1" :size="13" /><template v-else>{{ i + 1 }}</template></span>{{ s }}
    </button>
  </div>

  <!-- Step 1 -->
  <div v-if="step === 1" class="card">
    <div class="grid g-2">
      <label class="field">Project name<input v-model="form.name" type="text" /></label>
      <label class="field">Sponsor<input v-model="form.sponsor" type="text" /></label>
      <label class="field span-2">Description / business case<textarea v-model="form.description" rows="3" /></label>
      <div class="grid g-2">
        <label class="field">Start<input v-model="form.start" type="month" /></label>
        <label class="field">End<input v-model="form.end" type="month" /></label>
      </div>
      <div class="grid g-3">
        <label class="field">Total budget ({{ db.company.currency }})<input v-model.number="form.budget" type="number" step="50000" /></label>
        <label class="field">CAPEX share<select v-model.number="form.capexShare"><option v-for="v in [0, .2, .4, .5, .6, .7, .8, 1]" :key="v" :value="v">{{ v * 100 }}%</option></select></label>
        <label class="field">Category<select v-model="form.category"><option>Run</option><option>Grow</option><option>Transform</option></select></label>
      </div>
    </div>
    <div class="mt">
      <div class="small strong muted" style="margin-bottom:6px">Strategic goals supported</div>
      <div class="row">
        <button v-for="g in db.goals" :key="g.id" class="chip" :style="form.goalIds.includes(g.id) ? { background: '#ede9fe', borderColor: '#8b5cf6' } : null" @click="toggle(form.goalIds, g.id)">
          <Check v-if="form.goalIds.includes(g.id)" :size="13" />{{ g.name }}
        </button>
      </div>
    </div>
  </div>

  <!-- Step 2 -->
  <div v-if="step === 2" class="card">
    <div class="card-head"><div><h2>Which business capabilities does the project change?</h2><p>{{ form.capabilityIds.length }} selected</p></div></div>
    <div class="capgrid" :style="{ gridTemplateColumns: `repeat(${Math.max(1, l1Caps().length)}, minmax(140px, 1fr))` }">
      <div v-for="l1 in l1Caps()" :key="l1.id">
        <div class="strong small" style="margin-bottom:6px">{{ l1.name }}</div>
        <div class="stack">
          <button v-for="c in childrenOf(l1.id)" :key="c.id" class="capbtn" :class="{ on: form.capabilityIds.includes(c.id) }" @click="toggle(form.capabilityIds, c.id)">
            <span>{{ c.name }}</span><span class="subtle">{{ c.maturity }}→{{ c.targetMaturity }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Step 3 -->
  <div v-if="step === 3" class="grid g-3">
    <div class="card span-2">
      <div class="card-head"><div><h2>Impact on existing applications</h2><p>Suggested from the selected capabilities</p></div></div>
      <table>
        <thead><tr><th>Application</th><th>Lifecycle</th><th>TIME</th><th>Impact</th></tr></thead>
        <tbody>
          <tr v-for="a in impactRows" :key="a.id">
            <td><EntityChip type="application" :id="a.id" /></td>
            <td><Tag :value="a.lifecycle" /></td>
            <td><Tag :value="a.time" /></td>
            <td>
              <div class="seg">
                <button v-for="opt in ['', 'Modify', 'Retire']" :key="opt" :class="{ on: (form.impacts[a.id] || '') === opt }" @click="form.impacts[a.id] = opt">{{ opt || 'None' }}</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <div class="row mt">
        <select v-model="extraAppId"><option value="">+ Add another application…</option><option v-for="a in otherApps" :key="a.id" :value="a.id">{{ a.name }}</option></select>
        <button class="btn" :disabled="!extraAppId" @click="addExtra">Add</button>
      </div>
    </div>
    <div class="card">
      <div class="card-head"><div><h2>New applications</h2><p>Introduce new solution building blocks</p></div></div>
      <div class="stack">
        <label class="field">Name<input v-model="newApp.name" type="text" placeholder="e.g. Embedded analytics SaaS" @keydown.enter="addNewApp" /></label>
        <div class="grid g-2">
          <label class="field">Hosting<select v-model="newApp.hosting"><option>SaaS</option><option>Azure</option><option>On-Prem</option></select></label>
          <label class="field">Type<select v-model="newApp.type"><option>SaaS</option><option>PaaS</option><option>COTS</option><option>Custom</option></select></label>
        </div>
        <label class="field">Estimated run cost / yr<input v-model.number="newApp.annualCost" type="number" step="10000" /></label>
        <button class="btn" :disabled="!newApp.name.trim()" @click="addNewApp">+ Add new application</button>
      </div>
      <div class="stack mt">
        <div v-for="(n, i) in form.newApps" :key="i" class="row between"><span class="chip">{{ n.name }} <Tag value="Introduce" /></span><button class="icon-btn" @click="form.newApps.splice(i, 1)">✕</button></div>
      </div>
    </div>
  </div>

  <!-- Step 4 -->
  <div v-if="step === 4">
    <div class="grid g-4">
      <div class="card kpi"><div class="label">Architecture fit score</div><div class="value" :style="{ color: analysis.score >= 80 ? '#16a34a' : analysis.score >= 60 ? '#d97706' : '#dc2626' }">{{ analysis.score }}/100</div><div class="hint">based on {{ analysis.findings.length }} findings</div></div>
      <div class="card kpi"><div class="label">Applications impacted</div><div class="value">{{ analysis.apps.length + form.newApps.length }}</div><div class="hint">{{ form.newApps.length }} new · {{ impacted.filter(x => x.change === 'Retire').length }} retired</div></div>
      <div class="card kpi"><div class="label">Data objects / interfaces</div><div class="value">{{ analysis.data.length }} / {{ analysis.ifaces.length }}</div><div class="hint">in blast radius</div></div>
      <div class="card kpi"><div class="label">Run cost impact / yr</div><div class="value">{{ analysis.runDelta > 0 ? '+' : '' }}{{ money(analysis.runDelta) }}</div><div class="hint" :class="analysis.runDelta > 0 ? 'bad' : 'good'">after go-live</div></div>
    </div>
    <div class="grid g-3 mt">
      <div class="card span-2">
        <div class="card-head"><div><h2>Findings & principle compliance</h2><p>Automatically derived from the repository</p></div></div>
        <div class="stack">
          <div v-for="(f, i) in analysis.findings" :key="i" class="alert" :class="f.level">
            <component :is="levelIcon[f.level]" :size="16" style="flex-shrink:0;margin-top:1px" />
            <div><b v-if="f.principle">{{ db.principles.find(p => p.id === f.principle)?.name }}: </b>{{ f.text }}</div>
          </div>
          <div v-if="!analysis.findings.length" class="alert ok"><CheckCircle2 :size="16" /> No issues found – fully compliant with architecture principles.</div>
        </div>
      </div>
      <div class="card">
        <div class="card-head"><div><h2>Budget fit</h2><p>Change portfolio per year incl. this project</p></div></div>
        <div class="stack">
          <div v-for="r in analysis.yearLoad.filter(r => r.y >= 2026)" :key="r.y">
            <div class="row between small"><span class="strong">{{ r.y }}</span><span>{{ money(r.existing) }}<b v-if="r.add" style="color:#ec4899"> + {{ money(r.add) }}</b></span></div>
            <div class="progress" style="height:8px;display:flex"><div :style="{ width: r.existing / 7e6 * 100 + '%', background: '#94a3b8', borderRadius: 0 }" /><div :style="{ width: r.add / 7e6 * 100 + '%', background: '#ec4899', borderRadius: 0 }" /></div>
          </div>
          <div class="subtle">Scale: {{ money(7e6) }} annual change capacity</div>
        </div>
      </div>
    </div>
    <div class="grid g-2 mt">
      <div class="card"><div class="card-head"><h2>Affected data objects</h2></div>
        <div class="row"><EntityChip v-for="d in analysis.data" :key="d.id" type="data" :id="d.id"><Tag :value="d.classification" /></EntityChip></div>
        <div v-if="!analysis.data.length" class="empty">None.</div>
      </div>
      <div class="card"><div class="card-head"><h2>Affected interfaces</h2></div>
        <div class="stack small"><div v-for="f in analysis.ifaces" :key="f.id">{{ nameOf('application', f.from) }} → {{ nameOf('application', f.to) }} <span class="subtle">· {{ f.protocol }}{{ f.via ? ' via ' + nameOf('application', f.via) : '' }}</span></div></div>
        <div v-if="!analysis.ifaces.length" class="empty">None.</div>
      </div>
    </div>
  </div>

  <!-- Step 5 -->
  <div v-if="step === 5" class="card">
    <div class="card-head"><div><h2>Summary</h2><p>Will be created as project idea + proposed investment, and queued for Architecture Board review.</p></div></div>
    <dl class="kv" style="grid-template-columns:180px 1fr">
      <dt>Project</dt><dd class="strong">{{ form.name }}</dd>
      <dt>Description</dt><dd>{{ form.description }}</dd>
      <dt>Timeline</dt><dd>{{ fmtMonth(form.start) }} – {{ fmtMonth(form.end) }} ({{ months }} months)</dd>
      <dt>Budget</dt><dd>{{ money(form.budget) }} · {{ form.capexShare * 100 }}% CAPEX · <span v-for="(v, y) in budgetSplit" :key="y" class="subtle">{{ y }}: {{ money(v) }}&nbsp; </span></dd>
      <dt>Goals</dt><dd><div class="row"><EntityChip v-for="g in form.goalIds" :key="g" type="goal" :id="g" /></div></dd>
      <dt>Capabilities</dt><dd><div class="row"><EntityChip v-for="c in form.capabilityIds" :key="c" type="capability" :id="c" /></div></dd>
      <dt>Applications</dt><dd><div class="row">
        <span v-for="x in impacted" :key="x.app.id" class="chip">{{ x.app.name }} <Tag :value="x.change" /></span>
        <span v-for="n in form.newApps" :key="n.name" class="chip">{{ n.name }} <Tag value="Introduce" /></span>
      </div></dd>
      <dt>Architecture fit</dt><dd>{{ analysis.score }}/100 · {{ analysis.findings.filter(f => f.level === 'bad').length }} blocking, {{ analysis.findings.filter(f => f.level === 'warn').length }} warnings</dd>
    </dl>
  </div>

  <div class="row between mt">
    <button class="btn" :disabled="step === 1" @click="step--">← Back</button>
    <button v-if="step < 5" class="btn primary" :disabled="!canNext" @click="step++">Next: {{ steps[step] }} →</button>
    <button v-else class="btn primary" @click="submit">Create project & submit for review</button>
  </div>
</template>

<style scoped>
.steps { display: flex; gap: 6px; margin-bottom: 16px; flex-wrap: wrap; }
.step { display: flex; align-items: center; gap: 8px; padding: 8px 14px; border-radius: 999px; border: 1px solid var(--border); background: #fff; font: inherit; color: var(--text-2); cursor: default; }
.step.done { cursor: pointer; color: var(--text); }
.step.on { border-color: var(--primary); color: var(--primary); font-weight: 600; background: var(--primary-soft); }
.step .num { width: 20px; height: 20px; border-radius: 50%; background: #eef1f6; display: inline-flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; }
.step.on .num { background: var(--primary); color: #fff; }
.step.done .num { background: #16a34a; color: #fff; }
.capgrid { display: grid; grid-template-columns: repeat(6, minmax(140px, 1fr)); gap: 12px; overflow-x: auto; }
.capbtn { display: flex; justify-content: space-between; gap: 6px; width: 100%; text-align: left; padding: 8px 10px; border: 1px solid var(--border); border-radius: 7px; background: #fff; font: inherit; font-size: 12.5px; cursor: pointer; }
.capbtn:hover { border-color: var(--c-business); }
.capbtn.on { background: #fef3c7; border-color: var(--c-business); font-weight: 600; }
</style>
