import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
    appId: 'com.peace2074.app',
    appName: 'Peace2074',
    webDir: 'dist',
    bundledWebRuntime: false,
    server: {
        androidScheme: 'https',
    },
}

export default config
