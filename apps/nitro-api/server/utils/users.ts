/**
 * User storage backed by @waelio/realdb (NitroStorageAdapter).
 * Data is persisted to Nitro's .data/ directory and falls back to
 * in-process memory on edge runtimes (Cloudflare Workers).
 *
 * No MongoDB required.
 */

import { getDb } from './realdb'
import { createProfile, getProfile, updateProfile, deleteProfileByUserId } from './profile'
import { deleteReaderStatsByUserId } from './reader-stats'
import { deleteTasbeehByUserId } from './tasbeeh'
import { isCloudinaryAssetUrl, isLikelyOAuthAvatarUrl, resolveOAuthAvatarUrl } from './cloudinary'

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
    banned?: boolean
    bannedAt?: string | null
    bannedReason?: string | null
    tasbeeh?: any[]
    bookmarks?: any[]
}

export interface UserPermission {
    action: string
    subject: string
}

// ── Permissions ───────────────────────────────────────────────────────────────

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
    return permissions.map((p) => ({ ...p }))
}

function isPermissionEntry(p: unknown): p is UserPermission {
    if (!p || typeof p !== 'object') return false
    const c = p as UserPermission
    return typeof c.action === 'string' && typeof c.subject === 'string'
}

function dedupePermissions(permissions: UserPermission[]) {
    const seen = new Set<string>()
    return permissions.filter((p) => {
        const key = `${p.action}:${p.subject}`
        if (seen.has(key)) return false
        seen.add(key)
        return true
    })
}

export function getRolePermissions(role: string = 'user') {
    const permissions = clonePermissions(DEFAULT_USER_PERMISSIONS)
    if (role === 'admin') permissions.push(...clonePermissions(ADMIN_EXTRA_PERMISSIONS))
    else if (role === 'editor') permissions.push(...clonePermissions(EDITOR_EXTRA_PERMISSIONS))
    return dedupePermissions(permissions)
}

export function resolveUserPermissions(user?: Pick<User, 'role' | 'permissions'> | null) {
    const stored = Array.isArray(user?.permissions)
        ? user.permissions.filter(isPermissionEntry).map((p) => ({ ...p }))
        : []
    return dedupePermissions([...getRolePermissions(user?.role || 'user'), ...stored])
}

// ── Default seed users ────────────────────────────────────────────────────────

const DEFAULT_USERS: User[] = [
    {
        id: 'waelio',
        username: 'waelio',
        password: 'gLHVHtMcSY8Sum+H',
        email: 'wael@peace2074.com',
        role: 'admin',
        permissions: getRolePermissions('admin'),
    },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

async function usersCollection() {
    const db = await getDb()
    return db.collection<User>('users')
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
        banned: input.banned ?? false,
        bannedAt: input.bannedAt ?? null,
        bannedReason: input.bannedReason ?? null,
        permissions: resolveUserPermissions({
            role: String(input.role || 'user'),
            permissions: Array.isArray(input.permissions) ? input.permissions : [],
        }),
    }
}

function normalizeOptionalText(value: unknown): string | undefined {
    if (typeof value !== 'string') return undefined
    const n = value.trim()
    return n || undefined
}

function splitDisplayName(name: string) {
    const n = name.trim().replace(/\s+/g, ' ')
    if (!n) return { firstName: undefined, lastName: undefined }
    const [firstName, ...rest] = n.split(' ')
    return { firstName: firstName || undefined, lastName: rest.join(' ').trim() || undefined }
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
    oauthInfo: { provider: 'google' | 'apple' | 'github'; providerId: string; picture?: string },
    currentAvatar?: string
) {
    if (!shouldAttemptAvatarRefresh(currentAvatar, oauthInfo.picture)) return undefined
    return resolveOAuthAvatarUrl({
        provider: oauthInfo.provider,
        providerId: oauthInfo.providerId,
        imageUrl: oauthInfo.picture,
    })
}

async function syncOAuthProfile(
    userId: string,
    oauthInfo: {
        provider: 'google' | 'apple' | 'github'
        providerId: string
        email: string
        name: string
        firstName?: string
        lastName?: string
    },
    avatarUrl?: string
) {
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
        if (!profile.first_name && firstName) updates.first_name = firstName
        if (!profile.last_name && lastName) updates.last_name = lastName
        if (shouldPersistAvatar(profile.avatar_url, avatarUrl)) updates.avatar_url = avatarUrl
        if (oauthInfo.provider === 'github' && !profile.github_id) updates.github_id = oauthInfo.providerId
        if (Object.keys(updates).length > 0) await updateProfile(userId, updates)
    } catch (error) {
        console.warn('[syncOAuthProfile] Profile sync failed', { userId, provider: oauthInfo.provider, error })
    }
}

/** Ensure default seed users exist in the database */
let seeded = false
async function ensureSeeded() {
    if (seeded) return
    seeded = true

    const col = await usersCollection()
    for (const seedUser of DEFAULT_USERS) {
        const existing = await col.find({
            filter: [{ field: 'id', op: 'eq', value: seedUser.id }],
        })
        if (!existing.length) {
            await col.insert(normalizeUser(seedUser))
        } else if (!existing[0]?.password && seedUser.password) {
            // Repair missing password
            await col.update(existing[0].id!, { password: seedUser.password })
        }
    }
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function getAllUsers(): Promise<User[]> {
    await ensureSeeded()
    const col = await usersCollection()
    const docs = await col.findAll()
    return docs as unknown as User[]
}

export async function findUserByUsername(username: string): Promise<User | undefined> {
    await ensureSeeded()
    const col = await usersCollection()
    const results = await col.find({
        filter: [{ field: 'username', op: 'eq', value: username }],
    })
    return results[0] as unknown as User | undefined
}

export async function findUserByEmail(email: string): Promise<User | undefined> {
    await ensureSeeded()
    const col = await usersCollection()
    const results = await col.find({
        filter: [{ field: 'email', op: 'eq', value: email }],
    })
    return results[0] as unknown as User | undefined
}

export async function findUserById(id: string): Promise<User | undefined> {
    await ensureSeeded()
    const col = await usersCollection()
    // RealDB uses its own auto-generated `id` field, but our users use a custom `id`.
    // We stored the app id as a field named `id`, so search by field.
    const results = await col.find({
        filter: [{ field: 'id', op: 'eq', value: id }],
    })
    return results[0] as unknown as User | undefined
}

export async function updateUserPassword(userId: string, newPassword: string): Promise<boolean> {
    const col = await usersCollection()
    const results = await col.find({
        filter: [{ field: 'id', op: 'eq', value: userId }],
    })
    if (!results[0]?.id) return false
    await col.update(results[0].id!, { password: newPassword })
    return true
}

export async function deleteUserById(userId: string): Promise<boolean> {
    const col = await usersCollection()
    const results = await col.find({
        filter: [{ field: 'id', op: 'eq', value: userId }],
    })
    if (!results[0]?.id) return false

    // Delete related records first
    await Promise.allSettled([
        deleteReaderStatsByUserId(userId),
        deleteTasbeehByUserId(userId),
        deleteProfileByUserId(userId),
    ])

    await col.delete(results[0].id!)
    return true
}

export async function addUser(user: User): Promise<void> {
    const normalized = normalizeUser(user)
    const col = await usersCollection()
    await col.insert(normalized)
}

export async function getUserStorageDiagnostics(): Promise<{
    source: 'realdb'
    usersCount: number
    dbReachable: boolean
    fallbackAllowed: boolean
}> {
    const col = await usersCollection()
    const usersCount = await col.count()
    return { source: 'realdb', usersCount, dbReachable: true, fallbackAllowed: true }
}

export async function updateUserRoleAndPermissions(
    userId: string,
    updates: { role?: string; permissions?: Array<{ action: string; subject: string }> }
): Promise<User | null> {
    const col = await usersCollection()
    const results = await col.find({
        filter: [{ field: 'id', op: 'eq', value: userId }],
    })
    if (!results[0]?.id) return null

    const payload: Partial<User> = {}
    if (updates.role) {
        payload.role = updates.role
        payload.permissions = resolveUserPermissions({ role: updates.role, permissions: updates.permissions ?? [] })
    } else if (updates.permissions) {
        payload.permissions = updates.permissions
    }

    const updated = await col.update(results[0].id!, payload)
    return updated as unknown as User
}

export async function banUser(userId: string, reason?: string): Promise<User | null> {
    const col = await usersCollection()
    const results = await col.find({
        filter: [{ field: 'id', op: 'eq', value: userId }],
    })
    if (!results[0]?.id) return null
    const updated = await col.update(results[0].id!, {
        banned: true,
        bannedAt: new Date().toISOString(),
        bannedReason: reason ?? null,
    })
    return updated as unknown as User
}

export async function unbanUser(userId: string): Promise<User | null> {
    const col = await usersCollection()
    const results = await col.find({
        filter: [{ field: 'id', op: 'eq', value: userId }],
    })
    if (!results[0]?.id) return null
    const updated = await col.update(results[0].id!, {
        banned: false,
        bannedAt: null,
        bannedReason: null,
    })
    return updated as unknown as User
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
    const providerField = getOAuthProviderField(provider) as keyof User

    await ensureSeeded()
    const col = await usersCollection()

    // 1. Find by provider ID
    let existingDocs = await col.find({
        filter: [{ field: providerField as string, op: 'eq', value: providerId }],
    })

    if (existingDocs[0]) {
        const rec = existingDocs[0] as unknown as User
        const persistedAvatar = await resolvePersistedOAuthAvatar(oauthInfo, rec.avatar_url)
        const updates: Partial<User> = {}
        if (!rec.first_name && firstName) updates.first_name = firstName
        if (!rec.last_name && lastName) updates.last_name = lastName
        if (shouldPersistAvatar(rec.avatar_url, persistedAvatar)) updates.avatar_url = persistedAvatar

        let user = rec
        if (Object.keys(updates).length > 0) {
            await col.update(existingDocs[0].id!, updates)
            user = { ...rec, ...updates }
        }
        await syncOAuthProfile(rec.id, oauthInfo, persistedAvatar || rec.avatar_url)
        return user
    }

    // 2. Find by email (link existing account)
    existingDocs = await col.find({
        filter: [{ field: 'email', op: 'eq', value: email }],
    })

    if (existingDocs[0]) {
        const rec = existingDocs[0] as unknown as User
        const persistedAvatar = await resolvePersistedOAuthAvatar(oauthInfo, rec.avatar_url)
        const updates: Partial<User> = { [providerField]: providerId }
        if (!rec.first_name && firstName) updates.first_name = firstName
        if (!rec.last_name && lastName) updates.last_name = lastName
        if (shouldPersistAvatar(rec.avatar_url, persistedAvatar)) updates.avatar_url = persistedAvatar

        await col.update(existingDocs[0].id!, updates)
        const user = { ...rec, ...updates }
        await syncOAuthProfile(rec.id, oauthInfo, persistedAvatar || rec.avatar_url)
        return user
    }

    // 3. Create new user
    const persistedAvatar = await resolvePersistedOAuthAvatar(oauthInfo)
    const username = createOAuthUsername(email)
    const userId = createOAuthUserId(provider, providerId)

    const newUser = normalizeUser({
        id: userId,
        username,
        email,
        password: '',
        role: 'user',
        first_name: firstName,
        last_name: lastName,
        avatar_url: persistedAvatar || picture,
        [providerField]: providerId,
        permissions: getRolePermissions('user'),
    })

    await col.insert(newUser)
    await syncOAuthProfile(userId, oauthInfo, persistedAvatar || picture)
    return newUser
}
