import { OfflineDownloadDailyModel } from '../models/OfflineDownloadDaily'
import { getMongoose } from './mongoose'

function formatUtcDate(date: Date): string {
    return date.toISOString().slice(0, 10)
}

function rollingWeekDates(endDate = new Date()): string[] {
    const dates: string[] = []
    for (let offset = 0; offset < 7; offset += 1) {
        const day = new Date(endDate)
        day.setUTCDate(endDate.getUTCDate() - offset)
        dates.push(formatUtcDate(day))
    }
    return dates
}

export async function recordOfflineRecitationDownload(): Promise<boolean> {
    try {
        await getMongoose()
        const today = formatUtcDate(new Date())
        await OfflineDownloadDailyModel.findOneAndUpdate(
            { date: today },
            { $inc: { count: 1 } },
            { upsert: true, new: true }
        )
        return true
    } catch (err) {
        console.error('[Offline Download Stats] Record failed:', err)
        return false
    }
}

export async function getOfflineRecitationDownloadStats(): Promise<{
    downloadsWeek: number
    downloadsTotal: number
}> {
    try {
        await getMongoose()
        const weekDates = rollingWeekDates()
        const [weeklyRows, totalAgg] = await Promise.all([
            OfflineDownloadDailyModel.find({ date: { $in: weekDates } }, { date: 1, count: 1 }).lean(),
            OfflineDownloadDailyModel.aggregate([{ $group: { _id: null, total: { $sum: '$count' } } }]),
        ])

        const downloadsWeek = weeklyRows.reduce(
            (sum, row) => sum + Number((row as { count?: number }).count || 0),
            0
        )
        const downloadsTotal = Number(totalAgg[0]?.total || 0)

        return { downloadsWeek, downloadsTotal }
    } catch (err) {
        console.error('[Offline Download Stats] Fetch failed:', err)
        return { downloadsWeek: 0, downloadsTotal: 0 }
    }
}
