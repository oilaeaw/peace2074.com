import { defineEventHandler } from 'h3'
import { clearSession } from '../../utils/auth'

export default defineEventHandler((event) => {
    clearSession(event)
    return { ok: true }
})