// Start-up: connects the sections (each in its own file under js/) to the app, then loads and draws.
// Part of the app: these files share one scope (see “How the code is organized” in README.md), loaded in order by index.html.
'use strict';

// the players' sheets kept on the DM's device, and secrets for one player (js/party-table.js)
var PT = window.PartyTable({
  esc: esc,
  btn: btn,
  ui: ui,
  store: store,
  normalize: normalize,
  // a player's sheet, opened on its Sheet page in its own game
  open: function (game, id) {
    store.game = game;
    needGame(game, function () {
      openSheet(game, id);
    });
  },
  save: function () {
    save();
  },
  render: function () {
    render();
  }
});
function openSheet(game, id) {
  if (game === 'pf2') {
    ui.section = 'pf2-chars';
    actions.pfOpen(id);
    actions.pfTab('sheet');
  } else if (game === 'mm') {
    actions.mmOpen(id);
    actions.mmTab('sheet');
  } else if (game === 'sd') {
    ui.section = 'sd-chars';
    SDV.open(id);
  } else {
    actions.openChar(id);
    ui.mode = 'play';
    ui.step = 'sheet';
  }
}
Object.keys(PT.actions).forEach(function (k) {
  actions[k] = PT.actions[k];
});
if (window.Table) Table.onSheet = PT.receive;
var GEN = window.GeneratorsUI({ esc: esc, btn: btn, ui: ui, store: store });
Object.keys(GEN.actions).forEach(function (k) {
  actions[k] = GEN.actions[k];
});
var DMV = window.DMUI({
  pt: PT,
  esc: esc,
  btn: btn,
  ui: ui,
  store: store,
  save: function () {
    save();
  },
  render: function () {
    render();
  },
  skills: function () {
    return Object.keys(D.skills);
  },
  isHere: function () {
    return ui.section === 'dm';
  },
  game: gameOf
});
Object.keys(DMV.actions).forEach(function (k) {
  actions[k] = DMV.actions[k];
});
var MON = window.MonsterUI({ esc: esc, btn: btn, ui: ui, store: store, render: render });
Object.keys(MON.actions).forEach(function (k) {
  actions[k] = MON.actions[k];
});
var BOOKS = window.BooksUI({
  esc: esc,
  btn: btn,
  ui: ui,
  store: store,
  render: render,
  pf2Book: function () {
    return PFV.book();
  }
});
Object.keys(BOOKS.actions).forEach(function (k) {
  actions[k] = BOOKS.actions[k];
});
var TP = window.TablePanel({
  playMusic: function (m) {
    AUD.play(m);
  },
  esc: esc,
  btn: btn,
  ui: ui,
  store: store,
  save: function () {
    save();
  },
  render: function () {
    render();
  }
});
Object.keys(TP.actions).forEach(function (k) {
  actions[k] = TP.actions[k];
});
var TS = window.TableShare({
  esc: esc,
  btn: btn,
  ui: ui,
  render: function () {
    render();
  },
  isHere: function () {
    return ui.section === 'pf2-loot' || ui.section === 'mm-loot';
  }
});
Object.keys(TS.actions).forEach(function (k) {
  actions[k] = TS.actions[k];
});
AIHelper.setContext(aiContext);
// ---------- the other games, loaded when you switch to them (most players use one game) ----------
// Their files are still in the offline copy (sw.js); they just aren't read until needed, so the app starts faster.
var PFV = null,
  MMV = null,
  MME = null,
  SDV = null;
var LAZY = {
  // longer feature and spell texts (Detailed text): read just after the page first shows
  text: ['data/text-spells.js', 'data/text-features.js'],
  pf2: ['js/pf2.js', 'js/pf2-import.js', 'js/pf2-enc.js', 'js/pf2-ui.js'],
  mm: ['data/mm.js', 'js/mm.js', 'js/mm-foes.js', 'js/mm-enc.js'],
  sd: ['js/sd.js']
};
function merge(o) {
  Object.keys(o.actions).forEach(function (k) {
    actions[k] = o.actions[k];
  });
}
var START = {
  text: function () {},
  pf2: function () {
    PFV = window.PF2UI({
      pt: PT,
      esc: esc,
      btn: btn,
      ui: ui,
      store: store,
      tp: TP,
      ts: TS,
      render: function () {
        render();
      }
    });
    merge(PFV);
  },
  mm: function () {
    MMV = window.MMUI({ esc: esc, btn: btn, ui: ui, store: store, tp: TP });
    merge(MMV);
    MME = window.MMEnc({
      pt: PT,
      esc: esc,
      btn: btn,
      ui: ui,
      store: store,
      ts: TS,
      render: function () {
        render();
      }
    });
    merge(MME);
  },
  // Shadowdark: the sheet you fill in, Shadowdarklings imports, the light timer (js/sd.js, js/torch.js)
  sd: function () {
    SDV = window.SDUI({
      esc: esc,
      btn: btn,
      ui: ui,
      store: store,
      tp: TP,
      render: function () {
        render();
      },
      save: function () {
        save();
      }
    });
    merge(SDV);
  }
};
var lazy = {}; // part → 'loading', 'ready' or 'error'
var lazyThen = {};
function loadScriptOnce(src) {
  return new Promise(function (ok, no) {
    var s = document.createElement('script');
    s.src = src;
    s.onload = ok;
    s.onerror = function () {
      no(new Error('Couldn’t load ' + src));
    };
    document.head.appendChild(s);
  });
}
function gameReady(g) {
  return g === 'dnd' || lazy[g] === 'ready';
}
// load a game (or the texts), then do `then`; true when it was already there
function needGame(g, then) {
  if (gameReady(g)) {
    if (then) then();
    return true;
  }
  (lazyThen[g] = lazyThen[g] || []).push(then);
  if (lazy[g] === 'loading') return false;
  lazy[g] = 'loading';
  LAZY[g]
    .reduce(function (p, src) {
      return p.then(function () {
        return loadScriptOnce(src);
      });
    }, Promise.resolve())
    .then(
      function () {
        START[g]();
        lazy[g] = 'ready';
        var list = lazyThen[g];
        lazyThen[g] = [];
        list.forEach(function (f) {
          if (f) f();
        });
        render();
      },
      function () {
        lazy[g] = 'error';
        lazyThen[g] = [];
        render();
      }
    );
  return false;
}
var AUD = window.AudioUI({
  esc: esc,
  btn: btn,
  ui: ui,
  store: store,
  game: gameOf,
  render: function () {
    render();
  }
});
Object.keys(AUD.actions).forEach(function (k) {
  actions[k] = AUD.actions[k];
});
var TRE = window.TreasureUI({ esc: esc, btn: btn, ui: ui, store: store });
Object.keys(TRE.actions).forEach(function (k) {
  actions[k] = TRE.actions[k];
});
var ENC = window.EncounterUI({
  pt: PT,
  esc: esc,
  btn: btn,
  ui: ui,
  store: store,
  render: render,
  save: save,
  MON: MON,
  R: R,
  onLoot: function (creatures, levels, title) {
    TRE.fromEncounter(creatures, levels, title);
    ui.section = 'treasure';
    window.scrollTo(0, 0);
  }
});
Object.keys(ENC.actions).forEach(function (k) {
  actions[k] = ENC.actions[k];
});
Object.keys(SavedEnc.actions).forEach(function (k) {
  actions[k] = SavedEnc.actions[k];
});
load();
// the Backup page: Google Drive and backup files (js/gdrive.js, js/backup-ui.js)
var BKP = window.BackupUI({
  esc: esc,
  btn: btn,
  ui: ui,
  store: store,
  render: function () {
    render();
  },
  apply: applyBackup,
  // a character with something in it (not the empty one a new device starts with)
  hasContent: function (c) {
    return !!(c.name || c.lineage || c.classes.length);
  }
});
window.BKP = BKP;
Object.keys(BKP.actions).forEach(function (k) {
  actions[k] = BKP.actions[k];
});
if (store.game === 'mm' && ui.section === 'home') ui.section = 'mm-home';
if (store.game === 'sd' && ui.section === 'home') ui.section = 'sd-home';
if (store.game === 'pf2' && ui.section === 'home') ui.section = 'pf2-home';
applyTheme(themeNow()); // reopen in the game you were using
render();
needGame('text'); // the longer texts, now that the page shows
// the larger saved copy (IndexedDB), when it is newer than the quick one
loadDb(function (changed) {
  if (!changed) return;
  if (store.game === 'mm' && ui.section === 'home') ui.section = 'mm-home';
  if (store.game === 'sd' && ui.section === 'home') ui.section = 'sd-home';
  if (store.game === 'pf2' && ui.section === 'home') ui.section = 'pf2-home';
  render();
});
// this page is the small Google sign-in window coming back: the page that opened it carries on
if (BKP.popupDone)
  document.getElementById('app').innerHTML =
    '<main class="home"><h2>✓ Signed in to Google</h2><p>You can close this window and go back to Character Forge.</p></main>';
takeSharedFile();
checkXferLink();
checkTableLink();
if (window.ItemTexts)
  ItemTexts.load(function () {
    if (ItemTexts.list().length) render();
  });
window.Forge = {
  store: store,
  ui: ui,
  render: render,
  derived: function () {
    return d;
  }
};
