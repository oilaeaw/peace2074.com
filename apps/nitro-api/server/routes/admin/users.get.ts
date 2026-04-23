import { defineEventHandler } from 'h3'
import { readSession } from '../../utils/auth'
import { getAllUsers } from '../../utils/users'

/**
 * GET /api/admin/users
 * Returns all users. Requires admin role.
 */
export default defineEventHandler(async (event) => {
    const session = readSession(event)

    if (!session || session.role !== 'admin') {
        return { ok: false, error: 'Forbidden' }
    }

    try {
        const users = await getAllUsers()
        const sanitized = users.map((u) => ({
            id: u.id,
            username: u.username,
            email: u.email,
            role: u.role,
            permissions: u.permissions ?? [],
            google_id: u.google_id ?? null,
            apple_id: u.apple_id ?? null,
            github_id: u.github_id ?? null,
            first_name: u.first_name ?? null,
            last_name: u.last_name ?? null,
            avatar_url: u.avatar_url ?? null,
        }))
        return { ok: true, users: sanitized }
    } catch (err: any) {
        console.error('[admin/users GET] Error:', err)
        return { ok: false, error: err?.message || 'Failed to fetch users' }
    }
})
