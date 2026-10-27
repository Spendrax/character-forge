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
          K.actions.mmeRun();
          ui.section = 'mm-enc';
        }
      });
    // the parts (mm-enc-build.js, mm-enc-party.js, mm-enc-run.js, mm-enc-pages.js, mm-enc-actions.js) share these names through K
    var K = {
      E: E,
      FLAWS: FLAWS,
      M: M,
      MINIONS: MINIONS,
      MOTIVES: MOTIVES,
      MR: MR,
      R: R,
      ROLES: ROLES,
      U: U,
      api: api,
      btn: btn,
      clamp: clamp,
      esc: esc,
      pick: pick,
      store: store,
      ui: ui,
      uid: uid
    };
    ['build', 'party', 'run', 'pages', 'actions'].forEach(function (p) {
      root.MMEncParts[p](K);
    });
    return {
      html: K.html,
      partyPage: K.partyPage,
      foesPage: K.foesPage,
      lootPage: K.lootPage,
      actions: K.actions,
      onInput: K.onInput,
      onChange: K.onChange,
      _build: K.build
    };
  }
  MMEnc.ROLES = ROLES;
  MMEnc.MINIONS = MINIONS;
  root.MMEnc = MMEnc;
})(typeof window !== 'undefined' ? window : globalThis);
