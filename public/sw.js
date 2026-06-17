/** LifeCycle PWA Service Worker (webapp 셸) */
const CACHE = "lifecycle-shell-v3";

const SHELL_PATHS = [
  "./",
  "./stats/",
  "./items/",
  "./settings/",
  "./settings/login/",
  "./icons/icon.svg",
  "./manifest.webmanifest",
];

self.addEventListener("install", (event) => {
  const base = new URL(".", self.location).href;
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) =>
        Promise.all(
          SHELL_PATHS.map((path) =>
            cache.add(new URL(path, base).href).catch(() => undefined)
          )
        )
      )
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

function isApiRequest(url) {
  return (
    url.hostname.includes("supabase.co") ||
    url.pathname.includes("/auth/v1/")
  );
}

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  if (event.request.method !== "GET") return;
  if (isApiRequest(url)) return;

  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(async () => {
        const cached = await caches.match(event.request);
        if (cached) return cached;
        const base = new URL(".", self.location).href;
        const fallback = await caches.match(new URL("./", base).href);
        return fallback ?? Response.error();
      })
    );
    return;
  }

  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.ok) {
          const copy = response.clone();
          void caches.open(CACHE).then((cache) => cache.put(event.request, copy));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type !== "SHOW_REMINDERS") return;
  const notifications = event.data.notifications ?? [];
  const base = new URL(".", self.location).href;

  for (const n of notifications) {
    const icon = n.icon ? new URL(n.icon, base).href : undefined;
    void self.registration.showNotification(n.title, {
      body: n.body,
      tag: n.tag,
      icon,
      data: { url: n.url ?? "./" },
    });
  }
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = event.notification.data?.url ?? "./";
  const targetUrl = new URL(target, self.location).href;

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((list) => {
        for (const client of list) {
          if (client.url.startsWith(self.registration.scope) && "focus" in client) {
            return client.focus();
          }
        }
        return clients.openWindow(targetUrl);
      })
  );
});
