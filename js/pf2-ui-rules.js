// Pathfinder 2e screens: the rules browser, the rules book for the Books shelf, and the home page.
// Part of pf2-ui.js: it runs inside PF2UI; K holds the names the files share.
(function (root) {
  'use strict';
  (root.PF2UIParts = root.PF2UIParts || {}).rules = function (K) {
    var PF2 = K.PF2,
      U = K.U,
      btn = K.btn,
      esc = K.esc,
      gl = K.gl,
      md = K.md,
      need = K.need,
      rar = K.rar;

    // ---------- rules browser ----------
    var RCATS = [
      ['basics', 'Basics'],
      ['ancestries', 'Ancestries'],
      ['heritages', 'Heritages'],
      ['backgrounds', 'Backgrounds'],
      ['classes', 'Classes'],
      ['classfeatures', 'Class features'],
      ['feats', 'Feats'],
      ['spells', 'Spells'],
      ['items', 'Equipment'],
      ['conditions', 'Conditions'],
      ['actions', 'Actions'],
      ['deities', 'Deities'],
      ['license', 'License']
    ];
    function rulesHtml() {
      var R = U.rules,
        X = PF2.index(),
        q = (R.q || '').toLowerCase();
      var h =
        '<main class="pf-main"><h2>Pathfinder 2e rules</h2><p class="small muted">The pre-Remaster rules (Core Rulebook, Advanced Player’s Guide, Secrets of Magic, Guns &amp; Gears, Dark Archive, Rage of Elements and the Lost Omens books), searchable.</p>' +
        '<nav class="mm-tabs pf-tabs">' +
        RCATS.map(function (c) {
          return btn('pfRCat', c[1], { v: c[0] }, 'mm-tab' + (R.cat === c[0] ? ' on' : ''));
        }).join('') +
        '</nav>';
      if (R.cat === 'basics') return h + '<article class="panel bk-text">' + md(BASICS) + '</article></main>';
      if (R.cat === 'license') return h + '<article class="panel bk-text">' + md(LICENSE) + '</article></main>';
      var list =
        R.cat === 'feats' ? X.feats : R.cat === 'spells' ? X.spells : R.cat === 'items' ? X.items : X.core[R.cat] || [];
      var shown = list.filter(function (e) {
        return !q || (e.n + ' ' + (e.t || []).join(' ')).toLowerCase().indexOf(q) >= 0;
      });
      shown = shown.slice().sort(function (a, b) {
        return a.n < b.n ? -1 : 1;
      });
      h +=
        '<input type="search" id="pf-rq" data-pfrq="1" placeholder="Search ' +
        esc(
          (RCATS.filter(function (c) {
            return c[0] === R.cat;
          })[0] || ['', ''])[1].toLowerCase()
        ) +
        '…" value="' +
        esc(R.q || '') +
        '">' +
        '<div class="small muted pf-count">' +
        shown.length +
        ' found' +
        (shown.length > 200 ? ', showing 200' : '') +
        '</div>';
      h += shown
        .slice(0, 200)
        .map(function (e) {
          var k = 'r:' + e.id,
            open = R.open === k;
          var sub =
            R.cat === 'feats'
              ? 'Feat ' + (e.lv || 0)
              : R.cat === 'spells'
                ? e.cat === 'cantrip'
                  ? 'Cantrip'
                  : e.cat === 'focus'
                    ? 'Focus ' + e.lv
                    : e.cat === 'ritual'
                      ? 'Ritual ' + e.lv
                      : 'Spell ' + e.lv
                : R.cat === 'items'
                  ? 'Item ' + (e.lv || 0)
                  : '';
          return (
            '<div class="pf-spell' +
            rar(e) +
            '"><button type="button" class="pf-pname" data-act="pfROpen" data-v="' +
            esc(k) +
            '"><b>' +
            esc(e.n) +
            '</b> ' +
            gl(e.a || (/^[123rf]$/.test(e.time || '') ? e.time : '')) +
            '<span class="spacer"></span><small class="muted">' +
            esc(sub) +
            (e.src ? ' · ' + esc(e.src) : '') +
            '</small></button>' +
            (open
              ? '<div class="pf-desc">' +
                K.entryDetail(
                  e,
                  {
                    ancestries: 'ancestry',
                    backgrounds: 'background',
                    classes: 'class',
                    spells: 'spell',
                    items: 'item',
                    feats: 'feat'
                  }[R.cat] || '',
                  null,
                  null
                ) +
                (R.cat === 'feats' && e.pre
                  ? '<p class="small"><b>Prerequisites</b> ' + esc(e.pre.join('; ')) + '</p>'
                  : '') +
                (R.cat === 'classes'
                  ? '<h4>Features by level</h4><ul class="small">' +
                    e.features
                      .map(function (f) {
                        return '<li>' + f[0] + ': ' + esc(f[1]) + '</li>';
                      })
                      .join('') +
                    '</ul>'
                  : '') +
                '</div>'
              : '') +
            '</div>'
          );
        })
        .join('');
      return h + '</main>';
    }
    var BASICS =
      '# The basics\n\n' +
      '**Checks.** Roll a d20 and add your modifier. Beat the DC by 10 or more for a **critical success**; meet it for a **success**; miss it for a **failure**; miss it by 10 or more for a **critical failure**. A natural 20 makes the result one step better, a natural 1 one step worse.\n\n' +
      '**Proficiency.** Untrained adds nothing. Trained adds your level + 2, expert level + 4, master level + 6, legendary level + 8.\n\n' +
      '**Your turn.** You get three actions (◆) and one reaction (⤾). Some activities take two (◆◆) or three (◆◆◆) actions; free actions (◇) cost nothing.\n\n' +
      '**Multiple attack penalty.** Your second attack in a turn takes −5 and later ones −10 (−4 and −8 with an agile weapon).\n\n' +
      '**Bonuses** come in types: circumstance, item and status. Only the highest bonus of each type counts, and only the worst penalty of each type; untyped penalties add up.\n\n' +
      '**Ability scores.** Each boost adds 2 to a score, or 1 if the score is already 18 or more. The modifier is (score − 10) ÷ 2, rounded down.\n\n' +
      '**Hit points** = your ancestry’s HP + (your class’s HP + your Constitution modifier) × your level.\n\n' +
      '**Armor Class** = 10 + Dexterity (up to the armor’s cap) + proficiency + the armor’s item bonus.\n\n' +
      '**Dying.** At 0 HP you are knocked out and dying 1 (2 on a critical hit; add your wounded value). Each turn make a flat recovery check (DC 10 + dying); at dying 4 you die. Recovering gives you the wounded condition.\n\n' +
      '**Hero points.** You start each session with 1 (max 3). Spend one to reroll a check, or all of them to avoid dying.\n\n' +
      '**Encounter difficulty** (for a group of four): trivial 40 XP, low 60, moderate 80, severe 120, extreme 160. A creature of your level is worth 40 XP; each level above or below changes that (−4: 10, −3: 15, −2: 20, −1: 30, +1: 60, +2: 80, +3: 120, +4: 160).';
    var LICENSE =
      '# Sources and license\n\nRules text comes from the Foundry VTT Pathfinder 2e system (release 5.8.0, with the original versions of a few spells from 4.12.0), keeping only content published before the Pathfinder Remaster. It is **Open Game Content** under the Open Game License v1.0a; Rage of Elements content is under the ORC License. No artwork is included.\n\n' +
      'This app uses trademarks and/or copyrights owned by Paizo Inc., used under Paizo’s Community Use Policy (paizo.com/licenses/communityuse). We are expressly prohibited from charging you to use or access this content. This app is not published, endorsed, or specifically approved by Paizo. For more information about Paizo Inc. and Paizo products, visit paizo.com.\n\n' +
      '**Open Game License v1.0a** © 2000, Wizards of the Coast, Inc. Pathfinder Core Rulebook (Second Edition) © 2019, Paizo Inc. Pathfinder Advanced Player’s Guide © 2020, Paizo Inc. Pathfinder Secrets of Magic © 2021, Paizo Inc. Pathfinder Guns & Gears © 2021, Paizo Inc. Pathfinder Dark Archive © 2022, Paizo Inc. Pathfinder Bestiary, Bestiary 2, Bestiary 3 © 2019–2021, Paizo Inc. Pathfinder Lost Omens books © Paizo Inc.';

    // ---------- a readable rules book for the Books shelf ----------
    var bookCache = null;
    function book() {
      if (bookCache) return bookCache;
      if (!need(['core'])) return null;
      var C = PF2.index().core,
        byN = function (a, b) {
          return a.n < b.n ? -1 : 1;
        };
      var entry = function (e, extra) {
        return '## ' + e.n + (extra ? ' ' + extra : '') + '\n\n' + (e.d || '') + (e.src ? '\n\n*' + e.src + '*' : '');
      };
      var letters = function (rows) {
        var parts = [],
          cur = null;
        rows
          .slice()
          .sort(byN)
          .forEach(function (e) {
            var L = e.n[0].toUpperCase();
            if (!cur || cur.t !== L) {
              cur = { t: L, md: '# ' + L };
              parts.push(cur);
            }
            cur.md += '\n\n' + entry(e);
          });
        return parts;
      };
      var one = function (rows, fn) {
        return rows
          .slice()
          .sort(byN)
          .map(function (e) {
            return { t: e.n, md: '# ' + e.n + '\n\n' + (e.d || '') + (fn ? fn(e) : '') };
          });
      };
      bookCache = {
        id: 'pf2',
        title: 'Pathfinder 2e rules',
        chapters: [
          { t: 'The basics', parts: [{ t: 'The basics', md: BASICS }] },
          {
            t: 'Conditions',
            parts: [
              {
                t: 'Conditions',
                md:
                  '# Conditions\n\n' +
                  (C.conditions || [])
                    .slice()
                    .sort(byN)
                    .map(function (e) {
                      return entry(e);
                    })
                    .join('\n\n')
              }
            ]
          },
          { t: 'Actions', parts: letters(C.actions || []) },
          { t: 'Ancestries', parts: one(C.ancestries || []) },
          { t: 'Heritages', parts: letters(C.heritages || []) },
          { t: 'Backgrounds', parts: letters(C.backgrounds || []) },
          {
            t: 'Classes',
            parts: one(C.classes || [], function (c) {
              var feats = (C.classfeatures || [])
                .filter(function (f) {
                  return (f.t || []).indexOf(c.id) >= 0;
                })
                .sort(function (a, b) {
                  return (a.lv || 0) - (b.lv || 0) || byN(a, b);
                });
              return (
                '\n\n## Features by level\n\n' +
                (c.features || [])
                  .map(function (f) {
                    return '- **' + f[0] + '** ' + f[1];
                  })
                  .join('\n') +
                (feats.length
                  ? '\n\n' +
                    feats
                      .map(function (f) {
                        return entry(f, '(level ' + (f.lv || 1) + ')');
                      })
                      .join('\n\n')
                  : '')
              );
            })
          },
          { t: 'Deities', parts: letters(C.deities || []) },
          { t: 'Sources and license', parts: [{ t: 'Sources and license', md: LICENSE }] }
        ]
      };
      return bookCache;
    }

    // ---------- home ----------
    function homeHtml() {
      return (
        '<main class="home"><h1>Pathfinder 2e</h1><p class="muted">Your table companion (pre-Remaster rules). Tap the d20 to roll.</p>' +
        root.homeHub([
          ['pf2-chars', 'sword', 'Characters'],
          ['dm', 'eye', 'GM'],
          ['books', 'tome', 'Books'],
          ['pf2-rules', 'book', 'Rules'],
          ['audio', 'lute', 'Audio'],
          ['rules', 'scroll', 'House rules']
        ]) +
        (root.BKP ? root.BKP.homeLine() : '') +
        '</main>'
      );
    }
    K.book = book;
    K.homeHtml = homeHtml;
    K.rulesHtml = rulesHtml;
  };
})(typeof window !== 'undefined' ? window : globalThis);
