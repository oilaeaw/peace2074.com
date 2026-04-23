import { getMongoose } from './mongoose'
import { TasbeehModel } from '../models/Tasbeeh'
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
    createdAt?: Date
    updatedAt?: Date
}

async function isDbReady(): Promise<boolean> {
    try {
        await getMongoose()
        return true
    } catch {
        return false
    }
}

export async function getTasbeehByUserId(userId: string): Promise<TasbeehRecord | null> {
    if (await isDbReady()) {
        try {
            const tasbeeh = await TasbeehModel.findOne({ userId }).lean()
            return tasbeeh as any
        } catch (e) {
            console.error('Failed to get tasbeeh:', e)
        }
    }
    return null
}

export async function createTasbeehRecord(userId: string): Promise<TasbeehRecord | null> {
    if (await isDbReady()) {
        try {
            const created = await TasbeehModel.create({ userId, daily: [], sessions: [] })
            return created.toObject() as any
        } catch (e) {
            console.error('Failed to create tasbeeh record:', e)
        }
    }
    return null
}

export async function addTasbeehDaily(userId: string, daily: TasbeehDaily): Promise<boolean> {
    let tasbeeh = await getTasbeehByUserId(userId)

    if (!tasbeeh) {
        tasbeeh = await createTasbeehRecord(userId)
        if (!tasbeeh) return false
    }

    const dailyArray = Array.isArray(tasbeeh.daily) ? [...tasbeeh.daily] : []
    const existingIndex = dailyArray.findIndex((d: TasbeehDaily) => d.date === daily.date)

    if (existingIndex >= 0) {
        dailyArray[existingIndex] = daily
    } else {
        dailyArray.push(daily)
    }

    // Keep last 30 days
    if (dailyArray.length > 30) {
        dailyArray.splice(0, dailyArray.length - 30)
    }

    if (await isDbReady()) {
        try {
            await TasbeehModel.updateOne({ userId }, { $set: { daily: dailyArray } })

            // Update profile summary
            await updateTasbeehSummary(userId, daily.total - (existingIndex >= 0 ? dailyArray[existingIndex].total : 0), false)
            return true
        } catch (e) {
            console.error('Failed to update tasbeeh daily:', e)
        }
    }
    return false
}

export async function addTasbeehSession(userId: string, session: TasbeehSession): Promise<boolean> {
    let tasbeeh = await getTasbeehByUserId(userId)

    if (!tasbeeh) {
        tasbeeh = await createTasbeehRecord(userId)
        if (!tasbeeh) return false
    }

    const sessions = Array.isArray(tasbeeh.sessions) ? [...tasbeeh.sessions] : []
    sessions.push(session)

    // Keep last 100 sessions
    if (sessions.length > 100) {
        sessions.splice(0, sessions.length - 100)
    }

    if (await isDbReady()) {
        try {
            await TasbeehModel.updateOne({ userId }, { $set: { sessions } })

            // Update profile summary
            await updateTasbeehSummary(userId, session.count, true)
            return true
        } catch (e) {
            console.error('Failed to update tasbeeh session:', e)
        }
    }
    return false
}

export async function getTasbeehDaily(userId: string): Promise<TasbeehDaily[]> {
    const tasbeeh = await getTasbeehByUserId(userId)
    return tasbeeh?.daily || []
}

export async function getTasbeehSessions(userId: string, limit: number = 10): Promise<TasbeehSession[]> {
    const tasbeeh = await getTasbeehByUserId(userId)
    const sessions = tasbeeh?.sessions || []
    return sessions.slice(-limit)
}
