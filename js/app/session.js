// The Session page: uses and rests, the DM’s table from a phone, concentration, conditions, Wild Shape, companions.
// Part of the app: these files share one scope (see “How the code is organized” in README.md), loaded in order by index.html.
'use strict';

// ---------- play: tick off what you use, get it back on a rest ----------
function trk(key) {
  return d.trackers.filter(function (x) {
    return x.key === key;
  })[0];
}
// One box per use: filled = still available. Tapping a filled box uses one, an empty one gives it back.
function pipsHtml(x) {
  if (x.max > 20)
    return (
      '<span class="pool">' +
      btn('trackAdj', '−', { k: x.key, v: 1 }, 'btn small') +
      ' <b>' +
      x.left +
      '</b> / ' +
      x.max +
      ' ' +
      btn('trackAdj', '+', { k: x.key, v: -1 }, 'btn small') +
      '</span>'
    );
  var h = '<span class="pips" role="group" aria-label="' + esc(x.name) + ': ' + x.left + ' of ' + x.max + ' left">';
  for (var i = 0; i < x.max; i++) {
    var on = i < x.left;
    h +=
      '<button type="button" class="pip' +
      (on ? ' on' : '') +
      '" data-act="trackAdj" data-k="' +
      esc(x.key) +
      '" data-v="' +
      (on ? 1 : -1) +
      '" title="' +
      (on ? 'Use one' : 'Get one back') +
      '" aria-label="' +
      (on ? 'Use one ' : 'Get back one ') +
      esc(x.name) +
      '"></button>';
  }
  return h + '</span>';
}
function restLabel(r) {
  return r === 'short' ? 'short or long rest' : r === 'long' ? 'long rest' : 'never (reset by hand)';
}
function restBarHtml() {
  if (ui.confirmRest)
    return (
      '<div class="rest-bar noprint rest-confirm"><b>Take a ' +
      ui.confirmRest +
      ' rest?</b> ' +
      btn('rest', 'Yes, ' + ui.confirmRest + ' rest', { v: ui.confirmRest }, 'btn primary') +
      btn('restCancel', 'Cancel') +
      '</div>'
    );
  return (
    '<div class="rest-bar noprint">' +
    btn('rest', '☾ Short rest', { v: 'short' }, 'btn') +
    btn('rest', '☀ Long rest', { v: 'long' }, 'btn primary') +
    (ui.restMsg
      ? '<span class="rest-msg">' + esc(ui.restMsg) + '</span>'
      : '<span class="small muted">Short rest: pact slots and short-rest abilities come back. Long rest: everything, plus hit points and half your hit dice.</span>') +
    '</div>'
  );
}
function trackRow(x) {
  return (
    '<div class="trk-row"><div class="trk-name"><b>' +
    esc(x.name) +
    '</b>' +
    (x.note ? '<div class="small muted">' + esc(x.note) + '</div>' : '') +
    '</div>' +
    pipsHtml(x) +
    '<span class="small muted trk-rest">' +
    (x.max > 20 ? '' : x.left + '/' + x.max + ' · ') +
    'back on ' +
    restLabel(x.rest) +
    '</span></div>'
  );
}
// ---------- joining the DM's table from this phone ----------
function tableJoinHtml() {
  if (!window.Table) return '';
  if (ui.tping === undefined) {
    ui.tping = 'wait';
    Table.ping().then(function (j) {
      ui.tping = j;
      if (j) render();
    });
  }
  if (!ui.tping || ui.tping === 'wait') return '';
  var J = (store.tableJoin || {})[ch.id],
    S = ui.tstate;
  if (!J)
    return (
      '<div class="panel compact-row"><b>📱 DM’s table</b><input type="text" inputmode="numeric" maxlength="4" id="tbl-code" data-tblcode="1" value="' +
      esc(ui.tblCode || '') +
      '" placeholder="code" style="width:5.5rem">' +
      btn('tblJoin', ui.tblBusy ? 'Joining…' : 'Join', {}, 'btn small primary') +
      (ui.tblMsg ? '<span class="small ' + (ui.tblBusy ? 'muted' : 'bad') + '">' + esc(ui.tblMsg) + '</span>' : '') +
      '</div>'
    );
  Table.setCreds(J.code, J.id, J.token);
  Table.watch(J.code, function (st, err) {
    if (!st) {
      delete store.tableJoin[ch.id];
      ui.tstate = null;
      ui.tblMsg = 'The table was closed.';
      save();
      render();
      return;
    }
    var me = st.players.filter(function (p) {
      return p.id === J.id;
    })[0];
    if (!me) {
      delete store.tableJoin[ch.id];
      ui.tstate = null;
      ui.tblMsg = 'The DM removed you from the table.';
      save();
      render();
      return;
    }
    var mine = st.turn && st.turn.trim().toLowerCase() === String(me.name).trim().toLowerCase();
    if (mine && !(ui.tstate && ui.tstate.turn === st.turn && ui.tstate.round === st.round) && navigator.vibrate)
      navigator.vibrate([120, 80, 120]);
    var news = (st.msgs || []).length + (st.asks || []).length + (st.handouts || []).length,
      was = ui.tstate
        ? (ui.tstate.msgs || []).length + (ui.tstate.asks || []).length + (ui.tstate.handouts || []).length
        : news;
    if (news > was && navigator.vibrate) navigator.vibrate(150);
    if (
      (me.gifts || []).length >
        (
          (
            (ui.tstate &&
              ui.tstate.players.filter(function (p) {
                return p.id === J.id;
              })[0]) ||
            {}
          ).gifts || []
        ).length &&
      navigator.vibrate
    )
      navigator.vibrate(200);
    ui.tstate = st;
    render();
  });
  if (!S)
    return (
      '<div class="panel compact-row"><b>📱 Table ' + J.code + '</b><span class="small muted">connecting…</span></div>'
    );
  var me =
      S.players.filter(function (p) {
        return p.id === J.id;
      })[0] || {},
    mine =
      S.turn &&
      S.turn.trim().toLowerCase() ===
        String(me.name || '')
          .trim()
          .toLowerCase();
  var h =
    '<div class="panel tbl-me' +
    (mine ? ' my-turn' : '') +
    '"><div class="toolbar" style="margin:0"><b>📱 Table ' +
    J.code +
    '</b>' +
    (S.round
      ? '<span>Round ' + S.round + ' · ' + (mine ? '<b>your turn!</b>' : 'turn: ' + esc(S.turn || '—')) + '</span>'
      : '<span class="small muted">' + (S.open ? 'the fight is starting' : 'waiting for the DM') + '</span>') +
    '<span class="spacer"></span>' +
    btn('tblLeave', 'Leave', {}, 'btn small') +
    '</div>';
  if (S.open && me.init == null)
    h +=
      '<div class="toolbar"><b>Initiative</b>' +
      btn('tblRoll', '🎲 Roll (' + R.fmt(d.init) + ')', {}, 'btn small primary') +
      '<span class="small">or I rolled</span><input type="number" id="tbl-mine" data-tblmine="1" value="' +
      esc(ui.tblMine || '') +
      '" placeholder="total" style="width:5rem">' +
      btn('tblSend', 'Send', {}, 'btn small') +
      '</div>';
  else if (me.init != null)
    h += '<p class="small">Your initiative: <b>' + me.init + '</b> ' + btn('tblRedo', 'change', {}, 'linkbtn') + '</p>';
  (S.claims || []).forEach(function (c) {
    var mine = c.wants.indexOf(J.id) >= 0;
    h +=
      '<div class="tbl-gift">🎲 <b>' +
      esc(c.n) +
      '</b> ' +
      (c.result
        ? '<div class="small">' + esc(c.result) + '</div>'
        : '<span class="small muted">is up for grabs: tap if you want it, the dice decide.</span><div class="toolbar">' +
          btn(
            'tblWant',
            mine ? '✋ I’m in (tap to back out)' : 'I want it',
            { v: c.key },
            'btn small' + (mine ? '' : ' primary')
          ) +
          '</div>') +
      '</div>';
  });
  (me.gifts || []).forEach(function (g) {
    var coins = ['pp', 'gp', 'ep', 'sp', 'cp']
      .filter(function (k) {
        return +g.coins[k] > 0;
      })
      .map(function (k) {
        return (+g.coins[k]).toLocaleString('en') + ' ' + k;
      });
    var what = coins.concat(
      (g.items || []).map(function (i) {
        return String(i.n || 'an item');
      })
    );
    h +=
      '<div class="tbl-gift">🎁 <b>From the DM:</b> ' +
      esc(what.join(', ') || 'nothing') +
      '<div class="toolbar">' +
      btn('tblGift', 'Add to ' + esc(ch.name || 'my character'), { v: g.gid }, 'btn small primary') +
      btn('tblGiftNo', 'Not for me', { v: g.gid }, 'btn small') +
      '</div></div>';
  });
  h += tableDmHtml(J, S);
  sendStatus(J);
  return h + (ui.tblMsg ? '<p class="small rest-msg">' + esc(ui.tblMsg) + '</p>' : '') + '</div>';
}
// what the DM sent this player: roll requests, handouts and messages, and a box to answer
function askBonus(a) {
  return a.kind === 'save'
    ? (d.saves[a.key] || {}).total || 0
    : a.kind === 'skill'
      ? (d.skills[a.key] || {}).total || 0
      : ((d.abilities || {})[a.key] || {}).mod || 0;
}
function tableDmHtml(J, S) {
  var h = '';
  (S.asks || []).forEach(function (a) {
    var r = a.ans[J.id],
      b = askBonus(a);
    h +=
      '<div class="tbl-gift">🎲 <b>The DM asks: ' +
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
          btn('tblAskRoll', '🎲 Roll (' + R.fmt(b) + ')', { v: a.rid }, 'btn small primary') +
          '<span class="small">or I rolled</span><input type="number" id="tbl-ans-' +
          a.rid +
          '" data-tblans="' +
          a.rid +
          '" value="' +
          esc((ui.tblAns || {})[a.rid] || '') +
          '" placeholder="total" style="width:5rem">' +
          btn('tblAskSend', 'Send', { v: a.rid }, 'btn small') +
          '</div>') +
      '</div>';
  });
  (S.handouts || [])
    .slice()
    .reverse()
    .forEach(function (x) {
      var img = Table.handoutImg(x.hid);
      h +=
        '<div class="tbl-gift tbl-handout">📜 <b>' +
        esc(x.title || 'Handout from the DM') +
        '</b>' +
        (img
          ? '<button type="button" class="tbl-ho-img" data-act="tblHoBig" data-v="' +
            esc(x.hid) +
            '"><img src="' +
            img +
            '" alt="' +
            esc(x.title || 'Handout') +
            '"></button>'
          : '<span class="small muted"> loading…</span>') +
        '</div>';
    });
  if (ui.tblHoBig && Table.handoutImg(ui.tblHoBig))
    h +=
      '<button type="button" class="tbl-ho-big" data-act="tblHoBig" data-v="" aria-label="Close"><img src="' +
      Table.handoutImg(ui.tblHoBig) +
      '" alt="Handout"></button>';
  var msgs = (S.msgs || []).slice(-8);
  h +=
    '<details class="tbl-chat"' +
    (ui.tblChat || (msgs.length && msgs[msgs.length - 1].from === 'dm') ? ' open' : '') +
    '><summary><b>✉ Messages</b>' +
    (msgs.length ? ' <span class="small muted">(' + msgs.length + ')</span>' : '') +
    '</summary>' +
    (msgs.length
      ? '<ul class="dm-msgs">' +
        msgs
          .map(function (m) {
            var mine = m.from === J.id;
            return (
              '<li class="' +
              (mine ? 'out' : 'in') +
              '"><span class="small muted">' +
              (mine ? 'You, to the DM' : m.to === 'all' ? 'DM, to everyone' : 'DM, just for you') +
              '</span><div>' +
              esc(m.text).replace(/\n/g, '<br>') +
              '</div></li>'
            );
          })
          .join('') +
        '</ul>'
      : '') +
    '<div class="toolbar"><input type="text" id="tbl-say" data-tblsay="1" value="' +
    esc(ui.tblSay || '') +
    '" placeholder="Message the DM (only they see it)" style="flex:1;min-width:10rem">' +
    btn('tblSay', 'Send', {}, 'btn small') +
    '</div></details>';
  return h;
}
// tell the DM how this character is doing, when it changes
function sendStatus(J) {
  var T = ch.track || {},
    st = {
      hp: T.hp == null ? d.hp : T.hp,
      max: d.hp,
      temp: +T.temp || 0,
      ac: d.ac,
      conds: Object.keys(T.conds || {}).concat(+T.exh ? ['Exhaustion ' + T.exh] : []),
      conc: T.conc || ''
    };
  var k = J.code + JSON.stringify(st);
  if (ui.tblSent === k) return;
  ui.tblSent = k;
  Table.status(J.code, st).catch(function () {
    ui.tblSent = '';
  });
}
// take what the DM sent: coins into the purse, items into the inventory (only plain fields are kept)
function takeGift(g) {
  var m = (ch.money = ch.money || {});
  ['pp', 'gp', 'ep', 'sp', 'cp'].forEach(function (k) {
    var n = Math.max(0, Math.min(1e7, Math.floor(+(g.coins || {})[k] || 0)));
    if (n) m[k] = (+m[k] || 0) + n;
  });
  (g.items || []).slice(0, 20).forEach(function (i) {
    if (!i || !i.n) return;
    var mi =
      i.k === 'magic' &&
      D.magicItems.filter(function (x) {
        return x[0] === String(i.n);
      })[0];
    ch.items.push(
      mi
        ? {
            id: R.uid(),
            k: 'magic',
            n: mi[0],
            r: mi[1].indexOf(i.r) >= 0 ? i.r : mi[1][0],
            type: mi[2],
            att: !!mi[3],
            attuned: false,
            slug: mi[4],
            qty: 1,
            w: 0,
            note: 'From the DM'
          }
        : {
            id: R.uid(),
            k: 'custom',
            n: String(i.n).slice(0, 80),
            qty: 1,
            w: 0,
            note: String(i.note || 'From the DM').slice(0, 200)
          }
    );
  });
}
function sendInit(v) {
  var J = (store.tableJoin || {})[ch.id];
  if (!J) return;
  Table.roll(J.code, J.id, J.token, v).then(
    function (st) {
      ui.tstate = st;
      ui.tblMine = '';
      render();
    },
    function (e) {
      ui.tblMsg = e.message;
      render();
    }
  );
}
function hitDieSizes() {
  var z = [];
  (ch.classes || []).forEach(function (e) {
    var c = D.classes.filter(function (x) {
      return x.id === e.cls;
    })[0];
    if (c && z.indexOf(c.hitDie) < 0) z.push(c.hitDie);
  });
  return z.length
    ? z.sort(function (a, b) {
        return b - a;
      })
    : [8];
}
// ---------- concentration ----------
function concHtml() {
  var T = ch.track || {},
    list = mySpellRows()
      .filter(function (r) {
        return r.s && r.s.conc && r.ready;
      })
      .map(function (r) {
        return r.name;
      });
  var war = JSON.stringify(ch.picks || {}).indexOf('War Caster') >= 0;
  if (!list.length && !T.conc) return '';
  if (!T.conc)
    return (
      '<div class="panel compact-row"><b>Concentration</b><select data-concpick="1" aria-label="Concentrate on a spell"><option value="">— none —</option>' +
      list
        .map(function (n) {
          return '<option>' + esc(n) + '</option>';
        })
        .join('') +
      '</select>' +
      (ui.concMsg ? '<span class="small muted">' + esc(ui.concMsg) + '</span>' : '') +
      '</div>'
    );
  var dmg = ui.concDmg,
    dc = dmg ? Math.max(10, Math.floor(dmg / 2)) : 0;
  return (
    '<div class="panel compact-row conc-panel"><b>Concentration</b><span class="conc-on">◉ ' +
    esc(T.conc) +
    '</span>' +
    (dc
      ? '<span>Con save <b>DC ' +
        dc +
        '</b>' +
        (war ? ' (adv.)' : '') +
        '</span>' +
        btn('concRoll', '🎲 ' + R.fmt(d.saves.CON.total), {}, 'btn small primary') +
        '<input type="number" id="conc-mine" data-concmine="1" placeholder="or total" style="width:5.5rem" aria-label="The total you rolled">' +
        btn('concCheck', 'OK', {}, 'btn small')
      : '') +
    btn('concEnd', 'End', {}, 'btn small') +
    (ui.concMsg ? '<span class="small rest-msg">' + esc(ui.concMsg) + '</span>' : '') +
    '</div>'
  );
}
// ---------- conditions ----------
var CONDS = [
  [
    'Blinded',
    'Can’t see; checks that need sight fail. Attacks against you have advantage, your attacks have disadvantage.'
  ],
  [
    'Charmed',
    'Can’t attack the charmer or target it with harmful effects; the charmer has advantage on social checks with you.'
  ],
  ['Deafened', 'Can’t hear; checks that need hearing fail.'],
  ['Frightened', 'Disadvantage on ability checks and attacks while the source is in sight; can’t move closer to it.'],
  ['Grappled', 'Speed 0. Ends if the grappler is incapacitated or you are moved out of reach.'],
  ['Incapacitated', 'No actions or reactions (concentration ends).'],
  [
    'Invisible',
    'Can’t be seen without magic or a special sense. Your attacks have advantage, attacks against you have disadvantage.'
  ],
  [
    'Paralyzed',
    'Incapacitated, can’t move or speak. Fail Strength and Dexterity saves. Attacks against you have advantage; hits from within 5 ft are critical.'
  ],
  [
    'Petrified',
    'Turned to stone: incapacitated, resistance to all damage, immune to poison and disease. Fail Strength and Dexterity saves.'
  ],
  ['Poisoned', 'Disadvantage on attack rolls and ability checks.'],
  [
    'Prone',
    'Can only crawl (standing up costs half your speed). Disadvantage on your attacks; attacks within 5 ft have advantage, farther ones disadvantage.'
  ],
  ['Restrained', 'Speed 0. Disadvantage on attacks and Dexterity saves; attacks against you have advantage.'],
  [
    'Stunned',
    'Incapacitated, can’t move, can barely speak. Fail Strength and Dexterity saves; attacks against you have advantage.'
  ],
  [
    'Unconscious',
    'Incapacitated, drop what you hold, fall prone. Fail Strength and Dexterity saves; attacks against you have advantage, hits within 5 ft are critical.'
  ]
];
var EXH = [
  '',
  'Disadvantage on ability checks.',
  'Speed halved.',
  'Disadvantage on attack rolls and saving throws.',
  'Hit point maximum halved.',
  'Speed 0.',
  'Death.'
];
function liveSpeed() {
  var T = ch.track || {},
    c = T.conds || {},
    ex = +T.exh || 0;
  return c.Grappled || c.Restrained || c.Paralyzed || c.Petrified || c.Stunned || c.Unconscious || ex >= 5
    ? 0
    : ex >= 2
      ? Math.floor(d.speed / 2)
      : d.speed;
}
function condHtml() {
  var T = ch.track || {},
    on = T.conds || {},
    ex = +T.exh || 0,
    act = CONDS.filter(function (c) {
      return on[c[0]];
    }),
    open = ui.condOpen;
  var sum = act
    .map(function (c) {
      return c[0];
    })
    .concat(ex ? ['Exhaustion ' + ex] : []);
  var h =
    '<div class="panel cond-panel"><button type="button" class="cond-head" data-act="condOpen" aria-expanded="' +
    !!open +
    '"><b>Conditions</b> <span class="' +
    (sum.length ? 'bad' : 'small muted') +
    '">' +
    esc(sum.join(', ') || 'none') +
    '</span><span class="spacer"></span><span aria-hidden="true">' +
    (open ? '▾' : '▸') +
    '</span></button>';
  if (act.length || ex)
    h +=
      '<ul class="cond-list">' +
      act
        .map(function (c) {
          return '<li><b>' + c[0] + ':</b> ' + esc(c[1]) + '</li>';
        })
        .join('') +
      (ex ? '<li><b>Exhaustion ' + ex + ':</b> ' + esc(EXH.slice(1, ex + 1).join(' ')) + '</li>' : '') +
      '</ul>';
  if (open)
    h +=
      '<div class="pills">' +
      CONDS.map(function (c) {
        return btn('condToggle', c[0], { v: c[0] }, 'pill small' + (on[c[0]] ? ' on' : ''));
      }).join('') +
      '</div>' +
      '<div class="toolbar"><span>Exhaustion</span>' +
      btn('exh', '−', { v: -1 }, 'btn small') +
      '<b>' +
      ex +
      '</b>' +
      btn('exh', '+', { v: 1 }, 'btn small') +
      '<span class="small muted">a long rest removes one level</span></div>';
  return h + '</div>';
}
// ---------- Wild Shape and companions (creatures from the Monsters list) ----------
var FAMILIARS = [
  'Bat',
  'Cat',
  'Crab',
  'Frog',
  'Hawk',
  'Lizard',
  'Octopus',
  'Owl',
  'Poisonous Snake',
  'Quipper',
  'Rat',
  'Raven',
  'Sea Horse',
  'Spider',
  'Weasel'
];
function creatureHp(key, cur, max, label) {
  var pct = max ? Math.max(0, Math.round((cur / max) * 100)) : 0;
  return (
    '<div class="pm-hp"><span><b>' +
    cur +
    '</b>/' +
    max +
    ' HP' +
    (label ? ' · ' + esc(label) : '') +
    '</span><div class="hpbar"><span style="width:' +
    pct +
    '%"></span></div><div class="enc-adj">' +
    ['-10', '-5', '-1', '+1', '+5', '+10']
      .map(function (v) {
        return btn('crHp', v.replace('-', '−'), { v: key, d: v }, 'btn small');
      })
      .join('') +
    '</div></div>'
  );
}
function wildShapeHtml() {
  var dl = 0;
  (ch.classes || []).forEach(function (e) {
    if (e.cls === 'druid') dl = e.level;
  });
  if (dl < 2) return '';
  if (!MON.ensure(render))
    return '<div class="panel"><h3>Wild Shape</h3><p class="small muted">Loading the beasts…</p></div>';
  var moon = (ch.classes || []).some(function (e) {
    return e.cls === 'druid' && /moon/.test(e.subclass || '');
  });
  var maxCr = moon ? (dl >= 6 ? Math.floor(dl / 3) : 1) : dl >= 8 ? 1 : dl >= 4 ? 0.5 : 0.25,
    noFly = dl < 8,
    noSwim = dl < 4;
  var T = ch.track || {},
    ws = T.ws,
    cur = ws && MON.find(ws.id);
  var h = '<div class="panel"><h3>Wild Shape</h3>';
  if (cur) {
    h +=
      '<div class="toolbar" style="margin:0"><b>' +
      esc(cur.n) +
      '</b><span class="small muted">AC ' +
      (cur.acv || cur.ac) +
      ' · ' +
      esc(cur.sp || cur.mv || '') +
      '</span><span class="spacer"></span>' +
      btn('wsEnd', 'Revert', {}, 'btn small') +
      '</div>' +
      creatureHp('ws', ws.hp, cur.hp, 'when it drops to 0 you revert, and extra damage carries over to you') +
      '<details class="ws-block"><summary>Stat block</summary>' +
      MON.block(cur) +
      '</details>';
    return h + '</div>';
  }
  var beasts = MON.all()
    .filter(function (m) {
      var mv = String(m.sp || m.mv || '');
      return (
        /^beast/i.test(m.type || '') &&
        (+m.cr || 0) <= maxCr &&
        !(noFly && /fly/.test(mv)) &&
        !(noSwim && /swim/.test(mv))
      );
    })
    .sort(function (a, b) {
      return (+b.cr || 0) - (+a.cr || 0) || (a.n < b.n ? -1 : 1);
    });
  var q = ui.q.ws || '',
    shown = beasts.filter(function (m) {
      return match(q, m.n);
    });
  h +=
    '<p class="small muted">' +
    (moon ? 'Circle of the Moon: ' : '') +
    'beasts up to challenge ' +
    MON.crText(maxCr) +
    (noFly ? ', no flying' : '') +
    (noSwim ? ' or swimming' : '') +
    ' speed. ' +
    beasts.length +
    ' forms.</p>' +
    '<div class="toolbar">' +
    search('ws', 'Find a beast…') +
    '</div><div class="optlist ws-list">' +
    shown
      .slice(0, 40)
      .map(function (m) {
        return (
          '<div class="spell"><div style="flex:1"><b>' +
          esc(m.n) +
          '</b> <span class="small muted">CR ' +
          MON.crText(+m.cr || 0) +
          ' · AC ' +
          (m.acv || '') +
          ' · ' +
          m.hp +
          ' HP · ' +
          esc(m.sp || m.mv || 'walk') +
          '</span></div>' +
          btn('wsStart', 'Turn into', { v: m.id }, 'btn small') +
          '</div>'
        );
      })
      .join('') +
    '</div>';
  return h + '</div>';
}
function companionsHtml() {
  var L = ch.companions || [],
    h = '<div class="panel"><h3>Familiars and companions</h3>';
  if (!MON.ensure(render)) return h + '<p class="small muted">Loading the creatures…</p></div>';
  h += L.map(function (c) {
    var m = MON.find(c.mon),
      open = (ui.compOpen || {})[c.id];
    return (
      '<div class="comp"><div class="toolbar" style="margin:0"><b>' +
      esc(c.n) +
      '</b><span class="small muted">' +
      (m ? esc(m.n) + ' · AC ' + (m.acv || m.ac) + ' · ' + esc(m.sp || m.mv || '') : '') +
      '</span><span class="spacer"></span>' +
      btn('compOpen', open ? 'Hide stats' : 'Stats', { v: c.id }, 'btn small') +
      btn('compRm', '✕', { v: c.id }, 'btn small') +
      '</div>' +
      creatureHp('c:' + c.id, c.hp, c.max) +
      (open && m ? MON.block(m) : '') +
      '</div>'
    );
  }).join('');
  var q = ui.q.comp || '',
    fam = FAMILIARS.map(function (n) {
      return MON.all().filter(function (m) {
        return m.n === n;
      })[0];
    }).filter(Boolean);
  var found =
    q.trim().length >= 2
      ? MON.all()
          .filter(function (m) {
            return match(q, m.n);
          })
          .slice(0, 15)
      : [];
  h +=
    '<div class="small" style="margin-top:.5rem">Add a familiar: ' +
    fam
      .map(function (m) {
        return btn('compAdd', esc(m.n), { v: m.id }, 'pill small');
      })
      .join('') +
    '</div>' +
    '<div class="toolbar">' +
    search('comp', 'Or find any creature (a ranger’s beast, a summon, a mount)…') +
    '</div>' +
    (found.length
      ? '<div class="optlist">' +
        found
          .map(function (m) {
            return (
              '<div class="spell"><div style="flex:1"><b>' +
              esc(m.n) +
              '</b> <span class="small muted">CR ' +
              MON.crText(+m.cr || 0) +
              ' · ' +
              m.hp +
              ' HP</span></div>' +
              btn('compAdd', '+ Add', { v: m.id }, 'btn small') +
              '</div>'
            );
          })
          .join('') +
        '</div>'
      : '');
  return h + '</div>';
}
function stepPlay() {
  var T = ch.track || {},
    hp = T.hp == null ? d.hp : T.hp,
    hdUsed = Math.min(d.level, +T.hd || 0);
  var h = '<h2>Session</h2>' + tableJoinHtml() + restBarHtml();
  h +=
    '<div class="panel"><h3>Hit points</h3><div class="hp-row"><label>Current <input type="number" id="trk-hp" data-trk="hp" value="' +
    hp +
    '" min="0" max="' +
    d.hp +
    '"></label><span class="muted">/ ' +
    d.hp +
    '</span>' +
    ['-10', '-5', '-1', '+1', '+5', '+10']
      .map(function (v) {
        return btn('hpAdj', v, { v: v }, 'btn small');
      })
      .join('') +
    '<label>Temporary <input type="number" id="trk-temp" data-trk="temp" value="' +
    (+T.temp || 0) +
    '" min="0"></label></div>' +
    (hp <= 0
      ? '<div class="death"><b>Death saves</b> ' +
        ['deathOk', 'deathFail']
          .map(function (k) {
            var n = +T[k] || 0,
              b = '';
            for (var i = 0; i < 3; i++)
              b +=
                '<button type="button" class="pip' +
                (i < n ? ' on ' + (k === 'deathOk' ? 'ok' : 'fail') : '') +
                '" data-act="death" data-k="' +
                k +
                '" data-v="' +
                (i < n ? i : i + 1) +
                '" aria-label="' +
                (k === 'deathOk' ? 'Success' : 'Failure') +
                ' ' +
                (i + 1) +
                '"></button>';
            return (
              '<span>' + (k === 'deathOk' ? 'Successes' : 'Failures') + ' <span class="pips">' + b + '</span></span>'
            );
          })
          .join(' ') +
        '</div>'
      : '') +
    trackRow({
      key: 'hd',
      name: 'Hit dice (' + d.hitDice + ')',
      max: d.level,
      left: d.level - hdUsed,
      used: hdUsed,
      rest: 'long',
      note: 'Spend them on a short rest to heal; a long rest gives back half.'
    }) +
    (d.level - hdUsed > 0
      ? '<div class="toolbar hd-spend"><span class="small">Short rest:</span>' +
        hitDieSizes()
          .map(function (z) {
            return btn('spendHD', '🎲 Spend a d' + z + ' (' + R.fmt(d.abilities.CON.mod) + ')', { v: z }, 'btn small');
          })
          .join('') +
        '<input type="number" min="1" max="12" id="hd-mine" data-hdmine="1" placeholder="or die roll" style="width:6rem" aria-label="What the hit die showed">' +
        btn('spendHDMine', 'Heal', {}, 'btn small') +
        '</div>'
      : '') +
    (ui.hdMsg ? '<p class="small rest-msg">' + esc(ui.hdMsg) + '</p>' : '') +
    '</div>' +
    concHtml() +
    condHtml();
  // inspiration: one from the DM, one Bardic Inspiration die from a bard
  var sq = function (k, label, sub, on) {
    return (
      '<button type="button" class="insp-sq' +
      (on ? ' on' : '') +
      '" data-act="inspToggle" data-v="' +
      k +
      '" aria-pressed="' +
      !!on +
      '"><span class="insp-box">' +
      (on ? '★' : '') +
      '</span><span><b>' +
      label +
      '</b><small>' +
      sub +
      '</small></span></button>'
    );
  };
  h +=
    '<div class="panel"><h3>Inspiration</h3><div class="insp-row">' +
    sq(
      'insp',
      'Inspiration',
      T.insp ? 'From the DM. Tap when you use it (advantage on one roll).' : 'Tap when the DM gives you inspiration.',
      T.insp
    ) +
    sq(
      'bardic',
      'Bardic Inspiration' + (T.bardic ? ' ' + T.bardic : ''),
      T.bardic
        ? 'Add the ' + T.bardic + ' to one ability check, attack or save within 10 minutes. Tap when used.'
        : 'Tap when a bard inspires you.',
      T.bardic
    ) +
    '<label class="small">Die <select data-bardie="1" aria-label="Bardic Inspiration die">' +
    ['d6', 'd8', 'd10', 'd12']
      .map(function (x) {
        return '<option' + ((T.bardDie || 'd6') === x ? ' selected' : '') + '>' + x + '</option>';
      })
      .join('') +
    '</select></label>' +
    (T.bardic ? btn('rollBardic', '🎲 Roll ' + T.bardic, {}, 'btn small') : '') +
    '</div>' +
    (ui.bardRoll ? '<p class="small rest-msg">' + esc(ui.bardRoll) + '</p>' : '') +
    '</div>';
  var stat = function (x) {
    return '<div class="stat"><b>' + x[1] + '</b><span>' + x[0] + '</span></div>';
  };
  h +=
    '<div class="panel"><h3>Combat</h3><div class="slots combat-stats">' +
    [
      ['Armor class', d.ac],
      ['Initiative', R.fmt(d.init)],
      ['Speed', liveSpeed() + ' ft'],
      ['Passive Perception', d.passive],
      ['Proficiency', R.fmt(d.pb)]
    ]
      .concat(
        d.casters.map(function (S) {
          return [(d.casters.length > 1 ? S.name + ' s' : 'S') + 'pell DC / attack', S.dc + ' / ' + R.fmt(S.atk)];
        })
      )
      .map(stat)
      .join('') +
    '</div>' +
    '<h4>Saving throws</h4><div class="slots combat-stats">' +
    AB.map(function (a) {
      var s = d.saves[a];
      return stat([D.abilityNames[a] + (s.prof ? ' ●' : ''), R.fmt(s.total)]);
    }).join('') +
    '</div></div>';
  if (d.attacks.length) h += '<div class="panel"><h3>Weapons</h3>' + attacksHtml(false) + '</div>';
  h += wildShapeHtml() + companionsHtml();
  var quick = ch.items.filter(function (i) {
    return i.quick;
  });
  h +=
    '<div class="panel"><h3>Quick access</h3>' +
    (quick.length
      ? quick
          .map(function (it) {
            var op = (ui.itemOpen || {})[it.id];
            return (
              '<div class="trk-row"><div class="trk-name"><button type="button" class="fold" data-act="itemOpen" data-v="' +
              it.id +
              '" aria-expanded="' +
              !!op +
              '">' +
              (op ? '▾' : '▸') +
              '</button> <b>' +
              esc(it.n) +
              '</b>' +
              (it.qty > 1 ? ' ×' + it.qty : '') +
              ' <span class="small muted">' +
              esc(itemMeta(it)) +
              (it.att ? (it.attuned ? ' · attuned' : ' · not attuned') : '') +
              '</span>' +
              (it.note ? '<div class="small">' + esc(it.note) + '</div>' : '') +
              (op ? itemDescHtml(it) : '') +
              '</div>' +
              btn('quickItem', '✕', { v: it.id }, 'btn tiny') +
              '</div>'
            );
          })
          .join('')
      : '<p class="small muted">Tap ☆ Quick next to an item on the ' +
        btn('step', 'Items', { v: 'items' }, 'linkbtn') +
        ' page to keep it here during combat.</p>') +
    '</div>';
  var slots = d.trackers.filter(function (x) {
    return x.group === 'slots';
  });
  if (slots.length) h += '<div class="panel"><h3>Spell slots</h3>' + slots.map(trackRow).join('') + '</div>';
  var inn = d.trackers.filter(function (x) {
    return x.group === 'spells';
  });
  if (inn.length) h += '<div class="panel"><h3>Once-per-rest spells</h3>' + inn.map(trackRow).join('') + '</div>';
  var groups = [];
  d.trackers.forEach(function (x) {
    if (['slots', 'spells', 'own'].indexOf(x.group) < 0 && groups.indexOf(x.group) < 0) groups.push(x.group);
  });
  groups.forEach(function (g) {
    h +=
      '<div class="panel"><h3>' +
      esc(g) +
      '</h3>' +
      d.trackers
        .filter(function (x) {
          return x.group === g;
        })
        .map(trackRow)
        .join('') +
      '</div>';
  });
  // every invocation and infusion picked, with what it does (the ones with uses are counted above)
  var feats2 = [];
  d.choices.forEach(function (c) {
    var kind = /invocation/i.test(c.key) ? 'inv' : /infusion/i.test(c.key) ? 'inf' : '';
    if (!kind) return;
    (c.picked || []).forEach(function (n) {
      var r = ((kind === 'inv' ? D.invocations : D.infusions) || []).filter(function (x) {
        return x[0] === n;
      })[0];
      if (
        r &&
        !feats2.some(function (f) {
          return f[1] === n;
        })
      )
        feats2.push([kind, n, r[2]]);
    });
  });
  ['inv', 'inf'].forEach(function (k) {
    var list = feats2.filter(function (f) {
      return (
        f[0] === k &&
        !d.trackers.some(function (x) {
          return x.name === f[1];
        })
      );
    });
    if (list.length)
      h +=
        '<div class="panel"><h3>' +
        (k === 'inv' ? 'Other invocations' : 'Other infusions') +
        '</h3>' +
        list
          .map(function (f) {
            return (
              '<div class="trk-row"><div class="trk-name"><b>' +
              esc(f[1]) +
              '</b><div class="small muted">' +
              esc(f[2]) +
              '</div></div></div>'
            );
          })
          .join('') +
        '</div>';
  });
  var own = d.trackers.filter(function (x) {
    return x.group === 'own';
  });
  h +=
    '<div class="panel"><h3>Your own counters</h3><p class="small muted">For anything else with limited uses: a magic item’s charges, a feat, a boon, an ability the builder doesn’t count.</p>' +
    own
      .map(function (x) {
        var c = x.own;
        return (
          trackRow(x) +
          '<div class="row ctr-edit"><label>Name <input id="ctr-' +
          c.id +
          '-n" data-ctr="' +
          c.id +
          '" data-f="n" value="' +
          esc(c.n || '') +
          '"></label><label>Uses <input type="number" min="1" max="99" id="ctr-' +
          c.id +
          '-max" data-ctr="' +
          c.id +
          '" data-f="max" value="' +
          (+c.max || 1) +
          '"></label>' +
          '<label>Comes back on <select data-ctr="' +
          c.id +
          '" data-f="rest">' +
          [
            ['short', 'Short or long rest'],
            ['long', 'Long rest'],
            ['', 'Never (by hand)']
          ]
            .map(function (o) {
              return (
                '<option value="' + o[0] + '"' + ((c.rest || '') === o[0] ? ' selected' : '') + '>' + o[1] + '</option>'
              );
            })
            .join('') +
          '</select></label>' +
          btn('rmCounter', 'Remove', { v: c.id }, 'btn small danger') +
          '</div>'
        );
      })
      .join('') +
    btn('addCounter', '+ Add a counter') +
    '</div>';
  h +=
    '<div class="panel"><h3>Skills</h3><ul class="lines play-skills">' +
    Object.keys(d.skills)
      .map(function (k) {
        var s = d.skills[k];
        return (
          '<li><span class="dot' +
          (s.expertise ? ' e' : s.prof ? ' p' : '') +
          '"></span><span class="v">' +
          R.fmt(s.total) +
          '</span><span>' +
          k +
          ' <small class="muted">' +
          s.ability +
          '</small></span></li>'
        );
      })
      .join('') +
    '</ul></div>';
  return h;
}
function checkTableLink() {
  if (location.hash === '#dm') {
    store.game = 'dnd';
    ui.section = 'dm';
    try {
      history.replaceState(null, '', location.pathname + location.search);
    } catch (e) {
      /* ignore */
    }
    render();
    return;
  }
  var m = String(location.hash || '').match(/^#table=(\d{4})$/);
  if (m) {
    ui.tblCode = m[1];
    ui.tblHint = m[1];
    try {
      history.replaceState(null, '', location.pathname + location.search);
    } catch (e) {
      /* ignore */
    }
    render();
  }
}
