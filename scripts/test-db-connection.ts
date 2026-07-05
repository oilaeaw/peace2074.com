#!/usr/bin/env node
/**
 * Test MongoDB connection (local by default).
 * Usage: node --experimental-strip-types scripts/test-db-connection.ts
 */

import 'dotenv/config'
import { resolvePrimaryDatabaseUri, maskDatabaseUri } from '../apps/nitro-api/server/utils/database-uri.ts'

function getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error)
}

console.log('🔍 Testing MongoDB Connection...\n')

const uri = resolvePrimaryDatabaseUri()

console.log('📋 Environment Check:')
console.log(`   Resolved URI: ${maskDatabaseUri(uri)}`)
console.log('')

try {
    console.log('🔌 Attempting Mongoose connection...')

    const { getMongoose } = await import('../apps/nitro-api/server/utils/mongoose.ts')
    await getMongoose()
    console.log('   ✅ Connected to MongoDB!')

    const mongoose = await import('mongoose')
    const db = mongoose.default.connection.db
    if (!db) {
        throw new Error('Database handle unavailable after connect')
    }

    const collections = await db.listCollections().toArray()
    console.log(`   📊 Collections: ${collections.length}`)
    collections.slice(0, 10).forEach((collection) => {
        console.log(`      • ${collection.name}`)
    })

    await mongoose.default.disconnect()
    console.log('\n✨ Database connection test successful!')
    console.log('\n💡 Local MongoDB is configured.')
    console.log('   Start it with: brew services start mongodb-community')
}
catch (error) {
    const message = getErrorMessage(error)

    console.error('\n❌ Database connection failed!')
    console.error(`   Error: ${message}`)

    if (message.includes('ECONNREFUSED') || message.includes('ETIMEDOUT')) {
        console.error('\n💡 Solution:')
        console.error('   Start local MongoDB: brew services start mongodb-community')
        console.error('   Or set DATABASE_URL in .env to your Mongo host')
    }

    process.exit(1)
}
