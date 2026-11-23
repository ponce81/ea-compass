// ---------------------------------------------------------------------------
// Practice library – the consultant's own reusable material.
// Contains NO client data. New client tenants are seeded from here.
// ---------------------------------------------------------------------------
import { cap1, cap2, tech, plateausFrom } from './helpers'

export const libraryPrinciples = [
  { id: 'PR1', name: 'Primacy of Principles', domain: 'Business', statement: 'These principles apply to all organizations within the enterprise.', rationale: 'Consistent and measurable level of quality information for decision makers.', implications: 'Exceptions must be approved by the Architecture Board.' },
  { id: 'PR2', name: 'Reuse before Buy before Build', domain: 'Application', statement: 'Reuse existing strategic solutions before buying, and buy before building.', rationale: 'Reduces redundancy, cost and complexity.', implications: 'Every new application request includes a reuse analysis.' },
  { id: 'PR3', name: 'Cloud-first', domain: 'Technology', statement: 'New solutions are SaaS or deployed on the strategic cloud platform.', rationale: 'Elasticity, resilience and lower run cost.', implications: 'On-premises deployments require an exception.' },
  { id: 'PR4', name: 'Data is an Asset', domain: 'Data', statement: 'Data is an asset that has value to the enterprise and is managed accordingly.', rationale: 'Accurate data is critical for decision making.', implications: 'Every data object has an owner and a system of record.' },
  { id: 'PR5', name: 'Single System of Record', domain: 'Data', statement: 'Each business object has exactly one master system.', rationale: 'Avoid inconsistent data and reconciliations.', implications: 'Retiring a master requires a defined successor.' },
  { id: 'PR6', name: 'API-first Integration', domain: 'Application', statement: 'Systems integrate via managed APIs and events, not point-to-point.', rationale: 'Loose coupling and reuse of integrations.', implications: 'All interfaces are registered in the integration catalog.' },
  { id: 'PR7', name: 'Secure by Design', domain: 'Technology', statement: 'Security and privacy are designed in from the start.', rationale: 'Lower risk and cost than retrofitting security.', implications: 'Solutions handling Confidential/Restricted data require a security review.' },
  { id: 'PR8', name: 'Standardized Technology', domain: 'Technology', statement: 'Use technologies rated "Adopt" in the technology radar.', rationale: 'Reduces skills fragmentation and lifecycle risk.', implications: 'Use of "Hold" technologies requires an exit plan.' }
]

// Cross-industry reference capability map (generic starting point)
export const referenceCapabilities = [
  cap1('C1', 'Customer Management', 'tbd'),
  cap2('C1.1', 'Customer Onboarding', 'C1', 2, 3, 'Medium', 'tbd'), cap2('C1.2', 'Relationship Management', 'C1', 2, 3, 'Medium', 'tbd'), cap2('C1.3', 'Customer Service', 'C1', 2, 3, 'Medium', 'tbd'),
  cap1('C2', 'Products & Services', 'tbd'),
  cap2('C2.1', 'Product Management', 'C2', 2, 3, 'Medium', 'tbd'), cap2('C2.2', 'Service Delivery', 'C2', 2, 3, 'Medium', 'tbd'),
  cap1('C3', 'Sales & Marketing', 'tbd'),
  cap2('C3.1', 'Marketing', 'C3', 2, 3, 'Medium', 'tbd'), cap2('C3.2', 'Sales', 'C3', 2, 3, 'Medium', 'tbd'),
  cap1('C4', 'Finance', 'tbd'),
  cap2('C4.1', 'Accounting', 'C4', 2, 3, 'Medium', 'tbd'), cap2('C4.2', 'Procurement', 'C4', 2, 3, 'Medium', 'tbd'), cap2('C4.3', 'Controlling', 'C4', 2, 3, 'Medium', 'tbd'),
  cap1('C5', 'People', 'tbd'),
  cap2('C5.1', 'Talent Management', 'C5', 2, 3, 'Medium', 'tbd'), cap2('C5.2', 'Payroll', 'C5', 2, 3, 'Medium', 'tbd'),
  cap1('C6', 'IT & Data Management', 'tbd'),
  cap2('C6.1', 'Identity & Access Mgmt', 'C6', 2, 3, 'Medium', 'tbd'), cap2('C6.2', 'Data & Analytics', 'C6', 2, 3, 'Medium', 'tbd'), cap2('C6.3', 'Integration', 'C6', 2, 3, 'Medium', 'tbd'), cap2('C6.4', 'Security Operations', 'C6', 2, 3, 'Medium', 'tbd')
]

// Consultant's baseline technology radar (adjusted per client)
export const baselineRadar = [
  tech('T01', 'Java 21 LTS', 'Languages & Frameworks', 'OpenJDK', 'Adopt', '2031-09'),
  tech('T02', '.NET 10 LTS', 'Languages & Frameworks', 'Microsoft', 'Adopt', '2028-11'),
  tech('T03', 'Python 3.12', 'Languages & Frameworks', 'PSF', 'Adopt', '2028-10'),
  tech('T04', 'PostgreSQL 16', 'Data & Integration', 'Open Source', 'Adopt', '2028-11'),
  tech('T05', 'Kubernetes', 'Platforms & Infrastructure', 'CNCF', 'Adopt'),
  tech('T06', 'Terraform', 'Tools & Practices', 'HashiCorp', 'Adopt'),
  tech('T07', 'Apache Kafka', 'Data & Integration', 'Apache', 'Trial'),
  tech('T08', 'GenAI / LLM platforms', 'Tools & Practices', '—', 'Trial'),
  tech('T09', 'Agentic AI frameworks', 'Tools & Practices', '—', 'Assess')
]

export function newTenantData ({ name, currency, startYear = new Date().getFullYear(), principles = true, capabilities = true, radar = false }) {
  const clone = x => JSON.parse(JSON.stringify(x))
  return {
    company: { name, currency },
    plateaus: plateausFrom(startYear),
    drivers: [], goals: [],
    principles: principles ? clone(libraryPrinciples) : [],
    capabilities: capabilities ? clone(referenceCapabilities) : [],
    valueStreams: [], applications: [], appRoadmap: {}, interfaces: [], dataObjects: [],
    technologies: radar ? clone(baselineRadar) : [],
    investments: [], projects: [], adrs: []
  }
}
