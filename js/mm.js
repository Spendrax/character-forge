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
      var nm = p.name || p.effect, rank = +p.rank || 0;
      var bonus = area || range === 'Perception' ? null : (range === 'Ranged' ? rangedBase + spec('Ranged Combat', nm) : closeBase + spec('Close Combat', nm)) + acc;
      var resist = p.effect === 'Damage' ? 'Toughness' : p.effect === 'Affliction' || p.effect === 'Weaken' ? (p.resist || 'Fortitude or Will') : p.effect === 'Nullify' ? 'rank or Will' : '';
      out.attacks.push({ n: nm, range: range + (area ? ', area' : ''), bonus: bonus, rank: rank, kind: p.effect, resist: resist, dc: (p.effect === 'Damage' ? 15 : 10) + rank, power: p.id });
    });
    // limits
    if (out.pp.total > budget) out.warnings.push('Spent ' + out.pp.total + ' of ' + budget + ' power points (' + (out.pp.total - budget) + ' over).');
    out.attacks.forEach(function (a) {
      if (a.bonus == null) { if (a.rank > pl) out.warnings.push(a.n + ': rank ' + a.rank + ' is above power level ' + pl + ' (no attack roll, so rank ≤ PL).'); }
      else if (a.bonus + a.rank > 2 * pl) out.warnings.push(a.n + ': attack +' + a.bonus + ' and rank ' + a.rank + ' add up to ' + (a.bonus + a.rank) + ', over ' + 2 * pl + ' (2 × PL).');
    });
    var D = out.def, cap = function (x, y, a, b) { if (x + y > 2 * pl) out.warnings.push(a + ' + ' + b + ' = ' + (x + y) + ', over ' + 2 * pl + ' (2 × PL).'); };
    cap(D.dodge, D.tough, 'Dodge', 'Toughness'); cap(D.parry, D.tough, 'Parry', 'Toughness'); cap(D.fort, D.will, 'Fortitude', 'Will');
    Object.keys(out.skills).forEach(function (s) { if (out.skills[s].total > pl + 10) out.warnings.push(s + ' +' + out.skills[s].total + ' is over ' + (pl + 10) + ' (PL + 10).'); });
    (h.spec || []).forEach(function (x) { if (x.s === 'Expertise' && x._total > pl + 10) out.warnings.push('Expertise: ' + (x.n || '?') + ' +' + x._total + ' is over ' + (pl + 10) + ' (PL + 10).'); });
    (h.adv || []).forEach(function (a) { var mx = ADV[a.n] && ADV[a.n][2]; if (mx > 0 && (+a.r || 1) > mx) out.warnings.push(a.n + ' goes up to ' + mx + ' ranks.'); if (a.n === 'Luck' && (+a.r || 1) > Math.floor(pl / 2)) out.warnings.push('Luck goes up to half the power level (' + Math.floor(pl / 2) + ').'); });
    var comps = (h.comp || []).filter(function (c) { return String(c.t || '').trim(); });
    if (comps.length < 2) out.warnings.push('Heroes need at least two complications, one of them a Motivation.');
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
        '**Limits by power level:**\n\n- Attack bonus + effect rank ≤ 2 × PL (effects with no attack roll: rank ≤ PL)\n- Dodge + Toughness ≤ 2 × PL, and Parry + Toughness ≤ 2 × PL\n- Fortitude + Will ≤ 2 × PL\n- Skill bonus ≤ PL + 10\n\nToughness can’t be bought directly: it comes from Stamina, the Protection effect and the Defensive Roll advantage.'),
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
    var TABS = [['basics', 'Basics'], ['abilities', 'Abilities'], ['powers', 'Powers'], ['advantages', 'Advantages'], ['skills', 'Skills'], ['defenses', 'Defenses'], ['complications', 'Complications'], ['sheet', 'Sheet']];

    function home() {
      var hs = S().heroes.filter(function (h) { return h.name || (h.powers || []).length; });
      var tile = function (sec, ic, name, text, extra) { return '<div class="home-tile"><button type="button" class="home-main" data-act="section" data-v="' + sec + '"><span class="home-icon" aria-hidden="true">' + root.Icon(ic) + '</span><b>' + name + '</b><span>' + text + '</span></button>' + (extra || '') + '</div>'; };
      return '<main class="home"><h1>Mutants &amp; Masterminds</h1><p class="muted">Your superhero table companion (3rd edition).</p><div class="home-grid">' +
        tile('mm-heroes', 'bolt', 'Heroes', 'Build heroes with power points: abilities, powers with extras and flaws, advantages, skills and complications, with the power level limits checked as you go.',
          hs.length ? '<div class="home-list">' + hs.slice(0, 6).map(function (h) { var d = derive(h); return '<button type="button" class="home-char" data-act="mmOpen" data-v="' + h.id + '"><b>' + esc(h.name || 'Unnamed hero') + '</b><span class="small muted">PL ' + d.pl + ' · ' + d.pp.total + '/' + d.pp.budget + ' points</span></button>'; }).join('') + '</div>' : '') +
        tile('mm-rules', 'book', 'Rules', 'Every ability, skill, advantage, power effect, extra, flaw and condition, plus the core rules, all searchable. Add your own books (PDF) too.') +
        tile('audio', 'lute', 'Audio', 'Music by mood for the table, shared with D&D.') +
        tile('rules', 'scroll', 'House rules', 'Your table’s own rules for M&M, kept apart from the D&D ones.') +
        '</div></main>';
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
      var body = { basics: basics, abilities: abilities, powers: powers, advantages: advantages, skills: skills, defenses: defenses, complications: complications, sheet: sheet }[U.tab] || basics;
      return h2 + '<div class="mm-body">' + body(h, d) + '</div>' + (d.warnings.length && U.tab !== 'sheet' ? '<div class="panel mm-warns"><b>To check</b><ul>' + d.warnings.map(function (w) { return '<li>' + esc(w) + '</li>'; }).join('') + '</ul></div>' : '') + '</main>';
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
      return '<h2>Skills</h2><p class="muted">1 point per 2 ranks. Bonus = ability + ranks, up to PL + 10 (' + (d.pl + 10) + ').</p><div class="mm-rows">' +
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
        (opts || target || resist ? '<div class="row">' + opts + target + resist + '</div>' : '') +
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
          return '<div class="feature"><b>' + esc(p.name || p.effect) + ':</b> ' + esc(p.effect) + ' ' + p.rank + (p.target ? ' (' + esc(p.target.split(':')[1]) + ')' : '') + (m.length ? ', ' + esc(m.join(', ')) : '') + ' <span class="lv">' + p._cost + ' pts</span>' + (p.desc ? '<div>' + esc(p.desc) + '</div>' : '') + '</div>';
        }).join('') : '<p class="muted">None.</p>') +
        '<h3>Advantages</h3><p>' + ((h.adv || []).map(function (a) { var def = ADV[a.n]; return esc(a.n + (def && def[2] && (+a.r || 1) > 1 ? ' ' + a.r : '') + (a.note ? ' (' + a.note + ')' : '')); }).join(', ') || '—') + '</p>' +
        '<h3>Skills</h3><p>' + (esc(sk.join(', ')) || '—') + '</p>' +
        '<h3>Complications</h3>' + ((h.comp || []).filter(function (c) { return c.t; }).map(function (c) { return '<p><b>' + esc(c.k) + ':</b> ' + esc(c.t) + '</p>'; }).join('') || '<p>—</p>') +
        (d.warnings.length ? '<h3>To check</h3><ul>' + d.warnings.map(function (w) { return '<li>' + esc(w) + '</li>'; }).join('') + '</ul>' : '') +
        (h.notes ? '<h3>Notes</h3><p>' + esc(h.notes).replace(/\n/g, '<br>') + '</p>' : '') + '</article>';
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
      mmPrint: function () { root.print(); return false; }
    };
    function onInput(t) {
      var f = t.getAttribute('data-mmf'); if (f == null) return null;
      var w = walk(hero(), f); w[0][w[1]] = t.value; return 'save';
    }
    function onChange(t) {
      if (t.getAttribute('data-mmhero')) { S().cur = t.value; U.confirmDel = false; return 'render'; }
      var s = t.getAttribute('data-mmsel'); if (s != null) { var w = walk(hero(), s); w[0][w[1]] = /\.(v|base)$/.test(s) ? +t.value : t.value; return 'render'; }
      var a = t.getAttribute('data-mmaddmod'); if (a != null && t.value) { var m = MODS[t.value]; hero().powers[+a].mods.push({ n: t.value, v: m[2][0], r: 1, note: '' }); return 'render'; }
      if (t.getAttribute('data-mmf') != null) return 'render'; // names show in the lists
      return null;
    }
    function html(section) { return section === 'mm-home' ? home() : heroes(); }
    function title(section) { return section === 'mm-home' ? 'M&M 3e' : (hero().name || 'Heroes') + ' — M&M'; }
    return { html: html, actions: actions, onInput: onInput, onChange: onChange, title: title };
  };
  root.MMRules = { derive: derive, powerCost: powerCost, newHero: newHero, book: book, rangeOf: rangeOf };
})(typeof window !== 'undefined' ? window : globalThis);
