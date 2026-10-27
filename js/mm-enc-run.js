// M&M GM tools: running a fight, and the Encounters page.
// Part of mm-enc.js: it runs inside MMEnc; K holds the names the files share.
(function (root) {
  'use strict';
  (root.MMEncParts = root.MMEncParts || {}).run = function (K) {
    var E = K.E,
      MR = K.MR,
      R = K.R,
      ROLES = K.ROLES,
      U = K.U,
      api = K.api,
      btn = K.btn,
      esc = K.esc,
      store = K.store;

    // ---------- the fight ----------
    var DMG = ['', 'Bruised', 'Dazed', 'Staggered', 'Incapacitated'];
    function startRun() {
      var e = E(),
        list = [];
      e.foes.forEach(function (h) {
        if (h.pre) {
          var f = K.preFoe(h.pre);
          if (f)
            list.push({
              k: h.id,
              n: h.name,
              foe: true,
              minion: h.minion,
              init: 1 + R(20) + f.init,
              mod: f.init,
              tough: K.defOf(f.def[3]),
              bruise: 0,
              cond: '',
              dodge: K.defOf(f.def[0]),
              parry: K.defOf(f.def[1])
            });
          return;
        }
        var d = MR.derive(h);
        list.push({
          k: h.id,
          n: h.name,
          foe: true,
          minion: h.minion,
          init: 1 + R(20) + d.init,
          mod: d.init,
          tough: d.def.tough,
          bruise: 0,
          cond: '',
          dodge: d.def.dodge,
          parry: d.def.parry
        });
      });
      var t = K.teamById(e.team);
      if (t)
        t.m.forEach(function (m) {
          list.push({
            k: m.id,
            n: m.n || 'Hero',
            pc: true,
            team: t.id,
            init: 1 + R(20),
            mod: 0,
            tough: +m.tough || 0,
            bruise: +m.bruise || 0,
            cond: m.cond || '',
            dodge: +m.dodge || 0,
            parry: +m.parry || 0
          });
        });
      ((store.mm && store.mm.heroes) || [])
        .filter(function (h) {
          return (U.fighting || {})[h.id];
        })
        .forEach(function (h) {
          var d = MR.derive(h);
          list.push({
            k: h.id,
            n: h.name || 'Hero',
            pc: true,
            init: 1 + R(20) + d.init,
            mod: d.init,
            tough: d.def.tough,
            bruise: 0,
            cond: '',
            dodge: d.def.dodge,
            parry: d.def.parry
          });
        });
      list.sort(function (x, y) {
        return y.init - x.init || y.mod - x.mod;
      });
      e.run = { list: list, turn: 0, round: 1, log: '' };
    }
    // A Toughness check against DC 15 + damage rank: each 5 points of failure is one more degree.
    function hit(c, rank) {
      if (c.cond === 'Incapacitated') return c.n + ' is already out.';
      var tough = c.tough - c.bruise,
        roll = 1 + R(20),
        total = roll + tough,
        dc = 15 + rank,
        how = '(' + roll + ' + ' + tough + ' = ' + total + ' vs DC ' + dc + ')';
      if (total >= dc) return c.n + ' resists ' + how + '.';
      var deg = Math.min(4, Math.ceil((dc - total) / 5));
      if (c.minion || (deg === 3 && c.cond === 'Staggered')) deg = 4; // minions drop at once; staggered twice is out
      var res = deg === 4 ? 'Incapacitated' : DMG[deg];
      if (deg < 4) c.bruise++;
      if (deg >= 2 && DMG.indexOf(res) > DMG.indexOf(c.cond)) c.cond = res;
      return (
        c.n +
        ' fails by ' +
        deg +
        ' degree' +
        (deg > 1 ? 's ' : ' ') +
        how +
        ': ' +
        (c.minion ? 'a minion, so out.' : deg === 1 ? '−1 Toughness.' : res + (deg < 4 ? ' and −1 Toughness.' : '.'))
      );
    }
    function writeBack(c) {
      var t = c && c.team && K.teamById(c.team),
        m =
          t &&
          t.m.filter(function (x) {
            return x.id === c.k;
          })[0];
      if (m) {
        m.bruise = c.bruise;
        m.cond = c.cond;
      }
    }
    function runHtml() {
      var run = E().run,
        TB = root.Table,
        hi = TB && TB.hostInfo && TB.hostInfo(),
        blank = { tough: 0, bruise: 0, cond: '', dodge: 0, parry: 0 };
      if (hi) {
        TB.watch(
          hi.code,
          function (st) {
            if (st && TB.mergeRun(E().run, st, blank)) api.render && api.render();
          },
          'mmenc'
        );
        TB.mergeRun(run, hi.state, blank);
      }
      return (
        '<div class="panel enc-run"><div class="toolbar" style="margin:0"><h3 style="margin:0">Round ' +
        run.round +
        '</h3><span class="spacer"></span>' +
        btn('mmeNext', 'Next turn ▶', {}, 'btn primary') +
        btn('mmeStop', 'End fight', {}, 'btn') +
        '</div>' +
        (run.log ? '<p class="rest-msg small">' + esc(run.log) + '</p>' : '') +
        '<p class="small muted">Type the damage rank of a hit and tap Hit: the app rolls the Toughness check (DC 15 + rank) and fills in the damage track. Minions are out after any failed check.</p>' +
        run.list
          .map(function (c, i) {
            var out = c.cond === 'Incapacitated';
            return (
              '<div class="enc-c mme-c' +
              (i === run.turn ? ' turn' : '') +
              (out ? ' down' : '') +
              (c.foe ? '' : ' pc') +
              '">' +
              '<input type="number" class="enc-init" id="mmi-' +
              c.k +
              '" data-mmeinit="' +
              c.k +
              '" value="' +
              c.init +
              '" aria-label="Initiative of ' +
              esc(c.n) +
              '">' +
              '<div class="enc-cn"><b>' +
              esc(c.n) +
              '</b>' +
              (c.minion ? ' <span class="small muted">minion</span>' : '') +
              '<div class="small muted">Tough ' +
              (c.tough - c.bruise) +
              (c.bruise ? ' (−' + c.bruise + ')' : '') +
              ' · Dodge ' +
              c.dodge +
              ' · Parry ' +
              c.parry +
              '</div>' +
              (c.cond ? '<span class="mme-cond">' + esc(c.cond) + '</span>' : '') +
              '</div>' +
              '<div class="mme-hit"><input type="number" inputmode="numeric" min="1" max="40" id="mmr-' +
              c.k +
              '" data-mmerank="' +
              c.k +
              '" placeholder="rank" aria-label="Damage rank against ' +
              esc(c.n) +
              '">' +
              btn('mmeHit', 'Hit', { v: c.k }, 'btn small') +
              btn('mmeHeal', 'Recover', { v: c.k }, 'btn small') +
              '</div></div>'
            );
          })
          .join('') +
        '</div>'
      );
    }

    function html() {
      var e = E(),
        heroes = ((store.mm && store.mm.heroes) || []).filter(function (h) {
          return h.name;
        });
      if (e.run) return '<main class="mon-main"><h2>Encounters</h2>' + runHtml() + '</main>';
      var kinds = [
        ['bossmin', 'Villain + minions'],
        ['boss', 'One big villain'],
        ['team', 'Villain team'],
        ['minions', 'Only minions']
      ];
      return (
        '<main class="mon-main mme"><h2>Encounters</h2><p class="muted">Pick the heroes’ power level and how many there are: the app makes villains and minions with their own powers, skills and tactics, built within the power level limits.</p>' +
        '<div class="panel">' +
        (K.teams().length
          ? '<label class="field"><span>Party</span><select data-mmeteam="1"><option value="">— none —</option>' +
            K.teams()
              .map(function (x) {
                return (
                  '<option value="' +
                  x.id +
                  '"' +
                  (e.team === x.id ? ' selected' : '') +
                  '>' +
                  esc(x.name || 'Unnamed party') +
                  ' (' +
                  K.teamLine(x) +
                  ')</option>'
                );
              })
              .join('') +
            '</select></label>'
          : '<p class="small muted">Tip: add your players on the Party page and choose them here.</p>') +
        '<div class="row"><div class="field"><span>Heroes’ power level</span><span class="mm-step">' +
        btn('mmeSet', '−', { k: 'pl', d: -1 }, 'mm-b') +
        '<b>' +
        e.pl +
        '</b>' +
        btn('mmeSet', '+', { k: 'pl', d: 1 }, 'mm-b') +
        '</span></div>' +
        '<div class="field"><span>Number of heroes</span><span class="mm-step">' +
        btn('mmeSet', '−', { k: 'n', d: -1 }, 'mm-b') +
        '<b>' +
        e.n +
        '</b>' +
        btn('mmeSet', '+', { k: 'n', d: 1 }, 'mm-b') +
        '</span></div></div>' +
        '<div class="pills">' +
        kinds
          .map(function (k) {
            return btn('mmeKind', k[1], { v: k[0] }, 'pill' + (e.kind === k[0] ? ' on' : ''));
          })
          .join('') +
        '</div>' +
        (e.kind !== 'minions'
          ? '<label class="field"><span>Villain type</span><select data-mmerole="1"><option value="">Any (a mix)</option>' +
            Object.keys(ROLES)
              .map(function (r) {
                return (
                  '<option value="' + r + '"' + (e.role === r ? ' selected' : '') + '>' + ROLES[r].label + '</option>'
                );
              })
              .join('') +
            '</select></label>'
          : '') +
        '<p class="small muted">' +
        {
          boss: 'One villain at PL ' + Math.min(20, e.pl + 2) + ', strong enough to face the whole team alone.',
          bossmin:
            'A villain at PL ' +
            Math.min(20, e.pl + 1) +
            ' with ' +
            e.n * 2 +
            ' minions at PL ' +
            Math.max(1, e.pl - 4) +
            '.',
          team: e.n + ' villains at PL ' + e.pl + ', one for each hero.',
          minions: e.n * 3 + ' minions at PL ' + Math.max(1, e.pl - 3) + ': a warm-up fight.'
        }[e.kind] +
        '</p>' +
        '<div class="toolbar">' +
        btn('mmeGen', (root.Icon ? root.Icon('d20') : '') + ' Make the encounter', {}, 'btn primary') +
        '</div></div>' +
        (e.msg ? '<p class="rest-msg small">' + esc(e.msg) + '</p>' : '') +
        (e.foes.length
          ? '<h3>Foes</h3>' +
            e.foes.map(K.statBlock).join('') +
            '<div class="panel"><h4 style="margin-top:0">Who fights?</h4>' +
            (K.teamById(e.team)
              ? '<p class="small">' +
                esc(K.teamById(e.team).name || 'The party') +
                ': ' +
                esc(
                  K.teamById(e.team)
                    .m.map(function (m) {
                      return m.n || 'Hero';
                    })
                    .join(', ')
                ) +
                '</p>'
              : '') +
            (heroes.length
              ? '<div class="pills">' +
                heroes
                  .map(function (h) {
                    return btn('mmeFight', esc(h.name), { v: h.id }, 'pill' + ((U.fighting || {})[h.id] ? ' on' : ''));
                  })
                  .join('') +
                '</div>'
              : '<p class="small muted">Your heroes from the Heroes page can join the initiative list.</p>') +
            '<div class="toolbar">' +
            btn('mmeRun', (root.Icon ? root.Icon('swords') : '') + ' Run the fight', {}, 'btn primary') +
            '</div></div>'
          : '') +
        (root.SavedEnc ? root.SavedEnc.html('mm') : '') +
        '</main>'
      );
    }
    K.DMG = DMG;
    K.hit = hit;
    K.html = html;
    K.startRun = startRun;
    K.writeBack = writeBack;
  };
})(typeof window !== 'undefined' ? window : globalThis);
