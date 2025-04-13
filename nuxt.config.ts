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
      '../server/uils',
    ],
  },
  devtools: {
    enabled: false,

    timeline: {
      enabled: true,
    },
  },
  devtools: {
    enabled: true,
  },
  app: {
    head: {
      viewport: 'width=device-width,initial-scale=1',
      link: [
        { rel: 'icon', href: '/favicon.ico', sizes: 'any' },
        { rel: 'icon', type: 'image/svg+xml', href: '/nuxt.svg' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
        { rel: 'stylesheet', href: 'https://cdn.jsdelivr.net/npm/quasar@2.17.7/dist/quasar.prod.css' },
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
  ],
  colorMode: {
    classSuffix: '',
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
      external: ['resolve', '@quasar/extras', 'fuse.js'],
    },
    esbuild: {
      options: {
        target: 'esnext',
      },
    },
    prerender: {
      crawlLinks: true,
      routes: ['', 'quran', 'holynames', 'miracles', 'home'],
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
    id: 'G-XN9FGVQBKX',
  },
  i18n: {
    baseUrl: 'https://peace2074.com',
    defaultLocale: 'ar',
    vueI18nLoader: true,
    vueI18n: '../i18n.config',
  },
  optimizeDeps: {
    include: [],
  },

  pwa,
  quasar: QuasarOptions,
})
