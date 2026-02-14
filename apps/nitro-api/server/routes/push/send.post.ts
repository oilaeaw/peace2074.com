import { defineEventHandler, readBody } from 'h3'
import webpush from 'web-push'
import { requireAuth } from '../../utils/auth'
import { getCollection } from '../../utils/kv-db'
import { getVapidConfig } from '../../utils/vapid'

/**
 * POST /api/push/send
 * Send push notification to all subscribers or specific user
 * (Requires authentication - admin only recommended)
 */
export default defineEventHandler(async (event) => {
    // Require authentication
    const user = requireAuth(event)
    if (!user) {
        return { ok: false, error: 'Unauthorized' }
    }

    try {
        const body = await readBody(event)
        const { title, message, url, userId } = body

        if (!title || !message) {
            return { ok: false, error: 'Title and message are required' }
        }

        // Configure web-push
        const vapid = getVapidConfig()

        if (!vapid) {
            return { ok: false, error: 'VAPID keys not configured' }
        }

        webpush.setVapidDetails(vapid.subject, vapid.publicKey, vapid.privateKey)

        const Subscriptions = await getCollection('push_subscriptions')

        // Build query - send to specific user or all
        const query: any = {}
        if (userId) {
            query.userId = userId
        }

        const subscriptions = await Subscriptions.find(query).toArray()

        if (subscriptions.length === 0) {
            return { ok: false, error: 'No subscribers found' }
        }

        // Prepare notification payload
        const payload = JSON.stringify({
            title,
            body: message,
            icon: '/android-chrome-192x192.png',
            badge: '/android-chrome-192x192.png',
            data: {
                url: url || '/',
                timestamp: Date.now(),
            },
        })

        // Send to all subscriptions
        const results = await Promise.allSettled(
            subscriptions.map(async (sub) => {
                try {
                    await webpush.sendNotification(sub.subscription, payload)
                    return { endpoint: sub.endpoint, success: true }
                } catch (err: any) {
                    console.error(`[Push] Failed to send to ${sub.endpoint}:`, err)
                    // If subscription is invalid (410 Gone), remove it
                    if (err.statusCode === 410) {
                        await Subscriptions.deleteOne({ endpoint: sub.endpoint })
                    }
                    return { endpoint: sub.endpoint, success: false, error: err.message }
                }
            })
        )

        const successful = results.filter(r => r.status === 'fulfilled').length
        const failed = results.filter(r => r.status === 'rejected').length

        return {
            ok: true,
            message: `Sent to ${successful} subscribers${failed > 0 ? `, ${failed} failed` : ''}`,
            sent: successful,
            failed,
        }
    } catch (err: any) {
        console.error('[Push Send] Error:', err)
        return { ok: false, error: err?.message || 'Failed to send notifications' }
    }
})
