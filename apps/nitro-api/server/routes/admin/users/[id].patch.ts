import { defineEventHandler, getRouterParam, readBody } from 'h3'
import { readSession } from '../../../utils/auth'
import { updateUserRoleAndPermissions } from '../../../utils/users'

const VALID_ROLES = ['user', 'editor', 'admin']

/**
 * PATCH /api/admin/users/:id
 * Update a user's role and/or permissions. Requires admin role.
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

    try {
        const body = await readBody<{ role?: string; permissions?: Array<{ action: string; subject: string }> }>(event)

        if (body.role && !VALID_ROLES.includes(body.role)) {
            return { ok: false, error: `Invalid role. Must be one of: ${VALID_ROLES.join(', ')}` }
        }

        if (!body.role && !body.permissions) {
            return { ok: false, error: 'Nothing to update. Provide role or permissions.' }
        }

        const updated = await updateUserRoleAndPermissions(userId, {
            role: body.role,
            permissions: body.permissions,
        })

        if (!updated) {
            return { ok: false, error: 'User not found' }
        }

        return { ok: true, user: updated }
    } catch (err: any) {
        console.error('[admin/users PATCH] Error:', err)
        return { ok: false, error: err?.message || 'Failed to update user' }
    }
})
