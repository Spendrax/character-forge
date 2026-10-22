// Each character's note style: a colour and a font (handwriting, typewriter…) for what they write: their notes, and
// the notes and messages they share at the table. Chosen when making the character. Only fonts already on phones and
// computers are used (nothing is downloaded).
(function (root) {
  'use strict';
  var COLORS = ['', '#c0392b', '#d35400', '#b7950b', '#27ae60', '#16a085', '#2980b9', '#8e44ad', '#c2185b', '#6d4c41'];
  // [key, name, font stack]
  var FONTS = [
    ['', 'Normal', ''],
    ['serif', 'Book', 'Georgia, "Times New Roman", serif'],
    ['hand', 'Handwriting', '"Segoe Print", "Bradley Hand", "Comic Sans MS", "Dancing Script", cursive'],
    ['type', 'Typewriter', '"Courier New", Courier, monospace'],
    ['fancy', 'Old scroll', 'Papyrus, Luminari, "Palatino Linotype", fantasy'],
    ['round', 'Round', '"Trebuchet MS", Verdana, sans-serif'],
    ['sans', 'Plain', 'system-ui, "Segoe UI", Roboto, sans-serif']
  ];
  function clean(s) {
    s = s || {};
    return {
      c: COLORS.indexOf(s.c) >= 0 ? s.c : '',
      f: FONTS.some(function (f) {
        return f[0] === s.f;
      })
        ? s.f
        : ''
    };
  }
  // the inline style for a piece of text written by someone with this style
  function css(s) {
    s = clean(s);
    var f = FONTS.filter(function (x) {
      return x[0] === s.f;
    })[0];
    return (s.c ? 'color:' + s.c + ';' : '') + (f && f[2] ? 'font-family:' + f[2].replace(/"/g, "'") + ';' : '');
  }
  // the chooser: colour dots and font samples; act is the page's action name (data-k = c or f, data-v = the choice)
  function picker(s, act, sample) {
    s = clean(s);
    return (
      '<div class="note-style"><div class="note-colors" role="group" aria-label="Note colour">' +
      COLORS.map(function (c) {
        return (
          '<button type="button" class="note-dot' +
          (s.c === c ? ' on' : '') +
          '" data-act="' +
          act +
          '" data-k="c" data-v="' +
          c +
          '" style="' +
          (c ? 'background:' + c : '') +
          '" aria-label="' +
          (c || 'Normal colour') +
          '"></button>'
        );
      }).join('') +
      '</div><div class="note-fonts" role="group" aria-label="Note font">' +
      FONTS.map(function (f) {
        return (
          '<button type="button" class="pill small' +
          (s.f === f[0] ? ' on' : '') +
          '" data-act="' +
          act +
          '" data-k="f" data-v="' +
          f[0] +
          '" style="' +
          css({ f: f[0], c: s.c }) +
          '">' +
          f[1] +
          '</button>'
        );
      }).join('') +
      '</div><p class="note-sample" style="' +
      css(s) +
      '">' +
      (sample || 'This is how my notes look.') +
      '</p></div>'
    );
  }
  root.NoteStyle = { COLORS: COLORS, FONTS: FONTS, clean: clean, css: css, picker: picker };
  if (typeof module !== 'undefined') module.exports = root.NoteStyle;
})(typeof window !== 'undefined' ? window : globalThis);
