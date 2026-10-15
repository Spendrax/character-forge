// Monster sounds: every monster gets its own sound, picked from a group that fits it
// (dragons roar, oozes squelch, undead moan…). The same monster always makes the same sound.
(function (root) {
  'use strict';
  // By name first: [pattern, groups]
  var BY_NAME = [
    [/dragon|wyvern|drake|wyrm|tarrasque|behir|hydra|roc\b|t-rex|tyrannosaurus/i, ['roar']],
    [/wolf|worg|dog|hound|jackal|hyena|mastiff|coyote/i, ['barking', 'howl']],
    [/troll|ogre|ettin|giant|cyclops|oni/i, ['troll', 'grunt']],
    [/ooze|jelly|pudding|cube|slime/i, ['slime']],
    [/spider|scorpion|centipede|insect|beetle|wasp|bee\b|ankheg|ettercap|carrion crawler|tick|mosquito/i, ['bug']],
    [/ghost|specter|spectre|wraith|banshee|shadow|will-o/i, ['weird', 'scream']],
    [/zombie|ghoul|ghast|mummy|wight|skeleton|lich|vampire/i, ['monster', 'breath']],
    [/golem|animated|helmed horror|shield guardian/i, ['stomp', 'grunt']],
    [/goblin|hobgoblin|bugbear|kobold|orc|gnoll|lizardfolk|troglodyte/i, ['grunt', 'attack']],
    [/bear|lion|tiger|panther|owlbear|\bape|boar|crocodile|shark/i, ['roar', 'grunt']],
    [/beholder|aboleth|mind flayer|otyugh|gibbering|chuul|cloaker|grell|nothic/i, ['alien', 'weird']]
  ];
  // Then by creature type
  var BY_TYPE = { aberration: ['alien', 'weird'], beast: ['grunt', 'roar'], celestial: ['breath', 'weird'], construct: ['stomp', 'grunt'], dragon: ['roar'],
    elemental: ['breath', 'burble', 'weird'], fey: ['weird'], fiend: ['monster', 'roar'], giant: ['troll', 'grunt'], humanoid: ['human', 'attack'],
    monstrosity: ['monster', 'roar'], ooze: ['slime'], plant: ['burble', 'slime'], undead: ['monster', 'breath'], swarm: ['bug'] };

  function hash(s) { var h = 0; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return Math.abs(h); }
  function groupsFor(m) {
    var n = String(m.n || ''), t = String(m.type || '').toLowerCase().split(/[ (]/)[0];
    for (var i = 0; i < BY_NAME.length; i++) if (BY_NAME[i][0].test(n)) return BY_NAME[i][1];
    if (/^swarm/.test(String(m.type || '').toLowerCase())) return BY_TYPE.swarm;
    return BY_TYPE[t] || ['monster'];
  }
  // The file name (without .mp3) this monster uses.
  function soundFor(m) {
    var S = (root.DND && root.DND.creatureSounds) || {}, pool = [];
    groupsFor(m).forEach(function (g) { pool = pool.concat(S[g] || []); });
    if (!pool.length) pool = S.monster || [];
    return pool.length ? pool[hash(String(m.n || '').toLowerCase()) % pool.length] : '';
  }
  var current = null;
  function play(file) {
    if (!file || !root.Audio) return;
    try { if (current) current.pause(); current = new root.Audio('sounds/' + file + '.mp3'); current.volume = 0.9; var p = current.play(); if (p && p.catch) p.catch(function () { /* blocked or missing */ }); } catch (e) { /* no audio */ }
  }
  root.Sounds = { soundFor: soundFor, groupsFor: groupsFor, play: play,
    // A small speaker button; clicking it is handled by the app's 'monSound' action.
    button: function (m, cls) { var f = soundFor(m); return f ? '<button type="button" class="btn small ' + (cls || '') + '" data-act="monSound" data-v="' + f + '" title="Play its sound" aria-label="Play the ' + String(m.n || 'monster').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;') + '’s sound">' + (root.Icon ? root.Icon('speaker') : '♪') + '</button>' : ''; }
  };
})(typeof window !== 'undefined' ? window : globalThis);
