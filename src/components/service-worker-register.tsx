"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const manifestLink = document.querySelector<HTMLLinkElement>('link[rel="manifest"]');
    const manifestUrl = new URL(manifestLink?.href ?? "manifest.webmanifest", window.location.href);
    const serviceWorkerUrl = new URL("sw.js", manifestUrl);
    const scopeUrl = new URL("./", manifestUrl);

    async function registerAndCacheStaticFiles() {
      try {
        const registration = await navigator.serviceWorker.register(serviceWorkerUrl, { scope: scopeUrl.pathname });
        await navigator.serviceWorker.ready;

        const staticUrls = performance
          .getEntriesByType("resource")
          .map((entry) => entry.name)
          .filter((entryUrl) => {
            const url = new URL(entryUrl);
            return url.origin === window.location.origin && url.pathname.includes("/_next/static/");
          });

        if (registration.active && staticUrls.length > 0) {
          registration.active.postMessage({ type: "CACHE_STATIC_URLS", urls: staticUrls });
        }
      } catch {
        // Offline support is an enhancement. The public workflow remains usable if registration fails.
      }
    }

    void registerAndCacheStaticFiles();
  }, []);

  return null;
}
