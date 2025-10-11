import { defineEventHandler, getHeader } from 'h3'

export default defineEventHandler((event) => {
  const host = getHeader(event, 'x-forwarded-host') || getHeader(event, 'host')
  const proto = getHeader(event, 'x-forwarded-proto') || (useRuntimeConfig().nodeEnv === 'production' ? 'https' : 'http')
  const callbackURL = `${proto}://${host}/api/auth/google/callback`
  return { callbackURL }
})
