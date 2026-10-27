// M&M GM tools: the team (the heroes) page.
// Part of mm-enc.js: it runs inside MMEnc; K holds the names the files share.
(function (root) {
  'use strict';
  (root.MMEncParts = root.MMEncParts || {}).party = function (K) {
    var U = K.U,
      api = K.api,
      btn = K.btn,
      esc = K.esc,
      store = K.store,
      uid = K.uid;

    // ---------- the party: the GM's list of heroes with their defenses, hero points and damage ----------
    function teams() {
      return (store.mmTeams = store.mmTeams || []);
    }
    function teamById(id) {
      return teams().filter(function (x) {
        return x.id === id;
      })[0];
    }
    function curTeam() {
      return teamById(U.team) || teams()[0] || null;
    }
    function newMember(pl) {
      return {
        id: uid(),
        n: '',
        pl: pl || 10,
        tough: 0,
        dodge: 0,
        parry: 0,
        fort: 0,
        will: 0,
        hp: 1,
        bruise: 0,
        cond: ''
      };
    }
    function teamLine(t) {
      if (!t.m.length) return 'No heroes yet.';
      var pls = t.m.map(function (x) {
          return +x.pl || 1;
        }),
        lo = Math.min.apply(null, pls),
        hi = Math.max.apply(null, pls),
        hurt = t.m.filter(function (x) {
          return x.bruise || x.cond;
        }).length;
      return (
        t.m.length +
        ' hero' +
        (t.m.length === 1 ? '' : 'es') +
        ', PL ' +
        (lo === hi ? lo : lo + '–' + hi) +
        ' · ' +
        t.m.reduce(function (a, x) {
          return a + (+x.hp || 0);
        }, 0) +
        ' hero points' +
        (hurt ? ' · ' + hurt + ' hurt' : '')
      );
    }
    function teamPL(t) {
      var c = {};
      t.m.forEach(function (x) {
        c[x.pl] = (c[x.pl] || 0) + 1;
      });
      return (
        +Object.keys(c).sort(function (a, b) {
          return c[b] - c[a] || b - a;
        })[0] || 10
      );
    }
    function partyPage() {
      var t = curTeam(),
        list = teams();
      if (!t)
        return (
          '<main class="mon-main"><h2>Party</h2><p class="muted">Keep your players’ heroes here: power level, defenses, hero points and the damage they’ve taken. Encounters uses them to set the power level, and damage carries over from fight to fight.</p>' +
          (api.pt ? api.pt.html('mm') : '') +
          btn('mmtNew', '+ New party', {}, 'btn primary') +
          '</main>'
        );
      var mine = ((store.mm && store.mm.heroes) || []).filter(function (h) {
        return h.name;
      });
      var f = function (m, k, label, w) {
        return (
          '<label class="pm-f' +
          (w ? ' wide' : '') +
          '"><span>' +
          label +
          '</span><input type="' +
          (w ? 'text' : 'number') +
          '"' +
          (w ? '' : ' inputmode="numeric"') +
          ' id="mmt-' +
          k +
          '-' +
          m.id +
          '" data-mmt="' +
          m.id +
          '" data-f="' +
          k +
          '" value="' +
          esc(m[k] == null ? '' : m[k]) +
          '"></label>'
        );
      };
      var rows = t.m
        .map(function (m) {
          return (
            '<div class="panel pm' +
            (m.cond === 'Incapacitated' ? ' down' : '') +
            '"><div class="pm-row">' +
            f(m, 'n', 'Name', 1) +
            f(m, 'pl', 'PL') +
            btn('mmtRm', '✕', { v: m.id }, 'btn small') +
            '</div>' +
            '<div class="pm-row pm-def">' +
            f(m, 'tough', 'Tough') +
            f(m, 'dodge', 'Dodge') +
            f(m, 'parry', 'Parry') +
            f(m, 'fort', 'Fort') +
            f(m, 'will', 'Will') +
            '</div>' +
            '<div class="pm-hp"><span>Hero points <span class="mm-step">' +
            btn('mmtHp', '−', { v: m.id, d: -1 }, 'mm-b') +
            '<b>' +
            (+m.hp || 0) +
            '</b>' +
            btn('mmtHp', '+', { v: m.id, d: 1 }, 'mm-b') +
            '</span></span>' +
            '<span class="small">' +
            (m.bruise ? 'Toughness −' + m.bruise : 'Unhurt') +
            '</span>' +
            (m.cond ? '<span class="mme-cond">' + esc(m.cond) + '</span>' : '') +
            (m.bruise || m.cond ? btn('mmtHeal', 'Recover', { v: m.id }, 'btn small') : '') +
            '</div></div>'
          );
        })
        .join('');
      return (
        '<main class="mon-main"><h2>Party</h2>' +
        (api.pt ? api.pt.html('mm') : '') +
        '<div class="toolbar">' +
        (list.length > 1
          ? '<select data-mmtpick="1" aria-label="Choose a party">' +
            list
              .map(function (x) {
                return (
                  '<option value="' +
                  x.id +
                  '"' +
                  (x === t ? ' selected' : '') +
                  '>' +
                  esc(x.name || 'Unnamed party') +
                  '</option>'
                );
              })
              .join('') +
            '</select>'
          : '') +
        btn('mmtNew', '+ New party', {}, 'btn small') +
        '</div>' +
        '<div class="panel"><label class="field"><span>Party name</span><input type="text" id="mmt-name" data-mmtname="1" value="' +
        esc(t.name || '') +
        '" placeholder="The Liberty Squad"></label><p class="small muted" style="margin:.4rem 0 0">' +
        esc(teamLine(t)) +
        '</p>' +
        '<div class="toolbar">' +
        btn('mmtPlan', (root.Icon ? root.Icon('swords') : '') + ' Plan an encounter for them', {}, 'btn primary') +
        btn('mmtRest', 'New session', {}, 'btn small') +
        '</div>' +
        '<p class="small muted" style="margin:0">New session: damage healed and everyone back to 1 hero point.</p></div>' +
        rows +
        '<div class="toolbar">' +
        btn('mmtAdd', '+ Add a hero', {}, 'btn') +
        (mine.length
          ? '<select data-mmtmine="1" aria-label="Add one of my heroes"><option value="">+ One of my heroes…</option>' +
            mine
              .map(function (h) {
                return '<option value="' + h.id + '">' + esc(h.name) + '</option>';
              })
              .join('') +
            '</select>'
          : '') +
        '</div>' +
        '<div class="toolbar">' +
        (U.delTeam
          ? '<span>Delete “' +
            esc(t.name || 'this party') +
            '”?</span>' +
            btn('mmtDel', 'Yes, delete', {}, 'btn small danger') +
            btn('mmtDelNo', 'No', {}, 'btn small')
          : btn('mmtDelAsk', 'Delete this party', {}, 'btn small')) +
        '</div></main>'
      );
    }
    K.curTeam = curTeam;
    K.newMember = newMember;
    K.partyPage = partyPage;
    K.teamById = teamById;
    K.teamLine = teamLine;
    K.teamPL = teamPL;
    K.teams = teams;
  };
})(typeof window !== 'undefined' ? window : globalThis);
