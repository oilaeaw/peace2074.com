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
        baseURL: 'http://localhost:3000',
        ignoreHTTPSErrors: true,
    },
    projects: [
        { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    ],
    webServer: {
        command: 'pnpm run dev',
        url: 'http://localhost:3000',
        reuseExistingServer: true,
        timeout: 120_000,
    },
});
