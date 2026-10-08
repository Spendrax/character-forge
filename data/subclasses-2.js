// Cleric and Druid subclasses, summarised from https://dnd5e.wikidot.com (CC BY-SA 3.0).
window.DND = window.DND || {};
DND.subclasses = DND.subclasses || [];
(function(){
var PS={"n":"Potent Spellcasting","l":8,"t":"Add your Wisdom modifier to the damage of any cleric cantrip."};
function DS(type){return {"n":"Divine Strike","l":8,"t":"Once per turn on a weapon hit, deal an extra 1d8 "+type+" damage (2d8 at 14th level)."};}
DND.subclasses.push(
{"c":"cleric","id":"cleric:arcana","name":"Arcana Domain","source":"Sword Coast Adventurer's Guide","tag":"official","spells":{"1":["Detect Magic","Magic Missile"],"3":["Magic Weapon","Nystul's Magic Aura"],"5":["Dispel Magic","Magic Circle"],"7":["Arcane Eye","Leomund's Secret Chest"],"9":["Planar Binding","Teleportation Circle"]},"grants":{"skills":["Arcana"]},"features":[
{"n":"Arcane Initiate","l":1,"t":"Proficiency in Arcana and two wizard cantrips, which count as cleric cantrips."},
{"n":"Channel Divinity: Arcane Abjuration","l":2,"t":"Action: one celestial, elemental, fey or fiend within 30 ft makes a Wisdom save or is turned for 1 minute."},
{"n":"Arcane Banishment","l":5,"t":"A creature that fails against Arcane Abjuration is banished for 1 minute if its CR is 1/2 or lower (rising to CR 4 at 17th)."},
{"n":"Spell Breaker","l":6,"t":"When you heal an ally with a spell, end one spell on it of a level up to the slot used."},PS,
{"n":"Arcane Mastery","l":17,"t":"Add one wizard spell each of 6th, 7th, 8th and 9th level to your domain spells."}]},
{"c":"cleric","id":"cleric:death","name":"Death Domain","source":"Dungeon Master's Guide","tag":"official","spells":{"1":["False Life","Ray of Sickness"],"3":["Blindness/Deafness","Ray of Enfeeblement"],"5":["Animate Dead","Vampiric Touch"],"7":["Blight","Death Ward"],"9":["Antilife Shell","Cloudkill"]},"grants":{"weapons":["Martial weapons"]},"features":[
{"n":"Bonus Proficiency","l":1,"t":"Proficiency with martial weapons."},
{"n":"Reaper","l":1,"t":"Learn one necromancy cantrip from any list. Single-target necromancy cantrips can target two creatures within 5 ft of each other."},
{"n":"Channel Divinity: Touch of Death","l":2,"t":"On a melee hit, deal extra necrotic damage equal to 5 + twice your cleric level."},
{"n":"Inescapable Destruction","l":6,"t":"Your necrotic damage from cleric spells and Channel Divinity ignores resistance."},DS("necrotic"),
{"n":"Improved Reaper","l":17,"t":"Single-target necromancy spells of 1st to 5th level can target two creatures within 5 ft of each other."}]},
{"c":"cleric","id":"cleric:forge","name":"Forge Domain","source":"Xanathar's Guide to Everything","tag":"official","spells":{"1":["Identify","Searing Smite"],"3":["Heat Metal","Magic Weapon"],"5":["Elemental Weapon","Protection from Energy"],"7":["Fabricate","Wall of Fire"],"9":["Animate Objects","Creation"]},"grants":{"armor":["Heavy armor"],"tools":["Smith's tools"]},"features":[
{"n":"Bonus Proficiencies","l":1,"t":"Proficiency with heavy armor and smith's tools."},
{"n":"Blessing of the Forge","l":1,"t":"After a long rest, make one nonmagical armor or weapon a +1 item until your next long rest."},
{"n":"Channel Divinity: Artisan's Blessing","l":2,"t":"1-hour ritual: create a nonmagical metal item worth up to 100 gp from metal of equal value."},
{"n":"Soul of the Forge","l":6,"t":"Resistance to fire damage, and +1 AC in heavy armor."},DS("fire"),
{"n":"Saint of Forge and Fire","l":17,"t":"Immunity to fire. In heavy armor, resistance to nonmagical bludgeoning, piercing and slashing damage."}]},
{"c":"cleric","id":"cleric:grave","name":"Grave Domain","source":"Xanathar's Guide to Everything","tag":"official","spells":{"1":["Bane","False Life"],"3":["Gentle Repose","Ray of Enfeeblement"],"5":["Revivify","Vampiric Touch"],"7":["Blight","Death Ward"],"9":["Antilife Shell","Raise Dead"]},"features":[
{"n":"Circle of Mortality","l":1,"t":"Healing spells on a creature at 0 HP use maximum dice. Learn Spare the Dying with 30 ft range as a bonus action."},
{"n":"Eyes of the Grave","l":1,"t":"Action: detect undead within 60 ft. WIS mod uses per long rest."},
{"n":"Channel Divinity: Path to the Grave","l":2,"t":"Action: curse a creature within 30 ft; the next hit on it from you or an ally deals double damage (vulnerability)."},
{"n":"Sentinel at Death's Door","l":6,"t":"Reaction: turn a critical hit on you or an ally within 30 ft into a normal hit. WIS mod uses per long rest."},PS,
{"n":"Keeper of Souls","l":17,"t":"When an enemy dies within 30 ft, you or an ally regain HP equal to its Hit Dice. Once per round."}]},
{"c":"cleric","id":"cleric:knowledge","name":"Knowledge Domain","source":"Player's Handbook","tag":"official","spells":{"1":["Command","Identify"],"3":["Augury","Suggestion"],"5":["Nondetection","Speak with Dead"],"7":["Arcane Eye","Confusion"],"9":["Legend Lore","Scrying"]},"choices":[{"l":1,"type":"skill","count":2,"from":["Arcana","History","Nature","Religion"],"expertise":true},{"l":1,"type":"language","count":2}],"features":[
{"n":"Blessings of Knowledge","l":1,"t":"Learn two languages and gain proficiency with doubled proficiency bonus in two of Arcana, History, Nature, Religion."},
{"n":"Channel Divinity: Knowledge of the Ages","l":2,"t":"Action: gain proficiency with one skill or tool for 10 minutes."},
{"n":"Channel Divinity: Read Thoughts","l":6,"t":"Action: a creature within 60 ft makes a Wisdom save or you read its surface thoughts for 1 minute; you can end it to cast Suggestion on it with no save."},PS,
{"n":"Visions of the Past","l":17,"t":"Meditate to see the recent history of an object or area. Once per short or long rest."}]},
{"c":"cleric","id":"cleric:life","name":"Life Domain","source":"Player's Handbook","tag":"official","spells":{"1":["Bless","Cure Wounds"],"3":["Lesser Restoration","Spiritual Weapon"],"5":["Beacon of Hope","Revivify"],"7":["Death Ward","Guardian of Faith"],"9":["Mass Cure Wounds","Raise Dead"]},"grants":{"armor":["Heavy armor"]},"features":[
{"n":"Bonus Proficiency","l":1,"t":"Proficiency with heavy armor."},
{"n":"Disciple of Life","l":1,"t":"Healing spells of 1st level or higher restore an extra 2 + spell level HP."},
{"n":"Channel Divinity: Preserve Life","l":2,"t":"Action: restore 5 x cleric level HP, divided among creatures within 30 ft, up to half their maximum."},
{"n":"Blessed Healer","l":6,"t":"When you heal another creature with a spell, you regain 2 + spell level HP."},DS("radiant"),
{"n":"Supreme Healing","l":17,"t":"Healing spell dice are maximised instead of rolled."}]},
{"c":"cleric","id":"cleric:light","name":"Light Domain","source":"Player's Handbook","tag":"official","spells":{"1":["Burning Hands","Faerie Fire"],"3":["Flaming Sphere","Scorching Ray"],"5":["Daylight","Fireball"],"7":["Guardian of Faith","Wall of Fire"],"9":["Flame Strike","Scrying"]},"features":[
{"n":"Bonus Cantrip","l":1,"t":"Learn the Light cantrip; it doesn't count against cantrips known."},
{"n":"Warding Flare","l":1,"t":"Reaction: impose disadvantage on an attack against you from a creature within 30 ft. WIS mod uses per long rest."},
{"n":"Channel Divinity: Radiance of the Dawn","l":2,"t":"Action: dispel magical darkness within 30 ft; hostile creatures there take 2d10 + cleric level radiant (Constitution save for half)."},
{"n":"Improved Flare","l":6,"t":"Use Warding Flare to protect another creature within 30 ft."},PS,
{"n":"Corona of Light","l":17,"t":"Action: 60-ft bright aura for 1 minute; enemies in it have disadvantage on saves against fire and radiant spells."}]},
{"c":"cleric","id":"cleric:nature","name":"Nature Domain","source":"Player's Handbook","tag":"official","spells":{"1":["Animal Friendship","Speak with Animals"],"3":["Barkskin","Spike Growth"],"5":["Plant Growth","Wind Wall"],"7":["Dominate Beast","Grasping Vine"],"9":["Insect Plague","Tree Stride"]},"grants":{"armor":["Heavy armor"]},"choices":[{"l":1,"type":"skill","count":1,"from":["Animal Handling","Nature","Survival"]}],"features":[
{"n":"Acolyte of Nature","l":1,"t":"Learn one druid cantrip and gain proficiency in Animal Handling, Nature or Survival."},
{"n":"Bonus Proficiency","l":1,"t":"Proficiency with heavy armor."},
{"n":"Channel Divinity: Charm Animals and Plants","l":2,"t":"Action: beasts and plants within 30 ft make a Wisdom save or are charmed for 1 minute."},
{"n":"Dampen Elements","l":6,"t":"Reaction: give a creature within 30 ft resistance to an instance of acid, cold, fire, lightning or thunder damage."},DS("cold, fire or lightning"),
{"n":"Master of Nature","l":17,"t":"Bonus action: command creatures charmed by your Channel Divinity."}]},
{"c":"cleric","id":"cleric:order","name":"Order Domain","source":"Tasha's Cauldron of Everything","tag":"official","spells":{"1":["Command","Heroism"],"3":["Hold Person","Zone of Truth"],"5":["Mass Healing Word","Slow"],"7":["Compulsion","Locate Creature"],"9":["Commune","Dominate Person"]},"grants":{"armor":["Heavy armor"]},"choices":[{"l":1,"type":"skill","count":1,"from":["Intimidation","Persuasion"]}],"features":[
{"n":"Bonus Proficiencies","l":1,"t":"Proficiency with heavy armor and in Intimidation or Persuasion."},
{"n":"Voice of Authority","l":1,"t":"When you cast a levelled spell on an ally, it can use its reaction to make one weapon attack."},
{"n":"Channel Divinity: Order's Demand","l":2,"t":"Action: chosen creatures within 30 ft make a Wisdom save or are charmed until the end of your next turn and can be made to drop what they hold."},
{"n":"Embodiment of the Law","l":6,"t":"Cast a 1-action enchantment spell as a bonus action. WIS mod uses per long rest."},DS("psychic"),
{"n":"Order's Wrath","l":17,"t":"Divine Strike curses the target: the next ally to hit it deals +2d8 psychic."}]},
{"c":"cleric","id":"cleric:peace","name":"Peace Domain","source":"Tasha's Cauldron of Everything","tag":"official","spells":{"1":["Heroism","Sanctuary"],"3":["Aid","Warding Bond"],"5":["Beacon of Hope","Sending"],"7":["Aura of Purity","Otiluke's Resilient Sphere"],"9":["Greater Restoration","Rary's Telepathic Bond"]},"choices":[{"l":1,"type":"skill","count":1,"from":["Insight","Performance","Persuasion"]}],"features":[
{"n":"Implement of Peace","l":1,"t":"Proficiency in Insight, Performance or Persuasion."},
{"n":"Emboldening Bond","l":1,"t":"Action: bond up to proficiency bonus creatures for 10 minutes; while within 30 ft of each other each adds d4 to one attack, check or save per turn. Proficiency bonus uses per long rest."},
{"n":"Channel Divinity: Balm of Peace","l":2,"t":"Action: move your speed without provoking; each creature you pass within 5 ft regains 2d6 + WIS mod HP."},
{"n":"Protective Bond","l":6,"t":"A bonded creature can use its reaction to teleport to another bonded creature within 30 ft and take its damage."},PS,
{"n":"Expansive Bond","l":17,"t":"Bond range becomes 60 ft, and damage taken through Protective Bond is resisted."}]},
{"c":"cleric","id":"cleric:tempest","name":"Tempest Domain","source":"Player's Handbook","tag":"official","spells":{"1":["Fog Cloud","Thunderwave"],"3":["Gust of Wind","Shatter"],"5":["Call Lightning","Sleet Storm"],"7":["Control Water","Ice Storm"],"9":["Destructive Wave","Insect Plague"]},"grants":{"armor":["Heavy armor"],"weapons":["Martial weapons"]},"features":[
{"n":"Bonus Proficiencies","l":1,"t":"Proficiency with martial weapons and heavy armor."},
{"n":"Wrath of the Storm","l":1,"t":"Reaction when a creature within 5 ft hits you: it takes 2d8 lightning or thunder (Dexterity save for half). WIS mod uses per long rest."},
{"n":"Channel Divinity: Destructive Wrath","l":2,"t":"Deal maximum lightning or thunder damage instead of rolling."},
{"n":"Thunderous Strike","l":6,"t":"When you deal lightning damage to a Large or smaller creature, push it up to 10 ft."},DS("thunder"),
{"n":"Stormborn","l":17,"t":"Flying speed equal to your walking speed when outdoors and above ground."}]},
{"c":"cleric","id":"cleric:trickery","name":"Trickery Domain","source":"Player's Handbook","tag":"official","spells":{"1":["Charm Person","Disguise Self"],"3":["Mirror Image","Pass without Trace"],"5":["Blink","Dispel Magic"],"7":["Dimension Door","Polymorph"],"9":["Dominate Person","Modify Memory"]},"features":[
{"n":"Blessing of the Trickster","l":1,"t":"Action: give another willing creature advantage on Stealth checks for 1 hour."},
{"n":"Channel Divinity: Invoke Duplicity","l":2,"t":"Action: create an illusory double within 30 ft for 1 minute (concentration). Cast spells from its space, and gain advantage on attacks against creatures within 5 ft of both of you."},
{"n":"Channel Divinity: Cloak of Shadows","l":6,"t":"Action: become invisible until the end of your next turn or until you attack or cast a spell."},DS("poison"),
{"n":"Improved Duplicity","l":17,"t":"Invoke Duplicity creates up to four duplicates."}]},
{"c":"cleric","id":"cleric:twilight","name":"Twilight Domain","source":"Tasha's Cauldron of Everything","tag":"official","spells":{"1":["Faerie Fire","Sleep"],"3":["Moonbeam","See Invisibility"],"5":["Aura of Vitality","Leomund's Tiny Hut"],"7":["Aura of Life","Greater Invisibility"],"9":["Circle of Power","Mislead"]},"grants":{"armor":["Heavy armor"],"weapons":["Martial weapons"],"darkvision":300},"features":[
{"n":"Bonus Proficiencies","l":1,"t":"Proficiency with martial weapons and heavy armor."},
{"n":"Eyes of Night","l":1,"t":"Darkvision 300 ft. Action: share it with up to WIS mod creatures within 10 ft for 1 hour. Once per long rest or a spell slot."},
{"n":"Vigilant Blessing","l":1,"t":"Action: give one creature advantage on its next initiative roll."},
{"n":"Channel Divinity: Twilight Sanctuary","l":2,"t":"Action: 30-ft sphere of dim light for 1 minute. Creatures ending their turn in it gain 1d6 + cleric level temp HP or end a charm or fear effect."},
{"n":"Steps of Night","l":6,"t":"Bonus action in dim light or darkness: flying speed equal to walking speed for 1 minute. Proficiency bonus uses per long rest."},DS("radiant"),
{"n":"Twilight Shroud","l":17,"t":"You and allies have half cover inside Twilight Sanctuary."}]},
{"c":"cleric","id":"cleric:war","name":"War Domain","source":"Player's Handbook","tag":"official","spells":{"1":["Divine Favor","Shield of Faith"],"3":["Magic Weapon","Spiritual Weapon"],"5":["Crusader's Mantle","Spirit Guardians"],"7":["Freedom of Movement","Stoneskin"],"9":["Flame Strike","Hold Monster"]},"grants":{"armor":["Heavy armor"],"weapons":["Martial weapons"]},"features":[
{"n":"Bonus Proficiencies","l":1,"t":"Proficiency with martial weapons and heavy armor."},
{"n":"War Priest","l":1,"t":"When you take the Attack action, make one weapon attack as a bonus action. WIS mod uses per long rest."},
{"n":"Channel Divinity: Guided Strike","l":2,"t":"+10 to an attack roll, decided after seeing the roll."},
{"n":"Channel Divinity: War God's Blessing","l":6,"t":"Reaction: give a creature within 30 ft +10 to an attack roll."},DS("weapon-type"),
{"n":"Avatar of Battle","l":17,"t":"Resistance to nonmagical bludgeoning, piercing and slashing damage."}]},
{"c":"cleric","id":"cleric:ambition","name":"Ambition Domain","source":"Plane Shift: Amonkhet","tag":"setting","spells":{"1":["Bane","Disguise Self"],"3":["Mirror Image","Ray of Enfeeblement"],"5":["Bestow Curse","Vampiric Touch"],"7":["Death Ward","Dimension Door"],"9":["Dominate Person","Modify Memory"]},"features":[
{"n":"Warding Flare","l":1,"t":"Reaction: impose disadvantage on an attack against you from a creature within 30 ft. WIS mod uses per long rest."},
{"n":"Channel Divinity: Invoke Duplicity","l":2,"t":"Action: create an illusory double within 30 ft for 1 minute (concentration); cast spells from its space and gain advantage against creatures within 5 ft of both of you."},
{"n":"Channel Divinity: Cloak of Shadows","l":6,"t":"Action: become invisible until the end of your next turn or until you attack or cast a spell."},PS,
{"n":"Improved Duplicity","l":17,"t":"Invoke Duplicity creates up to four duplicates."}]},
{"c":"cleric","id":"cleric:solidarity","name":"Solidarity Domain","source":"Plane Shift: Amonkhet","tag":"setting","spells":{"1":["Bless","Guiding Bolt"],"3":["Aid","Warding Bond"],"5":["Beacon of Hope","Crusader's Mantle"],"7":["Aura of Life","Guardian of Faith"],"9":["Circle of Power","Mass Cure Wounds"]},"grants":{"armor":["Heavy armor"]},"features":[
{"n":"Bonus Proficiency","l":1,"t":"Proficiency with heavy armor."},
{"n":"Solidarity's Action","l":1,"t":"When you Help an ally's attack, make one weapon attack as a bonus action. WIS mod uses per long rest."},
{"n":"Channel Divinity: Preserve Life","l":2,"t":"Action: restore 5 x cleric level HP, divided among creatures within 30 ft, up to half their maximum."},
{"n":"Channel Divinity: Oketra's Blessing","l":6,"t":"Reaction: give a creature within 30 ft +10 to an attack roll."},DS("weapon-type"),
{"n":"Supreme Healing","l":17,"t":"Healing spell dice are maximised instead of rolled."}]},
{"c":"cleric","id":"cleric:strength","name":"Strength Domain","source":"Plane Shift: Amonkhet","tag":"setting","spells":{"1":["Divine Favor","Shield of Faith"],"3":["Enhance Ability","Protection from Poison"],"5":["Haste","Protection from Energy"],"7":["Dominate Beast","Stoneskin"],"9":["Destructive Wave","Insect Plague"]},"grants":{"armor":["Heavy armor"]},"choices":[{"l":1,"type":"skill","count":1,"from":["Animal Handling","Athletics","Nature","Survival"]}],"features":[
{"n":"Bonus Proficiency","l":1,"t":"Proficiency with heavy armor."},
{"n":"Acolyte of Strength","l":1,"t":"Learn one druid cantrip and gain proficiency in Animal Handling, Athletics, Nature or Survival."},
{"n":"Channel Divinity: Feat of Strength","l":2,"t":"+10 to a Strength attack roll, check or save, decided after seeing the roll."},
{"n":"Channel Divinity: Rhonas' Blessing","l":6,"t":"Reaction: give a creature within 30 ft +10 to a Strength attack roll, check or save."},DS("weapon-type"),
{"n":"Avatar of Battle","l":17,"t":"Resistance to nonmagical bludgeoning, piercing and slashing damage."}]},
{"c":"cleric","id":"cleric:zeal","name":"Zeal Domain","source":"Plane Shift: Amonkhet","tag":"setting","spells":{"1":["Searing Smite","Thunderous Smite"],"3":["Magic Weapon","Shatter"],"5":["Haste","Fireball"],"7":["Fire Shield","Freedom of Movement"],"9":["Destructive Wave","Flame Strike"]},"grants":{"armor":["Heavy armor"],"weapons":["Martial weapons"]},"features":[
{"n":"Priest of Zeal","l":1,"t":"When you take the Attack action, make one weapon attack as a bonus action. WIS mod uses per long rest."},
{"n":"Channel Divinity: Consuming Fervor","l":2,"t":"Deal maximum fire or thunder damage instead of rolling."},
{"n":"Resounding Strike","l":6,"t":"When you deal thunder damage to a Large or smaller creature, push it up to 10 ft."},DS("weapon-type"),
{"n":"Blaze of Glory","l":17,"t":"Reaction when reduced to 0 HP: move and make a melee attack with advantage for +5d10 fire and +5d10 weapon damage, then fall unconscious. Once per long rest."}]},
{"c":"cleric","id":"cleric:fate-ua","name":"Fate Domain (UA)","source":"Unearthed Arcana: Wonders of the Multiverse","tag":"ua","spells":{"1":["Dissonant Whispers","Heroism"],"3":["See Invisibility","Warding Bond"],"5":["Beacon of Hope","Clairvoyance"],"7":["Death Ward","Divination"],"9":["Commune","Geas"]},"features":[
{"n":"Omens and Portents","l":1,"t":"Cast Augury once per long rest without a slot or components."},
{"n":"Ties That Bind","l":1,"t":"Action: bind a creature or object for 1 hour (Wisdom save if unwilling). You sense its direction, and once per turn your slotted damage or healing spells on it add d6. Proficiency bonus uses per long rest."},
{"n":"Channel Divinity: Strands of Fate","l":2,"t":"Bonus action: for 1 minute (concentration), use your reaction to give a creature advantage or disadvantage on an attack roll or ability check."},
{"n":"Insightful Striking","l":6,"t":"Bonus action: add d6 to your next attack against a creature within 30 ft, or subtract d6 from its next save against your spell. Proficiency bonus uses per long rest."},PS,
{"n":"Visions of the Future","l":17,"t":"Cast Foresight once per long rest without a slot, lasting 1 minute."}]},

{"c":"druid","id":"druid:dreams","name":"Circle of Dreams","source":"Xanathar's Guide to Everything","tag":"official","features":[
{"n":"Balm of the Summer Court","l":2,"t":"Pool of d6s equal to your druid level per long rest. Bonus action: spend up to half your level in dice to heal a creature within 120 ft, plus 1 temp HP per die."},
{"n":"Hearth of Moonlight and Shadow","l":6,"t":"During a rest, ward a 30-ft sphere: allies inside gain +5 to Stealth and Perception and their light is hidden."},
{"n":"Hidden Paths","l":10,"t":"Bonus action: teleport 60 ft. Action: teleport a willing creature you touch 30 ft. WIS mod uses per long rest."},
{"n":"Walker in Dreams","l":14,"t":"After a short rest, cast Dream, Scrying or Teleportation Circle without a slot or components. Once per long rest."}]},
{"c":"druid","id":"druid:land","name":"Circle of the Land","source":"Player's Handbook","tag":"official","variantLabel":"Land","variants":{"Arctic":{"3":["Hold Person","Spike Growth"],"5":["Sleet Storm","Slow"],"7":["Freedom of Movement","Ice Storm"],"9":["Commune with Nature","Cone of Cold"]},"Coast":{"3":["Mirror Image","Misty Step"],"5":["Water Breathing","Water Walk"],"7":["Control Water","Freedom of Movement"],"9":["Conjure Elemental","Scrying"]},"Desert":{"3":["Blur","Silence"],"5":["Create Food and Water","Protection from Energy"],"7":["Blight","Hallucinatory Terrain"],"9":["Insect Plague","Wall of Stone"]},"Forest":{"3":["Barkskin","Spider Climb"],"5":["Call Lightning","Plant Growth"],"7":["Divination","Freedom of Movement"],"9":["Commune with Nature","Tree Stride"]},"Grassland":{"3":["Invisibility","Pass without Trace"],"5":["Daylight","Haste"],"7":["Divination","Freedom of Movement"],"9":["Dream","Insect Plague"]},"Mountain":{"3":["Spider Climb","Spike Growth"],"5":["Lightning Bolt","Meld into Stone"],"7":["Stone Shape","Stoneskin"],"9":["Passwall","Wall of Stone"]},"Swamp":{"3":["Darkness","Melf's Acid Arrow"],"5":["Water Walk","Stinking Cloud"],"7":["Freedom of Movement","Locate Creature"],"9":["Insect Plague","Scrying"]},"Underdark":{"3":["Spider Climb","Web"],"5":["Gaseous Form","Stinking Cloud"],"7":["Greater Invisibility","Stone Shape"],"9":["Cloudkill","Insect Plague"]}},"features":[
{"n":"Bonus Cantrip","l":2,"t":"Learn one additional druid cantrip."},
{"n":"Natural Recovery","l":2,"t":"Once per long rest during a short rest, recover spell slots with a combined level up to half your druid level (rounded up), none 6th or higher."},
{"n":"Circle Spells","l":3,"t":"Choose a land type; its spells are always prepared and don't count against your prepared limit."},
{"n":"Land's Stride","l":6,"t":"Nonmagical difficult terrain costs no extra movement, plants don't slow or harm you, and you have advantage on saves against magical plants."},
{"n":"Nature's Ward","l":10,"t":"You can't be charmed or frightened by elementals or fey, and are immune to poison and disease."},
{"n":"Nature's Sanctuary","l":14,"t":"Beasts and plants must pass a Wisdom save to attack you."}]},
{"c":"druid","id":"druid:moon","name":"Circle of the Moon","source":"Player's Handbook","tag":"official","features":[
{"n":"Combat Wild Shape","l":2,"t":"Wild Shape as a bonus action. In beast form, bonus action to expend a spell slot and regain 1d8 HP per slot level."},
{"n":"Circle Forms","l":2,"t":"Wild Shape into beasts up to CR 1; from 6th level, CR up to your druid level divided by 3."},
{"n":"Primal Strike","l":6,"t":"Your beast-form attacks count as magical."},
{"n":"Elemental Wild Shape","l":10,"t":"Spend two Wild Shape uses to become an air, earth, fire or water elemental."},
{"n":"Thousand Forms","l":14,"t":"Cast Alter Self at will."}]},
{"c":"druid","id":"druid:shepherd","name":"Circle of the Shepherd","source":"Xanathar's Guide to Everything","tag":"official","grants":{"languages":["Sylvan"]},"features":[
{"n":"Speech of the Woods","l":2,"t":"Learn Sylvan. Beasts understand your speech and you understand them."},
{"n":"Spirit Totem","l":2,"t":"Bonus action: summon a spirit with a 30-ft aura for 1 minute, once per short or long rest. Bear: temp HP 5 + druid level and advantage on Strength checks and saves. Hawk: reaction to grant advantage on an attack; advantage on Perception. Unicorn: advantage to detect creatures, and your healing spells also heal creatures in the aura by your druid level."},
{"n":"Mighty Summoner","l":6,"t":"Beasts and fey you summon gain +2 HP per Hit Die and their natural weapons are magical."},
{"n":"Guardian Spirit","l":10,"t":"Your summoned beasts and fey regain half your druid level in HP when they end their turn in your Spirit Totem aura."},
{"n":"Faithful Summons","l":14,"t":"When reduced to 0 HP or incapacitated, four beasts of CR 2 or lower appear for 1 hour to protect you. Once per long rest."}]},
{"c":"druid","id":"druid:spores","name":"Circle of Spores","source":"Tasha's Cauldron of Everything","tag":"official","spells":{"2":["Chill Touch"],"3":["Blindness/Deafness","Gentle Repose"],"5":["Animate Dead","Gaseous Form"],"7":["Blight","Confusion"],"9":["Cloudkill","Contagion"]},"features":[
{"n":"Halo of Spores","l":2,"t":"Reaction when a creature within 10 ft moves or starts its turn there: it takes 1d4 necrotic (Constitution save negates). 1d6 at 6th, 1d8 at 10th, 1d10 at 14th."},
{"n":"Symbiotic Entity","l":2,"t":"Action: expend a Wild Shape use for 4 temp HP per druid level for 10 minutes. While active, roll Halo of Spores damage twice and melee hits deal +1d6 necrotic."},
{"n":"Fungal Infestation","l":6,"t":"Reaction when a Small or Medium beast or humanoid dies within 10 ft: animate it as a 1 HP zombie for 1 hour. WIS mod uses per long rest."},
{"n":"Spreading Spores","l":10,"t":"Bonus action while Symbiotic Entity is active: move your spores to a 10-ft cube within 30 ft for 1 minute."},
{"n":"Fungal Body","l":14,"t":"Immune to blinded, deafened, frightened and poisoned. Critical hits against you count as normal hits."}]},
{"c":"druid","id":"druid:stars","name":"Circle of Stars","source":"Tasha's Cauldron of Everything","tag":"official","spells":{"2":["Guidance","Guiding Bolt"]},"features":[
{"n":"Star Map","l":2,"t":"A star chart focus. You know Guidance, always have Guiding Bolt prepared, and can cast Guiding Bolt without a slot proficiency bonus times per long rest."},
{"n":"Starry Form","l":2,"t":"Bonus action: expend a Wild Shape use for a 10-minute starry form. Archer: bonus-action ranged spell attack, 1d8 + WIS radiant. Chalice: your healing spells heal another 1d8 + WIS. Dragon: treat 9 or lower as 10 on INT and WIS checks and concentration saves."},
{"n":"Cosmic Omen","l":6,"t":"After a long rest roll a die: reaction to add (Weal) or subtract (Woe) d6 from an attack, check or save within 30 ft. Proficiency bonus uses per long rest."},
{"n":"Twinkling Constellations","l":10,"t":"Archer and Chalice use 2d8, Dragon grants 20 ft flying, and you can switch constellation each turn."},
{"n":"Full of Stars","l":14,"t":"Resistance to bludgeoning, piercing and slashing damage in starry form."}]},
{"c":"druid","id":"druid:wildfire","name":"Circle of Wildfire","source":"Tasha's Cauldron of Everything","tag":"official","spells":{"2":["Burning Hands","Cure Wounds"],"3":["Flaming Sphere","Scorching Ray"],"5":["Plant Growth","Revivify"],"7":["Aura of Life","Fire Shield"],"9":["Flame Strike","Mass Cure Wounds"]},"features":[
{"n":"Summon Wildfire Spirit","l":2,"t":"Action: expend a Wild Shape use to summon a wildfire spirit within 30 ft for 1 hour; creatures within 10 ft of it take 2d6 fire (Dexterity save negates)."},
{"n":"Enhanced Bond","l":6,"t":"While the spirit is summoned, add 1d8 to one fire damage or healing roll of your spells, and cast spells from the spirit's position."},
{"n":"Cauterizing Flames","l":10,"t":"When a creature dies within 30 ft of you or the spirit, a flame remains for 1 minute. Reaction: heal or burn a creature entering it for 2d10 + WIS mod. Proficiency bonus uses per long rest."},
{"n":"Blazing Revival","l":14,"t":"When you drop to 0 HP, the spirit can drop to 0 instead and you regain half your HP. Once per long rest."}]},
{"c":"druid","id":"druid:primeval-ua","name":"Circle of the Primeval (UA)","source":"Unearthed Arcana: Giant Options","tag":"ua","grants":{"skills":["History"]},"features":[
{"n":"Keeper of Old","l":2,"t":"Proficiency in History, and add d4 to History checks."},
{"n":"Primeval Companion","l":2,"t":"Action: expend a Wild Shape use to summon a primeval companion that acts after you and obeys bonus-action commands."},
{"n":"Prehistoric Conduit","l":6,"t":"Cast spells from your companion's position; it has advantage on saves against your spells."},
{"n":"Titanic Bond","l":10,"t":"The companion becomes Large with a climb or swim speed. Once per turn a creature you damage makes a Wisdom save or is frightened of you."},
{"n":"Scourge of the Ancients","l":14,"t":"Bonus action: expend a spell slot to make the companion Huge for 1 hour with bonus temp HP, damage and speed."}]}
);
})();
