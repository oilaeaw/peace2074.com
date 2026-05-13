# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth-flow.spec.ts >> authentication smoke flow >> local signup, login, and logout succeeds
- Location: tests/auth-flow.spec.ts:54:5

# Error details

```
TimeoutError: locator.fill: Timeout 10000ms exceeded.
Call log:
  - waiting for getByRole('textbox', { name: /^username$/i })

```

# Page snapshot

```yaml
- generic [ref=e2]:
  - generic [ref=e4]: Peace2074
  - generic [ref=e5]: Loading...
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
> 64  |         await page.getByRole('textbox', { name: /^username$/i }).fill(username)
      |                                                                  ^ TimeoutError: locator.fill: Timeout 10000ms exceeded.
  65  |         await page.getByRole('textbox', { name: /^email$/i }).fill(email)
  66  |         await page.getByLabel(/^password$/i).fill(password)
  67  |         await page.getByLabel(/^confirm password$/i).fill(password)
  68  |         await page
  69  |             .getByRole('checkbox', { name: /i accept the terms and conditions/i })
  70  |             .click()
  71  |         await expect(page.getByRole('button', { name: /^sign up$/i })).toBeEnabled()
  72  |         await submitAuthForm(page)
  73  |         await expect(page).toHaveURL(/\/login$/)
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