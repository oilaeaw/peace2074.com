import { defineEventHandler } from 'h3'
import { getUserStorageDiagnostics } from '../../utils/users'

export default defineEventHandler(async () => {
    const config = useRuntimeConfig()

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

    const databaseUrl = process.env.DATABASE_URL || ''
    const users = await getUserStorageDiagnostics()

    return {
        ok: true,
        env: {
            hasAuthSecret: Boolean(authSecret),
            hasAuthPasscode: Boolean(authPasscode),
            hasDatabaseUrl: Boolean(databaseUrl),
        },
        users,
        timestamp: new Date().toISOString(),
    }
})
