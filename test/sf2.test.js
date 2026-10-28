// Starfinder 2e engine: the iconic and pregenerated characters of the Foundry sf2e system (test/fixtures/sf2-pregens.json,
// their choices only) are rebuilt in the app's engine and must come out with Foundry's hit points and skill ranks.
var assert = require('assert'),
  fs = require('fs'),
  path = require('path');
global.window = global;
['core', 'feats', 'spells', 'items'].forEach(function (f) {
  require('../data/sf2/' + f + '.js');
});
require('../js/pf2.js');
require('../js/pf2-import.js');
var E = global.SF2,
  IMP = global.PF2Import;
var low = function (s) {
  return String(s || '')
    .toLowerCase()
    .trim();
};
var SLOT = { ancestry: 'anc', class: 'cls', skill: 'skill', general: 'gen', archetype: 'cls' };

// one pregenerated character → an app character
function build(p) {
  var ch = E.newChar(),
    anc = E.byName('ancestries', p.ancestry),
    her = E.byName('heritages', p.heritage),
    bg = E.byName('backgrounds', p.background),
    cls = E.byName('classes', p.class);
  assert.ok(anc && cls, p.name + ': ancestry and class');
  ch.name = p.name;
  ch.level = p.level;
  ch.ancestry = anc.id;
  if (her) ch.heritage = her.id;
  if (bg) ch.background = bg.id;
  ch.cls = cls.id;
  ch.key = cls.key.length > 1 ? cls.key[0] : '';
  // free ancestry boosts (the fixed ones come from the ancestry), background boosts in the slots that allow them
  ch.boosts.anc = p.ancBoosts.slice();
  if (p.ancAlt) {
    // the alternative: two free boosts and no flaw
    ch.boosts.ancAlt = true;
    ch.boosts.anc = p.ancAlt.slice();
  }
  ch.boosts.bg = bg
    ? bg.boosts.map(function (o) {
        var hit = p.bgBoosts.filter(function (a) {
          return o.indexOf(a) >= 0;
        })[0];
        if (hit) p.bgBoosts.splice(p.bgBoosts.indexOf(hit), 1);
        return hit || '';
      })
    : [];
  Object.keys(p.lvBoosts || {}).forEach(function (l) {
    ch.boosts.lv[l] = p.lvBoosts[l].slice();
  });
  var names = {};
  p.names.forEach(function (n) {
    names[low(n)] = 1;
  });
  p.feats.forEach(function (f) {
    var m = /^(\w+)-(\d+)$/.exec(f[1] || '');
    if (!m || !SLOT[m[1]]) return;
    // "Assurance (Arcana)": the feat, and its pick in brackets
    var e = E.byName('feats', f[0]) || E.byName('feats', f[0].replace(/\s*\([^)]*\)$/, ''));
    if (e) ch.feats[SLOT[m[1]] + m[2]] = e.id;
    var pick = /\(([^)]*)\)$/.exec(f[0]);
    if (pick) names[low(pick[1])] = 1;
  });
  // the picks inside features (fighting style, connection…): whichever option the character has an item for
  for (var round = 0; round < 6; round++) {
    var d = E.derive(ch),
      set = 0;
    d.open.forEach(function (o) {
      if (o.value !== '' && o.value != null) return;
      var hit = o.options.filter(function (op) {
        return names[low(op.label)];
      })[0];
      if (hit) {
        ch.choices[o.key] = hit.value;
        set++;
      }
    });
    if (!set) break;
  }
  // a witchwarper's key attribute: the one their boosts favour
  if (cls.key.length > 1) {
    var d0 = E.derive(ch);
    ch.key = d0.mods[cls.key[1]] > d0.mods[cls.key[0]] ? cls.key[1] : cls.key[0];
  }
  // skills
  var want = {};
  Object.keys(p.skills).forEach(function (n) {
    var k = IMP.SKN[n];
    if (k && p.skills[n]) want[k] = p.skills[n];
  });
  IMP.assignSkills(ch, want, E);
  // gear: weapons and armor with their grade, worn
  ch.gear = p.gear.reduce(function (out, g) {
    var e = E.byName('items', g[1]);
    if (e) out.push({ uid: E.uid(), id: e.id, q: g[3] || 1, worn: g[0] !== 'equipment', grade: g[2] || undefined });
    return out;
  }, []);
  return ch;
}

var fixtures = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures', 'sf2-pregens.json'), 'utf8')),
  bad = [],
  n = 0;
fixtures.forEach(function (p) {
  var ch = build(JSON.parse(JSON.stringify(p))),
    d = E.derive(ch);
  n++;
  if (d.hp.max !== p.hp) bad.push(p.name + ': HP ' + d.hp.max + ', Foundry ' + p.hp);
  Object.keys(p.skills).forEach(function (s) {
    var k = IMP.SKN[s];
    if (k && (d.rank[k] || 0) !== p.skills[s])
      bad.push(p.name + ': ' + s + ' rank ' + (d.rank[k] || 0) + ', Foundry ' + p.skills[s]);
  });
});
if (process.env.SF2_SHOW) console.log(bad.join('\n'));
assert.ok(bad.length === 0, bad.length + ' differences, e.g.\n' + bad.slice(0, 12).join('\n'));
console.log('sf2 ok: ' + n + ' pregenerated characters match');
module.exports = { build: build };
