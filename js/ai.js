// The helper: a chat that knows what you are doing in the app (the game, the page, your character with its
// open choices and warnings) and helps you decide. It talks to one of:
//   • your server (node server.js with ANTHROPIC_API_KEY set): friends use it without seeing the key
//   • Claude with your own API key, kept in this browser only
//   • Google Gemini's free tier, with a free key (works on a phone)
//   • Ollama, a free AI running on a computer on your network
(function (root) {
  'use strict';
  var KEY = 'cf-ai', cfg = { mode: 'gemini', key: '', gkey: '', gmodel: '', model: 'claude-sonnet-5-5', ollama: 'http://localhost:11434', omodel: 'llama3.1', code: '' };
  try { cfg = Object.assign(cfg, JSON.parse(root.localStorage.getItem(KEY) || '{}')); } catch (e) { /* storage off */ }
  function saveCfg() { try { root.localStorage.setItem(KEY, JSON.stringify(cfg)); } catch (e) { /* storage off */ } }
  var server = null; // does the server this app came from have a key? (checked once)
  function checkServer() {
    if (server !== null || !root.fetch || location.protocol === 'file:') return Promise.resolve(server = server || false);
    return fetch('api/ai', { method: 'GET' }).then(function (r) { return r.ok ? r.json() : { ok: false }; }).then(function (j) { server = !!(j && j.ok); return server; }, function () { server = false; return false; });
  }
  function mode() {
    if (server && cfg.mode !== 'claude' && cfg.mode !== 'ollama' && !(cfg.mode === 'gemini' && cfg.gkey)) return 'server'; // a key on the server works for everyone
    if (cfg.mode === 'auto') return cfg.gkey ? 'gemini' : cfg.key ? 'claude' : '';
    if (cfg.mode === 'gemini' && !cfg.gkey || cfg.mode === 'claude' && !cfg.key) return ''; // not set up yet
    return cfg.mode;
  }

  var SYSTEM = 'You are the helper inside Character Forge, a table companion app for Dungeons & Dragons 5th edition (2014 rules only) and Mutants & Masterminds 3rd edition. ' +
    'You help the user build characters and run games inside this app. Below is what the user is looking at right now. Use it: refer to their actual character, their open choices and their warnings. ' +
    'Give practical, specific advice: name the exact options they can pick in the app and why. Keep answers short and easy to read on a phone (a few sentences or a short list). ' +
    'Follow the official rules of the game they are playing; if something depends on the GM or you are not sure, say so instead of inventing rules. ' +
    'If the page info ends with “Changes you can propose” and the user asks you to add or change something (or says yes to your suggestion), write each change on its own line in exactly that [[…]] format, using exact names. The app turns each line into an Apply button; nothing changes until the user taps it, so never say you already did it. Only propose changes that follow the rules and fit their points or choices. ' +
    'Without that list, tell them what to tap or pick. Reply in the language the user writes in.';

  function ask(messages, context) {
    var sys = SYSTEM + '\n\n--- What the user is looking at ---\n' + context;
    var m = mode();
    if (m === 'server') return post('api/ai', { system: sys, messages: messages }, cfg.code ? { 'x-ai-code': cfg.code } : {}).then(function (j) { if (j.error) throw new Error(j.error); return j.text; });
    if (m === 'claude') return post('https://api.anthropic.com/v1/messages', { model: cfg.model || 'claude-sonnet-5-5', max_tokens: 1200, system: sys, messages: messages },
      { 'x-api-key': cfg.key, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' })
      .then(function (j) { if (j.error) throw new Error(j.error.message || 'error'); return (j.content || []).map(function (c) { return c.text || ''; }).join(''); });
    // Free models are often busy (503) or out of quota (429): wait a moment and try the next free model.
    if (m === 'gemini') return geminiModels().then(function (list) {
      var i = 0;
      function attempt() {
        var model = list[i];
        return post(GEM + 'models/' + model + ':generateContent', {
          system_instruction: { parts: [{ text: sys }] },
          contents: messages.map(function (x) { return { role: x.role === 'assistant' ? 'model' : 'user', parts: [{ text: x.content }] }; }),
          generationConfig: { maxOutputTokens: 1200 }
        }, { 'x-goog-api-key': cfg.gkey }).then(function (j) { if (cfg.gmodel !== model) { cfg.gmodel = model; saveCfg(); } return j; }, function (e) {
          if (e.status === 404) gList = null;
          if (/^(404|429|500|503)$/.test(e.status) && ++i < list.length) return new Promise(function (ok) { setTimeout(ok, 700); }).then(attempt);
          if (e.status === 429) e.message = 'The free limit is used up for now. Try again in a minute (or tomorrow if the daily limit is reached).';
          else if (e.status === 503) e.message = 'Google’s free AI is very busy right now. Try again in a minute.';
          throw e;
        });
      }
      return attempt();
    }).then(function (j) {
      var c = j.candidates && j.candidates[0]; if (!c) throw new Error((j.promptFeedback && j.promptFeedback.blockReason) || 'no answer');
      return ((c.content && c.content.parts) || []).map(function (p) { return p.text || ''; }).join('');
    });
    if (m === 'ollama') return post(String(cfg.ollama || '').replace(/\/+$/, '') + '/api/chat', { model: cfg.omodel || 'llama3.1', stream: false, messages: [{ role: 'system', content: sys }].concat(messages) }, {})
      .then(function (j) { if (j.error) throw new Error(j.error); return (j.message && j.message.content) || ''; });
    return Promise.reject(new Error('setup'));
  }
  // Gemini: ask Google which models this key may use (names change often). Newest Flash first, then Flash-Lite as backups;
  // the one that answered last time goes first.
  var GEM = 'https://generativelanguage.googleapis.com/v1beta/', gList = null;
  function geminiModels() {
    if (gList) return Promise.resolve(gList);
    return fetch(GEM + 'models?pageSize=200', { headers: { 'x-goog-api-key': cfg.gkey } }).then(function (r) {
      return r.json().then(function (j) { if (!r.ok) { var e = new Error((j.error && j.error.message) || 'HTTP ' + r.status); e.status = r.status; throw e; } return j; });
    }).then(function (j) {
      var ok = (j.models || []).filter(function (x) { return (x.supportedGenerationMethods || []).indexOf('generateContent') >= 0 && /flash/.test(x.name) && !/tts|image|live|audio|embed|thinking|exp/.test(x.name); });
      var ver = function (n) { var v = (n.match(/(\d+(?:\.\d+)?)/) || [0, 0])[1]; return +v - (/preview/.test(n) ? 0.01 : 0) - (/lite/.test(n) ? 100 : 0); };
      ok.sort(function (a, b) { return ver(b.name) - ver(a.name); });
      if (!ok.length) throw new Error('no free Flash model found for this key');
      var names = ok.map(function (x) { return x.name.replace(/^models\//, ''); });
      if (cfg.gmodel && names.indexOf(cfg.gmodel) > 0) names.unshift(names.splice(names.indexOf(cfg.gmodel), 1)[0]);
      return (gList = names.slice(0, 5));
    });
  }
  function post(url, body, headers) {
    return fetch(url, { method: 'POST', headers: Object.assign({ 'content-type': 'application/json' }, headers), body: JSON.stringify(body) }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (j) {
        if (!r.ok) { var msg = (j.error && (j.error.message || j.error)) || ('HTTP ' + r.status); var e = new Error(msg); e.status = r.status; throw e; }
        return j;
      });
    });
  }

  // ---------- the panel ----------
  var forced = false, el, fab, open = false, pushed = false, busy = false, chat = [], view = 'chat', getContext = function () { return { text: '', chips: [] }; };
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function mdHtml(t) { return root.BooksUI && root.BooksUI.md ? root.BooksUI.md(t) : '<p>' + esc(t).replace(/\n/g, '<br>') + '</p>'; }
  function build() {
    if (el) return;
    el = document.createElement('div'); el.className = 'ai-panel noprint'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', 'Helper');
    document.body.appendChild(el);
    el.addEventListener('click', onClick);
    el.addEventListener('keydown', function (e) { if (e.key === 'Enter' && !e.shiftKey && e.target.id === 'ai-in') { e.preventDefault(); send(); } });
  }
  function draw() {
    var ctx = getContext(), m = mode();
    var head = '<div class="ai-head"><b>' + (root.Icon ? root.Icon('sparkle') : '') + ' Helper</b><span class="ai-where small muted">' + esc(ctx.where || '') + '</span><span class="spacer"></span>' +
      '<button type="button" class="btn small" data-ai="view" data-v="' + (view === 'chat' ? 'setup' : 'chat') + '">' + (view === 'chat' ? 'Settings' : 'Back to chat') + '</button><button type="button" class="ai-x" data-ai="close" aria-label="Close the helper">✕</button></div>';
    if (!m) { view = 'setup'; forced = true; } // nothing set up yet: stay on the setup screen until Done…
    else if (forced && m === 'server') { forced = false; view = 'chat'; } // …unless the server turns out to have a key
    if (view === 'setup') { el.innerHTML = head + setupHtml(!m); return; }
    var msgs = chat.length ? chat.map(function (c, mi) { return '<div class="ai-msg ' + c.role + '">' + (c.role === 'user' ? esc(c.content).replace(/\n/g, '<br>') : mdHtml(c.content.replace(CMD, '').replace(/\n{3,}/g, '\n\n').trim() || '…') + applyHtml(c, mi)) + '</div>'; }).join('')
      : '<div class="ai-empty"><p>Ask me anything about ' + esc(ctx.subject || 'the game') + '. I can see what you are working on.</p></div>';
    var chips = (ctx.chips || []).map(function (c) { return '<button type="button" class="pill small" data-ai="chip" data-v="' + esc(c) + '">' + esc(c) + '</button>'; }).join('');
    el.innerHTML = head + '<div class="ai-msgs" aria-live="polite">' + msgs + (busy ? '<div class="ai-msg assistant ai-busy">Thinking…</div>' : '') + '</div>' +
      (chips && !busy ? '<div class="ai-chips">' + chips + '</div>' : '') +
      '<div class="ai-send"><textarea id="ai-in" rows="2" placeholder="Ask about your character or the rules…"' + (busy ? ' disabled' : '') + '></textarea><button type="button" class="btn primary" data-ai="send"' + (busy ? ' disabled' : '') + '>Send</button></div>' +
      '<div class="ai-foot small muted">' + (chat.length ? '<button type="button" class="linkbtn" data-ai="clear">New conversation</button> · ' : '') + 'Uses ' + (m === 'server' ? 'your server' : m === 'claude' ? 'Claude with your key' : m === 'gemini' ? 'Gemini (free)' : 'Ollama') + '. Answers can be wrong: check the rules.</div>';
    var list = el.querySelector('.ai-msgs'); list.scrollTop = list.scrollHeight;
  }
  // Changes the AI proposes come as [[verb: a | b]] lines: shown as Apply buttons, run by the page's apply() only when tapped.
  var CMD = /\[\[\s*([a-z_]+)\s*:([^\]]*)\]\]/gi;
  function cmds(t) { var out = []; String(t).replace(CMD, function (_, v, a) { out.push({ verb: v.toLowerCase(), args: a.split('|').map(function (x) { return x.trim(); }) }); }); return out; }
  function applyHtml(c, mi) {
    var list = cmds(c.content); if (!list.length) return '';
    var done = c.done || {}, left = list.filter(function (_, i) { return !done[i]; }).length;
    return '<div class="ai-apply">' + list.map(function (x, i) {
      var r = done[i], label = x.verb.replace(/_/g, ' ') + ': ' + x.args.filter(Boolean).join(' · ');
      return r ? '<div class="ai-did small' + (r.ok ? '' : ' bad') + '">' + (r.ok ? '✓ ' : '✗ ') + esc(r.t) + '</div>' : '<button type="button" class="btn small" data-ai="apply" data-m="' + mi + '" data-v="' + i + '">Apply — ' + esc(label) + '</button>';
    }).join('') + (left > 1 ? '<button type="button" class="btn small primary" data-ai="apply" data-m="' + mi + '" data-v="all">Apply all ' + left + '</button>' : '') +
      (c.note ? '<div class="small bad">' + esc(c.note) + '</div>' : '') + (list.some(function (_, i) { return done[i] && done[i].ok; }) ? '<div class="small muted">Not right? Undo at the top of the page.</div>' : '') + '</div>';
  }
  function applyCmds(mi, which) {
    var c = chat[mi], list = cmds(c.content), ctx = getContext(); c.done = c.done || {};
    list.forEach(function (x, i) {
      if (c.done[i] || (which !== 'all' && String(i) !== which)) return;
      if (!ctx.apply) { c.note = 'Open the character or hero this is for, then tap Apply again.'; return; } // buttons stay
      try { c.done[i] = { ok: true, t: ctx.apply(x.verb, x.args) || 'Done' }; c.note = ''; } catch (e) { c.done[i] = { ok: false, t: e.message }; }
      ctx = getContext();
    });
    draw();
  }
  function setupHtml(first) {
    var r = function (v, t, d) { return '<label class="check-line"><input type="radio" name="ai-mode" data-aicfg="mode" value="' + v + '"' + (cfg.mode === v ? ' checked' : '') + '> <span><b>' + t + '</b><br><span class="small muted">' + d + '</span></span></label>'; };
    var f = function (k, label, ph, type) { return '<label class="field"><span>' + label + '</span><input type="' + (type || 'text') + '" data-aicfg="' + k + '" value="' + esc(cfg[k] || '') + '" placeholder="' + esc(ph) + '" autocomplete="off"></label>'; };
    return '<div class="ai-setup">' + (first ? '<p>The helper needs an AI to talk to. The free Google Gemini option takes 2 minutes:</p>' : '') +
      r('gemini', 'Google Gemini (free) — recommended', '1. Open <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener">aistudio.google.com/apikey</a> and sign in with Google.<br>2. Tap “Create API key” and copy it.<br>3. Paste it below and tap Done. Works on your phone, no card needed. The free tier has daily limits, and Google may use free-tier questions to improve its products.') +
      '<details class="ai-more"' + (/^(gemini)$/.test(cfg.mode) || (cfg.mode === 'auto' && !server) ? '' : ' open') + '><summary class="small">Other options</summary>' +
      r('auto', 'Automatic', server ? 'Your server has a key: using it.' : 'Uses your server if it has a key, otherwise the Gemini key below.') +
      r('server', 'Your server', 'One key for everyone: the computer that runs <code>node server.js</code> holds a free <code>GEMINI_API_KEY</code> (or a Claude <code>ANTHROPIC_API_KEY</code>). Friends use the helper without a key of their own.' + (server === false ? ' <b>Not found on this server right now.</b>' : '')) +
      r('claude', 'My own Claude key', 'An API key from console.anthropic.com, kept only in this browser. Pay-as-you-go, billed separately from a Claude subscription.') +
      r('ollama', 'Ollama on my network', 'A free AI on your own computer. Start it with <code>OLLAMA_ORIGINS=*</code> so the app may talk to it.') + '</details>' +
      (cfg.mode === 'gemini' || cfg.mode === 'auto' ? f('gkey', 'Gemini API key', 'AIza…', 'password') + (cfg.gmodel ? '<p class="small muted">Model: ' + esc(cfg.gmodel) + '</p>' : '') : '') +
      (cfg.mode === 'claude' ? f('key', 'Claude API key', 'sk-ant-…', 'password') + f('model', 'Model', 'claude-sonnet-5-5') : '') +
      (cfg.mode === 'server' || cfg.mode === 'auto' ? f('code', 'Access code (if your server asks for one)', 'optional', 'password') : '') +
      (cfg.mode === 'ollama' ? f('ollama', 'Ollama address', 'http://192.168.1.20:11434') + f('omodel', 'Model', 'llama3.1') : '') +
      '<div class="toolbar"><button type="button" class="btn primary" data-ai="view" data-v="chat">Done</button></div>' +
      '<p class="small muted">What you ask, plus a summary of the page you are on (your character’s name, choices and stats), is sent to the AI you pick. Nothing else leaves your device.</p></div>';
  }
  function send(text) {
    var box = el.querySelector('#ai-in'); text = String(text || (box && box.value) || '').trim(); if (!text || busy) return;
    chat.push({ role: 'user', content: text }); busy = true; draw();
    ask(chat.slice(-12), getContext().text).then(function (reply) { chat.push({ role: 'assistant', content: reply || '(no answer)' }); },
      function (e) {
        var why = e.message === 'setup' ? 'Set up the helper first (Settings).' : e.status === 401 || e.status === 400 && /key/i.test(e.message) ? 'The key was refused. Check it in Settings.' : e.status === 429 ? 'The free limit is used up for now. Try again in a minute (or tomorrow if it’s the daily limit).' : e.status === 403 ? 'Your server refused: check the access code in Settings.' :
          /Failed to fetch|NetworkError|Load failed/.test(e.message) ? 'Couldn’t reach the AI. Check your connection' + (mode() === 'ollama' ? ', that Ollama is running and started with OLLAMA_ORIGINS=*' : '') + '.' : 'The AI answered with an error: ' + e.message;
        chat.push({ role: 'assistant', content: '⚠ ' + why, err: true });
      }).then(function () { chat = chat.filter(function (c, i) { return !c.err || i === chat.length - 1; }); busy = false; if (open) draw(); });
  }
  function onClick(e) {
    var b = e.target.closest('[data-ai]'); if (!b) return;
    var a = b.getAttribute('data-ai'), v = b.getAttribute('data-v');
    if (a === 'close') return close();
    if (a === 'view') { readCfg(); view = v; forced = false; return draw(); }
    if (a === 'send') return send();
    if (a === 'chip') return send(v);
    if (a === 'clear') { chat = []; return draw(); }
    if (a === 'apply') return applyCmds(+b.getAttribute('data-m'), v);
  }
  function readCfg() {
    el.querySelectorAll('[data-aicfg]').forEach(function (i) { var k = i.getAttribute('data-aicfg'); if (i.type === 'radio') { if (i.checked) cfg[k] = i.value; } else cfg[k] = i.value.trim(); });
    if (cfg.gkey !== lastG) { cfg.gmodel = ''; gList = null; lastG = cfg.gkey; }
    saveCfg();
  }
  var lastG = cfg.gkey;
  function openPanel() {
    build(); if (open) return; open = true; el.classList.add('on'); checkServer().then(function () { if (open) draw(); }); draw();
    try { root.history.pushState({ ai: 1 }, ''); pushed = true; } catch (e) { pushed = false; }
    setTimeout(function () { var i = el.querySelector('#ai-in'); if (i && root.innerWidth > 800) i.focus(); }, 50);
  }
  function close(fromBack) {
    if (!open) return; if (view === 'setup') readCfg(); open = false; el.classList.remove('on');
    if (pushed && !fromBack) { pushed = false; try { root.history.back(); } catch (e) { /* ignore */ } } pushed = false;
  }
  if (root.addEventListener) {
    root.addEventListener('popstate', function () { if (open) close(true); });
    root.addEventListener('keydown', function (e) { if (open && e.key === 'Escape') close(); });
    root.addEventListener('change', function (e) { if (open && e.target.getAttribute && e.target.getAttribute('data-aicfg') === 'mode') { readCfg(); draw(); } });
  }
  // The round helper button sits just above the dice button.
  function place() {
    if (!fab) { fab = document.createElement('button'); fab.type = 'button'; fab.className = 'ai-fab noprint'; fab.title = 'Helper'; fab.setAttribute('aria-label', 'Open the helper'); fab.innerHTML = root.Icon ? root.Icon('sparkle') : '?'; fab.addEventListener('click', openPanel); document.body.appendChild(fab); }
    var dice = document.querySelector('.dice3d-fab.out'); fab.style.bottom = ((dice ? parseFloat(dice.style.bottom) || 14 : 14) + 64) + 'px';
    if (open && !busy) { var a = document.activeElement; if (!a || !el.contains(a)) draw(); } // the page changed behind it
  }
  root.AIHelper = { open: openPanel, close: close, place: place, setContext: function (f) { getContext = f; }, _ask: ask, _cfg: cfg };
})(typeof window !== 'undefined' ? window : globalThis);
