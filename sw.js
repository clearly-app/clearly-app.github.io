// Bump the version number whenever you change your site files, so users get the update.
const V = "clearly-v1";
const FILES = ["./", "index.html", "studio.html", "gallery.html", "features.html", "customize.html", "about.html",
  "style.css", "theme.css", "site.js", "script.js", "studio-tools.js", "icon-192.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(V).then((c) => c.addAll(FILES)));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== V).map((k) => caches.delete(k)))));
  self.clients.claim();
});

// show the saved copy instantly, and refresh it in the background
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request).then((hit) => {
      const net = fetch(e.request)
        .then((r) => {
          if (r.ok || r.type === "opaque") {
            const copy = r.clone();
            caches.open(V).then((c) => c.put(e.request, copy));
          }
          return r;
        })
        .catch(() => hit);
      return hit || net;
    })
  );
});
