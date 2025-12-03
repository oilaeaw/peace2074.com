import { defineEventHandler } from 'h3'

export default defineEventHandler(async () => {
    return {
        message: "🕌 Peace2074.com API is running!",
        status: "healthy",
        timestamp: new Date().toISOString(),
        server: "Nitro + Deno",
        deployment: "Netlify Ready",
        features: [
            "Authentication",
            "Quran API",
            "Prayer times",
            "Bookmarks",
            "Tasbeeh counter"
        ]
    }
})