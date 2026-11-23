// Compact constructors for tenant mock data.
export const cap1 = (id, name, owner) => ({ id, name, level: 1, parentId: null, owner })
export const cap2 = (id, name, parentId, maturity, targetMaturity, importance, owner, description = '') =>
  ({ id, name, level: 2, parentId, maturity, targetMaturity, importance, owner, description })

export const app = (id, name, vendor, type, hosting, lifecycle, time, businessFit, technicalFit, criticality, owner, users, annualCost, goLive, capabilityIds, techIds, description = '', extra = {}) =>
  ({ id, name, vendor, type, hosting, lifecycle, time, businessFit, technicalFit, criticality, owner, users, annualCost, goLive, capabilityIds, techIds, description, ...extra })

export const tech = (id, name, category, vendor, radar, eol = null) => ({ id, name, category, vendor, radar, eol })

export const iface = (id, from, to, dataIds, via, protocol, frequency) => ({ id, from, to, dataIds, via, protocol, frequency })

export const dataObj = (id, name, domain, classification, pii, owner, masterAppId, quality, records, crud) =>
  ({ id, name, domain, classification, pii, owner, masterAppId, quality, records, crud })

export const inv = (id, name, category, status, sponsor, goalIds, capabilityIds, appIds, projectId, budget, capexShare, roi, priority, benefit) =>
  ({ id, name, category, status, sponsor, goalIds, capabilityIds, appIds, projectId, budget, capexShare, roi, priority, benefit })

export const proj = (id, name, investmentId, phase, start, end, budget, spent, rag, manager, architect, archReview, capabilityIds, impacts, milestones = [], issues) =>
  ({ id, name, investmentId, phase, start, end, budget, spent, rag, manager, architect, archReview, capabilityIds, impacts: impacts.map(([appId, change]) => ({ appId, change })), milestones: milestones.map(([name, date]) => ({ name, date })), ...(issues ? { issues } : {}) })

export const plateausFrom = (year, labels = []) => [
  { id: 'baseline', name: 'Baseline', date: `${year}-12`, description: labels[0] || 'Current state.' },
  { id: 't1', name: 'Transition 1', date: `${year + 1}-12`, description: labels[1] || 'First transition architecture.' },
  { id: 't2', name: 'Transition 2', date: `${year + 2}-12`, description: labels[2] || 'Second transition architecture.' },
  { id: 'target', name: 'Target', date: `${year + 3}-12`, description: labels[3] || 'Target architecture.' }
]
