import { fileURLToPath, URL } from 'node:url'
import replace from '@rollup/plugin-replace'
// https://nuxt.com/docs/api/configuration/nuxt-config
import { pwa } from './app/config/pwa'
import { appDescription } from './app/constants/index'
import { QuasarOptions } from './qusarOptions'

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
  devtools: {
    enabled: true,
    timeline: {
      enabled: true,
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
      external: ['resolve', '@quasar/extras', 'fuse.js', 'feathers-vuex', 'passport', 'h3-session', 'iron-session'],
    },
    esbuild: {
      options: {
        target: 'esnext',
      },
    },
    prerender: {
      crawlLinks: true,
      routes: ['', 'quran', 'holynames', 'miracles', 'home', 'terms', 'privacy', 'authenticate'],
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
      replace({
        __DATE__: new Date().toISOString(),
        preventAssignment: true,
      }),
    ],
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
})
