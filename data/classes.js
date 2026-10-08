// Class data summarised from https://dnd5e.wikidot.com (CC BY-SA 3.0). Feature text is paraphrased.
// ASI features are generated from asiLevels; subclass features come from data/subclasses-*.js
window.DND = window.DND || {};
DND.classes = [
{"id":"artificer","name":"Artificer","tag":"official","hitDie":8,"armor":["Light armor","Medium armor","Shields"],"weapons":["Simple weapons"],"tools":["Thieves' tools","Tinker's tools","One artisan's tools of your choice"],"saves":["CON","INT"],"skillChoose":2,"skillList":["Arcana","History","Investigation","Medicine","Nature","Perception","Sleight of Hand"],"equipment":["Any two simple weapons","A light crossbow and 20 bolts","(a) studded leather armor or (b) scale mail","Thieves' tools and a dungeoneer's pack"],"multiclass":"Intelligence 13","casting":{"ability":"INT","kind":"half-up","prepared":true,"cantrips":[2,2,2,2,2,2,2,2,2,3,3,3,3,4,4,4,4,4,4,4],"known":null},"subclassLevel":3,"subclassTerm":"Artificer Specialist","asiLevels":[4,8,12,16,19],"columns":{"Infusions Known":[0,4,4,4,4,6,6,6,6,8,8,8,8,10,10,10,10,12,12,12],"Infused Items":[0,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,6,6,6]},"features":[
{"n":"Magical Tinkering","l":1,"t":"Using thieves' or artisan's tools, touch a Tiny nonmagical object as an action to give it one property: light (5 ft bright, 5 ft dim), a recorded 6-second message, a continuous odor or sound, or a static visual effect. Lasts until ended. Max objects at once equals INT modifier (min 1)."},
{"n":"Spellcasting","l":1,"t":"INT is your spellcasting ability. Save DC 8 + proficiency + INT mod; attack bonus proficiency + INT mod. Thieves' or artisan's tools act as your focus. Prepare INT mod + half artificer level (min 1) spells, changeable on a long rest. Prepared ritual spells can be cast as rituals."},
{"n":"Firearm Proficiency (Optional)","l":1,"t":"If your DM uses firearm rules and your artificer has been exposed to firearms, you gain proficiency with them."},
{"n":"Infuse Item","l":2,"t":"Know artificer infusions per the table; swap one on level up. After a long rest, touch nonmagical objects (up to the Infused Items number) to imbue one infusion each, making them magic items. Infusions end INT mod days after your death, or when replaced."},
{"n":"The Right Tool for the Job","l":3,"t":"With thieves' or artisan's tools in hand, spend 1 hour (can be during a rest) to create one set of nonmagical artisan's tools within 5 ft. They vanish when you use this again."},
{"n":"Tool Expertise","l":6,"t":"Your proficiency bonus is doubled for any ability check that uses a tool you are proficient with."},
{"n":"Flash of Genius","l":7,"t":"Reaction when you or a creature you see within 30 ft makes an ability check or saving throw: add your INT modifier to the roll. Uses equal INT mod (min 1) per long rest."},
{"n":"Magic Item Adept","l":10,"t":"Attune to up to four magic items. Crafting a common or uncommon magic item takes a quarter of the time and half the gold."},
{"n":"Spell-Storing Item","l":11,"t":"After a long rest, store a 1st- or 2nd-level artificer spell with a 1-action casting time in a weapon or focus. A holder can cast it as an action using your spellcasting modifier. Usable twice your INT mod times (min 2)."},
{"n":"Magic Item Savant","l":14,"t":"Attune to up to five magic items. Ignore class, race, spell and level requirements for attuning to or using magic items."},
{"n":"Magic Item Master","l":18,"t":"Attune to up to six magic items at once."},
{"n":"Soul of Artifice","l":20,"t":"+1 to all saving throws per magic item you are attuned to. If reduced to 0 HP but not killed outright, use your reaction to end one infusion and drop to 1 HP instead."}]},

{"id":"barbarian","name":"Barbarian","tag":"official","hitDie":12,"armor":["Light armor","Medium armor","Shields"],"weapons":["Simple weapons","Martial weapons"],"tools":[],"saves":["STR","CON"],"skillChoose":2,"skillList":["Animal Handling","Athletics","Intimidation","Nature","Perception","Survival"],"equipment":["(a) a greataxe or (b) any martial melee weapon","(a) two handaxes or (b) any simple weapon","An explorer's pack and four javelins"],"multiclass":"Strength 13","casting":null,"subclassLevel":3,"subclassTerm":"Primal Path","asiLevels":[4,8,12,16,19],"columns":{"Rages":[2,2,3,3,3,4,4,4,4,4,4,4,5,5,5,5,6,6,6,"Unlimited"],"Rage Damage":["+2","+2","+2","+2","+2","+2","+2","+2","+3","+3","+3","+3","+3","+3","+3","+4","+4","+4","+4","+4"]},"features":[
{"n":"Rage","l":1,"t":"Bonus action: rage for 1 minute. While raging and not in heavy armor: advantage on Strength checks and saves, bonus melee Strength damage per the Rage Damage column, and resistance to bludgeoning, piercing and slashing damage. You can't cast or concentrate on spells. Ends early if you fall unconscious or a turn passes without attacking or taking damage. Uses per long rest per the Rages column."},
{"n":"Unarmored Defense","l":1,"t":"While wearing no armor, AC equals 10 + Dexterity modifier + Constitution modifier. A shield still applies."},
{"n":"Reckless Attack","l":2,"t":"On your first attack of your turn you may attack recklessly: advantage on Strength melee attack rolls this turn, but attacks against you have advantage until your next turn."},
{"n":"Danger Sense","l":2,"t":"Advantage on Dexterity saving throws against effects you can see. Lost while blinded, deafened or incapacitated."},
{"n":"Primal Knowledge (Optional)","l":3,"t":"Gain proficiency in one skill from the barbarian skill list. Gain another at 10th level."},
{"n":"Extra Attack","l":5,"t":"Attack twice when you take the Attack action on your turn."},
{"n":"Fast Movement","l":5,"t":"Speed increases by 10 feet while you are not wearing heavy armor."},
{"n":"Feral Instinct","l":7,"t":"Advantage on initiative rolls. If surprised and not incapacitated, you can act normally on your first turn if you enter your rage first."},
{"n":"Instinctive Pounce (Optional)","l":7,"t":"As part of the bonus action to enter your rage, you can move up to half your speed."},
{"n":"Brutal Critical","l":9,"t":"Roll one additional weapon damage die on a melee critical hit. Two dice at 13th level, three at 17th."},
{"n":"Relentless Rage","l":11,"t":"If you drop to 0 HP while raging and don't die outright, make a DC 10 Constitution save to drop to 1 HP instead. The DC rises by 5 each use and resets after a short or long rest."},
{"n":"Persistent Rage","l":15,"t":"Your rage ends early only if you fall unconscious or choose to end it."},
{"n":"Indomitable Might","l":18,"t":"If your total for a Strength check is less than your Strength score, you can use that score instead."},
{"n":"Primal Champion","l":20,"t":"Strength and Constitution each increase by 4. Their maximum becomes 24."}]},

{"id":"bard","name":"Bard","tag":"official","hitDie":8,"armor":["Light armor"],"weapons":["Simple weapons","Hand crossbows","Longswords","Rapiers","Shortswords"],"tools":["Three musical instruments of your choice"],"saves":["DEX","CHA"],"skillChoose":3,"skillList":["Any"],"equipment":["(a) a rapier, (b) a longsword, or (c) any simple weapon","(a) a diplomat's pack or (b) an entertainer's pack","(a) a lute or (b) any other musical instrument","Leather armor and a dagger"],"multiclass":"Charisma 13","casting":{"ability":"CHA","kind":"full","prepared":false,"cantrips":[2,2,2,3,3,3,3,3,3,4,4,4,4,4,4,4,4,4,4,4],"known":[4,5,6,7,8,9,10,11,12,14,15,15,16,18,19,19,20,22,22,22]},"subclassLevel":3,"subclassTerm":"Bard College","asiLevels":[4,8,12,16,19],"columns":{},"features":[
{"n":"Spellcasting","l":1,"t":"Cast bard spells using Charisma. Save DC 8 + proficiency + CHA mod; attack bonus proficiency + CHA mod. Know cantrips and spells per the table; swap one known spell on level up. Known ritual spells can be cast as rituals. A musical instrument is your focus."},
{"n":"Bardic Inspiration","l":1,"t":"Bonus action: give one other creature within 60 ft that can hear you an inspiration die (d6) to add to one ability check, attack roll or save within 10 minutes. Uses equal CHA mod (min 1) per long rest. Die is d8 at 5th, d10 at 10th, d12 at 15th."},
{"n":"Jack of All Trades","l":2,"t":"Add half your proficiency bonus (rounded down) to any ability check that doesn't already include it."},
{"n":"Song of Rest","l":2,"t":"During a short rest, you and allies who hear your performance and spend Hit Dice each regain an extra 1d6 HP (d8 at 9th, d10 at 13th, d12 at 17th)."},
{"n":"Magical Inspiration (Optional)","l":2,"t":"A creature holding your Bardic Inspiration die that casts a healing or damaging spell can add the die to the healing or damage for one target."},
{"n":"Expertise","l":3,"t":"Choose two skill proficiencies; your proficiency bonus is doubled for them. Choose two more at 10th level."},
{"n":"Bardic Versatility (Optional)","l":4,"t":"When you gain an Ability Score Improvement, replace one Expertise skill with another proficient skill, or replace one bard cantrip with another."},
{"n":"Font of Inspiration","l":5,"t":"Regain all Bardic Inspiration uses on a short or long rest."},
{"n":"Countercharm","l":6,"t":"Action: until the end of your next turn, you and friendly creatures within 30 ft that can hear you have advantage on saves against being frightened or charmed."},
{"n":"Magical Secrets","l":10,"t":"Learn two spells from any class; they count as bard spells for you and against your spells known. Two more at 14th and at 18th level."},
{"n":"Superior Inspiration","l":20,"t":"When you roll initiative with no Bardic Inspiration uses left, regain one."}]},

{"id":"blood-hunter","name":"Blood Hunter","tag":"homebrew","hitDie":10,"armor":["Light armor","Medium armor","Shields"],"weapons":["Simple weapons","Martial weapons"],"tools":["Alchemist's supplies"],"saves":["DEX","INT"],"skillChoose":3,"skillList":["Acrobatics","Arcana","Athletics","History","Insight","Investigation","Religion","Survival"],"equipment":["(a) a martial weapon or (b) two simple weapons","(a) a light crossbow and 20 bolts or (b) a hand crossbow and 20 bolts","(a) studded leather armor or (b) scale mail","An explorer's pack and alchemist's supplies"],"multiclass":"Intelligence 13, and Strength or Dexterity 13","casting":null,"subclassLevel":3,"subclassTerm":"Blood Hunter Order","asiLevels":[4,8,12,16,19],"fightingStyleLevel":2,"fightingStyles":["Archery","Dueling","Great Weapon Fighting","Two-Weapon Fighting"],"columns":{"Hemocraft Die":["1d4","1d4","1d4","1d4","1d6","1d6","1d6","1d6","1d6","1d6","1d8","1d8","1d8","1d8","1d8","1d8","1d10","1d10","1d10","1d10"],"Blood Curses Known":[1,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5]},"features":[
{"n":"Variant Hemocraft Ability (Optional)","l":1,"t":"With DM permission, use Wisdom instead of Intelligence for all blood hunter features."},
{"n":"Hunter's Bane","l":1,"t":"Advantage on Survival checks to track fey, fiends or undead and on Intelligence checks to recall information about them. Hemocraft save DC = 8 + proficiency + Hemocraft modifier."},
{"n":"Blood Maledict","l":1,"t":"Know blood curses per the table. Invoke one per use; you may amplify it by taking necrotic damage equal to one Hemocraft die for an extra effect. Uses per short or long rest: 1 (2 at 6th, 3 at 13th, 4 at 17th)."},
{"n":"Fighting Style","l":2,"t":"Choose Archery, Dueling, Great Weapon Fighting or Two-Weapon Fighting."},
{"n":"Crimson Rite","l":2,"t":"Bonus action: activate a known rite on a held weapon until your next rest, taking necrotic damage equal to one Hemocraft die. Its attacks are magical and deal extra Hemocraft die damage of the rite's type. Learn one rite at 2nd, 7th and 14th level."},
{"n":"Extra Attack","l":5,"t":"Attack twice when you take the Attack action on your turn."},
{"n":"Brand of Castigation","l":6,"t":"When you damage a creature with a rite weapon, brand it. You know its direction on your plane, and when it damages you or a creature within 5 ft of you it takes psychic damage equal to your Hemocraft modifier. Once per short or long rest."},
{"n":"Grim Psychometry","l":9,"t":"Advantage on History checks about the sinister or tragic past of an object you touch or your location."},
{"n":"Dark Augmentation","l":10,"t":"Speed +5 ft. Add your Hemocraft modifier (min +1) to Strength, Dexterity and Constitution saves."},
{"n":"Brand of Tethering","l":13,"t":"Brand psychic damage doubles. A branded creature can't Dash, and takes 4d6 psychic damage and must pass a Wisdom save to teleport or leave the plane."},
{"n":"Hardened Soul","l":14,"t":"Advantage on saves against being charmed and frightened."},
{"n":"Sanguine Mastery","l":20,"t":"Once per turn, reroll a Hemocraft die and use either result. On a critical hit with a rite weapon, regain one Blood Maledict use."}]},

{"id":"cleric","name":"Cleric","tag":"official","hitDie":8,"armor":["Light armor","Medium armor","Shields"],"weapons":["Simple weapons"],"tools":[],"saves":["WIS","CHA"],"skillChoose":2,"skillList":["History","Insight","Medicine","Persuasion","Religion"],"equipment":["(a) a mace or (b) a warhammer (if proficient)","(a) scale mail, (b) leather armor, or (c) chain mail (if proficient)","(a) a light crossbow and 20 bolts or (b) any simple weapon","(a) a priest's pack or (b) an explorer's pack","A shield and a holy symbol"],"multiclass":"Wisdom 13","casting":{"ability":"WIS","kind":"full","prepared":true,"cantrips":[3,3,3,4,4,4,4,4,4,5,5,5,5,5,5,5,5,5,5,5],"known":null},"subclassLevel":1,"subclassTerm":"Divine Domain","asiLevels":[4,8,12,16,19],"columns":{},"features":[
{"n":"Spellcasting","l":1,"t":"Cast cleric spells using Wisdom. Prepare WIS mod + cleric level spells (min 1), changeable on a long rest. Save DC 8 + proficiency + WIS mod; attack bonus proficiency + WIS mod. Prepared ritual spells can be cast as rituals. A holy symbol is your focus."},
{"n":"Channel Divinity","l":2,"t":"Channel divine energy for Turn Undead or a domain effect. 1 use per short or long rest (2 at 6th level, 3 at 18th)."},
{"n":"Channel Divinity: Turn Undead","l":2,"t":"Action: each undead within 30 ft that can see or hear you makes a Wisdom save or is turned for 1 minute or until it takes damage."},
{"n":"Harness Divine Power (Optional)","l":2,"t":"Bonus action: expend a Channel Divinity use to regain one spell slot of a level up to half your proficiency bonus (rounded up). Once per long rest (twice at 6th, three times at 18th)."},
{"n":"Cantrip Versatility (Optional)","l":4,"t":"When you gain an Ability Score Improvement, you may replace one cleric cantrip with another."},
{"n":"Destroy Undead","l":5,"t":"An undead that fails its save against Turn Undead is destroyed if its CR is 1/2 or lower (CR 1 at 8th, 2 at 11th, 3 at 14th, 4 at 17th)."},
{"n":"Blessed Strikes (Optional)","l":8,"t":"Replaces Divine Strike or Potent Spellcasting. Once per turn, when a creature takes damage from your cantrip or weapon attack, deal an extra 1d8 radiant damage."},
{"n":"Divine Intervention","l":10,"t":"Action: ask your deity for aid and roll d100. If the roll is at or below your cleric level, the DM chooses the intervention. On success, wait 7 days; otherwise retry after a long rest. Automatic at 20th level."}]},

{"id":"druid","name":"Druid","tag":"official","hitDie":8,"armor":["Light armor","Medium armor","Shields (nonmetal)"],"weapons":["Clubs","Daggers","Darts","Javelins","Maces","Quarterstaffs","Scimitars","Sickles","Slings","Spears"],"tools":["Herbalism kit"],"saves":["INT","WIS"],"skillChoose":2,"skillList":["Arcana","Animal Handling","Insight","Medicine","Nature","Perception","Religion","Survival"],"equipment":["(a) a wooden shield or (b) any simple weapon","(a) a scimitar or (b) any simple melee weapon","Leather armor, an explorer's pack, and a druidic focus"],"multiclass":"Wisdom 13","casting":{"ability":"WIS","kind":"full","prepared":true,"cantrips":[2,2,2,3,3,3,3,3,3,4,4,4,4,4,4,4,4,4,4,4],"known":null},"subclassLevel":2,"subclassTerm":"Druid Circle","asiLevels":[4,8,12,16,19],"columns":{},"languages":["Druidic"],"features":[
{"n":"Druidic","l":1,"t":"You know Druidic, a secret language, and can leave hidden messages in it. Others need a DC 15 Perception check to spot a message and magic to read it."},
{"n":"Spellcasting","l":1,"t":"Cast druid spells using Wisdom. Prepare WIS mod + druid level spells (min 1), changeable on a long rest. Save DC 8 + proficiency + WIS mod; attack bonus proficiency + WIS mod. Prepared ritual spells can be cast as rituals. A druidic focus is your focus."},
{"n":"Wild Shape","l":2,"t":"Action, twice per short or long rest: become a beast you have seen for up to half your druid level in hours. Max CR 1/4 with no flying or swimming speed (CR 1/2, no flying at 4th; CR 1 at 8th). You use the beast's HP and can't cast spells in beast form."},
{"n":"Wild Companion (Optional)","l":2,"t":"Action: expend a Wild Shape use to cast Find Familiar without components. The familiar is a fey and lasts half your druid level in hours."},
{"n":"Cantrip Versatility (Optional)","l":4,"t":"When you gain an Ability Score Improvement, you may replace one druid cantrip with another."},
{"n":"Timeless Body","l":18,"t":"You age only 1 year for every 10 years that pass."},
{"n":"Beast Spells","l":18,"t":"You can cast druid spells in beast shape, performing verbal and somatic components but not material ones."},
{"n":"Archdruid","l":20,"t":"Unlimited Wild Shape uses. Ignore verbal, somatic and costless material components of druid spells in any form."}]},

{"id":"fighter","name":"Fighter","tag":"official","hitDie":10,"armor":["All armor","Shields"],"weapons":["Simple weapons","Martial weapons"],"tools":[],"saves":["STR","CON"],"skillChoose":2,"skillList":["Acrobatics","Animal Handling","Athletics","History","Insight","Intimidation","Perception","Survival"],"equipment":["(a) chain mail or (b) leather armor, a longbow and 20 arrows","(a) a martial weapon and a shield or (b) two martial weapons","(a) a light crossbow and 20 bolts or (b) two handaxes","(a) a dungeoneer's pack or (b) an explorer's pack"],"multiclass":"Strength 13 or Dexterity 13","casting":null,"subclassLevel":3,"subclassTerm":"Martial Archetype","asiLevels":[4,6,8,12,14,16,19],"fightingStyleLevel":1,"fightingStyles":["Archery","Blind Fighting","Defense","Dueling","Great Weapon Fighting","Interception","Protection","Superior Technique","Thrown Weapon Fighting","Two-Weapon Fighting","Unarmed Fighting","Close Quarters Shooter (UA)","Mariner (UA)","Tunnel Fighter (UA)"],"columns":{},"features":[
{"n":"Fighting Style","l":1,"t":"Choose one fighting style. You can't take the same style twice."},
{"n":"Second Wind","l":1,"t":"Bonus action: regain 1d10 + fighter level hit points. Once per short or long rest."},
{"n":"Action Surge","l":2,"t":"On your turn, take one additional action. Once per short or long rest (twice from 17th level, but only once per turn)."},
{"n":"Martial Versatility (Optional)","l":4,"t":"When you gain an Ability Score Improvement, you may swap one fighting style for another, or one Battle Master maneuver for another."},
{"n":"Extra Attack","l":5,"t":"Attack twice when you take the Attack action. Three attacks at 11th level, four at 20th."},
{"n":"Indomitable","l":9,"t":"Reroll a failed saving throw and use the new roll. Once per long rest (twice at 13th, three times at 17th)."}]},

{"id":"monk","name":"Monk","tag":"official","hitDie":8,"armor":[],"weapons":["Simple weapons","Shortswords"],"tools":["One type of artisan's tools or one musical instrument"],"saves":["STR","DEX"],"skillChoose":2,"skillList":["Acrobatics","Athletics","History","Insight","Religion","Stealth"],"equipment":["(a) a shortsword or (b) any simple weapon","(a) a dungeoneer's pack or (b) an explorer's pack","10 darts"],"multiclass":"Dexterity 13 and Wisdom 13","casting":null,"subclassLevel":3,"subclassTerm":"Monastic Tradition","asiLevels":[4,8,12,16,19],"columns":{"Martial Arts":["1d4","1d4","1d4","1d4","1d6","1d6","1d6","1d6","1d6","1d6","1d8","1d8","1d8","1d8","1d8","1d8","1d10","1d10","1d10","1d10"],"Ki Points":["-",2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20],"Unarmored Movement":["-","+10 ft","+10 ft","+10 ft","+10 ft","+15 ft","+15 ft","+15 ft","+15 ft","+20 ft","+20 ft","+20 ft","+20 ft","+25 ft","+25 ft","+25 ft","+25 ft","+30 ft","+30 ft","+30 ft"]},"features":[
{"n":"Unarmored Defense","l":1,"t":"While wearing no armor and not using a shield, AC equals 10 + Dexterity modifier + Wisdom modifier."},
{"n":"Martial Arts","l":1,"t":"While unarmored with no shield and using only unarmed strikes or monk weapons: use Dexterity for attack and damage, use the Martial Arts die for damage, and make one unarmed strike as a bonus action after the Attack action."},
{"n":"Ki","l":2,"t":"Ki points per the table, regained on a short or long rest. Spend 1 for Flurry of Blows (two bonus-action unarmed strikes), Patient Defense (bonus-action Dodge) or Step of the Wind (bonus-action Disengage or Dash, doubled jump). Ki save DC = 8 + proficiency + WIS mod."},
{"n":"Unarmored Movement","l":2,"t":"Speed increases per the table while unarmored without a shield. At 9th level you can move along vertical surfaces and across liquids on your turn."},
{"n":"Dedicated Weapon (Optional)","l":2,"t":"After a rest, touch one simple or martial weapon you are proficient with that lacks the heavy and special properties; it counts as a monk weapon."},
{"n":"Deflect Missiles","l":3,"t":"Reaction when hit by a ranged weapon attack: reduce the damage by 1d10 + DEX mod + monk level. If reduced to 0 you can catch it and spend 1 ki to throw it back (range 20/60)."},
{"n":"Ki-Fueled Attack (Optional)","l":3,"t":"If you spend ki as part of your action, you can make one unarmed strike or monk weapon attack as a bonus action that turn."},
{"n":"Slow Fall","l":4,"t":"Reaction when falling: reduce falling damage by five times your monk level."},
{"n":"Quickened Healing (Optional)","l":4,"t":"Action: spend 2 ki to regain HP equal to a Martial Arts die roll + your proficiency bonus."},
{"n":"Extra Attack","l":5,"t":"Attack twice when you take the Attack action on your turn."},
{"n":"Stunning Strike","l":5,"t":"When you hit with a melee weapon attack, spend 1 ki: the target must pass a Constitution save or be stunned until the end of your next turn."},
{"n":"Focused Aim (Optional)","l":5,"t":"When you miss an attack, spend 1 to 3 ki to add +2 per point to the roll."},
{"n":"Ki-Empowered Strikes","l":6,"t":"Your unarmed strikes count as magical."},
{"n":"Evasion","l":7,"t":"On a Dexterity save for half damage, take none on a success and half on a failure."},
{"n":"Stillness of Mind","l":7,"t":"Action: end one effect on yourself causing you to be charmed or frightened."},
{"n":"Purity of Body","l":10,"t":"You are immune to disease and poison."},
{"n":"Tongue of the Sun and Moon","l":13,"t":"You understand all spoken languages, and any creature that understands a language understands you."},
{"n":"Diamond Soul","l":14,"t":"Proficiency in all saving throws. Spend 1 ki to reroll a failed save."},
{"n":"Timeless Body","l":15,"t":"You suffer no frailty of old age, can't be aged magically, and need no food or water."},
{"n":"Empty Body","l":18,"t":"Action: spend 4 ki to become invisible for 1 minute with resistance to all damage but force. Spend 8 ki to cast Astral Projection on yourself."},
{"n":"Perfect Self","l":20,"t":"When you roll initiative with no ki remaining, regain 4 ki."}]},

{"id":"paladin","name":"Paladin","tag":"official","hitDie":10,"armor":["All armor","Shields"],"weapons":["Simple weapons","Martial weapons"],"tools":[],"saves":["WIS","CHA"],"skillChoose":2,"skillList":["Athletics","Insight","Intimidation","Medicine","Persuasion","Religion"],"equipment":["(a) a martial weapon and a shield or (b) two martial weapons","(a) five javelins or (b) any simple melee weapon","(a) a priest's pack or (b) an explorer's pack","Chain mail and a holy symbol"],"multiclass":"Strength 13 and Charisma 13","casting":{"ability":"CHA","kind":"half","prepared":true,"cantrips":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"known":null},"subclassLevel":3,"subclassTerm":"Sacred Oath","asiLevels":[4,8,12,16,19],"fightingStyleLevel":2,"fightingStyles":["Blessed Warrior","Blind Fighting","Defense","Dueling","Great Weapon Fighting","Interception","Protection","Close Quarters Shooter (UA)","Mariner (UA)","Thrown Weapon Fighting","Tunnel Fighter (UA)","Unarmed Fighting"],"columns":{},"features":[
{"n":"Divine Sense","l":1,"t":"Action: until the end of your next turn, sense celestials, fiends and undead within 60 ft, plus consecrated or desecrated places. Uses: 1 + CHA mod per long rest."},
{"n":"Lay on Hands","l":1,"t":"Healing pool of paladin level x 5 per long rest. Action: touch a creature to restore HP from the pool, or spend 5 points to cure a disease or poison."},
{"n":"Fighting Style","l":2,"t":"Choose one fighting style. You can't take the same style twice."},
{"n":"Spellcasting","l":2,"t":"Cast paladin spells using Charisma. Prepare CHA mod + half paladin level (min 1) spells, changeable on a long rest. A holy symbol is your focus."},
{"n":"Divine Smite","l":2,"t":"On a melee weapon hit, expend a spell slot for 2d8 extra radiant damage, +1d8 per slot level above 1st (max 5d8), +1d8 against undead or fiends."},
{"n":"Divine Health","l":3,"t":"You are immune to disease."},
{"n":"Harness Divine Power (Optional)","l":3,"t":"Bonus action: expend a Channel Divinity use to regain one spell slot of a level up to half your proficiency bonus (rounded up). Once per long rest (twice at 7th, three times at 15th)."},
{"n":"Martial Versatility (Optional)","l":4,"t":"When you gain an Ability Score Improvement, you may swap one fighting style for another."},
{"n":"Extra Attack","l":5,"t":"Attack twice when you take the Attack action on your turn."},
{"n":"Aura of Protection","l":6,"t":"While conscious, you and friendly creatures within 10 ft add your CHA modifier (min +1) to saving throws. 30 ft at 18th level."},
{"n":"Aura of Courage","l":10,"t":"While conscious, you and friendly creatures within 10 ft can't be frightened. 30 ft at 18th level."},
{"n":"Improved Divine Smite","l":11,"t":"All your melee weapon hits deal an extra 1d8 radiant damage."},
{"n":"Cleansing Touch","l":14,"t":"Action: end one spell on yourself or a willing creature you touch. Uses equal CHA mod (min 1) per long rest."}]},

{"id":"ranger","name":"Ranger","tag":"official","hitDie":10,"armor":["Light armor","Medium armor","Shields"],"weapons":["Simple weapons","Martial weapons"],"tools":[],"saves":["STR","DEX"],"skillChoose":3,"skillList":["Animal Handling","Athletics","Insight","Investigation","Nature","Perception","Stealth","Survival"],"equipment":["(a) scale mail or (b) leather armor","(a) two shortswords or (b) two simple melee weapons","(a) a dungeoneer's pack or (b) an explorer's pack","A longbow and a quiver of 20 arrows"],"multiclass":"Dexterity 13 and Wisdom 13","casting":{"ability":"WIS","kind":"half","prepared":false,"cantrips":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"known":[0,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11]},"subclassLevel":3,"subclassTerm":"Ranger Conclave","asiLevels":[4,8,12,16,19],"fightingStyleLevel":2,"fightingStyles":["Archery","Blind Fighting","Defense","Druidic Warrior","Dueling","Thrown Weapon Fighting","Two-Weapon Fighting","Close Quarters Shooter (UA)","Interception","Mariner (UA)","Tunnel Fighter (UA)","Unarmed Fighting"],"columns":{},"features":[
{"n":"Favored Enemy","l":1,"t":"Choose a favored enemy type (or two humanoid races): advantage on Survival checks to track them and Intelligence checks to recall information about them, and learn one of their languages. Choose another at 6th and 14th level."},
{"n":"Natural Explorer","l":1,"t":"Choose a favored terrain: double proficiency on related Intelligence and Wisdom checks, and travel benefits there (no slowing from difficult terrain, can't get lost, stay alert, stealthy solo travel, double foraging, detailed tracking). Another terrain at 6th and 10th level."},
{"n":"Deft Explorer (Optional)","l":1,"t":"Replaces Natural Explorer. Canny: expertise in one proficient skill and two extra languages. Roving at 6th: +5 ft speed, climbing and swimming speeds. Tireless at 10th: action for 1d8 + WIS mod temp HP, proficiency bonus times per long rest; a short rest reduces exhaustion by 1."},
{"n":"Favored Foe (Optional)","l":1,"t":"Replaces Favored Enemy. When you hit a creature, mark it for 1 minute (concentration). Once per turn deal +1d4 damage to it (1d6 at 6th, 1d8 at 14th). Uses equal proficiency bonus per long rest."},
{"n":"Fighting Style","l":2,"t":"Choose one fighting style. You can't take the same style twice."},
{"n":"Spellcasting","l":2,"t":"Know ranger spells per the Spells Known column, cast with Wisdom. Swap one known spell on level up."},
{"n":"Spellcasting Focus (Optional)","l":2,"t":"You can use a druidic focus as a spellcasting focus for ranger spells."},
{"n":"Primeval Awareness","l":3,"t":"Action: expend a spell slot to sense aberrations, celestials, dragons, elementals, fey, fiends and undead within 1 mile (6 in favored terrain) for 1 minute per slot level."},
{"n":"Primal Awareness (Optional)","l":3,"t":"Replaces Primeval Awareness. Learn Speak with Animals (3rd), Beast Sense (5th), Speak with Plants (9th), Locate Creature (13th) and Commune with Nature (17th); cast each once per long rest without a slot."},
{"n":"Martial Versatility (Optional)","l":4,"t":"When you gain an Ability Score Improvement, you may swap one fighting style for another."},
{"n":"Extra Attack","l":5,"t":"Attack twice when you take the Attack action on your turn."},
{"n":"Land's Stride","l":8,"t":"Nonmagical difficult terrain costs no extra movement, nonmagical plants don't slow or harm you, and you have advantage on saves against magical plants that impede movement."},
{"n":"Hide in Plain Sight","l":10,"t":"Spend 1 minute camouflaging yourself: +10 to Stealth checks while you stay still against a solid surface."},
{"n":"Nature's Veil (Optional)","l":10,"t":"Replaces Hide in Plain Sight. Bonus action: become invisible until the start of your next turn. Uses equal proficiency bonus per long rest."},
{"n":"Vanish","l":14,"t":"Hide as a bonus action. You can't be tracked by nonmagical means unless you choose to leave a trail."},
{"n":"Feral Senses","l":18,"t":"No disadvantage on attacks against creatures you can't see, and you are aware of invisible creatures within 30 ft that aren't hidden."},
{"n":"Foe Slayer","l":20,"t":"Once per turn, add your Wisdom modifier to an attack or damage roll against a favored enemy."}]},

{"id":"rogue","name":"Rogue","tag":"official","hitDie":8,"armor":["Light armor"],"weapons":["Simple weapons","Hand crossbows","Longswords","Rapiers","Shortswords"],"tools":["Thieves' tools"],"saves":["DEX","INT"],"skillChoose":4,"skillList":["Acrobatics","Athletics","Deception","Insight","Intimidation","Investigation","Perception","Performance","Persuasion","Sleight of Hand","Stealth"],"equipment":["(a) a rapier or (b) a shortsword","(a) a shortbow and quiver of 20 arrows or (b) a shortsword","(a) a burglar's pack, (b) a dungeoneer's pack, or (c) an explorer's pack","Leather armor, two daggers, and thieves' tools"],"multiclass":"Dexterity 13","casting":null,"subclassLevel":3,"subclassTerm":"Roguish Archetype","asiLevels":[4,8,10,12,16,19],"languages":["Thieves' Cant"],"columns":{"Sneak Attack":["1d6","1d6","2d6","2d6","3d6","3d6","4d6","4d6","5d6","5d6","6d6","6d6","7d6","7d6","8d6","8d6","9d6","9d6","10d6","10d6"]},"features":[
{"n":"Expertise","l":1,"t":"Choose two skill proficiencies (or one skill and thieves' tools); your proficiency bonus is doubled for them. Choose two more at 6th level."},
{"n":"Sneak Attack","l":1,"t":"Once per turn, deal extra damage (per the Sneak Attack column) to a creature you hit with a finesse or ranged weapon if you have advantage, or if an enemy of the target is within 5 ft of it and you don't have disadvantage."},
{"n":"Thieves' Cant","l":1,"t":"You know thieves' cant, a secret mix of dialect, jargon and code, plus a set of secret signs and symbols."},
{"n":"Cunning Action","l":2,"t":"Bonus action on each turn in combat to Dash, Disengage or Hide."},
{"n":"Steady Aim (Optional)","l":3,"t":"Bonus action: gain advantage on your next attack roll this turn if you haven't moved; your speed is 0 until the end of the turn."},
{"n":"Uncanny Dodge","l":5,"t":"Reaction when an attacker you can see hits you: halve the attack's damage."},
{"n":"Evasion","l":7,"t":"On a Dexterity save for half damage, take none on a success and half on a failure."},
{"n":"Reliable Talent","l":11,"t":"On an ability check that adds your proficiency bonus, treat a d20 roll of 9 or lower as a 10."},
{"n":"Blindsense","l":14,"t":"If you can hear, you know the location of any hidden or invisible creature within 10 ft."},
{"n":"Slippery Mind","l":15,"t":"Gain proficiency in Wisdom saving throws.","grants":{"saves":["WIS"]}},
{"n":"Elusive","l":18,"t":"No attack roll has advantage against you while you aren't incapacitated."},
{"n":"Stroke of Luck","l":20,"t":"Turn a missed attack into a hit, or treat a failed ability check's d20 as a 20. Once per short or long rest."}]},

{"id":"sorcerer","name":"Sorcerer","tag":"official","hitDie":6,"armor":[],"weapons":["Daggers","Darts","Slings","Quarterstaffs","Light crossbows"],"tools":[],"saves":["CON","CHA"],"skillChoose":2,"skillList":["Arcana","Deception","Insight","Intimidation","Persuasion","Religion"],"equipment":["(a) a light crossbow and 20 bolts or (b) any simple weapon","(a) a component pouch or (b) an arcane focus","(a) a dungeoneer's pack or (b) an explorer's pack","Two daggers"],"multiclass":"Charisma 13","casting":{"ability":"CHA","kind":"full","prepared":false,"cantrips":[4,4,4,5,5,5,5,5,5,6,6,6,6,6,6,6,6,6,6,6],"known":[2,3,4,5,6,7,8,9,10,11,12,12,13,13,14,14,15,15,15,15]},"subclassLevel":1,"subclassTerm":"Sorcerous Origin","asiLevels":[4,8,12,16,19],"columns":{"Sorcery Points":["-",2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20]},"features":[
{"n":"Spellcasting","l":1,"t":"Know sorcerer cantrips and spells per the table, cast with Charisma. Save DC 8 + proficiency + CHA mod; attack bonus proficiency + CHA mod. An arcane focus is your focus. Swap one known spell on level up."},
{"n":"Font of Magic","l":2,"t":"Sorcery points per the table, regained on a long rest. Bonus action: spend points to create a spell slot (2/3/5/6/7 points for 1st to 5th level) or expend a slot to gain points equal to its level."},
{"n":"Metamagic","l":3,"t":"Choose two Metamagic options; one more at 10th and 17th level. Only one option per spell unless stated otherwise."},
{"n":"Sorcerous Versatility (Optional)","l":4,"t":"When you gain an Ability Score Improvement, replace one Metamagic option or one sorcerer cantrip with another."},
{"n":"Magical Guidance (Optional)","l":5,"t":"When you fail an ability check, spend 1 sorcery point to reroll the d20 and use the new roll."},
{"n":"Sorcerous Restoration","l":20,"t":"Regain 4 sorcery points when you finish a short rest."}]},

{"id":"warlock","name":"Warlock","tag":"official","hitDie":8,"armor":["Light armor"],"weapons":["Simple weapons"],"tools":[],"saves":["WIS","CHA"],"skillChoose":2,"skillList":["Arcana","Deception","History","Intimidation","Investigation","Nature","Religion"],"equipment":["(a) a light crossbow and 20 bolts or (b) any simple weapon","(a) a component pouch or (b) an arcane focus","(a) a scholar's pack or (b) a dungeoneer's pack","Leather armor, any simple weapon, and two daggers"],"multiclass":"Charisma 13","casting":{"ability":"CHA","kind":"pact","prepared":false,"cantrips":[2,2,2,3,3,3,3,3,3,4,4,4,4,4,4,4,4,4,4,4],"known":[2,3,4,5,6,7,8,9,10,10,11,11,12,12,13,13,14,14,15,15],"pactSlots":[1,2,2,2,2,2,2,2,2,2,3,3,3,3,3,3,4,4,4,4],"pactLevel":[1,1,2,2,3,3,4,4,5,5,5,5,5,5,5,5,5,5,5,5]},"subclassLevel":1,"subclassTerm":"Otherworldly Patron","asiLevels":[4,8,12,16,19],"columns":{"Invocations Known":["-",2,2,2,3,3,3,4,4,5,5,6,6,6,7,7,7,8,8,8]},"features":[
{"n":"Pact Magic","l":1,"t":"Know warlock cantrips and spells per the table, cast with Charisma. All your slots are the same level (up to 5th) and return on a short or long rest. Save DC 8 + proficiency + CHA mod; attack bonus proficiency + CHA mod. Swap one known spell on level up."},
{"n":"Eldritch Invocations","l":2,"t":"Know invocations per the Invocations Known column. You may replace one on each warlock level."},
{"n":"Pact Boon","l":3,"t":"Choose Pact of the Blade, Chain, Tome or Talisman."},
{"n":"Eldritch Versatility (Optional)","l":4,"t":"When you gain an Ability Score Improvement, you may replace one warlock cantrip, change your Pact Boon, or (12th level and up) replace one Mystic Arcanum spell."},
{"n":"Mystic Arcanum","l":11,"t":"Choose one 6th-level warlock spell to cast once per long rest without a slot. Gain a 7th-level arcanum at 13th, 8th-level at 15th and 9th-level at 17th."},
{"n":"Eldritch Master","l":20,"t":"Spend 1 minute entreating your patron to regain all Pact Magic slots. Once per long rest."}]},

{"id":"wizard","name":"Wizard","tag":"official","hitDie":6,"armor":[],"weapons":["Daggers","Darts","Slings","Quarterstaffs","Light crossbows"],"tools":[],"saves":["INT","WIS"],"skillChoose":2,"skillList":["Arcana","History","Insight","Investigation","Medicine","Religion"],"equipment":["(a) a quarterstaff or (b) a dagger","(a) a component pouch or (b) an arcane focus","(a) a scholar's pack or (b) an explorer's pack","A spellbook"],"multiclass":"Intelligence 13","casting":{"ability":"INT","kind":"full","prepared":true,"spellbook":true,"cantrips":[3,3,3,4,4,4,4,4,4,5,5,5,5,5,5,5,5,5,5,5],"known":null},"subclassLevel":2,"subclassTerm":"Arcane Tradition","asiLevels":[4,8,12,16,19],"columns":{},"features":[
{"n":"Spellcasting","l":1,"t":"Cast wizard spells using Intelligence. Your spellbook starts with six 1st-level spells and gains two per wizard level. Prepare INT mod + wizard level spells (min 1) on a long rest. Ritual spells can be cast from the spellbook unprepared. Save DC 8 + proficiency + INT mod."},
{"n":"Arcane Recovery","l":1,"t":"Once per day on a short rest, recover spell slots with a combined level up to half your wizard level (rounded up), none 6th level or higher."},
{"n":"Cantrip Formulas (Optional)","l":3,"t":"After a long rest, you can replace one wizard cantrip with another from the wizard list."},
{"n":"Spell Mastery","l":18,"t":"Choose one 1st-level and one 2nd-level spell in your spellbook; cast each at its lowest level at will while prepared."},
{"n":"Signature Spells","l":20,"t":"Choose two 3rd-level spells in your spellbook: always prepared, and each castable once at 3rd level without a slot per short or long rest."}]}
];

DND.fightingStyles = {
"Archery":"+2 bonus to attack rolls with ranged weapons.",
"Blessed Warrior":"Learn two cleric cantrips; they count as paladin spells and use Charisma.",
"Blind Fighting":"Blindsight 10 ft: you see anything in range not behind total cover, including invisible creatures that aren't hidden.",
"Defense":"+1 bonus to AC while wearing armor.",
"Druidic Warrior":"Learn two druid cantrips; they count as ranger spells and use Wisdom.",
"Dueling":"+2 damage with a melee weapon held in one hand and no other weapons.",
"Great Weapon Fighting":"Reroll 1s and 2s on damage dice with two-handed or versatile melee weapons held in two hands.",
"Interception":"Reaction when a creature hits a target within 5 ft of you: reduce the damage by 1d10 + proficiency bonus. Requires a shield or weapon.",
"Protection":"Reaction when a creature attacks a target within 5 ft of you: impose disadvantage. Requires a shield.",
"Superior Technique":"Learn one Battle Master maneuver and gain one d6 superiority die per short or long rest.",
"Thrown Weapon Fighting":"Draw a thrown weapon as part of the attack; +2 damage on ranged hits with thrown weapons.",
"Two-Weapon Fighting":"Add your ability modifier to the damage of your off-hand attack.",
"Unarmed Fighting":"Unarmed strikes deal 1d6 + STR mod bludgeoning (1d8 with both hands free). Deal 1d4 bludgeoning each turn to a creature you grapple.",
"Close Quarters Shooter (UA)":"No disadvantage on ranged attacks within 5 ft of a hostile creature, ignore half and three-quarters cover within 30 ft, and +1 to ranged attack rolls.",
"Mariner (UA)":"Without heavy armor or a shield: swimming and climbing speeds equal to your walking speed, and +1 AC.",
"Tunnel Fighter (UA)":"Bonus action: defensive stance until your next turn. Make opportunity attacks without using your reaction, and reaction attacks against creatures moving more than 5 ft within reach."
};

DND.metamagic = {
"Careful Spell":"1 point. Up to CHA mod creatures automatically succeed on their saves against the spell.",
"Distant Spell":"1 point. Double the spell's range, or make a touch spell 30 ft.",
"Empowered Spell":"1 point. Reroll up to CHA mod damage dice. Can combine with another option.",
"Extended Spell":"1 point. Double the duration (max 24 hours) of a spell lasting 1 minute or more.",
"Heightened Spell":"3 points. One target has disadvantage on its first save against the spell.",
"Quickened Spell":"2 points. Cast a 1-action spell as a bonus action.",
"Seeking Spell":"2 points. Reroll a missed spell attack. Can combine with another option.",
"Subtle Spell":"1 point. Cast without verbal or somatic components.",
"Transmuted Spell":"1 point. Change acid, cold, fire, lightning, poison or thunder damage to another of those types.",
"Twinned Spell":"Points equal to spell level (1 for a cantrip). Target a second creature with a single-target spell."
};

DND.pactBoons = {
"Pact of the Blade":"Action: create a magical pact weapon in your hand in any melee form; you are proficient with it. You can bond a magic weapon with a 1-hour ritual.",
"Pact of the Chain":"Learn Find Familiar as a ritual, with imp, pseudodragon, quasit or sprite as extra forms. You can forgo one attack to let the familiar attack with its reaction.",
"Pact of the Tome":"A Book of Shadows holding three cantrips from any class lists, castable at will as warlock spells.",
"Pact of the Talisman":"An amulet whose wearer can add a d4 to a failed ability check, proficiency bonus times per long rest."
};
