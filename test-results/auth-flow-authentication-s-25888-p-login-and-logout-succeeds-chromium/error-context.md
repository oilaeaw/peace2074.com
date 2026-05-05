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
    9 × unexpected value "http://127.0.0.1:4000/signup"

```

# Page snapshot

```yaml
- generic [ref=e1]:
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
    - generic [ref=e212]:
      - generic [ref=e213]:
        - generic [ref=e215]: mosque
        - generic [ref=e216]: Peace2074
        - generic [ref=e217]: Create your account
      - generic [ref=e219]:
        - generic [ref=e222]:
          - generic [ref=e224]: person
          - generic [ref=e225]:
            - generic: Username
            - textbox "Username" [ref=e226]:
              - /placeholder: Enter your username
              - text: e2e_1778014082003-8i19qc
        - generic [ref=e230]:
          - generic [ref=e232]: email
          - generic [ref=e233]:
            - generic: Email
            - textbox "Email" [ref=e234]:
              - /placeholder: Enter your email
              - text: e2e_1778014082003-8i19qc@example.com
        - generic [ref=e238]:
          - generic [ref=e240]: lock
          - generic [ref=e241]:
            - generic: Password
            - textbox "Password" [ref=e242]:
              - /placeholder: Enter your password
              - text: Auth_1778014082003-8i19qc!42
          - generic [ref=e244] [cursor=pointer]: visibility
        - generic [ref=e248]:
          - generic [ref=e250]: lock
          - generic [ref=e251]:
            - generic: Confirm Password
            - textbox "Confirm Password" [ref=e252]:
              - /placeholder: Confirm password
              - text: Auth_1778014082003-8i19qc!42
          - generic [ref=e254] [cursor=pointer]: visibility
        - checkbox "I accept the terms and conditions" [checked] [ref=e256] [cursor=pointer]:
          - img [ref=e259]
        - generic [ref=e261]:
          - generic [ref=e262]: I accept the
          - link "terms and conditions" [ref=e263] [cursor=pointer]:
            - /url: /terms
        - button "Sign Up" [ref=e264] [cursor=pointer]:
          - generic [ref=e266]: Sign Up
        - generic [ref=e267]:
          - text: Already have an account?
          - link "Sign In" [ref=e268] [cursor=pointer]:
            - /url: /login
            - generic [ref=e270]: Sign In
    - generic [ref=e272]:
      - button "AI Support" [ref=e273] [cursor=pointer]:
        - generic [ref=e274]:
          - img [ref=e275]: smart_toy
          - generic [ref=e276]: AI Support
      - button "close" [ref=e277] [cursor=pointer]:
        - img [ref=e279]: close
    - contentinfo [ref=e280]:
      - generic [ref=e281]:
        - generic [ref=e282]:
          - img "decor" [ref=e283]
          - generic [ref=e284]: © 2026 Peace2074 · v3.1.3
        - navigation "Footer links" [ref=e285]:
          - link "About" [ref=e286] [cursor=pointer]:
            - /url: /about
          - link "Quran" [ref=e287] [cursor=pointer]:
            - /url: /quran
          - link "Terms and Conditions" [ref=e288] [cursor=pointer]:
            - /url: /terms
          - link "Privacy Policy" [ref=e289] [cursor=pointer]:
            - /url: /privacy
          - link "Contact" [ref=e290] [cursor=pointer]:
            - /url: /contact
  - alert [ref=e291]:
    - generic [ref=e293]:
      - img [ref=e294]: warning
      - generic [ref=e295]: Unable to reach the server. Please check your connection and try again.
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