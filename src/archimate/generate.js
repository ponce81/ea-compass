// Generate ArchiMate views from the repository.
import { db, get, childrenOf, appsForCap, dataForApp, techForApp, interfacesForApp, uniq } from '../store'
import { REPO_TYPE } from './notation'

const W = 170, H = 64, GAP = 30, PER_ROW = 5
let seq = 0
const uid = p => `${p}${Date.now().toString(36)}${(seq++).toString(36)}`

function builder () {
  const nodes = []; const edges = []; const byRef = {}
  const node = (atype, name, x, y, ref = {}, size = {}) => {
    const key = ref.refType ? `${ref.refType}:${ref.refId}` : null
    if (key && byRef[key]) return byRef[key]
    const n = { id: uid('n'), atype, name, doc: '', x, y, w: size.w || W, h: size.h || H, ...ref }
    nodes.push(n); if (key) byRef[key] = n
    return n
  }
  const edge = (a, b, rel) => { if (a && b && a !== b) edges.push({ id: uid('e'), source: a.id, target: b.id, rel }) }
  const row = (items, y, totalWidth) => {
    const w = items.length * W + (items.length - 1) * GAP
    const x0 = Math.max(0, (totalWidth - w) / 2)
    return items.map((it, i) => ({ ...it, x: x0 + i * (W + GAP), y }))
  }
  // rows wrapped at `per` items; returns placed items and the next free y
  const rows = (items, y, totalWidth, per = PER_ROW) => {
    const placed = []
    for (let i = 0; i < items.length; i += per) placed.push(...row(items.slice(i, i + per), y + (i / per) * (H + 26), totalWidth))
    return { placed, nextY: y + Math.ceil(items.length / per) * (H + 26) }
  }
  return { nodes, edges, node, edge, row, rows }
}

/** Layered view: capabilities ← application → data, technology below, connected apps beside. */
export function layeredAppView (appId) {
  const app = get('application', appId)
  const b = builder()
  const caps = app.capabilityIds.map(id => get('capability', id)).filter(Boolean)
  const data = dataForApp(appId)
  const techs = techForApp(app)
  const ifs = interfacesForApp(appId).filter(i => i.from === appId || i.to === appId)
  const upstream = uniq(ifs.filter(i => i.to === appId).map(i => i.from))
  const downstream = uniq(ifs.filter(i => i.from === appId).map(i => i.to)).filter(id => !upstream.includes(id))
  const total = PER_ROW * (W + GAP) - GAP
  const SIDE = W + 90 // columns for connected applications left/right of the core

  const capR = b.rows(caps, 0, total)
  const capRow = capR.placed.map(c => b.node('Capability', c.name, c.x + SIDE, c.y, { refType: 'capability', refId: c.id }))
  const appY = capR.nextY + 50
  const self = b.node('ApplicationComponent', app.name, SIDE + total / 2 - W / 2, appY, { refType: 'application', refId: appId }, { h: 74 })
  const sideCol = (ids, x) => ids.map((id, i) => b.node('ApplicationComponent', get('application', id).name, x, appY + (i - (ids.length - 1) / 2) * (H + 16), { refType: 'application', refId: id }))
  const ups = sideCol(upstream, 0)
  const downs = sideCol(downstream, SIDE * 2 + total - W)
  const sideBottom = appY + Math.max(upstream.length, downstream.length, 1) / 2 * (H + 16) + H
  const dataR = b.rows(data, Math.max(appY + 150, sideBottom + 30), total)
  const dataRow = dataR.placed.map(d => b.node('DataObject', d.name, d.x + SIDE, d.y, { refType: 'data', refId: d.id }))
  const techRow = b.rows(techs, dataR.nextY + 60, total).placed.map(t => b.node(REPO_TYPE.technology(t), t.name, t.x + SIDE, t.y, { refType: 'technology', refId: t.id }))

  capRow.forEach(c => b.edge(self, c, 'realization'))
  ups.forEach(n => b.edge(n, self, 'flow'))
  downs.forEach(n => b.edge(self, n, 'flow'))
  dataRow.forEach(d => b.edge(self, d, 'access'))
  techRow.forEach(t => b.edge(t, self, 'serving'))
  return { id: uid('d'), name: `Layered view – ${app.name}`, viewpoint: 'Layered', nodes: b.nodes, edges: b.edges }
}

/** Capability realization view: L1 capability composed of L2 capabilities, realized by applications. */
export function capabilityView (l1Id) {
  const l1 = get('capability', l1Id)
  const b = builder()
  const l2 = childrenOf(l1Id)
  const apps = uniq(l2.flatMap(c => appsForCap(c.id).filter(a => a.lifecycle !== 'Retired').map(a => a.id))).map(id => get('application', id))
  const total = Math.min(PER_ROW, Math.max(l2.length, apps.length)) * (W + GAP) - GAP
  const top = b.node('Capability', l1.name, Math.max(0, total / 2 - W / 2), 0, { refType: 'capability', refId: l1.id })
  const capR = b.rows(l2, 150, total)
  const caps = capR.placed.map(c => b.node('Capability', c.name, c.x, c.y, { refType: 'capability', refId: c.id }))
  const appNodes = b.rows(apps, capR.nextY + 90, total).placed.map(a => b.node('ApplicationComponent', a.name, a.x, a.y, { refType: 'application', refId: a.id }))
  caps.forEach(c => b.edge(top, c, 'composition'))
  appNodes.forEach(an => {
    const a = get('application', an.refId)
    caps.filter(c => a.capabilityIds.includes(c.refId)).forEach(c => b.edge(an, c, 'realization'))
  })
  return { id: uid('d'), name: `Capability realization – ${l1.name}`, viewpoint: 'Capability Map', nodes: b.nodes, edges: b.edges }
}

/** Migration view: project as work package, deliverables per impacted app, baseline and target plateaus. */
export function migrationView (projectId) {
  const p = get('project', projectId)
  const b = builder()
  const imp = p.impacts.map(i => ({ ...i, app: get('application', i.appId) })).filter(i => i.app)
  const total = Math.max(imp.length, 3) * (W + GAP)
  const wp = b.node('WorkPackage', p.name, Math.max(0, total / 2 - W / 2), 0, { refType: 'project', refId: p.id })
  const dels = b.row(imp, 170, total).map(i => ({ ...i, d: b.node('Deliverable', `${i.change}: ${i.app.name}`, i.x, i.y) }))
  const appNodes = b.row(imp, 340, total).map(i => ({ ...i, n: b.node('ApplicationComponent', i.app.name, i.x, i.y, { refType: 'application', refId: i.app.id }) }))
  const base = b.node('Plateau', `${db.plateaus[0].name} (${db.plateaus[0].date})`, 0, 520, { refType: 'plateau', refId: db.plateaus[0].id }, { w: Math.max(W, total / 2 - GAP) })
  const tgt = b.node('Plateau', `${db.plateaus.at(-1).name} (${db.plateaus.at(-1).date})`, total / 2, 520, { refType: 'plateau', refId: db.plateaus.at(-1).id }, { w: Math.max(W, total / 2 - GAP) })
  b.edge(base, tgt, 'triggering')
  dels.forEach(x => b.edge(wp, x.d, 'realization'))
  appNodes.forEach((x, i) => {
    if (x.change !== 'Retire') b.edge(dels[i].d, x.n, 'realization')
    else b.edge(dels[i].d, x.n, 'association')
    if (x.change !== 'Introduce') b.edge(base, x.n, 'aggregation')
    if (x.change !== 'Retire') b.edge(tgt, x.n, 'aggregation')
  })
  return { id: uid('d'), name: `Migration view – ${p.name}`, viewpoint: 'Migration', nodes: b.nodes, edges: b.edges }
}
