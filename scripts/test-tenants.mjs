// Tenant isolation checks: npm run test:tenants
import { db, tenantState, switchTenant, createTenant, tenantSnapshot, applyImport, l1Caps } from '../src/store.js'
import { layeredAppView, capabilityView, migrationView } from '../src/archimate/generate.js'
import { allowedRelations } from '../src/archimate/notation.js'
import { money } from '../src/utils/format.js'

let failed = 0
const check = (ok, msg) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${msg}`); if (!ok) failed++ }

check(tenantState.activeId === 'acme' && db.company.name === 'Acme Group', 'starts in Acme')
const acmeApps = db.applications.length

switchTenant('meridian')
check(db.company.name === 'Meridian Health Network' && db.applications.some(a => a.name === 'Epic EHR'), 'switch loads Meridian data')
check(!db.applications.some(a => a.name.includes('Salesforce Sales Cloud')), 'no Acme applications visible in Meridian')
check(money(1500000) === 'EUR 1.5M', `currency follows client (${money(1500000)})`)

applyImport({ applications: [{ ...db.applications[0], id: 'A99', name: 'Meridian-only test app' }], appRoadmap: [{ id: 'A99', states: ['Active', 'Active', 'Active', 'Active'] }] })
switchTenant('acme')
check(db.applications.length === acmeApps && !db.applications.some(a => a.id === 'A99'), 'edit in Meridian does not leak into Acme')
check(money(1500000) === 'CHF 1.5M', 'currency back to CHF')
switchTenant('meridian')
check(db.applications.some(a => a.id === 'A99'), 'Meridian edit is still there after switching back')
check(tenantSnapshot('acme').applications.length === acmeApps, 'parked Acme data unchanged')

const id = createTenant({ name: 'Contour Logistics', industry: 'Logistics', country: 'Switzerland', currency: 'CHF', color: '#ea580c', options: { principles: true, capabilities: true, radar: false } })
check(tenantState.activeId === id && db.applications.length === 0 && db.projects.length === 0, 'new client starts empty (no applications/projects)')
check(db.capabilities.length > 0 && db.principles.length === 8 && db.technologies.length === 0, 'new client seeded only with chosen library content')
const otherNames = new Set(['acme', 'meridian', 'solvara'].flatMap(t => tenantSnapshot(t).applications.map(a => a.name)))
check(!db.applications.some(a => otherNames.has(a.name)), 'no client data copied into new client')

let total = 0; let bad = 0
for (const t of ['acme', 'meridian', 'solvara']) {
  switchTenant(t)
  const views = [...db.applications.map(a => layeredAppView(a.id)), ...l1Caps().map(c => capabilityView(c.id)), ...db.projects.map(p => migrationView(p.id))]
  for (const v of views) for (const e of v.edges) {
    total++
    const s = v.nodes.find(n => n.id === e.source); const tg = v.nodes.find(n => n.id === e.target)
    if (!allowedRelations(s.atype, tg.atype).includes(e.rel)) { bad++; console.log('   invalid', t, v.name, s.atype, e.rel, tg.atype) }
  }
  // referential integrity of mock data
  const ids = coll => new Set(db[coll].map(x => x.id))
  const caps = ids('capabilities'); const apps = ids('applications'); const techs = ids('technologies'); const data = ids('dataObjects')
  const broken = [
    ...db.applications.flatMap(a => [...a.capabilityIds.filter(x => !caps.has(x)), ...a.techIds.filter(x => !techs.has(x))].map(x => `${a.id}->${x}`)),
    ...db.interfaces.flatMap(f => [f.from, f.to, f.via].filter(x => x && !apps.has(x)).concat(f.dataIds.filter(x => !data.has(x)))),
    ...db.dataObjects.flatMap(d => [d.masterAppId, ...Object.keys(d.crud)].filter(x => !apps.has(x))),
    ...db.projects.flatMap(p => [...p.impacts.map(i => i.appId).filter(x => !apps.has(x)), ...p.capabilityIds.filter(x => !caps.has(x))]),
    ...db.investments.flatMap(i => [...i.appIds.filter(x => !apps.has(x)), ...i.capabilityIds.filter(x => !caps.has(x)), ...i.goalIds.filter(x => !db.goals.some(g => g.id === x))]),
    ...db.applications.filter(a => !db.appRoadmap[a.id]).map(a => `${a.id} has no roadmap`),
    ...db.valueStreams.flatMap(v => v.stages.flatMap(s => s.capabilityIds.filter(x => !caps.has(x))))
  ]
  check(!broken.length, `${t}: all references resolve${broken.length ? ' – broken: ' + broken.join(', ') : ''}`)
}
check(bad === 0, `generated ArchiMate views valid for all clients (${total} relationships)`)

console.log(failed ? `\n${failed} check(s) failed` : '\nAll tenant checks passed')
process.exit(failed ? 1 : 0)
