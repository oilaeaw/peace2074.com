import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import path from 'node:path'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['test/setup.ts'],
  },
  resolve: {
    alias: [
  // Order: specific before generic to ensure assets path resolves correctly
  { find: /^~\/assets\//, replacement: path.resolve(__dirname, 'app/assets') + '/' },
  { find: /^~\/store/, replacement: path.resolve(__dirname, 'app/store') },
  { find: /^~\/app/, replacement: path.resolve(__dirname, 'app') },
  { find: /^~\//, replacement: path.resolve(__dirname, './') + '/' },
      { find: /^@\//, replacement: path.resolve(__dirname, './') + '/' },
      { find: /^@shared\//, replacement: path.resolve(__dirname, 'shared') + '/' },
      { find: /^@server\//, replacement: path.resolve(__dirname, 'server') + '/' },
      { find: /^@assets\//, replacement: path.resolve(__dirname, 'app/assets') + '/' },
      // Shim crypto for plugin-vue which expects crypto.hash in some Node versions
      { find: /^node:crypto$/, replacement: path.resolve(__dirname, 'test/shims/crypto-hash-shim.ts') },
      { find: /^crypto$/, replacement: path.resolve(__dirname, 'test/shims/crypto-hash-shim.ts') },
      // Nuxt auto-imports in SFCs (e.g. #imports). Provide a minimal shim for tests.
      { find: /^#imports$/, replacement: path.resolve(__dirname, 'test/shims/nuxt-imports-shim.ts') },
    ],
  },
})
