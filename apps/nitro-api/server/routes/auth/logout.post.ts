import { defineEventHandler } from 'h3'
import { clearSessionCookie } from '../../utils/auth'

export default defineEventHandler((event) => {
    clearSessionCookie(event)
    return { ok: true }
})