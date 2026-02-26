import { getPrisma } from './prisma'

let prisma: any = null

export interface Profile {
    id?: string
    userId: string
    first_name?: string
    last_name?: string
    avatar_url?: string
    github_id?: string
    bookmarks?: any[]
    settings?: any
    tasbeeh_summary?: {
        total: number
        sessions: number
    }
}

async function isPrismaReady(): Promise<boolean> {
    if (prisma) return true
    prisma = await getPrisma()
    return !!prisma
}

export async function getProfile(userId: string): Promise<Profile | null> {
    if (await isPrismaReady()) {
        try {
            const profile = await prisma.profile.findUnique({
                where: { userId }
            })
            return profile
        } catch (e) {
            console.error('Failed to get profile from Prisma:', e)
        }
    }
    return null
}

export async function createProfile(profile: Profile): Promise<Profile | null> {
    if (await isPrismaReady()) {
        try {
            const created = await prisma.profile.create({
                data: {
                    userId: profile.userId,
                    first_name: profile.first_name,
                    last_name: profile.last_name,
                    avatar_url: profile.avatar_url,
                    github_id: profile.github_id,
                    bookmarks: profile.bookmarks || [],
                    settings: profile.settings || {},
                    tasbeeh_summary: profile.tasbeeh_summary || { total: 0, sessions: 0 }
                }
            })
            return created
        } catch (e) {
            console.error('Failed to create profile:', e)
        }
    }
    return null
}

export async function updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile | null> {
    if (await isPrismaReady()) {
        try {
            const updated = await prisma.profile.update({
                where: { userId },
                data: updates
            })
            return updated
        } catch (e) {
            console.error('Failed to update profile:', e)
        }
    }
    return null
}

export async function getBookmarks(userId: string): Promise<any[]> {
    const profile = await getProfile(userId)
    return profile?.bookmarks || []
}

export async function addBookmark(userId: string, bookmark: string): Promise<any | null> {
    const profile = await getProfile(userId)
    if (!profile) return null

    const bookmarks = Array.isArray(profile.bookmarks) ? [...profile.bookmarks] : []
    const existing = bookmarks.find((b: any) => b.bookmark === bookmark)
    if (existing) return existing

    const newBookmark = {
        _id: `bm_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        bookmark,
        createdAt: new Date().toISOString()
    }

    bookmarks.push(newBookmark)
    await updateProfile(userId, { bookmarks })
    return newBookmark
}

export async function removeBookmark(userId: string, bookmarkId: string): Promise<boolean> {
    const profile = await getProfile(userId)
    if (!profile) return false

    const bookmarks = Array.isArray(profile.bookmarks) ? [...profile.bookmarks] : []
    const filtered = bookmarks.filter((b: any) => b._id !== bookmarkId)

    if (filtered.length === bookmarks.length) return false

    await updateProfile(userId, { bookmarks: filtered })
    return true
}

export async function updateTasbeehSummary(userId: string, increment: number, sessionComplete: boolean = false): Promise<void> {
    const profile = await getProfile(userId)
    if (!profile) return

    const summary = profile.tasbeeh_summary || { total: 0, sessions: 0 }
    summary.total += increment
    if (sessionComplete) {
        summary.sessions += 1
    }

    await updateProfile(userId, { tasbeeh_summary: summary })
}
