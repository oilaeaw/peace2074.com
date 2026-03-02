let _prisma: any = undefined
let _prismaAttempted = false

export async function getPrisma() {
    if (_prismaAttempted) {
        return _prisma
    }

    _prismaAttempted = true

    try {
        // Dynamic import to defer loading until runtime
        const { createRequire } = await import('node:module')
        const require = createRequire(import.meta.url)
        const prismaPackageName = ['@prisma', 'client'].join('/')

        console.log('🔍 Attempting to load Prisma from:', prismaPackageName)
        console.log('📂 import.meta.url:', import.meta.url)

        const prismaModule = require(prismaPackageName) as Record<string, any>
        const PrismaClient = prismaModule?.PrismaClient || prismaModule?.default?.PrismaClient

        if (!PrismaClient) {
            throw new Error('PrismaClient constructor missing')
        }

        console.log('✅ PrismaClient loaded successfully')

        type PrismaGlobal = typeof globalThis & {
            __peace2074Prisma?: any
        }

        const globalForPrisma = globalThis as PrismaGlobal
        _prisma = globalForPrisma.__peace2074Prisma ?? new PrismaClient()

        console.log('✅ PrismaClient instance created')

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
