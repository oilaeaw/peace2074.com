import { createError, defineEventHandler, readBody } from 'h3'
import { createSession, requireSecrets, verify } from '../../utils/auth'
import { applyCors } from '../../utils/cors'

export default defineEventHandler(async (event) => {
    applyCors(event)
    const body = await readBody(event).catch(() => ({}))
    const token = String(body?.token || '')

    if (!token) {
        throw createError({ statusCode: 400, statusMessage: 'Missing token' })
    }

    const { secret } = requireSecrets({ needPasscode: false })
    const payload = verify(token, secret)

    if (!payload) {
        throw createError({ statusCode: 401, statusMessage: 'Invalid or expired token' })
    }

    createSession(event, {
        id: payload.id,
        role: payload.role,
        name: payload.name,
    }, 'apple')

    return { success: true }
})
