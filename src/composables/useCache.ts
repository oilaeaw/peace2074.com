import { computed, shallowRef } from 'vue'

interface CacheItem<T> {
  data: T
  timestamp: number
  ttl?: number
}

/**
 * Browser-based caching for API responses and computed data
 * Supports both memory cache and localStorage for persistence
 */
export function useCache<T = any>(
  key: string,
  ttl: number = 60 * 60 * 1000 // Default 1 hour in ms
) {
  const cache = shallowRef<CacheItem<T> | null>(null)
  const isValid = computed(() => {
    if (!cache.value) return false
    if (!cache.value.ttl) return true
    return Date.now() - cache.value.timestamp < cache.value.ttl
  })

  /**
   * Get cached value
   */
  const get = (): T | null => {
    if (isValid.value && cache.value) {
      console.debug(`[Cache] Hit: ${key}`)
      return cache.value.data
    }
    // Try localStorage as fallback
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(`cache:${key}`)
        if (stored) {
          const item = JSON.parse(stored) as CacheItem<T>
          if (item.ttl && Date.now() - item.timestamp < item.ttl) {
            cache.value = item
            console.debug(`[Cache] Restored from localStorage: ${key}`)
            return item.data
          }
        }
      } catch (e) {
        console.warn(`[Cache] Failed to restore ${key}`, e)
      }
    }
    console.debug(`[Cache] Miss: ${key}`)
    return null
  }

  /**
   * Set cached value
   */
  const set = (data: T, customTtl?: number) => {
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl: customTtl || ttl,
    }
    cache.value = item

    // Also persist to localStorage for offline support
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(`cache:${key}`, JSON.stringify(item))
        console.debug(`[Cache] Saved to localStorage: ${key}`)
      } catch (e) {
        console.warn(`[Cache] Failed to save ${key}`, e)
      }
    }
  }

  /**
   * Clear cache
   */
  const clear = () => {
    cache.value = null
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(`cache:${key}`)
        console.debug(`[Cache] Cleared: ${key}`)
      } catch (e) {
        console.warn(`[Cache] Failed to clear ${key}`, e)
      }
    }
  }

  /**
   * Clear all caches matching pattern
   */
  const clearPattern = (pattern: RegExp) => {
    if (typeof window !== 'undefined') {
      try {
        const keys = Object.keys(localStorage)
        keys.forEach(k => {
          if (k.startsWith('cache:') && pattern.test(k)) {
            localStorage.removeItem(k)
          }
        })
        console.debug(`[Cache] Cleared pattern: ${pattern}`)
      } catch (e) {
        console.warn(`[Cache] Failed to clear pattern`, e)
      }
    }
  }

  return {
    get,
    set,
    clear,
    clearPattern,
    isValid,
  }
}

/**
 * Cache all instances for quick cleanup
 */
const allCaches = new Map<string, ReturnType<typeof useCache>>()

export function registerCache(key: string, cache: ReturnType<typeof useCache>) {
  allCaches.set(key, cache)
}

export function clearAllCaches() {
  console.debug('[Cache] Clearing all caches')
  allCaches.forEach(cache => cache.clear())
}

export function getCacheStats() {
  let totalCached = 0
  allCaches.forEach(cache => {
    if (cache.isValid.value) totalCached++
  })
  return {
    total: allCaches.size,
    active: totalCached,
  }
}
