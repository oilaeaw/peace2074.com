import { defineEventHandler, readBody } from 'h3'
import { getMongoose } from '../../utils/mongoose'
import { BlogLikeModel } from '../../models/BlogLike'
import { requireAuth } from '../../utils/auth'

/**
 * POST /api/blog/likes
 * Toggle like for a blog post (requires authentication)
 */
export default defineEventHandler(async (event) => {
    try {
        const session = requireAuth(event)
        const userId = session.id

        const body = await readBody(event)
        const { slug } = body

        if (!slug || typeof slug !== 'string') {
            return {
                ok: false,
                error: 'Slug is required'
            }
        }

        await getMongoose()

        const existingLike = await BlogLikeModel.findOne({ slug, userId }).lean()

        if (existingLike) {
            // Unlike
            await BlogLikeModel.findByIdAndDelete((existingLike as any)._id)
            const count = await BlogLikeModel.countDocuments({ slug })

            return {
                ok: true,
                liked: false,
                count
            }
        } else {
            // Like
            await BlogLikeModel.create({ slug, userId })
            const count = await BlogLikeModel.countDocuments({ slug })

            return {
                ok: true,
                liked: true,
                count
            }
        }
    } catch (err: any) {
        console.error('[Blog Likes POST] Error:', err)

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
