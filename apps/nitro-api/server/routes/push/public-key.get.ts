import { defineEventHandler } from 'h3'
import { getVapidConfig } from '../../utils/vapid'

/**
 * GET /api/push/public-key
 * Returns the VAPID public key for push subscriptions
 */
export default defineEventHandler(() => {
    const vapid = getVapidConfig()

    if (!vapid) {
        console.error('[Push] VAPID_PUBLIC_KEY not configured')
        return { ok: false, error: 'Push notifications not configured' }
    }

    return { ok: true, publicKey: vapid.publicKey }
})
