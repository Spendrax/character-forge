// The table: players' phones and the DM's device talk directly, phone to phone (WebRTC, through the free PeerJS
// service to find each other). Works from the normal app, on any network, no install.
// The DM's device holds the table; players connect to it with a 4-digit code. Each phone only receives what is
// meant for it (its own messages, gifts, roll requests and handouts).
(function (root) {
  'use strict';
  var PREFIX = 'charforge-table-', HOSTKEY = 'cf-table-host';
  var lib = null;
  function loadLib() {
    if (root.Peer) return Promise.resolve();
    return lib = lib || new Promise(function (ok, no) { var s = document.createElement('script'); s.src = 'js/vendor/peerjs.min.js'; s.onload = ok; s.onerror = function () { lib = null; no(new Error('Couldn’t load the table (offline?).')); }; document.head.appendChild(s); });
  }
  function rnd(n) { var a = new Uint8Array(n); crypto.getRandomValues(a); return Array.prototype.map.call(a, function (b) { return ('0' + b.toString(16)).slice(-2); }).join(''); }
  var str = function (x, n) { return String(x == null ? '' : x).slice(0, n); }, num = function (x, lo, hi) { return Math.max(lo, Math.min(hi, Math.round(+x) || 0)); };
  // what one phone may see (pid), or everything for the DM (pid 'dm')
  function pub(s, pid) {
    var dm = pid === 'dm', mine = function (to) { return dm || to === 'all' || (to || []).indexOf(pid) >= 0; };
    return { code: s.code, v: s.v, open: s.open, round: s.round, turn: s.turn, claims: s.claims || [],
      players: s.players.map(function (p) { return { id: p.id, name: p.name, init: p.init, bonus: p.bonus, status: p.status || null, gifts: dm || p.id === pid ? p.gifts || [] : [] }; }),
      msgs: (s.msgs || []).filter(function (m) { return dm || m.from === pid || mine(m.to); }),
      asks: (s.asks || []).filter(function (a) { return mine(a.to); }).map(function (a) { if (dm) return a; var o = {}; Object.keys(a).forEach(function (k) { o[k] = a[k]; }); o.ans = {}; if (a.ans[pid]) o.ans[pid] = a.ans[pid]; if (a.secret) { o.dc = 0; if (o.ans[pid]) o.ans[pid] = { total: o.ans[pid].total, roll: o.ans[pid].roll, ok: null }; } return o; }),
      handouts: (s.handouts || []).filter(function (h) { return mine(h.to); }) };
  }

  // ---------- the DM's side: host ----------
  var host = null; // { peer, state, conns: [], key, cbs: {}, imgs: {} }
  var hostCbs = {}, hostImgs = {};
  function saveHost() { try { localStorage.setItem(HOSTKEY, JSON.stringify({ code: host.state.code, key: host.key, state: host.state })); } catch (e) { /* storage blocked */ } }
  function sendTo(c) { if (c.open) try { c.send({ t: 'state', state: pub(host.state, c.pid || '') }); } catch (e) { /* gone */ } }
  function broadcast() { host.state.v++; saveHost(); host.conns.forEach(sendTo); var st = pub(host.state, 'dm'); Object.keys(hostCbs).forEach(function (k) { try { hostCbs[k](st); } catch (e) { /* a page went away */ } }); }
  function sendHandout(c, h) { if (c.open && hostImgs[h.hid]) try { c.send({ t: 'handout', hid: h.hid, img: hostImgs[h.hid] }); } catch (e) { /* gone */ } }
  function forPlayer(pid) { return function (h) { return h.to === 'all' || (h.to || []).indexOf(pid) >= 0; }; }
  function onHostConn(conn) {
    host.conns.push(conn);
    conn.on('open', function () { sendTo(conn); });
    conn.on('close', function () { host && (host.conns = host.conns.filter(function (c) { return c !== conn; })); });
    conn.on('data', function (m) {
      if (!host || !m || typeof m !== 'object') return;
      var s = host.state;
      if (m.t === 'join') {
        if (s.players.length >= 16) return conn.send({ t: 'error', error: 'The table is full.' });
        var np = { id: rnd(4), token: rnd(12), name: str(m.name, 40) || 'Player', bonus: num(m.bonus, -10, 30), init: null };
        s.players.push(np); conn.pid = np.id; conn.send({ t: 'joined', id: np.id, token: np.token }); broadcast();
        (s.handouts || []).filter(forPlayer(np.id)).forEach(function (h) { sendHandout(conn, h); });
        return;
      }
      var p = s.players.filter(function (x) { return x.id === m.id && x.token === m.token; })[0];
      if (!p) { if (m.t !== 'hello') conn.send({ t: 'error', error: 'Join the table again.', gone: true }); return; }
      conn.pid = p.id;
      if (m.t === 'hello') { sendTo(conn); (s.handouts || []).filter(forPlayer(p.id)).forEach(function (h) { sendHandout(conn, h); }); return; }
      if (m.t === 'roll') p.init = m.init == null ? null : num(m.init, -20, 60);
      else if (m.t === 'want') { var cl = (s.claims || []).filter(function (c) { return c.key === m.key; })[0]; if (!cl || cl.result) return; cl.wants = cl.wants.filter(function (id) { return id !== p.id; }); if (m.on) cl.wants.push(p.id); }
      else if (m.t === 'gotGift') p.gifts = (p.gifts || []).filter(function (g) { return g.gid !== m.gid; });
      else if (m.t === 'msg') { var tx = str(m.text, 1000).trim(); if (!tx) return; s.msgs = (s.msgs || []).concat([{ mid: rnd(4), from: p.id, fromName: p.name, to: ['dm'], text: tx, at: Date.now() }]).slice(-100); }
      else if (m.t === 'answer') { var a = (s.asks || []).filter(function (x) { return x.rid === m.rid; })[0]; if (!a || (a.to !== 'all' && a.to.indexOf(p.id) < 0)) return; var tot = num(m.total, -20, 80); a.ans[p.id] = { total: tot, roll: m.roll == null ? null : num(m.roll, 1, 20), ok: a.dc ? tot >= a.dc : null }; }
      else if (m.t === 'status') { var st = m.st || {}; p.status = { hp: num(st.hp, -99, 9999), max: num(st.max, 0, 9999), temp: num(st.temp, 0, 999), ac: num(st.ac, 0, 99), conds: (Array.isArray(st.conds) ? st.conds : []).slice(0, 16).map(function (c) { return str(c, 24); }), conc: str(st.conc, 60), txt: str(st.txt, 100) }; }
      else return;
      broadcast();
    });
  }
  function startHost(code, key, state) {
    return loadLib().then(function () {
      return new Promise(function (ok, no) {
        var peer = new root.Peer(PREFIX + code, root.TABLE_PEER_OPTS);
        peer.on('open', function () { host = { peer: peer, state: state, conns: [], key: key }; peer.on('connection', onHostConn); saveHost(); ok(); });
        peer.on('error', function (e) { if (!host || host.peer !== peer) { peer.destroy(); no(e); } });
        peer.on('disconnected', function () { try { peer.reconnect(); } catch (e) { /* closed */ } });
      });
    });
  }
  function hosted() { try { return JSON.parse(localStorage.getItem(HOSTKEY) || 'null'); } catch (e) { return null; } }

  // ---------- the player's side ----------
  var guest = null; // { code, peer, conn, cb, state, wait, creds }
  var guestImgs = {}, creds = {};
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
        peer.on('error', function (e) { no(e.type === 'peer-unavailable' ? new Error('No table with that code. Check the number with your DM (their table must stay open).') : new Error('Couldn’t connect (' + (e.type || e.message) + ').')); });
        peer.on('open', function () {
          g.step = 'open';
          var conn = peer.connect(PREFIX + code, { reliable: true });
          conn.on('open', function () { g.conn = conn; var c = creds[code]; if (c) conn.send({ t: 'hello', id: c.id, token: c.token }); ok(g); });
          conn.on('data', function (m) {
            if (!m) return;
            if (m.t === 'state') { g.state = m.state; if (g.cb) g.cb(m.state); var w = g.wait; g.wait = []; w.forEach(function (f) { f(m.state); }); }
            else if (m.t === 'handout' && typeof m.img === 'string' && /^data:image\/(png|jpe?g|webp|gif);base64,/.test(m.img)) { guestImgs[m.hid] = m.img; if (g.cb && g.state) g.cb(g.state); }
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
  function asPlayer(code, t, extra) { var c = creds[code] || {}; return send(code, Object.assign({ t: t, id: c.id, token: c.token }, extra)); }

  root.Table = {
    ping: function () { return Promise.resolve(root.RTCPeerConnection ? { ok: true, lan: [] } : null); },
    create: function () {
      var tryOne = function (n) {
        var code = String(1000 + Math.floor(Math.random() * 9000)), key = rnd(16);
        return startHost(code, key, { code: code, v: 1, open: false, round: 0, turn: '', players: [], msgs: [], asks: [], handouts: [] }).then(function () { return { code: code, key: key, lan: [] }; },
          function (e) { if (e && e.type === 'unavailable-id' && n < 6) return tryOne(n + 1); throw new Error(e && e.type === 'network' || e && e.type === 'server-error' ? 'Couldn’t reach the connection service. Check the internet connection.' : (e && e.message) || 'Couldn’t open the table.'); });
      };
      return tryOne(0);
    },
    // ----- player -----
    setCreds: function (code, id, token) { if (id) creds[code] = { id: id, token: token }; else delete creds[code]; },
    join: function (code, name, bonus) {
      return connectGuest(code).then(function (g) {
        return new Promise(function (ok, no) {
          g.onJoined = function (m) { g.onJoined = null; creds[code] = { id: m.id, token: m.token }; ok({ id: m.id, token: m.token, state: g.state }); };
          g.onError = function (e) { g.onError = null; no(e); };
          setTimeout(function () { if (g.onJoined) { g.onJoined = null; no(new Error('The DM’s device didn’t answer. Is their table still open?')); } }, 15000);
          g.conn.send({ t: 'join', name: name, bonus: bonus });
        });
      });
    },
    roll: function (code, id, token, init) { creds[code] = { id: id, token: token }; return asPlayer(code, 'roll', { init: init }).then(function (g) { return new Promise(function (ok) { g.wait.push(ok); }); }); },
    want: function (code, id, token, key, on) { creds[code] = { id: id, token: token }; return asPlayer(code, 'want', { key: key, on: !!on }); },
    ackGift: function (code, id, token, gid) { creds[code] = { id: id, token: token }; return asPlayer(code, 'gotGift', { gid: gid }); },
    message: function (code, text) { return asPlayer(code, 'msg', { text: text }); },
    answer: function (code, rid, total, roll) { return asPlayer(code, 'answer', { rid: rid, total: total, roll: roll }); },
    status: function (code, st) { return asPlayer(code, 'status', { st: st }); },
    handoutImg: function (hid) { return guestImgs[hid] || hostImgs[hid] || ''; },
    // ----- DM -----
    hostInfo: function () { if (host) return { code: host.state.code, key: host.key, state: pub(host.state, 'dm') }; var h = hosted(); return h ? { code: h.code, key: h.key, state: pub(h.state, 'dm') } : null; },
    dm: function (code, key, what) {
      var go = function () {
        if (!host || host.state.code !== code || host.key !== key) throw new Error('Not the DM.');
        var s = host.state, to = function (x) { return x === 'all' ? 'all' : (Array.isArray(x) ? x : []).map(function (v) { return str(v, 16); }); };
        if ('open' in what) { s.open = !!what.open; if (s.open && what.reset) s.players.forEach(function (p) { p.init = null; }); }
        if ('round' in what) s.round = +what.round || 0;
        if ('turn' in what) s.turn = str(what.turn, 60);
        if (what.kick) s.players = s.players.filter(function (p) { return p.id !== what.kick; });
        if (what.claim) { s.claims = (s.claims || []).filter(function (c) { return c.key !== what.claim.key; }).concat([{ key: str(what.claim.key, 20), n: str(what.claim.n, 80), wants: [], result: '' }]).slice(-8); }
        if (what.claimResult) { (s.claims || []).forEach(function (c) { if (c.key === what.claimResult.key) c.result = str(what.claimResult.text, 300); }); }
        if (what.claimDrop) s.claims = (s.claims || []).filter(function (c) { return c.key !== what.claimDrop; });
        if (what.gift) { var gto = s.players.filter(function (p) { return p.id === what.gift.to; })[0]; if (gto) { gto.gifts = (gto.gifts || []).concat([{ gid: rnd(4), coins: what.gift.coins || {}, items: (what.gift.items || []).slice(0, 20), from: str(what.gift.from, 80) }]).slice(-20); } }
        if (what.msg) s.msgs = (s.msgs || []).concat([{ mid: rnd(4), from: 'dm', fromName: 'DM', to: to(what.msg.to), text: str(what.msg.text, 1000), at: Date.now() }]).slice(-100);
        if (what.ask) s.asks = (s.asks || []).concat([{ rid: rnd(4), label: str(what.ask.label, 60), kind: str(what.ask.kind, 10), key: str(what.ask.key, 30), dc: what.ask.dc ? num(what.ask.dc, 1, 40) : 0, secret: !!what.ask.secret, to: to(what.ask.to), ans: {}, at: Date.now() }]).slice(-10);
        if (what.askDrop) s.asks = (s.asks || []).filter(function (a) { return a.rid !== what.askDrop; });
        if (what.handout) {
          var hid = rnd(4); hostImgs[hid] = what.handout.img;
          var h = { hid: hid, title: str(what.handout.title, 80), to: to(what.handout.to), at: Date.now() };
          s.handouts = (s.handouts || []).concat([h]).slice(-12);
          host.conns.forEach(function (c) { if (c.pid && forPlayer(c.pid)(h)) sendHandout(c, h); });
        }
        if (what.handoutDrop) { s.handouts = (s.handouts || []).filter(function (h) { return h.hid !== what.handoutDrop; }); delete hostImgs[what.handoutDrop]; }
        if (what.clearMsgs) s.msgs = [];
        if (what.close) { host.conns.forEach(function (c) { try { c.send({ t: 'closed' }); } catch (e) { /* gone */ } }); var pe = host.peer; host = null; hostImgs = {}; try { localStorage.removeItem(HOSTKEY); } catch (e) { /* ignore */ } setTimeout(function () { pe.destroy(); }, 300); return { ok: true }; }
        broadcast(); return pub(s, 'dm');
      };
      if (host && host.state.code === code) return Promise.resolve().then(go);
      var hh = hosted(); if (hh && hh.code === code && hh.key === key) return startHost(code, key, hh.state).then(go);
      return Promise.reject(new Error('Not the DM.'));
    },
    // follow a table: the DM's own (several pages may listen, by name) or one joined as a player
    watch: function (code, cb, name) {
      var h = hosted();
      if (h && h.code === code) {
        hostCbs[name || 'main'] = cb;
        if (host && host.state.code === code) return;
        if (root.Table._starting === code) return; root.Table._starting = code;
        startHost(code, h.key, h.state).then(function () { root.Table._starting = ''; cb(pub(host.state, 'dm')); }, function () { root.Table._starting = ''; cb(null, new Error('No table')); });
        return;
      }
      if (guest && guest.code === code) { guest.cb = cb; return; }
      connectGuest(code).then(function (g) { g.cb = cb; if (g.state) cb(g.state); }, function () { cb(null, new Error('No table')); });
    },
    stop: function () { if (guest) { try { guest.peer.destroy(); } catch (e) { /* ignore */ } guest = null; } }
  };
})(typeof window !== 'undefined' ? window : globalThis);
