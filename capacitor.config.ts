import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
    appId: 'com.peace2074.app',
    appName: 'Peace2074',
    webDir: 'dist',
    bundledWebRuntime: false,
    server: {
        androidScheme: 'https',
        // For local development with live reload, uncomment:
        // url: 'http://localhost:4000',
        // cleartext: true,

        // For production or testing bundled app, use:
        url: 'https://peace2074.com',
        cleartext: true,
    },
}

export default config
