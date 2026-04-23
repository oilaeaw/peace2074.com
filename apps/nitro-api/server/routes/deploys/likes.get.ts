import { defineEventHandler } from 'h3'
import { getMongoose } from '../../utils/mongoose'
import { DeployLikeModel } from '../../models/DeployLike'
import { readSession } from '../../utils/auth'

/**
 * GET /api/deploys/likes
 * Returns like counts for all deployments and user's liked versions
 */
export default defineEventHandler(async (event) => {
    try {
        await getMongoose()

        const session = readSession(event)
        const userId = session?.id

        const grouped = await DeployLikeModel.aggregate([
            { $group: { _id: '$version', count: { $sum: 1 } } }
        ])

        const likeCounts = grouped.reduce((acc: Record<string, number>, item: any) => {
            acc[item._id] = item.count
            return acc
        }, {})

        let userLiked: string[] = []
        if (userId) {
            const userLikes = await DeployLikeModel.find({ userId }, { version: 1 }).lean()
            userLiked = userLikes.map((l: any) => l.version)
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
