// Mutants & Masterminds hero pages: basics, abilities, defenses, skills, advantages, powers and complications.
// Part of mm.js: it runs inside MMUI; K holds the names the files share.
(function (root) {
  'use strict';
  (root.MMUIParts = root.MMUIParts || {}).build = function (K) {
    var ADV = K.ADV,
      DEF = K.DEF,
      FX = K.FX,
      M = K.M,
      MODS = K.MODS,
      U = K.U,
      baseCost = K.baseCost,
      btn = K.btn,
      esc = K.esc,
      fmt = K.fmt,
      powerCost = K.powerCost,
      rangeOf = K.rangeOf,
      step = K.step,
      txt = K.txt,
      ui = K.ui;

    function basics(h, d) {
      return (
        '<h2>Basics</h2><div class="panel"><div class="row">' +
        txt('name', h.name, 'Hero name', 'Hero name') +
        txt('identity', h.identity, 'Secret or public identity', 'Identity') +
        '</div><div class="row">' +
        txt('player', h.player, '', 'Player') +
        txt('group', h.group, 'Team, base', 'Group') +
        '</div>' +
        '<div class="row mm-plrow"><div class="field"><span>Power level</span>' +
        step('pl', h.pl, 1, 20, 'power level') +
        '</div><div class="field"><span>Extra power points <small class="muted">(earned in play)</small></span>' +
        step('extra', h.extra || 0, 0, 999, 'extra points') +
        '</div></div>' +
        '<p class="small muted">PL ' +
        d.pl +
        ' gives ' +
        15 * d.pl +
        ' power points' +
        (h.extra ? ' + ' + h.extra + ' earned' : '') +
        '. Most games start at PL 10 (150 points). Ask your GM.</p></div>' +
        '<div class="panel"><p class="small muted" style="margin:0 0 .4rem">Archetypes for inspiration</p><div class="pills">' +
        M.archetypes
          .map(function (a) {
            return '<span class="pill small static">' + a + '</span>';
          })
          .join('') +
        '</div></div>' +
        txt('notes', h.notes, 'Origin, look, personality…', 'Notes', 1) +
        (root.NoteStyle
          ? '<div class="field"><span>Note style: the colour and font of your notes, and of what you share at the table</span>' +
            root.NoteStyle.picker(h.noteStyle, 'mmNoteStyle', esc(h.name || 'Your hero') + ' writes like this.') +
            '</div>'
          : '')
      );
    }
    function abilities(h, d) {
      return (
        '<h2>Abilities</h2><p class="muted">2 points per rank. 0 is an average adult, 5 is the human peak. Powers that raise an ability (Enhanced Trait) are added on top.</p><div class="mm-rows">' +
        M.abilities
          .map(function (a) {
            var e = d.ab[a[0]] - (+h.ab[a[0]] || 0);
            return (
              '<div class="mm-row"><span class="nm"><b>' +
              a[1] +
              '</b> <small class="muted">' +
              a[0] +
              '</small><small class="muted">' +
              a[2] +
              '</small></span>' +
              step('ab.' + a[0], +h.ab[a[0]] || 0, -5, 20, 'ab ' + a[0]) +
              '<span class="mm-tot">' +
              fmt(d.ab[a[0]]) +
              (e ? '<small>+' + e + ' power</small>' : '') +
              '</span></div>'
            );
          })
          .join('') +
        '</div>'
      );
    }
    function defenses(h, d) {
      return (
        '<h2>Defenses</h2><p class="muted">1 point per rank on top of the ability. Toughness comes from Stamina, the Protection effect and Defensive Roll.</p><div class="mm-rows">' +
        DEF.map(function (x) {
          var t = d.def[x[0]];
          return (
            '<div class="mm-row"><span class="nm"><b>' +
            x[1] +
            '</b> <small class="muted">' +
            x[2] +
            ' ' +
            fmt(d.ab[x[2]]) +
            '</small></span>' +
            (x[0] === 'tough'
              ? '<span class="small muted">from powers</span>'
              : step('def.' + x[0], +h.def[x[0]] || 0, 0, 30, x[1])) +
            '<span class="mm-tot">' +
            fmt(t) +
            '</span></div>'
          );
        }).join('') +
        '</div><div class="panel small"><b>Limits at PL ' +
        d.pl +
        ' (' +
        2 * d.pl +
        '):</b> Dodge + Toughness ' +
        (d.def.dodge + d.def.tough) +
        ' · Parry + Toughness ' +
        (d.def.parry + d.def.tough) +
        ' · Fortitude + Will ' +
        (d.def.fort + d.def.will) +
        '<br>Initiative ' +
        fmt(d.init) +
        '</div>'
      );
    }
    function skills(h, d) {
      var specs = (h.spec || [])
        .map(function (x, i) {
          return (
            '<div class="mm-row"><span class="nm"><b>' +
            x.s +
            '</b><input type="text" id="mm-spec-' +
            i +
            '" data-mmf="spec.' +
            i +
            '.n" value="' +
            esc(x.n || '') +
            '" placeholder="' +
            (x.s === 'Expertise' ? 'Science, Magic, Streetwise…' : 'Unarmed, Swords, Blast…') +
            '" aria-label="' +
            x.s +
            ' specialty"></span>' +
            step('spec.' + i + '.r', +x.r || 0, 0, 30, x.s + ' ranks') +
            '<span class="mm-tot">' +
            fmt(x._total) +
            '</span>' +
            btn('mmSpecRm', '✕', { v: i }, 'btn small') +
            '</div>'
          );
        })
        .join('');
      return (
        '<h2>Skills</h2><p class="muted">1 point per 2 ranks. Bonus = ability + ranks, up to PL + 10 (' +
        (d.pl + 10) +
        '), even with no ranks: a skill used untrained counts its ability alone, so this also limits your abilities.</p><div class="mm-rows">' +
        M.skills
          .reduce(function (out, s) {
            if (!!s[3]) return out;
            var x = d.skills[s[0]];
            out.push(
              '<div class="mm-row"><span class="nm"><b>' +
                s[0] +
                '</b> <small class="muted">' +
                s[1] +
                '</small></span>' +
                step('skills.' + s[0], x.r, 0, 30, s[0] + ' ranks') +
                '<span class="mm-tot' +
                (x.total > d.pl + 10 ? ' bad' : '') +
                '">' +
                fmt(x.total) +
                '</span></div>'
            );
            return out;
          }, [])
          .join('') +
        '</div><h3>Close Combat, Ranged Combat and Expertise</h3><p class="small muted">Each one is for a named attack or field. Name a combat skill after a power (like “Blast”) and it adds to that power’s attack.</p><div class="mm-rows">' +
        specs +
        '</div>' +
        '<div class="toolbar">' +
        btn('mmSpecAdd', '+ Close Combat', { v: 'Close Combat' }, 'btn small') +
        btn('mmSpecAdd', '+ Ranged Combat', { v: 'Ranged Combat' }, 'btn small') +
        btn('mmSpecAdd', '+ Expertise', { v: 'Expertise' }, 'btn small') +
        '</div>'
      );
    }
    function advantages(h, d) {
      var have = (h.adv || [])
        .map(function (a, i) {
          var def = ADV[a.n] || ['', '', 0, ''];
          return (
            '<div class="mm-adv"><div class="mm-row"><span class="nm"><b>' +
            esc(a.n) +
            '</b> <small class="muted">' +
            def[1] +
            '</small></span>' +
            (def[2]
              ? step('adv.' + i + '.r', Math.max(1, +a.r || 1), 1, def[2] > 0 ? def[2] : 40, a.n + ' ranks')
              : '<span class="small muted">1 point</span>') +
            btn('mmAdvRm', '✕', { v: i }, 'btn small') +
            '</div>' +
            '<div class="small muted">' +
            esc(def[3]) +
            '</div>' +
            (def[4]
              ? '<input type="text" id="mm-adv-' +
                i +
                '" data-mmf="adv.' +
                i +
                '.note" value="' +
                esc(a.note || '') +
                '" placeholder="Which one? (attack, skill, benefit…)" aria-label="' +
                esc(a.n) +
                ' details">'
              : '') +
            '</div>'
          );
        })
        .join('');
      var cat = U.advCat || '',
        q = (ui.q.mmadv || '').toLowerCase();
      var list = M.advantages.filter(function (a) {
        return (!cat || a[1] === cat) && (!q || (a[0] + ' ' + a[3]).toLowerCase().indexOf(q) >= 0);
      });
      return (
        '<h2>Advantages</h2><p class="muted">1 point each (per rank if ranked).</p>' +
        (have ? '<div class="mm-advs">' + have + '</div>' : '<p class="small muted">None yet.</p>') +
        '<h3>Add an advantage</h3><div class="pills">' +
        ['', 'Combat', 'Fortune', 'General', 'Skill']
          .map(function (c) {
            return btn('mmAdvCat', c || 'All', { v: c }, 'pill small' + (cat === c ? ' on' : ''));
          })
          .join('') +
        '</div>' +
        '<div class="toolbar"><input type="search" id="q-mmadv" data-q="mmadv" placeholder="Search advantages…" value="' +
        esc(ui.q.mmadv || '') +
        '"></div><div class="optlist">' +
        list
          .map(function (a) {
            var taken =
              (h.adv || []).some(function (x) {
                return x.n === a[0];
              }) && !a[4];
            return (
              '<button type="button" class="opt" data-act="mmAdvAdd" data-v="' +
              esc(a[0]) +
              '"' +
              (taken ? ' disabled' : '') +
              '><b>' +
              esc(a[0]) +
              '</b> <small class="muted">— ' +
              a[1] +
              (a[2] ? ', ranked' : '') +
              (taken ? ', taken' : '') +
              '</small><span>' +
              esc(a[3]) +
              '</span></button>'
            );
          })
          .join('') +
        '</div>'
      );
    }
    function powerCard(p, i, d) {
      var e = FX[p.effect] || [],
        open = U.open === p.id,
        c = powerCost(p),
        att = d.attacks.filter(function (a) {
          return a.power === p.id;
        })[0];
      var head =
        '<button type="button" class="mm-phead" data-act="mmOpenP" data-v="' +
        p.id +
        '"><b>' +
        esc(p.name || p.effect) +
        '</b> <span class="small muted">' +
        esc(p.effect) +
        ' ' +
        p.rank +
        '</span><span class="spacer"></span><span class="mm-cost">' +
        c.cost +
        ' pt' +
        (c.cost === 1 ? '' : 's') +
        '</span><span aria-hidden="true">' +
        (open ? '▾' : '▸') +
        '</span></button>';
      if (!open)
        return (
          '<div class="panel mm-power">' +
          head +
          (att
            ? '<div class="small muted">' +
              (att.bonus == null ? 'no attack roll' : 'attack ' + fmt(att.bonus)) +
              ' · DC ' +
              att.dc +
              ' ' +
              esc(att.resist) +
              '</div>'
            : '') +
          '</div>'
        );
      var opts =
        Array.isArray(e[5]) && p.effect !== 'Enhanced Trait'
          ? '<label class="field"><span>Cost per rank</span><select data-mmsel="powers.' +
            i +
            '.base">' +
            e[5]
              .map(function (v) {
                return '<option value="' + v + '"' + (baseCost(p) === v ? ' selected' : '') + '>' + v + '</option>';
              })
              .join('') +
            '</select></label>'
          : '';
      var target =
        p.effect === 'Enhanced Trait'
          ? '<label class="field"><span>Raises</span><select data-mmsel="powers.' +
            i +
            '.target"><option value="">— choose —</option>' +
            '<optgroup label="Abilities (2 per rank)">' +
            M.abilities
              .map(function (a) {
                return (
                  '<option value="ab:' +
                  a[0] +
                  '"' +
                  (p.target === 'ab:' + a[0] ? ' selected' : '') +
                  '>' +
                  a[1] +
                  '</option>'
                );
              })
              .join('') +
            '</optgroup>' +
            '<optgroup label="Defenses (1 per rank)">' +
            DEF.map(function (x) {
              return (
                '<option value="def:' +
                x[0] +
                '"' +
                (p.target === 'def:' + x[0] ? ' selected' : '') +
                '>' +
                x[1] +
                '</option>'
              );
            }).join('') +
            '</optgroup>' +
            '<optgroup label="Skills (½ per rank)">' +
            M.skills
              .reduce(function (out, s) {
                if (!s[3])
                  out.push(
                    '<option value="skill:' +
                      s[0] +
                      '"' +
                      (p.target === 'skill:' + s[0] ? ' selected' : '') +
                      '>' +
                      s[0] +
                      '</option>'
                  );
                return out;
              }, [])
              .join('') +
            '</optgroup>' +
            '<optgroup label="Advantages (1 per rank)">' +
            M.advantages
              .reduce(function (out, a) {
                if (a[2])
                  out.push(
                    '<option value="adv:' +
                      a[0] +
                      '"' +
                      (p.target === 'adv:' + a[0] ? ' selected' : '') +
                      '>' +
                      a[0] +
                      '</option>'
                  );
                return out;
              }, [])
              .join('') +
            '</optgroup></select></label>'
          : '';
      var strBox =
        p.effect === 'Damage' && rangeOf(p) === 'Close'
          ? '<label class="check-line"><input type="checkbox" data-mmchk="powers.' +
            i +
            '.str"' +
            (p.str ? ' checked' : '') +
            '> <span><b>Adds Strength</b><br><span class="small muted">A punch, a weapon, claws: the damage is Strength + this rank (' +
            (d.ab.STR + (+p.rank || 0)) +
            ').</span></span></label>'
          : '';
      var resist = /^(Affliction|Weaken)$/.test(p.effect)
        ? '<label class="field"><span>Resisted by</span><select data-mmsel="powers.' +
          i +
          '.resist">' +
          ['Fortitude', 'Will', 'Dodge', 'Fortitude or Will']
            .map(function (r) {
              return '<option' + ((p.resist || 'Fortitude or Will') === r ? ' selected' : '') + '>' + r + '</option>';
            })
            .join('') +
          '</select></label>'
        : '';
      var mods = (p.mods || [])
        .map(function (m, j) {
          var md = MODS[m.n] || ['', 'flat', [0], 0, ''],
            isFlaw = M.flaws.some(function (f) {
              return f[0] === m.n;
            });
          var val =
            md[2].length > 1
              ? '<select data-mmsel="powers.' +
                i +
                '.mods.' +
                j +
                '.v" aria-label="' +
                esc(m.n) +
                ' cost">' +
                md[2]
                  .map(function (v) {
                    return (
                      '<option value="' +
                      v +
                      '"' +
                      (+m.v === v ? ' selected' : '') +
                      '>' +
                      (v > 0 ? '+' : '') +
                      v +
                      '</option>'
                    );
                  })
                  .join('') +
                '</select>'
              : '<span class="small">' + (md[2][0] > 0 ? '+' : '') + md[2][0] + '</span>';
          var unit = md[1] === 'rank' ? '/rank' : md[1] === 'flat' ? ' flat' : ' per 5 pts';
          var ranked = md[3] || /^(Area|Increased Range|Reduced Range|Increased Duration|Limited)$/.test(m.n);
          return (
            '<div class="mm-mod' +
            (isFlaw ? ' flaw' : '') +
            '"><span class="nm"><b>' +
            esc(m.n) +
            '</b> ' +
            val +
            '<small class="muted">' +
            unit +
            '</small><small class="muted">' +
            esc(md[4]) +
            '</small></span>' +
            (ranked ? step('powers.' + i + '.mods.' + j + '.r', Math.max(1, +m.r || 1), 1, 20, m.n + ' times') : '') +
            '<input type="text" id="mm-p' +
            i +
            'm' +
            j +
            '" data-mmf="powers.' +
            i +
            '.mods.' +
            j +
            '.note" value="' +
            esc(m.note || '') +
            '" placeholder="Details" aria-label="' +
            esc(m.n) +
            ' details">' +
            btn('mmModRm', '✕', { i: i, v: j }, 'btn small') +
            '</div>'
          );
        })
        .join('');
      return (
        '<div class="panel mm-power open">' +
        head +
        '<p class="small muted">' +
        esc(e[1] || '') +
        ' · ' +
        esc(e[2] || '') +
        ' · ' +
        esc(rangeOf(p)) +
        ' · ' +
        esc(e[4] || '') +
        ' — ' +
        esc(e[6] || '') +
        '</p>' +
        '<div class="row">' +
        txt('powers.' + i + '.name', p.name, p.effect, 'Power name') +
        '<div class="field"><span>Rank</span>' +
        step('powers.' + i + '.rank', +p.rank || 1, 1, 40, 'rank') +
        '</div></div>' +
        (opts || target || resist ? '<div class="row">' + opts + target + resist + '</div>' : '') +
        strBox +
        txt('powers.' + i + '.desc', p.desc, 'Descriptors and how it looks: fire, magic, a gadget…', 'Description') +
        '<h4>Extras and flaws</h4>' +
        (mods || '<p class="small muted">None.</p>') +
        '<div class="row"><label class="field"><span>Add an extra</span><select data-mmaddmod="' +
        i +
        '"><option value="">— extra —</option>' +
        M.extras
          .map(function (m) {
            return '<option>' + m[0] + '</option>';
          })
          .join('') +
        '</select></label>' +
        '<label class="field"><span>Add a flaw</span><select data-mmaddmod="' +
        i +
        '"><option value="">— flaw —</option>' +
        M.flaws
          .map(function (m) {
            return '<option>' + m[0] + '</option>';
          })
          .join('') +
        '</select></label></div>' +
        '<p class="small"><b>Cost:</b> ' +
        (c.per >= 1
          ? c.per + ' per rank'
          : c.per > 0
            ? '1 per ' + Math.round(1 / c.per) + ' ranks'
            : '1 per ' + (2 - c.per) + ' ranks') +
        ' → <b>' +
        c.cost +
        ' points</b>' +
        (att
          ? ' · ' +
            (att.bonus == null ? 'no attack roll' : 'attack ' + fmt(att.bonus)) +
            ' · DC ' +
            att.dc +
            ' ' +
            esc(att.resist)
          : '') +
        '</p>' +
        '<div class="toolbar">' +
        btn('mmPowRm', 'Delete power', { v: i }, 'btn small danger') +
        btn('mmPowDup', 'Copy', { v: i }, 'btn small') +
        '</div></div>'
      );
    }
    function powers(h, d) {
      var q = (ui.q.mmfx || '').toLowerCase();
      var pick = U.pick
        ? '<div class="panel"><div class="toolbar"><b>Choose an effect</b><span class="spacer"></span>' +
          btn('mmPick', 'Cancel', { v: 0 }, 'btn small') +
          '</div><input type="search" id="q-mmfx" data-q="mmfx" placeholder="Search effects…" value="' +
          esc(ui.q.mmfx || '') +
          '">' +
          ['Attack', 'Control', 'Defense', 'General', 'Movement', 'Sensory']
            .map(function (ty) {
              var l = M.effects.filter(function (e) {
                return e[1] === ty && (!q || (e[0] + ' ' + e[6]).toLowerCase().indexOf(q) >= 0);
              });
              return l.length
                ? '<h4>' +
                    ty +
                    '</h4><div class="optlist" style="max-height:none">' +
                    l
                      .map(function (e) {
                        return (
                          '<button type="button" class="opt" data-act="mmPowAdd" data-v="' +
                          e[0] +
                          '"><b>' +
                          e[0] +
                          '</b> <small class="muted">— ' +
                          (Array.isArray(e[5]) ? e[5].join('–') : e[5]) +
                          ' per rank · ' +
                          e[3] +
                          '</small><span>' +
                          esc(e[6]) +
                          '</span></button>'
                        );
                      })
                      .join('') +
                    '</div>'
                : '';
            })
            .join('') +
          '</div>'
        : '';
      return (
        '<h2>Powers</h2><p class="muted">Each power is an effect with a rank, plus extras (cost more) and flaws (cost less). Tap a power to change it.</p>' +
        (h.powers || [])
          .map(function (p, i) {
            return powerCard(p, i, d);
          })
          .join('') +
        (U.pick ? pick : '<div class="toolbar">' + btn('mmPick', '+ Add a power', { v: 1 }, 'btn primary') + '</div>')
      );
    }
    function complications(h) {
      return (
        '<h2>Complications</h2><p class="muted">At least two, one of them a Motivation. When one causes trouble in play, the GM gives you a hero point.</p>' +
        (h.comp || [])
          .map(function (c, i) {
            return (
              '<div class="panel mm-comp"><div class="row"><label class="field"><span>Kind</span><select data-mmsel="comp.' +
              i +
              '.k">' +
              M.complications
                .map(function (k) {
                  return '<option' + (c.k === k[0] ? ' selected' : '') + '>' + k[0] + '</option>';
                })
                .join('') +
              '</select></label>' +
              txt(
                'comp.' + i + '.t',
                c.t,
                (M.complications.filter(function (k) {
                  return k[0] === c.k;
                })[0] || ['', ''])[1],
                'What it is'
              ) +
              '</div>' +
              btn('mmCompRm', 'Remove', { v: i }, 'btn small') +
              '</div>'
            );
          })
          .join('') +
        '<div class="toolbar">' +
        btn('mmCompAdd', '+ Add a complication', {}, 'btn') +
        '</div>'
      );
    }
    K.abilities = abilities;
    K.advantages = advantages;
    K.basics = basics;
    K.complications = complications;
    K.defenses = defenses;
    K.powers = powers;
    K.skills = skills;
  };
})(typeof window !== 'undefined' ? window : globalThis);
