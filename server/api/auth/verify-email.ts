import User from '@server/models/user'
import { createError, getQuery, sendError } from 'h3'

export default defineEventHandler(async (event) => {
  const { token } = getQuery(event)
  if (!token || typeof token !== 'string') {
    return sendError(event, createError({ statusCode: 400, statusMessage: 'Invalid or missing token.' }))
  }

  // Find user by token and check expiry
  const user = await User.findOne({ verificationToken: token, verificationTokenExpires: { $gt: new Date() } })
  if (!user) {
    return sendError(event, createError({ statusCode: 400, statusMessage: 'Invalid or expired verification token.' }))
  }

  user.verified = true
  user.verificationToken = null
  user.verificationTokenExpires = null
  await user.save()

  return { message: 'Email verified successfully!' }
})
