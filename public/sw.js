/* eslint-disable no-restricted-globals */
/**
 * Service Worker for PEACE2074
 * Handles push notifications and PWA caching
 */

// Import Workbox from CDN
importScripts(
  "https://storage.googleapis.com/workbox-cdn/releases/7.0.0/workbox-sw.js",
);

if (workbox) {
  console.log("[SW] Workbox loaded");

  // Precache manifest will be injected here by vite-plugin-pwa
  workbox.precaching.precacheAndRoute(self.__WB_MANIFEST || []);

  // Cleanup old caches
  workbox.precaching.cleanupOutdatedCaches();

  // Runtime caching strategies
  // API requests - Network first
  workbox.routing.registerRoute(
    ({ url }) => url.pathname.startsWith("/api/"),
    new workbox.strategies.NetworkFirst({
      cacheName: "api-cache-v1",
      networkTimeoutSeconds: 5,
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 100,
          maxAgeSeconds: 12 * 60 * 60,
        }),
      ],
    }),
  );

  // Quran data - Cache first
  workbox.routing.registerRoute(
    ({ url }) =>
      url.pathname.includes("/quran") || url.pathname.includes("/data/"),
    new workbox.strategies.CacheFirst({
      cacheName: "quran-data-v1",
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 500,
          maxAgeSeconds: 90 * 24 * 60 * 60,
        }),
      ],
    }),
  );

  // Images - Cache first
  workbox.routing.registerRoute(
    ({ request }) => request.destination === "image",
    new workbox.strategies.CacheFirst({
      cacheName: "image-cache-v1",
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 200,
          maxAgeSeconds: 60 * 24 * 60 * 60,
        }),
      ],
    }),
  );

  // Cleanup old caches
  workbox.precaching.cleanupOutdatedCaches();
} else {
  console.error("[SW] Workbox failed to load");
}

// Skip waiting and claim clients
self.skipWaiting();
self.clients.claim();

self.addEventListener("install", (event) => {
  console.log("[Service Worker] Installing...");
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("[Service Worker] Activating...");
  event.waitUntil(clients.claim());
});

// Listen for push events
self.addEventListener("push", (event) => {
  console.log("[Service Worker] Push received:", event);

  let notificationData = {
    title: "PEACE2074",
    body: "You have a new notification",
    icon: "/android-chrome-192x192.png",
    badge: "/android-chrome-192x192.png",
    data: {
      url: "/",
    },
  };

  // Parse push data if available
  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = {
        title: data.title || notificationData.title,
        body: data.body || notificationData.body,
        icon: data.icon || notificationData.icon,
        badge: data.badge || notificationData.badge,
        data: data.data || notificationData.data,
        tag: data.tag || "peace2074-notification",
        requireInteraction: data.requireInteraction || false,
      };
    } catch (e) {
      console.error("[Service Worker] Error parsing push data:", e);
    }
  }

  // Show the notification
  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      data: notificationData.data,
      tag: notificationData.tag,
      requireInteraction: notificationData.requireInteraction,
      vibrate: [200, 100, 200],
    }),
  );
});

// Listen for notification clicks
self.addEventListener("notificationclick", (event) => {
  console.log("[Service Worker] Notification clicked:", event);

  event.notification.close();

  // Get URL from notification data
  const urlToOpen = event.notification.data?.url || "/";

  // Open the URL
  event.waitUntil(
    // eslint-disable-next-line no-undef
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // Check if there's already a window open
        for (const client of clientList) {
          if (client.url === urlToOpen && "focus" in client) {
            return client.focus();
          }
        }
        // If not, open a new window
        // eslint-disable-next-line no-undef
        if (clients.openWindow) {
          // eslint-disable-next-line no-undef
          return clients.openWindow(urlToOpen);
        }
      }),
  );
});
