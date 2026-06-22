import { ReaderStatsModel } from '../models/ReaderStats'
import { getOfflineRecitationDownloadStats } from './offline-download-stats'
import { getMongoose } from './mongoose'

export interface Peace2074PublicStats {
    downloadsWeek: number
    downloadsTotal: number
    offlineDownloadsWeek: number
    offlineDownloadsTotal: number
    quranReadsWeek: number
    quranReadsTotal: number
    activeUsersWeek: number
}

function weekAgoDate(): Date {
    const date = new Date()
    date.setUTCDate(date.getUTCDate() - 7)
    return date
}

export async function getPeace2074PublicStats(): Promise<Peace2074PublicStats> {
    const offline = await getOfflineRecitationDownloadStats()

    let quranReadsWeek = 0
    let quranReadsTotal = 0
    let activeUsersWeek = 0

    try {
        await getMongoose()
        const since = weekAgoDate()
        const [readsWeek, readsTotal, activeUsers] = await Promise.all([
            ReaderStatsModel.countDocuments({ timestamp: { $gte: since } }),
            ReaderStatsModel.countDocuments({}),
            ReaderStatsModel.distinct('userId', { timestamp: { $gte: since } }),
        ])
        quranReadsWeek = readsWeek
        quranReadsTotal = readsTotal
        activeUsersWeek = activeUsers.length
    } catch (err) {
        console.error('[Peace2074 Public Stats] Reader stats fetch failed:', err)
    }

    const downloadsWeek = offline.downloadsWeek + quranReadsWeek
    const downloadsTotal = offline.downloadsTotal + quranReadsTotal

    return {
        downloadsWeek,
        downloadsTotal,
        offlineDownloadsWeek: offline.downloadsWeek,
        offlineDownloadsTotal: offline.downloadsTotal,
        quranReadsWeek,
        quranReadsTotal,
        activeUsersWeek,
    }
}
