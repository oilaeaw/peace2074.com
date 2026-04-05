import { defineEventHandler, readBody } from 'h3'

import { requireSecrets } from '../../../../utils/auth'
import { beginPasskeyAuthentication } from '../../../../utils/passkeys'
import { applyCors } from '../../../../utils/cors'

export default defineEventHandler(async (event) => {
  applyCors(event)
  requireSecrets({ needPasscode: false })

  const body = (await readBody<{ username?: string }>(event)) || {}
  const result = await beginPasskeyAuthentication(event, body.username)

  return {
    ok: true,
    ...result,
  }
})
