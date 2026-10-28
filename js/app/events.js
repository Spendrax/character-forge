// Installing the app, and the page events: taps, typing and changes, routed to the right section.
// Part of the app: these files share one scope (see “How the code is organized” in README.md), loaded in order by index.html.
'use strict';

// The browser offers installing the site as an app; show our own button for it in the top bar.
var installPrompt = null;
function isInstalledApp() {
  try {
    return (
      navigator.standalone === true ||
      window.matchMedia('(display-mode: standalone)').matches ||
      window.matchMedia('(display-mode: window-controls-overlay)').matches
    );
  } catch (e) {
    return false;
  }
}
// Steps for browsers that install from their own menu instead of letting the page ask.
function installSteps() {
  var ua = navigator.userAgent || '',
    ios = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  var android = /Android/.test(ua),
    firefox = /Firefox|FxiOS/.test(ua),
    samsung = /SamsungBrowser/.test(ua),
    edge = /Edg\//.test(ua),
    opera = /OPR\//.test(ua);
  var safari = /Safari/.test(ua) && !/Chrome|Chromium|CriOS|FxiOS|EdgiOS|Edg\//.test(ua);
  if (!/^https?:$/.test(location.protocol) || window.self !== window.top)
    return {
      name: 'this page',
      steps: [
        "Open the site itself (https://spendrax.github.io/character-forge/) in your browser, then press Install app there. A preview or a file opened from your computer can't be installed."
      ]
    };
  if (ios)
    return {
      name: 'iPhone and iPad',
      steps: [
        'Tap the Share button (the square with an arrow). In Safari it is at the bottom or top of the screen; in Chrome, Edge or Firefox it is in the address bar or the menu.',
        'Scroll down and tap Add to Home Screen.',
        'Make sure Open as Web App is on, if you see it, then tap Add.'
      ]
    };
  if (samsung)
    return {
      name: 'Samsung Internet',
      steps: [
        "Use a normal tab: a Secret mode tab can't install apps.",
        'If the address bar shows an install icon (a + or a down arrow), tap it, then Install.',
        'Otherwise tap the menu (☰) at the bottom, then Add page to, then Home screen, then Add.'
      ]
    };
  if (android && firefox)
    return {
      name: 'Firefox for Android',
      steps: ['Tap the menu (⋮).', 'Tap Add app to Home screen (on some versions: Install, or Add to Home screen).']
    };
  if (android)
    return {
      name: 'your Android browser',
      steps: ['Open the browser menu (⋮).', 'Tap Install app or Add to Home screen.']
    };
  if (safari)
    return {
      name: 'Safari on Mac',
      steps: [
        'In the menu bar, choose File, then Add to Dock (needs macOS Sonoma or newer).',
        'On older macOS, open the site in Chrome or Edge to install it.'
      ]
    };
  if (firefox)
    return {
      name: 'Firefox on a computer',
      steps: [
        "Firefox on computers usually can't install websites as apps (newer versions on Windows may show an install or taskbar icon in the address bar). Otherwise open the site in Chrome or Edge to install it, or bookmark it here: it works the same in a tab, including offline after the first visit."
      ]
    };
  if (edge)
    return {
      name: 'Edge',
      steps: [
        'Open the menu (…), then Apps, then Install this site as an app.',
        'If Install is missing, the app may already be installed: look for it in edge://apps.'
      ]
    };
  if (opera)
    return {
      name: 'Opera',
      steps: ["Opera on computers can't install websites as apps. Open the site in Chrome or Edge to install it."]
    };
  return {
    name: 'Chrome',
    steps: [
      'Click the install icon at the right end of the address bar, or open the menu (⋮), then Cast, save and share, then Install page as app.',
      'If Install is missing, the app may already be installed: look for it in chrome://apps.'
    ]
  };
}
function installHelpHtml() {
  if (!ui.installHelp) return '';
  var s = installSteps();
  return (
    '<div class="panel install-help noprint" role="dialog" aria-label="How to install"><h3>Install Character Forge on ' +
    esc(s.name) +
    '</h3><ol>' +
    s.steps
      .map(function (x) {
        return '<li>' + esc(x) + '</li>';
      })
      .join('') +
    '</ol>' +
    '<p class="small muted">Once installed it opens in its own window with the Character Forge icon, works offline, and updates itself when you are online.</p>' +
    btn('closeInstallHelp', 'Close') +
    '</div>'
  );
}
window.addEventListener('beforeinstallprompt', function (e) {
  e.preventDefault();
  installPrompt = e;
  requestRender();
});
window.addEventListener('appinstalled', function () {
  installPrompt = null;
  requestRender();
});
var pointerDown = false,
  pending = false;
document.addEventListener(
  'pointerdown',
  function () {
    pointerDown = true;
  },
  true
);
document.addEventListener(
  'pointerup',
  function () {
    pointerDown = false;
    setTimeout(function () {
      if (pending) {
        pending = false;
        render();
      }
    }, 0);
  },
  true
);
document.addEventListener(
  'pointercancel',
  function () {
    pointerDown = false;
    if (pending) {
      pending = false;
      render();
    }
  },
  true
);
function requestRender() {
  if (pointerDown) pending = true;
  else render();
}
document.addEventListener('click', function (e) {
  var el = e.target.closest ? e.target.closest('[data-act]') : null;
  if (!el || el.disabled) return;
  var fn = actions[el.getAttribute('data-act')];
  if (pending) d = R.derive(ch, store.filters); // a field edit is waiting to be drawn: act on fresh numbers
  if (fn && fn(el.getAttribute('data-v'), el) !== false) {
    pending = false;
    render();
  }
});
document.addEventListener('input', function (e) {
  var t = e.target,
    a = function (n) {
      return t.getAttribute(n);
    };
  if (TP.onInput(t)) return;
  if (PT.onInput(t)) return;
  if (t.getAttribute('data-lvl')) return lvlInput(t, false);
  if (t.getAttribute('data-compnew')) {
    ui.compNew = ui.compNew || {};
    ui.compNew[t.getAttribute('data-compnew')] = t.value;
    return;
  }
  if (t.getAttribute('data-compnote')) {
    (ch.companions || []).forEach(function (c) {
      if (c.id === t.getAttribute('data-compnote')) c.note = t.value;
    });
    return save();
  }
  if (BKP.onInput(t)) return;
  if (SavedEnc.onInput(t)) return save();
  if (ui.section === 'books' || ui.section === 'mm-rules') {
    var bk = BOOKS.onInput(t);
    if (bk === 'render') render();
    if (bk) return;
  }
  if (paizoV()) {
    var pi = paizoV().onInput(t);
    if (pi === 'render') render();
    else if (pi) save();
    if (pi) return;
  }
  if (/^mm-(enc|party|foes|loot)$/.test(ui.section)) {
    var me = MME ? MME.onInput(t) : null;
    if (me === 'render') render();
    else if (me) save();
    if (me) return;
  }
  if (ui.section === 'sd-chars') {
    var si = SDV ? SDV.onInput(t) : null;
    if (si === 'render') render();
    else if (si === 'save') save();
    if (si) return;
  }
  if (ui.section === 'mm-heroes') {
    var mi = MMV ? MMV.onInput(t) : null;
    if (mi === 'render') render();
    else if (mi) save();
    if (mi) return;
  }
  if (t.getAttribute && t.getAttribute('data-ddb')) {
    if (ui.ddb) ui.ddb.v = t.value;
    return;
  }
  if (ui.section === 'audio') {
    var au = AUD.onInput(t);
    if (au === 'render') render();
    if (au) return;
  }
  if (ui.section === 'gen') {
    var gr = GEN.onInput(t);
    if (gr) {
      render();
      return;
    }
  }
  if (ui.section === 'dm') {
    var dr = DMV.onInput(t);
    if (dr === 'render') render();
    if (dr) return;
  }
  if (ui.section === 'treasure') {
    var tr = TRE.onInput(t);
    if (tr === 'render') render();
    else if (tr) save();
    if (tr) return;
  }
  if (ui.section === 'encounters' || ui.section === 'party') {
    var er = ENC.onInput(t);
    if (er === 'render') render();
    else if (er) save();
    if (er) return;
  }
  if (a('data-mon') != null || a('data-mymon') != null) {
    var mr = MON.onInput(t);
    if (mr === 'render') render();
    else save();
    return;
  }
  if (a('data-q') != null) {
    ui.q[a('data-q')] = t.value;
    render();
  } else if (a('data-piczoom')) {
    ch.pictureView = Object.assign({}, ch.pictureView, { zoom: +t.value });
    livePicture();
    save();
  } else if (a('data-trk')) {
    var TT = (ch.track = ch.track || {}),
      nv = Math.max(0, Math.round(+t.value) || 0);
    if (a('data-trk') === 'hp') TT.hp = nv >= d.hp ? null : nv;
    else TT.temp = nv;
    save();
  } else if (a('data-ctr') && t.tagName === 'INPUT') {
    var cx = (ch.counters || []).filter(function (c) {
      return c.id === a('data-ctr');
    })[0];
    if (cx) {
      cx[a('data-f')] = a('data-f') === 'max' ? Math.max(1, Math.min(99, Math.round(+t.value) || 1)) : t.value;
      save();
    }
  } else if (a('data-rule')) {
    var ru = houseRules().filter(function (r) {
      return r.id === a('data-rule');
    })[0];
    if (ru) {
      ru[a('data-f')] = t.value;
      save();
    }
  } else if (a('data-jnote')) {
    var jn = (ch.journal || []).filter(function (x) {
      return x.id === a('data-jnote');
    })[0];
    if (jn) {
      jn[a('data-f')] = t.value;
      save();
    }
  } else if (a('data-espell')) {
    var esx = (ch.extraSpells || []).filter(function (x) {
      return x.id === a('data-espell');
    })[0];
    if (esx) {
      esx[a('data-f')] = t.value;
      save();
    }
  } else if (a('data-itemdesc')) {
    var idc = ch.items.filter(function (i) {
      return i.id === a('data-itemdesc');
    })[0];
    if (idc) {
      idc.desc = t.value;
      save();
    }
  } else if (a('data-itemtext')) {
    var itx = ch.items.filter(function (i) {
      return i.id === a('data-itemtext');
    })[0];
    if (itx) {
      itx.note = t.value;
      save();
    }
  } else if ((a('data-carmor') || a('data-cweapon')) && t.tagName === 'INPUT' && t.type !== 'checkbox') {
    applyCustomField(t);
    save();
  } else if (a('data-text')) {
    var path = a('data-text').split('.');
    if (path.length > 1) ch[path[0]][path[1]] = t.value;
    else ch[path[0]] = t.value;
    save();
  } else if (t.type === 'range' && a('data-clslevel')) {
    setLevel(a('data-clslevel'), +t.value);
    render();
  }
});
document.addEventListener('change', function (e) {
  var t = e.target,
    a = function (n) {
      return t.getAttribute(n);
    };
  if (t.id === 'bookFile') return BOOKS.importFile(t);
  if (t.getAttribute && t.getAttribute('data-lvl')) return lvlInput(t, true);
  if (t.id === 'buFile') return BKP.readFile(t);
  if (BKP.onInput(t)) return render();
  if (t.getAttribute && t.getAttribute('data-tp')) return;
  if (TS.onChange(t)) {
    render();
    return;
  }
  if (t.getAttribute && t.getAttribute('data-magic') != null && ch) {
    ch.magic = ch.magic || {};
    var mv = +t.value || 0;
    if (mv) ch.magic[t.getAttribute('data-magic')] = mv;
    else delete ch.magic[t.getAttribute('data-magic')];
    render();
    return;
  }
  if (t.getAttribute && t.getAttribute('data-booston') != null && ch) {
    ch.boostOn = ch.boostOn || {};
    ch.boostOn[t.getAttribute('data-booston')] = t.value;
    render();
    return;
  }
  if (ui.section === 'books' || ui.section === 'mm-rules') {
    if (BOOKS.onChange(t)) {
      render();
      return;
    }
  }
  if (paizoV()) {
    var pc = paizoV().onChange(t);
    if (pc) {
      requestRender();
      return;
    }
  }
  if (/^mm-(enc|party|foes|loot)$/.test(ui.section)) {
    var mec = MME ? MME.onChange(t) : null;
    if (mec) {
      requestRender();
      return;
    }
  }
  if (ui.section === 'sd-chars') {
    var sc = SDV ? SDV.onChange(t) : null;
    if (sc === 'render') requestRender(); // after the tap that moved away from the field, so it isn't lost
    if (sc) return;
  }
  if (ui.section === 'mm-heroes') {
    var mc = MMV ? MMV.onChange(t) : null;
    if (mc) {
      requestRender();
      return;
    }
  } // wait for the tap that moved focus
  if (ui.section === 'encounters' || ui.section === 'party') {
    var ec = ENC.onChange(t);
    if (ec) {
      render();
      return;
    }
    if (a('data-enc') != null) return;
  }
  if (ui.section === 'dm') {
    var dc = DMV.onChange(t);
    if (dc === 'render') render();
    if (dc) return;
  }
  if (a('data-mon') != null) return;
  if (a('data-mymon') != null) {
    if (t.tagName === 'SELECT') return;
    return setTimeout(function () {
      var f = document.activeElement;
      if (!f || !f.getAttribute || f.getAttribute('data-mymon') == null) requestRender();
    }, 0);
  }
  if (t.id === 'importFile') return importFile(t);
  if (t.id === 'itemTextFile') return importItemTexts(t);
  if (t.id === 'monImportFile') return MON.importFile(t, render);
  if (t.id === 'pictureFile') return loadPicture(t);
  if (t.id === 'partImportFile') return loadPartImport(t);
  if (a('data-partfrom')) {
    if (ui.partImport) ui.partImport.choose = +a('data-partfrom');
    return;
  }
  if (a('data-check') === 'pictureWhole') {
    ch.pictureFit = t.checked ? 'contain' : '';
    return requestRender();
  }
  // fields edited one after another: redraw only once the focus has left that group, so nothing typed is lost
  if (a('data-ctr') && t.tagName === 'INPUT')
    return setTimeout(function () {
      var f = document.activeElement;
      if (!f || !f.getAttribute || !f.getAttribute('data-ctr')) requestRender();
    }, 0);
  if (a('data-text') || a('data-itemtext') || a('data-itemdesc') || a('data-espell') || a('data-trk'))
    return requestRender();
  if (a('data-ctr')) {
    var cs = (ch.counters || []).filter(function (c) {
      return c.id === a('data-ctr');
    })[0];
    if (cs) cs.rest = t.value;
    return requestRender();
  }
  if (a('data-ui')) {
    if (a('data-ui') === 'current') {
      store.current = t.value;
      ch = byId(t.value);
      openMode();
      ui.confirmDelete = false;
      ui.partImport = null;
      ui.partImportDone = null;
    } else ui[a('data-ui')] = t.value;
  } else if (a('data-filter')) store.filters[a('data-filter')] = t.checked;
  else if (a('data-imp5part')) {
    var IP = ui.import5e;
    if (IP) {
      var eid = +a('data-imp5part'),
        cur = (IP.parts[eid] || []).filter(function (k) {
          return k !== t.value;
        });
      if (t.checked) cur.push(t.value);
      IP.parts[eid] = cur;
    }
  } else if (a('data-imp5target')) {
    if (ui.import5e) {
      ui.import5e.target[a('data-imp5target')] = t.value;
      var idT = +a('data-imp5target');
      if (ui.import5e.pick.indexOf(idT) < 0) ui.import5e.pick.push(idT);
    }
  } else if (a('data-imp5')) {
    var I5 = ui.import5e,
      id5 = +a('data-imp5');
    if (I5) {
      I5.pick = I5.pick.filter(function (x) {
        return x !== id5;
      });
      if (t.checked) I5.pick.push(id5);
    }
  } else if (a('data-concpick')) {
    if (t.value) {
      var TC = (ch.track = ch.track || {});
      TC.conc = t.value;
      ui.concDmg = 0;
      ui.concMsg = '';
    }
  } else if (a('data-concdmg')) {
    ui.concDmg = Math.max(0, +t.value || 0);
    ui.concMsg = '';
  } else if (a('data-xfer')) {
    ui.xfer = ui.xfer || {};
    ui.xfer[a('data-xfer')] = t.checked;
    ui.xfer.link = '';
    ui.xfer.qr = '';
  } else if (a('data-bardie')) {
    var TB = (ch.track = ch.track || {});
    TB.bardDie = t.value;
    if (TB.bardic) TB.bardic = t.value;
  } else if (a('data-look')) {
    ch.look = ch.look || {};
    ch.look[a('data-look')] = t.value;
  } else if (a('data-lookcolor')) {
    ch.look = ch.look || {};
    ch.look[a('data-lookcolor')] = t.value;
  } else if (a('data-lookhide')) {
    ch.look = ch.look || {};
    ch.look.hidden = ch.look.hidden || {};
    if (t.checked) delete ch.look.hidden[a('data-lookhide')];
    else ch.look.hidden[a('data-lookhide')] = 1;
  } else if (a('data-setting')) store[a('data-setting')] = t.checked;
  else if (a('data-money')) ch.money[a('data-money')] = Math.max(0, Math.round(+t.value) || 0);
  else if (a('data-item')) {
    var it = ch.items.filter(function (i) {
      return i.id === a('data-item');
    })[0];
    if (it) it[a('data-f')] = Math.max(0, +t.value || 0);
  } else if (a('data-itemcheck')) {
    var ic = ch.items.filter(function (i) {
      return i.id === a('data-itemcheck');
    })[0];
    if (ic) ic.attuned = t.checked;
  } else if (a('data-clslevel')) setLevel(a('data-clslevel'), +t.value);
  else if (a('data-addclass')) {
    if (t.value && !entry(t.value) && d.level < 20) {
      ch.classes.push({ cls: t.value, level: 1, subclass: '' });
      ui.clsTab = t.value;
    }
  } else if (a('data-num')) ch[a('data-num')] = Math.max(1, Math.round(+t.value) || 1);
  else if (a('data-pick')) ch.picks[a('data-pick')] = t.value ? [t.value] : [];
  else if (a('data-set')) ch[a('data-set')] = t.value;
  else if (a('data-check')) ch[a('data-check')] = t.checked;
  else if (a('data-carmor') || a('data-cweapon')) {
    applyCustomField(t);
    if (t.tagName === 'INPUT' && t.type !== 'checkbox') {
      save();
      return;
    }
  } else if (a('data-piczoom')) {
    ch.pictureView = Object.assign({}, ch.pictureView, { zoom: +t.value });
  } else if (a('data-shieldbonus')) ch.shieldBonus = Math.round(+t.value) || 0;
  else if (a('data-free')) {
    ch.free = ch.free || {};
    if (t.checked) ch.free[a('data-free')] = true;
    else delete ch.free[a('data-free')];
  } else if (a('data-hpmanual')) {
    if (t.checked) {
      ch.hpMode = 'manual';
      if (!ch.hpManual) ch.hpManual = d.hpAvg;
    } else ch.hpMode = 'avg';
  } else if (a('data-extra')) {
    ch.extra = ch.extra || {};
    var xv = Math.round(+t.value) || 0;
    if (xv) ch.extra[a('data-extra')] = xv;
    else delete ch.extra[a('data-extra')];
  } else if (a('data-extratext')) {
    ch.extra = ch.extra || {};
    ch.extra[a('data-extratext')] = t.value.trim();
  } else if (a('data-skillbonus')) {
    ch.extra = ch.extra || {};
    var sb = (ch.extra.skillBonus = ch.extra.skillBonus || {});
    if (+t.value) sb[a('data-skillbonus')] = +t.value;
    else delete sb[a('data-skillbonus')];
  } else if (a('data-extraskill')) {
    ch.extra = ch.extra || {};
    ch.extra.skills = ch.extra.skills || {};
    if (t.value) ch.extra.skills[a('data-extraskill')] = t.value;
    else delete ch.extra.skills[a('data-extraskill')];
  } else if (a('data-extrasave')) {
    ch.extra = ch.extra || {};
    var sv = (ch.extra.saves || []).filter(function (x) {
      return x !== a('data-extrasave');
    });
    if (t.checked) sv.push(a('data-extrasave'));
    ch.extra.saves = sv;
  } else if (a('data-addweapon')) {
    if (t.value && ch.weapons.indexOf(t.value) < 0) ch.weapons.push(t.value);
  } else if (a('data-base')) {
    var ab = a('data-base'),
      v = Math.max(1, Math.min(ch.free && ch.free.abilityCap ? 30 : 20, Math.round(+t.value) || 8));
    if (ch.method === 'array') {
      var other = AB.filter(function (x) {
        return x !== ab && ch.base[x] === v;
      })[0];
      if (other) ch.base[other] = ch.base[ab];
    }
    ch.base[ab] = v;
  } else return;
  requestRender();
});
document.addEventListener('pointerdown', function (e) {
  var fr = e.target.closest && e.target.closest('.pic-frame.editing');
  if (!fr) return;
  e.preventDefault();
  try {
    fr.setPointerCapture(e.pointerId);
  } catch (er) {
    /* ignore */
  }
  picPtrs[e.pointerId] = { x: e.clientX, y: e.clientY };
  var ids = Object.keys(picPtrs),
    v = ch.pictureView || {};
  picStart = {
    v: { x: +v.x || 0, y: +v.y || 0, zoom: +v.zoom || 1, rot: +v.rot || 0 },
    size: fr.clientWidth,
    pts: ids.map(function (k) {
      return { x: picPtrs[k].x, y: picPtrs[k].y };
    })
  };
});
document.addEventListener('pointermove', function (e) {
  if (!picStart || !picPtrs[e.pointerId]) return;
  picPtrs[e.pointerId] = { x: e.clientX, y: e.clientY };
  var ids = Object.keys(picPtrs),
    now = ids.map(function (k) {
      return picPtrs[k];
    }),
    s0 = picStart,
    v = Object.assign({}, s0.v);
  var mid = function (pts) {
    return {
      x:
        pts.reduce(function (t, p) {
          return t + p.x;
        }, 0) / pts.length,
      y:
        pts.reduce(function (t, p) {
          return t + p.y;
        }, 0) / pts.length
    };
  };
  if (now.length !== s0.pts.length) {
    picStart.pts = now.map(function (p) {
      return { x: p.x, y: p.y };
    });
    picStart.v = Object.assign({}, ch.pictureView || v);
    return;
  }
  var a = mid(s0.pts),
    b = mid(now);
  v.x = s0.v.x + (b.x - a.x) / s0.size;
  v.y = s0.v.y + (b.y - a.y) / s0.size;
  if (now.length === 2) {
    var dist = function (p) {
      return Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y) || 1;
    };
    v.zoom = Math.max(0.5, Math.min(4, (s0.v.zoom * dist(now)) / dist(s0.pts)));
  }
  ch.pictureView = v;
  livePicture();
});
document.addEventListener('pointerup', picEnd);
document.addEventListener('pointercancel', picEnd);
document.addEventListener(
  'wheel',
  function (e) {
    var fr = e.target.closest && e.target.closest('.pic-frame.editing');
    if (!fr) return;
    e.preventDefault();
    var v = Object.assign({ zoom: 1 }, ch.pictureView);
    v.zoom = Math.max(0.5, Math.min(4, (+v.zoom || 1) * (e.deltaY < 0 ? 1.08 : 1 / 1.08)));
    ch.pictureView = v;
    livePicture();
    save();
  },
  { passive: false }
);
window.addEventListener('hashchange', checkTableLink);
window.addEventListener('hashchange', checkXferLink);
