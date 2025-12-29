import { defineEventHandler, readBody } from 'h3'
import { randomBytes } from 'node:crypto'
import { requireSecrets } from '../../utils/auth'
import { pendingLinks } from './magic.store'

const LINK_TTL_MS = 10 * 60 * 1000 // 10 minutes

export default defineEventHandler(async (event) => {
  const body = (await readBody<{ email?: string }>(event)) || {}
  const email = (body.email || '').trim().toLowerCase()

  if (!email || !email.includes('@')) {
    return { ok: false, error: 'Valid email required' }
  }

  requireSecrets({ needPasscode: false })

  const token = randomBytes(24).toString('base64url')
  const exp = Date.now() + LINK_TTL_MS
  pendingLinks.set(token, { email, exp })

  const host = event.node.req.headers.origin
    || (event.node.req.headers.host ? `http://${event.node.req.headers.host}` : '')
  const link = `${host}/api/auth/magic?token=${token}`

  // TODO: send email with link. For now, return debug link.
  return { ok: true, debugLink: link, expiresIn: LINK_TTL_MS / 1000 }
})
