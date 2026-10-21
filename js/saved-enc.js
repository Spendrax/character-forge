// Planned encounters, for every game: name the encounter being built, add notes (where, tactics, what they
// carry), save it, and find it again later in a list to load, run or delete.
// Each game registers how to read, replace and run its encounter: SavedEnc.register(game, cfg).
(function (root) {
  'use strict';
  var games = {};
  var copy = function (o) {
    return JSON.parse(JSON.stringify(o));
  };
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function b(act, g, v, label, cls) {
    return (
      '<button type="button" class="' +
      (cls || 'btn small') +
      '" data-act="' +
      act +
      '" data-g="' +
      g +
      '" data-v="' +
      esc(v || '') +
      '">' +
      label +
      '</button>'
    );
  }
  function uid() {
    return 's' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }
  var msg = {};

  // cfg: { list() → saved array, cur() → encounter being built, load(enc), fresh() → blank encounter,
  //        summary(enc) → short text, run() → start the fight }
  function register(game, cfg) {
    games[game] = cfg;
  }
  function html(game) {
    var G = games[game];
    if (!G) return '';
    var e = G.cur(),
      list = G.list(),
      saved =
        e.id &&
        list.some(function (s) {
          return s.id === e.id;
        });
    var h =
      '<div class="panel se-panel"><h3>Plan it for later</h3>' +
      '<div class="toolbar"><input type="text" id="se-name-' +
      game +
      '" data-se="name" data-g="' +
      game +
      '" placeholder="Name (e.g. Goblin ambush on the road)" value="' +
      esc(e.name || '') +
      '" style="flex:1;min-width:12rem">' +
      b('seSave', game, '', saved ? 'Save changes' : 'Save', 'btn small primary') +
      (saved ? b('seSaveAs', game, '', 'Save as new') : '') +
      b('seNew', game, '', 'New encounter') +
      '</div><textarea id="se-notes-' +
      game +
      '" data-se="notes" data-g="' +
      game +
      '" rows="2" placeholder="Notes: where it happens, what the monsters want, tactics, what they carry…">' +
      esc(e.notes || '') +
      '</textarea>' +
      (msg[game] ? '<p class="small rest-msg">' + esc(msg[game]) + '</p>' : '');
    if (list.length)
      h +=
        '<h4>Saved encounters (' +
        list.length +
        ')</h4><ul class="se-list">' +
        list
          .map(function (s) {
            return (
              '<li' +
              (s.id === e.id ? ' class="on"' : '') +
              '><div class="se-what"><b>' +
              esc(s.name || 'Untitled') +
              '</b> <span class="small muted">' +
              esc(G.summary(s)) +
              '</span>' +
              (s.notes ? '<div class="small">' + esc(s.notes).replace(/\n/g, '<br>') + '</div>' : '') +
              '</div><div class="se-btns">' +
              b('seLoad', game, s.id, 'Open') +
              b('seRun', game, s.id, 'Run it', 'btn small primary') +
              b('seDel', game, s.id, '✕', 'btn tiny') +
              '</div></li>'
            );
          })
          .join('') +
        '</ul>';
    return h + '</div>';
  }
  function find(G, id) {
    return G.list().filter(function (s) {
      return s.id === id;
    })[0];
  }
  function store(G, asNew) {
    var e = G.cur();
    if (asNew || !e.id) e.id = uid();
    var c = copy(e);
    delete c.run;
    var list = G.list(),
      i = list
        .map(function (s) {
          return s.id;
        })
        .indexOf(c.id);
    if (i >= 0) list[i] = c;
    else list.unshift(c);
    return c;
  }
  var actions = {
    seSave: function (v, el) {
      var g = el.getAttribute('data-g'),
        c = store(games[g]);
      msg[g] = 'Saved “' + (c.name || 'Untitled') + '”.';
    },
    seSaveAs: function (v, el) {
      var g = el.getAttribute('data-g'),
        c = store(games[g], true);
      msg[g] = 'Saved a copy: “' + (c.name || 'Untitled') + '”.';
    },
    seNew: function (v, el) {
      var g = el.getAttribute('data-g');
      games[g].load(games[g].fresh());
      msg[g] = '';
    },
    seLoad: function (v, el) {
      var g = el.getAttribute('data-g'),
        s = find(games[g], v);
      if (!s) return;
      games[g].load(copy(s));
      msg[g] = 'Opened “' + (s.name || 'Untitled') + '”. Changes are kept when you tap Save changes.';
      root.scrollTo(0, 0);
    },
    seRun: function (v, el) {
      var g = el.getAttribute('data-g'),
        s = find(games[g], v);
      if (!s) return;
      games[g].load(copy(s));
      msg[g] = '';
      games[g].run();
      root.scrollTo(0, 0);
    },
    // two taps to delete, so a slip of the finger doesn't lose a planned encounter
    seDel: function (v, el) {
      var g = el.getAttribute('data-g'),
        G = games[g],
        list = G.list(),
        s = find(G, v);
      if (!s) return;
      if (G.armed !== v) {
        G.armed = v;
        msg[g] = 'Tap ✕ again to delete “' + (s.name || 'Untitled') + '”.';
        return;
      }
      list.splice(list.indexOf(s), 1);
      G.armed = '';
      msg[g] = 'Deleted “' + (s.name || 'Untitled') + '”.';
    }
  };
  // typing in the name or notes: kept on the encounter as you type
  function onInput(t) {
    var k = t.getAttribute && t.getAttribute('data-se'),
      G = k && games[t.getAttribute('data-g')];
    if (!G) return false;
    G.cur()[k] = t.value;
    return true;
  }
  root.SavedEnc = { register: register, html: html, actions: actions, onInput: onInput };
})(typeof window !== 'undefined' ? window : globalThis);
