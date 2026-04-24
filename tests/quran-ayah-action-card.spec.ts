import { test, expect } from '@playwright/test'

const layoutReadyTimeoutMs = 30000
const hoverActionCardTimeoutMs = 5000
const USTORE_NAMESPACE = 'peace2074'

const ayahActionCardLayouts = [
    {
        mode: 'reader',
        readySelector: '.reader-layout',
    },
    {
        mode: 'mushaf',
        readySelector: '.mushaf-layout',
    },
    {
        mode: 'native',
        readySelector: '.native-layout',
    },
] as const

test.describe('Quran ayah action card', () => {
    test.slow()

    for (const layout of ayahActionCardLayouts) {
        test(`stays available on desktop hover in ${layout.mode} layout`, async ({ page }) => {
            await page.addInitScript(() => {
                localStorage.setItem(`${USTORE_NAMESPACE}:quran-reader-mode`, 'audio')
            })

            await page.goto(`/quran/1/${layout.mode}`)
            await page.waitForURL(new RegExp(`/quran/1/${layout.mode}$`))

            const ayahTarget = page.getByTestId(`ayah-${layout.mode}-1`)
            await expect(page.locator(layout.readySelector)).toBeVisible({ timeout: layoutReadyTimeoutMs })
            await expect(ayahTarget).toBeVisible({ timeout: layoutReadyTimeoutMs })

            await ayahTarget.hover()

            const actionCard = page.getByTestId('ayah-action-card')
            await expect(actionCard).toBeVisible({ timeout: hoverActionCardTimeoutMs })
            await expect(actionCard).toHaveAttribute('data-verse', '1')
            await expect(actionCard).toHaveAttribute('data-recitation-source', 'audio')
            await expect(actionCard).toHaveAttribute('data-layout-mode', layout.mode)
        })
    }
})