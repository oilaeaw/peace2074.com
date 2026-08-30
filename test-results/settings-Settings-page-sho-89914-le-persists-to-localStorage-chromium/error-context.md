# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: settings.spec.ts >> Settings page >> show Quran translation toggle persists to localStorage
- Location: tests/settings.spec.ts:82:5

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: "false"
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
    - main [ref=e25]:
      - generic [ref=e26]:
        - generic [ref=e27]:
          - heading "Settings" [level=1] [ref=e28]
          - generic [ref=e29]: Control how the app looks and behaves.
        - generic [ref=e30]:
          - generic [ref=e32]:
            - generic [ref=e33]: Display
            - generic [ref=e34]: Tune layout density and motion preferences.
            - generic [ref=e35]:
              - generic [ref=e36]:
                - generic [ref=e37]: Compact layout
                - generic [ref=e38]: Use tighter spacing for dense screens.
              - switch "Compact layout" [ref=e39] [cursor=pointer]
            - separator [ref=e43]
            - generic [ref=e44]:
              - generic [ref=e45]:
                - generic [ref=e46]: Reduce motion
                - generic [ref=e47]: Soften animations for calmer interaction.
              - switch "Reduce motion" [ref=e48] [cursor=pointer]
            - separator [ref=e52]
            - generic [ref=e53]:
              - generic [ref=e54]:
                - generic [ref=e55]: Dark mode
                - generic [ref=e56]: Switch between light and dark theme.
              - switch "Dark mode" [ref=e57] [cursor=pointer]
            - separator [ref=e61]
            - generic [ref=e62]:
              - generic [ref=e63]:
                - generic [ref=e64]: Show Quran translation
                - generic [ref=e65]: Always display translation after Arabic text for transparency.
              - switch "Show Quran translation" [ref=e66] [cursor=pointer]
            - separator [ref=e70]
            - generic [ref=e72]:
              - generic [ref=e73]: Recitation highlight
              - generic [ref=e74]: Reading choices apply across Quran pages on this device.
              - generic [ref=e75]:
                - button "Word" [pressed] [ref=e76] [cursor=pointer]:
                  - generic [ref=e78]: Word
                - button "Sentence" [ref=e79] [cursor=pointer]:
                  - generic [ref=e81]: Sentence
            - separator [ref=e82]
            - generic [ref=e83]:
              - generic [ref=e84]:
                - generic [ref=e85]:
                  - text: 💎 Cursor Trail Diamonds
                  - status [ref=e86]: "40"
                - generic [ref=e87]: Number of floating diamonds following your cursor (0 = disabled)
              - slider [ref=e88]:
                - generic [ref=e94]:
                  - img [ref=e95]
                  - generic:
                    - generic:
                      - generic: "40"
          - generic [ref=e99]:
            - generic [ref=e100]: Accessibility
            - generic [ref=e101]: Adjust text size and contrast for easier reading.
            - generic [ref=e103]:
              - generic [ref=e104]: Text size
              - generic [ref=e105]: Makes all text larger or smaller.
            - slider [ref=e106]:
              - generic [ref=e112]:
                - img [ref=e113]
                - generic:
                  - generic:
                    - generic: Medium
            - separator [ref=e116]
            - generic [ref=e117]:
              - generic [ref=e118]:
                - generic [ref=e119]: High contrast
                - generic [ref=e120]: Increase contrast for better visibility.
              - switch "High contrast" [ref=e121] [cursor=pointer]
          - generic [ref=e126]:
            - generic [ref=e127]: Navigation
            - generic [ref=e128]: Control drawer ordering and visibility.
            - generic [ref=e129]:
              - generic [ref=e130]:
                - generic [ref=e131]: Enable drag ordering
                - generic [ref=e132]: Allow reordering and pinning items in the drawer.
              - switch "Enable drag ordering" [checked] [ref=e133] [cursor=pointer]
            - separator [ref=e137]
            - generic [ref=e138]:
              - generic [ref=e139]:
                - generic [ref=e140]: Open drawer on start
                - generic [ref=e141]: Enable to start with the drawer open; disable to keep it hidden until toggled.
              - switch "Open drawer on start" [ref=e142] [cursor=pointer]
          - generic [ref=e147]:
            - generic [ref=e148]: Notifications
            - generic [ref=e149]: Stay informed when new content arrives.
            - generic [ref=e150]:
              - generic [ref=e151]:
                - generic [ref=e152]: Enable notifications
                - generic [ref=e153]: We’ll ask permission before sending anything.
              - switch "Enable notifications" [ref=e154] [cursor=pointer]
            - alert [ref=e158]:
              - generic [ref=e159]: We’ll ask permission before sending anything.
          - generic [ref=e161]:
            - generic [ref=e162]: Audio
            - generic [ref=e163]: Control athan and playback defaults.
            - generic [ref=e164]:
              - generic [ref=e165]:
                - generic [ref=e166]: Autoplay athan
                - generic [ref=e167]: Start athan playback automatically when available.
              - switch "Autoplay athan" [ref=e168] [cursor=pointer]
            - separator [ref=e172]
            - generic [ref=e173]:
              - generic [ref=e174]:
                - generic [ref=e175]: Adhan at Prayer Times
                - generic [ref=e176]: Automatically play the Adhan when a prayer time starts.
              - switch "Adhan at Prayer Times" [checked] [ref=e177] [cursor=pointer]
            - separator [ref=e181]
            - generic [ref=e182]:
              - generic [ref=e183]: Athan Reciter
              - generic [ref=e184]: Choose your preferred Athan voice. Click ▶ to preview.
              - generic [ref=e185]:
                - generic [ref=e188] [cursor=pointer]:
                  - generic [ref=e189]:
                    - generic: Reciter
                    - generic "Select Athan reciter" [ref=e190]:
                      - generic [ref=e191]: Mishary Alafasy
                      - combobox "Reciter" [ref=e192]: Mishary Alafasy
                  - generic [ref=e194]: arrow_drop_down
                - button "Preview athan" [ref=e195] [cursor=pointer]:
                  - img [ref=e197]: play_arrow
              - generic [ref=e198]: مشاري العفاسي
            - separator [ref=e199]
            - generic [ref=e200]:
              - generic [ref=e201]:
                - generic [ref=e202]: Offline Recitation
                - generic [ref=e203]: Download Quran recitations for offline listening
              - button "Offline Recitation" [ref=e204] [cursor=pointer]:
                - generic [ref=e205]:
                  - img [ref=e206]: download
                  - generic [ref=e207]: Offline Recitation
          - generic [ref=e209]:
            - generic [ref=e210]: Refresh app
            - generic [ref=e211]: Force an update and reload to get the latest version.
            - button "Reload" [ref=e212] [cursor=pointer]:
              - generic [ref=e214]: Reload
    - contentinfo [ref=e215]:
      - generic [ref=e216]:
        - generic [ref=e217]:
          - img "decor" [ref=e218]
          - generic [ref=e219]: © 2026 Peace2074 · v3.3.27
        - navigation "Footer links" [ref=e220]:
          - link "About" [ref=e221] [cursor=pointer]:
            - /url: /about
          - link "Quran" [ref=e222] [cursor=pointer]:
            - /url: /quran
          - link "Terms and Conditions" [ref=e223] [cursor=pointer]:
            - /url: /terms
          - link "Privacy Policy" [ref=e224] [cursor=pointer]:
            - /url: /privacy
          - link "Contact" [ref=e225] [cursor=pointer]:
            - /url: /contact
          - link "Credits" [ref=e226] [cursor=pointer]:
            - /url: /credits
  - generic: God bless my mom
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test'
  2   | 
  3   | const KEYS = {
  4   |     compact: 'pref-compact-layout',
  5   |     motion: 'pref-reduce-motion',
  6   |     darkMode: 'pref-dark-mode',
  7   |     translation: 'quran-show-translation',
  8   |     fontSize: 'pref-font-size',
  9   |     highContrast: 'pref-high-contrast',
  10  |     navOrdering: 'nav-ordering-enabled',
  11  |     drawerDefault: 'drawer-open-by-default',
  12  |     autoplayAthan: 'pref-autoplay-athan',
  13  |     autoplayPrayer: 'pref-autoplay-prayer-times',
  14  | }
  15  | 
  16  | test.describe('Settings page', () => {
  17  |     test.beforeEach(async ({ page }) => {
  18  |         // Clear settings so each test starts from a known state
  19  |         await page.addInitScript(() => {
  20  |             const keys = [
  21  |                 'pref-compact-layout',
  22  |                 'pref-reduce-motion',
  23  |                 'pref-dark-mode',
  24  |                 'quran-show-translation',
  25  |                 'pref-font-size',
  26  |                 'pref-high-contrast',
  27  |                 'nav-ordering-enabled',
  28  |                 'drawer-open-by-default',
  29  |                 'pref-autoplay-athan',
  30  |                 'pref-autoplay-prayer-times',
  31  |             ]
  32  |             keys.forEach((k) => window.localStorage.removeItem(k))
  33  |         })
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
> 87  |         expect(val).toBe('false')
      |                     ^ Error: expect(received).toBe(expected) // Object.is equality
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
```