import { defineEventHandler, readBody } from 'h3'
import { getPrisma } from '../../utils/prisma'
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

        const prisma = await getPrisma()
        if (!prisma) {
            return { ok: false, error: 'Database unavailable' }
        }

        // Check if like exists
        const existingLike = await prisma.blogLike.findUnique({
            where: {
                slug_userId: {
                    slug,
                    userId
                }
            }
        })

        if (existingLike) {
            // Unlike - remove the like
            await prisma.blogLike.delete({
                where: { id: existingLike.id }
            })

            // Get updated count
            const count = await prisma.blogLike.count({
                where: { slug }
            })

            return {
                ok: true,
                liked: false,
                count
            }
        } else {
            // Like - add the like
            await prisma.blogLike.create({
                data: {
                    slug,
                    userId
                }
            })

            // Get updated count
            const count = await prisma.blogLike.count({
                where: { slug }
            })

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
