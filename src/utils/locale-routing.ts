import localeMessages from '@/locale'

export type AppLocale = keyof typeof localeMessages

export const AVAILABLE_LOCALES = Object.keys(localeMessages) as AppLocale[]
export const DEFAULT_LOCALE: AppLocale = 'en'
export const LOCALE_STORAGE_KEY = 'app-locale'
export const LOCALE_ROUTE_PARAM_PATTERN = AVAILABLE_LOCALES.join('|')

const LOCALE_PREFIX_RE = new RegExp(
    `^/(${LOCALE_ROUTE_PARAM_PATTERN})(?=/|$)`,
    'i'
)

function normalizePath(path: string) {
    const normalized = String(path || '/').trim()
    const withLeadingSlash = normalized.startsWith('/')
        ? normalized
        : `/${normalized}`
    const collapsed = withLeadingSlash.replace(/\/+/g, '/') || '/'

    if (collapsed.length > 1 && collapsed.endsWith('/')) {
        return collapsed.slice(0, -1)
    }

    return collapsed
}

export function normalizeLocale(
    localeValue: string | null | undefined,
    availableLocales: readonly AppLocale[] = AVAILABLE_LOCALES
): AppLocale | null {
    if (!localeValue) return null

    const normalized = String(localeValue).trim().toLowerCase().replace('_', '-')
    if (!normalized) return null

    const legacyMap: Record<string, string> = {
        iw: 'he',
        in: 'id',
        ji: 'yi',
    }

    const normalizedBase = normalized.split('-')[0]
    const mapped = legacyMap[normalizedBase] || normalizedBase
    return availableLocales.includes(mapped as AppLocale)
        ? (mapped as AppLocale)
        : null
}

export function persistLocale(localeValue: AppLocale) {
    if (typeof window === 'undefined' || !localeValue) return

    try {
        window.localStorage?.setItem(LOCALE_STORAGE_KEY, localeValue)
    } catch {
        /* noop */
    }
}

export function extractLocaleFromPath(path: string) {
    const match = normalizePath(path).match(LOCALE_PREFIX_RE)
    return normalizeLocale(match?.[1])
}

export function isLocalePrefixedPath(path: string) {
    return Boolean(extractLocaleFromPath(path))
}

export function stripLocalePrefix(path: string) {
    const normalizedPath = normalizePath(path)
    const strippedPath = normalizedPath.replace(LOCALE_PREFIX_RE, '') || '/'
    return strippedPath.startsWith('/') ? strippedPath : `/${strippedPath}`
}

export function buildLocalePath(
    path: string,
    localeValue: string | null | undefined,
    options: { forcePrefix?: boolean } = {}
) {
    const normalizedLocale = normalizeLocale(localeValue)
    const normalizedPath = stripLocalePrefix(path)

    if (!normalizedLocale) {
        return normalizedPath
    }

    if (!options.forcePrefix && normalizedLocale === DEFAULT_LOCALE) {
        return normalizedPath
    }

    if (normalizedPath === '/') {
        return `/${normalizedLocale}`
    }

    return `/${normalizedLocale}${normalizedPath}`
}

export function buildLocaleAlias(path: string) {
    const normalizedPath = stripLocalePrefix(path)
    const localePrefix = `/:locale(${LOCALE_ROUTE_PARAM_PATTERN})`

    if (normalizedPath === '/') {
        return localePrefix
    }

    return `${localePrefix}${normalizedPath}`
}