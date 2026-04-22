import { getCollection } from './kv-db'
import { getVapidConfig } from './vapid'

export interface PushPayload {
    title: string
    body: string
    icon?: string
    badge?: string
    tag?: string
    data?: Record<string, unknown>
}

export interface PushResult {
    ok: boolean
    sent: number
    failed: number
    reason?: string
}

/**
 * Broadcast a web push notification to all stored subscribers.
 */
export async function broadcastPush(payload: PushPayload, tag?: string): Promise<PushResult> {
    const vapid = getVapidConfig()
    if (!vapid) {
        return { ok: false, sent: 0, failed: 0, reason: 'vapid-not-configured' }
    }

    const webpush = await import('web-push')
    webpush.default.setVapidDetails(vapid.subject, vapid.publicKey, vapid.privateKey)

    const Subscriptions = await getCollection('push_subscriptions')
    const subscriptions = await Subscriptions.find({}).toArray()

    if (!subscriptions.length) {
        return { ok: false, sent: 0, failed: 0, reason: 'no-subscribers' }
    }

    const body = JSON.stringify({
        icon: '/android-chrome-192x192.png',
        badge: '/android-chrome-192x192.png',
        ...payload,
        tag: tag ?? payload.tag ?? 'notification',
    })

    let sent = 0
    let failed = 0

    await Promise.allSettled(
        subscriptions.map(async (sub) => {
            try {
                await webpush.default.sendNotification(sub.subscription, body)
                sent++
            } catch (err: any) {
                if (err.statusCode === 410 || err.statusCode === 404) {
                    await Subscriptions.deleteOne({ endpoint: sub.subscription?.endpoint })
                }
                failed++
            }
        })
    )

    return { ok: true, sent, failed }
}
