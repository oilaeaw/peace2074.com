import { Buffer } from 'node:buffer'
import { readBody } from 'h3'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  // Get the challenge from the session
  const expectedChallenge = event.context.session?.challenge
  if (!expectedChallenge) {
    return { error: 'No challenge in session' }
  }

  // Parse the clientDataJSON from the frontend
  const { response } = body
  const clientDataJSON = JSON.parse(
    Buffer.from(response.clientDataJSON, 'base64').toString('utf8'),
  )

  // Compare the challenge (WebAuthn sends base64url, so decode both sides)
  // WebAuthn spec: challenge is base64url encoded, but clientDataJSON.challenge is also base64url
  // So compare as base64url strings directly
  if (clientDataJSON.challenge !== expectedChallenge) {
    return { error: 'Challenge does not match' }
  }

  // TODO: Verify attestationObject, store credential, etc.

  return { success: true }
})
