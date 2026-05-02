import { test, expect } from '@playwright/test'

test.describe('AI assistant flow', () => {
    test.setTimeout(120_000)

    async function dismissCookieBanner(page: Parameters<typeof test>[0]['page']) {
        await page
            .getByRole('button', { name: /^accept$/i })
            .click({ timeout: 3000 })
            .catch(() => { })
    }

    test('AI API responds with assistant content', async ({ request }) => {
        const response = await request.post('/api/kimi', {
            data: {
                messages: [
                    {
                        role: 'user',
                        content:
                            'Briefly describe how Peace2074 helps users read and explore the Quran.',
                    },
                ],
            },
            timeout: 90_000,
        })

        expect(response.ok()).toBeTruthy()
        expect(response.url()).toContain('/api/kimi')

        const body = await response.json()
        expect(body?.error).toBeFalsy()
        expect(typeof body?.message?.content).toBe('string')
        expect(body.message.content.trim().length).toBeGreaterThan(0)
    })

    test('support AI panel returns an answer without fetch errors', async ({ page }) => {
        await page.goto('/')
        await dismissCookieBanner(page)

        const widget = page.locator('.support-ai-widget')
        await expect(widget).toBeVisible()

        await widget.getByRole('button', { name: /ask support ai/i }).click()

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

        const request = await requestPromise
        const response = await responsePromise

        expect(request.url()).toContain('/api/kimi')
        expect(response.ok()).toBeTruthy()

        const payload = await response.json()
        expect(payload?.error).toBeFalsy()

        const answer = widget.locator('.ai-response-text')
        await expect(answer).toBeVisible({ timeout: 90_000 })
        await expect(answer).not.toHaveText(/^\s*$/)
        await expect(widget).not.toContainText(/failed to fetch/i)
    })
})
