import { defineEventHandler, getQuery } from 'h3'
import { requireAuth } from '../utils/auth'
import { getCollection } from '../utils/kv-db'

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

        const Blog = await getCollection('blog_posts')

        const result = await Blog.deleteOne({ slug })

        if (result.deletedCount === 0) {
            return { ok: false, error: 'Post not found' }
        }

        return { ok: true, message: 'Post deleted successfully' }
    } catch (err: any) {
        console.error('[Blog DELETE] Error:', err)
        return { ok: false, error: err?.message || 'Failed to delete post' }
    }
})
