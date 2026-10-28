// Pathfinder 2e DM tools: the party page and stat blocks.
// Part of pf2-enc.js: it runs inside PF2Enc; K holds the names the files share.
(function (root) {
  'use strict';
  (root.PF2EncParts = root.PF2EncParts || {}).party = function (K) {
    var G = K.G,
      E = K.E,
      api = K.api,
      btn = K.btn,
      curParty = K.curParty,
      esc = K.esc,
      fmt = K.fmt,
      gl = K.gl,
      hpAdj = K.hpAdj,
      line = K.line,
      md = K.md,
      parties = K.parties,
      store = K.store,
      traits = K.traits;

    function partyHtml() {
      var p = curParty(),
        list = parties();
      if (!p)
        return (
          '<main class="mon-main"><h2>Party</h2><p class="muted">Keep your players’ characters here (class, level, AC, HP, Perception). Encounters uses them for the XP budget and their hit points carry over between fights.</p>' +
          (api.pt ? api.pt.html(G.key) : '') +
          btn('pfeNew', '+ New party', {}, 'btn primary') +
          '</main>'
        );
      var mine = ((store[G.key] || {}).chars || []).filter(function (c) {
        return c.name && c.cls;
      });
      var f = function (m, k, label, wide) {
        return (
          '<label class="pm-f' +
          (wide ? ' wide' : '') +
          '"><span>' +
          label +
          '</span><input type="' +
          (wide ? 'text' : 'number') +
          '"' +
          (wide ? '' : ' inputmode="numeric"') +
          ' id="pfe-' +
          k +
          '-' +
          m.id +
          '" data-pfem="' +
          m.id +
          '" data-f="' +
          k +
          '" value="' +
          esc(m[k] == null ? '' : m[k]) +
          '"></label>'
        );
      };
      var rows = p.m
        .map(function (m) {
          var pct = m.hp ? Math.max(0, Math.min(100, Math.round((m.cur / m.hp) * 100))) : 0;
          return (
            '<div class="panel pm' +
            (m.hp && m.cur <= 0 ? ' down' : '') +
            '"><div class="pm-row">' +
            f(m, 'n', 'Name', 1) +
            f(m, 'cls', 'Class', 1) +
            btn('pfeRm', '✕', { v: m.id }, 'btn small') +
            '</div>' +
            '<div class="pm-row pm-def">' +
            f(m, 'lvl', 'Level') +
            f(m, 'ac', 'AC') +
            f(m, 'hp', 'Max HP') +
            f(m, 'per', 'Perc.') +
            '<span></span></div>' +
            '<div class="pm-hp"><span><b>' +
            m.cur +
            '</b>/' +
            m.hp +
            ' HP</span><div class="hpbar"><span style="width:' +
            pct +
            '%"></span></div><div class="enc-adj">' +
            ['-10', '-5', '-1', '+1', '+5', '+10']
              .map(function (v) {
                return btn('pfeHp', v.replace('-', '−'), { v: m.id, d: v }, 'btn small');
              })
              .join('') +
            '</div></div></div>'
          );
        })
        .join('');
      return (
        '<main class="mon-main"><h2>Party</h2>' +
        (api.pt ? api.pt.html(G.key) : '') +
        '<div class="toolbar">' +
        (list.length > 1
          ? '<select data-pfepick="1" aria-label="Choose a party">' +
            list
              .map(function (x) {
                return (
                  '<option value="' +
                  x.id +
                  '"' +
                  (x === p ? ' selected' : '') +
                  '>' +
                  esc(x.name || 'Unnamed party') +
                  '</option>'
                );
              })
              .join('') +
            '</select>'
          : '') +
        btn('pfeNew', '+ New party', {}, 'btn small') +
        '</div>' +
        '<div class="panel"><label class="field"><span>Party name</span><input type="text" id="pfe-name" data-pfename="1" value="' +
        esc(p.name || '') +
        '" placeholder="The Lantern Bearers"></label><p class="small muted" style="margin:.4rem 0 0">' +
        esc(line(p)) +
        '</p>' +
        '<div class="toolbar">' +
        btn('pfePlan', (root.Icon ? root.Icon('swords') : '') + ' Plan an encounter for them', {}, 'btn primary') +
        btn('pfeRest', 'Rest: full HP', {}, 'btn small') +
        '</div></div>' +
        rows +
        '<div class="toolbar">' +
        btn('pfeAdd', '+ Add a character', {}, 'btn') +
        (mine.length
          ? '<select data-pfemine="1" aria-label="Add one of my characters"><option value="">+ One of my characters…</option>' +
            mine
              .map(function (c) {
                return '<option value="' + c.id + '">' + esc(c.name) + '</option>';
              })
              .join('') +
            '</select>'
          : '') +
        '</div>' +
        '<div class="toolbar">' +
        (E.delParty
          ? '<span>Delete “' +
            esc(p.name || 'this party') +
            '”?</span>' +
            btn('pfeDel', 'Yes, delete', {}, 'btn small danger') +
            btn('pfeDelNo', 'No', {}, 'btn small')
          : btn('pfeDelAsk', 'Delete this party', {}, 'btn small')) +
        '</div></main>'
      );
    }

    // ---------- encounter ----------
    function statBlock(m, adj) {
      var d = adj === 'elite' ? 2 : adj === 'weak' ? -2 : 0,
        hp = m.hp + (adj === 'elite' ? hpAdj(m.lv) : adj === 'weak' ? -hpAdj(m.lv) : 0);
      var sv = m.sv || {};
      return (
        '<div class="pf-desc pf-stat-block">' +
        (root.DMUI ? root.DMUI.button(m.n, (m.t || []).join(', ')) : '') +
        traits(
          (m.t || []).concat(
            m.size
              ? [
                  { tiny: 'tiny', sm: 'small', med: 'medium', lg: 'large', huge: 'huge', grg: 'gargantuan' }[m.size] ||
                    m.size
                ]
              : []
          ),
          m
        ) +
        '<p class="small"><b>Perception</b> ' +
        fmt((m.per || 0) + d) +
        (m.lang && m.lang.length ? ' · <b>Languages</b> ' + esc(m.lang.join(', ')) : '') +
        '</p>' +
        (m.sk
          ? '<p class="small"><b>Skills</b> ' +
            esc(
              Object.keys(m.sk)
                .map(function (k) {
                  var v = m.sk[k];
                  return k + ' ' + fmt((typeof v === 'object' ? +v.value || 0 : +v || 0) + d);
                })
                .join(', ')
            ) +
            '</p>'
          : '') +
        '<p class="small">' +
        ['str', 'dex', 'con', 'int', 'wis', 'cha']
          .map(function (a) {
            return '<b>' + a.toUpperCase() + '</b> ' + fmt((m.ab || {})[a] || 0);
          })
          .join(' ') +
        '</p>' +
        '<p class="small"><b>AC</b> ' +
        ((m.ac || 0) + d) +
        '; <b>Fort</b> ' +
        fmt((sv.fortitude || 0) + d) +
        ', <b>Ref</b> ' +
        fmt((sv.reflex || 0) + d) +
        ', <b>Will</b> ' +
        fmt((sv.will || 0) + d) +
        '</p>' +
        '<p class="small"><b>HP</b> ' +
        hp +
        (m.imm ? '; <b>Immunities</b> ' + esc(m.imm.join(', ')) : '') +
        (m.wea ? '; <b>Weaknesses</b> ' + esc(m.wea.join(', ')) : '') +
        (m.res ? '; <b>Resistances</b> ' + esc(m.res.join(', ')) : '') +
        '</p>' +
        '<p class="small"><b>Speed</b> ' +
        (m.spd || 0) +
        ' feet' +
        (m.spd2 ? ', ' + esc(m.spd2.join(', ')) : '') +
        '</p>' +
        (m.str || [])
          .map(function (s) {
            return (
              '<p class="small"><b>' +
              (s.rng === 'ranged' ? 'Ranged' : 'Melee') +
              '</b> ◆ ' +
              esc(s.n) +
              ' ' +
              fmt((s.b || 0) + d) +
              (s.t && s.t.length ? ' (' + esc(s.t.join(', ')) + ')' : '') +
              ', <b>Damage</b> ' +
              esc(s.d) +
              (d ? ' ' + (d > 0 ? '+2' : '−2') : '') +
              '</p>'
            );
          })
          .join('') +
        (m.abil || [])
          .map(function (a) {
            return (
              '<div class="small"><b>' +
              esc(a.n) +
              '</b> ' +
              gl(a.a) +
              (a.spells ? ' ' + esc(a.d) + ': ' + esc(a.spells.join(', ')) : '') +
              (a.d && !a.spells ? md(a.d) : '') +
              '</div>'
            );
          })
          .join('') +
        (m.d ? '<div class="small muted">' + md(m.d) + '</div>' : '') +
        '</div>'
      );
    }
    K.partyHtml = partyHtml;
    K.statBlock = statBlock;
  };
})(typeof window !== 'undefined' ? window : globalThis);
