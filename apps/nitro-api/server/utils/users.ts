// Shared in-memory user storage for local development
// In production, you'd use a real database

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
}

export const MOCK_USERS: User[] = [
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

export function findUserByUsername(username: string) {
    return MOCK_USERS.find(u => u.username === username)
}

export function findUserById(id: string) {
    return MOCK_USERS.find(u => u.id === id)
}

export function updateUserPassword(userId: string, newPassword: string) {
    const user = MOCK_USERS.find(u => u.id === userId)
    if (user) {
        user.password = newPassword
        return true
    }
    return false
}

export function addUser(user: User) {
    if (!user.tasbeeh) {
        user.tasbeeh = []
    }
    MOCK_USERS.push(user)
}

export function getUserTasbeeh(userId: string): TasbeehRecord[] {
    const user = findUserById(userId)
    return user?.tasbeeh || []
}

export function updateUserTasbeeh(userId: string, record: TasbeehRecord): boolean {
    const user = findUserById(userId)
    if (!user) return false

    if (!user.tasbeeh) {
        user.tasbeeh = []
    }

    // Update or add the daily record
    const existingIndex = user.tasbeeh.findIndex(d => d.date === record.date)
    if (existingIndex >= 0) {
        user.tasbeeh[existingIndex] = record
    } else {
        user.tasbeeh.push(record)
    }

    // Keep only last 30 days
    if (user.tasbeeh.length > 30) {
        user.tasbeeh = user.tasbeeh.slice(-30)
    }

    return true
}

// Bookmark functions
export function getUserBookmarks(userId: string): Bookmark[] {
    const user = findUserById(userId)
    return user?.bookmarks || []
}

export function createUserBookmark(userId: string, bookmark: string): Bookmark | null {
    const user = findUserById(userId)
    if (!user) return null

    if (!user.bookmarks) {
        user.bookmarks = []
    }

    // Check if bookmark already exists
    const existing = user.bookmarks.find(b => b.bookmark === bookmark)
    if (existing) return existing

    const newBookmark: Bookmark = {
        _id: `bm_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        bookmark,
        createdAt: new Date().toISOString(),
    }
    user.bookmarks.push(newBookmark)
    return newBookmark
}

export function updateUserBookmark(userId: string, bookmarkId: string, newBookmark: string): Bookmark | null {
    const user = findUserById(userId)
    if (!user || !user.bookmarks) return null

    const bm = user.bookmarks.find(b => b._id === bookmarkId)
    if (!bm) return null

    bm.bookmark = newBookmark
    return bm
}

export function deleteUserBookmark(userId: string, bookmarkId: string): boolean {
    const user = findUserById(userId)
    if (!user || !user.bookmarks) return false

    const index = user.bookmarks.findIndex(b => b._id === bookmarkId || b.bookmark === bookmarkId)
    if (index === -1) return false

    user.bookmarks.splice(index, 1)
    return true
}
