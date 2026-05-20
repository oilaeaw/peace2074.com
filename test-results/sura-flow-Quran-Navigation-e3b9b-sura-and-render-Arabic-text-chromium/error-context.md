# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: sura-flow.spec.ts >> Quran Navigation and Search Flow >> should navigate to a sura and render Arabic text
- Location: tests/sura-flow.spec.ts:20:5

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('a.sura-card').first()
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('a.sura-card').first()

```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test'
  2  | 
  3  | test.describe('Quran Navigation and Search Flow', () => {
  4  |     test.beforeEach(async ({ page }) => {
  5  |         await page.goto('/quran')
  6  |     })
  7  | 
  8  |     test('should display the sura list on load', async ({ page }) => {
  9  |         const suraCards = page.locator('a.sura-card')
  10 |         await expect(suraCards.first()).toBeVisible()
  11 |         await expect(suraCards).toHaveCount(114)
  12 |     })
  13 | 
  14 |     test('should show Al-Fatiha as the first sura card', async ({ page }) => {
  15 |         const firstCard = page.locator('a.sura-card').first()
  16 |         await expect(firstCard).toBeVisible()
  17 |         await expect(firstCard).toContainText(/The Opener|Fati/i)
  18 |     })
  19 | 
  20 |     test('should navigate to a sura and render Arabic text', async ({ page }) => {
  21 |         const firstCard = page.locator('a.sura-card').first()
> 22 |         await expect(firstCard).toBeVisible()
     |                                 ^ Error: expect(locator).toBeVisible() failed
  23 |         const href = await firstCard.getAttribute('href')
  24 |         expect(href).toBeTruthy()
  25 |         await page.goto(`${href}/reader`)
  26 | 
  27 |         await page.waitForURL(/\/quran\/\d+\/reader/)
  28 | 
  29 |         const arabicText = page.locator('.arabic-text').first()
  30 |         await expect(arabicText).toBeVisible()
  31 |         await expect(arabicText).toHaveText(/.+/, { timeout: 10000 })
  32 |     })
  33 | 
  34 |     test('should apply RTL direction when switching to Arabic locale', async ({
  35 |         page,
  36 |     }) => {
  37 |         await page.evaluate(() => {
  38 |             localStorage.setItem('app-locale', 'ar')
  39 |         })
  40 |         await page.reload()
  41 | 
  42 |         const html = page.locator('html')
  43 |         await expect(html).toHaveAttribute('dir', 'rtl')
  44 |         await expect(html).toHaveAttribute('lang', 'ar')
  45 |     })
  46 | 
  47 |     test('should render all 114 surah cards', async ({ page }) => {
  48 |         const suraCards = page.locator('a.sura-card')
  49 |         await expect(suraCards).toHaveCount(114, { timeout: 15000 })
  50 |         await expect(suraCards.nth(113)).toBeVisible({ timeout: 5000 })
  51 |     })
  52 | })
  53 | 
```