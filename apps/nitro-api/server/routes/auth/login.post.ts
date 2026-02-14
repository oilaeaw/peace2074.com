import { createError, defineEventHandler, readBody } from 'h3'
import { createSession, requireSecrets } from '../../utils/auth'
import { findUserByUsername } from '../../utils/users'

export default defineEventHandler(async (event) => {
    try {
        const body = (await readBody<{ username?: string; password?: string }>(event)) || {}
        const username = (body.username || '').trim()
        const password = (body.password || '').trim()

        if (!username || !password) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Username and password are required'
            })
        }

        // Ensure auth secret exists before doing any work.
        requireSecrets({ needPasscode: false })

        const user = await findUserByUsername(username)
        if (!user || user.password !== password) {
            throw createError({
                statusCode: 401,
                statusMessage: 'Invalid username or password'
            })
        }

        const sessionUser = {
            id: user.id,
            role: user.role,
            name: `${user.first_name} ${user.last_name}`
        }

        createSession(event, sessionUser)

        return {
            ok: true,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                first_name: user.first_name,
                last_name: user.last_name
            }
        }
    } catch (error: any) {
        if (error?.statusCode) throw error

        console.error('[auth/login] unexpected error', error)
        throw createError({
            statusCode: 500,
            statusMessage: `Login server failure: ${error?.message || 'unknown error'}`,
        })
    }
})