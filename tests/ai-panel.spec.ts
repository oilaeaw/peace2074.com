import { test, expect } from '@playwright/test'

test.describe('AI assistant flow', () => {
    test.setTimeout(120_000)

    async function dismissCookieBanner(page: Parameters<typeof test>[0]['page']) {
        await page
            .getByRole('button', { name: /^accept$/i })
            .click({ timeout: 3000 })
            .catch(() => { })
    }

    async function waitForApiReady(page: Parameters<typeof test>[0]['page']) {
        await expect
            .poll(
                async () => {
                    try {
                        return await page.evaluate(async () => {
                            try {
                                const response = await fetch('/api/health', {
                                    credentials: 'include',
                                })

                                if (!response.ok) {
                                    return `http-${response.status}`
                                }

                                return 'ready'
                            } catch (error) {
                                return (error as Error)?.message || 'network-error'
                            }
                        })
                    } catch (error) {
                        return (error as Error)?.message || 'page-reloading'
                    }
                },
                {
                    timeout: 90_000,
                    intervals: [500, 1000, 2000],
                }
            )
            .toBe('ready')
    }

    test('AI API responds with assistant content', async ({ page }) => {
        await page.goto('/')
        await page.waitForLoadState('domcontentloaded')
        await dismissCookieBanner(page)
        await waitForApiReady(page)

        const body = await page.evaluate(async () => {
            const response = await fetch('/api/kimi', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [
                        {
                            role: 'user',
                            content:
                                'Briefly describe how Peace2074 helps users read and explore the Quran.',
                        },
                    ],
                }),
            })

            return {
                ok: response.ok,
                url: response.url,
                payload: await response.json(),
            }
        })

        expect(body.ok).toBeTruthy()
        expect(body.url).toContain('/api/kimi')

        const payload = body.payload
        expect(payload?.error).toBeFalsy()
        expect(typeof payload?.message?.content).toBe('string')
        expect(payload.message.content.trim().length).toBeGreaterThan(0)
    })

    test('support AI panel returns an answer without fetch errors', async ({ page }) => {
        await page.goto('/')
        await page.waitForLoadState('domcontentloaded')
        await dismissCookieBanner(page)
        await waitForApiReady(page)
        await page.evaluate(() => window.sessionStorage.removeItem('support-ai-hidden'))

        const widget = page.locator('.support-ai-widget')
        await expect(widget).toBeVisible()

        const openButton = widget.getByRole('button', { name: /ask support ai|ai support/i }).first()
        await expect(openButton).toBeVisible()
        await openButton.click()

        const promptInput = widget.getByLabel(/describe the problem or question/i)
        await expect(promptInput).toBeVisible()
        await promptInput.fill(
            'What Quran features can I use on Peace2074? Answer in one short sentence.'
        )

        const requestPromise = page.waitForRequest(
            (request) =>
                request.url().includes('/api/kimi') && request.method() === 'POST',
            { timeout: 90_000 }
        )
        const responsePromise = page.waitForResponse(
            (response) =>
                response.url().includes('/api/kimi') &&
                response.request().method() === 'POST',
            { timeout: 90_000 }
        )

        await widget.getByRole('button', { name: /^ask$/i }).click()

        const kimiRequest = await requestPromise
        const response = await responsePromise

        expect(kimiRequest.url()).toContain('/api/kimi')
        expect(response.ok()).toBeTruthy()

        const payload = await response.json()
        expect(payload?.error).toBeFalsy()

        const answer = widget.locator('.ai-response-text')
        await expect(answer).toBeVisible({ timeout: 90_000 })
        await expect(answer).not.toHaveText(/^\s*$/)
        await expect(widget).not.toContainText(/failed to fetch/i)
    })
})
