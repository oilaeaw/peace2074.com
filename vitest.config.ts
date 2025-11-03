import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import path from 'node:path'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    globals: true,
  },
  resolve: {
    alias: [
      { find: /^~\/store/, replacement: path.resolve(__dirname, 'app/store') },
      { find: /^~\/app/, replacement: path.resolve(__dirname, 'app') },
      { find: /^~\//, replacement: path.resolve(__dirname, './') + '/' },
      { find: /^@\//, replacement: path.resolve(__dirname, './') + '/' },
      { find: /^@shared\//, replacement: path.resolve(__dirname, 'shared') + '/' },
      { find: /^@server\//, replacement: path.resolve(__dirname, 'server') + '/' },
      { find: /^@assets\//, replacement: path.resolve(__dirname, 'app/assets') + '/' },
    ],
  },
})
