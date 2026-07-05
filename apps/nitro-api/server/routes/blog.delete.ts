import { defineEventHandler, getQuery } from 'h3'
import { requireAuth } from '../utils/auth'
import { getDb } from '../utils/realdb'
import { deleteDatoCmsBlogPostBySlug } from '../utils/datocms'

/**
 * DELETE /api/blog?slug=xxx
 */
export default defineEventHandler(async (event) => {
    const user = requireAuth(event)
    if (!user) return { ok: false, error: 'Unauthorized' }

    try {
        const { slug } = getQuery(event)
        if (!slug || typeof slug !== 'string') return { ok: false, error: 'Missing slug parameter' }

        const normalizedSlug = String(slug).trim()

        const db = await getDb()
        const blogPosts = db.collection('blogPosts')

        const existing = await blogPosts.find({
            filter: [{ field: 'slug', op: 'eq', value: normalizedSlug }],
        })
        if (existing[0]?.id) {
            await blogPosts.delete(existing[0].id!)
        }

        let datocmsSynced = false
        try {
            const del = await deleteDatoCmsBlogPostBySlug(normalizedSlug)
            datocmsSynced = !!del
        } catch (err) {
            console.warn('[Blog DELETE] DatoCMS sync failed:', err instanceof Error ? err.message : 'unknown')
        }

        return { ok: true, message: 'Post deleted successfully', source: 'realdb', datocmsSynced }
    } catch (err: any) {
        console.error('[Blog DELETE] Error:', err)
        return { ok: false, error: err?.message || 'Failed to delete post' }
    }
})
