import { defineEventHandler, readBody, getHeader, createError } from 'h3'
import crypto from 'node:crypto'
import { broadcastPush } from '../../utils/push-notify'

/**
 * POST /api/webhooks/message
 * Receives new-message events from the waelio-messaging server and broadcasts
 * a Web Push notification so offline Peace2074 users are notified.
 *
 * Env var:
 *   MESSAGING_WEBHOOK_SECRET  — shared secret set in waelio-messaging's
 *                               PEACE2074_WEBHOOK_SECRET env var.
 *                               When set, the x-webhook-signature header
 *                               (sha256=<hmac>) is verified.
 */

interface MessageWebhookPayload {
    type: 'route' | 'broadcast' | 'room-message' | string
    senderId: string
    recipientId?: string | null
    roomId?: string | null
    payload: string
    isBroadcast: boolean
    timestamp: string
}

function verifySignature(body: string, header: string | undefined, secret: string): boolean {
    if (!header) return false
    const expected = 'sha256=' + crypto.createHmac('sha256', secret).update(body).digest('hex')
    try {
        return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(header))
    } catch {
        return false
    }
}

export default defineEventHandler(async (event) => {
    const secret = process.env.MESSAGING_WEBHOOK_SECRET
    const rawBody = await readBody<MessageWebhookPayload>(event)
    const sig = getHeader(event, 'x-webhook-signature')

    if (secret) {
        if (!verifySignature(JSON.stringify(rawBody), sig, secret)) {
            console.error('[Message Webhook] Invalid signature')
            throw createError({ statusCode: 401, statusMessage: 'Invalid signature' })
        }
    }

    const { type, senderId, recipientId, payload: text, isBroadcast } = rawBody ?? {}

    const sender = senderId?.substring(0, 8) ?? 'Someone'
    const messageText = typeof text === 'string' ? text : (text != null ? JSON.stringify(text) : '')

    if (type === 'route' && recipientId) {
        // Direct message — only notify the specific recipient via push
        // (they may be offline; online users get it via Socket.io)
        console.log(`[Message Webhook] Direct from ${sender} → ${recipientId}`)
        await broadcastPush(
            {
                title: `💬 New message`,
                body: messageText.substring(0, 100),
                data: { url: '/chat', type: 'direct', from: senderId },
            },
            'chat-direct'
        )
    } else if (isBroadcast || type === 'broadcast') {
        console.log(`[Message Webhook] Broadcast from ${sender}`)
        await broadcastPush(
            {
                title: `📢 Peace2074 Chat`,
                body: messageText.substring(0, 100),
                data: { url: '/chat', type: 'broadcast', from: senderId },
            },
            'chat-broadcast'
        )
    } else if (type === 'room-message') {
        console.log(`[Message Webhook] Room message from ${sender}`)
        await broadcastPush(
            {
                title: `💬 Room message`,
                body: messageText.substring(0, 100),
                data: { url: '/chat', type: 'room', from: senderId },
            },
            'chat-room'
        )
    }

    return { ok: true }
})
