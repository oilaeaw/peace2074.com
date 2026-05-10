import http from 'node:http'
import crypto from 'node:crypto'
import path from 'node:path'
import { Database, DatabaseOptions } from './Database'
import { FileStore, FileStoreOptions } from './FileStore'

export interface ServerOptions {
  db?: Database
  fileStore?: FileStore
  token?: string
  port?: number
  host?: string
  cors?: string | string[]
  dbOptions?: DatabaseOptions
  fileStoreOptions?: FileStoreOptions
}

export function createServer(options: ServerOptions = {}) {
  const port = options.port || 3714
  const host = options.host || '127.0.0.1'
  const corsOrigin = options.cors || null

  const token = options.token || crypto.randomBytes(32).toString('hex')
  if (!options.token) {
    console.log(`[@waelio/data] Bearer token: ${token}`)
  }

  const db = options.db || new Database(options.dbOptions || {})
  const fileStore =
    options.fileStore || new FileStore(options.fileStoreOptions || {})
  const sseClients = new Set<http.ServerResponse>()

  const broadcastEvent = (payload: any) => {
    const msg = `data: ${JSON.stringify(payload)}\n\n`
    for (const res of sseClients) {
      try {
        res.write(msg)
      } catch (_) {
        sseClients.delete(res)
      }
    }
  }

  db.on('change', broadcastEvent)
  fileStore.on('change', broadcastEvent)

  function setCorsHeaders(req: http.IncomingMessage, res: http.ServerResponse) {
    const origin = getAllowedOrigin(req)
    if (!origin) return
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type')
  }

  function getAllowedOrigin(req: http.IncomingMessage): string | null {
    if (!corsOrigin) return null
    if (corsOrigin === '*') return '*'
    const origin = req.headers.origin || ''
    if (Array.isArray(corsOrigin)) {
      return corsOrigin.includes(origin) ? origin : null
    }
    return corsOrigin === origin ? origin : null
  }

  function sendJSON(res: http.ServerResponse, status: number, body: any) {
    const json = JSON.stringify(body)
    res.writeHead(status, {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(json),
    })
    res.end(json)
  }

  function unauthorized(res: http.ServerResponse) {
    sendJSON(res, 401, { error: 'Unauthorized' })
  }

  function authenticate(req: http.IncomingMessage, res: http.ServerResponse) {
    const auth = req.headers.authorization || ''
    const match = auth.match(/^Bearer (.+)$/i)
    if (!match) return false
    const provided = Buffer.from(match[1])
    const expected = Buffer.from(token)
    if (provided.length !== expected.length) return false
    return crypto.timingSafeEqual(provided, expected)
  }

  function readBody(req: http.IncomingMessage): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = []
      req.on('data', (c) => chunks.push(c))
      req.on('end', () => resolve(Buffer.concat(chunks)))
      req.on('error', reject)
    })
  }

  function getContentType(ext: string): string {
    const types: Record<string, string> = {
      '.mp3': 'audio/mpeg',
      '.wav': 'audio/wav',
      '.json': 'application/json',
      '.txt': 'text/plain',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
    }
    return types[ext.toLowerCase()] || 'application/octet-stream'
  }

  async function handler(req: http.IncomingMessage, res: http.ServerResponse) {
    setCorsHeaders(req, res)

    if (req.method === 'OPTIONS') {
      res.writeHead(204)
      res.end()
      return
    }

    if (!authenticate(req, res)) {
      unauthorized(res)
      return
    }

    const url = new URL(
      req.url || '/',
      `http://${req.headers.host || 'localhost'}`
    )
    const parts = url.pathname.replace(/^\//, '').split('/').filter(Boolean)

    if (req.method === 'GET' && parts[0] === 'events') {
      const sseHeaders: Record<string, string> = {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      }
      const sseOrigin = getAllowedOrigin(req)
      if (sseOrigin) {
        sseHeaders['Access-Control-Allow-Origin'] = sseOrigin
      }
      res.writeHead(200, sseHeaders)
      res.write(': connected\n\n')
      sseClients.add(res)
      req.on('close', () => sseClients.delete(res))
      return
    }

    // ── Binary File Storage Routes (Files API) ──
    if (parts[0] === 'files') {
      const fileKey = parts.slice(1).join('/')

      if (!fileKey) {
        sendJSON(res, 400, { error: 'Missing file key' })
        return
      }

      if (req.method === 'GET') {
        const stream = fileStore.getFileStream(fileKey)
        if (!stream) {
          sendJSON(res, 404, { error: 'File not found' })
          return
        }

        const ext = path.extname(fileKey)
        const size = fileStore.getFileSize(fileKey)

        res.writeHead(200, {
          'Content-Type': getContentType(ext),
          'Content-Length': size || 0,
        })
        stream.pipe(res)
        return
      }

      if (req.method === 'POST' || req.method === 'PUT') {
        try {
          const buffer = await readBody(req)
          fileStore.saveFile(fileKey, buffer)
          sendJSON(res, 200, { ok: true, key: fileKey, size: buffer.length })
        } catch (e) {
          sendJSON(res, 500, { error: 'Failed to save file' })
        }
        return
      }

      if (req.method === 'DELETE') {
        const existed = fileStore.deleteFile(fileKey)
        sendJSON(res, existed ? 200 : 404, { ok: existed })
        return
      }
    }

    // ── JSON Database Routes (Collections API) ──
    if (req.method === 'GET' && parts[0] === 'collections') {
      sendJSON(res, 200, db.collections())
      return
    }

    if (parts.length === 0) {
      sendJSON(res, 200, { collections: db.collections() })
      return
    }

    const [collection, key] = parts

    if (req.method === 'GET' && !key) {
      sendJSON(res, 200, db.getAll(collection))
      return
    }

    if (req.method === 'GET' && key) {
      if (!db.has(collection, key)) {
        sendJSON(res, 404, { error: 'Not found' })
        return
      }
      sendJSON(res, 200, { value: db.get(collection, key) })
      return
    }

    if (req.method === 'POST' && key) {
      let body
      try {
        const rawBody = (await readBody(req)).toString('utf8')
        body = JSON.parse(rawBody)
      } catch {
        sendJSON(res, 400, { error: 'Invalid JSON body' })
        return
      }
      db.set(collection, key, body)
      sendJSON(res, 200, { ok: true })
      return
    }

    if (req.method === 'DELETE' && key) {
      const existed = db.delete(collection, key)
      sendJSON(res, existed ? 200 : 404, { ok: existed })
      return
    }

    if (req.method === 'DELETE' && !key) {
      db.clear(collection)
      sendJSON(res, 200, { ok: true })
      return
    }

    sendJSON(res, 405, { error: 'Method not allowed' })
  }

  const server = http.createServer((req, res) => {
    handler(req, res).catch((err) => {
      console.error('[@waelio/data] Server error:', err)
      try {
        sendJSON(res, 500, { error: 'Internal server error' })
      } catch (_) {}
    })
  })

  server.listen(port, host, () => {
    console.log(`[@waelio/data] Listening on http://${host}:${port}`)
  })

  return { server, db, fileStore, token }
}

export default createServer

// Allow running directly
if (
  require.main === module ||
  (typeof process !== 'undefined' &&
    process.argv[1] &&
    process.argv[1].endsWith('server.ts'))
) {
  const token = process.env.DB_TOKEN
  const port = parseInt(process.env.DB_PORT || '3714', 10)
  const host = process.env.DB_HOST || '127.0.0.1'
  const cors = process.env.DB_CORS || undefined
  const filePath = process.env.DB_FILE || undefined
  const encryptionKey = process.env.DB_ENCRYPTION_KEY || undefined
  const storageDir = process.env.DB_BLOBS_DIR || undefined

  createServer({
    token,
    port,
    host,
    cors,
    dbOptions: { filePath, encryptionKey },
    fileStoreOptions: { storageDir },
  })
}
