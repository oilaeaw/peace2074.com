import { getDb } from './realdb'

export interface ReaderStat {
    id?: string
    userId: string
    sura: number
    timestamp?: string
}

// ── Helpers ──────────────────────────────────────────────────────────────────

async function readerStatsCollection() {
    const db = await getDb()
    return db.collection<ReaderStat>('readerStats')
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Record a reading event for a specific surah.
 */
export async function recordReaderStat(userId: string, sura: number): Promise<ReaderStat | null> {
    try {
        const stats = await readerStatsCollection()
        const created = await stats.insert({ userId, sura, timestamp: new Date().toISOString() })
        return created as unknown as ReaderStat
    } catch (e) {
        console.error('Failed to record reader stat:', e)
        return null
    }
}

/**
 * Get all reading stats for a user, newest first.
 */
export async function getUserReaderStats(userId: string): Promise<ReaderStat[]> {
    try {
        const stats = await readerStatsCollection()
        return await stats.find({
            filter: [{ field: 'userId', op: 'eq', value: userId }],
            sort: [{ field: 'timestamp', direction: 'desc' }],
        }) as unknown as ReaderStat[]
    } catch (e) {
        console.error('Failed to get user reader stats:', e)
        return []
    }
}

/**
 * Get reading stats for a specific surah, newest first.
 */
export async function getSurahReaderStats(sura: number): Promise<ReaderStat[]> {
    try {
        const stats = await readerStatsCollection()
        return await stats.find({
            filter: [{ field: 'sura', op: 'eq', value: sura }],
            sort: [{ field: 'timestamp', direction: 'desc' }],
        }) as unknown as ReaderStat[]
    } catch (e) {
        console.error('Failed to get surah reader stats:', e)
        return []
    }
}

/**
 * Get reading stats within a date range (ISO string comparison).
 */
export async function getReaderStatsByDateRange(
    userId: string,
    startDate: Date,
    endDate: Date
): Promise<ReaderStat[]> {
    try {
        const stats = await readerStatsCollection()
        const all = await stats.find({
            filter: [{ field: 'userId', op: 'eq', value: userId }],
            sort: [{ field: 'timestamp', direction: 'desc' }],
        }) as unknown as ReaderStat[]

        const start = startDate.toISOString()
        const end = endDate.toISOString()
        return all.filter((s) => s.timestamp && s.timestamp >= start && s.timestamp <= end)
    } catch (e) {
        console.error('Failed to get reader stats by date range:', e)
        return []
    }
}

/**
 * Get aggregated reading statistics for a user.
 */
export async function getUserReadingAnalytics(userId: string) {
    try {
        const all = await getUserReaderStats(userId)

        const totalReadings = all.length
        const uniqueSuras = new Set(all.map((s) => s.sura)).size
        const surahCounts = all.reduce((acc: Record<number, number>, stat) => {
            acc[stat.sura] = (acc[stat.sura] || 0) + 1
            return acc
        }, {})

        const mostRead = Object.entries(surahCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10)
            .map(([sura, count]) => ({ sura: Number(sura), count }))

        return { totalReadings, uniqueSuras, mostRead, surahCounts }
    } catch (e) {
        console.error('Failed to get user reading analytics:', e)
        return null
    }
}

/**
 * Get global stats used by public stats endpoint.
 */
export async function getReaderStatsCounts(since?: Date): Promise<{ week: number; total: number; activeUserIds: string[] }> {
    try {
        const stats = await readerStatsCollection()
        const all = await stats.findAll() as unknown as ReaderStat[]
        const total = all.length
        const sinceIso = since?.toISOString()
        const weekRows = sinceIso ? all.filter((s) => s.timestamp && s.timestamp >= sinceIso) : all
        const activeUserIds = [...new Set(weekRows.map((s) => s.userId))]
        return { week: weekRows.length, total, activeUserIds }
    } catch (e) {
        console.error('Failed to get reader stats counts:', e)
        return { week: 0, total: 0, activeUserIds: [] }
    }
}

/**
 * Delete old reading stats (cleanup utility).
 */
export async function deleteOldReaderStats(daysOld: number = 365): Promise<number> {
    try {
        const cutoff = new Date()
        cutoff.setDate(cutoff.getDate() - daysOld)
        const cutoffIso = cutoff.toISOString()

        const stats = await readerStatsCollection()
        return await stats.deleteMany({
            filter: [{ field: 'timestamp', op: 'lt', value: cutoffIso }],
        })
    } catch (e) {
        console.error('Failed to delete old reader stats:', e)
        return 0
    }
}

/**
 * Delete all reader stats for a user (used when deleting a user account).
 */
export async function deleteReaderStatsByUserId(userId: string): Promise<void> {
    try {
        const stats = await readerStatsCollection()
        await stats.deleteMany({ filter: [{ field: 'userId', op: 'eq', value: userId }] })
    } catch (e) {
        console.error('Failed to delete reader stats for user:', e)
    }
}
