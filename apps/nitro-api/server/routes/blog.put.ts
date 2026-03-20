import { defineEventHandler, readBody } from 'h3'
import { requireAuth } from '../utils/auth'
import { getPrisma } from '../utils/prisma'
import { updateDatoCmsBlogPostBySlug } from '../utils/datocms'

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

        const normalizedSlug = String(slug).trim()

        const prisma = await getPrisma()

        const updateTags = tags ? (Array.isArray(tags) ? tags : []) : undefined

        // Prisma primary path
        if (prisma) {
            // Build update object (only include provided fields)
            const update: any = {}

            if (title) update.title = title
            if (excerpt !== undefined) update.excerpt = excerpt
            if (content) update.content = content
            if (updateTags !== undefined) update.tags = updateTags

            const result = await prisma.blogPost.update({
                where: { slug: normalizedSlug },
                data: update
            })

            if (!result) {
                return { ok: false, error: 'Post not found' }
            }

            // Mirror update to DatoCMS (best effort)
            let datocmsSynced = false
            try {
                const datocmsPost = await updateDatoCmsBlogPostBySlug(normalizedSlug, {
                    title,
                    excerpt,
                    content,
                    tags: updateTags,
                })
                datocmsSynced = !!datocmsPost
            } catch (err) {
                console.warn('[Blog PUT] Prisma update succeeded but DatoCMS sync failed:', err instanceof Error ? err.message : 'unknown')
            }

            return { ok: true, post: result, source: 'prisma', datocmsSynced }
        }

        // Prisma unavailable: optional DatoCMS fallback
        try {
            const datocmsPost = await updateDatoCmsBlogPostBySlug(normalizedSlug, {
                title,
                excerpt,
                content,
                tags: updateTags,
            })

            if (datocmsPost) {
                return { ok: true, post: datocmsPost, source: 'datocms-fallback' }
            }
        } catch (err) {
            console.warn('[Blog PUT] DatoCMS fallback failed:', err instanceof Error ? err.message : 'unknown')
        }

        return { ok: false, error: 'Database not available' }
    } catch (err: any) {
        console.error('[Blog PUT] Error:', err)
        return { ok: false, error: err?.message || 'Failed to update post' }
    }
})
