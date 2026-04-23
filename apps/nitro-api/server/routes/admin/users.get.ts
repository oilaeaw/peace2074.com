import { defineEventHandler } from 'h3'
import { readSession } from '../../utils/auth'
import { getMongoose } from '../../utils/mongoose'
import { UserModel } from '../../models/User'

/**
 * GET /api/admin/users
 * Returns all users enriched via MongoDB $lookup aggregate.
 * Includes: latest session, profile, quran progress, reader stats.
 * Requires admin role.
 */
export default defineEventHandler(async (event) => {
    const session = readSession(event)

    if (!session || session.role !== 'admin') {
        return { ok: false, error: 'Forbidden' }
    }

    try {
        await getMongoose()

        const users = await UserModel.aggregate([
            // 1. Join latest session per user
            {
                $lookup: {
                    from: 'UserSession',
                    let: { uid: '$_id' },
                    pipeline: [
                        { $match: { $expr: { $eq: ['$userId', '$$uid'] } } },
                        { $sort: { createdAt: -1 } },
                        { $limit: 1 },
                        { $project: { _id: 0, createdAt: 1, provider: 1, ip: 1 } },
                    ],
                    as: 'latestSession',
                },
            },
            // 2. Count all sessions (login count)
            {
                $lookup: {
                    from: 'UserSession',
                    let: { uid: '$_id' },
                    pipeline: [
                        { $match: { $expr: { $eq: ['$userId', '$$uid'] } } },
                        { $count: 'total' },
                    ],
                    as: 'sessionCount',
                },
            },
            // 3. Join profile (bookmarks, settings, tasbeeh_summary)
            {
                $lookup: {
                    from: 'Profile',
                    localField: '_id',
                    foreignField: 'userId',
                    as: 'profile',
                },
            },
            // 4. Join quran progress
            {
                $lookup: {
                    from: 'QuranProgress',
                    localField: '_id',
                    foreignField: 'userId',
                    as: 'quranProgress',
                },
            },
            // 5. Last reader activity
            {
                $lookup: {
                    from: 'ReaderStats',
                    let: { uid: '$_id' },
                    pipeline: [
                        { $match: { $expr: { $eq: ['$userId', '$$uid'] } } },
                        { $sort: { timestamp: -1 } },
                        { $limit: 1 },
                        { $project: { _id: 0, sura: 1, timestamp: 1 } },
                    ],
                    as: 'lastRead',
                },
            },
            // 6. Shape the output — exclude password
            {
                $project: {
                    id: '$_id',
                    username: 1,
                    email: 1,
                    role: 1,
                    permissions: 1,
                    google_id: 1,
                    apple_id: 1,
                    github_id: 1,
                    first_name: 1,
                    last_name: 1,
                    avatar_url: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    lastLogin: { $arrayElemAt: ['$latestSession.createdAt', 0] },
                    lastLoginProvider: { $arrayElemAt: ['$latestSession.provider', 0] },
                    loginCount: { $ifNull: [{ $arrayElemAt: ['$sessionCount.total', 0] }, 0] },
                    bookmarkCount: {
                        $size: { $ifNull: [{ $arrayElemAt: ['$profile.bookmarks', 0] }, []] },
                    },
                    tasbeehTotal: {
                        $ifNull: [
                            { $getField: { field: 'total', input: { $arrayElemAt: ['$profile.tasbeeh_summary', 0] } } },
                            0,
                        ],
                    },
                    completedSurasCount: {
                        $size: { $ifNull: [{ $arrayElemAt: ['$quranProgress.completedSuras', 0] }, []] },
                    },
                    lastReadSura: { $arrayElemAt: ['$lastRead.sura', 0] },
                    lastReadAt: { $arrayElemAt: ['$lastRead.timestamp', 0] },
                },
            },
            { $sort: { createdAt: -1 } },
        ])

        return { ok: true, users }
    } catch (err: any) {
        console.error('[admin/users GET] Error:', err)
        return { ok: false, error: err?.message || 'Failed to fetch users' }
    }
})

