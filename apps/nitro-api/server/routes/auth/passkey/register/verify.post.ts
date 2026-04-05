import { type RegistrationResponseJSON } from '@simplewebauthn/server'
import { createError, defineEventHandler, readBody } from 'h3'

import { requireAuth, requireSecrets } from '../../../../utils/auth'
import { applyCors } from '../../../../utils/cors'
import { finishPasskeyRegistration } from '../../../../utils/passkeys'

export default defineEventHandler(async (event) => {
  applyCors(event)
  requireSecrets({ needPasscode: false })

  const session = requireAuth(event)
  const body =
    (await readBody<{
      requestId?: string
      registrationResponse?: RegistrationResponseJSON
    }>(event)) || {}
  const requestId = String(body.requestId || '').trim()

  if (!requestId || !body.registrationResponse) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Passkey registration request is incomplete',
    })
  }

  const passkey = await finishPasskeyRegistration(
    session.id,
    requestId,
    body.registrationResponse
  )

  return {
    ok: true,
    passkey: {
      id: passkey.id,
      createdAt: passkey.createdAt,
    },
  }
})
