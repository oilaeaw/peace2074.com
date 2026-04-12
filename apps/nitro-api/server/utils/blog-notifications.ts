import { getCollection } from './kv-db'
import { getVapidConfig } from './vapid'

type BlogNotificationInput = {
    slug: string
    title: string
    notificationTitle?: string
    notificationBody?: string
    notificationUrl?: string
}

type BlogNotificationResult = {
    ok: boolean
    reason: 'disabled' | 'missing-vapid' | 'no-subscriptions' | 'sent'
    attempted: number
    delivered: number
}

export async function sendBlogPostNotification(
    input: BlogNotificationInput
): Promise<BlogNotificationResult> {
    if (process.env.ENABLE_BLOG_NOTIFICATIONS !== 'true') {
        return {
            ok: false,
            reason: 'disabled',
            attempted: 0,
            delivered: 0,
        }
    }

    const vapid = getVapidConfig()
    if (!vapid) {
        return {
            ok: false,
            reason: 'missing-vapid',
            attempted: 0,
            delivered: 0,
        }
    }

    const webpush = await import('web-push')
    webpush.default.setVapidDetails(vapid.subject, vapid.publicKey, vapid.privateKey)

    const Subscriptions = await getCollection('push_subscriptions')
    const subscriptions = await Subscriptions.find({}).toArray()

    if (!subscriptions.length) {
        return {
            ok: false,
            reason: 'no-subscriptions',
            attempted: 0,
            delivered: 0,
        }
    }

    const payload = JSON.stringify({
        title: input.notificationTitle || '📝 New Blog Post',
        body: input.notificationBody || input.title,
        icon: '/android-chrome-192x192.png',
        badge: '/android-chrome-192x192.png',
        data: {
            url: input.notificationUrl || `/blog/${input.slug}`,
        },
    })

    const results = await Promise.allSettled(
        subscriptions.map(async (sub: any) => {
            try {
                await webpush.default.sendNotification(sub.subscription, payload)
                return true
            } catch (err: any) {
                if (err?.statusCode === 410 && sub?.endpoint) {
                    await Subscriptions.deleteOne({ endpoint: sub.endpoint })
                }
                return false
            }
        })
    )

    const delivered = results.filter(
        (result) => result.status === 'fulfilled' && result.value === true
    ).length

    return {
        ok: delivered > 0,
        reason: 'sent',
        attempted: subscriptions.length,
        delivered,
    }
}