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
  ],
  nitro:{
    // Teach Nitro how to resolve custom aliases for the server build.
    // This is separate from the top-level 'alias' which is for the client-side (Vite) build.
    alias: {
      '@server': fileURLToPath(new URL('./server', import.meta.url)),
      '@shared': fileURLToPath(new URL('./shared', import.meta.url)),
    },
    externals:{
      // Trace and bundle these dependencies.
      // This is necessary for some packages that have complex CJS/ESM interop.
      inline: [
        'passport', 'passport-local', 'passport-github2', 'passport-google-oauth20',
      ],
    },
    // Silence resolver warnings by marking known virtual/external imports as external for Rollup
    rollupConfig: {
      external: [
        '#auth-utils',
        'next-auth',
        'next-auth/core',
        'next-auth/jwt',
        'passport',
        'passport-local',
        'passport-github2',
        'passport-google-oauth20',
      ],
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
      // Import Font Awesome v6 brand icons for social logins
      brands: ['fa-brands'],
    },
  },

  auth: {
    // The module is enabled.
    isEnabled: true,
    // The origin of your app. This is required for security reasons.
    // It's used to generate the callback URL and to verify the origin of the request.
    origin: process.env.AUTH_ORIGIN,
    // The base path to the authentication routes.
    basePath: '/api/auth',
    // Whether to periodically refresh the session.
    enableSessionRefreshPeriodically: false,
    // Whether to refresh the session on page load.
    enableSessionRefreshOnWindowFocus: true,
    // Global middleware is enabled by default.
    globalAppMiddleware: true,
  },

  mongoose: {
    uri: process.env.MONGODB_URI,
    options: {},
    modelsDir: 'models',
  },

  runtimeConfig: {
    auth: {
      secret: process.env.AUTH_SECRET, // You can generate one with `openssl rand -base64 32`
      google: {
        clientId: process.env.AUTH_GOOGLE_CLIENT_ID,
        clientSecret: process.env.AUTH_GOOGLE_CLIENT_SECRET,
      },
    },
  },

})