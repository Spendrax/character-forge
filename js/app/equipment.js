// The Equipment step: armour, weapons, packs, magic bonuses and attacks.
// Part of the app: these files share one scope (see “How the code is organized” in README.md), loaded in order by index.html.
'use strict';

function foldBtn(n, open) {
  return (
    '<button type="button" class="fold" data-act="spellFold" data-v="' +
    esc(n) +
    '" aria-expanded="' +
    !!open +
    '" aria-label="' +
    (open ? 'Hide' : 'Show') +
    ' the description of ' +
    esc(n) +
    '">' +
    (open ? '▾' : '▸') +
    '</button>'
  );
}
function spellLink(n) {
  var s = D.findSpell(n);
  return s ? '<a href="' + esc(s.url) + '" target="_blank" rel="noopener">' + esc(s.name) + '</a>' : esc(n);
}
function slotsHtml() {
  var h = '<div class="slots">';
  if (d.pact)
    h += '<div class="stat"><b>' + d.pact.n + '</b><span>Pact slots (level ' + d.pact.level + ')</span></div>';
  d.slots.forEach(function (n, i) {
    h += '<div class="stat"><b>' + n + '</b><span>Level ' + (i + 1) + ' slots</span></div>';
  });
  return h + '</div>';
}
function profArmor(kind) {
  var p = d.prof.armor;
  return kind === 'Shield'
    ? p.some(function (a) {
        return /^Shields/.test(a);
      })
    : p.indexOf(kind + ' armor') >= 0 || p.indexOf('All armor') >= 0;
}
function profWeapon(w) {
  // same test as the attack list in rules.js
  return d.prof.weapons.some(function (p) {
    p = p.toLowerCase();
    return (
      p === (w[0] + 's').toLowerCase() ||
      (p === 'simple weapons' && /^Simple/.test(w[1])) ||
      (p === 'martial weapons' && /^Martial/.test(w[1]))
    );
  });
}
function stepEquipment() {
  var h = '<h2>Equipment</h2>' + partImportHtml('equipment') + packAddedHtml();
  if (d.cls && ui.mode !== 'play') {
    var chosenText =
      d.cls.equipment
        .map(function (line, i) {
          var o = R.parseEquip(line);
          return o.length < 2 ? line : o[ch.eq[i] | 0] || '';
        })
        .join(' ') +
      ' ' +
      ((d.bg && d.bg.eq) || '');
    var startPacks = Object.keys(D.packContents || {}).filter(function (n) {
      return new RegExp(n.replace(/['’]/g, '.').replace(/ Pack$/, '') + '.? pack', 'i').test(chosenText);
    });
    h +=
      '<div class="panel"><h3>Starting equipment — ' +
      esc(d.cls.name) +
      '</h3>' +
      d.cls.equipment
        .map(function (line, i) {
          var o = R.parseEquip(line);
          if (o.length < 2) return '<p>' + esc(line) + '</p>';
          return (
            '<div class="pills" style="margin:.4rem 0">' +
            o
              .map(function (t, j) {
                return btn('eq', esc(t), { i: i, v: j }, 'pill' + ((ch.eq[i] | 0) === j ? ' on' : ''));
              })
              .join('') +
            '</div>'
          );
        })
        .join('') +
      (d.bg ? '<h3>From ' + esc(d.bg.n) + '</h3><p>' + esc(d.bg.eq || '—') + '</p>' : '') +
      (startPacks.length
        ? '<div class="toolbar" style="margin-top:.6rem">' +
          startPacks
            .map(function (n) {
              return btn('addStartPack', '⇩ Put the ' + esc(n) + ' in my items', { v: n });
            })
            .join('') +
          '<span class="small muted">Adds everything the pack holds to the Items step.</span></div>'
        : '') +
      '</div>';
  }
  var CA = ch.customArmor || [],
    CW = ch.customWeapons || [];
  var opt = function (v, label, cur) {
    return (
      '<option value="' + esc(v) + '"' + (String(cur) === String(v) ? ' selected' : '') + '>' + esc(label) + '</option>'
    );
  };
  h +=
    '<div class="panel"><h3>Armor</h3><div class="row"><label class="field"><span>Worn armor</span><select data-set="armor"><option value="">None</option>' +
    ['Light', 'Medium', 'Heavy']
      .map(function (kind) {
        return (
          '<optgroup label="' +
          kind +
          ' armor' +
          (profArmor(kind) ? '' : ' (not proficient)') +
          '">' +
          D.armor
            .reduce(function (out, a) {
              if (a[1] === kind)
                out.push(
                  '<option value="' +
                    esc(a[0]) +
                    '"' +
                    (ch.armor === a[0] ? ' selected' : '') +
                    '>' +
                    esc(a[0]) +
                    ', AC ' +
                    a[3] +
                    (a[1] === 'Light' ? ' + Dex' : a[1] === 'Medium' ? ' + Dex (max 2)' : '') +
                    (a[5] ? ', Str ' + a[5] : '') +
                    '</option>'
                );
              return out;
            }, [])
            .join('') +
          '</optgroup>'
        );
      })
      .join('') +
    '<optgroup label="Spells">' +
    opt('spell:mage-armor', 'Mage Armor — spell, AC 13 + Dex (no armor worn)', ch.armor) +
    '</optgroup>' +
    (CA.length
      ? '<optgroup label="Your own armor">' +
        CA.map(function (a) {
          return opt(
            'custom:' + a.id,
            (a.n || 'Custom armor') +
              ' — ' +
              (a.kind || 'Light') +
              ', AC ' +
              (a.ac || 10) +
              (+a.bonus ? ' ' + R.fmt(+a.bonus) : ''),
            ch.armor
          );
        }).join('') +
        '</optgroup>'
      : '') +
    '</select></label>' +
    '<label style="margin-bottom:.9rem"><input type="checkbox" data-check="shield"' +
    (ch.shield ? ' checked' : '') +
    '> Shield' +
    (profArmor('Shield') ? '' : ' <span class="small" style="color:var(--warn)">(not proficient)</span>') +
    '</label>' +
    (ch.shield
      ? '<label class="field extra-num" style="max-width:110px"><span>Shield bonus</span><input type="number" step="1" data-shieldbonus="1" value="' +
        (ch.shieldBonus != null && ch.shieldBonus !== '' ? ch.shieldBonus : 2) +
        '"></label>'
      : '') +
    '<div class="stat" style="padding:.3rem .9rem;margin-bottom:.6rem"><b>' +
    d.ac +
    '</b><span>Armor class</span></div></div><p class="small muted">' +
    esc(d.acNote) +
    '</p>' +
    (d.warnings.some(function (w) {
      return /^Not proficient with (light|medium|heavy|shields)/i.test(w);
    })
      ? '<p class="small" style="color:var(--warn)">' +
        esc(
          d.warnings
            .filter(function (w) {
              return /^Not proficient/.test(w);
            })
            .join(' ')
        ) +
        " Without proficiency you have disadvantage on Strength and Dexterity rolls and attacks, and can't cast spells.</p>"
      : '') +
    (CA.length
      ? '<h4 style="margin-top:1rem">Your own armor</h4>' +
        CA.map(function (a) {
          if (ui.editArmor !== a.id) {
            var worn = ch.armor === 'custom:' + a.id;
            return (
              '<div class="custom-line' +
              (worn ? ' on' : '') +
              '"><div><b>' +
              esc(a.n || 'Custom armor') +
              '</b> <span class="small muted">' +
              esc(
                (a.kind || 'Light') +
                  ', AC ' +
                  (a.ac || 10) +
                  (a.dex === 'none' || a.kind === 'Heavy' ? '' : a.dex === '2' ? ' + Dex (max 2)' : ' + Dex') +
                  (+a.bonus ? ', ' + R.fmt(+a.bonus) + ' magic' : '') +
                  (+a.str ? ', needs Str ' + a.str : '') +
                  (+a.w ? ', ' + a.w + ' lb' : '')
              ) +
              '</span></div>' +
              '<div class="toolbar">' +
              (worn ? '<span class="tag">worn</span>' : btn('wearArmor', 'Wear', { v: a.id }, 'btn tiny')) +
              btn('editArmor', 'Edit', { v: a.id }, 'btn tiny') +
              btn('rmArmor', 'Remove', { v: a.id }, 'btn tiny danger') +
              '</div></div>'
            );
          }
          var f = function (k, label, type, extra) {
            return (
              '<label class="field"><span>' +
              label +
              '</span><input type="' +
              type +
              '" id="ca-' +
              a.id +
              '-' +
              k +
              '" data-carmor="' +
              a.id +
              '" data-f="' +
              k +
              '" value="' +
              esc(a[k] != null ? a[k] : '') +
              '"' +
              (extra || '') +
              '></label>'
            );
          };
          return (
            '<div class="custom-card' +
            (ch.armor === 'custom:' + a.id ? ' on' : '') +
            '"><div class="row">' +
            f('n', 'Name', 'text') +
            '<label class="field"><span>Type</span><select data-carmor="' +
            a.id +
            '" data-f="kind">' +
            ['Light', 'Medium', 'Heavy', 'Natural']
              .map(function (k) {
                return opt(k, k === 'Natural' ? 'Natural / clothing (no proficiency needed)' : k, a.kind || 'Light');
              })
              .join('') +
            '</select></label>' +
            f('ac', 'Base AC', 'number', ' min="0" step="1"') +
            '<label class="field"><span>Dexterity</span><select data-carmor="' +
            a.id +
            '" data-f="dex">' +
            opt('full', '+ full Dex', a.dex || 'full') +
            opt('2', '+ Dex (max 2)', a.dex || 'full') +
            opt('none', 'no Dex', a.dex || 'full') +
            '</select></label>' +
            f('bonus', 'Magic bonus', 'number', ' step="1"') +
            f('str', 'Strength needed', 'number', ' min="0" step="1"') +
            f('w', 'Weight (lb)', 'number', ' min="0" step="any"') +
            '</div>' +
            '<div class="toolbar">' +
            btn('saveCustom', 'Save', {}, 'btn primary') +
            btn('rmArmor', 'Remove', { v: a.id }, 'btn tiny danger') +
            '</div></div>'
          );
        }).join('')
      : '') +
    '<div class="toolbar" style="margin-top:.6rem">' +
    btn('addArmor', '+ Add your own armor') +
    '</div></div>';
  h +=
    '<div class="panel"><h3>Weapons</h3><div class="row"><select id="addWeapon" data-addweapon="1"><option value="">Add a weapon…</option>' +
    ['Simple Melee', 'Simple Ranged', 'Martial Melee', 'Martial Ranged']
      .map(function (cat) {
        return (
          '<optgroup label="' +
          cat +
          '">' +
          D.weapons
            .reduce(function (out, w) {
              if (w[1] === cat)
                out.push(
                  '<option value="' +
                    esc(w[0]) +
                    '">' +
                    (profWeapon(w) ? '✓ ' : '✗ ') +
                    esc(w[0]) +
                    ' — ' +
                    esc(w[3]) +
                    '</option>'
                );
              return out;
            }, [])
            .join('') +
          '</optgroup>'
        );
      })
      .join('') +
    '</select><span class="small muted">✓ proficient · ✗ not proficient (no proficiency bonus to hit)</span>' +
    btn('addCWeapon', '+ Add your own weapon') +
    '</div>' +
    attacksHtml(true) +
    (CW.filter(function (w) {
      return ui.editWeapon === w.id;
    }).length
      ? '<h4 style="margin-top:1rem">Your own weapon</h4>' +
        CW.reduce(function (out, w) {
          if (!(ui.editWeapon === w.id)) return out;
          var f = function (k, label, type, extra) {
            return (
              '<label class="field"><span>' +
              label +
              '</span><input type="' +
              type +
              '" id="cw-' +
              w.id +
              '-' +
              k +
              '" data-cweapon="' +
              w.id +
              '" data-f="' +
              k +
              '" value="' +
              esc(w[k] != null ? w[k] : '') +
              '"' +
              (extra || '') +
              '></label>'
            );
          };
          var types = [
            'Bludgeoning',
            'Piercing',
            'Slashing',
            'Acid',
            'Cold',
            'Fire',
            'Force',
            'Lightning',
            'Necrotic',
            'Poison',
            'Psychic',
            'Radiant',
            'Thunder'
          ];
          out.push(
            '<div class="custom-card"><div class="row">' +
              f('n', 'Name', 'text') +
              f('dmg', 'Damage dice', 'text', ' placeholder="1d8"') +
              '<label class="field"><span>Damage type</span><select data-cweapon="' +
              w.id +
              '" data-f="type">' +
              types
                .map(function (t) {
                  return opt(t, t, w.type || 'Slashing');
                })
                .join('') +
              '</select></label>' +
              '<label class="field"><span>Melee or ranged</span><select data-cweapon="' +
              w.id +
              '" data-f="ranged">' +
              opt('', 'Melee', w.ranged ? '1' : '') +
              opt('1', 'Ranged', w.ranged ? '1' : '') +
              '</select></label>' +
              (w.ranged ? f('range', 'Range', 'text', ' placeholder="80/320"') : '') +
              '<label class="field"><span>Attack with</span><select data-cweapon="' +
              w.id +
              '" data-f="ability">' +
              opt('auto', 'Normal (Str melee, Dex ranged)', w.ability || 'auto') +
              opt('finesse', 'Finesse (best of Str or Dex)', w.ability || 'auto') +
              AB.map(function (a) {
                return opt(a, D.abilityNames[a], w.ability || 'auto');
              }).join('') +
              '</select></label>' +
              f('hit', 'Attack bonus', 'number', ' step="1"') +
              f('dmgBonus', 'Damage bonus', 'number', ' step="1"') +
              f('props', 'Properties and notes', 'text', ' placeholder="Light, thrown (20/60)…"') +
              f('w', 'Weight (lb)', 'number', ' min="0" step="any"') +
              '</div>' +
              '<label class="check-line"><input type="checkbox" data-cweapon="' +
              w.id +
              '" data-f="prof"' +
              (w.prof !== false ? ' checked' : '') +
              '> Proficient</label>' +
              '<div class="toolbar">' +
              btn('saveCustom', 'Save', {}, 'btn primary') +
              btn('rmCWeapon', 'Remove', { v: w.id }, 'btn tiny danger') +
              '</div></div>'
          );
          return out;
        }, []).join('')
      : '') +
    '</div>';
  h +=
    '<div class="panel"><h3>Other notes</h3><label class="field"><span>Anything else worth writing down about your gear</span><textarea id="gear" data-text="gear">' +
    esc(ch.gear) +
    '</textarea></label>' +
    '<p class="small muted">Magic items, adventuring gear, coins and carried weight are on the ' +
    btn('step', 'Items', { v: 'items' }, 'btn tiny') +
    ' step.</p></div>';
  h += magicPanel();
  return h;
}
// Magic +1/+2/+3 on armor, shield, weapons and focus, and the infusions and invocations that enchant one of them.
function magicPanel() {
  var mg = ch.magic || {},
    keys = [];
  if (ch.armor && !/^spell:/.test(ch.armor))
    keys.push([
      'armor',
      'Armor: ' +
        (/^custom:/.test(ch.armor)
          ? (
              (ch.customArmor || []).filter(function (a) {
                return 'custom:' + a.id === ch.armor;
              })[0] || {}
            ).n || 'your armor'
          : ch.armor)
    ]);
  if (ch.shield) keys.push(['shield', 'Shield']);
  (ch.weapons || []).forEach(function (n) {
    keys.push(['w:' + n, n]);
  });
  (ch.customWeapons || []).forEach(function (w) {
    keys.push(['c:' + w.id, w.n || 'Your weapon']);
  });
  keys.push(['focus', 'Spellcasting focus (spell attacks)']);
  var label = {};
  keys.forEach(function (k) {
    label[k[0]] = k[1];
  });
  var h =
    '<div class="panel"><h3>Magic bonuses</h3><p class="small muted">A +1, +2 or +3 item (a +1 longsword, +1 armor, a +1 shield, a wand of the war mage…). The bonus is added to attack and damage, AC or spell attacks. Bonuses on one item don’t add up: the best counts.</p><div class="magic-grid">' +
    keys
      .map(function (k) {
        return (
          '<label class="field"><span>' +
          esc(k[1]) +
          '</span><select data-magic="' +
          esc(k[0]) +
          '">' +
          [0, 1, 2, 3]
            .map(function (v) {
              return (
                '<option value="' +
                v +
                '"' +
                ((+mg[k[0]] || 0) === v ? ' selected' : '') +
                '>' +
                (v ? '+' + v : 'none') +
                '</option>'
              );
            })
            .join('') +
          '</select></label>'
        );
      })
      .join('') +
    '</div>';
  if (d.gearBoosts.length) {
    h +=
      '<h4>From your infusions and invocations</h4>' +
      d.gearBoosts
        .map(function (b) {
          return (
            '<div class="boost-line"><div><b>' +
            esc(b.n) +
            '</b> <span class="tag">+' +
            b.bonus +
            '</span><div class="small muted">+' +
            b.bonus +
            ' to ' +
            esc(b.what) +
            '</div></div>' +
            (b.cands.length
              ? '<select data-booston="' +
                esc(b.n) +
                '"><option value="">Not on an item</option>' +
                b.cands
                  .map(function (c) {
                    return (
                      '<option value="' +
                      esc(c) +
                      '"' +
                      (b.target === c ? ' selected' : '') +
                      '>' +
                      esc(label[c] || c) +
                      '</option>'
                    );
                  })
                  .join('') +
                '</select>'
              : '<span class="small muted">Add ' +
                (b.kind === 'weapon' ? 'a weapon' : b.kind === 'shield' ? 'a shield' : 'armor or a shield') +
                ' first.</span>') +
            '</div>'
          );
        })
        .join('');
  }
  return h + '</div>';
}
function attacksHtml(edit) {
  if (!d.attacks.length) return edit ? '<p class="muted">No weapons added yet.</p>' : '';
  return (
    '<div class="tablewrap"><table><tr><th>Weapon</th><th class="num">To hit</th><th>Damage</th><th>Properties</th>' +
    (edit ? '<th></th>' : '') +
    '</tr>' +
    d.attacks
      .map(function (a) {
        return (
          '<tr><td><b>' +
          (a.plus ? '+' + a.plus + ' ' : '') +
          esc(a.name) +
          '</b>' +
          (a.plus && a.plusFrom !== 'magic' ? ' <span class="small muted">(' + esc(a.plusFrom) + ')</span>' : '') +
          (a.proficient ? '' : ' <span class="small muted">(not proficient)</span>') +
          '</td><td class="num">' +
          R.fmt(a.hit) +
          '</td><td>' +
          esc(a.damage) +
          '</td><td class="small">' +
          esc(a.props) +
          '</td>' +
          (edit
            ? '<td class="row-actions">' +
              (a.custom
                ? btn('editCWeapon', 'Edit', { v: a.custom }, 'btn tiny') +
                  btn('rmCWeapon', 'Remove', { v: a.custom }, 'btn tiny')
                : btn('rmWeapon', 'Remove', { v: a.name }, 'btn tiny')) +
              '</td>'
            : '') +
          '</tr>'
        );
      })
      .join('') +
    '</table></div>'
  );
}
function packAddedHtml() {
  var P = ui.packAdded;
  if (!P) return '';
  return (
    '<div class="panel noprint"><b>Added the ' +
    esc(P.name) +
    ' to your items:</b> ' +
    esc(P.list.join(', ')) +
    '. Not right? Press Undo at the top. ' +
    btn('packAddedClose', 'OK', {}, 'btn tiny') +
    '</div>'
  );
}
function fmtLb(n) {
  return Math.round(n * 100) / 100 + ' lb';
}
function itemMeta(it) {
  if (it.k === 'magic')
    return (
      (it.type || 'Magic item') + (it.r ? ', ' + it.r.toLowerCase() : '') + (it.att ? ' (requires attunement)' : '')
    );
  return it.k === 'gear' ? (it.cat || 'Gear') + (it.cost ? ' · ' + it.cost : '') : 'Custom item';
}
// Own armour and weapons: every keystroke is kept, so tapping Save right after typing never loses it
function applyCustomField(t) {
  var aid = t.getAttribute('data-carmor'),
    wid = t.getAttribute('data-cweapon'),
    k = t.getAttribute('data-f');
  if (aid) {
    var ca = (ch.customArmor || []).filter(function (x) {
      return x.id === aid;
    })[0];
    if (ca) ca[k] = /^(ac|bonus|str|w)$/.test(k) ? +t.value || 0 : t.value;
  }
  if (wid) {
    var cw = (ch.customWeapons || []).filter(function (x) {
      return x.id === wid;
    })[0];
    if (cw)
      cw[k] =
        k === 'prof' ? t.checked : k === 'ranged' ? !!t.value : /^(hit|dmgBonus|w)$/.test(k) ? +t.value || 0 : t.value;
  }
}
// Gear goes into the inventory; the same thing twice just raises the quantity
function addGearItem(name, qty, ownWeight) {
  var x = D.gear.filter(function (i) {
    return i[0] === name;
  })[0];
  var have = ch.items.filter(function (i) {
    return (i.k === 'gear' || i.k === 'custom') && i.n === name;
  })[0];
  if (have) {
    have.qty = (+have.qty || 0) + qty;
    return;
  }
  if (x) ch.items.push({ id: R.uid(), k: 'gear', n: x[0], cat: x[1], cost: x[2], qty: qty, w: x[3], note: '' });
  else
    ch.items.push({
      id: R.uid(),
      k: 'custom',
      n: name,
      qty: qty,
      w: ownWeight || 0,
      att: false,
      attuned: false,
      note: ''
    });
}
// A pack is unpacked into what it holds
function addPack(name) {
  var list = (D.packContents || {})[name];
  if (!list) return;
  list.forEach(function (p) {
    addGearItem(p[0], p[1], p[2]);
  });
  ui.packAdded = {
    name: name,
    list: list.map(function (p) {
      return (p[1] > 1 ? p[1] + ' × ' : '') + p[0];
    })
  };
}
