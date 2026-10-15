import { $, store } from "./util.js";

/* A notebook is a list of GAP cells. GAP keeps no state between runs, so
   "Run" replays the cells in order inside one session and a marker line
   between cells lets the output be split back into per-cell sections. */

const KEY = "gap.notebook";
const MARK = "@@GAPCELL@@";
let cells = [];
let on = false;

function load() {
  try { cells = JSON.parse(store.get(KEY) || "[]"); } catch { cells = []; }
  if (!Array.isArray(cells) || !cells.length) cells = [""];
}
const save = () => store.set(KEY, JSON.stringify(cells));

function render() {
  const box = $("notebook");
  box.replaceChildren();
  cells.forEach((text, i) => {
    const cell = document.createElement("div");
    cell.className = "nb-cell";
    const side = document.createElement("div");
    side.className = "nb-side";
    side.innerHTML = `<span class="nb-num">[${i + 1}]</span>`;
    const mk = (label, title, fn) => {
      const b = document.createElement("button");
      b.type = "button"; b.className = "mini-btn"; b.textContent = label; b.title = title; b.onclick = fn;
      side.appendChild(b);
    };
    mk("▶", `Run cells 1 to ${i + 1}`, () => notebook.onRun?.(i + 1));
    mk("＋", "Add a cell below", () => { cells.splice(i + 1, 0, ""); save(); render(); box.querySelectorAll("textarea")[i + 1].focus(); });
    mk("✕", "Delete this cell", () => { cells.splice(i, 1); if (!cells.length) cells = [""]; save(); render(); });
    const ta = document.createElement("textarea");
    ta.value = text; ta.spellcheck = false; ta.rows = Math.max(2, text.split("\n").length);
    ta.setAttribute("aria-label", `Cell ${i + 1}`);
    ta.addEventListener("input", () => {
      cells[i] = ta.value; ta.rows = Math.max(2, ta.value.split("\n").length); save();
    });
    cell.append(side, ta);
    box.appendChild(cell);
  });
}

export const notebook = {
  onRun: null,
  isOn: () => on,
  /** Code for cells 1..upTo (all cells by default), with markers between them. */
  compose(upTo = cells.length) {
    return cells.slice(0, upTo)
      .map((c, i) => `${c.replace(/\s+$/, "")}\nPrint("\\n${MARK} ${i + 1}\\n");\n`)
      .join("\n");
  },
  /** Turn the markers in the output into readable cell headings. */
  annotate(out) {
    let k = 0;
    const lines = out.split("\n").map(l => {
      const m = l.match(new RegExp(`^${MARK} (\\d+)$`));
      return m ? `── end of cell ${m[1]} ──` : l;
    });
    return lines.join("\n").replace(/\n{3,}(── end)/g, "\n\n$1");
  },
  addCell(text) {
    load();
    if (cells.length === 1 && !cells[0].trim()) cells = [text]; else cells.push(text);
    save();
    if (on) render();
  },
  joined: () => cells.join("\n\n").trim() + "\n",
  setOn(v, seedCode) {
    on = v;
    $("notebook").hidden = !v;
    $("code").hidden = v;
    $("notebookBtn").classList.toggle("active", v);
    $("notebookBtn").setAttribute("aria-pressed", String(v));
    if (v) {
      load();
      if (cells.length === 1 && !cells[0].trim() && seedCode?.trim()) { cells = [seedCode.replace(/\s+$/, "")]; save(); }
      render();
    }
  }
};
