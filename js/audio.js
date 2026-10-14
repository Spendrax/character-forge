// Audio: music for the table. Moods with Spotify and Qobuz searches, your own playlists for each mood,
// and a small Spotify player docked at the bottom that keeps playing while you move around the app.
(function (root) {
  'use strict';
  // [id, name, icon, search words]
  var MOODS = [
    ['tavern', 'Tavern', '🍺', 'tavern fantasy music'], ['town', 'Town', '🏘️', 'medieval town ambience'],
    ['travel', 'Travel', '🐎', 'fantasy adventure travel music'], ['forest', 'Forest', '🌲', 'enchanted forest ambience'],
    ['camp', 'Camp and rest', '🔥', 'campfire night ambience'], ['dungeon', 'Dungeon', '🕯️', 'dark dungeon ambience'],
    ['mystery', 'Mystery', '🔍', 'mystery investigation fantasy music'], ['horror', 'Horror', '👻', 'dark horror ambience'],
    ['combat', 'Combat', '⚔️', 'epic battle music'], ['boss', 'Boss fight', '🐉', 'epic boss battle orchestral'],
    ['sea', 'Sea and pirates', '🌊', 'pirate sea shanty ambience'], ['sad', 'Sad moment', '🌧️', 'sad emotional fantasy music'],
    ['victory', 'Victory', '🏆', 'triumphant victory fantasy music'], ['magic', 'Magic and wonder', '✨', 'magical fantasy ambient music']
  ];
  // [id, name, words added to the search]
  var STYLES = [['', 'Any style', ''], ['orch', 'Orchestral', 'orchestral'], ['folk', 'Celtic and folk', 'celtic folk'], ['amb', 'Ambience only', 'ambience sounds no music'],
    ['game', 'Video game', 'video game soundtrack'], ['dark', 'Dark ambient', 'dark ambient'], ['synth', 'Synth', 'synthwave']];

  // Spotify links that can play inside the app: open.spotify.com/{playlist|album|track|episode|show|artist}/{id}
  function spotifyEmbed(u) {
    var m = String(u).match(/^https:\/\/open\.spotify\.com\/(?:intl-[a-z-]+\/)?(playlist|album|track|episode|show|artist)\/([A-Za-z0-9]+)/);
    return m ? 'https://open.spotify.com/embed/' + m[1] + '/' + m[2] : '';
  }
  function service(u) { return /spotify\.com/.test(u) ? 'Spotify' : /qobuz\.com/.test(u) ? 'Qobuz' : 'Link'; }
  // Only plain web links are kept: no javascript: or data: links from a pasted value.
  function cleanUrl(u) { u = String(u || '').trim(); try { var x = new URL(u); return x.protocol === 'https:' ? x.href : ''; } catch (e) { return ''; } }
  function searches(mood, style, extra) {
    var q = [extra || (mood ? mood[3] : ''), style ? style[2] : ''].filter(Boolean).join(' ').trim(), e = encodeURIComponent(q);
    return { q: q, spotify: 'https://open.spotify.com/search/' + e + '/playlists', qobuz: 'https://www.qobuz.com/search?q=' + e };
  }

  root.AudioUI = function (api) {
    var esc = api.esc, btn = api.btn, ui = api.ui, store = api.store;
    var A = function () { return store.audio = store.audio || { lists: {} }; };
    var S = ui.audio = ui.audio || { mood: 'tavern', style: '', q: '', add: '', msg: '' };
    var playing = null; // { u, t } shown in the dock

    // The dock lives outside the app's page, so redrawing pages never stops the music.
    function dock() {
      var el = document.getElementById('audio-dock');
      if (!el) { el = document.createElement('div'); el.id = 'audio-dock'; el.className = 'audio-dock noprint'; document.body.appendChild(el); }
      return el;
    }
    function drawDock() {
      var el = dock(), src = playing ? spotifyEmbed(playing.u) : '';
      if (el.getAttribute('data-src') === src) return place();
      el.setAttribute('data-src', src);
      el.innerHTML = src ? '<iframe title="Spotify player" src="' + esc(src) + '?utm_source=generator&theme=0" height="80" loading="lazy" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"></iframe>' +
        '<button type="button" class="btn small audio-close" data-act="audStop" aria-label="Close the player">✕</button>' : '';
      document.body.classList.toggle('has-dock', !!src);
      place();
    }
    function place() { var m = document.querySelector('.mini-bar'), h = m && root.getComputedStyle(m).display !== 'none' ? m.offsetHeight : 0; dock().style.bottom = h + 'px'; }

    function html() {
      var mood = MOODS.filter(function (m) { return m[0] === S.mood; })[0] || MOODS[0], style = STYLES.filter(function (s) { return s[0] === S.style; })[0], lists = A().lists;
      var sr = searches(mood, style, S.q.trim()), mine = lists[mood[0]] || [];
      var h = '<main class="mon-main audio-main"><h2>Audio</h2><p class="muted">Music for the table. Pick a mood, open a search on Spotify or Qobuz, and keep the playlists you like here. Spotify plays in a small player at the bottom that keeps going while you use the rest of the app.</p>';
      h += '<div class="audio-moods">' + MOODS.map(function (m) {
        var n = (lists[m[0]] || []).length;
        return '<button type="button" class="audio-mood' + (m[0] === mood[0] ? ' on' : '') + '" data-act="audMood" data-v="' + m[0] + '"><span aria-hidden="true">' + m[2] + '</span> ' + esc(m[1]) + (n ? ' <small>' + n + '</small>' : '') + '</button>';
      }).join('') + '</div>';
      h += '<div class="panel"><h3>' + mood[2] + ' ' + esc(mood[1]) + '</h3>' +
        '<p class="small" style="margin:.2rem 0 .4rem"><b>Style</b></p><div class="pills">' + STYLES.map(function (s) { return btn('audStyle', esc(s[1]), { v: s[0] }, 'pill small' + (S.style === s[0] ? ' on' : '')); }).join('') + '</div>' +
        '<label class="field"><span>Search words <small class="muted">(leave empty for the mood’s own)</small></span><input type="search" id="aud-q" data-aud="q" value="' + esc(S.q) + '" placeholder="' + esc(mood[3]) + '"></label>' +
        '<div class="toolbar"><a class="btn primary" href="' + esc(sr.spotify) + '" target="_blank" rel="noopener">Find on Spotify</a><a class="btn" href="' + esc(sr.qobuz) + '" target="_blank" rel="noopener">Find on Qobuz</a></div>' +
        '<p class="small muted">Searching for “' + esc(sr.q) + '”. Spotify shows playlists; Qobuz shows albums (soundtracks work well).</p></div>';
      h += '<div class="panel"><h3>My ' + esc(mood[1].toLowerCase()) + ' playlists</h3>';
      if (!mine.length) h += '<p class="small muted">None yet. On Spotify or Qobuz, use Share → Copy link on a playlist or album, then paste it here.</p>';
      else h += '<div class="audio-list">' + mine.map(function (x, i) {
        var sp = !!spotifyEmbed(x.u), on = playing && playing.u === x.u;
        return '<div class="audio-item' + (on ? ' on' : '') + '"><span class="tag">' + service(x.u) + '</span><b>' + esc(x.t || x.u) + '</b><span class="spacer"></span>' +
          (sp ? btn('audPlay', on ? '■ Stop' : '▶ Play here', { v: i }, 'btn small' + (on ? '' : ' primary')) : '') +
          '<a class="btn small" href="' + esc(x.u) + '" target="_blank" rel="noopener">Open ↗</a>' + btn('audRm', '✕', { v: i }, 'btn small') + '</div>';
      }).join('') + '</div>';
      h += '<div class="row audio-add"><label class="field"><span>Paste a link</span><input type="url" id="aud-add" data-aud="add" value="' + esc(S.add) + '" placeholder="https://open.spotify.com/playlist/…"></label>' +
        '<label class="field"><span>Name <small class="muted">(optional)</small></span><input type="text" id="aud-name" data-aud="name" value="' + esc(S.name || '') + '" placeholder="e.g. Cozy tavern"></label></div>' +
        '<div class="toolbar">' + btn('audAdd', '+ Add to ' + esc(mood[1]), {}, 'btn') + (S.msg ? '<span class="small" style="color:var(--warn)">' + esc(S.msg) + '</span>' : '') + '</div>';
      h += '<p class="small muted">Spotify plays full songs when you are logged in to Spotify in this browser, otherwise 30-second previews. Qobuz links open the Qobuz app or website. Your playlists are kept in this browser on this device.</p></div>';
      return h + '</main>';
    }
    var actions = {
      audMood: function (v) { S.mood = v; S.q = ''; S.msg = ''; },
      audStyle: function (v) { S.style = v; },
      audAdd: function () {
        var u = cleanUrl(S.add); if (!u) { S.msg = 'Paste a full link starting with https://'; return; }
        var L = A().lists[S.mood] = A().lists[S.mood] || [];
        if (L.some(function (x) { return x.u === u; })) { S.msg = 'Already in this mood.'; return; }
        L.push({ u: u, t: String(S.name || '').trim() }); S.add = ''; S.name = ''; S.msg = '';
      },
      audRm: function (v) { var L = A().lists[S.mood] || [], x = L[+v]; if (x && playing && playing.u === x.u) { playing = null; drawDock(); } L.splice(+v, 1); },
      audPlay: function (v) { var x = (A().lists[S.mood] || [])[+v]; playing = x && !(playing && playing.u === x.u) ? x : null; drawDock(); },
      audStop: function () { playing = null; drawDock(); }
    };
    function onInput(t) { var k = t.getAttribute('data-aud'); if (k == null) return null; S[k] = t.value; return k === 'q' ? 'render' : 'none'; }
    return { html: html, actions: actions, onInput: onInput, after: place };
  };
  root.AudioUI.spotifyEmbed = spotifyEmbed;
  root.AudioUI.cleanUrl = cleanUrl;
  root.AudioUI.MOODS = MOODS;
})(typeof window !== 'undefined' ? window : globalThis);
