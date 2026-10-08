// Lineage data summarised from https://dnd5e.wikidot.com (CC BY-SA 3.0). Trait text is paraphrased.
// Keys: s source, a fixed ability increases or "flex" (+2/+1 or +1/+1/+1 of your choice), ac number of extra +1s of your choice,
// sz size, sp speed, dv darkvision, lang fixed languages, lc languages of choice, sk fixed skills, skc {n, from} skill choices,
// res resistances, prof {armor,weapons,tools}, tr traits as [name, text], subs subraces (added on top of the version).
window.DND = window.DND || {};
DND.lineages = DND.lineages || [];
DND.lineages.push(
{"id":"dragonborn","name":"Dragonborn","group":"Common","tag":"official","versions":[
 {"n":"Dragonborn","s":"Player's Handbook","a":{"STR":2,"CHA":1},"sz":"Medium","sp":30,"lang":["Common","Draconic"],"pick":{"label":"Draconic Ancestry","from":["Black (acid)","Blue (lightning)","Brass (fire)","Bronze (lightning)","Copper (acid)","Gold (fire)","Green (poison)","Red (fire)","Silver (cold)","White (cold)"]},"tr":[
  ["Draconic Ancestry","Choose a dragon type; it sets your breath weapon and damage resistance."],
  ["Breath Weapon","Action: exhale energy in a line or cone. DC 8 + CON mod + proficiency; 2d6 damage (3d6 at 6th, 4d6 at 11th, 5d6 at 16th), half on a save. Once per short or long rest."],
  ["Damage Resistance","Resistance to your ancestry's damage type."]],
  "subs":[{"n":"Standard","s":"Player's Handbook"},
   {"n":"Draconblood","s":"Explorer's Guide to Wildemount","tag":"setting","a":{"INT":2,"CHA":1},"replaceAsi":true,"dv":60,"dropTraits":["Damage Resistance"],"tr":[["Forceful Presence","Once per short or long rest, gain advantage on an Intimidation or Persuasion check."]]},
   {"n":"Ravenite","s":"Explorer's Guide to Wildemount","tag":"setting","a":{"STR":2,"CON":1},"replaceAsi":true,"dv":60,"dropTraits":["Damage Resistance"],"tr":[["Vengeful Assault","Reaction when a creature in reach damages you: attack it. Once per short or long rest."]]}]},
 {"n":"Chromatic Dragonborn","s":"Fizban's Treasury of Dragons","a":"flex","sz":"Medium","sp":30,"lang":["Common"],"lc":1,"pick":{"label":"Chromatic Ancestry","from":["Black (acid)","Blue (lightning)","Green (poison)","Red (fire)","White (cold)"]},"tr":[
  ["Breath Weapon","Replace one attack with a 30-ft line. Dexterity save, DC 8 + CON mod + proficiency; 1d10 damage (2d10 at 5th, 3d10 at 11th, 4d10 at 17th). Proficiency bonus uses per long rest."],
  ["Draconic Resistance","Resistance to your ancestry's damage type."],
  ["Chromatic Warding","From 5th level, action: immunity to your ancestry's damage type for 1 minute. Once per long rest."]]},
 {"n":"Metallic Dragonborn","s":"Fizban's Treasury of Dragons","a":"flex","sz":"Medium","sp":30,"lang":["Common"],"lc":1,"pick":{"label":"Metallic Ancestry","from":["Brass (fire)","Bronze (lightning)","Copper (acid)","Gold (fire)","Silver (cold)"]},"tr":[
  ["Breath Weapon","Replace one attack with a 15-ft cone. Dexterity save, DC 8 + CON mod + proficiency; 1d10 damage (2d10 at 5th, 3d10 at 11th, 4d10 at 17th). Proficiency bonus uses per long rest."],
  ["Draconic Resistance","Resistance to your ancestry's damage type."],
  ["Metallic Breath Weapon","From 5th level, a second 15-ft cone: enervating (Constitution save or incapacitated) or repulsion (Strength save or pushed 20 ft and prone). Once per long rest."]]},
 {"n":"Gem Dragonborn","s":"Fizban's Treasury of Dragons","a":"flex","sz":"Medium","sp":30,"lang":["Common"],"lc":1,"pick":{"label":"Gem Ancestry","from":["Amethyst (force)","Crystal (radiant)","Emerald (psychic)","Sapphire (thunder)","Topaz (necrotic)"]},"tr":[
  ["Breath Weapon","Replace one attack with a 15-ft cone. Dexterity save, DC 8 + CON mod + proficiency; 1d10 damage (2d10 at 5th, 3d10 at 11th, 4d10 at 17th). Proficiency bonus uses per long rest."],
  ["Draconic Resistance","Resistance to your ancestry's damage type."],
  ["Psionic Mind","Speak telepathically to a creature you can see within 30 ft."],
  ["Gem Flight","From 5th level, bonus action: spectral wings for 1 minute with a flying speed equal to your walking speed. Once per long rest."]]}]},

{"id":"dwarf","name":"Dwarf","group":"Common","tag":"official","versions":[
 {"n":"Dwarf","s":"Player's Handbook","a":{"CON":2},"sz":"Medium","sp":25,"dv":60,"lang":["Common","Dwarvish"],"res":["poison"],"prof":{"weapons":["Battleaxes","Handaxes","Light hammers","Warhammers"],"tools":["One of smith's tools, brewer's supplies or mason's tools"]},"tr":[
  ["Dwarven Resilience","Advantage on saves against poison and resistance to poison damage."],
  ["Dwarven Combat Training","Proficiency with battleaxes, handaxes, light hammers and warhammers."],
  ["Tool Proficiency","Proficiency with smith's tools, brewer's supplies or mason's tools."],
  ["Stonecunning","Double proficiency on History checks about the origin of stonework."],
  ["Speed","Your speed is not reduced by heavy armor."]],
  "subs":[
   {"n":"Hill Dwarf","s":"Player's Handbook","a":{"WIS":1},"hpPerLevel":1,"tr":[["Dwarven Toughness","+1 HP per level."]]},
   {"n":"Mountain Dwarf","s":"Player's Handbook","a":{"STR":2},"prof":{"armor":["Light armor","Medium armor"]},"tr":[["Dwarven Armor Training","Proficiency with light and medium armor."]]},
   {"n":"Mark of Warding","s":"Eberron: Rising from the Last War","tag":"setting","a":{"INT":1},"tr":[["Warder's Intuition","Add d4 to Investigation checks and thieves' tools checks."],["Wards and Seals","Cast Alarm and Mage Armor (Arcane Lock from 3rd level) once each per long rest, using Intelligence."],["Spells of the Mark","Mark of Warding spells are added to your class spell list."]]}]},
 {"n":"Dwarf (Kaladesh)","s":"Plane Shift: Kaladesh","tag":"setting","a":{"CON":2,"WIS":1},"sz":"Medium","sp":25,"dv":60,"lang":["Common","Dwarvish"],"res":["poison"],"hpPerLevel":1,"tr":[
  ["Dwarven Resilience","Advantage on saves against poison and resistance to poison damage."],
  ["Dwarven Toughness","+1 HP per level."],
  ["Artisan's Expertise","Proficiency and doubled proficiency bonus with two artisan's tools, and double proficiency on History checks about architecture."]]}]},

{"id":"elf","name":"Elf","group":"Common","tag":"official","versions":[
 {"n":"Elf","s":"Player's Handbook","a":{"DEX":2},"sz":"Medium","sp":30,"dv":60,"lang":["Common","Elvish"],"sk":["Perception"],"tr":[
  ["Fey Ancestry","Advantage on saves against being charmed, and magic can't put you to sleep."],
  ["Trance","Meditate 4 hours instead of sleeping 8."],
  ["Keen Senses","Proficiency in Perception."]],
  "subs":[
   {"n":"High Elf","s":"Player's Handbook","a":{"INT":1},"lc":1,"prof":{"weapons":["Longswords","Shortswords","Shortbows","Longbows"]},"tr":[["Cantrip","One wizard cantrip of your choice, cast with Intelligence."],["Elf Weapon Training","Proficiency with longswords, shortswords, shortbows and longbows."],["Extra Language","One extra language of your choice."]]},
   {"n":"Wood Elf","s":"Player's Handbook","a":{"WIS":1},"sp":35,"prof":{"weapons":["Longswords","Shortswords","Shortbows","Longbows"]},"tr":[["Elf Weapon Training","Proficiency with longswords, shortswords, shortbows and longbows."],["Fleet of Foot","Walking speed 35 ft."],["Mask of the Wild","Hide when only lightly obscured by natural phenomena."]]},
   {"n":"Dark Elf (Drow)","s":"Player's Handbook","a":{"CHA":1},"dv":120,"prof":{"weapons":["Rapiers","Shortswords","Hand crossbows"]},"tr":[["Superior Darkvision","Darkvision 120 ft."],["Sunlight Sensitivity","Disadvantage on attacks and sight-based Perception checks in direct sunlight."],["Drow Magic","Know Dancing Lights. Cast Faerie Fire (3rd level) and Darkness (5th level) once each per long rest, using Charisma."],["Drow Weapon Training","Proficiency with rapiers, shortswords and hand crossbows."]]},
   {"n":"Pallid Elf","s":"Explorer's Guide to Wildemount","tag":"setting","a":{"WIS":1},"tr":[["Incisive Sense","Advantage on Investigation and Insight checks."],["Blessing of the Moon Weaver","Know Light. Cast Sleep (3rd level) and Invisibility on yourself (5th level) once each per long rest, using Wisdom."]]},
   {"n":"Mark of Shadow","s":"Eberron: Rising from the Last War","tag":"setting","a":{"CHA":1},"tr":[["Cunning Intuition","Add d4 to Stealth and Performance checks."],["Shape Shadows","Know Minor Illusion. Cast Invisibility once per long rest from 3rd level, using Charisma."],["Spells of the Mark","Mark of Shadow spells are added to your class spell list."]]},
   {"n":"Bishtahar / Tirahar Elf","s":"Plane Shift: Kaladesh","tag":"setting","a":{"WIS":1},"sp":35,"prof":{"weapons":["Longswords","Shortswords","Shortbows","Longbows"]},"tr":[["Elf Weapon Training","Proficiency with longswords, shortswords, shortbows and longbows."],["Fleet of Foot","Walking speed 35 ft."],["Mask of the Wild","Hide when only lightly obscured by natural phenomena."]]},
   {"n":"Vahadar Elf","s":"Plane Shift: Kaladesh","tag":"setting","a":{"WIS":1},"lc":1,"prof":{"weapons":["Longswords","Shortswords","Shortbows","Longbows"]},"tr":[["Elf Weapon Training","Proficiency with longswords, shortswords, shortbows and longbows."],["Cantrip","One druid cantrip of your choice, cast with Wisdom."],["Extra Language","One extra language of your choice."]]},
   {"n":"Avariel (UA)","s":"Unearthed Arcana: Elf Subraces","tag":"ua","fly":30,"lang":["Auran"],"tr":[["Flight","Flying speed 30 ft when not wearing medium or heavy armor."]]},
   {"n":"Grugach (UA)","s":"Unearthed Arcana: Elf Subraces","tag":"ua","a":{"STR":1},"prof":{"weapons":["Spears","Shortbows","Longbows","Nets"]},"tr":[["Grugach Weapon Training","Proficiency with spears, shortbows, longbows and nets."],["Cantrip","One druid cantrip of your choice, cast with Wisdom."],["Languages","You know Sylvan instead of Common."]]}]},
 {"n":"Elf (Zendikar)","s":"Plane Shift: Zendikar","tag":"setting","a":{"WIS":2},"sz":"Medium","sp":30,"dv":60,"lang":["Common","Elvish"],"sk":["Perception"],"tr":[
  ["Fey Ancestry","Advantage on saves against being charmed, and magic can't put you to sleep."],
  ["Trance","Meditate 4 hours instead of sleeping 8."],
  ["Keen Senses","Proficiency in Perception."]],
  "subs":[
   {"n":"Tajuru","s":"Plane Shift: Zendikar","a":{"CHA":1},"skc":{"n":2,"from":"any"},"tr":[["Skill Versatility","Proficiency in two skills or tools of your choice."]]},
   {"n":"Joraga","s":"Plane Shift: Zendikar","a":{"DEX":1},"sp":35,"prof":{"weapons":["Longswords","Shortswords","Shortbows","Longbows"]},"tr":[["Elf Weapon Training","Proficiency with longswords, shortswords, shortbows and longbows."],["Fleet of Foot","Walking speed 35 ft."],["Mask of the Wild","Hide when only lightly obscured by natural phenomena."]]},
   {"n":"Mul Daya","s":"Plane Shift: Zendikar","a":{"STR":1},"dv":120,"prof":{"weapons":["Longswords","Shortswords","Shortbows","Longbows"]},"tr":[["Superior Darkvision","Darkvision 120 ft."],["Sunlight Sensitivity","Disadvantage on attacks and sight-based Perception checks in direct sunlight."],["Mul Daya Magic","Know Chill Touch. Cast Hex (3rd level) and Darkness (5th level) once each per long rest, using Wisdom."],["Elf Weapon Training","Proficiency with longswords, shortswords, shortbows and longbows."]]}]}]},

{"id":"gnome","name":"Gnome","group":"Common","tag":"official","versions":[
 {"n":"Gnome","s":"Player's Handbook","a":{"INT":2},"sz":"Small","sp":25,"dv":60,"lang":["Common","Gnomish"],"tr":[["Gnome Cunning","Advantage on Intelligence, Wisdom and Charisma saves against magic."]],
  "subs":[
   {"n":"Forest Gnome","s":"Player's Handbook","a":{"DEX":1},"tr":[["Natural Illusionist","Know Minor Illusion, cast with Intelligence."],["Speak with Small Beasts","Communicate simple ideas with Small or smaller beasts."]]},
   {"n":"Rock Gnome","s":"Player's Handbook","a":{"CON":1},"prof":{"tools":["Tinker's tools"]},"tr":[["Artificer's Lore","Double proficiency on History checks about magic items, alchemical objects and technology."],["Tinker","Proficiency with tinker's tools. Spend 1 hour and 10 gp to build a Tiny clockwork device (toy, fire starter or music box)."]]},
   {"n":"Mark of Scribing","s":"Eberron: Rising from the Last War","tag":"setting","a":{"CHA":1},"tr":[["Gifted Scribe","Add d4 to History checks and calligrapher's supplies checks."],["Scribe's Insight","Know Message. Cast Comprehend Languages (and Magic Mouth from 3rd level) once each per long rest, using Intelligence."],["Spells of the Mark","Mark of Scribing spells are added to your class spell list."]]}]}]},

{"id":"half-elf","name":"Half-Elf","group":"Common","tag":"official","versions":[
 {"n":"Half-Elf","s":"Player's Handbook","a":{"CHA":2},"ac":2,"sz":"Medium","sp":30,"dv":60,"lang":["Common","Elvish"],"lc":1,"tr":[["Fey Ancestry","Advantage on saves against being charmed, and magic can't put you to sleep."]],
  "subs":[
   {"n":"Standard","s":"Player's Handbook","skc":{"n":2,"from":"any"},"tr":[["Skill Versatility","Proficiency in two skills of your choice."]]},
   {"n":"Wood Elf Descent","s":"Sword Coast Adventurer's Guide","tr":[["Half-Elf Versatility","Choose one: Elf Weapon Training, Fleet of Foot (35 ft speed) or Mask of the Wild."]]},
   {"n":"High Elf Descent","s":"Sword Coast Adventurer's Guide","tr":[["Half-Elf Versatility","Choose one: Elf Weapon Training, or one wizard cantrip cast with Intelligence."]]},
   {"n":"Drow Descent","s":"Sword Coast Adventurer's Guide","tr":[["Drow Magic","Know Dancing Lights. Cast Faerie Fire (3rd level) and Darkness (5th level) once each per long rest, using Charisma."]]},
   {"n":"Aquatic Descent","s":"Sword Coast Adventurer's Guide","swim":30,"tr":[["Swim Speed","Swimming speed 30 ft."]]},
   {"n":"Mark of Detection","s":"Eberron: Rising from the Last War","tag":"setting","a":{"WIS":2},"ac":1,"replaceAsi":true,"tr":[["Deductive Intuition","Add d4 to Investigation and Insight checks."],["Magical Detection","Cast Detect Magic and Detect Poison and Disease (See Invisibility from 3rd level) once each per long rest, using Intelligence."],["Spells of the Mark","Mark of Detection spells are added to your class spell list."]]},
   {"n":"Mark of Storm","s":"Eberron: Rising from the Last War","tag":"setting","a":{"CHA":2,"DEX":1},"ac":0,"replaceAsi":true,"res":["lightning"],"tr":[["Windwright's Intuition","Add d4 to Acrobatics checks and navigator's tools checks."],["Storm's Boon","Resistance to lightning damage."],["Headwinds","Know Gust. Cast Gust of Wind once per long rest from 3rd level, using Charisma."],["Spells of the Mark","Mark of Storm spells are added to your class spell list."]]}]}]},

{"id":"half-orc","name":"Half-Orc","group":"Common","tag":"official","versions":[
 {"n":"Half-Orc","s":"Player's Handbook","a":{"STR":2,"CON":1},"sz":"Medium","sp":30,"dv":60,"lang":["Common","Orc"],"sk":["Intimidation"],"tr":[
  ["Menacing","Proficiency in Intimidation."],
  ["Relentless Endurance","When reduced to 0 HP but not killed, drop to 1 HP instead. Once per long rest."],
  ["Savage Attacks","On a melee critical hit, roll one weapon damage die an extra time."]]},
 {"n":"Half-Orc (Mark of Finding)","s":"Eberron: Rising from the Last War","tag":"setting","a":{"WIS":2,"CON":1},"sz":"Medium","sp":30,"dv":60,"lang":["Common","Goblin"],"tr":[
  ["Hunter's Intuition","Add d4 to Perception and Survival checks."],
  ["Finder's Magic","Cast Hunter's Mark (and Locate Object from 3rd level) once each per long rest, using Wisdom."],
  ["Spells of the Mark","Mark of Finding spells are added to your class spell list."]]}]},

{"id":"halfling","name":"Halfling","group":"Common","tag":"official","versions":[
 {"n":"Halfling","s":"Player's Handbook","a":{"DEX":2},"sz":"Small","sp":25,"lang":["Common","Halfling"],"tr":[
  ["Lucky","Reroll a natural 1 on an attack roll, ability check or saving throw."],
  ["Brave","Advantage on saves against being frightened."],
  ["Halfling Nimbleness","Move through the space of any creature larger than you."]],
  "subs":[
   {"n":"Lightfoot","s":"Player's Handbook","a":{"CHA":1},"tr":[["Naturally Stealthy","Hide behind a creature at least one size larger than you."]]},
   {"n":"Stout","s":"Player's Handbook","a":{"CON":1},"res":["poison"],"tr":[["Stout Resilience","Advantage on saves against poison and resistance to poison damage."]]},
   {"n":"Ghostwise","s":"Sword Coast Adventurer's Guide","a":{"WIS":1},"tr":[["Silent Speech","Speak telepathically to one creature within 30 ft that shares a language with you."]]},
   {"n":"Lotusden","s":"Explorer's Guide to Wildemount","tag":"setting","a":{"WIS":1},"tr":[["Child of the Wood","Know Druidcraft. Cast Entangle (3rd level) and Spike Growth (5th level) once each per long rest, using Wisdom."],["Timberwalk","Checks to track you have disadvantage, and nonmagical plants don't slow you."]]},
   {"n":"Mark of Hospitality","s":"Eberron: Rising from the Last War","tag":"setting","a":{"CHA":1},"tr":[["Ever Hospitable","Add d4 to Persuasion checks and to brewer's supplies and cook's utensils checks."],["Innkeeper's Magic","Know Prestidigitation. Cast Purify Food and Drink and Unseen Servant once each per long rest, using Charisma."],["Spells of the Mark","Mark of Hospitality spells are added to your class spell list."]]},
   {"n":"Mark of Healing","s":"Eberron: Rising from the Last War","tag":"setting","a":{"WIS":1},"tr":[["Medical Intuition","Add d4 to Medicine checks and herbalism kit checks."],["Healing Touch","Cast Cure Wounds (and Lesser Restoration from 3rd level) once each per long rest, using Wisdom."],["Spells of the Mark","Mark of Healing spells are added to your class spell list."]]}]}]},

{"id":"human","name":"Human","group":"Common","tag":"official","versions":[
 {"n":"Human","s":"Player's Handbook","a":{"STR":1,"DEX":1,"CON":1,"INT":1,"WIS":1,"CHA":1},"sz":"Medium","sp":30,"lang":["Common"],"lc":1,"tr":[]},
 {"n":"Variant Human","s":"Player's Handbook","a":{},"ac":2,"sz":"Medium","sp":30,"lang":["Common"],"lc":1,"skc":{"n":1,"from":"any"},"feat":1,"tr":[["Skills","Proficiency in one skill of your choice."],["Feat","One feat of your choice."]]},
 {"n":"Human (Innistrad)","s":"Plane Shift: Innistrad","tag":"setting","a":{},"sz":"Medium","sp":30,"lang":["Common"],"lc":1,"tr":[],"subs":[
   {"n":"Gavony","s":"Plane Shift: Innistrad","a":{"STR":1,"DEX":1,"CON":1,"INT":1,"WIS":1,"CHA":1}},
   {"n":"Kessig","s":"Plane Shift: Innistrad","a":{"DEX":1,"WIS":1},"sp":40,"sk":["Survival"],"tr":[["Fleet of Foot","Walking speed 40 ft."],["Sure-Footed","Difficult terrain costs no extra movement when you Dash."],["Spring Attack","A creature you make a melee attack against can't make opportunity attacks against you this turn."]]},
   {"n":"Nephalia","s":"Plane Shift: Innistrad","a":{"INT":1,"CHA":1},"skc":{"n":4,"from":"any"},"tr":[["Breadth of Knowledge","Proficiency in any combination of four skills or tools."]]},
   {"n":"Stensia","s":"Plane Shift: Innistrad","a":{"STR":1,"CON":1},"sk":["Intimidation"],"hpPerLevel":2,"tr":[["Tough","+2 HP per level."]]}]},
 {"n":"Human (Keldon)","s":"Plane Shift: Dominaria","tag":"setting","a":{"STR":2,"CON":1},"sz":"Medium","sp":30,"lang":["Common","Keldon"],"sk":["Athletics"],"saves":["STR"],"tr":[["Keldon Resilience","Proficiency in Strength saving throws."],["Icehaven Born","Naturally adapted to cold climates."]]},
 {"n":"Human (Dragonmarked)","s":"Eberron: Rising from the Last War","tag":"setting","a":{},"sz":"Medium","sp":30,"lang":["Common"],"lc":1,"tr":[],"subs":[
   {"n":"Mark of Finding","s":"Eberron: Rising from the Last War","a":{"WIS":2,"CON":1},"dv":60,"lang":["Goblin"],"tr":[["Hunter's Intuition","Add d4 to Perception and Survival checks."],["Finder's Magic","Cast Hunter's Mark (and Locate Object from 3rd level) once each per long rest, using Wisdom."],["Spells of the Mark","Mark of Finding spells are added to your class spell list."]]},
   {"n":"Mark of Handling","s":"Eberron: Rising from the Last War","a":{"WIS":2},"ac":1,"tr":[["Wild Intuition","Add d4 to Animal Handling and Nature checks."],["Primal Connection","Cast Animal Friendship and Speak with Animals once each per long rest, using Wisdom."],["The Bigger They Are","From 3rd level, target monstrosities with Intelligence 3 or lower with those spells."],["Spells of the Mark","Mark of Handling spells are added to your class spell list."]]},
   {"n":"Mark of Making","s":"Eberron: Rising from the Last War","a":{"INT":2},"ac":1,"tr":[["Artisan's Intuition","Add d4 to Arcana checks and artisan's tools checks."],["Maker's Gift","Proficiency with one artisan's tool."],["Spellsmith","Know Mending. Cast Magic Weapon once per long rest, lasting 1 hour without concentration."],["Spells of the Mark","Mark of Making spells are added to your class spell list."]]},
   {"n":"Mark of Passage","s":"Eberron: Rising from the Last War","a":{"DEX":2},"ac":1,"sp":35,"tr":[["Courier's Speed","Walking speed 35 ft."],["Intuitive Motion","Add d4 to Acrobatics checks and land vehicle checks."],["Magical Passage","Cast Misty Step once per long rest, using Dexterity."],["Spells of the Mark","Mark of Passage spells are added to your class spell list."]]},
   {"n":"Mark of Sentinel","s":"Eberron: Rising from the Last War","a":{"CON":2,"WIS":1},"tr":[["Sentinel's Intuition","Add d4 to Insight and Perception checks."],["Guardian's Shield","Cast Shield once per long rest, using Wisdom."],["Vigilant Guardian","Reaction: swap places with a creature within 5 ft that is hit and take the hit instead. Once per long rest."],["Spells of the Mark","Mark of Sentinel spells are added to your class spell list."]]}]}]},

{"id":"tiefling","name":"Tiefling","group":"Common","tag":"official","versions":[
 {"n":"Tiefling","s":"Player's Handbook","a":{"CHA":2},"sz":"Medium","sp":30,"dv":60,"lang":["Common","Infernal"],"res":["fire"],"tr":[["Hellish Resistance","Resistance to fire damage."]],
  "subs":[
   {"n":"Asmodeus","s":"Player's Handbook","a":{"INT":1},"tr":[["Infernal Legacy","Know Thaumaturgy. Cast Hellish Rebuke (3rd level, as a 2nd-level spell) and Darkness (5th level) once each per long rest, using Charisma."]]},
   {"n":"Baalzebul","s":"Mordenkainen's Tome of Foes","a":{"INT":1},"tr":[["Legacy of Maladomini","Know Thaumaturgy. Cast Ray of Sickness (3rd level) and Crown of Madness (5th level) once each per long rest, using Charisma."]]},
   {"n":"Dispater","s":"Mordenkainen's Tome of Foes","a":{"DEX":1},"tr":[["Legacy of Dis","Know Thaumaturgy. Cast Disguise Self (3rd level) and Detect Thoughts (5th level) once each per long rest, using Charisma."]]},
   {"n":"Fierna","s":"Mordenkainen's Tome of Foes","a":{"WIS":1},"tr":[["Legacy of Phlegethos","Know Friends. Cast Charm Person (3rd level) and Suggestion (5th level) once each per long rest, using Charisma."]]},
   {"n":"Glasya","s":"Mordenkainen's Tome of Foes","a":{"DEX":1},"tr":[["Legacy of Malbolge","Know Minor Illusion. Cast Disguise Self (3rd level) and Invisibility (5th level) once each per long rest, using Charisma."]]},
   {"n":"Levistus","s":"Mordenkainen's Tome of Foes","a":{"CON":1},"tr":[["Legacy of Stygia","Know Ray of Frost. Cast Armor of Agathys (3rd level) and Darkness (5th level) once each per long rest, using Charisma."]]},
   {"n":"Mammon","s":"Mordenkainen's Tome of Foes","a":{"INT":1},"tr":[["Legacy of Minauros","Know Mage Hand. Cast Tenser's Floating Disk (3rd level) and Arcane Lock (5th level) once each per long rest, using Charisma."]]},
   {"n":"Mephistopheles","s":"Mordenkainen's Tome of Foes","a":{"INT":1},"tr":[["Legacy of Cania","Know Mage Hand. Cast Burning Hands (3rd level) and Flame Blade (5th level) once each per long rest, using Charisma."]]},
   {"n":"Zariel","s":"Mordenkainen's Tome of Foes","a":{"STR":1},"tr":[["Legacy of Avernus","Know Thaumaturgy. Cast Searing Smite (3rd level) and Branding Smite (5th level) once each per long rest, using Charisma."]]},
   {"n":"Feral (Variant)","s":"Sword Coast Adventurer's Guide","a":{"DEX":2,"INT":1},"replaceAsi":true,"tr":[["Variant Options","Choose one: Infernal Legacy; Devil's Tongue (Vicious Mockery, Charm Person, Enthrall); Hellfire (Burning Hands in place of Hellish Rebuke); or Winged (30 ft flying speed, no heavy armor)."]]},
   {"n":"Abyssal (UA)","s":"Unearthed Arcana: That Old Black Magic","tag":"ua","a":{"CON":1},"lang":["Abyssal"],"tr":[["Abyssal Arcana","After each long rest, gain random spells: a cantrip, a 1st-level spell from 3rd level, and a 2nd-level spell from 5th level."],["Abyssal Fortitude","HP maximum increases by half your level."]]}]}]},

{"id":"custom","name":"Custom Lineage","group":"Custom","tag":"official","versions":[
 {"n":"Custom Lineage","s":"Tasha's Cauldron of Everything","a":{},"plus2":1,"sz":"Small or Medium","sp":30,"lang":["Common"],"lc":1,"feat":1,"tr":[["Feat","One feat of your choice."],["Variable Trait","Choose darkvision 60 ft or proficiency in one skill."]],
  "subs":[{"n":"Darkvision","s":"Tasha's Cauldron of Everything","dv":60},{"n":"Skill Proficiency","s":"Tasha's Cauldron of Everything","skc":{"n":1,"from":"any"}}]}]},

{"id":"aarakocra","name":"Aarakocra","group":"Exotic","tag":"official","versions":[
 {"n":"Aarakocra","s":"Monsters of the Multiverse","a":"flex","sz":"Medium","sp":30,"fly":30,"lang":["Common"],"lc":1,"tr":[
  ["Flight","Flying speed equal to your walking speed, not usable in medium or heavy armor."],
  ["Talons","Unarmed strikes deal 1d6 + STR mod slashing."],
  ["Wind Caller","From 3rd level, cast Gust of Wind once per long rest or with slots."]]},
 {"n":"Aarakocra (Elemental Evil)","s":"Elemental Evil Player's Companion","a":{"DEX":2,"WIS":1},"sz":"Medium","sp":25,"fly":50,"lang":["Common","Aarakocra","Auran"],"tr":[
  ["Flight","Flying speed 50 ft, not usable in medium or heavy armor."],
  ["Talons","Unarmed strikes deal 1d4 slashing."]]}]},

{"id":"aasimar","name":"Aasimar","group":"Exotic","tag":"official","versions":[
 {"n":"Aasimar","s":"Monsters of the Multiverse","a":"flex","sz":"Small or Medium","sp":30,"dv":60,"lang":["Common"],"lc":1,"res":["necrotic","radiant"],"tr":[
  ["Celestial Resistance","Resistance to necrotic and radiant damage."],
  ["Healing Hands","Action: touch a creature to heal proficiency bonus d4s. Once per long rest."],
  ["Light Bearer","Know the Light cantrip, cast with Charisma."],
  ["Celestial Revelation","From 3rd level, bonus action to transform for 1 minute, once per long rest: Necrotic Shroud (frighten nearby creatures), Radiant Consumption (damaging light) or Radiant Soul (flight). Once per turn add your proficiency bonus in damage."]]},
 {"n":"Aasimar (Volo's)","s":"Volo's Guide to Monsters","a":{"CHA":2},"sz":"Medium","sp":30,"dv":60,"lang":["Common","Celestial"],"res":["necrotic","radiant"],"tr":[
  ["Celestial Resistance","Resistance to necrotic and radiant damage."],
  ["Healing Hands","Action: touch a creature to heal HP equal to your level. Once per long rest."],
  ["Light Bearer","Know the Light cantrip, cast with Charisma."]],
  "subs":[
   {"n":"Protector","s":"Volo's Guide to Monsters","a":{"WIS":1},"tr":[["Radiant Soul","From 3rd level, action: for 1 minute gain a 30 ft flying speed and once per turn deal extra radiant damage equal to your level. Once per long rest."]]},
   {"n":"Scourge","s":"Volo's Guide to Monsters","a":{"CON":1},"tr":[["Radiant Consumption","From 3rd level, action: for 1 minute shed light that deals half your level in radiant damage to you and creatures within 10 ft each turn, and once per turn deal extra radiant damage equal to your level. Once per long rest."]]},
   {"n":"Fallen","s":"Volo's Guide to Monsters","a":{"STR":1},"tr":[["Necrotic Shroud","From 3rd level, action: for 1 minute frighten creatures within 10 ft (Charisma save) and once per turn deal extra necrotic damage equal to your level. Once per long rest."]]}]}]},

{"id":"changeling","name":"Changeling","group":"Exotic","tag":"official","versions":[
 {"n":"Changeling","s":"Monsters of the Multiverse","a":"flex","sz":"Small or Medium","sp":30,"lang":["Common"],"lc":1,"skc":{"n":2,"from":["Deception","Insight","Intimidation","Performance","Persuasion"]},"tr":[
  ["Changeling Instincts","Proficiency in two of Deception, Insight, Intimidation, Performance, Persuasion."],
  ["Shapechanger","Action: change your appearance and voice. Your statistics don't change."]]},
 {"n":"Changeling (Eberron)","s":"Eberron: Rising from the Last War","tag":"setting","a":{"CHA":2},"ac":1,"sz":"Medium","sp":30,"lang":["Common"],"lc":2,"skc":{"n":2,"from":["Deception","Insight","Intimidation","Persuasion"]},"tr":[
  ["Changeling Instincts","Proficiency in two of Deception, Insight, Intimidation, Persuasion."],
  ["Shapechanger","Action: change your appearance and voice. Your statistics don't change."]]}]},

{"id":"deep-gnome","name":"Deep Gnome","group":"Exotic","tag":"official","versions":[
 {"n":"Deep Gnome","s":"Monsters of the Multiverse","a":"flex","sz":"Small","sp":30,"dv":120,"lang":["Common"],"lc":1,"tr":[
  ["Gift of the Svirfneblin","Cast Disguise Self (3rd level) and Nondetection (5th level) once each per long rest or with slots."],
  ["Gnomish Magic Resistance","Advantage on Intelligence, Wisdom and Charisma saves against spells."],
  ["Svirfneblin Camouflage","Advantage on a Stealth check, proficiency bonus times per long rest."]]},
 {"n":"Deep Gnome (Elemental Evil)","s":"Elemental Evil Player's Companion","a":{"INT":2,"DEX":1},"sz":"Small","sp":25,"dv":120,"lang":["Common","Gnomish","Undercommon"],"tr":[
  ["Gnome Cunning","Advantage on Intelligence, Wisdom and Charisma saves against magic."],
  ["Stone Camouflage","Advantage on Stealth checks to hide in rocky terrain."]]}]},

{"id":"duergar","name":"Duergar","group":"Exotic","tag":"official","versions":[
 {"n":"Duergar","s":"Monsters of the Multiverse","a":"flex","sz":"Medium","sp":30,"dv":120,"lang":["Common"],"lc":1,"res":["poison"],"tr":[
  ["Duergar Magic","Cast Enlarge/Reduce on yourself (3rd level) and Invisibility (5th level) once each per long rest or with slots."],
  ["Dwarven Resilience","Advantage on saves against the poisoned condition and resistance to poison damage."],
  ["Psionic Fortitude","Advantage on saves against the charmed and stunned conditions."]]},
 {"n":"Duergar (Gray Dwarf)","s":"Sword Coast Adventurer's Guide","a":{"CON":2,"STR":1},"sz":"Medium","sp":25,"dv":120,"lang":["Common","Dwarvish","Undercommon"],"res":["poison"],"prof":{"weapons":["Battleaxes","Handaxes","Light hammers","Warhammers"],"tools":["One of smith's tools, brewer's supplies or mason's tools"]},"tr":[
  ["Dwarven Resilience","Advantage on saves against poison and resistance to poison damage."],
  ["Duergar Resilience","Advantage on saves against illusions and against being charmed or paralyzed."],
  ["Dwarven Combat Training","Proficiency with battleaxes, handaxes, light hammers and warhammers."],
  ["Stonecunning","Double proficiency on History checks about the origin of stonework."],
  ["Duergar Magic","Cast Enlarge on yourself (3rd level) and Invisibility (5th level) once each per long rest, not in sunlight, using Intelligence."],
  ["Sunlight Sensitivity","Disadvantage on attacks and sight-based Perception checks in direct sunlight."]]}]},

{"id":"eladrin","name":"Eladrin","group":"Exotic","tag":"official","versions":[
 {"n":"Eladrin","s":"Monsters of the Multiverse","a":"flex","sz":"Medium","sp":30,"dv":60,"lang":["Common"],"lc":1,"sk":["Perception"],"pick":{"label":"Season","from":["Autumn","Winter","Spring","Summer"]},"tr":[
  ["Fey Ancestry","Advantage on saves against the charmed condition."],
  ["Fey Step","Bonus action: teleport 30 ft, proficiency bonus times per long rest. From 3rd level it has an extra effect based on your season."],
  ["Keen Senses","Proficiency in Perception."],
  ["Trance","Meditate 4 hours for a long rest; afterwards change season and gain two weapon or tool proficiencies until your next rest."]]},
 {"n":"Eladrin (Tome of Foes)","s":"Mordenkainen's Tome of Foes","a":{"DEX":2,"CHA":1},"sz":"Medium","sp":30,"dv":60,"lang":["Common","Elvish"],"sk":["Perception"],"pick":{"label":"Season","from":["Autumn","Winter","Spring","Summer"]},"tr":[
  ["Fey Ancestry","Advantage on saves against being charmed, and magic can't put you to sleep."],
  ["Fey Step","Bonus action: teleport 30 ft once per short or long rest. From 3rd level it has an extra effect based on your season (Charisma DC)."],
  ["Keen Senses","Proficiency in Perception."],
  ["Trance","Meditate 4 hours instead of sleeping 8."]]}]},

{"id":"fairy","name":"Fairy","group":"Exotic","tag":"official","versions":[
 {"n":"Fairy","s":"Monsters of the Multiverse","a":"flex","sz":"Small","sp":30,"fly":30,"lang":["Common"],"lc":1,"tr":[
  ["Fairy Magic","Know Druidcraft. Cast Faerie Fire (3rd level) and Enlarge/Reduce (5th level) once each per long rest or with slots."],
  ["Flight","Flying speed equal to your walking speed, not usable in medium or heavy armor."]]}]},

{"id":"firbolg","name":"Firbolg","group":"Exotic","tag":"official","versions":[
 {"n":"Firbolg","s":"Monsters of the Multiverse","a":"flex","sz":"Medium","sp":30,"lang":["Common"],"lc":1,"tr":[
  ["Firbolg Magic","Cast Detect Magic and Disguise Self once each per long rest or with slots."],
  ["Hidden Step","Bonus action: invisible until the start of your next turn. Proficiency bonus uses per long rest."],
  ["Powerful Build","Count as one size larger for carrying, pushing, dragging and lifting."],
  ["Speech of Beast and Leaf","Beasts and plants understand you, and you have advantage on Charisma checks to influence them."]]},
 {"n":"Firbolg (Volo's)","s":"Volo's Guide to Monsters","a":{"WIS":2,"STR":1},"sz":"Medium","sp":30,"lang":["Common","Elvish","Giant"],"tr":[
  ["Firbolg Magic","Cast Detect Magic and Disguise Self once each per short or long rest, using Wisdom."],
  ["Hidden Step","Bonus action: invisible until the start of your next turn. Once per short or long rest."],
  ["Powerful Build","Count as one size larger for carrying, pushing, dragging and lifting."],
  ["Speech of Beast and Leaf","Beasts and plants understand you, and you have advantage on Charisma checks to influence them."]]}]},

{"id":"genasi-air","name":"Genasi (Air)","group":"Exotic","tag":"official","versions":[
 {"n":"Air Genasi","s":"Monsters of the Multiverse","a":"flex","sz":"Small or Medium","sp":35,"dv":60,"lang":["Common"],"lc":1,"res":["lightning"],"tr":[
  ["Unending Breath","Hold your breath indefinitely."],
  ["Lightning Resistance","Resistance to lightning damage."],
  ["Mingle with the Wind","Know Shocking Grasp. Cast Feather Fall (3rd level) and Levitate (5th level) once each per long rest or with slots."]]},
 {"n":"Air Genasi (Elemental Evil)","s":"Elemental Evil Player's Companion","a":{"CON":2,"DEX":1},"sz":"Medium","sp":30,"lang":["Common","Primordial"],"tr":[
  ["Unending Breath","Hold your breath indefinitely."],
  ["Mingle with the Wind","Cast Levitate once per long rest, using Constitution."]]}]},
{"id":"genasi-earth","name":"Genasi (Earth)","group":"Exotic","tag":"official","versions":[
 {"n":"Earth Genasi","s":"Monsters of the Multiverse","a":"flex","sz":"Small or Medium","sp":30,"dv":60,"lang":["Common"],"lc":1,"tr":[
  ["Earth Walk","Difficult terrain on the ground costs you no extra movement."],
  ["Merge with Stone","Know Blade Ward and cast it as a bonus action proficiency bonus times per long rest. From 5th level, cast Pass without Trace once per long rest or with slots."]]},
 {"n":"Earth Genasi (Elemental Evil)","s":"Elemental Evil Player's Companion","a":{"CON":2,"STR":1},"sz":"Medium","sp":30,"lang":["Common","Primordial"],"tr":[
  ["Earth Walk","Difficult terrain of earth or stone costs you no extra movement."],
  ["Merge with Stone","Cast Pass without Trace once per long rest, using Constitution."]]}]},
{"id":"genasi-fire","name":"Genasi (Fire)","group":"Exotic","tag":"official","versions":[
 {"n":"Fire Genasi","s":"Monsters of the Multiverse","a":"flex","sz":"Small or Medium","sp":30,"dv":60,"lang":["Common"],"lc":1,"res":["fire"],"tr":[
  ["Fire Resistance","Resistance to fire damage."],
  ["Reach to the Blaze","Know Produce Flame. Cast Burning Hands (3rd level) and Flame Blade (5th level) once each per long rest or with slots."]]},
 {"n":"Fire Genasi (Elemental Evil)","s":"Elemental Evil Player's Companion","a":{"CON":2,"INT":1},"sz":"Medium","sp":30,"dv":60,"lang":["Common","Primordial"],"res":["fire"],"tr":[
  ["Fire Resistance","Resistance to fire damage."],
  ["Reach to the Blaze","Know Produce Flame. From 3rd level cast Burning Hands once per long rest, using Constitution."]]}]},
{"id":"genasi-water","name":"Genasi (Water)","group":"Exotic","tag":"official","versions":[
 {"n":"Water Genasi","s":"Monsters of the Multiverse","a":"flex","sz":"Small or Medium","sp":30,"swim":30,"dv":60,"lang":["Common"],"lc":1,"res":["acid"],"tr":[
  ["Acid Resistance","Resistance to acid damage."],
  ["Amphibious","Breathe air and water."],
  ["Call to the Wave","Know Acid Splash. Cast Create or Destroy Water (3rd level) and Water Walk (5th level) once each per long rest or with slots."]]},
 {"n":"Water Genasi (Elemental Evil)","s":"Elemental Evil Player's Companion","a":{"CON":2,"WIS":1},"sz":"Medium","sp":30,"swim":30,"lang":["Common","Primordial"],"res":["acid"],"tr":[
  ["Acid Resistance","Resistance to acid damage."],
  ["Amphibious","Breathe air and water."],
  ["Call to the Wave","Know Shape Water. From 3rd level cast Create or Destroy Water once per long rest, using Constitution."]]}]},

{"id":"githyanki","name":"Githyanki","group":"Exotic","tag":"official","versions":[
 {"n":"Githyanki","s":"Monsters of the Multiverse","a":"flex","sz":"Medium","sp":30,"lang":["Common"],"lc":1,"res":["psychic"],"tr":[
  ["Astral Knowledge","After each long rest, gain proficiency in one skill and one weapon or tool until your next long rest."],
  ["Githyanki Psionics","Know Mage Hand (invisible). Cast Jump (3rd level) and Misty Step (5th level) once each per long rest or with slots."],
  ["Psychic Resilience","Resistance to psychic damage."]]},
 {"n":"Githyanki (Tome of Foes)","s":"Mordenkainen's Tome of Foes","a":{"STR":2,"INT":1},"sz":"Medium","sp":30,"lang":["Common","Gith"],"lc":1,"skc":{"n":1,"from":"any"},"prof":{"armor":["Light armor","Medium armor"],"weapons":["Shortswords","Longswords","Greatswords"]},"tr":[
  ["Decadent Mastery","One language and one skill or tool proficiency of your choice."],
  ["Martial Prodigy","Proficiency with light and medium armor, shortswords, longswords and greatswords."],
  ["Githyanki Psionics","Know Mage Hand (invisible). Cast Jump (3rd level) and Misty Step (5th level) once each per long rest, using Intelligence."]]}]},
{"id":"githzerai","name":"Githzerai","group":"Exotic","tag":"official","versions":[
 {"n":"Githzerai","s":"Monsters of the Multiverse","a":"flex","sz":"Medium","sp":30,"lang":["Common"],"lc":1,"res":["psychic"],"tr":[
  ["Githzerai Psionics","Know Mage Hand (invisible). Cast Shield (3rd level) and Detect Thoughts (5th level) once each per long rest or with slots."],
  ["Mental Discipline","Advantage on saves against the charmed and frightened conditions."],
  ["Psychic Resilience","Resistance to psychic damage."]]},
 {"n":"Githzerai (Tome of Foes)","s":"Mordenkainen's Tome of Foes","a":{"WIS":2,"INT":1},"sz":"Medium","sp":30,"lang":["Common","Gith"],"tr":[
  ["Mental Discipline","Advantage on saves against the charmed and frightened conditions."],
  ["Githzerai Psionics","Know Mage Hand (invisible). Cast Shield (3rd level) and Detect Thoughts (5th level) once each per long rest, using Wisdom."]]}]},

{"id":"goliath","name":"Goliath","group":"Exotic","tag":"official","versions":[
 {"n":"Goliath","s":"Monsters of the Multiverse","a":"flex","sz":"Medium","sp":30,"lang":["Common"],"lc":1,"sk":["Athletics"],"res":["cold"],"tr":[
  ["Little Giant","Proficiency in Athletics, and you count as one size larger for carrying, pushing, dragging and lifting."],
  ["Mountain Born","Resistance to cold damage and acclimated to high altitude."],
  ["Stone's Endurance","Reaction: reduce damage by 1d12 + CON mod. Proficiency bonus uses per long rest."]]},
 {"n":"Goliath (Elemental Evil)","s":"Elemental Evil Player's Companion","a":{"STR":2,"CON":1},"sz":"Medium","sp":30,"lang":["Common","Giant"],"sk":["Athletics"],"res":["cold"],"tr":[
  ["Natural Athlete","Proficiency in Athletics."],
  ["Stone's Endurance","Reaction: reduce damage by 1d12 + CON mod. Once per short or long rest."],
  ["Powerful Build","Count as one size larger for carrying, pushing, dragging and lifting."],
  ["Mountain Born","Resistance to cold damage and acclimated to high altitude."]]}]},

{"id":"harengon","name":"Harengon","group":"Exotic","tag":"official","versions":[
 {"n":"Harengon","s":"Monsters of the Multiverse","a":"flex","sz":"Small or Medium","sp":30,"lang":["Common"],"lc":1,"sk":["Perception"],"initProf":true,"tr":[
  ["Hare-Trigger","Add your proficiency bonus to initiative."],
  ["Leporine Senses","Proficiency in Perception."],
  ["Lucky Footwork","Reaction when you fail a Dexterity save: add d4 to the roll."],
  ["Rabbit Hop","Bonus action: jump five times your proficiency bonus in feet without provoking. Proficiency bonus uses per long rest."]]}]},

{"id":"kenku","name":"Kenku","group":"Exotic","tag":"official","versions":[
 {"n":"Kenku","s":"Monsters of the Multiverse","a":"flex","sz":"Small or Medium","sp":30,"lang":["Common"],"lc":1,"skc":{"n":2,"from":"any"},"tr":[
  ["Expert Duplication","Advantage on checks to produce an exact duplicate of writing or craftwork."],
  ["Kenku Recall","Proficiency in two skills. Give yourself advantage on a proficient skill check, proficiency bonus times per long rest."],
  ["Mimicry","Mimic sounds and voices; Insight check (DC 8 + proficiency + CHA mod) to detect."]]},
 {"n":"Kenku (Volo's)","s":"Volo's Guide to Monsters","a":{"DEX":2,"WIS":1},"sz":"Medium","sp":30,"lang":["Common","Auran"],"skc":{"n":2,"from":["Acrobatics","Deception","Stealth","Sleight of Hand"]},"tr":[
  ["Expert Forgery","Advantage on checks to forge handwriting and duplicate objects."],
  ["Kenku Training","Proficiency in two of Acrobatics, Deception, Stealth, Sleight of Hand."],
  ["Mimicry","Mimic sounds and voices; you can speak only through mimicry."]]}]}
);
