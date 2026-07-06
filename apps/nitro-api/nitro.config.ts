import { defineNitroConfig } from 'nitropack'
import { resolve } from 'node:path'

const DEFAULT_PORT = 3000
const requestedPreset =
    process.env.NITRO_PRESET?.trim() || process.env.SERVER_PRESET?.trim() || ''
const isCloudflareBuild = requestedPreset.startsWith('cloudflare')
const runtimeBaseURL =
    process.env.NITRO_APP_BASE_URL?.trim() ||
    process.env.NITRO_BASE_URL?.trim() ||
    (process.env.NODE_ENV === 'production' ? '/api' : '/')

// @waelio/realdb ships CJS only — point Rollup to the correct entry
// (same alias that vite.config.ts applies for the frontend build)
const realdbCjs = resolve('../../node_modules/@waelio/realdb/lib/index.js')

export default defineNitroConfig({
    compatibilityDate: '2024-10-01',
    srcDir: 'server',
    alias: {
        '@waelio/realdb': realdbCjs,
    },
    serverAssets: [
        {
            baseName: 'release',
            // Walk back to the repo root so CHANGELOG.md is bundled for /deploys
            dir: '../../../',
            pattern: 'CHANGELOG.md',
        },
    ],
    // CI can override preset with NITRO_PRESET (e.g. cloudflare-pages)
    ...(requestedPreset ? { preset: requestedPreset } : {}),
    // Production builds keep /api prefix for reverse proxies / edge rules
    baseURL: runtimeBaseURL,
    ...(isCloudflareBuild
        ? {
            cloudflarePages: {
                routes: {
                    include: ['/api/*'],
                    exclude: [],
                },
            },
            cloudflare: {
                deployConfig: true,
                nodeCompat: true,
                wrangler: {
                    // nodejs_compat_v2 gives access to node:fs, node:crypto, node:events.
                    // Required by @waelio/data (JSON file persistence).
                    compatibility_flags: ['nodejs_compat_v2'],
                },
            },
            rollupConfig: {
                plugins: [],
                resolve: {
                    alias: {
                        '@waelio/realdb': realdbCjs,
                    },
                },
            },
        }
        : {}),
    devServer: {
        port: DEFAULT_PORT,
        host: '0.0.0.0',
        strictPort: true,
    },
    runtimeConfig: {
        kimiApiKey: process.env.KIMI_API_KEY || '',
        kimiBaseUrl: process.env.KIMI_BASE_URL || '',
        vapidPublicKey: '',
        vapidPrivateKey: '',
        vapidSubject: '',
        contactFrom: '',
        contactTo: '',
        authPasscode: '',
        authSecret: '',
        googleClientId: '',
        googleClientSecret: '',
        googleRedirectUri: '',
        appleClientId: '',
        appleTeamId: '',
        appleKeyId: '',
        applePrivateKey: '',
        appleRedirectUri: '',
    },
    headers: {
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
        'X-Content-Type-Options': 'nosniff',
    },
})
