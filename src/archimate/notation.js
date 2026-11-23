// ---------------------------------------------------------------------------
// ArchiMate 3.2 notation (subset) – element catalog, glyphs, relationship
// rules (simplified from ArchiMate 3.2 Appendix B) and Open Exchange export.
// ---------------------------------------------------------------------------

export const LAYERS = {
  strategy: { name: 'Strategy', fill: '#f5deaa', stroke: '#b8913a' },
  business: { name: 'Business', fill: '#ffffb5', stroke: '#b5b53c' },
  application: { name: 'Application', fill: '#b5ffff', stroke: '#3aa3b8' },
  technology: { name: 'Technology', fill: '#c9e7b7', stroke: '#5e9c43' },
  motivation: { name: 'Motivation', fill: '#ccccff', stroke: '#7171c9' },
  implementation: { name: 'Implementation & Migration', fill: '#ffe0e0', stroke: '#c97171' },
  other: { name: 'Other', fill: '#ffffff', stroke: '#64748b' }
}

// 16×16 stroke glyphs (ArchiMate "rectangle with icon" notation)
const G = {
  actor: 'M6 3a2 2 0 1 0 4 0a2 2 0 1 0 -4 0 M8 5v5 M4 7h8 M8 10l-3 4 M8 10l3 4',
  role: 'M4 4h8a2 4 0 0 1 0 8h-8a2 4 0 0 1 0 -8z M4 4a2 4 0 0 0 0 8',
  collaboration: 'M1 8a4 4 0 1 0 8 0a4 4 0 1 0 -8 0 M7 8a4 4 0 1 0 8 0a4 4 0 1 0 -8 0',
  interface: 'M1 8h6 M7 8a3.5 3.5 0 1 0 7 0a3.5 3.5 0 1 0 -7 0',
  process: 'M1 6h9v-3l5 5l-5 5v-3h-9z',
  function: 'M3 14v-9l5-3l5 3v9l-5-3z',
  interaction: 'M7 3a5 5 0 0 0 0 10z M9 3a5 5 0 0 1 0 10z',
  event: 'M2 4h9a4 4 0 0 1 0 8h-9l3-4z',
  service: 'M5 4h6a4 4 0 0 1 0 8h-6a4 4 0 0 1 0 -8z',
  object: 'M2 3h12v10h-12z M2 6h12',
  contract: 'M2 3h12v10h-12z M2 6h12 M2 9.5h12',
  product: 'M2 3h12v10h-12z M2 6h6v-3',
  component: 'M5 2h9v12h-9z M3 4.5h4v2h-4z M3 9.5h4v2h-4z',
  node: 'M2 5h9v9h-9z M2 5l3-3h9l-3 3 M14 2v9l-3 3',
  device: 'M2 2h12v8h-12z M5 14h6 M8 10v4',
  systemSoftware: 'M2 9a5 5 0 1 0 10 0a5 5 0 1 0 -10 0 M6 4.5a5 5 0 0 1 8 4',
  network: 'M1 12l3-7h11l-3 7z',
  artifact: 'M3 1h7l3 3v11h-10z M10 1v3h3',
  capability: 'M2 10h4v4h-4z M6 10h4v4h-4z M10 10h4v4h-4z M6 6h4v4h-4z M10 6h4v4h-4z M10 2h4v4h-4z',
  valueStream: 'M1 4h10l4 4l-4 4h-10l4 -4z',
  resource: 'M1 5h11v6h-11z M12 7h2v2h-2z M4 5v6 M7 5v6',
  courseOfAction: 'M6 9a4 4 0 1 0 8 0a4 4 0 1 0 -8 0 M1 15l7-6',
  stakeholder: 'M4 4h8a2 4 0 0 1 0 8h-8a2 4 0 0 1 0 -8z M4 4a2 4 0 0 0 0 8',
  driver: 'M3 8a5 5 0 1 0 10 0a5 5 0 1 0 -10 0 M8 1v14 M1 8h14 M3.5 3.5l9 9 M12.5 3.5l-9 9',
  assessment: 'M2 6a4 4 0 1 0 8 0a4 4 0 1 0 -8 0 M9 9l5 5',
  goal: 'M2 8a6 6 0 1 0 12 0a6 6 0 1 0 -12 0 M5 8a3 3 0 1 0 6 0a3 3 0 1 0 -6 0',
  outcome: 'M1 9a6 6 0 1 0 12 0a6 6 0 1 0 -12 0 M7 9l7-7 M11 2h3v3',
  principle: 'M3 2h10v12h-10z M8 4v6 M8 11.5v1',
  requirement: 'M4 4h11l-3 8h-11z',
  constraint: 'M4 4h11l-3 8h-11z M7 4l-3 8',
  meaning: 'M4 12a3 3 0 0 1 0 -6a4 4 0 0 1 8 0a3 3 0 0 1 0 6z',
  value: 'M1 8a7 4 0 1 0 14 0a7 4 0 1 0 -14 0',
  workPackage: 'M13 8a5 5 0 1 1 -2 -4 M11 1v3h3',
  deliverable: 'M2 2h12v10c-3 -2 -6 2 -12 0z',
  plateau: 'M5 4h10 M3 8h10 M1 12h10',
  gap: 'M3 8a5 5 0 1 0 10 0a5 5 0 1 0 -10 0 M1 6.5h14 M1 9.5h14',
  location: 'M8 15l-4 -6a4 4 0 1 1 8 0z',
  grouping: 'M1 3h6v2h8v9h-14z'
}

// aspect: active | behavior | service | event | passive | motivation | strategy | impl | composite
const E = (name, layer, aspect, glyph, shape = 'rect') => ({ name, layer, aspect, glyph: G[glyph], shape })
export const ELEMENTS = {
  Resource: E('Resource', 'strategy', 'strategy', 'resource'),
  Capability: E('Capability', 'strategy', 'strategy', 'capability', 'round'),
  ValueStream: E('Value Stream', 'strategy', 'strategy', 'valueStream', 'round'),
  CourseOfAction: E('Course of Action', 'strategy', 'strategy', 'courseOfAction', 'round'),

  BusinessActor: E('Business Actor', 'business', 'active', 'actor'),
  BusinessRole: E('Business Role', 'business', 'active', 'role'),
  BusinessCollaboration: E('Business Collaboration', 'business', 'active', 'collaboration'),
  BusinessInterface: E('Business Interface', 'business', 'active', 'interface'),
  BusinessProcess: E('Business Process', 'business', 'behavior', 'process', 'round'),
  BusinessFunction: E('Business Function', 'business', 'behavior', 'function', 'round'),
  BusinessInteraction: E('Business Interaction', 'business', 'behavior', 'interaction', 'round'),
  BusinessEvent: E('Business Event', 'business', 'event', 'event', 'round'),
  BusinessService: E('Business Service', 'business', 'service', 'service', 'pill'),
  BusinessObject: E('Business Object', 'business', 'passive', 'object'),
  Contract: E('Contract', 'business', 'passive', 'contract'),
  Product: E('Product', 'business', 'passive', 'product'),

  ApplicationComponent: E('Application Component', 'application', 'active', 'component'),
  ApplicationCollaboration: E('Application Collaboration', 'application', 'active', 'collaboration'),
  ApplicationInterface: E('Application Interface', 'application', 'active', 'interface'),
  ApplicationFunction: E('Application Function', 'application', 'behavior', 'function', 'round'),
  ApplicationProcess: E('Application Process', 'application', 'behavior', 'process', 'round'),
  ApplicationEvent: E('Application Event', 'application', 'event', 'event', 'round'),
  ApplicationService: E('Application Service', 'application', 'service', 'service', 'pill'),
  DataObject: E('Data Object', 'application', 'passive', 'object'),

  Node: E('Node', 'technology', 'active', 'node'),
  Device: E('Device', 'technology', 'active', 'device'),
  SystemSoftware: E('System Software', 'technology', 'active', 'systemSoftware'),
  TechnologyInterface: E('Technology Interface', 'technology', 'active', 'interface'),
  CommunicationNetwork: E('Communication Network', 'technology', 'active', 'network'),
  TechnologyFunction: E('Technology Function', 'technology', 'behavior', 'function', 'round'),
  TechnologyProcess: E('Technology Process', 'technology', 'behavior', 'process', 'round'),
  TechnologyService: E('Technology Service', 'technology', 'service', 'service', 'pill'),
  Artifact: E('Artifact', 'technology', 'passive', 'artifact'),

  Stakeholder: E('Stakeholder', 'motivation', 'motivation', 'stakeholder'),
  Driver: E('Driver', 'motivation', 'motivation', 'driver'),
  Assessment: E('Assessment', 'motivation', 'motivation', 'assessment'),
  Goal: E('Goal', 'motivation', 'motivation', 'goal'),
  Outcome: E('Outcome', 'motivation', 'motivation', 'outcome'),
  Principle: E('Principle', 'motivation', 'motivation', 'principle'),
  Requirement: E('Requirement', 'motivation', 'motivation', 'requirement'),
  Constraint: E('Constraint', 'motivation', 'motivation', 'constraint'),
  Meaning: E('Meaning', 'motivation', 'motivation', 'meaning'),
  Value: E('Value', 'motivation', 'motivation', 'value'),

  WorkPackage: E('Work Package', 'implementation', 'impl', 'workPackage', 'round'),
  Deliverable: E('Deliverable', 'implementation', 'impl', 'deliverable'),
  ImplementationEvent: E('Implementation Event', 'implementation', 'impl', 'event', 'round'),
  Plateau: E('Plateau', 'implementation', 'impl', 'plateau'),
  Gap: E('Gap', 'implementation', 'impl', 'gap'),

  Grouping: E('Grouping', 'other', 'composite', 'grouping', 'group'),
  Location: E('Location', 'other', 'composite', 'location')
}

export const fillOf = type => (['Plateau', 'Gap'].includes(type) ? '#e0ffe0' : LAYERS[ELEMENTS[type].layer].fill)
export const strokeOf = type => LAYERS[ELEMENTS[type].layer].stroke

// ---------------------------------------------------------------- relations
export const RELATIONS = {
  composition: { name: 'Composition', dash: null, start: 'am-diamond-filled', end: null, xml: 'Composition' },
  aggregation: { name: 'Aggregation', dash: null, start: 'am-diamond-hollow', end: null, xml: 'Aggregation' },
  assignment: { name: 'Assignment', dash: null, start: 'am-dot', end: 'am-arrow-filled', xml: 'Assignment' },
  realization: { name: 'Realization', dash: '6 4', start: null, end: 'am-triangle-hollow', xml: 'Realization' },
  serving: { name: 'Serving', dash: null, start: null, end: 'am-arrow-open', xml: 'Serving' },
  access: { name: 'Access', dash: '2 3', start: null, end: 'am-arrow-small', xml: 'Access' },
  influence: { name: 'Influence', dash: '6 4', start: null, end: 'am-arrow-open', xml: 'Influence' },
  triggering: { name: 'Triggering', dash: null, start: null, end: 'am-arrow-filled', xml: 'Triggering' },
  flow: { name: 'Flow', dash: '6 4', start: null, end: 'am-arrow-filled', xml: 'Flow' },
  specialization: { name: 'Specialization', dash: null, start: null, end: 'am-triangle-hollow', xml: 'Specialization' },
  association: { name: 'Association', dash: null, start: null, end: null, xml: 'Association' }
}

const RANK = { technology: 1, application: 2, business: 3, strategy: 4 }
const CORE = ['business', 'application', 'technology']

/** Valid relationship types from source type to target type (simplified ArchiMate 3.2 rules). */
export function allowedRelations (s, t) {
  const S = ELEMENTS[s]; const T = ELEMENTS[t]
  const out = new Set()
  const add = (...r) => r.forEach(x => out.add(x))
  const core = x => CORE.includes(x.layer)
  const behaviorish = x => ['behavior', 'event'].includes(x.aspect)

  if (S.aspect === 'composite') add('composition', 'aggregation')
  if (s === t) add('specialization')
  if (S.layer === T.layer && S.layer !== 'other') add('composition', 'aggregation')
  // A plateau is a stable architecture state: it composes/aggregates core & strategy elements
  if (s === 'Plateau' && (core(T) || T.layer === 'strategy')) add('composition', 'aggregation')

  // Assignment: active structure performs behaviour
  if (S.aspect === 'active' && ['behavior', 'event', 'service'].includes(T.aspect) && S.layer === T.layer) add('assignment')
  if (s === 'BusinessActor' && t === 'BusinessRole') add('assignment')
  if (['Node', 'Device', 'SystemSoftware'].includes(s) && ['Artifact', 'SystemSoftware'].includes(t)) add('assignment')
  if (s === 'BusinessActor' && t === 'WorkPackage') add('assignment')

  // Realization
  if (['behavior', 'active'].includes(S.aspect) && T.aspect === 'service' && core(S) && core(T) && RANK[S.layer] <= RANK[T.layer]) add('realization')
  if (core(S) && behaviorish(S) && core(T) && behaviorish(T) && RANK[S.layer] < RANK[T.layer]) add('realization')
  if (s === 'DataObject' && t === 'BusinessObject') add('realization')
  if (s === 'Artifact' && ['DataObject', 'ApplicationComponent', 'SystemSoftware'].includes(t)) add('realization')
  if ((core(S) || S.layer === 'strategy') && T.layer === 'strategy') add('realization')
  if ((core(S) || S.layer === 'strategy' || S.layer === 'implementation') && ['Requirement', 'Constraint', 'Goal', 'Outcome', 'Principle'].includes(t)) add('realization')
  if (s === 'WorkPackage' && t === 'Deliverable') add('realization')
  if (s === 'Deliverable' && (core(T) || ['Plateau', 'Capability', 'Resource'].includes(t))) add('realization')

  // Serving: lower layer serves same / higher layer
  if (core(S) && core(T) && S.aspect !== 'passive' && T.aspect !== 'passive' && RANK[S.layer] <= RANK[T.layer]) add('serving')
  if (S.layer === 'strategy' && T.layer === 'strategy') add('serving', 'flow', 'triggering')
  if (core(S) && S.aspect !== 'passive' && (T.layer === 'strategy' || ['BusinessActor', 'BusinessRole', 'Stakeholder'].includes(t))) add('serving')

  // Access: behaviour / active structure reads or writes passive structure
  if (core(S) && S.aspect !== 'passive' && T.aspect === 'passive' && (S.layer === T.layer || (S.layer === 'business' && t === 'DataObject') || (S.layer === 'technology' && t === 'DataObject'))) add('access')

  // Dynamic relationships
  if (core(S) && core(T) && (behaviorish(S) || S.aspect === 'active') && (behaviorish(T) || T.aspect === 'active')) add('flow')
  if (core(S) && core(T) && behaviorish(S) && behaviorish(T)) add('triggering')
  if (S.layer === 'implementation' && T.layer === 'implementation' && ['WorkPackage', 'ImplementationEvent', 'Plateau'].includes(s) && ['WorkPackage', 'ImplementationEvent', 'Plateau'].includes(t)) add('triggering', 'flow')

  // Influence: motivation network, or core elements influencing motivation elements
  if (T.layer === 'motivation' && (S.layer === 'motivation' || core(S) || S.layer === 'strategy')) add('influence')

  add('association')
  return Object.keys(RELATIONS).filter(r => out.has(r))
}

// --------------------------------------------------------- palette grouping
export const PALETTE = Object.entries(LAYERS).map(([id, l]) => ({
  id, name: l.name, items: Object.entries(ELEMENTS).filter(([, e]) => e.layer === id).map(([type, e]) => ({ type, ...e }))
}))

// Repository element → ArchiMate type
export const REPO_TYPE = {
  capability: () => 'Capability',
  application: () => 'ApplicationComponent',
  data: () => 'DataObject',
  technology: t => (t?.category === 'Platforms & Infrastructure' ? 'Node' : 'SystemSoftware'),
  goal: () => 'Goal',
  driver: () => 'Driver',
  principle: () => 'Principle',
  project: () => 'WorkPackage',
  plateau: () => 'Plateau'
}

// ----------------------------------------------------- Open Exchange Format
const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const xid = id => 'id-' + String(id).replace(/[^A-Za-z0-9_.-]/g, '_')

/** Serialise a diagram as an ArchiMate 3.x Model Exchange File (importable in Archi, BiZZdesign, …). */
export function toOpenExchangeXml (diagram) {
  // the exchange format only allows non-negative coordinates: shift the whole view if needed
  const dx = Math.max(0, 20 - Math.min(20, ...diagram.nodes.map(n => n.x)))
  const dy = Math.max(0, 20 - Math.min(20, ...diagram.nodes.map(n => n.y)))
  diagram = { ...diagram, nodes: diagram.nodes.map(n => ({ ...n, x: n.x + dx, y: n.y + dy })) }
  const els = diagram.nodes.map(n => `    <element identifier="${xid(n.id)}" xsi:type="${n.atype}">\n      <name xml:lang="en">${esc(n.name)}</name>${n.doc ? `\n      <documentation xml:lang="en">${esc(n.doc)}</documentation>` : ''}\n    </element>`).join('\n')
  const rels = diagram.edges.map(e => `    <relationship identifier="${xid(e.id)}" source="${xid(e.source)}" target="${xid(e.target)}" xsi:type="${RELATIONS[e.rel].xml}"${e.rel === 'access' ? ' accessType="ReadWrite"' : ''} />`).join('\n')
  const vnodes = diagram.nodes.map(n => `        <node identifier="${xid('v-' + n.id)}" elementRef="${xid(n.id)}" xsi:type="Element" x="${Math.round(n.x)}" y="${Math.round(n.y)}" w="${Math.round(n.w)}" h="${Math.round(n.h)}" />`).join('\n')
  const vconns = diagram.edges.map(e => `        <connection identifier="${xid('v-' + e.id)}" relationshipRef="${xid(e.id)}" xsi:type="Relationship" source="${xid('v-' + e.source)}" target="${xid('v-' + e.target)}" />`).join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>
<model xmlns="http://www.opengroup.org/xsd/archimate/3.0/"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:schemaLocation="http://www.opengroup.org/xsd/archimate/3.0/ http://www.opengroup.org/xsd/archimate/3.1/archimate3_Diagram.xsd"
       identifier="${xid('model-' + diagram.id)}">
  <name xml:lang="en">${esc(diagram.name)}</name>
  <elements>
${els}
  </elements>
  <relationships>
${rels}
  </relationships>
  <views>
    <diagrams>
      <view identifier="${xid('view-' + diagram.id)}" xsi:type="Diagram">
        <name xml:lang="en">${esc(diagram.name)}</name>
${vnodes}
${vconns}
      </view>
    </diagrams>
  </views>
</model>
`
}

// Colour for status highlighting in exported views (Open Exchange <style>)
const STATUS_RGB = { new: [22, 163, 74], phaseout: [217, 119, 6], planned: [37, 99, 235] }
const hexRgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16))

/**
 * Serialise a multi-view model (elements shared across views, nested nodes)
 * as an ArchiMate 3.x Model Exchange File. Node coordinates are absolute.
 */
export function modelToOpenExchangeXml (model) {
  const used = new Set(model.views.flatMap(v => v.nodes.filter(n => !n.ghost).map(n => n.el)))
  const els = model.elements.filter(e => used.has(e.id))
  const rels = model.relationships.filter(r => used.has(r.source) && used.has(r.target))
  const elXml = els.map(e => `    <element identifier="${xid(e.id)}" xsi:type="${e.type}">\n      <name xml:lang="en">${esc(e.name)}</name>${e.doc ? `\n      <documentation xml:lang="en">${esc(e.doc)}</documentation>` : ''}\n    </element>`).join('\n')
  const relXml = rels.map(r => `    <relationship identifier="${xid(r.id)}" source="${xid(r.source)}" target="${xid(r.target)}" xsi:type="${RELATIONS[r.rel].xml}">${r.name ? `<name xml:lang="en">${esc(r.name)}</name>` : ''}</relationship>`).join('\n')

  const viewXml = model.views.map(v => {
    const nodes = v.nodes.filter(n => !n.ghost)
    const kids = {}
    for (const n of nodes) (kids[n.parent || '_root'] ||= []).push(n)
    const style = n => {
      const type = model.elements.find(e => e.id === n.el).type
      const fill = hexRgb(fillOf(type))
      const line = STATUS_RGB[n.status] || hexRgb(strokeOf(type))
      return `<style lineWidth="${STATUS_RGB[n.status] ? 2 : 1}"><fillColor r="${fill[0]}" g="${fill[1]}" b="${fill[2]}"/><lineColor r="${line[0]}" g="${line[1]}" b="${line[2]}"/></style>`
    }
    const nodeXml = (n, ind) => {
      const inner = (kids[n.id] || []).map(c => nodeXml(c, ind + '  ')).join('\n')
      return `${ind}<node identifier="${xid(v.id + '-' + n.id)}" elementRef="${xid(n.el)}" xsi:type="Element" x="${Math.round(n.x)}" y="${Math.round(n.y)}" w="${Math.round(n.w)}" h="${Math.round(n.h)}">${style(n)}${inner ? '\n' + inner + '\n' + ind : ''}</node>`
    }
    const conns = v.connections.map(c => {
      const s = nodes.find(n => n.id === c.source)
      const bend = c.rail != null ? `<bendpoint x="${Math.round(c.rail)}" y="${Math.round(s.y + s.h / 2)}"/>` : ''
      return `        <connection identifier="${xid(v.id + '-' + c.id)}" relationshipRef="${xid(c.rel)}" xsi:type="Relationship" source="${xid(v.id + '-' + c.source)}" target="${xid(v.id + '-' + c.target)}">${bend}</connection>`
    }).join('\n')
    return `      <view identifier="${xid(v.id)}" xsi:type="Diagram">\n        <name xml:lang="en">${esc(v.name)}</name>\n${(kids._root || []).map(n => nodeXml(n, '        ')).join('\n')}${conns ? '\n' + conns : ''}\n      </view>`
  }).join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<model xmlns="http://www.opengroup.org/xsd/archimate/3.0/"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:schemaLocation="http://www.opengroup.org/xsd/archimate/3.0/ http://www.opengroup.org/xsd/archimate/3.1/archimate3_Diagram.xsd"
       identifier="${xid('model-states')}">
  <name xml:lang="en">${esc(model.name)}</name>
  <elements>
${elXml}
  </elements>
  <relationships>
${relXml}
  </relationships>
  <views>
    <diagrams>
${viewXml}
    </diagrams>
  </views>
</model>
`
}
