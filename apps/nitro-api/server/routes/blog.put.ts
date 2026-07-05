import { defineEventHandler, readBody } from 'h3'
import { requireAuth } from '../utils/auth'
import { getDb } from '../utils/realdb'
import { updateDatoCmsBlogPostBySlug } from '../utils/datocms'
import { generateEmbedding, blogPostEmbeddingText } from '../utils/embeddings'

/**
 * PUT /api/blog
 */
export default defineEventHandler(async (event) => {
    const user = requireAuth(event)
    if (!user) return { ok: false, error: 'Unauthorized' }

    try {
        const body = await readBody(event)
        const { slug, title, excerpt, content, tags } = body

        if (!slug) return { ok: false, error: 'Missing slug parameter' }

        const normalizedSlug = String(slug).trim()
        const updateTags = tags ? (Array.isArray(tags) ? tags : []) : undefined

        const db = await getDb()
        const blogPosts = db.collection('blogPosts')

        const existing = await blogPosts.find({
            filter: [{ field: 'slug', op: 'eq', value: normalizedSlug }],
        })
        if (!existing[0]?.id) return { ok: false, error: 'Post not found' }

        const current = existing[0] as any
        const patch: Record<string, any> = {}
        if (title) patch.title = title
        if (excerpt !== undefined) patch.excerpt = excerpt
        if (content) patch.content = content
        if (updateTags !== undefined) patch.tags = updateTags

        // Regenerate embedding if text changed
        if (title || excerpt !== undefined || content || updateTags !== undefined) {
            try {
                patch.embedding = await generateEmbedding(blogPostEmbeddingText({
                    title: title ?? current.title,
                    excerpt: excerpt !== undefined ? excerpt : current.excerpt,
                    content: content ?? current.content,
                    tags: updateTags !== undefined ? updateTags : current.tags,
                }))
            } catch (err) {
                console.warn('[Blog PUT] Embedding failed:', err instanceof Error ? err.message : 'unknown')
            }
        }

        const updated = await blogPosts.update(existing[0].id!, patch)

        let datocmsSynced = false
        try {
            const datocmsPost = await updateDatoCmsBlogPostBySlug(normalizedSlug, { title, excerpt, content, tags: updateTags })
            datocmsSynced = !!datocmsPost
        } catch (err) {
            console.warn('[Blog PUT] DatoCMS sync failed:', err instanceof Error ? err.message : 'unknown')
        }

        return { ok: true, post: updated, source: 'realdb', datocmsSynced }
    } catch (err: any) {
        console.error('[Blog PUT] Error:', err)
        return { ok: false, error: err?.message || 'Failed to update post' }
    }
})
