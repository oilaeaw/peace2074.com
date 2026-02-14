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

const DEV = process.env.NODE_ENV === 'development';

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
        },
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash][extname]',
      }
    },
    chunkSizeWarningLimit: 600,
    minify: 'esbuild',
    sourcemap: false,
    reportCompressedSize: false,
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
      dirs: ["src/components"],
      include: [/\.vue$/, /\.vue\?vue/],
      dts: "src/types/components.d.ts",
      resolvers: [QuasarResolver()],
    }),

    // https://github.com/antfu/unplugin-auto-import
    AutoImport({
      imports: [
        "vue",
        "vue-router",
        "pinia",
        "vue-i18n",
      ],
      dirs: [
        "src/composables",
      ],
      dts: "src/types/auto-imports.d.ts",
      vueTemplate: true,
    }),

    // PWA configuration
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'public',
      filename: 'sw.js',
      registerType: "autoUpdate",
      injectRegister: 'auto',
      includeAssets: ["favicon.ico", "apple-touch-icon.png", "masked-icon.svg"],
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json}'],
        globIgnores: ['**/node_modules/**/*', 'sw.js', 'workbox-*.js'],
      },
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
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        runtimeCaching: [
          // API requests - Network first with cache fallback
          {
            urlPattern: /^http:\/\/localhost:3000|^https:\/\/peace2074\.com\/api\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-cache-v1",
              networkTimeoutSeconds: 5,
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 12 * 60 * 60, // 12 hours
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          // Quran data - Cache first (static)
          {
            urlPattern: /quran|\/data\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "quran-data-v1",
              expiration: {
                maxEntries: 500,
                maxAgeSeconds: 90 * 24 * 60 * 60, // 90 days
              },
            },
          },
          // Images - Cache first with long expiration
          {
            urlPattern: /\.(?:png|gif|jpg|jpeg|svg|webp|ico)$/,
            handler: "CacheFirst",
            options: {
              cacheName: "image-cache-v1",
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 24 * 60 * 60, // 60 days
              },
            },
          },
          // Fonts - Cache first with long expiration
          {
            urlPattern: /\.(?:woff|woff2|ttf|otf|eot)$/,
            handler: "CacheFirst",
            options: {
              cacheName: "font-cache-v1",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 90 * 24 * 60 * 60, // 90 days
              },
            },
          },
          // CSS and JS bundles - Stale while revalidate
          {
            urlPattern: /\.(?:js|css)$/,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "bundle-cache-v1",
              expiration: {
                maxEntries: 100,
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

  optimizeDeps: {
    include: ['vue', 'vue-router', 'pinia', 'quasar', 'vue-i18n'],
    exclude: ['three'],
    esbuildOptions: {
      target: 'esnext',
    },
    entries: ['src/main.ts'],
    holdersOnly: true,
  },

  server: {
    port: 4000,
    middlewareMode: false,
    hmr: {
      host: 'localhost',
      port: 4000,
      protocol: 'ws',
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
    headers: {
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      'ETag': 'disable',
      'Last-Modified': 'disable',
    },
  },
});
