import { defineEventHandler, createError } from 'h3'
import { requireAuth } from '../../utils/auth'
import { getAllUsers } from '../../utils/users'
import { isPasswordHashed } from '../../utils/password'

/**
 * GET /api/admin/password-status
 * Check if passwords are hashed (admin only)
 */
export default defineEventHandler(async (event) => {
    const session = requireAuth(event)
    if (session.role !== 'admin') {
        throw createError({
            statusCode: 403,
            statusMessage: 'Admin access required'
        })
    }

    try {
        const users = await getAllUsers()

        const status = users.map(user => ({
            userId: user.id,
            username: user.username,
            passwordFormat: isPasswordHashed(user.password) ? 'hashed' : 'plaintext',
            passwordPreview: user.password.substring(0, 20) + '...',
            passwordLength: user.password.length
        }))

        return {
            ok: true,
            users: status,
            summary: {
                total: users.length,
                hashed: status.filter(u => u.passwordFormat === 'hashed').length,
                plaintext: status.filter(u => u.passwordFormat === 'plaintext').length
            }
        }
    } catch (error: any) {
        return {
            ok: false,
            error: error?.message || 'Failed to check password status'
        }
    }
})
