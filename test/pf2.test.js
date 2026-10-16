// Pathfinder 2e engine: two real Pathbuilder exports must come out with Pathbuilder's numbers.
var assert = require('assert'), fs = require('fs'), path = require('path');
global.window = global;
['core', 'feats', 'spells', 'items'].forEach(function (f) { require('../data/pf2/' + f + '.js'); });
require('../js/pf2.js'); require('../js/pf2-import.js');
var PF2 = global.PF2, IMP = global.PF2Import;
function load(n) { return JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures', 'pathbuilder-' + n + '.json'))); }
var SKN = { acrobatics: 'acr', arcana: 'arc', athletics: 'ath', crafting: 'cra', deception: 'dec', diplomacy: 'dip', intimidation: 'itm', medicine: 'med', nature: 'nat', occultism: 'occ', performance: 'prf', religion: 'rel', society: 'soc', stealth: 'ste', survival: 'sur', thievery: 'thi' };

function check(name, extra) {
  var j = load(name), b = j.build, ch = IMP.fromPathbuilder(j), d = PF2.derive(ch), P = b.proficiencies;
  PF2.AB.forEach(function (a) { assert.equal(d.scores[a], b.abilities[a], name + ' ' + a); });
  assert.equal(d.ac.v, b.acTotal.acTotal, name + ' AC');
  assert.equal(d.ac.prof, b.acTotal.acProfBonus, name + ' AC proficiency');
  assert.equal(d.ac.item, b.acTotal.acItemBonus, name + ' AC item bonus');
  assert.equal(d.perception.rank * 2, P.perception, name + ' perception');
  ['fortitude', 'reflex', 'will'].forEach(function (s) { assert.equal(d.saves[s].rank * 2, P[s], name + ' ' + s); });
  ['light', 'unarmored', 'medium', 'heavy'].forEach(function (k) { assert.equal(d.defenseRanks[k].rank * 2, P[k], name + ' ' + k); });
  ['simple', 'martial', 'unarmed', 'advanced'].forEach(function (k) { assert.equal(d.attackRanks[k].rank * 2, P[k], name + ' ' + k); });
  Object.keys(SKN).forEach(function (n) { assert.equal((d.rank[SKN[n]] || 0) * 2, P[n], name + ' ' + n); });
  b.weapons.forEach(function (w) {
    var s = d.strikes.filter(function (x) { return x.g && x.g.runes && (x.n === w.display || x.w.n === w.name || x.n === w.name); })[0];
    assert.ok(s, name + ' strike ' + w.name);
    assert.equal(s.attack, w.attack, name + ' ' + w.name + ' attack');
    assert.equal(s.bonus, w.damageBonus, name + ' ' + w.name + ' damage bonus');
  });
  var c = d.casters.filter(function (x) { return !x.arch || true; });
  b.spellCasters.filter(function (sc) { return !sc.innate; }).forEach(function (sc) {
    var e = d.casters.filter(function (x) { return x.trad === sc.magicTradition; })[0];
    assert.ok(e, name + ' caster ' + sc.name);
    assert.deepEqual(e.slots.slice(1), sc.perDay.slice(1), name + ' ' + sc.name + ' slots');
    assert.equal(e.rank * 2, sc.proficiency, name + ' ' + sc.name + ' proficiency');
  });
  assert.equal(d.focusMax, b.focusPoints, name + ' focus points');
  if (extra) extra(d, ch, b);
  return d;
}
check('atala', function (d, ch) {
  var hv = d.open.filter(function (o) { return o.itemKey === 'heritage'; })[0];
  assert.equal(hv.options.filter(function (x) { return x.value === hv.value; })[0].label, 'Shield Block', 'versatile heritage feat');
  var gt = d.open.filter(function (o) { return o.itemKey === 'feat:anc1'; })[0];
  assert.equal(gt.options.filter(function (x) { return x.value === gt.value; })[0].label, 'Diehard', 'general training feat');
  assert.equal(d.saves.fortitude.v, 22); assert.equal(d.saves.reflex.v, 28); assert.equal(d.saves.will.v, 20); // as on Pathbuilder's Defense tab
  assert.equal(d.perception.v, 23); assert.equal(d.classDC.v, 33); assert.equal(d.speed.v, 35);
  assert.equal(d.hp.max, 8 + (8 + 3) * 14 + 14); // ancestry + (class + Con) × level + Toughness
  assert.ok(d.strikes.some(function (s) { return s.cond.some(function (x) { return /^3d6 precision/.test(x); }); }), 'sneak attack 3d6');
});
check('nortley', function (d) {
  assert.equal(d.hp.max, 8 + (8 + 5) * 20 + 20);
  assert.equal(d.casters[0].dc, 44); assert.equal(d.casters[0].attack, 34);
  assert.equal(d.speed.v, 30);
});

// slots tables
assert.deepEqual(PF2.slots('full2', 1), [0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
assert.deepEqual(PF2.slots('full3', 3), [0, 4, 3, 0, 0, 0, 0, 0, 0, 0, 0]);
assert.deepEqual(PF2.slots('wave', 5), [0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0]); // magus at 5th: two 2nd and two 3rd
assert.deepEqual(PF2.slots('wave', 4), [0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0]);
assert.deepEqual(PF2.slots('half', 19), [0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1]);
// a fresh character: everything starts open, nothing crashes
var n = PF2.newChar(); n.ancestry = 'elf'; n.cls = 'wizard'; n.background = 'scholar'; var dn = PF2.derive(n);
assert.ok(dn.warnings.length > 0 && dn.hp.max > 0);
// original (pre-Remaster) spells are there
['Magic Missile', 'Mage Hand', 'Burning Hands', 'Mage Armor', 'Detect Magic'].forEach(function (s) { assert.ok(PF2.byName('spells', s), s); });
['Telekinetic Hand', 'Force Barrage'].forEach(function (s) { assert.ok(!PF2.byName('spells', s), s + ' (Remaster) left out'); });
console.log('pf2 ok');
