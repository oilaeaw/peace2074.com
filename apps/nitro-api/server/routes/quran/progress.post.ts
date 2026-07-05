import { defineEventHandler, readBody } from 'h3'
import { requireAuth } from '../../utils/auth'
import { getDb } from '../../utils/realdb'

interface QuranProgress {
    userId: string
    completedSuras: number[]
    lastUpdated: string
}

export default defineEventHandler(async (event) => {
    try {
        const { userId } = await requireAuth(event)
        const body = await readBody(event)

        const completedSuras = Array.isArray(body.completedSuras)
            ? body.completedSuras.filter((id: any) => typeof id === 'number')
            : []

        const db = await getDb()
        const progress = db.collection<QuranProgress>('quranProgress')

        const existing = await progress.find({
            filter: [{ field: 'userId', op: 'eq', value: userId }],
        })

        const lastUpdated = new Date().toISOString()

        if (existing[0]?.id) {
            await progress.update(existing[0].id!, { completedSuras, lastUpdated })
        } else {
            await progress.insert({ userId, completedSuras, lastUpdated })
        }

        return { ok: true, completedSuras, lastUpdated }
    } catch (error: any) {
        if (error?.statusCode === 401) {
            return { ok: false, authRequired: true, message: 'Authentication required' }
        }
        console.error('Failed to save Quran progress:', error)
        return { ok: false, error: error?.message || 'Failed to save progress' }
    }
})
