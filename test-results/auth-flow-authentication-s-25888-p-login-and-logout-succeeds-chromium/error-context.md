# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth-flow.spec.ts >> authentication smoke flow >> local signup, login, and logout succeeds
- Location: tests/auth-flow.spec.ts:54:5

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.waitForURL: Test timeout of 30000ms exceeded.
=========================== logs ===========================
waiting for navigation until "load"
============================================================
```

# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [ref=e3]:
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
          - button "Login" [ref=e22] [cursor=pointer]:
            - img [ref=e24]: login
      - generic [ref=e31]:
        - generic [ref=e32]:
          - generic [ref=e34]: mosque
          - generic [ref=e35]: Peace2074
          - generic [ref=e36]: Create your account
        - generic [ref=e38]:
          - generic [ref=e41]:
            - generic [ref=e43]: person
            - generic [ref=e44]:
              - generic: Username
              - textbox "Username" [ref=e45]:
                - /placeholder: Enter your username
                - text: e2e_1788100675476-elgze6
          - generic [ref=e49]:
            - generic [ref=e51]: email
            - generic [ref=e52]:
              - generic: Email
              - textbox "Email" [ref=e53]:
                - /placeholder: Enter your email
                - text: e2e_1788100675476-elgze6@example.com
          - generic [ref=e57]:
            - generic [ref=e59]: lock
            - generic [ref=e60]:
              - generic: Password
              - textbox "Password" [ref=e61]:
                - /placeholder: Enter your password
                - text: Auth_1788100675476-elgze6!42
            - generic [ref=e63] [cursor=pointer]: visibility
          - generic [ref=e67]:
            - generic [ref=e69]: lock
            - generic [ref=e70]:
              - generic: Confirm Password
              - textbox "Confirm Password" [ref=e71]:
                - /placeholder: Confirm password
                - text: Auth_1788100675476-elgze6!42
            - generic [ref=e73] [cursor=pointer]: visibility
          - checkbox "I accept the terms and conditions" [checked] [ref=e75] [cursor=pointer]:
            - img [ref=e78]
          - generic [ref=e80]:
            - generic [ref=e81]: I accept the
            - link "terms and conditions" [ref=e82] [cursor=pointer]:
              - /url: /terms
          - button "Sign Up" [ref=e83] [cursor=pointer]:
            - generic [ref=e85]: Sign Up
          - generic [ref=e86]:
            - text: Already have an account?
            - link "Sign In" [ref=e87] [cursor=pointer]:
              - /url: /login
              - generic [ref=e89]: Sign In
      - contentinfo [ref=e90]:
        - generic [ref=e91]:
          - generic [ref=e92]:
            - img "decor" [ref=e93]
            - generic [ref=e94]: © 2026 Peace2074 · v3.3.27
          - navigation "Footer links" [ref=e95]:
            - link "About" [ref=e96] [cursor=pointer]:
              - /url: /about
            - link "Quran" [ref=e97] [cursor=pointer]:
              - /url: /quran
            - link "Terms and Conditions" [ref=e98] [cursor=pointer]:
              - /url: /terms
            - link "Privacy Policy" [ref=e99] [cursor=pointer]:
              - /url: /privacy
            - link "Contact" [ref=e100] [cursor=pointer]:
              - /url: /contact
            - link "Credits" [ref=e101] [cursor=pointer]:
              - /url: /credits
    - generic: God bless my mom
  - alert [ref=e102]:
    - generic [ref=e104]:
      - img [ref=e105]: warning
      - generic [ref=e106]: Signup failed. Please try again.
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
> 73  |         await page.waitForURL(/\/login$/, { timeout: 15000 })
      |                    ^ Error: page.waitForURL: Test timeout of 30000ms exceeded.
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