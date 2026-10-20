// Generators for the DM: a non-player character, a tavern or inn, a shop. All tables are written for this app.
(function (root) {
  'use strict';
  var pick = function (a, r) { return a[Math.floor((r || Math.random)() * a.length)]; };
  var NAMES = {
    Human: [['Aldric', 'Bran', 'Cedric', 'Dorian', 'Edmund', 'Gareth', 'Hugo', 'Jasper', 'Marcus', 'Osric', 'Roland', 'Tobias'], ['Alys', 'Brenna', 'Clara', 'Edda', 'Greta', 'Helena', 'Isolde', 'Mara', 'Nell', 'Rosalind', 'Sabine', 'Wren'],
      ['Ashford', 'Blackwood', 'Carter', 'Dunmore', 'Fairweather', 'Greaves', 'Holloway', 'Marsh', 'Redfern', 'Thatcher', 'Underhill', 'Whitlock']],
    Elf: [['Aelar', 'Caladrel', 'Erevan', 'Galinndan', 'Ivellios', 'Laucian', 'Riardon', 'Soveliss', 'Thamior', 'Varis'], ['Adrie', 'Birel', 'Caelynn', 'Enna', 'Keyleth', 'Lia', 'Naivara', 'Sariel', 'Shava', 'Valanthe'],
      ['Amakiir', 'Galanodel', 'Holimion', 'Ilphelkiir', 'Liadon', 'Meliamne', 'Nailo', 'Siannodel', 'Xiloscient']],
    Dwarf: [['Adrik', 'Baern', 'Brottor', 'Dain', 'Harbek', 'Kildrak', 'Orsik', 'Rurik', 'Thorin', 'Vondal'], ['Amber', 'Bardryn', 'Dagnal', 'Eldeth', 'Gunnloda', 'Helja', 'Kathra', 'Riswynn', 'Torbera', 'Vistra'],
      ['Balderk', 'Battlehammer', 'Fireforge', 'Gorunn', 'Holderhek', 'Ironfist', 'Rumnaheim', 'Strakeln', 'Torunn']],
    Halfling: [['Alton', 'Cade', 'Eldon', 'Garret', 'Lyle', 'Milo', 'Osborn', 'Perrin', 'Roscoe', 'Wellby'], ['Andry', 'Bree', 'Callie', 'Cora', 'Euphemia', 'Kithri', 'Lavinia', 'Merla', 'Seraphina', 'Verna'],
      ['Brushgather', 'Goodbarrel', 'Greenbottle', 'Highhill', 'Hilltopple', 'Leagallow', 'Tealeaf', 'Thorngage', 'Underbough']],
    Gnome: [['Alston', 'Boddynock', 'Dimble', 'Fonkin', 'Gimble', 'Glim', 'Orryn', 'Roondar', 'Warryn', 'Zook'], ['Bimpnottin', 'Carlin', 'Donella', 'Ellyjobell', 'Lilli', 'Loopmottin', 'Nissa', 'Orla', 'Roywyn', 'Zanna'],
      ['Beren', 'Daergel', 'Folkor', 'Garrick', 'Nackle', 'Murnig', 'Ningel', 'Raulnor', 'Scheppen', 'Timbers']],
    'Half-Orc': [['Dench', 'Feng', 'Gell', 'Henk', 'Holg', 'Imsh', 'Krusk', 'Ront', 'Shump', 'Thokk'], ['Baggi', 'Emen', 'Engong', 'Kansif', 'Myev', 'Neega', 'Ovak', 'Sutha', 'Vola', 'Yevelda'], ['']],
    Tiefling: [['Akmenos', 'Barakas', 'Damakos', 'Ekemon', 'Kairon', 'Leucis', 'Mordai', 'Skamos', 'Therai'], ['Akta', 'Bryseis', 'Criella', 'Kallista', 'Lerissa', 'Makaria', 'Nemeia', 'Orianna', 'Rieta'],
      ['Hope', 'Ideal', 'Quest', 'Song', 'Torment', 'Weary', 'Ash', 'Ember']],
    Dragonborn: [['Arjhan', 'Balasar', 'Bharash', 'Donaar', 'Ghesh', 'Heskan', 'Medrash', 'Nadarr', 'Pandjed', 'Torinn'], ['Akra', 'Biri', 'Daar', 'Harann', 'Jheri', 'Kava', 'Korinn', 'Mishann', 'Sora', 'Thava'],
      ['Clethtinthiallor', 'Daardendrian', 'Delmirev', 'Kepeshkmolik', 'Kimbatuul', 'Myastan', 'Nemmonis', 'Yarjerit']]
  };
  var JOBS = ['blacksmith', 'baker', 'city guard', 'dockworker', 'fishmonger', 'herbalist', 'innkeeper', 'merchant', 'priest', 'scribe', 'farmer', 'hunter', 'sailor', 'street urchin', 'noble', 'retired adventurer', 'tax collector', 'bard', 'thief', 'stablehand', 'cartographer', 'apothecary', 'gravedigger', 'tailor', 'carpenter', 'ferryman', 'mercenary', 'beggar', 'wizard’s apprentice', 'courier'];
  var LOOKS = ['a scar across the cheek', 'bright red hair', 'missing two fingers', 'very tall and thin', 'short and round', 'a booming laugh', 'piercing green eyes', 'a crooked nose', 'covered in tattoos', 'always dressed in black', 'a wooden leg', 'freckles everywhere', 'an eye patch', 'impeccably groomed', 'a nervous twitch', 'smells of smoke', 'jingles with jewellery', 'a burn mark on one hand', 'grey before their time', 'a gap-toothed smile'];
  var MANNER = ['whispers everything', 'talks too fast', 'never looks you in the eye', 'laughs at their own jokes', 'quotes old proverbs', 'chews on something constantly', 'calls everyone “friend”', 'speaks in short, gruff words', 'over-explains everything', 'hums while thinking', 'very formal and polite', 'constantly fidgets with a coin', 'sighs dramatically', 'repeats the last word you said', 'uses big words wrongly'];
  var TRAITS = ['friendly and curious', 'suspicious of strangers', 'greedy but honest', 'brave to a fault', 'lazy and charming', 'deeply religious', 'proud and touchy', 'kind to animals, rude to people', 'hopelessly romantic', 'a terrible liar', 'cheerful no matter what', 'bitter about the past', 'fiercely loyal to their town', 'a know-it-all', 'easily frightened', 'quietly wise'];
  var WANTS = ['to pay off a debt to the wrong people', 'news of a missing sibling', 'revenge on a local noble', 'to leave this town forever', 'a rare herb from the woods', 'someone to deliver a letter, no questions asked', 'to prove themself to their family', 'a cure for a sick child', 'to find out who keeps stealing their chickens', 'a bodyguard for a short trip', 'to sell a strange heirloom', 'to join an adventuring party', 'their stolen tools back', 'a quiet life', 'to be famous'];
  var SECRETS = ['is a spy for a rival town', 'once robbed a temple', 'owes money to a thieves’ guild', 'is secretly a noble in hiding', 'can do a little magic', 'saw the murder everyone is talking about', 'is in love with the innkeeper', 'keeps a map to a forgotten tomb', 'is a lycanthrope and doesn’t know it', 'is not who they say they are', 'has a cult tattoo hidden under their sleeve', 'buried something in the old graveyard', 'is planning to betray their employer', 'hears voices from an old coin', 'none worth telling'];

  var ADJ = ['Prancing', 'Rusty', 'Drunken', 'Golden', 'Sleeping', 'Laughing', 'Crooked', 'Silver', 'Wandering', 'Jolly', 'Broken', 'Howling', 'Lucky', 'Weary', 'Copper', 'Gilded', 'Salty', 'Merry', 'Black', 'Hidden'];
  var NOUN = ['Pony', 'Dragon', 'Goblin', 'Griffon', 'Tankard', 'Barrel', 'Stag', 'Mermaid', 'Lantern', 'Anchor', 'Wizard', 'Boar', 'Kettle', 'Owl', 'Crown', 'Fox', 'Bard', 'Sword', 'Wheel', 'Toad'];
  var FOOD = ['rabbit stew with dark bread', 'roast boar with honeyed carrots', 'fish pie with too many bones', 'mushroom and leek soup', 'spiced sausages and onions', 'cheese, apples and a crusty loaf', 'mutton pie', 'fried river trout', 'barley porridge with butter', 'a mystery stew nobody asks about', 'chicken roasted on a spit', 'smoked eel and pickles'];
  var DRINK = ['a dark, bitter stout', 'cheap but strong ale', 'sweet mead from a local hive', 'a cider that is mostly vinegar', 'elven wine (watered down)', 'dwarven firewater', 'spiced hot wine', 'a famous house beer brewed in the cellar', 'goat’s milk for the faint of heart', 'a green liqueur that glows a little'];
  var MOOD = ['quiet, with a few regulars playing cards', 'packed and loud, a bard on a table', 'smoky and dim, everyone whispering', 'cozy, a fire roaring, a dog asleep by it', 'tense: two groups glaring at each other', 'cheerful, a wedding party celebrating', 'nearly empty, the owner looks worried', 'rowdy: an arm-wrestling contest is on', 'elegant, too fancy for adventurers', 'half-burnt, being rebuilt around the guests'];
  var RUMORS = ['Wolves have been seen walking on two legs near the old mill.', 'The baron’s daughter ran away with a travelling minstrel.', 'Someone is buying every lantern in town. Nobody knows why.', 'Lights move in the ruins on the hill at night.', 'A dragon was seen flying north three days ago.', 'The well water tastes of iron since the earthquake.', 'A merchant pays good coin for spider silk, the big kind.', 'The temple bell rang by itself last night.', 'There’s a hidden door in the cellar of this very inn.', 'Bandits on the east road only rob those who carry no weapons.', 'The old witch in the swamp grants wishes, for a price.', 'Three fishermen came back from the lake with white hair.', 'The town’s gravedigger has been very rich lately.', 'A caravan vanished on a road that was perfectly safe.', 'Somebody saw a ghost knight at the crossroads.'];
  var SHOPS = [['Blacksmith', 'Weapon'], ['General store', 'Adventuring gear'], ['Alchemist', 'potion'], ['Magic curios', 'magic'], ['Fletcher and bowyer', 'ammo'], ['Tailor', 'clothes'], ['Bookseller', 'books']];
  var SHOPNAME = ['{n}’s {t}', 'The {a} {o}', '{n} and Sons', 'The {o} and {o2}', '{a} {t}'];
  var QUIRK = ['haggles for fun and gives a discount to anyone who wins', 'only takes coins, never trades', 'has a talking parrot that insults customers', 'is closing for good next week', 'sells on credit to anyone with an honest face', 'has a back room for “special customers”', 'is run by twins who never agree on a price', 'puts a curse on thieves (or says so)', 'pays well for monster parts', 'is also the town’s secret post office'];
  var SHOPOBJ = ['Anvil', 'Hammer', 'Lantern', 'Candle', 'Quill', 'Arrow', 'Needle', 'Cauldron', 'Crystal', 'Scroll', 'Key', 'Feather'];

  function name(lineage, r) { var N = NAMES[lineage] || NAMES.Human, first = pick(r && r() < 0.5 ? N[0] : N[1], r), last = pick(N[2], r); return (first + ' ' + last).trim(); }
  function npc(lineage, r) {
    r = r || Math.random; var lin = lineage || pick(['Human', 'Human', 'Human', 'Elf', 'Dwarf', 'Halfling', 'Gnome', 'Half-Orc', 'Tiefling', 'Dragonborn'], r);
    return { name: name(lin, r), lineage: lin, job: pick(JOBS, r), look: pick(LOOKS, r), manner: pick(MANNER, r), trait: pick(TRAITS, r), want: pick(WANTS, r), secret: pick(SECRETS, r) };
  }
  function tavern(r) {
    r = r || Math.random;
    var nm = 'The ' + pick(ADJ, r) + ' ' + pick(NOUN, r), rum = [], i = 0;
    while (rum.length < 3 && i++ < 20) { var x = pick(RUMORS, r); if (rum.indexOf(x) < 0) rum.push(x); }
    return { name: nm, owner: npc(null, r), mood: pick(MOOD, r), food: pick(FOOD, r), drink: pick(DRINK, r), room: pick(['2 sp', '5 sp', '8 sp', '1 gp', '2 gp'], r), meal: pick(['3 cp', '1 sp', '3 sp', '5 sp'], r), rumors: rum };
  }
  function shop(kind, D, r) {
    r = r || Math.random; var s = SHOPS.filter(function (x) { return x[0] === kind; })[0] || pick(SHOPS, r), owner = npc(null, r);
    var nm = pick(SHOPNAME, r).replace('{n}', owner.name.split(' ')[0]).replace('{t}', s[0]).replace('{a}', pick(ADJ, r)).replace('{o2}', pick(SHOPOBJ, r)).replace('{o}', pick(SHOPOBJ, r));
    var stock = [], G = (D && D.gear) || [], W = (D && D.weapons) || [], M = (D && D.magicItems) || [];
    var take = function (list, n, f) { list = list.slice(); for (var i = 0; i < n && list.length; i++) stock.push(f(list.splice(Math.floor(r() * list.length), 1)[0])); };
    if (s[1] === 'Weapon') take(W, 6, function (w) { return [w[0], w[2] || '', 'weapon']; });
    else if (s[1] === 'magic') take(M.filter(function (x) { return x[1].indexOf('Common') >= 0 || x[1].indexOf('Uncommon') >= 0; }), 5, function (x) { var c = x[1].indexOf('Common') >= 0; return [x[0], c ? (50 + Math.floor(r() * 5) * 10) + ' gp' : (200 + Math.floor(r() * 4) * 100) + ' gp', 'magic']; });
    else if (s[1] === 'potion') { take(M.filter(function (x) { return /^Potion/.test(x[0]) && (x[1].indexOf('Common') >= 0 || x[1].indexOf('Uncommon') >= 0); }), 4, function (x) { return [x[0], x[1].indexOf('Common') >= 0 ? '50 gp' : '200 gp', 'magic']; }); take(G.filter(function (x) { return /acid|alchemist|antitoxin|oil|holy water|perfume|poison/i.test(x[0]); }), 4, function (x) { return [x[0], x[2], 'gear']; }); }
    else if (s[1] === 'ammo') take(G.filter(function (x) { return /arrow|bolt|quiver|case|needle|bullet/i.test(x[0]); }).concat(W.filter(function (w) { return /bow|crossbow|sling/i.test(w[0]); }).map(function (w) { return [w[0], w[1], w[2]]; })), 6, function (x) { return [x[0], x[2] || '', 'gear']; });
    else if (s[1] === 'clothes') take(G.filter(function (x) { return /cloth|robe|boots|cloak|costume|vestments|signet|perfume/i.test(x[0]); }), 6, function (x) { return [x[0], x[2], 'gear']; });
    else if (s[1] === 'books') take(G.filter(function (x) { return /book|paper|parchment|ink|map|scroll case|sealing wax|spellbook/i.test(x[0]); }), 6, function (x) { return [x[0], x[2], 'gear']; });
    else take(G.filter(function (x) { return x[2]; }), 8, function (x) { return [x[0], x[2], 'gear']; });
    return { kind: s[0], name: nm, owner: owner, quirk: pick(QUIRK, r), stock: stock };
  }
  root.Generators = { npc: npc, tavern: tavern, shop: shop, name: name, LINEAGES: Object.keys(NAMES), SHOPS: SHOPS.map(function (x) { return x[0]; }) };

  // ---------- the page ----------
  root.GeneratorsUI = function (api) {
    var esc = api.esc, btn = api.btn, ui = api.ui, store = api.store, D = root.DND;
    var G = ui.gen = ui.gen || { tab: 'npc', lin: '', shop: '' };
    function saved() { return store.genSaved = store.genSaved || []; }
    function npcHtml(n, title) {
      return '<div class="panel gen-card">' + (title ? '<h3>' + esc(title) + '</h3>' : '') + '<h4 style="margin-top:0">' + esc(n.name) + ' <small class="muted">' + esc(n.lineage + ' ' + n.job) + '</small></h4><ul class="gen-list">' +
        '<li><b>Looks:</b> ' + esc(n.look) + '</li><li><b>Manner:</b> ' + esc(n.manner) + '</li><li><b>Personality:</b> ' + esc(n.trait) + '</li><li><b>Wants:</b> ' + esc(n.want) + '</li><li><b>Secret:</b> ' + esc(n.secret) + '</li></ul></div>';
    }
    function resultHtml(x) {
      if (!x) return '';
      if (x.t === 'npc') return npcHtml(x.v);
      if (x.t === 'tavern') { var v = x.v; return '<div class="panel gen-card"><h3 style="margin-top:0">' + esc(v.name) + '</h3><p>' + esc(v.mood.charAt(0).toUpperCase() + v.mood.slice(1)) + '.</p><ul class="gen-list"><li><b>On the menu:</b> ' + esc(v.food) + ' (' + v.meal + '), and ' + esc(v.drink) + '.</li><li><b>A room for the night:</b> ' + v.room + '.</li></ul><h4>Rumors</h4><ul class="gen-list">' + v.rumors.map(function (r) { return '<li>' + esc(r) + '</li>'; }).join('') + '</ul></div>' + npcHtml(v.owner, 'The owner'); }
      var s = x.v; return '<div class="panel gen-card"><h3 style="margin-top:0">' + esc(s.name) + ' <small class="muted">' + esc(s.kind) + '</small></h3><p>The owner ' + esc(s.quirk) + '.</p><h4>For sale</h4><ul class="gen-list">' + s.stock.map(function (i) { return '<li>' + esc(i[0]) + (i[1] ? ' <span class="muted">— ' + esc(i[1]) + '</span>' : '') + '</li>'; }).join('') + '</ul></div>' + npcHtml(s.owner, 'The owner');
    }
    function title(x) { return x.t === 'npc' ? x.v.name + ' (' + x.v.job + ')' : x.v.name; }
    function html() {
      var tabs = [['npc', 'Character (NPC)'], ['tavern', 'Tavern or inn'], ['shop', 'Shop']];
      var h = '<main class="mon-main gen-main"><h2>Generators</h2><p class="muted">Need someone or somewhere right now? Roll it. Keep the ones you like.</p><div class="pills">' + tabs.map(function (t) { return btn('genTab', t[1], { v: t[0] }, 'pill' + (G.tab === t[0] ? ' on' : '')); }).join('') + btn('section', 'Random encounter ↗', { v: 'encounters' }, 'pill') + '</div><div class="panel"><div class="toolbar">';
      if (G.tab === 'npc') h += '<label class="mon-f">Lineage <select data-gen="lin"><option value="">Any</option>' + root.Generators.LINEAGES.map(function (l) { return '<option' + (G.lin === l ? ' selected' : '') + '>' + l + '</option>'; }).join('') + '</select></label>';
      if (G.tab === 'shop') h += '<label class="mon-f">Kind <select data-gen="shop"><option value="">Any</option>' + root.Generators.SHOPS.map(function (l) { return '<option' + (G.shop === l ? ' selected' : '') + '>' + l + '</option>'; }).join('') + '</select></label>';
      h += btn('genRoll', (root.Icon ? root.Icon('d20') : '') + ' Make one', {}, 'btn primary') + (G.last ? btn('genKeep', '☆ Keep it', {}, 'btn') : '') + '</div></div>' + resultHtml(G.last);
      var S = saved();
      if (S.length) h += '<h3>Kept</h3>' + S.map(function (x, i) { var open = G.open === i; return '<div class="panel"><div class="toolbar" style="margin:0"><button type="button" class="linkbtn" data-act="genOpen" data-v="' + i + '"><b>' + esc(title(x)) + '</b></button><span class="small muted">' + ({ npc: 'NPC', tavern: 'Tavern', shop: 'Shop' })[x.t] + '</span><span class="spacer"></span>' + btn('genRm', '✕', { v: i }, 'btn small') + '</div>' + (open ? resultHtml(x) : '') + '</div>'; }).join('');
      return h + '</main>';
    }
    var actions = {
      genTab: function (v) { G.tab = v; G.last = null; },
      genRoll: function () { G.last = { t: G.tab, v: G.tab === 'npc' ? root.Generators.npc(G.lin) : G.tab === 'tavern' ? root.Generators.tavern() : root.Generators.shop(G.shop, D) }; },
      genKeep: function () { if (G.last) { saved().unshift(G.last); G.last = null; } },
      genOpen: function (v) { G.open = G.open === +v ? null : +v; },
      genRm: function (v) { saved().splice(+v, 1); G.open = null; }
    };
    function onInput(t) { var k = t.getAttribute('data-gen'); if (k == null) return null; G[k] = t.value; return 'render'; }
    return { html: html, actions: actions, onInput: onInput };
  };
})(typeof window !== 'undefined' ? window : globalThis);
