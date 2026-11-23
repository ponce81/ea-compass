// ---------------------------------------------------------------------------
// EA Compass – mock repository
// A TOGAF-inspired metamodel: Motivation → Business → Application → Data →
// Technology → Implementation & Migration (projects, investments, plateaus).
// All data is fictional.
// ---------------------------------------------------------------------------

export const company = { name: 'Acme Group', currency: 'CHF' }

// Transition architectures (TOGAF "plateaus")
export const plateaus = [
  { id: 'baseline', name: 'Baseline', date: '2025-12', description: 'Current state as documented in the architecture repository.' },
  { id: 't1', name: 'Transition 1', date: '2026-12', description: 'CRM consolidated, DWH phase-out started, Zero-Trust IAM live.' },
  { id: 't2', name: 'Transition 2', date: '2027-12', description: 'S/4HANA live, integration platform migrated, composable commerce live.' },
  { id: 'target', name: 'Target', date: '2028-12', description: 'Cloud-first, data-driven target architecture.' }
]

// ---------------------------------------------------------------- Motivation
export const drivers = [
  { id: 'DR1', name: 'SAP ECC end of mainstream maintenance (2027)', type: 'Internal' },
  { id: 'DR2', name: 'Digital-native competitors raising customer expectations', type: 'External' },
  { id: 'DR3', name: 'Rising IT run costs (+9% YoY)', type: 'Internal' },
  { id: 'DR4', name: 'Data protection regulation (GDPR / nFADP)', type: 'Regulatory' },
  { id: 'DR5', name: 'Increasing cyber-threat landscape', type: 'External' }
]

export const goals = [
  { id: 'G1', name: 'Customer Centricity', description: 'One view of the customer across all channels.', kpi: 'Net Promoter Score', baseline: 32, current: 36, target: 45, unit: '', driverIds: ['DR2'] },
  { id: 'G2', name: 'Operational Efficiency', description: 'Reduce IT run cost and process lead times.', kpi: 'IT run cost reduction', baseline: 0, current: 4, target: 15, unit: '%', driverIds: ['DR1', 'DR3'] },
  { id: 'G3', name: 'Data-driven Enterprise', description: 'Trusted data products and self-service analytics.', kpi: 'Certified data products', baseline: 3, current: 9, target: 30, unit: '', driverIds: ['DR2'] },
  { id: 'G4', name: 'Cloud-first & Resilience', description: 'Move workloads to cloud platforms with high resilience.', kpi: 'Workloads in cloud', baseline: 41, current: 52, target: 80, unit: '%', driverIds: ['DR3', 'DR5'] },
  { id: 'G5', name: 'Security & Compliance', description: 'Secure by design, compliant by default.', kpi: 'Open critical findings', baseline: 27, current: 14, target: 0, unit: '', driverIds: ['DR4', 'DR5'], lowerIsBetter: true }
]

export const principles = [
  { id: 'PR1', name: 'Primacy of Principles', domain: 'Business', statement: 'These principles apply to all organizations within the enterprise.', rationale: 'Consistent and measurable level of quality information for decision makers.', implications: 'Exceptions must be approved by the Architecture Board.' },
  { id: 'PR2', name: 'Reuse before Buy before Build', domain: 'Application', statement: 'Reuse existing strategic solutions before buying, and buy before building.', rationale: 'Reduces redundancy, cost and complexity.', implications: 'Every new application request includes a reuse analysis.' },
  { id: 'PR3', name: 'Cloud-first', domain: 'Technology', statement: 'New solutions are SaaS or deployed on the strategic cloud platform.', rationale: 'Elasticity, resilience and lower run cost.', implications: 'On-premises deployments require an exception.' },
  { id: 'PR4', name: 'Data is an Asset', domain: 'Data', statement: 'Data is an asset that has value to the enterprise and is managed accordingly.', rationale: 'Accurate data is critical for decision making.', implications: 'Every data object has an owner and a system of record.' },
  { id: 'PR5', name: 'Single System of Record', domain: 'Data', statement: 'Each business object has exactly one master system.', rationale: 'Avoid inconsistent data and reconciliations.', implications: 'Retiring a master requires a defined successor.' },
  { id: 'PR6', name: 'API-first Integration', domain: 'Application', statement: 'Systems integrate via managed APIs and events, not point-to-point.', rationale: 'Loose coupling and reuse of integrations.', implications: 'All interfaces are registered in the integration catalog.' },
  { id: 'PR7', name: 'Secure by Design', domain: 'Technology', statement: 'Security and privacy are designed in from the start.', rationale: 'Lower risk and cost than retrofitting security.', implications: 'Solutions handling Confidential/Restricted data require a security review.' },
  { id: 'PR8', name: 'Standardized Technology', domain: 'Technology', statement: 'Use technologies rated "Adopt" in the technology radar.', rationale: 'Reduces skills fragmentation and lifecycle risk.', implications: 'Use of "Hold" technologies requires an exit plan.' }
]

// ------------------------------------------------------------------ Business
const cap = (id, name, parentId, maturity, targetMaturity, importance, owner, description = '') =>
  ({ id, name, level: 2, parentId, maturity, targetMaturity, importance, owner, description })

export const capabilities = [
  { id: 'C1', name: 'Customer Management', level: 1, parentId: null, owner: 'Chief Customer Officer' },
  cap('C1.1', 'Customer Onboarding', 'C1', 2, 4, 'High', 'Head of Customer Service', 'Registering and verifying new customers across channels.'),
  cap('C1.2', 'CRM & Relationship Mgmt', 'C1', 2, 4, 'High', 'Head of Sales Ops', 'Managing accounts, contacts, opportunities and interactions.'),
  cap('C1.3', 'Customer Service', 'C1', 3, 4, 'High', 'Head of Customer Service', 'Handling requests, complaints and service cases.'),
  cap('C1.4', 'Customer Analytics', 'C1', 1, 4, 'Medium', 'Head of Data & Analytics', 'Segmentation, churn prediction and customer insights.'),

  { id: 'C2', name: 'Sales & Marketing', level: 1, parentId: null, owner: 'Chief Commercial Officer' },
  cap('C2.1', 'Campaign Management', 'C2', 3, 3, 'Medium', 'Head of Marketing', 'Planning and executing marketing campaigns.'),
  cap('C2.2', 'Pricing', 'C2', 3, 4, 'High', 'Head of Pricing', 'Price list management, discounts and price optimization.'),
  cap('C2.3', 'Order Capture', 'C2', 3, 4, 'High', 'Head of Sales Ops', 'Capturing quotes and orders from all channels.'),
  cap('C2.4', 'E-Commerce', 'C2', 2, 5, 'High', 'Head of Digital', 'Online storefront, checkout and digital sales.'),

  { id: 'C3', name: 'Product & Service Delivery', level: 1, parentId: null, owner: 'Chief Operating Officer' },
  cap('C3.1', 'Product Management', 'C3', 3, 3, 'Medium', 'Head of Product', 'Product lifecycle and product information.'),
  cap('C3.2', 'Supply Chain Planning', 'C3', 2, 4, 'High', 'Head of Supply Chain', 'Demand and supply planning.'),
  cap('C3.3', 'Warehouse & Logistics', 'C3', 3, 3, 'Medium', 'Head of Logistics', 'Inventory, picking, shipping.'),
  cap('C3.4', 'Field Service', 'C3', 2, 4, 'Medium', 'Head of Field Service', 'Planning and executing on-site service.'),

  { id: 'C4', name: 'Finance', level: 1, parentId: null, owner: 'Chief Financial Officer' },
  cap('C4.1', 'General Ledger', 'C4', 4, 4, 'High', 'Head of Accounting', 'Financial accounting and closing.'),
  cap('C4.2', 'Billing & Invoicing', 'C4', 2, 4, 'High', 'Head of Billing', 'Invoicing, credit notes and revenue recognition.'),
  cap('C4.3', 'Procurement', 'C4', 3, 4, 'Medium', 'Head of Procurement', 'Source-to-pay processes.'),
  cap('C4.4', 'Controlling & Reporting', 'C4', 2, 4, 'Medium', 'Head of Controlling', 'Management reporting and planning.'),

  { id: 'C5', name: 'People', level: 1, parentId: null, owner: 'Chief People Officer' },
  cap('C5.1', 'Recruiting', 'C5', 3, 3, 'Low', 'Head of Talent', 'Attracting and hiring talent.'),
  cap('C5.2', 'Payroll', 'C5', 4, 4, 'Medium', 'Head of HR Ops', 'Salary calculation and payment.'),
  cap('C5.3', 'Learning & Development', 'C5', 2, 3, 'Low', 'Head of Talent', 'Training and skills development.'),

  { id: 'C6', name: 'IT & Data Management', level: 1, parentId: null, owner: 'Chief Information Officer' },
  cap('C6.1', 'Identity & Access Mgmt', 'C6', 3, 5, 'High', 'CISO', 'Identities, authentication and authorization.'),
  cap('C6.2', 'Data Platform & Analytics', 'C6', 2, 4, 'High', 'Head of Data & Analytics', 'Data integration, storage and analytics platform.'),
  cap('C6.3', 'Integration', 'C6', 2, 4, 'High', 'Head of Integration', 'APIs, events and data integration.'),
  cap('C6.4', 'Security Operations', 'C6', 3, 4, 'High', 'CISO', 'Monitoring, detection and incident response.')
]

export const valueStreams = [
  { id: 'VS1', name: 'Order-to-Cash', stakeholder: 'Customer', stages: [
    { name: 'Attract', capabilityIds: ['C2.1', 'C2.4'] },
    { name: 'Quote & Price', capabilityIds: ['C2.2'] },
    { name: 'Order', capabilityIds: ['C2.3', 'C1.1'] },
    { name: 'Fulfil', capabilityIds: ['C3.3', 'C3.2'] },
    { name: 'Invoice', capabilityIds: ['C4.2'] },
    { name: 'Collect', capabilityIds: ['C4.1'] }
  ] },
  { id: 'VS2', name: 'Issue-to-Resolution', stakeholder: 'Customer', stages: [
    { name: 'Report', capabilityIds: ['C1.3'] },
    { name: 'Diagnose', capabilityIds: ['C1.3', 'C1.4'] },
    { name: 'Resolve', capabilityIds: ['C3.4'] },
    { name: 'Learn', capabilityIds: ['C1.4', 'C3.1'] }
  ] },
  { id: 'VS3', name: 'Procure-to-Pay', stakeholder: 'Supplier', stages: [
    { name: 'Request', capabilityIds: ['C4.3'] },
    { name: 'Source & Order', capabilityIds: ['C4.3'] },
    { name: 'Receive', capabilityIds: ['C3.3'] },
    { name: 'Pay', capabilityIds: ['C4.1'] }
  ] },
  { id: 'VS4', name: 'Hire-to-Retire', stakeholder: 'Employee', stages: [
    { name: 'Recruit', capabilityIds: ['C5.1'] },
    { name: 'Onboard', capabilityIds: ['C5.1', 'C6.1'] },
    { name: 'Develop', capabilityIds: ['C5.3'] },
    { name: 'Pay', capabilityIds: ['C5.2'] }
  ] }
]

// --------------------------------------------------------------- Application
// time = Gartner TIME model (Tolerate / Invest / Migrate / Eliminate)
// businessFit / technicalFit: 1 (poor) – 5 (excellent)
export const applications = [
  { id: 'A01', name: 'Salesforce Sales Cloud', vendor: 'Salesforce', type: 'SaaS', hosting: 'SaaS', lifecycle: 'Active', time: 'Invest', businessFit: 4, technicalFit: 5, criticality: 'Business critical', owner: 'Head of Sales Ops', users: 850, annualCost: 420000, goLive: 2021, capabilityIds: ['C1.2', 'C2.3'], techIds: [], description: 'Strategic CRM – system of record for accounts and opportunities.' },
  { id: 'A02', name: 'Siebel CRM (legacy)', vendor: 'Oracle', type: 'COTS', hosting: 'On-Prem', lifecycle: 'Phase-out', time: 'Eliminate', businessFit: 2, technicalFit: 1, criticality: 'Business critical', owner: 'Head of Sales Ops', users: 310, annualCost: 380000, goLive: 2009, capabilityIds: ['C1.2', 'C1.3'], techIds: ['T10', 'T16', 'T14', 'T01'], description: 'Legacy CRM still used by the B2B service desk.' },
  { id: 'A03', name: 'SAP ECC 6.0', vendor: 'SAP', type: 'COTS', hosting: 'On-Prem', lifecycle: 'Active', time: 'Migrate', businessFit: 4, technicalFit: 2, criticality: 'Mission critical', owner: 'CFO Office', users: 1200, annualCost: 1200000, goLive: 2011, capabilityIds: ['C4.1', 'C4.3', 'C3.2', 'C2.3'], techIds: ['T28', 'T10', 'T14', 'T18'], description: 'Core ERP for finance, procurement and supply chain.' },
  { id: 'A04', name: 'SAP S/4HANA Cloud (RISE)', vendor: 'SAP', type: 'SaaS', hosting: 'SaaS', lifecycle: 'Plan', time: 'Invest', businessFit: 5, technicalFit: 5, criticality: 'Mission critical', owner: 'CFO Office', users: 1200, annualCost: 950000, goLive: 2027, capabilityIds: ['C4.1', 'C4.3', 'C3.2', 'C2.3', 'C4.4'], techIds: ['T27', 'T15'], description: 'Future core ERP. Annual cost is an estimate.', estimatedCost: true },
  { id: 'A05', name: 'ServiceNow ITSM / CSM', vendor: 'ServiceNow', type: 'SaaS', hosting: 'SaaS', lifecycle: 'Active', time: 'Invest', businessFit: 4, technicalFit: 5, criticality: 'Business critical', owner: 'Head of Customer Service', users: 640, annualCost: 260000, goLive: 2020, capabilityIds: ['C1.3', 'C6.4'], techIds: [], description: 'Service management for IT and customer service.' },
  { id: 'A06', name: 'Magento Webshop', vendor: 'Adobe', type: 'COTS', hosting: 'On-Prem', lifecycle: 'Active', time: 'Migrate', businessFit: 3, technicalFit: 2, criticality: 'Business critical', owner: 'Head of Digital', users: 120000, annualCost: 180000, goLive: 2016, capabilityIds: ['C2.4'], techIds: ['T31', 'T16', 'T14'], description: 'B2C webshop, heavily customized.' },
  { id: 'A07', name: 'Composable Commerce Platform', vendor: 'commercetools', type: 'SaaS', hosting: 'SaaS', lifecycle: 'Plan', time: 'Invest', businessFit: 5, technicalFit: 5, criticality: 'Business critical', owner: 'Head of Digital', users: 150000, annualCost: 220000, goLive: 2027, capabilityIds: ['C2.4', 'C2.3'], techIds: ['T06', 'T08', 'T13', 'T15'], description: 'MACH-based headless commerce. Cost is an estimate.', estimatedCost: true },
  { id: 'A08', name: 'Workday HCM', vendor: 'Workday', type: 'SaaS', hosting: 'SaaS', lifecycle: 'Active', time: 'Invest', businessFit: 4, technicalFit: 5, criticality: 'Business operational', owner: 'Head of HR Ops', users: 3400, annualCost: 310000, goLive: 2022, capabilityIds: ['C5.1', 'C5.2', 'C5.3'], techIds: [], description: 'Core HR, recruiting and payroll.' },
  { id: 'A09', name: 'Pricing Engine (custom)', vendor: 'In-house', type: 'Custom', hosting: 'On-Prem', lifecycle: 'Active', time: 'Tolerate', businessFit: 4, technicalFit: 2, criticality: 'Business critical', owner: 'Head of Pricing', users: 90, annualCost: 140000, goLive: 2014, capabilityIds: ['C2.2'], techIds: ['T01', 'T10', 'T14', 'T16'], description: 'Calculates customer-specific prices; high business value, aging tech.' },
  { id: 'A10', name: 'Manhattan WMS', vendor: 'Manhattan Associates', type: 'COTS', hosting: 'On-Prem', lifecycle: 'Active', time: 'Tolerate', businessFit: 3, technicalFit: 3, criticality: 'Mission critical', owner: 'Head of Logistics', users: 420, annualCost: 290000, goLive: 2017, capabilityIds: ['C3.3'], techIds: ['T12', 'T18', 'T14'], description: 'Warehouse management for 3 distribution centers.' },
  { id: 'A11', name: 'Field Service App (custom)', vendor: 'In-house', type: 'Custom', hosting: 'On-Prem', lifecycle: 'Active', time: 'Migrate', businessFit: 2, technicalFit: 2, criticality: 'Business operational', owner: 'Head of Field Service', users: 260, annualCost: 95000, goLive: 2015, capabilityIds: ['C3.4'], techIds: ['T09', 'T03', 'T12', 'T18'], description: 'Technician scheduling and work orders.' },
  { id: 'A12', name: 'HubSpot Marketing Hub', vendor: 'HubSpot', type: 'SaaS', hosting: 'SaaS', lifecycle: 'Active', time: 'Invest', businessFit: 4, technicalFit: 4, criticality: 'Business operational', owner: 'Head of Marketing', users: 45, annualCost: 85000, goLive: 2023, capabilityIds: ['C2.1'], techIds: [], description: 'Marketing automation and campaigns.' },
  { id: 'A13', name: 'Enterprise DWH (Teradata)', vendor: 'Teradata', type: 'COTS', hosting: 'On-Prem', lifecycle: 'Phase-out', time: 'Eliminate', businessFit: 3, technicalFit: 1, criticality: 'Business critical', owner: 'Head of Data & Analytics', users: 380, annualCost: 520000, goLive: 2010, capabilityIds: ['C6.2', 'C1.4', 'C4.4'], techIds: ['T23', 'T16'], description: 'Legacy enterprise data warehouse.' },
  { id: 'A14', name: 'Databricks Lakehouse', vendor: 'Databricks', type: 'PaaS', hosting: 'Azure', lifecycle: 'Active', time: 'Invest', businessFit: 4, technicalFit: 5, criticality: 'Business critical', owner: 'Head of Data & Analytics', users: 210, annualCost: 340000, goLive: 2024, capabilityIds: ['C6.2', 'C1.4'], techIds: ['T22', 'T15', 'T07'], description: 'Strategic analytical data platform.' },
  { id: 'A15', name: 'Power BI', vendor: 'Microsoft', type: 'SaaS', hosting: 'SaaS', lifecycle: 'Active', time: 'Invest', businessFit: 4, technicalFit: 4, criticality: 'Business operational', owner: 'Head of Controlling', users: 1600, annualCost: 120000, goLive: 2019, capabilityIds: ['C4.4', 'C1.4'], techIds: ['T15'], description: 'Self-service BI and reporting.' },
  { id: 'A16', name: 'MuleSoft Anypoint ESB', vendor: 'Salesforce', type: 'COTS', hosting: 'On-Prem', lifecycle: 'Active', time: 'Tolerate', businessFit: 3, technicalFit: 3, criticality: 'Mission critical', owner: 'Head of Integration', users: 0, annualCost: 210000, goLive: 2016, capabilityIds: ['C6.3'], techIds: ['T20', 'T14', 'T16'], description: 'Central integration bus (most interfaces).' },
  { id: 'A17', name: 'Azure Integration Services', vendor: 'Microsoft', type: 'PaaS', hosting: 'Azure', lifecycle: 'Active', time: 'Invest', businessFit: 4, technicalFit: 5, criticality: 'Business critical', owner: 'Head of Integration', users: 0, annualCost: 60000, goLive: 2025, capabilityIds: ['C6.3'], techIds: ['T21', 'T15'], description: 'API Management, Logic Apps, Service Bus.' },
  { id: 'A18', name: 'Microsoft Entra ID', vendor: 'Microsoft', type: 'SaaS', hosting: 'SaaS', lifecycle: 'Active', time: 'Invest', businessFit: 5, technicalFit: 5, criticality: 'Mission critical', owner: 'CISO', users: 3400, annualCost: 150000, goLive: 2019, capabilityIds: ['C6.1'], techIds: ['T15'], description: 'Workforce & customer identity.' },
  { id: 'A19', name: 'Coupa Procurement', vendor: 'Coupa', type: 'SaaS', hosting: 'SaaS', lifecycle: 'Active', time: 'Tolerate', businessFit: 3, technicalFit: 4, criticality: 'Business operational', owner: 'Head of Procurement', users: 520, annualCost: 130000, goLive: 2020, capabilityIds: ['C4.3'], techIds: [], description: 'Source-to-pay and supplier management.' },
  { id: 'A20', name: 'Customer Portal', vendor: 'In-house', type: 'Custom', hosting: 'Azure', lifecycle: 'Active', time: 'Invest', businessFit: 4, technicalFit: 4, criticality: 'Business critical', owner: 'Head of Digital', users: 48000, annualCost: 160000, goLive: 2022, capabilityIds: ['C1.1', 'C1.3'], techIds: ['T06', 'T08', 'T13', 'T11', 'T15'], description: 'Self-service portal for B2B customers.' },
  { id: 'A21', name: 'Billing System (mainframe)', vendor: 'In-house', type: 'Custom', hosting: 'On-Prem', lifecycle: 'Active', time: 'Migrate', businessFit: 3, technicalFit: 1, criticality: 'Mission critical', owner: 'Head of Billing', users: 140, annualCost: 450000, goLive: 1998, capabilityIds: ['C4.2'], techIds: ['T05', 'T10'], description: 'COBOL-based billing; key-person risk.' },
  { id: 'A22', name: 'Akeneo PIM', vendor: 'Akeneo', type: 'COTS', hosting: 'Azure', lifecycle: 'Active', time: 'Invest', businessFit: 4, technicalFit: 4, criticality: 'Business operational', owner: 'Head of Product', users: 60, annualCost: 70000, goLive: 2021, capabilityIds: ['C3.1', 'C2.4'], techIds: ['T13', 'T11'], description: 'Product information management.' },
  { id: 'A23', name: 'Moodle LMS', vendor: 'Open Source', type: 'COTS', hosting: 'On-Prem', lifecycle: 'Phase-out', time: 'Eliminate', businessFit: 2, technicalFit: 2, criticality: 'Administrative', owner: 'Head of Talent', users: 3400, annualCost: 25000, goLive: 2013, capabilityIds: ['C5.3'], techIds: ['T31', 'T16', 'T14'], description: 'Legacy e-learning platform, replaced by Workday Learning.' },
  { id: 'A24', name: 'Splunk SIEM', vendor: 'Cisco', type: 'COTS', hosting: 'On-Prem', lifecycle: 'Active', time: 'Tolerate', businessFit: 4, technicalFit: 3, criticality: 'Mission critical', owner: 'CISO', users: 25, annualCost: 240000, goLive: 2018, capabilityIds: ['C6.4'], techIds: ['T17', 'T14'], description: 'Security information and event management.' },
  { id: 'A25', name: 'ServiceNow Field Service Mgmt', vendor: 'ServiceNow', type: 'SaaS', hosting: 'SaaS', lifecycle: 'Plan', time: 'Invest', businessFit: 4, technicalFit: 5, criticality: 'Business operational', owner: 'Head of Field Service', users: 260, annualCost: 110000, goLive: 2028, capabilityIds: ['C3.4'], techIds: [], description: 'Planned replacement of the custom field service app. Cost estimate.', estimatedCost: true },
  { id: 'A26', name: 'Subscription Billing (SaaS)', vendor: 'tbd (RFP)', type: 'SaaS', hosting: 'SaaS', lifecycle: 'Plan', time: 'Invest', businessFit: 4, technicalFit: 5, criticality: 'Mission critical', owner: 'Head of Billing', users: 140, annualCost: 260000, goLive: 2029, capabilityIds: ['C4.2'], techIds: [], description: 'Target billing platform – vendor selection pending. Cost estimate.', estimatedCost: true },
  { id: 'A27', name: 'GenAI Service Assistant', vendor: 'In-house', type: 'Custom', hosting: 'Azure', lifecycle: 'Plan', time: 'Invest', businessFit: 4, technicalFit: 4, criticality: 'Business operational', owner: 'Head of Customer Service', users: 640, annualCost: 90000, goLive: 2028, capabilityIds: ['C1.3', 'C1.4'], techIds: ['T25', 'T26', 'T07', 'T15'], description: 'AI copilot for service agents (idea stage). Cost estimate.', estimatedCost: true }
]

// Application state per plateau [baseline, t1, t2, target]
export const appRoadmap = {
  A01: ['Active', 'Active', 'Active', 'Active'],
  A02: ['Phase-out', 'Phase-out', 'Retired', 'Retired'],
  A03: ['Active', 'Active', 'Phase-out', 'Retired'],
  A04: [null, 'Planned', 'Active', 'Active'],
  A05: ['Active', 'Active', 'Active', 'Active'],
  A06: ['Active', 'Active', 'Phase-out', 'Retired'],
  A07: [null, 'Planned', 'Active', 'Active'],
  A08: ['Active', 'Active', 'Active', 'Active'],
  A09: ['Active', 'Active', 'Active', 'Active'],
  A10: ['Active', 'Active', 'Active', 'Active'],
  A11: ['Active', 'Active', 'Active', 'Retired'],
  A12: ['Active', 'Active', 'Active', 'Active'],
  A13: ['Phase-out', 'Phase-out', 'Retired', 'Retired'],
  A14: ['Active', 'Active', 'Active', 'Active'],
  A15: ['Active', 'Active', 'Active', 'Active'],
  A16: ['Active', 'Active', 'Phase-out', 'Retired'],
  A17: ['Active', 'Active', 'Active', 'Active'],
  A18: ['Active', 'Active', 'Active', 'Active'],
  A19: ['Active', 'Active', 'Active', 'Active'],
  A20: ['Active', 'Active', 'Active', 'Active'],
  A21: ['Active', 'Active', 'Active', 'Phase-out'],
  A22: ['Active', 'Active', 'Active', 'Active'],
  A23: ['Phase-out', 'Retired', 'Retired', 'Retired'],
  A24: ['Active', 'Active', 'Active', 'Active'],
  A25: [null, null, 'Planned', 'Active'],
  A26: [null, null, 'Planned', 'Planned'],
  A27: [null, null, 'Planned', 'Active']
}

export const interfaces = [
  { id: 'F01', from: 'A01', to: 'A03', dataIds: ['D03', 'D01'], via: 'A16', protocol: 'REST / IDoc', frequency: 'Near real-time' },
  { id: 'F02', from: 'A02', to: 'A01', dataIds: ['D01', 'D02'], via: 'A16', protocol: 'Batch file', frequency: 'Nightly' },
  { id: 'F03', from: 'A06', to: 'A03', dataIds: ['D03'], via: 'A16', protocol: 'SOAP', frequency: 'Near real-time' },
  { id: 'F04', from: 'A22', to: 'A06', dataIds: ['D04'], via: null, protocol: 'REST', frequency: 'Hourly' },
  { id: 'F05', from: 'A09', to: 'A06', dataIds: ['D05'], via: 'A16', protocol: 'REST', frequency: 'On request' },
  { id: 'F06', from: 'A09', to: 'A01', dataIds: ['D05'], via: 'A16', protocol: 'REST', frequency: 'On request' },
  { id: 'F07', from: 'A03', to: 'A21', dataIds: ['D03'], via: 'A16', protocol: 'Batch file', frequency: 'Nightly' },
  { id: 'F08', from: 'A21', to: 'A03', dataIds: ['D06', 'D14'], via: 'A16', protocol: 'Batch file', frequency: 'Nightly' },
  { id: 'F09', from: 'A03', to: 'A10', dataIds: ['D03', 'D11'], via: 'A16', protocol: 'IDoc', frequency: 'Near real-time' },
  { id: 'F10', from: 'A10', to: 'A03', dataIds: ['D12', 'D11'], via: 'A16', protocol: 'IDoc', frequency: 'Near real-time' },
  { id: 'F11', from: 'A19', to: 'A03', dataIds: ['D10', 'D09'], via: 'A17', protocol: 'REST', frequency: 'Hourly' },
  { id: 'F12', from: 'A08', to: 'A18', dataIds: ['D08'], via: null, protocol: 'SCIM', frequency: 'Real-time' },
  { id: 'F13', from: 'A03', to: 'A13', dataIds: ['D14', 'D03', 'D07'], via: null, protocol: 'ETL', frequency: 'Nightly' },
  { id: 'F14', from: 'A03', to: 'A14', dataIds: ['D14', 'D03'], via: null, protocol: 'CDC', frequency: 'Near real-time' },
  { id: 'F15', from: 'A01', to: 'A14', dataIds: ['D01', 'D02'], via: 'A17', protocol: 'Event', frequency: 'Real-time' },
  { id: 'F16', from: 'A14', to: 'A15', dataIds: ['D01', 'D03', 'D14'], via: null, protocol: 'SQL', frequency: 'On request' },
  { id: 'F17', from: 'A13', to: 'A15', dataIds: ['D14'], via: null, protocol: 'SQL', frequency: 'On request' },
  { id: 'F18', from: 'A05', to: 'A01', dataIds: ['D13', 'D01'], via: 'A17', protocol: 'REST', frequency: 'Real-time' },
  { id: 'F19', from: 'A20', to: 'A05', dataIds: ['D13'], via: 'A17', protocol: 'REST', frequency: 'Real-time' },
  { id: 'F20', from: 'A20', to: 'A01', dataIds: ['D01', 'D02'], via: 'A17', protocol: 'REST', frequency: 'Real-time' },
  { id: 'F21', from: 'A11', to: 'A03', dataIds: ['D13', 'D11'], via: 'A16', protocol: 'SOAP', frequency: 'Hourly' },
  { id: 'F22', from: 'A12', to: 'A01', dataIds: ['D02'], via: null, protocol: 'Native connector', frequency: 'Real-time' },
  { id: 'F23', from: 'A06', to: 'A14', dataIds: ['D15'], via: null, protocol: 'Event', frequency: 'Real-time' }
]

// ---------------------------------------------------------------------- Data
// crud: { appId: 'CRUD' subset }
export const dataObjects = [
  { id: 'D01', name: 'Customer', domain: 'Customer', classification: 'Confidential', pii: true, owner: 'Chief Customer Officer', masterAppId: 'A01', quality: 71, records: '1.2M', crud: { A01: 'CRUD', A02: 'CRU', A03: 'R', A20: 'RU', A05: 'R', A14: 'R', A13: 'R' } },
  { id: 'D02', name: 'Contact', domain: 'Customer', classification: 'Confidential', pii: true, owner: 'Head of Sales Ops', masterAppId: 'A01', quality: 64, records: '3.4M', crud: { A01: 'CRUD', A02: 'CRU', A12: 'CRU', A20: 'RU', A14: 'R' } },
  { id: 'D03', name: 'Sales Order', domain: 'Sales', classification: 'Internal', pii: false, owner: 'Head of Sales Ops', masterAppId: 'A03', quality: 88, records: '9.8M', crud: { A03: 'CRUD', A01: 'CR', A06: 'C', A21: 'R', A10: 'R', A13: 'R', A14: 'R' } },
  { id: 'D04', name: 'Product', domain: 'Product', classification: 'Public', pii: false, owner: 'Head of Product', masterAppId: 'A22', quality: 82, records: '45k', crud: { A22: 'CRUD', A03: 'RU', A06: 'R', A01: 'R' } },
  { id: 'D05', name: 'Price', domain: 'Sales', classification: 'Confidential', pii: false, owner: 'Head of Pricing', masterAppId: 'A09', quality: 90, records: '2.1M', crud: { A09: 'CRUD', A06: 'R', A01: 'R', A03: 'R' } },
  { id: 'D06', name: 'Invoice', domain: 'Finance', classification: 'Confidential', pii: true, owner: 'Head of Billing', masterAppId: 'A21', quality: 93, records: '14M', crud: { A21: 'CRUD', A03: 'CR', A20: 'R', A13: 'R' } },
  { id: 'D07', name: 'Payment', domain: 'Finance', classification: 'Restricted', pii: true, owner: 'Head of Accounting', masterAppId: 'A03', quality: 95, records: '12M', crud: { A03: 'CRUD', A21: 'R', A13: 'R' } },
  { id: 'D08', name: 'Employee', domain: 'People', classification: 'Restricted', pii: true, owner: 'Head of HR Ops', masterAppId: 'A08', quality: 91, records: '3.4k', crud: { A08: 'CRUD', A18: 'CRU', A23: 'R', A03: 'R' } },
  { id: 'D09', name: 'Supplier', domain: 'Procurement', classification: 'Internal', pii: false, owner: 'Head of Procurement', masterAppId: 'A19', quality: 77, records: '8.2k', crud: { A19: 'CRUD', A03: 'CRU' } },
  { id: 'D10', name: 'Purchase Order', domain: 'Procurement', classification: 'Internal', pii: false, owner: 'Head of Procurement', masterAppId: 'A19', quality: 86, records: '640k', crud: { A19: 'CRUD', A03: 'CRU' } },
  { id: 'D11', name: 'Inventory', domain: 'Supply Chain', classification: 'Internal', pii: false, owner: 'Head of Logistics', masterAppId: 'A10', quality: 79, records: '120k', crud: { A10: 'CRUD', A03: 'RU', A11: 'R' } },
  { id: 'D12', name: 'Shipment', domain: 'Supply Chain', classification: 'Internal', pii: true, owner: 'Head of Logistics', masterAppId: 'A10', quality: 84, records: '5.5M', crud: { A10: 'CRUD', A03: 'R', A20: 'R' } },
  { id: 'D13', name: 'Service Case', domain: 'Customer', classification: 'Confidential', pii: true, owner: 'Head of Customer Service', masterAppId: 'A05', quality: 68, records: '2.7M', crud: { A05: 'CRUD', A02: 'CRU', A20: 'CR', A11: 'RU', A01: 'R' } },
  { id: 'D14', name: 'GL Entry', domain: 'Finance', classification: 'Restricted', pii: false, owner: 'Head of Accounting', masterAppId: 'A03', quality: 97, records: '210M', crud: { A03: 'CRUD', A21: 'C', A13: 'R', A14: 'R', A15: 'R' } },
  { id: 'D15', name: 'Clickstream Event', domain: 'Digital', classification: 'Internal', pii: true, owner: 'Head of Digital', masterAppId: 'A06', quality: 58, records: '1.9B', crud: { A06: 'C', A14: 'CR' } }
]

// ---------------------------------------------------------------- Technology
// radar: Adopt / Trial / Assess / Hold ; eol: 'YYYY-MM' (vendor end of support)
export const technologies = [
  { id: 'T01', name: 'Java 8', category: 'Languages & Frameworks', vendor: 'Oracle', radar: 'Hold', eol: '2026-12' },
  { id: 'T02', name: 'Java 21 LTS', category: 'Languages & Frameworks', vendor: 'Oracle / OpenJDK', radar: 'Adopt', eol: '2031-09' },
  { id: 'T03', name: '.NET 8 LTS', category: 'Languages & Frameworks', vendor: 'Microsoft', radar: 'Hold', eol: '2026-11' },
  { id: 'T04', name: '.NET 10 LTS', category: 'Languages & Frameworks', vendor: 'Microsoft', radar: 'Adopt', eol: '2028-11' },
  { id: 'T05', name: 'COBOL / z/OS', category: 'Platforms & Infrastructure', vendor: 'IBM', radar: 'Hold', eol: '2028-12' },
  { id: 'T06', name: 'Node.js 22 LTS', category: 'Languages & Frameworks', vendor: 'OpenJS', radar: 'Adopt', eol: '2027-04' },
  { id: 'T07', name: 'Python 3.12', category: 'Languages & Frameworks', vendor: 'PSF', radar: 'Adopt', eol: '2028-10' },
  { id: 'T08', name: 'Vue.js 3', category: 'Languages & Frameworks', vendor: 'Open Source', radar: 'Adopt', eol: null },
  { id: 'T09', name: 'AngularJS 1.x', category: 'Languages & Frameworks', vendor: 'Google', radar: 'Hold', eol: '2021-12' },
  { id: 'T10', name: 'Oracle Database 19c', category: 'Data & Integration', vendor: 'Oracle', radar: 'Hold', eol: '2027-04' },
  { id: 'T11', name: 'PostgreSQL 16', category: 'Data & Integration', vendor: 'Open Source', radar: 'Adopt', eol: '2028-11' },
  { id: 'T12', name: 'SQL Server 2016', category: 'Data & Integration', vendor: 'Microsoft', radar: 'Hold', eol: '2026-07' },
  { id: 'T13', name: 'Azure Kubernetes Service', category: 'Platforms & Infrastructure', vendor: 'Microsoft', radar: 'Adopt', eol: null },
  { id: 'T14', name: 'VMware vSphere 7', category: 'Platforms & Infrastructure', vendor: 'Broadcom', radar: 'Hold', eol: '2025-10' },
  { id: 'T15', name: 'Microsoft Azure', category: 'Platforms & Infrastructure', vendor: 'Microsoft', radar: 'Adopt', eol: null },
  { id: 'T16', name: 'RHEL 7', category: 'Platforms & Infrastructure', vendor: 'Red Hat', radar: 'Hold', eol: '2024-06' },
  { id: 'T17', name: 'RHEL 9', category: 'Platforms & Infrastructure', vendor: 'Red Hat', radar: 'Adopt', eol: '2032-05' },
  { id: 'T18', name: 'Windows Server 2016', category: 'Platforms & Infrastructure', vendor: 'Microsoft', radar: 'Hold', eol: '2027-01' },
  { id: 'T19', name: 'Apache Kafka (Confluent)', category: 'Data & Integration', vendor: 'Confluent', radar: 'Trial', eol: null },
  { id: 'T20', name: 'MuleSoft Anypoint', category: 'Data & Integration', vendor: 'Salesforce', radar: 'Hold', eol: null },
  { id: 'T21', name: 'Azure Integration Services', category: 'Data & Integration', vendor: 'Microsoft', radar: 'Adopt', eol: null },
  { id: 'T22', name: 'Databricks', category: 'Data & Integration', vendor: 'Databricks', radar: 'Adopt', eol: null },
  { id: 'T23', name: 'Teradata', category: 'Data & Integration', vendor: 'Teradata', radar: 'Hold', eol: '2027-06' },
  { id: 'T24', name: 'Terraform', category: 'Tools & Practices', vendor: 'HashiCorp', radar: 'Adopt', eol: null },
  { id: 'T25', name: 'Azure OpenAI / GenAI', category: 'Tools & Practices', vendor: 'Microsoft', radar: 'Trial', eol: null },
  { id: 'T26', name: 'Vector DB (pgvector)', category: 'Data & Integration', vendor: 'Open Source', radar: 'Assess', eol: null },
  { id: 'T27', name: 'SAP HANA', category: 'Data & Integration', vendor: 'SAP', radar: 'Adopt', eol: null },
  { id: 'T28', name: 'SAP NetWeaver ABAP (ECC)', category: 'Platforms & Infrastructure', vendor: 'SAP', radar: 'Hold', eol: '2027-12' },
  { id: 'T29', name: 'GitHub Actions', category: 'Tools & Practices', vendor: 'GitHub', radar: 'Adopt', eol: null },
  { id: 'T30', name: 'Microsoft Fabric', category: 'Data & Integration', vendor: 'Microsoft', radar: 'Assess', eol: null },
  { id: 'T31', name: 'PHP 7.4', category: 'Languages & Frameworks', vendor: 'Open Source', radar: 'Hold', eol: '2022-11' },
  { id: 'T32', name: 'Platform Engineering / IDP', category: 'Tools & Practices', vendor: '—', radar: 'Trial', eol: null },
  { id: 'T33', name: 'FinOps practice', category: 'Tools & Practices', vendor: '—', radar: 'Adopt', eol: null },
  { id: 'T34', name: 'Agentic AI frameworks', category: 'Tools & Practices', vendor: '—', radar: 'Assess', eol: null }
]

// ------------------------------------------------- Implementation & Migration
// category: Run (keep the lights on) / Grow (improve) / Transform (new capabilities)
export const investments = [
  { id: 'I01', name: 'S/4HANA Transformation', category: 'Transform', status: 'In Progress', sponsor: 'CFO', goalIds: ['G2', 'G4'], capabilityIds: ['C4.1', 'C4.3', 'C3.2', 'C4.4'], appIds: ['A03', 'A04'], projectId: 'P01', budget: { 2025: 1200000, 2026: 3500000, 2027: 3000000, 2028: 1100000 }, capexShare: 0.75, roi: 0.18, priority: 95, benefit: 'Avoid ECC end-of-maintenance; harmonized finance processes.' },
  { id: 'I02', name: 'CRM Consolidation', category: 'Transform', status: 'In Progress', sponsor: 'CCO', goalIds: ['G1', 'G2'], capabilityIds: ['C1.2', 'C1.3'], appIds: ['A01', 'A02'], projectId: 'P02', budget: { 2025: 600000, 2026: 1400000, 2027: 300000 }, capexShare: 0.6, roi: 0.32, priority: 88, benefit: 'Single customer view; retire Siebel (CHF 380k/yr).' },
  { id: 'I03', name: 'Composable Commerce', category: 'Grow', status: 'Approved', sponsor: 'CCO', goalIds: ['G1', 'G4'], capabilityIds: ['C2.4', 'C2.3'], appIds: ['A06', 'A07'], projectId: 'P03', budget: { 2026: 400000, 2027: 1800000, 2028: 900000 }, capexShare: 0.7, roi: 0.24, priority: 80, benefit: '+12% online revenue; faster time-to-market.' },
  { id: 'I04', name: 'Lakehouse & DWH Decommissioning', category: 'Transform', status: 'In Progress', sponsor: 'CDO', goalIds: ['G3', 'G2'], capabilityIds: ['C6.2', 'C1.4', 'C4.4'], appIds: ['A13', 'A14', 'A15'], projectId: 'P04', budget: { 2025: 500000, 2026: 1100000, 2027: 700000 }, capexShare: 0.55, roi: 0.29, priority: 85, benefit: 'Retire Teradata (CHF 520k/yr); enable data products.' },
  { id: 'I05', name: 'Billing Modernization', category: 'Transform', status: 'Proposed', sponsor: 'CFO', goalIds: ['G2', 'G5'], capabilityIds: ['C4.2'], appIds: ['A21', 'A26'], projectId: 'P05', budget: { 2027: 1500000, 2028: 2200000, 2029: 1000000 }, capexShare: 0.7, roi: 0.15, priority: 78, benefit: 'Eliminate mainframe & key-person risk.' },
  { id: 'I06', name: 'Integration Platform Migration', category: 'Grow', status: 'Approved', sponsor: 'CIO', goalIds: ['G4', 'G2'], capabilityIds: ['C6.3'], appIds: ['A16', 'A17'], projectId: 'P06', budget: { 2026: 300000, 2027: 900000 }, capexShare: 0.6, roi: 0.21, priority: 74, benefit: 'API-first integration; retire MuleSoft licences.' },
  { id: 'I07', name: 'Field Service Mobile', category: 'Grow', status: 'Proposed', sponsor: 'COO', goalIds: ['G1', 'G2'], capabilityIds: ['C3.4'], appIds: ['A11', 'A25'], projectId: 'P07', budget: { 2027: 600000, 2028: 400000 }, capexShare: 0.6, roi: 0.19, priority: 61, benefit: 'First-time-fix rate +15%.' },
  { id: 'I08', name: 'Zero Trust IAM', category: 'Run', status: 'In Progress', sponsor: 'CISO', goalIds: ['G5'], capabilityIds: ['C6.1'], appIds: ['A18', 'A20'], projectId: 'P08', budget: { 2025: 300000, 2026: 600000, 2027: 200000 }, capexShare: 0.4, roi: null, priority: 90, benefit: 'Mandatory: reduce identity-related risk.' },
  { id: 'I09', name: 'GenAI Customer Service Assistant', category: 'Grow', status: 'Idea', sponsor: 'CCO', goalIds: ['G1', 'G3'], capabilityIds: ['C1.3', 'C1.4'], appIds: ['A05', 'A27'], projectId: 'P09', budget: { 2027: 350000, 2028: 500000 }, capexShare: 0.5, roi: 0.35, priority: 66, benefit: '-20% average handling time.' },
  { id: 'I10', name: 'SIEM Renewal & SOC Services', category: 'Run', status: 'Approved', sponsor: 'CISO', goalIds: ['G5'], capabilityIds: ['C6.4'], appIds: ['A24'], projectId: null, budget: { 2026: 240000, 2027: 250000, 2028: 250000 }, capexShare: 0, roi: null, priority: 82, benefit: 'Maintain detection & response.' },
  { id: 'I11', name: 'OS & Infrastructure Remediation', category: 'Run', status: 'Completed', sponsor: 'CIO', goalIds: ['G5', 'G4'], capabilityIds: ['C6.4'], appIds: [], projectId: null, budget: { 2024: 400000, 2025: 300000 }, capexShare: 0.5, roi: null, priority: 70, benefit: 'Removed Windows Server 2012 estate.' },
  { id: 'I12', name: 'Learning Platform Replacement', category: 'Run', status: 'Approved', sponsor: 'CPO', goalIds: ['G2'], capabilityIds: ['C5.3'], appIds: ['A23', 'A08'], projectId: null, budget: { 2026: 120000 }, capexShare: 0.3, roi: 0.1, priority: 40, benefit: 'Retire Moodle; use Workday Learning.' },
  { id: 'I13', name: 'Customer Portal 2.0', category: 'Grow', status: 'Approved', sponsor: 'CCO', goalIds: ['G1'], capabilityIds: ['C1.1', 'C1.3'], appIds: ['A20', 'A01'], projectId: 'P10', budget: { 2026: 250000, 2027: 600000 }, capexShare: 0.7, roi: 0.27, priority: 72, benefit: 'Self-service onboarding; NPS +4.' },
  { id: 'I14', name: 'Pricing Engine Re-platforming', category: 'Grow', status: 'Idea', sponsor: 'CCO', goalIds: ['G4', 'G2'], capabilityIds: ['C2.2'], appIds: ['A09'], projectId: null, budget: { 2028: 500000, 2029: 300000 }, capexShare: 0.8, roi: 0.12, priority: 52, benefit: 'Move off Java 8 / Oracle; cloud-native pricing.' }
]

// phase: Idea / Initiation / Planning / Execution / Closing
// impacts: change = Introduce | Modify | Retire
export const projects = [
  { id: 'P01', name: 'S/4HANA Transformation', investmentId: 'I01', phase: 'Execution', start: '2025-04', end: '2028-06', budget: 8800000, spent: 2900000, rag: 'Amber', manager: 'Project Office Finance', architect: 'Solution Architect ERP', archReview: 'Approved', capabilityIds: ['C4.1', 'C4.3', 'C3.2', 'C4.4'], impacts: [{ appId: 'A04', change: 'Introduce' }, { appId: 'A03', change: 'Retire' }, { appId: 'A19', change: 'Modify' }, { appId: 'A16', change: 'Modify' }], milestones: [{ name: 'Design complete', date: '2026-03' }, { name: 'Go-live Finance', date: '2027-07' }, { name: 'ECC shutdown', date: '2028-06' }], issues: 'Data migration quality behind plan.' },
  { id: 'P02', name: 'CRM Consolidation', investmentId: 'I02', phase: 'Execution', start: '2025-06', end: '2027-03', budget: 2300000, spent: 1400000, rag: 'Green', manager: 'PMO Customer', architect: 'Solution Architect CRM', archReview: 'Approved', capabilityIds: ['C1.2', 'C1.3'], impacts: [{ appId: 'A01', change: 'Modify' }, { appId: 'A02', change: 'Retire' }, { appId: 'A20', change: 'Modify' }], milestones: [{ name: 'Service desk migrated', date: '2026-10' }, { name: 'Siebel shutdown', date: '2027-03' }] },
  { id: 'P03', name: 'Composable Commerce', investmentId: 'I03', phase: 'Planning', start: '2026-09', end: '2028-06', budget: 3100000, spent: 100000, rag: 'Green', manager: 'PMO Digital', architect: 'Solution Architect Digital', archReview: 'Conditional', capabilityIds: ['C2.4', 'C2.3'], impacts: [{ appId: 'A07', change: 'Introduce' }, { appId: 'A06', change: 'Retire' }, { appId: 'A22', change: 'Modify' }, { appId: 'A09', change: 'Modify' }], milestones: [{ name: 'MVP storefront', date: '2027-06' }, { name: 'Magento shutdown', date: '2028-06' }] },
  { id: 'P04', name: 'Lakehouse & DWH Decommissioning', investmentId: 'I04', phase: 'Execution', start: '2025-03', end: '2027-06', budget: 2300000, spent: 1250000, rag: 'Red', manager: 'PMO Data', architect: 'Data Architect', archReview: 'Approved', capabilityIds: ['C6.2', 'C1.4', 'C4.4'], impacts: [{ appId: 'A14', change: 'Modify' }, { appId: 'A13', change: 'Retire' }, { appId: 'A15', change: 'Modify' }], milestones: [{ name: 'Finance data products', date: '2026-06' }, { name: 'Teradata shutdown', date: '2027-06' }], issues: '140 legacy reports not yet migrated; Teradata contract renewal risk.' },
  { id: 'P05', name: 'Billing Modernization', investmentId: 'I05', phase: 'Initiation', start: '2027-03', end: '2029-06', budget: 4700000, spent: 0, rag: 'Green', manager: 'tbd', architect: 'Solution Architect Finance', archReview: 'Pending', capabilityIds: ['C4.2'], impacts: [{ appId: 'A26', change: 'Introduce' }, { appId: 'A21', change: 'Retire' }], milestones: [{ name: 'Vendor selection', date: '2027-06' }] },
  { id: 'P06', name: 'Integration Platform Migration', investmentId: 'I06', phase: 'Planning', start: '2026-05', end: '2027-12', budget: 1200000, spent: 150000, rag: 'Amber', manager: 'PMO Platforms', architect: 'Integration Architect', archReview: 'Approved', capabilityIds: ['C6.3'], impacts: [{ appId: 'A17', change: 'Modify' }, { appId: 'A16', change: 'Retire' }], milestones: [{ name: '50% interfaces migrated', date: '2027-04' }, { name: 'MuleSoft shutdown', date: '2027-12' }], issues: 'Dependent on S/4HANA interface design.' },
  { id: 'P07', name: 'Field Service Mobile', investmentId: 'I07', phase: 'Initiation', start: '2027-01', end: '2028-03', budget: 1000000, spent: 0, rag: 'Green', manager: 'tbd', architect: 'Solution Architect Ops', archReview: 'Not submitted', capabilityIds: ['C3.4'], impacts: [{ appId: 'A25', change: 'Introduce' }, { appId: 'A11', change: 'Retire' }, { appId: 'A05', change: 'Modify' }], milestones: [] },
  { id: 'P08', name: 'Zero Trust IAM', investmentId: 'I08', phase: 'Execution', start: '2025-01', end: '2027-03', budget: 1100000, spent: 820000, rag: 'Green', manager: 'PMO Security', architect: 'Security Architect', archReview: 'Approved', capabilityIds: ['C6.1'], impacts: [{ appId: 'A18', change: 'Modify' }, { appId: 'A20', change: 'Modify' }], milestones: [{ name: 'MFA everywhere', date: '2026-02' }, { name: 'Conditional access', date: '2026-12' }] },
  { id: 'P09', name: 'GenAI Customer Service Assistant', investmentId: 'I09', phase: 'Idea', start: '2027-04', end: '2028-06', budget: 850000, spent: 0, rag: 'Green', manager: 'tbd', architect: 'tbd', archReview: 'Not submitted', capabilityIds: ['C1.3', 'C1.4'], impacts: [{ appId: 'A27', change: 'Introduce' }, { appId: 'A05', change: 'Modify' }, { appId: 'A14', change: 'Modify' }], milestones: [] },
  { id: 'P10', name: 'Customer Portal 2.0', investmentId: 'I13', phase: 'Planning', start: '2026-07', end: '2027-09', budget: 850000, spent: 60000, rag: 'Green', manager: 'PMO Digital', architect: 'Solution Architect Digital', archReview: 'Conditional', capabilityIds: ['C1.1', 'C1.3'], impacts: [{ appId: 'A20', change: 'Modify' }, { appId: 'A01', change: 'Modify' }, { appId: 'A05', change: 'Modify' }], milestones: [{ name: 'Self-service onboarding', date: '2027-03' }] }
]

// ---------------------------------------------------------------- Governance
export const adrs = [
  { id: 'ADR-001', title: 'Microsoft Azure as primary cloud platform', status: 'Accepted', date: '2023-02', domain: 'Technology', context: 'Need a strategic hyperscaler for custom and PaaS workloads.', decision: 'Azure is the default platform; other clouds by exception.', consequences: 'Skills focus on Azure; landing zone owned by Platform team.' },
  { id: 'ADR-002', title: 'Salesforce as CRM system of record', status: 'Accepted', date: '2024-05', domain: 'Application', context: 'Two CRMs (Siebel, Salesforce) with overlapping data.', decision: 'Consolidate on Salesforce; retire Siebel by 2027.', consequences: 'Service desk processes move to Salesforce/ServiceNow.' },
  { id: 'ADR-003', title: 'Replace MuleSoft with Azure Integration Services', status: 'Accepted', date: '2025-09', domain: 'Application', context: 'MuleSoft licence renewal + on-prem runtime.', decision: 'New interfaces on AIS; migrate existing by end 2027.', consequences: 'Dual-run 2026–2027; dependency on S/4 interface design.' },
  { id: 'ADR-004', title: 'Databricks Lakehouse as analytical platform', status: 'Accepted', date: '2024-01', domain: 'Data', context: 'Teradata cost and limited ML support.', decision: 'Databricks on Azure is the strategic data platform.', consequences: 'Teradata decommissioned; supersedes ADR-000.' },
  { id: 'ADR-005', title: 'Composable (MACH) commerce architecture', status: 'Proposed', date: '2026-08', domain: 'Application', context: 'Monolithic webshop limits time-to-market.', decision: 'Headless commerce with best-of-breed services.', consequences: 'Higher integration effort; requires API-first maturity.' },
  { id: 'ADR-006', title: 'Event streaming with Kafka for real-time integration', status: 'Proposed', date: '2026-10', domain: 'Technology', context: 'Growing need for real-time data products.', decision: 'Pilot Confluent Kafka for order and stock events.', consequences: 'New platform capability; overlaps with Azure Service Bus.' },
  { id: 'ADR-000', title: 'Teradata as enterprise data warehouse', status: 'Superseded', date: '2010-03', domain: 'Data', context: 'Need for central reporting.', decision: 'Teradata EDW.', consequences: 'Superseded by ADR-004.' }
]
