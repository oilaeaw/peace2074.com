#!/usr/bin/env node
/**
 * Migration script to add chat permissions to existing users.
 * Run with: node --experimental-strip-types apps/nitro-api/scripts/migrate-chat-permissions.ts
 */

import { PrismaClient, type Prisma } from '@prisma/client'
import 'dotenv/config'

type PermissionRule = {
    action: string
    subject: string
}

const prisma = new PrismaClient()

const CaslAction = {
    CREATE: 'create',
    READ: 'read',
    UPDATE: 'update',
    DELETE: 'delete',
    MANAGE: 'manage',
} as const

const CaslSubject = {
    ALL: 'all',
    ADMIN: 'admin',
    CATEGORY: 'category',
    CHAT: 'chat',
    LIKES: 'likes',
    MEDIAFILE: 'mediafile',
    PERMISSIONS: 'permissions',
    POST: 'post',
    ROLES: 'roles',
    REFRESH_TOKEN: 'reshresh_token',
    TWEET: 'tweet',
    USER: 'user',
} as const

function getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error)
}

function isPermissionRule(value: unknown): value is PermissionRule {
    return (
        typeof value === 'object'
        && value !== null
        && typeof (value as PermissionRule).action === 'string'
        && typeof (value as PermissionRule).subject === 'string'
    )
}

function extractPermissions(value: Prisma.JsonValue | null): PermissionRule[] {
    if (!Array.isArray(value)) {
        return []
    }

    return value.filter(isPermissionRule)
}

function getDefaultPermissions(role: string): PermissionRule[] {
    const basePermissions: PermissionRule[] = [
        { action: CaslAction.READ, subject: CaslSubject.CATEGORY },
        { action: CaslAction.READ, subject: CaslSubject.POST },
        { action: CaslAction.CREATE, subject: CaslSubject.USER },
        { action: CaslAction.READ, subject: CaslSubject.USER },
        { action: CaslAction.UPDATE, subject: CaslSubject.USER },
    ]

    if (role === 'admin') {
        return [
            ...basePermissions,
            { action: CaslAction.MANAGE, subject: CaslSubject.ADMIN },
            { action: CaslAction.MANAGE, subject: CaslSubject.CHAT },
            { action: CaslAction.READ, subject: CaslSubject.CHAT },
        ]
    }

    if (role === 'editor') {
        return [
            ...basePermissions,
            { action: CaslAction.UPDATE, subject: CaslSubject.POST },
            { action: CaslAction.READ, subject: CaslSubject.CHAT },
        ]
    }

    return [
        ...basePermissions,
        { action: CaslAction.READ, subject: CaslSubject.CHAT },
    ]
}

async function main() {
    console.log('🔄 Starting chat permissions migration...')

    try {
        const users = await prisma.user.findMany()
        console.log(`📊 Found ${users.length} users to migrate`)

        let updated = 0
        let skipped = 0

        for (const user of users) {
            try {
                const permissions = extractPermissions(user.permissions)
                const hasChat = permissions.some(
                    permission => permission.subject === CaslSubject.CHAT,
                )

                if (hasChat) {
                    console.log(
                        `⏭️  Skipping ${user.username} - already has chat permissions`,
                    )
                    skipped += 1
                    continue
                }

                const newPermissions = getDefaultPermissions(user.role)

                await prisma.user.update({
                    where: { id: user.id },
                    data: { permissions: newPermissions as Prisma.InputJsonValue },
                })

                console.log(
                    `✅ Updated ${user.username} (${user.role}) with ${newPermissions.length} permissions`,
                )
                updated += 1
            }
            catch (error) {
                console.error(`❌ Failed to update ${user.username}:`, getErrorMessage(error))
            }
        }

        console.log('\n📈 Migration Summary:')
        console.log(`   ✅ Updated: ${updated}`)
        console.log(`   ⏭️  Skipped: ${skipped}`)
        console.log(`   📊 Total: ${users.length}`)
        console.log('\n✨ Migration completed successfully!')
    }
    catch (error) {
        console.error('❌ Migration failed:', error)
        process.exit(1)
    }
    finally {
        await prisma.$disconnect()
    }
}

main()