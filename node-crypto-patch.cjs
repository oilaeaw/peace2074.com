// Patch Node's native crypto module to include a `hash(alg, data, encoding?)` helper
// and ensure globalThis.crypto.hash exists. This runs early during Nuxt startup
// to support tools (vite/plugin-vue) that call crypto.hash on older Node versions.
try {
  const { Buffer } = require('node:buffer')
  const nativeCrypto = require('node:crypto')
  if (typeof nativeCrypto.hash !== 'function') {
    nativeCrypto.hash = (alg, data, encoding) => {
      let buf
      if (typeof data === 'string')
        buf = Buffer.from(data)
      else if (data instanceof ArrayBuffer)
        buf = Buffer.from(new Uint8Array(data))
      else if (data instanceof Uint8Array)
        buf = Buffer.from(data)
      else buf = Buffer.from(String(data))

      const algMap = {
        'SHA-256': 'sha256',
        'SHA256': 'sha256',
        'sha-256': 'sha256',
        'SHA-1': 'sha1',
        'SHA1': 'sha1',
        'MD5': 'md5',
      }
      const nodeAlg = algMap[alg] || String(alg).toLowerCase()
      const res = nativeCrypto.createHash(nodeAlg).update(buf).digest(encoding)
      return res
    }
  }

  // Ensure globalThis.crypto.hash (ArrayBuffer return style) exists for any code
  if (typeof globalThis.crypto === 'undefined') {
    globalThis.crypto = nativeCrypto.webcrypto || {}
  }
  if (typeof (globalThis.crypto).hash !== 'function') {
    ;(globalThis.crypto).hash = async (alg, data) => {
      // Return ArrayBuffer similar to Web Crypto
      let buf
      if (typeof data === 'string')
        buf = Buffer.from(data)
      else if (data instanceof ArrayBuffer)
        buf = Buffer.from(new Uint8Array(data))
      else if (data instanceof Uint8Array)
        buf = Buffer.from(data)
      else buf = Buffer.from(String(data))
      const algMap = {
        'SHA-256': 'sha256',
        'SHA256': 'sha256',
        'sha-256': 'sha256',
        'SHA-1': 'sha1',
        'SHA1': 'sha1',
        'MD5': 'md5',
      }
      const nodeAlg = algMap[alg] || String(alg).toLowerCase()
      const hash = nativeCrypto.createHash(nodeAlg).update(buf).digest()
      return hash.buffer.slice(hash.byteOffset, hash.byteOffset + hash.byteLength)
    }
  }
}
catch {
  // best-effort patch; ignore on failure
}
