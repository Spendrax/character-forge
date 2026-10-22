// Spotify remote control: with a Spotify Premium account, the app tells your Spotify (the app on your phone or
// computer) what to play, so whole songs play, with real previous / next. Uses Spotify's Web API with the PKCE
// login (no secret): you make a free "app" once on developer.spotify.com and paste its Client ID here.
// Everything (Client ID and login) stays in this browser; nothing goes anywhere but Spotify.
(function (root) {
  'use strict';
  var KEY = 'cf-spotify', // { id, access, refresh, until, device }
    AUTH = 'https://accounts.spotify.com/authorize',
    TOKEN = 'https://accounts.spotify.com/api/token',
    API = 'https://api.spotify.com/v1/me/player',
    SCOPES = 'user-read-playback-state user-modify-playback-state user-read-currently-playing';
  function get() {
    try {
      return JSON.parse(localStorage.getItem(KEY) || '{}');
    } catch (e) {
      return {};
    }
  }
  function put(s) {
    try {
      localStorage.setItem(KEY, JSON.stringify(s));
    } catch (e) {
      /* storage blocked */
    }
  }
  // the address Spotify sends you back to: this page, without anything after it
  function redirect() {
    return location.origin + location.pathname.replace(/index\.html$/, '');
  }
  function b64url(bytes) {
    return btoa(String.fromCharCode.apply(null, new Uint8Array(bytes)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }
  function randomText(n) {
    var a = new Uint8Array(n);
    crypto.getRandomValues(a);
    return b64url(a).slice(0, n);
  }
  function form(o) {
    return Object.keys(o)
      .map(function (k) {
        return encodeURIComponent(k) + '=' + encodeURIComponent(o[k]);
      })
      .join('&');
  }
  function saveTokens(s, j) {
    s.access = j.access_token;
    if (j.refresh_token) s.refresh = j.refresh_token;
    s.until = Date.now() + ((+j.expires_in || 3600) - 60) * 1000;
    put(s);
  }

  // ---------- logging in ----------
  // step 1: off to Spotify's login page, with a one-time secret kept here (PKCE)
  function connect(clientId) {
    var id = String(clientId || '').trim();
    if (!/^[0-9a-f]{32}$/i.test(id))
      return Promise.reject(
        new Error('The Client ID is 32 letters and numbers: copy it from your app’s Settings on developer.spotify.com.')
      );
    if (!root.crypto || !crypto.subtle)
      return Promise.reject(new Error('This page must be opened over https to connect Spotify.'));
    var verifier = randomText(64),
      state = randomText(16),
      s = get();
    s.id = id;
    s.verifier = verifier;
    s.state = state;
    put(s);
    return crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier)).then(function (h) {
      location.href =
        AUTH +
        '?' +
        form({
          response_type: 'code',
          client_id: id,
          scope: SCOPES,
          code_challenge_method: 'S256',
          code_challenge: b64url(h),
          redirect_uri: redirect(),
          state: state
        });
    });
  }
  // step 2: back from Spotify with ?code=… : swap it for the login, then tidy the address
  function finishLogin() {
    var q = new URLSearchParams(location.search),
      code = q.get('code'),
      err = q.get('error'),
      s = get();
    if (!q.get('state') || q.get('state') !== s.state) return Promise.resolve(null);
    try {
      history.replaceState(null, '', location.pathname + location.hash);
    } catch (e) {
      /* ignore */
    }
    if (err)
      return Promise.resolve({
        error: err === 'access_denied' ? 'You said no on Spotify’s page.' : 'Spotify said: ' + err
      });
    return fetch(TOKEN, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirect(),
        client_id: s.id,
        code_verifier: s.verifier
      })
    })
      .then(function (r) {
        return r.json().then(function (j) {
          if (!r.ok) throw new Error(j.error_description || j.error || 'Spotify refused the login.');
          return j;
        });
      })
      .then(
        function (j) {
          delete s.verifier;
          delete s.state;
          saveTokens(s, j);
          return { ok: true };
        },
        function (e) {
          return { error: e.message };
        }
      );
  }
  function token() {
    var s = get();
    if (!s.access) return Promise.reject(new Error('Not connected to Spotify.'));
    if (Date.now() < s.until) return Promise.resolve(s.access);
    return fetch(TOKEN, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form({ grant_type: 'refresh_token', refresh_token: s.refresh, client_id: s.id })
    }).then(function (r) {
      return r.json().then(function (j) {
        if (!r.ok) {
          disconnect();
          throw new Error('The Spotify login ran out: connect again.');
        }
        saveTokens(s, j);
        return s.access;
      });
    });
  }
  function disconnect() {
    var s = get();
    put({ id: s.id });
  }

  // ---------- telling Spotify what to do ----------
  function call(method, path, body, again) {
    return token().then(function (t) {
      return fetch(API + path, {
        method: method,
        headers: Object.assign({ Authorization: 'Bearer ' + t }, body ? { 'Content-Type': 'application/json' } : {}),
        body: body ? JSON.stringify(body) : undefined
      }).then(function (r) {
        if (r.status === 401 && !again) {
          var s = get();
          s.until = 0;
          put(s);
          return call(method, path, body, true);
        }
        if (r.status === 204 || r.status === 202) return null;
        return r.text().then(function (txt) {
          var j = null;
          try {
            j = txt ? JSON.parse(txt) : null;
          } catch (e) {
            /* not JSON */
          }
          if (r.ok) return j;
          var reason = (j && j.error && (j.error.reason || j.error.message)) || '';
          var e = new Error(
            r.status === 403 || /PREMIUM/.test(reason)
              ? 'Spotify only lets apps control music on Premium accounts.'
              : r.status === 404 || /NO_ACTIVE_DEVICE/.test(reason)
                ? 'No Spotify open: open the Spotify app on your phone or computer, then try again.'
                : r.status === 429
                  ? 'Too many taps for Spotify: wait a few seconds.'
                  : 'Spotify: ' + (reason || r.status)
          );
          e.status = r.status;
          throw e;
        });
      });
    });
  }
  function devices() {
    return call('GET', '/devices').then(function (j) {
      return (j && j.devices) || [];
    });
  }
  // the device to play on: the one you chose, else the one playing, else the first one
  function device() {
    var want = get().device;
    return devices().then(function (list) {
      var d =
        list.filter(function (x) {
          return x.id === want;
        })[0] ||
        list.filter(function (x) {
          return x.is_active;
        })[0] ||
        list[0];
      if (!d) throw new Error('No Spotify open: open the Spotify app on your phone or computer, then try again.');
      return d;
    });
  }
  // a playlist (or album) from its open.spotify.com link, shuffled like DnDify
  function play(url) {
    var m = String(url).match(/open\.spotify\.com\/(?:intl-[a-z-]+\/)?(playlist|album|artist|show)\/([A-Za-z0-9]+)/),
      tr = String(url).match(/open\.spotify\.com\/(?:intl-[a-z-]+\/)?track\/([A-Za-z0-9]+)/);
    if (!m && !tr) return Promise.reject(new Error('Only Spotify links can play through Spotify.'));
    return device().then(function (d) {
      var body = m ? { context_uri: 'spotify:' + m[1] + ':' + m[2] } : { uris: ['spotify:track:' + tr[1]] };
      return call('PUT', '/shuffle?state=true&device_id=' + d.id)
        .catch(function () {})
        .then(function () {
          return call('PUT', '/play?device_id=' + d.id, body);
        })
        .then(function () {
          return d;
        });
    });
  }
  root.SpotifyRemote = {
    connected: function () {
      return !!get().access;
    },
    clientId: function () {
      return get().id || '';
    },
    redirect: redirect,
    connect: connect,
    finishLogin: finishLogin,
    disconnect: disconnect,
    devices: devices,
    setDevice: function (id) {
      var s = get();
      s.device = id;
      put(s);
    },
    device: function () {
      return get().device || '';
    },
    play: play,
    pause: function () {
      return call('PUT', '/pause');
    },
    resume: function () {
      return call('PUT', '/play');
    },
    next: function () {
      return call('POST', '/next');
    },
    previous: function () {
      return call('POST', '/previous');
    },
    // what is playing now: { song, artist, playing }
    now: function () {
      return call('GET', '/currently-playing').then(function (j) {
        var it = j && j.item;
        return it
          ? {
              song: it.name,
              artist: (it.artists || [])
                .map(function (a) {
                  return a.name;
                })
                .join(', '),
              playing: !!j.is_playing
            }
          : null;
      });
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
