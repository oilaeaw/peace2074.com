export const SEO_BASE_URL = 'https://peace2074.com'
export const DEFAULT_DESCRIPTION =
  'Multi-language Islamic knowledge platform featuring Quran, Tasbeeh, and more'
export const DEFAULT_ROBOTS = 'index,follow,max-image-preview:large'
export const DEFAULT_OG_IMAGE = `${SEO_BASE_URL}/android-chrome-512x512.png`
export const DEFAULT_SEO_KEYWORDS = [
  'Quran online',
  'Islamic knowledge',
  'Tasbeeh',
  'Quran reading',
  'Islamic app',
  'PEACE2074',
]

type StructuredDataNode = Record<string, unknown>

type ArticleMeta = {
  publishedTime?: string
  modifiedTime?: string
  authors?: string[]
  tags?: string[]
  section?: string
}

type SeoMetaOptions = {
  title: string
  description?: string
  canonical?: string
  keywords?: string[]
  ogType?: string
  image?: string
  imageAlt?: string
  robots?: string
  locale?: string
  structuredData?: StructuredDataNode | StructuredDataNode[]
  structuredDataId?: string
  article?: ArticleMeta
}

type PageStructuredDataOptions = {
  type?: string
  title: string
  description: string
  canonical: string
  locale?: string
  keywords?: string[]
}

type BlogStructuredDataOptions = {
  title: string
  description: string
  canonical: string
  locale?: string
  image?: string
  publishedTime?: string
  modifiedTime?: string
  author?: string
  tags?: string[]
}

type BreadcrumbItem = {
  name: string
  item: string
}

const DEFAULT_STRUCTURED_DATA_ID = 'peace2074-route-schema'
const ARTICLE_META_KEYS = [
  'article:published_time',
  'article:modified_time',
  'article:section',
  'article:author',
  'article:tag',
] as const

function normalizeOgLocale(locale = 'en') {
  const normalized = String(locale || 'en').trim().toLowerCase().replace('_', '-')
  const map: Record<string, string> = {
    en: 'en_US',
    ar: 'ar_AR',
    de: 'de_DE',
    es: 'es_ES',
    he: 'he_IL',
    it: 'it_IT',
    ru: 'ru_RU',
    tr: 'tr_TR',
  }

  const base = normalized.split('-')[0]
  return map[base] || normalized.replace('-', '_')
}

function upsertMetaTag(
  attr: 'name' | 'property',
  key: string,
  content: string
) {
  if (typeof document === 'undefined') return

  const selector = `meta[${attr}="${key}"]`
  let tag = document.head.querySelector(selector) as HTMLMetaElement | null
  if (!tag) {
    tag = document.createElement('meta')
    tag.setAttribute(attr, key)
    document.head.appendChild(tag)
  }

  tag.setAttribute('content', content)
}

function removeMetaTag(attr: 'name' | 'property', key: string) {
  if (typeof document === 'undefined') return

  document.head
    .querySelectorAll(`meta[${attr}="${key}"]`)
    .forEach((node) => node.parentNode?.removeChild(node))
}

function upsertCanonical(href: string) {
  if (typeof document === 'undefined') return

  let link = document.head.querySelector(
    'link[rel="canonical"]'
  ) as HTMLLinkElement | null

  if (!link) {
    link = document.createElement('link')
    link.setAttribute('rel', 'canonical')
    document.head.appendChild(link)
  }

  link.setAttribute('href', href)
}

function upsertStructuredDataScript(
  id: string,
  structuredData: StructuredDataNode | StructuredDataNode[]
) {
  if (typeof document === 'undefined') return

  let script = document.head.querySelector(
    `script[data-seo-jsonld="${id}"]`
  ) as HTMLScriptElement | null

  if (!script) {
    script = document.createElement('script')
    script.type = 'application/ld+json'
    script.setAttribute('data-seo-jsonld', id)
    document.head.appendChild(script)
  }

  script.textContent = JSON.stringify(structuredData)
}

function removeStructuredDataScript(id: string) {
  if (typeof document === 'undefined') return

  document.head
    .querySelectorAll(`script[data-seo-jsonld="${id}"]`)
    .forEach((node) => node.parentNode?.removeChild(node))
}

function clearArticleMeta() {
  ARTICLE_META_KEYS.forEach((key) => removeMetaTag('property', key))
}

function applyArticleMeta(article?: ArticleMeta) {
  clearArticleMeta()

  if (!article) {
    return
  }

  if (article.publishedTime) {
    upsertMetaTag('property', 'article:published_time', article.publishedTime)
  }

  if (article.modifiedTime) {
    upsertMetaTag('property', 'article:modified_time', article.modifiedTime)
  }

  if (article.section) {
    upsertMetaTag('property', 'article:section', article.section)
  }

  article.authors
    ?.map((author) => String(author || '').trim())
    .filter(Boolean)
    .forEach((author) => {
      const tag = document.createElement('meta')
      tag.setAttribute('property', 'article:author')
      tag.setAttribute('content', author)
      document.head.appendChild(tag)
    })

  article.tags
    ?.map((tag) => String(tag || '').trim())
    .filter(Boolean)
    .forEach((tagValue) => {
      const tag = document.createElement('meta')
      tag.setAttribute('property', 'article:tag')
      tag.setAttribute('content', tagValue)
      document.head.appendChild(tag)
    })
}

export function resolveCanonicalUrl(pathOrUrl: string) {
  const normalized = String(pathOrUrl || '/').trim()
  if (!normalized) return SEO_BASE_URL
  if (/^https?:\/\//i.test(normalized)) return normalized

  const path = normalized.startsWith('/') ? normalized : `/${normalized}`
  const cleaned = path.length > 1 && path.endsWith('/') ? path.slice(0, -1) : path
  return `${SEO_BASE_URL}${cleaned || '/'}`
}

export function applySeoMeta(options: SeoMetaOptions) {
  if (typeof document === 'undefined') return

  const title = String(options.title || 'PEACE2074').trim() || 'PEACE2074'
  const description = String(options.description || DEFAULT_DESCRIPTION).trim()
  const canonical = resolveCanonicalUrl(
    options.canonical ||
      (typeof window !== 'undefined'
        ? `${window.location.pathname}${window.location.search}`
        : '/')
  )
  const image = resolveCanonicalUrl(options.image || DEFAULT_OG_IMAGE)
  const locale = String(options.locale || 'en').trim() || 'en'
  const keywords = Array.from(
    new Set([
      ...(options.keywords || []).map((keyword) => String(keyword || '').trim()),
      ...DEFAULT_SEO_KEYWORDS,
    ].filter(Boolean))
  )

  document.title = title
  upsertMetaTag('name', 'description', description)
  upsertMetaTag('name', 'keywords', keywords.join(', '))
  upsertMetaTag('name', 'robots', options.robots || DEFAULT_ROBOTS)
  upsertMetaTag('name', 'application-name', 'PEACE2074')
  upsertMetaTag('property', 'og:type', options.ogType || 'website')
  upsertMetaTag('property', 'og:site_name', 'PEACE2074')
  upsertMetaTag('property', 'og:title', title)
  upsertMetaTag('property', 'og:description', description)
  upsertMetaTag('property', 'og:url', canonical)
  upsertMetaTag('property', 'og:image', image)
  upsertMetaTag('property', 'og:image:alt', options.imageAlt || 'PEACE2074 logo')
  upsertMetaTag('property', 'og:locale', normalizeOgLocale(locale))
  upsertMetaTag('name', 'twitter:card', 'summary_large_image')
  upsertMetaTag('name', 'twitter:title', title)
  upsertMetaTag('name', 'twitter:description', description)
  upsertMetaTag('name', 'twitter:image', image)
  upsertMetaTag('name', 'twitter:url', canonical)
  upsertCanonical(canonical)
  applyArticleMeta(options.article)

  const structuredDataId = options.structuredDataId || DEFAULT_STRUCTURED_DATA_ID
  if (options.structuredData) {
    upsertStructuredDataScript(structuredDataId, options.structuredData)
  } else {
    removeStructuredDataScript(structuredDataId)
  }
}

export function buildPageStructuredData(options: PageStructuredDataOptions) {
  const keywords = (options.keywords || []).filter(Boolean)

  return {
    '@context': 'https://schema.org',
    '@type': options.type || 'WebPage',
    name: options.title,
    description: options.description,
    url: resolveCanonicalUrl(options.canonical),
    inLanguage: options.locale || 'en',
    isPartOf: {
      '@type': 'WebSite',
      name: 'PEACE2074',
      url: SEO_BASE_URL,
    },
    ...(keywords.length ? { keywords: keywords.join(', ') } : {}),
  }
}

export function buildBreadcrumbStructuredData(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: resolveCanonicalUrl(item.item),
    })),
  }
}

export function buildBlogPostingStructuredData(
  options: BlogStructuredDataOptions
) {
  const image = resolveCanonicalUrl(options.image || DEFAULT_OG_IMAGE)
  const tags = (options.tags || []).filter(Boolean)

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: options.title,
    description: options.description,
    url: resolveCanonicalUrl(options.canonical),
    mainEntityOfPage: resolveCanonicalUrl(options.canonical),
    image: [image],
    inLanguage: options.locale || 'en',
    ...(options.publishedTime ? { datePublished: options.publishedTime } : {}),
    ...(options.modifiedTime ? { dateModified: options.modifiedTime } : {}),
    ...(options.author
      ? {
          author: {
            '@type': 'Person',
            name: options.author,
          },
        }
      : {}),
    publisher: {
      '@type': 'Organization',
      name: 'PEACE2074',
      logo: {
        '@type': 'ImageObject',
        url: DEFAULT_OG_IMAGE,
      },
    },
    ...(tags.length ? { keywords: tags.join(', ') } : {}),
  }
}