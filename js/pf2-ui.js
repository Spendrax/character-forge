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

    function html(section) {
      if (section === 'pf2-home') return K.homeHtml();
      if (section === 'pf2-rules') return need(CHAR_DATA) ? K.rulesHtml() : waitHtml('Rules');
      if (section === 'pf2-chars') {
        if (!need(CHAR_DATA)) return waitHtml('Characters');
        var ch = U.view === 'char' && cur();
        return ch ? K.charHtml(ch) : K.listHtml();
      }
      if (section === 'pf2-mon') return root.PF2Enc ? ENC.monstersHtml() : '';
      if (section === 'pf2-loot') return root.PF2Enc ? ENC.lootHtml() : '';
      if (section === 'pf2-party' || section === 'pf2-enc')
        return root.PF2Enc ? (section === 'pf2-party' ? ENC.partyHtml() : ENC.html()) : '';
      return K.homeHtml();
    }
    var ENC = root.PF2Enc
      ? root.PF2Enc({
          esc: esc,
          btn: btn,
          ui: ui,
          store: store,
          render: render,
          ts: api.ts,
          pt: api.pt,
          need: need,
          waitHtml: waitHtml,
          md: md,
          fmt: fmt,
          gl: gl,
          traits: traits
        })
      : { actions: {}, onInput: function () {}, onChange: function () {} };
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
          PF2.SKILLS.reduce(function (out, k) {
            if (d.rank[k]) out.push(PF2.SK[k][0] + ' ' + PF2.RANK[d.rank[k]].toLowerCase());
            return out;
          }, []).join(', ') +
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
            .reduce(function (out, s) {
              if (!ch.feats[s.key]) out.push('[' + s.key + '] ' + K.slotLabel(s, d));
              return out;
            }, [])
            .join(', ') || 'none') +
          '.',
        d.open.filter(function (o) {
          return o.value === '';
        }).length
          ? 'Choices still open: ' +
            d.open
              .reduce(function (out, o) {
                if (o.value === '')
                  out.push(
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
                return out;
              }, [])
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
          throw new Error(e.n + ' can’t go in ' + K.slotLabel(s, d));
        ch.feats[slot] = e.id;
        return K.slotLabel(s, d) + ': ' + e.n;
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
    // the parts (pf2-ui-build.js, pf2-ui-sheet.js, pf2-ui-gear.js, pf2-ui-rules.js, pf2-ui-actions.js) share these names through K
    var K = {
      ALIGN: ALIGN,
      COND_VAL: COND_VAL,
      ENC: ENC,
      GLY: GLY,
      PF2: PF2,
      S: S,
      SIZE: SIZE,
      U: U,
      api: api,
      btn: btn,
      cur: cur,
      esc: esc,
      fmt: fmt,
      gl: gl,
      loadPic: loadPic,
      md: md,
      need: need,
      picHtml: picHtml,
      rar: rar,
      render: render,
      teml: teml,
      traits: traits
    };
    ['build', 'sheet', 'gear', 'rules', 'actions'].forEach(function (p) {
      root.PF2UIParts[p](K);
    });
    return {
      html: html,
      book: K.book,
      actions: K.actions,
      onInput: K.onInput,
      onChange: K.onChange,
      title: title,
      context: context,
      navPart: navPart,
      restoreNav: restoreNav,
      after: after
    };
  };
})(typeof window !== 'undefined' ? window : globalThis);
