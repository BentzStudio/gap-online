import { $, escapeHtml, safeUrl, closeModal, openModal, parseArxivAtom, arxivQueryUrl, copyText } from "./util.js";
import { toBibtex } from "./bibtex.js";
import { detectMathematicalConcepts, PRESETS_BY_TOOL } from "./concepts.js";

let detected = [];
let category = "math.GR";
let shownItems = [];

const searchLinks = q => `
  <div class="link-row">
    <a class="preset-btn" href="https://arxiv.org/search/math?query=${q}&searchtype=all" target="_blank" rel="noopener">arXiv ↗</a>
    <a class="preset-btn" href="https://zbmath.org/?q=${q}" target="_blank" rel="noopener">zbMATH Open ↗</a>
    <a class="preset-btn" href="https://scholar.google.com/scholar?q=${q}" target="_blank" rel="noopener">Google Scholar ↗</a>
  </div>`;

export function initScour({ getTool, getCode }) {
  const query = () => $("scourQuery");

  function chip(label, term, cat, extraClass = "") {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "scour-chip " + extraClass;
    btn.classList.toggle("is-selected", query().value.trim().toLowerCase() === term.toLowerCase());
    btn.textContent = label;
    btn.title = `Search for "${term}"`;
    btn.onclick = () => setTerm(term, cat);
    return btn;
  }

  function renderChips() {
    const box = $("scourChips");
    box.replaceChildren();
    if (!detected.length) {
      box.innerHTML = '<span class="scour-empty">No explicit mathematical concepts detected. Pick from presets below or add a term.</span>';
      return;
    }
    detected.forEach(c => box.appendChild(chip(c.term, c.term, c.category)));
  }

  function renderPresets() {
    const tool = getTool();
    const grid = $("topicPresetsGrid");
    grid.replaceChildren();
    $("topicPresetsLabel").textContent = `Curated Topics for ${tool.toUpperCase()}:`;
    (PRESETS_BY_TOOL[tool] || PRESETS_BY_TOOL.gap).forEach(p => grid.appendChild(chip(p.label, p.term, p.cat, "small")));
  }

  function updateLinks() {
    const tool = getTool();
    const raw = query().value.trim();
    const q = encodeURIComponent(raw || detected[0]?.term || "Transformation Semigroups");

    $("linkArxiv").href = `https://arxiv.org/search/math?query=${q}&searchtype=all&order=-announced_date_first`;
    $("linkArxivCat").href = `https://arxiv.org/search/math?query=${q}&searchtype=all&classification-mathematics=${category}`;
    $("linkArxivCat").textContent = `${category} ↗`;
    $("linkZbMath").href = `https://zbmath.org/?q=${q}`;
    $("linkZbMathMsc").href = `https://zbmath.org/?q=cc%3A20M*+${q}`;

    const gh = { gap: ["language%3AGAP", "GAP language code (.g)"], lean: ["language%3ALean", "Lean 4 theorem code (.lean)"] }[tool]
      || ["prover9+OR+mace4", "Prover9 / Mace4 scripts (.in)"];
    $("linkGithub").href = `https://github.com/search?q=${q}+${gh[0]}&type=code`;
    if ($("githubLangHint")) $("githubLangHint").textContent = gh[1];
    $("linkGithubRepos").href = `https://github.com/search?q=${q}+topic%3Amathematics&type=repositories`;
    $("linkMathOverflow").href = `https://mathoverflow.net/search?q=${q}`;
    $("linkScholar").href = `https://scholar.google.com/scholar?q=${q}`;

    $("fetchArxivBtn").disabled = !raw;
    $("arxivStatusHint").textContent = raw ? `Target: ${category}` : "(Enter a search term or click a topic chip)";
  }

  const refresh = () => { renderChips(); renderPresets(); updateLinks(); };

  function setTerm(term, cat) {
    query().value = term;
    if (cat) category = cat;
    refresh();
  }

  function detect() {
    detected = detectMathematicalConcepts(getCode(), getTool());
    query().value = detected[0].term;
    category = detected[0].category || "math.GR";
    refresh();
  }

  /* ---- live paper search with fallbacks ---- */
  function renderPapers(items, sourceLabel, rawQ) {
    const box = $("arxivResults");
    const q = encodeURIComponent(rawQ);
    if (!items.length) {
      box.innerHTML = `<div class="notice-box">
        <div class="lead">No exact preprint matches returned for: <strong>${escapeHtml(rawQ)}</strong></div>
        <div class="sub">Explore broader keywords or search the academic indices directly:</div>${searchLinks(q)}</div>`;
      return;
    }
    shownItems = items;
    const rows = items.map(it => {
      const url = safeUrl(it.id || it.link, `https://arxiv.org/search/math?query=${encodeURIComponent(it.title || rawQ)}`);
      const meta = escapeHtml(it.authors || "Unknown author") + (it.published ? " &bull; " + escapeHtml(it.published) : "");
      return `<div class="paper">
        <a class="paper-title" href="${escapeHtml(url)}" target="_blank" rel="noopener">${escapeHtml(it.title || "Untitled Paper")} ↗</a>
        <div class="paper-meta">${meta}</div>
        ${it.summary ? `<div class="paper-summary">${escapeHtml(it.summary)}</div>` : ""}
        <button type="button" class="mini-btn" data-bib="${shownItems.indexOf(it)}">BibTeX</button></div>`;
    }).join("");
    box.innerHTML = `<div class="paper-head"><span class="paper-source">${escapeHtml(sourceLabel)}</span>
      <span><button type="button" class="mini-btn" id="copyAllBib">Copy all BibTeX</button>
      <a href="https://arxiv.org/search/math?query=${q}&searchtype=all" target="_blank" rel="noopener">Search all arXiv ↗</a></span></div>
      <div class="paper-list">${rows}</div>`;
  }

  async function fetchJson(url, signal, opts = {}) {
    const res = await fetch(url, { ...opts, signal });
    return res.ok ? res.json() : null;
  }

  const tiers = [
    ["arXiv Preprints (Live)", async (q, signal) => {
      const d = await fetchJson(`/api/arxiv?q=${encodeURIComponent(q)}`, signal);
      return d?.ok ? d.results : [];
    }],
    ["Academic Preprints & Research (OpenAlex Index)", async (q, signal) => {
      const d = await fetchJson(`https://api.openalex.org/works?search=${encodeURIComponent(q)}&filter=type:preprint|article&per_page=5`,
        signal, { headers: { Accept: "application/json" } });
      return (d?.results || []).map(w => ({
        title: w.display_name || w.title,
        id: w.doi || w.primary_location?.landing_page_url || w.id,
        published: w.publication_year ? String(w.publication_year) : "",
        authors: (w.authorships || []).map(a => a.author?.display_name).filter(Boolean).slice(0, 3).join(", "),
        summary: w.primary_topic?.display_name ? `Topic: ${w.primary_topic.display_name}` : ""
      }));
    }],
    ["arXiv Preprints (Direct Feed)", async (q, signal) => {
      const proxy = `https://api.allorigins.win/raw?url=${encodeURIComponent(arxivQueryUrl(q, 5))}`;
      const res = await fetch(proxy, { signal });
      return res.ok ? parseArxivAtom(await res.text(), 5) : [];
    }]
  ];

  async function fetchPapers() {
    const rawQ = query().value.trim();
    const box = $("arxivResults"), btn = $("fetchArxivBtn");
    if (!rawQ) {
      updateLinks();
      box.innerHTML = '<div class="notice-box bad">⚠️ Please enter or select a mathematical search term first.</div>';
      return;
    }
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Searching…';
    box.innerHTML = `<div class="loading-line"><span class="spinner"></span> Querying official arXiv &amp; mathematical databases for &ldquo;${escapeHtml(rawQ)}&rdquo;…</div>`;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    try {
      for (const [label, tierFn] of tiers) {
        try {
          const items = await tierFn(rawQ, controller.signal);
          if (items.length) { renderPapers(items, label, rawQ); return; }
        } catch (err) {
          if (controller.signal.aborted) throw err; // timeout ends the whole search
        }
      }
      renderPapers([], "", rawQ);
    } catch {
      const q = encodeURIComponent(rawQ);
      box.innerHTML = `<div class="notice-box">
        <div class="lead">${controller.signal.aborted ? "⏱️ Request timed out (the feed took longer than 8 seconds)." : "⚠️ The live feed could not be reached."}</div>
        <div class="sub">You can open the exact search query in a new tab:</div>${searchLinks(q)}</div>`;
    } finally {
      clearTimeout(timer);
      btn.innerHTML = "🔄 Fetch Matching Papers";
      updateLinks();
    }
  }

  /* ---- wiring ---- */
  $("scourBtn").onclick = () => { detect(); openModal("scourModal"); };
  $("closeScourModal").onclick = $("dismissScourModal").onclick = () => closeModal("scourModal");
  $("btnRefreshKeywords").onclick = detect;
  $("btnClearQuery").onclick = () => { query().value = ""; refresh(); query().focus(); };
  $("btnAddTermPrompt").onclick = () => {
    const term = prompt("Enter a mathematical concept or keyword (e.g. 'Symmetric Inverse Monoid'):")?.trim();
    if (!term) return;
    if (!detected.some(c => c.term.toLowerCase() === term.toLowerCase())) detected.unshift({ term, category });
    setTerm(term, category);
  };
  query().addEventListener("input", refresh);
  query().addEventListener("keydown", e => {
    if (e.key === "Enter") { e.preventDefault(); fetchPapers(); }
  });
  $("fetchArxivBtn").onclick = fetchPapers;
  $("arxivResults").addEventListener("click", e => {
    const one = e.target.closest("[data-bib]");
    if (one) return copyText(toBibtex(shownItems[+one.dataset.bib]), one);
    if (e.target.id === "copyAllBib") copyText(shownItems.map(toBibtex).join("\n\n"), e.target);
  });
}
