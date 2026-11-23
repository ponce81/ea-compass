// Transition views checks: npm run test:states [outDir]
import { writeFileSync, mkdirSync } from 'node:fs'
import { db, switchTenant, tenantState } from '../src/store.js'
import { buildStatesModel, changesCsv } from '../src/archimate/states.js'
import { allowedRelations, modelToOpenExchangeXml } from '../src/archimate/notation.js'
import { viewToSvg } from '../src/archimate/svgRender.js'
import { toDrawio, statesToDrawioPages, diagramToDrawioPage } from '../src/archimate/drawio.js'
import { modelToDiagrams } from '../src/archimate/states.js'

const out = process.argv[2]
if (out) mkdirSync(out, { recursive: true })
let failed = 0
const check = (ok, msg) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${msg}`); if (!ok) failed++ }
const inside = (c, p) => c.x >= p.x && c.y >= p.y && c.x + c.w <= p.x + p.w && c.y + c.h <= p.y + p.h
const overlap = (a, b) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h

for (const t of tenantState.list.map(x => x.id)) {
  switchTenant(t)
  for (const opts of [{}, { onlyChanges: true }, { l1Ids: [db.capabilities.find(c => c.level === 1).id] }]) {
    const m = buildStatesModel(opts)
    const tag = `${t} ${JSON.stringify(opts)}`
    const els = Object.fromEntries(m.elements.map(e => [e.id, e]))
    const bad = m.relationships.filter(r => !allowedRelations(els[r.source].type, els[r.target].type).includes(r.rel))
    check(!bad.length, `${tag}: ${m.relationships.length} relationships valid${bad.length ? ' – ' + bad.map(r => `${els[r.source].type} ${r.rel} ${els[r.target].type}`).join('; ') : ''}`)
    check(m.views.length === db.plateaus.length + 1, `${tag}: overview + ${db.plateaus.length} plateau views`)
    let geo = []
    for (const v of m.views) {
      const byId = Object.fromEntries(v.nodes.map(n => [n.id, n]))
      for (const n of v.nodes) if (n.parent && !inside(n, byId[n.parent])) geo.push(`${v.id}:${n.id} outside parent`)
      const groups = {}
      for (const n of v.nodes) (groups[n.parent || '_'] ||= []).push(n)
      for (const sib of Object.values(groups)) for (let i = 0; i < sib.length; i++) for (let j = i + 1; j < sib.length; j++) if (overlap(sib[i], sib[j])) geo.push(`${v.id}: ${sib[i].id} overlaps ${sib[j].id}`)
    }
    check(!geo.length, `${tag}: layout (nesting & no overlaps)${geo.length ? ' – ' + geo.slice(0, 3).join('; ') : ''}`)
    const xml = modelToOpenExchangeXml(m)
    const ghosts = m.views.flatMap(v => v.nodes.filter(n => n.ghost))
    const exported = (xml.match(/<node /g) || []).length
    const visible = m.views.reduce((s, v) => s + v.nodes.filter(n => !n.ghost).length, 0)
    check(exported === visible, `${tag}: ${exported} nodes exported = ${visible} visible; ${ghosts.length} retired placeholders left out`)
    // draw.io: every parent / edge endpoint exists, one page per view
    const dio = toDrawio(statesToDrawioPages(m, { company: db.company.name }))
    const ids = new Set([...dio.matchAll(/ id="([^"]+)"/g)].map(x => x[1]))
    const refs = [...dio.matchAll(/ (?:parent|source|target)="([^"]+)"/g)].map(x => x[1]).filter(r => !ids.has(r))
    const pages = (dio.match(/<diagram /g) || []).length
    check(!refs.length && pages === m.views.length, `${tag}: draw.io file has ${pages} pages, all references resolve${refs.length ? ' – missing ' + refs.slice(0, 3).join(', ') : ''}`)
    const modelerDio = toDrawio(modelToDiagrams(m).map(diagramToDrawioPage))
    const mids = new Set([...modelerDio.matchAll(/ id="([^"]+)"/g)].map(x => x[1]))
    check([...modelerDio.matchAll(/ (?:parent|source|target)="([^"]+)"/g)].every(x => mids.has(x[1])), `${tag}: draw.io export of saved Modeler views resolves`)
    if (out && !opts.onlyChanges && !opts.l1Ids) {
      writeFileSync(`${out}/${t}.drawio`, dio)
      writeFileSync(`${out}/${t}.xml`, xml)
      m.views.forEach((v, i) => writeFileSync(`${out}/${t}-${i}.svg`, viewToSvg(v, m, { title: v.name, footer: 'test' })))
      writeFileSync(`${out}/${t}-changes.csv`, changesCsv())
    }
  }
}
// scope also applies to the overview and the figures
switchTenant('acme')
{
  const full = buildStatesModel({}); const fin = buildStatesModel({ l1Ids: ['C4'] })
  const wp = m => m.views[0].nodes.filter(n => n.id.startsWith('ov-wp-')).map(n => n.id)
  check(wp(fin).length > 0 && wp(fin).length < wp(full).length && wp(fin).every(id => wp(full).includes(id)), `scoped overview shows a subset of projects (${wp(full).length} → ${wp(fin).length})`)
  check(fin.scope.label === 'Finance' && full.scope.label === null, 'scope label set only when restricted')
  const gapSub = m => m.views[0].nodes.filter(n => n.id.startsWith('ov-g-')).map(n => n.sub)
  check(JSON.stringify(gapSub(fin)) !== JSON.stringify(gapSub(full)), `gap figures follow the scope (${gapSub(fin).join(' | ')})`)
  check(toDrawio(statesToDrawioPages(fin, { company: 'Acme' })).includes('Scope: Finance'), 'draw.io titles show the scope')
}
console.log(failed ? `\n${failed} check(s) failed` : '\nAll transition-view checks passed')
process.exit(failed ? 1 : 0)
