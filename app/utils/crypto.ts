/**
 * Crypto utility functions that work in both browser and Node.js environments.
 *
 * Uses Web Crypto (globalThis.crypto.subtle) when present, otherwise falls back
 * to Node.js `crypto.createHash` (dynamic import) in a server/Node environment.
 */

function toUint8Array(data: ArrayBuffer | Uint8Array | string): Uint8Array {
  if (typeof data === 'string')
    return new TextEncoder().encode(data)
  if (data instanceof Uint8Array)
    return data
  return new Uint8Array(data)
}

const WEB_ALG_MAP: Record<string, string> = {
  SHA256: 'SHA-256',
  SHA512: 'SHA-512',
  SHA1: 'SHA-1',
}

const NODE_ALG_MAP: Record<string, string> = {
  SHA256: 'sha256',
  SHA512: 'sha512',
  SHA1: 'sha1',
}

/**
 * Hash data using the specified algorithm.
 * @param alg e.g. 'SHA-256' | 'sha256' | 'SHA256'
 * @param data string | Uint8Array | ArrayBuffer
 * @returns hex string
 */
export async function hash(alg: string, data: ArrayBuffer | Uint8Array | string): Promise<string> {
  const bytes = toUint8Array(data)
  const normalized = (alg || 'SHA-256').toString().toUpperCase().replace(/[^A-Z0-9]/g, '')

  // Prefer Web Crypto if available
  if (globalThis.crypto && (globalThis.crypto as any).subtle) {
    const webAlg = WEB_ALG_MAP[normalized] || alg
    const digest = await (globalThis.crypto as any).subtle.digest(webAlg, bytes.buffer)
    const arr = Array.from(new Uint8Array(digest))
    return arr.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  // Fallback to Node's crypto (dynamic import) when running in Node-like environment.
  // Avoid referencing `process` directly to satisfy linters — detect by lack of `window` and lack of Web Crypto.
  const isProbablyNode = typeof window === 'undefined' && !(globalThis.crypto && (globalThis.crypto as any).subtle)
  if (isProbablyNode) {
    const nodeCrypto = await import('node:crypto')
    const nodeAlg = NODE_ALG_MAP[normalized] || 'sha256'
    return nodeCrypto.createHash(nodeAlg).update(bytes).digest('hex')
  }

  throw new Error('No suitable crypto implementation available')
}

// Provide a convenience helper
export async function hashData(data: string): Promise<string> {
  return hash('SHA-256', data)
}

// Backward compatibility shim: if some code expects `crypto.hash`, attach it.
try {
  if (typeof (globalThis as any).crypto === 'undefined')
    (globalThis as any).crypto = {}
  if (typeof (globalThis as any).crypto.hash !== 'function') {
    ;(globalThis as any).crypto.hash = async (alg: string, payload: any) => hash(alg, payload)
  }
}
catch {
  // ignore (defensive)
}
