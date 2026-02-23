import { defineEventHandler, readBody } from 'h3'
import { requireAuth } from '../utils/auth'
import { getPrisma } from '../utils/prisma'
import { getVapidConfig } from '../utils/vapid'

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

        const prisma = await getPrisma()

        if (!prisma) {
            return { ok: false, error: 'Database not available' }
        }

        // Check if slug already exists
        const existing = await prisma.blogPost.findUnique({ where: { slug } })
        if (existing) {
            return { ok: false, error: 'A post with this slug already exists' }
        }

        const post = await prisma.blogPost.create({
            data: {
                id: slug,
                slug,
                title,
                excerpt: excerpt || '',
                content,
                tags: Array.isArray(tags) ? tags : [],
                date: new Date().toISOString().split('T')[0],
                author: user.name || user.id,
            }
        })

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
                        body: title,
                        icon: '/android-chrome-192x192.png',
                        badge: '/android-chrome-192x192.png',
                        data: {
                            url: `/blog/${slug}`,
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
        }
    } catch (err: any) {
        console.error('[Blog POST] Error:', err)
        return { ok: false, error: err?.message || 'Failed to create post' }
    }
})
