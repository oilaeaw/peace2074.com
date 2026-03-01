import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
    appId: 'com.peace2074.app',
    appName: 'Peace2074',
    webDir: 'dist',
    bundledWebRuntime: false,
    server: {
        androidScheme: 'https',
        // Point to production API for testing
        url: 'https://peace2074.com',
        cleartext: true,
    },
}

export default config
