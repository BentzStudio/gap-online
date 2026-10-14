import { $, store } from "./util.js";
import { LOGO_OPTIONS, LOGO_KEYS } from "./logos-data.js";

const KEY = "gap_playground_logo";
let current = LOGO_OPTIONS[store.get(KEY)] ? store.get(KEY) : "monogenic";

function renderGallery() {
  const grid = $("logoChooserGrid");
  if (!grid) return;
  grid.innerHTML = LOGO_KEYS.map(k => {
    const o = LOGO_OPTIONS[k], active = k === current;
    return `<button type="button" class="preset-btn logo-choice-card${active ? " is-active" : ""}" data-logo="${k}" title="${o.desc.replace(/"/g, "&quot;")}">
      <div class="art">${o.svg}</div>
      <div class="name">Option ${o.letter}: ${o.title}</div>
      <div class="sub">${o.subtitle}</div>
      <span class="pick">${active ? "✓ Selected" : "Choose"}</span></button>`;
  }).join("");
}

export function setSiteLogo(key) {
  if (!LOGO_OPTIONS[key]) key = "monogenic";
  current = key;
  store.set(KEY, key);
  const o = LOGO_OPTIONS[key];
  $("siteLogoWrapper").innerHTML = o.svg;
  $("logoToggleBtn").title = `Emblem: ${o.title} (Option ${o.letter}) — Click to cycle, or pick in Colophon`;
  const badge = $("activeLogoBadge");
  if (badge) badge.textContent = `Active: Option ${o.letter} (${o.title})`;
  renderGallery();
}

export function initLogos() {
  $("logoChooserGrid").addEventListener("click", e => {
    const card = e.target.closest("[data-logo]");
    if (card) setSiteLogo(card.dataset.logo);
  });
  $("logoToggleBtn").onclick = () => setSiteLogo(LOGO_KEYS[(LOGO_KEYS.indexOf(current) + 1) % LOGO_KEYS.length]);
  setSiteLogo(current);
}
export { renderGallery };
