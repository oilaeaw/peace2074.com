# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: quran-ayah-action-card.spec.ts >> Quran ayah action card >> stays available on desktop hover in mushaf layout
- Location: tests/quran-ayah-action-card.spec.ts:26:9

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:4000/quran/1/mushaf
Call log:
  - navigating to "http://127.0.0.1:4000/quran/1/mushaf", waiting until "load"

```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test'
  2  | 
  3  | const layoutReadyTimeoutMs = 30000
  4  | const hoverActionCardTimeoutMs = 5000
  5  | const USTORE_NAMESPACE = 'peace2074'
  6  | 
  7  | const ayahActionCardLayouts = [
  8  |     {
  9  |         mode: 'reader',
  10 |         readySelector: '.reader-layout',
  11 |     },
  12 |     {
  13 |         mode: 'mushaf',
  14 |         readySelector: '.mushaf-layout',
  15 |     },
  16 |     {
  17 |         mode: 'native',
  18 |         readySelector: '.native-layout',
  19 |     },
  20 | ] as const
  21 | 
  22 | test.describe('Quran ayah action card', () => {
  23 |     test.slow()
  24 | 
  25 |     for (const layout of ayahActionCardLayouts) {
  26 |         test(`stays available on desktop hover in ${layout.mode} layout`, async ({ page }) => {
  27 |             await page.addInitScript(() => {
  28 |                 localStorage.setItem(`${USTORE_NAMESPACE}:quran-reader-mode`, 'audio')
  29 |             })
  30 | 
> 31 |             await page.goto(`/quran/1/${layout.mode}`)
     |                        ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:4000/quran/1/mushaf
  32 |             await page.waitForURL(new RegExp(`/quran/1/${layout.mode}$`))
  33 | 
  34 |             const ayahTarget = page.getByTestId(`ayah-${layout.mode}-1`)
  35 |             await expect(page.locator(layout.readySelector)).toBeVisible({ timeout: layoutReadyTimeoutMs })
  36 |             await expect(ayahTarget).toBeVisible({ timeout: layoutReadyTimeoutMs })
  37 | 
  38 |             await ayahTarget.hover()
  39 | 
  40 |             const actionCard = page.getByTestId('ayah-action-card')
  41 |             await expect(actionCard).toBeVisible({ timeout: hoverActionCardTimeoutMs })
  42 |             await expect(actionCard).toHaveAttribute('data-verse', '1')
  43 |             await expect(actionCard).toHaveAttribute('data-recitation-source', 'audio')
  44 |             await expect(actionCard).toHaveAttribute('data-layout-mode', layout.mode)
  45 |         })
  46 |     }
  47 | })
```