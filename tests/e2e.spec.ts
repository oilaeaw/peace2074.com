import { test, expect } from '@playwright/test'

const quranLoadTimeoutMs = 30000

test('home -> quran list -> sura detail loads', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL(/\/?$/)

    await page.goto('/quran')
    await page.waitForURL(/\/quran$/)

    const list = page.locator('a.sura-card')
    await expect(list.first()).toBeVisible({ timeout: quranLoadTimeoutMs })
    await expect(list).toHaveCount(114, { timeout: quranLoadTimeoutMs })

    await page.goto('/quran/1/reader')
    await page.waitForURL(/\/quran\/1\/reader$/)

    await expect(page.locator('.arabic-text').first()).toBeVisible({ timeout: quranLoadTimeoutMs })
})

test('locale switch updates UI and persists', async ({ page }) => {
    await page.goto('/')

    await page.evaluate(() => {
        localStorage.setItem('app-locale', 'ar')
    })

    await page.reload()

    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
    await expect(page.locator('html')).toHaveAttribute('lang', 'ar')

    const stored = await page.evaluate(() => localStorage.getItem('app-locale'))
    expect(stored).toBe('ar')
})
