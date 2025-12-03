import { defineNitroConfig } from "nitropack/config"

// https://nitro.build/config
export default defineNitroConfig({
    compatibilityDate: "2025-12-03",
    srcDir: "server",
    preset: "netlify",
    experimental: {
        wasm: true
    }
})