import { defineEventHandler } from 'h3'
import { readSession } from '../../utils/auth'
import { getPrisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
    try {
        const session = await readSession(event)

        if (!session?.userId) {
            return {
                ok: false,
                completedSuras: [],
                message: 'Not authenticated'
            }
        }

        const prisma = await getPrisma()

        if (!prisma) {
            return {
                ok: false,
                completedSuras: [],
                error: 'Database not available'
            }
        }

        const progress = await prisma.quranProgress.findUnique({
            where: { userId: session.userId },
            select: { completedSuras: true, lastUpdated: true }
        })

        return {
            ok: true,
            completedSuras: progress?.completedSuras || [],
            lastUpdated: progress?.lastUpdated || null
        }
    } catch (error: any) {
        console.error('Failed to fetch Quran progress:', error)
        return {
            ok: false,
            completedSuras: [],
            error: error?.message || 'Failed to fetch progress'
        }
    }
})

