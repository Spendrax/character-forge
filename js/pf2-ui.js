// Pathfinder 2e (pre-Remaster) screens: characters, the level-by-level builder, the sheet tabs, the rules browser.
// The rules engine is js/pf2.js; the data (data/pf2/*.js) loads the first time a PF2 page opens.
(function (root) {
  'use strict';
  var PF2 = root.PF2;
  var GLY = { 1: '◆', 2: '◆◆', 3: '◆◆◆', r: '⤾', f: '◇' };
  var RL = ['U', 'T', 'E', 'M', 'L'];
  var ALIGN = [
    'Lawful Good',
    'Neutral Good',
    'Chaotic Good',
    'Lawful Neutral',
    'True Neutral',
    'Chaotic Neutral',
    'Lawful Evil',
    'Neutral Evil',
    'Chaotic Evil'
  ];
  var SIZE = { tiny: 'Tiny', sm: 'Small', med: 'Medium', lg: 'Large', huge: 'Huge', grg: 'Gargantuan' };
  var COND_VAL = {
    clumsy: 1,
    doomed: 1,
    drained: 1,
    dying: 1,
    enfeebled: 1,
    frightened: 1,
    sickened: 1,
    slowed: 1,
    stunned: 1,
    stupefied: 1,
    wounded: 1,
    quickened: 0
  };

  root.PF2UI = function (api) {
    var esc = api.esc,
      btn = api.btn,
      ui = api.ui,
      store = api.store,
      render = function () {
        api.render();
      };
    var U = (ui.pf2 = ui.pf2 || {
      view: 'list',
      tab: 'build',
      pick: null,
      q: '',
      f: {},
      open: '',
      rules: { cat: 'feats', q: '', f: {}, open: '' }
    });
    function S() {
      return (store.pf2 = store.pf2 || { chars: [], cur: '' });
    }
    function cur() {
      var s = S();
      return (
        s.chars.filter(function (c) {
          return c.id === s.cur;
        })[0] || null
      );
    }
    var md = function (t) {
      return root.BooksUI && root.BooksUI.md ? root.BooksUI.md(t || '') : esc(t || '');
    };
    var fmt = function (n) {
      return (n >= 0 ? '+' : '−') + Math.abs(n);
    };
    var gl = function (a) {
      return a
        ? '<span class="pf-act" title="' +
            ({ r: 'Reaction', f: 'Free action' }[a] || a + ' action' + (a > 1 ? 's' : '')) +
            '">' +
            (GLY[a] || '') +
            '</span>'
        : '';
    };
    var rar = function (e) {
      return e && e.r ? ' pf-' + { u: 'unc', r: 'rare', q: 'uniq' }[e.r] : '';
    };
    function teml(rank) {
      return (
        '<span class="pf-teml" aria-label="' +
        PF2.RANK[rank || 0] +
        '">' +
        ['T', 'E', 'M', 'L']
          .map(function (l, i) {
            return '<i' + (rank > i ? ' class="on"' : '') + '>' + l + '</i>';
          })
          .join('') +
        '</span>'
      );
    }
    function traits(t, e) {
      var x = (t || []).slice();
      if (e && e.r) x.unshift({ u: 'uncommon', r: 'rare', q: 'unique' }[e.r]);
      return x.length
        ? '<div class="pf-traits">' +
            x
              .map(function (s) {
                return (
                  '<span class="pf-trait' +
                  (/^(uncommon|rare|unique)$/.test(s) ? ' pf-' + s.slice(0, 4) : '') +
                  '">' +
                  esc(s.replace(/-/g, ' ')) +
                  '</span>'
                );
              })
              .join('') +
            '</div>'
        : '';
    }

    // ---------- the character's picture: shrunk to 640 px so it fits in the browser's storage ----------
    function picHtml(ch, cls) {
      return ch.picture
        ? '<img class="pf-pic ' +
            (cls || '') +
            (ch.picFit === 'contain' ? ' whole' : '') +
            '" src="' +
            (root.safePic ? root.safePic(ch.picture) : '') +
            '" alt="Picture of ' +
            esc(ch.name || 'the character') +
            '">'
        : '';
    }
    function loadPic(file, done) {
      if (!file || !/^image\//.test(file.type)) {
        done(null);
        return;
      }
      var r = new FileReader();
      r.onload = function () {
        var img = new Image();
        img.onload = function () {
          var max = 640,
            k = Math.min(1, max / Math.max(img.width, img.height)),
            cv = document.createElement('canvas');
          cv.width = Math.max(1, Math.round(img.width * k));
          cv.height = Math.max(1, Math.round(img.height * k));
          var x = cv.getContext('2d');
          x.imageSmoothingQuality = 'high';
          x.drawImage(img, 0, 0, cv.width, cv.height);
          var data = cv.toDataURL('image/webp', 0.85);
          if (data.indexOf('data:image/webp') !== 0) {
            x.globalCompositeOperation = 'destination-over';
            x.fillStyle = '#fff';
            x.fillRect(0, 0, cv.width, cv.height);
            data = cv.toDataURL('image/jpeg', 0.85);
          }
          done(data);
        };
        img.onerror = function () {
          done(null);
        };
        img.src = r.result;
      };
      r.onerror = function () {
        done(null);
      };
      r.readAsDataURL(file);
    }

    // ---------- loading the data ----------
    var loading = {},
      failed = '';
    function loadScript(src) {
      return new Promise(function (ok, no) {
        var s = document.createElement('script');
        s.src = src;
        s.onload = ok;
        s.onerror = no;
        document.head.appendChild(s);
      });
    }
    function need(parts) {
      var P = root.PF2DATA || {},
        miss = parts.filter(function (p) {
          return !P[p];
        });
      if (!miss.length) return true;
      miss.forEach(function (p) {
        if (loading[p]) return;
        loading[p] = 1;
        loadScript('data/pf2/' + p + '.js').then(
          function () {
            loading[p] = 0;
            render();
          },
          function () {
            loading[p] = 0;
            failed = 'Couldn’t load the Pathfinder rules. Check your connection and try again.';
            render();
          }
        );
      });
      return false;
    }
    function waitHtml(what) {
      return (
        '<main class="home"><h2>' +
        esc(what) +
        '</h2><p class="muted">' +
        (failed ? esc(failed) : 'Loading the Pathfinder rules (the first time only, then they work offline)…') +
        '</p><div class="pf-load"><span></span></div></main>'
      );
    }
    var CHAR_DATA = ['core', 'feats', 'spells', 'items'];

    // ---------- the character list ----------
    function listHtml() {
      var s = S();
      var cards = s.chars
        .map(function (c) {
          var d = PF2.derive(c),
            sub =
              [d.anc ? (d.her ? d.her.n : d.anc.n) : '', d.cls ? d.cls.n + ' ' + d.level : '']
                .filter(Boolean)
                .join(' · ') || 'Nothing chosen yet';
          return (
            '<button type="button" class="roster-card pf-card' +
            (c.id === s.cur ? ' cur' : '') +
            '" data-act="pfOpen" data-v="' +
            c.id +
            '">' +
            (c.picture
              ? '<span class="pf-init pf-picbox">' + picHtml(c) + '</span>'
              : '<span class="pf-init">' + esc((c.name || '?').trim().slice(0, 1).toUpperCase()) + '</span>') +
            '<span class="roster-txt"><b>' +
            esc(c.name || 'Unnamed') +
            '</b><span class="small muted">' +
            esc(sub) +
            '</span>' +
            (d.cls
              ? '<span class="roster-stats small"><span>AC ' +
                d.ac.v +
                '</span><span>HP ' +
                (c.track && c.track.hp != null ? c.track.hp + '/' : '') +
                d.hp.max +
                '</span><span>Perc ' +
                fmt(d.perception.v) +
                '</span></span>'
              : '') +
            '</span></button>'
          );
        })
        .join('');
      var imp = U.imp ? importHtml() : '';
      return (
        '<main class="home roster"><div class="toolbar"><h2 style="margin:0">Characters</h2><span class="spacer"></span>' +
        btn('pfNew', '+ New character', {}, 'btn primary') +
        btn('pfImp', 'Import from Pathbuilder', {}, 'btn') +
        '</div>' +
        imp +
        (cards
          ? '<div class="roster-grid">' + cards + '</div>'
          : '<p class="muted">No characters yet. Make one, or bring one over from Pathbuilder.</p>') +
        '</main>'
      );
    }
    function importHtml() {
      var I = U.imp;
      return (
        '<div class="panel pf-imp"><h3 style="margin-top:0">Import from Pathbuilder 2e</h3>' +
        '<ol class="small"><li>In Pathbuilder, open the character’s menu ☰ and choose <b>Export</b> → <b>Export JSON</b>.</li><li>Open the link it gives (pathbuilder2e.com/json.php?id=…), select all the text and copy it.</li><li>Paste it below, or type just the number from the link.</li></ol>' +
        '<textarea id="pf-imp-txt" rows="4" placeholder="Paste the export here, or the export number">' +
        esc(I.txt || '') +
        '</textarea>' +
        '<div class="toolbar">' +
        btn('pfImpGo', 'Import', {}, 'btn primary') +
        '<label class="btn">Choose a file<input type="file" id="pf-imp-file" accept=".json,.txt,application/json" hidden></label>' +
        btn('pfImpClose', 'Cancel', {}, 'btn') +
        '</div>' +
        (I.err ? '<p class="small bad">' + esc(I.err) + '</p>' : '') +
        (I.busy ? '<p class="small muted">Fetching…</p>' : '') +
        '</div>'
      );
    }
    function doImport(text) {
      var I = (U.imp = U.imp || {});
      text = String(text || '').trim();
      if (/^\d{3,}$/.test(text)) {
        I.busy = true;
        render();
        fetch('https://pathbuilder2e.com/json.php?id=' + text)
          .then(function (r) {
            return r.text();
          })
          .then(
            function (t) {
              I.busy = false;
              doImport(t);
            },
            function () {
              I.busy = false;
              I.err =
                'Your browser can’t fetch from Pathbuilder directly. Open pathbuilder2e.com/json.php?id=' +
                text +
                ', copy all the text and paste it here instead.';
              render();
            }
          );
        return;
      }
      try {
        var j = JSON.parse(text),
          ch = root.PF2Import.fromPathbuilder(j);
        S().chars.push(ch);
        S().cur = ch.id;
        U.view = 'char';
        U.tab = 'sheet';
        U.imp = null;
        U.msg =
          'Imported ' +
          (ch.name || 'the character') +
          '.' +
          (ch.importNotes && ch.importNotes.length ? ' Notes: ' + ch.importNotes.join(' ') : '');
      } catch (e) {
        I.err =
          e.message === 'Unexpected end of JSON input' || /JSON/.test(e.message)
            ? 'That isn’t the export text. Copy everything on the export page, from the first { to the last }.'
            : e.message;
      }
      render();
    }

    // ---------- the character page ----------
    var TABS = [
      ['build', 'Build'],
      ['sheet', 'Sheet'],
      ['defense', 'Defense'],
      ['offense', 'Offense'],
      ['skills', 'Skills'],
      ['spells', 'Spells'],
      ['gear', 'Gear'],
      ['feats', 'Feats'],
      ['actions', 'Actions'],
      ['notes', 'Notes'],
      ['play', 'Session']
    ];
    function charHtml(ch) {
      var d = PF2.derive(ch);
      var head =
        '<div class="pf-head">' +
        '<label class="pf-face" title="' +
        (ch.picture ? 'Change the picture' : 'Add a picture') +
        '">' +
        (ch.picture ? picHtml(ch) : '<span>' + (root.Icon ? root.Icon('sword') : '+') + '</span>') +
        '<input type="file" accept="image/*" data-pfpic="1" hidden></label><div><b>' +
        esc(ch.name || 'Unnamed') +
        '</b><span class="small muted">' +
        esc([d.anc && d.anc.n, d.cls && d.cls.n + ' ' + d.level].filter(Boolean).join(' · ')) +
        '</span></div><span class="spacer"></span>' +
        btn('pfList', 'All characters', {}, 'btn small') +
        '</div>';
      var tabs =
        '<nav class="mm-tabs pf-tabs">' +
        TABS.map(function (t) {
          return btn(
            'pfTab',
            t[1] +
              (t[0] === 'build' && d.warnings.length ? ' <span class="badge">' + d.warnings.length + '</span>' : ''),
            { v: t[0] },
            'mm-tab' + (U.tab === t[0] ? ' on' : '')
          );
        }).join('') +
        '</nav>';
      var body =
        {
          build: buildTab,
          sheet: sheetTab,
          defense: defenseTab,
          offense: offenseTab,
          strikes: offenseTab,
          skills: skillsTab,
          spells: spellsTab,
          gear: gearTab,
          feats: featsTab,
          actions: actionsTab,
          notes: notesTab,
          play: playTab
        }[U.tab] || buildTab;
      return (
        '<main class="pf-main">' +
        (U.msg ? '<p class="rest-msg small">' + esc(U.msg) + ' ' + btn('pfMsgOk', 'OK', {}, 'btn tiny') + '</p>' : '') +
        head +
        tabs +
        '<div class="pf-body">' +
        body(ch, d) +
        '</div>' +
        (U.pick ? pickerHtml(ch, d) : '') +
        '</main>'
      );
    }

    // ----- Build -----
    function choiceCard(label, e, kind, extra) {
      return (
        '<button type="button" class="pf-pickcard' +
        rar(e) +
        '" data-act="pfPick" data-k="' +
        kind +
        '"' +
        (extra || '') +
        '><small>' +
        label +
        '</small><b>' +
        (e ? esc(e.n) : 'Choose…') +
        '</b></button>'
      );
    }
    function buildTab(ch, d) {
      var h = '';
      if (d.warnings.length)
        h +=
          '<details class="panel pf-todo"' +
          (U.todo ? ' open' : '') +
          '><summary>' +
          d.warnings.length +
          ' thing' +
          (d.warnings.length === 1 ? '' : 's') +
          ' to finish</summary><ul class="small">' +
          d.warnings
            .map(function (w) {
              return '<li>' + esc(w) + '</li>';
            })
            .join('') +
          '</ul></details>';
      h +=
        '<div class="panel"><label class="field"><span>Character name</span><input type="text" id="pf-name" data-pff="name" value="' +
        esc(ch.name || '') +
        '"></label>' +
        '<div class="field"><span>Level</span><span class="mm-step">' +
        btn('pfLevel', '−', { v: -1 }, 'mm-b') +
        '<b>' +
        d.level +
        '</b>' +
        btn('pfLevel', '+', { v: 1 }, 'mm-b') +
        '</span></div>' +
        '<div class="pf-cards">' +
        choiceCard('Ancestry', d.anc, 'ancestry') +
        choiceCard('Heritage', d.her, 'heritage') +
        choiceCard('Background', d.bg, 'background') +
        choiceCard('Class', d.cls, 'class') +
        '</div>';
      if (d.cls && d.cls.key.length > 1)
        h +=
          '<div class="field"><span>Key ability</span><div class="pills">' +
          d.cls.key
            .map(function (a) {
              return btn('pfKey', PF2.ABN[a], { v: a }, 'pill' + (ch.key === a ? ' on' : ''));
            })
            .join('') +
          '</div></div>';
      h += '</div>';
      h += boostsHtml(ch, d);
      h += skillsAtOne(ch, d);
      // level by level
      for (var L = 1; L <= d.level; L++) h += levelHtml(ch, d, L);
      return h;
    }
    var ABS = PF2.AB;
    function pills(key, opts, chosen, data) {
      return (
        '<div class="pf-abrow">' +
        ABS.map(function (a) {
          var ok = opts.indexOf(a) >= 0,
            on = chosen.indexOf(a) >= 0;
          return (
            '<button type="button" class="pf-ab' +
            (on ? ' on' : '') +
            '" data-act="pfBoost" data-slot="' +
            key +
            '" data-v="' +
            a +
            '"' +
            (ok || on ? '' : ' disabled') +
            '>' +
            a.toUpperCase() +
            '</button>'
          );
        }).join('') +
        '</div>'
      );
    }
    function boostsHtml(ch, d) {
      var B = ch.boosts || {},
        h =
          '<details class="panel pf-boosts"' +
          (U.boostsOpen !== false && d.boostNeed.length ? ' open' : '') +
          '><summary><b>Ability scores</b> <span class="small muted">' +
          ABS.map(function (a) {
            return a.toUpperCase() + ' ' + d.scores[a];
          }).join(' · ') +
          '</span></summary>';
      if (d.anc) {
        h +=
          '<h4>Ancestry: ' +
          esc(d.anc.n) +
          '</h4><label class="check-line small"><input type="checkbox" data-pfchk="ancAlt"' +
          (B.ancAlt ? ' checked' : '') +
          '> Alternative boosts: two free boosts and no flaw</label>';
        if (B.ancAlt)
          [0, 1].forEach(function (i) {
            h +=
              '<div class="small muted">Free boost</div>' +
              pills(
                'anc' + i,
                ABS.filter(function (a) {
                  return (B.anc || [])[1 - i] !== a;
                }),
                [(B.anc || [])[i]].filter(Boolean)
              );
          });
        else {
          var free = 0;
          d.anc.boosts.forEach(function (o) {
            if (o.length === 1) h += '<div class="small">Boost: <b>' + o[0].toUpperCase() + '</b></div>';
            else {
              var i = free++;
              h +=
                '<div class="small muted">Free boost</div>' +
                pills(
                  'anc' + i,
                  o.filter(function (a) {
                    return (B.anc || []).indexOf(a) < 0 || B.anc[i] === a;
                  }),
                  [(B.anc || [])[i]].filter(Boolean)
                );
            }
          });
          d.anc.flaws.forEach(function (o) {
            if (o.length === 1) h += '<div class="small">Flaw: <b>' + o[0].toUpperCase() + '</b></div>';
          });
        }
      }
      if (d.bg) {
        h += '<h4>Background: ' + esc(d.bg.n) + '</h4>';
        d.bg.boosts.forEach(function (o, i) {
          h +=
            '<div class="small muted">' +
            (o.length < 6
              ? 'One of ' +
                o
                  .map(function (a) {
                    return a.toUpperCase();
                  })
                  .join(' or ')
              : 'Free boost') +
            '</div>' +
            pills(
              'bg' + i,
              o.filter(function (a) {
                return (B.bg || []).indexOf(a) < 0 || B.bg[i] === a;
              }),
              [(B.bg || [])[i]].filter(Boolean)
            );
        });
      }
      h +=
        '<p class="small muted">Level 1, 5, 10, 15 and 20 each give four boosts to different scores (shown at those levels below). A boost adds 2, or 1 once a score is 18 or more.</p>';
      h +=
        '<div class="pf-abgrid">' +
        ABS.map(function (a) {
          return (
            '<div><small>' +
            a.toUpperCase() +
            '</small><b>' +
            d.scores[a] +
            '</b><span>' +
            fmt(d.mods[a]) +
            '</span></div>'
          );
        }).join('') +
        '</div>';
      return h + '</details>';
    }
    function skillsAtOne(ch, d) {
      if (!d.cls) return '';
      var sk = ch.skills || {},
        L1 = sk.L1 || [],
        base = {};
      PF2.SKILLS.forEach(function (k) {
        base[k] = d.rank[k] >= 1 && L1.indexOf(k) < 0 && (sk.extra || []).indexOf(k) < 0;
      });
      var h =
        '<details class="panel"' +
        (d.skillPicksLeft ? ' open' : '') +
        '><summary><b>Trained skills</b> <span class="small muted">' +
        (d.skillPicksLeft ? d.skillPicksLeft + ' to choose' : 'done') +
        '</span></summary>' +
        '<p class="small muted">' +
        esc(d.cls.n) +
        ' gives ' +
        d.cls.addSkills +
        ' + your Intelligence modifier (' +
        fmt(d.mods.int) +
        ')' +
        (d.skillPicks > d.cls.addSkills + Math.max(0, d.mods.int)
          ? ', plus one for each skill you were trained in twice'
          : '') +
        ': <b>' +
        d.skillPicks +
        '</b> skills. Already trained: ' +
        (PF2.SKILLS.filter(function (k) {
          return base[k];
        })
          .map(function (k) {
            return PF2.SK[k][0];
          })
          .join(', ') || 'none') +
        '.</p>' +
        '<div class="pills">' +
        PF2.SKILLS.filter(function (k) {
          return !base[k];
        })
          .map(function (k) {
            var on = L1.indexOf(k) >= 0;
            return btn('pfL1', PF2.SK[k][0], { v: k }, 'pill' + (on ? ' on' : ''));
          })
          .join('') +
        '</div>';
      var bgL = d.lores.filter(function (l) {
        return l.pick;
      })[0];
      if (bgL)
        h +=
          '<label class="field"><span>Your background’s Lore (' +
          esc(d.bg.lore) +
          ')</span><input type="text" id="pf-bglore" data-pff="bgLore" value="' +
          esc(sk.bgLore || '') +
          '" placeholder="e.g. Absalom"></label>';
      h +=
        '<div class="row"><label class="field"><span>Add a Lore skill as a trained pick</span><input type="text" id="pf-newlore" placeholder="e.g. Warfare"></label>' +
        btn('pfLoreAdd', '+ Lore', {}, 'btn small') +
        '</div>';
      var extra = sk.extra || [];
      h +=
        '<h4>Trained by a feat or feature</h4><p class="small muted">For feats like Natural Skill or Skill Training whose skills aren’t chosen elsewhere.</p><div class="pills">' +
        PF2.SKILLS.filter(function (k) {
          return (!base[k] && L1.indexOf(k) < 0) || extra.indexOf(k) >= 0;
        })
          .map(function (k) {
            return btn('pfExtra', PF2.SK[k][0], { v: k }, 'pill small' + (extra.indexOf(k) >= 0 ? ' on' : ''));
          })
          .join('') +
        '</div>';
      return h + '</details>';
    }
    // A "choose one" inside a feature or feat (racket, muse, bloodline, Versatile Heritage's feat…): opens the picker, where each option can be read first.
    function choicesFor(d, filter) {
      return d.open
        .filter(filter)
        .map(function (o) {
          var sel = o.options.filter(function (op) {
            return String(op.value) === String(o.value);
          })[0];
          return (
            '<div class="pf-choice"><button type="button" class="pf-pickcard' +
            (sel && sel.e ? rar(sel.e) : '') +
            '" data-act="pfPick" data-k="choice" data-key="' +
            esc(o.key) +
            '"><small>' +
            esc(o.label) +
            '</small><b>' +
            (sel ? esc(sel.label) : 'Choose…') +
            '</b></button>' +
            (sel && sel.e && sel.e.d
              ? '<details class="small pf-desc"><summary>About ' +
                esc(sel.label) +
                '</summary>' +
                md(sel.e.d) +
                '</details>'
              : '') +
            '</div>'
          );
        })
        .join('');
    }
    function choiceEntries(o) {
      return o.options.map(function (op, i) {
        var e = op.e || {};
        return {
          id: 'o' + i,
          n: op.label,
          d: e.d || '',
          t: e.t,
          r: e.r,
          lv: e.lv,
          src: e.src,
          a: e.a,
          value: op.value,
          pre: e.pre
        };
      });
    }
    function levelHtml(ch, d, L) {
      var rows = [];
      // class features at this level
      if (d.cls)
        d.cls.features.forEach(function (f) {
          if (f[0] !== L) return;
          var e = PF2.byName('classfeatures', f[1]);
          rows.push(featureRow(e, f[1], 'Class feature', ch, d, 'cf:' + PF2.slugify(f[1])));
        });
      if (L === 1) {
        if (d.anc)
          rows.unshift(
            '<div class="pf-row small muted">Ancestry: ' +
              esc(d.anc.n) +
              (d.her ? ' · ' + esc(d.her.n) : '') +
              ' · Background: ' +
              esc(d.bg ? d.bg.n : '—') +
              '</div>' +
              choicesFor(d, function (o) {
                return /^(ancestry|heritage|background|af:|bgfeat:)/.test(o.itemKey);
              })
          );
      }
      // boosts
      if (PF2.BOOST_LEVELS.indexOf(L) >= 0) {
        var picks = ((ch.boosts || {}).lv || {})[L] || [];
        rows.push(
          '<div class="pf-row"><div class="small"><b>Ability boosts</b> <span class="muted">(' +
            picks.length +
            ' of 4)</span></div>' +
            pills('lv' + L, picks.length < 4 ? ABS : picks, picks) +
            '</div>'
        );
      }
      // feat slots
      (d.slots || [])
        .filter(function (s) {
          return s.lv === L;
        })
        .forEach(function (s) {
          var e = ch.feats[s.key] && PF2.byId('feats', ch.feats[s.key]);
          rows.push(
            '<div class="pf-row pf-slot">' +
              '<button type="button" class="pf-pickcard' +
              rar(e) +
              '" data-act="pfPick" data-k="feat" data-slot="' +
              s.key +
              '"><small>' +
              esc(slotLabel(s, d)) +
              '</small><b>' +
              (e ? esc(e.n) + ' ' + gl(e.a) : 'Choose…') +
              '</b></button>' +
              (e ? btn('pfFeatRm', '✕', { v: s.key }, 'btn small') : '') +
              '</div>' +
              (e
                ? prereqLine(e, ch, d) +
                  choicesFor(d, function (o) {
                    return o.itemKey === 'feat:' + s.key || o.itemKey.indexOf('feat:' + s.key + '>') === 0;
                  })
                : '')
          );
        });
      // bonus feats (from an import or a GM)
      Object.keys(ch.feats || {})
        .filter(function (k) {
          return /^bonus/.test(k) && parseInt(k.replace(/^\D+/, ''), 10) === L;
        })
        .forEach(function (k) {
          var e = PF2.byId('feats', ch.feats[k]);
          rows.push(
            '<div class="pf-row pf-slot"><div class="pf-pickcard"><small>Bonus feat</small><b>' +
              esc(e ? e.n : ch.feats[k]) +
              '</b></div>' +
              btn('pfFeatRm', '✕', { v: k }, 'btn small') +
              '</div>' +
              choicesFor(d, function (o) {
                return o.itemKey === 'feat:' + k || o.itemKey.indexOf('feat:' + k + '>') === 0;
              })
          );
        });
      // skill increase
      if (d.incLevels.indexOf(L) >= 0) {
        var v = ((ch.skills || {}).inc || {})[L] || '',
          cap = L >= 15 ? 4 : L >= 7 ? 3 : 2;
        var opts = PF2.SKILLS.map(function (k) {
          return ['', k, PF2.SK[k][0]];
        }).concat(
          d.lores.map(function (l) {
            return ['', 'lore:' + l.n, l.n + ' Lore'];
          })
        );
        rows.push(
          '<label class="field pf-row"><span>Skill increase <small class="muted">(up to ' +
            PF2.RANK[cap].toLowerCase() +
            ')</small></span><select data-pfinc="' +
            L +
            '"><option value="">— choose —</option>' +
            opts
              .map(function (o) {
                var r = d.rank[o[1]] || 0,
                  mine = v === o[1],
                  after = mine ? r : r + 1,
                  ok = mine || (r >= 1 && after <= cap);
                return (
                  '<option value="' +
                  esc(o[1]) +
                  '"' +
                  (mine ? ' selected' : '') +
                  (ok ? '' : ' disabled') +
                  '>' +
                  esc(o[2]) +
                  ' (' +
                  PF2.RANK[mine ? r : r].toLowerCase() +
                  (mine ? '' : ' → ' + PF2.RANK[Math.min(4, r + 1)].toLowerCase()) +
                  ')</option>'
                );
              })
              .join('') +
            '</select></label>'
        );
      }
      if (!rows.length) return '';
      return '<section class="panel pf-level"><h3>Level ' + L + '</h3>' + rows.join('') + '</section>';
    }
    function slotLabel(s, d) {
      return (
        {
          anc: (d.anc ? d.anc.n : 'Ancestry') + ' feat',
          cls: (d.cls ? d.cls.n : 'Class') + ' feat',
          skill: 'Skill feat',
          gen: 'General feat'
        }[s.kind] +
        ' ' +
        s.lv
      );
    }
    function featureRow(e, name, what, ch, d, key) {
      var k = 'f:' + key,
        open = U.open === k;
      return (
        '<div class="pf-row"><button type="button" class="pf-feature" data-act="pfOpenRow" data-v="' +
        esc(k) +
        '"><small>' +
        what +
        '</small><b>' +
        esc(name) +
        '</b> <span aria-hidden="true">' +
        (open ? '▾' : '▸') +
        '</span></button>' +
        (open && e ? '<div class="pf-desc">' + md(e.d) + '</div>' : '') +
        choicesFor(d, function (o) {
          return o.itemKey === key || o.itemKey.indexOf(key + '>') === 0;
        }) +
        '</div>'
      );
    }
    function prereqLine(e, ch, d) {
      var p = PF2.prereq(e, ch, d);
      if (!p.length) return '';
      return (
        '<div class="small pf-pre">Prerequisites: ' +
        p
          .map(function (x) {
            return (
              '<span class="' +
              (x.ok === false ? 'bad' : x.ok ? 'ok' : '') +
              '">' +
              esc(x.t) +
              (x.ok === false ? ' ✗' : x.ok ? ' ✓' : '') +
              '</span>'
            );
          })
          .join('; ') +
        '</div>'
      );
    }

    // ----- the picker (ancestries, heritages, backgrounds, classes, feats, spells, items, deities) -----
    function pickList(ch, d) {
      var P = U.pick,
        X = PF2.index(),
        list = [];
      if (P.k === 'ancestry') list = X.core.ancestries;
      else if (P.k === 'heritage')
        list = X.core.heritages.filter(function (h) {
          return !h.anc || (d.anc && h.anc === d.anc.id);
        });
      else if (P.k === 'background') list = X.core.backgrounds;
      else if (P.k === 'class') list = X.core.classes;
      else if (P.k === 'deity') list = X.core.deities;
      else if (P.k === 'feat') {
        var slot = (d.slots || []).filter(function (s) {
          return s.key === P.slot;
        })[0] || { kind: 'gen', lv: d.level };
        list = PF2.featsFor(slot, ch, d);
      } else if (P.k === 'spell')
        list = X.spells.filter(function (s) {
          return (
            (P.trad ? (s.trad || []).indexOf(P.trad) >= 0 || P.focus : true) &&
            (P.focus
              ? s.cat === 'focus'
              : P.rank === 0
                ? s.cat === 'cantrip'
                : s.cat === 'spell' && s.lv <= (P.rank || 10)) &&
            (!P.ritual || s.cat === 'ritual')
          );
        });
      else if (P.k === 'choice') {
        var o = d.open.filter(function (x) {
          return x.key === P.key;
        })[0];
        list = o ? choiceEntries(o) : [];
      } else if (P.k === 'rune')
        list = X.items.filter(function (i) {
          return P.which === 'a'
            ? /^etched-onto-(armor|heavy|med|light|metal|medium|lm)/.test(i.use || '') &&
                !/^(Armor Potency|Resilient)/.test(i.n)
            : /^etched-onto-(a-weapon|weapon|melee|piercing|slashing|bludgeoning|thrown)/.test(i.use || '') &&
                !/^(Striking|Weapon Potency)/.test(i.n);
        });
      else if (P.k === 'item')
        list = X.items.filter(function (i) {
          return (
            !P.type ||
            (P.type === 'gear'
              ? /^(equipment|backpack|kit|treasure)$/.test(i.k)
              : P.type === 'shield'
                ? i.k === 'armor' && i.cat === 'shield'
                : P.type === 'armor'
                  ? i.k === 'armor' && i.cat !== 'shield'
                  : i.k === P.type)
          );
        });
      return list;
    }
    function pickerHtml(ch, d) {
      var P = U.pick,
        q = (U.q || '').toLowerCase(),
        f = U.f || {},
        all = pickList(ch, d);
      var core = PF2.index().core.core;
      var list = all
        .filter(function (e) {
          if (q && (e.n + ' ' + (e.t || []).join(' ')).toLowerCase().indexOf(q) < 0) return false;
          if (f.rar && (e.r || 'c') !== f.rar) return false;
          if (f.src === 'core' && core.indexOf(e.src) < 0) return false;
          if (f.src === 'exp' && core.indexOf(e.src) >= 0) return false;
          if (
            f.cat &&
            P.k === 'feat' &&
            (f.cat === 'arch' ? (e.t || []).indexOf('archetype') < 0 : (e.t || []).indexOf('archetype') >= 0)
          )
            return false;
          if (f.lv !== undefined && f.lv !== '' && (e.lv || 0) !== +f.lv) return false;
          return true;
        })
        .sort(function (a, b) {
          return (
            (P.k === 'feat' || P.k === 'spell' || P.k === 'item' ? (a.lv || 0) - (b.lv || 0) : 0) ||
            (a.n < b.n ? -1 : 1)
          );
        });
      var title =
        P.k === 'choice'
          ? (
              d.open.filter(function (x) {
                return x.key === P.key;
              })[0] || {}
            ).label || 'Choose'
          : {
              ancestry: 'Choose an ancestry',
              heritage: 'Choose a heritage',
              background: 'Choose a background',
              class: 'Choose a class',
              feat: 'Choose a feat',
              spell: 'Add a spell',
              item:
                P.equip === 'armor'
                  ? 'Choose armor'
                  : P.equip === 'shield'
                    ? 'Choose a shield'
                    : P.equip === 'weapon'
                      ? 'Add a weapon'
                      : 'Add equipment',
              deity: 'Choose a deity',
              rune: P.which === 'a' ? 'Choose an armor rune' : 'Choose a weapon rune'
            }[P.k];
      var curId = pickCurrent(ch, d);
      var pill = function (k, v, label) {
        return btn('pfFilt', label, { k: k, v: v }, 'pill small' + ((f[k] || '') === v ? ' on' : ''));
      };
      var levels = [];
      all.forEach(function (e) {
        if (levels.indexOf(e.lv || 0) < 0) levels.push(e.lv || 0);
      });
      levels.sort(function (a, b) {
        return a - b;
      });
      var filters =
        '<div class="pills">' +
        pill('rar', '', 'All') +
        pill('rar', 'c', 'Common') +
        pill('rar', 'u', 'Uncommon') +
        pill('rar', 'r', 'Rare') +
        '</div>' +
        '<div class="pills">' +
        pill('src', '', 'All books') +
        pill('src', 'core', 'Core') +
        pill('src', 'exp', 'Expanded') +
        (P.k === 'feat'
          ? pill('cat', '', 'Any') + pill('cat', 'cls', 'Class') + pill('cat', 'arch', 'Archetype')
          : '') +
        '</div>' +
        (/^(feat|spell|item)$/.test(P.k) && levels.length > 1
          ? '<div class="pills pf-lvpills">' +
            pill('lv', '', 'Any level') +
            levels
              .map(function (l) {
                return pill('lv', String(l), P.k === 'spell' ? (l ? 'Rank ' + l : 'Cantrip') : 'Lv ' + l);
              })
              .join('') +
            '</div>'
          : '') +
        (P.k === 'item'
          ? '<div class="pills">' +
            [
              ['', 'All'],
              ['weapon', 'Weapons'],
              ['armor', 'Armor'],
              ['shield', 'Shields'],
              ['gear', 'Gear'],
              ['consumable', 'Consumables']
            ]
              .map(function (t) {
                return btn('pfItemType', t[1], { v: t[0] }, 'pill small' + ((P.type || '') === t[0] ? ' on' : ''));
              })
              .join('') +
            '</div>'
          : '');
      var shown = list.slice(0, 150);
      if (
        curId &&
        !shown.some(function (e) {
          return e.id === curId;
        })
      ) {
        var c0 =
          list.filter(function (e) {
            return e.id === curId;
          })[0] ||
          all.filter(function (e) {
            return e.id === curId;
          })[0];
        if (c0) shown.unshift(c0);
      }
      var rows = shown
        .map(function (e) {
          var open = U.open === 'p:' + e.id;
          var sub =
            P.k === 'feat' || P.k === 'spell'
              ? P.k === 'spell'
                ? e.cat === 'cantrip'
                  ? 'Cantrip'
                  : e.cat === 'focus'
                    ? 'Focus ' + e.lv
                    : 'Rank ' + e.lv
                : 'Lv ' + (e.lv || 0)
              : P.k === 'item'
                ? 'Lv ' + (e.lv || 0) + ' · ' + price(e.cp)
                : '';
          var detail = open
            ? '<div class="pf-desc">' +
              entryDetail(e, P.k === 'choice' || P.k === 'rune' ? 'item' : P.k, ch, d) +
              '<div class="toolbar">' +
              (e.id === curId
                ? '<span class="small muted">Your current choice</span>'
                : btn(
                    'pfChoose',
                    (P.k === 'item' && !P.equip) || P.k === 'spell' ? 'Add' : 'Choose',
                    { v: e.id },
                    'btn primary'
                  )) +
              '</div></div>'
            : '';
          return (
            '<div class="pf-prow' +
            rar(e) +
            (open ? ' open' : '') +
            (e.id === curId ? ' cur' : '') +
            '"><button type="button" class="pf-pname" data-act="pfOpenRow" data-v="p:' +
            esc(e.id) +
            '"><b>' +
            esc(e.n) +
            '</b> ' +
            gl(e.a || (e.time && /^[123rf]$/.test(e.time) ? e.time : '')) +
            '<span class="spacer"></span><small>' +
            esc(sub) +
            (e.src ? ' · ' + esc(e.src) : '') +
            '</small></button>' +
            detail +
            '</div>'
          );
        })
        .join('');
      return (
        '<div class="pf-picker" role="dialog" aria-label="' +
        esc(title) +
        '"><div class="pf-pick-head"><b>' +
        esc(title) +
        '</b><span class="spacer"></span>' +
        btn('pfPickClose', '✕', {}, 'btn small') +
        '</div>' +
        '<input type="search" id="pf-q" data-pfq="1" placeholder="Search…" value="' +
        esc(U.q || '') +
        '" autocomplete="off">' +
        filters +
        '<div class="small muted pf-count">' +
        list.length +
        ' found' +
        (list.length > 150 ? ', showing 150: search or filter to narrow' : '') +
        '</div><div class="pf-plist">' +
        (rows || '<p class="muted">Nothing matches.</p>') +
        '</div></div>'
      );
    }
    // what's chosen now, so the picker opens on it
    function pickCurrent(ch, d) {
      var P = U.pick;
      if (P.k === 'ancestry') return ch.ancestry;
      if (P.k === 'heritage') return ch.heritage;
      if (P.k === 'background') return ch.background;
      if (P.k === 'class') return ch.cls;
      if (P.k === 'feat') return ch.feats[P.slot];
      if (P.k === 'choice') {
        var o = d.open.filter(function (x) {
          return x.key === P.key;
        })[0];
        if (!o) return '';
        var i = -1;
        o.options.forEach(function (op, j) {
          if (String(op.value) === String(o.value)) i = j;
        });
        return i >= 0 ? 'o' + i : '';
      }
      if (P.k === 'rune') {
        var g = ch.gear[P.gi],
          n = g && ((g.runes || {}).prop || [])[P.slot];
        var e = n && PF2.byName('items', n);
        return e ? e.id : '';
      }
      if (P.k === 'item' && P.equip) {
        var w = (ch.gear || []).filter(function (g) {
          var e = PF2.byId('items', g.id);
          return g.worn && e && e.k === 'armor' && (P.equip === 'shield') === (e.cat === 'shield');
        })[0];
        return w && P.equip !== 'weapon' ? w.id : '';
      }
      return '';
    }
    function price(cp) {
      cp = +cp || 0;
      if (!cp) return '—';
      if (cp % 100 === 0) return cp / 100 + ' gp';
      if (cp % 10 === 0) return cp / 10 + ' sp';
      return cp + ' cp';
    }
    function entryDetail(e, k, ch, d) {
      var h = traits(e.t, e);
      if (k === 'ancestry')
        h +=
          '<p class="small"><b>HP</b> ' +
          e.hp +
          ' · <b>Size</b> ' +
          SIZE[e.size] +
          ' · <b>Speed</b> ' +
          e.speed +
          ' ft · <b>Boosts</b> ' +
          e.boosts
            .map(function (o) {
              return o.length > 1 ? 'free' : o[0].toUpperCase();
            })
            .join(', ') +
          (e.flaws.length
            ? ' · <b>Flaw</b> ' +
              e.flaws
                .map(function (o) {
                  return o[0].toUpperCase();
                })
                .join(', ')
            : '') +
          '</p>';
      if (k === 'background')
        h +=
          '<p class="small"><b>Boosts</b> ' +
          e.boosts
            .map(function (o) {
              return o.length > 2
                ? 'free'
                : o
                    .map(function (a) {
                      return a.toUpperCase();
                    })
                    .join(' or ');
            })
            .join(', ') +
          ' · <b>Skills</b> ' +
          e.skills
            .map(function (s) {
              return PF2.SK[s] ? PF2.SK[s][0] : s;
            })
            .concat(e.lore ? [e.lore] : [])
            .join(', ') +
          (e.feats.length ? ' · <b>Feat</b> ' + esc(e.feats.join(', ')) : '') +
          '</p>';
      if (k === 'class')
        h +=
          '<p class="small"><b>HP</b> ' +
          e.hp +
          ' + Con per level · <b>Key</b> ' +
          e.key
            .map(function (a) {
              return PF2.ABN[a];
            })
            .join(' or ') +
          ' · <b>Skills</b> ' +
          e.addSkills +
          ' + Int</p>';
      if (k === 'feat' && ch) h += prereqLine(e, ch, d);
      if (k === 'spell') h += spellLine(e);
      if (k === 'item' && e.k) h += itemLine(e);
      return h + md(e.d);
    }
    function spellLine(s) {
      var bits = [];
      if (s.trad && s.trad.length) bits.push('<b>Traditions</b> ' + s.trad.join(', '));
      if (s.time)
        bits.push('<b>Cast</b> ' + (GLY[s.time] || esc(s.time)) + (s.comp ? ' (' + s.comp.join(', ') + ')' : ''));
      if (s.rng) bits.push('<b>Range</b> ' + esc(s.rng));
      if (s.area) bits.push('<b>Area</b> ' + esc(s.area));
      if (s.tgt) bits.push('<b>Targets</b> ' + esc(s.tgt));
      if (s.save) bits.push('<b>Save</b> ' + esc(s.save));
      if (s.dur) bits.push('<b>Duration</b> ' + esc(s.dur) + (s.sus ? ' (sustained)' : ''));
      return '<p class="small">' + bits.join(' · ') + '</p>';
    }
    function itemLine(e) {
      var b = ['<b>Price</b> ' + price(e.cp), '<b>Bulk</b> ' + (e.bulk || '—')];
      if (e.k === 'weapon')
        b.push(
          '<b>Damage</b> ' + (e.dice || 1) + e.die + ' ' + esc(e.dmg),
          '<b>' + esc(e.cat) + '</b> ' + esc(e.grp || '') + (e.rng ? ' · range ' + e.rng + ' ft' : '')
        );
      if (e.k === 'armor' && e.cat !== 'shield')
        b.push(
          '<b>AC</b> +' + e.ac,
          '<b>Dex cap</b> ' + (e.dex == null ? '—' : '+' + e.dex),
          '<b>Check</b> ' + (e.chk || '—'),
          '<b>Speed</b> ' + (e.spd || '—'),
          '<b>Str</b> ' + (e.strReq || '—'),
          esc(e.cat)
        );
      if (e.k === 'armor' && e.cat === 'shield')
        b.push(
          '<b>AC</b> +' + e.ac,
          '<b>Hardness</b> ' + e.hard,
          '<b>HP</b> ' + e.hp + ' (BT ' + Math.floor(e.hp / 2) + ')'
        );
      if (e.use) b.push('<b>Usage</b> ' + esc(e.use.replace(/-/g, ' ')));
      return '<p class="small">' + b.join(' · ') + '</p>';
    }

    // ----- Sheet -----
    function trk(ch) {
      return (ch.track = ch.track || { hp: null, temp: 0, hero: 1, focus: null, dying: 0, wounded: 0, conds: {} });
    }
    function hpBox(ch, d) {
      var T = trk(ch),
        hp = T.hp == null ? d.hp.max : T.hp,
        pct = Math.max(0, Math.min(100, Math.round((hp / d.hp.max) * 100)));
      return (
        '<div class="panel pf-hpbox"><div class="pf-hpline"><b class="pf-hp">' +
        hp +
        '</b><span class="muted">/ ' +
        d.hp.max +
        ' HP</span>' +
        (T.temp ? '<span class="pf-temp">+' + T.temp + ' temp</span>' : '') +
        '<span class="spacer"></span>' +
        btn('pfRest', 'Rest', {}, 'btn small') +
        '</div>' +
        '<div class="hpbar"><span style="width:' +
        pct +
        '%"></span></div><div class="enc-adj">' +
        ['-10', '-5', '-1', '+1', '+5', '+10']
          .map(function (v) {
            return btn('pfHp', v.replace('-', '−'), { v: v }, 'btn small');
          })
          .join('') +
        '</div>' +
        '<div class="row"><label class="field"><span>Temp HP</span><input type="number" min="0" inputmode="numeric" id="pf-temp" data-pftrk="temp" value="' +
        (T.temp || 0) +
        '"></label>' +
        '<div class="field"><span>Hero points</span><span class="pf-dots">' +
        [1, 2, 3]
          .map(function (i) {
            return btn('pfHero', '', { v: i }, 'pf-dot' + ((T.hero || 0) >= i ? ' on' : ''));
          })
          .join('') +
        '</span></div>' +
        (d.focusMax
          ? '<div class="field"><span>Focus points</span><span class="pf-dots">' +
            Array.apply(null, Array(d.focusMax))
              .map(function (_, i) {
                var f = T.focus == null ? d.focusMax : T.focus;
                return btn('pfFocus', '', { v: i + 1 }, 'pf-dot' + (f > i ? ' on' : ''));
              })
              .join('') +
            '</span></div>'
          : '') +
        '</div>' +
        '<div class="row"><div class="field"><span>Dying</span><span class="mm-step">' +
        btn('pfTrk', '−', { k: 'dying', d: -1 }, 'mm-b') +
        '<b>' +
        (T.dying || 0) +
        '</b>' +
        btn('pfTrk', '+', { k: 'dying', d: 1 }, 'mm-b') +
        '</span></div><div class="field"><span>Wounded</span><span class="mm-step">' +
        btn('pfTrk', '−', { k: 'wounded', d: -1 }, 'mm-b') +
        '<b>' +
        (T.wounded || 0) +
        '</b>' +
        btn('pfTrk', '+', { k: 'wounded', d: 1 }, 'mm-b') +
        '</span></div></div>' +
        condHtml(ch) +
        '</div>'
      );
    }
    // Session: the GM's table, then hit points, conditions and the numbers needed in a fight
    function who(ch, d) {
      var T = trk(ch);
      return {
        key: ch.id,
        name: ch.name,
        init: d.perception.v,
        bonus: function (a) {
          if (a.kind === 'save') return (d.saves[a.key] || {}).v || 0;
          if (a.kind === 'perception') return d.perception.v;
          if (a.kind === 'skill') {
            var s = Object.keys(d.skills)
              .map(function (k) {
                return d.skills[k];
              })
              .filter(function (x) {
                return x.n === a.key;
              })[0];
            return s ? s.v : 0;
          }
          return 0;
        },
        take: function (g) {
          var m = (ch.money = ch.money || {});
          ['pp', 'gp', 'sp', 'cp'].forEach(function (k) {
            var n = Math.max(0, Math.min(1e7, Math.floor(+(g.coins || {})[k] || 0)));
            if (n) m[k] = (+m[k] || 0) + n;
          });
          (g.items || []).slice(0, 20).forEach(function (i) {
            if (!i || !i.n) return;
            var e = i.id && PF2.byId('items', String(i.id));
            (ch.gear = ch.gear || []).push(
              e
                ? { uid: PF2.uid(), id: e.id, q: 1, worn: false, runes: {} }
                : { uid: PF2.uid(), id: '', custom: true, name: String(i.n).slice(0, 80), q: 1 }
            );
          });
        },
        status: function () {
          return {
            hp: T.hp == null ? d.hp.max : T.hp,
            max: d.hp.max,
            temp: +T.temp || 0,
            ac: d.ac.v,
            conds: Object.keys(T.conds || {})
              .map(function (c) {
                return c + (T.conds[c] > 1 ? ' ' + T.conds[c] : '');
              })
              .concat(T.dying ? ['Dying ' + T.dying] : []),
            conc: '',
            bon: (function () {
              var b = { Perception: d.perception.v };
              ['fortitude', 'reflex', 'will'].forEach(function (k) {
                b[k[0].toUpperCase() + k.slice(1) + ' save'] = d.saves[k].v;
              });
              Object.keys(d.skills).forEach(function (k) {
                b[d.skills[k].n] = d.skills[k].v;
              });
              return b;
            })()
          };
        },
        gm: 'GM',
        // what the GM sends: returns what to tell the player, and whether a level-up is waiting
        effect: function (f) {
          if (f.k === 'dmg' || f.k === 'heal') {
            actions.pfHp(f.k === 'dmg' ? -Math.abs(f.n) : Math.abs(f.n));
            return {
              msg:
                f.k === 'dmg' ? 'You take ' + Math.abs(f.n) + ' damage.' : 'You heal ' + Math.abs(f.n) + ' hit points.'
            };
          }
          if (f.k === 'cond') {
            T.conds = T.conds || {};
            if (f.on) T.conds[f.c] = T.conds[f.c] || 1;
            else delete T.conds[f.c];
            return { msg: (f.on ? 'You are now ' : 'No longer ') + f.c.toLowerCase() + '.' };
          }
          if (f.k === 'insp') {
            T.hero = Math.min(3, (T.hero || 0) + 1);
            return { msg: 'The GM gives you a hero point!' };
          }
          if (f.k === 'rest') {
            actions.pfRest();
            return { msg: 'Rested: hit points, spell slots and focus points are back.' };
          }
          if (f.k === 'xp') {
            ch.xp = (+ch.xp || 0) + f.n;
            return {
              msg: 'You gain ' + f.n + ' XP (now ' + ch.xp + ').',
              level: ch.xp >= 1000 && (ch.level || 1) < 20
            };
          }
          if (f.k === 'level') return { msg: 'The GM says: level up!', level: true };
          return null;
        },
        levelUp: function () {
          if (+ch.xp >= 1000) ch.xp -= 1000;
          U.tab = 'build';
          U.msg = 'Level up: raise the level on the Build tab and make the new choices.';
          root.scrollTo(0, 0);
        },
        notes: function () {
          return ch.notes ? [{ id: 'notes', title: (ch.name || 'My') + ' notes', text: ch.notes }] : [];
        },
        addNote: function (title, text) {
          ch.notes =
            (ch.notes ? ch.notes + '\n\n' : '') + '## ' + String(title || 'From the table') + '\n' + String(text || '');
        },
        rest: [['long', 'Rest for the night']]
      };
    }
    function playTab(ch, d) {
      var stat = function (label, v) {
        return '<div class="pf-stat"><small>' + label + '</small><b>' + v + '</b></div>';
      };
      return (
        (api.tp ? api.tp.html(who(ch, d)) : '') +
        hpBox(ch, d) +
        '<div class="pf-stats">' +
        stat('AC', d.ac.v) +
        ['fortitude', 'reflex', 'will']
          .map(function (s) {
            return stat(s[0].toUpperCase() + s.slice(1), fmt(d.saves[s].v));
          })
          .join('') +
        stat('Perception', fmt(d.perception.v)) +
        (d.classDC ? stat('Class DC', d.classDC.v) : '') +
        stat('Speed', d.speed.v + ' ft') +
        '</div>'
      );
    }
    function sheetTab(ch, d) {
      var T = trk(ch),
        h = hpBox(ch, d);
      var stat = function (label, v, rank, sub) {
        return (
          '<div class="pf-stat"><small>' +
          label +
          '</small><b>' +
          v +
          '</b>' +
          (rank != null ? teml(rank) : '') +
          (sub ? '<span class="small muted">' + sub + '</span>' : '') +
          '</div>'
        );
      };
      h +=
        '<div class="pf-stats">' +
        stat(
          'AC',
          d.ac.v,
          d.ac.rank,
          (d.armor ? esc(d.armor.e.n) : 'unarmored') + (d.ac.dexCap != null ? ' · Dex cap ' + d.ac.dexCap : '')
        ) +
        (d.shield
          ? stat(
              T.raised ? 'AC, shield raised' : 'Shield raised',
              d.ac.v + d.shield.ac,
              null,
              esc(d.shield.e.n) +
                ' · Hardness ' +
                d.shield.hard +
                ' · HP ' +
                ((T.shield || {})[d.shield.g.uid || 'shield'] == null
                  ? d.shield.hp
                  : T.shield[d.shield.g.uid || 'shield']) +
                '/' +
                d.shield.hp
            )
          : '') +
        ['fortitude', 'reflex', 'will']
          .map(function (s) {
            return stat(s[0].toUpperCase() + s.slice(1), fmt(d.saves[s].v), d.saves[s].rank);
          })
          .join('') +
        stat(
          'Perception',
          fmt(d.perception.v),
          d.perception.rank,
          d.senses
            .map(function (s) {
              return esc(s.type.replace(/-/g, ' ')) + (s.range ? ' ' + s.range + ' ft' : '');
            })
            .join(', ')
        ) +
        (d.classDC ? stat('Class DC', d.classDC.v, d.classDC.rank) : '') +
        stat(
          'Speed',
          d.speed.v + ' ft',
          null,
          d.speed.other
            .map(function (s) {
              return s.type + ' ' + s.v;
            })
            .join(', ')
        ) +
        stat('Size', SIZE[d.size] || d.size) +
        '</div>';
      h +=
        '<div class="pf-abgrid">' +
        ABS.map(function (a) {
          return (
            '<div><small>' +
            a.toUpperCase() +
            '</small><b>' +
            fmt(d.mods[a]) +
            '</b><span>' +
            d.scores[a] +
            '</span></div>'
          );
        }).join('') +
        '</div>';
      if (d.resist.length || d.weak.length || d.immune.length)
        h +=
          '<div class="panel small">' +
          (d.resist.length
            ? '<b>Resistances</b> ' +
              esc(
                d.resist
                  .map(function (r) {
                    return r.type + ' ' + r.v;
                  })
                  .join(', ')
              ) +
              '<br>'
            : '') +
          (d.weak.length
            ? '<b>Weaknesses</b> ' +
              esc(
                d.weak
                  .map(function (r) {
                    return r.type + ' ' + r.v;
                  })
                  .join(', ')
              ) +
              '<br>'
            : '') +
          (d.immune.length
            ? '<b>Immunities</b> ' +
              esc(
                d.immune
                  .map(function (r) {
                    return r.type;
                  })
                  .join(', ')
              )
            : '') +
          '</div>';
      h +=
        '<div class="panel small"><b>Hit points</b>: ' +
        d.hp.parts
          .map(function (p) {
            return esc(p.label) + ' ' + p.v;
          })
          .join(' + ') +
        '<br><b>AC</b>: 10 + Dex ' +
        d.ac.dex +
        ' + proficiency ' +
        d.ac.prof +
        d.ac.parts
          .map(function (p) {
            return ' + ' + esc(p.label) + ' ' + p.v;
          })
          .join('') +
        '<br><b>Weapons</b>: ' +
        ['simple', 'martial', 'advanced', 'unarmed']
          .map(function (k) {
            return k + ' ' + PF2.RANK[(d.attackRanks[k] || {}).rank || 0].toLowerCase();
          })
          .join(', ') +
        '<br><b>Armor</b>: ' +
        ['unarmored', 'light', 'medium', 'heavy']
          .map(function (k) {
            return k + ' ' + PF2.RANK[(d.defenseRanks[k] || {}).rank || 0].toLowerCase();
          })
          .join(', ') +
        '</div>';
      h +=
        '<div class="toolbar noprint">' +
        btn('pfPrint', 'Print or save as PDF', {}, 'btn') +
        btn('pfExport', 'Export file', {}, 'btn') +
        btn('pfDup', 'Duplicate', {}, 'btn') +
        (U.delAsk
          ? '<span>Delete ' +
            esc(ch.name || 'this character') +
            '?</span>' +
            btn('pfDel', 'Yes, delete', {}, 'btn danger') +
            btn('pfDelNo', 'No', {}, 'btn')
          : btn('pfDelAsk', 'Delete', {}, 'btn')) +
        '</div>';
      return h;
    }
    function condHtml(ch) {
      var T = trk(ch),
        conds = PF2.index().core.conditions,
        have = Object.keys(T.conds || {});
      return (
        '<div class="pf-conds">' +
        have
          .map(function (c) {
            var v = T.conds[c];
            return (
              '<span class="pf-cond">' +
              esc(c) +
              (COND_VAL[c.toLowerCase()]
                ? ' ' +
                  btn('pfCond', '−', { v: c, d: -1 }, 'mm-b') +
                  '<b>' +
                  v +
                  '</b>' +
                  btn('pfCond', '+', { v: c, d: 1 }, 'mm-b')
                : '') +
              btn('pfCondRm', '✕', { v: c }, 'mm-b') +
              '</span>'
            );
          })
          .join('') +
        '<select data-pfcondadd="1" aria-label="Add a condition"><option value="">+ Condition…</option>' +
        conds
          .filter(function (c) {
            return have.indexOf(c.n) < 0;
          })
          .map(function (c) {
            return '<option>' + esc(c.n) + '</option>';
          })
          .join('') +
        '</select></div>' +
        have
          .map(function (c) {
            var e = PF2.byName('conditions', c);
            return e ? '<details class="small pf-desc"><summary>' + esc(c) + '</summary>' + md(e.d) + '</details>' : '';
          })
          .join('')
      );
    }

    // ----- Skills -----
    function rollBtn(label, mod) {
      return (
        '<button type="button" class="pf-roll" data-act="pfRoll" data-v="' +
        mod +
        '" data-l="' +
        esc(label) +
        '">' +
        fmt(mod) +
        '</button>'
      );
    }
    function skillsTab(ch, d) {
      var row = function (s, k) {
        return (
          '<div class="pf-skill"><span class="nm"><b>' +
          esc(s.n) +
          '</b> <small class="muted">' +
          s.ab.toUpperCase() +
          (s.pen ? ' · armor ' + s.pen : '') +
          '</small></span>' +
          teml(s.rank) +
          rollBtn(s.n, s.v) +
          '</div>'
        );
      };
      return (
        '<div class="panel"><div class="pf-skill pf-perc"><span class="nm"><b>Perception</b> <small class="muted">WIS</small></span>' +
        teml(d.perception.rank) +
        rollBtn('Perception', d.perception.v) +
        '</div>' +
        PF2.SKILLS.map(function (k) {
          return row(d.skills[k], k);
        }).join('') +
        d.lores
          .map(function (l) {
            return row(d.skills['lore:' + l.n], 'lore:' + l.n);
          })
          .join('') +
        '</div><p class="small muted">Tap a bonus to roll it with the 3D dice. Untrained skills add no proficiency; trained adds your level + 2, expert + 4, master + 6, legendary + 8.</p>'
      );
    }
    // ----- Strikes -----
    function strikesTab(ch, d) {
      return (
        d.strikes
          .map(function (s, i) {
            var a = s.attack;
            return (
              '<div class="panel pf-strike"><div class="pf-strike-head"><b>' +
              esc(s.n) +
              '</b> ' +
              teml(s.rank) +
              '<span class="spacer"></span><small class="muted">' +
              (s.ranged ? 'Ranged' + (s.range ? ' ' + s.range + ' ft' : '') : 'Melee') +
              '</small></div>' +
              traits(s.traits) +
              '<div class="pf-map">' +
              rollBtn(s.n, a) +
              rollBtn(s.n + ' (2nd)', a - s.map[0]) +
              rollBtn(s.n + ' (3rd)', a - s.map[1]) +
              '</div>' +
              '<div class="pf-dmg"><button type="button" class="btn small" data-act="pfDmg" data-v="' +
              i +
              '">Damage ' +
              esc(s.dmg) +
              (s.extra.length ? ' + ' + esc(s.extra.join(', ')) : '') +
              '</button>' +
              (s.cond.length
                ? '<label class="check-line small"><input type="checkbox" data-pfcondmg="' +
                  i +
                  '"' +
                  ((U.cdmg || {})[i] ? ' checked' : '') +
                  '> Add ' +
                  esc(s.cond.join(', ')) +
                  '</label>'
                : '') +
              '</div></div>'
            );
          })
          .join('') +
        '<p class="small muted">The three attack buttons are your first, second and third attack this turn (multiple attack penalty' +
        (d.strikes.some(function (s) {
          return s.map[0] === 4;
        })
          ? '; agile weapons take less'
          : '') +
        '). Weapons come from the Gear tab.</p>'
      );
    }
    // ----- Spells -----
    // quick filters on the spells page: how many actions, reactions, sustained…
    var SPK = [
      [
        '1',
        '◆ 1 action',
        function (s) {
          return s.time === '1' || /^1 (to|or)/.test(s.time || '');
        }
      ],
      [
        '2',
        '◆◆ 2 actions',
        function (s) {
          return s.time === '2' || /(1|2) (to|or) (2|3)/.test(s.time || '');
        }
      ],
      [
        '3',
        '◆◆◆ 3 actions',
        function (s) {
          return s.time === '3' || /(to|or) 3/.test(s.time || '');
        }
      ],
      [
        'reaction',
        '⤾ Reaction',
        function (s) {
          return s.time === 'reaction';
        }
      ],
      [
        'free',
        '◇ Free',
        function (s) {
          return s.time === 'free';
        }
      ],
      [
        'sus',
        'Sustained',
        function (s) {
          return !!s.sus;
        }
      ],
      [
        'long',
        'Longer (exploration)',
        function (s) {
          return /minute|hour|day|week/i.test(s.time || '');
        }
      ]
    ];
    function spOk(s) {
      var k = SPK.filter(function (x) {
        return x[0] === U.spK;
      })[0];
      return !k || k[2](s);
    }
    function spellsTab(ch, d) {
      var h =
          '<div class="pills spell-kinds">' +
          SPK.map(function (k) {
            return btn('pfSpK', k[1], { v: k[0] }, 'pill small' + (U.spK === k[0] ? ' on' : ''));
          }).join('') +
          '</div>',
        T = trk(ch);
      if (!d.casters.length && !d.focusMax && !(ch.spells && ch.spells.innate))
        h +=
          '<p class="muted">No spellcasting yet. Spells come from your class, a multiclass dedication, or feats (innate and focus spells).</p>';
      d.casters.forEach(function (c) {
        var bucket = (ch.spells || {})[c.id] || { known: {} },
          used = (T.slots || {})[c.id] || {};
        h +=
          '<section class="panel pf-caster"><div class="toolbar" style="margin:0"><h3 style="margin:0">' +
          esc(c.n) +
          '</h3><span class="spacer"></span>' +
          btn('pfSlotsReset', 'Restore slots', { v: c.id }, 'btn small') +
          '</div>' +
          (c.needTrad
            ? '<p class="small bad">Choose your ' +
              (c.arch ? 'archetype’s ' : '') +
              'subclass first (bloodline, patron or eidolon): it decides your tradition.</p>'
            : '') +
          '<p class="small">' +
          esc(
            (c.trad || '?').replace(/^./, function (x) {
              return x.toUpperCase();
            })
          ) +
          ' · ' +
          c.type +
          ' · <b>DC ' +
          c.dc +
          '</b> · attack ' +
          rollBtn('Spell attack', c.attack) +
          ' ' +
          teml(c.rank) +
          '</p>';
        for (var r = 0; r <= 10; r++) {
          var n = r === 0 ? c.cantrips : c.slots[r];
          if (!n) continue;
          var known = (bucket.known || {})[r] || [],
            u = used[r] || 0;
          var granted = r === 0 ? [] : [];
          h +=
            '<div class="pf-rank"><div class="pf-rank-head"><b>' +
            (r ? 'Rank ' + r : 'Cantrips (rank ' + c.heighten + ')') +
            '</b>' +
            (r
              ? '<span class="pf-dots">' +
                Array.apply(null, Array(n))
                  .map(function (_, i) {
                    return btn('pfSlot', '', { v: c.id, r: r, i: i + 1 }, 'pf-dot' + (i < n - u ? ' on' : ''));
                  })
                  .join('') +
                '</span>'
              : '') +
            '<span class="spacer"></span>' +
            btn('pfPick', '+ Spell', { k: 'spell', entry: c.id, rank: r, trad: c.trad }, 'btn tiny') +
            '</div>' +
            spellRows(known, c.id, r) +
            (c.rep && r
              ? '<div class="small muted">' + known.length + ' of ' + n + ' in your repertoire</div>'
              : r === 0 && known.length < n
                ? '<div class="small muted">' + known.length + ' of ' + n + '</div>'
                : '') +
            '</div>';
        }
        if (c.font)
          h +=
            '<p class="small">Divine font: ' +
            (1 + d.mods.cha) +
            ' extra slots of your highest rank for heal or harm.</p>';
        h += '</section>';
      });
      // spells granted by features (bloodline, domain, compositions…)
      if (d.grantedSpells.length)
        h +=
          '<section class="panel"><h3 style="margin-top:0">Granted spells</h3>' +
          d.grantedSpells
            .map(function (g) {
              return spellRow(g.s, null, null, g.from);
            })
            .join('') +
          '</section>';
      // focus
      if (d.focusMax || (ch.spells && ch.spells.focus)) {
        var fb = (ch.spells || {}).focus || { known: {} },
          fv = T.focus == null ? d.focusMax : T.focus;
        h +=
          '<section class="panel"><div class="toolbar" style="margin:0"><h3 style="margin:0">Focus spells</h3><span class="spacer"></span>' +
          btn('pfPick', '+ Focus spell', { k: 'spell', entry: 'focus', rank: 0, focus: 1 }, 'btn tiny') +
          '</div>' +
          '<p class="small">Focus points <span class="pf-dots">' +
          Array.apply(null, Array(Math.max(1, d.focusMax)))
            .map(function (_, i) {
              return btn('pfFocus', '', { v: i + 1 }, 'pf-dot' + (fv > i ? ' on' : ''));
            })
            .join('') +
          '</span> · DC ' +
          d.focus.dc +
          ' · attack ' +
          fmt(d.focus.attack) +
          ' · heightened to rank ' +
          Math.max(1, Math.ceil(d.level / 2)) +
          '</p>' +
          spellRows((fb.known || {})[0] || [], 'focus', 0) +
          '</section>';
      }
      var inn = (ch.spells || {}).innate || { known: {} };
      h +=
        '<section class="panel"><div class="toolbar" style="margin:0"><h3 style="margin:0">Innate spells</h3><span class="spacer"></span>' +
        btn('pfPick', '+ Innate spell', { k: 'spell', entry: 'innate', rank: 10 }, 'btn tiny') +
        '</div><p class="small muted">From ancestry feats and items (First World Magic and the like). Charisma, trained, as the feat says.</p>' +
        Object.keys(inn.known || {})
          .map(function (r) {
            return spellRows(inn.known[r], 'innate', r);
          })
          .join('') +
        '</section>';
      return h;
    }
    function spellRows(ids, entry, r) {
      return (ids || [])
        .map(function (id) {
          var s = PF2.byId('spells', id);
          return s ? spellRow(s, entry, r) : '';
        })
        .join('');
    }
    function spellRow(s, entry, r, from) {
      if (!spOk(s)) return '';
      var k = 's:' + (entry || 'g') + ':' + s.id,
        open = U.open === k;
      return (
        '<div class="pf-spell' +
        rar(s) +
        '"><button type="button" class="pf-pname" data-act="pfOpenRow" data-v="' +
        esc(k) +
        '"><b>' +
        esc(s.n) +
        '</b> ' +
        gl(/^[123rf]$/.test(s.time) ? s.time : '') +
        '<span class="spacer"></span><small class="muted">' +
        (from ? esc(from) : s.cat === 'cantrip' ? 'cantrip' : s.cat === 'focus' ? 'focus' : 'rank ' + s.lv) +
        '</small></button>' +
        (entry ? btn('pfSpellRm', '✕', { v: s.id, e: entry, r: r }, 'mm-b') : '') +
        (open ? '<div class="pf-desc">' + traits(s.t, s) + spellLine(s) + md(s.d) + '</div>' : '') +
        '</div>'
      );
    }
    // ----- runes: fundamental runes as selects, property runes as slots (one per potency rank) that open the rune picker -----
    function runeEditor(ch, g, i, e) {
      var R = g.runes || {},
        isW = e.k === 'weapon',
        isArmor = e.k === 'armor' && e.cat !== 'shield';
      if (!isW && !isArmor && (e.t || []).indexOf('invested') < 0) return '';
      var h =
        '<div class="pf-runes"><label class="field"><span>Potency</span><select data-pfrune="' +
        i +
        '" data-f="pot">' +
        [0, 1, 2, 3]
          .map(function (v) {
            return (
              '<option value="' +
              v +
              '"' +
              ((+R.pot || 0) === v ? ' selected' : '') +
              '>' +
              (v ? '+' + v : 'none') +
              '</option>'
            );
          })
          .join('') +
        '</select></label>';
      if (isW)
        h +=
          '<label class="field"><span>Striking</span><select data-pfrune="' +
          i +
          '" data-f="str">' +
          [
            ['', 'none'],
            ['striking', 'Striking'],
            ['greaterStriking', 'Greater'],
            ['majorStriking', 'Major']
          ]
            .map(function (o) {
              return (
                '<option value="' + o[0] + '"' + ((R.str || '') === o[0] ? ' selected' : '') + '>' + o[1] + '</option>'
              );
            })
            .join('') +
          '</select></label>';
      if (isArmor)
        h +=
          '<label class="field"><span>Resilient</span><select data-pfrune="' +
          i +
          '" data-f="res">' +
          [
            ['', 'none'],
            ['resilient', 'Resilient'],
            ['greaterResilient', 'Greater'],
            ['majorResilient', 'Major']
          ]
            .map(function (o) {
              return (
                '<option value="' + o[0] + '"' + ((R.res || '') === o[0] ? ' selected' : '') + '>' + o[1] + '</option>'
              );
            })
            .join('') +
          '</select></label>';
      h += '</div>';
      if (isW || isArmor || (R.prop || []).length) {
        var n = Math.max(+R.pot || 0, (R.prop || []).length);
        h +=
          '<div class="small muted">Property runes: one slot per potency rank (+' +
          (+R.pot || 0) +
          ').</div><div class="pf-runeslots">';
        for (var s = 0; s < n; s++) {
          var nm = (R.prop || [])[s],
            re = nm && PF2.byName('items', nm);
          h +=
            '<span class="pf-runeslot"><button type="button" class="pf-pickcard' +
            rar(re) +
            '" data-act="pfPick" data-k="rune" data-gi="' +
            i +
            '" data-slot="' +
            s +
            '" data-which="' +
            (isW ? 'w' : 'a') +
            '"><small>Property rune ' +
            (s + 1) +
            '</small><b>' +
            (nm ? esc(nm) : 'Choose…') +
            '</b></button>' +
            (nm ? btn('pfRuneRm', '✕', { v: i, s: s }, 'btn small') : '') +
            '</span>';
        }
        h += (n ? '' : '<span class="small muted">Add a potency rune first.</span>') + '</div>';
      }
      return h;
    }
    function gearIndex(ch, x) {
      return (ch.gear || []).indexOf(x);
    }

    // ----- Defense -----
    function defenseTab(ch, d) {
      var T = trk(ch),
        arm = d.armor,
        sh = d.shield;
      var h =
        '<div class="panel pf-bigstat"><div><small>Armor Class</small><b>' +
        d.ac.v +
        '</b>' +
        teml(d.ac.rank) +
        '</div>' +
        (sh
          ? '<label class="check-line"><input type="checkbox" data-pfraise="1"' +
            (T.raised ? ' checked' : '') +
            '> <span>Shield raised: <b>AC ' +
            (d.ac.v + sh.ac) +
            '</b> (+' +
            sh.ac +
            ' circumstance)</span></label>'
          : '') +
        '<p class="small">10 + Dex ' +
        d.ac.dex +
        (d.ac.dexCap != null ? ' (cap ' + d.ac.dexCap + ')' : '') +
        ' + ' +
        PF2.RANK[d.ac.rank].toLowerCase() +
        ' in ' +
        d.ac.cat +
        ' ' +
        d.ac.prof +
        d.ac.parts
          .map(function (p) {
            return ' + ' + esc(p.label) + ' ' + p.v;
          })
          .join('') +
        '</p>' +
        (d.checkPenalty
          ? '<p class="small bad">Armor check penalty ' +
            d.checkPenalty +
            ' on Strength and Dexterity skills (your Strength is below the armor’s).</p>'
          : '') +
        (d.armorSpeedPenalty ? '<p class="small">Speed ' + d.armorSpeedPenalty + ' ft from armor.</p>' : '') +
        '</div>';
      // armor
      h +=
        '<section class="panel"><div class="toolbar" style="margin:0"><h3 style="margin:0">Armor</h3><span class="spacer"></span>' +
        btn('pfPick', arm ? 'Change' : 'Choose armor', { k: 'item', equip: 'armor', type: 'armor' }, 'btn small') +
        (arm ? btn('pfUnequip', 'Take off', { v: gearIndex(ch, arm.g) }, 'btn small') : '') +
        '</div>';
      if (arm) {
        var e = arm.e,
          gi = gearIndex(ch, arm.g);
        h +=
          '<p><b>' +
          esc(runeTitle(arm.g) + (arm.g.name || e.n)) +
          '</b></p>' +
          traits(e.t, e) +
          itemLine(e) +
          runeEditor(ch, arm.g, gi, e) +
          '<details class="small pf-desc"><summary>About ' +
          esc(e.n) +
          '</summary>' +
          md(e.d) +
          runeDescs(arm.g) +
          '</details>';
      } else
        h +=
          '<p class="small muted">Unarmored' +
          (d.ac.dexCap != null ? ' (worn items cap Dex at +' + d.ac.dexCap + ')' : '') +
          '. Explorer’s clothing and bracers of armor count as unarmored; add them from Gear and mark them worn.</p>';
      var worn = (ch.gear || []).filter(function (g) {
        var e = PF2.byId('items', g.id);
        return (
          g.worn &&
          e &&
          e.k !== 'armor' &&
          e.k !== 'weapon' &&
          (e.ru || []).some(function (r) {
            return r.key === 'FlatModifier' && [].concat(r.selector).indexOf('ac') >= 0;
          })
        );
      });
      worn.forEach(function (g) {
        var e = PF2.byId('items', g.id),
          gi = gearIndex(ch, g);
        h +=
          '<div class="pf-subitem"><b>' +
          esc(runeTitle(g) + (g.name || e.n)) +
          '</b>' +
          runeEditor(ch, g, gi, e) +
          '</div>';
      });
      h +=
        '<p class="small">Armor proficiency: ' +
        ['unarmored', 'light', 'medium', 'heavy']
          .map(function (k) {
            return k + ' ' + PF2.RANK[(d.defenseRanks[k] || {}).rank || 0].toLowerCase();
          })
          .join(' · ') +
        '</p></section>';
      // shield
      h +=
        '<section class="panel"><div class="toolbar" style="margin:0"><h3 style="margin:0">Shield</h3><span class="spacer"></span>' +
        btn('pfPick', sh ? 'Change' : 'Choose a shield', { k: 'item', equip: 'shield', type: 'shield' }, 'btn small') +
        (sh ? btn('pfUnequip', 'Put away', { v: gearIndex(ch, sh.g) }, 'btn small') : '') +
        '</div>';
      if (sh) {
        var sid = sh.g.uid || 'shield',
          shp = (T.shield || {})[sid];
        shp = shp == null ? sh.hp : shp;
        var pct = sh.hp ? Math.max(0, Math.round((shp / sh.hp) * 100)) : 0,
          broken = shp <= sh.bt;
        h +=
          '<p><b>' +
          esc(sh.g.name || sh.e.n) +
          '</b> · +' +
          sh.ac +
          ' AC raised · Hardness ' +
          sh.hard +
          '</p>' +
          '<div class="pm-hp"><span><b>' +
          shp +
          '</b>/' +
          sh.hp +
          ' HP' +
          (broken ? ' · <b class="bad">' + (shp <= 0 ? 'destroyed' : 'broken') + '</b>' : '') +
          ' (broken at ' +
          sh.bt +
          ')</span><div class="hpbar"><span style="width:' +
          pct +
          '%"></span></div>' +
          '<div class="enc-adj">' +
          ['-10', '-5', '-1', '+1', '+5', '+10']
            .map(function (v) {
              return btn('pfShieldHp', v.replace('-', '−'), { v: v }, 'btn small');
            })
            .join('') +
          '</div></div>' +
          '<p class="small muted">Shield Block (if you have it): when you take damage with the shield raised, it takes the damage first, reduced by its Hardness; you and the shield both take what’s left.</p>' +
          '<details class="small pf-desc"><summary>About ' +
          esc(sh.e.n) +
          '</summary>' +
          md(sh.e.d) +
          '</details>';
      } else h += '<p class="small muted">No shield.</p>';
      h += '</section>';
      // saves
      h +=
        '<section class="panel"><h3 style="margin-top:0">Saving throws</h3>' +
        ['fortitude', 'reflex', 'will']
          .map(function (s) {
            var x = d.saves[s];
            return (
              '<div class="pf-skill"><span class="nm"><b>' +
              s[0].toUpperCase() +
              s.slice(1) +
              '</b> <small class="muted">' +
              x.ab.toUpperCase() +
              x.parts
                .filter(function (p) {
                  return p.v;
                })
                .map(function (p) {
                  return ' · ' + esc(p.label) + ' ' + fmt(p.v);
                })
                .join('') +
              '</small></span>' +
              teml(x.rank) +
              rollBtn(s, x.v) +
              '</div>'
            );
          })
          .join('') +
        '</section>';
      if (d.resist.length || d.weak.length || d.immune.length)
        h +=
          '<section class="panel small"><h3 style="margin-top:0">Resistances and weaknesses</h3>' +
          (d.resist.length
            ? '<b>Resistances</b> ' +
              esc(
                d.resist
                  .map(function (r) {
                    return r.type + ' ' + r.v + ' (' + r.from + ')';
                  })
                  .join(', ')
              ) +
              '<br>'
            : '') +
          (d.weak.length
            ? '<b>Weaknesses</b> ' +
              esc(
                d.weak
                  .map(function (r) {
                    return r.type + ' ' + r.v;
                  })
                  .join(', ')
              ) +
              '<br>'
            : '') +
          (d.immune.length
            ? '<b>Immunities</b> ' +
              esc(
                d.immune
                  .map(function (r) {
                    return r.type;
                  })
                  .join(', ')
              )
            : '') +
          '</section>';
      h += '<section class="panel"><h3 style="margin-top:0">Conditions</h3>' + condHtml(ch) + '</section>';
      return h;
    }
    function runeTitle(g) {
      var R = g.runes || {};
      return (
        (R.pot ? '+' + R.pot + ' ' : '') +
        (R.str
          ? { striking: 'Striking ', greaterStriking: 'Greater Striking ', majorStriking: 'Major Striking ' }[R.str]
          : '') +
        (R.res
          ? { resilient: 'Resilient ', greaterResilient: 'Greater Resilient ', majorResilient: 'Major Resilient ' }[
              R.res
            ]
          : '') +
        ((R.prop || []).length ? R.prop.join(' ') + ' ' : '')
      );
    }
    function runeDescs(g) {
      return ((g.runes || {}).prop || [])
        .map(function (n) {
          var e = PF2.byName('items', n);
          return e ? '<p><b>' + esc(e.n) + ':</b> ' + esc(String(e.d || '').split('\n')[0]) + '</p>' : '';
        })
        .join('');
    }

    // ----- Offense -----
    function offenseTab(ch, d) {
      var at = d.attackRanks,
        special = Object.keys(at).filter(function (k) {
          return /^weapon-(base|group)-/.test(k) && at[k].rank > Math.max(at.simple.rank, at.martial.rank);
        });
      var h =
        '<section class="panel"><div class="pf-skill pf-perc"><span class="nm"><b>Perception</b> <small class="muted">initiative</small></span>' +
        teml(d.perception.rank) +
        rollBtn('Perception', d.perception.v) +
        '</div>' +
        (d.classDC
          ? '<div class="pf-skill"><span class="nm"><b>Class DC</b> <small class="muted">' +
            (d.key || '').toUpperCase() +
            '</small></span>' +
            teml(d.classDC.rank) +
            '<b class="pf-dc">' +
            d.classDC.v +
            '</b></div>'
          : '') +
        d.casters
          .map(function (c) {
            return (
              '<div class="pf-skill"><span class="nm"><b>' +
              esc(c.n) +
              '</b> <small class="muted">' +
              esc(c.trad || '') +
              ' · DC ' +
              c.dc +
              '</small></span>' +
              teml(c.rank) +
              rollBtn('Spell attack', c.attack) +
              '</div>'
            );
          })
          .join('') +
        '<p class="small">Weapons: ' +
        ['simple', 'martial', 'advanced', 'unarmed']
          .map(function (k) {
            return k + ' ' + PF2.RANK[(at[k] || {}).rank || 0].toLowerCase();
          })
          .join(' · ') +
        (special.length
          ? ' · ' +
            special
              .map(function (k) {
                return (
                  k.replace(/^weapon-(base|group)-/, '').replace(/-/g, ' ') + ' ' + PF2.RANK[at[k].rank].toLowerCase()
                );
              })
              .join(' · ')
          : '') +
        '</p>' +
        '<div class="toolbar">' +
        btn('pfPick', '+ Add a weapon', { k: 'item', equip: 'weapon', type: 'weapon' }, 'btn primary') +
        '</div></section>';
      return (
        h +
        d.strikes
          .map(function (s, i) {
            var a = s.attack,
              gi = s.g && s.g.uid ? gearIndex(ch, s.g) : -1,
              k = 'w:' + i,
              open = U.open === k;
            return (
              '<div class="panel pf-strike"><div class="pf-strike-head"><b>' +
              esc((s.g && s.g.runes ? runeTitle(s.g) : '') + s.n) +
              '</b> ' +
              teml(s.rank) +
              '<span class="spacer"></span><small class="muted">' +
              (s.ranged ? 'Ranged' + (s.range ? ' ' + s.range + ' ft' : '') : 'Melee') +
              '</small></div>' +
              traits(s.traits) +
              '<div class="pf-map">' +
              rollBtn(s.n, a) +
              rollBtn(s.n + ' (2nd)', a - s.map[0]) +
              rollBtn(s.n + ' (3rd)', a - s.map[1]) +
              '</div>' +
              '<div class="pf-dmg"><button type="button" class="btn small" data-act="pfDmg" data-v="' +
              i +
              '">Damage ' +
              esc(s.dmg) +
              (s.extra.length ? ' + ' + esc(s.extra.join(', ')) : '') +
              '</button>' +
              (s.cond.length
                ? '<label class="check-line small"><input type="checkbox" data-pfcondmg="' +
                  i +
                  '"' +
                  ((U.cdmg || {})[i] ? ' checked' : '') +
                  '> Add ' +
                  esc(s.cond.join(', ')) +
                  '</label>'
                : '') +
              '</div>' +
              (gi >= 0
                ? '<div class="toolbar">' +
                  btn('pfOpenRow', open ? 'Close' : 'Runes and details', { v: k }, 'btn small') +
                  btn('pfUnequip', 'Stow', { v: gi }, 'btn small') +
                  '</div>' +
                  (open
                    ? runeEditor(ch, s.g, gi, s.w) +
                      '<details class="small pf-desc"><summary>About ' +
                      esc(s.w.n) +
                      '</summary>' +
                      md(s.w.d) +
                      runeDescs(s.g) +
                      '</details>'
                    : '')
                : '') +
              '</div>'
            );
          })
          .join('') +
        '<p class="small muted">The three attack buttons are your first, second and third attack this turn (multiple attack penalty). Stowed weapons stay in Gear; mark them Ready there to bring them back.</p>'
      );
    }

    // ----- Gear -----
    function gearTab(ch, d) {
      var m = ch.money || {},
        bulk = 0;
      (ch.gear || []).forEach(function (g) {
        var e = PF2.byId('items', g.id);
        var b = e ? e.bulk : 0;
        bulk += (b === 'L' ? 0.1 : +b || 0) * (g.q || 1) * (b === 'L' ? 1 : 1);
      });
      var str = d.mods.str,
        enc = 5 + str,
        max = 10 + str;
      var h =
        '<div class="panel"><div class="pf-coins">' +
        ['pp', 'gp', 'sp', 'cp']
          .map(function (c) {
            return (
              '<label class="pf-coin pf-' +
              c +
              '"><span>' +
              c.toUpperCase() +
              '</span><input type="number" min="0" inputmode="numeric" id="pf-m-' +
              c +
              '" data-pfmoney="' +
              c +
              '" value="' +
              (m[c] || 0) +
              '"></label>'
            );
          })
          .join('') +
        '</div>' +
        '<p class="small">Bulk ' +
        Math.round(bulk * 10) / 10 +
        ' · encumbered above ' +
        enc +
        ' · maximum ' +
        max +
        (bulk > enc ? ' · <b class="bad">encumbered</b>' : '') +
        ' · invested ' +
        d.invested +
        ' of ' +
        d.investMax +
        '</p>' +
        '<div class="toolbar">' +
        btn('pfPick', '+ Add equipment', { k: 'item' }, 'btn primary') +
        btn('pfCustomItem', '+ Custom item', {}, 'btn') +
        '</div></div>';
      h += (ch.gear || [])
        .map(function (g, i) {
          var e = PF2.byId('items', g.id),
            name = g.name || (e ? e.n : 'Item'),
            k = 'g:' + (g.uid || i),
            open = U.open === k,
            inv = e && (e.t || []).indexOf('invested') >= 0,
            R = g.runes || {};
          var runeName =
            (R.pot ? '+' + R.pot + ' ' : '') +
            (R.str
              ? { striking: 'Striking ', greaterStriking: 'Greater Striking ', majorStriking: 'Major Striking ' }[R.str]
              : '') +
            (R.res
              ? { resilient: 'Resilient ', greaterResilient: 'Greater Resilient ', majorResilient: 'Major Resilient ' }[
                  R.res
                ]
              : '') +
            ((R.prop || []).length ? R.prop.join(' ') + ' ' : '');
          var toggle =
            e && (e.k === 'weapon' || e.k === 'armor' || inv || /^worn|held/.test(e.use || ''))
              ? '<label class="check-line small"><input type="checkbox" data-pfworn="' +
                i +
                '"' +
                (g.worn ? ' checked' : '') +
                '> ' +
                (inv ? 'Invested' : e.k === 'weapon' ? 'Ready' : 'Worn') +
                '</label>'
              : '';
          var body = '';
          if (open) {
            body =
              '<div class="pf-desc">' +
              (e ? traits(e.t, e) + itemLine(e) + md(e.d) : '') +
              '<label class="field"><span>Name on the sheet</span><input type="text" id="pf-gn-' +
              i +
              '" data-pfgname="' +
              i +
              '" value="' +
              esc(g.name || '') +
              '" placeholder="' +
              esc(e ? e.n : '') +
              '"></label>';
            if (e) body += runeEditor(ch, g, i, e);
            body += '<div class="toolbar">' + btn('pfGearRm', 'Remove', { v: i }, 'btn small danger') + '</div></div>';
          }
          return (
            '<div class="pf-item' +
            rar(e) +
            '"><button type="button" class="pf-pname" data-act="pfOpenRow" data-v="' +
            esc(k) +
            '"><b>' +
            esc(runeName + name) +
            '</b><span class="spacer"></span><small class="muted">' +
            (e ? e.bulk || '—' : '') +
            '</small></button>' +
            '<span class="mm-step">' +
            btn('pfQty', '−', { v: i, d: -1 }, 'mm-b') +
            '<b>' +
            (g.q || 1) +
            '</b>' +
            btn('pfQty', '+', { v: i, d: 1 }, 'mm-b') +
            '</span>' +
            toggle +
            body +
            '</div>'
          );
        })
        .join('');
      if (U.customItem)
        h +=
          '<div class="panel"><label class="field"><span>Custom item</span><input type="text" id="pf-custom" placeholder="Name"></label>' +
          btn('pfCustomAdd', 'Add', {}, 'btn primary') +
          '</div>';
      return h;
    }
    // ----- Feats & features -----
    function featsTab(ch, d) {
      var groups = { anc: [], cls: [], feat: [], other: [] };
      d.items.forEach(function (it) {
        var e = it.e;
        if (/^(ancestry|background|class)$/.test(it.key)) return;
        var g =
          it.key === 'heritage' || /^af:/.test(it.key)
            ? 'anc'
            : /^cf:/.test(it.key) || e._k === 'classfeatures'
              ? 'cls'
              : e._k === 'feats'
                ? 'feat'
                : 'other';
        groups[g].push(it);
      });
      var row = function (it) {
        var k = 'i:' + it.key,
          open = U.open === k;
        return (
          '<div class="pf-spell' +
          rar(it.e) +
          '"><button type="button" class="pf-pname" data-act="pfOpenRow" data-v="' +
          esc(k) +
          '"><b>' +
          esc(it.e.n) +
          '</b> ' +
          gl(it.e.a) +
          '<span class="spacer"></span><small class="muted">' +
          esc(it.from || '') +
          '</small></button>' +
          (open ? '<div class="pf-desc">' + traits(it.e.t, it.e) + md(it.e.d) + '</div>' : '') +
          '</div>'
        );
      };
      return [
        ['anc', 'Ancestry and heritage'],
        ['cls', 'Class features'],
        ['feat', 'Feats'],
        ['other', 'Other']
      ]
        .map(function (g) {
          return groups[g[0]].length
            ? '<section class="panel"><h3 style="margin-top:0">' +
                g[1] +
                '</h3>' +
                groups[g[0]].map(row).join('') +
                '</section>'
            : '';
        })
        .join('');
    }
    // ----- Actions -----
    function actionsTab(ch, d) {
      var X = PF2.index(),
        f = U.actF || 'mine',
        q = (U.actQ || '').toLowerCase();
      var mine = d.items
        .filter(function (it) {
          return it.e.a;
        })
        .map(function (it) {
          return it.e;
        });
      var all =
        f === 'mine'
          ? mine
          : X.core.actions.filter(function (a) {
              return f === 'all' || (a.t || []).indexOf(f) >= 0 || a.cat === f;
            });
      all = all.filter(function (a) {
        return !q || a.n.toLowerCase().indexOf(q) >= 0;
      });
      var pill = function (v, l) {
        return btn('pfActF', l, { v: v }, 'pill small' + (f === v ? ' on' : ''));
      };
      return (
        '<div class="pills">' +
          pill('mine', 'Mine') +
          pill('basic', 'Basic') +
          pill('skill', 'Skill') +
          pill('exploration', 'Exploration') +
          pill('downtime', 'Downtime') +
          pill('all', 'All') +
          '</div>' +
          '<input type="search" id="pf-actq" data-pfactq="1" placeholder="Search actions…" value="' +
          esc(U.actQ || '') +
          '">' +
          all
            .slice(0, 200)
            .map(function (a) {
              var k = 'a:' + a.id,
                open = U.open === k;
              return (
                '<div class="pf-spell"><button type="button" class="pf-pname" data-act="pfOpenRow" data-v="' +
                esc(k) +
                '"><b>' +
                esc(a.n) +
                '</b> ' +
                gl(a.a) +
                '</button>' +
                (open ? '<div class="pf-desc">' + traits(a.t, a) + md(a.d) + '</div>' : '') +
                '</div>'
              );
            })
            .join('') || '<p class="muted">Nothing here.</p>'
      );
    }
    // ----- Notes -----
    function notesTab(ch, d) {
      var langs = ch.langs || [],
        sug = d.anc ? (d.anc.langs || []).concat(d.anc.addLangs || []) : [];
      return (
        '<div class="panel pf-picpanel"><h3 style="margin-top:0">Picture</h3>' +
        (ch.picture
          ? '<div class="pf-picbig">' + picHtml(ch) + '</div>'
          : '<p class="small muted">A portrait or any image of your character, from your photos or files. It stays on this device.</p>') +
        '<div class="toolbar"><label class="btn primary">' +
        (ch.picture ? 'Change picture' : 'Add a picture') +
        '<input type="file" accept="image/*" data-pfpic="1" hidden></label>' +
        (ch.picture
          ? btn('pfPicFit', ch.picFit === 'contain' ? 'Fill the frame' : 'Show the whole picture', {}, 'btn') +
            btn('pfPicRm', 'Remove', {}, 'btn')
          : '') +
        '</div>' +
        (U.picErr ? '<p class="small bad">' + esc(U.picErr) + '</p>' : '') +
        '</div>' +
        '<div class="panel"><div class="row"><label class="field"><span>Alignment</span><select data-pff="alignment"><option value="">—</option>' +
        ALIGN.map(function (a) {
          return '<option' + (ch.alignment === a ? ' selected' : '') + '>' + a + '</option>';
        }).join('') +
        '</select></label>' +
        '<label class="field"><span>Deity</span><input type="text" id="pf-deity" data-pff="deity" value="' +
        esc(ch.deity || '') +
        '" list="pf-deities"></label><datalist id="pf-deities">' +
        PF2.index()
          .core.deities.map(function (x) {
            return '<option value="' + esc(x.n) + '">';
          })
          .join('') +
        '</datalist></div>' +
        '<div class="row"><label class="field"><span>Age</span><input type="text" id="pf-age" data-pff="age" value="' +
        esc(ch.age || '') +
        '"></label><label class="field"><span>Gender / pronouns</span><input type="text" id="pf-gender" data-pff="gender" value="' +
        esc(ch.gender || '') +
        '"></label><label class="field"><span>XP</span><input type="number" id="pf-xp" data-pff="xp" value="' +
        (ch.xp || 0) +
        '"></label></div>' +
        '<div class="field"><span>Languages</span><div class="pills">' +
        langs
          .map(function (l, i) {
            return '<span class="pill small on">' + esc(l) + ' ' + btn('pfLangRm', '✕', { v: i }, 'mm-b') + '</span>';
          })
          .join('') +
        '</div><div class="row"><input type="text" id="pf-lang" list="pf-langs" placeholder="Add a language"><datalist id="pf-langs">' +
        sug
          .map(function (l) {
            return '<option value="' + esc(l[0].toUpperCase() + l.slice(1)) + '">';
          })
          .join('') +
        '</datalist>' +
        btn('pfLangAdd', '+', {}, 'btn small') +
        '</div></div>' +
        '<label class="field"><span>Notes</span><textarea id="pf-notes" data-pff="notes" rows="8">' +
        esc(ch.notes || '') +
        '</textarea></label>' +
        '<div class="toolbar"><input type="search" id="pf-nq" data-pfnq="1" placeholder="Find a word in the notes…" value="' +
        esc(U.noteQ || '') +
        '">' +
        (U.noteQ
          ? (function () {
              var r = root.findSnippets ? root.findSnippets(ch.notes, U.noteQ, 8) : { n: 0, html: '' };
              return (
                '<span class="small muted">' + r.n + ' found</span></div><div class="snip-group">' + r.html + '</div>'
              );
            })()
          : '</div>') +
        (d.deity ? '' : '') +
        '</div>' +
        (ch.deity && PF2.byName('deities', ch.deity)
          ? '<details class="panel"><summary>' +
            esc(ch.deity) +
            '</summary>' +
            md(PF2.byName('deities', ch.deity).d) +
            '</details>'
          : '')
      );
    }

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
                entryDetail(
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
        '</main>'
      );
    }

    function html(section) {
      if (section === 'pf2-home') return homeHtml();
      if (section === 'pf2-rules') return need(CHAR_DATA) ? rulesHtml() : waitHtml('Rules');
      if (section === 'pf2-chars') {
        if (!need(CHAR_DATA)) return waitHtml('Characters');
        var ch = U.view === 'char' && cur();
        return ch ? charHtml(ch) : listHtml();
      }
      if (section === 'pf2-mon') return root.PF2Enc ? ENC.monstersHtml() : '';
      if (section === 'pf2-loot') return root.PF2Enc ? ENC.lootHtml() : '';
      if (section === 'pf2-party' || section === 'pf2-enc')
        return root.PF2Enc ? (section === 'pf2-party' ? ENC.partyHtml() : ENC.html()) : '';
      return homeHtml();
    }
    var ENC = root.PF2Enc
      ? root.PF2Enc({
          esc: esc,
          btn: btn,
          ui: ui,
          store: store,
          render: render,
          ts: api.ts,
          need: need,
          waitHtml: waitHtml,
          md: md,
          fmt: fmt,
          gl: gl,
          traits: traits
        })
      : { actions: {}, onInput: function () {}, onChange: function () {} };

    // ---------- actions ----------
    function chg(fn) {
      var ch = cur();
      if (ch) fn(ch);
    }
    function pickTarget() {
      return U.pick;
    }
    var actions = {
      pfSpK: function (v) {
        U.spK = U.spK === v ? '' : v;
      },
      pfNew: function () {
        var c = PF2.newChar();
        S().chars.push(c);
        S().cur = c.id;
        U.view = 'char';
        U.tab = 'build';
        root.scrollTo(0, 0);
      },
      pfOpen: function (v) {
        S().cur = v;
        U.view = 'char';
        var d = PF2.derive(cur());
        U.tab = d.warnings.length > 3 ? 'build' : 'sheet';
        root.scrollTo(0, 0);
      },
      pfList: function () {
        U.view = 'list';
        U.pick = null;
        root.scrollTo(0, 0);
      },
      pfTab: function (v) {
        U.tab = v;
        U.open = '';
        U.pick = null;
        root.scrollTo(0, 0);
      },
      pfMsgOk: function () {
        U.msg = '';
      },
      pfImp: function () {
        U.imp = U.imp ? null : { txt: '' };
      },
      pfImpClose: function () {
        U.imp = null;
      },
      pfImpGo: function () {
        var t = document.getElementById('pf-imp-txt');
        doImport(t ? t.value : '');
        return false;
      },
      pfLevel: function (v) {
        chg(function (ch) {
          ch.level = Math.max(1, Math.min(20, (+ch.level || 1) + +v));
        });
      },
      pfKey: function (v) {
        chg(function (ch) {
          ch.key = v;
        });
      },
      pfBoost: function (v, el) {
        chg(function (ch) {
          var slot = el.getAttribute('data-slot'),
            B = (ch.boosts = ch.boosts || { anc: [], bg: [], lv: {} }),
            m;
          if ((m = /^anc(\d)$/.exec(slot))) {
            B.anc = B.anc || [];
            B.anc[+m[1]] = B.anc[+m[1]] === v ? '' : v;
          } else if ((m = /^bg(\d)$/.exec(slot))) {
            B.bg = B.bg || [];
            B.bg[+m[1]] = B.bg[+m[1]] === v ? '' : v;
          } else if ((m = /^lv(\d+)$/.exec(slot))) {
            B.lv = B.lv || {};
            var a = (B.lv[m[1]] = B.lv[m[1]] || []),
              i = a.indexOf(v);
            if (i >= 0) a.splice(i, 1);
            else if (a.length < 4) a.push(v);
          }
        });
      },
      pfL1: function (v) {
        chg(function (ch) {
          var a = (ch.skills.L1 = ch.skills.L1 || []),
            i = a.indexOf(v);
          if (i >= 0) a.splice(i, 1);
          else a.push(v);
        });
      },
      pfExtra: function (v) {
        chg(function (ch) {
          var a = (ch.skills.extra = ch.skills.extra || []),
            i = a.indexOf(v);
          if (i >= 0) a.splice(i, 1);
          else a.push(v);
        });
      },
      pfLoreAdd: function () {
        var i = document.getElementById('pf-newlore'),
          n = i && i.value.trim().replace(/\s+lore$/i, '');
        if (!n) return false;
        chg(function (ch) {
          (ch.skills.L1 = ch.skills.L1 || []).push('lore:' + n);
        });
      },
      pfPick: function (_, el) {
        var a = function (n) {
          return el.getAttribute('data-' + n);
        };
        U.pick = {
          k: a('k'),
          slot: a('slot'),
          entry: a('entry'),
          rank: a('rank') == null ? null : +a('rank'),
          trad: a('trad') || '',
          focus: !!a('focus'),
          key: a('key'),
          gi: a('gi') == null ? null : +a('gi'),
          which: a('which'),
          equip: a('equip'),
          type: a('type') || ''
        };
        if (U.pick.k === 'rune') U.pick.slot = +a('slot');
        U.q = '';
        U.f = {};
        U.open = '';
        var chx = cur(),
          cid = chx ? pickCurrent(chx, PF2.derive(chx)) : '';
        if (cid) {
          U.open = 'p:' + cid;
          U.scrollPick = true;
        }
        if (U.pick.k === 'feat') {
          var ch = cur(),
            d = PF2.derive(ch),
            s = (d.slots || []).filter(function (x) {
              return x.key === U.pick.slot;
            })[0];
          if (s && s.kind === 'cls') U.f.cat = '';
        }
        if (U.pick.k === 'spell' && U.pick.rank != null && U.pick.rank > 0 && U.pick.rank < 10) U.f.lv = '';
      },
      pfPickClose: function () {
        U.pick = null;
        U.open = '';
      },
      pfRuneRm: function (v, el) {
        chg(function (ch) {
          var g = ch.gear[+v];
          if (!g || !g.runes) return;
          g.runes.prop = (g.runes.prop || []).filter(function (_, j) {
            return j !== +el.getAttribute('data-s');
          });
        });
      },
      pfUnequip: function (v) {
        chg(function (ch) {
          var g = ch.gear[+v];
          if (g) g.worn = false;
        });
      },
      pfShieldHp: function (v) {
        chg(function (ch) {
          var T = trk(ch),
            d = PF2.derive(ch),
            sh = d.shield;
          if (!sh) return;
          var id = sh.g.uid || 'shield';
          T.shield = T.shield || {};
          var cur0 = T.shield[id] == null ? sh.hp : T.shield[id];
          T.shield[id] = Math.max(0, Math.min(sh.hp, cur0 + +v));
        });
      },
      pfFilt: function (v, el) {
        U.f = U.f || {};
        U.f[el.getAttribute('data-k')] = v;
      },
      pfItemType: function (v) {
        U.pick.type = v;
        U.f.lv = '';
      },
      pfOpenRow: function (v) {
        U.open = U.open === v ? '' : v;
      },
      pfChoose: function (v) {
        var P = U.pick;
        if (!P) return;
        chg(function (ch) {
          if (P.k === 'ancestry') {
            if (ch.ancestry !== v) {
              ch.ancestry = v;
              ch.heritage = '';
              ch.boosts.anc = [];
            }
          } else if (P.k === 'heritage') ch.heritage = v;
          else if (P.k === 'background') {
            if (ch.background !== v) {
              ch.background = v;
              ch.boosts.bg = [];
            }
          } else if (P.k === 'class') {
            if (ch.cls !== v) {
              ch.cls = v;
              var c = PF2.byId('classes', v);
              ch.key = c && c.key.length === 1 ? c.key[0] : '';
            }
          } else if (P.k === 'feat') ch.feats[P.slot] = v;
          else if (P.k === 'spell') {
            var b = ((ch.spells = ch.spells || {})[P.entry] = ch.spells[P.entry] || { known: {} }),
              s = PF2.byId('spells', v),
              r = P.focus ? 0 : P.entry === 'innate' ? (s.cat === 'cantrip' ? 0 : s.lv) : P.rank;
            b.known = b.known || {};
            var list = (b.known[r] = b.known[r] || []);
            if (list.indexOf(v) < 0) list.push(v);
          } else if (P.k === 'choice') {
            var d0 = PF2.derive(ch),
              o = d0.open.filter(function (x) {
                return x.key === P.key;
              })[0],
              ent =
                o &&
                choiceEntries(o).filter(function (x) {
                  return x.id === v;
                })[0];
            if (ent) {
              ch.choices = ch.choices || {};
              ch.choices[P.key] = ent.value;
            }
          } else if (P.k === 'rune') {
            var g = ch.gear[P.gi],
              re = PF2.byId('items', v);
            if (g && re) {
              g.runes = g.runes || {};
              var pr = (g.runes.prop = (g.runes.prop || []).slice());
              pr[P.slot] = re.n;
              g.runes.prop = pr.filter(Boolean);
            }
          } else if (P.k === 'item' && P.equip) {
            var ie = PF2.byId('items', v);
            if (P.equip !== 'weapon')
              ch.gear.forEach(function (g) {
                var e = PF2.byId('items', g.id);
                if (e && e.k === 'armor' && (P.equip === 'shield') === (e.cat === 'shield')) g.worn = false;
              });
            (ch.gear = ch.gear || []).push({ uid: PF2.uid(), id: v, q: 1, worn: true, runes: {} });
            U.msg = (P.equip === 'weapon' ? 'Added ' : 'Now using ') + (ie ? ie.n : '') + '.';
          } else if (P.k === 'item') {
            (ch.gear = ch.gear || []).push({ uid: PF2.uid(), id: v, q: 1, worn: false, runes: {} });
          }
        });
        if (P.k === 'spell' || (P.k === 'item' && !P.equip)) {
          U.msg = 'Added ' + ((P.k === 'spell' ? PF2.byId('spells', v) : PF2.byId('items', v)) || { n: '' }).n + '.';
          U.open = '';
          return;
        }
        U.pick = null;
        U.open = '';
      },
      pfFeatRm: function (v) {
        chg(function (ch) {
          delete ch.feats[v];
          Object.keys(ch.choices || {}).forEach(function (k) {
            if (k.indexOf('feat:' + v + '|') === 0 || k.indexOf('feat:' + v + '>') === 0) delete ch.choices[k];
          });
        });
      },
      pfSpellRm: function (v, el) {
        chg(function (ch) {
          var b = (ch.spells || {})[el.getAttribute('data-e')],
            r = el.getAttribute('data-r');
          if (b && b.known && b.known[r])
            b.known[r] = b.known[r].filter(function (x) {
              return x !== v;
            });
        });
      },
      // a lit dot is a slot still free: tap one to spend a slot, tap a dark one to get it back
      pfSlot: function (_, el) {
        chg(function (ch) {
          var T = trk(ch),
            e = el.getAttribute('data-v'),
            r = el.getAttribute('data-r'),
            i = +el.getAttribute('data-i'),
            c = PF2.derive(ch).casters.filter(function (x) {
              return x.id === e;
            })[0],
            n = c ? c.slots[r] : 0;
          T.slots = T.slots || {};
          var u = (T.slots[e] = T.slots[e] || {});
          u[r] = Math.max(0, Math.min(n, (u[r] || 0) + (i <= n - (u[r] || 0) ? 1 : -1)));
        });
      },
      pfSlotsReset: function (v) {
        chg(function (ch) {
          var T = trk(ch);
          if (T.slots) delete T.slots[v];
        });
      },
      pfHp: function (v) {
        chg(function (ch) {
          var T = trk(ch),
            d = PF2.derive(ch),
            hp = T.hp == null ? d.hp.max : T.hp,
            n = +v;
          if (n < 0 && T.temp > 0) {
            var s = Math.min(T.temp, -n);
            T.temp -= s;
            n += s;
          }
          hp = Math.max(0, Math.min(d.hp.max, hp + n));
          T.hp = hp >= d.hp.max ? null : hp;
        });
      },
      pfHero: function (v) {
        chg(function (ch) {
          var T = trk(ch);
          T.hero = (T.hero || 0) >= +v ? +v - 1 : +v;
        });
      },
      pfFocus: function (v) {
        chg(function (ch) {
          var T = trk(ch),
            d = PF2.derive(ch),
            f = T.focus == null ? d.focusMax : T.focus;
          T.focus = f >= +v ? +v - 1 : +v;
        });
      },
      pfTrk: function (_, el) {
        chg(function (ch) {
          var T = trk(ch),
            k = el.getAttribute('data-k');
          T[k] = Math.max(0, Math.min(4, (T[k] || 0) + +el.getAttribute('data-d')));
        });
      },
      pfRest: function () {
        chg(function (ch) {
          var T = trk(ch);
          T.hp = null;
          T.temp = 0;
          T.focus = null;
          T.slots = {};
          T.dying = 0;
          T.wounded = 0;
          if (T.conds) {
            delete T.conds.Fatigued;
          }
        });
        U.msg = 'Rested: hit points, spell slots and focus points are back.';
      },
      pfCond: function (v, el) {
        chg(function (ch) {
          var T = trk(ch);
          T.conds[v] = Math.max(1, Math.min(9, (T.conds[v] || 1) + +el.getAttribute('data-d')));
        });
      },
      pfCondRm: function (v) {
        chg(function (ch) {
          delete trk(ch).conds[v];
        });
      },
      pfRoll: function (v, el) {
        if (root.Dice3D) root.Dice3D.roll({ d20: 1 }, +v, el.getAttribute('data-l'));
        return false;
      },
      pfDmg: function (v) {
        var ch = cur(),
          d = PF2.derive(ch),
          s = d.strikes[+v];
        if (!s || !root.Dice3D) return false;
        var counts = {};
        counts[s.die] = s.dice;
        var add = function (txt) {
          var m = /^(\d+)(d\d+)/.exec(txt);
          if (m) counts[m[2]] = (counts[m[2]] || 0) + +m[1];
        };
        s.extra.forEach(add);
        if ((U.cdmg || {})[v]) s.cond.forEach(add);
        root.Dice3D.roll(counts, s.bonus);
        return false;
      },
      pfQty: function (v, el) {
        chg(function (ch) {
          var g = ch.gear[+v];
          if (!g) return;
          g.q = (g.q || 1) + +el.getAttribute('data-d');
          if (g.q < 1) ch.gear.splice(+v, 1);
        });
      },
      pfGearRm: function (v) {
        chg(function (ch) {
          ch.gear.splice(+v, 1);
        });
        U.open = '';
      },
      pfCustomItem: function () {
        U.customItem = !U.customItem;
      },
      pfCustomAdd: function () {
        var i = document.getElementById('pf-custom'),
          n = i && i.value.trim();
        if (!n) return false;
        chg(function (ch) {
          ch.gear.push({ uid: PF2.uid(), id: '', custom: true, name: n, q: 1 });
        });
        U.customItem = false;
      },
      pfLangAdd: function () {
        var i = document.getElementById('pf-lang'),
          n = i && i.value.trim();
        if (!n) return false;
        chg(function (ch) {
          (ch.langs = ch.langs || []).push(n);
        });
      },
      pfLangRm: function (v) {
        chg(function (ch) {
          ch.langs.splice(+v, 1);
        });
      },
      pfActF: function (v) {
        U.actF = v;
      },
      pfDup: function () {
        chg(function (ch) {
          var c = JSON.parse(JSON.stringify(ch));
          c.id = PF2.uid();
          c.name = (c.name || 'Character') + ' (copy)';
          S().chars.push(c);
          S().cur = c.id;
        });
      },
      pfDelAsk: function () {
        U.delAsk = true;
      },
      pfDelNo: function () {
        U.delAsk = false;
      },
      pfDel: function () {
        var s = S(),
          id = s.cur;
        s.chars = s.chars.filter(function (c) {
          return c.id !== id;
        });
        s.cur = s.chars[0] ? s.chars[0].id : '';
        U.view = 'list';
        U.delAsk = false;
      },
      pfPrint: function () {
        root.print();
        return false;
      },
      pfPicRm: function () {
        chg(function (ch) {
          delete ch.picture;
          delete ch.picFit;
        });
      },
      pfPicFit: function () {
        chg(function (ch) {
          ch.picFit = ch.picFit === 'contain' ? '' : 'contain';
        });
      },
      pfExport: function () {
        var ch = cur();
        if (!ch) return false;
        var a = document.createElement('a');
        a.href = URL.createObjectURL(
          new Blob([JSON.stringify({ app: 'character-forge', game: 'pf2', char: ch }, null, 1)], {
            type: 'application/json'
          })
        );
        a.download = (ch.name || 'character').replace(/[^\w-]+/g, '_') + '.pf2.json';
        a.click();
        return false;
      },
      pfRCat: function (v) {
        U.rules.cat = v;
        U.rules.open = '';
        U.rules.q = '';
        root.scrollTo(0, 0);
      },
      pfROpen: function (v) {
        U.rules.open = U.rules.open === v ? '' : v;
      }
    };
    Object.keys(ENC.actions || {}).forEach(function (k) {
      actions[k] = ENC.actions[k];
    });

    function onInput(t) {
      var a = function (n) {
        return t.getAttribute(n);
      };
      if (a('data-pfq')) {
        U.q = t.value;
        return 'render';
      }
      if (a('data-pfrq')) {
        U.rules.q = t.value;
        return 'render';
      }
      if (a('data-pfactq')) {
        U.actQ = t.value;
        return 'render';
      }
      if (a('data-pfnq')) {
        U.noteQ = t.value;
        return 'render';
      }
      var ch = cur();
      if (a('data-pff') && ch) {
        var k = a('data-pff');
        if (k === 'bgLore') ch.skills.bgLore = t.value;
        else ch[k] = k === 'xp' ? +t.value || 0 : t.value;
        return 'save';
      }
      if (a('data-pfmoney') && ch) {
        ch.money = ch.money || {};
        ch.money[a('data-pfmoney')] = Math.max(0, +t.value || 0);
        return 'save';
      }
      if (a('data-pftrk') && ch) {
        trk(ch)[a('data-pftrk')] = Math.max(0, +t.value || 0);
        return 'save';
      }
      if (a('data-pfgname') && ch) {
        ch.gear[+a('data-pfgname')].name = t.value;
        return 'save';
      }
      if (a('data-pfprop') && ch) {
        var g = ch.gear[+a('data-pfprop')];
        g.runes = g.runes || {};
        g.runes.prop = t.value
          .split(',')
          .map(function (x) {
            return x.trim();
          })
          .filter(Boolean);
        return 'save';
      }
      return ENC.onInput ? ENC.onInput(t) : null;
    }
    function onChange(t) {
      var a = function (n) {
          return t.getAttribute(n);
        },
        ch = cur();
      if (t.id === 'pf-imp-file') {
        var f = t.files && t.files[0];
        if (f)
          f.text().then(function (x) {
            doImport(x);
          });
        return null;
      }
      if (!ch) return ENC.onChange ? ENC.onChange(t) : null;
      if (a('data-pfpic')) {
        var pf = t.files && t.files[0];
        U.picErr = '';
        loadPic(pf, function (data) {
          var c2 = cur();
          if (data && c2) {
            c2.picture = data;
          } else U.picErr = 'That file couldn’t be read as a picture.';
          render();
        });
        return null;
      }
      if (a('data-pfchoice') != null) {
        ch.choices = ch.choices || {};
        if (t.value) ch.choices[a('data-pfchoice')] = t.value;
        else delete ch.choices[a('data-pfchoice')];
        return 'render';
      }
      if (a('data-pfinc')) {
        ch.skills.inc = ch.skills.inc || {};
        if (t.value) ch.skills.inc[a('data-pfinc')] = t.value;
        else delete ch.skills.inc[a('data-pfinc')];
        return 'render';
      }
      if (a('data-pfchk') === 'ancAlt') {
        ch.boosts.ancAlt = t.checked;
        ch.boosts.anc = [];
        return 'render';
      }
      if (a('data-pfworn') != null) {
        ch.gear[+a('data-pfworn')].worn = t.checked;
        return 'render';
      }
      if (a('data-pfrune') != null) {
        var g = ch.gear[+a('data-pfrune')];
        g.runes = g.runes || {};
        g.runes[a('data-f')] = a('data-f') === 'pot' ? +t.value : t.value;
        return 'render';
      }
      if (a('data-pfcondadd') && t.value) {
        trk(ch).conds[t.value] = 1;
        return 'render';
      }
      if (a('data-pfraise')) {
        trk(ch).raised = t.checked;
        return 'render';
      }
      if (a('data-pfcondmg') != null) {
        U.cdmg = U.cdmg || {};
        U.cdmg[a('data-pfcondmg')] = t.checked;
        return 'render';
      }
      if (a('data-pff') || a('data-pfmoney') || a('data-pfgname') || a('data-pfprop')) return 'render';
      return ENC.onChange ? ENC.onChange(t) : null;
    }
    function title(section) {
      var ch = cur();
      return section === 'pf2-chars' && U.view === 'char' && ch
        ? (ch.name || 'Character') + ' — PF2'
        : {
            'pf2-home': 'Pathfinder 2e',
            'pf2-chars': 'PF2 characters',
            'pf2-rules': 'PF2 rules',
            'pf2-party': 'PF2 party',
            'pf2-mon': 'PF2 monsters',
            'pf2-loot': 'PF2 treasures',
            'pf2-enc': 'PF2 encounters'
          }[section] || 'Pathfinder 2e';
    }

    // What the helper sees, and the changes it may propose
    function context(section) {
      var ch = cur();
      if (section !== 'pf2-chars' || U.view !== 'char' || !ch || !PF2.index())
        return {
          where: 'Pathfinder 2e',
          subject: 'Pathfinder 2e',
          text: 'Game: Pathfinder 2nd edition, pre-Remaster rules. Page: ' + title(section) + '.',
          chips: [
            'Explain the three-action economy',
            'Help me come up with a character idea',
            'How do proficiency ranks work?'
          ]
        };
      var d = PF2.derive(ch);
      var L = [
        'Game: Pathfinder 2nd edition (pre-Remaster rules: alignment, ability scores, Core Rulebook spell names). Page: character, “' +
          U.tab +
          '” tab.',
        'Character: ' +
          (ch.name || 'unnamed') +
          ', level ' +
          d.level +
          ' ' +
          [d.anc && d.anc.n, d.her && '(' + d.her.n + ')', d.bg && d.bg.n + ' background', d.cls && d.cls.n]
            .filter(Boolean)
            .join(' ') +
          '.',
        'Ability scores: ' +
          PF2.AB.map(function (a) {
            return a.toUpperCase() + ' ' + d.scores[a];
          }).join(', ') +
          '. HP ' +
          d.hp.max +
          ', AC ' +
          d.ac.v +
          ', Fort ' +
          fmt(d.saves.fortitude.v) +
          ', Ref ' +
          fmt(d.saves.reflex.v) +
          ', Will ' +
          fmt(d.saves.will.v) +
          ', Perception ' +
          fmt(d.perception.v) +
          '.',
        'Skills: ' +
          PF2.SKILLS.filter(function (k) {
            return d.rank[k];
          })
            .map(function (k) {
              return PF2.SK[k][0] + ' ' + PF2.RANK[d.rank[k]].toLowerCase();
            })
            .join(', ') +
          '.',
        'Feats: ' +
          Object.keys(ch.feats || {})
            .map(function (k) {
              var e = PF2.byId('feats', ch.feats[k]);
              return k + '=' + (e ? e.n : '?');
            })
            .join(', ') +
          '.',
        'Empty feat slots: ' +
          ((d.slots || [])
            .filter(function (s) {
              return !ch.feats[s.key];
            })
            .map(function (s) {
              return '[' + s.key + '] ' + slotLabel(s, d);
            })
            .join(', ') || 'none') +
          '.',
        d.open.filter(function (o) {
          return o.value === '';
        }).length
          ? 'Choices still open: ' +
            d.open
              .filter(function (o) {
                return o.value === '';
              })
              .map(function (o) {
                return (
                  '[' +
                  o.key +
                  '] ' +
                  o.label +
                  ' (' +
                  o.item +
                  '; options: ' +
                  o.options
                    .slice(0, 25)
                    .map(function (x) {
                      return x.label;
                    })
                    .join(', ') +
                  ')'
                );
              })
              .join(' | ')
          : '',
        d.warnings.length ? 'To finish: ' + d.warnings.slice(0, 15).join(' | ') : '',
        'Changes you can propose (one per line, exact names):\n[[ancestry: Elf]] [[heritage: Woodland Elf]] [[background: Acolyte]] [[class: Wizard]]\n[[feat: anc1 | Feat name]] (slot key in brackets above)\n[[choose: choice-key | Option name]]\n[[level: 3]]'
      ];
      var chips = [];
      if (!ch.cls) chips.push('Help me make a character');
      else if (d.warnings.length) chips.push('What do I still need to choose?');
      chips.push('Which feat should I take next?', 'Is my character built well?');
      return {
        where: (ch.name || 'Character') + ' · ' + U.tab,
        subject: 'your character',
        text: L.filter(Boolean).join('\n'),
        chips: chips.slice(0, 4),
        apply: apply
      };
    }
    function apply(verb, a) {
      var ch = cur();
      if (!ch) throw new Error('Open the character first');
      var nm = String(a[0] || '').trim(),
        e;
      if (verb === 'ancestry') {
        e = PF2.byName('ancestries', nm);
        if (!e) throw new Error('No ancestry “' + nm + '”');
        ch.ancestry = e.id;
        ch.heritage = '';
        return 'Ancestry: ' + e.n;
      }
      if (verb === 'heritage') {
        e = PF2.byName('heritages', nm);
        if (!e) throw new Error('No heritage “' + nm + '”');
        ch.heritage = e.id;
        return 'Heritage: ' + e.n;
      }
      if (verb === 'background') {
        e = PF2.byName('backgrounds', nm);
        if (!e) throw new Error('No background “' + nm + '”');
        ch.background = e.id;
        ch.boosts.bg = [];
        return 'Background: ' + e.n;
      }
      if (verb === 'class') {
        e = PF2.byName('classes', nm);
        if (!e) throw new Error('No class “' + nm + '”');
        ch.cls = e.id;
        ch.key = e.key.length === 1 ? e.key[0] : '';
        return 'Class: ' + e.n;
      }
      if (verb === 'level') {
        ch.level = Math.max(1, Math.min(20, Math.round(+nm) || 1));
        return 'Level ' + ch.level;
      }
      if (verb === 'feat') {
        var slot = nm,
          d = PF2.derive(ch),
          s = (d.slots || []).filter(function (x) {
            return x.key === slot;
          })[0];
        if (!s) throw new Error('No feat slot “' + slot + '”');
        e = PF2.byName('feats', a[1]);
        if (!e) throw new Error('No feat “' + a[1] + '”');
        if (
          !PF2.featsFor(s, ch, d).some(function (f) {
            return f.id === e.id;
          })
        )
          throw new Error(e.n + ' can’t go in ' + slotLabel(s, d));
        ch.feats[slot] = e.id;
        return slotLabel(s, d) + ': ' + e.n;
      }
      if (verb === 'choose') {
        var d2 = PF2.derive(ch),
          o = d2.open.filter(function (x) {
            return x.key === nm || x.label.toLowerCase() === nm.toLowerCase();
          })[0];
        if (!o) throw new Error('That choice isn’t open');
        var op = o.options.filter(function (x) {
          return (
            x.label.toLowerCase() ===
            String(a[1] || '')
              .trim()
              .toLowerCase()
          );
        })[0];
        if (!op) throw new Error('“' + a[1] + '” isn’t an option');
        ch.choices[o.key] = op.value;
        return o.item + ': ' + op.label;
      }
      throw new Error('Unknown change “' + verb + '”');
    }
    function after() {
      if (U.scrollPick) {
        U.scrollPick = false;
        var el = document.querySelector('.pf-plist .pf-prow.open');
        if (el && el.scrollIntoView) el.scrollIntoView({ block: 'start' });
      }
      if (U.scrollTo) {
        var t = document.getElementById(U.scrollTo);
        U.scrollTo = '';
        if (t && t.scrollIntoView) t.scrollIntoView({ block: 'center' });
      }
    }
    function navPart() {
      return { v: U.view, t: U.tab, p: U.pick ? JSON.stringify(U.pick) : '' };
    }
    function restoreNav(p) {
      if (!p) return;
      U.view = p.v || 'list';
      U.tab = p.t || 'build';
      try {
        U.pick = p.p ? JSON.parse(p.p) : null;
      } catch (e) {
        U.pick = null;
      }
    }
    return {
      html: html,
      book: book,
      actions: actions,
      onInput: onInput,
      onChange: onChange,
      title: title,
      context: context,
      navPart: navPart,
      restoreNav: restoreNav,
      after: after
    };
  };
})(typeof window !== 'undefined' ? window : globalThis);
