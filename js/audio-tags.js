// Tags on your own playlists (Audio page): "creepy, tavern, rain". The tags are kept on each playlist you added
// ({ u, t, tags: ['creepy', 'tavern'] } in store.audio.lists); js/audio.js shows them and filters by them.
(function (root) {
  'use strict';
  // "Creepy, #tavern ,, rain" → ['creepy', 'tavern', 'rain']: lower case, no #, no doubles, short
  function parse(text) {
    return String(text || '')
      .split(/[,;\n]+/)
      .reduce(function (out, t) {
        t = t
          .trim()
          .replace(/^#+\s*/, '')
          .toLowerCase()
          .slice(0, 30);
        if (t && out.indexOf(t) < 0 && out.length < 12) out.push(t);
        return out;
      }, []);
  }
  // every tag used on your playlists, with how many playlists have it, most used first
  function all(lists) {
    var n = {};
    Object.keys(lists || {}).forEach(function (k) {
      (lists[k] || []).forEach(function (p) {
        (p.tags || []).forEach(function (t) {
          n[t] = (n[t] || 0) + 1;
        });
      });
    });
    return Object.keys(n)
      .sort(function (a, b) {
        return n[b] - n[a] || (a < b ? -1 : 1);
      })
      .map(function (t) {
        return [t, n[t]];
      });
  }
  // your playlists that have a tag: [{ p, i, key }] (key: the item the playlist is under, i: its place there)
  function tagged(lists, tag) {
    var out = [];
    Object.keys(lists || {}).forEach(function (k) {
      (lists[k] || []).forEach(function (p, i) {
        if ((p.tags || []).indexOf(tag) >= 0) out.push({ p: p, i: i, key: k });
      });
    });
    return out;
  }
  root.AudioTags = { parse: parse, all: all, tagged: tagged };
})(typeof window !== 'undefined' ? window : globalThis);
