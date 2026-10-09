// Service worker: keeps a copy of the app so it opens offline, and always tries the network first
// so a new version on the site is picked up as soon as you are online.
// Bump VERSION when files are added or removed.
var VERSION = 'cf-25';
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
  'js/import-companion.js',
  'js/monsters.js',
  'data/monsters.js',
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
    return Promise.all(keys.filter(function (k) { return k !== VERSION && k !== 'cf-share'; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
// Sharing a file to the installed app (Android share menu): keep the file, then open the app to import it.
var SHARE_CACHE = 'cf-share';
self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method === 'POST' && /\/share-target\/?$/.test(new URL(req.url).pathname)) {
    e.respondWith(req.formData().then(function (form) {
      var file = form.getAll('files').filter(function (f) { return f && f.size; })[0];
      var text = form.get('text') || '', title = form.get('title') || '';
      var body = file || new Blob([String(text)], { type: 'text/plain' });
      return caches.open(SHARE_CACHE).then(function (c) {
        return c.put('shared-file', new Response(body, { headers: { 'x-name': encodeURIComponent((file && file.name) || title || 'shared') } }));
      });
    }).then(function () { return Response.redirect('./?shared=1', 303); }, function () { return Response.redirect('./?shared=error', 303); }));
    return;
  }
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(fetch(req).then(function (res) {
    if (res && res.ok) { var copy = res.clone(); caches.open(VERSION).then(function (c) { c.put(req, copy); }); }
    return res;
  }).catch(function () {
    return caches.match(req, { ignoreSearch: true }).then(function (hit) { return hit || (req.mode === 'navigate' ? caches.match('index.html') : undefined); });
  }));
});
