// Character Forge's own icons: small line drawings in the app's ink colour, with an accent touch.
// Icon('name') returns an inline SVG; it follows the text colour, so it works in light and dark themes.
(function (root) {
  'use strict';
  var A = ' class="ia"'; // accent-filled part
  var P = {
    sword: '<path d="M19.5 2.5h2v2L11 15l-2-2z"/><path d="M6.5 11.5l6 6"/><path d="M9 15l-4.5 4.5"/><circle cx="3.6" cy="20.4" r="1.3"' + A + '/>',
    swords: '<path d="M4.5 2.5h-2v2L13 15l2-2z"/><path d="M19.5 2.5h2v2L11 15l-2-2z"/><path d="M6 11l7 7M18 11l-7 7"/><path d="M9 15l-4.5 4.5M15 15l4.5 4.5"/><circle cx="3.6" cy="20.4" r="1.3"' + A + '/><circle cx="20.4" cy="20.4" r="1.3"' + A + '/>',
    coins: '<ellipse cx="9" cy="6.5" rx="6" ry="2.5"' + A + '/><path d="M3 6.5v4c0 1.4 2.7 2.5 6 2.5"/><ellipse cx="15" cy="13.5" rx="6" ry="2.5"' + A + '/><path d="M9 13.5v4c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5v-4"/><path d="M15 6.6c1 .3 1.6.6 2 1"/>',
    book: '<path d="M12 6.5C10 5 7 4.5 3 5v13.5c4-.5 7 0 9 1.5 2-1.5 5-2 9-1.5V5c-4-.5-7 0-9 1.5z"/><path d="M12 6.5V20"/><path d="M6 9h3M6 12h3M15 9h3M15 12h3"/>',
    tome: '<path d="M6 3h12a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/><path d="M8 3v18"/><path d="M12 9l2.5-2.5L17 9l-2.5 2.5z"' + A + '/>',
    lute: '<path d="M14.5 9.5c-1.2-1.2-3-1.6-4.9-1.2C6 9 3.2 12.3 3.8 15.8c.4 2.4 2 4 4.4 4.4 3.5.6 6.8-2.2 7.5-5.8.4-1.9 0-3.7-1.2-4.9z"/><circle cx="9.5" cy="14.5" r="1.7"' + A + '/><path d="M13.5 10.5L19 5"/><path d="M18 3.5l2.5 2.5 1-1-2.5-2.5z"/><path d="M6.5 17.5l3-3"/>',
    scroll: '<path d="M7 4h11a2 2 0 0 1 2 2v12"/><path d="M5 4a2 2 0 0 0-2 2v1.5h4V6"/><path d="M7 6v13a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-1H11v1a2 2 0 0 1-4 0"/><path d="M10.5 9h6M10.5 12.5h6"/>',
    dragon: '<path d="M4 21c.4-3.6 2-6.2 4.6-7.6"/><path d="M8.6 13.4c-.6-3.6 1.6-6.6 5-7.2l2.2-3.2.3 3.4c2.3.6 4 2 5 4.2l-3.3.3 1.7 2.8-4.3-.6c-1 2.4-3.1 4-5.8 4.4"/><path d="M11 8.3L6.5 4l1.2 5"' + A + '/><circle cx="15.3" cy="9.6" r="1"' + A + '/><path d="M9.5 17.5c-1 1.2-1.6 2.4-1.8 3.5"/>',
    tankard: '<path d="M5 8h10v11.5a1.5 1.5 0 0 1-1.5 1.5h-7A1.5 1.5 0 0 1 5 19.5z"/><path d="M15 10.5h2.5a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H15"/><path d="M4 8c-.5-2 1-3.5 3-3.3C7.6 3 9.5 2.5 11 3.4c1.3-1 3.5-.6 4 1.3 1.4.3 1.8 1.8 1 3.3"' + A + '/><path d="M8.5 11.5v6M11.5 11.5v6"/>',
    house: '<path d="M3 11.5L12 4l9 7.5"/><path d="M5.5 9.5V20h13V9.5"/><path d="M10 20v-5h4v5"' + A + '/><path d="M16 6V3.5h2v4"/>',
    signpost: '<path d="M12 2.5V21"/><path d="M12 4.5h7l2 2.2-2 2.3h-7z"' + A + '/><path d="M12 11H5l-2 2.2 2 2.3h7z"/><path d="M7.5 21h9"/>',
    tree: '<path d="M12 2l5 6.5h-2.8l4.3 6h-3.6l3.1 5H6l3.1-5H5.5l4.3-6H7z"' + A + '/><path d="M12 19.5V22"/>',
    campfire: '<path d="M12 3c.8 2.8 4 4.2 4 7.6a4 4 0 0 1-8 0c0-1.9 1-3.1 2-4 0 1.8.8 2.9 1.9 3.1-.3-2 .3-4.3.1-6.7z"' + A + '/><path d="M4 20.5l16-3.5M4 17l16 3.5"/>',
    candle: '<path d="M12 2.5c1.4 1.9 2 3 2 4a2 2 0 0 1-4 0c0-1 .6-2.1 2-4z"' + A + '/><path d="M9 10.5h6V19H9z"/><path d="M15 12.5v2.5"/><path d="M6 21h12M7.5 19h9"/>',
    eye: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.2 15.2L21 21"/><path d="M7.5 10.5c.8-1.4 1.8-2 3-2s2.2.6 3 2c-.8 1.4-1.8 2-3 2s-2.2-.6-3-2z"' + A + '/>',
    skull: '<path d="M12 3a8 8 0 0 0-8 8c0 2.8 1.4 4.6 3 5.6V20.5h10v-3.9c1.6-1 3-2.8 3-5.6a8 8 0 0 0-8-8z"/><circle cx="8.8" cy="11.2" r="1.8"' + A + '/><circle cx="15.2" cy="11.2" r="1.8"' + A + '/><path d="M12 13.8l-1 2h2z"/><path d="M10 20.5v-2M12 20.5v-2M14 20.5v-2"/>',
    ship: '<path d="M12 3v10"/><path d="M12 4l6 7.5h-6"' + A + '/><path d="M12 6.5L7.5 11.5H12"/><path d="M5 13.5h14l-2 3H7z"/><path d="M2 20c2 0 2-1.5 4-1.5s2 1.5 4 1.5 2-1.5 4-1.5 2 1.5 4 1.5 2-1.5 4-1.5"/>',
    rain: '<path d="M7 15a4 4 0 0 1 .4-8A5 5 0 0 1 17 8.6 3.3 3.3 0 0 1 17 15z"/><path d="M9 18l-1 2.5M13 18l-1 2.5M17 18l-1 2.5"/><path d="M10 9.5c.6-.8 1.3-1.2 2-1.2"' + A + '/>',
    trophy: '<path d="M7 3.5h10V9a5 5 0 0 1-10 0z"' + A + '/><path d="M7 5.5H4v1a3.5 3.5 0 0 0 3.5 3.5M17 5.5h3v1a3.5 3.5 0 0 1-3.5 3.5"/><path d="M12 14v3"/><path d="M8 21h8l-1-4H9z"/>',
    sparkle: '<path d="M11 2.5l1.9 5.6L18.5 10l-5.6 1.9L11 17.5l-1.9-5.6L3.5 10l5.6-1.9z"' + A + '/><path d="M18.5 14.5l.9 2.6 2.6.9-2.6.9-.9 2.6-.9-2.6-2.6-.9 2.6-.9z"/>',
    speaker: '<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"' + A + '/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/>',
    bolt: '<path d="M13.5 2.5L5 13.5h6l-1.5 8 9-11.5h-6z"' + A + '/>',
    d20: '<path d="M12 2l8.7 5v10L12 22l-8.7-5V7z"/><path d="M12 7l4.6 8H7.4z"' + A + '/><path d="M12 2v5M20.7 7l-4.1 8M3.3 7l4.1 8M3.3 17l4.1-2M20.7 17l-4.1-2M12 22l-4.6-7M12 22l4.6-7"/>'
  };
  root.Icon = function (name, cls) {
    var p = P[name]; if (!p) return '';
    return '<svg class="ico' + (cls ? ' ' + cls : '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + p + '</svg>';
  };
  root.Icon.names = Object.keys(P);
})(typeof window !== 'undefined' ? window : globalThis);
