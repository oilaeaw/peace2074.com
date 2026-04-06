let _prisma: any = undefined
let _prismaLoading: Promise<any> | null = null

export async function getPrisma() {
    if (_prisma !== undefined) {
        return _prisma
    }

    if (_prismaLoading) {
        return _prismaLoading
    }

    _prismaLoading = (async () => {
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

            // Skip Prisma if explicitly disabled for local dev
            if (process.env.DISABLE_PRISMA === 'true') {
                throw new Error('Prisma disabled via DISABLE_PRISMA env var')
            }

            type PrismaGlobal = typeof globalThis & {
                __peace2074Prisma?: any
            }

            const globalForPrisma = globalThis as PrismaGlobal
            const prismaClient = globalForPrisma.__peace2074Prisma ?? new PrismaClient()

            console.log('✅ PrismaClient instance created successfully')
            console.log('🔌 Connecting Prisma Client...')
            await prismaClient.$connect()
            console.log('✅ Prisma Client connected successfully')
        } catch (error) {
            console.error('❌ Prisma initialization failed:')
            console.error('   Error:', error instanceof Error ? error.message : error)
            if (error instanceof Error && error.stack) {
                console.error('   Stack:', error.stack.split('\n').slice(0, 3).join('\n'))
            }
            _prisma = null
        }

        return _prisma
    })()

    try {
        return await _prismaLoading
    } finally {
        if (_prisma === null) {
            // Allow future calls to retry after transient connectivity failures.
            _prisma = undefined
        }
        _prismaLoading = null
    }
}

// Legacy sync export - returns null, callers should use getPrisma()
export const prisma = null
