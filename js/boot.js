// Runs first: the saved light/dark theme, so the page doesn't flash the wrong colours.
try {
  var t = localStorage.getItem('cf-theme');
  if (t === 'light' || t === 'dark') document.documentElement.setAttribute('data-theme', t);
} catch (e) {
  /* storage blocked */
}
// Offline support and updates (only when served over http/https, e.g. GitHub Pages). The app opens from its saved
// copy (sw.js). While it is open, it looks for a new version every 15 minutes and each time you come back to it;
// when one has been downloaded, a bar offers "Update now" (your work is saved first, then the page reloads on it).
if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
  window.addEventListener('load', function () {
    var shown = false,
      asked = false;
    function offer(w) {
      if (shown || !navigator.serviceWorker.controller) return; // a first visit isn't an update
      shown = true;
      var bar = document.createElement('div');
      bar.className = 'update-bar noprint';
      bar.setAttribute('role', 'status');
      bar.innerHTML =
        '<span>✨ A new version of Character Forge is out.</span>' +
        '<button type="button" class="btn primary small" data-up="now">Update now</button>' +
        '<button type="button" class="btn small" data-up="later">Later</button>';
      bar.addEventListener('click', function (e) {
        var k = e.target.getAttribute && e.target.getAttribute('data-up');
        if (k === 'now') {
          asked = true;
          window.dispatchEvent(new Event('pagehide')); // saves what you were doing
          w.postMessage('skip');
          setTimeout(function () {
            location.reload(); // in case the switch is already done
          }, 3000);
        } else if (k === 'later') bar.remove();
      });
      document.body.appendChild(bar);
    }
    // the new version took over (after Update now): reload on it
    navigator.serviceWorker.addEventListener('controllerchange', function () {
      if (asked) location.reload();
    });
    navigator.serviceWorker
      .register('sw.js')
      .then(function (reg) {
        if (reg.waiting) offer(reg.waiting);
        function check() {
          reg.update().catch(function () {
            /* offline */
          });
        }
        setInterval(check, 15 * 60 * 1000);
        document.addEventListener('visibilitychange', function () {
          if (document.visibilityState === 'visible') check();
        });
        reg.addEventListener('updatefound', function () {
          var w = reg.installing;
          if (w)
            w.addEventListener('statechange', function () {
              if (w.state === 'installed') offer(w);
            });
        });
      })
      .catch(function () {
        /* not available here */
      });
  });
}
