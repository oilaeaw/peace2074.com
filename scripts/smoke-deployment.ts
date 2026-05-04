type JsonRecord = Record<string, any>

function normalizeBaseUrl(value: unknown) {
    return typeof value === 'string' ? value.trim().replace(/\/$/, '') : ''
}

function assert(condition: unknown, message: string): asserts condition {
    if (!condition) {
        throw new Error(message)
    }
}

async function fetchText(baseURL: string, path: string) {
    const response = await fetch(`${baseURL}${path}`)
    const body = await response.text()
    return { response, body }
}

async function fetchJson(baseURL: string, path: string) {
    const response = await fetch(`${baseURL}${path}`, {
        headers: { accept: 'application/json' },
    })
    const body = (await response.json()) as JsonRecord
    return { response, body }
}

async function main() {
    const baseURL = normalizeBaseUrl(
        process.env.SMOKE_BASE_URL || process.env.BASE_URL || 'http://localhost:4000'
    )

    assert(baseURL, 'Set SMOKE_BASE_URL or BASE_URL before running the deployment smoke test')

    console.log(`[smoke] verifying ${baseURL}`)

    const home = await fetchText(baseURL, '/')
    assert(home.response.ok, `Expected / to return 200, received ${home.response.status}`)
    assert(
        home.body.includes('PEACE2074') || home.body.includes('id="app"'),
        'Home page did not include expected PEACE2074 app markup'
    )
    console.log('✓ home page responds')

    const quranPage = await fetchText(baseURL, '/quran')
    assert(quranPage.response.ok, `Expected /quran to return 200, received ${quranPage.response.status}`)
    assert(
        quranPage.body.includes('PEACE2074') || quranPage.body.includes('id="app"'),
        'Quran route did not include expected SPA markup'
    )
    console.log('✓ quran route responds')

    const health = await fetchJson(baseURL, '/api/health')
    assert(health.response.ok, `Expected /api/health to return 200, received ${health.response.status}`)
    assert(health.body.status === 'OK', 'Expected /api/health to report status OK')
    console.log('✓ api health is OK')

    const authHealth = await fetchJson(baseURL, '/api/auth/health')
    assert(authHealth.response.ok, `Expected /api/auth/health to return 200, received ${authHealth.response.status}`)
    assert(authHealth.body.ok === true, 'Expected /api/auth/health to report ok=true')
    assert(typeof authHealth.body.timestamp === 'string', 'Expected /api/auth/health to include timestamp')
    console.log('✓ auth health returns diagnostics')

    const quranApi = await fetchJson(baseURL, '/api/quran/1?lang=en')
    assert(quranApi.response.ok, `Expected /api/quran/1 to return 200, received ${quranApi.response.status}`)
    assert(quranApi.body?.sura?.id === 1, 'Expected sura id 1 from /api/quran/1')
    assert(Array.isArray(quranApi.body?.sura?.ayat), 'Expected /api/quran/1 to include ayat array')
    assert(quranApi.body.sura.ayat.length > 0, 'Expected /api/quran/1 to include at least one ayah')
    console.log('✓ quran API returns stable payload')

    const changelog = await fetchJson(baseURL, '/api/changelog')
    assert(changelog.response.ok, `Expected /api/changelog to return 200, received ${changelog.response.status}`)
    assert(changelog.body.ok === true, 'Expected /api/changelog to report ok=true')
    assert(Array.isArray(changelog.body.deploys), 'Expected /api/changelog to include deploys array')
    assert(changelog.body.deploys.length > 0, 'Expected /api/changelog to include at least one deploy entry')
    console.log('✓ changelog endpoint returns deploy entries')

    console.log('[smoke] all deployment checks passed')
}

main().catch((error) => {
    if (error instanceof Error) {
        console.error(`[smoke] ${error.message}`)
        if (error.cause) {
            console.error(`[smoke] cause: ${String(error.cause)}`)
        }
    } else {
        console.error(`[smoke] ${String(error)}`)
    }
    process.exitCode = 1
})