import { defineEventHandler, readBody } from 'h3'
import { requireAuth } from '../utils/auth'
import { getPrisma } from '../utils/prisma'
import { getVapidConfig } from '../utils/vapid'
import { createDatoCmsBlogPost } from '../utils/datocms'

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
            return { ok: false, error: 'Missing required fields: title, content, slug' }
        }

        const normalizedSlug = String(slug).trim()
        const normalizedTitle = String(title).trim()
        const normalizedExcerpt = String(excerpt || '').trim()
        const normalizedTags = Array.isArray(tags) ? tags : []
        const normalizedAuthor = user.name || user.id
        const normalizedDate = new Date().toISOString().split('T')[0]

        const prisma = await getPrisma()

        // Prisma primary path
        if (prisma) {
            // Check if slug already exists
            const existing = await prisma.blogPost.findUnique({ where: { slug: normalizedSlug } })
            if (existing) {
                return { ok: false, error: 'A post with this slug already exists' }
            }

            const post = await prisma.blogPost.create({
                data: {
                    id: normalizedSlug,
                    slug: normalizedSlug,
                    title: normalizedTitle,
                    excerpt: normalizedExcerpt,
                    content,
                    tags: normalizedTags,
                    date: normalizedDate,
                    author: normalizedAuthor,
                }
            })

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
                console.warn('[Blog POST] Prisma write succeeded but DatoCMS sync failed:', err instanceof Error ? err.message : 'unknown')
            }

            // Optional: Send push notification to all subscribers
            // TODO: Migrate push subscriptions to Prisma/MongoDB
            if (process.env.ENABLE_BLOG_NOTIFICATIONS === 'true') {
                try {
                    const webpush = await import('web-push')
                    const vapid = getVapidConfig()
                    const { getCollection } = await import('../utils/kv-db')

                    if (vapid) {
                        webpush.default.setVapidDetails(vapid.subject, vapid.publicKey, vapid.privateKey)

                        const Subscriptions = await getCollection('push_subscriptions')
                        const subscriptions = await Subscriptions.find({}).toArray()

                        const payload = JSON.stringify({
                            title: '📝 New Blog Post',
                            body: normalizedTitle,
                            icon: '/android-chrome-192x192.png',
                            badge: '/android-chrome-192x192.png',
                            data: {
                                url: `/blog/${normalizedSlug}`,
                            },
                        })

                        // Send notifications in background (don't wait)
                        Promise.allSettled(
                            subscriptions.map(async (sub) => {
                                try {
                                    await webpush.default.sendNotification(sub.subscription, payload)
                                } catch (err: any) {
                                    if (err.statusCode === 410) {
                                        await Subscriptions.deleteOne({ endpoint: sub.endpoint })
                                    }
                                }
                            })
                        ).catch(() => { })
                    }
                } catch (err) {
                    console.error('[Blog] Failed to send push notifications:', err)
                }
            }

            return {
                ok: true,
                post,
                source: 'prisma',
                datocmsSynced,
            }
        }

        // Prisma unavailable: optional DatoCMS fallback
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
            console.warn('[Blog POST] DatoCMS fallback failed:', err instanceof Error ? err.message : 'unknown')
        }

        return { ok: false, error: 'Database not available' }
    } catch (err: any) {
        console.error('[Blog POST] Error:', err)
        return { ok: false, error: err?.message || 'Failed to create post' }
    }
})
