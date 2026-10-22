// The page frame: drawing the page, the top bar and sections, phone back button, theme, home and house rules.
// Part of the app: these files share one scope (see “How the code is organized” in README.md), loaded in order by index.html.
'use strict';

// ---------- frame ----------
// On a phone the steps are a row you slide sideways: keep its position across redraws, and keep the
// current step visible instead of jumping back to "Lineage"
function keepStepInView(navX) {
  var nav = document.querySelector('.steps'),
    on = nav && nav.querySelector('.step.on');
  if (!nav || nav.scrollWidth <= nav.clientWidth) return;
  nav.scrollLeft = navX;
  if (on) {
    var l = on.offsetLeft - nav.offsetLeft,
      r = l + on.offsetWidth;
    if (l < nav.scrollLeft) nav.scrollLeft = Math.max(0, l - 12);
    else if (r > nav.scrollLeft + nav.clientWidth) nav.scrollLeft = r - nav.clientWidth + 12;
  }
}
// Every tap redraws the page. Remember where the page and each scrolling list were, and put them back,
// so selecting something never jumps you back to the top.
var SCROLLERS =
  '.mon-list, .optlist, .scroll, .tablewrap, .imp-list, .look-controls, textarea, .pf-plist, .pf-tabs, .mm-tabs';
function scrollState() {
  var lists = {},
    count = {};
  Array.prototype.forEach.call(document.querySelectorAll(SCROLLERS), function (el) {
    var k = scrollKey(el, count);
    if (el.scrollTop || el.scrollLeft) lists[k] = [el.scrollTop, el.scrollLeft];
  });
  return { y: window.pageYOffset, x: window.pageXOffset, lists: lists };
}
function scrollKey(el, count) {
  var host = el.closest('.choice, .panel, main') || document.body;
  var label = (host.querySelector('.choice-head span, h3, h2') || {}).textContent || '';
  var k = el.className + '|' + label;
  count[k] = (count[k] || 0) + 1;
  return k + '|' + count[k];
}
function restoreScroll(st) {
  var count = {};
  Array.prototype.forEach.call(document.querySelectorAll(SCROLLERS), function (el) {
    var v = st.lists[scrollKey(el, count)];
    if (v) {
      el.scrollTop = v[0];
      el.scrollLeft = v[1];
    }
  });
  if (window.pageYOffset !== st.y || window.pageXOffset !== st.x) window.scrollTo(st.x, st.y);
}
// A finished character opens on Play with only the play pages; the building steps come back with Edit or Level up.
var PLAY_STEPS = ['play', 'myspells', 'equipment', 'items', 'sheet', 'notes'];
function complete(c, dd) {
  return (
    !!(c.lineage && c.classes.length && c.background) &&
    !Object.keys(dd.todo).some(function (k) {
      return dd.todo[k];
    })
  );
}
function openMode() {
  ui.mode = complete(ch, R.derive(ch, store.filters)) ? 'play' : 'build';
  ui.step = ui.mode === 'play' ? 'play' : ui.step === 'play' ? 'lineage' : ui.step;
}
function visibleSteps() {
  if (ui.mode !== 'play') return STEPS;
  return [['play', 'Session']].concat(
    STEPS.filter(function (s) {
      return PLAY_STEPS.indexOf(s[0]) > 0 && (s[0] !== 'myspells' || d.casters.length || d.innate.length);
    })
  );
}
// Phone back button and back swipe: every page you move to is a step in the browser history,
// so Back returns to the previous page instead of leaving the app.
var navLast = null,
  navRestoring = false;
function navState() {
  return {
    g: gameOf(),
    s: ui.section,
    st: ui.step,
    m: ui.mode || '',
    c: store.current,
    mo: (ui.mon && ui.mon.open) || '',
    pf: /^pf2-/.test(ui.section) && PFV ? PFV.navPart() : null
  };
}
function syncHistory() {
  var st = navState(),
    k = JSON.stringify(st);
  if (k === navLast) return;
  try {
    if (navLast === null || navRestoring) window.history.replaceState(st, '');
    else window.history.pushState(st, '');
  } catch (e) {
    /* history unavailable */
  }
  navLast = k;
  navRestoring = false;
}
window.addEventListener('popstate', function (e) {
  var st = e.state;
  if (!st || !st.s) return;
  navRestoring = true;
  if (st.g) store.game = st.g;
  ui.section = st.s;
  ui.step = st.st;
  if (st.m) ui.mode = st.m;
  if (byId(st.c)) store.current = st.c;
  if (ui.mon) {
    ui.mon.open = st.mo;
    ui.mon.edit = '';
  }
  if (st.pf && PFV) PFV.restoreNav(st.pf);
  ui.scrollToStep = true;
  render();
  if (ui.section !== 'chars') window.scrollTo(0, 0);
});
function render() {
  if (!byId(store.current) && store.chars.length) store.current = store.chars[0].id;
  remember(); // record the change about to be drawn, so Undo is ready at once
  ch = byId(store.current);
  d = R.derive(ch, store.filters);
  var active = document.activeElement,
    fid = active && active.id,
    pos = null;
  try {
    pos = active && active.selectionStart;
  } catch (e) {
    pos = null;
  }
  if (ui.section !== 'chars') return renderSection(fid, pos);
  if (!ui.mode) openMode();
  if (
    ui.mode === 'play' &&
    !visibleSteps().some(function (x) {
      return x[0] === ui.step;
    })
  )
    ui.step = 'play';
  var body = {
    lineage: stepLineage,
    class: stepClass,
    abilities: stepAbilities,
    background: stepBackground,
    spells: stepSpells,
    myspells: stepMySpells,
    equipment: stepEquipment,
    items: stepItems,
    appearance: stepAppearance,
    details: stepDetails,
    sheet: stepSheet,
    notes: stepNotes,
    play: stepPlay
  }[ui.step]();
  if (ui.lvl && ui.lvl.id !== ch.id) ui.lvl = null;
  if (ui.lvl) body = stepLevelUp();
  else if (ui.lvlMsg) body = '<p class="panel rest-msg">⬆ ' + esc(ui.lvlMsg) + '</p>' + body;
  ui.lvlMsg = '';
  // a player's sheet sent from their phone to the DM's table: a copy, replaced when they connect again
  if (ch.fromTable)
    body =
      '<p class="panel small rest-msg">📱 ' +
      esc((ch.fromTable.player || 'A player') + '’s sheet, sent from their phone') +
      '. It is replaced each time they connect to your table, so changes made here don’t last.</p>' +
      body;
  var top =
    '<header class="top">' +
    btn('section', 'Character Forge', { v: 'home' }, 'brand linkish') +
    gameSwitch() +
    sectionNav() +
    '<select data-ui="current" aria-label="Character">' +
    store.chars
      .map(function (c) {
        return '<option value="' + c.id + '"' + (c.id === ch.id ? ' selected' : '') + '>' + esc(title(c)) + '</option>';
      })
      .join('') +
    '</select>' +
    themeBtn() +
    '<button type="button" class="btn" data-act="undo" title="Undo (Ctrl+Z)"' +
    (undoStack.length ? '' : ' disabled') +
    '>↶ Undo</button><button type="button" class="btn" data-act="redo" title="Redo (Ctrl+Y)"' +
    (redoStack.length ? '' : ' disabled') +
    '>↷ Redo</button>' +
    btn('new', 'New') +
    btn('dup', 'Duplicate') +
    btn('import', 'Import') +
    btn('export', 'Export') +
    (ui.confirmDelete
      ? btn('delete', 'Really delete?', {}, 'btn primary') + btn('cancelDelete', 'Cancel')
      : btn('askDelete', 'Delete', {}, 'btn danger')) +
    (ui.importError
      ? '<span class="count" style="color:var(--warn)">' +
        esc(
          ui.importError === true
            ? 'That file is not a Character Forge export, a 5th Spellbook backup or a 5e Companion character.'
            : ui.importError
        ) +
        '</span>'
      : '') +
    (isInstalledApp() ? '' : btn('install', 'Install app', {}, installPrompt ? 'btn primary' : 'btn')) +
    '<span class="spacer"></span><span class="filters"><b>Sources:</b>' +
    TAGS.map(function (t) {
      return (
        '<label><input type="checkbox" data-filter="' +
        t[0] +
        '"' +
        (store.filters[t[0]] !== false ? ' checked' : '') +
        '> ' +
        t[1] +
        '</label>'
      );
    }).join('') +
    '<label title="Longer feature text and spell descriptions"><input type="checkbox" data-setting="detail"' +
    (store.detail !== false ? ' checked' : '') +
    '> Detailed text</label></span><input type="file" id="importFile" hidden><input type="file" id="partImportFile" hidden></header>';
  var SHOWN = visibleSteps();
  var modeBar =
    ui.mode === 'play'
      ? ui.lvl
        ? ''
        : '<div class="toolbar mode-bar noprint">' +
          btn('levelUp', '⬆ Level up', {}, 'btn primary') +
          btn('editChar', '✎ Edit character') +
          '</div>'
      : complete(ch, d)
        ? '<div class="toolbar mode-bar noprint"><span class="small">This character is complete.</span>' +
          btn('donePlay', '✓ Done — go to Session', {}, 'btn primary') +
          '</div>'
        : '';
  body = modeBar + body;
  var nav =
    '<nav class="steps" aria-label="Steps">' +
    SHOWN.map(function (s) {
      var n = d.todo[s[0]],
        show = ['sheet', 'notes', 'details', 'equipment', 'items', 'appearance', 'myspells', 'play'].indexOf(s[0]) < 0;
      return (
        '<button type="button" class="step' +
        (ui.step === s[0] ? ' on' : '') +
        '" data-act="step" data-v="' +
        s[0] +
        '"><span>' +
        s[1] +
        '</span>' +
        (show
          ? n
            ? '<span class="badge" title="' + n + ' open">' + n + '</span>'
            : '<span class="badge done">✓</span>'
          : '') +
        '</button>'
      );
    }).join('') +
    '</nav>';
  var side =
    '<aside class="side">' +
    (ui.step !== 'appearance'
      ? '<div class="side-portrait" data-act="step" data-v="appearance" title="Edit appearance">' +
        (ch.picture ? pictureHtml('in-side') : avatarCanvas('side')) +
        '</div>'
      : '') +
    '<h4>' +
    esc(title(ch)) +
    '</h4><div class="muted">' +
    esc(summaryLine(ch, d)) +
    '</div><div class="stats">' +
    [
      ['AC', d.ac],
      ['HP', ch.track && ch.track.hp != null ? ch.track.hp + '/' + d.hp : d.hp],
      ['Speed', d.speed],
      ['Init', R.fmt(d.init)],
      ['Prof', R.fmt(d.pb)],
      ['Passive', d.passive]
    ]
      .map(function (x) {
        return '<div class="stat"><b>' + x[1] + '</b><span>' + x[0] + '</span></div>';
      })
      .join('') +
    '</div><div class="stats">' +
    AB.map(function (a) {
      return (
        '<div class="stat"><b>' +
        d.abilities[a].total +
        '</b><span>' +
        a +
        ' ' +
        R.fmt(d.abilities[a].mod) +
        '</span></div>'
      );
    }).join('') +
    '</div>' +
    d.casters
      .map(function (s) {
        return (
          '<div class="muted">' +
          (d.casters.length > 1 ? esc(s.name) + ': s' : 'S') +
          'pell DC ' +
          s.dc +
          ' · attack ' +
          R.fmt(s.atk) +
          '</div>'
        );
      })
      .join('') +
    (d.warnings.length
      ? '<ul class="warnings">' +
        d.warnings
          .map(function (w) {
            return '<li>' + esc(w) + '</li>';
          })
          .join('') +
        '</ul>'
      : '') +
    '</aside>';
  var i = SHOWN.map(function (s) {
    return s[0];
  }).indexOf(ui.step);
  var foot = ui.lvl
    ? ''
    : '<div class="toolbar noprint" style="margin-top:1.5rem">' +
      (i > 0 ? btn('step', '← ' + SHOWN[i - 1][1], { v: SHOWN[i - 1][0] }) : '') +
      (i < SHOWN.length - 1 ? btn('step', SHOWN[i + 1][1] + ' →', { v: SHOWN[i + 1][0] }, 'btn primary') : '') +
      '</div>';
  // on narrow screens the side panel is hidden: keep the character's numbers in view at the bottom
  var mini =
    '<div class="mini-bar noprint" aria-label="Character summary"><b>' +
    esc(title(ch)) +
    '</b>' +
    [
      ['AC', d.ac],
      ['HP', ch.track && ch.track.hp != null ? ch.track.hp + '/' + d.hp : d.hp],
      ['Spd', d.speed],
      ['Init', R.fmt(d.init)]
    ]
      .map(function (x) {
        return '<span>' + x[0] + ' <b>' + x[1] + '</b></span>';
      })
      .join('') +
    '<span class="mini-ab">' +
    AB.map(function (a) {
      return a + ' <b>' + R.fmt(d.abilities[a].mod) + '</b>';
    }).join(' ') +
    '</span></div>';
  var oldNav = document.querySelector('.steps'),
    navX = oldNav ? oldNav.scrollLeft : 0;
  var keep = scrollState();
  setApp(
    top +
      installHelpHtml() +
      xferInHtml() +
      import5eHtml() +
      '<div class="shell">' +
      nav +
      '<main>' +
      body +
      foot +
      '</main>' +
      side +
      '</div>' +
      mini
  );
  keepStepInView(navX);
  if (!ui.scrollToStep) restoreScroll(keep);
  if (ui.scrollToStep) {
    // a new step starts at its top; on a phone the step row stays visible above it
    ui.scrollToStep = false;
    var row = document.querySelector('.steps'),
      narrow = row && (row.scrollWidth > row.clientWidth || window.innerWidth < 800); // phone: play mode has fewer steps, so the row may not overflow
    window.scrollTo(0, narrow ? Math.max(0, row.getBoundingClientRect().top + window.pageYOffset - 6) : 0);
  }
  if (ui.jumpTo) {
    var jt = document.getElementById(ui.jumpTo);
    ui.jumpTo = null;
    if (jt) jt.scrollIntoView({ block: 'start' });
  }
  drawAvatars();
  AUD.after();
  Dice3D.place();
  AIHelper.place();
  syncHistory();
  if (fid) {
    var el = document.getElementById(fid);
    if (el && el !== document.activeElement) {
      try {
        el.focus({ preventScroll: true });
      } catch (e) {
        el.focus();
      }
      try {
        if (pos != null) el.setSelectionRange(pos, pos);
      } catch (e) {
        /* not a text field */
      }
    }
  }
  document.title = title(ch) + ' — Character Forge';
  saveNow();
}
// ---------- sections: the home page and the monsters ----------
// Two games side by side, each with its own sections; Audio, dice and your own books are shared.
// Light, dark, or follow the phone (auto). Kept on this device.
function themeNow() {
  try {
    return localStorage.getItem('cf-theme') || 'auto';
  } catch (e) {
    return 'auto';
  }
}
function applyTheme(t) {
  var el = document.documentElement;
  if (t === 'light' || t === 'dark') el.setAttribute('data-theme', t);
  else el.removeAttribute('data-theme');
  var dark =
    t === 'dark' || (t === 'auto' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
  var m = document.querySelector('meta[name="theme-color"]');
  if (m) m.setAttribute('content', dark ? '#17161a' : '#8b2e23');
}
function themeBtn() {
  var t = themeNow(),
    lab = { auto: 'Theme: follows your phone', light: 'Theme: light', dark: 'Theme: dark' }[t];
  return (
    '<button type="button" class="btn theme-btn" data-act="theme" title="' +
    lab +
    ' (tap to change)" aria-label="' +
    lab +
    '">' +
    Icon(t === 'auto' ? 'auto' : t === 'light' ? 'sun' : 'moon') +
    '</button>'
  );
}
function gameOf() {
  return store.game === 'mm' ? 'mm' : store.game === 'pf2' ? 'pf2' : 'dnd';
}
function gameSwitch() {
  return (
    '<div class="game-switch" role="group" aria-label="Game">' +
    [
      ['dnd', 'D&amp;D 5e'],
      ['pf2', 'PF2'],
      ['mm', 'M&amp;M 3e']
    ]
      .map(function (g) {
        return (
          '<button type="button" class="' +
          (gameOf() === g[0] ? 'on' : '') +
          '" data-act="game" data-v="' +
          g[0] +
          '"' +
          (gameOf() === g[0] ? ' aria-pressed="true"' : ' aria-pressed="false"') +
          '>' +
          g[1] +
          '</button>'
        );
      })
      .join('') +
    '</div>'
  );
}
function sectionNav() {
  var list =
    gameOf() === 'pf2'
      ? [
          ['pf2-home', '⌂ Home'],
          ['pf2-chars', 'Characters'],
          ['dm', 'GM'],
          ['books', 'Books'],
          ['pf2-rules', 'Rules'],
          ['audio', 'Audio'],
          ['rules', 'House rules']
        ]
      : gameOf() === 'mm'
        ? [
            ['mm-home', '⌂ Home'],
            ['mm-heroes', 'Heroes'],
            ['dm', 'GM'],
            ['mm-rules', 'Rules'],
            ['audio', 'Audio'],
            ['rules', 'House rules']
          ]
        : [
            ['home', '⌂ Home'],
            ['roster', 'Characters'],
            ['dm', 'DM'],
            ['items', 'Magic items'],
            ['books', 'Books'],
            ['audio', 'Audio'],
            ['rules', 'House rules']
          ];
  return (
    '<nav class="sections" aria-label="Sections">' +
    list
      .map(function (x) {
        var on =
          ui.section === x[0] ||
          (x[0] === 'roster' && ui.section === 'chars') ||
          (x[0] === 'dm' &&
            /^(party|encounters|monsters|treasure|gen|pf2-(party|enc|mon|loot)|mm-(party|enc|foes|loot))$/.test(
              ui.section
            ));
        return (
          '<button type="button" class="sec' +
          (on ? ' on' : '') +
          '" data-act="section" data-v="' +
          x[0] +
          '"' +
          (on ? ' aria-current="page"' : '') +
          '>' +
          x[1] +
          '</button>'
        );
      })
      .join('') +
    '</nav>'
  );
}
function homeHtml() {
  var hub = window.homeHub([
    ['roster', 'sword', 'Characters'],
    ['dm', 'eye', 'DM'],
    ['items', 'potion', 'Magic items'],
    ['books', 'book', 'Books'],
    ['audio', 'lute', 'Audio'],
    ['rules', 'scroll', 'House rules']
  ]);
  return (
    '<main class="home"><h1>Dungeons &amp; Dragons 5e</h1><p class="muted">Your table companion (2014 rules). Tap the d20 to roll.</p>' +
    hub +
    '</main>'
  );
}
// House rules: short titled notes for the table, searchable; saved with the characters.
function houseRules() {
  var k = gameOf() === 'mm' ? 'mmRules' : gameOf() === 'pf2' ? 'pf2Rules' : 'rules';
  return (store[k] = store[k] || []);
}
function rulesHtml() {
  var list = houseRules(),
    q = ui.q.rules || '';
  var shown = list.filter(function (r) {
    return match(q, r.t + ' ' + r.x);
  });
  return (
    '<main class="home rules"><div class="toolbar"><h2 style="margin:0">House rules</h2><span class="spacer"></span>' +
    btn('ruleAdd', '+ Add a rule', {}, 'btn primary') +
    '</div>' +
    (list.length > 3 ? '<div class="toolbar">' + search('rules', 'Search rules…') + '</div>' : '') +
    (list.length
      ? ''
      : '<p class="muted">No house rules yet. Add the ones your table plays with, like “Critical hits roll max damage plus a roll” or “Potions as a bonus action”.</p>') +
    shown
      .map(function (r) {
        if (ui.editRule === r.id)
          return (
            '<div class="panel rule"><label class="field"><span>Title</span><input id="rule-t-' +
            r.id +
            '" data-rule="' +
            r.id +
            '" data-f="t" value="' +
            esc(r.t) +
            '"></label>' +
            '<label class="field"><span>Rule</span><textarea id="rule-x-' +
            r.id +
            '" data-rule="' +
            r.id +
            '" data-f="x" rows="4">' +
            esc(r.x) +
            '</textarea></label><div class="toolbar">' +
            btn('ruleDone', 'Save', {}, 'btn primary') +
            btn('ruleRm', 'Delete', { v: r.id }, 'btn danger') +
            '</div></div>'
          );
        return (
          '<div class="panel rule"><div class="toolbar" style="margin:0"><h3 style="margin:0">' +
          esc(r.t || 'Untitled rule') +
          '</h3><span class="spacer"></span>' +
          btn('ruleEdit', 'Edit', { v: r.id }, 'btn tiny') +
          '</div>' +
          (r.x ? '<p class="rule-text">' + esc(r.x).replace(/\n/g, '<br>') + '</p>' : '') +
          '</div>'
        );
      })
      .join('') +
    '</main>'
  );
}
// Redraw the page, but keep the box being typed in as the very same element: replacing it on every key
// made phone keyboards lose letters (their word-in-progress is tied to that element).
function setApp(html) {
  var app = document.getElementById('app'),
    keep = document.activeElement;
  var typing =
    keep &&
    keep.id &&
    app.contains(keep) &&
    (keep.tagName === 'TEXTAREA' || (keep.tagName === 'INPUT' && /^(text|search|url|email|number|)$/.test(keep.type)));
  if (!typing) {
    app.innerHTML = html;
    return;
  }
  var tpl = document.createElement('div');
  tpl.innerHTML = html;
  var twin = tpl.querySelector('#' + (window.CSS && CSS.escape ? CSS.escape(keep.id) : keep.id));
  if (!twin || twin.tagName !== keep.tagName) {
    app.innerHTML = html;
    return;
  }
  patchAround(app, tpl, keep, twin);
}
function syncAttrs(a, b, skipValue) {
  [].slice.call(a.attributes).forEach(function (x) {
    if (!b.hasAttribute(x.name)) a.removeAttribute(x.name);
  });
  [].slice.call(b.attributes).forEach(function (x) {
    if (skipValue && x.name === 'value') return;
    if (a.getAttribute(x.name) !== x.value) a.setAttribute(x.name, x.value);
  });
}
// old contains keep, neu contains twin: swap everything around the path down to keep, and keep itself stays
function patchAround(old, neu, keep, twin) {
  if (old === keep) {
    syncAttrs(keep, twin, true);
    return;
  }
  if (old !== document.getElementById('app')) syncAttrs(old, neu);
  var oc = [].slice.call(old.childNodes),
    nc = [].slice.call(neu.childNodes);
  var oi = oc.findIndex(function (n) {
      return n === keep || (n.contains && n.contains(keep));
    }),
    ni = nc.findIndex(function (n) {
      return n === twin || (n.contains && n.contains(twin));
    });
  var oNode = oc[oi],
    nNode = nc[ni];
  if (oNode !== keep && oNode.tagName !== nNode.tagName) {
    old.innerHTML = '';
    nc.forEach(function (n) {
      old.appendChild(n);
    });
    return;
  }
  oc.forEach(function (n, k) {
    if (k !== oi) old.removeChild(n);
  });
  nc.slice(0, ni).forEach(function (n) {
    old.insertBefore(n, oNode);
  });
  nc.slice(ni + 1).forEach(function (n) {
    old.appendChild(n);
  });
  patchAround(oNode, nNode, keep, twin);
}
function renderSection(fid, pos) {
  var keep = scrollState();
  var top =
    '<header class="top">' +
    btn(
      'section',
      'Character Forge',
      { v: gameOf() === 'mm' ? 'mm-home' : gameOf() === 'pf2' ? 'pf2-home' : 'home' },
      'brand linkish'
    ) +
    gameSwitch() +
    sectionNav() +
    '<span class="spacer"></span>' +
    themeBtn() +
    '<button type="button" class="btn" data-act="undo" title="Undo (Ctrl+Z)"' +
    (undoStack.length ? '' : ' disabled') +
    '>↶ Undo</button>' +
    (isInstalledApp() ? '' : btn('install', 'Install app', {}, installPrompt ? 'btn primary' : 'btn')) +
    '</header>';
  var body = /^pf2-/.test(ui.section)
    ? PFV.html(ui.section)
    : /^mm-(home|heroes)$/.test(ui.section)
      ? MMV.html(ui.section)
      : ui.section === 'mm-enc'
        ? MME.html()
        : ui.section === 'mm-party'
          ? MME.partyPage()
          : ui.section === 'mm-foes'
            ? MME.foesPage()
            : ui.section === 'mm-loot'
              ? MME.lootPage()
              : ui.section === 'mm-rules'
                ? BOOKS.html()
                : ui.section === 'monsters'
                  ? '<main class="mon-main">' + MON.html() + '</main>'
                  : ui.section === 'encounters'
                    ? ENC.html()
                    : ui.section === 'party'
                      ? ENC.partyPage()
                      : ui.section === 'roster'
                        ? rosterHtml()
                        : ui.section === 'treasure'
                          ? TRE.html()
                          : ui.section === 'items'
                            ? itemsPage()
                            : ui.section === 'gen'
                              ? GEN.html()
                              : ui.section === 'dm'
                                ? DMV.html()
                                : ui.section === 'books'
                                  ? BOOKS.html()
                                  : ui.section === 'audio'
                                    ? AUD.html()
                                    : ui.section === 'rules'
                                      ? rulesHtml()
                                      : homeHtml();
  setApp(
    top +
      installHelpHtml() +
      xferInHtml() +
      (ui.tblHint
        ? '<p class="panel small rest-msg">📱 Table ' +
          ui.tblHint +
          ': open your character, go to its Session page and tap Join. ' +
          btn('tblHintOk', 'OK', {}, 'btn tiny') +
          '</p>'
        : '') +
      (ui.xferDone && ui.section === 'roster' ? '<p class="panel small rest-msg">' + esc(ui.xferDone) + '</p>' : '') +
      body
  );
  if (ui.mon && ui.mon.scrollTop) {
    ui.mon.scrollTop = false;
    var r = document.querySelector('.mon-right');
    if (r && window.innerWidth < 800) r.scrollIntoView();
    else window.scrollTo(0, 0);
  } else restoreScroll(keep);
  if (ui.section === 'books' || ui.section === 'mm-rules') BOOKS.after();
  var mt = document.querySelector('.mm-tabs .on');
  if (mt) mt.parentNode.scrollLeft = Math.max(0, mt.offsetLeft - mt.parentNode.offsetLeft - 24); // keep the open tab in view
  if (ui.section === 'roster') drawRoster();
  if (/^pf2-/.test(ui.section) && PFV.after) PFV.after();
  AUD.after();
  Dice3D.place();
  AIHelper.place();
  syncHistory();
  if (fid) {
    var el = document.getElementById(fid);
    if (el && el !== document.activeElement) {
      try {
        el.focus({ preventScroll: true });
      } catch (e) {
        el.focus();
      }
      try {
        if (pos != null) el.setSelectionRange(pos, pos);
      } catch (e) {
        /* not text */
      }
    }
  }
  document.title =
    (/^pf2-/.test(ui.section)
      ? PFV.title(ui.section)
      : /^mm-(home|heroes)$/.test(ui.section)
        ? MMV.title(ui.section)
        : ui.section === 'mm-enc'
          ? 'M&M encounters'
          : ui.section === 'mm-party'
            ? 'M&M party'
            : ui.section === 'mm-foes'
              ? 'M&M villains'
              : ui.section === 'mm-loot'
                ? 'M&M rewards'
                : ui.section === 'mm-rules'
                  ? 'M&M rules'
                  : ui.section === 'monsters'
                    ? 'Monsters'
                    : ui.section === 'encounters'
                      ? 'Encounters'
                      : ui.section === 'party'
                        ? 'Party'
                        : ui.section === 'roster'
                          ? 'Characters'
                          : ui.section === 'treasure'
                            ? 'Treasures'
                            : ui.section === 'items'
                              ? 'Magic items'
                              : ui.section === 'gen'
                                ? 'Generators'
                                : ui.section === 'dm'
                                  ? gameOf() === 'dnd'
                                    ? 'DM'
                                    : 'GM'
                                  : ui.section === 'books'
                                    ? 'Books'
                                    : ui.section === 'audio'
                                      ? 'Audio'
                                      : ui.section === 'rules'
                                        ? 'House rules'
                                        : 'Home') + ' — Character Forge';
  saveNow();
}
