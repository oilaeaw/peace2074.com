import { defineEventHandler, getQuery, readBody, getHeader } from 'h3'
import webpush from 'web-push'
import { getCollection } from '../../utils/kv-db'
import { getVapidConfig } from '../../utils/vapid'

/**
 * YouTube Webhook Handler (Google PubSubHubbub)
 * GET: Verifies subscription challenge from Google
 * POST: Triggers push notification to subscribers when a new YouTube video is published on Peace2074 channel
 */
export default defineEventHandler(async (event) => {
  const method = event.node.req.method

  // 1. GET: Verification Challenge from Google PubSubHubbub
  if (method === 'GET') {
    const query = getQuery(event)
    const challenge = query['hub.challenge']
    if (challenge) {
      return String(challenge)
    }
    return { ok: true, message: 'YouTube webhook challenge listener active' }
  }

  // 2. POST: New Video Webhook Notification from YouTube
  if (method === 'POST') {
    try {
      const contentType = getHeader(event, 'content-type') || ''
      let bodyText = ''

      if (contentType.includes('xml') || contentType.includes('text')) {
        bodyText = await readBody(event)
      } else {
        const bodyJson = await readBody(event)
        bodyText = typeof bodyJson === 'string' ? bodyJson : JSON.stringify(bodyJson)
      }

      // Parse XML for video details
      const videoIdMatch = bodyText.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)
      const titleMatch = bodyText.match(/<title>([^<]+)<\/title>/)
      const channelIdMatch = bodyText.match(/<yt:channelId>([^<]+)<\/yt:channelId>/)

      if (!videoIdMatch || !titleMatch) {
        return { ok: true, message: 'No new video entry found in payload' }
      }

      const videoId = videoIdMatch[1].trim()
      const title = titleMatch[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1').trim()
      const channelId = channelIdMatch ? channelIdMatch[1].trim() : 'UCKPAQJxnUTX-pzvLQ3M0aEQ'

      console.log(`[YouTube Webhook] New video published on channel ${channelId}: "${title}" (ID: ${videoId})`)

      // Send Web Push notification to all subscribers
      const vapid = getVapidConfig()
      if (vapid) {
        webpush.setVapidDetails(vapid.subject, vapid.publicKey, vapid.privateKey)

        const Subscriptions = await getCollection('push_subscriptions')
        const subscriptions = await Subscriptions.find({}).toArray()

        if (subscriptions.length > 0) {
          const payload = JSON.stringify({
            title: `🎥 New Video: ${title}`,
            body: `Watch the latest upload on Peace2074 YouTube Channel!`,
            icon: `/android-chrome-192x192.png`,
            badge: `/android-chrome-192x192.png`,
            tag: `youtube-video-${videoId}`,
            data: {
              url: `/social?video=${videoId}`,
              videoId,
              channelId,
              timestamp: Date.now(),
            },
          })

          await Promise.allSettled(
            subscriptions.map(async (sub) => {
              try {
                await webpush.sendNotification(sub.subscription, payload)
              } catch (err: any) {
                if (err.statusCode === 410) {
                  await Subscriptions.deleteOne({ endpoint: sub.endpoint })
                }
              }
            })
          )
        }
      }

      return {
        ok: true,
        message: `Processed video notification for "${title}"`,
        videoId,
        channelId,
      }
    } catch (err: any) {
      console.error('[YouTube Webhook] Error:', err)
      return { ok: false, error: err?.message || 'Failed to process YouTube webhook' }
    }
  }

  return { ok: false, error: 'Method not supported' }
})
