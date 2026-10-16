// Optional tiny static server (no dependencies). Usage: node server.js [port]
// The app also works by opening index.html directly, or from any static host.
//
// The helper (AI): set ANTHROPIC_API_KEY to let everyone who uses this server ask the helper without seeing the key.
//   ANTHROPIC_API_KEY=sk-ant-… node server.js
// Optional: AI_MODEL (default claude-sonnet-5-5), AI_CODE (an access code friends type into the helper's settings,
// so strangers who find your server can't spend your key).
const http = require('http'), fs = require('fs'), path = require('path');
const root = __dirname, port = +process.argv[2] || +process.env.PORT || 8080;
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.md': 'text/plain; charset=utf-8', '.png': 'image/png', '.webmanifest': 'application/manifest+json', '.mp3': 'audio/mpeg', '.pdf': 'application/pdf' };
const KEY = process.env.ANTHROPIC_API_KEY || '', MODEL = process.env.AI_MODEL || 'claude-sonnet-5-5', CODE = process.env.AI_CODE || '';

function json(res, code, obj) { res.writeHead(code, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(obj)); }
function helper(req, res) {
  if (req.method === 'GET') return json(res, 200, { ok: !!KEY });
  if (req.method !== 'POST') return json(res, 405, { error: 'Use POST' });
  if (!KEY) return json(res, 503, { error: 'This server has no ANTHROPIC_API_KEY set.' });
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
    fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: MODEL, max_tokens: 1200, system: String(q.system || '').slice(0, 40000), messages })
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
  const file = path.join(root, path.normalize(rel === '/' ? '/index.html' : rel));
  if (file !== root && !file.startsWith(root + path.sep)) { res.writeHead(403); return res.end('Forbidden'); }
  fs.readFile(file, (err, buf) => {
    if (err) { res.writeHead(404); return res.end('Not found'); }
    res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' });
    res.end(buf);
  });
}).listen(port, () => console.log('Character Forge running at http://localhost:' + port + (KEY ? ' (helper on' + (CODE ? ', with access code' : '') + ')' : '')));
