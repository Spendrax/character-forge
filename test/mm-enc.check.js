// Every generated villain and minion must stay within its power level limits.
global.window = global; require('../data/mm.js'); require('../js/mm.js');
['build', 'party', 'run', 'pages', 'actions'].forEach(function (p) { require('../js/mm-enc-' + p + '.js'); }); require('../js/mm-enc.js');
var E = window.MMEnc({ esc: String, btn: function () { return ''; }, store: {}, ui: {} }), bad = 0, n = 0;
for (var pl = 1; pl <= 20; pl++) for (var k = 0; k < 15; k++) {
  Object.keys(window.MMEnc.ROLES).forEach(function (r) { check(E._build(pl, r)); });
  Object.keys(window.MMEnc.MINIONS).forEach(function (m) { check(E._build(pl, m, m)); });
}
function check(h) { n++; var w = window.MMRules.derive(h).warnings.filter(function (x) { return !/power points|complications/.test(x); }); if (w.length) { bad++; if (bad < 8) console.log(h.role, 'PL', h.pl, w); } }
if (bad) throw new Error(bad + ' of ' + n + ' generated M&M foes break a power level limit');
module.exports = n;
