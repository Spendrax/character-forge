// Pathfinder 2e screens: what taps and typing do (the actions, onInput, onChange).
// Part of pf2-ui.js: it runs inside PF2UI; K holds the names the files share.
(function (root) {
  'use strict';
  (root.PF2UIParts = root.PF2UIParts || {}).actions = function (K) {
    var G = K.G,
      ENC = K.ENC,
      PF2 = K.PF2,
      S = K.S,
      U = K.U,
      cur = K.cur,
      loadPic = K.loadPic,
      render = K.render;

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
        K.doImport(t ? t.value : '');
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
          cid = chx ? K.pickCurrent(chx, PF2.derive(chx)) : '';
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
          var T = K.trk(ch),
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
                K.choiceEntries(o).filter(function (x) {
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
          var T = K.trk(ch),
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
          var T = K.trk(ch);
          if (T.slots) delete T.slots[v];
        });
      },
      pfHp: function (v) {
        chg(function (ch) {
          var T = K.trk(ch),
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
          var T = K.trk(ch);
          T.hero = (T.hero || 0) >= +v ? +v - 1 : +v;
        });
      },
      pfFocus: function (v) {
        chg(function (ch) {
          var T = K.trk(ch),
            d = PF2.derive(ch),
            f = T.focus == null ? d.focusMax : T.focus;
          T.focus = f >= +v ? +v - 1 : +v;
        });
      },
      pfTrk: function (_, el) {
        chg(function (ch) {
          var T = K.trk(ch),
            k = el.getAttribute('data-k');
          T[k] = Math.max(0, Math.min(4, (T[k] || 0) + +el.getAttribute('data-d')));
        });
      },
      pfNoteStyle: function (v, el) {
        chg(function (ch) {
          ch.noteStyle = Object.assign({}, ch.noteStyle);
          ch.noteStyle[el.getAttribute('data-k')] = v;
        });
      },
      pfRest: function () {
        chg(function (ch) {
          var T = K.trk(ch);
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
          var T = K.trk(ch);
          T.conds[v] = Math.max(1, Math.min(9, (T.conds[v] || 1) + +el.getAttribute('data-d')));
        });
      },
      pfCondRm: function (v) {
        chg(function (ch) {
          delete K.trk(ch).conds[v];
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
        root.Dice3D.roll(
          counts,
          s.bonus,
          s.n + ' damage' + ((U.cdmg || {})[v] && s.cond.length ? ' + ' + s.cond.join(', ') : '')
        );
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
          new Blob([JSON.stringify({ app: 'character-forge', game: G.key, char: ch }, null, 1)], {
            type: 'application/json'
          })
        );
        a.download = (ch.name || 'character').replace(/[^\w-]+/g, '_') + '.' + G.key + '.json';
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
        K.trk(ch)[a('data-pftrk')] = Math.max(0, +t.value || 0);
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
            K.doImport(x);
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
        if (a('data-f') === 'grade')
          g.grade = t.value; // Starfinder
        else g.runes[a('data-f')] = a('data-f') === 'pot' ? +t.value : t.value;
        return 'render';
      }
      if (a('data-pfcondadd') && t.value) {
        K.trk(ch).conds[t.value] = 1;
        return 'render';
      }
      if (a('data-pfraise')) {
        K.trk(ch).raised = t.checked;
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
    K.actions = actions;
    K.onChange = onChange;
    K.onInput = onInput;
  };
})(typeof window !== 'undefined' ? window : globalThis);
