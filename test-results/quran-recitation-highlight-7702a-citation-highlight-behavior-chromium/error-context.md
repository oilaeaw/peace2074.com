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
          - generic [ref=e14]: auto_awesome
          - generic [ref=e17]: A new feature is now available! Enable 'Auto-continue' to automatically progress through all 114 suras during recitation.
          - generic [ref=e18]:
            - button "close" [ref=e19] [cursor=pointer]:
              - generic [ref=e21]: close
            - button "Dismiss announcement" [ref=e22] [cursor=pointer]:
              - img [ref=e24]: close
        - alert [ref=e25]:
          - generic [ref=e27]: stop
          - generic [ref=e29]:
            - generic [ref=e30]: Play recitation
            - generic [ref=e31]: sura number 1 • verses 1 / 7 • Audio
          - generic [ref=e33]:
            - generic [ref=e34]: Play recitation
            - switch [ref=e35] [cursor=pointer]:
              - generic [ref=e39]: play_arrow
        - generic [ref=e40]:
          - generic [ref=e41]:
            - generic [ref=e42]:
              - generic [ref=e43]: The Opener — الفاتحة
              - generic [ref=e44]: "sura number: 1 • meccan • 7"
            - generic [ref=e45]:
              - button "Shazam Audio Sync" [ref=e46] [cursor=pointer]:
                - generic [ref=e47]:
                  - img [ref=e48]: graphic_eq
                  - generic [ref=e49]: Shazam Audio Sync
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
                - button "Reader mode" [pressed] [ref=e85] [cursor=pointer]:
                  - generic [ref=e86]:
                    - img [ref=e87]: menu_book
                    - generic [ref=e88]: Reader mode
                - button "Native mode" [ref=e89] [cursor=pointer]:
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
          - generic [ref=e109]:
            - generic [ref=e110] [cursor=pointer]:
              - generic [ref=e111]:
                - generic [ref=e112]:
                  - generic [ref=e113]: "1"
                  - button "Bookmark verse 1" [ref=e114]:
                    - generic [ref=e115]: star_outline
                  - button "Share verse 1:1" [ref=e116]:
                    - generic [ref=e117]: share
                - generic [ref=e118]: بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
              - generic [ref=e120]: In the name of Allāh,1 the Entirely Merciful, the Especially Merciful.2
            - generic [ref=e121] [cursor=pointer]:
              - generic [ref=e122]:
                - generic [ref=e123]:
                  - generic [ref=e124]: "2"
                  - button "Bookmark verse 2" [ref=e125]:
                    - generic [ref=e126]: star_outline
                  - button "Share verse 1:2" [ref=e127]:
                    - generic [ref=e128]: share
                - generic [ref=e129]: ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَـٰلَمِينَ
              - generic [ref=e131]: "[All] praise is [due] to Allāh, Lord1 of the worlds -"
            - generic [ref=e132] [cursor=pointer]:
              - generic [ref=e133]:
                - generic [ref=e134]:
                  - generic [ref=e135]: "3"
                  - button "Bookmark verse 3" [ref=e136]:
                    - generic [ref=e137]: star_outline
                  - button "Share verse 1:3" [ref=e138]:
                    - generic [ref=e139]: share
                - generic [ref=e140]: ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
              - generic [ref=e142]: The Entirely Merciful, the Especially Merciful,
            - generic [ref=e143] [cursor=pointer]:
              - generic [ref=e144]:
                - generic [ref=e145]:
                  - generic [ref=e146]: "4"
                  - button "Bookmark verse 4" [ref=e147]:
                    - generic [ref=e148]: star_outline
                  - button "Share verse 1:4" [ref=e149]:
                    - generic [ref=e150]: share
                - generic [ref=e151]: مَـٰلِكِ يَوْمِ ٱلدِّينِ
              - generic [ref=e153]: Sovereign of the Day of Recompense.1
            - generic [ref=e154] [cursor=pointer]:
              - generic [ref=e155]:
                - generic [ref=e156]:
                  - generic [ref=e157]: "5"
                  - button "Bookmark verse 5" [ref=e158]:
                    - generic [ref=e159]: star_outline
                  - button "Share verse 1:5" [ref=e160]:
                    - generic [ref=e161]: share
                - generic [ref=e162]: إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ
              - generic [ref=e164]: It is You we worship and You we ask for help.
            - generic [ref=e165] [cursor=pointer]:
              - generic [ref=e166]:
                - generic [ref=e167]:
                  - generic [ref=e168]: "6"
                  - button "Bookmark verse 6" [ref=e169]:
                    - generic [ref=e170]: star_outline
                  - button "Share verse 1:6" [ref=e171]:
                    - generic [ref=e172]: share
                - generic [ref=e173]: ٱهْدِنَا ٱلصِّرَٰطَ ٱلْمُسْتَقِيمَ
              - generic [ref=e175]: Guide us to the straight path -
            - generic [ref=e176] [cursor=pointer]:
              - generic [ref=e177]:
                - generic [ref=e178]:
                  - generic [ref=e179]: "7"
                  - button "Bookmark verse 7" [ref=e180]:
                    - generic [ref=e181]: star_outline
                  - button "Share verse 1:7" [ref=e182]:
                    - generic [ref=e183]: share
                - generic [ref=e184]: صِرَٰطَ ٱلَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ ٱلْمَغْضُوبِ عَلَيْهِمْ وَلَا ٱلضَّآلِّينَ
              - generic [ref=e186]: The path of those upon whom You have bestowed favor, not of those who have earned [Your] anger or of those who are astray.
  - generic: God bless my mom
```

# Test source

```ts
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
  170 |     const lsBeforeGoto = await page.evaluate(() => localStorage.getItem('quran-highlight-mode'))
  171 |     console.log('LS BEFORE GOTO:', lsBeforeGoto)
  172 | 
  173 |     // 2. Go to reader and verify whole ayah is highlighted
  174 |     await page.goto('/quran/1/reader')
  175 |     const lsAfterGoto = await page.evaluate(() => localStorage.getItem('quran-highlight-mode'))
  176 |     console.log('LS AFTER GOTO:', lsAfterGoto)
  177 | 
  178 |     await acceptConsent(page)
  179 |     await page.waitForSelector('.arabic-text', { timeout: 15000 })
  180 |     const lsAfterReady = await page.evaluate(() => localStorage.getItem('quran-highlight-mode'))
  181 |     console.log('LS AFTER READY:', lsAfterReady)
  182 | 
  183 |     await startRecitation(page)
  184 | 
  185 |     const debugState = await page.evaluate(() => {
  186 |       const activeAyahs = Array.from(document.querySelectorAll('.is-current-ayah')).map(el => el.id)
  187 |       const activeWords = Array.from(document.querySelectorAll('.is-current-word')).map(el => el.id)
  188 |       const verseRows = Array.from(document.querySelectorAll('.verse-row')).map(el => ({ id: el.id, class: el.className }))
  189 |       return {
  190 |         activeAyahs,
  191 |         activeWords,
  192 |         firstVerse: verseRows[0],
  193 |         localStorageHighlight: localStorage.getItem('quran-highlight-mode'),
  194 |       }
  195 |     })
  196 |     console.log('DEBUG REC STATE:', JSON.stringify(debugState))
  197 | 
> 198 |     await expect(page.locator('.verse-row.is-current-ayah')).toBeVisible({
      |                                                              ^ Error: expect(locator).toBeVisible() failed
  199 |       timeout: 10000,
  200 |     })
  201 |     expect(await page.locator('.is-current-word').count()).toBe(0)
  202 | 
  203 |     await stopRecitation(page)
  204 |     await page.waitForTimeout(500)
  205 | 
  206 |     // 3. Switch back to Word mode on preferences
  207 |     await page.goto('/preferences')
  208 |     await acceptConsent(page)
  209 |     const wordBtn = page.getByRole('button', { name: /^word$/i })
  210 |     await wordBtn.click()
  211 |     await expect(wordBtn).toHaveAttribute('aria-pressed', 'true')
  212 |     await page.waitForFunction(
  213 |       () => localStorage.getItem('quran-highlight-mode') === 'word'
  214 |     )
  215 | 
  216 |     // 4. Go to reader and verify words are highlighted
  217 |     await page.goto('/quran/1/reader')
  218 |     await acceptConsent(page)
  219 |     await page.waitForSelector('.arabic-text', { timeout: 15000 })
  220 | 
  221 |     await startRecitation(page)
  222 | 
  223 |     await expect(page.locator('.is-current-word').first()).toBeVisible({
  224 |       timeout: 10000,
  225 |     })
  226 |     const wordId = await page
  227 |       .locator('.is-current-word')
  228 |       .first()
  229 |       .getAttribute('id')
  230 |     expect(wordId).toMatch(/^word-1-/)
  231 |   })
  232 | })
  233 | 
```