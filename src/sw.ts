/// <reference lib="webworker" />
/* eslint-disable no-restricted-globals */

import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching'
import { registerRoute, NavigationRoute } from 'workbox-routing'
import {
  NetworkFirst,
  CacheFirst,
  StaleWhileRevalidate,
} from 'workbox-strategies'
import { ExpirationPlugin } from 'workbox-expiration'
import { CacheableResponsePlugin } from 'workbox-cacheable-response'

declare const self: ServiceWorkerGlobalScope

// ── Precache (manifest injected by vite-plugin-pwa) ──────────────────────────
precacheAndRoute(self.__WB_MANIFEST)
cleanupOutdatedCaches()

// ── Skip waiting only when explicitly asked ───────────────────────────────────
// NOT on install — prevents mid-navigation hard reloads
self.addEventListener('message', (event) => {
  if (event?.data?.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

// ── Navigation (SPA shell) — Network first, 5s timeout ───────────────────────
registerRoute(
  new NavigationRoute(
    new NetworkFirst({
      cacheName: 'app-shell-v3',
      networkTimeoutSeconds: 5,
      plugins: [
        new ExpirationPlugin({
          maxEntries: 20,
          maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
        }),
        new CacheableResponsePlugin({ statuses: [0, 200] }),
      ],
    }),
    {
      denylist: [/^\/auth\//, /^\/api\//],
    }
  )
)

// ── API — Network first ───────────────────────────────────────────────────────
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkFirst({
    cacheName: 'api-cache-v3',
    networkTimeoutSeconds: 5,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 12 * 60 * 60, // 12 h
      }),
      new CacheableResponsePlugin({ statuses: [0, 200] }),
    ],
  })
)

// ── Quran data — Cache first (near-static) ────────────────────────────────────
registerRoute(
  ({ url }) =>
    url.pathname.includes('/quran') || url.pathname.includes('/data/'),
  new CacheFirst({
    cacheName: 'quran-data-v3',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 500,
        maxAgeSeconds: 90 * 24 * 60 * 60, // 90 days
      }),
      new CacheableResponsePlugin({ statuses: [0, 200] }),
    ],
  })
)

// ── Images — Cache first ──────────────────────────────────────────────────────
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'image-cache-v3',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 200,
        maxAgeSeconds: 60 * 24 * 60 * 60, // 60 days
      }),
      new CacheableResponsePlugin({ statuses: [0, 200] }),
    ],
  })
)

// ── Fonts — Cache first ───────────────────────────────────────────────────────
registerRoute(
  ({ request }) => request.destination === 'font',
  new CacheFirst({
    cacheName: 'font-cache-v3',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 90 * 24 * 60 * 60, // 90 days
      }),
      new CacheableResponsePlugin({ statuses: [0, 200] }),
    ],
  })
)

// ── JS/CSS bundles — Stale-while-revalidate ───────────────────────────────────
registerRoute(
  ({ request }) =>
    request.destination === 'script' || request.destination === 'style',
  new StaleWhileRevalidate({
    cacheName: 'bundle-cache-v3',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
      }),
    ],
  })
)

// ── Activate: claim clients immediately ──────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

// ── Push notifications ────────────────────────────────────────────────────────
self.addEventListener('push', (event) => {
  let notificationData: {
    title: string
    body: string
    icon: string
    badge: string
    data: { url: string }
    tag?: string
    requireInteraction?: boolean
  } = {
    title: 'PEACE2074',
    body: 'You have a new notification',
    icon: '/android-chrome-192x192.png',
    badge: '/android-chrome-192x192.png',
    data: { url: '/' },
  }

  if (event.data) {
    try {
      const data = event.data.json()
      notificationData = {
        title: data.title || notificationData.title,
        body: data.body || notificationData.body,
        icon: data.icon || notificationData.icon,
        badge: data.badge || notificationData.badge,
        data: data.data || notificationData.data,
        tag: data.tag || 'peace2074-notification',
        requireInteraction: data.requireInteraction || false,
      }
    } catch {
      // keep defaults
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      data: notificationData.data,
      tag: notificationData.tag,
      requireInteraction: notificationData.requireInteraction,
      vibrate: [200, 100, 200],
    } as NotificationOptions & { vibrate?: number[] })
  )
})

// ── Notification click ────────────────────────────────────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const urlToOpen = (event.notification.data as { url?: string })?.url || '/'

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus()
          }
        }
        return self.clients.openWindow(urlToOpen)
      })
  )
})
