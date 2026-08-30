# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: settings.spec.ts >> Settings page >> compact layout toggle persists to localStorage
- Location: tests/settings.spec.ts:51:5

# Error details

```
Test timeout of 30000ms exceeded while running "beforeEach" hook.
```

```
Error: page.goto: Test timeout of 30000ms exceeded.
Call log:
  - navigating to "http://localhost:4000/settings", waiting until "load"

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
    - alert [ref=e25]:
      - generic [ref=e27]:
        - generic [ref=e28]: We use cookies to improve your experience and analyze site usage.
        - generic [ref=e29]: By clicking 'Accept', you consent to our use of cookies for analytics.
      - generic [ref=e30]:
        - button "Accept" [ref=e31] [cursor=pointer]:
          - generic [ref=e33]: Accept
        - button "Decline" [ref=e34] [cursor=pointer]:
          - generic [ref=e36]: Decline
    - contentinfo [ref=e37]:
      - generic [ref=e38]:
        - generic [ref=e39]:
          - img "decor" [ref=e40]
          - generic [ref=e41]: © 2026 Peace2074 · v3.3.27
        - navigation "Footer links" [ref=e42]:
          - link "About" [ref=e43] [cursor=pointer]:
            - /url: /about
          - link "Quran" [ref=e44] [cursor=pointer]:
            - /url: /quran
          - link "Terms and Conditions" [ref=e45] [cursor=pointer]:
            - /url: /terms
          - link "Privacy Policy" [ref=e46] [cursor=pointer]:
            - /url: /privacy
          - link "Contact" [ref=e47] [cursor=pointer]:
            - /url: /contact
          - link "Credits" [ref=e48] [cursor=pointer]:
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
> 34  |         await page.goto('/settings')
      |                    ^ Error: page.goto: Test timeout of 30000ms exceeded.
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
  134 |         expect(val).toBe('true')
```