import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { quasar } from "@quasar/vite-plugin";
import Components from "unplugin-vue-components/vite";
import { QuasarResolver } from "unplugin-vue-components/resolvers";
import AutoImport from "unplugin-auto-import/vite";
import { VitePWA } from "vite-plugin-pwa";
import VueRouter from "unplugin-vue-router/vite";
import { fileURLToPath, URL } from "node:url";
import fs from "node:fs";

const pkg = JSON.parse(
  fs.readFileSync(new URL("./package.json", import.meta.url), "utf-8")
);

// https://vitejs.dev/config/
export default defineConfig({
  base: "/",
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-vue': ['vue', 'vue-router', 'pinia'],
          'vendor-quasar': ['quasar'],
          'vendor-i18n': ['vue-i18n'],
          'three': ['three'],
        }
      }
    },
    chunkSizeWarningLimit: 600,
  },
  plugins: [
    // https://github.com/posva/unplugin-vue-router
    VueRouter({
      routesFolder: "src/views",
      extensions: [".vue"],
      dts: "src/types/typed-router.d.ts",
    }),

    vue({
      template: {
        transformAssetUrls: {
          /* defaults ok */
        },
      },
    }),
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
      imports: ["vue", "vue-router", "pinia", "vue-i18n"],
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

    // PWA configuration
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "apple-touch-icon.png", "masked-icon.svg"],
      manifest: {
        name: "Peace2074 - Islamic Knowledge Platform",
        short_name: "Peace2074",
        description:
          "Multi-language Islamic knowledge platform featuring Quran, Tasbeeh, and more",
        theme_color: "#ffffff",
        background_color: "#ffffff",
        display: "standalone",
        scope: "/",
        start_url: "/",
        icons: [
          {
            src: "/android-chrome-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/maskable-icon.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable",
          },
        ],
        screenshots: [
          {
            src: "/512x512.png",
            sizes: "512x512",
            type: "image/png",
            form_factor: "wide",
          },
          {
            src: "/android-chrome-192x192.png",
            sizes: "192x192",
            type: "image/png",
            form_factor: "narrow",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,json}"],
        navigateFallbackDenylist: [/^\/auth\//, /^\/api\//],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.example\.com\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-cache",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 24 * 60 * 60, // 1 day
              },
            },
          },
          {
            urlPattern: /\.(?:png|gif|jpg|jpeg|svg|webp|ico)$/,
            handler: "CacheFirst",
            options: {
              cacheName: "image-cache",
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
              },
            },
          },
        ],
      },
    }),
  ],

  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "~": fileURLToPath(new URL("./src", import.meta.url)),
      "~/assets": fileURLToPath(new URL("./src/assets", import.meta.url)),
      "~/store": fileURLToPath(new URL("./src/stores", import.meta.url)),
      "~/app": fileURLToPath(new URL("./src", import.meta.url)),
      "@shared": fileURLToPath(new URL("./src/shared", import.meta.url)),
    },
  },

  css: {
    devSourcemap: true,
  },

  server: {
    port: 4000,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});
