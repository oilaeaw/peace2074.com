/**
 * Caching utilities and composables
 * 
 * Usage:
 * import { useCache, clearAllCaches, getCacheStats } from '@/caching'
 * import { createCachedFetch, clearApiCache } from '@/caching'
 */

// Composables
export { useCache, clearAllCaches, getCacheStats, registerCache } from '@/composables/useCache'

// API caching
export { createCachedFetch, clearApiCache, getApiCacheStats } from '@/utils/apiCache'
