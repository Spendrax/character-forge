// Runs first: the saved light/dark theme, so the page doesn't flash the wrong colours.
try {
  var t = localStorage.getItem('cf-theme');
  if (t === 'light' || t === 'dark') document.documentElement.setAttribute('data-theme', t);
} catch (e) {
  /* storage blocked */
}
// Offline support and updates (only when served over http/https, e.g. GitHub Pages). While the app is open, it
// looks for a new version every 15 minutes and each time you come back to it; when one is out, a bar offers
// "Update now" (your work is saved first, then the page reloads on the new version).
if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
  window.addEventListener('load', function () {
    var had = !!navigator.serviceWorker.controller, // a first visit isn't an update
      shown = false;
    function offer() {
      if (shown || !had) return;
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
          window.dispatchEvent(new Event('pagehide')); // saves what you were doing
          location.reload();
        } else if (k === 'later') bar.remove();
      });
      document.body.appendChild(bar);
    }
    navigator.serviceWorker.addEventListener('controllerchange', offer);
    navigator.serviceWorker
      .register('sw.js')
      .then(function (reg) {
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
              if (w.state === 'activated') offer();
            });
        });
      })
      .catch(function () {
        /* not available here */
      });
  });
}
