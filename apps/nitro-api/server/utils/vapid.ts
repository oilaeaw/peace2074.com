import webpush from 'web-push'

type VapidConfig = {
    publicKey: string
    privateKey: string
    subject: string
}

export type VapidStatus = {
    hasPublicKey: boolean
    hasPrivateKey: boolean
    hasSubject: boolean
}

let cachedDevVapid: VapidConfig | null = null

function resolveVapidInputs() {
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

    return { publicKey, privateKey, subject }
}

export function getVapidStatus(): VapidStatus {
    const { publicKey, privateKey, subject } = resolveVapidInputs()
    return {
        hasPublicKey: Boolean(publicKey),
        hasPrivateKey: Boolean(privateKey),
        hasSubject: Boolean(subject),
    }
}

export function getVapidConfig(): VapidConfig | null {
    const { publicKey, privateKey, subject } = resolveVapidInputs()

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
