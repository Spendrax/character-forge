// Pathfinder 2e screens: playing the character (hit points, the table), the sheet, conditions, skills, strikes and spells.
// Part of pf2-ui.js: it runs inside PF2UI; K holds the names the files share.
(function (root) {
  'use strict';
  (root.PF2UIParts = root.PF2UIParts || {}).sheet = function (K) {
    var G = K.G,
      COND_VAL = K.COND_VAL,
      PF2 = K.PF2,
      SIZE = K.SIZE,
      U = K.U,
      api = K.api,
      btn = K.btn,
      esc = K.esc,
      fmt = K.fmt,
      gl = K.gl,
      md = K.md,
      rar = K.rar,
      teml = K.teml,
      traits = K.traits;

    // ----- Sheet -----
    // the AC right now: with the shield raised, its bonus is added
    function acNow(ch, d) {
      return d.ac.v + (d.shield && trk(ch).raised ? d.shield.ac : 0);
    }
    function raiseBox(ch, d) {
      return d.shield
        ? '<label class="check-line"><input type="checkbox" data-pfraise="1"' +
            (trk(ch).raised ? ' checked' : '') +
            '> <span>Shield raised (+' +
            d.shield.ac +
            ' AC)</span></label>'
        : '';
    }
    function trk(ch) {
      return (ch.track = ch.track || { hp: null, temp: 0, hero: 1, focus: null, dying: 0, wounded: 0, conds: {} });
    }
    function hpBox(ch, d) {
      var T = trk(ch),
        hp = T.hp == null ? d.hp.max : T.hp,
        pct = Math.max(0, Math.min(100, Math.round((hp / d.hp.max) * 100)));
      return (
        '<div class="panel pf-hpbox"><div class="pf-hpline"><b class="pf-hp">' +
        hp +
        '</b><span class="muted">/ ' +
        d.hp.max +
        ' HP</span>' +
        (T.temp ? '<span class="pf-temp">+' + T.temp + ' temp</span>' : '') +
        '<span class="spacer"></span>' +
        btn('pfRest', 'Rest', {}, 'btn small') +
        '</div>' +
        '<div class="hpbar"><span style="width:' +
        pct +
        '%"></span></div><div class="enc-adj">' +
        ['-10', '-5', '-1', '+1', '+5', '+10']
          .map(function (v) {
            return btn('pfHp', v.replace('-', '−'), { v: v }, 'btn small');
          })
          .join('') +
        '</div>' +
        '<div class="row"><label class="field"><span>Temp HP</span><input type="number" min="0" inputmode="numeric" id="pf-temp" data-pftrk="temp" value="' +
        (T.temp || 0) +
        '"></label>' +
        '<div class="field"><span>Hero points</span><span class="pf-dots">' +
        [1, 2, 3]
          .map(function (i) {
            return btn('pfHero', '', { v: i }, 'pf-dot' + ((T.hero || 0) >= i ? ' on' : ''));
          })
          .join('') +
        '</span></div>' +
        (d.focusMax
          ? '<div class="field"><span>Focus points</span><span class="pf-dots">' +
            Array.apply(null, Array(d.focusMax))
              .map(function (_, i) {
                var f = T.focus == null ? d.focusMax : T.focus;
                return btn('pfFocus', '', { v: i + 1 }, 'pf-dot' + (f > i ? ' on' : ''));
              })
              .join('') +
            '</span></div>'
          : '') +
        '</div>' +
        '<div class="row"><div class="field"><span>Dying</span><span class="mm-step">' +
        btn('pfTrk', '−', { k: 'dying', d: -1 }, 'mm-b') +
        '<b>' +
        (T.dying || 0) +
        '</b>' +
        btn('pfTrk', '+', { k: 'dying', d: 1 }, 'mm-b') +
        '</span></div><div class="field"><span>Wounded</span><span class="mm-step">' +
        btn('pfTrk', '−', { k: 'wounded', d: -1 }, 'mm-b') +
        '<b>' +
        (T.wounded || 0) +
        '</b>' +
        btn('pfTrk', '+', { k: 'wounded', d: 1 }, 'mm-b') +
        '</span></div></div>' +
        condHtml(ch) +
        '</div>'
      );
    }
    // Session: the GM's table, then hit points, conditions and the numbers needed in a fight
    function who(ch, d) {
      var T = trk(ch);
      return {
        key: ch.id,
        name: ch.name,
        init: d.perception.v,
        bonus: function (a) {
          if (a.kind === 'save') return (d.saves[a.key] || {}).v || 0;
          if (a.kind === 'perception') return d.perception.v;
          if (a.kind === 'skill') {
            var s = Object.keys(d.skills)
              .map(function (k) {
                return d.skills[k];
              })
              .filter(function (x) {
                return x.n === a.key;
              })[0];
            return s ? s.v : 0;
          }
          return 0;
        },
        take: function (g) {
          var m = (ch.money = ch.money || {});
          ['pp', 'gp', 'sp', 'cp'].forEach(function (k) {
            var n = Math.max(0, Math.min(1e7, Math.floor(+(g.coins || {})[k] || 0)));
            // Starfinder keeps credits as silver: gold from the GM becomes 10 credits each
            if (n && G.credits) m.sp = (+m.sp || 0) + Math.floor(n * { pp: 100, gp: 10, sp: 1, cp: 0.1 }[k]);
            else if (n) m[k] = (+m[k] || 0) + n;
          });
          (g.items || []).slice(0, 20).forEach(function (i) {
            if (!i || !i.n) return;
            var e = i.id && PF2.byId('items', String(i.id));
            (ch.gear = ch.gear || []).push(
              e
                ? { uid: PF2.uid(), id: e.id, q: 1, worn: false, runes: {} }
                : { uid: PF2.uid(), id: '', custom: true, name: String(i.n).slice(0, 80), q: 1 }
            );
          });
        },
        status: function () {
          return {
            hp: T.hp == null ? d.hp.max : T.hp,
            max: d.hp.max,
            temp: +T.temp || 0,
            ac: acNow(ch, d),
            conds: Object.keys(T.conds || {})
              .map(function (c) {
                return c + (T.conds[c] > 1 ? ' ' + T.conds[c] : '');
              })
              .concat(T.dying ? ['Dying ' + T.dying] : []),
            conc: '',
            bon: (function () {
              var b = { Perception: d.perception.v };
              ['fortitude', 'reflex', 'will'].forEach(function (k) {
                b[k[0].toUpperCase() + k.slice(1) + ' save'] = d.saves[k].v;
              });
              Object.keys(d.skills).forEach(function (k) {
                b[d.skills[k].n] = d.skills[k].v;
              });
              return b;
            })()
          };
        },
        gm: 'GM',
        // what the GM sends: returns what to tell the player, and whether a level-up is waiting
        effect: function (f) {
          if (f.k === 'dmg' || f.k === 'heal') {
            K.actions.pfHp(f.k === 'dmg' ? -Math.abs(f.n) : Math.abs(f.n));
            return {
              msg:
                f.k === 'dmg' ? 'You take ' + Math.abs(f.n) + ' damage.' : 'You heal ' + Math.abs(f.n) + ' hit points.'
            };
          }
          if (f.k === 'cond') {
            T.conds = T.conds || {};
            if (f.on) T.conds[f.c] = T.conds[f.c] || 1;
            else delete T.conds[f.c];
            return { msg: (f.on ? 'You are now ' : 'No longer ') + f.c.toLowerCase() + '.' };
          }
          if (f.k === 'insp') {
            T.hero = Math.min(3, (T.hero || 0) + 1);
            return { msg: 'The GM gives you a hero point!' };
          }
          if (f.k === 'rest') {
            K.actions.pfRest();
            return { msg: 'Rested: hit points, spell slots and focus points are back.' };
          }
          if (f.k === 'xp') {
            ch.xp = (+ch.xp || 0) + f.n;
            return {
              msg: 'You gain ' + f.n + ' XP (now ' + ch.xp + ').',
              level: ch.xp >= 1000 && (ch.level || 1) < 20
            };
          }
          if (f.k === 'level') return { msg: 'The GM says: level up!', level: true };
          return null;
        },
        levelUp: function () {
          if (+ch.xp >= 1000) ch.xp -= 1000;
          U.tab = 'build';
          U.msg = 'Level up: raise the level on the Build tab and make the new choices.';
          root.scrollTo(0, 0);
        },
        notes: function () {
          return ch.notes ? [{ id: 'notes', title: (ch.name || 'My') + ' notes', text: ch.notes }] : [];
        },
        addNote: function (title, text) {
          ch.notes =
            (ch.notes ? ch.notes + '\n\n' : '') + '## ' + String(title || 'From the table') + '\n' + String(text || '');
        },
        rest: [['long', 'Rest for the night']],
        style: ch.noteStyle,
        // the whole character for the GM; the private notes stay on this phone
        sheet: function () {
          var c = JSON.parse(JSON.stringify(ch));
          delete c.notes;
          return { game: G.key, data: c };
        }
      };
    }
    function playTab(ch, d) {
      var stat = function (label, v) {
        return '<div class="pf-stat"><small>' + label + '</small><b>' + v + '</b></div>';
      };
      return (
        (api.tp ? api.tp.html(who(ch, d)) : '') +
        hpBox(ch, d) +
        raiseBox(ch, d) +
        '<div class="pf-stats">' +
        stat('AC', acNow(ch, d) + (trk(ch).raised && d.shield ? ' 🛡' : '')) +
        ['fortitude', 'reflex', 'will']
          .map(function (s) {
            return stat(s[0].toUpperCase() + s.slice(1), fmt(d.saves[s].v));
          })
          .join('') +
        stat('Perception', fmt(d.perception.v)) +
        (d.classDC ? stat('Class DC', d.classDC.v) : '') +
        stat('Speed', d.speed.v + ' ft') +
        '</div>'
      );
    }
    function sheetTab(ch, d) {
      var T = trk(ch),
        h = hpBox(ch, d);
      var stat = function (label, v, rank, sub) {
        return (
          '<div class="pf-stat"><small>' +
          label +
          '</small><b>' +
          v +
          '</b>' +
          (rank != null ? teml(rank) : '') +
          (sub ? '<span class="small muted">' + sub + '</span>' : '') +
          '</div>'
        );
      };
      h +=
        raiseBox(ch, d) +
        '<div class="pf-stats">' +
        stat(
          'AC',
          acNow(ch, d),
          d.ac.rank,
          (T.raised && d.shield ? 'shield raised (+' + d.shield.ac + ') · ' : '') +
            (d.armor ? esc(d.armor.e.n) : 'unarmored') +
            (d.ac.dexCap != null ? ' · Dex cap ' + d.ac.dexCap : '')
        ) +
        (d.shield
          ? stat(
              T.raised ? 'Shield (raised)' : 'Shield',
              '+' + d.shield.ac,
              null,
              esc(d.shield.e.n) +
                ' · Hardness ' +
                d.shield.hard +
                ' · HP ' +
                ((T.shield || {})[d.shield.g.uid || 'shield'] == null
                  ? d.shield.hp
                  : T.shield[d.shield.g.uid || 'shield']) +
                '/' +
                d.shield.hp
            )
          : '') +
        ['fortitude', 'reflex', 'will']
          .map(function (s) {
            return stat(s[0].toUpperCase() + s.slice(1), fmt(d.saves[s].v), d.saves[s].rank);
          })
          .join('') +
        stat(
          'Perception',
          fmt(d.perception.v),
          d.perception.rank,
          d.senses
            .map(function (s) {
              return esc(s.type.replace(/-/g, ' ')) + (s.range ? ' ' + s.range + ' ft' : '');
            })
            .join(', ')
        ) +
        (d.classDC ? stat('Class DC', d.classDC.v, d.classDC.rank) : '') +
        stat(
          'Speed',
          d.speed.v + ' ft',
          null,
          d.speed.other
            .map(function (s) {
              return s.type + ' ' + s.v;
            })
            .join(', ')
        ) +
        stat('Size', SIZE[d.size] || d.size) +
        '</div>';
      h +=
        '<div class="pf-abgrid">' +
        K.ABS.map(function (a) {
          return (
            '<div><small>' +
            a.toUpperCase() +
            '</small><b>' +
            fmt(d.mods[a]) +
            '</b><span>' +
            (G.remaster ? '' : d.scores[a]) +
            '</span></div>'
          );
        }).join('') +
        '</div>';
      if (d.resist.length || d.weak.length || d.immune.length)
        h +=
          '<div class="panel small">' +
          (d.resist.length
            ? '<b>Resistances</b> ' +
              esc(
                d.resist
                  .map(function (r) {
                    return r.type + ' ' + r.v;
                  })
                  .join(', ')
              ) +
              '<br>'
            : '') +
          (d.weak.length
            ? '<b>Weaknesses</b> ' +
              esc(
                d.weak
                  .map(function (r) {
                    return r.type + ' ' + r.v;
                  })
                  .join(', ')
              ) +
              '<br>'
            : '') +
          (d.immune.length
            ? '<b>Immunities</b> ' +
              esc(
                d.immune
                  .map(function (r) {
                    return r.type;
                  })
                  .join(', ')
              )
            : '') +
          '</div>';
      h +=
        '<div class="panel small"><b>Hit points</b>: ' +
        d.hp.parts
          .map(function (p) {
            return esc(p.label) + ' ' + p.v;
          })
          .join(' + ') +
        '<br><b>AC</b>: 10 + Dex ' +
        d.ac.dex +
        ' + proficiency ' +
        d.ac.prof +
        d.ac.parts
          .map(function (p) {
            return ' + ' + esc(p.label) + ' ' + p.v;
          })
          .join('') +
        '<br><b>Weapons</b>: ' +
        ['simple', 'martial', 'advanced', 'unarmed']
          .map(function (k) {
            return k + ' ' + PF2.RANK[(d.attackRanks[k] || {}).rank || 0].toLowerCase();
          })
          .join(', ') +
        '<br><b>Armor</b>: ' +
        ['unarmored', 'light', 'medium', 'heavy']
          .map(function (k) {
            return k + ' ' + PF2.RANK[(d.defenseRanks[k] || {}).rank || 0].toLowerCase();
          })
          .join(', ') +
        '</div>';
      h +=
        '<div class="toolbar noprint">' +
        btn('pfPrint', 'Print or save as PDF', {}, 'btn') +
        btn('pfExport', 'Export file', {}, 'btn') +
        btn('pfDup', 'Duplicate', {}, 'btn') +
        (U.delAsk
          ? '<span>Delete ' +
            esc(ch.name || 'this character') +
            '?</span>' +
            btn('pfDel', 'Yes, delete', {}, 'btn danger') +
            btn('pfDelNo', 'No', {}, 'btn')
          : btn('pfDelAsk', 'Delete', {}, 'btn')) +
        '</div>';
      return h;
    }
    function condHtml(ch) {
      var T = trk(ch),
        conds = PF2.index().core.conditions,
        have = Object.keys(T.conds || {});
      return (
        '<div class="pf-conds">' +
        have
          .map(function (c) {
            var v = T.conds[c];
            return (
              '<span class="pf-cond">' +
              esc(c) +
              (COND_VAL[c.toLowerCase()]
                ? ' ' +
                  btn('pfCond', '−', { v: c, d: -1 }, 'mm-b') +
                  '<b>' +
                  v +
                  '</b>' +
                  btn('pfCond', '+', { v: c, d: 1 }, 'mm-b')
                : '') +
              btn('pfCondRm', '✕', { v: c }, 'mm-b') +
              '</span>'
            );
          })
          .join('') +
        '<select data-pfcondadd="1" aria-label="Add a condition"><option value="">+ Condition…</option>' +
        conds
          .reduce(function (out, c) {
            if (have.indexOf(c.n) < 0) out.push('<option>' + esc(c.n) + '</option>');
            return out;
          }, [])
          .join('') +
        '</select></div>' +
        have
          .map(function (c) {
            var e = PF2.byName('conditions', c);
            return e ? '<details class="small pf-desc"><summary>' + esc(c) + '</summary>' + md(e.d) + '</details>' : '';
          })
          .join('')
      );
    }

    // ----- Skills -----
    function rollBtn(label, mod) {
      return (
        '<button type="button" class="pf-roll" data-act="pfRoll" data-v="' +
        mod +
        '" data-l="' +
        esc(label) +
        '">' +
        fmt(mod) +
        '</button>'
      );
    }
    function skillsTab(ch, d) {
      var row = function (s, k) {
        return (
          '<div class="pf-skill"><span class="nm"><b>' +
          esc(s.n) +
          '</b> <small class="muted">' +
          s.ab.toUpperCase() +
          (s.pen ? ' · armor ' + s.pen : '') +
          '</small></span>' +
          teml(s.rank) +
          rollBtn(s.n, s.v) +
          '</div>'
        );
      };
      return (
        '<div class="panel"><div class="pf-skill pf-perc"><span class="nm"><b>Perception</b> <small class="muted">WIS</small></span>' +
        teml(d.perception.rank) +
        rollBtn('Perception', d.perception.v) +
        '</div>' +
        PF2.SKILLS.map(function (k) {
          return row(d.skills[k], k);
        }).join('') +
        d.lores
          .map(function (l) {
            return row(d.skills['lore:' + l.n], 'lore:' + l.n);
          })
          .join('') +
        '</div><p class="small muted">Tap a bonus to roll it with the 3D dice. Untrained skills add no proficiency; trained adds your level + 2, expert + 4, master + 6, legendary + 8.</p>'
      );
    }
    // ----- Strikes -----
    function strikesTab(ch, d) {
      return (
        d.strikes
          .map(function (s, i) {
            var a = s.attack;
            return (
              '<div class="panel pf-strike"><div class="pf-strike-head"><b>' +
              esc(s.n) +
              '</b> ' +
              teml(s.rank) +
              '<span class="spacer"></span><small class="muted">' +
              (s.ranged ? 'Ranged' + (s.range ? ' ' + s.range + ' ft' : '') : 'Melee') +
              '</small></div>' +
              traits(s.traits) +
              '<div class="pf-map">' +
              rollBtn(s.n, a) +
              rollBtn(s.n + ' (2nd)', a - s.map[0]) +
              rollBtn(s.n + ' (3rd)', a - s.map[1]) +
              '</div>' +
              '<div class="pf-dmg"><button type="button" class="btn small" data-act="pfDmg" data-v="' +
              i +
              '">Damage ' +
              esc(s.dmg) +
              (s.extra.length ? ' + ' + esc(s.extra.join(', ')) : '') +
              '</button>' +
              (s.cond.length ? K.condBox(s, i) : '') +
              '</div></div>'
            );
          })
          .join('') +
        '<p class="small muted">The three attack buttons are your first, second and third attack this turn (multiple attack penalty' +
        (d.strikes.some(function (s) {
          return s.map[0] === 4;
        })
          ? '; agile weapons take less'
          : '') +
        '). Weapons come from the Gear tab.</p>'
      );
    }
    // ----- Spells -----
    // quick filters on the spells page: how many actions, reactions, sustained…
    var SPK = [
      [
        '1',
        '◆ 1 action',
        function (s) {
          return s.time === '1' || /^1 (to|or)/.test(s.time || '');
        }
      ],
      [
        '2',
        '◆◆ 2 actions',
        function (s) {
          return s.time === '2' || /(1|2) (to|or) (2|3)/.test(s.time || '');
        }
      ],
      [
        '3',
        '◆◆◆ 3 actions',
        function (s) {
          return s.time === '3' || /(to|or) 3/.test(s.time || '');
        }
      ],
      [
        'reaction',
        '⤾ Reaction',
        function (s) {
          return s.time === 'reaction';
        }
      ],
      [
        'free',
        '◇ Free',
        function (s) {
          return s.time === 'free';
        }
      ],
      [
        'sus',
        'Sustained',
        function (s) {
          return !!s.sus;
        }
      ],
      [
        'long',
        'Longer (exploration)',
        function (s) {
          return /minute|hour|day|week/i.test(s.time || '');
        }
      ]
    ];
    function spOk(s) {
      var k = SPK.filter(function (x) {
        return x[0] === U.spK;
      })[0];
      return !k || k[2](s);
    }
    function spellsTab(ch, d) {
      var h =
          '<div class="pills spell-kinds">' +
          SPK.map(function (k) {
            return btn('pfSpK', k[1], { v: k[0] }, 'pill small' + (U.spK === k[0] ? ' on' : ''));
          }).join('') +
          '</div>',
        T = trk(ch);
      if (!d.casters.length && !d.focusMax && !(ch.spells && ch.spells.innate))
        h +=
          '<p class="muted">No spellcasting yet. Spells come from your class, a multiclass dedication, or feats (innate and focus spells).</p>';
      d.casters.forEach(function (c) {
        var bucket = (ch.spells || {})[c.id] || { known: {} },
          used = (T.slots || {})[c.id] || {};
        h +=
          '<section class="panel pf-caster"><div class="toolbar" style="margin:0"><h3 style="margin:0">' +
          esc(c.n) +
          '</h3><span class="spacer"></span>' +
          btn('pfSlotsReset', 'Restore slots', { v: c.id }, 'btn small') +
          '</div>' +
          (c.needTrad
            ? '<p class="small bad">Choose your ' +
              (c.arch ? 'archetype’s ' : '') +
              'subclass first (bloodline, patron or eidolon): it decides your tradition.</p>'
            : '') +
          '<p class="small">' +
          esc(
            (c.trad || '?').replace(/^./, function (x) {
              return x.toUpperCase();
            })
          ) +
          ' · ' +
          c.type +
          ' · <b>DC ' +
          c.dc +
          '</b> · attack ' +
          rollBtn('Spell attack', c.attack) +
          ' ' +
          teml(c.rank) +
          '</p>';
        for (var r = 0; r <= 10; r++) {
          var n = r === 0 ? c.cantrips : c.slots[r];
          if (!n) continue;
          var known = (bucket.known || {})[r] || [],
            u = used[r] || 0;
          var granted = r === 0 ? [] : [];
          h +=
            '<div class="pf-rank"><div class="pf-rank-head"><b>' +
            (r ? 'Rank ' + r : 'Cantrips (rank ' + c.heighten + ')') +
            '</b>' +
            (r
              ? '<span class="pf-dots">' +
                Array.apply(null, Array(n))
                  .map(function (_, i) {
                    return btn('pfSlot', '', { v: c.id, r: r, i: i + 1 }, 'pf-dot' + (i < n - u ? ' on' : ''));
                  })
                  .join('') +
                '</span>'
              : '') +
            '<span class="spacer"></span>' +
            btn('pfPick', '+ Spell', { k: 'spell', entry: c.id, rank: r, trad: c.trad }, 'btn tiny') +
            '</div>' +
            spellRows(known, c.id, r) +
            (c.rep && r
              ? '<div class="small muted">' + known.length + ' of ' + n + ' in your repertoire</div>'
              : r === 0 && known.length < n
                ? '<div class="small muted">' + known.length + ' of ' + n + '</div>'
                : '') +
            '</div>';
        }
        if (c.font)
          h +=
            '<p class="small">Divine font: ' +
            (1 + d.mods.cha) +
            ' extra slots of your highest rank for heal or harm.</p>';
        h += '</section>';
      });
      // spells granted by features (bloodline, domain, compositions…)
      if (d.grantedSpells.length)
        h +=
          '<section class="panel"><h3 style="margin-top:0">Granted spells</h3>' +
          d.grantedSpells
            .map(function (g) {
              return spellRow(g.s, null, null, g.from);
            })
            .join('') +
          '</section>';
      // focus
      if (d.focusMax || (ch.spells && ch.spells.focus)) {
        var fb = (ch.spells || {}).focus || { known: {} },
          fv = T.focus == null ? d.focusMax : T.focus;
        h +=
          '<section class="panel"><div class="toolbar" style="margin:0"><h3 style="margin:0">Focus spells</h3><span class="spacer"></span>' +
          btn('pfPick', '+ Focus spell', { k: 'spell', entry: 'focus', rank: 0, focus: 1 }, 'btn tiny') +
          '</div>' +
          '<p class="small">Focus points <span class="pf-dots">' +
          Array.apply(null, Array(Math.max(1, d.focusMax)))
            .map(function (_, i) {
              return btn('pfFocus', '', { v: i + 1 }, 'pf-dot' + (fv > i ? ' on' : ''));
            })
            .join('') +
          '</span> · DC ' +
          d.focus.dc +
          ' · attack ' +
          fmt(d.focus.attack) +
          ' · heightened to rank ' +
          Math.max(1, Math.ceil(d.level / 2)) +
          '</p>' +
          spellRows((fb.known || {})[0] || [], 'focus', 0) +
          '</section>';
      }
      var inn = (ch.spells || {}).innate || { known: {} };
      h +=
        '<section class="panel"><div class="toolbar" style="margin:0"><h3 style="margin:0">Innate spells</h3><span class="spacer"></span>' +
        btn('pfPick', '+ Innate spell', { k: 'spell', entry: 'innate', rank: 10 }, 'btn tiny') +
        '</div><p class="small muted">From ancestry feats and items (First World Magic and the like). Charisma, trained, as the feat says.</p>' +
        Object.keys(inn.known || {})
          .map(function (r) {
            return spellRows(inn.known[r], 'innate', r);
          })
          .join('') +
        '</section>';
      return h;
    }
    function spellRows(ids, entry, r) {
      return (ids || [])
        .map(function (id) {
          var s = PF2.byId('spells', id);
          return s ? spellRow(s, entry, r) : '';
        })
        .join('');
    }
    function spellRow(s, entry, r, from) {
      if (!spOk(s)) return '';
      var k = 's:' + (entry || 'g') + ':' + s.id,
        open = U.open === k;
      return (
        '<div class="pf-spell' +
        rar(s) +
        '"><button type="button" class="pf-pname" data-act="pfOpenRow" data-v="' +
        esc(k) +
        '"><b>' +
        esc(s.n) +
        '</b> ' +
        gl(/^[123rf]$/.test(s.time) ? s.time : '') +
        '<span class="spacer"></span><small class="muted">' +
        (from ? esc(from) : s.cat === 'cantrip' ? 'cantrip' : s.cat === 'focus' ? 'focus' : 'rank ' + s.lv) +
        '</small></button>' +
        (entry ? btn('pfSpellRm', '✕', { v: s.id, e: entry, r: r }, 'mm-b') : '') +
        (open ? '<div class="pf-desc">' + traits(s.t, s) + K.spellLine(s) + md(s.d) + '</div>' : '') +
        '</div>'
      );
    }
    K.acNow = acNow;
    K.condHtml = condHtml;
    K.playTab = playTab;
    K.raiseBox = raiseBox;
    K.rollBtn = rollBtn;
    K.sheetTab = sheetTab;
    K.skillsTab = skillsTab;
    K.spellsTab = spellsTab;
    K.trk = trk;
  };
})(typeof window !== 'undefined' ? window : globalThis);
