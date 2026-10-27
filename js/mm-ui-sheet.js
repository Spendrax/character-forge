// Mutants & Masterminds hero pages: the sheet and the Session page (hero points, damage, conditions, the GM's table).
// Part of mm.js: it runs inside MMUI; K holds the names the files share.
(function (root) {
  'use strict';
  (root.MMUIParts = root.MMUIParts || {}).sheet = function (K) {
    var ADV = K.ADV,
      DEF = K.DEF,
      M = K.M,
      U = K.U,
      api = K.api,
      btn = K.btn,
      esc = K.esc,
      fmt = K.fmt;

    function sheet(h, d) {
      var sk = Object.keys(d.skills)
        .reduce(function (out, s) {
          if (d.skills[s].r) out.push(s + ' ' + d.skills[s].r + ' (' + fmt(d.skills[s].total) + ')');
          return out;
        }, [])
        .concat(
          (h.spec || []).reduce(function (out, x) {
            if (+x.r) out.push(x.s + ': ' + (x.n || '?') + ' ' + x.r + ' (' + fmt(x._total) + ')');
            return out;
          }, [])
        );
      return (
        '<div class="toolbar noprint">' +
        btn('mmPrint', 'Print or save as PDF', {}, 'btn primary') +
        '</div><article class="sheet mm-sheet"><div class="sheet-head"><div><h2 style="margin:0">' +
        esc(h.name || 'Unnamed hero') +
        '</h2><span class="muted">' +
        esc([h.identity, h.group].filter(Boolean).join(' · ')) +
        '</span></div>' +
        '<div><b>PL ' +
        d.pl +
        '</b> · ' +
        d.pp.total +
        '/' +
        d.pp.budget +
        ' points' +
        (h.player ? '<br><span class="small muted">Player: ' + esc(h.player) + '</span>' : '') +
        '</div></div>' +
        '<h3>Abilities</h3><div class="mm-abgrid">' +
        M.abilities
          .map(function (a) {
            return '<div><small>' + a[0] + '</small><b>' + fmt(d.ab[a[0]]) + '</b></div>';
          })
          .join('') +
        '</div>' +
        '<h3>Defenses</h3><div class="mm-abgrid">' +
        DEF.map(function (x) {
          return '<div><small>' + x[1] + '</small><b>' + fmt(d.def[x[0]]) + '</b></div>';
        }).join('') +
        '<div><small>Initiative</small><b>' +
        fmt(d.init) +
        '</b></div></div>' +
        '<h3>Offense</h3><ul class="lines">' +
        d.attacks
          .map(function (a) {
            return (
              '<li><b>' +
              esc(a.n) +
              '</b> — ' +
              esc(a.range) +
              ', ' +
              (a.bonus == null ? 'no attack roll' : 'attack ' + fmt(a.bonus)) +
              ', ' +
              esc(a.kind) +
              ' ' +
              a.rank +
              (a.resist ? ' (DC ' + a.dc + ' ' + esc(a.resist) + ')' : '') +
              '</li>'
            );
          })
          .join('') +
        '</ul>' +
        '<h3>Powers</h3>' +
        ((h.powers || []).length
          ? (h.powers || [])
              .map(function (p) {
                var m = (p.mods || []).map(function (x) {
                  return x.n + (Math.max(1, +x.r || 1) > 1 ? ' ' + x.r : '') + (x.note ? ' (' + x.note + ')' : '');
                });
                return (
                  '<div class="feature"><b>' +
                  esc(p.name || p.effect) +
                  ':</b> ' +
                  esc(p.effect) +
                  ' ' +
                  p.rank +
                  (p.str && p.effect === 'Damage' ? ' (Strength-based)' : '') +
                  (p.target ? ' (' + esc(p.target.split(':')[1]) + ')' : '') +
                  (m.length ? ', ' + esc(m.join(', ')) : '') +
                  ' <span class="lv">' +
                  p._cost +
                  ' pts</span>' +
                  (p.desc ? '<div>' + esc(p.desc) + '</div>' : '') +
                  '</div>'
                );
              })
              .join('')
          : '<p class="muted">None.</p>') +
        '<h3>Advantages</h3><p>' +
        ((h.adv || [])
          .map(function (a) {
            var def = ADV[a.n];
            return esc(a.n + (def && def[2] && (+a.r || 1) > 1 ? ' ' + a.r : '') + (a.note ? ' (' + a.note + ')' : ''));
          })
          .join(', ') || '—') +
        '</p>' +
        '<h3>Skills</h3><p>' +
        (esc(sk.join(', ')) || '—') +
        '</p>' +
        '<h3>Complications</h3>' +
        ((h.comp || [])
          .reduce(function (out, c) {
            if (c.t) out.push('<p><b>' + esc(c.k) + ':</b> ' + esc(c.t) + '</p>');
            return out;
          }, [])
          .join('') || '<p>—</p>') +
        (d.warnings.length
          ? '<h3>To check</h3><ul>' +
            d.warnings
              .map(function (w) {
                return '<li>' + esc(w) + '</li>';
              })
              .join('') +
            '</ul>'
          : '') +
        (h.notes
          ? '<h3>Notes</h3><p style="' +
            (root.NoteStyle ? root.NoteStyle.css(h.noteStyle) : '') +
            '">' +
            esc(h.notes).replace(/\n/g, '<br>') +
            '</p>'
          : '') +
        '</article>'
      );
    }

    // ---------- session: hero points, the damage track, conditions ----------
    var TRACK = ['', 'Bruised', 'Dazed', 'Staggered', 'Incapacitated'];
    function play(h, d) {
      var T = (h.track = h.track || {}),
        hp = T.hp == null ? 1 : +T.hp,
        bruise = +T.bruise || 0,
        on = T.conds || {};
      var tough = d.def.tough - bruise;
      var who = {
        key: h.id,
        name: h.name,
        init: d.init,
        bonus: function (a) {
          return a.kind === 'def'
            ? d.def[a.key] - (a.key === 'tough' ? bruise : 0)
            : a.kind === 'skill'
              ? (d.skills[a.key] || {}).total || 0
              : a.kind === 'ab'
                ? d.ab[a.key] || 0
                : 0;
        },
        take: function (g) {
          var n = (g.items || []).slice(0, 20).reduce(function (out, i) {
            if (i && i.n)
              out.push('- ' + String(i.n).slice(0, 80) + (i.note ? ': ' + String(i.note).slice(0, 200) : ''));
            return out;
          }, []);
          if (n.length) h.notes = (h.notes ? h.notes + '\n\n' : '') + 'From the GM:\n' + n.join('\n');
        },
        status: function () {
          return {
            hp: 0,
            max: 0,
            ac: 0,
            conds: Object.keys(on).concat(T.dmg ? [TRACK[T.dmg]] : []),
            txt:
              'Toughness ' +
              fmt(tough) +
              (bruise ? ' (' + bruise + ' bruise' + (bruise > 1 ? 's' : '') + ')' : '') +
              ' · ' +
              hp +
              ' hero point' +
              (hp === 1 ? '' : 's'),
            bon: (function () {
              var b = {};
              DEF.forEach(function (x) {
                b[x[1]] = d.def[x[0]] - (x[0] === 'tough' ? bruise : 0);
              });
              Object.keys(d.skills).forEach(function (k) {
                b[k] = d.skills[k].total;
              });
              return b;
            })()
          };
        },
        gm: 'GM',
        // what the GM sends: returns what to tell the player
        effect: function (f) {
          if (f.k === 'dmg') {
            U.dmgRank = Math.abs(f.n);
            return { msg: 'You’re hit: damage rank ' + Math.abs(f.n) + '. Make the Toughness check below.' };
          }
          if (f.k === 'heal') {
            T.dmg = 0;
            T.bruise = 0;
            return { msg: 'You recover: damage and bruises are gone.' };
          }
          if (f.k === 'cond') {
            T.conds = T.conds || {};
            if (f.on) T.conds[f.c] = 1;
            else delete T.conds[f.c];
            return { msg: (f.on ? 'You are now ' : 'No longer ') + f.c.toLowerCase() + '.' };
          }
          if (f.k === 'insp') {
            T.hp = Math.min(20, hp + 1);
            return { msg: 'The GM gives you a hero point!' };
          }
          if (f.k === 'xp') {
            h.extra = (+h.extra || 0) + f.n;
            return {
              msg:
                'You earn ' +
                f.n +
                ' power point' +
                (f.n === 1 ? '' : 's') +
                ': spend ' +
                (f.n === 1 ? 'it' : 'them') +
                ' on the hero’s traits.'
            };
          }
          return null;
        },
        notes: function () {
          return h.notes ? [{ id: 'notes', title: (h.name || 'Hero') + ' notes', text: h.notes }] : [];
        },
        addNote: function (title, text) {
          h.notes = (h.notes ? h.notes + '\n\n' : '') + String(title || 'From the table') + ':\n' + String(text || '');
        },
        style: h.noteStyle,
        // the whole hero for the GM
        sheet: function () {
          return { game: 'mm', data: JSON.parse(JSON.stringify(h)) };
        }
      };
      var out =
        '<h2>Session</h2>' +
        (api.tp ? api.tp.html(who) : '') +
        '<div class="panel"><h3>Hero points</h3><div class="toolbar">' +
        btn('mmHp', '−', { v: -1 }, 'btn') +
        '<b class="mm-hpts">' +
        hp +
        '</b>' +
        btn('mmHp', '+', { v: 1 }, 'btn') +
        '<span class="small muted">Spend one to reroll (a roll under 11 counts as 10 + the roll), to edit a scene, to recover, or for an instant counter. You get one when a complication causes trouble; back to 1 each adventure.</span></div></div>';
      out +=
        '<div class="panel"><h3>Damage</h3><p>Toughness <b>' +
        fmt(tough) +
        '</b>' +
        (bruise
          ? ' <span class="muted">(' + d.def.tough + ' − ' + bruise + ' bruise' + (bruise > 1 ? 's' : '') + ')</span>'
          : '') +
        (T.dmg ? ' · <b class="bad">' + TRACK[T.dmg] + '</b>' : '') +
        '</p>' +
        '<div class="toolbar"><label class="small">Damage rank <input type="number" min="1" max="40" id="mm-dmgrank" data-mmplay="rank" value="' +
        esc(U.dmgRank || '') +
        '" style="width:4.5rem"></label>' +
        btn('mmHit', '🎲 Toughness check', {}, 'btn primary') +
        btn('mmRecover', 'Recover a step', {}, 'btn small') +
        btn('mmFresh', 'All healed', {}, 'btn small') +
        '</div>' +
        (U.hitMsg ? '<p class="small rest-msg">' + esc(U.hitMsg) + '</p>' : '') +
        '<p class="small muted">The check is against DC 15 + the damage rank: each 5 points short is one more step (bruise, dazed, staggered, incapacitated).</p></div>';
      out +=
        '<div class="panel"><h3>Conditions</h3><div class="pills">' +
        M.conditions
          .map(function (c) {
            return btn('mmCond', c[0], { v: c[0] }, 'pill small' + (on[c[0]] ? ' on' : ''));
          })
          .join('') +
        '</div>' +
        (Object.keys(on).length
          ? '<ul class="cond-list">' +
            M.conditions
              .reduce(function (out, c) {
                if (on[c[0]]) out.push('<li><b>' + esc(c[0]) + ':</b> ' + esc(c[2]) + '</li>');
                return out;
              }, [])
              .join('') +
            '</ul>'
          : '<p class="small muted">Tap a condition when it happens to the hero to see what it does.</p>') +
        '</div>';
      out +=
        '<div class="panel"><h3>Attacks and defenses</h3><ul class="lines">' +
        d.attacks
          .map(function (a) {
            return (
              '<li><b>' +
              esc(a.n) +
              '</b> — ' +
              esc(a.range) +
              ', ' +
              (a.bonus == null ? 'no attack roll' : 'attack ' + fmt(a.bonus)) +
              ', ' +
              esc(a.kind) +
              ' ' +
              a.rank +
              (a.resist ? ' (DC ' + a.dc + ' ' + esc(a.resist) + ')' : '') +
              '</li>'
            );
          })
          .join('') +
        '</ul>' +
        '<p>' +
        DEF.map(function (x) {
          return x[1] + ' <b>' + fmt(x[0] === 'tough' ? tough : d.def[x[0]]) + '</b>';
        }).join(' · ') +
        ' · Initiative <b>' +
        fmt(d.init) +
        '</b></p></div>';
      return out;
    }
    K.TRACK = TRACK;
    K.play = play;
    K.sheet = sheet;
  };
})(typeof window !== 'undefined' ? window : globalThis);
