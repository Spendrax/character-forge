// Spells (D&D 5e): every spell in the app, with filters (level, class, school, concentration, ritual). A spell opens
// in place with its text; "Give it to" adds it to a character's Other spells (the Spells step).
// Part of the app: these files share one scope (see “How the code is organized” in README.md), loaded in order by index.html.
'use strict';

var SB_PAGE = 150; // spells shown until "Show more"
function sbState() {
  return (ui.sb = ui.sb || {
    lvl: '',
    cls: '',
    school: '',
    conc: '',
    ritual: '',
    open: '',
    more: SB_PAGE,
    to: '',
    msg: ''
  });
}
// the spells that pass the filters, by level then name
function sbList() {
  var S = sbState(),
    q = ui.q.sb || '',
    on = S.cls ? D.spellLists[S.cls] || [] : null;
  return Object.keys(D.spells)
    .reduce(function (out, k) {
      var s = D.spells[k];
      if (
        match(q, s.name + ' ' + s.school) &&
        (S.lvl === '' || s.level === +S.lvl) &&
        (!on || on.indexOf(s.name) >= 0) &&
        (!S.school || s.school === S.school) &&
        (!S.conc || !!s.conc === (S.conc === 'yes')) &&
        (!S.ritual || !!s.ritual === (S.ritual === 'yes'))
      )
        out.push(s);
      return out;
    }, [])
    .sort(function (a, b) {
      return a.level - b.level || a.name.localeCompare(b.name);
    });
}
function sbSelect(key, label, opts) {
  var S = sbState();
  return (
    '<select data-sb="' +
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
          (String(S[key]) === String(o[0]) ? ' selected' : '') +
          '>' +
          esc(o[1] || o[0]) +
          '</option>'
        );
      })
      .join('') +
    '</select>'
  );
}
function spellBookPage() {
  var S = sbState(),
    list = sbList(),
    shown = list.slice(0, S.more),
    schools = [],
    to = byId(S.to) ? S.to : store.current;
  Object.keys(D.spells).forEach(function (k) {
    if (schools.indexOf(D.spells[k].school) < 0) schools.push(D.spells[k].school);
  });
  var levels = [['0', 'Cantrips']];
  for (var l = 1; l <= 9; l++) levels.push([String(l), 'Level ' + l]);
  var h =
    '<main class="mon-main sb"><h2>Spells</h2><p class="muted">' +
    Object.keys(D.spells).length +
    ' spells. Tap one to read it and to give it to a character.</p>' +
    '<div class="panel"><div class="toolbar">' +
    search('sb', 'Search spells…') +
    sbSelect('lvl', 'Any level', levels) +
    sbSelect(
      'cls',
      'Any class',
      Object.keys(D.spellLists)
        .sort()
        .map(function (k) {
          return [k, k.charAt(0).toUpperCase() + k.slice(1)];
        })
    ) +
    sbSelect('school', 'Any school', schools.sort()) +
    sbSelect('conc', 'Concentration or not', [
      ['yes', 'Concentration'],
      ['no', 'No concentration']
    ]) +
    sbSelect('ritual', 'Ritual or not', [
      ['yes', 'Ritual'],
      ['no', 'Not a ritual']
    ]) +
    '<span class="muted small">' +
    list.length +
    ' found</span></div></div>' +
    (S.msg ? '<p class="notice">' + esc(S.msg) + '</p>' : '');
  var lastLvl = -1;
  h += shown
    .map(function (s) {
      var open = S.open === s.name,
        head = '';
      if (s.level !== lastLvl) {
        lastLvl = s.level;
        head = '<h3 class="sb-lvl">' + (s.level ? 'Level ' + s.level : 'Cantrips') + '</h3>';
      }
      return (
        head +
        '<div class="gs-row' +
        (open ? ' open' : '') +
        '"><button type="button" class="gs-hit" data-act="sbOpen" data-v="' +
        esc(s.name) +
        '" aria-expanded="' +
        open +
        '"><b>' +
        esc(s.name) +
        '</b><span class="small muted">' +
        esc(
          s.school +
            ' · ' +
            s.time +
            ' · ' +
            s.range +
            (s.conc ? ' · concentration' : '') +
            (s.ritual ? ' · ritual' : '')
        ) +
        '</span></button>' +
        (open ? '<div class="gs-detail">' + sbDetail(s, to) + '</div>' : '') +
        '</div>'
      );
    })
    .join('');
  if (list.length > shown.length)
    h +=
      '<div class="toolbar"><span class="small muted">Showing ' +
      shown.length +
      ' of ' +
      list.length +
      '.</span>' +
      btn('sbMore', 'Show ' + SB_PAGE + ' more', {}, 'btn') +
      '</div>';
  if (!list.length) h += '<p class="muted">No spell matches.</p>';
  return h + '</main>';
}
function sbDetail(s, to) {
  var classes = Object.keys(D.spellLists).reduce(function (a, k) {
    if (D.spellLists[k].indexOf(s.name) >= 0) a.push(k.charAt(0).toUpperCase() + k.slice(1));
    return a;
  }, []);
  var text = R.spellText(s.name);
  return (
    '<p class="small"><b>' +
    (s.level ? 'Level ' + s.level + ' ' + esc(s.school.toLowerCase()) : esc(s.school) + ' cantrip') +
    '</b> · Casting time ' +
    esc(s.time) +
    ' · Range ' +
    esc(s.range) +
    ' · Components ' +
    esc(s.comp || '—') +
    ' · Duration ' +
    esc(s.duration) +
    '</p>' +
    (classes.length ? '<p class="small muted">Classes: ' + esc(classes.join(', ')) + '</p>' : '') +
    (text
      ? BOOKS_MD(text)
      : '<p class="small muted">' +
        (gameReady('text') ? 'No text in the app for this one.' : 'Loading the text…') +
        '</p>') +
    (s.url
      ? '<p class="small"><a href="' + esc(s.url) + '" target="_blank" rel="noopener">Full text on the wiki ↗</a></p>'
      : '') +
    (store.chars.length
      ? '<div class="toolbar">Give it to <select data-sb="to" aria-label="Character">' +
        store.chars
          .map(function (c) {
            return (
              '<option value="' + c.id + '"' + (c.id === to ? ' selected' : '') + '>' + esc(title(c)) + '</option>'
            );
          })
          .join('') +
        '</select>' +
        btn('sbGive', '+ Add as another spell', { v: s.name }, 'btn small primary') +
        '</div>'
      : '')
  );
}
var sbActions = {
  sbOpen: function (v) {
    var S = sbState();
    S.open = S.open === v ? '' : v;
    S.msg = '';
  },
  sbMore: function () {
    sbState().more += SB_PAGE;
  },
  // a character's Other spells (the Spells step: for feats, items, boons)
  sbGive: function (v) {
    var S = sbState(),
      c = byId(byId(S.to) ? S.to : store.current);
    if (!c) return;
    c.extraSpells = c.extraSpells || [];
    if (
      c.extraSpells.some(function (x) {
        return x.n === v;
      })
    )
      S.msg = title(c) + ' already has ' + v + '.';
    else {
      c.extraSpells.push({ id: R.uid(), n: v, src: '', per: '' });
      S.msg = v + ' added to ' + title(c) + '’s spells (Spells step, Other spells: say where it comes from there).';
    }
  }
};
// the filters: a choice starts the list over
function sbChange(t) {
  var k = t.getAttribute('data-sb');
  if (!k) return false;
  var S = sbState();
  S[k] = t.value;
  if (k !== 'to') {
    S.more = SB_PAGE;
    S.msg = '';
  }
  return true;
}
