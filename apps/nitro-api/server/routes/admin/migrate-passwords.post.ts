import { defineEventHandler, createError } from 'h3'
import { getAllUsers, updateUserPassword } from '../../utils/users'
import { hashPassword, isPasswordHashed } from '../../utils/password'
import { requireAuth } from '../../utils/auth'

/**
 * POST /api/admin/migrate-passwords
 * Manually migrate all plain text passwords to hashed format
 * Requires admin authentication
 */
export default defineEventHandler(async (event) => {
    // Require admin auth
    const session = requireAuth(event)
    if (session.role !== 'admin') {
        throw createError({
            statusCode: 403,
            statusMessage: 'Admin access required'
        })
    }

    try {
        const users = await getAllUsers()
        const results = []

        for (const user of users) {
            if (!user.password) {
                results.push({
                    userId: user.id,
                    username: user.username,
                    status: 'skipped',
                    reason: 'no password'
                })
                continue
            }

            if (isPasswordHashed(user.password)) {
                results.push({
                    userId: user.id,
                    username: user.username,
                    status: 'skipped',
                    reason: 'already hashed'
                })
                continue
            }

            // Password is plain text, hash it
            const hashedPassword = await hashPassword(user.password)
            const updated = await updateUserPassword(user.id, hashedPassword)

            results.push({
                userId: user.id,
                username: user.username,
                status: updated ? 'migrated' : 'failed',
                passwordPreview: user.password.substring(0, 5) + '***'
            })
        }

        const migrated = results.filter(r => r.status === 'migrated').length
        const skipped = results.filter(r => r.status === 'skipped').length
        const failed = results.filter(r => r.status === 'failed').length

        return {
            ok: true,
            summary: {
                total: users.length,
                migrated,
                skipped,
                failed
            },
            details: results
        }
    } catch (error: any) {
        console.error('[admin/migrate-passwords] Error:', error)
        return {
            ok: false,
            error: error?.message || 'Migration failed'
        }
    }
})
