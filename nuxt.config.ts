// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    // ... other modules
    '@sidebase/nuxt-auth',
    'nuxt-mongoose',
    // ... other modules
  ],

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