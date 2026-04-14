import { createError } from 'h3'

function normalizeFlag(value: string | undefined) {
    return String(value || '').trim().toLowerCase()
}

export function isDatabaseRequired() {
    const requireDatabase = normalizeFlag(process.env.REQUIRE_DATABASE)
    const allowFallback = normalizeFlag(process.env.ALLOW_FALLBACK_AUTH_STORAGE)
    const nodeEnv = normalizeFlag(process.env.NODE_ENV)
    const netlifyContext = normalizeFlag(process.env.CONTEXT)

    if (requireDatabase === 'true') return true
    if (allowFallback === 'true') return false

    return nodeEnv === 'production' || netlifyContext === 'production'
}

export function isFallbackAuthStorageAllowed() {
    return !isDatabaseRequired()
}

function getCauseMessage(cause: unknown) {
    if (cause instanceof Error) return cause.message
    if (typeof cause === 'string') return cause
    return undefined
}

export function createDatabaseRequiredError(cause?: unknown) {
    const causeMessage = getCauseMessage(cause)

    return createError({
        statusCode: 503,
        statusMessage: 'Database unavailable. Fallback auth storage is disabled in production.',
        data: causeMessage ? { cause: causeMessage } : undefined,
    })
}
