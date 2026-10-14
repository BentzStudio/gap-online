export const $ = id => document.getElementById(id);

export const store = {
  get: k => { try { return localStorage.getItem(k); } catch { return null; } },
  set: (k, v) => { try { localStorage.setItem(k, v); } catch {} }
};

export const sleep = ms => new Promise(r => setTimeout(r, ms));

export function escapeHtml(s) {
  return String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

/** Only http(s) links are allowed into href attributes. */
export function safeUrl(u, fallback = "#") {
  try {
    const url = new URL(u);
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : fallback;
  } catch { return fallback; }
}

export function toBase64(str) {
  const bytes = new TextEncoder().encode(str);
  let bin = "";
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  return btoa(bin);
}

/** Briefly replace a button's label with "Copied!". */
export function flashLabel(btn, text = "Copied!") {
  const old = btn.dataset.label ?? btn.textContent;
  btn.dataset.label = old;
  btn.textContent = text;
  setTimeout(() => { btn.textContent = old; }, 1500);
}

export function copyText(text, btn) {
  return navigator.clipboard.writeText(text).then(() => { if (btn) flashLabel(btn); });
}

export function openModal(id) {
  const m = $(id);
  m.hidden = false;
  m.setAttribute("aria-hidden", "false");
}
export function closeModal(id) {
  const m = $(id);
  m.hidden = true;
  m.setAttribute("aria-hidden", "true");
}

/** Parse an arXiv Atom feed into plain result objects (shared by every fallback tier). */
export function parseArxivAtom(xml, limit = 6) {
  const entries = xml.match(/<entry>[\s\S]*?<\/entry>/g) || [];
  return entries.slice(0, limit).map(entry => {
    const pick = re => (entry.match(re)?.[1] || "").replace(/\s+/g, " ").trim();
    return {
      title: pick(/<title>([\s\S]*?)<\/title>/) || "Untitled",
      id: pick(/<id>([\s\S]*?)<\/id>/),
      published: pick(/<published>([\s\S]*?)<\/published>/).slice(0, 10),
      authors: Array.from(entry.matchAll(/<author>\s*<name>([\s\S]*?)<\/name>/g)).map(m => m[1].trim()).slice(0, 4).join(", "),
      summary: pick(/<summary>([\s\S]*?)<\/summary>/).slice(0, 220) + "…"
    };
  });
}

/** Build the arXiv API URL used by the proxy and by the public fallback. */
export function arxivQueryUrl(rawQ, max = 6) {
  const tokens = rawQ.replace(/["'(),;:]/g, " ").split(/\s+/).filter(Boolean).slice(0, 2);
  const tokenQuery = tokens.map(t => "all:" + encodeURIComponent(t)).join("+AND+");
  const search = tokenQuery ? `cat:math.*+AND+${tokenQuery}` : "cat:math.*";
  return `https://export.arxiv.org/api/query?search_query=${search}&start=0&max_results=${max}&sortBy=relevance&sortOrder=descending`;
}
