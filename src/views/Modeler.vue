<script setup>
import { ref, computed, nextTick, onMounted } from 'vue'
import { VueFlow, useVueFlow, ConnectionMode } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import { MiniMap } from '@vue-flow/minimap'
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'
import '@vue-flow/controls/dist/style.css'
import '@vue-flow/minimap/dist/style.css'
import '@vue-flow/node-resizer/dist/style.css'
import { Save, Download, Trash2, FilePlus2, Wand2, CheckCircle2, AlertTriangle, Workflow } from 'lucide-vue-next'
import ArchiNode from '../archimate/ArchiNode.vue'
import ArchiEdge from '../archimate/ArchiEdge.vue'
import { ELEMENTS, RELATIONS, PALETTE, REPO_TYPE, allowedRelations, fillOf, strokeOf, toOpenExchangeXml } from '../archimate/notation'
import { layeredAppView, capabilityView, migrationView } from '../archimate/generate'
import { toDrawio, diagramToDrawioPage } from '../archimate/drawio'
import { db, l1Caps, saveDiagram, deleteDiagram } from '../store'

const FLOW_ID = 'archimate-modeler'
const {
  addNodes, addEdges, setNodes, setEdges, removeNodes, removeEdges, findNode, findEdge,
  screenToFlowCoordinate, onConnect, onNodeClick, onEdgeClick, onPaneClick, onNodesChange, onEdgesChange,
  fitView, nodes, edges, addSelectedNodes
} = useVueFlow(FLOW_ID)

let seq = 0
const uid = p => `${p}${Date.now().toString(36)}${(seq++).toString(36)}`

// ------------------------------------------------------------ diagram state
const meta = ref({ id: null, name: '', viewpoint: 'Free' })
const dirty = ref(false)
const toast = ref('')
let toastTimer
function notify (msg) { toast.value = msg; clearTimeout(toastTimer); toastTimer = setTimeout(() => (toast.value = ''), 2600) }

function handlesFor (a, b) {
  const dx = (b.x + b.w / 2) - (a.x + a.w / 2)
  const dy = (b.y + b.h / 2) - (a.y + a.h / 2)
  if (Math.abs(dy) > Math.abs(dx) * 0.6) return dy > 0 ? ['Bottom', 'Top'] : ['Top', 'Bottom']
  return dx > 0 ? ['Right', 'Left'] : ['Left', 'Right']
}

function load (d) {
  meta.value = { id: d.id, name: d.name, viewpoint: d.viewpoint || 'Free' }
  const byId = Object.fromEntries(d.nodes.map(n => [n.id, n]))
  // nodes are stored with absolute coordinates; nested nodes are positioned relative to their parent
  setNodes(d.nodes.map(n => {
    const p = n.parent && byId[n.parent]
    return {
      id: n.id, type: 'archimate', position: p ? { x: n.x - p.x, y: n.y - p.y } : { x: n.x, y: n.y },
      ...(p ? { parentNode: n.parent } : {}),
      style: { width: `${n.w}px`, height: `${n.h}px` },
      data: { atype: n.atype, name: n.name, doc: n.doc || '', refType: n.refType || null, refId: n.refId || null, container: !!n.container, status: n.status || null }
    }
  }))
  setEdges(d.edges.map(e => {
    const [sh, th] = e.sourceHandle ? [e.sourceHandle, e.targetHandle] : handlesFor(byId[e.source], byId[e.target])
    return { id: e.id, source: e.source, target: e.target, sourceHandle: sh, targetHandle: th, type: 'archimate', data: { rel: e.rel, name: e.name || '' } }
  }))
  selNode.value = null; selEdge.value = null
  nextTick(() => { dirty.value = false; setTimeout(() => fitView({ padding: 0.15 }), 50) })
}

function serialize () {
  return {
    ...meta.value,
    nodes: nodes.value.map(n => ({
      id: n.id, atype: n.data.atype, name: n.data.name, doc: n.data.doc, refType: n.data.refType, refId: n.data.refId,
      parent: n.parentNode || null, container: !!n.data.container, status: n.data.status || null,
      x: Math.round(n.computedPosition?.x ?? n.position.x), y: Math.round(n.computedPosition?.y ?? n.position.y),
      w: Math.round(n.dimensions?.width || parseFloat(n.style?.width) || 170), h: Math.round(n.dimensions?.height || parseFloat(n.style?.height) || 64)
    })),
    edges: edges.value.map(e => ({ id: e.id, source: e.source, target: e.target, sourceHandle: e.sourceHandle, targetHandle: e.targetHandle, rel: e.data.rel, name: e.data.name || '' }))
  }
}

function save () {
  if (!meta.value.name.trim()) meta.value.name = 'Untitled view'
  saveDiagram(serialize())
  dirty.value = false
  notify('View saved in this browser')
}
const confirmDiscard = () => !dirty.value || window.confirm('Discard unsaved changes to this view?')

function openDiagram (id) {
  if (id === meta.value.id || !confirmDiscard()) return
  const d = db.diagrams.find(x => x.id === id)
  if (d) load(d)
}
function newDiagram () {
  if (!confirmDiscard()) return
  load({ id: uid('d'), name: 'New view', viewpoint: 'Free', nodes: [], edges: [] })
}
function removeDiagram () {
  if (!window.confirm(`Delete view "${meta.value.name}"?`)) return
  deleteDiagram(meta.value.id)
  dirty.value = false
  if (db.diagrams.length) load(db.diagrams[0]); else newDiagram()
}
function generate (v) {
  if (!v || !confirmDiscard()) return
  const [kind, id] = v.split(':')
  const d = kind === 'app' ? layeredAppView(id) : kind === 'cap' ? capabilityView(id) : migrationView(id)
  load(d)
  dirty.value = true
  notify('View generated from the repository – save to keep it')
}
function exportDrawio () {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([toDrawio([diagramToDrawioPage(serialize())])], { type: 'application/xml' }))
  a.download = `${meta.value.name.replace(/[^\w-]+/g, '_')}.drawio`
  a.click()
  URL.revokeObjectURL(a.href)
}
function exportXml () {
  const xml = toOpenExchangeXml(serialize())
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([xml], { type: 'application/xml' }))
  a.download = `${meta.value.name.replace(/[^\w-]+/g, '_')}.xml`
  a.click()
  URL.revokeObjectURL(a.href)
}

// ---------------------------------------------------------------- palette
const paletteTab = ref('elements')
const openLayers = ref(['business', 'application', 'technology'])
const toggleLayer = id => { const i = openLayers.value.indexOf(id); i >= 0 ? openLayers.value.splice(i, 1) : openLayers.value.push(id) }
const repoQuery = ref('')
const repoGroups = computed(() => {
  const q = repoQuery.value.toLowerCase()
  const f = list => list.filter(x => !q || x.name.toLowerCase().includes(q))
  return [
    { label: 'Applications', refType: 'application', items: f(db.applications.filter(a => a.lifecycle !== 'Retired')) },
    { label: 'Capabilities', refType: 'capability', items: f(db.capabilities) },
    { label: 'Data objects', refType: 'data', items: f(db.dataObjects) },
    { label: 'Technologies', refType: 'technology', items: f(db.technologies) },
    { label: 'Goals', refType: 'goal', items: f(db.goals) },
    { label: 'Drivers', refType: 'driver', items: f(db.drivers) },
    { label: 'Principles', refType: 'principle', items: f(db.principles) },
    { label: 'Projects', refType: 'project', items: f(db.projects) },
    { label: 'Plateaus', refType: 'plateau', items: f(db.plateaus) }
  ].filter(g => g.items.length)
})

function onDragStart (e, payload) {
  e.dataTransfer.setData('application/x-archimate', JSON.stringify(payload))
  e.dataTransfer.effectAllowed = 'move'
}
function onDrop (e) {
  const raw = e.dataTransfer.getData('application/x-archimate')
  if (!raw) return
  const p = JSON.parse(raw)
  if (p.refId) {
    const existing = nodes.value.find(n => n.data.refType === p.refType && n.data.refId === p.refId)
    if (existing) { selectNode(existing.id); notify(`"${p.name}" is already on this view`); return }
  }
  const pos = screenToFlowCoordinate({ x: e.clientX, y: e.clientY })
  const id = uid('n')
  const grouping = p.atype === 'Grouping'
  addNodes([{
    id, type: 'archimate', position: { x: pos.x - (grouping ? 150 : 85), y: pos.y - (grouping ? 100 : 32) },
    style: { width: grouping ? '300px' : '170px', height: grouping ? '200px' : '64px' },
    ...(grouping ? { zIndex: -1 } : {}),
    data: { atype: p.atype, name: p.name, doc: '', refType: p.refType || null, refId: p.refId || null }
  }])
  dirty.value = true
  nextTick(() => selectNode(id))
}

// ---------------------------------------------------- connect & relations
const pending = ref(null)
const pendingOptions = computed(() => {
  if (!pending.value) return []
  const s = findNode(pending.value.source); const t = findNode(pending.value.target)
  return s && t ? allowedRelations(s.data.atype, t.data.atype) : []
})
onConnect(params => {
  if (params.source === params.target) return
  pending.value = params
})
function createRelation (rel) {
  const id = uid('e')
  addEdges([{ ...pending.value, id, type: 'archimate', data: { rel, name: '' } }])
  pending.value = null
  dirty.value = true
  nextTick(() => { selEdge.value = id; selNode.value = null })
}

// ------------------------------------------------------------- selection
const selNode = ref(null)
const selEdge = ref(null)
function selectNode (id) { selNode.value = id; selEdge.value = null; const n = findNode(id); if (n) addSelectedNodes([n]) }
onNodeClick(({ node }) => { selNode.value = node.id; selEdge.value = null })
onEdgeClick(({ edge }) => { selEdge.value = edge.id; selNode.value = null })
onPaneClick(() => { selNode.value = null; selEdge.value = null })
onNodesChange(ch => {
  if (ch.some(c => ['position', 'remove', 'add'].includes(c.type) || (c.type === 'dimensions' && c.resizing))) dirty.value = true
  if (ch.some(c => c.type === 'remove' && c.id === selNode.value)) selNode.value = null
})
onEdgesChange(ch => {
  if (ch.some(c => ['remove', 'add'].includes(c.type))) dirty.value = true
  if (ch.some(c => c.type === 'remove' && c.id === selEdge.value)) selEdge.value = null
})

const node = computed(() => (selNode.value ? findNode(selNode.value) : null))
const edge = computed(() => (selEdge.value ? findEdge(selEdge.value) : null))
const edgeOptions = computed(() => {
  if (!edge.value) return []
  const s = findNode(edge.value.source); const t = findNode(edge.value.target)
  return s && t ? allowedRelations(s.data.atype, t.data.atype) : []
})
function setNodeField (k, v) { node.value.data = { ...node.value.data, [k]: v }; dirty.value = true }
function setEdgeField (k, v) { edge.value.data = { ...edge.value.data, [k]: v }; dirty.value = true }
function deleteSelection () {
  if (node.value) removeNodes([node.value.id])
  else if (edge.value) removeEdges([edge.value.id])
}
const explorerTypes = ['capability', 'application', 'data', 'technology', 'project', 'investment', 'goal']

// ------------------------------------------------------------ model check
const invalidEdges = computed(() => edges.value.filter(e => {
  const s = findNode(e.source); const t = findNode(e.target)
  return s && t && !allowedRelations(s.data.atype, t.data.atype).includes(e.data?.rel)
}))
const typeCounts = computed(() => {
  const c = {}
  for (const n of nodes.value) { const l = ELEMENTS[n.data.atype].layer; c[l] = (c[l] || 0) + 1 }
  return c
})

// --------------------------------------------------------------- startup
onMounted(() => {
  if (!db.diagrams.length) {
    // seed example views generated from this client's repository
    const firstApp = db.applications.find(a => a.lifecycle === 'Active')
    if (firstApp) saveDiagram(layeredAppView(firstApp.id))
    if (db.projects[0]) saveDiagram(migrationView(db.projects[0].id))
  }
  if (db.diagrams.length) load(db.diagrams[0])
  else load({ id: uid('d'), name: 'New view', viewpoint: 'Free', nodes: [], edges: [] })
})

const relSample = r => RELATIONS[r]
</script>

<template>
  <div class="modeler">
    <!-- hidden ArchiMate relationship markers -->
    <svg width="0" height="0" style="position:absolute">
      <defs>
        <marker id="am-arrow-open" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="10" markerHeight="10" markerUnits="userSpaceOnUse" orient="auto"><path d="M0,0 L10,5 L0,10" fill="none" stroke="#334155" stroke-width="1.3" /></marker>
        <marker id="am-arrow-small" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="7" markerHeight="7" markerUnits="userSpaceOnUse" orient="auto"><path d="M0,0 L10,5 L0,10" fill="none" stroke="#334155" stroke-width="1.5" /></marker>
        <marker id="am-arrow-filled" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="10" markerHeight="10" markerUnits="userSpaceOnUse" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#334155" /></marker>
        <marker id="am-triangle-hollow" viewBox="0 0 12 12" refX="12" refY="6" markerWidth="13" markerHeight="13" markerUnits="userSpaceOnUse" orient="auto"><path d="M0.5,0.5 L12,6 L0.5,11.5 z" fill="#fff" stroke="#334155" stroke-width="1.2" /></marker>
        <marker id="am-diamond-filled" viewBox="0 0 14 8" refX="14" refY="4" markerWidth="14" markerHeight="8" markerUnits="userSpaceOnUse" orient="auto-start-reverse"><path d="M0,4 L7,0 L14,4 L7,8 z" fill="#334155" /></marker>
        <marker id="am-diamond-hollow" viewBox="0 0 14 8" refX="14" refY="4" markerWidth="14" markerHeight="8" markerUnits="userSpaceOnUse" orient="auto-start-reverse"><path d="M0.5,4 L7,0.5 L13.5,4 L7,7.5 z" fill="#fff" stroke="#334155" stroke-width="1.1" /></marker>
        <marker id="am-dot" viewBox="0 0 8 8" refX="4" refY="4" markerWidth="8" markerHeight="8" markerUnits="userSpaceOnUse"><circle cx="4" cy="4" r="3" fill="#334155" /></marker>
      </defs>
    </svg>

    <!-- toolbar -->
    <div class="toolbar card">
      <select :value="meta.id" class="view-select" @change="openDiagram($event.target.value)">
        <option v-if="!db.diagrams.some(d => d.id === meta.id)" :value="meta.id">{{ meta.name }} (unsaved)</option>
        <option v-for="d in db.diagrams" :key="d.id" :value="d.id">{{ d.name }}</option>
      </select>
      <input v-model="meta.name" type="text" class="name-input" placeholder="View name" @input="dirty = true" />
      <button class="btn" title="New empty view" @click="newDiagram"><FilePlus2 :size="15" />New</button>
      <div class="gen">
        <Wand2 :size="15" class="gen-icon" />
        <select value="" @change="generate($event.target.value); $event.target.value = ''">
          <option value="">Generate from repository…</option>
          <optgroup label="Layered view of application">
            <option v-for="a in db.applications.filter(x => x.lifecycle !== 'Retired')" :key="a.id" :value="'app:' + a.id">{{ a.name }}</option>
          </optgroup>
          <optgroup label="Capability realization view">
            <option v-for="c in l1Caps()" :key="c.id" :value="'cap:' + c.id">{{ c.name }}</option>
          </optgroup>
          <optgroup label="Migration view of project">
            <option v-for="p in db.projects" :key="p.id" :value="'proj:' + p.id">{{ p.name }}</option>
          </optgroup>
        </select>
      </div>
      <div style="flex:1" />
      <span v-if="dirty" class="tag t-amber">Unsaved</span>
      <button class="btn primary" @click="save"><Save :size="15" />Save</button>
      <button class="btn" title="ArchiMate Open Exchange Format (.xml) – opens in Archi, BiZZdesign, Sparx…" @click="exportXml"><Download :size="15" />ArchiMate</button>
      <button class="btn" title="draw.io / diagrams.net file with ArchiMate 3 shapes" @click="exportDrawio"><Workflow :size="15" />draw.io</button>
      <button class="icon-btn" title="Delete view" @click="removeDiagram"><Trash2 :size="16" /></button>
    </div>

    <div class="workspace">
      <!-- palette -->
      <aside class="palette card">
        <div class="seg" style="width:100%;margin-bottom:10px">
          <button style="flex:1" :class="{ on: paletteTab === 'elements' }" @click="paletteTab = 'elements'">ArchiMate</button>
          <button style="flex:1" :class="{ on: paletteTab === 'repo' }" @click="paletteTab = 'repo'">Repository</button>
        </div>
        <div class="palette-scroll">
          <template v-if="paletteTab === 'elements'">
            <div v-for="layer in PALETTE" :key="layer.id" class="layer">
              <button class="layer-head" @click="toggleLayer(layer.id)">
                <i :style="{ background: layer.items.length ? fillOf(layer.items[0].type) : '#fff', borderColor: layer.items.length ? strokeOf(layer.items[0].type) : '#ccc' }" />
                {{ layer.name }}<span class="subtle" style="margin-left:auto">{{ openLayers.includes(layer.id) ? '−' : '+' }}</span>
              </button>
              <div v-if="openLayers.includes(layer.id)" class="layer-items">
                <div v-for="it in layer.items" :key="it.type" class="pal-item" draggable="true" :title="`Drag to canvas: ${it.name}`"
                     @dragstart="onDragStart($event, { atype: it.type, name: it.name })">
                  <svg viewBox="0 0 16 16" class="pal-glyph" :style="{ background: fillOf(it.type), borderColor: strokeOf(it.type) }"><path :d="it.glyph" fill="none" stroke="#1e293b" stroke-width="1.1" /></svg>
                  <span>{{ it.name }}</span>
                </div>
              </div>
            </div>
          </template>
          <template v-else>
            <input v-model="repoQuery" type="text" placeholder="Search repository…" style="width:100%;margin-bottom:8px" />
            <div v-for="g in repoGroups" :key="g.label" class="layer">
              <div class="subtle strong" style="margin:8px 0 4px">{{ g.label }}</div>
              <div v-for="it in g.items" :key="it.id" class="pal-item" draggable="true"
                   @dragstart="onDragStart($event, { atype: REPO_TYPE[g.refType](it), name: it.name, refType: g.refType, refId: it.id })">
                <svg viewBox="0 0 16 16" class="pal-glyph" :style="{ background: fillOf(REPO_TYPE[g.refType](it)), borderColor: strokeOf(REPO_TYPE[g.refType](it)) }"><path :d="ELEMENTS[REPO_TYPE[g.refType](it)].glyph" fill="none" stroke="#1e293b" stroke-width="1.1" /></svg>
                <span>{{ it.name }}</span>
              </div>
            </div>
            <div class="subtle" style="margin-top:8px">Repository elements stay linked: the blue dot on a shape opens it in the Impact Explorer.</div>
          </template>
        </div>
      </aside>

      <!-- canvas -->
      <div class="canvas card" @dragover.prevent @drop="onDrop">
        <VueFlow :id="FLOW_ID" :connection-mode="ConnectionMode.Loose" :delete-key-code="['Backspace', 'Delete']"
                 :default-edge-options="{ type: 'archimate' }" :snap-to-grid="true" :snap-grid="[10, 10]" :min-zoom="0.2" :max-zoom="2.5"
                 :elevate-edges-on-select="true">
          <template #node-archimate="p"><ArchiNode :id="p.id" :data="p.data" :selected="p.selected" /></template>
          <template #edge-archimate="p"><ArchiEdge v-bind="p" /></template>
          <Background pattern-color="#dbe2ea" :gap="20" />
          <Controls position="bottom-left" />
          <MiniMap position="bottom-right" pannable zoomable :node-color="n => fillOf(n.data.atype)" :node-stroke-color="n => strokeOf(n.data.atype)" />
        </VueFlow>
        <div v-if="!nodes.length" class="empty-canvas">Drag ArchiMate elements or repository elements here.<br>Connect shapes by dragging from the handles on their edges.</div>
        <Transition name="fade"><div v-if="toast" class="toast">{{ toast }}</div></Transition>

        <!-- relationship picker -->
        <div v-if="pending" class="picker-backdrop" @click.self="pending = null">
          <div class="picker card">
            <h3>Relationship</h3>
            <p class="subtle" style="margin:2px 0 10px">{{ findNode(pending.source)?.data.name }} → {{ findNode(pending.target)?.data.name }}</p>
            <button v-for="r in pendingOptions" :key="r" class="rel-btn" @click="createRelation(r)">
              <svg width="54" height="14" viewBox="0 0 54 14">
                <line x1="8" y1="7" x2="46" y2="7" stroke="#334155" stroke-width="1.3" :stroke-dasharray="relSample(r).dash"
                      :marker-start="relSample(r).start ? `url(#${relSample(r).start})` : null" :marker-end="relSample(r).end ? `url(#${relSample(r).end})` : null" />
              </svg>
              {{ RELATIONS[r].name }}
            </button>
            <p class="subtle" style="margin-top:8px">Only relationships valid between {{ ELEMENTS[findNode(pending.source)?.data.atype]?.name }} and {{ ELEMENTS[findNode(pending.target)?.data.atype]?.name }} are offered.</p>
          </div>
        </div>
      </div>

      <!-- properties -->
      <aside class="props card">
        <template v-if="node">
          <div class="subtle">Element</div>
          <h3 style="margin:2px 0 12px">{{ ELEMENTS[node.data.atype].name }}</h3>
          <div class="stack" style="gap:10px">
            <label class="field">Name<input type="text" :value="node.data.name" @input="setNodeField('name', $event.target.value)" /></label>
            <label class="field">Type
              <select :value="node.data.atype" @change="setNodeField('atype', $event.target.value)">
                <optgroup v-for="l in PALETTE" :key="l.id" :label="l.name"><option v-for="it in l.items" :key="it.type" :value="it.type">{{ it.name }}</option></optgroup>
              </select>
            </label>
            <label class="field">Documentation<textarea rows="4" :value="node.data.doc" @input="setNodeField('doc', $event.target.value)" /></label>
            <div v-if="node.data.refId" class="alert info small" style="flex-direction:column;gap:4px">
              <span>Linked to repository element <b>{{ node.data.refId }}</b></span>
              <router-link v-if="explorerTypes.includes(node.data.refType)" :to="{ name: 'explorer', query: { type: node.data.refType, id: node.data.refId } }">Open in Impact Explorer →</router-link>
            </div>
            <button class="btn" @click="deleteSelection"><Trash2 :size="14" />Remove from view</button>
          </div>
        </template>
        <template v-else-if="edge">
          <div class="subtle">Relationship</div>
          <h3 style="margin:2px 0 4px">{{ RELATIONS[edge.data.rel]?.name }}</h3>
          <p class="subtle" style="margin-bottom:12px">{{ findNode(edge.source)?.data.name }} → {{ findNode(edge.target)?.data.name }}</p>
          <div class="stack" style="gap:10px">
            <label class="field">Type
              <select :value="edge.data.rel" @change="setEdgeField('rel', $event.target.value)">
                <option v-for="r in edgeOptions" :key="r" :value="r">{{ RELATIONS[r].name }}</option>
                <option v-if="!edgeOptions.includes(edge.data.rel)" :value="edge.data.rel">{{ RELATIONS[edge.data.rel]?.name }} (invalid)</option>
              </select>
            </label>
            <label class="field">Label<input type="text" :value="edge.data.name" @input="setEdgeField('name', $event.target.value)" /></label>
            <button class="btn" @click="deleteSelection"><Trash2 :size="14" />Delete relationship</button>
          </div>
        </template>
        <template v-else>
          <div class="subtle">View</div>
          <h3 style="margin:2px 0 12px">{{ meta.name }}</h3>
          <dl class="kv" style="grid-template-columns:90px 1fr">
            <dt>Viewpoint</dt><dd>{{ meta.viewpoint }}</dd>
            <dt>Elements</dt><dd>{{ nodes.length }}</dd>
            <dt>Relations</dt><dd>{{ edges.length }}</dd>
          </dl>
          <div class="stack mt small">
            <div v-for="(c, l) in typeCounts" :key="l" class="row between"><span class="row"><i class="dot" :style="{ background: fillOf(PALETTE.find(p => p.id === l).items[0].type), border: '1px solid ' + strokeOf(PALETTE.find(p => p.id === l).items[0].type) }" />{{ PALETTE.find(p => p.id === l).name }}</span><b>{{ c }}</b></div>
          </div>
          <h4 class="subtle mt" style="text-transform:uppercase;letter-spacing:.05em">Model check</h4>
          <div v-if="!invalidEdges.length" class="alert ok small mt"><CheckCircle2 :size="15" />All relationships are valid ArchiMate.</div>
          <div v-else class="alert warn small mt"><AlertTriangle :size="15" />{{ invalidEdges.length }} relationship(s) are not allowed for the connected element types.</div>
          <div class="subtle mt">Tips: drag from a shape's edge handle to connect · Delete/Backspace removes the selection · resize a selected shape by its corners.</div>
        </template>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.modeler { display: flex; flex-direction: column; gap: 12px; height: calc(100vh - 56px - 48px); min-height: 560px; }
.toolbar { display: flex; align-items: center; gap: 8px; padding: 10px 12px; flex-wrap: wrap; }
.view-select { min-width: 220px; max-width: 300px; }
.name-input { width: 220px; }
.gen { position: relative; display: flex; align-items: center; }
.gen-icon { position: absolute; left: 9px; color: #7c3aed; pointer-events: none; }
.gen select { padding-left: 30px; max-width: 240px; }
.workspace { flex: 1; display: grid; grid-template-columns: 230px 1fr 270px; gap: 12px; min-height: 0; }
.palette, .props { padding: 12px; display: flex; flex-direction: column; min-height: 0; overflow: hidden; }
.props { overflow-y: auto; }
.palette-scroll { overflow-y: auto; flex: 1; margin-right: -6px; padding-right: 6px; }
.layer-head { display: flex; align-items: center; gap: 8px; width: 100%; border: 0; background: none; font: inherit; font-weight: 600; font-size: 12.5px; padding: 6px 2px; cursor: pointer; color: var(--text); }
.layer-head i { width: 12px; height: 12px; border: 1px solid; border-radius: 3px; }
.layer-items { display: grid; gap: 2px; margin-bottom: 6px; }
.pal-item { display: flex; align-items: center; gap: 8px; padding: 4px 6px; border-radius: 6px; cursor: grab; font-size: 12.5px; user-select: none; }
.pal-item:hover { background: var(--primary-soft); }
.pal-glyph { width: 22px; height: 22px; padding: 3px; border: 1px solid; border-radius: 4px; flex-shrink: 0; }
.canvas { position: relative; padding: 0; overflow: hidden; }
.empty-canvas { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; text-align: center; color: var(--text-3); pointer-events: none; line-height: 1.6; }
.toast { position: absolute; top: 12px; left: 50%; transform: translateX(-50%); background: #0f172a; color: #fff; padding: 7px 14px; border-radius: 8px; font-size: 13px; z-index: 10; }
.picker-backdrop { position: absolute; inset: 0; background: rgba(15, 23, 42, .18); display: flex; align-items: center; justify-content: center; z-index: 20; }
.picker { width: 320px; max-height: 80%; overflow-y: auto; }
.rel-btn { display: flex; align-items: center; gap: 10px; width: 100%; padding: 7px 8px; border: 1px solid transparent; border-radius: 7px; background: none; font: inherit; cursor: pointer; text-align: left; }
.rel-btn:hover { background: var(--primary-soft); border-color: #bfdbfe; }
@media (max-width: 1100px) { .workspace { grid-template-columns: 200px 1fr; } .props { display: none; } }
</style>
