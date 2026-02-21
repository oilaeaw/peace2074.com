// Prisma-backed user storage.
// Performs one-time sync from legacy Nitro KV storage (db:users) when DB is empty.

import { prisma } from './prisma'

export interface TasbeehRecord {
    date: string
    total: number
    sessions: number
}

export interface Bookmark {
    _id: string
    bookmark: string
    createdAt: string
}

export interface User {
    id: string
    username: string
    password: string
    email: string
    role: string
    first_name?: string
    last_name?: string
    tasbeeh?: TasbeehRecord[]
    bookmarks?: Bookmark[]
    avatar_url?: string
    github_id?: string
}

const DEFAULT_USERS: User[] = [
    {
        id: 'waelio',
        username: 'waelio',
        password: '123456789',
        email: 'wael@peace2074.com',
        role: 'admin',
        first_name: 'Wael',
        last_name: 'Admin',
        tasbeeh: []
    }
]

const USERS_KEY = 'db:users'
let initPromise: Promise<void> | null = null

function repairUsers(users: User[]) {
    if (!Array.isArray(users) || !users.length) return { users, changed: false }

    const defaultsById = new Map(DEFAULT_USERS.map((u) => [u.id, u]))
    let changed = false

    const repaired = users.map((user) => {
        const fallback = defaultsById.get(user.id)
        if (!user.password && fallback?.password) {
            changed = true
            return { ...user, password: fallback.password }
        }
        return user
    })

    return { users: repaired, changed }
}

function toAppUser(user: any): User {
    return {
        id: user.id,
        username: user.username,
        password: user.password,
        email: user.email,
        role: user.role,
        first_name: user.first_name || undefined,
        last_name: user.last_name || undefined,
        tasbeeh: Array.isArray(user.tasbeeh) ? user.tasbeeh : [],
        bookmarks: Array.isArray(user.bookmarks) ? user.bookmarks : [],
        avatar_url: user.avatar_url || undefined,
        github_id: user.github_id || undefined,
    }
}

function normalizeUser(input: Partial<User>): User {
    return {
        id: String(input.id || ''),
        username: String(input.username || ''),
        password: String(input.password || ''),
        email: String(input.email || ''),
        role: String(input.role || 'user'),
        first_name: input.first_name || '',
        last_name: input.last_name || '',
        tasbeeh: Array.isArray(input.tasbeeh) ? input.tasbeeh : [],
        bookmarks: Array.isArray(input.bookmarks) ? input.bookmarks : [],
        avatar_url: input.avatar_url,
        github_id: input.github_id,
    }
}

async function readLegacyUsers(): Promise<User[]> {
    try {
        const storage = useStorage('data')
        const existing = await storage.getItem<User[]>(USERS_KEY)
        if (!Array.isArray(existing)) return []
        return existing.map(normalizeUser).filter((u) => u.id && u.username && u.email)
    } catch {
        return []
    }
}

async function upsertByIdentity(user: User) {
    const existing = await prisma.user.findFirst({
        where: {
            OR: [
                { id: user.id },
                { username: user.username },
                { email: user.email },
            ],
        },
    })

    const payload = {
        username: user.username,
        password: user.password,
        email: user.email,
        role: user.role,
        first_name: user.first_name || null,
        last_name: user.last_name || null,
        tasbeeh: user.tasbeeh || [],
        bookmarks: user.bookmarks || [],
        avatar_url: user.avatar_url || null,
        github_id: user.github_id || null,
    }

    if (existing) {
        await prisma.user.update({
            where: { id: existing.id },
            data: {
                ...payload,
                password: payload.password || existing.password,
            },
        })
        return
    }

    await prisma.user.create({
        data: {
            id: user.id,
            ...payload,
        },
    })
}

async function repairExistingPasswords() {
    const users = await prisma.user.findMany({
        where: {
            OR: [
                { password: '' },
                { password: null as any },
            ],
        },
    })

    if (!users.length) return

    const defaultsById = new Map(DEFAULT_USERS.map((u) => [u.id, u]))
    for (const user of users) {
        const fallback = defaultsById.get(user.id)
        if (!fallback?.password) continue
        await prisma.user.update({
            where: { id: user.id },
            data: { password: fallback.password },
        })
    }
}

async function ensureInitialized() {
    if (initPromise) return initPromise

    initPromise = (async () => {
        const count = await prisma.user.count()
        if (count > 0) {
            await repairExistingPasswords()
            return
        }

        const legacyUsers = await readLegacyUsers()
        const merged = repairUsers([...legacyUsers, ...DEFAULT_USERS]).users

        const deduped = new Map<string, User>()
        for (const user of merged) {
            const normalized = normalizeUser(user)
            if (!normalized.id || !normalized.username || !normalized.email) continue
            if (!deduped.has(normalized.id)) {
                deduped.set(normalized.id, normalized)
            }
        }

        for (const user of deduped.values()) {
            await upsertByIdentity(user)
        }
    })()

    return initPromise
}

export async function findUserByUsername(username: string) {
    await ensureInitialized()
    const user = await prisma.user.findUnique({ where: { username } })
    return user ? toAppUser(user) : undefined
}

export async function findUserByEmail(email: string) {
    await ensureInitialized()
    const user = await prisma.user.findUnique({ where: { email } })
    return user ? toAppUser(user) : undefined
}

export async function findUserById(id: string) {
    await ensureInitialized()
    const user = await prisma.user.findUnique({ where: { id } })
    return user ? toAppUser(user) : undefined
}

export async function updateUserPassword(userId: string, newPassword: string) {
    await ensureInitialized()
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) return false
    await prisma.user.update({ where: { id: userId }, data: { password: newPassword } })
    return true
}

export async function addUser(user: User) {
    await ensureInitialized()
    const normalized = normalizeUser(user)

    await prisma.user.create({
        data: {
            id: normalized.id,
            username: normalized.username,
            password: normalized.password,
            email: normalized.email,
            role: normalized.role,
            first_name: normalized.first_name || null,
            last_name: normalized.last_name || null,
            tasbeeh: normalized.tasbeeh || [],
            bookmarks: normalized.bookmarks || [],
            avatar_url: normalized.avatar_url || null,
            github_id: normalized.github_id || null,
        },
    })
}

export async function getUserTasbeeh(userId: string): Promise<TasbeehRecord[]> {
    const user = await findUserById(userId)
    return user?.tasbeeh || []
}

export async function updateUserTasbeeh(userId: string, record: TasbeehRecord): Promise<boolean> {
    await ensureInitialized()
    const user = await findUserById(userId)
    if (!user) {
        return false
    }

    const tasbeeh = Array.isArray(user.tasbeeh) ? [...user.tasbeeh] : []

    const existingIndex = tasbeeh.findIndex((d) => d.date === record.date)
    if (existingIndex >= 0) {
        tasbeeh[existingIndex] = record
    } else {
        tasbeeh.push(record)
    }

    if (tasbeeh.length > 30) {
        tasbeeh.splice(0, tasbeeh.length - 30)
    }

    await prisma.user.update({
        where: { id: userId },
        data: { tasbeeh },
    })
    return true
}

export async function getUserBookmarks(userId: string): Promise<Bookmark[]> {
    const user = await findUserById(userId)
    return user?.bookmarks || []
}

export async function createUserBookmark(userId: string, bookmark: string): Promise<Bookmark | null> {
    await ensureInitialized()
    const user = await findUserById(userId)
    if (!user) return null

    const bookmarks = Array.isArray(user.bookmarks) ? [...user.bookmarks] : []

    const existing = bookmarks.find((b) => b.bookmark === bookmark)
    if (existing) return existing

    const newBookmark: Bookmark = {
        _id: `bm_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        bookmark,
        createdAt: new Date().toISOString(),
    }
    bookmarks.push(newBookmark)
    await prisma.user.update({
        where: { id: userId },
        data: { bookmarks },
    })
    return newBookmark
}

export async function updateUserBookmark(userId: string, bookmarkId: string, newBookmark: string): Promise<Bookmark | null> {
    await ensureInitialized()
    const user = await findUserById(userId)
    if (!user || !user.bookmarks) return null

    const bookmarks = [...user.bookmarks]
    const bm = bookmarks.find((b) => b._id === bookmarkId)
    if (!bm) return null

    bm.bookmark = newBookmark
    await prisma.user.update({
        where: { id: userId },
        data: { bookmarks },
    })
    return bm
}

export async function deleteUserBookmark(userId: string, bookmarkId: string): Promise<boolean> {
    await ensureInitialized()
    const user = await findUserById(userId)
    if (!user || !user.bookmarks) return false

    const bookmarks = [...user.bookmarks]
    const index = bookmarks.findIndex((b) => b._id === bookmarkId || b.bookmark === bookmarkId)
    if (index === -1) return false

    bookmarks.splice(index, 1)
    await prisma.user.update({
        where: { id: userId },
        data: { bookmarks },
    })
    return true
}
