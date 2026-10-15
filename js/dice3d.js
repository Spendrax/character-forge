// 3D dice roller: a wooden table, dice that tumble, bounce and land showing their result.
// A small renderer of its own (no library): each die is a convex solid, so only the faces turned
// toward you are drawn, and numbers are painted flat onto each face. The result is picked first
// (crypto random), then the die is animated to land with that face up.
(function (root) {
  'use strict';
  // ---------- small vector and rotation helpers ----------
  function sub(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
  function add(a, b) { return [a[0] + b[0], a[1] + b[1], a[2] + b[2]]; }
  function mul(a, s) { return [a[0] * s, a[1] * s, a[2] * s]; }
  function dot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
  function cross(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
  function len(a) { return Math.sqrt(dot(a, a)); }
  function unit(a) { var l = len(a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; }
  // quaternions as [w, x, y, z]
  function qmul(a, b) {
    return [a[0] * b[0] - a[1] * b[1] - a[2] * b[2] - a[3] * b[3], a[0] * b[1] + a[1] * b[0] + a[2] * b[3] - a[3] * b[2],
      a[0] * b[2] - a[1] * b[3] + a[2] * b[0] + a[3] * b[1], a[0] * b[3] + a[1] * b[2] - a[2] * b[1] + a[3] * b[0]];
  }
  function qaxis(ax, ang) { var s = Math.sin(ang / 2); ax = unit(ax); return [Math.cos(ang / 2), ax[0] * s, ax[1] * s, ax[2] * s]; }
  function qrot(q, v) {
    var u = [q[1], q[2], q[3]], t = mul(cross(u, v), 2);
    return add(add(v, mul(t, q[0])), cross(u, t));
  }
  function qfromTo(a, b) {
    var d = dot(a, b);
    if (d < -0.999999) { var p = Math.abs(a[0]) < 0.9 ? cross(a, [1, 0, 0]) : cross(a, [0, 1, 0]); return qaxis(p, Math.PI); }
    var c = cross(a, b), q = [1 + d, c[0], c[1], c[2]], l = Math.sqrt(q[0] * q[0] + q[1] * q[1] + q[2] * q[2] + q[3] * q[3]);
    return [q[0] / l, q[1] / l, q[2] / l, q[3] / l];
  }
  function rnd() { // 0 ≤ x < 1, from the system's secure random source when there is one
    try { var a = new Uint32Array(1); root.crypto.getRandomValues(a); return a[0] / 4294967296; } catch (e) { return Math.random(); }
  }
  function randInt(n) { return Math.floor(rnd() * n); }

  // ---------- the solids ----------
  var PHI = (1 + Math.sqrt(5)) / 2;
  function d10Verts() {
    // pentagonal trapezohedron: apexes at ±1, two rings of 5; ring height chosen so each kite is flat
    function ring(z) { var v = [[0, 0, 1], [0, 0, -1]]; for (var k = 0; k < 5; k++) { var a = k * 2 * Math.PI / 5, b = a + Math.PI / 5; v.push([Math.cos(a), Math.sin(a), z], [Math.cos(b), Math.sin(b), -z]); } return v; }
    function off(z) { var v = ring(z), T = v[0], U0 = v[2], U1 = v[4], L0 = v[3], n = cross(sub(U0, T), sub(U1, T)); return dot(n, sub(L0, T)); }
    var lo = 0.001, hi = 0.9; for (var i = 0; i < 60; i++) { var mid = (lo + hi) / 2; if (off(lo) * off(mid) <= 0) hi = mid; else lo = mid; }
    return ring((lo + hi) / 2);
  }
  var VERTS = {
    4: [[1, 1, 1], [1, -1, -1], [-1, 1, -1], [-1, -1, 1]],
    6: [[1, 1, 1], [1, 1, -1], [1, -1, 1], [1, -1, -1], [-1, 1, 1], [-1, 1, -1], [-1, -1, 1], [-1, -1, -1]],
    8: [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]],
    10: null,
    12: (function () { var v = [], s = [1, -1], i = 1 / PHI; s.forEach(function (a) { s.forEach(function (b) { s.forEach(function (c) { v.push([a, b, c]); }); v.push([0, a * i, b * PHI], [a * i, b * PHI, 0], [a * PHI, 0, b * i]); }); }); return v; })(),
    20: (function () { var v = [], s = [1, -1]; s.forEach(function (a) { s.forEach(function (b) { v.push([0, a, b * PHI], [a, b * PHI, 0], [a * PHI, 0, b]); }); }); return v; })()
  };
  // Faces of a convex solid from its corners: every plane through three corners with all the others behind it.
  function hull(verts) {
    var faces = [], seen = {}, n = verts.length, eps = 1e-6;
    for (var i = 0; i < n; i++) for (var j = i + 1; j < n; j++) for (var k = j + 1; k < n; k++) {
      var nn = cross(sub(verts[j], verts[i]), sub(verts[k], verts[i])); if (len(nn) < eps) continue; nn = unit(nn);
      var d = dot(nn, verts[i]), pos = 0, neg = 0, on = [];
      for (var m = 0; m < n; m++) { var s = dot(nn, verts[m]) - d; if (s > eps) pos++; else if (s < -eps) neg++; else on.push(m); }
      if (pos && neg) continue;
      if (pos) nn = mul(nn, -1);
      var key = on.join(','); if (seen[key]) continue; seen[key] = 1;
      var c = [0, 0, 0]; on.forEach(function (m) { c = add(c, verts[m]); }); c = mul(c, 1 / on.length);
      var e1 = unit(sub(verts[on[0]], c)), e2 = cross(nn, e1);
      on.sort(function (a, b) { var pa = sub(verts[a], c), pb = sub(verts[b], c); return Math.atan2(dot(pa, e2), dot(pa, e1)) - Math.atan2(dot(pb, e2), dot(pb, e1)); });
      faces.push({ vi: on, n: nn, c: c });
    }
    return faces;
  }
  // A real d100 (like a Zocchihedron): 100 faces spread evenly over a ball. Each face is the flat plane touching the
  // ball at one of 100 evenly spread points; corners are where three neighbouring planes meet.
  function zocchi() {
    var pts = [], ga = Math.PI * (3 - Math.sqrt(5));
    for (var i = 0; i < 100; i++) { var y = 1 - 2 * (i + 0.5) / 100, r = Math.sqrt(1 - y * y); pts.push([r * Math.cos(i * ga), y, r * Math.sin(i * ga)]); }
    var tris = hull(pts), verts = tris.map(function (t) { // the point where the three touching planes n·x = 1 meet
      var a = pts[t.vi[0]], b = pts[t.vi[1]], c = pts[t.vi[2]];
      return mul(add(add(cross(b, c), cross(c, a)), cross(a, b)), 1 / dot(a, cross(b, c)));
    });
    var r = 0; verts.forEach(function (v) { r = Math.max(r, len(v)); });
    verts = verts.map(function (v) { return mul(v, 1 / r); });
    var faces = pts.map(function (p, i) {
      var c = mul(p, 1 / r), vi = []; tris.forEach(function (t, ti) { if (t.vi.indexOf(i) >= 0) vi.push(ti); });
      var e1 = unit(sub(verts[vi[0]], c)), e2 = cross(p, e1);
      vi.sort(function (a, b) { var pa = sub(verts[a], c), pb = sub(verts[b], c); return Math.atan2(dot(pa, e2), dot(pa, e1)) - Math.atan2(dot(pb, e2), dot(pb, e1)); });
      return { vi: vi, n: p, c: c, value: i + 1 };
    });
    return { verts: verts, faces: faces };
  }
  var SHAPES = {};
  function shape(sides) {
    if (SHAPES[sides]) return SHAPES[sides];
    var verts, faces;
    if (sides === 100) { var z = zocchi(); verts = z.verts; faces = z.faces; }
    else {
      var r = 0; verts = sides === 10 ? d10Verts() : VERTS[sides];
      verts.forEach(function (v) { r = Math.max(r, len(v)); });
      verts = verts.map(function (v) { return mul(v, 1 / r); });
      faces = hull(verts);
    }
    faces.forEach(function (f) {
      // label frame: "up" toward the farthest corner (the point of a d10 kite), "right" across the face
      var far = 0, best = -1; f.vi.forEach(function (m) { var dd = len(sub(verts[m], f.c)); if (dd > best) { best = dd; far = m; } });
      f.up = unit(sub(verts[far], f.c)); f.right = cross(f.up, f.n);
      var ri = Infinity; f.vi.forEach(function (m, x) { var a = verts[m], b = verts[f.vi[(x + 1) % f.vi.length]], ab = unit(sub(b, a)), ac = sub(f.c, a); ri = Math.min(ri, len(sub(ac, mul(ab, dot(ac, ab))))); });
      f.ri = ri;
    });
    if (sides !== 4 && sides !== 100) { // opposite faces add up like on real dice
      var used = {}, next = 1;
      faces.forEach(function (f, i) {
        if (used[i]) return;
        var o = 0; faces.forEach(function (g, j) { if (dot(g.n, f.n) < dot(faces[o].n, f.n)) o = j; });
        f.value = next; faces[o].value = sides + 1 - next; used[i] = used[o] = 1; next++;
      });
    }
    return (SHAPES[sides] = { sides: sides, verts: verts, faces: faces });
  }

  // ---------- drawing ----------
  var LIGHT = unit([-0.45, 0.55, 0.85]);
  var COLORS = { blue: [44, 92, 170], red: [150, 34, 30], green: [36, 112, 72], black: [44, 44, 52], ivory: [226, 214, 186] };
  function label(die, v) {
    if (die.sides === 10) v = v % 10;
    return String(v) + ((v === 6 || v === 9) && die.sides >= 8 ? '.' : '');
  }
  function shade(rgb, k) { return 'rgb(' + rgb.map(function (c) { return Math.max(0, Math.min(255, Math.round(c * k))); }).join(',') + ')'; }
  function drawDie(ctx, die, q, x, y, k, settled) {
    var S = shape(die.sides), V = S.verts.map(function (v) { return qrot(q, v); }), rgb = COLORS[die.color] || COLORS.blue;
    var ink = die.color === 'ivory' ? '#2a2420' : '#f4f6ff';
    var P = function (p) { return [x + k * p[0], y - k * p[1]]; };
    S.faces.forEach(function (f) {
      var n = qrot(q, f.n); if (n[2] <= 0.02) return; // turned away
      var lit = 0.42 + 0.7 * Math.max(0, dot(n, LIGHT));
      ctx.setTransform(die.dpr, 0, 0, die.dpr, 0, 0);
      ctx.beginPath(); f.vi.forEach(function (m, i) { var p = P(V[m]); if (i) ctx.lineTo(p[0], p[1]); else ctx.moveTo(p[0], p[1]); }); ctx.closePath();
      ctx.fillStyle = shade(rgb, lit); ctx.fill();
      ctx.lineJoin = 'round'; ctx.lineWidth = Math.max(1, k * 0.03); ctx.strokeStyle = 'rgba(0,0,0,.28)'; ctx.stroke();
      if (settled && die.sides === 100 && f.value === die.value) { ctx.lineWidth = Math.max(2, k * 0.035); ctx.strokeStyle = 'rgba(255,214,120,.95)'; ctx.stroke(); } // 100 numbers showing: ring the result
      // numbers: painted in the face's own plane (with a flat view this mapping is exact)
      var c = qrot(q, f.c), up = qrot(q, f.up), rt = qrot(q, f.right);
      var put = function (txt, at, u, r, size) {
        var o = P(at), s = k / 100;
        ctx.setTransform(die.dpr * s * r[0], -die.dpr * s * r[1], -die.dpr * s * u[0], die.dpr * s * u[1], die.dpr * o[0], die.dpr * o[1]);
        ctx.font = '700 ' + Math.round(size * 100) + 'px system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = ink; ctx.globalAlpha = 0.35 + 0.65 * Math.min(1, n[2] * 1.6);
        ctx.fillText(txt, 0, 0); ctx.globalAlpha = 1;
      };
      if (die.sides === 4) { // a d4 is read at its top corner: each face carries its three corner numbers
        f.vi.forEach(function (m) {
          var dir = unit(sub(S.verts[m], f.c)), at = add(f.c, mul(dir, f.ri * 1.15)), u = qrot(q, dir);
          put(String(die.cornerValues[m]), qrot(q, at), u, qrot(q, cross(dir, f.n)), f.ri * 0.62);
        });
      } else put(label(die, f.value), c, up, rt, f.ri * (die.sides === 6 ? 1.05 : die.sides === 20 ? 0.95 : 0.9) * (die.sides === 100 ? 0.78 : 1));
    });
    ctx.setTransform(die.dpr, 0, 0, die.dpr, 0, 0);
  }
  function drawShadow(ctx, x, y, k, h) {
    var sx = x + k * (0.25 + h * 0.9), sy = y + k * (0.35 + h * 1.1), r = k * (1.05 + h * 0.25);
    var g = ctx.createRadialGradient(sx, sy, r * 0.2, sx, sy, r);
    g.addColorStop(0, 'rgba(40,22,8,' + (0.38 * (1 - h * 0.45)) + ')'); g.addColorStop(1, 'rgba(40,22,8,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(sx, sy, r, 0, Math.PI * 2); ctx.fill();
  }
  // A light wooden table, grain running top to bottom.
  function wood(w, h, dpr) {
    var c = document.createElement('canvas'); c.width = Math.ceil(w * dpr); c.height = Math.ceil(h * dpr);
    var g = c.getContext('2d'); g.scale(dpr, dpr);
    var base = g.createLinearGradient(0, 0, w, 0); base.addColorStop(0, '#d7a868'); base.addColorStop(0.5, '#e1b679'); base.addColorStop(1, '#d3a262');
    g.fillStyle = base; g.fillRect(0, 0, w, h);
    var seed = 7, R = function () { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    for (var i = 0; i < Math.round(w / 2.2); i++) {
      var x0 = R() * w, wd = 0.6 + R() * 3.2, a = 0.04 + R() * 0.12, amp = 2 + R() * 7, fr = 0.004 + R() * 0.01, ph = R() * 6;
      g.strokeStyle = 'rgba(' + (R() < 0.75 ? '133,78,34' : '245,214,160') + ',' + a + ')'; g.lineWidth = wd; g.beginPath();
      for (var yy = -10; yy <= h + 10; yy += 12) { var xx = x0 + Math.sin(yy * fr + ph) * amp + Math.sin(yy * fr * 3.1 + ph * 2) * amp * 0.3; if (yy < -9) g.moveTo(xx, yy); else g.lineTo(xx, yy); }
      g.stroke();
    }
    var v = g.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.3, w / 2, h / 2, Math.max(w, h) * 0.75);
    v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(60,30,10,.28)'); g.fillStyle = v; g.fillRect(0, 0, w, h);
    return c;
  }

  // ---------- the roll ----------
  var KINDS = [['d4', 4], ['d6', 6], ['d8', 8], ['d10', 10], ['d12', 12], ['d20', 20], ['d100', 100]];
  function makeDice(counts) {
    var list = [];
    KINDS.forEach(function (kd) {
      for (var i = 0; i < (counts[kd[0]] || 0); i++) {
        list.push({ kind: kd[0], sides: kd[1], value: 1 + randInt(kd[1]), group: kd[0] });
      }
    });
    return list;
  }
  function plan(list, w, h, top) {
    var n = list.length, area = { x: 16, y: top + 16, w: w - 32, h: h - top - 32 };
    var cols = Math.max(1, Math.round(Math.sqrt(n * area.w / area.h))), rows = Math.ceil(n / cols);
    var cw = area.w / cols, chh = area.h / rows, k = Math.max(16, Math.min(cw, chh, Math.min(w, h) * 0.34) * 0.36);
    var order = list.map(function (_, i) { return i; }).sort(function () { return rnd() - 0.5; });
    order.forEach(function (idx, slot) {
      var d = list[idx], cx = area.x + (slot % cols + 0.5) * cw, cy = area.y + (Math.floor(slot / cols) + 0.5) * chh;
      d.k = k * (d.sides === 100 ? 1.45 : 1); d.fx = cx + (rnd() - 0.5) * cw * 0.35; d.fy = cy + (rnd() - 0.5) * chh * 0.35;
      d.sx = w * (0.2 + rnd() * 0.6); d.sy = h + k * 2.5;
      aim(d, 1); d.h0 = 1.25; d.qc = null; d.delay = slot * 45; d.dur = 1500;
    });
  }
  // Where a die ends up: its result face (or a d4's result corner) on top, plus how hard it tumbles on the way.
  function aim(d, force) {
    var S = shape(d.sides), target, spin = rnd() * Math.PI * 2;
    if (d.sides === 4) { // a d4 lands with its result corner on top
      var corners = [1, 2, 3, 4].sort(function () { return rnd() - 0.5; }); d.cornerValues = corners;
      target = unit(S.verts[corners.indexOf(d.value)]);
    } else {
      var top = S.faces.filter(function (f) { return f.value === d.value; })[0], u = qrot(qfromTo(top.n, [0, 0, 1]), top.up);
      target = top.n; spin = Math.atan2(u[0], u[1]) + (rnd() - 0.5) * 0.9; // result face lands roughly upright, a little askew
    }
    d.qf = qmul(qaxis([0, 0, 1], spin), qfromTo(target, [0, 0, 1]));
    d.a1 = unit([rnd() - 0.5, rnd() - 0.5, rnd() - 0.5]); d.a2 = unit([rnd() - 0.5, rnd() - 0.5, rnd() - 0.5]);
    d.s1 = (2 + (3 + rnd() * 5) * force) * Math.PI; d.s2 = (1 + (1 + rnd() * 2) * force) * Math.PI;
  }
  function conj(q) { return [q[0], -q[1], -q[2], -q[3]]; }
  function qangle(q) { // rotation as [axis, angle], the short way round
    if (q[0] < 0) q = [-q[0], -q[1], -q[2], -q[3]];
    var a = 2 * Math.acos(Math.min(1, q[0])), s = Math.sqrt(Math.max(0, 1 - q[0] * q[0]));
    return s < 1e-6 ? [[0, 0, 1], 0] : [[q[1] / s, q[2] / s, q[3] / s], a];
  }
  function ease(t) { return 1 - Math.pow(1 - t, 3); }
  function stateAt(d, t) {
    var e = ease(t), rest = 1 - e;
    var q = qmul(qmul(qaxis(d.a1, d.s1 * rest), qaxis(d.a2, d.s2 * rest * rest)), d.qf);
    if (d.qc) q = qmul(qaxis(d.qc[0], d.qc[1] * rest), q); // a thrown die starts turned the way it was held
    var hgt = (d.h0 || 1.25) * Math.pow(1 - t, 1.6) * Math.abs(Math.cos(t * Math.PI * 2.7));
    return { q: q, x: d.sx + (d.fx - d.sx) * e, y: d.sy + (d.fy - d.sy) * e, h: hgt };
  }

  // ---------- the overlay ----------
  var el, cv, ctx, bg, dice = [], start = 0, raf = 0, counts = { d20: 1 }, mod = 0, color = 'blue', open = false, pushed = false, panelOpen = true, lastText = '';
  try { var saved = JSON.parse(root.localStorage.getItem('cf-dice') || 'null'); if (saved) { counts = saved.counts || counts; mod = +saved.mod || 0; color = saved.color || color; } } catch (e) { /* storage off */ }
  function remember() { try { root.localStorage.setItem('cf-dice', JSON.stringify({ counts: counts, mod: mod, color: color })); } catch (e) { /* storage off */ } }
  function icon(n) { return root.Icon ? root.Icon(n) : ''; }
  function build() {
    if (el) return;
    el = document.createElement('div'); el.className = 'dice3d noprint'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', 'Dice roller');
    el.innerHTML = '<canvas class="dice3d-table" aria-hidden="true"></canvas>' +
      '<div class="dice3d-top"><button type="button" class="dice3d-x" data-d="close" aria-label="Close the dice roller">←</button><div class="dice3d-result" aria-live="polite"></div></div>' +
      '<div class="dice3d-panel"></div><button type="button" class="dice3d-fab in" data-d="panel" aria-label="Choose dice">' + icon('d20') + '</button>';
    document.body.appendChild(el);
    cv = el.querySelector('canvas'); ctx = cv.getContext('2d');
    el.addEventListener('click', onClick);
    cv.addEventListener('pointerdown', onDown); cv.addEventListener('pointermove', onMove);
    cv.addEventListener('pointerup', onUp); cv.addEventListener('pointercancel', onUp);
    root.addEventListener('resize', function () { if (open) { size(); draw(performance.now(), true); } });
  }
  function panelHtml() {
    var total = 0; KINDS.forEach(function (kd) { total += counts[kd[0]] || 0; });
    return '<div class="dice3d-head"><b>Roll dice</b><span class="dice3d-colors">' + Object.keys(COLORS).map(function (c) { return '<button type="button" class="dice3d-sw' + (c === color ? ' on' : '') + '" data-d="color" data-v="' + c + '" style="background:' + shade(COLORS[c], 1) + '" aria-label="' + c + ' dice"></button>'; }).join('') + '</span></div>' +
      '<div class="dice3d-grid">' + KINDS.map(function (kd) {
        var n = counts[kd[0]] || 0;
        return '<div class="dice3d-k' + (n ? ' on' : '') + '"><button type="button" data-d="dec" data-v="' + kd[0] + '" aria-label="One less ' + kd[0] + '">−</button><span><b>' + n + '</b><small>' + kd[0] + '</small></span><button type="button" data-d="inc" data-v="' + kd[0] + '" aria-label="One more ' + kd[0] + '">+</button></div>';
      }).join('') +
      '<div class="dice3d-k mod"><button type="button" data-d="mdec" aria-label="Lower the bonus">−</button><span><b>' + (mod >= 0 ? '+' : '−') + Math.abs(mod) + '</b><small>bonus</small></span><button type="button" data-d="minc" aria-label="Raise the bonus">+</button></div></div>' +
      '<div class="dice3d-actions"><button type="button" class="btn" data-d="clear">Clear</button><button type="button" class="btn primary" data-d="roll"' + (total ? '' : ' disabled') + '>Roll ' + describe() + '</button></div>';
  }
  function describe() { var parts = []; KINDS.forEach(function (kd) { if (counts[kd[0]]) parts.push(counts[kd[0]] + kd[0]); }); return (parts.join(' + ') || '') + (mod ? (mod > 0 ? ' + ' : ' − ') + Math.abs(mod) : ''); }
  function showPanel(on) { panelOpen = on; el.classList.toggle('panel-open', on); if (on) el.querySelector('.dice3d-panel').innerHTML = panelHtml(); }
  function size() {
    var w = root.innerWidth, h = root.innerHeight, dpr = Math.min(2, root.devicePixelRatio || 1);
    cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); cv.style.width = w + 'px'; cv.style.height = h + 'px';
    bg = wood(w, h, dpr); cv._w = w; cv._h = h; cv._dpr = dpr;
    if (dice.length && !raf) plan(dice, w, h, 64), dice.forEach(function (d) { d.dpr = dpr; });
  }
  function draw(now, still) {
    var dpr = cv._dpr; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(bg, 0, 0);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var dur = root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches ? 250 : 1500, done = true;
    var st = dice.map(function (d) {
      if (d.held) { done = false; return { d: d, t: 0, s: { q: heldQ(d, now), x: d.hx, y: d.hy, h: 0.55 } }; }
      var t = still ? 1 : Math.max(0, Math.min(1, (now - (d.t0 != null ? d.t0 : start + d.delay)) / (dur < 1500 ? dur : d.dur || dur)));
      if (t < 1) done = false; return { d: d, t: t, s: stateAt(d, t) };
    });
    st.forEach(function (x) { drawShadow(ctx, x.s.x, x.s.y, x.d.k, x.s.h); });
    st.sort(function (a, b) { return a.s.h - b.s.h; }).forEach(function (x) { drawDie(ctx, x.d, x.s.q, x.s.x, x.s.y, x.d.k * (1 + 0.32 * x.s.h), x.s.h < 1e-3 && x.t >= 1); });
    return done;
  }
  function loop(now) { if (draw(now)) { raf = 0; showResult(); return; } raf = root.requestAnimationFrame(loop); }
  function run() { if (!raf) raf = root.requestAnimationFrame(loop); }

  // ---------- picking a die up and throwing it again ----------
  // Hold a die: it lifts and turns slowly with its face still up. Fling it to roll it again; set it down gently to just move it.
  var grab = null, eatClick = false;
  function heldQ(d, now) { return qmul(qaxis([0, 0, 1], (now - d.heldAt) / 900), d.qf); }
  function settled(d) { return !d.held && performance.now() - (d.t0 != null ? d.t0 : start + d.delay) >= (d.t0 != null ? d.dur : 1500); }
  function dieAt(x, y) {
    var hit = null, best = Infinity;
    dice.forEach(function (d) { var dd = Math.hypot(x - d.fx, y - d.fy); if (dd < d.k * 1.15 && dd < best && settled(d)) { best = dd; hit = d; } });
    return hit;
  }
  function onDown(e) {
    if (panelOpen || !dice.length) return;
    var d = dieAt(e.clientX, e.clientY); if (!d) return;
    e.preventDefault(); try { cv.setPointerCapture(e.pointerId); } catch (x) { /* fine */ }
    grab = { d: d, id: e.pointerId, x0: e.clientX, y0: e.clientY, pts: [[e.clientX, e.clientY, performance.now()]] };
    d.held = true; d.heldAt = performance.now(); d.hx = d.fx; d.hy = d.fy; run();
  }
  function onMove(e) {
    if (!grab || e.pointerId !== grab.id) return;
    var d = grab.d, now = performance.now();
    d.hx = Math.max(d.k, Math.min(cv._w - d.k, e.clientX)); d.hy = Math.max(64 + d.k * 0.5, Math.min(cv._h - d.k, e.clientY));
    grab.pts.push([e.clientX, e.clientY, now]); while (grab.pts.length > 2 && now - grab.pts[0][2] > 90) grab.pts.shift();
  }
  function onUp(e) {
    if (!grab || e.pointerId !== grab.id) return;
    var g = grab, d = g.d, now = performance.now(), a = g.pts[0], b = g.pts[g.pts.length - 1], dt = Math.max(16, b[2] - a[2]);
    var vx = (b[0] - a[0]) / dt, vy = (b[1] - a[1]) / dt, speed = Math.hypot(vx, vy), moved = Math.hypot(e.clientX - g.x0, e.clientY - g.y0);
    grab = null; eatClick = true;
    var q = heldQ(d, now); d.held = false;
    if (moved < 8) { var ang = rnd() * Math.PI * 2; vx = Math.cos(ang) * 0.6; vy = Math.sin(ang) * 0.6; speed = 0.6; } // a tap: a little toss
    if (speed > 0.35 || moved < 8) throwDie(d, q, vx, vy, speed, now);
    else { d.qf = q; d.sx = d.fx = d.hx; d.sy = d.fy = d.hy; d.qc = null; d.h0 = 0.3; d.t0 = now; d.dur = 300; d.s1 = d.s2 = 0; } // set it down
    run();
  }
  function throwDie(d, held, vx, vy, speed, now) {
    var w = cv._w, h = cv._h, far = Math.min(Math.min(w, h) * 0.85, speed * 420), dir = unit([vx, vy, 0]);
    d.value = 1 + randInt(d.sides);
    d.sx = d.hx; d.sy = d.hy;
    d.fx = Math.max(d.k * 1.1, Math.min(w - d.k * 1.1, d.hx + dir[0] * far));
    d.fy = Math.max(64 + d.k, Math.min(h - d.k * 1.1, d.hy + dir[1] * far));
    aim(d, Math.min(1.6, 0.4 + speed));
    var spun = qmul(qmul(qaxis(d.a1, d.s1), qaxis(d.a2, d.s2)), d.qf); // where the tumble would start…
    d.qc = qangle(qmul(held, conj(spun))); // …turned so it starts exactly as it was held
    d.h0 = 0.75; d.t0 = now; d.dur = Math.max(700, Math.min(1500, 650 + far * 1.4));
    el.querySelector('.dice3d-result').innerHTML = '<small>Rolling…</small>';
  }
  function showResult() {
    var groups = {}, sum = 0;
    dice.forEach(function (d) { var v = d.value; sum += v; (groups[d.group] = groups[d.group] || []).push(v); });
    var detail = Object.keys(groups).map(function (g) { return g + ': ' + groups[g].join(', '); }).join(' · ') + (mod ? ' · bonus ' + (mod > 0 ? '+' : '−') + Math.abs(mod) : '');
    var nat = dice.length === 1 && dice[0].kind === 'd20' ? (dice[0].value === 20 ? ' <span class="dice3d-crit">Natural 20!</span>' : dice[0].value === 1 ? ' <span class="dice3d-fail">Natural 1</span>' : '') : '';
    lastText = (sum + mod) + ' (' + detail + ')';
    el.querySelector('.dice3d-result').innerHTML = '<b>' + (sum + mod) + '</b>' + nat + '<small>' + detail.replace(/</g, '&lt;') + '</small>';
  }
  function roll() {
    if (!describe()) return;
    cancel(); grab = null; dice = makeDice(counts); dice.forEach(function (d) { d.color = color; d.dpr = cv._dpr; });
    plan(dice, cv._w, cv._h, 64); start = performance.now();
    el.querySelector('.dice3d-result').innerHTML = '<small>Rolling ' + describe() + '…</small>';
    showPanel(false); raf = root.requestAnimationFrame(loop);
  }
  function cancel() { if (raf) root.cancelAnimationFrame(raf); raf = 0; }
  function onClick(e) {
    var b = e.target.closest('[data-d]');
    if (!b && eatClick) { eatClick = false; return; } // that was a die being picked up
    if (!b) { if (!panelOpen && dice.length && e.target === cv) roll(); else if (panelOpen && e.target === cv) showPanel(false); return; } // tap the table to roll again
    var a = b.getAttribute('data-d'), v = b.getAttribute('data-v');
    if (a === 'close') return close();
    if (a === 'panel') return showPanel(!panelOpen);
    if (a === 'roll') return roll();
    if (a === 'inc') { var tot = 0; KINDS.forEach(function (kd) { tot += counts[kd[0]] || 0; }); if (tot < 20) counts[v] = Math.min(10, (counts[v] || 0) + 1); }
    if (a === 'dec') counts[v] = Math.max(0, (counts[v] || 0) - 1);
    if (a === 'minc') mod = Math.min(30, mod + 1);
    if (a === 'mdec') mod = Math.max(-30, mod - 1);
    if (a === 'clear') { counts = {}; mod = 0; }
    if (a === 'color') { color = v; dice.forEach(function (d) { d.color = v; }); if (!raf && dice.length) draw(0, true); }
    remember(); showPanel(true);
  }
  function openRoller() {
    build(); if (open) return; open = true; el.classList.add('on'); document.documentElement.classList.add('dice3d-lock');
    size(); draw(0, true); showPanel(!dice.length || panelOpen);
    if (!dice.length) el.querySelector('.dice3d-result').innerHTML = '<small>Pick your dice, then Roll. Tap the table to roll again.</small>';
    try { root.history.pushState({ dice: 1 }, ''); pushed = true; } catch (e) { pushed = false; }
  }
  function close(fromBack) {
    if (!open) return; open = false; cancel(); if (dice.length) draw(0, true);
    el.classList.remove('on'); document.documentElement.classList.remove('dice3d-lock');
    if (pushed && !fromBack) { pushed = false; try { root.history.back(); } catch (e) { /* ignore */ } }
    pushed = false;
  }
  if (root.addEventListener) {
    root.addEventListener('popstate', function () { if (open) close(true); });
    root.addEventListener('keydown', function (e) { if (open && e.key === 'Escape') close(); });
  }

  // The round button that opens the roller, kept above the bottom bars.
  var fab;
  function place() {
    if (!fab) {
      fab = document.createElement('button'); fab.type = 'button'; fab.className = 'dice3d-fab out noprint'; fab.setAttribute('aria-label', 'Roll dice'); fab.title = 'Roll dice';
      fab.innerHTML = icon('d20'); fab.addEventListener('click', openRoller); document.body.appendChild(fab);
    }
    var off = 14;
    ['.mini-bar', '#audio-dock.on'].forEach(function (s) { var m = document.querySelector(s); if (m && root.getComputedStyle(m).display !== 'none') off += m.offsetHeight; });
    fab.style.bottom = off + 'px';
  }
  root.Dice3D = { open: openRoller, close: close, place: place, roll: function (c, m) { counts = c; mod = m || 0; openRoller(); roll(); },
    // for tests: the solids and a dice set
    _shape: shape, _makeDice: makeDice, _plan: plan, _qrot: qrot, last: function () { return lastText; } };
})(typeof window !== 'undefined' ? window : globalThis);
