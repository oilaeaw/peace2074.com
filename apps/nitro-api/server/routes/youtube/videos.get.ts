import { defineEventHandler, getQuery } from 'h3'

interface VideoItem {
  id: string
  title: string
  url: string
  embedUrl: string
  published: string
  thumbnail: string
  description: string
}

interface CacheEntry {
  data: any
  expiresAt: number
}

const DEFAULT_CHANNEL_ID = 'UCKPAQJxnUTX-pzvLQ3M0aEQ'
const CACHE_TTL_MS = 15 * 60 * 1000 // 15 minutes
const memoryCache: Record<string, CacheEntry> = {}

function parseRssFeed(xmlText: string) {
  const videos: VideoItem[] = []

  // Extract channel info
  const channelTitleMatch = xmlText.match(/<title>([^<]+)<\/title>/)
  const channelTitle = channelTitleMatch ? channelTitleMatch[1] : 'Peace2074'

  // Match each <entry> block
  const entryRegex = /<entry>([\s\S]*?)<\/entry>/g
  let match: RegExpExecArray | null

  while ((match = entryRegex.exec(xmlText)) !== null) {
    const entryXml = match[1]

    const idMatch = entryXml.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)
    const titleMatch = entryXml.match(/<title>([^<]+)<\/title>/)
    const publishedMatch = entryXml.match(/<published>([^<]+)<\/published>/)
    const thumbnailMatch = entryXml.match(/<media:thumbnail\s+url="([^"]+)"/)
    const descMatch = entryXml.match(/<media:description>([\s\S]*?)<\/media:description>/)

    if (idMatch && idMatch[1]) {
      const videoId = idMatch[1].trim()
      const rawTitle = titleMatch ? titleMatch[1] : ''
      const title = rawTitle.replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1').trim()
      const published = publishedMatch ? publishedMatch[1].trim() : ''
      const thumbnail = thumbnailMatch ? thumbnailMatch[1].trim() : `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
      const rawDesc = descMatch ? descMatch[1] : ''
      const description = rawDesc.replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1').trim()

      videos.push({
        id: videoId,
        title,
        url: `https://www.youtube.com/watch?v=${videoId}`,
        embedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`,
        published,
        thumbnail,
        description,
      })
    }
  }

  return { channelTitle, videos }
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const channelId = String(query.channelId || process.env.YOUTUBE_CHANNEL_ID || DEFAULT_CHANNEL_ID).trim()
  const apiKey = process.env.YOUTUBE_API_KEY

  const cacheKey = `yt_${channelId}_${apiKey ? 'api' : 'rss'}`
  const now = Date.now()

  if (memoryCache[cacheKey] && memoryCache[cacheKey].expiresAt > now) {
    return memoryCache[cacheKey].data
  }

  // If YOUTUBE_API_KEY is available, use YouTube Data API v3
  if (apiKey) {
    try {
      const apiRes = await fetch(
        `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&channelId=${channelId}&part=snippet,id&order=date&maxResults=12&type=video`
      )
      if (apiRes.ok) {
        const json = await apiRes.json()
        const videos: VideoItem[] = (json.items || [])
          .map((item: any) => ({
            id: item.id?.videoId,
            title: item.snippet?.title || '',
            url: `https://www.youtube.com/watch?v=${item.id?.videoId}`,
            embedUrl: `https://www.youtube.com/embed/${item.id?.videoId}?autoplay=1&rel=0`,
            published: item.snippet?.publishedAt || '',
            thumbnail:
              item.snippet?.thumbnails?.high?.url ||
              item.snippet?.thumbnails?.medium?.url ||
              `https://i.ytimg.com/vi/${item.id?.videoId}/hqdefault.jpg`,
            description: item.snippet?.description || '',
          }))
          .filter((v: VideoItem) => Boolean(v.id))

        const result = {
          ok: true,
          source: 'youtube-api-v3',
          channelId,
          channelTitle: 'Peace2074',
          channelUrl: `https://www.youtube.com/channel/${channelId}`,
          uploadsPlaylistId: `UU${channelId.slice(2)}`,
          videos,
        }

        memoryCache[cacheKey] = { data: result, expiresAt: now + CACHE_TTL_MS }
        return result
      }
    } catch (err) {
      console.warn('[YouTube API] Fetch error, falling back to RSS:', err)
    }
  }

  // Fallback / Default: Public YouTube RSS Feed (No API key needed)
  try {
    const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`
    const res = await fetch(rssUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Peace2074Bot/1.0)',
      },
    })

    if (!res.ok) {
      return {
        ok: false,
        error: `Failed to fetch YouTube RSS feed (${res.status})`,
        channelId,
        videos: [],
      }
    }

    const xmlText = await res.text()
    const { channelTitle, videos } = parseRssFeed(xmlText)

    const result = {
      ok: true,
      source: 'youtube-rss',
      channelId,
      channelTitle: channelTitle || 'Peace2074',
      channelUrl: `https://www.youtube.com/channel/${channelId}`,
      uploadsPlaylistId: `UU${channelId.slice(2)}`,
      videos,
    }

    memoryCache[cacheKey] = { data: result, expiresAt: now + CACHE_TTL_MS }
    return result
  } catch (err: any) {
    console.error('[YouTube RSS] Error:', err)
    return {
      ok: false,
      error: err?.message || 'Failed to fetch YouTube feed',
      channelId,
      videos: [],
    }
  }
})
