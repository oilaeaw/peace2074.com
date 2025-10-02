import { Buffer } from 'node:buffer'
import nodeCrypto from 'node:crypto'

export default defineNitroPlugin(() => {
  // Ensure a global crypto object exists and provide a `hash` helper if missing.
  // Some libraries expect `crypto.hash(alg, data)` to exist (not standard in Node),
  // so we shim it using Node's crypto.
  const nodeWebCrypto = (nodeCrypto as any).webcrypto

  if (typeof globalThis.crypto === 'undefined') {
    // Prefer webcrypto if available, otherwise create a minimal object
    ;(globalThis as any).crypto = nodeWebCrypto || {}
  }

  if (typeof (globalThis as any).crypto.hash !== 'function') {
    ;(globalThis as any).crypto.hash = async (alg: string, data: ArrayBuffer | Uint8Array | string) => {
      // Normalize input to Buffer
      let buf: Buffer
      if (typeof data === 'string')
        buf = Buffer.from(data)
      else if (data instanceof ArrayBuffer)
        buf = Buffer.from(new Uint8Array(data))
      else if (data instanceof Uint8Array)
        buf = Buffer.from(data)
      else buf = Buffer.from(String(data))

      // Map some common algorithm names to node's expected names
      const algMap: Record<string, string> = {
        'SHA-256': 'sha256',
        'SHA256': 'sha256',
        'sha-256': 'sha256',
        'SHA-1': 'sha1',
        'SHA1': 'sha1',
        'MD5': 'md5',
      }
      const nodeAlg = (algMap as any)[alg] || String(alg).toLowerCase()

      const hash = nodeCrypto.createHash(nodeAlg).update(buf).digest()
      // Return an ArrayBuffer like Web Crypto would
      return hash.buffer.slice(hash.byteOffset, hash.byteOffset + hash.byteLength)
    }
  }
})
