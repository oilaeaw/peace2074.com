import { defineEventHandler } from 'h3'
import { readSession } from '../../utils/auth'
import { getMongoose } from '../../utils/mongoose'
import { QuranProgressModel } from '../../models/QuranProgress'

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

        await getMongoose()

        const progress = await QuranProgressModel.findOne(
            { userId: session.userId },
            { completedSuras: 1, lastUpdated: 1 }
        ).lean()

        return {
            ok: true,
            completedSuras: (progress as any)?.completedSuras || [],
            lastUpdated: (progress as any)?.lastUpdated || null
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

