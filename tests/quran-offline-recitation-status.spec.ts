import { test, expect } from '@playwright/test'

test('prefers cached recitation and shows offline-ready status for a downloaded sura', async ({
    page,
}) => {
    let quranApiRequested = false
    let fallbackApiRequested = false

    await page.route('https://api.quran.com/api/v4/verses/by_chapter/1?**', async (route) => {
        quranApiRequested = true
        await route.fulfill({
            status: 500,
            body: 'unexpected network request',
        })
    })

    await page.route('https://api.alquran.cloud/v1/surah/1/ar.alafasy', async (route) => {
        fallbackApiRequested = true
        await route.fulfill({
            status: 500,
            body: 'unexpected fallback request',
        })
    })

    await page.addInitScript(async () => {
        const cache = await caches.open('quran-audio-offline-regular-v1')

        for (let verse = 1; verse <= 7; verse += 1) {
            const paddedVerse = String(verse).padStart(3, '0')
            const url = `https://everyayah.com/data/Alafasy_64kbps/001${paddedVerse}.mp3`

            await cache.put(
                url,
                new Response(new Uint8Array([1, 2, 3, 4]), {
                    headers: {
                        'Content-Type': 'audio/mpeg',
                    },
                })
            )
        }

        localStorage.setItem('quran-offline-recitation-quality', 'regular')
        localStorage.setItem('quran-reader-mode', 'audio')
    })

    await page.goto('/quran/1/reader')
    await page.waitForURL(/\/quran\/1\/reader$/)

    const offlineStatus = page.getByTestId('offline-recitation-status')
    await expect(offlineStatus).toBeVisible({ timeout: 15000 })
    await expect(offlineStatus).toHaveAttribute('data-offline-ready', 'true')

    expect(
        quranApiRequested,
        'downloaded recitation should be preferred over the quran.com API'
    ).toBe(false)
    expect(
        fallbackApiRequested,
        'downloaded recitation should be preferred over the fallback API'
    ).toBe(false)
})