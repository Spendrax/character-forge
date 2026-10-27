// Mutants & Masterminds hero pages: what taps and typing do (the actions, onInput, onChange).
// Part of mm.js: it runs inside MMUI; K holds the names the files share.
(function (root) {
  'use strict';
  (root.MMUIParts = root.MMUIParts || {}).actions = function (K) {
    var MODS = K.MODS,
      S = K.S,
      U = K.U,
      derive = K.derive,
      fmt = K.fmt,
      hero = K.hero,
      newHero = K.newHero,
      ui = K.ui,
      uid = K.uid;

    // ---------- changes ----------
    function walk(obj, path) {
      var k = String(path).split('.'),
        o = obj;
      for (var i = 0; i < k.length - 1; i++) {
        if (o[k[i]] == null) o[k[i]] = {};
        o = o[k[i]];
      }
      return [o, k[k.length - 1]];
    }
    var actions = {
      mmOpen: function (v) {
        S().cur = v;
        ui.section = 'mm-heroes';
        root.scrollTo(0, 0);
      },
      mmTab: function (v) {
        U.tab = v;
        U.pick = false;
        root.scrollTo(0, 0);
      },
      mmStep: function (_, el) {
        var h = hero(),
          w = walk(h, el.getAttribute('data-p')),
          d = +el.getAttribute('data-d'),
          min = +el.getAttribute('data-min'),
          max = +el.getAttribute('data-max');
        var cur = +w[0][w[1]] || (/\.r$|rank$/.test(el.getAttribute('data-p')) && min >= 1 ? 1 : 0);
        w[0][w[1]] = Math.max(min, Math.min(max, cur + d));
      },
      mmNew: function () {
        var h = newHero();
        S().heroes.push(h);
        S().cur = h.id;
        U.tab = 'basics';
        U.confirmDel = false;
      },
      mmDup: function () {
        var c = JSON.parse(JSON.stringify(hero()));
        c.id = uid();
        c.name = (c.name || 'Hero') + ' (copy)';
        S().heroes.push(c);
        S().cur = c.id;
      },
      mmDelAsk: function () {
        U.confirmDel = true;
      },
      mmDelNo: function () {
        U.confirmDel = false;
      },
      mmDel: function () {
        var s = S(),
          id = s.cur;
        s.heroes = s.heroes.filter(function (x) {
          return x.id !== id;
        });
        s.cur = s.heroes[0] ? s.heroes[0].id : '';
        U.confirmDel = false;
      },
      mmSpecAdd: function (v) {
        var h = hero();
        (h.spec = h.spec || []).push({ s: v, n: '', r: 0 });
      },
      mmSpecRm: function (v) {
        hero().spec.splice(+v, 1);
      },
      mmAdvCat: function (v) {
        U.advCat = v;
      },
      mmAdvAdd: function (v) {
        var h = hero();
        (h.adv = h.adv || []).push({ n: v, r: 1, note: '' });
      },
      mmAdvRm: function (v) {
        hero().adv.splice(+v, 1);
      },
      mmPick: function (v) {
        U.pick = v === '1';
        ui.q.mmfx = '';
      },
      mmPowAdd: function (v) {
        var h = hero(),
          p = { id: uid(), name: '', effect: v, rank: 1, mods: [], desc: '' };
        (h.powers = h.powers || []).push(p);
        U.open = p.id;
        U.pick = false;
      },
      mmOpenP: function (v) {
        U.open = U.open === v ? null : v;
      },
      mmPowRm: function (v) {
        hero().powers.splice(+v, 1);
      },
      mmPowDup: function (v) {
        var h = hero(),
          c = JSON.parse(JSON.stringify(h.powers[+v]));
        c.id = uid();
        c.name = (c.name || c.effect) + ' (copy)';
        h.powers.splice(+v + 1, 0, c);
        U.open = c.id;
      },
      mmModRm: function (v, el) {
        hero().powers[+el.getAttribute('data-i')].mods.splice(+v, 1);
      },
      mmCompAdd: function () {
        var h = hero();
        (h.comp = h.comp || []).push({
          k: (h.comp || []).some(function (c) {
            return c.k === 'Motivation';
          })
            ? 'Responsibility'
            : 'Motivation',
          t: ''
        });
      },
      mmCompRm: function (v) {
        hero().comp.splice(+v, 1);
      },
      mmPrint: function () {
        root.print();
        return false;
      },
      mmNoteStyle: function (v, el) {
        var h = hero();
        h.noteStyle = Object.assign({}, h.noteStyle);
        h.noteStyle[el.getAttribute('data-k')] = v;
      },
      mmHp: function (v) {
        var T = (hero().track = hero().track || {});
        T.hp = Math.max(0, Math.min(20, (T.hp == null ? 1 : +T.hp) + +v));
      },
      mmCond: function (v) {
        var T = (hero().track = hero().track || {}),
          c = (T.conds = T.conds || {});
        if (c[v]) delete c[v];
        else c[v] = 1;
      },
      mmHit: function () {
        var h = hero(),
          d = derive(h),
          T = (h.track = h.track || {}),
          rank = Math.round(+U.dmgRank || 0);
        if (!rank) {
          U.hitMsg = 'Type the damage rank first.';
          return;
        }
        if (T.dmg === 4) {
          U.hitMsg = 'Already incapacitated.';
          return;
        }
        var tough = d.def.tough - (+T.bruise || 0),
          roll = 1 + Math.floor(Math.random() * 20),
          tot = roll + tough,
          dc = 15 + rank,
          how = roll + ' ' + fmt(tough) + ' = ' + tot + ' vs DC ' + dc;
        if (tot >= dc) {
          U.hitMsg = 'Resisted (' + how + ').';
          return;
        }
        var deg = Math.min(4, Math.ceil((dc - tot) / 5));
        if (deg === 3 && T.dmg === 3) deg = 4;
        if (deg < 4) T.bruise = (+T.bruise || 0) + 1;
        if (deg >= 2 && deg > (T.dmg || 0)) T.dmg = deg;
        U.hitMsg =
          'Failed by ' +
          deg +
          ' degree' +
          (deg > 1 ? 's' : '') +
          ' (' +
          how +
          '): ' +
          (deg === 1 ? '−1 Toughness (a bruise).' : K.TRACK[deg] + (deg < 4 ? ' and −1 Toughness.' : '.'));
      },
      mmRecover: function () {
        var T = (hero().track = hero().track || {});
        if (T.dmg) T.dmg = T.dmg === 2 ? 0 : T.dmg - 1;
        else if (T.bruise) T.bruise--;
        U.hitMsg = '';
      },
      mmFresh: function () {
        var T = (hero().track = hero().track || {});
        T.dmg = 0;
        T.bruise = 0;
        U.hitMsg = 'All healed.';
      }
    };
    function onInput(t) {
      if (t.getAttribute('data-mmplay') === 'rank') {
        U.dmgRank = t.value;
        return 'none';
      }
      var f = t.getAttribute('data-mmf');
      if (f == null) return null;
      var w = walk(hero(), f);
      w[0][w[1]] = t.value;
      return 'save';
    }
    function onChange(t) {
      var ck = t.getAttribute('data-mmchk');
      if (ck != null) {
        var wc = walk(hero(), ck);
        wc[0][wc[1]] = t.checked;
        return 'render';
      }
      if (t.getAttribute('data-mmhero')) {
        S().cur = t.value;
        U.confirmDel = false;
        return 'render';
      }
      var s = t.getAttribute('data-mmsel');
      if (s != null) {
        var w = walk(hero(), s);
        w[0][w[1]] = /\.(v|base)$/.test(s) ? +t.value : t.value;
        return 'render';
      }
      var a = t.getAttribute('data-mmaddmod');
      if (a != null && t.value) {
        var m = MODS[t.value];
        hero().powers[+a].mods.push({ n: t.value, v: m[2][0], r: 1, note: '' });
        return 'render';
      }
      if (t.getAttribute('data-mmf') != null) return 'render'; // names show in the lists
      return null;
    }
    K.actions = actions;
    K.onChange = onChange;
    K.onInput = onInput;
  };
})(typeof window !== 'undefined' ? window : globalThis);
