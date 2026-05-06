import { defineEventHandler, getRouterParam, readBody } from 'h3'
import { readSession } from '../../../utils/auth'
import { banUser, unbanUser } from '../../../utils/users'

/**
 * DELETE /api/admin/users/:id
 * Kick (ban) a user. Pass { unban: true } in body to lift a ban.
 * Requires admin role. Admins cannot ban themselves.
 */
export default defineEventHandler(async (event) => {
    const session = readSession(event)

    if (!session || session.role !== 'admin') {
        return { ok: false, error: 'Forbidden' }
    }

    const userId = getRouterParam(event, 'id')
    if (!userId) {
        return { ok: false, error: 'Missing user id' }
    }

    if (userId === session.id) {
        return { ok: false, error: 'Cannot ban yourself' }
    }

    try {
        const body = await readBody<{ unban?: boolean; reason?: string }>(event).catch(() => ({}))

        const updated = body?.unban
            ? await unbanUser(userId)
            : await banUser(userId, body?.reason)

        if (!updated) {
            return { ok: false, error: 'User not found' }
        }

        return { ok: true, user: updated }
    } catch (err: any) {
        console.error('[admin/users DELETE] Error:', err)
        return { ok: false, error: err?.message || 'Failed to update user' }
    }
})
