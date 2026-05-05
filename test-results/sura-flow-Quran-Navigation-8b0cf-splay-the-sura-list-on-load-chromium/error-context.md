# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: sura-flow.spec.ts >> Quran Navigation and Search Flow >> should display the sura list on load
- Location: tests/sura-flow.spec.ts:8:5

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('a.sura-card').first()
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('a.sura-card').first()

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
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
        - generic [ref=e23] [cursor=pointer]:
          - generic [ref=e25]:
            - generic [ref=e26]: 🇺🇸
            - combobox "🇺🇸" [ref=e27]: 🇺🇸 English
          - generic [ref=e29]: arrow_drop_down
        - button "Login" [ref=e30] [cursor=pointer]:
          - img [ref=e32]: login
    - complementary [ref=e33]:
      - generic [ref=e34]:
        - generic [ref=e35]:
          - generic [ref=e36]: Peace2074
          - generic [ref=e37]: Navigation
          - generic [ref=e38]: Control drawer ordering and visibility.
        - separator [ref=e39]
        - list [ref=e40]:
          - listitem "Home" [ref=e41] [cursor=pointer]:
            - generic [ref=e44]: HO
            - generic [ref=e45]:
              - generic [ref=e46]: Home
              - generic [ref=e47]: /
            - button "Pin" [ref=e49]:
              - generic [ref=e51]: Pin
          - listitem "About" [ref=e52] [cursor=pointer]:
            - generic [ref=e55]: AB
            - generic [ref=e56]:
              - generic [ref=e57]: About
              - generic [ref=e58]: /about
            - button "Pin" [ref=e60]:
              - generic [ref=e62]: Pin
          - listitem "Quran" [ref=e63] [cursor=pointer]:
            - generic [ref=e66]: QU
            - generic [ref=e67]:
              - generic [ref=e68]: Quran
              - generic [ref=e69]: /quran
            - button "Pin" [ref=e71]:
              - generic [ref=e73]: Pin
          - listitem "Holy Names" [ref=e74] [cursor=pointer]:
            - generic [ref=e77]: HN
            - generic [ref=e78]:
              - generic [ref=e79]: Holy Names
              - generic [ref=e80]: /holynames
            - button "Pin" [ref=e82]:
              - generic [ref=e84]: Pin
          - listitem "Tasbeeh" [ref=e85] [cursor=pointer]:
            - generic [ref=e88]: TA
            - generic [ref=e89]:
              - generic [ref=e90]: Tasbeeh
              - generic [ref=e91]: /tasbeeh
            - button "Pin" [ref=e93]:
              - generic [ref=e95]: Pin
          - listitem "Miracles" [ref=e96] [cursor=pointer]:
            - generic [ref=e99]: MI
            - generic [ref=e100]:
              - generic [ref=e101]: Miracles
              - generic [ref=e102]: /miracles
            - button "Pin" [ref=e104]:
              - generic [ref=e106]: Pin
          - listitem "Chat" [ref=e107] [cursor=pointer]:
            - generic [ref=e110]: CH
            - generic [ref=e111]:
              - generic [ref=e112]: Chat
              - generic [ref=e113]: /chat
            - button "Pin" [ref=e115]:
              - generic [ref=e117]: Pin
          - listitem "Support" [ref=e118] [cursor=pointer]:
            - generic [ref=e121]: SU
            - generic [ref=e122]:
              - generic [ref=e123]: Support
              - generic [ref=e124]: /support
            - button "Pin" [ref=e126]:
              - generic [ref=e128]: Pin
          - listitem "Settings" [ref=e129] [cursor=pointer]:
            - generic [ref=e132]: SE
            - generic [ref=e133]:
              - generic [ref=e134]: Settings
              - generic [ref=e135]: /settings
            - button "Pin" [ref=e137]:
              - generic [ref=e139]: Pin
          - listitem "Preferences" [ref=e140] [cursor=pointer]:
            - generic [ref=e143]: PR
            - generic [ref=e144]:
              - generic [ref=e145]: Preferences
              - generic [ref=e146]: /preferences
            - button "Pin" [ref=e148]:
              - generic [ref=e150]: Pin
          - listitem "Admin Page" [ref=e151] [cursor=pointer]:
            - generic [ref=e154]: AP
            - generic [ref=e155]:
              - generic [ref=e156]: Admin Page
              - generic [ref=e157]: /admin
            - button "Pin" [ref=e159]:
              - generic [ref=e161]: Pin
          - listitem "Login" [ref=e162] [cursor=pointer]:
            - generic [ref=e165]: LO
            - generic [ref=e166]:
              - generic [ref=e167]: Login
              - generic [ref=e168]: /login
            - button "Pin" [ref=e170]:
              - generic [ref=e172]: Pin
          - listitem "Blog" [ref=e173] [cursor=pointer]:
            - generic [ref=e176]: BL
            - generic [ref=e177]:
              - generic [ref=e178]: Blog
              - generic [ref=e179]: /blog
            - button "Pin" [ref=e181]:
              - generic [ref=e183]: Pin
          - listitem "Deploys" [ref=e184] [cursor=pointer]:
            - generic [ref=e187]: DE
            - generic [ref=e188]:
              - generic [ref=e189]: Deploys
              - generic [ref=e190]: /deploys
            - button "Pin" [ref=e192]:
              - generic [ref=e194]: Pin
          - listitem "Contact" [ref=e195] [cursor=pointer]:
            - generic [ref=e198]: CO
            - generic [ref=e199]:
              - generic [ref=e200]: Contact
              - generic [ref=e201]: /contact
            - button "Pin" [ref=e203]:
              - generic [ref=e205]: Pin
    - main [ref=e207]:
      - heading "Quran" [level=1] [ref=e208]
      - generic [ref=e209]:
        - generic [ref=e211]:
          - generic [ref=e212]: auto_stories
          - generic [ref=e213]:
            - generic [ref=e214]: Track Your Quran Completion
            - generic [ref=e215]: 0 / 114 Surahs (0%)
            - progressbar [ref=e216]
        - generic [ref=e218]:
          - button "Continue Reading" [ref=e219] [cursor=pointer]:
            - generic [ref=e220]:
              - img [ref=e221]: play_arrow
              - generic [ref=e222]: Continue Reading
          - button "Reset Progress" [ref=e223] [cursor=pointer]:
            - generic [ref=e224]:
              - img [ref=e225]: restart_alt
              - generic [ref=e226]: Reset Progress
      - generic [ref=e227]: "Failed to fetch. Fallback failed: Failed to fetch"
      - generic [ref=e228]: If content doesn't load, ensure the server API /api/quran is running.
    - generic [ref=e230]:
      - button "AI Support" [ref=e231] [cursor=pointer]:
        - generic [ref=e232]:
          - img [ref=e233]: smart_toy
          - generic [ref=e234]: AI Support
      - button "close" [ref=e235] [cursor=pointer]:
        - img [ref=e237]: close
    - alert [ref=e238]:
      - generic [ref=e240]:
        - generic [ref=e241]: We use cookies to improve your experience and analyze site usage.
        - generic [ref=e242]: By clicking 'Accept', you consent to our use of cookies for analytics.
      - generic [ref=e243]:
        - button "Accept" [ref=e244] [cursor=pointer]:
          - generic [ref=e246]: Accept
        - button "Decline" [ref=e247] [cursor=pointer]:
          - generic [ref=e249]: Decline
    - contentinfo [ref=e250]:
      - generic [ref=e251]:
        - generic [ref=e252]:
          - img "decor" [ref=e253]
          - generic [ref=e254]: © 2026 Peace2074 · v3.1.3
        - navigation "Footer links" [ref=e255]:
          - link "About" [ref=e256] [cursor=pointer]:
            - /url: /about
          - link "Quran" [ref=e257] [cursor=pointer]:
            - /url: /quran
          - link "Terms and Conditions" [ref=e258] [cursor=pointer]:
            - /url: /terms
          - link "Privacy Policy" [ref=e259] [cursor=pointer]:
            - /url: /privacy
          - link "Contact" [ref=e260] [cursor=pointer]:
            - /url: /contact
  - alert [ref=e261]:
    - generic [ref=e263]:
      - img [ref=e264]: warning
      - generic [ref=e265]: "Failed to fetch. Fallback failed: Failed to fetch"
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Quran Navigation and Search Flow', () => {
  4  |     test.beforeEach(async ({ page }) => {
  5  |         await page.goto('/quran');
  6  |     });
  7  | 
  8  |     test('should display the sura list on load', async ({ page }) => {
  9  |         const suraCards = page.locator('a.sura-card');
> 10 |         await expect(suraCards.first()).toBeVisible();
     |                                         ^ Error: expect(locator).toBeVisible() failed
  11 |         await expect(suraCards).toHaveCount(114);
  12 |     });
  13 | 
  14 |     test('should show Al-Fatiha as the first sura card', async ({ page }) => {
  15 |         const firstCard = page.locator('a.sura-card').first();
  16 |         await expect(firstCard).toBeVisible();
  17 |         await expect(firstCard).toContainText(/The Opener|Fati/i);
  18 |     });
  19 | 
  20 |     test('should navigate to a sura and render Arabic text', async ({ page }) => {
  21 |         const firstCard = page.locator('a.sura-card').first();
  22 |         await expect(firstCard).toBeVisible();
  23 |         const href = await firstCard.getAttribute('href');
  24 |         expect(href).toBeTruthy();
  25 |         await page.goto(`${href}/reader`);
  26 | 
  27 |         await page.waitForURL(/\/quran\/\d+\/reader/);
  28 | 
  29 |         const arabicText = page.locator('.arabic-text').first();
  30 |         await expect(arabicText).toBeVisible();
  31 |         await expect(arabicText).toHaveText(/.+/, { timeout: 10000 });
  32 |     });
  33 | 
  34 |     test('should apply RTL direction when switching to Arabic locale', async ({ page }) => {
  35 |         await page.evaluate(() => {
  36 |             localStorage.setItem('app-locale', 'ar');
  37 |         });
  38 |         await page.reload();
  39 | 
  40 |         const html = page.locator('html');
  41 |         await expect(html).toHaveAttribute('dir', 'rtl');
  42 |         await expect(html).toHaveAttribute('lang', 'ar');
  43 |     });
  44 | 
  45 |     test('should render all 114 surah cards', async ({ page }) => {
  46 |         const suraCards = page.locator('a.sura-card');
  47 |         await expect(suraCards).toHaveCount(114);
  48 |         await expect(suraCards.nth(113)).toBeVisible();
  49 |     });
  50 | });
```