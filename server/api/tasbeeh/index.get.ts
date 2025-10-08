import process from 'node:process'
import Tasbeeh from '@server/models/tasbeeh'
import { getCookie } from 'h3'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'changeme'

export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'auth_token')
  if (!token)
    return { message: 'Not authenticated', data: null }

  let userId
  try {
    const decoded: any = jwt.verify(token, JWT_SECRET)
    userId = decoded.id || decoded.userId
  }
  catch (err) {
    console.error('JWT verify failed for /api/tasbeeh GET:', err)
    return { message: 'Invalid token', data: null }
  }

  const doc = await Tasbeeh.findOne({ userId })
  if (!doc)
    return { message: 'No data', data: null }
  return { message: 'OK', data: doc }
})
