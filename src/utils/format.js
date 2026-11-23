import { db } from '../store'

export function money (v, { short = true, currency } = {}) {
  if (v == null || isNaN(v)) return '–'
  const c = (currency || db.company?.currency || 'CHF') + ' '
  const a = Math.abs(v)
  if (!short) return c + Math.round(v).toLocaleString('en-US').replace(/,/g, '’')
  if (a >= 1e6) return c + (v / 1e6).toFixed(a >= 1e7 ? 0 : 1) + 'M'
  if (a >= 1e3) return c + Math.round(v / 1e3) + 'k'
  return c + Math.round(v)
}

export const pct = v => (v == null ? '–' : Math.round(v * 100) + '%')

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
export function fmtMonth (ym) {
  if (!ym) return '–'
  const [y, m] = ym.split('-').map(Number)
  return `${MONTHS[m - 1]} ${y}`
}

// Maps any status-like value to a colour tone used by .tag / .dot classes
const tones = {
  green: ['Invest', 'Active', 'Adopt', 'Approved', 'Green', 'Accepted', 'Public', 'Introduce', 'Completed ✓'],
  blue: ['Tolerate', 'Plan', 'Planned', 'Trial', 'Run', 'In Progress', 'Pending', 'Internal', 'Execution', 'Modify', 'Medium', 'Business operational', 'SaaS', 'Azure'],
  amber: ['Migrate', 'Phase-out', 'Assess', 'Proposed', 'Amber', 'Conditional', 'Confidential', 'Initiation', 'Business critical'],
  red: ['Eliminate', 'Hold', 'Red', 'Restricted', 'Retire', 'Mission critical', 'High', 'On-Prem'],
  purple: ['Transform', 'Idea', 'PaaS'],
  teal: ['Grow', 'Planning', 'Custom'],
  grey: ['Retired', 'Completed', 'Superseded', 'Not submitted', 'Closing', 'Low', 'Administrative', 'COTS']
}
const toneMap = Object.fromEntries(Object.entries(tones).flatMap(([t, vals]) => vals.map(v => [v, t])))
export const tone = v => toneMap[v] || 'grey'

export const domainColor = {
  Business: 'var(--c-business)',
  Application: 'var(--c-application)',
  Data: 'var(--c-data)',
  Technology: 'var(--c-technology)'
}

export const categoryColor = { Run: '#64748b', Grow: '#14b8a6', Transform: '#8b5cf6' }
export const timeColor = { Invest: '#16a34a', Tolerate: '#2563eb', Migrate: '#d97706', Eliminate: '#dc2626' }
export const radarColor = { Adopt: '#16a34a', Trial: '#2563eb', Assess: '#d97706', Hold: '#dc2626' }

export const initials = name => String(name).split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('')
