import { defineNitroConfig } from 'nitropack/config'

export default defineNitroConfig({
  preset: 'deno-server',
  srcDir: 'server',
  compatibilityDate: '2025-12-04',
  publicAssets: [
    {
      dir: 'public',
      baseURL: '/'
    }
  ]
})

