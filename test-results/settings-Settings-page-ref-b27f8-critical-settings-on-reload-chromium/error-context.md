# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: settings.spec.ts >> Settings page >> refresh app button preserves critical settings on reload
- Location: tests/settings.spec.ts:156:5

# Error details

```
Error: page.evaluate: Execution context was destroyed, most likely because of a navigation
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
        - button "Login" [ref=e26] [cursor=pointer]:
          - img [ref=e28]: login
    - contentinfo [ref=e30]:
      - generic [ref=e31]:
        - generic [ref=e32]:
          - img "decor" [ref=e33]
          - generic [ref=e34]: © 2026 Peace2074 · v3.3.27
        - navigation "Footer links" [ref=e35]:
          - link "About" [ref=e36] [cursor=pointer]:
            - /url: /about
          - link "Quran" [ref=e37] [cursor=pointer]:
            - /url: /quran
          - link "Terms and Conditions" [ref=e38] [cursor=pointer]:
            - /url: /terms
          - link "Privacy Policy" [ref=e39] [cursor=pointer]:
            - /url: /privacy
          - link "Contact" [ref=e40] [cursor=pointer]:
            - /url: /contact
          - link "Credits" [ref=e41] [cursor=pointer]:
            - /url: /credits
```

# Test source

```ts
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
  167 | 
  168 |         // After reload, verify critical keys were preserved
  169 |         await page.waitForURL(/\/settings/)
  170 |         const fontSize = await page.evaluate(() => window.localStorage.getItem('pref-font-size'))
  171 |         const highContrast = await page.evaluate(() => window.localStorage.getItem('pref-high-contrast'))
> 172 |         const darkMode = await page.evaluate(() => window.localStorage.getItem('pref-dark-mode'))
      |                                     ^ Error: page.evaluate: Execution context was destroyed, most likely because of a navigation
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