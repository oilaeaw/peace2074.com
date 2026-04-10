import { createError, defineEventHandler } from 'h3'
import { readSession, requireSecrets } from '../../utils/auth'
import { applyCors } from '../../utils/cors'
import { getProfile } from '../../utils/profile'
import { findUserById, resolveUserPermissions } from '../../utils/users'

export default defineEventHandler(async (event) => {
    applyCors(event)
    // Ensure config exists
    requireSecrets({ needPasscode: false })

    const session = readSession(event)
    if (!session) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }

    const dbUser = await findUserById(session.id)

    if (!dbUser) {
        const { exp, ...user } = session

        return {
            ok: true,
            user: {
                ...user,
                username: session.name || session.id,
                email: '',
                first_name: session.name || session.id,
                last_name: '',
                avatar_url: null,
                permissions: resolveUserPermissions({ role: session.role, permissions: [] }),
            },
        }
    }

    const profile = await getProfile(dbUser.id)

    return {
        ok: true,
        user: {
            id: dbUser.id,
            username: dbUser.username,
            email: dbUser.email,
            role: dbUser.role,
            first_name: profile?.first_name || dbUser.first_name || dbUser.username,
            last_name: profile?.last_name || dbUser.last_name || '',
            avatar_url: profile?.avatar_url || dbUser.avatar_url || null,
            permissions: resolveUserPermissions(dbUser),
        },
    }
})