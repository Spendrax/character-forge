// Lineage data (part 2) summarised from https://dnd5e.wikidot.com (CC BY-SA 3.0). See lineages-1.js for the key legend.
window.DND = window.DND || {};
DND.lineages = DND.lineages || [];
(function(){
var MOTM="Monsters of the Multiverse", VGM="Volo's Guide to Monsters";
var FEY=["Fey Ancestry","Advantage on saves against the charmed condition."];
var PB=["Powerful Build","Count as one size larger for carrying, pushing, dragging and lifting."];
var TRANCE=["Trance","A 4-hour trance completes a long rest; afterwards gain two weapon or tool proficiencies until your next long rest."];
DND.lineages.push(
{"id":"locathah","name":"Locathah","group":"Exotic","tag":"official","versions":[
 {"n":"Locathah","s":"Locathah Rising","a":{"STR":2,"DEX":1},"sz":"Medium","sp":30,"swim":30,"lang":["Common","Aquan"],"sk":["Athletics","Perception"],"naturalAC":12,"tr":[
  ["Natural Armor","Unarmored AC is 12 + DEX mod."],["Observant and Athletic","Proficiency in Athletics and Perception."],
  ["Leviathan Will","Advantage on saves against being charmed, frightened, paralyzed, poisoned, stunned or put to sleep."],
  ["Limited Amphibiousness","Breathe air and water, but you must submerge at least once every 4 hours."]]}]},
{"id":"owlin","name":"Owlin","group":"Exotic","tag":"official","versions":[
 {"n":"Owlin","s":"Strixhaven: A Curriculum of Chaos","a":"flex","sz":"Small or Medium","sp":30,"fly":30,"dv":120,"lang":["Common"],"lc":1,"sk":["Stealth"],"tr":[
  ["Flight","Flying speed equal to your walking speed, not usable in medium or heavy armor."],["Silent Feathers","Proficiency in Stealth."]]}]},
{"id":"satyr","name":"Satyr","group":"Exotic","tag":"official","versions":[
 {"n":"Satyr","s":MOTM,"a":"flex","sz":"Medium","sp":35,"lang":["Common"],"lc":1,"sk":["Performance","Persuasion"],"prof":{"tools":["One musical instrument"]},"tr":[
  ["Ram","Unarmed strikes with your horns deal 1d6 + STR mod bludgeoning."],["Magic Resistance","Advantage on saves against spells."],
  ["Mirthful Leaps","Add d8 feet to long and high jumps."],["Reveler","Proficiency in Performance, Persuasion and one musical instrument."]]},
 {"n":"Satyr (Theros)","s":"Mythic Odysseys of Theros","tag":"setting","a":{"CHA":2,"DEX":1},"sz":"Medium","sp":35,"lang":["Common","Sylvan"],"sk":["Performance","Persuasion"],"prof":{"tools":["One musical instrument"]},"tr":[
  ["Ram","Unarmed strikes with your horns deal 1d4 + STR mod bludgeoning."],["Magic Resistance","Advantage on saves against spells and other magical effects."],
  ["Mirthful Leaps","Add d8 feet to long and high jumps."],["Reveler","Proficiency in Performance, Persuasion and one musical instrument."]]}]},
{"id":"sea-elf","name":"Sea Elf","group":"Exotic","tag":"official","versions":[
 {"n":"Sea Elf","s":MOTM,"a":"flex","sz":"Medium","sp":30,"swim":30,"dv":60,"lang":["Common"],"lc":1,"sk":["Perception"],"res":["cold"],"tr":[
  ["Child of the Sea","Breathe air and water, and resistance to cold damage."],FEY,
  ["Friend of the Sea","Communicate simple ideas to beasts with a swimming speed."],["Keen Senses","Proficiency in Perception."],TRANCE]},
 {"n":"Sea Elf (Tome of Foes)","s":"Mordenkainen's Tome of Foes","a":{"DEX":2,"CON":1},"sz":"Medium","sp":30,"swim":30,"dv":60,"lang":["Common","Elvish","Aquan"],"sk":["Perception"],"prof":{"weapons":["Spears","Tridents","Light crossbows","Nets"]},"tr":[
  ["Fey Ancestry","Advantage on saves against being charmed, and magic can't put you to sleep."],["Trance","Meditate 4 hours instead of sleeping 8."],["Keen Senses","Proficiency in Perception."],
  ["Sea Elf Training","Proficiency with spears, tridents, light crossbows and nets."],["Child of the Sea","Swimming speed 30 ft and you breathe air and water."],
  ["Friend of the Sea","Communicate simple ideas to beasts with a swimming speed."]]}]},
{"id":"shadar-kai","name":"Shadar-Kai","group":"Exotic","tag":"official","versions":[
 {"n":"Shadar-Kai","s":MOTM,"a":"flex","sz":"Medium","sp":30,"dv":60,"lang":["Common"],"lc":1,"sk":["Perception"],"res":["necrotic"],"tr":[
  ["Blessing of the Raven Queen","Bonus action: teleport 30 ft, proficiency bonus times per long rest. From 3rd level you resist all damage until your next turn."],FEY,
  ["Keen Senses","Proficiency in Perception."],["Necrotic Resistance","Resistance to necrotic damage."],TRANCE]},
 {"n":"Shadar-Kai (Tome of Foes)","s":"Mordenkainen's Tome of Foes","a":{"DEX":2,"CON":1},"sz":"Medium","sp":30,"dv":60,"lang":["Common","Elvish"],"sk":["Perception"],"res":["necrotic"],"tr":[
  ["Blessing of the Raven Queen","Bonus action: teleport 30 ft once per long rest. From 3rd level you resist all damage until your next turn."],
  ["Fey Ancestry","Advantage on saves against being charmed, and magic can't put you to sleep."],["Keen Senses","Proficiency in Perception."],
  ["Necrotic Resistance","Resistance to necrotic damage."],["Trance","Meditate 4 hours instead of sleeping 8."]]}]},
{"id":"tabaxi","name":"Tabaxi","group":"Exotic","tag":"official","versions":[
 {"n":"Tabaxi","s":MOTM,"a":"flex","sz":"Small or Medium","sp":30,"climb":30,"dv":60,"lang":["Common"],"lc":1,"sk":["Perception","Stealth"],"tr":[
  ["Cat's Claws","Climbing speed equal to your walking speed; claws deal 1d6 + STR mod slashing."],["Cat's Talent","Proficiency in Perception and Stealth."],
  ["Feline Agility","Double your speed for a turn; you must spend a turn without moving before using it again."]]},
 {"n":"Tabaxi (Volo's)","s":VGM,"a":{"DEX":2,"CHA":1},"sz":"Medium","sp":30,"climb":20,"dv":60,"lang":["Common"],"lc":1,"sk":["Perception","Stealth"],"tr":[
  ["Feline Agility","Double your speed for a turn; you must spend a turn without moving before using it again."],
  ["Cat's Claws","Climbing speed 20 ft; claws deal 1d4 + STR mod slashing."],["Cat's Talent","Proficiency in Perception and Stealth."]]}]},
{"id":"tortle","name":"Tortle","group":"Exotic","tag":"official","versions":[
 {"n":"Tortle","s":MOTM,"a":"flex","sz":"Small or Medium","sp":30,"lang":["Common"],"lc":1,"skc":{"n":1,"from":["Animal Handling","Medicine","Nature","Perception","Stealth","Survival"]},"fixedAC":17,"tr":[
  ["Claws","Unarmed strikes deal 1d6 + STR mod slashing."],["Hold Breath","Hold your breath for 1 hour."],
  ["Natural Armor","Base AC 17 (no DEX). You can't wear armor; shields still apply."],["Nature's Intuition","Proficiency in one of Animal Handling, Medicine, Nature, Perception, Stealth, Survival."],
  ["Shell Defense","Action: withdraw into your shell for +4 AC and advantage on STR and CON saves, but prone, speed 0, and disadvantage on DEX saves."]]},
 {"n":"Tortle (Tortle Package)","s":"The Tortle Package","a":{"STR":2,"WIS":1},"sz":"Medium","sp":30,"lang":["Common","Aquan"],"sk":["Survival"],"fixedAC":17,"tr":[
  ["Claws","Unarmed strikes deal 1d4 + STR mod slashing."],["Hold Breath","Hold your breath for 1 hour."],
  ["Natural Armor","Base AC 17 (no DEX). You can't wear armor; shields still apply."],
  ["Shell Defense","Action: withdraw into your shell for +4 AC and advantage on STR and CON saves, but prone, speed 0, and disadvantage on DEX saves."],
  ["Survival Instinct","Proficiency in Survival."]]}]},
{"id":"triton","name":"Triton","group":"Exotic","tag":"official","versions":[
 {"n":"Triton","s":MOTM,"a":"flex","sz":"Medium","sp":30,"swim":30,"dv":60,"lang":["Common"],"lc":1,"res":["cold"],"tr":[
  ["Amphibious","Breathe air and water."],["Control Air and Water","Cast Fog Cloud, Gust of Wind (3rd level) and Water Walk (5th level) once each per long rest or with slots."],
  ["Emissary of the Sea","Communicate simple ideas to creatures with a swimming speed."],["Guardian of the Depths","Resistance to cold damage."]]},
 {"n":"Triton (Volo's)","s":VGM,"a":{"STR":1,"CON":1,"CHA":1},"sz":"Medium","sp":30,"swim":30,"dv":60,"lang":["Common","Primordial"],"res":["cold"],"tr":[
  ["Amphibious","Breathe air and water."],["Control Air and Water","Cast Fog Cloud, Gust of Wind (3rd level) and Wall of Water (5th level) once each per long rest, using Charisma."],
  ["Emissary of the Sea","Communicate simple ideas to beasts that breathe water."],["Guardians of the Depths","Resistance to cold damage."]]}]},
{"id":"verdan","name":"Verdan","group":"Exotic","tag":"official","versions":[
 {"n":"Verdan","s":"Acquisitions Incorporated","a":{"CHA":2,"CON":1},"sz":"Small","sp":30,"lang":["Common","Goblin"],"lc":1,"sk":["Persuasion"],"tr":[
  ["Black Blood Healing","Reroll 1s and 2s on Hit Dice spent during a short rest."],["Limited Telepathy","Speak simple ideas telepathically to a creature within 30 ft."],
  ["Persuasive","Proficiency in Persuasion."],["Telepathic Insight","Advantage on Wisdom and Charisma saving throws."]]}]},

{"id":"bugbear","name":"Bugbear","group":"Monstrous","tag":"official","versions":[
 {"n":"Bugbear","s":MOTM,"a":"flex","sz":"Medium","sp":30,"dv":60,"lang":["Common"],"lc":1,"sk":["Stealth"],"tr":[FEY,
  ["Long-Limbed","Your melee reach is 5 ft greater on your turn."],PB,["Sneaky","Proficiency in Stealth, and you can squeeze through Small spaces."],
  ["Surprise Attack","Deal +2d6 damage to a creature that hasn't taken a turn in combat yet."]]},
 {"n":"Bugbear (Volo's)","s":VGM,"a":{"STR":2,"DEX":1},"sz":"Medium","sp":30,"dv":60,"lang":["Common","Goblin"],"sk":["Stealth"],"tr":[
  ["Long-Limbed","Your melee reach is 5 ft greater on your turn."],PB,["Sneaky","Proficiency in Stealth."],
  ["Surprise Attack","Deal +2d6 damage to a surprised creature on your first turn. Once per combat."]]}]},
{"id":"centaur","name":"Centaur","group":"Monstrous","tag":"official","versions":[
 {"n":"Centaur","s":MOTM,"a":"flex","sz":"Medium","sp":40,"lang":["Common"],"lc":1,"skc":{"n":1,"from":["Animal Handling","Medicine","Nature","Survival"]},"tr":[
  ["Charge","Move 30 ft straight and hit with a melee weapon to make a bonus-action hoof attack."],
  ["Equine Build","Count as one size larger for carrying; climbing costs 4 extra feet per foot."],
  ["Hooves","Unarmed strikes deal 1d6 + STR mod bludgeoning."],["Natural Affinity","Proficiency in one of Animal Handling, Medicine, Nature, Survival."]]},
 {"n":"Centaur (Ravnica / Theros)","s":"Guildmaster's Guide to Ravnica","tag":"setting","a":{"STR":2,"WIS":1},"sz":"Medium","sp":40,"lang":["Common","Sylvan"],"skc":{"n":1,"from":["Animal Handling","Medicine","Nature","Survival"]},"tr":[
  ["Charge","Move 30 ft straight and hit with a melee weapon to make a bonus-action hoof attack."],["Hooves","Unarmed strikes deal 1d4 + STR mod bludgeoning."],
  ["Equine Build","Count as one size larger for carrying; climbing costs 4 extra feet per foot."],["Survivor","Proficiency in one of Animal Handling, Medicine, Nature, Survival."]]}]},
{"id":"goblin","name":"Goblin","group":"Monstrous","tag":"official","versions":[
 {"n":"Goblin","s":MOTM,"a":"flex","sz":"Small","sp":30,"dv":60,"lang":["Common"],"lc":1,"tr":[FEY,
  ["Fury of the Small","Once per turn deal extra damage equal to your proficiency bonus to a larger creature. Proficiency bonus uses per long rest."],
  ["Nimble Escape","Disengage or Hide as a bonus action."]]},
 {"n":"Goblin (Volo's)","s":VGM,"a":{"DEX":2,"CON":1},"sz":"Small","sp":30,"dv":60,"lang":["Common","Goblin"],"tr":[
  ["Fury of the Small","Deal extra damage equal to your level to a larger creature. Once per short or long rest."],["Nimble Escape","Disengage or Hide as a bonus action."]]},
 {"n":"Goblin (Dankwood)","s":"Adventures with Muk","tag":"setting","a":{"DEX":2,"WIS":1},"sz":"Small","sp":30,"dv":60,"lang":["Common","Goblin"],"tr":[
  ["Speak with Small Beasts","Communicate simple ideas with Small or smaller beasts."],["Nimble Escape","Disengage or Hide as a bonus action."]]},
 {"n":"Goblin (Ixalan)","s":"Plane Shift: Ixalan","tag":"setting","a":{"DEX":2},"sz":"Small","sp":25,"climb":25,"dv":60,"lang":["Common","Goblin"],"tr":[["Agile Climber","Climbing speed 25 ft, not in medium or heavy armor."]]},
 {"n":"Goblin (Zendikar)","s":"Plane Shift: Zendikar","tag":"setting","a":{"CON":2},"sz":"Small","sp":25,"dv":60,"lang":["Common","Goblin"],"res":["fire","psychic"],"naturalAC":11,"tr":[["Grit","Resistance to fire and psychic damage; unarmored AC is 11 + DEX mod."]],
  "subs":[{"n":"Grotag Tribe","sk":["Animal Handling"],"tr":[["Grotag Tamer","Proficiency in Animal Handling."]]},
   {"n":"Lavastep Tribe","tr":[["Lavastep Grit","Advantage on Stealth checks to hide in rocky or subterranean environments."]]},
   {"n":"Tuktuk Tribe","prof":{"tools":["Thieves' tools"]},"tr":[["Tuktuk Cunning","Proficiency with thieves' tools."]]}]}]},
{"id":"grung","name":"Grung","group":"Monstrous","tag":"official","versions":[
 {"n":"Grung","s":"One Grung Above","a":{"DEX":2,"CON":1},"sz":"Small","sp":25,"climb":25,"lang":["Grung"],"sk":["Perception"],"imm":["poison"],"tr":[
  ["Arboreal Alertness","Proficiency in Perception."],["Amphibious","Breathe air and water."],["Poison Immunity","Immune to poison damage and the poisoned condition."],
  ["Poisonous Skin","Creatures that touch or grapple you make a DC 12 Constitution save or are poisoned; your piercing weapons can deal +2d4 poison."],
  ["Standing Leap","Long jump 25 ft and high jump 15 ft without a running start."],["Water Dependency","You must soak in water for 1 hour a day or gain exhaustion."]]}]},
{"id":"hobgoblin","name":"Hobgoblin","group":"Monstrous","tag":"official","versions":[
 {"n":"Hobgoblin","s":MOTM,"a":"flex","sz":"Medium","sp":30,"dv":60,"lang":["Common"],"lc":1,"tr":[FEY,
  ["Fey Gift","Help as a bonus action, proficiency bonus times per long rest. From 3rd level it adds Hospitality, Passage or Spite."],
  ["Fortune from the Many","Add +1 per ally within 30 ft (max +3) to a missed attack or failed check or save. Proficiency bonus uses per long rest."]]},
 {"n":"Hobgoblin (Volo's)","s":VGM,"a":{"CON":2,"INT":1},"sz":"Medium","sp":30,"dv":60,"lang":["Common","Goblin"],"prof":{"armor":["Light armor"],"weapons":["Two martial weapons of your choice"]},"tr":[
  ["Martial Training","Proficiency with two martial weapons and light armor."],
  ["Saving Face","Add +1 per ally within 30 ft (max +5) to a missed attack or failed check or save. Once per short or long rest."]]}]},
{"id":"kobold","name":"Kobold","group":"Monstrous","tag":"official","versions":[
 {"n":"Kobold","s":MOTM,"a":"flex","sz":"Small","sp":30,"dv":60,"lang":["Common"],"lc":1,"tr":[
  ["Draconic Cry","Bonus action: you and allies have advantage on attacks against enemies within 10 ft of you until your next turn. Proficiency bonus uses per long rest."]],
  "subs":[{"n":"Craftiness","skc":{"n":1,"from":["Arcana","Investigation","Medicine","Sleight of Hand","Survival"]},"tr":[["Kobold Legacy: Craftiness","Proficiency in one of Arcana, Investigation, Medicine, Sleight of Hand, Survival."]]},
   {"n":"Defiance","tr":[["Kobold Legacy: Defiance","Advantage on saves against the frightened condition."]]},
   {"n":"Draconic Sorcery","tr":[["Kobold Legacy: Draconic Sorcery","Know one sorcerer cantrip."]]}]},
 {"n":"Kobold (Volo's)","s":VGM,"a":{"DEX":2},"sz":"Small","sp":30,"dv":60,"lang":["Common","Draconic"],"tr":[
  ["Grovel, Cower, and Beg","Action: allies gain advantage on attacks against enemies within 10 ft of you. Once per short or long rest."],
  ["Pack Tactics","Advantage on attacks against a creature if an ally is within 5 ft of it."],
  ["Sunlight Sensitivity","Disadvantage on attacks and sight-based Perception checks in direct sunlight."]]}]},
{"id":"lizardfolk","name":"Lizardfolk","group":"Monstrous","tag":"official","versions":[
 {"n":"Lizardfolk","s":MOTM,"a":"flex","sz":"Medium","sp":30,"swim":30,"lang":["Common"],"lc":1,"skc":{"n":2,"from":["Animal Handling","Medicine","Nature","Perception","Stealth","Survival"]},"naturalAC":13,"tr":[
  ["Bite","Unarmed bite deals 1d6 + STR mod slashing."],["Hold Breath","Hold your breath for 15 minutes."],
  ["Hungry Jaws","Bonus-action bite; on a hit gain temp HP equal to your proficiency bonus. Proficiency bonus uses per long rest."],
  ["Natural Armor","Unarmored AC is 13 + DEX mod."],["Nature's Intuition","Proficiency in two of Animal Handling, Medicine, Nature, Perception, Stealth, Survival."]]},
 {"n":"Lizardfolk (Volo's)","s":VGM,"a":{"CON":2,"WIS":1},"sz":"Medium","sp":30,"swim":30,"lang":["Common","Draconic"],"skc":{"n":2,"from":["Animal Handling","Nature","Perception","Stealth","Survival"]},"naturalAC":13,"tr":[
  ["Bite","Unarmed bite deals 1d6 + STR mod piercing."],["Cunning Artisan","During a short rest, craft a shield, club, javelin or darts from a slain creature."],["Hold Breath","Hold your breath for 15 minutes."],
  ["Hunter's Lore","Proficiency in two of Animal Handling, Nature, Perception, Stealth, Survival."],["Natural Armor","Unarmored AC is 13 + DEX mod."],
  ["Hungry Jaws","Bonus-action bite; on a hit gain temp HP equal to your CON mod. Once per short or long rest."]]}]},
{"id":"minotaur","name":"Minotaur","group":"Monstrous","tag":"official","versions":[
 {"n":"Minotaur","s":MOTM,"a":"flex","sz":"Medium","sp":30,"lang":["Common"],"lc":1,"tr":[
  ["Horns","Unarmed strikes with your horns deal 1d6 + STR mod piercing."],["Goring Rush","After you Dash and move 20 ft, make a horn attack as a bonus action."],
  ["Hammering Horns","Bonus action after a melee hit: push the target 10 ft (Strength save)."],["Labyrinthine Recall","You always know north and have advantage on Survival checks to navigate or track."]]},
 {"n":"Minotaur (Ravnica / Theros)","s":"Guildmaster's Guide to Ravnica","tag":"setting","a":{"STR":2,"CON":1},"sz":"Medium","sp":30,"lang":["Common","Minotaur"],"skc":{"n":1,"from":["Intimidation","Persuasion"]},"tr":[
  ["Horns","Unarmed strikes with your horns deal 1d6 + STR mod piercing."],["Goring Rush","After you Dash and move 20 ft, make a horn attack as a bonus action."],
  ["Hammering Horns","Bonus action after a melee hit: push the target 10 ft (Strength save)."],["Imposing Presence","Proficiency in Intimidation or Persuasion."]]},
 {"n":"Minotaur (Amonkhet)","s":"Plane Shift: Amonkhet","tag":"setting","a":{"STR":2,"CON":1},"sz":"Medium","sp":30,"lang":["Common","Minotaur"],"sk":["Intimidation"],"tr":[
  ["Natural Weapon","Horn strikes deal 1d6 + STR mod bludgeoning."],["Menacing","Proficiency in Intimidation."],
  ["Relentless Endurance","When reduced to 0 HP but not killed, drop to 1 HP instead. Once per long rest."],["Savage Attacks","On a melee critical hit, roll one weapon damage die an extra time."]]}]},
{"id":"orc","name":"Orc","group":"Monstrous","tag":"official","versions":[
 {"n":"Orc","s":MOTM,"a":"flex","sz":"Medium","sp":30,"dv":60,"lang":["Common"],"lc":1,"tr":[
  ["Adrenaline Rush","Dash as a bonus action and gain temp HP equal to your proficiency bonus. Proficiency bonus uses per long rest."],PB,
  ["Relentless Endurance","When reduced to 0 HP but not killed, drop to 1 HP instead. Once per long rest."]]},
 {"n":"Orc (Volo's / Eberron / Wildemount)","s":VGM,"a":{"STR":2,"CON":1},"sz":"Medium","sp":30,"dv":60,"lang":["Common","Orc"],"skc":{"n":2,"from":["Animal Handling","Insight","Intimidation","Medicine","Nature","Perception","Survival"]},"tr":[
  ["Aggressive","Bonus action: move up to your speed toward an enemy."],
  ["Primal Intuition","Proficiency in two of Animal Handling, Insight, Intimidation, Medicine, Nature, Perception, Survival."],PB]},
 {"n":"Orc (Ixalan)","s":"Plane Shift: Ixalan","tag":"setting","a":{"STR":2,"CON":1},"sz":"Medium","sp":30,"dv":60,"lang":["Common","Orc"],"sk":["Intimidation"],"tr":[
  ["Menacing","Proficiency in Intimidation."],["Relentless Endurance","When reduced to 0 HP but not killed, drop to 1 HP instead. Once per long rest."],
  ["Savage Attacks","On a melee critical hit, roll one weapon damage die an extra time."]]}]},
{"id":"shifter","name":"Shifter","group":"Monstrous","tag":"official","versions":[
 {"n":"Shifter","s":MOTM,"a":"flex","sz":"Medium","sp":30,"dv":60,"lang":["Common"],"lc":1,"skc":{"n":1,"from":["Acrobatics","Athletics","Intimidation","Survival"]},"tr":[
  ["Bestial Instincts","Proficiency in one of Acrobatics, Athletics, Intimidation, Survival."],
  ["Shifting","Bonus action: shift for 1 minute and gain temp HP equal to twice your proficiency bonus. Proficiency bonus uses per long rest."]],
  "subs":[{"n":"Beasthide","tr":[["Shifting: Beasthide","+1d6 temp HP when you shift and +1 AC while shifted."]]},
   {"n":"Longtooth","tr":[["Shifting: Longtooth","While shifted, bonus-action fang attack for 1d6 + STR mod piercing."]]},
   {"n":"Swiftstride","tr":[["Shifting: Swiftstride","While shifted, +10 ft speed and a reaction to move 10 ft when a creature ends its turn within 5 ft."]]},
   {"n":"Wildhunt","tr":[["Shifting: Wildhunt","While shifted, advantage on Wisdom checks and no creature within 30 ft can have advantage against you."]]}]},
 {"n":"Shifter (Eberron)","s":"Eberron: Rising from the Last War","tag":"setting","a":{},"sz":"Medium","sp":30,"dv":60,"lang":["Common"],"tr":[
  ["Shifting","Bonus action: shift for 1 minute and gain temp HP equal to your level + CON mod. Once per short or long rest."]],
  "subs":[{"n":"Beasthide","a":{"CON":2,"STR":1},"sk":["Athletics"],"tr":[["Shifting Feature","+1d6 temp HP when you shift and +1 AC while shifted."]]},
   {"n":"Longtooth","a":{"STR":2,"DEX":1},"sk":["Intimidation"],"tr":[["Shifting Feature","While shifted, bonus-action fang attack for 1d6 + STR mod piercing."]]},
   {"n":"Swiftstride","a":{"DEX":2,"CHA":1},"sk":["Acrobatics"],"tr":[["Shifting Feature","While shifted, +10 ft speed and a reaction to move 10 ft when an enemy ends its turn within 5 ft."]]},
   {"n":"Wildhunt","a":{"WIS":2,"DEX":1},"sk":["Survival"],"tr":[["Mark the Scent","Bonus action: mark a creature within 10 ft; double proficiency to find it. Once per short or long rest."],["Shifting Feature","While shifted, advantage on Wisdom checks."]]}]}]},
{"id":"yuan-ti","name":"Yuan-Ti","group":"Monstrous","tag":"official","versions":[
 {"n":"Yuan-Ti","s":MOTM,"a":"flex","sz":"Small or Medium","sp":30,"dv":60,"lang":["Common"],"lc":1,"res":["poison"],"tr":[
  ["Magic Resistance","Advantage on saves against spells."],["Poison Resilience","Advantage on saves against the poisoned condition and resistance to poison damage."],
  ["Serpentine Spellcasting","Know Poison Spray. Cast Animal Friendship on snakes at will, and Suggestion once per long rest from 3rd level."]]},
 {"n":"Yuan-Ti Pureblood (Volo's)","s":VGM,"a":{"CHA":2,"INT":1},"sz":"Medium","sp":30,"dv":60,"lang":["Common","Abyssal","Draconic"],"imm":["poison"],"tr":[
  ["Innate Spellcasting","Know Poison Spray. Cast Animal Friendship on snakes at will, and Suggestion once per long rest from 3rd level, using Charisma."],
  ["Magic Resistance","Advantage on saves against spells and other magical effects."],["Poison Immunity","Immune to poison damage and the poisoned condition."]]}]},

{"id":"kender","name":"Kender","group":"Dragonlance","tag":"setting","versions":[
 {"n":"Kender","s":"Dragonlance: Shadow of the Dragon Queen","a":"flex","sz":"Small","sp":30,"lang":["Common"],"lc":1,"skc":{"n":1,"from":["Insight","Investigation","Sleight of Hand","Stealth","Survival"]},"tr":[
  ["Fearless","Advantage on saves against the frightened condition, and once per long rest turn a failed one into a success."],
  ["Kender Aptitude","Proficiency in one of Insight, Investigation, Sleight of Hand, Stealth, Survival."],
  ["Taunt","Bonus action: a creature within 60 ft makes a Wisdom save or has disadvantage attacking anyone but you. Proficiency bonus uses per long rest."]]}]},
{"id":"kalashtar","name":"Kalashtar","group":"Eberron","tag":"setting","versions":[
 {"n":"Kalashtar","s":"Eberron: Rising from the Last War","a":{"WIS":2,"CHA":1},"sz":"Medium","sp":30,"lang":["Common","Quori"],"lc":1,"res":["psychic"],"tr":[
  ["Dual Mind","Advantage on all Wisdom saving throws."],["Mental Discipline","Resistance to psychic damage."],
  ["Mind Link","Speak telepathically to a creature within 10 ft x your level; you can let it reply for 1 hour."],["Severed from Dreams","Immune to effects that require you to dream."]]}]},
{"id":"warforged","name":"Warforged","group":"Eberron","tag":"setting","versions":[
 {"n":"Warforged","s":"Eberron: Rising from the Last War","a":{"CON":2},"ac":1,"sz":"Medium","sp":30,"lang":["Common"],"lc":1,"skc":{"n":1,"from":"any"},"res":["poison"],"acBonus":1,"prof":{"tools":["One tool of your choice"]},"tr":[
  ["Constructed Resilience","Advantage on saves against poison, resistance to poison, immunity to disease, and no need to eat, drink, breathe or sleep."],
  ["Sentry's Rest","Long rest by staying inactive but conscious for 6 hours."],["Integrated Protection","+1 AC. Armor takes 1 hour to don and can't be removed against your will."],
  ["Specialized Design","One skill and one tool proficiency of your choice."]]}]},
{"id":"dhampir","name":"Dhampir","group":"Ravenloft","tag":"setting","versions":[
 {"n":"Dhampir","s":"Van Richten's Guide to Ravenloft","a":"flex","sz":"Small or Medium","sp":35,"climb":35,"dv":60,"lang":["Common"],"lc":1,"skc":{"n":2,"from":"any"},"tr":[
  ["Ancestral Legacy","Two skill proficiencies of your choice (or keep those of the race you replace)."],["Deathless Nature","You don't need to breathe."],
  ["Spider Climb","Climbing speed equal to your walking speed; from 3rd level, walk on walls and ceilings."],
  ["Vampiric Bite","Bite for 1d4 piercing using Constitution, with advantage below half HP. Proficiency bonus times per long rest, empower it to heal or gain a bonus on your next roll."]]}]},
{"id":"hexblood","name":"Hexblood","group":"Ravenloft","tag":"setting","versions":[
 {"n":"Hexblood","s":"Van Richten's Guide to Ravenloft","a":"flex","sz":"Small or Medium","sp":30,"dv":60,"lang":["Common"],"lc":1,"skc":{"n":2,"from":"any"},"tr":[
  ["Ancestral Legacy","Two skill proficiencies of your choice (or keep those of the race you replace)."],
  ["Eerie Token","Bonus action: create a token from your hair, nail or tooth for telepathic messages or remote viewing within 10 miles. Once per long rest."],
  ["Hex Magic","Cast Disguise Self and Hex once each per long rest or with slots."]]}]},
{"id":"reborn","name":"Reborn","group":"Ravenloft","tag":"setting","versions":[
 {"n":"Reborn","s":"Van Richten's Guide to Ravenloft","a":"flex","sz":"Small or Medium","sp":30,"lang":["Common"],"lc":1,"skc":{"n":2,"from":"any"},"res":["poison"],"tr":[
  ["Ancestral Legacy","Two skill proficiencies of your choice (or keep those of the race you replace)."],
  ["Deathless Nature","Advantage on saves against disease, poison and death saves; resistance to poison; no need to eat, drink, breathe or sleep."],
  ["Knowledge from a Past Life","Add d6 to a skill check, proficiency bonus times per long rest."]]}]}
);
})();
