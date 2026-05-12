#!/usr/bin/env node
/**
 * Test database connection and show diagnostic information.
 * Usage: node --experimental-strip-types scripts/test-db-connection.ts
 */

import 'dotenv/config'

interface DatabaseUserSummary {
    username: string
    email: string
    role: string
    createdAt: Date
}

interface PrismaLikeClient {
    $connect: () => Promise<void>
    $disconnect: () => Promise<void>
    user: {
        count: () => Promise<number>
        findMany: (args: {
            select: {
                username: true
                email: true
                role: true
                createdAt: true
            }
        }) => Promise<DatabaseUserSummary[]>
    }
}

interface PrismaModule {
    PrismaClient: new (options: { log: Array<'error' | 'warn'> }) => PrismaLikeClient
}

interface PrismaModuleImport {
    PrismaClient?: PrismaModule['PrismaClient']
    default?: PrismaModule
}

function getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error)
}

console.log('🔍 Testing Database Connection...\n')

// Check environment variables
console.log('📋 Environment Check:')
console.log(
    `   DATABASE_URL: ${process.env.DATABASE_URL ? '✅ Set' : '❌ Not set'}`,
)
console.log(`   Length: ${process.env.DATABASE_URL?.length || 0} characters`)

if (process.env.DATABASE_URL) {
    const masked = process.env.DATABASE_URL.replace(
        /mongodb\+srv:\/\/([^:]+):([^@]+)@/,
        'mongodb+srv://$1:***@',
    )
    console.log(`   Masked: ${masked.substring(0, 80)}...`)
}

console.log('')

try {
    console.log('🔌 Attempting Prisma connection...')

    const prismaModule = await import(
        '../apps/nitro-api/node_modules/@prisma/client/index.js'
    ) as unknown as PrismaModuleImport
    const PrismaClient
        = prismaModule.PrismaClient || prismaModule.default?.PrismaClient

    if (!PrismaClient) {
        throw new Error('Failed to resolve PrismaClient from apps/nitro-api.')
    }

    const prisma = new PrismaClient({
        log: ['error', 'warn'],
    })

    console.log('   ✅ PrismaClient initialized')

    await prisma.$connect()
    console.log('   ✅ Connected to database!')

    const userCount = await prisma.user.count()
    console.log(`   📊 Found ${userCount} user(s) in database`)

    const users = await prisma.user.findMany({
        select: {
            username: true,
            email: true,
            role: true,
            createdAt: true,
        },
    })

    console.log('\n   👥 Users:')
    users.forEach((user: DatabaseUserSummary) => {
        console.log(`      • ${user.username} (${user.role}) - ${user.email}`)
    })

    await prisma.$disconnect()
    console.log('\n✨ Database connection test successful!')
    console.log('\n💡 Your database is properly configured.')
    console.log('   If signups are still failing, check:')
    console.log('   1. MongoDB Atlas Network Access (allow 0.0.0.0/0)')
    console.log('   2. Cloudflare environment variables are set')
    console.log('   3. Recent deployment after setting env vars')
}
catch (error) {
    const message = getErrorMessage(error)

    console.error('\n❌ Database connection failed!')
    console.error(`   Error: ${message}`)

    if (message.includes('Environment variable not found')) {
        console.error('\n💡 Solution:')
        console.error('   DATABASE_URL is not set. Check your .env file.')
        console.error('   Make sure you are running from the project root.')
    }
    else if (message.includes('Authentication failed')) {
        console.error('\n💡 Solution:')
        console.error('   MongoDB authentication failed. Check:')
        console.error('   1. Username and password are correct')
        console.error('   2. Database user has proper permissions')
        console.error('   3. Connection string format is correct')
    }
    else if (message.includes('ENOTFOUND') || message.includes('ETIMEDOUT')) {
        console.error('\n💡 Solution:')
        console.error('   Cannot reach MongoDB server. Check:')
        console.error('   1. MongoDB Atlas Network Access allows your IP')
        console.error('   2. Cluster hostname is correct')
        console.error('   3. Internet connection is working')
    }
    else if (message.toLowerCase().includes('prisma')) {
        console.error('\n💡 Solution:')
        console.error('   Prisma client issue. Try:')
        console.error('   cd apps/nitro-api && pnpm prisma:generate')
    }

    console.error('\n📚 For more help, see DATABASE_CONNECTION_FIX.md')
    process.exit(1)
}