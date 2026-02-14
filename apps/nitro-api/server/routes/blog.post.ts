import { defineEventHandler, readBody } from 'h3'
import { requireAuth } from '../utils/auth'

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

    const db = event.context.db
    if (!db) {
      return { ok: false, error: 'Database not available' }
    }

    const Blog = db.collection('blog_posts')

    // Check if slug already exists
    const existing = await Blog.findOne({ slug })
    if (existing) {
      return { ok: false, error: 'A post with this slug already exists' }
    }

    const post = {
      id: slug,
      slug,
      title,
      excerpt: excerpt || '',
      content,
      tags: Array.isArray(tags) ? tags : [],
      date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
      author: user.username || user.email,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await Blog.insertOne(post)

    // Optional: Send push notification to all subscribers
    if (process.env.ENABLE_BLOG_NOTIFICATIONS === 'true') {
      try {
        const webpush = await import('web-push')
        const publicKey = process.env.VAPID_PUBLIC_KEY || process.env.NITRO_VAPID_PUBLIC_KEY
        const privateKey = process.env.VAPID_PRIVATE_KEY || process.env.NITRO_VAPID_PRIVATE_KEY
        const subject = process.env.VAPID_SUBJECT || 'mailto:admin@peace2074.com'

        if (publicKey && privateKey) {
          webpush.default.setVapidDetails(subject, publicKey, privateKey)

          const Subscriptions = db.collection('push_subscriptions')
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
          ).catch(() => {})
        }
      } catch (err) {
        console.error('[Blog] Failed to send push notifications:', err)
      }
    }

    return {
      ok: true,
      post: { ...post, _id: result.insertedId },
    }
  } catch (err: any) {
    console.error('[Blog POST] Error:', err)
    return { ok: false, error: err?.message || 'Failed to create post' }
  }
})
