// Mutants & Masterminds encounters: make villains and minions for a power level, then run the fight
// (initiative, Toughness checks with the damage track, conditions). Villains are built as heroes, so the
// same power level limits are checked: attack + effect ≤ 2PL, Dodge/Parry + Toughness ≤ 2PL, Fortitude + Will ≤ 2PL.
(function (root) {
  'use strict';
  var R = function (n) {
    return Math.floor(Math.random() * n);
  };
  var pick = function (a) {
    return a[R(a.length)];
  };
  var clamp = function (v, lo, hi) {
    return Math.max(lo, Math.min(hi, v));
  };
  var uid = function () {
    return 'v' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  };

  // Each role: how it trades offense (effect vs attack) and defense (Toughness vs Dodge/Parry), its main attack, extra powers, skills, advantages.
  // t: effect = PL + t, attack = PL − t.  s: Toughness = PL + s, Dodge/Parry = PL − s.  f: Fortitude = PL + f, Will = PL − f.
  var ROLES = {
    brute: {
      label: 'Brute',
      t: [1, 2],
      s: [2, 3],
      f: [2, 3],
      ab: { STR: 'e', STA: 'T', FGT: 3, AGL: 0, DEX: 0, INT: 0, AWE: 1, PRE: 1 },
      attack: { kind: 'unarmed', names: ['Crushing Blow', 'Haymaker', 'Pummel'] },
      extras: [
        ['Leaping', 'Mighty Leap', 'half'],
        ['Immunity', 'Tough as Nails', 5, 'Immune to disease and poison, and one more environmental danger.'],
        ['Protection', null, 0, '', ['Impervious']]
      ],
      skills: ['Intimidation', 'Athletics'],
      adv: ['Power Attack', 'All-out Attack', 'Fearless', 'Improved Smash', 'Improved Grab', 'Startle', 'Diehard'],
      tactics:
        'Charges the toughest-looking hero, smashes the scenery and grabs people. Uses Power Attack against low-Toughness heroes.',
      names: [
        ['Iron', 'Stone', 'Granite', 'Brick', 'Titan', 'Wrecking', 'Bulldozer', 'Rhino'],
        ['Juggernaut', 'Hulk', 'Crusher', 'Ram', 'Colossus', 'Bruiser', 'Golem', 'Maul']
      ]
    },
    blaster: {
      label: 'Blaster',
      t: [-1, 1],
      s: [-1, 1],
      f: [-1, 1],
      ab: { STR: 0, STA: 2, FGT: 1, AGL: 2, DEX: 'a', INT: 1, AWE: 2, PRE: 2 },
      attack: {
        kind: 'ranged',
        names: ['Plasma Bolt', 'Fire Blast', 'Lightning Strike', 'Cold Ray', 'Sonic Scream', 'Gravity Lance']
      },
      extras: [
        ['Flight', 'Flight', 'half'],
        ['Area', 'Firestorm', 0],
        ['Immunity', 'Own Element', 5, 'Immune to the effects of their own element.']
      ],
      skills: ['Perception', 'Intimidation', 'Acrobatics'],
      adv: ['Improved Aim', 'Power Attack', 'Precise Attack', 'Accurate Attack', 'Taunt', 'Improved Initiative'],
      tactics:
        'Stays at range in the air and blasts whoever is hurting the team most. Uses the area attack on grouped heroes.',
      names: [
        ['Solar', 'Crimson', 'Volt', 'Cinder', 'Frost', 'Nova', 'Static', 'Pulsar'],
        ['Flare', 'Storm', 'Burn', 'Blaze', 'Arc', 'Spark', 'Bolt', 'Inferno']
      ]
    },
    speedster: {
      label: 'Speedster',
      t: [-3, -2],
      s: [-3, -2],
      f: [0, 1],
      ab: { STR: 1, STA: 2, FGT: 'a', AGL: 'D', DEX: 2, INT: 1, AWE: 2, PRE: 1 },
      attack: { kind: 'close', names: ['Blur Strike', 'Rapid Punches', 'Hit and Run'], mods: [['Multiattack', 1]] },
      extras: [
        ['Speed', 'Super-Speed', 'speed'],
        ['Quickness', 'Fast Hands', 'half'],
        ['Movement', 'Wall-Running', 1, 'Runs up walls and across water.']
      ],
      skills: ['Acrobatics', 'Perception', 'Sleight of Hand'],
      adv: [
        'Move-by Action',
        'Evasion',
        'Improved Initiative',
        'Agile Feint',
        'Takedown',
        'Seize Initiative',
        'Uncanny Dodge'
      ],
      tactics:
        'Strikes first, never stands still (Move-by Action) and goes after heroes who can’t keep up. Flees when the fight turns.',
      names: [
        ['Quick', 'Rapid', 'Blur', 'Mach', 'Velocity', 'Swift', 'Zip', 'Dash'],
        ['Streak', 'Runner', 'Comet', 'Flash', 'Rush', 'Jet', 'Bolt', 'Whip']
      ]
    },
    martial: {
      label: 'Martial artist',
      t: [-2, -1],
      s: [-2, -1],
      f: [-1, 0],
      ab: { STR: 'e', STA: 2, FGT: 'a', AGL: 'D', DEX: 2, INT: 1, AWE: 3, PRE: 1 },
      attack: { kind: 'unarmed', names: ['Martial Arts', 'Deadly Kicks', 'Pressure Points'] },
      extras: [
        ['Senses', 'Danger Sense', 2, 'Can’t be surprised; senses danger before it strikes.'],
        ['Leaping', 'Acrobatic Leap', 'half']
      ],
      skills: ['Acrobatics', 'Stealth', 'Insight', 'Intimidation'],
      adv: [
        'Takedown',
        'Evasion',
        'Improved Critical',
        'Defensive Attack',
        'Agile Feint',
        'Improved Trip',
        'Uncanny Dodge',
        'Daze'
      ],
      tactics:
        'Fights up close with feints and trips, focuses on one hero at a time and uses Takedown on anyone who drops.',
      names: [
        ['Lady', 'Silent', 'Iron', 'Shadow', 'Jade', 'Crimson', 'Golden', 'Ashen'],
        ['Lotus', 'Talon', 'Mantis', 'Tiger', 'Viper', 'Crane', 'Sensei', 'Dragon']
      ]
    },
    mentalist: {
      label: 'Mentalist',
      t: [0, 0],
      s: [-3, -2],
      f: [-3, -2],
      ab: { STR: 0, STA: 1, FGT: 1, AGL: 1, DEX: 1, INT: 3, AWE: 'W', PRE: 3 },
      attack: { kind: 'perception', names: ['Mind Blast', 'Psychic Assault', 'Neural Shock'] },
      extras: [
        ['Mind Reading', 'Telepathy', 'pl'],
        ['Affliction', 'Mind Control', 0],
        ['Senses', 'Mental Awareness', 1, 'Senses minds nearby.']
      ],
      skills: ['Insight', 'Deception', 'Persuasion', 'Perception', 'Expertise: Psychology'],
      adv: ['Fearless', 'Seize Initiative', 'Daze', 'Fascinate', 'Startle', 'Leadership', 'Well-informed'],
      tactics:
        'Hides behind minions, reads minds to learn the heroes’ plans, and turns the strongest hero against the others.',
      names: [
        ['Mind', 'Doctor', 'Psi', 'Brain', 'Mister', 'The', 'Lord', 'Madame'],
        ['Master', 'Cortex', 'Puppeteer', 'Whisper', 'Synapse', 'Oracle', 'Mesmer', 'Dread']
      ]
    },
    armored: {
      label: 'Armored villain',
      t: [0, 1],
      s: [1, 2],
      f: [1, 2],
      ab: { STR: 2, STA: 2, FGT: 2, AGL: 1, DEX: 'a', INT: 4, AWE: 2, PRE: 2 },
      attack: { kind: 'ranged', names: ['Repulsor Blast', 'Arm Cannon', 'Missile Pod', 'Laser Grid'], removable: true },
      extras: [
        ['Protection', 'Armor Plating', 0, '', ['Impervious'], true],
        ['Flight', 'Jet Boots', 'half', '', null, true],
        ['Senses', 'Sensor Suite', 4, 'Radio, infravision, extended sight.', null, true],
        ['Immunity', 'Sealed Suit', 10, 'Life support.', null, true]
      ],
      skills: ['Technology', 'Expertise: Science', 'Perception', 'Vehicles'],
      adv: ['Inventor', 'Improved Aim', 'Power Attack', 'Accurate Attack', 'Artificer', 'Eidetic Memory'],
      tactics:
        'Tanks hits, flies above the fight and fires the heaviest weapon. Without the suit (Removable), they are an ordinary genius.',
      names: [
        ['Iron', 'Steel', 'Chrome', 'Cobalt', 'Titanium', 'Mecha', 'Brass', 'Omega'],
        ['Baron', 'Breaker', 'Knight', 'Sentinel', 'Tyrant', 'Warlord', 'Engine', 'Mark']
      ]
    },
    controller: {
      label: 'Controller',
      t: [-1, 0],
      s: [-1, 0],
      f: [-1, 1],
      ab: { STR: 0, STA: 2, FGT: 1, AGL: 2, DEX: 'a', INT: 2, AWE: 2, PRE: 2 },
      attack: { kind: 'snare', names: ['Entangling Vines', 'Ice Prison', 'Gravity Well', 'Shadow Chains', 'Web Shot'] },
      extras: [
        ['Area', 'Storm Burst', 0],
        ['Move Object', 'Telekinesis', 'pl2'],
        ['Create', 'Walls', 'pl2']
      ],
      skills: ['Perception', 'Insight', 'Deception'],
      adv: ['Improved Aim', 'Accurate Attack', 'Set-up', 'Teamwork', 'Improved Initiative', 'Taunt'],
      tactics: 'Ties down the fastest hero first, builds walls to split the team, then picks them off.',
      names: [
        ['Mistress', 'Gravity', 'Vine', 'Glacier', 'Web', 'Eclipse', 'Quake', 'Tide'],
        ['Queen', 'Warden', 'Weaver', 'Lord', 'Shaper', 'Binder', 'Hex', 'Coil']
      ]
    },
    shadow: {
      label: 'Infiltrator',
      t: [-1, 0],
      s: [-2, -1],
      f: [-1, 0],
      ab: { STR: 1, STA: 1, FGT: 'a', AGL: 'D', DEX: 3, INT: 2, AWE: 3, PRE: 2 },
      attack: { kind: 'close', names: ['Shadow Blades', 'Phase Strike', 'Poisoned Knife'] },
      extras: [
        ['Concealment', 'Fade from Sight', 4, 'Invisible to normal sight.'],
        ['Teleport', 'Shadow Step', 'half'],
        ['Insubstantial', 'Ghost Form', 1, 'Can turn to fluid or shadow.']
      ],
      skills: ['Stealth', 'Deception', 'Insight', 'Sleight of Hand', 'Acrobatics'],
      adv: [
        'Hide in Plain Sight',
        'Evasion',
        'Improved Critical',
        'Agile Feint',
        'Startle',
        'Uncanny Dodge',
        'Takedown'
      ],
      tactics: 'Strikes from hiding, vanishes, strikes again. Targets the hero with the lowest Awareness.',
      names: [
        ['Night', 'Shade', 'Silent', 'Phantom', 'Velvet', 'Ghost', 'Gloom', 'Raven'],
        ['Stalker', 'Blade', 'Whisper', 'Wraith', 'Veil', 'Shroud', 'Knife', 'Specter']
      ]
    }
  };
  var MINIONS = {
    thug: {
      label: 'Thug',
      role: 'brute',
      attack: { kind: 'weapon', names: ['Club', 'Brass Knuckles', 'Crowbar'] },
      skills: ['Intimidation'],
      names: ['Thug', 'Goon', 'Heavy']
    },
    soldier: {
      label: 'Soldier',
      role: 'blaster',
      attack: { kind: 'ranged', names: ['Assault Rifle', 'Pulse Rifle'], removable: true },
      skills: ['Perception'],
      names: ['Trooper', 'Agent', 'Soldier']
    },
    drone: {
      label: 'Robot drone',
      role: 'armored',
      attack: { kind: 'ranged', names: ['Laser', 'Stun Ray'] },
      skills: ['Perception'],
      immune: true,
      names: ['Drone', 'Robot', 'Sentry']
    },
    beast: {
      label: 'Beast',
      role: 'brute',
      attack: { kind: 'close', names: ['Claws and Fangs', 'Bite'] },
      skills: ['Perception', 'Stealth'],
      names: ['Mutant Hound', 'Swamp Beast', 'Lab Creature']
    }
  };
  var MOTIVES = [
    'Greed: wants money and the power it buys.',
    'Power: wants to rule the city.',
    'Revenge on one of the heroes.',
    'Thrills: crime is a game.',
    'A twisted ideal: sure the world will thank them.',
    'Obeys a darker master.',
    'Desperate: someone they love is being held.',
    'Recognition: wants the world to know their name.'
  ];
  var FLAWS = [
    ['Temper', 'Loses control when mocked.'],
    ['Obsession', 'Can’t leave a puzzle or a rival alone.'],
    ['Rivalry', 'Has a long feud with one hero.'],
    ['Weakness', 'Their power fails against a rare substance.'],
    ['Honor', 'Never strikes a helpless foe.'],
    ['Phobia', 'Terrified of fire.'],
    ['Hatred', 'Despises a certain group.']
  ];

  function MMEnc(api) {
    var esc = api.esc,
      btn = api.btn,
      store = api.store,
      ui = api.ui;
    var MR = root.MMRules,
      M = root.MM;
    function E() {
      return (store.mmEnc = store.mmEnc || { pl: 10, n: 4, kind: 'bossmin', role: '', foes: [], run: null });
    }
    var U = (ui.mmEnc = ui.mmEnc || { open: {} });

    // ---------- building a villain ----------
    function power(name, effect, rank, mods, desc) {
      return {
        id: uid(),
        name: name,
        effect: effect,
        rank: Math.max(1, rank),
        mods: (mods || []).map(function (m) {
          var d = MODS()[m[0]];
          return { n: m[0], v: d ? d[2][0] : 1, r: m[1] || 1, note: m[2] || '' };
        }),
        desc: desc || ''
      };
    }
    var _mods;
    function MODS() {
      if (!_mods) {
        _mods = {};
        M.extras.concat(M.flaws).forEach(function (m) {
          _mods[m[0]] = m;
        });
      }
      return _mods;
    }
    function between(a) {
      return a[0] + R(a[1] - a[0] + 1);
    }
    function build(pl, roleId, minion) {
      var mt = minion ? MINIONS[minion] : null,
        role = ROLES[mt ? mt.role : roleId],
        h = MR.newHero();
      h.pl = pl;
      h.npc = roleId;
      h.minion = !!minion;
      h.spec = [];
      h.adv = [];
      h.powers = [];
      h.skills = {};
      var t = minion ? 0 : between(role.t),
        s = minion ? 0 : between(role.s),
        f = minion ? 0 : between(role.f);
      var kind = (mt ? mt.attack : role.attack).kind;
      var e = clamp(pl + t, 1, 2 * pl - 1),
        a = 2 * pl - e; // effect rank and attack bonus
      if (kind === 'perception') {
        e = pl;
        a = 0;
      } // no attack roll: rank ≤ PL
      var T = clamp(pl + s, 1, 2 * pl - 1),
        D = 2 * pl - T,
        P = 2 * pl - T - (R(3) === 0 ? 1 : 0);
      var F = clamp(pl + f, 1, 2 * pl - 1),
        W = 2 * pl - F;
      var want = function (k) {
        var v = role.ab[k];
        return v === 'e'
          ? e
          : v === 'a'
            ? a
            : v === 'T'
              ? T
              : v === 'D'
                ? D
                : v === 'W'
                  ? W
                  : Math.round(v * Math.min(1, pl / 8));
      };
      var ab = {};
      ['STR', 'STA', 'AGL', 'DEX', 'FGT', 'INT', 'AWE', 'PRE'].forEach(function (k) {
        ab[k] = Math.max(0, want(k));
      });
      // keep each ability under what its defense or attack allows
      ab.AGL = Math.min(ab.AGL, D);
      ab.FGT = Math.min(ab.FGT, P, kind === 'close' || kind === 'unarmed' || kind === 'weapon' ? a : 99);
      ab.STA = Math.min(ab.STA, T, F);
      ab.AWE = Math.min(ab.AWE, W);
      if (kind === 'ranged' || kind === 'snare') ab.DEX = Math.min(ab.DEX, a);
      if (kind !== 'unarmed')
        ab.STR = Math.min(ab.STR, Math.max(0, Math.min(T, 2 * pl - ab.FGT))); // the free unarmed attack stays in limits too
      else {
        ab.STR = e;
      }
      if (kind === 'weapon') ab.STR = Math.min(ab.STR, e - 1); // the weapon adds at least 1 rank on top of Strength
      Object.keys(ab).forEach(function (k) {
        ab[k] = Math.min(ab[k], pl + 10);
        h.ab[k] = ab[k];
      });
      h.def = {
        dodge: Math.max(0, D - ab.AGL),
        parry: Math.max(0, P - ab.FGT),
        fort: Math.max(0, F - ab.STA),
        will: Math.max(0, W - ab.AWE)
      };
      if (ab.STR + ab.FGT > 2 * pl) h.ab.STR = ab.STR = 2 * pl - ab.FGT;
      // main attack
      var an = pick((mt ? mt.attack : role.attack).names),
        close = kind === 'close' || kind === 'unarmed' || kind === 'weapon';
      var specRanks = Math.max(0, a - (close ? ab.FGT : ab.DEX));
      if (kind === 'unarmed') {
        if (specRanks) h.spec.push({ s: 'Close Combat', n: 'Unarmed', r: specRanks });
        h.attackName = an;
      } // Strength is the damage
      else {
        var mods = [],
          eff = 'Damage',
          rank = e,
          desc = '';
        if (kind === 'ranged') mods.push(['Increased Range', 1]);
        if (kind === 'perception') {
          eff = 'Affliction';
          mods.push(['Increased Range', 2]);
          desc = 'Will resists: dazed, then stunned, then incapacitated.';
        }
        if (kind === 'snare') {
          eff = 'Affliction';
          mods.push(['Increased Range', 1], ['Cumulative', 1], ['Extra Condition', 1]);
          mods.push(['Limited Degree', 1]);
          desc = 'Dodge resists: hindered and vulnerable, then defenseless and immobile.';
        }
        if (kind === 'weapon') {
          mods.push(['Removable', 1]);
          rank = Math.max(1, e - ab.STR);
          desc = 'A weapon that adds Strength.';
        }
        (role.attack.mods || []).forEach(function (m) {
          if (!mt) mods.push(m);
        });
        if ((mt ? mt.attack : role.attack).removable) mods.push(['Removable', 1]);
        var p = power(an, eff, rank, mods, desc);
        if (kind === 'weapon') p.str = true;
        if (eff === 'Affliction') p.resist = kind === 'snare' ? 'Dodge' : 'Will';
        h.powers.push(p);
        if (specRanks && kind !== 'perception')
          h.spec.push({ s: close ? 'Close Combat' : 'Ranged Combat', n: an, r: specRanks });
      }
      // toughness from powers
      var prot = Math.max(0, T - ab.STA);
      // extra powers (villains get two or three, minions none)
      var extras = minion
        ? []
        : role.extras
            .slice()
            .sort(function () {
              return Math.random() - 0.5;
            })
            .slice(0, 2 + R(2));
      if (role === ROLES.brute || role === ROLES.armored)
        extras = extras
          .filter(function (x) {
            return x[0] !== 'Protection';
          })
          .concat(
            role.extras.filter(function (x) {
              return x[0] === 'Protection';
            })
          );
      if (mt && mt.immune)
        h.powers.push(power('Robot', 'Immunity', 30, [], 'Immune to Fortitude effects (it’s a machine).'));
      extras.forEach(function (x) {
        var eff = x[0],
          nm = x[1],
          r = x[2],
          dsc = x[3] || '',
          mods = (x[4] || []).map(function (m) {
            return [m, 1];
          });
        if (x[5]) mods.push(['Removable', 1]);
        if (r === 'half') r = Math.max(1, Math.round(pl / 2));
        else if (r === 'speed') r = Math.max(2, Math.round(pl / 2) + 2);
        else if (r === 'pl') r = pl;
        else if (r === 'pl2') r = Math.max(1, pl - 2);
        if (eff === 'Protection') {
          if (prot) h.powers.push(power(nm || 'Protection', 'Protection', prot, mods, dsc || 'Hard to hurt.'));
          prot = 0;
          return;
        }
        if (eff === 'Area') {
          h.powers.push(
            power(
              nm,
              'Damage',
              Math.max(1, pl - 2),
              [
                ['Area', 1, 'Burst'],
                ['Increased Range', 1]
              ],
              'Hits everyone in the area (Dodge for half).'
            )
          );
          return;
        }
        if (eff === 'Affliction') {
          h.powers.push(
            Object.assign(
              power(
                nm,
                'Affliction',
                Math.max(1, pl - 1),
                [['Increased Range', 2]],
                'Will resists: entranced, compelled, controlled.'
              ),
              { resist: 'Will' }
            )
          );
          return;
        }
        if (eff === 'Move Object' || eff === 'Create') {
          h.powers.push(power(nm, eff, Math.min(r, pl), [], dsc));
          return;
        }
        h.powers.push(power(nm, eff, r, mods, dsc));
      });
      if (prot)
        h.powers.push(power(minion ? 'Armor' : 'Tough Hide', 'Protection', prot, minion ? [['Removable', 1]] : [], ''));
      // skills: bonus stays within PL + 10
      var skills = (mt ? mt.skills : role.skills).slice(0, minion ? 1 : 3 + R(2));
      skills.forEach(function (sk) {
        var sp = /^Expertise: (.*)$/.exec(sk),
          abil = sp
            ? 'INT'
            : (M.skills.filter(function (x) {
                return x[0] === sk;
              })[0] || [])[1];
        if (!abil) return;
        var r = clamp(Math.round(pl * (minion ? 0.3 : 0.6)) + R(3), 0, pl + 10 - ab[abil]);
        if (!r) return;
        if (sp) h.spec.push({ s: 'Expertise', n: sp[1], r: r });
        else h.skills[sk] = r;
      });
      // advantages that don't change the numbers above
      if (!minion)
        role.adv
          .slice()
          .sort(function () {
            return Math.random() - 0.5;
          })
          .slice(0, 2 + R(3))
          .forEach(function (n) {
            h.adv.push({
              n: n,
              r: n === 'Improved Initiative' ? 1 + R(2) : 1,
              note: n === 'Improved Critical' || n === 'Precise Attack' ? 'main attack' : ''
            });
          });
      // name and story
      if (minion) h.name = pick(mt.names);
      else h.name = pick(role.names[0]) + ' ' + pick(role.names[1]);
      h.comp = minion
        ? [
            { k: 'Motivation', t: 'Paid to fight.' },
            { k: 'Responsibility', t: 'Follows orders.' }
          ]
        : [{ k: 'Motivation', t: pick(MOTIVES) }].concat(
            [pick(FLAWS)].map(function (c) {
              return { k: c[0], t: c[1] };
            })
          );
      h.tactics = minion ? 'Minions: one failed resistance check and they’re out.' : role.tactics;
      h.role = mt ? mt.label : role.label;
      var d = MR.derive(h);
      h.extra = Math.max(0, d.pp.total - 15 * pl); // villains aren't held to the point budget; show what they cost
      return h;
    }
    function generate() {
      var e = E(),
        pl = clamp(+e.pl || 10, 1, 20),
        n = clamp(+e.n || 4, 1, 8),
        roles = Object.keys(ROLES),
        foes = [];
      var villain = function (p) {
        return build(p, e.role || pick(roles));
      };
      var minions = function (count, p) {
        var k = pick(Object.keys(MINIONS)),
          nm = pick(MINIONS[k].names);
        for (var i = 0; i < count; i++) {
          var m = build(Math.max(1, p), k, k);
          m.name = nm + ' ' + (i + 1);
          foes.push(m);
        }
      };
      if (e.kind === 'boss') foes.push(villain(Math.min(20, pl + 2)));
      else if (e.kind === 'team') {
        var used = [];
        for (var i = 0; i < n; i++) {
          var r =
            e.role ||
            pick(
              roles
                .filter(function (x) {
                  return used.indexOf(x) < 0;
                })
                .concat(used.length >= roles.length ? roles : [])
            );
          used.push(r);
          foes.push(build(pl, r));
        }
      } else if (e.kind === 'bossmin') {
        foes.push(villain(Math.min(20, pl + 1)));
        minions(n * 2, pl - 4);
      } else minions(n * 3, pl - 3);
      e.foes = foes;
      e.run = null;
      U.open = {};
      if (foes[0]) U.open[foes[0].id] = 1;
    }

    // ---------- showing a villain ----------
    var fmt = function (n) {
      return (n >= 0 ? '+' : '') + n;
    };
    function preFoe(id) {
      return (root.MMFoes || []).filter(function (f) {
        return f.id === id;
      })[0];
    }
    function defOf(v) {
      return typeof v === 'number' ? v : parseInt(v, 10) || 0;
    }
    var ABN = ['STR', 'STA', 'AGL', 'DEX', 'FGT', 'INT', 'AWE', 'PRE'],
      DEFN = ['Dodge', 'Parry', 'Fortitude', 'Toughness', 'Will'];
    // a ready-made foe's stat block; h is the encounter entry (or null on the Villains page)
    function preBlock(f, h, open, tools) {
      var key = h ? h.id : 'f:' + f.id;
      var head =
        '<button type="button" class="mm-phead" data-act="mmeOpen" data-v="' +
        esc(key) +
        '"><b>' +
        esc(h ? h.name : f.n) +
        '</b> <span class="small muted">' +
        esc(f.kind) +
        ' · PL ' +
        f.pl +
        (f.minion ? ' · minion' : '') +
        '</span><span class="spacer"></span><span aria-hidden="true">' +
        (open ? '▾' : '▸') +
        '</span></button>';
      var att = function (a) {
        return (
          '<b>' +
          esc(a[0]) +
          '</b> ' +
          (a[1] == null ? 'no roll' : fmt(a[1])) +
          ', rank ' +
          a[2] +
          ' (DC ' +
          (15 + a[2]) +
          ')' +
          (a[3] ? ' <span class="muted">' + esc(a[3]) + '</span>' : '')
        );
      };
      var line =
        '<div class="small mme-quick">' +
        f.att.map(att).join(' · ') +
        '<br>' +
        DEFN.map(function (n, i) {
          return n + ' ' + f.def[i];
        }).join(' · ') +
        ' · Init ' +
        fmt(f.init) +
        '</div>';
      if (!open) return '<div class="panel mm-power mme-foe">' + head + line + '</div>';
      return (
        '<div class="panel mm-power open mme-foe">' +
        head +
        '<p class="small muted">' +
        esc(f.about) +
        '</p><p class="small">' +
        ABN.map(function (n, i) {
          return n + ' ' + (f.ab[i] == null ? '—' : f.ab[i]);
        }).join(' · ') +
        '</p>' +
        '<h4>Offense</h4><ul class="small mme-list">' +
        f.att
          .map(function (a) {
            return '<li>' + att(a) + '</li>';
          })
          .join('') +
        '</ul>' +
        '<h4>Defense</h4><p class="small">' +
        DEFN.map(function (n, i) {
          return n + ' ' + f.def[i];
        }).join(' · ') +
        ' · Initiative ' +
        fmt(f.init) +
        '</p>' +
        (f.pow
          ? '<h4>Powers</h4><ul class="small mme-list">' +
            f.pow
              .map(function (x) {
                return '<li>' + esc(x) + '</li>';
              })
              .join('') +
            '</ul>'
          : '') +
        (f.adv ? '<p class="small"><b>Advantages:</b> ' + esc(f.adv) + '</p>' : '') +
        (f.sk ? '<p class="small"><b>Skills:</b> ' + esc(f.sk) + '</p>' : '') +
        (f.eq ? '<p class="small"><b>Equipment:</b> ' + esc(f.eq) + '</p>' : '') +
        '<div class="toolbar">' +
        tools +
        '</div></div>'
      );
    }
    function statBlock(h) {
      if (h.pre) {
        var f = preFoe(h.pre);
        return f ? preBlock(f, h, U.open[h.id], btn('mmeRm', 'Remove', { v: h.id }, 'btn small')) : '';
      }
      var d = MR.derive(h),
        open = U.open[h.id];
      var att = d.attacks
        .filter(function (x) {
          return x.n !== 'Unarmed' || h.attackName || h.ab.STR >= Math.round(h.pl / 2);
        })
        .map(function (x) {
          return x.n === 'Unarmed' && h.attackName ? Object.assign({}, x, { n: h.attackName }) : x;
        });
      var head =
        '<button type="button" class="mm-phead" data-act="mmeOpen" data-v="' +
        h.id +
        '"><b>' +
        esc(h.name) +
        '</b> <span class="small muted">' +
        esc(h.role) +
        ' · PL ' +
        h.pl +
        (h.minion ? ' · minion' : '') +
        '</span><span class="spacer"></span><span aria-hidden="true">' +
        (open ? '▾' : '▸') +
        '</span></button>';
      var line =
        '<div class="small mme-quick">' +
        att
          .map(function (x) {
            return (
              '<b>' +
              esc(x.n) +
              '</b> ' +
              (x.bonus == null ? 'no roll' : fmt(x.bonus)) +
              ', ' +
              esc(x.kind) +
              ' ' +
              x.rank
            );
          })
          .join(' · ') +
        '<br>Dodge ' +
        d.def.dodge +
        ' · Parry ' +
        d.def.parry +
        ' · Tough ' +
        d.def.tough +
        ' · Fort ' +
        d.def.fort +
        ' · Will ' +
        d.def.will +
        '</div>';
      if (!open) return '<div class="panel mm-power mme-foe">' + head + line + '</div>';
      var M2 = root.MM,
        abl = M2.abilities
          .map(function (x) {
            return x[0] + ' ' + d.ab[x[0]];
          })
          .join(' · ');
      var powers = (h.powers || [])
        .filter(function (p) {
          return p.effect !== 'Feature';
        })
        .map(function (p) {
          return (
            '<li><b>' +
            esc(p.name) +
            ':</b> ' +
            esc(p.effect) +
            ' ' +
            p.rank +
            ((p.mods || []).length
              ? ', ' +
                esc(
                  p.mods
                    .map(function (m) {
                      return m.n + (m.r > 1 ? ' ' + m.r : '') + (m.note ? ' (' + m.note + ')' : '');
                    })
                    .join(', ')
                )
              : '') +
            (p.desc ? ' — <span class="muted">' + esc(p.desc) + '</span>' : '') +
            '</li>'
          );
        })
        .join('');
      var skills = Object.keys(d.skills)
        .filter(function (k) {
          return d.skills[k].r;
        })
        .map(function (k) {
          return k + ' ' + fmt(d.skills[k].total);
        })
        .concat(
          (h.spec || [])
            .filter(function (x) {
              return x.s === 'Expertise';
            })
            .map(function (x) {
              return 'Expertise: ' + x.n + ' ' + fmt(x._total);
            })
        );
      var warn = d.warnings.filter(function (w) {
        return !/power points|complications/.test(w);
      });
      return (
        '<div class="panel mm-power open mme-foe">' +
        head +
        '<p class="small">' +
        abl +
        '</p>' +
        '<h4>Offense</h4><ul class="small mme-list">' +
        att
          .map(function (x) {
            return (
              '<li><b>' +
              esc(x.n) +
              '</b> — ' +
              esc(x.range) +
              ', ' +
              (x.bonus == null ? 'no attack roll' : 'attack ' + fmt(x.bonus)) +
              ', ' +
              esc(x.kind) +
              ' ' +
              x.rank +
              (x.resist ? ' (DC ' + x.dc + ' ' + esc(x.resist) + ')' : '') +
              '</li>'
            );
          })
          .join('') +
        '</ul>' +
        '<h4>Defense</h4><p class="small">Dodge ' +
        d.def.dodge +
        ' · Parry ' +
        d.def.parry +
        ' · Fortitude ' +
        d.def.fort +
        ' · Toughness ' +
        d.def.tough +
        ' · Will ' +
        d.def.will +
        ' · Initiative ' +
        fmt(d.init) +
        '</p>' +
        (powers ? '<h4>Powers</h4><ul class="small mme-list">' + powers + '</ul>' : '') +
        (skills.length ? '<p class="small"><b>Skills:</b> ' + esc(skills.join(', ')) + '</p>' : '') +
        ((h.adv || []).length
          ? '<p class="small"><b>Advantages:</b> ' +
            esc(
              h.adv
                .map(function (x) {
                  return x.n + (x.r > 1 ? ' ' + x.r : '') + (x.note ? ' (' + x.note + ')' : '');
                })
                .join(', ')
            ) +
            '</p>'
          : '') +
        '<p class="small"><b>Tactics:</b> ' +
        esc(h.tactics || '') +
        '</p>' +
        (h.minion
          ? ''
          : '<p class="small"><b>' +
            esc(
              h.comp.map(function (c) {
                return c.k + ':';
              })[0]
            ) +
            '</b> ' +
            esc(h.comp[0].t) +
            (h.comp[1] ? ' <b>' + esc(h.comp[1].k) + ':</b> ' + esc(h.comp[1].t) : '') +
            '</p>') +
        '<p class="small muted">' +
        d.pp.total +
        ' power points' +
        (warn.length ? ' · ⚠ ' + esc(warn.join(' ')) : ' · within PL ' + h.pl + ' limits') +
        '</p>' +
        '<div class="toolbar">' +
        btn('mmeReroll', '↻ New one', { v: h.id }, 'btn small') +
        btn('mmeSave', 'Copy to my heroes', { v: h.id }, 'btn small') +
        btn('mmeRm', 'Remove', { v: h.id }, 'btn small') +
        '</div></div>'
      );
    }

    // ---------- the party: the GM's list of heroes with their defenses, hero points and damage ----------
    function teams() {
      return (store.mmTeams = store.mmTeams || []);
    }
    function teamById(id) {
      return teams().filter(function (x) {
        return x.id === id;
      })[0];
    }
    function curTeam() {
      return teamById(U.team) || teams()[0] || null;
    }
    function newMember(pl) {
      return {
        id: uid(),
        n: '',
        pl: pl || 10,
        tough: 0,
        dodge: 0,
        parry: 0,
        fort: 0,
        will: 0,
        hp: 1,
        bruise: 0,
        cond: ''
      };
    }
    function teamLine(t) {
      if (!t.m.length) return 'No heroes yet.';
      var pls = t.m.map(function (x) {
          return +x.pl || 1;
        }),
        lo = Math.min.apply(null, pls),
        hi = Math.max.apply(null, pls),
        hurt = t.m.filter(function (x) {
          return x.bruise || x.cond;
        }).length;
      return (
        t.m.length +
        ' hero' +
        (t.m.length === 1 ? '' : 'es') +
        ', PL ' +
        (lo === hi ? lo : lo + '–' + hi) +
        ' · ' +
        t.m.reduce(function (a, x) {
          return a + (+x.hp || 0);
        }, 0) +
        ' hero points' +
        (hurt ? ' · ' + hurt + ' hurt' : '')
      );
    }
    function teamPL(t) {
      var c = {};
      t.m.forEach(function (x) {
        c[x.pl] = (c[x.pl] || 0) + 1;
      });
      return (
        +Object.keys(c).sort(function (a, b) {
          return c[b] - c[a] || b - a;
        })[0] || 10
      );
    }
    function partyPage() {
      var t = curTeam(),
        list = teams();
      if (!t)
        return (
          '<main class="mon-main"><h2>Party</h2><p class="muted">Keep your players’ heroes here: power level, defenses, hero points and the damage they’ve taken. Encounters uses them to set the power level, and damage carries over from fight to fight.</p>' +
          btn('mmtNew', '+ New party', {}, 'btn primary') +
          '</main>'
        );
      var mine = ((store.mm && store.mm.heroes) || []).filter(function (h) {
        return h.name;
      });
      var f = function (m, k, label, w) {
        return (
          '<label class="pm-f' +
          (w ? ' wide' : '') +
          '"><span>' +
          label +
          '</span><input type="' +
          (w ? 'text' : 'number') +
          '"' +
          (w ? '' : ' inputmode="numeric"') +
          ' id="mmt-' +
          k +
          '-' +
          m.id +
          '" data-mmt="' +
          m.id +
          '" data-f="' +
          k +
          '" value="' +
          esc(m[k] == null ? '' : m[k]) +
          '"></label>'
        );
      };
      var rows = t.m
        .map(function (m) {
          return (
            '<div class="panel pm' +
            (m.cond === 'Incapacitated' ? ' down' : '') +
            '"><div class="pm-row">' +
            f(m, 'n', 'Name', 1) +
            f(m, 'pl', 'PL') +
            btn('mmtRm', '✕', { v: m.id }, 'btn small') +
            '</div>' +
            '<div class="pm-row pm-def">' +
            f(m, 'tough', 'Tough') +
            f(m, 'dodge', 'Dodge') +
            f(m, 'parry', 'Parry') +
            f(m, 'fort', 'Fort') +
            f(m, 'will', 'Will') +
            '</div>' +
            '<div class="pm-hp"><span>Hero points <span class="mm-step">' +
            btn('mmtHp', '−', { v: m.id, d: -1 }, 'mm-b') +
            '<b>' +
            (+m.hp || 0) +
            '</b>' +
            btn('mmtHp', '+', { v: m.id, d: 1 }, 'mm-b') +
            '</span></span>' +
            '<span class="small">' +
            (m.bruise ? 'Toughness −' + m.bruise : 'Unhurt') +
            '</span>' +
            (m.cond ? '<span class="mme-cond">' + esc(m.cond) + '</span>' : '') +
            (m.bruise || m.cond ? btn('mmtHeal', 'Recover', { v: m.id }, 'btn small') : '') +
            '</div></div>'
          );
        })
        .join('');
      return (
        '<main class="mon-main"><h2>Party</h2>' +
        '<div class="toolbar">' +
        (list.length > 1
          ? '<select data-mmtpick="1" aria-label="Choose a party">' +
            list
              .map(function (x) {
                return (
                  '<option value="' +
                  x.id +
                  '"' +
                  (x === t ? ' selected' : '') +
                  '>' +
                  esc(x.name || 'Unnamed party') +
                  '</option>'
                );
              })
              .join('') +
            '</select>'
          : '') +
        btn('mmtNew', '+ New party', {}, 'btn small') +
        '</div>' +
        '<div class="panel"><label class="field"><span>Party name</span><input type="text" id="mmt-name" data-mmtname="1" value="' +
        esc(t.name || '') +
        '" placeholder="The Liberty Squad"></label><p class="small muted" style="margin:.4rem 0 0">' +
        esc(teamLine(t)) +
        '</p>' +
        '<div class="toolbar">' +
        btn('mmtPlan', (root.Icon ? root.Icon('swords') : '') + ' Plan an encounter for them', {}, 'btn primary') +
        btn('mmtRest', 'New session', {}, 'btn small') +
        '</div>' +
        '<p class="small muted" style="margin:0">New session: damage healed and everyone back to 1 hero point.</p></div>' +
        rows +
        '<div class="toolbar">' +
        btn('mmtAdd', '+ Add a hero', {}, 'btn') +
        (mine.length
          ? '<select data-mmtmine="1" aria-label="Add one of my heroes"><option value="">+ One of my heroes…</option>' +
            mine
              .map(function (h) {
                return '<option value="' + h.id + '">' + esc(h.name) + '</option>';
              })
              .join('') +
            '</select>'
          : '') +
        '</div>' +
        '<div class="toolbar">' +
        (U.delTeam
          ? '<span>Delete “' +
            esc(t.name || 'this party') +
            '”?</span>' +
            btn('mmtDel', 'Yes, delete', {}, 'btn small danger') +
            btn('mmtDelNo', 'No', {}, 'btn small')
          : btn('mmtDelAsk', 'Delete this party', {}, 'btn small')) +
        '</div></main>'
      );
    }

    // ---------- the fight ----------
    var DMG = ['', 'Bruised', 'Dazed', 'Staggered', 'Incapacitated'];
    function startRun() {
      var e = E(),
        list = [];
      e.foes.forEach(function (h) {
        if (h.pre) {
          var f = preFoe(h.pre);
          if (f)
            list.push({
              k: h.id,
              n: h.name,
              foe: true,
              minion: h.minion,
              init: 1 + R(20) + f.init,
              mod: f.init,
              tough: defOf(f.def[3]),
              bruise: 0,
              cond: '',
              dodge: defOf(f.def[0]),
              parry: defOf(f.def[1])
            });
          return;
        }
        var d = MR.derive(h);
        list.push({
          k: h.id,
          n: h.name,
          foe: true,
          minion: h.minion,
          init: 1 + R(20) + d.init,
          mod: d.init,
          tough: d.def.tough,
          bruise: 0,
          cond: '',
          dodge: d.def.dodge,
          parry: d.def.parry
        });
      });
      var t = teamById(e.team);
      if (t)
        t.m.forEach(function (m) {
          list.push({
            k: m.id,
            n: m.n || 'Hero',
            pc: true,
            team: t.id,
            init: 1 + R(20),
            mod: 0,
            tough: +m.tough || 0,
            bruise: +m.bruise || 0,
            cond: m.cond || '',
            dodge: +m.dodge || 0,
            parry: +m.parry || 0
          });
        });
      ((store.mm && store.mm.heroes) || [])
        .filter(function (h) {
          return (U.fighting || {})[h.id];
        })
        .forEach(function (h) {
          var d = MR.derive(h);
          list.push({
            k: h.id,
            n: h.name || 'Hero',
            pc: true,
            init: 1 + R(20) + d.init,
            mod: d.init,
            tough: d.def.tough,
            bruise: 0,
            cond: '',
            dodge: d.def.dodge,
            parry: d.def.parry
          });
        });
      list.sort(function (x, y) {
        return y.init - x.init || y.mod - x.mod;
      });
      e.run = { list: list, turn: 0, round: 1, log: '' };
    }
    // A Toughness check against DC 15 + damage rank: each 5 points of failure is one more degree.
    function hit(c, rank) {
      if (c.cond === 'Incapacitated') return c.n + ' is already out.';
      var tough = c.tough - c.bruise,
        roll = 1 + R(20),
        total = roll + tough,
        dc = 15 + rank,
        how = '(' + roll + ' + ' + tough + ' = ' + total + ' vs DC ' + dc + ')';
      if (total >= dc) return c.n + ' resists ' + how + '.';
      var deg = Math.min(4, Math.ceil((dc - total) / 5));
      if (c.minion || (deg === 3 && c.cond === 'Staggered')) deg = 4; // minions drop at once; staggered twice is out
      var res = deg === 4 ? 'Incapacitated' : DMG[deg];
      if (deg < 4) c.bruise++;
      if (deg >= 2 && DMG.indexOf(res) > DMG.indexOf(c.cond)) c.cond = res;
      return (
        c.n +
        ' fails by ' +
        deg +
        ' degree' +
        (deg > 1 ? 's ' : ' ') +
        how +
        ': ' +
        (c.minion ? 'a minion, so out.' : deg === 1 ? '−1 Toughness.' : res + (deg < 4 ? ' and −1 Toughness.' : '.'))
      );
    }
    function writeBack(c) {
      var t = c && c.team && teamById(c.team),
        m =
          t &&
          t.m.filter(function (x) {
            return x.id === c.k;
          })[0];
      if (m) {
        m.bruise = c.bruise;
        m.cond = c.cond;
      }
    }
    function runHtml() {
      var run = E().run,
        TB = root.Table,
        hi = TB && TB.hostInfo && TB.hostInfo(),
        blank = { tough: 0, bruise: 0, cond: '', dodge: 0, parry: 0 };
      if (hi) {
        TB.watch(
          hi.code,
          function (st) {
            if (st && TB.mergeRun(E().run, st, blank)) api.render && api.render();
          },
          'mmenc'
        );
        TB.mergeRun(run, hi.state, blank);
      }
      return (
        '<div class="panel enc-run"><div class="toolbar" style="margin:0"><h3 style="margin:0">Round ' +
        run.round +
        '</h3><span class="spacer"></span>' +
        btn('mmeNext', 'Next turn ▶', {}, 'btn primary') +
        btn('mmeStop', 'End fight', {}, 'btn') +
        '</div>' +
        (run.log ? '<p class="rest-msg small">' + esc(run.log) + '</p>' : '') +
        '<p class="small muted">Type the damage rank of a hit and tap Hit: the app rolls the Toughness check (DC 15 + rank) and fills in the damage track. Minions are out after any failed check.</p>' +
        run.list
          .map(function (c, i) {
            var out = c.cond === 'Incapacitated';
            return (
              '<div class="enc-c mme-c' +
              (i === run.turn ? ' turn' : '') +
              (out ? ' down' : '') +
              (c.foe ? '' : ' pc') +
              '">' +
              '<input type="number" class="enc-init" id="mmi-' +
              c.k +
              '" data-mmeinit="' +
              c.k +
              '" value="' +
              c.init +
              '" aria-label="Initiative of ' +
              esc(c.n) +
              '">' +
              '<div class="enc-cn"><b>' +
              esc(c.n) +
              '</b>' +
              (c.minion ? ' <span class="small muted">minion</span>' : '') +
              '<div class="small muted">Tough ' +
              (c.tough - c.bruise) +
              (c.bruise ? ' (−' + c.bruise + ')' : '') +
              ' · Dodge ' +
              c.dodge +
              ' · Parry ' +
              c.parry +
              '</div>' +
              (c.cond ? '<span class="mme-cond">' + esc(c.cond) + '</span>' : '') +
              '</div>' +
              '<div class="mme-hit"><input type="number" inputmode="numeric" min="1" max="40" id="mmr-' +
              c.k +
              '" data-mmerank="' +
              c.k +
              '" placeholder="rank" aria-label="Damage rank against ' +
              esc(c.n) +
              '">' +
              btn('mmeHit', 'Hit', { v: c.k }, 'btn small') +
              btn('mmeHeal', 'Recover', { v: c.k }, 'btn small') +
              '</div></div>'
            );
          })
          .join('') +
        '</div>'
      );
    }

    function html() {
      var e = E(),
        heroes = ((store.mm && store.mm.heroes) || []).filter(function (h) {
          return h.name;
        });
      if (e.run) return '<main class="mon-main"><h2>Encounters</h2>' + runHtml() + '</main>';
      var kinds = [
        ['bossmin', 'Villain + minions'],
        ['boss', 'One big villain'],
        ['team', 'Villain team'],
        ['minions', 'Only minions']
      ];
      return (
        '<main class="mon-main mme"><h2>Encounters</h2><p class="muted">Pick the heroes’ power level and how many there are: the app makes villains and minions with their own powers, skills and tactics, built within the power level limits.</p>' +
        '<div class="panel">' +
        (teams().length
          ? '<label class="field"><span>Party</span><select data-mmeteam="1"><option value="">— none —</option>' +
            teams()
              .map(function (x) {
                return (
                  '<option value="' +
                  x.id +
                  '"' +
                  (e.team === x.id ? ' selected' : '') +
                  '>' +
                  esc(x.name || 'Unnamed party') +
                  ' (' +
                  teamLine(x) +
                  ')</option>'
                );
              })
              .join('') +
            '</select></label>'
          : '<p class="small muted">Tip: add your players on the Party page and choose them here.</p>') +
        '<div class="row"><div class="field"><span>Heroes’ power level</span><span class="mm-step">' +
        btn('mmeSet', '−', { k: 'pl', d: -1 }, 'mm-b') +
        '<b>' +
        e.pl +
        '</b>' +
        btn('mmeSet', '+', { k: 'pl', d: 1 }, 'mm-b') +
        '</span></div>' +
        '<div class="field"><span>Number of heroes</span><span class="mm-step">' +
        btn('mmeSet', '−', { k: 'n', d: -1 }, 'mm-b') +
        '<b>' +
        e.n +
        '</b>' +
        btn('mmeSet', '+', { k: 'n', d: 1 }, 'mm-b') +
        '</span></div></div>' +
        '<div class="pills">' +
        kinds
          .map(function (k) {
            return btn('mmeKind', k[1], { v: k[0] }, 'pill' + (e.kind === k[0] ? ' on' : ''));
          })
          .join('') +
        '</div>' +
        (e.kind !== 'minions'
          ? '<label class="field"><span>Villain type</span><select data-mmerole="1"><option value="">Any (a mix)</option>' +
            Object.keys(ROLES)
              .map(function (r) {
                return (
                  '<option value="' + r + '"' + (e.role === r ? ' selected' : '') + '>' + ROLES[r].label + '</option>'
                );
              })
              .join('') +
            '</select></label>'
          : '') +
        '<p class="small muted">' +
        {
          boss: 'One villain at PL ' + Math.min(20, e.pl + 2) + ', strong enough to face the whole team alone.',
          bossmin:
            'A villain at PL ' +
            Math.min(20, e.pl + 1) +
            ' with ' +
            e.n * 2 +
            ' minions at PL ' +
            Math.max(1, e.pl - 4) +
            '.',
          team: e.n + ' villains at PL ' + e.pl + ', one for each hero.',
          minions: e.n * 3 + ' minions at PL ' + Math.max(1, e.pl - 3) + ': a warm-up fight.'
        }[e.kind] +
        '</p>' +
        '<div class="toolbar">' +
        btn('mmeGen', (root.Icon ? root.Icon('d20') : '') + ' Make the encounter', {}, 'btn primary') +
        '</div></div>' +
        (e.msg ? '<p class="rest-msg small">' + esc(e.msg) + '</p>' : '') +
        (e.foes.length
          ? '<h3>Foes</h3>' +
            e.foes.map(statBlock).join('') +
            '<div class="panel"><h4 style="margin-top:0">Who fights?</h4>' +
            (teamById(e.team)
              ? '<p class="small">' +
                esc(teamById(e.team).name || 'The party') +
                ': ' +
                esc(
                  teamById(e.team)
                    .m.map(function (m) {
                      return m.n || 'Hero';
                    })
                    .join(', ')
                ) +
                '</p>'
              : '') +
            (heroes.length
              ? '<div class="pills">' +
                heroes
                  .map(function (h) {
                    return btn('mmeFight', esc(h.name), { v: h.id }, 'pill' + ((U.fighting || {})[h.id] ? ' on' : ''));
                  })
                  .join('') +
                '</div>'
              : '<p class="small muted">Your heroes from the Heroes page can join the initiative list.</p>') +
            '<div class="toolbar">' +
            btn('mmeRun', (root.Icon ? root.Icon('swords') : '') + ' Run the fight', {}, 'btn primary') +
            '</div></div>'
          : '') +
        (root.SavedEnc ? root.SavedEnc.html('mm') : '') +
        '</main>'
      );
    }
    // ---------- Villains: ready-made foes from the rules ----------
    function foesPage() {
      var F = (U.ff = U.ff || { q: '', lo: '', hi: '', kind: '' }),
        q = F.q.toLowerCase(),
        all = root.MMFoes || [];
      var list = all.filter(function (f) {
        return (
          (!q || (f.n + ' ' + f.kind).toLowerCase().indexOf(q) >= 0) &&
          (F.lo === '' || f.pl >= +F.lo) &&
          (F.hi === '' || f.pl <= +F.hi) &&
          (!F.kind || f.kind === F.kind)
        );
      });
      var kinds = all
        .map(function (f) {
          return f.kind;
        })
        .filter(function (k, i, a) {
          return a.indexOf(k) === i;
        })
        .sort();
      var pls = [];
      for (var i = 1; i <= 12; i++) pls.push(i);
      var sel = function (k, label, opts) {
        return (
          '<label class="mon-f">' +
          label +
          ' <select data-mmff="' +
          k +
          '"><option value="">Any</option>' +
          opts
            .map(function (o) {
              return '<option' + (String(F[k]) === String(o) ? ' selected' : '') + '>' + esc(o) + '</option>';
            })
            .join('') +
          '</select></label>'
        );
      };
      var n = E().foes.length;
      return (
        '<main class="mon-main mme"><h2>Villains</h2><p class="muted">Ready-made foes from the M&amp;M rules: thugs, cops, robots and named villains. Add them to an encounter, or use them next to the ones the generator makes.</p>' +
        '<div class="panel"><div class="mon-tools"><input type="search" id="mmff-q" data-mmff="q" placeholder="Search villains…" value="' +
        esc(F.q) +
        '">' +
        sel('lo', 'PL from', pls) +
        sel('hi', 'to', pls) +
        sel('kind', 'Kind', kinds) +
        '</div>' +
        '<div class="small muted mon-count">' +
        list.length +
        ' foes</div>' +
        (U.added
          ? '<p class="small rest-msg">' +
            esc(U.added) +
            ' added: ' +
            n +
            ' in the encounter. <button type="button" class="linkbtn" data-act="section" data-v="mm-enc">Go to Encounters</button></p>'
          : '') +
        '</div>' +
        list
          .map(function (f) {
            return preBlock(
              f,
              null,
              U.open['f:' + f.id],
              btn('mmfAdd', '+ Add to encounter', { v: f.id }, 'btn small primary')
            );
          })
          .join('') +
        '<p class="small muted">Stat blocks from the Mutants &amp; Masterminds 3e SRD (Open Game Content, d20herosrd.com), shortened. Damage rank: the target makes a Toughness check against DC 15 + rank.</p></main>'
      );
    }

    // ---------- Rewards: what the heroes find ----------
    function lootState() {
      return (store.mmLoot = store.mmLoot || { pl: E().pl || 10, theme: '', last: null });
    }
    function rollLoot() {
      var L = lootState(),
        T = root.MMLoot,
        th = L.theme || pick(T.themes)[0],
        pl = L.pl;
      var fill = function (t) {
        return t
          .replace(/\{r\}/g, pl)
          .replace(/\{r-2\}/g, Math.max(1, pl - 2))
          .replace(/\{h\}/g, Math.max(1, Math.ceil(pl / 2)));
      };
      var devs = T.devices[th]
        .slice()
        .sort(function () {
          return Math.random() - 0.5;
        })
        .slice(0, 2)
        .map(function (d) {
          return [d[0], fill(d[1]), d[2]];
        });
      L.last = { theme: th, pl: pl, items: devs, clue: pick(T.clues), cash: Math.random() < 0.5 };
    }
    function lootPage() {
      var L = lootState(),
        T = root.MMLoot,
        t = L.last;
      var h =
        '<main class="mon-main tre-main mme"><h2>Rewards</h2><div class="panel"><p class="small muted">Heroes don’t loot bodies, but beaten villains leave things behind: gadgets, evidence, leads. Roll something to find after a fight.</p>' +
        '<div class="row"><div class="field"><span>Power level</span><span class="mm-step">' +
        btn('mmlSet', '−', { d: -1 }, 'mm-b') +
        '<b>' +
        L.pl +
        '</b>' +
        btn('mmlSet', '+', { d: 1 }, 'mm-b') +
        '</span></div>' +
        '<label class="field"><span>Villain’s style</span><select data-mmltheme="1"><option value="">Any</option>' +
        T.themes
          .map(function (x) {
            return '<option value="' + x[0] + '"' + (L.theme === x[0] ? ' selected' : '') + '>' + x[1] + '</option>';
          })
          .join('') +
        '</select></label></div>' +
        '<div class="toolbar">' +
        btn('mmlRoll', (root.Icon ? root.Icon('d20') : '') + ' What did they leave?', {}, 'btn primary') +
        '</div></div>';
      if (t)
        h +=
          '<div class="panel tre-result"><h3>Found <small class="muted">' +
          esc(
            (T.themes.filter(function (x) {
              return x[0] === t.theme;
            })[0] || ['', ''])[1]
          ) +
          ' · PL ' +
          t.pl +
          '</small></h3><ul class="tre-list">' +
          t.items
            .map(function (d) {
              return '<li><b>' + esc(d[0]) + '</b> — ' + esc(d[2]) + '<div class="small">' + esc(d[1]) + '</div></li>';
            })
            .join('') +
          '<li><b>A lead</b> — ' +
          esc(t.clue) +
          '</li>' +
          (t.cash
            ? '<li><b>Evidence and stolen goods</b> — enough to put the minions away and return what was taken; the grateful owners may become Contacts.</li>'
            : '') +
          '</ul></div>';
      if (t && api.ts)
        h += api.ts.html(
          t.items
            .map(function (d, i) {
              return { key: 'i' + i, n: d[0], note: d[1] + (d[2] ? ' (' + d[2] + ')' : '') };
            })
            .concat([{ key: 'lead', n: 'A lead', note: t.clue }]),
          0,
          'rewards'
        );
      return (
        h +
        '<div class="panel"><h3>Power points and hero points</h3><ul class="small">' +
        '<li>Give each hero <b>1 power point</b> per adventure (2 for a big finale); they spend them like the ones they started with.</li>' +
        '<li>Hero points go back to 1 at the start of each adventure; give one more for each complication that comes up in play.</li>' +
        '<li>A hero who wants to keep a found device for good pays for it: as Equipment, or as a power with Removable (−1 point per 5) or Easily Removable (−2 per 5). Otherwise it’s gone by the next adventure: broken, confiscated, or stolen back.</li></ul></div></main>'
      );
    }
    function foe(id) {
      return E().foes.filter(function (x) {
        return x.id === id;
      })[0];
    }
    function cur(k) {
      var r = E().run;
      return (
        r &&
        r.list.filter(function (x) {
          return x.k === k;
        })[0]
      );
    }
    var actions = {
      mmeSet: function (_, el) {
        var e = E(),
          k = el.getAttribute('data-k');
        e[k] = clamp((+e[k] || 0) + +el.getAttribute('data-d'), 1, k === 'pl' ? 20 : 8);
      },
      mmeKind: function (v) {
        E().kind = v;
      },
      mmeGen: function () {
        generate();
        E().msg = '';
      },
      mmeOpen: function (v) {
        U.open[v] = !U.open[v];
      },
      mmeReroll: function (v) {
        var e = E(),
          i = e.foes
            .map(function (x) {
              return x.id;
            })
            .indexOf(v);
        if (i < 0) return;
        var old = e.foes[i];
        var mk = old.minion
            ? Object.keys(MINIONS).filter(function (k) {
                return MINIONS[k].label === old.role;
              })[0]
            : null,
          n = build(old.pl, mk || e.role || pick(Object.keys(ROLES)), mk);
        if (mk) n.name = old.name;
        e.foes[i] = n;
        U.open[n.id] = 1;
      },
      mmeRm: function (v) {
        var e = E();
        e.foes = e.foes.filter(function (x) {
          return x.id !== v;
        });
      },
      mmeSave: function (v) {
        var h = JSON.parse(JSON.stringify(foe(v)));
        h.id = 'h' + uid();
        store.mm = store.mm || { heroes: [], cur: '' };
        store.mm.heroes.push(h);
        E().msg = h.name + ' is now in your Heroes, ready to edit.';
      },
      mmeFight: function (v) {
        U.fighting = U.fighting || {};
        U.fighting[v] = !U.fighting[v];
      },
      mmeRun: function () {
        startRun();
        if (root.Table) root.Table.pushRun(E().run, true);
        root.scrollTo(0, 0);
      },
      mmeNext: function () {
        var r = E().run;
        for (var i = 0; i < r.list.length; i++) {
          r.turn++;
          if (r.turn >= r.list.length) {
            r.turn = 0;
            r.round++;
          }
          if (r.list[r.turn].cond !== 'Incapacitated') break;
        }
        r.log = '';
        if (root.Table) root.Table.pushRun(r);
      },
      mmeStop: function () {
        E().run = null;
        if (root.Table) root.Table.pushRun(null);
      },
      mmfAdd: function (v) {
        var f = preFoe(v),
          e = E();
        if (!f) return;
        var same = e.foes.filter(function (x) {
          return x.pre === v;
        });
        if (same.length === 1 && same[0].name === f.n) same[0].name = f.n + ' 1';
        e.foes.push({
          id: uid(),
          pre: v,
          name: f.n + (same.length ? ' ' + (same.length + 1) : ''),
          minion: !!f.minion,
          pl: f.pl
        });
        U.added = f.n;
      },
      mmlSet: function (_, el) {
        var L = lootState();
        L.pl = clamp(L.pl + +el.getAttribute('data-d'), 1, 20);
      },
      mmlRoll: function () {
        rollLoot();
      },
      mmeHit: function (v) {
        var c = cur(v),
          box = document.getElementById('mmr-' + v),
          rank = Math.round(+(box && box.value));
        if (!c) return;
        if (!rank) {
          E().run.log = 'Type the damage rank first.';
          return;
        }
        E().run.log = hit(c, rank);
        writeBack(c);
      },
      mmeHeal: function (v) {
        var c = cur(v);
        if (!c) return;
        if (c.cond) c.cond = DMG[DMG.indexOf(c.cond) - 1] === 'Bruised' ? '' : DMG[DMG.indexOf(c.cond) - 1];
        else if (c.bruise) c.bruise--;
        E().run.log = c.n + ' recovers a step.';
        writeBack(c);
      },
      mmtNew: function () {
        var t = { id: uid(), name: '', m: [newMember(E().pl)] };
        teams().push(t);
        U.team = t.id;
        U.delTeam = false;
      },
      mmtAdd: function () {
        var t = curTeam();
        t.m.push(newMember(t.m[0] ? t.m[0].pl : E().pl));
      },
      mmtRm: function (v) {
        var t = curTeam();
        t.m = t.m.filter(function (x) {
          return x.id !== v;
        });
      },
      mmtHp: function (v, el) {
        var m = tm(v);
        if (m) m.hp = clamp((+m.hp || 0) + +el.getAttribute('data-d'), 0, 99);
      },
      mmtHeal: function (v) {
        var m = tm(v);
        if (!m) return;
        if (m.cond) m.cond = m.cond === 'Dazed' ? '' : DMG[DMG.indexOf(m.cond) - 1];
        else if (m.bruise) m.bruise--;
      },
      mmtRest: function () {
        curTeam().m.forEach(function (m) {
          m.bruise = 0;
          m.cond = '';
          m.hp = 1;
        });
      },
      mmtPlan: function () {
        var t = curTeam(),
          e = E();
        if (t.m.length) {
          e.pl = teamPL(t);
          e.n = clamp(t.m.length, 1, 8);
        }
        e.team = t.id;
        ui.section = 'mm-enc';
        root.scrollTo(0, 0);
      },
      mmtDelAsk: function () {
        U.delTeam = true;
      },
      mmtDelNo: function () {
        U.delTeam = false;
      },
      mmtDel: function () {
        var id = curTeam().id;
        store.mmTeams = teams().filter(function (x) {
          return x.id !== id;
        });
        U.team = '';
        U.delTeam = false;
        if (E().team === id) E().team = '';
      }
    };
    function tm(id) {
      var t = curTeam();
      return (
        t &&
        t.m.filter(function (x) {
          return x.id === id;
        })[0]
      );
    }
    function onInput(t) {
      if (t.getAttribute('data-mmff') != null) {
        U.ff[t.getAttribute('data-mmff')] = t.value;
        U.added = '';
        return 'render';
      }
      if (t.getAttribute('data-mmtname')) {
        curTeam().name = t.value;
        return 'save';
      }
      if (t.getAttribute('data-mmt')) {
        var m = tm(t.getAttribute('data-mmt')),
          k = t.getAttribute('data-f');
        if (m) m[k] = k === 'n' ? t.value : clamp(Math.round(+t.value) || 0, k === 'pl' ? 1 : 0, 99);
        return 'save';
      }
      if (t.getAttribute('data-mmeinit')) {
        var c = cur(t.getAttribute('data-mmeinit'));
        if (c) c.init = +t.value || 0;
        return 'save';
      }
      return null;
    }
    function onChange(t) {
      if (t.getAttribute('data-mmltheme')) {
        lootState().theme = t.value;
        return 'render';
      }
      if (t.getAttribute('data-mmff') != null) return 'render';
      if (t.getAttribute('data-mmerole')) {
        E().role = t.value;
        return 'render';
      }
      if (t.getAttribute('data-mmtpick')) {
        U.team = t.value;
        U.delTeam = false;
        return 'render';
      }
      if (t.getAttribute('data-mmtname') || t.getAttribute('data-mmt')) return 'render';
      if (t.getAttribute('data-mmtmine') && t.value) {
        var h = (store.mm.heroes || []).filter(function (x) {
          return x.id === t.value;
        })[0];
        if (h) {
          var d = MR.derive(h);
          curTeam().m.push({
            id: uid(),
            n: h.name,
            pl: d.pl,
            tough: d.def.tough,
            dodge: d.def.dodge,
            parry: d.def.parry,
            fort: d.def.fort,
            will: d.def.will,
            hp: 1,
            bruise: 0,
            cond: ''
          });
        }
        return 'render';
      }
      if (t.getAttribute('data-mmeteam') != null) {
        var e = E(),
          tt = teamById(t.value);
        e.team = t.value;
        if (tt && tt.m.length) {
          e.pl = teamPL(tt);
          e.n = clamp(tt.m.length, 1, 8);
        }
        return 'render';
      }
      if (t.getAttribute('data-mmeinit')) {
        var r = E().run,
          k = r.list[r.turn] && r.list[r.turn].k;
        r.list.sort(function (x, y) {
          return y.init - x.init || y.mod - x.mod;
        });
        r.turn = Math.max(
          0,
          r.list
            .map(function (x) {
              return x.k;
            })
            .indexOf(k)
        );
        return 'render';
      }
      return null;
    }
    // planned encounters: saved with a name and notes, opened or run later (js/saved-enc.js)
    if (root.SavedEnc)
      root.SavedEnc.register('mm', {
        list: function () {
          return (store.mmEncounters = store.mmEncounters || []);
        },
        cur: E,
        load: function (e) {
          e.run = null;
          e.msg = '';
          store.mmEnc = e;
        },
        fresh: function () {
          var e = E();
          return {
            name: '',
            notes: '',
            pl: e.pl,
            n: e.n,
            kind: e.kind,
            role: e.role,
            team: e.team,
            foes: [],
            run: null
          };
        },
        summary: function (e) {
          var n = e.foes.length;
          return n + ' foe' + (n === 1 ? '' : 's') + ' · PL ' + e.pl;
        },
        run: function () {
          if (!E().foes.length) return;
          actions.mmeRun();
          ui.section = 'mm-enc';
        }
      });
    return {
      html: html,
      partyPage: partyPage,
      foesPage: foesPage,
      lootPage: lootPage,
      actions: actions,
      onInput: onInput,
      onChange: onChange,
      _build: build
    };
  }
  MMEnc.ROLES = ROLES;
  MMEnc.MINIONS = MINIONS;
  root.MMEnc = MMEnc;
})(typeof window !== 'undefined' ? window : globalThis);
