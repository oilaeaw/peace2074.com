# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: settings.spec.ts >> Settings page >> autoplay athan toggle persists to localStorage
- Location: tests/settings.spec.ts:139:5

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: "true"
Received: null
```

# Page snapshot

```yaml
- generic [ref=e3]:
  - generic [ref=e4]:
    - banner [ref=e5]:
      - toolbar [ref=e6]:
        - button "Toggle menu" [ref=e7] [cursor=pointer]:
          - img [ref=e9]: menu
        - img "PEACE2074" [ref=e12]
        - link "Peace2074" [ref=e14] [cursor=pointer]:
          - /url: /
        - button "Search…" [ref=e15] [cursor=pointer]:
          - img [ref=e17]: search
        - button "appShell.pauseAthan" [ref=e18] [cursor=pointer]:
          - img [ref=e20]: pause
        - button "Stop Athan" [ref=e21] [cursor=pointer]:
          - img [ref=e23]: stop
        - button "Login" [ref=e24] [cursor=pointer]:
          - img [ref=e26]: login
    - complementary [ref=e27]:
      - generic [ref=e28]:
        - generic [ref=e29]:
          - generic [ref=e30]: Peace2074
          - generic [ref=e31]: Navigation
          - generic [ref=e32]: Control drawer ordering and visibility.
        - separator [ref=e33]
        - list [ref=e34]:
          - listitem "Home" [ref=e35] [cursor=pointer]:
            - generic [ref=e37]: home
            - generic [ref=e38]:
              - generic [ref=e39]: Home
              - generic [ref=e40]: /
            - button "Pin" [ref=e42]:
              - generic [ref=e44]: Pin
          - listitem "About" [ref=e45] [cursor=pointer]:
            - generic [ref=e47]: info
            - generic [ref=e48]:
              - generic [ref=e49]: About
              - generic [ref=e50]: /about
            - button "Pin" [ref=e52]:
              - generic [ref=e54]: Pin
          - listitem "Quran" [ref=e55] [cursor=pointer]:
            - generic [ref=e57]: menu_book
            - generic [ref=e58]:
              - generic [ref=e59]: Quran
              - generic [ref=e60]: /quran
            - button "Pin" [ref=e62]:
              - generic [ref=e64]: Pin
          - listitem "Holy Names" [ref=e65] [cursor=pointer]:
            - generic [ref=e67]: auto_awesome
            - generic [ref=e68]:
              - generic [ref=e69]: Holy Names
              - generic [ref=e70]: /holynames
            - button "Pin" [ref=e72]:
              - generic [ref=e74]: Pin
          - listitem "Sunnah Recitations" [ref=e75] [cursor=pointer]:
            - generic [ref=e77]: play_circle
            - generic [ref=e78]:
              - generic [ref=e79]: Sunnah Recitations
              - generic [ref=e80]: /recitations
            - button "Pin" [ref=e82]:
              - generic [ref=e84]: Pin
          - listitem "Tasbeeh" [ref=e85] [cursor=pointer]:
            - generic [ref=e87]: loop
            - generic [ref=e88]:
              - generic [ref=e89]: Tasbeeh
              - generic [ref=e90]: /tasbeeh
            - button "Pin" [ref=e92]:
              - generic [ref=e94]: Pin
          - listitem "Miracles" [ref=e95] [cursor=pointer]:
            - generic [ref=e97]: lightbulb
            - generic [ref=e98]:
              - generic [ref=e99]: Miracles
              - generic [ref=e100]: /miracles
            - button "Pin" [ref=e102]:
              - generic [ref=e104]: Pin
          - listitem "Social" [ref=e105] [cursor=pointer]:
            - generic [ref=e107]: share
            - generic [ref=e108]:
              - generic [ref=e109]: Social
              - generic [ref=e110]: /social
            - button "Pin" [ref=e112]:
              - generic [ref=e114]: Pin
          - listitem "Support" [ref=e115] [cursor=pointer]:
            - generic [ref=e117]: volunteer_activism
            - generic [ref=e118]:
              - generic [ref=e119]: Support
              - generic [ref=e120]: /support
            - button "Pin" [ref=e122]:
              - generic [ref=e124]: Pin
          - listitem "Settings" [ref=e125] [cursor=pointer]:
            - generic [ref=e127]: settings
            - generic [ref=e128]:
              - generic [ref=e129]: Settings
              - generic [ref=e130]: /settings
            - button "Pin" [ref=e132]:
              - generic [ref=e134]: Pin
          - listitem "Login" [ref=e135] [cursor=pointer]:
            - generic [ref=e137]: login
            - generic [ref=e138]:
              - generic [ref=e139]: Login
              - generic [ref=e140]: /login
            - button "Pin" [ref=e142]:
              - generic [ref=e144]: Pin
          - listitem "Blog" [ref=e145] [cursor=pointer]:
            - generic [ref=e147]: article
            - generic [ref=e148]:
              - generic [ref=e149]: Blog
              - generic [ref=e150]: /blog
            - button "Pin" [ref=e152]:
              - generic [ref=e154]: Pin
          - listitem "Deploys" [ref=e155] [cursor=pointer]:
            - generic [ref=e157]: rocket_launch
            - generic [ref=e158]:
              - generic [ref=e159]: Deploys
              - generic [ref=e160]: /deploys
            - button "Pin" [ref=e162]:
              - generic [ref=e164]: Pin
          - listitem "Contact" [ref=e165] [cursor=pointer]:
            - generic [ref=e167]: contact_mail
            - generic [ref=e168]:
              - generic [ref=e169]: Contact
              - generic [ref=e170]: /contact
            - button "Pin" [ref=e172]:
              - generic [ref=e174]: Pin
          - listitem "Credits" [ref=e175] [cursor=pointer]:
            - generic [ref=e177]: volunteer_activism
            - generic [ref=e178]:
              - generic [ref=e179]: Credits
              - generic [ref=e180]: /credits
            - button "Pin" [ref=e182]:
              - generic [ref=e184]: Pin
    - main [ref=e186]:
      - generic [ref=e187]:
        - generic [ref=e188]:
          - heading "Settings" [level=1] [ref=e189]
          - generic [ref=e190]: Control how the app looks and behaves.
        - generic [ref=e191]:
          - generic [ref=e193]:
            - generic [ref=e194]: Display
            - generic [ref=e195]: Tune layout density and motion preferences.
            - generic [ref=e196]:
              - generic [ref=e197]:
                - generic [ref=e198]: Compact layout
                - generic [ref=e199]: Use tighter spacing for dense screens.
              - switch "Compact layout" [ref=e200] [cursor=pointer]
            - separator [ref=e204]
            - generic [ref=e205]:
              - generic [ref=e206]:
                - generic [ref=e207]: Reduce motion
                - generic [ref=e208]: Soften animations for calmer interaction.
              - switch "Reduce motion" [ref=e209] [cursor=pointer]
            - separator [ref=e213]
            - generic [ref=e214]:
              - generic [ref=e215]:
                - generic [ref=e216]: Dark mode
                - generic [ref=e217]: Switch between light and dark theme.
              - switch "Dark mode" [ref=e218] [cursor=pointer]
            - separator [ref=e222]
            - generic [ref=e223]:
              - generic [ref=e224]:
                - generic [ref=e225]: Show Quran translation
                - generic [ref=e226]: Always display translation after Arabic text for transparency.
              - switch "Show Quran translation" [checked] [ref=e227] [cursor=pointer]
            - generic [ref=e232]:
              - generic [ref=e233]: Quran translator
              - generic [ref=e234]: Choose your preferred translation scholar for the current language.
              - generic [ref=e237] [cursor=pointer]:
                - generic "Quran translator" [ref=e239]:
                  - generic [ref=e240]: Saheeh International
                  - combobox "Quran translator" [ref=e241]: Saheeh International
                - generic [ref=e243]: arrow_drop_down
            - separator [ref=e244]
            - generic [ref=e246]:
              - generic [ref=e247]: Recitation highlight
              - generic [ref=e248]: Reading choices apply across Quran pages on this device.
              - generic [ref=e249]:
                - button "Word" [pressed] [ref=e250] [cursor=pointer]:
                  - generic [ref=e252]: Word
                - button "Sentence" [ref=e253] [cursor=pointer]:
                  - generic [ref=e255]: Sentence
            - separator [ref=e256]
            - generic [ref=e257]:
              - generic [ref=e258]:
                - generic [ref=e259]:
                  - text: 💎 Cursor Trail Diamonds
                  - status [ref=e260]: "40"
                - generic [ref=e261]: Number of floating diamonds following your cursor (0 = disabled)
              - slider [ref=e262]:
                - generic [ref=e268]:
                  - img [ref=e269]
                  - generic:
                    - generic:
                      - generic: "40"
          - generic [ref=e273]:
            - generic [ref=e274]: Accessibility
            - generic [ref=e275]: Adjust text size and contrast for easier reading.
            - generic [ref=e277]:
              - generic [ref=e278]: Text size
              - generic [ref=e279]: Makes all text larger or smaller.
            - slider [ref=e280]:
              - generic [ref=e286]:
                - img [ref=e287]
                - generic:
                  - generic:
                    - generic: Medium
            - separator [ref=e290]
            - generic [ref=e291]:
              - generic [ref=e292]:
                - generic [ref=e293]: High contrast
                - generic [ref=e294]: Increase contrast for better visibility.
              - switch "High contrast" [ref=e295] [cursor=pointer]
          - generic [ref=e300]:
            - generic [ref=e301]: Navigation
            - generic [ref=e302]: Control drawer ordering and visibility.
            - generic [ref=e303]:
              - generic [ref=e304]:
                - generic [ref=e305]: Enable drag ordering
                - generic [ref=e306]: Allow reordering and pinning items in the drawer.
              - switch "Enable drag ordering" [checked] [ref=e307] [cursor=pointer]
            - separator [ref=e311]
            - generic [ref=e312]:
              - generic [ref=e313]:
                - generic [ref=e314]: Open drawer on start
                - generic [ref=e315]: Enable to start with the drawer open; disable to keep it hidden until toggled.
              - switch "Open drawer on start" [ref=e316] [cursor=pointer]
          - generic [ref=e321]:
            - generic [ref=e322]: Notifications
            - generic [ref=e323]: Stay informed when new content arrives.
            - generic [ref=e324]:
              - generic [ref=e325]:
                - generic [ref=e326]: Enable notifications
                - generic [ref=e327]: We’ll ask permission before sending anything.
              - switch "Enable notifications" [ref=e328] [cursor=pointer]
            - alert [ref=e332]:
              - generic [ref=e333]: We’ll ask permission before sending anything.
          - generic [ref=e335]:
            - generic [ref=e336]: Audio
            - generic [ref=e337]: Control athan and playback defaults.
            - generic [ref=e338]:
              - generic [ref=e339]:
                - generic [ref=e340]: Autoplay athan
                - generic [ref=e341]: Start athan playback automatically when available.
              - switch "Autoplay athan" [checked] [ref=e342] [cursor=pointer]
            - separator [ref=e346]
            - generic [ref=e347]:
              - generic [ref=e348]:
                - generic [ref=e349]: Adhan at Prayer Times
                - generic [ref=e350]: Automatically play the Adhan when a prayer time starts.
              - switch "Adhan at Prayer Times" [checked] [ref=e351] [cursor=pointer]
            - separator [ref=e355]
            - generic [ref=e356]:
              - generic [ref=e357]: Athan Reciter
              - generic [ref=e358]: Choose your preferred Athan voice. Click ▶ to preview.
              - generic [ref=e359]:
                - generic [ref=e362] [cursor=pointer]:
                  - generic [ref=e363]:
                    - generic: Reciter
                    - generic "Select Athan reciter" [ref=e364]:
                      - generic [ref=e365]: Mishary Alafasy
                      - combobox "Reciter" [ref=e366]: Mishary Alafasy
                  - generic [ref=e368]: arrow_drop_down
                - button "Stop preview" [ref=e369]:
                  - generic:
                    - img: stop
                  - img [ref=e371]
              - generic [ref=e373]: مشاري العفاسي
            - separator [ref=e374]
            - generic [ref=e375]:
              - generic [ref=e376]:
                - generic [ref=e377]: Offline Recitation
                - generic [ref=e378]: Download Quran recitations for offline listening
              - button "Offline Recitation" [ref=e379] [cursor=pointer]:
                - generic [ref=e380]:
                  - img [ref=e381]: download
                  - generic [ref=e382]: Offline Recitation
          - generic [ref=e384]:
            - generic [ref=e385]: Refresh app
            - generic [ref=e386]: Force an update and reload to get the latest version.
            - button "Reload" [ref=e387] [cursor=pointer]:
              - generic [ref=e389]: Reload
    - contentinfo [ref=e390]:
      - generic [ref=e391]:
        - generic [ref=e392]:
          - img "decor" [ref=e393]
          - generic [ref=e394]: © 2026 Peace2074 · v3.3.27
        - navigation "Footer links" [ref=e395]:
          - link "About" [ref=e396] [cursor=pointer]:
            - /url: /about
          - link "Quran" [ref=e397] [cursor=pointer]:
            - /url: /quran
          - link "Terms and Conditions" [ref=e398] [cursor=pointer]:
            - /url: /terms
          - link "Privacy Policy" [ref=e399] [cursor=pointer]:
            - /url: /privacy
          - link "Contact" [ref=e400] [cursor=pointer]:
            - /url: /contact
          - link "Credits" [ref=e401] [cursor=pointer]:
            - /url: /credits
  - generic: God bless my mom
```

# Test source

```ts
  43  |         await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  44  |         for (const heading of ['Display', 'Accessibility', 'Navigation', 'Notifications', 'Audio']) {
  45  |             await expect(page.getByText(heading, { exact: true }).first()).toBeVisible()
  46  |         }
  47  |     })
  48  | 
  49  |     // ── Display ──────────────────────────────────────────────────────────────
  50  | 
  51  |     test('compact layout toggle persists to localStorage', async ({ page }) => {
  52  |         const toggle = page.getByRole('switch', { name: /compact layout/i })
  53  |         await expect(toggle).toBeVisible()
  54  |         await toggle.click()
  55  |         const val = await page.evaluate((k) => window.localStorage.getItem(k), KEYS.compact)
  56  |         expect(val).toBe('true')
  57  |         await toggle.click()
  58  |         const val2 = await page.evaluate((k) => window.localStorage.getItem(k), KEYS.compact)
  59  |         expect(val2).toBe('false')
  60  |     })
  61  | 
  62  |     test('reduce motion toggle persists to localStorage', async ({ page }) => {
  63  |         const toggle = page.getByRole('switch', { name: /reduce motion/i })
  64  |         await toggle.click()
  65  |         const val = await page.evaluate((k) => window.localStorage.getItem(k), KEYS.motion)
  66  |         expect(val).toBe('true')
  67  |     })
  68  | 
  69  |     test('dark mode toggle applies body--dark class and persists', async ({ page }) => {
  70  |         const toggle = page.getByRole('switch', { name: /dark mode/i })
  71  |         await toggle.click()
  72  |         await expect(page.locator('body')).toHaveClass(/body--dark/)
  73  |         const val = await page.evaluate((k) => window.localStorage.getItem(k), KEYS.darkMode)
  74  |         expect(val).toBe('true')
  75  |         // Toggle back
  76  |         await toggle.click()
  77  |         await expect(page.locator('body')).not.toHaveClass(/body--dark/)
  78  |         const val2 = await page.evaluate((k) => window.localStorage.getItem(k), KEYS.darkMode)
  79  |         expect(val2).toBe('false')
  80  |     })
  81  | 
  82  |     test('show Quran translation toggle persists to localStorage', async ({ page }) => {
  83  |         const toggle = page.getByRole('switch', { name: /show quran translation/i })
  84  |         // Default is true; click to turn off
  85  |         await toggle.click()
  86  |         const val = await page.evaluate((k) => window.localStorage.getItem(k), KEYS.translation)
  87  |         expect(val).toBe('false')
  88  |     })
  89  | 
  90  |     // ── Accessibility ─────────────────────────────────────────────────────────
  91  | 
  92  |     test('font size slider applies CSS class to <html> and persists', async ({ page }) => {
  93  |         // Default font-size pref is 1 (Medium) → html should have font-medium
  94  |         const htmlClass = await page.evaluate(() => document.documentElement.className)
  95  |         expect(htmlClass).toContain('font-medium')
  96  | 
  97  |         // Move slider to max (3 = Extra Large) by clicking at the right edge of the track
  98  |         const slider = page.locator('.q-slider').first()
  99  |         await expect(slider).toBeVisible()
  100 |         const box = await slider.boundingBox()
  101 |         if (!box) throw new Error('Slider not found')
  102 |         // Click at the far right of the slider track to set value to max (3)
  103 |         await page.mouse.click(box.x + box.width - 2, box.y + box.height / 2)
  104 | 
  105 |         await expect(page.locator('html')).toHaveClass(/font-xlarge/)
  106 |         const val = await page.evaluate((k) => window.localStorage.getItem(k), KEYS.fontSize)
  107 |         expect(val).toBe('3')
  108 |     })
  109 | 
  110 |     test('high contrast toggle applies high-contrast class to <html> and persists', async ({ page }) => {
  111 |         const toggle = page.getByRole('switch', { name: /high contrast/i })
  112 |         await toggle.click()
  113 |         await expect(page.locator('html')).toHaveClass(/high-contrast/)
  114 |         const val = await page.evaluate((k) => window.localStorage.getItem(k), KEYS.highContrast)
  115 |         expect(val).toBe('true')
  116 |         await toggle.click()
  117 |         await expect(page.locator('html')).not.toHaveClass(/high-contrast/)
  118 |     })
  119 | 
  120 |     // ── Navigation ────────────────────────────────────────────────────────────
  121 | 
  122 |     test('nav ordering toggle persists to localStorage', async ({ page }) => {
  123 |         const toggle = page.getByRole('switch', { name: /enable drag ordering/i })
  124 |         // Default is true; click to disable
  125 |         await toggle.click()
  126 |         const val = await page.evaluate((k) => window.localStorage.getItem(k), KEYS.navOrdering)
  127 |         expect(val).toBe('false')
  128 |     })
  129 | 
  130 |     test('drawer open by default toggle persists to localStorage', async ({ page }) => {
  131 |         const toggle = page.getByRole('switch', { name: /open drawer on start/i })
  132 |         await toggle.click()
  133 |         const val = await page.evaluate((k) => window.localStorage.getItem(k), KEYS.drawerDefault)
  134 |         expect(val).toBe('true')
  135 |     })
  136 | 
  137 |     // ── Audio ─────────────────────────────────────────────────────────────────
  138 | 
  139 |     test('autoplay athan toggle persists to localStorage', async ({ page }) => {
  140 |         const toggle = page.getByRole('switch', { name: /autoplay athan/i })
  141 |         await toggle.click()
  142 |         const val = await page.evaluate((k) => window.localStorage.getItem(k), KEYS.autoplayAthan)
> 143 |         expect(val).toBe('true')
      |                     ^ Error: expect(received).toBe(expected) // Object.is equality
  144 |     })
  145 | 
  146 |     test('adhan at prayer times toggle persists to localStorage', async ({ page }) => {
  147 |         const toggle = page.getByRole('switch', { name: /adhan at prayer times/i })
  148 |         // Default is true; click to disable
  149 |         await toggle.click()
  150 |         const val = await page.evaluate((k) => window.localStorage.getItem(k), KEYS.autoplayPrayer)
  151 |         expect(val).toBe('false')
  152 |     })
  153 | 
  154 |     // ── Refresh ────────────────────────────────────────────────────────────────
  155 | 
  156 |     test('refresh app button preserves critical settings on reload', async ({ page }) => {
  157 |         // Set some critical settings first
  158 |         await page.evaluate(() => {
  159 |             window.localStorage.setItem('pref-font-size', '2')
  160 |             window.localStorage.setItem('pref-high-contrast', 'true')
  161 |             window.localStorage.setItem('pref-dark-mode', 'true')
  162 |             window.localStorage.setItem('pref-autoplay-prayer-times', 'false')
  163 |         })
  164 | 
  165 |         const reloadBtn = page.getByRole('button', { name: /reload/i })
  166 |         await reloadBtn.click()
  167 | 
  168 |         // After reload, verify critical keys were preserved
  169 |         await page.waitForURL(/\/settings/)
  170 |         const fontSize = await page.evaluate(() => window.localStorage.getItem('pref-font-size'))
  171 |         const highContrast = await page.evaluate(() => window.localStorage.getItem('pref-high-contrast'))
  172 |         const darkMode = await page.evaluate(() => window.localStorage.getItem('pref-dark-mode'))
  173 |         const prayerAutoplay = await page.evaluate(() =>
  174 |             window.localStorage.getItem('pref-autoplay-prayer-times'),
  175 |         )
  176 | 
  177 |         expect(fontSize).toBe('2')
  178 |         expect(highContrast).toBe('true')
  179 |         expect(darkMode).toBe('true')
  180 |         expect(prayerAutoplay).toBe('false')
  181 |     })
  182 | })
  183 | 
  184 | // The recitation highlight toggle lives on /preferences (not /settings)
  185 | test.describe('Preferences page — recitation highlight', () => {
  186 |     test.beforeEach(async ({ page }) => {
  187 |         await page.goto('/preferences')
  188 |         await page
  189 |             .getByRole('button', { name: /^accept$/i })
  190 |             .click({ timeout: 3000 })
  191 |             .catch(() => { })
  192 |     })
  193 | 
  194 |     test('Word is selected by default', async ({ page }) => {
  195 |         const wordBtn = page.getByRole('button', { name: /^word$/i })
  196 |         const sentenceBtn = page.getByRole('button', { name: /^sentence$/i })
  197 | 
  198 |         await expect(wordBtn).toBeVisible()
  199 |         await expect(sentenceBtn).toBeVisible()
  200 | 
  201 |         // Quasar q-btn-toggle marks the active option with aria-pressed="true"
  202 |         await expect(wordBtn).toHaveAttribute('aria-pressed', 'true')
  203 |         await expect(sentenceBtn).toHaveAttribute('aria-pressed', 'false')
  204 |     })
  205 | 
  206 |     test('clicking Sentence selects it and deselects Word', async ({ page }) => {
  207 |         const wordBtn = page.getByRole('button', { name: /^word$/i })
  208 |         const sentenceBtn = page.getByRole('button', { name: /^sentence$/i })
  209 | 
  210 |         await sentenceBtn.click()
  211 | 
  212 |         await expect(sentenceBtn).toHaveAttribute('aria-pressed', 'true')
  213 |         await expect(wordBtn).toHaveAttribute('aria-pressed', 'false')
  214 |     })
  215 | 
  216 |     test('clicking Word after Sentence reverts the selection', async ({ page }) => {
  217 |         const wordBtn = page.getByRole('button', { name: /^word$/i })
  218 |         const sentenceBtn = page.getByRole('button', { name: /^sentence$/i })
  219 | 
  220 |         await sentenceBtn.click()
  221 |         await wordBtn.click()
  222 | 
  223 |         await expect(wordBtn).toHaveAttribute('aria-pressed', 'true')
  224 |         await expect(sentenceBtn).toHaveAttribute('aria-pressed', 'false')
  225 |     })
  226 | })
  227 | 
```