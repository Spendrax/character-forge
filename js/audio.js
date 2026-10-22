// Audio: music for the table, in categories and scenes (in the style of DnDify). Each scene has its ambience and
// three fights: Standard, Tough and Boss. Suggested Spotify playlists, searches on Spotify and Qobuz, your own
// playlists, and a Spotify player docked at the bottom that keeps playing while you move around the app, with a
// Skip button and the song list to jump to another song.
(function (root) {
  'use strict';
  // categories of scenes: [id, name, [[scene id, name, icon (js/icons.js), search words], …]]
  var CATS = [
    [
      'towns',
      'Towns',
      [
        ['tavern', 'Tavern', 'tankard', 'tavern fantasy music'],
        ['village', 'Village', 'house', 'medieval village ambience'],
        ['town', 'City', 'city', 'medieval city ambience'],
        ['castle', 'Castle and court', 'trophy', 'royal court medieval music'],
        ['temple', 'Temple', 'candle', 'fantasy temple choir ambience']
      ]
    ],
    [
      'wild',
      'Wilderness',
      [
        ['travel', 'Travel', 'signpost', 'fantasy adventure travel music'],
        ['forest', 'Forest', 'tree', 'enchanted forest ambience'],
        ['snow', 'Snow and ice', 'moon', 'frozen north fantasy ambience'],
        ['desert', 'Desert', 'sun', 'desert fantasy music'],
        ['jungle', 'Jungle', 'tree', 'jungle tribal fantasy music'],
        ['sea', 'Sea and pirates', 'ship', 'pirate sea shanty ambience'],
        ['camp', 'Camp and night', 'campfire', 'campfire night ambience']
      ]
    ],
    [
      'under',
      'Underground',
      [
        ['caves', 'Caves', 'candle', 'cave ambience dark'],
        ['dungeon', 'Dungeon', 'candle', 'dark dungeon ambience'],
        ['tombs', 'Tombs and undead', 'skull', 'crypt undead ambience']
      ]
    ],
    [
      'magic',
      'Magic and darkness',
      [
        ['magic', 'Feywild and wonder', 'sparkle', 'magical fantasy ambient music'],
        ['mystery', 'Mystery', 'eye', 'mystery investigation fantasy music'],
        ['horror', 'Horror', 'skull', 'dark horror ambience'],
        ['evil', 'Villain’s lair', 'dragon', 'dark villain lair music']
      ]
    ],
    [
      'moods',
      'Moods',
      [
        ['calm', 'Calm', 'sun', 'calm peaceful fantasy music'],
        ['tension', 'Tension and chase', 'bolt', 'tense chase fantasy music'],
        ['sad', 'Sad moment', 'rain', 'sad emotional fantasy music'],
        ['victory', 'Victory', 'trophy', 'triumphant victory fantasy music'],
        ['funny', 'Funny', 'lute', 'whimsical comedic fantasy music']
      ]
    ]
  ];
  // Mutants & Masterminds is set in our time: modern scenes instead of taverns and dungeons.
  var CATS_MM = [
    [
      'scenes',
      'Scenes',
      [
        ['hq', 'Headquarters', 'house', 'lofi chill beats'],
        ['city', 'City at night', 'city', 'synthwave night drive'],
        ['hero', 'Hero moment', 'bolt', 'epic heroic cinematic music'],
        ['chase', 'Action and chase', 'car', 'action movie chase music'],
        ['villain', 'Villain', 'mask', 'villain theme dark'],
        ['tech', 'Tech and hacking', 'laptop', 'cyberpunk hacker music'],
        ['noir', 'Investigation', 'eye', 'noir detective jazz'],
        ['tension', 'Tension', 'candle', 'suspense thriller soundtrack'],
        ['space', 'Space and cosmic', 'rocket', 'space ambient sci-fi'],
        ['msad', 'Sad moment', 'rain', 'sad emotional music'],
        ['mwin', 'Victory', 'trophy', 'triumphant superhero music']
      ]
    ]
  ];
  // Suggested Spotify playlists for each scene's ambience (public D&D playlists): [playlist id, name]
  var PICKS = {
    tavern: [
      ['2Ca3Hi7H5ASwu7jsNCIddE', 'Medieval Tavern Music'],
      ['3U50OBVK3wZUcUmL9FmsSs', 'DnD: Inn'],
      ['3h7Z499ZxaYawJ2UMeYtlZ', '🍻 DnD'],
      ['2IZI0N8iQdxOdwuAVoYrZR', 'Medieval Tavern (500+ tracks)']
    ],
    village: [
      ['11DtJxzdFDOsAVzn2ofQd8', 'DnD - Medieval Village'],
      ['6mQdL9qWFhi1HuGvzx3dTx', 'DnD: Village']
    ],
    town: [
      ['5gnpcmfGRl8GaJlxyVMh4U', 'DnD City'],
      ['1TjK2l1WU0hwRxJsAkSTA1', 'DnD: City'],
      ['1BabADdkcNNQ9Kmnfvxj9a', 'Medieval Town'],
      ['6Vt84DWKqLOjVv1rH4iuUF', 'DnD Metropolis']
    ],
    castle: [
      ['5ysi5SP1mmaxfBgrYNjagV', 'DnD: Royal Court'],
      ['7D7fnlZrBGpRbrZtOg8bYt', 'DnD Honor'],
      ['4QYLgjCriwTPsM50xBABlE', 'DnD - Majestic Atmosphere']
    ],
    temple: [
      ['3ou7uWdndh8T7Xd3u0LoMp', 'DnD: Temple'],
      ['2PMNCtbjUKcHuxvezr421y', 'DnD - Pagan']
    ],
    travel: [
      ['19OuMlyNc07MIJQeTVMwIe', 'DnD - Fantasy Exploration'],
      ['608H1khJ4FbOSgtNOFqxxW', 'DnD Voyage'],
      ['19lrJbgreBfi4HlLYOsPyV', 'D&D Adventure Music'],
      ['3LGcymlXO40dcbLiRsFfLm', 'Adventuring Music']
    ],
    forest: [
      ['6WHwtLXHwxH9AEC4qo4tYX', 'Elven Forest Ambience'],
      ['5lYc0l9TVNRRcl9Nfz6HLU', 'DnD: Forest'],
      ['05RgD6XFGztjwadz9yvW5H', 'Enchanted Forest']
    ],
    snow: [
      ['4HN1dZLsqoNTF6dAhHDrR2', 'DnD - Snow & Ice'],
      ['2HL9NWdKkWuD66WDA9hfpX', 'DnD: Ice'],
      ['7rTE7yXRCqoDpihnFHTUyH', 'DnD: North']
    ],
    desert: [
      ['0p3a3aXtnHJeh5lvV48rc1', 'DnD: Desert'],
      ['5804wUcuihLAVLVSy6j5Dj', 'DnD Desert']
    ],
    jungle: [
      ['4uy8VyF97m6VULvsLZYPSU', 'DnD: Jungle'],
      ['2Bia9tnJxDaIJL68JIj4Zj', 'DnD Tropical']
    ],
    sea: [
      ['54ZvOysRXaSu1x246yNJwD', 'DnD Pirates'],
      ['4dduFQ9aDvl4C2o3Fm3ejw', 'DnD: Pirates'],
      ['6wzHc9LYCHuTCvvXezlyKu', 'Sea Shanty Ambient'],
      ['4LjYUCXVlw2qeVFluqnkm5', 'DnD Underwater']
    ],
    camp: [
      ['3nNhKHeLppJl9x7NpGf0l7', 'DnD Campfire'],
      ['4eKJflaVoy3EGAJsA6Nfq1', 'DnD - Night Atmosphere'],
      ['3Mj4KgXSruvhHvsllw392U', 'Resting by the Campfire']
    ],
    caves: [
      ['6jlaEq49yMXmlZgZstYOJj', 'DnD - Caves'],
      ['4MDzUUHA0V2UC9nKNJxkXV', 'DnD - Ambient Exploration']
    ],
    dungeon: [
      ['3h7mjadevdr4tJFXVvH6Cu', 'DnD Dungeon'],
      ['61r7AoxyRCmo03tIoKpPko', 'Ambient: Dungeon'],
      ['429Y5dm8z0On9pxh0tY9Eq', 'Creepy Dungeon Music']
    ],
    tombs: [
      ['4ZtKPv97GaE4Lms9Cmcdoa', 'DnD - Underground Tombs'],
      ['429Y5dm8z0On9pxh0tY9Eq', 'Creepy Dungeon Music']
    ],
    magic: [
      ['0dceOYAFCYpmx9NLtr2QyD', 'DnD Enchanted'],
      ['2Lvwt0Bw7QVAXWdXI62Jiz', 'DnD: Magical'],
      ['1yYMz2aZf9qyUcQmeiYjip', 'Feywild Ambience']
    ],
    mystery: [
      ['5b9mcDxvx3cycciPw8C4wn', 'DnD: Mystical'],
      ['3Yxt8Z4pnjQ6uFZKEK30al', 'Investigation & Mystery'],
      ['6eSxCnwg3fEHD0UCdXYGdL', 'Mysterious DnD Music']
    ],
    horror: [
      ['0uADzKu4SM1f4yHKRuclZH', '💀 DnD'],
      ['4iXZaoFkgsa16MzC844L1m', 'DnD: Horror'],
      ['6cXCERlllosIgL02ewXHEs', 'Ominous Dark Fantasy']
    ],
    evil: [
      ['3QDYKaubqxQBtvoC6P5eg3', 'DnD Villains'],
      ['3wNE68CF5CVx4hskDKsozC', 'DnD: Evil'],
      ['4pRdDmM1OYlJ0j7TDOCiI3', 'DnD: Grimdark']
    ],
    calm: [
      ['14bqvFqpVAOteR34ANLXNp', 'DnD - Peaceful Atmosphere'],
      ['7sdVk3vZxrvvYrHDi9BrNK', 'DnD - Calm']
    ],
    tension: [
      ['0OhKwGjFeChOrtPGBdyVtL', 'DnD Intense'],
      ['11hKhHtkhfXj4cqLry3ms3', 'DnD - Battle Preparation']
    ],
    sad: [
      ['0zD8flCSvPCOV4lqbjnUCE', 'DnD Emotional'],
      ['0TKsFw6NQ57ZqhbJrjVHhM', 'Sad DnD Themes'],
      ['1Mbdl2LIOk9MvpadoBXNG8', 'Sad & Melancholic']
    ],
    victory: [
      ['43f1nm2QS6UHLm4TvktpBk', 'Triumphant Scenes'],
      ['5QvlKRARFeT2SQXVTA6zQ0', 'D&D Victory']
    ],
    funny: [
      ['0vov8lSCtTuWVxFwR6qs5j', 'DnD Antics'],
      ['3h7Z499ZxaYawJ2UMeYtlZ', '🍻 DnD']
    ],
    // M&M
    hq: [['37i9dQZF1DWWQRwui0ExPn', 'lofi beats']],
    city: [
      ['0iAeUtwINlqfjwAyQ4ykur', 'Synthwave - Night Drive'],
      ['2CiqzE8dKtmgpWAR6TbTIF', 'Blade Runner Vibes / Night Driving']
    ],
    hero: [
      ['4JdBmthvT9VSfpuDu3itVq', 'Heroic Cinematic Music'],
      ['0dQJTXwu3ZEL7ZyWI3YYQp', 'Best Epic Heroic Musics']
    ],
    chase: [
      ['37i9dQZF1DX76Wlfdnj7AP', 'Beast Mode'],
      ['1CnAtW2mIejhmERcoQN9Yx', 'Drive Soundtrack']
    ],
    villain: [
      ['4R2fMrgc2tkyKD5bwEXlDa', 'Songs that make you feel like the villain'],
      ['17V25rm8DeYNsU4YaZfYUK', 'Feel like a villain']
    ],
    tech: [
      ['3UkdZt86rkqMOFvuWrt92O', 'Cyberpunk Radar'],
      ['11WEQezlbeZ7O5k7r6A64r', 'Cyberpunk: Edgerunners']
    ],
    noir: [
      ['0Bhwoi6JTUFqjzmZoABfqP', 'Jazz Noir'],
      ['1FDVy3qAIVCiBkFV8TdRDj', 'Beat It, Toots - Noir Jazz']
    ],
    space: [['6Hui516oyyhckcM744zX8L', 'Space Sounds']],
    msad: [
      ['37i9dQZF1DX3YSRoSdA634', 'Life Sucks'],
      ['1Mbdl2LIOk9MvpadoBXNG8', 'Sad & Melancholic']
    ],
    mwin: [
      ['0dQJTXwu3ZEL7ZyWI3YYQp', 'Best Epic Heroic Musics'],
      ['43f1nm2QS6UHLm4TvktpBk', 'Triumphant Scenes']
    ]
  };
  // The three fights every scene has
  var FIGHTS = [
    ['standard', 'Standard fight', '⚔'],
    ['tough', 'Tough fight', '💪'],
    ['boss', 'Boss fight', '💀']
  ];
  // fight music for any scene…
  var FIGHT = {
    standard: [
      ['4u5owGgsXdeYchDcjvwJ3c', 'DnD - Combat: Battle'],
      ['5OfeOCp481xOMkF4qBAdlW', 'DnD Combat'],
      ['7z2A20lZolZDLxxF9RoHqq', 'Standard Combat DnD Music']
    ],
    tough: [
      ['20YH21X0z9zYbo79RV1LP9', 'DnD - Combat: Tough'],
      ['2F5ZKGK8TnUKjYioLOQELM', 'DnD - Combat: Epic'],
      ['1bbIcqTRI5oCXeXMCV8nij', 'Epic Combat']
    ],
    boss: [
      ['6oDoHB1ORtOgQZtd0lSLpS', 'DnD Boss'],
      ['70fkeaVPT2L827fdLbBWkp', 'DnD: Boss Battle'],
      ['5J22LSj5myp2fwxBVrtGab', 'High-Intensity Boss Fights']
    ]
  };
  var FIGHT_MM = {
    standard: [['2FjygbVJiTiKaTlpiyuPIn', 'Superhero music']],
    tough: [['1bbIcqTRI5oCXeXMCV8nij', 'Epic Combat']],
    boss: [['4R2fMrgc2tkyKD5bwEXlDa', 'Songs that make you feel like the villain']]
  };
  // …and the fights that fit a scene better, shown first
  var FIGHT_BY = {
    sea: {
      standard: [['2NpfgBvsELK9hKRzWGnCY5', 'DnD: Combat - Pirates']],
      tough: [['23wwFIDNQukMeGOIEIYSY3', 'Nautical Combat']]
    },
    tombs: { standard: [['2yu6oinocQbtXglQyEjtKm', 'DnD - Combat: Undead']] },
    horror: {
      standard: [['2yu6oinocQbtXglQyEjtKm', 'DnD - Combat: Undead']],
      boss: [['3QDYKaubqxQBtvoC6P5eg3', 'DnD Villains']]
    },
    evil: { boss: [['3QDYKaubqxQBtvoC6P5eg3', 'DnD Villains']] },
    jungle: { standard: [['0WNwpEkesczJMbG2ECYweA', 'DnD - Combat: Tribal']] },
    town: { tough: [['67mJqIMTiKKBwzvIwvaRWj', 'DnD: Combat - Industry Town']] },
    tavern: { standard: [['5aphGVaTdGyHHHE7TtnagV', 'DnD - Combat: Badass']] }
  };
  var PL = 'https://open.spotify.com/playlist/';
  // every scene, flat: [id, name, icon, search words]
  function scenes(cats) {
    return cats.reduce(function (out, c) {
      return out.concat(c[2]);
    }, []);
  }

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
  var asRows = function (list) {
    return (list || []).map(function (p) {
      return { u: PL + p[0], t: p[1] };
    });
  };

  root.AudioUI = function (api) {
    var esc = api.esc,
      btn = api.btn,
      ui = api.ui,
      store = api.store,
      gameFn = api.game;
    // your own playlists: lists[scene] for the ambience, lists[scene + ':' + fight] for its fights
    var A = function () {
      var a = (store.audio = store.audio || { lists: {} });
      // earlier versions kept Combat and Boss fight as moods of their own: they become fights of every scene
      if (a.lists.combat || a.lists.boss) {
        a.lists['*:standard'] = (a.lists['*:standard'] || []).concat(a.lists.combat || []);
        a.lists['*:boss'] = (a.lists['*:boss'] || []).concat(a.lists.boss || []);
        delete a.lists.combat;
        delete a.lists.boss;
      }
      return a;
    };
    var S = (ui.audio = ui.audio || { scene: 'tavern', sceneMM: 'hq', view: '', add: '', msg: '' });
    function modern() {
      return !!gameFn && gameFn() === 'mm';
    }
    function cats() {
      return modern() ? CATS_MM : CATS;
    }
    var SK = function () {
      return modern() ? 'sceneMM' : 'scene';
    };
    function curScene() {
      var all = scenes(cats());
      return (
        all.filter(function (m) {
          return m[0] === S[SK()];
        })[0] || all[0]
      );
    }
    function catOf(id) {
      return (
        cats().filter(function (c) {
          return c[2].some(function (m) {
            return m[0] === id;
          });
        })[0] || cats()[0]
      );
    }
    // what a scene offers for its ambience ('') or one of its fights
    function suggestions(id, fight) {
      if (!fight) return asRows(PICKS[id]);
      var base = modern() ? FIGHT_MM : FIGHT,
        own = ((FIGHT_BY[id] || {})[fight] || []).concat(base[fight] || []),
        seen = {};
      return asRows(
        own.reduce(function (out, p) {
          if (!seen[p[0]]) out.push(p);
          seen[p[0]] = 1;
          return out;
        }, [])
      );
    }
    function mine(id, fight) {
      var L = A().lists;
      return fight ? (L[id + ':' + fight] || []).concat(L['*:' + fight] || []) : L[id] || [];
    }

    // ---------- the player docked at the bottom ----------
    var playing = null; // { u, t } shown in the dock
    // The dock lives outside the app's page, so redrawing pages never stops the music.
    function dock() {
      var el = document.getElementById('audio-dock');
      if (!el) {
        el = document.createElement('div');
        el.id = 'audio-dock';
        el.className = 'audio-dock noprint';
        el.innerHTML =
          '<div class="audio-frame"><div id="spotify-embed"></div></div><div class="audio-dock-btns">' +
          '<button type="button" class="btn small" data-act="audSkip" title="Next song" aria-label="Next song">⏭</button>' +
          '<button type="button" class="btn small" data-act="audBig" title="Show the songs, tap one to play it" aria-label="Show the songs">≡</button>' +
          '<button type="button" class="btn small" data-act="audStop" aria-label="Close the player">✕</button></div>';
        document.body.appendChild(el);
      }
      return el;
    }
    // Spotify's iFrame API lets the app start the music itself, switch playlists without rebuilding the player and
    // skip a song. If it doesn't answer quickly (offline, blocked), the plain player is used and you tap ▶ in it.
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
    function drawDock() {
      var el = dock(),
        src = playing ? spotifyEmbed(playing.u) : '';
      document.body.classList.toggle('has-dock', !!src);
      el.classList.toggle('on', !!src);
      el.classList.toggle('big', !!S.big);
      document.body.classList.toggle('dock-big', !!src && !!S.big);
      el.classList.toggle('can-skip', !!ctl);
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
            el.classList.add('can-skip');
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
    function start(u, t) {
      playing = { u: u, t: t || '' };
      drawDock();
      toTable();
    }

    // ---------- the page ----------
    function row(x, i, mine, key) {
      var sp = !!spotifyEmbed(x.u),
        on = playing && playing.u === x.u;
      return (
        '<div class="audio-item' +
        (on ? ' on' : '') +
        '">' +
        (mine ? '<span class="tag">' + service(x.u) + '</span>' : '') +
        '<b>' +
        esc(x.t || x.u) +
        '</b><span class="spacer"></span>' +
        (sp
          ? btn(
              'audPlay',
              on ? '■ Stop' : '▶ Play here',
              { v: x.u, t: x.t || '' },
              'btn small' + (on ? '' : ' primary')
            )
          : '') +
        '<a class="btn small" href="' +
        esc(x.u) +
        '" target="_blank" rel="noopener">' +
        (sp ? 'Spotify ↗' : 'Open ↗') +
        '</a>' +
        (mine && key ? btn('audRm', '✕', { v: i, k: key }, 'btn small') : '') +
        '</div>'
      );
    }
    function html() {
      var m = curScene(),
        cat = catOf(m[0]),
        view = S.view || '',
        fight = FIGHTS.filter(function (f) {
          return f[0] === view;
        })[0],
        L = A().lists;
      var h =
        '<main class="mon-main audio-main"><h2>Audio</h2><p class="muted">Pick a scene, then ▶ Play here: the music plays in the player at the bottom and keeps going while you use the rest of the app. A fight breaks out? Tap Standard, Tough or Boss: the fight music starts at once. ⏭ skips a song, ≡ shows the songs.</p>';
      // categories, then the scenes of the open one
      if (cats().length > 1)
        h +=
          '<nav class="mm-tabs audio-cats">' +
          cats()
            .map(function (c) {
              return btn('audCat', esc(c[1]), { v: c[0] }, 'mm-tab' + (c === cat ? ' on' : ''));
            })
            .join('') +
          '</nav>';
      h +=
        '<div class="audio-moods">' +
        cat[2]
          .map(function (s) {
            var n = (L[s[0]] || []).length;
            return (
              '<button type="button" class="audio-mood' +
              (s[0] === m[0] ? ' on' : '') +
              '" data-act="audScene" data-v="' +
              s[0] +
              '">' +
              root.Icon(s[2]) +
              ' ' +
              esc(s[1]) +
              (n ? ' <small>+' + n + '</small>' : '') +
              '</button>'
            );
          })
          .join('') +
        '</div>';
      // the scene: its ambience and its three fights
      h +=
        '<div class="panel"><h3 class="ico-h">' +
        root.Icon(m[2]) +
        ' ' +
        esc(m[1]) +
        '</h3><div class="audio-fights">' +
        btn('audView', '🎵 Ambience', { v: '' }, 'btn' + (!view ? ' primary' : '')) +
        FIGHTS.map(function (f) {
          return btn(
            'audFight',
            f[2] + ' ' + f[1].replace(' fight', ''),
            { v: f[0] },
            'btn audio-fight' + (view === f[0] ? ' primary' : '')
          );
        }).join('') +
        '</div>';
      var key = view ? m[0] + ':' + view : m[0],
        sug = suggestions(m[0], view),
        own = view ? L[key] || [] : L[m[0]] || [],
        all = view ? L['*:' + view] || [] : [];
      h +=
        '<h4>' +
        (fight ? esc(fight[1]) + ' music' : 'Ambience') +
        '</h4><div class="audio-list">' +
        sug
          .map(function (x) {
            return row(x, 0, false);
          })
          .join('') +
        own
          .map(function (x, i) {
            return row(x, i, true, key);
          })
          .join('') +
        all
          .map(function (x, i) {
            return row(x, i, true, '*:' + view);
          })
          .join('') +
        '</div>';
      var sr = searches(view ? (modern() ? 'superhero ' : 'fantasy ') + view + ' battle music' : m[3]);
      h +=
        '<p class="small muted">Suggested public ' +
        (modern() ? '' : 'D&D ') +
        'playlists on Spotify. Want something else? <a href="' +
        esc(sr.spotify) +
        '" target="_blank" rel="noopener">Find more on Spotify</a> · <a href="' +
        esc(sr.qobuz) +
        '" target="_blank" rel="noopener">Find on Qobuz</a></p></div>';
      // your own playlists for what's open
      h +=
        '<div class="panel"><h3>Add your own: ' +
        esc(m[1].toLowerCase()) +
        (fight ? ', ' + esc(fight[1].toLowerCase()) : ', ambience') +
        '</h3><p class="small muted">On Spotify or Qobuz, use Share → Copy link on a playlist or album, then paste it here.</p>' +
        '<div class="row audio-add"><label class="field"><span>Paste a link</span><input type="url" id="aud-add" data-aud="add" value="' +
        esc(S.add) +
        '" placeholder="https://open.spotify.com/playlist/…"></label>' +
        '<label class="field"><span>Name <small class="muted">(optional)</small></span><input type="text" id="aud-name" data-aud="name" value="' +
        esc(S.name || '') +
        '" placeholder="e.g. Cozy tavern"></label></div>' +
        '<div class="toolbar">' +
        btn('audAdd', '+ Add', {}, 'btn') +
        (fight
          ? '<label class="small"><input type="checkbox" data-aud="every"' +
            (S.every ? ' checked' : '') +
            '> for every scene’s ' +
            esc(fight[1].toLowerCase()) +
            '</label>'
          : '') +
        (S.msg ? '<span class="small" style="color:var(--warn)">' + esc(S.msg) + '</span>' : '') +
        '</div>' +
        '<p class="small muted">Spotify plays full songs when you are logged in to Spotify in this browser, otherwise 30-second previews. Qobuz links open the Qobuz app or website. Your playlists are kept in this browser on this device.</p></div>';
      return h + '</main>';
    }
    var actions = {
      audCat: function (v) {
        var c = cats().filter(function (x) {
          return x[0] === v;
        })[0];
        if (c) S[SK()] = c[2][0][0];
        S.view = '';
        S.msg = '';
      },
      audScene: function (v) {
        S[SK()] = v;
        S.msg = '';
        // in the middle of a fight, changing scene keeps the fight going
      },
      audView: function (v) {
        S.view = v || '';
        S.msg = '';
      },
      // one tap: open the fight and start its music
      audFight: function (v) {
        S.view = v;
        S.msg = '';
        var m = curScene(),
          first = mine(m[0], v)
            .concat(suggestions(m[0], v))
            .filter(function (x) {
              return spotifyEmbed(x.u);
            })[0];
        if (first && !(playing && playing.u === first.u)) start(first.u, first.t);
      },
      audAdd: function () {
        var u = cleanUrl(S.add),
          m = curScene(),
          key = S.view ? (S.every ? '*' : m[0]) + ':' + S.view : m[0];
        if (!u) {
          S.msg = 'Paste a full link starting with https://';
          return;
        }
        var L = (A().lists[key] = A().lists[key] || []);
        if (
          L.some(function (x) {
            return x.u === u;
          })
        ) {
          S.msg = 'Already there.';
          return;
        }
        L.push({ u: u, t: String(S.name || '').trim() });
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
        start(v, el.getAttribute('data-t'));
      },
      audStop: function () {
        playing = null;
        drawDock();
        toTable();
      },
      // next song: jump to the end of this one and the playlist goes on (needs Spotify's remote control)
      audSkip: function () {
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
      audBig: function () {
        S.big = !S.big;
        drawDock(); // the page redraws after, so the round buttons move above the taller player
      }
    };
    // when the DM has the table open, the players' phones can follow the music
    function toTable() {
      var T = root.Table,
        h = T && T.hostInfo && T.hostInfo();
      if (h) T.dm(h.code, h.key, { music: playing }).catch(function () {});
    }
    // what the DM is playing, on a player's phone
    function play(m) {
      var u = m && cleanUrl(m.u);
      playing = u ? { u: u, t: String(m.t || '').slice(0, 80) } : null;
      drawDock();
    }
    function onInput(t) {
      var k = t.getAttribute('data-aud');
      if (k == null) return null;
      if (k === 'every') S.every = t.checked;
      else S[k] = t.value;
      return 'none';
    }
    return { html: html, actions: actions, onInput: onInput, after: place, play: play };
  };
  root.AudioUI.spotifyEmbed = spotifyEmbed;
  root.AudioUI.cleanUrl = cleanUrl;
  root.AudioUI.CATS = CATS;
  root.AudioUI.CATS_MM = CATS_MM;
  root.AudioUI.MOODS = scenes(CATS);
  root.AudioUI.MOODS_MM = scenes(CATS_MM);
  root.AudioUI.PICKS = PICKS;
  root.AudioUI.FIGHT = FIGHT;
  root.AudioUI.FIGHT_BY = FIGHT_BY;
})(typeof window !== 'undefined' ? window : globalThis);
