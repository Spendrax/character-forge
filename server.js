// Optional tiny static server (no dependencies). Usage: node server.js [port]
// The app also works by opening index.html directly, or from any static host.
//
// The helper (AI): give this server ONE key and everyone who uses it gets the helper, without seeing the key.
//   GEMINI_API_KEY=AIza… node server.js        (free key from aistudio.google.com/apikey)
//   ANTHROPIC_API_KEY=sk-ant-… node server.js  (Claude, paid per use)
// Optional: AI_MODEL (Claude default claude-sonnet-5-5; Gemini: the newest free Flash model), AI_CODE (an access code friends type into the helper's settings,
// so strangers who find your server can't spend your key).
const http = require('http'), fs = require('fs'), path = require('path'), crypto = require('crypto'), os = require('os');
const root = __dirname, port = +process.argv[2] || +process.env.PORT || 8080;
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.md': 'text/plain; charset=utf-8', '.png': 'image/png', '.webmanifest': 'application/manifest+json', '.mp3': 'audio/mpeg', '.pdf': 'application/pdf' };
const KEY = process.env.ANTHROPIC_API_KEY || '', GKEY = process.env.GEMINI_API_KEY || '', CODE = process.env.AI_CODE || '';
const MODEL = process.env.AI_MODEL || (KEY ? 'claude-sonnet-5-5' : '');
const GEM = 'https://generativelanguage.googleapis.com/v1beta/';
let gModel = GKEY && !KEY ? MODEL : '';
// Gemini model names change often: ask Google for the newest plain Flash model this key may use.
function geminiModel() {
  if (gModel) return Promise.resolve(gModel);
  return fetch(GEM + 'models?pageSize=200', { headers: { 'x-goog-api-key': GKEY } }).then(r => r.json()).then(j => {
    const ok = (j.models || []).filter(x => (x.supportedGenerationMethods || []).includes('generateContent') && /flash/.test(x.name) && !/lite|tts|image|live|audio|embed|thinking|exp/.test(x.name));
    const ver = n => +((n.match(/(\d+(?:\.\d+)?)/) || [0, 0])[1]) - (/preview/.test(n) ? 0.01 : 0);
    ok.sort((a, b) => ver(b.name) - ver(a.name));
    if (!ok.length) throw new Error((j.error && j.error.message) || 'no free Flash model for this key');
    return (gModel = ok[0].name.replace(/^models\//, ''));
  });
}

// A few requests a minute per address for the parts that cost something (the AI key, D&D Beyond)
const hits = new Map();
function limited(req, kind, max) {
  const k = kind + (req.socket.remoteAddress || ''), now = Date.now(), list = (hits.get(k) || []).filter(t => now - t < 60000);
  list.push(now); hits.set(k, list);
  if (hits.size > 5000) hits.clear();
  return list.length > max;
}
function sameCode(a) { const x = Buffer.from(String(a || '')), y = Buffer.from(CODE); return x.length === y.length && crypto.timingSafeEqual(x, y); }
// Headers for every answer: no sniffing file types, no framing by other sites, no referrer leaks
const SAFE = { 'X-Content-Type-Options': 'nosniff', 'X-Frame-Options': 'DENY', 'Referrer-Policy': 'no-referrer', 'Cross-Origin-Opener-Policy': 'same-origin' };
function json(res, code, obj) { res.writeHead(code, Object.assign({ 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }, SAFE)); res.end(JSON.stringify(obj)); }
function helper(req, res) {
  if (req.method === 'GET') return json(res, 200, { ok: !!(KEY || GKEY), ai: KEY ? 'claude' : GKEY ? 'gemini' : '' });
  if (req.method !== 'POST') return json(res, 405, { error: 'Use POST' });
  if (!KEY && !GKEY) return json(res, 503, { error: 'This server has no GEMINI_API_KEY or ANTHROPIC_API_KEY set.' });
  if (CODE && !sameCode(req.headers['x-ai-code'])) return json(res, 403, { error: 'Wrong access code.' });
  if (limited(req, 'ai', 20)) return json(res, 429, { error: 'Too many questions in a minute; wait a little.' });
  let body = '';
  req.on('data', c => { body += c; if (body.length > 300000) req.destroy(); });
  req.on('end', () => {
    let q; try { q = JSON.parse(body); } catch (e) { return json(res, 400, { error: 'Bad request' }); }
    // only pass on what the helper needs: a system text and a short list of user/assistant messages
    const messages = (Array.isArray(q.messages) ? q.messages : []).slice(-12)
      .filter(m => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
      .map(m => ({ role: m.role, content: m.content.slice(0, 8000) }));
    if (!messages.length || messages[messages.length - 1].role !== 'user') return json(res, 400, { error: 'Nothing to answer.' });
    const system = String(q.system || '').slice(0, 40000);
    if (!KEY) return geminiModel().then(model => fetch(GEM + 'models/' + model + ':generateContent', {
      method: 'POST', headers: { 'content-type': 'application/json', 'x-goog-api-key': GKEY },
      body: JSON.stringify({ system_instruction: { parts: [{ text: system }] }, contents: messages.map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] })), generationConfig: { maxOutputTokens: 1200 } })
    })).then(r => r.json().then(j => {
      if (r.status === 404) gModel = '';
      if (!r.ok) return json(res, r.status === 429 ? 429 : 502, { error: r.status === 429 ? 'The free limit is used up for now.' : (j.error && j.error.message) || ('HTTP ' + r.status) });
      const c = j.candidates && j.candidates[0];
      json(res, 200, { text: c && c.content ? (c.content.parts || []).map(p => p.text || '').join('') : '' });
    })).catch(e => json(res, 502, { error: 'Could not reach the AI: ' + e.message }));
    fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: MODEL, max_tokens: 1200, system, messages })
    }).then(r => r.json().then(j => {
      if (!r.ok) return json(res, 502, { error: (j.error && j.error.message) || ('HTTP ' + r.status) });
      json(res, 200, { text: (j.content || []).map(c => c.text || '').join('') });
    })).catch(e => json(res, 502, { error: 'Could not reach the AI: ' + e.message }));
  });
}

// ---------- the table: players' phones send their initiative to the DM (same Wi-Fi, kept in memory only) ----------
const tables = new Map();
function lan() { const out = []; Object.values(os.networkInterfaces()).forEach(l => (l || []).forEach(a => { if (a.family === 'IPv4' && !a.internal) out.push('http://' + a.address + ':' + port + '/'); })); return out; }
function readBody(req, max) { return new Promise((ok, no) => { let b = ''; req.on('data', c => { b += c; if (b.length > max) { no(new Error('too big')); req.destroy(); } }); req.on('end', () => { try { ok(b ? JSON.parse(b) : {}); } catch (e) { no(e); } }); }); }
function pub(t) { return { code: t.code, v: t.v, open: t.open, round: t.round, turn: t.turn, players: t.players.map(p => ({ id: p.id, name: p.name, init: p.init, bonus: p.bonus })) }; }
function sweep() { const now = Date.now(); for (const [k, t] of tables) if (now - t.at > 12 * 3600e3) tables.delete(k); }
function tableApi(req, res, rel) {
  if (limited(req, 'table', 240)) return json(res, 429, { error: 'Too many requests.' });
  const m = rel.match(/^\/api\/table(?:\/(\d{4})(?:\/(join|roll|dm))?)?$/);
  if (!m) return json(res, 404, { error: 'Not found' });
  const code = m[1], what = m[2], t = code && tables.get(code);
  if (!code && req.method === 'GET') return json(res, 200, { ok: true, lan: lan() });
  if (!code && req.method === 'POST') {
    sweep(); if (tables.size > 300) return json(res, 503, { error: 'Too many tables open.' });
    let c; do { c = String(crypto.randomInt(1000, 10000)); } while (tables.has(c));
    const key = crypto.randomBytes(16).toString('hex');
    tables.set(c, { code: c, key, v: 1, open: false, round: 0, turn: '', players: [], at: Date.now() });
    return json(res, 200, { code: c, key, lan: lan() });
  }
  if (!t) return json(res, 404, { error: 'No table with that code. Check the number with your DM.' });
  t.at = Date.now();
  if (!what && req.method === 'GET') return json(res, 200, pub(t));
  if (req.method !== 'POST') return json(res, 405, { error: 'Use POST' });
  readBody(req, 4000).then(q => {
    const str = (x, n) => String(x == null ? '' : x).slice(0, n), num = (x, lo, hi) => Math.max(lo, Math.min(hi, Math.round(+x) || 0));
    if (what === 'join') {
      if (t.players.length >= 16) return json(res, 403, { error: 'The table is full.' });
      const p = { id: crypto.randomBytes(4).toString('hex'), token: crypto.randomBytes(12).toString('hex'), name: str(q.name, 40) || 'Player', bonus: num(q.bonus, -10, 30), init: null };
      t.players.push(p); t.v++;
      return json(res, 200, { id: p.id, token: p.token, state: pub(t) });
    }
    if (what === 'roll') {
      const p = t.players.find(x => x.id === q.id && x.token === q.token); if (!p) return json(res, 403, { error: 'Join the table again.' });
      p.init = q.init == null ? null : num(q.init, -20, 60); t.v++;
      return json(res, 200, pub(t));
    }
    if (what === 'dm') {
      if (!q.key || q.key.length !== t.key.length || !crypto.timingSafeEqual(Buffer.from(q.key), Buffer.from(t.key))) return json(res, 403, { error: 'Not the DM.' });
      if ('open' in q) { t.open = !!q.open; if (t.open && q.reset) t.players.forEach(p => { p.init = null; }); }
      if ('round' in q) t.round = num(q.round, 0, 999);
      if ('turn' in q) t.turn = str(q.turn, 60);
      if (q.kick) t.players = t.players.filter(p => p.id !== q.kick);
      if (q.close) { tables.delete(t.code); return json(res, 200, { ok: true }); }
      t.v++; return json(res, 200, pub(t));
    }
    json(res, 404, { error: 'Not found' });
  }, () => json(res, 400, { error: 'Bad request' }));
}

http.createServer((req, res) => {
  let rel;
  try { rel = decodeURIComponent(req.url.split('?')[0]); } catch (e) { res.writeHead(400); return res.end('Bad request'); }
  if (rel === '/api/ai') return helper(req, res);
  if (/^\/api\/table/.test(rel)) return tableApi(req, res, rel);
  // D&D Beyond: fetch a public character's data for the importer (the browser can't read it directly)
  var ddb = rel.match(/^\/api\/ddb\/(\d{1,12})$/);
  if (ddb && limited(req, 'ddb', 10)) return json(res, 429, { error: 'Too many requests; wait a minute.' });
  if (ddb) return fetch('https://character-service.dndbeyond.com/character/v5/character/' + ddb[1], { headers: { 'User-Agent': 'CharacterForge' } })
    .then(function (r) { return r.text().then(function (t) { res.writeHead(r.status, Object.assign({ 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }, SAFE)); res.end(t.slice(0, 5000000)); }); })
    .catch(function () { json(res, 502, { error: 'Could not reach D&D Beyond.' }); });
  if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405, SAFE); return res.end('Method not allowed'); }
  const file = path.join(root, path.normalize(rel === '/' ? '/index.html' : rel));
  // only the app's own files: nothing outside this folder, no hidden files (.git, .env…), not the server, tests or tools
  const inside = path.relative(root, file).split(path.sep);
  if (file !== root && !file.startsWith(root + path.sep) || inside.some(p => p.startsWith('.')) || /^(server\.js|test|tools|node_modules|package(-lock)?\.json)$/.test(inside[0])) { res.writeHead(404, SAFE); return res.end('Not found'); }
  fs.readFile(file, (err, buf) => {
    if (err) { res.writeHead(404, SAFE); return res.end('Not found'); }
    res.writeHead(200, Object.assign({ 'Content-Type': types[path.extname(file)] || 'application/octet-stream' }, SAFE));
    res.end(buf);
  });
}).listen(port, () => { console.log('Character Forge running at http://localhost:' + port + (KEY || GKEY ? ' (helper on, ' + (KEY ? 'Claude' : 'Gemini') + (CODE ? ', with access code' : '') + ')' : '')); const l = lan(); if (l.length) console.log('Players on the same Wi-Fi open: ' + l.join('  or  ')); });
