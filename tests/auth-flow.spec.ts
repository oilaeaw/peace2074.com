import { test, expect } from '@playwright/test'

test.describe('authentication smoke flow', () => {
    async function dismissCookieBanner(page: Parameters<typeof test>[0]['page']) {
        await page
            .getByRole('button', { name: /^accept$/i })
            .click({ timeout: 3000 })
            .catch(() => { })
    }

    async function submitAuthForm(page: Parameters<typeof test>[0]['page']) {
        await page.locator('form.q-form').evaluate((form: HTMLFormElement) => {
            form.requestSubmit()
        })
    }

    async function scrollToTop(page: Parameters<typeof test>[0]['page']) {
        await page.evaluate(() => {
            window.scrollTo(0, 0)
        })
    }

    test.beforeEach(async ({ page }) => {
        await page.addInitScript(() => {
            try {
                Object.defineProperty(window, 'isSecureContext', {
                    configurable: true,
                    get: () => false,
                })
            } catch {
                // noop
            }

            try {
                Object.defineProperty(window, 'PublicKeyCredential', {
                    configurable: true,
                    value: undefined,
                })
            } catch {
                // noop
            }

            try {
                Object.defineProperty(navigator, 'credentials', {
                    configurable: true,
                    value: undefined,
                })
            } catch {
                // noop
            }
        })
    })

    test('local signup, login, and logout succeeds', async ({ page }) => {
        const uniqueId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
        const username = `e2e_${uniqueId}`
        const email = `${username}@example.com`
        const password = `Auth_${uniqueId}!42`

        await page.goto('/signup')
        await expect(page).toHaveURL(/\/signup$/)
        await dismissCookieBanner(page)

        await page.getByRole('textbox', { name: /^username$/i }).fill(username)
        await page.getByRole('textbox', { name: /^email$/i }).fill(email)
        await page.getByLabel(/^password$/i).fill(password)
        await page.getByLabel(/^confirm password$/i).fill(password)
        await page
            .getByRole('checkbox', { name: /i accept the terms and conditions/i })
            .click()
        await expect(page.getByRole('button', { name: /^sign up$/i })).toBeEnabled()
        await submitAuthForm(page)
        await expect(page).toHaveURL(/\/login$/)

        await dismissCookieBanner(page)

        await page.getByRole('textbox', { name: /^username$/i }).fill(username)
        await page.getByLabel(/^password$/i).fill(password)
        await expect(page.getByRole('button', { name: /^sign in$/i })).toBeEnabled()
        await submitAuthForm(page)
        await expect(page).toHaveURL(/\/$/)

        await page
            .getByRole('button', { name: /^cancel$/i })
            .click({ timeout: 3000 })
            .catch(() => { })

        const accountMenuButton = page.getByRole('button', { name: /profile/i })
        await expect(accountMenuButton).toBeVisible()

        await page.reload()
        await dismissCookieBanner(page)
        await scrollToTop(page)
        await expect(accountMenuButton).toBeVisible()

        await accountMenuButton.click()
        const logoutItem = page.getByText(/^sign out$/i)
        await expect(logoutItem).toBeVisible()
        await logoutItem.click()

        const loggedOutMenuButton = page.getByRole('button', { name: /^login$/i })
        await expect(loggedOutMenuButton).toBeVisible()
    })
})