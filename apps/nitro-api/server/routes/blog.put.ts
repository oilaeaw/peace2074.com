import { defineEventHandler, readBody } from 'h3'
import { requireAuth } from '../utils/auth'
import { getPrisma } from '../utils/prisma'

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

        const prisma = await getPrisma()

        if (!prisma) {
            return { ok: false, error: 'Database not available' }
        }

        // Build update object (only include provided fields)
        const update: any = {}

        if (title) update.title = title
        if (excerpt !== undefined) update.excerpt = excerpt
        if (content) update.content = content
        if (tags) update.tags = Array.isArray(tags) ? tags : []

        const result = await prisma.blogPost.update({
            where: { slug },
            data: update
        })

        if (!result) {
            return { ok: false, error: 'Post not found' }
        }

        return { ok: true, post: result }
    } catch (err: any) {
        console.error('[Blog PUT] Error:', err)
        return { ok: false, error: err?.message || 'Failed to update post' }
    }
})
