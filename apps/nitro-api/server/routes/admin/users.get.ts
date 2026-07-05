import { defineEventHandler } from 'h3'
import { readSession } from '../../utils/auth'
import { getDb } from '../../utils/realdb'
import { getAllUsers } from '../../utils/users'

/**
 * GET /api/admin/users
 * Returns all users enriched with session, profile, quran progress, reader stats.
 * Requires admin role.
 */
export default defineEventHandler(async (event) => {
    const session = readSession(event)

    if (!session || session.role !== 'admin') {
        return { ok: false, error: 'Forbidden' }
    }

    try {
        const db = await getDb()

        const [users, allSessions, allProfiles, allProgress, allReaderStats] = await Promise.all([
            getAllUsers(),
            db.collection('sessions').findAll() as Promise<any[]>,
            db.collection('profiles').findAll() as Promise<any[]>,
            db.collection('quranProgress').findAll() as Promise<any[]>,
            db.collection('readerStats').findAll() as Promise<any[]>,
        ])

        const enriched = users.map((user) => {
            const uid = user.id

            // Sessions for this user
            const userSessions = allSessions.filter((s) => s.userId === uid)
            const latestSession = userSessions.sort((a, b) =>
                String(b.createdAt || '').localeCompare(String(a.createdAt || ''))
            )[0]

            // Profile
            const profile = allProfiles.find((p) => p.userId === uid)

            // Quran progress
            const progress = allProgress.find((p) => p.userId === uid)

            // Reader stats
            const userReaderStats = allReaderStats.filter((s) => s.userId === uid)
            const lastRead = userReaderStats.sort((a, b) =>
                String(b.timestamp || '').localeCompare(String(a.timestamp || ''))
            )[0]

            return {
                id: uid,
                username: user.username,
                email: user.email,
                role: user.role,
                permissions: user.permissions,
                google_id: user.google_id,
                apple_id: user.apple_id,
                github_id: user.github_id,
                first_name: user.first_name,
                last_name: user.last_name,
                avatar_url: user.avatar_url,
                banned: user.banned,
                lastLogin: latestSession?.createdAt ?? null,
                lastLoginProvider: latestSession?.provider ?? null,
                loginCount: userSessions.length,
                bookmarkCount: Array.isArray(profile?.bookmarks) ? profile.bookmarks.length : 0,
                tasbeehTotal: profile?.tasbeeh_summary?.total ?? 0,
                completedSurasCount: Array.isArray(progress?.completedSuras) ? progress.completedSuras.length : 0,
                lastReadSura: lastRead?.sura ?? null,
                lastReadAt: lastRead?.timestamp ?? null,
            }
        })

        return { ok: true, users: enriched }
    } catch (err: any) {
        console.error('[admin/users GET] Error:', err)
        return { ok: false, error: err?.message || 'Failed to fetch users' }
    }
})
