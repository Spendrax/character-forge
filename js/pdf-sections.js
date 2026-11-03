// A PDF book read as sections: chapters and parts found in the book itself (its bookmarks when it has them,
// otherwise its headings, recognized by their bigger letters), with the text cleaned into paragraphs. It runs on
// this device with pdf.js, on the reader's own copy; the result is kept in the browser (js/books.js) and never leaves it.
// build(doc, name, progress) → Promise of { title, chapters: [{ t, parts: [{ t, md, pg }] }] }
(function (root) {
  'use strict';
  var round = function (n) {
    return Math.round(n * 2) / 2;
  };
  // ALL-CAPS HEADINGS → All-Caps Headings (small words stay small)
  var SMALL = /^(a|an|and|as|at|by|for|from|in|of|on|or|the|to|with)$/;
  function nice(t) {
    t = String(t).replace(/\s+/g, ' ').trim();
    if (t.length < 4 || /[a-z]/.test(t)) return t;
    return t
      .toLowerCase()
      .split(' ')
      .map(function (w, i) {
        return i && SMALL.test(w) ? w : w.charAt(0).toUpperCase() + w.slice(1);
      })
      .join(' ');
  }
  // the lines of one page: { t, size, y, gap } in reading order (pdf.js gives text in the order it was laid out)
  function pageLines(tc) {
    var lines = [],
      cur = null;
    tc.items.forEach(function (it) {
      if (it.str == null) return;
      var tr = it.transform || [1, 0, 0, 1, 0, 0],
        size = round(Math.hypot(tr[2], tr[3]) || it.height || 0),
        y = tr[5],
        x = tr[4];
      if (!cur || Math.abs(y - cur.y) > Math.max(2, Math.min(size, cur.size) * 0.6) || x < cur.x0 - 40) {
        if (cur) lines.push(cur);
        cur = { t: '', size: 0, y: y, x0: x, chars: {} };
      }
      var s = it.str;
      if (s) {
        if (cur.t && !/\s$/.test(cur.t) && !/^\s/.test(s) && x - cur.xEnd > size * 0.25) cur.t += ' ';
        cur.t += s;
        cur.chars[size] = (cur.chars[size] || 0) + s.replace(/\s/g, '').length;
      }
      cur.xEnd = x + (it.width || 0);
      if (it.hasEOL) {
        lines.push(cur);
        cur = null;
      }
    });
    if (cur) lines.push(cur);
    return lines.reduce(function (out, l) {
      var t = l.t.replace(/\s+/g, ' ').trim();
      if (!t) return out;
      // the line's size: the size most of its letters have
      var best = 0,
        n = -1;
      Object.keys(l.chars).forEach(function (k) {
        if (l.chars[k] > n) {
          n = l.chars[k];
          best = +k;
        }
      });
      out.push({ t: t, size: best, y: l.y });
      return out;
    }, []);
  }
  // page numbers and running headers/footers: at the top or bottom of the page, the same (digits aside) on many pages
  function repeated(pages) {
    var count = {},
      key = function (l) {
        return l.t.replace(/\d+/g, '#').toLowerCase();
      };
    pages.forEach(function (lines) {
      var ys = lines
        .map(function (l) {
          return l.y;
        })
        .sort(function (a, b) {
          return a - b;
        });
      var lo = ys[Math.min(1, ys.length - 1)],
        hi = ys[Math.max(0, ys.length - 2)],
        seen = {};
      lines.forEach(function (l) {
        l.edge = l.y <= lo || l.y >= hi;
        if (!l.edge) return;
        var k = key(l);
        if (!seen[k]) {
          seen[k] = 1;
          count[k] = (count[k] || 0) + 1;
        }
      });
    });
    var lim = Math.max(3, pages.length * 0.2);
    return function (l) {
      return l.edge && (/^[\divxlc#\s.\-–—|]+$/i.test(l.t) || count[key(l)] > lim);
    };
  }
  // the size of ordinary text, and the sizes that mean a heading (biggest first, each seen on two pages or more)
  function sizes(all) {
    var body = {},
      head = {};
    all.forEach(function (l) {
      body[l.size] = (body[l.size] || 0) + l.t.length;
    });
    var bodySize = +Object.keys(body).sort(function (a, b) {
      return body[b] - body[a];
    })[0];
    all.forEach(function (l) {
      if (l.size < bodySize * 1.15 || l.t.length > 80 || l.t.length < 2) return;
      if (/[.,;]$/.test(l.t) && l.t.length > 30) return;
      (head[l.size] = head[l.size] || {})[l.pg] = 1;
    });
    var levels = Object.keys(head)
      .map(Number)
      .sort(function (a, b) {
        return b - a;
      })
      .reduce(function (out, sz) {
        var pages = Object.keys(head[sz]);
        // sizes a hair apart are the same style
        if (out.length && out[out.length - 1].s - sz < 0.75)
          pages.forEach(function (pg) {
            out[out.length - 1].pages[pg] = 1;
          });
        else {
          var o = { s: sz, pages: {} };
          pages.forEach(function (pg) {
            o.pages[pg] = 1;
          });
          out.push(o);
        }
        return out;
      }, [])
      .filter(function (x) {
        return Object.keys(x.pages).length >= 2;
      });
    return { body: bodySize, levels: levels };
  }
  function levelOf(size, S) {
    for (var i = 0; i < S.levels.length && i < 3; i++) if (Math.abs(size - S.levels[i].s) < 0.75) return i + 1;
    return 0;
  }
  function isHead(l, S) {
    return l.t.length <= 80 ? levelOf(l.size, S) : 0;
  }
  // lines as Markdown: headings (### and below inside a part; a heading on two lines is one), paragraphs, bullets
  function textOf(lines, S, minLevel) {
    // 0: the biggest heading inside these lines becomes ### (bookmarks give the parts, headings are only inside)
    if (!minLevel)
      minLevel = lines.reduce(function (m, l) {
        var lv = isHead(l, S);
        return lv && lv < m ? lv : m;
      }, 9);
    var out = [],
      para = '',
      lastY = null,
      lastSize = 0,
      lastHead = 0;
    function flush() {
      if (para.trim()) out.push(para.trim());
      para = '';
    }
    lines.forEach(function (l) {
      var lv = isHead(l, S);
      if (lv && lv >= minLevel) {
        flush();
        if (lastHead === lv) out[out.length - 1] += ' ' + nice(l.t);
        else out.push('#'.repeat(Math.min(6, lv - minLevel + 3)) + ' ' + nice(l.t));
        lastHead = lv;
        lastY = null;
        return;
      }
      if (lastHead)
        out[out.length - 1] = out[out.length - 1].replace(/^(#+ )(.*)$/, function (m, h, t) {
          return h + nice(t);
        });
      lastHead = 0;
      var gap = lastY == null ? 0 : Math.abs(lastY - l.y),
        bullet = /^[•●▪◦■\-–]\s*/.test(l.t);
      // a sentence that goes on in the next column or on the next page is not a new paragraph
      var goesOn = para && !/[.!?:”"’)\]]$/.test(para) && /^[a-z(,;]/.test(l.t) && Math.abs(l.size - lastSize) <= 1;
      if (!goesOn && (bullet || gap > l.size * 1.9 || (gap && Math.abs(l.size - lastSize) > 1) || lastY == null))
        flush();
      var t = bullet ? '- ' + l.t.replace(/^[•●▪◦■\-–]\s*/, '') : l.t;
      if (para && /[a-z]-$/.test(para)) para = para.slice(0, -1) + t;
      else para += (para ? ' ' : '') + t;
      lastY = l.y;
      lastSize = l.size;
    });
    flush();
    return out.join('\n\n');
  }
  // the book's bookmarks, with the page each one opens
  function outline(doc) {
    return doc.getOutline().then(
      function (items) {
        if (!items || !items.length) return null;
        function page(dest) {
          var d = typeof dest === 'string' ? doc.getDestination(dest) : Promise.resolve(dest);
          return d.then(function (x) {
            if (!x || !x[0]) return null;
            return typeof x[0] === 'number'
              ? x[0] + 1
              : doc.getPageIndex(x[0]).then(function (i) {
                  return i + 1;
                });
          });
        }
        var flat = [];
        items.forEach(function (it) {
          flat.push({ t: it.title, d: it.dest, lv: 1 });
          (it.items || []).forEach(function (c) {
            flat.push({ t: c.title, d: c.dest, lv: 2 });
          });
        });
        return Promise.all(
          flat.map(function (f) {
            return page(f.d).then(
              function (p) {
                f.pg = p;
                return f;
              },
              function () {
                return f;
              }
            );
          })
        ).then(function (all) {
          var ok = all.filter(function (f) {
            return f.pg;
          });
          return ok.length >= 3 ? ok : null;
        });
      },
      function () {
        return null;
      }
    );
  }
  var norm = function (t) {
    return String(t)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '');
  };
  function build(doc, name, progress) {
    var n = doc.numPages,
      pages = [];
    function read(i) {
      if (i > n) return Promise.resolve();
      return doc
        .getPage(i)
        .then(function (pg) {
          return pg.getTextContent();
        })
        .then(
          function (tc) {
            pages[i - 1] = pageLines(tc);
          },
          function () {
            pages[i - 1] = [];
          }
        )
        .then(function () {
          if (progress && i % 10 === 0) progress(i, n);
          return read(i + 1);
        });
    }
    return read(1)
      .then(function () {
        return outline(doc);
      })
      .then(function (marks) {
        var skip = repeated(pages),
          all = [];
        pages.forEach(function (lines, pi) {
          lines.forEach(function (l) {
            if (!skip(l)) {
              l.pg = pi + 1;
              all.push(l);
            }
          });
        });
        if (!all.length) throw new Error('This PDF has no text: it is probably scanned pictures of pages.');
        var S = sizes(all),
          chapters = [];
        // a part's text, without the heading lines that make up its own title
        var partOf = function (title, lines, pg, minLevel) {
          var t = norm(title),
            i = 0;
          while (i < lines.length && i < 4 && isHead(lines[i], S) && t.indexOf(norm(lines[i].t)) >= 0) i++;
          return { t: nice(title), md: '## ' + nice(title) + '\n\n' + textOf(lines.slice(i), S, minLevel), pg: pg };
        };
        if (marks) {
          // bookmarks: each starts at its heading (on its page, or failing that at the top of the page)
          marks.sort(function (a, b) {
            return a.pg - b.pg;
          });
          var from = 0;
          marks.forEach(function (m) {
            var t = norm(m.t),
              at = -1;
            for (var i = from; i < all.length && all[i].pg <= m.pg + 1; i++) {
              if (all[i].pg < m.pg) continue;
              var x = norm(all[i].t);
              if (x.length >= 3 && isHead(all[i], S) && t.indexOf(x) === 0) {
                at = i;
                break;
              }
            }
            if (at < 0)
              for (i = from; i < all.length; i++)
                if (all[i].pg >= m.pg) {
                  at = i;
                  break;
                }
            m.at = at < 0 ? all.length : at;
            from = m.at;
          });
          marks.forEach(function (m, i) {
            var to = i + 1 < marks.length ? marks[i + 1].at : all.length,
              part = partOf(m.t, all.slice(m.at, Math.max(m.at, to)), m.pg, 0);
            if (m.lv === 1 || !chapters.length) chapters.push({ t: nice(m.t), parts: [] });
            chapters[chapters.length - 1].parts.push(part);
          });
        } else {
          // headings: the biggest heading size starts a chapter, the next one a part, smaller ones are inside
          var two = S.levels.length >= 2,
            cur = null,
            buf = [],
            ch = null;
          var close = function () {
            if (cur) {
              var p = partOf(cur.t, buf, cur.pg, two ? 3 : 2);
              if (cur.isCh) ch.t = p.t;
              ch.parts.push(p);
            }
            buf = [];
          };
          all.forEach(function (l, i) {
            var lv = isHead(l, S),
              prev = all[i - 1];
            // a heading on two lines: one heading
            if (cur && lv && lv <= 2 && prev && prev === cur.last && isHead(prev, S) === lv && prev.pg === l.pg) {
              cur.t += ' ' + l.t;
              cur.last = l;
              return;
            }
            if (lv === 1 && two) {
              close();
              ch = { t: l.t, parts: [] };
              chapters.push(ch);
              cur = { t: l.t, pg: l.pg, last: l, isCh: true };
              return;
            }
            if ((lv === 2 && two) || (lv === 1 && !two)) {
              // a chapter title followed straight by a part: no empty part for the chapter
              var empty = cur && cur.isCh && !buf.length;
              if (!empty) close();
              else buf = [];
              if (!ch) {
                ch = { t: name, parts: [] };
                chapters.push(ch);
              }
              if (empty) ch.t = nice(cur.t);
              cur = { t: l.t, pg: l.pg, last: l };
              return;
            }
            if (!cur) {
              ch = { t: name, parts: [] };
              chapters.push(ch);
              cur = { t: name, pg: l.pg, last: null };
            }
            buf.push(l);
          });
          close();
          chapters.forEach(function (c) {
            c.t = nice(c.t);
          });
        }
        // parts with almost nothing in them (a title page, a blank) go
        chapters.forEach(function (c) {
          if (c.parts.length > 1)
            c.parts = c.parts.filter(function (p, i) {
              return i > 0 || p.md.length - p.t.length > 40;
            });
        });
        return {
          title: name,
          chapters: chapters,
          by: marks ? 'bookmarks' : 'headings',
          sizes: [S.body].concat(
            S.levels.map(function (x) {
              return x.s;
            })
          )
        };
      });
  }
  root.PdfSections = { build: build, _pageLines: pageLines, _nice: nice };
})(typeof window !== 'undefined' ? window : globalThis);
