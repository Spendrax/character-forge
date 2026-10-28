// Pathfinder 2e DM tools: the Monsters page.
// Part of pf2-enc.js: it runs inside PF2Enc; K holds the names the files share.
(function (root) {
  'use strict';
  (root.PF2EncParts = root.PF2EncParts || {}).monsters = function (K) {
    var G = K.G,
      api = K.api,
      btn = K.btn,
      enc = K.enc,
      esc = K.esc,
      ui = K.ui;

    // ---------- monsters: the whole bestiary to browse ----------
    var M = (ui[G.key + 'm'] = ui[G.key + 'm'] || {
      q: '',
      lo: '',
      hi: '',
      trait: '',
      size: '',
      src: '',
      open: '',
      added: ''
    });
    var SRC = {
      B1: 'Bestiary',
      B2: 'Bestiary 2',
      B3: 'Bestiary 3',
      GMG: 'Gamemastery Guide',
      BotD: 'Book of the Dead',
      RoE: 'Rage of Elements',
      MoM: 'Monsters of Myth',
      LOCG: 'Lost Omens Character Guide',
      DA: 'Dark Archive',
      CRB: 'Core Rulebook',
      Abs: 'Lost Omens Absalom'
    };
    var SIZES = [
      ['tiny', 'Tiny'],
      ['sm', 'Small'],
      ['med', 'Medium'],
      ['lg', 'Large'],
      ['huge', 'Huge'],
      ['grg', 'Gargantuan']
    ];
    // creature-type traits → the sound groups the D&D monsters use
    var CTYPE = {
      aberration: 'aberration',
      animal: 'beast',
      beast: 'beast',
      celestial: 'celestial',
      construct: 'construct',
      dragon: 'dragon',
      elemental: 'elemental',
      fey: 'fey',
      fiend: 'fiend',
      fungus: 'plant',
      giant: 'giant',
      humanoid: 'humanoid',
      ooze: 'ooze',
      plant: 'plant',
      undead: 'undead',
      spirit: 'undead'
    };
    function soundBtn(m) {
      if (!root.Sounds) return '';
      var ty = (m.t || []).filter(function (t) {
        return CTYPE[t];
      })[0];
      return root.Sounds.button({ n: m.n, type: ty ? CTYPE[ty] : '' });
    }
    function monstersHtml() {
      if (!api.need(['core', 'bestiary'])) return api.waitHtml('Monsters');
      var B = root[G.data].bestiary,
        q = (M.q || '').toLowerCase(),
        lo = M.lo === '' ? -99 : +M.lo,
        hi = M.hi === '' ? 99 : +M.hi;
      var list = B.filter(function (m) {
        return (
          (!q || m.n.toLowerCase().indexOf(q) >= 0) &&
          m.lv >= lo &&
          m.lv <= hi &&
          (!M.trait || (m.t || []).indexOf(M.trait) >= 0) &&
          (!M.size || m.size === M.size) &&
          (!M.src || m.src === M.src)
        );
      }).sort(function (a, b) {
        return a.lv - b.lv || (a.n < b.n ? -1 : 1);
      });
      var tr = {},
        srcs = {};
      B.forEach(function (m) {
        (m.t || []).forEach(function (t) {
          tr[t] = 1;
        });
        srcs[m.src] = (srcs[m.src] || 0) + 1;
      });
      var lvls = [];
      for (var i = -1; i <= 25; i++) lvls.push(i);
      var opt = function (v, label, cur) {
        return (
          '<option value="' +
          esc(v) +
          '"' +
          (String(cur) === String(v) ? ' selected' : '') +
          '>' +
          esc(label) +
          '</option>'
        );
      };
      var sel = function (k, label, opts) {
        return (
          '<label class="mon-f">' +
          label +
          ' <select data-pfmf="' +
          k +
          '"><option value="">Any</option>' +
          opts
            .map(function (o) {
              return opt(o[0], o[1], M[k]);
            })
            .join('') +
          '</select></label>'
        );
      };
      var n = enc().mons.reduce(function (a, x) {
        return a + x.count;
      }, 0);
      var h =
        '<main class="mon-main"><h2>' +
        (G.credits ? 'Aliens' : 'Monsters') +
        '</h2><div class="panel"><div class="mon-tools"><input type="search" id="pfm-q" data-pfmf="q" placeholder="Search ' +
        B.length +
        ' creatures…" value="' +
        esc(M.q) +
        '">' +
        sel(
          'lo',
          'Level from',
          lvls.map(function (l) {
            return [l, l];
          })
        ) +
        sel(
          'hi',
          'to',
          lvls.map(function (l) {
            return [l, l];
          })
        ) +
        sel(
          'trait',
          'Trait',
          Object.keys(tr)
            .sort()
            .map(function (t) {
              return [t, t];
            })
        ) +
        sel('size', 'Size', SIZES) +
        sel(
          'src',
          'Book',
          Object.keys(srcs)
            .sort(function (a, b) {
              return srcs[b] - srcs[a];
            })
            .map(function (k) {
              return [k, SRC[k] || k];
            })
        ) +
        '</div>' +
        '<div class="small muted mon-count">' +
        list.length +
        ' creatures' +
        (list.length > 200 ? ', showing 200: search or filter to narrow' : '') +
        '</div>' +
        (M.added
          ? '<p class="small rest-msg">' +
            esc(M.added) +
            ' added to the encounter (' +
            n +
            ' creature' +
            (n === 1 ? '' : 's') +
            '). <button type="button" class="linkbtn" data-act="section" data-v="' +
            G.sec +
            'enc">Go to Encounters</button></p>'
          : '') +
        '</div>';
      h += list
        .slice(0, 200)
        .map(function (m) {
          var open = M.open === m.id,
            size = (SIZES.filter(function (x) {
              return x[0] === m.size;
            })[0] || ['', m.size || ''])[1];
          var kind = (m.t || [])
            .filter(function (t) {
              return CTYPE[t];
            })
            .join(', ');
          return (
            '<div class="pf-spell' +
            (m.r ? ' r-' + esc(m.r) : '') +
            '"><button type="button" class="pf-pname" data-act="pfmOpen" data-v="' +
            esc(m.id) +
            '" aria-expanded="' +
            open +
            '"><b>' +
            esc(m.n) +
            '</b><span class="spacer"></span><small class="muted">Creature ' +
            m.lv +
            ' · ' +
            esc([size, kind].filter(Boolean).join(' ')) +
            ' · ' +
            esc(m.src) +
            '</small></button>' +
            (open
              ? '<div class="toolbar">' +
                btn('pfmAdd', '+ Add to encounter', { v: m.id }, 'btn small primary') +
                soundBtn(m) +
                '<span class="small muted">' +
                esc(SRC[m.src] || m.src) +
                '</span></div>' +
                K.statBlock(m)
              : '') +
            '</div>'
          );
        })
        .join('');
      return (
        h +
        '<p class="small muted">Creatures from the pre-Remaster Bestiaries and books, Open Game Content (see Rules → License).</p></main>'
      );
    }
    K.M = M;
    K.monstersHtml = monstersHtml;
  };
})(typeof window !== 'undefined' ? window : globalThis);
