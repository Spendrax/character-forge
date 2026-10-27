// Service worker: keeps a copy of the app so it opens at once, even offline or on a weak connection: the app's
// files come from the copy, not the network. A new version (a new VERSION here) is fetched in the background; the
// page then offers "Update now" (js/boot.js), which switches to it and reloads. Until then the old copy keeps
// serving, so the page never mixes files from two versions.
// Bump VERSION whenever any file changes, or the change never reaches installed apps.
var VERSION = 'cf-135';
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
  'js/icons.js',
  'js/dice3d.js',
  'js/ai.js',
  'js/rules.js',
  'js/avatar.js',
  'js/sqlite-read.js',
  'js/import-5e.js',
  'js/import-companion.js',
  'js/import-ddb.js',
  'js/transfer.js',
  'js/table.js',
  'js/note-style.js',
  'js/torch.js',
  'js/table-ui.js',
  'js/party-table.js',
  'js/table-share.js',
  'js/vendor/peerjs.min.js',
  'js/vendor/qrcode.js',
  'js/item-import.js',
  'js/monsters.js',
  'js/saved-enc.js',
  'js/encounter.js',
  'js/treasure.js',
  'js/generators.js',
  'js/dm.js',
  'data/mm.js',
  'js/mm.js',
  'js/sd.js',
  'js/mm-foes.js',
  'js/mm-enc.js',
  'js/pf2.js',
  'js/pf2-import.js',
  'js/pf2-enc.js',
  'js/pf2-ui-build.js',
  'js/pf2-ui-sheet.js',
  'js/pf2-ui-gear.js',
  'js/pf2-ui-rules.js',
  'js/pf2-ui-actions.js',
  'js/pf2-ui.js',
  'js/spotify.js',
  'js/gdrive.js',
  'js/backup-ui.js',
  'js/audio.js',
  'data/sounds.js',
  'js/sounds.js',
  'sounds/alien_01.mp3',
  'sounds/alien_02.mp3',
  'sounds/alien_03.mp3',
  'sounds/alien_04.mp3',
  'sounds/alien_05.mp3',
  'sounds/alien_06.mp3',
  'sounds/alien_07.mp3',
  'sounds/alien_08.mp3',
  'sounds/alien_09.mp3',
  'sounds/alien_10.mp3',
  'sounds/alien_11.mp3',
  'sounds/alien_12.mp3',
  'sounds/attack_01.mp3',
  'sounds/attack_02.mp3',
  'sounds/attack_03.mp3',
  'sounds/attack_04.mp3',
  'sounds/attack_05.mp3',
  'sounds/barking_01.mp3',
  'sounds/barking_02.mp3',
  'sounds/breath.mp3',
  'sounds/breath_02.mp3',
  'sounds/bug_01.mp3',
  'sounds/bug_02.mp3',
  'sounds/bug_03.mp3',
  'sounds/bug_04.mp3',
  'sounds/bug_05.mp3',
  'sounds/bug_06.mp3',
  'sounds/bug_07.mp3',
  'sounds/bug_08.mp3',
  'sounds/bug_09.mp3',
  'sounds/bug_10.mp3',
  'sounds/bug_11.mp3',
  'sounds/bug_12.mp3',
  'sounds/bug_13.mp3',
  'sounds/burble_01.mp3',
  'sounds/burble_02.mp3',
  'sounds/die_01.mp3',
  'sounds/die_02.mp3',
  'sounds/die_03.mp3',
  'sounds/die_04.mp3',
  'sounds/grunt_01.mp3',
  'sounds/grunt_02.mp3',
  'sounds/grunt_03.mp3',
  'sounds/grunt_04.mp3',
  'sounds/grunt_05.mp3',
  'sounds/grunt_06.mp3',
  'sounds/grunt_07.mp3',
  'sounds/grunt_08.mp3',
  'sounds/grunt_09.mp3',
  'sounds/howl.mp3',
  'sounds/human_01.mp3',
  'sounds/human_02.mp3',
  'sounds/human_03.mp3',
  'sounds/human_04.mp3',
  'sounds/human_05.mp3',
  'sounds/human_06.mp3',
  'sounds/human_07.mp3',
  'sounds/human_08.mp3',
  'sounds/hurt_01.mp3',
  'sounds/hurt_02.mp3',
  'sounds/hurt_03.mp3',
  'sounds/hurt_04.mp3',
  'sounds/hurt_05.mp3',
  'sounds/monster_01.mp3',
  'sounds/monster_02.mp3',
  'sounds/monster_03.mp3',
  'sounds/monster_04.mp3',
  'sounds/monster_05.mp3',
  'sounds/monster_06.mp3',
  'sounds/monster_07.mp3',
  'sounds/monster_08.mp3',
  'sounds/monster_09.mp3',
  'sounds/monster_10.mp3',
  'sounds/monster_11.mp3',
  'sounds/monster_12.mp3',
  'sounds/monster_13.mp3',
  'sounds/monster_14.mp3',
  'sounds/monster_15.mp3',
  'sounds/monster_16.mp3',
  'sounds/monster_17.mp3',
  'sounds/monster_18.mp3',
  'sounds/monster_19.mp3',
  'sounds/monster_20.mp3',
  'sounds/roar_01.mp3',
  'sounds/roar_02.mp3',
  'sounds/roar_03.mp3',
  'sounds/roar_04.mp3',
  'sounds/roar_05.mp3',
  'sounds/roar_06.mp3',
  'sounds/scream_01.mp3',
  'sounds/scream_02.mp3',
  'sounds/slime_01.mp3',
  'sounds/slime_02.mp3',
  'sounds/slime_03.mp3',
  'sounds/slime_04.mp3',
  'sounds/slime_05.mp3',
  'sounds/slime_06.mp3',
  'sounds/slime_07.mp3',
  'sounds/slime_08.mp3',
  'sounds/stomp_01.mp3',
  'sounds/troll_01.mp3',
  'sounds/troll_02.mp3',
  'sounds/troll_03.mp3',
  'sounds/weird_01.mp3',
  'sounds/weird_02.mp3',
  'sounds/weird_03.mp3',
  'sounds/weird_04.mp3',
  'sounds/weird_05.mp3',
  'sounds/weird_06.mp3',
  'sounds/weird_07.mp3',
  'sounds/weird_08.mp3',
  'sounds/weird_09.mp3',
  'js/books.js',
  'data/monsters.js',
  'data/srd-book.js',
  'js/boot.js',
  'js/app/core.js',
  'js/app/widgets.js',
  'js/app/builder.js',
  'js/app/spells.js',
  'js/app/session.js',
  'js/app/equipment.js',
  'js/app/items.js',
  'js/app/characters.js',
  'js/app/sheet.js',
  'js/app/frame.js',
  'js/app/helper-bridge.js',
  'js/app/actions.js',
  'js/app/levelup.js',
  'js/app/events.js',
  'js/app/main.js',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/maskable-512.png'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(VERSION).then(function (c) {
      // fresh from the site, not from the browser's own short-term cache
      return c.addAll(
        FILES.map(function (f) {
          return new Request(f, { cache: 'reload' });
        })
      );
    })
  );
});
// "Update now" on the page: this new version takes over (the page then reloads)
self.addEventListener('message', function (e) {
  if (e.data === 'skip') self.skipWaiting();
});
self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches
      .keys()
      .then(function (keys) {
        return Promise.all(
          keys
            .filter(function (k) {
              return k !== VERSION && k !== 'cf-share';
            })
            .map(function (k) {
              return caches.delete(k);
            })
        );
      })
      .then(function () {
        return self.clients.claim();
      })
  );
});
// Sharing a file to the installed app (Android share menu): keep the file, then open the app to import it.
var SHARE_CACHE = 'cf-share';
self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method === 'POST' && /\/share-target\/?$/.test(new URL(req.url).pathname)) {
    e.respondWith(
      req
        .formData()
        .then(function (form) {
          var file = form.getAll('files').filter(function (f) {
            return f && f.size;
          })[0];
          var text = form.get('text') || '',
            title = form.get('title') || '';
          var body = file || new Blob([String(text)], { type: 'text/plain' });
          return caches.open(SHARE_CACHE).then(function (c) {
            return c.put(
              'shared-file',
              new Response(body, {
                headers: { 'x-name': encodeURIComponent((file && file.name) || title || 'shared') }
              })
            );
          });
        })
        .then(
          function () {
            return Response.redirect('./?shared=1', 303);
          },
          function () {
            return Response.redirect('./?shared=error', 303);
          }
        )
    );
    return;
  }
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  // the copy first (the page itself for any address of the app); what isn't there yet is fetched and kept
  var key = req.mode === 'navigate' ? 'index.html' : req;
  e.respondWith(
    caches.open(VERSION).then(function (c) {
      return c.match(key, { ignoreSearch: true }).then(function (hit) {
        if (hit) return hit;
        return fetch(req).then(
          function (res) {
            if (res && res.ok && res.type === 'basic') c.put(req, res.clone());
            return res;
          },
          function () {
            return caches.match(key, { ignoreSearch: true });
          }
        );
      });
    })
  );
});
