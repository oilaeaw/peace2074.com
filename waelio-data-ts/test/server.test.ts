import { test } from 'node:test'
import assert from 'node:assert'
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { createServer } from '../server'

const TEST_DB_FILE = path.join(__dirname, 'test-server-db.json')
const TEST_BLOBS_DIR = path.join(__dirname, 'test-server-blobs')
const TEST_PORT = 3999
const TEST_TOKEN = 'test-token-12345'

function cleanup() {
  if (fs.existsSync(TEST_DB_FILE)) {
    fs.unlinkSync(TEST_DB_FILE)
  }
  if (fs.existsSync(TEST_BLOBS_DIR)) {
    fs.rmSync(TEST_BLOBS_DIR, { recursive: true, force: true })
  }
}

test('HTTP Server API integration', async (t) => {
  cleanup()
  t.after(cleanup)

  const { server } = createServer({
    port: TEST_PORT,
    host: '127.0.0.1',
    token: TEST_TOKEN,
    dbOptions: { filePath: TEST_DB_FILE },
    fileStoreOptions: { storageDir: TEST_BLOBS_DIR },
  })

  // Wait for server close at end of tests
  t.after(() => {
    return new Promise<void>((resolve) => {
      server.close(() => resolve())
    })
  })

  const baseUrl = `http://127.0.0.1:${TEST_PORT}`
  const headers = {
    'Authorization': `Bearer ${TEST_TOKEN}`,
    'Content-Type': 'application/json',
  }

  // 1. Unauthorized check
  await t.test('unauthorized returns 401', async () => {
    const res = await fetch(`${baseUrl}/collections`, { method: 'GET' })
    assert.strictEqual(res.status, 401)
  })

  // 2. Set collection key
  await t.test('POST /collections/users/alice saves data', async () => {
    const payload = { role: 'admin', active: true }
    const res = await fetch(`${baseUrl}/users/alice`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    })
    assert.strictEqual(res.status, 200)
    const body = await res.json()
    assert.deepStrictEqual(body, { ok: true })
  })

  // 3. Get collection key
  await t.test('GET /collections/users/alice retrieves data', async () => {
    const res = await fetch(`${baseUrl}/users/alice`, {
      method: 'GET',
      headers,
    })
    assert.strictEqual(res.status, 200)
    const body = await res.json()
    assert.deepStrictEqual(body.value, { role: 'admin', active: true })
  })

  // 4. Get all collection docs
  await t.test('GET /collections/users retrieves whole collection', async () => {
    const res = await fetch(`${baseUrl}/users`, {
      method: 'GET',
      headers,
    })
    assert.strictEqual(res.status, 200)
    const body = await res.json()
    assert.deepStrictEqual(body, {
      alice: { role: 'admin', active: true },
    })
  })

  // 5. Save binary file
  await t.test('POST /files/recitations/sura1.mp3 saves binary file', async () => {
    const content = 'mock-mp3-binary-data'
    const res = await fetch(`${baseUrl}/files/recitations/sura1.mp3`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`,
        'Content-Type': 'application/octet-stream',
      },
      body: content,
    })
    assert.strictEqual(res.status, 200)
    const body = await res.json()
    assert.strictEqual(body.ok, true)
    assert.strictEqual(body.key, 'recitations/sura1.mp3')
    assert.strictEqual(body.size, content.length)
  })

  // 6. Retrieve binary file
  await t.test('GET /files/recitations/sura1.mp3 retrieves binary file', async () => {
    const res = await fetch(`${baseUrl}/files/recitations/sura1.mp3`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`,
      },
    })
    assert.strictEqual(res.status, 200)
    assert.strictEqual(res.headers.get('Content-Type'), 'audio/mpeg')
    const text = await res.text()
    assert.strictEqual(text, 'mock-mp3-binary-data')
  })
})
