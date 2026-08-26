import { defineEventHandler, readBody, getHeader } from 'h3'
import { getCollection } from '../../utils/kv-db'

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
 * Updates and synchronizes Peace2074 YouTube Channel Branding & Profile.
 * Automatically saves to local DB / app configuration, and if an OAuth2 token is provided,
 * syncs directly with Google YouTube Data API v3.
 */
export default defineEventHandler(async (event) => {
  try {
    const rawBody = await readBody(event).catch(() => ({}))
    const body: UpdateBrandingPayload = rawBody || {}
    
    // Authorization token from header or body or env
    const authHeader = getHeader(event, 'authorization') || ''
    const bearerToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : ''
    const token = body.accessToken || bearerToken || process.env.YOUTUBE_OAUTH_TOKEN

    const channelId = (body.channelId || process.env.YOUTUBE_CHANNEL_ID || DEFAULT_CHANNEL_ID).trim()
    const title = body.title || 'Peace2074'
    const description = body.description || 'Peace2074 — Holy Quran recitations, reflections, community updates, and spiritual insights for Muslims worldwide.'
    
    let keywordsStr = 'Quran, Peace2074, Quran Recitation, Holy Quran, Surah, Islam, Peace, Dhikr, Tasbeeh'
    if (body.keywords) {
      keywordsStr = Array.isArray(body.keywords) ? body.keywords.join(', ') : body.keywords
    }
    const country = body.country || 'US'

    // 1. Save branding profile to app database (KV store)
    const Settings = await getCollection('app_settings')
    await Settings.updateOne(
      { key: `yt_branding_${channelId}` },
      {
        $set: {
          key: `yt_branding_${channelId}`,
          channelId,
          title,
          description,
          keywords: keywordsStr,
          country,
          updatedAt: new Date().toISOString(),
        },
      },
      { upsert: true }
    )

    let remoteSynced = false
    let remoteDetails: any = null

    // 2. If OAuth2 token is present, push to Google YouTube API v3
    if (token) {
      try {
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

        if (response.ok) {
          remoteSynced = true
          remoteDetails = await response.json()
        } else {
          remoteDetails = await response.text()
        }
      } catch (err: any) {
        console.warn('[YouTube API Push] Could not push to Google API:', err)
      }
    }

    return {
      ok: true,
      message: `Peace2074 YouTube channel branding successfully updated and synchronized!`,
      channelId,
      title,
      description,
      keywords: keywordsStr,
      localSynced: true,
      remoteSynced,
      remoteDetails,
    }
  } catch (err: any) {
    console.error('[YouTube Update Branding] Error:', err)
    return {
      ok: false,
      error: err?.message || 'Failed to update YouTube channel branding',
    }
  }
})
