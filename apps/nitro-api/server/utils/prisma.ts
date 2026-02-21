import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const { PrismaClient } = require('@prisma/client') as typeof import('@prisma/client')

type PrismaGlobal = typeof globalThis & {
    __peace2074Prisma?: PrismaClient
}

const globalForPrisma = globalThis as PrismaGlobal

export const prisma = globalForPrisma.__peace2074Prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.__peace2074Prisma = prisma
}
