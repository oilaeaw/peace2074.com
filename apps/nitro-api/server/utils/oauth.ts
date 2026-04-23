import { Google, Apple } from 'arctic'
import { Buffer } from 'node:buffer'
import {
    createError,
    getHeader,
    getRequestURL,
    setResponseHeader,
    type H3Event,
} from 'h3'

interface OAuthConfig {
    google: {
        clientId: string
        clientSecret: string
        redirectUri: string
    }
    apple: {
        clientId: string
        teamId: string
        keyId: string
        privateKey: Uint8Array
        redirectUri: string
    }
}

function normalizeConfigValue(value: unknown): string {
    return typeof value === 'string' ? value.trim() : ''
}

function hasPlaceholderMarker(value: string): boolean {
    const normalized = value.trim().toLowerCase()

    if (!normalized) {
        return false
    }

    return [
        'replace_with',
        'your-',
        'your_',
        '<user>',
        '<password>',
        '<api_key>',
        '<api_secret>',
        '<cloud_name>',
        'change-me',
    ].some((marker) => normalized.includes(marker))
}

function normalizeCredentialValue(value: unknown): string {
    const normalized = normalizeConfigValue(value)
    return hasPlaceholderMarker(normalized) ? '' : normalized
}

function decodeBase64ToUint8Array(value: string): Uint8Array {
    const normalized = value.replace(/\s+/g, '')

    if (!normalized) {
        return new Uint8Array()
    }

    return Uint8Array.from(Buffer.from(normalized, 'base64'))
}

function normalizeApplePrivateKey(value: unknown): Uint8Array {
    if (value instanceof Uint8Array) {
        return value
    }

    if (value instanceof ArrayBuffer) {
        return new Uint8Array(value)
    }

    const normalized = normalizeConfigValue(value)
        .replace(/^(['"])([\s\S]*)\1$/, '$2')
        .replace(/\\n/g, '\n')
        .replace(/\r\n/g, '\n')

    if (!normalized || hasPlaceholderMarker(normalized)) {
        return new Uint8Array()
    }

    const pemMatch = normalized.match(
        /-----BEGIN PRIVATE KEY-----([\s\S]+?)-----END PRIVATE KEY-----/
    )

    if (pemMatch) {
        return decodeBase64ToUint8Array(pemMatch[1] || '')
    }

    return decodeBase64ToUint8Array(normalized)
}

function getOAuthConfig(): OAuthConfig {
    const config = useRuntimeConfig()
    const publicUrl = normalizeConfigValue(process.env.PUBLIC_URL) || 'https://peace2074.com'

    // Google OAuth
    const googleClientId =
        (config as any).googleClientId ||
        process.env.GOOGLE_CLIENT_ID ||
        process.env.NITRO_GOOGLE_CLIENT_ID ||
        ''

    const googleClientSecret =
        (config as any).googleClientSecret ||
        process.env.GOOGLE_CLIENT_SECRET ||
        process.env.NITRO_GOOGLE_CLIENT_SECRET ||
        ''

    const googleRedirectUri =
        (config as any).googleRedirectUri ||
        process.env.GOOGLE_REDIRECT_URI ||
        process.env.NITRO_GOOGLE_REDIRECT_URI ||
        `${publicUrl}/api/auth/google/callback`

    // Apple OAuth
    const appleClientId =
        (config as any).appleClientId ||
        process.env.APPLE_CLIENT_ID ||
        process.env.NITRO_APPLE_CLIENT_ID ||
        ''

    const appleTeamId =
        (config as any).appleTeamId ||
        process.env.APPLE_TEAM_ID ||
        process.env.NITRO_APPLE_TEAM_ID ||
        ''

    const appleKeyId =
        (config as any).appleKeyId ||
        process.env.APPLE_KEY_ID ||
        process.env.NITRO_APPLE_KEY_ID ||
        ''

    const applePrivateKey =
        (config as any).applePrivateKey ||
        process.env.APPLE_PRIVATE_KEY ||
        process.env.NITRO_APPLE_PRIVATE_KEY ||
        ''

    const appleRedirectUri =
        (config as any).appleRedirectUri ||
        process.env.APPLE_REDIRECT_URI ||
        process.env.NITRO_APPLE_REDIRECT_URI ||
        `${publicUrl}/api/auth/apple/callback`

    return {
        google: {
            clientId: normalizeCredentialValue(googleClientId),
            clientSecret: normalizeCredentialValue(googleClientSecret),
            redirectUri: normalizeConfigValue(googleRedirectUri)
        },
        apple: {
            clientId: normalizeCredentialValue(appleClientId),
            teamId: normalizeCredentialValue(appleTeamId),
            keyId: normalizeCredentialValue(appleKeyId),
            privateKey: normalizeApplePrivateKey(applePrivateKey),
            redirectUri: normalizeConfigValue(appleRedirectUri)
        }
    }
}

export function getOAuthAvailability() {
    const config = getOAuthConfig()

    return {
        google: Boolean(config.google.clientId && config.google.clientSecret),
        apple: Boolean(
            config.apple.clientId
            && config.apple.teamId
            && config.apple.keyId
            && config.apple.privateKey.byteLength > 0
        )
    }
}

export function getGoogleOAuth(): Google {
    const config = getOAuthConfig()

    if (!config.google.clientId || !config.google.clientSecret) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Google OAuth not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET'
        })
    }

    return new Google(
        config.google.clientId,
        config.google.clientSecret,
        config.google.redirectUri
    )
}

export function getAppleOAuth(): Apple {
    const config = getOAuthConfig()

    if (!config.apple.clientId || !config.apple.teamId || !config.apple.keyId || config.apple.privateKey.byteLength === 0) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Apple OAuth not configured. Set APPLE_CLIENT_ID, APPLE_TEAM_ID, APPLE_KEY_ID, and APPLE_PRIVATE_KEY'
        })
    }

    return new Apple(
        config.apple.clientId,
        config.apple.teamId,
        config.apple.keyId,
        config.apple.privateKey,
        config.apple.redirectUri
    )
}

export interface OAuthUserInfo {
    provider: 'google' | 'apple' | 'github'
    providerId: string
    email: string
    name: string
    firstName?: string
    lastName?: string
    picture?: string
}

function isCapacitorLikeOrigin(origin: string) {
    return origin.startsWith('capacitor:') || origin.startsWith('ionic:') || origin.startsWith('app:')
}

function getOAuthCallbackOrigin(provider: 'google' | 'apple') {
    const config = getOAuthConfig()
    const redirectUri = provider === 'google'
        ? config.google.redirectUri
        : config.apple.redirectUri

    try {
        return new URL(redirectUri).origin
    } catch {
        return null
    }
}

export function getCanonicalOAuthStartUrl(
    event: H3Event,
    provider: 'google' | 'apple'
) {
    const callbackOrigin = getOAuthCallbackOrigin(provider)
    if (!callbackOrigin) return null

    const requestUrl = getRequestURL(event, {
        xForwardedHost: true,
        xForwardedProto: true,
    })

    if (requestUrl.origin === callbackOrigin) {
        return null
    }

    return new URL(
        `${requestUrl.pathname}${requestUrl.search}`,
        callbackOrigin
    ).toString()
}

export function getOAuthCookieOptions(event: H3Event) {
    const origin = String(getHeader(event, 'origin') || '').toLowerCase()
    const referer = String(getHeader(event, 'referer') || '').toLowerCase()
    const requestUrl = getRequestURL(event, {
        xForwardedHost: true,
        xForwardedProto: true,
    })
    const isSecureRequest = requestUrl.protocol === 'https:'
    const useCrossSiteCookie =
        isCapacitorLikeOrigin(origin)
        || isCapacitorLikeOrigin(referer)

    return {
        httpOnly: true,
        secure: isSecureRequest,
        sameSite: (useCrossSiteCookie ? 'none' : 'lax') as 'none' | 'lax',
        maxAge: 60 * 10,
        path: '/'
    }
}

export function setOAuthNoStoreHeaders(event: H3Event) {
    setResponseHeader(event, 'Cache-Control', 'no-store, no-cache, max-age=0, must-revalidate')
    setResponseHeader(event, 'Pragma', 'no-cache')
    setResponseHeader(event, 'Expires', '0')
}
