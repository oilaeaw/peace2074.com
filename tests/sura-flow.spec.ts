import { test, expect } from '@playwright/test';

test.describe('Quran Navigation and Search Flow', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/quran');
    });

    test('should display the sura list on load', async ({ page }) => {
        const suraCards = page.locator('a.sura-card');
        await expect(suraCards.first()).toBeVisible();
        await expect(suraCards).toHaveCount(114);
    });

    test('should show Al-Fatiha as the first sura card', async ({ page }) => {
        const firstCard = page.locator('a.sura-card').first();
        await expect(firstCard).toBeVisible();
        await expect(firstCard).toContainText(/The Opener|Fati/i);
    });

    test('should navigate to a sura and render Arabic text', async ({ page }) => {
        const firstCard = page.locator('a.sura-card').first();
        await expect(firstCard).toBeVisible();
        const href = await firstCard.getAttribute('href');
        expect(href).toBeTruthy();
        await page.goto(`${href}/reader`);

        await page.waitForURL(/\/quran\/\d+\/reader/);

        const arabicText = page.locator('.arabic-text').first();
        await expect(arabicText).toBeVisible();
        await expect(arabicText).toHaveText(/.+/, { timeout: 10000 });
    });

    test('should apply RTL direction when switching to Arabic locale', async ({ page }) => {
        await page.evaluate(() => {
            localStorage.setItem('app-locale', 'ar');
        });
        await page.reload();

        const html = page.locator('html');
        await expect(html).toHaveAttribute('dir', 'rtl');
        await expect(html).toHaveAttribute('lang', 'ar');
    });

    test('should render all 114 surah cards', async ({ page }) => {
        const suraCards = page.locator('a.sura-card');
        await expect(suraCards).toHaveCount(114);
        await expect(suraCards.nth(113)).toBeVisible();
    });
});