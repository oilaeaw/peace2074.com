import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const prismaPackageName = ['@prisma', 'client'].join('/')
const prismaModule = require(prismaPackageName) as Record<string, any>
const PrismaClient = prismaModule?.PrismaClient || prismaModule?.default?.PrismaClient

if (!PrismaClient) {
    throw new Error('PrismaClient constructor not found in @prisma/client module')
}

type PrismaGlobal = typeof globalThis & {
    __peace2074Prisma?: any
}

const globalForPrisma = globalThis as PrismaGlobal

export const prisma = globalForPrisma.__peace2074Prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.__peace2074Prisma = prisma
}
