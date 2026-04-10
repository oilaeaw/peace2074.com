import { Google, Apple } from 'arctic'
import { createError, getHeader, setResponseHeader, type H3Event } from 'h3'

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
        privateKey: string
        redirectUri: string
    }
}

function normalizeConfigValue(value: unknown): string {
    return typeof value === 'string' ? value.trim() : ''
}

function normalizeApplePrivateKey(value: unknown): string {
    return normalizeConfigValue(value)
        .replace(/\\n/g, '\n')
        .replace(/\r\n/g, '\n')
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
            clientId: normalizeConfigValue(googleClientId),
            clientSecret: normalizeConfigValue(googleClientSecret),
            redirectUri: normalizeConfigValue(googleRedirectUri)
        },
        apple: {
            clientId: normalizeConfigValue(appleClientId),
            teamId: normalizeConfigValue(appleTeamId),
            keyId: normalizeConfigValue(appleKeyId),
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
            && config.apple.privateKey
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

    if (!config.apple.clientId || !config.apple.teamId || !config.apple.keyId || !config.apple.privateKey) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Apple OAuth not configured. Set APPLE_CLIENT_ID, APPLE_TEAM_ID, APPLE_KEY_ID, and APPLE_PRIVATE_KEY'
        })
    }

    return new Apple(
        {
            clientId: config.apple.clientId,
            teamId: config.apple.teamId,
            keyId: config.apple.keyId,
            certificate: config.apple.privateKey
        },
        config.apple.redirectUri
    )
}

export interface OAuthUserInfo {
    provider: 'google' | 'apple'
    providerId: string
    email: string
    name: string
    picture?: string
}

function isCapacitorLikeOrigin(origin: string) {
    return origin.startsWith('capacitor:') || origin.startsWith('ionic:') || origin.startsWith('app:')
}

export function getOAuthCookieOptions(event: H3Event) {
    const origin = String(getHeader(event, 'origin') || '').toLowerCase()
    const referer = String(getHeader(event, 'referer') || '').toLowerCase()
    const useCrossSiteCookie =
        process.env.NODE_ENV === 'production'
        || isCapacitorLikeOrigin(origin)
        || isCapacitorLikeOrigin(referer)

    return {
        httpOnly: true,
        secure: useCrossSiteCookie,
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
