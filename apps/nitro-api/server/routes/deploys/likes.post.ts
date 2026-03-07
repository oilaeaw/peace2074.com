import { defineEventHandler, readBody } from 'h3'
import { getPrisma } from '../../utils/prisma'
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

        const prisma = await getPrisma()
        if (!prisma) {
            return { ok: false, error: 'Database unavailable' }
        }

        // Check if like exists
        const existingLike = await prisma.deployLike.findUnique({
            where: {
                version_userId: {
                    version,
                    userId
                }
            }
        })

        if (existingLike) {
            // Unlike - remove the like
            await prisma.deployLike.delete({
                where: { id: existingLike.id }
            })

            // Get updated count
            const count = await prisma.deployLike.count({
                where: { version }
            })

            return {
                ok: true,
                liked: false,
                count
            }
        } else {
            // Like - add the like
            await prisma.deployLike.create({
                data: {
                    version,
                    userId
                }
            })

            // Get updated count
            const count = await prisma.deployLike.count({
                where: { version }
            })

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
