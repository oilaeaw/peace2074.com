# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: sura-flow.spec.ts >> Quran Navigation and Search Flow >> should navigate to a sura and render Arabic text
- Location: tests/sura-flow.spec.ts:20:5

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:4000/quran
Call log:
  - navigating to "http://127.0.0.1:4000/quran", waiting until "load"

```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Quran Navigation and Search Flow', () => {
  4  |     test.beforeEach(async ({ page }) => {
> 5  |         await page.goto('/quran');
     |                    ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:4000/quran
  6  |     });
  7  | 
  8  |     test('should display the sura list on load', async ({ page }) => {
  9  |         const suraCards = page.locator('a.sura-card');
  10 |         await expect(suraCards.first()).toBeVisible();
  11 |         await expect(suraCards).toHaveCount(114);
  12 |     });
  13 | 
  14 |     test('should show Al-Fatiha as the first sura card', async ({ page }) => {
  15 |         const firstCard = page.locator('a.sura-card').first();
  16 |         await expect(firstCard).toBeVisible();
  17 |         await expect(firstCard).toContainText(/The Opener|Fati/i);
  18 |     });
  19 | 
  20 |     test('should navigate to a sura and render Arabic text', async ({ page }) => {
  21 |         const firstCard = page.locator('a.sura-card').first();
  22 |         await expect(firstCard).toBeVisible();
  23 |         const href = await firstCard.getAttribute('href');
  24 |         expect(href).toBeTruthy();
  25 |         await page.goto(`${href}/reader`);
  26 | 
  27 |         await page.waitForURL(/\/quran\/\d+\/reader/);
  28 | 
  29 |         const arabicText = page.locator('.arabic-text').first();
  30 |         await expect(arabicText).toBeVisible();
  31 |         await expect(arabicText).toHaveText(/.+/, { timeout: 10000 });
  32 |     });
  33 | 
  34 |     test('should apply RTL direction when switching to Arabic locale', async ({ page }) => {
  35 |         await page.evaluate(() => {
  36 |             localStorage.setItem('app-locale', 'ar');
  37 |         });
  38 |         await page.reload();
  39 | 
  40 |         const html = page.locator('html');
  41 |         await expect(html).toHaveAttribute('dir', 'rtl');
  42 |         await expect(html).toHaveAttribute('lang', 'ar');
  43 |     });
  44 | 
  45 |     test('should render all 114 surah cards', async ({ page }) => {
  46 |         const suraCards = page.locator('a.sura-card');
  47 |         await expect(suraCards).toHaveCount(114);
  48 |         await expect(suraCards.nth(113)).toBeVisible();
  49 |     });
  50 | });
```