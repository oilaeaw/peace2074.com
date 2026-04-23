import { getMongoose } from '../utils/mongoose'
import { BlogPostModel } from '../models/BlogPost'
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
 * Nitro plugin that seeds blog posts on server startup
 * This ensures blog posts persist across deployments in stateless environments (like Netlify)
 */
export default defineNitroPlugin(async () => {
    if (import.meta.dev) {
        console.log('[Blog Seed] Skipping seed in dev mode')
        return
    }

    try {
        console.log('[Blog Seed] Checking blog posts...')

        await getMongoose()

        // Import seed data
        const seedData = await import('../data/blog-seed.json').then(m => m.default as SeedBlogPost[])

        // Check which posts need to be seeded
        let seededCount = 0

        for (const post of seedData) {
            const existing = await BlogPostModel.findOne({ slug: post.slug }).lean()

            if (!existing) {
                // Add post with dates
                await BlogPostModel.create({
                    _id: post.id,
                    slug: post.slug,
                    title: post.title,
                    excerpt: post.excerpt || '',
                    content: post.content,
                    tags: post.tags || [],
                    date: post.date,
                    author: post.author,
                    createdAt: post.createdAt ? new Date(post.createdAt) : new Date(),
                    updatedAt: post.updatedAt ? new Date(post.updatedAt) : new Date(),
                })
                seededCount++
                console.log(`[Blog Seed] ✓ Seeded: ${post.title}`)

                if (post.notifySubscribers === true) {
                    try {
                        const notificationResult = await sendBlogPostNotification({
                            slug: post.slug,
                            title: post.title,
                            notificationTitle: post.notificationTitle,
                            notificationBody: post.notificationBody,
                            notificationUrl: post.notificationUrl,
                        })

                        console.log(
                            `[Blog Seed] Notification ${notificationResult.ok ? 'sent' : 'skipped'} for: ${post.title} (${notificationResult.reason})`
                        )
                    } catch (error: any) {
                        console.error(
                            `[Blog Seed] Failed to notify subscribers for ${post.title}:`,
                            error?.message || error
                        )
                    }
                }
            }
        }

        if (seededCount > 0) {
            console.log(`[Blog Seed] ✓ Seeded ${seededCount} blog post(s)`)
        } else {
            console.log('[Blog Seed] ✓ All blog posts already exist')
        }

        // Log total count
        const total = await BlogPostModel.countDocuments()
        console.log(`[Blog Seed] Total blog posts: ${total}`)

    } catch (error: any) {
        console.error('[Blog Seed] Error seeding blog posts:', error?.message || error)
    }
})
