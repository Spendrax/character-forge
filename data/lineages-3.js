// Lineage data (part 3: setting-specific and Unearthed Arcana) summarised from https://dnd5e.wikidot.com (CC BY-SA 3.0).
window.DND = window.DND || {};
DND.lineages = DND.lineages || [];
(function(){
var SJ="Spelljammer: Adventures in Space", GGR="Guildmaster's Guide to Ravnica";
DND.lineages.push(
{"id":"aetherborn","name":"Aetherborn","group":"Plane Shift","tag":"setting","versions":[
 {"n":"Aetherborn","s":"Plane Shift: Kaladesh","a":{"CHA":2},"ac":2,"sz":"Medium","sp":30,"dv":60,"lang":["Common"],"lc":2,"sk":["Intimidation"],"res":["necrotic"],"tr":[["Born of Aether","Resistance to necrotic damage."],["Menacing","Proficiency in Intimidation."]]}]},
{"id":"aven","name":"Aven","group":"Plane Shift","tag":"setting","versions":[
 {"n":"Aven","s":"Plane Shift: Amonkhet","a":{"DEX":2},"sz":"Medium","sp":25,"fly":30,"lang":["Common","Aven"],"tr":[["Flight","Flying speed 30 ft, not usable in medium or heavy armor."]],
  "subs":[{"n":"Ibis-Headed","a":{"INT":1},"tr":[["Kefnet's Blessing","Add half your proficiency bonus to Intelligence checks that don't already include it."]]},
   {"n":"Hawk-Headed","a":{"WIS":2},"sk":["Perception"],"tr":[["Hawkeyed","Proficiency in Perception, and no disadvantage on ranged attacks at long range."]]}]}]},
{"id":"khenra","name":"Khenra","group":"Plane Shift","tag":"setting","versions":[
 {"n":"Khenra","s":"Plane Shift: Amonkhet","a":{"DEX":2,"STR":1},"sz":"Medium","sp":35,"lang":["Common","Khenra"],"prof":{"weapons":["Khopeshes","Spears","Javelins"]},"tr":[
  ["Khenra Weapon Training","Proficiency with the khopesh, spear and javelin."],["Khenra Twins","Reroll natural 1s while your twin is in sight; without a twin, you can't be frightened."]]}]},
{"id":"kor","name":"Kor","group":"Plane Shift","tag":"setting","versions":[
 {"n":"Kor","s":"Plane Shift: Zendikar","a":{"DEX":2,"WIS":1},"sz":"Medium","sp":30,"climb":30,"lang":["Common","Kor silent speech"],"sk":["Athletics","Acrobatics"],"tr":[
  ["Kor Climbing","Climbing speed 30 ft and proficiency in Athletics and Acrobatics."],["Lucky","Reroll a natural 1 on an attack roll, ability check or saving throw."],["Brave","Advantage on saves against being frightened."]]}]},
{"id":"merfolk","name":"Merfolk","group":"Plane Shift","tag":"setting","versions":[
 {"n":"Merfolk (Ixalan)","s":"Plane Shift: Ixalan","a":{"CHA":1},"sz":"Medium","sp":30,"swim":30,"lang":["Common","Merfolk"],"lc":1,"tr":[["Amphibious","Breathe air and water."]],
  "subs":[{"n":"Green Merfolk","a":{"WIS":2},"tr":[["Mask of the Wild","Hide when only lightly obscured by natural phenomena."],["Cantrip","One druid cantrip, cast with Wisdom."]]},
   {"n":"Blue Merfolk","a":{"INT":2},"sk":["History","Nature"],"tr":[["Lore of the Waters","Proficiency in History and Nature."],["Cantrip","One wizard cantrip, cast with Intelligence."]]}]},
 {"n":"Merfolk (Zendikar)","s":"Plane Shift: Zendikar","a":{"CHA":1},"sz":"Medium","sp":30,"swim":30,"lang":["Common","Merfolk"],"lc":1,"tr":[["Amphibious","Breathe air and water."]],
  "subs":[{"n":"Emeria (Wind) Creed","a":{"WIS":2},"sk":["Deception","Persuasion"],"tr":[["Wind Creed","Proficiency in Deception and Persuasion, and one druid cantrip cast with Wisdom."]]},
   {"n":"Ula (Water) Creed","a":{"INT":2},"sk":["Survival"],"prof":{"tools":["Navigator's tools"]},"tr":[["Water Creed","Proficiency in Survival and navigator's tools, and one wizard cantrip cast with Intelligence."]]},
   {"n":"Cosi Creed","a":{"CHA":1,"INT":1},"sk":["Sleight of Hand","Stealth"],"tr":[["Creed of the Trickster","Proficiency in Sleight of Hand and Stealth, and one bard cantrip cast with Charisma."]]}]}]},
{"id":"naga","name":"Naga","group":"Plane Shift","tag":"setting","versions":[
 {"n":"Naga","s":"Plane Shift: Amonkhet","a":{"CON":2,"INT":1},"sz":"Medium","sp":30,"lang":["Common","Naga"],"imm":["poison"],"prof":{"tools":["Poisoner's kit"]},"tr":[
  ["Speed Burst","Bonus action with both hands free: +5 ft walking speed this turn."],
  ["Natural Weapons","Bite for 1d4 piercing plus a poison save, or constrict for 1d6 bludgeoning and a grapple."],
  ["Poison Immunity","Immune to poison damage and the poisoned condition."],["Poison Affinity","Proficiency with the poisoner's kit."]]}]},
{"id":"siren","name":"Siren","group":"Plane Shift","tag":"setting","versions":[
 {"n":"Siren","s":"Plane Shift: Ixalan","a":{"CHA":2},"sz":"Medium","sp":25,"fly":30,"lang":["Common","Siren"],"tr":[
  ["Flight","Flying speed 30 ft, not usable in medium or heavy armor."],["Siren's Song","Know the Friends cantrip, cast without components."]]}]},
{"id":"vampire","name":"Vampire","group":"Plane Shift","tag":"setting","versions":[
 {"n":"Vampire (Ixalan)","s":"Plane Shift: Ixalan","a":{"CHA":2},"ac":1,"sz":"Medium","sp":30,"dv":60,"lang":["Common","Vampire"],"res":["necrotic"],"tr":[
  ["Vampiric Resistance","Resistance to necrotic damage."],["Bloodthirst","Drain blood from a willing, grappled, incapacitated or restrained creature: 1 piercing + 1d6 necrotic, and you heal the necrotic damage."],
  ["Feast of Blood","After Bloodthirst, +10 ft speed and advantage on Strength and Dexterity checks and saves for 1 minute."]]},
 {"n":"Vampire (Zendikar)","s":"Plane Shift: Zendikar","a":{"INT":1,"CHA":2},"sz":"Medium","sp":30,"dv":60,"lang":["Common","Vampire"],"res":["necrotic"],"tr":[
  ["Vampiric Resistance","Resistance to necrotic damage."],["Blood Thirst","Drain blood from a willing, grappled, incapacitated or restrained creature; a humanoid killed this way rises as a null."]]}]},
{"id":"loxodon","name":"Loxodon","group":"Ravnica","tag":"setting","versions":[
 {"n":"Loxodon","s":GGR,"a":{"CON":2,"WIS":1},"sz":"Medium","sp":30,"lang":["Common","Loxodon"],"naturalACcon":12,"tr":[
  ["Powerful Build","Count as one size larger for carrying, pushing, dragging and lifting."],["Loxodon Serenity","Advantage on saves against being charmed or frightened."],
  ["Natural Armor","Unarmored AC is 12 + CON mod."],["Trunk","Grasp objects, lift 5 x your Strength score in pounds, and use it as a snorkel."],
  ["Keen Smell","Advantage on Perception, Survival and Investigation checks that involve smell."]]}]},
{"id":"simic-hybrid","name":"Simic Hybrid","group":"Ravnica","tag":"setting","versions":[
 {"n":"Simic Hybrid","s":GGR,"a":{"CON":2},"ac":1,"sz":"Medium","sp":30,"dv":60,"lang":["Common"],"lc":1,"pick":{"label":"Animal Enhancement (1st level)","from":["Manta Glide","Nimble Climber","Underwater Adaptation"]},"tr":[
  ["Animal Enhancement","At 1st level choose Manta Glide (slow falls), Nimble Climber (climbing speed) or Underwater Adaptation (swim speed and water breathing)."],
  ["Animal Enhancement (5th level)","At 5th level choose another 1st-level option or Grappling Appendages (1d6 natural weapons that grapple), Carapace (+1 AC without heavy armor) or Acid Spit (2d10 acid, 30 ft, Dexterity save)."]]}]},
{"id":"vedalken","name":"Vedalken","group":"Ravnica","tag":"setting","versions":[
 {"n":"Vedalken","s":GGR,"a":{"INT":2,"WIS":1},"sz":"Medium","sp":30,"lang":["Common","Vedalken"],"lc":1,"skc":{"n":1,"from":["Arcana","History","Investigation","Medicine","Performance","Sleight of Hand"]},"prof":{"tools":["One tool of your choice"]},"tr":[
  ["Vedalken Dispassion","Advantage on Intelligence, Wisdom and Charisma saving throws."],
  ["Tireless Precision","Proficiency in one listed skill and one tool; add d4 to checks with them."],["Partially Amphibious","Breathe underwater for 1 hour, once per long rest."]]},
 {"n":"Vedalken (Kaladesh)","s":"Plane Shift: Kaladesh","a":{"INT":2,"WIS":1},"sz":"Medium","sp":30,"lang":["Common","Vedalken"],"tr":[
  ["Vedalken Cunning","Advantage on Intelligence, Wisdom and Charisma saves against magic."],["Aether Lore","Double proficiency on History checks about magic items and aether-powered devices."]]}]},
{"id":"elf-astral","name":"Astral Elf","group":"Spelljammer","tag":"setting","versions":[
 {"n":"Astral Elf","s":SJ,"a":"flex","sz":"Medium","sp":30,"dv":60,"lang":["Common"],"lc":1,"sk":["Perception"],"tr":[
  ["Astral Fire","Know one of Dancing Lights, Light or Sacred Flame."],["Fey Ancestry","Advantage on saves against the charmed condition."],["Keen Senses","Proficiency in Perception."],
  ["Starlight Step","Bonus action: teleport 30 ft. Proficiency bonus uses per long rest."],
  ["Astral Trance","A 4-hour trance completes a long rest; afterwards gain one skill and one weapon or tool proficiency until your next long rest."]]}]},
{"id":"autognome","name":"Autognome","group":"Spelljammer","tag":"setting","versions":[
 {"n":"Autognome","s":SJ,"a":"flex","sz":"Small","sp":30,"lang":["Common"],"lc":1,"res":["poison"],"naturalAC":13,"prof":{"tools":["Two tools of your choice"]},"tr":[
  ["Armored Casing","Unarmored AC is 13 + DEX mod."],["Built for Success","Add d4 to an attack, check or save after rolling. Proficiency bonus uses per long rest."],
  ["Healing Machine","Mending lets you spend a Hit Die to heal, and healing spells work on you."],
  ["Mechanical Nature","Resistance to poison, immunity to disease, advantage on saves against paralysis and poison, and no need to eat, drink or breathe."],
  ["Sentry's Rest","Long rest by staying inactive but conscious for 6 hours."],["Specialized Design","Proficiency with two tools of your choice."]]}]},
{"id":"giff","name":"Giff","group":"Spelljammer","tag":"setting","versions":[
 {"n":"Giff","s":SJ,"a":"flex","sz":"Medium","sp":30,"swim":30,"lang":["Common"],"lc":1,"prof":{"weapons":["Firearms"]},"tr":[
  ["Astral Spark","Once per turn a weapon hit deals extra force damage equal to your proficiency bonus. Proficiency bonus uses per long rest."],
  ["Firearms Mastery","Proficiency with firearms; ignore their loading property and long-range disadvantage."],
  ["Hippo Build","Advantage on Strength checks and saves, and you count as one size larger for carrying."]]}]},
{"id":"hadozee","name":"Hadozee","group":"Spelljammer","tag":"setting","versions":[
 {"n":"Hadozee","s":SJ,"a":"flex","sz":"Small or Medium","sp":30,"climb":30,"lang":["Common"],"lc":1,"tr":[
  ["Dexterous Feet","Bonus action: use your feet to manipulate an object or open a door or container."],
  ["Glide","Reaction when you fall 10 ft: glide your walking speed horizontally and take no falling damage."],
  ["Hadozee Dodge","Reaction when damaged: reduce the damage by 1d6 + proficiency bonus. Proficiency bonus uses per long rest."]]}]},
{"id":"plasmoid","name":"Plasmoid","group":"Spelljammer","tag":"setting","versions":[
 {"n":"Plasmoid","s":SJ,"a":"flex","sz":"Small or Medium","sp":30,"dv":60,"lang":["Common"],"lc":1,"res":["acid","poison"],"tr":[
  ["Amorphous","Squeeze through 1-inch gaps when carrying nothing, and advantage on checks to start or escape a grapple."],["Hold Breath","Hold your breath for 1 hour."],
  ["Natural Resilience","Resistance to acid and poison, and advantage on saves against being poisoned."],
  ["Shape Self","Action: reshape your body with limbs and a head; bonus action to extend a 10-ft pseudopod."]]}]},
{"id":"thri-kreen","name":"Thri-kreen","group":"Spelljammer","tag":"setting","versions":[
 {"n":"Thri-kreen","s":SJ,"a":"flex","sz":"Small or Medium","sp":30,"dv":60,"lang":["Common"],"lc":1,"naturalAC":13,"tr":[
  ["Chameleon Carapace","Unarmored AC is 13 + DEX mod. Action: change color for advantage on Stealth checks to hide."],
  ["Secondary Arms","Two smaller arms can manipulate objects and wield light weapons."],["Sleepless","You don't need to sleep."],
  ["Thri-kreen Telepathy","Communicate telepathically with willing creatures within 120 ft."]]}]},
{"id":"leonin","name":"Leonin","group":"Theros","tag":"setting","versions":[
 {"n":"Leonin","s":"Mythic Odysseys of Theros","a":{"CON":2,"STR":1},"sz":"Medium","sp":35,"dv":60,"lang":["Common","Leonin"],"skc":{"n":1,"from":["Athletics","Intimidation","Perception","Survival"]},"tr":[
  ["Hunter's Instincts","Proficiency in one of Athletics, Intimidation, Perception, Survival."],["Claws","Unarmed strikes deal 1d4 + STR mod slashing."],
  ["Daunting Roar","Bonus action: creatures within 10 ft make a Wisdom save (DC 8 + proficiency + CON mod) or are frightened until the end of your next turn. Once per short or long rest."]]}]},
{"id":"glitchling-ua","name":"Glitchling (UA)","group":"Unearthed Arcana","tag":"ua","versions":[
 {"n":"Glitchling","s":"Unearthed Arcana: Wonders of the Multiverse","a":"flex","sz":"Medium","sp":30,"lang":["Common"],"lc":1,"naturalAC":14,"tr":[
  ["Armored Plating","Unarmored AC is 14 + DEX mod."],["Balance Chaos","Treat a roll of 9 or lower as 10 on an attack or save. Proficiency bonus uses per long rest."],
  ["Living Construct","Healing spells work on you despite your construct nature."],["Ordered Mind","Advantage on Insight checks and saves against the charmed condition."],
  ["Vestigial Wings","Flying speed equal to your walking speed until the end of your turn. Proficiency bonus uses per long rest."]]}]},
{"id":"revenant-ua","name":"Revenant (UA)","group":"Unearthed Arcana","tag":"ua","versions":[
 {"n":"Revenant","s":"Unearthed Arcana: Gothic Heroes","a":{"CON":1},"sz":"Medium","sp":30,"lang":["Common"],"lc":1,"tr":[
  ["Relentless Nature","You have a goal set with your DM. Until it is fulfilled you regain 1 HP per turn below half HP, return 24 hours after death, and sense those tied to your goal."]],
  "subs":[{"n":"Human Revenant","ac":2},{"n":"Dragonborn Revenant","a":{"STR":1,"CHA":1},"tr":[["Draconic Ancestry","Your breath weapon and resistance are necrotic."]]}]}]},
{"id":"viashino-ua","name":"Viashino (UA)","group":"Unearthed Arcana","tag":"ua","versions":[
 {"n":"Viashino","s":"Unearthed Arcana: Races of Ravnica","a":{"DEX":2,"STR":1},"sz":"Medium","sp":30,"lang":["Common","Draconic"],"skc":{"n":1,"from":["Acrobatics","Stealth"]},"tr":[
  ["Bite","Unarmed bite deals 1d4 + STR mod piercing."],["Lashing Tail","Reaction when a creature within 5 ft damages you in melee: tail strike for 1d4 + STR mod slashing."],
  ["Wiry Frame","Proficiency in Acrobatics or Stealth."]]}]}
);
})();
