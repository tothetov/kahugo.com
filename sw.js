/* KAHUGO Platform · service worker v2.2
   오프라인 셸 캐시. 실패해도 앱 동작을 막지 않습니다. */
var CACHE = 'kahugo-v2-2-0';
var SHELL = [
  './', './index.html', './styles.css', './data.js', './book.js', './app.js',
  './manifest.webmanifest',
  './assets/kahugo-mark.svg', './assets/favicon.svg', './assets/icon-192.png', './assets/og.png',
  './assets/book-cover-dark.jpg', './assets/book-cover-light.jpg', './assets/book-cover-thumb.jpg'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) {
      return Promise.all(SHELL.map(function (u) {
        return c.add(u).catch(function () { /* 개별 실패 무시 */ });
      }));
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (ks) {
      return Promise.all(ks.map(function (k) { return k === CACHE ? null : caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  e.respondWith(
    caches.match(req).then(function (hit) {
      var net = fetch(req).then(function (res) {
        if (res && res.status === 200 && res.type === 'basic') {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put(req, copy); });
        }
        return res;
      }).catch(function () {
        return hit || caches.match('./index.html');
      });
      return hit || net;
    })
  );
});
