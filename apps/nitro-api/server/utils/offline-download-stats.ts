import { getDb } from './realdb'

export interface OfflineDownloadDaily {
    id?: string
    date: string   // YYYY-MM-DD UTC
    count: number
}

// ── Helpers ──────────────────────────────────────────────────────────────────

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

async function offlineCollection() {
    const db = await getDb()
    return db.collection<OfflineDownloadDaily>('offlineDownloads')
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function recordOfflineRecitationDownload(): Promise<boolean> {
    try {
        const col = await offlineCollection()
        const today = formatUtcDate(new Date())
        const results = await col.find({
            filter: [{ field: 'date', op: 'eq', value: today }],
        })

        if (results[0]?.id) {
            await col.update(results[0].id, { count: (results[0].count ?? 0) + 1 })
        } else {
            await col.insert({ date: today, count: 1 })
        }
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
        const col = await offlineCollection()
        const weekDates = rollingWeekDates()
        const all = await col.findAll()

        const downloadsWeek = all
            .filter((row) => weekDates.includes(row.date))
            .reduce((sum, row) => sum + (row.count ?? 0), 0)

        const downloadsTotal = all.reduce((sum, row) => sum + (row.count ?? 0), 0)

        return { downloadsWeek, downloadsTotal }
    } catch (err) {
        console.error('[Offline Download Stats] Fetch failed:', err)
        return { downloadsWeek: 0, downloadsTotal: 0 }
    }
}
