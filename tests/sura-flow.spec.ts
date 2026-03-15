import { test, expect } from '@playwright/test';

test.describe('Quran Navigation and Search Flow', () => {
    test.beforeEach(async ({ page }) => {
        // BaseURL is http://localhost:4000 per playwright.config.ts
        await page.goto('/');
    });

    test('should display the search bar on load', async ({ page }) => {
        const searchBar = page.getByTestId('search-container');
        await expect(searchBar).toBeVisible();
    });

    test('should search for "Al-Fatiha" and show the sura card', async ({ page }) => {
        await page.goto('/quran');

        // Ensure search input is visible and active before interaction
        const searchInput = page.getByTestId('search-input').filter({ visible: true }).first();
        await expect(searchInput).toBeVisible();

        await searchInput.fill('Al-Fatiha');
        await page.keyboard.press('Enter');

        // Wait for the specific filtered card to appear
        const suraCard = page.getByRole('link').filter({ hasText: /Al-Fatiha/i }).first();
        await expect(suraCard).toBeVisible();
    });

    test('should navigate to a sura and render Arabic text', async ({ page }) => {
        await page.goto('/quran');

        // Wait for data to load and cards to be visible
        const firstCard = page.getByRole('link').filter({ has: page.locator('.sura-card') }).first();
        await expect(firstCard).toBeVisible();
        await firstCard.click();

        await page.waitForURL(/\/quran\/\d+/);

        // Verify Quranic text rendering
        const arabicText = page.getByTestId('quran-text').first();
        await expect(arabicText).toBeVisible();

        // Ensure Arabic text content is loaded (retryable assertion)
        await expect(arabicText).toHaveText(/.+/, { timeout: 10000 });
    });

    test('should apply RTL direction when switching to Arabic locale', async ({ page }) => {
        // Manually trigger locale change via localStorage as defined in main.ts
        await page.evaluate(() => {
            localStorage.setItem('app-locale', 'ar');
        });
        await page.reload();

        const html = page.locator('html');
        await expect(html).toHaveAttribute('dir', 'rtl');
        await expect(html).toHaveAttribute('lang', 'ar');
    });

    test('should locate dynamic surah cards using regex', async ({ page }) => {
        await page.goto('/quran');

        // Matches a testId that starts with "sura-card-" followed by one or more digits
        // e.g., data-testid="sura-card-1", data-testid="sura-card-114"
        const suraCards = page.getByTestId(/^sura-card-\d+$/);

        // Assert the total count of matched elements (expecting 114 surahs)
        await expect(suraCards).toHaveCount(114);

        // You can also use case-insensitive flags
        const searchInput = page.getByTestId(/SEARCH-input/i);
    });
});