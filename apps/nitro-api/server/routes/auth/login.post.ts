import { createError, defineEventHandler, readBody } from 'h3'
import { createSession, requireSecrets } from '../../utils/auth'

export default defineEventHandler(async (event) => {
    const body = (await readBody<{ passcode?: string }>(event)) || {}
    const provided = (body.passcode || '').trim()

    const { passcode } = requireSecrets()
    if (!provided || provided !== passcode) {
        throw createError({ statusCode: 401, statusMessage: 'Invalid credentials' })
    }

    const user = { id: 'admin', role: 'admin', name: 'Admin' }
    createSession(event, user)

    return { ok: true, user }
})