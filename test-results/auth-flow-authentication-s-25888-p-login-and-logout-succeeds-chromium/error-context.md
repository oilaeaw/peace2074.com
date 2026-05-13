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
- generic [ref=e1]:
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
            - generic [ref=e44]: home
            - generic [ref=e45]:
              - generic [ref=e46]: Home
              - generic [ref=e47]: /
            - button "Pin" [ref=e49]:
              - generic [ref=e51]: Pin
          - listitem "About" [ref=e52] [cursor=pointer]:
            - generic [ref=e54]: info
            - generic [ref=e55]:
              - generic [ref=e56]: About
              - generic [ref=e57]: /about
            - button "Pin" [ref=e59]:
              - generic [ref=e61]: Pin
          - listitem "Quran" [ref=e62] [cursor=pointer]:
            - generic [ref=e64]: menu_book
            - generic [ref=e65]:
              - generic [ref=e66]: Quran
              - generic [ref=e67]: /quran
            - button "Pin" [ref=e69]:
              - generic [ref=e71]: Pin
          - listitem "Holy Names" [ref=e72] [cursor=pointer]:
            - generic [ref=e74]: auto_awesome
            - generic [ref=e75]:
              - generic [ref=e76]: Holy Names
              - generic [ref=e77]: /holynames
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
          - listitem "Admin Page" [ref=e132] [cursor=pointer]:
            - generic [ref=e134]: admin_panel_settings
            - generic [ref=e135]:
              - generic [ref=e136]: Admin Page
              - generic [ref=e137]: /admin
            - button "Pin" [ref=e139]:
              - generic [ref=e141]: Pin
          - listitem "Login" [ref=e142] [cursor=pointer]:
            - generic [ref=e144]: login
            - generic [ref=e145]:
              - generic [ref=e146]: Login
              - generic [ref=e147]: /login
            - button "Pin" [ref=e149]:
              - generic [ref=e151]: Pin
          - listitem "Blog" [ref=e152] [cursor=pointer]:
            - generic [ref=e154]: article
            - generic [ref=e155]:
              - generic [ref=e156]: Blog
              - generic [ref=e157]: /blog
            - button "Pin" [ref=e159]:
              - generic [ref=e161]: Pin
          - listitem "Deploys" [ref=e162] [cursor=pointer]:
            - generic [ref=e164]: rocket_launch
            - generic [ref=e165]:
              - generic [ref=e166]: Deploys
              - generic [ref=e167]: /deploys
            - button "Pin" [ref=e169]:
              - generic [ref=e171]: Pin
          - listitem "Contact" [ref=e172] [cursor=pointer]:
            - generic [ref=e174]: contact_mail
            - generic [ref=e175]:
              - generic [ref=e176]: Contact
              - generic [ref=e177]: /contact
            - button "Pin" [ref=e179]:
              - generic [ref=e181]: Pin
    - generic [ref=e188]:
      - generic [ref=e189]:
        - generic [ref=e191]: mosque
        - generic [ref=e192]: Peace2074
        - generic [ref=e193]: Create your account
      - generic [ref=e195]:
        - generic [ref=e198]:
          - generic [ref=e200]: person
          - generic [ref=e201]:
            - generic: Username
            - textbox "Username" [ref=e202]:
              - /placeholder: Enter your username
              - text: e2e_1778669070072-fqww4r
        - generic [ref=e206]:
          - generic [ref=e208]: email
          - generic [ref=e209]:
            - generic: Email
            - textbox "Email" [ref=e210]:
              - /placeholder: Enter your email
              - text: e2e_1778669070072-fqww4r@example.com
        - generic [ref=e214]:
          - generic [ref=e216]: lock
          - generic [ref=e217]:
            - generic: Password
            - textbox "Password" [ref=e218]:
              - /placeholder: Enter your password
              - text: Auth_1778669070072-fqww4r!42
          - generic [ref=e220] [cursor=pointer]: visibility
        - generic [ref=e224]:
          - generic [ref=e226]: lock
          - generic [ref=e227]:
            - generic: Confirm Password
            - textbox "Confirm Password" [ref=e228]:
              - /placeholder: Confirm password
              - text: Auth_1778669070072-fqww4r!42
          - generic [ref=e230] [cursor=pointer]: visibility
        - checkbox "I accept the terms and conditions" [checked] [ref=e232] [cursor=pointer]:
          - img [ref=e235]
        - generic [ref=e237]:
          - generic [ref=e238]: I accept the
          - link "terms and conditions" [ref=e239] [cursor=pointer]:
            - /url: /terms
        - button "Sign Up" [ref=e240] [cursor=pointer]:
          - generic [ref=e242]: Sign Up
        - generic [ref=e243]:
          - text: Already have an account?
          - link "Sign In" [ref=e244] [cursor=pointer]:
            - /url: /login
            - generic [ref=e246]: Sign In
    - contentinfo [ref=e247]:
      - generic [ref=e248]:
        - generic [ref=e249]:
          - img "decor" [ref=e250]
          - generic [ref=e251]: © 2026 Peace2074 · v3.1.4
        - navigation "Footer links" [ref=e252]:
          - link "About" [ref=e253] [cursor=pointer]:
            - /url: /about
          - link "Quran" [ref=e254] [cursor=pointer]:
            - /url: /quran
          - link "Terms and Conditions" [ref=e255] [cursor=pointer]:
            - /url: /terms
          - link "Privacy Policy" [ref=e256] [cursor=pointer]:
            - /url: /privacy
          - link "Contact" [ref=e257] [cursor=pointer]:
            - /url: /contact
  - alert [ref=e258]:
    - generic [ref=e260]:
      - img [ref=e261]: check_circle
      - generic [ref=e262]: Account created successfully! Please login.
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