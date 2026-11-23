// ---------------------------------------------------------------------------
// Architecture states: one ArchiMate view per plateau (baseline, transitions,
// target) plus a migration overview – built from the repository roadmap.
// Elements are shared across views (one model, many views).
// ---------------------------------------------------------------------------
import { db, appState, isLive, l1Caps, childrenOf } from '../store'
import { fmtMonth, money } from '../utils/format'
import { titleLines, titleFont } from './textfit'

/** Status of an application in plateau i (relative to plateau i-1). */
export function appStatus (appId, i) {
  const s = appState(appId, i)
  const prev = i > 0 ? appState(appId, i - 1) : s
  if (isLive(s)) {
    if (i > 0 && !isLive(prev)) return 'new'
    return s === 'Phase-out' ? 'phaseout' : 'active'
  }
  if (s === 'Planned') return 'planned'
  if (i > 0 && isLive(prev)) return 'removed'
  return null
}

export const STATUS_LABEL = { new: 'NEW', phaseout: 'PHASE-OUT', planned: 'IN IMPLEMENTATION', removed: 'RETIRED', active: '' }

// `appIds` (a Set) limits figures to the applications in scope; null = all applications
const inScope = appIds => db.applications.filter(a => !appIds || appIds.has(a.id))
const runCost = (apps, i) => apps.filter(a => isLive(appState(a.id, i))).reduce((s, a) => s + a.annualCost, 0)

/** Changes between consecutive plateaus. */
export function transitions (appIds = null) {
  const apps = inScope(appIds)
  return db.plateaus.slice(1).map((p, k) => {
    const i = k + 1
    const live = (a, j) => isLive(appState(a.id, j))
    const introduced = apps.filter(a => live(a, i) && !live(a, i - 1))
    const retired = apps.filter(a => live(a, i - 1) && !live(a, i))
    const phaseOut = apps.filter(a => appState(a.id, i) === 'Phase-out' && appState(a.id, i - 1) !== 'Phase-out')
    return { from: db.plateaus[i - 1], to: p, i, introduced, retired, phaseOut, runFrom: runCost(apps, i - 1), runTo: runCost(apps, i) }
  })
}

export function plateauSummary (i, appIds = null) {
  const apps = inScope(appIds)
  return { apps: apps.filter(a => isLive(appState(a.id, i))).length, runCost: runCost(apps, i), planned: apps.filter(a => appState(a.id, i) === 'Planned').length }
}

/** Plateau a project delivers into: first plateau whose date is on/after the project end. */
export const plateauOfProject = p => {
  const i = db.plateaus.findIndex(pl => pl.date >= p.end)
  return i < 0 ? db.plateaus.length - 1 : i
}

export function buildStatesModel ({ l1Ids = [], onlyChanges = false, showRemoved = true } = {}) {
  const elements = new Map()
  const relationships = new Map()
  const el = (key, type, name, extra = {}) => {
    if (!elements.has(key)) elements.set(key, { id: key, type, name, doc: '', ...extra })
    return key
  }
  const rel = (rtype, s, t, name = '') => {
    const key = `r-${rtype}-${s}-${t}`
    if (!relationships.has(key)) relationships.set(key, { id: key, rel: rtype, source: s, target: t, name })
    return key
  }
  const roadmapChanges = a => new Set(db.appRoadmap[a.id] || []).size > 1
  const appsFor = capId => db.applications.filter(a => a.capabilityIds.includes(capId))

  // scope: capability domains (L1) and their L2 capabilities
  const scope = l1Caps()
    .filter(c => !l1Ids.length || l1Ids.includes(c.id))
    .map(l1 => ({ l1, l2: childrenOf(l1.id).filter(c => !onlyChanges || appsFor(c.id).some(roadmapChanges)) }))
    .filter(s => s.l2.length)

  // the scope also limits the overview, the figures and the projects shown
  const restricted = l1Ids.length > 0 || onlyChanges
  const scopeCapIds = new Set(scope.flatMap(s => [s.l1.id, ...s.l2.map(c => c.id)]))
  const scopeApps = restricted ? new Set(db.applications.filter(a => a.capabilityIds.some(c => scopeCapIds.has(c))).map(a => a.id)) : null
  const scopeLabel = restricted ? `${l1Ids.length ? scope.map(s => s.l1.name).join(', ') || 'none' : 'All domains'}${onlyChanges ? ' – changing capabilities only' : ''}` : null
  const inScopeProject = p => !restricted || p.capabilityIds.some(c => scopeCapIds.has(c)) || p.impacts.some(x => scopeApps.has(x.appId))

  const plateauEl = db.plateaus.map(p => el(`plateau-${p.id}`, 'Plateau', `${p.name} (${fmtMonth(p.date)})`, { doc: p.description, ref: { refType: 'plateau', refId: p.id } }))
  const views = []

  // ---------------------------------------------------------- overview view
  {
    const PW = 230, PH = 64, GX = 150, M = 20
    const nodes = []; const connections = []
    const px = i => M + i * (PW + GX)
    const pNodes = db.plateaus.map((p, i) => {
      const n = { id: `ov-p-${p.id}`, el: plateauEl[i], x: px(i), y: M, w: PW, h: PH, sub: `${plateauSummary(i, scopeApps).apps} applications · ${money(plateauSummary(i, scopeApps).runCost)}/yr` }
      nodes.push(n); return n
    })
    for (let i = 1; i < pNodes.length; i++) {
      connections.push({ id: `ov-c-trig-${i}`, rel: rel('triggering', plateauEl[i - 1], plateauEl[i]), source: pNodes[i - 1].id, target: pNodes[i].id })
    }
    transitions(scopeApps).forEach(t => {
      const gapEl = el(`gap-${t.from.id}-${t.to.id}`, 'Gap', `Gap: ${t.from.name} → ${t.to.name}`, {
        doc: [
          t.introduced.length ? `Introduced: ${t.introduced.map(a => a.name).join(', ')}` : '',
          t.retired.length ? `Retired: ${t.retired.map(a => a.name).join(', ')}` : '',
          t.phaseOut.length ? `Phase-out started: ${t.phaseOut.map(a => a.name).join(', ')}` : ''
        ].filter(Boolean).join('\n')
      })
      const cx = px(t.i) - GX / 2
      const g = { id: `ov-g-${t.to.id}`, el: gapEl, x: cx - 68, y: M + PH + 46, w: 136, h: 74, sub: `+${t.introduced.length} new · −${t.retired.length} retired` }
      nodes.push(g)
      connections.push({ id: `ov-c-g1-${t.i}`, rel: rel('association', gapEl, plateauEl[t.i - 1]), source: g.id, target: pNodes[t.i - 1].id })
      connections.push({ id: `ov-c-g2-${t.i}`, rel: rel('association', gapEl, plateauEl[t.i]), source: g.id, target: pNodes[t.i].id })
    })
    // projects deliver into plateaus (stacked under the plateau, joined by a rail)
    const startY = M + PH + 46 + 74 + 40
    const stacks = db.plateaus.map(() => 0)
    for (const p of db.projects.filter(inScopeProject).sort((a, b) => a.end.localeCompare(b.end))) {
      const i = plateauOfProject(p)
      const k = stacks[i]++
      const wpEl = el(`wp-${p.id}`, 'WorkPackage', p.name, { doc: `${p.phase} · ${fmtMonth(p.start)} – ${fmtMonth(p.end)} · ${money(p.budget)}`, ref: { refType: 'project', refId: p.id } })
      const n = { id: `ov-wp-${p.id}`, el: wpEl, x: px(i) + 26, y: startY + k * 66, w: PW - 26, h: 56, sub: `${fmtMonth(p.end)} · ${p.phase}`, dashed: p.phase === 'Idea' }
      nodes.push(n)
      connections.push({ id: `ov-c-wp-${p.id}`, rel: rel('association', wpEl, plateauEl[i], 'delivers'), source: n.id, target: pNodes[i].id, rail: px(i) + 12 })
    }
    const height = Math.max(startY + Math.max(1, ...stacks) * 66, startY) + M
    views.push({ id: 'view-overview', name: 'Migration overview', kind: 'overview', width: px(db.plateaus.length - 1) + PW + M, height, nodes, connections })
  }

  // ---------------------------------------------------------- plateau views
  const cols = scope.length <= 3 ? 2 : 1
  const AW = 156, AH = 40, G = 8, PAD = 10, HL2 = 32, HL1 = 42, HP = 64, M = 16
  const L2W = cols * AW + (cols - 1) * G + 2 * PAD
  const L1W = L2W + 24
  const order = { new: 0, active: 1, phaseout: 2, planned: 3, removed: 4 }

  db.plateaus.forEach((p, i) => {
    const nodes = []
    const root = { id: `v${i}-plateau`, el: plateauEl[i], x: 0, y: 0, w: 0, h: 0, container: true, depth: 0 }
    nodes.push(root)
    let x = M; let maxBottom = 0
    for (const { l1, l2 } of scope) {
      const l1El = el(`cap-${l1.id}`, 'Capability', l1.name, { ref: { refType: 'capability', refId: l1.id } })
      rel('aggregation', plateauEl[i], l1El)
      const n1 = { id: `v${i}-${l1.id}`, el: l1El, parent: root.id, x, y: HP, w: L1W, h: 0, container: true, depth: 1 }
      nodes.push(n1)
      let y = HP + HL1 + (titleLines(l1.name, L1W, 1).length - 1) * (titleFont(1) + 3)
      for (const c of l2) {
        const l2El = el(`cap-${c.id}`, 'Capability', c.name, { ref: { refType: 'capability', refId: c.id } })
        rel('composition', l1El, l2El)
        const items = appsFor(c.id)
          .map(a => ({ a, st: appStatus(a.id, i) }))
          .filter(x => x.st && (showRemoved || x.st !== 'removed'))
          .sort((u, v) => order[u.st] - order[v.st] || u.a.name.localeCompare(v.a.name))
        const rows = Math.ceil(items.length / cols)
        const hl2 = HL2 + (titleLines(c.name, L2W, 2).length - 1) * (titleFont(2) + 3)
        const h = items.length ? hl2 + rows * (AH + G) - G + PAD : hl2 + 26
        const n2 = { id: `v${i}-${c.id}`, el: l2El, parent: n1.id, x: x + 12, y, w: L2W, h, container: true, depth: 2, empty: !items.length }
        nodes.push(n2)
        items.forEach(({ a, st }, k) => {
          const aEl = el(`app-${a.id}`, 'ApplicationComponent', a.name, { doc: a.description, ref: { refType: 'application', refId: a.id } })
          rel('realization', aEl, l2El)
          if (st !== 'removed' && st !== 'planned') rel('aggregation', plateauEl[i], aEl)
          nodes.push({ id: `v${i}-${c.id}-${a.id}`, el: aEl, parent: n2.id, x: n2.x + PAD + (k % cols) * (AW + G), y: y + hl2 + Math.floor(k / cols) * (AH + G), w: AW, h: AH, status: st, depth: 3, ghost: st === 'removed' })
        })
        y += h + 10
      }
      n1.h = y - HP
      maxBottom = Math.max(maxBottom, y)
      x += L1W + M
    }
    root.w = Math.max(x, 420); root.h = maxBottom + M
    const sum = plateauSummary(i, scopeApps)
    const t = i > 0 ? transitions(scopeApps)[i - 1] : null
    root.sub = `${sum.apps} live applications · run cost ${money(sum.runCost)}/yr` + (t ? ` · +${t.introduced.length} new · −${t.retired.length} retired since ${t.from.name}` : '')
    views.push({ id: `view-${p.id}`, name: `${p.name} architecture (${fmtMonth(p.date)})`, kind: 'plateau', plateauIdx: i, width: root.w, height: root.h, nodes, connections: [] })
  })

  return {
    name: `${db.company.name} – Architecture states`,
    elements: [...elements.values()],
    relationships: [...relationships.values()],
    views,
    scopeEmpty: !scope.length,
    scope: { label: scopeLabel, appIds: scopeApps }
  }
}

/** CSV of all changes between plateaus. */
export function changesCsv (appIds = null) {
  const esc = v => `"${String(v ?? '').replace(/"/g, '""')}"`
  const capName = id => db.capabilities.find(c => c.id === id)?.name ?? id
  const rows = [['From plateau', 'To plateau', 'Change', 'Application', 'Capabilities', `Annual cost (${db.company.currency})`, 'Projects']]
  for (const t of transitions(appIds)) {
    const add = (change, a) => rows.push([t.from.name, t.to.name, change, a.name, a.capabilityIds.map(capName).join('; '), a.annualCost, db.projects.filter(p => p.impacts.some(x => x.appId === a.id)).map(p => p.name).join('; ')])
    t.introduced.forEach(a => add('Introduced', a))
    t.phaseOut.forEach(a => add('Phase-out started', a))
    t.retired.forEach(a => add('Retired', a))
  }
  return rows.map(r => r.map(esc).join(',')).join('\r\n')
}

/** Convert the views into editable ArchiMate Modeler diagrams (nesting kept, retired placeholders dropped). */
export function modelToDiagrams (model) {
  const els = Object.fromEntries(model.elements.map(e => [e.id, e]))
  const rels = Object.fromEntries(model.relationships.map(r => [r.id, r]))
  const stamp = Date.now().toString(36)
  return model.views.map(v => ({
    id: `d-states-${v.id}-${stamp}`,
    name: `States · ${v.name}`,
    viewpoint: v.kind === 'overview' ? 'Migration' : 'Plateau',
    nodes: v.nodes.filter(n => !n.ghost).map(n => {
      const e = els[n.el]
      return { id: n.id, atype: e.type, name: e.name, doc: e.doc, refType: e.ref?.refType || null, refId: e.ref?.refId || null, parent: n.parent || null, container: !!n.container, status: n.status && n.status !== 'active' ? n.status : null, x: n.x, y: n.y, w: n.w, h: n.h }
    }),
    edges: v.connections.map(c => ({ id: c.id, source: c.source, target: c.target, rel: rels[c.rel].rel, name: rels[c.rel].name || '' }))
  }))
}
