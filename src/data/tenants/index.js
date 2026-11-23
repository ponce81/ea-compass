// Client tenants. Each tenant is an isolated repository – nothing is shared between them.
import * as acme from './acme'
import * as meridian from './meridian'
import * as solvara from './solvara'

const KEYS = ['company', 'plateaus', 'drivers', 'goals', 'principles', 'capabilities', 'valueStreams', 'applications', 'appRoadmap', 'interfaces', 'dataObjects', 'technologies', 'investments', 'projects', 'adrs']
export const pickData = mod => JSON.parse(JSON.stringify(Object.fromEntries(KEYS.map(k => [k, mod[k] ?? (k === 'appRoadmap' ? {} : [])]))))

export const seedTenants = [
  { id: 'acme', name: 'Acme Group', industry: 'Manufacturing & Distribution', country: 'Switzerland', color: '#2563eb', engagement: 'Active', since: '2025-03', role: 'Lead Enterprise Architect', data: pickData(acme) },
  { id: 'meridian', name: 'Meridian Health Network', industry: 'Healthcare', country: 'Germany', color: '#0d9488', engagement: 'Active', since: '2025-09', role: 'EA Advisor', data: pickData(meridian) },
  { id: 'solvara', name: 'Solvara Insurance', industry: 'Insurance', country: 'Netherlands', color: '#7c3aed', engagement: 'Active', since: '2024-11', role: 'Transformation Architect', data: pickData(solvara) }
]
