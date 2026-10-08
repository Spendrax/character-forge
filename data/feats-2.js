// Feat data (part 2: setting, racial, Unearthed Arcana and homebrew) summarised from https://dnd5e.wikidot.com (CC BY-SA 3.0).
window.DND = window.DND || {};
DND.feats = DND.feats || [];
(function(){
var PS="Planescape: Adventures in the Multiverse", DL="Dragonlance: Shadow of the Dragon Queen", XGE="Xanathar's Guide to Everything", TD="Tal'Dorei Campaign Setting Reborn", UAR="Unearthed Arcana: Feats for Races";
function F(tag,n,s,pre,asi,t,x){var o={n:n,s:s,pre:pre,asi:asi,t:t,tag:tag};if(x)for(var k in x)o[k]=x[k];DND.feats.push(o);}
F("setting","Scion of the Outer Planes",PS,"Planescape campaign",[],"Choose an Outer Plane alignment: gain resistance to a damage type (force, necrotic, poison, psychic or radiant by plane) and a cantrip tied to it.");
F("setting","Agent of Order",PS,"4th level, Scion of the Outer Planes (Lawful)",["ANY"],"Once per turn when you damage a creature within 60 ft: +1d8 force and restrained until your next turn (Wisdom save). Proficiency bonus uses per long rest.");
F("setting","Baleful Scion",PS,"4th level, Scion of the Outer Planes (Evil)",["ANY"],"Once per turn when you damage a creature within 60 ft: +1d6 + proficiency bonus necrotic, and you heal that amount. Proficiency bonus uses per long rest.");
F("setting","Cohort of Chaos",PS,"4th level, Scion of the Outer Planes (Chaotic)",["ANY"],"When you roll a 1 or 20 on an attack or save, a random chaotic effect flares until the end of your next turn.");
F("setting","Outlands Envoy",PS,"4th level, Scion of the Outer Planes (The Outlands)",["ANY"],"Learn Misty Step and Tongues; cast each once per long rest for free or with slots.");
F("setting","Planar Wanderer",PS,"4th level, Scion of the Outer Planes",[],"Choose resistance to acid, cold or fire after each long rest, sense portals within 30 ft, and attempt to open or close a portal with a DC 20 check.");
F("setting","Righteous Heritor",PS,"4th level, Scion of the Outer Planes (Good)",["ANY"],"Reaction when you or a creature within 30 ft takes damage: reduce it by 1d10 + proficiency bonus. Proficiency bonus uses per long rest.");
F("setting","Strixhaven Initiate","Strixhaven: A Curriculum of Chaos","",[],"Choose a college: learn two cantrips and one 1st-level spell from its lists; cast the spell once per long rest for free or with slots.");
F("setting","Strixhaven Mascot","Strixhaven: A Curriculum of Chaos","4th level, Strixhaven Initiate",[],"Cast Find Familiar as a ritual for your college's mascot; it can attack in place of one of your attacks, and you can swap places with it once per long rest.");
F("setting","Squire of Solamnia",DL,"Dragonlance campaign; fighter or paladin, or Knight of Solamnia background",[],"Mounting costs 5 ft. Once per turn gain advantage on a weapon attack and +1d8 damage on a hit. Proficiency bonus uses per long rest.");
F("setting","Knight of the Crown",DL,"4th level, Squire of Solamnia",["STR","DEX","CON"],"Bonus action: an ally within 30 ft makes a reaction attack that deals +1d8. Proficiency bonus uses per long rest.");
F("setting","Knight of the Rose",DL,"4th level, Squire of Solamnia",["CON","WIS","CHA"],"Bonus action: a creature within 30 ft gains 1d8 + proficiency bonus + ability modifier temp HP. Proficiency bonus uses per long rest.");
F("setting","Knight of the Sword",DL,"4th level, Squire of Solamnia",["INT","WIS","CHA"],"Once per turn on a weapon hit: Wisdom save or the target is frightened until the end of your next turn. Proficiency bonus uses per long rest.");
F("setting","Initiate of High Sorcery",DL,"Dragonlance campaign; sorcerer or wizard, or Mage of High Sorcery background",[],"Choose a moon: learn one wizard cantrip and two 1st-level spells of its schools, each castable once per long rest for free.");
F("setting","Adept of the Black Robes",DL,"4th level, Initiate of High Sorcery (Nuitari)",[],"Learn a 2nd-level enchantment or necromancy spell (free once per long rest). Spend Hit Dice to add their rolls to a spell's damage.");
F("setting","Adept of the Red Robes",DL,"4th level, Initiate of High Sorcery (Lunitari)",[],"Learn a 2nd-level illusion or transmutation spell (free once per long rest). Treat a 9 or lower as 10 on an attack or check, proficiency bonus times per long rest.");
F("setting","Adept of the White Robes",DL,"4th level, Initiate of High Sorcery (Solinari)",[],"Learn a 2nd-level abjuration or divination spell (free once per long rest). Reaction: expend a slot to reduce damage within 30 ft by slot-level d6s + your modifier.");
F("setting","Divinely Favored",DL,"4th level, Dragonlance campaign",[],"Learn one cleric cantrip, Augury, and a 1st-level spell by alignment; cast Augury and that spell once per long rest for free.");
F("setting","Servo Crafting","Plane Shift: Kaladesh","Intelligence 13",[],"Cast Find Familiar as a ritual to build a servo construct that can attack in place of one of your attacks.");
F("setting","Quicksmithing","Plane Shift: Kaladesh","Intelligence 13",[],"Know two 1st-level rituals cast with Intelligence, and build Tiny clockwork devices with quicksmith's tools.");
F("setting","Vampiric Exultation","Plane Shift: Ixalan","Vampire (Ixalan)",[],"Action: turn your lower body to vapor for a 30 ft flying speed for 10 minutes. Once per short or long rest.");
F("setting","Revenant Blade","Eberron: Rising from the Last War","Elf",["STR","DEX"],"A double-bladed scimitar has finesse for you and grants +1 AC when wielded in two hands.");

F("official","Bountiful Luck",XGE,"Halfling",[],"Reaction when an ally within 30 ft rolls a 1: they reroll. You can't use your Lucky trait until the end of your next turn.");
F("official","Dragon Fear",XGE,"Dragonborn",["STR","CON","CHA"],"Use your Breath Weapon as a roar: creatures within 30 ft make a Wisdom save or are frightened for 1 minute.");
F("official","Dragon Hide",XGE,"Dragonborn",["STR","CON","CHA"],"Unarmored AC is 13 + DEX mod, and retractable claws deal 1d4 + STR mod slashing.",{unarmoredAC:13});
F("official","Dwarven Fortitude",XGE,"Dwarf",["CON"],"When you Dodge, you can spend one Hit Die to heal.");
F("official","Drow High Magic",XGE,"Elf (drow)",[],"Cast Detect Magic at will, and Levitate and Dispel Magic once each per long rest, using Charisma.");
F("official","Elven Accuracy",XGE,"Elf or half-elf",["DEX","INT","WIS","CHA"],"When you have advantage on an attack using Dexterity, Intelligence, Wisdom or Charisma, reroll one of the dice once.");
F("official","Fade Away",XGE,"Gnome",["DEX","INT"],"Reaction after taking damage: become invisible until the end of your next turn. Once per short or long rest.");
F("official","Fey Teleportation",XGE,"Elf (high)",["INT","CHA"],"Learn Sylvan, and cast Misty Step once per short or long rest.",{lang:["Sylvan"]});
F("official","Flames of Phlegethos",XGE,"Tiefling",["INT","CHA"],"Reroll 1s on fire spell damage, and fire spells wreathe you in flames that deal 1d4 fire to melee attackers.");
F("official","Infernal Constitution",XGE,"Tiefling",["CON"],"Resistance to cold and poison damage, and advantage on saves against being poisoned.");
F("official","Orcish Fury",XGE,"Half-orc",["STR","CON"],"Once per rest add one extra weapon damage die to a hit, and make a reaction attack after using Relentless Endurance.");
F("official","Prodigy",XGE,"Half-elf, half-orc or human",[],"One skill, one tool and one language, plus expertise in one skill you are proficient in.",{skc:1,expertise:1,lc:1});
F("official","Second Chance",XGE,"Halfling",["DEX","CON","CHA"],"Reaction when a creature hits you: force it to reroll. Once per combat or rest.");
F("official","Squat Nimbleness",XGE,"Dwarf or a Small race",["STR","DEX"],"+5 ft speed, proficiency in Acrobatics or Athletics, and advantage on checks to escape a grapple.",{speed:5});
F("official","Svirfneblin Magic","Mordenkainen's Tome of Foes","Gnome (deep gnome)",[],"Cast Nondetection on yourself at will, and Blindness/Deafness, Blur and Disguise Self once each per long rest, using Intelligence.");
F("official","Wood Elf Magic",XGE,"Elf (wood)",[],"Learn one druid cantrip, and cast Longstrider and Pass without Trace once each per long rest, using Wisdom.");

F("ua","Barbed Hide (UA)",UAR,"Tiefling",["CON","CHA"],"Proficiency (or expertise) in Intimidation, and barbs that deal 1d6 piercing each turn to creatures grappling you or grappled by you.");
F("ua","Critter Friend (UA)",UAR,"Gnome (forest)",[],"Proficiency (or expertise) in Animal Handling, Speak with Animals at will, and Animal Friendship once per long rest.");
F("ua","Dragon Wings (UA)",UAR,"Dragonborn",[],"Flying speed 20 ft when not wearing heavy armor.");
F("ua","Everybody's Friend (UA)",UAR,"Half-elf",["CHA"],"Proficiency (or expertise) in Deception and Persuasion.");
F("ua","Grudge-Bearer (UA)",UAR,"Dwarf",["STR","CON","WIS"],"Choose a foe type: advantage on attacks against it in the first round, and its opportunity attacks against you have disadvantage.");
F("ua","Human Determination (UA)",UAR,"Human",["ANY"],"Once per short or long rest, gain advantage on an attack roll, ability check or saving throw.");
F("ua","Orcish Aggression (UA)",UAR,"Half-orc",[],"Bonus action: move up to your speed toward an enemy.");
F("ua","Wonder Maker (UA)",UAR,"Gnome (rock)",["DEX","INT"],"Double proficiency with tinker's tools, and new Tinker devices: alarm, calculator, lifter, timekeeper and weather sensor.");

F("homebrew","Cruel (HB)",TD,"",[],"Cruelty dice (d6) equal to your proficiency bonus per long rest: add one to damage, gain temp HP on a critical hit, or add to an Intimidation check.");
F("homebrew","Flash Recall (HB)",TD,"Spellcasting feature from a class that prepares spells",[],"Bonus action: swap a prepared spell for another you could prepare. Once per short or long rest.");
F("homebrew","Mystic Conflux (HB)",TD,"",[],"Attune to four magic items, and cast Identify once per long rest without a slot.");
F("homebrew","Remarkable Recovery (HB)",TD,"",["CON"],"Regain your CON mod in HP when stabilised, and add your CON mod to healing you receive.");
F("homebrew","Spelldriver (HB)",TD,"11th level, Spellcasting or Pact Magic feature",[],"When you cast a levelled spell as a bonus action, you can also cast a levelled spell with your action (only one of 3rd level or higher).");
F("homebrew","Thrown Arms Master (HB)",TD,"",["STR","DEX"],"Throw any melee weapon (20/60, or 15/30 two-handed), extend thrown ranges by +20/+40 ft, and light weapons return after a miss.");
F("homebrew","Vital Sacrifice (HB)",TD,"",[],"Bonus action: take 1d6 necrotic to gain a blood boon for 1 hour, spent for +1d6 to hit, +2d6 necrotic, or -1d4 to a target's save.");
})();
