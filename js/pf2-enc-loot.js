// Pathfinder 2e DM tools: treasure by level, and the Treasures page.
// Part of pf2-enc.js: it runs inside PF2Enc; K holds the names the files share.
(function (root) {
  'use strict';
  (root.PF2EncParts = root.PF2EncParts || {}).loot = function (K) {
    var G = K.G,
      api = K.api,
      btn = K.btn,
      curParty = K.curParty,
      esc = K.esc,
      md = K.md,
      partyLevel = K.partyLevel,
      store = K.store,
      traits = K.traits;

    // ---------- treasure: Party Treasure by Level (Core Rulebook, table 10-9) ----------
    // [total gp, permanent items [[level, count]], consumables [[level, count]], party currency gp, currency per extra character]
    var TBL = [
      null,
      [
        175,
        [
          [2, 2],
          [1, 2]
        ],
        [
          [2, 2],
          [1, 3]
        ],
        40,
        10
      ],
      [
        300,
        [
          [3, 2],
          [2, 2]
        ],
        [
          [3, 2],
          [2, 2],
          [1, 2]
        ],
        70,
        18
      ],
      [
        500,
        [
          [4, 2],
          [3, 2]
        ],
        [
          [4, 2],
          [3, 2],
          [2, 2]
        ],
        120,
        30
      ],
      [
        850,
        [
          [5, 2],
          [4, 2]
        ],
        [
          [5, 2],
          [4, 2],
          [3, 2]
        ],
        200,
        50
      ],
      [
        1350,
        [
          [6, 2],
          [5, 2]
        ],
        [
          [6, 2],
          [5, 2],
          [4, 2]
        ],
        320,
        80
      ],
      [
        2000,
        [
          [7, 2],
          [6, 2]
        ],
        [
          [7, 2],
          [6, 2],
          [5, 2]
        ],
        500,
        125
      ],
      [
        2900,
        [
          [8, 2],
          [7, 2]
        ],
        [
          [8, 2],
          [7, 2],
          [6, 2]
        ],
        720,
        180
      ],
      [
        4000,
        [
          [9, 2],
          [8, 2]
        ],
        [
          [9, 2],
          [8, 2],
          [7, 2]
        ],
        1000,
        250
      ],
      [
        5700,
        [
          [10, 2],
          [9, 2]
        ],
        [
          [10, 2],
          [9, 2],
          [8, 2]
        ],
        1400,
        350
      ],
      [
        8000,
        [
          [11, 2],
          [10, 2]
        ],
        [
          [11, 2],
          [10, 2],
          [9, 2]
        ],
        2000,
        500
      ],
      [
        11500,
        [
          [12, 2],
          [11, 2]
        ],
        [
          [12, 2],
          [11, 2],
          [10, 2]
        ],
        2800,
        700
      ],
      [
        16500,
        [
          [13, 2],
          [12, 2]
        ],
        [
          [13, 2],
          [12, 2],
          [11, 2]
        ],
        4000,
        1000
      ],
      [
        25000,
        [
          [14, 2],
          [13, 2]
        ],
        [
          [14, 2],
          [13, 2],
          [12, 2]
        ],
        6000,
        1500
      ],
      [
        36500,
        [
          [15, 2],
          [14, 2]
        ],
        [
          [15, 2],
          [14, 2],
          [13, 2]
        ],
        9000,
        2250
      ],
      [
        54500,
        [
          [16, 2],
          [15, 2]
        ],
        [
          [16, 2],
          [15, 2],
          [14, 2]
        ],
        13000,
        3250
      ],
      [
        82500,
        [
          [17, 2],
          [16, 2]
        ],
        [
          [17, 2],
          [16, 2],
          [15, 2]
        ],
        20000,
        5000
      ],
      [
        128000,
        [
          [18, 2],
          [17, 2]
        ],
        [
          [18, 2],
          [17, 2],
          [16, 2]
        ],
        30000,
        7500
      ],
      [
        208000,
        [
          [19, 2],
          [18, 2]
        ],
        [
          [19, 2],
          [18, 2],
          [17, 2]
        ],
        48000,
        12000
      ],
      [
        355000,
        [
          [20, 2],
          [19, 2]
        ],
        [
          [20, 2],
          [19, 2],
          [18, 2]
        ],
        80000,
        20000
      ],
      [
        490000,
        [[20, 4]],
        [
          [20, 4],
          [19, 2]
        ],
        140000,
        35000
      ]
    ];
    var MAGICT =
      /^(magical|alchemical|arcane|divine|occult|primal|abjuration|conjuration|divination|enchantment|evocation|illusion|necromancy|transmutation|invested|gadget|tech)$/;
    function loot() {
      return (store[G.key + 'Loot'] = store[G.key + 'Loot'] || { lvl: 1, n: 4, kind: 'level', unc: false, last: null });
    }
    function itemPool(lv, cons, unc) {
      return ((root[G.data] || {}).items || []).filter(function (it) {
        return (
          (it.lv || 0) === lv &&
          it.cp > 0 &&
          (cons ? it.k === 'consumable' : /^(equipment|armor|weapon|backpack)$/.test(it.k)) &&
          (!it.r || (unc && it.r === 'u')) &&
          (it.t || []).some(function (t) {
            return MAGICT.test(t);
          })
        );
      });
    }
    // an amount of gold, or of credits in Starfinder (1 gp = 10 credits, as the data keeps it)
    function money(g) {
      return G.credits ? (g * 10).toLocaleString('en') + ' credits' : g.toLocaleString('en') + ' gp';
    }
    function gp(cp) {
      if (G.credits) return (cp / 10).toLocaleString('en') + ' cr';
      return cp >= 100
        ? (Math.round(cp / 10) / 10).toLocaleString('en') + ' gp'
        : cp >= 10
          ? Math.round(cp / 10) + ' sp'
          : cp + ' cp';
    }
    function rollLoot() {
      var L = loot(),
        row = TBL[L.lvl],
        r = Math.random,
        pick = function (a) {
          return a[Math.floor(r() * a.length)];
        },
        out = { lvl: L.lvl, n: L.n, kind: L.kind, perm: [], cons: [], vals: [], coins: 0 };
      var take = function (spec, cons, into) {
        spec.forEach(function (x) {
          var pool = itemPool(x[0], cons, L.unc);
          for (var i = 0; i < x[1] && pool.length; i++) into.push(pool.splice(Math.floor(r() * pool.length), 1)[0].id);
        });
      };
      var cur = Math.max(0, row[3] + row[4] * (L.n - 4));
      if (L.kind === 'level') {
        take(row[1], false, out.perm);
        take(row[2], true, out.cons);
      } else {
        if (r() < 0.5) take([[pick(row[1])[0], 1]], false, out.perm);
        take([[pick(row[2])[0], 1 + (r() < 0.5 ? 1 : 0)]], true, out.cons);
        cur = Math.round(cur / 4);
      }
      // part of the money as gems and art objects
      var gems = ((root[G.data] || {}).items || []).filter(function (it) {
          return it.k === 'treasure' && it.cp >= cur * 100 * 0.08 && it.cp <= cur * 100 * 0.4;
        }),
        left = cur * 100;
      for (var i = 0; i < 2 && gems.length; i++) {
        if (r() < 0.6) {
          var g = pick(gems);
          if (g.cp <= left * 0.5) {
            out.vals.push(g.id);
            left -= g.cp;
          }
        }
      }
      out.coins = Math.round(left / 100);
      L.last = out;
    }
    function itemById(id) {
      var I = (root[G.data] || {}).items || [];
      if (!I._by) {
        I._by = {};
        I.forEach(function (x) {
          I._by[x.id] = x;
        });
      }
      return I._by[id];
    }
    function lootRow(id, k) {
      var it = itemById(id);
      if (!it) return '';
      var open = K.M.lopen === k;
      return (
        '<div class="pf-spell' +
        (it.r ? ' r-' + esc(it.r) : '') +
        '"><button type="button" class="pf-pname" data-act="pflOpen" data-v="' +
        esc(k) +
        '" aria-expanded="' +
        open +
        '"><b>' +
        esc(it.n) +
        '</b><span class="spacer"></span><small class="muted">Item ' +
        (it.lv || 0) +
        ' · ' +
        gp(it.cp) +
        '</small></button>' +
        (open
          ? '<div class="pf-desc">' +
            traits(it.t || [], it) +
            md(it.d || '') +
            '<p class="small muted">' +
            esc(it.src || '') +
            '</p></div>'
          : '') +
        '</div>'
      );
    }
    function lootHtml() {
      if (!api.need(['core', 'items'])) return api.waitHtml('Treasures');
      var L = loot(),
        row = TBL[L.lvl],
        t = L.last,
        p = curParty();
      var step = function (k, v, lo, hi) {
        return (
          '<span class="mm-step">' +
          btn('pflSet', '−', { k: k, d: -1 }, 'mm-b') +
          '<b>' +
          v +
          '</b>' +
          btn('pflSet', '+', { k: k, d: 1 }, 'mm-b') +
          '</span>'
        );
      };
      var h =
        '<main class="mon-main tre-main"><h2>Treasures</h2><div class="panel"><p class="small muted">' +
        (G.credits ? 'Each level has a treasure budget.' : 'Pathfinder gives each level a treasure budget.') +
        ' Roll the whole level’s worth at once, or one fight’s share (about a quarter) after an encounter.</p>' +
        '<div class="pills">' +
        [
          ['level', 'Whole level'],
          ['fight', 'One fight’s share']
        ]
          .map(function (k) {
            return btn('pflKind', k[1], { v: k[0] }, 'pill' + (L.kind === k[0] ? ' on' : ''));
          })
          .join('') +
        '</div>' +
        '<div class="row"><div class="field"><span>Party level</span>' +
        step('lvl', L.lvl) +
        '</div><div class="field"><span>Characters</span>' +
        step('n', L.n) +
        '</div>' +
        '<label class="field pf-chk"><span>Uncommon items</span><input type="checkbox" data-pflunc="1"' +
        (L.unc ? ' checked' : '') +
        '></label></div>' +
        (p && p.m.length
          ? '<p class="small">' +
            btn(
              'pflParty',
              'Use my party (' + esc(p.name || 'unnamed') + ', level ' + partyLevel(p) + ', ' + p.m.length + ')',
              {},
              'linkbtn'
            ) +
            '</p>'
          : '') +
        '<p class="small muted">Level ' +
        L.lvl +
        ' budget for 4 characters: ' +
        money(row[0]) +
        ' in all: permanent items ' +
        row[1]
          .map(function (x) {
            return x[1] + ' of level ' + x[0];
          })
          .join(', ') +
        '; consumables ' +
        row[2]
          .map(function (x) {
            return x[1] + ' of level ' + x[0];
          })
          .join(', ') +
        '; ' +
        money(row[3]) +
        ' in money (+' +
        money(row[4]) +
        ' per extra character).</p>' +
        '<div class="toolbar">' +
        btn('pflRoll', (root.Icon ? root.Icon('d20') : '') + ' Random treasure', {}, 'btn primary') +
        '</div></div>';
      if (t) {
        h +=
          '<div class="panel tre-result"><h3>' +
          (t.kind === 'level' ? 'Treasure for level ' + t.lvl : 'One fight at level ' + t.lvl) +
          ' <small class="muted">' +
          t.n +
          ' characters</small></h3>' +
          '<div class="coins"><span class="coin coin-gp"><b>' +
          (G.credits ? (t.coins * 10).toLocaleString('en') : t.coins.toLocaleString('en')) +
          '</b> ' +
          (G.credits ? 'credits' : 'gp') +
          '</span></div>' +
          (t.vals.length
            ? '<h4>Gems and art</h4>' +
              t.vals
                .map(function (id, i) {
                  return lootRow(id, 'v' + i);
                })
                .join('')
            : '') +
          (t.perm.length
            ? '<h4>Permanent items</h4>' +
              t.perm
                .map(function (id, i) {
                  return lootRow(id, 'p' + i);
                })
                .join('')
            : '') +
          (t.cons.length
            ? '<h4>Consumables</h4>' +
              t.cons
                .map(function (id, i) {
                  return lootRow(id, 'c' + i);
                })
                .join('')
            : '') +
          '</div>';
        var things = [];
        [
          ['v', t.vals],
          ['p', t.perm],
          ['c', t.cons]
        ].forEach(function (g) {
          g[1].forEach(function (id, i) {
            var it = itemById(id);
            if (it) things.push({ key: g[0] + i, n: it.n, id: id });
          });
        });
        if (api.ts) h += api.ts.html(things, t.coins, 'treasure', G.credits);
      }
      return (
        h +
        '<p class="small muted">' +
        (G.credits
          ? 'Amounts follow Pathfinder’s Party Treasure by Level table, in credits (1 gp = 10 credits): check them against your Starfinder GM Core. Items are picked at random from the common'
          : 'Amounts from the Core Rulebook’s Party Treasure by Level table. Items are picked at random from the common') +
        (L.unc ? ' and uncommon' : '') +
        (G.credits
          ? ' items of each level. Weapon and armor grades and gear the players want are good swaps for random items.</p></main>'
          : ' magic and alchemical items of each level. Fundamental runes and gear the players want are good swaps for random items.</p></main>')
      );
    }
    K.loot = loot;
    K.lootHtml = lootHtml;
    K.rollLoot = rollLoot;
  };
})(typeof window !== 'undefined' ? window : globalThis);
