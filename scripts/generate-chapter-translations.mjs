import fs from 'node:fs/promises'

const chaptersEn = JSON.parse(
  await fs.readFile('src/shared/data/chapters/en.json', 'utf8')
)

const apiKey =
  process.env.DEEPSEEK_API_KEY || process.env.NITRO_DEEPSEEK_API_KEY
const baseURL = (
  process.env.DEEPSEEK_BASE_URL ||
  process.env.NITRO_DEEPSEEK_BASE_URL ||
  'https://api.deepseek.com/v1'
).replace(/\/$/, '')
const model = process.env.DEEPSEEK_MODEL || 'deepseek-chat'

if (!apiKey || String(apiKey).trim() === '') {
  throw new Error('Missing DEEPSEEK_API_KEY (or NITRO_DEEPSEEK_API_KEY).')
}

async function translateBatch(target, langName) {
  const payload = chaptersEn.map((c) => ({ id: c.id, text: c.translation }))

  const res = await fetch(`${baseURL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${String(apiKey).trim()}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0,
      messages: [
        {
          role: 'system',
          content: `You are a precise translator. Translate each English Quran chapter title to ${langName}. Return ONLY valid JSON array in this exact shape: [{"id":1,"translation":"..."}]. Keep ids unchanged and preserve meaning. No markdown.`,
        },
        {
          role: 'user',
          content: JSON.stringify(payload),
        },
      ],
    }),
  })

  const json = await res.json()
  if (!res.ok) {
    throw new Error(
      `translateBatch(${target}) HTTP ${res.status}: ${json?.error?.message || 'unknown error'}`
    )
  }

  const content = String(json?.choices?.[0]?.message?.content || '').trim()
  const cleaned = content
    .replace(/^```json\s*/i, '')
    .replace(/^```/, '')
    .replace(/```$/, '')
    .trim()
  const arr = JSON.parse(cleaned)
  if (!Array.isArray(arr))
    throw new Error(`Invalid ${target} translation response format`)

  const byId = new Map(
    arr
      .map((x) => ({
        id: Number(x?.id),
        translation: String(x?.translation || '').trim(),
      }))
      .filter((x) => x.id > 0)
      .map((x) => [x.id, x.translation])
  )

  const out = chaptersEn.map((ch) => ({
    id: ch.id,
    name: ch.name,
    transliteration: ch.transliteration,
    translation: byId.get(ch.id) || ch.translation,
    type: ch.type,
    total_verses: ch.total_verses,
  }))

  return out
}

const de = await translateBatch('de', 'German')
const he = await translateBatch('he', 'Hebrew')

await fs.writeFile(
  'src/shared/data/chapters/de.json',
  JSON.stringify(de, null, 2) + '\n'
)
await fs.writeFile(
  'src/shared/data/chapters/he.json',
  JSON.stringify(he, null, 2) + '\n'
)

console.log(
  'Generated chapters/de.json and chapters/he.json (DeepSeek batch mode).'
)
