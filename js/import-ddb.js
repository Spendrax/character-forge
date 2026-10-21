// Import a character from D&D Beyond: the JSON its character page loads for a public character
// (character-service.dndbeyond.com/character/v5/character/<id>). It is turned into the same shape as a
// 5e Companion character, so the Companion importer builds it: lineage, background, classes and subclasses,
// ability scores, skills, languages, tools, feats, armour, weapons, inventory, coins, personality, notes and spells.
(function (root) {
  'use strict';
  var ABN = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
  var ALIGN = [
    '',
    'Lawful Good',
    'Neutral Good',
    'Chaotic Good',
    'Lawful Neutral',
    'Neutral',
    'Chaotic Neutral',
    'Lawful Evil',
    'Neutral Evil',
    'Chaotic Evil'
  ];
  var SKILLS = [
    'acrobatics',
    'animal-handling',
    'arcana',
    'athletics',
    'deception',
    'history',
    'insight',
    'intimidation',
    'investigation',
    'medicine',
    'nature',
    'perception',
    'performance',
    'persuasion',
    'religion',
    'sleight-of-hand',
    'stealth',
    'survival'
  ];
  var NOT_TOOL =
    /saving-throws|^(simple|martial)-weapons|armor$|^shields$|^self$|^(dagger|dart|sling|quarterstaff|club|javelin|mace|sickle|spear|handaxe|light-hammer|greatclub|crossbow-light|crossbow-hand|crossbow-heavy|shortbow|longbow|longsword|shortsword|rapier|scimitar|battleaxe|warhammer|greataxe|greatsword|glaive|halberd|lance|maul|morningstar|pike|trident|war-pick|whip|flail|blowgun|net)$/;

  // D&D Beyond item text is HTML: keep paragraphs, bold and italics as Markdown, drop the rest
  function plainText(h) {
    return String(h || '')
      .replace(/<\/?(strong|b)>/gi, '**')
      .replace(/<\/?(em|i)>/gi, '*')
      .replace(/<li[^>]*>/gi, '\n- ')
      .replace(/<\/(p|div|h\d|tr)>|<br\s*\/?>/gi, '\n\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;|&rsquo;/g, '’')
      .replace(/\*\*\s*\*\*/g, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }
  function unwrap(o) {
    return o && o.data && o.data.classes ? o.data : o;
  }
  function isDDB(o) {
    o = unwrap(o);
    return (
      !!o && typeof o === 'object' && Array.isArray(o.classes) && Array.isArray(o.stats) && !!o.race && !!o.modifiers
    );
  }
  function detect(o) {
    return isDDB(o) || (o && o.success === false && o.data == null && /character/i.test(o.message || ''));
  }
  // "https://www.dndbeyond.com/characters/12345678/abc" → "12345678"
  function idFrom(s) {
    var m =
      String(s || '').match(/characters\/(\d+)/) ||
      String(s || '')
        .trim()
        .match(/^(\d{4,12})$/);
    return m ? m[1] : '';
  }

  function mods(d) {
    var all = [];
    Object.keys(d.modifiers || {}).forEach(function (k) {
      (d.modifiers[k] || []).forEach(function (m) {
        all.push(m);
      });
    });
    return all;
  }
  function scores(d) {
    var M = mods(d),
      out = {};
    ABN.forEach(function (a, i) {
      var id = i + 1,
        pick = function (arr) {
          var x = (arr || []).filter(function (s) {
            return s.id === id;
          })[0];
          return x && x.value != null ? +x.value : null;
        };
      var ov = pick(d.overrideStats);
      if (ov != null) {
        out[a] = ov;
        return;
      }
      var v = (pick(d.stats) || 10) + (pick(d.bonusStats) || 0);
      M.forEach(function (m) {
        if (m.type === 'bonus' && m.subType === a + '-score') v += +m.value || 0;
      });
      M.forEach(function (m) {
        if (m.type === 'set' && m.subType === a + '-score' && +m.value > v) v = +m.value;
      });
      out[a] = v;
    });
    return out;
  }

  function toCompanion(d) {
    var M = mods(d),
      sc = scores(d),
      c = { jsonType: 'character', jobs: [] };
    ABN.forEach(function (a) {
      c[a] = { score: sc[a] };
    });
    c.alignmentName = ALIGN[d.alignmentId] || '';
    var prof = {},
      exp = {};
    M.forEach(function (m) {
      if (m.type === 'proficiency' && SKILLS.indexOf(m.subType) >= 0) prof[m.subType] = 1;
      if (m.type === 'expertise' && SKILLS.indexOf(m.subType) >= 0) exp[m.subType] = 1;
    });
    c.skills = SKILLS.filter(function (s) {
      return prof[s] || exp[s];
    }).map(function (s) {
      return { typeName: s.replace(/-/g, ' '), proficiencyName: exp[s] ? 'EXPERTISE' : 'PROFICIENT' };
    });
    c.proficiencies = [];
    M.forEach(function (m) {
      if (m.type === 'language')
        c.proficiencies.push({ typeName: 'LANGUAGE', name: m.friendlySubtypeName || m.subType });
      else if (m.type === 'proficiency' && SKILLS.indexOf(m.subType) < 0 && !NOT_TOOL.test(m.subType))
        c.proficiencies.push({ typeName: 'TOOL', name: m.friendlySubtypeName || m.subType });
    });
    c.feats = (d.feats || [])
      .map(function (f) {
        return { name: (f.definition || {}).name || '' };
      })
      .filter(function (f) {
        return f.name;
      });
    // gear: worn armour and shield, wielded weapons, everything else in the pack
    c.armors = [];
    c.weapons = [];
    c.equipment = [];
    (d.inventory || []).forEach(function (it) {
      var df = it.definition || {},
        n = df.name || '',
        qty = +it.quantity || 1;
      if (!n || qty <= 0) return;
      var magic = !!df.magic,
        shield = df.armorTypeId === 4 || df.type === 'Shield' || df.baseArmorName === 'Shield';
      if (df.filterType === 'Armor' && it.equipped) {
        c.armors.push({
          name: shield ? 'Shield' : df.baseArmorName || n,
          category: shield ? 'Shield' : ['', 'Light', 'Medium', 'Heavy'][df.armorTypeId] || '',
          armor: shield ? 2 : +df.armorClass || 10,
          equipped: true,
          weight: df.weight
        });
        if (magic)
          c.equipment.push({
            name: n,
            amount: 1,
            isAttuned: !!it.isAttuned,
            description: '',
            desc: plainText(df.description)
          });
        return;
      }
      if (df.filterType === 'Weapon' && it.equipped) {
        c.weapons.push({ name: magic && df.type ? df.type : n, isProficient: true });
        if (magic)
          c.equipment.push({
            name: n,
            amount: 1,
            isAttuned: !!it.isAttuned,
            description: '',
            desc: plainText(df.description)
          });
        return;
      }
      c.equipment.push({
        name: n,
        amount: qty,
        isAttuned: !!it.isAttuned,
        item: { requiresAttunement: !!df.canAttune },
        description: '',
        desc: magic || df.filterType !== 'Other Gear' ? plainText(df.description) : ''
      });
    });
    var cur = d.currencies || {};
    c.platinum = +cur.pp || 0;
    c.gold = +cur.gp || 0;
    c.electrum = +cur.ep || 0;
    c.silver = +cur.sp || 0;
    c.copper = +cur.cp || 0;
    var T = d.traits || {},
      N = d.notes || {};
    c.personalityTraits = T.personalityTraits || '';
    c.ideals = T.ideals || '';
    c.bonds = T.bonds || '';
    c.flaws = T.flaws || '';
    c.about = N.backstory || '';
    c.notes = [
      ['Other notes', N.otherNotes],
      ['Allies', N.allies],
      ['Organizations', N.organizations],
      ['Enemies', N.enemies],
      ['Personal possessions', N.personalPossessions],
      ['Other holdings', N.otherHoldings]
    ]
      .filter(function (x) {
        return x[1];
      })
      .map(function (x) {
        return { text: x[0] + ': ' + x[1] };
      });
    if (T.appearance) c.notes.push({ text: 'Appearance: ' + T.appearance });
    c.baseHp = d.overrideHitPoints || d.baseHitPoints || 0;
    return c;
  }

  function read(o) {
    var d = unwrap(o);
    if (!isDDB(d)) return [];
    var sp = function (s) {
      var df = s.definition || {};
      return {
        name: String(df.name || '').trim(),
        level: +df.level || 0,
        prepared: !!(s.prepared || s.alwaysPrepared)
      };
    };
    var classes = (d.classes || [])
      .slice()
      .sort(function (a, b) {
        return (b.isStartingClass ? 1 : 0) - (a.isStartingClass ? 1 : 0);
      })
      .map(function (k) {
        var list = (d.classSpells || []).filter(function (x) {
          return x.characterClassId === k.id;
        })[0];
        return {
          name: (k.definition || {}).name || '',
          jobId: String((k.definition || {}).name || '').toLowerCase(),
          sub: (k.subclassDefinition || {}).name || '',
          level: +k.level || 1,
          spells: (list ? list.spells : []).map(sp).filter(function (s) {
            return s.name;
          })
        };
      });
    var loose = [];
    Object.keys(d.spells || {}).forEach(function (k) {
      (d.spells[k] || []).forEach(function (s) {
        var x = sp(s);
        x.prepared = true;
        if (x.name) loose.push(x);
      });
    });
    var race = d.race || {},
      bg = d.background || {};
    var raw = toCompanion(d);
    return [
      {
        id: 1,
        source: 'companion',
        label: 'D&D Beyond',
        name: d.name || 'Imported character',
        race: race.isSubRace ? race.baseRaceName || race.baseName : race.baseName || race.fullName || '',
        subrace: race.isSubRace ? race.subRaceShortName || '' : '',
        classes: classes,
        loose: loose,
        raw: raw,
        bgName: (bg.definition || {}).name || (bg.customBackground || {}).name || '',
        avatar: (d.decorations || {}).avatarUrl || race.avatarUrl || ''
      }
    ];
  }

  root.ImportDDB = {
    detect: detect,
    isDDB: isDDB,
    read: read,
    idFrom: idFrom,
    scores: scores,
    plainText: plainText,
    url: function (id) {
      return 'https://character-service.dndbeyond.com/character/v5/character/' + id;
    }
  };
  if (typeof module !== 'undefined') module.exports = root.ImportDDB;
})(typeof window !== 'undefined' ? window : globalThis);
