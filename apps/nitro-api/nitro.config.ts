import { defineNitroConfig } from 'nitropack'

const DEFAULT_PORT = 3000

export default defineNitroConfig({
    compatibilityDate: '2024-10-01',
    srcDir: 'server',
    devServer: {
        port: DEFAULT_PORT,
        host: '0.0.0.0',
    },
    runtimeConfig: {
        // Secrets are automatically read from corresponding
        // environment variables e.g. NITRO_DEEPSEEK_API_KEY
        deepseekApiKey: '',
        deepseekBaseUrl: '',
    },
    // No SSR renderer needed; pure API
})
