import webpush from 'web-push'

type VapidConfig = {
    publicKey: string
    privateKey: string
    subject: string
}

let cachedDevVapid: VapidConfig | null = null

export function getVapidConfig(): VapidConfig | null {
    const config = useRuntimeConfig()

    const publicKey =
        (config as any).vapidPublicKey
        || process.env.NITRO_VAPID_PUBLIC_KEY
        || process.env.VAPID_PUBLIC_KEY

    const privateKey =
        (config as any).vapidPrivateKey
        || process.env.NITRO_VAPID_PRIVATE_KEY
        || process.env.VAPID_PRIVATE_KEY

    const subject =
        (config as any).vapidSubject
        || process.env.NITRO_VAPID_SUBJECT
        || process.env.VAPID_SUBJECT
        || 'mailto:admin@peace2074.com'

    if (publicKey && privateKey) {
        return { publicKey, privateKey, subject }
    }

    if (process.env.NODE_ENV === 'production') {
        return null
    }

    if (!cachedDevVapid) {
        const generated = webpush.generateVAPIDKeys()
        cachedDevVapid = {
            publicKey: generated.publicKey,
            privateKey: generated.privateKey,
            subject,
        }
        console.warn('[Push] Using generated ephemeral VAPID keys for development. Set VAPID_* env vars for persistent push subscriptions.')
    }

    return cachedDevVapid
}
