import { defineEventHandler, readBody } from 'h3'
import { getDb } from '../../utils/realdb'
import { requireAuth } from '../../utils/auth'

interface DeployLike {
    version: string
    userId: string
}

/**
 * POST /api/deploys/likes
 * Toggle like for a deployment version (requires authentication)
 */
export default defineEventHandler(async (event) => {
    try {
        const session = requireAuth(event)
        const userId = session.id

        const body = await readBody(event)
        const { version } = body

        if (!version || typeof version !== 'string') {
            return { ok: false, error: 'Version is required' }
        }

        const db = await getDb()
        const likes = db.collection<DeployLike>('deployLikes')

        const existing = await likes.find({
            filter: [
                { field: 'version', op: 'eq', value: version },
                { field: 'userId', op: 'eq', value: userId },
            ],
        })

        if (existing[0]?.id) {
            await likes.delete(existing[0].id!)
            const count = await likes.count({ filter: [{ field: 'version', op: 'eq', value: version }] })
            return { ok: true, liked: false, count }
        } else {
            await likes.insert({ version, userId })
            const count = await likes.count({ filter: [{ field: 'version', op: 'eq', value: version }] })
            return { ok: true, liked: true, count }
        }
    } catch (err: any) {
        console.error('[Deploys Likes POST] Error:', err)
        if (err.statusCode === 401) {
            return { ok: false, error: 'Authentication required', authRequired: true }
        }
        return { ok: false, error: err?.message || 'Failed to toggle like' }
    }
})
