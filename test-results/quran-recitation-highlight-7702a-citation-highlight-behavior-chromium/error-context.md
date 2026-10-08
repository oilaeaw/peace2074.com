# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: quran-recitation-highlight.spec.ts >> Quran recitation highlight iteration and settings >> toggling highlight mode on preferences page updates recitation highlight behavior
- Location: tests/quran-recitation-highlight.spec.ts:150:3

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
  115 |     await page.waitForSelector('.mushaf-page', { timeout: 15000 })
  116 | 
  117 |     await startRecitation(page)
  118 | 
  119 |     await expect(
  120 |       page.locator('.mushaf-layout .is-current-word').first()
  121 |     ).toBeVisible({ timeout: 10000 })
  122 | 
  123 |     const mushafWordId = await page
  124 |       .locator('.mushaf-layout .is-current-word')
  125 |       .first()
  126 |       .getAttribute('id')
  127 |     expect(mushafWordId).toMatch(/^word-mushaf-1-/)
  128 | 
  129 |     await stopRecitation(page)
  130 |     await page.waitForTimeout(500)
  131 | 
  132 |     // Test native layout
  133 |     await page.goto('/quran/1/native?highlight=word')
  134 |     await acceptConsent(page)
  135 |     await page.waitForSelector('.native-layout', { timeout: 15000 })
  136 | 
  137 |     await startRecitation(page)
  138 | 
  139 |     await expect(
  140 |       page.locator('.native-layout .is-current-word').first()
  141 |     ).toBeVisible({ timeout: 10000 })
  142 | 
  143 |     const nativeWordId = await page
  144 |       .locator('.native-layout .is-current-word')
  145 |       .first()
  146 |       .getAttribute('id')
  147 |     expect(nativeWordId).toMatch(/^word-native-1-/)
  148 |   })
  149 | 
  150 |   test('toggling highlight mode on preferences page updates recitation highlight behavior', async ({
  151 |     page,
  152 |   }) => {
  153 |     // 1. Go to preferences and select Sentence (ayah) mode
  154 |     await page.goto('/preferences')
  155 |     await acceptConsent(page)
  156 | 
  157 |     const sentenceBtn = page.getByRole('button', { name: /^sentence$/i })
  158 |     await sentenceBtn.click()
  159 |     await expect(sentenceBtn).toHaveAttribute('aria-pressed', 'true')
  160 | 
  161 |     // 2. Go to reader and verify whole ayah is highlighted
  162 |     await page.goto('/quran/1/reader')
  163 |     await acceptConsent(page)
  164 |     await page.waitForSelector('.arabic-text', { timeout: 15000 })
  165 | 
  166 |     await startRecitation(page)
  167 | 
> 168 |     await expect(page.locator('.verse-row.is-current-ayah')).toBeVisible({
      |                                                              ^ Error: expect(locator).toBeVisible() failed
  169 |       timeout: 10000,
  170 |     })
  171 |     expect(await page.locator('.is-current-word').count()).toBe(0)
  172 | 
  173 |     await stopRecitation(page)
  174 |     await page.waitForTimeout(500)
  175 | 
  176 |     // 3. Switch back to Word mode on preferences
  177 |     await page.goto('/preferences')
  178 |     await acceptConsent(page)
  179 |     const wordBtn = page.getByRole('button', { name: /^word$/i })
  180 |     await wordBtn.click()
  181 |     await expect(wordBtn).toHaveAttribute('aria-pressed', 'true')
  182 | 
  183 |     // 4. Go to reader and verify words are highlighted
  184 |     await page.goto('/quran/1/reader')
  185 |     await acceptConsent(page)
  186 |     await page.waitForSelector('.arabic-text', { timeout: 15000 })
  187 | 
  188 |     await startRecitation(page)
  189 | 
  190 |     await expect(page.locator('.is-current-word').first()).toBeVisible({
  191 |       timeout: 10000,
  192 |     })
  193 |     const wordId = await page
  194 |       .locator('.is-current-word')
  195 |       .first()
  196 |       .getAttribute('id')
  197 |     expect(wordId).toMatch(/^word-1-/)
  198 |   })
  199 | })
  200 | 
```