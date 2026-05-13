# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: quran-ayah-action-card.spec.ts >> Quran ayah action card >> stays available on desktop hover in native layout
- Location: tests/quran-ayah-action-card.spec.ts:26:9

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByTestId('ayah-action-card')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByTestId('ayah-action-card')

```

# Page snapshot

```yaml
- generic [ref=e5]:
  - banner [ref=e6]:
    - navigation [ref=e7]:
      - link "← Back" [ref=e8] [cursor=pointer]:
        - /url: /quran
      - heading "Quran" [level=1] [ref=e9]
      - link "Home" [ref=e10] [cursor=pointer]:
        - /url: /
  - main [ref=e11]:
    - generic [ref=e12]:
      - link "← Back to list" [ref=e13] [cursor=pointer]:
        - /url: /quran
        - generic [ref=e15]: ← Back to list
      - alert [ref=e16]:
        - generic [ref=e18]: auto_awesome
        - generic [ref=e21]: A new feature is now available! Enable 'Auto-continue' to automatically progress through all 114 suras during recitation.
        - generic [ref=e22]:
          - button "close" [ref=e23] [cursor=pointer]:
            - generic [ref=e25]: close
          - button "Dismiss announcement" [ref=e26] [cursor=pointer]:
            - img [ref=e28]: close
      - alert [ref=e29]:
        - generic [ref=e31]: stop
        - generic [ref=e33]:
          - generic [ref=e34]: Play recitation
          - generic [ref=e35]: sura number 1 • verses 1 / 7 • Audio
        - generic [ref=e37]:
          - generic [ref=e38]: Play recitation
          - switch [ref=e39] [cursor=pointer]:
            - generic [ref=e43]: play_arrow
      - generic [ref=e44]:
        - generic [ref=e45]:
          - generic [ref=e46]:
            - generic [ref=e47]: The Opener — الفاتحة
            - generic [ref=e48]: "sura number: 1 • meccan • 7 verses"
          - generic [ref=e49]:
            - generic [ref=e50]:
              - button "Audio" [pressed] [ref=e51] [cursor=pointer]:
                - generic [ref=e52]:
                  - img [ref=e53]: volume_up
                  - generic [ref=e54]: Audio
              - button "TTS" [ref=e55] [cursor=pointer]:
                - generic [ref=e56]:
                  - img [ref=e57]: record_voice_over
                  - generic [ref=e58]: TTS
            - generic [ref=e60]:
              - generic [ref=e61]: Play recitation
              - switch [ref=e62] [cursor=pointer]:
                - generic [ref=e66]: play_arrow
            - switch "Auto-continue to next sura" [ref=e67] [cursor=pointer]:
              - generic [ref=e71]: Auto-continue to next sura
            - generic [ref=e76] [cursor=pointer]:
              - generic [ref=e77]: 1x
              - combobox "1x" [ref=e78]
            - generic [ref=e80]:
              - button "Mushaf mode" [ref=e81] [cursor=pointer]:
                - generic [ref=e82]:
                  - img [ref=e83]: auto_stories
                  - generic [ref=e84]: Mushaf mode
              - button "Reader mode" [ref=e85] [cursor=pointer]:
                - generic [ref=e86]:
                  - img [ref=e87]: menu_book
                  - generic [ref=e88]: Reader mode
              - button "Native mode" [pressed] [ref=e89] [cursor=pointer]:
                - generic [ref=e90]:
                  - img [ref=e91]: article
                  - generic [ref=e92]: Native mode
            - button "Quick" [ref=e93] [cursor=pointer]:
              - generic [ref=e94]:
                - img [ref=e95]: flash_on
                - generic [ref=e96]: Quick
            - button "Bookmarks" [ref=e97] [cursor=pointer]:
              - generic [ref=e98]:
                - img [ref=e99]: bookmark
                - generic [ref=e100]: Bookmarks
            - generic [ref=e101]:
              - generic [ref=e102]: cloud_off
              - generic [ref=e103]: Internet currently required
            - button "Offline Recitation" [ref=e104] [cursor=pointer]:
              - generic [ref=e105]:
                - img [ref=e106]: download
                - generic [ref=e107]: Offline Recitation
        - article [ref=e109]:
          - paragraph [ref=e110] [cursor=pointer]:
            - generic [ref=e111]: "1"
            - generic [ref=e112]:
              - button "Bookmark verse 1" [ref=e113]:
                - generic [ref=e114]: star_outline
              - button "Share verse 1:1" [ref=e115]:
                - generic [ref=e116]: share
            - generic [ref=e117]: بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
            - generic [ref=e118]: In the name of Allāh,1 the Entirely Merciful, the Especially Merciful.2
          - paragraph [ref=e119] [cursor=pointer]:
            - generic [ref=e120]: "2"
            - generic [ref=e121]:
              - button "Bookmark verse 2" [ref=e122]:
                - generic [ref=e123]: star_outline
              - button "Share verse 1:2" [ref=e124]:
                - generic [ref=e125]: share
            - generic [ref=e126]: ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَـٰلَمِينَ
            - generic [ref=e127]: "[All] praise is [due] to Allāh, Lord1 of the worlds -"
          - paragraph [ref=e128] [cursor=pointer]:
            - generic [ref=e129]: "3"
            - generic [ref=e130]:
              - button "Bookmark verse 3" [ref=e131]:
                - generic [ref=e132]: star_outline
              - button "Share verse 1:3" [ref=e133]:
                - generic [ref=e134]: share
            - generic [ref=e135]: ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
            - generic [ref=e136]: The Entirely Merciful, the Especially Merciful,
          - paragraph [ref=e137] [cursor=pointer]:
            - generic [ref=e138]: "4"
            - generic [ref=e139]:
              - button "Bookmark verse 4" [ref=e140]:
                - generic [ref=e141]: star_outline
              - button "Share verse 1:4" [ref=e142]:
                - generic [ref=e143]: share
            - generic [ref=e144]: مَـٰلِكِ يَوْمِ ٱلدِّينِ
            - generic [ref=e145]: Sovereign of the Day of Recompense.1
          - paragraph [ref=e146] [cursor=pointer]:
            - generic [ref=e147]: "5"
            - generic [ref=e148]:
              - button "Bookmark verse 5" [ref=e149]:
                - generic [ref=e150]: star_outline
              - button "Share verse 1:5" [ref=e151]:
                - generic [ref=e152]: share
            - generic [ref=e153]: إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ
            - generic [ref=e154]: It is You we worship and You we ask for help.
          - paragraph [ref=e155] [cursor=pointer]:
            - generic [ref=e156]: "6"
            - generic [ref=e157]:
              - button "Bookmark verse 6" [ref=e158]:
                - generic [ref=e159]: star_outline
              - button "Share verse 1:6" [ref=e160]:
                - generic [ref=e161]: share
            - generic [ref=e162]: ٱهْدِنَا ٱلصِّرَٰطَ ٱلْمُسْتَقِيمَ
            - generic [ref=e163]: Guide us to the straight path -
          - paragraph [ref=e164] [cursor=pointer]:
            - generic [ref=e165]: "7"
            - generic [ref=e166]:
              - button "Bookmark verse 7" [ref=e167]:
                - generic [ref=e168]: star_outline
              - button "Share verse 1:7" [ref=e169]:
                - generic [ref=e170]: share
            - generic [ref=e171]: صِرَٰطَ ٱلَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ ٱلْمَغْضُوبِ عَلَيْهِمْ وَلَا ٱلضَّآلِّينَ
            - generic [ref=e172]: The path of those upon whom You have bestowed favor, not of those who have earned [Your] anger or of those who are astray.
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test'
  2  | 
  3  | const layoutReadyTimeoutMs = 30000
  4  | const hoverActionCardTimeoutMs = 5000
  5  | const USTORE_NAMESPACE = 'peace2074'
  6  | 
  7  | const ayahActionCardLayouts = [
  8  |     {
  9  |         mode: 'reader',
  10 |         readySelector: '.reader-layout',
  11 |     },
  12 |     {
  13 |         mode: 'mushaf',
  14 |         readySelector: '.mushaf-layout',
  15 |     },
  16 |     {
  17 |         mode: 'native',
  18 |         readySelector: '.native-layout',
  19 |     },
  20 | ] as const
  21 | 
  22 | test.describe('Quran ayah action card', () => {
  23 |     test.slow()
  24 | 
  25 |     for (const layout of ayahActionCardLayouts) {
  26 |         test(`stays available on desktop hover in ${layout.mode} layout`, async ({ page }) => {
  27 |             await page.addInitScript(() => {
  28 |                 localStorage.setItem(`${USTORE_NAMESPACE}:quran-reader-mode`, 'audio')
  29 |             })
  30 | 
  31 |             await page.goto(`/quran/1/${layout.mode}`)
  32 |             await page.waitForURL(new RegExp(`/quran/1/${layout.mode}$`))
  33 | 
  34 |             const ayahTarget = page.getByTestId(`ayah-${layout.mode}-1`)
  35 |             await expect(page.locator(layout.readySelector)).toBeVisible({ timeout: layoutReadyTimeoutMs })
  36 |             await expect(ayahTarget).toBeVisible({ timeout: layoutReadyTimeoutMs })
  37 | 
  38 |             await ayahTarget.hover()
  39 | 
  40 |             const actionCard = page.getByTestId('ayah-action-card')
> 41 |             await expect(actionCard).toBeVisible({ timeout: hoverActionCardTimeoutMs })
     |                                      ^ Error: expect(locator).toBeVisible() failed
  42 |             await expect(actionCard).toHaveAttribute('data-verse', '1')
  43 |             await expect(actionCard).toHaveAttribute('data-recitation-source', 'audio')
  44 |             await expect(actionCard).toHaveAttribute('data-layout-mode', layout.mode)
  45 |         })
  46 |     }
  47 | })
```