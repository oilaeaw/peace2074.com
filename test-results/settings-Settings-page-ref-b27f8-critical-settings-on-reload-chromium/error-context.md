# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: settings.spec.ts >> Settings page >> refresh app button preserves critical settings on reload
- Location: tests/settings.spec.ts:159:5

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: "true"
Received: null
```

# Page snapshot

```yaml
- generic [ref=e3]:
  - status [ref=e4]:
    - generic [ref=e5]:
      - img "PEACE2074" [ref=e6]
      - generic [ref=e7]: PEACE2074
  - generic [ref=e9]:
    - banner [ref=e10]:
      - toolbar [ref=e11]:
        - button "Toggle menu" [ref=e12] [cursor=pointer]:
          - img [ref=e14]: menu
        - img "PEACE2074" [ref=e17]
        - link "Peace2074" [ref=e19] [cursor=pointer]:
          - /url: /
        - button "Search…" [ref=e20] [cursor=pointer]:
          - img [ref=e22]: search
        - button "Play Athan" [ref=e23] [cursor=pointer]:
          - img [ref=e25]: volume_up
        - button "Profile" [ref=e26] [cursor=pointer]:
          - img [ref=e28]: account_circle
    - main [ref=e30]:
      - generic [ref=e31]:
        - generic [ref=e32]:
          - heading "Settings" [level=1] [ref=e33]
          - generic [ref=e34]: Control how the app looks and behaves.
        - generic [ref=e35]:
          - generic [ref=e37]:
            - generic [ref=e38]: Display
            - generic [ref=e39]: Tune layout density and motion preferences.
            - generic [ref=e40]:
              - generic [ref=e41]:
                - generic [ref=e42]: Compact layout
                - generic [ref=e43]: Use tighter spacing for dense screens.
              - switch "Compact layout" [ref=e44] [cursor=pointer]
            - separator [ref=e48]
            - generic [ref=e49]:
              - generic [ref=e50]:
                - generic [ref=e51]: Reduce motion
                - generic [ref=e52]: Soften animations for calmer interaction.
              - switch "Reduce motion" [ref=e53] [cursor=pointer]
            - separator [ref=e57]
            - generic [ref=e58]:
              - generic [ref=e59]:
                - generic [ref=e60]: Dark mode
                - generic [ref=e61]: Switch between light and dark theme.
              - switch "Dark mode" [checked] [ref=e62] [cursor=pointer]
            - separator [ref=e66]
            - generic [ref=e67]:
              - generic [ref=e68]:
                - generic [ref=e69]: Show Quran translation
                - generic [ref=e70]: Always display translation after Arabic text for transparency.
              - switch "Show Quran translation" [checked] [ref=e71] [cursor=pointer]
            - generic [ref=e76]:
              - generic [ref=e77]: Quran translator
              - generic [ref=e78]: Choose your preferred translation scholar for the current language.
              - generic [ref=e81] [cursor=pointer]:
                - generic "Quran translator" [ref=e83]:
                  - generic [ref=e84]: Saheeh International
                  - combobox "Quran translator" [ref=e85]: Saheeh International
                - generic [ref=e87]: arrow_drop_down
            - separator [ref=e88]
            - generic [ref=e90]:
              - generic [ref=e91]: Recitation highlight
              - generic [ref=e92]: Reading choices apply across Quran pages on this device.
              - generic [ref=e93]:
                - button "Word" [pressed] [ref=e94] [cursor=pointer]:
                  - generic [ref=e96]: Word
                - button "Sentence" [ref=e97] [cursor=pointer]:
                  - generic [ref=e99]: Sentence
            - separator [ref=e100]
            - generic [ref=e101]:
              - generic [ref=e102]:
                - generic [ref=e103]:
                  - text: 💎 Cursor Trail Diamonds
                  - status [ref=e104]: "40"
                - generic [ref=e105]: Number of floating diamonds following your cursor (0 = disabled)
              - slider [ref=e106]:
                - generic [ref=e112]:
                  - img [ref=e113]
                  - generic:
                    - generic:
                      - generic: "40"
          - generic [ref=e117]:
            - generic [ref=e118]: Accessibility
            - generic [ref=e119]: Adjust text size and contrast for easier reading.
            - generic [ref=e121]:
              - generic [ref=e122]: Text size
              - generic [ref=e123]: Makes all text larger or smaller.
            - slider [ref=e124]:
              - generic [ref=e130]:
                - img [ref=e131]
                - generic:
                  - generic:
                    - generic: Large
            - separator [ref=e134]
            - generic [ref=e135]:
              - generic [ref=e136]:
                - generic [ref=e137]: High contrast
                - generic [ref=e138]: Increase contrast for better visibility.
              - switch "High contrast" [checked] [ref=e139] [cursor=pointer]
          - generic [ref=e144]:
            - generic [ref=e145]: Navigation
            - generic [ref=e146]: Control drawer ordering and visibility.
            - generic [ref=e147]:
              - generic [ref=e148]:
                - generic [ref=e149]: Enable drag ordering
                - generic [ref=e150]: Allow reordering and pinning items in the drawer.
              - switch "Enable drag ordering" [checked] [ref=e151] [cursor=pointer]
            - separator [ref=e155]
            - generic [ref=e156]:
              - generic [ref=e157]:
                - generic [ref=e158]: Open drawer on start
                - generic [ref=e159]: Enable to start with the drawer open; disable to keep it hidden until toggled.
              - switch "Open drawer on start" [ref=e160] [cursor=pointer]
          - generic [ref=e165]:
            - generic [ref=e166]: Notifications
            - generic [ref=e167]: Stay informed when new content arrives.
            - generic [ref=e168]:
              - generic [ref=e169]:
                - generic [ref=e170]: Enable notifications
                - generic [ref=e171]: We’ll ask permission before sending anything.
              - switch "Enable notifications" [ref=e172] [cursor=pointer]
            - alert [ref=e176]:
              - generic [ref=e177]: We’ll ask permission before sending anything.
          - generic [ref=e179]:
            - generic [ref=e180]: Audio
            - generic [ref=e181]: Control athan and playback defaults.
            - generic [ref=e182]:
              - generic [ref=e183]:
                - generic [ref=e184]: Autoplay athan
                - generic [ref=e185]: Start athan playback automatically when available.
              - switch "Autoplay athan" [ref=e186] [cursor=pointer]
            - separator [ref=e190]
            - generic [ref=e191]:
              - generic [ref=e192]:
                - generic [ref=e193]: Adhan at Prayer Times
                - generic [ref=e194]: Automatically play the Adhan when a prayer time starts.
              - switch "Adhan at Prayer Times" [ref=e195] [cursor=pointer]
            - separator [ref=e199]
            - generic [ref=e200]:
              - generic [ref=e201]: Athan Reciter
              - generic [ref=e202]: Choose your preferred Athan voice. Click ▶ to preview.
              - generic [ref=e203]:
                - generic [ref=e206] [cursor=pointer]:
                  - generic [ref=e207]:
                    - generic: Reciter
                    - generic "Select Athan reciter" [ref=e208]:
                      - generic [ref=e209]: Mishary Alafasy
                      - combobox "Reciter" [ref=e210]: Mishary Alafasy
                  - generic [ref=e212]: arrow_drop_down
                - button "Preview athan" [ref=e213] [cursor=pointer]:
                  - img [ref=e215]: play_arrow
              - generic [ref=e216]: مشاري العفاسي
            - separator [ref=e217]
            - generic [ref=e218]:
              - generic [ref=e219]:
                - generic [ref=e220]: Offline Recitation
                - generic [ref=e221]: Download Quran recitations for offline listening
              - button "Offline Recitation" [ref=e222] [cursor=pointer]:
                - generic [ref=e223]:
                  - img [ref=e224]: download
                  - generic [ref=e225]: Offline Recitation
          - generic [ref=e227]:
            - generic [ref=e228]: Refresh app
            - generic [ref=e229]: Force an update and reload to get the latest version.
            - button "Reload" [ref=e230] [cursor=pointer]:
              - generic [ref=e232]: Reload
    - alert [ref=e233]:
      - generic [ref=e235]:
        - generic [ref=e236]: We use cookies to improve your experience and analyze site usage.
        - generic [ref=e237]: By clicking 'Accept', you consent to our use of cookies for analytics.
      - generic [ref=e238]:
        - button "Accept" [ref=e239] [cursor=pointer]:
          - generic [ref=e241]: Accept
        - button "Decline" [ref=e242] [cursor=pointer]:
          - generic [ref=e244]: Decline
    - contentinfo [ref=e245]:
      - generic [ref=e246]:
        - generic [ref=e247]:
          - img "decor" [ref=e248]
          - generic [ref=e249]: © 2026 Peace2074 · v3.4.0
        - navigation "Footer links" [ref=e250]:
          - link "About" [ref=e251] [cursor=pointer]:
            - /url: /about
          - link "Quran" [ref=e252] [cursor=pointer]:
            - /url: /quran
          - link "Terms and Conditions" [ref=e253] [cursor=pointer]:
            - /url: /terms
          - link "Privacy Policy" [ref=e254] [cursor=pointer]:
            - /url: /privacy
          - link "Contact" [ref=e255] [cursor=pointer]:
            - /url: /contact
          - link "Credits" [ref=e256] [cursor=pointer]:
            - /url: /credits
```

# Test source

```ts
  82  |     })
  83  | 
  84  |     test('show Quran translation toggle persists to localStorage', async ({ page }) => {
  85  |         const toggle = page.getByRole('switch', { name: /show quran translation/i })
  86  |         // Default is true; click to turn off
  87  |         await toggle.click()
  88  |         const val = await page.evaluate((k) => window.localStorage.getItem(k), KEYS.translation)
  89  |         expect(val).toBe('false')
  90  |     })
  91  | 
  92  |     // ── Accessibility ─────────────────────────────────────────────────────────
  93  | 
  94  |     test('font size slider applies CSS class to <html> and persists', async ({ page }) => {
  95  |         // Default font-size pref is 1 (Medium) → html should have font-medium
  96  |         const htmlClass = await page.evaluate(() => document.documentElement.className)
  97  |         expect(htmlClass).toContain('font-medium')
  98  | 
  99  |         // Move slider to max (3 = Extra Large) by clicking at the right edge of the track
  100 |         // Note: The font size slider is the second slider on the page (after cursor trail)
  101 |         const slider = page.locator('.q-slider').nth(1)
  102 |         await expect(slider).toBeVisible()
  103 |         const box = await slider.boundingBox()
  104 |         if (!box) throw new Error('Slider not found')
  105 |         // Click at the far right of the slider track to set value to max (3)
  106 |         await page.mouse.click(box.x + box.width - 2, box.y + box.height / 2)
  107 | 
  108 |         await expect(page.locator('html')).toHaveClass(/font-xlarge/)
  109 |         const val = await page.evaluate((k) => window.localStorage.getItem(k), KEYS.fontSize)
  110 |         expect(val).toBe('3')
  111 |     })
  112 | 
  113 |     test('high contrast toggle applies high-contrast class to <html> and persists', async ({ page }) => {
  114 |         const toggle = page.getByRole('switch', { name: /high contrast/i })
  115 |         await toggle.click()
  116 |         await expect(page.locator('html')).toHaveClass(/high-contrast/)
  117 |         const val = await page.evaluate((k) => window.localStorage.getItem(k), KEYS.highContrast)
  118 |         expect(val).toBe('true')
  119 |         await toggle.click()
  120 |         await expect(page.locator('html')).not.toHaveClass(/high-contrast/)
  121 |     })
  122 | 
  123 |     // ── Navigation ────────────────────────────────────────────────────────────
  124 | 
  125 |     test('nav ordering toggle persists to localStorage', async ({ page }) => {
  126 |         const toggle = page.getByRole('switch', { name: /enable drag ordering/i })
  127 |         // Default is true; click to disable
  128 |         await toggle.click()
  129 |         const val = await page.evaluate((k) => window.localStorage.getItem(k), KEYS.navOrdering)
  130 |         expect(val).toBe('false')
  131 |     })
  132 | 
  133 |     test('drawer open by default toggle persists to localStorage', async ({ page }) => {
  134 |         const toggle = page.getByRole('switch', { name: /open drawer on start/i })
  135 |         await toggle.click()
  136 |         const val = await page.evaluate((k) => window.localStorage.getItem(k), KEYS.drawerDefault)
  137 |         expect(val).toBe('true')
  138 |     })
  139 | 
  140 |     // ── Audio ─────────────────────────────────────────────────────────────────
  141 | 
  142 |     test('autoplay athan toggle persists to localStorage', async ({ page }) => {
  143 |         const toggle = page.getByRole('switch', { name: /autoplay athan/i })
  144 |         await toggle.click()
  145 |         const val = await page.evaluate((k) => window.localStorage.getItem(k), KEYS.autoplayAthan)
  146 |         expect(val).toBe('true')
  147 |     })
  148 | 
  149 |     test('adhan at prayer times toggle persists to localStorage', async ({ page }) => {
  150 |         const toggle = page.getByRole('switch', { name: /adhan at prayer times/i })
  151 |         // Default is true; click to disable
  152 |         await toggle.click()
  153 |         const val = await page.evaluate((k) => window.localStorage.getItem(k), KEYS.autoplayPrayer)
  154 |         expect(val).toBe('false')
  155 |     })
  156 | 
  157 |     // ── Refresh ────────────────────────────────────────────────────────────────
  158 | 
  159 |     test('refresh app button preserves critical settings on reload', async ({ page }) => {
  160 |         // Set some critical settings first
  161 |         await page.evaluate(() => {
  162 |             window.localStorage.setItem('pref-font-size', '2')
  163 |             window.localStorage.setItem('pref-high-contrast', 'true')
  164 |             window.localStorage.setItem('pref-dark-mode', 'true')
  165 |             window.localStorage.setItem('pref-autoplay-prayer-times', 'false')
  166 |         })
  167 | 
  168 |         const reloadBtn = page.getByRole('button', { name: /reload/i })
  169 |         await Promise.all([
  170 |             page.waitForEvent('load'),
  171 |             reloadBtn.click(),
  172 |         ])
  173 |         const fontSize = await page.evaluate(() => window.localStorage.getItem('pref-font-size'))
  174 |         const highContrast = await page.evaluate(() => window.localStorage.getItem('pref-high-contrast'))
  175 |         const darkMode = await page.evaluate(() => window.localStorage.getItem('pref-dark-mode'))
  176 |         const prayerAutoplay = await page.evaluate(() =>
  177 |             window.localStorage.getItem('pref-autoplay-prayer-times'),
  178 |         )
  179 | 
  180 |         expect(fontSize).toBe('2')
  181 |         expect(highContrast).toBe('true')
> 182 |         expect(darkMode).toBe('true')
      |                          ^ Error: expect(received).toBe(expected) // Object.is equality
  183 |         expect(prayerAutoplay).toBe('false')
  184 |     })
  185 | })
  186 | 
  187 | // The recitation highlight toggle lives on /preferences (not /settings)
  188 | test.describe('Preferences page — recitation highlight', () => {
  189 |     test.beforeEach(async ({ page }) => {
  190 |         await page.goto('/preferences')
  191 |         await page
  192 |             .getByRole('button', { name: /^accept$/i })
  193 |             .click({ timeout: 3000 })
  194 |             .catch(() => { })
  195 |     })
  196 | 
  197 |     test('Word is selected by default', async ({ page }) => {
  198 |         const wordBtn = page.getByRole('button', { name: /^word$/i })
  199 |         const sentenceBtn = page.getByRole('button', { name: /^sentence$/i })
  200 | 
  201 |         await expect(wordBtn).toBeVisible()
  202 |         await expect(sentenceBtn).toBeVisible()
  203 | 
  204 |         // Quasar q-btn-toggle marks the active option with aria-pressed="true"
  205 |         await expect(wordBtn).toHaveAttribute('aria-pressed', 'true')
  206 |         await expect(sentenceBtn).toHaveAttribute('aria-pressed', 'false')
  207 |     })
  208 | 
  209 |     test('clicking Sentence selects it and deselects Word', async ({ page }) => {
  210 |         const wordBtn = page.getByRole('button', { name: /^word$/i })
  211 |         const sentenceBtn = page.getByRole('button', { name: /^sentence$/i })
  212 | 
  213 |         await sentenceBtn.click()
  214 | 
  215 |         await expect(sentenceBtn).toHaveAttribute('aria-pressed', 'true')
  216 |         await expect(wordBtn).toHaveAttribute('aria-pressed', 'false')
  217 |     })
  218 | 
  219 |     test('clicking Word after Sentence reverts the selection', async ({ page }) => {
  220 |         const wordBtn = page.getByRole('button', { name: /^word$/i })
  221 |         const sentenceBtn = page.getByRole('button', { name: /^sentence$/i })
  222 | 
  223 |         await sentenceBtn.click()
  224 |         await wordBtn.click()
  225 | 
  226 |         await expect(wordBtn).toHaveAttribute('aria-pressed', 'true')
  227 |         await expect(sentenceBtn).toHaveAttribute('aria-pressed', 'false')
  228 |     })
  229 | })
  230 | 
```