// Render an architecture-state view (from states.js) as a standalone SVG.
import { ELEMENTS, RELATIONS, fillOf, strokeOf } from './notation'
import { STATUS_LABEL } from './states'
import { wrap, titleFont, titleLines } from './textfit'

const FONT = "Inter, 'Segoe UI', Helvetica, Arial, sans-serif"
const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const STATUS_STYLE = {
  new: { stroke: '#16a34a', width: 2.2, dash: null, badge: '#16a34a' },
  phaseout: { stroke: '#d97706', width: 2, dash: '5 3', badge: '#d97706' },
  planned: { stroke: '#2563eb', width: 1.6, dash: '4 3', badge: '#2563eb', opacity: 0.6 },
  removed: { stroke: '#dc2626', width: 1.4, dash: '3 3', badge: '#dc2626', fill: '#fef2f2' }
}

const MARKERS = `
  <marker id="m-arrow-filled" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="10" markerHeight="10" markerUnits="userSpaceOnUse" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#334155"/></marker>
  <marker id="m-arrow-open" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="10" markerHeight="10" markerUnits="userSpaceOnUse" orient="auto"><path d="M0,0 L10,5 L0,10" fill="none" stroke="#334155" stroke-width="1.3"/></marker>
  <marker id="m-triangle-hollow" viewBox="0 0 12 12" refX="12" refY="6" markerWidth="13" markerHeight="13" markerUnits="userSpaceOnUse" orient="auto"><path d="M0.5,0.5 L12,6 L0.5,11.5 z" fill="#fff" stroke="#334155" stroke-width="1.2"/></marker>
  <marker id="m-diamond-hollow" viewBox="0 0 14 8" refX="14" refY="4" markerWidth="14" markerHeight="8" markerUnits="userSpaceOnUse" orient="auto-start-reverse"><path d="M0.5,4 L7,0.5 L13.5,4 L7,7.5 z" fill="#fff" stroke="#334155" stroke-width="1.1"/></marker>
  <marker id="m-diamond-filled" viewBox="0 0 14 8" refX="14" refY="4" markerWidth="14" markerHeight="8" markerUnits="userSpaceOnUse" orient="auto-start-reverse"><path d="M0,4 L7,0 L14,4 L7,8 z" fill="#334155"/></marker>`
const markerId = { 'am-arrow-filled': 'm-arrow-filled', 'am-arrow-open': 'm-arrow-open', 'am-triangle-hollow': 'm-triangle-hollow', 'am-diamond-hollow': 'm-diamond-hollow', 'am-diamond-filled': 'm-diamond-filled' }

// point where the line from the box centre towards (tx, ty) leaves the box
function clip (n, tx, ty) {
  const cx = n.x + n.w / 2; const cy = n.y + n.h / 2
  const dx = tx - cx; const dy = ty - cy
  if (!dx && !dy) return { x: cx, y: cy }
  const s = Math.min(Math.abs((n.w / 2) / (dx || 1e-9)), Math.abs((n.h / 2) / (dy || 1e-9)))
  return { x: cx + dx * s, y: cy + dy * s }
}

function nodeSvg (n, e, { showStatus }) {
  const type = e.type
  const meta = ELEMENTS[type]
  const st = showStatus && n.status && n.status !== 'active' ? STATUS_STYLE[n.status] : null
  const fill = st?.fill || fillOf(type)
  const stroke = st?.stroke || strokeOf(type)
  const rx = meta.shape === 'round' ? 8 : meta.shape === 'pill' ? n.h / 2 : 2
  const out = []
  out.push(`<g${st?.opacity ? ` opacity="${st.opacity}"` : ''}>`)
  out.push(`<rect x="${n.x}" y="${n.y}" width="${n.w}" height="${n.h}" rx="${rx}" fill="${fill}" stroke="${stroke}" stroke-width="${st?.width || 1.2}"${st?.dash || n.dashed ? ` stroke-dasharray="${st?.dash || '5 3'}"` : ''}/>`)
  out.push(`<g transform="translate(${n.x + n.w - 20},${n.y + 4})"><path d="${meta.glyph}" fill="none" stroke="#1e293b" stroke-width="1.1" stroke-linejoin="round"/></g>`)
  if (n.container) {
    const fs = titleFont(n.depth)
    const tl = titleLines(e.name, n.w, n.depth)
    tl.forEach((l, k) => out.push(`<text x="${n.x + 10}" y="${n.y + fs + 8 + k * (fs + 3)}" font-size="${fs}" font-weight="700" fill="#0f172a">${esc(l)}</text>`))
    const below = n.y + fs + 8 + (tl.length - 1) * (fs + 3)
    if (n.sub) out.push(`<text x="${n.x + 10}" y="${below + 19}" font-size="12" fill="#334155">${esc(n.sub)}</text>`)
    if (n.empty) out.push(`<text x="${n.x + 10}" y="${below + 20}" font-size="11" font-style="italic" fill="#b91c1c">No IT support</text>`)
  } else {
    const lines = wrap(e.name, n.w - 30, 11.5, Math.max(1, Math.floor((n.h - 8) / 14) - (n.sub ? 1 : 0)))
    const total = lines.length + (n.sub ? 1 : 0)
    const y0 = n.y + n.h / 2 - (total - 1) * 7 + 4
    lines.forEach((l, k) => out.push(`<text x="${n.x + n.w / 2 - 6}" y="${y0 + k * 14}" font-size="11.5" text-anchor="middle" fill="${n.status === 'removed' && showStatus ? '#991b1b' : '#0f172a'}"${n.status === 'removed' && showStatus ? ' text-decoration="line-through"' : ''}>${esc(l)}</text>`))
    if (n.sub) out.push(`<text x="${n.x + n.w / 2 - 6}" y="${y0 + lines.length * 14}" font-size="10.5" text-anchor="middle" fill="#475569">${esc(n.sub)}</text>`)
  }
  if (st && STATUS_LABEL[n.status]) {
    const label = STATUS_LABEL[n.status]
    const bw = label.length * 5.6 + 10
    out.push(`<rect x="${n.x + 4}" y="${n.y - 7}" width="${bw}" height="13" rx="3" fill="${st.badge}"/><text x="${n.x + 4 + bw / 2}" y="${n.y + 2.6}" font-size="8.5" font-weight="700" fill="#fff" text-anchor="middle" letter-spacing=".4">${label}</text>`)
  }
  out.push('</g>')
  return out.join('')
}

function connectionSvg (c, byId, relsById) {
  const s = byId[c.source]; const t = byId[c.target]
  const r = relsById[c.rel]; const R = RELATIONS[r.rel]
  const ms = R.start ? ` marker-start="url(#${markerId[R.start]})"` : ''
  const me = R.end ? ` marker-end="url(#${markerId[R.end]})"` : ''
  const dash = R.dash ? ` stroke-dasharray="${R.dash}"` : ''
  let d
  if (c.rail != null) {
    const y = s.y + s.h / 2
    d = `M${s.x},${y} H${c.rail} V${t.y + t.h}`
  } else {
    const a = clip(s, t.x + t.w / 2, t.y + t.h / 2); const b = clip(t, s.x + s.w / 2, s.y + s.h / 2)
    d = `M${a.x},${a.y} L${b.x},${b.y}`
  }
  return `<path d="${d}" fill="none" stroke="#475569" stroke-width="1.2"${dash}${ms}${me}/>`
}

/** SVG string for one view. */
export function viewToSvg (view, model, { showStatus = true, title, footer } = {}) {
  const els = Object.fromEntries(model.elements.map(e => [e.id, e]))
  const rels = Object.fromEntries(model.relationships.map(r => [r.id, r]))
  const byId = Object.fromEntries(view.nodes.map(n => [n.id, n]))
  const PAD = 24; const HEAD = title ? 44 : 0; const LEG = 56
  const W = view.width + PAD * 2
  const H = view.height + PAD * 2 + HEAD + LEG
  const parts = []
  parts.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="${FONT}">`)
  parts.push(`<defs>${MARKERS}</defs><rect width="${W}" height="${H}" fill="#ffffff"/>`)
  if (title) parts.push(`<text x="${PAD}" y="${PAD + 16}" font-size="18" font-weight="700" fill="#0f172a">${esc(title)}</text>`)
  parts.push(`<g transform="translate(${PAD},${PAD + HEAD})">`)
  view.connections.forEach(c => parts.push(connectionSvg(c, byId, rels)))
  view.nodes.slice().sort((a, b) => (a.depth || 0) - (b.depth || 0)).forEach(n => parts.push(nodeSvg(n, els[n.el], { showStatus })))
  parts.push('</g>')

  // legend + footer
  const ly = PAD + HEAD + view.height + 26
  const legend = view.kind === 'plateau' && showStatus
    ? [['new', 'New since previous plateau'], ['phaseout', 'Phase-out'], ['planned', 'In implementation'], ['removed', 'Retired since previous plateau']]
    : []
  let lx = PAD
  for (const [k, label] of legend) {
    const st = STATUS_STYLE[k]
    parts.push(`<rect x="${lx}" y="${ly - 10}" width="22" height="13" rx="2" fill="${st.fill || '#b5ffff'}" stroke="${st.stroke}" stroke-width="${st.width}"${st.dash ? ` stroke-dasharray="${st.dash}"` : ''}/><text x="${lx + 28}" y="${ly}" font-size="11.5" fill="#334155">${esc(label)}</text>`)
    lx += 40 + label.length * 6.2
  }
  if (footer) parts.push(`<text x="${W - PAD}" y="${H - 12}" font-size="10.5" fill="#94a3b8" text-anchor="end">${esc(footer)}</text>`)
  parts.push('</svg>')
  return parts.join('')
}

/** Rasterise an SVG string to a PNG blob (scale 2 for crisp slides). */
export async function svgToPng (svg, scale = 2) {
  const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }))
  try {
    const img = new Image()
    img.src = url
    await img.decode()
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(img.naturalWidth * scale)
    canvas.height = Math.round(img.naturalHeight * scale)
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    return await new Promise(resolve => canvas.toBlob(resolve, 'image/png'))
  } finally { URL.revokeObjectURL(url) }
}
