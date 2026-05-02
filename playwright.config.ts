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
        // Frontend runs on 4000 in dev; Nitro API runs separately. Point Playwright at the UI.
        baseURL: process.env.BASE_URL || 'http://127.0.0.1:4000',
        ignoreHTTPSErrors: true,
    },
    projects: [
        { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    ],
    webServer: {
        command: 'VITE_DEV_HOST=127.0.0.1 pnpm run dev',
        // Wait for the frontend entrypoint, then let individual tests poll API readiness
        // through the Vite /api proxy before making backend assertions.
        url: 'http://127.0.0.1:4000/',
        reuseExistingServer: true,
        timeout: 180_000,
    },
});
