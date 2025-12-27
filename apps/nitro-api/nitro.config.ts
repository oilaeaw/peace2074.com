import { defineNitroConfig } from 'nitropack'

const DEFAULT_PORT = 3000

export default defineNitroConfig({
    compatibilityDate: '2024-10-01',
    srcDir: 'server',
    devServer: {
        port: Number(process.env.PORT) || DEFAULT_PORT,
        host: process.env.HOST || '0.0.0.0',
    },
    runtimeConfig: {
        deepseekApiKey: '', // Populated by process.env.NITRO_DEEPSEEK_API_KEY at runtime
        deepseekBaseUrl: '', // Populated by process.env.NITRO_DEEPSEEK_BASE_URL at runtime
    },
    // No SSR renderer needed; pure API
})
