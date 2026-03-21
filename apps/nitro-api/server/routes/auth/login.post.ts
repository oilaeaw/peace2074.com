import { createError, defineEventHandler, readBody } from 'h3'
import { createSession, requireSecrets } from '../../utils/auth'
import { findUserByUsername, updateUserPassword } from '../../utils/users'
import { getProfile } from '../../utils/profile'
import { verifyPassword, hashPassword, isPasswordHashed } from '../../utils/password'
import { applyCors } from '../../utils/cors'

export default defineEventHandler(async (event) => {
    applyCors(event)

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
        if (!user) {
            throw createError({
                statusCode: 401,
                statusMessage: 'Invalid username or password'
            })
        }

        // Verify password using secure comparison
        const isValid = await verifyPassword(password, user.password)
        if (!isValid) {
            throw createError({
                statusCode: 401,
                statusMessage: 'Invalid username or password'
            })
        }

        // Auto-migrate plain text passwords to hashed on successful login
        if (!isPasswordHashed(user.password)) {
            const hashedPassword = await hashPassword(password)
            await updateUserPassword(user.id, hashedPassword)
            console.log(`[auth/login] Migrated password to hashed format for user: ${username}`)
        }

        // Get user profile for display name
        const profile = await getProfile(user.id)
        const displayName = profile
            ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || user.username
            : user.username

        const sessionUser = {
            id: user.id,
            role: user.role,
            name: displayName
        }

        createSession(event, sessionUser)

        return {
            ok: true,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                first_name: profile?.first_name || user.username,
                last_name: profile?.last_name || '',
                avatar_url: profile?.avatar_url || null,
                permissions: user.permissions || []
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