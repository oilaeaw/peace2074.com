import { defineEventHandler } from 'h3'
import { getMongoose } from '../../utils/mongoose'
import { BlogLikeModel } from '../../models/BlogLike'
import { readSession } from '../../utils/auth'

/**
 * GET /api/blog/likes
 * Returns like counts for all blog posts and user's liked posts
 */
export default defineEventHandler(async (event) => {
    try {
        await getMongoose()

        const session = readSession(event)
        const userId = session?.id

        // Get all likes grouped by slug
        const grouped = await BlogLikeModel.aggregate([
            { $group: { _id: '$slug', count: { $sum: 1 } } }
        ])

        const likeCounts = grouped.reduce((acc: Record<string, number>, item: any) => {
            acc[item._id] = item.count
            return acc
        }, {})

        // Get user's liked posts if authenticated
        let userLiked: string[] = []
        if (userId) {
            const userLikes = await BlogLikeModel.find({ userId }, { slug: 1 }).lean()
            userLiked = userLikes.map((l: any) => l.slug)
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
