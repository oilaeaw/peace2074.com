import fs from 'node:fs/promises'

const BASE =
  'https://raw.githubusercontent.com/fawazahmed0/quran-api/1/editions'
const DE_EDITION = process.env.DE_EDITION_KEY || 'deu-asfbubenheimand'
const HE_EDITION = process.env.HE_EDITION_KEY || 'heb-darusalamhousei'

async function fetchJson(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`)
  return res.json()
}

async function buildEdition(editionKey, label) {
  const out = {}
  for (let chapter = 1; chapter <= 114; chapter++) {
    const url = `${BASE}/${editionKey}/${chapter}.json`
    const payload = await fetchJson(url)
    const chapterItems = Array.isArray(payload?.chapter) ? payload.chapter : []

    out[String(chapter)] = chapterItems.map((v) => ({
      chapter: Number(v?.chapter || chapter),
      verse: Number(v?.verse || 0),
      text: String(v?.text || '').trim(),
    }))

    process.stdout.write(`\r${label}: ${chapter}/114`)
  }
  process.stdout.write('\n')
  return out
}

const de = await buildEdition(DE_EDITION, 'de')
const he = await buildEdition(HE_EDITION, 'he')

await fs.writeFile(
  'src/shared/data/editions/de.json',
  JSON.stringify(de, null, 2) + '\n'
)
await fs.writeFile(
  'src/shared/data/editions/he.json',
  JSON.stringify(he, null, 2) + '\n'
)

console.log('Generated editions/de.json and editions/he.json')
console.log(`Sources: ${DE_EDITION}, ${HE_EDITION}`)
