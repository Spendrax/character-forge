// Homebrew and third-party subclasses listed on https://dnd5e.wikidot.com (CC BY-SA 3.0), summarised.
window.DND = window.DND || {};
DND.subclasses = DND.subclasses || [];
(function(){
var TD="Tal'Dorei Campaign Setting Reborn", EE="Exploring Eberron", LOR="Legends of Runeterra: Dark Tides of Bilgewater";
function S(o){o.tag="homebrew";DND.subclasses.push(o);}
S({"c":"artificer","id":"artificer:forge-adept","name":"Forge Adept","source":EE,"spells":{"3":["Armor of Agathys","Shield of Faith"],"5":["Spiritual Weapon","Warding Bond"],"9":["Beacon of Hope","Remove Curse"],"13":["Death Ward","Fire Shield"],"17":["Banishing Smite","Wall of Force"]},"grants":{"weapons":["Martial weapons"],"tools":["Smith's tools"]},"features":[
{"n":"Battle Ready","l":3,"t":"Proficiency with martial weapons and smith's tools. Use INT for attack and damage with magic weapons."},
{"n":"Ghaal'Shaarat","l":3,"t":"After a long rest, imbue a melee weapon as your personal weapon: +1 to attack and damage (+2 at 8th, +3 at 13th), and it returns when thrown."},
{"n":"Extra Attack","l":5,"t":"Attack twice when you take the Attack action."},
{"n":"Runes of War","l":9,"t":"Action: 30-ft aura for 1 minute (concentration); chosen creatures deal +1d4 elemental damage on weapon hits. INT mod uses per long rest."},
{"n":"Perfect Weapon","l":15,"t":"Shift your weapon's bonus to AC each turn, and choose psychic resistance with charm and fear immunity or +1d6 elemental damage."}]});
S({"c":"artificer","id":"artificer:mastermaker","name":"Mastermaker","source":"Dread Metrol","spells":{"3":["Absorb Elements","Thunderous Smite"],"5":["Enhance Ability","Lesser Restoration"],"9":["Blinding Smite","Haste"],"13":["Freedom of Movement","Stone Shape"],"17":["Banishing Smite","Greater Restoration"]},"grants":{"armor":["Heavy armor"],"tools":["Smith's tools"]},"features":[
{"n":"Tools of Integration","l":3,"t":"Proficiency with heavy armor and smith's tools."},
{"n":"Prosthesis Expertise","l":3,"t":"After a long rest, turn an object into a magical prosthetic limb."},
{"n":"Battlefist","l":3,"t":"Replace an arm with a magical weapon and focus: 1d10 bludgeoning using INT, with finesse, thrown or reach (changed on a long rest)."},
{"n":"Extra Attack","l":5,"t":"Attack twice when you take the Attack action."},
{"n":"Improved Battlefist","l":9,"t":"Battlefist deals 2d10, holds two infusions, and acts as a shield for +2 AC."},
{"n":"Construct Apotheosis","l":15,"t":"Resistance to poison and psychic, immunity to the poisoned condition, and cast Antilife Shell and Investiture of Stone once each per long rest."}]});
S({"c":"artificer","id":"artificer:maverick","name":"Maverick","source":EE,"features":[
{"n":"Arcane Breakthroughs","l":3,"t":"Choose another class's spell list (another at 5th, 9th, 13th, 17th) and prepare one extra spell per spell level from those lists, cast with Intelligence."},
{"n":"Cantrip Specialist","l":3,"t":"Know one extra cantrip, and swap an artificer cantrip on a short rest."},
{"n":"Cantrip Savant","l":5,"t":"+1 to attack rolls and save DCs of artificer cantrips (+2 at 9th, +3 at 15th)."},
{"n":"Superior Breakthroughs","l":9,"t":"Cast a Breakthrough spell as if with a slot two levels higher, INT mod times per long rest."},
{"n":"Work in Progress","l":9,"t":"Action: swap a prepared artificer spell for any other. Once per short or long rest."},
{"n":"Final Breakthrough","l":15,"t":"One extra spell slot of each level for your Breakthrough spells."}]});
S({"c":"barbarian","id":"barbarian:juggernaut","name":"Path of the Juggernaut (original)","source":"Tal'Dorei Campaign Setting","features":[
{"n":"Thunderous Blows","l":3,"t":"Once per turn while raging, push a creature you hit 5 ft (Strength save) and follow it."},
{"n":"Stance of the Mountain","l":3,"t":"While raging you can't be knocked prone."},
{"n":"Demolishing Might","l":6,"t":"Double damage to objects and structures and +1d8 against constructs."},
{"n":"Overwhelming Cleave","l":10,"t":"While raging, bonus-action attack against a second creature within 5 ft of your target."},
{"n":"Unstoppable","l":14,"t":"While raging your speed can't be reduced and you are immune to frightened, paralyzed and stunned; gain a level of exhaustion afterwards."}]});
S({"c":"barbarian","id":"barbarian:juggernaut-reborn","name":"Path of the Juggernaut","source":TD,"features":[
{"n":"Thunderous Blows","l":3,"t":"While raging, push a creature you hit in melee 5 ft (10 ft at 10th level); Huge creatures get a Strength save."},
{"n":"Spirit of the Mountain","l":3,"t":"While raging you can't be knocked prone or moved against your will."},
{"n":"Demolishing Might","l":6,"t":"+1d8 damage against constructs and double damage to objects and structures."},
{"n":"Resolute Stance","l":6,"t":"At the start of your turn, take a stance: you can't be grappled and attacks against you have disadvantage, but so do your weapon attacks."},
{"n":"Hurricane Strike","l":10,"t":"Reaction after pushing a creature: leap next to it; it makes a Strength save or falls prone, and allies near it can attack."},
{"n":"Unstoppable","l":14,"t":"While raging your speed can't be reduced and you are immune to frightened, paralyzed, prone and stunned."}]});
S({"c":"barbarian","id":"barbarian:depths","name":"Path of the Depths","source":LOR,"grants":{"swimEqualsWalk":true},"features":[
{"n":"Gift of the Drowned Ones","l":3,"t":"Swimming speed equal to your walking speed and water breathing."},
{"n":"Dredge Line","l":3,"t":"While raging, bonus action: pull a creature within 15 ft up to 10 ft toward you (Strength save)."},
{"n":"Ghostwater Dive","l":6,"t":"Action: teleport 30 ft and make one attack."},
{"n":"Manifestations of the Deep","l":10,"t":"Choose one after a long rest: true sight, a grappling Dredge Line, bonus-action temp HP, charm and fear immunity, or +1 AC."},
{"n":"Depth Charge","l":14,"t":"Ghostwater Dive deals 3d6 force and knocks prone within 10 ft of where you arrive (Strength save for half)."}]});
S({"c":"bard","id":"bard:dirge-singer","name":"College of the Dirge Singer","source":EE,"choices":[{"l":3,"type":"skill","count":1,"from":["History","Performance"]}],"features":[
{"n":"Broad Inspiration","l":3,"t":"Learn Guidance. Bonus action: one Bardic Inspiration use inspires two creatures."},
{"n":"Keeper of History","l":3,"t":"Proficiency in History or Performance, and double proficiency in one of them."},
{"n":"Commanding Voice","l":6,"t":"Reaction when an inspired creature attacks: it makes one extra weapon attack and adds the die to damage."},
{"n":"Master Commander","l":14,"t":"Countercharm as a bonus action; it grants an immediate new save and +1d4 to checks and saves."}]});
S({"c":"bard","id":"bard:maestro","name":"College of the Maestro","source":"DMs Guild","features":[
{"n":"Battle Muse","l":3,"t":"One extra Bardic Inspiration use (two at 6th, three at 14th)."},
{"n":"Symphony of Conflict","l":3,"t":"Learn two conducting techniques (more at 6th and 14th) that direct allies and enemies in battle."},
{"n":"Frenetic Crescendo","l":6,"t":"Action: spend any number of Bardic Inspiration uses to inspire that many creatures at once. Once per long rest."},
{"n":"Virtuoso of Captivation","l":14,"t":"Action: for 10 minutes chosen creatures have disadvantage on saves against charm and sleep and on Perception checks. Once per short or long rest."}]});
S({"c":"bard","id":"bard:tragedy","name":"College of Tragedy","source":TD,"features":[
{"n":"Poetry in Misery","l":3,"t":"Reaction when you or an ally within 30 ft rolls a natural 1: regain one Bardic Inspiration use."},
{"n":"Sorrowful Fate","l":3,"t":"Expend a Bardic Inspiration to turn a save into a Charisma save; on a failure the target takes psychic damage equal to the die. Once per short or long rest."},
{"n":"Tale of Hubris","l":6,"t":"Reaction when a creature scores a critical hit: weapon attacks against it crit on 18 to 20 for 1 minute (17 to 20 at 14th)."},
{"n":"Impending Misfortune","l":6,"t":"+10 to an attack or save, then -10 to your next one. Once per short or long rest."},
{"n":"Nimbus of Pathos","l":14,"t":"Action: a creature gains +4 AC, advantage on attacks and saves, +1d10 radiant damage and an expanded crit range for 1 minute, then drops to 0 HP. Once per long rest."}]});
S({"c":"cleric","id":"cleric:beauty-hb","name":"Beauty Domain","source":"Community homebrew","spells":{"1":["Charm Person","Heroism"],"3":["Enthrall","Suggestion"],"5":["Beacon of Hope","Hypnotic Pattern"],"7":["Charm Monster","Compulsion"],"9":["Dominate Person","Hold Monster"]},"features":[
{"n":"Beauty's Refuge","l":1,"t":"After a rest, up to 12 allies gain temp HP equal to your CHA mod (5 + CHA mod at 6th level)."},
{"n":"Rebuke the Defiler","l":1,"t":"Reaction: a creature within 30 ft that deals damage takes the same amount as psychic damage (Wisdom save for half). Once per short or long rest."},
{"n":"Channel Divinity: Beauty's Truce","l":2,"t":"Action: creatures within 100 ft make a Charisma save or are charmed by each other for 1 hour."},
{"n":"Potent Spellcasting","l":8,"t":"Add your Wisdom modifier to the damage of any cleric cantrip."},
{"n":"Soul of Beauty","l":17,"t":"Reaction: impose a penalty equal to your CHA mod on a creature's attacks against you or its saves against your spells this turn."}]});
S({"c":"cleric","id":"cleric:blood","name":"Blood Domain (original)","source":"Tal'Dorei Campaign Setting","spells":{"1":["Sleep","Ray of Sickness"],"3":["Ray of Enfeeblement","Crown of Madness"],"5":["Haste","Slow"],"7":["Blight","Stoneskin"],"9":["Dominate Person","Hold Monster"]},"grants":{"weapons":["Martial weapons"]},"features":[
{"n":"Bloodletting Focus","l":1,"t":"Proficiency with martial weapons. Your damaging spells deal extra necrotic damage equal to 2 + spell level to creatures with blood."},
{"n":"Channel Divinity: Blood Puppet","l":2,"t":"Action: a Large or smaller creature within 60 ft makes a Constitution save or moves and attacks as you choose."},
{"n":"Channel Divinity: Crimson Bond","l":6,"t":"With a sample of a creature's blood, learn its distance, direction and health for 1 hour, and try to share its senses."},
{"n":"Sanguine Recall","l":8,"t":"Action: recover spell slots up to half your cleric level, taking 1d6 necrotic per slot level. Once per long rest."},
{"n":"Vascular Corruption Aura","l":17,"t":"Action: 30-ft aura for 1 minute dealing 2d6 necrotic and halving enemies' healing. Once per long rest."}]});
S({"c":"cleric","id":"cleric:blood-reborn","name":"Blood Domain","source":TD,"spells":{"1":["False Life","Sleep"],"3":["Hold Person","Ray of Enfeeblement"],"5":["Haste","Slow"],"7":["Blight","Stoneskin"],"9":["Dominate Person","Hold Monster"]},"grants":{"weapons":["Martial weapons"]},"features":[
{"n":"Bloodletting Focus","l":1,"t":"Proficiency with martial weapons. Your instantaneous damaging spells deal extra necrotic damage equal to 2 + spell level to creatures with blood."},
{"n":"Channel Divinity: Crimson Bond","l":2,"t":"Bond with a creature you can see or whose blood you hold for 1 hour: learn its location and health, or try to share its senses."},
{"n":"Channel Divinity: Blood Puppet","l":6,"t":"Action: a Large or smaller creature or corpse within 60 ft makes a Wisdom save or is charmed and commanded for 1 minute."},
{"n":"Sanguine Recall","l":6,"t":"Action: recover spell slots up to half your cleric level, taking 1d8 necrotic per slot level. Once per long rest."},
{"n":"Divine Strike","l":8,"t":"Once per turn on a weapon hit, deal an extra 1d8 necrotic damage (2d8 at 14th level)."},
{"n":"Vascular Corruption Aura","l":17,"t":"Action: 30-ft aura for 1 minute dealing 3d6 necrotic and halving enemies' healing. Once per long rest."}]});
S({"c":"cleric","id":"cleric:mind","name":"Mind Domain","source":EE,"spells":{"1":["Command","Dissonant Whispers"],"3":["Detect Thoughts","Phantasmal Force"],"5":["Enemies Abound","Fear"],"7":["Confusion","Phantasmal Killer"],"9":["Dominate Person","Telekinesis"]},"features":[
{"n":"Flash of Insight","l":1,"t":"Reroll an ability check and add half your cleric level. Twice per short or long rest."},
{"n":"Psychic Force","l":1,"t":"Your cleric spells can deal psychic damage instead of radiant."},
{"n":"Channel Divinity: Psychic Feedback","l":2,"t":"Reaction: a creature within 30 ft has disadvantage on a Wisdom save and takes psychic damage equal to half your cleric level."},
{"n":"Gestalt Anchor","l":6,"t":"You and allies within 10 ft gain +2 to Intelligence, Wisdom and Charisma saves."},
{"n":"Potent Spellcasting","l":8,"t":"Add your Wisdom modifier to the damage of any cleric cantrip."},
{"n":"Bend Reality","l":17,"t":"Replace an ally's failed saving throw roll with a 20. Once per short or long rest."}]});
S({"c":"cleric","id":"cleric:moon","name":"Moon Domain","source":TD,"spells":{"1":["Faerie Fire","Silent Image"],"3":["Invisibility","Moonbeam"],"5":["Hypnotic Pattern","Major Image"],"7":["Greater Invisibility","Hallucinatory Terrain"],"9":["Dream","Passwall"]},"features":[
{"n":"Clarity of Catha","l":1,"t":"Reaction: give a creature within 30 ft advantage on a Wisdom save. Proficiency bonus uses per long rest."},
{"n":"Channel Divinity: Blessing of the Full Moon","l":2,"t":"Action: bless a creature as Watchful (+10 ft speed and tracking for 1 hour) or Blood-Drenched (pack tactics for 10 minutes)."},
{"n":"Channel Divinity: Mind of Two Moons","l":6,"t":"Concentrate on two Moon domain spells at once, with disadvantage on concentration saves."},
{"n":"Empowered Cantrips","l":8,"t":"Add your Wisdom modifier to the damage of cleric cantrips."},
{"n":"Eclipse of Ill Omen","l":17,"t":"Bonus action: 60-ft dim aura for 1 minute imposing disadvantage on saves; your radiant damage curses a creature. Once per long rest."}]});
S({"c":"druid","id":"druid:blighted","name":"Circle of the Blighted","source":TD,"grants":{"skills":["Intimidation"]},"features":[
{"n":"Defile Ground","l":2,"t":"Bonus action: corrupt a 10-ft radius within 60 ft for 1 minute: difficult terrain for enemies and +1d4 necrotic on the first damage each turn. Once per short or long rest."},
{"n":"Blighted Shape","l":2,"t":"Proficiency in Intimidation; your Wild Shape forms gain +2 AC and darkvision."},
{"n":"Call of the Shadowseeds","l":6,"t":"Reaction when a creature is damaged in your defiled ground: summon a blighted sapling that attacks. Proficiency bonus uses per long rest."},
{"n":"Foul Conjuration","l":10,"t":"Your summoned creatures are immune to necrotic and poison and explode when they die."},
{"n":"Incarnation of Corruption","l":14,"t":"Resistance to necrotic, +2 AC, and bonus-action temp HP while in your defiled ground."}]});
S({"c":"druid","id":"druid:forged-hb","name":"Circle of the Forged","source":EE,"features":[
{"n":"Circle Forms","l":2,"t":"Wild Shape into beasts up to CR 1; from 6th level, CR up to your druid level divided by 3."},
{"n":"Skin of Steel","l":2,"t":"In Wild Shape: +2 AC, resistance to poison, immunity to disease, and no need to eat, drink, breathe or sleep."},
{"n":"Elemental Fury","l":6,"t":"In Wild Shape, expend a spell slot on a hit for +1d6 elemental damage per slot level and a rider effect."},
{"n":"Adamantine Hide","l":10,"t":"In Wild Shape: resistance to nonmagical weapon damage, and you can Wild Shape as a reaction when damaged."},
{"n":"Constructed Perfection","l":14,"t":"In Wild Shape you can't be charmed, frightened, paralyzed, petrified or poisoned."}]});
S({"c":"fighter","id":"fighter:gunslinger","name":"Gunslinger","source":"Matthew Mercer (homebrew)","grants":{"weapons":["Firearms"],"tools":["Tinker's tools"]},"features":[
{"n":"Firearm Proficiency","l":3,"t":"Proficiency with firearms and tinker's tools."},
{"n":"Gunsmith","l":3,"t":"Craft ammunition and repair or build firearms with tinker's tools."},
{"n":"Adept Marksman","l":3,"t":"Learn two trick shots (more at 7th, 10th, 15th, 18th), fuelled by grit points equal to your WIS mod. Trick shot DC 8 + proficiency + DEX mod."},
{"n":"Quickdraw","l":7,"t":"Add your proficiency bonus to initiative, and swap firearms as one object interaction."},
{"n":"Rapid Repair","l":10,"t":"Bonus action: spend a grit point to try to repair a misfired firearm."},
{"n":"Lightning Reload","l":15,"t":"Reload any firearm as a bonus action."},
{"n":"Vicious Intent","l":18,"t":"Firearm attacks crit on 19 to 20 and restore grit."},
{"n":"Hemorrhaging Critical","l":18,"t":"A firearm critical hit deals half its damage again at the end of the target's next turn."}]});
S({"c":"fighter","id":"fighter:renegade","name":"Renegade","source":LOR,"choices":[{"l":3,"type":"skill","count":2,"from":["Deception","Persuasion","Sleight of Hand"]}],"features":[
{"n":"Scoundrel's Wit","l":3,"t":"Proficiency in two of Deception, Persuasion, Sleight of Hand."},
{"n":"Gunfighter Form","l":3,"t":"Choose Pistoleer (30 ft, 1d6 + DEX, extra shots as you level) or Sniper (120 ft, 1d10 + DEX, more dice as you level)."},
{"n":"Weapon of Choice","l":3,"t":"Choose one minor and one major firearm upgrade; more at 5th and 10th level."},
{"n":"Cunning Shot","l":7,"t":"Your firearm damage ignores resistance and immunity."},
{"n":"Grin and Bear It","l":10,"t":"Second Wind also grants +1 AC and +10 ft speed until your next turn."},
{"n":"Right Gun for the Job","l":15,"t":"Swap your firearm upgrades after a long rest."},
{"n":"Light 'Em Up","l":18,"t":"Bonus action: an explosive deals 12d6 force in a 15-ft radius (Dexterity save for half). Once per short or long rest."}]});
S({"c":"monk","id":"monk:cobalt-soul","name":"Way of the Cobalt Soul","source":TD,"features":[
{"n":"Extract Aspects","l":3,"t":"Creatures hit by your Flurry of Blows are analysed: you learn their resistances and immunities, and can strike back as a reaction when they miss you."},
{"n":"Extort Truth","l":6,"t":"On an unarmed hit, spend 1 ki: Charisma save or the creature can't lie for 10 minutes."},
{"n":"Mystical Erudition","l":6,"t":"Learn a language and gain proficiency or expertise in Arcana, History, Investigation, Nature or Religion; again at 11th and 17th."},
{"n":"Mind of Mercury","l":11,"t":"Once per turn spend 1 ki to take an additional reaction."},
{"n":"Debilitating Barrage","l":17,"t":"On an unarmed hit, spend 3 ki to give the creature vulnerability to one damage type for 1 minute."}]});
S({"c":"monk","id":"monk:living-weapon","name":"Way of the Living Weapon","source":EE,"variantLabel":"Martial Discipline","variantList":["Forged Heart","Nightmare Shroud","Traveler's Blade","Weretouched"],"features":[
{"n":"Fists of Bone and Steel","l":3,"t":"Your unarmed strike die is one size larger than your Martial Arts die (d6, d8 at 5th, d10 at 11th, d12 at 17th)."},
{"n":"Martial Discipline","l":3,"t":"Choose a discipline. Forged Heart: adamantine strikes and a 1-ki push. Nightmare Shroud: 1-ki psychic fright. Traveler's Blade: extended reach. Weretouched: 1-ki bleeding wound."},
{"n":"Mutable Strike","l":3,"t":"Your unarmed strikes can deal bludgeoning, piercing or slashing damage."},
{"n":"Manifest Blow","l":6,"t":"After a long rest choose a damage type; your first unarmed hit each turn deals +1d6 of it (2d6 at 11th)."},
{"n":"Reflexive Adaptation","l":11,"t":"Spend 1 ki to roll an extra d20 on an Athletics or Acrobatics check."},
{"n":"Perfect Form","l":17,"t":"A capstone based on your discipline: a WIS-mod AC reaction, splash psychic damage, poisoning strikes, or a three-strike Flurry with advantage."}]});
S({"c":"monk","id":"monk:soul-knife","name":"Way of the Soul Knife","source":"ThinkDM (homebrew)","features":[
{"n":"Soul Knives","l":3,"t":"Unarmed strikes can deal psychic damage, and a bonus action gives them 30 ft reach this turn."},
{"n":"Psychic Slash","l":3,"t":"Flurry of Blows hits add a rider: temp HP, fright, taunt, a 10-ft teleport, or psychic vulnerability."},
{"n":"Aura Sight","l":6,"t":"Action: a creature makes a Wisdom save or you learn its alignment, health and attitude and can track it for 24 hours."},
{"n":"Spectral Blades","l":11,"t":"Once per turn trade an unarmed strike for a Dexterity-save psychic strike."},
{"n":"Psychic Form","l":17,"t":"Bonus action: for 1 minute, resistance to all damage, 30 ft flying, and movement through objects. Once per long rest."}]});
S({"c":"paladin","id":"paladin:open-sea","name":"Oath of the Open Sea","source":TD,"spells":{"3":["Create or Destroy Water","Expeditious Retreat"],"5":["Augury","Misty Step"],"9":["Call Lightning","Freedom of the Waves"],"13":["Control Water","Freedom of Movement"],"17":["Commune with Nature","Freedom of the Winds"]},"features":[
{"n":"Channel Divinity: Marine Layer","l":3,"t":"Action: a 20-ft fog follows you for 10 minutes; you and creatures within 5 ft see through it."},
{"n":"Channel Divinity: Fury of the Tides","l":3,"t":"Bonus action: for 1 minute, once per turn push a creature you hit 10 ft; it takes CHA mod damage if it hits an obstacle."},
{"n":"Aura of Liberation","l":7,"t":"You and chosen creatures within 10 ft (30 ft at 18th) can't be grappled or restrained and ignore underwater penalties."},
{"n":"Stormy Waters","l":15,"t":"Reaction when a creature enters or leaves your reach: 1d12 bludgeoning and a Strength save or it falls prone."},
{"n":"Mythic Swashbuckler","l":20,"t":"Action: for 1 minute, advantage on Athletics, a climbing speed, advantage against a lone adjacent enemy, and bonus-action Dash or Disengage. Once per long rest."}]});
S({"c":"rogue","id":"rogue:wild-card","name":"Wild Card","source":LOR,"variantLabel":"Gambit","variantList":["Loaded Dice","Dragonchess","Playing Cards"],"features":[
{"n":"Tricks Up the Sleeve","l":3,"t":"Learn Guidance; at 9th level cast it as a bonus action at 30 ft."},
{"n":"Wild Card's Gambit","l":3,"t":"Proficiency with a gaming set and a matching gambit: Loaded Dice (subtract d6s from attacks), Dragonchess (bonus-action maneuvers) or Playing Cards (razor-card attacks)."},
{"n":"Shifting the Odds","l":9,"t":"Bonus action: 4d10 force within 10 ft (Dexterity save for half), then teleport 120 ft. Once per short or long rest."},
{"n":"Twist of Fate","l":13,"t":"Swap initiative with a creature you can see at the start of combat."},
{"n":"Joker Wild","l":17,"t":"Bonus action: incorporeal for 1 minute with double speed and resistance to all damage. Once per long rest."}]});
S({"c":"sorcerer","id":"sorcerer:runechild","name":"Runechild (original)","source":"Tal'Dorei Campaign Setting","features":[
{"n":"Essence Runes","l":1,"t":"One rune per sorcerer level; spending sorcery points charges the same number of runes."},
{"n":"Glyphs of Aegis","l":1,"t":"Reaction when damaged: expend charged runes to reduce the damage by 1d6 each."},
{"n":"Sigilic Augmentation","l":6,"t":"Bonus action: expend a rune for advantage on Strength, Dexterity or Constitution checks until your next turn."},
{"n":"Manifest Inscriptions","l":6,"t":"Action: expend a rune to reveal hidden magical marks within 15 ft."},
{"n":"Runic Torrent","l":14,"t":"Expend runes equal to a spell's level to ignore resistance and immunity to its damage."},
{"n":"Arcane Exemplar Form","l":18,"t":"Bonus action: expend 6 or more runes for a form with 40 ft flight, +2 save DC, spell resistance and healing on casts. Once per long rest."}]});
S({"c":"sorcerer","id":"sorcerer:runechild-reborn","name":"Runechild","source":TD,"spells":{"1":["Longstrider","Protection from Evil and Good"],"3":["Lesser Restoration","Protection from Poison"],"5":["Glyph of Warding","Magic Circle"],"7":["Death Ward","Freedom of Movement"],"9":["Greater Restoration","Telekinesis"]},"features":[
{"n":"Essence Runes","l":1,"t":"One rune per sorcerer level; spending sorcery points charges the same number of runes, or 1 point charges two."},
{"n":"Glyphs of Aegis","l":1,"t":"Reaction when damaged: expend charged runes to reduce the damage by 1d6 each (d8 at 14th). From 6th level you can ward another creature."},
{"n":"Sigilic Augmentation","l":6,"t":"Reaction: expend a rune for advantage on a Strength, Dexterity or Constitution check, or once per long rest on such a save."},
{"n":"Manifest Inscriptions","l":6,"t":"Action: expend a rune to reveal hidden or invisible magic within 60 ft for 1 minute."},
{"n":"Runic Torrent","l":14,"t":"Spend 2 runes to make a spell deal force damage and knock targets prone or push them 15 ft. Once per short or long rest."},
{"n":"Arcane Exemplar","l":18,"t":"Bonus action: expend a rune for 60 ft flight, disadvantage on saves against your spells, spell resistance and healing on casts; extend each turn, then you are stunned. Once per long rest."}]});
S({"c":"warlock","id":"warlock:kraken","name":"The Kraken","source":"ThinkDM (homebrew)","expanded":true,"spells":{"1":["Create or Destroy Water","Thunderwave"],"2":["Augury","Gust of Wind"],"3":["Call Lightning","Water Breathing"],"4":["Control Water","Evard's Black Tentacles"],"5":["Commune with Nature","Cone of Cold"]},"features":[
{"n":"Grasp of the Kraken","l":1,"t":"Action: tentacles at a point within 60 ft grapple chosen creatures within 10 ft (Strength save) for 1 minute."},
{"n":"Inky Escape","l":6,"t":"Reaction when damaged: cast Darkness around you; you can see through it. Once per short or long rest."},
{"n":"Scion of the Depths","l":10,"t":"Water breathing, a swimming speed and immunity to lightning; reaction to shock creatures within 30 ft when you absorb lightning."},
{"n":"Unleash the Kraken","l":14,"t":"Action: open a portal to transport your party 100 miles, or strike five foes for 10d6 bludgeoning and restrain them. Once per long rest."}]});
S({"c":"wizard","id":"wizard:blood-magic","name":"Blood Magic","source":TD,"features":[
{"n":"Blood Channeling","l":2,"t":"Use your body as a focus when wounded, and replace costly material components with 1d10 necrotic damage per 50 gp."},
{"n":"Sanguine Burst","l":2,"t":"Take necrotic damage equal to a spell's level to reroll up to INT mod of its damage dice."},
{"n":"Bond of Mutual Suffering","l":6,"t":"Reaction when hit: the attacker takes the same damage. Once per short or long rest (twice at 14th)."},
{"n":"Glyph of Hemorrhaging","l":10,"t":"Curse a creature your spell damages: it takes +1d6 necrotic from attacks for 1 minute (Constitution save ends). Once per short or long rest."},
{"n":"Thicker than Water","l":14,"t":"Regain extra HP equal to your proficiency bonus from magical healing, and resist nonmagical weapon damage while concentrating."}]});
})();
