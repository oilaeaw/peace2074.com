import { defineEventHandler } from 'h3'
import { getVapidConfig, getVapidStatus } from '../../utils/vapid'

/**
 * GET /api/push/public-key
 * Returns the VAPID public key for push subscriptions
 */
export default defineEventHandler(() => {
    const vapid = getVapidConfig()

    if (!vapid) {
        const status = getVapidStatus()
        const missing: string[] = []
        if (!status.hasPublicKey) missing.push('NITRO_VAPID_PUBLIC_KEY (or VAPID_PUBLIC_KEY)')
        if (!status.hasPrivateKey) missing.push('NITRO_VAPID_PRIVATE_KEY (or VAPID_PRIVATE_KEY)')
        if (!status.hasSubject) missing.push('NITRO_VAPID_SUBJECT (or VAPID_SUBJECT)')

        console.error('[Push] VAPID keys not configured')
        return {
            ok: false,
            error: 'Push notifications not configured',
            missing,
        }
    }

    return { ok: true, publicKey: vapid.publicKey }
})
