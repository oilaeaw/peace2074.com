import { defineEventHandler } from 'h3'

export default defineEventHandler(() => ({
    name: 'Peace2074 API',
    version: '1.0.0',
    routes: [
        'GET /',
        'GET /health',
        'GET /quran',
        'GET /quran/:id',
        'POST /kimi',
    ],
    message: 'Nitro API ready. Override PORT to change the default 3000 listener.',
}))
