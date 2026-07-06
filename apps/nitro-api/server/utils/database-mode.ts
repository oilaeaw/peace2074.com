import { createError } from 'h3'

function getCauseMessage(cause: unknown) {
    if (cause instanceof Error) return cause.message
    if (typeof cause === 'string') return cause
    return undefined
}

export function createDatabaseRequiredError(cause?: unknown) {
    const causeMessage = getCauseMessage(cause)
    return createError({
        statusCode: 503,
        statusMessage: 'Database unavailable.',
        data: causeMessage ? { cause: causeMessage } : undefined,
    })
}

/**
 * Returns true when the server is running without a primary database
 * (e.g. Cloudflare Workers / edge environments) and fallback in-memory
 * or KV-based auth storage is permitted.
 */
export function isFallbackAuthStorageAllowed(): boolean {
    const uri =
        process.env.NITRO_MONGODB_URI ||
        process.env.MONGODB_URI ||
        process.env.NITRO_DATABASE_URL ||
        process.env.DATABASE_URL ||
        ''
    return !uri
}
