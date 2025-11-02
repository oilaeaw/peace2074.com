import { defineEventHandler, getHeader, setResponseStatus } from 'h3'

export default defineEventHandler(async (event) => {
  const cfg = useRuntimeConfig()
  // Only available in non-production to help validate cookie attributes
  if (cfg.nodeEnv === 'production') {
    setResponseStatus(event, 404)
    return { error: 'not_found' }
  }

  const q = getQuery(event) as Record<string, any>
  if (!q || q.key !== 'ok') {
    setResponseStatus(event, 400)
    return { error: 'bad_request' }
  }

  const payload = { id: 'dev', provider: 'dev' }
  const { issueAuthToken } = await import('../../utils/auth')
  const issued = await issueAuthToken(event, payload)
  const host = getHeader(event, 'x-forwarded-host') || getHeader(event, 'host')
  return { issued, host }
})
