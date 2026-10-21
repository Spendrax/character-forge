// Magic item texts you have yourself (files from your own notes, an Obsidian vault, a JSON item list…):
// read on this device, kept in the browser's own storage (IndexedDB), never uploaded.
// Accepts .md / .txt (one item per file, or several under "#" headings), a .zip of those, and JSON
// (a list of {name, rarity, type, entries/description}, or an object with an "item" list).
(function (root) {
  'use strict';
  var RAR = ['Common', 'Uncommon', 'Rare', 'Very rare', 'Legendary', 'Artifact'];
  function norm(n) {
    return String(n || '')
      .toLowerCase()
      .replace(/[’']/g, '')
      .replace(/\bor\b/g, ' ')
      .replace(/[^a-z0-9+]+/g, ' ')
      .trim();
  }
  function rarityOf(s) {
    s = String(s || '')
      .toLowerCase()
      .replace(/_/g, ' ');
    for (var i = RAR.length - 1; i >= 0; i--) if (s.indexOf(RAR[i].toLowerCase()) >= 0) return RAR[i];
    return '';
  }
  function cap(s) {
    s = String(s || '').trim();
    return s ? s[0].toUpperCase() + s.slice(1) : '';
  }
  // "{@spell fireball|phb}" → "fireball", "{@dice 2d6}" → "2d6"
  function tags(s) {
    return String(s).replace(/\{@\w+ ([^|}]*)[^}]*\}/g, '$1');
  }
  function entriesMd(e) {
    if (e == null) return '';
    if (typeof e === 'string') return tags(e);
    if (Array.isArray(e)) return e.map(entriesMd).filter(Boolean).join('\n\n');
    if (e.type === 'list')
      return (e.items || [])
        .map(function (x) {
          return '- ' + entriesMd(x).replace(/\n+/g, ' ');
        })
        .join('\n');
    if (e.type === 'table')
      return (
        (e.caption ? '**' + tags(e.caption) + '**\n\n' : '') +
        '| ' +
        (e.colLabels || []).map(tags).join(' | ') +
        ' |\n|' +
        (e.colLabels || [])
          .map(function () {
            return '---';
          })
          .join('|') +
        '|\n' +
        (e.rows || [])
          .map(function (r) {
            return (
              '| ' +
              r
                .map(function (c) {
                  return entriesMd(c).replace(/\n+/g, ' ');
                })
                .join(' | ') +
              ' |'
            );
          })
          .join('\n')
      );
    if (e.type === 'item' && e.name) return '**' + tags(e.name) + '** ' + entriesMd(e.entry || e.entries);
    return (e.name ? '**' + tags(e.name) + '.** ' : '') + entriesMd(e.entries || e.entry || e.items || '');
  }
  // the italic line under an item's name: "*Wondrous item, rare (requires attunement)*"
  function metaLine(text, it) {
    var m = String(text).match(/^\s*[*_]([^*_\n]*(common|uncommon|rare|legendary|artifact|varies)[^*_\n]*)[*_]\s*$/im);
    if (!m) return text;
    var line = m[1];
    if (!it.r) it.r = rarityOf(line);
    if (!it.type) it.type = cap(line.split(',')[0]);
    if (/attunement/i.test(line)) it.att = true;
    return text;
  }

  function fromMarkdown(text, fileName) {
    text = String(text || '').replace(/\r/g, '');
    var out = [],
      fm = /^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/.exec(text),
      f = {};
    if (fm) {
      fm[1].split('\n').forEach(function (l) {
        var x = /^([A-Za-z_]+):\s*(.*)$/.exec(l);
        if (x) f[x[1].toLowerCase()] = x[2].replace(/^["'](.*)["']$/, '$1').trim();
      });
      text = fm[2];
    }
    // several items in one file, each under its own heading
    var blocks = text.split(/\n(?=#{1,3} )/).filter(function (b) {
      return b.trim();
    });
    var heads = blocks.filter(function (b) {
      return /^#{1,3} /.test(b);
    });
    if (heads.length > 1 && !f.name) {
      heads.forEach(function (b) {
        var m = b.match(/^#{1,3} (.+)\n?([\s\S]*)$/);
        if (!m || !m[2].trim()) return;
        var it = { n: m[1].replace(/[*_]/g, '').trim(), d: m[2].trim() };
        metaLine(it.d, it);
        out.push(it);
      });
      return out;
    }
    var name =
      f.name ||
      f.title ||
      (text.match(/^#{1,3} (.+)$/m) || [])[1] ||
      String(fileName || 'Item')
        .replace(/\.[^.]+$/, '')
        .replace(/[-_]/g, ' ');
    var body = text.replace(/^#{1,3} .+\n?/, '').trim();
    var it = {
      n: String(name).replace(/[*_]/g, '').trim(),
      d: body,
      type: cap(f.type || f.item_type || ''),
      r: rarityOf(f.rarity),
      att: /true|yes|requires/i.test(f.attunement || f.requires_attunement || '')
    };
    metaLine(body, it);
    if (it.n && it.d) out.push(it);
    return out;
  }
  function fromJson(o) {
    var list = Array.isArray(o) ? o : (o && (o.item || o.items || o.magicItems || o.magicitems || o.results)) || [];
    return list
      .map(function (x) {
        if (!x || !x.name) return null;
        var d = x.entries
          ? entriesMd(x.entries)
          : x.desc != null
            ? [].concat(x.desc).join('\n\n')
            : x.description || x.text || '';
        var r = rarityOf(typeof x.rarity === 'object' ? x.rarity && x.rarity.name : x.rarity);
        var type =
          x.type && typeof x.type === 'object'
            ? x.type.name
            : x.equipment_category
              ? x.equipment_category.name
              : x.wondrous
                ? 'Wondrous item'
                : x.type || '';
        var TYPES = {
          W: 'Weapon',
          A: 'Ammunition',
          LA: 'Light armor',
          MA: 'Medium armor',
          HA: 'Heavy armor',
          S: 'Shield',
          P: 'Potion',
          RG: 'Ring',
          RD: 'Rod',
          SC: 'Scroll',
          ST: 'Staff',
          WD: 'Wand',
          M: 'Weapon',
          R: 'Weapon',
          G: 'Gear'
        };
        type = TYPES[String(type).split('|')[0]] || cap(type);
        return {
          n: String(x.name).trim(),
          d: String(d).trim(),
          type: type,
          r: r,
          att: !!(x.reqAttune || x.requires_attunement || /attunement/i.test(x.attunement || ''))
        };
      })
      .filter(function (x) {
        return x && x.d;
      });
  }
  // files: [{name, text}] → items
  function parse(files) {
    var out = [];
    files.forEach(function (f) {
      if (/\.json$/i.test(f.name) || /^\s*[[{]/.test(f.text)) {
        try {
          out = out.concat(fromJson(JSON.parse(f.text)));
          return;
        } catch (e) {
          /* not JSON after all */
        }
      }
      out = out.concat(fromMarkdown(f.text, f.name));
    });
    var seen = {};
    return out.filter(function (x) {
      var k = norm(x.n);
      if (!k || seen[k]) return false;
      seen[k] = 1;
      return true;
    });
  }

  // ---------- saved on this device ----------
  var list = null,
    byName = {};
  function db() {
    return new Promise(function (ok, no) {
      var r = root.indexedDB.open('character-forge', 1);
      r.onupgradeneeded = function () {
        r.result.createObjectStore('kv');
      };
      r.onsuccess = function () {
        ok(r.result);
      };
      r.onerror = function () {
        no(r.error);
      };
    });
  }
  function index() {
    byName = {};
    (list || []).forEach(function (x) {
      byName[norm(x.n)] = x;
    });
  }
  function load(done) {
    if (list || !root.indexedDB) {
      list = list || [];
      return done && done();
    }
    db()
      .then(function (d) {
        var q = d.transaction('kv').objectStore('kv').get('importedItems');
        q.onsuccess = function () {
          list = q.result || [];
          index();
          if (done) done();
        };
      })
      .catch(function () {
        list = [];
        if (done) done();
      });
  }
  function save(next) {
    list = next;
    index();
    return db().then(function (d) {
      return new Promise(function (ok) {
        var t = d.transaction('kv', 'readwrite');
        t.objectStore('kv').put(list, 'importedItems');
        t.oncomplete = ok;
        t.onerror = ok;
      });
    });
  }
  function add(items) {
    var have = {},
      cur = (list || []).slice();
    cur.forEach(function (x, i) {
      have[norm(x.n)] = i;
    });
    var n = 0;
    items.forEach(function (x) {
      var k = norm(x.n);
      if (have[k] != null) cur[have[k]] = x;
      else {
        cur.push(x);
        n++;
      }
    });
    return save(cur).then(function () {
      return { added: n, updated: items.length - n };
    });
  }

  root.ItemTexts = {
    parse: parse,
    fromMarkdown: fromMarkdown,
    fromJson: fromJson,
    norm: norm,
    load: load,
    add: add,
    clear: function () {
      return save([]);
    },
    list: function () {
      return list || [];
    },
    get: function (name) {
      return byName[norm(name)] || null;
    }
  };
  if (typeof module !== 'undefined') module.exports = root.ItemTexts;
})(typeof window !== 'undefined' ? window : globalThis);
