import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './tests',
    timeout: 30_000,
    expect: { timeout: 5000 },
    fullyParallel: false,
    reporter: [['list'], ['html', { open: 'never' }]],
    use: {
        headless: true,
        viewport: { width: 1280, height: 720 },
        actionTimeout: 10_000,
        // Frontend runs on 4001 in dev; Nitro API on 3000. Point Playwright at the UI.
        baseURL: process.env.BASE_URL || 'http://localhost:4001',
        ignoreHTTPSErrors: true,
    },
    projects: [
        { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    ],
    webServer: {
        command: 'pnpm run dev',
        // Dev runs two servers; wait for Nitro auth health so the first auth request
        // in E2E does not spend the test budget waiting for the API to finish booting.
        url: 'http://localhost:3002/auth/health',
        reuseExistingServer: true,
        timeout: 180_000,
    },
});
