import { createError, defineEventHandler } from 'h3'
import { readSession, requireSecrets } from '../../utils/auth'
import { applyCors } from '../../utils/cors'

export default defineEventHandler((event) => {
    applyCors(event)
    // Ensure config exists
    requireSecrets()

    const session = readSession(event)
    if (!session) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }
    const { exp, ...user } = session
    return { ok: true, user }
})