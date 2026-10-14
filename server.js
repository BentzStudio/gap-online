import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.join(__dirname, 'dist');
const PORT = process.env.PORT || 3000;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8'
};

async function handleArxivProxy(req, res, query) {
  try {
    const rawQ = query.get('q') || '';
    if (!rawQ.trim()) {
      res.writeHead(400, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(JSON.stringify({ ok: false, error: 'Missing query parameter "q"' }));
      return;
    }

    const cleanTokens = rawQ.replace(/["'(),;:]/g, ' ').split(/\s+/).filter(Boolean);
    const effectiveTokens = cleanTokens.slice(0, 2);
    const tokenQuery = effectiveTokens.map(t => 'all:' + encodeURIComponent(t)).join('+AND+');
    const searchParam = tokenQuery ? `cat:math.*+AND+${tokenQuery}` : 'cat:math.*';
    const arxivUrl = `https://export.arxiv.org/api/query?search_query=${searchParam}&start=0&max_results=6&sortBy=relevance&sortOrder=descending`;

    const response = await fetch(arxivUrl, {
      headers: {
        'User-Agent': 'GAPPlayground/1.0 (academic math explorer; mailto:playground@algorithmic-truth.org)'
      }
    });

    if (!response.ok) {
      res.writeHead(response.status, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(JSON.stringify({ ok: false, error: `arXiv HTTP ${response.status}` }));
      return;
    }

    const xml = await response.text();
    const entryMatches = xml.match(/<entry>[\s\S]*?<\/entry>/g) || [];
    const results = [];

    for (const entry of entryMatches) {
      const title = (entry.match(/<title>([\s\S]*?)<\/title>/)?.[1] || 'Untitled').replace(/\s+/g, ' ').trim();
      const id = (entry.match(/<id>([\s\S]*?)<\/id>/)?.[1] || '').trim();
      const published = (entry.match(/<published>([\s\S]*?)<\/published>/)?.[1] || '').trim().slice(0, 10);
      const authors = Array.from(entry.matchAll(/<author>\s*<name>([\s\S]*?)<\/name>/g)).map(m => m[1].trim()).slice(0, 4).join(', ');
      const summary = (entry.match(/<summary>([\s\S]*?)<\/summary>/)?.[1] || '').replace(/\s+/g, ' ').trim().slice(0, 220) + '…';
      results.push({ title, id, published, authors, summary });
    }

    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(JSON.stringify({ ok: true, results }));
  } catch (err) {
    res.writeHead(500, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(JSON.stringify({ ok: false, error: err.message || 'Failed to fetch arXiv feed' }));
  }
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end();
    return;
  }

  // API Route: /api/arxiv
  if (parsedUrl.pathname === '/api/arxiv') {
    await handleArxivProxy(req, res, parsedUrl.searchParams);
    return;
  }

  // Static File Serving
  let filePath = path.join(DIST_DIR, parsedUrl.pathname === '/' ? 'index.html' : parsedUrl.pathname);
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(DIST_DIR, 'index.html');
  }

  if (fs.existsSync(filePath)) {
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
});
