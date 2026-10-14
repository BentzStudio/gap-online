const OK_WORDS = new Set(["Group", "Alt", "Sym", "infinity"]);
function parseGap(s) {
  let i = 0;
  const skipWs = () => { while (i < s.length && /\s/.test(s[i])) i++; };
  function parseItem() {
    skipWs();
    if (s[i] === "[" || s[i] === "{") {
      const open = s[i], close = open === "[" ? "]" : "}"; i++;
      const list = []; skipWs();
      if (s[i] === close) { i++; return { list, open }; }
      while (i < s.length) {
        list.push(parseItem()); skipWs();
        if (s[i] === ",") { i++; continue; }
        if (s[i] === close) { i++; return { list, open }; }
        break;
      }
      throw new Error("parse");
    }
    let depth = 0; const start = i;
    while (i < s.length) {
      const c = s[i];
      if (c === "(") depth++;
      else if (c === ")") depth--;
      else if (depth === 0 && (c === "," || c === "]" || c === "}")) break;
      i++;
    }
    return { atom: s.slice(start, i).trim() };
  }
  const node = parseItem(); skipWs();
  if (i < s.length) throw new Error("parse");
  return node;
}

function texAtom(a) {
  const g = a.match(/^Group\(\s*(\[[\s\S]*\])\s*\)$/);
  if (g) return "\\left\\langle " + parseGap(g[1]).list.map(renderNode).join(",\\ ") + " \\right\\rangle";
  return a
    .replace(/Alt\(\s*\[\s*1\s*\.\.\s*(\d+)\s*\]\s*\)/g, "A_{$1}")
    .replace(/Sym\(\s*\[\s*1\s*\.\.\s*(\d+)\s*\]\s*\)/g, "S_{$1}")
    .replace(/infinity/g, "\\infty ")
    .replace(/\.\./g, "\\ldots ")
    .replace(/\(([^()]*)\)/g, (_, inner) => "(" + inner.replace(/,\s*/g, "\\,") + ")")
    .replace(/(-?)(\d+)\/(\d+)/g, (_, sg, p, q) => sg + "\\frac{" + p + "}{" + q + "}")
    .replace(/\^(-?\d+)/g, "^{$1}")
    .replace(/(\d)\*(?=[A-Za-z(])/g, "$1 ")
    .replace(/\*/g, " \\cdot ");
}

function renderNode(n) {
  if (n.atom !== undefined) return texAtom(n.atom);
  const isRow = r => r.list && r.open === "[";
  if (n.open === "[" && n.list.length && n.list.every(isRow) &&
      n.list.every(r => r.list.length === n.list[0].list.length && r.list.every(e => e.atom !== undefined))) {
    return "\\begin{pmatrix}" + n.list.map(r => r.list.map(renderNode).join(" & ")).join(" \\\\ ") + "\\end{pmatrix}";
  }
  const body = n.list.map(renderNode).join(",\\ ");
  return n.open === "{" ? "\\left\\{ " + body + " \\right\\}" : "\\left[ " + body + " \\right]";
}

function tryTex(t) {
  t = t.trim();
  if (!t || /[$"'#\\]|Error/.test(t)) return null;
  if (!/^[-+*\/^\d\s,.()\[\]{}A-Za-z]+$/.test(t)) return null;
  if (!(t.match(/[A-Za-z]{2,}/g) || []).every(w => OK_WORDS.has(w))) return null;
  if (!(/^[\d(\[{-]/.test(t) || /[\^*\/+]/.test(t) || /^(Group|Alt|Sym)\(/.test(t))) return null;
  try { return renderNode(parseGap(t)); } catch (e) { return null; }
}

export function latexify(text) {
  const lines = text.split("\n"), out = [];
  const depthOf = t => { let d = 0; for (const c of t) { if ("[({".includes(c)) d++; else if ("])}".includes(c)) d--; } return d; };
  for (let k = 0; k < lines.length; k++) {
    let joined = lines[k], j = k, d = depthOf(joined);
    while (d > 0 && j + 1 < lines.length) { j++; joined += " " + lines[j].trim(); d = depthOf(joined); }
    const tex = d === 0 ? tryTex(joined) : null;
    if (tex !== null) { out.push("$\\displaystyle " + tex + "$"); k = j; }
    else out.push(lines[k]);
  }
  return out.join("\n");
}
