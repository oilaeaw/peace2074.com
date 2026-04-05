import { getPrisma } from '../utils/prisma'

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

        const prisma = await getPrisma()

        if (!prisma) {
            console.warn('[Blog Seed] Prisma not available, skipping blog seeding')
            return
        }

        // Import seed data
        const seedData = await import('../data/blog-seed.json').then(m => m.default)

        // Check which posts need to be seeded
        let seededCount = 0

        for (const post of seedData) {
            const existing = await prisma.blogPost.findUnique({ where: { slug: post.slug } })

            if (!existing) {
                // Add post with dates
                const postData = {
                    id: post.id,
                    slug: post.slug,
                    title: post.title,
                    excerpt: post.excerpt || '',
                    content: post.content,
                    tags: post.tags || [],
                    date: post.date,
                    author: post.author,
                    createdAt: post.createdAt ? new Date(post.createdAt) : new Date(),
                    updatedAt: post.updatedAt ? new Date(post.updatedAt) : new Date(),
                }

                await prisma.blogPost.create({ data: postData })
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
        const total = await prisma.blogPost.count()
        console.log(`[Blog Seed] Total blog posts: ${total}`)

    } catch (error: any) {
        console.error('[Blog Seed] Error seeding blog posts:', error?.message || error)
    }
})
