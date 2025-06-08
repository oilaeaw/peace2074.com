import { defineEventHandler, getCookie } from 'h3'
import jwt from 'jsonwebtoken'

export default defineEventHandler((event) => {
  const token = getCookie(event, 'auth_token')
  if (!token) {
    event.node.res.statusCode = 401
    event.node.res.end('Unauthorized: No token provided')
    return
  }
  const config = useRuntimeConfig()
  try {
    const decoded = jwt.verify(token, config.jwtSecret || 'dev_secret')
    event.context.user = decoded
  }
  catch (err) {
    event.node.res.statusCode = 401
    event.node.res.end('Unauthorized: Invalid token')
  }
})
