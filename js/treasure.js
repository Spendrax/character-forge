// Treasures: quick random loot sized to a fight, with the DMG's (2014) coin, gem and art amounts
// (pocket money per creature, or a hoard for a boss) and magic items from the app's item list.
(function (root) {
  'use strict';
  function d(n, s, r) { var t = 0; for (var i = 0; i < n; i++) t += 1 + Math.floor(r() * s); return t; }
  function pick(list, r) { return list[Math.floor(r() * list.length)]; }
  function tierOf(cr) { cr = +cr || 0; return cr <= 4 ? 0 : cr <= 10 ? 1 : cr <= 16 ? 2 : 3; }
  var TIERS = ['Challenge 0–4', 'Challenge 5–10', 'Challenge 11–16', 'Challenge 17+'];
  // Creatures that don't carry money.
  var NO_POCKETS = /^(beast|ooze|plant|construct|elemental|swarm)/i;

  // Amounts follow the Dungeon Master's Guide (2014): individual treasure and treasure hoards by challenge.
  // Pocket money for one creature: [d100 up to, [[coin, dice, sides, multiplier], ...]]
  var POCKET = [
    [[30, [['cp', 5, 6, 1]]], [60, [['sp', 4, 6, 1]]], [70, [['ep', 3, 6, 1]]], [95, [['gp', 3, 6, 1]]], [100, [['pp', 1, 6, 1]]]],
    [[30, [['cp', 4, 6, 100], ['ep', 1, 6, 10]]], [60, [['sp', 6, 6, 10], ['gp', 2, 6, 10]]], [70, [['ep', 3, 6, 10], ['gp', 2, 6, 10]]], [95, [['gp', 4, 6, 10]]], [100, [['gp', 2, 6, 10], ['pp', 3, 6, 1]]]],
    [[20, [['sp', 4, 6, 100], ['gp', 1, 6, 100]]], [35, [['ep', 1, 6, 100], ['gp', 1, 6, 100]]], [75, [['gp', 2, 6, 100], ['pp', 1, 6, 10]]], [100, [['gp', 2, 6, 100], ['pp', 2, 6, 10]]]],
    [[15, [['ep', 2, 6, 1000], ['gp', 8, 6, 100]]], [55, [['gp', 1, 6, 1000], ['pp', 1, 6, 100]]], [100, [['gp', 1, 6, 1000], ['pp', 2, 6, 100]]]]
  ];
  // Hoard coins: [coin, dice, sides, multiplier]
  var HOARD = [
    [['cp', 6, 6, 100], ['sp', 3, 6, 100], ['gp', 2, 6, 10]],
    [['cp', 2, 6, 100], ['sp', 2, 6, 1000], ['gp', 6, 6, 100], ['pp', 3, 6, 10]],
    [['gp', 4, 6, 1000], ['pp', 5, 6, 100]],
    [['gp', 12, 6, 1000], ['pp', 8, 6, 1000]]
  ];
  // Gems or art in a hoard: [chance %, options [kind, count dice, sides, value each]]
  var VALUABLES = [
    [94, [['gem', 2, 6, 10], ['art', 2, 4, 25], ['gem', 2, 6, 50]]],
    [96, [['art', 2, 4, 25], ['gem', 3, 6, 50], ['gem', 3, 6, 100], ['art', 2, 4, 250]]],
    [97, [['art', 2, 4, 250], ['art', 2, 4, 750], ['gem', 3, 6, 500], ['gem', 3, 6, 1000]]],
    [98, [['gem', 3, 6, 1000], ['art', 1, 10, 2500], ['art', 1, 4, 7500], ['gem', 1, 8, 5000]]]
  ];
  var GEMS = { 10: ['Azurite', 'Banded agate', 'Hematite', 'Malachite', 'Tiger eye', 'Turquoise'], 25: ['Bloodstone', 'Carnelian', 'Jasper', 'Moonstone', 'Onyx', 'Zircon'],
    50: ['Bloodstone', 'Chalcedony', 'Citrine', 'Moonstone', 'Onyx', 'Quartz'], 100: ['Amber', 'Amethyst', 'Coral', 'Garnet', 'Jade', 'Pearl'],
    250: ['Coral', 'Pearl', 'Spinel', 'Tourmaline', 'Jet', 'Garnet'], 500: ['Alexandrite', 'Aquamarine', 'Black pearl', 'Blue spinel', 'Peridot', 'Topaz'],
    750: ['Aquamarine', 'Peridot', 'Topaz', 'Black pearl', 'Opal', 'Alexandrite'], 1000: ['Black opal', 'Blue sapphire', 'Emerald', 'Fire opal', 'Star ruby', 'Yellow sapphire'],
    2500: ['Emerald', 'Fire opal', 'Star sapphire', 'Ruby', 'Black opal', 'Blue sapphire'], 5000: ['Black sapphire', 'Diamond', 'Jacinth', 'Ruby'], 7500: ['Diamond', 'Jacinth', 'Black sapphire', 'Star ruby'] };
  var ART = ['silver ewer', 'carved bone statuette', 'gold ring set with a small stone', 'embroidered silk handkerchief', 'brass mug with jade inlay', 'small painted portrait',
    'gold locket with a lock of hair', 'silver-plated dagger', 'jeweled anklet', 'ceremonial mask', 'carved ivory comb', 'woven tapestry', 'gilded holy symbol', 'crystal goblet',
    'jeweled music box', 'electrum crown', 'gold dragon figurine', 'velvet cloak with gold thread'];
  // Magic items: [chance %, how many (dice, sides), rarity weights]. Close to the DMG hoard tables, which
  // roll on item tables A (minor) to I (legendary); here items come by rarity from the app's item list.
  var MAGIC_HOARD = [[64, 1, 4, { Common: 35, Uncommon: 45, Rare: 20 }], [72, 1, 4, { Common: 15, Uncommon: 40, Rare: 30, 'Very rare': 15 }],
    [85, 1, 4, { Uncommon: 25, Rare: 35, 'Very rare': 30, Legendary: 10 }], [98, 1, 6, { Rare: 30, 'Very rare': 35, Legendary: 35 }]];

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
          row[1].forEach(function (c) { addCoins(out.coins, c[0], d(c[1], c[2], r) * c[3]); });
        }
      });
      if (skipped) out.notes.push(skipped + ' creature' + (skipped > 1 ? 's' : '') + ' (beasts, oozes, constructs…) carried nothing.');
      if (!carriers) out.notes.push('Nothing here carries coins. Try a hoard if they guarded a lair.');
      return out;
    }
    HOARD[tier].forEach(function (c) { addCoins(out.coins, c[0], d(c[1], c[2], r) * c[3]); });
    var v = VALUABLES[tier];
    if (r() * 100 < v[0]) {
      var o = pick(v[1], r), n = d(o[1], o[2], r), value = o[3];
      if (o[0] === 'gem') out.valuables.push({ kind: 'gem', n: n, value: value, names: Array.apply(null, Array(n)).map(function () { return pick(GEMS[value] || GEMS[50], r); }) });
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
        '<p class="small muted">Coins, gems and art follow the Dungeon Master’s Guide (2014) treasure tables. Magic items are picked by rarity from the item list in Characters → Items, with chances close to the book’s.</p></main>';
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
