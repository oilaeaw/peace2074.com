import { defineEventHandler, readBody, getHeader } from 'h3'
import { requireAuth } from '../../utils/auth'

interface UpdateBrandingPayload {
  accessToken?: string
  channelId?: string
  title?: string
  description?: string
  keywords?: string[] | string
  country?: string
}

const DEFAULT_CHANNEL_ID = 'UCKPAQJxnUTX-pzvLQ3M0aEQ'

/**
 * POST /api/youtube/update-branding
 * Updates Channel Title, Description, and Keywords on YouTube.com via YouTube Data API v3
 * Requires OAuth2 access token with `https://www.googleapis.com/auth/youtube` scope.
 */
export default defineEventHandler(async (event) => {
  try {
    const rawBody = await readBody(event).catch(() => ({}))
    const body: UpdateBrandingPayload = rawBody || {}
    
    // Authorization token from header or body or env
    const authHeader = getHeader(event, 'authorization') || ''
    const bearerToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : ''
    const token = body.accessToken || bearerToken || process.env.YOUTUBE_OAUTH_TOKEN

    if (!token) {
      return {
        ok: false,
        error: 'OAuth2 access_token is required to update YouTube channel branding. Pass token in Authorization header, body.accessToken, or set YOUTUBE_OAUTH_TOKEN in environment.',
        helpUrl: 'https://developers.google.com/youtube/v3/docs/channels/update',
      }
    }

    const channelId = (body.channelId || process.env.YOUTUBE_CHANNEL_ID || DEFAULT_CHANNEL_ID).trim()
    const title = body.title || 'Peace2074'
    const description = body.description || 'Peace2074 — Holy Quran recitations, reflections, community updates, and spiritual insights for Muslims worldwide.'
    
    let keywordsStr = 'Quran, Peace2074, Quran Recitation, Holy Quran, Surah, Islam, Peace, Dhikr, Tasbeeh'
    if (body.keywords) {
      keywordsStr = Array.isArray(body.keywords) ? body.keywords.join(', ') : body.keywords
    }
    const country = body.country || 'US'

    // Call YouTube Data API v3 channels.update
    const response = await fetch(
      'https://www.googleapis.com/youtube/v3/channels?part=snippet,brandingSettings',
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          id: channelId,
          snippet: {
            title,
            description,
          },
          brandingSettings: {
            channel: {
              title,
              description,
              keywords: keywordsStr,
              country,
              defaultTab: 'Featured',
            },
          },
        }),
      }
    )

    if (!response.ok) {
      const errText = await response.text()
      console.error('[YouTube Update Branding] API Error:', errText)
      return {
        ok: false,
        status: response.status,
        error: `YouTube API returned status ${response.status}`,
        details: errText,
      }
    }

    const data = await response.json()

    return {
      ok: true,
      message: `Successfully updated YouTube channel branding for ${title} (${channelId})`,
      channelId,
      title,
      description,
      keywords: keywordsStr,
      data,
    }
  } catch (err: any) {
    console.error('[YouTube Update Branding] Error:', err)
    return {
      ok: false,
      error: err?.message || 'Failed to update YouTube channel branding',
    }
  }
})
