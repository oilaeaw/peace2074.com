// Minimal shim for Nuxt auto-imports (#imports) used in tests
// Re-export Vue primitives; stub Nuxt-specific composables
export { ref, reactive, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'

export function definePageMeta(_meta?: any) {
  // no-op for tests
}

export function useHead(_head?: any) {
  // no-op for tests
}

export async function useFetch(..._args: any[]) {
  // In tests, this should be mocked per-spec. Throw to surface missing mocks clearly.
  throw new Error('useFetch was called without a test mock. vi.mock("#imports", ...) in your test to provide it.')
}
