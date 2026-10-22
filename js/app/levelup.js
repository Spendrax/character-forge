// The level-up screen (D&D): pick the class that gains the level, take the average hit points or roll them, see what
// the new level brings, then confirm. Choices the new level needs (subclass, feat, spells…) are made on their steps.
// Part of the app: these files share one scope (see “How the code is organized” in README.md), loaded in order by index.html.
'use strict';

// the character as it would be with one more level in class id
function lvlPreview(id) {
  var c = JSON.parse(JSON.stringify(ch)),
    e = c.classes.filter(function (x) {
      return x.cls === id;
    })[0];
  if (e) e.level++;
  else c.classes.push({ cls: id, level: 1, subclass: '' });
  return { c: c, d: R.derive(c, store.filters), clv: e ? e.level : 1 };
}
// hit points the character has now, before temporary or magic extras
function lvlBaseHp() {
  return ch.hpMode === 'manual' && ch.hpManual > 0 ? ch.hpManual | 0 : ch.hpMode === 'max' ? d.hpMax : d.hpAvg;
}
// the hit points this level adds, for each way of getting them
function lvlGain(L, p) {
  var cls = R.cls(L.cls) || { hitDie: 8 },
    avg = p.d.hpAvg - d.hpAvg,
    bonus = avg - (cls.hitDie / 2 + 1); // Constitution and per-level bonuses (Tough, Dwarven Toughness…)
  return {
    die: cls.hitDie,
    bonus: bonus,
    avg: avg,
    max: p.d.hpMax - d.hpMax,
    roll: L.roll ? Math.max(1, L.roll + bonus) : 0
  };
}
function lvlSign(n) {
  return (n < 0 ? '−' : '+') + Math.abs(n);
}
function stepLevelUp() {
  var L = ui.lvl;
  if (d.level >= 20)
    return (
      '<div class="panel levelup"><h2>⬆ Level up</h2><p>This character is level 20, the highest level.</p>' +
      btn('lvlCancel', 'Back', {}, 'btn') +
      '</div>'
    );
  var used = ch.classes.reduce(function (a, e) {
      a.push(e.cls);
      return a;
    }, []),
    others = D.classes.reduce(function (a, c) {
      if (used.indexOf(c.id) < 0 && ok(c.tag)) a.push(c);
      return a;
    }, []),
    p = lvlPreview(L.cls),
    cls = R.cls(L.cls),
    g = lvlGain(L, p),
    base = lvlBaseHp();
  var h =
    '<div class="panel levelup"><h2>⬆ Level ' +
    d.level +
    ' → ' +
    (d.level + 1) +
    '</h2><h3>Which class gains the level?</h3><div class="pills">' +
    ch.classes
      .map(function (e) {
        var c = R.cls(e.cls);
        return btn(
          'lvlCls',
          esc(c ? c.name : e.cls) + ' ' + e.level + ' → ' + (e.level + 1),
          { v: e.cls },
          'pill' + (L.cls === e.cls ? ' on' : '')
        );
      })
      .join('') +
    '</div>';
  if (others.length)
    h +=
      '<label class="field"><span>Or a new class (multiclass)</span><select data-lvl="cls"><option value="">—</option>' +
      others
        .map(function (c) {
          return (
            '<option value="' +
            c.id +
            '"' +
            (L.cls === c.id ? ' selected' : '') +
            '>' +
            esc(c.name) +
            ' — needs ' +
            esc(R.multiclassReq(c.id)) +
            '</option>'
          );
        })
        .join('') +
      '</select></label>';
  h += p.d.warnings.reduce(function (a, w) {
    if (/^Multiclassing/.test(w)) a += '<p class="notice">' + esc(w) + '</p>';
    return a;
  }, '');

  // hit points
  var hows = [['avg', 'Average', g.avg]];
  if (ch.hpMode === 'max') hows.push(['max', 'Maximum', g.max]);
  hows.push(['roll', 'Roll', g.roll]);
  var gain = L.how === 'avg' ? g.avg : L.how === 'max' ? g.max : g.roll;
  h +=
    '</div><div class="panel levelup"><h3>❤ Hit points</h3><p class="small muted">' +
    esc(cls ? cls.name : '') +
    ' hit die d' +
    g.die +
    ', ' +
    lvlSign(g.bonus) +
    ' for Constitution' +
    (g.bonus !== p.d.abilities.CON.mod ? ' and other bonuses' : '') +
    '. Average is ' +
    (g.die / 2 + 1) +
    ' ' +
    lvlSign(g.bonus) +
    '.</p><div class="pills">' +
    hows
      .map(function (x) {
        return btn(
          'lvlHow',
          x[1] + (x[0] !== 'roll' || L.roll ? ' (' + lvlSign(x[2]) + ')' : ''),
          { v: x[0] },
          'pill' + (L.how === x[0] ? ' on' : '')
        );
      })
      .join('') +
    '</div>';
  if (L.how === 'roll')
    h +=
      '<div class="toolbar">' +
      btn('lvlRoll', '🎲 Roll d' + g.die, {}, 'btn') +
      '<label class="field" style="margin:0"><span>or the number you rolled</span><input type="number" min="1" max="' +
      g.die +
      '" data-lvl="roll" value="' +
      (L.roll || '') +
      '" style="width:5rem"></label>' +
      (L.roll
        ? '<span class="lvl-roll">🎲 ' + L.roll + ' ' + lvlSign(g.bonus) + ' = <b>' + g.roll + '</b></span>'
        : '') +
      '</div>';
  h +=
    '<p class="lvl-hp">Hit points <b>' +
    base +
    '</b> → <b>' +
    (L.how === 'roll' && !L.roll ? '?' : base + gain) +
    '</b></p>';
  if ((ch.hpLog || []).length)
    h +=
      '<p class="small muted">Earlier levels: ' +
      ch.hpLog
        .slice(-6)
        .map(function (x) {
          return 'level ' + x.l + ' ' + lvlSign(x.gain) + (x.how === 'roll' ? ' 🎲' : '');
        })
        .join(', ') +
      '</p>';

  // what the level brings
  var news = p.d.features.reduce(function (a, f) {
    if (f.clsId === L.cls && f.l === p.clv && (f.kind === 'class' || f.kind === 'subclass'))
      a.push(
        '<li><b>' + esc(f.n) + '</b>' + (f.t ? ' <span class="small muted">' + esc(f.t) + '</span>' : '') + '</li>'
      );
    return a;
  }, []);
  if (cls && cls.asiLevels.indexOf(p.clv) >= 0)
    news.push(
      '<li><b>Ability Score Improvement</b> <span class="small muted">or a feat, on the Abilities step</span></li>'
    );
  if (cls && p.clv === cls.subclassLevel)
    news.push('<li><b>Choose your subclass</b> <span class="small muted">on the Class step</span></li>');
  if (p.d.pb > d.pb) news.push('<li><b>Proficiency bonus ' + R.fmt(p.d.pb) + '</b></li>');
  var todo = STEPS.reduce(function (a, s) {
    var n = (p.d.todo[s[0]] || 0) - (d.todo[s[0]] || 0);
    if (n > 0) a.push(n + ' on ' + s[1]);
    return a;
  }, []);
  h +=
    '</div><div class="panel levelup"><h3>✨ ' +
    esc(cls ? cls.name : '') +
    ' level ' +
    p.clv +
    ' brings</h3>' +
    (news.length ? '<ul class="lvl-news">' + news.join('') + '</ul>' : '<p class="small muted">No new features.</p>') +
    (todo.length
      ? '<p class="notice">Choices to make after: ' + esc(todo.join(', ')) + '. You will be taken there.</p>'
      : '') +
    '<div class="toolbar">' +
    (L.how === 'roll' && !L.roll
      ? '<span class="small muted">Roll your hit die first.</span>'
      : btn('lvlOk', '✓ Level up', {}, 'btn primary')) +
    btn('lvlCancel', 'Cancel', {}, 'btn') +
    '</div></div>';
  return h;
}
// typing a roll or choosing a new class (from events.js)
function lvlInput(t, done) {
  if (!ui.lvl) return;
  var k = t.getAttribute('data-lvl');
  if (k === 'roll') {
    var cls = R.cls(ui.lvl.cls) || { hitDie: 8 };
    ui.lvl.roll = Math.min(cls.hitDie, Math.max(0, Math.round(+t.value) || 0));
  } else if (k === 'cls' && t.value) ui.lvl.cls = t.value;
  if (done) render();
}

actions.levelUp = function () {
  if (!ch.classes.length) {
    ui.mode = 'build';
    ui.step = 'class';
    ui.scrollToStep = true;
    return;
  }
  var main = ch.classes.reduce(function (a, e) {
    return !a || e.level > a.level ? e : a;
  }, null);
  ui.lvl = {
    id: ch.id,
    cls: main.cls,
    how: ch.hpMode === 'max' ? 'max' : ch.hpMode === 'manual' ? 'roll' : 'avg',
    roll: 0
  };
  window.scrollTo(0, 0);
};
actions.lvlCls = function (v) {
  ui.lvl.cls = v;
  ui.lvl.roll = 0;
};
actions.lvlHow = function (v) {
  ui.lvl.how = v;
};
actions.lvlRoll = function () {
  var cls = R.cls(ui.lvl.cls) || { hitDie: 8 },
    a = new Uint32Array(1);
  crypto.getRandomValues(a);
  ui.lvl.roll = 1 + (a[0] % cls.hitDie);
};
actions.lvlCancel = function () {
  ui.lvl = null;
};
actions.lvlOk = function () {
  var L = ui.lvl;
  if (!L || d.level >= 20 || (L.how === 'roll' && !L.roll)) return false;
  var p = lvlPreview(L.cls),
    g = lvlGain(L, p),
    gain = L.how === 'avg' ? g.avg : L.how === 'max' ? g.max : g.roll,
    base = lvlBaseHp(),
    before = d.todo,
    e = ch.classes.filter(function (x) {
      return x.cls === L.cls;
    })[0];
  // the average or maximum keep following the rules on their own; anything else becomes a running total
  if (!((L.how === 'avg' && ch.hpMode === 'avg') || (L.how === 'max' && ch.hpMode === 'max'))) {
    ch.hpMode = 'manual';
    ch.hpManual = base + gain;
  }
  if (e) e.level++;
  else ch.classes.push({ cls: L.cls, level: 1, subclass: '' });
  ch.hpLog = (ch.hpLog || []).concat([{ l: d.level + 1, cls: L.cls, gain: gain, how: L.how, roll: L.roll || 0 }]);
  ui.clsTab = L.cls;
  ui.lvl = null;
  ui.lvlMsg = 'Level ' + (d.level + 1) + '! Hit points ' + lvlSign(gain) + '.';
  // go to the first step that needs a choice, else back to the session
  var nd = R.derive(ch, store.filters),
    next = STEPS.filter(function (s) {
      return (nd.todo[s[0]] || 0) > (before[s[0]] || 0);
    })[0];
  if (next) {
    ui.mode = 'build';
    ui.step = next[0];
    ui.scrollToStep = true;
    ui.lvlMsg += ' Make the new choices below.';
  } else {
    ui.mode = 'play';
    ui.step = 'play';
  }
  save();
};
