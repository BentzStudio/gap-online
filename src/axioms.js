/* Axiom sets for semigroup theory, inserted into Prover9 / Mace4 input.
   Variables are x, y, z (Prover9 treats u..z as variables); everything else is a constant
   or function symbol: e (identity), 0 (zero), i (unary inverse), r (a choice of inverse),
   f and g (Skolem functions), and the constants a, b, c, p, q. */
const ASSOC = "(x * y) * z = x * (y * z).";
const ZERO = ["0 * x = 0.", "x * 0 = 0."];
const IDENTITY = ["e * x = x.", "x * e = x."];
/* Completely regular semigroups: x' = i(x) satisfies x x' x = x and x' x x' = x'. */
const INVERSE = ["(x * i(x)) * x = x.", "(i(x) * x) * i(x) = i(x)."];
/* Inverse semigroups as unary semigroups (the standard equational basis):
   x x' x = x, (x')' = x, and the idempotents x x' commute. Prover9 derives from these that
   x' x x' = x' and that all idempotents commute. */
const INVERSE_UNARY = [
  "(x * i(x)) * x = x.",
  "i(i(x)) = x.",
  "(x * i(x)) * (y * i(y)) = (y * i(y)) * (x * i(x))."
];

export const AXIOM_SETS = {
  "Semigroup": [ASSOC],
  "Commutative semigroup": [ASSOC, "x * y = y * x."],
  "Monoid": [ASSOC, ...IDENTITY],
  "Band (idempotent)": [ASSOC, "x * x = x."],
  "Semilattice": [ASSOC, "x * x = x.", "x * y = y * x."],
  "Left-zero band": [ASSOC, "x * y = x."],
  "Right-zero band": [ASSOC, "x * y = y."],
  "Left regular band": [ASSOC, "x * x = x.", "x * (y * x) = x * y."],
  "Right regular band": [ASSOC, "x * x = x.", "(x * y) * x = y * x."],
  "Rectangular band": [ASSOC, "x * x = x.", "(x * y) * x = x."],
  "Regular semigroup": [ASSOC, "(x * r(x)) * x = x."],
  "Orthodox semigroup": [ASSOC, "(x * r(x)) * x = x.", "(x * x = x & y * y = y) -> (x * y) * (x * y) = x * y."],
  "Completely regular (union of groups)": [ASSOC, ...INVERSE, "x * i(x) = i(x) * x."],
  "Clifford semigroup (semilattice of groups)": [ASSOC, ...INVERSE, "x * i(x) = i(x) * x.", "(x * i(x)) * y = y * (x * i(x))."],
  "Inverse semigroup": [ASSOC, ...INVERSE_UNARY],
  "Inverse semigroup with zero": [ASSOC, ...ZERO, ...INVERSE_UNARY],
  "Brandt semigroup (completely 0-simple inverse)": [
    ASSOC, ...ZERO, ...INVERSE_UNARY,
    "x = 0 | y = 0 | (f(x,y) * x) * g(x,y) = y.",
    "c != 0."
  ],
  "Brandt semigroup B_2 (5 elements, by presentation)": [
    ASSOC, ...ZERO,
    "(a * b) * a = a.", "(b * a) * b = b.", "a * a = 0.", "b * b = 0.",
    "a != 0.",
    "x = a | x = b | x = a * b | x = b * a | x = 0."
  ],
  "Group": [ASSOC, ...IDENTITY, "i(x) * x = e."],
  "Semigroup with zero": [ASSOC, ...ZERO],
  "Null semigroup (S^2 = 0)": [ASSOC, "x * y = 0."],
  "Nilpotent (S^3 = 0, with zero)": [ASSOC, ...ZERO, "(x * y) * z = 0."],
  "Nilpotent (S^4 = 0, with zero)": [ASSOC, ...ZERO, "((x * y) * z) * w = 0."],
  "Monoid with p * q = e (bicyclic monoid presentation)": [ASSOC, ...IDENTITY, "p * q = e."]
};

/* Optional one-line remarks, written into the input as a comment under the title. */
export const AXIOM_NOTES = {
  "Regular semigroup": "r(x) is some inverse of x; it need not be unique.",
  "Completely regular (union of groups)": "i(x) is the inverse of x inside its group H-class, so x * i(x) = i(x) * x.",
  "Inverse semigroup": "i(x) is the unique inverse of x. Prover9 derives that all idempotents commute from these axioms.",
  "Brandt semigroup (completely 0-simple inverse)":
    "Includes G^0 (a group with a zero adjoined) as well as B_n(G). f, g witness 0-simplicity; c != 0 excludes the trivial semigroup.",
  "Brandt semigroup B_2 (5 elements, by presentation)":
    "B_2 = <a, b | aba = a, bab = b, a^2 = b^2 = 0>. The last axiom says a and b generate. Use assign(domain_size, 5).",
  "Null semigroup (S^2 = 0)": "Every product is 0. This is the nilpotent semigroup of class 2.",
  "Nilpotent (S^3 = 0, with zero)": "Every product of three elements is 0.",
  "Nilpotent (S^4 = 0, with zero)": "Every product of four elements is 0.",
  "Monoid with p * q = e (bicyclic monoid presentation)":
    "The bicyclic monoid <p, q | pq = 1> is the free monoid with this relation, so equations Prover9 derives hold in it. It is infinite and a finite monoid with p * q = e is a group, so Mace4 only finds degenerate models."
};

/** Return the editor text with an assumptions block for `name` placed at the top. */
export function withAxioms(code, name) {
  const lines = AXIOM_SETS[name];
  if (!lines) return code;
  const note = AXIOM_NOTES[name] ? `% ${AXIOM_NOTES[name]}\n` : "";
  const block = `% Axioms: ${name}\n${note}formulas(assumptions).\n${lines.map(l => "  " + l).join("\n")}\nend_of_list.\n`;
  return code.trim() ? block + "\n" + code : block + "\nformulas(goals).\n  % add your goal here\nend_of_list.\n";
}
