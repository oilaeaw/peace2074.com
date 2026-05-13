# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: quran-offline-download-button-status.spec.ts >> shows offline download progress and completion state on button with in-app notification
- Location: tests/quran-offline-download-button-status.spec.ts:3:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByTestId('offline-recitation-manager-button')
Expected: visible
Timeout: 15000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 15000ms
  - waiting for getByTestId('offline-recitation-manager-button')

```

# Page snapshot

```yaml
- generic [ref=e2]:
  - generic [ref=e4]: Peace2074
  - generic [ref=e5]: Loading...
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test'
  2  | 
  3  | test('shows offline download progress and completion state on button with in-app notification', async ({
  4  |     page,
  5  | }) => {
  6  |     await page.route('https://everyayah.com/data/**', async (route) => {
  7  |         await new Promise((resolve) => setTimeout(resolve, 40))
  8  |         await route.fulfill({
  9  |             status: 200,
  10 |             headers: {
  11 |                 'Content-Type': 'audio/mpeg',
  12 |             },
  13 |             body: Buffer.from([1, 2, 3, 4]),
  14 |         })
  15 |     })
  16 | 
  17 |     await page.addInitScript(async () => {
  18 |         localStorage.setItem('quran-reader-mode', 'audio')
  19 |         localStorage.setItem('quran-offline-recitation-quality', 'regular')
  20 | 
  21 |         await caches.delete('quran-audio-offline-regular-v1')
  22 |     })
  23 | 
  24 |     await page.goto('/quran/1/reader')
  25 |     await page.waitForURL(/\/quran\/1\/reader$/)
  26 | 
  27 |     const offlineButton = page.getByTestId('offline-recitation-manager-button')
> 28 |     await expect(offlineButton).toBeVisible({ timeout: 15000 })
     |                                 ^ Error: expect(locator).toBeVisible() failed
  29 |     await expect(offlineButton).toHaveAttribute('data-download-status', 'idle')
  30 | 
  31 |     await offlineButton.click()
  32 | 
  33 |     await page.getByRole('button', { name: /Download Current Sura/i }).click()
  34 | 
  35 |     await expect(offlineButton).toHaveAttribute('data-download-status', 'started')
  36 |     await expect(offlineButton).toHaveAttribute('data-download-percent', /\d+/)
  37 | 
  38 |     const managerNotice = page.getByTestId('offline-download-notification')
  39 |     await expect(managerNotice).toBeVisible({ timeout: 15000 })
  40 |     await expect(managerNotice).toContainText(/Download complete/i)
  41 | 
  42 |     await expect(offlineButton).toHaveAttribute('data-download-status', 'completed')
  43 |     await expect(offlineButton).toHaveAttribute('data-download-percent', '100')
  44 |     await expect(offlineButton).toContainText('✓')
  45 | })
```