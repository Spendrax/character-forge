// Minimal read-only SQLite reader: lists tables and reads every row of a table.
// Enough to open app backups (like 5th Spellbook's) in the browser with no library and no network.
// Follows the published file format: https://www.sqlite.org/fileformat.html
(function (root) {
  'use strict';

  function SqliteFile(buffer) {
    var b = this.b = new Uint8Array(buffer);
    var magic = 'SQLite format 3\u0000';
    for (var i = 0; i < 16; i++) if (b[i] !== magic.charCodeAt(i)) throw new Error('Not an SQLite database');
    var ps = (b[16] << 8) | b[17];
    this.pageSize = ps === 1 ? 65536 : ps;
    this.usable = this.pageSize - b[20];
    this.enc = this.u32(56) || 1; // 1 UTF-8, 2 UTF-16le, 3 UTF-16be
    this.dec = typeof TextDecoder !== 'undefined' ? new TextDecoder(this.enc === 2 ? 'utf-16le' : this.enc === 3 ? 'utf-16be' : 'utf-8') : null;
    this.schema = this.rows(1, ['type', 'name', 'tbl_name', 'rootpage', 'sql']);
  }
  SqliteFile.isSqlite = function (buffer) {
    var b = new Uint8Array(buffer, 0, Math.min(16, buffer.byteLength)), m = 'SQLite format 3';
    for (var i = 0; i < m.length; i++) if (b[i] !== m.charCodeAt(i)) return false;
    return true;
  };
  var P = SqliteFile.prototype;
  P.u16 = function (o) { return (this.b[o] << 8) | this.b[o + 1]; };
  P.u32 = function (o) { return ((this.b[o] << 24) >>> 0) + (this.b[o + 1] << 16) + (this.b[o + 2] << 8) + this.b[o + 3]; };
  P.varint = function (o) { // returns [value, length]
    var v = 0;
    for (var i = 0; i < 8; i++) { var c = this.b[o + i]; v = v * 128 + (c & 0x7f); if (!(c & 0x80)) return [v, i + 1]; }
    return [v * 256 + this.b[o + 8], 9];
  };
  P.text = function (bytes) {
    if (this.dec) return this.dec.decode(bytes);
    var s = ''; for (var i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
    try { return decodeURIComponent(escape(s)); } catch (e) { return s; }
  };

  // Walk a table b-tree and return the raw payload of every row, in rowid order.
  P.cells = function (page, out) {
    out = out || [];
    var base = (page - 1) * this.pageSize, h = page === 1 ? 100 : 0, o = base + h, type = this.b[o];
    var n = this.u16(o + 3), interior = type === 0x05, ptrs = o + (interior ? 12 : 8);
    if (type !== 0x05 && type !== 0x0d) return out; // not a table page
    for (var i = 0; i < n; i++) {
      var c = base + this.u16(ptrs + i * 2);
      if (interior) { this.cells(this.u32(c), out); continue; }
      var ps = this.varint(c), rid = this.varint(c + ps[1]), start = c + ps[1] + rid[1];
      out.push({ rowid: rid[0], payload: this.payload(start, ps[0]) });
    }
    if (interior) this.cells(this.u32(o + 8), out);
    return out;
  };
  // A row's bytes, following overflow pages when the row does not fit on its page.
  P.payload = function (start, size) {
    var U = this.usable, X = U - 35;
    if (size <= X) return this.b.subarray(start, start + size);
    var M = Math.floor((U - 12) * 32 / 255) - 23, K = M + ((size - M) % (U - 4)), local = K <= X ? K : M;
    var out = new Uint8Array(size); out.set(this.b.subarray(start, start + local), 0);
    var got = local, next = this.u32(start + local);
    while (got < size && next) {
      var po = (next - 1) * this.pageSize, take = Math.min(U - 4, size - got);
      out.set(this.b.subarray(po + 4, po + 4 + take), got); got += take; next = this.u32(po);
    }
    return out;
  };
  // Decode one record into an array of column values.
  P.record = function (p) {
    var self = this, view = { b: p, varint: P.varint };
    var hs = view.varint.call(view, 0), pos = hs[1], types = [];
    while (pos < hs[0]) { var t = view.varint.call(view, pos); types.push(t[0]); pos += t[1]; }
    var off = hs[0], vals = [];
    types.forEach(function (t) {
      var v = null, len = 0;
      if (t >= 1 && t <= 6) {
        len = [0, 1, 2, 3, 4, 6, 8][t];
        v = 0;
        for (var i = 0; i < len; i++) v = v * 256 + p[off + i];
        if (p[off] & 0x80) v -= Math.pow(2, len * 8); // two's complement
      } else if (t === 7) { len = 8; v = new DataView(p.buffer, p.byteOffset + off, 8).getFloat64(0); }
      else if (t === 8) v = 0;
      else if (t === 9) v = 1;
      else if (t >= 12) { len = (t - (t % 2 ? 13 : 12)) / 2; var bytes = p.subarray(off, off + len); v = t % 2 ? self.text(bytes) : bytes; }
      off += len; vals.push(v);
    });
    return vals;
  };
  P.rows = function (rootpage, cols, alias) {
    var self = this;
    return this.cells(rootpage).map(function (c) {
      var vals = self.record(c.payload), o = {};
      cols.forEach(function (n, i) { o[n] = i < vals.length ? vals[i] : null; });
      if (alias && o[alias] == null) o[alias] = c.rowid;
      o._rowid = c.rowid;
      return o;
    });
  };
  P.tables = function () { return this.schema.filter(function (s) { return s.type === 'table'; }).map(function (s) { return s.name; }); };
  // Column names come from the CREATE TABLE statement. An "INTEGER PRIMARY KEY" column is the rowid.
  P.columns = function (name) {
    var s = this.schema.filter(function (x) { return x.type === 'table' && x.name === name; })[0];
    if (!s) throw new Error('No table ' + name);
    var body = s.sql.slice(s.sql.indexOf('(') + 1, s.sql.lastIndexOf(')')), parts = [], depth = 0, cur = '';
    for (var i = 0; i < body.length; i++) {
      var ch = body[i];
      if (ch === '(') depth++; if (ch === ')') depth--;
      if (ch === ',' && !depth) { parts.push(cur); cur = ''; } else cur += ch;
    }
    parts.push(cur);
    var cols = [], alias = null;
    parts.forEach(function (d) {
      d = d.trim(); if (!d || /^(PRIMARY|UNIQUE|CHECK|FOREIGN|CONSTRAINT)\b/i.test(d)) return;
      var n = d.match(/^[`"[]?([^`"\]\s]+)/)[1];
      if (/^\S+\s+INTEGER\s+PRIMARY\s+KEY/i.test(d)) alias = n;
      cols.push(n);
    });
    return { cols: cols, alias: alias, root: s.rootpage };
  };
  P.all = function (name) { var c = this.columns(name); return this.rows(c.root, c.cols, c.alias); };

  root.SqliteFile = SqliteFile;
  if (typeof module !== 'undefined') module.exports = SqliteFile;
})(typeof window !== 'undefined' ? window : globalThis);
