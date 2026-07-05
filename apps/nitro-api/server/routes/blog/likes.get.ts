import { defineEventHandler } from 'h3'
import { getDb } from '../../utils/realdb'
import { readSession } from '../../utils/auth'

interface BlogLike {
    slug: string
    userId: string
}

/**
 * GET /api/blog/likes
 * Returns like counts for all blog posts and user's liked posts
 */
export default defineEventHandler(async (event) => {
    try {
        const session = readSession(event)
        const userId = session?.id

        const db = await getDb()
        const likes = db.collection<BlogLike>('blogLikes')
        const allLikes = await likes.findAll()

        // Group by slug
        const likeCounts: Record<string, number> = {}
        for (const like of allLikes) {
            likeCounts[like.slug] = (likeCounts[like.slug] ?? 0) + 1
        }

        // Get user's liked posts if authenticated
        let userLiked: string[] = []
        if (userId) {
            userLiked = allLikes
                .filter((l) => l.userId === userId)
                .map((l) => l.slug)
        }

        return { ok: true, likeCounts, userLiked }
    } catch (err: any) {
        console.error('[Blog Likes GET] Error:', err)
        return { ok: false, error: err?.message || 'Failed to fetch likes' }
    }
})
