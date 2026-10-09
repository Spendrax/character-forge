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
for (let i = 0; i < 300; i++) { const ch = mk({ lineage: D.lineages[i % D.lineages.length].id, look: A.random() }), dd = R.derive(ch, {}); ['head', 'ears', 'horns', 'acc', 'hair'].forEach(k => ch.look[k] = A.OPTIONS[k][i % A.OPTIONS[k].length][0]); A.draw(fake(), A.look(ch, dd.lin, dd.L), A.gear(ch, D)); }
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

// 5th Spellbook import: a made-up backup in test/fixtures (placeholder text, no real characters)
const SqliteFile = require('../js/sqlite-read.js'), I5 = require('../js/import-5e.js');
const fx = fs.readFileSync(path.join(__dirname, 'fixtures/5th-spellbook-sample.sqlite'));
const db5 = new SqliteFile(fx.buffer.slice(fx.byteOffset, fx.byteOffset + fx.length));
assert.equal(db5.all('spell').length, 7); assert.equal(db5.all('spell')[0].description.length, 5900); // long rows span several pages
const e5 = I5.read(db5); assert.equal(e5.length, 1); assert.equal(e5[0].name, 'Test Hero');
const r5 = I5.toCharacter(e5[0], R, D), d5 = R.derive(r5.ch, {});
assert.equal(r5.ch.lineage, 'dragonborn'); assert(/Brass/.test(r5.ch.picks['lin.pick0'][0]));
assert.deepEqual(r5.ch.classes.map(c => c.cls + c.level + c.subclass), ['wizard3', 'warlock2warlock:the-genie']);
assert(/Djinni/.test(r5.ch.picks['sc.warlock.variant'][0]));
const wiz = d5.casters.find(s => s.clsId === 'wizard'), wl = d5.casters.find(s => s.clsId === 'warlock');
assert.equal(d5.abilities.INT.mod, 3); assert.equal(d5.abilities.CHA.mod, 2);
assert(wiz.cantrips.includes('Fire Bolt') && wiz.known.includes('Absorb Elements') && wiz.prepared.includes('Magic Missile') && !wiz.prepared.includes('Shield'));
assert(wl.cantrips.includes('Eldritch Blast') && wl.known.includes('Hex'));
assert(!r5.skipped.some(s => s[0] === 'Cure Wounds') && r5.ch.extraSpells.some(x => x.n === 'Cure Wounds' && /Imported/.test(x.src))); // not on a class list: kept under Other spells
assert(R.derive(r5.ch, {}).innate.some(x => x.name === 'Cure Wounds' && x.kind === 'extra'));
// spells only: an existing character keeps everything but the spells of the classes in the backup
const mine = mk({ name: 'Test Hero', lineage: 'elf', classes: [C('wizard', 3), C('fighter', 2)], background: 'Sage', method: 'manual', base: { STR: 8, DEX: 14, CON: 12, INT: 17, WIS: 10, CHA: 10 }, armor: 'Leather', notes: Object.assign(R.newChar().notes, { backstory: 'mine', other: 'old note' }), spells: { wizard: { c: ['Light'], k: ['Sleep'], p: [] } } });
const up = I5.spellsInto(I5.read(db5)[0], mine, R, D).ch;
assert.equal(up.lineage, 'elf'); assert.equal(up.background, 'Sage'); assert.equal(up.base.INT, 17); assert.equal(up.armor, 'Leather'); assert.equal(up.notes.backstory, 'mine');
assert.deepEqual(up.classes.map(c => c.cls), ['wizard', 'fighter']);
assert(up.spells.wizard.k.includes('Magic Missile') && !up.spells.wizard.k.includes('Sleep'));
assert(/^old note\n\nSpells imported/.test(up.notes.other) && up.extraSpells.some(x => x.n === 'Hex' && x.src === 'Imported (Warlock)'));
assert.equal(mine.spells.wizard.k[0], 'Sleep'); // the original object is untouched
const again = I5.spellsInto(I5.read(db5)[0], up, R, D).ch; // re-importing replaces the old import note
assert.equal(again.notes.other.split('Spells imported from 5th Spellbook').length, 2);
assert.equal(again.extraSpells.filter(x => x.n === 'Hex').length, 1); // and doesn't add Other spells twice
assert.throws(() => new SqliteFile(new TextEncoder().encode('not a database at all').buffer));

// 5e Companion import: a made-up shared character in test/fixtures
const IC = require('../js/import-companion.js');
const cj = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures/5e-companion-sample.json'), 'utf8'));
assert(IC.detect(cj) && !IC.detect({ classes: [] }));
const ce = IC.read(cj)[0], cr = IC.toCharacter(ce, R, D), cc = cr.ch, cd = R.derive(cc, {});
assert.equal(cc.lineage, 'dhampir'); assert.equal(cc.background, 'Haunted One'); assert.equal(cc.alignment, 'Lawful Good');
assert.deepEqual(cc.classes, [{ cls: 'cleric', level: 4, subclass: 'cleric:peace' }]);
assert.deepEqual(AB_TOTALS(cd), { STR: 8, DEX: 12, CON: 14, INT: 10, WIS: 17, CHA: 13 }); // exact totals, feat and lineage bonuses included
function AB_TOTALS(x) { const o = {}; Object.keys(x.abilities).forEach(k => o[k] = x.abilities[k].total); return o; }
['Insight', 'Medicine', 'Persuasion', 'Religion', 'Survival'].forEach(k => assert(cd.skills[k].prof, k));
assert(!cd.skills.Arcana.prof); assert(cd.prof.languages.includes('Abyssal'));
assert.equal(cc.picks['asi.cleric.4.feat'][0], 'Observant');
assert.equal(cc.armor, 'Scale Mail'); assert(cc.shield); assert(cc.weapons.includes('Mace'));
const inames = cc.items.map(i => i.n);
assert(inames.includes('Oil (flask)') && inames.includes('Steel Mirror') && inames.includes('Torch') && inames.includes('Lucky pebble') && !inames.includes('Odd stick'));
assert(cd.attacks.some(a => a.name === 'Odd stick' && /^1d4/.test(a.damage) && /bludgeoning/.test(a.damage) && a.custom)); // homebrew weapon -> own weapon
assert.deepEqual(cc.money, { pp: 1, gp: 12, ep: 0, sp: 3, cp: 0 });
assert.equal(cc.notes.traits, 'Calm.'); assert(/Remember the bridge/.test(cc.notes.other) && !/\bold\b/.test(cc.notes.other.split('Notes from 5e Companion')[1]));
const cs = cd.casters[0]; assert(cs.cantrips.includes('Guidance') && cs.known.includes('Bless') && cs.always.includes('Heroism'));
assert(!cr.skipped.some(x => x[0] === 'Fireball') && cc.extraSpells.some(x => x.n === 'Fireball')); assert(/^data:image\/jpeg;base64,/.test(cr.picture));
const cu = I5.spellsInto(ce, mk({ name: 'Other', classes: [C('cleric', 4, 'cleric:life')], background: 'Acolyte' }), R, D).ch;
assert.equal(cu.background, 'Acolyte'); assert.equal(cu.classes[0].subclass, 'cleric:life'); assert(cu.spells.cleric.c.includes('Guidance') && !cu.spells.cleric.k.includes('Bless')); // Bless is already a Life Domain spell assert(/from 5e Companion/.test(cu.notes.other));

// limits switched off, and extras
const wiz1 = ['Magic Missile', 'Shield', 'Sleep', 'Burning Hands', 'Charm Person', 'Detect Magic', 'Feather Fall', 'Mage Armor'];
const fr = mk({ lineage: 'human', classes: [C('wizard', 1)], method: 'manual', base: { STR: 20, DEX: 10, CON: 10, INT: 16, WIS: 10, CHA: 10 }, spells: { wizard: { c: [], k: wiz1.concat(['Cure Wounds', 'Fireball']), p: [] } } });
let fd = R.derive(fr, {});
assert.equal(fd.abilities.STR.total, 20); assert.equal(fd.casters[0].known.length, 6); // a level-1 spellbook holds 6
fr.free = { spells: true, abilityCap: true }; fr.extra = { STR: 3, ac: 1, hp: 5, speed: 10, init: 2, passive: 1, spellDC: 1, spellAtk: 1, skills: { Stealth: 'exp', Arcana: 'prof' }, saves: ['DEX'], languages: 'Sylvan, Thieves\' Cant' };
const fd2 = R.derive(fr, {});
assert.equal(fd2.abilities.STR.total, 24); assert.deepEqual(fd2.casters[0].known, wiz1); assert(fd2.casters[0].unlimited && fd2.casters[0].missing === 0); // no maximum, but still only wizard spells of a level you can cast
assert.equal(fd2.ac, fd.ac + 1); assert.equal(fd2.hp, fd.hp + 5); assert.equal(fd2.speed, fd.speed + 10); assert.equal(fd2.casters[0].dc, fd.casters[0].dc + 1);
assert(fd2.skills.Stealth.expertise && fd2.skills.Arcana.prof && fd2.saves.DEX.prof && fd2.prof.languages.includes('Sylvan'));
fr.hpMode = 'manual'; fr.hpManual = 99; assert.equal(R.derive(fr, {}).hp, 104); // manual maximum + the extra 5

// own armour and weapons
const ow = mk({ lineage: 'human', classes: [C('fighter', 1)], method: 'manual', base: { STR: 16, DEX: 14, CON: 14, INT: 10, WIS: 10, CHA: 10 } });
ow.customArmor = [{ id: 'a1', n: 'Dragon scale', kind: 'Medium', ac: 14, dex: '2', bonus: 1, str: 0, w: 20 }]; ow.armor = 'custom:a1'; ow.shield = true; ow.shieldBonus = 3;
ow.customWeapons = [{ id: 'w1', n: 'Moon blade', dmg: '1d10', type: 'Radiant', ranged: false, ability: 'finesse', prof: true, hit: 1, dmgBonus: 2, props: 'Versatile', w: 3 }];
const owd = R.derive(ow, {});
assert.equal(owd.ac, 14 + 2 + 1 + 3); assert(/Dragon scale/.test(owd.acNote));
const mb = owd.attacks.find(a => a.name === 'Moon blade');
assert.equal(mb.hit, 3 + 2 + 1); assert.equal(mb.damage, '1d10 + 5 radiant'); // STR +3 (17 with human +1) + 2 bonus
assert(owd.inv.weight >= 23);

// Mage Armor: 13 + Dex with no armor, a shield still adds
const ma = mk({ lineage: 'human', classes: [C('wizard', 1)], method: 'manual', base: { STR: 8, DEX: 15, CON: 12, INT: 16, WIS: 10, CHA: 10 }, armor: 'spell:mage-armor', spells: { wizard: { c: [], k: ['Mage Armor'], p: ['Mage Armor'] } } });
let mad = R.derive(ma, {}); assert.equal(mad.ac, 13 + 3); assert(/Mage Armor/.test(mad.acNote)); assert(!mad.warnings.some(w => /Mage Armor/.test(w)));
ma.shield = true; assert.equal(R.derive(ma, {}).ac, 18);
ma.spells = {}; assert(R.derive(ma, {}).warnings.some(w => /Mage Armor is on/.test(w)));

// offline copy: every file the page loads must be in the service worker's list
const sw = fs.readFileSync(path.join(__dirname, '../sw.js'), 'utf8');
[...html.matchAll(/(?:src|href)="((?:data|js|css|icons)\/[^"]+)"/g)].forEach(m => assert(sw.includes("'" + m[1] + "'"), 'sw.js is missing ' + m[1]));
// Spells from the lineage and feats, and spells the player adds: they show on My spells with the right level and DC
{
  const sp = R.spellsInText('Know Thaumaturgy. Cast Hellish Rebuke (3rd level, as a 2nd-level spell) and Darkness (5th level) once each per long rest, using Charisma.');
  assert.deepEqual(sp.spells.map(x => x.name + '@' + x.minLevel), ['Thaumaturgy@1', 'Hellish Rebuke@3', 'Darkness@5']);
  assert.equal(sp.spells[1].per, '1/long rest'); assert.equal(sp.spells[0].ability, 'Charisma');
  assert.deepEqual(R.spellsInText('Cast Comprehend Languages (and Magic Mouth from 3rd level) once each per long rest, using Intelligence.').spells.map(x => x.minLevel), [1, 3]);
  assert.equal(R.spellsInText('Cast Animal Friendship on snakes at will, and Suggestion once per long rest from 3rd level.').spells[0].per, 'at will');
  assert.equal(R.spellsInText('Lightly obscured areas, Light armor proficiency.').spells.length, 0);
  // drow elf rogue 4 with CHA 14: Dancing Lights now, Faerie Fire at 3, Darkness waits for 5
  const drow = mk({ lineage: 'elf', sub: 2, classes: [C('rogue', 4)], base: { STR: 10, DEX: 15, CON: 12, INT: 10, WIS: 10, CHA: 13 } });
  let dd = R.derive(drow);
  const by = n => dd.innate.find(x => x.name === n);
  assert(by('Dancing Lights').ready && by('Faerie Fire').ready && !by('Darkness').ready);
  assert.equal(by('Faerie Fire').ab, 'CHA'); assert.equal(by('Faerie Fire').dc, 8 + 2 + 2);
  // high elf: a wizard cantrip of your choice, picked on the Lineage step
  const he = mk({ lineage: 'elf', sub: 0, classes: [C('fighter', 1)] });
  dd = R.derive(he);
  const hc = dd.choices.find(c => c.spellChoice && c.step === 'lineage');
  assert(hc && hc.missing === 1 && hc.options.some(o => o.v === 'Fire Bolt') && !hc.options.some(o => o.v === 'Cure Wounds'));
  he.picks[hc.key] = ['Fire Bolt']; dd = R.derive(he);
  assert(dd.innate.some(x => x.name === 'Fire Bolt' && x.ab === 'INT')); assert.equal(dd.choices.find(c => c.key === hc.key).missing, 0);
  // fairy: lineage spells use the ability chosen with the lineage
  const fa = mk({ lineage: 'fairy', classes: [C('fighter', 5)] });
  dd = R.derive(fa); assert(dd.choices.some(c => c.key === 'lin.spellab')); assert(!dd.innate.find(x => x.name === 'Druidcraft').ab);
  fa.picks['lin.spellab'] = ['WIS']; dd = R.derive(fa);
  assert.equal(dd.innate.find(x => x.name === 'Enlarge/Reduce').ab, 'WIS'); assert(dd.innate.find(x => x.name === 'Enlarge/Reduce').ready);
  // a feat: Fey Touched gives Misty Step
  const ft = mk({ lineage: 'dwarf', classes: [C('fighter', 4)], picks: { 'asi.fighter.4.feat': ['Fey Touched'], 'asi.fighter.4.fa': ['WIS'] }, asi: { 'asi.fighter.4': 'feat' } });
  dd = R.derive(ft); assert(dd.innate.some(x => x.name === 'Misty Step' && x.kind === 'feat'));
  // spells the player adds, and Mage Armor from a dragonmark counts as known
  const ward = mk({ lineage: 'dwarf', sub: 2, classes: [C('fighter', 1)], armor: 'spell:mage-armor', extraSpells: [{ id: 'x1', n: 'Shield', src: 'Ring' }] });
  dd = R.derive(ward);
  assert(dd.innate.some(x => x.name === 'Mage Armor' && x.kind === 'lineage') && dd.innate.some(x => x.name === 'Shield' && x.kind === 'extra' && x.src === 'Ring'));
  assert(!dd.warnings.some(w => /Mage Armor/.test(w)));
}

// Eldritch Adept lets you pick an invocation; ones with a prerequisite need warlock levels
{
  const ea = mk({ lineage: 'dwarf', classes: [C('wizard', 4)], asi: { 'asi.wizard.4': 'feat' }, picks: { 'asi.wizard.4.feat': ['Eldritch Adept'] } });
  let dd = R.derive(ea), c = dd.choices.find(x => x.key === 'asi.wizard.4.inv');
  assert(c && c.missing === 1 && !c.options.find(o => o.v === 'Armor of Shadows').disabled && c.options.find(o => o.v === 'Agonizing Blast').disabled);
  ea.picks['asi.wizard.4.inv'] = ['Armor of Shadows']; dd = R.derive(ea);
  assert(dd.features.some(f => f.n === 'Armor of Shadows' && f.kind === 'option'));
}
// Play: tick off slots and abilities, rests bring them back
{
  const pc = mk({ lineage: 'dragonborn', classes: [C('fighter', 3, 'fighter:eldritch-knight'), C('warlock', 2)], base: { STR: 15, DEX: 12, CON: 14, INT: 10, WIS: 10, CHA: 14 }, counters: [{ id: 'k1', n: 'Wand charges', max: 7, rest: '' }] });
  let dd = R.derive(pc), names = dd.trackers.map(x => x.key);
  ['slot1', 'pact', 'res:Second Wind', 'res:Action Surge', 'res:Breath Weapon', 'ctr:k1'].forEach(k => assert(names.includes(k), k));
  pc.track = { used: { slot1: 2, pact: 1, 'res:Second Wind': 1, 'res:Action Surge': 1, 'ctr:k1': 3 }, hp: 5, hd: 4 };
  dd = R.derive(pc); assert.equal(dd.trackers.find(x => x.key === 'slot1').left, dd.trackers.find(x => x.key === 'slot1').max - 2);
  R.rest(pc, dd, 'short');
  assert.deepEqual(Object.keys(pc.track.used).sort(), ['ctr:k1', 'slot1']); assert.equal(pc.track.hp, 5);
  R.rest(pc, R.derive(pc), 'long');
  assert.deepEqual(Object.keys(pc.track.used), ['ctr:k1']); assert.equal(pc.track.hp, null); assert.equal(pc.track.hd, 4 - 2);
  // once-per-rest lineage spells are tracked too
  dd = R.derive(mk({ lineage: 'tiefling', classes: [C('rogue', 3)] }));
  assert(dd.trackers.some(x => x.key === 'inn:Hellish Rebuke' && x.rest === 'long') && !dd.trackers.some(x => x.key === 'inn:Thaumaturgy'));
}

// Feats with choices: maneuvers, metamagic, spells, skills or tools, weapons
{
  const ft = (n, extra) => mk(Object.assign({ lineage: 'dwarf', classes: [C('fighter', 4)], asi: { 'asi.fighter.4': 'feat' }, picks: { 'asi.fighter.4.feat': [n] } }, extra || {}));
  const key = k => 'asi.fighter.4.' + k;
  let c = ft('Martial Adept'), dd = R.derive(c);
  assert.equal(dd.choices.find(x => x.key === key('man')).count, 2);
  c.picks[key('man')] = ['Riposte', 'Parry']; dd = R.derive(c);
  assert(dd.features.some(f => f.n === 'Riposte' && f.src === 'Maneuver') && dd.trackers.some(t => /Superiority Die/.test(t.name) && t.rest === 'short'));
  c = ft('Metamagic Adept'); c.picks[key('mm')] = ['Quickened Spell', 'Twinned Spell']; dd = R.derive(c);
  assert(dd.features.some(f => f.n === 'Twinned Spell') && dd.trackers.some(t => /Sorcery Points/.test(t.name) && t.max === 2));
  c = ft('Magic Initiate'); c.picks[key('cls')] = ['wizard']; dd = R.derive(c);
  assert(dd.choices.find(x => x.key === key('c')).options.some(o => o.v === 'Fire Bolt') && !dd.choices.find(x => x.key === key('c')).options.some(o => o.v === 'Sacred Flame'));
  c.picks[key('c')] = ['Fire Bolt', 'Light']; c.picks[key('s')] = ['Shield']; dd = R.derive(c);
  assert(dd.innate.some(x => x.name === 'Shield' && x.ab === 'INT' && x.per === '1/long rest') && dd.trackers.some(t => t.key === 'inn:Shield'));
  c = ft('Fey Touched', { picks: { 'asi.fighter.4.feat': ['Fey Touched'], 'asi.fighter.4.fa': ['WIS'], 'asi.fighter.4.s': ['Cure Wounds'] } }); dd = R.derive(c);
  assert(dd.innate.some(x => x.name === 'Misty Step' && x.ab === 'WIS')); assert(!dd.innate.some(x => x.name === 'Cure Wounds')); // Cure Wounds is not divination or enchantment
  c.picks[key('s')] = ['Command']; dd = R.derive(c); assert(dd.innate.some(x => x.name === 'Command' && x.ab === 'WIS'));
  c = ft('Skilled'); c.picks[key('sk3')] = ['Stealth', "Thieves' tools", 'Arcana']; dd = R.derive(c);
  assert(dd.prof.skills.includes('Stealth') && dd.prof.tools.includes("Thieves' tools") && !dd.prof.skills.includes("Thieves' tools"));
  c = ft('Weapon Master', { classes: [C('wizard', 4)], asi: { 'asi.wizard.4': 'feat' }, picks: { 'asi.wizard.4.feat': ['Weapon Master'], 'asi.wizard.4.w': ['Longsword', 'Rapier', 'Whip', 'Longbow'] }, weapons: ['Longsword'] });
  dd = R.derive(c); assert(dd.attacks[0].proficient);
  c = ft('Medium Armor Master', { armor: 'Half Plate', method: 'manual', base: { STR: 10, DEX: 16, CON: 10, INT: 10, WIS: 10, CHA: 10 } }); assert.equal(R.derive(c).ac, 15 + 3);
  c = ft('Fighting Initiate', { classes: [C('wizard', 4)], asi: { 'asi.wizard.4': 'feat' }, picks: { 'asi.wizard.4.feat': ['Fighting Initiate'], 'asi.wizard.4.fs': ['Defense'] }, armor: 'Leather' });
  assert(/Defense/.test(R.derive(c).acNote));
  c = ft('Lucky'); assert(R.derive(c).trackers.some(t => t.name === 'Luck points' && t.max === 3));
}

// Monsters: the SRD list, and the dice roller used by stat blocks
{
  (0, eval)(fs.readFileSync(path.join(__dirname, '../data/monsters.js'), 'utf8'));
  require('../js/monsters.js');
  const mons = global.DND.monsters;
  assert.equal(mons.length, 334);
  const ix = global.DND.monsterIndex; assert(ix.length > 600);
  const bh = ix.find(m => m.n === 'Beholder'); assert(bh && bh.cr === 13 && bh.leg1 && /aidedd\.org\/dnd\/monstres\.php\?vo=beholder$/.test(bh.url));
  assert(!ix.some(m => mons.some(s => s.n === m.n))); // nothing listed twice
  assert(ix.every(m => m.n && m.size && m.type && m.src && m.url && !('act' in m))); // facts and a link only
  const red = mons.find(m => m.n === 'Adult Red Dragon');
  assert.equal(red.hp, 256); assert.equal(red.cr, 17); assert.deepEqual(red.ab, [27, 10, 25, 16, 13, 21]); assert(red.leg.length && /Recharge 5–6/.test(red.act.map(a => a[0]).join()));
  assert(mons.every(m => m.n && m.size && m.type && m.ac && m.hp > 0 && m.ab.length === 6 && m.se));
  const roll = global.MonsterUI.roll;
  for (let i = 0; i < 200; i++) { const r = roll('2d6+3'); assert(r.total >= 5 && r.total <= 15); }
  assert.equal(roll('1d20-2').detail.slice(-3), '− 2'); assert.equal(roll('nothing'), null);
  const sw = fs.readFileSync(path.join(__dirname, '../sw.js'), 'utf8'); assert(sw.includes("'data/monsters.js'"));
  // Paste a stat block: read a typed-out stat block (here built from the SRD) back into a monster
  const parse = global.MonsterUI.parse, A6 = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'], sg = n => (n >= 0 ? '+' : '') + n;
  const asText = (m, oneLine) => [m.n, m.size + ' ' + m.type + (m.sub ? ' (' + m.sub + ')' : '') + ', ' + m.al, 'Armor Class ' + m.ac, 'Hit Points ' + m.hp + ' (' + m.hd.replace(/([+-])/, ' $1 ') + ')', 'Speed ' + m.sp]
    .concat(oneLine ? [A6.join(' '), m.ab.map(x => x + ' (' + sg(Math.floor((x - 10) / 2)) + ')').join(' ')] : A6.flatMap((a, i) => [a, m.ab[i] + ' (' + sg(Math.floor((m.ab[i] - 10) / 2)) + ')']))
    .concat(m.sv ? ['Saving Throws ' + m.sv] : [], m.sk ? ['Skills ' + m.sk] : [], ['Senses ' + m.se, 'Languages ' + m.lang, 'Challenge ' + m.crs + ' (' + m.xp.toLocaleString('en') + ' XP)'])
    .concat((m.tr || []).map(b => b[0] + '. ' + b[1].split('\n')[0]), ['Actions'], m.act.map(b => b[0] + '. ' + b[1].split('\n')[0]))
    .concat(m.leg ? ['Legendary Actions', 'The ' + m.n.toLowerCase() + ' can take 3 legendary actions, choosing from the options below.'].concat(m.leg.map(b => b[0] + '. ' + b[1])) : []).join('\n');
  for (const name of ['Adult Red Dragon', 'Lich', 'Goblin', 'Vampire, Vampire Form', 'Mage']) {
    const src = mons.find(m => m.n === name);
    for (const one of [true, false]) {
      const p = parse(asText(src, one));
      assert.equal(p.n, src.n); assert.equal(p.size, src.size); assert.equal(p.ac, src.ac); assert.equal(p.hp, src.hp); assert.deepEqual(p.ab, src.ab); assert.equal(p.cr, src.cr);
      assert.deepEqual(p.act.map(b => b[0]), src.act.map(b => b[0].replace(/–/g, '-')), name);
      assert.deepEqual((p.leg || []).map(b => b[0]), (src.leg || []).map(b => b[0]), name);
    }
  }
  assert.equal(parse('just some words\nnothing here\nat all\nreally'), null);

}

console.log('ok —', n, 'builds derived;', D.classes.length, 'classes,', D.subclasses.length, 'subclasses,', D.lineages.length, 'lineages,', D.backgrounds.length, 'backgrounds,', D.feats.length, 'feats,', Object.keys(D.spells).length, 'spells (' + Object.keys(D.spellText).length + ' described),', longF, 'detailed features');
