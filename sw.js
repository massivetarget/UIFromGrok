const CACHE_NAME = "journal-pwa-cache-v1";

const URLS_TO_CACHE = ["/6pwaServiceWorker.html", "/all.min.css"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(URLS_TO_CACHE))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});




// const CACHE_NAME = "journal-pwa-cache-v1";

// const URLS_TO_CACHE = ["6pwaServiceWorker.html", "/all.min.css"];

// self.addEventListener("install", (event) => {
//   event.waitUntil(
//     caches.open(CACHE_NAME).then((cache) => cache.addAll(URLS_TO_CACHE))
//   );
// });

// self.addEventListener("fetch", (event) => {
//   event.respondWith(
//     caches.match(event.request).then((response) => {
//       return response || fetch(event.request);
//     })
//   );
// });




// const CACHE_NAME = "journal-pwa-cache-v1";
// const URLS_TO_CACHE = ["/5pwa.html", "/all.min.css"];

// self.addEventListener("install", (event) => {
//   event.waitUntil(
//     caches.open(CACHE_NAME).then((cache) => cache.addAll(URLS_TO_CACHE))
//   );
// });

// self.addEventListener("fetch", (event) => {
//   event.respondWith(
//     caches.match(event.request).then(
//       (response) => response || fetch(event.request)
//     )
//   );
// });
