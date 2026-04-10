import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { PrismaClient, type Prisma } from '@prisma/client'

interface LegacyUserInput {
    id?: unknown
    username?: unknown
    password?: unknown
    email?: unknown
    role?: unknown
    first_name?: unknown
    last_name?: unknown
    tasbeeh?: unknown
    bookmarks?: unknown
    avatar_url?: unknown
    github_id?: unknown
}

interface NormalizedUser {
    id: string
    username: string
    password: string
    email: string
    role: string
    first_name: string | null
    last_name: string | null
    tasbeeh: Prisma.InputJsonValue
    bookmarks: Prisma.InputJsonValue
    avatar_url: string | null
    github_id: string | null
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null
}

function getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error)
}

const prisma = new PrismaClient()
const usersFile = resolve(process.cwd(), '.data/kv/db/users')

function normalize(user: LegacyUserInput = {}): NormalizedUser {
    return {
        id: String(user.id || ''),
        username: String(user.username || '').trim(),
        password: String(user.password || '').trim(),
        email: String(user.email || '').trim(),
        role: String(user.role || 'user'),
        first_name: String(user.first_name || '').trim() || null,
        last_name: String(user.last_name || '').trim() || null,
        tasbeeh: (Array.isArray(user.tasbeeh) ? user.tasbeeh : []) as Prisma.InputJsonValue,
        bookmarks: (Array.isArray(user.bookmarks) ? user.bookmarks : []) as Prisma.InputJsonValue,
        avatar_url: user.avatar_url ? String(user.avatar_url) : null,
        github_id: user.github_id ? String(user.github_id) : null,
    }
}

async function run() {
    let users: LegacyUserInput[] = []

    try {
        const raw = await readFile(usersFile, 'utf8')
        const parsed = JSON.parse(raw) as unknown
        users = Array.isArray(parsed)
            ? parsed.filter(isRecord) as LegacyUserInput[]
            : []
    }
    catch (error) {
        console.error(`[sync-users] Failed to read ${usersFile}:`, getErrorMessage(error))
        process.exitCode = 1
        return
    }

    if (!users.length) {
        console.log('[sync-users] No users found in legacy KV file.')
        return
    }

    let synced = 0

    for (const user of users) {
        const normalized = normalize(user)

        if (!normalized.id || !normalized.username || !normalized.email) {
            continue
        }

        const existing = await prisma.user.findFirst({
            where: {
                OR: [
                    { id: normalized.id },
                    { username: normalized.username },
                    { email: normalized.email },
                ],
            },
        })

        const payload = {
            username: normalized.username,
            password: normalized.password,
            email: normalized.email,
            role: normalized.role,
            first_name: normalized.first_name,
            last_name: normalized.last_name,
            tasbeeh: normalized.tasbeeh,
            bookmarks: normalized.bookmarks,
            avatar_url: normalized.avatar_url,
            github_id: normalized.github_id,
        }

        if (existing) {
            await prisma.user.update({
                where: { id: existing.id },
                data: payload as Prisma.UserUncheckedUpdateInput,
            })
        }
        else {
            await prisma.user.create({
                data: {
                    id: normalized.id,
                    ...payload,
                } as Prisma.UserUncheckedCreateInput,
            })
        }

        synced += 1
    }

    const count = await prisma.user.count()
    console.log(`[sync-users] Synced ${synced} user(s). DB now has ${count} user(s).`)
}

run()
    .catch((error) => {
        console.error('[sync-users] Unexpected error:', error)
        process.exitCode = 1
    })
    .finally(async () => {
        await prisma.$disconnect()
    })