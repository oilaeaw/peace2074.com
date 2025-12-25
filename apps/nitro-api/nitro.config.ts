import { defineNitroConfig } from 'nitropack'

export default defineNitroConfig({
    compatibilityDate: '2024-10-01',
    srcDir: '.',
    // No SSR renderer needed; pure API
})
