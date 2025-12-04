import { defineNitroConfig } from 'nitropack/config'

export default defineNitroConfig({
  preset: 'netlify-deno',
  srcDir: 'server',
  compatibilityDate: '2025-12-04',
})
