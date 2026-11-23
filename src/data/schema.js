// Field definitions of the repository object types – shared by the Excel import
// and the in-page editors, so both apply the same rules.

export const ENUMS = {
  level: [1, 2],
  importance: ['High', 'Medium', 'Low'],
  appType: ['SaaS', 'PaaS', 'COTS', 'Custom'],
  hosting: ['SaaS', 'Azure', 'AWS', 'On-Prem', 'Other'],
  lifecycle: ['Plan', 'Active', 'Phase-out', 'Retired'],
  time: ['Tolerate', 'Invest', 'Migrate', 'Eliminate'],
  criticality: ['Mission critical', 'Business critical', 'Business operational', 'Administrative'],
  techCategory: ['Languages & Frameworks', 'Platforms & Infrastructure', 'Data & Integration', 'Tools & Practices'],
  radar: ['Adopt', 'Trial', 'Assess', 'Hold'],
  classification: ['Public', 'Internal', 'Confidential', 'Restricted'],
  yesNo: ['Yes', 'No']
}

export const field = (key, header, type = 'str', opts = {}) => ({ key, header, type, ...opts })

export const SHEETS = [
  {
    sheet: 'Capabilities', collection: 'capabilities', prefix: 'C',
    defaults: { level: 2, parentId: null, maturity: 3, targetMaturity: 3, importance: 'Medium', owner: '', description: '' },
    columns: [
      field('id', 'ID'), field('name', 'Name', 'str', { required: true }),
      field('level', 'Level', 'enum', { values: ENUMS.level, int: true }),
      field('parentId', 'Parent capability', 'ref', { ref: 'capabilities' }),
      field('maturity', 'Maturity (1-5)', 'int', { min: 1, max: 5 }),
      field('targetMaturity', 'Target maturity (1-5)', 'int', { min: 1, max: 5 }),
      field('importance', 'Importance', 'enum', { values: ENUMS.importance }),
      field('owner', 'Owner'), field('description', 'Description', 'str', { width: 50 })
    ]
  },
  {
    sheet: 'Applications', collection: 'applications', prefix: 'A',
    defaults: { vendor: '', type: 'COTS', hosting: 'On-Prem', lifecycle: 'Active', time: 'Tolerate', businessFit: 3, technicalFit: 3, criticality: 'Business operational', owner: '', users: 0, annualCost: 0, goLive: null, capabilityIds: [], techIds: [], description: '' },
    columns: [
      field('id', 'ID'), field('name', 'Name', 'str', { required: true }), field('vendor', 'Vendor'),
      field('type', 'Type', 'enum', { values: ENUMS.appType }),
      field('hosting', 'Hosting', 'enum', { values: ENUMS.hosting }),
      field('lifecycle', 'Lifecycle', 'enum', { values: ENUMS.lifecycle }),
      field('time', 'TIME', 'enum', { values: ENUMS.time }),
      field('businessFit', 'Business fit (1-5)', 'int', { min: 1, max: 5 }),
      field('technicalFit', 'Technical fit (1-5)', 'int', { min: 1, max: 5 }),
      field('criticality', 'Criticality', 'enum', { values: ENUMS.criticality }),
      field('owner', 'Business owner'), field('users', 'Users', 'int', { min: 0 }),
      field('annualCost', 'Annual cost', 'num', { min: 0 }), field('goLive', 'Go-live year', 'int', { min: 1960, max: 2100 }),
      field('capabilityIds', 'Capabilities', 'refs', { ref: 'capabilities', width: 40 }),
      field('techIds', 'Technologies', 'refs', { ref: 'technologies', width: 40 }),
      field('description', 'Description', 'str', { width: 50 })
    ]
  },
  {
    sheet: 'Technologies', collection: 'technologies', prefix: 'T',
    defaults: { category: 'Tools & Practices', vendor: '', radar: 'Assess', eol: null },
    columns: [
      field('id', 'ID'), field('name', 'Name', 'str', { required: true }),
      field('category', 'Category', 'enum', { values: ENUMS.techCategory }), field('vendor', 'Vendor'),
      field('radar', 'Radar', 'enum', { values: ENUMS.radar }),
      field('eol', 'End of support (YYYY-MM)', 'month')
    ]
  },
  {
    sheet: 'DataObjects', collection: 'dataObjects', prefix: 'D',
    defaults: { domain: '', classification: 'Internal', pii: false, owner: '', masterAppId: null, quality: 0, records: '', crud: {} },
    columns: [
      field('id', 'ID'), field('name', 'Name', 'str', { required: true }), field('domain', 'Domain'),
      field('classification', 'Classification', 'enum', { values: ENUMS.classification }),
      field('pii', 'Personal data (PII)', 'bool'), field('owner', 'Data owner'),
      field('masterAppId', 'System of record', 'ref', { ref: 'applications', width: 30 }),
      field('quality', 'Quality (0-100)', 'int', { min: 0, max: 100 }), field('records', 'Records')
    ]
  },
  {
    sheet: 'Interfaces', collection: 'interfaces', prefix: 'F', noName: true,
    defaults: { via: null, dataIds: [], protocol: '', frequency: '' },
    columns: [
      field('id', 'ID'),
      field('from', 'Source application', 'ref', { ref: 'applications', required: true, width: 30 }),
      field('to', 'Target application', 'ref', { ref: 'applications', required: true, width: 30 }),
      field('via', 'Via (middleware)', 'ref', { ref: 'applications', width: 30 }),
      field('dataIds', 'Data objects', 'refs', { ref: 'dataObjects', width: 30 }),
      field('protocol', 'Protocol'), field('frequency', 'Frequency')
    ]
  }
]

