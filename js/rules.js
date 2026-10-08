// Rules engine: turns a saved character (a plain object of picks) into a fully derived sheet.
// No DOM access here, so it also runs under Node for testing.
(function (root) {
  'use strict';
  var D = root.DND;
  var AB = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'];
  var R = {};

  R.mod = function (score) { return Math.floor((score - 10) / 2); };
  R.fmt = function (n) { return (n >= 0 ? '+' : '') + n; };
  R.pb = function (level) { return 2 + Math.floor((level - 1) / 4); };
  R.uid = function () { return 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); };

  R.newChar = function () {
    return {
      id: R.uid(), name: '', player: '', alignment: '',
      lineage: '', version: 0, sub: 0, flexMode: '21',
      classes: [],
      method: 'array', base: { STR: 15, DEX: 14, CON: 13, INT: 12, WIS: 10, CHA: 8 },
      asi: {}, background: '', picks: {},
      spells: {},
      armor: '', shield: false, weapons: [], eq: {}, gear: '', items: [], money: { pp: 0, gp: 0, ep: 0, sp: 0, cp: 0 },
      hpMode: 'avg', hpManual: 0,
      notes: { traits: '', ideals: '', bonds: '', flaws: '', appearance: '', backstory: '', other: '' }
    };
  };

  // Bring a character saved by an older version (one class, flat fields) up to the current shape.
  R.upgrade = function (c) {
    if (!Array.isArray(c.classes)) {
      var id = c.cls || '';
      c.classes = id ? [{ cls: id, level: c.level | 0 || 1, subclass: c.subclass || '' }] : [];
      var picks = c.picks || {}, np = {}, asi = {};
      Object.keys(picks).forEach(function (k) {
        var m;
        if (id && (m = /^(cls|sc)\.(.+)$/.exec(k))) np[m[1] + '.' + id + '.' + m[2]] = picks[k];
        else if (id && (m = /^asi(\d+)\.(.+)$/.exec(k))) np['asi.' + id + '.' + m[1] + '.' + m[2]] = picks[k];
        else np[k] = picks[k];
      });
      Object.keys(c.asi || {}).forEach(function (k) { var m = /^asi(\d+)$/.exec(k); asi[m && id ? 'asi.' + id + '.' + m[1] : k] = c.asi[k]; });
      c.picks = np; c.asi = asi;
      if (c.spells && Array.isArray(c.spells.c)) { var sp = c.spells; c.spells = {}; if (id) c.spells[id] = sp; }
      delete c.cls; delete c.level; delete c.subclass; delete c.variant;
    }
    if (!c.spells || Array.isArray(c.spells.c)) c.spells = {};
    // coins used to be one line of text
    if (!c.money) {
      c.money = { pp: 0, gp: 0, ep: 0, sp: 0, cp: 0 };
      var found = false;
      String(c.coins || '').replace(/([\d,]+)\s*(pp|gp|ep|sp|cp)\b/gi, function (m, n, u) { c.money[u.toLowerCase()] += parseInt(n.replace(/,/g, ''), 10) || 0; found = true; });
      if (c.coins && !found) c.gear = (c.gear ? c.gear + '\n' : '') + c.coins;
    }
    delete c.coins;
    if (!Array.isArray(c.items)) c.items = [];
    return c;
  };

  // ---------- lookups ----------
  R.cls = function (id) { return D.classes.filter(function (c) { return c.id === id; })[0] || null; };
  R.subclass = function (id) { return D.subclasses.filter(function (s) { return s.id === id; })[0] || null; };
  R.subclassesOf = function (cid) { return D.subclasses.filter(function (s) { return s.c === cid; }); };
  R.lineage = function (id) { return D.lineages.filter(function (l) { return l.id === id; })[0] || null; };
  R.background = function (n) { return D.backgrounds.filter(function (b) { return b.n === n; })[0] || null; };
  R.feat = function (n) { return D.feats.filter(function (f) { return f.n === n; })[0] || null; };
  R.allTools = function () { var o = []; for (var k in D.tools) o = o.concat(D.tools[k]); return o; };
  R.allLanguages = function () { return D.languages.standard.concat(D.languages.exotic, D.languages.other); };
  // What a player can pick when a rule says "a language of your choice": the standard and exotic tables only.
  // The other list (setting languages, Druidic, Thieves' Cant) is only granted by specific traits.
  R.choosableLanguages = function () { return D.languages.standard.concat(D.languages.exotic); };
  R.languageGroup = function (l) { return D.languages.standard.indexOf(l) >= 0 ? 'Standard' : D.languages.exotic.indexOf(l) >= 0 ? 'Exotic' : ''; };

  function arr(x) { return x == null ? [] : (Array.isArray(x) ? x : [x]); }
  function uniq(a) { var s = {}, o = []; a.forEach(function (x) { if (!s[x]) { s[x] = 1; o.push(x); } }); return o; }

  // Merge a lineage version with one of its subraces into a single flat record.
  R.mergeLineage = function (lin, vi, si) {
    if (!lin) return null;
    var v = lin.versions[vi] || lin.versions[0];
    var s = (v.subs && (v.subs[si] || v.subs[0])) || null;
    var m = { name: v.n, source: v.s, tag: v.tag || lin.tag, subName: s ? s.n : '', versionName: v.n };
    if (s && s.tag) m.tag = s.tag;
    var a = v.a;
    if (s && s.a) {
      if (s.replaceAsi || a === 'flex' || s.a === 'flex') a = s.a;
      else { a = Object.assign({}, a); for (var k in s.a) a[k] = (a[k] || 0) + s.a[k]; }
    }
    m.a = a || {};
    ['sz', 'sp', 'dv', 'fly', 'swim', 'climb', 'ac', 'plus2', 'naturalAC', 'naturalACcon', 'fixedAC', 'acBonus', 'initProf'].forEach(function (k) {
      m[k] = s && s[k] !== undefined ? s[k] : v[k];
    });
    ['lang', 'sk', 'res', 'imm', 'saves'].forEach(function (k) { m[k] = uniq(arr(v[k]).concat(s ? arr(s[k]) : [])); });
    ['lc', 'feat', 'hpPerLevel'].forEach(function (k) { m[k] = (v[k] || 0) + ((s && s[k]) || 0); });
    m.skc = arr(v.skc).concat(s ? arr(s.skc) : []);
    m.pick = arr(v.pick).concat(s ? arr(s.pick) : []);
    m.prof = { armor: [], weapons: [], tools: [] };
    [v.prof, s && s.prof].forEach(function (p) { if (p) for (var k in m.prof) m.prof[k] = m.prof[k].concat(p[k] || []); });
    var drop = (s && s.dropTraits) || [];
    m.tr = (v.tr || []).filter(function (t) { return drop.indexOf(t[0]) < 0; }).concat((s && s.tr) || []);
    return m;
  };

  // Work out whether a tool proficiency string is a fixed tool or a choice.
  var WORDNUM = { one: 1, two: 2, three: 3, four: 4 };
  R.parseTool = function (str) {
    var all = R.allTools(), low = str.toLowerCase();
    for (var i = 0; i < all.length; i++) if (all[i].toLowerCase() === low) return { fixed: all[i] };
    var count = WORDNUM[(low.match(/^(one|two|three|four)\b/) || [])[1]] || 1, from = [], lang = /additional language/.test(low);
    if (/artisan/.test(low)) from = from.concat(D.tools["Artisan's tools"]);
    if (/musical instrument/.test(low)) from = from.concat(D.tools['Musical instruments']);
    if (/gaming set/.test(low)) from = from.concat(D.tools['Gaming sets']);
    all.forEach(function (t) {
      var n = t.toLowerCase();
      if (low.indexOf(n) >= 0 && from.indexOf(t) < 0) from.push(t);
    });
    if (!from.length) { if (/tool|choice|origin|house/.test(low)) from = all; else return { fixed: str }; }
    return { count: count, from: from, label: str, orLanguage: lang };
  };

  // ---------- spell slots ----------
  R.slotsFor = function (kind, level) {
    if (kind === 'full') return D.fullCasterSlots[level - 1];
    if (kind === 'half') return level < 2 ? [] : D.fullCasterSlots[Math.ceil(level / 2) - 1];
    if (kind === 'half-up') return D.fullCasterSlots[Math.ceil(level / 2) - 1];
    if (kind === 'third') return D.thirdCasterSlots[level - 1].filter(function (n) { return n > 0; });
    return [];
  };

  var EXPERTISE = { rogue: [[1, 2], [6, 2]], bard: [[3, 2], [10, 2]] };
  function steps(level, table) { var n = 0; table.forEach(function (t) { if (level >= t[0]) n = t[1]; }); return n; }
  function tagOk(tag, filters) { return !filters || filters[tag || 'official'] !== false; }
  R.tagOk = tagOk;

  // ---------- multiclassing tables ----------
  // Ability score minimums (every inner list is "one of these at 13+").
  var MC_REQ = { artificer: [['INT']], barbarian: [['STR']], bard: [['CHA']], 'blood-hunter': [['INT'], ['STR', 'DEX']], cleric: [['WIS']], druid: [['WIS']],
    fighter: [['STR', 'DEX']], monk: [['DEX'], ['WIS']], paladin: [['STR'], ['CHA']], ranger: [['DEX'], ['WIS']], rogue: [['DEX']], sorcerer: [['CHA']], warlock: [['CHA']], wizard: [['INT']] };
  // Proficiencies gained when a class is added after level 1 (instead of its full starting list).
  var LM = ['Light armor', 'Medium armor', 'Shields'], SMW = ['Simple weapons', 'Martial weapons'];
  var MC_PROF = {
    artificer: { armor: LM, tools: ["Thieves' tools", "Tinker's tools"] },
    barbarian: { armor: ['Shields'], weapons: SMW },
    bard: { armor: ['Light armor'], skills: 1, skillFrom: 'any', tools: ['One musical instrument'] },
    'blood-hunter': { armor: LM, weapons: SMW },
    cleric: { armor: LM }, druid: { armor: ['Light armor', 'Medium armor', 'Shields (nonmetal)'] },
    fighter: { armor: LM, weapons: SMW }, monk: { weapons: ['Simple weapons', 'Shortswords'] }, paladin: { armor: LM, weapons: SMW },
    ranger: { armor: LM, weapons: SMW, skills: 1 }, rogue: { armor: ['Light armor'], skills: 1, tools: ["Thieves' tools"] },
    sorcerer: {}, warlock: { armor: ['Light armor'], weapons: ['Simple weapons'] }, wizard: {}
  };
  R.multiclassProf = function (id) { return MC_PROF[id] || {}; };
  R.multiclassReq = function (id) {
    return (MC_REQ[id] || []).map(function (g) { return g.map(function (a) { return D.abilityNames[a]; }).join(' or ') + ' 13'; }).join(' and ');
  };

  function normName(n) { return String(n).toLowerCase().replace(/\(optional\)/g, '').replace(/[^a-z0-9]/g, ''); }
  // Longer paraphrase for a class or subclass feature, when one was collected.
  R.longText = function (ownerId, name) {
    var t = (D.featureText || {})[ownerId];
    return (t && t[name]) || '';
  };
  R.spellText = function (name) { return (D.spellText || {})[name] || ''; };

  // Clean up the saved class list: known classes only, no duplicates, 20 levels in total.
  R.classEntries = function (ch) {
    var seen = {}, left = 20, out = [];
    arr(ch.classes).forEach(function (e) {
      var c = e && R.cls(e.cls);
      if (!c || seen[c.id] || left < 1) return;
      seen[c.id] = 1;
      var lv = Math.max(1, Math.min(left, e.level | 0 || 1));
      left -= lv;
      out.push({ cls: c, id: c.id, level: lv, subclass: e.subclass || '', first: !out.length });
    });
    return out;
  };

  // ---------- the main derivation ----------
  // Skills, tools, languages and expertise picked in one step are greyed out everywhere else.
  // A first pass finds who picked what (the earlier step keeps a duplicate); the second pass uses that.
  R.derive = function (ch, filters) {
    var first = deriveOnce(ch, filters, null), claimed = {};
    first.choices.forEach(function (c) {
      if (!c.bucket) return;
      var b = claimed[c.bucket] = claimed[c.bucket] || {};
      c.picked.forEach(function (v) { if (!b[v]) b[v] = { key: c.key, label: c.label }; });
    });
    return deriveOnce(ch, filters, claimed);
  };
  function deriveOnce(ch, filters, claimed) {
    var entries = R.classEntries(ch);
    var level = entries.reduce(function (n, e) { return n + e.level; }, 0) || 1;
    var pb = R.pb(level);
    var lin = R.lineage(ch.lineage);
    var L = R.mergeLineage(lin, ch.version, ch.sub);
    var bg = R.background(ch.background);
    var picks = ch.picks || {};
    var out = { level: level, pb: pb, classes: entries, cls: entries[0] ? entries[0].cls : null, lin: lin, L: L, bg: bg, choices: [], features: [], warnings: [] };

    var prof = { armor: [], weapons: [], tools: [], languages: [], skills: [], expertise: [], saves: [], res: [], imm: [] };
    // Limits the player switched off, and extras gained outside the normal rules (items, boons, house rules)
    var free = ch.free || {}, X = ch.extra || {}, xn = function (k) { return Math.round(+X[k] || 0); };
    var xlist = function (k) { return String(X[k] || '').split(/[,;\n]/).map(function (t) { return t.trim(); }).filter(Boolean); };
    var fixedSrc = { skills: {}, tools: {}, languages: {} };
    function fixed(bucket, list, src) { arr(list).forEach(function (v) { if (fixedSrc[bucket] && !fixedSrc[bucket][v]) fixedSrc[bucket][v] = src; }); }
    var bonus = { STR: 0, DEX: 0, CON: 0, INT: 0, WIS: 0, CHA: 0 };
    var hooks = { init: 0, speed: 0, hpPerLevel: 0, hpFlat: 0, passive: 0, unarmoredAC: 0 };
    var senses = { dv: 0 };
    var feats = [];
    var bgSpells = [];

    // A choice is a named slot the player fills from a list of options.
    function choice(key, step, label, count, options, extra) {
      var c = Object.assign({ key: key, step: step, label: label, count: count, options: options }, extra || {});
      var valid = {};
      options.forEach(function (o) { if (!o.disabled) valid[o.v] = 1; });
      c.picked = arr(picks[key]).filter(function (v) { return valid[v]; }).slice(0, count);
      c.missing = Math.max(0, count - c.picked.length);
      out.choices.push(c);
      return c;
    }
    function opts(list, known) {
      return list.map(function (v) { return { v: v, label: v, disabled: known ? known.indexOf(v) >= 0 : false }; });
    }
    function own(key) { return arr(picks[key]); }
    // options for a "pick N you don't already have" choice: things known from elsewhere are disabled
    function freshChoice(key, step, label, count, list, bucket, extra) {
      var mine = own(key);
      var known = prof[bucket].filter(function (v) { return mine.indexOf(v) < 0; });
      var cl = (claimed && claimed[bucket]) || {}, fx = fixedSrc[bucket] || {};
      var options = list.map(function (v) {
        var by = cl[v] && cl[v].key !== key ? cl[v] : null, from = fx[v];
        var dis = known.indexOf(v) >= 0 || !!by || !!from;
        return { v: v, label: v, group: bucket === 'languages' ? R.languageGroup(v) : '', disabled: dis, why: !dis ? '' : from ? 'from ' + from : by ? 'picked in ' + by.label : 'you already have it' };
      });
      var c = choice(key, step, label, count, options, Object.assign({ bucket: bucket }, extra || {}));
      if (claimed) arr(picks[key]).forEach(function (v) {
        var o = options.filter(function (x) { return x.v === v; })[0];
        if (o && o.disabled && c.picked.indexOf(v) < 0) out.warnings.push(label + ': ' + v + ' was dropped because it is already ' + (o.why === 'you already have it' ? 'yours from elsewhere' : o.why.replace(/^from /, 'from ').replace(/^picked in /, 'picked in ')) + '. Pick another one.');
      });
      prof[bucket] = uniq(prof[bucket].concat(c.picked));
      return c;
    }
    function skillList(from) { return !from || from === 'any' || from[0] === 'Any' ? Object.keys(D.skills) : from; }
    function addTools(list, keyBase, step, labelPrefix, extra) {
      var pending = [];
      arr(list).forEach(function (t, i) {
        var p = R.parseTool(t);
        if (p.fixed) { prof.tools.push(p.fixed); fixed('tools', [p.fixed], 'your ' + (step === 'background' && bg ? 'background (' + bg.n + ')' : step === 'lineage' && L ? 'lineage (' + L.name + ')' : step)); } else pending.push([p, i]);
      });
      return function () {
        pending.forEach(function (x) {
          var p = x[0];
          var from = p.orLanguage ? p.from.concat(R.choosableLanguages().filter(function (l) { return prof.languages.indexOf(l) < 0; })) : p.from;
          var c = freshChoice(keyBase + '.tool' + x[1], step, labelPrefix + ': ' + p.label, p.count, from, 'tools', extra);
          if (p.orLanguage) c.picked.forEach(function (v) {
            if (R.allLanguages().indexOf(v) >= 0) { prof.languages.push(v); prof.tools.splice(prof.tools.indexOf(v), 1); }
          });
        });
      };
    }
    var later = [], later2 = []; // "pick something new" choices run after all fixed grants are known; expertise last
    var styleKeys = [];

    // ----- lineage -----
    if (L) {
      if (L.a === 'flex') {
        if (ch.flexMode === '111') {
          choice('lin.flex111', 'lineage', 'Ability scores: +1 to three different abilities', 3, opts(AB)).picked.forEach(function (a) { bonus[a] += 1; });
        } else {
          var f2 = choice('lin.flex2', 'lineage', 'Ability scores: +2 to one ability', 1, opts(AB));
          f2.picked.forEach(function (a) { bonus[a] += 2; });
          choice('lin.flex1', 'lineage', 'Ability scores: +1 to a different ability', 1, opts(AB, f2.picked)).picked.forEach(function (a) { bonus[a] += 1; });
        }
      } else {
        for (var ak in L.a) if (bonus[ak] !== undefined) bonus[ak] += L.a[ak];
        if (L.plus2) choice('lin.plus2', 'lineage', 'Ability scores: +2 to one ability', L.plus2, opts(AB)).picked.forEach(function (a) { bonus[a] += 2; });
        if (L.ac) choice('lin.ac', 'lineage', 'Ability scores: +1 to ' + L.ac + ' other abilit' + (L.ac > 1 ? 'ies' : 'y'), L.ac,
          opts(AB, Object.keys(L.a).filter(function (k) { return L.a[k] >= 2; }))).picked.forEach(function (a) { bonus[a] += 1; });
      }
      L.pick.forEach(function (p, i) { choice('lin.pick' + i, 'lineage', p.label, 1, opts(p.from)); });
      prof.languages = prof.languages.concat(L.lang); fixed('languages', L.lang, 'your lineage (' + L.name + ')');
      prof.skills = prof.skills.concat(L.sk); fixed('skills', L.sk, 'your lineage (' + L.name + ')');
      prof.saves = prof.saves.concat(L.saves);
      prof.armor = prof.armor.concat(L.prof.armor); prof.weapons = prof.weapons.concat(L.prof.weapons);
      prof.res = prof.res.concat(L.res); prof.imm = prof.imm.concat(L.imm);
      hooks.hpPerLevel += L.hpPerLevel || 0;
      senses.dv = L.dv || 0;
      var linTools = addTools(L.prof.tools, 'lin', 'lineage', 'Lineage tool');
      later.push(function () {
        L.skc.forEach(function (s, i) { freshChoice('lin.skill' + i, 'lineage', 'Lineage skill proficienc' + (s.n > 1 ? 'ies' : 'y'), s.n, skillList(s.from), 'skills'); });
        linTools();
        if (L.lc) freshChoice('lin.lang', 'lineage', 'Lineage language' + (L.lc > 1 ? 's' : ''), L.lc, R.choosableLanguages(), 'languages');
      });
      L.tr.forEach(function (t) { out.features.push({ src: L.name, kind: 'lineage', n: t[0], t: t[1] }); });
      for (var fi = 0; fi < (L.feat || 0); fi++) feats.push({ slot: 'linfeat' + fi, step: 'lineage', label: 'Lineage feat' });
    }

    // ----- classes (one pass per class the character has levels in) -----
    entries.forEach(function (E) {
      var cls = E.cls, clv = E.level, K = 'cls.' + cls.id + '.', X = { clsId: cls.id };
      var mc = E.first ? null : (MC_PROF[cls.id] || {});
      var sc = clv >= cls.subclassLevel ? R.subclass(E.subclass) : null;
      if (sc && sc.c !== cls.id) sc = null;
      E.sc = sc;
      var fsOpts = function (list, key) {
        return list.map(function (n) {
          var taken = styleKeys.some(function (k) { return k !== key && own(k).indexOf(n) >= 0; });
          return { v: n, label: n, t: D.fightingStyles[n] || '', disabled: taken };
        });
      };

      if (E.first) {
        prof.armor = prof.armor.concat(cls.armor); prof.weapons = prof.weapons.concat(cls.weapons);
        prof.saves = prof.saves.concat(cls.saves);
      } else {
        prof.armor = prof.armor.concat(mc.armor || []); prof.weapons = prof.weapons.concat(mc.weapons || []);
      }
      prof.languages = prof.languages.concat(cls.languages || []); fixed('languages', cls.languages, 'your class (' + cls.name + ')');
      var clsTools = addTools(E.first ? cls.tools : (mc.tools || []), 'cls.' + cls.id, 'class', cls.name + ' tool', X);
      later.push(function () {
        if (E.first) freshChoice(K + 'skills', 'class', cls.name + ' skills', cls.skillChoose, skillList(cls.skillList), 'skills', X);
        else if (mc.skills) freshChoice(K + 'skills', 'class', cls.name + ' skill (multiclass)', mc.skills, skillList(mc.skillFrom || cls.skillList), 'skills', X);
        clsTools();
      });
      cls.features.forEach(function (f) {
        if (f.l > clv) return;
        if (f.grants && f.grants.saves) prof.saves = prof.saves.concat(f.grants.saves);
        if (/^Ability Score Improvement/.test(f.n)) return;
        out.features.push({ src: cls.name, kind: 'class', clsId: cls.id, n: f.n, l: f.l, t: f.t, long: R.longText(cls.id, f.n) });
      });
      cls.asiLevels.forEach(function (l) {
        if (l <= clv) feats.push({ slot: 'asi.' + cls.id + '.' + l, step: 'abilities', label: cls.name + ' level ' + l, asi: true });
      });

      if (cls.fightingStyleLevel && clv >= cls.fightingStyleLevel) {
        styleKeys.push(K + 'fs');
        choice(K + 'fs', 'class', 'Fighting Style', 1, fsOpts(cls.fightingStyles.filter(function (n) { return tagOk(/\(UA\)/.test(n) ? 'ua' : 'official', filters); }), K + 'fs'), { group: 'Fighting Style', clsId: cls.id });
      }
      var col = function (name) { var v = cls.columns[name]; v = v ? v[clv - 1] : 0; return typeof v === 'number' ? v : 0; };
      var optList = function (list, textIdx, preIdx) {
        return list.map(function (x) { return { v: x[0], label: x[0], pre: preIdx != null ? x[preIdx] : '', t: x[textIdx] }; });
      };
      var G = function (group) { return { group: group, clsId: cls.id }; };
      if (cls.id === 'warlock') {
        if (col('Invocations Known')) choice(K + 'invocations', 'class', 'Eldritch Invocations', col('Invocations Known'), optList(D.invocations, 2, 1), G('Eldritch Invocation'));
        if (clv >= 3) choice(K + 'boon', 'class', 'Pact Boon', 1, Object.keys(D.pactBoons).map(function (n) { return { v: n, label: n, t: D.pactBoons[n] }; }), G('Pact Boon'));
      }
      if (cls.id === 'sorcerer' && clv >= 3)
        choice(K + 'metamagic', 'class', 'Metamagic', steps(clv, [[3, 2], [10, 3], [17, 4]]), Object.keys(D.metamagic).map(function (n) { return { v: n, label: n, t: D.metamagic[n] }; }), G('Metamagic'));
      if (cls.id === 'artificer' && col('Infusions Known'))
        choice(K + 'infusions', 'class', 'Infusions Known', col('Infusions Known'), optList(D.infusions, 2, 1), G('Infusion'));
      if (cls.id === 'blood-hunter' && col('Blood Curses Known'))
        choice(K + 'curses', 'class', 'Blood Curses', col('Blood Curses Known'), optList(D.bloodCurses, 2, 1), G('Blood Curse'));
      if (EXPERTISE[cls.id]) later2.push(function () {
        var n = 0; EXPERTISE[cls.id].forEach(function (e) { if (clv >= e[0]) n += e[1]; });
        if (!n) return;
        var list = prof.skills.slice(); if (cls.id === 'rogue') list.push("Thieves' tools");
        freshChoice(K + 'expertise', 'class', cls.name + ' Expertise', n, list, 'expertise', X);
      });

      // subclass
      if (sc) {
        var SK = 'sc.' + cls.id + '.', g = sc.grants || {};
        prof.armor = prof.armor.concat(g.armor || []); prof.weapons = prof.weapons.concat(g.weapons || []);
        prof.languages = prof.languages.concat(g.languages || []);
        if (clv >= (g.skillsAt || 0)) { prof.skills = prof.skills.concat(g.skills || []); fixed('skills', g.skills, 'your ' + (sc ? sc.name : cls.name)); prof.expertise = prof.expertise.concat(g.expertise || []); }
        if (clv >= (g.savesAt || 0)) prof.saves = prof.saves.concat(g.saves || []);
        if (g.darkvision) senses.dv = Math.max(senses.dv, g.darkvision);
        if (g.darkvisionBonus) senses.dv = senses.dv ? senses.dv + g.darkvisionBonus : g.darkvisionBonus;
        hooks.hpFlat += (g.hpPerLevel || 0) * clv;
        if (g.unarmoredAC) hooks.unarmoredAC = Math.max(hooks.unarmoredAC, g.unarmoredAC);
        var scTools = addTools(g.tools, 'sc.' + cls.id, 'class', sc.name + ' tool', X);
        var vnames = sc.variants ? Object.keys(sc.variants) : sc.variantList;
        if (vnames) E.variant = choice(SK + 'variant', 'class', sc.variantLabel || 'Option', 1, opts(vnames), X).picked[0];
        later.push(function () {
          scTools();
          (sc.choices || []).forEach(function (c, i) {
            var key = SK + 'choice' + i, n = c.count || 1;
            if (c.counts) { n = 0; for (var lv in c.counts) if (clv >= +lv) n = c.counts[lv]; }
            if (c.l && clv < c.l) return;
            if (!n) return;
            if (c.type === 'skill') freshChoice(key, 'class', sc.name + ' skill' + (n > 1 ? 's' : ''), n, skillList(c.from), 'skills', X);
            else if (c.type === 'language') freshChoice(key, 'class', sc.name + ' language' + (n > 1 ? 's' : ''), n, R.choosableLanguages(), 'languages', X);
            else if (c.type === 'tool') freshChoice(key, 'class', sc.name + ' tool', n, c.from === 'artisan' ? D.tools["Artisan's tools"] : (Array.isArray(c.from) ? c.from : R.allTools()), 'tools', X);
            else if (c.type === 'skillOrLanguage') {
              var mine = own(key), langs = R.choosableLanguages().filter(function (l) { return prof.languages.indexOf(l) < 0 || mine.indexOf(l) >= 0; });
              var sk = skillList(c.from).filter(function (s) { return prof.skills.indexOf(s) < 0 || mine.indexOf(s) >= 0; });
              choice(key, 'class', sc.name + ': a skill or a language', n, opts(sk.concat(langs)), X).picked.forEach(function (v) {
                (D.skills[v] ? prof.skills : prof.languages).push(v);
              });
            } else if (c.type === 'fightingStyle') {
              styleKeys.push(key);
              choice(key, 'class', sc.name + ' Fighting Style', 1, fsOpts(c.from === 'class' ? cls.fightingStyles : c.from, key), G('Fighting Style'));
            } else if (c.type === 'maneuver') {
              choice(key, 'class', 'Maneuvers', n, D.maneuvers.map(function (m) { return { v: m[0], label: m[0], t: m[1] }; }), G('Maneuver'));
            }
          });
          if (sc.id === 'monk:four-elements') choice(SK + 'disciplines', 'class', 'Elemental Disciplines (plus Elemental Attunement)', steps(clv, [[3, 1], [6, 2], [11, 3], [17, 4]]),
            D.disciplines.filter(function (d) { return d[0] !== 'Elemental Attunement'; }).map(function (d) { return { v: d[0], label: d[0], pre: d[1] ? 'Level ' + d[1] : '', t: d[2], disabled: d[1] > clv }; }), G('Elemental Discipline'));
          if (sc.id === 'fighter:arcane-archer') choice(SK + 'shots', 'class', 'Arcane Shot options', steps(clv, [[3, 2], [7, 3], [10, 4], [15, 5], [18, 6]]),
            D.arcaneShots.map(function (m) { return { v: m[0], label: m[0], t: m[1] }; }), G('Arcane Shot'));
          if (sc.id === 'fighter:rune-knight') choice(SK + 'runes', 'class', 'Runes', steps(clv, [[3, 2], [7, 3], [10, 4], [15, 5]]),
            D.runes.map(function (m) { return { v: m[0], label: m[0], t: m[1] }; }), G('Rune'));
        });
        sc.features.forEach(function (f) {
          if (f.l <= clv) out.features.push({ src: sc.name, kind: 'subclass', clsId: cls.id, n: f.n, l: f.l, t: f.t, long: R.longText(sc.id, f.n) });
        });
        if (sc.id === 'monk:four-elements') { var ea = D.disciplines.filter(function (d) { return d[0] === 'Elemental Attunement'; })[0]; if (ea) out.features.push({ src: 'Elemental Discipline', kind: 'option', clsId: cls.id, n: ea[0], t: ea[2] }); }
      }
    });

    // ----- background -----
    if (bg) {
      prof.skills = prof.skills.concat(bg.sk || []); fixed('skills', bg.sk, 'your background (' + bg.n + ')');
      prof.languages = prof.languages.concat(bg.lang || []); fixed('languages', bg.lang, 'your background (' + bg.n + ')');
      var bgTools = addTools(bg.tools, 'bg', 'background', 'Background tool');
      later.push(function () {
        if (bg.skc) freshChoice('bg.skills', 'background', 'Background skill' + (bg.skc.n > 1 ? 's' : ''), bg.skc.n, skillList(bg.skc.from), 'skills');
        bgTools();
        if (bg.lc) freshChoice('bg.lang', 'background', 'Background language' + (bg.lc > 1 ? 's' : ''), bg.lc, R.choosableLanguages(), 'languages');
      });
      if (bg.f) out.features.push({ src: bg.n, kind: 'background', n: bg.f[0], t: bg.f[1] });
      (bg.feat || []).forEach(function (n, i) { feats.push({ slot: 'bgfeat' + i, step: 'background', label: 'Background feat', fixed: n }); });
      if (bg.featChoice) feats.push({ slot: 'bgfeatc', step: 'background', label: 'Background feat', from: bg.featChoice });
      if (bg.spells) for (var bl in bg.spells) bgSpells = bgSpells.concat(bg.spells[bl]);
    }

    // ----- ability score improvements and feats -----
    var featNames = D.feats.filter(function (f) { return tagOk(f.tag, filters); });
    out.feats = [];
    feats.forEach(function (slot) {
      var mode = slot.asi ? ((ch.asi || {})[slot.slot] || 'asi') : 'feat';
      slot.mode = mode;
      if (mode === 'asi') {
        ['a1', 'a2'].forEach(function (k) {
          choice(slot.slot + '.' + k, slot.step, slot.label + ': +1 to', 1, opts(AB), { asiSlot: slot.slot, inline: true }).picked.forEach(function (a) { bonus[a] += 1; });
        });
        return;
      }
      var f;
      if (slot.fixed) f = R.feat(slot.fixed);
      else {
        var list = slot.from ? slot.from.map(R.feat).filter(Boolean) : featNames;
        var fc = choice(slot.slot + '.feat', slot.step, slot.label, 1, list.map(function (x) { return { v: x.n, label: x.n + (x.pre ? '  (requires: ' + x.pre + ')' : ''), t: x.t }; }), { asiSlot: slot.slot, select: true });
        f = fc.picked.length ? R.feat(fc.picked[0]) : null;
      }
      if (!f) return;
      slot.feat = f;
      out.feats.push(f);
      out.features.push({ src: 'Feat', kind: 'feat', n: f.n, t: f.t });
      var chosenAb = null;
      if (f.asi && f.asi.length === 1 && f.asi[0] !== 'ANY') chosenAb = f.asi[0];
      else if (f.asi && f.asi.length) {
        var fa = choice(slot.slot + '.fa', slot.step, f.n + ': +1 to', 1, opts(f.asi[0] === 'ANY' ? AB : f.asi), { asiSlot: slot.slot });
        chosenAb = fa.picked[0] || null;
      }
      if (chosenAb) { bonus[chosenAb] += 1; if (f.saveFromAsi) prof.saves.push(chosenAb); }
      hooks.init += f.init || 0; hooks.speed += f.speed || 0; hooks.hpPerLevel += f.hpPerLevel || 0; hooks.passive += f.passive || 0;
      if (f.unarmoredAC) hooks.unarmoredAC = Math.max(hooks.unarmoredAC, f.unarmoredAC);
      prof.armor = prof.armor.concat(f.armor || []); prof.languages = prof.languages.concat(f.lang || []);
      later.push(function () {
        if (f.skc) freshChoice(slot.slot + '.fsk', slot.step, f.n + ': skill' + (f.skc > 1 ? 's' : ''), f.skc, Object.keys(D.skills), 'skills', { asiSlot: slot.slot });
        if (f.lc) freshChoice(slot.slot + '.flang', slot.step, f.n + ': language' + (f.lc > 1 ? 's' : ''), f.lc, R.choosableLanguages(), 'languages', { asiSlot: slot.slot });
        if (f.expertise) later2.push(function () { freshChoice(slot.slot + '.fex', slot.step, f.n + ': expertise', f.expertise, prof.skills.slice(), 'expertise', { asiSlot: slot.slot }); });
      });
    });
    out.featSlots = feats;

    later.forEach(function (fn) { fn(); });
    later2.forEach(function (fn) { fn(); });
    prof.languages = prof.languages.concat(xlist('languages')); prof.tools = prof.tools.concat(xlist('tools'));
    prof.armor = prof.armor.concat(xlist('armor')); prof.weapons = prof.weapons.concat(xlist('weapons'));
    Object.keys(X.skills || {}).forEach(function (k) { if (!D.skills[k] || !X.skills[k]) return; prof.skills.push(k); if (X.skills[k] === 'exp') prof.expertise.push(k); });
    (X.saves || []).forEach(function (a) { prof.saves.push(a); });
    ['armor', 'weapons', 'tools', 'languages', 'skills', 'expertise', 'saves', 'res', 'imm'].forEach(function (k) { prof[k] = uniq(prof[k]); });
    out.prof = prof;
    var has = function (id) { return entries.filter(function (e) { return e.id === id; })[0] || null; };

    // ----- ability scores -----
    out.abilities = {};
    AB.forEach(function (a) {
      var base = +(ch.base || {})[a] || 0, total = base + bonus[a], cap = free.abilityCap ? 30 : 20, extra = xn(a);
      if (has('barbarian') && has('barbarian').level >= 20 && (a === 'STR' || a === 'CON')) { extra += 4; cap = Math.max(cap, 24); }
      total = Math.max(1, Math.min(free.abilityCap ? 30 : cap, Math.min(cap, total) + extra));
      if (!free.abilityCap && base + bonus[a] > 20) out.warnings.push(D.abilityNames[a] + ' is capped at 20 (you can switch this limit off in Details).');
      out.abilities[a] = { base: base, bonus: total - base, total: total, mod: R.mod(total) };
    });
    var M = function (a) { return out.abilities[a].mod; };
    out.pointsSpent = AB.reduce(function (n, a) { var c = D.pointBuyCost[ch.base[a]]; return n + (c === undefined ? 99 : c); }, 0);
    if (entries.length > 1) entries.forEach(function (e) {
      var okReq = (MC_REQ[e.id] || []).every(function (g) { return g.some(function (a) { return out.abilities[a].total >= 13; }); });
      if (!okReq) out.warnings.push('Multiclassing with ' + e.cls.name + ' needs ' + R.multiclassReq(e.id) + '.');
    });

    // ----- saves, skills -----
    out.saves = {};
    AB.forEach(function (a) { var p = prof.saves.indexOf(a) >= 0; out.saves[a] = { prof: p, total: M(a) + (p ? pb : 0) }; });
    var joat = has('bard') && has('bard').level >= 2 ? Math.floor(pb / 2) : 0;
    out.skills = {};
    Object.keys(D.skills).forEach(function (s) {
      var p = prof.skills.indexOf(s) >= 0, e = p && prof.expertise.indexOf(s) >= 0;
      out.skills[s] = { ability: D.skills[s], prof: p, expertise: e, total: M(D.skills[s]) + (e ? pb * 2 : p ? pb : joat) };
    });
    out.passive = 10 + out.skills.Perception.total + hooks.passive + xn('passive');
    out.init = M('DEX') + hooks.init + joat + (L && L.initProf ? pb : 0) + xn('init');

    // ----- hit points: full die at character level 1, average for every level after -----
    var perLevel = M('CON') + hooks.hpPerLevel;
    var dice = 0, diceMax = 0;
    entries.forEach(function (e) {
      var hd = e.cls.hitDie, avg = hd / 2 + 1;
      dice += e.first ? hd + (e.level - 1) * avg : e.level * avg;
      diceMax += hd * e.level;
    });
    if (!entries.length) { dice = 8; diceMax = 8; }
    out.hitDie = entries[0] ? entries[0].cls.hitDie : 8;
    out.hitDice = entries.length ? entries.map(function (e) { return e.level + 'd' + e.cls.hitDie; }).join(' + ') : '1d8';
    out.hpAvg = dice + level * perLevel + hooks.hpFlat;
    out.hpMax = diceMax + level * perLevel + hooks.hpFlat;
    out.hp = Math.max(level, ch.hpMode === 'manual' && ch.hpManual > 0 ? (ch.hpManual | 0) : ch.hpMode === 'max' ? out.hpMax : out.hpAvg) + xn('hp');

    // ----- armor class -----
    var armor = D.armor.filter(function (a) { return a[0] === ch.armor; })[0];
    var styles = styleKeys.reduce(function (a, k) { var c = out.choices.filter(function (x) { return x.key === k; })[0]; return a.concat(c ? c.picked : []); }, []);
    var ac, acNote;
    if (armor) {
      var dex = armor[1] === 'Heavy' ? 0 : armor[4] === null ? M('DEX') : Math.min(M('DEX'), armor[4]);
      ac = armor[3] + dex; acNote = armor[0];
      if (styles.indexOf('Defense') >= 0) { ac += 1; acNote += ', Defense'; }
      if (armor[5] && out.abilities.STR.total < armor[5]) out.warnings.push(armor[0] + ' needs Strength ' + armor[5] + ' (speed is reduced by 10 ft otherwise).');
      var cat = armor[1] + ' armor';
      if (prof.armor.indexOf(cat) < 0 && prof.armor.indexOf('All armor') < 0) out.warnings.push('Not proficient with ' + cat.toLowerCase() + '.');
    } else {
      var cands = [[10 + M('DEX'), 'Unarmored']];
      // Unarmored Defense comes only from whichever of these classes was taken first
      var ud = entries.filter(function (e) { return e.id === 'barbarian' || e.id === 'monk'; })[0];
      if (ud && ud.id === 'barbarian') cands.push([10 + M('DEX') + M('CON'), 'Unarmored Defense']);
      if (ud && ud.id === 'monk' && !ch.shield) cands.push([10 + M('DEX') + M('WIS'), 'Unarmored Defense']);
      if (hooks.unarmoredAC) cands.push([hooks.unarmoredAC + M('DEX'), 'Natural resilience']);
      if (L && L.naturalAC) cands.push([L.naturalAC + M('DEX'), 'Natural armor']);
      if (L && L.naturalACcon) cands.push([L.naturalACcon + M('CON'), 'Natural armor']);
      cands.sort(function (a, b) { return b[0] - a[0]; });
      ac = cands[0][0]; acNote = cands[0][1];
    }
    if (L && L.fixedAC) { ac = L.fixedAC; acNote = 'Natural armor'; }
    if (ch.shield) {
      ac += 2; acNote += ', shield';
      if (!prof.armor.some(function (a) { return /^Shields/.test(a); })) out.warnings.push('Not proficient with shields.');
    }
    if (L && L.acBonus) ac += L.acBonus;
    if (xn('ac')) { ac += xn('ac'); acNote += ' · ' + (xn('ac') > 0 ? '+' : '') + xn('ac') + ' extra'; }
    out.ac = ac; out.acNote = acNote;

    // ----- speed and senses -----
    var speed = (L ? L.sp : 30) + hooks.speed;
    var heavy = armor && armor[1] === 'Heavy';
    if (has('barbarian') && has('barbarian').level >= 5 && !heavy) speed += 10;
    if (has('monk') && has('monk').level >= 2 && !armor && !ch.shield) speed += steps(has('monk').level, [[2, 10], [6, 15], [10, 20], [14, 25], [18, 30]]);
    speed += xn('speed');
    out.speed = speed;
    out.moves = [];
    if (L) ['fly', 'swim', 'climb'].forEach(function (k) { if (L[k]) out.moves.push(k + ' ' + (L[k] === true ? speed : L[k]) + ' ft'); });
    entries.forEach(function (e) {
      var g = e.sc && e.sc.grants;
      if (g && g.swim) out.moves.push('swim ' + g.swim + ' ft');
      if (g && g.swimEqualsWalk) out.moves.push('swim ' + speed + ' ft');
    });
    out.darkvision = senses.dv;
    out.size = L ? L.sz : 'Medium';

    // ----- weapons -----
    out.attacks = arr(ch.weapons).map(function (name) {
      var w = D.weapons.filter(function (x) { return x[0] === name; })[0];
      if (!w) return null;
      var props = w[5].toLowerCase(), ranged = /Ranged/.test(w[1]), fin = /finesse/.test(props);
      var monk = has('monk') && (w[0] === 'Shortsword' || (/Simple Melee/.test(w[1]) && !/two-handed|heavy/.test(props)));
      var ab = ranged ? 'DEX' : (fin || monk) ? (M('DEX') > M('STR') ? 'DEX' : 'STR') : 'STR';
      var plural = (w[0] + 's').toLowerCase();
      var ok = prof.weapons.some(function (p) {
        p = p.toLowerCase();
        return p === plural || (p === 'simple weapons' && /^Simple/.test(w[1])) || (p === 'martial weapons' && /^Martial/.test(w[1]));
      });
      var hit = M(ab) + (ok ? pb : 0), dmgB = M(ab);
      if (ranged && styles.indexOf('Archery') >= 0) hit += 2;
      if (!ranged && styles.indexOf('Dueling') >= 0 && !/two-handed/.test(props)) dmgB += 2;
      var dmg = w[3];
      if (/^\d+d\d+/.test(dmg)) dmg = dmg.replace(/^(\d+d\d+)/, '$1' + (dmgB ? (dmgB > 0 ? ' + ' : ' - ') + Math.abs(dmgB) : ''));
      return { name: w[0], hit: hit, damage: dmg, props: w[5], proficient: ok };
    }).filter(Boolean);

    // ----- spellcasting: one entry per class that casts, plus shared slots -----
    out.casters = [];
    var casterLevel = 0, slotClasses = 0, pact = null;
    entries.forEach(function (E) {
      var cls = E.cls, sc = E.sc, clv = E.level;
      var cast = cls.casting ? cls.casting : (sc && sc.casting ? sc.casting : null);
      if (!cast) return;
      var active = cast.cantrips[clv - 1] > 0 || (cast.known ? cast.known[clv - 1] > 0 : true) || cast.kind === 'full';
      if (cast.kind === 'half' && clv < 2) active = false;
      if (!active) return;
      var S = { clsId: cls.id, name: cast === cls.casting ? cls.name : sc.name, ability: cast.ability, kind: cast.kind, note: cast.note || '', level: clv };
      S.dc = 8 + pb + M(cast.ability) + xn('spellDC'); S.atk = pb + M(cast.ability) + xn('spellAtk');
      S.ownSlots = R.slotsFor(cast.kind, clv);
      if (cast.kind === 'pact') {
        S.pact = { n: cast.pactSlots[clv - 1], level: cast.pactLevel[clv - 1] }; S.maxLevel = S.pact.level;
        pact = pact ? { n: pact.n + S.pact.n, level: Math.max(pact.level, S.pact.level) } : S.pact;
      } else {
        S.maxLevel = S.ownSlots.length; slotClasses++;
        casterLevel += cast.kind === 'full' ? clv : cast.kind === 'half' ? Math.floor(clv / 2) : cast.kind === 'half-up' ? Math.ceil(clv / 2) : Math.floor(clv / 3);
      }
      S.cantripsMax = cast.cantrips[clv - 1] || 0;
      var names = (D.spellLists[cast.list || cls.id] || []).slice();
      (sc && sc.extraSpellLists || []).forEach(function (l) { names = names.concat(D.spellLists[l] || []); });
      var always = [];
      if (sc) {
        var tables = [sc.spells || {}];
        if (sc.variants && E.variant) tables.push(sc.variants[E.variant] || {});
        tables.forEach(function (tb) {
          for (var k in tb) {
            if (sc.expanded) { if (+k <= S.maxLevel) names = names.concat(tb[k]); }
            else if (+k <= clv) always = always.concat(tb[k]);
          }
        });
        always = always.concat(sc.bonusCantrips || []);
      }
      names = names.concat(bgSpells);
      var seen = {};
      S.list = names.map(function (n) { return D.findSpell(n) || null; }).filter(function (s) {
        if (!s || seen[s.name] || s.level > S.maxLevel || !tagOk(s.tag, filters)) return false;
        seen[s.name] = 1; return true;
      }).sort(function (a, b) { return a.level - b.level || (a.name < b.name ? -1 : 1); });
      S.always = uniq(always);
      var half = cast.kind === 'half' || cast.kind === 'half-up';
      if (cast.spellbook) { S.mode = 'spellbook'; S.knownMax = 6 + 2 * (clv - 1); S.preparedMax = Math.max(1, M(cast.ability) + clv); }
      else if (cast.prepared) { S.mode = 'prepared'; S.knownMax = Math.max(1, M(cast.ability) + (half ? Math.floor(clv / 2) : clv)); }
      else { S.mode = 'known'; S.knownMax = cast.known[clv - 1]; }
      if (free.spells) {
        S.unlimited = true;
        var seenAll = {}; S.list.forEach(function (s) { seenAll[s.name] = 1; });
        S.classList = S.list.slice();
        Object.keys(D.spells).forEach(function (k) { var s = D.spells[k]; if (s && !seenAll[s.name] && tagOk(s.tag, filters)) { seenAll[s.name] = 1; S.list.push(s); } });
        S.list.sort(function (a, b) { return a.level - b.level || (a.name < b.name ? -1 : 1); });
        S.limits = { cantrips: S.cantripsMax, known: S.knownMax, prepared: S.preparedMax };
        S.cantripsMax = 999; S.knownMax = 999; if (S.preparedMax) S.preparedMax = 999;
      }
      var inList = {}; S.list.forEach(function (s) { inList[s.name] = s; });
      var sp = (ch.spells || {})[cls.id] || {};
      S.cantrips = arr(sp.c).filter(function (n) { return inList[n] && inList[n].level === 0; }).slice(0, S.cantripsMax);
      S.known = arr(sp.k).filter(function (n) { return inList[n] && inList[n].level > 0 && S.always.indexOf(n) < 0; }).slice(0, S.knownMax);
      S.prepared = S.mode === 'spellbook' ? arr(sp.p).filter(function (n) { return S.known.indexOf(n) >= 0; }).slice(0, S.preparedMax) : [];
      S.missing = S.unlimited ? 0 : (S.cantripsMax - S.cantrips.length) + (S.knownMax - S.known.length);
      E.spell = S;
      out.casters.push(S);
    });
    // One spellcasting class uses its own table; several add up to a combined caster level.
    var one = out.casters.filter(function (s) { return !s.pact; })[0];
    out.slots = slotClasses > 1 ? (casterLevel > 0 ? D.fullCasterSlots[Math.min(20, casterLevel) - 1] : []) : (one ? one.ownSlots : []);
    out.casterLevel = slotClasses > 1 ? casterLevel : 0;
    out.pact = pact;
    out.spell = out.casters[0] || null;

    // ----- chosen options become features -----
    out.choices.forEach(function (c) {
      if (!c.group) return;
      c.picked.forEach(function (v) {
        var o = c.options.filter(function (x) { return x.v === v; })[0];
        out.features.push({ src: c.group, kind: 'option', clsId: c.clsId, n: v, t: o ? o.t : '' });
      });
    });

    // ----- class table values at each class's level -----
    out.resources = [];
    entries.forEach(function (e) {
      e.resources = [];
      for (var cn in e.cls.columns) { var cv = e.cls.columns[cn][e.level - 1]; if (cv !== '-' && cv !== 0) { e.resources.push([cn, cv]); out.resources.push([cn, cv]); } }
    });

    // ----- equipment text (starting gear comes from the first class only) -----
    out.equipment = [];
    if (entries[0]) entries[0].cls.equipment.forEach(function (line, i) {
      var o = R.parseEquip(line);
      out.equipment.push(o.length > 1 ? o[Math.min(o.length - 1, (ch.eq || {})[i] | 0)] : line);
    });
    if (bg && bg.eq) out.equipment.push(bg.eq);

    // ----- inventory: weight, carrying capacity, coins, attunement -----
    var inv = { items: [], weight: 0, attuned: 0 };
    var lb = function (v) { var m = /^(\d+)\/(\d+)/.exec(v); return m ? m[1] / m[2] : parseFloat(v) || 0; };
    if (armor) inv.weight += armor[7];
    if (ch.shield) inv.weight += D.shield.weight;
    arr(ch.weapons).forEach(function (name) { var w = D.weapons.filter(function (x) { return x[0] === name; })[0]; if (w) inv.weight += lb(w[4]); });
    arr(ch.items).forEach(function (it) {
      var q = Math.max(0, +it.qty || 0), w = Math.max(0, +it.w || 0);
      inv.weight += q * w;
      if (it.att && it.attuned) inv.attuned++;
      inv.items.push(it);
    });
    var money = ch.money || {}, coinCount = 0;
    ['pp', 'gp', 'ep', 'sp', 'cp'].forEach(function (k) { coinCount += Math.max(0, +money[k] || 0); });
    inv.coinWeight = coinCount / 50;
    inv.weight = Math.round((inv.weight + inv.coinWeight) * 100) / 100;
    inv.gpValue = Math.round(((+money.pp || 0) * 10 + (+money.gp || 0) + (+money.ep || 0) / 2 + (+money.sp || 0) / 10 + (+money.cp || 0) / 100) * 100) / 100;
    var sizeMult = /^Tiny/.test(out.size) ? 0.5 : /^(Large)/.test(out.size) ? 2 : /^Huge/.test(out.size) ? 4 : 1;
    inv.capacity = out.abilities.STR.total * 15 * sizeMult;
    inv.pushDrag = inv.capacity * 2;
    inv.attuneMax = has('artificer') ? steps(has('artificer').level, [[1, 3], [10, 4], [14, 5], [18, 6]]) : 3;
    if (inv.weight > inv.capacity) out.warnings.push('Carrying ' + inv.weight + ' lb, over your capacity of ' + inv.capacity + ' lb.');
    if (free.attune) inv.attuneMax = Infinity;
    if (inv.attuned > inv.attuneMax) out.warnings.push('Attuned to ' + inv.attuned + ' items; the limit is ' + inv.attuneMax + '.');
    out.inv = inv;

    // ----- completeness per step -----
    out.todo = { lineage: 0, 'class': 0, abilities: 0, background: 0, spells: 0, equipment: 0, details: 0 };
    if (!lin) out.todo.lineage++;
    if (!entries.length) out.todo['class']++;
    entries.forEach(function (e) { if (e.level >= e.cls.subclassLevel && !e.sc) out.todo['class']++; });
    if (!bg) out.todo.background++;
    out.choices.forEach(function (c) { out.todo[c.step] += c.missing; });
    out.casters.forEach(function (s) { out.todo.spells += Math.max(0, s.missing); });
    if (ch.method === 'pointbuy' && out.pointsSpent !== 27) out.todo.abilities++;
    if (ch.method === 'array' && AB.map(function (a) { return ch.base[a]; }).sort().join() !== D.standardArray.slice().sort().join()) out.todo.abilities++;
    return out;
  }

  // "(a) X or (b) Y" -> ["X", "Y"]
  R.parseEquip = function (line) {
    if (!/^\(a\)/.test(line)) return [line];
    return line.split(/\s*(?:,?\s*or\s+)?\([a-d]\)\s*/).filter(Boolean).map(function (s) { return s.charAt(0).toUpperCase() + s.slice(1); });
  };

  root.Rules = R;
  if (typeof module !== 'undefined' && module.exports) module.exports = R;
})(typeof window !== 'undefined' ? window : globalThis);
