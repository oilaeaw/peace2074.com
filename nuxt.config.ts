// https://nuxt.com/docs/api/configuration/nuxt-config
import { fileURLToPath } from 'node:url'
export default defineNuxtConfig({
  // Use the app/ directory as the source for pages/layouts/components
  srcDir: './app',
  // Nitro compatibility date to silence startup warning
  compatibilityDate: '2025-11-15',
  modules: [
    'nuxt-quasar-ui',
    '@sidebase/nuxt-auth',
    'nuxt-mongoose',
    '@nuxtjs/i18n',
    '@nuxtjs/color-mode',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    ...(process.env.VITE_PLUGIN_PWA ? ['@vite-pwa/nuxt'] as const : []),
  ],
  
  i18n: {
    baseUrl: process.env.SITE_BASE_URL,
    strategy: 'no_prefix',
    defaultLocale: 'en',
    locales: [
      { code: 'en', name: 'English' },
      { code: 'ar', name: 'Arabic', dir: 'rtl' },
      { code: 'de', name: 'Deutsch' },
      { code: 'ru', name: 'Русский' },
    ],
    // Point to the Vue I18n configuration file relative to the i18n/ directory
    // The module resolves this path from <root>/i18n, so go up one level
    vueI18n: '../i18n.config.ts',
  },

  vite: {
    server: {
      hmr: {
        overlay: false,
      },
    },
  },

  nitro:{
    // Teach Nitro how to resolve custom aliases for the server build.
    // This is separate from the top-level 'alias' which is for the client-side (Vite) build.
    alias: {
      '@server': fileURLToPath(new URL('./server', import.meta.url)),
      '@shared': fileURLToPath(new URL('./shared', import.meta.url)),
    },
  },

  // Aliases for the client-side (Vite) build
  alias: {
    '@app': fileURLToPath(new URL('./app', import.meta.url)),
    '@assets': fileURLToPath(new URL('./app/assets', import.meta.url)),
    '@server': fileURLToPath(new URL('./server', import.meta.url)),
    '@shared': fileURLToPath(new URL('./shared', import.meta.url)),
  },

  quasar: {
    plugins: [
      'Notify',
      'Dialog',
    ],
    extras: {
      // Import Material Icons for general purpose icons
      fontIcons: ['material-icons'],
    },
  },

  auth: {
    // The module is enabled.
    isEnabled: true,
    // Keep auth middleware enabled globally
    // Global middleware is enabled by default.
    globalAppMiddleware: true,
  },

  runtimeConfig: {
    // Optional session cookie configuration used by some dev/debug endpoints
    session: {
      name: 'nuxt-session',
      cookie: {},
    },
    auth: {
      secret: process.env.AUTH_SECRET, // You can generate one with `openssl rand -base64 32`
      google: {
        clientId: process.env.AUTH_GOOGLE_CLIENT_ID,
        clientSecret: process.env.AUTH_GOOGLE_CLIENT_SECRET,
      },
      github: {
        clientId: process.env.AUTH_GITHUB_CLIENT_ID,
        clientSecret: process.env.AUTH_GITHUB_CLIENT_SECRET,
      },
    },
    // MailJS (or similar) webhook settings
    email_public_key: process.env.MAILJS_PUBLIC_KEY,
    email_private_key: process.env.MAILJS_PRIVATE_KEY,
    email_template: process.env.MAILJS_TEMPLATE,
    mailjs_api_url: process.env.MAILJS_API_URL,
    mongodbUri: process.env.MONGODB_URI,
  },

  mongoose: {
    uri: process.env.MONGODB_URI,
    options: {},
    modelsDir: 'models',
  },

  // Disable SSR globally to avoid i18n hydration issues in development
  ssr: false,

  // Auto-import composables and utilities from these directories for both runtime and types
  imports: {
    dirs: [
      'shared',
      'server/utils',
      'app/store',
    ],
  },

})