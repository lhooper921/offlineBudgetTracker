const CACHE_NAME = "static-cache-v2";
const DATA_CACHE_NAME = "data-cache-v1";
const FILES_TO_CACHE = [
  "/", 
  "/db.js",
  "/index.js",
  "/styles.css",
  "/index.html",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
  "/manifest.webmanifest",
  "/favicon.ico"
 ]
  
  
  // install 
  // Service Worker gives you an install event. You can use this to get stuff ready, stuff that must be ready before you handle other events. While this happens any previous version of your Service Worker is still running and serving pages, so the things you do here mustn't disrupt that.

  self.addEventListener("install", function (evt) {

    // pre cache transaction data

    // event.waitUntil takes a promise to define the length and success of the install. If the promise rejects, the installation is considered a failure and this Service Worker will be abandoned (if an older version is running, it'll be left intact). caches.open() and cache.addAll() return promises. If any of the resources fail to be fetched, the cache.addAll() call rejects.
    evt.waitUntil(
       
      caches.open(DATA_CACHE_NAME).then((cache) => cache.add("/api/transaction"))
      );
      
    // pre cache all static assets
    evt.waitUntil(
      caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES_TO_CACHE))
    );

    // tell the browser to activate this service worker immediately once it
    // has finished installing

   
    self.skipWaiting();
  });





// activate
self.addEventListener("activate", function(evt) {
  evt.waitUntil(
    caches.keys().then(keyList => {
      return Promise.all(
        keyList.map(key => {
          if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
            console.log("Removing old cache data", key);
            return caches.delete(key);
          }
        })
      );
    })
  );

  self.clients.claim();
});
// fetch
self.addEventListener("fetch", function(evt) {
  if (evt.request.url.includes("/api/")) {
    evt.respondWith(
      caches.open(DATA_CACHE_NAME).then(cache => {
        return fetch(evt.request)
          .then(response => {
            // If the response was good, clone it and store it in the cache.
            if (response.status === 200) {
              cache.put(evt.request.url, response.clone());
            }

            return response;
          })
          .catch(err => {
            // Network request failed, try to get it from the cache.
            return cache.match(evt.request);
          });
      }).catch(err => console.log(err))
    );

    return;
  }

  evt.respondWith(
    caches.open(CACHE_NAME).then(cache => {
      return cache.match(evt.request).then(response => {
        return response || fetch(evt.request);
      });
    })
  );

 

});  
  
