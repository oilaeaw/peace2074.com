import { eventHandler } from "h3"
import { isDatabaseConnected, connectToDatabase } from "../utils/database.ts"

export default eventHandler(async (_event) => {
    let dbStatus = "disconnected"

    try {
        if (!isDatabaseConnected()) {
            await connectToDatabase()
        }
        dbStatus = "connected"
    } catch (_error) {
        dbStatus = "error"
    }

    return {
        status: "ok",
        database: dbStatus,
        timestamp: new Date().toISOString(),
        deno: Deno.version,
        platform: Deno.build
    }
})