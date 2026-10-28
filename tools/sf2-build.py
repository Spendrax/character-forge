#!/usr/bin/env python3
"""Build Character Forge's Starfinder 2e data from the Foundry VTT sf2e system's packs.

Usage: python3 tools/sf2-build.py /path/to/foundryvtt-pf2e   (a checkout of tag sf2e-1.6.1 or later; its packs/sf2e folder)

The Starfinder Second Edition system lives in the same repository as pf2e (github.com/foundryvtt/pf2e, tags sf2e-*).
Only entries published under the ORC License (and a few OGL ones) are kept. Game rules text is licensed ORC
content; Paizo names are used under Paizo's Community Use Policy. No artwork is copied.
Writes data/sf2/core.js, feats.js, spells.js, items.js and bestiary.js.
"""
import glob, html, json, os, re, sys

SRC = sys.argv[1] if len(sys.argv) > 1 else '.'
PACKS = os.path.join(SRC, 'packs', 'sf2e')
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'data', 'sf2')
os.makedirs(OUT, exist_ok=True)

# English strings for rule labels and @Localize
LANG = {}
def flatten(d, pre=''):
    for k, v in d.items():
        if isinstance(v, dict): flatten(v, pre + k + '.')
        else: LANG[pre + k] = v
for f in ['en.json', 're-en.json', 'action-en.json', 'sf2e-overrides-en.json']:
    p = os.path.join(SRC, 'static', 'lang', f)
    if os.path.exists(p): flatten(json.load(open(p)))
def loc(key):
    v = LANG.get(key)
    return v if isinstance(v, str) else key

ABBR = {
    'Starfinder Player Core': 'PC', 'Starfinder Tech Core': 'TC', 'Starfinder Galactic Ancestries': 'GA', 'Starfinder Galaxy Guide': 'GG',
    'Starfinder Alien Core': 'AC', 'Starfinder GM Core': 'GMC', 'Starfinder Absalom Station': 'AS', 'Starfinder Society Guide': 'SSG',
    'Pathfinder Player Core': 'PF PC',
}
CORE = {'PC', 'TC', 'GA', 'GG', 'AC', 'GMC'}

def src(s):
    t = ((s.get('publication') or {}).get('title') or (s.get('source') or {}).get('value') or '').strip()
    if not t: return ''
    if t in ABBR: return ABBR[t]
    if re.match(r'Starfinder Society Scenario', t): return 'SFS'
    return t.replace('Starfinder ', '')

def keep(s):
    pub = s.get('publication') or (s.get('details') or {}).get('publication') or {}
    return pub.get('license') in ('ORC', 'OGL')

# ---------- text: Foundry HTML to the app's small markdown ----------
GLYPH = {'1': '◆', '2': '◆◆', '3': '◆◆◆', 'a': '◆', 'd': '◆◆', 't': '◆◆◆', 'r': '⤾', 'f': '◇', 'A': '◆', 'D': '◆◆', 'T': '◆◆◆', 'R': '⤾', 'F': '◇',
         '1 or 2': '◆ or ◆◆', '1 to 3': '◆ to ◆◆◆', '2 or 3': '◆◆ or ◆◆◆', '1 - 3': '◆ to ◆◆◆', '1-3': '◆ to ◆◆◆'}
SAVE = {'fortitude': 'Fortitude', 'reflex': 'Reflex', 'will': 'Will', 'perception': 'Perception', 'flat': 'flat'}

def uuid_name(u):
    n = u.split('.')[-1]
    n = re.sub(r'^(Effect|Spell Effect|Stance|Aura): ', '', n)
    return n

def check(m):
    parts = m.group(1).split('|')
    args = dict(a.split(':', 1) for a in parts if ':' in a)
    if parts and ':' not in parts[0]: args.setdefault('type', parts[0])  # Remaster: @Check[reflex|…]
    if 'basic' in parts: args['basic'] = 'true'
    t = args.get('type', '')
    name = SAVE.get(t, t.replace('-', ' ').title() if t else '')
    dc = args.get('dc', '')
    dc = '' if not dc or 'resolve' in dc or '@' in dc else 'DC ' + dc + ' '
    basic = 'basic ' if args.get('basic') == 'true' else ''
    if t == 'flat': return (dc + 'flat check').strip()
    return (dc + basic + name).strip()

def damage(expr):
    expr = re.sub(r'\(([^()]*)\)\[', r'\1[', expr)
    parts = []
    for m in re.finditer(r'([^,\[\]]+)\[([^\]]+)\]', expr):
        f, kinds = m.group(1).strip(), [k.strip() for k in m.group(2).split(',')]
        f = f.replace('@actor.level', 'level').replace('@item.level', 'item level').replace('@item.rank', 'rank')
        parts.append(f + ' ' + ' '.join(k for k in kinds if k not in ('splash',)) + (' splash' if 'splash' in kinds else ''))
    return ' plus '.join(parts) if parts else expr

# names of everything in the packs, for @Embed[Compendium.sf2e.pack.Item.<id> inline]: shown as "(see Name)"
FIDS = {}
for f in glob.glob(os.path.join(SRC, 'packs', 'sf2e', '**', '*.json'), recursive=True):
    try:
        j = json.load(open(f))
        if isinstance(j, dict) and j.get('_id'): FIDS[j['_id']] = j.get('name', '')
    except Exception: pass
def embed(ref):
    n = FIDS.get(ref.split()[0].split('.')[-1], '')
    return '(see **' + n + '**)' if n else ''

def text(h):
    if not h: return ''
    h = re.sub(r'@UUID\[([^\]]+)\]\{([^}]*)\}', lambda m: m.group(2), h)
    h = re.sub(r'@UUID\[([^\]]+)\]', lambda m: uuid_name(m.group(1)), h)
    h = re.sub(r'@Compendium\[([^\]]+)\]\{([^}]*)\}', lambda m: m.group(2), h)
    h = re.sub(r'@Check\[([^\]]+)\](\{([^}]*)\})?', lambda m: m.group(3) or check(m), h)
    h = re.sub(r'@Damage\[((?:[^\[\]]|\[[^\[\]]*\])*)\](\{([^}]*)\})?', lambda m: m.group(3) or damage(m.group(1)), h)
    h = re.sub(r'@Template\[([^\]]+)\](\{([^}]*)\})?', lambda m: m.group(3) or (lambda a: (a.get('distance', '') + '-foot ' + a.get('type', '')).strip())(dict([('type', m.group(1).split('|')[0])] + [x.split(':', 1) for x in m.group(1).split('|') if ':' in x])), h)
    h = re.sub(r'@Embed\[([^\]]+)\](\{([^}]*)\})?', lambda m: m.group(3) or embed(m.group(1)), h)
    h = re.sub(r'@Localize\[([^\]]+)\]', lambda m: text(loc(m.group(1))), h)
    h = re.sub(r'\[\[/b?r[^\]]*?\]\]\{([^}]*)\}', r'\1', h)
    h = re.sub(r'\[\[/b?r\s+([^\]#]*?)(?:\s*#[^\]]*)?\]\]', lambda m: re.sub(r'\[[^\]]*\]', '', m.group(1)).replace('@actor.level', 'level').strip(), h)
    h = re.sub(r'<span class="action-glyph">([^<]*)</span>', lambda m: GLYPH.get(m.group(1).strip(), m.group(1)), h)
    h = re.sub(r'<span class="pf2-icon">([^<]*)</span>', lambda m: GLYPH.get(m.group(1).strip(), m.group(1)), h)
    # tables
    def table(m):
        rows = re.findall(r'<tr[^>]*>(.*?)</tr>', m.group(0), re.S)
        out = []
        for i, r in enumerate(rows):
            cells = [re.sub(r'<[^>]+>', '', c).strip().replace('|', '/') for c in re.findall(r'<t[hd][^>]*>(.*?)</t[hd]>', r, re.S)]
            out.append('| ' + ' | '.join(cells) + ' |')
            if i == 0: out.append('|' + '---|' * len(cells))
        cap = re.search(r'<caption>(.*?)</caption>', m.group(0), re.S)
        return '\n\n' + ('**' + re.sub(r'<[^>]+>', '', cap.group(1)).strip() + '**\n\n' if cap else '') + '\n'.join(out) + '\n\n'
    h = re.sub(r'<table.*?</table>', table, h, flags=re.S)
    h = re.sub(r'<h[1-6][^>]*>(.*?)</h[1-6]>', lambda m: '\n\n### ' + re.sub(r'<[^>]+>', '', m.group(1)).strip() + '\n\n', h, flags=re.S)
    h = re.sub(r'<li[^>]*>(.*?)</li>', lambda m: '\n- ' + m.group(1).strip(), h, flags=re.S)
    h = re.sub(r'</?(ul|ol)[^>]*>', '\n', h)
    h = re.sub(r'<hr\s*/?>', '\n\n---\n\n', h)
    h = re.sub(r'<br\s*/?>', '\n', h)
    h = re.sub(r'</?(strong|b)>', '**', h)
    h = re.sub(r'</?(em|i)>', '*', h)
    h = re.sub(r'</p>|</div>|</section>|</blockquote>', '\n\n', h)
    h = re.sub(r'<[^>]+>', '', h)
    h = html.unescape(h)
    h = re.sub(r'\*\*\s*\*\*', '', h)
    h = re.sub(r'[ \t]+\n', '\n', h)
    h = re.sub(r'\n{3,}', '\n\n', h)
    return h.strip()

# ---------- rules the app's engine reads ----------
RULE_KEYS = {'ActiveEffectLike', 'FlatModifier', 'ChoiceSet', 'GrantItem', 'BaseSpeed', 'Sense', 'Resistance', 'Weakness', 'Immunity',
             'MartialProficiency', 'Strike', 'DexterityModifierCap', 'DamageDice', 'AdjustModifier'}
DROP_FIELDS = {'img', 'priority', 'hideIfDisabled', 'reevaluateOnUpdate', 'allowDuplicate'}
def rules(s):
    out = []
    for r in s.get('rules') or []:
        if r.get('key') not in RULE_KEYS: continue
        r = {k: v for k, v in r.items() if k not in DROP_FIELDS}
        if r.get('key') == 'ChoiceSet':
            if isinstance(r.get('choices'), list):
                r['choices'] = [dict(c, label=loc(c['label']) if isinstance(c.get('label'), str) else c.get('label')) if isinstance(c, dict) else c for c in r['choices']]
            if 'prompt' in r: r['prompt'] = loc(r['prompt'])
        if isinstance(r.get('label'), str): r['label'] = loc(r['label'])
        # the app's engine reads the pre-Remaster flag paths (flags.pf2e.…); the sf2e system writes flags.system.…
        r = json.loads(json.dumps(r).replace('flags.system.', 'flags.pf2e.'))
        out.append(r)
    return out

def rar(s):
    r = (s.get('traits') or {}).get('rarity', 'common')
    return {'common': 'c', 'uncommon': 'u', 'rare': 'r', 'unique': 'q'}.get(r, 'c')

def traits(s): return (s.get('traits') or {}).get('value', []) or []

def slug(path): return os.path.splitext(os.path.basename(path))[0]

def load(pack):
    out = []
    for f in sorted(glob.glob(os.path.join(PACKS, pack, '**', '*.json'), recursive=True)):
        j = json.load(open(f))
        if '_id' not in j or 'system' not in j: continue
        if not keep(j['system']): continue
        j['_slug'] = slug(f)
        out.append(j)
    return out

def actions(s):
    t = (s.get('actionType') or {}).get('value')
    n = (s.get('actions') or {}).get('value')
    if t == 'reaction': return 'r'
    if t == 'free': return 'f'
    if t == 'action': return n or 1
    return None

def base(j, typ=None):
    s = j['system']
    o = {'id': j['_slug'], 'n': j['name'], 'fid': j['_id']}  # fid: Foundry's id, used by rules that point at other items
    if typ: o['k'] = typ
    t = traits(s)
    if t: o['t'] = t
    r = rar(s)
    if r != 'c': o['r'] = r
    lv = (s.get('level') or {}).get('value') if isinstance(s.get('level'), dict) else s.get('level')
    if lv is not None: o['lv'] = lv
    so = src(s)
    if so: o['src'] = so
    d = text((s.get('description') or {}).get('value', ''))
    if d: o['d'] = d
    ru = rules(s)
    if ru: o['ru'] = ru
    return o

# ---------- core: ancestries, heritages, backgrounds, classes, class features, deities, actions, conditions ----------
core = {}
core['ancestries'] = []
for j in load('ancestries'):
    s = j['system']; o = base(j)
    o.update({'hp': s['hp'], 'size': s['size'], 'speed': s['speed'], 'vision': s.get('vision', 'normal'),
              'boosts': [b['value'] for b in s['boosts'].values() if b['value']], 'flaws': [b['value'] for b in s['flaws'].values() if b['value']],
              'langs': s['languages']['value'], 'addLangs': s['additionalLanguages']['value'], 'addLangCount': s['additionalLanguages']['count'],
              'feats': [i['name'] for i in (s.get('items') or {}).values()]})
    core['ancestries'].append(o)
core['heritages'] = []
for j in load('heritages'):
    s = j['system']; o = base(j)
    o['anc'] = (s.get('ancestry') or {}).get('slug')  # None = versatile heritage
    core['heritages'].append(o)
core['ancestryfeatures'] = [base(j) for j in load('ancestry-features')]
core['backgrounds'] = []
for j in load('backgrounds'):
    s = j['system']; o = base(j)
    o.update({'boosts': [b['value'] for b in s['boosts'].values()], 'skills': s.get('trainedSkills', {}).get('value', []),
              'lore': s.get('trainedLore', '') or (s.get('trainedSkills', {}).get('lore') or [''])[0] if isinstance(s.get('trainedSkills', {}).get('lore'), list) else s.get('trainedLore', ''),
              'feats': [i['name'] for i in (s.get('items') or {}).values()]})
    core['backgrounds'].append(o)
core['classes'] = []
for j in load('classes'):
    s = j['system']; o = base(j)
    o.update({'hp': s['hp'], 'key': s['keyAbility']['value'], 'perception': s['perception'], 'saves': s['savingThrows'], 'attacks': s['attacks'],
              'defenses': s['defenses'], 'classDC': s.get('classDC', 1), 'skills': s['trainedSkills']['value'], 'addSkills': s['trainedSkills']['additional'],
              'ancestryFeatLevels': s['ancestryFeatLevels']['value'], 'classFeatLevels': s['classFeatLevels']['value'], 'generalFeatLevels': s['generalFeatLevels']['value'],
              'skillFeatLevels': s['skillFeatLevels']['value'], 'skillIncreaseLevels': s['skillIncreaseLevels']['value'],
              'features': sorted([[i['level'], i['name']] for i in (s.get('items') or {}).values()])})
    if s.get('spellcasting'): o['sc'] = s['spellcasting']  # Remaster: one spellcasting proficiency, trained at 1st level
    core['classes'].append(o)
core['classfeatures'] = []
for j in load('class-features'):
    s = j['system']; o = base(j)
    tags = (s.get('traits') or {}).get('otherTags') or []
    if tags: o['tags'] = tags
    a = actions(s)
    if a: o['a'] = a
    core['classfeatures'].append(o)
core['deities'] = []
for j in load('deities'):
    s = j['system']; o = base(j)
    for k in ['font', 'skill', 'weapons', 'domains', 'spells', 'attribute', 'ability', 'alignment', 'category']:
        if k in s and s[k] not in (None, '', [], {}): o[k] = s[k]
    core['deities'].append(o)
core['actions'] = []
for j in load('actions'):
    s = j['system']; o = base(j)
    a = actions(s)
    if a: o['a'] = a
    if s.get('category'): o['cat'] = s['category']
    core['actions'].append(o)
# Starfinder uses the Pathfinder Player Core conditions (ORC), plus its own (glitching, suppressed, untethered)
PF2_PACKS = os.path.join(SRC, 'packs', 'pf2e')
def load_pf2(pack):
    global PACKS
    keepP, PACKS = PACKS, PF2_PACKS
    try: return load(pack)
    finally: PACKS = keepP
core['conditions'] = [base(j) for j in load_pf2('conditions')] + [base(j) for j in load('conditions')]
# OGL text for the about page
ogl = ''
for f in ['OGL.txt', 'LICENSE-OGL', 'OGL']:
    if os.path.exists(os.path.join(SRC, f)): ogl = open(os.path.join(SRC, f)).read()

# ---------- feats ----------
feats = []
for j in load('feats'):
    s = j['system']; o = base(j)
    o['cat'] = s.get('category')
    pre = [p['value'] for p in (s.get('prerequisites') or {}).get('value', []) if p.get('value')]
    if pre: o['pre'] = pre
    a = actions(s)
    if a: o['a'] = a
    if (s.get('maxTakable') or 1) != 1: o['max'] = s.get('maxTakable')
    feats.append(o)

# Starfinder characters also take the Pathfinder Player Core (ORC) general and skill feats (like Toughness), and its
# ancestry feats for the ancestries both games share (dwarf, elf, gnome, goblin, halfling, human, leshy, orc)
have = {f['n'] for f in feats}
SHARED = {'dwarf', 'elf', 'gnome', 'goblin', 'halfling', 'human', 'leshy', 'orc'}
for j in load_pf2('feats'):
    s = j['system']
    if (s.get('publication') or {}).get('title') != 'Pathfinder Player Core': continue
    cat = s.get('category')
    if not (cat in ('general', 'skill') or (cat == 'ancestry' and SHARED & set(traits(s)))): continue
    if j['name'] in have: continue
    o = base(j)
    o['cat'] = s.get('category')
    pre = [p['value'] for p in (s.get('prerequisites') or {}).get('value', []) if p.get('value')]
    if pre: o['pre'] = pre
    a = actions(s)
    if a: o['a'] = a
    if (s.get('maxTakable') or 1) != 1: o['max'] = s.get('maxTakable')
    feats.append(o)

# ---------- spells ----------
spells = []
for j in load('spells'):
    s = j['system']; o = base(j)
    o['lv'] = s['level']['value']
    tr = s.get('traits') or {}
    o['trad'] = tr.get('traditions') or s.get('traditions', {}).get('value', [])
    tv = tr.get('value') or []
    cat = 'focus' if 'focus' in tv else 'ritual' if s.get('ritual') else 'spell'
    if 'cantrip' in tv: cat = 'cantrip' if cat == 'spell' else cat
    o['cat'] = cat  # spell, cantrip, focus, ritual
    o['time'] = s.get('time', {}).get('value', '')
    for k, kk in [('range', 'rng'), ('target', 'tgt'), ('duration', 'dur'), ('cost', 'cost')]:
        v = (s.get(k) or {}).get('value')
        if v: o[kk] = v
    if s.get('area'): o['area'] = str(s['area'].get('value')) + '-foot ' + s['area'].get('type', '')
    sv = (s.get('defense') or {}).get('save') or {}
    if sv.get('statistic'): o['save'] = ('basic ' if sv.get('basic') else '') + SAVE.get(sv['statistic'], sv['statistic'])
    comp = [c for c, v in (s.get('components') or {}).items() if v]
    if comp: o['comp'] = comp
    if (s.get('duration') or {}).get('sustained'): o['sus'] = 1
    spells.append(o)

# ---------- equipment ----------
def price(s):
    p = (s.get('price') or {}).get('value') or {}
    return round(p.get('pp', 0) * 1000 + p.get('gp', 0) * 100 + p.get('sp', 0) * 10 + p.get('cp', 0))
items = []
for j in load('equipment'):
    if j['type'] == 'effect': continue
    s = j['system']; o = base(j, 'armor' if j['type'] == 'shield' else j['type'])
    o['cp'] = price(s)  # credits are silver pieces: cp / 10 credits
    if s.get('grade'): o['grade'] = s['grade']
    b = (s.get('weight') or {}).get('value') if isinstance(s.get('weight'), dict) else (s.get('bulk') or {}).get('value')
    if b not in (None, '', '-', 0, '0'): o['bulk'] = b
    u = (s.get('usage') or {}).get('value')
    if u: o['use'] = u
    if j['type'] == 'weapon':
        dmg = s.get('damage') or {}
        o.update({'cat': s.get('category'), 'grp': s.get('group'), 'base': s.get('baseItem'), 'die': dmg.get('die'), 'dmg': (dmg.get('damageType') or '')[:1].upper() + (dmg.get('damageType') or '')[1:]})
        if dmg.get('dice', 1) != 1: o['dice'] = dmg['dice']
        if s.get('range'): o['rng'] = s['range'] if isinstance(s['range'], int) else (s['range'].get('increment') if isinstance(s['range'], dict) else s['range'])
        if (s.get('reload') or {}).get('value'): o['reload'] = s['reload']['value']
        am = s.get('ammo') or {}
        if am.get('capacity'): o['cap'] = am['capacity']
        if am.get('baseType'): o['ammo'] = am['baseType']
        if s.get('expend'): o['expend'] = s['expend']
        if (s.get('potencyRune') or {}).get('value'): o['pot'] = s['potencyRune']['value']
        if (s.get('strikingRune') or {}).get('value'): o['str'] = s['strikingRune']['value']
    if j['type'] == 'shield':
        o.update({'cat': 'shield', 'ac': s.get('acBonus', 0), 'hard': s.get('hardness', 0), 'hp': (s.get('hp') or {}).get('max', 0)})
    if j['type'] == 'armor':
        o.update({'cat': s.get('category'), 'ac': s.get('acBonus', 0), 'grp': s.get('group')})
        if s.get('category') == 'shield': o.update({'hard': s.get('hardness', 0), 'hp': (s.get('hp') or {}).get('max', 0)})
        else: o.update({'dex': s.get('dexCap'), 'chk': s.get('checkPenalty') or 0, 'spd': s.get('speedPenalty') or 0, 'strReq': s.get('strength')})
        if (s.get('potencyRune') or {}).get('value'): o['pot'] = s['potencyRune']['value']
        if (s.get('resiliencyRune') or {}).get('value'): o['res'] = s['resiliencyRune']['value']
    if j['type'] == 'consumable':
        c = (s.get('consumableType') or {}).get('value') if isinstance(s.get('consumableType'), dict) else s.get('category')
        if c: o['cons'] = c
    if s.get('apex'): o['apex'] = s['apex'].get('attribute')
    items.append(o)

# ---------- bestiary (for encounters) ----------
best = []
for pack in ['alien-core-bestiary', 'rulebook-bestiaries']:
    for j in load(pack):
        if j.get('type') != 'npc': continue
        s = j['system']; a = s.get('attributes', {}); det = s.get('details', {})
        o = {'id': j['_slug'], 'n': j['name'], 'lv': (det.get('level') or {}).get('value', 0), 'src': src(det) or src(s),
             'ac': (a.get('ac') or {}).get('value'), 'hp': (a.get('hp') or {}).get('max'), 'per': (s.get('perception') or a.get('perception') or {}).get('mod', (s.get('perception') or a.get('perception') or {}).get('value')),
             'sv': {k: (v or {}).get('value') for k, v in (s.get('saves') or {}).items()},
             'ab': {k: (v or {}).get('mod') for k, v in (s.get('abilities') or {}).items()},
             'spd': (a.get('speed') or {}).get('value'), 'size': (s.get('traits') or {}).get('size', {}).get('value'), 't': (s.get('traits') or {}).get('value', [])}
        r = rar(s)
        if r != 'c': o['r'] = r
        other = [x.get('type') + ' ' + str(x.get('value')) for x in (a.get('speed') or {}).get('otherSpeeds', [])]
        if other: o['spd2'] = other
        for k in ['immunities', 'resistances', 'weaknesses']:
            v = a.get(k) or []
            if v: o[k[:3]] = [(x.get('type') + (' ' + str(x['value']) if x.get('value') else '')) for x in v]
        o['lang'] = ((det.get('languages') or s.get('traits', {}).get('languages') or {}).get('value') or [])
        sk = {i['name']: i['system'].get('mod', 0) for i in j.get('items', []) if i.get('type') == 'lore'}
        if sk: o['sk'] = sk
        strikes, abil = [], []
        for i in j.get('items', []):
            si = i.get('system', {})
            if i.get('type') == 'melee':
                dmg = ' plus '.join((d.get('damage', '') + ' ' + d.get('damageType', '')).strip() for d in (si.get('damageRolls') or {}).values())
                strikes.append({'n': i['name'], 'b': (si.get('bonus') or {}).get('value'), 'd': dmg, 't': (si.get('traits') or {}).get('value', []), 'rng': 'ranged' if any(t.startswith('range') for t in (si.get('traits') or {}).get('value', [])) else 'melee'})
            elif i.get('type') == 'action':
                abil.append({'n': i['name'], 'a': actions(si), 'd': text((si.get('description') or {}).get('value', ''))[:1500]})
            elif i.get('type') == 'spellcastingEntry':
                abil.append({'n': i['name'], 'd': 'DC ' + str((si.get('spelldc') or {}).get('dc', '')) + ', attack +' + str((si.get('spelldc') or {}).get('value', '')), 'spells': [x['name'] for x in j.get('items', []) if x.get('type') == 'spell' and (x.get('system', {}).get('location') or {}).get('value') == i.get('_id')]})
        o['str'] = strikes
        if abil: o['abil'] = abil
        d = text((det.get('publicNotes') or ''))
        if d: o['d'] = d[:1200]
        best.append(o)

def write(name, var, obj):
    p = os.path.join(OUT, name)
    with open(p, 'w') as f:
        f.write('// Starfinder 2e data, built by tools/sf2-build.py from the Foundry VTT sf2e system (packs/sf2e).\n')
        f.write('// Game rules: licensed under the ORC License. Paizo names used under Paizo\'s Community Use Policy.\n')
        f.write('(function (r) { var P = r.SF2DATA = r.SF2DATA || {}; P.' + var + ' = ')
        json.dump(obj, f, ensure_ascii=False, separators=(',', ':'))
        f.write('; })(typeof window !== "undefined" ? window : globalThis);\n')
    print(name, round(os.path.getsize(p) / 1024), 'KB', len(obj) if isinstance(obj, list) else {k: len(v) for k, v in obj.items() if isinstance(v, list)})

core['core'] = sorted(CORE)
write('core.js', 'core', core)
write('feats.js', 'feats', feats)
write('spells.js', 'spells', spells)
write('items.js', 'items', items)
write('bestiary.js', 'bestiary', best)

