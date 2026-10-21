// The Appearance, Details, Notes and Sheet steps, and the optional limits.
// Part of the app: these files share one scope (see “How the code is organized” in README.md), loaded in order by index.html.
'use strict';

function stepAppearance() {
  var L = lookOf(ch, d),
    own = ch.look || {};
  function opts(k, label) {
    return (
      '<label class="field"><span>' +
      label +
      (own[k] != null ? ' <small class="muted">· changed</small>' : '') +
      '</span><select data-look="' +
      k +
      '">' +
      Avatar.OPTIONS[k]
        .map(function (o) {
          return '<option value="' + o[0] + '"' + (L[k] === o[0] ? ' selected' : '') + '>' + o[1] + '</option>';
        })
        .join('') +
      '</select></label>'
    );
  }
  function sw(k, label, list, none) {
    return (
      '<div class="field"><span>' +
      label +
      '</span><div class="swatches">' +
      (none
        ? '<button type="button" class="sw none' +
          (!L[k] ? ' on' : '') +
          '" data-act="look" data-k="' +
          k +
          '" data-v="" title="Match shirt">×</button>'
        : '') +
      list
        .map(function (c) {
          return (
            '<button type="button" class="sw' +
            (L[k] === c ? ' on' : '') +
            '" style="background:' +
            c +
            '" data-act="look" data-k="' +
            k +
            '" data-v="' +
            c +
            '" aria-label="' +
            label +
            ' ' +
            c +
            '"></button>'
          );
        })
        .join('') +
      '<input type="color" data-lookcolor="' +
      k +
      '" value="' +
      (L[k] || '#888888') +
      '" aria-label="Custom ' +
      label.toLowerCase() +
      '"></div></div>'
    );
  }
  var hidden = own.hidden || {};
  var wear = ch.items.filter(function (it) {
    var g = Avatar.gear({ items: [Object.assign({}, it)], weapons: [], armor: '', look: {} }, D);
    return Object.keys(g.slots).length || g.main || g.shield || g.armorGlow;
  });
  var shown = [];
  if (ch.armor) shown.push(ch.armor);
  if (ch.shield) shown.push('Shield');
  shown = shown.concat(ch.weapons);
  var V = ch.pictureView || {},
    editing = ui.picEdit && ch.picture;
  var pic =
    '<h3>Character picture</h3><div class="pic-wrap"><div><div class="pic-frame' +
    (ch.picture ? '' : ' empty') +
    (editing ? ' editing' : '') +
    '">' +
    (ch.picture ? pictureHtml('big') : '<span>No picture yet</span>') +
    '</div>' +
    (editing
      ? '<div class="pic-tools"><label class="field"><span>Zoom</span><input type="range" min="0.5" max="4" step="0.01" data-piczoom="1" value="' +
        (+V.zoom || 1) +
        '"></label>' +
        '<div class="toolbar">' +
        btn('picRotate', '⟲', { v: -90 }, 'btn') +
        btn('picRotate', '⟳', { v: 90 }, 'btn') +
        btn('picReset', 'Reset') +
        btn('picDone', 'Done', {}, 'btn primary') +
        '</div></div>'
      : '') +
    '</div><div>' +
    '<p class="muted">Add your own picture of the character: a drawing, an image you made or found, anything. It shows in the side panel and at the top of the sheet.</p>' +
    (editing
      ? '<p><b>Fit your picture:</b> drag it in the frame to move it, and zoom with the slider (or pinch with two fingers, or the mouse wheel). ⟲ ⟳ turn it. What you see in the frame is what shows in the side panel and on the sheet.</p>'
      : '<div class="toolbar">' +
        btn('pickPicture', ch.picture ? 'Change picture' : 'Add a picture', {}, 'btn primary') +
        (ch.picture
          ? btn('picEdit', '✥ Move, zoom and turn', {}, 'btn') +
            btn('removePicture', 'Remove picture', {}, 'btn danger')
          : '') +
        '</div>') +
    (ch.picture
      ? '<label class="check-line"><input type="checkbox" data-check="pictureWhole"' +
        (ch.pictureFit === 'contain' ? ' checked' : '') +
        '> Fit the whole picture in the frame (no cropping)</label>'
      : '') +
    (ui.pictureError ? '<p class="small" style="color:var(--warn)">' + esc(ui.pictureError) + '</p>' : '') +
    '<p class="small muted">The picture is saved in this browser with the character and included when you export it. It is never uploaded anywhere.</p>' +
    '<input type="file" id="pictureFile" accept="image/*" hidden></div></div>';
  var stage =
    '<div class="look-stage">' +
    avatarCanvas('big') +
    '<div class="toolbar" style="justify-content:center">' +
    btn('lookRandom', 'Randomize') +
    btn('lookReset', 'Match lineage') +
    '</div></div>';
  var controls =
    '<h3>Body</h3><div class="row">' +
    opts('height', 'Height') +
    opts('build', 'Build') +
    '</div>' +
    sw('skin', 'Skin', Avatar.SKINS) +
    '<h3>Head</h3><div class="row">' +
    opts('head', 'Head') +
    opts('ears', 'Ears') +
    opts('extra', 'Extra') +
    '</div>' +
    sw('eyes', 'Eyes', Avatar.EYES) +
    '<h3>Hair</h3><div class="row">' +
    opts('hair', 'Hair style') +
    opts('beard', 'Beard') +
    '</div>' +
    sw('hairColor', 'Hair colour', Avatar.HAIRS) +
    '<h3>Features</h3><div class="row">' +
    opts('horns', 'Horns') +
    opts('tail', 'Tail') +
    opts('wings', 'Wings') +
    '</div>' +
    '<h3>Clothes</h3>' +
    sw('shirt', 'Shirt', Avatar.CLOTH) +
    sw('pants', 'Trousers', Avatar.CLOTH) +
    sw('cloak', 'Cloak and robe', Avatar.CLOTH, true) +
    '<h3>Scene</h3><div class="row">' +
    opts('base', 'Ground') +
    '</div>' +
    '<h3>Worn and carried</h3>' +
    (shown.length
      ? '<p><b>From Equipment:</b> ' + esc(shown.join(', ')) + '</p>'
      : '<p class="muted">No armour or weapons chosen yet. Pick them in the Equipment step.</p>') +
    (wear.length
      ? '<div class="look-items">' +
        wear
          .map(function (it) {
            return (
              '<label class="check"><input type="checkbox" data-lookhide="' +
              it.id +
              '"' +
              (hidden[it.id] ? '' : ' checked') +
              '> Show ' +
              esc(it.n) +
              '</label>'
            );
          })
          .join('') +
        '</div>'
      : '<p class="muted">No wearable items in the inventory. Cloaks, hats, helms, circlets, boots, gloves, belts, amulets, rings, goggles, orbs and magic weapons, armour and shields are drawn; other items are not.</p>') +
    '<p class="small muted">Magic items add a sparkle in their rarity colour. Only the first weapon is held; a second light weapon goes in the off hand, and a bow, staff or great weapon goes on the back.</p>';
  return (
    '<h2>Appearance</h2>' +
    partImportHtml('appearance') +
    pic +
    '<h3 style="margin-top:2rem">Pixel figure</h3><p class="muted">A little pixel-art figure of your character. Starting looks follow your lineage, and armour, weapons and wearable items are drawn on it.</p>' +
    '<div class="look-wrap">' +
    stage +
    '<div class="look-controls">' +
    controls +
    '</div></div>'
  );
}
function stepDetails() {
  function t(k, label, area) {
    var v = k in ch.notes ? ch.notes[k] : ch[k],
      path = k in ch.notes ? 'notes.' + k : k;
    return (
      '<label class="field"><span>' +
      label +
      '</span>' +
      (area
        ? '<textarea id="f-' + k + '" data-text="' + path + '">' + esc(v) + '</textarea>'
        : '<input type="text" id="f-' + k + '" data-text="' + path + '" value="' + esc(v) + '">') +
      '</label>'
    );
  }
  return (
    '<h2>Details</h2>' +
    partImportHtml('details') +
    '<div class="panel"><div class="row">' +
    t('name', 'Character name') +
    t('player', 'Player') +
    '<label class="field"><span>Alignment</span><select data-set="alignment"><option value="">—</option>' +
    D.alignments
      .map(function (a) {
        return '<option' + (ch.alignment === a ? ' selected' : '') + '>' + a + '</option>';
      })
      .join('') +
    '</select></label></div>' +
    t('traits', 'Personality traits', 1) +
    t('ideals', 'Ideals', 1) +
    t('bonds', 'Bonds', 1) +
    t('flaws', 'Flaws', 1) +
    t('appearance', 'Appearance', 1) +
    t('backstory', 'Backstory', 1) +
    t('other', 'Other notes', 1) +
    '</div>' +
    limitsHtml()
  );
}
// Limits that can be switched off, and extras gained outside the normal rules
function limitsHtml() {
  var F = ch.free || {},
    X = ch.extra || {};
  var tog = function (k, label, hint) {
    return (
      '<label class="check-line"><input type="checkbox" data-free="' +
      k +
      '"' +
      (F[k] ? ' checked' : '') +
      '> <span><b>' +
      label +
      '</b>' +
      (hint ? '<br><span class="small muted">' + hint + '</span>' : '') +
      '</span></label>'
    );
  };
  var num = function (k, label) {
    return (
      '<label class="field extra-num"><span>' +
      label +
      '</span><input type="number" step="1" id="x-' +
      k +
      '" data-extra="' +
      k +
      '" value="' +
      (+X[k] || 0) +
      '"></label>'
    );
  };
  var txt = function (k, label, ph) {
    return (
      '<label class="field"><span>' +
      label +
      '</span><input type="text" id="x-' +
      k +
      '" data-extratext="' +
      k +
      '" value="' +
      esc(X[k] || '') +
      '" placeholder="' +
      esc(ph) +
      '"></label>'
    );
  };
  var manualHp = ch.hpMode === 'manual';
  var xs = X.skills || {},
    saves = X.saves || [];
  return (
    '<h3 style="margin-top:2rem">Limits and extras</h3><p class="muted">For anything your character has beyond the normal rules: a magic item, a blessing, a boon, a house rule. Everything here is for ' +
    esc(title(ch)) +
    ' only.</p>' +
    '<div class="panel"><h4>Limits</h4>' +
    tog('spells', 'No spell maximum', 'Add as many cantrips and spells as you like, still from your own class lists.') +
    tog('abilityCap', 'Ability scores can go above 20', 'Up to 30, for items, boons or epic play.') +
    '<label class="check-line"><input type="checkbox" data-hpmanual="1"' +
    (manualHp ? ' checked' : '') +
    '> <span><b>Set my own hit point maximum</b><br><span class="small muted">Instead of the one worked out from class and Constitution (' +
    d.hpAvg +
    ' on average).</span></span></label>' +
    (manualHp
      ? '<label class="field extra-num" style="margin-left:1.8rem"><span>Hit point maximum</span><input type="number" min="1" data-num="hpManual" value="' +
        (ch.hpManual || d.hpAvg) +
        '"></label>'
      : '') +
    '<p class="small muted" style="margin:.6rem 0 0">Attunement has no switch: you can attune to as many items as you like, and the app only reminds you when you go past the usual limit.</p>' +
    '</div>' +
    '<div class="panel"><h4>Extra bonuses</h4><p class="small muted">Added on top of everything the app works out. Use negative numbers for penalties.</p><div class="extra-grid">' +
    AB.map(function (a) {
      return num(a, D.abilityNames[a]);
    }).join('') +
    '</div><div class="extra-grid">' +
    num('ac', 'Armor class') +
    num('hp', 'Hit points') +
    num('speed', 'Speed (ft)') +
    num('init', 'Initiative') +
    num('passive', 'Passive Perception') +
    num('spellDC', 'Spell save DC') +
    num('spellAtk', 'Spell attack') +
    '</div></div>' +
    '<div class="panel" id="skills-edit"><h4>Skills</h4><p class="small muted">Change any skill by hand. “Auto” keeps what your lineage, class, background and feats give. The bonus is added on top (an item, a blessing…).</p><div class="skill-edit">' +
    Object.keys(D.skills)
      .map(function (k) {
        var v = xs[k] || '',
          s = d.skills[k],
          b = +(X.skillBonus || {})[k] || 0,
          o = function (val, t) {
            return '<option value="' + val + '"' + (v === val ? ' selected' : '') + '>' + t + '</option>';
          };
        return (
          '<div class="skill-row' +
          (v || b ? ' changed' : '') +
          '"><span class="v">' +
          R.fmt(s.total) +
          '</span><span class="nm">' +
          esc(k) +
          ' <small class="muted">' +
          s.ability +
          '</small></span>' +
          '<select data-extraskill="' +
          esc(k) +
          '" aria-label="' +
          esc(k) +
          ' proficiency">' +
          o('', 'Auto' + (s.prof && !v ? (s.expertise ? ' · exp.' : ' · prof.') : '')) +
          o('none', 'Not proficient') +
          o('prof', 'Proficient') +
          o('exp', 'Expertise') +
          '</select>' +
          '<input type="number" step="1" id="xs-' +
          esc(k) +
          '" data-skillbonus="' +
          esc(k) +
          '" value="' +
          b +
          '" aria-label="' +
          esc(k) +
          ' bonus"></div>'
        );
      })
      .join('') +
    '</div></div>' +
    '<div class="panel"><h4>Extra proficiencies</h4><p class="small" style="margin:0 0 .3rem"><b>Saving throws</b></p><div class="pills">' +
    AB.map(function (a) {
      return (
        '<label class="check-line" style="margin:0 .8rem 0 0"><input type="checkbox" data-extrasave="' +
        a +
        '"' +
        (saves.indexOf(a) >= 0 ? ' checked' : '') +
        '> ' +
        D.abilityNames[a] +
        '</label>'
      );
    }).join('') +
    '</div><div class="row" style="margin-top:.6rem">' +
    txt('languages', 'Languages', "e.g. Sylvan, Thieves' Cant") +
    txt('tools', 'Tools', 'e.g. Herbalism kit') +
    '</div><div class="row">' +
    txt('armor', 'Armor', 'e.g. Heavy armor') +
    txt('weapons', 'Weapons', 'e.g. Martial weapons') +
    '</div></div>'
  );
}
// Notes kept during play: write one, give it a title and a category, save it; saved notes can be filtered, searched and edited.
var NOTE_CATS = ['Session', 'People', 'Places', 'Quests', 'Loot', 'Lore', 'Other'];
function stepNotes() {
  var J = ch.journal || [],
    N = ch.notes,
    f = ui.noteCat || '',
    q = ui.q.notes || '';
  var cats = NOTE_CATS.concat(
    J.map(function (n) {
      return n.c;
    }).filter(function (c, i, a) {
      return c && NOTE_CATS.indexOf(c) < 0 && a.indexOf(c) === i;
    })
  );
  var dl =
    '<datalist id="note-cats">' +
    cats
      .map(function (c) {
        return '<option value="' + esc(c) + '">';
      })
      .join('') +
    '</datalist>';
  var h =
    '<h2>Notes</h2><p class="muted">Write a note, give it a title and a category, then save it. Saved notes are below, easy to filter and search. Saved with this character.</p>' +
    dl +
    '<div class="panel"><div class="row"><label class="field"><span>Title</span><input type="text" id="f-draftTitle" data-text="notes.draftTitle" value="' +
    esc(N.draftTitle || '') +
    '" placeholder="e.g. Session 3, Captain Varo"></label>' +
    '<label class="field"><span>Category</span><input type="text" id="f-draftCat" list="note-cats" data-text="notes.draftCat" value="' +
    esc(N.draftCat || '') +
    '" placeholder="Pick below or type your own"></label></div>' +
    '<div class="pills">' +
    cats
      .map(function (c) {
        return btn('draftCat', esc(c), { v: c }, 'pill small' + (N.draftCat === c ? ' on' : ''));
      })
      .join('') +
    '</div>' +
    '<label class="field"><span>Note</span><textarea id="f-session" class="notes-big" data-text="notes.session" placeholder="What happened, who you met…">' +
    esc(N.session || '') +
    '</textarea></label>' +
    '<div class="toolbar">' +
    btn('saveNote', 'Save note', {}, 'btn primary') +
    '</div></div>';
  if (!J.length) return h + '<p class="muted small">No saved notes yet.</p>';
  var used = cats.filter(function (c) {
    return J.some(function (n) {
      return (n.c || 'Other') === c;
    });
  });
  var rows = J.filter(function (n) {
    return (
      (!f || (n.c || 'Other') === f) &&
      (!q.trim() ||
        ((n.t || '') + ' ' + (n.c || '') + ' ' + (n.x || '')).toLowerCase().indexOf(q.trim().toLowerCase()) >= 0)
    );
  })
    .slice()
    .reverse();
  h +=
    '<h3>Saved notes (' +
    J.length +
    ')</h3><div class="pills">' +
    btn('noteCat', 'All', { v: '' }, 'pill small' + (!f ? ' on' : '')) +
    used
      .map(function (c) {
        var n = J.filter(function (x) {
          return (x.c || 'Other') === c;
        }).length;
        return btn('noteCat', esc(c) + ' ' + n, { v: c }, 'pill small' + (f === c ? ' on' : ''));
      })
      .join('') +
    '</div>' +
    '<div class="toolbar">' +
    search('notes', 'Search words in your notes…') +
    (q ? '<span class="small muted">' + rows.length + ' note' + (rows.length === 1 ? '' : 's') + '</span>' : '') +
    '</div>';
  if (q.trim()) {
    // the same words in the Details page (backstory, traits…)
    var DET = [
      ['traits', 'Personality traits'],
      ['ideals', 'Ideals'],
      ['bonds', 'Bonds'],
      ['flaws', 'Flaws'],
      ['appearance', 'Appearance'],
      ['backstory', 'Backstory'],
      ['other', 'Other notes'],
      ['session', 'Note being written']
    ];
    var det = DET.map(function (x) {
      var r = findSnippets(N[x[1] === 'Note being written' ? 'session' : x[0]], q, 2);
      return r.n
        ? '<div class="snip-group"><b>' +
            x[1] +
            '</b> <span class="small muted">' +
            r.n +
            '×</span>' +
            r.html +
            '</div>'
        : '';
    }).join('');
    if (det)
      h +=
        '<div class="panel"><h4 style="margin-top:0">Also in ' +
        btn('step', 'Details', { v: 'details' }, 'linkbtn') +
        '</h4>' +
        det +
        '</div>';
  }
  if (!rows.length) return h + '<p class="muted">No notes match.</p>';
  return (
    h +
    '<div class="note-list">' +
    rows
      .map(function (n) {
        var open = ui.noteOpen === n.id;
        return (
          '<details class="panel note"' +
          (open ? ' open' : '') +
          '><summary data-act="noteOpen" data-v="' +
          n.id +
          '"><b>' +
          esc(n.t || 'Untitled') +
          '</b> <span class="tag">' +
          esc(n.c || 'Other') +
          '</span> <span class="small muted">' +
          esc(n.at || '') +
          '</span>' +
          (open
            ? ''
            : q.trim()
              ? (function () {
                  var r = findSnippets(n.x, q, 3),
                    rt = findSnippets(n.t, q, 1);
                  r.n += rt.n;
                  if (!r.html) r.html = rt.html;
                  return '<span class="small muted">' + r.n + '×</span><span class="note-peek">' + r.html + '</span>';
                })()
              : '<span class="small muted note-peek">' + esc(String(n.x || '').slice(0, 90)) + '</span>') +
          '</summary>' +
          '<div class="row"><label class="field"><span>Title</span><input type="text" id="jn-' +
          n.id +
          '-t" data-jnote="' +
          n.id +
          '" data-f="t" value="' +
          esc(n.t || '') +
          '"></label>' +
          '<label class="field"><span>Category</span><input type="text" id="jn-' +
          n.id +
          '-c" list="note-cats" data-jnote="' +
          n.id +
          '" data-f="c" value="' +
          esc(n.c || '') +
          '"></label></div>' +
          '<textarea id="jn-' +
          n.id +
          '-x" class="notes-mid" data-jnote="' +
          n.id +
          '" data-f="x">' +
          esc(n.x || '') +
          '</textarea>' +
          '<div class="toolbar">' +
          btn('rmNote', 'Delete note', { v: n.id }, 'btn small danger') +
          '</div></details>'
        );
      })
      .join('') +
    '</div>'
  );
}
function stepSheet() {
  // skills sit right under the proficiencies, before the spells
  var skillsH =
    '<div class="sheet-skills"><h3>Skills ' +
    btn('editSkills', 'Edit', {}, 'btn small noprint') +
    '</h3><ul class="lines">' +
    Object.keys(d.skills)
      .map(function (k) {
        var s = d.skills[k];
        return (
          '<li><span class="dot' +
          (s.expertise ? ' e' : s.prof ? ' p' : '') +
          '"></span><span class="v">' +
          R.fmt(s.total) +
          '</span><span>' +
          k +
          ' <small class="muted">' +
          s.ability +
          '</small></span></li>'
        );
      })
      .join('') +
    '</ul></div>';
  var S = d.spell,
    p = d.prof;
  function list(label, a) {
    return a.length ? '<p><b>' + label + ':</b> ' + esc(a.join(', ')) + '</p>' : '';
  }
  function group(kind, label, clsId) {
    var f = d.features.filter(function (x) {
      return x.kind === kind && (!clsId || x.clsId === clsId);
    });
    return f.length
      ? '<h3>' +
          esc(label) +
          '</h3>' +
          f
            .map(function (x) {
              var t = store.detail && x.long ? x.long : x.t;
              return (
                '<div class="feature"><b>' +
                esc(x.n) +
                '</b>' +
                (kind === 'option' ? ' <span class="lv">' + esc(x.src) + '</span>' : '') +
                (t ? ' — ' + esc(t) : '') +
                '</div>'
              );
            })
            .join('')
      : '';
  }
  var h =
    '<div class="toolbar noprint">' +
    btn('print', 'Print or save as PDF', {}, 'btn primary') +
    (mySpellRows().length ? btn('printCards', 'Print spell cards', {}, 'btn') : '') +
    btn('export', 'Export JSON') +
    (totalTodo()
      ? '<span class="count" style="color:var(--warn)">' +
        totalTodo() +
        ' choice(s) still open — see the badges in the step list.</span>'
      : '') +
    '</div>';
  h +=
    '<div class="sheet"><div class="sheet-head"><div class="sheet-pics">' +
    pictureHtml('sheet-pic') +
    avatarCanvas('sheet-pic') +
    '</div><div style="flex:1"><h2>' +
    esc(title(ch)) +
    '</h2><div>' +
    esc(summaryLine(ch, d)) +
    '</div></div><div class="facts" style="margin:0">' +
    (d.bg ? '<span><b>Background</b> ' + esc(d.bg.n) + '</span>' : '') +
    (ch.alignment ? '<span><b>Alignment</b> ' + esc(ch.alignment) + '</span>' : '') +
    (ch.player ? '<span><b>Player</b> ' + esc(ch.player) + '</span>' : '') +
    '<span><b>XP</b> ' +
    D.xpByLevel[d.level - 1].toLocaleString('en') +
    '</span><span><b>Size</b> ' +
    esc(d.size || 'Medium') +
    '</span></div></div><div class="sheet-cols"><div>' +
    '<div class="abil">' +
    AB.map(function (a) {
      var x = d.abilities[a];
      return '<div class="stat"><span>' + a + '</span><b>' + R.fmt(x.mod) + '</b><i>' + x.total + '</i></div>';
    }).join('') +
    '</div>' +
    '<h3>Saving throws</h3><ul class="lines">' +
    AB.map(function (a) {
      var s = d.saves[a];
      return (
        '<li><span class="dot' +
        (s.prof ? ' p' : '') +
        '"></span><span class="v">' +
        R.fmt(s.total) +
        '</span><span>' +
        D.abilityNames[a] +
        '</span></li>'
      );
    }).join('') +
    '</ul>' +
    '<p class="small muted">● proficient · ◉ expertise</p></div><div>' +
    '<div class="slots">' +
    [
      ['Armor class', d.ac],
      ['Hit points', d.hp],
      ['Hit dice', d.hitDice],
      ['Initiative', R.fmt(d.init)],
      ['Speed', d.speed + ' ft'],
      ['Proficiency', R.fmt(d.pb)],
      ['Passive Perception', d.passive]
    ]
      .map(function (x) {
        return '<div class="stat" style="padding:.3rem .7rem"><b>' + x[1] + '</b><span>' + x[0] + '</span></div>';
      })
      .join('') +
    '</div>' +
    '<p class="small muted">AC: ' +
    esc(d.acNote) +
    (d.moves.length ? ' · Also: ' + esc(d.moves.join(', ')) : '') +
    (d.darkvision ? ' · Darkvision ' + d.darkvision + ' ft' : '') +
    '</p>' +
    (d.resources.length
      ? '<div class="facts">' +
        d.resources
          .map(function (r) {
            return '<span><b>' + esc(r[0]) + '</b> ' + esc(r[1]) + '</span>';
          })
          .join('') +
        '</div>'
      : '') +
    (d.attacks.length ? '<h3>Attacks</h3>' + attacksHtml(false) : '') +
    '<h3>Proficiencies</h3>' +
    list('Armor', p.armor) +
    list('Weapons', p.weapons) +
    list('Tools', p.tools) +
    list('Languages', p.languages) +
    list('Resistances', p.res) +
    list('Immunities', p.imm);
  h += skillsH;
  if (d.casters.length) {
    h += '<h3>Spellcasting</h3>' + slotsHtml();
    d.casters.forEach(function (S) {
      h +=
        '<div class="facts"><span><b>' +
        esc(S.name) +
        '</b></span><span><b>Ability</b> ' +
        D.abilityNames[S.ability] +
        '</span><span><b>Save DC</b> ' +
        S.dc +
        '</span><span><b>Attack</b> ' +
        R.fmt(S.atk) +
        '</span>' +
        (S.mode === 'spellbook'
          ? '<span><b>Prepared</b> ' + S.prepared.length + ' of ' + S.preparedMax + ' (★)</span>'
          : '') +
        '</div>';
      var all = S.cantrips.concat(S.known, S.always).filter(function (n, i, a) {
        return a.indexOf(n) === i;
      });
      var mark = function (n) {
        return S.always.indexOf(n) >= 0
          ? ' <small class="muted">(always)</small>'
          : S.prepared.indexOf(n) >= 0
            ? ' ★'
            : '';
      };
      for (var l = 0; l <= 9; l++) {
        var at = all.filter(function (n) {
          var s = D.findSpell(n);
          return (s ? s.level : -1) === l;
        });
        if (!at.length) continue;
        if (store.detail)
          h +=
            '<h4 style="margin-top:.7rem">' +
            (l ? 'Level ' + l : 'Cantrips') +
            '</h4>' +
            at
              .map(function (n) {
                var s = D.findSpell(n),
                  t = R.spellText(s.name);
                return (
                  '<div class="feature"><b>' +
                  spellLink(n) +
                  '</b>' +
                  mark(n) +
                  ' <span class="lv">' +
                  esc(
                    s.school +
                      ' · ' +
                      s.time +
                      ' · ' +
                      s.range +
                      ' · ' +
                      s.duration +
                      (s.conc ? ' (concentration)' : '') +
                      (s.ritual ? ' · ritual' : '')
                  ) +
                  '</span>' +
                  (t ? '<div>' + esc(t) + '</div>' : '') +
                  '</div>'
                );
              })
              .join('');
        else
          h +=
            '<p><b>' +
            (l ? 'Level ' + l : 'Cantrips') +
            ':</b> ' +
            at
              .map(function (n) {
                return spellLink(n) + mark(n);
              })
              .join(', ') +
            '</p>';
      }
      var odd = S.always.filter(function (n) {
        return !D.findSpell(n);
      });
      if (odd.length) h += '<p><b>Also always prepared:</b> ' + esc(odd.join(', ')) + '</p>';
    });
  }
  var inn = d.innate.filter(function (x) {
    return x.ready;
  });
  if (inn.length) {
    if (!d.casters.length) h += '<h3>Spellcasting</h3>';
    h +=
      '<h4 style="margin-top:.7rem">' +
      (d.casters.length ? 'Other spells' : 'Spells') +
      '</h4>' +
      inn
        .map(function (x) {
          var s = x.spell,
            t = store.detail && s ? R.spellText(s.name) : '';
          var from = x.kind === 'extra' ? x.src || 'added' : x.kind === 'feat' ? 'feat: ' + x.src : x.src;
          var how = [
            s && !s.level ? 'cantrip' : s ? 'level ' + s.level : '',
            x.per,
            x.slots ? 'or with slots' : '',
            x.dc != null ? 'DC ' + x.dc + ', ' + R.fmt(x.atk) + ' (' + x.ab + ')' : ''
          ]
            .filter(Boolean)
            .join(', ');
          return store.detail
            ? '<div class="feature"><b>' +
                spellLink(x.name) +
                '</b> <span class="lv">' +
                esc(from + ' · ' + how) +
                '</span>' +
                (t ? '<div>' + esc(t) + '</div>' : '') +
                '</div>'
            : '<p>' + spellLink(x.name) + ' <small class="muted">(' + esc(from + ' · ' + how) + ')</small></p>';
        })
        .join('');
  }
  var picks = d.choices.filter(function (c) {
    return /^(lin\.pick\d|sc\.[\w-]+\.variant)/.test(c.key) && c.picked.length;
  });
  if (picks.length)
    h +=
      '<h3>Chosen options</h3>' +
      picks
        .map(function (c) {
          return '<p><b>' + esc(c.label) + ':</b> ' + esc(c.picked.join(', ')) + '</p>';
        })
        .join('');
  d.classes.forEach(function (e) {
    h +=
      group('class', e.cls.name + ' features', e.id) + (e.sc ? group('subclass', e.sc.name + ' features', e.id) : '');
  });
  h +=
    group('option', 'Class options') +
    group('lineage', (d.L ? d.L.name : 'Lineage') + ' traits') +
    group('feat', 'Feats') +
    group('background', 'Background feature');
  var eq = d.equipment.concat(ch.gear ? [ch.gear] : []);
  h +=
    '<h3>Equipment</h3>' +
    (ch.armor || ch.shield
      ? '<p><b>Worn:</b> ' + esc([ch.armor, ch.shield ? 'Shield' : ''].filter(Boolean).join(', ')) + '</p>'
      : '') +
    (eq.length
      ? '<ul>' +
        eq
          .map(function (e) {
            return '<li>' + esc(e) + '</li>';
          })
          .join('') +
        '</ul>'
      : '<p class="muted">None listed.</p>');
  var coins = ['pp', 'gp', 'ep', 'sp', 'cp']
    .filter(function (k) {
      return +ch.money[k] > 0;
    })
    .map(function (k) {
      return (+ch.money[k]).toLocaleString('en') + ' ' + k;
    });
  if (ch.items.length || coins.length) {
    h +=
      '<h3>Items</h3>' +
      (ch.items.length
        ? '<ul>' +
          ch.items
            .map(function (it) {
              return (
                '<li>' +
                (+it.qty !== 1 ? (+it.qty || 0) + ' × ' : '') +
                '<b>' +
                itemName(it) +
                '</b>' +
                (it.k === 'magic'
                  ? ' <span class="small muted">' +
                    esc((it.type || '') + (it.r ? ', ' + it.r.toLowerCase() : '')) +
                    '</span>'
                  : '') +
                (it.att
                  ? it.attuned
                    ? ' <span class="tag">attuned</span>'
                    : ' <span class="small muted">(not attuned)</span>'
                  : '') +
                (+it.w ? ' <span class="small muted">' + fmtLb(it.w * (+it.qty || 0)) + '</span>' : '') +
                (it.note ? ' — ' + esc(it.note) : '') +
                '</li>'
              );
            })
            .join('') +
          '</ul>'
        : '') +
      (coins.length ? '<p><b>Coins:</b> ' + coins.join(', ') + '</p>' : '') +
      '<p class="small muted">Carrying ' +
      d.inv.weight +
      ' of ' +
      d.inv.capacity +
      ' lb · attuned to ' +
      d.inv.attuned +
      ' of ' +
      d.inv.attuneMax +
      '</p>';
  }
  [
    ['traits', 'Personality traits'],
    ['ideals', 'Ideals'],
    ['bonds', 'Bonds'],
    ['flaws', 'Flaws'],
    ['appearance', 'Appearance'],
    ['backstory', 'Backstory'],
    ['other', 'Notes']
  ].forEach(function (n) {
    if (ch.notes[n[0]]) h += '<h3>' + n[1] + '</h3><p style="white-space:pre-wrap">' + esc(ch.notes[n[0]]) + '</p>';
  });
  return (
    h +
    '</div></div><p class="small muted" style="margin-top:1rem">Rules summaries paraphrased from <a href="https://dnd5e.wikidot.com/" target="_blank" rel="noopener">dnd5e.wikidot.com</a> (CC BY-SA 3.0). Check the wiki or your books for full wording.</p></div>'
  );
}
function totalTodo() {
  var n = 0;
  for (var k in d.todo) n += d.todo[k];
  return n;
}
