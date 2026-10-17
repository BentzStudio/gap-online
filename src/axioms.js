/* Axiom sets inserted into Prover9 / Mace4 input.
   Prover9 reads u..z as variables; everything else is a constant or function symbol:
   e (identity), i (inverse), r (some inverse). */
const ASSOC = "(x * y) * z = x * (y * z).";
const IDENTITY = ["e * x = x.", "x * e = x."];
/* Inverse semigroups as unary semigroups: x x' x = x, (x')' = x, and the idempotents x x' commute. */
const INVERSE_UNARY = [
  "(x * i(x)) * x = x.",
  "i(i(x)) = x.",
  "(x * i(x)) * (y * i(y)) = (y * i(y)) * (x * i(x))."
];

export const AXIOM_SETS = {
  "Semigroup": [ASSOC],
  "Commutative semigroup": [ASSOC, "x * y = y * x."],
  "Monoid": [ASSOC, ...IDENTITY],
  "Group": [ASSOC, ...IDENTITY, "i(x) * x = e."],
  "Band": [ASSOC, "x * x = x."],
  "Semilattice": [ASSOC, "x * x = x.", "x * y = y * x."],
  "Regular semigroup": [ASSOC, "(x * r(x)) * x = x."],
  "Inverse semigroup": [ASSOC, ...INVERSE_UNARY]
};

/* Optional one-line remarks, written into the input as a comment under the title. */
export const AXIOM_NOTES = {
  "Group": "e is the identity and i(x) the inverse of x.",
  "Regular semigroup": "r(x) is some inverse of x; it need not be unique.",
  "Inverse semigroup": "i(x) is the unique inverse of x. Prover9 derives that all idempotents commute."
};

/** Return the editor text with an assumptions block for `name` placed at the top. */
export function withAxioms(code, name) {
  const lines = AXIOM_SETS[name];
  if (!lines) return code;
  const note = AXIOM_NOTES[name] ? `% ${AXIOM_NOTES[name]}\n` : "";
  const block = `% Axioms: ${name}\n${note}formulas(assumptions).\n${lines.map(l => "  " + l).join("\n")}\nend_of_list.\n`;
  return code.trim() ? block + "\n" + code : block + "\nformulas(goals).\n  % add your goal here\nend_of_list.\n";
}
