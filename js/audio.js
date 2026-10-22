// Audio: music for the table, laid out like DnDify. Tabs (All, Ambient, Atmosphere, Combat, Creatures, Monsters,
// Mood, Situation), one tap on a name plays it, and a fight button that is always there: Tough, Standard or Boss.
// Music comes from public Spotify playlists (or your own links) and plays in a player docked at the bottom that
// keeps going while you use the rest of the app, with previous / play-pause / next. With Spotify Premium, the app
// can instead tell your own Spotify app what to play (js/spotify.js): whole songs, real previous and next.
(function (root) {
  'use strict';
  // [tab id, tab name]
  var TABS = [
    ['amb', 'Ambient'],
    ['atm', 'Atmosphere'],
    ['cmb', 'Combat'],
    ['cre', 'Creatures'],
    ['mon', 'Monsters'],
    ['mood', 'Mood'],
    ['sit', 'Situation']
  ];
  // Public Spotify playlists, by id: [playlist id, name]
  var P = {
    tavernMusic: ['2Ca3Hi7H5ASwu7jsNCIddE', 'Medieval Tavern Music'],
    tavern500: ['2IZI0N8iQdxOdwuAVoYrZR', 'Medieval Tavern (500+ tracks)'],
    inn: ['3U50OBVK3wZUcUmL9FmsSs', 'DnD: Inn'],
    beer: ['3h7Z499ZxaYawJ2UMeYtlZ', '🍻 DnD'],
    medVillage: ['11DtJxzdFDOsAVzn2ofQd8', 'DnD - Medieval Village'],
    village: ['6mQdL9qWFhi1HuGvzx3dTx', 'DnD: Village'],
    city: ['5gnpcmfGRl8GaJlxyVMh4U', 'DnD City'],
    city2: ['1TjK2l1WU0hwRxJsAkSTA1', 'DnD: City'],
    medTown: ['1BabADdkcNNQ9Kmnfvxj9a', 'Medieval Town'],
    metropolis: ['6Vt84DWKqLOjVv1rH4iuUF', 'DnD Metropolis'],
    industry: ['17vDg0I6pu5jEUPgR3pbMA', 'DnD: Industry Town'],
    steampunk: ['1R8VzEy3XxrXCXHJOKwjio', 'DnD Steampunk'],
    royal: ['5ysi5SP1mmaxfBgrYNjagV', 'DnD: Royal Court'],
    honor: ['7D7fnlZrBGpRbrZtOg8bYt', 'DnD Honor'],
    majestic: ['4QYLgjCriwTPsM50xBABlE', 'DnD - Majestic Atmosphere'],
    temple: ['3ou7uWdndh8T7Xd3u0LoMp', 'DnD: Temple'],
    pagan: ['2PMNCtbjUKcHuxvezr421y', 'DnD - Pagan'],
    western: ['1C1lfZvH0YI9AvCKVmFuKX', 'DnD Western'],
    exploration: ['19OuMlyNc07MIJQeTVMwIe', 'DnD - Fantasy Exploration'],
    voyage: ['608H1khJ4FbOSgtNOFqxxW', 'DnD Voyage'],
    adventure: ['19lrJbgreBfi4HlLYOsPyV', 'D&D Adventure Music'],
    adventuring: ['3LGcymlXO40dcbLiRsFfLm', 'Adventuring Music'],
    elvenForest: ['6WHwtLXHwxH9AEC4qo4tYX', 'Elven Forest Ambience'],
    forest: ['5lYc0l9TVNRRcl9Nfz6HLU', 'DnD: Forest'],
    night: ['4eKJflaVoy3EGAJsA6Nfq1', 'DnD - Night Atmosphere'],
    north: ['7rTE7yXRCqoDpihnFHTUyH', 'DnD: North'],
    snow: ['4HN1dZLsqoNTF6dAhHDrR2', 'DnD - Snow & Ice'],
    desert: ['0p3a3aXtnHJeh5lvV48rc1', 'DnD: Desert'],
    desert2: ['5804wUcuihLAVLVSy6j5Dj', 'DnD Desert'],
    jungle: ['4uy8VyF97m6VULvsLZYPSU', 'DnD: Jungle'],
    tropical: ['2Bia9tnJxDaIJL68JIj4Zj', 'DnD Tropical'],
    pirates: ['54ZvOysRXaSu1x246yNJwD', 'DnD Pirates'],
    pirates2: ['4dduFQ9aDvl4C2o3Fm3ejw', 'DnD: Pirates'],
    shanty: ['6wzHc9LYCHuTCvvXezlyKu', 'Sea Shanty Ambient'],
    underwater: ['4LjYUCXVlw2qeVFluqnkm5', 'DnD Underwater'],
    stormy: ['37i9dQZF1DX2pSTOxoPbx9', 'Dark & Stormy'],
    campfire: ['3nNhKHeLppJl9x7NpGf0l7', 'DnD Campfire'],
    restCamp: ['3Mj4KgXSruvhHvsllw392U', 'Resting by the Campfire'],
    caves: ['6jlaEq49yMXmlZgZstYOJj', 'DnD - Caves'],
    ambientExpl: ['4MDzUUHA0V2UC9nKNJxkXV', 'DnD - Ambient Exploration'],
    ambient: ['58M8X6nRfKaZ4T60jbN2we', 'DnD Ambient'],
    dungeon: ['3h7mjadevdr4tJFXVvH6Cu', 'DnD Dungeon'],
    ambDungeon: ['61r7AoxyRCmo03tIoKpPko', 'Ambient: Dungeon'],
    creepyDungeon: ['429Y5dm8z0On9pxh0tY9Eq', 'Creepy Dungeon Music'],
    tombs: ['4ZtKPv97GaE4Lms9Cmcdoa', 'DnD - Underground Tombs'],
    enchanted: ['0dceOYAFCYpmx9NLtr2QyD', 'DnD Enchanted'],
    magical: ['2Lvwt0Bw7QVAXWdXI62Jiz', 'DnD: Magical'],
    feywild: ['1yYMz2aZf9qyUcQmeiYjip', 'Feywild Ambience'],
    feywild2: ['1WUw0WdF59lT81yPGBwWgL', 'The Feywild'],
    mystical: ['5b9mcDxvx3cycciPw8C4wn', 'DnD: Mystical'],
    investigation: ['3Yxt8Z4pnjQ6uFZKEK30al', 'Investigation & Mystery'],
    mysterious: ['6eSxCnwg3fEHD0UCdXYGdL', 'Mysterious DnD Music'],
    skull: ['0uADzKu4SM1f4yHKRuclZH', '💀 DnD'],
    horror: ['4iXZaoFkgsa16MzC844L1m', 'DnD: Horror'],
    horror2: ['1zrjG0me3fUh9N5OCtslrB', 'D&D Horror'],
    ominous: ['6cXCERlllosIgL02ewXHEs', 'Ominous Dark Fantasy'],
    villains: ['3QDYKaubqxQBtvoC6P5eg3', 'DnD Villains'],
    evil: ['3wNE68CF5CVx4hskDKsozC', 'DnD: Evil'],
    grimdark: ['4pRdDmM1OYlJ0j7TDOCiI3', 'DnD: Grimdark'],
    hags: ['4E2DIO7FkrKwaAovtLNhQy', 'DnD: Encounter - Hags'],
    peaceful: ['14bqvFqpVAOteR34ANLXNp', 'DnD - Peaceful Atmosphere'],
    calm: ['7sdVk3vZxrvvYrHDi9BrNK', 'DnD - Calm'],
    ambivalent: ['73pCDb9X1xlNeHJCR4PAoT', 'DnD - Ambivalent'],
    intense: ['0OhKwGjFeChOrtPGBdyVtL', 'DnD Intense'],
    prep: ['11hKhHtkhfXj4cqLry3ms3', 'DnD - Battle Preparation'],
    emotional: ['0zD8flCSvPCOV4lqbjnUCE', 'DnD Emotional'],
    sadThemes: ['0TKsFw6NQ57ZqhbJrjVHhM', 'Sad DnD Themes'],
    melancholic: ['1Mbdl2LIOk9MvpadoBXNG8', 'Sad & Melancholic'],
    triumphant: ['43f1nm2QS6UHLm4TvktpBk', 'Triumphant Scenes'],
    victory: ['5QvlKRARFeT2SQXVTA6zQ0', 'D&D Victory'],
    heroic: ['4JdBmthvT9VSfpuDu3itVq', 'Heroic Cinematic Music'],
    antics: ['0vov8lSCtTuWVxFwR6qs5j', 'DnD Antics'],
    // fights
    battle: ['4u5owGgsXdeYchDcjvwJ3c', 'DnD - Combat: Battle'],
    combat: ['5OfeOCp481xOMkF4qBAdlW', 'DnD Combat'],
    standardCombat: ['7z2A20lZolZDLxxF9RoHqq', 'Standard Combat DnD Music'],
    skirmish: ['2XQfjcb2nxZxGGMu6U0XuK', 'DnD - Combat: Skirmish'],
    badass: ['5aphGVaTdGyHHHE7TtnagV', 'DnD - Combat: Badass'],
    tough: ['20YH21X0z9zYbo79RV1LP9', 'DnD - Combat: Tough'],
    epic: ['2F5ZKGK8TnUKjYioLOQELM', 'DnD - Combat: Epic'],
    epicFight: ['6OyPwuASwrP8vfWQt7RVNy', 'DnD: Combat - Epic Fight'],
    epicCombat: ['1bbIcqTRI5oCXeXMCV8nij', 'Epic Combat'],
    tribal: ['0WNwpEkesczJMbG2ECYweA', 'DnD - Combat: Tribal'],
    undead: ['2yu6oinocQbtXglQyEjtKm', 'DnD - Combat: Undead'],
    duel: ['7hj4gDJFjyJjvDYfDOYekF', 'DnD: Duel'],
    pirateCombat: ['2NpfgBvsELK9hKRzWGnCY5', 'DnD: Combat - Pirates'],
    nautical: ['23wwFIDNQukMeGOIEIYSY3', 'Nautical Combat'],
    boss: ['6oDoHB1ORtOgQZtd0lSLpS', 'DnD Boss'],
    bossBattle: ['70fkeaVPT2L827fdLbBWkp', 'DnD: Boss Battle'],
    bossHigh: ['5J22LSj5myp2fwxBVrtGab', 'High-Intensity Boss Fights'],
    bossEpic: ['5WnB6wpclrPltZNYBjQQ7c', 'Epic Boss Music']
  };
  // [tab, name, playlists (keys of P), fight music that suits it better: { standard, tough, boss } (optional)]
  var ITEMS = [
    ['amb', 'Blacksmith', ['industry', 'medVillage']],
    ['amb', 'Campfire', ['campfire', 'restCamp']],
    ['amb', 'Cavern', ['caves', 'ambientExpl']],
    ['amb', 'Chambers of Torture', ['creepyDungeon', 'grimdark']],
    ['amb', 'Farmland', ['village', 'peaceful']],
    ['amb', 'Forest (Night)', ['night', 'elvenForest']],
    ['amb', 'Forest', ['elvenForest', 'forest']],
    ['amb', 'Haunted Place', ['skull', 'horror'], { standard: 'undead' }],
    ['amb', 'Mountain Pass', ['north', 'exploration']],
    ['amb', 'Mystical', ['mystical', 'pagan']],
    ['amb', 'Ocean', ['shanty', 'voyage'], { standard: 'pirateCombat', tough: 'nautical' }],
    ['amb', 'Ship', ['pirates', 'pirates2'], { standard: 'pirateCombat', tough: 'nautical' }],
    ['amb', 'Storm', ['stormy', 'ominous']],
    ['amb', 'Tavern', ['tavernMusic', 'beer'], { standard: 'badass' }],
    ['amb', 'Underwater', ['underwater', 'shanty'], { tough: 'nautical' }],
    ['amb', 'Workshop', ['steampunk', 'industry']],
    ['atm', 'Capital', ['metropolis', 'city2']],
    ['atm', 'Cathedral', ['temple', 'majestic']],
    ['atm', 'Desert', ['desert', 'desert2']],
    ['atm', 'Dungeon', ['dungeon', 'ambDungeon']],
    ['atm', 'Fey', ['enchanted', 'feywild']],
    ['atm', 'Manor', ['royal', 'majestic']],
    ['atm', 'Road', ['voyage', 'adventure']],
    ['atm', 'Saloon', ['western', 'beer']],
    ['atm', 'Tavern', ['inn', 'tavern500'], { standard: 'badass' }],
    ['atm', 'Town', ['medTown', 'city']],
    ['atm', 'Underdark', ['tombs', 'dungeon']],
    ['atm', 'Wilderness', ['exploration', 'adventuring']],
    ['cmb', 'Assassins', ['intense', 'skirmish']],
    ['cmb', 'Duel', ['duel', 'skirmish']],
    ['cmb', 'Epic', ['epic', 'epicFight']],
    ['cmb', 'Horrifying', ['undead', 'villains']],
    ['cmb', 'Lighthearted', ['badass', 'antics']],
    ['cre', 'Dwarves', ['honor', 'industry']],
    ['cre', 'Elves', ['elvenForest', 'enchanted']],
    ['cre', 'Lizardfolk', ['jungle', 'tropical'], { standard: 'tribal' }],
    ['mon', 'Aberrations', ['evil', 'ominous']],
    ['mon', 'Beasts', ['tribal', 'jungle']],
    ['mon', 'Dragons', ['boss', 'bossEpic'], { boss: 'bossEpic' }],
    ['mon', 'Giants', ['epic', 'north']],
    ['mon', 'Goblins', ['skirmish', 'badass']],
    ['mon', 'Hags', ['hags', 'skull']],
    ['mon', 'Orcs', ['battle', 'tribal']],
    ['mon', 'Tribesmen', ['tribal', 'pagan'], { standard: 'tribal' }],
    ['mon', 'Undead', ['undead', 'tombs'], { standard: 'undead' }],
    ['mon', 'Vampires', ['grimdark', 'horror2'], { boss: 'villains' }],
    ['mood', 'Broken', ['emotional', 'melancholic']],
    ['mood', 'Calm', ['calm', 'peaceful']],
    ['mood', 'Creepy', ['creepyDungeon', 'skull']],
    ['mood', 'Denouement', ['ambivalent', 'emotional']],
    ['mood', 'Disturbing', ['grimdark', 'horror2']],
    ['mood', 'Dreamy', ['feywild', 'feywild2']],
    ['mood', 'Eerie', ['ominous', 'skull']],
    ['mood', 'Foreboding', ['prep', 'ominous']],
    ['mood', 'Funeral', ['sadThemes', 'melancholic']],
    ['mood', 'Horror', ['horror', 'horror2'], { standard: 'undead', boss: 'villains' }],
    ['mood', 'Hypnotic', ['ambientExpl', 'ambient']],
    ['mood', 'Inspiring', ['heroic', 'honor']],
    ['mood', 'Joyful', ['victory', 'beer']],
    ['mood', 'Magical', ['magical', 'enchanted']],
    ['mood', 'Mysterious', ['mysterious', 'investigation']],
    ['mood', 'Mystical', ['mystical', 'pagan']],
    ['mood', 'Nightmare', ['horror2', 'evil']],
    ['mood', 'Ominous', ['ominous', 'villains'], { boss: 'villains' }],
    ['mood', 'Peaceful', ['peaceful', 'calm']],
    ['mood', 'Pleasant', ['village', 'peaceful']],
    ['mood', 'Respectful', ['royal', 'majestic']],
    ['mood', 'Resurrection', ['majestic', 'triumphant']],
    ['mood', 'Revelation', ['investigation', 'majestic']],
    ['mood', 'Ridiculous', ['antics', 'beer']],
    ['mood', 'Sadness', ['sadThemes', 'emotional']],
    ['mood', 'Secrets', ['investigation', 'mystical']],
    ['mood', 'Serious', ['honor', 'prep']],
    ['mood', 'Somber', ['melancholic', 'ambivalent']],
    ['mood', 'Suspense', ['intense', 'stormy']],
    ['mood', 'Tense', ['prep', 'intense']],
    ['mood', 'Triumphant', ['triumphant', 'victory']],
    ['sit', 'Bards', ['tavernMusic', 'beer']],
    ['sit', 'Chase', ['intense', 'battle']],
    ['sit', 'Halloween', ['skull', 'horror']],
    ['sit', 'Stealth', ['dungeon', 'investigation']]
  ];
  // the fight button: Tough, Standard, Boss
  var FIGHTS = [
    ['tough', 'Tough'],
    ['standard', 'Standard'],
    ['boss', 'Boss']
  ];
  var FIGHT = {
    standard: ['battle', 'combat', 'standardCombat'],
    tough: ['tough', 'epic', 'epicCombat'],
    boss: ['boss', 'bossBattle', 'bossHigh']
  };
  // Mutants & Masterminds is set in our time: modern scenes instead of taverns and dungeons.
  var TABS_MM = [['mm', 'Scenes']];
  Object.assign(P, {
    lofi: ['37i9dQZF1DWWQRwui0ExPn', 'lofi beats'],
    nightDrive: ['0iAeUtwINlqfjwAyQ4ykur', 'Synthwave - Night Drive'],
    bladeRunner: ['2CiqzE8dKtmgpWAR6TbTIF', 'Blade Runner Vibes / Night Driving'],
    heroic2: ['0dQJTXwu3ZEL7ZyWI3YYQp', 'Best Epic Heroic Musics'],
    beastMode: ['37i9dQZF1DX76Wlfdnj7AP', 'Beast Mode'],
    drive: ['1CnAtW2mIejhmERcoQN9Yx', 'Drive Soundtrack'],
    villainSongs: ['4R2fMrgc2tkyKD5bwEXlDa', 'Songs that make you feel like the villain'],
    feelVillain: ['17V25rm8DeYNsU4YaZfYUK', 'Feel like a villain'],
    cyberRadar: ['3UkdZt86rkqMOFvuWrt92O', 'Cyberpunk Radar'],
    edgerunners: ['11WEQezlbeZ7O5k7r6A64r', 'Cyberpunk: Edgerunners'],
    jazzNoir: ['0Bhwoi6JTUFqjzmZoABfqP', 'Jazz Noir'],
    toots: ['1FDVy3qAIVCiBkFV8TdRDj', 'Beat It, Toots - Noir Jazz'],
    space: ['6Hui516oyyhckcM744zX8L', 'Space Sounds'],
    lifeSucks: ['37i9dQZF1DX3YSRoSdA634', 'Life Sucks'],
    superhero: ['2FjygbVJiTiKaTlpiyuPIn', 'Superhero music']
  });
  var ITEMS_MM = [
    ['mm', 'Headquarters', ['lofi']],
    ['mm', 'City at night', ['nightDrive', 'bladeRunner']],
    ['mm', 'Hero moment', ['heroic', 'heroic2']],
    ['mm', 'Action and chase', ['beastMode', 'drive']],
    ['mm', 'Villain', ['villainSongs', 'feelVillain']],
    ['mm', 'Tech and hacking', ['cyberRadar', 'edgerunners']],
    ['mm', 'Investigation', ['jazzNoir', 'toots']],
    ['mm', 'Tension', ['stormy']],
    ['mm', 'Space and cosmic', ['space']],
    ['mm', 'Sad moment', ['lifeSucks', 'melancholic']],
    ['mm', 'Victory', ['heroic2', 'triumphant']]
  ];
  var FIGHT_MM = { standard: ['superhero'], tough: ['epicCombat'], boss: ['villainSongs'] };
  var PL = 'https://open.spotify.com/playlist/';
  var slug = function (tab, name) {
    return (
      tab +
      '-' +
      String(name)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
    );
  };
  // each item, ready to use: { id, tab, name, picks: [{u, t}], fights }
  function build(items) {
    return items.map(function (x) {
      return {
        id: slug(x[0], x[1]),
        tab: x[0],
        name: x[1],
        picks: x[2].map(function (k) {
          return { u: PL + P[k][0], t: P[k][1] };
        }),
        fights: x[3] || {}
      };
    });
  }
  var ALL = build(ITEMS),
    ALL_MM = build(ITEMS_MM);
  // what the earlier Audio pages called their moods and scenes, so your own playlists move over
  var OLD = {
    tavern: 'amb-tavern',
    town: 'atm-town',
    travel: 'atm-road',
    forest: 'amb-forest',
    camp: 'amb-campfire',
    dungeon: 'atm-dungeon',
    mystery: 'mood-mysterious',
    horror: 'mood-horror',
    sea: 'amb-ship',
    sad: 'mood-sadness',
    victory: 'mood-triumphant',
    magic: 'atm-fey',
    village: 'amb-farmland',
    castle: 'atm-manor',
    temple: 'atm-cathedral',
    snow: 'amb-mountain-pass',
    desert: 'atm-desert',
    jungle: 'cre-lizardfolk',
    caves: 'amb-cavern',
    tombs: 'mon-undead',
    evil: 'mood-ominous',
    calm: 'mood-calm',
    tension: 'mood-tense',
    funny: 'mood-ridiculous',
    hq: 'mm-headquarters',
    city: 'mm-city-at-night',
    hero: 'mm-hero-moment',
    chase: 'mm-action-and-chase',
    villain: 'mm-villain',
    tech: 'mm-tech-and-hacking',
    noir: 'mm-investigation',
    space: 'mm-space-and-cosmic',
    msad: 'mm-sad-moment',
    mwin: 'mm-victory'
  };

  // Spotify links that can play inside the app: open.spotify.com/{playlist|album|track|episode|show|artist}/{id}
  function spotifyEmbed(u) {
    var m = String(u).match(
      /^https:\/\/open\.spotify\.com\/(?:intl-[a-z-]+\/)?(playlist|album|track|episode|show|artist)\/([A-Za-z0-9]+)/
    );
    return m ? 'https://open.spotify.com/embed/' + m[1] + '/' + m[2] : '';
  }
  function service(u) {
    return /spotify\.com/.test(u) ? 'Spotify' : /qobuz\.com/.test(u) ? 'Qobuz' : 'Link';
  }
  // Only plain web links are kept: no javascript: or data: links from a pasted value.
  function cleanUrl(u) {
    u = String(u || '').trim();
    try {
      var x = new URL(u);
      return x.protocol === 'https:' ? x.href : '';
    } catch (e) {
      return '';
    }
  }
  function searches(words) {
    var e = encodeURIComponent(words);
    return {
      spotify: 'https://open.spotify.com/search/' + e + '/playlists',
      qobuz: 'https://www.qobuz.com/search?q=' + e
    };
  }

  root.AudioUI = function (api) {
    var esc = api.esc,
      btn = api.btn,
      ui = api.ui,
      store = api.store,
      gameFn = api.game;
    // your own playlists: lists[item id], and lists['*:tough'] (and standard, boss) for the fight button
    var A = function () {
      var a = (store.audio = store.audio || { lists: {} }),
        L = a.lists;
      if (!a.v2) {
        Object.keys(L).forEach(function (k) {
          var m = /^(\w+):(standard|tough|boss)$/.exec(k),
            to = m ? '*:' + m[2] : k === 'combat' ? '*:standard' : k === 'boss' ? '*:boss' : OLD[k];
          if (!to || to === k) return;
          L[to] = (L[to] || []).concat(L[k]);
          delete L[k];
        });
        a.v2 = true;
      }
      return a;
    };
    var S = (ui.audio = ui.audio || {
      tab: 'all',
      tabMM: 'all',
      q: '',
      open: '',
      add: '',
      name: '',
      msg: '',
      fab: false
    });
    function modern() {
      return !!gameFn && gameFn() === 'mm';
    }
    function items() {
      return modern() ? ALL_MM : ALL;
    }
    function tabs() {
      return modern() ? TABS_MM : TABS;
    }
    function byId(id) {
      return items().filter(function (x) {
        return x.id === id;
      })[0];
    }
    function tabName(t) {
      return (tabs().filter(function (x) {
        return x[0] === t;
      })[0] || ['', ''])[1];
    }
    // everything one item can play: your links first, then the suggestions
    function playable(x) {
      return (A().lists[x.id] || []).concat(x.picks);
    }
    function fightList(f) {
      var base = (modern() ? FIGHT_MM : FIGHT)[f] || [],
        cur = byId(S.current) || {},
        own = (cur.fights || {})[f],
        seen = {};
      return (A().lists['*:' + f] || []).concat(
        (own ? [own] : []).concat(base).reduce(function (out, k) {
          if (!seen[k]) out.push({ u: PL + P[k][0], t: P[k][1] });
          seen[k] = 1;
          return out;
        }, [])
      );
    }

    // ---------- the player docked at the bottom ----------
    var playing = null; // { u, t, what } shown in the dock
    // The dock lives outside the app's page, so redrawing pages never stops the music.
    function dock() {
      var el = document.getElementById('audio-dock');
      if (!el) {
        el = document.createElement('div');
        el.id = 'audio-dock';
        el.className = 'audio-dock noprint';
        el.innerHTML =
          '<div class="audio-now"><b></b><span class="audio-ctl">' +
          '<button type="button" class="btn small" data-act="audPrev" title="Back to the start of the song" aria-label="Previous">⏮</button>' +
          '<button type="button" class="btn small" data-act="audToggle" title="Play or pause" aria-label="Play or pause">⏯</button>' +
          '<button type="button" class="btn small" data-act="audSkip" title="Next song" aria-label="Next song">⏭</button>' +
          '<button type="button" class="btn small" data-act="audBig" title="Show the songs, tap one to play it" aria-label="Show the songs">≡</button>' +
          '<button type="button" class="btn small" data-act="audStop" aria-label="Close the player">✕</button></span></div>' +
          '<div class="audio-frame"><div id="spotify-embed"></div></div>';
        document.body.appendChild(el);
      }
      return el;
    }
    // Spotify's iFrame API lets the app start the music itself, switch playlists without rebuilding the player, and
    // move within a song. If it doesn't answer quickly (offline, blocked), the plain player stays and you tap ▶ in it.
    var spot = null,
      ctl = null,
      apiState = '',
      waiting = [],
      pos = { at: 0, len: 0 };
    function loadApi(done) {
      if (spot) return done(spot);
      if (apiState === 'failed') return done(null);
      waiting.push(done);
      if (apiState) return;
      apiState = 'loading';
      var finish = function (A) {
        if (apiState !== 'loading') return;
        spot = A;
        apiState = A ? 'ready' : 'failed';
        var w = waiting;
        waiting = [];
        w.forEach(function (f) {
          f(A);
        });
      };
      var prev = root.onSpotifyIframeApiReady;
      root.onSpotifyIframeApiReady = function (A) {
        if (prev)
          try {
            prev(A);
          } catch (e) {
            /* ignore */
          }
        finish(A);
      };
      setTimeout(function () {
        finish(null);
      }, 5000);
      var sc = document.createElement('script');
      sc.src = 'https://open.spotify.com/embed/iframe-api/v1';
      sc.async = true;
      sc.onerror = function () {
        finish(null);
      };
      document.head.appendChild(sc);
    }
    function uriOf(u) {
      var m = spotifyEmbed(u).match(/embed\/(\w+)\/(\w+)/);
      return m ? 'spotify:' + m[1] + ':' + m[2] : '';
    }
    function plain(el, src) {
      ctl = null;
      el.querySelector('.audio-frame').innerHTML =
        '<iframe title="Spotify player" src="' +
        esc(src) +
        '?utm_source=generator&theme=0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"></iframe>';
    }
    // ---------- or your own Spotify, through your account (whole songs) ----------
    var R = root.SpotifyRemote,
      poll = 0;
    function remote() {
      return !!(R && R.connected());
    }
    function rErr(e) {
      S.rmsg = e.message;
      S.now = '';
      api.render && api.render();
    }
    // the song playing now, shown in the bar (checked every 15 seconds while the music plays)
    function refreshNow(later) {
      clearTimeout(poll);
      poll = setTimeout(function () {
        if (!playing || !remote()) return;
        if (document.hidden) return refreshNow(15000);
        R.now().then(function (n) {
          S.now = n ? n.song + (n.artist ? ' — ' + n.artist : '') : '';
          S.paused = n ? !n.playing : true;
          drawDock();
          refreshNow(15000);
        }, rErr);
      }, later || 800);
    }
    function drawDock() {
      if (remote() && playing) return drawRemote();
      dock().classList.remove('app');
      var el = dock(),
        src = playing ? spotifyEmbed(playing.u) : '';
      document.body.classList.toggle('has-dock', !!src);
      document.body.classList.toggle('dock-big', !!src && !!S.big);
      el.classList.toggle('on', !!src);
      el.classList.toggle('big', !!S.big);
      el.classList.toggle('remote', !!ctl);
      el.querySelector('.audio-now b').textContent = playing
        ? (playing.what ? playing.what + ' · ' : '') + (playing.t || '')
        : '';
      place();
      if (!src) {
        el.removeAttribute('data-src');
        if (ctl)
          try {
            ctl.pause();
          } catch (e) {
            /* not ready */
          }
        return;
      }
      if (el.getAttribute('data-src') === src) return;
      el.setAttribute('data-src', src);
      // show the player at once; the remote control takes over when Spotify's API answers
      if (!ctl) plain(el, src);
      loadApi(function (A) {
        if (!playing || spotifyEmbed(playing.u) !== src) return; // changed meanwhile
        if (!A) return; // the plain player is already there
        if (ctl) {
          ctl.loadUri(uriOf(playing.u));
          ctl.play();
          return;
        }
        el.querySelector('.audio-frame').innerHTML = '<div id="spotify-embed"></div>';
        A.createController(
          document.getElementById('spotify-embed'),
          { uri: uriOf(playing.u), width: '100%', height: 352 },
          function (c) {
            ctl = c;
            el.classList.add('remote');
            c.addListener('ready', function () {
              c.play();
            });
            c.addListener('playback_update', function (e) {
              var d = (e && e.data) || {};
              pos = { at: +d.position || 0, len: +d.duration || 0 };
            });
          }
        );
      });
    }
    function place() {
      var m = document.querySelector('.mini-bar'),
        h = m && root.getComputedStyle(m).display !== 'none' ? m.offsetHeight : 0;
      dock().style.bottom = h + 'px';
    }
    // the bar when your Spotify app plays: what's on, and the buttons; no player inside the page
    function drawRemote() {
      var el = dock();
      if (ctl)
        try {
          ctl.pause();
        } catch (e) {
          /* not ready */
        }
      el.removeAttribute('data-src');
      el.querySelector('.audio-frame').innerHTML = '';
      el.classList.add('on', 'app', 'remote');
      el.classList.remove('big');
      document.body.classList.add('has-dock');
      document.body.classList.remove('dock-big');
      el.querySelector('.audio-now b').textContent =
        (playing.what ? playing.what + ' · ' : '') + (S.now || playing.t || '') + (S.rmsg ? ' — ' + S.rmsg : '');
      place();
    }
    function start(u, t, what) {
      playing = { u: u, t: t || '', what: what || '' };
      S.rmsg = '';
      S.now = '';
      if (remote() && spotifyEmbed(u)) {
        drawDock();
        R.play(u).then(function (d) {
          S.dev = d.name;
          S.paused = false;
          refreshNow();
        }, rErr);
      } else drawDock();
      toTable();
    }
    function playItem(x) {
      var all = playable(x),
        first = all.filter(function (p) {
          return spotifyEmbed(p.u);
        })[0];
      S.current = x.id;
      if (first) start(first.u, first.t, x.name);
      else if (all[0]) root.open(all[0].u, '_blank', 'noopener');
    }

    // ---------- the page ----------
    function row(x, i, key, what) {
      var sp = !!spotifyEmbed(x.u),
        on = playing && playing.u === x.u;
      return (
        '<div class="audio-item' +
        (on ? ' on' : '') +
        '">' +
        (key ? '<span class="tag">' + service(x.u) + '</span>' : '') +
        '<b>' +
        esc(x.t || x.u) +
        '</b><span class="spacer"></span>' +
        (sp
          ? btn(
              'audPlay',
              on ? '■ Stop' : '▶ Play',
              { v: x.u, t: x.t || '', w: what || '' },
              'btn small' + (on ? '' : ' primary')
            )
          : '') +
        '<a class="btn small" href="' +
        esc(x.u) +
        '" target="_blank" rel="noopener">' +
        (sp ? 'Spotify ↗' : 'Open ↗') +
        '</a>' +
        (key ? btn('audRm', '✕', { v: i, k: key }, 'btn small') : '') +
        '</div>'
      );
    }
    // under an item: your own playlists, the suggested ones, and a box to add one
    function details(x) {
      var mine = A().lists[x.id] || [],
        sr = searches((modern() ? '' : 'dnd ') + x.name + ' music');
      return (
        '<div class="audio-more">' +
        mine
          .map(function (p, i) {
            return row(p, i, x.id, x.name);
          })
          .join('') +
        x.picks
          .map(function (p) {
            return row(p, 0, '', x.name);
          })
          .join('') +
        '<div class="row audio-add"><label class="field"><span>Your own link</span><input type="url" id="aud-add" data-aud="add" value="' +
        esc(S.add) +
        '" placeholder="https://open.spotify.com/playlist/…"></label><label class="field"><span>Name <small class="muted">(optional)</small></span><input type="text" id="aud-name" data-aud="name" value="' +
        esc(S.name || '') +
        '"></label></div><div class="toolbar">' +
        btn('audAdd', '+ Add to ' + esc(x.name), { v: x.id }, 'btn small') +
        '<a class="small" href="' +
        esc(sr.spotify) +
        '" target="_blank" rel="noopener">Find more on Spotify</a><a class="small" href="' +
        esc(sr.qobuz) +
        '" target="_blank" rel="noopener">Qobuz</a>' +
        (S.msg ? '<span class="small" style="color:var(--warn)">' + esc(S.msg) + '</span>' : '') +
        '</div></div>'
      );
    }
    // the fight button, always at hand: Tough, Standard or Boss
    function fightFab() {
      var open = S.fab;
      return (
        '<div class="audio-fab-wrap noprint">' +
        (open
          ? '<div class="audio-fab-menu">' +
            FIGHTS.map(function (f) {
              var on = playing && playing.what === f[1] + ' fight';
              return (
                '<button type="button" class="audio-fab-opt' +
                (on ? ' on' : '') +
                '" data-act="audFight" data-v="' +
                f[0] +
                '"><span>' +
                f[1] +
                '</span><i aria-hidden="true">' +
                root.Icon('swords') +
                '</i></button>'
              );
            }).join('') +
            '</div>'
          : '') +
        '<button type="button" class="audio-fab' +
        (open ? ' open' : '') +
        '" data-act="audFab" aria-label="Fight music: Tough, Standard or Boss" title="Fight!">' +
        root.Icon('swords') +
        '</button></div>'
      );
    }
    function html() {
      var tab = (modern() ? S.tabMM : S.tab) || 'all',
        q = String(S.q || '').toLowerCase(),
        list = items().reduce(function (out, x) {
          if ((tab === 'all' || x.tab === tab) && (!q || x.name.toLowerCase().indexOf(q) >= 0)) out.push(x);
          return out;
        }, []);
      if (tab === 'all')
        list.sort(function (a, b) {
          return a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
        });
      return (
        '<main class="mon-main audio-main"><div class="toolbar" style="margin:0"><h2 style="margin:0">Audio</h2><span class="spacer"></span><input type="search" id="aud-q" data-aud="q" value="' +
        esc(S.q || '') +
        '" placeholder="Find…" aria-label="Find music" style="max-width:10rem"></div>' +
        spotifyPanel() +
        '<nav class="mm-tabs audio-tabs">' +
        [['all', 'All']]
          .concat(tabs())
          .map(function (t) {
            return btn('audTab', esc(t[1]), { v: t[0] }, 'mm-tab' + (tab === t[0] ? ' on' : ''));
          })
          .join('') +
        '</nav><div class="audio-rows">' +
        list
          .map(function (x) {
            var on = playing && S.current === x.id && playing.what === x.name,
              open = S.open === x.id,
              own = (A().lists[x.id] || []).length;
            return (
              '<div class="audio-row' +
              (on ? ' on' : '') +
              '"><button type="button" class="audio-name" data-act="audItem" data-v="' +
              x.id +
              '"><b>' +
              esc(x.name) +
              '</b>' +
              (tab === 'all' && tabs().length > 1 ? ' <span class="muted">· ' + esc(tabName(x.tab)) + '</span>' : '') +
              (on ? '<small>' + esc(playing.t) + '</small>' : '') +
              '</button>' +
              (own ? '<span class="tag">+' + own + '</span>' : '') +
              btn('audMore', open ? '▾' : '⋯', { v: x.id }, 'btn small audio-more-btn') +
              '</div>' +
              (open ? details(x) : '')
            );
          })
          .join('') +
        (list.length ? '' : '<p class="muted">Nothing found.</p>') +
        '</div><p class="small muted">Tap a name to play it, tap it again to stop. ⋯ shows its playlists and lets you add your own. The ⚔ button starts fight music anytime: Tough, Standard or Boss (tap the same one again for another playlist). ' +
        (remote()
          ? 'Plays on your Spotify app, whole songs.'
          : 'The player in the page plays 30-second previews on phones (full songs on a computer logged in to Spotify): connect your Spotify Premium above for whole songs everywhere.') +
        '</p>' +
        fightFab() +
        '</main>'
      );
    }
    var actions = {
      audTab: function (v) {
        if (modern()) S.tabMM = v;
        else S.tab = v;
        S.open = '';
        S.msg = '';
        root.scrollTo(0, 0);
      },
      audItem: function (v) {
        var x = byId(v);
        if (!x) return;
        if (playing && S.current === x.id && playing.what === x.name) {
          playing = null;
          drawDock();
          toTable();
          return;
        }
        playItem(x);
      },
      audMore: function (v) {
        S.open = S.open === v ? '' : v;
        S.msg = '';
      },
      audFab: function () {
        S.fab = !S.fab;
      },
      // the fight button: the scene's own fight music if it has some, else the general one
      audFight: function (v) {
        var f = FIGHTS.filter(function (x) {
            return x[0] === v;
          })[0],
          list = fightList(v),
          i = playing && playing.what === f[1] + ' fight' ? (S.fightIx || 0) + 1 : 0, // tap again: the next playlist
          p = list[i % list.length];
        S.fightIx = i % list.length;
        S.fab = false;
        if (p) start(p.u, p.t, f[1] + ' fight');
      },
      audAdd: function (v) {
        var u = cleanUrl(S.add);
        if (!u) {
          S.msg = 'Paste a full link starting with https://';
          return;
        }
        var L = (A().lists[v] = A().lists[v] || []);
        if (
          L.some(function (x) {
            return x.u === u;
          })
        ) {
          S.msg = 'Already there.';
          return;
        }
        L.unshift({ u: u, t: String(S.name || '').trim() });
        S.add = '';
        S.name = '';
        S.msg = '';
      },
      audRm: function (v, el) {
        var L = A().lists[el.getAttribute('data-k')] || [],
          x = L[+v];
        if (x && playing && playing.u === x.u) {
          playing = null;
          drawDock();
        }
        L.splice(+v, 1);
      },
      audPlay: function (v, el) {
        if (playing && playing.u === v) {
          playing = null;
          drawDock();
          toTable();
          return;
        }
        start(v, el.getAttribute('data-t'), el.getAttribute('data-w'));
      },
      audStop: function () {
        if (remote() && playing) R.pause().catch(function () {});
        playing = null;
        drawDock();
        toTable();
      },
      audToggle: function () {
        if (remote() && playing) {
          (S.paused ? R.resume() : R.pause()).then(function () {
            S.paused = !S.paused;
            refreshNow();
          }, rErr);
          return false;
        }
        if (ctl)
          try {
            ctl.togglePlay();
          } catch (e) {
            /* not ready */
          }
        return false;
      },
      // previous: back to the start of the song (Spotify's player doesn't let an app go to the song before)
      audPrev: function () {
        if (remote() && playing) {
          R.previous().then(function () {
            refreshNow();
          }, rErr);
          return false;
        }
        if (ctl)
          try {
            ctl.seek(0);
          } catch (e) {
            /* not ready */
          }
        return false;
      },
      // next song: jump to the end of this one and the playlist goes on
      audSkip: function () {
        if (remote() && playing) {
          R.next().then(function () {
            refreshNow();
          }, rErr);
          return false;
        }
        if (ctl && pos.len) {
          try {
            ctl.seek(Math.max(0, pos.len / 1000 - 0.5));
          } catch (e) {
            /* not ready */
          }
          return false;
        }
        S.big = true; // no remote control: show the songs to tap the next one
        drawDock();
      },
      audSpOpen: function () {
        S.spOpen = !S.spOpen;
        if (S.spOpen && remote()) loadDevices();
      },
      audSpConnect: function () {
        var el = document.getElementById('aud-spid');
        R.connect(el ? el.value : S.spid).catch(function (e) {
          S.spMsg = e.message;
          api.render && api.render();
        });
        return false;
      },
      audSpOff: function () {
        if (playing) {
          playing = null;
          drawDock();
        }
        R.disconnect();
        S.spMsg = 'Disconnected: “Play” uses the player in the page again.';
      },
      audSpDevices: function () {
        loadDevices();
        return false;
      },
      audBig: function () {
        S.big = !S.big;
        drawDock(); // the page redraws after, so the round buttons move above the taller player
      }
    };
    // when the DM has the table open, the players' phones can follow the music
    function toTable() {
      var T = root.Table,
        h = T && T.hostInfo && T.hostInfo();
      if (h)
        T.dm(h.code, h.key, {
          music: playing ? { u: playing.u, t: (playing.what ? playing.what + ' · ' : '') + playing.t } : null
        }).catch(function () {});
    }
    // what the DM is playing, on a player's phone
    function play(m) {
      var u = m && cleanUrl(m.u);
      playing = u ? { u: u, t: String(m.t || '').slice(0, 80), what: '' } : null;
      drawDock();
    }
    function loadDevices() {
      R.devices().then(
        function (list) {
          S.devices = list;
          S.spMsg = list.length
            ? ''
            : 'No Spotify open right now: open the Spotify app on your phone or computer, then tap Refresh.';
          api.render && api.render();
        },
        function (e) {
          S.spMsg = e.message;
          api.render && api.render();
        }
      );
    }
    // the Client ID the DM's table shared, if this phone joined one
    function tableId() {
      var st = root.Table && root.Table.lastState && root.Table.lastState();
      return (st && st.spid) || '';
    }
    // the panel to connect your Spotify (Premium): the steps, the Client ID, the device to play on
    function spotifyPanel() {
      if (!R) return '';
      var on = remote(),
        open = S.spOpen || (!!S.spMsg && !on);
      var h =
        '<details class="panel audio-sp"' +
        (open ? ' open' : '') +
        '><summary data-act="audSpOpen"><b>🎧 Whole songs: ' +
        (on ? 'connected to Spotify ✓' : 'connect your Spotify Premium') +
        '</b></summary>';
      if (on) {
        var devs = S.devices || [],
          cur = R.device();
        h +=
          '<p class="small">Tapping a name, the ⚔ button, ⏮ ⏯ ⏭ now plays on your own Spotify, whole songs. Keep the Spotify app open (it can stay in the background).</p>' +
          '<div class="toolbar"><label class="small">Play on <select data-aud="dev">' +
          '<option value="">the Spotify that is open</option>' +
          devs
            .map(function (d) {
              return (
                '<option value="' +
                esc(d.id) +
                '"' +
                (d.id === cur ? ' selected' : '') +
                '>' +
                esc(d.name + ' (' + d.type + ')') +
                '</option>'
              );
            })
            .join('') +
          '</select></label>' +
          btn('audSpDevices', 'Refresh', {}, 'btn small') +
          btn('audSpOff', 'Disconnect', {}, 'btn small') +
          '</div>';
      } else
        h +=
          '<p class="small">On phones, the player inside the page only plays 30-second previews. With <b>Spotify Premium</b>, the app can tell your own Spotify app what to play instead: whole songs, real previous and next. One-time setup, about 5 minutes:</p><ol class="small">' +
          '<li>Go to <a href="https://developer.spotify.com/dashboard" target="_blank" rel="noopener">developer.spotify.com/dashboard</a> and log in with your Spotify account.</li>' +
          '<li>Tap <b>Create app</b>. Name: <i>Character Forge</i>. Description: anything. <b>Redirect URI</b>: <code class="audio-uri">' +
          esc(R.redirect()) +
          '</code> (exactly this, then tap Add). Tick <b>Web API</b>, accept the terms, <b>Save</b>.</li>' +
          '<li>Open the app’s <b>Settings</b>, copy the <b>Client ID</b> and paste it below, then <b>Connect</b> and say yes on Spotify’s page.</li>' +
          '<li>For your players: in the app’s <b>User Management</b>, add each player’s name and Spotify email (Spotify allows 5 people per personal app, you included). When they join your table, their Audio page gets your Client ID by itself: they just tap Connect.</li></ol>' +
          '<div class="toolbar"><input type="text" id="aud-spid" data-aud="spid" value="' +
          esc(S.spid || R.clientId() || tableId()) +
          '" placeholder="Client ID" autocomplete="off" style="flex:1;min-width:12rem">' +
          btn('audSpConnect', 'Connect', {}, 'btn primary') +
          '</div><p class="small muted">The Client ID and your login stay in this browser; the app only talks to Spotify.</p>';
      return h + (S.spMsg ? '<p class="small rest-msg">' + esc(S.spMsg) + '</p>' : '') + '</details>';
    }
    // back from Spotify's login page
    if (R)
      R.finishLogin().then(function (r) {
        if (!r) return;
        ui.section = 'audio';
        S.spOpen = true;
        S.spMsg = r.ok
          ? 'Connected! Open the Spotify app on your phone or computer, then tap a name to play it.'
          : r.error;
        if (r.ok) loadDevices();
        api.render && api.render();
      });
    function onInput(t) {
      var k = t.getAttribute('data-aud');
      if (k == null) return null;
      if (k === 'dev') {
        R.setDevice(t.value);
        return 'none';
      }
      S[k] = t.value;
      return k === 'q' ? 'render' : 'none';
    }
    return { html: html, actions: actions, onInput: onInput, after: place, play: play };
  };
  root.AudioUI.spotifyEmbed = spotifyEmbed;
  root.AudioUI.cleanUrl = cleanUrl;
  root.AudioUI.TABS = TABS;
  root.AudioUI.ITEMS = ITEMS;
  root.AudioUI.ITEMS_MM = ITEMS_MM;
  root.AudioUI.P = P;
  root.AudioUI.FIGHT = FIGHT;
})(typeof window !== 'undefined' ? window : globalThis);
