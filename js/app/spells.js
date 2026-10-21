// Spells: the Spells step and My spells (everything the character can cast).
// Part of the app: these files share one scope (see “How the code is organized” in README.md), loaded in order by index.html.
'use strict';

function stepSpells() {
  var h = '<h2>Spells</h2>' + partImportHtml('spells');
  if (!d.casters.length)
    return (
      h +
      '<p class="notice">' +
      (d.cls ? 'This character has no class spellcasting yet.' : 'Pick a class first.') +
      (d.innate.length
        ? ' Spells from your lineage or feats are on ' + btn('step', 'My spells', { v: 'myspells' }, 'linkbtn') + '.'
        : '') +
      '</p>' +
      extraSpellsHtml()
    );

  if (
    !d.casters.some(function (s) {
      return s.clsId === ui.casterTab;
    })
  )
    ui.casterTab = d.casters[0].clsId;
  h += slotsHtml();
  if (d.casterLevel)
    h +=
      '<p class="small muted">Spell slots are shared: your classes add up to caster level ' +
      d.casterLevel +
      '. Each class still learns and prepares spells as if it were your only class.</p>';
  if (d.casters.length > 1)
    h +=
      '<div class="pills" style="margin:.75rem 0">' +
      d.casters
        .map(function (s) {
          return btn(
            'casterTab',
            esc(s.name) + (s.missing > 0 ? ' <span class="badge">' + s.missing + '</span>' : ''),
            { v: s.clsId },
            'pill' + (ui.casterTab === s.clsId ? ' on' : '')
          );
        })
        .join('') +
      '</div>';
  var S = d.casters.filter(function (s) {
    return s.clsId === ui.casterTab;
  })[0];
  var noun = S.mode === 'known' ? 'Spells known' : S.mode === 'prepared' ? 'Prepared spells' : 'Spellbook';
  var of = function (n, max, rule) {
    return (
      n + (S.unlimited ? (rule != null ? ' <small class="muted">(rules: ' + rule + ')</small>' : '') : ' / ' + max)
    );
  };
  h +=
    '<label class="check-line limit-toggle"><input type="checkbox" data-free="spells"' +
    (ch.free && ch.free.spells ? ' checked' : '') +
    '> No spell maximum: add as many spells from the ' +
    esc(S.name) +
    ' list as you like (for extra spells from feats, items, boons or house rules)</label>';
  h +=
    '<div class="facts"><span><b>' +
    esc(S.name) +
    '</b></span><span><b>Ability</b> ' +
    D.abilityNames[S.ability] +
    '</span><span><b>Save DC</b> ' +
    S.dc +
    '</span><span><b>Spell attack</b> ' +
    R.fmt(S.atk) +
    '</span>' +
    (S.cantripsMax
      ? '<span><b>Cantrips</b> ' + of(S.cantrips.length, S.cantripsMax, S.limits && S.limits.cantrips) + '</span>'
      : '') +
    '<span><b>' +
    noun +
    '</b> ' +
    of(S.known.length, S.knownMax, S.limits && S.limits.known) +
    '</span>' +
    (S.mode === 'spellbook'
      ? '<span><b>Prepared</b> ' + of(S.prepared.length, S.preparedMax, S.limits && S.limits.prepared) + '</span>'
      : '') +
    '<span><b>Highest spell level</b> ' +
    S.maxLevel +
    '</span></div>';
  if (S.unlimited)
    h +=
      '<p class="small muted">No spell maximum for this character: the usual numbers are shown in brackets, but you can add more.</p>';
  if (S.note) h += '<p class="small muted">' + esc(S.note) + '</p>';
  if (S.always.length) h += '<p><b>Always prepared:</b> ' + S.always.map(spellLink).join(', ') + '</p>';
  var innR = d.innate.filter(function (x) {
    return x.ready;
  });
  if (innR.length)
    h +=
      '<p class="small"><b>Also yours, from your lineage, feats or added by you:</b> ' +
      innR
        .map(function (x) {
          return spellLink(x.name);
        })
        .join(', ') +
      '. These don’t count toward your class numbers; see them all on ' +
      btn('step', 'My spells', { v: 'myspells' }, 'linkbtn') +
      '.</p>';
  var levels = [];
  for (var i = S.cantripsMax ? 0 : 1; i <= S.maxLevel; i++) levels.push(i);
  if (levels.indexOf(ui.spellLevel) < 0) ui.spellLevel = levels[0];
  var q = ui.q.spells || '';
  h +=
    '<div class="toolbar"><div class="pills">' +
    levels
      .map(function (l) {
        var n = (l ? S.known : S.cantrips).filter(function (x) {
          return D.spells[x].level === l;
        }).length;
        return btn(
          'spellLevel',
          (l ? 'Level ' + l : 'Cantrips') + (n ? ' (' + n + ')' : ''),
          { v: l },
          'pill' + (ui.spellLevel === l ? ' on' : '')
        );
      })
      .join('') +
    '</div>' +
    search('spells', 'Filter by name or school…') +
    '</div>';
  var rows = S.list.filter(function (s) {
    return (q ? true : s.level === ui.spellLevel) && match(q, s.name + ' ' + s.school);
  });
  var book = S.mode === 'spellbook';
  h +=
    '<div class="optlist" style="max-height:none">' +
    rows
      .map(function (s) {
        var bucket = s.level ? 'k' : 'c',
          on = (s.level ? S.known : S.cantrips).indexOf(s.name) >= 0,
          auto = S.always.indexOf(s.name) >= 0,
          prep = S.prepared.indexOf(s.name) >= 0;
        var open = ui.spellOpen && ui.spellOpen[s.name],
          text = open ? R.spellText(s.name) : '';
        return (
          '<div class="spell' +
          (on || auto ? ' on' : '') +
          '">' +
          (auto
            ? '<span class="small muted" style="width:1.5rem">auto</span>'
            : '<button type="button" class="check' +
              (on ? ' on' : '') +
              '" aria-label="' +
              (on ? 'Remove ' : 'Add ') +
              esc(s.name) +
              '" data-act="spell" data-c="' +
              S.clsId +
              '" data-b="' +
              bucket +
              '" data-v="' +
              esc(s.name) +
              '">' +
              (on ? '✓' : '') +
              '</button>') +
          (book
            ? on && s.level
              ? '<button type="button" class="check' +
                (prep ? ' on' : '') +
                '" title="Prepared" aria-label="Prepare ' +
                esc(s.name) +
                '" data-act="spell" data-c="' +
                S.clsId +
                '" data-b="p" data-v="' +
                esc(s.name) +
                '">' +
                (prep ? '★' : '☆') +
                '</button>'
              : '<span style="width:1.5rem"></span>'
            : '') +
          '<div><b class="spell-name">' +
          foldBtn(s.name, open) +
          spellLink(s.name) +
          '</b>' +
          (s.conc ? ' <span class="tag">conc</span>' : '') +
          tag(s.tag) +
          ' <span class="small muted">' +
          esc(spellMeta(s)) +
          ' · ' +
          esc(s.comp) +
          '</span>' +
          (text ? '<div class="small">' + esc(text) + '</div>' : '') +
          '</div></div>'
        );
      })
      .join('') +
    '</div>' +
    (rows.length ? '' : '<p class="muted">No spells match.</p>');
  return (
    h +
    '<p class="small muted">' +
    (book ? '✓ in your spellbook · ★ prepared. ' : '') +
    'Spell names link to the full text on the wiki.</p>' +
    extraSpellsHtml()
  );
}
// Everything the character can cast in one place: class spells (prepared, known or in the spellbook),
// always-prepared subclass spells, lineage and feat spells, and spells the player added from elsewhere.
function mySpellRows() {
  var rows = {},
    order = [];
  function add(name, src) {
    var s = D.findSpell(name),
      key = s ? s.name : name;
    if (!rows[key]) {
      rows[key] = { name: key, s: s, srcs: [], ready: false, book: null, prepared: false };
      order.push(key);
    }
    var r = rows[key];
    r.srcs.push(src);
    if (src.ready) r.ready = true;
    return r;
  }
  d.casters.forEach(function (S) {
    S.cantrips.forEach(function (n) {
      add(n, { label: S.name, how: 'cantrip', ready: true, cls: S.clsId });
    });
    S.always.forEach(function (n) {
      add(n, { label: S.name, how: 'always prepared', ready: true, cls: S.clsId });
    });
    S.known.forEach(function (n) {
      if (S.mode !== 'spellbook')
        return add(n, { label: S.name, how: S.mode === 'prepared' ? 'prepared' : 'known', ready: true, cls: S.clsId });
      var prep = S.prepared.indexOf(n) >= 0,
        r = add(n, { label: S.name, how: prep ? 'prepared' : 'in spellbook', ready: prep, cls: S.clsId });
      r.book = S;
      r.prepared = r.prepared || prep;
    });
  });
  d.innate.forEach(function (x) {
    var label = x.kind === 'extra' ? x.src || 'Added by you' : x.kind === 'feat' ? 'Feat: ' + x.src : x.src;
    var how = x.ready ? x.per || (x.spell && x.spell.level ? '' : 'cantrip') : 'from level ' + x.minLevel;
    var r = add(x.name, {
      label: label,
      how: how,
      ready: x.ready,
      kind: x.kind,
      dc: x.dc,
      atk: x.atk,
      ab: x.ab,
      slots: x.slots,
      extra: x.kind === 'extra' ? x.index : null
    });
    if (x.kind !== 'extra') r.trait = x.trait;
  });
  return order.map(function (k) {
    return rows[k];
  });
}
function stepMySpells() {
  var h =
    '<h2>My spells</h2><p class="muted">Every spell this character can cast, gathered from the Spells step, the lineage, feats and Other spells. Pick, change or add spells on the Spells step (✎ Edit character).</p>';
  if (
    d.trackers.some(function (x) {
      return x.group === 'slots' || x.group === 'spells';
    })
  )
    h +=
      restBarHtml() +
      '<p class="small muted">Tap a box beside a spell level to use a slot, tap an empty one to get it back. The Session page tracks hit points and class abilities too.</p>';
  var all = mySpellRows(),
    view = ui.mySpellsView || 'ready';
  var hidden = all.filter(function (r) {
    return !r.ready;
  }).length;
  if (d.casters.length)
    h += d.casters
      .map(function (S) {
        return (
          '<div class="facts"><span><b>' +
          esc(S.name) +
          '</b></span><span><b>Save DC</b> ' +
          S.dc +
          '</span><span><b>Spell attack</b> ' +
          R.fmt(S.atk) +
          '</span>' +
          (S.mode === 'spellbook'
            ? '<span><b>Prepared</b> ' + S.prepared.length + (S.unlimited ? '' : ' / ' + S.preparedMax) + ' (★)</span>'
            : '') +
          '</div>'
        );
      })
      .join('');
  var innAb = {};
  d.innate.forEach(function (x) {
    if (x.ab && x.kind !== 'extra') innAb[x.ab] = x;
  });
  var abKeys = Object.keys(innAb);
  if (abKeys.length)
    h +=
      '<div class="facts">' +
      abKeys
        .map(function (a) {
          var x = innAb[a];
          return (
            '<span><b>' +
            (d.innate.some(function (y) {
              return y.kind === 'lineage' && y.ab === a;
            })
              ? 'Lineage'
              : 'Feat') +
            ' spells (' +
            a +
            ')</b> DC ' +
            x.dc +
            ' · attack ' +
            R.fmt(x.atk) +
            '</span>'
          );
        })
        .join('') +
      '</div>';
  if (
    d.innate.some(function (x) {
      return x.kind === 'lineage' && !x.ab;
    }) &&
    d.choices.some(function (c) {
      return c.key === 'lin.spellab';
    })
  )
    h +=
      '<p class="small" style="color:var(--warn)">Choose the spellcasting ability for your lineage spells on the Lineage step to see their save DC.</p>';
  h +=
    '<div class="toolbar"><div class="pills">' +
    btn('mySpellsView', 'Ready to cast', { v: 'ready' }, 'pill' + (view === 'ready' ? ' on' : '')) +
    btn(
      'mySpellsView',
      'Everything' + (hidden ? ' (+' + hidden + ')' : ''),
      { v: 'all' },
      'pill' + (view === 'all' ? ' on' : '')
    ) +
    '</div>' +
    search('myspells', 'Filter by name or school…') +
    '</div>';
  if (hidden && view === 'ready')
    h +=
      '<p class="small muted">' +
      hidden +
      ' more in “Everything”: spellbook spells you haven’t prepared and lineage spells you get at a higher level.</p>';
  // with spells from several places (two classes, or a class plus a lineage or feat), show where each comes from
  var froms = d.casters.map(function (S) {
    return [S.clsId, S.name];
  });
  if (
    all.some(function (r) {
      return r.srcs.some(function (x) {
        return !x.cls;
      });
    })
  )
    froms.push(['other', 'Lineage, feats and added']);
  var from =
    froms.length > 1 &&
    froms.some(function (f) {
      return f[0] === ui.mySpellsFrom;
    })
      ? ui.mySpellsFrom
      : '';
  if (froms.length > 1)
    h +=
      '<div class="pills">' +
      btn('mySpellsFrom', 'All sources', { v: '' }, 'pill small' + (!from ? ' on' : '')) +
      froms
        .map(function (f) {
          return btn('mySpellsFrom', esc(f[1]), { v: f[0] }, 'pill small' + (from === f[0] ? ' on' : ''));
        })
        .join('') +
      '</div>';
  var fromOk = function (r) {
    return (
      !from ||
      r.srcs.some(function (x) {
        return from === 'other' ? !x.cls : x.cls === from;
      })
    );
  };
  // quick filters: concentration, action, bonus action, reaction, ritual (tap again to show all)
  var KINDS = [
    [
      'conc',
      'Concentration',
      function (x) {
        return x.conc;
      }
    ],
    [
      'action',
      'Action',
      function (x) {
        return /^1 action/i.test(x.time || '');
      }
    ],
    [
      'bonus',
      'Bonus action',
      function (x) {
        return /bonus action/i.test(x.time || '');
      }
    ],
    [
      'reaction',
      'Reaction',
      function (x) {
        return /reaction/i.test(x.time || '');
      }
    ],
    [
      'ritual',
      'Ritual',
      function (x) {
        return x.ritual;
      }
    ],
    [
      'noconc',
      'No concentration',
      function (x) {
        return !x.conc;
      }
    ]
  ];
  var kind = KINDS.filter(function (k) {
    return k[0] === ui.mySpellsKind;
  })[0];
  var base = all.filter(function (r) {
    return (view === 'all' || r.ready) && fromOk(r);
  });
  h +=
    '<div class="pills spell-kinds" role="group" aria-label="Show only">' +
    KINDS.map(function (k) {
      var n = base.filter(function (r) {
        return r.s && k[2](r.s);
      }).length;
      return btn(
        'mySpellsKind',
        k[1] + ' <small>' + n + '</small>',
        { v: k[0] },
        'pill small' + (kind === k ? ' on' : '') + (n ? '' : ' off')
      );
    }).join('') +
    '</div>';
  var q = ui.q.myspells || '';
  var rows = base.filter(function (r) {
    return match(q, r.name + ' ' + (r.s ? r.s.school : '')) && (!kind || (r.s && kind[2](r.s)));
  });
  if (!all.length)
    h +=
      '<p class="notice">No spells yet. Pick a spellcasting class and choose spells on the Spells step, take a lineage or feat that grants spells, or add one under Other spells on the Spells step.</p>';
  else if (!rows.length) h += '<p class="muted">No spells match.</p>';
  for (var l = 0; l <= 9; l++) {
    var at = rows
      .filter(function (r) {
        return (r.s ? r.s.level : 0) === l;
      })
      .sort(function (a, b) {
        return a.name < b.name ? -1 : 1;
      });
    if (!at.length) continue;
    var st = trk('slot' + l),
      pt = d.pact && d.pact.level === l ? trk('pact') : null;
    h +=
      '<h3 class="lvl-head">' +
      (l ? 'Level ' + l : 'Cantrips') +
      (st
        ? ' <span class="slot-track">' +
          pipsHtml(st) +
          ' <span class="small muted">' +
          st.left +
          '/' +
          st.max +
          ' slots</span></span>'
        : '') +
      (pt
        ? ' <span class="slot-track">' +
          pipsHtml(pt) +
          ' <span class="small muted">' +
          pt.left +
          '/' +
          pt.max +
          ' pact</span></span>'
        : '') +
      '</h3>';
    h += '<div class="optlist my-spells" style="max-height:none">' + at.map(mySpellRowHtml).join('') + '</div>';
  }
  h +=
    '<p class="small muted">' +
    (all.some(function (r) {
      return r.book;
    })
      ? '★ prepared · ☆ in your spellbook, not prepared (tap to prepare). '
      : '') +
    'Spell names link to the full text on the wiki.</p>';
  return h;
}
function mySpellRowHtml(r) {
  var s = r.s,
    open = ui.spellOpen && ui.spellOpen[r.name],
    text = open && s ? R.spellText(s.name) : '';
  var star =
    r.book && s && s.level
      ? '<button type="button" class="check' +
        (r.prepared ? ' on' : '') +
        '" title="' +
        (r.prepared ? 'Prepared — tap to unprepare' : 'Not prepared — tap to prepare') +
        '" aria-label="' +
        (r.prepared ? 'Unprepare ' : 'Prepare ') +
        esc(r.name) +
        '" data-act="spell" data-c="' +
        r.book.clsId +
        '" data-b="p" data-v="' +
        esc(r.name) +
        '">' +
        (r.prepared ? '★' : '☆') +
        '</button>'
      : '<span class="check-gap"></span>';
  var chips = r.srcs
    .map(function (x) {
      var cs =
        x.cls && d.casters.length > 1
          ? d.casters.filter(function (S) {
              return S.clsId === x.cls;
            })[0]
          : null; // multiclassed: each class has its own DC
      var bits = [
        x.how,
        x.dc != null && (x.kind === 'lineage' || x.kind === 'feat')
          ? 'DC ' + x.dc + ' · ' + R.fmt(x.atk)
          : cs
            ? 'DC ' + cs.dc + ' · ' + R.fmt(cs.atk)
            : '',
        x.slots ? 'or with slots' : ''
      ]
        .filter(Boolean)
        .join(', ');
      var tk = x.ready && (x.kind === 'lineage' || x.kind === 'feat') ? trk('inn:' + r.name) : null;
      return (
        '<span class="src-chip' +
        (x.ready ? '' : ' later') +
        '">' +
        esc(x.label) +
        (bits ? ' · ' + esc(bits) : '') +
        '</span>' +
        (tk ? pipsHtml(tk) : '')
      );
    })
    .join(' ');
  var meta = s
    ? [s.school, s.time, s.range, s.duration + (s.conc ? ' (concentration)' : ''), s.comp].filter(Boolean).join(' · ')
    : '';
  return (
    '<div class="spell' +
    (r.ready ? ' on' : ' not-ready') +
    '">' +
    star +
    '<div><b class="spell-name">' +
    foldBtn(r.name, open) +
    spellLink(r.name) +
    '</b>' +
    (s && s.conc ? ' <span class="tag">conc</span>' : '') +
    (s && s.ritual ? ' <span class="tag">ritual</span>' : '') +
    (s ? tag(s.tag) : '') +
    ' <span class="small muted">' +
    esc(meta) +
    '</span><div class="src-chips">' +
    chips +
    (r.trait ? ' <span class="small muted">(' + esc(r.trait) + ')</span>' : '') +
    '</div>' +
    (text ? '<div class="small">' + esc(text) + '</div>' : '') +
    '</div></div>'
  );
}
// Spells from feats, magic items, boons or house rules that the builder can't work out by itself
function extraSpellsHtml() {
  var X = ch.extraSpells || [];
  var h =
    '<div class="panel extra-spells"><h3>Other spells</h3><p class="small muted">For spells from a feat choice (Magic Initiate, Fey Touched…), a magic item, a boon or your DM. Lineage spells and fixed feat spells are added for you.</p>';
  if (X.length)
    h +=
      '<div class="optlist" style="max-height:none">' +
      X.map(function (x) {
        var s = D.findSpell(x.n);
        return (
          '<div class="spell on"><div style="flex:1"><b>' +
          spellLink(x.n) +
          '</b> <span class="small muted">' +
          (s ? (s.level ? 'Level ' + s.level : 'Cantrip') + ' · ' + esc(s.school) : '') +
          '</span>' +
          '<div class="row extra-spell-fields"><label>Where from <input id="es-' +
          x.id +
          '-src" data-espell="' +
          x.id +
          '" data-f="src" value="' +
          esc(x.src || '') +
          '" placeholder="e.g. Magic Initiate, Ring of Spell Storing"></label>' +
          '<label>How often <input id="es-' +
          x.id +
          '-per" data-espell="' +
          x.id +
          '" data-f="per" value="' +
          esc(x.per || '') +
          '" placeholder="e.g. 1/long rest, at will"></label></div></div>' +
          btn('rmExtraSpell', '✕', { v: x.id }, 'btn small') +
          '</div>'
        );
      }).join('') +
      '</div>';
  var q = ui.q.extraspell || '';
  h += '<div class="toolbar" style="margin-top:.6rem">' + search('extraspell', 'Find any spell to add…') + '</div>';
  if (q.trim().length >= 2) {
    var have = {};
    X.forEach(function (x) {
      have[x.n] = 1;
    });
    var found = Object.keys(D.spells)
      .map(function (k) {
        return D.spells[k];
      })
      .filter(function (s) {
        return ok(s.tag) && match(q, s.name);
      })
      .sort(function (a, b) {
        return a.level - b.level || (a.name < b.name ? -1 : 1);
      })
      .slice(0, 25);
    h += found.length
      ? '<div class="optlist">' +
        found
          .map(function (s) {
            return (
              '<div class="spell"><div style="flex:1"><b>' +
              esc(s.name) +
              '</b> <span class="small muted">' +
              (s.level ? 'Level ' + s.level : 'Cantrip') +
              ' · ' +
              esc(s.school) +
              '</span></div>' +
              (have[s.name]
                ? '<span class="small muted">added</span>'
                : btn('addExtraSpell', '+ Add', { v: s.name }, 'btn small')) +
              '</div>'
            );
          })
          .join('') +
        '</div>'
      : '<p class="muted small">No spell by that name.</p>';
  }
  return h + '</div>';
}
