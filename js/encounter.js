// Encounters: build a fight against your party (2014 DMG difficulty), then run it with initiative and hit points.
(function (root) {
  'use strict';
  // XP thresholds per character level: easy, medium, hard, deadly (Dungeon Master's Guide 2014)
  var THRESH = [null, [25, 50, 75, 100], [50, 100, 150, 200], [75, 150, 225, 400], [125, 250, 375, 500], [250, 500, 750, 1100], [300, 600, 900, 1400],
    [350, 750, 1100, 1700], [450, 900, 1400, 2100], [550, 1100, 1600, 2400], [600, 1200, 1900, 2800], [800, 1600, 2400, 3600], [1000, 2000, 3000, 4500],
    [1100, 2200, 3400, 5100], [1250, 2500, 3800, 5700], [1400, 2800, 4300, 6400], [1600, 3200, 4800, 7200], [2000, 3900, 5900, 8800], [2100, 4200, 6300, 9500],
    [2400, 4900, 7300, 10900], [2800, 5700, 8500, 12700]];
  var MULT = [0.5, 1, 1.5, 2, 2.5, 3, 4, 5], LABELS = ['Easy', 'Medium', 'Hard', 'Deadly'];

  // Where a monster lives, guessed from its name (in the spirit of the DMG's "monsters by environment" lists).
  // Common folk such as bandits and scouts are found in most places.
  var ROAMERS = 'badger|giant badger|weasel|giant weasel|mule|giant centipede|swarm of beetles|swarm of centipedes|swarm of wasps|giant fire beetle|bandit|bandit captain|scout|berserker|cultist|cult fanatic|tribal warrior|druid|veteran|thug|wolf|giant eagle|vulture|hawk|raven|eagle';
  var ENV = {
    Arctic: 'ice|frost|winter|polar bear|yeti|abominable yeti|remorhaz|white dragon|silver dragon|mammoth|saber-toothed tiger|giant owl|owlbear|dire wolf|winter wolf|frost giant|ice mephit|crag cat|snow|elk|giant elk|reindeer|seal|orca|walrus',
    Coast: 'sahuagin|merrow|merfolk|harpy|roc|crab|giant crab|pteranodon|plesiosaurus|bronze dragon|sea hag|pirate|kuo-toa|water elemental|steam mephit|guard|ogre|lizardfolk|giant lizard|griffon|banshee|blue dragon|marid|sea|reef shark|giant octopus|giant toad|swashbuckler|wereshark',
    Desert: 'desert|death dog|flying snake|medusa|behir|dust|sand|blue dragon|brass dragon|camel|jackal|werejackal|mummy|mummy lord|sphinx|androsphinx|gynosphinx|lamia|gnoll|scorpion|giant scorpion|hyena|giant hyena|purple worm|yuan-ti|yuan-ti pureblood|yuan-ti abomination|yuan-ti malison|djinni|efreeti|fire elemental|air elemental|dust mephit|hobgoblin|cockatrice|constrictor snake|giant constrictor snake|giant vulture|ghoul|lion|giant spider|wraith|hell hound|salamander|bulette|thri-kreen',
    Forest: 'green dragon|worg|flying snake|oni|elf|dryad|satyr|treant|awakened tree|awakened shrub|unicorn|pixie|sprite|blink dog|owlbear|boar|giant boar|black bear|brown bear|elk|dire wolf|ape|giant ape|spider|giant spider|ettercap|centaur|gnoll|goblin|bugbear|hobgoblin|kobold|orc|pseudodragon|faerie dragon|will-o\'-wisp|werewolf|werebear|wereboar|weretiger|tiger|panther|green hag|banshee|shambling mound|giant owl|owl|hippogriff|gorgon|troll|wood woad|displacer beast|grick|stirge|swarm of insects|giant wasp|giant badger|deer|blights?|needle blight|twig blight|vine blight|wolf|dryad|couatl|baboon|harpy|giant elk|wolf|wyvern|druid|elk',
    Grassland: 'gold dragon|rhinoceros|worg|death dog|centaur|gnoll|goblin|hobgoblin|orc|ogre|lion|elephant|mammoth|hyena|giant hyena|jackal|griffon|hippogriff|pegasus|ankheg|bulette|wyvern|cockatrice|chimera|axe beak|triceratops|allosaurus|tyrannosaurus rex|ankylosaurus|horse|riding horse|warhorse|draft horse|pony|cattle|wereboar|weretiger|elk|giant elk|boar|giant boar|giant wasp|swarm of insects|cyclops|blink dog|panther|tiger|wolf|hill giant|couatl|gorgon|manticore|giant goat|scarecrow',
    Hill: 'copper dragon|red dragon|hill giant|ogre|orc|orc eye of gruumsh|orog|goblin|bugbear|hobgoblin|griffon|hippogriff|manticore|werewolf|wyvern|bulette|ettin|peryton|giant goat|goat|giant elk|elk|lion|hyena|dwarf|halfling|green hag|chimera|cyclops|harpy|owlbear|troll|stone giant|wolf|dire wolf|giant boar|boar|pegasus|galeb duhr',
    Mountain: 'red dragon|silver dragon|copper dragon|stone giant|cloud giant|storm giant|fire giant|frost giant|roc|griffon|manticore|chimera|wyvern|aarakocra|galeb duhr|gargoyle|giant goat|goat|ogre|orc|troll|air elemental|earth elemental|basilisk|hippogriff|peryton|pteranodon|young red dragon|azer|salamander|dwarf|duergar|giant eagle|perytons?|ettin|kenku|harpy|yeti|crag cat|giant elk|hell hound|spectator',
    Swamp: 'black dragon|lizardfolk|lizard king|lizard queen|bullywug|crocodile|giant crocodile|hydra|shambling mound|will-o\'-wisp|hag|green hag|sea hag|ghoul|ghast|frog|giant frog|toad|giant toad|yuan-ti|troll|water weird|naga|spirit naga|bone naga|giant snake|constrictor snake|giant constrictor snake|poisonous snake|giant poisonous snake|stirge|swarm of insects|mud mephit|otyugh|kuo-toa|swarm of poisonous snakes|swarm of rats|lizard|giant lizard|wererat|zombie|wight|banshee|black pudding|ochre jelly|vine blight|catoblepas|froghemoth|grung',
    Underdark: 'drow|kruthik|behir|deep dragon|oblex|drow elite warrior|drow mage|drow priestess of lolth|duergar|deep gnome|svirfneblin|mind flayer|beholder|spectator|aboleth|hook horror|grick|grick alpha|umber hulk|purple worm|roper|piercer|cloaker|darkmantle|kuo-toa|myconid|gas spore|violet fungus|shrieker|carrion crawler|gelatinous cube|ochre jelly|black pudding|gray ooze|otyugh|troglodyte|quaggoth|grimlock|chuul|xorn|earth elemental|giant spider|phase spider|drider|bat|giant bat|swarm of bats|minotaur|nothic|gibbering mouther|rust monster|basilisk|kobold|goblin|bugbear|ghoul|ghast|cave|spirit naga|bone naga|salamander|fire giant|dwarf|intellect devourer|derro|rat|giant rat|swarm of rats|giant centipede|mimic|wraith',
    Underwater: 'aboleth|kraken|sahuagin|sahuagin priestess|sahuagin baron|merfolk|merrow|marid|dragon turtle|sea hag|shark|reef shark|hunter shark|giant shark|octopus|giant octopus|plesiosaurus|killer whale|orca|eel|giant eel|water elemental|storm giant|chuul|kuo-toa|sea horse|giant sea horse|quipper|swarm of quippers|water weird|bronze dragon|sea|whale|squid|giant crab|crab|wereshark|scrag|sea spawn',
    City: 'bandit|bandit captain|guard|veteran|knight|noble|commoner|acolyte|priest|mage|archmage|spy|thug|assassin|cultist|cult fanatic|gladiator|swashbuckler|wererat|rat|giant rat|swarm of rats|cat|mastiff|doppelganger|vampire|vampire spawn|ghost|ghoul|ghast|imp|quasit|kenku|mimic|invisible stalker|gargoyle|smoke mephit|zombie|skeleton|specter|shadow|succubus|incubus|rakshasa|crawling claw|flying sword|animated armor|rug of smothering|homunculus|helmed horror|stone golem|iron golem|clay golem|flesh golem|shield guardian|pseudodragon|faerie dragon|otyugh|gelatinous cube|carrion crawler|raven|swarm of ravens|deva|planetar|spirit naga|lich|mummy|wight|poltergeist|will-o\'-wisp|merchant|bard|monk|pirate|dwarf|halfling|gnome|elf|bugbear|kobold|goblin|half-ogre|hobgoblin|yuan-ti pureblood|drow|duergar|bodak|nalfeshnee|night hag|cloaker|intellect devourer|mind flayer|gnoll'
  };
  var ENV_RX = {};
  Object.keys(ENV).forEach(function (k) { ENV_RX[k] = new RegExp('\\b(?:' + ENV[k] + (k === 'Underwater' ? '' : '|' + ROAMERS) + ')s?\\b', 'i'); });
  function fits(m, env) {
    if (!env) return true;
    var name = m.n.replace(/\s*\(.*\)$/, '');
    if (ENV_RX[env].test(name)) return true;
    // Anything that only swims belongs underwater (or on a coast).
    var mv = String(m.sp || m.mv || '').toLowerCase();
    return (env === 'Underwater' || env === 'Coast') && /swim/.test(mv) && !/fly/.test(mv) && (/^\s*(?:swim|0 ft|5 ft)/.test(mv) || (m.mv && !/walk/.test(mv))) && m.type === 'beast';
  }

  // The arithmetic, kept apart so it can be tested without a page.
  function rate(partyLevels, monsterXps) {
    var t = [0, 0, 0, 0];
    partyLevels.forEach(function (l) { var r = THRESH[Math.max(1, Math.min(20, l | 0))]; for (var i = 0; i < 4; i++) t[i] += r[i]; });
    var n = monsterXps.length, base = monsterXps.reduce(function (a, b) { return a + b; }, 0);
    var idx = n === 0 ? 1 : n === 1 ? 1 : n === 2 ? 2 : n <= 6 ? 3 : n <= 10 ? 4 : n <= 14 ? 5 : 6;
    if (partyLevels.length && partyLevels.length < 3) idx++; else if (partyLevels.length >= 6) idx--;
    var mult = MULT[Math.max(0, Math.min(7, idx))], adj = Math.round(base * mult), level = -1;
    for (var i = 0; i < 4; i++) if (adj >= t[i]) level = i;
    return { thresholds: t, base: base, mult: mult, adjusted: adj, level: level, label: level < 0 ? 'Trivial' : LABELS[level] };
  }

  root.EncounterUI = function (api) {
    var esc = api.esc, btn = api.btn, ui = api.ui, store = api.store, MON = api.MON, R = api.R;
    var E = ui.enc = ui.enc || { q: '', crMin: '', crMax: '', type: '', env: '', diff: 'Medium', open: '' };
    function cur() {
      store.encounter = store.encounter || { name: '', party: [{ n: 4, lvl: 3 }], mons: [] };
      return store.encounter;
    }
    function xpOf(m) { return m.xp != null ? m.xp : (MON.XP[m.cr] || 0); }
    function partyLevels(enc) {
      var out = [];
      enc.party.forEach(function (p) {
        if (p.charId) { var c = store.chars.filter(function (x) { return x.id === p.charId; })[0]; if (c) out.push(R.derive(c, store.filters).level); }
        else if (p.partyId) { var pt = partyById(p.partyId); if (pt) pt.m.forEach(function (m) { out.push(+m.lvl || 1); }); }
        else for (var i = 0; i < (p.n | 0); i++) out.push(p.lvl | 0 || 1);
      });
      return out;
    }
    function rated(enc) {
      var xps = [];
      enc.mons.forEach(function (x) { var m = MON.find(x.id); if (m) for (var i = 0; i < x.count; i++) xps.push(xpOf(m)); });
      return rate(partyLevels(enc), xps);
    }

    // ----- parties: the DM's list of player characters (name, class, level, AC, hit points) -----
    function parties() { return store.parties = store.parties || []; }
    function partyById(id) { return parties().filter(function (x) { return x.id === id; })[0]; }
    function curParty() { var l = parties(); return partyById(E.party) || l[0] || null; }
    function newMember() { return { id: R.uid(), n: '', cls: '', lvl: 1, ac: 10, hp: 10, cur: 10 }; }
    function summary(pt) {
      var m = pt.m, lv = m.map(function (x) { return +x.lvl || 1; });
      if (!m.length) return 'No characters yet.';
      return m.length + ' character' + (m.length === 1 ? '' : 's') + ', level ' + (Math.min.apply(null, lv) === Math.max.apply(null, lv) ? lv[0] : Math.min.apply(null, lv) + '–' + Math.max.apply(null, lv)) +
        ' · average AC ' + Math.round(m.reduce(function (a, x) { return a + (+x.ac || 0); }, 0) / m.length) + ' · HP ' + m.reduce(function (a, x) { return a + (+x.cur || 0); }, 0) + '/' + m.reduce(function (a, x) { return a + (+x.hp || 0); }, 0);
    }
    function partyPage() {
      var l = parties(), pt = curParty();
      if (!pt) return '<main class="mon-main"><h2>Party</h2><p class="muted">Keep your players’ characters here (name, class, level, AC, hit points). The encounter builder uses them to tell how hard a fight is, and their hit points carry over from fight to fight.</p>' + btn('partyNew', '+ New party', {}, 'btn primary') + '</main>';
      var classes = (root.DND && root.DND.classes || []).map(function (c) { return '<option value="' + esc(c.name) + '">'; }).join('');
      var chars = store.chars.filter(function (c) { return c.classes && c.classes.length; });
      var f = function (m, k, type, label, w) { return '<label class="pm-f' + (w ? ' ' + w : '') + '"><span>' + label + '</span><input type="' + type + '"' + (type === 'number' ? ' inputmode="numeric" min="0"' : '') + (k === 'cls' ? ' list="pm-classes"' : '') + ' id="pm-' + k + '-' + m.id + '" data-pm="' + m.id + '" data-f="' + k + '" value="' + esc(m[k] == null ? '' : m[k]) + '"></label>'; };
      var rows = pt.m.map(function (m) {
        var pct = m.hp ? Math.max(0, Math.min(100, Math.round(m.cur / m.hp * 100))) : 0;
        return '<div class="panel pm' + (m.hp && m.cur <= 0 ? ' down' : '') + '"><div class="pm-row">' + f(m, 'n', 'text', 'Name', 'wide') + f(m, 'cls', 'text', 'Class', 'wide') + f(m, 'lvl', 'number', 'Level') + f(m, 'ac', 'number', 'AC') + f(m, 'hp', 'number', 'Max HP') + btn('partyRm', '✕', { v: m.id }, 'btn small') + '</div>' +
          '<div class="pm-hp"><span><b>' + m.cur + '</b>/' + m.hp + ' HP</span><div class="hpbar"><span style="width:' + pct + '%"></span></div><div class="enc-adj">' + ['-10', '-5', '-1', '+1', '+5', '+10'].map(function (v) { return btn('partyHp', v.replace('-', '−'), { v: m.id, d: v }, 'btn small'); }).join('') + '</div></div></div>';
      }).join('');
      return '<main class="mon-main"><h2>Party</h2><datalist id="pm-classes">' + classes + '</datalist>' +
        '<div class="toolbar">' + (l.length > 1 ? '<select data-partypick="1" aria-label="Choose a party">' + l.map(function (x) { return '<option value="' + x.id + '"' + (x === pt ? ' selected' : '') + '>' + esc(x.name || 'Unnamed party') + '</option>'; }).join('') + '</select>' : '') + btn('partyNew', '+ New party', {}, 'btn small') + '</div>' +
        '<div class="panel"><label class="field"><span>Party name</span><input type="text" id="party-name" data-partyname="1" value="' + esc(pt.name || '') + '" placeholder="The Brave Fools"></label><p class="small muted" style="margin:.4rem 0 0">' + esc(summary(pt)) + '</p>' +
        '<div class="toolbar">' + btn('partyPlan', root.Icon('swords') + ' Plan an encounter for them', {}, 'btn primary') + btn('partyRest', 'Long rest: full HP', {}, 'btn small') + '</div></div>' +
        rows + '<div class="toolbar">' + btn('partyAdd', '+ Add a character', {}, 'btn') +
        (chars.length ? '<select data-partychar="1" aria-label="Add one of my characters"><option value="">+ One of my characters…</option>' + chars.map(function (c) { return '<option value="' + c.id + '">' + esc(c.name || 'Unnamed character') + '</option>'; }).join('') + '</select>' : '') + '</div>' +
        '<div class="toolbar">' + (E.delParty ? '<span>Delete “' + esc(pt.name || 'this party') + '”?</span>' + btn('partyDel', 'Yes, delete', {}, 'btn small danger') + btn('partyDelNo', 'No', {}, 'btn small') : btn('partyDelAsk', 'Delete this party', {}, 'btn small')) + '</div></main>';
    }

    // ----- building -----
    function pickerHtml() {
      var q = E.q.toLowerCase(), lo = E.crMin === '' ? -1 : +E.crMin, hi = E.crMax === '' ? 99 : +E.crMax;
      var list = MON.all().filter(function (m) { var cr = m.cr == null ? -1 : +m.cr; return m.cr != null && (!q || m.n.toLowerCase().indexOf(q) >= 0) && cr >= lo && cr <= hi && (!E.type || m.type === E.type) && fits(m, E.env); })
        .sort(function (a, b) { return a.n < b.n ? -1 : 1; });
      var types = []; MON.all().forEach(function (m) { if (m.type && types.indexOf(m.type) < 0 && !/^swarm/.test(m.type)) types.push(m.type); }); types.sort();
      var crs = [0, 0.125, 0.25, 0.5].concat(Array.apply(null, Array(30)).map(function (_, i) { return i + 1; }));
      var sel = function (k, label, opts) { return '<label class="mon-f">' + label + ' <select data-enc="' + k + '"><option value="">Any</option>' + opts.map(function (o) { return '<option value="' + o + '"' + (String(E[k]) === String(o) ? ' selected' : '') + '>' + (k === 'type' ? o : MON.crText(o)) + '</option>'; }).join('') + '</select></label>'; };
      var place = '<label class="mon-f enc-place">Place <select data-enc="env"><option value="">Anywhere</option>' + Object.keys(ENV).map(function (k) { return '<option' + (E.env === k ? ' selected' : '') + '>' + k + '</option>'; }).join('') + '</select></label>';
      return '<div class="panel enc-pick"><h3>Monsters</h3><div class="mon-tools">' + place + '<input type="search" id="enc-q" data-enc="q" placeholder="Search monsters…" value="' + esc(E.q) + '">' +
        sel('crMin', 'CR from', crs) + sel('crMax', 'to', crs) + sel('type', 'Type', types) + '</div><div class="small muted mon-count">' + list.length + ' monsters</div>' +
        '<div class="mon-list enc-list">' + list.slice(0, 200).map(function (m) {
          return '<div class="enc-row"><button type="button" class="btn small" data-act="encAdd" data-v="' + esc(m.id) + '" aria-label="Add ' + esc(m.n) + '">+</button>' +
            '<button type="button" class="linkbtn enc-name" data-act="encView" data-v="' + esc(m.id) + '">' + esc(m.n) + '</button><span class="small muted">CR ' + MON.crText(m.cr) + ' · ' + xpOf(m).toLocaleString('en') + ' XP</span></div>';
        }).join('') + (list.length > 200 ? '<p class="small muted" style="padding:.5rem">Showing 200; search to narrow.</p>' : '') + '</div></div>';
    }
    function partyHtml(enc) {
      var chars = store.chars.filter(function (c) { return c.classes && c.classes.length; });
      var pl = parties().filter(function (x) { return x.m.length; });
      return '<div class="panel"><h3>Party</h3>' + (pl.length ? '<select data-encusep="1" aria-label="Choose a party"><option value="">Choose a party…</option>' + pl.map(function (x) { return '<option value="' + x.id + '">' + esc(x.name || 'Unnamed party') + ' (' + x.m.length + ')</option>'; }).join('') + '</select>' : '<p class="small muted">Tip: add your players on the Party page, then choose them here.</p>') + enc.party.map(function (p, i) {
        if (p.partyId) { var pt = partyById(p.partyId); return '<div class="enc-party"><b>' + esc(pt ? pt.name || 'Unnamed party' : 'Removed party') + '</b> <span class="small muted">' + esc(pt ? summary(pt) : '') + '</span>' + btn('encPartyRm', '✕', { v: i }, 'btn tiny') + '</div>'; }
        if (p.charId) { var c = store.chars.filter(function (x) { return x.id === p.charId; })[0]; return '<div class="enc-party"><b>' + esc(c ? (c.name || 'Unnamed') : 'Removed character') + '</b> <span class="small muted">level ' + (c ? R.derive(c, store.filters).level : '?') + '</span>' + btn('encPartyRm', '✕', { v: i }, 'btn tiny') + '</div>'; }
        return '<div class="enc-party"><label><input type="number" min="1" max="20" id="encp-n-' + i + '" data-encparty="' + i + '" data-f="n" value="' + p.n + '"> players</label><label>at level <input type="number" min="1" max="20" id="encp-l-' + i + '" data-encparty="' + i + '" data-f="lvl" value="' + p.lvl + '"></label>' + btn('encPartyRm', '✕', { v: i }, 'btn tiny') + '</div>';
      }).join('') + '<div class="toolbar">' + btn('encPartyAdd', '+ Group of players', {}, 'btn small') +
        (chars.length ? '<select data-encchar="1" aria-label="Add one of my characters"><option value="">+ One of my characters…</option>' + chars.map(function (c) { return '<option value="' + c.id + '">' + esc(c.name || 'Unnamed character') + '</option>'; }).join('') + '</select>' : '') + '</div></div>';
    }
    // Beyond the XP maths: a single monster far above the party's level, or one that can drop a character in a round.
    function dangerHtml(enc, levels) {
      if (!levels.length) return '';
      var avg = levels.reduce(function (a, b) { return a + b; }, 0) / levels.length, out = [];
      var pcs = []; enc.party.forEach(function (p) { var pt = p.partyId && partyById(p.partyId); if (pt) pcs = pcs.concat(pt.m); });
      var lowHp = pcs.filter(function (m) { return +m.hp; }).sort(function (a, b) { return a.cur - b.cur; })[0];
      enc.mons.forEach(function (x) { var m = MON.find(x.id); if (m && +m.cr > avg + 2) out.push(m.n + ' (CR ' + MON.crText(m.cr) + ') is well above the party’s level: it may down a character in one round.'); });
      if (lowHp && lowHp.cur < lowHp.hp / 2) out.push((lowHp.n || 'A character') + ' is at ' + lowHp.cur + '/' + lowHp.hp + ' HP: the fight is harder than the numbers say.');
      return out.length ? '<ul class="small enc-danger">' + out.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul>' : '';
    }
    function encounterHtml(enc) {
      var r = rated(enc), levels = partyLevels(enc);
      var bar = '<div class="enc-diff"><div class="enc-meter">' + LABELS.map(function (l, i) { return '<span class="' + (r.level >= i ? 'on lv' + i : '') + '">' + l + '<small>' + r.thresholds[i].toLocaleString('en') + '</small></span>'; }).join('') + '</div>' +
        dangerHtml(enc, levels) + '<p class="enc-verdict lv' + r.level + '"><b>' + r.label + '</b> for ' + levels.length + ' character' + (levels.length === 1 ? '' : 's') + ' · adjusted XP <b>' + r.adjusted.toLocaleString('en') + '</b> <span class="small muted">(' + r.base.toLocaleString('en') + ' XP × ' + r.mult + ')</span></p></div>';
      var rows = enc.mons.map(function (x, i) {
        var m = MON.find(x.id); if (!m) return '';
        return '<div class="enc-row"><span class="enc-count">' + btn('encCount', '−', { v: i, d: -1 }, 'btn tiny') + '<b>' + x.count + '</b>' + btn('encCount', '+', { v: i, d: 1 }, 'btn tiny') + '</span>' +
          '<button type="button" class="linkbtn enc-name" data-act="encView" data-v="' + esc(m.id) + '">' + esc(m.n) + '</button><span class="small muted">CR ' + MON.crText(m.cr) + ' · ' + (xpOf(m) * x.count).toLocaleString('en') + ' XP</span></div>';
      }).join('');
      var saved = store.encounters || [];
      return '<div class="panel"><div class="toolbar" style="margin:0"><h3 style="margin:0">Encounter</h3><span class="spacer"></span>' + btn('encRun', root.Icon('swords') + ' Run it', {}, 'btn primary') + '</div>' + bar +
        (rows || '<p class="muted">Add monsters with + from the list.</p>') +
        '<div class="toolbar enc-tools"><label class="mon-f">Place <select data-enc="env" aria-label="Place for the random encounter"><option value="">Anywhere</option>' + Object.keys(ENV).map(function (k) { return '<option' + (E.env === k ? ' selected' : '') + '>' + k + '</option>'; }).join('') + '</select></label><label class="mon-f">Random <select data-enc="diff">' + LABELS.map(function (l) { return '<option' + (E.diff === l ? ' selected' : '') + '>' + l + '</option>'; }).join('') + '</select></label>' + btn('encRandom', root.Icon('d20') + ' Random encounter', {}, 'btn small') + btn('encClear', 'Clear', {}, 'btn small') + '</div>' +
        '<div class="toolbar enc-tools"><input type="text" id="enc-name" data-encname="1" placeholder="Name this encounter" value="' + esc(enc.name || '') + '">' + btn('encSave', 'Save', {}, 'btn small') +
        (saved.length ? '<select data-encload="1" aria-label="Load a saved encounter"><option value="">Load a saved one…</option>' + saved.map(function (s) { return '<option value="' + s.id + '">' + esc(s.name || 'Untitled') + '</option>'; }).join('') + '</select>' : '') + '</div></div>';
    }

    // ----- the table: players join from their phones, straight from the app (js/table.js) -----
    function tbl() { return store.encTable || null; }
    function phonesHtml() {
      var T = root.Table; if (!T) return '';
      if (E.tping === undefined) { E.tping = 'wait'; T.ping().then(function (j) { E.tping = j; E.tlan = j && j.lan || []; api.render(); }); }
      if (E.tping === 'wait') return '';
      if (!E.tping) return '';
      var t = tbl();
      if (!t) return '<div class="panel compact-row"><b>📱 Players’ phones</b><span class="small muted">Players roll initiative on their phones and it lands here.</span>' + btn('tblOpen', 'Open the table', {}, 'btn small') + (E.tmsg ? '<span class="small bad">' + esc(E.tmsg) + '</span>' : '') + '</div>';
      T.watch(t.code, function (st, err) { if (!st) { store.encTable = null; E.tmsg = 'The table closed (the server restarted?). Open a new one.'; api.render(); return; } E.tstate = st; if (mergePhones(st)) api.save && api.save(); api.render(); });
      var st = E.tstate || { players: [] }, url = location.origin + location.pathname + '#table=' + t.code;
      if (!E.tqr || E.tqrFor !== url) { E.tqrFor = url; if (root.Transfer) root.Transfer.qr(url).then(function (u) { E.tqr = u; api.render(); }, function () {}); }
      return '<div class="panel tbl-panel"><div class="toolbar" style="margin:0"><b>📱 Table <span class="tbl-code">' + t.code + '</span></b><span class="spacer"></span>' + btn('tblAsk', st.open ? 'Ask again (clear rolls)' : 'Ask for initiative', {}, 'btn small' + (st.open ? '' : ' primary')) + btn('tblClose', 'Close', {}, 'btn small') + '</div>' +
        '<div class="tbl-join">' + (E.tqr ? '<img class="xfer-qr tbl-qr" src="' + E.tqr + '" alt="QR code to join the table">' : '') + '<div class="small">Players scan this with their phone’s camera, or open the app, go to their character’s <b>Session</b> page and type the code <b>' + t.code + '</b>. Keep this page open during the fight.</div></div>' +
        (st.players.length ? '<ul class="tbl-players">' + st.players.map(function (p) { return '<li><b>' + esc(p.name) + '</b> <span class="' + (p.init == null ? 'muted' : 'tbl-init') + '">' + (p.init == null ? (st.open ? 'rolling…' : 'joined') : p.init) + '</span>' + btn('tblKick', '✕', { v: p.id }, 'btn tiny') + '</li>'; }).join('') + '</ul>' : '<p class="small muted">Nobody has joined yet.</p>') +
        (store.encRun ? '<p class="small muted">Rolls that come in are put in the initiative order (matched by name, or added).</p>' : '<p class="small muted">Run the fight and the players are asked for initiative.</p>') + '</div>';
    }
    // put the phones' rolls into the running fight
    function mergePhones(st) {
      var run = store.encRun; if (!run || !st) return false;
      var changed = false, cur = run.list[run.turn] && run.list[run.turn].k;
      st.players.forEach(function (p) {
        if (p.init == null) return;
        var c = run.list.filter(function (x) { return x.phone === p.id; })[0] || run.list.filter(function (x) { return x.pc && !x.phone && String(x.n).trim().toLowerCase() === String(p.name).trim().toLowerCase(); })[0];
        if (!c) { c = run.list.filter(function (x) { return x.pc && !x.phone && /^Player \d+$/.test(x.n); })[0]; if (c) { c.n = p.name; c.mod = p.bonus || 0; changed = true; } } // a placeholder player takes the name
        if (!c) { c = { k: 'ph' + p.id, n: p.name, pc: true, init: p.init, mod: p.bonus || 0 }; run.list.push(c); changed = true; }
        c.phone = p.id;
        if (c.init !== p.init) { c.init = p.init; changed = true; }
      });
      if (changed) { run.list.sort(function (a, b) { return b.init - a.init || b.mod - a.mod; }); run.turn = Math.max(0, run.list.map(function (x) { return x.k; }).indexOf(cur)); pushTurn(); }
      return changed;
    }
    function pushTurn() { var t = tbl(), run = store.encRun; if (!t || !root.Table) return; root.Table.dm(t.code, t.key, run ? { round: run.round, turn: (run.list[run.turn] || {}).n || '' } : { open: false, round: 0, turn: '' }).catch(function () {}); }

    // ----- running: initiative, hit points, turns -----
    function startRun(enc) {
      var list = [], roll = function (mod) { return 1 + Math.floor(Math.random() * 20) + mod; };
      enc.mons.forEach(function (x) {
        var m = MON.find(x.id); if (!m) return;
        var dex = m.ab ? Math.floor((m.ab[1] - 10) / 2) : 0;
        for (var i = 0; i < x.count; i++) list.push({ k: 'm' + list.length, n: m.n + (x.count > 1 ? ' ' + (i + 1) : ''), id: m.id, hp: m.hp || 1, max: m.hp || 1, ac: m.acv || parseInt(m.ac, 10) || 10, init: roll(dex), mod: dex });
      });
      enc.party.forEach(function (p, g) {
        if (p.charId) { var c = store.chars.filter(function (y) { return y.id === p.charId; })[0]; if (c) { var d = R.derive(c, store.filters); list.push({ k: 'p' + c.id, n: c.name || 'Unnamed', pc: true, hp: d.hp, max: d.hp, ac: d.ac, init: roll(d.init), mod: d.init }); } }
        else if (p.partyId) { var pt = partyById(p.partyId); if (pt) pt.m.forEach(function (m) { list.push({ k: 'p' + m.id, n: m.n || 'Player', pc: true, hp: +m.cur || 0, max: +m.hp || 0, ac: +m.ac || 0, init: 10, mod: 0, pm: [pt.id, m.id] }); }); }
        else for (var i = 0; i < (p.n | 0); i++) list.push({ k: 'p' + g + '-' + i, n: 'Player ' + (list.filter(function (z) { return z.pc; }).length + 1), pc: true, init: 10, mod: 0 });
      });
      list.sort(function (a, b) { return b.init - a.init || b.mod - a.mod; });
      store.encRun = { list: list, turn: 0, round: 1 };
    }
    function writeBack(c) { if (!c || !c.pm) return; var pt = partyById(c.pm[0]), m = pt && pt.m.filter(function (x) { return x.id === c.pm[1]; })[0]; if (m) m.cur = c.hp; }
    function runHtml() {
      var run = store.encRun, alive = function (c) { return c.pc || c.hp > 0; };
      var left = run.list.filter(function (c) { return !c.pc && c.hp > 0; }).length;
      return '<div class="panel enc-run"><div class="toolbar" style="margin:0"><h3 style="margin:0">Round ' + run.round + '</h3><span class="spacer"></span>' + btn('encNext', 'Next turn ▶', {}, 'btn primary') + btn('encStop', 'End fight', {}, 'btn') + '</div>' +
        (left ? '' : '<p class="rest-msg">All monsters are down.</p>') +
        '<p class="small muted">Initiative was rolled for the monsters (and your characters). Type the players’ rolls in the boxes; the order updates. Type damage as a number (−) or healing with + (e.g. +5).</p>' +
        run.list.map(function (c, i) {
          var hpPct = c.max ? Math.max(0, Math.round(c.hp / c.max * 100)) : 100;
          return '<div class="enc-c' + (i === run.turn ? ' turn' : '') + (alive(c) ? '' : ' down') + (c.pc ? ' pc' : '') + (c.pc && c.max && c.hp <= 0 ? ' down' : '') + '">' +
            '<input type="number" class="enc-init" id="init-' + c.k + '" data-encinit="' + c.k + '" value="' + c.init + '" aria-label="Initiative of ' + esc(c.n) + '">' +
            '<div class="enc-cn">' + (c.id ? '<button type="button" class="linkbtn enc-name" data-act="encView" data-v="' + esc(c.id) + '">' + esc(c.n) + '</button>' : '<b>' + esc(c.n) + '</b>') + (c.ac ? ' <span class="small muted">AC ' + c.ac + '</span>' : '') + (c.id && root.Sounds && MON.find(c.id) ? ' ' + root.Sounds.button(MON.find(c.id), 'enc-sound') : '') +
            (c.max ? '<div class="hpbar"><span style="width:' + hpPct + '%"></span></div>' : '') + '</div>' +
            (c.max ? '<span class="enc-hp"><b>' + c.hp + '</b>/' + c.max + '</span><input type="text" inputmode="numeric" class="enc-dmg" id="dmg-' + c.k + '" data-encdmg="' + c.k + '" placeholder="−dmg" aria-label="Damage or healing for ' + esc(c.n) + '">' +
              '<div class="enc-adj">' + ['-10', '-5', '-1', '+1', '+5', '+10'].map(function (v) { return btn('encHp', v.replace('-', '−'), { v: c.k, d: v }, 'btn small'); }).join('') + '</div>' : '<span></span><span></span>') + '</div>';
        }).join('') + '</div>';
    }

    function html() {
      if (!MON.ensure(api.render)) return '<main class="mon-main"><h2>Encounters</h2><p class="muted">Loading monsters…</p></main>';
      var enc = cur(), view = E.open && MON.find(E.open);
      var main = store.encRun ? runHtml() : '<div class="enc-wrap">' + pickerHtml() + '<div>' + partyHtml(enc) + encounterHtml(enc) + '</div></div>';
      var ask = E.askLoot && !store.encRun ? '<div class="panel enc-loot"><b>Fight over.</b> Roll treasure for this encounter? ' + btn('encLootYes', root.Icon('coins') + ' Yes, roll treasure', {}, 'btn primary') + btn('encLootNo', 'No', {}, 'btn') + '</div>' : '';
      return '<main class="mon-main"><h2>Encounters</h2>' + ask + (E.msg ? '<p class="small rest-msg">' + esc(E.msg) + '</p>' : '') + phonesHtml() + main +
        (view ? '<div class="enc-modal" role="dialog" aria-label="' + esc(view.n) + '"><div class="toolbar">' + btn('encViewClose', '✕ Close', {}, 'btn') + '</div>' + MON.block(view) + '</div>' : '') + '</main>';
    }
    function randomEncounter(enc) {
      var levels = partyLevels(enc); if (!levels.length) return 'Add your party first.';
      var target = LABELS.indexOf(E.diff), t = rate(levels, []).thresholds, goal = t[target], cap = target < 3 ? t[target + 1] : t[3] * 1.5;
      var pool = MON.all().filter(function (m) { return m.cr != null && xpOf(m) > 0 && xpOf(m) <= goal && (!E.type || m.type === E.type) && fits(m, E.env); });
      if (!pool.length) return 'No monsters fit that difficulty with these filters.';
      for (var tries = 0; tries < 200; tries++) {
        var m = pool[Math.floor(Math.random() * pool.length)], n = 1, mons;
        while (rate(levels, Array(n + 1).fill(xpOf(m))).adjusted < cap && n < 12 && rate(levels, Array(n).fill(xpOf(m))).adjusted < goal) n++;
        mons = Array(n).fill(xpOf(m));
        var r = rate(levels, mons);
        if (r.level === target) { enc.mons = [{ id: m.id, count: n }]; return ''; }
      }
      return 'Couldn’t find a fit; try again or change the filters.';
    }
    function member(id) { var pt = curParty(); return pt && pt.m.filter(function (x) { return x.id === id; })[0]; }
    var actions = {
      partyNew: function () { var pt = { id: R.uid(), name: '', m: [newMember()] }; parties().push(pt); E.party = pt.id; E.delParty = false; },
      partyAdd: function () { curParty().m.push(newMember()); },
      partyRm: function (v) { var pt = curParty(); pt.m = pt.m.filter(function (x) { return x.id !== v; }); },
      partyHp: function (v, el) { var m = member(v); if (m) m.cur = Math.max(0, Math.min(+m.hp || 0, (+m.cur || 0) + +el.getAttribute('data-d'))); },
      partyRest: function () { curParty().m.forEach(function (m) { m.cur = +m.hp || 0; }); },
      partyPlan: function () { var pt = curParty(); cur().party = [{ partyId: pt.id }]; ui.section = 'encounters'; root.scrollTo(0, 0); },
      partyDelAsk: function () { E.delParty = true; },
      partyDelNo: function () { E.delParty = false; },
      partyDel: function () { var id = curParty().id; store.parties = parties().filter(function (x) { return x.id !== id; }); E.party = ''; E.delParty = false; },
      encAdd: function (v) { var enc = cur(), x = enc.mons.filter(function (y) { return y.id === v; })[0]; if (x) x.count++; else enc.mons.push({ id: v, count: 1 }); E.msg = ''; },
      encCount: function (v, el) { var enc = cur(), x = enc.mons[+v]; if (!x) return; x.count += +el.getAttribute('data-d'); if (x.count < 1) enc.mons.splice(+v, 1); },
      encClear: function () { cur().mons = []; },
      encPartyAdd: function () { cur().party.push({ n: 1, lvl: 1 }); },
      encPartyRm: function (v) { cur().party.splice(+v, 1); },
      encRandom: function () { E.msg = randomEncounter(cur()); },
      encSave: function () {
        var enc = cur(); store.encounters = store.encounters || [];
        var copy = JSON.parse(JSON.stringify(enc)); copy.id = copy.id || R.uid(); enc.id = copy.id;
        store.encounters = store.encounters.filter(function (s) { return s.id !== copy.id; }); store.encounters.unshift(copy);
        E.msg = 'Saved “' + (copy.name || 'Untitled') + '”.';
      },
      encView: function (v) { E.open = v; },
      encViewClose: function () { E.open = ''; },
      encRun: function () { var enc = cur(); if (!enc.mons.length) { E.msg = 'Add some monsters first.'; return; } startRun(enc); E.msg = ''; var t = tbl(); if (t && root.Table) root.Table.dm(t.code, t.key, { open: true, reset: true, round: 1, turn: (store.encRun.list[0] || {}).n || '' }).catch(function () {}); },
      tblOpen: function () { E.tmsg = ''; root.Table.create().then(function (j) { store.encTable = { code: j.code, key: j.key }; E.tlan = j.lan || E.tlan; E.tstate = null; api.save && api.save(); api.render(); }, function (e) { E.tmsg = e.message; api.render(); }); return false; },
      tblAsk: function () { var t = tbl(); if (t) root.Table.dm(t.code, t.key, { open: true, reset: true }).catch(function () {}); return false; },
      tblKick: function (v) { var t = tbl(); if (t) root.Table.dm(t.code, t.key, { kick: v }).catch(function () {}); return false; },
      tblClose: function () { var t = tbl(); if (t) root.Table.dm(t.code, t.key, { close: true }).catch(function () {}); root.Table.stop(); store.encTable = null; E.tstate = null; },
      encHp: function (v, el) { var c = store.encRun.list.filter(function (x) { return x.k === v; })[0]; if (c) c.hp = Math.max(0, Math.min(c.max, c.hp + +el.getAttribute('data-d'))); writeBack(c); },
      encNext: function () { var run = store.encRun; run.turn++; if (run.turn >= run.list.length) { run.turn = 0; run.round++; } pushTurn(); },
      encStop: function () { store.encRun = null; E.askLoot = true; pushTurn(); },
      encLootNo: function () { E.askLoot = false; },
      encLootYes: function () {
        var enc = cur(); E.askLoot = false;
        var creatures = enc.mons.map(function (x) { var m = MON.find(x.id); return m && { name: m.n, cr: +m.cr || 0, type: m.type || '', n: x.count }; }).filter(Boolean);
        api.onLoot(creatures, partyLevels(enc), enc.name);
      }
    };
    function onInput(t) {
      var a = function (n) { return t.getAttribute(n); };
      if (a('data-enc') != null) { E[a('data-enc')] = t.value; return 'render'; }
      if (a('data-partyname')) { curParty().name = t.value; return 'save'; }
      if (a('data-pm')) { var m = member(a('data-pm')), k = a('data-f'); if (!m) return 'save'; if (k === 'n' || k === 'cls') m[k] = t.value; else { var was = +m.hp || 0; m[k] = Math.max(0, Math.round(+t.value) || 0); if (k === 'lvl') m.lvl = Math.max(1, Math.min(20, m.lvl)); if (k === 'hp' && (+m.cur || 0) >= was) m.cur = m.hp; if (k === 'hp') m.cur = Math.min(m.cur, m.hp); } return 'save'; }
      if (a('data-encname')) { cur().name = t.value; return 'save'; }
      if (a('data-encparty') != null) { var p = cur().party[+a('data-encparty')]; if (p) p[a('data-f')] = Math.max(1, Math.min(20, Math.round(+t.value) || 1)); return 'save'; }
      if (a('data-encinit')) { var c = store.encRun.list.filter(function (x) { return x.k === a('data-encinit'); })[0]; if (c) c.init = +t.value || 0; return 'save'; }
      return null;
    }
    function onChange(t) {
      var a = function (n) { return t.getAttribute(n); };
      if (a('data-partypick')) { E.party = t.value; E.delParty = false; return 'render'; }
      if (a('data-partychar') && t.value) { var ch = store.chars.filter(function (x) { return x.id === t.value; })[0]; if (ch) { var d = R.derive(ch, store.filters), cl = (ch.classes || []).map(function (e) { var k = R.cls(e.cls); return k ? k.name : e.cls; }).join(' / ');
        curParty().m.push({ id: R.uid(), n: ch.name || 'Unnamed', cls: cl, lvl: d.level, ac: d.ac, hp: d.hp, cur: d.hp }); } return 'render'; }
      if (a('data-partyname') || a('data-pm')) return 'render';
      if (a('data-encusep') && t.value) { cur().party = [{ partyId: t.value }]; return 'render'; }
      if (a('data-encchar') && t.value) { cur().party.push({ charId: t.value }); return 'render'; }
      if (a('data-encload') && t.value) { var s = (store.encounters || []).filter(function (x) { return x.id === t.value; })[0]; if (s) store.encounter = JSON.parse(JSON.stringify(s)); return 'render'; }
      if (a('data-encparty') != null || a('data-encname')) return 'render';
      if (a('data-encinit')) { var run = store.encRun, k = run.list[run.turn] && run.list[run.turn].k; run.list.sort(function (x, y) { return y.init - x.init || y.mod - x.mod; }); run.turn = Math.max(0, run.list.map(function (x) { return x.k; }).indexOf(k)); return 'render'; }
      if (a('data-encdmg')) {
        var c = store.encRun.list.filter(function (x) { return x.k === a('data-encdmg'); })[0], v = String(t.value).trim();
        if (c && /^[+-]?\d+$/.test(v)) { var n = parseInt(v, 10); c.hp = Math.max(0, Math.min(c.max, v[0] === '+' ? c.hp + n : c.hp - Math.abs(n))); writeBack(c); }
        return 'render';
      }
      return null;
    }
    return { html: html, partyPage: partyPage, actions: actions, onInput: onInput, onChange: onChange };
  };
  root.EncounterUI.rate = rate;
  root.EncounterUI.fits = fits;
})(typeof window !== 'undefined' ? window : globalThis);
