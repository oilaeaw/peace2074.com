import { defineEventHandler, readBody } from 'h3'
import { getMongoose } from '../../utils/mongoose'
import { DeployLikeModel } from '../../models/DeployLike'
import { requireAuth } from '../../utils/auth'

/**
 * POST /api/deploys/likes
 * Toggle like for a deployment version (requires authentication)
 */
export default defineEventHandler(async (event) => {
    try {
        const session = requireAuth(event)
        const userId = session.id

        const body = await readBody(event)
        const { version } = body

        if (!version || typeof version !== 'string') {
            return {
                ok: false,
                error: 'Version is required'
            }
        }

        await getMongoose()

        const existingLike = await DeployLikeModel.findOne({ version, userId }).lean()

        if (existingLike) {
            await DeployLikeModel.findByIdAndDelete((existingLike as any)._id)
            const count = await DeployLikeModel.countDocuments({ version })
            return { ok: true, liked: false, count }
        } else {
            await DeployLikeModel.create({ version, userId })
            const count = await DeployLikeModel.countDocuments({ version })

            return {
                ok: true,
                liked: true,
                count
            }
        }
    } catch (err: any) {
        console.error('[Deploys Likes POST] Error:', err)

        // Handle auth errors
        if (err.statusCode === 401) {
            return {
                ok: false,
                error: 'Authentication required',
                authRequired: true
            }
        }

        return {
            ok: false,
            error: err?.message || 'Failed to toggle like'
        }
    }
})
