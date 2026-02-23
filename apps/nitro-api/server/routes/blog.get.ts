import { defineEventHandler, getQuery } from 'h3'
import { getPrisma } from '../utils/prisma'

/**
 * GET /api/blog
 * Returns all blog posts or a single post by slug
 */
export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const { slug } = query

    try {
        const prisma = await getPrisma()

        if (!prisma) {
            return { ok: false, error: 'Database not available' }
        }

        // Get single post by slug
        if (slug && typeof slug === 'string') {
            const post = await prisma.blogPost.findUnique({ where: { slug } })
            if (!post) {
                return { ok: false, error: 'Post not found' }
            }
            return { ok: true, post }
        }

        // Get all posts, sorted by date descending
        const posts = await prisma.blogPost.findMany({
            orderBy: { date: 'desc' }
        })

        return { ok: true, posts }
    } catch (err: any) {
        console.error('[Blog GET] Error:', err)
        return { ok: false, error: err?.message || 'Failed to fetch posts' }
    }
})
