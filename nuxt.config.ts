import { Buffer } from 'node:buffer'
import nodeCrypto from 'node:crypto'
import { fileURLToPath, URL } from 'node:url'
import replace from '@rollup/plugin-replace'
import express from 'express'

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
    ;(globalThis as any).crypto = (nc as any).webcrypto || {}
  }
  if (typeof (globalThis as any).crypto.hash !== 'function') {
    ;(globalThis as any).crypto.hash = async (alg: string, data: ArrayBuffer | Uint8Array | string) => {
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

// Note: we intentionally avoid aliasing `node:crypto` to a local shim in the
// production Vite build because the shim imports node-only modules (like
// `node:buffer`) which cannot be bundled for the browser. Any dev-only shim
// must run only in the dev server environment and not be included in the
// production client bundle.

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
  ],
  ssr: false,
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
        { rel: 'icon', type: 'image/svg+xml', href: 'logo.svg' },
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
    '~/assets/app.scss',
    '@quasar/quasar-ui-qmediaplayer/dist/index.css',
  ],
  colorMode: {
    classSuffix: '',
  },
  runtimeConfig: {
    nuxtJWTSecret: import.meta.env.NUXT_JWT_ACCESS_TOKEN_SECRET,
    email_public_key: import.meta.env.NUXT_EMAIL_PUBLIC_KEY,
    email_private_key: import.meta.env.NUXT_EMAIL_PRIVATE_KEY,
    email_template: import.meta.env.NUXT_EMAIL_TEMPLATE,
    mailjs_api_url: import.meta.env.NUXT_MAILJS_API_URL || 'https://api.emailjs.com/api/v1.0/email/send',
    session_password: import.meta.env.NUXT_SESSION_PASSWORD || 'default_session_password',
    githubClientId: import.meta.env.GITHUB_CLIENT_ID,
    githubClientSecret: import.meta.env.NUXT_GITHUB_CLIENT_SECRET,
    githubCallbackUrl: import.meta.env.GITHUB_CALLBACK_URL, // Add callback URL to runtime config
  },
  alias: {
    'images': fileURLToPath(new URL('./assets/images', import.meta.url)),
    '@server': fileURLToPath(new URL('./server', import.meta.url)),
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
      routes: ['', 'quran', 'holynames', 'miracles', 'home', 'terms', 'privacy', 'auth/authenticate'],
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
            ;(globalThis as any).crypto = nodeWebCrypto || {}
          }
          // Provide crypto.subtle if available from Node
          if (!((globalThis as any).crypto as any).subtle && nodeWebCrypto?.subtle) {
            ;(globalThis as any).crypto.subtle = nodeWebCrypto.subtle
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
  },
  mongoose: {
    uri: import.meta.env.MONGODB_URI,
    options: {},
    modelsDir: 'models',
    devtools: true,
  },
  optimizeDeps: {
    include: [],
  },
  pwa,
  quasar: QuasarOptions,
  serverMiddleware: [
    express.json(),
    // Api middleware
    { path: '/api', handler: '@server/api/index.ts' },
  ],
})
