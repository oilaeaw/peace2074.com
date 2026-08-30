# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: settings.spec.ts >> Settings page >> reduce motion toggle persists to localStorage
- Location: tests/settings.spec.ts:62:5

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
              - switch "Reduce motion" [checked] [ref=e48] [cursor=pointer]
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
              - switch "Show Quran translation" [checked] [ref=e66] [cursor=pointer]
            - generic [ref=e71]:
              - generic [ref=e72]: Quran translator
              - generic [ref=e73]: Choose your preferred translation scholar for the current language.
              - generic [ref=e76] [cursor=pointer]:
                - generic "Quran translator" [ref=e78]:
                  - generic [ref=e79]: Saheeh International
                  - combobox "Quran translator" [ref=e80]: Saheeh International
                - generic [ref=e82]: arrow_drop_down
            - separator [ref=e83]
            - generic [ref=e85]:
              - generic [ref=e86]: Recitation highlight
              - generic [ref=e87]: Reading choices apply across Quran pages on this device.
              - generic [ref=e88]:
                - button "Word" [pressed] [ref=e89] [cursor=pointer]:
                  - generic [ref=e91]: Word
                - button "Sentence" [ref=e92] [cursor=pointer]:
                  - generic [ref=e94]: Sentence
            - separator [ref=e95]
            - generic [ref=e96]:
              - generic [ref=e97]:
                - generic [ref=e98]:
                  - text: 💎 Cursor Trail Diamonds
                  - status [ref=e99]: "40"
                - generic [ref=e100]: Number of floating diamonds following your cursor (0 = disabled)
              - slider [ref=e101]:
                - generic [ref=e107]:
                  - img [ref=e108]
                  - generic:
                    - generic:
                      - generic: "40"
          - generic [ref=e112]:
            - generic [ref=e113]: Accessibility
            - generic [ref=e114]: Adjust text size and contrast for easier reading.
            - generic [ref=e116]:
              - generic [ref=e117]: Text size
              - generic [ref=e118]: Makes all text larger or smaller.
            - slider [ref=e119]:
              - generic [ref=e125]:
                - img [ref=e126]
                - generic:
                  - generic:
                    - generic: Medium
            - separator [ref=e129]
            - generic [ref=e130]:
              - generic [ref=e131]:
                - generic [ref=e132]: High contrast
                - generic [ref=e133]: Increase contrast for better visibility.
              - switch "High contrast" [ref=e134] [cursor=pointer]
          - generic [ref=e139]:
            - generic [ref=e140]: Navigation
            - generic [ref=e141]: Control drawer ordering and visibility.
            - generic [ref=e142]:
              - generic [ref=e143]:
                - generic [ref=e144]: Enable drag ordering
                - generic [ref=e145]: Allow reordering and pinning items in the drawer.
              - switch "Enable drag ordering" [checked] [ref=e146] [cursor=pointer]
            - separator [ref=e150]
            - generic [ref=e151]:
              - generic [ref=e152]:
                - generic [ref=e153]: Open drawer on start
                - generic [ref=e154]: Enable to start with the drawer open; disable to keep it hidden until toggled.
              - switch "Open drawer on start" [ref=e155] [cursor=pointer]
          - generic [ref=e160]:
            - generic [ref=e161]: Notifications
            - generic [ref=e162]: Stay informed when new content arrives.
            - generic [ref=e163]:
              - generic [ref=e164]:
                - generic [ref=e165]: Enable notifications
                - generic [ref=e166]: We’ll ask permission before sending anything.
              - switch "Enable notifications" [ref=e167] [cursor=pointer]
            - alert [ref=e171]:
              - generic [ref=e172]: We’ll ask permission before sending anything.
          - generic [ref=e174]:
            - generic [ref=e175]: Audio
            - generic [ref=e176]: Control athan and playback defaults.
            - generic [ref=e177]:
              - generic [ref=e178]:
                - generic [ref=e179]: Autoplay athan
                - generic [ref=e180]: Start athan playback automatically when available.
              - switch "Autoplay athan" [ref=e181] [cursor=pointer]
            - separator [ref=e185]
            - generic [ref=e186]:
              - generic [ref=e187]:
                - generic [ref=e188]: Adhan at Prayer Times
                - generic [ref=e189]: Automatically play the Adhan when a prayer time starts.
              - switch "Adhan at Prayer Times" [checked] [ref=e190] [cursor=pointer]
            - separator [ref=e194]
            - generic [ref=e195]:
              - generic [ref=e196]: Athan Reciter
              - generic [ref=e197]: Choose your preferred Athan voice. Click ▶ to preview.
              - generic [ref=e198]:
                - generic [ref=e201] [cursor=pointer]:
                  - generic [ref=e202]:
                    - generic: Reciter
                    - generic "Select Athan reciter" [ref=e203]:
                      - generic [ref=e204]: Mishary Alafasy
                      - combobox "Reciter" [ref=e205]: Mishary Alafasy
                  - generic [ref=e207]: arrow_drop_down
                - button "Preview athan" [ref=e208] [cursor=pointer]:
                  - img [ref=e210]: play_arrow
              - generic [ref=e211]: مشاري العفاسي
            - separator [ref=e212]
            - generic [ref=e213]:
              - generic [ref=e214]:
                - generic [ref=e215]: Offline Recitation
                - generic [ref=e216]: Download Quran recitations for offline listening
              - button "Offline Recitation" [ref=e217] [cursor=pointer]:
                - generic [ref=e218]:
                  - img [ref=e219]: download
                  - generic [ref=e220]: Offline Recitation
          - generic [ref=e222]:
            - generic [ref=e223]: Refresh app
            - generic [ref=e224]: Force an update and reload to get the latest version.
            - button "Reload" [ref=e225] [cursor=pointer]:
              - generic [ref=e227]: Reload
    - contentinfo [ref=e228]:
      - generic [ref=e229]:
        - generic [ref=e230]:
          - img "decor" [ref=e231]
          - generic [ref=e232]: © 2026 Peace2074 · v3.3.27
        - navigation "Footer links" [ref=e233]:
          - link "About" [ref=e234] [cursor=pointer]:
            - /url: /about
          - link "Quran" [ref=e235] [cursor=pointer]:
            - /url: /quran
          - link "Terms and Conditions" [ref=e236] [cursor=pointer]:
            - /url: /terms
          - link "Privacy Policy" [ref=e237] [cursor=pointer]:
            - /url: /privacy
          - link "Contact" [ref=e238] [cursor=pointer]:
            - /url: /contact
          - link "Credits" [ref=e239] [cursor=pointer]:
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
> 66  |         expect(val).toBe('true')
      |                     ^ Error: expect(received).toBe(expected) // Object.is equality
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
```