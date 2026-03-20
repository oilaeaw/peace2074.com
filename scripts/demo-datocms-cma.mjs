const DATOCMS_CMA_BASE_URL = 'admin.datocms.com'
const DATOCMS_API_VERSION = '3'

function maskToken(token = '') {
  if (token.length <= 8) return '***'
  return `${token.slice(0, 4)}...${token.slice(-4)}`
}

function isPlaceholderToken(token = '') {
  const normalized = token.trim().toLowerCase()
  return (
    normalized.length < 12 ||
    normalized.includes('your-') ||
    normalized.includes('<') ||
    normalized.includes('change-me')
  )
}

async function run() {
  const token = String(process.env.DATOCMS_API_TOKEN || '').trim()

  console.log('[DatoCMS Demo] Starting Content Management API check...')

  if (!token || isPlaceholderToken(token)) {
    console.error(
      '[DatoCMS Demo] DATOCMS_API_TOKEN is missing or looks like a placeholder.'
    )
    console.error(
      '[DatoCMS Demo] Set DATOCMS_API_TOKEN in .env, then re-run this demo.'
    )
    process.exitCode = 1
    return
  }

  const url = `${DATOCMS_CMA_BASE_URL}/site`
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/json',
    'X-Api-Version': DATOCMS_API_VERSION,
  }

  try {
    const response = await fetch(url, { method: 'GET', headers })
    const contentType = response.headers.get('content-type') || ''

    if (!response.ok) {
      const maybeJson = contentType.includes('application/json')
        ? await response.json().catch(() => null)
        : null
      console.error(
        `[DatoCMS Demo] Request failed (${response.status} ${response.statusText}).`
      )
      if (maybeJson) {
        const detail =
          maybeJson?.errors?.[0]?.detail ||
          maybeJson?.errors?.[0]?.title ||
          JSON.stringify(maybeJson)
        console.error(`[DatoCMS Demo] API detail: ${detail}`)
      }
      console.error(`[DatoCMS Demo] Token used: ${maskToken(token)}`)
      process.exitCode = 1
      return
    }

    const payload = contentType.includes('application/json')
      ? await response.json()
      : null
    const siteName =
      payload?.data?.attributes?.name ||
      payload?.data?.attributes?.domain ||
      'Unknown site'

    console.log('[DatoCMS Demo] ✅ Connected successfully.')
    console.log(`[DatoCMS Demo] Site: ${siteName}`)
    console.log(`[DatoCMS Demo] API base: ${DATOCMS_CMA_BASE_URL}`)
    console.log(`[DatoCMS Demo] Token used: ${maskToken(token)}`)
  } catch (error) {
    console.error(
      '[DatoCMS Demo] Network or runtime error while calling DatoCMS.'
    )
    console.error(
      `[DatoCMS Demo] ${error instanceof Error ? error.message : String(error)}`
    )
    process.exitCode = 1
  }
}

await run()
