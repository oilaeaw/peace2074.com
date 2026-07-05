import { defineEventHandler } from 'h3'
import { applyCors } from '../../utils/cors'
import { getOAuthAvailability } from '../../utils/oauth'
import { getUserStorageDiagnostics } from '../../utils/users'
import { resolvePrimaryDatabaseUri } from '../../utils/database-uri'

export default defineEventHandler(async (event) => {
    applyCors(event)

    const config = useRuntimeConfig()
    const oauth = getOAuthAvailability()

    const authSecret =
        (config as any).authSecret
        || process.env.NITRO_AUTH_SECRET
        || process.env.AUTH_SECRET
        || ''

    const authPasscode =
        (config as any).authPasscode
        || process.env.NITRO_AUTH_PASSCODE
        || process.env.AUTH_PASSCODE
        || ''

    const databaseUrl = resolvePrimaryDatabaseUri()
    const users = await getUserStorageDiagnostics()

    return {
        ok: true,
        env: {
            hasAuthSecret: Boolean(authSecret),
            hasAuthPasscode: Boolean(authPasscode),
            hasDatabaseUrl: Boolean(databaseUrl),
        },
        oauth,
        users,
        timestamp: new Date().toISOString(),
    }
})
