const CACHE = "budget-v5";
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

// Beim Laden: erst aus dem Netz holen (immer aktuell), offline aus dem Speicher
self.addEventListener("fetch", function (e) {
  e.respondWith(
    fetch(e.request)
      .then(function (antwort) {
        const kopie = antwort.clone();
        caches.open(CACHE).then(function (c) { c.put(e.request, kopie); });
        return antwort;
      })
      .catch(function () {
        return caches.match(e.request);
      })
  );
});