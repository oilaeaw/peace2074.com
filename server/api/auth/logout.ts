export default defineEventHandler(async (event) => {
  // Clear the auth_token cookie
  setCookie(event, 'auth_token', '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: useRuntimeConfig().nodeEnv === 'production',
    path: '/',
    maxAge: 0,
  })
  return { ok: true }
})
