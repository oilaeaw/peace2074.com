import { defineEventHandler, getQuery } from 'h3'
import { requireAuth } from '../utils/auth'
import { getPrisma } from '../utils/prisma'
import { deleteDatoCmsBlogPostBySlug } from '../utils/datocms'

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

        const normalizedSlug = String(slug).trim()

        const prisma = await getPrisma()

        // Prisma primary path
        if (prisma) {
            await prisma.blogPost.delete({ where: { slug: normalizedSlug } })

            // Mirror delete to DatoCMS (best effort)
            let datocmsSynced = false
            try {
                const datocmsDelete = await deleteDatoCmsBlogPostBySlug(normalizedSlug)
                datocmsSynced = !!datocmsDelete
            } catch (err) {
                console.warn('[Blog DELETE] Prisma delete succeeded but DatoCMS sync failed:', err instanceof Error ? err.message : 'unknown')
            }

            return { ok: true, message: 'Post deleted successfully', source: 'prisma', datocmsSynced }
        }

        // Prisma unavailable: optional DatoCMS fallback
        try {
            const datocmsDelete = await deleteDatoCmsBlogPostBySlug(normalizedSlug)
            if (datocmsDelete) {
                return { ok: true, message: 'Post deleted successfully', source: 'datocms-fallback' }
            }
        } catch (err) {
            console.warn('[Blog DELETE] DatoCMS fallback failed:', err instanceof Error ? err.message : 'unknown')
        }

        return { ok: false, error: 'Database not available' }
    } catch (err: any) {
        console.error('[Blog DELETE] Error:', err)
        return { ok: false, error: err?.message || 'Failed to delete post' }
    }
})
