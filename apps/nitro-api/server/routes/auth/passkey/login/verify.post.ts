import { type AuthenticationResponseJSON } from '@simplewebauthn/server'
import { createError, defineEventHandler, readBody } from 'h3'

import { createSession, requireSecrets } from '../../../../utils/auth'
import { applyCors } from '../../../../utils/cors'
import {
  buildAuthenticatedUser,
  finishPasskeyAuthentication,
} from '../../../../utils/passkeys'

export default defineEventHandler(async (event) => {
  applyCors(event)
  requireSecrets({ needPasscode: false })

  const body =
    (await readBody<{
      requestId?: string
      authenticationResponse?: AuthenticationResponseJSON
    }>(event)) || {}
  const requestId = String(body.requestId || '').trim()

  if (!requestId || !body.authenticationResponse) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Passkey login request is incomplete',
    })
  }

  const user = await finishPasskeyAuthentication(
    requestId,
    body.authenticationResponse
  )
  const payload = await buildAuthenticatedUser(user)

  createSession(event, payload.sessionUser, 'passkey')

  return {
    ok: true,
    user: payload.user,
  }
})
