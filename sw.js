// Service worker: keeps a copy of the app so it opens offline, and always tries the network first
// so a new version on the site is picked up as soon as you are online.
// Bump VERSION when files are added or removed.
var VERSION = 'cf-6';
var FILES = [
  './',
  'index.html',
  'manifest.webmanifest',
  'icons/favicon-32.png',
  'icons/apple-touch-icon.png',
  'css/style.css',
  'data/equipment.js',
  'data/classes.js',
  'data/subclasses-1.js',
  'data/subclasses-2.js',
  'data/subclasses-3.js',
  'data/subclasses-4.js',
  'data/subclasses-5.js',
  'data/subclasses-6.js',
  'data/lineages-1.js',
  'data/lineages-2.js',
  'data/lineages-3.js',
  'data/options.js',
  'data/backgrounds-1.js',
  'data/backgrounds-2.js',
  'data/feats-1.js',
  'data/feats-2.js',
  'data/spells.js',
  'data/spell-lists.js',
  'data/text-spells.js',
  'data/text-features.js',
  'data/items.js',
  'js/rules.js',
  'js/avatar.js',
  'js/sqlite-read.js',
  'js/import-5e.js',
  'js/app.js',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/maskable-512.png'
];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(VERSION).then(function (c) { return c.addAll(FILES); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== VERSION; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(fetch(req).then(function (res) {
    if (res && res.ok) { var copy = res.clone(); caches.open(VERSION).then(function (c) { c.put(req, copy); }); }
    return res;
  }).catch(function () {
    return caches.match(req, { ignoreSearch: true }).then(function (hit) { return hit || (req.mode === 'navigate' ? caches.match('index.html') : undefined); });
  }));
});
