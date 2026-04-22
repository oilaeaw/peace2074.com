import { defineEventHandler, readBody, getHeader, createError } from 'h3'
import crypto from 'node:crypto'
import { broadcastPush } from '../utils/push-notify'

/**
 * POST /api/identity-webhook
 * Netlify Identity webhook — receives validate / signup / login events.
 *
 * Set this URL in Netlify → Identity → Settings → Webhooks:
 *   https://peace2074.com/api/identity-webhook
 *
 * Env var:
 *   NETLIFY_IDENTITY_JWT_SECRET  — the JWT secret shown in Netlify Identity
 *                                  settings (Identity → Settings → JWT secret).
 *                                  When set, the Authorization header JWT is
 *                                  verified before processing. When absent the
 *                                  endpoint still works but without auth.
 *
 * Response contract:
 *   - validate:  200 → allow signup  |  422 → block signup
 *   - signup:    200 → acknowledged
 *   - login:     200 → acknowledged
 */

interface IdentityUser {
    id: string
    email: string
    user_metadata?: Record<string, unknown>
    app_metadata?: Record<string, unknown>
    created_at?: string
    [key: string]: unknown
}

interface IdentityWebhookPayload {
    event: 'validate' | 'signup' | 'login' | string
    user: IdentityUser
    [key: string]: unknown
}

function base64UrlDecode(str: string): Buffer {
    const padded = str.replace(/-/g, '+').replace(/_/g, '/').padEnd(str.length + ((4 - (str.length % 4)) % 4), '=')
    return Buffer.from(padded, 'base64')
}

function verifyJwt(token: string, secret: string): boolean {
    const parts = token.split('.')
    if (parts.length !== 3) return false
    const [header, payload, signature] = parts
    const signingInput = `${header}.${payload}`
    const expected = crypto.createHmac('sha256', secret).update(signingInput).digest('base64url')
    try {
        return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
    } catch {
        return false
    }
}

export default defineEventHandler(async (event) => {
    const secret = process.env.NETLIFY_IDENTITY_JWT_SECRET

    // Verify JWT when secret is configured
    if (secret) {
        const authHeader = getHeader(event, 'authorization') ?? ''
        const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''
        if (!token || !verifyJwt(token, secret)) {
            console.error('[Identity Webhook] Invalid or missing JWT')
            throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
        }
    }

    const body = await readBody<IdentityWebhookPayload>(event)
    const { event: eventType, user } = body ?? {}

    console.log(`[Identity Webhook] ${eventType}`, JSON.stringify({ id: user?.id, email: user?.email }, null, 2))

    switch (eventType) {
        case 'validate': {
            // Return 200 to allow signup, throw 422 to block.
            // Add blocking logic here if needed (e.g. domain allow-list).
            const email = user?.email ?? ''
            if (!email.includes('@')) {
                throw createError({ statusCode: 422, statusMessage: 'Invalid email' })
            }
            return { ok: true }
        }

        case 'signup':
            console.log(`[Identity Webhook] New user signed up: ${user?.email}`)
            try {
                await broadcastPush(
                    {
                        title: '👋 New member joined',
                        body: `${user?.email} just signed up to Peace2074`,
                        data: { url: '/' },
                    },
                    'identity-signup'
                )
            } catch (err) { console.error('[Identity Webhook] broadcastPush error:', err) }
            return { ok: true }

        case 'login':
            console.log(`[Identity Webhook] User logged in: ${user?.email}`)
            return { ok: true }

        default:
            console.log(`[Identity Webhook] Unhandled event: ${eventType}`)
            return { ok: true }
    }
})
