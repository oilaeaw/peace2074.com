import { defineNitroConfig } from "nitropack";

const DEFAULT_PORT = 3000;
// NETLIFY_BUILD is set during Netlify build command
const isNetlifyBuild = process.env.NETLIFY_BUILD === 'true';

export default defineNitroConfig({
    compatibilityDate: "2024-10-01",
    srcDir: "server",
    preset: "netlify",
    // In production (Netlify), routes are prefixed with /api via redirects
    // In dev, Vite proxy strips /api prefix before forwarding
    baseURL: isNetlifyBuild ? '/api' : '/',
    // Output to root netlify/functions directory for Netlify to pick up
    output: {
        dir: isNetlifyBuild ? '../../netlify/functions' : '.netlify/functions-internal',
        serverDir: isNetlifyBuild ? '../../netlify/functions/server' : '.netlify/functions-internal/server',
    },
    // Bundle JSON data files for serverless access
    serverAssets: [
        {
            baseName: 'quran',
            dir: '../../src/shared/data',
        },
    ],
    // Dev storage driver for serverAssets (production uses bundled assets)
    devStorage: {
        'assets:quran': {
            driver: 'fs',
            base: '../../src/shared/data',
        },
    },
    devServer: {
        port: DEFAULT_PORT,
        host: "0.0.0.0",
        // Enforce the chosen port; if 3000 is busy, Nitro will error instead of auto-picking another port.
        strictPort: true,
    },
    runtimeConfig: {
        // Secrets are automatically read from corresponding
        // environment variables e.g. NITRO_DEEPSEEK_API_KEY
        deepseekApiKey: "",
        deepseekBaseUrl: "",
        contactFrom: "",
        contactTo: "",
        netlifyWebhookSecret: "",
        authPasscode: "",
        authSecret: "",
    },
    // No SSR renderer needed; pure API
});
