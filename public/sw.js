/** webapp 셸 전용 — install + offline shell (C-1) */
self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

/** API(Supabase)는 항상 네트워크. 정적 자산만 캐시(선택적). */
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (url.hostname.includes("supabase.co")) {
    return;
  }
  if (event.request.method !== "GET") {
    return;
  }
  event.respondWith(
    caches.open("lifecycle-static-v1").then((cache) =>
      fetch(event.request)
        .then((response) => {
          if (response.ok && url.origin === self.location.origin) {
            cache.put(event.request, response.clone());
          }
          return response;
        })
        .catch(() => cache.match(event.request))
    )
  );
});
