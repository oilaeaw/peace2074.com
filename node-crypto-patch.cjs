// Patch Node's native crypto module to include a `hash(alg, data, encoding?)` helper
// and ensure globalThis.crypto.hash exists. This runs early during Nuxt startup
// to support tools (vite/plugin-vue) that call crypto.hash on older Node versions.
try {
  const { Buffer } = require('node:buffer')
  // Minimal File/Blob polyfills for server-side tooling that expects DOM globals
  // Undici's web fetch implementation imports webidl which expects File/Blob.
  if (typeof globalThis.File === 'undefined') {
    // Simple polyfill - enough shape for libraries that only check existence/type
    globalThis.File = class File extends Uint8Array {
      constructor(bits = [], name = '', options = {}) {
        super(typeof bits === 'string' ? Buffer.from(bits) : (bits instanceof Uint8Array ? bits : Buffer.from(String(bits))))
        this.name = name
        this.lastModified = options.lastModified || Date.now()
        this.type = options.type || ''
      }

      text() { return Promise.resolve(Buffer.from(this).toString()) }
      arrayBuffer() { return Promise.resolve(this.buffer) }
    }
  }
  if (typeof globalThis.Blob === 'undefined') {
    globalThis.Blob = class Blob extends Uint8Array {
      constructor(parts = [], options = {}) {
        const data = parts.map(p => (typeof p === 'string' ? Buffer.from(p) : (p instanceof Uint8Array ? Buffer.from(p) : Buffer.from(String(p)))))
        const buf = Buffer.concat(data)
        super(buf)
        this.type = options.type || ''
        this.size = this.length
      }

      text() { return Promise.resolve(Buffer.from(this).toString()) }
      arrayBuffer() { return Promise.resolve(this.buffer) }
    }
  }
  if (typeof globalThis.FileReader === 'undefined') {
    globalThis.FileReader = class FileReader {
      readAsArrayBuffer(blob) { this.result = blob.buffer; this.onload && this.onload({ target: this }) }
      readAsText(blob) { this.result = Buffer.from(blob).toString(); this.onload && this.onload({ target: this }) }
    }
  }
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
