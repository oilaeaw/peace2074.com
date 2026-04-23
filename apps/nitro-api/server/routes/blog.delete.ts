import { defineEventHandler, getQuery } from 'h3'
import { requireAuth } from '../utils/auth'
import { getMongoose } from '../utils/mongoose'
import { BlogPostModel } from '../models/BlogPost'
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

        // MongoDB primary path
        try {
            await getMongoose()
            await BlogPostModel.findOneAndDelete({ slug: normalizedSlug })

            // Mirror delete to DatoCMS (best effort)
            let datocmsSynced = false
            try {
                const datocmsDelete = await deleteDatoCmsBlogPostBySlug(normalizedSlug)
                datocmsSynced = !!datocmsDelete
            } catch (err) {
                console.warn('[Blog DELETE] MongoDB delete succeeded but DatoCMS sync failed:', err instanceof Error ? err.message : 'unknown')
            }

            return { ok: true, message: 'Post deleted successfully', source: 'mongodb', datocmsSynced }
        } catch (dbErr) {
            console.warn('[Blog DELETE] MongoDB delete failed, trying DatoCMS fallback:', dbErr instanceof Error ? dbErr.message : 'unknown')
        }

        // DB unavailable: optional DatoCMS fallback
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
