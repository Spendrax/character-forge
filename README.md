# Character Forge

A self-hosted D&D 5e character builder. Static site: no build step, no dependencies, no accounts.

## Run it

- **Simplest:** open `index.html` in a browser.
- **Local server:** `node server.js` (or `node server.js 3000`), then visit http://localhost:8080.
- **Any static host:** copy the folder to nginx, Caddy, Apache, GitHub Pages, a NAS… e.g. nginx: `root /srv/character-forge; index index.html;`

Characters are saved in the browser's localStorage. Use **Export** / **Import** (JSON) to back up or move them.

## What it does

Lineage → Class and subclass (levels 1–20, single class or multiclass) → Ability scores (standard array, point buy, manual/rolled; ASIs or feats) → Background → Spells → Equipment → Items → Details → printable Sheet.
It computes HP, AC, saves, skills, initiative, passive Perception, attacks, spell slots, save DC and spell attack, and tracks unfilled choices per step.
The **Sources** checkboxes hide or show Official, Setting, Unearthed Arcana and Homebrew content. **Detailed text** switches between short and long feature text and shows or hides spell descriptions.

### Items

The Items step holds the inventory: 902 magic items from the wiki (filter by rarity and type, attunement tracked against the limit of 3, or more for artificers),
103 pieces of adventuring gear with cost and weight, your own custom items, and coins. Carried weight is compared with Strength × 15.
Magic items carry name, rarity, type and attunement only; each links to its wiki page for the description.

### Multiclassing

Add classes on the Class step; the first one is the starting class. The builder applies the standard rules:
proficiency bonus from total level; hit points and hit dice per class; saving throws and starting equipment from the starting class only;
the reduced proficiency list for each added class; features, subclass and ability score improvements by each class's own level;
shared spell slots from the combined caster level (full + half + third, artificer rounded up) with pact slots kept separate;
spells known or prepared per class; Unarmored Defense only from whichever class granted it first. Ability score prerequisites are shown as warnings, not enforced.

## Limits

- Feat and multiclass prerequisites are shown but not enforced.
- Rules text is paraphrased, not the books' wording. Spells link to the wiki for the full text.
- Homebrew subclasses and the UA spell *Icingdeath's Frost* only have the short text.
- Archived / superseded Unearthed Arcana from the wiki is not included.
- Spell grants from lineages and feats are described in their text, not added to the spell picker.

## Layout

    index.html        page and script load order
    css/style.css     styles (light, dark, print)
    js/rules.js       rules engine (no DOM; runs in Node)
    js/app.js         user interface
    data/*.js         game data, plain scripts that fill window.DND
    data/items.js     magic item index and adventuring gear
    data/text-*.js    longer feature text and spell descriptions (optional: delete the two script tags to drop them)
    test/             `node test/rules.test.js`

To add content, append an entry to the matching file in `data/` following its neighbours.

## Attribution

Game data is summarised from [dnd5e.wikidot.com](https://dnd5e.wikidot.com/), whose content is licensed
[CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/); the files in `data/` are shared under the same licence.
Dungeons & Dragons is a trademark of Wizards of the Coast. This is an unofficial fan tool; if you make it public, keep this notice.
