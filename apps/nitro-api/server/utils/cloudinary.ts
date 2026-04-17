import crypto from 'node:crypto'

interface CloudinaryConfig {
    cloudName: string
    apiKey: string
    apiSecret: string
}

type OAuthAvatarProvider = 'google' | 'apple' | 'github'

const OAUTH_AVATAR_HOST_PATTERNS = [
    /(^|\.)googleusercontent\.com$/i,
    /(^|\.)gstatic\.com$/i,
    /(^|\.)githubusercontent\.com$/i,
    /(^|\.)github\.com$/i,
]

function normalizeConfigValue(value: unknown): string {
    return typeof value === 'string' ? value.trim() : ''
}

function parseUrl(value: string) {
    try {
        return new URL(value)
    } catch {
        return null
    }
}

function parseCloudinaryUrl(value: string): Partial<CloudinaryConfig> {
    const parsed = parseUrl(value)
    if (!parsed || parsed.protocol !== 'cloudinary:') {
        return {}
    }

    return {
        cloudName: parsed.hostname,
        apiKey: decodeURIComponent(parsed.username || ''),
        apiSecret: decodeURIComponent(parsed.password || ''),
    }
}

function getCloudinaryConfig(): CloudinaryConfig | null {
    const config = useRuntimeConfig()

    const cloudinaryUrl = normalizeConfigValue(
        process.env.CLOUDINARY_URL || (config as any).cloudinaryUrl
    )
    const fromUrl = cloudinaryUrl ? parseCloudinaryUrl(cloudinaryUrl) : {}

    const cloudName = normalizeConfigValue(
        process.env.CLOUDINARY_CLOUD_NAME || (config as any).cloudinaryCloudName || fromUrl.cloudName
    )
    const apiKey = normalizeConfigValue(
        process.env.CLOUDINARY_API_KEY || (config as any).cloudinaryApiKey || fromUrl.apiKey
    )
    const apiSecret = normalizeConfigValue(
        process.env.CLOUDINARY_API_SECRET || (config as any).cloudinaryApiSecret || fromUrl.apiSecret
    )

    if (!cloudName || !apiKey || !apiSecret) {
        return null
    }

    return {
        cloudName,
        apiKey,
        apiSecret,
    }
}

function getHostname(value?: string | null) {
    if (!value) return ''
    return parseUrl(value)?.hostname.toLowerCase() || ''
}

function sanitizePublicIdSegment(value: string) {
    return value
        .toLowerCase()
        .replace(/[^a-z0-9_-]+/g, '_')
        .replace(/^_+|_+$/g, '')
        .slice(0, 80) || 'avatar'
}

function createCloudinarySignature(params: Record<string, string>, apiSecret: string) {
    const toSign = Object.entries(params)
        .filter(([, value]) => value !== '')
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, value]) => `${key}=${value}`)
        .join('&')

    return crypto
        .createHash('sha1')
        .update(`${toSign}${apiSecret}`)
        .digest('hex')
}

export function isCloudinaryAssetUrl(value?: string | null) {
    const host = getHostname(value)
    return host === 'res.cloudinary.com' || host.endsWith('.res.cloudinary.com')
}

export function isLikelyOAuthAvatarUrl(value?: string | null) {
    const host = getHostname(value)
    return OAUTH_AVATAR_HOST_PATTERNS.some((pattern) => pattern.test(host))
}

export async function resolveOAuthAvatarUrl(options: {
    provider: OAuthAvatarProvider
    providerId: string
    imageUrl?: string
}) {
    const imageUrl = normalizeConfigValue(options.imageUrl)
    if (!imageUrl) return undefined

    const parsedImageUrl = parseUrl(imageUrl)
    if (!parsedImageUrl || parsedImageUrl.protocol !== 'https:') {
        return imageUrl
    }

    if (isCloudinaryAssetUrl(imageUrl)) {
        return imageUrl
    }

    if (!isLikelyOAuthAvatarUrl(imageUrl)) {
        return imageUrl
    }

    const cloudinary = getCloudinaryConfig()
    if (!cloudinary) {
        return imageUrl
    }

    const timestamp = Math.floor(Date.now() / 1000)
    const params = {
        folder: 'peace2074/oauth-avatars',
        invalidate: 'true',
        overwrite: 'true',
        public_id: `${sanitizePublicIdSegment(options.provider)}_${sanitizePublicIdSegment(options.providerId)}`,
        timestamp: String(timestamp),
    }

    const signature = createCloudinarySignature(params, cloudinary.apiSecret)
    const body = new URLSearchParams({
        ...params,
        api_key: cloudinary.apiKey,
        file: imageUrl,
        signature,
    })

    try {
        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${cloudinary.cloudName}/image/upload`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body,
            }
        )

        if (!response.ok) {
            const details = await response.text().catch(() => '')
            console.warn('[cloudinary] OAuth avatar upload failed', {
                provider: options.provider,
                providerId: options.providerId,
                status: response.status,
                details: details.slice(0, 300),
            })
            return imageUrl
        }

        const payload = await response.json() as { secure_url?: string }
        return normalizeConfigValue(payload.secure_url) || imageUrl
    } catch (error) {
        console.warn('[cloudinary] OAuth avatar upload error', {
            provider: options.provider,
            providerId: options.providerId,
            error,
        })
        return imageUrl
    }
}