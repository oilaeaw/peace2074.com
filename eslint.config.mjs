// @ts-check
import antfu from '@antfu/eslint-config'

export default antfu({
  unocss: false,
  formatters: false,
  typescript: true,
  vue: false,
  ignores: [
    '.nuxt/**',
    '.output/**',
    '.cloudflare/**',
    'types/**',
    'public/**',
    'node_modules/**',
    '**/*.d.ts',
  ],
})
