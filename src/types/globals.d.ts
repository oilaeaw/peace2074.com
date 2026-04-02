// Minimal ambient declarations to help the TypeScript build in the browser bundle.
// These are safe temporary shims — replace with proper types or plugin-generated dts later.
declare const isClient: boolean;
declare function useQuasar(): any;
declare function useI18n(): { t: (...args: any[]) => any; locale?: any };
declare function useQ2P(): any;

interface Window {
    gtag?: (...args: any[]) => void
    allConsentGranted?: () => void
}

// Allow importing certain server-only modules as 'any' to avoid tsc resolution failures
declare module 'jose' {
    export type JWTPayload = any
    const _default: any
    export default _default
}
declare module 'mongoose' {
    export type ObjectId = any
    const _default: any
    export default _default
}
declare module 'unstorage';
declare module 'unstorage/drivers/localstorage';
declare module '@emailjs/browser';
declare module '@casl/ability';
declare module 'netlify-identity-widget';
declare module 'virtual:pwa-register' {
    export interface RegisterSWOptions {
        immediate?: boolean
        onOfflineReady?: () => void
        onNeedRefresh?: () => void
        onRegisterError?: (error: unknown) => void
    }

    export function registerSW(options?: RegisterSWOptions): (reloadPage?: boolean) => Promise<void>
}

// Project path aliases
declare module '@shared/*' {
    const v: any;
    export default v;
}
