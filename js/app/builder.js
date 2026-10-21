// The building steps: lineage, class, abilities, background, and importing one part of a character.
// Part of the app: these files share one scope (see “How the code is organized” in README.md), loaded in order by index.html.
'use strict';

// ---------- steps ----------
function stepLineage() {
  var q = ui.q.lineage || '';
  var groups = [];
  D.lineages.forEach(function (l) {
    if (groups.indexOf(l.group) < 0) groups.push(l.group);
  });
  var list = D.lineages.filter(function (l) {
    return (
      (ok(l.tag) ||
        l.versions.some(function (v) {
          return v.tag && ok(v.tag);
        })) &&
      match(q, l.name) &&
      (!ui.group || l.group === ui.group)
    );
  });
  var h =
    '<h2>Lineage</h2>' +
    partImportHtml('lineage') +
    '<p class="muted">Your character\'s people: size, speed, ability bonuses and inborn traits.</p>' +
    '<div class="toolbar">' +
    search('lineage', 'Search lineages…') +
    '<select data-ui="group"><option value="">All groups</option>' +
    groups
      .map(function (g) {
        return '<option' + (ui.group === g ? ' selected' : '') + '>' + esc(g) + '</option>';
      })
      .join('') +
    '</select><span class="muted small">' +
    list.length +
    ' shown</span></div>' +
    '<div class="grid scroll">' +
    list
      .map(function (l) {
        var v0 = l.versions[0],
          a =
            v0.a === 'flex'
              ? 'any +2/+1'
              : Object.keys(v0.a || {})
                  .map(function (k) {
                    return k + ' +' + v0.a[k];
                  })
                  .join(', ');
        var pr = (v0.sk || []).concat(
          (v0.prof && v0.prof.armor) || [],
          (v0.prof && v0.prof.weapons) || [],
          (v0.prof && v0.prof.tools) || []
        );
        return (
          '<button type="button" class="card' +
          (ch.lineage === l.id ? ' on' : '') +
          '" data-act="lineage" data-v="' +
          esc(l.id) +
          '"><b>' +
          esc(l.name) +
          '</b>' +
          '<small>' +
          esc(
            [a, (v0.sp || 30) + ' ft', v0.dv ? 'darkvision' : '', v0.subs ? v0.subs.length + ' subraces' : '']
              .filter(Boolean)
              .join(' · ')
          ) +
          '</small>' +
          (pr.length ? '<small class="card-prof">Proficient: ' + esc(pr.join(', ')) + '</small>' : '') +
          '<small>' +
          esc(l.group) +
          tag(l.tag) +
          '</small></button>'
        );
      })
      .join('') +
    '</div>';
  if (!d.lin) return h + '<p class="notice">Pick a lineage to see its traits.</p>';
  var lin = d.lin,
    v = lin.versions[ch.version] || lin.versions[0],
    L = d.L;
  h += '<div class="panel"><h3>' + esc(lin.name) + '</h3>';
  var vers = lin.versions
    .map(function (x, i) {
      return [x, i];
    })
    .filter(function (x) {
      return ok(x[0].tag || lin.tag) || x[1] === ch.version;
    });
  if (vers.length > 1)
    h +=
      '<div class="field"><span>Version</span><div class="pills">' +
      vers
        .map(function (x) {
          return btn(
            'version',
            esc(x[0].n) + ' <small class="muted">' + esc(x[0].s) + '</small>',
            { v: x[1] },
            'pill' + (x[1] === ch.version ? ' on' : '')
          );
        })
        .join('') +
      '</div></div>';
  if (v.subs)
    h +=
      '<div class="field"><span>Subrace or variant</span><div class="pills">' +
      v.subs
        .map(function (s, i) {
          return ok(s.tag || 'official') || i === ch.sub
            ? btn('sub', esc(s.n) + tag(s.tag), { v: i }, 'pill' + (i === ch.sub ? ' on' : ''))
            : '';
        })
        .join('') +
      '</div></div>';
  var asi =
    L.a === 'flex'
      ? 'your choice'
      : Object.keys(L.a)
          .map(function (k) {
            return k + ' +' + L.a[k];
          })
          .join(', ') || 'see choices';
  h +=
    '<div class="facts"><span><b>Source</b> ' +
    esc(L.source) +
    '</span><span><b>Ability scores</b> ' +
    asi +
    '</span><span><b>Size</b> ' +
    esc(L.sz || 'Medium') +
    '</span><span><b>Speed</b> ' +
    L.sp +
    ' ft</span>' +
    (L.dv ? '<span><b>Darkvision</b> ' + L.dv + ' ft</span>' : '') +
    (L.lang.length ? '<span><b>Languages</b> ' + esc(L.lang.join(', ')) + '</span>' : '') +
    (L.res.length ? '<span><b>Resistance</b> ' + esc(L.res.join(', ')) + '</span>' : '') +
    '</div>';
  if (L.a === 'flex')
    h +=
      '<div class="field"><span>Ability score increase</span><div class="pills">' +
      btn('flex', '+2 and +1', { v: '21' }, 'pill' + (ch.flexMode !== '111' ? ' on' : '')) +
      btn('flex', '+1, +1 and +1', { v: '111' }, 'pill' + (ch.flexMode === '111' ? ' on' : '')) +
      '</div></div>';
  h += choicesFor('lineage', function (c) {
    return !slotChoice(c);
  });
  h +=
    '<h3>Traits</h3>' +
    (L.tr.length
      ? L.tr
          .map(function (t) {
            return featureHtml({ n: t[0], t: t[1] });
          })
          .join('')
      : '<p class="muted">No special traits.</p>') +
    '</div>';
  h += d.featSlots
    .filter(function (s) {
      return s.step === 'lineage';
    })
    .map(featSlotHtml)
    .join('');
  return h;
}
function stepClass() {
  var E = d.classes,
    total = d.level,
    used = E.map(function (e) {
      return e.id;
    });
  var h =
    '<h2>Class</h2>' +
    partImportHtml('class') +
    '<p class="muted">Your character\'s calling. Take every level in one class, or split up to 20 levels across several.</p>';
  if (E.length <= 1)
    h +=
      '<div class="grid">' +
      D.classes
        .filter(function (c) {
          return ok(c.tag) || used.indexOf(c.id) >= 0;
        })
        .map(function (c) {
          return (
            '<button type="button" class="card' +
            (used[0] === c.id ? ' on' : '') +
            '" data-act="cls" data-v="' +
            c.id +
            '"><b>' +
            esc(c.name) +
            '</b><small>d' +
            c.hitDie +
            ' · ' +
            c.saves.join(' & ') +
            ' saves' +
            tag(c.tag) +
            '</small></button>'
          );
        })
        .join('') +
      '</div>';
  if (!E.length) return h + '<p class="notice">Pick a class to continue.</p>';
  h +=
    '<div class="panel"><h3>Levels</h3><div class="tablewrap"><table><tr><th>Class</th><th>Level</th><th></th></tr>' +
    E.map(function (e, i) {
      var max = 20 - (total - e.level);
      return (
        '<tr><td><b>' +
        esc(e.cls.name) +
        '</b>' +
        (E.length > 1 && e.first ? ' <span class="tag">starting class</span>' : '') +
        (e.sc ? ' <span class="muted small">' + esc(e.sc.name) + '</span>' : '') +
        '</td>' +
        '<td><input type="number" min="1" max="' +
        max +
        '" id="lvl-' +
        e.id +
        '" data-clslevel="' +
        e.id +
        '" value="' +
        e.level +
        '">' +
        (E.length === 1
          ? ' <input type="range" min="1" max="20" data-clslevel="' +
            e.id +
            '" value="' +
            e.level +
            '" aria-label="Level" style="vertical-align:middle;width:min(16rem,40vw)">'
          : '') +
        '</td>' +
        '<td>' +
        (E.length > 1 ? btn('rmClass', 'Remove', { v: e.id }, 'btn tiny') : '') +
        '</td></tr>'
      );
    }).join('') +
    '</table></div><div class="row" style="margin-top:.6rem"><span><b>Character level ' +
    total +
    '</b> · proficiency bonus ' +
    R.fmt(d.pb) +
    '</span>';
  var addable = D.classes.filter(function (c) {
    return used.indexOf(c.id) < 0 && ok(c.tag);
  });
  if (total < 20 && addable.length)
    h +=
      '<select id="addClass" data-addclass="1" aria-label="Add another class"><option value="">Add another class (multiclass)…</option>' +
      addable
        .map(function (c) {
          return '<option value="' + c.id + '">' + esc(c.name) + ' — needs ' + esc(R.multiclassReq(c.id)) + '</option>';
        })
        .join('') +
      '</select>';
  h += '</div>';
  if (E.length > 1)
    h +=
      '<p class="small muted">Multiclass rules applied: proficiency bonus, hit points and spell slots use your combined levels; features, subclass and ability score improvements follow each class\'s own level; only your starting class gives saving throws and starting equipment.</p>';
  h += '</div>';
  if (!entry(ui.clsTab) || used.indexOf(ui.clsTab) < 0) ui.clsTab = used[0];
  if (E.length > 1)
    h +=
      '<div class="pills" style="margin-top:1rem">' +
      E.map(function (e) {
        return btn('clsTab', esc(e.cls.name) + ' ' + e.level, { v: e.id }, 'pill' + (ui.clsTab === e.id ? ' on' : ''));
      }).join('') +
      '</div>';
  var e = E.filter(function (x) {
      return x.id === ui.clsTab;
    })[0],
    c = e.cls;
  h += '<div class="panel"><h3>' + esc(c.name) + ' ' + e.level + '</h3>';
  if (e.first)
    h +=
      '<div class="facts"><span><b>Hit die</b> d' +
      c.hitDie +
      '</span><span><b>Armor</b> ' +
      esc(c.armor.join(', ') || 'None') +
      '</span><span><b>Weapons</b> ' +
      esc(c.weapons.join(', ')) +
      '</span>' +
      '<span><b>Saving throws</b> ' +
      c.saves.join(', ') +
      '</span>' +
      (c.casting ? '<span><b>Spellcasting</b> ' + D.abilityNames[c.casting.ability] + '</span>' : '') +
      '</div>';
  else {
    var mp = R.multiclassProf(c.id),
      gain = (mp.armor || []).concat(mp.weapons || [], mp.tools || [], mp.skills ? ['one skill'] : []);
    h +=
      '<div class="facts"><span><b>Hit die</b> d' +
      c.hitDie +
      '</span><span><b>Requires</b> ' +
      esc(R.multiclassReq(c.id)) +
      '</span><span><b>Multiclass proficiencies</b> ' +
      esc(gain.join(', ') || 'None') +
      '</span>' +
      (c.casting ? '<span><b>Spellcasting</b> ' + D.abilityNames[c.casting.ability] + '</span>' : '') +
      '</div>';
  }
  h += '<h3>' + esc(c.subclassTerm || 'Subclass') + '</h3>';
  if (e.level < c.subclassLevel)
    h +=
      '<p class="notice">' +
      esc(c.name) +
      's choose this at ' +
      c.name.toLowerCase() +
      ' level ' +
      c.subclassLevel +
      '.</p>';
  else {
    var subs = R.subclassesOf(c.id).filter(function (s) {
      return (ok(s.tag) || s.id === e.subclass) && match(ui.q.subclass || '', s.name);
    });
    h +=
      '<div class="toolbar">' +
      search('subclass', 'Search…') +
      '</div><div class="grid scroll">' +
      subs
        .map(function (s) {
          return (
            '<button type="button" class="card' +
            (e.subclass === s.id ? ' on' : '') +
            '" data-act="subclass" data-c="' +
            c.id +
            '" data-v="' +
            esc(s.id) +
            '"><b>' +
            esc(s.name) +
            '</b><small>' +
            esc(s.source) +
            tag(s.tag) +
            '</small></button>'
          );
        })
        .join('') +
      '</div>';
  }
  var cc = choicesFor('class', function (x) {
    return x.clsId === c.id && !slotChoice(x);
  });
  if (cc) h += '<h3>Choices</h3>' + cc;
  if (e.resources.length)
    h +=
      '<h3>At ' +
      c.name.toLowerCase() +
      ' level ' +
      e.level +
      '</h3><div class="facts">' +
      e.resources
        .map(function (r) {
          return '<span><b>' + esc(r[0]) + '</b> ' + esc(r[1]) + '</span>';
        })
        .join('') +
      '</div>';
  h +=
    '<h3>' +
    esc(c.name) +
    ' features</h3>' +
    d.features
      .filter(function (f) {
        return f.kind === 'class' && f.clsId === c.id;
      })
      .map(featureHtml)
      .join('');
  if (e.sc) {
    h += '<h3>' + esc(e.sc.name) + ' features</h3>';
    if (e.sc.expanded)
      h +=
        '<p class="small muted">Expanded spell list: these spells are added to your class list on the Spells step.</p>';
    else if (e.sc.spells)
      h += '<p class="small muted">Always-prepared spells are added automatically as you reach each level.</p>';
    h += d.features
      .filter(function (f) {
        return f.kind === 'subclass' && f.clsId === c.id;
      })
      .map(featureHtml)
      .join('');
  }
  return h + '</div>';
}
// Standard array placed for the class: its main abilities get the highest scores.
var CLASS_ABILITIES = {
  artificer: ['INT', 'CON'],
  barbarian: ['STR', 'CON'],
  bard: ['CHA', 'DEX'],
  'blood-hunter': ['DEX', 'INT'],
  cleric: ['WIS', 'CON'],
  druid: ['WIS', 'CON'],
  fighter: ['STR', 'CON'],
  monk: ['DEX', 'WIS'],
  paladin: ['STR', 'CHA'],
  ranger: ['DEX', 'WIS'],
  rogue: ['DEX', 'CON'],
  sorcerer: ['CHA', 'CON'],
  warlock: ['CHA', 'CON'],
  wizard: ['INT', 'CON']
};
function placeArray() {
  var first = (CLASS_ABILITIES[(ch.classes[0] || {}).cls] || []).concat(['CON', 'DEX', 'WIS', 'INT', 'CHA', 'STR']);
  var order = first.filter(function (a, i) {
    return first.indexOf(a) === i;
  });
  var vals = D.standardArray.slice().sort(function (x, y) {
    return y - x;
  });
  order.forEach(function (a, i) {
    ch.base[a] = vals[i];
  });
}
function stepAbilities() {
  var m = ch.method;
  var h =
    '<h2>Ability scores</h2>' +
    partImportHtml('abilities') +
    '<div class="pills" style="margin:.75rem 0">' +
    [
      ['array', 'Standard array'],
      ['pointbuy', 'Point buy'],
      ['manual', 'Manual / rolled']
    ]
      .map(function (x) {
        return btn('method', x[1], { v: x[0] }, 'pill' + (m === x[0] ? ' on' : ''));
      })
      .join('') +
    '</div>';
  if (m === 'array' && d.cls && CLASS_ABILITIES[d.cls.id])
    h +=
      '<p class="small muted">Placed for a ' +
      esc(d.cls.name) +
      ': the highest scores go to ' +
      CLASS_ABILITIES[d.cls.id]
        .map(function (a) {
          return D.abilityNames[a];
        })
        .join(' and ') +
      '. Change any score to swap it with another. ' +
      btn('method', 'Place again', { v: 'array' }, 'linkbtn') +
      '</p>';
  if (m === 'pointbuy')
    h +=
      '<p class="' +
      (d.pointsSpent === 27 ? 'muted' : 'count') +
      '">Points spent: <b>' +
      (d.pointsSpent > 90 ? '—' : d.pointsSpent) +
      ' / 27</b>. Scores run from 8 to 15 before bonuses.</p>';
  if (m === 'array')
    h +=
      '<p class="muted">Assign 15, 14, 13, 12, 10 and 8. Choosing a value swaps it with the ability that had it.</p>';
  if (m === 'manual')
    h +=
      '<p class="muted">Type your scores, or ' + btn('roll', 'roll 4d6 and drop the lowest', {}, 'btn tiny') + '</p>';
  h +=
    '<div class="tablewrap"><table><tr><th>Ability</th><th>Base</th><th class="num">Bonus</th><th class="num">Total</th><th class="num">Modifier</th></tr>' +
    AB.map(function (a) {
      var x = d.abilities[a],
        input;
      if (m === 'array')
        input =
          '<select data-base="' +
          a +
          '">' +
          D.standardArray
            .map(function (v) {
              return '<option' + (ch.base[a] === v ? ' selected' : '') + '>' + v + '</option>';
            })
            .join('') +
          (D.standardArray.indexOf(ch.base[a]) < 0 ? '<option selected>' + ch.base[a] + '</option>' : '') +
          '</select>';
      else if (m === 'pointbuy')
        input =
          btn('pb', '−', { a: a, v: -1 }, 'btn tiny') +
          ' <b style="display:inline-block;width:1.6rem;text-align:center">' +
          ch.base[a] +
          '</b> ' +
          btn('pb', '+', { a: a, v: 1 }, 'btn tiny');
      else
        input =
          '<input type="number" min="1" max="' +
          (ch.free && ch.free.abilityCap ? 30 : 20) +
          '" id="base-' +
          a +
          '" data-base="' +
          a +
          '" value="' +
          ch.base[a] +
          '">';
      return (
        '<tr><td><b>' +
        D.abilityNames[a] +
        '</b></td><td>' +
        input +
        '</td><td class="num">' +
        (x.bonus ? R.fmt(x.bonus) : '') +
        '</td><td class="num"><b>' +
        x.total +
        '</b></td><td class="num">' +
        R.fmt(x.mod) +
        '</td></tr>'
      );
    }).join('') +
    '</table></div>';
  var slots = d.featSlots.filter(function (s) {
    return s.step === 'abilities';
  });
  h += slots.length
    ? slots.map(featSlotHtml).join('')
    : '<p class="notice">' +
      (d.cls
        ? 'Ability score improvements arrive at ' + d.cls.name.toLowerCase() + ' level ' + d.cls.asiLevels[0] + '.'
        : 'Pick a class to see when ability score improvements arrive.') +
      '</p>';
  h +=
    '<div class="panel"><h3>Hit points</h3><div class="pills">' +
    btn('hp', 'Average (' + d.hpAvg + ')', { v: 'avg' }, 'pill' + (ch.hpMode === 'avg' ? ' on' : '')) +
    btn('hp', 'Maximum (' + d.hpMax + ')', { v: 'max' }, 'pill' + (ch.hpMode === 'max' ? ' on' : '')) +
    btn('hp', 'Rolled', { v: 'manual' }, 'pill' + (ch.hpMode === 'manual' ? ' on' : '')) +
    '</div>' +
    (ch.hpMode === 'manual'
      ? '<label class="field"><span>Total hit points (your rolls plus Constitution)</span><input type="number" min="1" id="hpManual" data-num="hpManual" value="' +
        (ch.hpManual || d.hpAvg) +
        '"></label>'
      : '') +
    '<p class="muted small">Hit dice ' +
    d.hitDice +
    ': full die at character level 1, then the average each level; Constitution modifier and other per-level bonuses included.</p></div>';
  return h;
}
function stepBackground() {
  var srcs = [];
  D.backgrounds.forEach(function (b) {
    if (ok(b.tag) && srcs.indexOf(b.s) < 0) srcs.push(b.s);
  });
  srcs.sort();
  var list = D.backgrounds.filter(function (b) {
    return (
      (ok(b.tag) || b.n === ch.background) &&
      match(ui.q.background || '', b.n + ' ' + (b.sk || []).join(' ')) &&
      (!ui.bgsrc || b.s === ui.bgsrc)
    );
  });
  var h =
    '<h2>Background</h2>' +
    partImportHtml('background') +
    '<p class="muted">Where your character came from: skills, tools, languages and a story feature.</p><div class="toolbar">' +
    search('background', 'Search by name or skill…') +
    '<select data-ui="bgsrc" aria-label="Book"><option value="">All books</option>' +
    srcs
      .map(function (x) {
        return '<option' + (ui.bgsrc === x ? ' selected' : '') + '>' + esc(x) + '</option>';
      })
      .join('') +
    '</select><span class="muted small">' +
    list.length +
    ' shown</span></div>' +
    '<div class="grid scroll">' +
    list
      .map(function (b) {
        return (
          '<button type="button" class="card' +
          (ch.background === b.n ? ' on' : '') +
          '" data-act="background" data-v="' +
          esc(b.n) +
          '"><b>' +
          esc(b.n) +
          '</b><small>' +
          esc((b.sk || []).join(', ') || 'skills of your choice') +
          '</small><small>' +
          esc(b.s) +
          tag(b.tag) +
          '</small></button>'
        );
      })
      .join('') +
    '</div>';
  var b = d.bg;
  if (!b) return h + '<p class="notice">Pick a background to see what it grants.</p>';
  h +=
    '<div class="panel"><h3>' +
    esc(b.n) +
    '</h3><div class="facts">' +
    (b.sk && b.sk.length ? '<span><b>Skills</b> ' + esc(b.sk.join(', ')) + '</span>' : '') +
    (b.tools ? '<span><b>Tools</b> ' + esc(b.tools.join(', ')) + '</span>' : '') +
    (b.lang ? '<span><b>Languages</b> ' + esc(b.lang.join(', ')) + '</span>' : '') +
    '</div><p><b>Equipment:</b> ' +
    esc(b.eq || '—') +
    '</p>' +
    (b.f ? featureHtml({ n: b.f[0], t: b.f[1] }) : '') +
    (b.spells ? '<p class="small muted">Guild spells are added to your class spell list on the Spells step.</p>' : '') +
    choicesFor('background', function (c) {
      return !slotChoice(c);
    }) +
    '</div>';
  return (
    h +
    d.featSlots
      .filter(function (s) {
        return s.step === 'background';
      })
      .map(featSlotHtml)
      .join('')
  );
}
function spellMeta(s) {
  return (
    (s.level ? 'Level ' + s.level : 'Cantrip') +
    ' ' +
    s.school.toLowerCase() +
    ' · ' +
    s.time +
    ' · ' +
    s.range +
    ' · ' +
    s.duration +
    (s.ritual ? ' · ritual' : '')
  );
}
// "Import" on each step: brings in only that part of a character from another app's file.
var PARTS = {
  lineage: { label: 'lineage', short: 'Lineage', what: 'lineage, subrace and lineage choices', spellbook: true },
  class: {
    label: 'classes',
    short: 'Class',
    what: 'classes, levels, subclasses and class choices (skills, fighting styles…)',
    spellbook: true
  },
  abilities: {
    label: 'ability scores',
    short: 'Abilities and feats',
    what: 'ability scores (the exact totals), ability improvements and feats'
  },
  background: { label: 'background', short: 'Background', what: 'background and its choices' },
  spells: { label: 'spells', short: 'Spells', what: 'spells', spellbook: true },
  equipment: { label: 'armour and weapons', short: 'Armour and weapons', what: 'worn armour, shield and weapons' },
  items: { label: 'items and coins', short: 'Items and coins', what: 'inventory and coins' },
  appearance: { label: 'picture', short: 'Picture', what: 'character picture' },
  details: { label: 'details', short: 'Details and notes', what: 'alignment, personality, backstory and notes' }
};
function partImportHtml(step) {
  var P = PARTS[step],
    I = ui.partImport && ui.partImport.step === step ? ui.partImport : null,
    done = ui.partImportDone && ui.partImportDone.step === step ? ui.partImportDone : null;
  var bar =
    '<div class="spell-import noprint"><div class="toolbar">' +
    btn('importPart', '⇩ Import ' + P.label, { step: step }) +
    '<span class="small muted">From a 5e Companion character' +
    (P.spellbook ? ' or a 5th Spellbook backup' : '') +
    '. Only changes the ' +
    esc(P.what) +
    ' of ' +
    esc(title(ch)) +
    '; everything else stays.</span></div>';
  if (ui.partImportError && ui.partImportError.step === step)
    bar += '<p class="small" style="color:var(--warn)">' + esc(ui.partImportError.msg) + '</p>';
  if (done)
    bar +=
      '<div class="panel"><b>' +
      esc(done.msg) +
      '</b> Not right? Press Undo at the top. ' +
      btn('partImportClose', 'OK', {}, 'btn tiny') +
      '</div>';
  if (I)
    bar +=
      '<div class="panel"><b>Which character?</b> <span class="muted">The file has ' +
      I.entries.length +
      ' characters. Pick the one to take the ' +
      esc(P.label) +
      ' from.</span><div class="imp-list">' +
      I.entries
        .map(function (e) {
          return (
            '<label class="imp-row"><input type="radio" name="partFrom" data-partfrom="' +
            e.id +
            '"' +
            (I.choose === e.id ? ' checked' : '') +
            '><span><b>' +
            esc(e.name) +
            '</b><br><span class="small muted">' +
            esc(importerOf(e).summary(e)) +
            '</span></span></label>'
          );
        })
        .join('') +
      '</div><div class="toolbar">' +
      btn('partImportGo', 'Import from this character', {}, 'btn primary') +
      btn('partImportCancel', 'Cancel') +
      '</div></div>';
  return bar + '</div>';
}
function swapIn(c2) {
  store.chars[store.chars.indexOf(ch)] = c2;
  store.current = c2.id;
  ch = c2;
}
// Copy chosen parts of an imported character onto an existing one. Returns the updated copy, a note on
// what changed, and the picture to add (pictures are shrunk afterwards, asynchronously).
var PART_ORDER = [
  'lineage',
  'class',
  'background',
  'abilities',
  'equipment',
  'items',
  'details',
  'appearance',
  'spells'
];
function mergeParts(c0, entry, steps) {
  var src = sourceName(entry),
    c = JSON.parse(JSON.stringify(c0)),
    said = [],
    picture = null,
    spellNote = '';
  steps = PART_ORDER.filter(function (k) {
    return steps.indexOf(k) >= 0 && (entry.source === 'companion' || PARTS[k].spellbook);
  });
  var others = steps.filter(function (k) {
    return k !== 'spells';
  });
  var full = others.length ? importerOf(entry).toCharacter(entry, R, D) : null,
    f = full && full.ch;
  var takePicks = function (prefixes) {
    Object.keys(c.picks).forEach(function (k) {
      if (
        prefixes.some(function (p) {
          return k.indexOf(p) === 0;
        })
      )
        delete c.picks[k];
    });
    Object.keys(f.picks).forEach(function (k) {
      if (
        prefixes.some(function (p) {
          return k.indexOf(p) === 0;
        })
      )
        c.picks[k] = f.picks[k].slice();
    });
  };
  others.forEach(function (step) {
    if (step === 'lineage') {
      c.lineage = f.lineage;
      c.version = f.version;
      c.sub = f.sub;
      takePicks(['lin']);
    } else if (step === 'class') {
      c.classes = f.classes;
      takePicks(['cls.', 'sc.']);
    } else if (step === 'abilities') {
      c.asi = f.asi;
      takePicks(['asi.']);
      var want = R.derive(f, store.filters).abilities,
        cur = R.derive(c, store.filters).abilities;
      c.method = 'manual';
      AB.forEach(function (a) {
        c.base[a] = Math.max(1, Math.min(30, want[a].total - (cur[a].total - c.base[a])));
      });
    } else if (step === 'background') {
      c.background = f.background;
      takePicks(['bg']);
    } else if (step === 'equipment') {
      c.armor = f.armor;
      c.shield = f.shield;
      c.weapons = f.weapons.slice();
    } else if (step === 'items') {
      c.items = f.items;
      c.money = f.money;
    } else if (step === 'details') {
      if (f.alignment) c.alignment = f.alignment;
      if (f.player) c.player = f.player;
      if (!String(c.name || '').trim()) c.name = f.name;
      ['traits', 'ideals', 'bonds', 'flaws', 'appearance', 'backstory'].forEach(function (k) {
        if (f.notes[k]) c.notes[k] = f.notes[k];
      });
      var extra = String(f.notes.other || '').split('Notes from ' + src + ':')[1];
      if (extra && extra.trim())
        c.notes.other =
          (c.notes.other ? c.notes.other + '\n\n' : '') + 'Notes from ' + src + ' (' + entry.name + '):' + extra;
    } else if (step === 'appearance') {
      if (!full.picture) return;
      picture = full.picture;
    }
    said.push(PARTS[step].label);
  });
  if (steps.indexOf('spells') >= 0) {
    var u = Import5e.spellsInto(entry, c, R, D);
    c = u.ch;
    said.push('spells');
    spellNote =
      u.added +
      ' spell' +
      (u.added === 1 ? '' : 's') +
      ' added' +
      (u.skipped.length ? ', ' + u.skipped.length + ' didn’t fit and are listed in Details → Other notes' : '');
  }
  return {
    ch: normalize(c),
    parts: said,
    picture: picture,
    spellNote: spellNote,
    missingPicture: steps.indexOf('appearance') >= 0 && !picture
  };
}
function partsSentence(r) {
  return r.parts.length ? r.parts.join(', ') : 'nothing';
}
function applyPartImport(step, entry) {
  ui.partImport = null;
  ui.partImportError = null;
  if (step === 'appearance' && entry.source !== 'companion') throw new Error('5th Spellbook backups have no picture.');
  var r = mergeParts(ch, entry, [step]);
  if (r.missingPicture) throw new Error('That character has no picture in the file.');
  swapIn(r.ch);
  if (r.picture)
    shrinkPicture(r.picture, function (data) {
      var me = byId(r.ch.id);
      if (me && data) {
        me.picture = data;
        render();
      }
    });
  var P = PARTS[step];
  ui.partImportDone = {
    step: step,
    msg:
      step === 'spells'
        ? 'Spells imported from ' + entry.name + ' (' + sourceName(entry) + '): ' + r.spellNote + '.'
        : 'Imported the ' +
          P.label +
          ' of ' +
          entry.name +
          ' (' +
          sourceName(entry) +
          ').' +
          (step === 'abilities' ? ' Scores match the file exactly, with your own lineage and feats counted.' : '')
  };
}
function loadPartImport(input) {
  var file = input.files && input.files[0],
    step = input.getAttribute('data-step') || ui.step;
  input.value = '';
  if (!file) return;
  var reader = new FileReader();
  reader.onload = function () {
    ui.partImportError = null;
    ui.partImportDone = null;
    ui.partImport = null;
    try {
      var entries = readImportFile(reader.result);
      if (!entries || entries.json)
        throw new Error(
          'That file is not a 5e Companion character' +
            (PARTS[step].spellbook ? ' or a 5th Spellbook backup' : '') +
            '.'
        );
      if (!entries.length) throw new Error('That file has no characters.');
      if (entries[0].source !== 'companion' && !PARTS[step].spellbook)
        throw new Error(
          '5th Spellbook backups don’t include the ' + PARTS[step].label + '. Use a character shared from 5e Companion.'
        );
      var nm = function (x) {
        return String(x || '')
          .trim()
          .toLowerCase();
      };
      var same = entries.filter(function (e) {
        return nm(e.name) && nm(e.name) === nm(ch.name);
      });
      if (entries.length === 1) applyPartImport(step, entries[0]);
      else ui.partImport = { step: step, entries: entries, choose: (same[0] || entries[0]).id };
    } catch (err) {
      ui.partImportError = {
        step: step,
        msg: /5th Spellbook|5e Companion|picture|no characters/.test(err.message)
          ? err.message
          : 'That file could not be read.'
      };
      window.console.error(err);
    }
    render();
  };
  reader.readAsArrayBuffer(file);
}
function setLevel(id, value) {
  var e = entry(id);
  if (!e) return;
  var others = d.classes.reduce(function (n, x) {
    return n + (x.id === id ? 0 : x.level);
  }, 0);
  e.level = Math.max(1, Math.min(20 - others, Math.round(value) || 1));
}
