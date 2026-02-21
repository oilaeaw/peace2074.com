import { createError, defineEventHandler, readBody } from 'h3'
import { createSession, requireSecrets } from '../../utils/auth'
import { findUserByUsername, updateUserPassword } from '../../utils/users'
import { verifyPassword, hashPassword, isPasswordHashed } from '../../utils/password'

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