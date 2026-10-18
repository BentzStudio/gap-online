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

  // Advanced Semigroup Varieties
  const orthodox = regular && idempotents.every(e => idempotents.every(f => idempotents.includes(mul(e, f))));
  const completelyRegular = associative && range.every(a => range.some(x => mul(mul(a, x), a) === a && mul(a, x) === mul(x, a)));
  const clifford = completelyRegular && range.every(a => idempotents.every(e => mul(a, e) === mul(e, a)));
  const aperiodic = associative && range.every(a => {
    const seen = [];
    let curr = a;
    while (!seen.includes(curr)) { seen.push(curr); curr = mul(curr, a); }
    const cycleLen = seen.length - seen.indexOf(curr);
    return cycleLen === 1;
  });

  const greens = associative ? computeGreensStructure({ n, mul, associative, idempotents }) : null;

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
    if (orthodox) props.push(["orthodox", true]);
    if (completelyRegular) props.push(["completely regular (union of groups)", true]);
    if (clifford) props.push(["clifford", true]);
    if (inverse) props.push(["inverse", true]);
    if (group) props.push(["group", true]);
    if (aperiodic) props.push(["aperiodic", true]);
    if (nullSg) props.push(["null semigroup", true]);
    if (greens) props.push([`${greens.nrD} D-classes (${greens.nrRegularD} regular)`, true]);
  }
  return { name, n, mul, associative, props, idempotents, greens };
}

/** Compute Green's equivalence relations R, L, H, D and Egg-Box grid for finite semigroups. */
export function computeGreensStructure(info) {
  if (!info.associative) return null;
  const { n, mul, idempotents } = info;
  const range = [...Array(n).keys()];

  // Principal right ideals: aS^1 = {a} U { a * x | x in S }
  const rightIdeals = range.map(a => {
    const s = new Set([a]);
    for (const x of range) s.add(mul(a, x));
    return [...s].sort((x, y) => x - y);
  });
  // Principal left ideals: S^1 a = {a} U { x * a | x in S }
  const leftIdeals = range.map(a => {
    const s = new Set([a]);
    for (const x of range) s.add(mul(x, a));
    return [...s].sort((x, y) => x - y);
  });

  const eqArray = (ar1, ar2) => ar1.length === ar2.length && ar1.every((v, i) => v === ar2[i]);

  // R-relation: a R b iff R(a) == R(b)
  const rClasses = [];
  const assignedR = new Set();
  for (const a of range) {
    if (assignedR.has(a)) continue;
    const cls = range.filter(b => eqArray(rightIdeals[a], rightIdeals[b]));
    cls.forEach(x => assignedR.add(x));
    rClasses.push(cls);
  }

  // L-relation: a L b iff L(a) == L(b)
  const lClasses = [];
  const assignedL = new Set();
  for (const a of range) {
    if (assignedL.has(a)) continue;
    const cls = range.filter(b => eqArray(leftIdeals[a], leftIdeals[b]));
    cls.forEach(x => assignedL.add(x));
    lClasses.push(cls);
  }

  // D-relation: connected components of R and L (in finite semigroups D = R o L = J)
  const dClasses = [];
  const assignedD = new Set();
  for (const a of range) {
    if (assignedD.has(a)) continue;
    const dSet = new Set();
    const queue = [a];
    dSet.add(a);
    while (queue.length > 0) {
      const cur = queue.pop();
      const curR = rClasses.find(rc => rc.includes(cur)) || [];
      for (const el of curR) {
        if (!dSet.has(el)) { dSet.add(el); queue.push(el); }
      }
      const curL = lClasses.find(lc => lc.includes(cur)) || [];
      for (const el of curL) {
        if (!dSet.has(el)) { dSet.add(el); queue.push(el); }
      }
    }

    const dArr = [...dSet].sort((x, y) => x - y);
    dArr.forEach(x => assignedD.add(x));

    // Rows = R-classes within D, Columns = L-classes within D
    const dRClasses = rClasses.filter(rc => rc.some(x => dSet.has(x)));
    const dLClasses = lClasses.filter(lc => lc.some(x => dSet.has(x)));

    let isRegularD = false;
    let hClassesCount = 0;
    const grid = [];
    for (let r = 0; r < dRClasses.length; r++) {
      const row = [];
      for (let c = 0; c < dLClasses.length; c++) {
        const h = dRClasses[r].filter(x => dLClasses[c].includes(x));
        if (h.length > 0) hClassesCount++;
        const hasIdem = h.some(x => idempotents.includes(x));
        if (hasIdem) isRegularD = true;
        row.push({ elements: h, hasIdem, isGroup: hasIdem });
      }
      grid.push(row);
    }

    dClasses.push({
      elements: dArr,
      rClasses: dRClasses,
      lClasses: dLClasses,
      grid,
      isRegular: isRegularD,
      size: dArr.length,
      hClassesCount
    });
  }

  // Count total H-classes
  let totalHClasses = 0;
  for (const d of dClasses) {
    totalHClasses += d.hClassesCount;
  }

  return {
    rClasses,
    lClasses,
    dClasses,
    nrR: rClasses.length,
    nrL: lClasses.length,
    nrH: totalHClasses,
    nrD: dClasses.length,
    nrRegularD: dClasses.filter(d => d.isRegular).length
  };
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

/** Egg-Box diagram HTML for Green's D-classes. */
export function eggBoxHtml(model, info) {
  const greens = info.greens || computeGreensStructure(info);
  if (!greens) {
    return `<div class="eggbox-empty">Egg-Box diagrams are defined for associative semigroups. This model is not associative.</div>`;
  }

  let h = `<div class="eggbox-wrap">`;
  h += `<div class="eggbox-summary">` +
       `<span><strong>Green's classes:</strong> ${greens.nrD} <em>D</em>, ${greens.nrR} <em>R</em>, ${greens.nrL} <em>L</em>, ${greens.nrH} <em>H</em> (${greens.nrRegularD} regular)</span>` +
       `<span class="eggbox-legend"><span class="eggbox-star">★</span> = idempotent (group <em>H</em>-class)</span>` +
       `</div>`;

  greens.dClasses.forEach((d, idx) => {
    const regBadge = d.isRegular 
      ? `<span class="badge good">Regular <em>D</em></span>` 
      : `<span class="badge neg">Non-regular <em>D</em></span>`;
    h += `<div class="eggbox-card">`;
    h += `<div class="eggbox-head">` +
         `<strong><em>D</em><sub>${idx + 1}</sub> (size ${d.size})</strong>` +
         `<span>${regBadge} <span class="eggbox-dims">${d.rClasses.length} <em>R</em> &times; ${d.lClasses.length} <em>L</em></span></span>` +
         `</div>`;

    h += `<div class="table-scroll"><table class="eggbox-table">`;
    h += `<thead><tr><th><em>R</em> \\ <em>L</em></th>`;
    d.lClasses.forEach((_, colIdx) => {
      h += `<th><em>L</em><sub>${colIdx + 1}</sub></th>`;
    });
    h += `</tr></thead><tbody>`;

    d.grid.forEach((row, rowIdx) => {
      h += `<tr><th><em>R</em><sub>${rowIdx + 1}</sub></th>`;
      row.forEach(cell => {
        const isGroup = cell.hasIdem;
        const cls = isGroup ? "eggbox-cell group-cell" : "eggbox-cell";
        const content = cell.elements.length > 0 
          ? cell.elements.map(e => (info.idempotents.includes(e) ? `<span class="cell-idem" title="Idempotent: ${e}*${e}=${e}">★${e}</span>` : `${e}`)).join(", ")
          : "&empty;";
        h += `<td class="${cls}" title="${isGroup ? 'Group H-class (contains idempotent)' : 'H-class'}">${content}</td>`;
      });
      h += `</tr>`;
    });

    h += `</tbody></table></div></div>`;
  });

  h += `</div>`;
  return h;
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

/** Split elements while respecting balanced brackets [], (), {} */
function splitBracketSafe(str) {
  const tokens = [];
  let cur = "";
  let depth = 0;
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (ch === "[" || ch === "(" || ch === "{") depth++;
    else if (ch === "]" || ch === ")" || ch === "}") depth = Math.max(0, depth - 1);

    if (depth === 0 && (ch === "," || ch === ";")) {
      const trimmed = cur.trim();
      if (trimmed) tokens.push(trimmed);
      cur = "";
    } else {
      cur += ch;
    }
  }
  const last = cur.trim();
  if (last) tokens.push(last);
  return tokens;
}

function splitCellElements(str) {
  if (!str) return [];
  const byComma = splitBracketSafe(str);
  if (byComma.length > 1) return byComma;
  const bracketMatches = str.match(/\[[^\]]+\]\*?|\([^\)]+\)\*?|\{[^\}]+\}\*?/g);
  if (bracketMatches && bracketMatches.length > 1) return bracketMatches;
  const words = str.split(/\s+/).map(s => s.trim()).filter(Boolean);
  return words.length > 0 ? words : (str ? [str] : []);
}

/** Detect and parse ASCII / text Egg-Box diagrams from GAP or custom scripts. */
export function parseAsciiEggBoxes(text) {
  if (!text || typeof text !== "string") return [];
  const lines = text.split(/\r?\n/);
  const rawBlocks = [];
  let cur = null;

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const trimmed = raw.trim();

    // Match D-class or Egg-box header line
    const isHeader = /^(?:.*?\b)?(?:Greens\s*)?D-class(?:\s*#?\s*([0-9a-zA-Z_]+))?[:\s]+(?:(\d+)\s*R-class(?:es)?\s*(?:by|x|×|,)\s*(\d+)\s*L-class(?:es)?)?(?:.*?(\d+)\s*elements?)?/i.exec(trimmed) ||
                     /^(?:.*?\b)?Egg-?[Bb]ox(?:\s*(?:diagram|table|of|for)?)?(?:\s*#?\s*([0-9a-zA-Z_]+))?[:\s]*(?:(\d+)\s*R-class(?:es)?)?/i.exec(trimmed);

    if (isHeader) {
      if (cur && cur.rows.length > 0) rawBlocks.push(cur);
      cur = {
        title: isHeader[1] ? `D-class ${isHeader[1]}` : `D-class`,
        declaredR: isHeader[2] ? parseInt(isHeader[2], 10) : null,
        declaredL: isHeader[3] ? parseInt(isHeader[3], 10) : null,
        declaredSize: isHeader[4] ? parseInt(isHeader[4], 10) : null,
        rows: []
      };
      continue;
    }

    // Check if table row with |
    if (trimmed.startsWith("|") && trimmed.endsWith("|") && trimmed.length > 1) {
      // Ignore divider rows like |---|---| or +---+
      if (/^\|[\s\-+=|:]+\|$/.test(trimmed)) continue;

      if (!cur) {
        cur = {
          title: "D-class",
          declaredR: null,
          declaredL: null,
          declaredSize: null,
          rows: []
        };
      }
      const rawCells = trimmed.slice(1, -1).split("|");
      cur.rows.push(rawCells.map(c => c.trim()));
      continue;
    }

    // End of table on blank line or non-table line
    if (cur && cur.rows.length > 0 && !trimmed.startsWith("+")) {
      rawBlocks.push(cur);
      cur = null;
    }
  }
  if (cur && cur.rows.length > 0) rawBlocks.push(cur);

  // Post-process blocks
  const results = [];
  rawBlocks.forEach((b, idx) => {
    if (!b.rows.length) return;

    let rows = b.rows;
    let colHeaders = null;
    if (rows.length > 1 && rows[0].some(c => /^(?:R\s*\\?\s*L|L_?\d+|col|class)/i.test(c))) {
      colHeaders = rows[0];
      rows = rows.slice(1);
    }

    let rowHeaders = null;
    if (rows.every(r => r.length > 1 && /^(?:R_?\d+|row|rclass)/i.test(r[0]))) {
      rowHeaders = rows.map(r => r[0]);
      rows = rows.map(r => r.slice(1));
    }

    const grid = rows.map(r => {
      return r.map(c => {
        if (!c || c === "Ø" || c === "empty" || c === "-" || c === "·" || c === ".") {
          return { elements: [], hasIdem: false, raw: "" };
        }
        const elements = splitCellElements(c);
        const hasIdem = elements.some(el => /\*|★/.test(el));
        return { elements, hasIdem, raw: c };
      });
    });

    const numR = grid.length;
    const numL = Math.max(...grid.map(r => r.length), 0);
    if (numR === 0 || numL === 0) return;

    let totalElements = 0;
    let anyIdem = false;
    let idemCount = 0;
    grid.forEach(r => {
      r.forEach(c => {
        totalElements += c.elements.length;
        if (c.hasIdem) anyIdem = true;
        c.elements.forEach(el => {
          if (/\*|★/.test(el)) idemCount++;
        });
      });
    });

    results.push({
      index: idx + 1,
      title: b.title === "D-class" ? `D-class ${idx + 1}` : b.title,
      numR: b.declaredR || numR,
      numL: b.declaredL || numL,
      size: b.declaredSize || totalElements,
      isRegular: anyIdem,
      idemCount,
      grid,
      colHeaders,
      rowHeaders
    });
  });

  return results;
}

/** LaTeX representation of an Egg-Box diagram table. */
export function eggBoxToLatex(d) {
  const cols = d.numL;
  const colFmt = "|" + Array(cols + 1).fill("c").join("|") + "|";
  const lines = [
    "% Egg-box diagram for " + d.title,
    "\\begin{table}[h]",
    "\\centering",
    `\\begin{tabular}{${colFmt}}`,
    "\\hline",
    "$\\mathcal{R} \\setminus \\mathcal{L}$ & " + Array.from({ length: cols }, (_, j) => `$\\mathcal{L}_{${j + 1}}$`).join(" & ") + " \\\\",
    "\\hline"
  ];
  d.grid.forEach((row, i) => {
    const cells = row.map(c => {
      if (!c.elements || !c.elements.length) return "$\\emptyset$";
      return c.elements.map(el => {
        const isIdem = /\*|★/.test(el);
        const clean = el.replace(/\*|★/g, "").trim();
        return isIdem ? `\\star\\text{${clean}}` : `\\text{${clean}}`;
      }).join(", ");
    });
    lines.push(`$\\mathcal{R}_{${i + 1}}$ & ` + cells.join(" & ") + " \\\\");
    lines.push("\\hline");
  });
  lines.push("\\end{tabular}");
  lines.push(`\\caption{Egg-box diagram for ${d.title} (${d.size} elements, ${d.isRegular ? "regular" : "non-regular"}).}`);
  lines.push("\\end{table}");
  return lines.join("\n");
}

/** Render parsed ASCII eggbox diagrams into rich HTML cards. */
export function asciiEggBoxesHtml(diagrams) {
  if (!diagrams || !diagrams.length) return "";
  const totalRegular = diagrams.filter(d => d.isRegular).length;
  const totalIdems = diagrams.reduce((sum, d) => sum + d.idemCount, 0);

  let h = `<div class="eggbox-panel">`;
  h += `<div class="extras-head" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">` +
       `<span>Green's Relations &amp; Egg-Box Diagrams (${diagrams.length} <em>D</em>-classes)</span>` +
       `<span class="badge ${totalRegular === diagrams.length ? 'good' : 'neg'}">${totalRegular} regular / ${diagrams.length - totalRegular} non-regular</span>` +
       `</div>`;

  h += `<div class="eggbox-wrap">`;
  h += `<div class="eggbox-summary">` +
       `<span><strong>Semigroup decomposition:</strong> ${diagrams.length} <em>D</em>-classes, ${totalIdems} idempotents detected</span>` +
       `<span class="eggbox-legend"><span class="eggbox-star">★</span> = idempotent (group <em>H</em>-class)</span>` +
       `</div>`;

  diagrams.forEach((d, idx) => {
    const regBadge = d.isRegular
      ? `<span class="badge good">Regular <em>D</em></span>`
      : `<span class="badge neg">Non-regular <em>D</em></span>`;

    h += `<div class="eggbox-card" data-dindex="${idx}">`;
    h += `<div class="eggbox-head">` +
         `<strong><em>D</em><sub>${idx + 1}</sub> (size ${d.size})</strong>` +
         `<span style="display:flex; align-items:center; gap:6px;">${regBadge} <span class="eggbox-dims">${d.numR} <em>R</em> &times; ${d.numL} <em>L</em></span>` +
         `<button type="button" class="mini-btn copy-egg-tex" data-idx="${idx}" title="Copy LaTeX tabular code for this D-class">Copy LaTeX</button>` +
         `</span>` +
         `</div>`;

    h += `<div class="table-scroll"><table class="eggbox-table">`;
    h += `<thead><tr><th><em>R</em> \\ <em>L</em></th>`;
    for (let c = 0; c < d.numL; c++) {
      const colLabel = d.colHeaders && d.colHeaders[c] ? escapeHtml(d.colHeaders[c]) : `<em>L</em><sub>${c + 1}</sub>`;
      h += `<th>${colLabel}</th>`;
    }
    h += `</tr></thead><tbody>`;

    d.grid.forEach((row, rowIdx) => {
      const rowLabel = d.rowHeaders && d.rowHeaders[rowIdx] ? escapeHtml(d.rowHeaders[rowIdx]) : `<em>R</em><sub>${rowIdx + 1}</sub>`;
      h += `<tr><th>${rowLabel}</th>`;
      row.forEach(cell => {
        const isGroup = cell.hasIdem;
        const cls = isGroup ? "eggbox-cell group-cell" : "eggbox-cell";
        let content = "&empty;";
        if (cell.elements && cell.elements.length > 0) {
          content = cell.elements.map(el => {
            const isIdem = /\*|★/.test(el);
            const clean = el.replace(/\*|★/g, "").trim();
            if (isIdem) {
              return `<span class="cell-idem" title="Idempotent: element satisfies e*e = e">★${escapeHtml(clean)}</span>`;
            }
            return `<span>${escapeHtml(clean || el)}</span>`;
          }).join(", ");
        }
        h += `<td class="${cls}" title="${isGroup ? 'Group H-class (contains idempotent)' : 'H-class'}">${content}</td>`;
      });
      h += `</tr>`;
    });

    h += `</tbody></table></div></div>`;
  });

  h += `</div></div>`;
  return h;
}

/** Check if GAP output contains a 2D multiplication table matrix of order 2..20. */
export function parseGapMatrix(text) {
  if (!text || typeof text !== "string") return null;
  const matMatch = text.match(/\[\s*(\[\s*\d+(?:\s*,\s*\d+)*\s*\](?:\s*,\s*\[\s*\d+(?:\s*,\s*\d+)*\s*\])*)\s*\]/);
  if (!matMatch) return null;
  try {
    const rawRows = matMatch[1].split(/\],\s*\[/).map(r => r.replace(/[\[\]]/g, "").split(",").map(v => parseInt(v.trim(), 10)));
    const n = rawRows.length;
    if (n < 2 || n > 20) return null;
    if (!rawRows.every(r => r.length === n)) return null;
    const flat = rawRows.flat();
    const min = Math.min(...flat);
    const max = Math.max(...flat);
    let table = null;
    if (min === 1 && max === n) {
      table = rawRows.map(r => r.map(x => x - 1));
    } else if (min === 0 && max === n - 1) {
      table = rawRows;
    } else {
      return null;
    }
    return {
      n,
      ops: {
        "*": {
          arity: 2,
          vals: table.flat()
        }
      }
    };
  } catch (e) {
    return null;
  }
}