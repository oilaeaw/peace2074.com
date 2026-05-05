# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e.spec.ts >> locale switch updates UI and persists
- Location: tests/e2e.spec.ts:22:1

# Error details

```
Error: page.reload: net::ERR_CONNECTION_REFUSED
Call log:
  - waiting for navigation until "load"

```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test'
  2  | 
  3  | const quranLoadTimeoutMs = 30000
  4  | 
  5  | test('home -> quran list -> sura detail loads', async ({ page }) => {
  6  |     await page.goto('/')
  7  |     await expect(page).toHaveURL(/\/?$/)
  8  | 
  9  |     await page.goto('/quran')
  10 |     await page.waitForURL(/\/quran$/)
  11 | 
  12 |     const list = page.locator('a.sura-card')
  13 |     await expect(list.first()).toBeVisible({ timeout: quranLoadTimeoutMs })
  14 |     await expect(list).toHaveCount(114, { timeout: quranLoadTimeoutMs })
  15 | 
  16 |     await page.goto('/quran/1/reader')
  17 |     await page.waitForURL(/\/quran\/1\/reader$/)
  18 | 
  19 |     await expect(page.locator('.arabic-text').first()).toBeVisible({ timeout: quranLoadTimeoutMs })
  20 | })
  21 | 
  22 | test('locale switch updates UI and persists', async ({ page }) => {
  23 |     await page.goto('/')
  24 | 
  25 |     await page.evaluate(() => {
  26 |         localStorage.setItem('app-locale', 'ar')
  27 |     })
  28 | 
> 29 |     await page.reload()
     |                ^ Error: page.reload: net::ERR_CONNECTION_REFUSED
  30 | 
  31 |     await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
  32 |     await expect(page.locator('html')).toHaveAttribute('lang', 'ar')
  33 | 
  34 |     const stored = await page.evaluate(() => localStorage.getItem('app-locale'))
  35 |     expect(stored).toBe('ar')
  36 | })
  37 | 
```