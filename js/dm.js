// The DM's corner (D&D, Pathfinder 2e, M&M 3e): the DM tools in one place, and the table with the players' phones:
// who is there and how they're doing, what happens to their characters (damage, conditions, inspiration, rests, XP),
// roll requests and secret rolls, messages, shared notes, handouts, the NPCs and quests they know, and the session log.
(function (root) {
  'use strict';
  var AB = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'];
  var TOOLS = {
    dnd: [
      ['party', 'campfire', 'Party'],
      ['encounters', 'swords', 'Encounters'],
      ['monsters', 'dragon', 'Monsters'],
      ['treasure', 'coins', 'Treasures'],
      ['gen', 'sparkle', 'Generators']
    ],
    pf2: [
      ['pf2-party', 'campfire', 'Party'],
      ['pf2-enc', 'swords', 'Encounters'],
      ['pf2-mon', 'dragon', 'Monsters'],
      ['pf2-loot', 'coins', 'Treasures']
    ],
    mm: [
      ['mm-party', 'campfire', 'Party'],
      ['mm-enc', 'swords', 'Encounters'],
      ['mm-foes', 'mask', 'Villains'],
      ['mm-loot', 'coins', 'Rewards']
    ]
  };
  var PF_SK = [
    'Acrobatics',
    'Arcana',
    'Athletics',
    'Crafting',
    'Deception',
    'Diplomacy',
    'Intimidation',
    'Medicine',
    'Nature',
    'Occultism',
    'Performance',
    'Religion',
    'Society',
    'Stealth',
    'Survival',
    'Thievery'
  ];
  // the conditions the DM can put on a character, per game (the names each game's character pages use)
  var CONDS = {
    dnd: [
      'Blinded',
      'Charmed',
      'Deafened',
      'Frightened',
      'Grappled',
      'Incapacitated',
      'Invisible',
      'Paralyzed',
      'Petrified',
      'Poisoned',
      'Prone',
      'Restrained',
      'Stunned',
      'Unconscious'
    ],
    pf2: [
      'Blinded',
      'Clumsy',
      'Concealed',
      'Confused',
      'Controlled',
      'Dazzled',
      'Deafened',
      'Doomed',
      'Drained',
      'Encumbered',
      'Enfeebled',
      'Fascinated',
      'Fatigued',
      'Fleeing',
      'Frightened',
      'Grabbed',
      'Hidden',
      'Immobilized',
      'Invisible',
      'Off-Guard',
      'Paralyzed',
      'Persistent Damage',
      'Petrified',
      'Prone',
      'Quickened',
      'Restrained',
      'Sickened',
      'Slowed',
      'Stunned',
      'Stupefied',
      'Unconscious',
      'Wounded'
    ],
    mm: [
      'Asleep',
      'Blind',
      'Bound',
      'Compelled',
      'Controlled',
      'Dazed',
      'Deaf',
      'Debilitated',
      'Defenseless',
      'Disabled',
      'Entranced',
      'Exhausted',
      'Fatigued',
      'Hindered',
      'Immobile',
      'Impaired',
      'Incapacitated',
      'Paralyzed',
      'Prone',
      'Restrained',
      'Staggered',
      'Stunned',
      'Surprised',
      'Transformed',
      'Unaware',
      'Vulnerable',
      'Weakened'
    ]
  };
  var MM_AB = ['STR', 'STA', 'AGL', 'DEX', 'FGT', 'INT', 'AWE', 'PRE'];
  var MM_SK = [
    'Acrobatics',
    'Athletics',
    'Deception',
    'Insight',
    'Intimidation',
    'Investigation',
    'Perception',
    'Persuasion',
    'Sleight of Hand',
    'Stealth',
    'Technology',
    'Treatment',
    'Vehicles'
  ];
  // what the DM can ask for, per game: [group, [[value, label]]]
  function kinds(game, dndSkills) {
    if (game === 'pf2')
      return [
        [
          'Saving throws',
          ['Fortitude', 'Reflex', 'Will'].map(function (x) {
            return ['save:' + x.toLowerCase(), x + ' save'];
          })
        ],
        ['Perception', [['perception:', 'Perception']]],
        [
          'Skills',
          PF_SK.map(function (x) {
            return ['skill:' + x, x];
          })
        ],
        ['Flat check', [['flat:', 'Flat check (no bonus)']]]
      ];
    if (game === 'mm')
      return [
        [
          'Resistance checks',
          [
            ['def:fort', 'Fortitude'],
            ['def:will', 'Will'],
            ['def:tough', 'Toughness'],
            ['def:dodge', 'Dodge'],
            ['def:parry', 'Parry']
          ]
        ],
        [
          'Skills',
          MM_SK.map(function (x) {
            return ['skill:' + x, x];
          })
        ],
        [
          'Ability checks',
          MM_AB.map(function (a) {
            return ['ab:' + a, a + ' check'];
          })
        ]
      ];
    return [
      [
        'Saving throws',
        AB.map(function (a) {
          return ['save:' + a, a + ' save'];
        })
      ],
      [
        'Skills',
        dndSkills.map(function (x) {
          return ['skill:' + x, x];
        })
      ],
      [
        'Ability checks',
        AB.map(function (a) {
          return ['check:' + a, a + ' check'];
        })
      ]
    ];
  }
  var REFS = {};
  REFS.pf2 = [
    ['Simple DCs', 'Untrained 10 · Trained 15 · Expert 20 · Master 30 · Legendary 40'],
    [
      'Degrees of success',
      'Beat the DC by 10: critical success · miss it by 10: critical failure · a natural 20 is one step better, a natural 1 one step worse'
    ],
    ['Cover', 'Lesser +1 AC · Standard +2 AC, Reflex and Stealth · Greater +4'],
    ['Multiple attack penalty', 'Second attack −5, third and later −10 (agile weapons −4 / −8)'],
    [
      'Dying',
      'At 0 HP: dying 1 (+ wounded value; dying 2 from a critical hit) · recovery check: flat DC 10 + dying value · dying 4: dead'
    ],
    ['Falling', 'Bludgeoning damage equal to half the distance fallen (in feet)']
  ];
  REFS.mm = [
    ['Difficulty', 'Easy 5 · Average 10 · Tough 15 · Challenging 20 · Formidable 25 · Heroic 30 · Superheroic 35'],
    [
      'Damage',
      'Toughness vs DC 15 + rank · fail: bruised (−1 Toughness) · by 2 degrees: dazed · 3: staggered · 4: incapacitated'
    ],
    ['Afflictions', 'Resist DC 10 + rank · each degree of failure: the next condition'],
    ['Degrees', 'Every 5 points over or under the DC is one more degree of success or failure'],
    [
      'Cover and concealment',
      'Partial cover +2 to active defenses, total +5 · partial concealment −2 to attacks, total −5'
    ],
    [
      'Hero points',
      'Reroll (under 11 counts as 10 + the roll), edit a scene, recover, an instant counter · the GM awards one when a complication causes trouble'
    ]
  ];
  var REF = [
    ['Difficulty', 'Very easy 5 · Easy 10 · Medium 15 · Hard 20 · Very hard 25 · Nearly impossible 30'],
    ['Cover', 'Half: +2 AC and Dex saves · Three-quarters: +5 · Total: can’t be targeted directly'],
    ['Light', 'Dim light: disadvantage on Perception by sight · Darkness: effectively blinded'],
    ['Travel', 'Fast 4 mi/h (−5 passive Perception) · Normal 3 mi/h · Slow 2 mi/h (can sneak)'],
    ['Falling', '1d6 bludgeoning per 10 ft, up to 20d6'],
    ['Suffocating', 'Hold breath 1 + Con mod minutes (at least 30 s), then Con mod rounds (at least 1), then 0 HP'],
    [
      'Death saves',
      'DC 10 · 3 successes: stable · 3 failures: dead · 1: two failures · 20: back with 1 HP · damage at 0 HP: a failure (a crit: two)'
    ]
  ];

  root.DMUI = function (api) {
    var esc = api.esc,
      btn = api.btn,
      ui = api.ui,
      store = api.store,
      M = (ui.dmUi = ui.dmUi || { to: {}, askTo: {}, kind: {}, dc: '', text: '', title: '' });
    function K() {
      var g = api.game(),
        ks = kinds(g, api.skills());
      if (!M.kind[g]) M.kind[g] = ks[0][1][0][0];
      return { list: ks, v: M.kind[g] };
    }
    function T() {
      return root.Table;
    }
    function tbl() {
      return store.encTable || null;
    }
    function St() {
      var i = T() && T().hostInfo();
      return (i && i.state) || M.st || null;
    }
    function names(st, to) {
      if (to === 'all') return 'everyone';
      return (to || [])
        .map(function (id) {
          if (id === 'dm') return 'DM';
          var p = st.players.filter(function (x) {
            return x.id === id;
          })[0];
          return p ? p.name : '?';
        })
        .join(', ');
    }
    function picked(sel) {
      var ids = Object.keys(sel).filter(function (k) {
        return sel[k];
      });
      return sel.all || !ids.length ? 'all' : ids;
    }
    function whoPills(st, sel, act) {
      return (
        '<div class="pills">' +
        btn(
          act,
          'Everyone',
          { v: 'all' },
          'pill small' +
            (sel.all ||
            !Object.keys(sel).some(function (k) {
              return sel[k];
            })
              ? ' on'
              : '')
        ) +
        st.players
          .map(function (p) {
            return btn(act, esc(p.name), { v: p.id }, 'pill small' + (sel[p.id] && !sel.all ? ' on' : ''));
          })
          .join('') +
        '</div>'
      );
    }
    function toggle(sel, v) {
      if (v === 'all') {
        Object.keys(sel).forEach(function (k) {
          delete sel[k];
        });
        sel.all = true;
        return;
      }
      delete sel.all;
      sel[v] = !sel[v];
    }
    function dm(what) {
      var t = tbl();
      if (!t) return;
      T()
        .dm(t.code, t.key, what)
        .then(
          function (st) {
            if (st && st.players) M.st = st;
            api.render();
          },
          function (e) {
            M.msg = e.message;
            api.render();
          }
        );
    }

    function tilesHtml() {
      return (
        '<nav class="dm-tiles" aria-label="DM tools">' +
        TOOLS[api.game()]
          .map(function (x, i) {
            return (
              '<button type="button" class="dm-tile hub-item c' +
              i +
              '" data-act="section" data-v="' +
              x[0] +
              '"><span class="hub-dot">' +
              root.Icon(x[1]) +
              '</span><span class="hub-lbl">' +
              x[2] +
              '</span></button>'
            );
          })
          .join('') +
        '</nav>'
      );
    }
    function statusHtml(p) {
      var s = p.status;
      if (!s) return '<span class="small muted">no news yet</span>';
      if (s.txt)
        return (
          '<span class="small">' +
          esc(s.txt) +
          '</span>' +
          (s.conds.length ? '<span class="small bad">' + esc(s.conds.join(', ')) + '</span>' : '')
        );
      var pct = s.max ? Math.max(0, Math.min(100, Math.round((s.hp / s.max) * 100))) : 0;
      return (
        '<span class="dm-hp' +
        (s.hp <= 0 ? ' down' : pct <= 50 ? ' low' : '') +
        '">' +
        s.hp +
        '/' +
        s.max +
        ' HP' +
        (s.temp ? ' +' + s.temp : '') +
        '</span><span class="small">AC ' +
        s.ac +
        '</span>' +
        (s.conc ? '<span class="small">◉ ' + esc(s.conc) + '</span>' : '') +
        (s.conds.length ? '<span class="small bad">' + esc(s.conds.join(', ')) + '</span>' : '')
      );
    }
    function tableHtml() {
      if (!T() || !root.RTCPeerConnection)
        return '<div class="panel"><p class="small muted">This browser can’t hold a table for phones.</p></div>';
      var t = tbl();
      if (!t)
        return (
          '<div class="panel compact-row"><b>📱 Players’ phones</b><span class="small muted">Open the table and the players join from their character’s Session page.</span>' +
          btn('dmOpen', 'Open the table', {}, 'btn small primary') +
          (M.msg ? '<span class="small bad">' + esc(M.msg) + '</span>' : '') +
          '</div>'
        );
      T().watch(
        t.code,
        function (st) {
          if (!st) {
            store.encTable = null;
            M.st = null;
            M.msg = 'The table closed. Open a new one.';
            api.render();
            return;
          }
          M.st = st;
          if (api.isHere()) api.render();
        },
        'dm'
      );
      var st = St() || { players: [] },
        url = location.origin + location.pathname + '#table=' + t.code;
      if (!M.qr || M.qrFor !== url) {
        M.qrFor = url;
        if (root.Transfer)
          root.Transfer.qr(url).then(
            function (u) {
              M.qr = u;
              api.render();
            },
            function () {}
          );
      }
      var h =
        '<div class="panel tbl-panel"><div class="toolbar" style="margin:0"><b>📱 Table <span class="tbl-code">' +
        t.code +
        '</span></b><span class="spacer"></span>' +
        btn('dmQr', M.showQr ? 'Hide the QR code' : 'QR code', {}, 'btn small') +
        btn('dmClose', 'Close the table', {}, 'btn small') +
        '</div>';
      if (M.showQr || !st.players.length)
        h +=
          '<div class="tbl-join">' +
          (M.qr ? '<img class="xfer-qr tbl-qr" src="' + M.qr + '" alt="QR code to join the table">' : '') +
          '<div class="small">Players scan this, or open their character’s <b>Session</b> page and type <b>' +
          t.code +
          '</b>. Keep the app open on this device while you play.</div></div>';
      if (st.players.length)
        h +=
          '<div class="toolbar">' +
          btn('dmInit', st.open ? 'Ask for initiative again' : 'Ask for initiative', {}, 'btn small') +
          (st.players.some(function (p) {
            return p.init != null;
          })
            ? '<span class="small">Order: ' +
              esc(
                st.players
                  .filter(function (p) {
                    return p.init != null;
                  })
                  .sort(function (a, b) {
                    return b.init - a.init;
                  })
                  .map(function (p) {
                    return p.name + ' ' + p.init;
                  })
                  .join(' · ')
              ) +
              '</span>'
            : '') +
          '</div>';
      h += st.players.length
        ? '<ul class="dm-players">' +
          st.players
            .map(function (p) {
              return (
                '<li><b>' +
                esc(p.name) +
                '</b>' +
                statusHtml(p) +
                (p.init != null ? '<span class="small">init <b>' + p.init + '</b></span>' : '') +
                '<span class="spacer"></span>' +
                btn('tblKick', '✕', { v: p.id }, 'btn tiny') +
                '</li>'
              );
            })
            .join('') +
          '</ul>'
        : '<p class="small muted">Nobody has joined yet.</p>';
      return h + (M.msg ? '<p class="small bad">' + esc(M.msg) + '</p>' : '') + '</div>';
    }
    function msgsHtml(st) {
      var list = (st.msgs || []).slice(-30);
      return (
        '<div class="panel"><div class="toolbar" style="margin:0"><h3 style="margin:0">Messages</h3><span class="spacer"></span>' +
        (list.length ? btn('dmMsgClear', 'Clear', {}, 'btn tiny') : '') +
        '</div>' +
        (list.length
          ? '<ul class="dm-msgs">' +
            list
              .map(function (m) {
                var mine = m.from === 'dm';
                return (
                  '<li class="' +
                  (mine ? 'out' : 'in') +
                  '"><span class="small muted">' +
                  (mine ? 'To ' + esc(names(st, m.to)) : 'From ' + esc(m.fromName)) +
                  '</span><div>' +
                  esc(m.text).replace(/\n/g, '<br>') +
                  '</div></li>'
                );
              })
              .join('') +
            '</ul>'
          : '<p class="small muted">Private notes to one player (“you notice the innkeeper is lying”), or to everyone. Their replies show up here.</p>') +
        '<span class="small">To:</span>' +
        whoPills(st, M.to, 'dmTo') +
        '<div class="toolbar"><textarea id="dm-text" data-dm="text" rows="2" placeholder="Write a message…" style="flex:1;min-width:12rem">' +
        esc(M.text) +
        '</textarea>' +
        btn('dmSend', 'Send', {}, 'btn primary') +
        '</div></div>'
      );
    }
    function kindLabel(k) {
      var l = '';
      K().list.forEach(function (g) {
        g[1].forEach(function (x) {
          if (x[0] === k) l = x[1];
        });
      });
      return l || k;
    }
    function asksHtml(st) {
      var k = K(),
        o = function (v, t) {
          return '<option value="' + esc(v) + '"' + (k.v === v ? ' selected' : '') + '>' + esc(t) + '</option>';
        };
      var h =
        '<div class="panel"><h3>Ask for a roll</h3><div class="toolbar"><select data-dm="kind" aria-label="What to roll">' +
        k.list
          .map(function (g) {
            return (
              '<optgroup label="' +
              esc(g[0]) +
              '">' +
              g[1]
                .map(function (x) {
                  return o(x[0], x[1]);
                })
                .join('') +
              '</optgroup>'
            );
          })
          .join('') +
        '</select>' +
        '<input type="number" id="dm-dc" data-dm="dc" value="' +
        esc(M.dc) +
        '" placeholder="DC" style="width:4.5rem" aria-label="DC (optional)">' +
        '<label class="small"><input type="checkbox" data-dm="secret"' +
        (M.secret ? ' checked' : '') +
        '> hide the DC</label></div>' +
        '<span class="small">Who rolls:</span>' +
        whoPills(st, M.askTo, 'dmAskTo') +
        '<div class="toolbar">' +
        btn('dmAsk', 'Ask', {}, 'btn primary') +
        '</div>';
      (st.asks || [])
        .slice()
        .reverse()
        .forEach(function (a) {
          var who =
            a.to === 'all'
              ? st.players.map(function (p) {
                  return p.id;
                })
              : a.to;
          h +=
            '<div class="dm-ask"><div class="toolbar" style="margin:0"><b>' +
            esc(a.label) +
            '</b>' +
            (a.dc ? '<span class="small">DC ' + a.dc + (a.secret ? ' (hidden)' : '') + '</span>' : '') +
            '<span class="spacer"></span>' +
            btn('dmAskDrop', '✕', { v: a.rid }, 'btn tiny') +
            '</div><ul class="dm-ans">' +
            who
              .map(function (id) {
                var p = st.players.filter(function (x) {
                    return x.id === id;
                  })[0],
                  r = a.ans[id];
                if (!p) return '';
                return (
                  '<li>' +
                  esc(p.name) +
                  ': ' +
                  (r
                    ? '<b>' +
                      r.total +
                      '</b>' +
                      (r.roll ? ' <span class="small muted">(d20 ' + r.roll + ')</span>' : '') +
                      (r.ok == null ? '' : r.ok ? ' <span class="good">✓</span>' : ' <span class="bad">✗</span>')
                    : '<span class="muted">waiting…</span>') +
                  '</li>'
                );
              })
              .join('') +
            '</ul></div>';
        });
      return h + '</div>';
    }
    function handoutsHtml(st) {
      var h =
        '<div class="panel"><h3>Handouts</h3><p class="small muted">A map, a letter, a portrait: pick a picture and it appears on the chosen players’ phones.</p>' +
        '<div class="toolbar"><input type="text" id="dm-title" data-dm="title" value="' +
        esc(M.title) +
        '" placeholder="Title (optional)" style="flex:1;min-width:10rem"><label class="btn">🖼 Pick a picture…<input type="file" id="dmHandoutFile" accept="image/*" hidden></label></div>' +
        '<textarea id="dm-hotext" data-dm="hoText" rows="2" placeholder="Text to go with it (optional; or send text alone)">' +
        esc(M.hoText || '') +
        '</textarea>' +
        '<span class="small">For:</span>' +
        whoPills(st, (M.hoTo = M.hoTo || {}), 'dmHoTo') +
        '<div class="toolbar">' +
        btn('dmHoText', 'Send the text only', {}, 'btn small') +
        '</div>' +
        (M.hoBusy ? '<p class="small muted">Sending…</p>' : '');
      var list = (st.handouts || []).slice().reverse();
      if (list.length)
        h +=
          '<div class="dm-handouts">' +
          list
            .map(function (x) {
              var img = T().handoutImg(x.hid);
              return (
                '<figure>' +
                (img ? '<img src="' + img + '" alt="' + esc(x.title || 'Handout') + '">' : '') +
                '<figcaption><b>' +
                esc(x.title || 'Handout') +
                '</b> <span class="small muted">for ' +
                esc(names(st, x.to)) +
                '</span> ' +
                btn('dmHoDrop', '✕', { v: x.hid }, 'btn tiny') +
                '</figcaption></figure>'
              );
            })
            .join('') +
          '</div>';
      return h + '</div>';
    }
    function refHtml() {
      return (
        '<details class="panel dm-ref"><summary><b>Quick reference</b></summary><dl>' +
        (REFS[api.game()] || REF)
          .map(function (r) {
            return '<dt>' + r[0] + '</dt><dd>' + esc(r[1]) + '</dd>';
          })
          .join('') +
        '</dl></details>'
      );
    }

    // ---------- acting on the players' characters: damage, healing, conditions, inspiration, rests, XP ----------
    function fxHtml(st) {
      var g = api.game(),
        conds = CONDS[g] || [],
        to = (M.fxTo = M.fxTo || {});
      return (
        '<div class="panel dm-fx"><h3>On their characters</h3><p class="small muted">Changes land on the players’ phones at once.</p>' +
        '<span class="small">Who:</span>' +
        whoPills(st, to, 'dmFxTo') +
        '<div class="toolbar"><input type="number" min="0" id="dm-amt" data-dm="amt" value="' +
        esc(M.amt || '') +
        '" placeholder="' +
        (g === 'mm' ? 'rank' : 'amount') +
        '" style="width:5.5rem">' +
        btn('dmFx', g === 'mm' ? '💥 Hit (damage rank)' : '💥 Damage', { v: 'dmg' }, 'btn small') +
        btn('dmFx', g === 'mm' ? '❤ Recover' : '❤ Heal', { v: 'heal' }, 'btn small') +
        '</div><div class="toolbar"><select data-dm="cond" aria-label="Condition">' +
        conds
          .map(function (c) {
            return '<option' + (M.cond === c ? ' selected' : '') + '>' + esc(c) + '</option>';
          })
          .join('') +
        '</select>' +
        btn('dmFx', 'Add', { v: 'condOn' }, 'btn small') +
        btn('dmFx', 'Remove', { v: 'condOff' }, 'btn small') +
        '</div><div class="toolbar">' +
        btn('dmFx', g === 'dnd' ? '✨ Inspiration' : '✨ Hero point', { v: 'insp' }, 'btn small') +
        (g === 'dnd'
          ? btn('dmFx', '☾ Short rest', { v: 'rest:short' }, 'btn small') +
            btn('dmFx', '☀ Long rest', { v: 'rest:long' }, 'btn small')
          : g === 'pf2'
            ? btn('dmFx', '☾ Rest for the night', { v: 'rest:long' }, 'btn small')
            : '') +
        '</div><div class="toolbar"><input type="number" min="0" id="dm-xp" data-dm="xp" value="' +
        esc(M.xp || '') +
        '" placeholder="' +
        (g === 'mm' ? 'points' : 'XP') +
        '" style="width:5.5rem">' +
        btn('dmFx', g === 'mm' ? 'Give power points' : 'Give XP', { v: 'xp' }, 'btn small') +
        (g === 'mm' ? '' : btn('dmFx', '🎉 Level up (milestone)', { v: 'level' }, 'btn small')) +
        (M.fxMsg ? '<span class="small rest-msg">' + esc(M.fxMsg) + '</span>' : '') +
        '</div></div>'
      );
    }
    // ---------- rolls: what the players roll in the app, and the DM's secret rolls for them ----------
    function rollsHtml(st) {
      var log = (st.log || []).slice(-25).reverse(),
        keys = {};
      st.players.forEach(function (p) {
        Object.keys((p.status && p.status.bon) || {}).forEach(function (k) {
          keys[k] = 1;
        });
      });
      var list = Object.keys(keys).sort(function (a, b) {
        return /^Passive|^Perception/.test(b) - /^Passive|^Perception/.test(a) || (a < b ? -1 : 1);
      });
      if (!M.sec || !keys[M.sec]) M.sec = list[0] || '';
      return (
        '<div class="panel"><h3>Secret roll</h3><p class="small muted">Roll for the players without them knowing: noticing a trap, seeing through a lie. Only you see the results.</p>' +
        (list.length
          ? '<div class="toolbar"><select data-dm="sec" aria-label="What to roll">' +
            list
              .map(function (k) {
                return '<option' + (M.sec === k ? ' selected' : '') + '>' + esc(k) + '</option>';
              })
              .join('') +
            '</select>' +
            btn('dmSecret', '🎲 Roll secretly', {}, 'btn small primary') +
            '</div><span class="small">For:</span>' +
            whoPills(st, (M.secTo = M.secTo || {}), 'dmSecTo') +
            (M.secRes
              ? '<ul class="dm-ans">' +
                M.secRes
                  .map(function (r) {
                    return (
                      '<li>' +
                      esc(r.n) +
                      ': <b>' +
                      r.total +
                      '</b> <span class="small muted">' +
                      (r.passive ? 'passive' : 'd20 ' + r.roll + ' ' + (r.b >= 0 ? '+' : '') + r.b) +
                      '</span></li>'
                    );
                  })
                  .join('') +
                '</ul><p class="small muted">' +
                esc(M.secLabel) +
                '</p>'
              : '')
          : '<p class="small muted">The players’ bonuses arrive once their phones have joined.</p>') +
        '</div><div class="panel"><div class="toolbar" style="margin:0"><h3 style="margin:0">Table rolls</h3><span class="spacer"></span>' +
        (log.length ? btn('dmLogClear', 'Clear', {}, 'btn tiny') : '') +
        '</div>' +
        (log.length
          ? '<ul class="tbl-log">' +
            log
              .map(function (r) {
                return (
                  '<li><span class="small muted">' +
                  clock(r.at) +
                  '</span> <b>' +
                  esc(r.name) +
                  '</b> ' +
                  esc(r.label) +
                  ': <b>' +
                  r.total +
                  '</b> <span class="small muted">' +
                  esc(r.detail) +
                  (r.dmOnly ? ' · only you' : '') +
                  '</span></li>'
                );
              })
              .join('') +
            '</ul>'
          : '<p class="small muted">Rolls the players make with the app’s dice show up here (each player chooses: everyone, only you, or not shared).</p>') +
        '</div>'
      );
    }
    function clock(t) {
      var d = new Date(t);
      return ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2);
    }
    // ---------- notes shared with the DM, and the DM's notes to the players ----------
    function notesHtml(st) {
      var got = (st.notes || []).filter(function (n) {
          return n.from !== 'dm';
        }),
        sent = (st.notes || []).filter(function (n) {
          return n.from === 'dm';
        });
      return (
        '<div class="panel"><h3>Shared notes</h3>' +
        (got.length
          ? got
              .slice()
              .reverse()
              .map(function (n) {
                return (
                  '<div class="tbl-note"><b>' +
                  esc(n.title || 'A note') +
                  '</b> <span class="small muted">from ' +
                  esc(n.fromName) +
                  (n.to === 'all' ? ', to everyone' : '') +
                  '</span><div class="small">' +
                  esc(n.text).replace(/\n/g, '<br>') +
                  '</div></div>'
                );
              })
              .join('')
          : '<p class="small muted">Notes the players share with you (or with everyone) show up here.</p>') +
        '<div class="tbl-note-new"><b class="small">Share a note with the players</b><input type="text" id="dm-ntitle" data-dm="ntitle" value="' +
        esc(M.ntitle || '') +
        '" placeholder="Title"><textarea id="dm-ntext" data-dm="ntext" rows="3" placeholder="A clue, a map description, a letter they found… They can save it to their notes.">' +
        esc(M.ntext || '') +
        '</textarea><span class="small">For:</span>' +
        whoPills(st, (M.nTo = M.nTo || {}), 'dmNTo') +
        '<div class="toolbar">' +
        btn('dmNote', 'Share', {}, 'btn small primary') +
        '</div></div>' +
        (sent.length
          ? '<p class="small muted">You shared: ' +
            sent
              .map(function (n) {
                return esc(n.title || 'a note') + ' ' + btn('dmNoteDrop', '✕', { v: n.nid }, 'btn tiny');
              })
              .join(' · ') +
            '</p>'
          : '') +
        '</div>'
      );
    }
    // ---------- story: the people and quests the players know about, and the session log and recap ----------
    function lore() {
      var L = (store.dmLore = store.dmLore || {});
      return (L[api.game()] = L[api.game()] || []);
    }
    function revealed() {
      return lore().reduce(function (out, l) {
        if (l.shown) out.push({ lid: l.lid, kind: l.kind, name: l.name, text: l.text, done: l.done, pic: l.pic });
        return out;
      }, []);
    }
    function pushLore(st) {
      var want = JSON.stringify(revealed());
      if (st && JSON.stringify(st.lore || []) !== want && M.loreSent !== want) {
        M.loreSent = want;
        dm({ lore: JSON.parse(want) });
      }
    }
    function loreHtml() {
      var L = lore(),
        E = M.loreEdit,
        row = function (l) {
          if (E === l.lid)
            return (
              '<div class="dm-lore editing"><input type="text" id="dm-l-name" data-dml="name" value="' +
              esc(l.name) +
              '" placeholder="Name"><textarea id="dm-l-text" data-dml="text" rows="2" placeholder="What the players know (they see this)">' +
              esc(l.text || '') +
              '</textarea><textarea id="dm-l-secret" data-dml="secret" rows="2" placeholder="Your private notes (only you see these)">' +
              esc(l.secret || '') +
              '</textarea><div class="toolbar">' +
              (l.kind === 'npc'
                ? '<label class="btn small">🖼 ' +
                  (l.pic ? 'Change' : 'Add') +
                  ' a portrait<input type="file" id="dmLorePic" accept="image/*" hidden></label>'
                : '') +
              btn('dmLoreDone', 'Done', {}, 'btn small primary') +
              btn('dmLoreRm', 'Delete', { v: l.lid }, 'btn small danger') +
              '</div></div>'
            );
          return (
            '<div class="dm-lore' +
            (l.shown ? ' shown' : '') +
            '">' +
            (l.pic ? '<img src="' + l.pic + '" alt="">' : '') +
            '<div class="dm-lore-what"><b>' +
            esc(l.name || 'Unnamed') +
            '</b>' +
            (l.done ? ' <span class="small good">✓ done</span>' : '') +
            (l.text ? '<div class="small">' + esc(l.text) + '</div>' : '') +
            (l.secret ? '<div class="small muted">🔒 ' + esc(l.secret) + '</div>' : '') +
            '</div><div class="se-btns">' +
            btn(
              'dmLoreShow',
              l.shown ? '👁 Shown' : 'Hidden',
              { v: l.lid },
              'btn small' + (l.shown ? ' primary' : '')
            ) +
            (l.kind === 'quest' ? btn('dmLoreDoneQ', l.done ? 'Not done' : 'Done ✓', { v: l.lid }, 'btn small') : '') +
            btn('dmLoreEdit', 'Edit', { v: l.lid }, 'btn small') +
            '</div></div>'
          );
        };
      var npcs = L.filter(function (l) {
          return l.kind === 'npc';
        }),
        quests = L.filter(function (l) {
          return l.kind === 'quest';
        });
      return (
        '<div class="panel"><h3>People and quests</h3><p class="small muted">Keep your NPCs and quests here. Tap <b>Hidden</b> to show one to the players: they see the name, what they know and the portrait, never your private notes.</p>' +
        '<h4>Quests</h4>' +
        (quests.map(row).join('') || '<p class="small muted">None yet.</p>') +
        btn('dmLoreAdd', '+ Quest', { v: 'quest' }, 'btn small') +
        '<h4>People</h4>' +
        (npcs.map(row).join('') || '<p class="small muted">None yet.</p>') +
        btn('dmLoreAdd', '+ Person', { v: 'npc' }, 'btn small') +
        '</div>'
      );
    }
    function sessionHtml(st) {
      var ev = st.events || [];
      return (
        '<div class="panel"><h3>Session log</h3><p class="small muted">Kept as you play: who joined, fights, loot, roll-offs.</p>' +
        (ev.length
          ? '<ul class="dm-events">' +
            ev
              .slice(-40)
              .reverse()
              .map(function (e) {
                return '<li><span class="small muted">' + clock(e.at) + '</span> ' + esc(e.text) + '</li>';
              })
              .join('') +
            '</ul>'
          : '') +
        '<h4>Recap</h4><textarea id="dm-recap" data-dm="recap" rows="5" placeholder="What happened tonight. It goes into every player’s notes.">' +
        esc(M.recap || '') +
        '</textarea><div class="toolbar">' +
        btn('dmRecapFill', 'Start from the log', {}, 'btn small') +
        btn('dmRecap', 'Send to everyone’s notes', {}, 'btn small primary') +
        btn('dmNewSession', 'New session (clear the log)', {}, 'btn small') +
        '</div>' +
        (M.recapMsg ? '<p class="small rest-msg">' + esc(M.recapMsg) + '</p>' : '') +
        '</div>'
      );
    }
    var TABS = [
      ['table', 'Table'],
      ['talk', 'Messages and notes'],
      ['rolls', 'Rolls'],
      ['story', 'Story']
    ];
    function html() {
      var st = St(),
        on = tbl() && st,
        tab = M.tab || 'table';
      if (on) pushLore(st);
      var body = '';
      if (on && st.players.length) {
        if (tab === 'table') body = fxHtml(st) + asksHtml(st);
        else if (tab === 'talk') body = msgsHtml(st) + notesHtml(st) + handoutsHtml(st);
        else if (tab === 'rolls') body = rollsHtml(st);
      } else if (tab !== 'story')
        body = on
          ? '<p class="small muted">Once players join you can act on their characters, message them, send handouts and ask for rolls here.</p>'
          : '';
      if (tab === 'story') body = loreHtml() + (on ? sessionHtml(st) : '');
      return (
        '<main class="home dm-page"><h2>' +
        (api.game() === 'dnd' ? 'DM' : 'GM') +
        '</h2>' +
        tilesHtml() +
        tableHtml() +
        '<nav class="mm-tabs dm-tabs">' +
        TABS.map(function (t) {
          return btn('dmTab', t[1], { v: t[0] }, 'mm-tab' + (tab === t[0] ? ' on' : ''));
        }).join('') +
        '</nav>' +
        body +
        refHtml() +
        '</main>'
      );
    }
    // a picture, shrunk so it travels quickly to the phones
    function shrink(file, size) {
      return new Promise(function (ok, no) {
        var fr = new FileReader();
        fr.onload = function () {
          var im = new Image();
          im.onload = function () {
            var k = Math.min(1, (size || 1280) / Math.max(im.width, im.height)),
              c = document.createElement('canvas');
            c.width = Math.round(im.width * k);
            c.height = Math.round(im.height * k);
            c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
            ok(c.toDataURL('image/jpeg', size ? 0.7 : 0.8));
          };
          im.onerror = function () {
            no(new Error('That file isn’t a picture this browser can read.'));
          };
          im.src = fr.result;
        };
        fr.onerror = function () {
          no(fr.error);
        };
        fr.readAsDataURL(file);
      });
    }
    function targets(st, sel) {
      var p = picked(sel);
      return p === 'all'
        ? st.players
        : st.players.filter(function (x) {
            return p.indexOf(x.id) >= 0;
          });
    }
    var actions = {
      dmShow: function (v, el) {
        root.DMUI.show(el.getAttribute('data-t'), el.getAttribute('data-x'));
        M.shown = el.getAttribute('data-t');
        el.textContent = '📱 Shown';
        return false;
      },
      dmTab: function (v) {
        M.tab = v;
      },
      dmOpen: function () {
        M.msg = '';
        T()
          .create()
          .then(
            function (j) {
              store.encTable = { code: j.code, key: j.key };
              M.st = null;
              M.showQr = true;
              M.loreSent = '';
              api.save();
              api.render();
            },
            function (e) {
              M.msg = e.message;
              api.render();
            }
          );
        return false;
      },
      dmClose: function () {
        var t = tbl();
        if (t)
          T()
            .dm(t.code, t.key, { close: true })
            .catch(function () {});
        store.encTable = null;
        M.st = null;
        api.save();
      },
      dmQr: function () {
        M.showQr = !M.showQr;
      },
      dmTo: function (v) {
        toggle(M.to, v);
      },
      dmAskTo: function (v) {
        toggle(M.askTo, v);
      },
      dmHoTo: function (v) {
        toggle(M.hoTo, v);
      },
      dmFxTo: function (v) {
        toggle(M.fxTo, v);
      },
      dmSecTo: function (v) {
        toggle(M.secTo, v);
      },
      dmNTo: function (v) {
        toggle(M.nTo, v);
      },
      dmSend: function () {
        var el = document.getElementById('dm-text'),
          tx = (el ? el.value : M.text).trim();
        if (!tx) return false;
        dm({ msg: { to: picked(M.to), text: tx } });
        M.text = '';
      },
      dmMsgClear: function () {
        dm({ clearMsgs: true });
        return false;
      },
      dmInit: function () {
        dm({ open: true, reset: true });
        return false;
      },
      dmAsk: function () {
        var kv = K().v,
          p = kv.split(':');
        dm({
          ask: { kind: p[0], key: p[1], label: kindLabel(kv), dc: +M.dc || 0, secret: !!M.secret, to: picked(M.askTo) },
          event: 'Asked for ' + kindLabel(kv) + (M.dc ? ' (DC ' + M.dc + ')' : '') + '.'
        });
        return false;
      },
      dmAskDrop: function (v) {
        dm({ askDrop: v });
        return false;
      },
      dmHoText: function () {
        var el = document.getElementById('dm-hotext'),
          tx = String((el ? el.value : M.hoText) || '').trim();
        if (!tx) return false;
        dm({ handout: { img: '', title: M.title, text: tx, to: picked(M.hoTo || {}) } });
        M.title = M.hoText = '';
      },
      dmHoDrop: function (v) {
        dm({ handoutDrop: v });
        return false;
      },
      // damage, healing, a condition, inspiration, a rest, XP or a level-up, for the chosen players
      dmFx: function (v) {
        var st = St(),
          who = targets(st, M.fxTo || {}),
          g = api.game(),
          ids = who.map(function (p) {
            return p.id;
          }),
          names = who
            .map(function (p) {
              return p.name;
            })
            .join(', '),
          amt = Math.abs(Math.round(+M.amt || 0)),
          xp = Math.abs(Math.round(+M.xp || 0)),
          fx,
          ev;
        if (!ids.length) return;
        if (v === 'dmg' || v === 'heal') {
          if (!amt && !(g === 'mm' && v === 'heal')) {
            M.fxMsg = 'Type the amount first.';
            return;
          }
          fx = { k: v, n: amt };
          ev =
            v === 'dmg'
              ? names + (g === 'mm' ? ' took a hit, rank ' + amt : ' took ' + amt + ' damage')
              : names + (g === 'mm' ? ' recovered' : ' healed ' + amt);
        } else if (v === 'condOn' || v === 'condOff') {
          var c = CONDS[g].indexOf(M.cond) >= 0 ? M.cond : CONDS[g][0];
          fx = { k: 'cond', c: c, on: v === 'condOn' };
          ev = names + (v === 'condOn' ? ' became ' : ' is no longer ') + c.toLowerCase();
        } else if (v === 'insp') {
          fx = { k: 'insp' };
          ev = names + (g === 'dnd' ? ' got inspiration' : ' got a hero point');
        } else if (/^rest:/.test(v)) {
          fx = { k: 'rest', c: v.slice(5) };
          ev = 'The ' + (v === 'rest:short' ? 'party took a short rest' : 'party rested');
        } else if (v === 'xp') {
          if (!xp) {
            M.fxMsg = 'Type the ' + (g === 'mm' ? 'points' : 'XP') + ' first.';
            return;
          }
          fx = { k: 'xp', n: xp };
          ev = names + ' earned ' + xp + (g === 'mm' ? ' power point' + (xp === 1 ? '' : 's') : ' XP');
        } else if (v === 'level') {
          fx = { k: 'level' };
          ev = names + ' levelled up';
        }
        fx.to = ids;
        dm({ fx: fx, event: ev + '.' });
        M.fxMsg = ev + '.';
        M.amt = '';
        return false;
      },
      dmSecret: function () {
        var st = St(),
          k = M.sec,
          passive = /^Passive/.test(k);
        M.secLabel = k + ', rolled ' + clock(Date.now());
        M.secRes = targets(st, M.secTo || {}).reduce(function (out, p) {
          if (!(p.status && p.status.bon && p.status.bon[k] != null)) return out;
          var b = p.status.bon[k],
            r = 1 + Math.floor(Math.random() * 20);
          out.push({ n: p.name, b: b, roll: r, total: passive ? b : r + b, passive: passive });
          return out;
        }, []);
      },
      dmLogClear: function () {
        dm({ clearLog: true });
        return false;
      },
      dmNote: function () {
        var ti = (document.getElementById('dm-ntitle') || {}).value || M.ntitle || '',
          tx = (document.getElementById('dm-ntext') || {}).value || M.ntext || '';
        if (!String(ti + tx).trim()) return false;
        dm({ note: { to: picked(M.nTo || {}), title: ti, text: tx } });
        M.ntitle = M.ntext = '';
      },
      dmNoteDrop: function (v) {
        dm({ noteDrop: v });
        return false;
      },
      dmLoreAdd: function (v) {
        var l = {
          lid: 'l' + Date.now().toString(36),
          kind: v,
          name: '',
          text: '',
          secret: '',
          shown: false,
          done: false,
          pic: ''
        };
        lore().push(l);
        M.loreEdit = l.lid;
        api.save();
      },
      dmLoreEdit: function (v) {
        M.loreEdit = v;
      },
      dmLoreDone: function () {
        M.loreEdit = '';
        M.loreSent = '';
        api.save();
      },
      dmLoreRm: function (v) {
        var L = lore();
        L.splice(
          L.map(function (l) {
            return l.lid;
          }).indexOf(v),
          1
        );
        M.loreEdit = '';
        api.save();
      },
      dmLoreShow: function (v) {
        lore().forEach(function (l) {
          if (l.lid === v) l.shown = !l.shown;
        });
        api.save();
      },
      dmLoreDoneQ: function (v) {
        lore().forEach(function (l) {
          if (l.lid === v) l.done = !l.done;
        });
        api.save();
      },
      dmRecapFill: function () {
        var ev = (St() || {}).events || [];
        M.recap = ev
          .reduce(function (out, e) {
            if (!/joined the table|table opened|new session/i.test(e.text)) out.push('- ' + e.text);
            return out;
          }, [])
          .join('\n');
      },
      dmRecap: function () {
        var el = document.getElementById('dm-recap'),
          tx = String((el ? el.value : M.recap) || '').trim();
        if (!tx) {
          M.recapMsg = 'Write the recap first.';
          return;
        }
        dm({
          note: { to: 'all', title: 'Session recap, ' + new Date().toLocaleDateString(), text: tx, recap: true },
          event: 'Recap sent to the players.'
        });
        M.recapMsg = 'Sent: it is now in every player’s notes.';
        M.recap = '';
      },
      dmNewSession: function () {
        dm({ clearEvents: true, clearLog: true });
        M.recapMsg = '';
        return false;
      }
    };
    function onInput(t) {
      var k = t.getAttribute('data-dm'),
        l = t.getAttribute('data-dml');
      if (l) {
        lore().forEach(function (x) {
          if (x.lid === M.loreEdit) x[l] = t.value;
        });
        api.save();
        return 'keep';
      }
      if (!k || k === 'kind' || k === 'secret' || k === 'cond' || k === 'sec') return null;
      M[k] = t.value;
      return 'keep';
    }
    function onChange(t) {
      if (t.id === 'dmHandoutFile' || t.id === 'dmLorePic') {
        var f = t.files && t.files[0],
          pic = t.id === 'dmLorePic';
        t.value = '';
        if (!f) return 'render';
        M.hoBusy = !pic;
        shrink(f, pic ? 160 : 0).then(
          function (img) {
            M.hoBusy = false;
            if (pic) {
              lore().forEach(function (x) {
                if (x.lid === M.loreEdit) x.pic = img;
              });
              api.save();
              api.render();
            } else {
              dm({ handout: { img: img, title: M.title, text: M.hoText || '', to: picked(M.hoTo) } });
              M.title = M.hoText = '';
            }
          },
          function (e) {
            M.hoBusy = false;
            M.msg = e.message;
            api.render();
          }
        );
        return 'render';
      }
      if (t.getAttribute('data-dml')) return 'keep';
      var k = t.getAttribute('data-dm');
      if (!k) return null;
      if (k === 'secret') M.secret = t.checked;
      else if (k === 'kind') M.kind[api.game()] = t.value;
      else M[k] = t.value;
      return k === 'kind' || k === 'secret' || k === 'sec' ? 'render' : 'keep';
    }
    return { html: html, actions: actions, onInput: onInput, onChange: onChange };
  };
  // "Show to the table" from anywhere (a monster, an item, a villain): a handout for every player
  root.DMUI.show = function (title, text, img) {
    var T = root.Table,
      h = T && T.hostInfo && T.hostInfo();
    if (!h || !h.state.players.length) return false;
    T.dm(h.code, h.key, {
      handout: { title: title, text: text, img: img || '', to: 'all' },
      event: 'Showed the players: ' + title + '.'
    }).catch(function () {});
    return true;
  };
  // the button that does it, shown only to a DM whose table has players
  root.DMUI.button = function (title, text) {
    if (!root.DMUI.ready()) return '';
    var e = function (s) {
      return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
      });
    };
    return (
      '<button type="button" class="btn tiny dm-show noprint" data-act="dmShow" data-t="' +
      e(title) +
      '" data-x="' +
      e(String(text || '').slice(0, 5000)) +
      '" title="Show the players (name and description, not the numbers)">📱 Show the players</button>'
    );
  };
  root.DMUI.ready = function () {
    var T = root.Table,
      h = T && T.hostInfo && T.hostInfo();
    return !!(h && h.state.players.length);
  };
})(typeof window !== 'undefined' ? window : globalThis);
