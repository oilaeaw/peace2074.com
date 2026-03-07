import { defineEventHandler, getQuery } from 'h3'
import { getPrisma } from '../../utils/prisma'
import { readSession } from '../../utils/auth'

/**
 * GET /api/deploys/likes
 * Returns like counts for all deployments and user's liked versions
 */
export default defineEventHandler(async (event) => {
    try {
        const prisma = await getPrisma()
        if (!prisma) {
            return { ok: false, error: 'Database unavailable' }
        }

        const session = readSession(event)
        const userId = session?.id

        // Get all likes grouped by version
        const likes = await prisma.deployLike.groupBy({
            by: ['version'],
            _count: {
                version: true
            }
        })

        const likeCounts = likes.reduce((acc, item) => {
            acc[item.version] = item._count.version
            return acc
        }, {} as Record<string, number>)

        // Get user's liked versions if authenticated
        let userLiked: string[] = []
        if (userId) {
            const userLikes = await prisma.deployLike.findMany({
                where: { userId },
                select: { version: true }
            })
            userLiked = userLikes.map(l => l.version)
        }

        return {
            ok: true,
            likeCounts,
            userLiked
        }
    } catch (err: any) {
        console.error('[Deploys Likes GET] Error:', err)
        return {
            ok: false,
            error: err?.message || 'Failed to fetch likes'
        }
    }
})
