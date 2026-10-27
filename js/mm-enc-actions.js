// M&M GM tools: what taps and typing do (the actions, onInput, onChange).
// Part of mm-enc.js: it runs inside MMEnc; K holds the names the files share.
(function (root) {
  'use strict';
  (root.MMEncParts = root.MMEncParts || {}).actions = function (K) {
    var E = K.E,
      MINIONS = K.MINIONS,
      MR = K.MR,
      ROLES = K.ROLES,
      U = K.U,
      clamp = K.clamp,
      pick = K.pick,
      store = K.store,
      ui = K.ui,
      uid = K.uid;

    var actions = {
      mmeSet: function (_, el) {
        var e = E(),
          k = el.getAttribute('data-k');
        e[k] = clamp((+e[k] || 0) + +el.getAttribute('data-d'), 1, k === 'pl' ? 20 : 8);
      },
      mmeKind: function (v) {
        E().kind = v;
      },
      mmeGen: function () {
        K.generate();
        E().msg = '';
      },
      mmeOpen: function (v) {
        U.open[v] = !U.open[v];
      },
      mmeReroll: function (v) {
        var e = E(),
          i = e.foes
            .map(function (x) {
              return x.id;
            })
            .indexOf(v);
        if (i < 0) return;
        var old = e.foes[i];
        var mk = old.minion
            ? Object.keys(MINIONS).filter(function (k) {
                return MINIONS[k].label === old.role;
              })[0]
            : null,
          n = K.build(old.pl, mk || e.role || pick(Object.keys(ROLES)), mk);
        if (mk) n.name = old.name;
        e.foes[i] = n;
        U.open[n.id] = 1;
      },
      mmeRm: function (v) {
        var e = E();
        e.foes = e.foes.filter(function (x) {
          return x.id !== v;
        });
      },
      mmeSave: function (v) {
        var h = JSON.parse(JSON.stringify(K.foe(v)));
        h.id = 'h' + uid();
        store.mm = store.mm || { heroes: [], cur: '' };
        store.mm.heroes.push(h);
        E().msg = h.name + ' is now in your Heroes, ready to edit.';
      },
      mmeFight: function (v) {
        U.fighting = U.fighting || {};
        U.fighting[v] = !U.fighting[v];
      },
      mmeRun: function () {
        K.startRun();
        if (root.Table) root.Table.pushRun(E().run, true);
        root.scrollTo(0, 0);
      },
      mmeNext: function () {
        var r = E().run;
        for (var i = 0; i < r.list.length; i++) {
          r.turn++;
          if (r.turn >= r.list.length) {
            r.turn = 0;
            r.round++;
          }
          if (r.list[r.turn].cond !== 'Incapacitated') break;
        }
        r.log = '';
        if (root.Table) root.Table.pushRun(r);
      },
      mmeStop: function () {
        E().run = null;
        if (root.Table) root.Table.pushRun(null);
      },
      mmfAdd: function (v) {
        var f = K.preFoe(v),
          e = E();
        if (!f) return;
        var same = e.foes.filter(function (x) {
          return x.pre === v;
        });
        if (same.length === 1 && same[0].name === f.n) same[0].name = f.n + ' 1';
        e.foes.push({
          id: uid(),
          pre: v,
          name: f.n + (same.length ? ' ' + (same.length + 1) : ''),
          minion: !!f.minion,
          pl: f.pl
        });
        U.added = f.n;
      },
      mmlSet: function (_, el) {
        var L = K.lootState();
        L.pl = clamp(L.pl + +el.getAttribute('data-d'), 1, 20);
      },
      mmlRoll: function () {
        K.rollLoot();
      },
      mmeHit: function (v) {
        var c = K.cur(v),
          box = document.getElementById('mmr-' + v),
          rank = Math.round(+(box && box.value));
        if (!c) return;
        if (!rank) {
          E().run.log = 'Type the damage rank first.';
          return;
        }
        E().run.log = K.hit(c, rank);
        K.writeBack(c);
      },
      mmeHeal: function (v) {
        var c = K.cur(v);
        if (!c) return;
        if (c.cond) c.cond = K.DMG[K.DMG.indexOf(c.cond) - 1] === 'Bruised' ? '' : K.DMG[K.DMG.indexOf(c.cond) - 1];
        else if (c.bruise) c.bruise--;
        E().run.log = c.n + ' recovers a step.';
        K.writeBack(c);
      },
      mmtNew: function () {
        var t = { id: uid(), name: '', m: [K.newMember(E().pl)] };
        K.teams().push(t);
        U.team = t.id;
        U.delTeam = false;
      },
      mmtAdd: function () {
        var t = K.curTeam();
        t.m.push(K.newMember(t.m[0] ? t.m[0].pl : E().pl));
      },
      mmtRm: function (v) {
        var t = K.curTeam();
        t.m = t.m.filter(function (x) {
          return x.id !== v;
        });
      },
      mmtHp: function (v, el) {
        var m = tm(v);
        if (m) m.hp = clamp((+m.hp || 0) + +el.getAttribute('data-d'), 0, 99);
      },
      mmtHeal: function (v) {
        var m = tm(v);
        if (!m) return;
        if (m.cond) m.cond = m.cond === 'Dazed' ? '' : K.DMG[K.DMG.indexOf(m.cond) - 1];
        else if (m.bruise) m.bruise--;
      },
      mmtRest: function () {
        K.curTeam().m.forEach(function (m) {
          m.bruise = 0;
          m.cond = '';
          m.hp = 1;
        });
      },
      mmtPlan: function () {
        var t = K.curTeam(),
          e = E();
        if (t.m.length) {
          e.pl = K.teamPL(t);
          e.n = clamp(t.m.length, 1, 8);
        }
        e.team = t.id;
        ui.section = 'mm-enc';
        root.scrollTo(0, 0);
      },
      mmtDelAsk: function () {
        U.delTeam = true;
      },
      mmtDelNo: function () {
        U.delTeam = false;
      },
      mmtDel: function () {
        var id = K.curTeam().id;
        store.mmTeams = K.teams().filter(function (x) {
          return x.id !== id;
        });
        U.team = '';
        U.delTeam = false;
        if (E().team === id) E().team = '';
      }
    };
    function tm(id) {
      var t = K.curTeam();
      return (
        t &&
        t.m.filter(function (x) {
          return x.id === id;
        })[0]
      );
    }
    function onInput(t) {
      if (t.getAttribute('data-mmff') != null) {
        U.ff[t.getAttribute('data-mmff')] = t.value;
        U.added = '';
        return 'render';
      }
      if (t.getAttribute('data-mmtname')) {
        K.curTeam().name = t.value;
        return 'save';
      }
      if (t.getAttribute('data-mmt')) {
        var m = tm(t.getAttribute('data-mmt')),
          k = t.getAttribute('data-f');
        if (m) m[k] = k === 'n' ? t.value : clamp(Math.round(+t.value) || 0, k === 'pl' ? 1 : 0, 99);
        return 'save';
      }
      if (t.getAttribute('data-mmeinit')) {
        var c = K.cur(t.getAttribute('data-mmeinit'));
        if (c) c.init = +t.value || 0;
        return 'save';
      }
      return null;
    }
    function onChange(t) {
      if (t.getAttribute('data-mmltheme')) {
        K.lootState().theme = t.value;
        return 'render';
      }
      if (t.getAttribute('data-mmff') != null) return 'render';
      if (t.getAttribute('data-mmerole')) {
        E().role = t.value;
        return 'render';
      }
      if (t.getAttribute('data-mmtpick')) {
        U.team = t.value;
        U.delTeam = false;
        return 'render';
      }
      if (t.getAttribute('data-mmtname') || t.getAttribute('data-mmt')) return 'render';
      if (t.getAttribute('data-mmtmine') && t.value) {
        var h = (store.mm.heroes || []).filter(function (x) {
          return x.id === t.value;
        })[0];
        if (h) {
          var d = MR.derive(h);
          K.curTeam().m.push({
            id: uid(),
            n: h.name,
            pl: d.pl,
            tough: d.def.tough,
            dodge: d.def.dodge,
            parry: d.def.parry,
            fort: d.def.fort,
            will: d.def.will,
            hp: 1,
            bruise: 0,
            cond: ''
          });
        }
        return 'render';
      }
      if (t.getAttribute('data-mmeteam') != null) {
        var e = E(),
          tt = K.teamById(t.value);
        e.team = t.value;
        if (tt && tt.m.length) {
          e.pl = K.teamPL(tt);
          e.n = clamp(tt.m.length, 1, 8);
        }
        return 'render';
      }
      if (t.getAttribute('data-mmeinit')) {
        var r = E().run,
          k = r.list[r.turn] && r.list[r.turn].k;
        r.list.sort(function (x, y) {
          return y.init - x.init || y.mod - x.mod;
        });
        r.turn = Math.max(
          0,
          r.list
            .map(function (x) {
              return x.k;
            })
            .indexOf(k)
        );
        return 'render';
      }
      return null;
    }
    K.actions = actions;
    K.onChange = onChange;
    K.onInput = onInput;
  };
})(typeof window !== 'undefined' ? window : globalThis);
