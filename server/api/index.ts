export default defineEventHandler(() => ({
  message: 'Hello from the API!',
  timestamp: new Date().toISOString(),
}))
