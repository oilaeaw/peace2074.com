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
        await page.waitForURL(/\/login$/, { timeout: 15000 })

        await dismissCookieBanner(page)

        await page.getByRole('textbox', { name: /^username$/i }).fill(username)
        await page.getByLabel(/^password$/i).fill(password)
        const signInBtn = page.getByRole('button', { name: /^sign in$/i })
        await expect(signInBtn).toBeEnabled()
        page.on('console', (msg) => console.log('PAGE LOG:', msg.text()))
        page.on('response', (res) => {
            if (res.url().includes('/auth') || res.url().includes('/login')) {
                console.log('AUTH RES:', res.status(), res.url())
            }
        })
        await signInBtn.click()

        // Dismiss passkey enrollment prompt if shown before navigation proceeds
        await page
            .getByRole('button', { name: /^cancel$/i })
            .click({ timeout: 5000 })
            .catch(() => { })

        await expect(page).toHaveURL(/\/$/, { timeout: 15000 })

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

    test('local social login buttons are present and dev login works', async ({ page }) => {
        await page.goto('/login')
        await dismissCookieBanner(page)

        const googleBtn = page.locator('[data-testid="login-google"]')
        const appleBtn = page.locator('[data-testid="login-apple"]')

        await expect(googleBtn).toBeVisible()
        await expect(appleBtn).toBeVisible()

        // Clicking Google in local dev triggers dev login
        await googleBtn.click()
        await expect(page).toHaveURL(/\/$/, { timeout: 15000 })

        const accountMenuButton = page.getByRole('button', { name: /profile/i })
        await expect(accountMenuButton).toBeVisible()
    })
})