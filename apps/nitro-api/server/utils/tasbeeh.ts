import { getPrisma } from './prisma'
import { updateTasbeehSummary } from './profile'

let prisma: any = null

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

async function isPrismaReady(): Promise<boolean> {
    if (prisma) return true
    prisma = await getPrisma()
    return !!prisma
}

export async function getTasbeehByUserId(userId: string): Promise<TasbeehRecord | null> {
    if (await isPrismaReady()) {
        try {
            const tasbeeh = await prisma.tasbeeh.findFirst({
                where: { userId }
            })
            return tasbeeh
        } catch (e) {
            console.error('Failed to get tasbeeh from Prisma:', e)
        }
    }
    return null
}

export async function createTasbeehRecord(userId: string): Promise<TasbeehRecord | null> {
    if (await isPrismaReady()) {
        try {
            const created = await prisma.tasbeeh.create({
                data: {
                    userId,
                    daily: [],
                    sessions: []
                }
            })
            return created
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

    if (await isPrismaReady()) {
        try {
            await prisma.tasbeeh.updateMany({
                where: { userId },
                data: { daily: dailyArray }
            })

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

    if (await isPrismaReady()) {
        try {
            await prisma.tasbeeh.updateMany({
                where: { userId },
                data: { sessions }
            })

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
