import { createError, defineEventHandler, readBody } from 'h3'
import { readSession } from '../../utils/auth'
import { getProfile, updateProfile } from '../../utils/profile'

function isRecord(value: unknown): value is Record<string, any> {
    return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

export default defineEventHandler(async (event) => {
    const session = readSession(event)

    if (!session) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }

    const body = await readBody<{ settings?: Record<string, any> }>(event)
    const incomingSettings = isRecord(body?.settings) ? body.settings : {}
    const existingProfile = await getProfile(session.id)
    const existingSettings = isRecord(existingProfile?.settings)
        ? existingProfile.settings
        : {}

    const mergedSettings = {
        ...existingSettings,
        ...incomingSettings,
        quran: {
            ...(isRecord(existingSettings.quran) ? existingSettings.quran : {}),
            ...(isRecord(incomingSettings.quran) ? incomingSettings.quran : {}),
        },
    }

    const profile = await updateProfile(session.id, { settings: mergedSettings })

    return {
        ok: true,
        settings: profile?.settings || mergedSettings,
    }
})
