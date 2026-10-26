// Every button: the actions map (data-act="name" → function), and keyboard shortcuts.
// Part of the app: these files share one scope (see “How the code is organized” in README.md), loaded in order by index.html.
'use strict';

// ---------- actions ----------
var actions = {
  section: function (v) {
    ui.section = v;
    window.scrollTo(0, 0);
  },
  game: function (v) {
    if (gameOf() === v) return;
    store.game = v === 'mm' || v === 'pf2' || v === 'sd' ? v : 'dnd';
    ui.section = { mm: 'mm-home', pf2: 'pf2-home', sd: 'sd-home' }[store.game] || 'home';
    ui.q.rules = '';
    window.scrollTo(0, 0);
  },
  openChar: function (v) {
    store.current = v;
    ui.section = 'chars';
    ch = byId(v);
    openMode();
    window.scrollTo(0, 0);
  },
  editSkills: function () {
    ui.mode = 'build';
    ui.step = 'details';
    ui.jumpTo = 'skills-edit';
  },
  editChar: function () {
    ui.mode = 'build';
    ui.step = 'lineage';
    ui.scrollToStep = true;
  },
  donePlay: function () {
    ui.mode = 'play';
    ui.step = 'play';
    ui.scrollToStep = true;
  },
  // the folded part of the character bar: redo, new, import, export, delete, theme, sources
  charMenu: function () {
    ui.charMenu = !ui.charMenu;
    ui.confirmDelete = false;
  },
  // levelUp and the level-up screen: levelup.js
  step: function (v) {
    ui.lvl = null;
    ui.step = v;
    ui.picEdit = false;
    ui.packAdded = null;
    ui.editArmor = null;
    ui.editWeapon = null;
    ui.partImport = null;
    ui.partImportDone = null;
    ui.partImportError = null;
    ui.scrollToStep = true;
  },
  rosterNew: function () {
    actions['new']();
    ui.section = 'chars';
    window.scrollTo(0, 0);
  },
  new: function () {
    var c = R.newChar();
    store.chars.push(c);
    store.current = c.id;
    ui.step = 'lineage';
    ui.mode = 'build';
  },
  dup: function () {
    var c = JSON.parse(JSON.stringify(ch));
    c.id = R.uid();
    c.name = title(ch) + ' (copy)';
    store.chars.push(c);
    store.current = c.id;
  },
  askDelete: function () {
    ui.confirmDelete = true;
  },
  cancelDelete: function () {
    ui.confirmDelete = false;
  },
  delete: function () {
    store.chars = store.chars.filter(function (c) {
      return c.id !== ch.id;
    });
    if (!store.chars.length) store.chars.push(R.newChar());
    store.current = store.chars[0].id;
    ui.confirmDelete = false;
  },
  export: function () {
    var blob = new Blob([JSON.stringify(ch, null, 2)], { type: 'application/json' }),
      a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = (title(ch).replace(/[^\w-]+/g, '_') || 'character') + '.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () {
      URL.revokeObjectURL(a.href);
    }, 1000);
  },
  import: function () {
    document.getElementById('importFile').click();
    return false;
  },
  print: function () {
    window.print();
    return false;
  },
  printCards: function () {
    var rows = mySpellRows()
      .filter(function (r) {
        return r.ready && r.s;
      })
      .sort(function (a, b) {
        return a.s.level - b.s.level || (a.name < b.name ? -1 : 1);
      });
    var box =
      document.getElementById('print-cards') ||
      document.body.appendChild(Object.assign(document.createElement('div'), { id: 'print-cards' }));
    box.innerHTML = rows
      .map(function (r) {
        var s = r.s,
          txt = R.spellText(s.name) || '';
        return (
          '<div class="pcard"><div class="pcard-head"><b>' +
          esc(s.name) +
          '</b><span>' +
          (s.level ? 'Level ' + s.level : 'Cantrip') +
          ' · ' +
          esc(s.school) +
          '</span></div>' +
          '<dl><dt>Time</dt><dd>' +
          esc(s.time) +
          (s.ritual ? ' (ritual)' : '') +
          '</dd><dt>Range</dt><dd>' +
          esc(s.range) +
          '</dd><dt>Components</dt><dd>' +
          esc(s.comp) +
          '</dd><dt>Duration</dt><dd>' +
          esc(s.duration) +
          (s.conc ? ' (concentration)' : '') +
          '</dd></dl>' +
          '<div class="pcard-text">' +
          esc(txt) +
          '</div><div class="pcard-foot">' +
          esc(title(ch)) +
          '</div></div>'
        );
      })
      .join('');
    document.body.classList.add('printing-cards');
    var done = function () {
      document.body.classList.remove('printing-cards');
      window.removeEventListener('afterprint', done);
    };
    window.addEventListener('afterprint', done);
    setTimeout(function () {
      window.print();
      setTimeout(done, 1000);
    }, 50);
    return false;
  },
  install: function () {
    if (!installPrompt) {
      ui.installHelp = !ui.installHelp;
      return;
    }
    var pr = installPrompt;
    installPrompt = null;
    pr.prompt();
    if (pr.userChoice)
      pr.userChoice.then(function () {
        render();
      });
  },
  closeInstallHelp: function () {
    ui.installHelp = false;
  },
  import5eParts: function (v, el) {
    var I = ui.import5e;
    if (!I) return false;
    var id = +el.getAttribute('data-e'),
      e = I.entries.filter(function (x) {
        return x.id === id;
      })[0];
    I.parts[id] = el.getAttribute('data-all')
      ? PART_ORDER.filter(function (k) {
          return e.source === 'companion' || PARTS[k].spellbook;
        })
      : [];
  },
  mySpellsKind: function (v) {
    ui.mySpellsKind = ui.mySpellsKind === v ? '' : v;
  },
  miMore: function (v) {
    ui.miMore = v === 'all' ? 99999 : (ui.miMore || 150) + 150;
  },
  xferOpen: function () {
    ui.xfer = ui.xfer || {};
    ui.ddb = null;
  },
  xferClose: function () {
    ui.xfer = null;
  },
  xferMake: function () {
    var X = ui.xfer;
    if (!X) return false;
    X.busy = true;
    X.link = '';
    X.qr = '';
    X.msg = '';
    Transfer.pack(xferBundle(false))
      .then(function (z) {
        X.link = window.location.origin + window.location.pathname + '#take=' + z;
        X.busy = false;
        return X.link.length <= Transfer.QR_MAX
          ? Transfer.qr(X.link).then(
              function (u) {
                X.qr = u;
              },
              function () {
                X.qr = '';
              }
            )
          : null;
      })
      .then(render, function () {
        X.busy = false;
        X.msg = 'This browser can’t make the link. Use “Share as a file” instead.';
        render();
      });
  },
  xferCopy: function () {
    var X = ui.xfer;
    if (!X || !X.link) return false;
    (navigator.clipboard ? navigator.clipboard.writeText(X.link) : Promise.reject()).then(
      function () {
        X.msg = 'Link copied. Paste it in a message to yourself or straight into the other device’s browser.';
        render();
      },
      function () {
        X.msg = 'Couldn’t copy here: use Share instead.';
        render();
      }
    );
    return false;
  },
  xferShare: function () {
    var X = ui.xfer;
    if (X && X.link && navigator.share)
      navigator.share({ title: 'My characters', url: X.link }).catch(function () {
        /* cancelled */
      });
    return false;
  },
  xferFile: function () {
    var blob = new Blob([JSON.stringify(xferBundle(true))], { type: 'application/json' }),
      name = 'character-forge-' + new Date().toISOString().slice(0, 10) + '.json';
    var file = window.File ? new File([blob], name, { type: 'application/json' }) : null;
    if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
      navigator.share({ files: [file], title: 'My characters' }).catch(function () {
        /* cancelled */
      });
      return false;
    }
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () {
      URL.revokeObjectURL(a.href);
    }, 1000);
    ui.xfer.msg = 'Saved ' + name + '. On the other device, use Import on the Characters page.';
    return false;
  },
  xferInGo: function () {
    var I = ui.xferIn;
    if (!I || !I.b) return;
    var got = xferTake(I.b);
    ui.xferIn = null;
    ui.importError = false;
    ui.section = 'roster';
    ui.xferDone =
      got.length + ' character' + (got.length === 1 ? '' : 's') + ' added or updated: ' + got.join(', ') + '.';
  },
  xferInNo: function () {
    ui.xferIn = null;
  },
  giveMagic: function (v, el) {
    var x = allMagic().filter(function (i) {
        return i[0] === v;
      })[0],
      c = byId(byId(ui.miTo) ? ui.miTo : store.current);
    if (!x || !c) return;
    c.items.push({
      id: R.uid(),
      k: 'magic',
      n: x[0],
      r: el.getAttribute('data-r'),
      type: x[2],
      att: !!x[3],
      attuned: false,
      slug: x[4],
      qty: 1,
      w: 0,
      note: ''
    });
    ui.itemMsg = x[0] + ' added to ' + title(c) + '’s items.';
  },
  clearItemTextsAsk: function () {
    ui.confirmClearItems = true;
  },
  clearItemTextsNo: function () {
    ui.confirmClearItems = false;
  },
  clearItemTexts: function () {
    ui.confirmClearItems = false;
    ItemTexts.clear().then(function () {
      ui.itemMsg = 'Imported item texts removed.';
      render();
    });
  },
  itemOpen: function (v) {
    ui.itemOpen = ui.itemOpen || {};
    ui.itemOpen[v] = !ui.itemOpen[v];
  },
  magicOpen: function (v) {
    ui.magicOpen = ui.magicOpen === v ? '' : v;
  },
  import5eClose: function () {
    ui.import5e = null;
    ui.import5eDone = null;
  },
  ddbOpen: function () {
    ui.ddb = ui.ddb || { v: '', msg: '' };
    ui.importError = false;
  },
  ddbClose: function () {
    ui.ddb = null;
  },
  ddbGo: function () {
    var B = ui.ddb;
    if (!B || B.busy) return false;
    var v = String(B.v || '').trim(),
      fail = function (m, manual) {
        B.busy = false;
        B.msg = m;
        B.manual = !!manual;
        render();
      };
    var take = function (o) {
      if (o && o.success === false)
        return fail(
          'D&D Beyond says this character is private or doesn’t exist. Set it to Public in its character settings and try again.'
        );
      var entries = window.ImportDDB.read(o);
      if (!entries.length) return fail('That isn’t a D&D Beyond character.', true);
      B.busy = false;
      ui.ddb = null;
      startImport(entries);
      render();
    };
    if (/^\s*\{/.test(v)) {
      try {
        take(JSON.parse(v));
      } catch (e) {
        fail('That text isn’t complete: copy everything on the data page and paste it again.', true);
      }
      return false;
    }
    var id = window.ImportDDB.idFrom(v);
    if (!id) {
      B.msg = 'Paste the character’s address from D&D Beyond, like https://www.dndbeyond.com/characters/12345678.';
      return;
    }
    B.busy = true;
    B.msg = '';
    var get = function (u) {
      return fetch(u).then(function (r) {
        if (r.status === 403 || r.status === 404) return { success: false };
        if (!r.ok) throw new Error(r.status);
        return r.json();
      });
    };
    // straight from D&D Beyond, else through this app's own server (node server.js), else the copy-and-paste way
    get(window.ImportDDB.url(id))
      .catch(function () {
        return get('api/ddb/' + id);
      })
      .then(take, function () {
        fail('Your browser can’t fetch D&D Beyond from here.', true);
      });
  },
  import5eAll: function () {
    var I = ui.import5e;
    if (I)
      I.pick =
        I.pick.length === I.entries.length
          ? []
          : I.entries.map(function (e) {
              return e.id;
            });
  },
  import5eGo: function () {
    var I = ui.import5e;
    if (!I || !I.pick.length) return false;
    var done = [],
      first = null,
      pics = [];
    I.entries
      .filter(function (e) {
        return I.pick.indexOf(e.id) >= 0;
      })
      .forEach(function (e) {
        var tg = I.target[e.id] || 'new',
          old = tg !== 'new' && byId(tg);
        if (old) {
          var parts = I.parts[e.id] || [];
          if (!parts.length) return;
          var m = mergeParts(old, e, parts),
            c2 = m.ch;
          store.chars[store.chars.indexOf(old)] = c2;
          if (!first) first = c2.id;
          if (m.picture) pics.push([c2.id, m.picture]);
          done.push({ name: title(c2), update: true, parts: m.parts, spellNote: m.spellNote });
        } else {
          var r = importerOf(e).toCharacter(e, R, D),
            c = normalize(r.ch);
          c.id = R.uid();
          store.chars.push(c);
          if (!first) first = c.id;
          if (r.picture) pics.push([c.id, r.picture]);
          done.push({ name: c.name, added: r.added, skipped: r.skipped.length });
        }
      });
    done.source = I.source;
    ui.section = 'chars';
    if (!done.length) return false;
    store.current = first;
    ui.step =
      done.length === 1 && done[0].update && done[0].parts.length === 1 && done[0].parts[0] === 'spells'
        ? 'spells'
        : 'sheet';
    ui.import5e = null;
    ui.import5eDone = done;
    window.scrollTo(0, 0);
    // pictures from 5e Companion: shrink them like any added picture, then show them
    pics.forEach(function (p) {
      shrinkPicture(p[1], function (data) {
        var c = byId(p[0]);
        if (c && data) {
          c.picture = data;
          render();
        }
      });
    });
  },
  lineage: function (v) {
    var l = R.lineage(v);
    ch.lineage = v;
    ch.sub = 0;
    clearPicks('lin');
    ch.version = 0;
    for (var i = 0; i < l.versions.length; i++)
      if (ok(l.versions[i].tag || l.tag)) {
        ch.version = i;
        break;
      }
  },
  version: function (v) {
    ch.version = +v;
    ch.sub = 0;
    clearPicks('lin');
  },
  sub: function (v) {
    ch.sub = +v;
    clearPicks('lin');
  },
  flex: function (v) {
    ch.flexMode = v;
  },
  cls: function (v) {
    var cur = ch.classes[0];
    if (cur && cur.cls === v) return;
    if (!cur) ch.classes = [{ cls: v, level: 1, subclass: '' }];
    else {
      clearClass(cur.cls);
      ch.classes[0] = { cls: v, level: cur.level, subclass: '' };
    }
    ch.eq = {};
    ui.clsTab = v;
    if (ch.method === 'array') placeArray();
  },
  rmClass: function (v) {
    clearClass(v);
    ch.classes = ch.classes.filter(function (e) {
      return e.cls !== v;
    });
    ch.eq = {};
  },
  clsTab: function (v) {
    ui.clsTab = v;
    ui.q.subclass = '';
  },
  casterTab: function (v) {
    ui.casterTab = v;
    ui.q.spells = '';
  },
  subclass: function (v, el) {
    var e = entry(el.getAttribute('data-c'));
    if (!e) return;
    e.subclass = e.subclass === v ? '' : v;
    clearPicks('sc.' + e.cls + '.');
  },
  background: function (v) {
    ch.background = v;
    clearPicks('bg');
  },
  method: function (v) {
    ch.method = v;
    if (v === 'array') placeArray();
    if (v === 'pointbuy')
      AB.forEach(function (a) {
        ch.base[a] = 8;
      });
  },
  pb: function (v, el) {
    var a = el.getAttribute('data-a'),
      n = ch.base[a] + +v;
    if (n < 8 || n > 15) return;
    var cost = D.pointBuyCost[n] - D.pointBuyCost[ch.base[a]];
    if (d.pointsSpent + cost > 27) return;
    ch.base[a] = n;
  },
  roll: function () {
    AB.forEach(function (a) {
      var r = [0, 0, 0, 0]
        .map(function () {
          return 1 + Math.floor(Math.random() * 6);
        })
        .sort();
      ch.base[a] = r[1] + r[2] + r[3];
    });
  },
  hp: function (v) {
    ch.hpMode = v;
    if (v === 'manual' && !ch.hpManual) ch.hpManual = d.hpAvg;
  },
  asimode: function (v, el) {
    ch.asi[el.getAttribute('data-slot')] = v;
  },
  saveNote: function () {
    var N = ch.notes;
    if (!String(N.session || '').trim() && !String(N.draftTitle || '').trim()) return;
    ch.journal = (ch.journal || []).concat([
      {
        id: 'n' + Date.now().toString(36),
        t: String(N.draftTitle || '').trim() || String(N.session).trim().split('\n')[0].slice(0, 40),
        c: String(N.draftCat || '').trim() || 'Other',
        x: N.session || '',
        at: new Date().toISOString().slice(0, 10)
      }
    ]);
    N.session = '';
    N.draftTitle = '';
    N.draftCat = '';
    ui.noteCat = '';
  },
  noteStyle: function (v, el) {
    ch.noteStyle = Object.assign({}, ch.noteStyle);
    ch.noteStyle[el.getAttribute('data-k')] = v;
  },
  noteCat: function (v) {
    ui.noteCat = v;
  },
  draftCat: function (v) {
    ch.notes.draftCat = v;
  },
  noteOpen: function (v) {
    ui.noteOpen = ui.noteOpen === v ? null : v;
  },
  rmNote: function (v) {
    ch.journal = (ch.journal || []).filter(function (n) {
      return n.id !== v;
    });
  },
  hubDice: function () {
    Dice3D.open();
    return false;
  },
  monSound: function (v) {
    Sounds.play(v);
    return false;
  }, // just the sound, no redraw
  mySpellsFrom: function (v) {
    ui.mySpellsFrom = v;
  },
  optLv: function (v, el) {
    ui.q[el.getAttribute('data-key') + ':lv'] = v;
  },
  pick: function (v, el) {
    var key = el.getAttribute('data-key'),
      c = d.choices.filter(function (x) {
        return x.key === key;
      })[0];
    if (!c) return;
    var cur = c.picked.slice(),
      i = cur.indexOf(v);
    if (i >= 0) cur.splice(i, 1);
    else if (c.count === 1 && !c.multi) cur = [v];
    else cur.push(v); // going over the usual number only warns
    ch.picks[key] = cur;
  },
  trackAdj: function (v, el) {
    var k = el.getAttribute('data-k'),
      T = (ch.track = ch.track || {}),
      used = (T.used = T.used || {});
    if (k === 'hd') {
      T.hd = Math.max(0, Math.min(d.level, (+T.hd || 0) + +v));
      return;
    }
    var x = trk(k);
    if (!x) return;
    used[k] = Math.max(0, Math.min(x.max, x.used + +v));
    if (!used[k]) delete used[k];
    ui.restMsg = '';
  },
  hpAdj: function (v) {
    var T = (ch.track = ch.track || {}),
      hp = T.hp == null ? d.hp : T.hp,
      n = +v;
    ui.hdMsg = '';
    if (n < 0 && T.conc) {
      var nowT = Date.now();
      ui.concDmg = (nowT - (ui.concAt || 0) < 4000 ? ui.concDmg || 0 : 0) - n;
      ui.concAt = nowT;
      ui.concMsg = '';
    } // taps a few seconds apart are one hit
    if (n < 0 && T.temp > 0) {
      var soak = Math.min(T.temp, -n);
      T.temp -= soak;
      n += soak;
    } // temporary hit points go first
    hp = Math.max(0, Math.min(d.hp, hp + n));
    T.hp = hp >= d.hp ? null : hp;
    if (hp > 0) {
      T.deathOk = 0;
      T.deathFail = 0;
    } else if (T.conc) {
      ui.concMsg = T.conc + ' ended: you dropped to 0 hit points.';
      T.conc = '';
      ui.concDmg = 0;
    }
  },
  inspToggle: function (v) {
    var T = (ch.track = ch.track || {});
    ui.bardRoll = '';
    if (v === 'insp') T.insp = !T.insp;
    else T.bardic = T.bardic ? '' : T.bardDie || 'd6';
  },
  rollBardic: function () {
    var T = ch.track || {},
      n = parseInt(String(T.bardic || 'd6').slice(1), 10) || 6,
      r = 1 + Math.floor(Math.random() * n);
    ui.bardRoll = 'Bardic Inspiration ' + T.bardic + ': ' + r + '. Add it to your roll.';
    T.bardic = '';
  },
  tblHintOk: function () {
    ui.tblHint = '';
  },
  spendHD: function (v) {
    var T = (ch.track = ch.track || {}),
      used = +T.hd || 0;
    if (used >= d.level) return;
    var r = 1 + Math.floor(Math.random() * +v),
      con = d.abilities.CON.mod,
      heal = Math.max(0, r + con),
      hp = T.hp == null ? d.hp : T.hp,
      nhp = Math.min(d.hp, hp + heal);
    T.hd = used + 1;
    T.hp = nhp >= d.hp ? null : nhp;
    if (nhp > 0) {
      T.deathOk = 0;
      T.deathFail = 0;
    }
    ui.hdMsg =
      'd' +
      v +
      ': ' +
      r +
      ' ' +
      (con < 0 ? '− ' + -con : '+ ' + con) +
      ' = ' +
      heal +
      ' hit points → ' +
      nhp +
      '/' +
      d.hp +
      '. ' +
      (d.level - used - 1) +
      ' hit dice left.';
  },
  wsStart: function (v) {
    var m = MON.find(v);
    if (!m) return;
    var T = (ch.track = ch.track || {});
    T.ws = { id: v, hp: +m.hp || 1 };
    var w = trk('res:Wild Shape');
    if (w && w.left > 0) {
      T.used = T.used || {};
      T.used[w.key] = w.used + 1;
    }
    ui.q.ws = '';
  },
  wsEnd: function () {
    var T = (ch.track = ch.track || {});
    T.ws = null;
  },
  crHp: function (v, el) {
    var dlt = +el.getAttribute('data-d'),
      T = (ch.track = ch.track || {});
    if (v === 'ws') {
      var m = T.ws && MON.find(T.ws.id);
      if (!m) return;
      var nh = T.ws.hp + dlt;
      if (nh <= 0) {
        T.ws = null;
        if (nh < 0) actions.hpAdj(String(nh));
        ui.hdMsg =
          'You revert to your normal form' + (nh < 0 ? ' and take ' + -nh + ' damage that carried over.' : '.');
      } else T.ws.hp = Math.min(+m.hp, nh);
      return;
    }
    var c = (ch.companions || []).filter(function (x) {
      return 'c:' + x.id === v;
    })[0];
    if (c) c.hp = Math.max(0, Math.min(c.max, c.hp + dlt));
  },
  compAdd: function (v) {
    var m = MON.find(v);
    if (!m) return;
    ch.companions = (ch.companions || []).concat([{ id: R.uid(), mon: v, n: m.n, hp: +m.hp || 1, max: +m.hp || 1 }]);
    ui.q.comp = '';
  },
  // a shortcut on the sheet: scroll to that part
  jump: function (v) {
    var el = document.getElementById(v);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return false;
  },
  compCustom: function () {
    var N = ui.compNew || {},
      n = String(N.n || '').trim(),
      hp = Math.max(0, Math.round(+N.hp) || 0);
    if (!n) return false;
    ch.companions = (ch.companions || []).concat([
      { id: R.uid(), n: n, kind: String(N.k || '').trim(), hp: hp, max: hp }
    ]);
    ui.compNew = { n: '', k: '', hp: '' };
  },
  compRm: function (v) {
    ch.companions = (ch.companions || []).filter(function (c) {
      return c.id !== v;
    });
  },
  compOpen: function (v) {
    ui.compOpen = ui.compOpen || {};
    ui.compOpen[v] = !ui.compOpen[v];
  },
  concEnd: function () {
    var T = (ch.track = ch.track || {});
    T.conc = '';
    ui.concDmg = 0;
    ui.concMsg = '';
  },
  concCheck: function () {
    var T = ch.track || {},
      el = document.getElementById('conc-mine'),
      tot = parseInt(el && el.value, 10),
      dc = Math.max(10, Math.floor((ui.concDmg || 0) / 2));
    if (isNaN(tot)) return false;
    var ok = tot >= dc;
    ui.concMsg = tot + ' vs DC ' + dc + ': ' + (ok ? 'you keep concentrating on ' + T.conc + '.' : T.conc + ' ends.');
    if (!ok) T.conc = '';
    ui.concDmg = 0;
  },
  spendHDMine: function () {
    var el = document.getElementById('hd-mine'),
      r = parseInt(el && el.value, 10),
      T = (ch.track = ch.track || {}),
      used = +T.hd || 0;
    if (isNaN(r) || used >= d.level) return false;
    var con = d.abilities.CON.mod,
      heal = Math.max(0, r + con),
      hp = T.hp == null ? d.hp : T.hp,
      nhp = Math.min(d.hp, hp + heal);
    T.hd = used + 1;
    T.hp = nhp >= d.hp ? null : nhp;
    ui.hdMsg =
      r +
      ' ' +
      (con < 0 ? '− ' + -con : '+ ' + con) +
      ' = ' +
      heal +
      ' hit points → ' +
      nhp +
      '/' +
      d.hp +
      '. ' +
      (d.level - used - 1) +
      ' hit dice left.';
  },
  concRoll: function () {
    var T = ch.track || {},
      dc = Math.max(10, Math.floor((ui.concDmg || 0) / 2)),
      b = d.saves.CON.total,
      war = JSON.stringify(ch.picks || {}).indexOf('War Caster') >= 0;
    var r1 = 1 + Math.floor(Math.random() * 20),
      r2 = 1 + Math.floor(Math.random() * 20),
      r = war ? Math.max(r1, r2) : r1,
      tot = r + b,
      ok = tot >= dc;
    ui.concMsg =
      (war ? 'Rolled ' + r1 + ' and ' + r2 + ', kept ' + r : 'Rolled ' + r) +
      ' ' +
      R.fmt(b) +
      ' = ' +
      tot +
      ' vs DC ' +
      dc +
      ': ' +
      (ok ? 'you keep concentrating on ' + T.conc + '.' : T.conc + ' ends.');
    if (!ok) T.conc = '';
    ui.concDmg = 0;
  },
  condOpen: function () {
    ui.condOpen = !ui.condOpen;
  },
  condToggle: function (v) {
    var T = (ch.track = ch.track || {}),
      c = (T.conds = T.conds || {});
    if (c[v]) delete c[v];
    else {
      c[v] = 1;
      if (/Incapacitated|Paralyzed|Petrified|Stunned|Unconscious/.test(v) && T.conc) {
        ui.concMsg = T.conc + ' ended (' + v.toLowerCase() + ').';
        T.conc = '';
      }
    }
  },
  exh: function (v) {
    var T = (ch.track = ch.track || {});
    T.exh = Math.max(0, Math.min(6, (+T.exh || 0) + +v));
  },
  death: function (v, el) {
    var T = (ch.track = ch.track || {});
    T[el.getAttribute('data-k')] = +v;
  },
  rest: function (v) {
    if (ui.confirmRest !== v) {
      ui.confirmRest = v;
      ui.restMsg = '';
      return;
    }
    ui.confirmRest = null;
    var got = R.rest(ch, d, v);
    ui.restMsg =
      (v === 'long' ? 'Long rest' : 'Short rest') +
      ': ' +
      (got.length ? 'got back ' + got.join(', ') + '.' : 'nothing was used.');
  },
  ruleAdd: function () {
    var r = { id: R.uid(), t: '', x: '' };
    houseRules().unshift(r);
    ui.editRule = r.id;
  },
  ruleEdit: function (v) {
    ui.editRule = v;
  },
  ruleDone: function () {
    ui.editRule = null;
  },
  ruleRm: function (v) {
    var l = houseRules();
    l.splice(
      l
        .map(function (r) {
          return r.id;
        })
        .indexOf(v),
      1
    );
    ui.editRule = null;
  },
  restCancel: function () {
    ui.confirmRest = null;
  },
  spellFold: function (v) {
    ui.spellOpen = ui.spellOpen || {};
    ui.spellOpen[v] = !ui.spellOpen[v];
  },
  quickItem: function (v) {
    var it = ch.items.filter(function (i) {
      return i.id === v;
    })[0];
    if (it) it.quick = !it.quick;
  },
  addCounter: function () {
    ch.counters = ch.counters || [];
    ch.counters.push({ id: R.uid(), n: 'New counter', max: 1, rest: 'long' });
  },
  rmCounter: function (v) {
    ch.counters = (ch.counters || []).filter(function (c) {
      return c.id !== v;
    });
    if (ch.track && ch.track.used) delete ch.track.used['ctr:' + v];
  },
  mySpellsView: function (v) {
    ui.mySpellsView = v;
  },
  addExtraSpell: function (v) {
    ch.extraSpells = ch.extraSpells || [];
    if (
      !ch.extraSpells.some(function (x) {
        return x.n === v;
      })
    )
      ch.extraSpells.push({ id: R.uid(), n: v, src: '', per: '' });
    ui.q.extraspell = '';
  },
  rmExtraSpell: function (v) {
    ch.extraSpells = (ch.extraSpells || []).filter(function (x) {
      return x.id !== v;
    });
  },
  spellLevel: function (v) {
    ui.spellLevel = +v;
    ui.q.spells = '';
  },
  spell: function (v, el) {
    var b = el.getAttribute('data-b'),
      id = el.getAttribute('data-c'),
      S = d.casters.filter(function (x) {
        return x.clsId === id;
      })[0];
    if (!S) return;
    var cur = (b === 'c' ? S.cantrips : b === 'k' ? S.known : S.prepared).slice(),
      max = b === 'c' ? S.cantripsMax : b === 'k' ? S.knownMax : S.preparedMax;
    var i = cur.indexOf(v);
    if (i >= 0) cur.splice(i, 1);
    else if (cur.length < max) cur.push(v);
    else return;
    // keep the other lists as currently valid, so stale picks never linger
    ch.spells[id] = { c: S.cantrips, k: S.known, p: S.prepared };
    ch.spells[id][b] = cur;
  },
  itemTab: function (v) {
    ui.itemTab = v;
  },
  addMagic: function (v, el) {
    var x = allMagic().filter(function (i) {
      return i[0] === v;
    })[0];
    if (x)
      ch.items.push({
        id: R.uid(),
        k: 'magic',
        n: x[0],
        r: el.getAttribute('data-r'),
        type: x[2],
        att: !!x[3],
        attuned: false,
        slug: x[4],
        qty: 1,
        w: 0,
        note: ''
      });
  },
  addGear: function (v) {
    if (D.packContents && D.packContents[v]) {
      addPack(v);
      return;
    }
    addGearItem(v, 1);
  },
  addStartPack: function (v) {
    addPack(v);
  },
  packAddedClose: function () {
    ui.packAdded = null;
  },
  addCustom: function () {
    var g = function (id) {
        return document.getElementById(id);
      },
      n = g('custom-n').value.trim();
    if (!n) {
      g('custom-n').focus();
      return false;
    }
    ch.items.push({
      id: R.uid(),
      k: 'custom',
      n: n,
      qty: Math.max(1, +g('custom-q').value || 1),
      w: Math.max(0, +g('custom-w').value || 0),
      att: g('custom-a').checked,
      attuned: false,
      note: ''
    });
  },
  rmItem: function (v) {
    ch.items = ch.items.filter(function (i) {
      return i.id !== v;
    });
  },
  eq: function (v, el) {
    ch.eq[el.getAttribute('data-i')] = +v;
  },
  look: function (v, el) {
    ch.look = ch.look || {};
    ch.look[el.getAttribute('data-k')] = v;
  },
  importPart: function (v, el) {
    var f = document.getElementById('partImportFile');
    if (f) {
      f.setAttribute('data-step', el.getAttribute('data-step'));
      f.click();
    }
    return false;
  },
  partImportGo: function () {
    var I = ui.partImport;
    if (!I) return false;
    var e = I.entries.filter(function (x) {
      return x.id === I.choose;
    })[0];
    if (!e) return false;
    try {
      applyPartImport(I.step, e);
    } catch (err) {
      ui.partImportError = { step: I.step, msg: err.message };
    }
  },
  partImportCancel: function () {
    ui.partImport = null;
  },
  partImportClose: function () {
    ui.partImportDone = null;
  },
  undo: function () {
    return undo();
  },
  theme: function () {
    var t = { auto: 'light', light: 'dark', dark: 'auto' }[themeNow()];
    try {
      localStorage.setItem('cf-theme', t);
    } catch (e) {
      /* storage off */
    }
    applyTheme(t);
  },
  redo: function () {
    return redo();
  },
  picEdit: function () {
    ui.picEdit = true;
  },
  picDone: function () {
    ui.picEdit = false;
  },
  picReset: function () {
    delete ch.pictureView;
  },
  picRotate: function (v) {
    ch.pictureView = Object.assign({}, ch.pictureView);
    ch.pictureView.rot = ((((+ch.pictureView.rot || 0) + +v) % 360) + 360) % 360;
  },
  pickPicture: function () {
    var f = document.getElementById('pictureFile');
    if (f) f.click();
    return false;
  },
  removePicture: function () {
    delete ch.picture;
    delete ch.pictureFit;
    delete ch.pictureView;
    ui.picEdit = false;
    ui.pictureError = '';
  },
  lookRandom: function () {
    ch.look = Object.assign({ hidden: (ch.look || {}).hidden || {} }, Avatar.random());
  },
  lookReset: function () {
    ch.look = { hidden: (ch.look || {}).hidden || {} };
  },
  addArmor: function () {
    ch.customArmor = ch.customArmor || [];
    var a = { id: R.uid(), n: 'My armor', kind: 'Light', ac: 11, dex: 'full', bonus: 0, str: 0, w: 0 };
    ch.customArmor.push(a);
    ch.armor = 'custom:' + a.id;
    ui.editArmor = a.id;
    ui.editWeapon = null;
  },
  editArmor: function (v) {
    ui.editArmor = v;
    ui.editWeapon = null;
  },
  editCWeapon: function (v) {
    ui.editWeapon = v;
    ui.editArmor = null;
  },
  saveCustom: function () {
    ui.editArmor = null;
    ui.editWeapon = null;
  },
  wearArmor: function (v) {
    ch.armor = 'custom:' + v;
  },
  rmArmor: function (v) {
    ch.customArmor = (ch.customArmor || []).filter(function (a) {
      return a.id !== v;
    });
    if (ch.armor === 'custom:' + v) ch.armor = '';
  },
  addCWeapon: function () {
    ch.customWeapons = ch.customWeapons || [];
    var nw = { id: R.uid() };
    ui.editWeapon = nw.id;
    ui.editArmor = null;
    ch.customWeapons.push(
      Object.assign(nw, {
        n: 'My weapon',
        dmg: '1d8',
        type: 'Slashing',
        ranged: false,
        ability: 'auto',
        prof: true,
        hit: 0,
        dmgBonus: 0,
        props: '',
        w: 0
      })
    );
  },
  rmCWeapon: function (v) {
    ch.customWeapons = (ch.customWeapons || []).filter(function (w) {
      return w.id !== v;
    });
  },
  rmWeapon: function (v) {
    ch.weapons = ch.weapons.filter(function (w) {
      return w !== v;
    });
  }
};
// Editing a field and then clicking a button fires "change" in the middle of the click. Redrawing right
// then would replace the button under the pointer and swallow the click, so the redraw waits for it.
document.addEventListener('keydown', function (e) {
  if (e.key === 'Enter' && e.target.id === 'quick-item') {
    var m = /^(\d+)\s*x?\s+(.+)$/i.exec(e.target.value.trim()),
      name = m ? m[2] : e.target.value.trim();
    if (name) {
      ch.items.push({
        id: R.uid(),
        k: 'custom',
        n: name,
        qty: m ? +m[1] : 1,
        w: 0,
        att: false,
        attuned: false,
        note: ''
      });
      e.target.value = '';
      render();
    }
    return;
  }
  if (!(e.ctrlKey || e.metaKey) || e.altKey) return;
  var t = e.target,
    typing =
      t &&
      (t.tagName === 'TEXTAREA' ||
        (t.tagName === 'INPUT' && /^(text|search|number|email|url)$/.test(t.type)) ||
        t.isContentEditable);
  if (typing) return;
  var k = e.key.toLowerCase(),
    r = null;
  if (k === 'z' && !e.shiftKey) r = undo();
  else if (k === 'y' || (k === 'z' && e.shiftKey)) r = redo();
  else return;
  e.preventDefault();
  if (r !== false) render();
});
