// The Backup page: everything in the app (D&D, Pathfinder and M&M characters, house rules, encounters, notes…) saved
// as one plain file in your Google Drive, automatically after changes, and brought back on any device, or in a new
// version of the app (Import also reads the file). Also: download the same file without Google.
(function (root) {
  'use strict';
  var FORMAT = 'character-forge-backup';
  root.BackupUI = function (api) {
    var esc = api.esc,
      btn = api.btn,
      ui = api.ui,
      G = root.GDrive,
      B = (ui.bk = ui.bk || { msg: '', busy: false, files: null, pick: null, prev: null, id: '' }),
      timer = null;
    function counts(s) {
      return {
        dnd: (s.chars || []).length,
        pf2: ((s.pf2 || {}).chars || []).length,
        mm: ((s.mm || {}).heroes || []).length
      };
    }
    function countText(c) {
      return [
        [c.dnd, 'D&D character'],
        [c.pf2, 'Pathfinder character'],
        [c.mm, 'M&M hero']
      ]
        .reduce(function (a, x) {
          if (x[0]) a.push(x[0] + ' ' + x[1] + (x[0] > 1 ? 's' : ''));
          return a;
        }, [])
        .join(', ');
    }
    // the backup file: plain JSON with a note on what is where, so any app (or person) can read it
    function file() {
      var s = JSON.parse(JSON.stringify(api.store));
      return JSON.stringify({
        format: FORMAT,
        version: 1,
        app: 'Character Forge',
        url: 'https://spendrax.github.io/character-forge/',
        saved: new Date().toISOString(),
        readme:
          'Everything saved in Character Forge. D&D 5e characters: store.chars. Pathfinder 2e: store.pf2.chars. ' +
          'Mutants & Masterminds heroes: store.mm.heroes. House rules: store.rules, store.pf2Rules, store.mmRules. ' +
          'To bring it all back, open Character Forge and use Import (or Backup, Restore).',
        counts: counts(s),
        store: s
      });
    }
    function isBackup(o) {
      return !!(o && o.format === FORMAT && o.store && typeof o.store === 'object');
    }
    function ago(t) {
      if (!t) return 'never';
      var m = Math.round((Date.now() - t) / 60000);
      if (m < 1) return 'just now';
      if (m < 60) return m + ' min ago';
      if (m < 60 * 24) return Math.round(m / 60) + ' h ago';
      return new Date(t).toLocaleDateString();
    }
    function when(iso) {
      var d = new Date(iso);
      return d.toLocaleDateString() + ' ' + ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2);
    }
    function fail(e) {
      B.busy = false;
      B.msg = e && e.message ? e.message : 'Something went wrong with Google Drive.';
      api.render();
    }
    // sign in first when needed (a small Google window), then do it
    function withGoogle(then) {
      if (G.signedIn()) return then();
      B.busy = true;
      B.msg = 'Waiting for Google sign-in…';
      G.connect(B.id || G.clientId(), 'backup').then(function () {
        B.msg = '';
        then();
      }, fail);
    }
    function backupNow(quiet) {
      if (!quiet) {
        B.busy = true;
        B.msg = 'Backing up…';
      }
      return G.upload(file()).then(
        function () {
          B.busy = false;
          B.msg = quiet ? B.msg : 'Backed up to Google Drive.';
          api.render();
        },
        function (e) {
          if (quiet) {
            G.set('pending', true);
            return;
          }
          fail(e);
        }
      );
    }
    function loadList() {
      B.busy = true;
      B.msg = 'Looking in your Drive…';
      G.list().then(function (f) {
        B.busy = false;
        B.msg = '';
        B.files = f;
        api.render();
      }, fail);
    }
    // a change was saved: back it up a little later (if signed in), else remember there is something to back up
    function changed() {
      var s = G.state();
      // a device that never backed up nor restored waits: its empty app must not replace the backup in the Drive
      if (!s.known || s.auto === false || !(s.last || s.restored)) return;
      if (!s.pending) G.set('pending', true);
      clearTimeout(timer);
      timer = setTimeout(function () {
        if (G.signedIn() && !B.busy) backupNow(true);
      }, 20000);
    }
    function offer(o, src) {
      B.pick = { src: src, data: o, when: o.saved || '' };
      ui.section = 'backup';
    }
    function restorePanel() {
      var P = B.pick;
      if (!P) return '';
      var c = P.data.counts || counts(P.data.store);
      return (
        '<div class="panel bk-confirm"><h3>Bring back this backup?</h3><p>' +
        esc(P.src) +
        (P.when ? ', saved ' + esc(when(P.when)) : '') +
        ': ' +
        esc(countText(c) || 'no characters') +
        '.</p><p class="notice">Everything in the app on this device is replaced by the backup (characters, house rules, encounters…). ' +
        'You can undo it right after.</p><div class="toolbar">' +
        btn('bkRestoreOk', 'Yes, bring it back', {}, 'btn primary') +
        btn('bkRestoreNo', 'Cancel', {}, 'btn') +
        '</div></div>'
      );
    }
    function setupHtml() {
      return (
        '<details class="panel"' +
        (G.clientId() ? '' : ' open') +
        '><summary><b>One-time setup</b> (about 10 minutes, free)</summary><p class="small">Google needs to know this app before it can save in your Drive. Make it known once:</p><ol class="small">' +
        '<li>Go to <a href="https://console.cloud.google.com/" target="_blank" rel="noopener">console.cloud.google.com</a> with your Google account, and create a project named <i>Character Forge</i>.</li>' +
        '<li>In <b>APIs &amp; Services → Library</b>, find <b>Google Drive API</b> and tap <b>Enable</b>.</li>' +
        '<li>In <b>Google Auth Platform</b> (or <b>OAuth consent screen</b>): app name <i>Character Forge</i>, your email, audience <b>External</b>. Under <b>Data access</b>, add the scope <code>…/auth/drive.file</code>. Under <b>Audience</b>, tap <b>Publish app</b> so anyone can sign in (this permission needs no review by Google).</li>' +
        '<li>In <b>Clients</b> (or <b>Credentials</b>): <b>Create client</b>, type <b>Web application</b>. Authorized JavaScript origin: <code>' +
        esc(G.origin()) +
        '</code>. Authorized redirect URI: <code>' +
        esc(G.redirect()) +
        '</code>. Create, then copy the <b>Client ID</b> and paste it here.</li></ol>' +
        '<div class="toolbar"><input type="text" id="bk-id" data-bk="id" value="' +
        esc(B.id || G.clientId()) +
        '" placeholder="…apps.googleusercontent.com" autocomplete="off" style="flex:1;min-width:12rem"></div>' +
        '<p class="small muted">The Client ID is the app’s public name at Google, not a password. It and your sign-in stay in this browser.</p></details>'
      );
    }
    function html() {
      var s = G.state(),
        linked = G.linked(),
        c = counts(api.store),
        h =
          '<main class="home backup"><h2>☁ Backup</h2><p class="muted">Everything in the app on this device (' +
          esc(countText(c) || 'no characters yet') +
          ', house rules, encounters, notes…) saved as one file in your Google Drive. If this device or the app is lost, sign in on any device and bring it all back.</p>';
      h += restorePanel();
      if (B.msg)
        h +=
          '<p class="panel small rest-msg">' +
          esc(B.msg) +
          (G.waiting() ? ' ' + btn('bkCancel', 'Cancel', {}, 'btn tiny') : '') +
          '</p>';
      if (B.prev)
        h +=
          '<p class="panel small">Backup brought back. ' +
          btn('bkUndo', '↶ Undo: put back what was here', {}, 'btn small') +
          '</p>';
      h += '<div class="panel"><h3>Google Drive</h3>';
      if (linked) {
        h +=
          '<p>Last backup: <b>' +
          esc(ago(s.last)) +
          '</b>' +
          (s.pending ? ' <span class="small muted">(changes since)</span>' : '') +
          '</p><label class="check"><input type="checkbox" data-bk="auto"' +
          (s.auto === false ? '' : ' checked') +
          '> Back up automatically after changes</label><p class="small muted">Saved in the <b>Character Forge</b> folder of your Drive: <i>' +
          esc(G.MAIN) +
          '</i>, plus a dated copy each day (the last 14). Google keeps you signed in for an hour; after that, a tap on <b>Back up now</b> signs in again.</p><div class="toolbar">' +
          btn('bkNow', '☁ Back up now', {}, 'btn primary') +
          btn('bkList', '⟲ Restore from Drive…', {}, 'btn') +
          btn('bkOff', 'Disconnect', {}, 'btn') +
          '</div>';
        if (B.files)
          h += B.files.length
            ? '<ul class="se-list bk-files">' +
              B.files
                .map(function (f) {
                  return (
                    '<li><div class="se-what"><b>' +
                    esc(f.name.replace(/\.json$/, '')) +
                    '</b> <span class="small muted">' +
                    esc(when(f.modifiedTime)) +
                    (f.size ? ', ' + Math.max(1, Math.round(f.size / 1024)) + ' KB' : '') +
                    '</span></div><div class="se-btns">' +
                    btn('bkPick', 'Restore', { v: f.id }, 'btn small') +
                    '</div></li>'
                  );
                })
                .join('') +
              '</ul>'
            : '<p class="small muted">No backups in your Drive yet.</p>';
      } else
        h +=
          '<p class="small">Sign in with Google once on this device. The app only sees the files it makes itself, never the rest of your Drive. <a href="privacy.html" target="_blank" rel="noopener">Privacy</a></p><div class="toolbar">' +
          btn('bkConnect', 'Connect Google Drive', {}, 'btn primary') +
          '</div>';
      h += '</div>';
      if (!G.builtIn) h += setupHtml();
      h +=
        '<div class="panel"><h3>Without Google</h3><p class="small">Download the same backup file, to keep anywhere (email, USB key, another cloud). <b>Import</b> on the Characters page brings it back.</p><div class="toolbar">' +
        btn('bkFile', '⇩ Download backup file', {}, 'btn') +
        btn('bkOpen', '⇧ Restore from a file', {}, 'btn') +
        '</div><input type="file" id="bkFile" accept=".json,application/json" hidden></div>' +
        '<p class="small muted">Imported books, monsters and item texts are not in the backup (they are big): import them again if needed.</p></main>';
      return h;
    }
    // the short line under the home page's wheel
    function homeLine() {
      var s = G.state();
      var label = !s.known
        ? '☁ Back up to Google Drive'
        : s.pending && !G.signedIn()
          ? '☁ Changes not backed up yet'
          : '☁ Backed up ' + ago(s.last);
      return (
        '<p class="home-backup">' +
        btn(
          'section',
          label,
          { v: 'backup' },
          'btn small' + (s.known && s.pending && !G.signedIn() ? ' primary' : '')
        ) +
        '</p>'
      );
    }
    var actions = {
      bkConnect: function () {
        withGoogle(function () {
          G.set('auto', G.state().auto !== false);
          B.msg = 'Connected to Google Drive.';
          // a new device with an empty app: look for backups at once
          if (!api.store.chars.some(api.hasContent)) loadList();
          else backupNow(false);
        });
      },
      bkCancel: function () {
        G.cancel();
      },
      bkNow: function () {
        withGoogle(function () {
          backupNow(false);
        });
      },
      bkList: function () {
        withGoogle(loadList);
      },
      bkPick: function (v) {
        B.busy = true;
        B.msg = 'Getting the backup…';
        G.download(v).then(function (o) {
          B.busy = false;
          B.msg = '';
          if (typeof o === 'string')
            try {
              o = JSON.parse(o);
            } catch (e) {
              o = null;
            }
          if (!isBackup(o)) return fail(new Error('That file is not a Character Forge backup.'));
          var f = (B.files || []).filter(function (x) {
            return x.id === v;
          })[0];
          offer(o, f ? f.name.replace(/\.json$/, '') : 'Google Drive');
          api.render();
        }, fail);
      },
      bkRestoreOk: function () {
        if (!B.pick) return;
        B.prev = JSON.stringify(api.store);
        api.apply(B.pick.data.store);
        if (G.linked()) G.set('restored', 1);
        B.pick = null;
        B.files = null;
        B.msg = '';
        window.scrollTo(0, 0);
      },
      bkRestoreNo: function () {
        B.pick = null;
      },
      bkUndo: function () {
        if (B.prev) api.apply(JSON.parse(B.prev));
        B.prev = null;
      },
      bkOff: function () {
        G.disconnect();
        B.files = null;
        B.msg = 'Disconnected. Your backups stay in your Drive.';
      },
      bkFile: function () {
        var blob = new Blob([file()], { type: 'application/json' }),
          a = document.createElement('a'),
          d = new Date();
        a.href = URL.createObjectURL(blob);
        a.download =
          'character-forge-backup-' +
          d.getFullYear() +
          '-' +
          ('0' + (d.getMonth() + 1)).slice(-2) +
          '-' +
          ('0' + d.getDate()).slice(-2) +
          '.json';
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(function () {
          URL.revokeObjectURL(a.href);
        }, 1000);
        return false;
      },
      bkOpen: function () {
        document.getElementById('bkFile').click();
        return false;
      }
    };
    function onInput(t) {
      var k = t.getAttribute && t.getAttribute('data-bk');
      if (k === 'id') {
        B.id = t.value.trim();
        return true;
      }
      if (k === 'auto') {
        G.set('auto', t.checked);
        return true;
      }
      return false;
    }
    // a backup file chosen on the device
    function readFile(input) {
      var f = input.files && input.files[0];
      if (!f) return;
      var r = new FileReader();
      r.onload = function () {
        input.value = '';
        var o = null;
        try {
          o = JSON.parse(r.result);
        } catch (e) {
          o = null;
        }
        if (isBackup(o)) offer(o, f.name.replace(/\.json$/, ''));
        else B.msg = 'That file is not a Character Forge backup.';
        api.render();
      };
      r.readAsText(f);
    }
    // back from Google's page with the whole page (when the small window was blocked)
    var back = G.returned();
    if (back && !back.popup) {
      ui.section = 'backup';
      B.msg = back.ok ? 'Connected to Google Drive. Tap Back up now or Restore.' : back.err || '';
    }
    return {
      html: html,
      homeLine: homeLine,
      actions: actions,
      onInput: onInput,
      readFile: readFile,
      changed: changed,
      isBackup: isBackup,
      offer: offer,
      popupDone: !!(back && back.popup)
    };
  };
})(typeof window !== 'undefined' ? window : globalThis);
