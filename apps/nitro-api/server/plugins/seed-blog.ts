import { getCollection } from '../utils/kv-db'

/**
 * Nitro plugin that seeds blog posts on server startup
 * This ensures blog posts persist across deployments in stateless environments (like Netlify)
 */
export default defineNitroPlugin(async () => {
    try {
        console.log('[Blog Seed] Checking blog posts...')

        const Blog = await getCollection('blog_posts')

        // Import seed data
        const seedData = await import('../data/blog-seed.json').then(m => m.default)

        // Check which posts need to be seeded
        let seededCount = 0

        for (const post of seedData) {
            const existing = await Blog.findOne({ slug: post.slug })

            if (!existing) {
                // Add dates if not present
                const postData = {
                    ...post,
                    createdAt: post.createdAt ? new Date(post.createdAt) : new Date(),
                    updatedAt: post.updatedAt ? new Date(post.updatedAt) : new Date(),
                }

                await Blog.insertOne(postData)
                seededCount++
                console.log(`[Blog Seed] ✓ Seeded: ${post.title}`)
            }
        }

        if (seededCount > 0) {
            console.log(`[Blog Seed] ✓ Seeded ${seededCount} blog post(s)`)
        } else {
            console.log('[Blog Seed] ✓ All blog posts already exist')
        }

        // Log total count
        const allPosts = await Blog.find({}).toArray()
        console.log(`[Blog Seed] Total blog posts: ${allPosts.length}`)

    } catch (error: any) {
        console.error('[Blog Seed] Error seeding blog posts:', error?.message || error)
    }
})
