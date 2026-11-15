/* KAHUGO 9차 서비스워커 — 화면 파일은 '네트워크 우선'(새 버전 즉시 반영), 이미지는 '캐시 우선' */
var V = 'kahugo-v9.0.0';
var CORE = ['./', 'index.html', 'assets/css/app.css', 'assets/js/data.js', 'assets/js/books.js', 'assets/js/core.js', 'assets/js/views.js',
  'assets/img/kahugo-mark.svg', 'assets/img/icon-192.png', 'assets/img/book-cover-thumb.jpg', 'manifest.webmanifest'];
self.addEventListener('install', function (e) { e.waitUntil(caches.open(V).then(function (c) { return c.addAll(CORE); }).then(function () { return self.skipWaiting(); })); });
self.addEventListener('activate', function (e) { e.waitUntil(caches.keys().then(function (ks) { return Promise.all(ks.filter(function (k) { return k !== V; }).map(function (k) { return caches.delete(k); })); }).then(function () { return self.clients.claim(); })); });
self.addEventListener('fetch', function (e) {
  var u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;
  if (u.pathname.indexOf('/api/') === 0 || u.pathname.indexOf('/admin') === 0 || u.pathname.indexOf('site-config.json') > -1) return; // 실시간 데이터·관리자는 캐시 금지
  if (/\.(png|jpg|jpeg|svg|ico|webp)$/.test(u.pathname)) {
    e.respondWith(caches.match(e.request).then(function (r) { return r || fetch(e.request).then(function (res) { var cp = res.clone(); caches.open(V).then(function (c) { c.put(e.request, cp); }); return res; }); }));
    return;
  }
  e.respondWith(fetch(e.request).then(function (res) { var cp = res.clone(); caches.open(V).then(function (c) { c.put(e.request, cp); }); return res; }).catch(function () { return caches.match(e.request).then(function (r) { return r || caches.match('index.html'); }); }));
});
