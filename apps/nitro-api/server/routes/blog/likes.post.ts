import { defineEventHandler, readBody } from 'h3'
import { getDb } from '../../utils/realdb'
import { requireAuth } from '../../utils/auth'

interface BlogLike {
    slug: string
    userId: string
}

/**
 * POST /api/blog/likes
 * Toggle like for a blog post (requires authentication)
 */
export default defineEventHandler(async (event) => {
    try {
        const session = requireAuth(event)
        const userId = session.id

        const body = await readBody(event)
        const { slug } = body

        if (!slug || typeof slug !== 'string') {
            return { ok: false, error: 'Slug is required' }
        }

        const db = await getDb()
        const likes = db.collection<BlogLike>('blogLikes')

        const existing = await likes.find({
            filter: [
                { field: 'slug', op: 'eq', value: slug },
                { field: 'userId', op: 'eq', value: userId },
            ],
        })

        if (existing[0]?.id) {
            // Unlike
            await likes.delete(existing[0].id!)
            const count = await likes.count({ filter: [{ field: 'slug', op: 'eq', value: slug }] })
            return { ok: true, liked: false, count }
        } else {
            // Like
            await likes.insert({ slug, userId })
            const count = await likes.count({ filter: [{ field: 'slug', op: 'eq', value: slug }] })
            return { ok: true, liked: true, count }
        }
    } catch (err: any) {
        console.error('[Blog Likes POST] Error:', err)
        if (err.statusCode === 401) {
            return { ok: false, error: 'Authentication required', authRequired: true }
        }
        return { ok: false, error: err?.message || 'Failed to toggle like' }
    }
})
