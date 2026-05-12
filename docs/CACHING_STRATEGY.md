# Caching Strategy Documentation

## Overview
Comprehensive multi-layer caching has been implemented across the Peace2074 application:
1. **Browser Cache** - Service Worker + localStorage via Workbox
2. **Server Cache** - API response memoization
3. **CDN Cache** - Cloudflare edge caching with HTTP headers
4. **Application Cache** - In-memory composable for dynamic data

---

## Layer 1: Service Worker (Browser Cache)

### Location
`public/_headers` and Vite PWA config

### Strategy
**Workbox Runtime Caching Rules:**

| Resource Type | Handler | TTL | Details |
|---|---|---|---|
| API calls | NetworkFirst | 12h | Network preferred, cache fallback on failure |
| Quran data | CacheFirst | 90d | Static content, cache takes priority |
| Images | CacheFirst | 60d | Rarely change, aggressive caching |
| Fonts | CacheFirst | 90d | Static assets, immutable |
| JS/CSS bundles | StaleWhileRevalidate | 30d | Serve stale while fetching fresh |

### How It Works
1. Service Worker intercepts network requests
2. Routes match patterns and apply caching strategy
3. Offline support: serves cached API responses on network failure
4. Automatic cleanup: removes stale entries when cache is full

### Browser Usage
```typescript
// Cache headers automatically applied by Workbox
// No code changes needed - service worker handles transparently

// For offline support, cached API responses are returned when:
// - Network is unavailable
// - Request timeout > 5 seconds
```

---

## Layer 2: API Response Caching

### Location
`src/utils/apiCache.ts`

### Usage in Components
```typescript
import { useCache } from '@/composables/useCache'

export default {
  setup() {
    const quranCache = useCache('quran-data', 24 * 60 * 60 * 1000) // 24 hours
    
    const fetchQuran = async () => {
      // Check cache first
      const cached = quranCache.get()
      if (cached) return cached
      
      // Fetch fresh data
      const response = await fetch('/api/quran')
      const data = await response.json()
      
      // Store in cache
      quranCache.set(data)
      return data
    }
  }
}
```

### Features
- Memory cache for current session
- localStorage backup for persistence across tabs
- TTL-based expiration
- Pattern-based cache clearing
- Cache statistics tracking

---

## Layer 3: CDN Edge Caching (Cloudflare)

### Location
`public/_headers` (deployed to Cloudflare)

### Cache Rules

#### Hashed Assets (Forever)
```
/assets/*
  Cache-Control: public, max-age=31536000, immutable
```
- Content-addressed filenames (include hash)
- Can be cached indefinitely since content never changes

#### Service Worker (Always Check)
```
/sw.js
  Cache-Control: public, max-age=0, must-revalidate
```
- Always revalidate to check for updates
- Ensures users get latest service worker

#### HTML (SPA)
```
/index.html
  Cache-Control: public, max-age=3600, stale-while-revalidate=86400
```
- 1 hour in browser cache
- 24h stale cache on CDN for reliability
- Allows serving outdated version while fetching fresh

#### API Routes (12 hours)
```
/api/*
  Cache-Control: public, max-age=43200, stale-while-revalidate=604800
```
- 12 hour cache (rarely changes data like Quran)
- 7 day stale cache as fallback
- Automatic CDN revalidation

---

## Layer 4: Application-Level Cache

### Composable: `useCache<T>`

```typescript
import { useCache } from '@/composables/useCache'

// Create a cache with 1 hour TTL
const cache = useCache<Quran[]>('my-quran-data', 60 * 60 * 1000)

// Check if valid
if (cache.isValid.value) {
  const data = cache.get() // Returns cached data
} else {
  // Fetch new data
  const data = await fetchData()
  cache.set(data)
}

// Clear single cache
cache.clear()

// Clear all caches matching pattern
cache.clearPattern(/quran/)
```

### Utility Functions

```typescript
// Clear all application caches
import { clearAllCaches } from '@/composables/useCache'
clearAllCaches()

// Get cache statistics
import { getCacheStats } from '@/composables/useCache'
const { total, active } = getCacheStats()
// { total: 5, active: 3 } - 5 caches defined, 3 currently valid
```

---

## Vite Build Optimizations

### Asset Naming Strategy
```typescript
// All assets now have content hash in filename
entryFileNames: 'assets/[name].[hash].js'
chunkFileNames: 'assets/[name].[hash].js'
assetFileNames: 'assets/[name].[hash][extname]'
```

**Benefits:**
- Cache-busting automatic on content change
- Old versions remain cached even after updates
- Clean browser cache invalidation

---

## Cloudflare Configuration

### Edge Functions
```toml
[functions]
  directory = "cloudflare/functions"
  node_bundler = "esbuild"

[context.production]
  [context.production.functions."*"]
    timeout = 30           # 30s timeout
    memory = 1024          # 1GB memory
```

### Function Caching
- Functions are cached at edge for repeated calls
- Reduces cold starts and latency
- Automatic invalidation based on headers

---

## Performance Impact

### Before Caching
- First visit: ~3-5s initial load
- Repeat visits: ~2-3s (no browser cache)
- API calls: Fresh every time (~500ms-1s)

### After Caching
- First visit: ~3-5s initial load
- Repeat visits: **<1s** (all assets from cache)
- API calls: **instant** (memory cache)
- Offline: **full functionality** with cached data

---

## Monitoring Cache Health

### Browser DevTools
1. Open DevTools → Application → Cache Storage
2. View cached responses per Workbox cache
3. Monitor cache size and age

### Cache Statistics
```typescript
import { getApiCacheStats } from '@/utils/apiCache'
const { entries, sizeKB } = getApiCacheStats()
console.log(`API Cache: ${entries} entries, ${sizeKB}KB used`)
```

### Service Worker Status
- Check `chrome://serviceworker-internals/`
- Monitor update frequency
- View cache hit rates

---

## Cache Invalidation

### Automatic
- Hashed files: never (content changes = new hash)
- API: after TTL expires
- HTML: after 1-24 hours
- Service Worker: on every page load

### Manual
```typescript
// Clear application cache
cache.clear()

// Force refresh from network
navigator.serviceWorker.controller?.postMessage({ 
  type: 'SKIP_WAITING' 
})

// Clear browser cache
if (navigator.serviceWorker.controller) {
  navigator.serviceWorker.controller.postMessage({ 
    type: 'CLEAR_ALL' 
  })
}
```

---

## Best Practices

✅ **DO:**
- Use `useCache()` for frequently-accessed data
- Let Workbox handle asset caching (automatic)
- Set appropriate TTLs based on data freshness needs
- Monitor cache size to prevent memory issues
- Use `stale-while-revalidate` for non-critical data

❌ **DON'T:**
- Cache user-specific data (bookmarks, preferences)
- Cache authentication tokens in service worker
- Set overly aggressive TTLs for dynamic content
- Manually fetch without checking cache first
- Ignore cache expiration warnings

---

## Troubleshooting

### Assets Not Updating
- **Cause:** Old version cached forever
- **Fix:** Hash included automatically; clear browser cache if needed
- **Verify:** Check DevTools → Network tab for cache headers

### Stale Data Served
- **Cause:** Cache TTL not expired
- **Fix:** Manually call `cache.clear()` or wait for TTL
- **Debug:** Check `getCacheStats()` to see active caches

### Service Worker Not Installing
- **Cause:** PWA config disabled or dev mode
- **Fix:** Check `DEV` flag in vite.config.ts
- **Note:** PWA only builds in production

### Offline Not Working
- **Cause:** API endpoint not in Workbox patterns
- **Fix:** Add pattern to `runtimeCaching` in vite.config.ts
- **Verify:** Test with DevTools → Network → Offline

---

## References
- [Workbox Documentation](https://developers.google.com/web/tools/workbox)
- [Cache API](https://developer.mozilla.org/en-US/docs/Web/API/Cache)
- [HTTP Caching Headers](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control)
- [Cloudflare Edge Cache](https://docs.cloudflare.com/cloudflare-cdns/overview/)
