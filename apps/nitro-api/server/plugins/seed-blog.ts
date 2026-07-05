import { getDb } from '../utils/realdb'
import { sendBlogPostNotification } from '../utils/blog-notifications'

type SeedBlogPost = {
    id: string
    slug: string
    title: string
    excerpt?: string
    content: string
    tags?: string[]
    date: string
    author: string
    createdAt?: string
    updatedAt?: string
    notifySubscribers?: boolean
    notificationTitle?: string
    notificationBody?: string
    notificationUrl?: string
}

/**
 * Nitro plugin — seeds blog posts from JSON on server startup.
 */
export default defineNitroPlugin(async () => {
    if (import.meta.dev) {
        console.log('[Blog Seed] Skipping seed in dev mode')
        return
    }

    try {
        console.log('[Blog Seed] Checking blog posts...')

        const db = await getDb()
        const blogPosts = db.collection('blogPosts')
        const seedData = await import('../data/blog-seed.json').then(m => m.default as SeedBlogPost[])

        let seededCount = 0

        for (const post of seedData) {
            const existing = await blogPosts.find({
                filter: [{ field: 'slug', op: 'eq', value: post.slug }],
            })

            if (!existing.length) {
                await blogPosts.insert({
                    slug: post.slug,
                    title: post.title,
                    excerpt: post.excerpt || '',
                    content: post.content,
                    tags: post.tags || [],
                    date: post.date,
                    author: post.author,
                })
                seededCount++
                console.log(`[Blog Seed] ✓ Seeded: ${post.title}`)

                if (post.notifySubscribers === true) {
                    try {
                        const result = await sendBlogPostNotification({
                            slug: post.slug,
                            title: post.title,
                            notificationTitle: post.notificationTitle,
                            notificationBody: post.notificationBody,
                            notificationUrl: post.notificationUrl,
                        })
                        console.log(`[Blog Seed] Notification ${result.ok ? 'sent' : 'skipped'} for: ${post.title}`)
                    } catch (err: any) {
                        console.error(`[Blog Seed] Notify failed for ${post.title}:`, err?.message)
                    }
                }
            }
        }

        const total = await blogPosts.count()
        console.log(seededCount > 0
            ? `[Blog Seed] ✓ Seeded ${seededCount} post(s). Total: ${total}`
            : `[Blog Seed] ✓ All posts already exist. Total: ${total}`)

    } catch (err: any) {
        console.error('[Blog Seed] Error:', err?.message || err)
    }
})
