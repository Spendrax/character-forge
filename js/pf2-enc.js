// Pathfinder 2e party and encounters for the GM: the XP budget (Gamemastery rules of the Core Rulebook),
// creatures from the Bestiaries (OGL), elite and weak versions, and running the fight.
(function (root) {
  'use strict';
  var XP = { '-4': 10, '-3': 15, '-2': 20, '-1': 30, '0': 40, '1': 60, '2': 80, '3': 120, '4': 160 };
  var THREAT = [['Trivial', 40, 10], ['Low', 60, 15], ['Moderate', 80, 20], ['Severe', 120, 30], ['Extreme', 160, 40]];
  // Elite and weak adjustments: ±2 to AC, attacks, DCs, saves, Perception, damage; HP by starting level
  function hpAdj(lv) { return lv <= 1 ? 10 : lv <= 4 ? 15 : lv <= 19 ? 20 : 30; }
  function xpFor(diff) { if (diff < -4) return 0; if (diff > 4) return 160 + (diff - 4) * 40; return XP[String(diff)]; }
  function budget(n) { return THREAT.map(function (t) { return { label: t[0], xp: t[1] + t[2] * (n - 4) }; }); }
  function rate(partyLevel, n, mons) {
    var total = 0;
    mons.forEach(function (m) { total += xpFor(m.lv - partyLevel) * (m.count || 1); });
    // the threat is the first budget the total fits in (trivial is 40 XP or less for four characters)
    var b = budget(n), idx = 5;
    for (var i = 0; i < b.length; i++) if (total <= b[i].xp) { idx = i; break; }
    return { xp: total, budget: b, threat: idx === 5 ? 'Beyond extreme' : b[idx].label, idx: idx };
  }

  root.PF2Enc = function (api) {
    var esc = api.esc, btn = api.btn, ui = api.ui, store = api.store, md = api.md, fmt = api.fmt, gl = api.gl, traits = api.traits;
    var E = ui.pf2e = ui.pf2e || { q: '', lo: '', hi: '', trait: '', open: '', delParty: false, team: '' };
    function parties() { return store.pf2Parties = store.pf2Parties || []; }
    function partyById(id) { return parties().filter(function (p) { return p.id === id; })[0]; }
    function curParty() { return partyById(E.team) || parties()[0] || null; }
    function enc() { return store.pf2Enc = store.pf2Enc || { party: '', lvl: 1, n: 4, mons: [], run: null }; }
    function uid() { return 'e' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
    function mon(id) { var B = (root.PF2DATA || {}).bestiary || []; if (!B._by) { B._by = {}; B.forEach(function (m) { B._by[m.id] = m; }); } return B._by[id]; }
    function adjLv(m, adj) { return m.lv + (adj === 'elite' ? 1 : adj === 'weak' ? -1 : 0); }

    // ---------- party ----------
    function newMember(lv) { return { id: uid(), n: '', cls: '', lvl: lv || 1, ac: 15, hp: 20, cur: 20, per: 5 }; }
    function line(p) {
      if (!p.m.length) return 'No characters yet.';
      var lv = p.m.map(function (x) { return +x.lvl || 1; }), lo = Math.min.apply(null, lv), hi = Math.max.apply(null, lv);
      return p.m.length + ' character' + (p.m.length === 1 ? '' : 's') + ', level ' + (lo === hi ? lo : lo + '–' + hi) + ' · HP ' + p.m.reduce(function (a, x) { return a + (+x.cur || 0); }, 0) + '/' + p.m.reduce(function (a, x) { return a + (+x.hp || 0); }, 0);
    }
    function partyLevel(p) { var c = {}; p.m.forEach(function (x) { c[x.lvl] = (c[x.lvl] || 0) + 1; }); return +Object.keys(c).sort(function (a, b) { return c[b] - c[a] || b - a; })[0] || 1; }
    function partyHtml() {
      var p = curParty(), list = parties();
      if (!p) return '<main class="mon-main"><h2>Party</h2><p class="muted">Keep your players’ characters here (class, level, AC, HP, Perception). Encounters uses them for the XP budget and their hit points carry over between fights.</p>' + btn('pfeNew', '+ New party', {}, 'btn primary') + '</main>';
      var mine = ((store.pf2 || {}).chars || []).filter(function (c) { return c.name && c.cls; });
      var f = function (m, k, label, wide) { return '<label class="pm-f' + (wide ? ' wide' : '') + '"><span>' + label + '</span><input type="' + (wide ? 'text' : 'number') + '"' + (wide ? '' : ' inputmode="numeric"') + ' id="pfe-' + k + '-' + m.id + '" data-pfem="' + m.id + '" data-f="' + k + '" value="' + esc(m[k] == null ? '' : m[k]) + '"></label>'; };
      var rows = p.m.map(function (m) {
        var pct = m.hp ? Math.max(0, Math.min(100, Math.round(m.cur / m.hp * 100))) : 0;
        return '<div class="panel pm' + (m.hp && m.cur <= 0 ? ' down' : '') + '"><div class="pm-row">' + f(m, 'n', 'Name', 1) + f(m, 'cls', 'Class', 1) + btn('pfeRm', '✕', { v: m.id }, 'btn small') + '</div>' +
          '<div class="pm-row pm-def">' + f(m, 'lvl', 'Level') + f(m, 'ac', 'AC') + f(m, 'hp', 'Max HP') + f(m, 'per', 'Perc.') + '<span></span></div>' +
          '<div class="pm-hp"><span><b>' + m.cur + '</b>/' + m.hp + ' HP</span><div class="hpbar"><span style="width:' + pct + '%"></span></div><div class="enc-adj">' + ['-10', '-5', '-1', '+1', '+5', '+10'].map(function (v) { return btn('pfeHp', v.replace('-', '−'), { v: m.id, d: v }, 'btn small'); }).join('') + '</div></div></div>';
      }).join('');
      return '<main class="mon-main"><h2>Party</h2><div class="toolbar">' + (list.length > 1 ? '<select data-pfepick="1" aria-label="Choose a party">' + list.map(function (x) { return '<option value="' + x.id + '"' + (x === p ? ' selected' : '') + '>' + esc(x.name || 'Unnamed party') + '</option>'; }).join('') + '</select>' : '') + btn('pfeNew', '+ New party', {}, 'btn small') + '</div>' +
        '<div class="panel"><label class="field"><span>Party name</span><input type="text" id="pfe-name" data-pfename="1" value="' + esc(p.name || '') + '" placeholder="The Lantern Bearers"></label><p class="small muted" style="margin:.4rem 0 0">' + esc(line(p)) + '</p>' +
        '<div class="toolbar">' + btn('pfePlan', (root.Icon ? root.Icon('swords') : '') + ' Plan an encounter for them', {}, 'btn primary') + btn('pfeRest', 'Rest: full HP', {}, 'btn small') + '</div></div>' + rows +
        '<div class="toolbar">' + btn('pfeAdd', '+ Add a character', {}, 'btn') + (mine.length ? '<select data-pfemine="1" aria-label="Add one of my characters"><option value="">+ One of my characters…</option>' + mine.map(function (c) { return '<option value="' + c.id + '">' + esc(c.name) + '</option>'; }).join('') + '</select>' : '') + '</div>' +
        '<div class="toolbar">' + (E.delParty ? '<span>Delete “' + esc(p.name || 'this party') + '”?</span>' + btn('pfeDel', 'Yes, delete', {}, 'btn small danger') + btn('pfeDelNo', 'No', {}, 'btn small') : btn('pfeDelAsk', 'Delete this party', {}, 'btn small')) + '</div></main>';
    }

    // ---------- encounter ----------
    function statBlock(m, adj) {
      var d = adj === 'elite' ? 2 : adj === 'weak' ? -2 : 0, hp = m.hp + (adj === 'elite' ? hpAdj(m.lv) : adj === 'weak' ? -hpAdj(m.lv) : 0);
      var sv = m.sv || {};
      return '<div class="pf-desc pf-stat-block">' + traits((m.t || []).concat(m.size ? [{ tiny: 'tiny', sm: 'small', med: 'medium', lg: 'large', huge: 'huge', grg: 'gargantuan' }[m.size] || m.size] : []), m) +
        '<p class="small"><b>Perception</b> ' + fmt((m.per || 0) + d) + (m.lang && m.lang.length ? ' · <b>Languages</b> ' + esc(m.lang.join(', ')) : '') + '</p>' +
        (m.sk ? '<p class="small"><b>Skills</b> ' + esc(Object.keys(m.sk).map(function (k) { return k + ' ' + fmt(m.sk[k] + d); }).join(', ')) + '</p>' : '') +
        '<p class="small">' + ['str', 'dex', 'con', 'int', 'wis', 'cha'].map(function (a) { return '<b>' + a.toUpperCase() + '</b> ' + fmt((m.ab || {})[a] || 0); }).join(' ') + '</p>' +
        '<p class="small"><b>AC</b> ' + ((m.ac || 0) + d) + '; <b>Fort</b> ' + fmt((sv.fortitude || 0) + d) + ', <b>Ref</b> ' + fmt((sv.reflex || 0) + d) + ', <b>Will</b> ' + fmt((sv.will || 0) + d) + '</p>' +
        '<p class="small"><b>HP</b> ' + hp + (m.imm ? '; <b>Immunities</b> ' + esc(m.imm.join(', ')) : '') + (m.wea ? '; <b>Weaknesses</b> ' + esc(m.wea.join(', ')) : '') + (m.res ? '; <b>Resistances</b> ' + esc(m.res.join(', ')) : '') + '</p>' +
        '<p class="small"><b>Speed</b> ' + (m.spd || 0) + ' feet' + (m.spd2 ? ', ' + esc(m.spd2.join(', ')) : '') + '</p>' +
        (m.str || []).map(function (s) { return '<p class="small"><b>' + (s.rng === 'ranged' ? 'Ranged' : 'Melee') + '</b> ◆ ' + esc(s.n) + ' ' + fmt((s.b || 0) + d) + (s.t && s.t.length ? ' (' + esc(s.t.join(', ')) + ')' : '') + ', <b>Damage</b> ' + esc(s.d) + (d ? ' ' + (d > 0 ? '+2' : '−2') : '') + '</p>'; }).join('') +
        (m.abil || []).map(function (a) { return '<div class="small"><b>' + esc(a.n) + '</b> ' + gl(a.a) + (a.spells ? ' ' + esc(a.d) + ': ' + esc(a.spells.join(', ')) : '') + (a.d && !a.spells ? md(a.d) : '') + '</div>'; }).join('') +
        (m.d ? '<div class="small muted">' + md(m.d) + '</div>' : '') + '</div>';
    }
    function html() {
      if (!api.need(['core', 'bestiary'])) return api.waitHtml('Encounters');
      var e = enc(), p = partyById(e.party);
      if (e.run) return '<main class="mon-main"><h2>Encounter</h2>' + runHtml() + '</main>';
      var lvl = p && p.m.length ? partyLevel(p) : +e.lvl || 1, n = p && p.m.length ? p.m.length : +e.n || 4;
      var mons = e.mons.map(function (x) { var m = mon(x.id); return m ? { m: m, x: x, lv: adjLv(m, x.adj), count: x.count } : null; }).filter(Boolean);
      var r = rate(lvl, n, mons);
      var meter = '<div class="enc-diff"><div class="enc-meter">' + r.budget.map(function (t, i) { return '<span class="' + (r.idx >= i ? 'on lv' + Math.min(3, Math.max(0, i - 1)) : '') + '">' + t.label + '<small>' + t.xp + '</small></span>'; }).join('') + '</div>' +
        '<p class="enc-verdict lv' + Math.min(3, Math.max(0, r.idx - 1)) + '"><b>' + r.threat + '</b> for ' + n + ' character' + (n === 1 ? '' : 's') + ' of level ' + lvl + ' · <b>' + r.xp + ' XP</b></p></div>';
      var warn = mons.filter(function (x) { return x.lv - lvl > 4 || x.lv - lvl > 2 && mons.length === 1 && false; }).map(function (x) { return x.m.n + ' is level ' + x.lv + ': more than 4 levels above the party, it can kill a character in one or two turns.'; });
      var rows = mons.map(function (x, i) {
        var k = 'e:' + x.x.id + i, open = E.open === k;
        return '<div class="enc-row pf-erow"><span class="enc-count">' + btn('pfeCount', '−', { v: i, d: -1 }, 'btn tiny') + '<b>' + x.count + '</b>' + btn('pfeCount', '+', { v: i, d: 1 }, 'btn tiny') + '</span>' +
          '<button type="button" class="linkbtn enc-name" data-act="pfeOpen" data-v="' + esc(k) + '">' + esc((x.x.adj ? (x.x.adj === 'elite' ? 'Elite ' : 'Weak ') : '') + x.m.n) + '</button><span class="small muted">Lv ' + x.lv + ' · ' + xpFor(x.lv - lvl) * x.count + ' XP</span>' +
          '<select data-pfeadj="' + i + '" aria-label="Elite or weak"><option value="">Normal</option><option value="elite"' + (x.x.adj === 'elite' ? ' selected' : '') + '>Elite</option><option value="weak"' + (x.x.adj === 'weak' ? ' selected' : '') + '>Weak</option></select>' +
          (open ? statBlock(x.m, x.x.adj) : '') + '</div>';
      }).join('');
      var party = '<div class="panel"><h3>Party</h3>' + (parties().length ? '<select data-pfeparty="1"><option value="">— no saved party —</option>' + parties().map(function (x) { return '<option value="' + x.id + '"' + (e.party === x.id ? ' selected' : '') + '>' + esc(x.name || 'Unnamed party') + ' (' + esc(line(x)) + ')</option>'; }).join('') + '</select>' : '<p class="small muted">Tip: add your players on the Party page and choose them here.</p>') +
        (p ? '' : '<div class="row"><div class="field"><span>Characters</span><span class="mm-step">' + btn('pfeSet', '−', { k: 'n', d: -1 }, 'mm-b') + '<b>' + n + '</b>' + btn('pfeSet', '+', { k: 'n', d: 1 }, 'mm-b') + '</span></div><div class="field"><span>Party level</span><span class="mm-step">' + btn('pfeSet', '−', { k: 'lvl', d: -1 }, 'mm-b') + '<b>' + lvl + '</b>' + btn('pfeSet', '+', { k: 'lvl', d: 1 }, 'mm-b') + '</span></div></div>') + '</div>';
      return '<main class="mon-main"><h2>Encounters</h2><div class="enc-wrap">' + pickerHtml(lvl) + '<div>' + party +
        '<div class="panel"><div class="toolbar" style="margin:0"><h3 style="margin:0">Encounter</h3><span class="spacer"></span>' + btn('pfeRun', (root.Icon ? root.Icon('swords') : '') + ' Run it', {}, 'btn primary') + '</div>' + meter +
        (warn.length ? '<ul class="small enc-danger">' + warn.map(function (w) { return '<li>' + esc(w) + '</li>'; }).join('') + '</ul>' : '') +
        (rows || '<p class="muted">Add creatures with + from the list.</p>') + '<div class="toolbar">' + btn('pfeClear', 'Clear', {}, 'btn small') + '</div></div></div></div>' +
        (E.view ? '<div class="enc-modal" role="dialog"><div class="toolbar">' + btn('pfeViewClose', '✕ Close', {}, 'btn') + '</div><h3>' + esc(mon(E.view).n) + ' <small class="muted">Creature ' + mon(E.view).lv + '</small></h3>' + statBlock(mon(E.view)) + '</div>' : '') + '</main>';
    }
    function pickerHtml(lvl) {
      var B = (root.PF2DATA || {}).bestiary || [], q = (E.q || '').toLowerCase(), lo = E.lo === '' ? -1 : +E.lo, hi = E.hi === '' ? 99 : +E.hi;
      var list = B.filter(function (m) { return (!q || m.n.toLowerCase().indexOf(q) >= 0) && m.lv >= lo && m.lv <= hi && (!E.trait || (m.t || []).indexOf(E.trait) >= 0); }).sort(function (a, b) { return a.lv - b.lv || (a.n < b.n ? -1 : 1); });
      var tr = {}; B.forEach(function (m) { (m.t || []).forEach(function (t) { tr[t] = 1; }); });
      var lvls = []; for (var i = -1; i <= 25; i++) lvls.push(i);
      var sel = function (k, label) { return '<label class="mon-f">' + label + ' <select data-pfef="' + k + '"><option value="">Any</option>' + lvls.map(function (l) { return '<option' + (String(E[k]) === String(l) ? ' selected' : '') + '>' + l + '</option>'; }).join('') + '</select></label>'; };
      return '<div class="panel enc-pick"><h3>Creatures</h3><div class="mon-tools"><input type="search" id="pfe-q" data-pfef="q" placeholder="Search creatures…" value="' + esc(E.q) + '">' + sel('lo', 'Level from') + sel('hi', 'to') +
        '<label class="mon-f">Trait <select data-pfef="trait"><option value="">Any</option>' + Object.keys(tr).sort().map(function (t) { return '<option' + (E.trait === t ? ' selected' : '') + '>' + esc(t) + '</option>'; }).join('') + '</select></label>' +
        btn('pfeNear', 'Near the party’s level', { v: lvl }, 'btn small') + '</div><div class="small muted mon-count">' + list.length + ' creatures</div>' +
        '<div class="mon-list enc-list">' + list.slice(0, 200).map(function (m) {
          return '<div class="enc-row"><button type="button" class="btn small" data-act="pfeAdd2" data-v="' + esc(m.id) + '" aria-label="Add ' + esc(m.n) + '">+</button><button type="button" class="linkbtn enc-name" data-act="pfeView" data-v="' + esc(m.id) + '">' + esc(m.n) + '</button><span class="small muted">Lv ' + m.lv + ' · ' + xpFor(m.lv - lvl) + ' XP</span></div>';
        }).join('') + (list.length > 200 ? '<p class="small muted" style="padding:.5rem">Showing 200; search to narrow.</p>' : '') + '</div></div>';
    }
    function startRun() {
      var e = enc(), p = partyById(e.party), list = [], d20 = function () { return 1 + Math.floor(Math.random() * 20); };
      e.mons.forEach(function (x) {
        var m = mon(x.id); if (!m) return;
        var d = x.adj === 'elite' ? 2 : x.adj === 'weak' ? -2 : 0, hp = m.hp + (x.adj === 'elite' ? hpAdj(m.lv) : x.adj === 'weak' ? -hpAdj(m.lv) : 0);
        for (var i = 0; i < x.count; i++) list.push({ k: 'm' + list.length, id: m.id, adj: x.adj || '', n: (x.adj ? (x.adj === 'elite' ? 'Elite ' : 'Weak ') : '') + m.n + (x.count > 1 ? ' ' + (i + 1) : ''), hp: hp, max: hp, ac: (m.ac || 0) + d, init: d20() + (m.per || 0) + d, mod: (m.per || 0) + d, cond: '' });
      });
      if (p) p.m.forEach(function (m) { list.push({ k: 'p' + m.id, n: m.n || 'Player', pc: true, hp: +m.cur || 0, max: +m.hp || 0, ac: +m.ac || 0, init: d20() + (+m.per || 0), mod: +m.per || 0, pm: [p.id, m.id], cond: '' }); });
      list.sort(function (a, b) { return b.init - a.init || (a.pc ? -1 : 1); });
      e.run = { list: list, turn: 0, round: 1 };
    }
    function writeBack(c) { if (!c || !c.pm) return; var p = partyById(c.pm[0]), m = p && p.m.filter(function (x) { return x.id === c.pm[1]; })[0]; if (m) m.cur = c.hp; }
    function runHtml() {
      var run = enc().run;
      return '<div class="panel enc-run"><div class="toolbar" style="margin:0"><h3 style="margin:0">Round ' + run.round + '</h3><span class="spacer"></span>' + btn('pfeNext', 'Next turn ▶', {}, 'btn primary') + btn('pfeStop', 'End fight', {}, 'btn') + '</div>' +
        '<p class="small muted">Initiative is Perception + d20 (players can type their own rolls). Type damage (e.g. 12) or healing with + (e.g. +5).</p>' +
        run.list.map(function (c, i) {
          var pct = c.max ? Math.max(0, Math.round(c.hp / c.max * 100)) : 100, m = c.id && mon(c.id);
          return '<div class="enc-c' + (i === run.turn ? ' turn' : '') + (c.hp <= 0 && c.max ? ' down' : '') + (c.pc ? ' pc' : '') + '">' +
            '<input type="number" class="enc-init" id="pfi-' + c.k + '" data-pfeinit="' + c.k + '" value="' + c.init + '" aria-label="Initiative of ' + esc(c.n) + '">' +
            '<div class="enc-cn">' + (m ? '<button type="button" class="linkbtn enc-name" data-act="pfeView" data-v="' + esc(m.id) + '">' + esc(c.n) + '</button>' : '<b>' + esc(c.n) + '</b>') + ' <span class="small muted">AC ' + c.ac + '</span>' +
            (c.max ? '<div class="hpbar"><span style="width:' + pct + '%"></span></div>' : '') + '<input type="text" class="pf-econd" id="pfc-' + c.k + '" data-pfecond="' + c.k + '" value="' + esc(c.cond || '') + '" placeholder="conditions (frightened 1…)"></div>' +
            '<span class="enc-hp"><b>' + c.hp + '</b>/' + c.max + '</span><input type="text" inputmode="numeric" class="enc-dmg" id="pfd-' + c.k + '" data-pfedmg="' + c.k + '" placeholder="−dmg" aria-label="Damage or healing for ' + esc(c.n) + '">' +
            '<div class="enc-adj">' + ['-10', '-5', '-1', '+1', '+5', '+10'].map(function (v) { return btn('pfeHpRun', v.replace('-', '−'), { v: c.k, d: v }, 'btn small'); }).join('') + '</div></div>';
        }).join('') + '</div>' + (E.view ? '<div class="enc-modal" role="dialog"><div class="toolbar">' + btn('pfeViewClose', '✕ Close', {}, 'btn') + '</div><h3>' + esc(mon(E.view).n) + '</h3>' + statBlock(mon(E.view)) + '</div>' : '');
    }
    function member(id) { var p = curParty(); return p && p.m.filter(function (x) { return x.id === id; })[0]; }
    function runC(k) { var r = enc().run; return r && r.list.filter(function (x) { return x.k === k; })[0]; }
    var actions = {
      pfeNew: function () { var p = { id: uid(), name: '', m: [newMember()] }; parties().push(p); E.team = p.id; E.delParty = false; },
      pfeAdd: function () { var p = curParty(); p.m.push(newMember(p.m[0] ? p.m[0].lvl : 1)); },
      pfeRm: function (v) { var p = curParty(); p.m = p.m.filter(function (x) { return x.id !== v; }); },
      pfeHp: function (v, el) { var m = member(v); if (m) m.cur = Math.max(0, Math.min(+m.hp || 0, (+m.cur || 0) + +el.getAttribute('data-d'))); },
      pfeRest: function () { curParty().m.forEach(function (m) { m.cur = +m.hp || 0; }); },
      pfePlan: function () { var p = curParty(), e = enc(); e.party = p.id; ui.section = 'pf2-enc'; root.scrollTo(0, 0); },
      pfeDelAsk: function () { E.delParty = true; }, pfeDelNo: function () { E.delParty = false; },
      pfeDel: function () { var id = curParty().id; store.pf2Parties = parties().filter(function (x) { return x.id !== id; }); E.team = ''; E.delParty = false; if (enc().party === id) enc().party = ''; },
      pfeSet: function (_, el) { var e = enc(), k = el.getAttribute('data-k'); e[k] = Math.max(1, Math.min(k === 'n' ? 12 : 20, (+e[k] || (k === 'n' ? 4 : 1)) + +el.getAttribute('data-d'))); },
      pfeAdd2: function (v) { var e = enc(), x = e.mons.filter(function (y) { return y.id === v && !y.adj; })[0]; if (x) x.count++; else e.mons.push({ id: v, count: 1, adj: '' }); },
      pfeCount: function (v, el) { var e = enc(), x = e.mons[+v]; if (!x) return; x.count += +el.getAttribute('data-d'); if (x.count < 1) e.mons.splice(+v, 1); },
      pfeClear: function () { enc().mons = []; },
      pfeOpen: function (v) { E.open = E.open === v ? '' : v; },
      pfeView: function (v) { E.view = v; },
      pfeViewClose: function () { E.view = ''; },
      pfeNear: function (v) { E.lo = String(Math.max(-1, +v - 3)); E.hi = String(+v + 3); },
      pfeRun: function () { if (!enc().mons.length) return; startRun(); root.scrollTo(0, 0); },
      pfeNext: function () { var r = enc().run; r.turn++; if (r.turn >= r.list.length) { r.turn = 0; r.round++; } },
      pfeStop: function () { enc().run = null; },
      pfeHpRun: function (v, el) { var c = runC(v); if (c) { c.hp = Math.max(0, Math.min(c.max, c.hp + +el.getAttribute('data-d'))); writeBack(c); } }
    };
    function onInput(t) {
      var a = function (n) { return t.getAttribute(n); };
      if (a('data-pfef') != null) { E[a('data-pfef')] = t.value; return 'render'; }
      if (a('data-pfename')) { curParty().name = t.value; return 'save'; }
      if (a('data-pfem')) { var m = member(a('data-pfem')), k = a('data-f'); if (!m) return 'save'; if (k === 'n' || k === 'cls') m[k] = t.value; else { var was = +m.hp || 0; m[k] = Math.max(k === 'per' ? -5 : 0, Math.round(+t.value) || 0); if (k === 'lvl') m.lvl = Math.max(1, Math.min(20, m.lvl)); if (k === 'hp' && (+m.cur || 0) >= was) m.cur = m.hp; if (k === 'hp') m.cur = Math.min(m.cur, m.hp); } return 'save'; }
      if (a('data-pfeinit')) { var c = runC(a('data-pfeinit')); if (c) c.init = +t.value || 0; return 'save'; }
      if (a('data-pfecond')) { var c2 = runC(a('data-pfecond')); if (c2) c2.cond = t.value; return 'save'; }
      return null;
    }
    function onChange(t) {
      var a = function (n) { return t.getAttribute(n); };
      if (a('data-pfepick')) { E.team = t.value; return 'render'; }
      if (a('data-pfeparty') != null) { enc().party = t.value; return 'render'; }
      if (a('data-pfeadj') != null) { enc().mons[+a('data-pfeadj')].adj = t.value; return 'render'; }
      if (a('data-pfemine') && t.value) { var ch = ((store.pf2 || {}).chars || []).filter(function (c) { return c.id === t.value; })[0]; if (ch && root.PF2) { var d = root.PF2.derive(ch); curParty().m.push({ id: uid(), n: ch.name, cls: d.cls ? d.cls.n : '', lvl: d.level, ac: d.ac.v, hp: d.hp.max, cur: d.hp.max, per: d.perception.v }); } return 'render'; }
      if (a('data-pfeinit')) { var r = enc().run, k = r.list[r.turn] && r.list[r.turn].k; r.list.sort(function (x, y) { return y.init - x.init; }); r.turn = Math.max(0, r.list.map(function (x) { return x.k; }).indexOf(k)); return 'render'; }
      if (a('data-pfedmg')) { var c = runC(a('data-pfedmg')), v = String(t.value).trim(); if (c && /^[+-]?\d+$/.test(v)) { var n = parseInt(v, 10); c.hp = Math.max(0, Math.min(c.max, v[0] === '+' ? c.hp + n : c.hp - Math.abs(n))); writeBack(c); } return 'render'; }
      if (a('data-pfem') || a('data-pfename') || a('data-pfef') != null) return 'render';
      return null;
    }
    return { html: html, partyHtml: partyHtml, actions: actions, onInput: onInput, onChange: onChange };
  };
  root.PF2Enc.rate = rate; root.PF2Enc.xpFor = xpFor;
})(typeof window !== 'undefined' ? window : globalThis);
