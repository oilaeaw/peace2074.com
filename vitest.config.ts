import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['test/setup.ts'],
  },
  resolve: {
    // Align Vitest's alias configuration with Nuxt's for consistency.
    // This ensures that imports in tests resolve the same way as in the app.
    alias: [
      // Use Nuxt's own alias for auto-imports (#imports)
      { find: '#imports', replacement: fileURLToPath(new URL('.nuxt/imports.d.ts', import.meta.url)) },
      // Replicate aliases from nuxt.config.ts
      { find: '@app', replacement: fileURLToPath(new URL('./app', import.meta.url)) },
      { find: '@assets', replacement: fileURLToPath(new URL('./app/assets', import.meta.url)) },
      { find: '@server', replacement: fileURLToPath(new URL('./server', import.meta.url)) },
      { find: '@shared', replacement: fileURLToPath(new URL('./shared', import.meta.url)) },
      // Shim crypto for plugin-vue which expects crypto.hash in some Node versions
      { find: /^node:crypto$/, replacement: path.resolve(__dirname, 'test/shims/crypto-hash-shim.ts') },
      { find: /^crypto$/, replacement: path.resolve(__dirname, 'test/shims/crypto-hash-shim.ts') },
    ],
  },
})
