import { defineEventHandler } from 'h3'

export default defineEventHandler(() => ({
    name: 'Peace2074 API',
    version: '1.0.0',
    routes: [
        '/health',
        '/quran',
        '/quran/:id',
        '/deepseek',
    ],
    message: 'Nitro API is running on port 3000 by default. Override with PORT env var if needed.',
}))
