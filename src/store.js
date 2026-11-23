import { reactive, toRaw } from 'vue'
import { seedTenants } from './data/tenants'
import { newTenantData } from './data/library'
import { SHEETS } from './data/schema'

// ---------------------------------------------------------------------------
// Multi-tenant repository (one tenant per client company).
// `db` always holds ONLY the active tenant's data; other tenants are kept in
// a separate map and are never merged. Swap for API calls later.
// ---------------------------------------------------------------------------
const tenantData = new Map(seedTenants.map(t => [t.id, t.data]))
export const tenantState = reactive({
  activeId: null,
  list: seedTenants.map(({ data, ...meta }) => meta)
})
export const db = reactive({})
export const activeTenant = () => tenantState.list.find(t => t.id === tenantState.activeId)

const ACTIVE_KEY = 'ea-compass.activeTenant'
const diagramKey = id => `ea-compass.${id}.diagrams.v1`
function loadDiagrams (id) {
  try {
    let raw = localStorage.getItem(diagramKey(id))
    if (raw == null && id === 'acme') raw = localStorage.getItem('ea-compass.diagrams.v1') // views saved before multi-tenancy
    return JSON.parse(raw || '[]')
  } catch { return [] }
}
function persistDiagrams () {
  try { localStorage.setItem(diagramKey(tenantState.activeId), JSON.stringify(db.diagrams)) } catch { /* private mode / quota – keep in memory */ }
}

/** Activate a tenant: park the current tenant's data, load the other one. */
export function switchTenant (id) {
  if (!tenantData.has(id) || id === tenantState.activeId) return
  if (tenantState.activeId) {
    const parked = {}
    for (const k of Object.keys(db)) if (k !== 'diagrams') parked[k] = toRaw(db[k])
    tenantData.set(tenantState.activeId, parked)
  }
  for (const k of Object.keys(db)) delete db[k]
  Object.assign(db, tenantData.get(id), { diagrams: loadDiagrams(id) })
  tenantState.activeId = id
  try { localStorage.setItem(ACTIVE_KEY, id) } catch { /* ignore */ }
}

/** Read-only access to any tenant's data (for the consultant's client overview). */
export const tenantSnapshot = id => (id === tenantState.activeId ? db : tenantData.get(id))

/** Create a new client tenant seeded from the practice library (never from another client). */
export function createTenant ({ name, industry, country, currency, color, options }) {
  const base = name.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'client'
  let id = base; let n = 2
  while (tenantData.has(id)) id = `${base}-${n++}`
  tenantData.set(id, newTenantData({ name, currency, ...options }))
  tenantState.list.push({ id, name, industry, country, color, engagement: 'Active', since: new Date().toISOString().slice(0, 7), role: 'Enterprise Architect', isNew: true })
  switchTenant(id)
  return id
}

let initial = 'acme'
try { const saved = localStorage.getItem(ACTIVE_KEY); if (saved && tenantData.has(saved)) initial = saved } catch { /* ignore */ }
switchTenant(initial)

export function saveDiagram (d) {
  const copy = JSON.parse(JSON.stringify({ ...d, updatedAt: new Date().toISOString() }))
  const i = db.diagrams.findIndex(x => x.id === d.id)
  if (i >= 0) db.diagrams[i] = copy; else db.diagrams.push(copy)
  persistDiagrams()
}
export function deleteDiagram (id) {
  db.diagrams = db.diagrams.filter(d => d.id !== id)
  persistDiagrams()
}

// ---- Excel import: upsert documents per collection (in memory)
export function applyImport (changes) {
  let n = 0
  for (const [coll, docs] of Object.entries(changes)) {
    if (coll === 'appRoadmap') { for (const r of docs) db.appRoadmap[r.id] = r.states; continue }
    for (const doc of docs) {
      const i = db[coll].findIndex(x => x.id === doc.id)
      if (i >= 0) db[coll][i] = doc; else db[coll].push(doc)
      n++
    }
  }
  return n
}

export const YEARS = [2024, 2025, 2026, 2027, 2028, 2029]
export const CURRENT_YEAR = 2026
export const TODAY = new Date()

const collections = {
  capability: 'capabilities',
  application: 'applications',
  data: 'dataObjects',
  technology: 'technologies',
  project: 'projects',
  investment: 'investments',
  goal: 'goals'
}

export const typeLabels = {
  capability: 'Capability',
  application: 'Application',
  data: 'Data Object',
  technology: 'Technology',
  project: 'Project',
  investment: 'Investment',
  goal: 'Goal'
}

export const get = (type, id) => db[collections[type]]?.find(x => x.id === id)
export const nameOf = (type, id) => get(type, id)?.name ?? id
export const uniq = arr => [...new Set(arr)]

// ---- Business
export const l1Caps = () => db.capabilities.filter(c => c.level === 1)
export const l2Caps = () => db.capabilities.filter(c => c.level === 2)
export const childrenOf = id => db.capabilities.filter(c => c.parentId === id)
export const capIdsDeep = id => [id, ...childrenOf(id).map(c => c.id)]
export const appsForCap = (id, { activeOnly = false } = {}) => {
  const ids = capIdsDeep(id)
  return db.applications.filter(a => a.capabilityIds.some(c => ids.includes(c)) && (!activeOnly || ['Active', 'Phase-out'].includes(a.lifecycle)))
}

// ---- Application
export const appState = (appId, plateauIdx) => db.appRoadmap[appId]?.[plateauIdx] ?? null
export const isLive = state => state === 'Active' || state === 'Phase-out'
export const runCostAt = idx => db.applications.filter(a => isLive(appState(a.id, idx))).reduce((s, a) => s + a.annualCost, 0)
export const currentApps = () => db.applications.filter(a => a.lifecycle !== 'Plan' && a.lifecycle !== 'Retired')
export const dataForApp = appId => db.dataObjects.filter(d => d.crud[appId])
export const techForApp = app => (app?.techIds || []).map(id => get('technology', id)).filter(Boolean)
export const appsForTech = id => db.applications.filter(a => a.techIds.includes(id))
export const interfacesForApp = id => db.interfaces.filter(i => i.from === id || i.to === id || i.via === id)
export const projectsForApp = id => db.projects.filter(p => p.impacts.some(i => i.appId === id))
export const investmentsForApp = id => db.investments.filter(i => i.appIds.includes(id))
export const holdTechCount = app => techForApp(app).filter(t => t.radar === 'Hold').length

// ---- Planning
export const projectsForCap = id => {
  const ids = capIdsDeep(id)
  return db.projects.filter(p => p.capabilityIds.some(c => ids.includes(c)))
}
export const investmentsForCap = id => {
  const ids = capIdsDeep(id)
  return db.investments.filter(i => i.capabilityIds.some(c => ids.includes(c)))
}
export const invTotal = inv => Object.values(inv.budget).reduce((s, v) => s + v, 0)
export const invYear = (inv, y) => inv.budget[y] || 0
export const invPeriod = inv => {
  const ys = Object.keys(inv.budget).map(Number).sort()
  return ys.length ? (ys[0] === ys.at(-1) ? `${ys[0]}` : `${ys[0]}–${ys.at(-1)}`) : '–'
}
export const capInvestment = id => investmentsForCap(id).reduce((s, i) => s + invTotal(i), 0)

export function monthsUntil (ym) {
  if (!ym) return null
  const [y, m] = ym.split('-').map(Number)
  return (y - TODAY.getFullYear()) * 12 + (m - 1 - TODAY.getMonth())
}

// ---- Relationship graph (used by Impact Explorer & drawers)
export function related (type, id) {
  const e = get(type, id)
  if (!e) return []
  const g = (label, t, ids) => ({ label, type: t, ids: uniq(ids).filter(x => get(t, x)) })
  switch (type) {
    case 'capability': return [
      g('Parent capability', 'capability', e.parentId ? [e.parentId] : []),
      g('Sub-capabilities', 'capability', childrenOf(id).map(c => c.id)),
      g('Supporting applications', 'application', appsForCap(id).map(a => a.id)),
      g('Projects', 'project', projectsForCap(id).map(p => p.id)),
      g('Investments', 'investment', investmentsForCap(id).map(i => i.id))
    ]
    case 'application': {
      const ifs = interfacesForApp(id)
      return [
        g('Capabilities realized', 'capability', e.capabilityIds),
        g('Data objects', 'data', dataForApp(id).map(d => d.id)),
        g('Technologies', 'technology', e.techIds),
        g('Connected applications', 'application', ifs.flatMap(i => [i.from, i.to, i.via]).filter(x => x && x !== id)),
        g('Projects', 'project', projectsForApp(id).map(p => p.id)),
        g('Investments', 'investment', investmentsForApp(id).map(i => i.id))
      ]
    }
    case 'data': return [
      g('System of record', 'application', [e.masterAppId]),
      g('Applications using', 'application', Object.keys(e.crud)),
      g('Carried by interfaces of', 'application', db.interfaces.filter(i => i.dataIds.includes(id)).flatMap(i => [i.from, i.to]))
    ]
    case 'technology': return [
      g('Applications using', 'application', appsForTech(id).map(a => a.id))
    ]
    case 'project': {
      const inv = get('investment', e.investmentId)
      return [
        g('Capabilities in scope', 'capability', e.capabilityIds),
        g('Applications impacted', 'application', e.impacts.map(i => i.appId)),
        g('Investment', 'investment', e.investmentId ? [e.investmentId] : []),
        g('Strategic goals', 'goal', inv?.goalIds || [])
      ]
    }
    case 'investment': return [
      g('Project', 'project', e.projectId ? [e.projectId] : []),
      g('Capabilities', 'capability', e.capabilityIds),
      g('Applications', 'application', e.appIds),
      g('Strategic goals', 'goal', e.goalIds)
    ]
    case 'goal': {
      const invs = db.investments.filter(i => i.goalIds.includes(id))
      return [
        g('Investments', 'investment', invs.map(i => i.id)),
        g('Projects', 'project', invs.map(i => i.projectId).filter(Boolean))
      ]
    }
  }
  return []
}

export function searchAll (q) {
  const s = q.toLowerCase()
  const out = []
  for (const [type, coll] of Object.entries(collections)) {
    for (const e of db[coll]) {
      if (e.name.toLowerCase().includes(s) || e.id.toLowerCase() === s) out.push({ type, id: e.id, name: e.name })
    }
  }
  return out
}

// ---- Mutations (Project Planner)
export function addPlannedProject ({ project, investment, newApps }) {
  for (const app of newApps) {
    db.applications.push(app)
    db.appRoadmap[app.id] = [null, null, 'Planned', 'Active']
  }
  db.investments.push(investment)
  db.projects.push(project)
}

export function nextId (prefix, coll) {
  const n = Math.max(0, ...db[coll].map(x => parseInt(String(x.id).replace(/\D/g, ''), 10) || 0)) + 1
  return prefix + String(n).padStart(2, '0')
}

// ---- Capability editing (active tenant)
const norm = s => String(s ?? '').trim().toLowerCase()

/** Everything that references a capability (used before deleting). */
export function capabilityUsage (id) {
  return {
    applications: db.applications.filter(a => a.capabilityIds.includes(id)),
    projects: db.projects.filter(p => p.capabilityIds.includes(id)),
    investments: db.investments.filter(i => i.capabilityIds.includes(id)),
    valueStreams: db.valueStreams.filter(v => v.stages.some(s => s.capabilityIds.includes(id))),
    diagrams: db.diagrams.filter(d => d.nodes.some(n => n.refType === 'capability' && n.refId === id)),
    children: childrenOf(id)
  }
}

/** Returns an error message, or null if the capability data is valid. */
export function validateCapability (c, selfId = null) {
  if (!String(c.name ?? '').trim()) return 'Name is required.'
  if (db.capabilities.some(x => x.id !== selfId && norm(x.name) === norm(c.name))) return `A capability named "${c.name.trim()}" already exists.`
  if (c.level === 2) {
    if (!db.capabilities.some(x => x.id === c.parentId && x.level === 1)) return 'Choose a capability domain (level 1).'
    for (const k of ['maturity', 'targetMaturity']) if (!Number.isInteger(c[k]) || c[k] < 1 || c[k] > 5) return 'Maturity values must be between 1 and 5.'
    if (!['High', 'Medium', 'Low'].includes(c.importance)) return 'Importance must be High, Medium or Low.'
  }
  return null
}

export function addCapability ({ level, parentId = null, name, owner = '', description = '', maturity = 2, targetMaturity = 3, importance = 'Medium' }) {
  const ids = new Set(db.capabilities.map(c => c.id))
  let id
  if (level === 1) { let n = 1; while (ids.has(`C${n}`)) n++; id = `C${n}` } else { let n = 1; while (ids.has(`${parentId}.${n}`)) n++; id = `${parentId}.${n}` }
  const cap = level === 1
    ? { id, name: name.trim(), level: 1, parentId: null, owner: owner.trim() }
    : { id, name: name.trim(), level: 2, parentId, maturity, targetMaturity, importance, owner: owner.trim(), description: description.trim() }
  const err = validateCapability(cap)
  if (err) throw new Error(err)
  if (level === 1) db.capabilities.push(cap)
  else {
    // insert after the parent's last child so the array order matches the map
    const sibs = db.capabilities.filter(c => c.parentId === parentId)
    const anchor = sibs.length ? sibs.at(-1) : db.capabilities.find(c => c.id === parentId)
    db.capabilities.splice(db.capabilities.indexOf(anchor) + 1, 0, cap)
  }
  return id
}

export function updateCapability (id, patch) {
  const i = db.capabilities.findIndex(c => c.id === id)
  if (i < 0) throw new Error('Capability not found.')
  const cur = db.capabilities[i]
  const next = { ...cur, ...patch, name: String(patch.name ?? cur.name).trim() }
  const err = validateCapability(next, id)
  if (err) throw new Error(err)
  if (cur.level === 2 && next.parentId !== cur.parentId) {
    // moving to another domain: remove and re-insert after the new parent's last child
    db.capabilities.splice(i, 1)
    const sibs = db.capabilities.filter(c => c.parentId === next.parentId)
    const anchor = sibs.length ? sibs.at(-1) : db.capabilities.find(c => c.id === next.parentId)
    db.capabilities.splice(db.capabilities.indexOf(anchor) + 1, 0, next)
  } else db.capabilities[i] = next
}

/** Move a capability up (-1) or down (+1) among its siblings. */
export function moveCapability (id, dir) {
  const cap = db.capabilities.find(c => c.id === id)
  const sibs = db.capabilities.filter(c => c.level === cap.level && c.parentId === cap.parentId)
  const k = sibs.indexOf(cap); const other = sibs[k + dir]
  if (!other) return false
  if (cap.level === 2) {
    const a = db.capabilities.indexOf(cap); const b = db.capabilities.indexOf(other)
    db.capabilities[a] = other; db.capabilities[b] = cap
  } else {
    // level 1: swap whole blocks (domain + its children) so the array stays grouped
    const block = c => [c, ...db.capabilities.filter(x => x.parentId === c.id)]
    const [first, second] = dir < 0 ? [other, cap] : [cap, other]
    const start = db.capabilities.indexOf(first)
    const rest = db.capabilities.filter(c => c !== first && c.parentId !== first.id && c !== second && c.parentId !== second.id)
    const before = rest.filter(c => db.capabilities.indexOf(c) < start)
    const after = rest.filter(c => db.capabilities.indexOf(c) >= start)
    db.capabilities.splice(0, db.capabilities.length, ...before, ...block(second), ...block(first), ...after)
  }
  return true
}

/**
 * Delete a capability. Links are moved to `replaceWith` (another capability id) or removed.
 * Level-1 domains can only be deleted when they have no sub-capabilities.
 */
export function deleteCapability (id, { replaceWith = null } = {}) {
  const cap = db.capabilities.find(c => c.id === id)
  if (!cap) throw new Error('Capability not found.')
  if (childrenOf(id).length) throw new Error('Move or delete its sub-capabilities first.')
  if (replaceWith && (replaceWith === id || !db.capabilities.some(c => c.id === replaceWith))) throw new Error('Invalid replacement capability.')
  const swap = list => uniq(list.map(x => (x === id ? replaceWith : x)).filter(Boolean))
  for (const a of db.applications) if (a.capabilityIds.includes(id)) a.capabilityIds = swap(a.capabilityIds)
  for (const p of db.projects) if (p.capabilityIds.includes(id)) p.capabilityIds = swap(p.capabilityIds)
  for (const i of db.investments) if (i.capabilityIds.includes(id)) i.capabilityIds = swap(i.capabilityIds)
  for (const v of db.valueStreams) for (const s of v.stages) if (s.capabilityIds.includes(id)) s.capabilityIds = swap(s.capabilityIds)
  // diagrams keep the shape but drop (or re-point) the repository link
  for (const d of db.diagrams.filter(d => d.nodes.some(n => n.refType === 'capability' && n.refId === id))) {
    saveDiagram({ ...d, nodes: d.nodes.map(n => (n.refType === 'capability' && n.refId === id ? { ...n, refId: replaceWith, refType: replaceWith ? 'capability' : null } : n)) })
  }
  db.capabilities.splice(db.capabilities.indexOf(cap), 1)
}

// ---- Editing applications, interfaces, data objects and technologies (active tenant)
const COLL_OF = { application: 'applications', interface: 'interfaces', data: 'dataObjects', technology: 'technologies' }
const PREFIX = { applications: 'A', interfaces: 'F', dataObjects: 'D', technologies: 'T' }
export const specFor = coll => SHEETS.find(s => s.collection === coll)

export function nextEntityId (coll) {
  const n = Math.max(0, ...db[coll].map(x => parseInt(String(x.id).replace(/^\D+/, ''), 10) || 0)) + 1
  return PREFIX[coll] + String(n).padStart(2, '0')
}

/** Default status per plateau for a new application, derived from its lifecycle. */
export const defaultRoadmap = lifecycle => ({
  Plan: [null, 'Planned', 'Active', 'Active'],
  Active: ['Active', 'Active', 'Active', 'Active'],
  'Phase-out': ['Phase-out', 'Phase-out', 'Retired', 'Retired'],
  Retired: ['Retired', 'Retired', 'Retired', 'Retired']
}[lifecycle] || ['Active', 'Active', 'Active', 'Active']).slice(0, db.plateaus.length)

export const ROADMAP_STATES = [null, 'Planned', 'Active', 'Phase-out', 'Retired']

/** Validate a document against the shared schema. Returns { field: message }. */
export function validateEntity (coll, doc, selfId = null) {
  const spec = specFor(coll)
  const errs = {}
  for (const f of spec.columns) {
    if (f.key === 'id') continue
    const v = doc[f.key]
    const empty = v == null || v === '' || (Array.isArray(v) && !v.length)
    if (empty) { if (f.required) errs[f.key] = 'Required.'; continue }
    if (f.type === 'enum' && !f.values.includes(v)) errs[f.key] = `Choose one of: ${f.values.join(', ')}.`
    if (f.type === 'int' || f.type === 'num') {
      if (typeof v !== 'number' || Number.isNaN(v)) errs[f.key] = 'Must be a number.'
      else if (f.type === 'int' && !Number.isInteger(v)) errs[f.key] = 'Must be a whole number.'
      else if (f.min != null && v < f.min) errs[f.key] = `Must be at least ${f.min}.`
      else if (f.max != null && v > f.max) errs[f.key] = `Must be at most ${f.max}.`
    }
    if (f.type === 'month' && !/^\d{4}-(0[1-9]|1[0-2])$/.test(v)) errs[f.key] = 'Use the format YYYY-MM.'
    if (f.type === 'ref' && !db[f.ref].some(x => x.id === v)) errs[f.key] = 'Unknown reference.'
    if (f.type === 'refs' && v.some(id => !db[f.ref].some(x => x.id === id))) errs[f.key] = 'Contains unknown references.'
  }
  if (!spec.noName && !errs.name && db[coll].some(x => x.id !== selfId && norm(x.name) === norm(doc.name))) errs.name = `"${String(doc.name).trim()}" already exists.`
  if (coll === 'interfaces') {
    if (doc.from && doc.from === doc.to) errs.to = 'Source and target must be different.'
    if (doc.via && (doc.via === doc.from || doc.via === doc.to)) errs.via = 'Middleware must differ from source and target.'
  }
  if (coll === 'dataObjects' && doc.crud) {
    for (const [app, acc] of Object.entries(doc.crud)) if (!/^C?R?U?D?$/.test(acc) || !acc) errs.crud = `Invalid access "${acc}" for ${nameOf('application', app)}.`
  }
  return errs
}

/** Create or update an object. Returns its id; throws with a readable message if invalid. */
export function saveEntity (coll, doc, { roadmap } = {}) {
  const isNew = !doc.id
  const id = doc.id || nextEntityId(coll)
  const clean = { ...doc, id }
  if (typeof clean.name === 'string') clean.name = clean.name.trim()
  const errs = validateEntity(coll, clean, isNew ? null : id)
  if (Object.keys(errs).length) throw Object.assign(new Error(Object.values(errs)[0]), { fields: errs })
  if (coll === 'dataObjects' && clean.masterAppId && !clean.crud?.[clean.masterAppId]) clean.crud = { ...clean.crud, [clean.masterAppId]: 'CRUD' }
  const i = db[coll].findIndex(x => x.id === id)
  if (i >= 0) db[coll][i] = clean; else db[coll].push(clean)
  if (coll === 'applications') db.appRoadmap[id] = (roadmap || db.appRoadmap[id] || defaultRoadmap(clean.lifecycle)).slice()
  return id
}

/** Everything that references an object (shown before deleting). */
export function entityUsage (type, id) {
  const dia = db.diagrams.filter(d => d.nodes.some(n => n.refType === type && n.refId === id))
  if (type === 'application') return {
    interfaces: db.interfaces.filter(f => [f.from, f.to, f.via].includes(id)),
    dataObjects: db.dataObjects.filter(d => d.crud[id] || d.masterAppId === id),
    mastered: db.dataObjects.filter(d => d.masterAppId === id),
    projects: db.projects.filter(p => p.impacts.some(x => x.appId === id)),
    investments: db.investments.filter(i => i.appIds.includes(id)),
    diagrams: dia
  }
  if (type === 'data') return { interfaces: db.interfaces.filter(f => f.dataIds.includes(id)), diagrams: dia }
  if (type === 'technology') return { applications: db.applications.filter(a => a.techIds.includes(id)), diagrams: dia }
  return { diagrams: dia }
}

function relinkDiagrams (type, id, replaceWith) {
  for (const d of db.diagrams.filter(d => d.nodes.some(n => n.refType === type && n.refId === id))) {
    saveDiagram({ ...d, nodes: d.nodes.map(n => (n.refType === type && n.refId === id ? { ...n, refId: replaceWith, refType: replaceWith ? type : null } : n)) })
  }
}

/**
 * Delete an object. With `replaceWith`, all links are moved to that object
 * (e.g. retire an application in favour of its successor); otherwise links are removed.
 */
export function deleteEntity (type, id, { replaceWith = null } = {}) {
  const coll = COLL_OF[type]
  const obj = db[coll].find(x => x.id === id)
  if (!obj) throw new Error('Not found.')
  if (replaceWith && (replaceWith === id || !db[coll].some(x => x.id === replaceWith))) throw new Error('Invalid replacement.')
  const swap = list => uniq(list.map(x => (x === id ? replaceWith : x)).filter(Boolean))

  if (type === 'application') {
    db.interfaces = db.interfaces
      .map(f => ({ ...f, from: f.from === id ? replaceWith : f.from, to: f.to === id ? replaceWith : f.to, via: f.via === id ? replaceWith : f.via }))
      .filter(f => f.from && f.to && f.from !== f.to)            // interfaces lose their endpoint → removed
      .map(f => (f.via === f.from || f.via === f.to ? { ...f, via: null } : f))
    for (const d of db.dataObjects) {
      if (d.crud[id]) {
        const crud = { ...d.crud }; const acc = crud[id]; delete crud[id]
        if (replaceWith) crud[replaceWith] = [...new Set((crud[replaceWith] || '') + acc)].filter(ch => 'CRUD'.includes(ch)).sort((a, b) => 'CRUD'.indexOf(a) - 'CRUD'.indexOf(b)).join('')
        d.crud = crud
      }
      if (d.masterAppId === id) d.masterAppId = replaceWith
    }
    for (const p of db.projects) {
      if (!p.impacts.some(x => x.appId === id)) continue
      const seen = new Set()
      p.impacts = p.impacts.map(x => (x.appId === id ? { ...x, appId: replaceWith } : x)).filter(x => x.appId && !seen.has(x.appId) && seen.add(x.appId))
    }
    for (const i of db.investments) if (i.appIds.includes(id)) i.appIds = swap(i.appIds)
    delete db.appRoadmap[id]
  }
  if (type === 'data') for (const f of db.interfaces) if (f.dataIds.includes(id)) f.dataIds = swap(f.dataIds)
  if (type === 'technology') for (const a of db.applications) if (a.techIds.includes(id)) a.techIds = swap(a.techIds)
  if (type !== 'interface') relinkDiagrams(type, id, replaceWith)
  db[coll] = db[coll].filter(x => x.id !== id)
}

// ---- Value streams (active tenant)
/** Returns { field: message } – empty when valid. Stage errors use keys `stage-<index>`. */
export function validateValueStream (vs, selfId = null) {
  const errs = {}
  if (!String(vs.name ?? '').trim()) errs.name = 'Required.'
  else if (db.valueStreams.some(v => v.id !== selfId && norm(v.name) === norm(vs.name))) errs.name = `"${vs.name.trim()}" already exists.`
  if (!vs.stages?.length) errs.stages = 'Add at least one stage.'
  const seen = new Set()
  ;(vs.stages || []).forEach((s, i) => {
    const n = norm(s.name)
    if (!n) errs[`stage-${i}`] = 'Stage name is required.'
    else if (seen.has(n)) errs[`stage-${i}`] = 'Stage names must be unique.'
    seen.add(n)
    if ((s.capabilityIds || []).some(id => !db.capabilities.some(c => c.id === id))) errs[`stage-${i}`] = 'Unknown capability.'
  })
  return errs
}

export function saveValueStream (vs) {
  const isNew = !vs.id
  let id = vs.id
  if (isNew) { let n = 1; while (db.valueStreams.some(v => v.id === `VS${n}`)) n++; id = `VS${n}` }
  const clean = {
    id,
    name: String(vs.name).trim(),
    stakeholder: String(vs.stakeholder ?? '').trim(),
    stages: vs.stages.map(s => ({ name: String(s.name).trim(), capabilityIds: uniq(s.capabilityIds || []) }))
  }
  const errs = validateValueStream(clean, isNew ? null : id)
  if (Object.keys(errs).length) throw Object.assign(new Error(Object.values(errs)[0]), { fields: errs })
  const i = db.valueStreams.findIndex(v => v.id === id)
  if (i >= 0) db.valueStreams[i] = clean; else db.valueStreams.push(clean)
  return id
}

export function deleteValueStream (id) {
  if (!db.valueStreams.some(v => v.id === id)) throw new Error('Value stream not found.')
  db.valueStreams = db.valueStreams.filter(v => v.id !== id)
}
