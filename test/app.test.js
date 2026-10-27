// The app in a real browser: opens every game, builds and levels a character, the Books shelf, Backup (with Google
// faked), Shadowdark (import, torches, dying), the Pets tab, the sheet shortcuts, and the GM's table with a phone
// (needs the `peer` package for a local PeerJS server; skipped without it).
// Run: npm run test:app   (needs `npm install` once: playwright, peer)
'use strict';
var assert = require('assert'),
  path = require('path'),
  fs = require('fs'),
  spawn = require('child_process').spawn;
var chromium = require('playwright').chromium;
var ROOT = path.join(__dirname, '..'),
  PORT = 8790 + Math.floor(Math.random() * 100),
  PEER = PORT + 1,
  BASE = 'http://localhost:' + PORT + '/',
  FIX = path.join(__dirname, 'fixtures');
var passed = 0,
  failed = [],
  skipped = [];

function wait(ms) {
  return new Promise(function (r) {
    setTimeout(r, ms);
  });
}
async function test(name, fn) {
  try {
    await fn();
    passed++;
    console.log('  ✓ ' + name);
  } catch (e) {
    failed.push(name);
    console.log('  ✗ ' + name + '\n      ' + String((e && e.stack) || e).split('\n').slice(0, 3).join('\n      '));
  }
}
var browser, errors = [];
async function page(width, opts) {
  // bypassCSP: the local PeerJS server is plain ws://, which the page's policy (wss: only) would block
  var ctx = await browser.newContext(
    Object.assign({ viewport: { width: width || 390, height: 900 }, bypassCSP: true }, opts || {})
  );
  await ctx.addInitScript(
    'window.TABLE_PEER_OPTS={host:"127.0.0.1",port:' + PEER + ',path:"/",secure:false,config:{iceServers:[]}}'
  );
  var p = await ctx.newPage();
  p.on('pageerror', function (e) {
    errors.push(String(e));
  });
  await p.goto(BASE);
  await p.waitForSelector('.hub');
  p.ctx = ctx;
  return p;
}
function text(p, sel) {
  return p.locator(sel).first().innerText();
}

// Google, faked: sign-in comes straight back with a token; Drive keeps files in memory
function fakeGoogle(ctx, drive) {
  var ids = 1;
  ctx.route('https://accounts.google.com/**', function (route) {
    var q = new URL(route.request().url()).searchParams;
    route.fulfill({
      status: 302,
      headers: {
        Location: q.get('redirect_uri') + '#access_token=tok&token_type=Bearer&expires_in=3599&state=' + q.get('state')
      }
    });
  });
  ctx.route('https://oauth2.googleapis.com/**', function (r) {
    r.fulfill({ status: 200, body: '{}' });
  });
  ctx.route('https://www.googleapis.com/**', function (route) {
    var r = route.request(),
      u = new URL(r.url()),
      m = r.method(),
      ok = function (o) {
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(o) });
      };
    if (/\/about$/.test(u.pathname)) return ok({ user: { emailAddress: 'me@example.com' } });
    if (/^\/upload\//.test(u.pathname)) {
      if (m === 'POST') {
        var parts = r.postData().split('\r\n\r\n'),
          meta = JSON.parse(parts[1].split('\r\n--')[0]),
          body = parts[2].slice(0, parts[2].lastIndexOf('\r\n--')),
          id = String(ids++);
        drive[id] = { id: id, name: meta.name, parents: meta.parents, content: body, modifiedTime: new Date().toISOString() };
        return ok({ id: id });
      }
      var fid = u.pathname.split('/').pop();
      if (!drive[fid]) return route.fulfill({ status: 404, body: '{}' });
      drive[fid].content = r.postData();
      return ok({ id: fid });
    }
    if (m === 'POST') {
      var fm = JSON.parse(r.postData()),
        nid = String(ids++);
      drive[nid] = { id: nid, name: fm.name, folder: true };
      return ok({ id: nid });
    }
    if (m === 'DELETE') {
      delete drive[u.pathname.split('/').pop()];
      return route.fulfill({ status: 204 });
    }
    if (u.searchParams.get('alt') === 'media')
      return route.fulfill({ status: 200, contentType: 'application/json', body: drive[u.pathname.split('/').pop()].content });
    var qq = u.searchParams.get('q') || '';
    if (/folder/.test(qq))
      return ok({
        files: Object.values(drive).reduce(function (a, f) {
          if (f.folder) a.push({ id: f.id });
          return a;
        }, [])
      });
    var par = /'(\w+)' in parents/.exec(qq)[1];
    ok({
      files: Object.values(drive).reduce(function (a, f) {
        if ((f.parents || []).indexOf(par) >= 0) a.push({ id: f.id, name: f.name, modifiedTime: f.modifiedTime, size: f.content.length });
        return a;
      }, [])
    });
  });
}

(async function () {
  var server = spawn(process.execPath, ['server.js', String(PORT)], { cwd: ROOT, stdio: 'ignore' }),
    peer = null;
  try {
    var express = require('express'),
      http = require('http'),
      app = express();
    peer = http.createServer(app);
    app.use('/', require('peer').ExpressPeerServer(peer, { path: '/' }));
    peer.listen(PEER, '127.0.0.1');
  } catch (e) {
    peer = null;
  }
  await wait(800);
  browser = await chromium.launch();
  console.log('App tests (' + BASE + ')');
  try {
    await test('every game opens', async function () {
      var p = await page();
      var titles = [];
      for (var g of ['pf2', 'mm', 'sd', 'dnd']) {
        await p.click('[data-act=game][data-v=' + g + ']');
        await wait(300);
        titles.push(await p.title());
      }
      assert.deepEqual(titles.map(function (t) { return t.split(' — ')[0]; }), ['Pathfinder 2e', 'M&M 3e', 'Shadowdark', 'Home']);
      await p.ctx.close();
    });

    await test('other games load only when chosen, and their pages work', async function () {
      var p = await page();
      var before = await p.evaluate(function () {
        return [typeof PF2UI, typeof MMUI, typeof SDUI];
      });
      assert.deepEqual(before, ['undefined', 'undefined', 'undefined'], 'not read at start');
      await p.click('[data-act=game][data-v=pf2]');
      await p.waitForSelector('.hub-item[data-v=pf2-chars]');
      await p.click('.hub-item[data-v=pf2-chars]');
      await wait(1500);
      assert.ok((await p.locator('main').innerText()).length > 50, 'PF2 characters page');
      await p.click('[data-act=game][data-v=mm]');
      await p.waitForSelector('.hub-item[data-v=mm-heroes]');
      await p.click('.hub-item[data-v=mm-heroes]');
      await p.waitForSelector('.mm-tabs');
      await p.click('[data-act=section][data-v=dm]');
      await p.waitForSelector('.dm-page');
      var after = await p.evaluate(function () {
        return [typeof PF2UI, typeof MMUI, typeof SDUI, !!(DND.spellText && DND.featureText)];
      });
      assert.deepEqual(after, ['function', 'function', 'undefined', true]);
      await p.reload();
      await p.waitForSelector('.mm-tabs, .hub, .dm-page');
      assert.ok(/M&M/.test(await p.title()), 'reopens in M&M: ' + (await p.title()));
      await p.ctx.close();
    });

    await test('D&D: level-up screen adds a level and average hit points', async function () {
      var p = await page();
      await p.click('.hub-item[data-v=roster]');
      await p.locator('.roster-card').first().click();
      await p.evaluate(function () {
        var s = Forge.store;
        s.chars[0].classes = [{ cls: 'fighter', level: 3, subclass: '' }];
        Forge.ui.mode = 'play';
        Forge.ui.step = 'play';
        Forge.render();
      });
      var hp0 = await p.evaluate(function () { return Forge.derived().hp; });
      await p.click('[data-act=levelUp]');
      await p.click('[data-act=lvlHow][data-v=avg]');
      await p.click('[data-act=lvlOk]');
      var after = await p.evaluate(function () { return [Forge.derived().level, Forge.derived().hp]; });
      assert.equal(after[0], 4);
      assert.ok(after[1] > hp0, 'more hit points');
      await p.ctx.close();
    });

    await test('character bar folds, Pets tab, sheet shortcuts', async function () {
      var p = await page();
      await p.click('.hub-item[data-v=roster]');
      await p.locator('.roster-card').first().click();
      assert.equal(await p.locator('[data-act=new]').count(), 0, 'New is folded away');
      await p.click('[data-act=charMenu]');
      assert.equal(await p.locator('[data-act=new]').count(), 1);
      await p.evaluate(function () {
        Forge.store.chars[0].classes = [{ cls: 'wizard', level: 3, subclass: '' }];
        Forge.ui.mode = 'play';
        Forge.ui.step = 'companions';
        Forge.render();
      });
      await p.fill('#comp-new-n', 'Biscuit');
      await p.fill('#comp-new-k', 'cat');
      await p.click('[data-act=compCustom]');
      assert.ok((await text(p, 'main')).indexOf('Biscuit') >= 0);
      await p.click('[data-act=step][data-v=sheet]');
      var chips = await p.locator('.sheet-jump .pill').allInnerTexts();
      assert.ok(chips.indexOf('Wizard') >= 0 && chips.indexOf('Skills') >= 0, chips.join(','));
      await p.ctx.close();
    });

    await test('saving: a full localStorage falls back to IndexedDB; nothing saved shows a warning', async function () {
      var ctx = await browser.newContext({ viewport: { width: 390, height: 900 } });
      // this device's localStorage is "full" for the characters
      await ctx.addInitScript(function () {
        var set = Storage.prototype.setItem;
        Storage.prototype.setItem = function (k, v) {
          if (k === 'character-forge.v1') throw new DOMException('full', 'QuotaExceededError');
          return set.call(this, k, v);
        };
      });
      var p = await ctx.newPage();
      p.on('pageerror', function (e) {
        errors.push(String(e));
      });
      await p.goto(BASE);
      await p.waitForSelector('.hub');
      await p.evaluate(function () {
        Forge.store.chars[0].name = 'Saved in IndexedDB';
      });
      await p.evaluate(function () {
        window.dispatchEvent(new Event('pagehide'));
      });
      await wait(500);
      await p.reload();
      await p.waitForSelector('.hub');
      await wait(500);
      var name = await p.evaluate(function () {
        return Forge.store.chars[0].name;
      });
      assert.equal(name, 'Saved in IndexedDB');
      // and now IndexedDB fails too
      await p.evaluate(function () {
        IDBObjectStore.prototype.put = function () {
          throw new Error('blocked');
        };
        Forge.store.chars[0].name = 'Lost';
        window.dispatchEvent(new Event('pagehide'));
      });
      await wait(500);
      assert.equal(await p.locator('.save-bar').count(), 1, 'warning shown');
      await ctx.close();
    });

    await test('Books shelf opens a book (not the backup file picker)', async function () {
      var p = await page();
      await p.click('.hub-item[data-v=books]');
      await p.waitForSelector('[data-act=bkOpen]');
      await p.locator('[data-act=bkOpen]').first().click();
      assert.equal(await p.locator('.bk-main').count(), 1);
      await p.ctx.close();
    });

    await test('Generators: NPCs come with a physical description', async function () {
      var p = await page();
      await p.evaluate(function () {
        Forge.ui.section = 'gen';
        Forge.render();
      });
      await p.click('[data-act=genRoll]');
      var t = await text(p, '.gen-card');
      assert.ok(/Body:/.test(t) && /Face:/.test(t) && /Wears:/.test(t), t);
      await p.ctx.close();
    });

    await test('Shadowdark: import, torches from the gear, dying, re-import updates', async function () {
      var p = await page();
      await p.click('[data-act=game][data-v=sd]');
      await p.click('.hub-item[data-v=sd-chars]');
      await p.setInputFiles('#sdImportFile', path.join(FIX, 'shadowdarklings-sample.json'));
      await p.waitForSelector('.sd-bar');
      assert.ok(/Dwarf · Priest · level 1/.test(await text(p, '.sd-bar')));
      await p.click('[data-act=sdTab][data-v=play]');
      await p.click('[data-act=sdTorch][data-v=start]');
      assert.ok(/2 left/.test(await text(p, '.rest-msg')));
      await p.click('[data-act=sdHp][data-v="-5"]');
      await p.click('[data-act=sdHp][data-v="-5"]');
      assert.equal(await p.locator('.sd-dying').count(), 1, 'dying box at 0 HP');
      await p.click('[data-act=sdDieUp]');
      assert.equal(await p.locator('.sd-dying').count(), 0);
      var j = JSON.parse(fs.readFileSync(path.join(FIX, 'shadowdarklings-sample.json')));
      j.level = 2;
      j.maxHitPoints = 11;
      var tmp = path.join(require('os').tmpdir(), 'cf-sdl2-' + PORT + '.json');
      fs.writeFileSync(tmp, JSON.stringify(j));
      await p.setInputFiles('#sdImportFile', tmp);
      await p.click('[data-act=sdReUpdate]');
      var c = await p.evaluate(function () {
        var s = Forge.store.sd;
        return [s.chars.length, s.chars[0].level, s.chars[0].track.hp];
      });
      assert.deepEqual(c, [1, 2, 1], 'one character, level 2, hit points kept');
      fs.unlinkSync(tmp);
      await p.ctx.close();
    });

    await test('Backup: to the (fake) Drive, and back on another device', async function () {
      var drive = {};
      var a = await page();
      fakeGoogle(a.ctx, drive);
      await a.evaluate(function () {
        Forge.store.chars[0].name = 'Thorin';
        Forge.store.chars[0].classes = [{ cls: 'fighter', level: 2, subclass: '' }];
        Forge.render();
      });
      await a.click('.home-backup button');
      await a.click('[data-act=buConnect]');
      await wait(2500);
      var main = Object.values(drive).filter(function (f) { return f.name === 'Character Forge backup.json'; })[0];
      assert.ok(main && /Thorin/.test(main.content), 'backup file in the Drive');
      var b = await page();
      fakeGoogle(b.ctx, drive);
      await b.click('.home-backup button');
      await b.click('[data-act=buConnect]');
      await wait(2500);
      await b.locator('.bk-files [data-act=buPick]').first().click();
      await b.click('[data-act=buRestoreOk]');
      var names = await b.evaluate(function () { return Forge.store.chars.map(function (c) { return c.name; }); });
      assert.deepEqual(names, ['Thorin']);
      await a.ctx.close();
      await b.ctx.close();
    });

    if (!peer) skipped.push('the GM’s table (install the peer package)');
    else
      await test('the GM’s table: a phone joins, damage and the party’s light arrive', async function () {
        var dm = await page(1100),
          pl = await page();
        await dm.click('[data-act=game][data-v=sd]');
        await dm.click('.hub-item[data-v=dm]');
        await dm.click('[data-act=dmOpen]');
        await dm.waitForSelector('.tbl-code', { timeout: 8000 }).catch(async function (e) {
          console.log((await text(dm, 'main')).slice(0, 600));
          throw e;
        });
        var code = (await text(dm, '.tbl-code')).trim();
        await pl.click('[data-act=game][data-v=sd]');
        await pl.click('.hub-item[data-v=sd-chars]');
        await pl.setInputFiles('#sdImportFile', path.join(FIX, 'shadowdarklings-sample.json'));
        await pl.click('[data-act=sdTab][data-v=play]');
        await pl.fill('#tp-code', code);
        await pl.click('[data-act=tpJoin]');
        await wait(2500);
        await dm.click('[data-act=dmTorch][data-v=start]');
        await dm.fill('#dm-amt', '3');
        await dm.click('[data-act=dmFx][data-v=dmg]');
        await wait(2000);
        assert.ok(/HP 3\/6/.test(await text(pl, '.sd-bar')), 'damage arrived');
        assert.ok(/party’s light/.test(await text(pl, '.torch')), 'party light shown');
        await dm.ctx.close();
        await pl.ctx.close();
      });

    await test('no errors on any page', async function () {
      assert.deepEqual(errors, []);
    });
  } finally {
    await browser.close();
    server.kill();
    if (peer && peer.close) peer.close();
  }
  console.log(
    '\n' + passed + ' passed' + (failed.length ? ', ' + failed.length + ' failed' : '') + (skipped.length ? ', skipped: ' + skipped.join('; ') : '')
  );
  process.exit(failed.length ? 1 : 0);
})();
