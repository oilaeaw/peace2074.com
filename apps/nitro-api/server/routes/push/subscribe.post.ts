import { defineEventHandler, readBody } from 'h3'
import { getCollection } from '../../utils/kv-db'

/**
 * POST /api/push/subscribe
 * Subscribe to push notifications
 */
export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event)
        const { subscription } = body

        if (!subscription || !subscription.endpoint) {
            return { ok: false, error: 'Invalid subscription object' }
        }

        const Subscriptions = await getCollection('push_subscriptions')

        // Get user info if authenticated (optional)
        const user = event.context.user
        const userId = user?._id || user?.email

        // Check if subscription already exists
        const existing = await Subscriptions.findOne({ endpoint: subscription.endpoint })

        if (existing) {
            // Update existing subscription
            await Subscriptions.updateOne(
                { endpoint: subscription.endpoint },
                {
                    $set: {
                        subscription,
                        userId: userId || null,
                        updatedAt: new Date()
                    }
                }
            )
            return { ok: true, message: 'Subscription updated' }
        }

        // Create new subscription
        await Subscriptions.insertOne({
            endpoint: subscription.endpoint,
            subscription,
            userId: userId || null,
            createdAt: new Date(),
            updatedAt: new Date(),
        })

        return { ok: true, message: 'Subscribed to push notifications' }
    } catch (err: any) {
        console.error('[Push Subscribe] Error:', err)
        return { ok: false, error: err?.message || 'Failed to subscribe' }
    }
})
