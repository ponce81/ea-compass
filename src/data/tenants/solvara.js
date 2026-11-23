// Solvara Insurance – fictional P&C insurer (Netherlands). All data is fictional.
import { cap1, cap2, app, tech, iface, dataObj, inv, proj, plateausFrom } from '../helpers'
import { libraryPrinciples } from '../library'

export const company = { name: 'Solvara Insurance', currency: 'EUR' }

export const plateaus = plateausFrom(2025, [
  'Mainframe policy administration, Guidewire ClaimCenter live.',
  'Motor line migrated to PolicyCenter, Snowflake live.',
  'All personal lines on PolicyCenter, AI claims triage live.',
  'Mainframe decommissioned; real-time, event-driven insurer.'
])

export const drivers = [
  { id: 'DR1', name: 'Mainframe cost and skills scarcity', type: 'Internal' },
  { id: 'DR2', name: 'Embedded insurance & digital distribution', type: 'External' },
  { id: 'DR3', name: 'IFRS 17 / Solvency II reporting load', type: 'Regulatory' },
  { id: 'DR4', name: 'Rising claims fraud', type: 'External' }
]

export const goals = [
  { id: 'G1', name: 'Speed to Market', description: 'Launch new products in weeks, not months.', kpi: 'Product launch lead time (weeks)', baseline: 32, current: 26, target: 6, unit: '', driverIds: ['DR2'], lowerIsBetter: true },
  { id: 'G2', name: 'Claims Excellence', description: 'Straight-through processing and lower leakage.', kpi: 'Claims STP rate', baseline: 18, current: 27, target: 55, unit: '%', driverIds: ['DR4'] },
  { id: 'G3', name: 'Cost Efficiency', description: 'Reduce combined ratio through lower IT and process cost.', kpi: 'IT cost per policy (EUR)', baseline: 41, current: 39, target: 30, unit: '', driverIds: ['DR1'], lowerIsBetter: true },
  { id: 'G4', name: 'Regulatory Confidence', description: 'Automated, auditable regulatory reporting.', kpi: 'Manual reporting steps', baseline: 140, current: 96, target: 20, unit: '', driverIds: ['DR3'], lowerIsBetter: true }
]

export const principles = JSON.parse(JSON.stringify(libraryPrinciples))

export const capabilities = [
  cap1('C1', 'Distribution', 'Chief Commercial Officer'),
  cap2('C1.1', 'Broker Management', 'C1', 3, 4, 'High', 'Head of Broker Channel'),
  cap2('C1.2', 'Direct Sales (online)', 'C1', 2, 4, 'High', 'Head of Digital'),
  cap2('C1.3', 'Embedded / Partner Insurance', 'C1', 1, 4, 'Medium', 'Head of Partnerships'),
  cap1('C2', 'Underwriting & Product', 'Chief Underwriting Officer'),
  cap2('C2.1', 'Product Configuration', 'C2', 1, 4, 'High', 'Head of Product'),
  cap2('C2.2', 'Pricing & Rating', 'C2', 3, 5, 'High', 'Head of Pricing'),
  cap2('C2.3', 'Risk Assessment', 'C2', 3, 4, 'Medium', 'Head of Underwriting'),
  cap1('C3', 'Policy Administration', 'Chief Operating Officer'),
  cap2('C3.1', 'Policy Issuance', 'C3', 2, 4, 'High', 'Head of Operations'),
  cap2('C3.2', 'Endorsements & Renewals', 'C3', 2, 4, 'High', 'Head of Operations'),
  cap2('C3.3', 'Billing & Collections', 'C3', 3, 4, 'Medium', 'Head of Finance Operations'),
  cap1('C4', 'Claims', 'Chief Claims Officer'),
  cap2('C4.1', 'First Notice of Loss', 'C4', 3, 5, 'High', 'Head of Claims'),
  cap2('C4.2', 'Claims Handling & Settlement', 'C4', 3, 4, 'High', 'Head of Claims'),
  cap2('C4.3', 'Fraud Detection', 'C4', 2, 4, 'High', 'Head of Special Investigations'),
  cap1('C5', 'Finance & Risk', 'Chief Financial Officer'),
  cap2('C5.1', 'Financial Accounting (IFRS 17)', 'C5', 3, 4, 'High', 'Head of Accounting'),
  cap2('C5.2', 'Actuarial & Solvency II', 'C5', 3, 4, 'High', 'Chief Actuary'),
  cap2('C5.3', 'Reinsurance Management', 'C5', 1, 3, 'Medium', 'Head of Reinsurance'),
  cap1('C6', 'IT & Data', 'Chief Information Officer'),
  cap2('C6.1', 'Identity & Access Mgmt', 'C6', 3, 4, 'High', 'CISO'),
  cap2('C6.2', 'Data & Analytics Platform', 'C6', 2, 4, 'High', 'Chief Data Officer'),
  cap2('C6.3', 'Integration & Events', 'C6', 2, 4, 'High', 'Head of Integration')
]

export const valueStreams = [
  { id: 'VS1', name: 'Quote-to-Policy', stakeholder: 'Customer / Broker', stages: [
    { name: 'Quote', capabilityIds: ['C2.2', 'C1.1', 'C1.2'] },
    { name: 'Underwrite', capabilityIds: ['C2.3'] },
    { name: 'Issue', capabilityIds: ['C3.1'] },
    { name: 'Bill', capabilityIds: ['C3.3'] }
  ] },
  { id: 'VS2', name: 'Claim-to-Settlement', stakeholder: 'Policyholder', stages: [
    { name: 'Report', capabilityIds: ['C4.1'] },
    { name: 'Assess', capabilityIds: ['C4.2', 'C4.3'] },
    { name: 'Settle', capabilityIds: ['C4.2', 'C3.3'] },
    { name: 'Recover', capabilityIds: ['C5.3'] }
  ] }
]

export const technologies = [
  tech('T01', 'IBM z/OS + COBOL', 'Platforms & Infrastructure', 'IBM', 'Hold', '2028-12'),
  tech('T02', 'Java 21 LTS', 'Languages & Frameworks', 'OpenJDK', 'Adopt', '2031-09'),
  tech('T03', 'Guidewire Cloud Platform', 'Platforms & Infrastructure', 'Guidewire', 'Adopt'),
  tech('T04', 'Amazon Web Services', 'Platforms & Infrastructure', 'AWS', 'Adopt'),
  tech('T05', 'Oracle Database 19c', 'Data & Integration', 'Oracle', 'Hold', '2027-04'),
  tech('T06', 'Snowflake', 'Data & Integration', 'Snowflake', 'Adopt'),
  tech('T07', 'Apache Kafka (Amazon MSK)', 'Data & Integration', 'AWS', 'Trial'),
  tech('T08', 'Microsoft Access', 'Tools & Practices', 'Microsoft', 'Hold'),
  tech('T09', 'Angular 17', 'Languages & Frameworks', 'Google', 'Adopt'),
  tech('T10', 'Python 3.12', 'Languages & Frameworks', 'PSF', 'Adopt', '2028-10'),
  tech('T11', 'Informatica PowerCenter', 'Data & Integration', 'Informatica', 'Hold', '2026-03'),
  tech('T12', 'GenAI document extraction', 'Tools & Practices', '—', 'Trial'),
  tech('T13', 'Okta', 'Platforms & Infrastructure', 'Okta', 'Adopt')
]

export const applications = [
  app('A01', 'Policy Admin (mainframe)', 'In-house', 'Custom', 'On-Prem', 'Active', 'Eliminate', 3, 1, 'Mission critical', 'Head of Operations', 650, 2100000, 1994, ['C3.1', 'C3.2', 'C3.3', 'C2.2'], ['T01'], 'Legacy policy administration for all lines.'),
  app('A02', 'Guidewire PolicyCenter', 'Guidewire', 'SaaS', 'SaaS', 'Active', 'Invest', 4, 5, 'Mission critical', 'Head of Operations', 650, 1300000, 2026, ['C3.1', 'C3.2', 'C2.1'], ['T03'], 'Target policy administration (motor line live).'),
  app('A03', 'Guidewire ClaimCenter', 'Guidewire', 'SaaS', 'SaaS', 'Active', 'Invest', 4, 5, 'Mission critical', 'Head of Claims', 480, 980000, 2022, ['C4.1', 'C4.2'], ['T03'], 'Claims handling.'),
  app('A04', 'Rating Engine', 'In-house', 'Custom', 'AWS', 'Active', 'Tolerate', 4, 3, 'Business critical', 'Head of Pricing', 40, 220000, 2017, ['C2.2'], ['T02', 'T04'], 'Pricing models and tariff calculation.'),
  app('A05', 'Broker Portal', 'In-house', 'Custom', 'AWS', 'Active', 'Invest', 3, 3, 'Business critical', 'Head of Broker Channel', 1900, 260000, 2019, ['C1.1'], ['T09', 'T02', 'T04'], 'Quotes and policy servicing for brokers.'),
  app('A06', 'Salesforce Financial Services Cloud', 'Salesforce', 'SaaS', 'SaaS', 'Active', 'Invest', 4, 5, 'Business critical', 'Head of Digital', 300, 340000, 2023, ['C1.1', 'C1.2'], [], 'CRM for brokers and direct customers.'),
  app('A07', 'FRISS Fraud Detection', 'FRISS', 'SaaS', 'SaaS', 'Active', 'Invest', 4, 4, 'Business critical', 'Head of Special Investigations', 30, 180000, 2024, ['C4.3', 'C2.3'], [], 'Fraud scoring at FNOL and underwriting.'),
  app('A08', 'SAP S/4HANA Finance', 'SAP', 'SaaS', 'SaaS', 'Active', 'Invest', 4, 4, 'Mission critical', 'Head of Accounting', 160, 620000, 2023, ['C5.1', 'C3.3'], [], 'General ledger and IFRS 17 sub-ledger integration.'),
  app('A09', 'IFRS 17 Engine', 'tbd vendor', 'COTS', 'AWS', 'Active', 'Tolerate', 3, 3, 'Mission critical', 'Head of Accounting', 25, 450000, 2022, ['C5.1'], ['T05', 'T04'], 'Contract service margin calculation.'),
  app('A10', 'Actuarial Modelling (Prophet)', 'FIS', 'COTS', 'On-Prem', 'Active', 'Tolerate', 4, 2, 'Business critical', 'Chief Actuary', 35, 310000, 2012, ['C5.2'], ['T05'], 'Solvency II and pricing models.'),
  app('A11', 'Reinsurance Tracker (Access)', 'In-house', 'Custom', 'On-Prem', 'Active', 'Eliminate', 2, 1, 'Business operational', 'Head of Reinsurance', 8, 15000, 2009, ['C5.3'], ['T08'], 'End-user computing; audit finding.'),
  app('A12', 'Oracle Data Warehouse', 'Oracle', 'COTS', 'On-Prem', 'Phase-out', 'Eliminate', 3, 2, 'Business critical', 'Chief Data Officer', 220, 480000, 2011, ['C6.2', 'C5.2'], ['T05', 'T11'], 'Legacy DWH with Informatica ETL.'),
  app('A13', 'Snowflake Data Cloud', 'Snowflake', 'SaaS', 'SaaS', 'Active', 'Invest', 4, 5, 'Business critical', 'Chief Data Officer', 240, 360000, 2025, ['C6.2', 'C5.2'], ['T06', 'T10'], 'Target data platform.'),
  app('A14', 'Event Platform (MSK)', 'AWS', 'PaaS', 'AWS', 'Active', 'Invest', 3, 4, 'Business critical', 'Head of Integration', 0, 120000, 2025, ['C6.3'], ['T07', 'T04'], 'Event streaming backbone (pilot).'),
  app('A15', 'Okta Workforce & Customer Identity', 'Okta', 'SaaS', 'SaaS', 'Active', 'Invest', 5, 5, 'Mission critical', 'CISO', 2400, 210000, 2021, ['C6.1'], ['T13'], 'Identity for employees, brokers and customers.'),
  app('A16', 'Embedded Insurance API', 'In-house', 'Custom', 'AWS', 'Plan', 'Invest', 4, 5, 'Business critical', 'Head of Partnerships', 0, 150000, 2027, ['C1.3', 'C2.1'], ['T02', 'T04', 'T07'], 'Partner APIs for embedded products. Cost estimate.', { estimatedCost: true }),
  app('A17', 'AI Claims Triage', 'In-house', 'Custom', 'AWS', 'Plan', 'Invest', 4, 4, 'Business operational', 'Head of Claims', 480, 140000, 2027, ['C4.1', 'C4.2'], ['T12', 'T10', 'T04'], 'Document extraction and triage. Cost estimate.', { estimatedCost: true }),
  app('A18', 'Reinsurance Management (SaaS)', 'tbd (RFP)', 'SaaS', 'SaaS', 'Plan', 'Invest', 4, 5, 'Business operational', 'Head of Reinsurance', 8, 90000, 2027, ['C5.3'], [], 'Replacement of the Access tool. Cost estimate.', { estimatedCost: true })
]

export const appRoadmap = {
  A01: ['Active', 'Phase-out', 'Phase-out', 'Retired'],
  A02: ['Active', 'Active', 'Active', 'Active'],
  A03: ['Active', 'Active', 'Active', 'Active'],
  A04: ['Active', 'Active', 'Active', 'Active'],
  A05: ['Active', 'Active', 'Active', 'Active'],
  A06: ['Active', 'Active', 'Active', 'Active'],
  A07: ['Active', 'Active', 'Active', 'Active'],
  A08: ['Active', 'Active', 'Active', 'Active'],
  A09: ['Active', 'Active', 'Active', 'Active'],
  A10: ['Active', 'Active', 'Active', 'Active'],
  A11: ['Active', 'Active', 'Retired', 'Retired'],
  A12: ['Phase-out', 'Phase-out', 'Retired', 'Retired'],
  A13: ['Active', 'Active', 'Active', 'Active'],
  A14: ['Active', 'Active', 'Active', 'Active'],
  A15: ['Active', 'Active', 'Active', 'Active'],
  A16: [null, 'Planned', 'Active', 'Active'],
  A17: [null, 'Planned', 'Active', 'Active'],
  A18: [null, 'Planned', 'Active', 'Active']
}

export const dataObjects = [
  dataObj('D01', 'Policyholder', 'Customer', 'Confidential', true, 'Head of Operations', 'A01', 74, '1.6M', { A01: 'CRUD', A02: 'CRU', A06: 'CRU', A03: 'R', A05: 'R', A13: 'R', A12: 'R' }),
  dataObj('D02', 'Policy', 'Policy', 'Confidential', true, 'Head of Operations', 'A01', 86, '2.3M', { A01: 'CRUD', A02: 'CRUD', A03: 'R', A05: 'R', A09: 'R', A13: 'R', A12: 'R' }),
  dataObj('D03', 'Quote', 'Policy', 'Internal', true, 'Head of Pricing', 'A04', 81, '8.9M', { A04: 'CRUD', A05: 'CR', A02: 'R' }),
  dataObj('D04', 'Claim', 'Claims', 'Confidential', true, 'Head of Claims', 'A03', 89, '1.1M', { A03: 'CRUD', A07: 'R', A13: 'R', A12: 'R', A08: 'R' }),
  dataObj('D05', 'Broker', 'Distribution', 'Internal', false, 'Head of Broker Channel', 'A06', 92, '3.2k', { A06: 'CRUD', A05: 'R', A01: 'RU', A02: 'R' }),
  dataObj('D06', 'Premium Transaction', 'Finance', 'Confidential', false, 'Head of Finance Operations', 'A01', 94, '41M', { A01: 'CRUD', A02: 'CR', A08: 'CR', A09: 'R' }),
  dataObj('D07', 'IFRS 17 Contract Group', 'Finance', 'Restricted', false, 'Head of Accounting', 'A09', 90, '12k', { A09: 'CRUD', A08: 'R', A10: 'R' }),
  dataObj('D08', 'Reinsurance Treaty', 'Risk', 'Confidential', false, 'Head of Reinsurance', 'A11', 52, '140', { A11: 'CRUD', A10: 'R' })
]

export const interfaces = [
  iface('F01', 'A05', 'A04', ['D03'], null, 'REST', 'On request'),
  iface('F02', 'A05', 'A01', ['D02', 'D01'], null, 'MQ / CICS', 'Real-time'),
  iface('F03', 'A02', 'A04', ['D03'], null, 'REST', 'On request'),
  iface('F04', 'A03', 'A07', ['D04'], null, 'REST', 'Real-time'),
  iface('F05', 'A01', 'A03', ['D02', 'D01'], null, 'Batch file', 'Nightly'),
  iface('F06', 'A02', 'A14', ['D02'], null, 'Event', 'Real-time'),
  iface('F07', 'A14', 'A13', ['D02', 'D04'], null, 'Event', 'Real-time'),
  iface('F08', 'A01', 'A12', ['D02', 'D06'], null, 'ETL (Informatica)', 'Nightly'),
  iface('F09', 'A12', 'A09', ['D06'], null, 'ETL (Informatica)', 'Monthly'),
  iface('F10', 'A09', 'A08', ['D07'], null, 'File', 'Monthly'),
  iface('F11', 'A06', 'A05', ['D05'], null, 'REST', 'Real-time'),
  iface('F12', 'A03', 'A08', ['D04'], null, 'REST', 'Daily')
]

export const investments = [
  inv('I01', 'Core Policy Transformation', 'Transform', 'In Progress', 'COO', ['G1', 'G3'], ['C3.1', 'C3.2', 'C2.1'], ['A01', 'A02'], 'P01', { 2024: 3200000, 2025: 5800000, 2026: 6400000, 2027: 4100000, 2028: 1500000 }, 0.75, 0.16, 97, 'Retire mainframe (EUR 2.1M/yr); product launch in weeks.'),
  inv('I02', 'AI Claims Triage', 'Grow', 'Approved', 'CCO', ['G2'], ['C4.1', 'C4.2'], ['A03', 'A17'], 'P02', { 2026: 400000, 2027: 600000 }, 0.6, 0.41, 88, 'STP +15 pts; lower claims handling cost.'),
  inv('I03', 'Data Platform Migration', 'Transform', 'In Progress', 'CDO', ['G4', 'G3'], ['C6.2', 'C5.2'], ['A12', 'A13'], 'P03', { 2025: 700000, 2026: 1100000, 2027: 400000 }, 0.55, 0.24, 85, 'Retire Oracle DWH and Informatica.'),
  inv('I04', 'Embedded Insurance Platform', 'Grow', 'Proposed', 'CCO', ['G1'], ['C1.3', 'C2.1'], ['A16', 'A14'], 'P04', { 2027: 900000, 2028: 700000 }, 0.7, 0.33, 74, 'New partner channel; EUR 12M GWP in 3 years.'),
  inv('I05', 'Reinsurance Tool Replacement', 'Run', 'Approved', 'CFO', ['G4'], ['C5.3'], ['A11', 'A18'], 'P05', { 2026: 120000, 2027: 180000 }, 0.4, null, 80, 'Close audit finding on end-user computing.'),
  inv('I06', 'Broker Portal Revamp', 'Grow', 'Idea', 'CCO', ['G1'], ['C1.1'], ['A05'], null, { 2028: 600000 }, 0.7, 0.2, 55, 'Self-service for brokers on PolicyCenter.')
]

export const projects = [
  proj('P01', 'Core Policy Transformation', 'I01', 'Execution', '2024-03', '2028-06', 21000000, 11600000, 'Amber', 'Transformation Office', 'Lead Solution Architect', 'Approved', ['C3.1', 'C3.2', 'C2.1'],
    [['A02', 'Modify'], ['A01', 'Retire'], ['A04', 'Modify'], ['A05', 'Modify']],
    [['Motor line live', '2026-02'], ['Home line live', '2027-03'], ['Mainframe shutdown', '2028-06']], 'Home-line product rules more complex than estimated.'),
  proj('P02', 'AI Claims Triage', 'I02', 'Planning', '2026-06', '2027-09', 1000000, 90000, 'Green', 'Claims PMO', 'AI Architect', 'Conditional', ['C4.1', 'C4.2'],
    [['A17', 'Introduce'], ['A03', 'Modify']], [['Pilot motor glass claims', '2027-01']], 'Model governance (EU AI Act) to be defined.'),
  proj('P03', 'Data Platform Migration', 'I03', 'Execution', '2025-02', '2027-06', 2200000, 1500000, 'Red', 'Data Office', 'Data Architect', 'Approved', ['C6.2', 'C5.2'],
    [['A13', 'Modify'], ['A12', 'Retire'], ['A09', 'Modify']], [['Solvency II QRTs on Snowflake', '2026-12']], 'Informatica licence ends 2026-03; ETL migration late.'),
  proj('P04', 'Embedded Insurance Platform', 'I04', 'Initiation', '2027-01', '2028-06', 1600000, 0, 'Green', 'tbd', 'Integration Architect', 'Pending', ['C1.3', 'C2.1'],
    [['A16', 'Introduce'], ['A14', 'Modify'], ['A02', 'Modify']], [['First partner live', '2027-10']]),
  proj('P05', 'Reinsurance Tool Replacement', 'I05', 'Planning', '2026-09', '2027-06', 300000, 20000, 'Green', 'Finance PMO', 'Solution Architect Finance', 'Approved', ['C5.3'],
    [['A18', 'Introduce'], ['A11', 'Retire']], [['Go-live', '2027-05']])
]

export const adrs = [
  { id: 'ADR-001', title: 'Guidewire InsuranceSuite on Guidewire Cloud', status: 'Accepted', date: '2023-06', domain: 'Application', context: 'Mainframe policy administration is end of life.', decision: 'Adopt Guidewire PolicyCenter/ClaimCenter as SaaS.', consequences: 'Line-by-line migration until 2028.' },
  { id: 'ADR-002', title: 'AWS as primary cloud', status: 'Accepted', date: '2022-11', domain: 'Technology', context: 'Custom workloads need a strategic platform.', decision: 'AWS for all custom workloads.', consequences: 'Remaining on-prem workloads exit by 2028.' },
  { id: 'ADR-003', title: 'Event-driven integration on Kafka', status: 'Proposed', date: '2026-07', domain: 'Application', context: 'Batch interfaces delay data products and partner APIs.', decision: 'Policy and claim events on Amazon MSK.', consequences: 'Event catalog and schema registry required.' }
]
