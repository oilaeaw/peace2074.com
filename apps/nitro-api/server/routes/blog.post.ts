import { defineEventHandler, readBody } from 'h3'
import { requireAuth } from '../utils/auth'
import { getDb } from '../utils/realdb'
import { createDatoCmsBlogPost } from '../utils/datocms'
import { sendBlogPostNotification } from '../utils/blog-notifications'
import { generateEmbedding, blogPostEmbeddingText } from '../utils/embeddings'

function toCanonicalSlug(value: string) {
    return String(value || '').trim().toLowerCase().replace(/\s+/g, '-').replace(/-+/g, '-')
}

/**
 * POST /api/blog
 */
export default defineEventHandler(async (event) => {
    const user = requireAuth(event)
    if (!user) return { ok: false, error: 'Unauthorized' }

    try {
        const body = await readBody(event)
        const { title, excerpt, content, tags, slug } = body

        if (!title || !content || !slug) {
            return { ok: false, error: 'Missing required fields: title, content, slug' }
        }

        const normalizedSlug = toCanonicalSlug(String(slug))
        const normalizedTitle = String(title).trim()
        const normalizedExcerpt = String(excerpt || '').trim()
        const normalizedTags = Array.isArray(tags) ? tags : []
        const normalizedAuthor = (user as any).name || (user as any).id
        const normalizedDate = new Date().toISOString().split('T')[0]

        if (!normalizedSlug) return { ok: false, error: 'Invalid slug value' }

        const db = await getDb()
        const blogPosts = db.collection('blogPosts')

        const existing = await blogPosts.find({
            filter: [{ field: 'slug', op: 'eq', value: normalizedSlug }],
        })
        if (existing.length) return { ok: false, error: 'A post with this slug already exists' }

        let embedding: number[] = []
        try {
            embedding = await generateEmbedding(blogPostEmbeddingText({
                title: normalizedTitle, excerpt: normalizedExcerpt, content, tags: normalizedTags,
            }))
        } catch (err) {
            console.warn('[Blog POST] Embedding generation failed:', err instanceof Error ? err.message : 'unknown')
        }

        const post = await blogPosts.insert({
            slug: normalizedSlug, title: normalizedTitle, excerpt: normalizedExcerpt,
            content, tags: normalizedTags, date: normalizedDate, author: normalizedAuthor, embedding,
        })

        // Mirror to DatoCMS (best effort)
        let datocmsSynced = false
        try {
            const datocmsPost = await createDatoCmsBlogPost({
                slug: normalizedSlug, title: normalizedTitle, excerpt: normalizedExcerpt,
                content, tags: normalizedTags, date: normalizedDate, author: normalizedAuthor,
            })
            datocmsSynced = !!datocmsPost
        } catch (err) {
            console.warn('[Blog POST] DatoCMS sync failed:', err instanceof Error ? err.message : 'unknown')
        }

        void sendBlogPostNotification({ slug: normalizedSlug, title: normalizedTitle }).catch((err) => {
            console.error('[Blog] Push notification failed:', err)
        })

        return { ok: true, post, source: 'realdb', datocmsSynced }
    } catch (err: any) {
        console.error('[Blog POST] Error:', err)
        return { ok: false, error: err?.message || 'Failed to create post' }
    }
})
