import { test, expect } from '@playwright/test'

test('home -> quran list -> sura detail loads', async ({ page }) => {
    // Home
    await page.goto('/')
    await expect(page).toHaveURL(/\/?$/)
    await expect(page.locator('text=Read Quran').first()).toBeVisible()

    // Go to Quran list
    await page.click('text=Read Quran')
    await page.waitForURL(/\/quran/)
    // Expect at least one surah tile or list (sura cards are divs)
    const list = page.locator('.sura-card')
    await expect(list.first()).toBeVisible()

    // Open first sura detail by clicking the first card
    await list.first().click()
    await page.waitForURL(/\/quran\//)

    // Expect Arabic content or verse markers
    await expect(page.locator('.arabic-text').first()).toBeVisible()
})
