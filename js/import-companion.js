// Import characters shared from the "5e Companion App" (Android/iOS): its "share character" file is JSON.
// Builds a full Character Forge character: lineage, background, classes, ability scores, skills, languages,
// feats, armour and weapons, inventory, coins, personality, notes, spells and the character's picture.
(function (root) {
  'use strict';
  var norm = function (s) { return String(s == null ? '' : s).toLowerCase().replace(/\[[^\]]*\]/g, '').replace(/[’']/g, '').replace(/[^a-z0-9]+/g, ' ').trim(); };
  var plain = function (s) { return String(s == null ? '' : s).replace(/\s*\[[^\]]*\]\s*/g, ' ').trim(); };
  var title = function (s) { return String(s || '').toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, function (c) { return c.toUpperCase(); }); };
  var AB = { strength: 'STR', dexterity: 'DEX', constitution: 'CON', intelligence: 'INT', wisdom: 'WIS', charisma: 'CHA' };
  var parse = function (s) { if (typeof s !== 'string') return s || null; try { return JSON.parse(s); } catch (e) { return null; } };

  function isCompanion(o) { return !!o && typeof o === 'object' && o.jsonType === 'character' && Array.isArray(o.jobs); }
  function detect(o) { var list = Array.isArray(o) ? o : [o]; return list.length && list.every(isCompanion); }

  // ---------- read: one entry per character, in the same shape as the 5th Spellbook importer ----------
  function read(o) {
    var list = Array.isArray(o) ? o : [o];
    return list.filter(isCompanion).map(function (c, i) {
      var rr = parse(c.requiredRace) || {}, rb = parse(c.requiredBackground) || {};
      var jobs = (parse(c.allRequiredClasses) || {}).jobs || [];
      var jobInfo = {}; jobs.forEach(function (j) { j = parse(j); if (j && j.id) jobInfo[j.id] = j; });
      var subName = '';
      if (c.race && c.race.subraceId && Array.isArray(rr.subraces)) { var s = rr.subraces.filter(function (x) { return x.id === c.race.subraceId; })[0]; subName = s ? s.name : c.race.subraceId; }
      var classes = c.jobs.map(function (j) {
        var info = jobInfo[j.jobId] || {}, arch = (info.archetypes || []).filter(function (a) { return a.id === j.archetypeId || norm(a.id) === norm(j.archetypeId); })[0];
        var subLabel = arch ? arch.name : (j.archetypeId ? title(String(j.archetypeId).replace(new RegExp('^' + j.jobId + '_'), '').replace(/_?\[[^\]]*\]/g, '')) : '');
        return { name: plain(info.name) || title(j.jobId), jobId: j.jobId, sub: plain(subLabel), level: +j.level || 1, spells: [] };
      });
      var spells = (c.spells || []).map(function (s) { return { name: String(s.name || '').trim(), level: +s.level || 0, prepared: !!s.prepared }; }).filter(function (s) { return s.name; });
      return { id: i + 1, source: 'companion', name: c.name || 'Imported character', race: plain(rr.name) || title(String((c.race || {}).raceId || '').replace(/_?\[[^\]]*\]/g, '')), subrace: plain(subName), classes: classes, loose: spells, raw: c, bgName: plain(rb.name) || title(String((c.background || {}).backgroundId || '').replace(/_?\[[^\]]*\]/g, '')) };
    });
  }

  function summary(e) {
    return [e.race + (e.subrace ? ' (' + e.subrace + ')' : ''), e.classes.map(function (c) { return c.name + ' ' + c.level + (c.sub ? ' — ' + c.sub : ''); }).join(' / '), e.bgName].filter(Boolean).join(' · ');
  }

  // "Flask of Oil" -> "Oil (flask)", "Steel Mirror" -> "Mirror, steel", "Holy Symbol" -> "Holy symbol: …"
  function gearMatch(D, n) {
    var k = norm(n), m, cands = [k, norm(n.replace(/^(set of|a set of|a|an|some|pair of)\s+/i, ''))];
    if ((m = n.match(/^(\w+)\s+of\s+(.+)$/i))) cands.push(norm(m[2] + ' ' + m[1]));
    var w = n.trim().split(/\s+/); if (w.length === 2) cands.push(norm(w[1] + ' ' + w[0]));
    var exact = D.gear.filter(function (x) { return cands.indexOf(norm(x[0])) >= 0; })[0];
    if (exact) return exact;
    return D.gear.filter(function (x) { var g = norm(x[0]); return cands.some(function (c) { return c.length > 3 && g.indexOf(c + ' ') === 0; }); })[0] || null;
  }

  // ---------- build a character ----------
  function toCharacter(entry, R, D) {
    var I5 = root.Import5e, c = entry.raw, ch = R.newChar(), notes = [];
    ch.name = entry.name;
    ch.player = c.player || '';
    var al = String(c.alignmentName || '').toUpperCase();
    ch.alignment = al === 'NEUTRAL' || al === 'TRUE_NEUTRAL' ? 'True Neutral' : (D.alignments.filter(function (a) { return norm(a) === norm(al); })[0] || '');

    var lin = I5._findLineage(D, entry.race, entry.subrace);
    if (lin) { ch.lineage = lin.id; ch.version = lin.version; ch.sub = lin.sub; }
    else if (entry.race) notes.push('Race "' + entry.race + '" has no match here; pick a lineage.');
    var bg = D.backgrounds.filter(function (b) { return norm(b.n) === norm(entry.bgName); })[0];
    if (bg) ch.background = bg.n; else if (entry.bgName) notes.push('Background "' + entry.bgName + '" has no match here; pick one on the Background step.');

    var total = 0; ch.classes = [];
    entry.classes.forEach(function (j) {
      var cls = D.classes.filter(function (x) { return x.id === j.jobId || norm(x.name) === norm(j.name); })[0];
      if (!cls) { notes.push('Class "' + j.name + '" has no match here.'); return; }
      if (total >= 20 || ch.classes.some(function (e) { return e.cls === cls.id; })) return;
      var lv = Math.max(1, Math.min(j.level, 20 - total)); total += lv;
      var sc = I5._findSubclass(D, cls.id, j.sub);
      if (j.sub && !sc) notes.push(cls.name + ' subclass "' + j.sub + '" has no match here; pick one on the Class step.');
      ch.classes.push({ cls: cls.id, level: lv, subclass: sc ? sc.id : '' });
      j.clsId = cls.id;
    });

    // what the sheet says the character has
    var finalScore = {}; Object.keys(AB).forEach(function (k) { finalScore[AB[k]] = c[k] && +c[k].score || 10; });
    var want = { skills: [], expertise: [], languages: [], tools: [] };
    var skillName = function (t) { var n = title(t); return D.skills[n] ? n : Object.keys(D.skills).filter(function (s) { return norm(s) === norm(t); })[0]; };
    (c.skills || []).forEach(function (s) {
      var n = skillName(s.typeName), p = String(s.proficiencyName || '').toUpperCase();
      if (!n || p === 'NONE' || p === 'HALF') return;
      want.skills.push(n); if (p === 'EXPERTISE' || p === 'DOUBLE') want.expertise.push(n);
    });
    var langOf = function (n) { var all = R.allLanguages(); return all.filter(function (l) { return norm(l) === norm(n); })[0]; };
    (c.proficiencies || []).forEach(function (p) {
      if (p.typeName === 'LANGUAGE') { var l = langOf(p.name); if (l) want.languages.push(l); }
      if (p.typeName === 'TOOL') want.tools.push(p.name);
    });
    ((c.background || {}).languageProficiencies || []).forEach(function (p) { var l = langOf(p.name); if (l) want.languages.push(l); });
    ((c.race || {}).languageProficiencies || []).forEach(function (p) { var l = langOf(p.proficiency); if (l) want.languages.push(l); });
    var toolMatch = function (opt) { return want.tools.some(function (t) { return norm(t) === norm(opt) || norm(opt).indexOf(norm(t)) >= 0 || norm(t).indexOf(norm(opt)) >= 0; }); };

    // feats go into feat slots: a lineage feat first, then ability score improvements in level order
    ch.method = 'manual'; ch.base = Object.assign({}, finalScore);
    var feats = (c.feats || []).map(function (f) { return D.feats.filter(function (x) { return norm(x.n) === norm(f.name); })[0] || { missing: f.name }; });
    var slots = R.derive(ch, {}).featSlots.filter(function (s) { return !s.fixed; });
    feats.forEach(function (f) {
      if (f.missing) { notes.push('Feat "' + f.missing + '" has no match here.'); return; }
      var s = slots.shift();
      if (!s) { notes.push('No free feat slot for ' + f.n + '.'); return; }
      if (s.asi) ch.asi[s.slot] = 'feat';
      ch.picks[s.slot + '.feat'] = [f.n];
    });

    // fill open choices from the sheet. Skills, languages, tools and expertise are matched as a whole
    // (each wanted item to a choice that can hold it), so a greedy early pick can't block a later one.
    var unplaced = [];
    function match(bucket, wanted, label) {
      var d0 = R.derive(ch, {});
      var qs = d0.choices.filter(function (q) { return q.bucket === bucket && q.missing > 0; });
      var have = d0.prof[bucket] || [];
      var targets = wanted.filter(function (v, k, a) { return a.indexOf(v) === k && have.indexOf(v) < 0; });
      var units = []; qs.forEach(function (q) { for (var u = 0; u < q.missing; u++) units.push(q); });
      var ok = function (q, v) { return q.options.some(function (o) { return (o.v === v || (bucket === 'tools' && toolMatch(o.v) && norm(o.v) === norm(v))) && (!o.disabled); }); };
      var owner = {}; // target -> unit index (Kuhn's algorithm for a maximum matching)
      function tryUnit(ui, seen) {
        for (var t = 0; t < targets.length; t++) {
          var v = targets[t];
          if (seen[v] || !ok(units[ui], v)) continue;
          seen[v] = 1;
          if (owner[v] == null || tryUnit(owner[v], seen)) { owner[v] = ui; return true; }
        }
        return false;
      }
      units.forEach(function (u, ui) { tryUnit(ui, {}); });
      targets.forEach(function (v) {
        if (owner[v] == null) { unplaced.push(v + ' (' + label + ')'); return; }
        var q = units[owner[v]]; ch.picks[q.key] = (ch.picks[q.key] || q.picked.slice()).concat([v]);
      });
    }
    var toolWanted = function () {
      var d0 = R.derive(ch, {}), out = [];
      d0.choices.forEach(function (q) { if (q.bucket === 'tools') q.options.forEach(function (o) { if (toolMatch(o.v) && out.indexOf(o.v) < 0) out.push(o.v); }); });
      return out;
    };
    match('skills', want.skills, 'skill');
    match('languages', want.languages, 'language');
    match('tools', toolWanted(), 'tool');
    match('expertise', want.expertise, 'expertise');
    // +1 / +2 ability choices (from lineage or feats): any pick works because the base is set to land on the
    // sheet's totals below; prefer abilities whose total is odd (where a +1 most likely went)
    var byScore = function (opts) { return opts.slice().sort(function (a, b) { return (finalScore[b.v] % 2) - (finalScore[a.v] % 2) || finalScore[b.v] - finalScore[a.v]; }); };
    for (var pass = 0; pass < 6; pass++) {
      var d = R.derive(ch, {}), changed = false;
      d.choices.forEach(function (q) {
        if (!q.missing || q.bucket) return;
        var open = q.options.filter(function (o) { return !o.disabled && q.picked.indexOf(o.v) < 0; });
        if (!open.length || !open.every(function (o) { return finalScore[o.v] != null; })) return; // only ability-score choices
        var free = open;
        ch.picks[q.key] = q.picked.concat(byScore(free).slice(0, q.missing).map(function (o) { return o.v; }));
        changed = true;
      });
      if (!changed) break;
    }
    // ability scores: the sheet's totals are what counts, so set the base so every bonus lands on them
    d = R.derive(ch, {});
    Object.keys(finalScore).forEach(function (a) { ch.base[a] = Math.max(1, Math.min(30, finalScore[a] - (d.abilities[a].total - ch.base[a]))); });

    // armour, shield, weapons
    var arm = (c.armors || []).filter(function (a) { return a.equipped !== false; });
    arm.forEach(function (a) {
      if (/shield/i.test(a.category || a.typeName || a.name)) { ch.shield = true; if (+a.armor && +a.armor !== 2) ch.shieldBonus = +a.armor; return; }
      var m = D.armor.filter(function (x) { return norm(x[0]) === norm(a.name) || norm(x[0] + ' armor') === norm(a.name); })[0];
      if (m && !ch.armor) ch.armor = m[0];
      else if (!m && !ch.armor) { // homebrew armour becomes the character's own armour
        var kind = /heavy/i.test(a.category) ? 'Heavy' : /medium/i.test(a.category) ? 'Medium' : /light/i.test(a.category) ? 'Light' : 'Natural';
        var own = { id: R.uid(), n: a.name, kind: kind, ac: +a.armor || 10, dex: kind === 'Heavy' ? 'none' : kind === 'Medium' ? '2' : 'full', bonus: 0, str: 0, w: parseFloat(a.weight) || 0 };
        ch.customArmor = (ch.customArmor || []).concat([own]); ch.armor = 'custom:' + own.id;
      }
    });
    var used = {}; if (ch.armor) used[norm(ch.armor)] = 1; if (ch.shield) used.shield = 1;
    (c.weapons || []).forEach(function (w) {
      var m = D.weapons.filter(function (x) { return norm(x[0]) === norm(w.name); })[0];
      if (m) { if (ch.weapons.indexOf(m[0]) < 0) ch.weapons.push(m[0]); used[norm(m[0])] = 1; }
      else { // homebrew weapon becomes the character's own weapon, with its damage and bonuses
        var abName = String(w.attackAbilityName || '').toLowerCase(), abKey = Object.keys(AB).filter(function (k) { return k === abName; })[0];
        ch.customWeapons = (ch.customWeapons || []).concat([{ id: R.uid(), n: w.name, dmg: (w.damageDiceAmount || 1) + String(w.damageDiceName || 'd4').toLowerCase(), type: title(w.damageTypeName || 'Bludgeoning'),
          ranged: !!w.isRanged, ability: w.isFinesse ? 'finesse' : abKey ? AB[abKey] : 'auto', prof: w.isProficient !== false, hit: (+w.bonus || 0) + (+w.extraAttackBonus || 0), dmgBonus: +w.extraDamageBonus || 0,
          props: [w.isLight ? 'Light' : '', w.isHeavy ? 'Heavy' : '', w.isTwoHanded ? 'Two-handed' : '', w.hasReach ? 'Reach' : '', w.description || ''].filter(Boolean).join(', '), w: parseFloat(w.weight) || 0 }]);
      }
    });

    // inventory
    (c.equipment || []).forEach(function (e) {
      var it = e.item || {}, n = String(e.name || it.name || '').trim(), qty = +e.amount || 1;
      if (!n) return;
      if (used[norm(n)] || used[norm(n.replace(/ armor$/i, ''))]) { delete used[norm(n)]; return; } // already worn or wielded
      var wpn = D.weapons.filter(function (x) { return norm(x[0]) === norm(n); })[0];
      if (wpn) { if (ch.weapons.indexOf(wpn[0]) < 0) ch.weapons.push(wpn[0]); if (qty <= 1) return; }
      var g = gearMatch(D, n);
      var mi = !g && D.magicItems.filter(function (x) { return norm(x[0]) === norm(n); })[0];
      if (g) {
        var have = ch.items.filter(function (x) { return x.k === 'gear' && x.n === g[0]; })[0];
        if (have) have.qty += qty; else ch.items.push({ id: R.uid(), k: 'gear', n: g[0], cat: g[1], cost: g[2], qty: qty, w: g[3], note: '' });
      } else if (mi) ch.items.push({ id: R.uid(), k: 'magic', n: mi[0], r: mi[1][0], type: mi[2], att: !!mi[3], attuned: !!e.isAttuned, slug: mi[4], qty: qty, w: 0, note: '' });
      else ch.items.push({ id: R.uid(), k: 'custom', n: n, qty: qty, w: 0, att: !!(it.requiresAttunement), attuned: !!e.isAttuned, note: e.description || it.description || '' });
    });
    ch.money = { pp: +c.platinum || 0, gp: +c.gold || 0, ep: +c.electrum || 0, sp: +c.silver || 0, cp: +c.copper || 0 };

    // personality and notes
    ch.notes.traits = c.personalityTraits || ''; ch.notes.ideals = c.ideals || ''; ch.notes.bonds = c.bonds || ''; ch.notes.flaws = c.flaws || '';
    ch.notes.backstory = c.about || '';
    var kept = (c.notes || []).filter(function (n) { return !n.archivedString && n.text; }).map(function (n) { return n.text; });

    // spells: one list in the app, placed on whichever class has each spell
    var placed = I5.placeSpells(entry, ch, R, D);

    var lines = ['Imported from 5e Companion' + (entry.race ? ' (' + entry.race + (entry.subrace ? ', ' + entry.subrace : '') + ')' : '') + '.'];
    lines.push('Ability scores are the totals from 5e Companion. Which ability each improvement went to is not in the file, so those choices were filled to match the totals.');
    if (c.hp) lines.push('Hit points in 5e Companion: ' + c.hp + (c.baseHp ? ' (base ' + c.baseHp + ')' : '') + '. This app works out hit points from your class and Constitution.');
    notes.forEach(function (n) { lines.push(n); });
    if (unplaced.length) lines.push('On the 5e Companion sheet but no matching choice here (add them by hand if they came from a house rule or a trait this app doesn\'t offer): ' + unplaced.join(', ') + '.');
    if (placed.skipped.length) lines.push('Spells not added: ' + placed.skipped.map(function (s) { return s[0] + ' (' + s[1] + ')'; }).join('; ') + '.');
    if (kept.length) lines.push('Notes from 5e Companion:\n' + kept.join('\n'));
    ch.notes.other = lines.join('\n');

    var picture = c.image ? 'data:image/jpeg;base64,' + String(c.image).replace(/\s+/g, '') : (/^https?:/.test(c.imageUrl || '') ? '' : '');
    return { ch: ch, added: placed.added, skipped: placed.skipped, notes: notes, picture: picture };
  }

  root.ImportCompanion = { detect: detect, read: read, toCharacter: toCharacter, summary: summary };
  if (typeof module !== 'undefined') module.exports = root.ImportCompanion;
})(typeof window !== 'undefined' ? window : globalThis);
