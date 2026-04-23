let _prisma: any = undefined
let _prismaLoading: Promise<any> | null = null

// Local MongoDB fallback URI — used automatically when the primary DATABASE_URL is unreachable.
// Set DATABASE_URL_LOCAL in .env to override (e.g. a different local port/db name).
const LOCAL_FALLBACK_URI = process.env.DATABASE_URL_LOCAL || 'mongodb://localhost:27017/peace2074'

async function loadPrismaModule() {
    try {
        const m = await import('@prisma/client')
        return m
    } catch {
        const { createRequire } = await import('node:module')
        const require = createRequire(import.meta.url)
        return require('@prisma/client')
    }
}

async function tryConnect(PrismaClient: any, url: string): Promise<any> {
    const client = new PrismaClient({ datasources: { db: { url } } })
    await client.$connect()
    return client
}

export async function getPrisma() {
    if (_prisma !== undefined) {
        return _prisma
    }

    if (_prismaLoading) {
        return _prismaLoading
    }

    _prismaLoading = (async () => {
        try {
            if (process.env.DISABLE_PRISMA === 'true') {
                throw new Error('Prisma disabled via DISABLE_PRISMA env var')
            }

            const prismaModule = await loadPrismaModule()
            const PrismaClient = prismaModule?.PrismaClient || prismaModule?.default?.PrismaClient

            if (!PrismaClient) {
                throw new Error('PrismaClient constructor not found in module')
            }

            type PrismaGlobal = typeof globalThis & { __peace2074Prisma?: any }
            const globalForPrisma = globalThis as PrismaGlobal

            // Re-use an already connected instance if available
            if (globalForPrisma.__peace2074Prisma) {
                _prisma = globalForPrisma.__peace2074Prisma
                return _prisma
            }

            const primaryUrl = process.env.DATABASE_URL

            // 1️⃣ Try primary (Atlas or whatever DATABASE_URL points to)
            if (primaryUrl) {
                try {
                    console.log('🔌 Connecting to primary database...')
                    const client = await tryConnect(PrismaClient, primaryUrl)
                    globalForPrisma.__peace2074Prisma = client
                    _prisma = client
                    console.log('✅ Connected to primary database')
                    return _prisma
                } catch (primaryErr) {
                    console.warn('⚠️  Primary database unreachable:', primaryErr instanceof Error ? primaryErr.message : primaryErr)
                }
            } else {
                console.warn('⚠️  DATABASE_URL not set — skipping primary')
            }

            // 2️⃣ Fallback to local MongoDB (offline / disaster-recovery mode)
            try {
                console.log(`🔌 Trying local fallback: ${LOCAL_FALLBACK_URI}`)
                const client = await tryConnect(PrismaClient, LOCAL_FALLBACK_URI)
                globalForPrisma.__peace2074Prisma = client
                _prisma = client
                console.log('✅ Connected to LOCAL fallback database')
                return _prisma
            } catch (localErr) {
                console.error('❌ Local fallback also failed:', localErr instanceof Error ? localErr.message : localErr)
            }

            _prisma = null
        } catch (error) {
            console.error('❌ Prisma initialization failed:', error instanceof Error ? error.message : error)
            _prisma = null
        }

        return _prisma
    })()

    try {
        return await _prismaLoading
    } finally {
        if (_prisma === null) {
            // Allow retry on next request
            _prisma = undefined
        }
        _prismaLoading = null
    }
}

// Legacy sync export - returns null, callers should use getPrisma()
export const prisma = null
