// Ranger, Rogue and Sorcerer subclasses, summarised from https://dnd5e.wikidot.com (CC BY-SA 3.0).
window.DND = window.DND || {};
DND.subclasses = DND.subclasses || [];
DND.subclasses.push(
{"c":"ranger","id":"ranger:beast-master","name":"Beast Master","source":"Player's Handbook","tag":"official","features":[
{"n":"Ranger's Companion","l":3,"t":"A beast companion of CR 1/4 or lower that adds your proficiency bonus to AC, attacks, damage, saves and skills, with HP of at least 4 x ranger level. Optional Primal Companion: summon a Beast of the Land, Sea or Sky instead, commanded with a bonus action."},
{"n":"Exceptional Training","l":7,"t":"Bonus action to have your beast Dash, Disengage or Help when it doesn't attack. Its attacks count as magical."},
{"n":"Bestial Fury","l":11,"t":"Your beast makes two attacks when commanded to Attack."},
{"n":"Share Spells","l":15,"t":"Spells you cast on yourself also affect your beast within 30 ft."}]},
{"c":"ranger","id":"ranger:drakewarden","name":"Drakewarden","source":"Fizban's Treasury of Dragons","tag":"official","choices":[{"l":3,"type":"language","count":1,"suggest":"Draconic"}],"features":[
{"n":"Draconic Gift","l":3,"t":"Learn Thaumaturgy, and Draconic or another language."},
{"n":"Drake Companion","l":3,"t":"Action: summon a drake with a chosen damage type. It acts after you and obeys bonus-action commands. Once per long rest or a spell slot."},
{"n":"Bond of Fang and Scale","l":7,"t":"The drake becomes Medium with wings, you can ride it, its bite deals +1d6, and you resist its damage type."},
{"n":"Drake's Breath","l":11,"t":"Action: 30-ft cone for 8d6 damage (10d6 at 15th), Dexterity save for half. Once per long rest or a 3rd-level slot."},
{"n":"Perfected Bond","l":15,"t":"The drake becomes Large and can fly with you. Bite +2d6. Reaction to give you or the drake resistance to one hit, proficiency bonus times per long rest."}]},
{"c":"ranger","id":"ranger:fey-wanderer","name":"Fey Wanderer","source":"Tasha's Cauldron of Everything","tag":"official","spells":{"3":["Charm Person"],"5":["Misty Step"],"9":["Dispel Magic"],"13":["Dimension Door"],"17":["Mislead"]},"choices":[{"l":3,"type":"skill","count":1,"from":["Deception","Performance","Persuasion"]}],"features":[
{"n":"Dreadful Strikes","l":3,"t":"Once per turn per creature, a weapon hit deals +1d4 psychic (1d6 at 11th)."},
{"n":"Otherworldly Glamour","l":3,"t":"Add your WIS mod to Charisma checks, and gain proficiency in Deception, Performance or Persuasion."},
{"n":"Beguiling Twist","l":7,"t":"Advantage on saves against charm and fear. Reaction when a creature within 120 ft succeeds on such a save: another creature makes a Wisdom save or is charmed or frightened for 1 minute."},
{"n":"Fey Reinforcements","l":11,"t":"Know Summon Fey; cast it once per long rest without a slot, optionally without concentration for 1 minute."},
{"n":"Misty Wanderer","l":15,"t":"Cast Misty Step without a slot WIS mod times per long rest, bringing one willing creature."}]},
{"c":"ranger","id":"ranger:gloom-stalker","name":"Gloom Stalker","source":"Xanathar's Guide to Everything","tag":"official","spells":{"3":["Disguise Self"],"5":["Rope Trick"],"9":["Fear"],"13":["Greater Invisibility"],"17":["Seeming"]},"grants":{"darkvisionBonus":60,"saves":["WIS"],"savesAt":7},"features":[
{"n":"Dread Ambusher","l":3,"t":"Add your WIS mod to initiative. On your first turn of combat, +10 ft speed and one extra weapon attack that deals +1d8."},
{"n":"Umbral Sight","l":3,"t":"Darkvision 60 ft (or +30 ft). In darkness you are invisible to creatures relying on darkvision."},
{"n":"Iron Mind","l":7,"t":"Proficiency in Wisdom saves (or INT or CHA if you already have it)."},
{"n":"Stalker's Flurry","l":11,"t":"Once per turn when you miss with a weapon attack, make another."},
{"n":"Shadowy Dodge","l":15,"t":"Reaction: impose disadvantage on an attack against you that lacks advantage."}]},
{"c":"ranger","id":"ranger:horizon-walker","name":"Horizon Walker","source":"Xanathar's Guide to Everything","tag":"official","spells":{"3":["Protection from Evil and Good"],"5":["Misty Step"],"9":["Haste"],"13":["Banishment"],"17":["Teleportation Circle"]},"features":[
{"n":"Detect Portal","l":3,"t":"Action: sense the nearest planar portal within 1 mile. Once per short or long rest."},
{"n":"Planar Warrior","l":3,"t":"Bonus action: your next weapon hit on a creature within 30 ft deals force damage and +1d8 (2d8 at 11th)."},
{"n":"Ethereal Step","l":7,"t":"Bonus action: cast Etherealness until the end of your turn. Once per short or long rest."},
{"n":"Distant Strike","l":11,"t":"Teleport 10 ft before each attack; attack two different creatures to gain a third attack against another."},
{"n":"Spectral Defense","l":15,"t":"Reaction: resistance to all of one attack's damage."}]},
{"c":"ranger","id":"ranger:hunter","name":"Hunter","source":"Player's Handbook","tag":"official","features":[
{"n":"Hunter's Prey","l":3,"t":"Choose one. Colossus Slayer: +1d8 once per turn against a wounded target. Giant Killer: reaction attack against a Large or larger creature that attacks you. Horde Breaker: one extra attack per turn against a different creature near your target."},
{"n":"Defensive Tactics","l":7,"t":"Choose one. Escape the Horde: opportunity attacks against you have disadvantage. Multiattack Defense: +4 AC against a creature's further attacks after it hits you. Steel Will: advantage on saves against fear."},
{"n":"Multiattack","l":11,"t":"Choose one. Volley: ranged attack against every creature within 10 ft of a point. Whirlwind Attack: melee attack against every creature within 5 ft."},
{"n":"Superior Hunter's Defense","l":15,"t":"Choose one. Evasion, Stand Against the Tide (redirect a missed melee attack), or Uncanny Dodge."}]},
{"c":"ranger","id":"ranger:monster-slayer","name":"Monster Slayer","source":"Xanathar's Guide to Everything","tag":"official","spells":{"3":["Protection from Evil and Good"],"5":["Zone of Truth"],"9":["Magic Circle"],"13":["Banishment"],"17":["Hold Monster"]},"features":[
{"n":"Hunter's Sense","l":3,"t":"Action: learn a creature's immunities, resistances and vulnerabilities. WIS mod uses per long rest."},
{"n":"Slayer's Prey","l":3,"t":"Bonus action: mark a creature within 60 ft; your first weapon hit on it each turn deals +1d6."},
{"n":"Supernatural Defense","l":7,"t":"Add 1d6 to saves and grapple-escape checks against your Slayer's Prey target."},
{"n":"Magic-User's Nemesis","l":11,"t":"Reaction when a creature within 60 ft casts a spell or teleports: Wisdom save or it fails. Once per short or long rest."},
{"n":"Slayer's Counter","l":15,"t":"Reaction when your prey forces you to save: attack it first; on a hit, you automatically succeed."}]},
{"c":"ranger","id":"ranger:swarmkeeper","name":"Swarmkeeper","source":"Tasha's Cauldron of Everything","tag":"official","spells":{"3":["Faerie Fire","Mage Hand"],"5":["Web"],"9":["Gaseous Form"],"13":["Arcane Eye"],"17":["Insect Plague"]},"features":[
{"n":"Gathered Swarm","l":3,"t":"Once per turn after a hit: deal 1d6 piercing, move the target 15 ft (Strength save), or move yourself 5 ft."},
{"n":"Writhing Tide","l":7,"t":"Bonus action: 10 ft flying speed with hover for 1 minute. Proficiency bonus uses per long rest."},
{"n":"Mighty Swarm","l":11,"t":"Swarm damage becomes 1d8, moved targets can be knocked prone, and moving yourself grants half cover."},
{"n":"Swarming Dispersal","l":15,"t":"Reaction when damaged: gain resistance and teleport 30 ft. Proficiency bonus uses per long rest."}]},

{"c":"rogue","id":"rogue:arcane-trickster","name":"Arcane Trickster","source":"Player's Handbook","tag":"official","casting":{"ability":"INT","kind":"third","list":"wizard","prepared":false,"cantrips":[0,0,3,3,3,3,3,3,3,4,4,4,4,4,4,4,4,4,4,4],"known":[0,0,3,4,4,4,5,6,6,7,8,8,9,10,10,11,11,11,12,13],"note":"Mage Hand is one of your cantrips. Spells must be enchantment or illusion, except those gained at 3rd, 8th, 14th and 20th level."},"features":[
{"n":"Spellcasting","l":3,"t":"Cast wizard spells using Intelligence. You know Mage Hand plus two other cantrips. Spells known must be enchantment or illusion, except one free pick at 3rd, 8th, 14th and 20th level."},
{"n":"Mage Hand Legerdemain","l":3,"t":"Your Mage Hand is invisible and can stow or lift objects, pick locks and disarm traps at range, controlled with Cunning Action."},
{"n":"Magical Ambush","l":9,"t":"If you are hidden when you cast a spell, the target has disadvantage on its save."},
{"n":"Versatile Trickster","l":13,"t":"Bonus action: your Mage Hand distracts a creature within 5 ft of it, giving you advantage on attacks against it this turn."},
{"n":"Spell Thief","l":17,"t":"Reaction when targeted by a spell: the caster makes a save or the spell fails and you know it for 8 hours. Once per long rest."}]},
{"c":"rogue","id":"rogue:assassin","name":"Assassin","source":"Player's Handbook","tag":"official","grants":{"tools":["Disguise kit","Poisoner's kit"]},"features":[
{"n":"Bonus Proficiencies","l":3,"t":"Proficiency with the disguise kit and poisoner's kit."},
{"n":"Assassinate","l":3,"t":"Advantage on attacks against creatures that haven't acted yet. Hits against surprised creatures are critical hits."},
{"n":"Infiltration Expertise","l":9,"t":"Spend 7 days and 25 gp to create an unshakeable false identity."},
{"n":"Impostor","l":13,"t":"After 3 hours of study, flawlessly mimic another person's speech, writing and behavior."},
{"n":"Death Strike","l":17,"t":"A surprised creature you hit makes a Constitution save (DC 8 + DEX mod + proficiency) or takes double damage."}]},
{"c":"rogue","id":"rogue:inquisitive","name":"Inquisitive","source":"Xanathar's Guide to Everything","tag":"official","features":[
{"n":"Ear for Deceit","l":3,"t":"Treat a roll of 7 or lower as 8 on Insight checks to detect lies."},
{"n":"Eye for Detail","l":3,"t":"Bonus action: Perception check to spot a hidden creature or object, or Investigation check to decipher clues."},
{"n":"Insightful Fighting","l":3,"t":"Bonus action: Insight vs Deception. On success, Sneak Attack that creature without needing advantage for 1 minute."},
{"n":"Steady Eye","l":9,"t":"Advantage on Perception and Investigation checks if you move no more than half your speed."},
{"n":"Unerring Eye","l":13,"t":"Action: sense illusions, shapechangers and other deceptive magic within 30 ft. WIS mod uses per long rest."},
{"n":"Eye for Weakness","l":17,"t":"Sneak Attack deals +3d6 against the target of Insightful Fighting."}]},
{"c":"rogue","id":"rogue:mastermind","name":"Mastermind","source":"Xanathar's Guide to Everything","tag":"official","grants":{"tools":["Disguise kit","Forgery kit","One gaming set"]},"choices":[{"l":3,"type":"language","count":2}],"features":[
{"n":"Master of Intrigue","l":3,"t":"Proficiency with the disguise kit, forgery kit and one gaming set, two languages, and the ability to mimic accents after hearing them for 1 minute."},
{"n":"Master of Tactics","l":3,"t":"Help as a bonus action, at a range of 30 ft when helping an attack."},
{"n":"Insightful Manipulator","l":9,"t":"After 1 minute observing a creature, learn how two of its INT, WIS, CHA or class levels compare to yours."},
{"n":"Misdirection","l":13,"t":"Reaction: redirect an attack against you to a creature within 5 ft that is giving you cover."},
{"n":"Soul of Deceit","l":17,"t":"Your thoughts can't be read unless you allow it, and magic can't detect your lies or compel truth."}]},
{"c":"rogue","id":"rogue:phantom","name":"Phantom","source":"Tasha's Cauldron of Everything","tag":"official","features":[
{"n":"Whispers of the Dead","l":3,"t":"After each rest, gain one skill or tool proficiency of your choice until you change it."},
{"n":"Wails from the Grave","l":3,"t":"After Sneak Attack, a second creature within 30 ft takes necrotic damage equal to half your Sneak Attack dice. Proficiency bonus uses per long rest."},
{"n":"Tokens of the Departed","l":9,"t":"Reaction when a creature dies within 30 ft: gain a soul trinket (max proficiency bonus). Holding one grants advantage on death and Constitution saves; destroy one for a free Wails or to question the spirit."},
{"n":"Ghost Walk","l":13,"t":"Bonus action: spectral form for 10 minutes with 10 ft flying, attacks against you at disadvantage, and movement through objects. Once per long rest or a trinket."},
{"n":"Death's Friend","l":17,"t":"Wails from the Grave also damages the first target. You gain a trinket after a long rest if you have none."}]},
{"c":"rogue","id":"rogue:scout","name":"Scout","source":"Xanathar's Guide to Everything","tag":"official","grants":{"skills":["Nature","Survival"],"expertise":["Nature","Survival"]},"features":[
{"n":"Skirmisher","l":3,"t":"Reaction when an enemy ends its turn within 5 ft: move half your speed without provoking."},
{"n":"Survivalist","l":3,"t":"Proficiency in Nature and Survival with doubled proficiency bonus."},
{"n":"Superior Mobility","l":9,"t":"Walking, climbing and swimming speeds +10 ft."},
{"n":"Ambush Master","l":13,"t":"Advantage on initiative. The first creature you hit in round one grants advantage on attacks against it until your next turn."},
{"n":"Sudden Strike","l":17,"t":"Bonus-action extra attack that can Sneak Attack a second, different target."}]},
{"c":"rogue","id":"rogue:soulknife","name":"Soulknife","source":"Tasha's Cauldron of Everything","tag":"official","features":[
{"n":"Psionic Power","l":3,"t":"Psionic Energy dice equal to twice your proficiency bonus (d6, d8 at 5th, d10 at 11th, d12 at 17th) per long rest. Psi-Bolstered Knack: add a die to a failed proficient check. Psychic Whispers: telepathy with proficiency bonus creatures for hours."},
{"n":"Psychic Blades","l":3,"t":"When you attack, manifest a psychic blade: finesse, thrown (60 ft), 1d6 psychic. Bonus action for a second blade at 1d4."},
{"n":"Soul Blades","l":9,"t":"Homing Strikes: add a die to a missed blade attack. Psychic Teleportation: bonus action, teleport up to 10 x a die roll in feet."},
{"n":"Psychic Veil","l":13,"t":"Action: invisible for 1 hour or until you deal damage or force a save. Once per long rest or a die."},
{"n":"Rend Mind","l":17,"t":"When you Sneak Attack with a blade, the target makes a Wisdom save or is stunned for 1 minute. Once per long rest or three dice."}]},
{"c":"rogue","id":"rogue:swashbuckler","name":"Swashbuckler","source":"Xanathar's Guide to Everything","tag":"official","features":[
{"n":"Fancy Footwork","l":3,"t":"A creature you make a melee attack against can't make opportunity attacks against you this turn."},
{"n":"Rakish Audacity","l":3,"t":"Add your CHA mod to initiative. Sneak Attack without advantage when you are within 5 ft of the target and no one else is within 5 ft of you."},
{"n":"Panache","l":9,"t":"Action: Persuasion vs Insight. A hostile creature has disadvantage attacking others and can't make opportunity attacks against them; others are charmed for 1 minute."},
{"n":"Elegant Maneuver","l":13,"t":"Bonus action: advantage on your next Acrobatics or Athletics check this turn."},
{"n":"Master Duelist","l":17,"t":"Reroll a missed attack with advantage. Once per short or long rest."}]},
{"c":"rogue","id":"rogue:thief","name":"Thief","source":"Player's Handbook","tag":"official","features":[
{"n":"Fast Hands","l":3,"t":"Cunning Action can make a Sleight of Hand check, use thieves' tools, or Use an Object."},
{"n":"Second-Story Work","l":3,"t":"Climbing costs no extra movement, and running jumps go DEX mod feet further."},
{"n":"Supreme Sneak","l":9,"t":"Advantage on Stealth checks if you move no more than half your speed."},
{"n":"Use Magic Device","l":13,"t":"Ignore class, race and level requirements on magic items."},
{"n":"Thief's Reflexes","l":17,"t":"Take two turns in the first round of combat, the second at initiative minus 10."}]},

{"c":"sorcerer","id":"sorcerer:aberrant-mind","name":"Aberrant Mind","source":"Tasha's Cauldron of Everything","tag":"official","spells":{"1":["Arms of Hadar","Dissonant Whispers","Mind Sliver"],"3":["Calm Emotions","Detect Thoughts"],"5":["Hunger of Hadar","Sending"],"7":["Evard's Black Tentacles","Summon Aberration"],"9":["Rary's Telepathic Bond","Telekinesis"]},"features":[
{"n":"Telepathic Speech","l":1,"t":"Bonus action: telepathic link with a creature within 30 ft for sorcerer level minutes, over a range of CHA mod miles."},
{"n":"Psionic Sorcery","l":6,"t":"Cast your psionic spells with sorcery points equal to the spell level, with no verbal or somatic components."},
{"n":"Psychic Defenses","l":6,"t":"Resistance to psychic damage and advantage on saves against charm and fear."},
{"n":"Revelation in Flesh","l":14,"t":"Bonus action: spend sorcery points for 10 minutes of see invisibility, flight, swimming, or squeezing through 1-inch gaps (1 point each)."},
{"n":"Warping Implosion","l":18,"t":"Action: teleport 120 ft; creatures within 30 ft of where you left take 3d10 force and are pulled in (Strength save for half). Once per long rest or 5 points."}]},
{"c":"sorcerer","id":"sorcerer:clockwork-soul","name":"Clockwork Soul","source":"Tasha's Cauldron of Everything","tag":"official","spells":{"1":["Alarm","Protection from Evil and Good"],"3":["Aid","Lesser Restoration"],"5":["Dispel Magic","Protection from Energy"],"7":["Freedom of Movement","Summon Construct"],"9":["Greater Restoration","Wall of Force"]},"features":[
{"n":"Restore Balance","l":1,"t":"Reaction: cancel advantage or disadvantage on a d20 roll within 60 ft. Proficiency bonus uses per long rest."},
{"n":"Bastion of Law","l":6,"t":"Action: spend 1 to 5 sorcery points to give a creature that many d8s to reduce damage it takes."},
{"n":"Trance of Order","l":14,"t":"Bonus action: for 1 minute attacks against you can't have advantage, and you treat rolls of 9 or lower as 10. Once per long rest or 5 points."},
{"n":"Clockwork Cavalcade","l":18,"t":"Action: in a 30-ft cube restore 100 HP divided among creatures, repair objects, and end spells of 6th level or lower. Once per long rest or 7 points."}]},
{"c":"sorcerer","id":"sorcerer:draconic-bloodline","name":"Draconic Bloodline","source":"Player's Handbook","tag":"official","grants":{"languages":["Draconic"],"hpPerLevel":1,"unarmoredAC":13},"variantLabel":"Dragon Ancestor","variantList":["Black (acid)","Blue (lightning)","Brass (fire)","Bronze (lightning)","Copper (acid)","Gold (fire)","Green (poison)","Red (fire)","Silver (cold)","White (cold)"],"features":[
{"n":"Dragon Ancestor","l":1,"t":"Choose a dragon type and its damage type. You learn Draconic and double your proficiency bonus on Charisma checks with dragons."},
{"n":"Draconic Resilience","l":1,"t":"+1 HP per sorcerer level. Unarmored AC is 13 + DEX mod."},
{"n":"Elemental Affinity","l":6,"t":"Add your CHA mod to one damage roll of spells of your ancestry type; spend 1 sorcery point for resistance to it for 1 hour."},
{"n":"Dragon Wings","l":14,"t":"Bonus action: sprout wings with a flying speed equal to your speed."},
{"n":"Draconic Presence","l":18,"t":"Action, 5 sorcery points: 60-ft aura of awe or fear for 1 minute (Wisdom save)."}]},
{"c":"sorcerer","id":"sorcerer:divine-soul","name":"Divine Soul","source":"Xanathar's Guide to Everything","tag":"official","extraSpellLists":["cleric"],"variantLabel":"Affinity","variantList":["Good (Cure Wounds)","Evil (Inflict Wounds)","Law (Bless)","Chaos (Bane)","Neutrality (Protection from Evil and Good)"],"features":[
{"n":"Divine Magic","l":1,"t":"Choose spells from the cleric list as well as the sorcerer list, and gain one bonus spell by affinity."},
{"n":"Favored by the Gods","l":1,"t":"Add 2d4 to a failed save or missed attack. Once per short or long rest."},
{"n":"Empowered Healing","l":6,"t":"Spend 1 sorcery point to reroll healing dice for you or an ally within 5 ft, once per turn."},
{"n":"Otherworldly Wings","l":14,"t":"Bonus action: spectral wings with 30 ft flying speed."},
{"n":"Unearthly Recovery","l":18,"t":"Bonus action when below half HP: regain half your maximum HP. Once per long rest."}]},
{"c":"sorcerer","id":"sorcerer:lunar-sorcery","name":"Lunar Sorcery","source":"Dragonlance: Shadow of the Dragon Queen","tag":"setting","spells":{"1":["Shield","Ray of Sickness","Color Spray"],"3":["Lesser Restoration","Blindness/Deafness","Alter Self"],"5":["Dispel Magic","Vampiric Touch","Phantom Steed"],"7":["Death Ward","Confusion","Hallucinatory Terrain"],"9":["Rary's Telepathic Bond","Hold Monster","Mislead"]},"features":[
{"n":"Lunar Embodiment","l":1,"t":"Gain the lunar spells. After a long rest choose Full, New or Crescent Moon; cast that phase's 1st-level spell once per long rest for free."},
{"n":"Moon Fire","l":1,"t":"Learn Sacred Flame; it can target two creatures within 5 ft of each other."},
{"n":"Lunar Boons","l":6,"t":"Metamagic costs 1 fewer point on spells of your phase's schools, proficiency bonus times per long rest."},
{"n":"Waxing and Waning","l":6,"t":"Bonus action: spend 1 sorcery point to change phase."},
{"n":"Lunar Empowerment","l":14,"t":"Full: shed light and gain advantage on Investigation and Perception. New: advantage on Stealth and attackers have disadvantage in darkness. Crescent: resistance to necrotic and radiant."},
{"n":"Lunar Phenomenon","l":18,"t":"Bonus action: a phase power (blind and heal, 3d10 necrotic and speed 0, or teleport 60 ft). Once per long rest or 5 points."}]},
{"c":"sorcerer","id":"sorcerer:shadow-magic","name":"Shadow Magic","source":"Xanathar's Guide to Everything","tag":"official","grants":{"darkvision":120},"features":[
{"n":"Eyes of the Dark","l":1,"t":"Darkvision 120 ft. At 3rd level learn Darkness; cast it with 2 sorcery points and see through it."},
{"n":"Strength of the Grave","l":1,"t":"When reduced to 0 HP, Charisma save (DC 5 + damage) to drop to 1 HP instead. Once per long rest; not against radiant damage or critical hits."},
{"n":"Hound of Ill Omen","l":6,"t":"Bonus action, 3 sorcery points: summon a shadow hound to harry one creature for 5 minutes."},
{"n":"Shadow Walk","l":14,"t":"Bonus action in dim light or darkness: teleport 120 ft to another dim or dark space."},
{"n":"Umbral Form","l":18,"t":"Bonus action, 6 sorcery points: for 1 minute, resistance to all damage but force and radiant, and move through creatures and objects."}]},
{"c":"sorcerer","id":"sorcerer:storm-sorcery","name":"Storm Sorcery","source":"Xanathar's Guide to Everything","tag":"official","grants":{"languages":["Primordial"]},"features":[
{"n":"Wind Speaker","l":1,"t":"You speak, read and write Primordial."},
{"n":"Tempestuous Magic","l":1,"t":"Bonus action before or after casting a levelled spell: fly 10 ft without provoking."},
{"n":"Heart of the Storm","l":6,"t":"Resistance to lightning and thunder. Casting a lightning or thunder spell deals half your sorcerer level in damage to chosen creatures within 10 ft."},
{"n":"Storm Guide","l":6,"t":"Stop rain around you, or direct the wind within 100 ft."},
{"n":"Storm's Fury","l":14,"t":"Reaction when hit in melee: deal lightning damage equal to your sorcerer level and push the attacker 20 ft (Strength save)."},
{"n":"Wind Soul","l":18,"t":"Immunity to lightning and thunder and a 60 ft flying speed, which you can share with 3 + CHA mod creatures."}]},
{"c":"sorcerer","id":"sorcerer:wild-magic","name":"Wild Magic","source":"Player's Handbook","tag":"official","features":[
{"n":"Wild Magic Surge","l":1,"t":"After you cast a levelled sorcerer spell, the DM can have you roll a d20; on a 1, roll on the Wild Magic Surge table."},
{"n":"Tides of Chaos","l":1,"t":"Gain advantage on one attack, check or save. Once per long rest, or until the DM triggers a surge."},
{"n":"Bend Luck","l":6,"t":"Reaction, 2 sorcery points: add or subtract 1d4 from another creature's attack, check or save."},
{"n":"Controlled Chaos","l":14,"t":"Roll twice on the surge table and choose."},
{"n":"Spell Bombardment","l":18,"t":"Once per turn, when a spell damage die shows its maximum, roll it again and add the result."}]},
{"c":"sorcerer","id":"sorcerer:pyromancy","name":"Pyromancy","source":"Plane Shift: Kaladesh","tag":"setting","features":[
{"n":"Heart of Fire","l":1,"t":"Casting a levelled fire spell deals half your sorcerer level in fire damage to chosen creatures within 10 ft."},
{"n":"Fire in the Veins","l":6,"t":"Resistance to fire, and your spells ignore fire resistance."},
{"n":"Pyromancer's Fury","l":14,"t":"Reaction when hit in melee: deal fire damage equal to your sorcerer level."},
{"n":"Fiery Soul","l":18,"t":"Immunity to fire; your spells treat fire immunity as resistance."}]}
);
