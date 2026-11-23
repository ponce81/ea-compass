import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  { path: '/clients', name: 'clients', component: () => import('./views/Clients.vue'), meta: { title: 'Clients' } },
  { path: '/', name: 'dashboard', component: () => import('./views/Dashboard.vue'), meta: { title: 'Dashboard' } },
  { path: '/strategy', name: 'strategy', component: () => import('./views/Strategy.vue'), meta: { title: 'Strategy & Motivation' } },
  { path: '/business', name: 'business', component: () => import('./views/Business.vue'), meta: { title: 'Business Architecture' } },
  { path: '/applications', name: 'applications', component: () => import('./views/Applications.vue'), meta: { title: 'Application Architecture' } },
  { path: '/data', name: 'data', component: () => import('./views/Data.vue'), meta: { title: 'Data Architecture' } },
  { path: '/technology', name: 'technology', component: () => import('./views/Technology.vue'), meta: { title: 'Technology Architecture' } },
  { path: '/target', name: 'target', component: () => import('./views/TargetArchitecture.vue'), meta: { title: 'Target Architecture & Gaps' } },
  { path: '/states', name: 'states', component: () => import('./views/TransitionViews.vue'), meta: { title: 'Transition Views' } },
  { path: '/roadmap', name: 'roadmap', component: () => import('./views/Roadmap.vue'), meta: { title: 'Roadmap' } },
  { path: '/projects', name: 'projects', component: () => import('./views/Projects.vue'), meta: { title: 'Projects' } },
  { path: '/projects/new', name: 'planner', component: () => import('./views/ProjectPlanner.vue'), meta: { title: 'Project Planner' } },
  { path: '/investments', name: 'investments', component: () => import('./views/Investments.vue'), meta: { title: 'IT Investments' } },
  { path: '/governance', name: 'governance', component: () => import('./views/Governance.vue'), meta: { title: 'Governance' } },
  { path: '/modeler', name: 'modeler', component: () => import('./views/Modeler.vue'), meta: { title: 'ArchiMate Modeler' } },
  { path: '/import', name: 'import', component: () => import('./views/ExcelImport.vue'), meta: { title: 'Excel Import' } },
  { path: '/explorer', name: 'explorer', component: () => import('./views/ImpactExplorer.vue'), meta: { title: 'Impact Explorer' } }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 })
})

import { activeTenant } from './store'
router.afterEach(to => { document.title = `${to.meta.title} · ${activeTenant()?.name ?? ''} · EA Compass` })

export default router
