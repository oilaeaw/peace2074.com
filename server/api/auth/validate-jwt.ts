import { defineEventHandler } from 'h3'
import { getTokenFromEvent, verifyAuthToken } from '../../utils/auth'

export default defineEventHandler((event) => {
  const token = getTokenFromEvent(event)
  if (!token) {
    event.node.res.statusCode = 401
    event.node.res.end('Unauthorized: No token provided')
    return
  }
  const decoded = verifyAuthToken(token)
  if (!decoded) {
    event.node.res.statusCode = 401
    event.node.res.end('Unauthorized: Invalid token')
    return
  }
  event.context.user = decoded
})
