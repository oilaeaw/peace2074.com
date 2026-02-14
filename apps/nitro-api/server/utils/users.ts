// Persistent user storage via Nitro data storage.
// Keeps auth/tasbeeh/bookmarks in sync across server restarts.

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

async function loadUsers(): Promise<User[]> {
    const storage = useStorage('data')
    const existing = await storage.getItem<User[]>(USERS_KEY)
    if (Array.isArray(existing) && existing.length > 0) {
        return existing
    }

    await storage.setItem(USERS_KEY, DEFAULT_USERS)
    return [...DEFAULT_USERS]
}

async function saveUsers(users: User[]) {
    const storage = useStorage('data')
    await storage.setItem(USERS_KEY, users)
}

export async function findUserByUsername(username: string) {
    const users = await loadUsers()
    return users.find((u) => u.username === username)
}

export async function findUserByEmail(email: string) {
    const users = await loadUsers()
    return users.find((u) => u.email === email)
}

export async function findUserById(id: string) {
    const users = await loadUsers()
    return users.find((u) => u.id === id)
}

export async function updateUserPassword(userId: string, newPassword: string) {
    const users = await loadUsers()
    const user = users.find((u) => u.id === userId)
    if (!user) return false

    user.password = newPassword
    await saveUsers(users)
    return true
}

export async function addUser(user: User) {
    const users = await loadUsers()
    users.push({
        ...user,
        tasbeeh: user.tasbeeh || [],
        bookmarks: user.bookmarks || [],
    })
    await saveUsers(users)
}

export async function getUserTasbeeh(userId: string): Promise<TasbeehRecord[]> {
    const user = await findUserById(userId)
    return user?.tasbeeh || []
}

export async function updateUserTasbeeh(userId: string, record: TasbeehRecord): Promise<boolean> {
    const users = await loadUsers()
    const user = users.find((u) => u.id === userId)
    if (!user) return false

    if (!user.tasbeeh) {
        user.tasbeeh = []
    }

    const existingIndex = user.tasbeeh.findIndex((d) => d.date === record.date)
    if (existingIndex >= 0) {
        user.tasbeeh[existingIndex] = record
    } else {
        user.tasbeeh.push(record)
    }

    if (user.tasbeeh.length > 30) {
        user.tasbeeh = user.tasbeeh.slice(-30)
    }

    await saveUsers(users)
    return true
}

export async function getUserBookmarks(userId: string): Promise<Bookmark[]> {
    const user = await findUserById(userId)
    return user?.bookmarks || []
}

export async function createUserBookmark(userId: string, bookmark: string): Promise<Bookmark | null> {
    const users = await loadUsers()
    const user = users.find((u) => u.id === userId)
    if (!user) return null

    if (!user.bookmarks) {
        user.bookmarks = []
    }

    const existing = user.bookmarks.find((b) => b.bookmark === bookmark)
    if (existing) return existing

    const newBookmark: Bookmark = {
        _id: `bm_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        bookmark,
        createdAt: new Date().toISOString(),
    }
    user.bookmarks.push(newBookmark)
    await saveUsers(users)
    return newBookmark
}

export async function updateUserBookmark(userId: string, bookmarkId: string, newBookmark: string): Promise<Bookmark | null> {
    const users = await loadUsers()
    const user = users.find((u) => u.id === userId)
    if (!user || !user.bookmarks) return null

    const bm = user.bookmarks.find((b) => b._id === bookmarkId)
    if (!bm) return null

    bm.bookmark = newBookmark
    await saveUsers(users)
    return bm
}

export async function deleteUserBookmark(userId: string, bookmarkId: string): Promise<boolean> {
    const users = await loadUsers()
    const user = users.find((u) => u.id === userId)
    if (!user || !user.bookmarks) return false

    const index = user.bookmarks.findIndex((b) => b._id === bookmarkId || b.bookmark === bookmarkId)
    if (index === -1) return false

    user.bookmarks.splice(index, 1)
    await saveUsers(users)
    return true
}
