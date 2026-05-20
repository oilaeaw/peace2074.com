import { test } from 'node:test'
import assert from 'node:assert'
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { Database } from '../Database'
import { FileStore } from '../FileStore'

const TEST_DB_FILE = path.join(__dirname, 'test-db.json')
const TEST_BLOBS_DIR = path.join(__dirname, 'test-blobs')

// Clean up helper
function cleanup() {
  if (fs.existsSync(TEST_DB_FILE)) {
    fs.unlinkSync(TEST_DB_FILE)
  }
  if (fs.existsSync(TEST_BLOBS_DIR)) {
    fs.rmSync(TEST_BLOBS_DIR, { recursive: true, force: true })
  }
}

test('Database - Basic Operations', (t) => {
  cleanup()
  t.after(cleanup)

  const db = new Database({ filePath: TEST_DB_FILE })

  // Test set/get
  db.set('users', 'user1', { name: 'Alice' })
  assert.deepStrictEqual(db.get('users', 'user1'), { name: 'Alice' })

  // Test has
  assert.strictEqual(db.has('users', 'user1'), true)
  assert.strictEqual(db.has('users', 'user2'), false)

  // Test getAll
  assert.deepStrictEqual(db.getAll('users'), { user1: { name: 'Alice' } })

  // Test collections
  assert.deepStrictEqual(db.collections(), ['users'])

  // Test delete
  const deleted = db.delete('users', 'user1')
  assert.strictEqual(deleted, true)
  assert.strictEqual(db.has('users', 'user1'), false)

  // Test clear
  db.set('users', 'user2', { name: 'Bob' })
  db.clear('users')
  assert.deepStrictEqual(db.getAll('users'), {})
})

test('Database - Encryption', (t) => {
  cleanup()
  t.after(cleanup)

  // Generate 32 bytes hex key (64 hex characters)
  const encryptionKey = crypto.randomBytes(32).toString('hex')
  const db = new Database({ filePath: TEST_DB_FILE, encryptionKey })

  db.set('secrets', 'token', { value: 'super-secret' })
  assert.deepStrictEqual(db.get('secrets', 'token'), { value: 'super-secret' })

  // Verify file content is encrypted (should not contain plaintext 'super-secret')
  const fileContent = fs.readFileSync(TEST_DB_FILE, 'utf8')
  assert.strictEqual(fileContent.includes('super-secret'), false)

  // Verify loading encrypted file
  const db2 = new Database({ filePath: TEST_DB_FILE, encryptionKey })
  assert.deepStrictEqual(db2.get('secrets', 'token'), { value: 'super-secret' })
})

test('FileStore Operations', async (t) => {
  cleanup()
  t.after(cleanup)

  const fileStore = new FileStore({ storageDir: TEST_BLOBS_DIR })
  const testBuffer = Buffer.from('Hello, offline recitation!', 'utf8')
  const fileKey = 'recitations/sura_001.mp3'

  // Test saveFile and hasFile
  fileStore.saveFile(fileKey, testBuffer)
  assert.strictEqual(fileStore.hasFile(fileKey), true)

  // Test getFileSize
  assert.strictEqual(fileStore.getFileSize(fileKey), testBuffer.length)

  // Test getFileStream
  const stream = fileStore.getFileStream(fileKey)
  assert.ok(stream)
  
  await new Promise<void>((resolve, reject) => {
    const chunks: any[] = []
    stream.on('data', (chunk) => chunks.push(chunk))
    stream.on('end', () => {
      const content = Buffer.concat(chunks).toString('utf8')
      assert.strictEqual(content, 'Hello, offline recitation!')
      resolve()
    })
    stream.on('error', reject)
  })

  // Test deleteFile
  const deleted = fileStore.deleteFile(fileKey)
  assert.strictEqual(deleted, true)
  assert.strictEqual(fileStore.hasFile(fileKey), false)
})
