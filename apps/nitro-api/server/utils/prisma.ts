import { PrismaClient } from '@prisma/client'

type PrismaGlobal = typeof globalThis & {
    __peace2074Prisma?: PrismaClient
}

const globalForPrisma = globalThis as PrismaGlobal

export const prisma = globalForPrisma.__peace2074Prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.__peace2074Prisma = prisma
}
