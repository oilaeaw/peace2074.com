import type { $Fetch } from 'ofetch'

interface CacheEntry {
  data: any
  timestamp: number
  ttl: number
}

/**
 * API response cache using memory + localStorage
 * Automatically handled by Workbox service worker in production
 */
const memoryCache = new Map<string, CacheEntry>()

/**
 * Wrap fetch requests with intelligent caching
 */
export function createCachedFetch($fetch: $Fetch<any>) {
  return async function cachedFetch(
    url: string,
    options?: any & { cache?: number } // TTL in milliseconds
  ) {
    const cacheKey = `${url}:${JSON.stringify(options?.params || {})}`
    const cacheTtl = options?.cache || 0

    // Check memory cache first
    if (cacheTtl > 0) {
      const cached = memoryCache.get(cacheKey)
      if (cached && Date.now() - cached.timestamp < cached.ttl) {
        console.debug(`[API Cache] Hit: ${url}`)
        return cached.data
      }
    }

    try {
      const data = await $fetch(url, options)

      // Store in cache if TTL specified
      if (cacheTtl > 0) {
        memoryCache.set(cacheKey, {
          data,
          timestamp: Date.now(),
          ttl: cacheTtl,
        })
        console.debug(`[API Cache] Stored: ${url} (TTL: ${cacheTtl}ms)`)
      }

      return data
    } catch (error) {
      // Return stale cache on network error
      const cached = memoryCache.get(cacheKey)
      if (cached) {
        console.warn(`[API Cache] Network error, returning stale data: ${url}`)
        return cached.data
      }
      throw error
    }
  }
}

/**
 * Clear API cache
 */
export function clearApiCache(pattern?: RegExp) {
  if (pattern) {
    let cleared = 0
    for (const [key] of memoryCache) {
      if (pattern.test(key)) {
        memoryCache.delete(key)
        cleared++
      }
    }
    console.debug(`[API Cache] Cleared ${cleared} entries matching ${pattern}`)
  } else {
    memoryCache.clear()
    console.debug('[API Cache] Cleared all entries')
  }
}

/**
 * Get cache statistics
 */
export function getApiCacheStats() {
  let totalSize = 0
  for (const [, entry] of memoryCache) {
    totalSize += JSON.stringify(entry.data).length
  }
  return {
    entries: memoryCache.size,
    sizeKB: Math.round(totalSize / 1024),
  }
}
