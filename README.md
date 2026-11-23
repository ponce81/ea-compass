# EA Compass – Enterprise Architecture SaaS (prototype)

Vue 3 + Vite prototype using **mock data** to show what an EA SaaS
covering Business, Application, Data and Technology architecture, plus IT investment and
project planning, could look like. It borrows ideas from TOGAF (ADM phases, plateaus,
gap analysis, principles, building blocks), ArchiMate (layer colours), Gartner TIME and the tech radar.

## Run

```bash
npm install
npm run dev        # http://localhost:5173
```
In VS Code: open `ea-compass.code-workspace` → *Terminal → Run Build Task* (starts the dev server).

## Modules

| Area | Module | TOGAF link | What it does |
|---|---|---|---|
| Consultant | Clients + client switcher | – | One isolated repository per client company (tenant); switcher in the top bar, colour accent per client, per-client currency, new clients seeded only from the practice library |
| Overview | Dashboard | – | KPIs, investment profile, TIME mix, project RAG, tech EOL risk, capability gaps |
| | Strategy & Motivation | Preliminary / Phase A | Drivers → goals → KPIs, traced to investments |
| Domains | Business | Phase B | Capability map with heatmap lenses (maturity, gap, importance, app coverage, investment), value streams. **Capability editor**: add/rename/re-rate/reorder/move/delete domains and capabilities; deleting shows all references and can move them to another capability (merge) |
| | Applications | Phase C | Inventory, TIME portfolio matrix, interface catalog, application fact sheet. **Create/edit/delete** applications (incl. capabilities, technologies, status per plateau) and interfaces; deleting can move all links to a successor application |
| | Data | Phase C | Data catalog (owner, classification, PII, system of record), CRUD matrix, data-quality findings. **Create/edit/delete** data objects incl. per-application CRUD access |
| | Technology | Phase D | Tech radar (Adopt/Trial/Assess/Hold), lifecycle & end-of-support. **Create/edit/delete** technologies; deleting can replace a technology in all applications (e.g. Java 8 → Java 21) |
| Planning | Target & Gaps | Phase E | Compare any two plateaus: per-capability gap analysis, run-cost & cloud-share delta |
| | Transition Views | Phase E/F | One ArchiMate view per plateau (baseline, transitions, target) + migration overview (plateaus, gaps, work packages). Export: ZIP (ArchiMate model + draw.io file + SVG + PNG + change CSV), draw.io (.drawio, one page per view with draw.io's ArchiMate 3 shapes), ArchiMate model with all views (.xml, validated against the Open Group 3.1 schema), SVG/PNG per view, print/PDF, save as editable Modeler views |
| | Roadmap | Phase F | Gantt with plateaus & milestones, application lifecycle per plateau |
| | Projects | Phase G | Project register with scope, app impact (introduce/modify/retire), architecture review status |
| | Project Planner | Phase E/F | Wizard: scope → capabilities → impacted apps → automated impact & principle check → submit |
| | IT Investments | Portfolio mgmt | Run/Grow/Transform, current vs future, by goal & capability, priority & ROI |
| Governance | Principles & Decisions | Governance | Principles, ADRs, Architecture Review Board queue, technology compliance |
| | Impact Explorer | – | Cross-domain traceability graph for any element |
| Modeling & Data | ArchiMate Modeler | – | Drag-and-drop ArchiMate 3.2 views: layer palettes, repository-linked elements, only valid relationships offered, model check, views generated from the repository, export to ArchiMate Open Exchange Format (.xml → Archi, BiZZdesign, Sparx) and draw.io (.drawio) |
| | Excel Import | – | Download template (dropdowns, validation) or export the repository, edit in Excel, upload → validated preview (new / updated / unchanged / errors) → import |

## Tests

```bash
npm run test:excel   # Excel export → re-import round trip, updates, new rows, validation errors
npm run test:tenants # client isolation, library seeding, data integrity, valid generated ArchiMate views
npm run test:states  # transition views: valid relationships, nesting/overlap-free layout, export completeness
npm run test:capabilities # capability editor: ids, validation, ordering, delete with link re-pointing, client isolation
npm run test:entities     # application/interface/data/technology editing: validation, roadmap defaults, delete with successor, integrity
```

## Structure

```
src/
  data/tenants/     # one mock repository per client (Acme, Meridian Health, Solvara Insurance)
  data/library.js   # practice library: principles, reference capability map, baseline tech radar
  data/schema.js    # field definitions shared by the Excel import and the in-page editors
  store.js          # reactive store + relationship queries (swap for an API later)
  archimate/        # ArchiMate notation, relationship rules, view generators, node/edge components
  utils/excel.js    # Excel template export + import parsing/validation (exceljs, in the browser)
  utils/format.js   # money, dates, status → colour mapping
  components/       # charts (SVG), drawer, tags, KPI cards
  views/            # one file per module
```

Data created in the Project Planner or via Excel import lives in memory only (lost on reload).
ArchiMate views are saved in the browser's localStorage, separately per client.

## Planned target architecture (not implemented yet)

- Frontend: static build hosted in AWS S3 (behind CloudFront for HTTPS)
- Backend: Python microservices (e.g. FastAPI) in containers on AWS (ECS Fargate), e.g. repository, portfolio, import
- Database: PostgreSQL on Neon
- Tenancy: one tenant per client company (own Neon database), consultant login across tenants, practice library separate
- Users: EA team first; planning-level investment data; English UI

## Deployment (dev & prod on S3)

| Environment | Trigger | URL |
|---|---|---|
| **dev** | every push to `main` | http://ea-compass-dev-f795d5.s3-website.eu-central-1.amazonaws.com |
| **prod** | push a tag `v*` | http://ea-compass-prod-f795d5.s3-website.eu-central-1.amazonaws.com |

```bash
git push                                   # → tests, build, deploy to DEV
git tag v1.0.0 && git push origin v1.0.0   # → tests, build, deploy to PROD
```

- Workflow: `.github/workflows/deploy.yml` (tests → build → upload). Pull requests run the tests only.
- AWS access via GitHub OIDC – no access keys in GitHub. `ea-compass-deploy-dev` only trusts pushes to `main`,
  `ea-compass-deploy-prod` only trusts `v*` tags; each role can only write to its own bucket.
- AWS resources are defined in `infra/terraform` (buckets, website hosting, public-read policy, deploy roles).
  The Terraform state is kept locally in `infra/terraform/terraform.tfstate` (not in git) – keep a backup of it.
- The sites are plain HTTP S3 website endpoints and **publicly readable** – fine for fictional mock data only.
  Before real client data: add CloudFront (HTTPS) and authentication.
- The top bar shows a **DEV** badge on the dev site; the sidebar shows the deployed version.
