import { eventHandler } from "h3"

export default eventHandler(async (event) => {
  return {
    message: "Peace2074.com API is running",
    status: "healthy",
    timestamp: new Date().toISOString(),
    endpoints: [
      "/api/health",
      "/api/auth",
      "/api/quran",
      "/api/bookmarks",
      "/api/tasbeeh"
    ]
  }
})