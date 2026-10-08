// UI for Character Forge. All rules live in rules.js; this file only draws and records picks.
(function () {
  'use strict';
  var D = window.DND, R = window.Rules, AB = D.abilities;
  var KEY = 'character-forge.v1';
  var STEPS = [['lineage', 'Lineage'], ['class', 'Class'], ['abilities', 'Abilities'], ['background', 'Background'], ['spells', 'Spells'], ['equipment', 'Equipment'], ['items', 'Items'], ['appearance', 'Appearance'], ['details', 'Details'], ['sheet', 'Sheet']];
  var TAGS = [['official', 'Official'], ['setting', 'Setting books'], ['ua', 'Unearthed Arcana'], ['homebrew', 'Homebrew']];

  var store = { chars: [], current: '', detail: true, filters: { official: true, setting: true, ua: true, homebrew: true } };
  var ui = { step: 'lineage', q: {}, spellLevel: 0, confirmDelete: false, group: '', clsTab: '', casterTab: '', itemTab: 'magic', rarity: '', itemType: '', gearCat: '' };
  var ch, d; // current character and its derived sheet

  // ---------- storage ----------
  function load() {
    try {
      var raw = window.localStorage.getItem(KEY);
      if (raw) { var s = JSON.parse(raw); if (s && Array.isArray(s.chars)) store = Object.assign(store, s); }
    } catch (e) { /* storage unavailable: run in memory */ }
    store.chars = store.chars.map(normalize);
    if (!store.chars.length) store.chars.push(R.newChar());
    if (!byId(store.current)) store.current = store.chars[0].id;
  }
  var saveTimer;
  // Undo / redo: every saved change keeps a copy of the characters as they were just before.
  var undoStack = [], redoStack = [], lastSnap = null, UNDO_MAX = 40;
  function snapshot() { return JSON.stringify({ chars: store.chars, current: store.current }); }
  function remember() {
    var now = snapshot();
    if (lastSnap !== null && now !== lastSnap) { undoStack.push(lastSnap); if (undoStack.length > UNDO_MAX) undoStack.shift(); redoStack = []; }
    lastSnap = now;
  }
  function restore(snap) {
    var o = JSON.parse(snap);
    store.chars = o.chars.map(normalize); store.current = byId(o.current) ? o.current : store.chars[0].id;
    lastSnap = snapshot(); ui.confirmDelete = false; ui.import5e = null; ui.import5eDone = null;
  }
  function undo() { if (!undoStack.length) return false; flushTyping(); redoStack.push(snapshot()); restore(undoStack.pop()); }
  function redo() { if (!redoStack.length) return false; flushTyping(); undoStack.push(snapshot()); restore(redoStack.pop()); }
  function flushTyping() { if (saveTimer) { clearTimeout(saveTimer); remember(); } }
  function saveNow() {
    clearTimeout(saveTimer); saveTimer = null;
    remember(); syncUndoButtons();
    try { window.localStorage.setItem(KEY, JSON.stringify(store)); } catch (e) { /* storage unavailable */ }
  }
  function syncUndoButtons() {
    var u = document.querySelector('[data-act="undo"]'), r = document.querySelector('[data-act="redo"]');
    if (u) u.disabled = !undoStack.length; if (r) r.disabled = !redoStack.length;
  }
  function save() { clearTimeout(saveTimer); saveTimer = setTimeout(saveNow, 300); } // typing: batch the writes
  window.addEventListener('pagehide', saveNow);
  function normalize(c) {
    c = R.upgrade(c);
    var n = R.newChar(), o = Object.assign(n, c);
    o.base = Object.assign({ STR: 8, DEX: 8, CON: 8, INT: 8, WIS: 8, CHA: 8 }, c.base || {});
    o.notes = Object.assign(R.newChar().notes, c.notes || {});
    o.spells = c.spells || {};
    o.picks = c.picks || {}; o.asi = c.asi || {}; o.eq = c.eq || {}; o.weapons = c.weapons || [];
    o.money = Object.assign({ pp: 0, gp: 0, ep: 0, sp: 0, cp: 0 }, c.money || {});
    return o;
  }
  function byId(id) { return store.chars.filter(function (c) { return c.id === id; })[0]; }

  // ---------- helpers ----------
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function tag(t) { return t && t !== 'official' ? ' <span class="tag ' + t + '">' + (t === 'ua' ? 'UA' : t) + '</span>' : ''; }
  function ok(t) { return R.tagOk(t, store.filters); }
  function match(q, s) { return !q || s.toLowerCase().indexOf(q.toLowerCase()) >= 0; }
  function btn(act, label, attrs, cls) { return '<button type="button" class="' + (cls || 'btn') + '" data-act="' + act + '"' + data(attrs) + '>' + label + '</button>'; }
  function data(o) { var s = ''; for (var k in o || {}) s += ' data-' + k + '="' + esc(o[k]) + '"'; return s; }
  function search(id, ph) { return '<input type="search" id="q-' + id + '" data-q="' + id + '" placeholder="' + ph + '" value="' + esc(ui.q[id] || '') + '">'; }
  function title(c) { return c.name || 'Unnamed character'; }
  function classLine(dd, withSub) {
    return dd.classes.map(function (e) { return e.cls.name + ' ' + e.level + (withSub && e.sc ? ' (' + e.sc.name + ')' : ''); }).join(' / ');
  }
  function summaryLine(c, dd) {
    var parts = [];
    if (dd.L) parts.push(dd.L.subName && dd.L.subName !== 'Standard' ? dd.L.subName : dd.L.name);
    if (dd.classes.length) parts.push(classLine(dd, true));
    return parts.join(' · ') || 'Nothing chosen yet';
  }
  function entry(id) { return ch.classes.filter(function (e) { return e.cls === id; })[0]; }
  function clearClass(id) {
    ['cls.' + id + '.', 'sc.' + id + '.', 'asi.' + id + '.'].forEach(clearPicks);
    for (var k in ch.asi) if (k.indexOf('asi.' + id + '.') === 0) delete ch.asi[k];
    delete ch.spells[id];
  }
  function clearPicks(prefix) { for (var k in ch.picks) if (k.indexOf(prefix) === 0) delete ch.picks[k]; }

  // ---------- choice widgets ----------
  function choiceHtml(c) {
    var head = '<div class="choice-head"><span>' + esc(c.label) + '</span><span class="count">' + c.picked.length + ' / ' + c.count + '</span></div>';
    var body;
    var rich = c.options.some(function (o) { return o.t; });
    if (c.select || (c.count === 1 && c.options.length > 12 && !rich)) {
      var lastG = null;
      body = '<select data-pick="' + esc(c.key) + '"><option value="">— choose —</option>' + c.options.map(function (o) {
        var pre = '';
        if (o.group && o.group !== lastG) { pre = (lastG ? '</optgroup>' : '') + '<optgroup label="' + esc(o.group) + '">'; lastG = o.group; }
        return pre + '<option value="' + esc(o.v) + '"' + (c.picked[0] === o.v ? ' selected' : '') + (o.disabled ? ' disabled' : '') + '>' + esc(o.label) + (o.disabled && o.why ? ' — ' + esc(o.why) : '') + '</option>';
      }).join('') + (lastG ? '</optgroup>' : '') + '</select>';
      var sel = c.options.filter(function (o) { return o.v === c.picked[0]; })[0];
      if (sel && sel.t) body += '<p class="small">' + esc(sel.t) + '</p>';
    } else if (rich) {
      var q = ui.q[c.key] || '';
      var rows = c.options.filter(function (o) { return c.picked.indexOf(o.v) >= 0 || match(q, o.label + ' ' + o.t); }).map(function (o) {
        var on = c.picked.indexOf(o.v) >= 0;
        return '<button type="button" class="opt' + (on ? ' on' : '') + '" data-act="pick" data-key="' + esc(c.key) + '" data-v="' + esc(o.v) + '"' + (o.disabled && !on ? ' disabled' : '') + '><b>' + esc(o.label) + '</b>' + (o.disabled && !on && o.why ? ' <small class="muted">— ' + esc(o.why) + '</small>' : '') +
          (o.pre ? ' <small class="muted">— requires ' + esc(o.pre) + '</small>' : '') + '<span>' + esc(o.t) + '</span></button>';
      }).join('');
      body = (c.options.length > 12 ? '<div class="toolbar">' + search(c.key, 'Filter…') + '</div>' : '') + '<div class="optlist">' + rows + '</div>';
    } else {
      var lastPG = null;
      body = '<div class="pills">' + c.options.map(function (o) {
        var on = c.picked.indexOf(o.v) >= 0, pre = '';
        if (o.group && o.group !== lastPG) { pre = '<span class="pill-group">' + esc(o.group) + '</span>'; lastPG = o.group; }
        return pre + '<button type="button" class="pill' + (on ? ' on' : '') + '" data-act="pick" data-key="' + esc(c.key) + '" data-v="' + esc(o.v) + '"' + (o.disabled && !on ? ' disabled title="' + esc(o.why ? 'Already have it: ' + o.why : 'Not available') + '"' : '') + '>' + esc(o.label) + '</button>';
      }).join('') + '</div>';
    }
    var greyed = {};
    c.options.forEach(function (o) { if (o.disabled && o.why && c.picked.indexOf(o.v) < 0) (greyed[o.why] = greyed[o.why] || []).push(o.label); });
    var why = Object.keys(greyed).map(function (w) { return '<b>' + esc(greyed[w].join(', ')) + '</b> ' + esc(w); });
    if (why.length) body += '<p class="small muted greyed">Greyed out: ' + why.join('; ') + '.</p>';
    return '<div class="choice' + (c.missing ? ' todo' : '') + '">' + head + body + '</div>';
  }
  function choicesFor(step, filter) {
    return d.choices.filter(function (c) { return c.step === step && (!filter || filter(c)); }).map(choiceHtml).join('');
  }
  function featureHtml(f) {
    var t = store.detail && f.long ? f.long : f.t;
    return '<div class="feature"><b>' + esc(f.n) + '</b>' + (f.l ? '<span class="lv">level ' + f.l + '</span>' : '') + (t ? '<div>' + esc(t) + '</div>' : '') + '</div>';
  }
  function featSlotHtml(slot) {
    var h = '<div class="panel"><h3>' + esc(slot.label) + (slot.asi ? ' — improvement' : '') + '</h3>';
    if (slot.asi) h += '<div class="pills">' +
      btn('asimode', 'Ability scores (+2, or +1 and +1)', { slot: slot.slot, v: 'asi' }, 'pill' + (slot.mode === 'asi' ? ' on' : '')) +
      btn('asimode', 'Feat', { slot: slot.slot, v: 'feat' }, 'pill' + (slot.mode === 'feat' ? ' on' : '')) + '</div>';
    if (slot.fixed && slot.feat) h += '<p><b>' + esc(slot.feat.n) + '</b> — ' + esc(slot.feat.t) + '</p>';
    h += d.choices.filter(function (c) { return c.asiSlot === slot.slot || c.key.indexOf(slot.slot + '.') === 0; }).map(choiceHtml).join('');
    if (slot.feat && slot.feat.pre) h += '<p class="small muted">Prerequisite: ' + esc(slot.feat.pre) + ' (not checked automatically).</p>';
    return h + '</div>';
  }
  function slotChoice(c) { return /^(asi\.[\w-]+\.\d+|linfeat\d+|bgfeat\w*)\./.test(c.key); }

  // ---------- steps ----------
  function stepLineage() {
    var q = ui.q.lineage || '';
    var groups = [];
    D.lineages.forEach(function (l) { if (groups.indexOf(l.group) < 0) groups.push(l.group); });
    var list = D.lineages.filter(function (l) {
      return (ok(l.tag) || l.versions.some(function (v) { return v.tag && ok(v.tag); })) && match(q, l.name) && (!ui.group || l.group === ui.group);
    });
    var h = '<h2>Lineage</h2><p class="muted">Your character\'s people: size, speed, ability bonuses and inborn traits.</p>' +
      '<div class="toolbar">' + search('lineage', 'Search lineages…') + '<select data-ui="group"><option value="">All groups</option>' +
      groups.map(function (g) { return '<option' + (ui.group === g ? ' selected' : '') + '>' + esc(g) + '</option>'; }).join('') + '</select><span class="muted small">' + list.length + ' shown</span></div>' +
      '<div class="grid scroll">' + list.map(function (l) {
        return '<button type="button" class="card' + (ch.lineage === l.id ? ' on' : '') + '" data-act="lineage" data-v="' + esc(l.id) + '"><b>' + esc(l.name) + '</b><small>' + esc(l.group) + tag(l.tag) + '</small></button>';
      }).join('') + '</div>';
    if (!d.lin) return h + '<p class="notice">Pick a lineage to see its traits.</p>';
    var lin = d.lin, v = lin.versions[ch.version] || lin.versions[0], L = d.L;
    h += '<div class="panel"><h3>' + esc(lin.name) + '</h3>';
    var vers = lin.versions.map(function (x, i) { return [x, i]; }).filter(function (x) { return ok(x[0].tag || lin.tag) || x[1] === ch.version; });
    if (vers.length > 1) h += '<div class="field"><span>Version</span><div class="pills">' + vers.map(function (x) {
      return btn('version', esc(x[0].n) + ' <small class="muted">' + esc(x[0].s) + '</small>', { v: x[1] }, 'pill' + (x[1] === ch.version ? ' on' : ''));
    }).join('') + '</div></div>';
    if (v.subs) h += '<div class="field"><span>Subrace or variant</span><div class="pills">' + v.subs.map(function (s, i) {
      return ok(s.tag || 'official') || i === ch.sub ? btn('sub', esc(s.n) + tag(s.tag), { v: i }, 'pill' + (i === ch.sub ? ' on' : '')) : '';
    }).join('') + '</div></div>';
    var asi = L.a === 'flex' ? 'your choice' : (Object.keys(L.a).map(function (k) { return k + ' +' + L.a[k]; }).join(', ') || 'see choices');
    h += '<div class="facts"><span><b>Source</b> ' + esc(L.source) + '</span><span><b>Ability scores</b> ' + asi + '</span><span><b>Size</b> ' + esc(L.sz || 'Medium') + '</span><span><b>Speed</b> ' + L.sp + ' ft</span>' +
      (L.dv ? '<span><b>Darkvision</b> ' + L.dv + ' ft</span>' : '') + (L.lang.length ? '<span><b>Languages</b> ' + esc(L.lang.join(', ')) + '</span>' : '') +
      (L.res.length ? '<span><b>Resistance</b> ' + esc(L.res.join(', ')) + '</span>' : '') + '</div>';
    if (L.a === 'flex') h += '<div class="field"><span>Ability score increase</span><div class="pills">' +
      btn('flex', '+2 and +1', { v: '21' }, 'pill' + (ch.flexMode !== '111' ? ' on' : '')) + btn('flex', '+1, +1 and +1', { v: '111' }, 'pill' + (ch.flexMode === '111' ? ' on' : '')) + '</div></div>';
    h += choicesFor('lineage', function (c) { return !slotChoice(c); });
    h += '<h3>Traits</h3>' + (L.tr.length ? L.tr.map(function (t) { return featureHtml({ n: t[0], t: t[1] }); }).join('') : '<p class="muted">No special traits.</p>') + '</div>';
    h += d.featSlots.filter(function (s) { return s.step === 'lineage'; }).map(featSlotHtml).join('');
    return h;
  }

  function stepClass() {
    var E = d.classes, total = d.level, used = E.map(function (e) { return e.id; });
    var h = '<h2>Class</h2><p class="muted">Your character\'s calling. Take every level in one class, or split up to 20 levels across several.</p>';
    if (E.length <= 1) h += '<div class="grid">' + D.classes.filter(function (c) { return ok(c.tag) || used.indexOf(c.id) >= 0; }).map(function (c) {
      return '<button type="button" class="card' + (used[0] === c.id ? ' on' : '') + '" data-act="cls" data-v="' + c.id + '"><b>' + esc(c.name) + '</b><small>d' + c.hitDie + ' · ' + c.saves.join(' & ') + ' saves' + tag(c.tag) + '</small></button>';
    }).join('') + '</div>';
    if (!E.length) return h + '<p class="notice">Pick a class to continue.</p>';
    h += '<div class="panel"><h3>Levels</h3><div class="tablewrap"><table><tr><th>Class</th><th>Level</th><th></th></tr>' + E.map(function (e, i) {
      var max = 20 - (total - e.level);
      return '<tr><td><b>' + esc(e.cls.name) + '</b>' + (E.length > 1 && e.first ? ' <span class="tag">starting class</span>' : '') + (e.sc ? ' <span class="muted small">' + esc(e.sc.name) + '</span>' : '') + '</td>' +
        '<td><input type="number" min="1" max="' + max + '" id="lvl-' + e.id + '" data-clslevel="' + e.id + '" value="' + e.level + '">' +
        (E.length === 1 ? ' <input type="range" min="1" max="20" data-clslevel="' + e.id + '" value="' + e.level + '" aria-label="Level" style="vertical-align:middle;width:min(16rem,40vw)">' : '') + '</td>' +
        '<td>' + (E.length > 1 ? btn('rmClass', 'Remove', { v: e.id }, 'btn tiny') : '') + '</td></tr>';
    }).join('') + '</table></div><div class="row" style="margin-top:.6rem"><span><b>Character level ' + total + '</b> · proficiency bonus ' + R.fmt(d.pb) + '</span>';
    var addable = D.classes.filter(function (c) { return used.indexOf(c.id) < 0 && ok(c.tag); });
    if (total < 20 && addable.length) h += '<select id="addClass" data-addclass="1" aria-label="Add another class"><option value="">Add another class (multiclass)…</option>' + addable.map(function (c) {
      return '<option value="' + c.id + '">' + esc(c.name) + ' — needs ' + esc(R.multiclassReq(c.id)) + '</option>';
    }).join('') + '</select>';
    h += '</div>';
    if (E.length > 1) h += '<p class="small muted">Multiclass rules applied: proficiency bonus, hit points and spell slots use your combined levels; features, subclass and ability score improvements follow each class\'s own level; only your starting class gives saving throws and starting equipment.</p>';
    h += '</div>';
    if (!entry(ui.clsTab) || used.indexOf(ui.clsTab) < 0) ui.clsTab = used[0];
    if (E.length > 1) h += '<div class="pills" style="margin-top:1rem">' + E.map(function (e) { return btn('clsTab', esc(e.cls.name) + ' ' + e.level, { v: e.id }, 'pill' + (ui.clsTab === e.id ? ' on' : '')); }).join('') + '</div>';
    var e = E.filter(function (x) { return x.id === ui.clsTab; })[0], c = e.cls;
    h += '<div class="panel"><h3>' + esc(c.name) + ' ' + e.level + '</h3>';
    if (e.first) h += '<div class="facts"><span><b>Hit die</b> d' + c.hitDie + '</span><span><b>Armor</b> ' + esc(c.armor.join(', ') || 'None') + '</span><span><b>Weapons</b> ' + esc(c.weapons.join(', ')) + '</span>' +
      '<span><b>Saving throws</b> ' + c.saves.join(', ') + '</span>' + (c.casting ? '<span><b>Spellcasting</b> ' + D.abilityNames[c.casting.ability] + '</span>' : '') + '</div>';
    else {
      var mp = R.multiclassProf(c.id), gain = (mp.armor || []).concat(mp.weapons || [], mp.tools || [], mp.skills ? ['one skill'] : []);
      h += '<div class="facts"><span><b>Hit die</b> d' + c.hitDie + '</span><span><b>Requires</b> ' + esc(R.multiclassReq(c.id)) + '</span><span><b>Multiclass proficiencies</b> ' + esc(gain.join(', ') || 'None') + '</span>' +
        (c.casting ? '<span><b>Spellcasting</b> ' + D.abilityNames[c.casting.ability] + '</span>' : '') + '</div>';
    }
    h += '<h3>' + esc(c.subclassTerm || 'Subclass') + '</h3>';
    if (e.level < c.subclassLevel) h += '<p class="notice">' + esc(c.name) + 's choose this at ' + c.name.toLowerCase() + ' level ' + c.subclassLevel + '.</p>';
    else {
      var subs = R.subclassesOf(c.id).filter(function (s) { return (ok(s.tag) || s.id === e.subclass) && match(ui.q.subclass || '', s.name); });
      h += '<div class="toolbar">' + search('subclass', 'Search…') + '</div><div class="grid scroll">' + subs.map(function (s) {
        return '<button type="button" class="card' + (e.subclass === s.id ? ' on' : '') + '" data-act="subclass" data-c="' + c.id + '" data-v="' + esc(s.id) + '"><b>' + esc(s.name) + '</b><small>' + esc(s.source) + tag(s.tag) + '</small></button>';
      }).join('') + '</div>';
    }
    var cc = choicesFor('class', function (x) { return x.clsId === c.id && !slotChoice(x); });
    if (cc) h += '<h3>Choices</h3>' + cc;
    if (e.resources.length) h += '<h3>At ' + c.name.toLowerCase() + ' level ' + e.level + '</h3><div class="facts">' + e.resources.map(function (r) { return '<span><b>' + esc(r[0]) + '</b> ' + esc(r[1]) + '</span>'; }).join('') + '</div>';
    h += '<h3>' + esc(c.name) + ' features</h3>' + d.features.filter(function (f) { return f.kind === 'class' && f.clsId === c.id; }).map(featureHtml).join('');
    if (e.sc) {
      h += '<h3>' + esc(e.sc.name) + ' features</h3>';
      if (e.sc.expanded) h += '<p class="small muted">Expanded spell list: these spells are added to your class list on the Spells step.</p>';
      else if (e.sc.spells) h += '<p class="small muted">Always-prepared spells are added automatically as you reach each level.</p>';
      h += d.features.filter(function (f) { return f.kind === 'subclass' && f.clsId === c.id; }).map(featureHtml).join('');
    }
    return h + '</div>';
  }

  function stepAbilities() {
    var m = ch.method;
    var h = '<h2>Ability scores</h2><div class="pills" style="margin:.75rem 0">' +
      [['array', 'Standard array'], ['pointbuy', 'Point buy'], ['manual', 'Manual / rolled']].map(function (x) { return btn('method', x[1], { v: x[0] }, 'pill' + (m === x[0] ? ' on' : '')); }).join('') + '</div>';
    if (m === 'pointbuy') h += '<p class="' + (d.pointsSpent === 27 ? 'muted' : 'count') + '">Points spent: <b>' + (d.pointsSpent > 90 ? '—' : d.pointsSpent) + ' / 27</b>. Scores run from 8 to 15 before bonuses.</p>';
    if (m === 'array') h += '<p class="muted">Assign 15, 14, 13, 12, 10 and 8. Choosing a value swaps it with the ability that had it.</p>';
    if (m === 'manual') h += '<p class="muted">Type your scores, or ' + btn('roll', 'roll 4d6 and drop the lowest', {}, 'btn tiny') + '</p>';
    h += '<div class="tablewrap"><table><tr><th>Ability</th><th>Base</th><th class="num">Bonus</th><th class="num">Total</th><th class="num">Modifier</th></tr>' + AB.map(function (a) {
      var x = d.abilities[a], input;
      if (m === 'array') input = '<select data-base="' + a + '">' + D.standardArray.map(function (v) { return '<option' + (ch.base[a] === v ? ' selected' : '') + '>' + v + '</option>'; }).join('') + (D.standardArray.indexOf(ch.base[a]) < 0 ? '<option selected>' + ch.base[a] + '</option>' : '') + '</select>';
      else if (m === 'pointbuy') input = btn('pb', '−', { a: a, v: -1 }, 'btn tiny') + ' <b style="display:inline-block;width:1.6rem;text-align:center">' + ch.base[a] + '</b> ' + btn('pb', '+', { a: a, v: 1 }, 'btn tiny');
      else input = '<input type="number" min="1" max="20" id="base-' + a + '" data-base="' + a + '" value="' + ch.base[a] + '">';
      return '<tr><td><b>' + D.abilityNames[a] + '</b></td><td>' + input + '</td><td class="num">' + (x.bonus ? R.fmt(x.bonus) : '') + '</td><td class="num"><b>' + x.total + '</b></td><td class="num">' + R.fmt(x.mod) + '</td></tr>';
    }).join('') + '</table></div>';
    var slots = d.featSlots.filter(function (s) { return s.step === 'abilities'; });
    h += slots.length ? slots.map(featSlotHtml).join('') : '<p class="notice">' + (d.cls ? 'Ability score improvements arrive at ' + d.cls.name.toLowerCase() + ' level ' + d.cls.asiLevels[0] + '.' : 'Pick a class to see when ability score improvements arrive.') + '</p>';
    h += '<div class="panel"><h3>Hit points</h3><div class="pills">' +
      btn('hp', 'Average (' + d.hpAvg + ')', { v: 'avg' }, 'pill' + (ch.hpMode === 'avg' ? ' on' : '')) + btn('hp', 'Maximum (' + d.hpMax + ')', { v: 'max' }, 'pill' + (ch.hpMode === 'max' ? ' on' : '')) + btn('hp', 'Rolled', { v: 'manual' }, 'pill' + (ch.hpMode === 'manual' ? ' on' : '')) + '</div>' +
      (ch.hpMode === 'manual' ? '<label class="field"><span>Total hit points (your rolls plus Constitution)</span><input type="number" min="1" id="hpManual" data-num="hpManual" value="' + (ch.hpManual || d.hpAvg) + '"></label>' : '') +
      '<p class="muted small">Hit dice ' + d.hitDice + ': full die at character level 1, then the average each level; Constitution modifier and other per-level bonuses included.</p></div>';
    return h;
  }

  function stepBackground() {
    var list = D.backgrounds.filter(function (b) { return (ok(b.tag) || b.n === ch.background) && match(ui.q.background || '', b.n); });
    var h = '<h2>Background</h2><p class="muted">Where your character came from: skills, tools, languages and a story feature.</p><div class="toolbar">' + search('background', 'Search backgrounds…') + '<span class="muted small">' + list.length + ' shown</span></div>' +
      '<div class="grid scroll">' + list.map(function (b) {
        return '<button type="button" class="card' + (ch.background === b.n ? ' on' : '') + '" data-act="background" data-v="' + esc(b.n) + '"><b>' + esc(b.n) + '</b><small>' + esc(b.s) + tag(b.tag) + '</small></button>';
      }).join('') + '</div>';
    var b = d.bg;
    if (!b) return h + '<p class="notice">Pick a background to see what it grants.</p>';
    h += '<div class="panel"><h3>' + esc(b.n) + '</h3><div class="facts">' + (b.sk && b.sk.length ? '<span><b>Skills</b> ' + esc(b.sk.join(', ')) + '</span>' : '') + (b.tools ? '<span><b>Tools</b> ' + esc(b.tools.join(', ')) + '</span>' : '') +
      (b.lang ? '<span><b>Languages</b> ' + esc(b.lang.join(', ')) + '</span>' : '') + '</div><p><b>Equipment:</b> ' + esc(b.eq || '—') + '</p>' + (b.f ? featureHtml({ n: b.f[0], t: b.f[1] }) : '') +
      (b.spells ? '<p class="small muted">Guild spells are added to your class spell list on the Spells step.</p>' : '') + choicesFor('background', function (c) { return !slotChoice(c); }) + '</div>';
    return h + d.featSlots.filter(function (s) { return s.step === 'background'; }).map(featSlotHtml).join('');
  }

  function spellMeta(s) {
    return (s.level ? 'Level ' + s.level : 'Cantrip') + ' ' + s.school.toLowerCase() + ' · ' + s.time + ' · ' + s.range + ' · ' + s.duration + (s.ritual ? ' · ritual' : '');
  }
  // "Import spells" on the Spells step: only ever changes the current character's spells.
  function spellImportHtml() {
    var I = ui.spellImport, done = ui.spellImportDone;
    var bar = '<div class="spell-import noprint"><div class="toolbar">' + btn('importSpells', '⇩ Import spells (5th Spellbook or 5e Companion)') +
      '<span class="small muted">Only changes the spells of ' + esc(title(ch)) + '. Everything else stays.</span></div><input type="file" id="spellImportFile" hidden>';
    if (ui.spellImportError) bar += '<p class="small" style="color:var(--warn)">' + esc(ui.spellImportError) + '</p>';
    if (done) bar += '<div class="panel"><b>Spells imported from ' + esc(done.from) + ' (' + esc(done.source) + ').</b> ' + done.added + ' spell' + (done.added === 1 ? '' : 's') + ' added' +
      (done.skipped ? '; ' + done.skipped + ' didn\'t fit and are listed in Details → Other notes' : '') + '. Not right? Press Undo at the top. ' + btn('spellImportClose', 'OK', {}, 'btn tiny') + '</div>';
    if (I) bar += '<div class="panel"><b>Whose spells?</b> <span class="muted">The file has ' + I.entries.length + ' characters. Pick the one to take spells from.</span><div class="imp-list">' +
      I.entries.map(function (e) {
        var n = e.classes.reduce(function (t, c) { return t + c.spells.length; }, e.loose.length);
        return '<label class="imp-row"><input type="radio" name="spellsFrom" data-spellsfrom="' + e.id + '"' + (I.choose === e.id ? ' checked' : '') + '><span><b>' + esc(e.name) + '</b><br><span class="small muted">' + esc(importerOf(e).summary(e)) + ' · ' + n + ' spells</span></span></label>';
      }).join('') + '</div><div class="toolbar">' + btn('spellImportGo', 'Use these spells', {}, 'btn primary') + btn('spellImportCancel', 'Cancel') + '</div></div>';
    return bar + '</div>';
  }
  function applySpellImport(entry) {
    var u = Import5e.spellsInto(entry, ch, R, D), c2 = normalize(u.ch);
    store.chars[store.chars.indexOf(ch)] = c2; store.current = c2.id;
    ui.spellImport = null; ui.spellImportError = ''; ui.spellImportDone = { from: entry.name, source: sourceName(entry), added: u.added, skipped: u.skipped.length };
  }
  function loadSpellImport(input) {
    var file = input.files && input.files[0];
    input.value = '';
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function () {
      ui.spellImportError = ''; ui.spellImportDone = null; ui.spellImport = null;
      try {
        var entries = readImportFile(reader.result);
        if (!entries || entries.json) throw new Error('That file is not a 5th Spellbook backup or a 5e Companion character.');
        if (!entries.length) throw new Error('That 5th Spellbook backup has no characters.');
        var nm = function (x) { return String(x || '').trim().toLowerCase(); };
        var same = entries.filter(function (e) { return nm(e.name) && nm(e.name) === nm(ch.name); });
        if (entries.length === 1) applySpellImport(entries[0]);
        else ui.spellImport = { entries: entries, choose: (same[0] || entries[0]).id, matched: same.length === 1 };
      } catch (err) { ui.spellImportError = /5th Spellbook|5e Companion/.test(err.message) ? err.message : 'That file could not be read as a 5th Spellbook backup or a 5e Companion character.'; window.console.error(err); }
      render();
    };
    reader.readAsArrayBuffer(file);
  }

  function stepSpells() {
    var h = '<h2>Spells</h2>';
    if (!d.casters.length) return h + '<p class="notice">' + (d.cls ? 'This character has no spellcasting yet.' : 'Pick a class first.') + '</p>';
    h += spellImportHtml();
    if (!d.casters.some(function (s) { return s.clsId === ui.casterTab; })) ui.casterTab = d.casters[0].clsId;
    h += slotsHtml();
    if (d.casterLevel) h += '<p class="small muted">Spell slots are shared: your classes add up to caster level ' + d.casterLevel + '. Each class still learns and prepares spells as if it were your only class.</p>';
    if (d.casters.length > 1) h += '<div class="pills" style="margin:.75rem 0">' + d.casters.map(function (s) {
      return btn('casterTab', esc(s.name) + (s.missing > 0 ? ' <span class="badge">' + s.missing + '</span>' : ''), { v: s.clsId }, 'pill' + (ui.casterTab === s.clsId ? ' on' : ''));
    }).join('') + '</div>';
    var S = d.casters.filter(function (s) { return s.clsId === ui.casterTab; })[0];
    var noun = S.mode === 'known' ? 'Spells known' : S.mode === 'prepared' ? 'Prepared spells' : 'Spellbook';
    h += '<div class="facts"><span><b>' + esc(S.name) + '</b></span><span><b>Ability</b> ' + D.abilityNames[S.ability] + '</span><span><b>Save DC</b> ' + S.dc + '</span><span><b>Spell attack</b> ' + R.fmt(S.atk) + '</span>' +
      (S.cantripsMax ? '<span><b>Cantrips</b> ' + S.cantrips.length + ' / ' + S.cantripsMax + '</span>' : '') + '<span><b>' + noun + '</b> ' + S.known.length + ' / ' + S.knownMax + '</span>' +
      (S.mode === 'spellbook' ? '<span><b>Prepared</b> ' + S.prepared.length + ' / ' + S.preparedMax + '</span>' : '') + '<span><b>Highest spell level</b> ' + S.maxLevel + '</span></div>';
    if (S.note) h += '<p class="small muted">' + esc(S.note) + '</p>';
    if (S.always.length) h += '<p><b>Always prepared:</b> ' + S.always.map(spellLink).join(', ') + '</p>';
    var levels = []; for (var i = S.cantripsMax ? 0 : 1; i <= S.maxLevel; i++) levels.push(i);
    if (levels.indexOf(ui.spellLevel) < 0) ui.spellLevel = levels[0];
    var q = ui.q.spells || '';
    h += '<div class="toolbar"><div class="pills">' + levels.map(function (l) {
      var n = (l ? S.known : S.cantrips).filter(function (x) { return D.spells[x].level === l; }).length;
      return btn('spellLevel', (l ? 'Level ' + l : 'Cantrips') + (n ? ' (' + n + ')' : ''), { v: l }, 'pill' + (ui.spellLevel === l ? ' on' : ''));
    }).join('') + '</div>' + search('spells', 'Filter by name or school…') + '</div>';
    var rows = S.list.filter(function (s) { return (q ? true : s.level === ui.spellLevel) && match(q, s.name + ' ' + s.school); });
    var book = S.mode === 'spellbook';
    h += '<div class="optlist" style="max-height:none">' + rows.map(function (s) {
      var bucket = s.level ? 'k' : 'c', on = (s.level ? S.known : S.cantrips).indexOf(s.name) >= 0, auto = S.always.indexOf(s.name) >= 0, prep = S.prepared.indexOf(s.name) >= 0;
      var text = store.detail ? R.spellText(s.name) : '';
      return '<div class="spell' + (on || auto ? ' on' : '') + '">' +
        (auto ? '<span class="small muted" style="width:1.5rem">auto</span>' : '<button type="button" class="check' + (on ? ' on' : '') + '" aria-label="' + (on ? 'Remove ' : 'Add ') + esc(s.name) + '" data-act="spell" data-c="' + S.clsId + '" data-b="' + bucket + '" data-v="' + esc(s.name) + '">' + (on ? '✓' : '') + '</button>') +
        (book ? (on && s.level ? '<button type="button" class="check' + (prep ? ' on' : '') + '" title="Prepared" aria-label="Prepare ' + esc(s.name) + '" data-act="spell" data-c="' + S.clsId + '" data-b="p" data-v="' + esc(s.name) + '">' + (prep ? '★' : '☆') + '</button>' : '<span style="width:1.5rem"></span>') : '') +
        '<div><b>' + spellLink(s.name) + '</b>' + (s.conc ? ' <span class="tag">conc</span>' : '') + tag(s.tag) + ' <span class="small muted">' + esc(spellMeta(s)) + ' · ' + esc(s.comp) + '</span>' +
        (text ? '<div class="small">' + esc(text) + '</div>' : '') + '</div></div>';
    }).join('') + '</div>' + (rows.length ? '' : '<p class="muted">No spells match.</p>');
    return h + '<p class="small muted">' + (book ? '✓ in your spellbook · ★ prepared. ' : '') + 'Spell names link to the full text on the wiki.</p>';
  }
  function spellLink(n) { var s = D.findSpell(n); return s ? '<a href="' + esc(s.url) + '" target="_blank" rel="noopener">' + esc(s.name) + '</a>' : esc(n); }
  function slotsHtml() {
    var h = '<div class="slots">';
    if (d.pact) h += '<div class="stat"><b>' + d.pact.n + '</b><span>Pact slots (level ' + d.pact.level + ')</span></div>';
    d.slots.forEach(function (n, i) { h += '<div class="stat"><b>' + n + '</b><span>Level ' + (i + 1) + ' slots</span></div>'; });
    return h + '</div>';
  }

  function stepEquipment() {
    var h = '<h2>Equipment</h2>';
    if (d.cls) {
      h += '<div class="panel"><h3>Starting equipment — ' + esc(d.cls.name) + '</h3>' + d.cls.equipment.map(function (line, i) {
        var o = R.parseEquip(line);
        if (o.length < 2) return '<p>' + esc(line) + '</p>';
        return '<div class="pills" style="margin:.4rem 0">' + o.map(function (t, j) { return btn('eq', esc(t), { i: i, v: j }, 'pill' + ((ch.eq[i] | 0) === j ? ' on' : '')); }).join('') + '</div>';
      }).join('') + (d.bg ? '<h3>From ' + esc(d.bg.n) + '</h3><p>' + esc(d.bg.eq || '—') + '</p>' : '') + '</div>';
    }
    h += '<div class="panel"><h3>Armor</h3><div class="row"><label class="field"><span>Worn armor</span><select data-set="armor"><option value="">None</option>' + D.armor.map(function (a) {
      return '<option value="' + esc(a[0]) + '"' + (ch.armor === a[0] ? ' selected' : '') + '>' + esc(a[0]) + ' — ' + a[1] + ', AC ' + a[3] + (a[1] === 'Light' ? ' + Dex' : a[1] === 'Medium' ? ' + Dex (max 2)' : '') + '</option>';
    }).join('') + '</select></label><label style="margin-bottom:.9rem"><input type="checkbox" data-check="shield"' + (ch.shield ? ' checked' : '') + '> Shield (+2)</label>' +
      '<div class="stat" style="padding:.3rem .9rem;margin-bottom:.6rem"><b>' + d.ac + '</b><span>Armor class</span></div></div><p class="small muted">' + esc(d.acNote) + '</p></div>';
    h += '<div class="panel"><h3>Weapons</h3><div class="row"><select id="addWeapon" data-addweapon="1"><option value="">Add a weapon…</option>' + D.weapons.map(function (w) {
      return '<option value="' + esc(w[0]) + '">' + esc(w[0]) + ' — ' + esc(w[1]) + ', ' + esc(w[3]) + '</option>';
    }).join('') + '</select></div>' + attacksHtml(true) + '</div>';
    h += '<div class="panel"><h3>Other notes</h3><label class="field"><span>Anything else worth writing down about your gear</span><textarea id="gear" data-text="gear">' + esc(ch.gear) + '</textarea></label>' +
      '<p class="small muted">Magic items, adventuring gear, coins and carried weight are on the ' + btn('step', 'Items', { v: 'items' }, 'btn tiny') + ' step.</p></div>';
    return h;
  }
  function attacksHtml(edit) {
    if (!d.attacks.length) return edit ? '<p class="muted">No weapons added yet.</p>' : '';
    return '<div class="tablewrap"><table><tr><th>Weapon</th><th class="num">To hit</th><th>Damage</th><th>Properties</th>' + (edit ? '<th></th>' : '') + '</tr>' + d.attacks.map(function (a) {
      return '<tr><td><b>' + esc(a.name) + '</b>' + (a.proficient ? '' : ' <span class="small muted">(not proficient)</span>') + '</td><td class="num">' + R.fmt(a.hit) + '</td><td>' + esc(a.damage) + '</td><td class="small">' + esc(a.props) + '</td>' +
        (edit ? '<td>' + btn('rmWeapon', 'Remove', { v: a.name }, 'btn tiny') + '</td>' : '') + '</tr>';
    }).join('') + '</table></div>';
  }

  function fmtLb(n) { return (Math.round(n * 100) / 100) + ' lb'; }
  function itemMeta(it) {
    if (it.k === 'magic') return (it.type || 'Magic item') + (it.r ? ', ' + it.r.toLowerCase() : '') + (it.att ? ' (requires attunement)' : '');
    return it.k === 'gear' ? (it.cat || 'Gear') + (it.cost ? ' · ' + it.cost : '') : 'Custom item';
  }
  function itemName(it) { return it.k === 'magic' && it.slug ? '<a href="' + esc(D.magicItemUrl(it.slug)) + '" target="_blank" rel="noopener">' + esc(it.n) + '</a>' : esc(it.n); }
  function stepItems() {
    var inv = d.inv, over = inv.weight > inv.capacity, m = ch.money;
    var h = '<h2>Items</h2><p class="muted">What your character owns: magic items, adventuring gear, coins and anything of your own.</p>' +
      '<div class="slots"><div class="stat" style="padding:.3rem .8rem"><b' + (over ? ' style="color:var(--warn)"' : '') + '>' + inv.weight + ' / ' + inv.capacity + '</b><span>Carried lb / capacity</span></div>' +
      '<div class="stat" style="padding:.3rem .8rem"><b' + (inv.attuned > inv.attuneMax ? ' style="color:var(--warn)"' : '') + '>' + inv.attuned + ' / ' + inv.attuneMax + '</b><span>Attuned items</span></div>' +
      '<div class="stat" style="padding:.3rem .8rem"><b>' + inv.gpValue.toLocaleString('en') + '</b><span>Coins, in gp</span></div></div>' +
      '<p class="small muted">Capacity is Strength × 15 (push, drag or lift ' + inv.pushDrag + ' lb). The total counts these items, coins (50 to a pound), and the armor, shield and weapons chosen on the Equipment step; starting-equipment packs are not counted unless you add them here.</p>';
    h += '<div class="panel"><h3>Coins</h3><div class="row">' + [['pp', 'Platinum'], ['gp', 'Gold'], ['ep', 'Electrum'], ['sp', 'Silver'], ['cp', 'Copper']].map(function (c) {
      return '<label class="field"><span>' + c[1] + ' (' + c[0] + ')</span><input type="number" min="0" id="money-' + c[0] + '" data-money="' + c[0] + '" value="' + (+m[c[0]] || 0) + '"></label>';
    }).join('') + '</div></div>';
    h += '<div class="panel"><h3>Inventory</h3>';
    if (!ch.items.length) h += '<p class="muted">Nothing yet. Add items from the lists below.</p>';
    else h += '<div class="tablewrap"><table><tr><th>Item</th><th>Qty</th><th>Lb each</th><th>Attuned</th><th></th></tr>' + ch.items.map(function (it) {
      return '<tr><td><b>' + itemName(it) + '</b><div class="small muted">' + esc(itemMeta(it)) + '</div>' +
        '<input type="text" class="note" id="note-' + it.id + '" data-itemtext="' + it.id + '" value="' + esc(it.note || '') + '" placeholder="Note (charges, where it is kept…)" aria-label="Note for ' + esc(it.n) + '"></td>' +
        '<td><input type="number" min="0" id="qty-' + it.id + '" data-item="' + it.id + '" data-f="qty" value="' + (+it.qty || 0) + '" aria-label="Quantity"></td>' +
        '<td><input type="number" min="0" step="0.25" id="w-' + it.id + '" data-item="' + it.id + '" data-f="w" value="' + (+it.w || 0) + '" aria-label="Weight each"></td>' +
        '<td class="num">' + (it.att ? '<input type="checkbox" data-itemcheck="' + it.id + '"' + (it.attuned ? ' checked' : '') + ' aria-label="Attuned to ' + esc(it.n) + '">' : '<span class="muted">—</span>') + '</td>' +
        '<td>' + btn('rmItem', 'Remove', { v: it.id }, 'btn tiny') + '</td></tr>';
    }).join('') + '</table></div>';
    h += '</div><div class="panel"><h3>Add items</h3><div class="pills">' + [['magic', 'Magic items'], ['gear', 'Adventuring gear'], ['custom', 'Your own item']].map(function (t) {
      return btn('itemTab', t[1], { v: t[0] }, 'pill' + (ui.itemTab === t[0] ? ' on' : ''));
    }).join('') + '</div>';
    var sel = function (key, label, list) {
      return '<select data-ui="' + key + '" aria-label="' + label + '"><option value="">' + label + '</option>' + list.map(function (x) { return '<option' + (ui[key] === x ? ' selected' : '') + '>' + esc(x) + '</option>'; }).join('') + '</select>';
    };
    if (ui.itemTab === 'magic') {
      var q = ui.q.magic || '', types = [];
      D.magicItems.forEach(function (x) { if (types.indexOf(x[2]) < 0) types.push(x[2]); });
      var list = D.magicItems.filter(function (x) { return match(q, x[0]) && (!ui.rarity || x[1].indexOf(ui.rarity) >= 0) && (!ui.itemType || x[2] === ui.itemType); });
      h += '<div class="toolbar">' + search('magic', 'Search magic items…') + sel('rarity', 'Any rarity', D.rarities) + sel('itemType', 'Any type', types.sort()) + '<span class="muted small">' + list.length + ' of ' + D.magicItems.length + '</span></div><div class="optlist">' +
        list.slice(0, 80).map(function (x) {
          return '<div class="spell"><div><b><a href="' + esc(D.magicItemUrl(x[4])) + '" target="_blank" rel="noopener">' + esc(x[0]) + '</a></b> <span class="small muted">' + esc(x[2]) + (x[3] ? ' · attunement' : '') + '</span></div>' +
            '<div class="pills" style="flex:none">' + x[1].map(function (r) { return btn('addMagic', '+ ' + r, { v: x[0], r: r }, 'btn tiny'); }).join('') + '</div></div>';
        }).join('') + '</div>' + (list.length > 80 ? '<p class="small muted">Showing the first 80. Search or filter to narrow the list.</p>' : '') + (list.length ? '' : '<p class="muted">No items match.</p>') +
        '<p class="small muted">Item names link to the full description on the wiki. Set the weight yourself after adding; the wiki does not list one for most magic items.</p>';
    } else if (ui.itemTab === 'gear') {
      var gq = ui.q.gear || '', cats = [];
      D.gear.forEach(function (x) { if (cats.indexOf(x[1]) < 0) cats.push(x[1]); });
      var gl = D.gear.filter(function (x) { return match(gq, x[0]) && (!ui.gearCat || x[1] === ui.gearCat); });
      h += '<div class="toolbar">' + search('gear', 'Search gear…') + sel('gearCat', 'Any category', cats) + '</div><div class="optlist">' + gl.map(function (x) {
        return '<div class="spell"><div><b>' + esc(x[0]) + '</b> <span class="small muted">' + esc(x[1]) + (x[2] ? ' · ' + esc(x[2]) : '') + (x[3] ? ' · ' + fmtLb(x[3]) : '') + '</span></div>' + btn('addGear', '+ Add', { v: x[0] }, 'btn tiny') + '</div>';
      }).join('') + '</div>' + (gl.length ? '' : '<p class="muted">No gear matches.</p>');
    } else {
      h += '<div class="row" style="margin-top:.75rem"><label class="field" style="flex:1;min-width:12rem"><span>Name</span><input type="text" id="custom-n" style="width:100%"></label>' +
        '<label class="field"><span>Quantity</span><input type="number" id="custom-q" min="1" value="1"></label><label class="field"><span>Lb each</span><input type="number" id="custom-w" min="0" step="0.25" value="0"></label>' +
        '<label style="margin-bottom:.9rem"><input type="checkbox" id="custom-a"> Requires attunement</label>' + btn('addCustom', 'Add item', {}, 'btn primary') + '</div>';
    }
    return h + '</div>';
  }

  // ---------- appearance ----------
  function lookOf(c, dd) { return Avatar.look(c, dd.lin, dd.L); }
  function gearOf(c) { return Avatar.gear(c, D); }
  function avatarCanvas(cls) {
    return '<canvas class="avatar figure ' + (cls || '') + '" data-avatar="figure" width="48" height="58" role="img" aria-label="Character figure"></canvas>';
  }
  function pictureHtml(cls) {
    return ch.picture ? '<img class="char-pic ' + (cls || '') + (ch.pictureFit === 'contain' ? ' whole' : '') + '" src="' + ch.picture + '" alt="Picture of ' + esc(title(ch)) + '">' : '';
  }
  function drawAvatars() {
    if (!window.Avatar) return;
    var look = lookOf(ch, d), gear = gearOf(ch);
    document.querySelectorAll('canvas[data-avatar]').forEach(function (cv) { Avatar.draw(cv, look, gear); });
  }
  // A picture the player adds: shrunk to at most 640 px so it fits in the browser's storage.
  function loadPicture(input) {
    var file = input.files && input.files[0];
    input.value = '';
    if (!file) return;
    ui.pictureError = '';
    if (!/^image\//.test(file.type)) { ui.pictureError = 'That file is not a picture.'; render(); return; }
    var reader = new FileReader();
    reader.onload = function () {
      shrinkPicture(reader.result, function (data) {
        if (!data) { ui.pictureError = 'That picture could not be opened.'; render(); return; }
        var before = ch.picture;
        ch.picture = data;
        try { window.localStorage.setItem(KEY, JSON.stringify(store)); }
        catch (e) { ch.picture = before; ui.pictureError = 'There is not enough room left in this browser to save that picture. Try a smaller one, or remove pictures from other characters.'; }
        render();
      });
    };
    reader.readAsDataURL(file);
  }
  function importerOf(e) { return e && e.source === 'companion' ? window.ImportCompanion : window.Import5e; }
  function sourceName(e) { return e && e.source === 'companion' ? '5e Companion' : '5th Spellbook'; }
  // Read any import file: a 5th Spellbook backup (SQLite) or a 5e Companion character (JSON). Returns entries or null.
  function readImportFile(buf) {
    if (window.SqliteFile && SqliteFile.isSqlite(buf)) return Import5e.read(new SqliteFile(buf));
    var o; try { o = JSON.parse(new TextDecoder('utf-8').decode(buf)); } catch (e) { return null; }
    if (window.ImportCompanion && ImportCompanion.detect(o)) return ImportCompanion.read(o);
    return { json: o };
  }
  function shrinkPicture(src, done) {
    var img = new Image();
    img.onload = function () {
      var max = 640, k = Math.min(1, max / Math.max(img.width, img.height)), cv = document.createElement('canvas');
      cv.width = Math.max(1, Math.round(img.width * k)); cv.height = Math.max(1, Math.round(img.height * k));
      var x = cv.getContext('2d'); x.imageSmoothingQuality = 'high'; x.drawImage(img, 0, 0, cv.width, cv.height);
      var data = cv.toDataURL('image/webp', 0.85);
      if (data.indexOf('data:image/webp') !== 0) { x.globalCompositeOperation = 'destination-over'; x.fillStyle = '#ffffff'; x.fillRect(0, 0, cv.width, cv.height); data = cv.toDataURL('image/jpeg', 0.85); }
      done(data);
    };
    img.onerror = function () { done(null); };
    img.src = src;
  }
  function stepAppearance() {
    var L = lookOf(ch, d), own = ch.look || {};
    function opts(k, label) {
      return '<label class="field"><span>' + label + (own[k] != null ? ' <small class="muted">· changed</small>' : '') + '</span><select data-look="' + k + '">' + Avatar.OPTIONS[k].map(function (o) {
        return '<option value="' + o[0] + '"' + (L[k] === o[0] ? ' selected' : '') + '>' + o[1] + '</option>';
      }).join('') + '</select></label>';
    }
    function sw(k, label, list, none) {
      return '<div class="field"><span>' + label + '</span><div class="swatches">' + (none ? '<button type="button" class="sw none' + (!L[k] ? ' on' : '') + '" data-act="look" data-k="' + k + '" data-v="" title="Match shirt">×</button>' : '') + list.map(function (c) {
        return '<button type="button" class="sw' + (L[k] === c ? ' on' : '') + '" style="background:' + c + '" data-act="look" data-k="' + k + '" data-v="' + c + '" aria-label="' + label + ' ' + c + '"></button>';
      }).join('') + '<input type="color" data-lookcolor="' + k + '" value="' + (L[k] || '#888888') + '" aria-label="Custom ' + label.toLowerCase() + '"></div></div>';
    }
    var hidden = own.hidden || {};
    var wear = ch.items.filter(function (it) {
      var g = Avatar.gear({ items: [Object.assign({}, it)], weapons: [], armor: '', look: {} }, D);
      return Object.keys(g.slots).length || g.main || g.shield || g.armorGlow;
    });
    var shown = [];
    if (ch.armor) shown.push(ch.armor);
    if (ch.shield) shown.push('Shield');
    shown = shown.concat(ch.weapons);
    var pic = '<h3>Character picture</h3><div class="pic-wrap"><div class="pic-frame' + (ch.picture ? '' : ' empty') + '">' + (ch.picture ? pictureHtml('big') : '<span>No picture yet</span>') + '</div><div>' +
      '<p class="muted">Add your own picture of the character: a drawing, an image you made or found, anything. It shows in the side panel and at the top of the sheet.</p>' +
      '<div class="toolbar">' + btn('pickPicture', ch.picture ? 'Change picture' : 'Add a picture', {}, 'btn primary') + (ch.picture ? btn('removePicture', 'Remove picture', {}, 'btn danger') : '') + '</div>' +
      (ch.picture ? '<label class="check-line"><input type="checkbox" data-check="pictureWhole"' + (ch.pictureFit === 'contain' ? ' checked' : '') + '> Show the whole picture (otherwise it is cropped to a square)</label>' : '') +
      (ui.pictureError ? '<p class="small" style="color:var(--warn)">' + esc(ui.pictureError) + '</p>' : '') +
      '<p class="small muted">The picture is saved in this browser with the character and included when you export it. It is never uploaded anywhere.</p>' +
      '<input type="file" id="pictureFile" accept="image/*" hidden></div></div>';
    var stage = '<div class="look-stage">' + avatarCanvas('big') + '<div class="toolbar" style="justify-content:center">' + btn('lookRandom', 'Randomize') + btn('lookReset', 'Match lineage') + '</div></div>';
    var controls = '<h3>Body</h3><div class="row">' + opts('height', 'Height') + opts('build', 'Build') + '</div>' + sw('skin', 'Skin', Avatar.SKINS) +
      '<h3>Head</h3><div class="row">' + opts('head', 'Head') + opts('ears', 'Ears') + opts('extra', 'Extra') + '</div>' + sw('eyes', 'Eyes', Avatar.EYES) +
      '<h3>Hair</h3><div class="row">' + opts('hair', 'Hair style') + opts('beard', 'Beard') + '</div>' + sw('hairColor', 'Hair colour', Avatar.HAIRS) +
      '<h3>Features</h3><div class="row">' + opts('horns', 'Horns') + opts('tail', 'Tail') + opts('wings', 'Wings') + '</div>' +
      '<h3>Clothes</h3>' + sw('shirt', 'Shirt', Avatar.CLOTH) + sw('pants', 'Trousers', Avatar.CLOTH) + sw('cloak', 'Cloak and robe', Avatar.CLOTH, true) +
      '<h3>Scene</h3><div class="row">' + opts('base', 'Ground') + '</div>' +
      '<h3>Worn and carried</h3>' + (shown.length ? '<p><b>From Equipment:</b> ' + esc(shown.join(', ')) + '</p>' : '<p class="muted">No armour or weapons chosen yet. Pick them in the Equipment step.</p>') +
      (wear.length ? '<div class="look-items">' + wear.map(function (it) {
        return '<label class="check"><input type="checkbox" data-lookhide="' + it.id + '"' + (hidden[it.id] ? '' : ' checked') + '> Show ' + esc(it.n) + '</label>';
      }).join('') + '</div>' : '<p class="muted">No wearable items in the inventory. Cloaks, hats, helms, circlets, boots, gloves, belts, amulets, rings, goggles, orbs and magic weapons, armour and shields are drawn; other items are not.</p>') +
      '<p class="small muted">Magic items add a sparkle in their rarity colour. Only the first weapon is held; a second light weapon goes in the off hand, and a bow, staff or great weapon goes on the back.</p>';
    return '<h2>Appearance</h2>' + pic +
      '<h3 style="margin-top:2rem">Pixel figure</h3><p class="muted">A little pixel-art figure of your character. Starting looks follow your lineage, and armour, weapons and wearable items are drawn on it.</p>' +
      '<div class="look-wrap">' + stage + '<div class="look-controls">' + controls + '</div></div>';
  }

  function stepDetails() {
    function t(k, label, area) {
      var v = k in ch.notes ? ch.notes[k] : ch[k], path = k in ch.notes ? 'notes.' + k : k;
      return '<label class="field"><span>' + label + '</span>' + (area ? '<textarea id="f-' + k + '" data-text="' + path + '">' + esc(v) + '</textarea>' : '<input type="text" id="f-' + k + '" data-text="' + path + '" value="' + esc(v) + '">') + '</label>';
    }
    return '<h2>Details</h2><div class="panel"><div class="row">' + t('name', 'Character name') + t('player', 'Player') +
      '<label class="field"><span>Alignment</span><select data-set="alignment"><option value="">—</option>' + D.alignments.map(function (a) { return '<option' + (ch.alignment === a ? ' selected' : '') + '>' + a + '</option>'; }).join('') + '</select></label></div>' +
      t('traits', 'Personality traits', 1) + t('ideals', 'Ideals', 1) + t('bonds', 'Bonds', 1) + t('flaws', 'Flaws', 1) + t('appearance', 'Appearance', 1) + t('backstory', 'Backstory', 1) + t('other', 'Other notes', 1) + '</div>';
  }

  function stepSheet() {
    var S = d.spell, p = d.prof;
    function list(label, a) { return a.length ? '<p><b>' + label + ':</b> ' + esc(a.join(', ')) + '</p>' : ''; }
    function group(kind, label, clsId) {
      var f = d.features.filter(function (x) { return x.kind === kind && (!clsId || x.clsId === clsId); });
      return f.length ? '<h3>' + esc(label) + '</h3>' + f.map(function (x) {
        var t = store.detail && x.long ? x.long : x.t;
        return '<div class="feature"><b>' + esc(x.n) + '</b>' + (kind === 'option' ? ' <span class="lv">' + esc(x.src) + '</span>' : '') + (t ? ' — ' + esc(t) : '') + '</div>';
      }).join('') : '';
    }
    var h = '<div class="toolbar noprint">' + btn('print', 'Print or save as PDF', {}, 'btn primary') + btn('export', 'Export JSON') + (totalTodo() ? '<span class="count" style="color:var(--warn)">' + totalTodo() + ' choice(s) still open — see the badges in the step list.</span>' : '') + '</div>';
    h += '<div class="sheet"><div class="sheet-head"><div class="sheet-pics">' + pictureHtml('sheet-pic') + avatarCanvas('sheet-pic') + '</div><div style="flex:1"><h2>' + esc(title(ch)) + '</h2><div>' + esc(summaryLine(ch, d)) + '</div></div><div class="facts" style="margin:0">' +
      (d.bg ? '<span><b>Background</b> ' + esc(d.bg.n) + '</span>' : '') + (ch.alignment ? '<span><b>Alignment</b> ' + esc(ch.alignment) + '</span>' : '') + (ch.player ? '<span><b>Player</b> ' + esc(ch.player) + '</span>' : '') +
      '<span><b>XP</b> ' + D.xpByLevel[d.level - 1].toLocaleString('en') + '</span><span><b>Size</b> ' + esc(d.size || 'Medium') + '</span></div></div><div class="sheet-cols"><div>' +
      '<div class="abil">' + AB.map(function (a) { var x = d.abilities[a]; return '<div class="stat"><span>' + a + '</span><b>' + R.fmt(x.mod) + '</b><i>' + x.total + '</i></div>'; }).join('') + '</div>' +
      '<h3>Saving throws</h3><ul class="lines">' + AB.map(function (a) { var s = d.saves[a]; return '<li><span class="dot' + (s.prof ? ' p' : '') + '"></span><span class="v">' + R.fmt(s.total) + '</span><span>' + D.abilityNames[a] + '</span></li>'; }).join('') + '</ul>' +
      '<h3>Skills</h3><ul class="lines">' + Object.keys(d.skills).map(function (k) { var s = d.skills[k]; return '<li><span class="dot' + (s.expertise ? ' e' : s.prof ? ' p' : '') + '"></span><span class="v">' + R.fmt(s.total) + '</span><span>' + k + ' <small class="muted">' + s.ability + '</small></span></li>'; }).join('') + '</ul>' +
      '<p class="small muted">● proficient · ◉ expertise</p></div><div>' +
      '<div class="slots">' + [['Armor class', d.ac], ['Hit points', d.hp], ['Hit dice', d.hitDice], ['Initiative', R.fmt(d.init)], ['Speed', d.speed + ' ft'], ['Proficiency', R.fmt(d.pb)], ['Passive Perception', d.passive]].map(function (x) { return '<div class="stat" style="padding:.3rem .7rem"><b>' + x[1] + '</b><span>' + x[0] + '</span></div>'; }).join('') + '</div>' +
      '<p class="small muted">AC: ' + esc(d.acNote) + (d.moves.length ? ' · Also: ' + esc(d.moves.join(', ')) : '') + (d.darkvision ? ' · Darkvision ' + d.darkvision + ' ft' : '') + '</p>' +
      (d.resources.length ? '<div class="facts">' + d.resources.map(function (r) { return '<span><b>' + esc(r[0]) + '</b> ' + esc(r[1]) + '</span>'; }).join('') + '</div>' : '') +
      (d.attacks.length ? '<h3>Attacks</h3>' + attacksHtml(false) : '') +
      '<h3>Proficiencies</h3>' + list('Armor', p.armor) + list('Weapons', p.weapons) + list('Tools', p.tools) + list('Languages', p.languages) + list('Resistances', p.res) + list('Immunities', p.imm);
    if (d.casters.length) {
      h += '<h3>Spellcasting</h3>' + slotsHtml();
      d.casters.forEach(function (S) {
        h += '<div class="facts"><span><b>' + esc(S.name) + '</b></span><span><b>Ability</b> ' + D.abilityNames[S.ability] + '</span><span><b>Save DC</b> ' + S.dc + '</span><span><b>Attack</b> ' + R.fmt(S.atk) + '</span>' +
          (S.mode === 'spellbook' ? '<span><b>Prepared</b> ' + S.prepared.length + ' of ' + S.preparedMax + ' (★)</span>' : '') + '</div>';
        var all = S.cantrips.concat(S.known, S.always).filter(function (n, i, a) { return a.indexOf(n) === i; });
        var mark = function (n) { return S.always.indexOf(n) >= 0 ? ' <small class="muted">(always)</small>' : S.prepared.indexOf(n) >= 0 ? ' ★' : ''; };
        for (var l = 0; l <= 9; l++) {
          var at = all.filter(function (n) { var s = D.findSpell(n); return (s ? s.level : -1) === l; });
          if (!at.length) continue;
          if (store.detail) h += '<h4 style="margin-top:.7rem">' + (l ? 'Level ' + l : 'Cantrips') + '</h4>' + at.map(function (n) {
            var s = D.findSpell(n), t = R.spellText(s.name);
            return '<div class="feature"><b>' + spellLink(n) + '</b>' + mark(n) + ' <span class="lv">' + esc(s.school + ' · ' + s.time + ' · ' + s.range + ' · ' + s.duration + (s.conc ? ' (concentration)' : '') + (s.ritual ? ' · ritual' : '')) + '</span>' + (t ? '<div>' + esc(t) + '</div>' : '') + '</div>';
          }).join('');
          else h += '<p><b>' + (l ? 'Level ' + l : 'Cantrips') + ':</b> ' + at.map(function (n) { return spellLink(n) + mark(n); }).join(', ') + '</p>';
        }
        var odd = S.always.filter(function (n) { return !D.findSpell(n); });
        if (odd.length) h += '<p><b>Also always prepared:</b> ' + esc(odd.join(', ')) + '</p>';
      });
    }
    var picks = d.choices.filter(function (c) { return /^(lin\.pick\d|sc\.[\w-]+\.variant)/.test(c.key) && c.picked.length; });
    if (picks.length) h += '<h3>Chosen options</h3>' + picks.map(function (c) { return '<p><b>' + esc(c.label) + ':</b> ' + esc(c.picked.join(', ')) + '</p>'; }).join('');
    d.classes.forEach(function (e) {
      h += group('class', e.cls.name + ' features', e.id) + (e.sc ? group('subclass', e.sc.name + ' features', e.id) : '');
    });
    h += group('option', 'Class options') + group('lineage', (d.L ? d.L.name : 'Lineage') + ' traits') + group('feat', 'Feats') + group('background', 'Background feature');
    var eq = d.equipment.concat(ch.gear ? [ch.gear] : []);
    h += '<h3>Equipment</h3>' + (ch.armor || ch.shield ? '<p><b>Worn:</b> ' + esc([ch.armor, ch.shield ? 'Shield' : ''].filter(Boolean).join(', ')) + '</p>' : '') + (eq.length ? '<ul>' + eq.map(function (e) { return '<li>' + esc(e) + '</li>'; }).join('') + '</ul>' : '<p class="muted">None listed.</p>');
    var coins = ['pp', 'gp', 'ep', 'sp', 'cp'].filter(function (k) { return +ch.money[k] > 0; }).map(function (k) { return (+ch.money[k]).toLocaleString('en') + ' ' + k; });
    if (ch.items.length || coins.length) {
      h += '<h3>Items</h3>' + (ch.items.length ? '<ul>' + ch.items.map(function (it) {
        return '<li>' + (+it.qty !== 1 ? (+it.qty || 0) + ' × ' : '') + '<b>' + itemName(it) + '</b>' + (it.k === 'magic' ? ' <span class="small muted">' + esc((it.type || '') + (it.r ? ', ' + it.r.toLowerCase() : '')) + '</span>' : '') +
          (it.att ? (it.attuned ? ' <span class="tag">attuned</span>' : ' <span class="small muted">(not attuned)</span>') : '') + (+it.w ? ' <span class="small muted">' + fmtLb(it.w * (+it.qty || 0)) + '</span>' : '') + (it.note ? ' — ' + esc(it.note) : '') + '</li>';
      }).join('') + '</ul>' : '') + (coins.length ? '<p><b>Coins:</b> ' + coins.join(', ') + '</p>' : '') +
        '<p class="small muted">Carrying ' + d.inv.weight + ' of ' + d.inv.capacity + ' lb · attuned to ' + d.inv.attuned + ' of ' + d.inv.attuneMax + '</p>';
    }
    [['traits', 'Personality traits'], ['ideals', 'Ideals'], ['bonds', 'Bonds'], ['flaws', 'Flaws'], ['appearance', 'Appearance'], ['backstory', 'Backstory'], ['other', 'Notes']].forEach(function (n) {
      if (ch.notes[n[0]]) h += '<h3>' + n[1] + '</h3><p style="white-space:pre-wrap">' + esc(ch.notes[n[0]]) + '</p>';
    });
    return h + '</div></div><p class="small muted" style="margin-top:1rem">Rules summaries paraphrased from <a href="https://dnd5e.wikidot.com/" target="_blank" rel="noopener">dnd5e.wikidot.com</a> (CC BY-SA 3.0). Check the wiki or your books for full wording.</p></div>';
  }
  function totalTodo() { var n = 0; for (var k in d.todo) n += d.todo[k]; return n; }

  // ---------- frame ----------
  function render() {
    if (!byId(store.current) && store.chars.length) store.current = store.chars[0].id;
    remember(); // record the change about to be drawn, so Undo is ready at once
    ch = byId(store.current);
    d = R.derive(ch, store.filters);
    var active = document.activeElement, fid = active && active.id, pos = null;
    try { pos = active && active.selectionStart; } catch (e) { pos = null; }
    var body = { lineage: stepLineage, 'class': stepClass, abilities: stepAbilities, background: stepBackground, spells: stepSpells, equipment: stepEquipment, items: stepItems, appearance: stepAppearance, details: stepDetails, sheet: stepSheet }[ui.step]();
    var top = '<header class="top"><span class="brand">Character Forge</span><select data-ui="current" aria-label="Character">' + store.chars.map(function (c) {
      return '<option value="' + c.id + '"' + (c.id === ch.id ? ' selected' : '') + '>' + esc(title(c)) + '</option>';
    }).join('') + '</select>' + '<button type="button" class="btn" data-act="undo" title="Undo (Ctrl+Z)"' + (undoStack.length ? '' : ' disabled') + '>↶ Undo</button><button type="button" class="btn" data-act="redo" title="Redo (Ctrl+Y)"' + (redoStack.length ? '' : ' disabled') + '>↷ Redo</button>' + btn('new', 'New') + btn('dup', 'Duplicate') + btn('import', 'Import') + btn('export', 'Export') +
      (ui.confirmDelete ? btn('delete', 'Really delete?', {}, 'btn primary') + btn('cancelDelete', 'Cancel') : btn('askDelete', 'Delete', {}, 'btn danger')) +
      (ui.importError ? '<span class="count" style="color:var(--warn)">' + esc(ui.importError === true ? 'That file is not a Character Forge export, a 5th Spellbook backup or a 5e Companion character.' : ui.importError) + '</span>' : '') + (isInstalledApp() ? '' : btn('install', 'Install app', {}, installPrompt ? 'btn primary' : 'btn')) + '<span class="spacer"></span><span class="filters"><b>Sources:</b>' + TAGS.map(function (t) {
        return '<label><input type="checkbox" data-filter="' + t[0] + '"' + (store.filters[t[0]] !== false ? ' checked' : '') + '> ' + t[1] + '</label>';
      }).join('') + '<label title="Longer feature text and spell descriptions"><input type="checkbox" data-setting="detail"' + (store.detail !== false ? ' checked' : '') + '> Detailed text</label></span><input type="file" id="importFile" hidden></header>';
    var nav = '<nav class="steps" aria-label="Steps">' + STEPS.map(function (s) {
      var n = d.todo[s[0]], show = ['sheet', 'details', 'equipment', 'items', 'appearance'].indexOf(s[0]) < 0;
      return '<button type="button" class="step' + (ui.step === s[0] ? ' on' : '') + '" data-act="step" data-v="' + s[0] + '"><span>' + s[1] + '</span>' + (show ? (n ? '<span class="badge" title="' + n + ' open">' + n + '</span>' : '<span class="badge done">✓</span>') : '') + '</button>';
    }).join('') + '</nav>';
    var side = '<aside class="side">' + (ui.step !== 'appearance' ? '<div class="side-portrait" data-act="step" data-v="appearance" title="Edit appearance">' + (ch.picture ? pictureHtml('side') : avatarCanvas('side')) + '</div>' : '') + '<h4>' + esc(title(ch)) + '</h4><div class="muted">' + esc(summaryLine(ch, d)) + '</div><div class="stats">' +
      [['AC', d.ac], ['HP', d.hp], ['Speed', d.speed], ['Init', R.fmt(d.init)], ['Prof', R.fmt(d.pb)], ['Passive', d.passive]].map(function (x) { return '<div class="stat"><b>' + x[1] + '</b><span>' + x[0] + '</span></div>'; }).join('') + '</div><div class="stats">' +
      AB.map(function (a) { return '<div class="stat"><b>' + d.abilities[a].total + '</b><span>' + a + ' ' + R.fmt(d.abilities[a].mod) + '</span></div>'; }).join('') + '</div>' +
      d.casters.map(function (s) { return '<div class="muted">' + (d.casters.length > 1 ? esc(s.name) + ': s' : 'S') + 'pell DC ' + s.dc + ' · attack ' + R.fmt(s.atk) + '</div>'; }).join('') +
      (d.warnings.length ? '<ul class="warnings">' + d.warnings.map(function (w) { return '<li>' + esc(w) + '</li>'; }).join('') + '</ul>' : '') + '</aside>';
    var i = STEPS.map(function (s) { return s[0]; }).indexOf(ui.step);
    var foot = '<div class="toolbar noprint" style="margin-top:1.5rem">' + (i > 0 ? btn('step', '← ' + STEPS[i - 1][1], { v: STEPS[i - 1][0] }) : '') + (i < STEPS.length - 1 ? btn('step', STEPS[i + 1][1] + ' →', { v: STEPS[i + 1][0] }, 'btn primary') : '') + '</div>';
    document.getElementById('app').innerHTML = top + installHelpHtml() + import5eHtml() + '<div class="shell">' + nav + '<main>' + body + foot + '</main>' + side + '</div>';
    drawAvatars();
    if (fid) { var el = document.getElementById(fid); if (el) { el.focus(); try { if (pos != null) el.setSelectionRange(pos, pos); } catch (e) { /* not a text field */ } } }
    document.title = title(ch) + ' — Character Forge';
    saveNow();
  }

  // ---------- actions ----------
  var actions = {
    step: function (v) { ui.step = v; ui.spellImport = null; ui.spellImportDone = null; ui.spellImportError = ''; window.scrollTo(0, 0); },
    'new': function () { var c = R.newChar(); store.chars.push(c); store.current = c.id; ui.step = 'lineage'; },
    dup: function () { var c = JSON.parse(JSON.stringify(ch)); c.id = R.uid(); c.name = title(ch) + ' (copy)'; store.chars.push(c); store.current = c.id; },
    askDelete: function () { ui.confirmDelete = true; },
    cancelDelete: function () { ui.confirmDelete = false; },
    'delete': function () {
      store.chars = store.chars.filter(function (c) { return c.id !== ch.id; });
      if (!store.chars.length) store.chars.push(R.newChar());
      store.current = store.chars[0].id; ui.confirmDelete = false;
    },
    'export': function () {
      var blob = new Blob([JSON.stringify(ch, null, 2)], { type: 'application/json' }), a = document.createElement('a');
      a.href = URL.createObjectURL(blob); a.download = (title(ch).replace(/[^\w-]+/g, '_') || 'character') + '.json';
      document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
    },
    'import': function () { document.getElementById('importFile').click(); return false; },
    print: function () { window.print(); return false; },
    install: function () {
      if (!installPrompt) { ui.installHelp = !ui.installHelp; return; }
      var pr = installPrompt; installPrompt = null; pr.prompt();
      if (pr.userChoice) pr.userChoice.then(function () { render(); });
    },
    closeInstallHelp: function () { ui.installHelp = false; },
    import5eClose: function () { ui.import5e = null; ui.import5eDone = null; },
    import5eAll: function () { var I = ui.import5e; if (I) I.pick = I.pick.length === I.entries.length ? [] : I.entries.map(function (e) { return e.id; }); },
    import5eGo: function () {
      var I = ui.import5e; if (!I || !I.pick.length) return false;
      var done = [], first = null, pics = [];
      I.entries.filter(function (e) { return I.pick.indexOf(e.id) >= 0; }).forEach(function (e) {
        var tg = I.target[e.id] || 'new', old = tg !== 'new' && byId(tg);
        if (old) {
          var u = Import5e.spellsInto(e, old, R, D), c2 = normalize(u.ch);
          store.chars[store.chars.indexOf(old)] = c2; if (!first) first = c2.id;
          done.push({ name: title(c2), added: u.added, skipped: u.skipped.length, update: true });
        } else {
          var r = importerOf(e).toCharacter(e, R, D), c = normalize(r.ch); c.id = R.uid();
          store.chars.push(c); if (!first) first = c.id;
          if (r.picture) pics.push([c.id, r.picture]);
          done.push({ name: c.name, added: r.added, skipped: r.skipped.length });
        }
      });
      done.source = I.source;
      store.current = first; ui.step = done.length === 1 && done[0].update ? 'spells' : 'sheet'; ui.import5e = null; ui.import5eDone = done; window.scrollTo(0, 0);
      // pictures from 5e Companion: shrink them like any added picture, then show them
      pics.forEach(function (p) { shrinkPicture(p[1], function (data) { var c = byId(p[0]); if (c && data) { c.picture = data; render(); } }); });
    },
    lineage: function (v) {
      var l = R.lineage(v); ch.lineage = v; ch.sub = 0; clearPicks('lin'); ch.version = 0;
      for (var i = 0; i < l.versions.length; i++) if (ok(l.versions[i].tag || l.tag)) { ch.version = i; break; }
    },
    version: function (v) { ch.version = +v; ch.sub = 0; clearPicks('lin'); },
    sub: function (v) { ch.sub = +v; clearPicks('lin'); },
    flex: function (v) { ch.flexMode = v; },
    cls: function (v) {
      var cur = ch.classes[0];
      if (cur && cur.cls === v) return;
      if (!cur) ch.classes = [{ cls: v, level: 1, subclass: '' }];
      else { clearClass(cur.cls); ch.classes[0] = { cls: v, level: cur.level, subclass: '' }; }
      ch.eq = {}; ui.clsTab = v;
    },
    rmClass: function (v) { clearClass(v); ch.classes = ch.classes.filter(function (e) { return e.cls !== v; }); ch.eq = {}; },
    clsTab: function (v) { ui.clsTab = v; ui.q.subclass = ''; },
    casterTab: function (v) { ui.casterTab = v; ui.q.spells = ''; },
    subclass: function (v, el) {
      var e = entry(el.getAttribute('data-c'));
      if (!e) return;
      e.subclass = e.subclass === v ? '' : v; clearPicks('sc.' + e.cls + '.');
    },
    background: function (v) { ch.background = v; clearPicks('bg'); },
    method: function (v) {
      ch.method = v;
      if (v === 'array') AB.forEach(function (a, i) { ch.base[a] = D.standardArray[i]; });
      if (v === 'pointbuy') AB.forEach(function (a) { ch.base[a] = 8; });
    },
    pb: function (v, el) { var a = el.getAttribute('data-a'), n = ch.base[a] + (+v); if (n < 8 || n > 15) return; var cost = D.pointBuyCost[n] - D.pointBuyCost[ch.base[a]]; if (d.pointsSpent + cost > 27) return; ch.base[a] = n; },
    roll: function () { AB.forEach(function (a) { var r = [0, 0, 0, 0].map(function () { return 1 + Math.floor(Math.random() * 6); }).sort(); ch.base[a] = r[1] + r[2] + r[3]; }); },
    hp: function (v) { ch.hpMode = v; if (v === 'manual' && !ch.hpManual) ch.hpManual = d.hpAvg; },
    asimode: function (v, el) { ch.asi[el.getAttribute('data-slot')] = v; },
    pick: function (v, el) {
      var key = el.getAttribute('data-key'), c = d.choices.filter(function (x) { return x.key === key; })[0];
      if (!c) return;
      var cur = c.picked.slice(), i = cur.indexOf(v);
      if (i >= 0) cur.splice(i, 1); else if (c.count === 1) cur = [v]; else if (cur.length < c.count) cur.push(v); else return;
      ch.picks[key] = cur;
    },
    spellLevel: function (v) { ui.spellLevel = +v; ui.q.spells = ''; },
    spell: function (v, el) {
      var b = el.getAttribute('data-b'), id = el.getAttribute('data-c'), S = d.casters.filter(function (x) { return x.clsId === id; })[0];
      if (!S) return;
      var cur = (b === 'c' ? S.cantrips : b === 'k' ? S.known : S.prepared).slice(), max = b === 'c' ? S.cantripsMax : b === 'k' ? S.knownMax : S.preparedMax;
      var i = cur.indexOf(v);
      if (i >= 0) cur.splice(i, 1); else if (cur.length < max) cur.push(v); else return;
      // keep the other lists as currently valid, so stale picks never linger
      ch.spells[id] = { c: S.cantrips, k: S.known, p: S.prepared };
      ch.spells[id][b] = cur;
    },
    itemTab: function (v) { ui.itemTab = v; },
    addMagic: function (v, el) {
      var x = D.magicItems.filter(function (i) { return i[0] === v; })[0];
      if (x) ch.items.push({ id: R.uid(), k: 'magic', n: x[0], r: el.getAttribute('data-r'), type: x[2], att: !!x[3], attuned: false, slug: x[4], qty: 1, w: 0, note: '' });
    },
    addGear: function (v) {
      var x = D.gear.filter(function (i) { return i[0] === v; })[0], have = ch.items.filter(function (i) { return i.k === 'gear' && i.n === v; })[0];
      if (have) have.qty = (+have.qty || 0) + 1;
      else if (x) ch.items.push({ id: R.uid(), k: 'gear', n: x[0], cat: x[1], cost: x[2], qty: 1, w: x[3], note: '' });
    },
    addCustom: function () {
      var g = function (id) { return document.getElementById(id); }, n = g('custom-n').value.trim();
      if (!n) { g('custom-n').focus(); return false; }
      ch.items.push({ id: R.uid(), k: 'custom', n: n, qty: Math.max(1, +g('custom-q').value || 1), w: Math.max(0, +g('custom-w').value || 0), att: g('custom-a').checked, attuned: false, note: '' });
    },
    rmItem: function (v) { ch.items = ch.items.filter(function (i) { return i.id !== v; }); },
    eq: function (v, el) { ch.eq[el.getAttribute('data-i')] = +v; },
    look: function (v, el) { ch.look = ch.look || {}; ch.look[el.getAttribute('data-k')] = v; },
    importSpells: function () { var f = document.getElementById('spellImportFile'); if (f) f.click(); return false; },
    spellImportGo: function () { var I = ui.spellImport; if (!I) return false; var e = I.entries.filter(function (x) { return x.id === I.choose; })[0]; if (e) applySpellImport(e); },
    spellImportCancel: function () { ui.spellImport = null; },
    spellImportClose: function () { ui.spellImportDone = null; },
    undo: function () { return undo(); },
    redo: function () { return redo(); },
    pickPicture: function () { var f = document.getElementById('pictureFile'); if (f) f.click(); return false; },
    removePicture: function () { delete ch.picture; delete ch.pictureFit; ui.pictureError = ''; },
    lookRandom: function () { ch.look = Object.assign({ hidden: (ch.look || {}).hidden || {} }, Avatar.random()); },
    lookReset: function () { ch.look = { hidden: (ch.look || {}).hidden || {} }; },
    rmWeapon: function (v) { ch.weapons = ch.weapons.filter(function (w) { return w !== v; }); }
  };

  // Editing a field and then clicking a button fires "change" in the middle of the click. Redrawing right
  // then would replace the button under the pointer and swallow the click, so the redraw waits for it.
  document.addEventListener('keydown', function (e) {
    if (!(e.ctrlKey || e.metaKey) || e.altKey) return;
    var t = e.target, typing = t && (t.tagName === 'TEXTAREA' || (t.tagName === 'INPUT' && /^(text|search|number|email|url)$/.test(t.type)) || t.isContentEditable);
    if (typing) return;
    var k = e.key.toLowerCase(), r = null;
    if (k === 'z' && !e.shiftKey) r = undo(); else if (k === 'y' || (k === 'z' && e.shiftKey)) r = redo(); else return;
    e.preventDefault();
    if (r !== false) render();
  });

  // The browser offers installing the site as an app; show our own button for it in the top bar.
  var installPrompt = null;
  function isInstalledApp() {
    try { return navigator.standalone === true || window.matchMedia('(display-mode: standalone)').matches || window.matchMedia('(display-mode: window-controls-overlay)').matches; } catch (e) { return false; }
  }
  // Steps for browsers that install from their own menu instead of letting the page ask.
  function installSteps() {
    var ua = navigator.userAgent || '', ios = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
    var android = /Android/.test(ua), firefox = /Firefox|FxiOS/.test(ua), samsung = /SamsungBrowser/.test(ua), edge = /Edg\//.test(ua), opera = /OPR\//.test(ua);
    var safari = /Safari/.test(ua) && !/Chrome|Chromium|CriOS|FxiOS|EdgiOS|Edg\//.test(ua);
    if (!/^https?:$/.test(location.protocol) || window.self !== window.top) return { name: 'this page', steps: ['Open the site itself (https://spendrax.github.io/character-forge/) in your browser, then press Install app there. A preview or a file opened from your computer can\'t be installed.'] };
    if (ios) return { name: 'iPhone and iPad', steps: ['Tap the Share button (the square with an arrow). In Safari it is at the bottom or top of the screen; in Chrome, Edge or Firefox it is in the address bar or the menu.', 'Scroll down and tap Add to Home Screen.', 'Make sure Open as Web App is on, if you see it, then tap Add.'] };
    if (samsung) return { name: 'Samsung Internet', steps: ['Tap the menu (☰) at the bottom.', 'Tap Add page to, then Home screen.'] };
    if (android && firefox) return { name: 'Firefox for Android', steps: ['Tap the menu (⋮).', 'Tap Add app to Home screen (on some versions: Install, or Add to Home screen).'] };
    if (android) return { name: 'your Android browser', steps: ['Open the browser menu (⋮).', 'Tap Install app or Add to Home screen.'] };
    if (safari) return { name: 'Safari on Mac', steps: ['In the menu bar, choose File, then Add to Dock (needs macOS Sonoma or newer).', 'On older macOS, open the site in Chrome or Edge to install it.'] };
    if (firefox) return { name: 'Firefox on a computer', steps: ['Firefox on computers usually can\'t install websites as apps (newer versions on Windows may show an install or taskbar icon in the address bar). Otherwise open the site in Chrome or Edge to install it, or bookmark it here: it works the same in a tab, including offline after the first visit.'] };
    if (edge) return { name: 'Edge', steps: ['Open the menu (…), then Apps, then Install this site as an app.', 'If Install is missing, the app may already be installed: look for it in edge://apps.'] };
    if (opera) return { name: 'Opera', steps: ['Opera on computers can\'t install websites as apps. Open the site in Chrome or Edge to install it.'] };
    return { name: 'Chrome', steps: ['Click the install icon at the right end of the address bar, or open the menu (⋮), then Cast, save and share, then Install page as app.', 'If Install is missing, the app may already be installed: look for it in chrome://apps.'] };
  }
  function installHelpHtml() {
    if (!ui.installHelp) return '';
    var s = installSteps();
    return '<div class="panel install-help noprint" role="dialog" aria-label="How to install"><h3>Install Character Forge on ' + esc(s.name) + '</h3><ol>' + s.steps.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ol>' +
      '<p class="small muted">Once installed it opens in its own window with the Character Forge icon, works offline, and updates itself when you are online.</p>' + btn('closeInstallHelp', 'Close') + '</div>';
  }
  window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); installPrompt = e; requestRender(); });
  window.addEventListener('appinstalled', function () { installPrompt = null; requestRender(); });

  var pointerDown = false, pending = false;
  document.addEventListener('pointerdown', function () { pointerDown = true; }, true);
  document.addEventListener('pointerup', function () {
    pointerDown = false;
    setTimeout(function () { if (pending) { pending = false; render(); } }, 0);
  }, true);
  document.addEventListener('pointercancel', function () { pointerDown = false; if (pending) { pending = false; render(); } }, true);
  function requestRender() { if (pointerDown) pending = true; else render(); }

  document.addEventListener('click', function (e) {
    var el = e.target.closest ? e.target.closest('[data-act]') : null;
    if (!el || el.disabled) return;
    var fn = actions[el.getAttribute('data-act')];
    if (pending) d = R.derive(ch, store.filters); // a field edit is waiting to be drawn: act on fresh numbers
    if (fn && fn(el.getAttribute('data-v'), el) !== false) { pending = false; render(); }
  });
  document.addEventListener('input', function (e) {
    var t = e.target, a = function (n) { return t.getAttribute(n); };
    if (a('data-q') != null) { ui.q[a('data-q')] = t.value; render(); }
    else if (a('data-itemtext')) { var itx = ch.items.filter(function (i) { return i.id === a('data-itemtext'); })[0]; if (itx) { itx.note = t.value; save(); } }
    else if (a('data-text')) { var path = a('data-text').split('.'); if (path.length > 1) ch[path[0]][path[1]] = t.value; else ch[path[0]] = t.value; save(); }
    else if (t.type === 'range' && a('data-clslevel')) { setLevel(a('data-clslevel'), +t.value); render(); }
  });
  document.addEventListener('change', function (e) {
    var t = e.target, a = function (n) { return t.getAttribute(n); };
    if (t.id === 'importFile') return importFile(t);
    if (t.id === 'pictureFile') return loadPicture(t);
    if (t.id === 'spellImportFile') return loadSpellImport(t);
    if (a('data-spellsfrom')) { if (ui.spellImport) ui.spellImport.choose = +a('data-spellsfrom'); return; }
    if (a('data-check') === 'pictureWhole') { ch.pictureFit = t.checked ? 'contain' : ''; return requestRender(); }
    if (a('data-text') || a('data-itemtext')) return requestRender();
    if (a('data-ui')) { if (a('data-ui') === 'current') { store.current = t.value; ui.confirmDelete = false; ui.spellImport = null; ui.spellImportDone = null; } else ui[a('data-ui')] = t.value; }
    else if (a('data-filter')) store.filters[a('data-filter')] = t.checked;
    else if (a('data-imp5target')) { if (ui.import5e) { ui.import5e.target[a('data-imp5target')] = t.value; var idT = +a('data-imp5target'); if (ui.import5e.pick.indexOf(idT) < 0) ui.import5e.pick.push(idT); } }
    else if (a('data-imp5')) { var I5 = ui.import5e, id5 = +a('data-imp5'); if (I5) { I5.pick = I5.pick.filter(function (x) { return x !== id5; }); if (t.checked) I5.pick.push(id5); } }
    else if (a('data-look')) { ch.look = ch.look || {}; ch.look[a('data-look')] = t.value; }
    else if (a('data-lookcolor')) { ch.look = ch.look || {}; ch.look[a('data-lookcolor')] = t.value; }
    else if (a('data-lookhide')) { ch.look = ch.look || {}; ch.look.hidden = ch.look.hidden || {}; if (t.checked) delete ch.look.hidden[a('data-lookhide')]; else ch.look.hidden[a('data-lookhide')] = 1; }
    else if (a('data-setting')) store[a('data-setting')] = t.checked;
    else if (a('data-money')) ch.money[a('data-money')] = Math.max(0, Math.round(+t.value) || 0);
    else if (a('data-item')) { var it = ch.items.filter(function (i) { return i.id === a('data-item'); })[0]; if (it) it[a('data-f')] = Math.max(0, +t.value || 0); }
    else if (a('data-itemcheck')) { var ic = ch.items.filter(function (i) { return i.id === a('data-itemcheck'); })[0]; if (ic) ic.attuned = t.checked; }
    else if (a('data-clslevel')) setLevel(a('data-clslevel'), +t.value);
    else if (a('data-addclass')) { if (t.value && !entry(t.value) && d.level < 20) { ch.classes.push({ cls: t.value, level: 1, subclass: '' }); ui.clsTab = t.value; } }
    else if (a('data-num')) ch[a('data-num')] = Math.max(1, Math.round(+t.value) || 1);
    else if (a('data-pick')) ch.picks[a('data-pick')] = t.value ? [t.value] : [];
    else if (a('data-set')) ch[a('data-set')] = t.value;
    else if (a('data-check')) ch[a('data-check')] = t.checked;
    else if (a('data-addweapon')) { if (t.value && ch.weapons.indexOf(t.value) < 0) ch.weapons.push(t.value); }
    else if (a('data-base')) {
      var ab = a('data-base'), v = Math.max(1, Math.min(20, Math.round(+t.value) || 8));
      if (ch.method === 'array') { var other = AB.filter(function (x) { return x !== ab && ch.base[x] === v; })[0]; if (other) ch.base[other] = ch.base[ab]; }
      ch.base[ab] = v;
    } else return;
    requestRender();
  });
  function setLevel(id, value) {
    var e = entry(id);
    if (!e) return;
    var others = d.classes.reduce(function (n, x) { return n + (x.id === id ? 0 : x.level); }, 0);
    e.level = Math.max(1, Math.min(20 - others, Math.round(value) || 1));
  }
  function importFile(input) {
    var file = input.files && input.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function () {
      ui.importError = false;
      var buf = reader.result;
      try {
        var got = readImportFile(buf);
        if (got && !got.json) {
          var entries = got;
          if (!entries.length) throw new Error('That file has no characters (5th Spellbook or 5e Companion).');
          var nm = function (x) { return String(x || '').trim().toLowerCase(); }, target = {};
          entries.forEach(function (e) { var same = store.chars.filter(function (c) { return nm(c.name) && nm(c.name) === nm(e.name); })[0]; target[e.id] = same ? same.id : 'new'; });
          var anyMatch = entries.some(function (e) { return target[e.id] !== 'new'; });
          // with a matching character, start with just those ticked: the rest are probably not wanted again
          ui.import5e = { source: sourceName(entries[0]), entries: entries, target: target, pick: entries.filter(function (e) { return !anyMatch || target[e.id] !== 'new'; }).map(function (e) { return e.id; }) }; ui.import5eDone = null;
        } else {
          if (!got) throw new Error('not json');
          var o = got.json, list = Array.isArray(o) ? o : (o && Array.isArray(o.chars) ? o.chars : [o]);
          list.forEach(function (c) { if (!c || typeof c !== 'object' || !(('classes' in c) || ('level' in c)) || !c.base) throw new Error('not a character'); c = normalize(c); c.id = R.uid(); store.chars.push(c); store.current = c.id; });
          ui.step = 'sheet';
        }
      } catch (err) { ui.importError = /5th Spellbook|5e Companion/.test(err.message) ? err.message : true; window.console.error('Import failed', err); }
      input.value = '';
      render();
    };
    reader.readAsArrayBuffer(file);
  }
  // Pick which characters to bring in from a 5th Spellbook backup, then report what came across.
  function import5eHtml() {
    var I = ui.import5e, done = ui.import5eDone;
    if (done) return '<div class="panel import5e noprint"><h3>Imported from ' + esc(done.source || '5th Spellbook') + '</h3><ul>' + done.map(function (r) {
      return '<li><b>' + esc(r.name) + '</b> — ' + (r.update ? 'spells updated, everything else kept: ' : 'new character, ') + r.added + ' spell' + (r.added === 1 ? '' : 's') + ' added' + (r.skipped ? ', ' + r.skipped + ' listed in Details → Other notes instead' : '') + '</li>';
    }).join('') + '</ul>' + (done.some(function (r) { return !r.update; }) ? '<p class="small muted">' + (done.source === '5e Companion' ? 'New characters come with everything 5e Companion stores. Step badges show any choice still open, and Details → Other notes lists anything that had no match here.' : 'New characters: ability scores other than the spellcasting one weren\'t in the backup, so they start at 10. Step badges show what is still open (skills, background, equipment…).') + '</p>' : '') + '<p class="small muted">Changed your mind? Press Undo at the top.</p>' + btn('import5eClose', 'Close', {}, 'btn primary') + '</div>';
    if (!I) return '';
    return '<div class="panel import5e noprint" role="dialog" aria-label="Import from ' + esc(I.source) + '"><h3>Import from ' + esc(I.source) + '</h3><p class="muted">Found ' + I.entries.length + ' character' + (I.entries.length === 1 ? '' : 's') + '. ' + (I.source === '5e Companion' ? 'A new character comes in with everything on its sheet: race, background, classes, ability scores, skills, feats, equipment, coins, personality, notes, spells and picture.' : 'A new character comes in with its race, classes and levels, subclasses and spells.') + ' To keep a character you already made and only bring in its spells, choose “Only update the spells of” it.</p><div class="look-items">' +
      I.entries.map(function (e) {
        var n = e.classes.reduce(function (t, c) { return t + c.spells.length; }, e.loose.length);
        var tg = I.target[e.id] || 'new';
        return '<div class="imp-row"><input type="checkbox" id="imp5-' + e.id + '" data-imp5="' + e.id + '"' + (I.pick.indexOf(e.id) >= 0 ? ' checked' : '') + '><div class="imp-main"><label for="imp5-' + e.id + '"><b>' + esc(e.name) + '</b><br><span class="small muted">' + esc(importerOf(e).summary(e)) + ' · ' + n + ' spells</span></label>' +
          '<select data-imp5target="' + e.id + '" aria-label="Where to import ' + esc(e.name) + '"><option value="new"' + (tg === 'new' ? ' selected' : '') + '>Add as a new character</option>' +
          store.chars.map(function (c) { return '<option value="' + c.id + '"' + (tg === c.id ? ' selected' : '') + '>Only update the spells of: ' + esc(title(c)) + '</option>'; }).join('') + '</select>' +
          (tg !== 'new' ? '<div class="small muted">Keeps everything else on ' + esc(title(byId(tg) || {})) + ' as it is: race, classes, abilities, items, notes, picture.</div>' : '') + '</div></div>';
      }).join('') + '</div><div class="toolbar">' + btn('import5eGo', 'Import ' + I.pick.length + ' character' + (I.pick.length === 1 ? '' : 's'), {}, 'btn primary') + btn('import5eAll', I.pick.length === I.entries.length ? 'Select none' : 'Select all') + btn('import5eClose', 'Cancel') + '</div></div>';
  }

  load();
  render();
  window.Forge = { store: store, ui: ui, render: render, derived: function () { return d; } };
})();
