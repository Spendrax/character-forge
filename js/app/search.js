// Search everything (the 🔎 button at the top): one box that finds a spell, feat, item, monster, condition, one of
// your characters or a page of the app, in the game you are in. A result opens in place; "Search the rule books"
// carries the words to the Books page, which searches the full texts.
var GS_SHOW = 6; // results shown per group until "Show all"
function gsState() {
  return (ui.gs = ui.gs || { open: '', all: '' });
}
// names that hold the words, the ones starting with them first
function gsPick(list, q, name) {
  return list
    .reduce(function (out, e, i) {
      var at = String(name(e) || '')
        .toLowerCase()
        .indexOf(q);
      if (at >= 0) out.push({ e: e, i: i, at: at ? 1 : 0, n: name(e) });
      return out;
    }, [])
    .sort(function (a, b) {
      return a.at - b.at || String(a.n).localeCompare(String(b.n));
    });
}
function gsPages() {
  var g = gameOf();
  return g === 'pf2' || g === 'sf2'
    ? [
        [g + '-chars', 'Characters'],
        [g + '-party', 'Party'],
        [g + '-enc', 'Encounters'],
        [g + '-mon', 'Monsters'],
        [g + '-loot', 'Treasure'],
        [g + '-rules', 'Rules'],
        ['books', 'Books'],
        ['audio', 'Audio: music and sounds'],
        ['rules', 'House rules'],
        ['backup', 'Backup and earlier versions']
      ]
    : g === 'mm'
      ? [
          ['mm-heroes', 'Heroes'],
          ['mm-party', 'Team'],
          ['mm-enc', 'Fights'],
          ['mm-foes', 'Foes'],
          ['mm-loot', 'Rewards'],
          ['mm-rules', 'Rules'],
          ['audio', 'Audio: music and sounds'],
          ['rules', 'House rules'],
          ['backup', 'Backup and earlier versions']
        ]
      : g === 'sd'
        ? [
            ['sd-chars', 'Characters'],
            ['dm', 'GM tools: the table, the light, generators'],
            ['books', 'Books'],
            ['audio', 'Audio: music and sounds'],
            ['rules', 'House rules'],
            ['backup', 'Backup and earlier versions']
          ]
        : [
            ['roster', 'Characters'],
            ['party', 'Party'],
            ['encounters', 'Encounters'],
            ['monsters', 'Monsters'],
            ['treasure', 'Treasure'],
            ['gen', 'Generators: NPCs, taverns, shops'],
            ['items', 'Magic items'],
            ['books', 'Books'],
            ['audio', 'Audio: music and sounds'],
            ['rules', 'House rules'],
            ['backup', 'Backup and earlier versions']
          ];
}
// your characters, in every game
function gsChars() {
  var out = store.chars.reduce(function (a, c) {
    if (c.name) a.push({ n: c.name, meta: 'D&D 5e · ' + (classLine(c) || 'new character'), act: 'openChar', v: c.id });
    return a;
  }, []);
  [
    ['pf2', 'Pathfinder 2e', 'chars', 'pf2-chars'],
    ['sf2', 'Starfinder 2e', 'chars', 'sf2-chars'],
    ['mm', 'Mutants & Masterminds', 'heroes', 'mm-heroes'],
    ['sd', 'Shadowdark', 'chars', 'sd-chars']
  ].forEach(function (g) {
    ((store[g[0]] || {})[g[2]] || []).forEach(function (c) {
      if (c.name || c.n) out.push({ n: c.name || c.n, meta: g[1], act: 'gsChar', v: g[0] + ':' + g[3] + ':' + c.id });
    });
  });
  return out;
}
// the groups of results for the words typed: [{ id, label, rows: [{ k, n, meta, html() }] }]
function gsGroups(q) {
  var g = gameOf(),
    groups = [],
    add = function (id, label, rows) {
      if (rows.length) groups.push({ id: id, label: label, rows: rows });
    };
  add(
    'char',
    'Your characters',
    gsPick(gsChars(), q, function (c) {
      return c.n;
    }).map(function (x) {
      return { n: x.e.n, meta: x.e.meta, act: x.e.act, v: x.e.v };
    })
  );
  if (g === 'dnd') {
    add(
      'spell',
      'Spells',
      gsPick(Object.keys(D.spells), q, function (k) {
        return k;
      }).map(function (x) {
        var s = D.spells[x.e];
        return {
          k: 'spell:' + x.e,
          n: s.name,
          meta: spellMeta(s),
          html: function () {
            return (
              '<p class="small muted">Components: ' +
              esc(s.comp || '—') +
              (s.conc ? ' · concentration' : '') +
              '</p>' +
              BOOKS_MD((D.spellText || {})[x.e] || 'Loading the description…') +
              (s.url
                ? '<p class="small"><a href="' + esc(s.url) + '" target="_blank" rel="noopener">Wiki ↗</a></p>'
                : '')
            );
          }
        };
      })
    );
    add(
      'feat',
      'Feats',
      gsPick(D.feats, q, function (f) {
        return f.n;
      }).map(function (x) {
        var f = x.e;
        return {
          k: 'feat:' + x.i,
          n: f.n,
          meta: f.s || '',
          html: function () {
            return (f.pre ? '<p class="small muted">Prerequisite: ' + esc(f.pre) + '</p>' : '') + BOOKS_MD(f.t || '');
          }
        };
      })
    );
    add(
      'item',
      'Magic items',
      gsPick(allMagic(), q, function (m) {
        return m[0];
      }).map(function (x) {
        var m = x.e;
        return {
          k: 'item:' + m[0],
          n: m[0],
          meta: m[2] + ' · ' + (m[1] || []).join(', ') + (m[3] ? ' · attunement' : ''),
          html: function () {
            return itemDescHtml({ k: 'magic', n: m[0], slug: m[4] }, true);
          }
        };
      })
    );
    MON.ensure(render);
    add(
      'mon',
      'Monsters',
      gsPick(MON.all(), q, function (m) {
        return m.n;
      }).map(function (x) {
        var m = x.e;
        return {
          k: 'mon:' + m.id,
          n: m.n,
          meta: 'CR ' + MON.crText(m.cr) + (m.type ? ' · ' + m.type : ''),
          html: function () {
            return (
              '<p class="small">' +
              esc([m.size, m.type, m.al].filter(Boolean).join(', ')) +
              (m.acv || m.ac ? ' · AC ' + esc(m.acv || m.ac) : '') +
              (m.hp ? ' · ' + esc(m.hp) + ' HP' : '') +
              '</p><div class="toolbar">' +
              btn('gsMon', 'Open its stat block', { v: m.n }, 'btn small primary') +
              '</div>'
            );
          }
        };
      })
    );
    add(
      'cond',
      'Conditions',
      gsPick(CONDS, q, function (c) {
        return c[0];
      }).map(function (x) {
        return {
          k: 'cond:' + x.i,
          n: x.e[0],
          meta: 'Condition',
          html: function () {
            return '<p>' + esc(x.e[1]) + '</p>';
          }
        };
      })
    );
  }
  if (g === 'pf2' || g === 'sf2') {
    var V = gameReady(g) ? (g === 'sf2' ? SFV : PFV) : null,
      P = V && V.data && V.data();
    if (V && V.need(['core', 'feats', 'spells', 'items', 'bestiary']) && P) {
      var kind = function (id, label, list, meta, extra) {
        add(
          id,
          label,
          gsPick(list || [], q, function (e) {
            return e.n;
          }).map(function (x) {
            var e = x.e;
            return {
              k: id + ':' + e.id,
              n: e.n,
              meta: meta(e),
              html: function () {
                return (
                  ((e.t || []).length
                    ? '<p class="small muted">' + esc(e.t.join(', ').replace(/-/g, ' ')) + '</p>'
                    : '') +
                  (e.pre && e.pre.length
                    ? '<p class="small muted">Prerequisites: ' + esc(e.pre.join('; ')) + '</p>'
                    : '') +
                  V.md(e.d) +
                  (extra ? extra(e) : '')
                );
              }
            };
          })
        );
      };
      var lv = function (word) {
        return function (e) {
          return word + (e.lv != null ? ' ' + e.lv : '') + (e.src ? ' · ' + e.src : '');
        };
      };
      kind('pfeat', 'Feats', P.feats, lv('Feat'));
      kind('pspell', 'Spells', P.spells, function (e) {
        return (
          (e.cat === 'focus' ? 'Focus ' : e.lv === 0 || e.cat === 'cantrip' ? 'Cantrip ' : 'Spell ') +
          (e.lv || '') +
          (e.src ? ' · ' + e.src : '')
        );
      });
      kind('pitem', 'Items', P.items, lv('Item'));
      kind('pmon', 'Creatures', P.bestiary, lv('Creature'), function (e) {
        return (
          '<p class="small">AC ' +
          esc(e.ac) +
          ' · ' +
          esc(e.hp) +
          ' HP</p><div class="toolbar">' +
          btn('section', 'Go to Monsters', { v: g + '-mon' }, 'btn small') +
          '</div>'
        );
      });
      kind('pact', 'Actions', P.core.actions, function () {
        return 'Action';
      });
      kind('pcond', 'Conditions', P.core.conditions, function () {
        return 'Condition';
      });
    } else {
      groups.wait = true;
      if (!V) needGame(g, requestRender);
    }
  }
  add(
    'page',
    'Pages of the app',
    gsPick(gsPages(), q, function (p) {
      return p[1];
    }).map(function (x) {
      return { n: x.e[1], meta: 'Page', act: 'section', v: x.e[0] };
    })
  );
  return groups;
}
function searchPage() {
  var S = gsState(),
    raw = ui.q.gs || '',
    q = raw.trim().toLowerCase(),
    h =
      '<main class="home gs"><h2>Search</h2><div class="toolbar gs-box">' +
      search('gs', 'A spell, feat, item, monster, condition, character…') +
      '</div>';
  if (q.length < 2)
    return (
      h +
      '<p class="muted">Type at least 2 letters. Results come from the game you are in (' +
      { dnd: 'D&D 5e', pf2: 'Pathfinder 2e', sf2: 'Starfinder 2e', mm: 'Mutants & Masterminds', sd: 'Shadowdark' }[
        gameOf()
      ] +
      '); switch games at the top to search another.</p></main>'
    );
  var groups = gsGroups(q);
  if (groups.wait) h += '<p class="small muted pf-textwait">Loading the rules…</p>';
  h += groups
    .map(function (G) {
      var all = S.all === G.id,
        rows = all ? G.rows.slice(0, 80) : G.rows.slice(0, GS_SHOW);
      return (
        '<section class="panel gs-group"><h3>' +
        G.label +
        ' <small class="muted">' +
        G.rows.length +
        '</small></h3>' +
        rows
          .map(function (r) {
            var open = r.k && S.open === r.k;
            return (
              '<div class="gs-row' +
              (open ? ' open' : '') +
              '"><button type="button" class="gs-hit" data-act="' +
              (r.act || 'gsOpen') +
              '" data-v="' +
              esc(r.act ? r.v : r.k) +
              '"' +
              (r.k ? ' aria-expanded="' + !!open + '"' : '') +
              '><b>' +
              esc(r.n) +
              '</b><span class="small muted">' +
              esc(r.meta || '') +
              '</span></button>' +
              (open ? '<div class="gs-detail">' + r.html() + '</div>' : '') +
              '</div>'
            );
          })
          .join('') +
        (G.rows.length > rows.length
          ? '<div class="toolbar">' +
            btn('gsAll', 'Show all ' + Math.min(80, G.rows.length), { v: G.id }, 'btn small') +
            '</div>'
          : '') +
        '</section>'
      );
    })
    .join('');
  if (!groups.length && !groups.wait) h += '<p class="muted">No name matches “' + esc(raw.trim()) + '”.</p>';
  if (q.length >= 3)
    h +=
      '<div class="panel gs-books"><p class="small">Looking for a rule or a passage? The rule books are searched word by word.</p><div class="toolbar">' +
      btn('gsBooks', '📖 Search the rule books for “' + esc(raw.trim()) + '”', {}, 'btn') +
      '</div></div>';
  return h + '</main>';
}
var gsActions = {
  gsOpen: function (v) {
    var S = gsState();
    S.open = S.open === v ? '' : v;
  },
  gsAll: function (v) {
    gsState().all = v;
  },
  // one of your characters in another game: go to that game's list
  gsChar: function (v) {
    var p = String(v).split(':');
    store.game = p[0];
    ui.section = p[1];
    if (store[p[0]]) store[p[0]].cur = p.slice(2).join(':');
    window.scrollTo(0, 0);
  },
  gsMon: function (v) {
    ui.mon.q = v; // ui.mon: the Monsters page's own state (js/monsters.js)
    ui.mon.open = '';
    ui.section = 'monsters';
    window.scrollTo(0, 0);
  },
  gsBooks: function () {
    var g = gameOf();
    ui.books = ui.books || { open: 'rules', part: null, q: '', toc: true };
    ui.books.q = (ui.q.gs || '').trim();
    ui.section = g === 'mm' ? 'mm-rules' : 'books';
    window.scrollTo(0, 0);
  }
};
