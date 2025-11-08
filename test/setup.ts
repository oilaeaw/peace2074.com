// Ensure Node crypto/webcrypto shims are available for Vite/Vitest transforms
// This aligns with the project's dev-time crypto patch
import '../node-crypto-patch.cjs'

// Basic fetch polyfill guard for Node if missing (jsdom usually provides it)
if (typeof globalThis.fetch === 'undefined') {
   
  const { fetch, Headers, Request, Response } = require('undici')
  // @ts-ignore
  globalThis.fetch = fetch
  // @ts-ignore
  globalThis.Headers = Headers
  // @ts-ignore
  globalThis.Request = Request
  // @ts-ignore
  globalThis.Response = Response
}

// Provide a minimal URL.createObjectURL for tests using blobs/files
if (typeof URL.createObjectURL !== 'function') {
  // @ts-ignore
  URL.createObjectURL = () => 'blob://local-object-url'
}
