// Pathfinder 2e (pre-Remaster) rules engine: works out a character sheet from the choices made.
// The rules text and the machine-readable "rules" on each feat and feature come from data/pf2/*.js
// (built from the Foundry VTT pf2e system, OGL). This file reads those rules the same way:
// proficiency upgrades, bonuses, choices and granted items, so every class, feat and item follows its own text.
(function (root) {
  'use strict';
  // Starfinder 2e: Computers and Piloting, its three spellcasting classes (the mystic's and the witchwarper's tradition
  // comes from their connection or paradox), and item grades in place of runes (from the Foundry sf2e system's config).
  var SF2_GAME = {
    data: 'SF2DATA',
    game: 'sf2',
    skills: { com: ['Computers', 'int'], pil: ['Piloting', 'dex'] },
    casters: {
      technomancer: { trad: 'arcane', type: 'prepared', table: 'full2', cantrips: 5, book: true },
      mystic: { trad: 'flag:mystic', type: 'spontaneous', table: 'full3', cantrips: 5 },
      witchwarper: { trad: 'flag:witchwarper', type: 'spontaneous', table: 'full3', cantrips: 5 }
    },
    archCasters: { technomancer: 'arcane', mystic: 'flag:mystic', witchwarper: 'flag:witchwarper' },
    archType: { mystic: 'spontaneous', witchwarper: 'spontaneous' },
    // grade → [tracking (item bonus to attack), damage dice] for weapons; [AC bonus, resilient] for armor
    weaponGrades: {
      commercial: [0, 1],
      tactical: [1, 1],
      advanced: [1, 2],
      superior: [2, 2],
      elite: [2, 3],
      ultimate: [3, 3],
      paragon: [3, 4]
    },
    armorGrades: {
      commercial: [0, 0],
      tactical: [1, 0],
      advanced: [1, 1],
      superior: [2, 1],
      elite: [2, 2],
      ultimate: [3, 2],
      paragon: [3, 3]
    }
  };
  // One engine per game: Pathfinder 2e (pre-Remaster) and Starfinder 2e (built on the Remaster rules) read the same kind
  // of data the same way; G says where the data is and what differs (skills, spellcasting classes, item grades).
  function make(G) {
    var AB = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
    var ABN = {
      str: 'Strength',
      dex: 'Dexterity',
      con: 'Constitution',
      int: 'Intelligence',
      wis: 'Wisdom',
      cha: 'Charisma'
    };
    var SK = {
      acr: ['Acrobatics', 'dex'],
      arc: ['Arcana', 'int'],
      ath: ['Athletics', 'str'],
      cra: ['Crafting', 'int'],
      dec: ['Deception', 'cha'],
      dip: ['Diplomacy', 'cha'],
      itm: ['Intimidation', 'cha'],
      med: ['Medicine', 'wis'],
      nat: ['Nature', 'wis'],
      occ: ['Occultism', 'int'],
      prf: ['Performance', 'cha'],
      rel: ['Religion', 'wis'],
      soc: ['Society', 'int'],
      ste: ['Stealth', 'dex'],
      sur: ['Survival', 'wis'],
      thi: ['Thievery', 'dex']
    };
    if (G.skills) Object.assign(SK, G.skills);
    var SKILLS = Object.keys(SK);
    var SKBYNAME = {};
    SKILLS.forEach(function (k) {
      SKBYNAME[SK[k][0].toLowerCase()] = k;
    });
    var RANK = ['Untrained', 'Trained', 'Expert', 'Master', 'Legendary'];
    var SAVES = { fortitude: 'con', reflex: 'dex', will: 'wis' };
    var TRAD = ['arcane', 'divine', 'occult', 'primal'];
    var STRIKING = { '': 0, striking: 1, greaterStriking: 2, majorStriking: 3 };
    var RESILIENT = { '': 0, resilient: 1, greaterResilient: 2, majorResilient: 3 };
    // Property runes that add damage (pre-Remaster names)
    var RUNE_DMG = {
      flaming: '1d6 fire',
      frost: '1d6 cold',
      shock: '1d6 electricity',
      thundering: '1d6 sonic',
      corrosive: '1d6 acid',
      holy: '1d6 good',
      unholy: '1d6 evil',
      anarchic: '1d6 chaotic',
      axiomatic: '1d6 lawful',
      wounding: '1d6 persistent bleed',
      impactful: '1d6 force',
      brilliant: '1d4 fire',
      serrating: '1d4 slashing',
      'greater flaming': '1d6 fire',
      'greater frost': '1d6 cold',
      'greater shock': '1d6 electricity',
      'greater thundering': '1d6 sonic',
      'greater corrosive': '1d6 acid',
      'greater impactful': '1d6 force',
      'greater brilliant': '1d4 fire',
      decaying: '1d4 persistent negative',
      'greater decaying': '1d4 persistent negative'
    };

    // Spell slots per day. full2: 2 slots when a rank opens, 3 after (bard, cleric, druid, oracle, witch, wizard).
    // full3: 3 then 4 (sorcerer). half: 1 then 2 (psychic). wave: magus and summoner (only the top two ranks from level 5).
    function slots(table, L) {
      var out = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      for (var r = 1; r <= 9; r++) {
        var open = 2 * r - 1;
        if (L < open) continue;
        var first = L === open;
        if (table === 'full2') out[r] = first ? 2 : 3;
        else if (table === 'full3') out[r] = first ? 3 : 4;
        else if (table === 'half') out[r] = first ? 1 : 2;
        else if (table === 'wave') {
          var top = Math.min(9, Math.ceil(L / 2));
          if (L <= 4) out[r] = first ? 1 : 2;
          else if (r >= top - 1) out[r] = 2;
        }
      }
      if (L >= 19 && table !== 'wave') out[10] = 1; // the 10th-rank slot from the class's level-19 feature
      return out;
    }
    // Class spellcasting (pre-Remaster). trad 'alias' = chosen by subclass (bloodline, patron, eidolon).
    var CASTERS = {
      bard: { trad: 'occult', type: 'spontaneous', table: 'full2', cantrips: 5 },
      cleric: { trad: 'divine', type: 'prepared', table: 'full2', cantrips: 5, font: true },
      druid: { trad: 'primal', type: 'prepared', table: 'full2', cantrips: 5 },
      wizard: { trad: 'arcane', type: 'prepared', table: 'full2', cantrips: 5, book: true, school: true },
      witch: { trad: 'alias:witch', type: 'prepared', table: 'full2', cantrips: 5, familiar: true },
      sorcerer: { trad: 'alias:sorcerer', type: 'spontaneous', table: 'full3', cantrips: 5 },
      oracle: { trad: 'divine', type: 'spontaneous', table: 'full2', cantrips: 5 },
      psychic: { trad: 'occult', type: 'spontaneous', table: 'half', cantrips: 3 },
      magus: { trad: 'arcane', type: 'prepared', table: 'wave', cantrips: 5, book: true },
      summoner: { trad: 'alias:summoner', type: 'spontaneous', table: 'wave', cantrips: 5 }
    };
    // Multiclass archetypes that give spellcasting: dedication = cantrips; basic/expert/master = slots.
    var ARCH_CASTERS = {
      bard: 'occult',
      cleric: 'divine',
      druid: 'primal',
      wizard: 'arcane',
      witch: 'alias:witch',
      sorcerer: 'alias:sorcerer',
      oracle: 'divine',
      psychic: 'occult',
      magus: 'arcane',
      summoner: 'alias:summoner'
    };
    var ARCH_TYPE = {
      bard: 'spontaneous',
      sorcerer: 'spontaneous',
      oracle: 'spontaneous',
      psychic: 'spontaneous',
      summoner: 'spontaneous'
    };

    // ---------- the data, indexed ----------
    // Starfinder item grades work like fundamental runes: a weapon's tracking bonus and damage dice, armor's bonus and resilience
    function gradeRunes(g, e, kind) {
      var r = (g && g.runes) || {},
        gr = (g && g.grade) || (e && e.grade),
        T = kind === 'armor' ? G.armorGrades : G.weaponGrades;
      if (!T || !gr || !T[gr]) return r;
      var x = T[gr];
      return Object.assign(
        {},
        r,
        kind === 'armor'
          ? { pot: x[0], res: ['', 'resilient', 'greaterResilient', 'majorResilient'][x[1]] }
          : { pot: x[0], str: ['', 'striking', 'greaterStriking', 'majorStriking'][x[1] - 1] }
      );
    }
    if (G.casters) CASTERS = G.casters; // each game's own spellcasting classes
    if (G.archCasters) ARCH_CASTERS = G.archCasters;
    if (G.archType) ARCH_TYPE = G.archType;
    // Remaster data names skills in full (system.skills.athletics.rank); the engine keeps them by code (ath)
    function skillPath(p) {
      return typeof p === 'string'
        ? p.replace(/^system\.skills\.([a-z]+)(?=\.|$)/, function (m, n) {
            return 'system.skills.' + (SKBYNAME[n] || n);
          })
        : p;
    }
    function skillCode(n) {
      return SK[n] ? n : SKBYNAME[String(n).toLowerCase()] || n;
    }
    var IX = null;
    function D() {
      return root[G.data] || {};
    }
    function index() {
      var P = D();
      if (!P.core) return null;
      if (IX && IX.core === P.core && IX.feats === P.feats && IX.spells === P.spells && IX.items === P.items) return IX;
      IX = { core: P.core, feats: P.feats, spells: P.spells, items: P.items, by: {}, fid: {}, name: {} };
      var add = function (kind, list) {
        var b = (IX.by[kind] = {}),
          n = (IX.name[kind] = {});
        (list || []).forEach(function (e) {
          e._k = kind;
          b[e.id] = e;
          n[e.n.toLowerCase()] = n[e.n.toLowerCase()] || e;
          if (e.fid) IX.fid[e.fid] = e;
        });
      };
      [
        'ancestries',
        'heritages',
        'ancestryfeatures',
        'backgrounds',
        'classes',
        'classfeatures',
        'deities',
        'actions',
        'conditions'
      ].forEach(function (k) {
        add(k, P.core[k]);
      });
      add('feats', P.feats);
      add('spells', P.spells);
      add('items', P.items);
      return IX;
    }
    var PACK = {
      'feats-srd': ['feats', 'classfeatures'],
      classfeatures: ['classfeatures', 'feats'],
      'spells-srd': ['spells'],
      ancestryfeatures: ['ancestryfeatures', 'feats'],
      heritages: ['heritages'],
      actionspf2e: ['actions'],
      'equipment-srd': ['items'],
      deities: ['deities'],
      ancestries: ['ancestries'],
      backgrounds: ['backgrounds'],
      // Starfinder 2e pack names
      feats: ['feats', 'classfeatures'],
      'class-features': ['classfeatures', 'feats'],
      spells: ['spells'],
      'ancestry-features': ['ancestryfeatures', 'feats'],
      actions: ['actions'],
      equipment: ['items'],
      conditions: ['conditions']
    };
    function find(uuid) {
      var X = index();
      if (!X || !uuid || typeof uuid !== 'string') return null;
      var m = /^Compendium\.[ps]f2e\.([^.]+)\.(?:Item\.)?(.+)$/.exec(uuid);
      if (!m) return X.fid[uuid] || null;
      var kinds = PACK[m[1]];
      if (!kinds) return null;
      if (X.fid[m[2]]) return X.fid[m[2]];
      var nm = m[2].toLowerCase();
      for (var i = 0; i < kinds.length; i++) {
        var e = X.name[kinds[i]] && X.name[kinds[i]][nm];
        if (e) return e;
      }
      return null;
    }
    function byId(kind, id) {
      var X = index();
      return (X && X.by[kind] && X.by[kind][id]) || null;
    }
    function byName(kind, n) {
      var X = index();
      return (X && n && X.name[kind] && X.name[kind][String(n).toLowerCase()]) || null;
    }
    function slugify(s) {
      return String(s || '')
        .toLowerCase()
        .replace(/['’]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    }

    // ---------- a tiny actor, to apply rules to the way the data expects ----------
    function getPath(o, p) {
      var k = String(p).split('.');
      for (var i = 0; i < k.length; i++) {
        if (o == null) return undefined;
        o = o[k[i]];
      }
      return o;
    }
    function setPath(o, p, v) {
      var k = String(p).split('.');
      for (var i = 0; i < k.length - 1; i++) {
        if (o[k[i]] == null || typeof o[k[i]] !== 'object') o[k[i]] = {};
        o = o[k[i]];
      }
      o[k[k.length - 1]] = v;
    }

    // Values in rules: numbers, "@actor.level", ternary(gte(...)), or level brackets.
    function evalFormula(s, ctx) {
      var t = String(s)
        .replace(/@actor\.(flags\.[\w.]+|system\.(?!details\.level|abilities)[\w.]+)/g, function (_, p) {
          var v = ctx.A ? getPath(ctx.A, p) : 0;
          return typeof v === 'number' ? v : 0;
        })
        .replace(/@actor\.level|@actor\.system\.details\.level\.value/g, ctx.level)
        .replace(/@item\.level|@item\.system\.level\.value/g, ctx.itemLevel || 0)
        .replace(/@actor\.abilities\.(\w+)\.mod|@actor\.system\.abilities\.(\w+)\.mod/g, function (_, a, b) {
          return ctx.mods[a || b] || 0;
        })
        .replace(/@item\.badge\.value/g, 1)
        .replace(/@weapon\.system\.damage\.dice/g, ctx.dice || 1);
      if (!/^[\d\s+\-*/().,a-z]*$/.test(t)) return 0;
      if (/[a-z]/.test(t.replace(/\b(ternary|gte|gt|lte|lt|eq|max|min|floor|ceil|abs)\b/g, ''))) return 0;
      try {
        return Number(calc(t)) || 0;
      } catch (e) {
        return 0;
      }
    }
    // A small calculator for the rules' formulas: numbers, + − × ÷, brackets and a few functions.
    // (Not Function() or eval: the page's security policy forbids running text as code.)
    var FN = {
      ternary: function (c, a, b) {
        return c ? a : b;
      },
      gte: function (a, b) {
        return a >= b;
      },
      gt: function (a, b) {
        return a > b;
      },
      lte: function (a, b) {
        return a <= b;
      },
      lt: function (a, b) {
        return a < b;
      },
      eq: function (a, b) {
        return a === b;
      },
      max: Math.max,
      min: Math.min,
      floor: Math.floor,
      ceil: Math.ceil,
      abs: Math.abs
    };
    function calc(src) {
      var toks = String(src).match(/\d+(?:\.\d+)?|[a-z]+|[-+*/(),]/g) || [],
        i = 0;
      var peek = function () {
          return toks[i];
        },
        take = function (x) {
          if (x && toks[i] !== x) throw new Error('expected ' + x);
          return toks[i++];
        };
      function sum() {
        var v = product();
        while (peek() === '+' || peek() === '-') v = take() === '+' ? v + product() : v - product();
        return v;
      }
      function product() {
        var v = unary();
        while (peek() === '*' || peek() === '/') v = take() === '*' ? v * unary() : v / unary();
        return v;
      }
      function unary() {
        if (peek() === '-') {
          take();
          return -unary();
        }
        if (peek() === '+') {
          take();
          return unary();
        }
        return atom();
      }
      function atom() {
        var t = take();
        if (t == null) throw new Error('end');
        if (t === '(') {
          var v = sum();
          take(')');
          return v;
        }
        if (/^\d/.test(t)) return +t;
        if (!FN[t]) throw new Error('unknown ' + t);
        take('(');
        var args = [];
        if (peek() !== ')') {
          args.push(sum());
          while (peek() === ',') {
            take();
            args.push(sum());
          }
        }
        take(')');
        return FN[t].apply(null, args);
      }
      var v = sum();
      if (i !== toks.length) throw new Error('extra');
      return v;
    }

    // ---------- predicates ("feat:toughness", {"gte": ["self:level", 11]}, {"not": ...}) ----------
    function test(p, facts, extra) {
      if (p == null) return true;
      if (Array.isArray(p)) {
        for (var i = 0; i < p.length; i++) if (!test(p[i], facts, extra)) return false;
        return true;
      }
      if (typeof p === 'string') return !!(facts.has(p) || (extra && extra.has && extra.has(p)));
      if (p.not !== undefined) return !test(p.not, facts, extra);
      if (p.or)
        return p.or.some(function (x) {
          return test(x, facts, extra);
        });
      if (p.and)
        return p.and.every(function (x) {
          return test(x, facts, extra);
        });
      if (p.nor)
        return !p.nor.some(function (x) {
          return test(x, facts, extra);
        });
      var cmp = p.gte ? 'gte' : p.gt ? 'gt' : p.lte ? 'lte' : p.lt ? 'lt' : p.eq ? 'eq' : null;
      if (cmp) {
        var a = num(p[cmp][0], facts, extra),
          b = num(p[cmp][1], facts, extra);
        if (a == null || b == null) return false;
        return cmp === 'gte' ? a >= b : cmp === 'gt' ? a > b : cmp === 'lte' ? a <= b : cmp === 'lt' ? a < b : a === b;
      }
      return false;
    }
    function num(x, facts, extra) {
      if (typeof x === 'number') return x;
      if (extra && extra.num && extra.num[x] != null) return extra.num[x];
      if (facts.num && facts.num[x] != null) return facts.num[x];
      return /^-?\d+$/.test(String(x)) ? +x : null;
    }
    function Facts() {
      var s = {};
      return {
        add: function (k) {
          s[k] = 1;
        },
        has: function (k) {
          return !!s[k];
        },
        num: {},
        all: s
      };
    }

    // ---------- choices: the options a "choose one" rule offers ----------
    function itemFacts(e) {
      var f = Facts(),
        t = e.t || [];
      f.add('item:slug:' + e.id);
      f.add('item:type:' + (e._k === 'feats' || e._k === 'classfeatures' ? 'feat' : e._k));
      t.forEach(function (x) {
        f.add('item:trait:' + x);
        if (e._k === 'feats') f.add('item:ancestry:' + x);
      });
      (e.tags || []).forEach(function (x) {
        f.add('item:tag:' + x);
      });
      if (e.cat) f.add('item:category:' + e.cat);
      if (e.k === 'weapon') {
        if (e.grp) f.add('item:group:' + e.grp);
        if (e.base) f.add('item:base:' + e.base);
        if (e.cat) f.add('item:category:' + e.cat);
      }
      if (e._k === 'deities') f.add('item:category:' + (e.category || 'deity'));
      f.add('item:rarity:' + ({ u: 'uncommon', r: 'rare', q: 'unique' }[e.r] || 'common'));
      f.num['item:level'] = e.lv || 0;
      f.add('item:level:' + (e.lv || 0));
      return f;
    }
    function options(r, ctx) {
      var X = index(),
        c = r.choices,
        out = [];
      if (Array.isArray(c))
        return c.reduce(function (out, o) {
          if (o && (!o.predicate || /"skill:/.test(JSON.stringify(o.predicate)) || test(o.predicate, ctx.facts)))
            out.push({ value: o.value, label: o.label || String(o.value) });
          return out;
        }, []);
      if (typeof c === 'string') {
        if (/skills/i.test(c))
          return SKILLS.map(function (k) {
            return { value: k, label: SK[k][0] };
          });
        if (/weaponGroups/i.test(c))
          return [
            'axe',
            'bomb',
            'bow',
            'brawling',
            'club',
            'crossbow',
            'dart',
            'firearm',
            'flail',
            'hammer',
            'knife',
            'pick',
            'polearm',
            'shield',
            'sling',
            'spear',
            'sword'
          ].map(function (g) {
            return { value: g, label: g[0].toUpperCase() + g.slice(1) };
          });
        if (/attributes|abilities/i.test(c))
          return AB.map(function (a) {
            return { value: a, label: ABN[a] };
          });
        return [];
      }
      if (c && c.filter) {
        var type = c.itemType || 'feat',
          pool;
        if (type === 'feat') pool = (X.feats || []).concat(X.core.classfeatures);
        else if (type === 'deity') pool = X.core.deities;
        else if (type === 'ancestry') pool = X.core.ancestries;
        else if (type === 'heritage') pool = X.core.heritages;
        else if (type === 'spell') pool = X.spells || [];
        else
          pool = (X.items || []).filter(function (i) {
            return i.k === type;
          });
        pool.forEach(function (e) {
          if (!test(c.filter, Facts(), itemFacts(e))) return;
          out.push({
            value: c.slugsAsValues
              ? e.id
              : 'Compendium.pf2e.' +
                (e._k === 'spells'
                  ? 'spells-srd'
                  : e._k === 'classfeatures'
                    ? 'classfeatures'
                    : e._k === 'deities'
                      ? 'deities'
                      : 'feats-srd') +
                '.Item.' +
                (e.fid || e.n),
            label: e.n,
            e: e
          });
        });
        out.sort(function (a, b) {
          return a.label < b.label ? -1 : 1;
        });
      }
      return out;
    }

    // ---------- the character ----------
    function uid() {
      return 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
    }
    function newChar() {
      return {
        id: uid(),
        game: G.game,
        name: '',
        level: 1,
        xp: 0,
        ancestry: '',
        heritage: '',
        background: '',
        cls: '',
        key: '',
        boosts: { anc: [], ancAlt: false, bg: [], lv: {} },
        abAdj: {},
        choices: {},
        feats: {},
        skills: { L1: [], inc: {}, lores: [] },
        langs: [],
        deity: '',
        alignment: '',
        gender: '',
        age: '',
        notes: '',
        gear: [],
        money: G.game === 'sf2' ? { pp: 0, gp: 0, sp: 150, cp: 0 } : { pp: 0, gp: 15, sp: 0, cp: 0 }, // Starfinder: credits, kept as silver
        spells: {},
        track: { hp: null, temp: 0, hero: 1, focus: null, dying: 0, wounded: 0, conds: {} }
      };
    }

    function featSlots(cls, L) {
      var s = [];
      if (!cls) return s;
      var push = function (kind, lv) {
        if (lv <= L) s.push({ key: kind + lv, kind: kind, lv: lv });
      };
      (cls.ancestryFeatLevels || []).forEach(function (l) {
        push('anc', l);
      });
      (cls.classFeatLevels || []).forEach(function (l) {
        push('cls', l);
      });
      (cls.skillFeatLevels || []).forEach(function (l) {
        push('skill', l);
      });
      (cls.generalFeatLevels || []).forEach(function (l) {
        push('gen', l);
      });
      return s.sort(function (a, b) {
        return a.lv - b.lv;
      });
    }
    var BOOST_LEVELS = [1, 5, 10, 15, 20];

    function abilityScores(ch, anc, bg, cls, out) {
      var sc = {};
      AB.forEach(function (a) {
        sc[a] = 10;
      });
      var steps = [];
      var boost = function (a, why) {
        if (!sc.hasOwnProperty(a)) return;
        sc[a] += sc[a] >= 18 ? 1 : 2;
        steps.push([why, a, '+']);
      };
      var flaw = function (a, why) {
        if (!sc.hasOwnProperty(a)) return;
        sc[a] -= 2;
        steps.push([why, a, '−']);
      };
      var B = ch.boosts || {};
      var need = [];
      if (anc) {
        if (B.ancAlt) {
          [0, 1].forEach(function (i) {
            var a = (B.anc || [])[i];
            if (a) boost(a, 'Ancestry');
            else need.push('ancestry boost');
          });
        } else {
          var free = 0;
          anc.boosts.forEach(function (opts) {
            if (opts.length === 1) boost(opts[0], 'Ancestry');
            else {
              var a = (B.anc || [])[free++];
              if (a && opts.indexOf(a) >= 0) boost(a, 'Ancestry');
              else need.push('ancestry boost');
            }
          });
          anc.flaws.forEach(function (opts) {
            if (opts.length === 1) flaw(opts[0], 'Ancestry flaw');
          });
          (B.volFlaw || []).forEach(function (a) {
            flaw(a, 'Voluntary flaw');
          });
        }
      }
      if (bg)
        bg.boosts.forEach(function (opts, i) {
          var a = (B.bg || [])[i];
          if (a && opts.indexOf(a) >= 0) boost(a, 'Background');
          else need.push('background boost');
        });
      if (cls) {
        var k = cls.key.length === 1 ? cls.key[0] : ch.key;
        if (k) boost(k, 'Class');
        else need.push('key ability');
      }
      BOOST_LEVELS.forEach(function (l) {
        if (l > ch.level) return;
        var picks = (B.lv || {})[l] || [];
        picks.slice(0, 4).forEach(function (a) {
          boost(a, 'Level ' + l);
        });
        if (picks.length < 4)
          need.push(4 - picks.length + ' boost' + (picks.length === 3 ? '' : 's') + ' at level ' + l);
      });
      Object.keys(ch.abAdj || {}).forEach(function (a) {
        if (sc.hasOwnProperty(a) && +ch.abAdj[a]) {
          sc[a] += +ch.abAdj[a];
          steps.push(['Adjustment', a, ch.abAdj[a] > 0 ? '+' : '−']);
        }
      });
      out.scores = sc;
      out.boostSteps = steps;
      out.boostNeed = need;
      out.mods = {};
      AB.forEach(function (a) {
        out.mods[a] = Math.floor((sc[a] - 10) / 2);
      });
    }

    // ---------- derive the sheet ----------
    function derive(ch) {
      var X = index();
      var out = { ready: !!X, warnings: [], open: [], items: [], level: Math.max(1, Math.min(20, +ch.level || 1)) };
      if (!X) return out;
      var L = out.level;
      var anc = byId('ancestries', ch.ancestry),
        her = byId('heritages', ch.heritage),
        bg = byId('backgrounds', ch.background),
        cls = byId('classes', ch.cls);
      out.anc = anc;
      out.her = her;
      out.bg = bg;
      out.cls = cls;
      abilityScores(ch, anc, bg, cls, out);
      var mods = out.mods;
      // the actor the rules write to
      var A = {
        system: {
          details: { level: { value: L } },
          attributes: {
            perception: { rank: cls ? cls.perception : 0 },
            ancestryhp: anc ? anc.hp : 0,
            classhp: cls ? cls.hp : 0,
            speed: { value: anc ? anc.speed : 25 }
          },
          saves: {
            fortitude: { rank: cls ? cls.saves.fortitude : 0 },
            reflex: { rank: cls ? cls.saves.reflex : 0 },
            will: { rank: cls ? cls.saves.will : 0 }
          },
          skills: {},
          proficiencies: {
            attacks: { simple: { rank: 0 }, martial: { rank: 0 }, advanced: { rank: 0 }, unarmed: { rank: 0 } },
            defenses: { unarmored: { rank: 0 }, light: { rank: 0 }, medium: { rank: 0 }, heavy: { rank: 0 } },
            classDCs: {},
            traditions: { arcane: { rank: 0 }, divine: { rank: 0 }, occult: { rank: 0 }, primal: { rank: 0 } },
            aliases: {},
            spellcasting: { rank: 0 }
          },
          resources: { focus: { max: 0 } }
        },
        flags: { pf2e: {} }
      };
      SKILLS.forEach(function (k) {
        A.system.skills[k] = { rank: 0 };
      });
      if (cls) {
        ['simple', 'martial', 'advanced', 'unarmed'].forEach(function (k) {
          A.system.proficiencies.attacks[k].rank = cls.attacks[k] || 0;
        });
        ['unarmored', 'light', 'medium', 'heavy'].forEach(function (k) {
          A.system.proficiencies.defenses[k].rank = cls.defenses[k] || 0;
        });
        A.system.proficiencies.classDCs[cls.id] = { rank: cls.classDC };
      }
      // facts for predicates
      var F = Facts();
      F.num['self:level'] = L;
      if (anc) F.add('ancestry:' + anc.id);
      if (her) F.add('heritage:' + her.id);
      if (bg) F.add('background:' + bg.id);
      if (cls) F.add('class:' + cls.id);
      // ---------- gather items: ancestry, heritage, background, class, class features, feats, and what they grant ----------
      var items = [],
        seen = {};
      function add(e, key, from, lv) {
        if (!e || seen[key]) return null;
        seen[key] = 1;
        var it = { key: key, e: e, from: from || '', sel: {}, done: {}, lv: lv || 0 };
        items.push(it);
        if (e._k === 'feats') F.add('feat:' + e.id);
        if (e._k === 'classfeatures' || e._k === 'ancestryfeatures') F.add('feature:' + e.id);
        if (e._k === 'feats' && e.cat === 'classfeature') F.add('feature:' + e.id);
        return it;
      }
      if (anc) {
        add(anc, 'ancestry');
        (anc.feats || []).forEach(function (n) {
          add(byName('ancestryfeatures', n) || byName('feats', n), 'af:' + slugify(n), 'Ancestry');
        });
      }
      if (her) add(her, 'heritage');
      if (bg) {
        add(bg, 'background');
        (bg.feats || []).forEach(function (n) {
          add(byName('feats', n), 'bgfeat:' + slugify(n), 'Background', 1);
        });
      }
      if (cls) {
        add(cls, 'class');
        cls.features.forEach(function (f) {
          if (f[0] <= L)
            add(
              byName('classfeatures', f[1]) || byName('feats', f[1]),
              'cf:' + slugify(f[1]),
              cls.n + ' ' + f[0],
              f[0]
            );
        });
      }
      var slots = featSlots(cls, L);
      out.slots = slots;
      Object.keys(ch.feats || {}).forEach(function (k) {
        var lv = parseInt(String(k).replace(/^\D+/, ''), 10) || 1;
        if (/^(anc|cls|skill|gen)\d+$/.test(k) && lv > L) return; // a slot above the current level
        var e = byId('feats', ch.feats[k]);
        if (e) add(e, 'feat:' + k, k, lv);
      });
      // ---------- first passes: choices, actor flags and granted items (repeat until nothing new appears) ----------
      function subst(s, it) {
        if (typeof s !== 'string') return s;
        return s
          .replace(/\{item\|flags\.pf2e\.rulesSelections\.([\w-]+)\}/g, function (_, f) {
            var v = it.sel[f];
            return v == null ? '\u0000' : v;
          })
          .replace(/\{actor\|([^}]+)\}/g, function (_, p) {
            var v = getPath(A, p);
            return v == null ? '\u0000' : v;
          })
          .replace(/\{item\|(?:system\.)?level(?:\.value)?\}/g, it.lv || it.e.lv || 0);
      }
      function value(v, it) {
        if (v && typeof v === 'object' && v.brackets) {
          var f = String(v.field || 'actor|system.details.level.value'),
            x = /level/.test(f) ? L : getPath(A, f.replace(/^actor\|/, '')) || 0,
            r = null;
          v.brackets.forEach(function (b) {
            if ((b.start == null || x >= b.start) && (b.end == null || x <= b.end)) r = b.value;
          });
          return r;
        }
        if (typeof v === 'string') {
          var t = subst(v, it);
          if (t.indexOf('\u0000') >= 0) return null;
          return /^-?\d+(\.\d+)?$/.test(t)
            ? +t
            : /@|\(/.test(t)
              ? evalFormula(t, { level: L, mods: mods, itemLevel: it.lv, A: A })
              : t;
        }
        return v;
      }
      function applyAEL(r, it) {
        var p = skillPath(subst(r.path, it));
        if (!p || p.indexOf('\u0000') >= 0) return;
        var v = value(r.value, it);
        if (v == null) return;
        var cur = getPath(A, p),
          m = r.mode;
        if (m === 'upgrade') setPath(A, p, Math.max(+cur || 0, +v || 0));
        else if (m === 'downgrade') setPath(A, p, cur == null ? v : Math.min(+cur, +v));
        else if (m === 'add') {
          if (Array.isArray(cur)) cur.push(v);
          else if (typeof v === 'number' || cur == null || typeof cur === 'number')
            setPath(A, p, (+cur || 0) + (+v || 0));
          else setPath(A, p, v);
        } else if (m === 'subtract') setPath(A, p, (+cur || 0) - (+v || 0));
        else if (m === 'multiply') setPath(A, p, (+cur || 0) * (+v || 0));
        else setPath(A, p, v);
      }
      var early = function (r) {
        return r.key === 'ActiveEffectLike' && /^(flags\.|system\.proficiencies\.aliases)/.test(String(r.path));
      };
      for (var pass = 0; pass < 6; pass++) {
        var before = items.length,
          changed = false;
        for (var i = 0; i < items.length; i++) {
          var it = items[i],
            ru = it.e.ru || [];
          for (var j = 0; j < ru.length; j++) {
            var r = ru[j];
            if (r.key === 'ChoiceSet') {
              var fl = r.flag || 'c' + j,
                ck = it.key + '|' + fl;
              if (ch.choices && ch.choices[ck] != null) it.sel[fl] = ch.choices[ck];
            } else if (early(r) && !it.done[j] && test(r.predicate, F)) {
              var before2 = JSON.stringify(getPath(A, subst(r.path, it)) || null);
              applyAEL(r, it);
              if (JSON.stringify(getPath(A, subst(r.path, it)) || null) !== before2) changed = true;
              it.done[j] = 1;
            } else if (r.key === 'GrantItem' && !it.done[j] && test(r.predicate, F)) {
              var u = subst(r.uuid, it);
              if (u.indexOf('\u0000') >= 0) continue;
              var g = find(u);
              it.done[j] = 1;
              if (g && g._k !== 'spells') add(g, it.key + '>' + g.id, it.e.n, it.lv);
              else if (g) {
                it.spells = it.spells || [];
                it.spells.push(g);
              }
            }
          }
        }
        if (items.length === before && !changed) break;
      }
      // what's still to choose
      items.forEach(function (it) {
        (it.e.ru || []).forEach(function (r, j) {
          if (r.key !== 'ChoiceSet') return;
          var fl = r.flag || 'c' + j,
            ck = it.key + '|' + fl;
          if (!test(r.predicate, F)) return;
          var opts = options(r, { facts: F });
          if (!opts.length) return;
          var cur = it.sel[fl];
          out.open.push({
            key: ck,
            label: r.prompt && !/^PF2E\./.test(r.prompt) ? r.prompt : 'Choose for ' + it.e.n,
            item: it.e.n,
            itemKey: it.key,
            options: opts,
            value: cur == null ? '' : cur
          });
        });
      });
      out.items = items;
      // ---------- second pass: everything else ----------
      var M = []; // modifiers: {sel: [...], type, value, slug, pred, ability, label}
      var adjust = [],
        speeds = [],
        senses = [],
        resist = [],
        weak = [],
        immune = [],
        dexCaps = [],
        martial = [],
        strikes = [],
        dice = [];
      function addMod(r, it, src) {
        var sel = Array.isArray(r.selector) ? r.selector : [r.selector];
        M.push({
          sel: sel.map(function (s) {
            return subst(s, it);
          }),
          type: r.type || 'untyped',
          v: r.value,
          ability: r.ability,
          slug: r.slug || slugify(r.label || it.e.n),
          pred: r.predicate,
          label: r.label && !/^PF2E/.test(r.label) ? r.label : it.e.n,
          it: it,
          src: src
        });
      }
      function applyRules(list, it, src) {
        (list || []).forEach(function (r) {
          if (r.key === 'ChoiceSet' || r.key === 'GrantItem' || early(r)) return;
          if (r.key === 'ActiveEffectLike') {
            if (test(r.predicate, F)) applyAEL(r, it);
            return;
          }
          if (r.key === 'FlatModifier') {
            addMod(r, it, src);
            return;
          }
          if (r.key === 'AdjustModifier') {
            adjust.push({
              sel: [].concat(r.selector || r.selectors || []),
              slug: r.slug,
              mode: r.mode,
              v: r.value,
              pred: r.predicate,
              it: it
            });
            return;
          }
          if (r.key === 'DamageDice') {
            dice.push({ r: r, it: it });
            return;
          } // checked per strike (some only apply against an off-guard target)
          if (!test(r.predicate, F)) return;
          if (r.key === 'BaseSpeed') speeds.push({ type: subst(r.selector, it), v: value(r.value, it), from: it.e.n });
          else if (r.key === 'Sense') senses.push({ type: r.selector, acuity: r.acuity, range: r.range, from: it.e.n });
          else if (r.key === 'Resistance')
            resist.push({ type: subst([].concat(r.type).join(', '), it), v: value(r.value, it), from: it.e.n });
          else if (r.key === 'Weakness')
            weak.push({ type: [].concat(r.type).join(', '), v: value(r.value, it), from: it.e.n });
          else if (r.key === 'Immunity') immune.push({ type: [].concat(r.type).join(', '), from: it.e.n });
          else if (r.key === 'DexterityModifierCap') dexCaps.push(+value(r.value, it));
          else if (r.key === 'MartialProficiency')
            martial.push({ slug: r.slug, label: r.label, def: r.definition, rank: value(r.value, it) });
          else if (r.key === 'Strike') strikes.push({ r: r, it: it });
        });
      }
      items.forEach(function (it) {
        applyRules(it.e.ru, it);
      });
      // equipment: worn or invested items apply their rules; the worn armor and shield
      var gear = (ch.gear || [])
        .map(function (g) {
          return { g: g, e: byId('items', g.id) };
        })
        .filter(function (x) {
          return x.e || x.g.custom;
        });
      var armor = null,
        shield = null,
        invested = 0;
      gear.forEach(function (x) {
        var e = x.e;
        if (!e) return;
        if (e.k === 'armor' && e.cat !== 'shield' && x.g.worn) armor = armor || x;
        if (e.k === 'armor' && e.cat === 'shield' && x.g.worn) shield = shield || x;
        var inv = (e.t || []).indexOf('invested') >= 0;
        if (inv && x.g.worn) invested++;
        if (x.g.worn || (!inv && e.k !== 'weapon' && e.k !== 'armor' && /^worn/.test(e.use || '') && x.g.worn))
          applyRules(e.ru, { key: 'gear:' + e.id, e: e, sel: {}, lv: e.lv || 0 }, x);
      });
      out.armor = armor;
      out.shield = shield;
      out.invested = invested;
      // ---------- numbers ----------
      var prof = function (rank) {
        rank = +rank || 0;
        return rank > 0 ? L + 2 * rank : 0;
      };
      out.prof = prof;
      function modValue(m) {
        var v = m.v;
        if (m.ability) return mods[m.ability] || 0;
        if (typeof v === 'string')
          v = /@|\(/.test(v) ? evalFormula(v, { level: L, mods: mods, itemLevel: m.it.lv, A: A }) : +v;
        if (v && typeof v === 'object' && v.brackets) v = value(v, m.it);
        return +v || 0;
      }
      // Total of the modifiers for some selectors, with PF2 stacking: highest bonus and worst penalty of each type; untyped add up.
      function total(sels, extra, base) {
        var picked = {},
          list = [],
          parts = (base || []).slice();
        M.forEach(function (m) {
          if (
            !m.sel.some(function (s) {
              return sels.indexOf(s) >= 0;
            })
          )
            return;
          if (!test(m.pred, F, extra)) return;
          var v = modValue(m),
            adj = adjust.filter(function (a) {
              return (
                a.slug === m.slug &&
                a.sel.some(function (s) {
                  return sels.indexOf(s) >= 0;
                }) &&
                test(a.pred, F, extra)
              );
            });
          adj.forEach(function (a) {
            var av = +value(a.v, a.it) || 0;
            if (a.mode === 'upgrade') v = Math.max(v, av);
            else if (a.mode === 'override') v = av;
            else if (a.mode === 'add') v += av;
          });
          if (!v) return;
          list.push({ type: m.type, v: v, label: m.label, slug: m.slug, ability: m.ability });
        });
        list.forEach(function (m) {
          if (m.type === 'untyped' || m.type === 'proficiency') {
            parts.push(m);
            return;
          }
          var k = m.type + (m.v > 0 ? '+' : '-');
          if (!picked[k] || (m.v > 0 ? m.v > picked[k].v : m.v < picked[k].v)) picked[k] = m;
        });
        Object.keys(picked).forEach(function (k) {
          parts.push(picked[k]);
        });
        var sum = 0;
        parts.forEach(function (p) {
          sum += p.v;
        });
        return { v: sum, parts: parts };
      }
      out.total = total;
      var sys = A.system;
      // ability (score) changes from rules? (rare) — not applied; scores come from boosts.
      // HP
      var con = mods.con;
      var hpBase = (sys.attributes.ancestryhp || 0) + ((sys.attributes.classhp || 0) + con) * L;
      var hpMods = total(['hp']),
        hpLv = total(['hp-per-level']);
      out.hp = {
        max: Math.max(1, hpBase + hpMods.v + hpLv.v * L),
        parts: [
          { label: 'Ancestry', v: sys.attributes.ancestryhp || 0 },
          {
            label: '(Class ' + (sys.attributes.classhp || 0) + ' + Con ' + con + ') × ' + L,
            v: ((sys.attributes.classhp || 0) + con) * L
          }
        ].concat(hpMods.parts, hpLv.v ? [{ label: 'Per level', v: hpLv.v * L }] : [])
      };
      // armor
      var arm = armor && armor.e,
        aRunes = armor ? gradeRunes(armor.g, armor.e, 'armor') : {};
      var dexCap = arm ? (arm.dex == null ? 99 : arm.dex) : 99;
      dexCaps.forEach(function (c) {
        if (!arm) dexCap = Math.min(dexCap === 99 ? c : dexCap, c);
      });
      var aCat = arm ? arm.cat : 'unarmored';
      var strOk = !arm || !arm.strReq || out.scores.str >= arm.strReq * 2 + 10 || out.scores.str >= arm.strReq;
      if (arm && arm.strReq && arm.strReq < 10) strOk = out.scores.str >= 10 + arm.strReq * 2; // the data gives the Strength modifier needed
      out.checkPenalty = arm && !strOk ? arm.chk || 0 : 0;
      out.armorSpeedPenalty = arm ? Math.min(0, (arm.spd || 0) + (strOk && arm.spd ? 5 : 0)) : 0;
      var acRank = (sys.proficiencies.defenses[aCat] || { rank: 0 }).rank;
      var acItem = arm
        ? [
            {
              type: 'item',
              v: (arm.ac || 0) + (+aRunes.pot || 0),
              label: (aRunes.pot ? '+' + aRunes.pot + ' ' : '') + arm.n
            }
          ]
        : [];
      // runes etched onto worn bracers and similar (Pathbuilder lets you)
      var acT = total(
        ['ac', 'all'],
        null,
        acItem.filter(function (p) {
          return p.v;
        })
      );
      gear.forEach(function (x) {
        var pot = +(x.g.runes || {}).pot || 0;
        if (!pot || !x.e || !x.g.worn || x.e === arm || x.e.k === 'weapon' || x.e.k === 'armor') return;
        M.forEach(function (m) {
          if (m.src === x && m.sel.indexOf('ac') >= 0 && m.type === 'item')
            acT.parts.forEach(function (p) {
              if (p.label === m.label && p.type === 'item') p.v = modValue(m) + pot;
            });
        });
      });
      // only the best item bonus counts
      var items2 = acT.parts.filter(function (p) {
          return p.type === 'item';
        }),
        bestItem = items2.reduce(function (b, p) {
          return !b || p.v > b.v ? p : b;
        }, null);
      var acParts = acT.parts
        .filter(function (p) {
          return p.type !== 'item';
        })
        .concat(bestItem ? [bestItem] : []);
      var acDex = Math.min(mods.dex, dexCap);
      out.ac = {
        v:
          10 +
          acDex +
          prof(acRank) +
          acParts.reduce(function (s, p) {
            return s + p.v;
          }, 0),
        rank: acRank,
        cat: aCat,
        dex: acDex,
        prof: prof(acRank),
        item: bestItem ? bestItem.v : 0,
        parts: acParts,
        dexCap: dexCap === 99 ? null : dexCap
      };
      if (shield)
        out.shield = {
          e: shield.e,
          ac: shield.e.ac || 0,
          hard: shield.e.hard || 0,
          hp: shield.e.hp || 0,
          bt: Math.floor((shield.e.hp || 0) / 2),
          g: shield.g
        };
      // saves
      var res = RESILIENT[aRunes.res || ''] || 0;
      out.saves = {};
      Object.keys(SAVES).forEach(function (s) {
        var rank = sys.saves[s].rank,
          base = res ? [{ type: 'item', v: res, label: 'Resilient rune' }] : [];
        var t = total([s, 'saving-throw', SAVES[s] + '-based', 'all'], null, base);
        out.saves[s] = { v: mods[SAVES[s]] + prof(rank) + t.v, rank: rank, ab: SAVES[s], parts: t.parts };
      });
      // perception
      var pr = sys.attributes.perception.rank,
        pt = total(['perception', 'wis-based', 'all']);
      out.perception = { v: mods.wis + prof(pr) + pt.v, rank: pr, parts: pt.parts };
      var it2 = total(['initiative']);
      out.initiative = { v: out.perception.v + it2.v };
      // skills
      skillRanks(ch, out, sys, cls, bg, L);
      out.skills = {};
      SKILLS.concat(
        out.lores.map(function (l) {
          return 'lore:' + l.n;
        })
      ).forEach(function (k) {
        var isLore = /^lore:/.test(k),
          ab = isLore ? 'int' : SK[k][1],
          rank = out.rank[k] || 0,
          nm = isLore ? k.slice(5) + ' Lore' : SK[k][0];
        var t = total(
          (isLore ? ['lore-skill-check', slugify(nm)] : [nm.toLowerCase(), k]).concat([
            'skill-check',
            ab + '-based',
            'all'
          ])
        );
        var pen = (ab === 'str' || ab === 'dex') && out.checkPenalty ? out.checkPenalty : 0;
        out.skills[k] = {
          n: nm,
          ab: ab,
          rank: rank,
          v: mods[ab] + prof(rank) + t.v + pen,
          parts: t.parts,
          pen: pen,
          lore: isLore
        };
      });
      // class DC
      if (cls) {
        var key = cls.key.length === 1 ? cls.key[0] : ch.key || cls.key[0];
        var cdr = (sys.proficiencies.classDCs[cls.id] || { rank: 0 }).rank,
          cdt = total(['class', 'class-dc', cls.id]);
        out.classDC = { v: 10 + mods[key] + prof(cdr) + cdt.v, rank: cdr, ab: key };
        out.key = key;
      }
      // speed
      var sp = total(['land-speed', 'speed', 'all-speeds']);
      out.speed = {
        v: Math.max(5, (sys.attributes.speed.value || 25) + sp.v + out.armorSpeedPenalty),
        parts: sp.parts,
        other: speeds.map(function (s) {
          return s;
        })
      };
      out.senses = senses;
      out.resist = resist;
      out.weak = weak;
      out.immune = immune;
      out.size = anc ? anc.size : 'med';
      out.investMax =
        10 +
        (+getPath(A, 'system.resources.investiture.max') || 0) -
        (getPath(A, 'system.resources.investiture.max') >= 10 ? 10 : 0);
      if (out.invested > out.investMax)
        out.warnings.push('Invested ' + out.invested + ' items; the limit is ' + out.investMax + '.');
      out.focusMax = Math.min(3, sys.resources.focus.max || 0);
      out.traditions = {};
      TRAD.forEach(function (t) {
        out.traditions[t] = sys.proficiencies.traditions[t].rank;
      });
      out.aliases = sys.proficiencies.aliases;
      out.attackRanks = sys.proficiencies.attacks;
      out.defenseRanks = sys.proficiencies.defenses;
      out.A = A;
      // spellcasting
      spellcasting(ch, out, cls, sys, L, mods, total, prof, items);
      // strikes
      strikesOf(ch, out, gear, sys, L, mods, total, prof, F, strikes, dice, martial);
      // warnings
      if (!anc) out.warnings.push('Choose an ancestry.');
      else if (!her) out.warnings.push('Choose a heritage.');
      if (!bg) out.warnings.push('Choose a background.');
      if (!cls) out.warnings.push('Choose a class.');
      if (out.boostNeed.length) out.warnings.push('Ability boosts to choose: ' + out.boostNeed.join(', ') + '.');
      slots.forEach(function (s) {
        if (!ch.feats[s.key]) out.warnings.push(slotName(s, cls, anc) + ' (level ' + s.lv + ') is empty.');
      });
      out.open.forEach(function (o) {
        if (o.value === '') out.warnings.push(o.label + ' (' + o.item + ')');
      });
      if (out.skillPicksLeft > 0)
        out.warnings.push(
          out.skillPicksLeft + ' trained skill' + (out.skillPicksLeft === 1 ? '' : 's') + ' to choose.'
        );
      out.incFree.forEach(function (l) {
        out.warnings.push('Skill increase at level ' + l + ' to choose.');
      });
      out.dedications = dedicationCheck(items, out);
      out.facts = F;
      out.A = A;
      return out;
    }
    function slotName(s, cls, anc) {
      return {
        anc: (anc ? anc.n : 'Ancestry') + ' feat',
        cls: (cls ? cls.n : 'Class') + ' feat',
        skill: 'Skill feat',
        gen: 'General feat'
      }[s.kind];
    }

    // A dedication feat needs two more feats of that archetype before another dedication.
    function dedicationCheck(items, out) {
      var ded = items.filter(function (it) {
        return (
          it.e._k === 'feats' &&
          (it.e.t || []).indexOf('dedication') >= 0 &&
          /^(anc|cls|skill|gen)\d+$|^feat:/.test(it.key)
        );
      });
      if (ded.length > 1)
        out.warnings.push(
          'More than one dedication: each needs two other feats from its archetype before the next one (check with your GM).'
        );
      return ded.map(function (it) {
        return it.e.n;
      });
    }

    // ---------- skills: class, background, chosen at 1st level, increases, and what feats and features give ----------
    function skillRanks(ch, out, sys, cls, bg, L) {
      var rank = {},
        src = {},
        dup = 0;
      SKILLS.forEach(function (k) {
        rank[k] = 0;
      });
      var train = function (k, why) {
        if (rank[k] >= 1) {
          dup++;
          return;
        }
        rank[k] = 1;
        src[k] = why;
      };
      if (cls)
        cls.skills.forEach(function (k) {
          train(skillCode(k), cls.n);
        });
      if (bg)
        bg.skills.forEach(function (k) {
          train(skillCode(k), bg.n);
        });
      // lores: from background, plus chosen ones
      var lores = [];
      var bgLore = bg && bg.lore ? String(bg.lore).replace(/ Lore$/, '') : '';
      if (bgLore)
        lores.push({
          n: /</.test(bgLore) ? (ch.skills || {}).bgLore || bgLore : bgLore,
          rank: 1,
          from: 'Background',
          fixed: true,
          pick: /</.test(bgLore)
        });
      // features and feats that train skills (rules) — counted after class and background so duplicates give free picks
      SKILLS.forEach(function (k) {
        var r = (sys.skills[k] || {}).rank || 0;
        if (r >= 1) {
          if (rank[k] >= 1 && r === 1) dup++;
          rank[k] = Math.max(rank[k], r);
          src[k] = src[k] || 'feature';
        }
      });
      var picks = (cls ? cls.addSkills : 0) + Math.max(0, out.mods.int) + dup;
      var chosen = ((ch.skills || {}).L1 || []).filter(function (k) {
        return k;
      });
      chosen.slice(0, picks).forEach(function (k) {
        if (/^lore:/.test(k)) {
          var n = k.slice(5);
          if (
            !lores.some(function (l) {
              return l.n === n;
            })
          )
            lores.push({ n: n, rank: 1, from: 'Chosen' });
          return;
        }
        if (rank[k] === 0) {
          rank[k] = 1;
          src[k] = 'Chosen';
        }
      });
      out.skillPicks = picks;
      out.skillPicksLeft = Math.max(0, picks - chosen.length);
      ((ch.skills || {}).extra || []).forEach(function (k) {
        if (/^lore:/.test(k)) {
          var n2 = k.slice(5);
          if (
            !lores.some(function (l) {
              return l.n === n2;
            })
          )
            lores.push({ n: n2, rank: 1, from: 'Feat' });
          return;
        }
        if (rank[k] === 0) {
          rank[k] = 1;
          src[k] = 'Feat';
        }
      });
      // increases
      var levels = (cls ? cls.skillIncreaseLevels : []).filter(function (l) {
        return l <= L;
      });
      var inc = (ch.skills || {}).inc || {},
        free = [],
        bad = [];
      levels.forEach(function (l) {
        var k = inc[l];
        if (!k) {
          free.push(l);
          return;
        }
        var cap = l >= 15 ? 4 : l >= 7 ? 3 : 2;
        if (/^lore:/.test(k)) {
          var lo = lores.filter(function (x) {
            return x.n === k.slice(5);
          })[0];
          if (lo && lo.rank < cap) lo.rank++;
          else bad.push(l);
          return;
        }
        if (rank[k] >= 1 && rank[k] < cap) rank[k]++;
        else bad.push(l);
      });
      bad.forEach(function (l) {
        out.warnings.push(
          'Skill increase at level ' +
            l +
            ' can’t raise ' +
            (/^lore:/.test(inc[l]) ? inc[l].slice(5) + ' Lore' : SK[inc[l]] ? SK[inc[l]][0] : inc[l]) +
            ' (untrained, or above the limit for that level: expert until 7th, master until 15th).'
        );
      });
      lores.forEach(function (l) {
        rank['lore:' + l.n] = l.rank;
      });
      out.rank = rank;
      out.lores = lores;
      out.incLevels = levels;
      out.incFree = free;
      out.skillSrc = src;
    }

    // ---------- spellcasting ----------
    function tradOf(t, out) {
      if (!t) return '';
      if (/^alias:/.test(t)) return out.aliases[t.slice(6)] || '';
      // Starfinder: the tradition the connection or paradox sets (flags.pf2e.mystic.tradition, as the data is built)
      if (/^flag:/.test(t)) return getPath(out.A, 'flags.pf2e.' + t.slice(5) + '.tradition') || '';
      return t;
    }
    function spellcasting(ch, out, cls, sys, L, mods, total, prof, items) {
      var list = [];
      var C = cls && CASTERS[cls.id];
      if (C) {
        var trad = tradOf(C.trad, out),
          ab = cls.key.length === 1 ? cls.key[0] : ch.key || cls.key[0];
        var rank = trad ? out.traditions[trad] : 0;
        // Remaster classes (Starfinder): one spellcasting proficiency, raised by Expert/Master/Legendary Spellcaster
        if (cls.sc) {
          rank = cls.sc;
          ['Expert', 'Master', 'Legendary'].forEach(function (n, i) {
            if (
              items.some(function (it) {
                return it.e.n === n + ' Spellcaster';
              })
            )
              rank = Math.max(rank, i + 2);
          });
          if (trad) out.traditions[trad] = Math.max(out.traditions[trad] || 0, rank);
        }
        var s = slots(C.table, L);
        list.push({
          id: 'class',
          n: cls.n,
          trad: trad,
          type: C.type,
          ab: ab,
          rank: rank,
          slots: s,
          cantrips: C.cantrips,
          book: !!C.book,
          font: !!C.font,
          rep: C.type === 'spontaneous' ? s.slice() : null,
          needTrad: !trad
        });
      }
      // multiclass spellcasting
      var has = function (n) {
        return items.some(function (it) {
          return it.e.n === n;
        });
      };
      Object.keys(ARCH_CASTERS).forEach(function (c) {
        var nm = c[0].toUpperCase() + c.slice(1);
        if (!has(nm + ' Dedication') || (cls && cls.id === c)) return;
        var trad = tradOf(ARCH_CASTERS[c], out),
          s = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        var basic = has('Basic ' + nm + ' Spellcasting'),
          expert = has('Expert ' + nm + ' Spellcasting'),
          master = has('Master ' + nm + ' Spellcasting');
        if (basic)
          [
            [4, 1],
            [6, 2],
            [8, 3]
          ].forEach(function (x) {
            if (L >= x[0]) s[x[1]] = 1;
          });
        if (expert)
          [
            [12, 4],
            [14, 5],
            [16, 6]
          ].forEach(function (x) {
            if (L >= x[0]) s[x[1]] = 1;
          });
        if (master)
          [
            [18, 7],
            [20, 8]
          ].forEach(function (x) {
            if (L >= x[0]) s[x[1]] = 1;
          });
        var arch = byId('classes', c),
          ab = arch ? arch.key[0] : 'cha';
        var rank = trad ? Math.max(1, out.traditions[trad]) : 1;
        list.push({
          id: 'arch:' + c,
          n: nm + ' archetype',
          trad: trad,
          type: ARCH_TYPE[c] || 'prepared',
          ab: ab,
          rank: rank,
          slots: s,
          cantrips: 2,
          rep: ARCH_TYPE[c] ? s.slice() : null,
          arch: true,
          needTrad: !trad
        });
      });
      // spells granted by features and feats (bloodline, compositions, domains…)
      var granted = [];
      items.forEach(function (it) {
        (it.spells || []).forEach(function (sp) {
          granted.push({ s: sp, from: it.e.n });
        });
      });
      // focus spells and innate spells live in their own entries
      list.forEach(function (e) {
        var t = e.trad;
        e.prof = prof(e.rank);
        e.dc = 10 + mods[e.ab] + e.prof + total(['spell-dc', 'all']).v;
        e.attack = mods[e.ab] + e.prof + total(['spell-attack', 'spell-attack-roll', 'attack', 'all']).v;
        e.top = 0;
        e.slots.forEach(function (n, r) {
          if (n && r) e.top = r;
        });
        e.heighten = Math.max(1, Math.ceil(L / 2));
      });
      out.casters = list;
      out.grantedSpells = granted;
      // focus: tradition of the class (or the best tradition) for DCs
      var best = TRAD.reduce(
        function (b, t) {
          return out.traditions[t] > (out.traditions[b] || 0) ? t : b;
        },
        list[0] ? list[0].trad || 'occult' : 'occult'
      );
      var fAb = list[0] ? list[0].ab : out.key || 'cha';
      out.focus = {
        max: out.focusMax,
        trad: best,
        ab: fAb,
        rank: out.traditions[best] || 0,
        dc: 10 + mods[fAb] + prof(out.traditions[best] || 0),
        attack: mods[fAb] + prof(out.traditions[best] || 0)
      };
    }

    // ---------- strikes ----------
    function strikesOf(ch, out, gear, sys, L, mods, total, prof, F, ruleStrikes, dice, martial) {
      var list = [];
      function rankFor(w) {
        var at = sys.proficiencies.attacks,
          r = (at[w.cat] || { rank: 0 }).rank || 0;
        if (w.base && at['weapon-base-' + w.base]) r = Math.max(r, at['weapon-base-' + w.base].rank || 0);
        if (w.grp && at['weapon-group-' + w.grp]) r = Math.max(r, at['weapon-group-' + w.grp].rank || 0);
        martial.forEach(function (m) {
          if (m.def && test(m.def, F, itemFacts(w))) r = Math.max(r, at[m.slug] ? at[m.slug].rank : +m.rank || 0);
        });
        Object.keys(at).forEach(function (k) {
          if (/^weapon-trait-/.test(k) && (w.t || []).indexOf(k.slice(13)) >= 0) r = Math.max(r, at[k].rank || 0);
        });
        return r;
      }
      function strike(w, g, label) {
        g = g || {};
        var runes = gradeRunes(g, w, 'weapon'),
          t = w.t || [];
        var ranged =
          (!!w.rng && t.indexOf('thrown') < 0) ||
          (/^(bow|crossbow|firearm|sling|dart|bomb)$/.test(w.grp || '') && !!w.rng);
        var melee = !ranged,
          finesse = t.indexOf('finesse') >= 0,
          agile = t.indexOf('agile') >= 0,
          thrown = t.some(function (x) {
            return /^thrown/.test(x);
          }),
          propulsive = t.indexOf('propulsive') >= 0;
        var ab = ranged ? 'dex' : finesse && mods.dex > mods.str ? 'dex' : 'str';
        var r = rankFor(w),
          pot = +runes.pot || +w.pot || 0;
        var ix = itemFacts(w);
        ix.add(melee ? 'item:melee' : 'item:ranged');
        ix.num['item:proficiency:rank'] = r;
        ix.add('item:proficiency:rank:' + r);
        if (w.cat) ix.add('item:category:' + w.cat);
        ix.add('item:id:' + (g.uid || w.id));
        var at = total(
          [
            'attack',
            'strike-attack-roll',
            'attack-roll',
            melee ? 'melee-attack-roll' : 'ranged-attack-roll',
            ab + '-attack',
            ab + '-based',
            'all'
          ],
          ix,
          pot ? [{ type: 'item', v: pot, label: 'Potency' }] : []
        );
        var bonus = mods[ab] + prof(r) + at.v;
        var nd = (w.dice || 1) + (STRIKING[runes.str || w.str || ''] || 0);
        var abDmg = [];
        if (melee || thrown) abDmg.push({ type: 'ability', v: mods.str, label: 'Strength', ability: 'str' });
        else if (propulsive)
          abDmg.push({
            type: 'ability',
            v: mods.str > 0 ? Math.floor(mods.str / 2) : mods.str,
            label: 'Strength (propulsive)'
          });
        var dm = total(
          ['damage', 'strike-damage', melee ? 'melee-strike-damage' : 'ranged-strike-damage', 'all'],
          ix,
          []
        );
        // ability modifiers to damage: only the best one counts (e.g. the thief racket's Dexterity replaces Strength)
        var abList = abDmg.concat(
          dm.parts.filter(function (p) {
            return p.type === 'ability';
          })
        );
        var bestAb = abList.reduce(function (b, p) {
          return b == null || p.v > b.v ? p : b;
        }, null);
        var other = dm.parts.filter(function (p) {
          return p.type !== 'ability';
        });
        var dmgBonus =
          (bestAb ? bestAb.v : 0) +
          other.reduce(function (s, p) {
            return s + p.v;
          }, 0);
        var extra = [];
        (runes.prop || []).forEach(function (p) {
          var k = String(p)
              .toLowerCase()
              .replace(/^(.*) \((greater|major|true|lesser|moderate)\)$/, '$2 $1'),
            d = RUNE_DMG[k] || RUNE_DMG[k.replace(/^(greater|major|true|lesser|moderate) /, '')];
          if (d) extra.push(d + ' (' + p + ')');
          else {
            // Starfinder upgrades: the damage dice their own rules add to the weapon they're installed in
            var up = byName('items', p);
            ((up && up.ru) || []).forEach(function (r) {
              if (r.key === 'DamageDice' && /parentItem/.test(String(r.selector)) && !r.predicate && r.dieSize)
                extra.push((r.diceNumber || 1) + r.dieSize + ' ' + (r.damageType || '') + ' (' + p + ')');
            });
          }
        });
        var cond = [];
        dice.forEach(function (x) {
          var dr = x.r,
            sel = [].concat(dr.selector || []);
          if (
            !sel.some(function (s) {
              return /strike-damage|^damage$/.test(s);
            })
          )
            return;
          var ok = test(dr.predicate, F, ix);
          var n =
            typeof dr.diceNumber === 'string'
              ? evalFormula(dr.diceNumber, { level: L, mods: mods, A: out.A })
              : dr.diceNumber || 0;
          if (dr.diceNumber && typeof dr.diceNumber === 'object' && dr.diceNumber.brackets)
            n = (function () {
              var v = 0;
              dr.diceNumber.brackets.forEach(function (b) {
                if ((b.start == null || L >= b.start) && (b.end == null || L <= b.end)) v = b.value;
              });
              return v;
            })();
          if (!n) return;
          var size = String(dr.dieSize || '').replace(/\{actor\|([^}]+)\}/g, function (_, p) {
            return getPath(out.A, p) || '';
          });
          var txt = n + size + (dr.damageType ? ' ' + dr.damageType : '') + (dr.category ? ' ' + dr.category : '');
          var lab = dr.label && !/^PF2E/.test(dr.label) ? dr.label : x.it.e.n;
          // conditional dice (sneak attack needs an off-guard target) are listed apart
          if (ok) extra.push(txt + ' (' + lab + ')');
          else if (
            /flat-footed|off-guard|target:/.test(JSON.stringify(dr.predicate || '')) &&
            test(
              (dr.predicate || []).filter(function (p) {
                return !/target:|flat-footed|off-guard/.test(JSON.stringify(p));
              }),
              F,
              ix
            )
          )
            cond.push(txt + ' ' + lab);
        });
        list.push({
          n: label || w.n,
          w: w,
          g: g,
          ab: ab,
          rank: r,
          attack: bonus,
          map: agile ? [4, 8] : [5, 10],
          dmg: nd + (w.die || 'd4') + (dmgBonus ? (dmgBonus > 0 ? '+' : '') + dmgBonus : '') + ' ' + (w.dmg || ''),
          dice: nd,
          die: w.die,
          bonus: dmgBonus,
          type: w.dmg,
          extra: extra,
          cond: cond,
          ranged: ranged,
          range: w.rng,
          traits: t,
          parts: at.parts,
          dmgParts: (bestAb ? [bestAb] : []).concat(other)
        });
      }
      // fist
      strike(
        {
          id: 'fist',
          n: 'Fist',
          cat: 'unarmed',
          grp: 'brawling',
          die: 'd4',
          dmg: 'Bludgeoning',
          t: ['agile', 'finesse', 'nonlethal', 'unarmed']
        },
        null,
        'Fist'
      );
      // unarmed attacks and other strikes given by features (claws, jaws…)
      ruleStrikes.forEach(function (x) {
        var r = x.r,
          dmg = (r.damage && r.damage.base) || {};
        strike({
          id: slugify(r.slug || r.label || x.it.e.n),
          n: r.label && !/^PF2E/.test(r.label) ? r.label : x.it.e.n,
          cat: r.category || 'unarmed',
          grp: r.group || 'brawling',
          die: dmg.die || 'd4',
          dice: dmg.dice || 1,
          dmg: (dmg.damageType || '').replace(/^./, function (c) {
            return c.toUpperCase();
          }),
          t: r.traits || [],
          base: r.baseType,
          rng: (r.range && (r.range.increment || r.range)) || null
        });
      });
      gear.forEach(function (x) {
        if (x.e && x.e.k === 'weapon') strike(x.e, x.g, x.g.name || null);
      });
      out.strikes = list;
    }

    // ---------- feats: what a slot can take ----------
    function featsFor(slot, ch, d) {
      var X = index();
      if (!X) return [];
      var anc = d.anc,
        cls = d.cls,
        lv = slot.lv,
        ancTraits = [];
      if (anc)
        ancTraits = (anc.t || [])
          .filter(function (t) {
            return t !== 'humanoid';
          })
          .concat([anc.id]);
      if (d.her && d.her.t) ancTraits = ancTraits.concat(d.her.t); // e.g. half-elf, half-orc
      if (d.her && /^half-(elf|orc)$/.test(d.her.id)) ancTraits.push(d.her.id.slice(5));
      (d.items || []).forEach(function (it) {
        if (it.e.n === 'Adopted Ancestry' && it.sel)
          Object.keys(it.sel).forEach(function (k) {
            ancTraits.push(String(it.sel[k]));
          });
      });
      return X.feats.filter(function (f) {
        if ((f.lv || 0) > lv) return false;
        var t = f.t || [];
        if (slot.kind === 'anc')
          return (
            f.cat === 'ancestry' &&
            t.some(function (x) {
              return ancTraits.indexOf(x) >= 0;
            })
          );
        if (slot.kind === 'cls')
          return (
            (f.cat === 'class' && ((cls && t.indexOf(cls.id) >= 0) || t.indexOf('archetype') >= 0)) ||
            (f.cat === 'class' && t.indexOf('archetype') >= 0)
          );
        if (slot.kind === 'skill')
          return f.cat === 'skill' || (t.indexOf('skill') >= 0 && t.indexOf('archetype') >= 0 && f.cat !== 'class');
        if (slot.kind === 'gen') return f.cat === 'general' || f.cat === 'skill';
        return true;
      });
    }
    // Prerequisites: checks the common shapes ("trained in Athletics", "Strength 14", a feat's name); anything else is shown to read.
    function prereq(f, ch, d) {
      var out = [];
      (f.pre || []).forEach(function (p) {
        var s = String(p).trim(),
          m,
          ok = null,
          low = s.toLowerCase();
        if ((m = /^(trained|expert|master|legendary) in (.+)$/i.exec(s))) {
          var need = ['', 'trained', 'expert', 'master', 'legendary'].indexOf(m[1].toLowerCase()),
            what = m[2].toLowerCase().replace(/^at least one skill$/, '');
          var k = SKBYNAME[what];
          if (k) ok = (d.rank[k] || 0) >= need;
          else if (/lore$/.test(what))
            ok = d.lores.some(function (l) {
              return (l.n + ' lore').toLowerCase() === what && l.rank >= need;
            });
          else if (what === 'perception') ok = d.perception.rank >= need;
          else if (/^(fortitude|reflex|will)( saves?)?$/.test(what)) ok = d.saves[what.split(' ')[0]].rank >= need;
        } else if ((m = /^(strength|dexterity|constitution|intelligence|wisdom|charisma) (\d+)$/i.exec(s))) {
          ok = d.scores[m[1].slice(0, 3).toLowerCase()] >= +m[2];
        } else if (byName('feats', s) || byName('classfeatures', s)) {
          ok = d.items.some(function (it) {
            return it.e.n.toLowerCase() === low;
          });
        } else if ((m = /^(.+) dedication$/i.exec(s))) {
          ok = d.items.some(function (it) {
            return it.e.n.toLowerCase() === low;
          });
        }
        out.push({ t: s, ok: ok });
      });
      return out;
    }

    return {
      AB: AB,
      ABN: ABN,
      SK: SK,
      SKILLS: SKILLS,
      RANK: RANK,
      SAVES: SAVES,
      TRAD: TRAD,
      STRIKING: STRIKING,
      RESILIENT: RESILIENT,
      RUNE_DMG: RUNE_DMG,
      CASTERS: CASTERS,
      index: index,
      find: find,
      byId: byId,
      byName: byName,
      slugify: slugify,
      newChar: newChar,
      derive: derive,
      featSlots: featSlots,
      featsFor: featsFor,
      prereq: prereq,
      slots: slots,
      options: options,
      test: test,
      BOOST_LEVELS: BOOST_LEVELS,
      uid: uid
    };
  }
  root.PF2 = make({ data: 'PF2DATA', game: 'pf2' });
  root.SF2 = make(SF2_GAME);
})(typeof window !== 'undefined' ? window : globalThis);
