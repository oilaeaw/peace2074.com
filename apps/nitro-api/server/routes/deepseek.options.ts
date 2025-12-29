import { defineEventHandler } from 'h3'
import { applyCors } from '../utils/cors'

export default defineEventHandler((event) => {
  applyCors(event)
  event.node.res.statusCode = 204
  event.node.res.end()
})
