// Monsters section: browse the 2014 SRD monsters, read their stat blocks, roll their attacks,
// and keep monsters of your own. The monster list (data/monsters.js) loads the first time the section opens.
(function (root) {
  'use strict';
  var SIZES = ['Tiny', 'Small', 'Medium', 'Large', 'Huge', 'Gargantuan'];
  var AB = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'];
  var CRS = [0, 0.125, 0.25, 0.5].concat(Array.apply(null, Array(30)).map(function (_, i) { return i + 1; }));
  var XP = { 0: 10, 0.125: 25, 0.25: 50, 0.5: 100, 1: 200, 2: 450, 3: 700, 4: 1100, 5: 1800, 6: 2300, 7: 2900, 8: 3900, 9: 5000, 10: 5900, 11: 7200, 12: 8400, 13: 10000, 14: 11500, 15: 13000, 16: 15000, 17: 18000, 18: 20000, 19: 22000, 20: 25000, 21: 33000, 22: 41000, 23: 50000, 24: 62000, 25: 75000, 26: 90000, 27: 105000, 28: 120000, 29: 135000, 30: 155000 };
  function crText(c) { return c === 0.125 ? '1/8' : c === 0.25 ? '1/4' : c === 0.5 ? '1/2' : String(c); }
  function mod(s) { return Math.floor((s - 10) / 2); }
  function fmt(n) { return (n >= 0 ? '+' : '') + n; }
  function pbFor(cr) { return cr < 5 ? 2 : cr < 9 ? 3 : cr < 13 ? 4 : cr < 17 ? 5 : cr < 21 ? 6 : cr < 25 ? 7 : cr < 29 ? 8 : 9; }

  // Dice: "2d6 + 3", "1d20+5", "d8"
  function roll(expr) {
    var total = 0, parts = [], ok = false;
    String(expr).replace(/\s+/g, '').replace(/([+-]?)(\d*)d(\d+)|([+-]?)(\d+)/g, function (m, s1, n, f, s2, k) {
      if (f) {
        var sign = s1 === '-' ? -1 : 1, cnt = Math.min(100, +(n || 1)), rs = [];
        for (var i = 0; i < cnt; i++) rs.push(1 + Math.floor(Math.random() * +f));
        var sum = rs.reduce(function (a, b) { return a + b; }, 0) * sign; total += sum; parts.push((sign < 0 ? '−' : '') + '[' + rs.join(', ') + ']'); ok = true;
      } else if (k) { var v = (s2 === '-' ? -1 : 1) * +k; total += v; parts.push(v < 0 ? '− ' + (-v) : '+ ' + v); }
      return m;
    });
    return ok ? { total: total, detail: parts.join(' ') } : null;
  }

  root.MonsterUI = function (api) {
    var esc = api.esc, btn = api.btn, ui = api.ui, store = api.store;
    var M = ui.mon = ui.mon || { q: '', type: '', size: '', crMin: '', crMax: '', sort: 'name', open: '', view: 'list' };

    function all() {
      var mine = (store.myMonsters || []).map(function (m) { return Object.assign({ mine: true }, m); });
      return mine.concat((root.DND && root.DND.monsters) || []);
    }
    function find(id) { return all().filter(function (m) { return m.id === id; })[0]; }
    function loaded() { return !!(root.DND && root.DND.monsters); }
    function load(done) {
      if (loaded() || M.loading) return;
      M.loading = true;
      var s = document.createElement('script');
      s.src = 'data/monsters.js';
      s.onload = function () { M.loading = false; done(); };
      s.onerror = function () { M.loading = false; M.loadError = true; done(); };
      document.head.appendChild(s);
    }

    // turn "+14 to hit" and "(2d10 + 8)" in a description into roll buttons
    function rollable(text, who) {
      return esc(text).replace(/([+−-]\d+) to hit/g, function (m, b) {
        var n = b.replace('−', '-');
        return '<button type="button" class="roll" data-act="monRoll" data-v="1d20' + (n[0] === '-' ? n : '+' + n.replace('+', '')) + '" data-label="' + esc(who) + ': attack">' + b + ' to hit</button>';
      }).replace(/\((\d+d\d+(?:\s*[+−-]\s*\d+)?)\)/g, function (m, e) {
        return '(<button type="button" class="roll" data-act="monRoll" data-v="' + e.replace(/\s+/g, '').replace('−', '-') + '" data-label="' + esc(who) + ': damage">' + e + '</button>)';
      }).replace(/DC (\d+)/g, '<b>DC $1</b>').replace(/\n/g, '<br>');
    }
    function blocks(title, list, who) {
      if (!list || !list.length) return '';
      return (title ? '<h4 class="sb-h">' + title + '</h4>' : '') + list.map(function (b) {
        return '<p class="sb-p"><b><i>' + esc(b[0]) + '.</i></b> ' + rollable(b[1], who) + '</p>';
      }).join('');
    }
    function statBlock(m) {
      var line = function (k, v) { return v ? '<div><b>' + k + '</b> ' + esc(v) + '</div>' : ''; };
      var crx = m.cr != null ? crText(+m.cr) + ' (' + (m.xp != null ? m.xp : XP[+m.cr] || 0).toLocaleString('en') + ' XP)' : '';
      var who = m.n || 'Monster';
      var h = '<article class="statblock"><h2>' + esc(who) + (m.mine ? ' <span class="tag">yours</span>' : '') + '</h2>' +
        '<div class="sb-sub">' + esc([m.size, (m.type || '') + (m.sub ? ' (' + m.sub + ')' : '')].filter(Boolean).join(' ') + (m.al ? ', ' + m.al : '')) + '</div><hr>' +
        '<div><b>Armor Class</b> ' + esc(m.ac || '') + '</div>' +
        '<div><b>Hit Points</b> ' + (m.hp || 0) + (m.hd ? ' (<button type="button" class="roll" data-act="monRoll" data-v="' + esc(String(m.hd).replace(/\s+/g, '')) + '" data-label="' + esc(who) + ': hit points">' + esc(String(m.hd).replace(/([+-])/, ' $1 ')) + '</button>)' : '') + '</div>' +
        line('Speed', m.sp) + '<hr><div class="sb-abil">' + AB.map(function (a, i) {
          var s = +(m.ab || [])[i] || 10;
          return '<div><b>' + a + '</b><button type="button" class="roll" data-act="monRoll" data-v="1d20' + (mod(s) >= 0 ? '+' : '') + mod(s) + '" data-label="' + esc(who) + ': ' + a + ' check">' + s + ' (' + fmt(mod(s)) + ')</button></div>';
        }).join('') + '</div><hr>' +
        line('Saving Throws', m.sv) + line('Skills', m.sk) + line('Damage Vulnerabilities', m.vu) + line('Damage Resistances', m.re) +
        line('Damage Immunities', m.im) + line('Condition Immunities', m.ci) + line('Senses', m.se) + line('Languages', m.lang) +
        (crx ? '<div class="sb-cr"><span><b>Challenge</b> ' + esc(crx) + '</span><span><b>Proficiency Bonus</b> ' + fmt(m.pb || pbFor(+m.cr || 0)) + '</span></div>' : '') + '<hr>' +
        blocks('', m.tr, who) + blocks('Actions', m.act, who) + blocks('Reactions', m.rea, who);
      if (m.leg && m.leg.length) h += '<h4 class="sb-h">Legendary Actions</h4><p class="sb-p">The ' + esc(who.toLowerCase()) + ' can take 3 legendary actions, choosing from the options below. Only one legendary action can be used at a time and only at the end of another creature’s turn. It regains spent legendary actions at the start of its turn.</p>' + blocks('', m.leg, who);
      if (m.desc) h += '<p class="small muted sb-desc">' + esc(m.desc) + '</p>';
      if (m.notes) h += '<p class="small sb-desc">' + esc(m.notes).replace(/\n/g, '<br>') + '</p>';
      return h + '</article>';
    }

    function filtered() {
      var q = M.q.toLowerCase(), lo = M.crMin === '' ? -1 : +M.crMin, hi = M.crMax === '' ? 99 : +M.crMax;
      var list = all().filter(function (m) {
        var cr = +m.cr || 0;
        return (!q || (m.n + ' ' + m.type + ' ' + (m.sub || '')).toLowerCase().indexOf(q) >= 0) && (!M.type || m.type === M.type) &&
          (!M.size || m.size === M.size) && cr >= lo && cr <= hi && (M.sort !== 'mine' || m.mine);
      });
      if (M.sort === 'cr') list.sort(function (a, b) { return (+a.cr || 0) - (+b.cr || 0) || (a.n < b.n ? -1 : 1); });
      else list.sort(function (a, b) { return a.n < b.n ? -1 : 1; });
      return list;
    }
    function listHtml() {
      var types = []; all().forEach(function (m) { if (m.type && types.indexOf(m.type) < 0) types.push(m.type); }); types.sort();
      var sel = function (key, label, opts) {
        return '<label class="mon-f">' + label + ' <select data-mon="' + key + '"><option value="">Any</option>' + opts.map(function (o) {
          var v = Array.isArray(o) ? o[0] : o, t = Array.isArray(o) ? o[1] : o;
          return '<option value="' + esc(v) + '"' + (String(M[key]) === String(v) ? ' selected' : '') + '>' + esc(t) + '</option>';
        }).join('') + '</select></label>';
      };
      var list = filtered();
      var h = '<div class="mon-tools"><input type="search" id="mon-q" data-mon="q" placeholder="Search monsters…" value="' + esc(M.q) + '">' +
        sel('type', 'Type', types.map(function (t) { return [t, t.charAt(0).toUpperCase() + t.slice(1)]; })) + sel('size', 'Size', SIZES) +
        sel('crMin', 'CR from', CRS.map(function (c) { return [c, crText(c)]; })) + sel('crMax', 'to', CRS.map(function (c) { return [c, crText(c)]; })) +
        '<label class="mon-f">Sort <select data-mon="sort">' + [['name', 'Name'], ['cr', 'Challenge'], ['mine', 'Only mine']].map(function (o) { return '<option value="' + o[0] + '"' + (M.sort === o[0] ? ' selected' : '') + '>' + o[1] + '</option>'; }).join('') + '</select></label>' +
        '</div><div class="small muted mon-count">' + list.length + ' monster' + (list.length === 1 ? '' : 's') + (M.q || M.type || M.size || M.crMin !== '' || M.crMax !== '' ? ' · ' + btn('monClear', 'clear filters', {}, 'linkbtn') : '') + '</div>';
      h += '<div class="mon-list" role="list">' + list.map(function (m) {
        return '<button type="button" role="listitem" class="mon-row' + (M.open === m.id ? ' on' : '') + '" data-act="monOpen" data-v="' + esc(m.id) + '"><span class="mon-cr">CR ' + crText(+m.cr || 0) + '</span><span class="mon-name">' + esc(m.n) + (m.mine ? ' <span class="tag">yours</span>' : '') + '</span><span class="mon-meta">' + esc(m.size + ' ' + m.type) + '</span></button>';
      }).join('') + (list.length ? '' : '<p class="muted" style="padding:.8rem">No monster matches.</p>') + '</div>';
      return h;
    }

    // ----- your own monsters -----
    function editorHtml(m) {
      var f = function (k, label, type, extra) { return '<label>' + label + '<input' + (type ? ' type="' + type + '"' : '') + ' id="mm-' + k + '" data-mymon="' + k + '" value="' + esc(m[k] == null ? '' : m[k]) + '"' + (extra || '') + '></label>'; };
      var ta = function (k, label, ph) { return '<label class="wide">' + label + '<textarea id="mm-' + k + '" data-mymon="' + k + '" rows="4" placeholder="' + esc(ph) + '">' + esc(m[k + 'Text'] || '') + '</textarea></label>'; };
      return '<article class="statblock editing"><h2>Edit your monster</h2><div class="mm-grid">' + f('n', 'Name') +
        '<label>Size<select data-mymon="size">' + SIZES.map(function (s) { return '<option' + (m.size === s ? ' selected' : '') + '>' + s + '</option>'; }).join('') + '</select></label>' +
        f('type', 'Type (e.g. fiend)') + f('al', 'Alignment') + f('ac', 'Armor Class (e.g. 15 (chain shirt))') + f('hp', 'Hit points', 'number', ' min="1"') + f('hd', 'Hit dice (e.g. 8d8+16)') + f('sp', 'Speed') +
        '<label>Challenge<select data-mymon="cr">' + CRS.map(function (c) { return '<option value="' + c + '"' + (+m.cr === c ? ' selected' : '') + '>' + crText(c) + '</option>'; }).join('') + '</select></label>' +
        AB.map(function (a, i) { return '<label>' + a + '<input type="number" min="1" max="30" id="mm-ab' + i + '" data-mymon="ab' + i + '" value="' + ((m.ab || [])[i] || 10) + '"></label>'; }).join('') +
        f('sv', 'Saving throws') + f('sk', 'Skills') + f('re', 'Resistances') + f('im', 'Immunities') + f('se', 'Senses') + f('lang', 'Languages') +
        ta('tr', 'Traits', 'One per line: Name. What it does.') + ta('act', 'Actions', 'Bite. Melee Weapon Attack: +5 to hit, reach 5 ft., one target. Hit: 7 (1d8 + 3) piercing damage.') +
        ta('rea', 'Reactions', 'One per line') + ta('leg', 'Legendary actions', 'One per line') +
        '<label class="wide">Notes<textarea id="mm-notes" data-mymon="notes" rows="2">' + esc(m.notes || '') + '</textarea></label></div>' +
        '<div class="toolbar">' + btn('monSave', 'Save', {}, 'btn primary') + btn('monDelete', 'Delete', { v: m.id }, 'btn danger') + '</div><p class="small muted">Attacks written like the example (“+5 to hit”, “(1d8 + 3)”) get roll buttons.</p></article>';
    }
    function parseLines(t) {
      return String(t || '').split('\n').map(function (l) { return l.trim(); }).filter(Boolean).map(function (l) {
        var i = l.indexOf('. '); return i > 0 && i < 60 ? [l.slice(0, i), l.slice(i + 2)] : ['', l];
      });
    }
    function mineById(id) { return (store.myMonsters || []).filter(function (m) { return m.id === id; })[0]; }
    function setField(m, k, v) {
      var i = /^ab(\d)$/.exec(k);
      if (i) { m.ab = m.ab || [10, 10, 10, 10, 10, 10]; m.ab[+i[1]] = Math.max(1, Math.min(30, Math.round(+v) || 10)); }
      else if (/^(tr|act|rea|leg)$/.test(k)) { m[k + 'Text'] = v; m[k] = parseLines(v); }
      else if (k === 'hp') m.hp = Math.max(1, Math.round(+v) || 1);
      else if (k === 'cr') { m.cr = +v; m.xp = XP[+v]; m.pb = pbFor(+v); }
      else m[k] = v;
    }

    function html() {
      if (!loaded() && !M.loadError) { load(api.render); return '<h2>Monsters</h2><p class="muted">Loading monsters…</p>'; }
      var open = M.open && find(M.open), editing = M.edit && mineById(M.edit);
      var h = '<div class="mon-head"><h2>Monsters</h2><span class="small muted">' + ((root.DND.monsters || []).length) + ' monsters from the 2014 rules (SRD 5.1)</span>' + btn('monNew', '+ Add your own monster', {}, 'btn') + '</div>';
      if (M.loadError) h += '<p class="notice">The monster list couldn’t load. Check your connection and open Monsters again.</p>';
      var right = editing ? editorHtml(editing) : open ? statBlock(open) : '<div class="statblock empty"><p class="muted">Pick a monster to see its stat block. Tap any bonus or dice in a stat block to roll it.</p></div>';
      h += '<div class="mon-wrap' + (open || editing ? ' has-open' : '') + '"><div class="mon-left">' + listHtml() + '</div><div class="mon-right">' +
        (open || editing ? '<div class="toolbar mon-back">' + btn('monBack', '← All monsters', {}, 'btn') + (open && open.mine && !editing ? btn('monEdit', 'Edit', { v: open.id }, 'btn') : '') + (open && !open.mine ? btn('monCopy', 'Copy as my own', { v: open.id }, 'btn') : '') + '</div>' : '') + right + '</div></div>';
      if (M.roll) h += '<div class="roll-toast" role="status"><b>' + esc(M.roll.label) + '</b> <span class="roll-total">' + M.roll.total + '</span><span class="small">' + esc(M.roll.expr + ' → ' + M.roll.detail) + '</span>' + btn('monRollClose', '✕', {}, 'btn small') + '</div>';
      h += '<p class="small muted mon-legal">Monster stat blocks: System Reference Document 5.1 by Wizards of the Coast LLC, licensed under <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener">CC-BY-4.0</a>. Monsters from other books (Monster Manual creatures outside the SRD, Volo’s, Mordenkainen’s…) aren’t included: add them with “Add your own monster”.</p>';
      return h;
    }

    var actions = {
      monOpen: function (v) { M.open = v; M.edit = ''; M.scrollTop = true; },
      monBack: function () { M.open = ''; M.edit = ''; },
      monClear: function () { M.q = ''; M.type = ''; M.size = ''; M.crMin = ''; M.crMax = ''; },
      monRoll: function (v, el) { var r = roll(v); if (r) M.roll = { label: el.getAttribute('data-label') || 'Roll', expr: v, total: r.total, detail: r.detail }; },
      monRollClose: function () { M.roll = null; },
      monNew: function () {
        store.myMonsters = store.myMonsters || [];
        var m = { id: 'my-' + Date.now().toString(36), n: 'New monster', size: 'Medium', type: 'humanoid', al: 'any alignment', ac: '12', hp: 11, hd: '2d8+2', sp: '30 ft.', cr: 0.5, xp: 100, pb: 2, ab: [10, 12, 12, 10, 10, 10], se: 'passive Perception 10', lang: '—' };
        store.myMonsters.unshift(m); M.open = m.id; M.edit = m.id;
      },
      monEdit: function (v) { M.edit = v; M.open = v; },
      monCopy: function (v) {
        var src = find(v); if (!src) return;
        var m = JSON.parse(JSON.stringify(src)); m.id = 'my-' + Date.now().toString(36); m.n = src.n + ' (mine)'; delete m.mine;
        ['tr', 'act', 'rea', 'leg'].forEach(function (k) { m[k + 'Text'] = (m[k] || []).map(function (b) { return (b[0] ? b[0] + '. ' : '') + b[1]; }).join('\n'); });
        store.myMonsters = store.myMonsters || []; store.myMonsters.unshift(m); M.open = m.id; M.edit = m.id;
      },
      monSave: function () { M.edit = ''; },
      monDelete: function (v) { store.myMonsters = (store.myMonsters || []).filter(function (m) { return m.id !== v; }); M.edit = ''; M.open = ''; }
    };
    // typing and choosing in the filters and the editor
    function onInput(t) {
      var k = t.getAttribute('data-mon');
      if (k) { M[k] = t.value; return 'render'; }
      var f = t.getAttribute('data-mymon');
      if (f) { var m = mineById(M.edit); if (m) setField(m, f, t.value); return t.tagName === 'SELECT' ? 'render' : 'save'; }
      return null;
    }
    return { html: html, actions: actions, onInput: onInput, roll: roll };
  };
  root.MonsterUI.roll = roll;
})(typeof window !== 'undefined' ? window : globalThis);
