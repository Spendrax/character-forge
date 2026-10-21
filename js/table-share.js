// Pathfinder treasure and M&M rewards → the players' phones at the GM's table:
// give an item to one player, let the dice decide between those who want it, or split the money evenly.
// things: [{ key, n, id?, note? }], gp: coins to split (0 for none)
(function (root) {
  'use strict';
  root.TableShare = function (api) {
    var esc = api.esc, btn = api.btn, S = api.ui.tshare = api.ui.tshare || { roll: {}, msg: '', list: {} };
    function tb() { var T = root.Table; return T && T.hostInfo ? T.hostInfo() : null; }
    function dm(what) { var t = tb(); if (t) root.Table.dm(t.code, t.key, what).then(function () { api.render(); }, function (e) { S.msg = e.message; api.render(); }); }
    function gift(pid, coins, items, from) { dm({ gift: { to: pid, coins: coins || {}, items: items || [], from: from || 'the GM' } }); }
    function claim(key) { var t = tb(); return t && (t.state.claims || []).filter(function (c) { return c.key === key; })[0]; }
    function item(x) { return { n: String(x.n).slice(0, 80), id: x.id || '', note: String(x.note || '').slice(0, 200) }; }
    function html(things, gp, from) {
      var t = tb(); if (!t) return '<div class="panel compact-row small"><b>📱</b><span class="muted">Open the table on the GM page and you can send this straight to the players’ phones.</span>' + btn('section', 'GM page', { v: 'dm' }, 'btn small') + '</div>';
      root.Table.watch(t.code, function () { if (api.isHere()) api.render(); }, 'share');
      var P = t.state.players; S.list = {}; things.forEach(function (x) { S.list[x.key] = x; }); S.from = from; S.gp = gp;
      if (!P.length) return '<div class="panel small muted">📱 Nobody has joined the table yet.</div>';
      var h = '<div class="panel tre-split"><h3>📱 Send to the players</h3>';
      if (gp > 0) { var each = Math.floor(gp / P.length); h += '<div class="toolbar"><span><b>' + gp.toLocaleString('en') + ' gp</b> ÷ ' + P.length + ' = ' + each.toLocaleString('en') + ' gp each</span>' + btn('tsCoins', 'Send everyone their share', {}, 'btn small primary') + '</div>'; }
      h += things.map(function (x) {
        var r = S.roll[x.key], c = claim(x.key), wants = c ? c.wants.map(function (id) { return (P.filter(function (p) { return p.id === id; })[0] || {}).name; }).filter(Boolean) : [];
        return '<div class="tre-share-row"><b>' + esc(x.n) + '</b><span class="spacer"></span>' + (r && r.result ? '<span class="small rest-msg">' + esc(r.result) + '</span>' : r ? '<span class="small">' + (wants.length ? 'Want it: ' + esc(wants.join(', ')) : 'waiting for players to tap “I want it”…') + '</span>' + (wants.length ? btn('tsRollGo', '🎲 Roll!', { v: x.key }, 'btn small primary') : '') + btn('tsRoll', 'Cancel', { v: x.key }, 'btn small')
          : '<select data-tsgive="' + esc(x.key) + '" aria-label="Give ' + esc(x.n) + ' to"><option value="">Give to…</option>' + P.map(function (p) { return '<option value="' + p.id + '">' + esc(p.name) + '</option>'; }).join('') + '</select>' + btn('tsRoll', '🎲 Roll for it', { v: x.key }, 'btn small')) + '</div>';
      }).join('');
      return h + (S.msg ? '<p class="small rest-msg">' + esc(S.msg) + '</p>' : '') + '</div>';
    }
    var actions = {
      tsCoins: function () { var t = tb(); if (!t) return; var P = t.state.players, each = Math.floor(S.gp / P.length); P.forEach(function (p) { gift(p.id, { gp: each }, [], S.from); }); S.msg = each.toLocaleString('en') + ' gp sent to each player.'; },
      tsRoll: function (v) { if (S.roll[v]) { delete S.roll[v]; dm({ claimDrop: v }); return; } var x = S.list[v]; if (!x) return; S.roll[v] = { result: '' }; dm({ claim: { key: v, n: x.n } }); },
      tsRollGo: function (v) {
        var t = tb(), c = claim(v), x = S.list[v]; if (!t || !c || !x || !c.wants.length) return;
        var left = c.wants.slice(), lines = [], name = function (id) { return (t.state.players.filter(function (p) { return p.id === id; })[0] || {}).name || '?'; };
        while (left.length > 1) {
          var rolls = left.map(function (id) { return [id, 1 + Math.floor(Math.random() * 20)]; }), top = Math.max.apply(null, rolls.map(function (r) { return r[1]; }));
          lines.push(rolls.map(function (r) { return name(r[0]) + ' ' + r[1]; }).join(', '));
          left = rolls.filter(function (r) { return r[1] === top; }).map(function (r) { return r[0]; });
        }
        var text = (lines.length ? lines.join(' · then ') + ': ' : '') + name(left[0]) + ' gets ' + x.n + '.';
        S.roll[v] = { result: text }; dm({ claimResult: { key: v, text: text } }); gift(left[0], {}, [item(x)], S.from);
      }
    };
    function onChange(t) {
      var k = t.getAttribute && t.getAttribute('data-tsgive'); if (!k) return false;
      var x = S.list[k], tt = tb(), p = tt && tt.state.players.filter(function (y) { return y.id === t.value; })[0];
      if (x && p) { gift(p.id, {}, [item(x)], S.from); S.msg = x.n + ' sent to ' + p.name + '.'; }
      return true;
    }
    return { html: html, actions: actions, onChange: onChange };
  };
})(typeof window !== 'undefined' ? window : globalThis);
