// Magic items: texts from the free rules or your own files, the Magic items section and the Items step.
// Part of the app: these files share one scope (see “How the code is organized” in README.md), loaded in order by index.html.
'use strict';

// ---------- magic item text from the free rules (SRD 5.1, in data/srd-book.js, loaded when first needed) ----------
var srdLoading = false,
  srdItems = null;
var ITEM_ALIAS = {
  'apparatus of kwalish': 'apparatus of the crab',
  'iron bands of bilarro': 'iron bands of binding',
  'quiver of ehlonna': 'efficient quiver',
  'daerns instant fortress': 'instant fortress',
  'hewards handy haversack': 'handy haversack',
  'keoghtoms ointment': 'restorative ointment',
  'nolzurs marvelous pigments': 'marvelous pigments'
};
function inorm(n) {
  return String(n || '')
    .toLowerCase()
    .replace(/[’']/g, '')
    .replace(/\bor\b/g, ' ')
    .replace(/[^a-z0-9+]+/g, ' ')
    .trim();
}
function srdItemText(name) {
  if (!D.book) {
    if (!srdLoading) {
      srdLoading = true;
      var sc = document.createElement('script');
      sc.src = 'data/srd-book.js';
      sc.onload = function () {
        render();
      };
      sc.onerror = function () {
        srdLoading = false;
      };
      document.head.appendChild(sc);
    }
    return null;
  }
  if (!srdItems) {
    srdItems = {};
    var ch2 = D.book.chapters.filter(function (c) {
      return /^Magic items/i.test(c.t);
    })[0];
    (ch2 ? ch2.parts : [])
      .filter(function (p) {
        return /^Items /.test(p.t);
      })
      .forEach(function (p) {
        p.md.split(/\n(?=### )/).forEach(function (blk) {
          var m = blk.match(/^### (.+)\n([\s\S]*)$/);
          if (m) srdItems[inorm(m[1])] = m[2].trim();
        });
      });
  }
  var k = inorm(name);
  return srdItems[k] || srdItems[ITEM_ALIAS[k] || ''] || srdItems[k.replace(/^\w+s /, '')] || '';
}
// the description panel under an item: the free rules' text, else the text that came with it, else your own
function itemDescHtml(it, readOnly) {
  var srd = it.k === 'magic' ? srdItemText(it.n) : '';
  if (srd === null) return '<div class="item-desc small muted">Loading the description…</div>';
  var link =
    it.k === 'magic' && it.slug
      ? ' <a href="' + esc(D.magicItemUrl(it.slug)) + '" target="_blank" rel="noopener">Wiki ↗</a>'
      : '';
  if (srd)
    return (
      '<div class="item-desc">' +
      BOOKS_MD(srd) +
      '<p class="small muted">From the free rules (SRD 5.1, CC-BY-4.0).' +
      link +
      '</p></div>'
    );
  var mine = !it.desc && window.ItemTexts && ItemTexts.get(it.n);
  if (mine)
    return (
      '<div class="item-desc">' +
      BOOKS_MD(mine.d) +
      '<p class="small muted">From your imported item texts (kept on this device).' +
      link +
      '</p></div>'
    );
  if (readOnly)
    return (
      '<div class="item-desc small muted">Not in the free rules, so its text can’t be built in.' +
      link +
      ' If you have its text, use Import item texts above, or paste it into the item once it’s in your inventory.</div>'
    );
  return (
    '<div class="item-desc">' +
    (it.desc
      ? BOOKS_MD(it.desc)
      : '<p class="small muted">' +
        (it.k === 'magic' ? 'This item isn’t in the free rules, so its text can’t be built in.' + link + ' ' : '') +
        'Paste or write its description here to keep it with the character:</p>') +
    '<textarea id="desc-' +
    it.id +
    '" data-itemdesc="' +
    it.id +
    '" rows="' +
    (it.desc ? 3 : 4) +
    '" placeholder="Description" aria-label="Description of ' +
    esc(it.n) +
    '">' +
    esc(it.desc || '') +
    '</textarea></div>'
  );
}
function BOOKS_MD(t) {
  return window.BooksUI && BooksUI.md ? BooksUI.md(t) : '<p>' + esc(t).replace(/\n/g, '<br>') + '</p>';
}
// the app's magic items plus the ones only in your imported texts
function allMagic() {
  var extra = window.ItemTexts
    ? ItemTexts.list()
        .filter(function (x) {
          var k = inorm(x.n);
          return !D.magicItems.some(function (m) {
            return inorm(m[0]) === k;
          });
        })
        .map(function (x) {
          return [x.n, [x.r || 'Unknown'], x.type || 'Imported item', x.att ? 1 : 0, ''];
        })
    : [];
  return extra.length
    ? D.magicItems.concat(extra).sort(function (a, b) {
        return a[0].localeCompare(b[0]);
      })
    : D.magicItems;
}
function itemImportBar() {
  var nImp = window.ItemTexts ? ItemTexts.list().length : 0;
  return (
    '<div class="toolbar"><label class="btn small' +
    (ui.section === 'items' ? ' primary' : '') +
    '">Import item texts<input type="file" id="itemTextFile" multiple accept=".md,.markdown,.txt,.json,.zip" hidden></label>' +
    (nImp
      ? ui.confirmClearItems
        ? '<span class="small">Remove all ' +
          nImp +
          ' imported texts from this device?</span>' +
          btn('clearItemTexts', 'Remove', {}, 'btn small danger') +
          btn('clearItemTextsNo', 'Keep', {}, 'btn small')
        : btn('clearItemTextsAsk', 'Remove imported (' + nImp + ')', {}, 'btn small')
      : '') +
    '<span class="small muted">Have item descriptions of your own (your notes, an Obsidian vault, a JSON list)? Import them and they show with the items.</span></div>' +
    (ui.itemMsg ? '<p class="small rest-msg">' + esc(ui.itemMsg) + '</p>' : '')
  );
}
// the Magic items section: every item to read, your imported texts, and giving an item to a character
function itemsPage() {
  var AM = allMagic(),
    q = ui.q.mi || '',
    types = [];
  AM.forEach(function (x) {
    if (types.indexOf(x[2]) < 0) types.push(x[2]);
  });
  var list = AM.filter(function (x) {
    return (
      match(q, x[0]) &&
      (!ui.miRarity || x[1].indexOf(ui.miRarity) >= 0) &&
      (!ui.miType || x[2] === ui.miType) &&
      (!ui.miOnly ||
        (ui.miOnly === 'srd' ? srdItemText(x[0]) : ui.miOnly === 'mine' ? window.ItemTexts && ItemTexts.get(x[0]) : 1))
    );
  });
  var sel = function (key, label, opts) {
    return (
      '<select data-ui="' +
      key +
      '" aria-label="' +
      label +
      '"><option value="">' +
      label +
      '</option>' +
      opts
        .map(function (o) {
          o = [].concat(o);
          return (
            '<option value="' +
            esc(o[0]) +
            '"' +
            (ui[key] === o[0] ? ' selected' : '') +
            '>' +
            esc(o[1] || o[0]) +
            '</option>'
          );
        })
        .join('') +
      '</select>'
    );
  };
  var chars = store.chars,
    to = byId(ui.miTo) ? ui.miTo : store.current;
  var shown = list.slice(0, ui.miMore || 150);
  return (
    '<main class="mon-main"><h2>Magic items</h2><p class="muted">' +
    AM.length +
    ' magic items. Tap ▸ to read one: items from the free rules (SRD) have their full text, and the ones you import show yours.</p>' +
    '<div class="panel">' +
    itemImportBar() +
    '<div class="toolbar">' +
    search('mi', 'Search magic items…') +
    sel('miRarity', 'Any rarity', D.rarities) +
    sel('miType', 'Any type', types.sort()) +
    sel('miOnly', 'All items', [
      ['srd', 'With text from the free rules'],
      ['mine', 'With your imported text']
    ]) +
    '<span class="muted small">' +
    list.length +
    ' found</span></div></div>' +
    '<div class="optlist mi-list">' +
    shown
      .map(function (x) {
        var op = ui.magicOpen === x[0];
        return (
          '<div class="spell"><div style="flex:1"><button type="button" class="fold" data-act="magicOpen" data-v="' +
          esc(x[0]) +
          '" aria-expanded="' +
          op +
          '">' +
          (op ? '▾' : '▸') +
          '</button> <b>' +
          esc(x[0]) +
          '</b> <span class="small muted">' +
          esc(x[2]) +
          ' · ' +
          esc(x[1].join(', ').toLowerCase()) +
          (x[3] ? ' · attunement' : '') +
          (!x[4] ? ' · imported' : '') +
          '</span>' +
          (op
            ? itemDescHtml({ k: 'magic', n: x[0], slug: x[4], id: 'pick' }, true) +
              (chars.length
                ? '<div class="toolbar">Give it to <select data-ui="miTo" aria-label="Character">' +
                  chars
                    .map(function (c) {
                      return (
                        '<option value="' +
                        c.id +
                        '"' +
                        (c.id === to ? ' selected' : '') +
                        '>' +
                        esc(title(c)) +
                        '</option>'
                      );
                    })
                    .join('') +
                  '</select>' +
                  x[1]
                    .map(function (r) {
                      return btn('giveMagic', '+ ' + r, { v: x[0], r: r }, 'btn small');
                    })
                    .join('') +
                  '</div>'
                : '')
            : '') +
          '</div></div>'
        );
      })
      .join('') +
    '</div>' +
    (list.length > shown.length
      ? '<div class="toolbar"><span class="small muted">Showing ' +
        shown.length +
        ' of ' +
        list.length +
        '.</span>' +
        btn('miMore', 'Show 150 more', {}, 'btn') +
        btn('miMore', 'Show all ' + list.length, { v: 'all' }, 'btn') +
        '</div>'
      : '') +
    (list.length ? '' : '<p class="muted">No items match.</p>') +
    '</main>'
  );
}
function importItemTexts(input) {
  var files = [].slice.call(input.files || []);
  input.value = '';
  if (!files.length) return;
  ui.itemMsg = 'Reading ' + files.length + ' file' + (files.length === 1 ? '' : 's') + '…';
  render();
  Promise.all(
    files.map(function (f) {
      return /\.zip$/i.test(f.name) && window.MonsterUI
        ? f.arrayBuffer().then(MonsterUI.unzip)
        : f.text().then(function (t) {
            return [{ name: f.name, text: t }];
          });
    })
  )
    .then(function (g) {
      var items = ItemTexts.parse([].concat.apply([], g));
      if (!items.length) throw new Error('none');
      return ItemTexts.add(items);
    })
    .then(
      function (r) {
        ui.itemMsg =
          r.added +
          r.updated +
          ' item text' +
          (r.added + r.updated === 1 ? '' : 's') +
          ' imported and saved on this device' +
          (r.updated ? ' (' + r.updated + ' replaced older ones)' : '') +
          '.';
      },
      function () {
        ui.itemMsg =
          'No item texts found in those files. Use .md or .txt files (one item each, or several under # headings), a .zip of them, or a JSON item list.';
      }
    )
    .then(render);
}
function itemName(it) {
  return it.k === 'magic' && it.slug
    ? '<a href="' + esc(D.magicItemUrl(it.slug)) + '" target="_blank" rel="noopener">' + esc(it.n) + '</a>'
    : esc(it.n);
}
function stepItems() {
  var inv = d.inv,
    over = inv.weight > inv.capacity,
    m = ch.money;
  var h =
    '<h2>Items</h2>' +
    partImportHtml('items') +
    packAddedHtml() +
    '<p class="muted">What your character owns: magic items, adventuring gear, coins and anything of your own.</p>' +
    '<div class="slots"><div class="stat" style="padding:.3rem .8rem"><b' +
    (over ? ' style="color:var(--warn)"' : '') +
    '>' +
    inv.weight +
    ' / ' +
    inv.capacity +
    '</b><span>Carried lb / capacity</span></div>' +
    '<div class="stat" style="padding:.3rem .8rem"' +
    (inv.attuned > inv.attuneMax
      ? ' title="Over the usual limit of ' + inv.attuneMax + '. Fine if your game allows more."'
      : '') +
    '><b' +
    (inv.attuned > inv.attuneMax ? ' style="color:var(--warn)"' : '') +
    '>' +
    inv.attuned +
    ' / ' +
    inv.attuneMax +
    '</b><span>Attuned items' +
    (inv.attuned > inv.attuneMax ? ' · over the usual limit' : '') +
    '</span></div>' +
    '<div class="stat" style="padding:.3rem .8rem"><b>' +
    inv.gpValue.toLocaleString('en') +
    '</b><span>Coins, in gp</span></div></div>' +
    '<p class="small muted">Capacity is Strength × 15 (push, drag or lift ' +
    inv.pushDrag +
    ' lb). The total counts these items, coins (50 to a pound), and the armor, shield and weapons chosen on the Equipment step; starting-equipment packs are not counted unless you add them here.</p>';
  h +=
    '<div class="panel"><h3>Coins</h3><div class="row">' +
    [
      ['pp', 'Platinum'],
      ['gp', 'Gold'],
      ['ep', 'Electrum'],
      ['sp', 'Silver'],
      ['cp', 'Copper']
    ]
      .map(function (c) {
        return (
          '<label class="field"><span>' +
          c[1] +
          ' (' +
          c[0] +
          ')</span><input type="number" min="0" id="money-' +
          c[0] +
          '" data-money="' +
          c[0] +
          '" value="' +
          (+m[c[0]] || 0) +
          '"></label>'
        );
      })
      .join('') +
    '</div></div>';
  h +=
    '<div class="panel"><h3>Inventory</h3><input type="text" id="quick-item" class="quick-item" placeholder="Type an item and press Enter (e.g. 3 torches)" aria-label="Add an item">';
  if (!ch.items.length) h += '<p class="muted">Nothing yet. Add items from the lists below.</p>';
  else
    h +=
      '<div class="tablewrap"><table><tr><th>Item</th><th>Qty</th><th>Lb each</th><th>Attuned</th><th></th></tr>' +
      ch.items
        .map(function (it) {
          var open = (ui.itemOpen || {})[it.id];
          return (
            '<tr><td><button type="button" class="fold" data-act="itemOpen" data-v="' +
            it.id +
            '" aria-expanded="' +
            !!open +
            '" aria-label="' +
            (open ? 'Hide' : 'Show') +
            ' the description of ' +
            esc(it.n) +
            '">' +
            (open ? '▾' : '▸') +
            '</button> <b>' +
            esc(it.n) +
            '</b><div class="small muted">' +
            esc(itemMeta(it)) +
            '</div>' +
            (open ? itemDescHtml(it) : '') +
            '<input type="text" class="note" id="note-' +
            it.id +
            '" data-itemtext="' +
            it.id +
            '" value="' +
            esc(it.note || '') +
            '" placeholder="Note (charges, where it is kept…)" aria-label="Note for ' +
            esc(it.n) +
            '"></td>' +
            '<td><input type="number" min="0" id="qty-' +
            it.id +
            '" data-item="' +
            it.id +
            '" data-f="qty" value="' +
            (+it.qty || 0) +
            '" aria-label="Quantity"></td>' +
            '<td><input type="number" min="0" step="0.25" id="w-' +
            it.id +
            '" data-item="' +
            it.id +
            '" data-f="w" value="' +
            (+it.w || 0) +
            '" aria-label="Weight each"></td>' +
            '<td class="num">' +
            (it.att
              ? '<input type="checkbox" data-itemcheck="' +
                it.id +
                '"' +
                (it.attuned ? ' checked' : '') +
                ' aria-label="Attuned to ' +
                esc(it.n) +
                '">'
              : '<span class="muted">—</span>') +
            '</td>' +
            '<td>' +
            btn('quickItem', it.quick ? '★ Quick' : '☆ Quick', { v: it.id }, 'btn tiny' + (it.quick ? ' on' : '')) +
            btn('rmItem', 'Remove', { v: it.id }, 'btn tiny') +
            '</td></tr>'
          );
        })
        .join('') +
      '</table></div>';
  h +=
    '</div><div class="panel"><h3>Add items</h3><div class="pills">' +
    [
      ['magic', 'Magic items'],
      ['gear', 'Adventuring gear'],
      ['custom', 'Your own item']
    ]
      .map(function (t) {
        return btn('itemTab', t[1], { v: t[0] }, 'pill' + (ui.itemTab === t[0] ? ' on' : ''));
      })
      .join('') +
    '</div>';
  var sel = function (key, label, list) {
    return (
      '<select data-ui="' +
      key +
      '" aria-label="' +
      label +
      '"><option value="">' +
      label +
      '</option>' +
      list
        .map(function (x) {
          return '<option' + (ui[key] === x ? ' selected' : '') + '>' + esc(x) + '</option>';
        })
        .join('') +
      '</select>'
    );
  };
  if (ui.itemTab === 'magic') {
    var q = ui.q.magic || '',
      types = [],
      AM = allMagic(),
      nImp = window.ItemTexts ? ItemTexts.list().length : 0;
    AM.forEach(function (x) {
      if (types.indexOf(x[2]) < 0) types.push(x[2]);
    });
    var list = AM.filter(function (x) {
      return match(q, x[0]) && (!ui.rarity || x[1].indexOf(ui.rarity) >= 0) && (!ui.itemType || x[2] === ui.itemType);
    });
    h +=
      '<div class="toolbar">' +
      search('magic', 'Search magic items…') +
      sel('rarity', 'Any rarity', D.rarities) +
      sel('itemType', 'Any type', types.sort()) +
      '<span class="muted small">' +
      list.length +
      ' of ' +
      AM.length +
      '</span></div>' +
      itemImportBar() +
      '<div class="optlist">' +
      list
        .slice(0, 80)
        .map(function (x) {
          var op = ui.magicOpen === x[0];
          return (
            '<div class="spell"><div><button type="button" class="fold" data-act="magicOpen" data-v="' +
            esc(x[0]) +
            '" aria-expanded="' +
            op +
            '">' +
            (op ? '▾' : '▸') +
            '</button> <b>' +
            esc(x[0]) +
            '</b> <span class="small muted">' +
            esc(x[2]) +
            (x[3] ? ' · attunement' : '') +
            (!x[4] ? ' · imported' : '') +
            '</span>' +
            (op ? itemDescHtml({ k: 'magic', n: x[0], slug: x[4], id: 'pick' }, true) : '') +
            '</div>' +
            '<div class="pills" style="flex:none">' +
            x[1]
              .map(function (r) {
                return btn('addMagic', '+ ' + r, { v: x[0], r: r }, 'btn tiny');
              })
              .join('') +
            '</div></div>'
          );
        })
        .join('') +
      '</div>' +
      (list.length > 80
        ? '<p class="small muted">Showing the first 80. Search or filter to narrow the list.</p>'
        : '') +
      (list.length ? '' : '<p class="muted">No items match.</p>') +
      '<p class="small muted">Tap ▸ to read an item. Items from the free rules (SRD) show their full text; for the others there is a link to the wiki, and you can paste the text into the item once it is in your inventory. Set the weight yourself after adding.</p>';
  } else if (ui.itemTab === 'gear') {
    var gq = ui.q.gear || '',
      cats = [];
    D.gear.forEach(function (x) {
      if (cats.indexOf(x[1]) < 0) cats.push(x[1]);
    });
    var gl = D.gear.filter(function (x) {
      return match(gq, x[0]) && (!ui.gearCat || x[1] === ui.gearCat);
    });
    h +=
      '<div class="toolbar">' +
      search('gear', 'Search gear…') +
      sel('gearCat', 'Any category', cats) +
      '</div><div class="optlist">' +
      gl
        .map(function (x) {
          var pk = D.packContents && D.packContents[x[0]];
          return (
            '<div class="spell"><div><b>' +
            esc(x[0]) +
            '</b> <span class="small muted">' +
            esc(x[1]) +
            (x[2] ? ' · ' + esc(x[2]) : '') +
            (x[3] ? ' · ' + fmtLb(x[3]) : '') +
            '</span>' +
            (pk
              ? '<div class="small">Holds: ' +
                esc(
                  pk
                    .map(function (p) {
                      return (p[1] > 1 ? p[1] + ' ' : '') + p[0];
                    })
                    .join(', ')
                ) +
                '. Adding it puts each of these in your inventory.</div>'
              : '') +
            '</div>' +
            btn('addGear', pk ? '+ Add contents' : '+ Add', { v: x[0] }, 'btn tiny') +
            '</div>'
          );
        })
        .join('') +
      '</div>' +
      (gl.length ? '' : '<p class="muted">No gear matches.</p>');
  } else {
    h +=
      '<div class="row" style="margin-top:.75rem"><label class="field" style="flex:1;min-width:12rem"><span>Name</span><input type="text" id="custom-n" style="width:100%"></label>' +
      '<label class="field"><span>Quantity</span><input type="number" id="custom-q" min="1" value="1"></label><label class="field"><span>Lb each</span><input type="number" id="custom-w" min="0" step="0.25" value="0"></label>' +
      '<label style="margin-bottom:.9rem"><input type="checkbox" id="custom-a"> Requires attunement</label>' +
      btn('addCustom', 'Add item', {}, 'btn primary') +
      '</div>';
  }
  return h + '</div>';
}
