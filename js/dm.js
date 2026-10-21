// The DM's corner (D&D): the DM tools in one place, and the table with the players' phones:
// who is there and how they're doing, private messages, handouts (a picture for some or all), and roll requests.
(function (root) {
  'use strict';
  var AB = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'];
  var TOOLS = [['party', 'campfire', 'Party'], ['encounters', 'swords', 'Encounters'], ['monsters', 'dragon', 'Monsters'], ['treasure', 'coins', 'Treasures'], ['gen', 'sparkle', 'Generators']];
  var REF = [['Difficulty', 'Very easy 5 · Easy 10 · Medium 15 · Hard 20 · Very hard 25 · Nearly impossible 30'],
    ['Cover', 'Half: +2 AC and Dex saves · Three-quarters: +5 · Total: can’t be targeted directly'],
    ['Light', 'Dim light: disadvantage on Perception by sight · Darkness: effectively blinded'],
    ['Travel', 'Fast 4 mi/h (−5 passive Perception) · Normal 3 mi/h · Slow 2 mi/h (can sneak)'],
    ['Falling', '1d6 bludgeoning per 10 ft, up to 20d6'],
    ['Suffocating', 'Hold breath 1 + Con mod minutes (at least 30 s), then Con mod rounds (at least 1), then 0 HP'],
    ['Death saves', 'DC 10 · 3 successes: stable · 3 failures: dead · 1: two failures · 20: back with 1 HP · damage at 0 HP: a failure (a crit: two)']];

  root.DMUI = function (api) {
    var esc = api.esc, btn = api.btn, ui = api.ui, store = api.store, M = ui.dmUi = ui.dmUi || { to: {}, askTo: {}, kind: 'save:DEX', dc: '', text: '', title: '' };
    function T() { return root.Table; }
    function tbl() { return store.encTable || null; }
    function St() { var i = T() && T().hostInfo(); return (i && i.state) || M.st || null; }
    function names(st, to) { if (to === 'all') return 'everyone'; return (to || []).map(function (id) { if (id === 'dm') return 'DM'; var p = st.players.filter(function (x) { return x.id === id; })[0]; return p ? p.name : '?'; }).join(', '); }
    function picked(sel) { var ids = Object.keys(sel).filter(function (k) { return sel[k]; }); return sel.all || !ids.length ? 'all' : ids; }
    function whoPills(st, sel, act) {
      return '<div class="pills">' + btn(act, 'Everyone', { v: 'all' }, 'pill small' + (sel.all || !Object.keys(sel).some(function (k) { return sel[k]; }) ? ' on' : '')) +
        st.players.map(function (p) { return btn(act, esc(p.name), { v: p.id }, 'pill small' + (sel[p.id] && !sel.all ? ' on' : '')); }).join('') + '</div>';
    }
    function toggle(sel, v) { if (v === 'all') { Object.keys(sel).forEach(function (k) { delete sel[k]; }); sel.all = true; return; } delete sel.all; sel[v] = !sel[v]; }
    function dm(what) { var t = tbl(); if (!t) return; T().dm(t.code, t.key, what).then(function (st) { if (st && st.players) M.st = st; api.render(); }, function (e) { M.msg = e.message; api.render(); }); }

    function tilesHtml() {
      return '<nav class="dm-tiles" aria-label="DM tools">' + TOOLS.map(function (x, i) {
        return '<button type="button" class="dm-tile hub-item c' + i + '" data-act="section" data-v="' + x[0] + '"><span class="hub-dot">' + root.Icon(x[1]) + '</span><span class="hub-lbl">' + x[2] + '</span></button>';
      }).join('') + '</nav>';
    }
    function statusHtml(p) {
      var s = p.status;
      if (!s) return '<span class="small muted">no news yet</span>';
      var pct = s.max ? Math.max(0, Math.min(100, Math.round(s.hp / s.max * 100))) : 0;
      return '<span class="dm-hp' + (s.hp <= 0 ? ' down' : pct <= 50 ? ' low' : '') + '">' + s.hp + '/' + s.max + ' HP' + (s.temp ? ' +' + s.temp : '') + '</span><span class="small">AC ' + s.ac + '</span>' +
        (s.conc ? '<span class="small">◉ ' + esc(s.conc) + '</span>' : '') + (s.conds.length ? '<span class="small bad">' + esc(s.conds.join(', ')) + '</span>' : '');
    }
    function tableHtml() {
      if (!T() || !root.RTCPeerConnection) return '<div class="panel"><p class="small muted">This browser can’t hold a table for phones.</p></div>';
      var t = tbl();
      if (!t) return '<div class="panel compact-row"><b>📱 Players’ phones</b><span class="small muted">Open the table and the players join from their character’s Session page.</span>' + btn('dmOpen', 'Open the table', {}, 'btn small primary') + (M.msg ? '<span class="small bad">' + esc(M.msg) + '</span>' : '') + '</div>';
      T().watch(t.code, function (st) { if (!st) { store.encTable = null; M.st = null; M.msg = 'The table closed. Open a new one.'; api.render(); return; } M.st = st; if (api.isHere()) api.render(); }, 'dm');
      var st = St() || { players: [] }, url = location.origin + location.pathname + '#table=' + t.code;
      if (!M.qr || M.qrFor !== url) { M.qrFor = url; if (root.Transfer) root.Transfer.qr(url).then(function (u) { M.qr = u; api.render(); }, function () {}); }
      var h = '<div class="panel tbl-panel"><div class="toolbar" style="margin:0"><b>📱 Table <span class="tbl-code">' + t.code + '</span></b><span class="spacer"></span>' + btn('dmQr', M.showQr ? 'Hide the QR code' : 'QR code', {}, 'btn small') + btn('dmClose', 'Close the table', {}, 'btn small') + '</div>';
      if (M.showQr || !st.players.length) h += '<div class="tbl-join">' + (M.qr ? '<img class="xfer-qr tbl-qr" src="' + M.qr + '" alt="QR code to join the table">' : '') + '<div class="small">Players scan this, or open their character’s <b>Session</b> page and type <b>' + t.code + '</b>. Keep the app open on this device while you play.</div></div>';
      h += st.players.length ? '<ul class="dm-players">' + st.players.map(function (p) {
        return '<li><b>' + esc(p.name) + '</b>' + statusHtml(p) + (p.init != null ? '<span class="small">init <b>' + p.init + '</b></span>' : '') + '<span class="spacer"></span>' + btn('tblKick', '✕', { v: p.id }, 'btn tiny') + '</li>';
      }).join('') + '</ul>' : '<p class="small muted">Nobody has joined yet.</p>';
      return h + (M.msg ? '<p class="small bad">' + esc(M.msg) + '</p>' : '') + '</div>';
    }
    function msgsHtml(st) {
      var list = (st.msgs || []).slice(-30);
      return '<div class="panel"><div class="toolbar" style="margin:0"><h3 style="margin:0">Messages</h3><span class="spacer"></span>' + (list.length ? btn('dmMsgClear', 'Clear', {}, 'btn tiny') : '') + '</div>' +
        (list.length ? '<ul class="dm-msgs">' + list.map(function (m) {
          var mine = m.from === 'dm';
          return '<li class="' + (mine ? 'out' : 'in') + '"><span class="small muted">' + (mine ? 'To ' + esc(names(st, m.to)) : 'From ' + esc(m.fromName)) + '</span><div>' + esc(m.text).replace(/\n/g, '<br>') + '</div></li>';
        }).join('') + '</ul>' : '<p class="small muted">Private notes to one player (“you notice the innkeeper is lying”), or to everyone. Their replies show up here.</p>') +
        '<span class="small">To:</span>' + whoPills(st, M.to, 'dmTo') +
        '<div class="toolbar"><textarea id="dm-text" data-dm="text" rows="2" placeholder="Write a message…" style="flex:1;min-width:12rem">' + esc(M.text) + '</textarea>' + btn('dmSend', 'Send', {}, 'btn primary') + '</div></div>';
    }
    function kindLabel(k) { var p = k.split(':'); return p[0] === 'save' ? p[1] + ' save' : p[0] === 'check' ? p[1] + ' check' : p[1]; }
    function asksHtml(st) {
      var skills = api.skills(), o = function (v, t) { return '<option value="' + esc(v) + '"' + (M.kind === v ? ' selected' : '') + '>' + esc(t) + '</option>'; };
      var h = '<div class="panel"><h3>Ask for a roll</h3><div class="toolbar"><select data-dm="kind" aria-label="What to roll"><optgroup label="Saving throws">' + AB.map(function (a) { return o('save:' + a, a + ' save'); }).join('') + '</optgroup>' +
        '<optgroup label="Skills">' + skills.map(function (s) { return o('skill:' + s, s); }).join('') + '</optgroup><optgroup label="Ability checks">' + AB.map(function (a) { return o('check:' + a, a + ' check'); }).join('') + '</optgroup></select>' +
        '<input type="number" id="dm-dc" data-dm="dc" value="' + esc(M.dc) + '" placeholder="DC" style="width:4.5rem" aria-label="DC (optional)">' +
        '<label class="small"><input type="checkbox" data-dm="secret"' + (M.secret ? ' checked' : '') + '> hide the DC</label></div>' +
        '<span class="small">Who rolls:</span>' + whoPills(st, M.askTo, 'dmAskTo') + '<div class="toolbar">' + btn('dmAsk', 'Ask', {}, 'btn primary') + '</div>';
      (st.asks || []).slice().reverse().forEach(function (a) {
        var who = a.to === 'all' ? st.players.map(function (p) { return p.id; }) : a.to;
        h += '<div class="dm-ask"><div class="toolbar" style="margin:0"><b>' + esc(a.label) + '</b>' + (a.dc ? '<span class="small">DC ' + a.dc + (a.secret ? ' (hidden)' : '') + '</span>' : '') + '<span class="spacer"></span>' + btn('dmAskDrop', '✕', { v: a.rid }, 'btn tiny') + '</div><ul class="dm-ans">' +
          who.map(function (id) {
            var p = st.players.filter(function (x) { return x.id === id; })[0], r = a.ans[id]; if (!p) return '';
            return '<li>' + esc(p.name) + ': ' + (r ? '<b>' + r.total + '</b>' + (r.roll ? ' <span class="small muted">(d20 ' + r.roll + ')</span>' : '') + (r.ok == null ? '' : r.ok ? ' <span class="good">✓</span>' : ' <span class="bad">✗</span>') : '<span class="muted">waiting…</span>') + '</li>';
          }).join('') + '</ul></div>';
      });
      return h + '</div>';
    }
    function handoutsHtml(st) {
      var h = '<div class="panel"><h3>Handouts</h3><p class="small muted">A map, a letter, a portrait: pick a picture and it appears on the chosen players’ phones.</p>' +
        '<div class="toolbar"><input type="text" id="dm-title" data-dm="title" value="' + esc(M.title) + '" placeholder="Title (optional)" style="flex:1;min-width:10rem"><label class="btn">🖼 Pick a picture…<input type="file" id="dmHandoutFile" accept="image/*" hidden></label></div>' +
        '<span class="small">For:</span>' + whoPills(st, M.hoTo = M.hoTo || {}, 'dmHoTo') + (M.hoBusy ? '<p class="small muted">Sending…</p>' : '');
      var list = (st.handouts || []).slice().reverse();
      if (list.length) h += '<div class="dm-handouts">' + list.map(function (x) {
        var img = T().handoutImg(x.hid);
        return '<figure>' + (img ? '<img src="' + img + '" alt="' + esc(x.title || 'Handout') + '">' : '') + '<figcaption><b>' + esc(x.title || 'Handout') + '</b> <span class="small muted">for ' + esc(names(st, x.to)) + '</span> ' + btn('dmHoDrop', '✕', { v: x.hid }, 'btn tiny') + '</figcaption></figure>';
      }).join('') + '</div>';
      return h + '</div>';
    }
    function refHtml() {
      return '<details class="panel dm-ref"><summary><b>Quick reference</b></summary><dl>' + REF.map(function (r) { return '<dt>' + r[0] + '</dt><dd>' + esc(r[1]) + '</dd>'; }).join('') + '</dl></details>';
    }
    function html() {
      var st = St(), on = tbl() && st;
      return '<main class="home dm-page"><h2>DM</h2>' + tilesHtml() + tableHtml() +
        (on && st.players.length ? asksHtml(st) + msgsHtml(st) + handoutsHtml(st) : on ? '<p class="small muted">Once players join you can message them, send handouts and ask for rolls here.</p>' : '') + refHtml() + '</main>';
    }
    // a picture, shrunk so it travels quickly to the phones
    function shrink(file) {
      return new Promise(function (ok, no) {
        var fr = new FileReader();
        fr.onload = function () { var im = new Image(); im.onload = function () { var k = Math.min(1, 1280 / Math.max(im.width, im.height)), c = document.createElement('canvas'); c.width = Math.round(im.width * k); c.height = Math.round(im.height * k); c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); ok(c.toDataURL('image/jpeg', 0.8)); }; im.onerror = function () { no(new Error('That file isn’t a picture this browser can read.')); }; im.src = fr.result; };
        fr.onerror = function () { no(fr.error); }; fr.readAsDataURL(file);
      });
    }
    var actions = {
      dmOpen: function () { M.msg = ''; T().create().then(function (j) { store.encTable = { code: j.code, key: j.key }; M.st = null; M.showQr = true; api.save(); api.render(); }, function (e) { M.msg = e.message; api.render(); }); return false; },
      dmClose: function () { var t = tbl(); if (t) T().dm(t.code, t.key, { close: true }).catch(function () {}); store.encTable = null; M.st = null; api.save(); },
      dmQr: function () { M.showQr = !M.showQr; },
      dmTo: function (v) { toggle(M.to, v); }, dmAskTo: function (v) { toggle(M.askTo, v); }, dmHoTo: function (v) { toggle(M.hoTo, v); },
      dmSend: function () { var el = document.getElementById('dm-text'), tx = (el ? el.value : M.text).trim(); if (!tx) return false; dm({ msg: { to: picked(M.to), text: tx } }); M.text = ''; },
      dmMsgClear: function () { dm({ clearMsgs: true }); return false; },
      dmAsk: function () { var p = M.kind.split(':'); dm({ ask: { kind: p[0], key: p[1], label: kindLabel(M.kind), dc: +M.dc || 0, secret: !!M.secret, to: picked(M.askTo) } }); return false; },
      dmAskDrop: function (v) { dm({ askDrop: v }); return false; },
      dmHoDrop: function (v) { dm({ handoutDrop: v }); return false; }
    };
    function onInput(t) { var k = t.getAttribute('data-dm'); if (!k || k === 'kind' || k === 'secret') return null; M[k] = t.value; return 'keep'; }
    function onChange(t) {
      if (t.id === 'dmHandoutFile') {
        var f = t.files && t.files[0]; t.value = ''; if (!f) return 'render';
        M.hoBusy = true; shrink(f).then(function (img) { M.hoBusy = false; dm({ handout: { img: img, title: M.title, to: picked(M.hoTo) } }); M.title = ''; }, function (e) { M.hoBusy = false; M.msg = e.message; api.render(); });
        return 'render';
      }
      var k = t.getAttribute('data-dm'); if (!k) return null;
      if (k === 'secret') M.secret = t.checked; else M[k] = t.value;
      return k === 'kind' || k === 'secret' ? 'render' : 'keep';
    }
    return { html: html, actions: actions, onInput: onInput, onChange: onChange };
  };
})(typeof window !== 'undefined' ? window : globalThis);
