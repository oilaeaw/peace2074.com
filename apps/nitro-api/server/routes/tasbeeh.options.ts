import { defineEventHandler, setResponseStatus } from 'h3'
import { applyCors } from '../utils/cors'

export default defineEventHandler((event) => {
    applyCors(event)
    setResponseStatus(event, 204)
    return ''
})
