// Pathfinder 2e screens: runes, defense, offense, gear, feats, actions and notes.
// Part of pf2-ui.js: it runs inside PF2UI; K holds the names the files share.
(function (root) {
  'use strict';
  (root.PF2UIParts = root.PF2UIParts || {}).gear = function (K) {
    var ALIGN = K.ALIGN,
      PF2 = K.PF2,
      U = K.U,
      btn = K.btn,
      esc = K.esc,
      fmt = K.fmt,
      gl = K.gl,
      md = K.md,
      picHtml = K.picHtml,
      rar = K.rar,
      teml = K.teml,
      traits = K.traits;

    // ----- runes: fundamental runes as selects, property runes as slots (one per potency rank) that open the rune picker -----
    function runeEditor(ch, g, i, e) {
      var R = g.runes || {},
        isW = e.k === 'weapon',
        isArmor = e.k === 'armor' && e.cat !== 'shield';
      if (!isW && !isArmor && (e.t || []).indexOf('invested') < 0) return '';
      var h =
        '<div class="pf-runes"><label class="field"><span>Potency</span><select data-pfrune="' +
        i +
        '" data-f="pot">' +
        [0, 1, 2, 3]
          .map(function (v) {
            return (
              '<option value="' +
              v +
              '"' +
              ((+R.pot || 0) === v ? ' selected' : '') +
              '>' +
              (v ? '+' + v : 'none') +
              '</option>'
            );
          })
          .join('') +
        '</select></label>';
      if (isW)
        h +=
          '<label class="field"><span>Striking</span><select data-pfrune="' +
          i +
          '" data-f="str">' +
          [
            ['', 'none'],
            ['striking', 'Striking'],
            ['greaterStriking', 'Greater'],
            ['majorStriking', 'Major']
          ]
            .map(function (o) {
              return (
                '<option value="' + o[0] + '"' + ((R.str || '') === o[0] ? ' selected' : '') + '>' + o[1] + '</option>'
              );
            })
            .join('') +
          '</select></label>';
      if (isArmor)
        h +=
          '<label class="field"><span>Resilient</span><select data-pfrune="' +
          i +
          '" data-f="res">' +
          [
            ['', 'none'],
            ['resilient', 'Resilient'],
            ['greaterResilient', 'Greater'],
            ['majorResilient', 'Major']
          ]
            .map(function (o) {
              return (
                '<option value="' + o[0] + '"' + ((R.res || '') === o[0] ? ' selected' : '') + '>' + o[1] + '</option>'
              );
            })
            .join('') +
          '</select></label>';
      h += '</div>';
      if (isW || isArmor || (R.prop || []).length) {
        var n = Math.max(+R.pot || 0, (R.prop || []).length);
        h +=
          '<div class="small muted">Property runes: one slot per potency rank (+' +
          (+R.pot || 0) +
          ').</div><div class="pf-runeslots">';
        for (var s = 0; s < n; s++) {
          var nm = (R.prop || [])[s],
            re = nm && PF2.byName('items', nm);
          h +=
            '<span class="pf-runeslot"><button type="button" class="pf-pickcard' +
            rar(re) +
            '" data-act="pfPick" data-k="rune" data-gi="' +
            i +
            '" data-slot="' +
            s +
            '" data-which="' +
            (isW ? 'w' : 'a') +
            '"><small>Property rune ' +
            (s + 1) +
            '</small><b>' +
            (nm ? esc(nm) : 'Choose…') +
            '</b></button>' +
            (nm ? btn('pfRuneRm', '✕', { v: i, s: s }, 'btn small') : '') +
            '</span>';
        }
        h += (n ? '' : '<span class="small muted">Add a potency rune first.</span>') + '</div>';
      }
      return h;
    }
    function gearIndex(ch, x) {
      return (ch.gear || []).indexOf(x);
    }

    // ----- Defense -----
    function defenseTab(ch, d) {
      var T = K.trk(ch),
        arm = d.armor,
        sh = d.shield;
      var h =
        '<div class="panel pf-bigstat"><div><small>Armor Class' +
        (sh && T.raised ? ', shield raised' : '') +
        '</small><b>' +
        K.acNow(ch, d) +
        '</b>' +
        teml(d.ac.rank) +
        '</div>' +
        K.raiseBox(ch, d) +
        '<p class="small">10 + Dex ' +
        d.ac.dex +
        (d.ac.dexCap != null ? ' (cap ' + d.ac.dexCap + ')' : '') +
        ' + ' +
        PF2.RANK[d.ac.rank].toLowerCase() +
        ' in ' +
        d.ac.cat +
        ' ' +
        d.ac.prof +
        d.ac.parts
          .map(function (p) {
            return ' + ' + esc(p.label) + ' ' + p.v;
          })
          .join('') +
        '</p>' +
        (d.checkPenalty
          ? '<p class="small bad">Armor check penalty ' +
            d.checkPenalty +
            ' on Strength and Dexterity skills (your Strength is below the armor’s).</p>'
          : '') +
        (d.armorSpeedPenalty ? '<p class="small">Speed ' + d.armorSpeedPenalty + ' ft from armor.</p>' : '') +
        '</div>';
      // armor
      h +=
        '<section class="panel"><div class="toolbar" style="margin:0"><h3 style="margin:0">Armor</h3><span class="spacer"></span>' +
        btn('pfPick', arm ? 'Change' : 'Choose armor', { k: 'item', equip: 'armor', type: 'armor' }, 'btn small') +
        (arm ? btn('pfUnequip', 'Take off', { v: gearIndex(ch, arm.g) }, 'btn small') : '') +
        '</div>';
      if (arm) {
        var e = arm.e,
          gi = gearIndex(ch, arm.g);
        h +=
          '<p><b>' +
          esc(runeTitle(arm.g) + (arm.g.name || e.n)) +
          '</b></p>' +
          traits(e.t, e) +
          K.itemLine(e) +
          runeEditor(ch, arm.g, gi, e) +
          '<details class="small pf-desc"><summary>About ' +
          esc(e.n) +
          '</summary>' +
          md(e.d) +
          runeDescs(arm.g) +
          '</details>';
      } else
        h +=
          '<p class="small muted">Unarmored' +
          (d.ac.dexCap != null ? ' (worn items cap Dex at +' + d.ac.dexCap + ')' : '') +
          '. Explorer’s clothing and bracers of armor count as unarmored; add them from Gear and mark them worn.</p>';
      var worn = (ch.gear || []).filter(function (g) {
        var e = PF2.byId('items', g.id);
        return (
          g.worn &&
          e &&
          e.k !== 'armor' &&
          e.k !== 'weapon' &&
          (e.ru || []).some(function (r) {
            return r.key === 'FlatModifier' && [].concat(r.selector).indexOf('ac') >= 0;
          })
        );
      });
      worn.forEach(function (g) {
        var e = PF2.byId('items', g.id),
          gi = gearIndex(ch, g);
        h +=
          '<div class="pf-subitem"><b>' +
          esc(runeTitle(g) + (g.name || e.n)) +
          '</b>' +
          runeEditor(ch, g, gi, e) +
          '</div>';
      });
      h +=
        '<p class="small">Armor proficiency: ' +
        ['unarmored', 'light', 'medium', 'heavy']
          .map(function (k) {
            return k + ' ' + PF2.RANK[(d.defenseRanks[k] || {}).rank || 0].toLowerCase();
          })
          .join(' · ') +
        '</p></section>';
      // shield
      h +=
        '<section class="panel"><div class="toolbar" style="margin:0"><h3 style="margin:0">Shield</h3><span class="spacer"></span>' +
        btn('pfPick', sh ? 'Change' : 'Choose a shield', { k: 'item', equip: 'shield', type: 'shield' }, 'btn small') +
        (sh ? btn('pfUnequip', 'Put away', { v: gearIndex(ch, sh.g) }, 'btn small') : '') +
        '</div>';
      if (sh) {
        var sid = sh.g.uid || 'shield',
          shp = (T.shield || {})[sid];
        shp = shp == null ? sh.hp : shp;
        var pct = sh.hp ? Math.max(0, Math.round((shp / sh.hp) * 100)) : 0,
          broken = shp <= sh.bt;
        h +=
          '<p><b>' +
          esc(sh.g.name || sh.e.n) +
          '</b> · +' +
          sh.ac +
          ' AC raised · Hardness ' +
          sh.hard +
          '</p>' +
          '<div class="pm-hp"><span><b>' +
          shp +
          '</b>/' +
          sh.hp +
          ' HP' +
          (broken ? ' · <b class="bad">' + (shp <= 0 ? 'destroyed' : 'broken') + '</b>' : '') +
          ' (broken at ' +
          sh.bt +
          ')</span><div class="hpbar"><span style="width:' +
          pct +
          '%"></span></div>' +
          '<div class="enc-adj">' +
          ['-10', '-5', '-1', '+1', '+5', '+10']
            .map(function (v) {
              return btn('pfShieldHp', v.replace('-', '−'), { v: v }, 'btn small');
            })
            .join('') +
          '</div></div>' +
          '<p class="small muted">Shield Block (if you have it): when you take damage with the shield raised, it takes the damage first, reduced by its Hardness; you and the shield both take what’s left.</p>' +
          '<details class="small pf-desc"><summary>About ' +
          esc(sh.e.n) +
          '</summary>' +
          md(sh.e.d) +
          '</details>';
      } else h += '<p class="small muted">No shield.</p>';
      h += '</section>';
      // saves
      h +=
        '<section class="panel"><h3 style="margin-top:0">Saving throws</h3>' +
        ['fortitude', 'reflex', 'will']
          .map(function (s) {
            var x = d.saves[s];
            return (
              '<div class="pf-skill"><span class="nm"><b>' +
              s[0].toUpperCase() +
              s.slice(1) +
              '</b> <small class="muted">' +
              x.ab.toUpperCase() +
              x.parts
                .reduce(function (out, p) {
                  if (p.v) out.push(' · ' + esc(p.label) + ' ' + fmt(p.v));
                  return out;
                }, [])
                .join('') +
              '</small></span>' +
              teml(x.rank) +
              K.rollBtn(s, x.v) +
              '</div>'
            );
          })
          .join('') +
        '</section>';
      if (d.resist.length || d.weak.length || d.immune.length)
        h +=
          '<section class="panel small"><h3 style="margin-top:0">Resistances and weaknesses</h3>' +
          (d.resist.length
            ? '<b>Resistances</b> ' +
              esc(
                d.resist
                  .map(function (r) {
                    return r.type + ' ' + r.v + ' (' + r.from + ')';
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
          '</section>';
      h += '<section class="panel"><h3 style="margin-top:0">Conditions</h3>' + K.condHtml(ch) + '</section>';
      return h;
    }
    function runeTitle(g) {
      var R = g.runes || {};
      return (
        (R.pot ? '+' + R.pot + ' ' : '') +
        (R.str
          ? { striking: 'Striking ', greaterStriking: 'Greater Striking ', majorStriking: 'Major Striking ' }[R.str]
          : '') +
        (R.res
          ? { resilient: 'Resilient ', greaterResilient: 'Greater Resilient ', majorResilient: 'Major Resilient ' }[
              R.res
            ]
          : '') +
        ((R.prop || []).length ? R.prop.join(' ') + ' ' : '')
      );
    }
    function runeDescs(g) {
      return ((g.runes || {}).prop || [])
        .map(function (n) {
          var e = PF2.byName('items', n);
          return e ? '<p><b>' + esc(e.n) + ':</b> ' + esc(String(e.d || '').split('\n')[0]) + '</p>' : '';
        })
        .join('');
    }

    // ----- Offense -----
    // extra damage that only counts sometimes, like Sneak Attack (the target must be off-guard): a box to tick
    function condBox(s, i) {
      var sa = s.cond.filter(function (c) {
          return /Sneak Attack/.test(c);
        }),
        label = sa.length
          ? '<b>Sneak Attack</b> +' +
            esc(sa[0].replace(/ ?Sneak Attack$/, '')) +
            ' <span class="muted">(target off-guard)</span>'
          : 'Add ' + esc(s.cond.join(', '));
      return (
        '<label class="check-line small pf-sneak"><input type="checkbox" data-pfcondmg="' +
        i +
        '"' +
        ((U.cdmg || {})[i] ? ' checked' : '') +
        '> <span>' +
        label +
        '</span></label>'
      );
    }
    function offenseTab(ch, d) {
      var at = d.attackRanks,
        special = Object.keys(at).filter(function (k) {
          return /^weapon-(base|group)-/.test(k) && at[k].rank > Math.max(at.simple.rank, at.martial.rank);
        });
      var h =
        '<section class="panel"><div class="pf-skill pf-perc"><span class="nm"><b>Perception</b> <small class="muted">initiative</small></span>' +
        teml(d.perception.rank) +
        K.rollBtn('Perception', d.perception.v) +
        '</div>' +
        (d.classDC
          ? '<div class="pf-skill"><span class="nm"><b>Class DC</b> <small class="muted">' +
            (d.key || '').toUpperCase() +
            '</small></span>' +
            teml(d.classDC.rank) +
            '<b class="pf-dc">' +
            d.classDC.v +
            '</b></div>'
          : '') +
        d.casters
          .map(function (c) {
            return (
              '<div class="pf-skill"><span class="nm"><b>' +
              esc(c.n) +
              '</b> <small class="muted">' +
              esc(c.trad || '') +
              ' · DC ' +
              c.dc +
              '</small></span>' +
              teml(c.rank) +
              K.rollBtn('Spell attack', c.attack) +
              '</div>'
            );
          })
          .join('') +
        '<p class="small">Weapons: ' +
        ['simple', 'martial', 'advanced', 'unarmed']
          .map(function (k) {
            return k + ' ' + PF2.RANK[(at[k] || {}).rank || 0].toLowerCase();
          })
          .join(' · ') +
        (special.length
          ? ' · ' +
            special
              .map(function (k) {
                return (
                  k.replace(/^weapon-(base|group)-/, '').replace(/-/g, ' ') + ' ' + PF2.RANK[at[k].rank].toLowerCase()
                );
              })
              .join(' · ')
          : '') +
        '</p>' +
        '<div class="toolbar">' +
        btn('pfPick', '+ Add a weapon', { k: 'item', equip: 'weapon', type: 'weapon' }, 'btn primary') +
        '</div></section>';
      return (
        h +
        d.strikes
          .map(function (s, i) {
            var a = s.attack,
              gi = s.g && s.g.uid ? gearIndex(ch, s.g) : -1,
              k = 'w:' + i,
              open = U.open === k;
            return (
              '<div class="panel pf-strike"><div class="pf-strike-head"><b>' +
              esc((s.g && s.g.runes ? runeTitle(s.g) : '') + s.n) +
              '</b> ' +
              teml(s.rank) +
              '<span class="spacer"></span><small class="muted">' +
              (s.ranged ? 'Ranged' + (s.range ? ' ' + s.range + ' ft' : '') : 'Melee') +
              '</small></div>' +
              traits(s.traits) +
              '<div class="pf-map">' +
              K.rollBtn(s.n, a) +
              K.rollBtn(s.n + ' (2nd)', a - s.map[0]) +
              K.rollBtn(s.n + ' (3rd)', a - s.map[1]) +
              '</div>' +
              '<div class="pf-dmg"><button type="button" class="btn small" data-act="pfDmg" data-v="' +
              i +
              '">Damage ' +
              esc(s.dmg) +
              (s.extra.length ? ' + ' + esc(s.extra.join(', ')) : '') +
              ((U.cdmg || {})[i] && s.cond.length ? ' <b>+ ' + esc(s.cond.join(', ')) + '</b>' : '') +
              '</button>' +
              (s.cond.length ? condBox(s, i) : '') +
              '</div>' +
              (gi >= 0
                ? '<div class="toolbar">' +
                  btn('pfOpenRow', open ? 'Close' : 'Runes and details', { v: k }, 'btn small') +
                  btn('pfUnequip', 'Stow', { v: gi }, 'btn small') +
                  '</div>' +
                  (open
                    ? runeEditor(ch, s.g, gi, s.w) +
                      '<details class="small pf-desc"><summary>About ' +
                      esc(s.w.n) +
                      '</summary>' +
                      md(s.w.d) +
                      runeDescs(s.g) +
                      '</details>'
                    : '')
                : '') +
              '</div>'
            );
          })
          .join('') +
        '<p class="small muted">The three attack buttons are your first, second and third attack this turn (multiple attack penalty). Stowed weapons stay in Gear; mark them Ready there to bring them back.</p>'
      );
    }

    // ----- Gear -----
    function gearTab(ch, d) {
      var m = ch.money || {},
        bulk = 0;
      (ch.gear || []).forEach(function (g) {
        var e = PF2.byId('items', g.id);
        var b = e ? e.bulk : 0;
        bulk += (b === 'L' ? 0.1 : +b || 0) * (g.q || 1) * (b === 'L' ? 1 : 1);
      });
      var str = d.mods.str,
        enc = 5 + str,
        max = 10 + str;
      var h =
        '<div class="panel"><div class="pf-coins">' +
        ['pp', 'gp', 'sp', 'cp']
          .map(function (c) {
            return (
              '<label class="pf-coin pf-' +
              c +
              '"><span>' +
              c.toUpperCase() +
              '</span><input type="number" min="0" inputmode="numeric" id="pf-m-' +
              c +
              '" data-pfmoney="' +
              c +
              '" value="' +
              (m[c] || 0) +
              '"></label>'
            );
          })
          .join('') +
        '</div>' +
        '<p class="small">Bulk ' +
        Math.round(bulk * 10) / 10 +
        ' · encumbered above ' +
        enc +
        ' · maximum ' +
        max +
        (bulk > enc ? ' · <b class="bad">encumbered</b>' : '') +
        ' · invested ' +
        d.invested +
        ' of ' +
        d.investMax +
        '</p>' +
        '<div class="toolbar">' +
        btn('pfPick', '+ Add equipment', { k: 'item' }, 'btn primary') +
        btn('pfCustomItem', '+ Custom item', {}, 'btn') +
        '</div></div>';
      h += (ch.gear || [])
        .map(function (g, i) {
          var e = PF2.byId('items', g.id),
            name = g.name || (e ? e.n : 'Item'),
            k = 'g:' + (g.uid || i),
            open = U.open === k,
            inv = e && (e.t || []).indexOf('invested') >= 0,
            R = g.runes || {};
          var runeName =
            (R.pot ? '+' + R.pot + ' ' : '') +
            (R.str
              ? { striking: 'Striking ', greaterStriking: 'Greater Striking ', majorStriking: 'Major Striking ' }[R.str]
              : '') +
            (R.res
              ? { resilient: 'Resilient ', greaterResilient: 'Greater Resilient ', majorResilient: 'Major Resilient ' }[
                  R.res
                ]
              : '') +
            ((R.prop || []).length ? R.prop.join(' ') + ' ' : '');
          var toggle =
            e && (e.k === 'weapon' || e.k === 'armor' || inv || /^worn|held/.test(e.use || ''))
              ? '<label class="check-line small"><input type="checkbox" data-pfworn="' +
                i +
                '"' +
                (g.worn ? ' checked' : '') +
                '> ' +
                (inv ? 'Invested' : e.k === 'weapon' ? 'Ready' : 'Worn') +
                '</label>'
              : '';
          var body = '';
          if (open) {
            body =
              '<div class="pf-desc">' +
              (e ? traits(e.t, e) + K.itemLine(e) + md(e.d) : '') +
              '<label class="field"><span>Name on the sheet</span><input type="text" id="pf-gn-' +
              i +
              '" data-pfgname="' +
              i +
              '" value="' +
              esc(g.name || '') +
              '" placeholder="' +
              esc(e ? e.n : '') +
              '"></label>';
            if (e) body += runeEditor(ch, g, i, e);
            body += '<div class="toolbar">' + btn('pfGearRm', 'Remove', { v: i }, 'btn small danger') + '</div></div>';
          }
          return (
            '<div class="pf-item' +
            rar(e) +
            '"><button type="button" class="pf-pname" data-act="pfOpenRow" data-v="' +
            esc(k) +
            '"><b>' +
            esc(runeName + name) +
            '</b><span class="spacer"></span><small class="muted">' +
            (e ? e.bulk || '—' : '') +
            '</small></button>' +
            '<span class="mm-step">' +
            btn('pfQty', '−', { v: i, d: -1 }, 'mm-b') +
            '<b>' +
            (g.q || 1) +
            '</b>' +
            btn('pfQty', '+', { v: i, d: 1 }, 'mm-b') +
            '</span>' +
            toggle +
            body +
            '</div>'
          );
        })
        .join('');
      if (U.customItem)
        h +=
          '<div class="panel"><label class="field"><span>Custom item</span><input type="text" id="pf-custom" placeholder="Name"></label>' +
          btn('pfCustomAdd', 'Add', {}, 'btn primary') +
          '</div>';
      return h;
    }
    // ----- Feats & features -----
    function featsTab(ch, d) {
      var groups = { anc: [], cls: [], feat: [], other: [] };
      d.items.forEach(function (it) {
        var e = it.e;
        if (/^(ancestry|background|class)$/.test(it.key)) return;
        var g =
          it.key === 'heritage' || /^af:/.test(it.key)
            ? 'anc'
            : /^cf:/.test(it.key) || e._k === 'classfeatures'
              ? 'cls'
              : e._k === 'feats'
                ? 'feat'
                : 'other';
        groups[g].push(it);
      });
      var row = function (it) {
        var k = 'i:' + it.key,
          open = U.open === k;
        return (
          '<div class="pf-spell' +
          rar(it.e) +
          '"><button type="button" class="pf-pname" data-act="pfOpenRow" data-v="' +
          esc(k) +
          '"><b>' +
          esc(it.e.n) +
          '</b> ' +
          gl(it.e.a) +
          '<span class="spacer"></span><small class="muted">' +
          esc(it.from || '') +
          '</small></button>' +
          (open ? '<div class="pf-desc">' + traits(it.e.t, it.e) + md(it.e.d) + '</div>' : '') +
          '</div>'
        );
      };
      return [
        ['anc', 'Ancestry and heritage'],
        ['cls', 'Class features'],
        ['feat', 'Feats'],
        ['other', 'Other']
      ]
        .map(function (g) {
          return groups[g[0]].length
            ? '<section class="panel"><h3 style="margin-top:0">' +
                g[1] +
                '</h3>' +
                groups[g[0]].map(row).join('') +
                '</section>'
            : '';
        })
        .join('');
    }
    // ----- Actions -----
    function actionsTab(ch, d) {
      var X = PF2.index(),
        f = U.actF || 'mine',
        q = (U.actQ || '').toLowerCase();
      var mine = d.items.reduce(function (out, it) {
        if (it.e.a) out.push(it.e);
        return out;
      }, []);
      var all =
        f === 'mine'
          ? mine
          : X.core.actions.filter(function (a) {
              return f === 'all' || (a.t || []).indexOf(f) >= 0 || a.cat === f;
            });
      all = all.filter(function (a) {
        return !q || a.n.toLowerCase().indexOf(q) >= 0;
      });
      var pill = function (v, l) {
        return btn('pfActF', l, { v: v }, 'pill small' + (f === v ? ' on' : ''));
      };
      return (
        '<div class="pills">' +
          pill('mine', 'Mine') +
          pill('basic', 'Basic') +
          pill('skill', 'Skill') +
          pill('exploration', 'Exploration') +
          pill('downtime', 'Downtime') +
          pill('all', 'All') +
          '</div>' +
          '<input type="search" id="pf-actq" data-pfactq="1" placeholder="Search actions…" value="' +
          esc(U.actQ || '') +
          '">' +
          all
            .slice(0, 200)
            .map(function (a) {
              var k = 'a:' + a.id,
                open = U.open === k;
              return (
                '<div class="pf-spell"><button type="button" class="pf-pname" data-act="pfOpenRow" data-v="' +
                esc(k) +
                '"><b>' +
                esc(a.n) +
                '</b> ' +
                gl(a.a) +
                '</button>' +
                (open ? '<div class="pf-desc">' + traits(a.t, a) + md(a.d) + '</div>' : '') +
                '</div>'
              );
            })
            .join('') || '<p class="muted">Nothing here.</p>'
      );
    }
    // ----- Notes -----
    function notesTab(ch, d) {
      var langs = ch.langs || [],
        sug = d.anc ? (d.anc.langs || []).concat(d.anc.addLangs || []) : [];
      return (
        '<div class="panel pf-picpanel"><h3 style="margin-top:0">Picture</h3>' +
        (ch.picture
          ? '<div class="pf-picbig">' + picHtml(ch) + '</div>'
          : '<p class="small muted">A portrait or any image of your character, from your photos or files. It stays on this device.</p>') +
        '<div class="toolbar"><label class="btn primary">' +
        (ch.picture ? 'Change picture' : 'Add a picture') +
        '<input type="file" accept="image/*" data-pfpic="1" hidden></label>' +
        (ch.picture
          ? btn('pfPicFit', ch.picFit === 'contain' ? 'Fill the frame' : 'Show the whole picture', {}, 'btn') +
            btn('pfPicRm', 'Remove', {}, 'btn')
          : '') +
        '</div>' +
        (U.picErr ? '<p class="small bad">' + esc(U.picErr) + '</p>' : '') +
        '</div>' +
        '<div class="panel"><div class="row"><label class="field"><span>Alignment</span><select data-pff="alignment"><option value="">—</option>' +
        ALIGN.map(function (a) {
          return '<option' + (ch.alignment === a ? ' selected' : '') + '>' + a + '</option>';
        }).join('') +
        '</select></label>' +
        '<label class="field"><span>Deity</span><input type="text" id="pf-deity" data-pff="deity" value="' +
        esc(ch.deity || '') +
        '" list="pf-deities"></label><datalist id="pf-deities">' +
        PF2.index()
          .core.deities.map(function (x) {
            return '<option value="' + esc(x.n) + '">';
          })
          .join('') +
        '</datalist></div>' +
        '<div class="row"><label class="field"><span>Age</span><input type="text" id="pf-age" data-pff="age" value="' +
        esc(ch.age || '') +
        '"></label><label class="field"><span>Gender / pronouns</span><input type="text" id="pf-gender" data-pff="gender" value="' +
        esc(ch.gender || '') +
        '"></label><label class="field"><span>XP</span><input type="number" id="pf-xp" data-pff="xp" value="' +
        (ch.xp || 0) +
        '"></label></div>' +
        '<div class="field"><span>Languages</span><div class="pills">' +
        langs
          .map(function (l, i) {
            return '<span class="pill small on">' + esc(l) + ' ' + btn('pfLangRm', '✕', { v: i }, 'mm-b') + '</span>';
          })
          .join('') +
        '</div><div class="row"><input type="text" id="pf-lang" list="pf-langs" placeholder="Add a language"><datalist id="pf-langs">' +
        sug
          .map(function (l) {
            return '<option value="' + esc(l[0].toUpperCase() + l.slice(1)) + '">';
          })
          .join('') +
        '</datalist>' +
        btn('pfLangAdd', '+', {}, 'btn small') +
        '</div></div>' +
        (root.NoteStyle
          ? '<div class="field"><span>Note style: the colour and font of your notes, and of what you share at the table</span>' +
            root.NoteStyle.picker(
              ch.noteStyle,
              'pfNoteStyle',
              esc(ch.name || 'Your character') + ' writes like this.'
            ) +
            '</div>'
          : '') +
        '<label class="field"><span>Notes</span><textarea id="pf-notes" data-pff="notes" rows="8" style="' +
        (root.NoteStyle ? root.NoteStyle.css(ch.noteStyle) : '') +
        '">' +
        esc(ch.notes || '') +
        '</textarea></label>' +
        '<div class="toolbar"><input type="search" id="pf-nq" data-pfnq="1" placeholder="Find a word in the notes…" value="' +
        esc(U.noteQ || '') +
        '">' +
        (U.noteQ
          ? (function () {
              var r = root.findSnippets ? root.findSnippets(ch.notes, U.noteQ, 8) : { n: 0, html: '' };
              return (
                '<span class="small muted">' + r.n + ' found</span></div><div class="snip-group">' + r.html + '</div>'
              );
            })()
          : '</div>') +
        (d.deity ? '' : '') +
        '</div>' +
        (ch.deity && PF2.byName('deities', ch.deity)
          ? '<details class="panel"><summary>' +
            esc(ch.deity) +
            '</summary>' +
            md(PF2.byName('deities', ch.deity).d) +
            '</details>'
          : '')
      );
    }
    K.actionsTab = actionsTab;
    K.condBox = condBox;
    K.defenseTab = defenseTab;
    K.featsTab = featsTab;
    K.gearTab = gearTab;
    K.notesTab = notesTab;
    K.offenseTab = offenseTab;
  };
})(typeof window !== 'undefined' ? window : globalThis);
