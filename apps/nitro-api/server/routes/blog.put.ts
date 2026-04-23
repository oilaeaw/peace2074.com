import { defineEventHandler, readBody } from 'h3'
import { requireAuth } from '../utils/auth'
import { getMongoose } from '../utils/mongoose'
import { BlogPostModel } from '../models/BlogPost'
import { updateDatoCmsBlogPostBySlug } from '../utils/datocms'
import { generateEmbedding, blogPostEmbeddingText } from '../utils/embeddings'

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

        const updateTags = tags ? (Array.isArray(tags) ? tags : []) : undefined

        // MongoDB primary path
        try {
            await getMongoose()

            // Build update object (only include provided fields)
            const update: any = {}

            if (title) update.title = title
            if (excerpt !== undefined) update.excerpt = excerpt
            if (content) update.content = content
            if (updateTags !== undefined) update.tags = updateTags

            // Regenerate embedding if any text field changed
            if (title || excerpt !== undefined || content || updateTags !== undefined) {
                try {
                    const current = await BlogPostModel.findOne({ slug: normalizedSlug }).lean() as any
                    if (current) {
                        update.embedding = await generateEmbedding(
                            blogPostEmbeddingText({
                                title: title ?? current.title,
                                excerpt: excerpt !== undefined ? excerpt : current.excerpt,
                                content: content ?? current.content,
                                tags: updateTags !== undefined ? updateTags : current.tags,
                            })
                        )
                    }
                } catch (err) {
                    console.warn('[Blog PUT] Embedding generation failed:', err instanceof Error ? err.message : 'unknown')
                }
            }

            const result = await BlogPostModel.findOneAndUpdate(
                { slug: normalizedSlug },
                { $set: update },
                { new: true }
            ).lean()

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
                console.warn('[Blog PUT] MongoDB update succeeded but DatoCMS sync failed:', err instanceof Error ? err.message : 'unknown')
            }

            return { ok: true, post: result, source: 'mongodb', datocmsSynced }
        } catch (dbErr) {
            console.warn('[Blog PUT] MongoDB update failed, trying DatoCMS fallback:', dbErr instanceof Error ? dbErr.message : 'unknown')
        }

        // DB unavailable: optional DatoCMS fallback
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
