// Moving characters to another device: everything packed into a link (compressed), shown as a QR code when it is
// small enough, or shared as a file. Opening the link on the other device offers to add or update the characters.
(function (root) {
  'use strict';
  function b64url(bytes) {
    var s = '';
    for (var i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  function fromB64url(s) {
    s = s.replace(/-/g, '+').replace(/_/g, '/');
    while (s.length % 4) s += '=';
    var b = atob(s),
      out = new Uint8Array(b.length);
    for (var i = 0; i < b.length; i++) out[i] = b.charCodeAt(i);
    return out;
  }
  function pack(obj) {
    var bytes = new TextEncoder().encode(JSON.stringify(obj));
    if (!root.CompressionStream) return Promise.resolve('j' + b64url(bytes));
    return new Response(new Blob([bytes]).stream().pipeThrough(new CompressionStream('deflate-raw')))
      .arrayBuffer()
      .then(function (buf) {
        return 'z' + b64url(new Uint8Array(buf));
      });
  }
  function unpack(s) {
    s = String(s || '');
    if (s[0] === 'j') return Promise.resolve(JSON.parse(new TextDecoder().decode(fromB64url(s.slice(1)))));
    if (s[0] !== 'z' || !root.DecompressionStream) return Promise.reject(new Error('unreadable'));
    return new Response(new Blob([fromB64url(s.slice(1))]).stream().pipeThrough(new DecompressionStream('deflate-raw')))
      .text()
      .then(JSON.parse);
  }
  var qrLoading = null;
  function qr(text) {
    var make = function () {
      var q = root.qrcode(0, 'L');
      q.addData(text);
      q.make();
      return q.createDataURL(4, 4);
    };
    if (root.qrcode) return Promise.resolve(make());
    qrLoading =
      qrLoading ||
      new Promise(function (ok, no) {
        var sc = document.createElement('script');
        sc.src = 'js/vendor/qrcode.js';
        sc.onload = ok;
        sc.onerror = no;
        document.head.appendChild(sc);
      });
    return qrLoading.then(make);
  }
  root.Transfer = { pack: pack, unpack: unpack, qr: qr, QR_MAX: 2200 };
})(typeof window !== 'undefined' ? window : globalThis);
