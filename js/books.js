// Books: the free rules (SRD 5.1) built in, plus books you add yourself (PDF, Markdown or text),
// which stay in this browser's storage and are never uploaded anywhere.
(function (root) {
  'use strict';

  // ---------- a small Markdown renderer (headings, lists, tables, quotes, bold/italic, links) ----------
  function slug(s) { return 'h-' + String(s).toLowerCase().replace(/<[^>]+>/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
  function escHtml(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function inline(s) {
    s = escHtml(s);
    s = s.replace(/\[([^\]]+)\]\((https?:[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1');
    s = s.replace(/\*\*\*(.+?)\*\*\*/g, '<b><i>$1</i></b>').replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/(^|[^*])\*([^*\s][^*]*?)\*/g, '$1<i>$2</i>').replace(/`([^`]+)`/g, '<code>$1</code>');
    return s;
  }
  function md(text, heads) {
    var lines = String(text).replace(/\r/g, '').split('\n'), out = [], i = 0, para = [];
    function flush() { if (para.length) { out.push('<p>' + inline(para.join(' ')) + '</p>'); para = []; } }
    while (i < lines.length) {
      var l = lines[i], m;
      if (/^\s*$/.test(l)) { flush(); i++; continue; }
      if ((m = l.match(/^(#{1,6})\s+(.*)$/))) {
        flush(); var lvl = Math.min(6, m[1].length + 1), t = m[2].replace(/#+\s*$/, ''), id = slug(t);
        if (heads) heads.push({ id: id, t: t.replace(/[*_]/g, ''), lvl: lvl });
        out.push('<h' + lvl + ' id="' + id + '">' + inline(t) + '</h' + lvl + '>'); i++; continue;
      }
      if (/^\s*(-{3,}|\*{3,})\s*$/.test(l)) { flush(); out.push('<hr>'); i++; continue; }
      if (/^>/.test(l)) { flush(); var q = []; while (i < lines.length && /^>/.test(lines[i])) q.push(lines[i++].replace(/^>\s?/, '')); out.push('<aside class="bk-box">' + md(q.join('\n'), heads) + '</aside>'); continue; }
      if (/^\|/.test(l)) {
        flush(); var rows = []; while (i < lines.length && /^\|/.test(lines[i])) rows.push(lines[i++]);
        var cells = function (r) { return r.replace(/^\||\|\s*$/g, '').split('|').map(function (c) { return inline(c.trim()); }); };
        var sep = rows[1] && /^\|?\s*:?-+/.test(rows[1]), head = sep ? cells(rows[0]) : null, body = rows.slice(sep ? 2 : 0);
        out.push('<div class="bk-table"><table>' + (head ? '<thead><tr><th>' + head.join('</th><th>') + '</th></tr></thead>' : '') + '<tbody>' + body.map(function (r) { return '<tr><td>' + cells(r).join('</td><td>') + '</td></tr>'; }).join('') + '</tbody></table></div>');
        continue;
      }
      if ((m = l.match(/^\s*([-*+]|\d+\.)\s+/))) {
        flush(); var ol = /\d/.test(m[1]), items = [];
        while (i < lines.length && /^\s*([-*+]|\d+\.)\s+/.test(lines[i])) { var it = lines[i++].replace(/^\s*([-*+]|\d+\.)\s+/, ''); while (i < lines.length && /^\s{2,}\S/.test(lines[i]) && !/^\s*([-*+]|\d+\.)\s+/.test(lines[i])) it += ' ' + lines[i++].trim(); items.push('<li>' + inline(it) + '</li>'); }
        out.push((ol ? '<ol>' : '<ul>') + items.join('') + (ol ? '</ol>' : '</ul>')); continue;
      }
      para.push(l.trim()); i++;
    }
    flush();
    return out.join('');
  }
  // Split a plain or Markdown book into parts at its top-level headings.
  function splitText(name, text) {
    var parts = [], cur = null, lines = String(text).replace(/\r/g, '').split('\n'), top = /^#\s/.test(text) || /\n#\s/.test(text) ? /^#\s+(.*)/ : /^##\s+(.*)/;
    lines.forEach(function (l) { var m = l.match(top); if (m) { cur = { t: m[1].trim(), md: l }; parts.push(cur); } else { if (!cur) { cur = { t: name, md: '' }; parts.push(cur); } cur.md += '\n' + l; } });
    if (!parts.length) parts.push({ t: name, md: text });
    return { chapters: [{ t: name, parts: parts }] };
  }

  // ---------- "Rules from the books": a searchable book built from the summaries the builder already uses ----------
  function ord(n) { return n + (n % 100 > 10 && n % 100 < 14 ? 'th' : ['th', 'st', 'nd', 'rd'][n % 10] || 'th'); }
  function rulesBook(D) {
    var FT = D.featureText || {}, ST = D.spellText || {}, TAG = { setting: ' · setting', ua: ' · Unearthed Arcana', homebrew: ' · homebrew' };
    var src = function (s, tag) { return '*' + (s || '') + (TAG[tag] || '') + '*'; };
    var list = function (a) { return a && a.length ? [].concat(a).join(', ') : 'None'; };
    var abil = function (a) { return a === 'flex' ? '+2 and +1, or three +1s, to scores of your choice' : a ? Object.keys(a).map(function (k) { return k + ' +' + a[k]; }).join(', ') : ''; };
    var byLetter = function (rows, name, one) {
      var parts = [], cur = null;
      rows.slice().sort(function (a, b) { return name(a).localeCompare(name(b)); }).forEach(function (r) {
        var L = name(r)[0].toUpperCase(); if (!cur || cur.t !== L) { cur = { t: L, md: '# ' + L }; parts.push(cur); } cur.md += '\n\n' + one(r);
      });
      return parts;
    };
    var classes = D.classes.map(function (c) {
      var ft = FT[c.id] || {}, byLvl = {}, k = c.casting, cols = Object.keys(c.columns || {}).map(function (n) { return [n, function (i) { var v = c.columns[n][i]; return v === 0 ? '—' : v; }]; });
      var nz = function (a) { return a && a.some(function (v) { return v; }); };
      if (k) {
        if (nz(k.cantrips)) cols.push(['Cantrips', function (i) { return k.cantrips[i] || '—'; }]);
        if (!k.prepared && nz(k.known)) cols.push(['Spells known', function (i) { return k.known[i] || '—'; }]);
        if (k.kind === 'pact') cols.push(['Slots', function (i) { return k.pactSlots[i]; }], ['Slot level', function (i) { return ord(k.pactLevel[i]); }]);
        else { var sl = function (i) { var L = i + 1, r = k.kind === 'full' ? D.fullCasterSlots[L - 1] : k.kind === 'half' && L < 2 ? [] : D.fullCasterSlots[Math.ceil(L / 2) - 1]; return r || []; }, top = sl(19).length;
          for (var j = 0; j < top; j++) (function (j) { cols.push([ord(j + 1), function (i) { return sl(i)[j] || '—'; }]); })(j); }
      }
      c.features.forEach(function (f) { (byLvl[f.l] = byLvl[f.l] || []).push(f.n); });
      (c.asiLevels || []).forEach(function (l) { (byLvl[l] = byLvl[l] || []).push('Ability Score Improvement'); });
      (byLvl[c.subclassLevel] = byLvl[c.subclassLevel] || []).push(c.subclassTerm);
      D.subclasses.forEach(function (s) { if (s.c === c.id) (s.features || []).forEach(function (f) { var L = byLvl[f.l] = byLvl[f.l] || [], n = c.subclassTerm + ' feature'; if (f.l > c.subclassLevel && L.indexOf(n) < 0) L.push(n); }); });
      var m = ['# ' + c.name, src('Class', c.tag), '**Hit die:** d' + c.hitDie + ' · **Saving throws:** ' + list(c.saves) + ' · **Multiclassing:** ' + (c.multiclass || 'none'),
        '## Proficiencies', '- **Armor:** ' + list(c.armor) + '\n- **Weapons:** ' + list(c.weapons) + '\n- **Tools:** ' + list(c.tools) + '\n- **Skills:** choose ' + c.skillChoose + ' from ' + list(c.skillList),
        '## Equipment', c.equipment.map(function (e) { return '- ' + e; }).join('\n'),
        '## ' + c.name + ' table', '| Level | Prof. | Features |' + cols.map(function (x) { return ' ' + x[0] + ' |'; }).join('') + '\n|' + '---|'.repeat(3 + cols.length) + '\n' +
          Array.from({ length: 20 }, function (_, i) { return '| ' + ord(i + 1) + ' | +' + (Math.ceil((i + 1) / 4) + 1) + ' | ' + (byLvl[i + 1] || ['—']).join(', ') + ' |' + cols.map(function (x) { return ' ' + x[1](i) + ' |'; }).join(''); }).join('\n'),
        '## Class features'];
      c.features.forEach(function (f) { m.push('### ' + f.n + ' (' + ord(f.l) + ' level)', ft[f.n] || f.t); });
      if (c.asiLevels) m.push('### Ability Score Improvement', 'At ' + c.asiLevels.map(ord).join(', ') + ' level, raise one ability score by 2 or two by 1 (max 20), or take a feat.');
      if (c.fightingStyles && D.fightingStyles) m.push('### Fighting Style options', c.fightingStyles.map(function (n) { return '- **' + n + '.** ' + (D.fightingStyles[n] || ''); }).join('\n'));
      m.push('## ' + c.subclassTerm + 's');
      D.subclasses.filter(function (s) { return s.c === c.id; }).forEach(function (s) {
        var sft = FT[s.id] || {};
        m.push('### ' + s.name, src(s.source, s.tag));
        if (s.spells) m.push('**Spells:** ' + Object.keys(s.spells).map(function (l) { return ord(+l) + ': ' + s.spells[l].join(', '); }).join(' · '));
        (s.features || []).forEach(function (f) { m.push('**' + f.n + ' (' + ord(f.l) + ').** ' + (sft[f.n] || f.t)); });
      });
      return { t: c.name, md: m.join('\n\n') };
    });
    var opt = [['Fighting styles', D.fightingStyles], ['Metamagic', D.metamagic], ['Pact boons', D.pactBoons], ['Eldritch invocations', D.invocations], ['Artificer infusions', D.infusions],
      ['Battle Master maneuvers', D.maneuvers], ['Elemental disciplines', D.disciplines], ['Blood curses', D.bloodCurses], ['Arcane shots', D.arcaneShots], ['Runes', D.runes]]
      .filter(function (o) { return o[1]; }).map(function (o) {
        var rows = Array.isArray(o[1]) ? o[1] : Object.keys(o[1]).map(function (k) { return [k, o[1][k]]; });
        return { t: o[0], md: '# ' + o[0] + '\n\n' + rows.map(function (r) { var mid = r.length > 2 && r[1] !== '' ? ' *(' + (typeof r[1] === 'number' ? r[1] + ' ki' : r[1]) + ')*' : ''; return '**' + r[0] + '.**' + mid + ' ' + r[r.length - 1]; }).join('\n\n') };
      });
    var traits = function (v) {
      var bits = [], sp = v.sp ? v.sp + ' ft' + (v.fly ? ', fly ' + (v.fly === true ? 'equal to walking' : v.fly + ' ft') : '') + (v.swim ? ', swim ' + (v.swim === true ? 'equal to walking' : v.swim + ' ft') : '') + (v.climb ? ', climb ' + (v.climb === true ? 'equal to walking' : v.climb + ' ft') : '') : '';
      if (v.a) bits.push('**Ability scores:** ' + abil(v.a)); if (v.sz) bits.push('**Size:** ' + v.sz); if (sp) bits.push('**Speed:** ' + sp); if (v.dv) bits.push('**Darkvision:** ' + v.dv + ' ft');
      if (v.lang || v.lc) bits.push('**Languages:** ' + (v.lang || []).concat(v.lc ? [v.lc + ' of your choice'] : []).join(', '));
      return (bits.length ? bits.join(' · ') + '\n\n' : '') + (v.tr || []).map(function (t) { return '**' + t[0] + '.** ' + t[1]; }).join('\n\n');
    };
    var races = D.lineages.map(function (l) {
      return { t: l.name, md: '# ' + l.name + '\n\n' + l.versions.map(function (v) {
        return '## ' + v.n + '\n\n' + src(v.s, v.tag || l.tag) + '\n\n' + traits(v) + (v.pick ? '\n\n**' + v.pick.label + ':** ' + v.pick.from.join(', ') : '') +
          (v.subs || []).filter(function (s) { return s.tr || s.a; }).map(function (s) { return '\n\n### ' + s.n + '\n\n' + src(s.s, s.tag) + '\n\n' + traits(s); }).join('');
      }).join('\n\n') };
    });
    var bgs = byLetter(D.backgrounds, function (b) { return b.n; }, function (b) {
      var sk = (b.sk || []).concat(b.skc ? ['choose ' + b.skc.n + ' from ' + list(b.skc.from)] : []);
      return '## ' + b.n + '\n\n' + src(b.s, b.tag) + '\n\n- **Skills:** ' + list(sk) + (b.tools ? '\n- **Tools:** ' + list([].concat(b.tools)) : '') +
        (b.lang || b.lc ? '\n- **Languages:** ' + (b.lang || []).concat(b.lc ? [b.lc + ' of your choice'] : []).join(', ') : '') + (b.eq ? '\n- **Equipment:** ' + b.eq : '') +
        (b.f ? '\n\n**Feature: ' + b.f[0] + '.** ' + b.f[1] : '');
    });
    var feats = byLetter(D.feats, function (f) { return f.n; }, function (f) {
      return '## ' + f.n + '\n\n' + src(f.s, f.tag) + (f.pre ? ' · Prerequisite: ' + f.pre : '') + (f.asi && f.asi.length ? ' · +1 to ' + (f.asi[0] === 'ANY' ? 'any ability' : f.asi.join(' or ')) : '') + '\n\n' + f.t;
    });
    var spells = Object.keys(D.spells).map(function (k) { return D.spells[k]; });
    var levels = Array.from({ length: 10 }, function (_, l) {
      var t = l ? ord(l) + ' level' : 'Cantrips', rows = spells.filter(function (s) { return s.level === l; }).sort(function (a, b) { return a.name.localeCompare(b.name); });
      return { t: t, md: '# ' + t + ' spells\n\n' + rows.map(function (s) {
        var cls = Object.keys(D.spellLists || {}).filter(function (c) { return D.spellLists[c].indexOf(s.name) >= 0; });
        return '## ' + s.name + '\n\n*' + (l ? ord(l) + '-level ' + s.school.toLowerCase() : s.school + ' cantrip') + (s.ritual ? ' (ritual)' : '') + (TAG[s.tag] || '') + '*\n\n' +
          '**Casting time:** ' + s.time + ' · **Range:** ' + s.range + ' · **Components:** ' + s.comp + ' · **Duration:** ' + (s.conc ? 'Concentration, ' : '') + s.duration +
          (cls.length ? '\n\n**Classes:** ' + cls.join(', ') : '') + '\n\n' + (ST[s.name] || '[Full text on the wiki](' + s.url + ')');
      }).join('\n\n') };
    });
    return { id: 'rules', title: 'Rules from the books (summaries)', chapters: [
      { t: 'Classes', parts: classes }, { t: 'Class options', parts: opt }, { t: 'Races', parts: races },
      { t: 'Backgrounds', parts: bgs }, { t: 'Feats', parts: feats }, { t: 'Spells', parts: levels }] };
  }

  // One book: the summaries, then the SRD chapters they don't cover (equipment, playing, spellcasting, game master, magic items).
  function withSrd(book, srd) {
    var dup = { Races: 1, Classes: 1, 'Personality and background': 1, Feats: 1, 'Spells A–Z': 1 };
    book.title = 'Rules'; book.chapters = book.chapters.concat(srd.chapters.filter(function (c) { return !dup[c.t]; }));
    return book;
  }

  // ---------- storage for your own books (IndexedDB, same database as imported monsters) ----------
  var DB = null;
  function idb() {
    if (!DB) DB = new Promise(function (ok, no) { var r = root.indexedDB.open('character-forge', 1); r.onupgradeneeded = function () { r.result.createObjectStore('kv'); }; r.onsuccess = function () { ok(r.result); }; r.onerror = function () { no(r.error); }; });
    return DB;
  }
  function get(k) { return idb().then(function (db) { return new Promise(function (ok, no) { var q = db.transaction('kv').objectStore('kv').get(k); q.onsuccess = function () { ok(q.result); }; q.onerror = function () { no(q.error); }; }); }); }
  function put(k, v) { return idb().then(function (db) { return new Promise(function (ok, no) { var t = db.transaction('kv', 'readwrite'); if (v === undefined) t.objectStore('kv').delete(k); else t.objectStore('kv').put(v, k); t.oncomplete = function () { ok(); }; t.onerror = function () { no(t.error); }; }); }); }

  function loadScript(src) { return new Promise(function (ok, no) { var s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = no; document.head.appendChild(s); }); }

  root.BooksUI = function (api) {
    var esc = api.esc, btn = api.btn, ui = api.ui, store = api.store, render = api.render;
    var B = ui.books = ui.books || { open: 'rules', part: null, q: '', toc: true };
    var mine = null;          // list of your books: [{id, name, kind, size}]
    var texts = {};           // id → book object made from a Markdown/text file
    var pdf = { id: null, doc: null, page: 1, pages: 0, text: null, busy: false, err: '' };
    var lower = {};           // search cache: bookId → [[chapterIdx, partIdx, lowercased md]]

    function srdReady() { return root.DND && root.DND.book; }
    function ensure() {
      if (!srdReady() && !B.loading) { B.loading = true; loadScript('data/srd-book.js').then(function () { B.loading = false; render(); }, function () { B.loading = false; B.err = 'Couldn’t load the free rules. Check your connection and try again.'; render(); }); }
      if (!mine && root.indexedDB) { mine = []; get('books').then(function (l) { mine = l || []; render(); }, function () { mine = []; }); }
    }
    var rules = null, BUILT = [{ id: 'rules', kind: 'rules', name: 'Rules' }];
    function bookObj(id) { return id === 'rules' ? (rules = rules || withSrd(rulesBook(root.DND), root.DND.book)) : texts[id]; }
    function pos() { return store.bookPos = store.bookPos || {}; }

    // ---------- reading the free rules or a text book ----------
    function tocHtml(book, id) {
      var p = B.part || pos()[id] || '0.0';
      return '<nav class="bk-toc" aria-label="Contents">' + book.chapters.map(function (c, ci) {
        var openCh = String(p).split('.')[0] === String(ci) || B.q;
        return '<details' + (openCh ? ' open' : '') + '><summary>' + esc(c.t) + '</summary>' + c.parts.map(function (x, pi) {
          var k = ci + '.' + pi; return '<button type="button" class="bk-link' + (k === p ? ' on' : '') + '" data-act="bkPart" data-v="' + k + '">' + esc(x.t) + '</button>';
        }).join('') + '</details>';
      }).join('') + '</nav>';
    }
    function searchHtml(book, id) {
      var q = B.q.trim().toLowerCase(); if (q.length < 3) return '<p class="muted small">Type at least 3 letters.</p>';
      if (!lower[id]) { lower[id] = []; book.chapters.forEach(function (c, ci) { c.parts.forEach(function (x, pi) { lower[id].push([ci, pi, x.md.toLowerCase()]); }); }); }
      var hits = [];
      lower[id].some(function (e) {
        var from = 0, at, md0 = book.chapters[e[0]].parts[e[1]].md;
        while ((at = e[2].indexOf(q, from)) >= 0 && hits.length < 80) {
          var before = md0.lastIndexOf('\n#', at), h = before >= 0 ? md0.slice(before + 1, md0.indexOf('\n', before + 1) >>> 0).replace(/^#+\s*/, '') : '';
          var a = Math.max(0, at - 70), snip = md0.slice(a, at + q.length + 90).replace(/[#*>|_]/g, ' ').replace(/\s+/g, ' ');
          hits.push({ k: e[0] + '.' + e[1], part: book.chapters[e[0]].parts[e[1]].t, h: h.replace(/[*_]/g, ''), snip: snip });
          from = at + q.length + 400; // one hit per passage
        }
        return hits.length >= 80;
      });
      if (!hits.length) return '<p class="muted">Nothing found for “' + esc(B.q) + '”.</p>';
      var rx = new RegExp(B.q.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'ig');
      return '<p class="small muted">' + hits.length + (hits.length >= 80 ? '+' : '') + ' results</p><div class="bk-hits">' + hits.map(function (x) {
        return '<button type="button" class="bk-hit" data-act="bkHit" data-v="' + x.k + '" data-h="' + esc(slug(x.h)) + '"><b>' + esc(x.h || x.part) + '</b> <span class="small muted">' + esc(x.part) + '</span><span class="small">…' + esc(x.snip).replace(rx, function (s) { return '<mark>' + s + '</mark>'; }) + '…</span></button>';
      }).join('') + '</div>';
    }
    function readerHtml(book, id) {
      var k = B.part || pos()[id] || '0.0', ix = k.split('.').map(Number), c = book.chapters[ix[0]] || book.chapters[0], p = c.parts[ix[1]] || c.parts[0];
      var heads = [], body = md(p.md, heads), sub = heads.filter(function (h) { return h.lvl === 3; });
      if (B.q.trim().length >= 3) { var rx = new RegExp('(' + B.q.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')(?![^<]*>)', 'ig'); body = body.replace(rx, '<mark>$1</mark>'); }
      var all = []; book.chapters.forEach(function (cc, ci) { cc.parts.forEach(function (_, pi) { all.push(ci + '.' + pi); }); });
      var at = all.indexOf(ix[0] + '.' + ix[1]), prev = all[at - 1], next = all[at + 1];
      var name = function (kk) { var j = kk.split('.').map(Number); return book.chapters[j[0]].parts[j[1]].t; };
      return '<article class="bk-page">' + '<p class="small muted bk-crumb">' + esc(book.title || '') + ' › ' + esc(c.t) + '</p>' +
        (sub.length > 3 ? '<details class="bk-jump"><summary>On this page (' + sub.length + ')</summary><div>' + sub.map(function (h) { return '<button type="button" class="linkbtn" data-act="bkJump" data-v="' + h.id + '">' + esc(h.t) + '</button>'; }).join('') + '</div></details>' : '') +
        body + '<div class="toolbar bk-nav">' + (prev ? btn('bkPart', '‹ ' + esc(name(prev)), { v: prev }, 'btn') : '') + '<span class="spacer"></span>' + (next ? btn('bkPart', esc(name(next)) + ' ›', { v: next }, 'btn') : '') + '</div></article>';
    }

    // ---------- reading a PDF with pdf.js ----------
    function pdfLib() {
      if (root.pdfjsLib) return Promise.resolve(root.pdfjsLib);
      return loadScript('js/vendor/pdfjs/pdf.js').then(function () { root.pdfjsLib.GlobalWorkerOptions.workerSrc = 'js/vendor/pdfjs/pdf.worker.js'; return root.pdfjsLib; });
    }
    function openPdf(id) {
      if (pdf.id === id && (pdf.doc || pdf.busy)) return;
      pdf.id = id; pdf.doc = null; pdf.busy = true; pdf.err = ''; pdf.text = null; pdf.page = +(pos()[id] || 1);
      Promise.all([pdfLib(), get('book:' + id)]).then(function (r) {
        if (!r[1]) throw new Error('missing');
        return r[0].getDocument({ data: new Uint8Array(r[1]) }).promise;
      }).then(function (doc) { if (pdf.id !== id) return; pdf.doc = doc; pdf.pages = doc.numPages; pdf.page = Math.min(pdf.page, doc.numPages); pdf.busy = false; render(); },
        function (e) { pdf.busy = false; pdf.err = e && e.message === 'missing' ? 'This book’s file is missing. Remove it and add it again.' : 'Couldn’t open this PDF (' + (e && e.message || 'unknown error') + ').'; render(); });
    }
    function drawPdf() {
      var cv = document.getElementById('bk-canvas'); if (!cv || !pdf.doc) return;
      var want = pdf.page;
      pdf.doc.getPage(want).then(function (page) {
        if (want !== pdf.page) return;
        var box = cv.parentNode.clientWidth || 800, v1 = page.getViewport({ scale: 1 }), scale = box / v1.width, dpr = Math.min(2, root.devicePixelRatio || 1), vp = page.getViewport({ scale: scale * dpr });
        cv.width = vp.width; cv.height = vp.height; cv.style.width = Math.floor(vp.width / dpr) + 'px';
        if (pdf.task) try { pdf.task.cancel(); } catch (e) { /* already done */ }
        pdf.task = page.render({ canvasContext: cv.getContext('2d'), viewport: vp });
        pdf.task.promise.catch(function () { /* replaced by a newer page */ });
      });
    }
    function pdfSearch() {
      var q = B.q.trim().toLowerCase(); if (q.length < 3) return '<p class="muted small">Type at least 3 letters.</p>';
      if (!pdf.text) {
        if (!pdf.indexing) {
          pdf.indexing = true; pdf.text = null; var pages = [], n = pdf.pages, done = 0;
          (function next(i) {
            if (i > n || pdf.id == null) { pdf.text = pages; pdf.indexing = false; render(); return; }
            pdf.doc.getPage(i).then(function (pg) { return pg.getTextContent(); }).then(function (tc) { pages[i] = tc.items.map(function (x) { return x.str; }).join(' '); done++; if (done % 40 === 0) { B.progress = done + ' / ' + n; render(); } next(i + 1); }, function () { pages[i] = ''; next(i + 1); });
          })(1);
        }
        return '<p class="muted small">Reading the book’s text for search… ' + esc(B.progress || '') + '</p>';
      }
      var any = pdf.text.some(function (t) { return t && t.trim(); });
      if (!any) return '<p class="muted">This PDF has no text to search. It is probably scanned pictures of pages. You can still read it page by page.</p>';
      var hits = [];
      pdf.text.forEach(function (t, i) { if (!t || hits.length >= 80) return; var l = t.toLowerCase(), at = l.indexOf(q); if (at >= 0) hits.push({ p: i, snip: t.slice(Math.max(0, at - 70), at + q.length + 90).replace(/\s+/g, ' ') }); });
      if (!hits.length) return '<p class="muted">Nothing found for “' + esc(B.q) + '”.</p>';
      var rx = new RegExp(B.q.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'ig');
      return '<p class="small muted">' + hits.length + (hits.length === 1 ? ' page' : ' pages') + '</p><div class="bk-hits">' + hits.map(function (x) {
        return '<button type="button" class="bk-hit" data-act="bkPage" data-v="' + x.p + '"><b>Page ' + x.p + '</b><span class="small">…' + esc(x.snip).replace(rx, function (s) { return '<mark>' + s + '</mark>'; }) + '…</span></button>';
      }).join('') + '</div>';
    }
    function pdfHtml(meta) {
      openPdf(meta.id);
      if (pdf.err) return '<p class="rest-msg">' + esc(pdf.err) + '</p>';
      if (!pdf.doc) return '<p class="muted">Opening ' + esc(meta.name) + '…</p>';
      var nav = '<div class="toolbar bk-pdfnav">' + btn('bkPage', '‹ Previous', { v: pdf.page - 1 }, 'btn') + '<label class="mon-f">Page <input type="number" id="bk-pg" data-bkpage="1" min="1" max="' + pdf.pages + '" value="' + pdf.page + '"> of ' + pdf.pages + '</label>' + btn('bkPage', 'Next ›', { v: pdf.page + 1 }, 'btn') + '</div>';
      return nav + '<div class="bk-pdf"><canvas id="bk-canvas" aria-label="Page ' + pdf.page + '"></canvas></div>' + nav;
    }

    // ---------- the page ----------
    function shelfHtml() {
      var list = BUILT.concat(mine || []);
      return '<div class="bk-shelf">' + list.map(function (b) {
        return '<button type="button" class="pill' + (B.open === b.id ? ' on' : '') + '" data-act="bkOpen" data-v="' + esc(b.id) + '">' + (b.kind === 'pdf' ? '📕 ' : '📘 ') + esc(b.name) + '</button>';
      }).join('') + '<label class="btn small bk-add">+ Add a book<input type="file" id="bookFile" accept=".pdf,.md,.markdown,.txt,application/pdf,text/plain,text/markdown" hidden></label></div>';
    }
    function html() {
      ensure();
      var meta = BUILT.concat(mine || []).filter(function (b) { return b.id === B.open; })[0];
      if (!meta) { B.open = 'rules'; meta = BUILT[0]; }
      var own = meta.kind === 'pdf' || meta.kind === 'text';
      var h = '<main class="mon-main bk-main"><h2>Books</h2>' + shelfHtml() + (B.msg ? '<p class="small rest-msg">' + esc(B.msg) + '</p>' : '');
      var search = '<input type="search" id="bk-q" data-bk="q" placeholder="Search ' + esc(meta.name) + '…" value="' + esc(B.q) + '">';
      var tools = own ? '<div class="toolbar">' + (B.confirmRm === meta.id ? '<span class="small">Remove “' + esc(meta.name) + '” from this device?</span>' + btn('bkRemove', 'Remove', { v: meta.id }, 'btn danger') + btn('bkRemoveCancel', 'Keep', {}, 'btn') : btn('bkRemoveAsk', 'Remove this book', { v: meta.id }, 'btn small')) + '</div>' : '';
      if (meta.kind === 'pdf') {
        h += '<div class="bk-layout bk-layout-pdf"><aside class="bk-side">' + search + (B.q ? (pdf.doc ? pdfSearch() : '') : '<p class="small muted">Search finds the pages that mention a word.</p>') + tools + '</aside><section class="bk-read">' + pdfHtml(meta) + '</section></div>';
      } else {
        if (meta.kind === 'rules' && !srdReady()) return h + '<p class="muted">' + esc(B.err || 'Loading the free rules…') + '</p></main>';
        if (own && !texts[meta.id]) {
          if (!B.loadingText) { B.loadingText = true; get('book:' + meta.id).then(function (t) { B.loadingText = false; texts[meta.id] = splitText(meta.name, typeof t === 'string' ? t : ''); texts[meta.id].title = meta.name; render(); }, function () { B.loadingText = false; }); }
          return h + '<p class="muted">Opening…</p></main>';
        }
        var book = bookObj(meta.id);
        h += '<div class="bk-layout"><aside class="bk-side' + (B.toc ? '' : ' closed') + '">' + search + (B.q ? searchHtml(book, meta.id) : tocHtml(book, meta.id)) + tools + '</aside><section class="bk-read">' +
          '<button type="button" class="btn small bk-tocbtn" data-act="bkToc">' + (B.toc ? 'Hide contents' : '☰ Contents') + '</button>' + readerHtml(book, meta.id) + '</section></div>';
      }
      if (meta.kind === 'rules') h += '<p class="small muted">The equipment, play, spellcasting, game master and magic item chapters are from the official free rules. This work includes material taken from the System Reference Document 5.1 (“SRD 5.1”) by Wizards of the Coast LLC, available at <a href="https://dnd.wizards.com/resources/systems-reference-document" target="_blank" rel="noopener">dnd.wizards.com</a>, licensed under the <a href="https://creativecommons.org/licenses/by/4.0/legalcode" target="_blank" rel="noopener">Creative Commons Attribution 4.0 International License</a>. Text prepared by <a href="https://github.com/OldManUmby/DND.SRD.Wiki" target="_blank" rel="noopener">OldManUmby’s SRD reForged</a>.</p>';
      if (meta.kind === 'rules') h += '<p class="small muted">The classes, class options, races, backgrounds, feats and spells are short summaries in our own words, from <a href="https://dnd5e.wikidot.com" target="_blank" rel="noopener">dnd5e.wikidot.com</a>. They are not the books’ text: check the book for exact wording.</p>';
      else h += '<p class="small muted">Books you add stay in this browser on this device. They are never uploaded or shared.</p>';
      return h + '</main>';
    }
    // After the page is drawn: scroll to a heading, draw the PDF page.
    function after() {
      if (B.jump) { var el = document.getElementById(B.jump); B.jump = null; if (el) el.scrollIntoView({ block: 'start' }); }
      else if (B.top) { B.top = false; var r = document.querySelector('.bk-read'); if (r) r.scrollIntoView({ block: 'start' }); }
      if (pdf.doc && document.getElementById('bk-canvas')) drawPdf();
    }
    function goPart(k) { B.part = k; pos()[B.open] = k; B.top = true; if (root.innerWidth < 800) B.toc = false; }
    var actions = {
      bkOpen: function (v) { B.open = v; B.part = null; B.q = ''; B.msg = ''; B.confirmRm = null; B.toc = true; },
      bkPart: function (v) { goPart(v); },
      bkHit: function (v, el) { goPart(v); B.jump = el.getAttribute('data-h') || null; B.top = !B.jump; },
      bkJump: function (v) { B.jump = v; },
      bkToc: function () { B.toc = !B.toc; },
      bkPage: function (v) { var n = Math.max(1, Math.min(pdf.pages || 1, +v)); pdf.page = n; pos()[B.open] = n; B.top = true; },
      bkRemoveAsk: function (v) { B.confirmRm = v; },
      bkRemoveCancel: function () { B.confirmRm = null; },
      bkRemove: function (v) {
        mine = (mine || []).filter(function (b) { return b.id !== v; }); delete texts[v]; delete lower[v]; if (pdf.id === v) { pdf.id = null; pdf.doc = null; }
        put('books', mine); put('book:' + v, undefined); B.open = 'rules'; B.confirmRm = null; B.msg = 'Book removed from this device.';
      }
    };
    function onInput(t) {
      if (t.getAttribute('data-bk') === 'q') { B.q = t.value; return 'render'; }
      if (t.getAttribute('data-bkpage')) return 'none';
      return null;
    }
    function onChange(t) {
      if (t.getAttribute('data-bkpage')) { actions.bkPage(t.value); return 'render'; }
      return null;
    }
    function importFile(input) {
      var f = input.files && input.files[0]; input.value = ''; if (!f) return;
      var isPdf = /\.pdf$/i.test(f.name) || f.type === 'application/pdf', isText = /\.(md|markdown|txt)$/i.test(f.name) || /^text\//.test(f.type);
      if (!isPdf && !isText) { B.msg = 'Books can be PDF, Markdown (.md) or text (.txt) files.'; render(); return; }
      if (!root.indexedDB) { B.msg = 'This browser can’t store books.'; render(); return; }
      B.msg = 'Adding ' + f.name + '…'; render();
      var id = 'b' + Date.now().toString(36), name = f.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ');
      (isPdf ? f.arrayBuffer() : f.text()).then(function (data) {
        return put('book:' + id, data).then(function () { mine = (mine || []).concat([{ id: id, name: name, kind: isPdf ? 'pdf' : 'text', size: f.size }]); return put('books', mine); });
      }).then(function () { B.open = id; B.part = null; B.q = ''; B.msg = 'Added “' + name + '”. It stays on this device only.'; render(); },
        function (e) { B.msg = 'Couldn’t store the book' + (e && e.name === 'QuotaExceededError' ? ': the browser is out of space.' : '.'); render(); });
    }
    return { html: html, after: after, actions: actions, onInput: onInput, onChange: onChange, importFile: importFile };
  };
  root.BooksUI.md = md;
  root.BooksUI.splitText = splitText;
  root.BooksUI.rulesBook = rulesBook;
  root.BooksUI.withSrd = withSrd;
})(typeof window !== 'undefined' ? window : globalThis);
