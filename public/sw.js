/* global self, caches */

const CACHE_NAME = "rightpath-shell-v3";
const scopeRoot = new URL("./", self.registration.scope).href;
const shellFiles = [
  scopeRoot,
  new URL("manifest.webmanifest", scopeRoot).href,
  new URL("rightpath-icon.svg", scopeRoot).href,
  new URL("favicon.ico", scopeRoot).href,
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(shellFiles)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type !== "CACHE_STATIC_URLS" || !Array.isArray(event.data.urls)) return;

  const safeUrls = [...new Set(event.data.urls)]
    .map((entry) => {
      try {
        return new URL(entry, self.location.origin);
      } catch {
        return null;
      }
    })
    .filter((url) => url && url.origin === self.location.origin && url.pathname.includes("/_next/static/"))
    .map((url) => url.href);

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      Promise.allSettled(
        safeUrls.map(async (url) => {
          const response = await fetch(url);
          if (response.ok) await cache.put(url, response);
        }),
      ),
    ),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const requestUrl = new URL(request.url);
  if (requestUrl.origin !== self.location.origin) return;

  if (requestUrl.pathname.endsWith("/favicon.ico")) {
    event.respondWith(caches.match(request, { ignoreSearch: true }).then((cached) => cached || fetch(request)));
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          void caches.open(CACHE_NAME).then((cache) => cache.put(scopeRoot, copy));
          return response;
        })
        .catch(() => caches.match(scopeRoot)),
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (response.ok) {
          const copy = response.clone();
          void caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return response;
      });
    }),
  );
});
