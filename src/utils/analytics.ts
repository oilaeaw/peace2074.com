type AnalyticsScalar = string | number | boolean | null | undefined
type AnalyticsValue = AnalyticsScalar | AnalyticsScalar[]
type AnalyticsParams = Record<string, AnalyticsValue>

type GtagParams = Record<
  string,
  string | number | boolean | null | undefined
>
type GtagFunction = (
  command: 'event',
  eventName: string,
  params?: GtagParams
) => void

const PAGEVIEW_DEDUPE_MS = 1500
const MAX_TRACKED_PAGEVIEWS = 200
const CONSENT_KEY = 'consent-banner-v1'
const recentPageViews = new Map<string, number>()

let analyticsBridgeInstalled = false
let originalConsentGrantHandler: (() => void) | null = null
let originalGtag: GtagFunction | null = null

export function installAnalyticsBridge() {
  if (typeof window === 'undefined' || analyticsBridgeInstalled) return

  analyticsBridgeInstalled = true
  originalConsentGrantHandler =
    typeof window.allConsentGranted === 'function'
      ? window.allConsentGranted.bind(window)
      : null
  originalGtag = typeof window.gtag === 'function' ? window.gtag.bind(window) : null

  window.allConsentGranted = () => {
    originalConsentGrantHandler?.()
    window.dispatchEvent(new CustomEvent('analytics-consent-granted'))
  }
}

function sanitizeAnalyticsParams(params: AnalyticsParams = {}): GtagParams {
  return Object.entries(params).reduce<GtagParams>((acc, [key, value]) => {
    if (value === null || value === undefined) {
      return acc
    }

    if (Array.isArray(value)) {
      const serialized = value
        .filter((entry): entry is string | number | boolean => entry !== null && entry !== undefined)
        .map((entry) => String(entry).trim())
        .filter(Boolean)
        .join(', ')

      if (serialized) {
        acc[key] = serialized
      }

      return acc
    }

    if (typeof value === 'string') {
      const trimmed = value.trim()
      if (trimmed) {
        acc[key] = trimmed
      }
      return acc
    }

    acc[key] = value
    return acc
  }, {})
}

function pruneRecentPageViews(now: number) {
  if (recentPageViews.size <= MAX_TRACKED_PAGEVIEWS) return

  for (const [key, ts] of recentPageViews.entries()) {
    if (now - ts > PAGEVIEW_DEDUPE_MS * 2) {
      recentPageViews.delete(key)
    }
  }
}

export function getGtag(): GtagFunction | null {
  if (typeof window === 'undefined') return null

  const candidate: unknown = window.gtag
  return typeof candidate === 'function' ? (candidate as GtagFunction) : null
}

export function trackAnalyticsEvent(
  eventName: string,
  params: AnalyticsParams = {}
) {
  const gtag = getGtag()
  if (!gtag) return false

  gtag('event', eventName, sanitizeAnalyticsParams(params))
  return true
}

export function trackAnalyticsPageView(
  params: {
    pageTitle: string
    pagePath: string
    pageLocation?: string
    source?: string
    dedupeKey?: string
    dedupeMs?: number
  } & AnalyticsParams
) {
  const {
    pageTitle,
    pagePath,
    pageLocation,
    source,
    dedupeKey,
    dedupeMs = PAGEVIEW_DEDUPE_MS,
    ...rest
  } = params

  const now = Date.now()
  const key = dedupeKey || `${pagePath}|${pageTitle}`
  const lastTrackedAt = recentPageViews.get(key) || 0

  if (now - lastTrackedAt < dedupeMs) {
    return false
  }

  recentPageViews.set(key, now)
  pruneRecentPageViews(now)

  return trackAnalyticsEvent('page_view', {
    page_title: pageTitle,
    page_location:
      pageLocation ||
      (typeof window !== 'undefined' ? window.location.href : pagePath),
    page_path: pagePath,
    source,
    ...rest,
  })
}