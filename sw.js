const CACHE = 'baby-sleep-v10';
const ASSETS = [
  './',
  './index.html',
  './css/shared.css',
  './css/home.css',
  './css/tips.css',
  './css/environment.css',
  './css/routines.css',
  './css/mybaby.css',
  './js/data.js',
  './js/app.js',
  './manifest.json',
  './icons/favicon.svg'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});

// hub-stats tracker v1
