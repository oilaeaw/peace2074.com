import { defineEventHandler } from 'h3'

export default defineEventHandler(() => ({ status: 'OK', message: 'Nitro API is healthy' }))
