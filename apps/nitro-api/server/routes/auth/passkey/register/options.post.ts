import { defineEventHandler } from 'h3'

import { requireAuth, requireSecrets } from '../../../../utils/auth'
import { beginPasskeyRegistration } from '../../../../utils/passkeys'
import { applyCors } from '../../../../utils/cors'

export default defineEventHandler(async (event) => {
    applyCors(event)
    requireSecrets({ needPasscode: false })

    const session = requireAuth(event)
    const result = await beginPasskeyRegistration(event, session.id)

    return {
        ok: true,
        ...result,
    }
})