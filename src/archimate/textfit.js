// Approximate text wrapping shared by layout (states.js) and rendering (svgRender.js).
export function wrap (text, maxWidth, fontSize, maxLines = 3) {
  const cw = fontSize * 0.56
  const max = Math.max(4, Math.floor(maxWidth / cw))
  const words = String(text).split(/\s+/)
  const lines = []; let line = ''
  for (const w of words) {
    const t = line ? `${line} ${w}` : w
    if (t.length <= max) line = t
    else { if (line) lines.push(line); line = w.length > max ? w.slice(0, max - 1) + '…' : w }
  }
  if (line) lines.push(line)
  if (lines.length > maxLines) { lines.length = maxLines; lines[maxLines - 1] = lines[maxLines - 1].slice(0, max - 1) + '…' }
  return lines
}
// font size of container titles by nesting depth
export const titleFont = depth => (depth === 0 ? 17 : depth === 1 ? 13.5 : 12)
export const titleLines = (name, width, depth) => wrap(name, width - 40, titleFont(depth), 2)
