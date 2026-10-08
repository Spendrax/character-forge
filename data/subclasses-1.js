// Subclass data summarised from https://dnd5e.wikidot.com (CC BY-SA 3.0). Feature text is paraphrased.
window.DND = window.DND || {};
DND.subclasses = DND.subclasses || [];
DND.subclasses.push(
{"c":"artificer","id":"artificer:alchemist","name":"Alchemist","source":"Tasha's Cauldron of Everything","tag":"official","spells":{"3":["Healing Word","Ray of Sickness"],"5":["Flaming Sphere","Melf's Acid Arrow"],"9":["Gaseous Form","Mass Healing Word"],"13":["Blight","Death Ward"],"17":["Cloudkill","Raise Dead"]},"grants":{"tools":["Alchemist's supplies"]},"features":[
{"n":"Tool Proficiency","l":3,"t":"Proficiency with alchemist's supplies (or another artisan's tool if you already have it)."},
{"n":"Experimental Elixir","l":3,"t":"After a long rest, make one experimental elixir in an empty flask; roll d6 for its effect (healing, swiftness, resilience, boldness, flight, transformation). Extra elixirs cost a spell slot. Two elixirs at 6th level, three at 15th."},
{"n":"Alchemical Savant","l":5,"t":"When you cast a spell with alchemist's supplies as focus, add your INT mod (min +1) to one roll that restores HP or deals acid, fire, necrotic or poison damage."},
{"n":"Restorative Reagents","l":9,"t":"Your elixirs also grant 2d6 + INT mod temp HP. Cast Lesser Restoration without a slot INT mod times per long rest."},
{"n":"Chemical Mastery","l":15,"t":"Resistance to acid and poison damage, immunity to the poisoned condition. Cast Greater Restoration and Heal once each per long rest without a slot or components."}]},
{"c":"artificer","id":"artificer:armorer","name":"Armorer","source":"Tasha's Cauldron of Everything","tag":"official","spells":{"3":["Magic Missile","Thunderwave"],"5":["Mirror Image","Shatter"],"9":["Hypnotic Pattern","Lightning Bolt"],"13":["Fire Shield","Greater Invisibility"],"17":["Passwall","Wall of Force"]},"grants":{"armor":["Heavy armor"],"tools":["Smith's tools"]},"features":[
{"n":"Tools of the Trade","l":3,"t":"Proficiency with heavy armor and smith's tools."},
{"n":"Arcane Armor","l":3,"t":"Action: turn worn armor into Arcane Armor. It has no Strength requirement, is a spellcasting focus, can't be removed against your will, and replaces missing limbs."},
{"n":"Armor Model","l":3,"t":"Choose Guardian or Infiltrator after each rest; the model's weapon uses INT. Guardian: Thunder Gauntlets (1d8 thunder, target has disadvantage attacking others) and Defensive Field (bonus action, temp HP equal to artificer level, proficiency bonus uses per long rest). Infiltrator: Lightning Launcher (1d6 lightning, 90/300 ft, +1d6 once per turn), +5 ft speed, advantage on Stealth."},
{"n":"Extra Attack","l":5,"t":"Attack twice when you take the Attack action."},
{"n":"Armor Modifications","l":9,"t":"Your Arcane Armor counts as four items (armor, boots, helmet, weapon) for infusions, and you can infuse two extra items if they are part of the armor."},
{"n":"Perfected Armor","l":15,"t":"Guardian: reaction to pull a creature within 30 ft up to 25 ft toward you (Strength save) and attack it; proficiency bonus uses per long rest. Infiltrator: creatures hit by the launcher glimmer, have disadvantage attacking you, and the next attack against them has advantage and +1d6 lightning."}]},
{"c":"artificer","id":"artificer:artillerist","name":"Artillerist","source":"Tasha's Cauldron of Everything","tag":"official","spells":{"3":["Shield","Thunderwave"],"5":["Scorching Ray","Shatter"],"9":["Fireball","Wind Wall"],"13":["Ice Storm","Wall of Fire"],"17":["Cone of Cold","Wall of Force"]},"grants":{"tools":["Woodcarver's tools"]},"features":[
{"n":"Tool Proficiency","l":3,"t":"Proficiency with woodcarver's tools (or another artisan's tool if you already have it)."},
{"n":"Eldritch Cannon","l":3,"t":"Action: create a Small or Tiny cannon (flamethrower, force ballista or protector) within 5 ft. AC 18, HP 5 x artificer level, lasts 1 hour. Bonus action to activate within 60 ft. Once per long rest, or expend a spell slot."},
{"n":"Arcane Firearm","l":5,"t":"After a long rest, carve a wand, staff or rod into your arcane firearm. Artificer spells cast through it add 1d8 to one damage roll."},
{"n":"Explosive Cannon","l":9,"t":"Cannon damage +1d8. Action: detonate a cannon within 60 ft; creatures within 20 ft take 3d8 force (Dexterity save for half)."},
{"n":"Fortified Position","l":15,"t":"You and allies within 10 ft of a cannon have half cover. You can have two cannons at once."}]},
{"c":"artificer","id":"artificer:battle-smith","name":"Battle Smith","source":"Tasha's Cauldron of Everything","tag":"official","spells":{"3":["Heroism","Shield"],"5":["Branding Smite","Warding Bond"],"9":["Aura of Vitality","Conjure Barrage"],"13":["Aura of Purity","Fire Shield"],"17":["Banishing Smite","Mass Cure Wounds"]},"grants":{"weapons":["Martial weapons"],"tools":["Smith's tools"]},"features":[
{"n":"Battle Ready","l":3,"t":"Proficiency with martial weapons and smith's tools. Use INT instead of STR or DEX for attack and damage with magic weapons."},
{"n":"Steel Defender","l":3,"t":"A construct companion (AC 15, HP 2 + INT mod + 5 x artificer level) that acts after you and attacks for 1d8 + proficiency bonus force when commanded. Its reaction imposes disadvantage on an attack against an ally within 5 ft."},
{"n":"Extra Attack","l":5,"t":"Attack twice when you take the Attack action."},
{"n":"Arcane Jolt","l":9,"t":"When you or your defender hits, deal +2d6 force or heal 2d6 to a creature within 30 ft of the target. INT mod uses per long rest, once per turn."},
{"n":"Improved Defender","l":15,"t":"Arcane Jolt becomes 4d6. The defender gains +2 AC and its Deflect Attack deals 1d4 + INT mod force to the attacker."}]},

{"c":"barbarian","id":"barbarian:ancestral-guardian","name":"Path of the Ancestral Guardian","source":"Xanathar's Guide to Everything","tag":"official","features":[
{"n":"Ancestral Protectors","l":3,"t":"While raging, the first creature you hit each turn has disadvantage on attacks against anyone but you until your next turn, and its other targets resist its damage."},
{"n":"Spirit Shield","l":6,"t":"While raging, reaction when a creature within 30 ft takes damage: reduce it by 2d6 (3d6 at 10th, 4d6 at 14th)."},
{"n":"Consult the Spirits","l":10,"t":"Cast Augury or Clairvoyance without a slot or components, using Wisdom. Once per short or long rest."},
{"n":"Vengeful Ancestors","l":14,"t":"When Spirit Shield reduces damage, the attacker takes force damage equal to the amount prevented."}]},
{"c":"barbarian","id":"barbarian:battlerager","name":"Path of the Battlerager","source":"Sword Coast Adventurer's Guide","tag":"official","features":[
{"n":"Battlerager Armor","l":3,"t":"You can use spiked armor as a weapon. While raging in it, bonus action to attack with the spikes for 1d4 piercing; a successful grapple deals 3 piercing."},
{"n":"Reckless Abandon","l":6,"t":"When you use Reckless Attack while raging, gain temp HP equal to your CON mod (min 1)."},
{"n":"Battlerager Charge","l":10,"t":"While raging, Dash as a bonus action."},
{"n":"Spiked Retribution","l":14,"t":"While raging in spiked armor, a creature within 5 ft that hits you with a melee attack takes 3 piercing damage."}]},
{"c":"barbarian","id":"barbarian:beast","name":"Path of the Beast","source":"Tasha's Cauldron of Everything","tag":"official","features":[
{"n":"Form of the Beast","l":3,"t":"When you rage, grow a natural weapon: Bite (1d8 piercing, heal proficiency bonus once per turn if under half HP), Claws (1d6 slashing, one extra claw attack per turn) or Tail (1d8 piercing, reach, reaction to add d8 to AC)."},
{"n":"Bestial Soul","l":6,"t":"Natural weapons count as magical. After a rest choose: swim speed and water breathing, climb speed including ceilings, or extended jumps via Athletics."},
{"n":"Infectious Fury","l":10,"t":"When you hit with a natural weapon while raging, the target makes a Wisdom save (DC 8 + CON mod + proficiency) or attacks a creature you choose or takes 2d12 psychic. Proficiency bonus uses per long rest."},
{"n":"Call the Hunt","l":14,"t":"When you rage, choose up to CON mod willing creatures within 30 ft: you gain 5 temp HP each, and they add d6 to one damage roll per turn. Proficiency bonus uses per long rest."}]},
{"c":"barbarian","id":"barbarian:berserker","name":"Path of the Berserker","source":"Player's Handbook","tag":"official","features":[
{"n":"Frenzy","l":3,"t":"When you rage you can frenzy: one melee weapon attack as a bonus action each turn. Gain one level of exhaustion when the rage ends."},
{"n":"Mindless Rage","l":6,"t":"You can't be charmed or frightened while raging."},
{"n":"Intimidating Presence","l":10,"t":"Action: one creature within 30 ft makes a Wisdom save (DC 8 + proficiency + CHA mod) or is frightened until the end of your next turn; you can extend it with your action."},
{"n":"Retaliation","l":14,"t":"Reaction when a creature within 5 ft damages you: make a melee weapon attack against it."}]},
{"c":"barbarian","id":"barbarian:giant","name":"Path of the Giant","source":"Bigby Presents: Glory of the Giants","tag":"official","grants":{"languages":["Giant"]},"features":[
{"n":"Giant's Power","l":3,"t":"Learn Giant and one cantrip: Druidcraft or Thaumaturgy (Wisdom)."},
{"n":"Giant's Havoc","l":3,"t":"While raging: add Rage Damage to Strength-based thrown weapon attacks, reach +5 ft, and you become Large."},
{"n":"Elemental Cleaver","l":6,"t":"When you rage, infuse a weapon with acid, cold, fire, thunder or lightning: it deals that type, +1d6 on a hit, and gains thrown (20/60) and returns to your hand."},
{"n":"Mighty Impel","l":10,"t":"Bonus action while raging: move a Medium or smaller creature in reach up to 30 ft (Strength save if unwilling)."},
{"n":"Demiurgic Colossus","l":14,"t":"While raging, reach +10 ft and you can become Huge. Mighty Impel moves Large creatures. Elemental Cleaver deals 2d6."}]},
{"c":"barbarian","id":"barbarian:storm-herald","name":"Path of the Storm Herald","source":"Xanathar's Guide to Everything","tag":"official","features":[
{"n":"Storm Aura","l":3,"t":"While raging you have a 10-ft aura, activated on raging and as a bonus action. Desert: others take 2 fire (scaling to 6). Sea: one creature takes 1d6 lightning (scaling to 4d6), Dexterity save for half. Tundra: chosen creatures gain 2 temp HP (scaling to 6)."},
{"n":"Storm Soul","l":6,"t":"Desert: fire resistance and ignore extreme heat. Sea: lightning resistance, water breathing, 30 ft swim speed. Tundra: cold resistance and ignore extreme cold."},
{"n":"Shielding Storm","l":10,"t":"Creatures you choose in your aura gain your Storm Soul damage resistance."},
{"n":"Raging Storm","l":14,"t":"Desert: reaction, attacker in aura takes fire damage equal to half your level (Dexterity save). Sea: reaction, creature you hit is knocked prone (Strength save). Tundra: one creature's speed becomes 0 (Strength save)."}]},
{"c":"barbarian","id":"barbarian:totem-warrior","name":"Path of the Totem Warrior","source":"Player's Handbook","tag":"official","features":[
{"n":"Spirit Seeker","l":3,"t":"Cast Beast Sense and Speak with Animals as rituals."},
{"n":"Totem Spirit","l":3,"t":"While raging, by totem. Bear: resistance to all damage but psychic. Eagle: bonus-action Dash, opportunity attacks against you have disadvantage. Elk: +15 ft speed. Tiger: longer jumps. Wolf: allies have advantage on melee attacks against enemies within 5 ft of you."},
{"n":"Aspect of the Beast","l":6,"t":"By totem. Bear: double carrying capacity. Eagle: see up to 1 mile clearly. Elk: double travel pace for your group. Tiger: two skills from Athletics, Acrobatics, Stealth, Survival. Wolf: track at fast pace, stealth at normal pace."},
{"n":"Spirit Walker","l":10,"t":"Cast Commune with Nature as a ritual."},
{"n":"Totemic Attunement","l":14,"t":"While raging, by totem. Bear: enemies within 5 ft have disadvantage attacking others. Eagle: flying speed in bursts. Elk: bonus action to trample (1d12 + STR, prone). Tiger: bonus attack after a 20-ft charge. Wolf: bonus action to knock a hit target prone."}]},
{"c":"barbarian","id":"barbarian:wild-magic","name":"Path of Wild Magic","source":"Tasha's Cauldron of Everything","tag":"official","features":[
{"n":"Magic Awareness","l":3,"t":"Action: sense spells and magic items within 60 ft and learn their schools. Proficiency bonus uses per long rest."},
{"n":"Wild Surge","l":3,"t":"When you rage, roll d8 on the Wild Magic table for a magical effect. Save DC 8 + proficiency + CON mod."},
{"n":"Bolstering Magic","l":6,"t":"Action: touch a creature to give +1d3 to attacks and checks for 10 minutes, or restore a spell slot of level 1d3. Proficiency bonus uses per long rest."},
{"n":"Unstable Backlash","l":10,"t":"While raging, reaction when you take damage or fail a save: roll a new Wild Magic effect."},
{"n":"Controlled Surge","l":14,"t":"Roll twice on the Wild Magic table and choose; on doubles choose any effect."}]},
{"c":"barbarian","id":"barbarian:zealot","name":"Path of the Zealot","source":"Xanathar's Guide to Everything","tag":"official","features":[
{"n":"Divine Fury","l":3,"t":"While raging, the first creature you hit each turn takes extra 1d6 + half your barbarian level necrotic or radiant damage."},
{"n":"Warrior of the Gods","l":3,"t":"Spells that restore you to life need no material components."},
{"n":"Fanatical Focus","l":6,"t":"Once per rage, reroll a failed saving throw."},
{"n":"Zealous Presence","l":10,"t":"Bonus action: up to ten creatures within 60 ft gain advantage on attacks and saves until your next turn. Once per long rest."},
{"n":"Rage Beyond Death","l":14,"t":"While raging, dropping to 0 HP doesn't knock you unconscious, and you don't die from failed death saves until the rage ends."}]},

{"c":"bard","id":"bard:creation","name":"College of Creation","source":"Tasha's Cauldron of Everything","tag":"official","features":[
{"n":"Mote of Potential","l":3,"t":"Your Bardic Inspiration die has a bonus effect. Ability check: roll it twice. Attack: thunder damage equal to the die to the target and nearby creatures (Constitution save). Save: temp HP equal to the die + CHA mod."},
{"n":"Performance of Creation","l":3,"t":"Action: create one nonmagical item worth up to 20 gp x bard level for proficiency bonus hours. Once per long rest or a 2nd-level slot. Medium size (Large at 6th, Huge at 14th)."},
{"n":"Animating Performance","l":6,"t":"Action: animate a Large or smaller nonmagical item as a Dancing Item for 1 hour. Once per long rest or a 3rd-level slot."},
{"n":"Creative Crescendo","l":14,"t":"Performance of Creation makes up to CHA mod items at once, with no gp limit."}]},
{"c":"bard","id":"bard:eloquence","name":"College of Eloquence","source":"Tasha's Cauldron of Everything","tag":"official","features":[
{"n":"Silver Tongue","l":3,"t":"Treat a d20 roll of 9 or lower as 10 on Persuasion and Deception checks."},
{"n":"Unsettling Words","l":3,"t":"Bonus action: expend a Bardic Inspiration; a creature within 60 ft subtracts the roll from its next saving throw."},
{"n":"Unfailing Inspiration","l":6,"t":"A creature keeps your Bardic Inspiration die if the roll it added it to fails."},
{"n":"Universal Speech","l":6,"t":"Action: up to CHA mod creatures within 60 ft understand you for 1 hour. Once per long rest or a spell slot."},
{"n":"Infectious Inspiration","l":14,"t":"Reaction when a creature succeeds using your inspiration die: give another creature a die for free. CHA mod uses per long rest."}]},
{"c":"bard","id":"bard:glamour","name":"College of Glamour","source":"Xanathar's Guide to Everything","tag":"official","features":[
{"n":"Mantle of Inspiration","l":3,"t":"Bonus action, expend a Bardic Inspiration: up to CHA mod creatures within 60 ft gain 5 temp HP (8/11/14 at 5th/10th/15th) and can move their speed as a reaction without provoking."},
{"n":"Enthralling Performance","l":3,"t":"After a 1-minute performance, up to CHA mod humanoids make a Wisdom save or are charmed by you for 1 hour. Once per short or long rest."},
{"n":"Mantle of Majesty","l":6,"t":"Bonus action: for 1 minute (concentration), cast Command as a bonus action each turn without a slot. Once per long rest."},
{"n":"Unbreakable Majesty","l":14,"t":"Bonus action: for 1 minute, a creature attacking you for the first time on a turn makes a Charisma save or must choose another target. Once per short or long rest."}]},
{"c":"bard","id":"bard:lore","name":"College of Lore","source":"Player's Handbook","tag":"official","choices":[{"l":3,"type":"skill","count":3,"from":"any"}],"features":[
{"n":"Bonus Proficiencies","l":3,"t":"Proficiency in three skills of your choice."},
{"n":"Cutting Words","l":3,"t":"Reaction: expend a Bardic Inspiration to subtract the roll from an attack roll, ability check or damage roll of a creature within 60 ft."},
{"n":"Additional Magical Secrets","l":6,"t":"Learn two spells from any class; they don't count against your spells known."},
{"n":"Peerless Skill","l":14,"t":"Expend a Bardic Inspiration to add the roll to your own ability check."}]},
{"c":"bard","id":"bard:spirits","name":"College of Spirits","source":"Van Richten's Guide to Ravenloft","tag":"official","features":[
{"n":"Guiding Whispers","l":3,"t":"Learn Guidance; it doesn't count against cantrips known and has a 60 ft range."},
{"n":"Spiritual Focus","l":3,"t":"Use a candle, crystal ball, skull, spirit board or tarokka deck as a focus. From 6th level, add 1d6 to one damage or healing roll of bard spells cast through it."},
{"n":"Tales from Beyond","l":3,"t":"Bonus action: expend a Bardic Inspiration and roll on the Spirit Tales table. Action: bestow the tale's effect on a creature within 30 ft."},
{"n":"Spirit Session","l":6,"t":"1-hour ritual with up to proficiency bonus creatures: temporarily learn one divination or necromancy spell from any class. Once per long rest."},
{"n":"Mystical Connection","l":14,"t":"Roll twice on the Spirit Tales table and choose."}]},
{"c":"bard","id":"bard:swords","name":"College of Swords","source":"Xanathar's Guide to Everything","tag":"official","grants":{"armor":["Medium armor"],"weapons":["Scimitars"]},"choices":[{"l":3,"type":"fightingStyle","from":["Dueling","Two-Weapon Fighting"]}],"features":[
{"n":"Bonus Proficiencies","l":3,"t":"Proficiency with medium armor and scimitars. A melee weapon you are proficient with can be your spellcasting focus."},
{"n":"Fighting Style","l":3,"t":"Choose Dueling or Two-Weapon Fighting."},
{"n":"Blade Flourish","l":3,"t":"When you take the Attack action, +10 ft speed. Once per turn on a hit, expend a Bardic Inspiration for a Defensive, Slashing or Mobile flourish that adds the die to damage plus a rider."},
{"n":"Extra Attack","l":6,"t":"Attack twice when you take the Attack action."},
{"n":"Master's Flourish","l":14,"t":"Roll a d6 for a flourish instead of expending Bardic Inspiration."}]},
{"c":"bard","id":"bard:valor","name":"College of Valor","source":"Player's Handbook","tag":"official","grants":{"armor":["Medium armor","Shields"],"weapons":["Martial weapons"]},"features":[
{"n":"Bonus Proficiencies","l":3,"t":"Proficiency with medium armor, shields and martial weapons."},
{"n":"Combat Inspiration","l":3,"t":"A creature can add your Bardic Inspiration die to a weapon damage roll, or to its AC against one attack as a reaction."},
{"n":"Extra Attack","l":6,"t":"Attack twice when you take the Attack action."},
{"n":"Battle Magic","l":14,"t":"When you cast a bard spell with your action, make one weapon attack as a bonus action."}]},
{"c":"bard","id":"bard:whispers","name":"College of Whispers","source":"Xanathar's Guide to Everything","tag":"official","features":[
{"n":"Psychic Blades","l":3,"t":"Once per turn on a weapon hit, expend a Bardic Inspiration for +2d6 psychic damage (3d6 at 5th, 5d6 at 10th, 8d6 at 15th)."},
{"n":"Words of Terror","l":3,"t":"After 1 minute alone with a humanoid, it makes a Wisdom save or is frightened of a creature you choose for 1 hour. Once per short or long rest."},
{"n":"Mantle of Whispers","l":6,"t":"Reaction when a humanoid dies within 30 ft: capture its shadow. Action: take on its appearance for 1 hour with surface knowledge of its life. Once per short or long rest."},
{"n":"Shadow Lore","l":14,"t":"Action: a creature within 30 ft makes a Wisdom save or is charmed for 8 hours, obeying you out of fear. Once per long rest."}]}
);
