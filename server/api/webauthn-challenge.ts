import { randomBytes } from 'node:crypto'

export default defineEventHandler(async (event) => {
  // Generate a random challenge (base64url encoded)
  const challenge = randomBytes(32).toString('base64url')
  // Optionally, you can store this challenge in a session for later verification
  if (!event.context.session)
    event.context.session = {}
  event.context.session.challenge = challenge
  return { challenge }
})
