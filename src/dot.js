/* Detect Graphviz DOT in program output and draw it with Viz.js (loaded lazily). */

const VIZ_URL = "https://cdn.jsdelivr.net/npm/@viz-js/viz@3.2.4/lib/viz-standalone.js";
let vizPromise = null;

function loadViz() {
  if (vizPromise) return vizPromise;
  vizPromise = new Promise((resolve, reject) => {
    if (window.Viz) return resolve(window.Viz.instance());
    const s = document.createElement("script");
    s.src = VIZ_URL;
    s.onload = () => window.Viz ? resolve(window.Viz.instance()) : reject(new Error("Viz.js did not initialise"));
    s.onerror = () => { vizPromise = null; reject(new Error("Could not load the Graphviz renderer")); };
    document.head.appendChild(s);
  });
  return vizPromise;
}

/** Find balanced `digraph ... { }` / `graph ... { }` blocks. */
export function extractDot(text) {
  const blocks = [];
  const re = /(?:^|[\s;])((?:strict\s+)?(?:di)?graph\b[^{};]*\{)/g;
  let m;
  while ((m = re.exec(text))) {
    const start = m.index + m[0].length - m[1].length;
    let depth = 0, inStr = false, end = -1;
    for (let i = start + m[1].length - 1; i < text.length; i++) {
      const c = text[i];
      if (inStr) { if (c === "\\") i++; else if (c === '"') inStr = false; continue; }
      if (c === '"') inStr = true;
      else if (c === "{") depth++;
      else if (c === "}" && --depth === 0) { end = i + 1; break; }
    }
    if (end > 0) { blocks.push(text.slice(start, end)); re.lastIndex = end; }
  }
  return blocks;
}

function sanitizeSvg(svg) {
  svg.querySelectorAll("script, foreignObject").forEach(n => n.remove());
  svg.querySelectorAll("*").forEach(el => {
    for (const a of [...el.attributes]) {
      if (/^on/i.test(a.name) || (/href$/i.test(a.name) && /^\s*javascript:/i.test(a.value))) el.removeAttribute(a.name);
    }
  });
  return svg;
}

/** Render every DOT block found in `text` into `container`. */
export async function renderDotBlocks(text, container) {
  const blocks = extractDot(text);
  if (!blocks.length) return 0;
  const wrap = document.createElement("div");
  wrap.className = "dot-card";
  wrap.innerHTML = `<div class="extras-head">Graph diagrams (${blocks.length})</div><div class="dot-status">Loading Graphviz…</div>`;
  container.appendChild(wrap);
  try {
    const viz = await loadViz();
    wrap.querySelector(".dot-status").remove();
    blocks.slice(0, 6).forEach((dot, i) => {
      const fig = document.createElement("figure");
      fig.className = "dot-fig";
      try {
        const svg = sanitizeSvg(viz.renderSVGElement(dot));
        svg.removeAttribute("width"); svg.removeAttribute("height");
        svg.style.maxWidth = "100%";
        fig.appendChild(svg);
        const dl = document.createElement("button");
        dl.type = "button"; dl.className = "mini-btn"; dl.textContent = "Download SVG";
        dl.onclick = () => {
          const blob = new Blob([new XMLSerializer().serializeToString(svg)], { type: "image/svg+xml" });
          const a = document.createElement("a");
          a.href = URL.createObjectURL(blob); a.download = `graph-${i + 1}.svg`; a.click();
          setTimeout(() => URL.revokeObjectURL(a.href), 1000);
        };
        fig.appendChild(dl);
      } catch (e) {
        fig.innerHTML = `<div class="dot-status">Graphviz could not draw graph ${i + 1}: ${String(e.message || e).replace(/[<&]/g, "")}</div>`;
      }
      wrap.appendChild(fig);
    });
    if (blocks.length > 6) wrap.insertAdjacentHTML("beforeend", `<div class="dot-status">Showing the first 6 of ${blocks.length} graphs.</div>`);
  } catch (e) {
    wrap.querySelector(".dot-status").textContent = e.message;
  }
  return blocks.length;
}
