import { defineEventHandler, readBody } from 'h3'

/**
 * POST /api/push/unsubscribe
 * Unsubscribe from push notifications
 */
export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { endpoint } = body

    if (!endpoint) {
      return { ok: false, error: 'Endpoint is required' }
    }

    const db = event.context.db
    if (!db) {
      return { ok: false, error: 'Database not available' }
    }

    const Subscriptions = db.collection('push_subscriptions')

    const result = await Subscriptions.deleteOne({ endpoint })

    if (result.deletedCount === 0) {
      return { ok: false, error: 'Subscription not found' }
    }

    return { ok: true, message: 'Unsubscribed from push notifications' }
  } catch (err: any) {
    console.error('[Push Unsubscribe] Error:', err)
    return { ok: false, error: err?.message || 'Failed to unsubscribe' }
  }
})
