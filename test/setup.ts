// Ensure Node crypto/webcrypto shims are available for Vite/Vitest transforms
// This aligns with the project's dev-time crypto patch
import '../node-crypto-patch.cjs'
import { vi } from 'vitest'
import { ref, computed, reactive } from 'vue'

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

// Make Vue reactivity APIs globally available
globalThis.ref = ref
globalThis.computed = computed
globalThis.reactive = reactive

// Mock Nuxt composables
globalThis.definePageMeta = vi.fn()
globalThis.useQuasar = vi.fn(() => ({
  notify: vi.fn(),
  dark: { set: vi.fn(), toggle: vi.fn(), isActive: false },
  platform: { is: {} },
}))
globalThis.navigateTo = vi.fn()
globalThis.useRouter = vi.fn(() => ({
  push: vi.fn(),
  replace: vi.fn(),
  currentRoute: ref({ query: {} }),
}))
globalThis.useRoute = vi.fn(() => ({
  query: {},
  params: {},
  path: '/',
}))
globalThis.useRuntimeConfig = vi.fn(() => ({
  public: {},
}))
