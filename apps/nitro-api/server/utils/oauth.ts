import { Google, Apple } from 'arctic'
import { createError } from 'h3'

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

function getOAuthConfig(): OAuthConfig {
    const config = useRuntimeConfig()

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
        `${process.env.PUBLIC_URL || 'https://peace2074.com'}/api/auth/google/callback`

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
        `${process.env.PUBLIC_URL || 'https://peace2074.com'}/api/auth/apple/callback`

    return {
        google: {
            clientId: googleClientId,
            clientSecret: googleClientSecret,
            redirectUri: googleRedirectUri
        },
        apple: {
            clientId: appleClientId,
            teamId: appleTeamId,
            keyId: appleKeyId,
            privateKey: applePrivateKey,
            redirectUri: appleRedirectUri
        }
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
