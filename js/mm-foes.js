// Mutants & Masterminds 3e: ready-made foes and things heroes can find after a fight.
// Foes: the NPC and construct stat blocks of the M&M 3e SRD (Open Game Content, d20herosrd.com), shortened.
// Attacks: [name, attack bonus (null = no roll), damage rank (DC = 15 + rank), note].
(function (root) {
  'use strict';
  var I = 'Immune';
  root.MMFoes = [
    {
      id: 'zombie',
      n: 'Zombie',
      pl: 2,
      minion: 1,
      kind: 'Construct',
      about: 'A slow, shambling undead minion. Shrugs off anything that targets Fortitude or Will.',
      ab: [2, null, -1, -1, 1, null, -1, null],
      def: [0, 1, I, 3, I],
      init: -1,
      att: [['Slam', 1, 2]],
      pow: ['Undead: Immunity 30 (Fortitude effects), Protection 3']
    },
    {
      id: 'craftsman',
      n: 'The Craftsman',
      pl: 3,
      kind: 'Mastermind',
      about:
        'A genius engineer with a hidden workshop who builds gadgets and robots for criminals and governments alike. Never fights alone.',
      ab: [0, 1, 1, 1, 3, 11, 3, 3],
      def: [6, 5, 5, 4, 6],
      init: 1,
      att: [
        ['Tool', 3, 1],
        ['Unarmed', 3, 0]
      ],
      adv: 'Inventor, Jack-of-all-Trades, Connected, Contacts, Wealth 3, Minions (16 BuildBots), Headquarters (The Shop, Toughness 14)',
      sk: 'Expertise (engineering, electronics, mechanics, architecture) +26, Science +25, Technology +21, Persuasion +13, Deception +11',
      eq: 'Bulletproof vest, Cobbler A.I.'
    },
    {
      id: 'criminal-minion',
      n: 'Criminal Minion',
      pl: 4,
      minion: 1,
      kind: 'Thug',
      about: 'A street-level gang member: flimsy, but armed and threatening.',
      ab: [2, 2, 2, 3, 3, -1, 0, 1],
      def: [4, 4, 3, 4, 2],
      init: 6,
      att: [
        ['Machine pistol', 8, 3, 'Multiattack'],
        ['Knife', 6, 3],
        ['Unarmed', 6, 2]
      ],
      adv: 'All-out Attack, Close Attack 3, Defensive Roll 2, Fearless, Power Attack',
      sk: 'Athletics +8, Intimidation +7, Sleight of Hand +9, Stealth +8',
      eq: 'Smartphone, multi-tool, machine pistol, knife'
    },
    {
      id: 'turret-basic',
      n: 'Defense Turret (basic)',
      pl: 4,
      minion: 1,
      kind: 'Construct',
      about: 'A small mounted gun with automatic targeting, guarding a lair or vault.',
      ab: [null, null, 0, 5, 0, null, 0, null],
      def: [3, 3, I, 5, 2],
      init: 4,
      att: [['Gun', 5, 3, 'Ranged']],
      pow: ['Immunity (Fortitude effects)', 'Senses: commlink, infravision, extended sight', 'Small (Shrinking 6)']
    },
    {
      id: 'police',
      n: 'Police Officer',
      pl: 5,
      minion: 1,
      kind: 'Law',
      about: 'A patrol cop trained for close confrontations, with a sidearm and restraints.',
      ab: [2, 2, 2, 3, 3, 0, 1, 1],
      def: [5, 5, 3, 5, 3],
      init: 6,
      att: [
        ['Light pistol', 7, 3],
        ['Club', 6, 3],
        ['Unarmed', 6, 2]
      ],
      adv: 'Accurate Attack, Close Attack 3, Improved Grab, Improved Initiative, Power Attack',
      sk: 'Athletics +8, Expertise (law enforcement) +8, Intimidation +7, Investigation +6, Perception +7',
      eq: 'Bulletproof vest, light pistol, club, handcuffs, radio, flashlight'
    },
    {
      id: 'robot',
      n: 'Robot',
      pl: 5,
      minion: 1,
      kind: 'Construct',
      about: 'A basic heavy-plated robot built to punch things.',
      ab: [5, null, -1, -1, 0, null, 0, null],
      def: [0, 0, I, 10, I],
      init: -1,
      att: [['Slam', 4, 5]],
      pow: ['Armor: Protection 10, Impervious 6', 'Robot: Immunity 30 (Fortitude effects)']
    },
    {
      id: 'turret-standard',
      n: 'Defense Turret (standard)',
      pl: 5,
      minion: 1,
      kind: 'Construct',
      about: 'An automatic machine-gun turret.',
      ab: [null, null, 0, 6, 0, null, 0, null],
      def: [3, 3, I, 6, 2],
      init: 8,
      att: [['Machine gun', 6, 4, 'Multiattack, Penetrating 2']],
      pow: ['Immunity (Fortitude effects)', 'Small (Shrinking 6)']
    },
    {
      id: 'police-veteran',
      n: 'Police Officer, Veteran',
      pl: 6,
      minion: 1,
      kind: 'Law',
      about: 'A seasoned officer with a shotgun, good instincts and connections.',
      ab: [3, 2, 3, 3, 3, 1, 1, 2],
      def: [6, 6, 4, 6, 2],
      init: 11,
      att: [
        ['Shotgun', 7, 5],
        ['Heavy pistol', 7, 4],
        ['Unarmed', 6, 3]
      ],
      adv: 'Accurate Attack, Close Attack 3, Connected, Contacts, Fearless, Improved Aim, Improved Initiative',
      sk: 'Insight +7, Intimidation +8, Investigation +7, Perception +7, Vehicles +7',
      eq: 'Bulletproof vest, heavy pistol, shotgun, radio'
    },
    {
      id: 'slugger',
      n: 'Slugger',
      pl: 6,
      kind: 'Speedster',
      about: 'A former boxer with super-speed: weaker than most villains but fast and dangerous.',
      ab: [4, 4, 4, 4, 4, 0, 2, 1],
      def: [6, 6, 7, 6, 3],
      init: 16,
      att: [
        ['Punch', 8, 4],
        ['Power-attack punch', 5, 7],
        ['Baseball bat', 5, 6]
      ],
      pow: ['Super Speed: Quickness 3, Speed 6 (120 mph), Improved Initiative 8'],
      adv: 'Close Attack, Defensive Roll 2, Jack-of-all-Trades, Power Attack',
      sk: 'Acrobatics +10, Athletics +10, Intimidation +10, Sleight of Hand +8'
    },
    {
      id: 'turret-advanced',
      n: 'Defense Turret (advanced)',
      pl: 6,
      minion: 1,
      kind: 'Construct',
      about: 'A heavy turret with burst fire and a rocket launcher.',
      ab: [null, null, 0, 7, 0, null, 0, null],
      def: [3, 3, I, 8, 2],
      init: 8,
      att: [
        ['Burst fire', 7, 5, 'Multiattack'],
        ['Rocket', null, 6, '30-ft burst, Dodge DC 16 for half']
      ],
      pow: ['Immunity (Fortitude effects)', 'Small (Shrinking 6)']
    },
    {
      id: 'bruiser',
      n: 'Bruiser',
      pl: 7,
      kind: 'Brute',
      about: 'Big, tough and not too bright: his idea of tactics is picking up something heavy.',
      ab: [6, 6, 3, 2, 4, -1, 1, 0],
      def: [6, 6, 9, 8, 2],
      init: 3,
      att: [
        ['Unarmed', 8, 6],
        ['Improvised weapon', 7, 7],
        ['Thrown object', 7, 6, 'Ranged']
      ],
      pow: ['Leaping 9', 'Protection 2'],
      adv: 'All-out Attack, Improvised Weapon, Power Attack, Throwing Mastery',
      sk: 'Athletics +14, Intimidation +10, Acrobatics +9'
    },
    {
      id: 'dupli-kate',
      n: 'Dupli-Kate',
      pl: 7,
      kind: 'Thief',
      about: 'A bank robber who splits into copies of herself to rob several places at once and slip away.',
      ab: [2, 2, 3, 3, 3, 1, 1, 1],
      def: [7, 6, 4, 6, 4],
      init: 11,
      att: [
        ['Heavy pistol', 9, 4],
        ['Brass knuckles', 8, 3]
      ],
      pow: ['Duplication 6 (copies of up to 90 points)'],
      adv: 'Close Attack 3, Ranged Attack 3, Defensive Roll 4, Improved Initiative, Teamwork, Quick Draw',
      sk: 'Deception +6, Insight +7, Perception +7, Technology +9',
      eq: 'Brass knuckles, heavy pistol'
    },
    {
      id: 'hitman',
      n: 'Hitman',
      pl: 7,
      kind: 'Assassin',
      about: 'A professional killer. Somebody doesn’t like you.',
      ab: [2, 4, 4, 4, 4, 2, 3, 1],
      def: [8, 8, 5, 6, 5],
      init: 12,
      att: [
        ['Sniper rifle', 9, 4],
        ['Machine pistol', 9, 3, 'Multiattack'],
        ['Knife', 7, 3],
        ['Unarmed', 7, 2]
      ],
      adv: 'Accurate Attack, All-out Attack, Close Attack 3, Defensive Roll 2, Improved Aim, Improved Initiative 2, Precise Attack',
      sk: 'Acrobatics +10, Deception +9, Insight +9, Stealth +10, Vehicles +10',
      eq: 'Sniper rifle, machine pistol, knife, binoculars, radio'
    },
    {
      id: 'hummingbird',
      n: 'Hummingbird',
      pl: 7,
      kind: 'Infiltrator',
      about: 'A thief who flies and shrinks to a few inches tall, darting in with a sword. Defenses: shrunk (normal).',
      ab: [3, 3, 4, 4, 4, 0, 0, 2],
      def: ['9 (5)', '9 (5)', 4, '5 (7)', 9],
      init: 8,
      att: [
        ['Katana', 8, 6],
        ['Thrown object', 8, 4, 'Ranged'],
        ['Unarmed', 6, 3]
      ],
      pow: ['Wings: Flight 6 (120 mph)', 'Shrinking 8 (keeps full strength)'],
      adv: 'Close Attack 2, Ranged Attack 2, Defensive Roll 4, Improved Initiative, Move-by Action',
      sk: 'Acrobatics +10, Deception +10, Intimidation +10, Stealth +8 (+16 shrunk)',
      eq: 'Katana'
    },
    {
      id: 'spark',
      n: 'Spark',
      pl: 7,
      kind: 'Energy',
      about: 'A greedy, violent fire-wielder who takes whatever he wants.',
      ab: [0, 2, 4, 4, 4, 2, 0, 1],
      def: [7, 7, 4, 6, 7],
      init: 8,
      att: [
        ['Fire bolt', 8, 6, 'Ranged'],
        ['Flamethrower', null, 6, '60-ft line, Dodge DC 16 for half; burns again next round'],
        ['Flaming aura', 8, 6, 'hurts anyone who touches him'],
        ['Unarmed', 4, 0]
      ],
      pow: ['Fire Control array: Flamethrower, Fire Bolt, Flaming Aura (rank 6)', 'Flight 6 (120 mph)'],
      adv: 'All-out Attack, Defensive Roll 4, Improved Initiative',
      sk: 'Deception +9, Intimidation +9, Stealth +12, Ranged Combat (bolts) +8'
    },
    {
      id: 'earth-breaker',
      n: 'Earth Breaker',
      pl: 8,
      kind: 'Elemental',
      about: 'A heavy hitter who lifts and hurls rock. Arrogant, more brawn than plan.',
      ab: [5, 5, 2, 2, 3, -1, 1, -1],
      def: [6, 6, 8, 8, 3],
      init: 2,
      att: [
        ['Rock throw', 7, 7, 'Ranged'],
        ['Improvised weapon', 7, 7],
        ['Unarmed', 7, 5],
        ['Earth Shatter', null, 3, '60-ft cone: Hindered and Prone, DC 18']
      ],
      pow: [
        'Earth Control: Move Object 6 (rock only)',
        'Alternates: rock-platform Flight (120 mph), Earth Shatter cone, Burrowing 4',
        'Protection 3'
      ],
      adv: 'All-out Attack, Improvised Weapon 2, Power Attack',
      sk: 'Athletics +12, Intimidation +12, Perception +8'
    },
    {
      id: 'giant-robot',
      n: 'Giant Robot',
      pl: 8,
      kind: 'Construct',
      about: 'A towering armored robot. Slow and clumsy, but each hit can level a building.',
      ab: [16, null, 0, 0, 0, null, 0, null],
      def: [-5, -5, I, 16, I],
      init: 0,
      att: [['Slam', 0, 16]],
      pow: [
        'Armor: Protection 12, Impervious',
        'Giant: Growth 16 (permanent)',
        'Robot: Immunity 30 (Fortitude effects)'
      ]
    },
    {
      id: 'mob-boss',
      n: 'Mob Boss',
      pl: 8,
      kind: 'Mastermind',
      about:
        'Runs a large criminal organization. Can handle a hero, but prefers to send his crew (4 Criminal Minions).',
      ab: [1, 2, 2, 4, 4, 5, 3, 3],
      def: [7, 7, 4, 7, 6],
      init: 14,
      att: [
        ['Assault rifle', 10, 5, 'Multiattack'],
        ['Heavy pistol', 10, 4],
        ['Brass knuckles', 6, 2]
      ],
      adv: 'Wealth (multimillionaire), Connected, Contacts, Defensive Attack, Defensive Roll, Diehard, Improved Aim, Improved Initiative 3, Minions (4 Criminal Minions)',
      sk: 'Deception +10, Expertise (politics) +12, Insight +10, Intimidation +10, Persuasion +11',
      eq: 'Assault rifle, heavy pistol, bulletproof vest, a guarded mansion (Toughness 8)'
    },
    {
      id: 'slog',
      n: 'Slog',
      pl: 8,
      kind: 'Monster',
      about:
        'A living sludge from the sewers that grows and shrinks at will and feeds on radioactive waste. Shown at normal size; when big, Toughness 19 and Slam rank 8.',
      ab: [3, 0, 3, 2, 3, -1, 0, -1],
      def: [17, 17, 13, 15, 12],
      init: 3,
      att: [
        ['Slam', 9, 4],
        ['Goop blast', 7, 3, 'Ranged, Accurate'],
        ['Engulf', 9, 6, 'after a grab: Suffocation, DC 16']
      ],
      pow: [
        'Growth 4 / Shrinking 4 (alternate forms)',
        'Immunity (radiation, chemicals, disease, poison, suffocation)',
        'Insubstantial 1 (goo), Protection 4',
        'Healing 5 (eating radioactive waste)',
        'Swimming 4'
      ],
      adv: 'Close Attack 6, Fast Grab, Fearless, Ranged Attack',
      sk: 'Athletics +9, Perception +10, Stealth +11'
    },
    {
      id: 'witch',
      n: 'The Witch',
      pl: 8,
      kind: 'Mystic',
      about: 'A short-tempered sorceress with hidden goals. Unpredictable and best avoided.',
      ab: [0, 2, 4, 4, 2, 3, 2, 1],
      def: [8, 6, 5, '8 (2 without force field)', 6],
      init: 11,
      att: [
        ['Magic bolt', 9, 7, 'Ranged'],
        ['Weaken Strength', 9, 8, 'Fortitude DC 18'],
        ['Sleep', 9, 5, 'Will DC 15: fatigued, exhausted, asleep'],
        ['Poison touch', 7, 4]
      ],
      pow: [
        'Force Field (Protection 6)',
        'Magic array: Blast, fire burst, poison aura, Healing 8, Sleep, Weaken Strength 8',
        'Teleport 6'
      ],
      adv: 'Accurate Attack, Improved Initiative 2, Move-by Action',
      sk: 'Deception +11, Insight +8, Perception +10, Stealth +12, Treatment +9'
    },
    {
      id: 'cold-iron',
      n: 'Cold Iron',
      pl: 9,
      kind: 'Brute',
      about: 'Six feet and fifteen hundred pounds of angry steel, with a quick mind and good connections.',
      ab: [5, 5, 3, 2, 4, 3, 3, 0],
      def: [7, 7, 9, 10, 7],
      init: 3,
      att: [
        ['Steel fists', 10, 6],
        ['Thrown object', 6, 5, 'Ranged']
      ],
      pow: [
        'Steel Form: Growth 3 (density), Immunity (critical hits, fatigue, life support), Protection 5, Impervious 3'
      ],
      adv: 'Connected, Contacts, Power Attack, Startle, Uncanny Dodge, Well-Informed',
      sk: 'Athletics +13, Deception +10, Intimidation +11, Investigation +10, Perception +9'
    },
    {
      id: 'rocket-rodent',
      n: 'Rocket Rodent',
      pl: 10,
      kind: 'Gunner',
      about: 'A cybernetically altered raccoon: a sharp-eyed sniper and gadgeteer with a big gun collection.',
      ab: [0, 3, 6, 6, 4, 4, 2, 3],
      def: [12, 12, 7, 9, 2],
      init: 10,
      att: [
        ['Blaster rifle', 12, 8, 'Ranged'],
        ['Light rocket launcher', 12, 8, 'Ranged, others in the burst take rank 5'],
        ['Heavy machine gun', 12, 6, 'Multiattack'],
        ['Unarmed', 8, 0]
      ],
      pow: [
        'Cybernetic implants (enhanced skills and defenses)',
        'Leaping 3, Quickness 4, low-light vision, ultra-hearing',
        'Small (Shrinking 4, permanent)'
      ],
      adv: 'All-out Attack, Defensive Roll 5, Evasion, Hide in Plain Sight, Improvised Tools, Jack-of-all-Trades, Precise Attack, Taunt',
      sk: 'Technology +14, Ranged Combat (guns) +12, Vehicles +12, Acrobatics +12, Deception +11'
    },
    {
      id: 'dred',
      n: 'Dred the Destroyer',
      pl: 11,
      kind: 'Brute',
      about: 'A hulking green-skinned warrior covered in tattoos, with a murderous gleam in his eyes.',
      ab: [10, 7, 4, 1, 6, -1, 1, 0],
      def: [11, 11, 14, 11, 8],
      init: 4,
      att: [
        ['Signature knives', 10, 12, 'Multiattack, Penetrating 5, crit 17–20'],
        ['Unarmed', 11, 10],
        ['Blaster rifle', 6, 8, 'Ranged'],
        ['Light rocket launcher', 6, 8, 'Ranged, others in the burst take rank 5']
      ],
      pow: [
        'Durability: Impervious Toughness 9, Immunity (fatigue, life support), Protection 4, Regeneration 4',
        'Speed 4'
      ],
      adv: 'All-out Attack, Diehard, Fearless, Great Endurance, Improved Smash, Power Attack, Ranged Attack 5, Startle',
      sk: 'Intimidation +16, Perception +13, Athletics +14, Acrobatics +12'
    },
    {
      id: 'grunt',
      n: 'Grunt',
      pl: 11,
      kind: 'Monster',
      about: 'An enormous, lumbering tree in the shape of a man. Hard to hurt, harder to move.',
      ab: [13, 10, 2, 0, 5, 3, 2, 0],
      def: [6, 8, 13, 14, 9],
      init: 2,
      att: [
        ['Unarmed', 9, 13, 'Fast Grab, Improved Hold'],
        ['Vine whip', null, 10, 'line 60 ft long, Dodge DC 15 for half']
      ],
      pow: [
        'Hard Bark: Immunity (fire), Protection 4, Impervious Toughness 10',
        'Wooden Shield: Deflect 8',
        'Regrowth: Regeneration 5, Immortality 2',
        'Growth 4, Elongation 1',
        'Take Root: can’t be moved or knocked prone'
      ],
      adv: 'All-out Attack, Diehard, Fast Grab, Improved Grab, Improved Hold, Power Attack',
      sk: 'Athletics +15, Intimidation +12'
    }
  ];

  // ---------- rewards: what heroes find after beating a villain ----------
  // Devices: [name, game write-up ({r} = power level, {r-2}, {h} = half), what it is]
  root.MMLoot = {
    themes: [
      ['tech', 'Tech'],
      ['mystic', 'Mystic'],
      ['alien', 'Alien'],
      ['crime', 'Criminal'],
      ['gov', 'Government']
    ],
    devices: {
      tech: [
        [
          'Prototype blaster pistol',
          'Ranged Damage {r} (energy), Easily Removable',
          'A lab-built sidearm with a cracked power cell.'
        ],
        ['Gravity gauntlet', 'Move Object {r-2}, Removable', 'Lifts and hurls cars from across the street.'],
        ['Holo-cloak', 'Concealment 4 (all visual senses), Removable', 'Bends light around the wearer.'],
        ['Jet pack', 'Flight {h}, Removable', 'Loud, fast and very hard to steer.'],
        [
          'Nano-repair spray',
          'Healing {h}, Limited to objects and constructs, Easily Removable, 3 uses',
          'Seals cracks in armor and robots.'
        ],
        [
          'Neural disruptor',
          'Ranged Affliction {r-2} (Dazed, Stunned, Incapacitated; Will), Easily Removable',
          'Scrambles the nervous system for a few seconds.'
        ],
        ['Hacking rig', 'Enhanced Technology +5, Removable', 'Cracks most consumer security in seconds.'],
        [
          'Shield projector',
          'Protection {h}, Sustained, Removable',
          'A wrist unit that throws a shimmering force wall.'
        ]
      ],
      mystic: [
        ['Amulet of warding', 'Protection {h}, Impervious, Removable', 'Warm to the touch; bullets slow down near it.'],
        [
          'Hex wand',
          'Ranged Affliction {r-2} (Impaired, Disabled, Transformed; Fortitude), Easily Removable',
          'Turns the unlucky into small animals for a while.'
        ],
        [
          'Scrying orb',
          'Remote Sensing {h} (visual), Medium (reflective surfaces), Removable',
          'Shows places the holder has touched.'
        ],
        ['Boots of the winds', 'Flight {h}, Removable', 'Carry the wearer on a howling gust.'],
        [
          'Cursed blade',
          'Strength-based Damage 3, Penetrating, Easily Removable; complication: whispers to its wielder',
          'Cuts through anything. It wants more.'
        ],
        [
          'Grimoire page',
          'One ritual (Expertise: Magic DC 20) that does one thing, once',
          'A torn page with a single working spell.'
        ],
        [
          'Ward-breaking chalk',
          'Nullify {r-2} (magic), Limited to circles drawn with it',
          'Breaks summoning circles and wards.'
        ],
        [
          'Familiar’s collar',
          'Summon a small animal helper (Summon 2), Removable',
          'Something answers when you whistle.'
        ]
      ],
      alien: [
        ['Plasma lance', 'Damage {r}, Reach 2, Easily Removable', 'A humming polearm from another world.'],
        ['Phase belt', 'Insubstantial 4, Removable', 'Lets the wearer walk through walls, but not for long.'],
        [
          'Universal translator',
          'Comprehend 2 (understands and is understood in all languages), Removable',
          'A small earpiece that never stops talking.'
        ],
        ['Deflector emitter', 'Deflect {r}, Removable', 'Turns aside shots aimed at anyone nearby.'],
        [
          'Symbiotic armor',
          'Protection {h}, Immunity (suffocation, cold, vacuum), Removable; complication: it’s alive',
          'It clings. It likes you.'
        ],
        [
          'Star map crystal',
          'A clue: where the villains came from and where they go next',
          'Projects constellations no one on Earth has seen.'
        ],
        [
          'Teleport beacon',
          'Teleport {h}, Limited to the beacon’s pair, Removable',
          'Two discs: step on one, arrive at the other.'
        ],
        [
          'Healing pod',
          'Healing {r}, Restorative, Removable (stays at the base)',
          'An egg-shaped bed that knits wounds overnight.'
        ]
      ],
      crime: [
        [
          'Briefcase of bearer bonds',
          'Benefit (Wealth) for the rest of the adventure, if the heroes keep it (should they?)',
          'Untraceable money, very traceable trouble.'
        ],
        ['The ledger', 'A clue: names, dates and the boss behind the boss', 'Coded, but not well.'],
        [
          'Customized sniper rifle',
          'Ranged Damage 5, Improved Critical, Accurate, Easily Removable',
          'Serial numbers filed off.'
        ],
        ['Getaway car', 'Vehicle: Speed 6, Toughness 9, Size Large, with nitro', 'Fast, armored, and reported stolen.'],
        [
          'Safehouse keys',
          'Headquarters for the rest of the adventure: a hidden apartment with a weapons locker',
          'The gang won’t be back for a while.'
        ],
        [
          'Shipment of exotic weapons',
          'A clue: crates of alien or lab weapons, and a shipping manifest',
          'Someone is arming every gang in town.'
        ],
        ['Burner phone', 'A clue: the last ten calls and a meeting time', 'It buzzes while the heroes are holding it.'],
        ['Blackmail photos', 'A clue: proof a city official is on the payroll', 'Use them carefully.']
      ],
      gov: [
        ['Prototype armor plating', 'Protection {h}, Removable', 'Stamped “PROPERTY OF” in three places.'],
        [
          'Classified dossier',
          'A clue: a secret program that made one of the villains',
          'Half the pages are blacked out.'
        ],
        [
          'Tracking drone',
          'Remote Sensing {h} (visual, auditory), Removable',
          'A quiet quadcopter with a long battery.'
        ],
        ['Security clearance card', 'Benefit (security clearance) until someone notices', 'Opens doors it shouldn’t.'],
        [
          'Experimental serum',
          'Enhanced Strength {h}, fades after the scene, 1 dose',
          'Glows faintly green. Side effects unknown.'
        ],
        [
          'Stun baton',
          'Affliction {r-2} (Dazed, Stunned, Incapacitated; Fortitude), Easily Removable',
          'Standard issue for a very secret agency.'
        ],
        [
          'Satellite uplink',
          'Senses: Communication (radio), Extended vision via satellite, Removable',
          'An open line to someone very high up.'
        ],
        [
          'Containment cuffs',
          'Nullify {r} (all powers), Limited to the wearer, Removable',
          'Built for exactly this kind of prisoner.'
        ]
      ]
    },
    clues: [
      'The villain was hired: a payment trail leads to a respected company.',
      'A name keeps coming up: someone the heroes already know.',
      'The villain’s gear was made in a lab that closed ten years ago.',
      'A hostage overheard the next target: a museum, a bank or a power plant.',
      'Fingerprints match a hero who died years ago.',
      'An encrypted drive with a countdown timer.',
      'Tattoos on the minions: the mark of an old secret society.',
      'The villain was protecting someone, not attacking.',
      'A police officer tipped the villains off.',
      'Strange radiation readings lead under the city.',
      'A note: “You were warned. Next time, it’s personal.”',
      'A map with three other cities circled.'
    ]
  };
})(typeof window !== 'undefined' ? window : globalThis);
