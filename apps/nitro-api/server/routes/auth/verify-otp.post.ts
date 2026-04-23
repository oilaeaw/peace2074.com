import { createError, defineEventHandler, readBody } from 'h3'
import { createSession, requireSecrets } from '../../utils/auth'
import { applyCors } from '../../utils/cors'
import { otpStore } from './request-otp.post'

export default defineEventHandler(async (event) => {
  applyCors(event)
  const body = (await readBody<{ email?: string; code?: string }>(event)) || {}
  const email = (body.email || '').trim().toLowerCase()
  const code = (body.code || '').trim()

  if (!email || !email.includes('@')) {
    throw createError({ statusCode: 400, statusMessage: 'Valid email required' })
  }
  if (!code) {
    throw createError({ statusCode: 400, statusMessage: 'Code required' })
  }

  requireSecrets({ needPasscode: false })

  const entry = otpStore.get(email)
  if (!entry || entry.code !== code) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid or expired code' })
  }
  if (Date.now() > entry.exp) {
    otpStore.delete(email)
    throw createError({ statusCode: 401, statusMessage: 'Code expired' })
  }

  otpStore.delete(email)
  const user = { id: email, role: 'user', name: email }
  createSession(event, user, 'otp')
  return { ok: true, user }
})
