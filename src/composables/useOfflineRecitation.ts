/**
 * Offline Quran Recitation Manager
 * Handles downloading and caching audio files for offline playback
 * with quality options (Regular 32kbps vs HiQ 128kbps)
 */

import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'

interface DownloadProgress {
  suraId: number
  current: number
  total: number
  status: 'pending' | 'downloading' | 'complete' | 'error'
  bytesDownloaded?: number
  totalBytes?: number
}

export type RecitationQuality = 'regular' | 'hiq'

interface RecitationQualityInfo {
  bitrate: string
  estimatedSizePerSura: string
  estimatedSizeFullQuran: string
  description: string
}

const QUALITY_INFO: Record<RecitationQuality, RecitationQualityInfo> = {
  regular: {
    bitrate: '32kbps',
    estimatedSizePerSura: '~1.5MB',
    estimatedSizeFullQuran: '~180MB',
    description: 'Good quality, smaller file size',
  },
  hiq: {
    bitrate: '128kbps',
    estimatedSizePerSura: '~6MB',
    estimatedSizeFullQuran: '~720MB',
    description: 'High quality, larger file size',
  },
}

// Cache names
const CACHE_NAME_PREFIX = 'quran-audio-offline'
const getCacheName = (quality: RecitationQuality) =>
  `${CACHE_NAME_PREFIX}-${quality}-v1`

export function useOfflineRecitation() {
  const $q = useQuasar()

  const selectedQuality = ref<RecitationQuality>('regular')
  const downloadProgress = ref<Map<number, DownloadProgress>>(new Map())
  const isDownloading = ref(false)
  const downloadedSuras = ref<Set<number>>(new Set())

  /**
   * Check if a sura is cached offline
   */
  async function isSuraCached(
    suraId: number,
    quality: RecitationQuality
  ): Promise<boolean> {
    if (!('caches' in window)) return false

    try {
      const cache = await caches.open(getCacheName(quality))
      const keys = await cache.keys()
      const suraKey = `sura-${suraId}-`
      return keys.some((req) => req.url.includes(suraKey))
    } catch {
      return false
    }
  }

  /**
   * Get cached audio URL for a specific verse
   */
  async function getCachedAudioUrl(
    suraId: number,
    verseNumber: number,
    quality: RecitationQuality
  ): Promise<string | null> {
    if (!('caches' in window)) return null

    try {
      const cache = await caches.open(getCacheName(quality))
      const cacheKey = buildCacheKey(suraId, verseNumber, quality)
      const response = await cache.match(cacheKey)
      if (response) {
        const blob = await response.blob()
        return URL.createObjectURL(blob)
      }
    } catch (err) {
      console.error('[Offline Audio] Cache read error:', err)
    }
    return null
  }

  /**
   * Build cache key for audio file
   */
  function buildCacheKey(
    suraId: number,
    verseNumber: number,
    quality: RecitationQuality
  ): string {
    // Using everyayah.com convention for offline storage
    // Format: https://everyayah.com/data/Alafasy_128kbps/001001.mp3
    const reciter = quality === 'hiq' ? 'Alafasy_128kbps' : 'Alafasy_64kbps'
    const paddedSura = String(suraId).padStart(3, '0')
    const paddedVerse = String(verseNumber).padStart(3, '0')
    return `https://everyayah.com/data/${reciter}/${paddedSura}${paddedVerse}.mp3`
  }

  /**
   * Download a single sura for offline use
   */
  async function downloadSura(
    suraId: number,
    totalVerses: number
  ): Promise<boolean> {
    if (!('caches' in window)) {
      $q.notify({
        type: 'negative',
        message: 'Offline storage not supported in this browser',
        position: 'top',
      })
      return false
    }

    try {
      const cache = await caches.open(getCacheName(selectedQuality.value))
      const quality = selectedQuality.value

      // Initialize progress tracking
      downloadProgress.value.set(suraId, {
        suraId,
        current: 0,
        total: totalVerses,
        status: 'downloading',
        bytesDownloaded: 0,
        totalBytes: 0,
      })

      let successCount = 0
      let failCount = 0

      // Download verses in batches to avoid overwhelming the network
      const BATCH_SIZE = 5
      for (let i = 1; i <= totalVerses; i += BATCH_SIZE) {
        const batch = []
        const endVerse = Math.min(i + BATCH_SIZE - 1, totalVerses)

        for (let verse = i; verse <= endVerse; verse++) {
          const url = buildCacheKey(suraId, verse, quality)
          batch.push(
            fetch(url)
              .then(async (response) => {
                if (!response.ok) throw new Error(`HTTP ${response.status}`)
                await cache.put(url, response.clone())
                successCount++

                // Update progress
                const progress = downloadProgress.value.get(suraId)
                if (progress) {
                  progress.current = successCount
                  downloadProgress.value.set(suraId, { ...progress })
                }
                return true
              })
              .catch((err) => {
                console.error(
                  `[Offline Audio] Failed to download verse ${verse}:`,
                  err
                )
                failCount++
                return false
              })
          )
        }

        await Promise.all(batch)

        // Small delay between batches
        if (endVerse < totalVerses) {
          await new Promise((resolve) => setTimeout(resolve, 100))
        }
      }

      // Mark as complete
      const finalProgress = downloadProgress.value.get(suraId)
      if (finalProgress) {
        finalProgress.status = failCount === 0 ? 'complete' : 'error'
        downloadProgress.value.set(suraId, { ...finalProgress })
      }

      if (failCount === 0) {
        downloadedSuras.value.add(suraId)
        return true
      } else {
        console.warn(
          `[Offline Audio] Sura ${suraId}: ${successCount} succeeded, ${failCount} failed`
        )
        return false
      }
    } catch (err) {
      console.error('[Offline Audio] Download error:', err)
      const progress = downloadProgress.value.get(suraId)
      if (progress) {
        progress.status = 'error'
        downloadProgress.value.set(suraId, { ...progress })
      }
      return false
    }
  }

  /**
   * Delete cached sura
   */
  async function deleteSura(
    suraId: number,
    quality: RecitationQuality
  ): Promise<boolean> {
    if (!('caches' in window)) return false

    try {
      const cache = await caches.open(getCacheName(quality))
      const keys = await cache.keys()
      const suraKey = `sura-${suraId}-`

      for (const request of keys) {
        if (request.url.includes(suraKey)) {
          await cache.delete(request)
        }
      }

      downloadedSuras.value.delete(suraId)
      downloadProgress.value.delete(suraId)
      return true
    } catch (err) {
      console.error('[Offline Audio] Delete error:', err)
      return false
    }
  }

  /**
   * Clear all cached audio
   */
  async function clearAllCache(): Promise<boolean> {
    if (!('caches' in window)) return false

    try {
      await Promise.all([
        caches.delete(getCacheName('regular')),
        caches.delete(getCacheName('hiq')),
      ])
      downloadedSuras.value.clear()
      downloadProgress.value.clear()
      return true
    } catch (err) {
      console.error('[Offline Audio] Clear cache error:', err)
      return false
    }
  }

  /**
   * Get total cache size
   */
  async function getCacheSize(): Promise<number> {
    if (!('caches' in window)) return 0

    try {
      let totalSize = 0
      for (const quality of ['regular', 'hiq'] as RecitationQuality[]) {
        const cache = await caches.open(getCacheName(quality))
        const keys = await cache.keys()

        for (const request of keys) {
          const response = await cache.match(request)
          if (response) {
            const blob = await response.blob()
            totalSize += blob.size
          }
        }
      }
      return totalSize
    } catch {
      return 0
    }
  }

  /**
   * Load cached suras list on initialization
   */
  async function loadCachedSurasList(): Promise<void> {
    if (!('caches' in window)) return

    try {
      const cache = await caches.open(getCacheName(selectedQuality.value))
      const keys = await cache.keys()

      // Extract unique sura IDs from cache keys
      const suraIds = new Set<number>()
      keys.forEach((req) => {
        const match = req.url.match(/\/(\d{3})\d{3}\.mp3/)
        if (match) {
          suraIds.add(parseInt(match[1], 10))
        }
      })

      downloadedSuras.value = suraIds
    } catch (err) {
      console.error('[Offline Audio] Load cached suras error:', err)
    }
  }

  // Computed properties
  const qualityInfo = computed(() => QUALITY_INFO[selectedQuality.value])

  const totalDownloadedSuras = computed(() => downloadedSuras.value.size)

  const isAnySuraDownloading = computed(() => {
    return Array.from(downloadProgress.value.values()).some(
      (p) => p.status === 'downloading'
    )
  })

  return {
    // State
    selectedQuality,
    downloadProgress,
    isDownloading,
    downloadedSuras,

    // Methods
    isSuraCached,
    getCachedAudioUrl,
    downloadSura,
    deleteSura,
    clearAllCache,
    getCacheSize,
    loadCachedSurasList,

    // Computed
    qualityInfo,
    totalDownloadedSuras,
    isAnySuraDownloading,
    QUALITY_INFO,
  }
}
