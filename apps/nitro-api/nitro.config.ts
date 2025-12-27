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
        deepseekApiKey: process.env.DEEPSEEK_API_KEY,
        deepseekBaseUrl: process.env.DEEPSEEK_BASE_URL,
    },
    // No SSR renderer needed; pure API
})
