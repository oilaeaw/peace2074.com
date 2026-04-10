// Minimal ambient declarations to help the TypeScript build in the browser bundle.
// These are safe temporary shims — replace with proper types or plugin-generated dts later.
declare const isClient: boolean
declare const useQuasar: typeof import('quasar').useQuasar

type GtagEventParams = Record<
    string,
    string | number | boolean | null | undefined
>
type Gtag = (
    command: 'event',
    eventName: string,
    params?: GtagEventParams
) => void

interface Window {
    gtag?: Gtag
    allConsentGranted?: () => void
}

// Allow importing certain shared types without pulling server-only runtime code into the browser bundle.
declare module 'jose' {
    export interface JWTPayload {
        iss?: string
        sub?: string
        aud?: string | string[]
        jti?: string
        nbf?: number
        exp?: number
        iat?: number
        [key: string]: unknown
    }
}

declare module 'mongoose' {
    export interface ObjectId {
        toHexString(): string
        toString(): string
        equals?(other: string | ObjectId): boolean
    }
}

declare module 'unstorage'
declare module 'unstorage/drivers/localstorage'
declare module '@emailjs/browser'
declare module '@casl/ability'
declare module 'netlify-identity-widget'

declare module 'virtual:pwa-register' {
    export interface RegisterSWOptions {
        immediate?: boolean
        onOfflineReady?: () => void
        onNeedRefresh?: () => void
        onRegisterError?: (error: unknown) => void
    }

    export function registerSW(
        options?: RegisterSWOptions
    ): (reloadPage?: boolean) => Promise<void>
}
