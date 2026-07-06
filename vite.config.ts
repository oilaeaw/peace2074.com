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
const DEV_SERVER_HOST = process.env.VITE_DEV_HOST?.trim() || undefined;

// https://vitejs.dev/config/
export default defineConfig({
  base: "/",
  esbuild: {
    // Strip console and debugger calls from production builds
    drop: DEV ? [] : ['console', 'debugger'],
  },
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
    // strategies: 'injectManifest' — we own src/sw.ts; Workbox is bundled
    // locally so the SW never fetches from the CDN (which breaks offline).
    // registerType: 'prompt' — the app NEVER auto-reloads mid-navigation;
    // users see the "Update available" banner and choose when to refresh.
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      registerType: 'prompt',
      injectRegister: 'auto',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,woff,woff2}'],
        globIgnores: [
          '**/node_modules/**/*',
          'sw.js',
          'workbox-*.js',
          '**/data/quran.json',
        ],
        // Locale bundles can exceed Workbox's default 2 MiB precache cap.
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
      },
      manifest: {
        name: 'Peace2074 - Islamic Knowledge Platform',
        short_name: 'Peace2074',
        description:
          'Multi-language Islamic knowledge platform featuring Quran, Tasbeeh, and more',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/android-chrome-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/maskable-icon.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
        screenshots: [
          {
            src: '/512x512.png',
            sizes: '512x512',
            type: 'image/png',
            form_factor: 'wide',
          },
          {
            src: '/android-chrome-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            form_factor: 'narrow',
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
      // @waelio/realdb v0.1.0 ships CJS only — point Vite to the correct entry
      "@waelio/realdb": fileURLToPath(new URL("./node_modules/@waelio/realdb/lib/index.js", import.meta.url)),
    },
  },

  css: {
    devSourcemap: true,
  },

  optimizeDeps: {
    include: ['vue', 'vue-router', 'pinia', 'quasar', 'vue-i18n', '@waelio/realdb'],
    exclude: ['three'],
    esbuildOptions: {
      target: 'esnext',
    },
    entries: ['src/main.ts'],
  },

  server: {
    host: DEV_SERVER_HOST,
    port: 4000,
    middlewareMode: false,
    hmr: {
      host: DEV_SERVER_HOST || 'localhost',
      port: 4000,
      protocol: 'ws',
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        ws: true,
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
