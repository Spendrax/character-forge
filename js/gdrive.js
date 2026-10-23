// Google Drive backup: the app signs in to your Google account (only you see it; the login stays in this browser)
// and keeps one file, "Character Forge backup.json", in a "Character Forge" folder of your Drive, plus a dated copy
// each day (the last 14 are kept). The app can only see the files it made itself (Google's drive.file permission),
// never the rest of your Drive.
// Signing in opens Google's page in a small window; when the window is blocked, the whole page goes there and back.
(function (root) {
  'use strict';
  // The Google Client ID of this app, from console.cloud.google.com (a public name for the app, not a secret).
  // Empty: each person pastes their own on the Backup page (for a copy of the app on another address).
  var CLIENT_ID = '374349247902-sd4inouqpatud060ov82su97gdf44b8e.apps.googleusercontent.com';
  var KEY = 'cf-gdrive', // { id, access, until, state, folder, file, day, last, pending, back }
    AUTH = 'https://accounts.google.com/o/oauth2/v2/auth',
    API = 'https://www.googleapis.com/drive/v3/files',
    UP = 'https://www.googleapis.com/upload/drive/v3/files',
    SCOPE = 'https://www.googleapis.com/auth/drive.file',
    FOLDER = 'Character Forge',
    MAIN = 'Character Forge backup.json',
    DAILY = 'Character Forge backup ',
    KEEP = 14;
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
  function set(k, v) {
    var s = get();
    s[k] = v;
    put(s);
  }
  function clientId() {
    return CLIENT_ID || get().id || '';
  }
  function redirect() {
    return location.origin + location.pathname.replace(/index\.html$/, '');
  }
  function randomText(n) {
    var a = new Uint8Array(n);
    crypto.getRandomValues(a);
    return Array.prototype.map
      .call(a, function (b) {
        return ('0' + b.toString(16)).slice(-2);
      })
      .join('')
      .slice(0, n);
  }
  function signedIn() {
    var s = get();
    return !!(s.access && Date.now() < s.until);
  }

  // ---------- signing in ----------
  var waiting = []; // what to do once the sign-in window comes back
  function connect(id, then) {
    id = String(id || clientId()).trim();
    if (!/^[\w-]+\.apps\.googleusercontent\.com$/.test(id))
      return Promise.reject(
        new Error('The Client ID ends with .apps.googleusercontent.com: copy it from Google Cloud, Credentials.')
      );
    var s = get();
    s.id = CLIENT_ID ? s.id : id;
    s.state = randomText(24);
    put(s);
    var url =
      AUTH +
      '?' +
      [
        ['client_id', id],
        ['redirect_uri', redirect()],
        ['response_type', 'token'],
        ['scope', SCOPE],
        ['include_granted_scopes', 'true'],
        ['state', s.state],
        ['prompt', s.known ? '' : 'select_account']
      ]
        .reduce(function (a, p) {
          if (p[1]) a.push(p[0] + '=' + encodeURIComponent(p[1]));
          return a;
        }, [])
        .join('&');
    return new Promise(function (ok, no) {
      waiting.push([ok, no]);
      var w = null;
      try {
        w = root.open(url, 'cf-google', 'width=480,height=640');
      } catch (e) {
        w = null;
      }
      if (!w) {
        // no small window allowed: go there with the whole page, and come back here
        set('back', then || 'backup');
        location.href = url;
      }
    });
  }
  // the sign-in window wrote the login: let whoever waits go on
  function landed() {
    var s = get(),
      list = waiting;
    waiting = [];
    list.forEach(function (w) {
      if (s.access && Date.now() < s.until) w[0]();
      else w[1](new Error(s.err || 'Google sign-in was cancelled.'));
    });
  }
  function cancel() {
    var s = get();
    delete s.state;
    put(s);
    var list = waiting;
    waiting = [];
    list.forEach(function (w) {
      w[1](new Error('Sign-in cancelled.'));
    });
  }
  root.addEventListener('storage', function (e) {
    if (e.key === KEY && waiting.length) {
      var s = get();
      if (!s.state) landed(); // the window finished (it clears the state)
    }
  });
  // back from Google's page (in the small window or the whole page): #access_token=…&state=…
  var returned = null;
  (function finish() {
    var h = location.hash.replace(/^#/, '');
    if (!/(^|&)(access_token|error)=/.test(h)) return;
    var q = new URLSearchParams(h),
      s = get();
    if (!s.state || q.get('state') !== s.state) return;
    try {
      history.replaceState(null, '', location.pathname + location.search);
    } catch (e) {
      /* ignore */
    }
    delete s.state;
    if (q.get('access_token')) {
      s.access = q.get('access_token');
      s.until = Date.now() + ((+q.get('expires_in') || 3600) - 60) * 1000;
      s.known = 1;
      delete s.err;
    } else
      s.err = q.get('error') === 'access_denied' ? 'You said no on Google’s page.' : 'Google said: ' + q.get('error');
    var back = s.back;
    delete s.back;
    put(s);
    if (!back) {
      // the small window (the whole page leaves a note in back): the page that opened it sees the change and carries on
      try {
        root.close();
      } catch (e) {
        /* stays open */
      }
      returned = { popup: true };
    } else returned = { back: back, ok: !!s.access, err: s.err };
  })();

  // ---------- talking to Drive ----------
  function call(method, url, body, type) {
    var s = get();
    if (!s.access || Date.now() >= s.until) {
      var e = new Error('Sign in to Google again.');
      e.auth = true;
      return Promise.reject(e);
    }
    var h = { Authorization: 'Bearer ' + s.access };
    if (type) h['Content-Type'] = type;
    return fetch(url, { method: method, headers: h, body: body }).then(function (r) {
      if (r.status === 401) {
        set('until', 0);
        var e = new Error('Sign in to Google again.');
        e.auth = true;
        throw e;
      }
      if (r.status === 204) return null;
      return r.text().then(function (t) {
        var j = null;
        try {
          j = t ? JSON.parse(t) : null;
        } catch (e) {
          j = t;
        }
        if (!r.ok) {
          var e = new Error((j && j.error && j.error.message) || 'Google Drive: ' + r.status);
          e.status = r.status;
          throw e;
        }
        return j;
      });
    });
  }
  function q(s) {
    return encodeURIComponent(s);
  }
  // the "Character Forge" folder: the one the app made before, else a new one
  function folder() {
    var s = get();
    var find = call(
      'GET',
      API +
        '?spaces=drive&fields=files(id)&q=' +
        q("name='" + FOLDER + "' and mimeType='application/vnd.google-apps.folder' and trashed=false")
    ).then(function (j) {
      var f = j && j.files && j.files[0];
      if (f) return f.id;
      return call(
        'POST',
        API + '?fields=id',
        JSON.stringify({ name: FOLDER, mimeType: 'application/vnd.google-apps.folder' }),
        'application/json'
      ).then(function (n) {
        return n.id;
      });
    });
    return (s.folder ? Promise.resolve(s.folder) : find).then(function (id) {
      set('folder', id);
      return id;
    });
  }
  function create(name, parent, text) {
    var b = 'cf' + randomText(16),
      body =
        '--' +
        b +
        '\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n' +
        JSON.stringify({ name: name, parents: [parent], mimeType: 'application/json' }) +
        '\r\n--' +
        b +
        '\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n' +
        text +
        '\r\n--' +
        b +
        '--';
    return call('POST', UP + '?uploadType=multipart&fields=id', body, 'multipart/related; boundary=' + b).then(
      function (j) {
        return j.id;
      }
    );
  }
  function list() {
    return folder().then(function (f) {
      return call(
        'GET',
        API +
          '?spaces=drive&orderBy=modifiedTime desc&pageSize=50&fields=files(id,name,modifiedTime,size)&q=' +
          q("'" + f + "' in parents and trashed=false")
      ).then(function (j) {
        return (j && j.files) || [];
      });
    });
  }
  function today() {
    var d = new Date();
    return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
  }
  // write the backup: the main file, and today's dated copy (keeping the last 14)
  function upload(text) {
    var s = get();
    return folder()
      .then(function (f) {
        var main = s.file
          ? call('PATCH', UP + '/' + s.file + '?uploadType=media&fields=id', text, 'application/json').then(
              function () {
                return s.file;
              },
              function (e) {
                if (e.status === 404) return create(MAIN, f, text);
                throw e;
              }
            )
          : create(MAIN, f, text);
        return main.then(function (id) {
          set('file', id);
          if (get().day === today()) return null;
          return create(DAILY + today() + '.json', f, text).then(function () {
            set('day', today());
            return prune();
          });
        });
      })
      .then(function () {
        set('last', Date.now());
        set('pending', false);
        return get().last;
      })
      .catch(function (e) {
        if (e.status === 404) {
          // the folder was deleted: start again with a new one
          var n = get();
          delete n.folder;
          delete n.file;
          delete n.day;
          put(n);
        }
        throw e;
      });
  }
  function prune() {
    return list().then(function (files) {
      var old = files
        .reduce(function (a, f) {
          if (f.name.indexOf(DAILY) === 0 && f.name !== MAIN) a.push(f);
          return a;
        }, [])
        .sort(function (a, b) {
          return a.name < b.name ? 1 : -1;
        })
        .slice(KEEP);
      return Promise.all(
        old.map(function (f) {
          return call('DELETE', API + '/' + f.id).catch(function () {});
        })
      );
    });
  }
  function download(id) {
    return call('GET', API + '/' + id + '?alt=media');
  }
  function disconnect() {
    var s = get();
    if (s.access)
      fetch('https://oauth2.googleapis.com/revoke?token=' + encodeURIComponent(s.access), {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }).catch(function () {});
    put({ id: s.id });
  }
  root.GDrive = {
    builtIn: !!CLIENT_ID,
    clientId: clientId,
    redirect: redirect,
    origin: function () {
      return location.origin;
    },
    signedIn: signedIn,
    linked: function () {
      return !!get().known;
    },
    connect: connect,
    cancel: cancel,
    waiting: function () {
      return waiting.length > 0;
    },
    returned: function () {
      var r = returned;
      returned = null;
      return r;
    },
    upload: upload,
    list: list,
    download: download,
    disconnect: disconnect,
    state: get,
    set: set,
    MAIN: MAIN
  };
})(typeof window !== 'undefined' ? window : globalThis);
