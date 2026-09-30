const CACHE = "budget-v4";
const DATEIEN = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
];

// Beim Installieren: alle Dateien zwischenspeichern
self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(DATEIEN); }));
});

// Alte Caches aufräumen
self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (namen) {
      return Promise.all(
        namen.filter(function (n) { return n !== CACHE; })
             .map(function (n) { return caches.delete(n); })
      );
    })
  );
});

// Beim Laden: erst im Speicher schauen, sonst aus dem Netz holen
self.addEventListener("fetch", function (e) {
  e.respondWith(
    caches.match(e.request).then(function (treffer) {
      return treffer || fetch(e.request);
    })
  );
});