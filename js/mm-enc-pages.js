// M&M GM tools: the Villains and Rewards pages.
// Part of mm-enc.js: it runs inside MMEnc; K holds the names the files share.
(function (root) {
  'use strict';
  (root.MMEncParts = root.MMEncParts || {}).pages = function (K) {
    var E = K.E,
      U = K.U,
      api = K.api,
      btn = K.btn,
      esc = K.esc,
      pick = K.pick,
      store = K.store;

    // ---------- Villains: ready-made foes from the rules ----------
    function foesPage() {
      var F = (U.ff = U.ff || { q: '', lo: '', hi: '', kind: '' }),
        q = F.q.toLowerCase(),
        all = root.MMFoes || [];
      var list = all.filter(function (f) {
        return (
          (!q || (f.n + ' ' + f.kind).toLowerCase().indexOf(q) >= 0) &&
          (F.lo === '' || f.pl >= +F.lo) &&
          (F.hi === '' || f.pl <= +F.hi) &&
          (!F.kind || f.kind === F.kind)
        );
      });
      var kinds = all
        .map(function (f) {
          return f.kind;
        })
        .filter(function (k, i, a) {
          return a.indexOf(k) === i;
        })
        .sort();
      var pls = [];
      for (var i = 1; i <= 12; i++) pls.push(i);
      var sel = function (k, label, opts) {
        return (
          '<label class="mon-f">' +
          label +
          ' <select data-mmff="' +
          k +
          '"><option value="">Any</option>' +
          opts
            .map(function (o) {
              return '<option' + (String(F[k]) === String(o) ? ' selected' : '') + '>' + esc(o) + '</option>';
            })
            .join('') +
          '</select></label>'
        );
      };
      var n = E().foes.length;
      return (
        '<main class="mon-main mme"><h2>Villains</h2><p class="muted">Ready-made foes from the M&amp;M rules: thugs, cops, robots and named villains. Add them to an encounter, or use them next to the ones the generator makes.</p>' +
        '<div class="panel"><div class="mon-tools"><input type="search" id="mmff-q" data-mmff="q" placeholder="Search villains…" value="' +
        esc(F.q) +
        '">' +
        sel('lo', 'PL from', pls) +
        sel('hi', 'to', pls) +
        sel('kind', 'Kind', kinds) +
        '</div>' +
        '<div class="small muted mon-count">' +
        list.length +
        ' foes</div>' +
        (U.added
          ? '<p class="small rest-msg">' +
            esc(U.added) +
            ' added: ' +
            n +
            ' in the encounter. <button type="button" class="linkbtn" data-act="section" data-v="mm-enc">Go to Encounters</button></p>'
          : '') +
        '</div>' +
        list
          .map(function (f) {
            return K.preBlock(
              f,
              null,
              U.open['f:' + f.id],
              btn('mmfAdd', '+ Add to encounter', { v: f.id }, 'btn small primary')
            );
          })
          .join('') +
        '<p class="small muted">Stat blocks from the Mutants &amp; Masterminds 3e SRD (Open Game Content, d20herosrd.com), shortened. Damage rank: the target makes a Toughness check against DC 15 + rank.</p></main>'
      );
    }

    // ---------- Rewards: what the heroes find ----------
    function lootState() {
      return (store.mmLoot = store.mmLoot || { pl: E().pl || 10, theme: '', last: null });
    }
    function rollLoot() {
      var L = lootState(),
        T = root.MMLoot,
        th = L.theme || pick(T.themes)[0],
        pl = L.pl;
      var fill = function (t) {
        return t
          .replace(/\{r\}/g, pl)
          .replace(/\{r-2\}/g, Math.max(1, pl - 2))
          .replace(/\{h\}/g, Math.max(1, Math.ceil(pl / 2)));
      };
      var devs = T.devices[th]
        .slice()
        .sort(function () {
          return Math.random() - 0.5;
        })
        .slice(0, 2)
        .map(function (d) {
          return [d[0], fill(d[1]), d[2]];
        });
      L.last = { theme: th, pl: pl, items: devs, clue: pick(T.clues), cash: Math.random() < 0.5 };
    }
    function lootPage() {
      var L = lootState(),
        T = root.MMLoot,
        t = L.last;
      var h =
        '<main class="mon-main tre-main mme"><h2>Rewards</h2><div class="panel"><p class="small muted">Heroes don’t loot bodies, but beaten villains leave things behind: gadgets, evidence, leads. Roll something to find after a fight.</p>' +
        '<div class="row"><div class="field"><span>Power level</span><span class="mm-step">' +
        btn('mmlSet', '−', { d: -1 }, 'mm-b') +
        '<b>' +
        L.pl +
        '</b>' +
        btn('mmlSet', '+', { d: 1 }, 'mm-b') +
        '</span></div>' +
        '<label class="field"><span>Villain’s style</span><select data-mmltheme="1"><option value="">Any</option>' +
        T.themes
          .map(function (x) {
            return '<option value="' + x[0] + '"' + (L.theme === x[0] ? ' selected' : '') + '>' + x[1] + '</option>';
          })
          .join('') +
        '</select></label></div>' +
        '<div class="toolbar">' +
        btn('mmlRoll', (root.Icon ? root.Icon('d20') : '') + ' What did they leave?', {}, 'btn primary') +
        '</div></div>';
      if (t)
        h +=
          '<div class="panel tre-result"><h3>Found <small class="muted">' +
          esc(
            (T.themes.filter(function (x) {
              return x[0] === t.theme;
            })[0] || ['', ''])[1]
          ) +
          ' · PL ' +
          t.pl +
          '</small></h3><ul class="tre-list">' +
          t.items
            .map(function (d) {
              return '<li><b>' + esc(d[0]) + '</b> — ' + esc(d[2]) + '<div class="small">' + esc(d[1]) + '</div></li>';
            })
            .join('') +
          '<li><b>A lead</b> — ' +
          esc(t.clue) +
          '</li>' +
          (t.cash
            ? '<li><b>Evidence and stolen goods</b> — enough to put the minions away and return what was taken; the grateful owners may become Contacts.</li>'
            : '') +
          '</ul></div>';
      if (t && api.ts)
        h += api.ts.html(
          t.items
            .map(function (d, i) {
              return { key: 'i' + i, n: d[0], note: d[1] + (d[2] ? ' (' + d[2] + ')' : '') };
            })
            .concat([{ key: 'lead', n: 'A lead', note: t.clue }]),
          0,
          'rewards'
        );
      return (
        h +
        '<div class="panel"><h3>Power points and hero points</h3><ul class="small">' +
        '<li>Give each hero <b>1 power point</b> per adventure (2 for a big finale); they spend them like the ones they started with.</li>' +
        '<li>Hero points go back to 1 at the start of each adventure; give one more for each complication that comes up in play.</li>' +
        '<li>A hero who wants to keep a found device for good pays for it: as Equipment, or as a power with Removable (−1 point per 5) or Easily Removable (−2 per 5). Otherwise it’s gone by the next adventure: broken, confiscated, or stolen back.</li></ul></div></main>'
      );
    }
    function foe(id) {
      return E().foes.filter(function (x) {
        return x.id === id;
      })[0];
    }
    function cur(k) {
      var r = E().run;
      return (
        r &&
        r.list.filter(function (x) {
          return x.k === k;
        })[0]
      );
    }
    K.cur = cur;
    K.foe = foe;
    K.foesPage = foesPage;
    K.lootPage = lootPage;
    K.lootState = lootState;
    K.rollLoot = rollLoot;
  };
})(typeof window !== 'undefined' ? window : globalThis);
