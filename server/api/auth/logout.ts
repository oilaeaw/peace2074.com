export default defineEventHandler(async (event) => {
  // Clear the auth_token cookie
  const { clearAuthToken } = await import('../../utils/auth')
  clearAuthToken(event)
  return { ok: true }
})
