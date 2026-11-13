// Shared state (the saved characters, what is on screen), saving, undo and small helpers used everywhere.
// Part of the app: these files share one scope (see “How the code is organized” in README.md), loaded in order by index.html.
'use strict';

var D = window.DND,
  R = window.Rules,
  AB = D.abilities;
var KEY = 'character-forge.v1';
var STEPS = [
  ['lineage', 'Lineage'],
  ['class', 'Class'],
  ['abilities', 'Abilities'],
  ['background', 'Background'],
  ['spells', 'Spells'],
  ['myspells', 'My spells'],
  ['equipment', 'Equipment'],
  ['items', 'Items'],
  ['companions', 'Pets'],
  ['appearance', 'Appearance'],
  ['details', 'Details'],
  ['sheet', 'Sheet'],
  ['notes', 'Notes'],
  ['play', 'Session']
];
var TAGS = [
  ['official', 'Official'],
  ['setting', 'Setting books'],
  ['ua', 'Unearthed Arcana'],
  ['homebrew', 'Homebrew']
];
var store = {
  chars: [],
  current: '',
  detail: true,
  filters: { official: true, setting: true, ua: true, homebrew: true }
};
var ui = {
  section: /[?&]shared=/.test(window.location.search) ? 'chars' : 'home',
  step: 'lineage',
  q: {},
  spellLevel: 0,
  confirmDelete: false,
  group: '',
  clsTab: '',
  casterTab: '',
  itemTab: 'magic',
  rarity: '',
  itemType: '',
  gearCat: ''
};
var ch, d; // current character and its derived sheet
// ---------- storage ----------
// Everything is saved twice: in localStorage (quick to read at start, but small: about 5 MB) and in IndexedDB (the
// browser's larger storage). At start the app opens from localStorage, then takes the IndexedDB copy if it is newer
// (localStorage was full). Saving waits until that check is done, so an old copy never overwrites a newer one.
// If neither can be written, a bar says so and points to the Backup page.
var AT_KEY = 'character-forge.at',
  WHERE_KEY = 'character-forge.where',
  lsAt = 0,
  dbReady = false,
  dbPending = false;
function kv() {
  if (!window.indexedDB) return Promise.reject(new Error('no IndexedDB'));
  kv.db =
    kv.db ||
    new Promise(function (ok, no) {
      var r = window.indexedDB.open('character-forge', 1);
      r.onupgradeneeded = function () {
        r.result.createObjectStore('kv');
      };
      r.onsuccess = function () {
        ok(r.result);
      };
      r.onerror = function () {
        no(r.error);
      };
    });
  return kv.db;
}
function kvGet(k) {
  return kv().then(function (db) {
    return new Promise(function (ok, no) {
      var q = db.transaction('kv').objectStore('kv').get(k);
      q.onsuccess = function () {
        ok(q.result);
      };
      q.onerror = function () {
        no(q.error);
      };
    });
  });
}
function kvPut(k, v) {
  return kv().then(function (db) {
    return new Promise(function (ok, no) {
      var t = db.transaction('kv', 'readwrite');
      t.objectStore('kv').put(v, k);
      t.oncomplete = function () {
        ok();
      };
      t.onerror = t.onabort = function () {
        no(t.error);
      };
    });
  });
}
// Earlier versions: up to 10 copies of everything, kept on this device (IndexedDB, 'hist'). One is kept when the app
// opens, one for each hour of use, and one just before a backup or an earlier version is brought back; a copy equal
// to the last one isn't kept twice. The Backup page lists them (js/backup-ui.js).
var HIST_MAX = 10,
  histAt = 0;
function histList() {
  return kvGet('hist').then(
    function (h) {
      return Array.isArray(h) ? h : [];
    },
    function () {
      return [];
    }
  );
}
function histKeep(why) {
  var json = JSON.stringify(store),
    at = Date.now();
  histAt = at;
  return histList()
    .then(function (h) {
      if (h.length && h[h.length - 1].json === json) return;
      h.push({ at: at, why: why, json: json });
      // too big to keep ten (pictures): keep fewer rather than none
      var put = function () {
        return kvPut('hist', h.slice(-HIST_MAX)).catch(function () {
          if (h.length <= 1) return;
          h.shift();
          return put();
        });
      };
      return put();
    })
    .catch(function () {
      /* no storage: nothing kept */
    });
}
// ask the browser not to clear the app's storage when the device runs low (granted quietly, or not at all)
function keepStorage() {
  try {
    if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(function () {});
  } catch (e) {
    /* not supported */
  }
}
// how full the browser's storage for this app is: { used, max, part } in bytes, or null when the browser won't say
function storageUse() {
  if (!navigator.storage || !navigator.storage.estimate) return Promise.resolve(null);
  return navigator.storage.estimate().then(
    function (e) {
      return e && e.quota ? { used: e.usage || 0, max: e.quota, part: (e.usage || 0) / e.quota } : null;
    },
    function () {
      return null;
    }
  );
}
// after the first drawing: the IndexedDB copy, if newer; done(true) when it replaced what is on screen
function loadDb(done) {
  var finish = function (changed) {
    dbReady = true;
    if (dbPending) saveNow();
    done(changed);
    histKeep('open');
    keepStorage();
  };
  kvGet('store').then(
    function (v) {
      if (v && v.json && v.at > lsAt) {
        try {
          useStore(JSON.parse(v.json));
          lsAt = v.at;
          return finish(true);
        } catch (e) {
          /* damaged: keep what we have */
        }
      }
      finish(false);
    },
    function () {
      finish(false);
    }
  );
}
// put a saved copy in place: the same store object, so every part of the app sees it
function useStore(s) {
  var game = store.game;
  Object.keys(store).forEach(function (k) {
    delete store[k];
  });
  Object.assign(store, JSON.parse(JSON.stringify(s)));
  store.filters = store.filters || {};
  store.game = store.game || game;
  store.chars = (Array.isArray(store.chars) ? store.chars : []).map(normalize);
  if (!store.chars.length) store.chars.push(R.newChar());
  if (!byId(store.current)) store.current = store.chars[0].id;
  ch = byId(store.current);
}
var failShown = 0;
function saveFailed() {
  if (Date.now() - failShown < 60000 || !document.body) return;
  failShown = Date.now();
  var old = document.querySelector('.save-bar');
  if (old) old.remove();
  var bar = document.createElement('div');
  bar.className = 'update-bar save-bar noprint';
  bar.setAttribute('role', 'alert');
  bar.innerHTML =
    '<span>⚠ This device couldn’t save your last changes: its storage is full or blocked. Download a backup file now.</span>' +
    '<button type="button" class="btn primary small" data-act="section" data-v="backup">Backup</button>' +
    '<button type="button" class="btn small" data-close="1">OK</button>';
  bar.addEventListener('click', function (e) {
    bar.remove();
    if (e.target.getAttribute && e.target.getAttribute('data-close')) e.stopPropagation();
  });
  document.body.appendChild(bar);
}
function load() {
  try {
    if (window.localStorage.getItem(WHERE_KEY) === 'idb') throw new Error('in IndexedDB');
    lsAt = +window.localStorage.getItem(AT_KEY) || 0;
    var raw = window.localStorage.getItem(KEY);
    if (raw) {
      var s = JSON.parse(raw);
      if (s && Array.isArray(s.chars)) store = Object.assign(store, s);
    }
  } catch (e) {
    /* storage unavailable: run in memory */
  }
  store.chars = store.chars.map(normalize);
  if (!store.chars.length) store.chars.push(R.newChar());
  if (!byId(store.current)) store.current = store.chars[0].id;
}
var saveTimer;
// Undo / redo: every saved change keeps a copy of the characters as they were just before.
var undoStack = [],
  redoStack = [],
  lastSnap = null,
  UNDO_MAX = 40;
function snapshot() {
  return JSON.stringify({
    chars: store.chars,
    current: store.current,
    mm: store.mm || null,
    pf2: store.pf2 || null,
    sf2: store.sf2 || null,
    sd: store.sd || null
  });
}
function remember() {
  var now = snapshot();
  if (lastSnap !== null && now !== lastSnap) {
    undoStack.push(lastSnap);
    if (undoStack.length > UNDO_MAX) undoStack.shift();
    redoStack = [];
  }
  lastSnap = now;
}
function restore(snap) {
  var o = JSON.parse(snap);
  store.chars = o.chars.map(normalize);
  store.current = byId(o.current) ? o.current : store.chars[0].id;
  if (o.mm) store.mm = o.mm;
  if (o.pf2) store.pf2 = o.pf2;
  if (o.sf2) store.sf2 = o.sf2;
  if (o.sd) store.sd = o.sd;
  lastSnap = snapshot();
  ui.confirmDelete = false;
  ui.import5e = null;
  ui.import5eDone = null;
}
function undo() {
  if (!undoStack.length) return false;
  flushTyping();
  redoStack.push(snapshot());
  restore(undoStack.pop());
}
function redo() {
  if (!redoStack.length) return false;
  flushTyping();
  undoStack.push(snapshot());
  restore(redoStack.pop());
}
function flushTyping() {
  if (saveTimer) {
    clearTimeout(saveTimer);
    remember();
  }
}
function saveNow() {
  clearTimeout(saveTimer);
  saveTimer = null;
  remember();
  syncUndoButtons();
  if (!dbReady) {
    dbPending = true; // after the start-up check (loadDb)
    return;
  }
  dbPending = false;
  var json = JSON.stringify(store),
    at = Date.now(),
    lsOk = true;
  lsAt = at;
  try {
    window.localStorage.setItem(KEY, json);
    window.localStorage.setItem(AT_KEY, String(at));
    window.localStorage.removeItem(WHERE_KEY);
  } catch (e) {
    lsOk = false;
    try {
      // too big for localStorage: the IndexedDB copy is the one to read
      window.localStorage.removeItem(KEY);
      window.localStorage.setItem(WHERE_KEY, 'idb');
    } catch (e2) {
      /* storage blocked */
    }
  }
  kvPut('store', { at: at, json: json }).catch(function () {
    if (!lsOk) saveFailed();
  });
  if (at - histAt > 3600000) histKeep('hour');
  if (typeof BKP !== 'undefined') BKP.changed(); // Google Drive backup, a little later (js/backup-ui.js)
}
// Replace everything with a backup (js/backup-ui.js): the same store object, so every part of the app sees it
function applyBackup(s) {
  histKeep('before');
  useStore(s);
  ui.mode = '';
  saveNow();
}
function syncUndoButtons() {
  var u = document.querySelector('[data-act="undo"]'),
    r = document.querySelector('[data-act="redo"]');
  if (u) u.disabled = !undoStack.length;
  if (r) r.disabled = !redoStack.length;
}
function save() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(saveNow, 300);
} // typing: batch the writes
window.addEventListener('pagehide', saveNow);
// only our own picture data (a data: image) ever goes into an <img>, whatever an imported file says
function safePic(u) {
  return /^data:image\/(png|jpe?g|webp|gif);base64,[A-Za-z0-9+\/=\s]+$/.test(String(u || '')) ? u : '';
}
window.safePic = safePic;
function normalize(c) {
  c = R.upgrade(c);
  var n = R.newChar(),
    o = Object.assign(n, c);
  o.base = Object.assign({ STR: 8, DEX: 8, CON: 8, INT: 8, WIS: 8, CHA: 8 }, c.base || {});
  o.notes = Object.assign(R.newChar().notes, c.notes || {});
  o.spells = c.spells || {};
  o.picks = c.picks || {};
  o.asi = c.asi || {};
  o.eq = c.eq || {};
  o.weapons = c.weapons || [];
  o.money = Object.assign({ pp: 0, gp: 0, ep: 0, sp: 0, cp: 0 }, c.money || {});
  o.picture = safePic(o.picture);
  if (o.look && typeof o.look === 'object')
    Object.keys(o.look).forEach(function (k) {
      var v = o.look[k];
      if (typeof v === 'string' && !/^[#a-z0-9 _-]*$/i.test(v)) delete o.look[k];
    });
  return o;
}
function byId(id) {
  return store.chars.filter(function (c) {
    return c.id === id;
  })[0];
}
// ---------- helpers ----------
function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}
function tag(t) {
  return t && t !== 'official' ? ' <span class="tag ' + t + '">' + (t === 'ua' ? 'UA' : t) + '</span>' : '';
}
function ok(t) {
  return R.tagOk(t, store.filters);
}
// search that ignores case, accents and punctuation ("moon touched" finds Moon-Touched Sword)
function loose(s) {
  return String(s)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[’']/g, '')
    .replace(/[^a-z0-9+]+/g, ' ')
    .trim();
}
// where a word appears in a text: short snippets with the word marked (used by the notes searches)
window.findSnippets = function (text, q, max) {
  text = String(text || '');
  q = String(q || '').trim();
  if (!q) return { n: 0, html: '' };
  var lo = text.toLowerCase(),
    k = q.toLowerCase(),
    at = 0,
    hits = [],
    i;
  while ((i = lo.indexOf(k, at)) >= 0) {
    hits.push(i);
    at = i + k.length;
  }
  var e = function (x) {
    return String(x).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  };
  var html = hits
    .slice(0, max || 4)
    .map(function (i) {
      var a = Math.max(0, i - 50),
        b = Math.min(text.length, i + k.length + 70);
      return (
        '<div class="snip">' +
        (a ? '…' : '') +
        e(text.slice(a, i)).replace(/\n/g, ' ') +
        '<mark>' +
        e(text.slice(i, i + k.length)) +
        '</mark>' +
        e(text.slice(i + k.length, b)).replace(/\n/g, ' ') +
        (b < text.length ? '…' : '') +
        '</div>'
      );
    })
    .join('');
  return { n: hits.length, html: html };
};
function match(q, s) {
  return !q || loose(s).indexOf(loose(q)) >= 0;
}
function btn(act, label, attrs, cls) {
  return (
    '<button type="button" class="' +
    (cls || 'btn') +
    '" data-act="' +
    act +
    '"' +
    data(attrs) +
    '>' +
    label +
    '</button>'
  );
}
function data(o) {
  var s = '';
  for (var k in o || {}) s += ' data-' + k + '="' + esc(o[k]) + '"';
  return s;
}
function search(id, ph) {
  return (
    '<input type="search" id="q-' +
    id +
    '" data-q="' +
    id +
    '" placeholder="' +
    ph +
    '" value="' +
    esc(ui.q[id] || '') +
    '">'
  );
}
function title(c) {
  return c.name || 'Unnamed character';
}
function classLine(dd, withSub) {
  return dd.classes
    .map(function (e) {
      return e.cls.name + ' ' + e.level + (withSub && e.sc ? ' (' + e.sc.name + ')' : '');
    })
    .join(' / ');
}
function summaryLine(c, dd) {
  var parts = [];
  if (dd.L) parts.push(dd.L.subName && dd.L.subName !== 'Standard' ? dd.L.subName : dd.L.name);
  if (dd.classes.length) parts.push(classLine(dd, true));
  return parts.join(' · ') || 'Nothing chosen yet';
}
function entry(id) {
  return ch.classes.filter(function (e) {
    return e.cls === id;
  })[0];
}
function clearClass(id) {
  ['cls.' + id + '.', 'sc.' + id + '.', 'asi.' + id + '.'].forEach(clearPicks);
  for (var k in ch.asi) if (k.indexOf('asi.' + id + '.') === 0) delete ch.asi[k];
  delete ch.spells[id];
}
function clearPicks(prefix) {
  for (var k in ch.picks) if (k.indexOf(prefix) === 0) delete ch.picks[k];
}
