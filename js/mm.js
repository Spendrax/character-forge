// Mutants & Masterminds 3e: hero builder, point costs and power level limits, and the rules book.
// Heroes are kept apart from the D&D characters (store.mm). Data in data/mm.js.
(function (root) {
  'use strict';
  var M = root.MM;
  var AB = M.abilities.map(function (a) { return a[0]; });
  var DEF = [['dodge', 'Dodge', 'AGL'], ['parry', 'Parry', 'FGT'], ['fort', 'Fortitude', 'STA'], ['tough', 'Toughness', 'STA'], ['will', 'Will', 'AWE']];
  var SK = {}; M.skills.forEach(function (s) { SK[s[0]] = s; });
  var ADV = {}; M.advantages.forEach(function (a) { ADV[a[0]] = a; });
  var FX = {}; M.effects.forEach(function (e) { FX[e[0]] = e; });
  var MODS = {}; M.extras.concat(M.flaws).forEach(function (m) { MODS[m[0]] = m; });
  var RANGES = ['Personal', 'Close', 'Ranged', 'Perception'];

  function uid() { return 'h' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function newHero() {
    var ab = {}; AB.forEach(function (a) { ab[a] = 0; });
    return { id: uid(), name: '', player: '', identity: '', group: '', pl: 10, extra: 0, ab: ab, def: { dodge: 0, parry: 0, fort: 0, will: 0 },
      skills: {}, spec: [{ s: 'Close Combat', n: 'Unarmed', r: 0 }], adv: [], powers: [], comp: [{ k: 'Motivation', t: '' }], notes: '', hp: 1 };
  }

  // ---------- costs ----------
  function enhancedBase(target) { var t = String(target || '').split(':')[0]; return t === 'ab' ? 2 : t === 'skill' ? 0.5 : 1; }
  function baseCost(p) {
    var e = FX[p.effect]; if (!e) return 1;
    if (p.effect === 'Enhanced Trait') return enhancedBase(p.target);
    return Array.isArray(e[5]) ? (p.base != null && e[5].indexOf(+p.base) >= 0 ? +p.base : e[5][0]) : e[5];
  }
  // Cost of a power: (base + per-rank modifiers) × rank, or 1 point per 2, 3… ranks once that drops below 1; then flat modifiers; never below 1.
  function powerCost(p) {
    var per = baseCost(p), flat = 0, rank = Math.max(1, +p.rank || 1), removable = 0;
    (p.mods || []).forEach(function (m) {
      var d = MODS[m.n]; if (!d) return; var v = +m.v, r = Math.max(1, +m.r || 1);
      if (d[1] === 'rank') per += v * r; else if (d[1] === 'flat') flat += v * r; else removable = v;
    });
    var cost = per >= 1 ? Math.ceil(per * rank - 1e-9) : per > 0 ? Math.ceil(rank * per - 1e-9) : Math.ceil(rank / (2 - per));
    cost += flat;
    if (removable) cost += Math.floor(Math.max(0, cost) / 5) * removable;
    return { per: per, cost: Math.max(1, cost) };
  }
  function rangeOf(p) {
    var i = RANGES.indexOf((FX[p.effect] || [])[3]); if (i < 0) return (FX[p.effect] || [])[3] || '';
    (p.mods || []).forEach(function (m) { var r = Math.max(1, +m.r || 1); if (m.n === 'Increased Range') i += r; if (m.n === 'Reduced Range') i -= r; });
    return RANGES[Math.max(0, Math.min(3, i))];
  }
  function modCount(p, name) { var n = 0; (p.mods || []).forEach(function (m) { if (m.n === name) n += Math.max(1, +m.r || 1); }); return n; }

  // ---------- everything worked out from a hero ----------
  function derive(h) {
    var out = { warnings: [], pp: {}, ab: {}, def: {}, skills: {}, attacks: [] };
    var pl = Math.max(1, +h.pl || 1), budget = 15 * pl + (+h.extra || 0), enh = {};
    var advRank = function (n) { var t = 0; (h.adv || []).forEach(function (a) { if (a.n === n) t += ADV[a.n] && ADV[a.n][2] ? Math.max(1, +a.r || 1) : 1; }); return t + (enh['adv:' + n] || 0); };
    var powerPts = 0, protection = 0;
    (h.powers || []).forEach(function (p) {
      var c = powerCost(p); p._cost = c.cost; powerPts += c.cost;
      if (p.effect === 'Enhanced Trait' && p.target) enh[p.target] = (enh[p.target] || 0) + (+p.rank || 0);
      if (p.effect === 'Protection') protection += +p.rank || 0;
    });
    AB.forEach(function (a) { out.ab[a] = (+h.ab[a] || 0) + (enh['ab:' + a] || 0); });
    DEF.forEach(function (d) {
      var bought = d[0] === 'tough' ? 0 : (+h.def[d[0]] || 0);
      out.def[d[0]] = out.ab[d[2]] + bought + (enh['def:' + d[0]] || 0) + (d[0] === 'tough' ? protection + advRank('Defensive Roll') : 0);
    });
    var skillRanks = 0;
    M.skills.forEach(function (s) {
      if (s[3]) return;
      var r = +((h.skills || {})[s[0]] || 0); skillRanks += r;
      out.skills[s[0]] = { r: r, total: out.ab[s[1]] + r + (enh['skill:' + s[0]] || 0), ab: s[1] };
    });
    (h.spec || []).forEach(function (x) { var r = +x.r || 0; skillRanks += r; x._total = out.ab[SK[x.s] ? SK[x.s][1] : 'INT'] + r + (enh['skill:' + x.s + ': ' + x.n] || 0); });
    var advPts = 0; (h.adv || []).forEach(function (a) { advPts += ADV[a.n] && ADV[a.n][2] ? Math.max(1, +a.r || 1) : 1; });
    var abPts = 0; AB.forEach(function (a) { abPts += 2 * (+h.ab[a] || 0); });
    var defPts = 0; ['dodge', 'parry', 'fort', 'will'].forEach(function (d) { defPts += +h.def[d] || 0; });
    out.pp = { abilities: abPts, powers: powerPts, advantages: advPts, skills: Math.ceil(skillRanks / 2), defenses: defPts };
    out.pp.total = abPts + powerPts + advPts + out.pp.skills + defPts; out.pp.budget = budget; out.pl = pl;
    out.init = out.ab.AGL + 4 * advRank('Improved Initiative');
    // attacks
    var spec = function (skill, name) { var b = 0; (h.spec || []).forEach(function (x) { if (x.s === skill && String(x.n).toLowerCase() === String(name).toLowerCase()) b = Math.max(b, +x.r || 0); }); return b; };
    var closeBase = out.ab.FGT + advRank('Close Attack'), rangedBase = out.ab.DEX + advRank('Ranged Attack');
    out.attacks.push({ n: 'Unarmed', range: 'Close', bonus: closeBase + spec('Close Combat', 'Unarmed'), rank: out.ab.STR, kind: 'Damage', resist: 'Toughness', dc: 15 + out.ab.STR });
    (h.powers || []).forEach(function (p) {
      var e = FX[p.effect]; if (!e || e[1] !== 'Attack' && modCount(p, 'Attack') === 0) return;
      var range = rangeOf(p), area = modCount(p, 'Area') > 0, acc = 2 * modCount(p, 'Accurate') - 2 * modCount(p, 'Inaccurate');
      var nm = p.name || p.effect, strB = p.effect === 'Damage' && p.str && range === 'Close', rank = (+p.rank || 0) + (strB ? out.ab.STR : 0); // Strength-based damage adds Strength
      var bonus = area || range === 'Perception' ? null : (range === 'Ranged' ? rangedBase + spec('Ranged Combat', nm) : closeBase + spec('Close Combat', nm)) + acc;
      var resist = p.effect === 'Damage' ? 'Toughness' : p.effect === 'Affliction' || p.effect === 'Weaken' ? (p.resist || 'Fortitude or Will') : p.effect === 'Nullify' ? 'rank or Will' : '';
      out.attacks.push({ n: nm, range: range + (area ? ', area' : ''), bonus: bonus, rank: rank, kind: p.effect, resist: resist, dc: (p.effect === 'Damage' ? 15 : 10) + rank, power: p.id });
    });
    // resisted effects with no attack roll (mind reading, illusions): rank ≤ PL
    (h.powers || []).forEach(function (p) { if (/^(Mind Reading|Illusion)$/.test(p.effect) && (+p.rank || 0) > pl) out.warnings.push((p.name || p.effect) + ': rank ' + p.rank + ' is above power level ' + pl + ' (resisted with no attack roll, so rank ≤ PL).'); });
    // limits
    if (out.pp.total > budget) out.warnings.push('Spent ' + out.pp.total + ' of ' + budget + ' power points (' + (out.pp.total - budget) + ' over).');
    out.attacks.forEach(function (a) {
      if (a.bonus == null) { if (a.rank > pl) out.warnings.push(a.n + ': rank ' + a.rank + ' is above power level ' + pl + ' (no attack roll, so rank ≤ PL).'); }
      else if (a.bonus + a.rank > 2 * pl) out.warnings.push(a.n + ': attack +' + a.bonus + ' and rank ' + a.rank + ' add up to ' + (a.bonus + a.rank) + ', over ' + 2 * pl + ' (2 × PL).');
    });
    var D = out.def, cap = function (x, y, a, b) { if (x + y > 2 * pl) out.warnings.push(a + ' + ' + b + ' = ' + (x + y) + ', over ' + 2 * pl + ' (2 × PL).'); };
    cap(D.dodge, D.tough, 'Dodge', 'Toughness'); cap(D.parry, D.tough, 'Parry', 'Toughness'); cap(D.fort, D.will, 'Fortitude', 'Will');
    var abWarned = {};
    Object.keys(out.skills).forEach(function (s) {
      var x = out.skills[s]; if (x.total <= pl + 10) return;
      if (!x.r) { if (abWarned[x.ab]) return; abWarned[x.ab] = 1; out.warnings.push(M.abilities.filter(function (a) { return a[0] === x.ab; })[0][1] + ' ' + out.ab[x.ab] + ' is over ' + (pl + 10) + ': even untrained, ' + s + ' would be +' + x.total + ' (skills are limited to PL + 10).'); }
      else out.warnings.push(s + ' +' + x.total + ' is over ' + (pl + 10) + ' (PL + 10).');
    });
    (h.spec || []).forEach(function (x) { if (x.s === 'Expertise' && x._total > pl + 10) out.warnings.push('Expertise: ' + (x.n || '?') + ' +' + x._total + ' is over ' + (pl + 10) + ' (PL + 10).'); });
    (h.adv || []).forEach(function (a) { var mx = ADV[a.n] && ADV[a.n][2]; if (mx > 0 && (+a.r || 1) > mx) out.warnings.push(a.n + ' goes up to ' + mx + ' ranks.'); if (a.n === 'Luck' && (+a.r || 1) > Math.floor(pl / 2)) out.warnings.push('Luck goes up to half the power level (' + Math.floor(pl / 2) + ').'); });
    var comps = (h.comp || []).filter(function (c) { return String(c.t || '').trim(); });
    if (comps.length < 2) out.warnings.push('Heroes need at least two complications, one of them a Motivation.');
    out.notes = [];
    var gap = function (x, y, a, b) { var hi = Math.max(x, y), lo = Math.min(x, y); if (x + y >= pl && hi > 1.5 * Math.max(lo, 1)) out.notes.push(a + ' ' + x + ' and ' + b + ' ' + y + ' are far apart (more than 50%): the rules ask the GM to look at that closely.'); };
    gap(D.dodge, D.tough, 'Dodge', 'Toughness'); gap(D.parry, D.tough, 'Parry', 'Toughness'); gap(D.fort, D.will, 'Fortitude', 'Will');
    out.attacks.forEach(function (a) { if (a.bonus != null && a.rank) gap(a.bonus, a.rank, a.n + ' attack', 'rank'); });
    return out;
  }

  // ---------- the rules book (summaries; full text at d20herosrd.com) ----------
  function book() {
    var P = function (t, md) { return { t: t, md: '# ' + t + '\n\n' + md }; };
    var costTxt = function (c) { return Array.isArray(c) ? c.join('–').replace('0.5', '½') + ' per rank' : (c === 0.5 ? '½' : c) + ' per rank'; };
    var modCost = function (m) { var v = m[2].map(function (x) { return (x > 0 ? '+' : '') + x; }).join(' or '); return m[1] === 'rank' ? v + ' per rank' : m[1] === 'flat' ? v + ' flat' + (m[3] ? ' (each time)' : '') : v + ' per 5 points'; };
    var basics = [
      P('The core check', 'Roll a d20, add your bonus (an ability, a skill, an attack…) and compare to a difficulty class (**DC**). Meet or beat it and you succeed.\n\n| DC | Difficulty |\n|---|---|\n| 0 | Very easy |\n| 5 | Easy |\n| 10 | Average |\n| 15 | Tough |\n| 20 | Challenging |\n| 25 | Formidable |\n| 30 | Heroic |\n| 35 | Super-heroic |\n| 40 | Nigh-impossible |\n\n' +
        '**Degrees:** every full 5 points you beat (or miss) the DC by is another degree of success (or failure). Many effects get worse with each degree of failure.\n\n**Routine checks:** when nothing is at stake, take 10 + your bonus instead of rolling.\n\n**Opposed checks:** both sides roll; the higher total wins.\n\n**Natural 20:** on an attack it is a critical hit; on other checks it adds a degree of success.'),
      P('Hero points and extra effort', '**Hero points:** you start each adventure with 1 and earn more when your complications cause you trouble. Spend one to re-roll a check (a roll of 10 or less becomes 10 + the roll), to recover from a condition, to get an edit to the scene, to gain an instant counter, or to use an advantage that needs one.\n\n' +
        '**Extra effort:** push yourself for a burst: +2 on a check, an extra rank in a power, an extra action, a temporary power stunt, or ignoring a condition. Afterwards you are fatigued (spend a hero point to avoid it).'),
      P('Power level and power points', 'The **power level (PL)** sets how strong heroes are; a typical game is PL 10. Heroes get **15 power points per PL**.\n\n| Trait | Cost |\n|---|---|\n| Ability | 2 per rank |\n| Defense (Dodge, Parry, Fortitude, Will) | 1 per rank |\n| Skill | 1 per 2 ranks |\n| Advantage | 1 per rank |\n| Power | Effect cost + extras − flaws, per rank, plus flat modifiers |\n\n' +
        '**Limits by power level:**\n\n- Attack bonus + effect rank ≤ 2 × PL (resisted effects with no attack roll, like area and perception effects: rank ≤ PL). Unarmed damage is your Strength, so close attack + Strength counts too.\n- Dodge + Toughness ≤ 2 × PL, and Parry + Toughness ≤ 2 × PL\n- Fortitude + Will ≤ 2 × PL\n- Skill bonus ≤ PL + 10, including skills used untrained (ability alone)\n\nThere is no separate cap on abilities: the skill and attack limits hold them in check. Paired traits don’t have to be equal, but the rules ask the GM to look closely at a gap of more than 50%.\n\nToughness can’t be bought directly: it comes from Stamina, the Protection effect and the Defensive Roll advantage.'),
      P('Complications', 'Every hero has at least two complications, one of them a **Motivation**. When a complication makes life harder in play, the GM awards a hero point.\n\n' + M.complications.map(function (c) { return '**' + c[0] + '.** ' + c[1]; }).join('\n\n'))
    ];
    var abil = [P('Abilities', 'Abilities run from −5 to 20; 0 is an average adult, 2 is above average, 5 is the human peak. Each rank costs 2 points.\n\n' + M.abilities.map(function (a) { return '**' + a[1] + ' (' + a[0] + ').** ' + a[2]; }).join('\n\n') +
      '\n\n## Defenses\n\n- **Dodge** (Agility): avoiding ranged attacks and area effects.\n- **Parry** (Fighting): fending off close attacks.\n- **Fortitude** (Stamina): resisting poisons, diseases and fatigue.\n- **Toughness** (Stamina): resisting damage; raised only by powers and Defensive Roll.\n- **Will** (Awareness): resisting mind control and other mental effects.\n\nDodge and Parry set the DC to hit you: **10 + the defense**.')];
    var skills = [P('Skills', 'Skill bonus = ability + ranks. Ranks cost 1 point per 2. Close Combat, Ranged Combat and Expertise are bought for a specific attack or field.\n\n| Skill | Ability | Use |\n|---|---|---|\n' + M.skills.map(function (s) { return '| ' + s[0] + ' | ' + s[1] + ' | ' + s[2] + ' |'; }).join('\n'))];
    var advs = ['Combat', 'Fortune', 'General', 'Skill'].map(function (cat) {
      return P(cat + ' advantages', 'Each advantage costs 1 point (per rank, if ranked).\n\n' + M.advantages.filter(function (a) { return a[1] === cat; }).map(function (a) {
        return '## ' + a[0] + '\n\n*' + (a[2] ? (a[2] > 0 ? 'Ranked, up to ' + a[2] : 'Ranked') : 'Not ranked') + '*\n\n' + a[3];
      }).join('\n\n'));
    });
    var fx = ['Attack', 'Control', 'Defense', 'General', 'Movement', 'Sensory'].map(function (ty) {
      return P(ty + ' effects', M.effects.filter(function (e) { return e[1] === ty; }).map(function (e) {
        return '## ' + e[0] + '\n\n**Action** ' + e[2] + ' · **Range** ' + e[3] + ' · **Duration** ' + e[4] + ' · **Cost** ' + costTxt(e[5]) + '\n\n' + e[6];
      }).join('\n\n'));
    });
    var mods = [
      P('How modifiers work', 'Extras raise a power’s cost, flaws lower it. **Per-rank** modifiers change the cost of every rank; **flat** modifiers add or remove points once (or once per application).\n\nIf the cost per rank drops below 1, the power costs 1 point per 2 ranks at 0, per 3 ranks at −1, and so on. Flaws can’t lower a power below 1 point.'),
      P('Extras', M.extras.map(function (m) { return '## ' + m[0] + '\n\n*' + modCost(m) + '*\n\n' + m[4]; }).join('\n\n')),
      P('Flaws', M.flaws.map(function (m) { return '## ' + m[0] + '\n\n*' + modCost(m) + '*\n\n' + m[4]; }).join('\n\n'))
    ];
    var combat = [
      P('Actions and initiative', 'Each turn you get a **standard action**, a **move action** and any number of **free actions**; you can trade the standard action for a second move. **Reactions** happen on others’ turns.\n\n**Initiative:** Agility + Improved Initiative (+4 per rank), rolled with a d20 at the start of a fight.'),
      P('Attacks and resistance', '**Attack check:** d20 + attack bonus against 10 + the target’s Dodge (ranged) or Parry (close). A natural 20 is a critical hit: +5 to the effect, or an extra effect. Area and perception-range effects need no attack roll.\n\n' +
        '**Damage:** the target makes a Toughness check against DC 15 + the damage rank.\n\n| Result | Effect |\n|---|---|\n| Success | No effect |\n| 1 degree of failure | −1 on further Toughness checks (bruised) |\n| 2 degrees | Dazed and −1 |\n| 3 degrees | Staggered and −1 |\n| 4 degrees | Incapacitated |\n\n' +
        '**Afflictions:** the target resists against DC 10 + rank; each degree of failure brings the next condition chosen for the power. They can try again at the end of each turn.\n\n**Recovery:** the −1 penalties from damage go away at one per minute of rest.'),
      P('Conditions', M.conditions.map(function (c) { return '**' + c[0] + '** *(' + c[1].toLowerCase() + ')*. ' + c[2]; }).join('\n\n'))
    ];
    return { id: 'mm', title: 'M&M 3e rules (summaries)', chapters: [
      { t: 'Basics', parts: basics }, { t: 'Abilities and defenses', parts: abil }, { t: 'Skills', parts: skills }, { t: 'Advantages', parts: advs },
      { t: 'Power effects', parts: fx }, { t: 'Extras and flaws', parts: mods }, { t: 'Combat', parts: combat }] };
  }

  // ---------- the screens ----------
  root.MMUI = function (api) {
    var esc = api.esc, btn = api.btn, ui = api.ui, store = api.store;
    var S = function () { return store.mm = store.mm || { heroes: [], cur: '' }; };
    var U = ui.mm = ui.mm || { tab: 'basics', advCat: '', open: null, pick: false };
    function hero() {
      var s = S(); if (!s.heroes.length) { var h = newHero(); s.heroes.push(h); s.cur = h.id; }
      var cur = s.heroes.filter(function (x) { return x.id === s.cur; })[0]; if (!cur) { cur = s.heroes[0]; s.cur = cur.id; } return cur;
    }
    function step(path, v, min, max, label) {
      return '<span class="mm-step">' + btn('mmStep', '−', { p: path, d: -1, min: min, max: max }, 'mm-b') + '<b aria-label="' + esc(label || path) + '">' + (v > 0 && /^(ab|bonus)/.test(label || '') ? '+' : '') + v + '</b>' + btn('mmStep', '+', { p: path, d: 1, min: min, max: max }, 'mm-b') + '</span>';
    }
    function txt(path, v, ph, label, area) {
      var id = 'mm-' + path.replace(/\W/g, '-');
      return '<label class="field"><span>' + esc(label) + '</span>' + (area ? '<textarea id="' + id + '" data-mmf="' + path + '" placeholder="' + esc(ph || '') + '">' + esc(v || '') + '</textarea>' : '<input type="text" id="' + id + '" data-mmf="' + path + '" value="' + esc(v || '') + '" placeholder="' + esc(ph || '') + '">') + '</label>';
    }
    function fmt(n) { return n == null ? '—' : (n >= 0 ? '+' : '−') + Math.abs(n); }
    var TABS = [['basics', 'Basics'], ['abilities', 'Abilities'], ['powers', 'Powers'], ['advantages', 'Advantages'], ['skills', 'Skills'], ['defenses', 'Defenses'], ['complications', 'Complications'], ['sheet', 'Sheet'], ['play', 'Session']];

    function home() {
      return '<main class="home"><h1>Mutants &amp; Masterminds 3e</h1><p class="muted">Your superhero table companion. Tap the d20 to roll.</p>' +
        root.homeHub([['mm-heroes', 'bolt', 'Heroes'], ['dm', 'eye', 'GM'], ['mm-rules', 'book', 'Rules'], ['audio', 'lute', 'Audio'], ['rules', 'scroll', 'House rules']]) + '</main>';
    }

    function heroes() {
      var h = hero(), d = derive(h), s = S();
      var over = d.pp.total > d.pp.budget;
      var h2 = '<main class="mm-main"><div class="toolbar mm-top"><select data-mmhero="1" aria-label="Hero">' + s.heroes.map(function (x) { return '<option value="' + x.id + '"' + (x.id === h.id ? ' selected' : '') + '>' + esc(x.name || 'Unnamed hero') + '</option>'; }).join('') + '</select>' +
        btn('mmNew', '+ New hero', {}, 'btn small') + btn('mmDup', 'Duplicate', {}, 'btn small') + (U.confirmDel ? btn('mmDel', 'Delete ' + esc(h.name || 'this hero') + '?', {}, 'btn small danger') + btn('mmDelNo', 'Keep', {}, 'btn small') : btn('mmDelAsk', 'Delete', {}, 'btn small')) + '</div>' +
        '<div class="mm-bar' + (over ? ' over' : '') + '"><span><b>PL ' + d.pl + '</b></span><span><b>' + d.pp.total + '</b> / ' + d.pp.budget + ' points</span>' +
        '<span class="small">Abilities ' + d.pp.abilities + ' · Powers ' + d.pp.powers + ' · Advantages ' + d.pp.advantages + ' · Skills ' + d.pp.skills + ' · Defenses ' + d.pp.defenses + '</span>' +
        (d.warnings.length ? '<span class="mm-warn">' + d.warnings.length + ' to check</span>' : '<span class="mm-ok">✓ within the limits</span>') + '</div>' +
        '<nav class="steps mm-tabs">' + TABS.map(function (t) { return btn('mmTab', t[1], { v: t[0] }, 'step' + (U.tab === t[0] ? ' on' : '')); }).join('') + '</nav>';
      var body = { basics: basics, abilities: abilities, powers: powers, advantages: advantages, skills: skills, defenses: defenses, complications: complications, sheet: sheet, play: play }[U.tab] || basics;
      return h2 + '<div class="mm-body">' + body(h, d) + '</div>' + (d.warnings.length && U.tab !== 'sheet' ? '<div class="panel mm-warns"><b>To check</b><ul>' + d.warnings.map(function (w) { return '<li>' + esc(w) + '</li>'; }).join('') + '</ul></div>' : '') + (d.notes.length && U.tab !== 'sheet' ? '<details class="panel mm-notes"><summary class="small">Worth a look with your GM (' + d.notes.length + ')</summary><ul class="small">' + d.notes.map(function (w) { return '<li>' + esc(w) + '</li>'; }).join('') + '</ul></details>' : '') + '</main>';
    }
    function basics(h, d) {
      return '<h2>Basics</h2><div class="panel"><div class="row">' + txt('name', h.name, 'Hero name', 'Hero name') + txt('identity', h.identity, 'Secret or public identity', 'Identity') + '</div><div class="row">' + txt('player', h.player, '', 'Player') + txt('group', h.group, 'Team, base', 'Group') + '</div>' +
        '<div class="row mm-plrow"><div class="field"><span>Power level</span>' + step('pl', h.pl, 1, 20, 'power level') + '</div><div class="field"><span>Extra power points <small class="muted">(earned in play)</small></span>' + step('extra', h.extra || 0, 0, 999, 'extra points') + '</div></div>' +
        '<p class="small muted">PL ' + d.pl + ' gives ' + 15 * d.pl + ' power points' + (h.extra ? ' + ' + h.extra + ' earned' : '') + '. Most games start at PL 10 (150 points). Ask your GM.</p></div>' +
        '<div class="panel"><p class="small muted" style="margin:0 0 .4rem">Archetypes for inspiration</p><div class="pills">' + M.archetypes.map(function (a) { return '<span class="pill small static">' + a + '</span>'; }).join('') + '</div></div>' +
        txt('notes', h.notes, 'Origin, look, personality…', 'Notes', 1);
    }
    function abilities(h, d) {
      return '<h2>Abilities</h2><p class="muted">2 points per rank. 0 is an average adult, 5 is the human peak. Powers that raise an ability (Enhanced Trait) are added on top.</p><div class="mm-rows">' +
        M.abilities.map(function (a) {
          var e = d.ab[a[0]] - (+h.ab[a[0]] || 0);
          return '<div class="mm-row"><span class="nm"><b>' + a[1] + '</b> <small class="muted">' + a[0] + '</small><small class="muted">' + a[2] + '</small></span>' + step('ab.' + a[0], +h.ab[a[0]] || 0, -5, 20, 'ab ' + a[0]) + '<span class="mm-tot">' + fmt(d.ab[a[0]]) + (e ? '<small>+' + e + ' power</small>' : '') + '</span></div>';
        }).join('') + '</div>';
    }
    function defenses(h, d) {
      return '<h2>Defenses</h2><p class="muted">1 point per rank on top of the ability. Toughness comes from Stamina, the Protection effect and Defensive Roll.</p><div class="mm-rows">' +
        DEF.map(function (x) {
          var t = d.def[x[0]];
          return '<div class="mm-row"><span class="nm"><b>' + x[1] + '</b> <small class="muted">' + x[2] + ' ' + fmt(d.ab[x[2]]) + '</small></span>' + (x[0] === 'tough' ? '<span class="small muted">from powers</span>' : step('def.' + x[0], +h.def[x[0]] || 0, 0, 30, x[1])) + '<span class="mm-tot">' + fmt(t) + '</span></div>';
        }).join('') + '</div><div class="panel small"><b>Limits at PL ' + d.pl + ' (' + 2 * d.pl + '):</b> Dodge + Toughness ' + (d.def.dodge + d.def.tough) + ' · Parry + Toughness ' + (d.def.parry + d.def.tough) + ' · Fortitude + Will ' + (d.def.fort + d.def.will) + '<br>Initiative ' + fmt(d.init) + '</div>';
    }
    function skills(h, d) {
      var specs = (h.spec || []).map(function (x, i) {
        return '<div class="mm-row"><span class="nm"><b>' + x.s + '</b><input type="text" id="mm-spec-' + i + '" data-mmf="spec.' + i + '.n" value="' + esc(x.n || '') + '" placeholder="' + (x.s === 'Expertise' ? 'Science, Magic, Streetwise…' : 'Unarmed, Swords, Blast…') + '" aria-label="' + x.s + ' specialty"></span>' + step('spec.' + i + '.r', +x.r || 0, 0, 30, x.s + ' ranks') + '<span class="mm-tot">' + fmt(x._total) + '</span>' + btn('mmSpecRm', '✕', { v: i }, 'btn small') + '</div>';
      }).join('');
      return '<h2>Skills</h2><p class="muted">1 point per 2 ranks. Bonus = ability + ranks, up to PL + 10 (' + (d.pl + 10) + '), even with no ranks: a skill used untrained counts its ability alone, so this also limits your abilities.</p><div class="mm-rows">' +
        M.skills.filter(function (s) { return !s[3]; }).map(function (s) {
          var x = d.skills[s[0]];
          return '<div class="mm-row"><span class="nm"><b>' + s[0] + '</b> <small class="muted">' + s[1] + '</small></span>' + step('skills.' + s[0], x.r, 0, 30, s[0] + ' ranks') + '<span class="mm-tot' + (x.total > d.pl + 10 ? ' bad' : '') + '">' + fmt(x.total) + '</span></div>';
        }).join('') + '</div><h3>Close Combat, Ranged Combat and Expertise</h3><p class="small muted">Each one is for a named attack or field. Name a combat skill after a power (like “Blast”) and it adds to that power’s attack.</p><div class="mm-rows">' + specs + '</div>' +
        '<div class="toolbar">' + btn('mmSpecAdd', '+ Close Combat', { v: 'Close Combat' }, 'btn small') + btn('mmSpecAdd', '+ Ranged Combat', { v: 'Ranged Combat' }, 'btn small') + btn('mmSpecAdd', '+ Expertise', { v: 'Expertise' }, 'btn small') + '</div>';
    }
    function advantages(h, d) {
      var have = (h.adv || []).map(function (a, i) {
        var def = ADV[a.n] || ['', '', 0, ''];
        return '<div class="mm-adv"><div class="mm-row"><span class="nm"><b>' + esc(a.n) + '</b> <small class="muted">' + def[1] + '</small></span>' + (def[2] ? step('adv.' + i + '.r', Math.max(1, +a.r || 1), 1, def[2] > 0 ? def[2] : 40, a.n + ' ranks') : '<span class="small muted">1 point</span>') + btn('mmAdvRm', '✕', { v: i }, 'btn small') + '</div>' +
          '<div class="small muted">' + esc(def[3]) + '</div>' + (def[4] ? '<input type="text" id="mm-adv-' + i + '" data-mmf="adv.' + i + '.note" value="' + esc(a.note || '') + '" placeholder="Which one? (attack, skill, benefit…)" aria-label="' + esc(a.n) + ' details">' : '') + '</div>';
      }).join('');
      var cat = U.advCat || '', q = (ui.q.mmadv || '').toLowerCase();
      var list = M.advantages.filter(function (a) { return (!cat || a[1] === cat) && (!q || (a[0] + ' ' + a[3]).toLowerCase().indexOf(q) >= 0); });
      return '<h2>Advantages</h2><p class="muted">1 point each (per rank if ranked).</p>' + (have ? '<div class="mm-advs">' + have + '</div>' : '<p class="small muted">None yet.</p>') +
        '<h3>Add an advantage</h3><div class="pills">' + ['', 'Combat', 'Fortune', 'General', 'Skill'].map(function (c) { return btn('mmAdvCat', c || 'All', { v: c }, 'pill small' + (cat === c ? ' on' : '')); }).join('') + '</div>' +
        '<div class="toolbar"><input type="search" id="q-mmadv" data-q="mmadv" placeholder="Search advantages…" value="' + esc(ui.q.mmadv || '') + '"></div><div class="optlist">' + list.map(function (a) {
          var taken = (h.adv || []).some(function (x) { return x.n === a[0]; }) && !a[4];
          return '<button type="button" class="opt" data-act="mmAdvAdd" data-v="' + esc(a[0]) + '"' + (taken ? ' disabled' : '') + '><b>' + esc(a[0]) + '</b> <small class="muted">— ' + a[1] + (a[2] ? ', ranked' : '') + (taken ? ', taken' : '') + '</small><span>' + esc(a[3]) + '</span></button>';
        }).join('') + '</div>';
    }
    function powerCard(p, i, d) {
      var e = FX[p.effect] || [], open = U.open === p.id, c = powerCost(p), att = d.attacks.filter(function (a) { return a.power === p.id; })[0];
      var head = '<button type="button" class="mm-phead" data-act="mmOpenP" data-v="' + p.id + '"><b>' + esc(p.name || p.effect) + '</b> <span class="small muted">' + esc(p.effect) + ' ' + p.rank + '</span><span class="spacer"></span><span class="mm-cost">' + c.cost + ' pt' + (c.cost === 1 ? '' : 's') + '</span><span aria-hidden="true">' + (open ? '▾' : '▸') + '</span></button>';
      if (!open) return '<div class="panel mm-power">' + head + (att ? '<div class="small muted">' + (att.bonus == null ? 'no attack roll' : 'attack ' + fmt(att.bonus)) + ' · DC ' + att.dc + ' ' + esc(att.resist) + '</div>' : '') + '</div>';
      var opts = Array.isArray(e[5]) && p.effect !== 'Enhanced Trait' ? '<label class="field"><span>Cost per rank</span><select data-mmsel="powers.' + i + '.base">' + e[5].map(function (v) { return '<option value="' + v + '"' + (baseCost(p) === v ? ' selected' : '') + '>' + v + '</option>'; }).join('') + '</select></label>' : '';
      var target = p.effect === 'Enhanced Trait' ? '<label class="field"><span>Raises</span><select data-mmsel="powers.' + i + '.target"><option value="">— choose —</option>' +
        '<optgroup label="Abilities (2 per rank)">' + M.abilities.map(function (a) { return '<option value="ab:' + a[0] + '"' + (p.target === 'ab:' + a[0] ? ' selected' : '') + '>' + a[1] + '</option>'; }).join('') + '</optgroup>' +
        '<optgroup label="Defenses (1 per rank)">' + DEF.map(function (x) { return '<option value="def:' + x[0] + '"' + (p.target === 'def:' + x[0] ? ' selected' : '') + '>' + x[1] + '</option>'; }).join('') + '</optgroup>' +
        '<optgroup label="Skills (½ per rank)">' + M.skills.filter(function (s) { return !s[3]; }).map(function (s) { return '<option value="skill:' + s[0] + '"' + (p.target === 'skill:' + s[0] ? ' selected' : '') + '>' + s[0] + '</option>'; }).join('') + '</optgroup>' +
        '<optgroup label="Advantages (1 per rank)">' + M.advantages.filter(function (a) { return a[2]; }).map(function (a) { return '<option value="adv:' + a[0] + '"' + (p.target === 'adv:' + a[0] ? ' selected' : '') + '>' + a[0] + '</option>'; }).join('') + '</optgroup></select></label>' : '';
      var strBox = p.effect === 'Damage' && rangeOf(p) === 'Close' ? '<label class="check-line"><input type="checkbox" data-mmchk="powers.' + i + '.str"' + (p.str ? ' checked' : '') + '> <span><b>Adds Strength</b><br><span class="small muted">A punch, a weapon, claws: the damage is Strength + this rank (' + (d.ab.STR + (+p.rank || 0)) + ').</span></span></label>' : '';
      var resist = /^(Affliction|Weaken)$/.test(p.effect) ? '<label class="field"><span>Resisted by</span><select data-mmsel="powers.' + i + '.resist">' + ['Fortitude', 'Will', 'Dodge', 'Fortitude or Will'].map(function (r) { return '<option' + ((p.resist || 'Fortitude or Will') === r ? ' selected' : '') + '>' + r + '</option>'; }).join('') + '</select></label>' : '';
      var mods = (p.mods || []).map(function (m, j) {
        var md = MODS[m.n] || ['', 'flat', [0], 0, ''], isFlaw = M.flaws.some(function (f) { return f[0] === m.n; });
        var val = md[2].length > 1 ? '<select data-mmsel="powers.' + i + '.mods.' + j + '.v" aria-label="' + esc(m.n) + ' cost">' + md[2].map(function (v) { return '<option value="' + v + '"' + (+m.v === v ? ' selected' : '') + '>' + (v > 0 ? '+' : '') + v + '</option>'; }).join('') + '</select>' : '<span class="small">' + (md[2][0] > 0 ? '+' : '') + md[2][0] + '</span>';
        var unit = md[1] === 'rank' ? '/rank' : md[1] === 'flat' ? ' flat' : ' per 5 pts';
        var ranked = md[3] || /^(Area|Increased Range|Reduced Range|Increased Duration|Limited)$/.test(m.n);
        return '<div class="mm-mod' + (isFlaw ? ' flaw' : '') + '"><span class="nm"><b>' + esc(m.n) + '</b> ' + val + '<small class="muted">' + unit + '</small><small class="muted">' + esc(md[4]) + '</small></span>' + (ranked ? step('powers.' + i + '.mods.' + j + '.r', Math.max(1, +m.r || 1), 1, 20, m.n + ' times') : '') +
          '<input type="text" id="mm-p' + i + 'm' + j + '" data-mmf="powers.' + i + '.mods.' + j + '.note" value="' + esc(m.note || '') + '" placeholder="Details" aria-label="' + esc(m.n) + ' details">' + btn('mmModRm', '✕', { i: i, v: j }, 'btn small') + '</div>';
      }).join('');
      return '<div class="panel mm-power open">' + head + '<p class="small muted">' + esc(e[1] || '') + ' · ' + esc(e[2] || '') + ' · ' + esc(rangeOf(p)) + ' · ' + esc(e[4] || '') + ' — ' + esc(e[6] || '') + '</p>' +
        '<div class="row">' + txt('powers.' + i + '.name', p.name, p.effect, 'Power name') + '<div class="field"><span>Rank</span>' + step('powers.' + i + '.rank', +p.rank || 1, 1, 40, 'rank') + '</div></div>' +
        (opts || target || resist ? '<div class="row">' + opts + target + resist + '</div>' : '') + strBox +
        txt('powers.' + i + '.desc', p.desc, 'Descriptors and how it looks: fire, magic, a gadget…', 'Description') +
        '<h4>Extras and flaws</h4>' + (mods || '<p class="small muted">None.</p>') +
        '<div class="row"><label class="field"><span>Add an extra</span><select data-mmaddmod="' + i + '"><option value="">— extra —</option>' + M.extras.map(function (m) { return '<option>' + m[0] + '</option>'; }).join('') + '</select></label>' +
        '<label class="field"><span>Add a flaw</span><select data-mmaddmod="' + i + '"><option value="">— flaw —</option>' + M.flaws.map(function (m) { return '<option>' + m[0] + '</option>'; }).join('') + '</select></label></div>' +
        '<p class="small"><b>Cost:</b> ' + (c.per >= 1 ? c.per + ' per rank' : c.per > 0 ? '1 per ' + Math.round(1 / c.per) + ' ranks' : '1 per ' + (2 - c.per) + ' ranks') + ' → <b>' + c.cost + ' points</b>' +
        (att ? ' · ' + (att.bonus == null ? 'no attack roll' : 'attack ' + fmt(att.bonus)) + ' · DC ' + att.dc + ' ' + esc(att.resist) : '') + '</p>' +
        '<div class="toolbar">' + btn('mmPowRm', 'Delete power', { v: i }, 'btn small danger') + btn('mmPowDup', 'Copy', { v: i }, 'btn small') + '</div></div>';
    }
    function powers(h, d) {
      var q = (ui.q.mmfx || '').toLowerCase();
      var pick = U.pick ? '<div class="panel"><div class="toolbar"><b>Choose an effect</b><span class="spacer"></span>' + btn('mmPick', 'Cancel', { v: 0 }, 'btn small') + '</div><input type="search" id="q-mmfx" data-q="mmfx" placeholder="Search effects…" value="' + esc(ui.q.mmfx || '') + '">' +
        ['Attack', 'Control', 'Defense', 'General', 'Movement', 'Sensory'].map(function (ty) {
          var l = M.effects.filter(function (e) { return e[1] === ty && (!q || (e[0] + ' ' + e[6]).toLowerCase().indexOf(q) >= 0); });
          return l.length ? '<h4>' + ty + '</h4><div class="optlist" style="max-height:none">' + l.map(function (e) { return '<button type="button" class="opt" data-act="mmPowAdd" data-v="' + e[0] + '"><b>' + e[0] + '</b> <small class="muted">— ' + (Array.isArray(e[5]) ? e[5].join('–') : e[5]) + ' per rank · ' + e[3] + '</small><span>' + esc(e[6]) + '</span></button>'; }).join('') + '</div>' : '';
        }).join('') + '</div>' : '';
      return '<h2>Powers</h2><p class="muted">Each power is an effect with a rank, plus extras (cost more) and flaws (cost less). Tap a power to change it.</p>' +
        (h.powers || []).map(function (p, i) { return powerCard(p, i, d); }).join('') + (U.pick ? pick : '<div class="toolbar">' + btn('mmPick', '+ Add a power', { v: 1 }, 'btn primary') + '</div>');
    }
    function complications(h) {
      return '<h2>Complications</h2><p class="muted">At least two, one of them a Motivation. When one causes trouble in play, the GM gives you a hero point.</p>' +
        (h.comp || []).map(function (c, i) {
          return '<div class="panel mm-comp"><div class="row"><label class="field"><span>Kind</span><select data-mmsel="comp.' + i + '.k">' + M.complications.map(function (k) { return '<option' + (c.k === k[0] ? ' selected' : '') + '>' + k[0] + '</option>'; }).join('') + '</select></label>' +
            txt('comp.' + i + '.t', c.t, (M.complications.filter(function (k) { return k[0] === c.k; })[0] || ['', ''])[1], 'What it is') + '</div>' + btn('mmCompRm', 'Remove', { v: i }, 'btn small') + '</div>';
        }).join('') + '<div class="toolbar">' + btn('mmCompAdd', '+ Add a complication', {}, 'btn') + '</div>';
    }
    function sheet(h, d) {
      var sk = Object.keys(d.skills).filter(function (s) { return d.skills[s].r; }).map(function (s) { return s + ' ' + d.skills[s].r + ' (' + fmt(d.skills[s].total) + ')'; })
        .concat((h.spec || []).filter(function (x) { return +x.r; }).map(function (x) { return x.s + ': ' + (x.n || '?') + ' ' + x.r + ' (' + fmt(x._total) + ')'; }));
      return '<div class="toolbar noprint">' + btn('mmPrint', 'Print or save as PDF', {}, 'btn primary') + '</div><article class="sheet mm-sheet"><div class="sheet-head"><div><h2 style="margin:0">' + esc(h.name || 'Unnamed hero') + '</h2><span class="muted">' + esc([h.identity, h.group].filter(Boolean).join(' · ')) + '</span></div>' +
        '<div><b>PL ' + d.pl + '</b> · ' + d.pp.total + '/' + d.pp.budget + ' points' + (h.player ? '<br><span class="small muted">Player: ' + esc(h.player) + '</span>' : '') + '</div></div>' +
        '<h3>Abilities</h3><div class="mm-abgrid">' + M.abilities.map(function (a) { return '<div><small>' + a[0] + '</small><b>' + fmt(d.ab[a[0]]) + '</b></div>'; }).join('') + '</div>' +
        '<h3>Defenses</h3><div class="mm-abgrid">' + DEF.map(function (x) { return '<div><small>' + x[1] + '</small><b>' + fmt(d.def[x[0]]) + '</b></div>'; }).join('') + '<div><small>Initiative</small><b>' + fmt(d.init) + '</b></div></div>' +
        '<h3>Offense</h3><ul class="lines">' + d.attacks.map(function (a) { return '<li><b>' + esc(a.n) + '</b> — ' + esc(a.range) + ', ' + (a.bonus == null ? 'no attack roll' : 'attack ' + fmt(a.bonus)) + ', ' + esc(a.kind) + ' ' + a.rank + (a.resist ? ' (DC ' + a.dc + ' ' + esc(a.resist) + ')' : '') + '</li>'; }).join('') + '</ul>' +
        '<h3>Powers</h3>' + ((h.powers || []).length ? (h.powers || []).map(function (p) {
          var m = (p.mods || []).map(function (x) { return x.n + (Math.max(1, +x.r || 1) > 1 ? ' ' + x.r : '') + (x.note ? ' (' + x.note + ')' : ''); });
          return '<div class="feature"><b>' + esc(p.name || p.effect) + ':</b> ' + esc(p.effect) + ' ' + p.rank + (p.str && p.effect === 'Damage' ? ' (Strength-based)' : '') + (p.target ? ' (' + esc(p.target.split(':')[1]) + ')' : '') + (m.length ? ', ' + esc(m.join(', ')) : '') + ' <span class="lv">' + p._cost + ' pts</span>' + (p.desc ? '<div>' + esc(p.desc) + '</div>' : '') + '</div>';
        }).join('') : '<p class="muted">None.</p>') +
        '<h3>Advantages</h3><p>' + ((h.adv || []).map(function (a) { var def = ADV[a.n]; return esc(a.n + (def && def[2] && (+a.r || 1) > 1 ? ' ' + a.r : '') + (a.note ? ' (' + a.note + ')' : '')); }).join(', ') || '—') + '</p>' +
        '<h3>Skills</h3><p>' + (esc(sk.join(', ')) || '—') + '</p>' +
        '<h3>Complications</h3>' + ((h.comp || []).filter(function (c) { return c.t; }).map(function (c) { return '<p><b>' + esc(c.k) + ':</b> ' + esc(c.t) + '</p>'; }).join('') || '<p>—</p>') +
        (d.warnings.length ? '<h3>To check</h3><ul>' + d.warnings.map(function (w) { return '<li>' + esc(w) + '</li>'; }).join('') + '</ul>' : '') +
        (h.notes ? '<h3>Notes</h3><p>' + esc(h.notes).replace(/\n/g, '<br>') + '</p>' : '') + '</article>';
    }

    // ---------- session: hero points, the damage track, conditions ----------
    var TRACK = ['', 'Bruised', 'Dazed', 'Staggered', 'Incapacitated'];
    function play(h, d) {
      var T = h.track = h.track || {}, hp = T.hp == null ? 1 : +T.hp, bruise = +T.bruise || 0, on = T.conds || {};
      var tough = d.def.tough - bruise;
      var who = { key: h.id, name: h.name, init: d.init,
        bonus: function (a) { return a.kind === 'def' ? d.def[a.key] - (a.key === 'tough' ? bruise : 0) : a.kind === 'skill' ? (d.skills[a.key] || {}).total || 0 : a.kind === 'ab' ? d.ab[a.key] || 0 : 0; },
        status: function () { return { hp: 0, max: 0, ac: 0, conds: Object.keys(on).concat(T.dmg ? [TRACK[T.dmg]] : []), txt: 'Toughness ' + fmt(tough) + (bruise ? ' (' + bruise + ' bruise' + (bruise > 1 ? 's' : '') + ')' : '') + ' · ' + hp + ' hero point' + (hp === 1 ? '' : 's') }; } };
      var out = '<h2>Session</h2>' + (api.tp ? api.tp.html(who) : '') + '<div class="panel"><h3>Hero points</h3><div class="toolbar">' + btn('mmHp', '−', { v: -1 }, 'btn') + '<b class="mm-hpts">' + hp + '</b>' + btn('mmHp', '+', { v: 1 }, 'btn') +
        '<span class="small muted">Spend one to reroll (a roll under 11 counts as 10 + the roll), to edit a scene, to recover, or for an instant counter. You get one when a complication causes trouble; back to 1 each adventure.</span></div></div>';
      out += '<div class="panel"><h3>Damage</h3><p>Toughness <b>' + fmt(tough) + '</b>' + (bruise ? ' <span class="muted">(' + d.def.tough + ' − ' + bruise + ' bruise' + (bruise > 1 ? 's' : '') + ')</span>' : '') + (T.dmg ? ' · <b class="bad">' + TRACK[T.dmg] + '</b>' : '') + '</p>' +
        '<div class="toolbar"><label class="small">Damage rank <input type="number" min="1" max="40" id="mm-dmgrank" data-mmplay="rank" value="' + esc(U.dmgRank || '') + '" style="width:4.5rem"></label>' + btn('mmHit', '🎲 Toughness check', {}, 'btn primary') + btn('mmRecover', 'Recover a step', {}, 'btn small') + btn('mmFresh', 'All healed', {}, 'btn small') + '</div>' +
        (U.hitMsg ? '<p class="small rest-msg">' + esc(U.hitMsg) + '</p>' : '') + '<p class="small muted">The check is against DC 15 + the damage rank: each 5 points short is one more step (bruise, dazed, staggered, incapacitated).</p></div>';
      out += '<div class="panel"><h3>Conditions</h3><div class="pills">' + M.conditions.map(function (c) { return btn('mmCond', c[0], { v: c[0] }, 'pill small' + (on[c[0]] ? ' on' : '')); }).join('') + '</div>' +
        (Object.keys(on).length ? '<ul class="cond-list">' + M.conditions.filter(function (c) { return on[c[0]]; }).map(function (c) { return '<li><b>' + esc(c[0]) + ':</b> ' + esc(c[2]) + '</li>'; }).join('') + '</ul>' : '<p class="small muted">Tap a condition when it happens to the hero to see what it does.</p>') + '</div>';
      out += '<div class="panel"><h3>Attacks and defenses</h3><ul class="lines">' + d.attacks.map(function (a) { return '<li><b>' + esc(a.n) + '</b> — ' + esc(a.range) + ', ' + (a.bonus == null ? 'no attack roll' : 'attack ' + fmt(a.bonus)) + ', ' + esc(a.kind) + ' ' + a.rank + (a.resist ? ' (DC ' + a.dc + ' ' + esc(a.resist) + ')' : '') + '</li>'; }).join('') + '</ul>' +
        '<p>' + DEF.map(function (x) { return x[1] + ' <b>' + fmt(x[0] === 'tough' ? tough : d.def[x[0]]) + '</b>'; }).join(' · ') + ' · Initiative <b>' + fmt(d.init) + '</b></p></div>';
      return out;
    }
    // ---------- changes ----------
    function walk(obj, path) { var k = String(path).split('.'), o = obj; for (var i = 0; i < k.length - 1; i++) { if (o[k[i]] == null) o[k[i]] = {}; o = o[k[i]]; } return [o, k[k.length - 1]]; }
    var actions = {
      mmOpen: function (v) { S().cur = v; ui.section = 'mm-heroes'; root.scrollTo(0, 0); },
      mmTab: function (v) { U.tab = v; U.pick = false; root.scrollTo(0, 0); },
      mmStep: function (_, el) {
        var h = hero(), w = walk(h, el.getAttribute('data-p')), d = +el.getAttribute('data-d'), min = +el.getAttribute('data-min'), max = +el.getAttribute('data-max');
        var cur = +w[0][w[1]] || (/\.r$|rank$/.test(el.getAttribute('data-p')) && min >= 1 ? 1 : 0); w[0][w[1]] = Math.max(min, Math.min(max, cur + d));
      },
      mmNew: function () { var h = newHero(); S().heroes.push(h); S().cur = h.id; U.tab = 'basics'; U.confirmDel = false; },
      mmDup: function () { var c = JSON.parse(JSON.stringify(hero())); c.id = uid(); c.name = (c.name || 'Hero') + ' (copy)'; S().heroes.push(c); S().cur = c.id; },
      mmDelAsk: function () { U.confirmDel = true; },
      mmDelNo: function () { U.confirmDel = false; },
      mmDel: function () { var s = S(), id = s.cur; s.heroes = s.heroes.filter(function (x) { return x.id !== id; }); s.cur = s.heroes[0] ? s.heroes[0].id : ''; U.confirmDel = false; },
      mmSpecAdd: function (v) { var h = hero(); (h.spec = h.spec || []).push({ s: v, n: '', r: 0 }); },
      mmSpecRm: function (v) { hero().spec.splice(+v, 1); },
      mmAdvCat: function (v) { U.advCat = v; },
      mmAdvAdd: function (v) { var h = hero(); (h.adv = h.adv || []).push({ n: v, r: 1, note: '' }); },
      mmAdvRm: function (v) { hero().adv.splice(+v, 1); },
      mmPick: function (v) { U.pick = v === '1'; ui.q.mmfx = ''; },
      mmPowAdd: function (v) { var h = hero(), p = { id: uid(), name: '', effect: v, rank: 1, mods: [], desc: '' }; (h.powers = h.powers || []).push(p); U.open = p.id; U.pick = false; },
      mmOpenP: function (v) { U.open = U.open === v ? null : v; },
      mmPowRm: function (v) { hero().powers.splice(+v, 1); },
      mmPowDup: function (v) { var h = hero(), c = JSON.parse(JSON.stringify(h.powers[+v])); c.id = uid(); c.name = (c.name || c.effect) + ' (copy)'; h.powers.splice(+v + 1, 0, c); U.open = c.id; },
      mmModRm: function (v, el) { hero().powers[+el.getAttribute('data-i')].mods.splice(+v, 1); },
      mmCompAdd: function () { var h = hero(); (h.comp = h.comp || []).push({ k: (h.comp || []).some(function (c) { return c.k === 'Motivation'; }) ? 'Responsibility' : 'Motivation', t: '' }); },
      mmCompRm: function (v) { hero().comp.splice(+v, 1); },
      mmPrint: function () { root.print(); return false; },
      mmHp: function (v) { var T = hero().track = hero().track || {}; T.hp = Math.max(0, Math.min(20, (T.hp == null ? 1 : +T.hp) + +v)); },
      mmCond: function (v) { var T = hero().track = hero().track || {}, c = T.conds = T.conds || {}; if (c[v]) delete c[v]; else c[v] = 1; },
      mmHit: function () {
        var h = hero(), d = derive(h), T = h.track = h.track || {}, rank = Math.round(+U.dmgRank || 0); if (!rank) { U.hitMsg = 'Type the damage rank first.'; return; }
        if (T.dmg === 4) { U.hitMsg = 'Already incapacitated.'; return; }
        var tough = d.def.tough - (+T.bruise || 0), roll = 1 + Math.floor(Math.random() * 20), tot = roll + tough, dc = 15 + rank, how = roll + ' ' + fmt(tough) + ' = ' + tot + ' vs DC ' + dc;
        if (tot >= dc) { U.hitMsg = 'Resisted (' + how + ').'; return; }
        var deg = Math.min(4, Math.ceil((dc - tot) / 5)); if (deg === 3 && T.dmg === 3) deg = 4;
        if (deg < 4) T.bruise = (+T.bruise || 0) + 1; if (deg >= 2 && deg > (T.dmg || 0)) T.dmg = deg;
        U.hitMsg = 'Failed by ' + deg + ' degree' + (deg > 1 ? 's' : '') + ' (' + how + '): ' + (deg === 1 ? '−1 Toughness (a bruise).' : TRACK[deg] + (deg < 4 ? ' and −1 Toughness.' : '.'));
      },
      mmRecover: function () { var T = hero().track = hero().track || {}; if (T.dmg) T.dmg = T.dmg === 2 ? 0 : T.dmg - 1; else if (T.bruise) T.bruise--; U.hitMsg = ''; },
      mmFresh: function () { var T = hero().track = hero().track || {}; T.dmg = 0; T.bruise = 0; U.hitMsg = 'All healed.'; }
    };
    function onInput(t) {
      if (t.getAttribute('data-mmplay') === 'rank') { U.dmgRank = t.value; return 'none'; }
      var f = t.getAttribute('data-mmf'); if (f == null) return null;
      var w = walk(hero(), f); w[0][w[1]] = t.value; return 'save';
    }
    function onChange(t) {
      var ck = t.getAttribute('data-mmchk'); if (ck != null) { var wc = walk(hero(), ck); wc[0][wc[1]] = t.checked; return 'render'; }
      if (t.getAttribute('data-mmhero')) { S().cur = t.value; U.confirmDel = false; return 'render'; }
      var s = t.getAttribute('data-mmsel'); if (s != null) { var w = walk(hero(), s); w[0][w[1]] = /\.(v|base)$/.test(s) ? +t.value : t.value; return 'render'; }
      var a = t.getAttribute('data-mmaddmod'); if (a != null && t.value) { var m = MODS[t.value]; hero().powers[+a].mods.push({ n: t.value, v: m[2][0], r: 1, note: '' }); return 'render'; }
      if (t.getAttribute('data-mmf') != null) return 'render'; // names show in the lists
      return null;
    }
    // What the helper sees: the hero being built, with costs, limits and what's left to spend.
    function context(section) {
      if (section !== 'mm-heroes') return { where: section === 'mm-rules' ? 'M&M rules' : 'M&M', subject: 'Mutants & Masterminds 3e',
        text: 'Game: Mutants & Masterminds 3rd edition. Page: ' + (section === 'mm-rules' ? 'the rules book.' : 'the M&M home page.'),
        chips: ['Help me come up with a hero concept', 'How do power points work?', 'Explain power level limits'] };
      var h = hero(), d = derive(h), tab = (TABS.filter(function (t) { return t[0] === U.tab; })[0] || ['', ''])[1], left = d.pp.budget - d.pp.total;
      var L = ['Game: Mutants & Masterminds 3rd edition. Page: hero builder, “' + tab + '” tab.',
        'Hero: ' + (h.name || 'unnamed') + (h.identity ? ' (' + h.identity + ')' : '') + '. Power level ' + d.pl + '. Points: ' + d.pp.total + ' of ' + d.pp.budget + ' spent (' + (left >= 0 ? left + ' left' : -left + ' over') + '); abilities ' + d.pp.abilities + ', powers ' + d.pp.powers + ', advantages ' + d.pp.advantages + ', skills ' + d.pp.skills + ', defenses ' + d.pp.defenses + '.',
        'Abilities: ' + AB.map(function (a) { return a + ' ' + d.ab[a]; }).join(', ') + '.',
        'Defenses: ' + DEF.map(function (x) { return x[1] + ' ' + d.def[x[0]]; }).join(', ') + '. Initiative ' + d.init + '.',
        'Powers: ' + ((h.powers || []).map(function (p) { return (p.name || p.effect) + ' = ' + p.effect + ' ' + p.rank + (p.target ? ' (' + p.target + ')' : '') + ((p.mods || []).length ? ' with ' + p.mods.map(function (m) { return m.n + (m.r > 1 ? ' ' + m.r : ''); }).join(', ') : '') + ', ' + rangeOf(p) + ', ' + powerCost(p).cost + ' points' + (p.desc ? ' — ' + p.desc : ''); }).join('; ') || 'none') + '.',
        'Attacks: ' + d.attacks.map(function (a) { return a.n + ' ' + (a.bonus == null ? 'no attack roll' : 'attack +' + a.bonus) + ', ' + a.kind + ' ' + a.rank; }).join('; ') + '.',
        'Advantages: ' + ((h.adv || []).map(function (a) { return a.n + (a.r > 1 ? ' ' + a.r : '') + (a.note ? ' (' + a.note + ')' : ''); }).join(', ') || 'none') + '.',
        'Skills with ranks: ' + (Object.keys(d.skills).filter(function (k) { return d.skills[k].r; }).map(function (k) { return k + ' ' + d.skills[k].r + ' (+' + d.skills[k].total + ')'; }).concat((h.spec || []).filter(function (x) { return +x.r; }).map(function (x) { return x.s + ' (' + x.n + ') ' + x.r; })).join(', ') || 'none') + '.',
        'Complications: ' + ((h.comp || []).filter(function (c) { return c.t; }).map(function (c) { return c.k + ': ' + c.t; }).join('; ') || 'none yet') + '.',
        d.warnings.length ? 'Problems the app flags: ' + d.warnings.join(' | ') : 'The app flags no problems.',
        d.notes && d.notes.length ? 'Notes for the GM: ' + d.notes.join(' | ') : '', h.notes ? 'Player notes: ' + h.notes : ''];
      var chips = [];
      if (!(h.powers || []).length) chips.push('Help me come up with a hero concept');
      if (left > 0) chips.push('How should I spend my last ' + left + ' points?');
      if (d.warnings.length) chips.push('Explain what the app is warning me about');
      if (U.tab === 'powers') chips.push('Suggest powers that fit my hero');
      else chips.push('Is my hero built well for PL ' + d.pl + '?');
      L.push('Changes you can propose (one per line, exact names from the rules):\n' +
        '[[ability: STR | 4]] ranks bought (STR STA AGL DEX FGT INT AWE PRE)\n[[defense: Dodge | 6]] ranks bought (Dodge, Parry, Fortitude, Will)\n[[skill: Perception | 8]]\n' +
        '[[advantage: Power Attack | 1 | details]]\n[[power: Fire Blast | Damage | 10 | Increased Range, Area | description]] name, effect, rank, extras/flaws (optional), description (optional)\n' +
        '[[complication: Motivation | Protect the innocent]]\n[[name: Hero name]] [[pl: 10]]');
      return { where: (h.name || 'Hero') + ' · ' + tab, subject: 'your hero', text: L.filter(Boolean).join('\n'), chips: chips.slice(0, 4), apply: apply };
    }
    // A change the helper proposed and the user tapped "Apply" on. Checked against the rules data; returns what was done.
    function find(list, n) { n = String(n || '').trim().toLowerCase(); return list.filter(function (x) { return x[0].toLowerCase() === n; })[0]; }
    function num(v, lo, hi) { var n = Math.round(+v); if (isNaN(n)) throw new Error('“' + v + '” is not a number'); return Math.max(lo, Math.min(hi, n)); }
    function apply(verb, a) {
      var h = hero();
      if (verb === 'ability') { var ab = String(a[0]).toUpperCase().slice(0, 3), A = M.abilities.filter(function (x) { return x[0] === ab || x[1].toUpperCase().slice(0, 3) === ab; })[0]; if (!A) throw new Error('No ability “' + a[0] + '”'); h.ab[A[0]] = num(a[1], -5, 20); return A[1] + ' set to ' + h.ab[A[0]]; }
      if (verb === 'defense') { var D = DEF.filter(function (x) { return x[0] === String(a[0]).toLowerCase() || x[1].toLowerCase() === String(a[0]).toLowerCase(); })[0]; if (!D || D[0] === 'tough') throw new Error('Can’t buy “' + a[0] + '” directly'); h.def[D[0]] = num(a[1], 0, 30); return D[1] + ' ranks set to ' + h.def[D[0]]; }
      if (verb === 'skill') {
        var s = find(M.skills, a[0]);
        if (s && !s[3]) { h.skills[s[0]] = num(a[1], 0, 30); return s[0] + ' ranks set to ' + h.skills[s[0]]; }
        var m = /^(close combat|ranged combat|expertise)\s*[:(—-]?\s*(.*?)\)?$/i.exec(String(a[0]).trim()); if (!m) throw new Error('No skill “' + a[0] + '”');
        var kind = m[1].replace(/\b\w/g, function (c) { return c.toUpperCase(); }), sp = (h.spec = h.spec || []).filter(function (x) { return x.s === kind && x.n.toLowerCase() === m[2].toLowerCase(); })[0];
        if (!sp) h.spec.push(sp = { s: kind, n: m[2], r: 0 }); sp.r = num(a[1], 0, 30); return kind + ' (' + (m[2] || '?') + ') ranks set to ' + sp.r;
      }
      if (verb === 'advantage') {
        var v = find(M.advantages, a[0]); if (!v) throw new Error('No advantage “' + a[0] + '”');
        var have = (h.adv = h.adv || []).filter(function (x) { return x.n === v[0]; })[0];
        if (have && !v[4]) { if (v[2]) have.r = num(a[1] || 1, 1, v[2] > 0 ? v[2] : 40); return v[0] + (v[2] ? ' now rank ' + have.r : ' was already there'); }
        h.adv.push({ n: v[0], r: v[2] ? num(a[1] || 1, 1, v[2] > 0 ? v[2] : 40) : 1, note: a[2] || '' }); return 'Added ' + v[0];
      }
      if (verb === 'power') {
        var e = find(M.effects, a[1]); if (!e) throw new Error('No effect “' + a[1] + '”');
        var mods = String(a[3] || '').split(',').map(function (x) { return x.trim(); }).filter(Boolean).map(function (x) {
          var k = Object.keys(MODS).filter(function (n) { return n.toLowerCase() === x.replace(/\s*[x×]?\s*\d+$/, '').toLowerCase(); })[0]; if (!k) throw new Error('No extra or flaw “' + x + '”');
          return { n: k, v: MODS[k][2][0], r: +((/(\d+)$/.exec(x) || [0, 1])[1]) || 1, note: '' };
        });
        var p = { id: uid(), name: String(a[0] || '').trim(), effect: e[0], rank: num(a[2] || 1, 1, 40), mods: mods, desc: a[4] || '' };
        (h.powers = h.powers || []).push(p); U.open = p.id; return 'Added ' + (p.name || e[0]) + ' (' + e[0] + ' ' + p.rank + ', ' + powerCost(p).cost + ' points)';
      }
      if (verb === 'complication') { var c = find(M.complications, a[0]); if (!c) throw new Error('No complication kind “' + a[0] + '”'); var blank = (h.comp = h.comp || []).filter(function (x) { return x.k === c[0] && !x.t; })[0]; if (blank) blank.t = a[1] || ''; else h.comp.push({ k: c[0], t: a[1] || '' }); return 'Added ' + c[0] + ': ' + (a[1] || ''); }
      if (verb === 'name') { h.name = String(a[0] || '').trim(); return 'Named ' + h.name; }
      if (verb === 'pl') { h.pl = num(a[0], 1, 20); return 'Power level ' + h.pl; }
      throw new Error('Unknown change “' + verb + '”');
    }
    function html(section) { return section === 'mm-home' ? home() : heroes(); }
    function title(section) { return section === 'mm-home' ? 'M&M 3e' : (hero().name || 'Heroes') + ' — M&M'; }
    return { html: html, actions: actions, onInput: onInput, onChange: onChange, title: title, context: context };
  };
  root.MMRules = { derive: derive, powerCost: powerCost, newHero: newHero, book: book, rangeOf: rangeOf };
})(typeof window !== 'undefined' ? window : globalThis);
