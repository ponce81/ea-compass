// Meridian Health Network – fictional hospital group (Germany). All data is fictional.
import { cap1, cap2, app, tech, iface, dataObj, inv, proj, plateausFrom } from '../helpers'
import { libraryPrinciples } from '../library'

export const company = { name: 'Meridian Health Network', currency: 'EUR' }

export const plateaus = plateausFrom(2025, [
  'Current state: SAP IS-H based hospital information system, point-to-point HL7.',
  'FHIR integration platform live, health data platform in production.',
  'New EHR live in two hospitals, IS-H decommissioning started.',
  'Integrated, FHIR-based clinical landscape across all sites.'
])

export const drivers = [
  { id: 'DR1', name: 'SAP IS-H end of maintenance (2027)', type: 'Internal' },
  { id: 'DR2', name: 'Hospital Future Act funding deadlines', type: 'Regulatory' },
  { id: 'DR3', name: 'NIS2 / critical infrastructure obligations', type: 'Regulatory' },
  { id: 'DR4', name: 'Shortage of nursing staff', type: 'External' }
]

export const goals = [
  { id: 'G1', name: 'Patient Experience', description: 'Digital, seamless patient journeys.', kpi: 'Online appointment share', baseline: 12, current: 21, target: 60, unit: '%', driverIds: ['DR2'] },
  { id: 'G2', name: 'Clinical Safety & Quality', description: 'One electronic health record, closed-loop medication.', kpi: 'Closed-loop medication coverage', baseline: 15, current: 22, target: 90, unit: '%', driverIds: ['DR1', 'DR2'] },
  { id: 'G3', name: 'Staff Efficiency', description: 'Give time back to clinicians.', kpi: 'Documentation time per shift (min)', baseline: 140, current: 128, target: 90, unit: '', driverIds: ['DR4'], lowerIsBetter: true },
  { id: 'G4', name: 'Security & Resilience', description: 'Meet NIS2 and critical-infrastructure requirements.', kpi: 'NIS2 controls implemented', baseline: 38, current: 61, target: 100, unit: '%', driverIds: ['DR3'] }
]

export const principles = JSON.parse(JSON.stringify(libraryPrinciples)).concat([
  { id: 'PR9', name: 'FHIR-first Interoperability', domain: 'Application', statement: 'Clinical data is exchanged via HL7 FHIR APIs.', rationale: 'Vendor independence and regulatory interoperability requirements.', implications: 'New clinical systems must offer FHIR R4 interfaces.' }
])

export const capabilities = [
  cap1('C1', 'Patient Access', 'Chief Operating Officer'),
  cap2('C1.1', 'Appointment Scheduling', 'C1', 2, 4, 'High', 'Head of Patient Services', 'Booking of outpatient and elective appointments.'),
  cap2('C1.2', 'Patient Registration & Admission', 'C1', 3, 4, 'High', 'Head of Patient Services'),
  cap2('C1.3', 'Patient Portal & Communication', 'C1', 1, 4, 'Medium', 'Head of Digital Health'),
  cap1('C2', 'Clinical Care', 'Chief Medical Officer'),
  cap2('C2.1', 'Clinical Documentation (EHR)', 'C2', 2, 5, 'High', 'Chief Medical Information Officer'),
  cap2('C2.2', 'Medication Management', 'C2', 2, 4, 'High', 'Head of Pharmacy'),
  cap2('C2.3', 'Diagnostic Imaging', 'C2', 4, 4, 'High', 'Head of Radiology'),
  cap2('C2.4', 'Laboratory Diagnostics', 'C2', 3, 4, 'High', 'Head of Laboratory'),
  cap1('C3', 'Care Operations', 'Chief Operating Officer'),
  cap2('C3.1', 'Bed & Capacity Management', 'C3', 1, 4, 'High', 'Head of Patient Flow'),
  cap2('C3.2', 'Staff Rostering', 'C3', 3, 4, 'Medium', 'Director of Nursing'),
  cap2('C3.3', 'Pharmacy & Supply Logistics', 'C3', 3, 3, 'Medium', 'Head of Pharmacy'),
  cap1('C4', 'Finance & Revenue Cycle', 'Chief Financial Officer'),
  cap2('C4.1', 'Patient Billing & Claims', 'C4', 3, 4, 'High', 'Head of Revenue Cycle'),
  cap2('C4.2', 'Financial Accounting', 'C4', 3, 4, 'Medium', 'Head of Accounting'),
  cap2('C4.3', 'Procurement', 'C4', 3, 3, 'Low', 'Head of Procurement'),
  cap1('C5', 'Research & Quality', 'Chief Medical Officer'),
  cap2('C5.1', 'Clinical Research', 'C5', 1, 3, 'Medium', 'Head of Research'),
  cap2('C5.2', 'Quality & Regulatory Reporting', 'C5', 2, 4, 'High', 'Head of Quality'),
  cap1('C6', 'IT & Data', 'Chief Information Officer'),
  cap2('C6.1', 'Identity & Access Mgmt', 'C6', 2, 4, 'High', 'CISO'),
  cap2('C6.2', 'Health Data Platform', 'C6', 1, 4, 'High', 'Head of Data'),
  cap2('C6.3', 'Clinical Integration (HL7/FHIR)', 'C6', 2, 5, 'High', 'Head of Integration'),
  cap2('C6.4', 'Cybersecurity Operations', 'C6', 2, 4, 'High', 'CISO')
]

export const valueStreams = [
  { id: 'VS1', name: 'Referral-to-Discharge', stakeholder: 'Patient', stages: [
    { name: 'Refer & Book', capabilityIds: ['C1.1'] },
    { name: 'Admit', capabilityIds: ['C1.2', 'C3.1'] },
    { name: 'Diagnose', capabilityIds: ['C2.3', 'C2.4'] },
    { name: 'Treat', capabilityIds: ['C2.1', 'C2.2'] },
    { name: 'Discharge & Bill', capabilityIds: ['C4.1', 'C1.3'] }
  ] },
  { id: 'VS2', name: 'Order-to-Result (Diagnostics)', stakeholder: 'Clinician', stages: [
    { name: 'Order', capabilityIds: ['C2.1'] },
    { name: 'Perform', capabilityIds: ['C2.3', 'C2.4'] },
    { name: 'Report', capabilityIds: ['C2.1', 'C5.2'] }
  ] }
]

export const technologies = [
  tech('T01', 'SAP NetWeaver ABAP (IS-H)', 'Platforms & Infrastructure', 'SAP', 'Hold', '2027-12'),
  tech('T02', 'Oracle Database 19c', 'Data & Integration', 'Oracle', 'Hold', '2027-04'),
  tech('T03', 'SQL Server 2016', 'Data & Integration', 'Microsoft', 'Hold', '2026-07'),
  tech('T04', 'Windows Server 2016', 'Platforms & Infrastructure', 'Microsoft', 'Hold', '2027-01'),
  tech('T05', 'VMware vSphere 8', 'Platforms & Infrastructure', 'Broadcom', 'Hold', '2027-10'),
  tech('T06', 'Microsoft Azure', 'Platforms & Infrastructure', 'Microsoft', 'Adopt'),
  tech('T07', 'Azure Health Data Services (FHIR)', 'Data & Integration', 'Microsoft', 'Adopt'),
  tech('T08', 'Mirth Connect (HL7 v2)', 'Data & Integration', 'NextGen', 'Hold'),
  tech('T09', 'Databricks', 'Data & Integration', 'Databricks', 'Adopt'),
  tech('T10', '.NET 10 LTS', 'Languages & Frameworks', 'Microsoft', 'Adopt', '2028-11'),
  tech('T11', 'Delphi', 'Languages & Frameworks', 'Embarcadero', 'Hold'),
  tech('T12', 'React', 'Languages & Frameworks', 'Meta', 'Adopt'),
  tech('T13', 'Microsoft Sentinel', 'Tools & Practices', 'Microsoft', 'Adopt'),
  tech('T14', 'DICOMweb', 'Data & Integration', 'NEMA', 'Adopt'),
  tech('T15', 'Ambient clinical AI (speech)', 'Tools & Practices', '—', 'Assess'),
  tech('T16', 'Qlik Sense', 'Data & Integration', 'Qlik', 'Hold')
]

export const applications = [
  app('A01', 'SAP IS-H / i.s.h.med (HIS)', 'SAP / Oracle Health', 'COTS', 'On-Prem', 'Active', 'Migrate', 4, 2, 'Mission critical', 'Chief Medical Information Officer', 4200, 1850000, 2008, ['C1.2', 'C2.1', 'C4.1', 'C3.1'], ['T01', 'T02', 'T05', 'T04'], 'Current hospital information system incl. clinical documentation; end of maintenance 2027.'),
  app('A02', 'Epic EHR', 'Epic Systems', 'COTS', 'Azure', 'Plan', 'Invest', 5, 4, 'Mission critical', 'Chief Medical Information Officer', 4200, 2400000, 2027, ['C2.1', 'C2.2', 'C1.2', 'C4.1', 'C3.1', 'C1.1'], ['T06', 'T07'], 'Target electronic health record. Cost is an estimate.', { estimatedCost: true }),
  app('A03', 'Sectra PACS', 'Sectra', 'COTS', 'On-Prem', 'Active', 'Tolerate', 4, 3, 'Mission critical', 'Head of Radiology', 380, 420000, 2016, ['C2.3'], ['T03', 'T04', 'T14'], 'Picture archiving and communication.'),
  app('A04', 'LabCore LIS', 'In-house', 'Custom', 'On-Prem', 'Active', 'Migrate', 3, 1, 'Mission critical', 'Head of Laboratory', 160, 210000, 2004, ['C2.4'], ['T11', 'T02', 'T04'], 'Laboratory information system written in Delphi; key-person risk.'),
  app('A05', 'Patient Portal', 'In-house', 'Custom', 'Azure', 'Active', 'Invest', 3, 4, 'Business critical', 'Head of Digital Health', 52000, 140000, 2023, ['C1.3', 'C1.1'], ['T12', 'T10', 'T06', 'T07'], 'Portal for documents, messages and appointments.'),
  app('A06', 'Doctolib Scheduling', 'Doctolib', 'SaaS', 'SaaS', 'Active', 'Invest', 4, 5, 'Business critical', 'Head of Patient Services', 210, 95000, 2024, ['C1.1'], [], 'Online appointment booking.'),
  app('A07', 'SAP ECC Finance', 'SAP', 'COTS', 'On-Prem', 'Active', 'Migrate', 3, 2, 'Business critical', 'Head of Accounting', 240, 520000, 2008, ['C4.2', 'C4.3'], ['T01', 'T02', 'T05'], 'Finance and procurement.'),
  app('A08', 'Meona Medication', 'Meona', 'COTS', 'On-Prem', 'Active', 'Tolerate', 3, 3, 'Mission critical', 'Head of Pharmacy', 1800, 260000, 2018, ['C2.2'], ['T03', 'T04'], 'Medication prescription and administration; to be absorbed by the EHR.'),
  app('A09', 'Polypoint Rostering', 'Polypoint', 'COTS', 'On-Prem', 'Active', 'Tolerate', 4, 3, 'Business operational', 'Director of Nursing', 5200, 180000, 2017, ['C3.2'], ['T03', 'T04'], 'Duty rostering.'),
  app('A10', 'Mirth Communication Server', 'NextGen', 'COTS', 'On-Prem', 'Active', 'Eliminate', 3, 2, 'Mission critical', 'Head of Integration', 0, 160000, 2012, ['C6.3'], ['T08', 'T04', 'T05'], 'HL7 v2 point-to-point engine.'),
  app('A11', 'FHIR Integration Platform', 'Microsoft', 'PaaS', 'Azure', 'Active', 'Invest', 4, 5, 'Mission critical', 'Head of Integration', 0, 140000, 2025, ['C6.3'], ['T07', 'T06'], 'Azure Health Data Services + API Management.'),
  app('A12', 'Clinical Data Warehouse', 'In-house', 'Custom', 'On-Prem', 'Active', 'Eliminate', 2, 2, 'Business operational', 'Head of Data', 90, 230000, 2013, ['C5.2', 'C5.1'], ['T03', 'T04', 'T16'], 'Legacy reporting warehouse with Qlik dashboards.'),
  app('A13', 'Health Data Platform', 'Databricks', 'PaaS', 'Azure', 'Active', 'Invest', 4, 5, 'Business critical', 'Head of Data', 120, 260000, 2025, ['C6.2', 'C5.1', 'C5.2'], ['T09', 'T06', 'T07'], 'Lakehouse for quality, research and steering.'),
  app('A14', 'Microsoft Entra ID', 'Microsoft', 'SaaS', 'SaaS', 'Active', 'Invest', 5, 5, 'Mission critical', 'CISO', 6800, 190000, 2020, ['C6.1'], ['T06'], 'Workforce identity.'),
  app('A15', 'Bed Board (custom)', 'In-house', 'Custom', 'On-Prem', 'Active', 'Migrate', 2, 2, 'Business critical', 'Head of Patient Flow', 300, 60000, 2014, ['C3.1'], ['T11', 'T03'], 'Excel-like bed overview; replaced by EHR capacity module.'),
  app('A16', 'Microsoft Sentinel SOC', 'Microsoft', 'SaaS', 'SaaS', 'Active', 'Invest', 4, 5, 'Mission critical', 'CISO', 12, 310000, 2024, ['C6.4'], ['T13'], 'SIEM / SOC service.'),
  app('A17', 'Ambient Documentation Assistant', 'tbd', 'SaaS', 'SaaS', 'Plan', 'Invest', 4, 4, 'Business operational', 'Chief Medical Information Officer', 900, 180000, 2028, ['C2.1'], ['T15'], 'AI speech-to-documentation pilot. Cost estimate.', { estimatedCost: true }),
  app('A18', 'SAP S/4HANA Finance', 'SAP', 'SaaS', 'SaaS', 'Plan', 'Invest', 4, 5, 'Business critical', 'Head of Accounting', 240, 450000, 2028, ['C4.2', 'C4.3'], [], 'Future finance core. Cost estimate.', { estimatedCost: true })
]

export const appRoadmap = {
  A01: ['Active', 'Active', 'Phase-out', 'Retired'],
  A02: [null, 'Planned', 'Active', 'Active'],
  A03: ['Active', 'Active', 'Active', 'Active'],
  A04: ['Active', 'Active', 'Active', 'Phase-out'],
  A05: ['Active', 'Active', 'Active', 'Active'],
  A06: ['Active', 'Active', 'Active', 'Active'],
  A07: ['Active', 'Active', 'Active', 'Phase-out'],
  A08: ['Active', 'Active', 'Phase-out', 'Retired'],
  A09: ['Active', 'Active', 'Active', 'Active'],
  A10: ['Active', 'Phase-out', 'Phase-out', 'Retired'],
  A11: ['Active', 'Active', 'Active', 'Active'],
  A12: ['Active', 'Phase-out', 'Retired', 'Retired'],
  A13: ['Active', 'Active', 'Active', 'Active'],
  A14: ['Active', 'Active', 'Active', 'Active'],
  A15: ['Active', 'Active', 'Retired', 'Retired'],
  A16: ['Active', 'Active', 'Active', 'Active'],
  A17: [null, null, 'Planned', 'Active'],
  A18: [null, null, 'Planned', 'Active']
}

export const dataObjects = [
  dataObj('D01', 'Patient', 'Patient', 'Restricted', true, 'Head of Patient Services', 'A01', 83, '2.4M', { A01: 'CRUD', A05: 'RU', A06: 'CR', A03: 'R', A04: 'R', A08: 'R', A13: 'R', A12: 'R' }),
  dataObj('D02', 'Encounter / Case', 'Clinical', 'Restricted', true, 'Chief Medical Information Officer', 'A01', 79, '9.1M', { A01: 'CRUD', A15: 'RU', A13: 'R', A12: 'R' }),
  dataObj('D03', 'Appointment', 'Patient', 'Confidential', true, 'Head of Patient Services', 'A06', 88, '1.2M', { A06: 'CRUD', A05: 'CR', A01: 'R' }),
  dataObj('D04', 'Clinical Document', 'Clinical', 'Restricted', true, 'Chief Medical Information Officer', 'A01', 71, '48M', { A01: 'CRUD', A05: 'R', A13: 'R' }),
  dataObj('D05', 'Medication Order', 'Clinical', 'Restricted', true, 'Head of Pharmacy', 'A08', 76, '6.3M', { A08: 'CRUD', A01: 'R', A13: 'R' }),
  dataObj('D06', 'Lab Result', 'Clinical', 'Restricted', true, 'Head of Laboratory', 'A04', 92, '31M', { A04: 'CRUD', A01: 'R', A05: 'R', A13: 'R' }),
  dataObj('D07', 'Imaging Study', 'Clinical', 'Restricted', true, 'Head of Radiology', 'A03', 95, '3.8M', { A03: 'CRUD', A01: 'R' }),
  dataObj('D08', 'Claim / Invoice', 'Finance', 'Confidential', true, 'Head of Revenue Cycle', 'A01', 90, '7.7M', { A01: 'CRUD', A07: 'CR', A13: 'R' }),
  dataObj('D09', 'Employee', 'People', 'Restricted', true, 'Director of Nursing', 'A09', 87, '6.8k', { A09: 'CRUD', A14: 'CRU' }),
  dataObj('D10', 'Bed', 'Operations', 'Internal', false, 'Head of Patient Flow', 'A15', 61, '2.1k', { A15: 'CRUD', A01: 'RU' })
]

export const interfaces = [
  iface('F01', 'A01', 'A03', ['D01', 'D02'], 'A10', 'HL7 v2 ADT', 'Real-time'),
  iface('F02', 'A01', 'A04', ['D01', 'D02'], 'A10', 'HL7 v2 ORM', 'Real-time'),
  iface('F03', 'A04', 'A01', ['D06'], 'A10', 'HL7 v2 ORU', 'Real-time'),
  iface('F04', 'A03', 'A01', ['D07'], 'A10', 'HL7 v2 ORU', 'Real-time'),
  iface('F05', 'A01', 'A08', ['D01', 'D02'], 'A10', 'HL7 v2 ADT', 'Real-time'),
  iface('F06', 'A06', 'A01', ['D03'], 'A11', 'FHIR R4', 'Real-time'),
  iface('F07', 'A01', 'A05', ['D04', 'D06'], 'A11', 'FHIR R4', 'Near real-time'),
  iface('F08', 'A01', 'A07', ['D08'], null, 'IDoc', 'Nightly'),
  iface('F09', 'A01', 'A12', ['D02', 'D01'], null, 'ETL', 'Nightly'),
  iface('F10', 'A01', 'A13', ['D02', 'D04'], 'A11', 'FHIR Bulk', 'Daily'),
  iface('F11', 'A09', 'A14', ['D09'], null, 'SCIM', 'Real-time'),
  iface('F12', 'A15', 'A01', ['D10'], 'A10', 'HL7 v2', 'Hourly')
]

export const investments = [
  inv('I01', 'EHR Replacement (Epic)', 'Transform', 'In Progress', 'CMO', ['G2', 'G3'], ['C2.1', 'C2.2', 'C1.2', 'C3.1', 'C4.1'], ['A01', 'A02', 'A08', 'A15'], 'P01', { 2025: 2500000, 2026: 7800000, 2027: 9200000, 2028: 3100000 }, 0.7, 0.11, 98, 'Replace IS-H before end of maintenance; closed-loop medication.'),
  inv('I02', 'FHIR Integration Platform', 'Transform', 'In Progress', 'CIO', ['G2', 'G4'], ['C6.3'], ['A10', 'A11'], 'P02', { 2025: 600000, 2026: 900000, 2027: 400000 }, 0.6, 0.18, 90, 'Prerequisite for EHR; retire HL7 point-to-point engine.'),
  inv('I03', 'Health Data Platform', 'Grow', 'In Progress', 'CMO', ['G2'], ['C6.2', 'C5.1', 'C5.2'], ['A12', 'A13'], 'P03', { 2025: 400000, 2026: 700000, 2027: 300000 }, 0.5, 0.22, 76, 'Automated quality reporting; research data.'),
  inv('I04', 'Patient Portal 2.0 (Hospital Future Act)', 'Grow', 'Approved', 'COO', ['G1'], ['C1.3', 'C1.1'], ['A05', 'A06'], 'P04', { 2026: 450000, 2027: 650000 }, 0.7, null, 84, 'Funded by Hospital Future Act; deadline-driven.'),
  inv('I05', 'NIS2 Security Program', 'Run', 'In Progress', 'CISO', ['G4'], ['C6.1', 'C6.4'], ['A14', 'A16'], 'P05', { 2025: 500000, 2026: 900000, 2027: 600000 }, 0.3, null, 95, 'Mandatory: NIS2 compliance.'),
  inv('I06', 'Laboratory System Replacement', 'Transform', 'Proposed', 'CMO', ['G2', 'G4'], ['C2.4'], ['A04'], 'P06', { 2027: 900000, 2028: 1200000 }, 0.7, 0.09, 70, 'Remove Delphi key-person risk.'),
  inv('I07', 'Ambient Clinical Documentation', 'Grow', 'Idea', 'CMO', ['G3'], ['C2.1'], ['A17'], null, { 2027: 300000, 2028: 450000 }, 0.4, 0.3, 64, '-30 min documentation per shift.'),
  inv('I08', 'S/4HANA Finance', 'Transform', 'Proposed', 'CFO', ['G4'], ['C4.2', 'C4.3'], ['A07', 'A18'], null, { 2027: 1200000, 2028: 1600000 }, 0.75, 0.12, 60, 'Follow-up of IS-H exit.')
]

export const projects = [
  proj('P01', 'EHR Replacement (Epic)', 'I01', 'Execution', '2025-06', '2028-09', 22600000, 5100000, 'Amber', 'Clinical Transformation Office', 'Lead Clinical Architect', 'Approved', ['C2.1', 'C2.2', 'C1.2', 'C3.1', 'C4.1'],
    [['A02', 'Introduce'], ['A01', 'Retire'], ['A08', 'Retire'], ['A15', 'Retire'], ['A11', 'Modify']],
    [['Build complete', '2026-10'], ['Go-live wave 1', '2027-04'], ['Go-live wave 2', '2027-11'], ['IS-H shutdown', '2028-09']], 'Clinical content build behind plan in 2 specialties.'),
  proj('P02', 'FHIR Integration Platform', 'I02', 'Execution', '2025-03', '2027-06', 1900000, 1050000, 'Green', 'IT PMO', 'Integration Architect', 'Approved', ['C6.3'],
    [['A11', 'Modify'], ['A10', 'Retire'], ['A05', 'Modify']], [['ADT feeds on FHIR', '2026-03'], ['Mirth shutdown', '2027-06']]),
  proj('P03', 'Health Data Platform', 'I03', 'Execution', '2025-05', '2027-03', 1400000, 820000, 'Red', 'Data Office', 'Data Architect', 'Approved', ['C6.2', 'C5.2'],
    [['A13', 'Modify'], ['A12', 'Retire']], [['Quality reports automated', '2026-09']], 'Data protection approval for research use pending.'),
  proj('P04', 'Patient Portal 2.0', 'I04', 'Planning', '2026-04', '2027-10', 1100000, 120000, 'Amber', 'Digital Health PMO', 'Solution Architect Digital', 'Conditional', ['C1.3', 'C1.1'],
    [['A05', 'Modify'], ['A06', 'Modify']], [['Funding deadline', '2027-10']], 'Funding deadline is fixed.'),
  proj('P05', 'NIS2 Security Program', 'I05', 'Execution', '2025-01', '2027-12', 2000000, 1150000, 'Green', 'Security PMO', 'Security Architect', 'Approved', ['C6.1', 'C6.4'],
    [['A14', 'Modify'], ['A16', 'Modify']], [['Privileged access mgmt', '2026-06']]),
  proj('P06', 'Laboratory System Replacement', 'I06', 'Initiation', '2027-01', '2028-12', 2100000, 0, 'Green', 'tbd', 'Lead Clinical Architect', 'Pending', ['C2.4'],
    [['A04', 'Retire']], [['Vendor selection', '2027-05']])
]

export const adrs = [
  { id: 'ADR-001', title: 'Epic as enterprise EHR', status: 'Accepted', date: '2025-02', domain: 'Application', context: 'SAP IS-H end of maintenance.', decision: 'Replace IS-H clinical and patient administration with Epic.', consequences: 'Medication and bed management move into the EHR.' },
  { id: 'ADR-002', title: 'FHIR R4 as integration standard', status: 'Accepted', date: '2025-01', domain: 'Application', context: 'Point-to-point HL7 v2 landscape.', decision: 'All new clinical interfaces via FHIR on Azure Health Data Services.', consequences: 'HL7 v2 only for legacy devices.' },
  { id: 'ADR-003', title: 'Research use of health data platform', status: 'Proposed', date: '2026-09', domain: 'Data', context: 'Research demand for pseudonymized data.', decision: 'Pseudonymized research zone in the lakehouse.', consequences: 'Requires data protection approval.' }
]
