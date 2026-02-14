import { defineEventHandler, readBody } from 'h3'
import { requireAuth } from '../utils/auth'
import { getCollection } from '../utils/kv-db'

/**
 * PUT /api/blog
 * Updates an existing blog post (requires authentication)
 */
export default defineEventHandler(async (event) => {
    // Require authentication
    const user = requireAuth(event)
    if (!user) {
        return { ok: false, error: 'Unauthorized' }
    }

    try {
        const body = await readBody(event)
        const { slug, title, excerpt, content, tags } = body

        if (!slug) {
            return { ok: false, error: 'Missing slug parameter' }
        }

        const Blog = await getCollection('blog_posts')

        // Build update object (only include provided fields)
        const update: any = {
            updatedAt: new Date(),
        }

        if (title) update.title = title
        if (excerpt !== undefined) update.excerpt = excerpt
        if (content) update.content = content
        if (tags) update.tags = Array.isArray(tags) ? tags : []

        const result = await Blog.findOneAndUpdate(
            { slug },
            { $set: update },
            { returnDocument: 'after' }
        )

        if (!result) {
            return { ok: false, error: 'Post not found' }
        }

        return { ok: true, post: result }
    } catch (err: any) {
        console.error('[Blog PUT] Error:', err)
        return { ok: false, error: err?.message || 'Failed to update post' }
    }
})
