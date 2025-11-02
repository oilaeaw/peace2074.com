import { Buffer } from 'node:buffer'
import nodeCrypto from 'node:crypto'
import { fileURLToPath, URL } from 'node:url'
import replace from '@rollup/plugin-replace'

import { pwa } from './app/config/pwa'
import { appDescription } from './app/constants/index'
import { QuasarOptions } from './qusarOptions'

// Synchronous startup shim: ensure `node:crypto.hash` and `globalThis.crypto.hash`
// are present before any Vite transform plugins (plugin-vue) call them.
try {
  const nc: any = nodeCrypto as any
  // Attach node:crypto.hash if missing
  if (typeof nc.hash !== 'function') {
    nc.hash = (alg: string, data: ArrayBuffer | Uint8Array | string, encoding?: string) => {
      let buf: Buffer
      if (typeof data === 'string')
        buf = Buffer.from(data)
      else if (data instanceof ArrayBuffer)
        buf = Buffer.from(new Uint8Array(data))
      else if (data instanceof Uint8Array)
        buf = Buffer.from(data)
      else buf = Buffer.from(String(data))

      const algMap: Record<string, string> = {
        'SHA-256': 'sha256',
        'SHA256': 'sha256',
        'sha-256': 'sha256',
        'SHA-1': 'sha1',
        'SHA1': 'sha1',
        'MD5': 'md5',
      }
      const nodeAlg = (algMap as any)[alg] || String(alg).toLowerCase()
      return nc.createHash(nodeAlg).update(buf).digest(encoding as any)
    }
  }

  if (typeof (globalThis as any).crypto === 'undefined') {
    ; (globalThis as any).crypto = (nc as any).webcrypto || {}
  }
  if (typeof (globalThis as any).crypto.hash !== 'function') {
    ; (globalThis as any).crypto.hash = async (alg: string, data: ArrayBuffer | Uint8Array | string) => {
      let buf: Buffer
      if (typeof data === 'string')
        buf = Buffer.from(data)
      else if (data instanceof ArrayBuffer)
        buf = Buffer.from(new Uint8Array(data))
      else if (data instanceof Uint8Array)
        buf = Buffer.from(data)
      else buf = Buffer.from(String(data))
      const algMap: Record<string, string> = {
        'SHA-256': 'sha256',
        'SHA256': 'sha256',
        'sha-256': 'sha256',
        'SHA-1': 'sha1',
        'SHA1': 'sha1',
        'MD5': 'md5',
      }
      const nodeAlg = (algMap as any)[alg] || String(alg).toLowerCase()
      const hash = nc.createHash(nodeAlg).update(buf).digest()
      return hash.buffer.slice(hash.byteOffset, hash.byteOffset + hash.byteLength)
    }
  }
}
catch {
  // best-effort; do not crash Nuxt config parsing
}

export default defineNuxtConfig({
  modules: [
    '@vueuse/nuxt',
    '@unocss/nuxt',
    '@pinia/nuxt',
    '@nuxtjs/color-mode',
    '@vite-pwa/nuxt',
    '@nuxt/eslint',
    'nuxt-quasar-ui',
    '@nuxtjs/i18n',
    'nuxt-gtag',
    'nuxt-mongoose',
    'nuxt-auth-utils',
  ],
  ssr: true,
  imports: {
    autoImport: true,
    dirs: [
      '../app/constants',
      '../app/layouts',
      '../app/store',
      '../app/composables',
      '../app/components',
      '../shared',
      '../server/utils',
    ],
  },
  // Enable devtools and HMR only in development
  devtools: {
    enabled: import.meta.env.MODE === 'development',
    timeline: {
      enabled: import.meta.env.MODE === 'development',
    },
  },
  app: {
    head: {
      viewport: 'width=device-width,initial-scale=1',
      link: [
        { rel: 'icon', href: '/favicon.ico', sizes: 'any' },
        { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
        { rel: 'stylesheet', href: 'https://cdn.jsdelivr.net/npm/quasar@2.17.7/dist/quasar.prod.css' },
        { rel: 'stylesheet', href: 'https://cdn.jsdelivr.net/npm/@quasar/quasar-ui-qmediaplayer@next/dist/QMediaPlayer.min.css' },
        { rel: 'stylesheet', href: ' https://fonts.googleapis.com/css2?family=DM+Sans&family=DM+Serif+Display&family=DM+Mono&display=swap' },
      ],
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: appDescription },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
        { name: 'theme-color', media: '(prefers-color-scheme: light)', content: 'white' },
        { name: 'theme-color', media: '(prefers-color-scheme: dark)', content: '#222222' },
      ],
    },
  },
  css: [
    '@unocss/reset/tailwind.css',
    '@quasar/quasar-ui-qmediaplayer/dist/index.css',
    './app/assets/app.scss',
  ],
  colorMode: {
    classSuffix: '',
  },
  runtimeConfig: {
    nuxtJWTSecret: import.meta.env.NUXT_JWT_ACCESS_TOKEN_SECRET,
    email_public_key: import.meta.env.NUXT_EMAIL_PUBLIC_KEY,
    email_private_key: import.meta.env.NUXT_EMAIL_PRIVATE_KEY,
    email_template: import.meta.env.NUXT_EMAIL_TEMPLATE,
    mailjs_api_url: import.meta.env.NUXT_MAILJS_API_URL,
    session_password: import.meta.env.NUXT_SESSION_PASSWORD,
    session: {
      // cookie name
      name: 'nuxt-session',
      // encryption password (must be set in .env as NUXT_SESSION_PASSWORD)
      // nuxt-auth-utils (iron-session) requires a secret >= 32 chars.
      // Fallback to JWT_SECRET if NUXT_SESSION_PASSWORD is not defined to avoid 500s on /api/_auth/session.
      password: (import.meta.env.NUXT_SESSION_PASSWORD
        || import.meta.env.JWT_SECRET
        || 'please-change-this-session-secret-64chars-min-0123456789abcdef') as string,
      // maxAge in seconds (default: 1 week)
      maxAge: 60 * 60 * 24 * 7,
      // cookie options
      cookie: {
        sameSite: 'lax',
      },
    },
  githubClientId: import.meta.env.GITHUB_CLIENT_ID,
  githubClientSecret: (import.meta.env.GITHUB_CLIENT_SECRET || import.meta.env.NUXT_GITHUB_CLIENT_SECRET) as any,
  githubCallbackUrl: import.meta.env.GITHUB_CALLBACK_URL,
  googleClientId: import.meta.env.GOOGLE_CLIENT_ID,
  googleClientSecret: (import.meta.env.GOOGLE_CLIENT_SECRET || import.meta.env.NUXT_GOOGLE_CLIENT_SECRET) as any,
  googleCallbackUrl: import.meta.env.GOOGLE_CALLBACK_URL,
    jwtSecret: import.meta.env.JWT_SECRET,
    mongodbUri: import.meta.env.MONGODB_URI,
    databaseUrl: import.meta.env.DATABASE_URL,
    nodeEnv: import.meta.env.NODE_ENV,
    public: {
      apiBase: import.meta.env.API_BASE_URL,
      // Socket client toggles (client plugin reads these)
      socketEnabled: (import.meta.env.NUXT_PUBLIC_SOCKET_ENABLED as any) ?? false,
      socketPath: (import.meta.env.NUXT_PUBLIC_SOCKET_PATH as any) ?? '/_socket.io',
      socketUrl: (import.meta.env.NUXT_PUBLIC_SOCKET_URL as any) ?? undefined,
    },
  },
  alias: {
    '@app': fileURLToPath(new URL('./app', import.meta.url)),
    '@assets': fileURLToPath(new URL('./app/assets', import.meta.url)),
    '@server': fileURLToPath(new URL('./server', import.meta.url)),
    '@shared': fileURLToPath(new URL('./shared', import.meta.url)),
  },
  build: {
    transpile: ['feathers-vuex'],
  },
  routeRules: {
    '/api/quran': {
      cache: {
        maxAge: 24,
        swr: true,
        name: 'holybook',
      },
    },
    '/api/holynames': {
      cache: {
        maxAge: 24,
        swr: true,
        name: 'holynames',
      },
    },
    '/quran': { ssr: false },
    '/quran/**': { ssr: false },
  },
  future: {
    compatibilityVersion: 4,
  },
  experimental: {
    payloadExtraction: true,
    renderJsonPayloads: true,
    typedPages: true,
  },
  compatibilityDate: '2025-03-05',
  nitro: {
    rollupConfig: {
      // Do not externalize 'passport' so serverless functions (Netlify) have it
      // available at runtime. Bundling passport into the server build avoids
      // "Cannot find package 'passport'" errors in deployed functions.
      external: ['resolve', '@quasar/extras', 'fuse.js', 'feathers-vuex', 'h3-session', 'iron-session'],
    },
    esbuild: {
      options: {
        target: 'esnext',
      },
    },
    prerender: {
      crawlLinks: true,
      ignore: ['/quran', '/quran/**'],
      // Explicitly pre-render common public pages. Dynamic routes (e.g. quran/:sura)
      // are not listed here and will be discovered via crawlLinks when possible.
      // Use leading slashes for routes so Nitro recognizes them correctly.
      routes: [
        '/',
        '/home',
        '/holynames',
        '/tasbeeh',
        '/miracles',
        '/terms',
        '/privacy',
        '/auth/login',
        '/auth/signup',
        '/auth/authenticate',
        '/account',
        '/account/settings',
      ],
    },
    imports: {
      autoImport: true,
      dirs: [
        '../shared',
        '../app/constants',
        '../app/components',
      ],
    },

  },
  vite: {
    plugins: [
      // Vite-side shim: enforce pre so this runs before plugin-vue and other plugins
      {
        name: 'vite-global-crypto-shim',
        enforce: 'pre',
        configResolved() {
          const nodeWebCrypto = (nodeCrypto as any).webcrypto
          if (typeof (globalThis as any).crypto === 'undefined') {
            ; (globalThis as any).crypto = nodeWebCrypto || {}
          }
          // Provide crypto.subtle if available from Node
          if (!((globalThis as any).crypto as any).subtle && nodeWebCrypto?.subtle) {
            ; (globalThis as any).crypto.subtle = nodeWebCrypto.subtle
          }
          // Import our custom crypto implementation that works everywhere
          import('./app/utils/crypto')
        },
      },
      replace({
        __DATE__: new Date().toISOString(),
        preventAssignment: true,
      }),
    ],
    // Ensure imports of `crypto` use Node's built-in implementation
    resolve: {
      alias: {
        crypto: 'node:crypto',
      },
    },
    server: {
      // Ensure HMR is disabled in production deployments where the dev server
      // isn't available (prevents browser console trying to connect to
      // ws://localhost:3000/_nuxt/). Nuxt/Vite will ignore HMR in production
      // builds but this config prevents accidental client-side attempts.
      hmr: import.meta.env.MODE === 'development' ? undefined : false,
    },
  },
  eslint: {
    config: {
      standalone: false,
      nuxt: {
        sortConfigKeys: true,
      },
    },
  },
  gtag: {
    id: import.meta.env.NUXT_GOOGLE_ANALYTICS_ID,
  },
  i18n: {
    defaultLocale: 'en',
    vueI18nLoader: true,
    vueI18n: '../i18n.config',
    // baseUrl is required by nuxt-i18n to generate proper SEO links (canonical/hreflang)
    baseUrl: import.meta.env.SITE_BASE_URL || 'https://peace2074.com',
  },
  mongoose: {
    uri: import.meta.env.MONGODB_URI,
    options: {
      connectTimeoutMS: 30000, // 30 seconds
      socketTimeoutMS: 30000,
      serverSelectionTimeoutMS: 30000,
      bufferCommands: false,
    },
    modelsDir: 'models',
    devtools: true,
  },
  optimizeDeps: {
    include: [],
  },
  pwa,
  quasar: QuasarOptions,
  auth: {
    provider: {
      type: 'authjs',
      // IMPORTANT: The `globalAppMiddleware` property must be set to `true` for the middleware to be registered correctly.
      globalAppMiddleware: true,
    },
  },
})
