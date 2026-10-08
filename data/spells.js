// Spell index from https://dnd5e.wikidot.com (CC BY-SA 3.0). Descriptions are not copied; each spell links to its wiki page.
// Row format: Name|level|casting time|range|duration|components
//   casting time: A = 1 action, B = 1 bonus action, R = 1 reaction; a trailing * marks a ritual
//   duration: I = instantaneous; a leading "C " marks concentration
window.DND = window.DND || {};
(function(){
var RAW = {
Abjuration:`Blade Ward|0|A|Self|1 round|V, S
Resistance|0|A|Touch|C 1 minute|V, S, M
Virtue (UA)|0|A|Touch|1 round|V, S
Absorb Elements|1|R|Self|1 round|S
Alarm|1|1 minute*|30 feet|8 hours|V, S, M
Armor of Agathys|1|A|Self|1 hour|V, S, M
Ceremony|1|1 hour*|Touch|I|V, S, M
Mage Armor|1|A|Touch|8 hours|V, S, M
Protection from Evil and Good|1|A|Touch|C 10 minutes|V, S, M
Sanctuary|1|B|30 feet|1 minute|V, S, M
Shield|1|R|Self|1 round|V, S
Shield of Faith|1|B|60 feet|C 10 minutes|V, S, M
Snare|1|1 minute|Touch|8 hours|S, M
Aid|2|A|30 feet|8 hours|V, S, M
Arcane Lock|2|A|Touch|Until dispelled|V, S, M
Digital Phantom (UA)|2|A|Self|C 1 hour|V, S, M
Lesser Restoration|2|A|Touch|I|V, S
Mental Barrier (UA)|2|R|Self|1 round|V
Pass without Trace|2|A|Self|C 1 hour|V, S, M
Protection from Poison|2|A|Touch|1 hour|V, S
Thought Shield (UA)|2|A|Touch|8 hours|V, S
Warding Bond|2|A|Touch|1 hour|V, S, M
Beacon of Hope|3|A|30 feet|C 1 minute|V, S
Counterspell|3|R|60 feet|I|S
Dispel Magic|3|A|120 feet|I|V, S
Glyph of Warding|3|1 hour|Touch|Until dispelled or triggered|V, S, M
Intellect Fortress|3|A|30 feet|C 1 hour|V
Magic Circle|3|1 minute|10 feet|1 hour|V, S, M
Nondetection|3|A|Touch|8 hours|V, S, M
Protection from Ballistics (UA)|3|A|Touch|C 10 minutes|V, S, M
Protection from Energy|3|A|Touch|C 1 hour|V, S
Remove Curse|3|A|Touch|I|V, S
Aura of Life|4|A|Self (30-foot radius)|C 10 minutes|V
Aura of Purity|4|A|Self (30-foot radius)|C 10 minutes|V
Banishment|4|A|60 feet|C 1 minute|V, S, M
Death Ward|4|A|Touch|8 hours|V, S
Freedom of Movement|4|A|Touch|1 hour|V, S, M
Gate Seal|4|1 minute|60 feet|24 hours|V, S, M
Mordenkainen's Private Sanctum|4|10 minutes|120 feet|24 hours|V, S, M
Stoneskin|4|A|Touch|C 1 hour|V, S, M
Antilife Shell|5|A|Self (10-foot radius)|C 1 hour|V, S
Banishing Smite|5|B|Self|C 1 minute|V
Circle of Power|5|A|Self (30-foot radius)|C 10 minutes|V
Dispel Evil and Good|5|A|Self|C 1 minute|V, S, M
Greater Restoration|5|A|Touch|I|V, S, M
Planar Binding|5|1 hour|60 feet|24 hours|V, S, M
Druid Grove|6|10 minutes|Touch|24 hours|V, S, M
Fizban's Platinum Shield|6|B|60 feet|C 1 minute|V, S, M
Forbiddance|6|10 minutes*|Touch|1 day|V, S, M
Globe of Invulnerability|6|A|Self (10-foot radius)|C 1 minute|V, S, M
Guards and Wards|6|10 minutes|Touch|24 hours|V, S, M
Primordial Ward|6|A|Self|C 1 minute|V, S
Symbol|7|1 minute|Touch|Until dispelled or triggered|V, S, M
Antimagic Field|8|A|Self (10-foot radius)|C 1 hour|V, S, M
Holy Aura|8|A|Self|C 1 minute|V, S, M
Mind Blank|8|A|Touch|24 hours|V, S
Imprisonment|9|1 minute|30 feet|Until dispelled|V, S, M
Invulnerability|9|A|Self|C 10 minutes|V, S, M
Prismatic Wall|9|A|60 feet|10 minutes|V, S`,
Conjuration:`Acid Splash|0|A|60 feet|I|V, S
Create Bonfire|0|A|60 feet|C 1 minute|V, S
Infestation|0|A|30 feet|I|V, S, M
Mage Hand|0|A|30 feet|1 minute|V, S
Poison Spray|0|A|10 feet|I|V, S
Produce Flame|0|A|Self|10 minutes|V, S
Sword Burst|0|A|Self (5-foot radius)|I|V
Arms of Hadar|1|A|Self (10-foot radius)|I|V, S
Ensnaring Strike|1|B|Self|C 1 minute|V
Entangle|1|A|90 feet|C 1 minute|V, S
Find Familiar|1|1 hour*|10 feet|I|V, S, M
Fog Cloud|1|A|120 feet|C 1 hour|V, S
Grease|1|A|60 feet|1 minute|V, S, M
Hail of Thorns|1|B|Self|C 1 minute|V
Healing Elixir (UA)|1|1 minute|Self|24 hours|V, S, M
Ice Knife|1|A|60 feet|I|S, M
Tenser's Floating Disk|1|A*|30 feet|1 hour|V, S, M
Unseen Servant|1|A*|60 feet|1 hour|V, S, M
Air Bubble|2|A|60 feet|24 hours|S
Cloud of Daggers|2|A|60 feet|C 1 minute|V, S, M
Dust Devil|2|A|60 feet|C 1 minute|V, S, M
Find Steed|2|10 minutes|30 feet|I|V, S
Find Vehicle (UA)|2|10 minutes|30 feet|8 hours|V, S
Flaming Sphere|2|A|60 feet|C 1 minute|V, S, M
Flock of Familiars|2|1 minute|Touch|C 1 hour|V, S
Healing Spirit|2|B|60 feet|C 1 minute|V, S
Misty Step|2|B|Self|I|V
Spray of Cards|2|A|Self (15-foot cone)|I|V, S, M
Summon Beast|2|A|90 feet|C 1 hour|V, S, M
Vortex Warp|2|A|90 feet|I|V, S
Web|2|A|60 feet|C 1 hour|V, S, M
Wristpocket|2|A*|Self|C 1 hour|S
Call Lightning|3|A|120 feet|C 10 minutes|V, S
Conjure Animals|3|A|60 feet|C 1 hour|V, S
Conjure Barrage|3|A|Self (60-foot cone)|I|V, S, M
Conjure Lesser Demon (UA)|3|A|60 feet|C 1 hour|V, S, M
Create Food and Water|3|A|30 feet|I|V, S
Galder's Tower|3|10 minutes|30 feet|24 hours|V, S, M
House of Cards (UA)|3|1 minute|Touch|24 hours|V, S, M
Hunger of Hadar|3|A|150 feet|C 1 minute|V, S, M
Sleet Storm|3|A|150 feet|C 1 minute|V, S, M
Spirit Guardians|3|A|Self (15-foot radius)|C 10 minutes|V, S, M
Stinking Cloud|3|A|90 feet|C 1 minute|V, S, M
Summon Fey|3|A|90 feet|C 1 hour|V, S, M
Summon Lesser Demons|3|A|60 feet|C 1 hour|V, S, M
Summon Shadowspawn|3|A|90 feet|C 1 hour|V, S, M
Summon Warrior Spirit (UA)|3|A|90 feet|C 1 hour|V, S, M
Thunder Step|3|A|90 feet|I|V
Tidal Wave|3|A|120 feet|I|V, S, M
Conjure Barlgura (UA)|4|A|60 feet|Up to 10 minutes|V, S
Conjure Knowbot (UA)|4|A|Touch|10 minutes|V, S
Conjure Minor Elementals|4|1 minute|90 feet|C 1 hour|V, S
Conjure Shadow Demon (UA)|4|A|60 feet|C 1 hour|V, S, M
Conjure Woodland Beings|4|A|60 feet|C 1 hour|V, S, M
Dimension Door|4|A|500 feet|I|V
Evard's Black Tentacles|4|A|90 feet|C 1 minute|V, S, M
Find Greater Steed|4|10 minutes|30 feet|I|V, S
Galder's Speedy Courier|4|A|10 feet|10 minutes|V, S, M
Grasping Vine|4|B|30 feet|C 1 minute|V, S
Guardian of Faith|4|A|30 feet|8 hours|V
Leomund's Secret Chest|4|A|Touch|I|V, S, M
Mordenkainen's Faithful Hound|4|A|30 feet|8 hours|V, S, M
Summon Aberration|4|A|90 feet|C 1 hour|V, S, M
Summon Construct|4|A|90 feet|C 1 hour|V, S, M
Summon Elemental|4|A|90 feet|C 1 hour|V, S, M
Summon Greater Demon|4|A|60 feet|C 1 hour|V, S, M
Watery Sphere|4|A|90 feet|C 1 minute|V, S, M
Cloudkill|5|A|120 feet|C 10 minutes|V, S
Conjure Elemental|5|1 minute|90 feet|C 1 hour|V, S, M
Conjure Volley|5|A|150 feet|I|V, S, M
Conjure Vrock (UA)|5|A|60 feet|C 1 hour|V, S, M
Far Step|5|B|Self|C 1 minute|V
Infernal Calling|5|1 minute|90 feet|C 1 hour|V, S, M
Insect Plague|5|A|300 feet|C 10 minutes|V, S, M
Steel Wind Strike|5|A|30 feet|I|S, M
Summon Celestial|5|A|90 feet|C 1 hour|V, S, M
Summon Draconic Spirit|5|A|60 feet|C 1 hour|V, S, M
Teleportation Circle|5|1 minute|10 feet|1 round|V, M
Tree Stride|5|A|Self|C 1 minute|V, S
Arcane Gate|6|A|500 feet|C 10 minutes|V, S
Conjure Fey|6|1 minute|90 feet|C 1 hour|V, S
Drawmij's Instant Summons|6|1 minute*|Touch|Until dispelled|V, S, M
Heroes' Feast|6|10 minutes|30 feet|I|V, S, M
Planar Ally|6|10 minutes|60 feet|I|V, S
Scatter|6|A|30 feet|I|V
Summon Fiend|6|A|90 feet|C 1 hour|V, S, M
Transport via Plants|6|A|10 feet|1 round|V, S
Wall of Thorns|6|A|120 feet|C 10 minutes|V, S, M
Word of Recall|6|A|5 feet|I|V
Conjure Celestial|7|1 minute|90 feet|C 1 hour|V, S
Conjure Hezrou (UA)|7|A|60 feet|C 1 hour|V, S, M
Dream of the Blue Veil|7|10 minutes|20 feet|6 hours|V, S, M
Mordenkainen's Magnificent Mansion|7|1 minute|300 feet|24 hours|V, S, M
Plane Shift|7|A|Touch|I|V, S, M
Teleport|7|A|10 feet|I|V
Temple of the Gods|7|1 hour|120 feet|24 hours|V, S, M
Demiplane|8|A|60 feet|1 hour|S
Incendiary Cloud|8|A|150 feet|C 1 minute|V, S
Maze|8|A|60 feet|C 10 minutes|V, S
Mighty Fortress|8|1 minute|1 mile|I|V, S, M
Reality Break|8|A|60 feet|C 1 minute|V, S, M
Tsunami|8|1 minute|Sight|C 6 rounds|V, S
Blade of Disaster|9|B|60 feet|C 1 minute|V, S
Gate|9|A|60 feet|C 1 minute|V, S, M
Storm of Vengeance|9|A|Sight|C 1 minute|V, S
Wish|9|A|Self|I|V`,
Divination:`Guidance|0|A|Touch|C 1 minute|V, S
True Strike|0|A|30 feet|C 1 round|S
Beast Bond|1|A|Touch|C 10 minutes|V, S, M
Comprehend Languages|1|A*|Self|1 hour|V, S, M
Detect Evil and Good|1|A|Self|C 10 minutes|V, S
Detect Magic|1|A*|Self|C 10 minutes|V, S
Detect Poison and Disease|1|A*|Self|C 10 minutes|V, S, M
Gift of Alacrity|1|1 minute|Touch|8 hours|V, S
Guiding Hand (UA)|1|1 minute*|5 feet|C 8 hours|V, S
Hunter's Mark|1|B|90 feet|C 1 hour|V
Identify|1|1 minute*|Touch|I|V, S, M
Infallible Relay (UA)|1|1 minute|Self|C 10 minutes|V, S, M
Sense Emotion (UA)|1|A|Self|C 1 minute|V, S
Speak with Animals|1|A*|Self|10 minutes|V, S
Augury|2|1 minute*|Self|I|V, S, M
Beast Sense|2|A*|Touch|C 1 hour|S
Borrowed Knowledge|2|A|Self|1 hour|V, S, M
Detect Thoughts|2|A|Self|C 1 minute|V, S, M
Find Traps|2|A|120 feet|I|V, S
Fortune's Favor|2|1 minute|60 feet|1 hour|V, S, M
Locate Animals or Plants|2|A*|Self|I|V, S, M
Locate Object|2|A|Self|C 10 minutes|V, S, M
Mind Spike|2|A|60 feet|C 1 hour|S
See Invisibility|2|A|Self|1 hour|V, S, M
Warp Sense|2|A|Self|C 1 minute|V, S, M
Clairvoyance|3|10 minutes|1 mile|C 10 minutes|V, S, M
Tongues|3|A|Touch|1 hour|V, M
Arcane Eye|4|A|30 feet|C 1 hour|V, S, M
Divination|4|A*|Self|I|V, S, M
Locate Creature|4|A|Self|C 1 hour|V, S, M
Commune|5|1 minute*|Self|1 minute|V, S, M
Commune with City (UA)|5|1 minute*|Self|I|V, S
Commune with Nature|5|1 minute*|Self|I|V, S
Contact Other Plane|5|1 minute*|Self|1 minute|V
Legend Lore|5|10 minutes|Self|I|V, S, M
Rary's Telepathic Bond|5|A*|30 feet|1 hour|V, S, M
Scrying|5|10 minutes|Self|C 10 minutes|V, S, M
Find the Path|6|1 minute|Self|C 1 day|V, S, M
True Seeing|6|A|Touch|1 hour|V, S, M
Foresight|9|1 minute|Touch|8 hours|V, S, M`,
Enchantment:`Encode Thoughts|0|A|Self|8 hours|S
Friends|0|A|Self|C 1 minute|S, M
Mind Sliver|0|A|60 feet|1 round|V
Vicious Mockery|0|A|60 feet|I|V
Animal Friendship|1|A|30 feet|24 hours|V, S, M
Bane|1|A|30 feet|C 1 minute|V, S, M
Bless|1|A|30 feet|C 1 minute|V, S, M
Charm Person|1|A|30 feet|1 hour|V, S
Command|1|A|60 feet|1 round|V
Compelled Duel|1|B|30 feet|C 1 minute|V
Dissonant Whispers|1|A|60 feet|I|V
Heroism|1|A|Touch|C 1 minute|V, S
Hex|1|B|90 feet|C 1 hour|V, S, M
Id Insinuation (UA)|1|A|60 feet|C 1 minute|V, S
Puppet (UA)|1|A|120 feet|I|V
Silvery Barbs|1|R|60 feet|I|V
Sleep|1|A|90 feet|1 minute|V, S, M
Sudden Awakening (UA)|1|B|10 feet|I|V
Tasha's Hideous Laughter|1|A|30 feet|C 1 minute|V, S, M
Animal Messenger|2|A*|30 feet|24 hours|V, S, M
Calm Emotions|2|A|60 feet|C 1 minute|V, S
Crown of Madness|2|A|120 feet|C 1 minute|V, S
Enthrall|2|A|60 feet|1 minute|V, S
Gift of Gab|2|R|Self|I|V, S, M
Hold Person|2|A|60 feet|C 1 minute|V, S, M
Jim's Glowing Coin|2|A|60 feet|1 minute|S, M
Mind Thrust (UA)|2|B|60 feet|1 round|V, S
Suggestion|2|A|30 feet|C 8 hours|V, M
Tasha's Mind Whip|2|A|90 feet|1 round|V
Zone of Truth|2|A|60 feet|10 minutes|V, S
Antagonize|3|A|30 feet|I|V, S, M
Catnap|3|A|30 feet|10 minutes|S, M
Enemies Abound|3|A|120 feet|C 1 minute|V, S
Fast Friends|3|A|30 feet|C 1 hour|V
Haywire (UA)|3|A|90 feet|C 1 minute|V, S
Incite Greed|3|A|30 feet|C 1 minute|V, S, M
Motivational Speech|3|1 minute|60 feet|1 hour|V
Charm Monster|4|A|30 feet|1 hour|V, S
Compulsion|4|A|30 feet|C 1 minute|V, S
Confusion|4|A|90 feet|C 1 minute|V, S, M
Dominate Beast|4|A|60 feet|C 1 minute|V, S
Ego Whip (UA)|4|A|30 feet|C 1 minute|V
Raulothim's Psychic Lance|4|A|120 feet|I|V
Synchronicity (UA)|4|A|Touch|C 1 hour|V, S
Dominate Person|5|A|60 feet|C 1 minute|V, S
Geas|5|1 minute|60 feet|30 days|V
Hold Monster|5|A|90 feet|C 1 minute|V, S, M
Modify Memory|5|A|30 feet|C 1 minute|V, S
Synaptic Static|5|A|120 feet|I|V, S
Mass Suggestion|6|A|60 feet|24 hours|V, M
Otto's Irresistible Dance|6|A|30 feet|C 1 minute|V
Psychic Crush (UA)|6|A|60 feet|1 minute|V, S
Power Word: Pain|7|A|60 feet|I|V
Antipathy/Sympathy|8|1 hour|60 feet|10 days|V, S, M
Dominate Monster|8|A|60 feet|C 1 hour|V, S
Feeblemind|8|A|150 feet|I|V, S, M
Power Word: Stun|8|A|60 feet|I|V
Power Word: Kill|9|A|60 feet|I|V
Psychic Scream|9|A|90 feet|I|S`,
Evocation:`Booming Blade|0|A|Self (5-foot radius)|1 round|S, M
Dancing Lights|0|A|120 feet|C 1 minute|V, S, M
Eldritch Blast|0|A|120 feet|I|V, S
Fire Bolt|0|A|120 feet|I|V, S
Frostbite|0|A|60 feet|I|V, S
Green-Flame Blade|0|A|Self (5-foot radius)|I|S, M
Hand of Radiance (UA)|0|A|5 feet|I|V, S
Light|0|A|Touch|1 hour|V, M
Lightning Lure|0|A|Self (15-foot radius)|I|V
Ray of Frost|0|A|60 feet|I|V, S
Sacred Flame|0|A|60 feet|I|V, S
Shocking Grasp|0|A|Touch|I|V, S
Thunderclap|0|A|Self (5-foot radius)|I|S
Word of Radiance|0|A|5 feet|I|V, M
Acid Stream (UA)|1|A|Self (30-foot line)|C 1 minute|V, S, M
Burning Hands|1|A|Self (15-foot cone)|I|V, S
Chaos Bolt|1|A|120 feet|I|V, S
Chromatic Orb|1|A|90 feet|I|V, S, M
Cure Wounds|1|A|Touch|I|V, S
Divine Favor|1|B|Self|C 1 minute|V, S
Earth Tremor|1|A|Self (10-foot radius)|I|V, S
Faerie Fire|1|A|60 feet|C 1 minute|V
Frost Fingers|1|A|Self (15-foot cone)|I|V, S
Guiding Bolt|1|A|120 feet|1 round|V, S
Healing Word|1|B|60 feet|I|V
Hellish Rebuke|1|R|60 feet|I|V, S
Jim's Magic Missile|1|A|120 feet|I|V, S, M
Magic Missile|1|A|120 feet|I|V, S
Searing Smite|1|B|Self|C 1 minute|V
Tasha's Caustic Brew|1|A|Self (30-foot line)|C 1 minute|V, S, M
Thunderous Smite|1|B|Self|C 1 minute|V
Thunderwave|1|A|Self (15-foot cube)|I|V, S
Witch Bolt|1|A|30 feet|C 1 minute|V, S, M
Wrathful Smite|1|B|Self|C 1 minute|V
Aganazzar's Scorcher|2|A|30 feet|I|V, S, M
Branding Smite|2|B|Self|C 1 minute|V
Continual Flame|2|A|Touch|Until dispelled|V, S, M
Darkness|2|A|60 feet|C 10 minutes|V, M
Flame Blade|2|B|Self|C 10 minutes|V, S, M
Gust of Wind|2|A|Self (60-foot line)|C 1 minute|V, S, M
Icingdeath's Frost (UA)|2|A|Self (15-foot cone)|I|S, M
Melf's Acid Arrow|2|A|90 feet|I|V, S, M
Moonbeam|2|A|120 feet|C 1 minute|V, S, M
Prayer of Healing|2|10 minutes|30 feet|I|V
Rime's Binding Ice|2|A|Self (30-foot cone)|I|S, M
Scorching Ray|2|A|120 feet|I|V, S
Shatter|2|A|60 feet|I|V, S, M
Snilloc's Snowball Swarm|2|A|90 feet|I|V, S, M
Spiritual Weapon|2|B|60 feet|1 minute|V, S
Warding Wind|2|A|Self|C 10 minutes|V
Aura of Vitality|3|A|Self (30-foot radius)|C 1 minute|V
Blinding Smite|3|B|Self|C 1 minute|V
Crusader's Mantle|3|A|Self|C 1 minute|V
Daylight|3|A|60 feet|1 hour|V, S
Fireball|3|A|150 feet|I|V, S, M
Leomund's Tiny Hut|3|1 minute*|Self (10-foot radius)|8 hours|V, S, M
Lightning Bolt|3|A|Self (100-foot line)|I|V, S, M
Mass Healing Word|3|B|60 feet|I|V
Melf's Minute Meteors|3|A|Self|C 10 minutes|V, S, M
Psionic Blast (UA)|3|A|Self (30-foot cone)|I|V
Pulse Wave|3|A|Self (30-foot cone)|I|V, S
Sending|3|A|Unlimited|1 round|V, S, M
Wall of Sand|3|A|90 feet|C 10 minutes|V, S, M
Wall of Water|3|A|60 feet|C 10 minutes|V, S, M
Wind Wall|3|A|120 feet|C 1 minute|V, S, M
Fire Shield|4|A|Self|10 minutes|V, S, M
Gravity Sinkhole|4|A|120 feet|I|V, S, M
Ice Storm|4|A|300 feet|I|V, S, M
Otiluke's Resilient Sphere|4|A|30 feet|C 1 minute|V, S, M
Sickening Radiance|4|A|120 feet|C 10 minutes|V, S
Staggering Smite|4|B|Self|C 1 minute|V
Storm Sphere|4|A|150 feet|C 1 minute|V, S
Vitriolic Sphere|4|A|150 feet|I|V, S, M
Wall of Fire|4|A|120 feet|C 1 minute|V, S, M
Bigby's Hand|5|A|120 feet|C 1 minute|V, S, M
Cone of Cold|5|A|Self (60-foot cone)|I|V, S, M
Dawn|5|A|60 feet|C 1 minute|V, S, M
Destructive Wave|5|A|Self (30-foot radius)|I|V
Flame Strike|5|A|60 feet|I|V, S, M
Hallow|5|24 hours|Touch|Until dispelled|V, S, M
Holy Weapon|5|B|Touch|C 1 hour|V, S
Immolation|5|A|90 feet|C 1 minute|V
Maelstrom|5|A|120 feet|C 1 minute|V, S, M
Mass Cure Wounds|5|A|60 feet|I|V, S
Wall of Force|5|A|120 feet|C 10 minutes|V, S, M
Wall of Light|5|A|120 feet|C 10 minutes|V, S, M
Wall of Stone|5|A|120 feet|C 10 minutes|V, S, M
Wrath of Nature|5|A|120 feet|C 1 minute|V, S
Blade Barrier|6|A|90 feet|C 10 minutes|V, S
Chain Lightning|6|A|150 feet|I|V, S, M
Contingency|6|10 minutes|Self|10 days|V, S, M
Gravity Fissure|6|A|Self (100-foot line)|I|V, S, M
Heal|6|A|60 feet|I|V, S
Otiluke's Freezing Sphere|6|A|300 feet|I|V, S, M
Sunbeam|6|A|Self (60-foot line)|C 1 minute|V, S, M
Wall of Ice|6|A|120 feet|C 10 minutes|V, S, M
Crown of Stars|7|A|Self|1 hour|V, S
Delayed Blast Fireball|7|A|150 feet|C 1 minute|V, S, M
Divine Word|7|B|30 feet|I|V
Fire Storm|7|A|150 feet|I|V, S
Forcecage|7|A|100 feet|1 hour|V, S, M
Mordenkainen's Sword|7|A|60 feet|C 1 minute|V, S, M
Prismatic Spray|7|A|Self (60-foot cone)|I|V, S
Whirlwind|7|A|300 feet|C 1 minute|V, M
Dark Star|8|A|150 feet|C 1 minute|V, S, M
Earthquake|8|A|500 feet|C 1 minute|V, S, M
Maddening Darkness|8|A|150 feet|C 10 minutes|V, M
Sunburst|8|A|150 feet|I|V, S, M
Telepathy|8|A|Unlimited|24 hours|V, S, M
Mass Heal|9|A|60 feet|I|V, S
Meteor Swarm|9|A|1 mile|I|V, S
Power Word: Heal|9|A|Touch|I|V, S
Ravenous Void|9|A|1,000 feet|C 1 minute|V, S, M`,
Illusion:`Minor Illusion|0|A|30 feet|1 minute|S, M
Color Spray|1|A|Self (15-foot cone)|1 round|V, S, M
Disguise Self|1|A|Self|1 hour|V, S
Distort Value|1|1 minute|Touch|8 hours|V
Illusory Script|1|1 minute*|Touch|10 days|S, M
Silent Image|1|A|60 feet|C 10 minutes|V, S, M
Unearthly Chorus (UA)|1|A|Self (30-foot radius)|C 10 minutes|V
Blur|2|A|Self|C 1 minute|V
Invisibility|2|A|Touch|C 1 hour|V, S, M
Magic Mouth|2|1 minute*|30 feet|Until dispelled|V, S, M
Mirror Image|2|A|Self|1 minute|V, S
Nathair's Mischief|2|A|60 feet|C 1 minute|S, M
Nystul's Magic Aura|2|A|Touch|24 hours|V, S, M
Phantasmal Force|2|A|60 feet|C 1 minute|V, S, M
Shadow Blade|2|B|Self|C 1 minute|V, S
Silence|2|A*|120 feet|C 10 minutes|V, S
Fear|3|A|Self (30-foot cone)|C 1 minute|V, S, M
Hypnotic Pattern|3|A|120 feet|C 1 minute|S, M
Invisibility to Cameras (UA)|3|A|10 feet|C 1 minute|V, S, M
Major Image|3|A|120 feet|C 10 minutes|V, S, M
Phantom Steed|3|1 minute*|30 feet|1 hour|V, S
Greater Invisibility|4|A|Touch|C 1 minute|V, S
Hallucinatory Terrain|4|10 minutes|300 feet|24 hours|V, S, M
Phantasmal Killer|4|A|120 feet|C 1 minute|V, S
Creation|5|1 minute|30 feet|Special|V, S, M
Dream|5|1 minute|Special|8 hours|V, S, M
Mislead|5|A|Self|C 1 hour|S
Seeming|5|A|30 feet|8 hours|V, S
Mental Prison|6|A|60 feet|C 1 minute|S
Programmed Illusion|6|A|120 feet|Until dispelled|V, S, M
Mirage Arcane|7|10 minutes|Sight|10 days|V, S
Project Image|7|A|500 miles|C 1 day|V, S, M
Simulacrum|7|12 hours|Touch|Until dispelled|V, S, M
Illusory Dragon|8|A|120 feet|C 1 minute|S
Weird|9|A|120 feet|C 1 minute|V, S`,
Necromancy:`Chill Touch|0|A|120 feet|1 round|V, S
Sapping Sting|0|A|30 feet|I|V, S
Spare the Dying|0|A|Touch|I|V, S
Toll the Dead|0|A|60 feet|I|V, S
Cause Fear|1|A|60 feet|C 1 minute|V
False Life|1|A|Self|1 hour|V, S, M
Inflict Wounds|1|A|Touch|I|V, S
Ray of Sickness|1|A|60 feet|I|V, S
Blindness/Deafness|2|A|30 feet|1 minute|V
Gentle Repose|2|A*|Touch|10 days|V, S, M
Ray of Enfeeblement|2|A|60 feet|C 1 minute|V, S
Wither and Bloom|2|A|60 feet|I|V, S, M
Animate Dead|3|1 minute|10 feet|I|V, S, M
Bestow Curse|3|A|Touch|C 1 minute|V, S
Feign Death|3|A*|Touch|1 hour|V, S, M
Life Transference|3|A|30 feet|I|V, S
Revivify|3|A|Touch|I|V, S, M
Speak with Dead|3|A|10 feet|10 minutes|V, S, M
Spirit Shroud|3|B|Self|C 1 minute|V, S
Summon Undead|3|A|90 feet|C 1 hour|V, S, M
Vampiric Touch|3|A|Self|C 1 minute|V, S
Blight|4|A|30 feet|I|V, S
Shadow of Moil|4|A|Self|C 1 minute|V, S, M
Spirit of Death|4|A|60 feet|C 1 hour|V, S, M
Contagion|5|A|Touch|7 days|V, S
Danse Macabre|5|A|60 feet|C 1 hour|V, S
Enervation|5|A|60 feet|C 1 minute|V, S
Negative Energy Flood|5|A|60 feet|I|V, M
Raise Dead|5|1 hour|Touch|I|V, S, M
Circle of Death|6|A|150 feet|I|V, S, M
Create Undead|6|1 minute|10 feet|I|V, S, M
Eyebite|6|A|Self|C 1 minute|V, S
Harm|6|A|60 feet|I|V, S
Magic Jar|6|1 minute|Self|Until dispelled|V, S, M
Soul Cage|6|R|60 feet|8 hours|V, S, M
Finger of Death|7|A|60 feet|I|V, S
Resurrection|7|1 hour|Touch|I|V, S, M
Tether Essence|7|A|60 feet|C 1 hour|V, S, M
Abi-Dalzim's Horrid Wilting|8|A|150 feet|I|V, S, M
Clone|8|1 hour|Touch|I|V, S, M
Astral Projection|9|1 hour|10 feet|Special|V, S, M
Time Ravage|9|A|90 feet|I|V, S, M
True Resurrection|9|1 hour|Touch|I|V, S, M`,
Transmutation:`Control Flames|0|A|60 feet|I or 1 hour|S
Druidcraft|0|A|30 feet|I|V, S
Gust|0|A|30 feet|I|V, S
Magic Stone|0|B|Touch|1 minute|V, S
Mending|0|1 minute|Touch|I|V, S, M
Message|0|A|120 feet|1 round|V, S, M
Mold Earth|0|A|30 feet|I or 1 hour|S
On/Off (UA)|0|A|60 feet|I|V, S
Prestidigitation|0|A|10 feet|Up to 1 hour|V, S
Primal Savagery|0|A|Self|I|S
Shape Water|0|A|30 feet|I or 1 hour|S
Shillelagh|0|B|Touch|1 minute|V, S, M
Thaumaturgy|0|A|30 feet|Up to 1 minute|V
Thorn Whip|0|A|30 feet|I|V, S, M
Arcane Weapon (UA)|1|B|Self|C 1 hour|V, S
Catapult|1|A|60 feet|I|S
Create or Destroy Water|1|A|30 feet|I|V, S, M
Expeditious Retreat|1|B|Self|C 10 minutes|V, S
Feather Fall|1|R|60 feet|1 minute|V, M
Goodberry|1|A|Touch|I|V, S, M
Jump|1|A|Touch|1 minute|V, S, M
Longstrider|1|A|Touch|1 hour|V, S, M
Magnify Gravity|1|A|60 feet|1 round|V, S
Purify Food and Drink|1|A*|10 feet|I|V, S
Remote Access (UA)|1|A|120 feet|10 minutes|V, S
Wild Cunning (UA)|1|A*|120 feet|I|V, S
Zephyr Strike|1|B|Self|C 1 minute|V
Alter Self|2|A|Self|C 1 hour|V, S
Arcane Hacking (UA)|2|A|Self|C 1 hour|V, S, M
Barkskin|2|A|Touch|C 1 hour|V, S, M
Cordon of Arrows|2|A|5 feet|8 hours|V, S, M
Darkvision|2|A|Touch|8 hours|V, S, M
Dragon's Breath|2|B|Touch|C 1 minute|V, S, M
Earthbind|2|A|300 feet|C 1 minute|V
Enhance Ability|2|A|Touch|C 1 hour|V, S, M
Enlarge/Reduce|2|A|30 feet|C 1 minute|V, S, M
Heat Metal|2|A|60 feet|C 1 minute|V, S, M
Immovable Object|2|A|Touch|1 hour|V, S, M
Kinetic Jaunt|2|B|Self|C 1 minute|S
Knock|2|A|60 feet|I|V
Levitate|2|A|60 feet|C 10 minutes|V, S, M
Magic Weapon|2|B|Touch|C 1 hour|V, S
Maximilian's Earthen Grasp|2|A|30 feet|C 1 minute|V, S, M
Pyrotechnics|2|A|60 feet|I|V, S
Rope Trick|2|A|Touch|1 hour|V, S, M
Skywrite|2|A*|Sight|C 1 day|V, S
Spider Climb|2|A|Touch|C 1 hour|V, S, M
Spike Growth|2|A|150 feet|C 10 minutes|V, S, M
Ashardalon's Stride|3|B|Self|C 1 minute|V, S
Blink|3|A|Self|1 minute|V, S
Elemental Weapon|3|A|Touch|C 1 hour|V, S
Erupting Earth|3|A|120 feet|I|V, S, M
Flame Arrows|3|A|Touch|C 1 hour|V, S
Flame Stride (UA)|3|B|Self|C 1 minute|V, S
Fly|3|A|Touch|C 10 minutes|V, S, M
Gaseous Form|3|A|Touch|C 1 hour|V, S, M
Haste|3|A|30 feet|C 1 minute|V, S, M
Lightning Arrow|3|B|Self|C 1 minute|V, S
Meld into Stone|3|A*|Touch|8 hours|V, S
Plant Growth|3|A or 8 hours|150 feet|I|V, S
Slow|3|A|120 feet|C 1 minute|V, S, M
Speak with Plants|3|A|Self (30-foot radius)|10 minutes|V, S
Tiny Servant|3|1 minute|Touch|8 hours|V, S
Water Breathing|3|A*|30 feet|24 hours|V, S, M
Water Walk|3|A*|30 feet|1 hour|V, S, M
Control Water|4|A|300 feet|C 10 minutes|V, S, M
Elemental Bane|4|A|90 feet|C 1 minute|V, S
Fabricate|4|10 minutes|120 feet|I|V, S
Giant Insect|4|A|30 feet|C 10 minutes|V, S
Guardian of Nature|4|B|Self|C 1 minute|V
Polymorph|4|A|60 feet|C 1 hour|V, S, M
Stone Shape|4|A|Touch|I|V, S, M
System Backdoor (UA)|4|1 minute|Self|C 1 hour|V, S, M
Animate Objects|5|A|120 feet|C 1 minute|V, S
Awaken|5|8 hours|Touch|I|V, S, M
Control Winds|5|A|300 feet|C 1 hour|V, S
Create Spelljamming Helm|5|A|Touch|I|V, S, M
Passwall|5|A|30 feet|1 hour|V, S, M
Reincarnate|5|1 hour|Touch|I|V, S, M
Shutdown (UA)|5|A|120 feet|C 1 minute|V, S
Skill Empowerment|5|A|Touch|C 1 hour|V, S
Swift Quiver|5|B|Touch|C 1 minute|V, S, M
Telekinesis|5|A|60 feet|C 10 minutes|V, S
Temporal Shunt|5|R|120 feet|1 round|V, S
Transmute Rock|5|A|120 feet|I|V, S, M
Bones of the Earth|6|A|120 feet|I|V, S
Create Homunculus|6|1 hour|Touch|I|V, S, M
Disintegrate|6|A|60 feet|I|V, S, M
Flesh to Stone|6|A|60 feet|C 1 minute|V, S, M
Investiture of Flame|6|A|Self|C 10 minutes|V, S
Investiture of Ice|6|A|Self|C 10 minutes|V, S
Investiture of Stone|6|A|Self|C 10 minutes|V, S
Investiture of Wind|6|A|Self|C 10 minutes|V, S
Move Earth|6|A|120 feet|C 2 hours|V, S, M
Otherworldly Form (UA)|6|A|Self|C 1 minute|V, S, M
Tasha's Otherworldly Guise|6|B|Self|C 1 minute|V, S, M
Tenser's Transformation|6|A|Self|C 10 minutes|V, S, M
Wind Walk|6|1 minute|30 feet|8 hours|V, S, M
Create Magen|7|1 hour|Touch|I|V, S, M
Draconic Transformation|7|B|Self|C 1 minute|V, S, M
Etherealness|7|A|Self|Up to 8 hours|V, S
Regenerate|7|1 minute|Touch|1 hour|V, S, M
Reverse Gravity|7|A|100 feet|C 1 minute|V, S, M
Sequester|7|A|Touch|Until dispelled|V, S, M
Animal Shapes|8|A|30 feet|C 24 hours|V, S
Control Weather|8|10 minutes|Self (5-mile radius)|C 8 hours|V, S, M
Glibness|8|A|Self|1 hour|V
Mass Polymorph|9|A|120 feet|C 1 hour|V, S, M
Shapechange|9|A|Self|C 1 hour|V, S, M
Time Stop|9|A|Self|I|V
True Polymorph|9|A|30 feet|C 1 hour|V, S, M`
};
var T={A:"1 action",B:"1 bonus action",R:"1 reaction"};
var SLUGS={"House of Cards (UA)":"house-of-cards-ua","Guiding Hand (UA)":"guiding-hand-ua","Maximilian's Earthen Grasp":"maximillians-earthen-grasp"};
DND.spells={};
Object.keys(RAW).forEach(function(school){
  RAW[school].split("\n").forEach(function(line){
    var p=line.split("|"); if(p.length<6) return;
    var time=p[2], ritual=false;
    if(time.slice(-1)==="*"){ritual=true;time=time.slice(0,-1);}
    time=T[time]||time.replace(/^A or/,"1 action or");
    var dur=p[4], conc=false;
    if(dur.indexOf("C ")===0){conc=true;dur="Up to "+dur.slice(2);}
    dur=dur.replace(/^I\b/,"Instantaneous");
    var slug=p[0].toLowerCase().replace(/ \(ua\)$/,"").replace(/['’:]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
    DND.spells[p[0]]={name:p[0],level:+p[1],school:school,time:time,ritual:ritual,range:p[3],duration:dur,conc:conc,comp:p[5],
      tag:/\(UA\)$/.test(p[0])?"ua":"official",url:"https://dnd5e.wikidot.com/spell:"+(SLUGS[p[0]]||slug)};
  });
});
})();
