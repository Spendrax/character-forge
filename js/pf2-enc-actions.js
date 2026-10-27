// Pathfinder 2e DM tools: what taps and typing do (the actions, onInput, onChange).
// Part of pf2-enc.js: it runs inside PF2Enc; K holds the names the files share.
(function (root) {
  'use strict';
  (root.PF2EncParts = root.PF2EncParts || {}).actions = function (K) {
    var E = K.E,
      curParty = K.curParty,
      enc = K.enc,
      mon = K.mon,
      newMember = K.newMember,
      parties = K.parties,
      partyById = K.partyById,
      partyLevel = K.partyLevel,
      store = K.store,
      ui = K.ui,
      uid = K.uid;

    function member(id) {
      var p = curParty();
      return (
        p &&
        p.m.filter(function (x) {
          return x.id === id;
        })[0]
      );
    }
    function runC(k) {
      var r = enc().run;
      return (
        r &&
        r.list.filter(function (x) {
          return x.k === k;
        })[0]
      );
    }
    var actions = {
      pfeNew: function () {
        var p = { id: uid(), name: '', m: [newMember()] };
        parties().push(p);
        E.team = p.id;
        E.delParty = false;
      },
      pfeAdd: function () {
        var p = curParty();
        p.m.push(newMember(p.m[0] ? p.m[0].lvl : 1));
      },
      pfeRm: function (v) {
        var p = curParty();
        p.m = p.m.filter(function (x) {
          return x.id !== v;
        });
      },
      pfeHp: function (v, el) {
        var m = member(v);
        if (m) m.cur = Math.max(0, Math.min(+m.hp || 0, (+m.cur || 0) + +el.getAttribute('data-d')));
      },
      pfeRest: function () {
        curParty().m.forEach(function (m) {
          m.cur = +m.hp || 0;
        });
      },
      pfePlan: function () {
        var p = curParty(),
          e = enc();
        e.party = p.id;
        ui.section = 'pf2-enc';
        root.scrollTo(0, 0);
      },
      pfeDelAsk: function () {
        E.delParty = true;
      },
      pfeDelNo: function () {
        E.delParty = false;
      },
      pfeDel: function () {
        var id = curParty().id;
        store.pf2Parties = parties().filter(function (x) {
          return x.id !== id;
        });
        E.team = '';
        E.delParty = false;
        if (enc().party === id) enc().party = '';
      },
      pfeSet: function (_, el) {
        var e = enc(),
          k = el.getAttribute('data-k');
        e[k] = Math.max(1, Math.min(k === 'n' ? 12 : 20, (+e[k] || (k === 'n' ? 4 : 1)) + +el.getAttribute('data-d')));
      },
      pfeAdd2: function (v) {
        var e = enc(),
          x = e.mons.filter(function (y) {
            return y.id === v && !y.adj;
          })[0];
        if (x) x.count++;
        else e.mons.push({ id: v, count: 1, adj: '' });
      },
      pfeCount: function (v, el) {
        var e = enc(),
          x = e.mons[+v];
        if (!x) return;
        x.count += +el.getAttribute('data-d');
        if (x.count < 1) e.mons.splice(+v, 1);
      },
      pfeClear: function () {
        enc().mons = [];
      },
      pfeOpen: function (v) {
        E.open = E.open === v ? '' : v;
      },
      pfeView: function (v) {
        E.view = v;
      },
      pfeViewClose: function () {
        E.view = '';
      },
      pfeNear: function (v) {
        E.lo = String(Math.max(-1, +v - 3));
        E.hi = String(+v + 3);
      },
      pfeRun: function () {
        if (!enc().mons.length) return;
        K.startRun();
        if (root.Table) root.Table.pushRun(enc().run, true);
        root.scrollTo(0, 0);
      },
      pfeNext: function () {
        var r = enc().run;
        r.turn++;
        if (r.turn >= r.list.length) {
          r.turn = 0;
          r.round++;
        }
        if (root.Table) root.Table.pushRun(r);
      },
      pfeStop: function () {
        enc().run = null;
        if (root.Table) root.Table.pushRun(null);
      },
      pfmOpen: function (v) {
        K.M.open = K.M.open === v ? '' : v;
      },
      pfmAdd: function (v) {
        actions.pfeAdd2(v);
        var m = mon(v);
        K.M.added = m ? m.n : '';
      },
      pflOpen: function (v) {
        K.M.lopen = K.M.lopen === v ? '' : v;
      },
      pflKind: function (v) {
        K.loot().kind = v;
      },
      pflSet: function (_, el) {
        var L = K.loot(),
          k = el.getAttribute('data-k');
        L[k] = Math.max(1, Math.min(k === 'n' ? 8 : 20, L[k] + +el.getAttribute('data-d')));
      },
      pflParty: function () {
        var p = curParty(),
          L = K.loot();
        if (p && p.m.length) {
          L.lvl = partyLevel(p);
          L.n = Math.min(8, p.m.length);
        }
      },
      pflRoll: function () {
        K.M.lopen = '';
        K.rollLoot();
      },
      pfeLoot: function () {
        var e = enc(),
          p = partyById(e.party),
          L = K.loot();
        L.lvl = p && p.m.length ? partyLevel(p) : +e.lvl || 1;
        L.n = Math.min(8, p && p.m.length ? p.m.length : +e.n || 4);
        L.kind = 'fight';
        K.M.lopen = '';
        K.rollLoot();
        ui.section = 'pf2-loot';
        root.scrollTo(0, 0);
      },
      pfeHpRun: function (v, el) {
        var c = runC(v);
        if (c) {
          c.hp = Math.max(0, Math.min(c.max, c.hp + +el.getAttribute('data-d')));
          K.writeBack(c);
        }
      }
    };
    function onInput(t) {
      var a = function (n) {
        return t.getAttribute(n);
      };
      if (a('data-pfef') != null) {
        E[a('data-pfef')] = t.value;
        return 'render';
      }
      if (a('data-pfmf') != null) {
        K.M[a('data-pfmf')] = t.value;
        K.M.added = '';
        return 'render';
      }
      if (a('data-pfename')) {
        curParty().name = t.value;
        return 'save';
      }
      if (a('data-pfem')) {
        var m = member(a('data-pfem')),
          k = a('data-f');
        if (!m) return 'save';
        if (k === 'n' || k === 'cls') m[k] = t.value;
        else {
          var was = +m.hp || 0;
          m[k] = Math.max(k === 'per' ? -5 : 0, Math.round(+t.value) || 0);
          if (k === 'lvl') m.lvl = Math.max(1, Math.min(20, m.lvl));
          if (k === 'hp' && (+m.cur || 0) >= was) m.cur = m.hp;
          if (k === 'hp') m.cur = Math.min(m.cur, m.hp);
        }
        return 'save';
      }
      if (a('data-pfeinit')) {
        var c = runC(a('data-pfeinit'));
        if (c) c.init = +t.value || 0;
        return 'save';
      }
      if (a('data-pfecond')) {
        var c2 = runC(a('data-pfecond'));
        if (c2) c2.cond = t.value;
        return 'save';
      }
      return null;
    }
    function onChange(t) {
      var a = function (n) {
        return t.getAttribute(n);
      };
      if (a('data-pflunc')) {
        K.loot().unc = t.checked;
        return 'render';
      }
      if (a('data-pfmf') != null) return 'render';
      if (a('data-pfepick')) {
        E.team = t.value;
        return 'render';
      }
      if (a('data-pfeparty') != null) {
        enc().party = t.value;
        return 'render';
      }
      if (a('data-pfeadj') != null) {
        enc().mons[+a('data-pfeadj')].adj = t.value;
        return 'render';
      }
      if (a('data-pfemine') && t.value) {
        var ch = ((store.pf2 || {}).chars || []).filter(function (c) {
          return c.id === t.value;
        })[0];
        if (ch && root.PF2) {
          var d = root.PF2.derive(ch);
          curParty().m.push({
            id: uid(),
            n: ch.name,
            cls: d.cls ? d.cls.n : '',
            lvl: d.level,
            ac: d.ac.v,
            hp: d.hp.max,
            cur: d.hp.max,
            per: d.perception.v
          });
        }
        return 'render';
      }
      if (a('data-pfeinit')) {
        var r = enc().run,
          k = r.list[r.turn] && r.list[r.turn].k;
        r.list.sort(function (x, y) {
          return y.init - x.init;
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
      if (a('data-pfedmg')) {
        var c = runC(a('data-pfedmg')),
          v = String(t.value).trim();
        if (c && /^[+-]?\d+$/.test(v)) {
          var n = parseInt(v, 10);
          c.hp = Math.max(0, Math.min(c.max, v[0] === '+' ? c.hp + n : c.hp - Math.abs(n)));
          K.writeBack(c);
        }
        return 'render';
      }
      if (a('data-pfem') || a('data-pfename') || a('data-pfef') != null) return 'render';
      return null;
    }
    K.actions = actions;
    K.onChange = onChange;
    K.onInput = onInput;
  };
})(typeof window !== 'undefined' ? window : globalThis);
