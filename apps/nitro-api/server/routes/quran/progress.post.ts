import { defineEventHandler, readBody } from 'h3'
import { requireAuth } from '../../utils/auth'
import { getMongoose } from '../../utils/mongoose'
import { QuranProgressModel } from '../../models/QuranProgress'

export default defineEventHandler(async (event) => {
    try {
        const { userId } = await requireAuth(event)
        const body = await readBody(event)

        const completedSuras = Array.isArray(body.completedSuras)
            ? body.completedSuras.filter((id: any) => typeof id === 'number')
            : []

        await getMongoose()

        const progress = await QuranProgressModel.findOneAndUpdate(
            { userId },
            { completedSuras, lastUpdated: new Date() },
            { upsert: true, new: true }
        ).lean() as any

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

