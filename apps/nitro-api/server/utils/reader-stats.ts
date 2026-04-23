import { getMongoose } from './mongoose'
import { ReaderStatsModel } from '../models/ReaderStats'

export interface ReaderStat {
    id?: string
    userId: string
    sura: number
    timestamp?: Date
}

async function isDbReady(): Promise<boolean> {
    try {
        await getMongoose()
        return true
    } catch {
        return false
    }
}

/**
 * Record a reading event for a specific surah
 */
export async function recordReaderStat(userId: string, sura: number): Promise<ReaderStat | null> {
    if (await isDbReady()) {
        try {
            const stat = await ReaderStatsModel.create({ userId, sura, timestamp: new Date() })
            return stat.toObject() as any
        } catch (e) {
            console.error('Failed to record reader stat:', e)
        }
    }
    return null
}

/**
 * Get all reading stats for a user
 */
export async function getUserReaderStats(userId: string): Promise<ReaderStat[]> {
    if (await isDbReady()) {
        try {
            const stats = await ReaderStatsModel.find({ userId }).sort({ timestamp: -1 }).lean()
            return stats as any[]
        } catch (e) {
            console.error('Failed to get user reader stats:', e)
        }
    }
    return []
}

/**
 * Get reading stats for a specific surah
 */
export async function getSurahReaderStats(sura: number): Promise<ReaderStat[]> {
    if (await isDbReady()) {
        try {
            const stats = await ReaderStatsModel.find({ sura }).sort({ timestamp: -1 }).lean()
            return stats as any[]
        } catch (e) {
            console.error('Failed to get surah reader stats:', e)
        }
    }
    return []
}

/**
 * Get reading stats within a date range
 */
export async function getReaderStatsByDateRange(
    userId: string,
    startDate: Date,
    endDate: Date
): Promise<ReaderStat[]> {
    if (await isDbReady()) {
        try {
            const stats = await ReaderStatsModel.find({
                userId,
                timestamp: { $gte: startDate, $lte: endDate },
            })
                .sort({ timestamp: -1 })
                .lean()
            return stats as any[]
        } catch (e) {
            console.error('Failed to get reader stats by date range:', e)
        }
    }
    return []
}

/**
 * Get aggregated reading statistics for a user
 */
export async function getUserReadingAnalytics(userId: string) {
    if (await isDbReady()) {
        try {
            const stats = await ReaderStatsModel.find({ userId }).lean()

            const totalReadings = stats.length
            const uniqueSuras = new Set(stats.map((s: any) => s.sura)).size
            const surahCounts = stats.reduce((acc: any, stat: any) => {
                acc[stat.sura] = (acc[stat.sura] || 0) + 1
                return acc
            }, {})

            const mostRead = Object.entries(surahCounts)
                .sort(([, a]: any, [, b]: any) => b - a)
                .slice(0, 10)
                .map(([sura, count]) => ({ sura: Number(sura), count }))

            return { totalReadings, uniqueSuras, mostRead, surahCounts }
        } catch (e) {
            console.error('Failed to get user reading analytics:', e)
        }
    }
    return null
}

/**
 * Delete old reading stats (optional cleanup utility)
 */
export async function deleteOldReaderStats(daysOld: number = 365): Promise<number> {
    if (await isDbReady()) {
        try {
            const cutoffDate = new Date()
            cutoffDate.setDate(cutoffDate.getDate() - daysOld)
            const result = await ReaderStatsModel.deleteMany({ timestamp: { $lt: cutoffDate } })
            return result.deletedCount ?? 0
        } catch (e) {
            console.error('Failed to delete old reader stats:', e)
        }
    }
    return 0
}
