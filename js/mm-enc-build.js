// M&M GM tools: making villains and minions at a power level, and their stat blocks.
// Part of mm-enc.js: it runs inside MMEnc; K holds the names the files share.
(function (root) {
  'use strict';
  (root.MMEncParts = root.MMEncParts || {}).build = function (K) {
    var E = K.E,
      FLAWS = K.FLAWS,
      M = K.M,
      MINIONS = K.MINIONS,
      MOTIVES = K.MOTIVES,
      MR = K.MR,
      R = K.R,
      ROLES = K.ROLES,
      U = K.U,
      btn = K.btn,
      clamp = K.clamp,
      esc = K.esc,
      pick = K.pick,
      uid = K.uid;

    // ---------- building a villain ----------
    function power(name, effect, rank, mods, desc) {
      return {
        id: uid(),
        name: name,
        effect: effect,
        rank: Math.max(1, rank),
        mods: (mods || []).map(function (m) {
          var d = MODS()[m[0]];
          return { n: m[0], v: d ? d[2][0] : 1, r: m[1] || 1, note: m[2] || '' };
        }),
        desc: desc || ''
      };
    }
    var _mods;
    function MODS() {
      if (!_mods) {
        _mods = {};
        M.extras.concat(M.flaws).forEach(function (m) {
          _mods[m[0]] = m;
        });
      }
      return _mods;
    }
    function between(a) {
      return a[0] + R(a[1] - a[0] + 1);
    }
    function build(pl, roleId, minion) {
      var mt = minion ? MINIONS[minion] : null,
        role = ROLES[mt ? mt.role : roleId],
        h = MR.newHero();
      h.pl = pl;
      h.npc = roleId;
      h.minion = !!minion;
      h.spec = [];
      h.adv = [];
      h.powers = [];
      h.skills = {};
      var t = minion ? 0 : between(role.t),
        s = minion ? 0 : between(role.s),
        f = minion ? 0 : between(role.f);
      var kind = (mt ? mt.attack : role.attack).kind;
      var e = clamp(pl + t, 1, 2 * pl - 1),
        a = 2 * pl - e; // effect rank and attack bonus
      if (kind === 'perception') {
        e = pl;
        a = 0;
      } // no attack roll: rank ≤ PL
      var T = clamp(pl + s, 1, 2 * pl - 1),
        D = 2 * pl - T,
        P = 2 * pl - T - (R(3) === 0 ? 1 : 0);
      var F = clamp(pl + f, 1, 2 * pl - 1),
        W = 2 * pl - F;
      var want = function (k) {
        var v = role.ab[k];
        return v === 'e'
          ? e
          : v === 'a'
            ? a
            : v === 'T'
              ? T
              : v === 'D'
                ? D
                : v === 'W'
                  ? W
                  : Math.round(v * Math.min(1, pl / 8));
      };
      var ab = {};
      ['STR', 'STA', 'AGL', 'DEX', 'FGT', 'INT', 'AWE', 'PRE'].forEach(function (k) {
        ab[k] = Math.max(0, want(k));
      });
      // keep each ability under what its defense or attack allows
      ab.AGL = Math.min(ab.AGL, D);
      ab.FGT = Math.min(ab.FGT, P, kind === 'close' || kind === 'unarmed' || kind === 'weapon' ? a : 99);
      ab.STA = Math.min(ab.STA, T, F);
      ab.AWE = Math.min(ab.AWE, W);
      if (kind === 'ranged' || kind === 'snare') ab.DEX = Math.min(ab.DEX, a);
      if (kind !== 'unarmed')
        ab.STR = Math.min(ab.STR, Math.max(0, Math.min(T, 2 * pl - ab.FGT))); // the free unarmed attack stays in limits too
      else {
        ab.STR = e;
      }
      if (kind === 'weapon') ab.STR = Math.min(ab.STR, e - 1); // the weapon adds at least 1 rank on top of Strength
      Object.keys(ab).forEach(function (k) {
        ab[k] = Math.min(ab[k], pl + 10);
        h.ab[k] = ab[k];
      });
      h.def = {
        dodge: Math.max(0, D - ab.AGL),
        parry: Math.max(0, P - ab.FGT),
        fort: Math.max(0, F - ab.STA),
        will: Math.max(0, W - ab.AWE)
      };
      if (ab.STR + ab.FGT > 2 * pl) h.ab.STR = ab.STR = 2 * pl - ab.FGT;
      // main attack
      var an = pick((mt ? mt.attack : role.attack).names),
        close = kind === 'close' || kind === 'unarmed' || kind === 'weapon';
      var specRanks = Math.max(0, a - (close ? ab.FGT : ab.DEX));
      if (kind === 'unarmed') {
        if (specRanks) h.spec.push({ s: 'Close Combat', n: 'Unarmed', r: specRanks });
        h.attackName = an;
      } // Strength is the damage
      else {
        var mods = [],
          eff = 'Damage',
          rank = e,
          desc = '';
        if (kind === 'ranged') mods.push(['Increased Range', 1]);
        if (kind === 'perception') {
          eff = 'Affliction';
          mods.push(['Increased Range', 2]);
          desc = 'Will resists: dazed, then stunned, then incapacitated.';
        }
        if (kind === 'snare') {
          eff = 'Affliction';
          mods.push(['Increased Range', 1], ['Cumulative', 1], ['Extra Condition', 1]);
          mods.push(['Limited Degree', 1]);
          desc = 'Dodge resists: hindered and vulnerable, then defenseless and immobile.';
        }
        if (kind === 'weapon') {
          mods.push(['Removable', 1]);
          rank = Math.max(1, e - ab.STR);
          desc = 'A weapon that adds Strength.';
        }
        (role.attack.mods || []).forEach(function (m) {
          if (!mt) mods.push(m);
        });
        if ((mt ? mt.attack : role.attack).removable) mods.push(['Removable', 1]);
        var p = power(an, eff, rank, mods, desc);
        if (kind === 'weapon') p.str = true;
        if (eff === 'Affliction') p.resist = kind === 'snare' ? 'Dodge' : 'Will';
        h.powers.push(p);
        if (specRanks && kind !== 'perception')
          h.spec.push({ s: close ? 'Close Combat' : 'Ranged Combat', n: an, r: specRanks });
      }
      // toughness from powers
      var prot = Math.max(0, T - ab.STA);
      // extra powers (villains get two or three, minions none)
      var extras = minion
        ? []
        : role.extras
            .slice()
            .sort(function () {
              return Math.random() - 0.5;
            })
            .slice(0, 2 + R(2));
      if (role === ROLES.brute || role === ROLES.armored)
        extras = extras
          .filter(function (x) {
            return x[0] !== 'Protection';
          })
          .concat(
            role.extras.filter(function (x) {
              return x[0] === 'Protection';
            })
          );
      if (mt && mt.immune)
        h.powers.push(power('Robot', 'Immunity', 30, [], 'Immune to Fortitude effects (it’s a machine).'));
      extras.forEach(function (x) {
        var eff = x[0],
          nm = x[1],
          r = x[2],
          dsc = x[3] || '',
          mods = (x[4] || []).map(function (m) {
            return [m, 1];
          });
        if (x[5]) mods.push(['Removable', 1]);
        if (r === 'half') r = Math.max(1, Math.round(pl / 2));
        else if (r === 'speed') r = Math.max(2, Math.round(pl / 2) + 2);
        else if (r === 'pl') r = pl;
        else if (r === 'pl2') r = Math.max(1, pl - 2);
        if (eff === 'Protection') {
          if (prot) h.powers.push(power(nm || 'Protection', 'Protection', prot, mods, dsc || 'Hard to hurt.'));
          prot = 0;
          return;
        }
        if (eff === 'Area') {
          h.powers.push(
            power(
              nm,
              'Damage',
              Math.max(1, pl - 2),
              [
                ['Area', 1, 'Burst'],
                ['Increased Range', 1]
              ],
              'Hits everyone in the area (Dodge for half).'
            )
          );
          return;
        }
        if (eff === 'Affliction') {
          h.powers.push(
            Object.assign(
              power(
                nm,
                'Affliction',
                Math.max(1, pl - 1),
                [['Increased Range', 2]],
                'Will resists: entranced, compelled, controlled.'
              ),
              { resist: 'Will' }
            )
          );
          return;
        }
        if (eff === 'Move Object' || eff === 'Create') {
          h.powers.push(power(nm, eff, Math.min(r, pl), [], dsc));
          return;
        }
        h.powers.push(power(nm, eff, r, mods, dsc));
      });
      if (prot)
        h.powers.push(power(minion ? 'Armor' : 'Tough Hide', 'Protection', prot, minion ? [['Removable', 1]] : [], ''));
      // skills: bonus stays within PL + 10
      var skills = (mt ? mt.skills : role.skills).slice(0, minion ? 1 : 3 + R(2));
      skills.forEach(function (sk) {
        var sp = /^Expertise: (.*)$/.exec(sk),
          abil = sp
            ? 'INT'
            : (M.skills.filter(function (x) {
                return x[0] === sk;
              })[0] || [])[1];
        if (!abil) return;
        var r = clamp(Math.round(pl * (minion ? 0.3 : 0.6)) + R(3), 0, pl + 10 - ab[abil]);
        if (!r) return;
        if (sp) h.spec.push({ s: 'Expertise', n: sp[1], r: r });
        else h.skills[sk] = r;
      });
      // advantages that don't change the numbers above
      if (!minion)
        role.adv
          .slice()
          .sort(function () {
            return Math.random() - 0.5;
          })
          .slice(0, 2 + R(3))
          .forEach(function (n) {
            h.adv.push({
              n: n,
              r: n === 'Improved Initiative' ? 1 + R(2) : 1,
              note: n === 'Improved Critical' || n === 'Precise Attack' ? 'main attack' : ''
            });
          });
      // name and story
      if (minion) h.name = pick(mt.names);
      else h.name = pick(role.names[0]) + ' ' + pick(role.names[1]);
      h.comp = minion
        ? [
            { k: 'Motivation', t: 'Paid to fight.' },
            { k: 'Responsibility', t: 'Follows orders.' }
          ]
        : [{ k: 'Motivation', t: pick(MOTIVES) }].concat(
            [pick(FLAWS)].map(function (c) {
              return { k: c[0], t: c[1] };
            })
          );
      h.tactics = minion ? 'Minions: one failed resistance check and they’re out.' : role.tactics;
      h.role = mt ? mt.label : role.label;
      var d = MR.derive(h);
      h.extra = Math.max(0, d.pp.total - 15 * pl); // villains aren't held to the point budget; show what they cost
      return h;
    }
    function generate() {
      var e = E(),
        pl = clamp(+e.pl || 10, 1, 20),
        n = clamp(+e.n || 4, 1, 8),
        roles = Object.keys(ROLES),
        foes = [];
      var villain = function (p) {
        return build(p, e.role || pick(roles));
      };
      var minions = function (count, p) {
        var k = pick(Object.keys(MINIONS)),
          nm = pick(MINIONS[k].names);
        for (var i = 0; i < count; i++) {
          var m = build(Math.max(1, p), k, k);
          m.name = nm + ' ' + (i + 1);
          foes.push(m);
        }
      };
      if (e.kind === 'boss') foes.push(villain(Math.min(20, pl + 2)));
      else if (e.kind === 'team') {
        var used = [];
        for (var i = 0; i < n; i++) {
          var r =
            e.role ||
            pick(
              roles
                .filter(function (x) {
                  return used.indexOf(x) < 0;
                })
                .concat(used.length >= roles.length ? roles : [])
            );
          used.push(r);
          foes.push(build(pl, r));
        }
      } else if (e.kind === 'bossmin') {
        foes.push(villain(Math.min(20, pl + 1)));
        minions(n * 2, pl - 4);
      } else minions(n * 3, pl - 3);
      e.foes = foes;
      e.run = null;
      U.open = {};
      if (foes[0]) U.open[foes[0].id] = 1;
    }

    // ---------- showing a villain ----------
    var fmt = function (n) {
      return (n >= 0 ? '+' : '') + n;
    };
    function preFoe(id) {
      return (root.MMFoes || []).filter(function (f) {
        return f.id === id;
      })[0];
    }
    function defOf(v) {
      return typeof v === 'number' ? v : parseInt(v, 10) || 0;
    }
    var ABN = ['STR', 'STA', 'AGL', 'DEX', 'FGT', 'INT', 'AWE', 'PRE'],
      DEFN = ['Dodge', 'Parry', 'Fortitude', 'Toughness', 'Will'];
    // a ready-made foe's stat block; h is the encounter entry (or null on the Villains page)
    function preBlock(f, h, open, tools) {
      var key = h ? h.id : 'f:' + f.id;
      var head =
        '<button type="button" class="mm-phead" data-act="mmeOpen" data-v="' +
        esc(key) +
        '"><b>' +
        esc(h ? h.name : f.n) +
        '</b> <span class="small muted">' +
        esc(f.kind) +
        ' · PL ' +
        f.pl +
        (f.minion ? ' · minion' : '') +
        '</span><span class="spacer"></span><span aria-hidden="true">' +
        (open ? '▾' : '▸') +
        '</span></button>';
      var att = function (a) {
        return (
          '<b>' +
          esc(a[0]) +
          '</b> ' +
          (a[1] == null ? 'no roll' : fmt(a[1])) +
          ', rank ' +
          a[2] +
          ' (DC ' +
          (15 + a[2]) +
          ')' +
          (a[3] ? ' <span class="muted">' + esc(a[3]) + '</span>' : '')
        );
      };
      var line =
        '<div class="small mme-quick">' +
        f.att.map(att).join(' · ') +
        '<br>' +
        DEFN.map(function (n, i) {
          return n + ' ' + f.def[i];
        }).join(' · ') +
        ' · Init ' +
        fmt(f.init) +
        '</div>' +
        (root.DMUI ? root.DMUI.button(h ? h.name : f.n, f.about) : '');
      if (!open) return '<div class="panel mm-power mme-foe">' + head + line + '</div>';
      return (
        '<div class="panel mm-power open mme-foe">' +
        head +
        '<p class="small muted">' +
        esc(f.about) +
        '</p><p class="small">' +
        ABN.map(function (n, i) {
          return n + ' ' + (f.ab[i] == null ? '—' : f.ab[i]);
        }).join(' · ') +
        '</p>' +
        '<h4>Offense</h4><ul class="small mme-list">' +
        f.att
          .map(function (a) {
            return '<li>' + att(a) + '</li>';
          })
          .join('') +
        '</ul>' +
        '<h4>Defense</h4><p class="small">' +
        DEFN.map(function (n, i) {
          return n + ' ' + f.def[i];
        }).join(' · ') +
        ' · Initiative ' +
        fmt(f.init) +
        '</p>' +
        (f.pow
          ? '<h4>Powers</h4><ul class="small mme-list">' +
            f.pow
              .map(function (x) {
                return '<li>' + esc(x) + '</li>';
              })
              .join('') +
            '</ul>'
          : '') +
        (f.adv ? '<p class="small"><b>Advantages:</b> ' + esc(f.adv) + '</p>' : '') +
        (f.sk ? '<p class="small"><b>Skills:</b> ' + esc(f.sk) + '</p>' : '') +
        (f.eq ? '<p class="small"><b>Equipment:</b> ' + esc(f.eq) + '</p>' : '') +
        '<div class="toolbar">' +
        tools +
        '</div></div>'
      );
    }
    function statBlock(h) {
      if (h.pre) {
        var f = preFoe(h.pre);
        return f ? preBlock(f, h, U.open[h.id], btn('mmeRm', 'Remove', { v: h.id }, 'btn small')) : '';
      }
      var d = MR.derive(h),
        open = U.open[h.id];
      var att = d.attacks.reduce(function (out, x) {
        if (x.n !== 'Unarmed' || h.attackName || h.ab.STR >= Math.round(h.pl / 2))
          out.push(x.n === 'Unarmed' && h.attackName ? Object.assign({}, x, { n: h.attackName }) : x);
        return out;
      }, []);
      var head =
        '<button type="button" class="mm-phead" data-act="mmeOpen" data-v="' +
        h.id +
        '"><b>' +
        esc(h.name) +
        '</b> <span class="small muted">' +
        esc(h.role) +
        ' · PL ' +
        h.pl +
        (h.minion ? ' · minion' : '') +
        '</span><span class="spacer"></span><span aria-hidden="true">' +
        (open ? '▾' : '▸') +
        '</span></button>';
      var line =
        '<div class="small mme-quick">' +
        att
          .map(function (x) {
            return (
              '<b>' +
              esc(x.n) +
              '</b> ' +
              (x.bonus == null ? 'no roll' : fmt(x.bonus)) +
              ', ' +
              esc(x.kind) +
              ' ' +
              x.rank
            );
          })
          .join(' · ') +
        '<br>Dodge ' +
        d.def.dodge +
        ' · Parry ' +
        d.def.parry +
        ' · Tough ' +
        d.def.tough +
        ' · Fort ' +
        d.def.fort +
        ' · Will ' +
        d.def.will +
        '</div>';
      if (!open) return '<div class="panel mm-power mme-foe">' + head + line + '</div>';
      var M2 = root.MM,
        abl = M2.abilities
          .map(function (x) {
            return x[0] + ' ' + d.ab[x[0]];
          })
          .join(' · ');
      var powers = (h.powers || [])
        .reduce(function (out, p) {
          if (p.effect !== 'Feature')
            out.push(
              '<li><b>' +
                esc(p.name) +
                ':</b> ' +
                esc(p.effect) +
                ' ' +
                p.rank +
                ((p.mods || []).length
                  ? ', ' +
                    esc(
                      p.mods
                        .map(function (m) {
                          return m.n + (m.r > 1 ? ' ' + m.r : '') + (m.note ? ' (' + m.note + ')' : '');
                        })
                        .join(', ')
                    )
                  : '') +
                (p.desc ? ' — <span class="muted">' + esc(p.desc) + '</span>' : '') +
                '</li>'
            );
          return out;
        }, [])
        .join('');
      var skills = Object.keys(d.skills)
        .reduce(function (out, k) {
          if (d.skills[k].r) out.push(k + ' ' + fmt(d.skills[k].total));
          return out;
        }, [])
        .concat(
          (h.spec || []).reduce(function (out, x) {
            if (x.s === 'Expertise') out.push('Expertise: ' + x.n + ' ' + fmt(x._total));
            return out;
          }, [])
        );
      var warn = d.warnings.filter(function (w) {
        return !/power points|complications/.test(w);
      });
      return (
        '<div class="panel mm-power open mme-foe">' +
        head +
        '<p class="small">' +
        abl +
        '</p>' +
        '<h4>Offense</h4><ul class="small mme-list">' +
        att
          .map(function (x) {
            return (
              '<li><b>' +
              esc(x.n) +
              '</b> — ' +
              esc(x.range) +
              ', ' +
              (x.bonus == null ? 'no attack roll' : 'attack ' + fmt(x.bonus)) +
              ', ' +
              esc(x.kind) +
              ' ' +
              x.rank +
              (x.resist ? ' (DC ' + x.dc + ' ' + esc(x.resist) + ')' : '') +
              '</li>'
            );
          })
          .join('') +
        '</ul>' +
        '<h4>Defense</h4><p class="small">Dodge ' +
        d.def.dodge +
        ' · Parry ' +
        d.def.parry +
        ' · Fortitude ' +
        d.def.fort +
        ' · Toughness ' +
        d.def.tough +
        ' · Will ' +
        d.def.will +
        ' · Initiative ' +
        fmt(d.init) +
        '</p>' +
        (powers ? '<h4>Powers</h4><ul class="small mme-list">' + powers + '</ul>' : '') +
        (skills.length ? '<p class="small"><b>Skills:</b> ' + esc(skills.join(', ')) + '</p>' : '') +
        ((h.adv || []).length
          ? '<p class="small"><b>Advantages:</b> ' +
            esc(
              h.adv
                .map(function (x) {
                  return x.n + (x.r > 1 ? ' ' + x.r : '') + (x.note ? ' (' + x.note + ')' : '');
                })
                .join(', ')
            ) +
            '</p>'
          : '') +
        '<p class="small"><b>Tactics:</b> ' +
        esc(h.tactics || '') +
        '</p>' +
        (h.minion
          ? ''
          : '<p class="small"><b>' +
            esc(
              h.comp.map(function (c) {
                return c.k + ':';
              })[0]
            ) +
            '</b> ' +
            esc(h.comp[0].t) +
            (h.comp[1] ? ' <b>' + esc(h.comp[1].k) + ':</b> ' + esc(h.comp[1].t) : '') +
            '</p>') +
        '<p class="small muted">' +
        d.pp.total +
        ' power points' +
        (warn.length ? ' · ⚠ ' + esc(warn.join(' ')) : ' · within PL ' + h.pl + ' limits') +
        '</p>' +
        '<div class="toolbar">' +
        btn('mmeReroll', '↻ New one', { v: h.id }, 'btn small') +
        btn('mmeSave', 'Copy to my heroes', { v: h.id }, 'btn small') +
        btn('mmeRm', 'Remove', { v: h.id }, 'btn small') +
        '</div></div>'
      );
    }
    K.build = build;
    K.defOf = defOf;
    K.generate = generate;
    K.preBlock = preBlock;
    K.preFoe = preFoe;
    K.statBlock = statBlock;
  };
})(typeof window !== 'undefined' ? window : globalThis);
