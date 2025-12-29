import { createError, defineEventHandler, getQuery, sendRedirect } from 'h3'
import { createSession, requireSecrets } from '../../utils/auth'
import { cleanExpiredLinks, pendingLinks } from './magic.store'

export default defineEventHandler(async (event) => {
  const { token = '' } = getQuery(event)
  const t = String(token || '')

  if (!t) {
    throw createError({ statusCode: 400, statusMessage: 'Missing token' })
  }

  requireSecrets({ needPasscode: false })
  cleanExpiredLinks()
  const entry = pendingLinks.get(t)
  if (!entry) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid or expired link' })
  }
  if (Date.now() > entry.exp) {
    pendingLinks.delete(t)
    throw createError({ statusCode: 401, statusMessage: 'Link expired' })
  }

  pendingLinks.delete(t)
  const user = { id: entry.email, role: 'user', name: entry.email }
  createSession(event, user)

  // Redirect to home after login
  return sendRedirect(event, '/', 302)
})
