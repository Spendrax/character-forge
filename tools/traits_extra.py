# Trait descriptions the Foundry language files leave out (class and ancestry traits, creature types and families,
# a few Starfinder-only traits). Written in our own words; used by pf2-build.py and sf2-build.py after the official
# descriptions, and only for traits that have none.
import re

COMMON = {
    'aberration': 'Aberrations are creatures from beyond the planes, or corruptions of the natural order.',
    'animal': 'Animals are creatures of low intelligence (usually Intelligence –4 or lower) that can’t speak languages.',
    'astral': 'Creatures native to the Astral Plane.',
    'beast': 'A creature like an animal but smarter (Intelligence –3 or higher). Beasts are often supernatural and many can speak.',
    'celestial': 'Creatures from the good-aligned planes, such as angels, archons and azatas. Many have a weakness to evil damage.',
    'dragon': 'Dragons are reptilian creatures, often winged or able to fly. Most have a breath weapon and are immune to sleep and paralysis.',
    'dream': 'Creatures native to the Dimension of Dreams.',
    'elemental': 'Creatures tied to an elemental plane. Elementals are immune to bleed, paralysis, poison and sleep.',
    'ethereal': 'Creatures native to the Ethereal Plane.',
    'fiend': 'Creatures from the evil planes, such as demons, devils and daemons. Many have a weakness to good damage.',
    'fungus': 'Creatures made of fungus, given motion or awareness.',
    'giant': 'Giants are huge humanoid creatures.',
    'monitor': 'Creatures from the neutral planes that watch over the order of the cosmos, such as aeons, psychopomps and proteans.',
    'ooze': 'Oozes are creatures with simple bodies. They tend to have low mental attributes and are often immune to mental effects and precision damage.',
    'petitioner': 'The soul of a mortal, reborn in the afterlife plane that matches the life it led.',
    'time': 'Creatures tied to time itself, native to the Dimension of Time.',
    'undead': 'Once alive, now animated by negative (void) energy. Positive (vitality) energy harms undead and negative (void) energy heals them; most are immune to death effects, disease, paralysis, poison and sleep.',
    'swarm': 'A mass of tiny creatures that acts as one. A swarm takes extra damage from area and splash effects, is usually immune to being grabbed, knocked prone or restrained, and can share space with others.',
    'troop': 'A unit of many soldiers fighting as one. It shrinks and weakens as it takes damage, and area damage hurts it more.',
    'golem': 'Constructs made by magic. Golems resist most magic (golem antimagic): only certain spells affect them, often in special ways.',
    'soulbound': 'A construct that holds a bound soul.',
}

PF2 = {
    'vigilante': 'This indicates abilities from the vigilante archetype.',
    'lineage': 'A feat that describes your character’s lineage. You can have only one lineage feat, you must take it at 1st level, and you can’t retrain into or out of it.',
    'additive': 'An alchemist feat that adds a substance to a bomb or elixir as you make it with Quick Alchemy. Only one additive can go into an item, and the item’s level goes up by the number after the trait.',
    'stamina': 'Used only with the Stamina variant rule (Gamemastery Guide).',
    'circus': 'Abilities for the circus rules from the Extinction Curse adventure path (performing tricks with your troupe).',
    'pervasivemagic': 'Used only with the pervasive magic variant rule, where anyone can learn spellcasting without a spellcasting archetype.',
    'harrowcourt': 'A card of the harrow deck: 54 cards in six suits, used for readings and harrow magic.',
    'adamantine': 'Made of adamantine, a very hard metal; adamantine weapons are good at breaking objects.',
}

SF2 = {
    'traversal': 'An action with this trait includes one or more Strides but works with other kinds of movement too: if you have a burrow, climb, fly or swim Speed, you can use that instead of a Stride, with the same Speed changes.',
    'expend': 'How much ammunition each ranged Strike with this weapon uses: the magazine goes down by this number every time it fires. Other abilities may use the same number to say how much ammunition an action needs.',
    'necrograft': 'An augmentation made from undead or necromantic tissue rather than machinery.',
    'nanite': 'Made of, or working through, nanites: swarms of microscopic machines.',
    'minibot': 'A tiny robot that works for its user, often orbiting close by.',
    'robot': 'Robots are constructs built and powered by technology rather than magic.',
    'drift': 'Creatures native to the Drift, the plane starships cross to travel faster than light.',
    'spectra': 'Spectra are creatures born of the Drift.',
    'installed': 'An upgrade or accessory that can be installed only on the kind of item named after the trait.',
}

GENERIC = 'Creatures of the {n} family share this trait. Many share weaknesses, immunities or abilities; the creature’s own entry lists them.'


def key(s):
    return re.sub(r'[^a-z0-9]', '', s.lower())


def has(T, t):
    # the same lookup the app does: "deadly-d10" → deadly d10, deadly; "additive2" → additive
    s = t.lower()
    tries = [s]
    while '-' in s:
        s = s.rsplit('-', 1)[0]
        tries.append(s)
    tries += [re.sub(r'\d+$', '', x) for x in tries]
    return any(T.get(key(x)) for x in tries if x)


def fill(T, game, core, entries, creatures):
    """Add descriptions for traits used in the data that have none. entries: feats, spells and items; creatures: the bestiary."""
    def tr(e):
        t = e.get('t')
        return t if isinstance(t, list) else []

    extra = dict(COMMON, **(SF2 if game == 'sf2' else PF2))
    for k, v in extra.items():
        T.setdefault(key(k), v)
    cls = {key(c['n']): c['n'] for c in core.get('classes', []) if c.get('n')}
    anc = {key(a['n']): a['n'] for a in core.get('ancestries', []) if a.get('n')}
    used, creature = set(), set()
    for e in creatures:
        for st in e.get('str') if isinstance(e.get('str'), list) else []:
            used.update(st.get('t') or [])
    for e in entries:
        used.update(tr(e))
    for e in creatures:
        creature.update(tr(e))
    added = []
    for t in sorted(used | creature):
        if has(T, t):
            continue
        k, n = key(t), t.replace('-', ' ')
        if k in cls:
            T[k] = 'This indicates abilities from the %s class.' % cls[k].lower()
        elif k in anc:
            a = anc[k].lower()
            T[k] = 'A creature with this trait is a member of the %s ancestry. An ability with this trait can be used or chosen only by %s characters.' % (a, a)
        elif t in creature and t not in used:
            T[k] = GENERIC.format(n=n)
        else:
            continue
        added.append(t)
    return added
