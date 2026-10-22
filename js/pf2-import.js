// Import a Pathbuilder 2e export (the JSON from "Export to JSON") into a Character Forge PF2 character.
// Choices are matched by name to the rules data; subclass picks (racket, muse, bloodline…) are found
// among the open choices; skills are spread over the 1st-level picks and the skill increases.
(function (root) {
  'use strict';
  var PF2 = root.PF2;
  var SKN = {
    acrobatics: 'acr',
    arcana: 'arc',
    athletics: 'ath',
    crafting: 'cra',
    deception: 'dec',
    diplomacy: 'dip',
    intimidation: 'itm',
    medicine: 'med',
    nature: 'nat',
    occultism: 'occ',
    performance: 'prf',
    religion: 'rel',
    society: 'soc',
    stealth: 'ste',
    survival: 'sur',
    thievery: 'thi'
  };
  var STR = { '': '', striking: 'striking', greaterStriking: 'greaterStriking', majorStriking: 'majorStriking' };
  var low = function (s) {
    return String(s || '')
      .toLowerCase()
      .trim();
  };
  var ab = function (s) {
    return low(s).slice(0, 3);
  };

  function findItem(name) {
    var X = PF2.index();
    if (!X || !name) return null;
    var n = low(name);
    var hit = X.name.items[n];
    if (hit) return hit;
    // "Bag of Holding (Type II)" style names, and small spelling differences
    var alt = n
      .replace(/\s*\(([^)]*)\)/, ' $1')
      .replace(/-level spell/, '')
      .replace(/\s+/g, ' ');
    for (var k in X.name.items)
      if (k.replace(/\s*\(([^)]*)\)/, ' $1').replace(/\s+/g, ' ') === alt) return X.name.items[k];
    return null;
  }
  function baseWeapon(w) {
    var e = findItem(w.name);
    if (e && e.k === 'weapon') return e;
    // a renamed or specific weapon: try the last words ("Brilliant Rapier" → "Rapier")
    var words = String(w.name).split(' ');
    for (var i = 1; i < words.length; i++) {
      var t = findItem(words.slice(i).join(' '));
      if (t && t.k === 'weapon') return t;
    }
    return null;
  }

  function fromPathbuilder(json) {
    var b = json && json.build ? json.build : json;
    if (!b || !b.class) throw new Error('This doesn’t look like a Pathbuilder export.');
    var X = PF2.index();
    if (!X) throw new Error('The Pathfinder data isn’t loaded yet.');
    var ch = PF2.newChar(),
      notes = [];
    ch.name = b.name || '';
    ch.level = +b.level || 1;
    ch.xp = +b.xp || 0;
    ch.alignment = b.alignment || '';
    ch.gender = b.gender || '';
    ch.age = b.age || '';
    ch.deity = b.deity && b.deity !== 'Not set' ? b.deity : '';
    ch.langs = (b.languages || []).slice();
    var anc = PF2.byName('ancestries', b.ancestry),
      her = PF2.byName('heritages', b.heritage),
      bg = PF2.byName('backgrounds', b.background),
      cls = PF2.byName('classes', b.class);
    if (anc) ch.ancestry = anc.id;
    else notes.push('Ancestry “' + b.ancestry + '” not found.');
    if (her) ch.heritage = her.id;
    else if (b.heritage) notes.push('Heritage “' + b.heritage + '” not found.');
    if (bg) ch.background = bg.id;
    else notes.push('Background “' + b.background + '” not found.');
    if (cls) ch.cls = cls.id;
    else notes.push('Class “' + b.class + '” not found.');
    ch.key = ab(b.keyability) || (cls ? cls.key[0] : '');
    // ability boosts
    var br = (b.abilities || {}).breakdown || {};
    if (anc) {
      var freeSlots = anc.boosts.filter(function (o) {
          return o.length > 1;
        }).length,
        free = (br.ancestryFree || []).map(ab);
      if ((br.ancestryBoosts || []).length === 0 && free.length === 2 && freeSlots < 2) ch.boosts.ancAlt = true;
      ch.boosts.anc = free;
    }
    if (bg) {
      var bb = (br.backgroundBoosts || []).map(ab),
        slots = bg.boosts.map(function () {
          return '';
        });
      // put each boost in the most restrictive slot that allows it
      bb.forEach(function (a) {
        var order = bg.boosts
          .map(function (o, i) {
            return [o.length, i];
          })
          .sort(function (x, y) {
            return x[0] - y[0];
          });
        for (var i = 0; i < order.length; i++) {
          var s = order[i][1];
          if (!slots[s] && bg.boosts[s].indexOf(a) >= 0) {
            slots[s] = a;
            return;
          }
        }
      });
      ch.boosts.bg = slots;
    }
    var lv = br.mapLevelledBoosts || {};
    Object.keys(lv).forEach(function (k) {
      ch.boosts.lv[k] = lv[k].map(ab);
    });
    // feats
    var X2 = X,
      slotFor = {
        'Ancestry Feat': 'anc',
        'Class Feat': 'cls',
        'Skill Feat': 'skill',
        'General Feat': 'gen',
        'Archetype Feat': 'cls'
      };
    var used = {},
      children = [],
      bonus = 0;
    (b.feats || []).forEach(function (f) {
      var name = f[0],
        extra = f[1],
        type = f[2],
        level = +f[3] || 1,
        label = f[4] || '',
        choice = f[5],
        parent = f[6];
      if (type === 'Heritage') return;
      var e = PF2.byName('feats', name);
      if (!e) {
        notes.push('Feat “' + name + '” not found.');
        return;
      }
      if (type === 'Awarded Feat') return; // given by the background or a class feature: the rules grant it
      if (choice === 'childChoice') {
        children.push({ e: e, parent: parent, extra: extra });
        return;
      }
      var kind = slotFor[type],
        key = kind + level;
      if (!kind) return;
      // a second feat of the same kind and level, or one in a slot Pathbuilder labels with an id (a bonus slot), goes in a bonus slot
      if (used[key] || /^[0-9a-f]{8}-/.test(label)) key = 'bonus' + level + '-' + ++bonus;
      used[key] = 1;
      ch.feats[key] = e.id;
      if (extra) children.push({ e: null, extraFor: key, extra: extra });
    });
    // subclass and other picks: walk the open choices until nothing more matches
    // a child pick belongs to the choice of its parent ("Heritage Feat", "Human Feat 1", "Rogue Feat 2"…)
    var parentKey = function (p) {
      if (!p) return '';
      if (/^Heritage/.test(p)) return 'heritage';
      var m = /(\w+) Feat (\d+)/.exec(p);
      if (!m) return '';
      var k = m[1] === 'Skill' ? 'skill' : m[1] === 'General' ? 'gen' : anc && low(m[1]) === anc.id ? 'anc' : 'cls';
      return 'feat:' + k + m[2];
    };
    var placed = {};
    var wanted = (b.specials || []).concat(
      children.reduce(function (out, c) {
        if (c.e && !c.parent) out.push(c.e.n);
        return out;
      }, [])
    );
    for (var round = 0; round < 6; round++) {
      var d = PF2.derive(ch),
        set = 0;
      d.open.forEach(function (o) {
        if (o.value !== '') return;
        var kid = children.filter(function (c) {
          return c.e && c.parent && !placed[c.e.n] && parentKey(c.parent) === o.itemKey;
        })[0];
        if (kid) {
          var op = o.options.filter(function (x) {
            return low(x.label) === low(kid.e.n);
          })[0];
          if (op) {
            ch.choices[o.key] = op.value;
            placed[kid.e.n] = 1;
            set++;
            return;
          }
        }
        var norm = function (x) {
          return low(x)
            .replace(
              /^(bloodline|muse|doctrine|order|mystery|patron|instinct|style|way|methodology|research field|hybrid study|innovation|school|thesis|edge|conscious mind|subconscious mind|eidolon|implement|cause|racket)[:\s]+|\s+(racket|muse|doctrine|order|mystery|patron|instinct|style|methodology|thesis)$/g,
              ''
            )
            .replace(/^the /, '');
        };
        var hit = o.options.filter(function (op) {
          return wanted.some(function (w) {
            return low(w) === low(op.label) || norm(w) === norm(op.label);
          });
        })[0];
        if (!hit) {
          var ex = children.filter(function (c) {
            return c.extraFor && o.itemKey === 'feat:' + c.extraFor;
          })[0];
          if (ex)
            hit = o.options.filter(function (op) {
              return low(op.label) === low(ex.extra);
            })[0];
        }
        if (hit) {
          ch.choices[o.key] = hit.value;
          set++;
        }
      });
      if (!set) break;
    }
    // lores and skills
    var lores = (b.lores || []).filter(function (l) {
      return l[1] > 0;
    });
    var d0 = PF2.derive(ch);
    if (d0.lores[0] && d0.lores[0].pick && lores[0]) ch.skills.bgLore = lores[0][0];
    var want = {};
    Object.keys(SKN).forEach(function (n) {
      var r = Math.round(((b.proficiencies || {})[n] || 0) / 2);
      if (r) want[SKN[n]] = r;
    });
    lores.forEach(function (l, i) {
      if (i > 0 || !d0.lores.length) want['lore:' + l[0]] = Math.round(l[1] / 2);
      else if (Math.round(l[1] / 2) > 1) want['lore:' + l[0]] = Math.round(l[1] / 2);
    });
    assignSkills(ch, want);
    // equipment
    var gear = [];
    (b.weapons || []).forEach(function (w) {
      var e = baseWeapon(w);
      var g = {
        uid: PF2.uid(),
        id: e ? e.id : '',
        q: w.qty || 1,
        worn: true,
        runes: { pot: w.pot || 0, str: STR[w.str || ''] || '', prop: (w.runes || []).slice() }
      };
      if (w.display && e && w.display !== e.n && !/^\+\d/.test(w.display)) g.name = w.display;
      else if (e && low(w.name) !== low(e.n)) g.name = w.name;
      if (!e) {
        g.custom = true;
        g.name = w.display || w.name;
        notes.push('Weapon “' + w.name + '” not found; kept by name.');
      }
      gear.push(g);
    });
    (b.armor || []).forEach(function (a) {
      var e = findItem(a.name);
      var g = {
        uid: PF2.uid(),
        id: e ? e.id : '',
        q: a.qty || 1,
        worn: !!a.worn,
        runes: { pot: a.pot || 0, res: a.res || '', prop: (a.runes || []).slice() }
      };
      if (!e) {
        g.custom = true;
        g.name = a.display || a.name;
        notes.push('Armor “' + a.name + '” not found; kept by name.');
      }
      gear.push(g);
    });
    (b.equipment || []).forEach(function (x) {
      var e = findItem(x[0]);
      var g = { uid: PF2.uid(), id: e ? e.id : '', q: x[1] || 1, worn: !!e && (e.t || []).indexOf('invested') >= 0 };
      if (!e) {
        g.custom = true;
        g.name = x[0];
      }
      gear.push(g);
    });
    ch.gear = gear;
    var m = b.money || {};
    ch.money = { pp: m.pp || 0, gp: m.gp || 0, sp: m.sp || 0, cp: m.cp || 0 };
    // spells
    var d1 = PF2.derive(ch);
    (b.spellCasters || []).forEach(function (sc) {
      var entry = null;
      if (sc.innate) entry = 'innate';
      else
        d1.casters.forEach(function (c) {
          if (!entry && (c.trad === sc.magicTradition || !c.trad)) entry = c.id;
        });
      if (!entry) entry = 'innate';
      var bucket = (ch.spells[entry] = ch.spells[entry] || { known: {}, prepared: {} });
      (sc.spells || []).forEach(function (row) {
        (row.list || []).forEach(function (n) {
          var s = PF2.byName('spells', n);
          if (!s) {
            notes.push('Spell “' + n + '” not found.');
            return;
          }
          var k = String(row.spellLevel || 0);
          (bucket.known[k] = bucket.known[k] || []).push(s.id);
          if (entry === 'innate') {
            bucket.trad = bucket.trad || {};
            bucket.trad[s.id] = sc.magicTradition;
          }
        });
      });
    });
    var focus = [];
    Object.keys(b.focus || {}).forEach(function (t) {
      Object.keys(b.focus[t]).forEach(function (a) {
        var f = b.focus[t][a];
        focus = focus.concat(f.focusCantrips || [], f.focusSpells || []);
      });
    });
    if (focus.length)
      ch.spells.focus = {
        known: {
          0: focus
            .map(function (n) {
              var s = PF2.byName('spells', n);
              return s && s.id;
            })
            .filter(Boolean)
        }
      };
    // ability adjustments Pathbuilder applied by hand (its "custom ability increases")
    var d2 = PF2.derive(ch);
    PF2.AB.forEach(function (a) {
      var want = +(b.abilities || {})[a];
      if (want && d2.scores[a] !== want) ch.abAdj[a] = want - d2.scores[a];
    });
    if (Object.keys(ch.abAdj).length)
      notes.push(
        'Ability scores adjusted to match Pathbuilder: ' +
          Object.keys(ch.abAdj)
            .map(function (a) {
              return a.toUpperCase() + ' ' + (ch.abAdj[a] > 0 ? '+' : '') + ch.abAdj[a];
            })
            .join(', ') +
          '.'
      );
    ch.importNotes = notes;
    return ch;
  }

  // Spread the wanted skill ranks over the 1st-level picks and the skill increases, keeping each increase within its level's limit.
  function assignSkills(ch, want) {
    ch.skills.L1 = [];
    ch.skills.inc = {};
    ch.skills.extra = [];
    var d = PF2.derive(ch);
    var base = d.rank; // from class, background and features
    var picks = [];
    Object.keys(want).forEach(function (k) {
      if ((base[k] || 0) < 1) picks.push(k);
    });
    ch.skills.L1 = picks.slice(0, d.skillPicks);
    ch.skills.extra = picks.slice(d.skillPicks); // trained by feats such as Natural Skill
    d = PF2.derive(ch);
    var levels = d.incLevels.slice();
    var need = [];
    Object.keys(want).forEach(function (k) {
      var cur = d.rank[k] || 0;
      for (var r = cur + 1; r <= want[k]; r++) need.push({ k: k, to: r });
    });
    // hardest first: legendary needs a 15th+ slot, master a 7th+ slot
    need.sort(function (a, b) {
      return b.to - a.to;
    });
    var taken = {};
    need.forEach(function (n) {
      var min = n.to === 4 ? 15 : n.to === 3 ? 7 : 1;
      var pick = levels.filter(function (l) {
        return !taken[l] && l >= min;
      });
      // master/legendary want the lowest slot that allows them; expert takes the earliest free slot
      var l = pick[0];
      if (l == null) return;
      taken[l] = n;
    });
    // increases must happen in rank order per skill: sort each skill's slots by level and give ranks in order
    var bySkill = {};
    Object.keys(taken).forEach(function (l) {
      var n = taken[l];
      (bySkill[n.k] = bySkill[n.k] || []).push(+l);
    });
    Object.keys(bySkill).forEach(function (k) {
      bySkill[k]
        .sort(function (a, b) {
          return a - b;
        })
        .forEach(function (l) {
          ch.skills.inc[l] = k;
        });
    });
  }

  root.PF2Import = { fromPathbuilder: fromPathbuilder, assignSkills: assignSkills };
})(typeof window !== 'undefined' ? window : globalThis);
