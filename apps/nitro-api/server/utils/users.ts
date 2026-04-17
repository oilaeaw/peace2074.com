// Prisma-backed user storage.
// Development can fall back to Nitro KV storage, but production requires Prisma.

import { createDatabaseRequiredError, isFallbackAuthStorageAllowed } from './database-mode'
import { getPrisma } from './prisma'
import { createProfile, getProfile, updateProfile } from './profile'
import { isCloudinaryAssetUrl, isLikelyOAuthAvatarUrl, resolveOAuthAvatarUrl } from './cloudinary'

// Cached Prisma client after successful initialization
let prisma: any = null

export interface User {
    id: string
    username: string
    password: string
    email: string
    role: string
    permissions?: any[]
    google_id?: string
    apple_id?: string
    first_name?: string
    last_name?: string
    avatar_url?: string
    github_id?: string
    tasbeeh?: any[]
    bookmarks?: any[]
}

export interface UserPermission {
    action: string
    subject: string
}

const DEFAULT_USER_PERMISSIONS: UserPermission[] = [
    { action: 'read', subject: 'category' },
    { action: 'read', subject: 'post' },
    { action: 'create', subject: 'user' },
    { action: 'read', subject: 'user' },
    { action: 'update', subject: 'user' },
    { action: 'read', subject: 'chat' },
]

const ADMIN_EXTRA_PERMISSIONS: UserPermission[] = [
    { action: 'manage', subject: 'admin' },
    { action: 'manage', subject: 'chat' },
]

const EDITOR_EXTRA_PERMISSIONS: UserPermission[] = [
    { action: 'update', subject: 'post' },
]

function clonePermissions(permissions: UserPermission[]) {
    return permissions.map((permission) => ({ ...permission }))
}

function isPermissionEntry(permission: unknown): permission is UserPermission {
    if (!permission || typeof permission !== 'object') return false

    const candidate = permission as UserPermission
    return typeof candidate.action === 'string' && typeof candidate.subject === 'string'
}

function dedupePermissions(permissions: UserPermission[]) {
    const seen = new Set<string>()

    return permissions.filter((permission) => {
        const key = `${permission.action}:${permission.subject}`
        if (seen.has(key)) return false
        seen.add(key)
        return true
    })
}

export function getRolePermissions(role: string = 'user') {
    const permissions = clonePermissions(DEFAULT_USER_PERMISSIONS)

    if (role === 'admin') {
        permissions.push(...clonePermissions(ADMIN_EXTRA_PERMISSIONS))
    } else if (role === 'editor') {
        permissions.push(...clonePermissions(EDITOR_EXTRA_PERMISSIONS))
    }

    return dedupePermissions(permissions)
}

export function resolveUserPermissions(user?: Pick<User, 'role' | 'permissions'> | null) {
    const storedPermissions = Array.isArray(user?.permissions)
        ? user.permissions.filter(isPermissionEntry).map((permission) => ({ ...permission }))
        : []

    return dedupePermissions([
        ...getRolePermissions(user?.role || 'user'),
        ...storedPermissions,
    ])
}

const DEFAULT_USERS: User[] = [
    {
        id: 'waelio',
        username: 'waelio',
        password: 'gLHVHtMcSY8Sum+H',
        email: 'wael@peace2074.com',
        role: 'admin',
        permissions: getRolePermissions('admin')
    }
]

const USERS_KEY = 'db:users'
let initPromise: Promise<void> | null = null
let memoryUsers: User[] | null = null
let prismaMode: 'unknown' | 'on' | 'off' = 'unknown'
let prismaFailureLogged = false

function markPrismaUnavailable(error: unknown) {
    prismaMode = 'off'
    prisma = null
    initPromise = null
    if (!prismaFailureLogged) {
        prismaFailureLogged = true
        console.warn('[users] Prisma unavailable, falling back to Nitro storage:', error)
    }
}

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

async function loadFallbackUsers(): Promise<User[]> {
    if (!isFallbackAuthStorageAllowed()) {
        throw createDatabaseRequiredError()
    }

    if (memoryUsers && memoryUsers.length > 0) {
        const repaired = repairUsers(memoryUsers)
        if (repaired.changed) {
            memoryUsers = repaired.users
        }
        return memoryUsers
    }

    try {
        const storage = useStorage('data')
        const existing = await storage.getItem<User[]>(USERS_KEY)
        if (Array.isArray(existing) && existing.length > 0) {
            const repaired = repairUsers(existing.map(normalizeUser))
            memoryUsers = repaired.users
            if (repaired.changed) {
                try {
                    await storage.setItem(USERS_KEY, memoryUsers)
                } catch {
                    /* noop - in-memory fallback only */
                }
            }
            return memoryUsers
        }

        memoryUsers = [...DEFAULT_USERS]
        try {
            await storage.setItem(USERS_KEY, memoryUsers)
        } catch {
            /* noop - in-memory fallback only */
        }
        return memoryUsers
    } catch {
        memoryUsers = [...DEFAULT_USERS]
        return memoryUsers
    }
}

async function saveFallbackUsers(users: User[]) {
    if (!isFallbackAuthStorageAllowed()) {
        throw createDatabaseRequiredError()
    }

    memoryUsers = users
    try {
        const storage = useStorage('data')
        await storage.setItem(USERS_KEY, users)
    } catch {
        /* noop - in-memory fallback only */
    }
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
        google_id: user.google_id || undefined,
        apple_id: user.apple_id || undefined,
        permissions: resolveUserPermissions({
            role: user.role,
            permissions: Array.isArray(user.permissions) ? user.permissions : [],
        }),
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
        google_id: input.google_id,
        apple_id: input.apple_id,
        permissions: resolveUserPermissions({
            role: String(input.role || 'user'),
            permissions: Array.isArray(input.permissions) ? input.permissions : [],
        }),
    }
}

function normalizeOptionalText(value: unknown): string | undefined {
    if (typeof value !== 'string') return undefined

    const normalized = value.trim()
    return normalized || undefined
}

function splitDisplayName(name: string) {
    const normalized = name.trim().replace(/\s+/g, ' ')
    if (!normalized) {
        return {
            firstName: undefined,
            lastName: undefined,
        }
    }

    const [firstName, ...rest] = normalized.split(' ')
    return {
        firstName: firstName || undefined,
        lastName: rest.join(' ').trim() || undefined,
    }
}

function getOAuthNameParts(oauthInfo: {
    email: string
    name: string
    firstName?: string
    lastName?: string
}) {
    const explicitFirstName = normalizeOptionalText(oauthInfo.firstName)
    const explicitLastName = normalizeOptionalText(oauthInfo.lastName)
    const splitName = splitDisplayName(oauthInfo.name || '')
    const emailUsername = normalizeOptionalText(oauthInfo.email.split('@')[0]) || 'user'

    return {
        firstName: explicitFirstName || splitName.firstName || emailUsername,
        lastName: explicitLastName || splitName.lastName,
    }
}

function shouldAttemptAvatarRefresh(currentAvatar: string | undefined, nextAvatar: string | undefined) {
    const current = normalizeOptionalText(currentAvatar)
    const next = normalizeOptionalText(nextAvatar)

    if (!next) return false
    if (!current) return true
    if (current === next) return true
    return isLikelyOAuthAvatarUrl(current)
}

function shouldPersistAvatar(currentAvatar: string | undefined, nextAvatar: string | undefined) {
    const current = normalizeOptionalText(currentAvatar)
    const next = normalizeOptionalText(nextAvatar)

    if (!next) return false
    if (!current) return true
    if (current === next) return false
    if (!isCloudinaryAssetUrl(current) && isCloudinaryAssetUrl(next)) return true
    return isLikelyOAuthAvatarUrl(current)
}

function createOAuthUsername(email: string) {
    return `${email.split('@')[0]}_${Math.random().toString(36).substring(7)}`
}

function getOAuthProviderField(provider: 'google' | 'apple' | 'github') {
    if (provider === 'google') return 'google_id'
    if (provider === 'apple') return 'apple_id'
    return 'github_id'
}

function createOAuthUserId(provider: 'google' | 'apple' | 'github', providerId: string) {
    return provider === 'github' ? `github_${providerId}` : providerId
}

async function resolvePersistedOAuthAvatar(
    oauthInfo: {
        provider: 'google' | 'apple' | 'github'
        providerId: string
        picture?: string
    },
    currentAvatar?: string
) {
    if (!shouldAttemptAvatarRefresh(currentAvatar, oauthInfo.picture)) {
        return undefined
    }

    return await resolveOAuthAvatarUrl({
        provider: oauthInfo.provider,
        providerId: oauthInfo.providerId,
        imageUrl: oauthInfo.picture,
    })
}

async function syncOAuthProfile(userId: string, oauthInfo: {
    provider: 'google' | 'apple' | 'github'
    providerId: string
    email: string
    name: string
    firstName?: string
    lastName?: string
}, avatarUrl?: string) {
    const { firstName, lastName } = getOAuthNameParts(oauthInfo)

    try {
        const profile = await getProfile(userId)

        if (!profile) {
            await createProfile({
                userId,
                first_name: firstName,
                last_name: lastName,
                avatar_url: avatarUrl,
                github_id: oauthInfo.provider === 'github' ? oauthInfo.providerId : undefined,
            })
            return
        }

        const updates: Record<string, any> = {}

        if (!profile.first_name && firstName) {
            updates.first_name = firstName
        }

        if (!profile.last_name && lastName) {
            updates.last_name = lastName
        }

        if (shouldPersistAvatar(profile.avatar_url || undefined, avatarUrl)) {
            updates.avatar_url = avatarUrl
        }

        if (oauthInfo.provider === 'github' && !profile.github_id) {
            updates.github_id = oauthInfo.providerId
        }

        if (Object.keys(updates).length > 0) {
            await updateProfile(userId, updates)
        }
    } catch (error) {
        console.warn('[findOrCreateOAuthUser] Profile sync failed', {
            userId,
            provider: oauthInfo.provider,
            error,
        })
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
        google_id: user.google_id || null,
        apple_id: user.apple_id || null,
        first_name: user.first_name || null,
        last_name: user.last_name || null,
        avatar_url: user.avatar_url || null,
        github_id: user.github_id || null,
        permissions: resolveUserPermissions(user),
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
    // Get all users and filter in memory since MongoDB/Prisma doesn't support OR with null/empty well
    const allUsers = await prisma.user.findMany()
    const usersNeedingRepair = allUsers.filter(u => !u.password || u.password === '')

    if (!usersNeedingRepair.length) return

    const defaultsById = new Map(DEFAULT_USERS.map((u) => [u.id, u]))
    for (const user of usersNeedingRepair) {
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
        try {
            const count = await prisma.user.count()
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
        } catch (error) {
            initPromise = null
            throw error
        }
    })()

    return initPromise
}

async function isPrismaReady() {
    if (prismaMode === 'off') return false
    if (prismaMode === 'on' && prisma) return true

    try {
        prisma = await getPrisma()
        if (!prisma) {
            throw new Error('Prisma client not available')
        }
        await ensureInitialized()
        prismaMode = 'on'
        prismaFailureLogged = false
        return true
    } catch (error) {
        markPrismaUnavailable(error)
        return false
    }
}

export async function getAllUsers(): Promise<User[]> {
    if (await isPrismaReady()) {
        try {
            const users = await prisma.user.findMany()
            return users.map(toAppUser)
        } catch (error) {
            markPrismaUnavailable(error)
        }
    }

    return await loadFallbackUsers()
}

export async function findUserByUsername(username: string) {
    if (await isPrismaReady()) {
        try {
            const user = await prisma.user.findUnique({ where: { username } })
            return user ? toAppUser(user) : undefined
        } catch (error) {
            markPrismaUnavailable(error)
        }
    }

    const users = await loadFallbackUsers()
    return users.find((u) => u.username === username)
}

export async function findUserByEmail(email: string) {
    if (await isPrismaReady()) {
        try {
            const user = await prisma.user.findUnique({ where: { email } })
            return user ? toAppUser(user) : undefined
        } catch (error) {
            markPrismaUnavailable(error)
        }
    }

    const users = await loadFallbackUsers()
    return users.find((u) => u.email === email)
}

export async function findUserById(id: string) {
    if (await isPrismaReady()) {
        try {
            const user = await prisma.user.findUnique({ where: { id } })
            return user ? toAppUser(user) : undefined
        } catch (error) {
            markPrismaUnavailable(error)
        }
    }

    const users = await loadFallbackUsers()
    return users.find((u) => u.id === id)
}

export async function updateUserPassword(userId: string, newPassword: string) {
    if (await isPrismaReady()) {
        try {
            const user = await prisma.user.findUnique({ where: { id: userId } })
            if (!user) return false
            await prisma.user.update({ where: { id: userId }, data: { password: newPassword } })
            return true
        } catch (error) {
            markPrismaUnavailable(error)
        }
    }

    const users = await loadFallbackUsers()
    const user = users.find((u) => u.id === userId)
    if (!user) return false
    user.password = newPassword
    await saveFallbackUsers(users)
    return true
}

export async function addUser(user: User) {
    const normalized = normalizeUser(user)

    if (await isPrismaReady()) {
        try {
            await prisma.user.create({
                data: {
                    id: normalized.id,
                    username: normalized.username,
                    password: normalized.password,
                    email: normalized.email,
                    role: normalized.role,
                    google_id: normalized.google_id || null,
                    apple_id: normalized.apple_id || null,
                    first_name: normalized.first_name || null,
                    last_name: normalized.last_name || null,
                    avatar_url: normalized.avatar_url || null,
                    github_id: normalized.github_id || null,
                    permissions: normalized.permissions || [],
                },
            })
            return
        } catch (error) {
            markPrismaUnavailable(error)
        }
    }

    const users = await loadFallbackUsers()
    users.push(normalized)
    await saveFallbackUsers(users)
}



export async function getUserStorageDiagnostics(): Promise<{
    source: 'prisma' | 'fallback' | 'database-required'
    usersCount: number
    prismaReachable: boolean
    fallbackAllowed: boolean
}> {
    const prismaReachable = await isPrismaReady()
    const fallbackAllowed = isFallbackAuthStorageAllowed()

    if (prismaReachable) {
        try {
            const usersCount = await prisma.user.count()
            return {
                source: 'prisma',
                usersCount,
                prismaReachable: true,
                fallbackAllowed,
            }
        } catch (error) {
            markPrismaUnavailable(error)
        }
    }

    if (!fallbackAllowed) {
        return {
            source: 'database-required',
            usersCount: 0,
            prismaReachable: false,
            fallbackAllowed: false,
        }
    }

    const users = await loadFallbackUsers()
    return {
        source: 'fallback',
        usersCount: users.length,
        prismaReachable: false,
        fallbackAllowed: true,
    }
}

export async function findOrCreateOAuthUser(oauthInfo: {
    provider: 'google' | 'apple' | 'github'
    providerId: string
    email: string
    name: string
    firstName?: string
    lastName?: string
    picture?: string
}): Promise<User> {
    const { provider, providerId, email, picture } = oauthInfo
    const { firstName, lastName } = getOAuthNameParts(oauthInfo)
    const providerField = getOAuthProviderField(provider)

    // Try to find existing user by provider ID
    if (await isPrismaReady()) {
        try {
            // Check by provider ID first
            const existingByProvider = await (prisma.user as any).findFirst({
                where: { [providerField]: providerId }
            })

            if (existingByProvider) {
                const persistedAvatar = await resolvePersistedOAuthAvatar(oauthInfo, existingByProvider.avatar_url || undefined)
                const updates: Record<string, any> = {}

                if (!existingByProvider.first_name && firstName) {
                    updates.first_name = firstName
                }

                if (!existingByProvider.last_name && lastName) {
                    updates.last_name = lastName
                }

                if (shouldPersistAvatar(existingByProvider.avatar_url || undefined, persistedAvatar)) {
                    updates.avatar_url = persistedAvatar
                }

                const userRecord = Object.keys(updates).length > 0
                    ? await prisma.user.update({
                        where: { id: existingByProvider.id },
                        data: updates,
                    })
                    : existingByProvider

                await syncOAuthProfile(userRecord.id, oauthInfo, persistedAvatar || userRecord.avatar_url || undefined)
                return toAppUser(userRecord)
            }

            // Check by email (link existing account)
            const existingByEmail = await prisma.user.findUnique({
                where: { email }
            })

            if (existingByEmail) {
                const persistedAvatar = await resolvePersistedOAuthAvatar(oauthInfo, existingByEmail.avatar_url || undefined)
                const updates: Record<string, any> = {
                    [providerField]: providerId,
                }

                if (!existingByEmail.first_name && firstName) {
                    updates.first_name = firstName
                }

                if (!existingByEmail.last_name && lastName) {
                    updates.last_name = lastName
                }

                if (shouldPersistAvatar(existingByEmail.avatar_url || undefined, persistedAvatar)) {
                    updates.avatar_url = persistedAvatar
                }

                // Link OAuth provider to existing account
                const updated = await prisma.user.update({
                    where: { id: existingByEmail.id },
                    data: updates
                })

                await syncOAuthProfile(updated.id, oauthInfo, persistedAvatar || updated.avatar_url || undefined)
                return toAppUser(updated)
            }

            // Create new user
            const persistedAvatar = await resolvePersistedOAuthAvatar(oauthInfo)
            const username = createOAuthUsername(email)
            const newUser = await prisma.user.create({
                data: {
                    id: createOAuthUserId(provider, providerId),
                    username,
                    email,
                    password: '', // OAuth users don't need password
                    role: 'user',
                    first_name: firstName || null,
                    last_name: lastName || null,
                    avatar_url: persistedAvatar || picture || null,
                    [providerField]: providerId,
                    permissions: getRolePermissions('user')
                }
            })

            await syncOAuthProfile(newUser.id, oauthInfo, persistedAvatar || picture)
            return toAppUser(newUser)
        } catch (error) {
            console.error('[findOrCreateOAuthUser] Prisma error:', error)
            markPrismaUnavailable(error)
        }
    }

    // Fallback storage
    const users = await loadFallbackUsers()

    // Check by provider ID
    let user = users.find((u: any) => u[providerField] === providerId)
    if (user) {
        if (!user.first_name && firstName) {
            user.first_name = firstName
        }
        if (!user.last_name && lastName) {
            user.last_name = lastName
        }
        if (shouldPersistAvatar(user.avatar_url, picture)) {
            user.avatar_url = picture
        }
        await saveFallbackUsers(users)
        return user
    }

    // Check by email
    user = users.find((u) => u.email === email)
    if (user) {
        // Link OAuth provider
        (user as any)[providerField] = providerId
        if (!user.first_name && firstName) {
            user.first_name = firstName
        }
        if (!user.last_name && lastName) {
            user.last_name = lastName
        }
        if (shouldPersistAvatar(user.avatar_url, picture)) {
            user.avatar_url = picture
        }
        await saveFallbackUsers(users)
        return user
    }

    // Create new user
    const username = createOAuthUsername(email)
    const newUser: User = {
        id: createOAuthUserId(provider, providerId),
        username,
        email,
        password: '', // OAuth users don't need password
        role: 'user',
        first_name: firstName,
        last_name: lastName,
        avatar_url: picture,
        [providerField]: providerId,
        permissions: getRolePermissions('user')
    }

    users.push(newUser)
    await saveFallbackUsers(users)
    return newUser
}

