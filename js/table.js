// The table: players' phones and the DM's Encounters page share initiative directly, phone to phone (WebRTC,
// through the free PeerJS service to find each other). Works from the normal app, on any network, no install.
// The DM's device holds the table; players connect to it with a 4-digit code.
(function (root) {
  'use strict';
  var PREFIX = 'charforge-table-', HOSTKEY = 'cf-table-host';
  var lib = null;
  function loadLib() {
    if (root.Peer) return Promise.resolve();
    return lib = lib || new Promise(function (ok, no) { var s = document.createElement('script'); s.src = 'js/vendor/peerjs.min.js'; s.onload = ok; s.onerror = function () { lib = null; no(new Error('Couldn’t load the table (offline?).')); }; document.head.appendChild(s); });
  }
  function rnd(n) { var a = new Uint8Array(n); crypto.getRandomValues(a); return Array.prototype.map.call(a, function (b) { return ('0' + b.toString(16)).slice(-2); }).join(''); }
  function pub(s) { return { code: s.code, v: s.v, open: s.open, round: s.round, turn: s.turn, players: s.players.map(function (p) { return { id: p.id, name: p.name, init: p.init, bonus: p.bonus, gifts: p.gifts || [] }; }) }; }

  // ---------- the DM's side: host ----------
  var host = null; // { peer, state, conns: [], key, cb }
  function saveHost() { try { localStorage.setItem(HOSTKEY, JSON.stringify({ code: host.state.code, key: host.key, state: host.state })); } catch (e) { /* storage blocked */ } }
  function broadcast() { host.state.v++; saveHost(); var msg = { t: 'state', state: pub(host.state) }; host.conns.forEach(function (c) { if (c.open) try { c.send(msg); } catch (e) { /* gone */ } }); if (host.cb) host.cb(pub(host.state)); }
  function onHostConn(conn) {
    host.conns.push(conn);
    conn.on('open', function () { conn.send({ t: 'state', state: pub(host.state) }); });
    conn.on('close', function () { host && (host.conns = host.conns.filter(function (c) { return c !== conn; })); });
    conn.on('data', function (m) {
      if (!host || !m || typeof m !== 'object') return;
      var s = host.state, str = function (x, n) { return String(x == null ? '' : x).slice(0, n); }, num = function (x, lo, hi) { return Math.max(lo, Math.min(hi, Math.round(+x) || 0)); };
      if (m.t === 'join') {
        if (s.players.length >= 16) return conn.send({ t: 'error', error: 'The table is full.' });
        var p = { id: rnd(4), token: rnd(12), name: str(m.name, 40) || 'Player', bonus: num(m.bonus, -10, 30), init: null };
        s.players.push(p); conn.send({ t: 'joined', id: p.id, token: p.token }); broadcast();
      } else if (m.t === 'roll') {
        var q = s.players.filter(function (x) { return x.id === m.id && x.token === m.token; })[0];
        if (!q) return conn.send({ t: 'error', error: 'Join the table again.', gone: true });
        q.init = m.init == null ? null : num(m.init, -20, 60); broadcast();
      } else if (m.t === 'gotGift') { // the player took (or refused) something the DM sent
        var r = s.players.filter(function (x) { return x.id === m.id && x.token === m.token; })[0];
        if (r) { r.gifts = (r.gifts || []).filter(function (g) { return g.gid !== m.gid; }); broadcast(); }
      }
    });
  }
  function startHost(code, key, state) {
    return loadLib().then(function () {
      return new Promise(function (ok, no) {
        var peer = new root.Peer(PREFIX + code, root.TABLE_PEER_OPTS);
        peer.on('open', function () { host = { peer: peer, state: state, conns: [], key: key, cb: host && host.cb }; peer.on('connection', onHostConn); saveHost(); ok(); });
        peer.on('error', function (e) { if (!host || host.peer !== peer) { peer.destroy(); no(e); } });
        peer.on('disconnected', function () { try { peer.reconnect(); } catch (e) { /* closed */ } });
      });
    });
  }
  function hosted() { try { return JSON.parse(localStorage.getItem(HOSTKEY) || 'null'); } catch (e) { return null; } }

  // ---------- the player's side ----------
  var guest = null; // { code, peer, conn, cb, state, wait }
  function connectGuest(code) {
    if (guest && guest.code === code && guest.conn) return Promise.resolve(guest);
    if (guest) try { guest.peer.destroy(); } catch (e) { /* ignore */ }
    var g = guest = { code: code, peer: null, conn: null, cb: guest && guest.code === code ? guest.cb : null, state: null, wait: [] };
    return loadLib().then(function () {
      return new Promise(function (ok0, no0) {
        // never wait forever: if the phones can't reach each other, say so
        var done = false, ok = function (x) { if (!done) { done = true; clearTimeout(tm); ok0(x); } }, no = function (e) { if (!done) { done = true; clearTimeout(tm); try { peer.destroy(); } catch (x) { /* ignore */ } if (guest === g) guest = null; no0(e); } };
        var tm = setTimeout(function () { no(new Error(g.step === 'open' ? 'Found the table but couldn’t connect to the DM’s device. Try the same Wi-Fi as the DM, or turn off a VPN or data saver, then Join again.' : 'Couldn’t reach the connection service. Check the internet connection, then Join again.')); }, 20000);
        var peer = g.peer = new root.Peer(root.TABLE_PEER_OPTS);
        peer.on('error', function (e) { no(e.type === 'peer-unavailable' ? new Error('No table with that code. Check the number with your DM (their Encounters page must stay open).') : new Error('Couldn’t connect (' + (e.type || e.message) + ').')); });
        peer.on('open', function () {
          g.step = 'open';
          var conn = peer.connect(PREFIX + code, { reliable: true });
          conn.on('open', function () { g.conn = conn; ok(g); });
          conn.on('data', function (m) {
            if (!m) return;
            if (m.t === 'state') { g.state = m.state; if (g.cb) g.cb(m.state); var w = g.wait; g.wait = []; w.forEach(function (f) { f(m.state); }); }
            else if (m.t === 'joined' && g.onJoined) g.onJoined(m);
            else if (m.t === 'error' && g.onError) g.onError(new Error(m.error));
            else if (m.t === 'closed' && g.cb) g.cb(null, new Error('No table'));
          });
          conn.on('close', function () { if (guest !== g) return; g.conn = null; var retry = function () { if (guest && guest.code === code && !guest.conn) connectGuest(code).catch(function () { setTimeout(retry, 5000); }); }; setTimeout(retry, 3000); });
        });
      });
    });
  }
  function send(code, msg) { return connectGuest(code).then(function (g) { g.conn.send(msg); return g; }); }

  root.Table = {
    ping: function () { return Promise.resolve(root.RTCPeerConnection ? { ok: true, lan: [] } : null); },
    create: function () {
      var tryOne = function (n) {
        var code = String(1000 + Math.floor(Math.random() * 9000)), key = rnd(16);
        return startHost(code, key, { code: code, v: 1, open: false, round: 0, turn: '', players: [] }).then(function () { return { code: code, key: key, lan: [] }; },
          function (e) { if (e && e.type === 'unavailable-id' && n < 6) return tryOne(n + 1); throw new Error(e && e.type === 'network' || e && e.type === 'server-error' ? 'Couldn’t reach the connection service. Check the internet connection.' : (e && e.message) || 'Couldn’t open the table.'); });
      };
      return tryOne(0);
    },
    join: function (code, name, bonus) {
      return connectGuest(code).then(function (g) {
        return new Promise(function (ok, no) {
          g.onJoined = function (m) { g.onJoined = null; ok({ id: m.id, token: m.token, state: g.state }); };
          g.onError = function (e) { g.onError = null; no(e); };
          setTimeout(function () { if (g.onJoined) { g.onJoined = null; no(new Error('The DM’s device didn’t answer. Is their Encounters page still open?')); } }, 15000);
          g.conn.send({ t: 'join', name: name, bonus: bonus });
        });
      });
    },
    ackGift: function (code, id, token, gid) { return send(code, { t: 'gotGift', id: id, token: token, gid: gid }); },
    // the table this device is running as DM, if any (for the Treasures page)
    hostInfo: function () { if (host) return { code: host.state.code, key: host.key, state: pub(host.state) }; var h = hosted(); return h ? { code: h.code, key: h.key, state: pub(h.state) } : null; },
    roll: function (code, id, token, init) { return send(code, { t: 'roll', id: id, token: token, init: init }).then(function (g) { return new Promise(function (ok) { g.wait.push(ok); }); }); },
    dm: function (code, key, what) {
      var go = function () {
        if (!host || host.state.code !== code || host.key !== key) throw new Error('Not the DM.');
        var s = host.state;
        if ('open' in what) { s.open = !!what.open; if (s.open && what.reset) s.players.forEach(function (p) { p.init = null; }); }
        if ('round' in what) s.round = +what.round || 0;
        if ('turn' in what) s.turn = String(what.turn || '').slice(0, 60);
        if (what.kick) s.players = s.players.filter(function (p) { return p.id !== what.kick; });
        if (what.gift) { var to = s.players.filter(function (p) { return p.id === what.gift.to; })[0]; if (to) { to.gifts = (to.gifts || []).concat([{ gid: rnd(4), coins: what.gift.coins || {}, items: (what.gift.items || []).slice(0, 20), from: String(what.gift.from || '').slice(0, 80) }]).slice(-20); } }
        if (what.close) { host.conns.forEach(function (c) { try { c.send({ t: 'closed' }); } catch (e) { /* gone */ } }); var pe = host.peer; host = null; try { localStorage.removeItem(HOSTKEY); } catch (e) { /* ignore */ } setTimeout(function () { pe.destroy(); }, 300); return { ok: true }; }
        broadcast(); return pub(s);
      };
      if (host && host.state.code === code) return Promise.resolve().then(go);
      var h = hosted(); if (h && h.code === code && h.key === key) return startHost(code, key, h.state).then(go);
      return Promise.reject(new Error('Not the DM.'));
    },
    // follow a table: the DM's own (re-opened after a reload) or one joined as a player
    watch: function (code, cb) {
      var h = hosted();
      if (h && h.code === code) {
        if (host && host.state.code === code) { host.cb = cb; return; }
        if (root.Table._starting === code) return; root.Table._starting = code;
        startHost(code, h.key, h.state).then(function () { root.Table._starting = ''; host.cb = cb; cb(pub(host.state)); }, function () { root.Table._starting = ''; cb(null, new Error('No table')); });
        return;
      }
      if (guest && guest.code === code) { guest.cb = cb; return; }
      connectGuest(code).then(function (g) { g.cb = cb; }, function () { cb(null, new Error('No table')); });
    },
    stop: function () { if (guest) { try { guest.peer.destroy(); } catch (e) { /* ignore */ } guest = null; } }
  };
})(typeof window !== 'undefined' ? window : globalThis);
