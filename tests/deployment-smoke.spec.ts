import { test, expect, type APIRequestContext } from '@playwright/test'

async function waitForApiReady(request: APIRequestContext) {
    await expect.poll(async () => {
        const response = await request.get('/api/health')
        if (!response.ok()) {
            return `HTTP ${response.status()}`
        }

        const body = await response.json().catch(() => null)
        return body?.status || 'missing-status'
    }, {
        timeout: 30_000,
        message: 'Expected /api/health to become ready before smoke assertions',
    }).toBe('OK')
}

test('deployment health endpoints respond with diagnostics', async ({ request }) => {
    await waitForApiReady(request)

    const health = await request.get('/api/health')
    expect(health.ok()).toBeTruthy()

    const healthBody = await health.json()
    expect(healthBody).toMatchObject({
        status: 'OK',
    })

    const authHealth = await request.get('/api/auth/health', {
        timeout: 30_000,
    })
    expect(authHealth.ok()).toBeTruthy()

    const authHealthBody = await authHealth.json()
    expect(authHealthBody).toMatchObject({
        ok: true,
    })
    expect(typeof authHealthBody.timestamp).toBe('string')
    expect(typeof authHealthBody.env?.hasAuthSecret).toBe('boolean')
    expect(typeof authHealthBody.env?.hasDatabaseUrl).toBe('boolean')
})

test('deployment data endpoints return stable shapes', async ({ request }) => {
    await waitForApiReady(request)

    const quran = await request.get('/api/quran/1?lang=en')
    expect(quran.ok()).toBeTruthy()

    const quranBody = await quran.json()
    expect(quranBody?.sura?.id).toBe(1)
    expect(Array.isArray(quranBody?.sura?.ayat)).toBe(true)
    expect(quranBody?.sura?.ayat?.length).toBeGreaterThan(0)

    const changelog = await request.get('/api/changelog')
    expect(changelog.ok()).toBeTruthy()

    const changelogBody = await changelog.json()
    expect(changelogBody?.ok).toBe(true)
    expect(Array.isArray(changelogBody?.deploys)).toBe(true)
    expect(changelogBody?.deploys?.length).toBeGreaterThan(0)
})