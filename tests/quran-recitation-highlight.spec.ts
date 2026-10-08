import { test, expect } from '@playwright/test'

const acceptConsent = async (page: any) => {
  await page
    .getByRole('button', { name: /^accept$/i })
    .click({ timeout: 2000 })
    .catch(() => {})
}

const startRecitation = async (page: any) => {
  const toggle = page.locator('.paused-indicator-banner .q-toggle')
  await expect(toggle).toBeVisible({ timeout: 20000 })
  // Wait until audio is loaded and toggle is enabled
  await expect(toggle).not.toHaveClass(/disabled/, { timeout: 30000 })

  const isChecked = await toggle.getAttribute('aria-checked')
  console.log('[TEST startRecitation isChecked]', isChecked)
  if (isChecked !== 'true') {
    await toggle.click()
    // Verify recitation successfully started
    await expect(toggle).toHaveAttribute('aria-checked', 'true', {
      timeout: 15000,
    })
  } else {
    console.log('[TEST startRecitation isChecked ALREADY TRUE]')
  }
}

const stopRecitation = async (page: any) => {
  const toggle = page.locator('.paused-indicator-banner .q-toggle')
  if (await toggle.isVisible().catch(() => false)) {
    const isChecked = await toggle
      .getAttribute('aria-checked')
      .catch(() => 'false')
    if (isChecked === 'true') {
      await toggle.click().catch(() => {})
      await expect(toggle)
        .toHaveAttribute('aria-checked', 'false', { timeout: 5000 })
        .catch(() => {})
    }
  }
}

test.describe('Quran recitation highlight iteration and settings', () => {
  test.beforeEach(async ({ page }) => {
    page.on('console', (msg) => {
      console.log(`[BROWSER ${msg.type()}]:`, msg.text())
    })
    page.on('pageerror', (err) => {
      console.log(`[PAGE ERROR]:`, err.message)
    })
    await page.addInitScript(() => {
      localStorage.setItem('user-consented', 'true')
      localStorage.setItem('consent-version', '1.0')
    })
  })

  test.afterEach(async ({ page }) => {
    await stopRecitation(page)
  })

  test('word highlight mode iterates through words sequentially during recitation', async ({
    page,
  }) => {
    await page.goto('/quran/1/reader?highlight=word')
    await acceptConsent(page)
    await page.waitForSelector('.arabic-text', { timeout: 15000 })

    await startRecitation(page)

    // Observe word highlight progress
    const observedWords: string[] = []
    const startTime = Date.now()

    while (Date.now() - startTime < 8000) {
      const currentWordId = await page.evaluate(() => {
        const el = document.querySelector('.is-current-word')
        return el ? el.id : null
      })
      if (
        currentWordId &&
        (observedWords.length === 0 ||
          observedWords[observedWords.length - 1] !== currentWordId)
      ) {
        observedWords.push(currentWordId)
      }
      if (observedWords.length >= 4) {
        break
      }
      await page.waitForTimeout(100)
    }

    // Must have iterated through multiple words of Ayah 1
    expect(observedWords.length).toBeGreaterThanOrEqual(2)
    expect(observedWords[0]).toBe('word-1-0')
    expect(observedWords).toContain('word-1-1')
  })

  test('sentence highlight mode highlights the whole ayah without highlighting individual words', async ({
    page,
  }) => {
    await page.goto('/quran/1/reader?highlight=ayah')
    await acceptConsent(page)
    await page.waitForSelector('.arabic-text', { timeout: 15000 })

    await startRecitation(page)

    // Wait for playback to begin and highlight active ayah
    await expect(page.locator('.verse-row.is-current-ayah')).toBeVisible({
      timeout: 10000,
    })

    // Individual words should NOT have .is-current-word in sentence mode
    const currentWordCount = await page.locator('.is-current-word').count()
    expect(currentWordCount).toBe(0)
  })

  test('word highlight mode works in mushaf and native layout modes', async ({
    page,
  }) => {
    // Test mushaf layout
    await page.goto('/quran/1/mushaf?highlight=word')
    await acceptConsent(page)
    await page.waitForSelector('.mushaf-page', { timeout: 15000 })

    await startRecitation(page)

    await expect(
      page.locator('.mushaf-layout .is-current-word').first()
    ).toBeVisible({ timeout: 10000 })

    const mushafWordId = await page
      .locator('.mushaf-layout .is-current-word')
      .first()
      .getAttribute('id')
    expect(mushafWordId).toMatch(/^word-mushaf-1-/)

    await stopRecitation(page)
    await page.waitForTimeout(500)

    // Test native layout
    await page.goto('/quran/1/native?highlight=word')
    await acceptConsent(page)
    await page.waitForSelector('.native-layout', { timeout: 15000 })

    await startRecitation(page)

    await expect(
      page.locator('.native-layout .is-current-word').first()
    ).toBeVisible({ timeout: 10000 })

    const nativeWordId = await page
      .locator('.native-layout .is-current-word')
      .first()
      .getAttribute('id')
    expect(nativeWordId).toMatch(/^word-native-1-/)
  })

  test('toggling highlight mode on preferences page updates recitation highlight behavior', async ({
    page,
  }) => {
    // 1. Go to preferences and select Sentence (ayah) mode
    await page.goto('/preferences')
    await acceptConsent(page)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    const sentenceBtn = page.getByRole('button', { name: /^sentence$/i })
    const saveSentencePromise = page
      .waitForResponse(
        (res) =>
          res.url().includes('/auth/settings') &&
          res.request().method() === 'POST',
        { timeout: 5000 }
      )
      .catch(() => null)
    await sentenceBtn.click()
    await expect(sentenceBtn).toHaveAttribute('aria-pressed', 'true')
    await page.waitForFunction(
      () => localStorage.getItem('quran-highlight-mode') === 'ayah'
    )
    await saveSentencePromise

    // 2. Go to reader and verify whole ayah is highlighted
    await page.goto('/quran/1/reader')
    await acceptConsent(page)
    await page.waitForSelector('.arabic-text', { timeout: 15000 })

    await startRecitation(page)

    await expect(page.locator('.verse-row.is-current-ayah')).toBeVisible({
      timeout: 10000,
    })
    expect(await page.locator('.is-current-word').count()).toBe(0)

    await stopRecitation(page)
    await page.waitForTimeout(500)

    // 3. Switch back to Word mode on preferences
    await page.goto('/preferences')
    await acceptConsent(page)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    const wordBtn = page.getByRole('button', { name: /^word$/i })
    const saveWordPromise = page
      .waitForResponse(
        (res) =>
          res.url().includes('/auth/settings') &&
          res.request().method() === 'POST',
        { timeout: 5000 }
      )
      .catch(() => null)
    await wordBtn.click()
    await expect(wordBtn).toHaveAttribute('aria-pressed', 'true')
    await page.waitForFunction(
      () => localStorage.getItem('quran-highlight-mode') === 'word'
    )
    await saveWordPromise

    // 4. Go to reader and verify words are highlighted
    await page.goto('/quran/1/reader')
    await acceptConsent(page)
    await page.waitForSelector('.arabic-text', { timeout: 15000 })

    await startRecitation(page)

    await expect(page.locator('.is-current-word').first()).toBeVisible({
      timeout: 10000,
    })
    const wordId = await page
      .locator('.is-current-word')
      .first()
      .getAttribute('id')
    expect(wordId).toMatch(/^word-1-/)
  })
})
