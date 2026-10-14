export async function onRequestGet(context) {
  try {
    const url = new URL(context.request.url);
    const rawQ = url.searchParams.get('q') || '';
    if (!rawQ.trim()) {
      return new Response(JSON.stringify({ ok: false, error: 'Missing query parameter "q"' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
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
      return new Response(JSON.stringify({ ok: false, error: `arXiv HTTP ${response.status}` }), {
        status: response.status,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
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

    return new Response(JSON.stringify({ ok: true, results }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: err.message || 'Failed to fetch arXiv feed' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}
