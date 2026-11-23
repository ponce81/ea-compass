// Domain object editing checks: npm run test:entities
import { db, switchTenant, saveEntity, deleteEntity, entityUsage, validateEntity, defaultRoadmap } from '../src/store.js'

let failed = 0
const check = (ok, msg) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${msg}`); if (!ok) failed++ }
const throws = (fn, msg) => { try { fn(); check(false, msg) } catch (e) { check(true, `${msg} (${e.message})`) } }
const integrity = () => {
  const apps = new Set(db.applications.map(a => a.id)); const data = new Set(db.dataObjects.map(d => d.id)); const techs = new Set(db.technologies.map(t => t.id))
  const bad = [
    ...db.interfaces.flatMap(f => [f.from, f.to, f.via].filter(x => x && !apps.has(x)).concat(f.dataIds.filter(x => !data.has(x)))),
    ...db.dataObjects.flatMap(d => [d.masterAppId, ...Object.keys(d.crud)].filter(x => x && !apps.has(x))),
    ...db.projects.flatMap(p => p.impacts.map(i => i.appId).filter(x => !apps.has(x))),
    ...db.investments.flatMap(i => i.appIds.filter(x => !apps.has(x))),
    ...db.applications.flatMap(a => a.techIds.filter(x => !techs.has(x))),
    ...Object.keys(db.appRoadmap).filter(x => !apps.has(x))
  ]
  return bad
}

switchTenant('acme')

// --- create application
const base = { name: 'Snowflake', vendor: 'Snowflake', type: 'SaaS', hosting: 'SaaS', lifecycle: 'Plan', time: 'Invest', businessFit: 4, technicalFit: 5, criticality: 'Business critical', owner: 'CDO', users: 50, annualCost: 120000, goLive: 2027, capabilityIds: ['C6.2'], techIds: ['T22'], description: '' }
const a = saveEntity('applications', base)
check(a === 'A28' && db.applications.some(x => x.id === a), `new application gets next id (${a})`)
check(JSON.stringify(db.appRoadmap[a]) === JSON.stringify(defaultRoadmap('Plan')), 'new application gets a default roadmap from its lifecycle')
throws(() => saveEntity('applications', { ...base, name: 'salesforce sales cloud' }), 'duplicate application name rejected')
throws(() => saveEntity('applications', { ...base, name: 'X', businessFit: 9 }), 'business fit > 5 rejected')
throws(() => saveEntity('applications', { ...base, name: 'Y', capabilityIds: ['C99'] }), 'unknown capability rejected')
check(Object.keys(validateEntity('applications', { ...base, name: '' })).includes('name'), 'empty name flagged on the name field')

// --- edit application incl. roadmap
saveEntity('applications', { ...db.applications.find(x => x.id === a), annualCost: 150000 }, { roadmap: [null, null, 'Planned', 'Active'] })
check(db.applications.find(x => x.id === a).annualCost === 150000 && db.appRoadmap[a][2] === 'Planned', 'edit application + roadmap')

// --- interfaces
const f = saveEntity('interfaces', { from: 'A14', to: a, via: null, dataIds: ['D01', 'D03'], protocol: 'Share', frequency: 'Daily' })
check(db.interfaces.some(x => x.id === f && x.to === a), `new interface ${f}`)
throws(() => saveEntity('interfaces', { from: 'A14', to: 'A14', via: null, dataIds: [], protocol: '', frequency: '' }), 'interface to itself rejected')

// --- data object with CRUD; master gets CRUD automatically
const d = saveEntity('dataObjects', { name: 'Forecast', domain: 'Supply Chain', classification: 'Internal', pii: false, owner: 'COO', masterAppId: a, quality: 70, records: '10k', crud: { A14: 'R' } })
check(db.dataObjects.find(x => x.id === d).crud[a] === 'CRUD', 'master application gets CRUD on save')
throws(() => saveEntity('dataObjects', { ...db.dataObjects.find(x => x.id === d), crud: { A14: 'X' } }), 'invalid CRUD letters rejected')

// --- delete application with successor (Siebel -> Salesforce)
const u = entityUsage('application', 'A02')
check(u.interfaces.length === 1 && u.dataObjects.length === 3 && u.projects.length === 1, `usage of Siebel: ${u.interfaces.length} interface, ${u.dataObjects.length} data objects, ${u.projects.length} project`)
deleteEntity('application', 'A02', { replaceWith: 'A01' })
check(!db.applications.some(x => x.id === 'A02') && !integrity().length, 'Siebel deleted with links moved to Salesforce, no dangling refs')
check(!db.interfaces.some(x => x.from === 'A01' && x.to === 'A01'), 'interface Siebel→Salesforce removed (would point to itself)')
check(db.dataObjects.find(x => x.id === 'D13').crud.A01 === 'CRU', 'Service Case: Salesforce access merged (R + CRU = CRU)')
check(db.projects.find(x => x.id === 'P02').impacts.filter(x => x.appId === 'A01').length === 1, 'project impacts deduplicated')

// --- delete application without successor
const uSap = entityUsage('application', 'A03')
deleteEntity('application', 'A03')
check(!integrity().length && uSap.mastered.length > 0 && db.dataObjects.filter(x => uSap.mastered.some(m => m.id === x.id)).every(x => x.masterAppId === null), `SAP ECC deleted; ${uSap.mastered.length} data objects lose their system of record, no dangling refs`)
check(!db.interfaces.some(x => x.from === 'A03' || x.to === 'A03'), 'interfaces of SAP ECC removed')

// --- technology replace (Java 8 -> Java 21)
const usersJ8 = entityUsage('technology', 'T01').applications.map(x => x.id)
deleteEntity('technology', 'T01', { replaceWith: 'T02' })
check(usersJ8.every(id => db.applications.find(x => x.id === id).techIds.includes('T02')) && !integrity().length, `Java 8 replaced by Java 21 in ${usersJ8.length} app(s)`)

// --- data object delete
deleteEntity('data', 'D01')
check(!db.interfaces.some(x => x.dataIds.includes('D01')) && !integrity().length, 'deleting Customer removes it from interfaces')

// --- isolation
switchTenant('solvara')
check(db.applications.length === 18 && !db.applications.some(x => x.name === 'Snowflake' && x.id === 'A28'), 'other client unchanged')

console.log(failed ? `\n${failed} check(s) failed` : '\nAll entity editing checks passed')
process.exit(failed ? 1 : 0)
