import { defineEventHandler, readBody } from 'h3'
import { requireAuth } from '../utils/auth'
import { getMongoose } from '../utils/mongoose'
import { BlogPostModel } from '../models/BlogPost'
import { createDatoCmsBlogPost } from '../utils/datocms'
import { sendBlogPostNotification } from '../utils/blog-notifications'
import { generateEmbedding, blogPostEmbeddingText } from '../utils/embeddings'

function toCanonicalSlug(value: string) {
    return String(value || '')
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
}

/**
 * POST /api/blog
 * Creates a new blog post (requires authentication)
 */
export default defineEventHandler(async (event) => {
    // Require authentication
    const user = requireAuth(event)
    if (!user) {
        return { ok: false, error: 'Unauthorized' }
    }

    try {
        const body = await readBody(event)
        const { title, excerpt, content, tags, slug } = body

        if (!title || !content || !slug) {
            return {
                ok: false,
                error: 'Missing required fields: title, content, slug',
            }
        }

        const normalizedSlug = toCanonicalSlug(String(slug))
        const normalizedTitle = String(title).trim()
        const normalizedExcerpt = String(excerpt || '').trim()
        const normalizedTags = Array.isArray(tags) ? tags : []
        const normalizedAuthor = user.name || user.id
        const normalizedDate = new Date().toISOString().split('T')[0]

        if (!normalizedSlug) {
            return { ok: false, error: 'Invalid slug value' }
        }

        // MongoDB primary path
        try {
            await getMongoose()

            const existing = await BlogPostModel.findOne({ slug: normalizedSlug }).lean()
            if (existing) {
                return { ok: false, error: 'A post with this slug already exists' }
            }

            let embedding: number[] = []
            try {
                embedding = await generateEmbedding(
                    blogPostEmbeddingText({
                        title: normalizedTitle,
                        excerpt: normalizedExcerpt,
                        content,
                        tags: normalizedTags,
                    })
                )
            } catch (err) {
                console.warn(
                    '[Blog POST] Embedding generation failed:',
                    err instanceof Error ? err.message : 'unknown'
                )
            }

            const postDoc = await BlogPostModel.create({
                _id: normalizedSlug,
                slug: normalizedSlug,
                title: normalizedTitle,
                excerpt: normalizedExcerpt,
                content,
                tags: normalizedTags,
                date: normalizedDate,
                author: normalizedAuthor,
                embedding,
            })
            const post = postDoc.toObject()

            // Mirror write to DatoCMS (best effort)
            let datocmsSynced = false
            try {
                const datocmsPost = await createDatoCmsBlogPost({
                    slug: normalizedSlug,
                    title: normalizedTitle,
                    excerpt: normalizedExcerpt,
                    content,
                    tags: normalizedTags,
                    date: normalizedDate,
                    author: normalizedAuthor,
                })
                datocmsSynced = !!datocmsPost
            } catch (err) {
                console.warn(
                    '[Blog POST] MongoDB write succeeded but DatoCMS sync failed:',
                    err instanceof Error ? err.message : 'unknown'
                )
            }

            void sendBlogPostNotification({
                slug: normalizedSlug,
                title: normalizedTitle,
            }).catch((err) => {
                console.error('[Blog] Failed to send push notifications:', err)
            })

            return {
                ok: true,
                post,
                source: 'mongodb',
                datocmsSynced,
            }
        } catch (dbErr) {
            console.warn('[Blog POST] MongoDB write failed, trying DatoCMS fallback:', dbErr instanceof Error ? dbErr.message : 'unknown')
        }

        // DB unavailable: optional DatoCMS fallback
        try {
            const datocmsPost = await createDatoCmsBlogPost({
                slug: normalizedSlug,
                title: normalizedTitle,
                excerpt: normalizedExcerpt,
                content,
                tags: normalizedTags,
                date: normalizedDate,
                author: normalizedAuthor,
            })

            if (datocmsPost) {
                return {
                    ok: true,
                    post: datocmsPost,
                    source: 'datocms-fallback',
                }
            }
        } catch (err) {
            console.warn(
                '[Blog POST] DatoCMS fallback failed:',
                err instanceof Error ? err.message : 'unknown'
            )
        }

        return { ok: false, error: 'Database not available' }
    } catch (err: any) {
        console.error('[Blog POST] Error:', err)
        return { ok: false, error: err?.message || 'Failed to create post' }
    }
})
