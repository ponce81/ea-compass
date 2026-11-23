// Excel template export & import (runs fully in the browser via exceljs).
import { db } from '../store'
import { ENUMS, SHEETS } from '../data/schema'

const loadExcel = async () => (await import('exceljs')).default
const colLetter = n => { let s = ''; while (n > 0) { const m = (n - 1) % 26; s = String.fromCharCode(65 + m) + s; n = Math.floor((n - 1) / 26) } return s }
const nameOfRef = (coll, id) => db[coll].find(x => x.id === id)?.name ?? id

// ------------------------------------------------------------------ export
export async function buildTemplate ({ withData = false } = {}) {
  const ExcelJS = await loadExcel()
  const wb = new ExcelJS.Workbook()
  wb.creator = 'EA Compass'

  const readme = wb.addWorksheet('README')
  readme.columns = [{ width: 110 }]
  ;[
    'EA Compass – repository import template',
    '',
    '• One sheet per element type: Capabilities, Applications, Technologies, DataObjects, Interfaces. Other sheets are ignored.',
    '• Keep the header row. Columns can be reordered; unknown columns are ignored.',
    '• ID: leave empty for new elements (an ID is generated). Rows whose ID or Name matches an existing element update it.',
    '• References (Parent capability, Capabilities, Technologies, System of record, Source/Target application, Data objects) accept IDs or names.',
    '• Lists: separate several values with a semicolon, e.g. "CRM & Relationship Mgmt; Order Capture".',
    '• Dropdown columns only accept the listed values. End of support uses the format YYYY-MM.',
    '• Import order is handled for you: new capabilities can be referenced by new applications in the same file.'
  ].forEach((t, i) => { const r = readme.addRow([t]); if (i === 0) r.font = { bold: true, size: 14 } })

  for (const s of SHEETS) {
    const ws = wb.addWorksheet(s.sheet, { views: [{ state: 'frozen', ySplit: 1 }] })
    ws.columns = s.columns.map(col => ({ header: col.header, key: col.key, width: col.width || Math.max(12, col.header.length + 4) }))
    const head = ws.getRow(1)
    head.font = { bold: true, color: { argb: 'FFFFFFFF' } }
    head.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } }
    head.height = 20

    if (withData) {
      for (const doc of db[s.collection]) {
        const row = {}
        for (const col of s.columns) {
          const v = doc[col.key]
          if (col.type === 'refs') row[col.key] = (v || []).map(id => nameOfRef(col.ref, id)).join('; ')
          else if (col.type === 'ref') row[col.key] = v ? nameOfRef(col.ref, v) : null
          else if (col.type === 'bool') row[col.key] = v ? 'Yes' : 'No'
          else row[col.key] = v ?? null
        }
        ws.addRow(row)
      }
    }
    s.columns.forEach((col, i) => {
      const values = col.type === 'enum' ? col.values : col.type === 'bool' ? ENUMS.yesNo : null
      if (values) {
        const L = colLetter(i + 1)
        ws.dataValidations.add(`${L}2:${L}1000`, { type: 'list', allowBlank: true, formulae: [`"${values.join(',')}"`], showErrorMessage: true, errorTitle: 'Invalid value', error: `Choose one of: ${values.join(', ')}` })
      }
      if (col.type === 'month') ws.getColumn(i + 1).numFmt = '@'
    })
  }
  const buf = await wb.xlsx.writeBuffer()
  return new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
}

// ------------------------------------------------------------------ import
function cellValue (v) {
  if (v == null) return null
  if (v instanceof Date) return v
  if (typeof v === 'object') {
    if (v.richText) return v.richText.map(t => t.text).join('')
    if ('result' in v) return cellValue(v.result)
    if ('text' in v) return v.text
    if (v.error) return null
  }
  if (typeof v === 'string') { const t = v.trim(); return t === '' ? null : t }
  return v
}
const norm = s => String(s).trim().toLowerCase()
const isEmpty = v => v == null || v === '' || (Array.isArray(v) && v.length === 0) || (typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length === 0)
const same = (a, b) => (isEmpty(a) && isEmpty(b)) || JSON.stringify(a) === JSON.stringify(b)

function nextIds (coll, prefix) {
  let n = Math.max(0, ...db[coll].map(x => parseInt(String(x.id).replace(/^\D+/, ''), 10) || 0))
  return () => prefix + String(++n).padStart(2, '0')
}

/** Parse an uploaded workbook and compare it with the repository. Nothing is changed until commit. */
export async function parseWorkbook (arrayBuffer) {
  const ExcelJS = await loadExcel()
  const wb = new ExcelJS.Workbook()
  await wb.xlsx.load(arrayBuffer)

  const found = []
  const unknownSheets = []
  wb.eachSheet(ws => {
    const spec = SHEETS.find(s => norm(s.sheet) === norm(ws.name))
    if (spec) found.push({ spec, ws }); else if (norm(ws.name) !== 'readme') unknownSheets.push(ws.name)
  })

  // pass 1 – read rows, map headers, assign ids
  const parsed = found.map(({ spec, ws }) => {
    const colMap = {}
    const sheetErrors = []
    ws.getRow(1).eachCell((cell, colNo) => {
      const h = norm(cellValue(cell.value) ?? '')
      const col = spec.columns.find(cl => norm(cl.header) === h || norm(cl.key) === h)
      if (col) colMap[colNo] = col
    })
    const present = Object.values(colMap).map(cl => cl.key)
    for (const col of spec.columns.filter(cl => cl.required)) if (!present.includes(col.key)) sheetErrors.push(`Missing required column "${col.header}"`)

    const gen = nextIds(spec.collection, spec.prefix)
    const rows = []
    ws.eachRow({ includeEmpty: false }, (row, rowNum) => {
      if (rowNum === 1) return
      const raw = {}
      for (const [colNo, col] of Object.entries(colMap)) raw[col.key] = cellValue(row.getCell(Number(colNo)).value)
      if (Object.values(raw).every(v => v == null)) return
      let existing = raw.id ? db[spec.collection].find(x => norm(x.id) === norm(raw.id)) : null
      if (!existing && !raw.id && raw.name && !spec.noName) existing = db[spec.collection].find(x => norm(x.name) === norm(raw.name))
      const id = existing?.id ?? (raw.id ? String(raw.id).trim() : gen())
      rows.push({ rowNum, raw, existing, id, errors: [] })
    })
    return { spec, rows, sheetErrors }
  })

  // reference index: existing elements + rows of this upload
  const index = {}
  for (const coll of ['capabilities', 'applications', 'technologies', 'dataObjects']) {
    const m = new Map()
    for (const x of db[coll]) { m.set(norm(x.id), x.id); m.set(norm(x.name), x.id) }
    const up = parsed.find(p => p.spec.collection === coll)
    if (up) for (const r of up.rows) { m.set(norm(r.id), r.id); if (r.raw.name) m.set(norm(r.raw.name), r.id) }
    index[coll] = m
  }
  const resolve = (coll, token) => index[coll].get(norm(token))

  // pass 2 – convert, validate, diff
  const changes = {}
  const result = parsed.map(({ spec, rows, sheetErrors }) => {
    const out = rows.map(r => {
      const fields = {}
      for (const col of spec.columns) {
        if (!(col.key in r.raw) || col.key === 'id') continue
        let v = r.raw[col.key]
        const err = m => r.errors.push(`${col.header}: ${m}`)
        if (v == null) {
          if (col.required) err('required')
          fields[col.key] = col.type === 'refs' ? [] : col.type === 'bool' ? false : null
          continue
        }
        switch (col.type) {
          case 'str': v = String(v); break
          case 'int': case 'num': {
            const n = Number(v)
            if (Number.isNaN(n)) { err(`"${v}" is not a number`); v = null; break }
            if (col.type === 'int' && !Number.isInteger(n)) { err(`"${v}" must be a whole number`); v = null; break }
            if (col.min != null && n < col.min) err(`must be ≥ ${col.min}`)
            if (col.max != null && n > col.max) err(`must be ≤ ${col.max}`)
            v = Number.isInteger(n) ? n : n; break
          }
          case 'enum': {
            const hit = col.values.find(x => norm(x) === norm(v))
            if (hit == null) err(`"${v}" is not one of ${col.values.join(', ')}`)
            v = hit ?? null; break
          }
          case 'bool': {
            const t = norm(v)
            if (['yes', 'y', 'true', '1', 'x'].includes(t) || v === true) v = true
            else if (['no', 'n', 'false', '0', ''].includes(t) || v === false) v = false
            else { err(`"${v}" must be Yes or No`); v = null }
            break
          }
          case 'month': {
            // Excel stores dates as serial numbers (days since 1899-12-30) when the cell is not a date cell
            if (typeof v === 'number' && v > 20000 && v < 80000) v = new Date(Date.UTC(1899, 11, 30) + v * 86400000)
            if (v instanceof Date) v = `${v.getUTCFullYear()}-${String(v.getUTCMonth() + 1).padStart(2, '0')}`
            else v = String(v).trim()
            if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(v)) { err(`"${v}" must be YYYY-MM`); v = null }
            break
          }
          case 'ref': {
            const id = resolve(col.ref, v)
            if (!id) err(`unknown reference "${v}"`)
            v = id ?? null; break
          }
          case 'refs': {
            let tokens = String(v).split(/[;\n]/).map(t => t.trim()).filter(Boolean)
            if (tokens.length === 1 && !resolve(col.ref, tokens[0]) && tokens[0].includes(',')) tokens = tokens[0].split(',').map(t => t.trim()).filter(Boolean)
            v = tokens.map(t => { const id = resolve(col.ref, t); if (!id) err(`unknown reference "${t}"`); return id }).filter(Boolean)
            break
          }
        }
        fields[col.key] = v
      }

      const base = r.existing ?? { ...spec.defaults }
      const doc = { ...base, ...fields, id: r.id }
      // domain rules
      if (spec.collection === 'capabilities') {
        if (doc.level === 2 && !doc.parentId) r.errors.push('Parent capability: required for level 2')
        if (doc.level === 1 && doc.parentId) r.errors.push('Parent capability: must be empty for level 1')
        if (doc.parentId === doc.id) r.errors.push('Parent capability: cannot be itself')
      }
      if (spec.collection === 'interfaces' && doc.from && doc.from === doc.to) r.errors.push('Source and target must differ')
      if (spec.collection === 'dataObjects' && !r.existing && doc.masterAppId) doc.crud = { [doc.masterAppId]: 'CRUD' }

      const changed = r.existing ? Object.keys(fields).filter(k => !same(r.existing[k], fields[k])) : Object.keys(fields)
      const action = r.errors.length ? 'error' : !r.existing ? 'new' : changed.length ? 'update' : 'unchanged'
      const label = spec.noName ? `${nameOfRef('applications', doc.from) || '?'} → ${nameOfRef('applications', doc.to) || '?'}` : doc.name
      if (action === 'new' || action === 'update') {
        ;(changes[spec.collection] ||= []).push(doc)
        if (spec.collection === 'applications' && action === 'new') {
          const states = { Plan: [null, 'Planned', 'Active', 'Active'], Active: ['Active', 'Active', 'Active', 'Active'], 'Phase-out': ['Phase-out', 'Phase-out', 'Retired', 'Retired'], Retired: ['Retired', 'Retired', 'Retired', 'Retired'] }[doc.lifecycle]
          ;(changes.appRoadmap ||= []).push({ id: doc.id, states })
        }
      }
      return { rowNum: r.rowNum, id: doc.id, name: label, action, errors: r.errors, changed: r.existing ? changed : [] }
    })
    const counts = { new: 0, update: 0, unchanged: 0, error: 0 }
    out.forEach(x => counts[x.action]++)
    return { sheet: spec.sheet, collection: spec.collection, rows: out, counts, sheetErrors }
  })

  return {
    sheets: result,
    unknownSheets,
    changes,
    totals: result.reduce((t, s) => { for (const k in s.counts) t[k] += s.counts[k]; t.sheetErrors += s.sheetErrors.length; return t }, { new: 0, update: 0, unchanged: 0, error: 0, sheetErrors: 0 })
  }
}

export function download (blob, filename) {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = filename
  a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 1000)
}

export { SHEETS }
