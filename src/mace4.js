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