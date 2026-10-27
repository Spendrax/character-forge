// Mutants & Masterminds hero pages: what the AI helper sees of the hero, and the changes it may propose.
// Part of mm.js: it runs inside MMUI; K holds the names the files share.
(function (root) {
  'use strict';
  (root.MMUIParts = root.MMUIParts || {}).helper = function (K) {
    var AB = K.AB,
      DEF = K.DEF,
      M = K.M,
      MODS = K.MODS,
      TABS = K.TABS,
      U = K.U,
      derive = K.derive,
      hero = K.hero,
      powerCost = K.powerCost,
      rangeOf = K.rangeOf,
      uid = K.uid;

    // What the helper sees: the hero being built, with costs, limits and what's left to spend.
    function context(section) {
      if (section !== 'mm-heroes')
        return {
          where: section === 'mm-rules' ? 'M&M rules' : 'M&M',
          subject: 'Mutants & Masterminds 3e',
          text:
            'Game: Mutants & Masterminds 3rd edition. Page: ' +
            (section === 'mm-rules' ? 'the rules book.' : 'the M&M home page.'),
          chips: ['Help me come up with a hero concept', 'How do power points work?', 'Explain power level limits']
        };
      var h = hero(),
        d = derive(h),
        tab = (TABS.filter(function (t) {
          return t[0] === U.tab;
        })[0] || ['', ''])[1],
        left = d.pp.budget - d.pp.total;
      var L = [
        'Game: Mutants & Masterminds 3rd edition. Page: hero builder, “' + tab + '” tab.',
        'Hero: ' +
          (h.name || 'unnamed') +
          (h.identity ? ' (' + h.identity + ')' : '') +
          '. Power level ' +
          d.pl +
          '. Points: ' +
          d.pp.total +
          ' of ' +
          d.pp.budget +
          ' spent (' +
          (left >= 0 ? left + ' left' : -left + ' over') +
          '); abilities ' +
          d.pp.abilities +
          ', powers ' +
          d.pp.powers +
          ', advantages ' +
          d.pp.advantages +
          ', skills ' +
          d.pp.skills +
          ', defenses ' +
          d.pp.defenses +
          '.',
        'Abilities: ' +
          AB.map(function (a) {
            return a + ' ' + d.ab[a];
          }).join(', ') +
          '.',
        'Defenses: ' +
          DEF.map(function (x) {
            return x[1] + ' ' + d.def[x[0]];
          }).join(', ') +
          '. Initiative ' +
          d.init +
          '.',
        'Powers: ' +
          ((h.powers || [])
            .map(function (p) {
              return (
                (p.name || p.effect) +
                ' = ' +
                p.effect +
                ' ' +
                p.rank +
                (p.target ? ' (' + p.target + ')' : '') +
                ((p.mods || []).length
                  ? ' with ' +
                    p.mods
                      .map(function (m) {
                        return m.n + (m.r > 1 ? ' ' + m.r : '');
                      })
                      .join(', ')
                  : '') +
                ', ' +
                rangeOf(p) +
                ', ' +
                powerCost(p).cost +
                ' points' +
                (p.desc ? ' — ' + p.desc : '')
              );
            })
            .join('; ') || 'none') +
          '.',
        'Attacks: ' +
          d.attacks
            .map(function (a) {
              return (
                a.n + ' ' + (a.bonus == null ? 'no attack roll' : 'attack +' + a.bonus) + ', ' + a.kind + ' ' + a.rank
              );
            })
            .join('; ') +
          '.',
        'Advantages: ' +
          ((h.adv || [])
            .map(function (a) {
              return a.n + (a.r > 1 ? ' ' + a.r : '') + (a.note ? ' (' + a.note + ')' : '');
            })
            .join(', ') || 'none') +
          '.',
        'Skills with ranks: ' +
          (Object.keys(d.skills)
            .reduce(function (out, k) {
              if (d.skills[k].r) out.push(k + ' ' + d.skills[k].r + ' (+' + d.skills[k].total + ')');
              return out;
            }, [])
            .concat(
              (h.spec || []).reduce(function (out, x) {
                if (+x.r) out.push(x.s + ' (' + x.n + ') ' + x.r);
                return out;
              }, [])
            )
            .join(', ') || 'none') +
          '.',
        'Complications: ' +
          ((h.comp || [])
            .reduce(function (out, c) {
              if (c.t) out.push(c.k + ': ' + c.t);
              return out;
            }, [])
            .join('; ') || 'none yet') +
          '.',
        d.warnings.length ? 'Problems the app flags: ' + d.warnings.join(' | ') : 'The app flags no problems.',
        d.notes && d.notes.length ? 'Notes for the GM: ' + d.notes.join(' | ') : '',
        h.notes ? 'Player notes: ' + h.notes : ''
      ];
      var chips = [];
      if (!(h.powers || []).length) chips.push('Help me come up with a hero concept');
      if (left > 0) chips.push('How should I spend my last ' + left + ' points?');
      if (d.warnings.length) chips.push('Explain what the app is warning me about');
      if (U.tab === 'powers') chips.push('Suggest powers that fit my hero');
      else chips.push('Is my hero built well for PL ' + d.pl + '?');
      L.push(
        'Changes you can propose (one per line, exact names from the rules):\n' +
          '[[ability: STR | 4]] ranks bought (STR STA AGL DEX FGT INT AWE PRE)\n[[defense: Dodge | 6]] ranks bought (Dodge, Parry, Fortitude, Will)\n[[skill: Perception | 8]]\n' +
          '[[advantage: Power Attack | 1 | details]]\n[[power: Fire Blast | Damage | 10 | Increased Range, Area | description]] name, effect, rank, extras/flaws (optional), description (optional)\n' +
          '[[complication: Motivation | Protect the innocent]]\n[[name: Hero name]] [[pl: 10]]'
      );
      return {
        where: (h.name || 'Hero') + ' · ' + tab,
        subject: 'your hero',
        text: L.filter(Boolean).join('\n'),
        chips: chips.slice(0, 4),
        apply: apply
      };
    }
    // A change the helper proposed and the user tapped "Apply" on. Checked against the rules data; returns what was done.
    function find(list, n) {
      n = String(n || '')
        .trim()
        .toLowerCase();
      return list.filter(function (x) {
        return x[0].toLowerCase() === n;
      })[0];
    }
    function num(v, lo, hi) {
      var n = Math.round(+v);
      if (isNaN(n)) throw new Error('“' + v + '” is not a number');
      return Math.max(lo, Math.min(hi, n));
    }
    function apply(verb, a) {
      var h = hero();
      if (verb === 'ability') {
        var ab = String(a[0]).toUpperCase().slice(0, 3),
          A = M.abilities.filter(function (x) {
            return x[0] === ab || x[1].toUpperCase().slice(0, 3) === ab;
          })[0];
        if (!A) throw new Error('No ability “' + a[0] + '”');
        h.ab[A[0]] = num(a[1], -5, 20);
        return A[1] + ' set to ' + h.ab[A[0]];
      }
      if (verb === 'defense') {
        var D = DEF.filter(function (x) {
          return x[0] === String(a[0]).toLowerCase() || x[1].toLowerCase() === String(a[0]).toLowerCase();
        })[0];
        if (!D || D[0] === 'tough') throw new Error('Can’t buy “' + a[0] + '” directly');
        h.def[D[0]] = num(a[1], 0, 30);
        return D[1] + ' ranks set to ' + h.def[D[0]];
      }
      if (verb === 'skill') {
        var s = find(M.skills, a[0]);
        if (s && !s[3]) {
          h.skills[s[0]] = num(a[1], 0, 30);
          return s[0] + ' ranks set to ' + h.skills[s[0]];
        }
        var m = /^(close combat|ranged combat|expertise)\s*[:(—-]?\s*(.*?)\)?$/i.exec(String(a[0]).trim());
        if (!m) throw new Error('No skill “' + a[0] + '”');
        var kind = m[1].replace(/\b\w/g, function (c) {
            return c.toUpperCase();
          }),
          sp = (h.spec = h.spec || []).filter(function (x) {
            return x.s === kind && x.n.toLowerCase() === m[2].toLowerCase();
          })[0];
        if (!sp) h.spec.push((sp = { s: kind, n: m[2], r: 0 }));
        sp.r = num(a[1], 0, 30);
        return kind + ' (' + (m[2] || '?') + ') ranks set to ' + sp.r;
      }
      if (verb === 'advantage') {
        var v = find(M.advantages, a[0]);
        if (!v) throw new Error('No advantage “' + a[0] + '”');
        var have = (h.adv = h.adv || []).filter(function (x) {
          return x.n === v[0];
        })[0];
        if (have && !v[4]) {
          if (v[2]) have.r = num(a[1] || 1, 1, v[2] > 0 ? v[2] : 40);
          return v[0] + (v[2] ? ' now rank ' + have.r : ' was already there');
        }
        h.adv.push({ n: v[0], r: v[2] ? num(a[1] || 1, 1, v[2] > 0 ? v[2] : 40) : 1, note: a[2] || '' });
        return 'Added ' + v[0];
      }
      if (verb === 'power') {
        var e = find(M.effects, a[1]);
        if (!e) throw new Error('No effect “' + a[1] + '”');
        var mods = String(a[3] || '')
          .split(',')
          .map(function (x) {
            return x.trim();
          })
          .reduce(function (out, x) {
            if (!x) return out;
            var k = Object.keys(MODS).filter(function (n) {
              return n.toLowerCase() === x.replace(/\s*[x×]?\s*\d+$/, '').toLowerCase();
            })[0];
            if (!k) throw new Error('No extra or flaw “' + x + '”');
            out.push({ n: k, v: MODS[k][2][0], r: +(/(\d+)$/.exec(x) || [0, 1])[1] || 1, note: '' });
            return out;
          }, []);
        var p = {
          id: uid(),
          name: String(a[0] || '').trim(),
          effect: e[0],
          rank: num(a[2] || 1, 1, 40),
          mods: mods,
          desc: a[4] || ''
        };
        (h.powers = h.powers || []).push(p);
        U.open = p.id;
        return 'Added ' + (p.name || e[0]) + ' (' + e[0] + ' ' + p.rank + ', ' + powerCost(p).cost + ' points)';
      }
      if (verb === 'complication') {
        var c = find(M.complications, a[0]);
        if (!c) throw new Error('No complication kind “' + a[0] + '”');
        var blank = (h.comp = h.comp || []).filter(function (x) {
          return x.k === c[0] && !x.t;
        })[0];
        if (blank) blank.t = a[1] || '';
        else h.comp.push({ k: c[0], t: a[1] || '' });
        return 'Added ' + c[0] + ': ' + (a[1] || '');
      }
      if (verb === 'name') {
        h.name = String(a[0] || '').trim();
        return 'Named ' + h.name;
      }
      if (verb === 'pl') {
        h.pl = num(a[0], 1, 20);
        return 'Power level ' + h.pl;
      }
      throw new Error('Unknown change “' + verb + '”');
    }
    K.context = context;
  };
})(typeof window !== 'undefined' ? window : globalThis);
