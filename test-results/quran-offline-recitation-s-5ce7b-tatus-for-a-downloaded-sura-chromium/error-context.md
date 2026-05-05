# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: quran-offline-recitation-status.spec.ts >> prefers cached recitation and shows offline-ready status for a downloaded sura
- Location: tests/quran-offline-recitation-status.spec.ts:3:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByTestId('offline-recitation-status')
Expected: visible
Timeout: 15000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 15000ms
  - waiting for getByTestId('offline-recitation-status')

```

# Page snapshot

```yaml
- generic [ref=e4]:
  - banner [ref=e5]:
    - navigation [ref=e6]:
      - link "← Back" [ref=e7] [cursor=pointer]:
        - /url: /quran
      - heading "Quran" [level=1] [ref=e8]
      - link "Home" [ref=e9] [cursor=pointer]:
        - /url: /
  - main [ref=e10]:
    - generic [ref=e11]:
      - link "← Back to list" [ref=e12] [cursor=pointer]:
        - /url: /quran
        - generic [ref=e14]: ← Back to list
      - alert [ref=e15]:
        - generic [ref=e17]: auto_awesome
        - generic [ref=e20]: A new feature is now available! Enable 'Auto-continue' to automatically progress through all 114 suras during recitation.
        - generic [ref=e21]:
          - button "close" [ref=e22] [cursor=pointer]:
            - generic [ref=e24]: close
          - button "Dismiss announcement" [ref=e25] [cursor=pointer]:
            - img [ref=e27]: close
      - generic [ref=e28]: "Failed to fetch. Fallback failed: Failed to fetch"
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test'
  2  | 
  3  | test('prefers cached recitation and shows offline-ready status for a downloaded sura', async ({
  4  |     page,
  5  | }) => {
  6  |     let quranApiRequested = false
  7  |     let fallbackApiRequested = false
  8  | 
  9  |     await page.route('https://api.quran.com/api/v4/verses/by_chapter/1?**', async (route) => {
  10 |         quranApiRequested = true
  11 |         await route.fulfill({
  12 |             status: 500,
  13 |             body: 'unexpected network request',
  14 |         })
  15 |     })
  16 | 
  17 |     await page.route('https://api.alquran.cloud/v1/surah/1/ar.alafasy', async (route) => {
  18 |         fallbackApiRequested = true
  19 |         await route.fulfill({
  20 |             status: 500,
  21 |             body: 'unexpected fallback request',
  22 |         })
  23 |     })
  24 | 
  25 |     await page.addInitScript(async () => {
  26 |         const cache = await caches.open('quran-audio-offline-regular-v1')
  27 | 
  28 |         for (let verse = 1; verse <= 7; verse += 1) {
  29 |             const paddedVerse = String(verse).padStart(3, '0')
  30 |             const url = `https://everyayah.com/data/Alafasy_64kbps/001${paddedVerse}.mp3`
  31 | 
  32 |             await cache.put(
  33 |                 url,
  34 |                 new Response(new Uint8Array([1, 2, 3, 4]), {
  35 |                     headers: {
  36 |                         'Content-Type': 'audio/mpeg',
  37 |                     },
  38 |                 })
  39 |             )
  40 |         }
  41 | 
  42 |         localStorage.setItem('quran-offline-recitation-quality', 'regular')
  43 |         localStorage.setItem('quran-reader-mode', 'audio')
  44 |     })
  45 | 
  46 |     await page.goto('/quran/1/reader')
  47 |     await page.waitForURL(/\/quran\/1\/reader$/)
  48 | 
  49 |     const offlineStatus = page.getByTestId('offline-recitation-status')
> 50 |     await expect(offlineStatus).toBeVisible({ timeout: 15000 })
     |                                 ^ Error: expect(locator).toBeVisible() failed
  51 |     await expect(offlineStatus).toHaveAttribute('data-offline-ready', 'true')
  52 | 
  53 |     expect(
  54 |         quranApiRequested,
  55 |         'downloaded recitation should be preferred over the quran.com API'
  56 |     ).toBe(false)
  57 |     expect(
  58 |         fallbackApiRequested,
  59 |         'downloaded recitation should be preferred over the fallback API'
  60 |     ).toBe(false)
  61 | })
```