# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth-flow.spec.ts >> authentication smoke flow >> local signup, login, and logout succeeds
- Location: tests/auth-flow.spec.ts:54:5

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected pattern: /\/login$/
Received string:  "http://127.0.0.1:4000/signup"
Timeout: 5000ms

Call log:
  - Expect "toHaveURL" with timeout 5000ms
    8 × unexpected value "http://127.0.0.1:4000/signup"

```

# Page snapshot

```yaml
- generic [ref=e5]:
  - banner [ref=e6]:
    - toolbar [ref=e7]:
      - button "Toggle menu" [ref=e8] [cursor=pointer]:
        - img [ref=e10]: menu
      - img "PEACE2074" [ref=e13]
      - link "Peace2074" [ref=e15] [cursor=pointer]:
        - /url: /
      - button "Search…" [ref=e16] [cursor=pointer]:
        - img [ref=e18]: search
      - button "Play Athan" [ref=e19] [cursor=pointer]:
        - img [ref=e21]: volume_up
      - generic [ref=e24] [cursor=pointer]:
        - generic [ref=e26]:
          - generic [ref=e27]: 🇺🇸
          - combobox "🇺🇸" [ref=e28]: 🇺🇸 English
        - generic [ref=e30]: arrow_drop_down
      - button "Login" [ref=e31] [cursor=pointer]:
        - img [ref=e33]: login
  - complementary [ref=e34]:
    - generic [ref=e35]:
      - generic [ref=e36]:
        - generic [ref=e37]: Peace2074
        - generic [ref=e38]: Navigation
        - generic [ref=e39]: Control drawer ordering and visibility.
      - separator [ref=e40]
      - list [ref=e41]:
        - listitem "Home" [ref=e42] [cursor=pointer]:
          - generic [ref=e45]: HO
          - generic [ref=e46]:
            - generic [ref=e47]: Home
            - generic [ref=e48]: /
          - button "Pin" [ref=e50]:
            - generic [ref=e52]: Pin
        - listitem "About" [ref=e53] [cursor=pointer]:
          - generic [ref=e56]: AB
          - generic [ref=e57]:
            - generic [ref=e58]: About
            - generic [ref=e59]: /about
          - button "Pin" [ref=e61]:
            - generic [ref=e63]: Pin
        - listitem "Quran" [ref=e64] [cursor=pointer]:
          - generic [ref=e67]: QU
          - generic [ref=e68]:
            - generic [ref=e69]: Quran
            - generic [ref=e70]: /quran
          - button "Pin" [ref=e72]:
            - generic [ref=e74]: Pin
        - listitem "Holy Names" [ref=e75] [cursor=pointer]:
          - generic [ref=e78]: HN
          - generic [ref=e79]:
            - generic [ref=e80]: Holy Names
            - generic [ref=e81]: /holynames
          - button "Pin" [ref=e83]:
            - generic [ref=e85]: Pin
        - listitem "Tasbeeh" [ref=e86] [cursor=pointer]:
          - generic [ref=e89]: TA
          - generic [ref=e90]:
            - generic [ref=e91]: Tasbeeh
            - generic [ref=e92]: /tasbeeh
          - button "Pin" [ref=e94]:
            - generic [ref=e96]: Pin
        - listitem "Miracles" [ref=e97] [cursor=pointer]:
          - generic [ref=e100]: MI
          - generic [ref=e101]:
            - generic [ref=e102]: Miracles
            - generic [ref=e103]: /miracles
          - button "Pin" [ref=e105]:
            - generic [ref=e107]: Pin
        - listitem "Chat" [ref=e108] [cursor=pointer]:
          - generic [ref=e111]: CH
          - generic [ref=e112]:
            - generic [ref=e113]: Chat
            - generic [ref=e114]: /chat
          - button "Pin" [ref=e116]:
            - generic [ref=e118]: Pin
        - listitem "Support" [ref=e119] [cursor=pointer]:
          - generic [ref=e122]: SU
          - generic [ref=e123]:
            - generic [ref=e124]: Support
            - generic [ref=e125]: /support
          - button "Pin" [ref=e127]:
            - generic [ref=e129]: Pin
        - listitem "Settings" [ref=e130] [cursor=pointer]:
          - generic [ref=e133]: SE
          - generic [ref=e134]:
            - generic [ref=e135]: Settings
            - generic [ref=e136]: /settings
          - button "Pin" [ref=e138]:
            - generic [ref=e140]: Pin
        - listitem "Preferences" [ref=e141] [cursor=pointer]:
          - generic [ref=e144]: PR
          - generic [ref=e145]:
            - generic [ref=e146]: Preferences
            - generic [ref=e147]: /preferences
          - button "Pin" [ref=e149]:
            - generic [ref=e151]: Pin
        - listitem "Admin Page" [ref=e152] [cursor=pointer]:
          - generic [ref=e155]: AP
          - generic [ref=e156]:
            - generic [ref=e157]: Admin Page
            - generic [ref=e158]: /admin
          - button "Pin" [ref=e160]:
            - generic [ref=e162]: Pin
        - listitem "Login" [ref=e163] [cursor=pointer]:
          - generic [ref=e166]: LO
          - generic [ref=e167]:
            - generic [ref=e168]: Login
            - generic [ref=e169]: /login
          - button "Pin" [ref=e171]:
            - generic [ref=e173]: Pin
        - listitem "Blog" [ref=e174] [cursor=pointer]:
          - generic [ref=e177]: BL
          - generic [ref=e178]:
            - generic [ref=e179]: Blog
            - generic [ref=e180]: /blog
          - button "Pin" [ref=e182]:
            - generic [ref=e184]: Pin
        - listitem "Deploys" [ref=e185] [cursor=pointer]:
          - generic [ref=e188]: DE
          - generic [ref=e189]:
            - generic [ref=e190]: Deploys
            - generic [ref=e191]: /deploys
          - button "Pin" [ref=e193]:
            - generic [ref=e195]: Pin
        - listitem "Contact" [ref=e196] [cursor=pointer]:
          - generic [ref=e199]: CO
          - generic [ref=e200]:
            - generic [ref=e201]: Contact
            - generic [ref=e202]: /contact
          - button "Pin" [ref=e204]:
            - generic [ref=e206]: Pin
  - generic [ref=e213]:
    - generic [ref=e214]:
      - generic [ref=e216]: mosque
      - generic [ref=e217]: Peace2074
      - generic [ref=e218]: Create your account
    - generic [ref=e220]:
      - generic [ref=e222]:
        - generic:
          - generic:
            - generic: person
          - generic:
            - generic: Username
            - textbox "Username" [disabled]:
              - /placeholder: Enter your username
              - text: e2e_1778016396296-s4f6pm
      - generic [ref=e225]:
        - generic:
          - generic:
            - generic: email
          - generic:
            - generic: Email
            - textbox "Email" [disabled]:
              - /placeholder: Enter your email
              - text: e2e_1778016396296-s4f6pm@example.com
      - generic [ref=e228]:
        - generic:
          - generic:
            - generic: lock
          - generic:
            - generic: Password
            - textbox "Password" [disabled]:
              - /placeholder: Enter your password
              - text: Auth_1778016396296-s4f6pm!42
          - generic:
            - generic: visibility
      - generic [ref=e231]:
        - generic:
          - generic:
            - generic: lock
          - generic:
            - generic: Confirm Password
            - textbox "Confirm Password" [disabled]:
              - /placeholder: Confirm password
              - text: Auth_1778016396296-s4f6pm!42
          - generic:
            - generic: visibility
      - checkbox "I accept the terms and conditions" [checked] [ref=e233] [cursor=pointer]:
        - img [ref=e236]
      - generic [ref=e238]:
        - generic [ref=e239]: I accept the
        - link "terms and conditions" [ref=e240] [cursor=pointer]:
          - /url: /terms
      - button "Sign Up" [ref=e241]:
        - generic:
          - generic: Sign Up
        - img [ref=e243]
      - generic [ref=e247]:
        - text: Already have an account?
        - link "Sign In" [ref=e248] [cursor=pointer]:
          - /url: /login
          - generic [ref=e250]: Sign In
  - generic [ref=e252]:
    - button "AI Support" [ref=e253] [cursor=pointer]:
      - generic [ref=e254]:
        - img [ref=e255]: smart_toy
        - generic [ref=e256]: AI Support
    - button "close" [ref=e257] [cursor=pointer]:
      - img [ref=e259]: close
  - contentinfo [ref=e260]:
    - generic [ref=e261]:
      - generic [ref=e262]:
        - img "decor" [ref=e263]
        - generic [ref=e264]: © 2026 Peace2074 · v3.1.3
      - navigation "Footer links" [ref=e265]:
        - link "About" [ref=e266] [cursor=pointer]:
          - /url: /about
        - link "Quran" [ref=e267] [cursor=pointer]:
          - /url: /quran
        - link "Terms and Conditions" [ref=e268] [cursor=pointer]:
          - /url: /terms
        - link "Privacy Policy" [ref=e269] [cursor=pointer]:
          - /url: /privacy
        - link "Contact" [ref=e270] [cursor=pointer]:
          - /url: /contact
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test'
  2   | 
  3   | test.describe('authentication smoke flow', () => {
  4   |     async function dismissCookieBanner(page: Parameters<typeof test>[0]['page']) {
  5   |         await page
  6   |             .getByRole('button', { name: /^accept$/i })
  7   |             .click({ timeout: 3000 })
  8   |             .catch(() => { })
  9   |     }
  10  | 
  11  |     async function submitAuthForm(page: Parameters<typeof test>[0]['page']) {
  12  |         await page.locator('form.q-form').evaluate((form: HTMLFormElement) => {
  13  |             form.requestSubmit()
  14  |         })
  15  |     }
  16  | 
  17  |     async function scrollToTop(page: Parameters<typeof test>[0]['page']) {
  18  |         await page.evaluate(() => {
  19  |             window.scrollTo(0, 0)
  20  |         })
  21  |     }
  22  | 
  23  |     test.beforeEach(async ({ page }) => {
  24  |         await page.addInitScript(() => {
  25  |             try {
  26  |                 Object.defineProperty(window, 'isSecureContext', {
  27  |                     configurable: true,
  28  |                     get: () => false,
  29  |                 })
  30  |             } catch {
  31  |                 // noop
  32  |             }
  33  | 
  34  |             try {
  35  |                 Object.defineProperty(window, 'PublicKeyCredential', {
  36  |                     configurable: true,
  37  |                     value: undefined,
  38  |                 })
  39  |             } catch {
  40  |                 // noop
  41  |             }
  42  | 
  43  |             try {
  44  |                 Object.defineProperty(navigator, 'credentials', {
  45  |                     configurable: true,
  46  |                     value: undefined,
  47  |                 })
  48  |             } catch {
  49  |                 // noop
  50  |             }
  51  |         })
  52  |     })
  53  | 
  54  |     test('local signup, login, and logout succeeds', async ({ page }) => {
  55  |         const uniqueId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  56  |         const username = `e2e_${uniqueId}`
  57  |         const email = `${username}@example.com`
  58  |         const password = `Auth_${uniqueId}!42`
  59  | 
  60  |         await page.goto('/signup')
  61  |         await expect(page).toHaveURL(/\/signup$/)
  62  |         await dismissCookieBanner(page)
  63  | 
  64  |         await page.getByRole('textbox', { name: /^username$/i }).fill(username)
  65  |         await page.getByRole('textbox', { name: /^email$/i }).fill(email)
  66  |         await page.getByLabel(/^password$/i).fill(password)
  67  |         await page.getByLabel(/^confirm password$/i).fill(password)
  68  |         await page
  69  |             .getByRole('checkbox', { name: /i accept the terms and conditions/i })
  70  |             .click()
  71  |         await expect(page.getByRole('button', { name: /^sign up$/i })).toBeEnabled()
  72  |         await submitAuthForm(page)
> 73  |         await expect(page).toHaveURL(/\/login$/)
      |                            ^ Error: expect(page).toHaveURL(expected) failed
  74  | 
  75  |         await dismissCookieBanner(page)
  76  | 
  77  |         await page.getByRole('textbox', { name: /^username$/i }).fill(username)
  78  |         await page.getByLabel(/^password$/i).fill(password)
  79  |         await expect(page.getByRole('button', { name: /^sign in$/i })).toBeEnabled()
  80  |         await submitAuthForm(page)
  81  |         await expect(page).toHaveURL(/\/$/)
  82  | 
  83  |         await page
  84  |             .getByRole('button', { name: /^cancel$/i })
  85  |             .click({ timeout: 3000 })
  86  |             .catch(() => { })
  87  | 
  88  |         const accountMenuButton = page.getByRole('button', { name: /profile/i })
  89  |         await expect(accountMenuButton).toBeVisible()
  90  | 
  91  |         await page.reload()
  92  |         await dismissCookieBanner(page)
  93  |         await scrollToTop(page)
  94  |         await expect(accountMenuButton).toBeVisible()
  95  | 
  96  |         await accountMenuButton.click()
  97  |         const logoutItem = page.getByText(/^sign out$/i)
  98  |         await expect(logoutItem).toBeVisible()
  99  |         await logoutItem.click()
  100 | 
  101 |         const loggedOutMenuButton = page.getByRole('button', { name: /^login$/i })
  102 |         await expect(loggedOutMenuButton).toBeVisible()
  103 |     })
  104 | })
```