// offline functionality adapted from: https://www.simicart.com/blog/pwa-offline/#:~:text=using%20Chrome%20DevTools-,Caching%20your%20resources,there's%20a%20limit%20to%20it.

const assets = [
  "images/paint-brush64x64.png",
  "images/paint-brush256x256.png",
  "images/paint-brush512x512.png",
  "/index.css",
  "/index.html",
  "/"
];

// Cached core static resources for offline performance
self.addEventListener("install",e=>{
  // we use the waitUntil() method to make sure that the SW installation 
  // isn't completed until the provided promise is resolved
    e.waitUntil(
      caches.open("static").then(cache=>{
        // we want to cache the HTML, CSS, JS and image files
        return cache.addAll(assets);
      })
    );
  });
  
  // Fatch resources when the web page makes a network request
  // such as for images, script or API calls
  self.addEventListener("fetch",e=>{
    e.respondWith(
      // this will check to find a match for the incoming request
      // in the cache storage
      caches.match(e.request).then(response=>{
        return response||fetch(e.request);
      })
    );
  });