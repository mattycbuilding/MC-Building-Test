/* sw.js — SAFE NETWORK-FIRST (no null responses)
   Fixes: FetchEvent.respondWith received an error: Returned response is null
*/

const CACHE = "mcb-cache-safe-v1";
const CORE_ASSETS = [
  "./",
  "./index.html",
  "./app.js",
  "./styles.css",
  "./manifest.webmanifest",
  "./sync-config.js",
  // If you have icons in root, add them here (optional):
  // "./icon-192.png",
  // "./icon-512.png",
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(CORE_ASSETS)).catch(() => undefined)
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // Clean up old caches
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => (k === CACHE ? Promise.resolve() : caches.delete(k))));
      await self.clients.claim();
    })()
  );
});

// Optional: allow the page to tell SW to activate immediately
self.addEventListener("message", (event) => {
  if (event?.data === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;

  // Never intercept non-GET (e.g. POST to Apps Script). Let it go direct.
  if (req.method !== "GET") return;

  const url = new URL(req.url);

  // Only handle same-origin requests (avoid messing with Google domains)
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    (async () => {
      // Prefer network; fall back to cache; final fallback for navigations is cached index.html
      try {
        const fresh = await fetch(req);
        // Cache successful same-origin responses
        const cache = await caches.open(CACHE);
        cache.put(req, fresh.clone()).catch(() => undefined);
        return fresh;
      } catch (err) {
        const cached = await caches.match(req);
        if (cached) return cached;

        // If it's a navigation, fall back to the app shell
        if (req.mode === "navigate") {
          const shell = await caches.match("./index.html");
          if (shell) return shell;
        }

        // Final safe response (never return null)
        return new Response("Offline", {
          status: 503,
          headers: { "Content-Type": "text/plain; charset=utf-8" },
        });
      }
    })()
  );
});
