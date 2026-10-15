/* Axiom sets for semigroup theory, inserted into Prover9 / Mace4 input.
   Variables are x, y, z (Prover9 treats u..z as variables); constants are e, 0. */
const ASSOC = "(x * y) * z = x * (y * z).";

export const AXIOM_SETS = {
  "Semigroup": [ASSOC],
  "Commutative semigroup": [ASSOC, "x * y = y * x."],
  "Monoid": [ASSOC, "e * x = x.", "x * e = x."],
  "Band (idempotent)": [ASSOC, "x * x = x."],
  "Semilattice": [ASSOC, "x * x = x.", "x * y = y * x."],
  "Left-zero band": [ASSOC, "x * y = x."],
  "Right-zero band": [ASSOC, "x * y = y."],
  "Rectangular band": [ASSOC, "x * x = x.", "(x * y) * x = x."],
  "Regular semigroup": [ASSOC, "(x * r(x)) * x = x."],
  "Inverse semigroup": [ASSOC, "(x * i(x)) * x = x.", "(i(x) * x) * i(x) = i(x).", "(x * i(x)) * (y * i(y)) = (y * i(y)) * (x * i(x))."],
  "Group": [ASSOC, "e * x = x.", "x * e = x.", "i(x) * x = e."],
  "Semigroup with zero": [ASSOC, "0 * x = 0.", "x * 0 = 0."],
  "Null semigroup": [ASSOC, "x * y = 0."],
  "Nilpotent (class 3, with zero)": [ASSOC, "0 * x = 0.", "x * 0 = 0.", "(x * y) * z = 0."]
};

/** Return the editor text with an assumptions block for `name` placed at the top. */
export function withAxioms(code, name) {
  const lines = AXIOM_SETS[name];
  if (!lines) return code;
  const block = `% Axioms: ${name}\nformulas(assumptions).\n${lines.map(l => "  " + l).join("\n")}\nend_of_list.\n`;
  return code.trim() ? block + "\n" + code : block + "\nformulas(goals).\n  % add your goal here\nend_of_list.\n";
}
