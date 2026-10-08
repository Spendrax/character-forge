// Import characters from a "5th Spellbook" Android app backup (an SQLite file).
// Reads names, race and subrace, classes with levels and subclasses, and each class's spells,
// then builds Character Forge characters. Anything that doesn't fit is listed in the character's notes.
(function (root) {
  'use strict';
  var norm = function (s) { return String(s == null ? '' : s).toLowerCase().replace(/[’']/g, '').replace(/[^a-z0-9]+/g, ' ').trim(); };
  var spellName = function (s) { return String(s || '').replace(/\*+/g, '').replace(/\s+/g, ' ').trim(); };

  // ---------- read the backup ----------
  function read(db) {
    var has = db.tables();
    ['spell_list', 'spellbook_class', 'detalle_spell_list', 'spell', 'class', 'race'].forEach(function (t) {
      if (has.indexOf(t) < 0) throw new Error('This is not a 5th Spellbook backup (missing the ' + t + ' table).');
    });
    var by = function (rows) { var m = {}; rows.forEach(function (r) { m[r._id] = r; }); return m; };
    var spells = by(db.all('spell')), classes = by(db.all('class')), races = by(db.all('race'));
    var books = db.all('spellbook_class'), details = db.all('detalle_spell_list');
    return db.all('spell_list').map(function (sl) {
      var cls = books.filter(function (b) { return b.id_spellbook === sl._id; }).sort(function (a, b) { return a._id - b._id; }).map(function (b) {
        return { bookId: b._id, name: (classes[b.class] || {}).name || '', sub: b.subclass ? (classes[b.subclass] || {}).name || '' : '', level: +b.level || 1, mod: +b.abilityMod || 0, spells: [] };
      });
      var loose = [];
      details.filter(function (d) { return d.id_spell_list === sl._id; }).forEach(function (d) {
        var s = spells[d.id_spell]; if (!s) return;
        var x = { name: spellName(s.name), level: Math.max(0, +s.level || 0), prepared: !!d.prepared };
        var home = cls.filter(function (c) { return c.bookId === d.id_spellbook_class; })[0] || (cls.length === 1 ? cls[0] : null);
        (home ? home.spells : loose).push(x);
      });
      var race = races[+sl.race] || null, sub = sl.subrace ? races[+sl.subrace] || null : null;
      return { id: sl._id, name: sl.name || 'Imported character', level: +sl.level || 1, race: race ? race.name : '', subrace: sub ? sub.name : '', classes: cls, loose: loose };
    });
  }

  // ---------- match names to Character Forge data ----------
  function findLineage(D, race, subrace) {
    var nr = norm(race), ns = norm(subrace), byName = function (n) {
      return D.lineages.filter(function (l) { return norm(l.name) === n || norm(l.id) === n || l.versions.some(function (v) { return norm(v.n) === n; }); })[0];
    };
    var lin = (ns && byName(ns)) || byName(nr) || (nr && D.lineages.filter(function (l) { return norm(l.name).indexOf(nr) === 0; })[0]);
    if (!lin) return null;
    var res = { id: lin.id, version: 0, sub: 0, extra: '' };
    if (ns && !byName(ns)) {
      var found = false;
      lin.versions.forEach(function (v, vi) {
        (v.subs || []).forEach(function (s, si) {
          var n = norm(s.n);
          if (!found && n && (ns.indexOf(n) >= 0 || n.indexOf(ns) >= 0)) { res.version = vi; res.sub = si; found = true; }
        });
      });
      if (!found) res.extra = subrace; // e.g. a dragon colour or a human ethnicity: matched to a choice later, or noted
    }
    return res;
  }
  var SUB_PREFIX = /^(the|college of|oath of|oath of the|circle of the|circle of|path of the|path of|way of the|way of|school of|domain of|the way of)\s+/;
  function subKey(n) { return norm(String(n).replace(/\(.*?\)/g, '')).replace(SUB_PREFIX, '').replace(/\s+(domain|college|circle|oath|conclave|patron|tradition)$/, '').replace(/^the\s+/, ''); }
  function findSubclass(D, clsId, name) {
    if (!name) return null;
    var k = subKey(name), list = D.subclasses.filter(function (s) { return s.c === clsId; });
    return list.filter(function (s) { return subKey(s.name) === k; })[0] ||
      list.filter(function (s) { var t = subKey(s.name); return t && k && (t.indexOf(k) >= 0 || k.indexOf(t) >= 0); })[0] || null;
  }

  // ---------- build one character ----------
  function toCharacter(entry, R, D) {
    var ch = R.newChar(), notes = [];
    ch.name = entry.name;
    var lin = findLineage(D, entry.race, entry.subrace);
    if (lin) { ch.lineage = lin.id; ch.version = lin.version; ch.sub = lin.sub; }
    else if (entry.race) notes.push('Race "' + entry.race + (entry.subrace ? ' / ' + entry.subrace : '') + '" has no match here; pick a lineage.');
    var total = 0;
    ch.classes = [];
    entry.classes.forEach(function (c) {
      var cls = D.classes.filter(function (x) { return norm(x.name) === norm(c.name); })[0];
      if (!cls) { notes.push('Class "' + c.name + '" has no match here.'); return; }
      if (ch.classes.some(function (e) { return e.cls === cls.id; })) return;
      var lv = Math.max(1, Math.min(c.level, 20 - total)); if (total >= 20) return;
      total += lv;
      var sc = findSubclass(D, cls.id, c.sub);
      if (c.sub && !sc) notes.push(cls.name + ' subclass "' + c.sub + '" has no match here; pick one on the Class step.');
      ch.classes.push({ cls: cls.id, level: lv, subclass: sc ? sc.id : '' });
      c.clsId = cls.id; c.variant = (String(c.sub).match(/\(([^)]+)\)/) || [])[1] || '';
    });
    ch.method = 'manual'; ch.base = { STR: 10, DEX: 10, CON: 10, INT: 10, WIS: 10, CHA: 10 };

    // choices that the backup answers: dragon ancestry, subclass variants such as the Genie's kind
    var d = R.derive(ch, {});
    d.choices.forEach(function (c) {
      var want = c.step === 'lineage' && lin && lin.extra ? lin.extra : null;
      if (!want && /^sc\.[\w-]+\.variant$/.test(c.key)) { var e = entry.classes.filter(function (x) { return c.key === 'sc.' + x.clsId + '.variant'; })[0]; want = e && e.variant; }
      if (!want || c.count !== 1 || (ch.picks[c.key] || []).length) return;
      var o = c.options.filter(function (o) { return !o.disabled && norm(o.label).indexOf(norm(want)) === 0; })[0] || c.options.filter(function (o) { return !o.disabled && norm(o.label).indexOf(norm(want)) >= 0; })[0];
      if (o) { ch.picks[c.key] = [o.v]; if (c.step === 'lineage') lin.extra = ''; }
    });
    if (lin && lin.extra) notes.push('Subrace "' + lin.extra + '" kept as a note.');

    // spellcasting ability from the modifier stored in the backup
    d = R.derive(ch, {});
    var setAb = {};
    entry.classes.forEach(function (c) {
      var S = d.casters.filter(function (s) { return s.clsId === c.clsId; })[0];
      if (!S || !c.mod) return;
      var a = S.ability, target = 10 + 2 * c.mod, bonus = d.abilities[a].total - ch.base[a];
      setAb[a] = Math.max(setAb[a] || 0, Math.max(3, Math.min(20, target - bonus)));
    });
    Object.keys(setAb).forEach(function (a) { ch.base[a] = setAb[a]; });

    // spells, class by class; a spell filed under the wrong class goes to another class that has it on its list
    d = R.derive(ch, {});
    var skipped = [], added = 0, buckets = {};
    var casters = d.casters.map(function (S) { var m = {}; S.list.forEach(function (s) { m[s.name] = 1; }); return { S: S, inList: m }; });
    var bucket = function (id) { return buckets[id] = buckets[id] || { c: [], k: [], p: [] }; };
    entry.classes.concat([{ clsId: null, spells: entry.loose, name: '' }]).forEach(function (c) {
      if (!c.spells.length) return;
      var label = (D.classes.filter(function (x) { return x.id === c.clsId; })[0] || { name: c.name || 'any class' }).name;
      var own = casters.filter(function (x) { return x.S.clsId === c.clsId; });
      var order = own.concat(casters.filter(function (x) { return x.S.clsId !== c.clsId; }));
      c.spells.filter(function (s) { return s.prepared; }).concat(c.spells.filter(function (s) { return !s.prepared; })).forEach(function (s) {
        var f = D.findSpell(s.name);
        if (!f) { skipped.push([s.name, 'not in this app’s spell list']); return; }
        if (casters.some(function (x) { return x.S.always.indexOf(f.name) >= 0; })) return; // already always prepared
        var home = order.filter(function (x) { return x.inList[f.name]; })[0];
        if (!home) { skipped.push([f.name, own.length ? 'not on the ' + label + ' list at this level' : label + ' has no spellcasting at this level']); return; }
        var b = bucket(home.S.clsId);
        if (f.level === 0) { if (b.c.indexOf(f.name) < 0) b.c.push(f.name); }
        else if (b.k.indexOf(f.name) < 0) { b.k.push(f.name); if (s.prepared) b.p.push(f.name); }
      });
    });
    casters.forEach(function (x) { var b = buckets[x.S.clsId]; if (b) ch.spells[x.S.clsId] = { c: b.c, k: b.k, p: x.S.mode === 'spellbook' ? b.p : [] }; });
    // what the limits kept
    d = R.derive(ch, {});
    entry.classes.forEach(function (c) {
      var S = d.casters.filter(function (s) { return s.clsId === c.clsId; })[0], sp = ch.spells[c.clsId];
      if (!S || !sp) return;
      var kept = S.cantrips.concat(S.known);
      added += kept.length;
      sp.c.concat(sp.k).forEach(function (n) { if (kept.indexOf(n) < 0) skipped.push([n, 'over the ' + S.name + ' limit (' + (D.findSpell(n).level ? S.knownMax + ' spells' : S.cantripsMax + ' cantrips') + ')']); });
    });
    var lines = ['Imported from 5th Spellbook' + (entry.race ? ' (' + entry.race + (entry.subrace ? ', ' + entry.subrace : '') + ')' : '') + '.'];
    if (Object.keys(setAb).length) lines.push('Spellcasting ability set from the backup; other ability scores were not in the backup and start at 10.');
    else lines.push('Ability scores were not in the backup and start at 10.');
    notes.forEach(function (n) { lines.push(n); });
    if (skipped.length) lines.push('Spells not added: ' + skipped.map(function (s) { return s[0] + ' (' + s[1] + ')'; }).join('; ') + '.');
    ch.notes.other = lines.join('\n');
    return { ch: ch, added: added, skipped: skipped, notes: notes, lineageFound: !!lin };
  }

  function summary(entry) {
    return [entry.race + (entry.subrace ? ' (' + entry.subrace + ')' : ''), entry.classes.map(function (c) { return c.name + ' ' + c.level + (c.sub ? ' — ' + c.sub : ''); }).join(' / ')].filter(Boolean).join(' · ');
  }

  root.Import5e = { read: read, toCharacter: toCharacter, summary: summary, _findSubclass: findSubclass, _findLineage: findLineage };
  if (typeof module !== 'undefined') module.exports = root.Import5e;
})(typeof window !== 'undefined' ? window : globalThis);
