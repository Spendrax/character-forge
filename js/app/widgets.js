// Choice widgets: the lists of options a character picks from (features, feats, choices).
// Part of the app: these files share one scope (see “How the code is organized” in README.md), loaded in order by index.html.
'use strict';

// ---------- choice widgets ----------
function choiceHtml(c) {
  var head =
    '<div class="choice-head"><span>' +
    esc(c.label) +
    '</span><span class="count"' +
    (c.over ? ' style="color:var(--warn)" title="More than the usual number. Fine if your game allows more."' : '') +
    '>' +
    c.picked.length +
    ' / ' +
    c.count +
    (c.over ? ' · over the usual number' : '') +
    '</span></div>';
  var body;
  var rich = c.options.some(function (o) {
    return o.t;
  });
  if (c.select || (c.count === 1 && c.options.length > 12 && !rich)) {
    var lastG = null;
    body =
      '<select data-pick="' +
      esc(c.key) +
      '"><option value="">— choose —</option>' +
      c.options
        .map(function (o) {
          var pre = '';
          if (o.group && o.group !== lastG) {
            pre = (lastG ? '</optgroup>' : '') + '<optgroup label="' + esc(o.group) + '">';
            lastG = o.group;
          }
          return (
            pre +
            '<option value="' +
            esc(o.v) +
            '"' +
            (c.picked[0] === o.v ? ' selected' : '') +
            (o.disabled ? ' disabled' : '') +
            '>' +
            esc(o.label) +
            (o.disabled && o.why ? ' — ' + esc(o.why) : '') +
            '</option>'
          );
        })
        .join('') +
      (lastG ? '</optgroup>' : '') +
      '</select>';
    var sel = c.options.filter(function (o) {
      return o.v === c.picked[0];
    })[0];
    if (sel && sel.t) body += '<p class="small">' + esc(sel.t) + '</p>';
  } else if (rich) {
    var q = ui.q[c.key] || '',
      lvOf = function (o) {
        var m = String(o.pre || '').match(/(\d+)(?:st|nd|rd|th) level|^Level (\d+)/);
        return m ? +(m[1] || m[2]) : 0;
      };
    var lvs = c.options
      .map(lvOf)
      .filter(function (l, i, a) {
        return a.indexOf(l) === i;
      })
      .sort(function (a, b) {
        return a - b;
      });
    var lf = lvs.length > 1 ? ui.q[c.key + ':lv'] || '' : '';
    var lvOk = function (o) {
      return !lf || (lf === 'now' ? lvOf(o) <= (c.clv || 20) && !o.disabled : lvOf(o) === +lf);
    };
    var rows = c.options
      .reduce(function (out, o) {
        if (!(c.picked.indexOf(o.v) >= 0 || (match(q, o.label + ' ' + o.t + ' ' + (o.pre || '')) && lvOk(o))))
          return out;
        var on = c.picked.indexOf(o.v) >= 0;
        out.push(
          '<button type="button" class="opt' +
            (on ? ' on' : '') +
            '" data-act="pick" data-key="' +
            esc(c.key) +
            '" data-v="' +
            esc(o.v) +
            '"' +
            (o.disabled && !on ? ' disabled' : '') +
            '><b>' +
            esc(o.label) +
            '</b>' +
            (o.disabled && !on && o.why ? ' <small class="muted">— ' + esc(o.why) + '</small>' : '') +
            (o.pre ? ' <small class="muted">— requires ' + esc(o.pre) + '</small>' : '') +
            '<span>' +
            esc(o.t) +
            '</span></button>'
        );
        return out;
      }, [])
      .join('');
    var lvPill = function (v, t) {
      return btn('optLv', t, { key: c.key, v: v }, 'pill small' + (lf === v ? ' on' : ''));
    };
    body =
      (lvs.length > 1
        ? '<div class="pills">' +
          lvPill('', 'All') +
          (c.clv ? lvPill('now', 'Can take at level ' + c.clv) : '') +
          lvs
            .map(function (l) {
              return lvPill(String(l), l ? R.ord(l) + ' level' : 'Any level');
            })
            .join('') +
          '</div>'
        : '') +
      (c.options.length > 12 ? '<div class="toolbar">' + search(c.key, 'Search name or text…') + '</div>' : '') +
      (c.note ? '<p class="small muted">' + esc(c.note) + '</p>' : '') +
      '<div class="optlist">' +
      (rows || '<p class="small muted">Nothing matches.</p>') +
      '</div>';
  } else {
    var lastPG = null;
    body =
      '<div class="pills">' +
      c.options
        .map(function (o) {
          var on = c.picked.indexOf(o.v) >= 0,
            pre = '';
          if (o.group && o.group !== lastPG) {
            pre = '<span class="pill-group">' + esc(o.group) + '</span>';
            lastPG = o.group;
          }
          return (
            pre +
            '<button type="button" class="pill' +
            (on ? ' on' : '') +
            '" data-act="pick" data-key="' +
            esc(c.key) +
            '" data-v="' +
            esc(o.v) +
            '"' +
            (o.disabled && !on
              ? ' disabled title="' + esc(o.why ? 'Already have it: ' + o.why : 'Not available') + '"'
              : '') +
            '>' +
            esc(o.label) +
            '</button>'
          );
        })
        .join('') +
      '</div>';
  }
  var greyed = {};
  c.options.forEach(function (o) {
    if (o.disabled && o.why && c.picked.indexOf(o.v) < 0) (greyed[o.why] = greyed[o.why] || []).push(o.label);
  });
  var why = Object.keys(greyed).map(function (w) {
    return '<b>' + esc(greyed[w].join(', ')) + '</b> ' + esc(w);
  });
  if (why.length) body += '<p class="small muted greyed">Greyed out: ' + why.join('; ') + '.</p>';
  return '<div class="choice' + (c.missing ? ' todo' : '') + '">' + head + body + '</div>';
}
function choicesFor(step, filter) {
  return d.choices
    .reduce(function (out, c) {
      if (c.step === step && (!filter || filter(c))) out.push(choiceHtml(c));
      return out;
    }, [])
    .join('');
}
function featureHtml(f) {
  var t = store.detail && f.long ? f.long : f.t;
  return (
    '<div class="feature"><b>' +
    esc(f.n) +
    '</b>' +
    (f.l ? '<span class="lv">level ' + f.l + '</span>' : '') +
    (t ? '<div>' + esc(t) + '</div>' : '') +
    '</div>'
  );
}
function featSlotHtml(slot) {
  var h = '<div class="panel"><h3>' + esc(slot.label) + (slot.asi ? ' — improvement' : '') + '</h3>';
  if (slot.asi)
    h +=
      '<div class="pills">' +
      btn(
        'asimode',
        'Ability scores (+2, or +1 and +1)',
        { slot: slot.slot, v: 'asi' },
        'pill' + (slot.mode === 'asi' ? ' on' : '')
      ) +
      btn('asimode', 'Feat', { slot: slot.slot, v: 'feat' }, 'pill' + (slot.mode === 'feat' ? ' on' : '')) +
      '</div>';
  if (slot.fixed && slot.feat) h += '<p><b>' + esc(slot.feat.n) + '</b> — ' + esc(slot.feat.t) + '</p>';
  h += d.choices
    .reduce(function (out, c) {
      if (c.asiSlot === slot.slot || c.key.indexOf(slot.slot + '.') === 0) out.push(choiceHtml(c));
      return out;
    }, [])
    .join('');
  if (slot.feat && slot.feat.pre)
    h += '<p class="small muted">Prerequisite: ' + esc(slot.feat.pre) + ' (not checked automatically).</p>';
  return h + '</div>';
}
function slotChoice(c) {
  return /^(asi\.[\w-]+\.\d+|linfeat\d+|bgfeat\w*)\./.test(c.key);
}
