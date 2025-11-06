import User from '@server/models/user'
import { createError, getQuery, sendError } from 'h3'
import { ensureDbConnection } from '@server/utils/database'

export default defineEventHandler(async (event) => {
  await ensureDbConnection()
  const { token } = getQuery(event)
  if (!token || typeof token !== 'string') {
    return sendError(event, createError({ statusCode: 400, statusMessage: 'Invalid or missing token.' }))
  }

  // Find user by token and check expiry
  const U: any = User as any
  const user = await U.findOne({ verificationToken: token, verificationTokenExpires: { $gt: new Date() } })
  if (!user) {
    return sendError(event, createError({ statusCode: 400, statusMessage: 'Invalid or expired verification token.' }))
  }

  user.verified = true
  user.verificationToken = null
  user.verificationTokenExpires = null
  await user.save()

  return { message: 'Email verified successfully!' }
})
