// Runs first: the saved light/dark theme, so the page doesn't flash the wrong colours.
try {
  var t = localStorage.getItem('cf-theme');
  if (t === 'light' || t === 'dark') document.documentElement.setAttribute('data-theme', t);
} catch (e) {
  /* storage blocked */
}
// Offline support and automatic updates (only when served over http/https, e.g. GitHub Pages)
if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('sw.js').catch(function () {
      /* not available here */
    });
  });
}
