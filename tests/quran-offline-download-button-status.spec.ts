import { test, expect } from '@playwright/test'

test('shows offline download progress and completion state on button with in-app notification', async ({
    page,
}) => {
    await page.route('https://everyayah.com/data/**', async (route) => {
        await new Promise((resolve) => setTimeout(resolve, 40))
        await route.fulfill({
            status: 200,
            headers: {
                'Content-Type': 'audio/mpeg',
            },
            body: Buffer.from([1, 2, 3, 4]),
        })
    })

    await page.addInitScript(async () => {
        localStorage.setItem('quran-reader-mode', 'audio')
        localStorage.setItem('quran-offline-recitation-quality', 'regular')

        await caches.delete('quran-audio-offline-regular-v1')
    })

    await page.goto('/quran/1/reader')
    await page.waitForURL(/\/quran\/1\/reader$/)

    const offlineButton = page.getByTestId('offline-recitation-manager-button')
    await expect(offlineButton).toBeVisible({ timeout: 15000 })
    await expect(offlineButton).toHaveAttribute('data-download-status', 'idle')

    await offlineButton.click()

    await page.getByRole('button', { name: /Download Current Sura/i }).click()

    await expect(offlineButton).toHaveAttribute('data-download-status', 'started')
    await expect(offlineButton).toHaveAttribute('data-download-percent', /\d+/)

    const managerNotice = page.getByTestId('offline-download-notification')
    await expect(managerNotice).toBeVisible({ timeout: 15000 })
    await expect(managerNotice).toContainText(/Download complete/i)

    await expect(offlineButton).toHaveAttribute('data-download-status', 'completed')
    await expect(offlineButton).toHaveAttribute('data-download-percent', '100')
    await expect(offlineButton).toContainText('✓')
})