import { defineEventHandler, readBody, getHeader, createError } from 'h3'
import crypto from 'node:crypto'

/**
 * POST /api/webhooks/asc
 * App Store Connect webhook — receives real-time notifications for build
 * processing, review status changes, and other ASC events.
 *
 * Set this URL in App Store Connect → Users and Access → Integrations → Webhooks:
 *   https://peace2074.com/api/webhooks/asc
 *
 * Env vars:
 *   ASC_WEBHOOK_SECRET  — optional shared secret set in ASC webhook config;
 *                         when present, the X-ASC-Signature header is verified.
 */

interface AscWebhookPayload {
    notificationType: string
    notificationUUID: string
    data: Record<string, unknown>
    [key: string]: unknown
}

function verifySignature(secret: string, rawBody: string, signature: string): boolean {
    const hmac = crypto.createHmac('sha256', secret)
    const expected = 'sha256=' + hmac.update(rawBody).digest('hex')
    try {
        return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
    } catch {
        return false
    }
}

export default defineEventHandler(async (event) => {
    const rawBody = await readBody<AscWebhookPayload>(event, { strict: false })
    const secret = process.env.ASC_WEBHOOK_SECRET
    const signature = getHeader(event, 'x-asc-signature') ?? getHeader(event, 'x-apple-signature')

    if (secret && signature) {
        const isValid = verifySignature(secret, JSON.stringify(rawBody), signature)
        if (!isValid) {
            console.error('[ASC Webhook] Invalid signature — request rejected')
            throw createError({ statusCode: 401, statusMessage: 'Invalid signature' })
        }
    }

    const payload = rawBody as AscWebhookPayload
    const type = payload?.notificationType ?? 'UNKNOWN'

    console.log(`[ASC Webhook] ${type}`, JSON.stringify(payload, null, 2))

    switch (type) {
        case 'BUILD_PROCESSING':
            console.log('[ASC Webhook] Build processing started:', payload.data)
            break

        case 'BUILD_PROCESSING_FINISHED':
            console.log('[ASC Webhook] Build finished processing:', payload.data)
            break

        case 'APP_SUBMISSION_WAITING_FOR_REVIEW':
            console.log('[ASC Webhook] App is waiting for review:', payload.data)
            break

        case 'APP_SUBMISSION_STATUS_CHANGED': {
            const status = (payload.data as Record<string, unknown>)?.reviewStatus ?? 'unknown'
            console.log(`[ASC Webhook] Review status changed → ${status}`, payload.data)
            break
        }

        case 'APP_REVIEW_ATTACHMENT_GENERATED':
            console.log('[ASC Webhook] Review attachment generated:', payload.data)
            break

        default:
            console.log(`[ASC Webhook] Unhandled type: ${type}`)
    }

    return { ok: true, received: type }
})
