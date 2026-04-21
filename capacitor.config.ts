import type { CapacitorConfig } from '@capacitor/cli'

const liveReloadUrl = process.env.CAP_SERVER_URL?.trim()

const serverConfig = liveReloadUrl
    ? {
        androidScheme: liveReloadUrl.startsWith('http://') ? 'http' : 'https',
        url: liveReloadUrl,
        cleartext: liveReloadUrl.startsWith('http://'),
    }
    : undefined

const config: CapacitorConfig = {
    appId: 'com.peace2074.app',
    appName: 'Peace2074',
    webDir: 'dist',
    bundledWebRuntime: false,
    ...(serverConfig ? { server: serverConfig } : {}),
    ios: {
        contentInset: 'never',
        scrollEnabled: true,
        allowsLinkPreview: false,
        limitsNavigationsToAppBoundDomains: true,
    },
}

export default config
