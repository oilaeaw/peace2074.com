import { defineEventHandler } from 'h3'

export default defineEventHandler(() => {
    return {
        message: '🕌 Peace2074.com API is running!',
        status: 200,
        timestamp: new Date().toISOString(),
        server: 'Nitro + Deno'
    }
})
