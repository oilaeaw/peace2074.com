import { defineEventHandler } from 'h3'

export default defineEventHandler(async () => {
    return {
        status: "✅ Healthy",
        uptime: "Running",
        database: "Not connected yet",
        memory: "Good",
        server: "Nitro + Deno",
        timestamp: new Date().toISOString(),
        version: "3.0.0"
    }
})