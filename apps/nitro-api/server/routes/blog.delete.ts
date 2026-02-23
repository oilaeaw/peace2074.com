import { defineEventHandler, getQuery } from 'h3'
import { requireAuth } from '../utils/auth'
import { getPrisma } from '../utils/prisma'

/**
 * DELETE /api/blog?slug=xxx
 * Deletes a blog post (requires authentication)
 */
export default defineEventHandler(async (event) => {
    // Require authentication
    const user = requireAuth(event)
    if (!user) {
        return { ok: false, error: 'Unauthorized' }
    }

    try {
        const query = getQuery(event)
        const { slug } = query

        if (!slug || typeof slug !== 'string') {
            return { ok: false, error: 'Missing slug parameter' }
        }

        const prisma = await getPrisma()

        if (!prisma) {
            return { ok: false, error: 'Database not available' }
        }

        await prisma.blogPost.delete({ where: { slug } })

        return { ok: true, message: 'Post deleted successfully' }
    } catch (err: any) {
        console.error('[Blog DELETE] Error:', err)
        return { ok: false, error: err?.message || 'Failed to delete post' }
    }
})
