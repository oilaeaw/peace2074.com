import { getDb } from './realdb'
import { updateTasbeehSummary } from './profile'

export interface TasbeehSession {
    phraseIndex: number
    count: number
    target: number
    completedAt: string
}

export interface TasbeehDaily {
    date: string
    total: number
    sessions: number
}

export interface TasbeehRecord {
    id?: string
    userId: string
    daily?: TasbeehDaily[]
    sessions?: TasbeehSession[]
}

// ── Helpers ──────────────────────────────────────────────────────────────────

async function tasbeehCollection() {
    const db = await getDb()
    return db.collection<TasbeehRecord>('tasbeeh')
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function getTasbeehByUserId(userId: string): Promise<TasbeehRecord | null> {
    try {
        const tasbeeh = await tasbeehCollection()
        const results = await tasbeeh.find({
            filter: [{ field: 'userId', op: 'eq', value: userId }],
        })
        return results[0] ?? null
    } catch (e) {
        console.error('Failed to get tasbeeh:', e)
        return null
    }
}

export async function createTasbeehRecord(userId: string): Promise<TasbeehRecord | null> {
    try {
        const tasbeeh = await tasbeehCollection()
        const created = await tasbeeh.insert({ userId, daily: [], sessions: [] })
        return created as unknown as TasbeehRecord
    } catch (e) {
        console.error('Failed to create tasbeeh record:', e)
        return null
    }
}

export async function addTasbeehDaily(userId: string, daily: TasbeehDaily): Promise<boolean> {
    let record = await getTasbeehByUserId(userId)
    if (!record) {
        record = await createTasbeehRecord(userId)
        if (!record) return false
    }

    const dailyArray = Array.isArray(record.daily) ? [...record.daily] : []
    const existingIndex = dailyArray.findIndex((d) => d.date === daily.date)
    const prevTotal = existingIndex >= 0 ? dailyArray[existingIndex].total : 0

    if (existingIndex >= 0) {
        dailyArray[existingIndex] = daily
    } else {
        dailyArray.push(daily)
    }

    // Keep last 30 days
    if (dailyArray.length > 30) {
        dailyArray.splice(0, dailyArray.length - 30)
    }

    try {
        const tasbeeh = await tasbeehCollection()
        await tasbeeh.update(record.id!, { daily: dailyArray })
        await updateTasbeehSummary(userId, daily.total - prevTotal, false)
        return true
    } catch (e) {
        console.error('Failed to update tasbeeh daily:', e)
        return false
    }
}

export async function addTasbeehSession(userId: string, session: TasbeehSession): Promise<boolean> {
    let record = await getTasbeehByUserId(userId)
    if (!record) {
        record = await createTasbeehRecord(userId)
        if (!record) return false
    }

    const sessions = Array.isArray(record.sessions) ? [...record.sessions] : []
    sessions.push(session)

    // Keep last 100 sessions
    if (sessions.length > 100) {
        sessions.splice(0, sessions.length - 100)
    }

    try {
        const tasbeeh = await tasbeehCollection()
        await tasbeeh.update(record.id!, { sessions })
        await updateTasbeehSummary(userId, session.count, true)
        return true
    } catch (e) {
        console.error('Failed to update tasbeeh session:', e)
        return false
    }
}

export async function getTasbeehDaily(userId: string): Promise<TasbeehDaily[]> {
    const record = await getTasbeehByUserId(userId)
    return record?.daily ?? []
}

export async function getTasbeehSessions(userId: string, limit: number = 10): Promise<TasbeehSession[]> {
    const record = await getTasbeehByUserId(userId)
    const sessions = record?.sessions ?? []
    return sessions.slice(-limit)
}

export async function deleteTasbeehByUserId(userId: string): Promise<void> {
    try {
        const tasbeeh = await tasbeehCollection()
        await tasbeeh.deleteMany({
            filter: [{ field: 'userId', op: 'eq', value: userId }],
        })
    } catch (e) {
        console.error('Failed to delete tasbeeh:', e)
    }
}
