const fs = require('node:fs')
const path = require('node:path')

const dataPath = path.join(__dirname, 'shared/data/quran.json')
const hbook = JSON.parse(fs.readFileSync(dataPath, 'utf8'))
const hdetails = JSON.parse(fs.readFileSync(path.join(__dirname, 'shared/data/chapters/en.json'), 'utf8'))
const ready = []
hdetails.forEach((item) => {
  const qr = hbook[item.id]
  if (qr)
    ready.push({ id: item.id, name: item.name, e_name: item.translation, type: item.type, total_verses: item.total_verses, ayat: qr })
})
const s = ready[1] // sura 2
function escapeHtml(str) { return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;') }
const trailingDigitsRe = /([0-9\u0660-\u0669\u06F0-\u06F9]+)\s*$/u
const parts = (s.ayat || []).map((a, idx) => {
  const raw = String(a.text || '')
  if (!raw)
    return ''
  const match = raw.match(trailingDigitsRe)
  const numberFromText = match ? match[1] : null
  const textOnly = numberFromText ? raw.replace(trailingDigitsRe, '').trim() : raw
  const text = escapeHtml(textOnly)
  const verse = escapeHtml(String(numberFromText ?? a.verse ?? ''))
  const id = `${s.id}_${a.verse ?? idx + 1}`
  return `<span class="aya-inline" id="${id}" data-verse="${verse}"><span class="arabic-text">${text}</span><span class="verse-num" aria-hidden="true">${verse}</span></span>`
}).filter(Boolean).join('\u202F')
console.log(parts.slice(0, 400))
console.log('parts length:', parts.length)
