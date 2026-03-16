import { defineEventHandler } from 'h3'
import { getPrisma } from '../../utils/prisma'
import { readSession } from '../../utils/auth'

/**
 * GET /api/blog/likes
 * Returns like counts for all blog posts and user's liked posts
 */
export default defineEventHandler(async (event) => {
    try {
        const prisma = await getPrisma()
        if (!prisma) {
            return { ok: false, error: 'Database unavailable' }
        }

        const session = readSession(event)
        const userId = session?.id

        // Get all likes grouped by slug
        const likes = await prisma.blogLike.groupBy({
            by: ['slug'],
            _count: {
                slug: true
            }
        })

        const likeCounts = likes.reduce((acc, item) => {
            acc[item.slug] = item._count.slug
            return acc
        }, {} as Record<string, number>)

        // Get user's liked posts if authenticated
        let userLiked: string[] = []
        if (userId) {
            const userLikes = await prisma.blogLike.findMany({
                where: { userId },
                select: { slug: true }
            })
            userLiked = userLikes.map(l => l.slug)
        }

        return {
            ok: true,
            likeCounts,
            userLiked
        }
    } catch (err: any) {
        console.error('[Blog Likes GET] Error:', err)
        return {
            ok: false,
            error: err?.message || 'Failed to fetch likes'
        }
    }
})
