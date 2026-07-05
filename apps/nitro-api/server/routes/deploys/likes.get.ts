import { defineEventHandler } from 'h3'
import { getDb } from '../../utils/realdb'
import { readSession } from '../../utils/auth'

interface DeployLike {
    version: string
    userId: string
}

/**
 * GET /api/deploys/likes
 * Returns like counts for all deployments and user's liked versions
 */
export default defineEventHandler(async (event) => {
    try {
        const session = readSession(event)
        const userId = session?.id

        const db = await getDb()
        const likes = db.collection<DeployLike>('deployLikes')
        const allLikes = await likes.findAll()

        // Group by version
        const likeCounts: Record<string, number> = {}
        for (const like of allLikes) {
            likeCounts[like.version] = (likeCounts[like.version] ?? 0) + 1
        }

        let userLiked: string[] = []
        if (userId) {
            userLiked = allLikes
                .filter((l) => l.userId === userId)
                .map((l) => l.version)
        }

        return { ok: true, likeCounts, userLiked }
    } catch (err: any) {
        console.error('[Deploys Likes GET] Error:', err)
        return { ok: false, error: err?.message || 'Failed to fetch likes' }
    }
})
