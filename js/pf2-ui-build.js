// Pathfinder 2e screens: the character list, importing, and building level by level (the boosts, the picker, the choices).
// Part of pf2-ui.js: it runs inside PF2UI; K holds the names the files share.
(function (root) {
  'use strict';
  (root.PF2UIParts = root.PF2UIParts || {}).build = function (K) {
    var GLY = K.GLY,
      PF2 = K.PF2,
      S = K.S,
      SIZE = K.SIZE,
      U = K.U,
      btn = K.btn,
      esc = K.esc,
      fmt = K.fmt,
      gl = K.gl,
      md = K.md,
      picHtml = K.picHtml,
      rar = K.rar,
      render = K.render,
      traits = K.traits;

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
          sheet: K.sheetTab,
          defense: K.defenseTab,
          offense: K.offenseTab,
          strikes: K.offenseTab,
          skills: K.skillsTab,
          spells: K.spellsTab,
          gear: K.gearTab,
          feats: K.featsTab,
          actions: K.actionsTab,
          notes: K.notesTab,
          play: K.playTab
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
        (PF2.SKILLS.reduce(function (out, k) {
          if (base[k]) out.push(PF2.SK[k][0]);
          return out;
        }, []).join(', ') || 'none') +
        '.</p>' +
        '<div class="pills">' +
        PF2.SKILLS.reduce(function (out, k) {
          if (!!base[k]) return out;
          var on = L1.indexOf(k) >= 0;
          out.push(btn('pfL1', PF2.SK[k][0], { v: k }, 'pill' + (on ? ' on' : '')));
          return out;
        }, []).join('') +
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
        PF2.SKILLS.reduce(function (out, k) {
          if ((!base[k] && L1.indexOf(k) < 0) || extra.indexOf(k) >= 0)
            out.push(btn('pfExtra', PF2.SK[k][0], { v: k }, 'pill small' + (extra.indexOf(k) >= 0 ? ' on' : '')));
          return out;
        }, []).join('') +
        '</div>';
      return h + '</details>';
    }
    // A "choose one" inside a feature or feat (racket, muse, bloodline, Versatile Heritage's feat…): opens the picker, where each option can be read first.
    function choicesFor(d, filter) {
      return d.open
        .reduce(function (out, o) {
          if (!filter(o)) return out;
          var sel = o.options.filter(function (op) {
            return String(op.value) === String(o.value);
          })[0];
          out.push(
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
          return out;
        }, [])
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
    K.ABS = ABS;
    K.charHtml = charHtml;
    K.choiceEntries = choiceEntries;
    K.doImport = doImport;
    K.entryDetail = entryDetail;
    K.itemLine = itemLine;
    K.listHtml = listHtml;
    K.pickCurrent = pickCurrent;
    K.slotLabel = slotLabel;
    K.spellLine = spellLine;
  };
})(typeof window !== 'undefined' ? window : globalThis);
