// Pathfinder 2e party and encounters for the GM: the XP budget (Gamemastery rules of the Core Rulebook),
// creatures from the Bestiaries (OGL), elite and weak versions, and running the fight.
(function (root) {
  'use strict';
  var XP = { '-4': 10, '-3': 15, '-2': 20, '-1': 30, 0: 40, 1: 60, 2: 80, 3: 120, 4: 160 };
  var THREAT = [
    ['Trivial', 40, 10],
    ['Low', 60, 15],
    ['Moderate', 80, 20],
    ['Severe', 120, 30],
    ['Extreme', 160, 40]
  ];
  // Elite and weak adjustments: ±2 to AC, attacks, DCs, saves, Perception, damage; HP by starting level
  function hpAdj(lv) {
    return lv <= 1 ? 10 : lv <= 4 ? 15 : lv <= 19 ? 20 : 30;
  }
  function xpFor(diff) {
    if (diff < -4) return 0;
    if (diff > 4) return 160 + (diff - 4) * 40;
    return XP[String(diff)];
  }
  function budget(n) {
    return THREAT.map(function (t) {
      return { label: t[0], xp: t[1] + t[2] * (n - 4) };
    });
  }
  function rate(partyLevel, n, mons) {
    var total = 0;
    mons.forEach(function (m) {
      total += xpFor(m.lv - partyLevel) * (m.count || 1);
    });
    // the threat is the first budget the total fits in (trivial is 40 XP or less for four characters)
    var b = budget(n),
      idx = 5;
    for (var i = 0; i < b.length; i++)
      if (total <= b[i].xp) {
        idx = i;
        break;
      }
    return { xp: total, budget: b, threat: idx === 5 ? 'Beyond extreme' : b[idx].label, idx: idx };
  }

  root.PF2Enc = function (api) {
    var esc = api.esc,
      btn = api.btn,
      ui = api.ui,
      store = api.store,
      md = api.md,
      fmt = api.fmt,
      gl = api.gl,
      traits = api.traits;
    var E = (ui.pf2e = ui.pf2e || { q: '', lo: '', hi: '', trait: '', open: '', delParty: false, team: '' });
    function parties() {
      return (store.pf2Parties = store.pf2Parties || []);
    }
    function partyById(id) {
      return parties().filter(function (p) {
        return p.id === id;
      })[0];
    }
    function curParty() {
      return partyById(E.team) || parties()[0] || null;
    }
    function enc() {
      return (store.pf2Enc = store.pf2Enc || { party: '', lvl: 1, n: 4, mons: [], run: null });
    }
    function uid() {
      return 'e' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    }
    function mon(id) {
      var B = (root.PF2DATA || {}).bestiary || [];
      if (!B._by) {
        B._by = {};
        B.forEach(function (m) {
          B._by[m.id] = m;
        });
      }
      return B._by[id];
    }
    function adjLv(m, adj) {
      return m.lv + (adj === 'elite' ? 1 : adj === 'weak' ? -1 : 0);
    }

    // ---------- party ----------
    function newMember(lv) {
      return { id: uid(), n: '', cls: '', lvl: lv || 1, ac: 15, hp: 20, cur: 20, per: 5 };
    }
    function line(p) {
      if (!p.m.length) return 'No characters yet.';
      var lv = p.m.map(function (x) {
          return +x.lvl || 1;
        }),
        lo = Math.min.apply(null, lv),
        hi = Math.max.apply(null, lv);
      return (
        p.m.length +
        ' character' +
        (p.m.length === 1 ? '' : 's') +
        ', level ' +
        (lo === hi ? lo : lo + '–' + hi) +
        ' · HP ' +
        p.m.reduce(function (a, x) {
          return a + (+x.cur || 0);
        }, 0) +
        '/' +
        p.m.reduce(function (a, x) {
          return a + (+x.hp || 0);
        }, 0)
      );
    }
    function partyLevel(p) {
      var c = {};
      p.m.forEach(function (x) {
        c[x.lvl] = (c[x.lvl] || 0) + 1;
      });
      return (
        +Object.keys(c).sort(function (a, b) {
          return c[b] - c[a] || b - a;
        })[0] || 1
      );
    }
    // planned encounters: saved with a name and notes, opened or run later (js/saved-enc.js)
    if (root.SavedEnc)
      root.SavedEnc.register('pf2', {
        list: function () {
          return (store.pf2Encounters = store.pf2Encounters || []);
        },
        cur: enc,
        load: function (e) {
          e.run = null;
          store.pf2Enc = e;
        },
        fresh: function () {
          var e = enc();
          return { name: '', notes: '', party: e.party, lvl: e.lvl, n: e.n, mons: [], run: null };
        },
        summary: function (e) {
          var p = partyById(e.party),
            lvl = p && p.m.length ? partyLevel(p) : +e.lvl || 1,
            n = p && p.m.length ? p.m.length : +e.n || 4,
            mons = e.mons
              .map(function (x) {
                var m = mon(x.id);
                return m ? { lv: adjLv(m, x.adj), count: x.count } : null;
              })
              .filter(Boolean),
            c = e.mons.reduce(function (a, x) {
              return a + x.count;
            }, 0);
          return (
            c +
            ' creature' +
            (c === 1 ? '' : 's') +
            (mons.length ? ' · ' + rate(lvl, n, mons).threat + ' for level ' + lvl : '')
          );
        },
        run: function () {
          K.actions.pfeRun();
          ui.section = 'pf2-enc';
        },
        save: function () {}
      });
    // the parts (pf2-enc-party.js, pf2-enc-run.js, pf2-enc-monsters.js, pf2-enc-loot.js, pf2-enc-actions.js) share these names through K
    var K = {
      E: E,
      adjLv: adjLv,
      api: api,
      btn: btn,
      curParty: curParty,
      enc: enc,
      esc: esc,
      fmt: fmt,
      gl: gl,
      hpAdj: hpAdj,
      line: line,
      md: md,
      mon: mon,
      newMember: newMember,
      parties: parties,
      partyById: partyById,
      partyLevel: partyLevel,
      rate: rate,
      store: store,
      traits: traits,
      ui: ui,
      uid: uid,
      xpFor: xpFor
    };
    ['party', 'enc', 'monsters', 'loot', 'actions'].forEach(function (p) {
      root.PF2EncParts[p](K);
    });
    return {
      html: K.html,
      partyHtml: K.partyHtml,
      monstersHtml: K.monstersHtml,
      lootHtml: K.lootHtml,
      actions: K.actions,
      onInput: K.onInput,
      onChange: K.onChange
    };
  };
  root.PF2Enc.rate = rate;
  root.PF2Enc.xpFor = xpFor;
})(typeof window !== 'undefined' ? window : globalThis);
