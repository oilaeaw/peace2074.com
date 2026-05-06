/**
 * Strip locale prefixes from API request paths.
 *
 * Some clients (bots, crawlers, or cached service-worker requests) may hit
 * locale-prefixed paths like /en/auth/settings instead of /auth/settings.
 * This middleware rewrites the path in-place before the router resolves it,
 * so locale-prefixed requests are handled the same as their canonical paths.
 *
 * Supported locales mirror the frontend locale list.
 */

import { defineEventHandler } from 'h3'

const SUPPORTED_LOCALES = new Set(['en', 'ar', 'de', 'ru', 'he', 'es', 'it', 'tr'])
// Matches /{locale}/rest  or  /{locale}  at the start of a path
const LOCALE_PREFIX_RE = /^\/([a-z]{2})(\/.*)?$/

export default defineEventHandler((event) => {
    const path = event.path ?? ''
    const match = LOCALE_PREFIX_RE.exec(path)

    if (match && SUPPORTED_LOCALES.has(match[1])) {
        // Strip the locale segment; preserve the remainder (or fall back to '/')
        event.path = match[2] ?? '/'
    }
})
