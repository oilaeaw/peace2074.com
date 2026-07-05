import { defineEventHandler } from 'h3'
import { readSession } from '../../utils/auth'
import { getDb } from '../../utils/realdb'

interface QuranProgress {
    userId: string
    completedSuras: number[]
    lastUpdated: string
}

export default defineEventHandler(async (event) => {
    try {
        const session = await readSession(event)

        if (!session?.userId) {
            return { ok: false, completedSuras: [], message: 'Not authenticated' }
        }

        const db = await getDb()
        const progress = db.collection<QuranProgress>('quranProgress')

        const results = await progress.find({
            filter: [{ field: 'userId', op: 'eq', value: session.userId }],
        })

        return {
            ok: true,
            completedSuras: results[0]?.completedSuras ?? [],
            lastUpdated: results[0]?.lastUpdated ?? null,
        }
    } catch (error: any) {
        console.error('Failed to fetch Quran progress:', error)
        return { ok: false, completedSuras: [], error: error?.message || 'Failed to fetch progress' }
    }
})
