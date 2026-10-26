// The light timer: a torch, a lantern or a spell that lasts a real hour of play (Shadowdark keeps light in real
// time). Used by the Shadowdark session (your own light) and the GM's table (one light for the whole party, shown on
// every phone). A light is { run, until (when it goes out, while it burns), left (ms left, while paused), n (what it is) }.
// The time on the page counts down by itself, without redrawing the page.
(function (root) {
  'use strict';
  var HOUR = 3600000;
  function left(t) {
    if (!t) return 0;
    return t.run ? Math.max(0, t.until - Date.now()) : Math.max(0, +t.left || 0);
  }
  function clock(ms) {
    var s = Math.ceil(ms / 1000),
      m = Math.floor(s / 60);
    return m + ':' + ('0' + (s % 60)).slice(-2);
  }
  // what a button does to a light: start, pause, resume, plus (10 min), minus, out
  function change(t, how, name) {
    var now = Date.now(),
      l = left(t);
    if (how === 'start') return { run: true, until: now + HOUR, left: 0, n: name || (t && t.n) || 'Torch' };
    if (!t) return null;
    if (how === 'out') return null;
    if (how === 'pause') return { run: false, until: 0, left: l, n: t.n };
    if (how === 'resume') return { run: true, until: now + l, left: 0, n: t.n };
    if (how === 'plus' || how === 'minus') {
      var n = Math.max(0, l + (how === 'plus' ? 1 : -1) * 600000);
      return t.run ? { run: true, until: now + n, left: 0, n: t.n } : { run: false, until: 0, left: n, n: t.n };
    }
    return t;
  }
  function text(t) {
    var l = left(t);
    if (!t) return 'No light';
    if (!l) return '🌑 The ' + String(t.n || 'light').toLowerCase() + ' is out!';
    return clock(l) + (t.run ? '' : ' (paused)');
  }
  // the light and its buttons; act = the page's action name (data-v = start, pause…), null for no buttons
  function html(t, act, esc, btn, label) {
    var l = left(t),
      h =
        '<div class="torch' +
        (t && !l ? ' out' : t && l < 600000 ? ' low' : '') +
        '"><span class="torch-flame" aria-hidden="true">' +
        (t && l ? '🔥' : '🌑') +
        '</span><span><b>' +
        esc(label || (t ? t.n || 'Light' : 'Light')) +
        '</b> <span class="torch-time" data-torch="' +
        esc(JSON.stringify(t || null)) +
        '">' +
        esc(text(t)) +
        '</span></span>';
    if (act)
      h +=
        '<span class="torch-btns">' +
        (!t || !l
          ? btn(act, '🔥 Light a torch (1 hour)', { v: 'start' }, 'btn small primary')
          : (t.run
              ? btn(act, '⏸ Pause', { v: 'pause' }, 'btn small')
              : btn(act, '▶ Resume', { v: 'resume' }, 'btn small primary')) +
            btn(act, '−10 min', { v: 'minus' }, 'btn small') +
            btn(act, '+10 min', { v: 'plus' }, 'btn small') +
            btn(act, 'Put out', { v: 'out' }, 'btn small')) +
        '</span>';
    return h + '</div>';
  }
  // count down every second on whatever lights are on the page; buzz once when one goes out
  var gone = {};
  function tick() {
    if (typeof document === 'undefined') return;
    Array.prototype.forEach.call(document.querySelectorAll('[data-torch]'), function (el) {
      var t = null;
      try {
        t = JSON.parse(el.getAttribute('data-torch'));
      } catch (e) {
        t = null;
      }
      var tx = text(t);
      if (el.textContent !== tx) el.textContent = tx;
      var box = el.closest('.torch'),
        l = left(t);
      if (box) {
        box.classList.toggle('out', !!t && !l);
        box.classList.toggle('low', !!t && l > 0 && l < 600000);
      }
      var k = t && t.run ? String(t.until) : '';
      if (k && !l && !gone[k]) {
        gone[k] = 1;
        try {
          if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
        } catch (e) {
          /* no buzz */
        }
      }
    });
  }
  if (typeof setInterval !== 'undefined' && typeof document !== 'undefined') setInterval(tick, 1000);
  root.Torch = { left: left, clock: clock, change: change, text: text, html: html, HOUR: HOUR };
  if (typeof module !== 'undefined') module.exports = root.Torch;
})(typeof window !== 'undefined' ? window : globalThis);
