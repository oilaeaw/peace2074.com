import { test, expect } from '@playwright/test'

const KEYS = {
    compact: 'pref-compact-layout',
    motion: 'pref-reduce-motion',
    darkMode: 'pref-dark-mode',
    translation: 'quran-show-translation',
    fontSize: 'pref-font-size',
    highContrast: 'pref-high-contrast',
    navOrdering: 'nav-ordering-enabled',
    drawerDefault: 'drawer-open-by-default',
    autoplayAthan: 'pref-autoplay-athan',
    autoplayPrayer: 'pref-autoplay-prayer-times',
}

test.describe('Settings page', () => {
    test.beforeEach(async ({ page }) => {
        // Clear settings so each test starts from a known state
        await page.addInitScript(() => {
            const keys = [
                'pref-compact-layout',
                'pref-reduce-motion',
                'pref-dark-mode',
                'quran-show-translation',
                'pref-font-size',
                'pref-high-contrast',
                'nav-ordering-enabled',
                'drawer-open-by-default',
                'pref-autoplay-athan',
                'pref-autoplay-prayer-times',
            ]
            keys.forEach((k) => window.localStorage.removeItem(k))
        })
        await page.goto('/settings')
        // Dismiss cookie consent if present
        await page
            .getByRole('button', { name: /^accept$/i })
            .click({ timeout: 3000 })
            .catch(() => { })
    })

    test('settings page renders all section headings', async ({ page }) => {
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
        for (const heading of ['Display', 'Accessibility', 'Navigation', 'Notifications', 'Audio']) {
            await expect(page.getByText(heading, { exact: true }).first()).toBeVisible()
        }
    })

    // ── Display ──────────────────────────────────────────────────────────────

    test('compact layout toggle persists to localStorage', async ({ page }) => {
        const toggle = page.getByRole('switch', { name: /compact layout/i })
        await expect(toggle).toBeVisible()
        await toggle.click()
        const val = await page.evaluate((k) => window.localStorage.getItem(k), KEYS.compact)
        expect(val).toBe('true')
        await toggle.click()
        const val2 = await page.evaluate((k) => window.localStorage.getItem(k), KEYS.compact)
        expect(val2).toBe('false')
    })

    test('reduce motion toggle persists to localStorage', async ({ page }) => {
        const toggle = page.getByRole('switch', { name: /reduce motion/i })
        await toggle.click()
        const val = await page.evaluate((k) => window.localStorage.getItem(k), KEYS.motion)
        expect(val).toBe('true')
    })

    test('dark mode toggle applies body--dark class and persists', async ({ page }) => {
        const toggle = page.getByRole('switch', { name: /dark mode/i })
        await toggle.click()
        await expect(page.locator('body')).toHaveClass(/body--dark/)
        const val = await page.evaluate((k) => window.localStorage.getItem(k), KEYS.darkMode)
        expect(val).toBe('true')
        // Toggle back
        await toggle.click()
        await expect(page.locator('body')).not.toHaveClass(/body--dark/)
        const val2 = await page.evaluate((k) => window.localStorage.getItem(k), KEYS.darkMode)
        expect(val2).toBe('false')
    })

    test('show Quran translation toggle persists to localStorage', async ({ page }) => {
        const toggle = page.getByRole('switch', { name: /show quran translation/i })
        // Default is true; click to turn off
        await toggle.click()
        const val = await page.evaluate((k) => window.localStorage.getItem(k), KEYS.translation)
        expect(val).toBe('false')
    })

    // ── Accessibility ─────────────────────────────────────────────────────────

    test('font size slider applies CSS class to <html> and persists', async ({ page }) => {
        // Default font-size pref is 1 (Medium) → html should have font-medium
        const htmlClass = await page.evaluate(() => document.documentElement.className)
        expect(htmlClass).toContain('font-medium')

        // Move slider to max (3 = Extra Large) by clicking at the right edge of the track
        const slider = page.locator('.q-slider').first()
        await expect(slider).toBeVisible()
        const box = await slider.boundingBox()
        if (!box) throw new Error('Slider not found')
        // Click at the far right of the slider track to set value to max (3)
        await page.mouse.click(box.x + box.width - 2, box.y + box.height / 2)

        await expect(page.locator('html')).toHaveClass(/font-xlarge/)
        const val = await page.evaluate((k) => window.localStorage.getItem(k), KEYS.fontSize)
        expect(val).toBe('3')
    })

    test('high contrast toggle applies high-contrast class to <html> and persists', async ({ page }) => {
        const toggle = page.getByRole('switch', { name: /high contrast/i })
        await toggle.click()
        await expect(page.locator('html')).toHaveClass(/high-contrast/)
        const val = await page.evaluate((k) => window.localStorage.getItem(k), KEYS.highContrast)
        expect(val).toBe('true')
        await toggle.click()
        await expect(page.locator('html')).not.toHaveClass(/high-contrast/)
    })

    // ── Navigation ────────────────────────────────────────────────────────────

    test('nav ordering toggle persists to localStorage', async ({ page }) => {
        const toggle = page.getByRole('switch', { name: /enable drag ordering/i })
        // Default is true; click to disable
        await toggle.click()
        const val = await page.evaluate((k) => window.localStorage.getItem(k), KEYS.navOrdering)
        expect(val).toBe('false')
    })

    test('drawer open by default toggle persists to localStorage', async ({ page }) => {
        const toggle = page.getByRole('switch', { name: /open drawer on start/i })
        await toggle.click()
        const val = await page.evaluate((k) => window.localStorage.getItem(k), KEYS.drawerDefault)
        expect(val).toBe('true')
    })

    // ── Audio ─────────────────────────────────────────────────────────────────

    test('autoplay athan toggle persists to localStorage', async ({ page }) => {
        const toggle = page.getByRole('switch', { name: /autoplay athan/i })
        await toggle.click()
        const val = await page.evaluate((k) => window.localStorage.getItem(k), KEYS.autoplayAthan)
        expect(val).toBe('true')
    })

    test('adhan at prayer times toggle persists to localStorage', async ({ page }) => {
        const toggle = page.getByRole('switch', { name: /adhan at prayer times/i })
        // Default is true; click to disable
        await toggle.click()
        const val = await page.evaluate((k) => window.localStorage.getItem(k), KEYS.autoplayPrayer)
        expect(val).toBe('false')
    })

    // ── Refresh ────────────────────────────────────────────────────────────────

    test('refresh app button preserves critical settings on reload', async ({ page }) => {
        // Set some critical settings first
        await page.evaluate(() => {
            window.localStorage.setItem('pref-font-size', '2')
            window.localStorage.setItem('pref-high-contrast', 'true')
            window.localStorage.setItem('pref-dark-mode', 'true')
            window.localStorage.setItem('pref-autoplay-prayer-times', 'false')
        })

        const reloadBtn = page.getByRole('button', { name: /reload/i })
        await reloadBtn.click()

        // After reload, verify critical keys were preserved
        await page.waitForURL(/\/settings/)
        const fontSize = await page.evaluate(() => window.localStorage.getItem('pref-font-size'))
        const highContrast = await page.evaluate(() => window.localStorage.getItem('pref-high-contrast'))
        const darkMode = await page.evaluate(() => window.localStorage.getItem('pref-dark-mode'))
        const prayerAutoplay = await page.evaluate(() =>
            window.localStorage.getItem('pref-autoplay-prayer-times'),
        )

        expect(fontSize).toBe('2')
        expect(highContrast).toBe('true')
        expect(darkMode).toBe('true')
        expect(prayerAutoplay).toBe('false')
    })
})

// The recitation highlight toggle lives on /preferences (not /settings)
test.describe('Preferences page — recitation highlight', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/preferences')
        await page
            .getByRole('button', { name: /^accept$/i })
            .click({ timeout: 3000 })
            .catch(() => { })
    })

    test('Word is selected by default', async ({ page }) => {
        const wordBtn = page.getByRole('button', { name: /^word$/i })
        const sentenceBtn = page.getByRole('button', { name: /^sentence$/i })

        await expect(wordBtn).toBeVisible()
        await expect(sentenceBtn).toBeVisible()

        // Quasar q-btn-toggle marks the active option with aria-pressed="true"
        await expect(wordBtn).toHaveAttribute('aria-pressed', 'true')
        await expect(sentenceBtn).toHaveAttribute('aria-pressed', 'false')
    })

    test('clicking Sentence selects it and deselects Word', async ({ page }) => {
        const wordBtn = page.getByRole('button', { name: /^word$/i })
        const sentenceBtn = page.getByRole('button', { name: /^sentence$/i })

        await sentenceBtn.click()

        await expect(sentenceBtn).toHaveAttribute('aria-pressed', 'true')
        await expect(wordBtn).toHaveAttribute('aria-pressed', 'false')
    })

    test('clicking Word after Sentence reverts the selection', async ({ page }) => {
        const wordBtn = page.getByRole('button', { name: /^word$/i })
        const sentenceBtn = page.getByRole('button', { name: /^sentence$/i })

        await sentenceBtn.click()
        await wordBtn.click()

        await expect(wordBtn).toHaveAttribute('aria-pressed', 'true')
        await expect(sentenceBtn).toHaveAttribute('aria-pressed', 'false')
    })
})
