import { getCookie } from 'h3'
import jwt from 'jsonwebtoken'
import User from '../../models/user'

export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'auth_token')
  if (!token)
    return { user: null }

  try {
    const config = useRuntimeConfig()
    const decoded: any = jwt.verify(token, config.jwtSecret || 'dev_secret')
    const user = await User.findById(decoded.id)
    if (!user)
      return { user: null }
    return { user: {
      id: user._id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      username: user.username,
      role: user.role,
    } }
  }
  catch {
    return { user: null }
  }
})
