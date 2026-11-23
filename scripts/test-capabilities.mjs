// Capability editor checks: npm run test:capabilities
import { db, switchTenant, addCapability, updateCapability, moveCapability, deleteCapability, capabilityUsage, l1Caps, childrenOf } from '../src/store.js'

let failed = 0
const check = (ok, msg) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${msg}`); if (!ok) failed++ }
const throws = (fn, msg) => { try { fn(); check(false, msg) } catch (e) { check(true, `${msg} (${e.message})`) } }
const grouped = () => db.capabilities.every((c, i) => c.level === 1 || db.capabilities.slice(0, i).some(p => p.id === c.parentId)) // children follow their parent
const refsOk = () => {
  const ids = new Set(db.capabilities.map(c => c.id))
  return [...db.applications, ...db.projects, ...db.investments].every(x => x.capabilityIds.every(id => ids.has(id))) &&
    db.valueStreams.every(v => v.stages.every(s => s.capabilityIds.every(id => ids.has(id))))
}

switchTenant('acme')
const n0 = db.capabilities.length

// add
const dom = addCapability({ level: 1, name: 'Sustainability', owner: 'CSO' })
check(dom === 'C7' && l1Caps().at(-1).id === 'C7', `new domain gets next free id (${dom})`)
const c1 = addCapability({ level: 2, parentId: dom, name: 'Carbon Accounting', maturity: 1, targetMaturity: 4, importance: 'High' })
const c2 = addCapability({ level: 2, parentId: dom, name: 'ESG Reporting', maturity: 2, targetMaturity: 4, importance: 'Medium' })
check(c1 === 'C7.1' && c2 === 'C7.2' && childrenOf(dom).map(c => c.id).join() === 'C7.1,C7.2', 'sub-capabilities get parent-based ids in order')
const c3 = addCapability({ level: 2, parentId: 'C1', name: 'Loyalty Management', maturity: 1, targetMaturity: 3, importance: 'Low' })
check(childrenOf('C1').at(-1).id === c3 && grouped(), `capability added at the end of an existing domain (${c3}), order stays grouped`)
throws(() => addCapability({ level: 2, parentId: 'C1', name: 'customer onboarding' }), 'duplicate name rejected (case-insensitive)')
throws(() => addCapability({ level: 2, parentId: 'C1', name: 'X', maturity: 7, targetMaturity: 3, importance: 'High' }), 'maturity out of range rejected')
throws(() => addCapability({ level: 2, parentId: 'C1.1', name: 'Y' }), 'level-2 parent must be a domain')

// update / move to other domain
updateCapability(c3, { name: 'Loyalty & Rewards', parentId: dom, maturity: 2 })
const moved = db.capabilities.find(c => c.id === c3)
check(moved.name === 'Loyalty & Rewards' && moved.parentId === dom && childrenOf(dom).at(-1).id === c3 && grouped(), 'rename + move to another domain keeps grouping')
throws(() => updateCapability(c3, { name: 'Pricing' }), 'rename to existing name rejected')

// reorder
moveCapability(c2, -1)
check(childrenOf(dom).map(c => c.id).join() === `${c2},${c1},${c3}`, 'move sub-capability up')
check(!moveCapability(c2, -1), 'cannot move first sibling further up')
const before = l1Caps().map(c => c.id).join()
moveCapability(dom, -1)
const after = l1Caps().map(c => c.id)
check(after.at(-2) === dom && after.at(-1) === 'C6' && grouped() && db.capabilities.length === n0 + 4, `move domain up swaps whole blocks (${before} -> ${after.join()})`)
moveCapability('C1', 1)
check(l1Caps()[0].id === 'C2' && l1Caps()[1].id === 'C1' && grouped() && childrenOf('C1').length === 4, 'move first domain down keeps its children')

// delete with re-pointing
const u = capabilityUsage('C1.2')
check(u.applications.length === 2 && u.projects.length >= 1, `usage of C1.2: ${u.applications.length} apps, ${u.projects.length} projects, ${u.investments.length} investments`)
const appsBefore = u.applications.map(a => a.id)
deleteCapability('C1.2', { replaceWith: 'C1.3' })
check(!db.capabilities.some(c => c.id === 'C1.2') && appsBefore.every(id => db.applications.find(a => a.id === id).capabilityIds.includes('C1.3')) && refsOk(), 'delete C1.2 → links moved to C1.3, no dangling references')
check(db.applications.find(a => a.id === 'A02').capabilityIds.filter(x => x === 'C1.3').length === 1, 'no duplicate link when target was already linked')
deleteCapability('C2.2')
check(!db.applications.some(a => a.capabilityIds.includes('C2.2')) && refsOk(), 'delete C2.2 without replacement removes links')
throws(() => deleteCapability(dom), 'domain with sub-capabilities cannot be deleted')
for (const c of childrenOf(dom)) deleteCapability(c.id)
deleteCapability(dom)
check(!db.capabilities.some(c => c.id === dom) && grouped() && refsOk(), 'empty domain deleted')

// isolation: other client untouched
switchTenant('meridian')
check(db.capabilities.some(c => c.name === 'Appointment Scheduling') && !db.capabilities.some(c => c.name === 'Sustainability'), 'edits in Acme do not affect Meridian')

console.log(failed ? `\n${failed} check(s) failed` : '\nAll capability editor checks passed')
process.exit(failed ? 1 : 0)
