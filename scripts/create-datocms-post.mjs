const DATOCMS_CMA_BASE_URL = 'https://site-api.datocms.com'
const DATOCMS_API_VERSION = '3'

function isPlaceholderToken(token = '') {
  const normalized = token.trim().toLowerCase()
  return (
    normalized.length < 12 ||
    normalized.startsWith('http://') ||
    normalized.startsWith('https://') ||
    normalized.includes('your-') ||
    normalized.includes('<') ||
    normalized.includes('change-me')
  )
}

function maskToken(token = '') {
  if (token.length <= 8) return '***'
  return `${token.slice(0, 4)}...${token.slice(-4)}`
}

function slugify(value = '') {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

function getHeader(token) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/json',
    'X-Api-Version': DATOCMS_API_VERSION,
  }
}

async function resolveItemTypeId(token, modelApiKey) {
  const params = new URLSearchParams()
  params.set('filter[fields][api_key][eq]', modelApiKey)
  params.set('page[limit]', '1')

  const res = await fetch(
    `${DATOCMS_CMA_BASE_URL}/item-types?${params.toString()}`,
    {
      method: 'GET',
      headers: getHeader(token),
    }
  )

  if (!res.ok) {
    throw new Error(
      `Failed resolving model '${modelApiKey}' (HTTP ${res.status})`
    )
  }

  const json = await res.json()
  const id = json?.data?.[0]?.id
  if (!id) {
    throw new Error(`Model '${modelApiKey}' not found in DatoCMS project`)
  }
  return id
}

async function createPost() {
  const token = String(process.env.DATOCMS_API_TOKEN || '').trim()
  const modelApiKey = String(
    process.env.DATOCMS_BLOG_ITEM_TYPE_API_KEY || 'blog_post'
  ).trim()

  if (!token || isPlaceholderToken(token)) {
    console.error('[DatoCMS Create] DATOCMS_API_TOKEN is missing/invalid.')
    console.error(
      '[DatoCMS Create] Put a real project token in .env and retry.'
    )
    process.exitCode = 1
    return
  }

  const title = String(
    process.env.DATOCMS_NEW_POST_TITLE || `API Post ${new Date().toISOString()}`
  ).trim()
  const slug = slugify(String(process.env.DATOCMS_NEW_POST_SLUG || title))
  const excerpt = String(
    process.env.DATOCMS_NEW_POST_EXCERPT ||
      'Created via DatoCMS Content Management API'
  ).trim()
  const content = String(
    process.env.DATOCMS_NEW_POST_CONTENT ||
      `This post was created programmatically via DatoCMS CMA.\n\nCreated at: ${new Date().toISOString()}`
  ).trim()
  const tags = String(process.env.DATOCMS_NEW_POST_TAGS || 'api,datocms')
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean)
  const author = String(
    process.env.DATOCMS_NEW_POST_AUTHOR || 'Peace2074 Team'
  ).trim()
  const date = new Date().toISOString().slice(0, 10)

  if (!slug) {
    console.error('[DatoCMS Create] Unable to derive a valid slug.')
    process.exitCode = 1
    return
  }

  try {
    console.log('[DatoCMS Create] Resolving item type...')
    const itemTypeId = await resolveItemTypeId(token, modelApiKey)

    const payload = {
      data: {
        type: 'item',
        attributes: {
          slug,
          title,
          excerpt,
          content,
          tags,
          date,
          author,
        },
        relationships: {
          item_type: {
            data: {
              type: 'item_type',
              id: itemTypeId,
            },
          },
        },
      },
    }

    const res = await fetch(`${DATOCMS_CMA_BASE_URL}/items`, {
      method: 'POST',
      headers: {
        ...getHeader(token),
        'Content-Type': 'application/vnd.api+json',
      },
      body: JSON.stringify(payload),
    })

    const body = await res.json().catch(() => ({}))

    if (!res.ok) {
      const detail =
        body?.errors?.[0]?.detail ||
        body?.errors?.[0]?.title ||
        JSON.stringify(body)
      throw new Error(`Create failed (HTTP ${res.status}): ${detail}`)
    }

    const id = body?.data?.id
    const createdSlug = body?.data?.attributes?.slug || slug

    console.log('[DatoCMS Create] ✅ Post created successfully.')
    console.log(`[DatoCMS Create] Post ID: ${id}`)
    console.log(`[DatoCMS Create] Slug: ${createdSlug}`)
    console.log(
      `[DatoCMS Create] URL: https://peace2074.com/blog/${encodeURIComponent(createdSlug)}`
    )
    console.log(`[DatoCMS Create] Token used: ${maskToken(token)}`)
  } catch (error) {
    console.error('[DatoCMS Create] Failed to create post.')
    console.error(
      `[DatoCMS Create] ${error instanceof Error ? error.message : String(error)}`
    )
    process.exitCode = 1
  }
}

await createPost()
