import { createError, defineEventHandler } from 'h3'
import { readSession } from '../../utils/auth'
import { getProfile } from '../../utils/profile'

export default defineEventHandler(async (event) => {
    const session = readSession(event)

    if (!session) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }

    const profile = await getProfile(session.id)

    return {
        ok: true,
        settings: profile?.settings || {},
    }
})
