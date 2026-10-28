// Pathfinder 2e DM tools: planning an encounter, the creature picker, and running the fight.
// Part of pf2-enc.js: it runs inside PF2Enc; K holds the names the files share.
(function (root) {
  'use strict';
  (root.PF2EncParts = root.PF2EncParts || {}).enc = function (K) {
    var G = K.G,
      E = K.E,
      adjLv = K.adjLv,
      api = K.api,
      btn = K.btn,
      enc = K.enc,
      esc = K.esc,
      hpAdj = K.hpAdj,
      line = K.line,
      mon = K.mon,
      parties = K.parties,
      partyById = K.partyById,
      partyLevel = K.partyLevel,
      rate = K.rate,
      xpFor = K.xpFor;

    function html() {
      if (!api.need(['core', 'bestiary'])) return api.waitHtml('Encounters');
      var e = enc(),
        p = partyById(e.party);
      if (e.run) return '<main class="mon-main"><h2>Encounter</h2>' + runHtml() + '</main>';
      var lvl = p && p.m.length ? partyLevel(p) : +e.lvl || 1,
        n = p && p.m.length ? p.m.length : +e.n || 4;
      var mons = e.mons
        .map(function (x) {
          var m = mon(x.id);
          return m ? { m: m, x: x, lv: adjLv(m, x.adj), count: x.count } : null;
        })
        .filter(Boolean);
      var r = rate(lvl, n, mons);
      var meter =
        '<div class="enc-diff"><div class="enc-meter">' +
        r.budget
          .map(function (t, i) {
            return (
              '<span class="' +
              (r.idx >= i ? 'on lv' + Math.min(3, Math.max(0, i - 1)) : '') +
              '">' +
              t.label +
              '<small>' +
              t.xp +
              '</small></span>'
            );
          })
          .join('') +
        '</div>' +
        '<p class="enc-verdict lv' +
        Math.min(3, Math.max(0, r.idx - 1)) +
        '"><b>' +
        r.threat +
        '</b> for ' +
        n +
        ' character' +
        (n === 1 ? '' : 's') +
        ' of level ' +
        lvl +
        ' · <b>' +
        r.xp +
        ' XP</b></p></div>';
      var warn = mons.reduce(function (out, x) {
        if (x.lv - lvl > 4 || (x.lv - lvl > 2 && mons.length === 1 && false))
          out.push(
            x.m.n +
              ' is level ' +
              x.lv +
              ': more than 4 levels above the party, it can kill a character in one or two turns.'
          );
        return out;
      }, []);
      var rows = mons
        .map(function (x, i) {
          var k = 'e:' + x.x.id + i,
            open = E.open === k;
          return (
            '<div class="enc-row pf-erow"><span class="enc-count">' +
            btn('pfeCount', '−', { v: i, d: -1 }, 'btn tiny') +
            '<b>' +
            x.count +
            '</b>' +
            btn('pfeCount', '+', { v: i, d: 1 }, 'btn tiny') +
            '</span>' +
            '<button type="button" class="linkbtn enc-name" data-act="pfeOpen" data-v="' +
            esc(k) +
            '">' +
            esc((x.x.adj ? (x.x.adj === 'elite' ? 'Elite ' : 'Weak ') : '') + x.m.n) +
            '</button><span class="small muted">Lv ' +
            x.lv +
            ' · ' +
            xpFor(x.lv - lvl) * x.count +
            ' XP</span>' +
            '<select data-pfeadj="' +
            i +
            '" aria-label="Elite or weak"><option value="">Normal</option><option value="elite"' +
            (x.x.adj === 'elite' ? ' selected' : '') +
            '>Elite</option><option value="weak"' +
            (x.x.adj === 'weak' ? ' selected' : '') +
            '>Weak</option></select>' +
            (open ? K.statBlock(x.m, x.x.adj) : '') +
            '</div>'
          );
        })
        .join('');
      var party =
        '<div class="panel"><h3>Party</h3>' +
        (parties().length
          ? '<select data-pfeparty="1"><option value="">— no saved party —</option>' +
            parties()
              .map(function (x) {
                return (
                  '<option value="' +
                  x.id +
                  '"' +
                  (e.party === x.id ? ' selected' : '') +
                  '>' +
                  esc(x.name || 'Unnamed party') +
                  ' (' +
                  esc(line(x)) +
                  ')</option>'
                );
              })
              .join('') +
            '</select>'
          : '<p class="small muted">Tip: add your players on the Party page and choose them here.</p>') +
        (p
          ? ''
          : '<div class="row"><div class="field"><span>Characters</span><span class="mm-step">' +
            btn('pfeSet', '−', { k: 'n', d: -1 }, 'mm-b') +
            '<b>' +
            n +
            '</b>' +
            btn('pfeSet', '+', { k: 'n', d: 1 }, 'mm-b') +
            '</span></div><div class="field"><span>Party level</span><span class="mm-step">' +
            btn('pfeSet', '−', { k: 'lvl', d: -1 }, 'mm-b') +
            '<b>' +
            lvl +
            '</b>' +
            btn('pfeSet', '+', { k: 'lvl', d: 1 }, 'mm-b') +
            '</span></div></div>') +
        '</div>';
      return (
        '<main class="mon-main"><h2>Encounters</h2><div class="enc-wrap">' +
        pickerHtml(lvl) +
        '<div>' +
        party +
        '<div class="panel"><div class="toolbar" style="margin:0"><h3 style="margin:0">Encounter</h3><span class="spacer"></span>' +
        btn('pfeRun', (root.Icon ? root.Icon('swords') : '') + ' Run it', {}, 'btn primary') +
        '</div>' +
        meter +
        (warn.length
          ? '<ul class="small enc-danger">' +
            warn
              .map(function (w) {
                return '<li>' + esc(w) + '</li>';
              })
              .join('') +
            '</ul>'
          : '') +
        (rows || '<p class="muted">Add creatures with + from the list.</p>') +
        '<div class="toolbar">' +
        btn('pfeClear', 'Clear', {}, 'btn small') +
        '</div></div>' +
        (root.SavedEnc ? root.SavedEnc.html(G.key) : '') +
        '</div></div>' +
        (E.view
          ? '<div class="enc-modal" role="dialog"><div class="toolbar">' +
            btn('pfeViewClose', '✕ Close', {}, 'btn') +
            '</div><h3>' +
            esc(mon(E.view).n) +
            ' <small class="muted">Creature ' +
            mon(E.view).lv +
            '</small></h3>' +
            K.statBlock(mon(E.view)) +
            '</div>'
          : '') +
        '</main>'
      );
    }
    function pickerHtml(lvl) {
      var B = (root[G.data] || {}).bestiary || [],
        q = (E.q || '').toLowerCase(),
        lo = E.lo === '' ? -1 : +E.lo,
        hi = E.hi === '' ? 99 : +E.hi;
      var list = B.filter(function (m) {
        return (
          (!q || m.n.toLowerCase().indexOf(q) >= 0) &&
          m.lv >= lo &&
          m.lv <= hi &&
          (!E.trait || (m.t || []).indexOf(E.trait) >= 0)
        );
      }).sort(function (a, b) {
        return a.lv - b.lv || (a.n < b.n ? -1 : 1);
      });
      var tr = {};
      B.forEach(function (m) {
        (m.t || []).forEach(function (t) {
          tr[t] = 1;
        });
      });
      var lvls = [];
      for (var i = -1; i <= 25; i++) lvls.push(i);
      var sel = function (k, label) {
        return (
          '<label class="mon-f">' +
          label +
          ' <select data-pfef="' +
          k +
          '"><option value="">Any</option>' +
          lvls
            .map(function (l) {
              return '<option' + (String(E[k]) === String(l) ? ' selected' : '') + '>' + l + '</option>';
            })
            .join('') +
          '</select></label>'
        );
      };
      return (
        '<div class="panel enc-pick"><h3>Creatures</h3><div class="mon-tools"><input type="search" id="pfe-q" data-pfef="q" placeholder="Search creatures…" value="' +
        esc(E.q) +
        '">' +
        sel('lo', 'Level from') +
        sel('hi', 'to') +
        '<label class="mon-f">Trait <select data-pfef="trait"><option value="">Any</option>' +
        Object.keys(tr)
          .sort()
          .map(function (t) {
            return '<option' + (E.trait === t ? ' selected' : '') + '>' + esc(t) + '</option>';
          })
          .join('') +
        '</select></label>' +
        btn('pfeNear', 'Near the party’s level', { v: lvl }, 'btn small') +
        '</div><div class="small muted mon-count">' +
        list.length +
        ' creatures</div>' +
        '<div class="mon-list enc-list">' +
        list
          .slice(0, 200)
          .map(function (m) {
            return (
              '<div class="enc-row"><button type="button" class="btn small" data-act="pfeAdd2" data-v="' +
              esc(m.id) +
              '" aria-label="Add ' +
              esc(m.n) +
              '">+</button><button type="button" class="linkbtn enc-name" data-act="pfeView" data-v="' +
              esc(m.id) +
              '">' +
              esc(m.n) +
              '</button><span class="small muted">Lv ' +
              m.lv +
              ' · ' +
              xpFor(m.lv - lvl) +
              ' XP</span></div>'
            );
          })
          .join('') +
        (list.length > 200 ? '<p class="small muted" style="padding:.5rem">Showing 200; search to narrow.</p>' : '') +
        '</div></div>'
      );
    }
    function startRun() {
      var e = enc(),
        p = partyById(e.party),
        list = [],
        d20 = function () {
          return 1 + Math.floor(Math.random() * 20);
        };
      e.mons.forEach(function (x) {
        var m = mon(x.id);
        if (!m) return;
        var d = x.adj === 'elite' ? 2 : x.adj === 'weak' ? -2 : 0,
          hp = m.hp + (x.adj === 'elite' ? hpAdj(m.lv) : x.adj === 'weak' ? -hpAdj(m.lv) : 0);
        for (var i = 0; i < x.count; i++)
          list.push({
            k: 'm' + list.length,
            id: m.id,
            adj: x.adj || '',
            n: (x.adj ? (x.adj === 'elite' ? 'Elite ' : 'Weak ') : '') + m.n + (x.count > 1 ? ' ' + (i + 1) : ''),
            hp: hp,
            max: hp,
            ac: (m.ac || 0) + d,
            init: d20() + (m.per || 0) + d,
            mod: (m.per || 0) + d,
            cond: ''
          });
      });
      if (p)
        p.m.forEach(function (m) {
          list.push({
            k: 'p' + m.id,
            n: m.n || 'Player',
            pc: true,
            hp: +m.cur || 0,
            max: +m.hp || 0,
            ac: +m.ac || 0,
            init: d20() + (+m.per || 0),
            mod: +m.per || 0,
            pm: [p.id, m.id],
            cond: ''
          });
        });
      list.sort(function (a, b) {
        return b.init - a.init || (a.pc ? -1 : 1);
      });
      e.run = { list: list, turn: 0, round: 1 };
    }
    function writeBack(c) {
      if (!c || !c.pm) return;
      var p = partyById(c.pm[0]),
        m =
          p &&
          p.m.filter(function (x) {
            return x.id === c.pm[1];
          })[0];
      if (m) m.cur = c.hp;
    }
    // the GM's table: players' initiative from their phones, and the turn shown on them
    function phones(run, blank, name) {
      var T = root.Table,
        h = T && T.hostInfo && T.hostInfo();
      if (!h) return;
      T.watch(
        h.code,
        function (st) {
          if (st && T.mergeRun(enc().run, st, blank)) api.render();
        },
        name
      );
      T.mergeRun(run, h.state, blank);
    }
    function runHtml() {
      var run = enc().run;
      phones(run, { cond: '' }, G.key + 'enc');
      return (
        '<div class="panel enc-run"><div class="toolbar" style="margin:0"><h3 style="margin:0">Round ' +
        run.round +
        '</h3><span class="spacer"></span>' +
        btn('pfeNext', 'Next turn ▶', {}, 'btn primary') +
        btn('pfeLoot', 'Treasure', {}, 'btn') +
        btn('pfeStop', 'End fight', {}, 'btn') +
        '</div>' +
        '<p class="small muted">Initiative is Perception + d20 (players can type their own rolls). Type damage (e.g. 12) or healing with + (e.g. +5).</p>' +
        run.list
          .map(function (c, i) {
            var pct = c.max ? Math.max(0, Math.round((c.hp / c.max) * 100)) : 100,
              m = c.id && mon(c.id);
            return (
              '<div class="enc-c' +
              (i === run.turn ? ' turn' : '') +
              (c.hp <= 0 && c.max ? ' down' : '') +
              (c.pc ? ' pc' : '') +
              '">' +
              '<input type="number" class="enc-init" id="pfi-' +
              c.k +
              '" data-pfeinit="' +
              c.k +
              '" value="' +
              c.init +
              '" aria-label="Initiative of ' +
              esc(c.n) +
              '">' +
              '<div class="enc-cn">' +
              (m
                ? '<button type="button" class="linkbtn enc-name" data-act="pfeView" data-v="' +
                  esc(m.id) +
                  '">' +
                  esc(c.n) +
                  '</button>'
                : '<b>' + esc(c.n) + '</b>') +
              ' <span class="small muted">AC ' +
              c.ac +
              '</span>' +
              (c.max ? '<div class="hpbar"><span style="width:' + pct + '%"></span></div>' : '') +
              '<input type="text" class="pf-econd" id="pfc-' +
              c.k +
              '" data-pfecond="' +
              c.k +
              '" value="' +
              esc(c.cond || '') +
              '" placeholder="conditions (frightened 1…)"></div>' +
              '<span class="enc-hp"><b>' +
              c.hp +
              '</b>/' +
              c.max +
              '</span><input type="text" inputmode="numeric" class="enc-dmg" id="pfd-' +
              c.k +
              '" data-pfedmg="' +
              c.k +
              '" placeholder="−dmg" aria-label="Damage or healing for ' +
              esc(c.n) +
              '">' +
              '<div class="enc-adj">' +
              ['-10', '-5', '-1', '+1', '+5', '+10']
                .map(function (v) {
                  return btn('pfeHpRun', v.replace('-', '−'), { v: c.k, d: v }, 'btn small');
                })
                .join('') +
              '</div></div>'
            );
          })
          .join('') +
        '</div>' +
        (E.view
          ? '<div class="enc-modal" role="dialog"><div class="toolbar">' +
            btn('pfeViewClose', '✕ Close', {}, 'btn') +
            '</div><h3>' +
            esc(mon(E.view).n) +
            '</h3>' +
            K.statBlock(mon(E.view)) +
            '</div>'
          : '')
      );
    }
    K.html = html;
    K.startRun = startRun;
    K.writeBack = writeBack;
  };
})(typeof window !== 'undefined' ? window : globalThis);
