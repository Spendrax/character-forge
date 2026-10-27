// Mutants & Masterminds 3e: hero builder, point costs and power level limits, and the rules book.
// Heroes are kept apart from the D&D characters (store.mm). Data in data/mm.js.
(function (root) {
  'use strict';
  var M = root.MM;
  var AB = M.abilities.map(function (a) {
    return a[0];
  });
  var DEF = [
    ['dodge', 'Dodge', 'AGL'],
    ['parry', 'Parry', 'FGT'],
    ['fort', 'Fortitude', 'STA'],
    ['tough', 'Toughness', 'STA'],
    ['will', 'Will', 'AWE']
  ];
  var SK = {};
  M.skills.forEach(function (s) {
    SK[s[0]] = s;
  });
  var ADV = {};
  M.advantages.forEach(function (a) {
    ADV[a[0]] = a;
  });
  var FX = {};
  M.effects.forEach(function (e) {
    FX[e[0]] = e;
  });
  var MODS = {};
  M.extras.concat(M.flaws).forEach(function (m) {
    MODS[m[0]] = m;
  });
  var RANGES = ['Personal', 'Close', 'Ranged', 'Perception'];

  function uid() {
    return 'h' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }
  function newHero() {
    var ab = {};
    AB.forEach(function (a) {
      ab[a] = 0;
    });
    return {
      id: uid(),
      name: '',
      player: '',
      identity: '',
      group: '',
      pl: 10,
      extra: 0,
      ab: ab,
      def: { dodge: 0, parry: 0, fort: 0, will: 0 },
      skills: {},
      spec: [{ s: 'Close Combat', n: 'Unarmed', r: 0 }],
      adv: [],
      powers: [],
      comp: [{ k: 'Motivation', t: '' }],
      notes: '',
      hp: 1
    };
  }

  // ---------- costs ----------
  function enhancedBase(target) {
    var t = String(target || '').split(':')[0];
    return t === 'ab' ? 2 : t === 'skill' ? 0.5 : 1;
  }
  function baseCost(p) {
    var e = FX[p.effect];
    if (!e) return 1;
    if (p.effect === 'Enhanced Trait') return enhancedBase(p.target);
    return Array.isArray(e[5]) ? (p.base != null && e[5].indexOf(+p.base) >= 0 ? +p.base : e[5][0]) : e[5];
  }
  // Cost of a power: (base + per-rank modifiers) × rank, or 1 point per 2, 3… ranks once that drops below 1; then flat modifiers; never below 1.
  function powerCost(p) {
    var per = baseCost(p),
      flat = 0,
      rank = Math.max(1, +p.rank || 1),
      removable = 0;
    (p.mods || []).forEach(function (m) {
      var d = MODS[m.n];
      if (!d) return;
      var v = +m.v,
        r = Math.max(1, +m.r || 1);
      if (d[1] === 'rank') per += v * r;
      else if (d[1] === 'flat') flat += v * r;
      else removable = v;
    });
    var cost =
      per >= 1 ? Math.ceil(per * rank - 1e-9) : per > 0 ? Math.ceil(rank * per - 1e-9) : Math.ceil(rank / (2 - per));
    cost += flat;
    if (removable) cost += Math.floor(Math.max(0, cost) / 5) * removable;
    return { per: per, cost: Math.max(1, cost) };
  }
  function rangeOf(p) {
    var i = RANGES.indexOf((FX[p.effect] || [])[3]);
    if (i < 0) return (FX[p.effect] || [])[3] || '';
    (p.mods || []).forEach(function (m) {
      var r = Math.max(1, +m.r || 1);
      if (m.n === 'Increased Range') i += r;
      if (m.n === 'Reduced Range') i -= r;
    });
    return RANGES[Math.max(0, Math.min(3, i))];
  }
  function modCount(p, name) {
    var n = 0;
    (p.mods || []).forEach(function (m) {
      if (m.n === name) n += Math.max(1, +m.r || 1);
    });
    return n;
  }

  // ---------- everything worked out from a hero ----------
  function derive(h) {
    var out = { warnings: [], pp: {}, ab: {}, def: {}, skills: {}, attacks: [] };
    var pl = Math.max(1, +h.pl || 1),
      budget = 15 * pl + (+h.extra || 0),
      enh = {};
    var advRank = function (n) {
      var t = 0;
      (h.adv || []).forEach(function (a) {
        if (a.n === n) t += ADV[a.n] && ADV[a.n][2] ? Math.max(1, +a.r || 1) : 1;
      });
      return t + (enh['adv:' + n] || 0);
    };
    var powerPts = 0,
      protection = 0;
    (h.powers || []).forEach(function (p) {
      var c = powerCost(p);
      p._cost = c.cost;
      powerPts += c.cost;
      if (p.effect === 'Enhanced Trait' && p.target) enh[p.target] = (enh[p.target] || 0) + (+p.rank || 0);
      if (p.effect === 'Protection') protection += +p.rank || 0;
    });
    AB.forEach(function (a) {
      out.ab[a] = (+h.ab[a] || 0) + (enh['ab:' + a] || 0);
    });
    DEF.forEach(function (d) {
      var bought = d[0] === 'tough' ? 0 : +h.def[d[0]] || 0;
      out.def[d[0]] =
        out.ab[d[2]] +
        bought +
        (enh['def:' + d[0]] || 0) +
        (d[0] === 'tough' ? protection + advRank('Defensive Roll') : 0);
    });
    var skillRanks = 0;
    M.skills.forEach(function (s) {
      if (s[3]) return;
      var r = +((h.skills || {})[s[0]] || 0);
      skillRanks += r;
      out.skills[s[0]] = { r: r, total: out.ab[s[1]] + r + (enh['skill:' + s[0]] || 0), ab: s[1] };
    });
    (h.spec || []).forEach(function (x) {
      var r = +x.r || 0;
      skillRanks += r;
      x._total = out.ab[SK[x.s] ? SK[x.s][1] : 'INT'] + r + (enh['skill:' + x.s + ': ' + x.n] || 0);
    });
    var advPts = 0;
    (h.adv || []).forEach(function (a) {
      advPts += ADV[a.n] && ADV[a.n][2] ? Math.max(1, +a.r || 1) : 1;
    });
    var abPts = 0;
    AB.forEach(function (a) {
      abPts += 2 * (+h.ab[a] || 0);
    });
    var defPts = 0;
    ['dodge', 'parry', 'fort', 'will'].forEach(function (d) {
      defPts += +h.def[d] || 0;
    });
    out.pp = {
      abilities: abPts,
      powers: powerPts,
      advantages: advPts,
      skills: Math.ceil(skillRanks / 2),
      defenses: defPts
    };
    out.pp.total = abPts + powerPts + advPts + out.pp.skills + defPts;
    out.pp.budget = budget;
    out.pl = pl;
    out.init = out.ab.AGL + 4 * advRank('Improved Initiative');
    // attacks
    var spec = function (skill, name) {
      var b = 0;
      (h.spec || []).forEach(function (x) {
        if (x.s === skill && String(x.n).toLowerCase() === String(name).toLowerCase()) b = Math.max(b, +x.r || 0);
      });
      return b;
    };
    var closeBase = out.ab.FGT + advRank('Close Attack'),
      rangedBase = out.ab.DEX + advRank('Ranged Attack');
    out.attacks.push({
      n: 'Unarmed',
      range: 'Close',
      bonus: closeBase + spec('Close Combat', 'Unarmed'),
      rank: out.ab.STR,
      kind: 'Damage',
      resist: 'Toughness',
      dc: 15 + out.ab.STR
    });
    (h.powers || []).forEach(function (p) {
      var e = FX[p.effect];
      if (!e || (e[1] !== 'Attack' && modCount(p, 'Attack') === 0)) return;
      var range = rangeOf(p),
        area = modCount(p, 'Area') > 0,
        acc = 2 * modCount(p, 'Accurate') - 2 * modCount(p, 'Inaccurate');
      var nm = p.name || p.effect,
        strB = p.effect === 'Damage' && p.str && range === 'Close',
        rank = (+p.rank || 0) + (strB ? out.ab.STR : 0); // Strength-based damage adds Strength
      var bonus =
        area || range === 'Perception'
          ? null
          : (range === 'Ranged' ? rangedBase + spec('Ranged Combat', nm) : closeBase + spec('Close Combat', nm)) + acc;
      var resist =
        p.effect === 'Damage'
          ? 'Toughness'
          : p.effect === 'Affliction' || p.effect === 'Weaken'
            ? p.resist || 'Fortitude or Will'
            : p.effect === 'Nullify'
              ? 'rank or Will'
              : '';
      out.attacks.push({
        n: nm,
        range: range + (area ? ', area' : ''),
        bonus: bonus,
        rank: rank,
        kind: p.effect,
        resist: resist,
        dc: (p.effect === 'Damage' ? 15 : 10) + rank,
        power: p.id
      });
    });
    // resisted effects with no attack roll (mind reading, illusions): rank ≤ PL
    (h.powers || []).forEach(function (p) {
      if (/^(Mind Reading|Illusion)$/.test(p.effect) && (+p.rank || 0) > pl)
        out.warnings.push(
          (p.name || p.effect) +
            ': rank ' +
            p.rank +
            ' is above power level ' +
            pl +
            ' (resisted with no attack roll, so rank ≤ PL).'
        );
    });
    // limits
    if (out.pp.total > budget)
      out.warnings.push(
        'Spent ' + out.pp.total + ' of ' + budget + ' power points (' + (out.pp.total - budget) + ' over).'
      );
    out.attacks.forEach(function (a) {
      if (a.bonus == null) {
        if (a.rank > pl)
          out.warnings.push(
            a.n + ': rank ' + a.rank + ' is above power level ' + pl + ' (no attack roll, so rank ≤ PL).'
          );
      } else if (a.bonus + a.rank > 2 * pl)
        out.warnings.push(
          a.n +
            ': attack +' +
            a.bonus +
            ' and rank ' +
            a.rank +
            ' add up to ' +
            (a.bonus + a.rank) +
            ', over ' +
            2 * pl +
            ' (2 × PL).'
        );
    });
    var D = out.def,
      cap = function (x, y, a, b) {
        if (x + y > 2 * pl) out.warnings.push(a + ' + ' + b + ' = ' + (x + y) + ', over ' + 2 * pl + ' (2 × PL).');
      };
    cap(D.dodge, D.tough, 'Dodge', 'Toughness');
    cap(D.parry, D.tough, 'Parry', 'Toughness');
    cap(D.fort, D.will, 'Fortitude', 'Will');
    var abWarned = {};
    Object.keys(out.skills).forEach(function (s) {
      var x = out.skills[s];
      if (x.total <= pl + 10) return;
      if (!x.r) {
        if (abWarned[x.ab]) return;
        abWarned[x.ab] = 1;
        out.warnings.push(
          M.abilities.filter(function (a) {
            return a[0] === x.ab;
          })[0][1] +
            ' ' +
            out.ab[x.ab] +
            ' is over ' +
            (pl + 10) +
            ': even untrained, ' +
            s +
            ' would be +' +
            x.total +
            ' (skills are limited to PL + 10).'
        );
      } else out.warnings.push(s + ' +' + x.total + ' is over ' + (pl + 10) + ' (PL + 10).');
    });
    (h.spec || []).forEach(function (x) {
      if (x.s === 'Expertise' && x._total > pl + 10)
        out.warnings.push('Expertise: ' + (x.n || '?') + ' +' + x._total + ' is over ' + (pl + 10) + ' (PL + 10).');
    });
    (h.adv || []).forEach(function (a) {
      var mx = ADV[a.n] && ADV[a.n][2];
      if (mx > 0 && (+a.r || 1) > mx) out.warnings.push(a.n + ' goes up to ' + mx + ' ranks.');
      if (a.n === 'Luck' && (+a.r || 1) > Math.floor(pl / 2))
        out.warnings.push('Luck goes up to half the power level (' + Math.floor(pl / 2) + ').');
    });
    var comps = (h.comp || []).filter(function (c) {
      return String(c.t || '').trim();
    });
    if (comps.length < 2) out.warnings.push('Heroes need at least two complications, one of them a Motivation.');
    out.notes = [];
    var gap = function (x, y, a, b) {
      var hi = Math.max(x, y),
        lo = Math.min(x, y);
      if (x + y >= pl && hi > 1.5 * Math.max(lo, 1))
        out.notes.push(
          a +
            ' ' +
            x +
            ' and ' +
            b +
            ' ' +
            y +
            ' are far apart (more than 50%): the rules ask the GM to look at that closely.'
        );
    };
    gap(D.dodge, D.tough, 'Dodge', 'Toughness');
    gap(D.parry, D.tough, 'Parry', 'Toughness');
    gap(D.fort, D.will, 'Fortitude', 'Will');
    out.attacks.forEach(function (a) {
      if (a.bonus != null && a.rank) gap(a.bonus, a.rank, a.n + ' attack', 'rank');
    });
    return out;
  }

  // ---------- the rules book (summaries; full text at d20herosrd.com) ----------
  function book() {
    var P = function (t, md) {
      return { t: t, md: '# ' + t + '\n\n' + md };
    };
    var costTxt = function (c) {
      return Array.isArray(c) ? c.join('–').replace('0.5', '½') + ' per rank' : (c === 0.5 ? '½' : c) + ' per rank';
    };
    var modCost = function (m) {
      var v = m[2]
        .map(function (x) {
          return (x > 0 ? '+' : '') + x;
        })
        .join(' or ');
      return m[1] === 'rank'
        ? v + ' per rank'
        : m[1] === 'flat'
          ? v + ' flat' + (m[3] ? ' (each time)' : '')
          : v + ' per 5 points';
    };
    var basics = [
      P(
        'The core check',
        'Roll a d20, add your bonus (an ability, a skill, an attack…) and compare to a difficulty class (**DC**). Meet or beat it and you succeed.\n\n| DC | Difficulty |\n|---|---|\n| 0 | Very easy |\n| 5 | Easy |\n| 10 | Average |\n| 15 | Tough |\n| 20 | Challenging |\n| 25 | Formidable |\n| 30 | Heroic |\n| 35 | Super-heroic |\n| 40 | Nigh-impossible |\n\n' +
          '**Degrees:** every full 5 points you beat (or miss) the DC by is another degree of success (or failure). Many effects get worse with each degree of failure.\n\n**Routine checks:** when nothing is at stake, take 10 + your bonus instead of rolling.\n\n**Opposed checks:** both sides roll; the higher total wins.\n\n**Natural 20:** on an attack it is a critical hit; on other checks it adds a degree of success.'
      ),
      P(
        'Hero points and extra effort',
        '**Hero points:** you start each adventure with 1 and earn more when your complications cause you trouble. Spend one to re-roll a check (a roll of 10 or less becomes 10 + the roll), to recover from a condition, to get an edit to the scene, to gain an instant counter, or to use an advantage that needs one.\n\n' +
          '**Extra effort:** push yourself for a burst: +2 on a check, an extra rank in a power, an extra action, a temporary power stunt, or ignoring a condition. Afterwards you are fatigued (spend a hero point to avoid it).'
      ),
      P(
        'Power level and power points',
        'The **power level (PL)** sets how strong heroes are; a typical game is PL 10. Heroes get **15 power points per PL**.\n\n| Trait | Cost |\n|---|---|\n| Ability | 2 per rank |\n| Defense (Dodge, Parry, Fortitude, Will) | 1 per rank |\n| Skill | 1 per 2 ranks |\n| Advantage | 1 per rank |\n| Power | Effect cost + extras − flaws, per rank, plus flat modifiers |\n\n' +
          '**Limits by power level:**\n\n- Attack bonus + effect rank ≤ 2 × PL (resisted effects with no attack roll, like area and perception effects: rank ≤ PL). Unarmed damage is your Strength, so close attack + Strength counts too.\n- Dodge + Toughness ≤ 2 × PL, and Parry + Toughness ≤ 2 × PL\n- Fortitude + Will ≤ 2 × PL\n- Skill bonus ≤ PL + 10, including skills used untrained (ability alone)\n\nThere is no separate cap on abilities: the skill and attack limits hold them in check. Paired traits don’t have to be equal, but the rules ask the GM to look closely at a gap of more than 50%.\n\nToughness can’t be bought directly: it comes from Stamina, the Protection effect and the Defensive Roll advantage.'
      ),
      P(
        'Complications',
        'Every hero has at least two complications, one of them a **Motivation**. When a complication makes life harder in play, the GM awards a hero point.\n\n' +
          M.complications
            .map(function (c) {
              return '**' + c[0] + '.** ' + c[1];
            })
            .join('\n\n')
      )
    ];
    var abil = [
      P(
        'Abilities',
        'Abilities run from −5 to 20; 0 is an average adult, 2 is above average, 5 is the human peak. Each rank costs 2 points.\n\n' +
          M.abilities
            .map(function (a) {
              return '**' + a[1] + ' (' + a[0] + ').** ' + a[2];
            })
            .join('\n\n') +
          '\n\n## Defenses\n\n- **Dodge** (Agility): avoiding ranged attacks and area effects.\n- **Parry** (Fighting): fending off close attacks.\n- **Fortitude** (Stamina): resisting poisons, diseases and fatigue.\n- **Toughness** (Stamina): resisting damage; raised only by powers and Defensive Roll.\n- **Will** (Awareness): resisting mind control and other mental effects.\n\nDodge and Parry set the DC to hit you: **10 + the defense**.'
      )
    ];
    var skills = [
      P(
        'Skills',
        'Skill bonus = ability + ranks. Ranks cost 1 point per 2. Close Combat, Ranged Combat and Expertise are bought for a specific attack or field.\n\n| Skill | Ability | Use |\n|---|---|---|\n' +
          M.skills
            .map(function (s) {
              return '| ' + s[0] + ' | ' + s[1] + ' | ' + s[2] + ' |';
            })
            .join('\n')
      )
    ];
    var advs = ['Combat', 'Fortune', 'General', 'Skill'].map(function (cat) {
      return P(
        cat + ' advantages',
        'Each advantage costs 1 point (per rank, if ranked).\n\n' +
          M.advantages
            .reduce(function (out, a) {
              if (a[1] === cat)
                out.push(
                  '## ' +
                    a[0] +
                    '\n\n*' +
                    (a[2] ? (a[2] > 0 ? 'Ranked, up to ' + a[2] : 'Ranked') : 'Not ranked') +
                    '*\n\n' +
                    a[3]
                );
              return out;
            }, [])
            .join('\n\n')
      );
    });
    var fx = ['Attack', 'Control', 'Defense', 'General', 'Movement', 'Sensory'].map(function (ty) {
      return P(
        ty + ' effects',
        M.effects
          .reduce(function (out, e) {
            if (e[1] === ty)
              out.push(
                '## ' +
                  e[0] +
                  '\n\n**Action** ' +
                  e[2] +
                  ' · **Range** ' +
                  e[3] +
                  ' · **Duration** ' +
                  e[4] +
                  ' · **Cost** ' +
                  costTxt(e[5]) +
                  '\n\n' +
                  e[6]
              );
            return out;
          }, [])
          .join('\n\n')
      );
    });
    var mods = [
      P(
        'How modifiers work',
        'Extras raise a power’s cost, flaws lower it. **Per-rank** modifiers change the cost of every rank; **flat** modifiers add or remove points once (or once per application).\n\nIf the cost per rank drops below 1, the power costs 1 point per 2 ranks at 0, per 3 ranks at −1, and so on. Flaws can’t lower a power below 1 point.'
      ),
      P(
        'Extras',
        M.extras
          .map(function (m) {
            return '## ' + m[0] + '\n\n*' + modCost(m) + '*\n\n' + m[4];
          })
          .join('\n\n')
      ),
      P(
        'Flaws',
        M.flaws
          .map(function (m) {
            return '## ' + m[0] + '\n\n*' + modCost(m) + '*\n\n' + m[4];
          })
          .join('\n\n')
      )
    ];
    var combat = [
      P(
        'Actions and initiative',
        'Each turn you get a **standard action**, a **move action** and any number of **free actions**; you can trade the standard action for a second move. **Reactions** happen on others’ turns.\n\n**Initiative:** Agility + Improved Initiative (+4 per rank), rolled with a d20 at the start of a fight.'
      ),
      P(
        'Attacks and resistance',
        '**Attack check:** d20 + attack bonus against 10 + the target’s Dodge (ranged) or Parry (close). A natural 20 is a critical hit: +5 to the effect, or an extra effect. Area and perception-range effects need no attack roll.\n\n' +
          '**Damage:** the target makes a Toughness check against DC 15 + the damage rank.\n\n| Result | Effect |\n|---|---|\n| Success | No effect |\n| 1 degree of failure | −1 on further Toughness checks (bruised) |\n| 2 degrees | Dazed and −1 |\n| 3 degrees | Staggered and −1 |\n| 4 degrees | Incapacitated |\n\n' +
          '**Afflictions:** the target resists against DC 10 + rank; each degree of failure brings the next condition chosen for the power. They can try again at the end of each turn.\n\n**Recovery:** the −1 penalties from damage go away at one per minute of rest.'
      ),
      P(
        'Conditions',
        M.conditions
          .map(function (c) {
            return '**' + c[0] + '** *(' + c[1].toLowerCase() + ')*. ' + c[2];
          })
          .join('\n\n')
      )
    ];
    return {
      id: 'mm',
      title: 'M&M 3e rules (summaries)',
      chapters: [
        { t: 'Basics', parts: basics },
        { t: 'Abilities and defenses', parts: abil },
        { t: 'Skills', parts: skills },
        { t: 'Advantages', parts: advs },
        { t: 'Power effects', parts: fx },
        { t: 'Extras and flaws', parts: mods },
        { t: 'Combat', parts: combat }
      ]
    };
  }

  // ---------- the screens ----------
  root.MMUI = function (api) {
    var esc = api.esc,
      btn = api.btn,
      ui = api.ui,
      store = api.store;
    var S = function () {
      return (store.mm = store.mm || { heroes: [], cur: '' });
    };
    var U = (ui.mm = ui.mm || { tab: 'basics', advCat: '', open: null, pick: false });
    function hero() {
      var s = S();
      if (!s.heroes.length) {
        var h = newHero();
        s.heroes.push(h);
        s.cur = h.id;
      }
      var cur = s.heroes.filter(function (x) {
        return x.id === s.cur;
      })[0];
      if (!cur) {
        cur = s.heroes[0];
        s.cur = cur.id;
      }
      return cur;
    }
    function step(path, v, min, max, label) {
      return (
        '<span class="mm-step">' +
        btn('mmStep', '−', { p: path, d: -1, min: min, max: max }, 'mm-b') +
        '<b aria-label="' +
        esc(label || path) +
        '">' +
        (v > 0 && /^(ab|bonus)/.test(label || '') ? '+' : '') +
        v +
        '</b>' +
        btn('mmStep', '+', { p: path, d: 1, min: min, max: max }, 'mm-b') +
        '</span>'
      );
    }
    function txt(path, v, ph, label, area) {
      var id = 'mm-' + path.replace(/\W/g, '-');
      return (
        '<label class="field"><span>' +
        esc(label) +
        '</span>' +
        (area
          ? '<textarea id="' +
            id +
            '" data-mmf="' +
            path +
            '" placeholder="' +
            esc(ph || '') +
            '">' +
            esc(v || '') +
            '</textarea>'
          : '<input type="text" id="' +
            id +
            '" data-mmf="' +
            path +
            '" value="' +
            esc(v || '') +
            '" placeholder="' +
            esc(ph || '') +
            '">') +
        '</label>'
      );
    }
    function fmt(n) {
      return n == null ? '—' : (n >= 0 ? '+' : '−') + Math.abs(n);
    }
    var TABS = [
      ['basics', 'Basics'],
      ['abilities', 'Abilities'],
      ['powers', 'Powers'],
      ['advantages', 'Advantages'],
      ['skills', 'Skills'],
      ['defenses', 'Defenses'],
      ['complications', 'Complications'],
      ['sheet', 'Sheet'],
      ['play', 'Session']
    ];

    function home() {
      return (
        '<main class="home"><h1>Mutants &amp; Masterminds 3e</h1><p class="muted">Your superhero table companion. Tap the d20 to roll.</p>' +
        root.homeHub([
          ['mm-heroes', 'bolt', 'Heroes'],
          ['dm', 'eye', 'GM'],
          ['mm-rules', 'book', 'Rules'],
          ['audio', 'lute', 'Audio'],
          ['rules', 'scroll', 'House rules']
        ]) +
        (root.BKP ? root.BKP.homeLine() : '') +
        '</main>'
      );
    }

    function heroes() {
      var h = hero(),
        d = derive(h),
        s = S();
      var over = d.pp.total > d.pp.budget;
      var h2 =
        '<main class="mm-main"><div class="toolbar mm-top"><select data-mmhero="1" aria-label="Hero">' +
        s.heroes
          .map(function (x) {
            return (
              '<option value="' +
              x.id +
              '"' +
              (x.id === h.id ? ' selected' : '') +
              '>' +
              esc(x.name || 'Unnamed hero') +
              '</option>'
            );
          })
          .join('') +
        '</select>' +
        btn('mmNew', '+ New hero', {}, 'btn small') +
        btn('mmDup', 'Duplicate', {}, 'btn small') +
        (U.confirmDel
          ? btn('mmDel', 'Delete ' + esc(h.name || 'this hero') + '?', {}, 'btn small danger') +
            btn('mmDelNo', 'Keep', {}, 'btn small')
          : btn('mmDelAsk', 'Delete', {}, 'btn small')) +
        '</div>' +
        '<div class="mm-bar' +
        (over ? ' over' : '') +
        '"><span><b>PL ' +
        d.pl +
        '</b></span><span><b>' +
        d.pp.total +
        '</b> / ' +
        d.pp.budget +
        ' points</span>' +
        '<span class="small">Abilities ' +
        d.pp.abilities +
        ' · Powers ' +
        d.pp.powers +
        ' · Advantages ' +
        d.pp.advantages +
        ' · Skills ' +
        d.pp.skills +
        ' · Defenses ' +
        d.pp.defenses +
        '</span>' +
        (d.warnings.length
          ? '<span class="mm-warn">' + d.warnings.length + ' to check</span>'
          : '<span class="mm-ok">✓ within the limits</span>') +
        '</div>' +
        '<nav class="steps mm-tabs">' +
        TABS.map(function (t) {
          return btn('mmTab', t[1], { v: t[0] }, 'step' + (U.tab === t[0] ? ' on' : ''));
        }).join('') +
        '</nav>';
      var body =
        {
          basics: K.basics,
          abilities: K.abilities,
          powers: K.powers,
          advantages: K.advantages,
          skills: K.skills,
          defenses: K.defenses,
          complications: K.complications,
          sheet: K.sheet,
          play: K.play
        }[U.tab] || K.basics;
      return (
        h2 +
        '<div class="mm-body">' +
        body(h, d) +
        '</div>' +
        (d.warnings.length && U.tab !== 'sheet'
          ? '<div class="panel mm-warns"><b>To check</b><ul>' +
            d.warnings
              .map(function (w) {
                return '<li>' + esc(w) + '</li>';
              })
              .join('') +
            '</ul></div>'
          : '') +
        (d.notes.length && U.tab !== 'sheet'
          ? '<details class="panel mm-notes"><summary class="small">Worth a look with your GM (' +
            d.notes.length +
            ')</summary><ul class="small">' +
            d.notes
              .map(function (w) {
                return '<li>' + esc(w) + '</li>';
              })
              .join('') +
            '</ul></details>'
          : '') +
        '</main>'
      );
    }
    function html(section) {
      return section === 'mm-home' ? home() : heroes();
    }
    function title(section) {
      return section === 'mm-home' ? 'M&M 3e' : (hero().name || 'Heroes') + ' — M&M';
    }
    // the parts (mm-ui-build.js, mm-ui-sheet.js, mm-ui-actions.js, mm-ui-helper.js) share these names through K
    var K = {
      AB: AB,
      ADV: ADV,
      DEF: DEF,
      FX: FX,
      M: M,
      MODS: MODS,
      S: S,
      TABS: TABS,
      U: U,
      api: api,
      baseCost: baseCost,
      btn: btn,
      derive: derive,
      esc: esc,
      fmt: fmt,
      hero: hero,
      newHero: newHero,
      powerCost: powerCost,
      rangeOf: rangeOf,
      step: step,
      txt: txt,
      ui: ui,
      uid: uid
    };
    ['build', 'sheet', 'actions', 'helper'].forEach(function (p) {
      root.MMUIParts[p](K);
    });
    return {
      html: html,
      actions: K.actions,
      onInput: K.onInput,
      onChange: K.onChange,
      title: title,
      context: K.context
    };
  };
  root.MMRules = { derive: derive, powerCost: powerCost, newHero: newHero, book: book, rangeOf: rangeOf };
})(typeof window !== 'undefined' ? window : globalThis);
