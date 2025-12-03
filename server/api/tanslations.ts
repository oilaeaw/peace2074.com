import { readFile, writeFile, readdir } from 'fs/promises'
import { join } from 'path'
import { defineEventHandler, getQuery, readBody } from 'h3'

const localesDir = join(process.cwd(), 'app', 'locale')

export default defineEventHandler(async (event) => {
  // Simple safety: only allow in dev or when RUNNING_LOCAL env is set
  const config = useRuntimeConfig()
  if (config?.public?.allowTranslationsApi !== true && process.env.NODE_ENV !== 'development') {
    return { ok: false, error: 'translations api disabled' }
  }

  const q = getQuery(event) as Record<string, string>
  const action = q.action || event.node.req.method

  if (event.node.req.method === 'GET') {
    // support action=list to return all locale filenames
    const actionParam = q.action || ''
    if (actionParam === 'list') {
      try {
        const files = await readdir(localesDir)
        // filter only .json files
        const jsonFiles = files.filter((f) => f.endsWith('.json'))
        return { ok: true, files: jsonFiles }
      } catch (err) {
        return { ok: false, error: String(err) }
      }
    }

    // otherwise return specific locale file
    const file = q.file || 'en.json'
    const full = join(localesDir, file)
    try {
      const raw = await readFile(full, 'utf8')
      return { ok: true, file, data: JSON.parse(raw) }
    } catch (err) {
      return { ok: false, error: String(err) }
    }
  }

  if (event.node.req.method === 'POST') {
    // write file (expects JSON body)
    try {
      const body = await readBody(event)
      const file = body.file || 'en.json'
      const content = body.content
      if (!content || typeof content !== 'object') return { ok: false, error: 'invalid content' }
      const full = join(localesDir, file)
      await writeFile(full, JSON.stringify(content, null, 2) + '\n', 'utf8')
      return { ok: true }
    } catch (err) {
      return { ok: false, error: String(err) }
    }
  }

  return { ok: false, error: 'unsupported method' }
})