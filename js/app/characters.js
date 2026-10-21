// Characters: pictures and figures, the roster, moving to another device, D&D Beyond and import files.
// Part of the app: these files share one scope (see “How the code is organized” in README.md), loaded in order by index.html.
'use strict';

// ---------- appearance ----------
function lookOf(c, dd) {
  return Avatar.look(c, dd.lin, dd.L);
}
function gearOf(c) {
  return Avatar.gear(c, D);
}
function avatarCanvas(cls) {
  return (
    '<canvas class="avatar figure ' +
    (cls || '') +
    '" data-avatar="figure" width="48" height="58" role="img" aria-label="Character figure"></canvas>'
  );
}
// The picture sits in a square box; its framing (move, zoom, rotate) is the same everywhere it shows
function picTransform(v) {
  v = v || {};
  return (
    'translate(' +
    ((+v.x || 0) * 100).toFixed(2) +
    '%,' +
    ((+v.y || 0) * 100).toFixed(2) +
    '%) scale(' +
    (+v.zoom || 1) +
    ') rotate(' +
    (+v.rot || 0) +
    'deg)'
  );
}
function pictureHtml(cls) {
  if (!ch.picture) return '';
  return (
    '<div class="pic-box ' +
    (cls || '') +
    '"><img class="char-pic' +
    (ch.pictureFit === 'contain' ? ' whole' : '') +
    '" src="' +
    safePic(ch.picture) +
    '" alt="Picture of ' +
    esc(title(ch)) +
    '" draggable="false" style="transform:' +
    picTransform(ch.pictureView) +
    '"></div>'
  );
}
// All characters to choose from, each with its picture (or its drawn figure).
function rosterHtml() {
  var cards = store.chars
    .filter(function (c) {
      return c.id === store.current || c.name || c.lineage || (c.classes || []).length || c.picture;
    })
    .map(function (c) {
      var dd = R.derive(c, store.filters);
      var pic = c.picture
        ? '<div class="pic-box roster-pic"><img class="char-pic' +
          (c.pictureFit === 'contain' ? ' whole' : '') +
          '" src="' +
          safePic(c.picture) +
          '" alt="" draggable="false" style="transform:' +
          picTransform(c.pictureView) +
          '"></div>'
        : '<div class="roster-pic roster-fig"><canvas class="avatar figure" data-roster="' +
          c.id +
          '" width="48" height="58" aria-hidden="true"></canvas></div>';
      return (
        '<button type="button" class="roster-card' +
        (c.id === store.current ? ' cur' : '') +
        '" data-act="openChar" data-v="' +
        c.id +
        '">' +
        pic +
        '<span class="roster-txt"><b>' +
        esc(title(c)) +
        '</b><span class="small muted">' +
        esc(summaryLine(c, dd)) +
        '</span>' +
        ((c.classes || []).length
          ? '<span class="roster-stats small"><span>Lv ' +
            dd.level +
            '</span><span>AC ' +
            dd.ac +
            '</span><span>HP ' +
            (c.track && c.track.hp != null ? c.track.hp + '/' : '') +
            dd.hp +
            '</span></span>'
          : '') +
        '</span></button>'
      );
    })
    .join('');
  return (
    '<main class="home roster"><div class="toolbar"><h2 style="margin:0">Characters</h2><span class="spacer"></span>' +
    btn('rosterNew', '+ New character', {}, 'btn primary') +
    btn('import', 'Import', {}, 'btn') +
    btn('ddbOpen', 'From D&D Beyond', {}, 'btn') +
    btn('xferOpen', '📲 To another device', {}, 'btn') +
    '</div>' +
    (ui.importError
      ? '<p class="small" style="color:var(--warn)">' +
        esc(
          ui.importError === true
            ? 'That file is not a Character Forge export, a 5th Spellbook backup, a 5e Companion character or D&D Beyond data.'
            : ui.importError
        ) +
        '</p>'
      : '') +
    xferHtml() +
    ddbHtml() +
    import5eHtml() +
    '<div class="roster-grid">' +
    cards +
    '</div><input type="file" id="importFile" hidden></main>'
  );
}
// ---------- moving characters to another device (a link / QR code, or a file) ----------
function xferBundle(withPics) {
  var X = ui.xfer || {},
    strip = function (c) {
      c = JSON.parse(JSON.stringify(c));
      if (!withPics) delete c.picture;
      return c;
    };
  var b = { cf: 1 };
  if (X.dnd !== false)
    b.chars = store.chars
      .filter(function (c) {
        return c.name || (c.classes || []).length;
      })
      .map(strip);
  if (X.pf2 !== false && store.pf2 && (store.pf2.chars || []).length) b.pf2 = store.pf2.chars.map(strip);
  if (X.mm !== false && store.mm && (store.mm.heroes || []).length) b.mm = store.mm.heroes.map(strip);
  return b;
}
function xferHtml() {
  var X = ui.xfer;
  if (!X) return '';
  var n = {
    dnd: store.chars.filter(function (c) {
      return c.name || (c.classes || []).length;
    }).length,
    pf2: ((store.pf2 || {}).chars || []).length,
    mm: ((store.mm || {}).heroes || []).length
  };
  var chk = function (k, label) {
    return n[k]
      ? '<label class="pill small' +
          (X[k] !== false ? ' on' : '') +
          '"><input type="checkbox" data-xfer="' +
          k +
          '"' +
          (X[k] !== false ? ' checked' : '') +
          '> ' +
          label +
          ' (' +
          n[k] +
          ')</label>'
      : '';
  };
  var h =
    '<div class="panel import5e noprint"><h3>Send to another device</h3><p class="small muted">Makes a link with your characters inside it. Open it on the other device (scan the QR code with the camera, or send the link to yourself): it adds them there, and updates the ones already sent before.</p>' +
    '<div class="pills">' +
    chk('dnd', 'D&D') +
    chk('pf2', 'PF2') +
    chk('mm', 'M&M') +
    '</div>' +
    '<div class="toolbar">' +
    btn('xferMake', 'Make the link', {}, 'btn primary') +
    btn('xferFile', 'Share as a file (with pictures)', {}, 'btn') +
    btn('xferClose', 'Close', {}, 'btn') +
    '</div>';
  if (X.busy) h += '<p class="small muted">Packing…</p>';
  if (X.link)
    h +=
      '<p class="small">Link ready (' +
      Math.round(X.link.length / 100) / 10 +
      ' thousand characters, pictures left out).</p>' +
      (X.qr
        ? '<img class="xfer-qr" src="' + X.qr + '" alt="QR code with your characters">'
        : '<p class="small muted">Too much for a QR code: copy or share the link instead.</p>') +
      '<div class="toolbar">' +
      btn('xferCopy', 'Copy the link', {}, 'btn') +
      (navigator.share ? btn('xferShare', 'Share the link…', {}, 'btn') : '') +
      '</div>';
  return h + (X.msg ? '<p class="small rest-msg">' + esc(X.msg) + '</p>' : '') + '</div>';
}
// the other side: opened with #take=… in the address
function xferInHtml() {
  var I = ui.xferIn;
  if (!I) return '';
  if (I.err)
    return (
      '<div class="panel import5e noprint"><h3>Characters from another device</h3><p>' +
      esc(I.err) +
      '</p>' +
      btn('xferInNo', 'OK', {}, 'btn') +
      '</div>'
    );
  var b = I.b,
    names = function (l) {
      return (l || [])
        .map(function (c) {
          return c.name || 'Unnamed';
        })
        .join(', ');
    };
  return (
    '<div class="panel import5e noprint"><h3>Characters from another device</h3><ul>' +
    (b.chars && b.chars.length ? '<li><b>D&amp;D:</b> ' + esc(names(b.chars)) + '</li>' : '') +
    (b.pf2 && b.pf2.length ? '<li><b>PF2:</b> ' + esc(names(b.pf2)) + '</li>' : '') +
    (b.mm && b.mm.length ? '<li><b>M&amp;M:</b> ' + esc(names(b.mm)) + '</li>' : '') +
    '</ul><p class="small muted">Characters you sent before are updated (their pictures here are kept); new ones are added. Nothing else on this device changes.</p><div class="toolbar">' +
    btn('xferInGo', 'Add them', {}, 'btn primary') +
    btn('xferInNo', 'Not now', {}, 'btn') +
    '</div></div>'
  );
}
function xferTake(b) {
  var done = [];
  var merge = function (list, incoming, fix) {
    (incoming || []).forEach(function (c) {
      if (!c || typeof c !== 'object') return;
      c = fix ? fix(c) : c;
      c.picture = safePic(c.picture);
      var i = list
        .map(function (x) {
          return x.id;
        })
        .indexOf(c.id);
      if (i >= 0) {
        if (!c.picture && list[i].picture) c.picture = list[i].picture;
        list[i] = c;
      } else {
        if (!c.id) c.id = R.uid();
        list.push(c);
      }
      done.push(c.name || 'Unnamed');
    });
  };
  merge(store.chars, b.chars, function (c) {
    var id = c.id;
    c = normalize(c);
    c.id = id || R.uid();
    return c;
  });
  if (b.pf2) {
    store.pf2 = store.pf2 || { chars: [] };
    store.pf2.chars = store.pf2.chars || [];
    merge(store.pf2.chars, b.pf2);
  }
  if (b.mm) {
    store.mm = store.mm || { heroes: [] };
    store.mm.heroes = store.mm.heroes || [];
    merge(store.mm.heroes, b.mm);
  }
  return done;
}
function checkXferLink() {
  var m = String(window.location.hash || '').match(/^#take=([A-Za-z0-9_-]+)$/);
  if (!m || !window.Transfer) return;
  try {
    window.history.replaceState(null, '', window.location.pathname + window.location.search);
  } catch (e) {
    /* ignore */
  }
  Transfer.unpack(m[1]).then(
    function (b) {
      if (!b || b.cf !== 1) throw new Error('not ours');
      ui.xferIn = { b: b };
      render();
    },
    function () {
      ui.xferIn = { err: 'That link is incomplete or damaged. Make a new one on the other device.' };
      render();
    }
  );
}
// D&D Beyond: paste a public character's link (or its data) and bring it in like a 5e Companion character
function ddbHtml() {
  var B = ui.ddb;
  if (!B) return '';
  var id = window.ImportDDB && ImportDDB.idFrom(B.v),
    raw = id ? ImportDDB.url(id) : '';
  return (
    '<div class="panel import5e noprint"><h3>Import from D&amp;D Beyond</h3>' +
    '<p class="small muted">On D&amp;D Beyond, open the character, set its privacy to <b>Public</b> (character settings), then copy its address (like dndbeyond.com/characters/12345678) and paste it here.</p>' +
    '<label class="field"><span>Character link</span><input type="text" id="ddb-v" data-ddb="1" value="' +
    esc(B.v) +
    '" placeholder="https://www.dndbeyond.com/characters/…"></label>' +
    '<div class="toolbar">' +
    btn('ddbGo', B.busy ? 'Getting it…' : 'Import', {}, 'btn primary') +
    btn('ddbClose', 'Cancel') +
    '</div>' +
    (B.msg ? '<p class="small" style="color:var(--warn)">' + esc(B.msg) + '</p>' : '') +
    (B.manual && raw
      ? '<p class="small"><b>Another way:</b> open <a href="' +
        esc(raw) +
        '" target="_blank" rel="noopener">this character’s data</a> in a new tab, select everything (Ctrl+A or ⌘A), copy it, and paste it in the box above instead of the link.</p>'
      : '') +
    '</div>'
  );
}
function drawRoster() {
  if (!window.Avatar) return;
  document.querySelectorAll('canvas[data-roster]').forEach(function (cv) {
    var c = byId(cv.getAttribute('data-roster'));
    if (!c) return;
    var dd = R.derive(c, store.filters);
    Avatar.draw(cv, lookOf(c, dd), gearOf(c));
  });
}
function drawAvatars() {
  if (!window.Avatar) return;
  var look = lookOf(ch, d),
    gear = gearOf(ch);
  document.querySelectorAll('canvas[data-avatar]').forEach(function (cv) {
    Avatar.draw(cv, look, gear);
  });
}
// A picture the player adds: shrunk to at most 640 px so it fits in the browser's storage.
function loadPicture(input) {
  var file = input.files && input.files[0];
  input.value = '';
  if (!file) return;
  ui.pictureError = '';
  if (!/^image\//.test(file.type)) {
    ui.pictureError = 'That file is not a picture.';
    render();
    return;
  }
  var reader = new FileReader();
  reader.onload = function () {
    shrinkPicture(reader.result, function (data) {
      if (!data) {
        ui.pictureError = 'That picture could not be opened.';
        render();
        return;
      }
      var before = ch.picture;
      ch.picture = data;
      try {
        window.localStorage.setItem(KEY, JSON.stringify(store));
      } catch (e) {
        ch.picture = before;
        ui.pictureError =
          'There is not enough room left in this browser to save that picture. Try a smaller one, or remove pictures from other characters.';
      }
      render();
    });
  };
  reader.readAsDataURL(file);
}
function importerOf(e) {
  return e && e.source === 'companion' ? window.ImportCompanion : window.Import5e;
}
function sourceName(e) {
  return e && e.label ? e.label : e && e.source === 'companion' ? '5e Companion' : '5th Spellbook';
}
// Read any import file: a 5th Spellbook backup (SQLite) or a 5e Companion character (JSON). Returns entries or null.
function readImportFile(buf) {
  if (window.SqliteFile && SqliteFile.isSqlite(buf)) return Import5e.read(new SqliteFile(buf));
  var o;
  try {
    o = JSON.parse(new TextDecoder('utf-8').decode(buf));
  } catch (e) {
    return null;
  }
  if (window.ImportCompanion && ImportCompanion.detect(o)) return ImportCompanion.read(o);
  if (window.ImportDDB && ImportDDB.isDDB(o && o.data ? o.data : o)) return ImportDDB.read(o);
  return { json: o };
}
function shrinkPicture(src, done) {
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
      x.fillStyle = '#ffffff';
      x.fillRect(0, 0, cv.width, cv.height);
      data = cv.toDataURL('image/jpeg', 0.85);
    }
    done(data);
  };
  img.onerror = function () {
    done(null);
  };
  img.src = src;
}
// Moving the picture in its frame: drag with one finger or the mouse, pinch with two, or the mouse wheel
function livePicture() {
  var img = document.querySelector('.pic-frame.editing img');
  if (img) img.style.transform = picTransform(ch.pictureView);
  var z = document.querySelector('[data-piczoom]');
  if (z && ch.pictureView) z.value = ch.pictureView.zoom || 1;
}
var picPtrs = {},
  picStart = null;
var picEnd = function (e) {
  if (!picPtrs[e.pointerId]) return;
  delete picPtrs[e.pointerId];
  if (!Object.keys(picPtrs).length) {
    picStart = null;
    save();
  } else {
    picStart.pts = Object.keys(picPtrs).map(function (k) {
      return { x: picPtrs[k].x, y: picPtrs[k].y };
    });
    picStart.v = Object.assign({}, ch.pictureView);
  }
};
function importFile(input) {
  var file = input.files && input.files[0];
  if (!file) return;
  var reader = new FileReader();
  reader.onload = function () {
    handleImportBuffer(reader.result);
    input.value = '';
    render();
  };
  reader.readAsArrayBuffer(file);
}
function startImport(entries) {
  var nm = function (x) {
      return String(x || '')
        .trim()
        .toLowerCase();
    },
    target = {};
  entries.forEach(function (e) {
    var same = store.chars.filter(function (c) {
      return nm(c.name) && nm(c.name) === nm(e.name);
    })[0];
    target[e.id] = same ? same.id : 'new';
  });
  var anyMatch = entries.some(function (e) {
    return target[e.id] !== 'new';
  });
  // with a matching character, start with just those ticked: the rest are probably not wanted again
  var parts = {};
  entries.forEach(function (e) {
    parts[e.id] = ['spells'];
  });
  ui.import5e = {
    source: sourceName(entries[0]),
    entries: entries,
    target: target,
    parts: parts,
    pick: entries
      .filter(function (e) {
        return !anyMatch || target[e.id] !== 'new';
      })
      .map(function (e) {
        return e.id;
      })
  };
  ui.import5eDone = null;
}
function handleImportBuffer(buf) {
  ui.importError = false;
  try {
    var got = readImportFile(buf);
    if (got && !got.json) {
      var entries = got;
      if (!entries.length) throw new Error('That file has no characters (5th Spellbook or 5e Companion).');
      startImport(entries);
    } else {
      if (!got) throw new Error('not json');
      var o = got.json;
      if (o && o.cf === 1) {
        ui.xferIn = { b: o };
        return;
      }
      var list = Array.isArray(o) ? o : o && Array.isArray(o.chars) ? o.chars : [o];
      list.forEach(function (c) {
        if (!c || typeof c !== 'object' || !('classes' in c || 'level' in c) || !c.base)
          throw new Error('not a character');
        c = normalize(c);
        c.id = R.uid();
        store.chars.push(c);
        store.current = c.id;
      });
      ui.step = 'sheet';
      ui.section = 'chars';
    }
  } catch (err) {
    ui.importError = /5th Spellbook|5e Companion/.test(err.message) ? err.message : true;
    window.console.error('Import failed', err);
  }
}
// Pick which characters to bring in from a 5th Spellbook backup, then report what came across.
function import5eHtml() {
  var I = ui.import5e,
    done = ui.import5eDone;
  if (done)
    return (
      '<div class="panel import5e noprint"><h3>Imported from ' +
      esc(done.source || '5th Spellbook') +
      '</h3><ul>' +
      done
        .map(function (r) {
          if (r.update)
            return (
              '<li><b>' +
              esc(r.name) +
              '</b> — updated: ' +
              esc(r.parts.join(', ') || 'nothing') +
              (r.spellNote ? ' (' + esc(r.spellNote) + ')' : '') +
              '. Everything else kept.</li>'
            );
          return (
            '<li><b>' +
            esc(r.name) +
            '</b> — new character, ' +
            r.added +
            ' spell' +
            (r.added === 1 ? '' : 's') +
            ' added' +
            (r.skipped ? ', ' + r.skipped + ' listed in Details → Other notes instead' : '') +
            '</li>'
          );
        })
        .join('') +
      '</ul>' +
      (done.some(function (r) {
        return !r.update;
      })
        ? '<p class="small muted">' +
          (done.source !== '5th Spellbook'
            ? 'New characters come with everything ' +
              esc(done.source) +
              ' stores. Step badges show any choice still open, and Details → Other notes lists anything that had no match here.'
            : "New characters: ability scores other than the spellcasting one weren't in the backup, so they start at 10. Step badges show what is still open (skills, background, equipment…).") +
          '</p>'
        : '') +
      '<p class="small muted">Changed your mind? Press Undo at the top.</p>' +
      btn('import5eClose', 'Close', {}, 'btn primary') +
      '</div>'
    );
  if (!I) return '';
  return (
    '<div class="panel import5e noprint" role="dialog" aria-label="Import from ' +
    esc(I.source) +
    '"><h3>Import from ' +
    esc(I.source) +
    '</h3><p class="muted">Found ' +
    I.entries.length +
    ' character' +
    (I.entries.length === 1 ? '' : 's') +
    '. ' +
    (I.source !== '5th Spellbook'
      ? 'A new character comes in with everything on its sheet: race, background, classes, ability scores, skills, feats, equipment, coins, personality, notes, spells' +
        (I.source === 'D&D Beyond' ? '' : ' and picture') +
        '.'
      : 'A new character comes in with its race, classes and levels, subclasses and spells.') +
    ' To bring only some parts into a character you already made, choose “Update my character” and tick the parts you want.</p><div class="imp-list">' +
    I.entries
      .map(function (e) {
        var n = e.classes.reduce(function (t, c) {
          return t + c.spells.length;
        }, e.loose.length);
        var tg = I.target[e.id] || 'new';
        return (
          '<div class="imp-row"><input type="checkbox" id="imp5-' +
          e.id +
          '" data-imp5="' +
          e.id +
          '"' +
          (I.pick.indexOf(e.id) >= 0 ? ' checked' : '') +
          '><div class="imp-main"><label for="imp5-' +
          e.id +
          '"><b>' +
          esc(e.name) +
          '</b><br><span class="small muted">' +
          esc(importerOf(e).summary(e)) +
          ' · ' +
          n +
          ' spells</span></label>' +
          '<select data-imp5target="' +
          e.id +
          '" aria-label="Where to import ' +
          esc(e.name) +
          '"><option value="new"' +
          (tg === 'new' ? ' selected' : '') +
          '>Add as a new character</option>' +
          store.chars
            .map(function (c) {
              return (
                '<option value="' +
                c.id +
                '"' +
                (tg === c.id ? ' selected' : '') +
                '>Update my character: ' +
                esc(title(c)) +
                '</option>'
              );
            })
            .join('') +
          '</select>' +
          (tg !== 'new' ? partsPicker(I, e, tg) : '') +
          '</div></div>'
        );
      })
      .join('') +
    '</div><div class="toolbar">' +
    btn('import5eGo', 'Import ' + I.pick.length + ' character' + (I.pick.length === 1 ? '' : 's'), {}, 'btn primary') +
    btn('import5eAll', I.pick.length === I.entries.length ? 'Select none' : 'Select all') +
    btn('import5eClose', 'Cancel') +
    '</div></div>'
  );
}
// Which parts to copy onto an existing character
function partsPicker(I, e, tg) {
  var chosen = I.parts[e.id] || [],
    ok = function (k) {
      return e.source === 'companion' || PARTS[k].spellbook;
    };
  var avail = PART_ORDER.filter(ok);
  var all = avail.every(function (k) {
    return chosen.indexOf(k) >= 0;
  });
  return (
    '<div class="imp-parts"><span class="small"><b>What to bring into ' +
    esc(title(byId(tg) || {})) +
    ':</b></span><div class="pills">' +
    STEPS.map(function (s) {
      return s[0];
    })
      .filter(function (k) {
        return PARTS[k];
      })
      .map(function (k) {
        var on = chosen.indexOf(k) >= 0,
          can = ok(k);
        return (
          '<label class="pill imp-part' +
          (on ? ' on' : '') +
          (can ? '' : ' off') +
          '"' +
          (can ? '' : ' title="Not in a 5th Spellbook backup"') +
          '><input type="checkbox" data-imp5part="' +
          e.id +
          '" value="' +
          k +
          '"' +
          (on ? ' checked' : '') +
          (can ? '' : ' disabled') +
          '> ' +
          esc(PARTS[k].short) +
          '</label>'
        );
      })
      .join('') +
    btn('import5eParts', all ? 'None' : 'All', { e: e.id, all: all ? '' : '1' }, 'btn tiny') +
    '</div>' +
    '<div class="small muted">' +
    (chosen.length
      ? 'Only the ticked parts change; everything else on ' + esc(title(byId(tg) || {})) + ' stays as it is.'
      : 'Tick at least one part.') +
    '</div></div>'
  );
}
// Opened from the share menu: the service worker kept the shared file; import it like the Import button would.
function takeSharedFile() {
  var q = window.location.search;
  if (!/[?&]shared=/.test(q) || !window.caches) return;
  try {
    window.history.replaceState(null, '', window.location.pathname);
  } catch (e) {
    /* ignore */
  }
  if (/shared=error/.test(q)) {
    ui.importError = 'The shared file could not be received. Save it and use Import instead.';
    render();
    return;
  }
  caches
    .open('cf-share')
    .then(function (c) {
      return c.match('shared-file').then(function (res) {
        if (!res) return;
        return res.arrayBuffer().then(function (buf) {
          c.delete('shared-file');
          handleImportBuffer(buf);
          render();
        });
      });
    })
    .catch(function () {
      /* nothing shared */
    });
}
