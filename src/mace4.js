import { escapeHtml } from "./util.js";

/* ------------------------------------------------------------------
   Parse Mace4 "standard" interpretation blocks and analyse the model
   as a finite magma / semigroup.
   ------------------------------------------------------------------ */

/** Return the text of the balanced (...) group that starts at index `open` (which must be "("). */
function balanced(text, open) {
  let depth = 0;
  for (let i = open; i < text.length; i++) {
    const c = text[i];
    if (c === "(") depth++;
    else if (c === ")" && --depth === 0) return text.slice(open + 1, i);
  }
  return null;
}

export function parseMace4Models(text) {
  const models = [];
  const re = /interpretation\(/g;
  let m;
  while ((m = re.exec(text))) {
    const body = balanced(text, m.index + "interpretation".length);
    if (!body) continue;
    const head = body.match(/^\s*(\d+)\s*,/);
    if (!head) continue;
    const n = parseInt(head[1], 10);
    const ops = {};
    const fre = /function\(\s*([^\s(,]+)\s*(?:\(([_,\s]*)\))?\s*,\s*\[([^\]]*)\]\s*\)/g;
    let f;
    while ((f = fre.exec(body))) {
      const arity = f[2] ? (f[2].match(/_/g) || []).length : 0;
      const vals = f[3].split(",").map(s => parseInt(s.trim(), 10)).filter(v => !Number.isNaN(v));
      if (vals.length === n ** arity) ops[f[1]] = { arity, vals };
    }
    models.push({ n, ops });
  }
  return models;
}

/** The binary operation we treat as the semigroup product ("*" if present). */
function mainOp(model) {
  if (model.ops["*"]?.arity === 2) return "*";
  return Object.keys(model.ops).find(k => model.ops[k].arity === 2) || null;
}

export function analyseModel(model) {
  const name = mainOp(model);
  if (!name) return null;
  const n = model.n, v = model.ops[name].vals;
  const mul = (a, b) => v[a * n + b];
  const range = [...Array(n).keys()];

  let associative = true;
  outer: for (const a of range) for (const b of range) for (const c of range)
    if (mul(mul(a, b), c) !== mul(a, mul(b, c))) { associative = false; break outer; }

  const commutative = range.every(a => range.every(b => mul(a, b) === mul(b, a)));
  const idempotents = range.filter(a => mul(a, a) === a);
  const identity = range.find(e => range.every(a => mul(e, a) === a && mul(a, e) === a));
  const zero = range.find(z => range.every(a => mul(z, a) === z && mul(a, z) === z));
  const band = idempotents.length === n;
  const inversesOf = a => range.filter(x => mul(mul(a, x), a) === a && mul(mul(x, a), x) === x);
  const regular = associative && range.every(a => range.some(x => mul(mul(a, x), a) === a));
  const idemCommute = idempotents.every(e => idempotents.every(f => mul(e, f) === mul(f, e)));
  const inverse = regular && range.every(a => inversesOf(a).length === 1) && idemCommute;
  const group = associative && identity !== undefined && range.every(a => range.some(x => mul(a, x) === identity && mul(x, a) === identity));
  const nullSg = zero !== undefined && n > 1 && range.every(a => range.every(b => mul(a, b) === zero));
  const leftZero = range.every(a => range.every(b => mul(a, b) === a));
  const rightZero = range.every(a => range.every(b => mul(a, b) === b));

  const props = [];
  props.push(associative ? ["associative (a semigroup)", true] : ["not associative (only a magma)", false]);
  if (associative) {
    if (commutative) props.push(["commutative", true]);
    if (identity !== undefined) props.push([`monoid, identity ${identity}`, true]);
    if (zero !== undefined) props.push([`zero ${zero}`, true]);
    props.push([`${idempotents.length} idempotent${idempotents.length === 1 ? "" : "s"}`, true]);
    if (band) props.push([band && commutative ? "semilattice" : "band", true]);
    if (leftZero) props.push(["left-zero band", true]);
    if (rightZero) props.push(["right-zero band", true]);
    if (regular) props.push(["regular", true]);
    if (inverse) props.push(["inverse", true]);
    if (group) props.push(["group", true]);
    if (nullSg) props.push(["null semigroup", true]);
  }
  return { name, n, mul, associative, props, idempotents };
}

/** Multiplication table as HTML (colour = product, bold border = idempotent on the diagonal). */
export function modelTableHtml(model, info) {
  const { n, mul, idempotents } = info;
  const hue = x => Math.round((x * 360) / Math.max(n, 1));
  let h = `<table class="mtable"><thead><tr><th>${escapeHtml(info.name)}</th>`;
  for (let j = 0; j < n; j++) h += `<th>${j}</th>`;
  h += "</tr></thead><tbody>";
  for (let i = 0; i < n; i++) {
    h += `<tr><th>${i}</th>`;
    for (let j = 0; j < n; j++) {
      const p = mul(i, j);
      const idem = i === j && idempotents.includes(i);
      h += `<td class="${idem ? "idem" : ""}" style="background:hsl(${hue(p)} 60% 50% / .30)">${p}</td>`;
    }
    h += "</tr>";
  }
  return h + "</tbody></table>";
}

/** GAP code that rebuilds the model (indices shifted from 0-based to 1-based). */
export function modelToGap(model, info, index = 1) {
  const rows = [];
  for (let i = 0; i < info.n; i++) {
    const r = [];
    for (let j = 0; j < info.n; j++) r.push(info.mul(i, j) + 1);
    rows.push("  [" + r.join(", ") + "]");
  }
  return [
    `# Model ${index} found by Mace4: order ${info.n}. Elements 0..${info.n - 1} become 1..${info.n}.`,
    'LoadPackage("semigroups");;',
    "mt := [",
    rows.join(",\n"),
    "];;",
    'if IsBoundGlobal("SemigroupByMultiplicationTable") then',
    '  S := ValueGlobal("SemigroupByMultiplicationTable")(mt);;',
    "else",
    "  S := MagmaByMultiplicationTable(mt);;",
    "fi;",
    'Print("Size: ", Size(S), "\\n");',
    'Print("Associative: ", IsAssociative(S), "\\n");',
    'Print("Commutative: ", IsCommutative(S), "\\n");',
    'Print("Idempotents: ", Length(Idempotents(S)), "\\n");',
    'Print("Regular: ", IsRegularSemigroup(S), "\\n");',
    'Print("D-classes: ", Length(GreensDClasses(S)), "\\n");',
    ""
  ].join("\n");
}

/** Split the combined "Prove / Refute" output and decide the verdict. */
export function splitRefuteOutput(text) {
  const iP = text.indexOf("===== PROVER9 =====");
  const iM = text.indexOf("===== MACE4 =====");
  if (iP < 0) return null;
  const prover = text.slice(iP, iM > iP ? iM : undefined);
  const mace = iM > iP ? text.slice(iM) : "";
  let verdict;
  if (/THEOREM PROVED/.test(prover)) verdict = { kind: "ok", text: "✅ Proved by Prover9. No counterexample can exist." };
  else if (/interpretation\(/.test(mace)) {
    const size = mace.match(/interpretation\(\s*(\d+)/)?.[1];
    verdict = { kind: "bad", text: `❌ Refuted: Mace4 found a counterexample of order ${size}.` };
  } else verdict = { kind: "warn", text: "⚠️ Inconclusive: no proof and no counterexample within the time limits." };
  return { verdict, prover, mace };
}
