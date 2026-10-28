// What the AI helper sees of the character, and the changes it may propose.
// Part of the app: these files share one scope (see “How the code is organized” in README.md), loaded in order by index.html.
'use strict';

// ---------- what the helper (AI) sees, and the changes it may propose ----------
// A proposed change runs only when the user taps Apply; it goes through the same picks as tapping the option, so Undo works.
function aiApply(verb, a) {
  var r;
  if (!gameReady(gameOf())) throw new Error('Wait a moment: the game is still loading.');
  if (gameOf() === 'sd') throw new Error('The helper can’t change Shadowdark characters.');
  if (gameOf() === 'mm') r = MMV.context(ui.section).apply ? MMV.context(ui.section).apply(verb, a) : null;
  else if (gameOf() === 'pf2' || gameOf() === 'sf2') {
    var pv = gameOf() === 'sf2' ? SFV : PFV;
    r = pv.context(ui.section).apply ? pv.context(ui.section).apply(verb, a) : null;
  } else if (ch && verb !== 'choose') r = aiSet(verb, a);
  else if (verb === 'choose' && ch) {
    var k = String(a[0] || '')
        .trim()
        .toLowerCase(),
      c =
        d.choices.filter(function (x) {
          return x.key.toLowerCase() === k;
        })[0] ||
        d.choices.filter(function (x) {
          return x.label.toLowerCase() === k;
        })[0];
    if (!c) throw new Error('That choice isn’t open on this character');
    var n = String(a[1] || '')
        .trim()
        .toLowerCase(),
      o = c.options.filter(function (x) {
        return x.label.toLowerCase() === n || String(x.v).toLowerCase() === n;
      })[0];
    if (!o) throw new Error('“' + a[1] + '” isn’t an option for ' + c.label);
    if (c.picked.indexOf(o.v) >= 0) return o.label + ' was already picked';
    if (o.disabled) throw new Error(o.label + ' isn’t available' + (o.why ? ': ' + o.why : ''));
    ch.picks[c.key] = c.count === 1 && !c.multi ? [o.v] : c.picked.concat(o.v);
    r = c.label + ': ' + o.label;
  }
  if (r == null) throw new Error('Open the character (or hero) first');
  if (ch) d = R.derive(ch, store.filters); // fresh choices for the next change; one redraw (one Undo step) for all of them
  clearTimeout(aiApply.t);
  aiApply.t = setTimeout(render, 0);
  return r;
}
function byName(list, n, f) {
  n = String(n || '')
    .trim()
    .toLowerCase();
  return list.filter(function (x) {
    return String(f(x)).toLowerCase() === n;
  })[0];
}
function aiSet(verb, a) {
  if (verb === 'name') {
    ch.name = String(a[0] || '').trim();
    return 'Named ' + ch.name;
  }
  if (verb === 'background') {
    var b = byName(D.backgrounds, a[0], function (x) {
      return x.n;
    });
    if (!b) throw new Error('No background “' + a[0] + '”');
    actions.background(b.n);
    return 'Background: ' + b.n;
  }
  if (verb === 'lineage') {
    var l = byName(D.lineages, a[0], function (x) {
      return x.name;
    });
    if (!l) throw new Error('No lineage “' + a[0] + '”');
    if (ch.lineage !== l.id) actions.lineage(l.id);
    var v = l.versions[ch.version] || l.versions[0],
      sub =
        a[1] && v.subs
          ? v.subs
              .map(function (x, i) {
                return [x.n, i];
              })
              .filter(function (x) {
                return x[0].toLowerCase() === a[1].toLowerCase();
              })[0]
          : null;
    if (a[1] && !sub) throw new Error('No “' + a[1] + '” for ' + l.name);
    if (sub) actions.sub(sub[1]);
    return 'Lineage: ' + l.name + (sub ? ' (' + sub[0] + ')' : '');
  }
  if (verb === 'class') {
    var c = byName(D.classes, a[0], function (x) {
      return x.name;
    });
    if (!c) throw new Error('No class “' + a[0] + '”');
    var subs = R.subclassesOf(c.id),
      sc = a[2]
        ? byName(subs, a[2], function (x) {
            return x.name;
          }) ||
          subs.filter(function (x) {
            return (
              x.name.toLowerCase().indexOf(
                String(a[2])
                  .toLowerCase()
                  .replace(/^(school|college|circle|oath|path|domain) of (the )?/, '')
              ) >= 0
            );
          })[0]
        : null;
    if (a[2] && !sc) throw new Error('No ' + c.name + ' subclass “' + a[2] + '”');
    var e = entry(c.id);
    if (!e) {
      if (!ch.classes.length) actions.cls(c.id);
      else {
        ch.classes.push({ cls: c.id, level: 1, subclass: '' });
        ch.eq = {};
      }
      e = entry(c.id);
    }
    if (a[1]) e.level = Math.max(1, Math.min(20, Math.round(+a[1]) || 1));
    if (sc && e.subclass !== sc.id) {
      e.subclass = sc.id;
      clearPicks('sc.' + c.id + '.');
    }
    return c.name + ' level ' + e.level + (sc ? ', ' + sc.name : '');
  }
  throw new Error('Unknown change “' + verb + '”');
}
function aiContext() {
  if (!gameReady(gameOf())) return { where: 'Character Forge', subject: 'the app', text: 'The game is still loading.' };
  if (gameOf() === 'sd') {
    var sc = (store.sd || {}).chars || [],
      c = sc.filter(function (x) {
        return x.id === (store.sd || {}).cur;
      })[0];
    return {
      where: 'Shadowdark',
      subject: 'Shadowdark RPG',
      text:
        'Game: Shadowdark RPG (the app has no rules text: the player uses their own book). ' +
        (ui.section === 'sd-chars' && c
          ? 'Character: ' +
            JSON.stringify({
              name: c.name,
              ancestry: c.ancestry,
              cls: c.cls,
              level: c.level,
              stats: c.stats,
              hpMax: c.hpMax,
              ac: c.ac,
              talents: c.talents,
              spells: c.spells,
              gear: c.gear
            })
          : 'Page: the Shadowdark home page.')
    };
  }
  if (gameOf() === 'mm') {
    var mx = MMV.context(ui.section);
    if (mx.apply) mx.apply = aiApply;
    return mx;
  }
  if (gameOf() === 'pf2' || gameOf() === 'sf2') {
    var px = (gameOf() === 'sf2' ? SFV : PFV).context(ui.section);
    if (px.apply) px.apply = aiApply;
    return px;
  }
  var head = 'Game: Dungeons & Dragons 5th edition (2014 rules). ';
  if (ui.section === 'chars' && ch) {
    var stepName = (STEPS.filter(function (x) {
        return x[0] === ui.step;
      })[0] || ['', ui.step])[1],
      open = d.choices.filter(function (c) {
        return c.missing;
      });
    var L = [
      head +
        'Page: ' +
        (ui.mode === 'play' ? 'playing the character' : 'building the character') +
        ', “' +
        stepName +
        '” step.',
      'Character: ' +
        title(ch) +
        ' — ' +
        summaryLine(ch, d) +
        ', level ' +
        d.level +
        (d.bg ? ', background ' + d.bg.n : '') +
        (ch.alignment ? ', ' + ch.alignment : '') +
        '.',
      'Abilities: ' +
        AB.map(function (a) {
          return a + ' ' + d.abilities[a].total;
        }).join(', ') +
        '. AC ' +
        d.ac +
        ', HP ' +
        d.hp +
        ', speed ' +
        d.speed +
        ' ft.',
      'Proficient skills: ' +
        (Object.keys(d.skills)
          .filter(function (k) {
            return d.skills[k].prof;
          })
          .join(', ') || 'none') +
        '.',
      'Features: ' +
        d.features
          .map(function (f) {
            return f.n;
          })
          .slice(0, 40)
          .join(', ') +
        '.',
      d.casters.length
        ? 'Spells: ' +
          d.casters
            .map(function (S) {
              return (
                S.name +
                ' — cantrips ' +
                (S.cantrips.join(', ') || 'none') +
                '; spells ' +
                (S.known.join(', ') || 'none')
              );
            })
            .join(' | ')
        : '',
      open.length
        ? 'Choices still open: ' +
          open
            .map(function (c) {
              return (
                '[' +
                c.key +
                '] ' +
                c.label +
                ' (' +
                c.step +
                ' step, pick ' +
                c.missing +
                ' more; options: ' +
                c.options
                  .filter(function (o) {
                    return !o.disabled;
                  })
                  .slice(0, 30)
                  .map(function (o) {
                    return o.label;
                  })
                  .join(', ') +
                ')'
              );
            })
            .join(' | ')
        : 'No choices left open.',
      d.warnings.length ? 'Warnings: ' + d.warnings.join(' | ') : '',
      ch.notes && ch.notes.backstory ? 'Backstory: ' + ch.notes.backstory.slice(0, 1500) : ''
    ];
    var chips = [];
    if (!ch.lineage && !ch.classes.length) chips.push('Help me come up with a character idea');
    var here = open.filter(function (c) {
      return c.step === ui.step;
    })[0];
    if (here) chips.push('What should I pick for “' + here.label + '”?');
    else if (open.length) chips.push('What do I still need to choose?');
    if (d.warnings.length) chips.push('Explain my warnings');
    chips.push(ui.mode === 'play' ? 'What are my best options in a fight?' : 'Is my character built well?');
    L.push(
      'Changes you can propose (one per line, official English names):\n[[lineage: Elf | High Elf]] (subrace optional)\n[[class: Wizard | 3 | School of Evocation]] (adds the class, or sets its level and subclass; level and subclass optional)\n[[background: Sage]]\n[[name: Character name]]\n' +
        '[[choose: ' +
        (open[0] ? open[0].key : 'choice-key') +
        ' | Option name]] for an open choice: its key in brackets above, then the option’s exact name; several picks = several lines. New choices appear after a lineage, class or background is set, so propose those first and the choices in a later answer.'
    );
    return {
      where: title(ch) + ' · ' + stepName,
      subject: 'your character',
      text: L.filter(Boolean).join('\n'),
      chips: chips.slice(0, 4),
      apply: aiApply
    };
  }
  var names = {
    home: 'the home page',
    monsters: 'the monster list',
    encounters: 'the encounter builder',
    party: 'the party list',
    treasure: 'treasures',
    books: 'the rules book',
    audio: 'music',
    rules: 'house rules'
  };
  var t = head + 'Page: ' + (names[ui.section] || ui.section) + '.';
  if (ui.section === 'monsters' && ui.mon && ui.mon.open) {
    var m = MON.find(ui.mon.open);
    if (m)
      t +=
        '\nOpen monster: ' +
        m.n +
        ' (' +
        m.size +
        ' ' +
        m.type +
        ', CR ' +
        m.cr +
        ', AC ' +
        (m.acv || m.ac) +
        ', HP ' +
        m.hp +
        ').';
  }
  return {
    where: names[ui.section] || '',
    subject: 'D&D',
    text: t,
    chips:
      ui.section === 'monsters'
        ? ['How do I run this monster well?', 'Give me a fun twist for this fight']
        : ['Explain a rule for me', 'Give me an NPC for tonight', 'Help me plan a session']
  };
}
