import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.BASE_URL || 'http://127.0.0.1:4000';

function isLocalBaseURL(value: string) {
    try {
        const parsed = new URL(value);
        return parsed.hostname === '127.0.0.1' || parsed.hostname === 'localhost';
    } catch {
        return false;
    }
}

const shouldStartLocalWebServer = isLocalBaseURL(baseURL);
const localWebServerURL = shouldStartLocalWebServer ? `${new URL(baseURL).origin}/api/health` : undefined;

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
        baseURL,
        ignoreHTTPSErrors: true,
    },
    projects: [
        { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    ],
    webServer: shouldStartLocalWebServer
        ? {
            command: 'VITE_DEV_HOST=127.0.0.1 pnpm run dev',
            // Wait for the Vite /api proxy to report a healthy API so tests do not race Nitro startup.
            url: localWebServerURL,
            reuseExistingServer: true,
            timeout: 180_000,
        }
        : undefined,
});
