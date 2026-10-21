// A character at the DM's (or GM's) table, from its Session page, for all three games: join with the code,
// initiative and the turn order, roll requests, gifts and roll-offs, handouts, messages, what the DM does to the
// character (damage, conditions, inspiration, rests, XP), shared notes, shared rolls, the NPCs and quests the DM has
// revealed, and the DM's music. The character's status goes back to the DM.
//
// who = {
//   key, name, gm ('DM' or 'GM'), init (bonus),
//   bonus(ask) → the bonus for a roll the DM asks for,
//   status() → { hp, max, temp, ac, conds, conc, txt, bon: { 'Insight': 3, … } },
//   take(gift) → adds coins and items to the character,
//   effect(fx) → applies damage, healing, a condition, inspiration, a rest, XP; returns { msg, level },
//   levelUp(), notes() → [{ id, title, text }], addNote(title, text), rest: [[kind, label]] (rests the DM can call)
// }
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
    var low = function (x) {
      return String(x || '')
        .trim()
        .toLowerCase();
    };
    var d20 = function () {
      return 1 + Math.floor(Math.random() * 20);
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
    function GM() {
      return (W && W.gm) || 'GM';
    }
    function para(t) {
      return esc(t).replace(/\n/g, '<br>');
    }

    // ---------- news from the table: applied as it arrives ----------
    function onState(st) {
      var j = J();
      if (!j) return;
      var m = me(st),
        old = U.st;
      // what the DM did to the character: applied once, then acknowledged
      U.done = U.done || {};
      ((m && m.fx) || []).forEach(function (f) {
        if (U.done[f.fid]) return;
        if (f.k === 'rest') {
          if (!W.rest) return ack(f);
          U.restAsk = U.restAsk || {};
          if (!U.restAsk[f.fid]) U.restAsk[f.fid] = f;
          return;
        }
        U.done[f.fid] = 1;
        var r = W.effect && W.effect(f);
        if (r && r.msg) news(r.msg);
        if (r && r.level && W.levelUp) U.level = true;
        ack(f);
        api.save();
      });
      // a session recap goes into the notes by itself
      j.seen = j.seen || [];
      (st.notes || []).forEach(function (n) {
        if (!n.recap || j.seen.indexOf(n.nid) >= 0) return;
        j.seen = j.seen.concat([n.nid]).slice(-100);
        if (W.addNote) {
          W.addNote(n.title || 'Session recap', n.text);
          news('The ' + GM() + '’s recap was added to your notes.');
        }
        api.save();
      });
      // buzz: your turn, you're up next, or something new
      var order = st.order || [],
        mi = m
          ? order
              .map(function (o) {
                return low(o.n);
              })
              .indexOf(low(m.name))
          : -1,
        next = order.length > 1 && mi >= 0 && (st.ti + 1) % order.length === mi,
        mine = st.turn && m && low(st.turn) === low(m.name),
        moved = !old || old.turn !== st.turn || old.round !== st.round;
      var count = function (x) {
        return x
          ? (x.msgs || []).length + (x.asks || []).length + (x.handouts || []).length + (x.notes || []).length
          : 0;
      };
      if (navigator.vibrate && old) {
        if (mine && moved) navigator.vibrate([120, 80, 120]);
        else if (next && moved) navigator.vibrate(60);
        else if (count(st) > count(old)) navigator.vibrate(150);
      }
      // the DM's music, for players who chose to follow it
      if (U.follow && api.playMusic && JSON.stringify(st.music) !== JSON.stringify(old && old.music))
        api.playMusic(st.music);
      U.st = st;
    }
    function ack(f) {
      var j = J();
      if (j) root.Table.ackFx(j.code, f.fid).catch(function () {});
    }
    function news(t) {
      U.news = (U.news || []).concat([t]).slice(-4);
    }

    // ---------- the panel ----------
    function html(who) {
      var Table = root.Table;
      if (!Table || !root.RTCPeerConnection) return '';
      if (W && W.key !== who.key) U = {};
      W = who;
      var j = J(),
        S = U.st;
      if (!j)
        return (
          '<div class="panel compact-row"><b>📱 ' +
          GM() +
          '’s table</b><input type="text" inputmode="numeric" maxlength="4" id="tp-code" data-tp="code" value="' +
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
          U = { msg: st ? 'The ' + GM() + ' removed you from the table.' : 'The table was closed.' };
          api.save();
          api.render();
          return;
        }
        onState(st);
        api.render();
      });
      if (!S)
        return (
          '<div class="panel compact-row"><b>📱 Table ' +
          j.code +
          '</b><span class="small muted">connecting…</span></div>'
        );
      var p = me(S) || {},
        turn = S.turn && low(S.turn) === low(p.name);
      var h =
        '<div class="panel tbl-me' +
        (turn ? ' my-turn' : '') +
        '"><div class="toolbar" style="margin:0"><b>📱 Table ' +
        j.code +
        '</b>' +
        (S.round
          ? '<span>Round ' + S.round + ' · ' + (turn ? '<b>your turn!</b>' : 'turn: ' + esc(S.turn || '—')) + '</span>'
          : '<span class="small muted">' + (S.open ? 'the fight is starting' : 'waiting for the ' + GM()) + '</span>') +
        '<span class="spacer"></span>' +
        btn('tpLeave', 'Leave', {}, 'btn small') +
        '</div>';
      h +=
        newsHtml() +
        orderHtml(S, p) +
        initHtml(S, p) +
        asksHtml(S, j) +
        claimsHtml(S, j) +
        giftsHtml(p) +
        handoutsHtml(S) +
        musicHtml(S);
      h += msgsHtml(S, j) + notesHtml(S, j) + rollsHtml(S, j) + loreHtml(S);
      // the character's status, sent when it changes
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
    function newsHtml() {
      var h = '';
      if ((U.news || []).length)
        h +=
          '<div class="tbl-news">' +
          U.news
            .map(function (t) {
              return '<div>⚡ ' + esc(t) + '</div>';
            })
            .join('') +
          btn('tpNewsOk', 'OK', {}, 'btn tiny') +
          '</div>';
      if (U.level)
        h +=
          '<div class="tbl-gift">🎉 <b>Level up!</b> <div class="toolbar">' +
          btn('tpLevel', 'Level up now', {}, 'btn small primary') +
          btn('tpLevelNo', 'Later', {}, 'btn small') +
          '</div></div>';
      Object.keys(U.restAsk || {}).forEach(function (fid) {
        var f = U.restAsk[fid],
          lab = ((W.rest || []).filter(function (r) {
            return r[0] === f.c;
          })[0] || [0, 'Rest'])[1];
        h +=
          '<div class="tbl-gift">🏕 <b>The ' +
          GM() +
          ' calls a ' +
          esc(lab.toLowerCase()) +
          '.</b><div class="toolbar">' +
          btn('tpRest', 'Take it', { v: fid }, 'btn small primary') +
          btn('tpRestNo', 'Not now', { v: fid }, 'btn small') +
          '</div></div>';
      });
      return h;
    }
    // the initiative order, without the monsters' numbers: who's acting and who's next
    function orderHtml(S, p) {
      var o = S.order || [];
      if (!o.length || !S.round) return '';
      var mi = o
          .map(function (x) {
            return low(x.n);
          })
          .indexOf(low(p.name)),
        next = o.length > 1 && mi >= 0 && (S.ti + 1) % o.length === mi && S.ti !== mi;
      return (
        '<div class="tbl-order">' +
        (next ? '<b class="tbl-next">You’re up next</b>' : '') +
        o
          .map(function (x, i) {
            return (
              '<span class="' +
              (i === S.ti ? 'now' : '') +
              (i === mi ? ' me' : '') +
              (x.pc ? ' pc' : '') +
              '">' +
              esc(x.n) +
              '</span>'
            );
          })
          .join('<span class="tbl-arrow">›</span>') +
        '</div>'
      );
    }
    function initHtml(S, p) {
      if (S.open && p.init == null)
        return (
          '<div class="toolbar"><b>Initiative</b>' +
          btn('tpRoll', '🎲 Roll (' + fmt(W.init) + ')', {}, 'btn small primary') +
          '<span class="small">or I rolled</span><input type="number" id="tp-mine" data-tp="mine" value="' +
          esc(U.mine || '') +
          '" placeholder="total" style="width:5rem">' +
          btn('tpSend', 'Send', {}, 'btn small') +
          '</div>'
        );
      if (p.init != null)
        return (
          '<p class="small">Your initiative: <b>' + p.init + '</b> ' + btn('tpRedo', 'change', {}, 'linkbtn') + '</p>'
        );
      return '';
    }
    function asksHtml(S, j) {
      return (S.asks || [])
        .map(function (a) {
          var r = a.ans[j.id];
          return (
            '<div class="tbl-gift">🎲 <b>The ' +
            GM() +
            ' asks: ' +
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
                btn('tpAskRoll', '🎲 Roll (' + fmt(W.bonus(a)) + ')', { v: a.rid }, 'btn small primary') +
                '<span class="small">or I rolled</span><input type="number" id="tp-ans-' +
                a.rid +
                '" data-tp="ans:' +
                a.rid +
                '" value="' +
                esc((U.ans || {})[a.rid] || '') +
                '" placeholder="total" style="width:5rem">' +
                btn('tpAskSend', 'Send', { v: a.rid }, 'btn small') +
                '</div>') +
            '</div>'
          );
        })
        .join('');
    }
    function claimsHtml(S, j) {
      return (S.claims || [])
        .map(function (c) {
          var on = c.wants.indexOf(j.id) >= 0;
          return (
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
            '</div>'
          );
        })
        .join('');
    }
    function giftsHtml(p) {
      return (p.gifts || [])
        .map(function (g) {
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
          return (
            '<div class="tbl-gift">🎁 <b>From the ' +
            GM() +
            ':</b> ' +
            esc(what.join(', ') || 'nothing') +
            '<div class="toolbar">' +
            btn('tpGift', 'Add to ' + esc(W.name || 'my character'), { v: g.gid }, 'btn small primary') +
            btn('tpGiftNo', 'Not for me', { v: g.gid }, 'btn small') +
            '</div></div>'
          );
        })
        .join('');
    }
    function handoutsHtml(S) {
      var Table = root.Table,
        h = (S.handouts || [])
          .slice()
          .reverse()
          .map(function (x) {
            var img = Table.handoutImg(x.hid);
            return (
              '<div class="tbl-gift tbl-handout">📜 <b>' +
              esc(x.title || 'From the ' + GM()) +
              '</b>' +
              (img
                ? '<button type="button" class="tbl-ho-img" data-act="tpBig" data-v="' +
                  esc(x.hid) +
                  '"><img src="' +
                  img +
                  '" alt="' +
                  esc(x.title || 'Handout') +
                  '"></button>'
                : '') +
              (x.text ? '<div class="small tbl-ho-text">' + para(x.text) + '</div>' : '') +
              '</div>'
            );
          })
          .join('');
      if (U.big && Table.handoutImg(U.big))
        h +=
          '<button type="button" class="tbl-ho-big" data-act="tpBig" data-v="" aria-label="Close"><img src="' +
          Table.handoutImg(U.big) +
          '" alt="Handout"></button>';
      return h;
    }
    function musicHtml(S) {
      if (!S.music || !api.playMusic) return '';
      return (
        '<div class="compact-row tbl-music">🎵 <span>The ' +
        GM() +
        ' is playing <b>' +
        esc(S.music.t || 'music') +
        '</b></span>' +
        (U.follow
          ? btn('tpMusic', 'Stop following', { v: '0' }, 'btn small')
          : btn('tpMusic', 'Play it here', { v: '1' }, 'btn small primary')) +
        '</div>'
      );
    }
    function fold(key, title, count, body, open) {
      return (
        '<details class="tbl-fold"' +
        (open || (U.open || {})[key] ? ' open' : '') +
        ' data-tpfold="' +
        key +
        '"><summary><b>' +
        title +
        '</b>' +
        (count ? ' <span class="small muted">(' + count + ')</span>' : '') +
        '</summary>' +
        body +
        '</details>'
      );
    }
    function msgsHtml(S, j) {
      var msgs = (S.msgs || []).slice(-8),
        last = msgs[msgs.length - 1];
      return fold(
        'msgs',
        '✉ Messages',
        msgs.length,
        (msgs.length
          ? '<ul class="dm-msgs">' +
            msgs
              .map(function (m) {
                var o = m.from === j.id;
                return (
                  '<li class="' +
                  (o ? 'out' : 'in') +
                  '"><span class="small muted">' +
                  (o ? 'You, to the ' + GM() : m.to === 'all' ? GM() + ', to everyone' : GM() + ', just for you') +
                  '</span><div>' +
                  para(m.text) +
                  '</div></li>'
                );
              })
              .join('') +
            '</ul>'
          : '') +
          '<div class="toolbar"><input type="text" id="tp-say" data-tp="say" value="' +
          esc(U.say || '') +
          '" placeholder="Message the ' +
          GM() +
          ' (only they see it)" style="flex:1;min-width:10rem">' +
          btn('tpSay', 'Send', {}, 'btn small') +
          '</div>',
        U.chat || (last && last.from === 'dm')
      );
    }
    // notes shared at the table: received ones can be saved, and any of yours can be shared with some or all
    function notesHtml(S, j) {
      var got = (S.notes || []).filter(function (n) {
          return n.from !== j.id;
        }),
        mine = W.notes ? W.notes() : [],
        others = S.players.filter(function (p) {
          return p.id !== j.id;
        }),
        to = (U.nto = U.nto || {});
      var pills =
        btn('tpNto', 'Everyone', { v: 'all' }, 'pill small' + (to.all ? ' on' : '')) +
        btn('tpNto', 'The ' + GM(), { v: 'dm' }, 'pill small' + (to.dm && !to.all ? ' on' : '')) +
        others
          .map(function (p) {
            return btn('tpNto', esc(p.name), { v: p.id }, 'pill small' + (to[p.id] && !to.all ? ' on' : ''));
          })
          .join('');
      var body =
        got
          .slice()
          .reverse()
          .map(function (n) {
            return (
              '<div class="tbl-note"><div class="toolbar" style="margin:0"><b>' +
              esc(n.title || 'A note') +
              '</b><span class="small muted">from ' +
              esc(n.from === 'dm' ? 'the ' + GM() : n.fromName) +
              (n.to === 'all' ? ', to everyone' : '') +
              '</span><span class="spacer"></span>' +
              ((U.kept || {})[n.nid] || n.recap
                ? '<span class="small good">in your notes</span>'
                : btn('tpKeep', 'Save to my notes', { v: n.nid }, 'btn tiny')) +
              '</div><div class="small">' +
              para(n.text) +
              '</div></div>'
            );
          })
          .join('') +
        '<div class="tbl-note-new"><b class="small">Share a note</b>' +
        (mine.length
          ? '<select data-tp="npick" aria-label="One of your notes"><option value="">Write a new one…</option>' +
            mine
              .map(function (n) {
                return (
                  '<option value="' +
                  esc(n.id) +
                  '"' +
                  (U.npick === n.id ? ' selected' : '') +
                  '>' +
                  esc(n.title || 'Untitled') +
                  '</option>'
                );
              })
              .join('') +
            '</select>'
          : '') +
        (U.npick
          ? ''
          : '<input type="text" id="tp-ntitle" data-tp="ntitle" value="' +
            esc(U.ntitle || '') +
            '" placeholder="Title"><textarea id="tp-ntext" data-tp="ntext" rows="2" placeholder="What you want to share (a clue, a plan, a map description…)">' +
            esc(U.ntext || '') +
            '</textarea>') +
        '<div class="small">With:</div><div class="pills">' +
        pills +
        '</div><div class="toolbar">' +
        btn('tpNoteSend', 'Share', {}, 'btn small primary') +
        '</div></div>';
      return fold('notes', '📝 Shared notes', got.length, body);
    }
    // rolls made in the app (the dice, skill buttons), shared with the table or only the DM
    function rollsHtml(S, j) {
      var share = j.share || 'all',
        log = (S.log || []).slice(-12).reverse();
      var o = function (v, t) {
        return '<option value="' + v + '"' + (share === v ? ' selected' : '') + '>' + t + '</option>';
      };
      return fold(
        'rolls',
        '🎲 Table rolls',
        log.length,
        '<label class="small">My rolls in the app: <select data-tp="share">' +
          o('all', 'shared with everyone') +
          o('dm', 'only the ' + GM() + ' sees them') +
          o('off', 'not shared') +
          '</select></label>' +
          (log.length
            ? '<ul class="tbl-log">' +
              log
                .map(function (r) {
                  return (
                    '<li><b>' +
                    esc(r.from === j.id ? 'You' : r.name) +
                    '</b> ' +
                    esc(r.label) +
                    ': <b>' +
                    r.total +
                    '</b> <span class="small muted">' +
                    esc(r.detail) +
                    (r.dmOnly ? ' · only the ' + GM() : '') +
                    '</span></li>'
                  );
                })
                .join('') +
              '</ul>'
            : '<p class="small muted">Nothing rolled yet.</p>')
      );
    }
    function loreHtml(S) {
      var L = S.lore || [];
      if (!L.length) return '';
      var row = function (l) {
        return (
          '<div class="tbl-lore">' +
          (l.pic ? '<img src="' + l.pic + '" alt="">' : '') +
          '<div><b>' +
          esc(l.name) +
          '</b>' +
          (l.done ? ' <span class="small good">✓ done</span>' : '') +
          (l.text ? '<div class="small">' + para(l.text) + '</div>' : '') +
          '</div></div>'
        );
      };
      var npcs = L.filter(function (l) {
          return l.kind === 'npc';
        }),
        quests = L.filter(function (l) {
          return l.kind === 'quest';
        });
      return fold(
        'lore',
        '🗺 People and quests',
        L.length,
        (quests.length ? '<h4>Quests</h4>' + quests.map(row).join('') : '') +
          (npcs.length ? '<h4>People</h4>' + npcs.map(row).join('') : '')
      );
    }

    // ---------- taps ----------
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
    var actions = {
      tpJoin: function () {
        var code = String(val('tp-code', 'code') || '').trim(),
          key = W.key;
        if (!/^\d{4}$/.test(code)) {
          U.msg = 'The code is 4 digits: ask your ' + GM() + '.';
          return;
        }
        if (U.busy) return false;
        U.busy = true;
        U.msg = 'Connecting to the ' + GM() + '’s table…';
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
      },
      tpNewsOk: function () {
        U.news = [];
      },
      tpLevel: function () {
        U.level = false;
        W.levelUp();
      },
      tpLevelNo: function () {
        U.level = false;
      },
      tpRest: function (v) {
        var f = (U.restAsk || {})[v];
        if (!f) return;
        delete U.restAsk[v];
        U.done[v] = 1;
        var r = W.effect(f);
        if (r && r.msg) news(r.msg);
        ack(f);
      },
      tpRestNo: function (v) {
        var f = (U.restAsk || {})[v];
        if (!f) return;
        delete U.restAsk[v];
        U.done[v] = 1;
        ack(f);
      },
      tpMusic: function (v) {
        U.follow = v === '1';
        if (api.playMusic) api.playMusic(U.follow && U.st ? U.st.music : null);
      },
      tpNto: function (v) {
        var to = (U.nto = U.nto || {});
        if (v === 'all') {
          Object.keys(to).forEach(function (k) {
            delete to[k];
          });
          to.all = true;
          return;
        }
        delete to.all;
        to[v] = !to[v];
      },
      tpNoteSend: function () {
        var j = J(),
          to = U.nto || {},
          ids = Object.keys(to).filter(function (k) {
            return to[k] && k !== 'all';
          }),
          n = U.npick
            ? (W.notes() || []).filter(function (x) {
                return x.id === U.npick;
              })[0]
            : { title: val('tp-ntitle', 'ntitle'), text: val('tp-ntext', 'ntext') };
        if (!j || !n || !String(n.text || n.title || '').trim()) {
          U.msg = 'Write the note first.';
          return;
        }
        if (!to.all && !ids.length) {
          U.msg = 'Choose who to share it with.';
          return;
        }
        root.Table.shareNote(j.code, to.all ? 'all' : ids, n.title, n.text).catch(err);
        U.ntitle = U.ntext = U.npick = '';
        U.nto = {};
        U.msg = 'Note shared.';
        (U.open = U.open || {}).notes = true;
      },
      tpKeep: function (v) {
        var n =
          U.st &&
          (U.st.notes || []).filter(function (x) {
            return x.nid === v;
          })[0];
        if (!n || !W.addNote) return;
        W.addNote(n.title || 'Note from ' + (n.from === 'dm' ? 'the ' + GM() : n.fromName), n.text);
        (U.kept = U.kept || {})[v] = 1;
        api.save();
      }
    };
    function onInput(t) {
      var k = t.getAttribute && t.getAttribute('data-tp');
      if (!k) return false;
      if (/^ans:/.test(k)) {
        U.ans = U.ans || {};
        U.ans[k.slice(4)] = t.value;
      } else if (k === 'share') {
        var j = J();
        if (j) j.share = t.value;
        api.save();
      } else U[k] = t.value;
      if (k === 'npick') api.render();
      return true;
    }
    // remember which folds are open, so a redraw keeps them
    document.addEventListener(
      'toggle',
      function (e) {
        var k = e.target && e.target.getAttribute && e.target.getAttribute('data-tpfold');
        if (k) (U.open = U.open || {})[k] = e.target.open;
      },
      true
    );
    // a roll made anywhere in the app (the dice roller, skill buttons) goes to the table
    root.addEventListener('cf-roll', function (e) {
      var j = J(),
        r = e.detail || {};
      if (!j || !U.st || (j.share || 'all') === 'off') return;
      root.Table.shareRoll(j.code, {
        label: r.label || 'Roll',
        total: r.total,
        detail: r.detail || '',
        dmOnly: j.share === 'dm'
      }).catch(function () {});
    });
    return { html: html, actions: actions, onInput: onInput };
  };
})(typeof window !== 'undefined' ? window : globalThis);
