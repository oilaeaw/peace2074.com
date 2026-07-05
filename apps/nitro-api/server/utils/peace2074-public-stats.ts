import { getReaderStatsCounts } from './reader-stats'
import { getOfflineRecitationDownloadStats } from './offline-download-stats'

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
    const [offline, readerCounts] = await Promise.all([
        getOfflineRecitationDownloadStats(),
        getReaderStatsCounts(weekAgoDate()).catch(() => ({ week: 0, total: 0, activeUserIds: [] as string[] })),
    ])

    const quranReadsWeek = readerCounts.week
    const quranReadsTotal = readerCounts.total
    const activeUsersWeek = readerCounts.activeUserIds.length

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
