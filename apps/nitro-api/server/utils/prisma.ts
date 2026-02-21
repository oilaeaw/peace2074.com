import { createRequire } from 'node:module'

let PrismaClient: any
let prisma: any

try {
    const require = createRequire(import.meta.url)
    const prismaPackageName = ['@prisma', 'client'].join('/')
    const prismaModule = require(prismaPackageName) as Record<string, any>
    PrismaClient = prismaModule?.PrismaClient || prismaModule?.default?.PrismaClient

    if (!PrismaClient) {
        throw new Error('PrismaClient constructor not found')
    }

    type PrismaGlobal = typeof globalThis & {
        __peace2074Prisma?: any
    }

    const globalForPrisma = globalThis as PrismaGlobal
    prisma = globalForPrisma.__peace2074Prisma ?? new PrismaClient()

    if (process.env.NODE_ENV !== 'production') {
        globalForPrisma.__peace2074Prisma = prisma
    }
} catch (error) {
    // Prisma failed to load - fallback storage will be used
    console.warn('Prisma Client unavailable, using fallback storage:', error instanceof Error ? error.message : 'unknown error')
    prisma = null
}

export { prisma }
