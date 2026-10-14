import { defineConfig } from 'vite';

function arxivProxyPlugin() {
  const handler = async (req, res) => {
    try {
      const reqUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
      const rawQ = reqUrl.searchParams.get('q') || '';
      if (!rawQ.trim()) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.end(JSON.stringify({ ok: false, error: 'Missing query parameter "q"' }));
        return;
      }

      // Build search tokens for arXiv API
      const cleanTokens = rawQ.replace(/["'(),;:]/g, ' ').split(/\s+/).filter(Boolean);
      const searchParam = cleanTokens.slice(0, 3).map(t => 'all:' + encodeURIComponent(t)).join('+AND+');
      const arxivUrl = `https://export.arxiv.org/api/query?search_query=${searchParam}&start=0&max_results=6&sortBy=relevance&sortOrder=descending`;

      const response = await fetch(arxivUrl, {
        headers: {
          'User-Agent': 'GAPPlayground/1.0 (academic math explorer; mailto:playground@algorithmic-truth.org)'
        }
      });

      if (!response.ok) {
        res.statusCode = response.status;
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
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

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.end(JSON.stringify({ ok: true, results }));
    } catch (err) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.end(JSON.stringify({ ok: false, error: err.message || 'Failed to fetch arXiv feed' }));
    }
  };

  return {
    name: 'arxiv-proxy-plugin',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url?.startsWith('/api/arxiv')) {
          handler(req, res);
        } else {
          next();
        }
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url?.startsWith('/api/arxiv')) {
          handler(req, res);
        } else {
          next();
        }
      });
    }
  };
}

export default defineConfig({
  plugins: [arxivProxyPlugin()],
  server: {
    port: 3000,
    host: '0.0.0.0'
  },
  preview: {
    port: 3000,
    host: '0.0.0.0'
  }
});