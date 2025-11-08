// Lightweight crypto shim providing crypto.hash for Vite plugin-vue during Vitest
import * as nodeCrypto from 'node:crypto'
import { Buffer } from 'node:buffer'

// Provide a stable object export with hash function
function normalizeBuffer(data: any): Buffer {
  if (typeof data === 'string') return Buffer.from(data)
  if (data instanceof ArrayBuffer) return Buffer.from(new Uint8Array(data))
  if (data instanceof Uint8Array) return Buffer.from(data)
  return Buffer.from(String(data))
}

const algMap: Record<string, string> = {
  'SHA-256': 'sha256', SHA256: 'sha256', 'sha-256': 'sha256',
  'SHA-1': 'sha1', SHA1: 'sha1', MD5: 'md5',
  'SHA512': 'sha512', 'SHA-512': 'sha512',
}

function hash(alg: string, data: any, encoding?: any) {
  const buf = normalizeBuffer(data)
  const nodeAlg = algMap[alg] || String(alg).toLowerCase()
  return nodeCrypto.createHash(nodeAlg).update(buf).digest(encoding)
}

async function webHash(alg: string, data: any) {
  const buf = normalizeBuffer(data)
  const nodeAlg = algMap[alg] || String(alg).toLowerCase()
  const digest = nodeCrypto.createHash(nodeAlg).update(buf).digest()
  return digest.buffer.slice(digest.byteOffset, digest.byteOffset + digest.byteLength)
}

// Ensure globalThis.crypto exists (jsdom may provide webcrypto without hash)
if (typeof globalThis.crypto === 'undefined') {
  ;(globalThis as any).crypto = {}
}
if (typeof (globalThis.crypto as any).hash !== 'function') {
  ;(globalThis.crypto as any).hash = webHash
}

// Export a fresh object (not frozen) that mimics crypto plus hash
const cryptoShim: any = { ...nodeCrypto, hash }

export { hash, cryptoShim }
export default cryptoShim
