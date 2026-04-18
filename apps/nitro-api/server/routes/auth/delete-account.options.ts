import { defineEventHandler } from 'h3'

import { applyCors } from '../../utils/cors'

export default defineEventHandler((event) => {
    applyCors(event)
    return { statusCode: 204 }
})