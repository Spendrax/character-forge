// The table: players' phones and the DM's Encounters page share initiative through the app's own server
// (node server.js on the DM's computer, same Wi-Fi). Nothing leaves that computer.
(function (root) {
  'use strict';
  function call(path, body) {
    return fetch('api/table' + path, body ? { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) } : {})
      .then(function (r) { return r.json().then(function (j) { if (!r.ok) throw new Error(j.error || ('HTTP ' + r.status)); return j; }); });
  }
  var pinged = null;
  var watch = { code: '', timer: null, v: 0, cb: null };
  root.Table = {
    // is the app served by its own server? (GitHub Pages has no /api)
    ping: function () { return pinged = pinged || call('').then(function (j) { return j && j.ok ? j : null; }, function () { return null; }); },
    create: function () { return call('', {}); },
    get: function (code) { return call('/' + code); },
    join: function (code, name, bonus) { return call('/' + code + '/join', { name: name, bonus: bonus }); },
    roll: function (code, id, token, init) { return call('/' + code + '/roll', { id: id, token: token, init: init }); },
    dm: function (code, key, what) { return call('/' + code + '/dm', Object.assign({ key: key }, what)); },
    // check every 2 seconds; cb(state) only when something changed (cb(null, error) if the table is gone)
    watch: function (code, cb) {
      if (watch.code === code && watch.timer) { watch.cb = cb; return; }
      root.Table.stop(); watch.code = code; watch.cb = cb; watch.v = 0;
      var tick = function () { if (document.hidden) return; call('/' + code).then(function (s) { if (s.v !== watch.v) { watch.v = s.v; watch.cb(s); } }, function (e) { if (/No table/.test(e.message)) { root.Table.stop(); watch.cb(null, e); } }); };
      tick(); watch.timer = setInterval(tick, 2000);
    },
    stop: function () { if (watch.timer) clearInterval(watch.timer); watch.timer = null; watch.code = ''; }
  };
})(typeof window !== 'undefined' ? window : globalThis);
