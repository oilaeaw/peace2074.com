type PagesEnv = {
    API_ORIGIN?: string
}

type PagesContext = {
    request: Request
    env: PagesEnv
}

function normalizeOrigin(value: unknown) {
    return typeof value === 'string' ? value.trim().replace(/\/$/, '') : ''
}

function stripTrailingSlash(value: string) {
    return value.length > 1 ? value.replace(/\/$/, '') : value
}

function joinPaths(basePath: string, requestPath: string) {
    const normalizedBase = stripTrailingSlash(basePath || '/')
    const normalizedRequest = requestPath.startsWith('/') ? requestPath : `/${requestPath}`

    if (normalizedBase === '/' || normalizedBase === '') {
        return normalizedRequest
    }

    if (
        normalizedRequest === normalizedBase
        || normalizedRequest.startsWith(`${normalizedBase}/`)
    ) {
        return normalizedRequest
    }

    return `${normalizedBase}${normalizedRequest}`.replace(/\/+/g, '/')
}

function buildTargetUrl(request: Request, apiOrigin: string) {
    const incomingUrl = new URL(request.url)
    const targetOrigin = new URL(`${apiOrigin}/`)
    const pathname = joinPaths(targetOrigin.pathname || '/', incomingUrl.pathname)

    return new URL(`${pathname}${incomingUrl.search}`, targetOrigin)
}

function buildProxyRequest(request: Request, targetUrl: URL) {
    const incomingUrl = new URL(request.url)
    const headers = new Headers(request.headers)

    headers.delete('host')
    headers.set('x-forwarded-host', incomingUrl.host)
    headers.set('x-forwarded-proto', incomingUrl.protocol.replace(':', ''))

    return new Request(targetUrl.toString(), {
        method: request.method,
        headers,
        body: request.method === 'GET' || request.method === 'HEAD' ? undefined : request.body,
        redirect: 'manual',
    })
}

export async function onRequest(context: PagesContext) {
    const apiOrigin = normalizeOrigin(context.env.API_ORIGIN)

    if (!apiOrigin) {
        return new Response('Cloudflare Pages API proxy is missing API_ORIGIN', {
            status: 500,
            headers: {
                'content-type': 'text/plain; charset=utf-8',
                'cache-control': 'no-store',
            },
        })
    }

    const targetUrl = buildTargetUrl(context.request, apiOrigin)
    const upstream = await fetch(buildProxyRequest(context.request, targetUrl))
    const headers = new Headers(upstream.headers)

    headers.set('x-proxied-by', 'cloudflare-pages')

    return new Response(upstream.body, {
        status: upstream.status,
        statusText: upstream.statusText,
        headers,
    })
}