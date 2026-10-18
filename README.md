# Character Forge

A self-hosted D&D 5e character builder. Static site: no build step, no dependencies, no accounts.

## Run it

- **Simplest:** open `index.html` in a browser.
- **Local server:** `node server.js` (or `node server.js 3000`), then visit http://localhost:8080.
- **Any static host:** copy the folder to nginx, Caddy, Apache, GitHub Pages, a NAS… e.g. nginx: `root /srv/character-forge; index index.html;`

Characters are saved in the browser's localStorage. Use **Export** / **Import** (JSON) to back up or move them.

### Import from 5th Spellbook

**Import** also accepts a backup from the *5th Spellbook* Android app (the file its backup feature saves, for example to Google Drive).
Pick the characters you want. Each one can come in as a **new character**, or **update a character you already made** (picked automatically when the names match): tick the parts to bring in (lineage, class, abilities and feats, background, spells, armour and weapons, items and coins, picture, details and notes); everything else stays as it is. A new character comes in with its race and subrace (dragon ancestry, tiefling bloodline…), classes with levels and subclasses (and variants such as the Genie's kind), and the spells of each class.
The spellcasting ability is set from the modifier saved in the backup; other ability scores aren't in the backup and start at 10.
Spells that aren't on that class's list in this app, or go past the class's limit, are written into the character's notes instead.
On the **Spells** step, **Import spells from 5th Spellbook** does the same for the character you are editing only: pick the backup (and, if it has several characters, whose spells to use) and only that character's spells change.
The backup is read in the browser by `js/sqlite-read.js` (a small read-only SQLite reader), so nothing is uploaded anywhere.

### Import from 5e Companion

**Import** also accepts a character shared from the *5e Companion App* (its "share character" file, plain JSON).
It comes in complete: race, background, alignment, classes with levels and subclasses, ability scores (the exact totals), skills, languages, tools,
feats, worn armour and shield, weapons, inventory, coins, personality, notes, spells and the character's picture.
5e Companion only stores final ability scores, so ability improvement choices are filled in to match those totals.
Anything with no match here (a homebrew item, a skill from a house rule) is listed in Details → Other notes.
As with 5th Spellbook, a shared character can instead **only update the spells** of a character you already have, and the Spells step's import button accepts these files too.

### Import one part at a time

Every step (Lineage, Class, Abilities, Background, Spells, Equipment, Items, Appearance, Details) has its own **Import** button that changes only that part of the
character you are editing, from a 5e Companion character (all parts) or a 5th Spellbook backup (lineage, classes, spells). Imported ability scores land on the
file's exact totals with your own lineage and feats counted.

### Dice roller

The round red button at the bottom right opens a 3D dice roller on a wooden table: pick any mix of d4, d6, d8, d10, d12, d20 and d100 (a real 100-sided die; its result face is ringed in gold) plus a bonus, then Roll.
The dice tumble and land showing their result; the total and each die are shown at the top (a single d20 also flags a natural 20 or 1). Tap the table to roll the same dice again. Once the dice have landed you can pick one up: drag it and let go with a flick to throw it again (only that die is re-rolled), drag slowly to just move it, or tap it for a little toss. ✕/Back closes.
Five dice colours; your last choice is remembered. Results come from the browser's secure random source; the animation is drawn by `js/dice3d.js` (no library), and it works offline.

### Share from 5e Companion

Once Character Forge is installed as an app on Android, it appears in the share menu: in 5e Companion, share a character and pick Character Forge,
and the import opens by itself (the file is handed over through the service worker, `share_target` in `manifest.webmanifest`). iPhone and iPad don't support sharing into web apps; save the file and use Import there.

### Limits and extras

Details → **Limits and extras**, per character: switch off the spell maximum (add as many spells as you like, still from your own class lists), the ability score maximum of 20 (up to 30),
and the worked-out hit points (set your own maximum). Attunement is never blocked: going past the usual limit only shows a reminder. add extra bonuses (each ability score, AC, hit points, speed, initiative,
passive Perception, spell save DC and attack) and extra proficiencies (skills with expertise, saving throws, languages, tools, armour, weapons).

### Undo

**Undo** and **Redo** in the top bar (or Ctrl+Z and Ctrl+Y / Ctrl+Shift+Z outside text boxes) step back and forward through the last 40 changes, including imports and deleting a character. The history lasts until the page is closed.

### Install as an app

On the GitHub Pages site, use **Install app** in the top bar (Chrome, Edge, Android), or the browser's own install / *Add to Home Screen* (Safari on iPhone and iPad: Share → Add to Home Screen).
The installed app opens in its own window, works offline, and picks up new versions automatically the next time it opens while online.
If you changed which files the page loads, add them to the list in `sw.js` and bump `VERSION` there (the test checks the list).

## Sections

The app opens on a **home page** with its sections: **Characters** (the builder below, with your characters listed for one-tap opening) and **Monsters**.

### Monsters

All 334 monsters of the 2014 System Reference Document (SRD 5.1) with their full stat blocks: search by name, filter by type, size and challenge, sort by name or CR.
Tap any attack bonus, damage dice, hit dice or ability score in a stat block to roll it. **Add your own monster** (or **Copy as my own** to start from an SRD one) for homebrew or creatures from other books;
yours are saved with your characters.

It also lists 617 monsters from the other 2014-era books (the rest of the Monster Manual, Monsters of the Multiverse, Fizban's, Glory of the Giants, Tasha's, adventures…),
with their challenge, type, size, AC, hit points, movement, alignment and book, filterable by **Book**. Their stat blocks aren't free to share, so each one has a button that opens it on AideDD,
and its full stat block shows inside the app from AideDD when you're online.

**⎘ Paste a stat block** turns a stat block you copy (from AideDD, your book or a PDF) into a monster of yours: name, type, AC, hit points, speed, ability scores, properties, traits, actions,
bonus actions, reactions and legendary actions, with rollable attacks, saved on your device and usable offline. **Export mine** saves your monsters to a file and **Import** adds a friend's.
**Import** also reads stat block files you have (a `.zip` of `.md` files, or `.md` / `.txt` files): they're read on your device and kept in the browser's own storage, never in the app's files. **Remove imported** deletes them.

### Encounters

In the style of Kobold Fight Club. Set your party (groups of players by level, or your own characters), add monsters from every list in the Monsters section, and the page rates the fight Easy, Medium, Hard or Deadly with the 2014 Dungeon Master's Guide rules (XP thresholds per level, the multiplier for the number of monsters, one step up for parties under 3 and one step down for 6 or more). **Place** (Arctic, Coast, Desert, Forest, Grassland, Hill, Mountain, Swamp, Underdark, Underwater, City) keeps the monster list and random encounters to creatures that live there; the match is a best guess from the monster's name, and creatures with no known home (most fiends, for example) only show under Anywhere. **Random encounter** picks monsters to hit a chosen difficulty. Save encounters by name and load them later.

**Run it** rolls initiative for the monsters (and for your own characters), with boxes for the players' rolls. Track each monster's hit points (−10 −5 −1 +1 +5 +10 buttons, or type `7` for damage and `+5` for healing), step through turns and rounds, and tap a monster to read its stat block.

### Treasures

Quick random loot. **Pocket money** is what each creature carries: a few coins for bandits, more for stronger creatures, and nothing for beasts, oozes or constructs. A **hoard** is a boss's or lair's stash, with more coins, gems, art objects and magic items (from the app's item list, rarer as the challenge goes up). Coin, gem and art amounts follow the Dungeon Master's Guide (2014) treasure tables; magic items are picked by rarity from the app's item list, with chances close to the book's.

When you press **End fight** in Encounters, the app asks whether to roll treasure. Say yes and it opens Treasures with loot that fits the fight: a hoard if one monster was as strong as the party (its challenge rating at least the party's average level), pocket money otherwise. You can switch between the two before rolling again.

### Books

The free official rules, the System Reference Document 5.1, are built in: races, classes, backgrounds, equipment, feats, playing the game (ability checks, adventuring, combat), spellcasting and every SRD spell, conditions and other game-master rules, and magic items. Read them by chapter, or search the whole book; results jump to the right section with the words highlighted.

**+ Add a book** adds your own PDF, Markdown or text file. It is kept in this browser's storage on this device, never uploaded or put in the app's files, so each person adds their own copies. PDFs are shown page by page (with [pdf.js](https://mozilla.github.io/pdf.js/), Apache 2.0) and can be searched when they contain text; scanned PDFs can be read but not searched.

### House rules

A **House rules** section (next to Characters and Monsters) holds your table's own rules as short titled notes you can search and read quickly during a game.

## What it does

Lineage → Class and subclass (levels 1–20, single class or multiclass) → Ability scores (standard array, point buy, manual/rolled; ASIs or feats) → Background → Spells → My spells → Equipment → Items → Appearance → Details → printable Sheet → Play.
It computes HP, AC, saves, skills, initiative, passive Perception, attacks, spell slots, save DC and spell attack, and tracks unfilled choices per step.
The **Sources** checkboxes hide or show Official, Setting, Unearthed Arcana and Homebrew content. **Detailed text** switches between short and long feature text and shows or hides spell descriptions.

### My spells

One page with every spell the character can cast, by spell level with slots: class cantrips and spells (prepared, known or in the spellbook — tap ☆/★ to prepare wizard spells right there),
always-prepared subclass spells, and spells from the **lineage** and **feats** (Tiefling Infernal Legacy, Drow Magic, Fey Touched…), each with how often it can be cast, the level it arrives at and its save DC.
Lineages that let you pick a cantrip (High Elf, Astral Elf, Kobold…) or a spellcasting ability (Mordenkainen's lineages) ask on the Lineage step.
**Other spells** adds any spell by hand, with where it comes from (Magic Initiate, a magic item, a boon). Imported spells that fit none of the character's class lists land there too.

### Feats

Feats ask for what they let you choose, under the feat on the step where you took it: Martial Adept (maneuvers), Metamagic Adept (Metamagic), Eldritch Adept (an invocation), Fighting Initiate (a fighting style),
Magic Initiate, Ritual Caster, Artificer Initiate, Fey Touched, Shadow Touched, Spell Sniper, the Strixhaven, Dragonlance and Planescape spell feats (their spells), Skilled (any mix of skills and tools), Weapon Master (four weapons), Prodigy, Squat Nimbleness, Elemental Adept and more.
Their effects count too: weapon and tool proficiencies, resistances, Medium Armor Master's +3 Dexterity, and limited uses (Lucky, superiority die, sorcery points, proficiency-bonus uses) on the Play page.

### Finished characters

A character with every choice made opens on **Session**, with only Session, My spells, Items and Sheet as tabs. **⬆ Level up** (adds a level when there's one class) and **✎ Edit character** bring the building steps back; **✓ Done — go to Session** hides them again.
On phones and narrow windows a bar at the bottom keeps the character's AC, HP, speed, initiative and ability modifiers in view.

### Session: keep track during a game

The **Session** page has a box for each use of a spell slot, pact slot, once-per-rest lineage or feat spell, and class ability (Rage, Bardic Inspiration, Channel Divinity, Wild Shape, Second Wind, Action Surge, Ki, Sorcery Points, Lay on Hands, Superiority Dice…) and lineage ability (Breath Weapon, Relentless Endurance…).
Tap a filled box to use one and an empty one to get it back. It also tracks current and temporary hit points, hit dice and death saves, plus **your own counters** for item charges or anything else.
**☾ Short rest** brings back pact slots and short-rest abilities; **☀ Long rest** brings back everything, full hit points and half your hit dice. Spell slot boxes are on My spells too.

### Your own armor and weapons

On the Equipment step, **Add your own armor** (name, light/medium/heavy/natural, base AC, how much Dexterity counts, magic bonus, Strength needed, weight)
and **Add your own weapon** (damage dice and type, melee or ranged, which ability it attacks with, attack and damage bonuses, properties, weight).
They count for AC, attacks, the pixel figure and carried weight, and the shield's bonus can be changed too. Homebrew armor and weapons from 5e Companion come in this way.

### Items

The Items step holds the inventory: 902 magic items from the wiki (filter by rarity and type, attunement tracked against the limit of 3, or more for artificers),
103 pieces of adventuring gear with cost and weight, your own custom items, and coins. Carried weight is compared with Strength × 15.
Adding an equipment pack (Burglar's, Diplomat's, Dungeoneer's, Entertainer's, Explorer's, Priest's, Scholar's) puts everything it holds in the inventory, and the Equipment step offers a button to unpack the pack from your starting equipment.
Magic items carry name, rarity, type and attunement only; each links to its wiki page for the description.

### Appearance

The Appearance step has two parts.
**Character picture:** add your own image of the character (a drawing, a token, anything). It is shrunk to at most 640 px, saved in the browser with the character, included in exports, and shown in the side panel and on the sheet. **Move, zoom and turn** fits it in its square frame (drag, pinch or mouse wheel, slider, 90° turns); the same framing is used everywhere. It can also be shown whole, without cropping.
**Pixel figure:** an original pixel-art figure on a terrain base, drawn in code by `js/avatar.js`.
Height, build, head shape, ears, horns, tail and wings start from the lineage; skin, eyes, hair, beard, clothes and ground can be changed, and the changes are kept.
Armour (none, light, medium, heavy), shield and weapons from the Equipment step are drawn on the body, and wearable inventory items are matched by name
(cloaks, robes, hats, helms, circlets, boots, gloves, belts, amulets, rings, goggles, orbs, magic weapons, armour and shields). Each one can be hidden.
Magic items add a sparkle in their rarity colour. The figure shows in the side panel when there is no picture, and both appear at the top of the sheet.

### Multiclassing

Add classes on the Class step; the first one is the starting class. The builder applies the standard rules:
proficiency bonus from total level; hit points and hit dice per class; saving throws and starting equipment from the starting class only;
the reduced proficiency list for each added class; features, subclass and ability score improvements by each class's own level;
shared spell slots from the combined caster level (full + half + third, artificer rounded up) with pact slots kept separate;
spells known or prepared per class; Unarmored Defense only from whichever class granted it first. Ability score prerequisites are shown as warnings, not enforced.

## Party (for the DM)

The Party page keeps your players’ characters: name, class, level, AC and hit points (or add one of your own characters and its numbers are copied in). Damage and healing in a fight carry over to the party; “Long rest” fills everyone back up.
In Encounters, choose the party and the difficulty meter uses their levels; it also warns when one monster is far above their level or when a character is badly hurt. When you run the fight, the party shows with its AC and current hit points.

## M&M encounters

Pick the heroes’ power level and how many there are, then the kind of fight (villain + minions, one big villain, a villain team, only minions) and optionally the villain type (brute, blaster, speedster, martial artist, mentalist, armored villain, controller, infiltrator).
Each villain is built like a hero, with abilities, powers, skills, advantages, tactics and a motivation, and stays within the power level limits (checked for every role and level in the tests). Make a new one, remove it, or copy it to your heroes to edit.
Run the fight: initiative for foes and the heroes you pick, then type a hit’s damage rank and the app rolls the Toughness check and fills in the damage track (−1 Toughness, dazed, staggered, incapacitated; minions drop after any failed check).

## M&M party

The Party page keeps your players’ heroes: power level, Toughness, Dodge, Parry, Fortitude, Will and hero points (or copy one of your heroes in). Damage taken in an encounter is saved back to the party; “New session” heals everyone and resets hero points to 1. “Plan an encounter for them” sets the power level and number of heroes in Encounters. Both games’ home pages show their sections as round buttons around a d20.

## Pathfinder 2e (pre-Remaster)

A third game next to D&D 5e and M&M 3e: tap **PF2** at the top. The rules are the original (pre-Remaster) ones: Core Rulebook, Advanced Player's Guide, Secrets of Magic, Guns & Gears, Dark Archive, Rage of Elements, the Lost Omens books and the Bestiaries.

- **Characters**: build level by level like Pathbuilder: ancestry, heritage, background, class, ability boosts (pre-Remaster scores, +1 above 18), trained skills and skill increases, every ancestry, class, skill and general feat slot, and the choices inside features and feats (rackets, muses, bloodlines, doctrines, Versatile Heritage, General Training…). Pickers have Common/Uncommon/Rare, Core/Expanded and level filters, and check prerequisites.
- **Sheet**: HP, AC, saves, Perception, class DC, speed, senses and resistances, worked out from the rules data itself (each feat and feature's own rules), with play tracking (HP, temp HP, hero points, focus points, dying, wounded, conditions). Skills and Strikes roll with the 3D dice (multiple attack penalty, runes, sneak attack). Spells: class and multiclass spellcasting with slots, repertoire, focus and innate spells. Gear with runes, worn and invested items, bulk and coins.
- **Import from Pathbuilder**: paste the text from Pathbuilder's Export JSON link. The tests import two real exports and check that every ability, skill, save, AC, attack, damage bonus and spell slot matches Pathbuilder.
- **Party and Encounters** for the GM: the XP budget (trivial to extreme), creatures from the Bestiaries with elite and weak versions and full stat blocks, and fights with initiative and hit points that carry over to the party.
- **Monsters**: all 1,500+ creatures with filters (level, trait, size, book), full stat blocks, a sound, and + Add to encounter.
- **Treasures**: the Core Rulebook's Party Treasure by Level: a whole level's worth or one fight's share, with real permanent items, consumables, gems and money (the Treasure button in a running fight rolls one for that party).
- **Books**: a readable Pathfinder rules book (basics, conditions, actions, ancestries, heritages, backgrounds, classes with all their features, deities), next to your own books.
- **Rules**: everything searchable, plus a short page of basics.

Data: `python3 tools/pf2-build.py <foundry-pf2e 5.8.0> <foundry-pf2e 4.12.0>` builds `data/pf2/` from the Foundry VTT pf2e system (rules are Open Game Content, OGL 1.0a; Rage of Elements under the ORC license). Only pre-Remaster entries are kept; a few spells that 5.8.0 had already replaced with Remaster versions come from 4.12.0. This app uses trademarks and/or copyrights owned by Paizo Inc., used under Paizo's Community Use Policy (paizo.com/licenses/communityuse); it is not published, endorsed, or specifically approved by Paizo, and is free to use.

## The helper (AI)

The round ✦ button above the dice opens a chat that sees what you are working on: the game, the page, your character or hero with its open choices, costs and warnings.
Ask it things like “what should I pick for this?”, “why is my hero over the limit?” or tap one of the suggested questions.
Ask it to add something (“add Power Attack”, “make me a high elf wizard”) and its answer comes with **Apply** buttons: nothing changes until you tap one, every change is checked against the rules data, and Undo takes it back.
D&D: lineage, class (level, subclass), background, name and any open choice (spells, skills, feats…). M&M: abilities, defenses, skills, advantages, powers (with extras and flaws), complications, name and power level.

It needs an AI to talk to. Pick one in its Settings:

- **Your server (recommended for a group):** the computer that hosts the app holds one key, and everyone using that server gets the helper without a key of their own:
  `GEMINI_API_KEY=AIza… node server.js` (free key from aistudio.google.com/apikey; the free daily limit is shared by everyone) or `ANTHROPIC_API_KEY=sk-ant-… node server.js` (Claude, paid per use). (add `AI_CODE=something` to require an access code, typed once in the helper's settings, and `AI_MODEL=…` to pick another model).
  Keys come from console.anthropic.com and are billed per use, separately from a Claude subscription.
- **Google Gemini (free):** get a free key at aistudio.google.com/apikey and paste it into the helper's settings (kept only in that browser). Works on a phone with no server; the app picks the newest free Flash model for the key. The free tier has daily limits, and Google may use free-tier questions to improve its products.
- **Your own Claude key:** pasted into the helper's settings; kept only in that browser.
- **Ollama:** a free AI on a computer on your network. Start it with `OLLAMA_ORIGINS=*` and give the helper its address and model.

Only your question and a summary of the page you are on are sent to the AI you pick.

## Mutants & Masterminds 3e

The switch at the top (D&D 5e | M&M 3e) moves between the two games; each has its own home page, characters and house rules (dice and your own books are shared; Audio has modern moods for M&M: headquarters, city at night, chase, villain, hacking, noir…).

- **Heroes:** build heroes on power points (15 per power level, plus points earned in play): abilities, defenses, skills (with Close/Ranged Combat and Expertise specialties), advantages, powers built from the 40 effects with any extras and flaws, and complications. Costs are worked out as you go (per-rank and flat modifiers, 1 point per 2+ ranks when cheap, Removable per 5 points), and the power level limits are checked: attack + effect, Dodge/Parry + Toughness, Fortitude + Will, skills ≤ PL + 10. A printable sheet lists everything, with each attack's bonus and DC.
- **Rules:** a searchable book of summaries: core rules, abilities and defenses, skills, all advantages, every power effect with its action, range, duration and cost, every extra and flaw, combat and conditions. Add your own copy of the Hero's Handbook (PDF) to read it alongside.

Names, costs and stats come from the game's Open Game Content as published at [d20herosrd.com](https://www.d20herosrd.com); the descriptions are short summaries in our own words (`data/mm.js`).
Mutants & Masterminds is a trademark of Green Ronin Publishing. This is an unofficial fan tool, not affiliated with or endorsed by Green Ronin.

## Limits

- Feat and multiclass prerequisites are shown but not enforced.
- Rules text is paraphrased, not the books' wording. Spells link to the wiki for the full text.
- Homebrew subclasses and the UA spell *Icingdeath's Frost* only have the short text.
- The figure has one front-facing pose. Items use a generic shape per kind (all cloaks look alike); items that don't match a kind are not drawn.
- Archived / superseded Unearthed Arcana from the wiki is not included.
- Spell grants from lineages and feats are described in their text, not added to the spell picker.

## Layout

    index.html        page and script load order
    css/style.css     styles (light, dark, print)
    js/rules.js       rules engine (no DOM; runs in Node)
    js/app.js         user interface
    js/avatar.js      pixel-art figure for the Appearance step
    js/sqlite-read.js read-only SQLite reader (for app backups)
    js/import-5e.js   5th Spellbook backup → characters
    js/import-companion.js  5e Companion shared character → character
    data/*.js         game data, plain scripts that fill window.DND
    data/items.js     magic item index and adventuring gear
    data/text-*.js    longer feature text and spell descriptions (optional: delete the two script tags to drop them)
    manifest.webmanifest, sw.js, icons/   installable app: name, icons, offline copy
    test/             `node test/rules.test.js`

To add content, append an entry to the matching file in `data/` following its neighbours.

## Attribution

- The Books section includes material taken from the System Reference Document 5.1 ("SRD 5.1") by Wizards of the Coast LLC, available at https://dnd.wizards.com/resources/systems-reference-document, licensed under the Creative Commons Attribution 4.0 International License (https://creativecommons.org/licenses/by/4.0/legalcode). Markdown text from OldManUmby's SRD v5.1 reForged (https://github.com/OldManUmby/DND.SRD.Wiki).
- PDF viewing uses Mozilla's pdf.js (Apache License 2.0), in `js/vendor/pdfjs/` with its license.
- Monster sounds (`sounds/`) are from "80 CC0 Creature SFX" and "80 CC0 Creature SFX #2" by rubberduck on OpenGameArt.org (https://opengameart.org/content/80-cc0-creature-sfx, https://opengameart.org/content/80-cc0-creature-sfx-2), CC0 public domain, converted to MP3. Each monster gets a sound that fits its kind (`js/sounds.js`); tap the speaker beside its name in Monsters or in a running encounter.

Monster stat blocks: this work includes material taken from the System Reference Document 5.1 ("SRD 5.1") by Wizards of the Coast LLC, available at https://dnd.wizards.com/resources/systems-reference-document,
licensed under the Creative Commons Attribution 4.0 International License (https://creativecommons.org/licenses/by/4.0/). Converted from the 5e-database project (MIT license).
The list of monsters from other books (names and basic facts only) comes from AideDD's monster list: https://www.aidedd.org/dnd-filters/monsters.php


Game data is summarised from [dnd5e.wikidot.com](https://dnd5e.wikidot.com/), whose content is licensed
[CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/); the files in `data/` are shared under the same licence.
Dungeons & Dragons is a trademark of Wizards of the Coast. This is an unofficial fan tool; if you make it public, keep this notice.
