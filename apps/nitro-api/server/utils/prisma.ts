let _prisma: any = undefined
let _prismaAttempted = false

export async function getPrisma() {
    if (_prismaAttempted) {
        return _prisma
    }

    _prismaAttempted = true

    try {
        console.log('🔍 Attempting to load Prisma Client...')

        // Try dynamic import first (better for ESM/Netlify Functions)
        let prismaModule: any
        try {
            prismaModule = await import('@prisma/client')
            console.log('✅ Loaded via import()')
        } catch (importErr) {
            console.log('⚠️  import() failed, trying require():', importErr instanceof Error ? importErr.message : importErr)
            // Fallback to createRequire for environments that need it
            const { createRequire } = await import('node:module')
            const require = createRequire(import.meta.url)
            prismaModule = require('@prisma/client')
            console.log('✅ Loaded via require()')
        }

        const PrismaClient = prismaModule?.PrismaClient || prismaModule?.default?.PrismaClient

        if (!PrismaClient) {
            throw new Error('PrismaClient constructor not found in module')
        }

        console.log('✅ PrismaClient constructor found')

        type PrismaGlobal = typeof globalThis & {
            __peace2074Prisma?: any
        }

        const globalForPrisma = globalThis as PrismaGlobal
        _prisma = globalForPrisma.__peace2074Prisma ?? new PrismaClient()

        console.log('✅ PrismaClient instance created successfully')

        if (process.env.NODE_ENV !== 'production') {
            globalForPrisma.__peace2074Prisma = _prisma
        }
    } catch (error) {
        console.error('❌ Prisma initialization failed:')
        console.error('   Error:', error instanceof Error ? error.message : error)
        if (error instanceof Error && error.stack) {
            console.error('   Stack:', error.stack.split('\n').slice(0, 3).join('\n'))
        }
        _prisma = null
    }

    return _prisma
}

// Legacy sync export - returns null, callers should use getPrisma()
export const prisma = null
