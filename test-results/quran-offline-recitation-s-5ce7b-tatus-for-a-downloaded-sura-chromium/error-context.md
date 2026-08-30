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
- generic [ref=e3]:
  - generic [ref=e5]:
    - banner:
      - navigation:
        - link "← Back":
          - /url: /quran
        - heading "Quran" [level=1]
        - link "Home":
          - /url: /
    - main [ref=e7]:
      - generic [ref=e8]:
        - link "← Back to list" [ref=e9] [cursor=pointer]:
          - /url: /quran
          - generic [ref=e11]: ← Back to list
        - alert [ref=e12]:
          - generic [ref=e14]: stop
          - generic [ref=e16]:
            - generic [ref=e17]: Play recitation
            - generic [ref=e18]: sura number 1 • verses 1 / 7 • Audio
          - generic [ref=e20]:
            - generic [ref=e21]: Play recitation
            - switch [ref=e22] [cursor=pointer]:
              - generic [ref=e26]: play_arrow
        - generic [ref=e27]:
          - generic [ref=e28]:
            - generic [ref=e29]:
              - generic [ref=e30]: The Opener — الفاتحة
              - generic [ref=e31]: "sura number: 1 • meccan • 7"
            - generic [ref=e32]:
              - button "Shazam Audio Sync" [ref=e33] [cursor=pointer]:
                - generic [ref=e34]:
                  - img [ref=e35]: graphic_eq
                  - generic [ref=e36]: Shazam Audio Sync
              - generic [ref=e37]:
                - button "Audio" [pressed] [ref=e38] [cursor=pointer]:
                  - generic [ref=e39]:
                    - img [ref=e40]: volume_up
                    - generic [ref=e41]: Audio
                - button "TTS" [ref=e42] [cursor=pointer]:
                  - generic [ref=e43]:
                    - img [ref=e44]: record_voice_over
                    - generic [ref=e45]: TTS
              - generic [ref=e47]:
                - generic [ref=e48]: Play recitation
                - switch [ref=e49] [cursor=pointer]:
                  - generic [ref=e53]: play_arrow
              - switch "Auto-continue to next sura" [ref=e54] [cursor=pointer]:
                - generic [ref=e58]: Auto-continue to next sura
              - generic [ref=e63] [cursor=pointer]:
                - generic [ref=e64]: 1x
                - combobox "1x" [ref=e65]
              - generic [ref=e67]:
                - button "Mushaf mode" [ref=e68] [cursor=pointer]:
                  - generic [ref=e69]:
                    - img [ref=e70]: auto_stories
                    - generic [ref=e71]: Mushaf mode
                - button "Reader mode" [pressed] [ref=e72] [cursor=pointer]:
                  - generic [ref=e73]:
                    - img [ref=e74]: menu_book
                    - generic [ref=e75]: Reader mode
                - button "Native mode" [ref=e76] [cursor=pointer]:
                  - generic [ref=e77]:
                    - img [ref=e78]: article
                    - generic [ref=e79]: Native mode
              - button "Quick" [ref=e80] [cursor=pointer]:
                - generic [ref=e81]:
                  - img [ref=e82]: flash_on
                  - generic [ref=e83]: Quick
              - button "Bookmarks" [ref=e84] [cursor=pointer]:
                - generic [ref=e85]:
                  - img [ref=e86]: bookmark
                  - generic [ref=e87]: Bookmarks
              - generic [ref=e88]:
                - generic [ref=e89]: offline_pin
                - generic [ref=e90]: Listen without internet
              - button "Offline Recitation" [ref=e91] [cursor=pointer]:
                - generic [ref=e92]:
                  - img [ref=e93]: download
                  - generic [ref=e94]: Offline Recitation
          - generic [ref=e96]:
            - generic [ref=e98] [cursor=pointer]:
              - generic [ref=e99]:
                - generic [ref=e100]: "1"
                - button "Bookmark verse 1" [ref=e101]:
                  - generic [ref=e102]: star_outline
                - button "Share verse 1:1" [ref=e103]:
                  - generic [ref=e104]: share
              - generic [ref=e105]: بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ
            - generic [ref=e107] [cursor=pointer]:
              - generic [ref=e108]:
                - generic [ref=e109]: "2"
                - button "Bookmark verse 2" [ref=e110]:
                  - generic [ref=e111]: star_outline
                - button "Share verse 1:2" [ref=e112]:
                  - generic [ref=e113]: share
              - generic [ref=e114]: ٱلۡحَمۡدُ لِلَّهِ رَبِّ ٱلۡعَٰلَمِينَ
            - generic [ref=e116] [cursor=pointer]:
              - generic [ref=e117]:
                - generic [ref=e118]: "3"
                - button "Bookmark verse 3" [ref=e119]:
                  - generic [ref=e120]: star_outline
                - button "Share verse 1:3" [ref=e121]:
                  - generic [ref=e122]: share
              - generic [ref=e123]: ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ
            - generic [ref=e125] [cursor=pointer]:
              - generic [ref=e126]:
                - generic [ref=e127]: "4"
                - button "Bookmark verse 4" [ref=e128]:
                  - generic [ref=e129]: star_outline
                - button "Share verse 1:4" [ref=e130]:
                  - generic [ref=e131]: share
              - generic [ref=e132]: مَٰلِكِ يَوۡمِ ٱلدِّينِ
            - generic [ref=e134] [cursor=pointer]:
              - generic [ref=e135]:
                - generic [ref=e136]: "5"
                - button "Bookmark verse 5" [ref=e137]:
                  - generic [ref=e138]: star_outline
                - button "Share verse 1:5" [ref=e139]:
                  - generic [ref=e140]: share
              - generic [ref=e141]: إِيَّاكَ نَعۡبُدُ وَإِيَّاكَ نَسۡتَعِينُ
            - generic [ref=e143] [cursor=pointer]:
              - generic [ref=e144]:
                - generic [ref=e145]: "6"
                - button "Bookmark verse 6" [ref=e146]:
                  - generic [ref=e147]: star_outline
                - button "Share verse 1:6" [ref=e148]:
                  - generic [ref=e149]: share
              - generic [ref=e150]: ٱهۡدِنَا ٱلصِّرَٰطَ ٱلۡمُسۡتَقِيمَ
            - generic [ref=e152] [cursor=pointer]:
              - generic [ref=e153]:
                - generic [ref=e154]: "7"
                - button "Bookmark verse 7" [ref=e155]:
                  - generic [ref=e156]: star_outline
                - button "Share verse 1:7" [ref=e157]:
                  - generic [ref=e158]: share
              - generic [ref=e159]: صِرَٰطَ ٱلَّذِينَ أَنۡعَمۡتَ عَلَيۡهِمۡ غَيۡرِ ٱلۡمَغۡضُوبِ عَلَيۡهِمۡ وَلَا ٱلضَّآلِّينَ
  - generic: God bless my mom
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