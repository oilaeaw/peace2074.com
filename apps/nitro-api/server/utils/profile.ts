import { getDb } from './realdb'

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

// ── Helpers ──────────────────────────────────────────────────────────────────

async function profilesCollection() {
    const db = await getDb()
    return db.collection<Profile>('profiles')
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function getProfile(userId: string): Promise<Profile | null> {
    try {
        const profiles = await profilesCollection()
        const results = await profiles.find({
            filter: [{ field: 'userId', op: 'eq', value: userId }],
        })
        return results[0] ?? null
    } catch (e) {
        console.error('Failed to get profile:', e)
        return null
    }
}

export async function createProfile(profile: Profile): Promise<Profile | null> {
    try {
        const profiles = await profilesCollection()
        const created = await profiles.insert({
            userId: profile.userId,
            first_name: profile.first_name,
            last_name: profile.last_name,
            avatar_url: profile.avatar_url,
            github_id: profile.github_id,
            bookmarks: profile.bookmarks ?? [],
            settings: profile.settings ?? {},
            tasbeeh_summary: profile.tasbeeh_summary ?? { total: 0, sessions: 0 },
        })
        return created as unknown as Profile
    } catch (e) {
        console.error('Failed to create profile:', e)
        return null
    }
}

export async function updateProfile(
    userId: string,
    updates: Partial<Profile>
): Promise<Profile | null> {
    try {
        const profiles = await profilesCollection()
        const existing = await getProfile(userId)

        if (!existing?.id) {
            // Upsert: create if not found
            return await createProfile({ userId, ...updates })
        }

        const updated = await profiles.update(existing.id, updates)
        return updated as unknown as Profile
    } catch (e) {
        console.error('Failed to update profile:', e)
        return null
    }
}

export async function deleteProfileByUserId(userId: string): Promise<void> {
    try {
        const profiles = await profilesCollection()
        await profiles.deleteMany({
            filter: [{ field: 'userId', op: 'eq', value: userId }],
        })
    } catch (e) {
        console.error('Failed to delete profile:', e)
    }
}

export async function getBookmarks(userId: string): Promise<any[]> {
    const profile = await getProfile(userId)
    return profile?.bookmarks ?? []
}

export async function addBookmark(
    userId: string,
    bookmark: string
): Promise<any | null> {
    const profile = await getProfile(userId)
    if (!profile) return null

    const bookmarks = Array.isArray(profile.bookmarks) ? [...profile.bookmarks] : []
    const existing = bookmarks.find((b: any) => b.bookmark === bookmark)
    if (existing) return existing

    const newBookmark = {
        _id: `bm_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        bookmark,
        createdAt: new Date().toISOString(),
    }

    bookmarks.push(newBookmark)
    await updateProfile(userId, { bookmarks })
    return newBookmark
}

export async function removeBookmark(
    userId: string,
    bookmarkId: string
): Promise<boolean> {
    const profile = await getProfile(userId)
    if (!profile) return false

    const bookmarks = Array.isArray(profile.bookmarks) ? [...profile.bookmarks] : []
    const filtered = bookmarks.filter((b: any) => b._id !== bookmarkId)

    if (filtered.length === bookmarks.length) return false

    await updateProfile(userId, { bookmarks: filtered })
    return true
}

export async function updateTasbeehSummary(
    userId: string,
    increment: number,
    sessionComplete: boolean = false
): Promise<void> {
    const profile = await getProfile(userId)
    if (!profile) return

    const summary = profile.tasbeeh_summary ?? { total: 0, sessions: 0 }
    summary.total += increment
    if (sessionComplete) {
        summary.sessions += 1
    }

    await updateProfile(userId, { tasbeeh_summary: summary })
}
