import { defineEventHandler, getQuery } from 'h3'

interface CacheEntry {
  data: any
  expiresAt: number
}

const DEFAULT_CHANNEL_ID = 'UCKPAQJxnUTX-pzvLQ3M0aEQ'
const CACHE_TTL_MS = 15 * 60 * 1000 // 15 minutes
const memoryCache: Record<string, CacheEntry> = {}

function formatCompactNumber(numStr: string | number): string {
  const n = typeof numStr === 'number' ? numStr : parseInt(numStr, 10)
  if (isNaN(n)) return String(numStr)
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}K`
  return n.toLocaleString()
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const channelId = String(query.channelId || process.env.YOUTUBE_CHANNEL_ID || DEFAULT_CHANNEL_ID).trim()
  const bypassCache = query.refresh === 'true' || query.refresh === '1'
  const apiKey = process.env.YOUTUBE_API_KEY

  const cacheKey = `yt_channel_${channelId}`
  const now = Date.now()

  if (!bypassCache && memoryCache[cacheKey] && memoryCache[cacheKey].expiresAt > now) {
    return memoryCache[cacheKey].data
  }

  // 1. If YOUTUBE_API_KEY is available, query official YouTube Data API v3 channels endpoint
  if (apiKey) {
    try {
      const apiRes = await fetch(
        `https://www.googleapis.com/youtube/v3/channels?key=${apiKey}&id=${channelId}&part=snippet,statistics,contentDetails`
      )
      if (apiRes.ok) {
        const json = await apiRes.json()
        const item = json.items?.[0]
        if (item) {
          const rawSubs = item.statistics?.subscriberCount || '0'
          const rawViews = item.statistics?.viewCount || '0'
          const rawVideos = item.statistics?.videoCount || '0'

          const result = {
            ok: true,
            source: 'youtube-api-v3',
            channel: {
              id: item.id,
              title: item.snippet?.title || 'Peace2074',
              description: item.snippet?.description || '',
              customUrl: item.snippet?.customUrl || '@Peace2074',
              publishedAt: item.snippet?.publishedAt,
              thumbnails: item.snippet?.thumbnails,
              rawSubscriberCount: rawSubs,
              subscriberCountFormatted: `${formatCompactNumber(rawSubs)} Subscribers`,
              rawViewCount: rawViews,
              viewCountFormatted: `${formatCompactNumber(rawViews)} Views`,
              rawVideoCount: rawVideos,
              videoCountFormatted: `${formatCompactNumber(rawVideos)} Videos`,
              uploadsPlaylistId: item.contentDetails?.relatedPlaylists?.uploads || `UU${channelId.slice(2)}`,
              url: `https://www.youtube.com/channel/${channelId}`,
              subscribeUrl: `https://www.youtube.com/channel/${channelId}?sub_confirmation=1`,
            },
          }
          memoryCache[cacheKey] = { data: result, expiresAt: now + CACHE_TTL_MS }
          return result
        }
      }
    } catch (err) {
      console.warn('[YouTube Channel API] Fetch error, using fallback:', err)
    }
  }

  // 2. Fallback / Free Mode: Fetch Public RSS Feed
  try {
    const rssRes = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Peace2074Bot/1.0)' },
    })

    let channelTitle = 'Peace2074'
    let videoCount = 0

    if (rssRes.ok) {
      const xml = await rssRes.text()
      const titleMatch = xml.match(/<title>([^<]+)<\/title>/)
      if (titleMatch && titleMatch[1]) channelTitle = titleMatch[1]
      const entries = xml.match(/<entry>/g)
      videoCount = entries ? entries.length : 0
    }

    const result = {
      ok: true,
      source: 'youtube-rss-fallback',
      channel: {
        id: channelId,
        title: channelTitle,
        description: 'Join our YouTube community for updates, reflections, Quran insights, and more from the PEACE2074 team.',
        customUrl: '@Peace2074',
        rawSubscriberCount: null,
        subscriberCountFormatted: 'Official Channel',
        rawVideoCount: videoCount,
        videoCountFormatted: videoCount ? `${videoCount}+ Recent Videos` : 'Active Channel',
        uploadsPlaylistId: `UU${channelId.slice(2)}`,
        url: `https://www.youtube.com/channel/${channelId}`,
        subscribeUrl: `https://www.youtube.com/channel/${channelId}?sub_confirmation=1`,
      },
    }

    memoryCache[cacheKey] = { data: result, expiresAt: now + CACHE_TTL_MS }
    return result
  } catch (err: any) {
    return {
      ok: false,
      error: err?.message || 'Failed to fetch channel details',
      channelId,
    }
  }
})
