import { getPrisma } from './prisma'

let prisma: any = null

export interface ReaderStat {
    id?: string
    userId: string
    sura: number
    timestamp?: Date
}

async function isPrismaReady(): Promise<boolean> {
    if (prisma) return true
    prisma = await getPrisma()
    return !!prisma
}

/**
 * Record a reading event for a specific surah
 */
export async function recordReaderStat(userId: string, sura: number): Promise<ReaderStat | null> {
    if (await isPrismaReady()) {
        try {
            const stat = await prisma.readerStats.create({
                data: {
                    userId,
                    sura,
                    timestamp: new Date()
                }
            })
            return stat
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
    if (await isPrismaReady()) {
        try {
            const stats = await prisma.readerStats.findMany({
                where: { userId },
                orderBy: { timestamp: 'desc' }
            })
            return stats
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
    if (await isPrismaReady()) {
        try {
            const stats = await prisma.readerStats.findMany({
                where: { sura },
                orderBy: { timestamp: 'desc' }
            })
            return stats
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
    if (await isPrismaReady()) {
        try {
            const stats = await prisma.readerStats.findMany({
                where: {
                    userId,
                    timestamp: {
                        gte: startDate,
                        lte: endDate
                    }
                },
                orderBy: { timestamp: 'desc' }
            })
            return stats
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
    if (await isPrismaReady()) {
        try {
            const stats = await prisma.readerStats.findMany({
                where: { userId }
            })

            // Calculate analytics
            const totalReadings = stats.length
            const uniqueSuras = new Set(stats.map((s: ReaderStat) => s.sura)).size
            const surahCounts = stats.reduce((acc: any, stat: ReaderStat) => {
                acc[stat.sura] = (acc[stat.sura] || 0) + 1
                return acc
            }, {})

            // Get most read surahs
            const mostRead = Object.entries(surahCounts)
                .sort(([, a]: any, [, b]: any) => b - a)
                .slice(0, 10)
                .map(([sura, count]) => ({ sura: Number(sura), count }))

            return {
                totalReadings,
                uniqueSuras,
                mostRead,
                surahCounts
            }
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
    if (await isPrismaReady()) {
        try {
            const cutoffDate = new Date()
            cutoffDate.setDate(cutoffDate.getDate() - daysOld)

            const result = await prisma.readerStats.deleteMany({
                where: {
                    timestamp: {
                        lt: cutoffDate
                    }
                }
            })
            return result.count
        } catch (e) {
            console.error('Failed to delete old reader stats:', e)
        }
    }
    return 0
}
