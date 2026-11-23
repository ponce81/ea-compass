import ExcelJS from 'exceljs'
import { buildTemplate, parseWorkbook } from '../src/utils/excel.js'
import { db, applyImport } from '../src/store.js'

const blob = await buildTemplate({ withData: true })
const buf = await blob.arrayBuffer()
const p1 = await parseWorkbook(buf)
console.log('round-trip totals:', p1.totals)
for (const s of p1.sheets) for (const r of s.rows) if (r.action !== 'unchanged') console.log('  unexpected', s.sheet, r.id, r.action, r.changed, r.errors)

const wb = new ExcelJS.Workbook(); await wb.xlsx.load(buf)
const apps = wb.getWorksheet('Applications')
const hdr = {}; apps.getRow(1).eachCell((c, i) => (hdr[c.value] = i))
apps.eachRow((row, n) => { if (row.getCell(hdr['ID']).value === 'A01') row.getCell(hdr['Annual cost']).value = 999000 })
apps.addRow([]); const r = apps.getRow(apps.rowCount)
r.getCell(hdr['Name']).value = 'Snowflake'; r.getCell(hdr['Lifecycle']).value = 'plan'; r.getCell(hdr['TIME']).value = 'Invest'
r.getCell(hdr['Capabilities']).value = 'Customer Analytics; C6.2'; r.getCell(hdr['Technologies']).value = 'Microsoft Azure'
const bad = apps.getRow(apps.rowCount + 1)
bad.getCell(hdr['Name']).value = 'Broken App'; bad.getCell(hdr['TIME']).value = 'Keep'; bad.getCell(hdr['Business fit (1-5)']).value = 9; bad.getCell(hdr['Capabilities']).value = 'Teleportation'
const tech = wb.getWorksheet('Technologies'); const th = {}; tech.getRow(1).eachCell((c, i) => (th[c.value] = i))
const tr = tech.getRow(tech.rowCount + 1); tr.getCell(th['Name']).value = 'dbt'; tr.getCell(th['Radar']).value = 'Trial'; tr.getCell(th['End of support (YYYY-MM)']).value = new Date(Date.UTC(2029, 2, 1))
const p2 = await parseWorkbook(await wb.xlsx.writeBuffer())
console.log('edited totals:', p2.totals)
for (const s of p2.sheets) for (const x of s.rows) if (x.action !== 'unchanged') console.log(' ', s.sheet, x.rowNum, x.id, x.name, x.action, x.changed.join(','), x.errors.join(' | '))
const before = db.applications.length
applyImport(p2.changes)
const sf = db.applications.find(a => a.name === 'Snowflake')
console.log('apps', before, '->', db.applications.length, '| Snowflake:', sf.id, sf.lifecycle, sf.capabilityIds, sf.techIds, '| roadmap', JSON.stringify(db.appRoadmap[sf.id]), '| A01 cost', db.applications.find(a => a.id === 'A01').annualCost, '| dbt eol', db.technologies.find(t => t.name === 'dbt')?.eol)
