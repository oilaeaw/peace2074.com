# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: settings.spec.ts >> Settings page >> drawer open by default toggle persists to localStorage
- Location: tests/settings.spec.ts:130:5

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
        - button "Play Athan" [ref=e18] [cursor=pointer]:
          - img [ref=e20]: volume_up
        - button "Login" [ref=e21] [cursor=pointer]:
          - img [ref=e23]: login
    - complementary [ref=e24]:
      - generic [ref=e25]:
        - generic [ref=e26]:
          - generic [ref=e27]: Peace2074
          - generic [ref=e28]: Navigation
          - generic [ref=e29]: Control drawer ordering and visibility.
        - separator [ref=e30]
        - list [ref=e31]:
          - listitem "Home" [ref=e32] [cursor=pointer]:
            - generic [ref=e34]: home
            - generic [ref=e35]:
              - generic [ref=e36]: Home
              - generic [ref=e37]: /
            - button "Pin" [ref=e39]:
              - generic [ref=e41]: Pin
          - listitem "About" [ref=e42] [cursor=pointer]:
            - generic [ref=e44]: info
            - generic [ref=e45]:
              - generic [ref=e46]: About
              - generic [ref=e47]: /about
            - button "Pin" [ref=e49]:
              - generic [ref=e51]: Pin
          - listitem "Quran" [ref=e52] [cursor=pointer]:
            - generic [ref=e54]: menu_book
            - generic [ref=e55]:
              - generic [ref=e56]: Quran
              - generic [ref=e57]: /quran
            - button "Pin" [ref=e59]:
              - generic [ref=e61]: Pin
          - listitem "Holy Names" [ref=e62] [cursor=pointer]:
            - generic [ref=e64]: auto_awesome
            - generic [ref=e65]:
              - generic [ref=e66]: Holy Names
              - generic [ref=e67]: /holynames
            - button "Pin" [ref=e69]:
              - generic [ref=e71]: Pin
          - listitem "Sunnah Recitations" [ref=e72] [cursor=pointer]:
            - generic [ref=e74]: play_circle
            - generic [ref=e75]:
              - generic [ref=e76]: Sunnah Recitations
              - generic [ref=e77]: /recitations
            - button "Pin" [ref=e79]:
              - generic [ref=e81]: Pin
          - listitem "Tasbeeh" [ref=e82] [cursor=pointer]:
            - generic [ref=e84]: loop
            - generic [ref=e85]:
              - generic [ref=e86]: Tasbeeh
              - generic [ref=e87]: /tasbeeh
            - button "Pin" [ref=e89]:
              - generic [ref=e91]: Pin
          - listitem "Miracles" [ref=e92] [cursor=pointer]:
            - generic [ref=e94]: lightbulb
            - generic [ref=e95]:
              - generic [ref=e96]: Miracles
              - generic [ref=e97]: /miracles
            - button "Pin" [ref=e99]:
              - generic [ref=e101]: Pin
          - listitem "Social" [ref=e102] [cursor=pointer]:
            - generic [ref=e104]: share
            - generic [ref=e105]:
              - generic [ref=e106]: Social
              - generic [ref=e107]: /social
            - button "Pin" [ref=e109]:
              - generic [ref=e111]: Pin
          - listitem "Support" [ref=e112] [cursor=pointer]:
            - generic [ref=e114]: volunteer_activism
            - generic [ref=e115]:
              - generic [ref=e116]: Support
              - generic [ref=e117]: /support
            - button "Pin" [ref=e119]:
              - generic [ref=e121]: Pin
          - listitem "Settings" [ref=e122] [cursor=pointer]:
            - generic [ref=e124]: settings
            - generic [ref=e125]:
              - generic [ref=e126]: Settings
              - generic [ref=e127]: /settings
            - button "Pin" [ref=e129]:
              - generic [ref=e131]: Pin
          - listitem "Login" [ref=e132] [cursor=pointer]:
            - generic [ref=e134]: login
            - generic [ref=e135]:
              - generic [ref=e136]: Login
              - generic [ref=e137]: /login
            - button "Pin" [ref=e139]:
              - generic [ref=e141]: Pin
          - listitem "Blog" [ref=e142] [cursor=pointer]:
            - generic [ref=e144]: article
            - generic [ref=e145]:
              - generic [ref=e146]: Blog
              - generic [ref=e147]: /blog
            - button "Pin" [ref=e149]:
              - generic [ref=e151]: Pin
          - listitem "Deploys" [ref=e152] [cursor=pointer]:
            - generic [ref=e154]: rocket_launch
            - generic [ref=e155]:
              - generic [ref=e156]: Deploys
              - generic [ref=e157]: /deploys
            - button "Pin" [ref=e159]:
              - generic [ref=e161]: Pin
          - listitem "Contact" [ref=e162] [cursor=pointer]:
            - generic [ref=e164]: contact_mail
            - generic [ref=e165]:
              - generic [ref=e166]: Contact
              - generic [ref=e167]: /contact
            - button "Pin" [ref=e169]:
              - generic [ref=e171]: Pin
          - listitem "Credits" [ref=e172] [cursor=pointer]:
            - generic [ref=e174]: volunteer_activism
            - generic [ref=e175]:
              - generic [ref=e176]: Credits
              - generic [ref=e177]: /credits
            - button "Pin" [ref=e179]:
              - generic [ref=e181]: Pin
    - main [ref=e183]:
      - generic [ref=e184]:
        - generic [ref=e185]:
          - heading "Settings" [level=1] [ref=e186]
          - generic [ref=e187]: Control how the app looks and behaves.
        - generic [ref=e188]:
          - generic [ref=e190]:
            - generic [ref=e191]: Display
            - generic [ref=e192]: Tune layout density and motion preferences.
            - generic [ref=e193]:
              - generic [ref=e194]:
                - generic [ref=e195]: Compact layout
                - generic [ref=e196]: Use tighter spacing for dense screens.
              - switch "Compact layout" [ref=e197] [cursor=pointer]
            - separator [ref=e201]
            - generic [ref=e202]:
              - generic [ref=e203]:
                - generic [ref=e204]: Reduce motion
                - generic [ref=e205]: Soften animations for calmer interaction.
              - switch "Reduce motion" [ref=e206] [cursor=pointer]
            - separator [ref=e210]
            - generic [ref=e211]:
              - generic [ref=e212]:
                - generic [ref=e213]: Dark mode
                - generic [ref=e214]: Switch between light and dark theme.
              - switch "Dark mode" [ref=e215] [cursor=pointer]
            - separator [ref=e219]
            - generic [ref=e220]:
              - generic [ref=e221]:
                - generic [ref=e222]: Show Quran translation
                - generic [ref=e223]: Always display translation after Arabic text for transparency.
              - switch "Show Quran translation" [checked] [ref=e224] [cursor=pointer]
            - generic [ref=e229]:
              - generic [ref=e230]: Quran translator
              - generic [ref=e231]: Choose your preferred translation scholar for the current language.
              - generic [ref=e234] [cursor=pointer]:
                - generic "Quran translator" [ref=e236]:
                  - generic [ref=e237]: Saheeh International
                  - combobox "Quran translator" [ref=e238]: Saheeh International
                - generic [ref=e240]: arrow_drop_down
            - separator [ref=e241]
            - generic [ref=e243]:
              - generic [ref=e244]: Recitation highlight
              - generic [ref=e245]: Reading choices apply across Quran pages on this device.
              - generic [ref=e246]:
                - button "Word" [pressed] [ref=e247] [cursor=pointer]:
                  - generic [ref=e249]: Word
                - button "Sentence" [ref=e250] [cursor=pointer]:
                  - generic [ref=e252]: Sentence
            - separator [ref=e253]
            - generic [ref=e254]:
              - generic [ref=e255]:
                - generic [ref=e256]:
                  - text: 💎 Cursor Trail Diamonds
                  - status [ref=e257]: "40"
                - generic [ref=e258]: Number of floating diamonds following your cursor (0 = disabled)
              - slider [ref=e259]:
                - generic [ref=e265]:
                  - img [ref=e266]
                  - generic:
                    - generic:
                      - generic: "40"
          - generic [ref=e270]:
            - generic [ref=e271]: Accessibility
            - generic [ref=e272]: Adjust text size and contrast for easier reading.
            - generic [ref=e274]:
              - generic [ref=e275]: Text size
              - generic [ref=e276]: Makes all text larger or smaller.
            - slider [ref=e277]:
              - generic [ref=e283]:
                - img [ref=e284]
                - generic:
                  - generic:
                    - generic: Medium
            - separator [ref=e287]
            - generic [ref=e288]:
              - generic [ref=e289]:
                - generic [ref=e290]: High contrast
                - generic [ref=e291]: Increase contrast for better visibility.
              - switch "High contrast" [ref=e292] [cursor=pointer]
          - generic [ref=e297]:
            - generic [ref=e298]: Navigation
            - generic [ref=e299]: Control drawer ordering and visibility.
            - generic [ref=e300]:
              - generic [ref=e301]:
                - generic [ref=e302]: Enable drag ordering
                - generic [ref=e303]: Allow reordering and pinning items in the drawer.
              - switch "Enable drag ordering" [checked] [ref=e304] [cursor=pointer]
            - separator [ref=e308]
            - generic [ref=e309]:
              - generic [ref=e310]:
                - generic [ref=e311]: Open drawer on start
                - generic [ref=e312]: Enable to start with the drawer open; disable to keep it hidden until toggled.
              - switch "Open drawer on start" [checked] [ref=e313] [cursor=pointer]
          - generic [ref=e318]:
            - generic [ref=e319]: Notifications
            - generic [ref=e320]: Stay informed when new content arrives.
            - generic [ref=e321]:
              - generic [ref=e322]:
                - generic [ref=e323]: Enable notifications
                - generic [ref=e324]: We’ll ask permission before sending anything.
              - switch "Enable notifications" [ref=e325] [cursor=pointer]
            - alert [ref=e329]:
              - generic [ref=e330]: We’ll ask permission before sending anything.
          - generic [ref=e332]:
            - generic [ref=e333]: Audio
            - generic [ref=e334]: Control athan and playback defaults.
            - generic [ref=e335]:
              - generic [ref=e336]:
                - generic [ref=e337]: Autoplay athan
                - generic [ref=e338]: Start athan playback automatically when available.
              - switch "Autoplay athan" [ref=e339] [cursor=pointer]
            - separator [ref=e343]
            - generic [ref=e344]:
              - generic [ref=e345]:
                - generic [ref=e346]: Adhan at Prayer Times
                - generic [ref=e347]: Automatically play the Adhan when a prayer time starts.
              - switch "Adhan at Prayer Times" [checked] [ref=e348] [cursor=pointer]
            - separator [ref=e352]
            - generic [ref=e353]:
              - generic [ref=e354]: Athan Reciter
              - generic [ref=e355]: Choose your preferred Athan voice. Click ▶ to preview.
              - generic [ref=e356]:
                - generic [ref=e359] [cursor=pointer]:
                  - generic [ref=e360]:
                    - generic: Reciter
                    - generic "Select Athan reciter" [ref=e361]:
                      - generic [ref=e362]: Mishary Alafasy
                      - combobox "Reciter" [ref=e363]: Mishary Alafasy
                  - generic [ref=e365]: arrow_drop_down
                - button "Preview athan" [ref=e366] [cursor=pointer]:
                  - img [ref=e368]: play_arrow
              - generic [ref=e369]: مشاري العفاسي
            - separator [ref=e370]
            - generic [ref=e371]:
              - generic [ref=e372]:
                - generic [ref=e373]: Offline Recitation
                - generic [ref=e374]: Download Quran recitations for offline listening
              - button "Offline Recitation" [ref=e375] [cursor=pointer]:
                - generic [ref=e376]:
                  - img [ref=e377]: download
                  - generic [ref=e378]: Offline Recitation
          - generic [ref=e380]:
            - generic [ref=e381]: Refresh app
            - generic [ref=e382]: Force an update and reload to get the latest version.
            - button "Reload" [ref=e383] [cursor=pointer]:
              - generic [ref=e385]: Reload
    - contentinfo [ref=e386]:
      - generic [ref=e387]:
        - generic [ref=e388]:
          - img "decor" [ref=e389]
          - generic [ref=e390]: © 2026 Peace2074 · v3.3.27
        - navigation "Footer links" [ref=e391]:
          - link "About" [ref=e392] [cursor=pointer]:
            - /url: /about
          - link "Quran" [ref=e393] [cursor=pointer]:
            - /url: /quran
          - link "Terms and Conditions" [ref=e394] [cursor=pointer]:
            - /url: /terms
          - link "Privacy Policy" [ref=e395] [cursor=pointer]:
            - /url: /privacy
          - link "Contact" [ref=e396] [cursor=pointer]:
            - /url: /contact
          - link "Credits" [ref=e397] [cursor=pointer]:
            - /url: /credits
  - generic: God bless my mom
```

# Test source

```ts
  34  |         await page.goto('/settings')
  35  |         // Dismiss cookie consent if present
  36  |         await page
  37  |             .getByRole('button', { name: /^accept$/i })
  38  |             .click({ timeout: 3000 })
  39  |             .catch(() => { })
  40  |     })
  41  | 
  42  |     test('settings page renders all section headings', async ({ page }) => {
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
> 134 |         expect(val).toBe('true')
      |                     ^ Error: expect(received).toBe(expected) // Object.is equality
  135 |     })
  136 | 
  137 |     // ── Audio ─────────────────────────────────────────────────────────────────
  138 | 
  139 |     test('autoplay athan toggle persists to localStorage', async ({ page }) => {
  140 |         const toggle = page.getByRole('switch', { name: /autoplay athan/i })
  141 |         await toggle.click()
  142 |         const val = await page.evaluate((k) => window.localStorage.getItem(k), KEYS.autoplayAthan)
  143 |         expect(val).toBe('true')
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