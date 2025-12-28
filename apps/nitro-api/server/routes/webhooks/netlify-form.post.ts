import crypto from 'node:crypto'
import { createError, defineEventHandler, readRawBody } from 'h3'

function verifySignature(raw: string, provided: string | undefined, secret: string | undefined) {
    if (!secret) return true
    if (!provided) return false
    const expected = crypto.createHmac('sha256', secret).update(raw).digest('hex')
    return crypto.timingSafeEqual(Buffer.from(provided), Buffer.from(expected))
}

export default defineEventHandler(async (event) => {
    const raw = await readRawBody(event)
    if (!raw) {
        throw createError({ statusCode: 400, statusMessage: 'Empty body' })
    }

    const rawString = typeof raw === 'string' ? raw : raw.toString('utf8')
    const sigHeader = event.node.req.headers['x-webhook-signature'] as string | undefined

    const config = useRuntimeConfig()
    const secret = (config as any).netlifyWebhookSecret || process.env.NETLIFY_WEBHOOK_SECRET

    if (!verifySignature(rawString, sigHeader, secret)) {
        throw createError({ statusCode: 401, statusMessage: 'Invalid signature' })
    }

    let payload: any
    try {
        payload = JSON.parse(rawString)
    } catch (err) {
        throw createError({ statusCode: 400, statusMessage: 'Invalid JSON payload' })
    }

    const formName = payload?.data?.name || payload?.payload?.data?.name || payload?.payload?.name || 'contact'
    const fields = payload?.payload?.data || payload?.data || {}
    const name = fields.name || 'Unknown'
    const email = fields.email || 'Unknown'
    const project = fields.project || 'N/A'
    const message = fields.message || ''

    const summary = `Netlify form: ${formName}\nFrom: ${name} <${email}>\nProject: ${project}\nMessage: ${message}`

    // In this trimmed version we simply return the parsed data; no external forwarding.
    return { ok: true, summary }
})