import { $, store } from "./util.js";

/* Line-number gutter for the main editor. Built entirely from JS so the page
   markup does not change. Wrapped lines get one number with a matching height
   (measured with a hidden mirror), the gutter is only as wide as its digits,
   and it can be switched off with the "#" button (remembered). */

const KEY = "gap.gutter";
const MAX_MEASURED_LINES = 4000; // above this, assume no wrapping to stay fast

export function initGutter() {
  const ta = $("code");
  if (!ta || ta.closest(".editor-wrap")) return;

  const wrap = document.createElement("div");
  wrap.className = "editor-wrap";
  const gutter = document.createElement("div");
  gutter.className = "gutter";
  gutter.setAttribute("aria-hidden", "true");
  const inner = document.createElement("div");
  inner.className = "gutter-inner";
  gutter.appendChild(inner);
  ta.replaceWith(wrap);
  wrap.append(gutter, ta);

  const mirror = document.createElement("div");
  mirror.className = "gutter-mirror";
  mirror.setAttribute("aria-hidden", "true");
  document.body.appendChild(mirror);

  let enabled = store.get(KEY) !== "off";
  let queued = false;

  let oneLine = 20;
  function measure(lines) {
    const cs = getComputedStyle(ta);
    const padX = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight);
    Object.assign(mirror.style, {
      font: cs.font, letterSpacing: cs.letterSpacing, tabSize: cs.tabSize,
      whiteSpace: cs.whiteSpace === "pre" ? "pre" : "pre-wrap",
      overflowWrap: cs.overflowWrap, wordBreak: cs.wordBreak,
      width: Math.max(ta.clientWidth - padX, 40) + "px"
    });
    mirror.textContent = "X";
    const one = oneLine = mirror.offsetHeight || 20;
    if (lines.length > MAX_MEASURED_LINES || cs.whiteSpace === "pre") return lines.map(() => one);
    mirror.replaceChildren(...lines.map(l => {
      const d = document.createElement("div");
      d.textContent = l || "\u200b";
      return d;
    }));
    return [...mirror.children].map(d => d.offsetHeight || one);
  }

  function update() {
    queued = false;
    wrap.classList.toggle("no-gutter", !enabled);
    if (!enabled) return;
    const lines = ta.value.split("\n");
    const heights = measure(lines);
    const digits = Math.max(2, String(lines.length).length);
    gutter.style.width = `calc(${digits}ch + var(--gutter-pad, 14px))`;
    inner.style.paddingTop = getComputedStyle(ta).paddingTop;
    inner.style.paddingBottom = getComputedStyle(ta).paddingBottom;
    inner.innerHTML = lines.map((_, i) => `<div style="height:${heights[i]}px;line-height:${oneLine}px" data-line="${i}">${i + 1}</div>`).join("");
    syncScroll();
  }
  const schedule = () => { if (!queued) { queued = true; requestAnimationFrame(update); } };
  const syncScroll = () => { inner.style.transform = `translateY(${-ta.scrollTop}px)`; };

  // Programmatic edits (examples, history, share links) don't fire "input", so watch the value setter too.
  const desc = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value");
  Object.defineProperty(ta, "value", {
    configurable: true,
    get() { return desc.get.call(this); },
    set(v) { desc.set.call(this, v); schedule(); }
  });

  ta.addEventListener("input", schedule);
  ta.addEventListener("scroll", syncScroll, { passive: true });
  if (window.ResizeObserver) new ResizeObserver(schedule).observe(ta);
  window.addEventListener("resize", schedule);
  document.fonts?.ready.then(schedule);

  // Tap a number to select that whole line (handy on a phone).
  gutter.addEventListener("click", e => {
    const row = e.target.closest("[data-line]");
    if (!row) return;
    const lines = ta.value.split("\n");
    const n = +row.dataset.line;
    const start = lines.slice(0, n).reduce((a, l) => a + l.length + 1, 0);
    ta.focus();
    ta.setSelectionRange(start, start + lines[n].length);
  });

  // Toggle button in the editor toolbar.
  const btn = document.createElement("button");
  btn.type = "button";
  btn.id = "gutterBtn";
  btn.className = "mini-btn";
  btn.textContent = "#";
  btn.title = "Show or hide line numbers";
  btn.setAttribute("aria-label", "Toggle line numbers");
  const sync = () => { btn.setAttribute("aria-pressed", String(enabled)); btn.classList.toggle("active", enabled); };
  btn.onclick = () => { enabled = !enabled; store.set(KEY, enabled ? "on" : "off"); sync(); schedule(); };
  sync();
  const run = $("run");
  if (run?.parentElement) run.parentElement.insertBefore(btn, run);

  update();
}
