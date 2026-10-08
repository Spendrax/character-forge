// Fighter, Monk and Paladin subclasses, summarised from https://dnd5e.wikidot.com (CC BY-SA 3.0).
window.DND = window.DND || {};
DND.subclasses = DND.subclasses || [];
DND.thirdCasterSlots = [[0,0,0,0],[0,0,0,0],[2,0,0,0],[3,0,0,0],[3,0,0,0],[3,0,0,0],[4,2,0,0],[4,2,0,0],[4,2,0,0],[4,3,0,0],[4,3,0,0],[4,3,0,0],[4,3,2,0],[4,3,2,0],[4,3,2,0],[4,3,3,0],[4,3,3,0],[4,3,3,0],[4,3,3,1],[4,3,3,1]];
DND.subclasses.push(
{"c":"fighter","id":"fighter:arcane-archer","name":"Arcane Archer","source":"Xanathar's Guide to Everything","tag":"official","choices":[{"l":3,"type":"skill","count":1,"from":["Arcana","Nature"]}],"features":[
{"n":"Arcane Archer Lore","l":3,"t":"Proficiency in Arcana or Nature, and learn Prestidigitation or Druidcraft."},
{"n":"Arcane Shot","l":3,"t":"Learn two Arcane Shot options (more at 7th, 10th, 15th, 18th). Once per turn apply one to a shortbow or longbow arrow. Two uses per short or long rest."},
{"n":"Magic Arrow","l":7,"t":"Arrows you fire from a shortbow or longbow count as magical."},
{"n":"Curving Shot","l":7,"t":"When a magic arrow misses, bonus action to reroll the attack against another target within 60 ft of the first."},
{"n":"Ever-Ready Shot","l":15,"t":"Regain one Arcane Shot use when you roll initiative with none left."}]},
{"c":"fighter","id":"fighter:banneret","name":"Banneret (Purple Dragon Knight)","source":"Sword Coast Adventurer's Guide","tag":"official","grants":{"skills":["Persuasion"],"skillsAt":7,"expertise":["Persuasion"]},"features":[
{"n":"Rallying Cry","l":3,"t":"When you use Second Wind, up to three allies within 60 ft regain HP equal to your fighter level."},
{"n":"Royal Envoy","l":7,"t":"Proficiency in Persuasion (or another social skill if you have it), with doubled proficiency bonus on Persuasion checks."},
{"n":"Inspiring Surge","l":10,"t":"When you use Action Surge, one ally within 60 ft can make a weapon attack as a reaction (two allies at 18th)."},
{"n":"Bulwark","l":15,"t":"When you use Indomitable on an INT, WIS or CHA save, one ally within 60 ft who failed the same save can reroll too."}]},
{"c":"fighter","id":"fighter:battle-master","name":"Battle Master","source":"Player's Handbook","tag":"official","choices":[{"l":3,"type":"tool","count":1,"from":"artisan"},{"type":"maneuver","counts":{"3":3,"7":5,"10":7,"15":9}}],"features":[
{"n":"Combat Superiority","l":3,"t":"Learn three maneuvers (two more at 7th, 10th, 15th). Four d8 superiority dice per short or long rest (five at 7th, six at 15th). Save DC 8 + proficiency + STR or DEX mod."},
{"n":"Student of War","l":3,"t":"Proficiency with one artisan's tool."},
{"n":"Know Your Enemy","l":7,"t":"After 1 minute observing a creature, learn whether it is your equal, superior or inferior in two characteristics."},
{"n":"Improved Combat Superiority","l":10,"t":"Superiority dice become d10s (d12s at 18th)."},
{"n":"Relentless","l":15,"t":"Regain one superiority die when you roll initiative with none left."}]},
{"c":"fighter","id":"fighter:cavalier","name":"Cavalier","source":"Xanathar's Guide to Everything","tag":"official","choices":[{"l":3,"type":"skillOrLanguage","count":1,"from":["Animal Handling","History","Insight","Performance","Persuasion"]}],"features":[
{"n":"Bonus Proficiency","l":3,"t":"Proficiency in Animal Handling, History, Insight, Performance or Persuasion, or one language."},
{"n":"Born to the Saddle","l":3,"t":"Advantage on saves against falling off your mount, land on your feet from a 10-ft fall, and mounting costs 5 ft of movement."},
{"n":"Unwavering Mark","l":3,"t":"Creatures you hit in melee are marked: disadvantage on attacks against others while within 5 ft of you. If one damages another creature, bonus-action attack with advantage and + half fighter level damage, STR mod times per long rest."},
{"n":"Warding Maneuver","l":7,"t":"Reaction when you or a creature within 5 ft is hit: add 1d8 to AC; if still hit, resistance to the damage. CON mod uses per long rest."},
{"n":"Hold the Line","l":10,"t":"Creatures provoke opportunity attacks when moving 5 ft or more within your reach, and a hit reduces their speed to 0."},
{"n":"Ferocious Charger","l":15,"t":"Once per turn after moving 10 ft straight and hitting, the target makes a Strength save or falls prone."},
{"n":"Vigilant Defender","l":18,"t":"You get a special reaction on every other creature's turn, usable only for opportunity attacks."}]},
{"c":"fighter","id":"fighter:champion","name":"Champion","source":"Player's Handbook","tag":"official","choices":[{"l":10,"type":"fightingStyle","from":"class"}],"features":[
{"n":"Improved Critical","l":3,"t":"Weapon attacks score a critical hit on 19 or 20."},
{"n":"Remarkable Athlete","l":7,"t":"Add half your proficiency bonus (rounded up) to STR, DEX and CON checks that don't already include it. Running long jump +STR mod feet."},
{"n":"Additional Fighting Style","l":10,"t":"Choose a second fighting style."},
{"n":"Superior Critical","l":15,"t":"Weapon attacks score a critical hit on 18 to 20."},
{"n":"Survivor","l":18,"t":"At the start of your turn, regain 5 + CON mod HP if you are at half HP or less (but above 0)."}]},
{"c":"fighter","id":"fighter:echo-knight","name":"Echo Knight","source":"Explorer's Guide to Wildemount","tag":"setting","features":[
{"n":"Manifest Echo","l":3,"t":"Bonus action: summon an echo within 15 ft (AC 14 + proficiency, 1 HP). Attack from its space, swap places for 15 ft of movement, and make opportunity attacks from it."},
{"n":"Unleash Incarnation","l":3,"t":"When you take the Attack action, make one extra melee attack from the echo's position. CON mod uses per long rest."},
{"n":"Echo Avatar","l":7,"t":"Action: see and hear through your echo for up to 10 minutes, with a range of 1,000 ft."},
{"n":"Shadow Martyr","l":10,"t":"Reaction: teleport your echo to take an attack aimed at another creature. Once per short or long rest."},
{"n":"Reclaim Potential","l":15,"t":"When your echo is destroyed by damage, gain 2d6 + CON mod temp HP. CON mod uses per long rest."},
{"n":"Legion of One","l":18,"t":"Create two echoes at once. Regain one Unleash Incarnation use on initiative if you have none."}]},
{"c":"fighter","id":"fighter:eldritch-knight","name":"Eldritch Knight","source":"Player's Handbook","tag":"official","casting":{"ability":"INT","kind":"third","list":"wizard","prepared":false,"cantrips":[0,0,2,2,2,2,2,2,2,3,3,3,3,3,3,3,3,3,3,3],"known":[0,0,3,4,4,4,5,6,6,7,8,8,9,10,10,11,11,11,12,13],"note":"Spells must be abjuration or evocation, except those gained at 3rd, 8th, 14th and 20th level."},"features":[
{"n":"Spellcasting","l":3,"t":"Cast wizard spells using Intelligence. Spells known must be abjuration or evocation, except one free pick at 3rd, 8th, 14th and 20th level."},
{"n":"Weapon Bond","l":3,"t":"Bond up to two weapons with a 1-hour ritual: you can't be disarmed of them and can summon one as a bonus action."},
{"n":"War Magic","l":7,"t":"When you cast a cantrip with your action, make one weapon attack as a bonus action."},
{"n":"Eldritch Strike","l":10,"t":"A creature you hit with a weapon has disadvantage on its next save against your spell before the end of your next turn."},
{"n":"Arcane Charge","l":15,"t":"When you use Action Surge, teleport up to 30 ft."},
{"n":"Improved War Magic","l":18,"t":"When you cast a spell with your action, make one weapon attack as a bonus action."}]},
{"c":"fighter","id":"fighter:psi-warrior","name":"Psi Warrior","source":"Tasha's Cauldron of Everything","tag":"official","features":[
{"n":"Psionic Power","l":3,"t":"Psionic Energy dice equal to twice your proficiency bonus (d6, d8 at 5th, d10 at 11th, d12 at 17th) per long rest. Protective Field: reaction to reduce damage by die + INT mod. Psionic Strike: once per turn +die + INT mod force. Telekinetic Movement: move an object or willing creature 30 ft."},
{"n":"Telekinetic Adept","l":7,"t":"Psi-Powered Leap: bonus action for flying speed twice your walking speed this turn. Telekinetic Thrust: Psionic Strike target makes a Strength save or is knocked prone or pushed 10 ft."},
{"n":"Guarded Mind","l":10,"t":"Resistance to psychic damage. Spend a die to end charmed and frightened effects on yourself."},
{"n":"Bulwark of Force","l":15,"t":"Bonus action: give up to INT mod creatures within 30 ft half cover for 1 minute. Once per long rest or a die."},
{"n":"Telekinetic Master","l":18,"t":"Cast Telekinesis without components; while concentrating, make one weapon attack as a bonus action each turn. Once per long rest or a die."}]},
{"c":"fighter","id":"fighter:rune-knight","name":"Rune Knight","source":"Tasha's Cauldron of Everything","tag":"official","grants":{"tools":["Smith's tools"],"languages":["Giant"]},"features":[
{"n":"Bonus Proficiencies","l":3,"t":"Proficiency with smith's tools, and you learn Giant."},
{"n":"Rune Carver","l":3,"t":"Know two runes (three at 7th, four at 10th, five at 15th) from Cloud, Fire, Frost, Stone, Hill and Storm. Inscribe them on gear after a long rest for passive benefits and a once-per-rest invocation."},
{"n":"Giant's Might","l":3,"t":"Bonus action: for 1 minute become Large, gain advantage on Strength checks and saves, and deal +1d6 once per turn. Proficiency bonus uses per long rest."},
{"n":"Runic Shield","l":7,"t":"Reaction when a creature within 60 ft is hit: the attacker rerolls. Proficiency bonus uses per long rest."},
{"n":"Great Stature","l":10,"t":"Grow 3d4 inches. Giant's Might damage becomes 1d8."},
{"n":"Master of Runes","l":15,"t":"Invoke each rune twice per short or long rest."},
{"n":"Runic Juggernaut","l":18,"t":"Giant's Might damage becomes 1d10 and you can become Huge with +5 ft reach."}]},
{"c":"fighter","id":"fighter:samurai","name":"Samurai","source":"Xanathar's Guide to Everything","tag":"official","choices":[{"l":3,"type":"skillOrLanguage","count":1,"from":["History","Insight","Performance","Persuasion"]}],"grants":{"saves":["WIS"],"savesAt":7},"features":[
{"n":"Bonus Proficiency","l":3,"t":"Proficiency in History, Insight, Performance or Persuasion, or one language."},
{"n":"Fighting Spirit","l":3,"t":"Bonus action: advantage on weapon attacks this turn and 5 temp HP (10 at 10th, 15 at 15th). Three uses per long rest."},
{"n":"Elegant Courtier","l":7,"t":"Add your WIS mod to Persuasion checks. Proficiency in Wisdom saves (or INT or CHA if you already have it)."},
{"n":"Tireless Spirit","l":10,"t":"Regain one Fighting Spirit use when you roll initiative with none left."},
{"n":"Rapid Strike","l":15,"t":"Once per turn, give up advantage on an attack to make an extra attack against the same target."},
{"n":"Strength Before Death","l":18,"t":"Reaction when reduced to 0 HP: take a full extra turn before falling unconscious. Once per long rest."}]},

{"c":"monk","id":"monk:mercy","name":"Way of Mercy","source":"Tasha's Cauldron of Everything","tag":"official","grants":{"tools":["Herbalism kit"],"skills":["Insight","Medicine"]},"features":[
{"n":"Implements of Mercy","l":3,"t":"Proficiency in Insight, Medicine and the herbalism kit, plus a special mask."},
{"n":"Hand of Healing","l":3,"t":"Action: spend 1 ki to heal a touched creature for a Martial Arts die + WIS mod. You can replace one Flurry of Blows strike with this for no ki."},
{"n":"Hand of Harm","l":3,"t":"Once per turn on an unarmed hit, spend 1 ki for extra necrotic damage equal to a Martial Arts die + WIS mod."},
{"n":"Physician's Touch","l":6,"t":"Hand of Healing also ends a disease or the blinded, deafened, paralyzed, poisoned or stunned condition. Hand of Harm also poisons the target until the end of your next turn."},
{"n":"Flurry of Healing and Harm","l":11,"t":"Replace each Flurry of Blows strike with Hand of Healing for no ki, and use Hand of Harm with Flurry for no ki."},
{"n":"Hand of Ultimate Mercy","l":17,"t":"Action: spend 5 ki to revive a creature dead for up to 24 hours with 4d10 + WIS mod HP. Once per long rest."}]},
{"c":"monk","id":"monk:ascendant-dragon","name":"Way of the Ascendant Dragon","source":"Fizban's Treasury of Dragons","tag":"official","choices":[{"l":3,"type":"language","count":1,"suggest":"Draconic"}],"features":[
{"n":"Draconic Disciple","l":3,"t":"Reroll a failed Intimidation or Persuasion check once per long rest; unarmed strikes can deal acid, cold, fire, lightning or poison damage; learn Draconic or another language."},
{"n":"Breath of the Dragon","l":3,"t":"Replace one attack with a 20-ft cone or 30-ft line: two Martial Arts dice of elemental damage (three at 11th), Dexterity save for half. Proficiency bonus uses per long rest, or 2 ki."},
{"n":"Wings Unfurled","l":6,"t":"When you use Step of the Wind, gain a flying speed equal to your walking speed this turn. Proficiency bonus uses per long rest."},
{"n":"Aspect of the Wyrm","l":11,"t":"Bonus action: 10-ft aura for 1 minute granting either a frightening presence or resistance to one elemental damage type. Once per long rest or 3 ki."},
{"n":"Ascendant Aspect","l":17,"t":"Blindsight 10 ft; spend 1 ki for a larger, four-dice breath; activating your aura deals 3d10 damage to chosen creatures."}]},
{"c":"monk","id":"monk:astral-self","name":"Way of the Astral Self","source":"Tasha's Cauldron of Everything","tag":"official","features":[
{"n":"Arms of the Astral Self","l":3,"t":"Bonus action, 1 ki: for 10 minutes, spectral arms let you use Wisdom for Strength checks and saves and for unarmed strikes with +5 ft reach and force damage. Creatures within 10 ft take two Martial Arts dice force on a failed Dexterity save."},
{"n":"Visage of the Astral Self","l":6,"t":"Bonus action, 1 ki: for 10 minutes see through darkness to 120 ft, advantage on Insight and Intimidation, and project your voice."},
{"n":"Body of the Astral Self","l":11,"t":"With arms and visage active: reaction to reduce elemental or force damage by 1d10 + WIS mod, and once per turn deal an extra Martial Arts die with the arms."},
{"n":"Awakened Astral Self","l":17,"t":"Bonus action, 5 ki: summon the full astral self for 10 minutes, gaining +2 AC and a third attack with Extra Attack."}]},
{"c":"monk","id":"monk:drunken-master","name":"Way of the Drunken Master","source":"Xanathar's Guide to Everything","tag":"official","grants":{"tools":["Brewer's supplies"],"skills":["Performance"]},"features":[
{"n":"Bonus Proficiencies","l":3,"t":"Proficiency in Performance and brewer's supplies."},
{"n":"Drunken Technique","l":3,"t":"Flurry of Blows also grants Disengage and +10 ft walking speed this turn."},
{"n":"Tipsy Sway","l":6,"t":"Stand from prone for 5 ft of movement. Reaction, 1 ki: redirect a melee attack that misses you to another creature within 5 ft."},
{"n":"Drunkard's Luck","l":11,"t":"Spend 2 ki to cancel disadvantage on a check, attack or save."},
{"n":"Intoxicated Frenzy","l":17,"t":"Flurry of Blows can make up to three extra attacks if each attack targets a different creature."}]},
{"c":"monk","id":"monk:four-elements","name":"Way of the Four Elements","source":"Player's Handbook","tag":"official","features":[
{"n":"Disciple of the Elements","l":3,"t":"Learn Elemental Attunement and one other elemental discipline; one more at 6th, 11th and 17th level. Disciplines cost ki to use."},
{"n":"Elemental Spell Enhancement","l":5,"t":"Spend extra ki to raise the level of discipline spells. Maximum ki per casting: 3 (5th), 4 (9th), 5 (13th), 6 (17th)."}]},
{"c":"monk","id":"monk:kensei","name":"Way of the Kensei","source":"Xanathar's Guide to Everything","tag":"official","choices":[{"l":3,"type":"tool","count":1,"from":["Calligrapher's supplies","Painter's supplies"]}],"features":[
{"n":"Path of the Kensei","l":3,"t":"Choose one melee and one ranged kensei weapon (more at 6th, 11th, 17th); you are proficient and they count as monk weapons. Agile Parry: +2 AC after an unarmed strike while holding one. Kensei's Shot: bonus action for +1d4 ranged damage. Proficiency with calligrapher's or painter's supplies."},
{"n":"One with the Blade","l":6,"t":"Kensei weapons count as magical. Deft Strike: once per turn spend 1 ki for an extra Martial Arts die of damage."},
{"n":"Sharpen the Blade","l":11,"t":"Bonus action: spend up to 3 ki to give a kensei weapon that bonus to attack and damage for 1 minute."},
{"n":"Unerring Accuracy","l":17,"t":"Once per turn, reroll a missed monk weapon attack."}]},
{"c":"monk","id":"monk:long-death","name":"Way of the Long Death","source":"Sword Coast Adventurer's Guide","tag":"official","features":[
{"n":"Touch of Death","l":3,"t":"When you reduce a creature within 5 ft to 0 HP, gain temp HP equal to WIS mod + monk level."},
{"n":"Hour of Reaping","l":6,"t":"Action: creatures within 30 ft that can see you make a Wisdom save or are frightened until the end of your next turn."},
{"n":"Mastery of Death","l":11,"t":"When reduced to 0 HP, spend 1 ki to drop to 1 HP instead."},
{"n":"Touch of the Long Death","l":17,"t":"Action: spend 1 to 10 ki; a touched creature takes 2d10 necrotic per ki (Constitution save for half)."}]},
{"c":"monk","id":"monk:open-hand","name":"Way of the Open Hand","source":"Player's Handbook","tag":"official","features":[
{"n":"Open Hand Technique","l":3,"t":"A creature hit by Flurry of Blows is knocked prone (Dexterity save), pushed 15 ft (Strength save), or can't take reactions until the end of your next turn."},
{"n":"Wholeness of Body","l":6,"t":"Action: regain HP equal to three times your monk level. Once per long rest."},
{"n":"Tranquility","l":11,"t":"After a long rest you are under a Sanctuary effect (DC 8 + WIS mod + proficiency) until your next long rest."},
{"n":"Quivering Palm","l":17,"t":"On an unarmed hit, spend 3 ki to set vibrations. Later, as an action: Constitution save or drop to 0 HP, 10d10 necrotic on a success."}]},
{"c":"monk","id":"monk:shadow","name":"Way of Shadow","source":"Player's Handbook","tag":"official","features":[
{"n":"Shadow Arts","l":3,"t":"Spend 2 ki to cast Darkness, Darkvision, Pass without Trace or Silence. Learn Minor Illusion."},
{"n":"Shadow Step","l":6,"t":"Bonus action in dim light or darkness: teleport 60 ft to another dim or dark space and gain advantage on your first melee attack this turn."},
{"n":"Cloak of Shadows","l":11,"t":"Action in dim light or darkness: become invisible until you attack, cast a spell or enter bright light."},
{"n":"Opportunist","l":17,"t":"Reaction: make a melee attack against a creature within 5 ft that was hit by someone else."}]},
{"c":"monk","id":"monk:sun-soul","name":"Way of the Sun Soul","source":"Xanathar's Guide to Everything","tag":"official","features":[
{"n":"Radiant Sun Bolt","l":3,"t":"Ranged spell attack, 30 ft, DEX to attack and damage, radiant damage of your Martial Arts die. Spend 1 ki to make two as a bonus action."},
{"n":"Searing Arc Strike","l":6,"t":"After the Attack action, spend 2 ki as a bonus action to cast Burning Hands, upcasting with extra ki."},
{"n":"Searing Sunburst","l":11,"t":"Action: 20-ft radius burst within 150 ft, 2d6 radiant on a failed Constitution save; +2d6 per ki spent (max 3)."},
{"n":"Sun Shield","l":17,"t":"Shed bright light 30 ft. Reaction when hit in melee: deal 5 + WIS mod radiant to the attacker."}]},

{"c":"paladin","id":"paladin:ancients","name":"Oath of the Ancients","source":"Player's Handbook","tag":"official","spells":{"3":["Ensnaring Strike","Speak with Animals"],"5":["Moonbeam","Misty Step"],"9":["Plant Growth","Protection from Energy"],"13":["Ice Storm","Stoneskin"],"17":["Commune with Nature","Tree Stride"]},"features":[
{"n":"Channel Divinity: Nature's Wrath","l":3,"t":"Action: vines restrain a creature within 10 ft on a failed Strength or Dexterity save; it repeats the save each turn."},
{"n":"Channel Divinity: Turn the Faithless","l":3,"t":"Action: fey and fiends within 30 ft make a Wisdom save or are turned for 1 minute."},
{"n":"Aura of Warding","l":7,"t":"You and allies within 10 ft (30 ft at 18th) have resistance to damage from spells."},
{"n":"Undying Sentinel","l":15,"t":"Once per long rest, drop to 1 HP instead of 0. You don't suffer the drawbacks of old age."},
{"n":"Elder Champion","l":20,"t":"Action: for 1 minute regain 10 HP per turn, cast paladin spells as a bonus action, and enemies within 10 ft have disadvantage on saves against your spells. Once per long rest."}]},
{"c":"paladin","id":"paladin:conquest","name":"Oath of Conquest","source":"Xanathar's Guide to Everything","tag":"official","spells":{"3":["Armor of Agathys","Command"],"5":["Hold Person","Spiritual Weapon"],"9":["Bestow Curse","Fear"],"13":["Dominate Beast","Stoneskin"],"17":["Cloudkill","Dominate Person"]},"features":[
{"n":"Channel Divinity: Conquering Presence","l":3,"t":"Action: chosen creatures within 30 ft make a Wisdom save or are frightened for 1 minute."},
{"n":"Channel Divinity: Guided Strike","l":3,"t":"+10 to an attack roll, decided after seeing the roll."},
{"n":"Aura of Conquest","l":7,"t":"Creatures frightened of you within 10 ft (30 ft at 18th) have speed 0 and take psychic damage equal to half your paladin level at the start of their turns."},
{"n":"Scornful Rebuke","l":15,"t":"A creature that hits you takes psychic damage equal to your CHA mod."},
{"n":"Invincible Conqueror","l":20,"t":"Action: for 1 minute, resistance to all damage, one extra attack, and melee crits on 19 to 20. Once per long rest."}]},
{"c":"paladin","id":"paladin:crown","name":"Oath of the Crown","source":"Sword Coast Adventurer's Guide","tag":"official","spells":{"3":["Command","Compelled Duel"],"5":["Warding Bond","Zone of Truth"],"9":["Aura of Vitality","Spirit Guardians"],"13":["Banishment","Guardian of Faith"],"17":["Circle of Power","Geas"]},"features":[
{"n":"Channel Divinity: Champion Challenge","l":3,"t":"Bonus action: chosen creatures within 30 ft make a Wisdom save or can't willingly move more than 30 ft from you."},
{"n":"Channel Divinity: Turn the Tide","l":3,"t":"Bonus action: creatures within 30 ft at half HP or less regain 1d6 + CHA mod HP."},
{"n":"Divine Allegiance","l":7,"t":"Reaction: take the damage dealt to a creature within 5 ft in its place."},
{"n":"Unyielding Saint","l":15,"t":"Advantage on saves against being paralyzed or stunned."},
{"n":"Exalted Champion","l":20,"t":"Action: for 1 hour, resistance to nonmagical weapon damage, allies within 30 ft have advantage on death saves, and you and they have advantage on Wisdom saves. Once per long rest."}]},
{"c":"paladin","id":"paladin:devotion","name":"Oath of Devotion","source":"Player's Handbook","tag":"official","spells":{"3":["Protection from Evil and Good","Sanctuary"],"5":["Lesser Restoration","Zone of Truth"],"9":["Beacon of Hope","Dispel Magic"],"13":["Freedom of Movement","Guardian of Faith"],"17":["Commune","Flame Strike"]},"features":[
{"n":"Channel Divinity: Sacred Weapon","l":3,"t":"Action: for 1 minute, one weapon adds your CHA mod to attack rolls, sheds light and is magical."},
{"n":"Channel Divinity: Turn the Unholy","l":3,"t":"Action: fiends and undead within 30 ft make a Wisdom save or are turned for 1 minute."},
{"n":"Aura of Devotion","l":7,"t":"You and allies within 10 ft (30 ft at 18th) can't be charmed."},
{"n":"Purity of Spirit","l":15,"t":"You are always under Protection from Evil and Good."},
{"n":"Holy Nimbus","l":20,"t":"Action: for 1 minute emit 30 ft of sunlight; enemies starting their turn in it take 10 radiant, and you have advantage on saves against fiend and undead spells. Once per long rest."}]},
{"c":"paladin","id":"paladin:glory","name":"Oath of Glory","source":"Tasha's Cauldron of Everything","tag":"official","spells":{"3":["Guiding Bolt","Heroism"],"5":["Enhance Ability","Magic Weapon"],"9":["Haste","Protection from Energy"],"13":["Compulsion","Freedom of Movement"],"17":["Commune","Flame Strike"]},"features":[
{"n":"Channel Divinity: Peerless Athlete","l":3,"t":"Bonus action: for 10 minutes, advantage on Athletics and Acrobatics, doubled carrying capacity and +10 ft jumps."},
{"n":"Channel Divinity: Inspiring Smite","l":3,"t":"Bonus action after Divine Smite: distribute 2d8 + paladin level temp HP among creatures within 30 ft."},
{"n":"Aura of Alacrity","l":7,"t":"Your walking speed +10 ft, and allies starting their turn within 5 ft (10 ft at 18th) gain +10 ft too."},
{"n":"Glorious Defense","l":15,"t":"Reaction when you or a creature within 10 ft is hit: add your CHA mod to AC; if it misses, attack the attacker. CHA mod uses per long rest."},
{"n":"Living Legend","l":20,"t":"Bonus action: for 1 minute, advantage on Charisma checks, turn one miss per turn into a hit, and reroll failed saves as a reaction. Once per long rest or a 5th-level slot."}]},
{"c":"paladin","id":"paladin:redemption","name":"Oath of Redemption","source":"Xanathar's Guide to Everything","tag":"official","spells":{"3":["Sanctuary","Sleep"],"5":["Calm Emotions","Hold Person"],"9":["Counterspell","Hypnotic Pattern"],"13":["Otiluke's Resilient Sphere","Stoneskin"],"17":["Hold Monster","Wall of Force"]},"features":[
{"n":"Channel Divinity: Emissary of Peace","l":3,"t":"Bonus action: +5 to Persuasion checks for 10 minutes."},
{"n":"Channel Divinity: Rebuke the Violent","l":3,"t":"Reaction when an attacker within 30 ft damages another creature: it takes radiant damage equal to the damage dealt (Wisdom save for half)."},
{"n":"Aura of the Guardian","l":7,"t":"Reaction: take the damage dealt to a creature within 10 ft (30 ft at 18th) in its place."},
{"n":"Protective Spirit","l":15,"t":"If you end your turn in combat below half HP, regain 1d6 + half your paladin level HP."},
{"n":"Emissary of Redemption","l":20,"t":"Resistance to all damage from other creatures, and attackers take radiant damage equal to half what they deal to you, until you harm that creature."}]},
{"c":"paladin","id":"paladin:vengeance","name":"Oath of Vengeance","source":"Player's Handbook","tag":"official","spells":{"3":["Bane","Hunter's Mark"],"5":["Hold Person","Misty Step"],"9":["Haste","Protection from Energy"],"13":["Banishment","Dimension Door"],"17":["Hold Monster","Scrying"]},"features":[
{"n":"Channel Divinity: Abjure Enemy","l":3,"t":"Action: one creature within 60 ft makes a Wisdom save or is frightened with speed 0 for 1 minute (speed halved on a success)."},
{"n":"Channel Divinity: Vow of Enmity","l":3,"t":"Bonus action: advantage on attacks against one creature within 10 ft for 1 minute."},
{"n":"Relentless Avenger","l":7,"t":"After hitting with an opportunity attack, move up to half your speed without provoking."},
{"n":"Soul of Vengeance","l":15,"t":"Reaction: make a melee attack against the target of your Vow of Enmity when it attacks."},
{"n":"Avenging Angel","l":20,"t":"Action: for 1 hour, 60 ft flying speed and a 30-ft aura that frightens enemies (Wisdom save). Once per long rest."}]},
{"c":"paladin","id":"paladin:watchers","name":"Oath of the Watchers","source":"Tasha's Cauldron of Everything","tag":"official","spells":{"3":["Alarm","Detect Magic"],"5":["Moonbeam","See Invisibility"],"9":["Counterspell","Nondetection"],"13":["Aura of Purity","Banishment"],"17":["Hold Monster","Scrying"]},"features":[
{"n":"Channel Divinity: Watcher's Will","l":3,"t":"Action: you and up to CHA mod creatures within 30 ft have advantage on INT, WIS and CHA saves for 1 minute."},
{"n":"Channel Divinity: Abjure the Extraplanar","l":3,"t":"Action: aberrations, celestials, elementals, fey and fiends within 30 ft make a Wisdom save or are turned for 1 minute."},
{"n":"Aura of the Sentinel","l":7,"t":"You and chosen creatures within 10 ft (30 ft at 18th) add your proficiency bonus to initiative."},
{"n":"Vigilant Rebuke","l":15,"t":"Reaction when you or a creature within 30 ft succeeds on an INT, WIS or CHA save: deal 2d8 + CHA mod force to the creature that forced it."},
{"n":"Mortal Bulwark","l":20,"t":"Bonus action: for 1 minute, truesight 120 ft, advantage against extraplanar creatures, and your hits can banish them (Charisma save). Once per long rest or a 5th-level slot."}]},
{"c":"paladin","id":"paladin:oathbreaker","name":"Oathbreaker","source":"Dungeon Master's Guide","tag":"official","spells":{"3":["Hellish Rebuke","Inflict Wounds"],"5":["Crown of Madness","Darkness"],"9":["Animate Dead","Bestow Curse"],"13":["Blight","Confusion"],"17":["Contagion","Dominate Person"]},"features":[
{"n":"Channel Divinity: Control Undead","l":3,"t":"Action: an undead within 30 ft with CR below your paladin level makes a Wisdom save or obeys you for 24 hours."},
{"n":"Channel Divinity: Dreadful Aspect","l":3,"t":"Action: chosen creatures within 30 ft make a Wisdom save or are frightened for 1 minute."},
{"n":"Aura of Hate","l":7,"t":"You and fiends and undead within 10 ft (30 ft at 18th) add your CHA mod to melee weapon damage."},
{"n":"Supernatural Resistance","l":15,"t":"Resistance to nonmagical bludgeoning, piercing and slashing damage."},
{"n":"Dread Lord","l":20,"t":"Action: for 1 minute, a 30-ft aura of gloom deals 4d10 psychic to frightened enemies, and you can attack with shadows as a bonus action for 3d10 + CHA mod necrotic. Once per long rest."}]}
);
