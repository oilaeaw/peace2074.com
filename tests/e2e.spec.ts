import { test, expect } from '@playwright/test'

test('home -> quran list -> sura detail loads', async ({ page }) => {
    // Home
    await page.goto('/')
    await expect(page).toHaveURL(/\/?$/)
    const readQuranLink = page.getByRole('link', { name: /quran/i })
    await expect(readQuranLink).toBeVisible()

    // Go to Quran list
    await readQuranLink.click()
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

test('locale switch updates UI and persists', async ({ page }) => {
    await page.goto('/')

    // Default locale shows English search placeholder
    const searchInput = page.locator('.search input').first()
    await expect(searchInput).toHaveAttribute('placeholder', /Search/)

    // Open locale selector and choose Arabic
    const localeSelect = page.locator('.q-select').first()
    await localeSelect.click()
    await page.getByText('العربية', { exact: true }).click()

    // Arabic placeholder should now appear and document direction set to RTL
    await expect(searchInput).toHaveAttribute('placeholder', /ابحث/)
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')

    // Ensure persistence in storage
    const stored = await page.evaluate(() => localStorage.getItem('app-locale'))
    expect(stored).toBe('ar')
})
