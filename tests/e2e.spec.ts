import { test, expect } from '@playwright/test'

test('home -> quran list -> sura detail loads', async ({ page }) => {
    // Home
    await page.goto('/')
    await expect(page).toHaveURL(/\/?$/)
    await expect(page.locator('text=Read Quran').first()).toBeVisible()

    // Go to Quran list
    await page.click('text=Read Quran')
    await page.waitForURL(/\/quran/)
    // Expect at least one surah tile or list
    const list = page.locator('a[href^="/quran/"]')
    await expect(list.first()).toBeVisible()

    // Open first sura detail
    const href = await list.first().getAttribute('href')
    if (href) {
        await page.goto(href)
    } else {
        await page.goto('/quran/1')
    }

    // Expect Arabic content or verse markers
    await expect(page.locator('.arabic-text').first()).toBeVisible()
})
