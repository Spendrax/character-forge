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
function load() {
  try {
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
  return JSON.stringify({ chars: store.chars, current: store.current, mm: store.mm || null, pf2: store.pf2 || null });
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
  try {
    window.localStorage.setItem(KEY, JSON.stringify(store));
  } catch (e) {
    /* storage unavailable */
  }
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
