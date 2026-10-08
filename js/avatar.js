// Pixel-art paper doll: an original character sprite drawn in code, layer by layer, on a small terrain base.
// Everything is drawn on a 48 x 64 pixel grid and scaled up with crisp pixels.
(function (root) {
  'use strict';
  var W = 48, H = 58;
  var A = {};

  // ---------- options shown in the editor ----------
  A.SKINS = ['#f6d7c3', '#e8b796', '#d39a6a', '#b07548', '#8a5434', '#5e3a24', '#3f2618',
    '#c9c2b4', '#8f9aa8', '#7fae8c', '#5e8f4e', '#3f6f5a', '#6fa0c8', '#3d6e9e', '#c8574a', '#9b3434', '#7a4ca0', '#d9b44a', '#e0e0e8', '#4a4a52'];
  A.HAIRS = ['#1c1714', '#3b2a20', '#6b4426', '#a0682f', '#d8a85a', '#f0d890', '#b8442c', '#e8e4dc', '#8c8c94', '#3f6fd0', '#2f9a6a', '#b04ab0', '#d64a7a'];
  A.EYES = ['#3b6fd6', '#2f8a4a', '#6b4426', '#1c1714', '#8a8a96', '#d6a020', '#c42f2f', '#9b4ad6', '#f0f0f0'];
  A.CLOTH = ['#7a2e2a', '#a8442f', '#c88a2c', '#4f6b2f', '#2f6b5a', '#2d4f7a', '#3f3a78', '#6b3a6b', '#4a3a2c', '#e8e0cc', '#3a3a3a', '#8a8a8a'];
  A.OPTIONS = {
    height: [['short', 'Short'], ['medium', 'Medium'], ['tall', 'Tall']],
    build: [['slim', 'Slim'], ['average', 'Average'], ['broad', 'Broad']],
    head: [['human', 'Humanoid'], ['reptile', 'Scaled snout'], ['bird', 'Beaked'], ['feline', 'Feline'], ['construct', 'Construct'], ['tusked', 'Tusked']],
    ears: [['round', 'Round'], ['pointed', 'Pointed'], ['long', 'Long pointed'], ['cat', 'Cat'], ['rabbit', 'Rabbit'], ['none', 'Hidden']],
    hair: [['bald', 'Bald'], ['short', 'Short'], ['parted', 'Side part'], ['messy', 'Messy'], ['curly', 'Curly'], ['long', 'Long'], ['ponytail', 'Ponytail'], ['bun', 'Bun'], ['mohawk', 'Mohawk'], ['braids', 'Braids']],
    beard: [['none', 'None'], ['stubble', 'Stubble'], ['mustache', 'Mustache'], ['short', 'Short'], ['long', 'Long'], ['braided', 'Braided']],
    faceShape: [['oval', 'Oval'], ['round', 'Round'], ['square', 'Square'], ['heart', 'Heart'], ['long', 'Long']],
    age: [['young', 'Young'], ['adult', 'Adult'], ['old', 'Old']],
    eyeShape: [['round', 'Round'], ['almond', 'Almond'], ['narrow', 'Narrow'], ['wide', 'Wide'], ['sleepy', 'Heavy-lidded']],
    brows: [['thin', 'Thin'], ['thick', 'Thick'], ['arched', 'Arched'], ['angry', 'Stern'], ['worried', 'Worried'], ['none', 'None']],
    nose: [['small', 'Small'], ['button', 'Button'], ['long', 'Long'], ['broad', 'Broad'], ['hooked', 'Hooked']],
    mouth: [['smile', 'Smile'], ['neutral', 'Neutral'], ['grin', 'Grin'], ['smirk', 'Smirk'], ['frown', 'Frown'], ['open', 'Open']],
    lips: [['natural', 'Natural'], ['dark', 'Dark'], ['red', 'Red']],
    cheeks: [['none', 'None'], ['blush', 'Blush']],
    marks: [['none', 'None'], ['freckles', 'Freckles'], ['scar', 'Scar over eye'], ['cheekscar', 'Cheek scar'], ['tattoo', 'Tattoo'], ['warpaint', 'War paint'], ['birthmark', 'Birthmark'], ['mole', 'Beauty mark']],
    acc: [['none', 'None'], ['earrings', 'Earrings'], ['nosering', 'Nose ring'], ['eyepatch', 'Eyepatch'], ['glasses', 'Glasses'], ['monocle', 'Monocle'], ['hood', 'Hood']],
    horns: [['none', 'None'], ['small', 'Small'], ['curled', 'Curled'], ['tall', 'Tall'], ['bull', 'Bull']],
    tail: [['none', 'None'], ['devil', 'Devil'], ['cat', 'Furry'], ['reptile', 'Scaled']],
    wings: [['none', 'None'], ['feather', 'Feathered'], ['bat', 'Leathery'], ['fairy', 'Fairy']],
    extra: [['none', 'None'], ['shell', 'Shell'], ['freckles', 'Freckles'], ['scar', 'Scar'], ['tattoo', 'Face markings']],
    base: [['grass', 'Grass'], ['stone', 'Stone'], ['sand', 'Sand'], ['snow', 'Snow'], ['water', 'Water'], ['lava', 'Lava'], ['void', 'Arcane']]
  };

  // ---------- defaults that follow the lineage ----------
  var DRAGON = { black: '#3a3a44', blue: '#3d6e9e', brass: '#c9a24a', bronze: '#a0682f', copper: '#b8642f', gold: '#d9b44a', green: '#4f8a3f',
    red: '#b8382c', silver: '#c9ccd6', white: '#e8e8ee', amethyst: '#8a4ab0', crystal: '#d0e8f0', emerald: '#2f9a5a', sapphire: '#2f5ab0', topaz: '#d6a020' };
  A.lineageLook = function (lin, L, picks) {
    var id = lin ? lin.id : '', n = ((L && (L.name + ' ' + L.subName)) || '').toLowerCase();
    var k = function () { for (var i = 0; i < arguments.length; i++) if (id === arguments[i]) return true; return false; };
    var o = { height: 'medium', build: 'average', head: 'human', ears: 'round', horns: 'none', tail: 'none', wings: 'none', extra: 'none' };
    if (k('dwarf', 'duergar', 'gnome', 'deep-gnome', 'halfling', 'goblin', 'kobold', 'kender', 'grung', 'autognome', 'fairy')) o.height = 'short';
    if (k('goliath', 'firbolg', 'bugbear', 'minotaur', 'loxodon', 'centaur', 'giff', 'orc')) o.height = 'tall';
    if (k('dwarf', 'duergar', 'goliath', 'orc', 'half-orc', 'bugbear', 'minotaur', 'loxodon', 'tortle', 'giff', 'firbolg', 'warforged', 'hobgoblin')) o.build = 'broad';
    if (k('elf', 'eladrin', 'sea-elf', 'shadar-kai', 'elf-astral', 'githyanki', 'githzerai', 'kenku', 'aarakocra', 'owlin', 'fairy', 'tabaxi', 'aven', 'vedalken', 'thri-kreen')) o.build = 'slim';
    if (k('elf', 'eladrin', 'sea-elf', 'shadar-kai', 'elf-astral', 'half-elf', 'satyr', 'hobgoblin', 'firbolg', 'fairy', 'githyanki', 'githzerai', 'vampire', 'dhampir')) o.ears = 'pointed';
    if (k('goblin', 'bugbear')) o.ears = 'long';
    if (k('tabaxi', 'leonin', 'shifter', 'khenra')) { o.ears = 'cat'; o.head = 'feline'; o.tail = 'cat'; }
    if (k('harengon')) o.ears = 'rabbit';
    if (k('dragonborn', 'kobold', 'lizardfolk', 'yuan-ti', 'viashino-ua', 'tortle', 'locathah', 'triton', 'naga')) { o.head = 'reptile'; o.ears = 'none'; }
    if (k('kobold', 'lizardfolk', 'viashino-ua', 'naga')) o.tail = 'reptile';
    if (k('aarakocra', 'kenku', 'owlin', 'aven')) { o.head = 'bird'; o.ears = 'none'; }
    if (k('aarakocra', 'owlin', 'aven')) o.wings = 'feather';
    if (k('fairy')) o.wings = 'fairy';
    if (k('warforged', 'autognome', 'glitchling-ua')) { o.head = 'construct'; o.ears = 'none'; }
    if (k('orc', 'half-orc')) o.head = 'tusked';
    if (k('tiefling')) { o.horns = 'curled'; o.tail = 'devil'; }
    if (k('satyr')) o.horns = 'small';
    if (k('minotaur')) o.horns = 'bull';
    if (k('tortle')) o.extra = 'shell';
    if (k('dwarf', 'duergar')) { o.beard = 'short'; o.nose = 'broad'; o.brows = 'thick'; o.faceShape = 'square'; }
    if (k('elf', 'eladrin', 'sea-elf', 'shadar-kai', 'elf-astral', 'half-elf')) { o.eyeShape = 'almond'; o.faceShape = 'heart'; }
    if (k('orc', 'half-orc', 'goliath', 'bugbear', 'hobgoblin')) { o.faceShape = 'square'; o.nose = 'broad'; o.brows = 'thick'; }
    if (k('goliath')) o.marks = 'tattoo';
    if (k('halfling', 'gnome', 'kender')) { o.faceShape = 'round'; o.cheeks = 'blush'; o.eyeShape = 'wide'; }
    if (k('gnome')) o.nose = 'button';
    if (k('tiefling')) o.brows = 'arched';
    // skin
    var skin = null;
    if (k('tiefling')) skin = '#c8574a';
    if (k('dragonborn')) {
      var p = ((picks && picks['lin.pick0']) || [''])[0] || n;
      for (var c in DRAGON) if (p.toLowerCase().indexOf(c) >= 0) skin = DRAGON[c];
      if (!skin) skin = '#b8382c';
    }
    if (k('kobold')) skin = '#a8542f';
    if (k('lizardfolk', 'viashino-ua', 'grung', 'verdan')) skin = '#5e8f4e';
    if (k('tortle')) skin = '#7fae8c';
    if (k('yuan-ti', 'naga')) skin = '#3f6f5a';
    if (k('warforged', 'autognome')) skin = '#8f9aa8';
    if (k('goliath', 'duergar')) skin = '#8f9aa8';
    if (k('firbolg', 'triton', 'locathah', 'sea-elf', 'vedalken')) skin = '#6fa0c8';
    if (k('orc', 'half-orc')) skin = '#7fae8c';
    if (k('goblin', 'hobgoblin', 'bugbear')) skin = k('hobgoblin') ? '#c8574a' : '#d9b44a';
    if (k('genasi-air')) skin = '#c8dcec';
    if (k('genasi-earth')) skin = '#8a5434';
    if (k('genasi-fire')) skin = '#c8574a';
    if (k('genasi-water')) skin = '#3d6e9e';
    if (k('githyanki', 'githzerai')) skin = '#c9c2b4';
    if (k('shadar-kai', 'revenant-ua', 'dhampir')) skin = '#e0e0e8';
    if (/drow|dark elf/.test(n)) skin = '#4a4a52';
    if (k('tabaxi', 'leonin')) skin = '#d9b44a';
    if (k('aarakocra', 'kenku', 'owlin', 'aven')) skin = '#6b4426';
    if (k('minotaur', 'loxodon', 'giff')) skin = '#5e3a24';
    if (k('plasmoid')) skin = '#7a4ca0';
    if (skin) o.skin = skin;
    if (o.head !== 'human' && o.head !== 'tusked' || k('warforged', 'tortle')) o.hair = 'bald';
    return o;
  };

  A.defaults = { skin: '#e8b796', hairColor: '#3b2a20', eyes: '#3b6fd6', eyes2: '', hair: 'short', beard: 'none', shirt: '#2d4f7a', pants: '#4a3a2c', cloak: '', base: 'grass', hidden: {},
    faceShape: 'oval', age: 'adult', eyeShape: 'round', brows: 'thin', nose: 'small', mouth: 'smile', lips: 'natural', cheeks: 'none', marks: 'none', acc: 'none' };

  A.look = function (ch, lin, L) {
    var o = Object.assign({}, A.defaults, A.lineageLook(lin, L, ch.picks), ch.look || {});
    if (!o.hairColor) o.hairColor = A.defaults.hairColor;
    if (!(ch.look && ch.look.marks) && /^(freckles|scar|tattoo)$/.test(o.extra)) o.marks = o.extra;
    return o;
  };

  // ---------- gear: what the character wears and holds ----------
  var MELEE = {
    sword: /sword|blade|scimitar|rapier|razor|cutlass|katana|sabre|saber|brand|tongue|avenger|defender|blackrazor|nine lives|vorpal|sunsword|moonblade|luck blade|snicker|longsword|shortsword/i,
    great: /greatsword|great sword/i, axe: /axe|hatchet/i, hammer: /hammer|maul|mace|club|flail|morningstar|scepter|cudgel/i,
    spear: /spear|trident|javelin|pike|halberd|glaive|lance|dragonlance|bident|partisan/i, staff: /staff|quarterstaff|cane/i, dagger: /dagger|knife|sickle|fang|dart/i,
    whip: /whip|lash/i, bow: /bow(?!l)|moonbow/i, crossbow: /crossbow|thunderbuss|blaster/i, sling: /sling(?!er)/i, wand: /wand|rod\b|rod of/i
  };
  function weaponKind(name) {
    if (MELEE.crossbow.test(name)) return 'crossbow';
    if (/longbow|shortbow|\bbow\b|oathbow|moonbow|bow of/i.test(name)) return 'bow';
    if (MELEE.great.test(name)) return 'great';
    var order = ['dagger', 'whip', 'sling', 'axe', 'hammer', 'spear', 'staff', 'wand', 'sword'];
    for (var i = 0; i < order.length; i++) if (MELEE[order[i]].test(name)) return order[i];
    return null;
  }
  var RARITY = { Common: '#e8e8ee', Uncommon: '#6ad66a', Rare: '#5aa0ff', 'Very rare': '#c47aff', Legendary: '#ffb03a', Artifact: '#ff5a4a', Unique: '#ff5a4a', Unknown: '#e8e8ee' };
  // Pick out wearable things from armour, shield, weapons and inventory items.
  A.gear = function (ch, D) {
    var g = { armor: 'none', armorName: '', shield: false, main: null, off: null, back: null, slots: {}, magic: [] };
    var a = D.armor.filter(function (x) { return x[0] === ch.armor; })[0];
    if (a) { g.armor = a[1].toLowerCase(); g.armorName = a[0]; }
    if (ch.armor === 'spell:mage-armor') g.magic.push('#9fe0ff');
    var ca = !a && /^custom:/.test(ch.armor || '') ? (ch.customArmor || []).filter(function (x) { return 'custom:' + x.id === ch.armor; })[0] : null;
    if (ca && /^(Light|Medium|Heavy)$/.test(ca.kind)) { g.armor = ca.kind.toLowerCase(); g.armorName = ca.n || ''; }
    g.shield = !!ch.shield;
    var hidden = (ch.look && ch.look.hidden) || {};
    var weps = (ch.weapons || []).concat((ch.customWeapons || []).map(function (w) { return w.n || ''; })).map(function (n) { return { n: n, kind: weaponKind(n) }; });
    (ch.items || []).forEach(function (it) {
      if (hidden[it.id]) return;
      var n = it.n || '', color = it.k === 'magic' ? RARITY[it.r] || '#e8e8ee' : null;
      var put = function (slot) { if (!g.slots[slot]) { g.slots[slot] = { n: n, glow: color, id: it.id }; if (color) g.magic.push(color); } };
      if (/cloak|cape|mantle|piwafwi|shroud|wings of flying/i.test(n)) put('cloak');
      else if (/robe/i.test(n)) put('robe');
      else if (/\bhat\b|hat of/i.test(n)) put('hat');
      else if (/helm|helmet|cap of|headband|mask/i.test(n)) put('helm');
      else if (/circlet|crown|coronet|diadem|tiara|ioun/i.test(n)) put('circlet');
      else if (/boots|slippers|greaves|horseshoes/i.test(n)) put('boots');
      else if (/gloves|gauntlets|bracers|bracer|wraps|claws/i.test(n)) put('gloves');
      else if (/belt|girdle|cincture/i.test(n)) put('belt');
      else if (/amulet|periapt|necklace|medallion|pendant|scarab|talisman|brooch|holy symbol|badge|insignia|emblem/i.test(n)) put('neck');
      else if (/goggles|eyes of|eye patch|visor|lenses/i.test(n)) put('eyes');
      else if (/\bring\b|ring of|band of/i.test(n)) put('ring');
      else if (/orb|crystal ball|stone of|ioun/i.test(n)) put('orb');
      else if (it.k === 'magic' && /^(Armor|Weapon)$/.test(it.type || '') || weaponKind(n)) {
        var kind = weaponKind(n);
        if (kind) weps.push({ n: n, kind: kind, glow: color });
        else if (/armor|plate|mail|chain|leather|breastplate|scale/i.test(n)) { g.armorGlow = color; if (color) g.magic.push(color); }
        else if (/shield|buckler|aegis/i.test(n)) { g.shield = true; g.shieldGlow = color; if (color) g.magic.push(color); }
      }
    });
    weps = weps.filter(function (w) { return w.kind; });
    var twoHanded = /great|bow|crossbow|spear|staff/;
    if (weps.length) {
      g.main = weps[0];
      if (weps[0].glow) g.magic.push(weps[0].glow);
      var rest = weps.slice(1);
      if (!g.shield && !twoHanded.test(g.main.kind)) {
        var oh = rest.filter(function (w) { return !twoHanded.test(w.kind); })[0];
        if (oh) { g.off = oh; rest.splice(rest.indexOf(oh), 1); }
      }
      var back = rest.filter(function (w) { return /bow|great|staff|spear/.test(w.kind); })[0];
      if (back) g.back = back;
    }
    return g;
  };

  // ---------- tiny pixel canvas ----------
  function hex(c) { c = c.replace('#', ''); return [parseInt(c.substr(0, 2), 16), parseInt(c.substr(2, 2), 16), parseInt(c.substr(4, 2), 16)]; }
  function shade(c, amt) {
    var v = hex(c).map(function (x) { return Math.max(0, Math.min(255, Math.round(amt < 0 ? x * (1 + amt) : x + (255 - x) * amt))); });
    return '#' + v.map(function (x) { return ('0' + x.toString(16)).slice(-2); }).join('');
  }
  function Grid() { this.p = {}; }
  Grid.prototype.set = function (x, y, c) { if (x >= 0 && y >= 0 && x < W && y < H && c) this.p[x + ',' + y] = c; };
  Grid.prototype.rect = function (x, y, w, h, c) { for (var i = 0; i < w; i++) for (var j = 0; j < h; j++) this.set(x + i, y + j, c); };
  Grid.prototype.get = function (x, y) { return this.p[x + ',' + y]; };
  Grid.prototype.clear = function (x, y) { delete this.p[x + ',' + y]; };
  Grid.prototype.line = function (x0, y0, x1, y1, c) {
    var dx = Math.abs(x1 - x0), dy = Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1, e = dx - dy;
    for (;;) { this.set(x0, y0, c); if (x0 === x1 && y0 === y1) break; var e2 = 2 * e; if (e2 > -dy) { e -= dy; x0 += sx; } if (e2 < dx) { e += dx; y0 += sy; } }
  };
  // dark outline around everything drawn, like a classic sprite
  Grid.prototype.outline = function (c) {
    var add = [], self = this;
    Object.keys(this.p).forEach(function (k) {
      var xy = k.split(','), x = +xy[0], y = +xy[1];
      [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (d) { if (!self.get(x + d[0], y + d[1])) add.push([x + d[0], y + d[1]]); });
    });
    add.forEach(function (a) { self.set(a[0], a[1], c); });
  };

  // ---------- drawing ----------
  var METAL = '#c9d1d9', STEEL = '#8a96a3', WOOD = '#8b5a2b', LEATHER = '#7a4a28', GOLD = '#e0b040';

  function drawWeapon(g, w, hx, hy, side) {
    // hx,hy: hand position; side -1 = character's right (viewer's left), +1 = other hand
    var k = w.kind, blade = w.glow ? shade(METAL, 0.2) : METAL, edge = shade(METAL, -0.25), d = side;
    if (k === 'sword' || k === 'great') {
      var len = k === 'great' ? 15 : 11;
      g.rect(hx, hy - len, 1, len - 1, blade); g.set(hx + d, hy - len + 1, edge); g.set(hx, hy - len - 1, blade);
      for (var i = 2; i < len - 1; i++) g.set(hx + d, hy - i, edge);
      g.rect(hx - 2, hy - 1, 5, 1, k === 'great' ? STEEL : GOLD); g.rect(hx, hy, 1, 2, LEATHER); g.set(hx, hy + 2, GOLD);
    } else if (k === 'dagger') {
      g.rect(hx, hy - 5, 1, 4, blade); g.set(hx, hy - 6, blade); g.rect(hx - 1, hy - 1, 3, 1, GOLD); g.set(hx, hy, LEATHER);
    } else if (k === 'axe') {
      g.rect(hx, hy - 10, 1, 13, WOOD);
      var ax = hx - 3 * (d === -1 ? 1 : -1) * 0, dir = d === -1 ? -1 : 1;
      for (var a = 0; a < 4; a++) g.rect(dir < 0 ? hx - 1 - a : hx + 1, hy - 10 + (a < 2 ? 0 : a - 1), 1, 5 - Math.abs(a - 1), blade);
      g.line(dir < 0 ? hx - 4 : hx + 4, hy - 9, dir < 0 ? hx - 4 : hx + 4, hy - 6, edge);
    } else if (k === 'hammer') {
      g.rect(hx, hy - 9, 1, 12, WOOD); g.rect(hx - 2, hy - 12, 5, 4, STEEL); g.rect(hx - 2, hy - 12, 5, 1, METAL);
    } else if (k === 'spear') {
      g.rect(hx, hy - 18, 1, 22, WOOD); g.rect(hx, hy - 22, 1, 4, blade); g.set(hx - 1, hy - 19, blade); g.set(hx + 1, hy - 19, blade); g.set(hx, hy - 23, blade);
    } else if (k === 'staff' || k === 'wand') {
      if (k === 'wand') { g.rect(hx, hy - 6, 1, 7, WOOD); g.set(hx, hy - 7, w.glow || '#ffe08a'); }
      else { g.rect(hx, hy - 16, 1, 20, WOOD); g.rect(hx - 1, hy - 18, 3, 2, shade(WOOD, -0.2)); g.set(hx, hy - 19, w.glow || '#9fe0ff'); }
    } else if (k === 'bow') {
      var bx = hx + d * -1;
      for (var y = -9; y <= 9; y++) { var off = Math.round(Math.sqrt(Math.max(0, 81 - y * y)) / 3); g.set(bx - d * off, hy + y, WOOD); }
      g.line(bx, hy - 9, bx, hy + 9, '#e8e0cc');
    } else if (k === 'crossbow') {
      g.rect(hx - 4, hy - 1, 9, 1, WOOD); g.rect(hx - 1, hy - 4, 1, 7, STEEL); g.rect(hx + 3, hy - 3, 1, 5, STEEL); g.set(hx - 5, hy - 1, STEEL);
    } else if (k === 'whip') {
      g.rect(hx, hy - 2, 1, 3, LEATHER); g.line(hx, hy + 1, hx + 3 * d, hy + 6, LEATHER); g.line(hx + 3 * d, hy + 6, hx, hy + 10, LEATHER);
    } else if (k === 'sling') {
      g.line(hx, hy, hx + d * 2, hy + 6, LEATHER); g.rect(hx + d * 2 - 1, hy + 6, 3, 2, LEATHER);
    }
  }

  function drawBack(g, w, cx, top) {
    var k = w.kind;
    if (k === 'bow') { for (var y = 0; y < 18; y++) { var o = Math.round(Math.sin(y / 17 * Math.PI) * 3); g.set(cx + 6 - o, top + y, WOOD); g.set(cx + 6, top + y, y % 2 ? '#e8e0cc' : null); } }
    else { g.line(cx + 7, top - 2, cx - 6, top + 17, k === 'staff' ? WOOD : STEEL); if (k === 'great') g.rect(cx + 5, top, 3, 1, GOLD); }
  }

  function terrain(g, base) {
    var T = { grass: ['#5fa84a', '#3f7a32', '#6b4a2c'], stone: ['#9aa0a8', '#6b7078', '#4a4d55'], sand: ['#e0c27a', '#c4a25a', '#9a7a44'], snow: ['#eef4f8', '#c4d4e0', '#7a8a9a'],
      water: ['#4aa0d6', '#2f78b0', '#6b4a2c'], lava: ['#4a3a3a', '#2f2626', '#ff7a2a'], void: ['#5a4ab0', '#3a2f7a', '#2a2050'] }[base] || ['#5fa84a', '#3f7a32', '#6b4a2c'];
    var cy = 50, rx = 17, ry = 5;
    for (var x = -rx; x <= rx; x++) {
      var h = Math.round(ry * Math.sqrt(1 - (x * x) / (rx * rx)));
      for (var y = -h; y <= h; y++) g.set(24 + x, cy + y, ((x * 7 + y * 13) & 7) === 0 ? T[1] : T[0]);
      for (var s = 1; s <= 4; s++) g.set(24 + x, cy + h + s, s === 1 ? T[1] : base === 'lava' && ((x + s) % 5 === 0) ? '#ffb03a' : T[2]);
    }
    if (base === 'grass') [-12, -6, 8, 13, -2].forEach(function (x, i) { g.set(24 + x, cy - 3 + (i % 3), '#8fd06a'); g.set(24 + x, cy - 4 + (i % 3), '#8fd06a'); });
    if (base === 'lava') [-10, 3, 11].forEach(function (x) { g.set(24 + x, cy + 1, '#ff7a2a'); g.set(24 + x + 1, cy + 1, '#ffb03a'); });
    if (base === 'water') [-11, -3, 6, 12].forEach(function (x) { g.set(24 + x, cy - 1, '#bfe6ff'); g.set(24 + x + 1, cy - 1, '#bfe6ff'); });
    if (base === 'void') [-13, -4, 9, 14].forEach(function (x, i) { g.set(24 + x, cy - 2 + i % 3, '#c8b8ff'); });
    if (base === 'stone') [-9, 4, 11].forEach(function (x) { g.line(24 + x, cy - 2, 24 + x + 2, cy, '#6b7078'); });
  }

  A.draw = function (canvas, look, gear) {
    var L = look, gr = gear || { armor: 'none', slots: {}, magic: [] }, S = gr.slots || {};
    var g = new Grid(), back = new Grid();
    var cx = 24;
    var tw = { slim: 8, average: 10, broad: 12 }[L.build] || 10;
    var th = { short: 9, medium: 11, tall: 13 }[L.height] || 11;
    var lh = { short: 6, medium: 10, tall: 12 }[L.height] || 10;
    var feet = 51, legTop = feet - lh, torsoTop = legTop - th, headTop = torsoTop - 11;
    var tx = cx - tw / 2, skin = L.skin, skinD = shade(skin, -0.22), hair = L.hairColor;
    var robe = !!S.robe;

    // ---- behind the body ----
    if (L.wings !== 'none') {
      var wc = L.wings === 'bat' ? shade(skin, -0.35) : L.wings === 'fairy' ? '#bfe6ff' : shade(hair, 0.1);
      for (var i = 0; i < 8; i++) {
        back.rect(tx - 2 - i, torsoTop - 3 + i, 1, 9 - i, i % 2 ? wc : shade(wc, -0.15));
        back.rect(tx + tw + 1 + i, torsoTop - 3 + i, 1, 9 - i, i % 2 ? wc : shade(wc, -0.15));
      }
    }
    if (L.tail !== 'none') {
      var tc = L.tail === 'cat' ? hair : L.tail === 'devil' ? skinD : shade(skin, -0.1);
      back.line(cx + 2, legTop, cx + 8, legTop + 6, tc); back.line(cx + 8, legTop + 6, cx + 11, legTop + 3, tc);
      if (L.tail === 'devil') { back.rect(cx + 11, legTop + 1, 2, 2, tc); back.set(cx + 12, legTop, tc); }
      if (L.tail === 'reptile') back.line(cx + 3, legTop + 1, cx + 9, legTop + 7, tc);
    }
    if (S.cloak) {
      var cc = L.cloak || shade(L.shirt, -0.3);
      back.rect(tx - 2, torsoTop, tw + 4, th + lh - 2, cc);
      for (var cy2 = 0; cy2 < th + lh - 2; cy2 += 2) back.set(tx - 2, torsoTop + cy2, shade(cc, -0.2));
    }
    if (L.extra === 'shell') back.rect(tx - 2, torsoTop - 1, tw + 4, th + 2, '#6b5a3a');
    if (gr.back) drawBack(back, gr.back, cx, torsoTop - 2);
    if (L.hair === 'long' || L.hair === 'braids') back.rect(cx - 6, headTop + 2, 12, 12, hair);
    if (L.hair === 'ponytail') { back.rect(cx + 4, headTop + 3, 3, 8, hair); }

    // ---- legs and feet ----
    var pants = gr.armor === 'heavy' ? STEEL : gr.armor === 'medium' ? shade(L.pants, -0.1) : L.pants;
    var lw = Math.max(3, tw / 2 - 1);
    g.rect(tx, legTop, lw, lh, pants); g.rect(tx + tw - lw, legTop, lw, lh, pants);
    g.rect(tx + lw, legTop, tw - 2 * lw, 2, pants);
    if (gr.armor === 'heavy') { g.rect(tx, legTop + 2, lw, 1, METAL); g.rect(tx + tw - lw, legTop + 2, lw, 1, METAL); }
    var boot = S.boots ? shade(S.boots.glow ? '#4a3a6b' : LEATHER, 0.05) : gr.armor === 'heavy' ? STEEL : '#4a3020';
    g.rect(tx - 1, feet - 2, lw + 1, 3, boot); g.rect(tx + tw - lw, feet - 2, lw + 1, 3, boot);

    // ---- torso ----
    var shirt = L.shirt, torsoC = shirt;
    if (gr.armor === 'light') torsoC = LEATHER;
    if (gr.armor === 'medium') torsoC = STEEL;
    if (gr.armor === 'heavy') torsoC = METAL;
    g.rect(tx, torsoTop, tw, th, torsoC);
    if (gr.armor === 'medium') for (var my = 0; my < th; my++) for (var mx = 0; mx < tw; mx++) if ((mx + my) % 2) g.set(tx + mx, torsoTop + my, shade(STEEL, -0.15));
    if (gr.armor === 'medium' && /Breastplate|Half Plate/.test(gr.armorName)) g.rect(tx + 1, torsoTop + 1, tw - 2, th - 4, METAL);
    if (gr.armor === 'heavy') { g.rect(tx, torsoTop, tw, 1, shade(METAL, 0.3)); g.rect(cx - 1, torsoTop + 1, 2, th - 2, shade(METAL, -0.15)); g.rect(tx, torsoTop + th - 3, tw, 1, STEEL); }
    if (gr.armor === 'light') { g.rect(cx - 1, torsoTop, 2, th, shade(shirt, 0)); for (var sy = 1; sy < th; sy += 2) g.set(cx - 2, torsoTop + sy, shade(LEATHER, 0.3)); }
    if (gr.armor === 'none') { g.rect(tx, torsoTop, tw, 2, shade(shirt, 0.15)); g.set(cx - 1, torsoTop + 1, skin); g.set(cx, torsoTop + 1, skin); g.set(cx - 1, torsoTop + 2, skinD); g.set(cx, torsoTop + 2, skinD); }
    if (gr.armorGlow) { g.set(tx + 1, torsoTop + 2, gr.armorGlow); g.set(tx + tw - 2, torsoTop + 4, gr.armorGlow); }
    if (robe) { g.rect(tx - 1, torsoTop + th - 2, tw + 2, lh, L.cloak || shade(shirt, 0.05)); g.rect(cx - 1, torsoTop, 2, th + lh - 2, shade(L.cloak || shirt, -0.2)); }
    // belt
    var beltC = S.belt ? GOLD : '#3a2a1a';
    g.rect(tx, torsoTop + th - 2, tw, 1, beltC); g.set(cx - 1, torsoTop + th - 2, GOLD);
    // shoulders / arms
    var armC = gr.armor === 'heavy' ? METAL : gr.armor === 'medium' ? STEEL : shirt;
    var al = th - 1, ax0 = tx - 3, ax1 = tx + tw;
    g.rect(ax0, torsoTop + 1, 3, al, armC); g.rect(ax1, torsoTop + 1, 3, al, armC);
    if (gr.armor === 'heavy') { g.rect(ax0 - 1, torsoTop, 4, 3, shade(METAL, 0.2)); g.rect(ax1, torsoTop, 4, 3, shade(METAL, 0.2)); }
    if (gr.armor === 'light' || gr.armor === 'none') { g.rect(ax0, torsoTop + al - 3, 3, 3, skin); g.rect(ax1, torsoTop + al - 3, 3, 3, skin); }
    var hand = S.gloves ? (S.gloves.glow ? shade('#4a3a6b', 0.1) : LEATHER) : gr.armor === 'heavy' ? STEEL : skin;
    var handY = torsoTop + al + 1;
    g.rect(ax0, handY, 3, 2, hand); g.rect(ax1, handY, 3, 2, hand);
    if (S.ring) g.set(ax1 + 1, handY + 1, GOLD);

    // ---- head ----
    var hx = cx - 5;
    g.rect(cx - 1, torsoTop - 1, 2, 1, skinD); // neck
    g.rect(hx, headTop, 10, 10, skin); g.rect(hx, headTop + 9, 10, 1, skinD); g.set(hx, headTop, null);
    g.clear(hx, headTop); g.clear(hx + 9, headTop); g.clear(hx, headTop + 9); g.clear(hx + 9, headTop + 9);
    // ears
    var ec = skin;
    if (L.ears === 'round') { g.set(hx - 1, headTop + 4, ec); g.set(hx - 1, headTop + 5, skinD); g.set(hx + 10, headTop + 4, ec); g.set(hx + 10, headTop + 5, skinD); }
    if (L.ears === 'pointed') { g.set(hx - 1, headTop + 4, ec); g.set(hx - 2, headTop + 3, ec); g.set(hx - 1, headTop + 5, skinD); g.set(hx + 10, headTop + 4, ec); g.set(hx + 11, headTop + 3, ec); g.set(hx + 10, headTop + 5, skinD); }
    if (L.ears === 'long') { g.line(hx - 1, headTop + 5, hx - 4, headTop + 3, ec); g.line(hx - 1, headTop + 4, hx - 3, headTop + 3, ec); g.line(hx + 10, headTop + 5, hx + 13, headTop + 3, ec); g.line(hx + 10, headTop + 4, hx + 12, headTop + 3, ec); }
    // face
    var eyeY = headTop + 5;
    if (L.head === 'construct') { g.rect(hx + 1, eyeY - 1, 8, 2, '#3a3f48'); g.set(hx + 2, eyeY - 1, L.eyes); g.set(hx + 7, eyeY - 1, L.eyes); g.rect(hx + 3, headTop + 8, 4, 1, '#3a3f48'); }
    else {
      g.set(hx + 2, eyeY, '#ffffff'); g.set(hx + 3, eyeY, L.eyes); g.set(hx + 7, eyeY, '#ffffff'); g.set(hx + 6, eyeY, L.eyes);
      g.set(hx + 3, eyeY - 1, shade(skin, -0.3)); g.set(hx + 6, eyeY - 1, shade(skin, -0.3));
      if (L.head === 'bird') { g.rect(hx + 4, eyeY + 1, 2, 2, '#e0a020'); g.set(hx + 4, eyeY + 3, '#b07a10'); g.set(hx + 5, eyeY + 3, '#b07a10'); }
      else if (L.head === 'reptile') { g.rect(hx + 2, eyeY + 2, 6, 3, shade(skin, 0.1)); g.set(hx + 3, eyeY + 2, skinD); g.set(hx + 6, eyeY + 2, skinD); g.rect(hx + 3, eyeY + 4, 4, 1, skinD); for (var r = 0; r < 3; r++) g.set(hx + 3 + r * 2, headTop - 1, shade(skin, -0.2)); }
      else if (L.head === 'feline') { g.set(hx + 4, eyeY + 2, '#d67a8a'); g.set(hx + 5, eyeY + 2, '#d67a8a'); g.set(hx + 4, eyeY + 3, skinD); g.set(hx + 5, eyeY + 3, skinD); g.set(hx + 1, eyeY + 2, shade(skin, 0.3)); g.set(hx + 8, eyeY + 2, shade(skin, 0.3)); }
      else {
        g.set(hx + 4, eyeY + 2, skinD); g.rect(hx + 4, eyeY + 3, 2, 1, shade(skin, -0.35));
        if (L.head === 'tusked') { g.set(hx + 3, eyeY + 3, '#f0ead8'); g.set(hx + 6, eyeY + 3, '#f0ead8'); g.set(hx + 3, eyeY + 2, '#f0ead8'); g.set(hx + 6, eyeY + 2, '#f0ead8'); }
      }
    }
    if (L.extra === 'freckles') { g.set(hx + 2, eyeY + 2, skinD); g.set(hx + 7, eyeY + 2, skinD); g.set(hx + 3, eyeY + 2, skinD); }
    if (L.extra === 'scar') g.line(hx + 6, eyeY - 2, hx + 8, eyeY + 2, shade(skin, -0.4));
    if (L.extra === 'tattoo') { g.set(hx + 1, eyeY + 1, '#3f6fd0'); g.set(hx + 8, eyeY + 1, '#3f6fd0'); g.set(hx + 4, headTop + 2, '#3f6fd0'); g.set(hx + 5, headTop + 2, '#3f6fd0'); }
    // beard
    if (L.beard !== 'none') {
      var bc = hair;
      if (L.beard === 'mustache') { g.rect(hx + 2, eyeY + 3, 6, 1, bc); g.set(hx + 2, eyeY + 4, bc); g.set(hx + 7, eyeY + 4, bc); }
      else if (L.beard === 'stubble') { for (var bx2 = 2; bx2 < 8; bx2++) if (bx2 % 2) g.set(hx + bx2, headTop + 8, shade(skin, -0.25)); }
      else {
        g.rect(hx + 1, headTop + 7, 8, 3, bc); g.rect(hx + 4, eyeY + 3, 2, 1, shade(skin, -0.35)); g.set(hx + 1, headTop + 6, bc); g.set(hx + 8, headTop + 6, bc);
        if (L.beard === 'long' || L.beard === 'braided') g.rect(hx + 2, headTop + 10, 6, L.beard === 'long' ? 5 : 3, bc);
        if (L.beard === 'braided') { g.rect(hx + 3, headTop + 13, 1, 4, bc); g.rect(hx + 6, headTop + 13, 1, 4, bc); g.set(hx + 3, headTop + 17, GOLD); g.set(hx + 6, headTop + 17, GOLD); }
      }
    }
    // hair
    var hl = shade(hair, 0.2);
    if (L.hair !== 'bald') {
      if (L.hair === 'mohawk') { g.rect(cx - 1, headTop - 3, 2, 5, hair); g.set(cx - 1, headTop - 3, hl); }
      else {
        g.rect(hx, headTop - 1, 10, 3, hair); g.rect(hx - 1, headTop, 1, 4, hair); g.rect(hx + 10, headTop, 1, 4, hair);
        g.rect(hx + 1, headTop - 1, 4, 1, hl);
        if (L.hair === 'messy') { g.set(hx + 2, headTop - 2, hair); g.set(hx + 6, headTop - 2, hair); g.set(hx + 8, headTop + 2, hair); g.set(hx + 1, headTop + 2, hair); }
        if (L.hair === 'long' || L.hair === 'braids') { g.rect(hx - 1, headTop + 4, 1, 8, hair); g.rect(hx + 10, headTop + 4, 1, 8, hair); }
        if (L.hair === 'braids') { g.set(hx - 1, headTop + 12, GOLD); g.set(hx + 10, headTop + 12, GOLD); }
        if (L.hair === 'bun') { g.rect(cx - 2, headTop - 4, 4, 3, hair); g.set(cx - 1, headTop - 4, hl); }
      }
    }
    if (L.ears === 'cat') { g.rect(hx, headTop - 3, 2, 3, skin); g.set(hx, headTop - 4, skin); g.rect(hx + 8, headTop - 3, 2, 3, skin); g.set(hx + 9, headTop - 4, skin); g.set(hx + 1, headTop - 2, '#d67a8a'); g.set(hx + 8, headTop - 2, '#d67a8a'); }
    if (L.ears === 'rabbit') { g.rect(hx + 1, headTop - 7, 2, 7, skin); g.rect(hx + 7, headTop - 7, 2, 7, skin); g.rect(hx + 2, headTop - 6, 1, 5, '#e8b0b8'); g.rect(hx + 7, headTop - 6, 1, 5, '#e8b0b8'); }
    // horns
    var hc = '#3a302a';
    if (L.horns === 'small') { g.set(hx + 2, headTop - 1, hc); g.set(hx + 7, headTop - 1, hc); g.set(hx + 2, headTop - 2, hc); g.set(hx + 7, headTop - 2, hc); }
    if (L.horns === 'curled') { g.line(hx + 1, headTop, hx - 1, headTop - 3, hc); g.set(hx, headTop - 4, hc); g.set(hx + 1, headTop - 4, hc); g.line(hx + 8, headTop, hx + 10, headTop - 3, hc); g.set(hx + 9, headTop - 4, hc); g.set(hx + 8, headTop - 4, hc); }
    if (L.horns === 'tall') { g.line(hx + 2, headTop, hx + 1, headTop - 5, hc); g.line(hx + 7, headTop, hx + 8, headTop - 5, hc); }
    if (L.horns === 'bull') { g.line(hx, headTop + 1, hx - 3, headTop - 1, '#e8dcc0'); g.set(hx - 3, headTop - 2, '#e8dcc0'); g.line(hx + 9, headTop + 1, hx + 12, headTop - 1, '#e8dcc0'); g.set(hx + 12, headTop - 2, '#e8dcc0'); }
    // headgear
    if (S.hat) { var hcol = S.hat.glow ? '#3f3a78' : '#4a3a2c'; g.rect(hx - 2, headTop, 14, 1, hcol); g.rect(hx + 1, headTop - 4, 8, 4, hcol); g.rect(hx + 3, headTop - 7, 4, 3, hcol); g.rect(hx + 5, headTop - 9, 2, 2, hcol); g.rect(hx + 1, headTop - 1, 8, 1, GOLD); }
    else if (S.helm) { g.rect(hx - 1, headTop - 2, 12, 5, STEEL); g.rect(hx - 1, headTop - 2, 12, 1, METAL); g.rect(cx - 1, headTop + 3, 2, 3, STEEL); g.rect(hx - 1, headTop + 3, 1, 4, STEEL); g.rect(hx + 10, headTop + 3, 1, 4, STEEL); }
    else if (S.circlet) { g.rect(hx, headTop + 1, 10, 1, GOLD); g.set(cx - 1, headTop, S.circlet.glow || '#5aa0ff'); g.set(cx, headTop, S.circlet.glow || '#5aa0ff'); }
    if (S.eyes) { g.rect(hx + 1, eyeY - 1, 8, 2, '#3a2a1a'); g.rect(hx + 2, eyeY - 1, 2, 2, '#9fe0ff'); g.rect(hx + 6, eyeY - 1, 2, 2, '#9fe0ff'); }
    if (S.neck) { g.set(cx - 2, torsoTop + 1, GOLD); g.set(cx + 1, torsoTop + 1, GOLD); g.rect(cx - 1, torsoTop + 2, 2, 2, S.neck.glow || '#c42f2f'); }
    if (S.cloak) { var ccl = L.cloak || shade(L.shirt, -0.3); g.rect(tx - 1, torsoTop - 1, 3, 2, ccl); g.rect(tx + tw - 2, torsoTop - 1, 3, 2, ccl); g.set(cx - 1, torsoTop, GOLD); }

    // ---- things held ----
    if (gr.main) drawWeapon(g, gr.main, ax0 + 1, handY, -1);
    if (gr.shield) {
      var sc = gr.shieldGlow ? '#3f5aa0' : '#8a5a2c', sx = ax1 - 1, sy = handY - 5;
      g.rect(sx, sy, 6, 8, sc); g.rect(sx + 1, sy + 8, 4, 1, sc); g.rect(sx + 2, sy + 9, 2, 1, sc);
      g.rect(sx, sy, 6, 1, METAL); g.rect(sx + 2, sy + 2, 2, 3, METAL);
      if (gr.shieldGlow) g.set(sx + 1, sy + 1, gr.shieldGlow);
    } else if (gr.off) drawWeapon(g, gr.off, ax1 + 1, handY, 1);
    else if (S.orb) { g.rect(ax1, handY - 3, 3, 3, S.orb.glow || '#9fe0ff'); g.set(ax1, handY - 3, '#ffffff'); }

    // ---- compose: back layer under body, outline, sparkles, terrain ----
    Object.keys(g.p).forEach(function (k) { back.p[k] = g.p[k]; });
    back.outline('#1a1622');
    var out = new Grid();
    terrain(out, L.base);
    Object.keys(back.p).forEach(function (k) { out.p[k] = back.p[k]; });
    var sp = [[cx - 12, headTop + 2], [cx + 12, torsoTop + 3], [cx - 13, legTop + 2], [cx + 11, headTop - 3], [cx + 13, legTop + 6]];
    (gr.magic || []).slice(0, 5).forEach(function (c, i) { var p = sp[i]; out.set(p[0], p[1], c); out.set(p[0] - 1, p[1], shade(c, -0.3)); out.set(p[0] + 1, p[1], shade(c, -0.3)); out.set(p[0], p[1] - 1, shade(c, -0.3)); out.set(p[0], p[1] + 1, shade(c, -0.3)); });

    canvas.width = W; canvas.height = H;
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, W, H);
    Object.keys(out.p).forEach(function (k) { var xy = k.split(','); ctx.fillStyle = out.p[k]; ctx.fillRect(+xy[0], +xy[1], 1, 1); });
    return canvas;
  };

  A.random = function () {
    var pick = function (a) { return a[Math.floor(Math.random() * a.length)]; };
    var ids = function (k) { return A.OPTIONS[k].map(function (x) { return x[0]; }); };
    var o = { skin: pick(A.SKINS.slice(0, 7)), hairColor: pick(A.HAIRS), eyes: pick(A.EYES), hair: pick(ids('hair')), beard: Math.random() < 0.6 ? 'none' : pick(ids('beard')),
      shirt: pick(A.CLOTH), pants: pick(A.CLOTH), base: pick(ids('base')) };
    ['faceShape', 'eyeShape', 'brows', 'nose', 'mouth'].forEach(function (k) { o[k] = pick(ids(k)); });
    o.age = Math.random() < 0.7 ? 'adult' : pick(ids('age'));
    o.cheeks = Math.random() < 0.3 ? 'blush' : 'none';
    o.marks = Math.random() < 0.6 ? 'none' : pick(ids('marks'));
    o.acc = Math.random() < 0.6 ? 'none' : pick(ids('acc'));
    return o;
  };

  A._shade = shade;
  root.Avatar = A;
})(typeof window !== 'undefined' ? window : globalThis);
