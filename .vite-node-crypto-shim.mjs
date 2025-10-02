import { Buffer } from 'node:buffer'
import * as nativeCrypto from 'node:crypto'

// Provide a compatible `hash(alg, data, encoding?)` helper like newer Node versions
function hash(alg, data, encoding) {
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
  if (encoding)
    return nativeCrypto.createHash(nodeAlg).update(buf).digest(encoding)
  return nativeCrypto.createHash(nodeAlg).update(buf).digest()
}

// Re-export the most common properties and also attach hash if missing
const exports = { ...nativeCrypto }
if (!exports.hash)
  exports.hash = hash
export default exports
export { hash }
