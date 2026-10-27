// Shadowdark RPG: a character sheet you fill in from your own book (or bring from Shadowdarklings.net), and
// everything for the table: hit points, luck tokens, the light timer, spells lost and regained, checks and attacks,
// gear slots, and the GM's table. No rules text is included: the Shadowdark RPG Third-Party License doesn't allow
// apps to reprint classes, tables or the like, so the player's book (or Shadowdarklings) supplies them.
// Character Forge is an independent product published under the Shadowdark RPG Third-Party License and is not
// affiliated with The Arcane Library, LLC. Shadowdark RPG © 2023 The Arcane Library, LLC.
(function (root) {
  'use strict';
  var AB = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'],
    AB_NAME = {
      STR: 'Strength',
      DEX: 'Dexterity',
      CON: 'Constitution',
      INT: 'Intelligence',
      WIS: 'Wisdom',
      CHA: 'Charisma'
    },
    ALIGN = ['Lawful', 'Neutral', 'Chaotic'],
    CONDS = [
      'Blinded',
      'Charmed',
      'Deafened',
      'Frightened',
      'Grabbed',
      'Invisible',
      'Paralyzed',
      'Poisoned',
      'Prone',
      'Asleep',
      'Stunned',
      'Unconscious',
      'Dying'
    ],
    NOTICE =
      'Character Forge is an independent product published under the Shadowdark RPG Third-Party License and is not affiliated with The Arcane Library, LLC. Shadowdark RPG © 2023 The Arcane Library, LLC.';
  // other Shadowdark tools, opened in a new tab (links only: nothing is copied from them)
  var LINKS = [
    ['https://shadowdarklings.net', 'Shadowdarklings', 'make characters, then import them here', 'both'],
    [
      'https://www.thearcanelibrary.com/products/shadowdark-rpg-quickstart-set-pdf',
      'Shadowdark Quickstart (free)',
      'the core rules, from The Arcane Library: add the PDF in Books',
      'both'
    ],
    [
      'https://www.thearcanelibrary.com/collections/shadowdark-rpg/products/solodark-solo-rules-for-shadowdark-rpg-pdf',
      'SoloDark (free)',
      'rules for playing alone, without a GM: add the PDF in Books',
      'both'
    ],
    [
      'https://www.shadowdarktools.com/reference/monster',
      'Shadowdark Tools: monsters',
      'look up a monster’s stats',
      'gm'
    ],
    [
      'https://www.shadowdarktools.com/',
      'Shadowdark Tools: generators',
      'NPCs and names, rival crawlers, known spells, shops, taverns, magic items',
      'both'
    ]
  ];
  function linksHtml(who) {
    return (
      '<ul class="sd-links">' +
      LINKS.reduce(function (a, l) {
        if (l[3] === 'both' || l[3] === who)
          a.push(
            '<li><a href="' +
              l[0] +
              '" target="_blank" rel="noopener">' +
              l[1] +
              ' ↗</a> <span class="small muted">' +
              l[2] +
              '</span></li>'
          );
        return a;
      }, []).join('') +
      '</ul>'
    );
  }
  function uid() {
    return 'sd' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }
  function newChar() {
    return {
      id: uid(),
      name: '',
      ancestry: '',
      cls: '',
      title: '',
      level: 1,
      xp: 0,
      alignment: '',
      background: '',
      deity: '',
      languages: '',
      stats: { STR: 10, DEX: 10, CON: 10, INT: 10, WIS: 10, CHA: 10 },
      hpMax: 1,
      ac: 10,
      acNote: '',
      luck: 0,
      talents: [],
      spellStat: '',
      spellBonus: 0,
      spells: [],
      attacks: [],
      gear: [],
      slotsMax: 0,
      coins: { gp: 0, sp: 0, cp: 0 },
      notes: '',
      noteStyle: {},
      track: { hp: null, conds: {}, torch: null }
    };
  }
  function n(v, lo, hi) {
    return Math.max(lo, Math.min(hi, Math.round(+v) || 0));
  }
  // the numbers the sheet works out: modifiers, gear slots, attack and spell bonuses, the next level
  function derive(c) {
    var mods = {};
    AB.forEach(function (a) {
      var s = n((c.stats || {})[a], 1, 30);
      mods[a] = Math.floor((s - 10) / 2);
    });
    var slots = +c.slotsMax > 0 ? +c.slotsMax : Math.max(10, n((c.stats || {}).STR, 1, 30)),
      used = (c.gear || []).reduce(function (t, g) {
        return t + Math.max(0, +g.slots || 0);
      }, 0),
      T = c.track || {},
      hp = T.hp == null ? +c.hpMax || 0 : +T.hp;
    return {
      mods: mods,
      slots: slots,
      used: used,
      over: used > slots,
      hp: hp,
      next: (+c.level || 1) * 10,
      attacks: (c.attacks || []).map(function (a) {
        return {
          a: a,
          bonus: (a.stat ? mods[a.stat] : 0) + (+a.extra || 0)
        };
      }),
      spell: c.spellStat ? mods[c.spellStat] + (+c.spellBonus || 0) : null
    };
  }
  function fmt(v) {
    return (v >= 0 ? '+' : '−') + Math.abs(v);
  }

  // ---------- Shadowdarklings.net: a character exported as JSON ----------
  function isShadowdarklings(o) {
    return !!(o && typeof o === 'object' && o.rolledStats && o.stats && 'gearSlotsTotal' in o);
  }
  // "Plus1ToCastingSpells" → "Plus 1 to casting spells"
  function words(s) {
    var w = String(s || '')
      .replace(/_/g, ' ')
      .replace(/([a-z])([A-Z0-9])/g, '$1 $2')
      .replace(/([0-9])([A-Za-z])/g, '$1 $2')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();
    return w.charAt(0).toUpperCase() + w.slice(1);
  }
  function str(v, max) {
    return String(v == null ? '' : v).slice(0, max || 200);
  }
  function fromShadowdarklings(j) {
    var c = newChar(),
      levels = Array.isArray(j.levels) ? j.levels : [],
      bonuses = Array.isArray(j.bonuses) ? j.bonuses : [];
    c.name = str(j.name, 80);
    c.ancestry = str(j.ancestry, 60);
    c.cls = str(j['class'], 60);
    c.title = str(j.title, 60);
    c.level = n(j.level, 0, 20) || 1;
    c.xp = n(j.XP, 0, 9999);
    c.alignment = str(j.alignment, 20);
    c.background = str(j.background, 80);
    c.deity = str(j.deity, 80);
    c.languages = str(j.languages, 300);
    AB.forEach(function (a) {
      c.stats[a] = n((j.stats || {})[a] != null ? j.stats[a] : (j.rolledStats || {})[a], 1, 30);
    });
    c.hpMax = n(j.maxHitPoints, 1, 999);
    c.ac = n(j.armorClass, 0, 40) || 10;
    c.slotsMax = n(j.gearSlotsTotal, 0, 99);
    c.coins = { gp: n(j.gold, 0, 1e7), sp: n(j.silver, 0, 1e7), cp: n(j.copper, 0, 1e7) };
    // what each rolled talent says, from the levels the character went through
    var said = {};
    levels.forEach(function (l) {
      if (l && l.talentRolledName) said[l.talentRolledName] = str(l.talentRolledDesc, 500);
      if (l && l.Rolled12ChosenTalentName) said[l.Rolled12ChosenTalentName] = str(l.Rolled12ChosenTalentDesc, 500);
    });
    var seen = {};
    bonuses.forEach(function (b) {
      if (!b || !b.name) return;
      var name = String(b.name);
      if (/^Spell:/.test(name)) {
        var tier = /Tier:\s*(\d)/.exec(b.bonusTo || '') || /Tier\s*(\d)/.exec(name);
        c.spells.push({ id: uid(), n: str(b.bonusName, 80), tier: tier ? +tier[1] : 1, lost: false, note: '' });
        return;
      }
      if (/^(ExtraLanguage|ExtraLanguageManual|GrantSpecialTalent):/.test(name)) return;
      if (name === 'Plus1ToCastingSpells' || b.bonusName === 'Plus1ToCastingSpells')
        c.spellBonus = (+c.spellBonus || 0) + 1;
      var desc = said[name] || said[b.bonusName] || '',
        label = desc
          ? words(b.bonusName || name)
          : words(b.bonusName || name) +
            (b.bonusTo && b.bonusTo !== b.bonusName ? ' (' + str(b.bonusTo, 60) + ')' : ''),
        key = label + '|' + desc;
      if (seen[key]) return;
      seen[key] = 1;
      c.talents.push({
        id: uid(),
        n: label,
        t: desc,
        lvl: n(b.gainedAtLevel, 0, 20),
        src: str([b.sourceType, b.sourceName].filter(Boolean).join(' · '), 60)
      });
    });
    // spells listed only by name
    String(j.spellsKnown || '')
      .split(/\s*,\s*/)
      .forEach(function (s) {
        if (
          s &&
          !c.spells.some(function (x) {
            return x.n.toLowerCase() === s.toLowerCase();
          })
        )
          c.spells.push({ id: uid(), n: str(s, 80), tier: 1, lost: false, note: '' });
      });
    if (/wizard/i.test(c.cls)) c.spellStat = 'INT';
    else if (/priest/i.test(c.cls)) c.spellStat = 'WIS';
    (Array.isArray(j.gear) ? j.gear : []).forEach(function (g) {
      if (!g || !g.name || g.name === 'Coins') return;
      c.gear.push({ id: uid(), n: str(g.name, 80), qty: n(g.quantity, 0, 999) || 1, slots: +g.slots || 0, note: '' });
      if (g.type === 'weapon')
        c.attacks.push({
          id: uid(),
          n: str(g.name, 80),
          stat: /bow|sling|crossbow|dart/i.test(g.name) ? 'DEX' : 'STR',
          extra: 0,
          dmg: '',
          note: ''
        });
    });
    (Array.isArray(j.treasures) ? j.treasures : []).forEach(function (t) {
      if (t && t.name)
        c.gear.push({ id: uid(), n: str(t.name, 80), qty: 1, slots: +t.slots || 0, note: str(t.desc, 300) });
    });
    (Array.isArray(j.magicItems) ? j.magicItems : []).forEach(function (m) {
      if (m && m.name)
        c.gear.push({
          id: uid(),
          n: str(m.name, 80),
          qty: 1,
          slots: +m.slots || 1,
          note: str(m.spellDesc || m.desc, 300)
        });
    });
    c.notes = 'Imported from Shadowdarklings.net on ' + new Date().toLocaleDateString() + '.';
    return c;
  }

  // ---------- the screens ----------
  root.SDUI = function (api) {
    var esc = api.esc,
      btn = api.btn,
      ui = api.ui,
      store = api.store;
    function S() {
      return (store.sd = store.sd || { chars: [], cur: '' });
    }
    var U = (ui.sd = ui.sd || { tab: 'char', roll: '', msg: '' });
    function cur() {
      var s = S();
      if (!s.chars.length) {
        var c = newChar();
        s.chars.push(c);
        s.cur = c.id;
      }
      var x = s.chars.filter(function (c) {
        return c.id === s.cur;
      })[0];
      if (!x) {
        x = s.chars[0];
        s.cur = x.id;
      }
      x.track = x.track || { hp: null, conds: {}, torch: null };
      return x;
    }
    function field(path, v, label, ph, type, wide) {
      var id = 'sd-' + path.replace(/\W/g, '-');
      return (
        '<label class="field' +
        (wide ? ' wide' : '') +
        '"><span>' +
        esc(label) +
        '</span><input id="' +
        id +
        '" ' +
        (type === 'number' ? 'type="number" data-sdn="' : 'type="text" data-sdf="') +
        path +
        '" value="' +
        esc(v == null ? '' : v) +
        '" placeholder="' +
        esc(ph || '') +
        '"></label>'
      );
    }
    function area(path, v, label, ph, rows) {
      return (
        '<label class="field"><span>' +
        esc(label) +
        '</span><textarea id="sd-' +
        path.replace(/\W/g, '-') +
        '" data-sdf="' +
        path +
        '" rows="' +
        (rows || 3) +
        '" placeholder="' +
        esc(ph || '') +
        '">' +
        esc(v || '') +
        '</textarea></label>'
      );
    }
    var TABS = [
      ['char', 'Character'],
      ['talents', 'Talents & spells'],
      ['gear', 'Gear'],
      ['notes', 'Notes'],
      ['play', 'Session']
    ];
    var LINKS_P =
      '<p class="small">Make characters on <a href="https://shadowdarklings.net" target="_blank" rel="noopener">Shadowdarklings.net</a> (free account), export them as JSON and import them here. The free <a href="https://www.thearcanelibrary.com/products/shadowdark-rpg-quickstart-set-pdf" target="_blank" rel="noopener">Shadowdark Quickstart</a> has the rules; add it, or your own rulebook PDF, in <b>Books</b> to look things up during play (it stays on this device).</p>';

    function home() {
      return (
        '<main class="home"><h1>Shadowdark</h1><p class="muted">Your table companion: the sheet, the light, luck and the GM’s table. Tap the d20 to roll.</p>' +
        root.homeHub([
          ['sd-chars', 'sword', 'Characters'],
          ['dm', 'eye', 'GM'],
          ['books', 'book', 'Books'],
          ['audio', 'lute', 'Audio'],
          ['rules', 'scroll', 'House rules']
        ]) +
        (root.BKP ? root.BKP.homeLine() : '') +
        '<div class="panel sd-about"><h3>Useful tools</h3>' +
        linksHtml('player') +
        LINKS_P +
        '<p class="small muted">' +
        esc(NOTICE) +
        '</p></div></main>'
      );
    }
    function top(c) {
      var s = S();
      return (
        '<div class="toolbar mm-top"><select data-sdchar="1" aria-label="Character">' +
        s.chars
          .map(function (x) {
            return (
              '<option value="' +
              x.id +
              '"' +
              (x.id === c.id ? ' selected' : '') +
              '>' +
              esc(x.name || 'Unnamed character') +
              (x.fromTable ? ' 📱' : '') +
              '</option>'
            );
          })
          .join('') +
        '</select>' +
        btn('sdNew', '+ New', {}, 'btn small') +
        btn('sdImport', '⇩ Import from Shadowdarklings', {}, 'btn small') +
        btn('sdDup', 'Duplicate', {}, 'btn small') +
        (U.confirmDel
          ? btn('sdDel', 'Delete ' + esc(c.name || 'this character') + '?', {}, 'btn small danger') +
            btn('sdDelNo', 'Keep', {}, 'btn small')
          : btn('sdDelAsk', 'Delete', {}, 'btn small')) +
        '<input type="file" id="sdImportFile" accept=".json,application/json" hidden></div>' +
        (U.msg ? '<p class="panel small rest-msg">' + esc(U.msg) + '</p>' : '') +
        (U.reimport
          ? '<div class="panel bk-confirm"><p><b>' +
            esc(c.name) +
            '</b> is already here. Update it from Shadowdarklings (level, stats, talents, spells, gear), keeping your hit points, luck, notes and the damage you typed? Or add it as a new character?</p><div class="toolbar">' +
            btn('sdReUpdate', 'Update ' + esc(c.name), {}, 'btn primary') +
            btn('sdReNew', 'Add as new', {}, 'btn') +
            btn('sdReNo', 'Cancel', {}, 'btn') +
            '</div></div>'
          : '') +
        (c.fromTable
          ? '<p class="panel small rest-msg">📱 ' +
            esc((c.fromTable.player || 'A player') + '’s sheet, sent from their phone') +
            '. It is replaced each time they connect to your table.</p>'
          : '')
      );
    }
    function chars() {
      var c = cur(),
        d = derive(c),
        body = { char: charTab, talents: talentsTab, gear: gearTab, notes: notesTab, play: playTab }[U.tab] || charTab;
      return (
        '<main class="mm-main sd-main">' +
        top(c) +
        '<div class="sd-bar"><b>' +
        esc(c.name || 'Unnamed') +
        '</b><span>' +
        esc([c.ancestry, c.cls, c.level ? 'level ' + c.level : ''].filter(Boolean).join(' · ')) +
        '</span><span>HP <b>' +
        d.hp +
        '</b>/' +
        (+c.hpMax || 0) +
        '</span><span>AC <b>' +
        (+c.ac || 0) +
        '</b></span><span>Luck <b>' +
        (+c.luck || 0) +
        '</b></span><span' +
        (d.over ? ' class="bad"' : '') +
        '>Slots <b>' +
        d.used +
        '</b>/' +
        d.slots +
        '</span></div>' +
        '<nav class="steps mm-tabs">' +
        TABS.map(function (t) {
          return btn('sdTab', t[1], { v: t[0] }, 'step' + (U.tab === t[0] ? ' on' : ''));
        }).join('') +
        '</nav><div class="mm-body">' +
        body(c, d) +
        '</div></main>'
      );
    }
    function charTab(c, d) {
      var h =
        '<div class="panel"><h3>Who</h3><div class="row">' +
        field('name', c.name, 'Name', 'Character name') +
        field('title', c.title, 'Title', 'From your class and level') +
        '</div><div class="row">' +
        field('ancestry', c.ancestry, 'Ancestry', 'Human, dwarf, elf…') +
        field('cls', c.cls, 'Class', 'Fighter, priest, thief, wizard…') +
        '</div><div class="row">' +
        field('level', c.level, 'Level', '', 'number') +
        field('xp', c.xp, 'XP (next level at ' + d.next + ')', '', 'number') +
        '</div><div class="row">' +
        field('background', c.background, 'Background', '') +
        field('deity', c.deity, 'Deity', '') +
        '</div>' +
        field('languages', c.languages, 'Languages', 'Common, …', null, true) +
        '<div class="field"><span>Alignment</span><div class="pills">' +
        ALIGN.map(function (a) {
          return btn('sdAlign', a, { v: a }, 'pill small' + (c.alignment === a ? ' on' : ''));
        }).join('') +
        '</div></div>' +
        (+c.xp >= d.next && c.level < 10
          ? '<p class="notice">Enough XP for the next level: see Session, Level up.</p>'
          : '') +
        '</div>';
      h +=
        '<div class="panel"><h3>Stats</h3><div class="sd-stats">' +
        AB.map(function (a) {
          return (
            '<label class="sd-stat"><span>' +
            a +
            '</span><input type="number" min="1" max="30" id="sd-st-' +
            a +
            '" data-sdn="stats.' +
            a +
            '" value="' +
            (+c.stats[a] || 0) +
            '"><b>' +
            fmt(d.mods[a]) +
            '</b></label>'
          );
        }).join('') +
        '</div><div class="toolbar">' +
        btn('sdRollStats', '🎲 Roll 3d6 for each, in order', {}, 'btn small') +
        (U.statsAsk
          ? btn('sdRollStats', 'Replace all six?', { v: 'yes' }, 'btn small danger') +
            btn('sdRollNo', 'Keep them', {}, 'btn small')
          : '') +
        '</div>' +
        (U.rolled ? '<p class="small rest-msg">' + esc(U.rolled) + '</p>' : '') +
        '</div>';
      h +=
        '<div class="panel"><h3>Defense</h3><div class="row">' +
        field('hpMax', c.hpMax, 'Hit points (maximum)', '', 'number') +
        field('ac', c.ac, 'Armor class', '', 'number') +
        '</div>' +
        field('acNote', c.acNote, 'Armor', 'What you wear, shield…', null, true) +
        '</div>';
      h +=
        '<div class="panel"><h3>Attacks</h3>' +
        (d.attacks.length
          ? d.attacks
              .map(function (x, i) {
                var a = x.a;
                return (
                  '<div class="sd-atk"><div class="row">' +
                  field('attacks.' + i + '.n', a.n, 'Weapon or attack', 'Longsword') +
                  field('attacks.' + i + '.dmg', a.dmg, 'Damage', '1d8') +
                  '</div><div class="toolbar"><span class="small">Uses</span>' +
                  ['STR', 'DEX', '']
                    .map(function (s) {
                      return btn(
                        'sdAtkStat',
                        s || 'none',
                        { v: i, s: s },
                        'pill small' + ((a.stat || '') === s ? ' on' : '')
                      );
                    })
                    .join('') +
                  '<label class="small">Extra <input type="number" id="sd-atk-x-' +
                  i +
                  '" data-sdn="attacks.' +
                  i +
                  '.extra" value="' +
                  (+a.extra || 0) +
                  '" style="width:4rem"></label><b>Attack ' +
                  fmt(x.bonus) +
                  '</b><span class="spacer"></span>' +
                  btn('sdRm', '✕', { v: 'attacks', i: i }, 'btn small') +
                  '</div></div>'
                );
              })
              .join('')
          : '<p class="small muted">No attacks yet.</p>') +
        btn('sdAdd', '+ Add an attack', { v: 'attacks' }, 'btn small') +
        '<p class="small muted">Attack = the stat’s modifier + extra (talents, magic weapons). Damage as in your book.</p></div>';
      return h;
    }
    function talentsTab(c, d) {
      var h =
        '<div class="panel"><h3>Talents and class features</h3>' +
        (c.talents.length
          ? c.talents
              .map(function (t, i) {
                return (
                  '<div class="sd-item"><div class="row">' +
                  field('talents.' + i + '.n', t.n, 'Name', '') +
                  field('talents.' + i + '.lvl', t.lvl, 'Gained at level', '', 'number') +
                  '</div>' +
                  area('talents.' + i + '.t', t.t, 'What it does', 'In your own words, or as your book says', 2) +
                  '<div class="toolbar">' +
                  (t.src ? '<span class="small muted">' + esc(t.src) + '</span>' : '') +
                  '<span class="spacer"></span>' +
                  btn('sdRm', 'Remove', { v: 'talents', i: i }, 'btn small') +
                  '</div></div>'
                );
              })
              .join('')
          : '<p class="small muted">Add your class features and the talents you rolled.</p>') +
        btn('sdAdd', '+ Add a talent', { v: 'talents' }, 'btn small') +
        '</div>';
      h +=
        '<div class="panel"><h3>Spells</h3><div class="toolbar"><span class="small">Spellcasting stat</span>' +
        ['INT', 'WIS', 'CHA', '']
          .map(function (s) {
            return btn('sdSpellStat', s || 'none', { v: s }, 'pill small' + ((c.spellStat || '') === s ? ' on' : ''));
          })
          .join('') +
        (c.spellStat
          ? '<label class="small">Extra <input type="number" id="sd-spb" data-sdn="spellBonus" value="' +
            (+c.spellBonus || 0) +
            '" style="width:4rem"></label><b>Spellcasting ' +
            fmt(d.spell) +
            '</b>'
          : '') +
        '</div>' +
        (c.spells.length
          ? c.spells
              .map(function (s, i) {
                return (
                  '<div class="sd-item"><div class="row">' +
                  field('spells.' + i + '.n', s.n, 'Spell', '') +
                  field('spells.' + i + '.tier', s.tier, 'Tier', '', 'number') +
                  '</div>' +
                  area('spells.' + i + '.note', s.note, 'Notes', 'Range, duration, what it does (from your book)', 2) +
                  '<div class="toolbar"><span class="spacer"></span>' +
                  btn('sdRm', 'Remove', { v: 'spells', i: i }, 'btn small') +
                  '</div></div>'
                );
              })
              .join('')
          : '<p class="small muted">No spells. Add the ones your character knows.</p>') +
        btn('sdAdd', '+ Add a spell', { v: 'spells' }, 'btn small') +
        '</div>';
      return h;
    }
    function gearTab(c, d) {
      return (
        '<div class="panel"><h3>Gear slots <span class="' +
        (d.over ? 'bad' : 'muted') +
        '">' +
        d.used +
        ' / ' +
        d.slots +
        '</span></h3>' +
        (d.over ? '<p class="notice">Over your gear slots: you are carrying too much.</p>' : '') +
        '<div class="sd-gear">' +
        c.gear
          .map(function (g, i) {
            return (
              '<div class="sd-grow"><input type="text" id="sd-g-n-' +
              i +
              '" data-sdf="gear.' +
              i +
              '.n" value="' +
              esc(g.n) +
              '" placeholder="Item" aria-label="Item"><input type="number" min="0" id="sd-g-q-' +
              i +
              '" data-sdn="gear.' +
              i +
              '.qty" value="' +
              (+g.qty || 0) +
              '" aria-label="How many" title="How many"><input type="number" min="0" step="0.5" id="sd-g-s-' +
              i +
              '" data-sdn="gear.' +
              i +
              '.slots" value="' +
              (+g.slots || 0) +
              '" aria-label="Slots" title="Slots it takes">' +
              btn('sdRm', '✕', { v: 'gear', i: i }, 'btn small') +
              '<input type="text" class="sd-gnote" id="sd-g-t-' +
              i +
              '" data-sdf="gear.' +
              i +
              '.note" value="' +
              esc(g.note || '') +
              '" placeholder="Note" aria-label="Note"></div>'
            );
          })
          .join('') +
        '</div><div class="small muted sd-ghead">Item · how many · slots it takes</div>' +
        btn('sdAdd', '+ Add an item', { v: 'gear' }, 'btn small') +
        '<div class="row" style="margin-top:.6rem">' +
        field('slotsMax', c.slotsMax || '', 'Total slots (empty: STR or 10, the higher)', String(d.slots), 'number') +
        '</div></div><div class="panel"><h3>Coins</h3><div class="row">' +
        field('coins.gp', c.coins.gp, 'Gold (gp)', '', 'number') +
        field('coins.sp', c.coins.sp, 'Silver (sp)', '', 'number') +
        field('coins.cp', c.coins.cp, 'Copper (cp)', '', 'number') +
        '</div></div>'
      );
    }
    function notesTab(c) {
      var css = root.NoteStyle ? root.NoteStyle.css(c.noteStyle) : '';
      return (
        '<div class="panel"><h3>Notes</h3><label class="field"><span>Your notes</span><textarea id="sd-notes" data-sdf="notes" rows="10" style="' +
        css +
        '">' +
        esc(c.notes || '') +
        '</textarea></label></div>' +
        (root.NoteStyle
          ? '<div class="panel"><h3>How your notes look</h3>' +
            root.NoteStyle.picker(c.noteStyle, 'sdNoteStyle') +
            '</div>'
          : '')
      );
    }
    // what the GM's table sees and does (js/table-ui.js)
    function who(c, d) {
      var T = c.track;
      return {
        key: c.id,
        gm: 'GM',
        name: c.name,
        init: d.mods.DEX,
        bonus: function (a) {
          return a.kind === 'check' || a.kind === 'save' ? d.mods[a.key] || 0 : 0;
        },
        status: function () {
          var bon = {};
          AB.forEach(function (a) {
            bon[a] = d.mods[a];
          });
          return {
            hp: d.hp,
            max: +c.hpMax || 0,
            ac: +c.ac || 0,
            conds: Object.keys(T.conds || {}),
            txt: 'Level ' + (c.level || 1) + ' · luck ' + (+c.luck || 0),
            bon: bon
          };
        },
        take: function (g) {
          ['gp', 'sp', 'cp'].forEach(function (k) {
            var v = Math.max(0, Math.min(1e7, Math.floor(+(g.coins || {})[k] || 0)));
            if (v) c.coins[k] = (+c.coins[k] || 0) + v;
          });
          (g.items || []).slice(0, 20).forEach(function (i) {
            if (i && i.n) c.gear.push({ id: uid(), n: str(i.n, 80), qty: 1, slots: 1, note: 'From the GM' });
          });
        },
        effect: function (f) {
          if (f.k === 'dmg' || f.k === 'heal') {
            var v = Math.abs(+f.n || 0);
            setHp(c, d.hp + (f.k === 'dmg' ? -v : v), f.k === 'dmg');
            return {
              msg:
                (f.k === 'dmg' ? 'You take ' + v + ' damage.' : 'You heal ' + v + ' hit points.') +
                (T.hp === 0 ? ' You are at 0 HP!' : '')
            };
          }
          if (f.k === 'cond') {
            T.conds = T.conds || {};
            if (f.on) T.conds[f.c] = 1;
            else delete T.conds[f.c];
            return { msg: (f.on ? 'You are now ' : 'No longer ') + String(f.c).toLowerCase() + '.' };
          }
          if (f.k === 'insp') {
            c.luck = (+c.luck || 0) + 1;
            return { msg: 'The GM gives you a luck token! 🍀' };
          }
          if (f.k === 'rest') {
            rest(c);
            return { msg: 'You rest: hit points back to full, and your lost spells come back.' };
          }
          if (f.k === 'xp') {
            c.xp = (+c.xp || 0) + (+f.n || 0);
            return { msg: 'You gain ' + f.n + ' XP (now ' + c.xp + ').', level: c.xp >= (+c.level || 1) * 10 };
          }
          if (f.k === 'level') return { msg: 'The GM says: level up!', level: true };
          return null;
        },
        levelUp: function () {
          U.tab = 'play';
          U.lvl = { hp: '', tn: '', tt: '' };
        },
        notes: function () {
          return c.notes ? [{ id: 'notes', title: (c.name || 'Character') + ' notes', text: c.notes }] : [];
        },
        addNote: function (title, text) {
          c.notes = (c.notes ? c.notes + '\n\n' : '') + String(title || 'From the table') + ':\n' + String(text || '');
        },
        rest: [['long', 'Rest']],
        style: c.noteStyle,
        sheet: function () {
          var x = JSON.parse(JSON.stringify(c));
          delete x.notes;
          return { game: 'sd', data: x };
        }
      };
    }
    // hit points change: at 0 the dying countdown starts, above 0 it ends; a hit while focusing asks for a check
    function setHp(c, hp, hurt) {
      var T = c.track,
        was = derive(c).hp;
      T.hp = Math.max(0, Math.min(+c.hpMax || 0, hp));
      T.conds = T.conds || {};
      if (T.hp === 0 && was > 0) {
        T.conds.Dying = 1;
        T.dying = { left: '', turns: 0 };
      } else if (T.hp > 0 && T.dying) {
        delete T.conds.Dying;
        T.dying = null;
      }
      if (hurt && T.focus && T.hp > 0) T.focusHit = true;
      if (T.hp === 0 && T.focus) T.focus = null;
    }
    // a torch in the gear: one fewer (its slots shrink with it)
    function useTorch(c) {
      var g = (c.gear || []).filter(function (x) {
        return /torch/i.test(x.n || '') && +x.qty > 0;
      })[0];
      if (!g) return 'No torch in your gear: lit anyway.';
      var q = +g.qty;
      if (+g.slots > 0) g.slots = Math.round(((+g.slots * (q - 1)) / q) * 2) / 2;
      g.qty = q - 1;
      return g.qty ? 'One torch used: ' + g.qty + ' left.' : 'That was your last torch!';
    }
    function rest(c) {
      c.track.hp = null;
      c.track.dying = null;
      if (c.track.conds) delete c.track.conds.Dying;
      (c.spells || []).forEach(function (s) {
        s.lost = false;
      });
    }
    function rollBtn(label, bonus, l) {
      return btn('sdRoll', esc(label) + ' ' + fmt(bonus), { v: bonus, l: l || label }, 'btn small');
    }
    function playTab(c, d) {
      var T = c.track,
        h = '<h2>Session</h2>' + (api.tp ? api.tp.html(who(c, d)) : '');
      if (U.lvl)
        h +=
          '<div class="panel levelup"><h3>⬆ Level ' +
          (+c.level || 1) +
          ' → ' +
          ((+c.level || 1) + 1) +
          '</h3><p class="small">Roll your class’s hit die and add your Constitution modifier (' +
          fmt(d.mods.CON) +
          '); you gain at least 1. Then roll on your class’s talent table if your book says so at this level.</p><div class="row">' +
          '<label class="field"><span>Hit points gained</span><input type="number" min="1" id="sd-lvl-hp" data-sdlvl="hp" value="' +
          esc(U.lvl.hp) +
          '"></label><label class="field"><span>New talent (optional)</span><input type="text" id="sd-lvl-tn" data-sdlvl="tn" value="' +
          esc(U.lvl.tn) +
          '" placeholder="Talent name"></label></div>' +
          '<label class="field"><span>What it does</span><input type="text" id="sd-lvl-tt" data-sdlvl="tt" value="' +
          esc(U.lvl.tt) +
          '"></label><div class="toolbar">' +
          btn('sdLvlOk', '✓ Level up', {}, 'btn primary') +
          btn('sdLvlNo', 'Cancel', {}, 'btn') +
          '</div></div>';
      h +=
        '<div class="panel"><h3>❤ Hit points</h3><div class="sd-hp"><b>' +
        d.hp +
        '</b> / ' +
        (+c.hpMax || 0) +
        '</div><div class="toolbar">' +
        ['-5', '-1', '+1', '+5']
          .map(function (v) {
            return btn('sdHp', v.replace('-', '−'), { v: v }, 'btn small');
          })
          .join('') +
        btn('sdRest', '☾ Rest', {}, 'btn small') +
        (U.lvl ? '' : btn('sdLvl', '⬆ Level up', {}, 'btn small primary')) +
        '</div>' +
        '</div>';
      if (T.dying) {
        var Dy = T.dying;
        h +=
          '<div class="panel sd-dying"><h3>💀 Dying</h3>' +
          (Dy.stable
            ? '<p>Stabilized: you stay at 0 HP but no longer count down.</p>'
            : '<p class="small">How many rounds you have is in your book (it uses your Constitution). Type it, then tap <b>Next turn</b> each time your turn comes.</p><div class="toolbar"><label class="small">Rounds left <input type="number" min="0" id="sd-die-left" data-sdn="track.dying.left" value="' +
              esc(Dy.left) +
              '" style="width:4.5rem"></label>' +
              btn('sdDieTurn', 'Next turn', {}, 'btn small primary') +
              btn('sdRoll', '🎲 d20', { v: 0, l: 'Dying roll' }, 'btn small') +
              '</div>' +
              (Dy.left !== '' && +Dy.left === 0
                ? '<p class="notice">No rounds left: see your book.</p>'
                : '<p class="small muted">Turns so far: ' + (+Dy.turns || 0) + '</p>')) +
          '<div class="toolbar">' +
          (Dy.stable ? '' : btn('sdDieStable', 'Stabilized', {}, 'btn small')) +
          btn('sdDieUp', 'Back up (1 HP)', {}, 'btn small') +
          '</div></div>';
      }
      if (T.focus) {
        var fdc = 10 + (+T.focus.tier || 1);
        h +=
          '<div class="panel sd-focus"><h3>🎯 Focusing on ' +
          esc(T.focus.n || 'a spell') +
          '</h3>' +
          (T.focusHit
            ? '<p class="notice">You were hurt while focusing: does your focus hold? Check your book.</p>'
            : '<p class="small">Each of your turns, roll to keep it going (DC ' + fdc + ').</p>') +
          '<div class="toolbar">' +
          (d.spell != null
            ? btn(
                'sdRoll',
                '🎲 Focus check ' + fmt(d.spell),
                { v: d.spell, l: 'Focus: ' + T.focus.n + ' (DC ' + fdc + ')' },
                'btn small primary'
              )
            : '') +
          (T.focusHit ? btn('sdFocusKeep', 'It holds', {}, 'btn small') : '') +
          btn('sdFocusDrop', 'Drop it', {}, 'btn small') +
          '</div></div>';
      }
      h +=
        '<div class="panel"><h3>🍀 Luck tokens</h3><div class="toolbar">' +
        btn('sdLuck', '−', { v: -1 }, 'btn') +
        '<b class="mm-hpts">' +
        (+c.luck || 0) +
        '</b>' +
        btn('sdLuck', '+', { v: 1 }, 'btn') +
        '</div></div>';
      h +=
        '<div class="panel"><h3>Your light</h3>' +
        (root.Torch ? root.Torch.html(T.torch, 'sdTorch', esc, btn, T.torch ? T.torch.n : 'Torch') : '') +
        (U.torchMsg ? '<p class="small rest-msg">' + esc(U.torchMsg) + '</p>' : '') +
        (function () {
          var t = (c.gear || []).reduce(function (n, g) {
            return /torch/i.test(g.n || '') ? n + (+g.qty || 0) : n;
          }, 0);
          return (
            '<p class="small">Torches in your gear: <b' +
            (t <= 1 ? ' class="bad"' : '') +
            '>' +
            t +
            '</b>' +
            (t === 1 ? ' (your last one!)' : '') +
            '</p>'
          );
        })() +
        (!T.torch || !root.Torch.left(T.torch)
          ? '<div class="toolbar"><input type="text" id="sd-light-n" data-sdui="lightName" value="' +
            esc(U.lightName || '') +
            '" placeholder="Lantern, light spell…" style="flex:1;min-width:9rem">' +
            btn('sdTorch', 'Light it (1 hour)', { v: 'other' }, 'btn small') +
            '</div>'
          : '') +
        '<p class="small muted">Lighting a torch takes one from your gear. A lantern or a spell doesn’t. When your GM runs the party’s light at the table, it shows in the table box above.</p></div>';
      h +=
        '<div class="panel"><h3>Checks</h3><div class="toolbar">' +
        AB.map(function (a) {
          return rollBtn(a, d.mods[a], AB_NAME[a] + ' check');
        }).join('') +
        '</div>' +
        (d.attacks.length
          ? '<h4>Attacks</h4><ul class="lines">' +
            d.attacks
              .map(function (x) {
                return (
                  '<li>' +
                  rollBtn(x.a.n || 'Attack', x.bonus, (x.a.n || 'Attack') + ' attack') +
                  (x.a.dmg ? ' <span class="small">damage <b>' + esc(x.a.dmg) + '</b></span>' : '') +
                  '</li>'
                );
              })
              .join('') +
            '</ul>'
          : '') +
        (U.roll ? '<p class="rest-msg">' + esc(U.roll) + '</p>' : '') +
        '</div>';
      if (c.spells.length)
        h +=
          '<div class="panel"><h3>Spells</h3><ul class="lines">' +
          c.spells
            .map(function (s, i) {
              var dc = 10 + (+s.tier || 1);
              return (
                '<li class="' +
                (s.lost ? 'sd-lost' : '') +
                '"><b>' +
                esc(s.n || 'Spell') +
                '</b> <span class="small muted">tier ' +
                (+s.tier || 1) +
                ', DC ' +
                dc +
                '</span> ' +
                (d.spell != null && !s.lost
                  ? btn('sdRoll', '🎲 Cast ' + fmt(d.spell), { v: d.spell, l: s.n + ' (DC ' + dc + ')' }, 'btn small')
                  : '') +
                (!s.lost
                  ? btn(
                      'sdFocus',
                      T.focus && T.focus.id === s.id ? '🎯 Focusing' : 'Focus',
                      { v: i },
                      'btn small' + (T.focus && T.focus.id === s.id ? ' primary' : '')
                    )
                  : '') +
                btn(
                  'sdLost',
                  s.lost ? 'Lost — get it back' : 'Lost it',
                  { v: i },
                  'btn small' + (s.lost ? ' danger' : '')
                ) +
                '</li>'
              );
            })
            .join('') +
          '</ul><p class="small muted">A spell you lose comes back when you rest.</p></div>';
      var on = T.conds || {};
      h +=
        '<div class="panel"><h3>Conditions</h3><div class="pills">' +
        CONDS.map(function (x) {
          return btn('sdCond', x, { v: x }, 'pill small' + (on[x] ? ' on' : ''));
        }).join('') +
        '</div></div>';
      return h;
    }

    // ---------- changes ----------
    function walk(obj, path) {
      var k = String(path).split('.'),
        o = obj;
      for (var i = 0; i < k.length - 1; i++) {
        if (o[k[i]] == null) o[k[i]] = /^\d+$/.test(k[i + 1]) ? [] : {};
        o = o[k[i]];
      }
      return [o, k[k.length - 1]];
    }
    function list(c, k) {
      return k === 'attacks' || k === 'talents' || k === 'spells' || k === 'gear' ? c[k] : null;
    }
    function importFile(input) {
      var f = input.files && input.files[0];
      if (!f) return;
      var r = new FileReader();
      r.onload = function () {
        input.value = '';
        var o = null;
        try {
          o = JSON.parse(r.result);
        } catch (e) {
          o = null;
        }
        if (!isShadowdarklings(o)) U.msg = 'That file isn’t a Shadowdarklings character (export it as JSON there).';
        else addImported(o);
        api.render();
      };
      r.readAsText(f);
    }
    // the same character again (by name): update it, keeping what happens in play
    var KEEP = ['id', 'track', 'luck', 'notes', 'noteStyle', 'fromTable'];
    function updateFrom(old, c) {
      KEEP.forEach(function (k) {
        if (old[k] !== undefined) c[k] = old[k];
      });
      // spells keep being lost or not, attacks keep the damage you typed
      c.spells.forEach(function (s) {
        var o = (old.spells || []).filter(function (x) {
          return (x.n || '').toLowerCase() === (s.n || '').toLowerCase();
        })[0];
        if (o) {
          s.lost = o.lost;
          s.note = o.note || s.note;
          s.tier = o.tier || s.tier;
        }
      });
      c.attacks.forEach(function (a) {
        var o = (old.attacks || []).filter(function (x) {
          return (x.n || '').toLowerCase() === (a.n || '').toLowerCase();
        })[0];
        if (o) {
          a.dmg = o.dmg;
          a.extra = o.extra;
          a.stat = o.stat;
          a.note = o.note;
        }
      });
      // attacks and talents typed by hand stay
      (old.attacks || []).forEach(function (a) {
        if (
          !c.attacks.some(function (x) {
            return (x.n || '').toLowerCase() === (a.n || '').toLowerCase();
          })
        )
          c.attacks.push(a);
      });
      if (old.spellStat) c.spellStat = old.spellStat;
      if (+old.spellBonus > +c.spellBonus) c.spellBonus = old.spellBonus;
      if (c.track && c.track.hp != null && c.track.hp > c.hpMax) c.track.hp = c.hpMax;
      return c;
    }
    function addImported(o) {
      var c = fromShadowdarklings(o),
        s = S(),
        same = s.chars.filter(function (x) {
          return !x.fromTable && x.name && c.name && x.name.toLowerCase() === c.name.toLowerCase();
        })[0];
      if (same) {
        U.reimport = { o: o, id: same.id };
        s.cur = same.id;
        U.msg = '';
        ui.section = 'sd-chars';
        return;
      }
      addNew(c);
    }
    function addNew(c) {
      var s = S(),
        blank = s.chars.length === 1 && !s.chars[0].name && !s.chars[0].cls;
      if (blank) s.chars = [];
      s.chars.push(c);
      s.cur = c.id;
      U.tab = 'char';
      U.msg =
        (c.name || 'The character') +
        ' is here: ' +
        c.talents.length +
        ' talents, ' +
        c.spells.length +
        ' spells, ' +
        c.gear.length +
        ' items. Check the attacks’ damage and the talents’ text against your book.';
      ui.section = 'sd-chars';
      api.save();
    }
    function dice(sides) {
      var a = new Uint32Array(1);
      crypto.getRandomValues(a);
      return 1 + (a[0] % sides);
    }
    var actions = {
      sdTab: function (v) {
        U.tab = v;
        U.msg = '';
      },
      sdNew: function () {
        var c = newChar();
        S().chars.push(c);
        S().cur = c.id;
        U.tab = 'char';
        U.msg = '';
      },
      sdDup: function () {
        var c = JSON.parse(JSON.stringify(cur()));
        c.id = uid();
        c.name = (c.name || 'Character') + ' (copy)';
        delete c.fromTable;
        S().chars.push(c);
        S().cur = c.id;
      },
      sdReUpdate: function () {
        var R = U.reimport,
          s = S();
        U.reimport = null;
        if (!R) return;
        var i = s.chars
          .map(function (x) {
            return x.id;
          })
          .indexOf(R.id);
        if (i < 0) return;
        var c = updateFrom(s.chars[i], fromShadowdarklings(R.o));
        s.chars[i] = c;
        s.cur = c.id;
        U.msg = (c.name || 'The character') + ' is updated (level ' + c.level + ').';
      },
      sdReNew: function () {
        var R = U.reimport;
        U.reimport = null;
        if (R) addNew(fromShadowdarklings(R.o));
      },
      sdReNo: function () {
        U.reimport = null;
      },
      sdDelAsk: function () {
        U.confirmDel = true;
      },
      sdDelNo: function () {
        U.confirmDel = false;
      },
      sdDel: function () {
        var s = S(),
          id = cur().id;
        s.chars = s.chars.filter(function (c) {
          return c.id !== id;
        });
        s.cur = s.chars[0] ? s.chars[0].id : '';
        U.confirmDel = false;
      },
      sdImport: function () {
        document.getElementById('sdImportFile').click();
        return false;
      },
      sdAlign: function (v) {
        var c = cur();
        c.alignment = c.alignment === v ? '' : v;
      },
      sdRollStats: function (v) {
        var c = cur(),
          set = AB.some(function (a) {
            return +c.stats[a] !== 10;
          });
        if (set && v !== 'yes') {
          U.statsAsk = true;
          return;
        }
        U.statsAsk = false;
        var got = AB.map(function (a) {
          var r = [dice(6), dice(6), dice(6)];
          c.stats[a] = r[0] + r[1] + r[2];
          return a + ' ' + c.stats[a] + ' (' + r.join('+') + ')';
        });
        U.rolled = 'Rolled: ' + got.join(', ') + '.';
      },
      sdRollNo: function () {
        U.statsAsk = false;
      },
      sdAdd: function (v) {
        var c = cur(),
          L = list(c, v);
        if (!L) return;
        L.push(
          v === 'attacks'
            ? { id: uid(), n: '', stat: 'STR', extra: 0, dmg: '', note: '' }
            : v === 'talents'
              ? { id: uid(), n: '', t: '', lvl: +c.level || 1 }
              : v === 'spells'
                ? { id: uid(), n: '', tier: 1, lost: false, note: '' }
                : { id: uid(), n: '', qty: 1, slots: 1, note: '' }
        );
      },
      sdRm: function (v, el) {
        var L = list(cur(), v);
        if (L) L.splice(+el.getAttribute('data-i'), 1);
      },
      sdAtkStat: function (v, el) {
        var a = cur().attacks[+v];
        if (a) a.stat = el.getAttribute('data-s');
      },
      sdSpellStat: function (v) {
        cur().spellStat = v;
      },
      sdNoteStyle: function (v, el) {
        var c = cur();
        c.noteStyle = c.noteStyle || {};
        c.noteStyle[el.getAttribute('data-k')] = v;
      },
      sdHp: function (v) {
        var c = cur();
        setHp(c, derive(c).hp + +v, +v < 0);
      },
      // dying: the rounds left (from the player's book), one less each turn
      sdDieTurn: function () {
        var D = cur().track.dying;
        if (!D) return;
        D.turns = (+D.turns || 0) + 1;
        if (+D.left > 0) D.left = +D.left - 1;
      },
      sdDieUp: function () {
        var c = cur();
        setHp(c, 1);
        U.roll = 'Back on your feet with 1 hit point.';
      },
      sdDieStable: function () {
        var T = cur().track;
        if (T.dying) T.dying.stable = true;
      },
      // a focus spell: one at a time
      sdFocus: function (v) {
        var T = cur().track,
          s = cur().spells[+v];
        T.focus = s && (!T.focus || T.focus.id !== s.id) ? { id: s.id, n: s.n, tier: +s.tier || 1 } : null;
        T.focusHit = false;
      },
      sdFocusDrop: function () {
        var T = cur().track;
        T.focus = null;
        T.focusHit = false;
      },
      sdFocusKeep: function () {
        cur().track.focusHit = false;
      },
      sdRest: function () {
        rest(cur());
        U.roll = 'Rested: hit points back to full, lost spells back.';
      },
      sdLuck: function (v) {
        var c = cur();
        c.luck = Math.max(0, (+c.luck || 0) + +v);
      },
      sdLost: function (v) {
        var s = cur().spells[+v];
        if (s) s.lost = !s.lost;
      },
      sdCond: function (v) {
        var T = cur().track;
        T.conds = T.conds || {};
        if (T.conds[v]) delete T.conds[v];
        else T.conds[v] = 1;
      },
      sdTorch: function (v) {
        var c = cur(),
          T = c.track;
        if (v === 'start') U.torchMsg = useTorch(c);
        else if (v !== 'plus' && v !== 'minus') U.torchMsg = '';
        if (v === 'other') {
          T.torch = root.Torch.change(null, 'start', String(U.lightName || '').trim() || 'Lantern');
          return;
        }
        T.torch = root.Torch.change(T.torch, v, 'Torch');
      },
      sdRoll: function (v, el) {
        var b = +v || 0,
          l = el.getAttribute('data-l') || 'Roll';
        if (root.Dice3D) {
          root.Dice3D.roll({ d20: 1 }, b, l);
          return false;
        }
        var r = dice(20);
        U.roll =
          l + ': ' + r + ' ' + fmt(b) + ' = ' + (r + b) + (r === 20 ? ' (natural 20!)' : r === 1 ? ' (natural 1)' : '');
        root.dispatchEvent(new CustomEvent('cf-roll', { detail: { label: l, total: r + b, detail: 'd20 ' + r } }));
      },
      sdLvl: function () {
        U.lvl = { hp: '', tn: '', tt: '' };
      },
      sdLvlNo: function () {
        U.lvl = null;
      },
      sdLvlOk: function () {
        var c = cur(),
          d = derive(c),
          L = U.lvl || {},
          gain = Math.max(1, Math.round(+L.hp) || 0);
        if (!L.hp) {
          U.msg = 'Type the hit points you rolled first.';
          return;
        }
        c.level = (+c.level || 1) + 1;
        c.hpMax = (+c.hpMax || 0) + gain;
        if (c.track.hp != null) c.track.hp = d.hp + gain;
        if (String(L.tn || '').trim()) c.talents.push({ id: uid(), n: str(L.tn, 80), t: str(L.tt, 500), lvl: c.level });
        U.lvl = null;
        U.msg = 'Level ' + c.level + '! +' + gain + ' hit points.';
      }
    };
    function onInput(t) {
      var su = t.getAttribute('data-sdui');
      if (su) {
        U[su] = t.value;
        return 'none';
      }
      var lv = t.getAttribute('data-sdlvl');
      if (lv != null) {
        U.lvl = U.lvl || {};
        U.lvl[lv] = t.value;
        return 'none';
      }
      var f = t.getAttribute('data-sdf'),
        nn = t.getAttribute('data-sdn');
      if (f == null && nn == null) return null;
      var w = walk(cur(), f != null ? f : nn);
      w[0][w[1]] = f != null ? t.value : t.value === '' ? 0 : +t.value;
      return 'save';
    }
    function onChange(t) {
      if (t.id === 'sdImportFile') {
        importFile(t);
        return 'none';
      }
      if (t.getAttribute('data-sdchar')) {
        S().cur = t.value;
        U.confirmDel = false;
        U.msg = '';
        return 'render';
      }
      if (t.getAttribute('data-sdn') != null || t.getAttribute('data-sdf') != null) return 'render';
      if (t.getAttribute('data-sdlvl') != null) return 'none';
      return null;
    }
    function html(section) {
      return section === 'sd-home' ? home() : chars();
    }
    function title(section) {
      return section === 'sd-home' ? 'Shadowdark' : (cur().name || 'Characters') + ' — Shadowdark';
    }
    // open a character (a player's sheet from the table)
    function open(id) {
      S().cur = id;
      U.tab = 'char';
    }
    return {
      html: html,
      actions: actions,
      onInput: onInput,
      onChange: onChange,
      title: title,
      open: open,
      addImported: addImported
    };
  };
  root.SDRules = {
    newChar: newChar,
    derive: derive,
    isShadowdarklings: isShadowdarklings,
    fromShadowdarklings: fromShadowdarklings,
    NOTICE: NOTICE,
    links: linksHtml
  };
  if (typeof module !== 'undefined') module.exports = root.SDRules;
})(typeof window !== 'undefined' ? window : globalThis);
