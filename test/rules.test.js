// Smoke test: node test/rules.test.js
global.window = global; const fs = require('fs'), path = require('path'), assert = require('assert');
const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
[...html.matchAll(/src="(data\/[^"]+)"/g)].forEach(m => (0, eval)(fs.readFileSync(path.join(__dirname, '..', m[1]), 'utf8')));
const R = require('../js/rules.js'), D = global.DND;
const mk = o => Object.assign(R.newChar(), o);
const C = (cls, level, subclass) => ({ cls, level, subclass: subclass || '' });
assert.equal(D.spellListMisses.length, 0);

// single class: hill dwarf life cleric 5 in chain mail with a shield
let c = mk({ lineage: 'dwarf', classes: [C('cleric', 5, 'cleric:life')], armor: 'Chain Mail', shield: true, base: { STR: 14, DEX: 8, CON: 15, INT: 10, WIS: 15, CHA: 12 } });
c.sub = R.lineage('dwarf').versions[0].subs.findIndex(s => /Hill/.test(s.n));
let d = R.derive(c);
assert.equal(d.hp, 48); assert.equal(d.ac, 18); assert.equal(d.spell.dc, 14); assert.deepEqual(d.slots, [4, 3, 2]); assert.equal(d.spell.knownMax, 8);

// multiclass: fighter 5 / wizard 3 — one spellcasting class keeps its own table
const base = { STR: 15, DEX: 14, CON: 14, INT: 14, WIS: 12, CHA: 10 };
d = R.derive(mk({ classes: [C('fighter', 5, 'fighter:champion'), C('wizard', 3, 'wizard:evocation')], base }));
assert.equal(d.level, 8); assert.equal(d.pb, 3);
assert.deepEqual(d.slots, [4, 2]);
assert.equal(d.hp, 10 + 4 * 6 + 3 * 4 + 8 * 2);
assert.equal(d.hitDice, '5d10 + 3d6');
assert.deepEqual(d.prof.saves.sort(), ['CON', 'STR']);
assert.equal(d.featSlots.filter(s => s.asi).length, 1);
assert.equal(d.warnings.length, 0);
// eldritch knight adds a third of its levels
d = R.derive(mk({ classes: [C('fighter', 5, 'fighter:eldritch-knight'), C('wizard', 3)], base }));
assert.equal(d.casterLevel, 4); assert.deepEqual(d.slots, [4, 3]); assert.equal(d.casters.length, 2);
// wizard first: no heavy armor or fighter saves from the second class
d = R.derive(mk({ classes: [C('wizard', 3), C('fighter', 5)], base }));
assert.ok(d.prof.armor.indexOf('All armor') < 0 && d.prof.armor.indexOf('Medium armor') >= 0);
assert.deepEqual(d.prof.saves.sort(), ['INT', 'WIS']);
assert.equal(d.hp, 6 + 2 * 4 + 5 * 6 + 8 * 2);
// paladin 6 / sorcerer 4 -> caster level 7; warlock pact slots stay separate
d = R.derive(mk({ classes: [C('paladin', 6), C('sorcerer', 4)], base }));
assert.deepEqual(d.slots, [4, 3, 3, 1]);
assert.ok(d.warnings.some(w => /Sorcerer needs Charisma 13/.test(w)));
d = R.derive(mk({ classes: [C('warlock', 3), C('sorcerer', 5)], base }));
assert.deepEqual(d.pact, { n: 2, level: 2 }); assert.deepEqual(d.slots, [4, 3, 2]);
// artificer rounds up; total level is capped at 20
d = R.derive(mk({ classes: [C('artificer', 3), C('cleric', 1)], base }));
assert.equal(d.casterLevel, 3);
d = R.derive(mk({ classes: [C('fighter', 15), C('rogue', 15)], base }));
assert.equal(d.level, 20); assert.equal(d.classes[1].level, 5);
// unarmored defense only from the first of barbarian / monk
d = R.derive(mk({ classes: [C('monk', 1), C('barbarian', 1)], base: { STR: 13, DEX: 16, CON: 16, INT: 8, WIS: 14, CHA: 8 } }));
assert.equal(d.ac, 15);

// a save from the single-class version still loads
const old = R.upgrade({ id: 'x', level: 5, cls: 'wizard', subclass: 'wizard:evocation', base, picks: { 'cls.skills': ['Arcana', 'History'], 'asi4.a1': ['INT'] }, asi: { asi4: 'asi' }, spells: { c: ['Fire Bolt'], k: ['Shield'], p: [] } });
d = R.derive(Object.assign(R.newChar(), old));
assert.equal(d.level, 5); assert.ok(d.prof.skills.includes('Arcana')); assert.deepEqual(d.spell.cantrips, ['Fire Bolt']); assert.equal(d.abilities.INT.total, 15);

// inventory: weight, capacity, coins and attunement; old one-line coins are converted
d = R.derive(mk({ classes: [C('fighter', 1)], base, armor: 'Chain Mail', shield: true, weapons: ['Longsword'], money: { pp: 0, gp: 100, ep: 0, sp: 0, cp: 50 },
  items: [{ id: 'a', n: 'Rope', qty: 2, w: 10 }, { id: 'b', n: 'Ring', qty: 1, w: 0, att: true, attuned: true }] }));
assert.equal(d.inv.weight, 55 + 6 + 3 + 20 + 3); assert.equal(d.inv.capacity, 225); assert.equal(d.inv.attuned, 1); assert.equal(d.inv.attuneMax, 3); assert.equal(d.inv.gpValue, 100.5);
assert.deepEqual(R.upgrade({ classes: [], base, coins: '15 gp, 4 sp' }).money, { pp: 0, gp: 15, ep: 0, sp: 4, cp: 0 });
assert.ok(D.magicItems.length > 800 && D.gear.length > 90);

// every class, subclass, level and lineage option derives without error, and all choices can be filled
let n = 0;
for (const cl of D.classes) for (const s of [null, ...R.subclassesOf(cl.id)]) for (let lv = 1; lv <= 20; lv++) {
  const ch = mk({ classes: [C(cl.id, lv, s && s.id)], lineage: 'human', background: 'Acolyte' }); n++;
  if (lv % 5 && lv !== 3) { R.derive(ch); continue; }
  for (let i = 0; i < 4; i++) for (const x of R.derive(ch).choices) if (x.missing) ch.picks[x.key] = x.picked.concat(x.options.filter(o => !o.disabled && !x.picked.includes(o.v)).slice(0, x.missing).map(o => o.v));
  const left = R.derive(ch).choices.filter(x => x.missing);
  assert.equal(left.length, 0, cl.id + ' ' + (s && s.id) + ' ' + lv + ': ' + left.map(x => x.key));
}
for (const a of D.classes) for (const b of D.classes) if (a !== b) { R.derive(mk({ classes: [C(a.id, 7, (R.subclassesOf(a.id)[0] || {}).id), C(b.id, 6, (R.subclassesOf(b.id)[0] || {}).id)] })); n++; }
for (const l of D.lineages) l.versions.forEach((v, vi) => (v.subs || [0]).forEach((_, si) => { R.derive(mk({ lineage: l.id, version: vi, sub: si })); n++; }));
const longF = Object.values(D.featureText).reduce((t, o) => t + Object.keys(o).length, 0);

// appearance: every lineage gets a look and draws without errors; gear lands in the right slots
require('../js/avatar.js'); const A = global.Avatar;
const fake = () => { const px = {}; return { px, getContext: () => ({ clearRect() {}, fillRect(x, y) { px[x + ',' + y] = this.fillStyle; } }) }; };
D.lineages.forEach(l => { const ch = mk({ lineage: l.id }), dd = R.derive(ch, {}); const cv = fake(); A.draw(cv, A.look(ch, dd.lin, dd.L), A.gear(ch, D)); assert(Object.keys(cv.px).length > 300, l.id); });
require('../js/portrait.js');
D.lineages.forEach(l => { const ch = mk({ lineage: l.id, armor: 'Plate', weapons: ['Longbow'] }), dd = R.derive(ch, {}); const cv = fake(); A.drawPortrait(cv, A.look(ch, dd.lin, dd.L), A.gear(ch, D)); assert.equal(Object.keys(cv.px).length, 64 * 64, l.id); });
for (let i = 0; i < 300; i++) { const ch = mk({ lineage: D.lineages[i % D.lineages.length].id, look: A.random() }), dd = R.derive(ch, {}); ['head', 'ears', 'horns', 'acc', 'hair'].forEach(k => ch.look[k] = A.OPTIONS[k][i % A.OPTIONS[k].length][0]); const cv = fake(); A.drawPortrait(cv, A.look(ch, dd.lin, dd.L), A.gear(ch, D)); A.draw(fake(), A.look(ch, dd.lin, dd.L), A.gear(ch, D)); }
let lk = (id) => { const ch = mk({ lineage: id }), dd = R.derive(ch, {}); return A.look(ch, dd.lin, dd.L); };
assert.equal(lk('tiefling').horns, 'curled'); assert.equal(lk('dwarf').height, 'short'); assert.equal(lk('aarakocra').head, 'bird'); assert.equal(lk('harengon').ears, 'rabbit');
let gc = mk({ armor: 'Plate', shield: true, weapons: ['Longsword', 'Longbow'], items: [
  { id: 'x1', k: 'magic', n: 'Cloak of Protection', r: 'Uncommon' }, { id: 'x2', k: 'magic', n: 'Boots of Speed', r: 'Rare' }, { id: 'x3', k: 'magic', n: 'Ring of Protection', r: 'Rare' },
  { id: 'x4', k: 'magic', n: 'Amulet of Health', r: 'Rare' }, { id: 'x5', k: 'gear', n: 'Rope, hempen (50 feet)' }], look: { hidden: { x2: 1 } } });
let gg = A.gear(gc, D);
assert.equal(gg.armor, 'heavy'); assert(gg.shield); assert.equal(gg.main.kind, 'sword'); assert.equal(gg.back.kind, 'bow');
assert(gg.slots.cloak && gg.slots.ring && gg.slots.neck && !gg.slots.boots, 'slots ' + Object.keys(gg.slots));
assert.equal(A.gear(mk({ weapons: ['Rapier', 'Dagger'] }), D).off.kind, 'dagger');
// a skill picked in one step is greyed out in the others, with the reason
let gx = mk({ lineage: 'half-elf', classes: [C('rogue', 1)], background: 'Sailor', picks: { 'cls.rogue.skills': ['Stealth', 'Insight', 'Deception', 'Acrobatics'] } });
let gd = R.derive(gx, {}), linSk = gd.choices.find(c => c.key === 'lin.skill0');
assert(linSk.options.find(o => o.v === 'Stealth').disabled && /Rogue/.test(linSk.options.find(o => o.v === 'Stealth').why));
assert(/Sailor/.test(linSk.options.find(o => o.v === 'Perception').why));
gx.picks['lin.skill0'] = ['History', 'Investigation']; gd = R.derive(gx, {});
assert.deepEqual(gd.choices.find(c => c.key === 'lin.skill0').picked, ['History', 'Investigation']);
assert(gd.choices.find(c => c.key === 'cls.rogue.skills').options.find(o => o.v === 'Investigation').disabled);
gx.background = 'Urchin'; gx.picks['cls.rogue.skills'] = ['Stealth', 'Insight', 'Deception', 'Acrobatics']; gd = R.derive(gx, {}); // Urchin gives Stealth
assert(!gd.choices.find(c => c.key === 'cls.rogue.skills').picked.includes('Stealth') && gd.warnings.some(w => /Stealth was dropped/.test(w)));

// offline copy: every file the page loads must be in the service worker's list
const sw = fs.readFileSync(path.join(__dirname, '../sw.js'), 'utf8');
[...html.matchAll(/(?:src|href)="((?:data|js|css|icons)\/[^"]+)"/g)].forEach(m => assert(sw.includes("'" + m[1] + "'"), 'sw.js is missing ' + m[1]));
console.log('ok —', n, 'builds derived;', D.classes.length, 'classes,', D.subclasses.length, 'subclasses,', D.lineages.length, 'lineages,', D.backgrounds.length, 'backgrounds,', D.feats.length, 'feats,', Object.keys(D.spells).length, 'spells (' + Object.keys(D.spellText).length + ' described),', longF, 'detailed features');
