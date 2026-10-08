# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: quran-recitation-highlight.spec.ts >> Quran recitation highlight iteration and settings >> toggling highlight mode on preferences page updates recitation highlight behavior
- Location: tests/quran-recitation-highlight.spec.ts:156:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('.verse-row.is-current-ayah')
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for locator('.verse-row.is-current-ayah')

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
                - generic [ref=e89]: cloud_off
                - generic [ref=e90]: Internet currently required
              - button "Offline Recitation" [ref=e91] [cursor=pointer]:
                - generic [ref=e92]:
                  - img [ref=e93]: download
                  - generic [ref=e94]: Offline Recitation
          - generic [ref=e96]:
            - generic [ref=e97] [cursor=pointer]:
              - generic [ref=e98]:
                - generic [ref=e99]:
                  - generic [ref=e100]: "1"
                  - button "Bookmark verse 1" [ref=e101]:
                    - generic [ref=e102]: star_outline
                  - button "Share verse 1:1" [ref=e103]:
                    - generic [ref=e104]: share
                - generic [ref=e105]: بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
              - generic [ref=e107]: In the name of Allāh,1 the Entirely Merciful, the Especially Merciful.2
            - generic [ref=e108] [cursor=pointer]:
              - generic [ref=e109]:
                - generic [ref=e110]:
                  - generic [ref=e111]: "2"
                  - button "Bookmark verse 2" [ref=e112]:
                    - generic [ref=e113]: star_outline
                  - button "Share verse 1:2" [ref=e114]:
                    - generic [ref=e115]: share
                - generic [ref=e116]: ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَـٰلَمِينَ
              - generic [ref=e118]: "[All] praise is [due] to Allāh, Lord1 of the worlds -"
            - generic [ref=e119] [cursor=pointer]:
              - generic [ref=e120]:
                - generic [ref=e121]:
                  - generic [ref=e122]: "3"
                  - button "Bookmark verse 3" [ref=e123]:
                    - generic [ref=e124]: star_outline
                  - button "Share verse 1:3" [ref=e125]:
                    - generic [ref=e126]: share
                - generic [ref=e127]: ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
              - generic [ref=e129]: The Entirely Merciful, the Especially Merciful,
            - generic [ref=e130] [cursor=pointer]:
              - generic [ref=e131]:
                - generic [ref=e132]:
                  - generic [ref=e133]: "4"
                  - button "Bookmark verse 4" [ref=e134]:
                    - generic [ref=e135]: star_outline
                  - button "Share verse 1:4" [ref=e136]:
                    - generic [ref=e137]: share
                - generic [ref=e138]: مَـٰلِكِ يَوْمِ ٱلدِّينِ
              - generic [ref=e140]: Sovereign of the Day of Recompense.1
            - generic [ref=e141] [cursor=pointer]:
              - generic [ref=e142]:
                - generic [ref=e143]:
                  - generic [ref=e144]: "5"
                  - button "Bookmark verse 5" [ref=e145]:
                    - generic [ref=e146]: star_outline
                  - button "Share verse 1:5" [ref=e147]:
                    - generic [ref=e148]: share
                - generic [ref=e149]: إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ
              - generic [ref=e151]: It is You we worship and You we ask for help.
            - generic [ref=e152] [cursor=pointer]:
              - generic [ref=e153]:
                - generic [ref=e154]:
                  - generic [ref=e155]: "6"
                  - button "Bookmark verse 6" [ref=e156]:
                    - generic [ref=e157]: star_outline
                  - button "Share verse 1:6" [ref=e158]:
                    - generic [ref=e159]: share
                - generic [ref=e160]: ٱهْدِنَا ٱلصِّرَٰطَ ٱلْمُسْتَقِيمَ
              - generic [ref=e162]: Guide us to the straight path -
            - generic [ref=e163] [cursor=pointer]:
              - generic [ref=e164]:
                - generic [ref=e165]:
                  - generic [ref=e166]: "7"
                  - button "Bookmark verse 7" [ref=e167]:
                    - generic [ref=e168]: star_outline
                  - button "Share verse 1:7" [ref=e169]:
                    - generic [ref=e170]: share
                - generic [ref=e171]: صِرَٰطَ ٱلَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ ٱلْمَغْضُوبِ عَلَيْهِمْ وَلَا ٱلضَّآلِّينَ
              - generic [ref=e173]: The path of those upon whom You have bestowed favor, not of those who have earned [Your] anger or of those who are astray.
  - generic: God bless my mom
```

# Test source

```ts
  77  |       if (
  78  |         currentWordId &&
  79  |         (observedWords.length === 0 ||
  80  |           observedWords[observedWords.length - 1] !== currentWordId)
  81  |       ) {
  82  |         observedWords.push(currentWordId)
  83  |       }
  84  |       if (observedWords.length >= 4) {
  85  |         break
  86  |       }
  87  |       await page.waitForTimeout(100)
  88  |     }
  89  | 
  90  |     // Must have iterated through multiple words of Ayah 1
  91  |     expect(observedWords.length).toBeGreaterThanOrEqual(2)
  92  |     expect(observedWords[0]).toBe('word-1-0')
  93  |     expect(observedWords).toContain('word-1-1')
  94  |   })
  95  | 
  96  |   test('sentence highlight mode highlights the whole ayah without highlighting individual words', async ({
  97  |     page,
  98  |   }) => {
  99  |     await page.goto('/quran/1/reader?highlight=ayah')
  100 |     await acceptConsent(page)
  101 |     await page.waitForSelector('.arabic-text', { timeout: 15000 })
  102 | 
  103 |     await startRecitation(page)
  104 | 
  105 |     // Wait for playback to begin and highlight active ayah
  106 |     await expect(page.locator('.verse-row.is-current-ayah')).toBeVisible({
  107 |       timeout: 10000,
  108 |     })
  109 | 
  110 |     // Individual words should NOT have .is-current-word in sentence mode
  111 |     const currentWordCount = await page.locator('.is-current-word').count()
  112 |     expect(currentWordCount).toBe(0)
  113 |   })
  114 | 
  115 |   test('word highlight mode works in mushaf and native layout modes', async ({
  116 |     page,
  117 |   }) => {
  118 |     // Test mushaf layout
  119 |     await page.goto('/quran/1/mushaf?highlight=word')
  120 |     await acceptConsent(page)
  121 |     await page.waitForSelector('.mushaf-page', { timeout: 15000 })
  122 | 
  123 |     await startRecitation(page)
  124 | 
  125 |     await expect(
  126 |       page.locator('.mushaf-layout .is-current-word').first()
  127 |     ).toBeVisible({ timeout: 10000 })
  128 | 
  129 |     const mushafWordId = await page
  130 |       .locator('.mushaf-layout .is-current-word')
  131 |       .first()
  132 |       .getAttribute('id')
  133 |     expect(mushafWordId).toMatch(/^word-mushaf-1-/)
  134 | 
  135 |     await stopRecitation(page)
  136 |     await page.waitForTimeout(500)
  137 | 
  138 |     // Test native layout
  139 |     await page.goto('/quran/1/native?highlight=word')
  140 |     await acceptConsent(page)
  141 |     await page.waitForSelector('.native-layout', { timeout: 15000 })
  142 | 
  143 |     await startRecitation(page)
  144 | 
  145 |     await expect(
  146 |       page.locator('.native-layout .is-current-word').first()
  147 |     ).toBeVisible({ timeout: 10000 })
  148 | 
  149 |     const nativeWordId = await page
  150 |       .locator('.native-layout .is-current-word')
  151 |       .first()
  152 |       .getAttribute('id')
  153 |     expect(nativeWordId).toMatch(/^word-native-1-/)
  154 |   })
  155 | 
  156 |   test('toggling highlight mode on preferences page updates recitation highlight behavior', async ({
  157 |     page,
  158 |   }) => {
  159 |     // 1. Go to preferences and select Sentence (ayah) mode
  160 |     await page.goto('/preferences')
  161 |     await acceptConsent(page)
  162 | 
  163 |     const sentenceBtn = page.getByRole('button', { name: /^sentence$/i })
  164 |     await sentenceBtn.click()
  165 |     await expect(sentenceBtn).toHaveAttribute('aria-pressed', 'true')
  166 |     await page.waitForFunction(
  167 |       () => localStorage.getItem('quran-highlight-mode') === 'ayah'
  168 |     )
  169 | 
  170 |     // 2. Go to reader and verify whole ayah is highlighted
  171 |     await page.goto('/quran/1/reader')
  172 |     await acceptConsent(page)
  173 |     await page.waitForSelector('.arabic-text', { timeout: 15000 })
  174 | 
  175 |     await startRecitation(page)
  176 | 
> 177 |     await expect(page.locator('.verse-row.is-current-ayah')).toBeVisible({
      |                                                              ^ Error: expect(locator).toBeVisible() failed
  178 |       timeout: 10000,
  179 |     })
  180 |     expect(await page.locator('.is-current-word').count()).toBe(0)
  181 | 
  182 |     await stopRecitation(page)
  183 |     await page.waitForTimeout(500)
  184 | 
  185 |     // 3. Switch back to Word mode on preferences
  186 |     await page.goto('/preferences')
  187 |     await acceptConsent(page)
  188 |     const wordBtn = page.getByRole('button', { name: /^word$/i })
  189 |     await wordBtn.click()
  190 |     await expect(wordBtn).toHaveAttribute('aria-pressed', 'true')
  191 |     await page.waitForFunction(
  192 |       () => localStorage.getItem('quran-highlight-mode') === 'word'
  193 |     )
  194 | 
  195 |     // 4. Go to reader and verify words are highlighted
  196 |     await page.goto('/quran/1/reader')
  197 |     await acceptConsent(page)
  198 |     await page.waitForSelector('.arabic-text', { timeout: 15000 })
  199 | 
  200 |     await startRecitation(page)
  201 | 
  202 |     await expect(page.locator('.is-current-word').first()).toBeVisible({
  203 |       timeout: 10000,
  204 |     })
  205 |     const wordId = await page
  206 |       .locator('.is-current-word')
  207 |       .first()
  208 |       .getAttribute('id')
  209 |     expect(wordId).toMatch(/^word-1-/)
  210 |   })
  211 | })
  212 | 
```