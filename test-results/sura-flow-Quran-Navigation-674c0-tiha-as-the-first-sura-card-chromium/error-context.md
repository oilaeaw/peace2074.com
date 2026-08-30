# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: sura-flow.spec.ts >> Quran Navigation and Search Flow >> should show Al-Fatiha as the first sura card
- Location: tests/sura-flow.spec.ts:14:5

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

# Page snapshot

```yaml
- generic [ref=e3]:
  - generic [ref=e5]:
    - banner [ref=e6]:
      - toolbar [ref=e7]:
        - button "Toggle menu" [ref=e8] [cursor=pointer]:
          - img [ref=e10]: menu
        - img "PEACE2074" [ref=e13]
        - link "Peace2074" [ref=e15] [cursor=pointer]:
          - /url: /
        - button "Search…" [ref=e16] [cursor=pointer]:
          - img [ref=e18]: search
        - button "Play Athan" [ref=e19] [cursor=pointer]:
          - img [ref=e21]: volume_up
        - button "Login" [ref=e22] [cursor=pointer]:
          - img [ref=e24]: login
    - main [ref=e26]:
      - heading "Quran" [level=1] [ref=e27]
      - generic [ref=e28]:
        - generic [ref=e30]:
          - generic [ref=e31]: auto_stories
          - generic [ref=e32]:
            - generic [ref=e33]: Track Your Quran Completion
            - generic [ref=e34]: 0 / 114 Surahs (0%)
            - progressbar [ref=e35]
        - generic [ref=e37]:
          - button "Continue Reading" [ref=e38] [cursor=pointer]:
            - generic [ref=e39]:
              - img [ref=e40]: play_arrow
              - generic [ref=e41]: Continue Reading
          - button "Reset Progress" [ref=e42] [cursor=pointer]:
            - generic [ref=e43]:
              - img [ref=e44]: restart_alt
              - generic [ref=e45]: Reset Progress
      - generic [ref=e46]: Loading…
      - generic [ref=e47]: If content doesn't load, ensure the server API /api/quran is running.
    - alert [ref=e48]:
      - generic [ref=e50]:
        - generic [ref=e51]: We use cookies to improve your experience and analyze site usage.
        - generic [ref=e52]: By clicking 'Accept', you consent to our use of cookies for analytics.
      - generic [ref=e53]:
        - button "Accept" [ref=e54] [cursor=pointer]:
          - generic [ref=e56]: Accept
        - button "Decline" [ref=e57] [cursor=pointer]:
          - generic [ref=e59]: Decline
    - contentinfo [ref=e60]:
      - generic [ref=e61]:
        - generic [ref=e62]:
          - img "decor" [ref=e63]
          - generic [ref=e64]: © 2026 Peace2074 · v3.3.27
        - navigation "Footer links" [ref=e65]:
          - link "About" [ref=e66] [cursor=pointer]:
            - /url: /about
          - link "Quran" [ref=e67] [cursor=pointer]:
            - /url: /quran
          - link "Terms and Conditions" [ref=e68] [cursor=pointer]:
            - /url: /terms
          - link "Privacy Policy" [ref=e69] [cursor=pointer]:
            - /url: /privacy
          - link "Contact" [ref=e70] [cursor=pointer]:
            - /url: /contact
          - link "Credits" [ref=e71] [cursor=pointer]:
            - /url: /credits
  - generic: God bless my mom
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
> 16 |         await expect(firstCard).toBeVisible()
     |                                 ^ Error: expect(locator).toBeVisible() failed
  17 |         await expect(firstCard).toContainText(/The Opener|Fati/i)
  18 |     })
  19 | 
  20 |     test('should navigate to a sura and render Arabic text', async ({ page }) => {
  21 |         const firstCard = page.locator('a.sura-card').first()
  22 |         await expect(firstCard).toBeVisible()
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