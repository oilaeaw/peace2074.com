import { defineEventHandler } from 'h3'

/**
 * GET /api/push/public-key
 * Returns the VAPID public key for push subscriptions
 */
export default defineEventHandler(() => {
  const publicKey = process.env.VAPID_PUBLIC_KEY || process.env.NITRO_VAPID_PUBLIC_KEY

  if (!publicKey) {
    console.error('[Push] VAPID_PUBLIC_KEY not configured')
    return { ok: false, error: 'Push notifications not configured' }
  }

  return { ok: true, publicKey }
})
