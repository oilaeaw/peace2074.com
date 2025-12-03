// Dev placeholder to avoid noisy 404s and HTML error overlays in terminal when browsers request /sw.js without PWA enabled.
// This file is intentionally minimal.
self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', () => self.clients.claim())
