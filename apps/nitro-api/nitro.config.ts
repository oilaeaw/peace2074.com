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
    devServer: {
        port: DEFAULT_PORT,
        host: "0.0.0.0",
        // Enforce the chosen port; if 3000 is busy, Nitro will error instead of auto-picking another port.
        strictPort: true,
    },
    runtimeConfig: {
        // Secrets are automatically read from corresponding
        // environment variables e.g. NITRO_KIMI_API_KEY
        kimiApiKey: "",
        kimiBaseUrl: "",
        vapidPublicKey: "",
        vapidPrivateKey: "",
        vapidSubject: "",
        contactFrom: "",
        contactTo: "",
        netlifyWebhookSecret: "",
        authPasscode: "",
        authSecret: "",
        // OAuth credentials
        googleClientId: "",
        googleClientSecret: "",
        googleRedirectUri: "",
        appleClientId: "",
        appleTeamId: "",
        appleKeyId: "",
        applePrivateKey: "",
        appleRedirectUri: "",
    },
    // Cache headers for static assets and API responses
    headers: {
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
        'X-Content-Type-Options': 'nosniff',
    },
    // No SSR renderer needed; pure API
});
