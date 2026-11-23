<script setup>
import { ref, computed } from 'vue'
import { FileSpreadsheet, Upload, Download, CheckCircle2, AlertTriangle, XCircle } from 'lucide-vue-next'
import { buildTemplate, parseWorkbook, download, SHEETS } from '../utils/excel'
import { applyImport } from '../store'
import PageHead from '../components/PageHead.vue'
import Tag from '../components/Tag.vue'

const busy = ref('')
const error = ref('')
const fileName = ref('')
const preview = ref(null)
const activeSheet = ref(null)
const filter = ref('changes')
const done = ref(null)
const dragOver = ref(false)

async function getTemplate (withData) {
  busy.value = withData ? 'export' : 'template'
  try {
    const blob = await buildTemplate({ withData })
    download(blob, withData ? `ea-compass-repository-${new Date().toISOString().slice(0, 10)}.xlsx` : 'ea-compass-import-template.xlsx')
  } catch (e) { error.value = `Could not create workbook: ${e.message}` } finally { busy.value = '' }
}

async function handleFile (file) {
  if (!file) return
  error.value = ''; done.value = null; preview.value = null
  if (!/\.xlsx$/i.test(file.name)) { error.value = 'Please upload an .xlsx file (Excel 2007 or newer).'; return }
  if (file.size > 10 * 1024 * 1024) { error.value = 'File is larger than 10 MB.'; return }
  fileName.value = file.name
  busy.value = 'parse'
  try {
    preview.value = await parseWorkbook(await file.arrayBuffer())
    activeSheet.value = preview.value.sheets[0]?.sheet ?? null
    if (!preview.value.sheets.length) error.value = `No known sheets found. Expected one of: ${SHEETS.map(s => s.sheet).join(', ')}.`
  } catch (e) {
    error.value = `Could not read the workbook: ${e.message}`
  } finally { busy.value = '' }
}
const onPick = e => { handleFile(e.target.files[0]); e.target.value = '' }
const onDrop = e => { dragOver.value = false; handleFile(e.dataTransfer.files[0]) }

const sheet = computed(() => preview.value?.sheets.find(s => s.sheet === activeSheet.value))
const rows = computed(() => (sheet.value?.rows || []).filter(r => filter.value === 'all' || (filter.value === 'changes' ? r.action !== 'unchanged' : r.action === 'error')))
const hasErrors = computed(() => preview.value && (preview.value.totals.error > 0 || preview.value.totals.sheetErrors > 0))
const toImport = computed(() => (preview.value ? preview.value.totals.new + preview.value.totals.update : 0))

function commit () {
  if (hasErrors.value && !window.confirm(`${preview.value.totals.error} row(s) have errors and will be skipped. References to skipped rows may stay unresolved. Import the ${toImport.value} valid row(s)?`)) return
  const n = applyImport(preview.value.changes)
  done.value = { n, new: preview.value.totals.new, update: preview.value.totals.update }
  preview.value = null
}
const actionTone = { new: 'green', update: 'blue', unchanged: 'grey', error: 'red' }
</script>

<template>
  <PageHead eyebrow="Repository · Data management" title="Excel Import"
            subtitle="Bulk-load or update capabilities, applications, technologies, data objects and interfaces from Excel. Every upload is validated and previewed before anything changes." />

  <div class="grid g-3">
    <div class="card">
      <div class="card-head"><div><h2>1 · Get a workbook</h2><p>Template with dropdowns and validation</p></div></div>
      <div class="stack">
        <button class="btn" style="width:100%" :disabled="!!busy" @click="getTemplate(false)"><FileSpreadsheet :size="15" />{{ busy === 'template' ? 'Preparing…' : 'Download empty template' }}</button>
        <button class="btn" style="width:100%" :disabled="!!busy" @click="getTemplate(true)"><Download :size="15" />{{ busy === 'export' ? 'Preparing…' : 'Export current repository' }}</button>
      </div>
      <p class="subtle mt">Tip: export the repository, edit it in Excel, and upload it again. Only the rows you changed are updated.</p>
    </div>

    <div class="card span-2">
      <div class="card-head"><div><h2>2 · Upload</h2><p>.xlsx · sheets: {{ SHEETS.map(s => s.sheet).join(', ') }}</p></div></div>
      <label class="dropzone" :class="{ over: dragOver }" @dragover.prevent="dragOver = true" @dragleave="dragOver = false" @drop.prevent="onDrop">
        <input type="file" accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" hidden @change="onPick" />
        <Upload :size="22" />
        <div><b>{{ busy === 'parse' ? 'Reading workbook…' : 'Drop an Excel file here or click to choose' }}</b></div>
        <div v-if="fileName" class="subtle">Last file: {{ fileName }}</div>
      </label>
      <div v-if="error" class="alert bad mt"><XCircle :size="16" />{{ error }}</div>
      <div v-if="done" class="alert ok mt"><CheckCircle2 :size="16" />Imported {{ done.n }} element(s): {{ done.new }} new, {{ done.update }} updated. Changes are kept in memory until you reload the page.</div>
    </div>
  </div>

  <template v-if="preview && preview.sheets.length">
    <div class="card mt">
      <div class="card-head">
        <div><h2>3 · Review & import</h2><p>Nothing has been changed yet</p></div>
        <div class="row">
          <Tag :value="`${preview.totals.new} new`" t="green" />
          <Tag :value="`${preview.totals.update} updated`" t="blue" />
          <Tag :value="`${preview.totals.unchanged} unchanged`" t="grey" />
          <Tag :value="`${preview.totals.error} errors`" :t="preview.totals.error ? 'red' : 'grey'" />
          <button class="btn primary" :disabled="!toImport" @click="commit">Import {{ toImport }} change(s)</button>
        </div>
      </div>
      <div v-if="preview.unknownSheets.length" class="alert info small" style="margin-bottom:10px">Ignored sheets: {{ preview.unknownSheets.join(', ') }}</div>
      <div v-if="!hasErrors && !toImport" class="alert ok small" style="margin-bottom:10px"><CheckCircle2 :size="15" />The workbook matches the repository – nothing to import.</div>

      <div class="row between" style="margin-bottom:12px">
        <div class="seg">
          <button v-for="s in preview.sheets" :key="s.sheet" :class="{ on: activeSheet === s.sheet }" @click="activeSheet = s.sheet">
            {{ s.sheet }} <span class="subtle">({{ s.counts.new + s.counts.update }}<template v-if="s.counts.error"> · <span style="color:#dc2626">{{ s.counts.error }}!</span></template>)</span>
          </button>
        </div>
        <div class="seg">
          <button :class="{ on: filter === 'changes' }" @click="filter = 'changes'">Changes</button>
          <button :class="{ on: filter === 'errors' }" @click="filter = 'errors'">Errors</button>
          <button :class="{ on: filter === 'all' }" @click="filter = 'all'">All rows</button>
        </div>
      </div>

      <div v-for="e in sheet?.sheetErrors || []" :key="e" class="alert bad small" style="margin-bottom:8px"><AlertTriangle :size="15" />{{ e }}</div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Row</th><th>ID</th><th>Name</th><th>Action</th><th>Details</th></tr></thead>
          <tbody>
            <tr v-for="r in rows" :key="r.rowNum">
              <td class="subtle">{{ r.rowNum }}</td>
              <td class="subtle nowrap">{{ r.id }}</td>
              <td class="strong">{{ r.name || '—' }}</td>
              <td><Tag :value="r.action" :t="actionTone[r.action]" /></td>
              <td class="small">
                <div v-for="e in r.errors" :key="e" style="color:#b91c1c">{{ e }}</div>
                <span v-if="r.action === 'update'" class="muted">Changed: {{ r.changed.join(', ') }}</span>
              </td>
            </tr>
            <tr v-if="!rows.length"><td colspan="5" class="empty">No rows for this filter.</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </template>
</template>

<style scoped>
.dropzone { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; padding: 28px; border: 2px dashed var(--border); border-radius: 10px; cursor: pointer; color: var(--text-2); text-align: center; transition: all .15s; }
.dropzone:hover, .dropzone.over { border-color: var(--primary); background: var(--primary-soft); color: var(--primary); }
</style>
