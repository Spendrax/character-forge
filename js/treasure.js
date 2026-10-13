// Treasures: quick random loot sized to a fight. Our own tables, in the spirit of the DMG's
// (pocket money per creature, or a hoard for a boss), with magic items from the app's item list.
(function (root) {
  'use strict';
  function d(n, s, r) { var t = 0; for (var i = 0; i < n; i++) t += 1 + Math.floor(r() * s); return t; }
  function pick(list, r) { return list[Math.floor(r() * list.length)]; }
  function tierOf(cr) { cr = +cr || 0; return cr <= 4 ? 0 : cr <= 10 ? 1 : cr <= 16 ? 2 : 3; }
  var TIERS = ['Challenge 0–4', 'Challenge 5–10', 'Challenge 11–16', 'Challenge 17+'];
  // Creatures that don't carry money.
  var NO_POCKETS = /^(beast|ooze|plant|construct|elemental|swarm)/i;

  // Pocket money for one creature: [chance, coin, dice, sides, multiplier]
  var POCKET = [
    [[45, 'cp', 5, 6, 1], [75, 'sp', 4, 6, 1], [95, 'gp', 2, 6, 1], [100, 'pp', 1, 4, 1]],
    [[30, 'sp', 4, 6, 10], [75, 'gp', 2, 6, 10], [100, 'pp', 1, 6, 5]],
    [[40, 'gp', 4, 6, 10], [80, 'gp', 2, 6, 100], [100, 'pp', 2, 6, 10]],
    [[30, 'gp', 2, 6, 100], [75, 'pp', 2, 6, 10], [100, 'pp', 4, 6, 10]]
  ];
  // Hoard coins: [coin, dice, sides, multiplier]
  var HOARD = [
    [['cp', 5, 6, 100], ['sp', 3, 6, 100], ['gp', 2, 6, 10]],
    [['sp', 2, 6, 1000], ['gp', 5, 6, 100], ['pp', 3, 6, 10]],
    [['gp', 4, 6, 1000], ['pp', 4, 6, 100]],
    [['gp', 10, 6, 1000], ['pp', 6, 6, 1000]]
  ];
  // Valuables: [chance %, count dice, sides, [values]]
  var VALUABLES = [[60, 2, 4, [10, 25, 50]], [70, 2, 6, [50, 100, 250]], [75, 3, 6, [250, 500, 750, 1000]], [80, 1, 8, [1000, 2500, 5000, 7500]]];
  var GEMS = { 10: ['Azurite', 'Banded agate', 'Hematite', 'Malachite', 'Tiger eye', 'Turquoise'], 25: ['Bloodstone', 'Carnelian', 'Jasper', 'Moonstone', 'Onyx', 'Zircon'],
    50: ['Bloodstone', 'Chalcedony', 'Citrine', 'Moonstone', 'Onyx', 'Quartz'], 100: ['Amber', 'Amethyst', 'Coral', 'Garnet', 'Jade', 'Pearl'],
    250: ['Coral', 'Pearl', 'Spinel', 'Tourmaline', 'Jet', 'Garnet'], 500: ['Alexandrite', 'Aquamarine', 'Black pearl', 'Blue spinel', 'Peridot', 'Topaz'],
    750: ['Aquamarine', 'Peridot', 'Topaz', 'Black pearl', 'Opal', 'Alexandrite'], 1000: ['Black opal', 'Blue sapphire', 'Emerald', 'Fire opal', 'Star ruby', 'Yellow sapphire'],
    2500: ['Emerald', 'Fire opal', 'Star sapphire', 'Ruby', 'Black opal', 'Blue sapphire'], 5000: ['Black sapphire', 'Diamond', 'Jacinth', 'Ruby'], 7500: ['Diamond', 'Jacinth', 'Black sapphire', 'Star ruby'] };
  var ART = ['silver ewer', 'carved bone statuette', 'gold ring set with a small stone', 'embroidered silk handkerchief', 'brass mug with jade inlay', 'small painted portrait',
    'gold locket with a lock of hair', 'silver-plated dagger', 'jeweled anklet', 'ceremonial mask', 'carved ivory comb', 'woven tapestry', 'gilded holy symbol', 'crystal goblet',
    'jeweled music box', 'electrum crown', 'gold dragon figurine', 'velvet cloak with gold thread'];
  // Magic items: [chance %, how many (dice, sides), rarity weights {rarity: weight}]
  var MAGIC_HOARD = [[45, 1, 2, { Common: 55, Uncommon: 45 }], [65, 1, 3, { Common: 15, Uncommon: 55, Rare: 30 }], [80, 1, 4, { Uncommon: 20, Rare: 50, 'Very rare': 30 }], [100, 2, 3, { Rare: 20, 'Very rare': 50, Legendary: 30 }]];
  var MAGIC_POCKET = [3, 6, 10, 15]; // small chance of one item in pocket money, one tier lower

  function weighted(w, r) { var tot = 0, k; for (k in w) tot += w[k]; var x = r() * tot; for (k in w) { x -= w[k]; if (x < 0) return k; } return k; }
  function magicItem(rarity, items, r) {
    var pool = items.filter(function (x) { return x[1].indexOf(rarity) >= 0; });
    var x = pool.length ? pick(pool, r) : null;
    return x ? { n: x[0], r: rarity, type: x[2], att: !!x[3], slug: x[4] } : null;
  }
  function addCoins(c, coin, n) { c[coin] = (c[coin] || 0) + n; }

  // spec: { kind: 'pocket'|'hoard', tier: 0..3, creatures: [{cr, type, n}] } → { coins, valuables, items, notes }
  function rollTreasure(spec, items, r) {
    r = r || Math.random;
    var out = { coins: {}, valuables: [], items: [], notes: [] }, tier = spec.tier;
    if (spec.kind === 'pocket') {
      var skipped = 0, carriers = 0;
      (spec.creatures || [{ cr: [0, 5, 11, 17][tier], type: '', n: 1 }]).forEach(function (cr) {
        for (var i = 0; i < cr.n; i++) {
          if (NO_POCKETS.test(cr.type || '')) { skipped++; continue; }
          carriers++;
          var t = tierOf(cr.cr), x = r() * 100, row = POCKET[t].filter(function (p) { return x < p[0]; })[0];
          addCoins(out.coins, row[1], d(row[2], row[3], r) * row[4]);
          if (r() * 100 < MAGIC_POCKET[t]) { var it = magicItem(t >= 2 ? 'Uncommon' : 'Common', items, r); if (it) out.items.push(it); }
        }
      });
      if (skipped) out.notes.push(skipped + ' creature' + (skipped > 1 ? 's' : '') + ' (beasts, oozes, constructs…) carried nothing.');
      if (!carriers) out.notes.push('Nothing here carries coins. Try a hoard if they guarded a lair.');
      return out;
    }
    HOARD[tier].forEach(function (c) { addCoins(out.coins, c[0], d(c[1], c[2], r) * c[3]); });
    var v = VALUABLES[tier];
    if (r() * 100 < v[0]) {
      var n = d(v[1], v[2], r), value = pick(v[3], r);
      if (r() < 0.5) out.valuables.push({ kind: 'gem', n: n, value: value, names: Array.apply(null, Array(n)).map(function () { return pick(GEMS[value] || GEMS[50], r); }) });
      else out.valuables.push({ kind: 'art', n: n, value: value, names: Array.apply(null, Array(n)).map(function () { return pick(ART, r); }) });
    }
    var m = MAGIC_HOARD[tier];
    if (r() * 100 < m[0]) { var k = d(m[1], m[2], r); for (var i = 0; i < k; i++) { var it = magicItem(weighted(m[3], r), items, r); if (it) out.items.push(it); } }
    return out;
  }
  function gpValue(t) {
    var rate = { cp: 0.01, sp: 0.1, ep: 0.5, gp: 1, pp: 10 }, g = 0;
    for (var c in t.coins) g += t.coins[c] * rate[c];
    t.valuables.forEach(function (v) { g += v.n * v.value; });
    return Math.round(g);
  }

  root.TreasureUI = function (api) {
    var esc = api.esc, btn = api.btn, ui = api.ui, store = api.store, D = root.DND;
    var T = ui.tre = ui.tre || {};
    function state() { return store.treasure = store.treasure || { kind: 'pocket', tier: 0, count: 4 }; }

    // Called by Encounters when a fight ends: remember what was fought and guess pocket money or hoard.
    function fromEncounter(creatures, partyLevels, title) {
      var s = state(), maxCr = 0, avg = partyLevels.length ? partyLevels.reduce(function (a, b) { return a + b; }, 0) / partyLevels.length : 1;
      creatures.forEach(function (c) { maxCr = Math.max(maxCr, +c.cr || 0); });
      s.from = { creatures: creatures, title: title, boss: maxCr >= avg };
      s.kind = s.from.boss ? 'hoard' : 'pocket'; s.tier = tierOf(maxCr);
      roll();
    }
    function spec() {
      var s = state();
      return { kind: s.kind, tier: s.tier, creatures: s.from ? s.from.creatures : [{ cr: [0, 5, 11, 17][s.tier], type: '', n: s.count }] };
    }
    function roll() { var s = state(); s.last = rollTreasure(spec(), D.magicItems, Math.random); s.last.kind = s.kind; }

    var COINS = [['pp', 'platinum'], ['gp', 'gold'], ['ep', 'electrum'], ['sp', 'silver'], ['cp', 'copper']];
    function resultHtml(t) {
      if (!t) return '';
      var coins = COINS.filter(function (c) { return t.coins[c[0]]; }).map(function (c) { return '<span class="coin coin-' + c[0] + '"><b>' + t.coins[c[0]].toLocaleString('en') + '</b> ' + c[0] + '</span>'; }).join('');
      var vals = t.valuables.map(function (v) {
        var counts = {}; v.names.forEach(function (x) { counts[x] = (counts[x] || 0) + 1; });
        return '<li><b>' + v.n + ' ' + (v.kind === 'gem' ? 'gem' : 'art object') + (v.n > 1 ? 's' : '') + '</b> worth ' + v.value.toLocaleString('en') + ' gp each: ' +
          esc(Object.keys(counts).map(function (x) { return (counts[x] > 1 ? counts[x] + ' × ' : '') + x; }).join(', ')) + '</li>';
      }).join('');
      var items = t.items.map(function (it) {
        return '<li class="tre-item r-' + esc(it.r.replace(' ', '-').toLowerCase()) + '"><a href="' + esc(D.magicItemUrl(it.slug)) + '" target="_blank" rel="noopener"><b>' + esc(it.n) + '</b></a> <span class="small muted">' + esc(it.r + ' · ' + it.type + (it.att ? ' · attunement' : '')) + '</span></li>';
      }).join('');
      return '<div class="panel tre-result"><div class="toolbar" style="margin:0"><h3 style="margin:0">' + (t.kind === 'hoard' ? 'Hoard' : 'Pocket money') + '</h3><span class="spacer"></span><span class="muted small">≈ ' + gpValue(t).toLocaleString('en') + ' gp in coins and valuables</span></div>' +
        (coins ? '<div class="coins">' + coins + '</div>' : '<p class="muted">No coins.</p>') +
        (vals ? '<h4>Valuables</h4><ul class="tre-list">' + vals + '</ul>' : '') +
        (items ? '<h4>Magic items</h4><ul class="tre-list">' + items + '</ul>' : '') +
        (t.notes.length ? '<p class="small muted">' + esc(t.notes.join(' ')) + '</p>' : '') + '</div>';
    }
    function html() {
      var s = state(), from = s.from;
      var kindPills = '<div class="pills">' + [['pocket', 'Pocket money'], ['hoard', 'Hoard (boss or lair)']].map(function (k) { return btn('treKind', k[1], { v: k[0] }, 'pill' + (s.kind === k[0] ? ' on' : '')); }).join('') + '</div>';
      var source = from
        ? '<p>' + (from.title ? 'From the fight <b>' + esc(from.title) + '</b>: ' : 'From the fight that just ended: ') + esc(from.creatures.map(function (c) { return (c.n > 1 ? c.n + ' × ' : '') + c.name; }).join(', ')) + '. ' +
          (from.boss ? 'One of them is as strong as the party, so it counts as a <b>boss</b>.' : 'No boss, so it’s <b>pocket money</b>.') + ' ' + btn('treClear', 'Use my own settings instead', {}, 'linkbtn') + '</p>'
        : '<div class="toolbar"><label class="mon-f">Strength <select data-tre="tier">' + TIERS.map(function (x, i) { return '<option value="' + i + '"' + (s.tier === i ? ' selected' : '') + '>' + x + '</option>'; }).join('') + '</select></label>' +
          (s.kind === 'pocket' ? '<label class="mon-f">Creatures <input type="number" min="1" max="50" id="tre-count" data-tre="count" value="' + s.count + '"></label>' : '') + '</div>';
      return '<main class="mon-main tre-main"><h2>Treasures</h2><div class="panel"><p class="small muted">Pocket money is what each creature carries (bandits: a few coins). A hoard is a boss’s or lair’s stash: more coins, gems, art and magic items. Stronger creatures give more.</p>' +
        kindPills + source + '<div class="toolbar">' + btn('treRoll', '🎲 Random treasure', {}, 'btn primary') + '</div></div>' + resultHtml(s.last) +
        '<p class="small muted">The amounts are this app’s own tables, close in spirit to the Dungeon Master’s Guide. Magic items come from the item list in Characters → Items.</p></main>';
    }
    var actions = {
      treKind: function (v) { state().kind = v; },
      treRoll: function () { roll(); },
      treClear: function () { var s = state(); s.from = null; }
    };
    function onInput(t) {
      var k = t.getAttribute('data-tre'); if (k == null) return null;
      var s = state(); s[k] = Math.max(k === 'count' ? 1 : 0, Math.min(k === 'count' ? 50 : 3, Math.round(+t.value) || 0)); return k === 'count' ? 'save' : 'render';
    }
    return { html: html, actions: actions, onInput: onInput, fromEncounter: fromEncounter };
  };
  root.TreasureUI.roll = rollTreasure;
  root.TreasureUI.value = gpValue;
})(typeof window !== 'undefined' ? window : globalThis);
