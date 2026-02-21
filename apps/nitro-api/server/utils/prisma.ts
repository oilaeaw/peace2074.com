let _prisma: any = undefined
let _prismaAttempted = false

export async function getPrisma() {
    // Skip Prisma entirely in Netlify Functions runtime
    if (process.env.NETLIFY || process.env.NETLIFY_BUILD) {
        return null
    }

    if (_prismaAttempted) {
        return _prisma
    }

    _prismaAttempted = true

    try {
        // Dynamic import to defer loading until runtime
        const { createRequire } = await import('node:module')
        const require = createRequire(import.meta.url)
        const prismaPackageName = ['@prisma', 'client'].join('/')
        const prismaModule = require(prismaPackageName) as Record<string, any>
        const PrismaClient = prismaModule?.PrismaClient || prismaModule?.default?.PrismaClient

        if (!PrismaClient) {
            throw new Error('PrismaClient constructor missing')
        }

        type PrismaGlobal = typeof globalThis & {
            __peace2074Prisma?: any
        }

        const globalForPrisma = globalThis as PrismaGlobal
        _prisma = globalForPrisma.__peace2074Prisma ?? new PrismaClient()

        if (process.env.NODE_ENV !== 'production') {
            globalForPrisma.__peace2074Prisma = _prisma
        }
    } catch (error) {
        console.warn('Prisma unavailable, using fallback storage:', error instanceof Error ? error.message : 'unknown')
        _prisma = null
    }

    return _prisma
}

// Legacy sync export - returns null, callers should use getPrisma()
export const prisma = null
