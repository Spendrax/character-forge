// On the DM's device: the players' character sheets, sent by their phones each time they connect to the table (and
// when they change), kept with the DM's characters so they can be read any time, even with no session going; and
// secrets for one player: a ready-made hint ("you feel watched") or your own words, seen only by that player.
(function (root) {
  'use strict';
  var HINTS = [
    'You feel like you’re being watched.',
    'Something about this place feels wrong.',
    'You sense something is hidden nearby.',
    'Something glints at the corner of your eye.',
    'You hear a faint whisper no one else seems to hear.',
    'A sudden chill runs down your spine.',
    'Your instincts tell you this person is lying.',
    'You recognise this place… but from where?',
    'You smell something odd: smoke, or blood?',
    'You have a bad feeling about this.',
    'You feel a strange pull in one direction.',
    'You dreamt of this moment.',
    'Something in your pack feels heavier than before.',
    'You feel a surge of courage.'
  ];
  var GAME = { dnd: 'D&D', pf2: 'Pathfinder', mm: 'M&M' };
  root.PartyTable = function (api) {
    var esc = api.esc,
      btn = api.btn,
      store = api.store,
      W = (api.ui.partyTable = api.ui.partyTable || { to: '', text: '', sent: [] });
    function list(game) {
      if (game === 'pf2') return ((store.pf2 = store.pf2 || {}).chars = store.pf2.chars || []);
      if (game === 'mm') return ((store.mm = store.mm || {}).heroes = store.mm.heroes || []);
      return (store.chars = store.chars || []);
    }
    function tb() {
      var T = root.Table;
      return T && T.hostInfo ? T.hostInfo() : null;
    }
    // a sheet arrives: keep it (a copy with its own id), replacing the one from last time
    function receive(x) {
      var g = GAME[x.game] ? x.game : 'dnd',
        L = list(g),
        d = x.data || {},
        src = String(d.id || x.player),
        old = L.filter(function (c) {
          return c.fromTable && c.fromTable.src === src;
        })[0],
        c = JSON.parse(JSON.stringify(d));
      if (g === 'dnd' && api.normalize) c = api.normalize(c);
      c.id = old ? old.id : 'tbl-' + src.replace(/[^\w-]/g, '').slice(0, 40);
      c.fromTable = { src: src, player: String(x.player || '').slice(0, 40), at: Date.now() };
      if (old) L[L.indexOf(old)] = c;
      else L.push(c);
      api.save();
      api.render();
    }
    function when(t) {
      var d = new Date(t);
      return d.toLocaleDateString() + ' ' + ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2);
    }
    function sheetsHtml(game) {
      var mine = list(game).filter(function (c) {
        return c.fromTable;
      });
      return (
        '<div class="panel party-sheets"><h3>📱 Players’ sheets</h3>' +
        (mine.length
          ? '<ul class="se-list">' +
            mine
              .map(function (c) {
                return (
                  '<li><div class="se-what"><b>' +
                  esc(c.name || 'Unnamed') +
                  '</b> <span class="small muted">' +
                  esc(c.fromTable.player ? 'from ' + c.fromTable.player + '’s phone, ' : '') +
                  'updated ' +
                  esc(when(c.fromTable.at)) +
                  '</span></div><div class="se-btns">' +
                  btn('ptOpen', 'Open', { v: c.id, g: game }, 'btn small primary') +
                  btn('ptDrop', '✕', { v: c.id, g: game }, 'btn tiny') +
                  '</div></li>'
                );
              })
              .join('') +
            '</ul><p class="small muted">Read-only copies: they are replaced each time the player connects to your table. Private notes stay on the player’s phone.</p>'
          : '<p class="small muted">When players join your table, their character sheets arrive here and stay on this device, so you can read them any time. They are updated each time they connect.</p>') +
        '</div>'
      );
    }
    // a secret for one player
    function whisperHtml() {
      var t = tb(),
        P = t ? t.state.players : [];
      if (!P.length) return '';
      if (
        !P.some(function (p) {
          return p.id === W.to;
        })
      )
        W.to = P[0].id;
      return (
        '<div class="panel party-whisper"><h3>🤫 A secret for one player</h3><p class="small muted">Only that player sees it, hidden on their phone until they tap it.</p>' +
        '<div class="pills">' +
        P.map(function (p) {
          return btn('ptTo', esc(p.name), { v: p.id }, 'pill small' + (W.to === p.id ? ' on' : ''));
        }).join('') +
        '</div><div class="pills party-hints">' +
        HINTS.map(function (h, i) {
          return btn('ptHint', esc(h), { v: i }, 'pill small' + (W.text === h ? ' on' : ''));
        }).join('') +
        '</div><div class="toolbar"><textarea id="pt-text" data-pt="text" rows="2" placeholder="Or write your own secret…" style="flex:1;min-width:12rem">' +
        esc(W.text) +
        '</textarea>' +
        btn('ptSend', 'Send secretly', {}, 'btn primary') +
        '</div>' +
        (W.sent.length
          ? '<p class="small muted">' +
            W.sent
              .slice(-3)
              .map(function (s) {
                return '🤫 ' + esc(s);
              })
              .join('<br>') +
            '</p>'
          : '') +
        '</div>'
      );
    }
    var actions = {
      ptTo: function (v) {
        W.to = v;
      },
      ptHint: function (v) {
        W.text = HINTS[+v] || '';
      },
      ptSend: function () {
        var t = tb(),
          el = document.getElementById('pt-text'),
          text = String((el ? el.value : W.text) || '').trim(),
          p =
            t &&
            t.state.players.filter(function (x) {
              return x.id === W.to;
            })[0];
        if (!t || !p || !text) return false;
        root.Table.dm(t.code, t.key, { msg: { to: [p.id], text: text, whisper: true } }).catch(function () {});
        W.sent.push('To ' + p.name + ': ' + text);
        W.text = '';
      },
      // open a player's sheet on its Sheet page
      ptOpen: function (v, el) {
        api.open(el.getAttribute('data-g'), v);
      },
      ptDrop: function (v, el) {
        var L = list(el.getAttribute('data-g'));
        L.splice(
          L.map(function (c) {
            return c.id;
          }).indexOf(v),
          1
        );
        api.save();
      }
    };
    function onInput(t) {
      if (t.getAttribute('data-pt') !== 'text') return false;
      W.text = t.value;
      return true;
    }
    return {
      html: function (game) {
        return sheetsHtml(game) + whisperHtml();
      },
      whisperHtml: whisperHtml,
      receive: receive,
      actions: actions,
      onInput: onInput,
      HINTS: HINTS
    };
  };
})(typeof window !== 'undefined' ? window : globalThis);
