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
