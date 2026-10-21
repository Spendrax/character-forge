// A Pathfinder or M&M character at the GM's table, from its Session tab: join with the code, initiative,
// whose turn it is, the GM's roll requests, handouts and messages, and the character's status sent to the GM.
// who = { key, name, init (bonus), bonus(ask) → number, status() → {hp,max,temp,ac,conds,txt}, take(gift) → adds it to the character }
(function (root) {
  'use strict';
  root.TablePanel = function (api) {
    var esc = api.esc,
      btn = api.btn,
      store = api.store,
      U = {},
      W = null;
    var fmt = function (n) {
      return (n >= 0 ? '+' : '') + n;
    };
    function J() {
      return W && (store.tableJoin || {})[W.key];
    }
    function me(S) {
      var j = J();
      return (
        S &&
        j &&
        S.players.filter(function (p) {
          return p.id === j.id;
        })[0]
      );
    }
    function html(who) {
      var Table = root.Table;
      if (!Table || !root.RTCPeerConnection) return '';
      if (W && W.key !== who.key) U = {};
      W = who;
      var j = J(),
        S = U.st;
      if (!j)
        return (
          '<div class="panel compact-row"><b>📱 GM’s table</b><input type="text" inputmode="numeric" maxlength="4" id="tp-code" data-tp="code" value="' +
          esc(U.code || api.ui.tblCode || '') +
          '" placeholder="code" style="width:5.5rem">' +
          btn('tpJoin', U.busy ? 'Joining…' : 'Join', {}, 'btn small primary') +
          (U.msg ? '<span class="small ' + (U.busy ? 'muted' : 'bad') + '">' + esc(U.msg) + '</span>' : '') +
          '</div>'
        );
      Table.setCreds(j.code, j.id, j.token);
      Table.watch(j.code, function (st) {
        var jj = J();
        if (!jj || jj.code !== j.code) return;
        if (
          !st ||
          !st.players.some(function (p) {
            return p.id === jj.id;
          })
        ) {
          delete store.tableJoin[W.key];
          U = { msg: st ? 'The GM removed you from the table.' : 'The table was closed.' };
          api.save();
          api.render();
          return;
        }
        var n = function (x) {
            return x ? (x.msgs || []).length + (x.asks || []).length + (x.handouts || []).length : 0;
          },
          m = me(st);
        var mine = st.turn && m && st.turn.trim().toLowerCase() === String(m.name).trim().toLowerCase();
        if (
          navigator.vibrate &&
          U.st &&
          (n(st) > n(U.st) || (mine && !(U.st.turn === st.turn && U.st.round === st.round)))
        )
          navigator.vibrate([120, 80, 120]);
        U.st = st;
        api.render();
      });
      if (!S)
        return (
          '<div class="panel compact-row"><b>📱 Table ' +
          j.code +
          '</b><span class="small muted">connecting…</span></div>'
        );
      var p = me(S) || {},
        turn =
          S.turn &&
          S.turn.trim().toLowerCase() ===
            String(p.name || '')
              .trim()
              .toLowerCase();
      var h =
        '<div class="panel tbl-me' +
        (turn ? ' my-turn' : '') +
        '"><div class="toolbar" style="margin:0"><b>📱 Table ' +
        j.code +
        '</b>' +
        (S.round
          ? '<span>Round ' + S.round + ' · ' + (turn ? '<b>your turn!</b>' : 'turn: ' + esc(S.turn || '—')) + '</span>'
          : '<span class="small muted">' + (S.open ? 'the fight is starting' : 'waiting for the GM') + '</span>') +
        '<span class="spacer"></span>' +
        btn('tpLeave', 'Leave', {}, 'btn small') +
        '</div>';
      if (S.open && p.init == null)
        h +=
          '<div class="toolbar"><b>Initiative</b>' +
          btn('tpRoll', '🎲 Roll (' + fmt(who.init) + ')', {}, 'btn small primary') +
          '<span class="small">or I rolled</span><input type="number" id="tp-mine" data-tp="mine" value="' +
          esc(U.mine || '') +
          '" placeholder="total" style="width:5rem">' +
          btn('tpSend', 'Send', {}, 'btn small') +
          '</div>';
      else if (p.init != null)
        h +=
          '<p class="small">Your initiative: <b>' + p.init + '</b> ' + btn('tpRedo', 'change', {}, 'linkbtn') + '</p>';
      (S.asks || []).forEach(function (a) {
        var r = a.ans[j.id];
        h +=
          '<div class="tbl-gift">🎲 <b>The GM asks: ' +
          esc(a.label) +
          '</b>' +
          (a.dc ? ' <span class="small">DC ' + a.dc + '</span>' : '') +
          (r
            ? '<div class="small">You sent <b>' +
              r.total +
              '</b>' +
              (r.ok == null ? '' : r.ok ? ' <span class="good">success</span>' : ' <span class="bad">fail</span>') +
              '</div>'
            : '<div class="toolbar">' +
              btn('tpAskRoll', '🎲 Roll (' + fmt(who.bonus(a)) + ')', { v: a.rid }, 'btn small primary') +
              '<span class="small">or I rolled</span><input type="number" id="tp-ans-' +
              a.rid +
              '" data-tp="ans:' +
              a.rid +
              '" value="' +
              esc((U.ans || {})[a.rid] || '') +
              '" placeholder="total" style="width:5rem">' +
              btn('tpAskSend', 'Send', { v: a.rid }, 'btn small') +
              '</div>') +
          '</div>';
      });
      (S.claims || []).forEach(function (c) {
        var on = c.wants.indexOf(j.id) >= 0;
        h +=
          '<div class="tbl-gift">🎲 <b>' +
          esc(c.n) +
          '</b> ' +
          (c.result
            ? '<div class="small">' + esc(c.result) + '</div>'
            : '<span class="small muted">is up for grabs: tap if you want it, the dice decide.</span><div class="toolbar">' +
              btn(
                'tpWant',
                on ? '✋ I’m in (tap to back out)' : 'I want it',
                { v: c.key },
                'btn small' + (on ? '' : ' primary')
              ) +
              '</div>') +
          '</div>';
      });
      (p.gifts || []).forEach(function (g) {
        var what = Object.keys(g.coins || {})
          .filter(function (k) {
            return +g.coins[k] > 0;
          })
          .map(function (k) {
            return (+g.coins[k]).toLocaleString('en') + ' ' + k;
          })
          .concat(
            (g.items || []).map(function (i) {
              return String(i.n || 'an item');
            })
          );
        h +=
          '<div class="tbl-gift">🎁 <b>From the GM:</b> ' +
          esc(what.join(', ') || 'nothing') +
          '<div class="toolbar">' +
          btn('tpGift', 'Add to ' + esc(who.name || 'my character'), { v: g.gid }, 'btn small primary') +
          btn('tpGiftNo', 'Not for me', { v: g.gid }, 'btn small') +
          '</div></div>';
      });
      (S.handouts || [])
        .slice()
        .reverse()
        .forEach(function (x) {
          var img = Table.handoutImg(x.hid);
          h +=
            '<div class="tbl-gift tbl-handout">📜 <b>' +
            esc(x.title || 'Handout from the GM') +
            '</b>' +
            (img
              ? '<button type="button" class="tbl-ho-img" data-act="tpBig" data-v="' +
                esc(x.hid) +
                '"><img src="' +
                img +
                '" alt="' +
                esc(x.title || 'Handout') +
                '"></button>'
              : '<span class="small muted"> loading…</span>') +
            '</div>';
        });
      if (U.big && Table.handoutImg(U.big))
        h +=
          '<button type="button" class="tbl-ho-big" data-act="tpBig" data-v="" aria-label="Close"><img src="' +
          Table.handoutImg(U.big) +
          '" alt="Handout"></button>';
      var msgs = (S.msgs || []).slice(-8);
      h +=
        '<details class="tbl-chat"' +
        (U.chat || (msgs.length && msgs[msgs.length - 1].from === 'dm') ? ' open' : '') +
        '><summary><b>✉ Messages</b>' +
        (msgs.length ? ' <span class="small muted">(' + msgs.length + ')</span>' : '') +
        '</summary>' +
        (msgs.length
          ? '<ul class="dm-msgs">' +
            msgs
              .map(function (m) {
                var o = m.from === j.id;
                return (
                  '<li class="' +
                  (o ? 'out' : 'in') +
                  '"><span class="small muted">' +
                  (o ? 'You, to the GM' : m.to === 'all' ? 'GM, to everyone' : 'GM, just for you') +
                  '</span><div>' +
                  esc(m.text).replace(/\n/g, '<br>') +
                  '</div></li>'
                );
              })
              .join('') +
            '</ul>'
          : '') +
        '<div class="toolbar"><input type="text" id="tp-say" data-tp="say" value="' +
        esc(U.say || '') +
        '" placeholder="Message the GM (only they see it)" style="flex:1;min-width:10rem">' +
        btn('tpSay', 'Send', {}, 'btn small') +
        '</div></details>';
      var st = who.status(),
        sk = j.code + JSON.stringify(st);
      if (U.sent !== sk) {
        U.sent = sk;
        Table.status(j.code, st).catch(function () {
          U.sent = '';
        });
      }
      return h + (U.msg ? '<p class="small rest-msg">' + esc(U.msg) + '</p>' : '') + '</div>';
    }
    function ask(v) {
      return (
        U.st &&
        (U.st.asks || []).filter(function (x) {
          return x.rid === v;
        })[0]
      );
    }
    function val(id, k) {
      var el = document.getElementById(id);
      return el ? el.value : U[k];
    }
    function err(e) {
      U.msg = e.message;
      api.render();
    }
    function answer(a, tot, roll) {
      var j = J();
      a.ans[j.id] = { total: tot, roll: roll, ok: a.dc ? tot >= a.dc : null };
      root.Table.answer(j.code, a.rid, tot, roll).catch(err);
    }
    function init(v) {
      var j = J();
      root.Table.roll(j.code, j.id, j.token, v).then(function (st) {
        U.st = st;
        U.mine = '';
        api.render();
      }, err);
    }
    function gotGift(gid, take) {
      var j = J(),
        p = me(U.st),
        g =
          p &&
          (p.gifts || []).filter(function (x) {
            return x.gid === gid;
          })[0];
      if (!g) return;
      if (take && W.take) {
        W.take(g);
        api.save();
        U.msg = 'Added to ' + (W.name || 'your character') + '.';
      }
      p.gifts = p.gifts.filter(function (x) {
        return x !== g;
      });
      root.Table.ackGift(j.code, j.id, j.token, gid).catch(function () {});
    }
    var d20 = function () {
      return 1 + Math.floor(Math.random() * 20);
    };
    var actions = {
      tpJoin: function () {
        var code = String(val('tp-code', 'code') || '').trim(),
          key = W.key;
        if (!/^\d{4}$/.test(code)) {
          U.msg = 'The code is 4 digits: ask your GM.';
          return;
        }
        if (U.busy) return false;
        U.busy = true;
        U.msg = 'Connecting to the GM’s table…';
        api.render();
        root.Table.join(code, W.name || 'Player', W.init).then(
          function (r) {
            U.busy = false;
            U.msg = '';
            store.tableJoin = store.tableJoin || {};
            store.tableJoin[key] = { code: code, id: r.id, token: r.token };
            U.st = r.state;
            api.ui.tblHint = '';
            api.save();
            api.render();
          },
          function (e) {
            U.busy = false;
            err(e);
          }
        );
        return false;
      },
      tpLeave: function () {
        if (store.tableJoin && W) delete store.tableJoin[W.key];
        root.Table.stop();
        U = {};
        api.save();
      },
      tpRoll: function () {
        init(d20() + W.init);
        return false;
      },
      tpSend: function () {
        var n = val('tp-mine', 'mine');
        if (n === '' || n == null || isNaN(+n)) return false;
        init(+n);
        return false;
      },
      tpRedo: function () {
        init(null);
        return false;
      },
      tpAskRoll: function (v) {
        var a = ask(v);
        if (!a) return;
        var r = d20();
        answer(a, r + W.bonus(a), r);
      },
      tpAskSend: function (v) {
        var a = ask(v),
          n = val('tp-ans-' + v, '');
        if (!a || n === '' || n == null || isNaN(+n)) return false;
        answer(a, +n, null);
      },
      tpSay: function () {
        var j = J(),
          tx = String(val('tp-say', 'say') || '').trim();
        if (!j || !tx) return false;
        U.say = '';
        U.chat = true;
        root.Table.message(j.code, tx).catch(err);
      },
      tpBig: function (v) {
        U.big = v || '';
      },
      tpWant: function (v) {
        var j = J(),
          c =
            U.st &&
            (U.st.claims || []).filter(function (x) {
              return x.key === v;
            })[0];
        if (!j || !c) return;
        var on = c.wants.indexOf(j.id) < 0;
        root.Table.want(j.code, j.id, j.token, v, on).catch(err);
        c.wants = on
          ? c.wants.concat([j.id])
          : c.wants.filter(function (x) {
              return x !== j.id;
            });
      },
      tpGift: function (v) {
        gotGift(v, true);
      },
      tpGiftNo: function (v) {
        gotGift(v, false);
      }
    };
    function onInput(t) {
      var k = t.getAttribute && t.getAttribute('data-tp');
      if (!k) return false;
      if (/^ans:/.test(k)) {
        U.ans = U.ans || {};
        U.ans[k.slice(4)] = t.value;
      } else U[k] = t.value;
      return true;
    }
    return { html: html, actions: actions, onInput: onInput };
  };
})(typeof window !== 'undefined' ? window : globalThis);
