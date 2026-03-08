import { defineEventHandler, readBody } from 'h3'
import { requireAuth } from '../../utils/auth'
import { getPrisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
    try {
        const { userId } = await requireAuth(event)
        const body = await readBody(event)

        const completedSuras = Array.isArray(body.completedSuras)
            ? body.completedSuras.filter((id: any) => typeof id === 'number')
            : []

        const prisma = await getPrisma()

        if (!prisma) {
            return {
                ok: false,
                error: 'Database not available'
            }
        }

        const progress = await prisma.quranProgress.upsert({
            where: { userId },
            update: {
                completedSuras,
                lastUpdated: new Date()
            },
            create: {
                userId,
                completedSuras,
                lastUpdated: new Date()
            }
        })

        return {
            ok: true,
            completedSuras: progress.completedSuras,
            lastUpdated: progress.lastUpdated
        }
    } catch (error: any) {
        if (error?.statusCode === 401) {
            return {
                ok: false,
                authRequired: true,
                message: 'Authentication required'
            }
        }

        console.error('Failed to save Quran progress:', error)
        return {
            ok: false,
            error: error?.message || 'Failed to save progress'
        }
    }
})

