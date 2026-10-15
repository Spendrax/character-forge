// Audio: music for the table. Suggested Spotify playlists for each mood, searches on Spotify and Qobuz, your own playlists,
// and a small Spotify player docked at the bottom that keeps playing while you move around the app.
(function (root) {
  'use strict';
  // [id, name, icon (js/icons.js), search words]
  var MOODS = [
    ['tavern', 'Tavern', 'tankard', 'tavern fantasy music'], ['town', 'Town', 'house', 'medieval town ambience'],
    ['travel', 'Travel', 'signpost', 'fantasy adventure travel music'], ['forest', 'Forest', 'tree', 'enchanted forest ambience'],
    ['camp', 'Camp and rest', 'campfire', 'campfire night ambience'], ['dungeon', 'Dungeon', 'candle', 'dark dungeon ambience'],
    ['mystery', 'Mystery', 'eye', 'mystery investigation fantasy music'], ['horror', 'Horror', 'skull', 'dark horror ambience'],
    ['combat', 'Combat', 'swords', 'epic battle music'], ['boss', 'Boss fight', 'dragon', 'epic boss battle orchestral'],
    ['sea', 'Sea and pirates', 'ship', 'pirate sea shanty ambience'], ['sad', 'Sad moment', 'rain', 'sad emotional fantasy music'],
    ['victory', 'Victory', 'trophy', 'triumphant victory fantasy music'], ['magic', 'Magic and wonder', 'sparkle', 'magical fantasy ambient music']
  ];
  // Suggested Spotify playlists for each mood (public D&D playlists, checked to exist in October 2026): [playlist id, name]
  var PICKS = {
    tavern: [['2Ca3Hi7H5ASwu7jsNCIddE', 'Medieval Tavern Music'], ['2IZI0N8iQdxOdwuAVoYrZR', 'Medieval Tavern (500+ tracks)']],
    town: [['1BabADdkcNNQ9Kmnfvxj9a', 'Medieval Town'], ['3KeHeHSbWYbdLKuWyK6G0V', 'City (Lively)']],
    travel: [['19lrJbgreBfi4HlLYOsPyV', 'D&D Adventure Music'], ['3LGcymlXO40dcbLiRsFfLm', 'Adventuring Music']],
    forest: [['6WHwtLXHwxH9AEC4qo4tYX', 'Elven Forest Ambience'], ['05RgD6XFGztjwadz9yvW5H', 'Enchanted Forest']],
    camp: [['3Mj4KgXSruvhHvsllw392U', 'Resting by the Campfire'], ['5zJDcAPMAXFgFy8eRNuwbr', 'Camp / Fire']],
    dungeon: [['61r7AoxyRCmo03tIoKpPko', 'Ambient: Dungeon'], ['429Y5dm8z0On9pxh0tY9Eq', 'Creepy Dungeon Music']],
    mystery: [['3Yxt8Z4pnjQ6uFZKEK30al', 'Investigation & Mystery'], ['6eSxCnwg3fEHD0UCdXYGdL', 'Mysterious DnD Music']],
    horror: [['6cXCERlllosIgL02ewXHEs', 'Ominous Dark Fantasy'], ['1zrjG0me3fUh9N5OCtslrB', 'D&D Horror']],
    combat: [['1bbIcqTRI5oCXeXMCV8nij', 'Epic Combat'], ['4AKwlOzZZz1xw1EAD2Sd4m', 'Music for Epic Battles']],
    boss: [['5J22LSj5myp2fwxBVrtGab', 'High-Intensity Boss Fights'], ['5WnB6wpclrPltZNYBjQQ7c', 'Epic Boss Music']],
    sea: [['6wzHc9LYCHuTCvvXezlyKu', 'Sea Shanty Ambient'], ['23wwFIDNQukMeGOIEIYSY3', 'Nautical Combat']],
    sad: [['0TKsFw6NQ57ZqhbJrjVHhM', 'Sad DnD Themes'], ['1Mbdl2LIOk9MvpadoBXNG8', 'Sad & Melancholic']],
    victory: [['43f1nm2QS6UHLm4TvktpBk', 'Triumphant Scenes'], ['5QvlKRARFeT2SQXVTA6zQ0', 'D&D Victory']],
    magic: [['1yYMz2aZf9qyUcQmeiYjip', 'Feywild Ambience'], ['1WUw0WdF59lT81yPGBwWgL', 'The Feywild']]
  };
  var PL = 'https://open.spotify.com/playlist/';

  // Spotify links that can play inside the app: open.spotify.com/{playlist|album|track|episode|show|artist}/{id}
  function spotifyEmbed(u) {
    var m = String(u).match(/^https:\/\/open\.spotify\.com\/(?:intl-[a-z-]+\/)?(playlist|album|track|episode|show|artist)\/([A-Za-z0-9]+)/);
    return m ? 'https://open.spotify.com/embed/' + m[1] + '/' + m[2] : '';
  }
  function service(u) { return /spotify\.com/.test(u) ? 'Spotify' : /qobuz\.com/.test(u) ? 'Qobuz' : 'Link'; }
  // Only plain web links are kept: no javascript: or data: links from a pasted value.
  function cleanUrl(u) { u = String(u || '').trim(); try { var x = new URL(u); return x.protocol === 'https:' ? x.href : ''; } catch (e) { return ''; } }
  function searches(mood) {
    var e = encodeURIComponent(mood[3]);
    return { spotify: 'https://open.spotify.com/search/' + e + '/playlists', qobuz: 'https://www.qobuz.com/search?q=' + e };
  }

  root.AudioUI = function (api) {
    var esc = api.esc, btn = api.btn, ui = api.ui, store = api.store;
    var A = function () { return store.audio = store.audio || { lists: {} }; };
    var S = ui.audio = ui.audio || { mood: 'tavern', add: '', msg: '' };
    var playing = null; // { u, t } shown in the dock

    // The dock lives outside the app's page, so redrawing pages never stops the music.
    function dock() {
      var el = document.getElementById('audio-dock');
      if (!el) { el = document.createElement('div'); el.id = 'audio-dock'; el.className = 'audio-dock noprint'; document.body.appendChild(el); }
      return el;
    }
    // Spotify's iFrame API lets the app start the music itself and switch playlists without rebuilding the player.
    // If it can't load (offline, blocked), the plain player is used and you tap ▶ in it.
    var api = null, ctl = null, apiState = '';
    function loadApi(done) {
      if (api) return done(api);
      if (apiState === 'failed') return done(null);
      var prev = root.onSpotifyIframeApiReady;
      root.onSpotifyIframeApiReady = function (A) { api = A; apiState = 'ready'; if (prev) try { prev(A); } catch (e) { /* ignore */ } done(A); };
      if (apiState) return; apiState = 'loading';
      var sc = document.createElement('script'); sc.src = 'https://open.spotify.com/embed/iframe-api/v1'; sc.async = true;
      sc.onerror = function () { apiState = 'failed'; done(null); };
      document.head.appendChild(sc);
    }
    function uriOf(u) { var m = spotifyEmbed(u).match(/embed\/(\w+)\/(\w+)/); return m ? 'spotify:' + m[1] + ':' + m[2] : ''; }
    function drawDock() {
      var el = dock(), src = playing ? spotifyEmbed(playing.u) : '';
      document.body.classList.toggle('has-dock', !!src);
      el.classList.toggle('on', !!src);
      if (!el.firstChild) el.innerHTML = '<div class="audio-frame"><div id="spotify-embed"></div></div><button type="button" class="btn small audio-close" data-act="audStop" aria-label="Close the player">✕</button>';
      place();
      if (!src) { el.removeAttribute('data-src'); if (ctl) try { ctl.pause(); } catch (e) { /* not ready */ } return; }
      if (el.getAttribute('data-src') === src) return;
      el.setAttribute('data-src', src);
      loadApi(function (A) {
        if (!playing || spotifyEmbed(playing.u) !== src) return; // changed meanwhile
        if (A && ctl) { ctl.loadUri(uriOf(playing.u)); ctl.play(); return; }
        if (A) return A.createController(document.getElementById('spotify-embed'), { uri: uriOf(playing.u), width: '100%', height: 80 }, function (c) {
          ctl = c; c.addListener('ready', function () { c.play(); });
        });
        el.querySelector('.audio-frame').innerHTML = '<iframe title="Spotify player" src="' + esc(src) + '?utm_source=generator&theme=0" height="80" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"></iframe>';
      });
    }
    function place() { var m = document.querySelector('.mini-bar'), h = m && root.getComputedStyle(m).display !== 'none' ? m.offsetHeight : 0; dock().style.bottom = h + 'px'; }

    function row(x, i, mine) {
      var sp = !!spotifyEmbed(x.u), on = playing && playing.u === x.u;
      return '<div class="audio-item' + (on ? ' on' : '') + '">' + (mine ? '<span class="tag">' + service(x.u) + '</span>' : '') + '<b>' + esc(x.t || x.u) + '</b><span class="spacer"></span>' +
        (sp ? btn('audPlay', on ? '■ Stop' : '▶ Play here', { v: x.u, t: x.t || '' }, 'btn small' + (on ? '' : ' primary')) : '') +
        '<a class="btn small" href="' + esc(x.u) + '" target="_blank" rel="noopener">' + (sp ? 'Spotify ↗' : 'Open ↗') + '</a>' + (mine ? btn('audRm', '✕', { v: i }, 'btn small') : '') + '</div>';
    }
    function html() {
      var mood = MOODS.filter(function (m) { return m[0] === S.mood; })[0] || MOODS[0], lists = A().lists;
      var sr = searches(mood), mine = lists[mood[0]] || [], picks = (PICKS[mood[0]] || []).map(function (p) { return { u: PL + p[0], t: p[1] }; });
      var h = '<main class="mon-main audio-main"><h2>Audio</h2><p class="muted">Pick a mood, then ▶ Play here: the music starts in the player at the bottom and keeps going while you use the rest of the app. Switching playlists starts the new one right away.</p>';
      h += '<div class="audio-moods">' + MOODS.map(function (m) {
        var n = (lists[m[0]] || []).length;
        return '<button type="button" class="audio-mood' + (m[0] === mood[0] ? ' on' : '') + '" data-act="audMood" data-v="' + m[0] + '">' + root.Icon(m[2]) + ' ' + esc(m[1]) + (n ? ' <small>+' + n + '</small>' : '') + '</button>';
      }).join('') + '</div>';
      h += '<div class="panel"><h3 class="ico-h">' + root.Icon(mood[2]) + ' ' + esc(mood[1]) + '</h3><div class="audio-list">' + picks.map(function (x) { return row(x, 0, false); }).join('') + '</div>' +
        '<p class="small muted">Suggested public D&D playlists on Spotify. Want something else? ' +
        '<a href="' + esc(sr.spotify) + '" target="_blank" rel="noopener">Find more on Spotify</a> · <a href="' + esc(sr.qobuz) + '" target="_blank" rel="noopener">Find on Qobuz</a></p></div>';
      h += '<div class="panel"><h3>My ' + esc(mood[1].toLowerCase()) + ' playlists</h3>';
      if (!mine.length) h += '<p class="small muted">None yet. On Spotify or Qobuz, use Share → Copy link on a playlist or album, then paste it here.</p>';
      else h += '<div class="audio-list">' + mine.map(function (x, i) { return row(x, i, true); }).join('') + '</div>';
      h += '<div class="row audio-add"><label class="field"><span>Paste a link</span><input type="url" id="aud-add" data-aud="add" value="' + esc(S.add) + '" placeholder="https://open.spotify.com/playlist/…"></label>' +
        '<label class="field"><span>Name <small class="muted">(optional)</small></span><input type="text" id="aud-name" data-aud="name" value="' + esc(S.name || '') + '" placeholder="e.g. Cozy tavern"></label></div>' +
        '<div class="toolbar">' + btn('audAdd', '+ Add to ' + esc(mood[1]), {}, 'btn') + (S.msg ? '<span class="small" style="color:var(--warn)">' + esc(S.msg) + '</span>' : '') + '</div>';
      h += '<p class="small muted">Spotify plays full songs when you are logged in to Spotify in this browser, otherwise 30-second previews. Qobuz links open the Qobuz app or website. Your playlists are kept in this browser on this device.</p></div>';
      return h + '</main>';
    }
    var actions = {
      audMood: function (v) { S.mood = v; S.msg = ''; },
      audAdd: function () {
        var u = cleanUrl(S.add); if (!u) { S.msg = 'Paste a full link starting with https://'; return; }
        var L = A().lists[S.mood] = A().lists[S.mood] || [];
        if (L.some(function (x) { return x.u === u; })) { S.msg = 'Already in this mood.'; return; }
        L.push({ u: u, t: String(S.name || '').trim() }); S.add = ''; S.name = ''; S.msg = '';
      },
      audRm: function (v) { var L = A().lists[S.mood] || [], x = L[+v]; if (x && playing && playing.u === x.u) { playing = null; drawDock(); } L.splice(+v, 1); },
      audPlay: function (v, el) { playing = playing && playing.u === v ? null : { u: v, t: el.getAttribute('data-t') }; drawDock(); },
      audStop: function () { playing = null; drawDock(); }
    };
    function onInput(t) { var k = t.getAttribute('data-aud'); if (k == null) return null; S[k] = t.value; return 'none'; }
    return { html: html, actions: actions, onInput: onInput, after: place };
  };
  root.AudioUI.spotifyEmbed = spotifyEmbed;
  root.AudioUI.cleanUrl = cleanUrl;
  root.AudioUI.MOODS = MOODS;
  root.AudioUI.PICKS = PICKS;
})(typeof window !== 'undefined' ? window : globalThis);
