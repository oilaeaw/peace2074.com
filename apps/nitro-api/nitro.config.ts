import { fileURLToPath } from 'node:url'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { defineNitroConfig } from 'nitropack'

// Load the reflect-metadata polyfill source so it can be injected at the top of
// the Cloudflare Worker entry. @simplewebauthn/server → @peculiar/x509 → tsyringe
// require `Reflect.getMetadata` at module-init; on the Workers runtime the bare
// `import "reflect-metadata"` side-effect gets tree-shaken, so we inline it.
const reflectMetadataPolyfill = (() => {
    try {
        const require = createRequire(import.meta.url)
        return readFileSync(require.resolve('reflect-metadata'), 'utf8')
    } catch {
        return ''
    }
})()

const DEFAULT_PORT = 3000
const requestedPreset =
    process.env.NITRO_PRESET?.trim() || process.env.SERVER_PRESET?.trim() || ''
const isCloudflareBuild = requestedPreset.startsWith('cloudflare')
const runtimeBaseURL =
    process.env.NITRO_APP_BASE_URL?.trim() ||
    process.env.NITRO_BASE_URL?.trim() ||
    (process.env.NODE_ENV === 'production' ? '/api' : '/')

export default defineNitroConfig({
    compatibilityDate: '2024-10-01',
    srcDir: 'server',
    serverAssets: [
        {
            baseName: 'release',
            // `serverAssets.dir` resolves from `srcDir` (`apps/nitro-api/server`).
            // Walk back to the repository root so `CHANGELOG.md` is bundled for `/deploys`.
            dir: '../../../',
            pattern: 'CHANGELOG.md',
        },
    ],
    // Nitro defaults production builds to the standalone Node preset (`node_server`).
    // CI can override it with `NITRO_PRESET` (for example `cloudflare-pages`).
    ...(requestedPreset ? { preset: requestedPreset } : {}),
    // Production builds keep the /api prefix so reverse proxies and edge rules can
    // forward API traffic without changing client URLs.
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
                    compatibility_flags: ['nodejs_compat_v2'],
                },
            },
            // Alias `debug` to a no-op stub before node resolution runs.
            // The real `debug` CJS package (module.exports = fn) gets wrapped by rollup into
            // a namespace object; getDefaultExportFromNamespaceIfNotNamed only unwraps
            // single-key namespaces, so callers like mquery get an object, not a function.
            // Alias `node:util` to a safe stub that guards against Mongoose calling
            // util.inherits(ctor, undefined) when optional deps are absent.
            alias: {
                debug: fileURLToPath(
                    new URL('./server/stubs/debug.ts', import.meta.url)
                ),
                'node:util': fileURLToPath(
                    new URL('./server/stubs/util.ts', import.meta.url)
                ),
                util: fileURLToPath(
                    new URL('./server/stubs/util.ts', import.meta.url)
                ),
            },
            rollupConfig: {
                plugins: [
                    {
                        // Inject the reflect-metadata polyfill at the very top of the Worker
                        // entry chunk so global Reflect is patched before any lazy route chunk
                        // (passkeys → @peculiar/x509 → tsyringe) is imported. Wrapped in an IIFE
                        // so the polyfill's top-level `var Reflect` cannot shadow the global
                        // Reflect inside the ESM chunk; it still patches globalThis.Reflect.
                        name: 'inject-reflect-metadata-polyfill',
                        renderChunk(code: string, chunk: { isEntry?: boolean }) {
                            if (!chunk.isEntry || !reflectMetadataPolyfill) return null
                            return {
                                code: `;(function(){${reflectMetadataPolyfill}\n})();\n${code}`,
                                map: null,
                            }
                        },
                    },
                    {
                        // MongoDB has 8 optional native/cloud deps that aren't installed and
                        // cannot be externals in CF Workers — stub them all as empty modules.
                        name: 'stub-mongodb-optional-deps',
                        resolveId(id: string) {
                            const stubs = [
                                '@aws-sdk/credential-providers',
                                '@mongodb-js/zstd',
                                'kerberos',
                                'gcp-metadata',
                                'snappy',
                                'socks',
                                'aws4',
                                'mongodb-client-encryption',
                            ]
                            if (stubs.includes(id)) {
                                return `\0stub:${id}`
                            }
                            return null
                        },
                        load(id: string) {
                            if (id.startsWith('\0stub:')) {
                                return 'export default {}; export const fromNodeProviderChain = () => ({});'
                            }
                            return null
                        },
                    },
                    {
                        // Cloudflare Workers V8 rejects `.hasOwnProperty()` calls on
                        // null-prototype objects that Mongoose creates. Replace all such
                        // calls with the safe Object.prototype form at bundle time.
                        name: 'fix-has-own-property',
                        renderChunk(code: string) {
                            const fixed = code.replace(
                                /\b([a-zA-Z_$][\w$]*)\.hasOwnProperty\(/g,
                                'Object.prototype.hasOwnProperty.call($1, '
                            )
                            return fixed !== code ? { code: fixed } : null
                        },
                    },
                ],
            },
        }
        : {}),
    devServer: {
        port: DEFAULT_PORT,
        host: '0.0.0.0',
        // Enforce the chosen port; if 3000 is busy,
        //  Nitro will error instead of auto-picking another port.
        strictPort: true,
    },
    runtimeConfig: {
        // Secrets are automatically read from corresponding
        // environment variables e.g. NITRO_KIMI_API_KEY
        kimiApiKey: process.env.KIMI_API_KEY || '',
        kimiBaseUrl: process.env.KIMI_BASE_URL || '',
        vapidPublicKey: '',
        vapidPrivateKey: '',
        vapidSubject: '',
        contactFrom: '',
        contactTo: '',
        authPasscode: '',
        authSecret: '',
        // OAuth credentials
        googleClientId: '',
        googleClientSecret: '',
        googleRedirectUri: '',
        appleClientId: '',
        appleTeamId: '',
        appleKeyId: '',
        applePrivateKey: '',
        appleRedirectUri: '',
    },
    // Cache headers for static assets and API responses
    headers: {
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
        'X-Content-Type-Options': 'nosniff',
    },
    // No SSR renderer needed; pure API
})
