// Equipment, tools, languages and core tables. Equipment from https://dnd5e.wikidot.com (CC BY-SA 3.0).
window.DND = window.DND || {};
// [name, category, cost, base AC, dex cap (null = full, 0 = none), strength requirement, stealth disadvantage, weight lb]
DND.armor = [
["Padded","Light","5 gp",11,null,0,true,8],["Leather","Light","10 gp",11,null,0,false,10],["Studded Leather","Light","45 gp",12,null,0,false,13],
["Hide","Medium","10 gp",12,2,0,false,12],["Chain Shirt","Medium","50 gp",13,2,0,false,20],["Scale Mail","Medium","50 gp",14,2,0,true,45],["Spiked Armor","Medium","75 gp",14,2,0,true,45],["Breastplate","Medium","400 gp",14,2,0,false,20],["Half Plate","Medium","750 gp",15,2,0,true,40],
["Ring Mail","Heavy","30 gp",14,0,0,true,40],["Chain Mail","Heavy","75 gp",16,0,13,true,55],["Splint","Heavy","200 gp",17,0,15,true,60],["Plate","Heavy","1,500 gp",18,0,15,true,65]
];
DND.shield = {name:"Shield",cost:"10 gp",bonus:2,weight:6};
// [name, category, cost, damage, weight, properties]
DND.weapons = [
["Club","Simple Melee","1 sp","1d4 bludgeoning","2 lb","Light"],["Dagger","Simple Melee","2 gp","1d4 piercing","1 lb","Finesse, light, thrown (20/60)"],["Greatclub","Simple Melee","2 sp","1d8 bludgeoning","10 lb","Two-handed"],["Handaxe","Simple Melee","5 gp","1d6 slashing","2 lb","Light, thrown (20/60)"],["Javelin","Simple Melee","5 sp","1d6 piercing","2 lb","Thrown (30/120)"],["Light Hammer","Simple Melee","2 gp","1d4 bludgeoning","2 lb","Light, thrown (20/60)"],["Mace","Simple Melee","5 gp","1d6 bludgeoning","4 lb",""],["Quarterstaff","Simple Melee","2 sp","1d6 bludgeoning","4 lb","Versatile (1d8)"],["Sickle","Simple Melee","1 gp","1d4 slashing","2 lb","Light"],["Spear","Simple Melee","1 gp","1d6 piercing","3 lb","Thrown (20/60), versatile (1d8)"],["Yklwa","Simple Melee","1 gp","1d8 piercing","3 lb","Thrown (10/30)"],
["Light Crossbow","Simple Ranged","25 gp","1d8 piercing","5 lb","Ammunition, range (80/320), loading, two-handed"],["Dart","Simple Ranged","5 cp","1d4 piercing","1/4 lb","Finesse, thrown (20/60)"],["Shortbow","Simple Ranged","25 gp","1d6 piercing","2 lb","Ammunition, range (80/320), two-handed"],["Sling","Simple Ranged","1 sp","1d4 bludgeoning","-","Ammunition, range (30/120)"],
["Battleaxe","Martial Melee","10 gp","1d8 slashing","4 lb","Versatile (1d10)"],["Double-Bladed Scimitar","Martial Melee","100 gp","2d4 slashing","6 lb","Special, two-handed"],["Flail","Martial Melee","10 gp","1d8 bludgeoning","2 lb",""],["Glaive","Martial Melee","20 gp","1d10 slashing","6 lb","Heavy, reach, two-handed"],["Greataxe","Martial Melee","30 gp","1d12 slashing","7 lb","Heavy, two-handed"],["Greatsword","Martial Melee","50 gp","2d6 slashing","6 lb","Heavy, two-handed"],["Halberd","Martial Melee","20 gp","1d10 slashing","6 lb","Heavy, reach, two-handed"],["Hoopak","Martial Melee","1 gp","1d6 piercing","2 lb","Finesse, special, two-handed; sling 1d4 bludgeoning (40/160)"],["Lance","Martial Melee","10 gp","1d12 piercing","6 lb","Reach, special"],["Longsword","Martial Melee","15 gp","1d8 slashing","3 lb","Versatile (1d10)"],["Maul","Martial Melee","10 gp","2d6 bludgeoning","10 lb","Heavy, two-handed"],["Morningstar","Martial Melee","15 gp","1d8 piercing","4 lb",""],["Pike","Martial Melee","5 gp","1d10 piercing","18 lb","Heavy, reach, two-handed"],["Rapier","Martial Melee","25 gp","1d8 piercing","2 lb","Finesse"],["Scimitar","Martial Melee","25 gp","1d6 slashing","3 lb","Finesse, light"],["Shortsword","Martial Melee","10 gp","1d6 piercing","2 lb","Finesse, light"],["Trident","Martial Melee","5 gp","1d6 piercing","4 lb","Thrown (20/60), versatile (1d8)"],["War Pick","Martial Melee","5 gp","1d8 piercing","2 lb",""],["Warhammer","Martial Melee","15 gp","1d8 bludgeoning","2 lb","Versatile (1d10)"],["Whip","Martial Melee","2 gp","1d4 slashing","3 lb","Finesse, reach"],
["Blowgun","Martial Ranged","10 gp","1 piercing","1 lb","Ammunition, range (25/100), loading"],["Hand Crossbow","Martial Ranged","75 gp","1d6 piercing","3 lb","Ammunition, range (30/120), light, loading"],["Heavy Crossbow","Martial Ranged","50 gp","1d10 piercing","18 lb","Ammunition, range (100/400), heavy, loading, two-handed"],["Longbow","Martial Ranged","50 gp","1d8 piercing","2 lb","Ammunition, range (150/600), heavy, two-handed"],["Net","Martial Ranged","1 gp","-","3 lb","Special, thrown (5/15)"]
];
DND.tools = {
"Artisan's tools":["Alchemist's supplies","Brewer's supplies","Calligrapher's supplies","Carpenter's tools","Cartographer's tools","Cobbler's tools","Cook's utensils","Glassblower's tools","Jeweler's tools","Leatherworker's tools","Mason's tools","Painter's supplies","Potter's tools","Smith's tools","Tinker's tools","Weaver's tools","Woodcarver's tools"],
"Gaming sets":["Dice set","Dragonchess set","Playing card set","Three-Dragon Ante set"],
"Musical instruments":["Bagpipes","Drum","Dulcimer","Flute","Lute","Lyre","Horn","Pan flute","Shawm","Viol"],
"Other tools":["Disguise kit","Forgery kit","Herbalism kit","Navigator's tools","Poisoner's kit","Thieves' tools","Vehicles (land)","Vehicles (water)"]
};
DND.packs = {
"Burglar's Pack":"Backpack, 1,000 ball bearings, 10 ft of string, bell, 5 candles, crowbar, hammer, 10 pitons, hooded lantern, 2 flasks of oil, 5 days of rations, tinderbox, waterskin, 50 ft of hempen rope",
"Diplomat's Pack":"Chest, 2 map or scroll cases, fine clothes, bottle of ink, ink pen, lamp, 2 flasks of oil, 5 sheets of paper, vial of perfume, sealing wax, soap",
"Dungeoneer's Pack":"Backpack, crowbar, hammer, 10 pitons, 10 torches, tinderbox, 10 days of rations, waterskin, 50 ft of hempen rope",
"Entertainer's Pack":"Backpack, bedroll, 2 costumes, 5 candles, 5 days of rations, waterskin, disguise kit",
"Explorer's Pack":"Backpack, bedroll, mess kit, tinderbox, 10 torches, 10 days of rations, waterskin, 50 ft of hempen rope",
"Priest's Pack":"Backpack, blanket, 10 candles, tinderbox, alms box, 2 blocks of incense, censer, vestments, 2 days of rations, waterskin",
"Scholar's Pack":"Backpack, book of lore, bottle of ink, ink pen, 10 sheets of parchment, little bag of sand, small knife"
};
DND.languages = {standard:["Common","Dwarvish","Elvish","Giant","Gnomish","Goblin","Halfling","Orc"],exotic:["Abyssal","Celestial","Deep Speech","Draconic","Infernal","Primordial","Sylvan","Undercommon"],other:["Aarakocra","Aquan","Auran","Gith","Grung","Ignan","Kor silent speech","Leonin","Loxodon","Merfolk","Minotaur","Naga","Netherese","Quori","Siren","Terran","Vampire","Vedalken","Khenra","Aven","Keldon","Druidic","Thieves' Cant"]};
DND.abilities = ["STR","DEX","CON","INT","WIS","CHA"];
DND.abilityNames = {STR:"Strength",DEX:"Dexterity",CON:"Constitution",INT:"Intelligence",WIS:"Wisdom",CHA:"Charisma"};
DND.skills = {"Acrobatics":"DEX","Animal Handling":"WIS","Arcana":"INT","Athletics":"STR","Deception":"CHA","History":"INT","Insight":"WIS","Intimidation":"CHA","Investigation":"INT","Medicine":"WIS","Nature":"INT","Perception":"WIS","Performance":"CHA","Persuasion":"CHA","Religion":"INT","Sleight of Hand":"DEX","Stealth":"DEX","Survival":"WIS"};
DND.alignments = ["Lawful Good","Neutral Good","Chaotic Good","Lawful Neutral","True Neutral","Chaotic Neutral","Lawful Evil","Neutral Evil","Chaotic Evil","Unaligned"];
// Spell slots by caster level (index 0 = level 1), slots for spell levels 1-9.
DND.fullCasterSlots = [[2],[3],[4,2],[4,3],[4,3,2],[4,3,3],[4,3,3,1],[4,3,3,2],[4,3,3,3,1],[4,3,3,3,2],[4,3,3,3,2,1],[4,3,3,3,2,1],[4,3,3,3,2,1,1],[4,3,3,3,2,1,1],[4,3,3,3,2,1,1,1],[4,3,3,3,2,1,1,1],[4,3,3,3,2,1,1,1,1],[4,3,3,3,3,1,1,1,1],[4,3,3,3,3,2,1,1,1],[4,3,3,3,3,2,2,1,1]];
DND.pointBuyCost = {8:0,9:1,10:2,11:3,12:4,13:5,14:7,15:9};
DND.standardArray = [15,14,13,12,10,8];
DND.xpByLevel = [0,300,900,2700,6500,14000,23000,34000,48000,64000,85000,100000,120000,140000,165000,195000,225000,265000,305000,355000];
