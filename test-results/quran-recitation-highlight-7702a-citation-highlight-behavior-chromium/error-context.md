# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: quran-recitation-highlight.spec.ts >> Quran recitation highlight iteration and settings >> toggling highlight mode on preferences page updates recitation highlight behavior
- Location: tests/quran-recitation-highlight.spec.ts:150:3

# Error details

```
Error: expect(locator).not.toHaveClass(expected) failed

Locator: locator('.paused-indicator-banner .q-toggle')
Expected pattern: not /disabled/
Received string: "q-toggle cursor-pointer no-outline row inline no-wrap items-center disabled"
Timeout: 15000ms

Call log:
  - Expect "not toHaveClass" with timeout 15000ms
  - waiting for locator('.paused-indicator-banner .q-toggle')
    19 × locator resolved to <div tabindex="-1" role="switch" data-v-327ceab5="" aria-checked="false" aria-disabled="true" class="q-toggle cursor-pointer no-outline row inline no-wrap items-center disabled">…</div>
       - unexpected value "q-toggle cursor-pointer no-outline row inline no-wrap items-center disabled"

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
            - switch [disabled] [ref=e22]:
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
                - switch [disabled] [ref=e49]:
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
                - generic [ref=e89]: cloud_off
                - generic [ref=e90]: Internet currently required
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
  1   | import { test, expect } from '@playwright/test'
  2   | 
  3   | const acceptConsent = async (page: any) => {
  4   |   await page
  5   |     .getByRole('button', { name: /^accept$/i })
  6   |     .click({ timeout: 2000 })
  7   |     .catch(() => {})
  8   | }
  9   | 
  10  | const startRecitation = async (page: any) => {
  11  |   const toggle = page.locator('.paused-indicator-banner .q-toggle')
  12  |   await expect(toggle).toBeVisible({ timeout: 15000 })
  13  |   // Wait until audio is loaded and toggle is enabled
> 14  |   await expect(toggle).not.toHaveClass(/disabled/, { timeout: 15000 })
      |                            ^ Error: expect(locator).not.toHaveClass(expected) failed
  15  | 
  16  |   const isChecked = await toggle.getAttribute('aria-checked')
  17  |   if (isChecked !== 'true') {
  18  |     await toggle.click()
  19  |     // Verify recitation successfully started
  20  |     await expect(toggle).toHaveAttribute('aria-checked', 'true', {
  21  |       timeout: 10000,
  22  |     })
  23  |   }
  24  | }
  25  | 
  26  | const stopRecitation = async (page: any) => {
  27  |   const toggle = page.locator('.paused-indicator-banner .q-toggle')
  28  |   if (await toggle.isVisible().catch(() => false)) {
  29  |     const isChecked = await toggle
  30  |       .getAttribute('aria-checked')
  31  |       .catch(() => 'false')
  32  |     if (isChecked === 'true') {
  33  |       await toggle.click().catch(() => {})
  34  |       await expect(toggle)
  35  |         .toHaveAttribute('aria-checked', 'false', { timeout: 5000 })
  36  |         .catch(() => {})
  37  |     }
  38  |   }
  39  | }
  40  | 
  41  | test.describe('Quran recitation highlight iteration and settings', () => {
  42  |   test.beforeEach(async ({ page }) => {
  43  |     await page.addInitScript(() => {
  44  |       localStorage.setItem('user-consented', 'true')
  45  |       localStorage.setItem('consent-version', '1.0')
  46  |     })
  47  |   })
  48  | 
  49  |   test.afterEach(async ({ page }) => {
  50  |     await stopRecitation(page)
  51  |   })
  52  | 
  53  |   test('word highlight mode iterates through words sequentially during recitation', async ({
  54  |     page,
  55  |   }) => {
  56  |     await page.goto('/quran/1/reader?highlight=word')
  57  |     await acceptConsent(page)
  58  |     await page.waitForSelector('.arabic-text', { timeout: 15000 })
  59  | 
  60  |     await startRecitation(page)
  61  | 
  62  |     // Observe word highlight progress
  63  |     const observedWords: string[] = []
  64  |     const startTime = Date.now()
  65  | 
  66  |     while (Date.now() - startTime < 8000) {
  67  |       const currentWordId = await page.evaluate(() => {
  68  |         const el = document.querySelector('.is-current-word')
  69  |         return el ? el.id : null
  70  |       })
  71  |       if (
  72  |         currentWordId &&
  73  |         (observedWords.length === 0 ||
  74  |           observedWords[observedWords.length - 1] !== currentWordId)
  75  |       ) {
  76  |         observedWords.push(currentWordId)
  77  |       }
  78  |       if (observedWords.length >= 4) {
  79  |         break
  80  |       }
  81  |       await page.waitForTimeout(100)
  82  |     }
  83  | 
  84  |     // Must have iterated through multiple words of Ayah 1
  85  |     expect(observedWords.length).toBeGreaterThanOrEqual(2)
  86  |     expect(observedWords[0]).toBe('word-1-0')
  87  |     expect(observedWords).toContain('word-1-1')
  88  |   })
  89  | 
  90  |   test('sentence highlight mode highlights the whole ayah without highlighting individual words', async ({
  91  |     page,
  92  |   }) => {
  93  |     await page.goto('/quran/1/reader?highlight=ayah')
  94  |     await acceptConsent(page)
  95  |     await page.waitForSelector('.arabic-text', { timeout: 15000 })
  96  | 
  97  |     await startRecitation(page)
  98  | 
  99  |     // Wait for playback to begin and highlight active ayah
  100 |     await expect(page.locator('.verse-row.is-current-ayah')).toBeVisible({
  101 |       timeout: 10000,
  102 |     })
  103 | 
  104 |     // Individual words should NOT have .is-current-word in sentence mode
  105 |     const currentWordCount = await page.locator('.is-current-word').count()
  106 |     expect(currentWordCount).toBe(0)
  107 |   })
  108 | 
  109 |   test('word highlight mode works in mushaf and native layout modes', async ({
  110 |     page,
  111 |   }) => {
  112 |     // Test mushaf layout
  113 |     await page.goto('/quran/1/mushaf?highlight=word')
  114 |     await acceptConsent(page)
```