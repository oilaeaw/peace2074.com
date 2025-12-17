import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { quasar } from '@quasar/vite-plugin'
import Components from "unplugin-vue-components/vite";
import { QuasarResolver } from 'unplugin-vue-components/resolvers'
import AutoImport from "unplugin-auto-import/vite";
import { fileURLToPath, URL } from "node:url";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue({ template: { transformAssetUrls: { /* defaults ok */ } } }),
    quasar(),

    // https://github.com/antfu/unplugin-vue-components
    Components({
      extensions: ["vue"],
      dirs: ["src/core/components", "src/modules/**/components"],
      include: [/\.vue$/, /\.vue\?vue/],
      dts: "src/types/components.d.ts",
      resolvers: [QuasarResolver()],
    }),

    // https://github.com/antfu/unplugin-auto-import
    AutoImport({
      imports: ["vue", "vue-router", "pinia"],
      dirs: [
        "src/modules/**/composables",
        "src/modules/**/store",
        // Avoid duplicate auto-imports between re-exports and source files
        "src/core/composables/useLayout.ts",
        {
          glob: "src/modules/**/store",
          types: true,
        },
      ],
      dts: "src/types/auto-imports.d.ts",
      vueTemplate: true,
    }),
  ],

  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "~": fileURLToPath(new URL("./src", import.meta.url)),
      "~/assets": fileURLToPath(new URL("./src/assets", import.meta.url)),
      "~/store": fileURLToPath(new URL("./src/stores", import.meta.url)),
      "~/app": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },

  css: {
    devSourcemap: true,
  },

  server: {
    port: 3000,
  },
});
