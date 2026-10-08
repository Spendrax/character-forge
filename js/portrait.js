// Close-up pixel portrait: head and shoulders on a 64 x 64 grid, drawn in code like the full figure.
// Shares the same look (skin, hair, eyes, lineage features) and gear as js/avatar.js.
(function (root) {
  'use strict';
  var A = root.Avatar, N = 64, shade = A._shade;
  var OUT = '#1a1622', METAL = '#c9d1d9', STEEL = '#8a96a3', LEATHER = '#7a4a28', GOLD = '#e0b040', WOOD = '#8b5a2b', WHITE = '#f4f0ea', LASH = '#2a1e22', PUPIL = '#16121c';

  function hex(c) { c = c.replace('#', ''); return [0, 2, 4].map(function (i) { return parseInt(c.substr(i, 2), 16); }); }
  function mix(a, b, t) { var x = hex(a), y = hex(b); return '#' + x.map(function (v, i) { return ('0' + Math.round(v + (y[i] - v) * t).toString(16)).slice(-2); }).join(''); }

  function Grid() { this.p = {}; }
  Grid.prototype.set = function (x, y, c) { if (x >= 0 && y >= 0 && x < N && y < N && c) this.p[x + ',' + y] = c; };
  Grid.prototype.get = function (x, y) { return this.p[x + ',' + y]; };
  Grid.prototype.rect = function (x, y, w, h, c) { for (var i = 0; i < w; i++) for (var j = 0; j < h; j++) this.set(x + i, y + j, c); };
  // draw at x and at its mirror across the vertical centre line (columns 31 | 32)
  Grid.prototype.both = function (x, y, c) { this.set(x, y, c); this.set(N - 1 - x, y, c); };
  Grid.prototype.bothRect = function (x, y, w, h, c) { this.rect(x, y, w, h, c); this.rect(N - x - w, y, w, h, c); };
  Grid.prototype.line = function (x0, y0, x1, y1, c, mirror) {
    var dx = Math.abs(x1 - x0), dy = Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1, e = dx - dy;
    for (;;) { if (mirror) this.both(x0, y0, c); else this.set(x0, y0, c); if (x0 === x1 && y0 === y1) break; var e2 = 2 * e; if (e2 > -dy) { e -= dy; x0 += sx; } if (e2 < dx) { e += dx; y0 += sy; } }
  };
  Grid.prototype.outline = function (c) {
    var add = [], self = this;
    Object.keys(this.p).forEach(function (k) {
      var xy = k.split(','), x = +xy[0], y = +xy[1];
      [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (d) { if (!self.get(x + d[0], y + d[1])) add.push([x + d[0], y + d[1]]); });
    });
    add.forEach(function (a) { self.set(a[0], a[1], c); });
  };

  // ---------- face geometry ----------
  var SHAPES = { oval: { w: 11, h: 30 }, round: { w: 12, h: 28 }, square: { w: 12, h: 30 }, heart: { w: 12, h: 30 }, 'long': { w: 10, h: 33 } };
  function halfWidth(shape, W, t) {
    var f;
    if (t < 0.45) { var u = (0.45 - t) / 0.45; f = Math.max(0.45, Math.sqrt(1 - u * u)); }
    else {
      var v = (t - 0.45) / 0.55;
      if (shape === 'round') f = Math.max(0.35, Math.pow(1 - Math.pow(v, 3), 0.5));
      else if (shape === 'square') f = v < 0.7 ? 1 : 1 - (v - 0.7) / 0.3 * 0.5;
      else if (shape === 'heart') f = Math.max(0.25, 1 - 0.75 * Math.pow(v, 1.3));
      else f = Math.max(0.3, Math.pow(1 - Math.pow(v, 2.2), 0.6));
    }
    return Math.max(2, Math.round(W * f));
  }

  // eye maps (left eye; the right eye is its mirror). l lash, w white, i iris, h highlight, p pupil, g glow
  var EYES = {
    round: ['.llll.', 'lwhiwl', 'lwipwl', '.wwww.'],
    almond: ['.llll.', 'lwhiwl', '.wipw.'],
    narrow: ['llllll', '.wipw.'],
    wide: ['.llll.', 'lwhiwl', 'lwiiwl', 'lwipwl', '.llll.'],
    sleepy: ['llllll', 'lwhiwl', '.wipw.'],
    slit: ['.llll.', 'lihpil', 'liipil', '.iiii.'],
    bird: ['.llll.', 'lhiiil', 'liipil', '.llll.'],
    construct: ['llllll', 'lgiigl', 'llllll']
  };
  // brow heights over 5 points, outer to inner, relative to the eye's top row
  var BROWS = { thin: [[-1, -2, -2, -2, -2]], thick: [[-2, -2, -2, -2, -2], [null, -3, -3, -3, -3]], arched: [[-1, -2, -3, -3, -2]],
    angry: [[-3, -3, -2, -2, -1], [null, -4, -3, null, null]], worried: [[-1, -2, -2, -3, -4]] };

  var BACKDROP = { grass: ['#3a5a3a', '#2a4030', '#1c2a22'], stone: ['#4a5060', '#363b48', '#24272f'], sand: ['#7a6440', '#5a4a30', '#3a3020'], snow: ['#6f849c', '#52667e', '#36445a'],
    water: ['#2f5a80', '#234462', '#172e44'], lava: ['#6a2a1e', '#4a1e16', '#2a1210'], 'void': ['#4a3a8a', '#33286a', '#1f1844'] };

  A.drawPortrait = function (canvas, look, gear) {
    var L = look, gr = gear || { armor: 'none', slots: {}, magic: [] }, S = gr.slots || {};
    var g = new Grid();
    var head = L.head || 'human', human = head === 'human' || head === 'tusked';
    var shape = SHAPES[L.faceShape] ? L.faceShape : 'oval', W = SHAPES[shape].w, H = SHAPES[shape].h;
    if (L.build === 'broad' && shape !== 'long') W += 1;
    var chinY = 46, hy = chinY - H + 1, eyT = hy + Math.round(H * 0.47), nT = eyT + 4, my = eyT + 10;
    var skin = L.skin, skinD = shade(skin, -0.22), skinDD = shade(skin, -0.45), skinL = shade(skin, 0.14);
    var hair = L.hairColor, hairD = shade(hair, -0.25), hairT = shade(hair, -0.12), hairL = shade(hair, 0.25);
    var hw = {};
    for (var r = 0; r < H; r++) hw[hy + r] = halfWidth(shape, W, r / (H - 1));
    var hwAt = function (y) { return hw[y] || 0; };
    var edgeL = function (y) { return 32 - hwAt(y); }, edgeR = function (y) { return 31 + hwAt(y); };
    var cloth = L.cloak || shade(L.shirt, -0.3);
    var hood = L.acc === 'hood' && !S.helm && !S.hat;
    var longHair = /^(long|braids)$/.test(L.hair);

    // ---------- 1. behind the head ----------
    var backW = gr.back || (gr.main && /great|bow|staff|spear/.test(gr.main.kind) ? gr.main : null);
    if (backW) {
      var k = backW.kind;
      if (k === 'bow') { for (var by = 22; by < 60; by++) { var o = Math.round(Math.sin((by - 22) / 37 * Math.PI) * 5); g.set(46 + o, by, WOOD); g.set(47 + o, by, shade(WOOD, -0.2)); } g.line(46, 22, 46, 59, '#e8e0cc'); }
      else if (k === 'staff' || k === 'spear') { g.line(42, 63, 52, 18, WOOD); g.line(43, 63, 53, 18, shade(WOOD, -0.2)); if (k === 'spear') { g.rect(52, 12, 2, 6, METAL); g.set(52, 11, METAL); } else { g.rect(51, 15, 4, 3, shade(WOOD, -0.3)); g.rect(52, 13, 2, 2, backW.glow || '#9fe0ff'); } }
      else { g.line(40, 63, 49, 33, STEEL); g.line(41, 63, 50, 33, METAL); g.line(50, 33, 53, 26, LEATHER); g.line(51, 33, 54, 26, shade(LEATHER, -0.2)); g.line(46, 31, 54, 35, GOLD); g.rect(53, 24, 3, 2, GOLD); }
    }
    if (hood) {
      for (var y = hy - 5; y < 56; y++) {
        var t = (y - (hy + H * 0.4)) / (H * 0.4 + 5), half = y < hy + H * 0.4 ? Math.round((W + 5) * Math.sqrt(Math.max(0, 1 - t * t))) : W + 5 + Math.max(0, y - chinY) * 2;
        for (var x = 32 - half; x < 32 + half; x++) g.set(x, y, x > 31 + half - 3 ? shade(cloth, -0.18) : cloth);
      }
    }
    if (L.hair !== 'bald' && !hood) {
      if (longHair || L.hair === 'curly') {
        var bottom = longHair ? 58 : my, extra = L.hair === 'curly' ? 3 : 2;
        for (var y2 = hy - 2; y2 <= bottom; y2++) {
          var h2 = y2 < hy ? hwAt(hy) - (hy - y2) * 2 + extra : y2 <= chinY ? Math.max(hwAt(y2), W - 1) + extra : W + extra - Math.max(0, y2 - 54);
          for (var x2 = 32 - h2; x2 < 32 + h2; x2++) g.set(x2, y2, ((x2 + y2 * 2) % 5 === 0) ? hairT : hair);
        }
      } else if (L.hair === 'ponytail') { g.line(32 + W - 2, hy + 3, 32 + W + 3, 54, hair); g.line(32 + W - 1, hy + 3, 32 + W + 4, 54, hair); g.line(32 + W, hy + 4, 32 + W + 5, 52, hairD); g.rect(32 + W - 2, hy + 4, 3, 2, GOLD); }
      else if (L.hair === 'bun') { for (var by2 = -4; by2 <= 3; by2++) for (var bx2 = -4; bx2 <= 3; bx2++) if (bx2 * bx2 + by2 * by2 <= 14) g.set(32 + bx2, hy - 4 + by2, (bx2 + by2) % 3 ? hair : hairD); }
    }
    if (L.wings !== 'none') {
      var wc = L.wings === 'bat' ? shade(skin, -0.35) : L.wings === 'fairy' ? '#bfe6ff' : shade(hair, 0.1);
      for (var wi = 0; wi < 9; wi++) { g.rect(3 + wi, 30 + wi, 1, 26 - wi * 2, wi % 2 ? wc : shade(wc, -0.15)); g.rect(60 - wi, 30 + wi, 1, 26 - wi * 2, wi % 2 ? wc : shade(wc, -0.15)); }
    }
    if (L.extra === 'shell') { for (var sy0 = 44; sy0 < 64; sy0++) { var shw = Math.min(30, 14 + (sy0 - 44) * 2); for (var sx0 = 32 - shw; sx0 < 32 + shw; sx0++) g.set(sx0, sy0, (sx0 + sy0) % 6 ? '#6b5a3a' : '#54462c'); } }

    // ---------- 2. shoulders and clothes ----------
    var sw = function (y) { var b = L.build === 'broad' ? 2 : L.build === 'slim' ? -2 : 0; return Math.min(31, 11 + b + (y - 49) * 4); };
    var armor = gr.armor || 'none', body = armor === 'light' ? LEATHER : armor === 'medium' ? STEEL : armor === 'heavy' ? METAL : S.robe ? (L.cloak || L.shirt) : L.shirt;
    for (var cy = 50; cy < N; cy++) {
      var w2 = sw(cy);
      for (var cx = 32 - w2; cx < 32 + w2; cx++) {
        var c = body;
        if (armor === 'medium' && (cx + cy) % 2) c = shade(STEEL, -0.15);
        if (cx >= 32 + w2 - 3) c = shade(c, -0.2);
        g.set(cx, cy, c);
      }
    }
    // neckline
    var vTop = armor === 'none' || armor === 'light' || S.robe;
    if (vTop) {
      var inner = armor === 'light' ? L.shirt : null;
      for (var vy = 50; vy < 57; vy++) {
        var kw = Math.max(0, 4 - Math.floor((vy - 50) / 1.6));
        if (!kw) continue;
        for (var vx = 32 - kw; vx < 32 + kw; vx++) g.set(vx, vy, inner && Math.abs(vx - 31.5) > kw - 2 ? inner : vy < 54 ? skin : skinD);
        g.both(32 - kw - 1, vy, S.robe ? GOLD : shade(armor === 'light' ? LEATHER : L.shirt, 0.25));
      }
      if (S.robe) g.rect(31, 56, 2, 8, GOLD);
      if (armor === 'light') { g.line(17, 51, 44, 63, shade(LEATHER, -0.35)); g.line(18, 51, 45, 63, shade(LEATHER, -0.35)); g.rect(30, 57, 3, 2, GOLD); }
    }
    if (armor === 'medium' && /Breastplate|Half Plate/.test(gr.armorName || '')) { g.rect(21, 54, 22, 10, METAL); g.rect(24, 55, 1, 8, shade(METAL, 0.35)); g.rect(31, 54, 2, 10, shade(METAL, -0.12)); }
    if (armor === 'heavy') {
      for (var py = 0; py < 10; py++) for (var px = 0; px < 18; px++) {
        var dx = (px - 9) / 9, dy = (py - 4) / 5;
        if (dx * dx + dy * dy <= 1) g.both(px, 49 + py, py === 0 || (py < 3 && dx * dx + dy * dy < 0.5) ? shade(METAL, 0.3) : py > 6 ? STEEL : METAL);
      }
      g.both(9, 52, STEEL); g.both(13, 53, STEEL);
      g.rect(31, 54, 2, 10, shade(METAL, -0.15));
    }
    if (gr.armorGlow) { g.set(24, 58, gr.armorGlow); g.set(39, 60, gr.armorGlow); }
    if (S.cloak && !hood) {
      for (var ky = 50; ky < N; ky++) { var kw2 = sw(ky); for (var kx = 32 - kw2; kx < 32 - kw2 + 7; kx++) g.both(kx, ky, kx === 32 - kw2 + 6 ? shade(S.cloak.glow ? cloth : cloth, 0.15) : cloth); }
      g.bothRect(24, 50, 2, 2, GOLD);
    }
    if (hood) { for (var hky = 50; hky < N; hky++) { var hkw = sw(hky); for (var hkx = 32 - hkw; hkx < 32 - hkw + 8; hkx++) g.both(hkx, hky, cloth); } }
    if (S.neck) { g.line(27, 49, 31, 55, GOLD); g.line(36, 49, 32, 55, GOLD); g.rect(30, 55, 4, 4, GOLD); g.rect(31, 56, 2, 2, S.neck.glow || '#c42f2f'); }

    // ---------- 3. neck ----------
    var nw = L.build === 'broad' ? 5 : L.build === 'slim' ? 3 : 4;
    for (var ny = chinY - 4; ny < 51; ny++) for (var nx = 32 - nw; nx < 32 + nw; nx++) if (!(vTop && ny >= 50 && g.get(nx, ny) !== skin && g.get(nx, ny) !== skinD && ny > 50)) g.set(nx, ny, nx < 32 - nw + 2 ? skinD : nx > 32 + nw - 3 ? skinDD : skinD);
    if (armor === 'heavy') { g.rect(32 - nw - 2, 47, 2 * nw + 4, 4, STEEL); g.rect(32 - nw - 2, 47, 2 * nw + 4, 1, shade(METAL, 0.2)); }

    // ---------- 4. ears ----------
    var EARS = { round: [[0, -1, 0], [1, -2, 0], [2, -2, 0], [3, -2, 0], [4, -1, 0]],
      pointed: [[-4, -5, -5], [-3, -5, -4], [-2, -4, -3], [-1, -3, -1], [0, -3, 0], [1, -2, 0], [2, -2, 0], [3, -2, 0], [4, -1, 0]],
      'long': [[-2, -9, -8], [-1, -9, -6], [0, -7, -3], [1, -5, 0], [2, -3, 0], [3, -2, 0], [4, -1, 0]] };
    var ear = !hood && EARS[L.ears], earY = eyT;
    if (ear) ear.forEach(function (row) {
      var y = earY + row[0], base = edgeL(earY + 2) - 1;
      for (var d = row[1]; d <= row[2]; d++) g.both(base + d, y, (d > row[1] && d < 0 && row[0] > -2 && row[0] < 4) ? skinD : d === row[1] ? skin : skin);
    });

    // ---------- 5. face ----------
    for (var fy = hy; fy <= chinY; fy++) {
      var fw = hwAt(fy);
      for (var fx = 32 - fw; fx < 32 + fw; fx++) g.set(fx, fy, fx >= 32 + fw - 2 ? (fx === 32 + fw - 1 ? skinD : shade(skin, -0.09)) : skin);
      if (fy === chinY) for (var fx2 = 32 - fw; fx2 < 32 + fw; fx2++) g.set(fx2, fy, skinD);
    }
    g.set(edgeL(eyT + 4) + 2, eyT + 4, skinL); g.set(edgeL(eyT + 4) + 3, eyT + 4, skinL); g.set(edgeL(eyT + 5) + 2, eyT + 5, skinL);
    if (head === 'reptile' || head === 'bird') for (var ty = hy; ty < chinY; ty++) for (var tx = edgeL(ty); tx <= edgeR(ty); tx++) if ((tx * 3 + ty * 5) % 7 === 0 && g.get(tx, ty) === skin) g.set(tx, ty, shade(skin, head === 'bird' ? 0.1 : -0.1));
    if (L.age === 'old') { g.line(28, eyT - 6, 35, eyT - 6, skinD); g.line(29, eyT - 8, 34, eyT - 8, skinD); }

    // ---------- 6. markings ----------
    var exL = 31 - 2 - 5; // left eye's first column (eyes are 6 wide, 2 px from the centre)
    var M = L.marks;
    if (M === 'scar') { g.line(exL + 2, eyT - 5, exL + 4, eyT + 7, mix(skin, '#d88a8a', 0.55)); }
    if (M === 'cheekscar') g.line(38, eyT + 5, 41, eyT + 8, mix(skin, '#d88a8a', 0.55));
    if (M === 'freckles') [[25, 5], [27, 6], [26, 7], [24, 6], [38, 5], [36, 6], [37, 7], [39, 6], [29, 5], [34, 5]].forEach(function (p) { g.set(p[0], eyT + p[1], mix(skin, '#8a4a2a', 0.45)); });
    if (M === 'tattoo') { g.rect(31, eyT - 7, 2, 3, '#3f6fd0'); g.set(30, eyT - 6, '#3f6fd0'); g.set(33, eyT - 6, '#3f6fd0'); g.line(exL, eyT + 5, exL + 3, eyT + 7, '#3f6fd0', true); }
    if (M === 'warpaint') { for (var wx = edgeL(eyT + 4); wx <= edgeR(eyT + 4); wx++) { g.set(wx, eyT + 4, '#b8382c'); if (Math.abs(wx - 31.5) > 4) g.set(wx, eyT + 5, '#b8382c'); } }
    if (M === 'birthmark') { g.rect(26, eyT + 7, 2, 2, mix(skin, '#7a3a3a', 0.4)); g.set(25, eyT + 8, mix(skin, '#7a3a3a', 0.3)); }
    if (M === 'mole') g.set(36, my - 2, skinDD);
    if (L.extra === 'tattoo' && M !== 'tattoo') g.set(31, eyT - 6, '#3f6fd0');

    // ---------- 7. eyes, brows, nose, mouth ----------
    var eyeKind = head === 'construct' ? 'construct' : head === 'bird' ? 'bird' : head === 'reptile' || head === 'feline' ? 'slit' : (EYES[L.eyeShape] ? L.eyeShape : 'round');
    var map = EYES[eyeKind], rows = map.length, eyTop = eyT + (rows === 2 ? 1 : rows === 5 ? -1 : 0);
    var patch = L.acc === 'eyepatch';
    [0, 1].forEach(function (side) {
      var ic = side && L.eyes2 ? L.eyes2 : L.eyes;
      var col = { l: LASH, w: WHITE, i: ic, h: '#ffffff', p: PUPIL, g: shade(ic, 0.55) };
      if (eyeKind === 'construct') col.l = shade(skin, -0.5);
      map.forEach(function (row, j) {
        for (var i = 0; i < row.length; i++) {
          var ch = row[i]; if (ch === '.') continue;
          var x = exL + i; if (side) x = N - 1 - x;
          g.set(x, eyTop + j, col[ch]);
        }
      });
      if (head === 'bird') { /* feathered mask around the eyes */ }
    });
    if (head === 'bird') for (var my2 = eyTop - 1; my2 <= eyTop + rows; my2++) { g.both(exL - 1, my2, shade(skin, 0.25)); g.both(exL + 6, my2, shade(skin, 0.25)); }
    if (L.age === 'old' && human) { g.both(exL - 1, eyT + 2, skinD); g.both(exL - 2, eyT + 1, skinD); g.both(exL - 2, eyT + 3, skinD); g.line(exL + 1, eyTop + rows, exL + 4, eyTop + rows, skinD, true); }
    // brows
    var browC = L.hair === 'bald' || head === 'bird' ? shade(skin, -0.4) : shade(hair, -0.1);
    var B = BROWS[L.brows];
    if (B && head !== 'construct' && head !== 'bird') B.forEach(function (row) {
      for (var k2 = 0; k2 < 6; k2++) { var off = row[Math.min(4, Math.round(k2 * 4 / 5))]; if (off == null) continue; g.both(exL + k2, eyTop + off, browC); }
    });
    if (L.brows === 'thick' && L.age === 'old' && L.hair !== 'bald') g.both(exL + 5, eyTop - 3, shade(hair, 0.4));
    // nose
    if (human) {
      var D = skinD, DD = skinDD, LL = skinL, nose = L.nose;
      if (nose === 'button') { g.set(31, nT + 1, LL); g.set(32, nT + 2, D); g.rect(30, nT + 3, 4, 1, D); g.set(30, nT + 3, DD); g.set(33, nT + 3, DD); }
      else if (nose === 'long') { g.line(32, nT - 2, 32, nT + 3, D); g.line(31, nT - 1, 31, nT + 2, LL); g.rect(30, nT + 4, 4, 1, D); g.set(30, nT + 4, DD); g.set(33, nT + 4, DD); }
      else if (nose === 'broad') { g.rect(32, nT, 1, 3, D); g.set(31, nT + 1, LL); g.rect(29, nT + 3, 6, 1, D); g.set(30, nT + 3, DD); g.set(33, nT + 3, DD); g.set(29, nT + 2, D); g.set(34, nT + 2, D); }
      else if (nose === 'hooked') { g.set(32, nT - 1, D); g.set(33, nT, D); g.set(33, nT + 1, D); g.set(33, nT + 2, D); g.set(32, nT + 3, D); g.set(31, nT + 3, DD); g.set(32, nT, LL); g.set(32, nT + 1, LL); }
      else { g.set(32, nT + 1, D); g.set(33, nT + 2, D); g.rect(31, nT + 3, 2, 1, D); g.set(31, nT + 1, LL); }
    } else if (head === 'reptile') {
      for (var sy2 = nT - 1; sy2 <= chinY - 1; sy2++) for (var sx2 = 27; sx2 <= 36; sx2++) if (g.get(sx2, sy2)) g.set(sx2, sy2, sy2 === nT - 1 ? shade(skin, 0.05) : shade(skin, 0.12));
      g.set(30, nT + 1, skinDD); g.set(33, nT + 1, skinDD);
    } else if (head === 'feline') {
      for (var fy3 = nT; fy3 <= nT + 6; fy3++) for (var fx3 = 26; fx3 <= 37; fx3++) { var ex = (fx3 - 31.5) / 6, ey = (fy3 - (nT + 3.5)) / 3.6; if (ex * ex + ey * ey <= 1) g.set(fx3, fy3, shade(skin, 0.3)); }
      g.rect(30, nT + 2, 4, 1, '#d67a8a'); g.rect(31, nT + 3, 2, 1, '#c45a6a');
    } else if (head === 'bird') {
      for (var by3 = 0; by3 < 9; by3++) { var bw = Math.max(1, 4 - Math.floor(by3 / 2.3)); for (var bx3 = 32 - bw; bx3 < 32 + bw; bx3++) g.set(bx3, nT - 1 + by3, by3 > 5 ? '#b07a10' : bx3 < 31 && by3 < 4 ? '#f0c040' : '#e0a020'); }
      g.line(28, nT + 4, 35, nT + 4, '#9a6a10');
    }
    // mouth
    function mouth() {
      var dk = skinDD, lipC = L.lips === 'red' ? '#b02a3a' : L.lips === 'dark' ? '#4a2030' : shade(skin, -0.14), m = L.mouth;
      if (L.lips !== 'natural') dk = shade(lipC, -0.35);
      if (m === 'grin') { g.rect(29, my - 1, 6, 1, dk); g.rect(29, my, 6, 1, WHITE); g.rect(30, my + 1, 4, 1, dk); g.set(28, my - 2, dk); g.set(35, my - 2, dk); g.set(28, my, dk); g.set(35, my, dk); }
      else if (m === 'open') { g.rect(30, my, 4, 1, WHITE); g.rect(30, my + 1, 4, 1, '#5a1e24'); g.set(29, my, dk); g.set(34, my, dk); g.set(29, my + 1, dk); g.set(34, my + 1, dk); g.rect(30, my - 1, 4, 1, dk); g.rect(30, my + 2, 4, 1, lipC); }
      else {
        g.rect(30, my, 4, 1, dk); g.rect(31, my + 1, 2, 1, lipC);
        if (L.lips !== 'natural') { g.rect(30, my - 1, 4, 1, lipC); g.set(30, my - 1, shade(lipC, 0.1)); }
        if (m === 'smile') { g.set(29, my - 1, dk); g.set(34, my - 1, dk); }
        if (m === 'frown') { g.set(29, my + 1, dk); g.set(34, my + 1, dk); }
        if (m === 'smirk') { g.set(34, my - 1, dk); g.set(35, my - 2, dk); }
      }
      if (head === 'tusked') { g.both(28, my - 1, '#f0ead8'); g.both(28, my - 2, '#f0ead8'); g.both(28, my, '#f0ead8'); g.both(27, my - 2, '#d8d0b8'); }
    }
    if (human) mouth();
    else if (head === 'reptile') { g.rect(25, my, 14, 1, skinDD); g.set(24, my - 1, skinDD); g.set(39, my - 1, skinDD); g.set(27, my + 1, WHITE); g.set(36, my + 1, WHITE); }
    else if (head === 'feline') { g.set(31, nT + 4, skinDD); g.set(32, nT + 4, skinDD); g.set(30, nT + 5, skinDD); g.set(33, nT + 5, skinDD); if (L.mouth === 'open' || L.mouth === 'grin') { g.rect(31, nT + 5, 2, 2, '#5a1e24'); } g.line(26, nT + 3, 20, nT + 2, '#f4f0ea', true); g.line(26, nT + 5, 20, nT + 6, '#f4f0ea', true); }
    else if (head === 'construct') {
      for (var gx = 27; gx <= 36; gx++) { g.set(gx, my - 1, gx % 2 ? skinDD : shade(skin, -0.3)); g.set(gx, my, gx % 2 ? skinDD : shade(skin, -0.3)); }
      g.line(32, hy + 2, 32, eyT - 3, skinD); g.line(edgeL(my + 3) + 1, my + 3, edgeR(my + 3) - 1, my + 3, skinD);
      g.both(edgeL(hy + 6) + 2, hy + 6, skinL); g.both(edgeL(my + 1) + 2, my + 1, skinL);
    }
    if (L.cheeks === 'blush' && head !== 'construct') { var pink = mix(skin, '#ff6f7f', 0.35); g.bothRect(exL - 1, eyT + 5, 2, 1, pink); g.both(exL, eyT + 6, pink); }
    if (L.age === 'old' && human) { g.line(29, nT + 4, 28, my + 1, skinD, true); }

    // ---------- 8. beard ----------
    var bc = hair, bcD = hairD;
    if (L.beard === 'stubble') { for (var sy3 = my - 3; sy3 <= chinY; sy3++) for (var sx3 = edgeL(sy3); sx3 <= edgeR(sy3); sx3++) if ((sx3 + sy3) % 2 && !(sy3 >= my - 1 && sy3 <= my + 1 && sx3 > 28 && sx3 < 35)) g.set(sx3, sy3, mix(skin, hair, 0.4)); }
    if (L.beard === 'mustache') { g.rect(28, my - 2, 8, 2, bc); g.both(27, my - 1, bc); g.both(27, my, bc); g.both(27, my + 1, bcD); g.rect(29, my - 2, 2, 1, hairL); }
    if (/^(short|long|braided)$/.test(L.beard)) {
      var bBottom = L.beard === 'short' ? chinY + 2 : 57;
      for (var by4 = eyT + 3; by4 <= bBottom; by4++) {
        var ew = by4 <= chinY ? hwAt(by4) : Math.max(3, W - 2 - (by4 - chinY) * (L.beard === 'short' ? 3 : 0.7));
        ew = Math.round(ew);
        for (var bx4 = 32 - ew; bx4 < 32 + ew; bx4++) {
          var fromEdge = Math.min(bx4 - (32 - ew), 32 + ew - 1 - bx4);
          var inBeard = by4 >= my - 2 || fromEdge < 2 || (by4 >= nT + 3 && fromEdge < 4);
          if (!inBeard) continue;
          g.set(bx4, by4, (bx4 * 2 + by4) % 5 === 0 ? hairT : (bx4 + by4 * 3) % 7 === 0 ? hairL : bc);
        }
      }
      g.rect(30, my, 4, 1, shade(hair, -0.5)); if (L.mouth === 'grin' || L.mouth === 'open') g.rect(30, my + 1, 4, 1, WHITE);
      if (L.beard === 'braided') { [28, 35].forEach(function (x) { for (var y = 54; y < 62; y++) g.set(x, y, y % 2 ? bc : bcD); g.set(x, 62, GOLD); g.set(x, 58, GOLD); }); }
    }

    // ---------- 9. hair in front ----------
    function hairCap(fringe, sideTo, widen) {
      for (var y = hy - 3; y <= sideTo; y++) {
        var half = y < hy ? hwAt(hy) - (hy - y) * 3 + widen : hwAt(y) + 1 + widen;
        if (half <= 0) continue;
        for (var x = 32 - half; x < 32 + half; x++) {
          var fromEdge = Math.min(x - (32 - half), 32 + half - 1 - x);
          if (y > fringe(x) && fromEdge > 2) continue;
          var c = (x * 3 + y) % 7 === 0 ? hairT : hair;
          if (y <= hy && x > 25 && x < 31) c = hairL;
          g.set(x, y, c);
        }
      }
      // shadow cast by the fringe onto the forehead
      for (var x2 = 32 - hwAt(eyT); x2 < 32 + hwAt(eyT); x2++) { var fy = fringe(x2) + 1; if (g.get(x2, fy) === skin) g.set(x2, fy, shade(skin, -0.12)); }
    }
    if (L.hair !== 'bald' && !hood && !S.helm) {
      var st = L.hair;
      if (st === 'mohawk') {
        for (var sy4 = hy; sy4 < eyT - 3; sy4++) for (var sx4 = edgeL(sy4); sx4 <= edgeR(sy4); sx4++) if ((sx4 + sy4) % 2) g.set(sx4, sy4, mix(skin, hair, 0.35));
        for (var my3 = hy - 7; my3 < hy + 5; my3++) for (var mx3 = 29; mx3 < 35; mx3++) if (my3 >= hy - 3 || (mx3 + my3) % 3) g.set(mx3, my3, mx3 < 31 ? hairL : hair);
      } else {
        var fr, side = eyT - 1, widen = 0;
        if (st === 'short') fr = function (x) { return hy + 6 + (x % 3 === 0 ? 1 : 0); };
        else if (st === 'parted') fr = function (x) { return x < 27 ? hy + 5 : hy + 5 + Math.round((x - 27) / 3); };
        else if (st === 'messy') fr = function (x) { return hy + 7 + [0, 2, 1, 3][x % 4]; };
        else if (st === 'curly') { fr = function (x) { return hy + 6 + (x % 4 < 2 ? 1 : 0); }; widen = 2; side = eyT + 2; }
        else if (longHair) { fr = function (x) { return hy + 4 + Math.round(Math.abs(x - 31.5) / 2.5); }; side = eyT + 1; }
        else fr = function () { return hy + 4; };
        hairCap(fr, side, widen);
        if (st === 'messy') [24, 28, 33, 37].forEach(function (x, i) { g.set(x, hy - 4 + (i % 2), hair); g.set(x + 1, hy - 3, hair); });
        if (st === 'curly') for (var cy2 = hy - 4; cy2 < eyT + 2; cy2 += 3) for (var cx2 = 18; cx2 < 46; cx2 += 3) if (g.get(cx2, cy2) === hair) g.set(cx2, cy2, hairL);
        if (st === 'parted') g.line(27, hy - 2, 27, hy + 3, hairD);
        if (longHair) {
          for (var ly = eyT; ly < 60; ly++) {
            var lx = ly <= chinY ? edgeL(ly) - 1 : 32 - W - 1;
            for (var lw = 0; lw < 3; lw++) g.both(lx + lw - 1, ly, st === 'braids' ? ((ly + lw) % 3 ? hair : hairD) : (lw === 2 ? hairD : hair));
          }
          if (st === 'braids') { g.bothRect(32 - W - 3, 58, 3, 1, GOLD); }
        }
      }
    }
    if (L.hair === 'bald' && !S.helm && !S.hat && !hood && human) { g.set(27, hy + 2, skinL); g.set(28, hy + 1, skinL); g.set(29, hy + 1, skinL); }

    // ---------- 10. top of the head: crests, cat or rabbit ears, horns ----------
    if (head === 'reptile') [27, 31, 35].forEach(function (x, i) { g.rect(x, hy - 3 + (i === 1 ? -1 : 0), 2, 4, shade(skin, -0.25)); });
    if (head === 'bird') [[29, -5], [31, -7], [33, -5]].forEach(function (p) { g.line(p[0], hy + 1, p[0] + (p[0] - 31) / 2, hy + p[1], hair); g.line(p[0] + 1, hy + 1, p[0] + 1 + (p[0] - 31) / 2, hy + p[1] + 1, hairD); });
    if (!hood && !S.helm) {
      if (L.ears === 'cat') for (var ce = 0; ce < 8; ce++) for (var cw = 0; cw < 8 - ce; cw++) { var cxx = edgeL(hy + 4) + 1 + cw + Math.floor(ce / 2); g.both(cxx, hy + 3 - ce, (cw > 1 && cw < 6 - ce && ce < 5) ? '#d67a8a' : skin); }
      if (L.ears === 'rabbit') { g.bothRect(24, hy - 14, 4, 16, skin); g.bothRect(25, hy - 12, 2, 12, '#e8b0b8'); g.both(24, hy - 14, null); }
    }
    var hornC = '#4a3a30', hornL = '#7a6450';
    if (L.horns === 'small') { g.bothRect(25, hy - 2, 2, 4, hornC); g.both(25, hy - 3, hornL); }
    if (L.horns === 'curled') {
      [[27, hy + 2], [26, hy - 2], [24, hy - 5], [21, hy - 7], [18, hy - 6], [17, hy - 3], [18, hy - 1], [20, hy - 1]].reduce(function (a, b) { g.line(a[0], a[1], b[0], b[1], hornC, true); g.line(a[0] - 1, a[1] + 1, b[0] - 1, b[1] + 1, hornC, true); return b; });
      g.line(25, hy - 3, 22, hy - 6, hornL, true); g.both(19, hy - 5, hornL);
    }
    if (L.horns === 'tall') { g.line(27, hy + 1, 24, hy - 10, hornC, true); g.line(28, hy + 1, 25, hy - 9, hornC, true); g.line(26, hy, 25, hy - 6, hornL, true); }
    if (L.horns === 'bull') { [[24, hy + 4], [17, hy + 2], [14, hy - 2], [14, hy - 6]].reduce(function (a, b) { g.line(a[0], a[1], b[0], b[1], '#e8dcc0', true); g.line(a[0], a[1] + 1, b[0] + 1, b[1] + 1, '#c8bca0', true); return b; }); }

    // ---------- 11. headgear and accessories ----------
    if (hood) {
      for (var hy2 = hy - 5; hy2 < hy + 4; hy2++) { var t2 = (hy2 - (hy + H * 0.4)) / (H * 0.4 + 5), half2 = Math.round((W + 5) * Math.sqrt(Math.max(0, 1 - t2 * t2))); for (var hx2 = 32 - half2; hx2 < 32 + half2; hx2++) g.set(hx2, hy2, hy2 === hy + 3 ? shade(cloth, 0.15) : cloth); }
      for (var hy3 = hy + 4; hy3 <= chinY + 2; hy3++) { var e = hy3 <= chinY ? edgeL(hy3) : edgeL(chinY); g.both(e - 1, hy3, shade(cloth, 0.15)); g.both(e - 2, hy3, cloth); g.both(e - 3, hy3, cloth); }
      for (var hx3 = edgeL(hy + 4); hx3 <= edgeR(hy + 4); hx3++) if (g.get(hx3, hy + 4) === skin || g.get(hx3, hy + 4) === shade(skin, -0.09)) g.set(hx3, hy + 4, shade(skin, -0.3));
    }
    if (S.hat) {
      var hc = S.hat.glow ? '#3f3a78' : '#4a3a2c', hcD = shade(hc, -0.25);
      for (var hy4 = hy - 13; hy4 <= hy + 2; hy4++) { var p4 = (hy + 2 - hy4) / 16, hw4 = Math.max(1, Math.round(9 * (1 - p4))), off4 = Math.round(Math.max(0, hy - 5 - hy4) * 0.6); for (var hx4 = 32 - hw4 + off4; hx4 < 32 + hw4 + off4; hx4++) g.set(hx4, hy4, hx4 >= 32 + hw4 + off4 - 2 ? hcD : hc); }
      g.rect(23, hy + 1, 18, 2, GOLD); g.rect(14, hy + 3, 36, 1, hc); g.rect(15, hy + 4, 34, 1, hcD);
    } else if (S.helm) {
      for (var hy5 = hy - 3; hy5 <= eyT - 3; hy5++) { var hw5 = hy5 < hy ? hwAt(hy) - (hy - hy5) * 2 + 2 : hwAt(hy5) + 2; for (var hx5 = 32 - hw5; hx5 < 32 + hw5; hx5++) g.set(hx5, hy5, hy5 === eyT - 3 ? METAL : hx5 < 28 && hy5 < hy + 4 ? shade(METAL, 0.2) : hx5 > 32 + hw5 - 3 ? shade(STEEL, -0.15) : STEEL); }
      g.rect(31, eyT - 3, 2, 8, STEEL); g.set(31, eyT - 2, METAL);
      for (var hy6 = eyT - 3; hy6 <= my; hy6++) { g.both(edgeL(hy6) - 1, hy6, STEEL); g.both(edgeL(hy6), hy6, STEEL); g.both(edgeL(hy6) + 1, hy6, shade(STEEL, -0.15)); }
      if (S.helm.glow) g.set(32, hy, S.helm.glow);
    } else if (S.circlet) {
      var cw2 = hwAt(hy + 4) + 1;
      g.rect(32 - cw2, hy + 4, 2 * cw2, 1, GOLD); g.rect(31, hy + 3, 2, 2, S.circlet.glow || '#5aa0ff');
    }
    if (S.eyes) {
      g.rect(edgeL(eyT + 1) - 1, eyT + 1, 2 * hwAt(eyT + 1) + 2, 2, LEATHER);
      [0, 1].forEach(function (s) { var x0 = s ? N - exL - 7 : exL - 1; g.rect(x0, eyT - 1, 8, 6, '#b08a3a'); g.rect(x0 + 1, eyT, 6, 4, '#9fe0ff'); g.set(x0 + 1, eyT, '#ffffff'); g.set(x0 + 2, eyT, '#ffffff'); });
    }
    if (patch) { g.rect(exL - 1, eyTop - 1, 8, rows + 2, '#1c1714'); g.set(exL, eyTop, '#3a3030'); g.line(exL - 1, eyTop, edgeL(eyT - 3) - 1, eyT - 3, '#1c1714'); g.line(exL + 6, eyTop - 1, edgeR(hy + 7) + 1, hy + 7, '#1c1714'); }
    if (L.acc === 'glasses' && !S.eyes) {
      [0, 1].forEach(function (s) { var x0 = s ? N - exL - 7 : exL - 1; for (var i = 0; i < 8; i++) { g.set(x0 + i, eyTop - 1, GOLD); g.set(x0 + i, eyTop + rows, GOLD); } for (var j = eyTop - 1; j <= eyTop + rows; j++) { g.set(x0, j, GOLD); g.set(x0 + 7, j, GOLD); } });
      g.rect(30, eyTop, 4, 1, GOLD);
    }
    if (L.acc === 'monocle' && !S.eyes) {
      var mx0 = N - exL - 7;
      for (var i3 = 0; i3 < 8; i3++) { g.set(mx0 + i3, eyTop - 1, GOLD); g.set(mx0 + i3, eyTop + rows, GOLD); }
      for (var j3 = eyTop - 1; j3 <= eyTop + rows; j3++) { g.set(mx0, j3, GOLD); g.set(mx0 + 7, j3, GOLD); }
      g.line(mx0 + 7, eyTop + rows, mx0 + 9, my + 6, GOLD);
    }
    if (L.acc === 'earrings' && ear) { var ex0 = edgeL(earY + 2) - 2; g.both(ex0, earY + 5, GOLD); g.both(ex0, earY + 6, GOLD); g.both(ex0, earY + 7, '#ffe08a'); }
    if (L.acc === 'nosering' && human) { g.set(33, nT + 4, GOLD); g.set(34, nT + 3, GOLD); }

    // ---------- compose ----------
    g.outline(OUT);
    var out = new Grid(), bd = BACKDROP[L.base] || BACKDROP.grass;
    for (var y5 = 0; y5 < N; y5++) for (var x5 = 0; x5 < N; x5++) {
      var d5 = Math.sqrt((x5 - 32) * (x5 - 32) + (y5 - 24) * (y5 - 24) * 1.2), dith = (x5 + y5) % 2;
      out.set(x5, y5, d5 < 22 - dith ? bd[0] : d5 < 34 - dith * 2 ? bd[1] : bd[2]);
    }
    Object.keys(g.p).forEach(function (k) { out.p[k] = g.p[k]; });
    var sp = [[6, 8], [57, 12], [5, 40], [58, 44], [10, 22]];
    (gr.magic || []).slice(0, 5).forEach(function (c, i) { var p = sp[i]; out.set(p[0], p[1], c); [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (d) { out.set(p[0] + d[0], p[1] + d[1], shade(c, -0.3)); }); });

    canvas.width = N; canvas.height = N;
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, N, N);
    Object.keys(out.p).forEach(function (k) { var xy = k.split(','); ctx.fillStyle = out.p[k]; ctx.fillRect(+xy[0], +xy[1], 1, 1); });
    return canvas;
  };

  // which face options make sense for a head type
  A.faceApplies = function (k, head) {
    var animal = head === 'reptile' || head === 'bird' || head === 'feline' || head === 'construct';
    if (k === 'eyeShape') return !animal;
    if (k === 'nose' || k === 'lips') return !animal;
    if (k === 'mouth') return head !== 'reptile' && head !== 'bird' && head !== 'construct';
    if (k === 'brows') return head !== 'bird' && head !== 'construct';
    return true;
  };
})(typeof window !== 'undefined' ? window : globalThis);
