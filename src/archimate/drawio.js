// ---------------------------------------------------------------------------
// draw.io (diagrams.net) export – uses draw.io's built-in ArchiMate 3 shapes
// (mxgraph.archimate3.*), one page per view, real nesting via containers.
// Style strings follow draw.io's ArchiMate 3 sidebar.
// ---------------------------------------------------------------------------
import { ELEMENTS, RELATIONS, fillOf, strokeOf } from './notation'
import { STATUS_LABEL } from './states'

// ArchiMate type -> [appType, archiType] of shape=mxgraph.archimate3.application
const SHAPE = {
  Resource: ['resource', 'square'], Capability: ['capability', 'rounded'], ValueStream: ['valueStream', 'rounded'], CourseOfAction: ['course', 'rounded'],
  BusinessActor: ['actor', 'square'], BusinessRole: ['role', 'square'], BusinessCollaboration: ['collab', 'square'], BusinessInterface: ['interface', 'square'],
  BusinessProcess: ['proc', 'rounded'], BusinessFunction: ['func', 'rounded'], BusinessInteraction: ['interaction', 'rounded'], BusinessEvent: ['event', 'rounded'],
  BusinessService: ['serv', 'rounded'], BusinessObject: ['passive', 'square'], Contract: ['contract', 'square'], Product: ['product', 'square'],
  ApplicationComponent: ['comp', 'square'], ApplicationCollaboration: ['collab', 'square'], ApplicationInterface: ['interface', 'square'],
  ApplicationFunction: ['func', 'rounded'], ApplicationProcess: ['proc', 'rounded'], ApplicationEvent: ['event', 'rounded'], ApplicationService: ['serv', 'rounded'], DataObject: ['passive', 'square'],
  Node: ['node', 'square'], Device: ['device', null], SystemSoftware: ['sysSw', 'square'], TechnologyInterface: ['interface', 'square'], CommunicationNetwork: ['netw', 'square'],
  TechnologyFunction: ['func', 'rounded'], TechnologyProcess: ['proc', 'rounded'], TechnologyService: ['serv', 'rounded'], Artifact: ['artifact', 'square'],
  Stakeholder: ['role', 'oct'], Driver: ['driver', 'oct'], Assessment: ['assess', 'oct'], Goal: ['goal', 'oct'], Outcome: ['outcome', 'oct'], Principle: ['principle', 'oct'],
  Requirement: ['requirement', 'oct'], Constraint: ['constraint', 'oct'], Meaning: ['meaning', 'oct'], Value: ['amValue', 'oct'],
  WorkPackage: ['workPackage', 'rounded'], Deliverable: ['deliverable', null], ImplementationEvent: ['event', 'rounded'], Plateau: ['plateau', null], Gap: ['gap', null],
  Grouping: ['grouping', 'square'], Location: ['location', 'square']
}

const EDGE = {
  composition: 'html=1;startArrow=diamondThin;startFill=1;startSize=10;endArrow=none;endFill=0;',
  aggregation: 'html=1;startArrow=diamondThin;startFill=0;startSize=10;endArrow=none;endFill=0;',
  assignment: 'html=1;endArrow=block;endFill=1;startArrow=oval;startFill=1;',
  realization: 'html=1;endArrow=block;endFill=0;dashed=1;',
  serving: 'html=1;endArrow=open;endFill=1;',
  access: 'html=1;endArrow=open;endFill=0;dashed=1;dashPattern=1 4;',
  influence: 'html=1;endArrow=open;endFill=0;dashed=1;dashPattern=6 4;',
  triggering: 'html=1;endArrow=block;dashed=0;endFill=1;',
  flow: 'html=1;endArrow=block;dashed=1;endFill=1;dashPattern=6 4;',
  specialization: 'html=1;endArrow=block;endFill=0;',
  association: 'html=1;endArrow=none;'
}

const STATUS = {
  new: { stroke: '#16a34a', width: 2.5, badge: '#16a34a' },
  phaseout: { stroke: '#d97706', width: 2, dashed: true, badge: '#d97706' },
  planned: { stroke: '#2563eb', width: 1.5, dashed: true, badge: '#2563eb', opacity: 60 },
  removed: { stroke: '#dc2626', width: 1.5, dashed: true, badge: '#dc2626', fill: '#fef2f2', font: '#991b1b' }
}
const HANDLE = { Top: [0.5, 0], Right: [1, 0.5], Bottom: [0.5, 1], Left: [0, 0.5] }

const xml = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/\n/g, '&#10;')
const html = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const cid = (page, id) => `p${page}-${String(id).replace(/[^A-Za-z0-9_.-]/g, '_')}`

function vertexStyle (n) {
  const [appType, archiType] = SHAPE[n.type] || ['generic', 'square']
  const st = n.status && n.status !== 'active' ? STATUS[n.status] : null
  const parts = ['html=1', 'outlineConnect=0', 'whiteSpace=wrap', 'shape=mxgraph.archimate3.application', `appType=${appType}`]
  if (archiType) parts.push(`archiType=${archiType}`)
  parts.push(`fillColor=${n.type === 'Grouping' ? 'none' : st?.fill || fillOf(n.type)}`, `strokeColor=${st?.stroke || strokeOf(n.type)}`, 'fontColor=' + (st?.font || '#000000'))
  if (st) parts.push(`strokeWidth=${st.width}`)
  if (st?.dashed || n.dashed || n.type === 'Grouping') parts.push('dashed=1')
  if (st?.opacity) parts.push(`opacity=${st.opacity}`)
  if (n.container) {
    const fs = n.depth === 0 ? 16 : n.depth === 1 ? 13 : 12
    parts.push('container=1', 'collapsible=0', 'verticalAlign=top', 'align=left', 'spacingLeft=8', 'spacingTop=4', 'spacingRight=24', `fontSize=${fs}`)
  } else parts.push('fontSize=11', 'spacingRight=14')
  return parts.join(';') + ';'
}

function vertexLabel (n) {
  const st = n.status && n.status !== 'active' ? STATUS[n.status] : null
  const badge = st && STATUS_LABEL[n.status] ? `<span style="background:${st.badge};color:#ffffff;font-size:8px;font-weight:bold;padding:0 3px;">${STATUS_LABEL[n.status]}</span><br>` : ''
  const name = n.status === 'removed' ? `<s>${html(n.name)}</s>` : html(n.name)
  const title = n.container ? `<b>${name}</b>` : name
  const sub = n.sub ? `<br><span style="font-size:${n.container ? 11 : 10}px;color:#475569;">${html(n.sub)}</span>` : ''
  const empty = n.empty ? '<br><i style="font-size:10px;color:#b91c1c;">No IT support</i>' : ''
  return badge + title + sub + empty
}

function pageXml (page, pi) {
  const OX = 20; const OY = page.title ? 60 : 20
  const byId = Object.fromEntries(page.nodes.map(n => [n.id, n]))
  const cells = []
  if (page.title) cells.push(`<mxCell id="${cid(pi, '_title')}" value="${xml(`<b>${html(page.title)}</b>`)}" style="text;html=1;fontSize=18;align=left;verticalAlign=middle;" vertex="1" parent="1"><mxGeometry x="${OX}" y="16" width="900" height="30" as="geometry"/></mxCell>`)

  for (const n of page.nodes) {
    const p = n.parent && byId[n.parent]
    const x = p ? n.x - p.x : n.x + OX
    const y = p ? n.y - p.y : n.y + OY
    const attrs = [`label="${xml(vertexLabel(n))}"`, `archimate="${n.type}"`, `id="${cid(pi, n.id)}"`]
    if (n.ref?.refId) attrs.push(`repository="${xml(`${n.ref.refType}:${n.ref.refId}`)}"`)
    if (n.doc) attrs.push(`tooltip="${xml(n.doc)}"`)
    cells.push(`<UserObject ${attrs.join(' ')}><mxCell style="${vertexStyle(n)}" vertex="1" parent="${p ? cid(pi, p.id) : '1'}"><mxGeometry x="${Math.round(x)}" y="${Math.round(y)}" width="${Math.round(n.w)}" height="${Math.round(n.h)}" as="geometry"/></mxCell></UserObject>`)
  }

  for (const e of page.edges) {
    let style = EDGE[e.rel] || EDGE.association
    const s = byId[e.source]; const t = byId[e.target]
    if (e.rail != null) {
      style += `edgeStyle=none;exitX=0;exitY=0.5;exitDx=0;exitDy=0;entryX=${((e.rail - t.x) / t.w).toFixed(4)};entryY=1;entryDx=0;entryDy=0;`
    } else if (e.sourceHandle && e.targetHandle) {
      const [ex, ey] = HANDLE[e.sourceHandle]; const [nx, ny] = HANDLE[e.targetHandle]
      style += `edgeStyle=orthogonalEdgeStyle;rounded=0;exitX=${ex};exitY=${ey};exitDx=0;exitDy=0;entryX=${nx};entryY=${ny};entryDx=0;entryDy=0;`
    } else style += 'edgeStyle=none;'
    style += 'strokeColor=#475569;'
    const pts = e.rail != null ? `<Array as="points"><mxPoint x="${Math.round(e.rail + OX)}" y="${Math.round(s.y + s.h / 2 + OY)}"/></Array>` : ''
    // rail connectors share one vertical line – their labels would pile up, so leave them unlabeled
    cells.push(`<mxCell id="${cid(pi, 'e-' + e.id)}" value="${xml(e.rail != null ? '' : e.name || '')}" style="${style}" edge="1" parent="1" source="${cid(pi, e.source)}" target="${cid(pi, e.target)}"><mxGeometry relative="1" as="geometry">${pts}</mxGeometry></mxCell>`)
  }

  const bottom = Math.max(0, ...page.nodes.filter(n => !n.parent).map(n => n.y + n.h)) + OY
  if (page.legend) {
    let lx = OX
    for (const k of ['new', 'phaseout', 'planned', 'removed']) {
      const st = STATUS[k]; const label = { new: 'New since previous plateau', phaseout: 'Phase-out', planned: 'In implementation', removed: 'Retired since previous plateau' }[k]
      cells.push(`<mxCell id="${cid(pi, '_leg-' + k)}" value="" style="rounded=0;html=1;fillColor=${st.fill || '#b5ffff'};strokeColor=${st.stroke};strokeWidth=${st.width};${st.dashed ? 'dashed=1;' : ''}" vertex="1" parent="1"><mxGeometry x="${lx}" y="${bottom + 24}" width="24" height="14" as="geometry"/></mxCell>`)
      cells.push(`<mxCell id="${cid(pi, '_legt-' + k)}" value="${xml(label)}" style="text;html=1;fontSize=11;align=left;verticalAlign=middle;" vertex="1" parent="1"><mxGeometry x="${lx + 30}" y="${bottom + 20}" width="${label.length * 6.5 + 10}" height="22" as="geometry"/></mxCell>`)
      lx += 50 + label.length * 6.5
    }
  }
  if (page.footer) cells.push(`<mxCell id="${cid(pi, '_footer')}" value="${xml(page.footer)}" style="text;html=1;fontSize=10;fontColor=#94a3b8;align=left;" vertex="1" parent="1"><mxGeometry x="${OX}" y="${bottom + (page.legend ? 52 : 20)}" width="600" height="20" as="geometry"/></mxCell>`)

  return `  <diagram id="${cid(pi, 'page')}" name="${xml(page.name.slice(0, 80))}">
    <mxGraphModel dx="1400" dy="900" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="0" pageScale="1" math="0" shadow="0">
      <root>
        <mxCell id="0"/>
        <mxCell id="1" parent="0"/>
        ${cells.join('\n        ')}
      </root>
    </mxGraphModel>
  </diagram>`
}

/** Build a .drawio file (mxfile, uncompressed) from pages. */
export function toDrawio (pages) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<mxfile host="EA Compass" modified="${new Date().toISOString()}" agent="EA Compass" type="device">
${pages.map(pageXml).join('\n')}
</mxfile>
`
}

/** Pages for the transition views (one per view). */
export function statesToDrawioPages (model, { showStatus = true, company = '', date = '' } = {}) {
  const scope = model.scope?.label ? ` · Scope: ${model.scope.label}` : ''
  const els = Object.fromEntries(model.elements.map(e => [e.id, e]))
  const rels = Object.fromEntries(model.relationships.map(r => [r.id, r]))
  return model.views.map(v => ({
    name: v.kind === 'overview' ? 'Migration overview' : v.name.replace(/ architecture/, ''),
    title: (v.kind === 'overview' ? `Migration overview – ${company}` : `${company} – ${v.name}`) + scope,
    footer: `${company} · ${v.name} · EA Compass · ${date}`,
    legend: v.kind === 'plateau' && showStatus,
    nodes: v.nodes.filter(n => showStatus || !n.ghost).map(n => {
      const e = els[n.el]
      return { id: n.id, type: e.type, name: e.name, doc: e.doc, ref: e.ref, x: n.x, y: n.y, w: n.w, h: n.h, parent: n.parent, container: n.container, depth: n.depth, status: showStatus ? n.status : null, sub: n.sub, empty: n.empty, dashed: n.dashed }
    }),
    edges: v.connections.map(c => ({ id: c.id, source: c.source, target: c.target, rel: rels[c.rel].rel, name: rels[c.rel].name, rail: c.rail }))
  }))
}

/** Page for a single ArchiMate Modeler diagram. */
export function diagramToDrawioPage (d) {
  // stored coordinates are absolute; containers may be nested via `parent`
  const minX = Math.min(0, ...d.nodes.map(n => n.x)); const minY = Math.min(0, ...d.nodes.map(n => n.y))
  const byId = Object.fromEntries(d.nodes.map(n => [n.id, n]))
  return {
    name: d.name, title: d.name, footer: `EA Compass · ${new Date().toISOString().slice(0, 10)}`, legend: false,
    nodes: d.nodes.map(n => ({ id: n.id, type: n.atype, name: n.name, doc: n.doc, ref: n.refId ? { refType: n.refType, refId: n.refId } : null, x: n.x - minX, y: n.y - minY, w: n.w, h: n.h, parent: n.parent, container: n.container || n.atype === 'Grouping', depth: n.parent ? 2 : 1, status: n.status })),
    edges: d.edges.map(e => {
      const [sh, th] = e.sourceHandle && e.targetHandle ? [e.sourceHandle, e.targetHandle] : sidesFor(byId[e.source], byId[e.target])
      return { id: e.id, source: e.source, target: e.target, rel: e.rel, name: e.name, sourceHandle: sh, targetHandle: th }
    })
  }
}

// pick connection sides from the relative position of two shapes (same rule as the Modeler)
function sidesFor (a, b) {
  if (!a || !b) return [null, null]
  const dx = (b.x + b.w / 2) - (a.x + a.w / 2); const dy = (b.y + b.h / 2) - (a.y + a.h / 2)
  if (Math.abs(dy) > Math.abs(dx) * 0.6) return dy > 0 ? ['Bottom', 'Top'] : ['Top', 'Bottom']
  return dx > 0 ? ['Right', 'Left'] : ['Left', 'Right']
}

export const DRAWIO_RELATIONS = Object.keys(EDGE).filter(r => RELATIONS[r])
export const DRAWIO_ELEMENTS = Object.keys(SHAPE).filter(t => ELEMENTS[t])
