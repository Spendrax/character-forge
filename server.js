// Optional tiny static server (no dependencies). Usage: node server.js [port]
// The app also works by opening index.html directly, or from any static host.
//
// The helper (AI): give this server ONE key and everyone who uses it gets the helper, without seeing the key.
//   GEMINI_API_KEY=AIza… node server.js        (free key from aistudio.google.com/apikey)
//   ANTHROPIC_API_KEY=sk-ant-… node server.js  (Claude, paid per use)
// Optional: AI_MODEL (Claude default claude-sonnet-5-5; Gemini: the newest free Flash model), AI_CODE (an access code friends type into the helper's settings,
// so strangers who find your server can't spend your key).
const http = require('http'), fs = require('fs'), path = require('path');
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

function json(res, code, obj) { res.writeHead(code, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(obj)); }
function helper(req, res) {
  if (req.method === 'GET') return json(res, 200, { ok: !!(KEY || GKEY), ai: KEY ? 'claude' : GKEY ? 'gemini' : '' });
  if (req.method !== 'POST') return json(res, 405, { error: 'Use POST' });
  if (!KEY && !GKEY) return json(res, 503, { error: 'This server has no GEMINI_API_KEY or ANTHROPIC_API_KEY set.' });
  if (CODE && req.headers['x-ai-code'] !== CODE) return json(res, 403, { error: 'Wrong access code.' });
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

http.createServer((req, res) => {
  let rel;
  try { rel = decodeURIComponent(req.url.split('?')[0]); } catch (e) { res.writeHead(400); return res.end('Bad request'); }
  if (rel === '/api/ai') return helper(req, res);
  // D&D Beyond: fetch a public character's data for the importer (the browser can't read it directly)
  var ddb = rel.match(/^\/api\/ddb\/(\d{1,12})$/);
  if (ddb) return fetch('https://character-service.dndbeyond.com/character/v5/character/' + ddb[1], { headers: { 'User-Agent': 'CharacterForge' } })
    .then(function (r) { return r.text().then(function (t) { res.writeHead(r.status, { 'Content-Type': 'application/json' }); res.end(t); }); })
    .catch(function () { json(res, 502, { error: 'Could not reach D&D Beyond.' }); });
  const file = path.join(root, path.normalize(rel === '/' ? '/index.html' : rel));
  if (file !== root && !file.startsWith(root + path.sep)) { res.writeHead(403); return res.end('Forbidden'); }
  fs.readFile(file, (err, buf) => {
    if (err) { res.writeHead(404); return res.end('Not found'); }
    res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' });
    res.end(buf);
  });
}).listen(port, () => console.log('Character Forge running at http://localhost:' + port + (KEY || GKEY ? ' (helper on, ' + (KEY ? 'Claude' : 'Gemini') + (CODE ? ', with access code' : '') + ')' : '')));
