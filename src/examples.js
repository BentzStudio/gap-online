export const GAP_EXAMPLES = {
  "Green's D-classes & Egg-boxes": [
    'LoadPackage("semigroups");;',
    'S := FullTransformationMonoid(4);;',
    'Print("Size of T_4: ", Size(S), "\\n");',
    'Print("Number of idempotents: ", Length(Idempotents(S)), "\\n");',
    'dclasses := GreensDClasses(S);;',
    'Print("Total Green D-classes: ", Length(dclasses), "\\n");',
    'D := dclasses[2];;',
    'Print("D-class 2 size: ", Size(D), "\\n");',
    'Print("R-classes in D: ", Length(GreensRClasses(D)), "\\n");',
    'Print("L-classes in D: ", Length(GreensLClasses(D)), "\\n");',
    'Print("H-classes in D: ", Length(GreensHClasses(D)), "\\n");',
    'Print("Is regular D-class: ", IsRegularDClass(D), "\\n");'
  ].join("\n"),
  "Inverse Semigroups (IS_4)": [
    'LoadPackage("semigroups");;',
    'S := SymmetricInverseMonoid(4);;',
    'Print("Size of IS_4: ", Size(S), "\\n");',
    'Print("Is inverse semigroup: ", IsInverseSemigroup(S), "\\n");',
    'Print("Idempotent semilattice size: ", Length(Idempotents(S)), "\\n");',
    'Print("Maximal subsemigroups: ", Length(MaximalSubsemigroups(S)), "\\n");'
  ].join("\n"),
  "Groups and LaTeX": [
    'G := AlternatingGroup(5);;',
    'Print("Order: ", Size(G), "\\n");',
    'Print("Structure: ", StructureDescription(G), "\\n");',
    'Print("Conjugacy classes: ", Length(ConjugacyClasses(G)), "\\n");',
    'Print("$$|A_5| = \\\\frac{5!}{2} = ", Size(G), "$$\\n");',
    'x := Indeterminate(Rationals, "x");;',
    'Tex((x+1)^3);'
  ].join("\n"),
  "Small groups": [
    'for n in [1..12] do',
    '  Print(n, ": ", NrSmallGroups(n), " group(s)\\n");',
    'od;',
    'Print(StructureDescription(SmallGroup(12, 3)), "\\n");'
  ].join("\n")
};

export const PROVER9_EXAMPLES = {
  "Group: right identity": [
    "% A right identity follows from the left-sided group axioms.",
    "formulas(assumptions).",
    "  (x * y) * z = x * (y * z).",
    "  e * x = x.",
    "  x' * x = e.",
    "end_of_list.",
    "",
    "formulas(goals).",
    "  x * e = x.",
    "end_of_list."
  ].join("\n"),
  "Exponent 2 is abelian": [
    "% Every group in which x * x = e is commutative.",
    "formulas(assumptions).",
    "  (x * y) * z = x * (y * z).",
    "  e * x = x.",
    "  x * e = x.",
    "  x * x = e.",
    "end_of_list.",
    "",
    "formulas(goals).",
    "  x * y = y * x.",
    "end_of_list."
  ].join("\n")
};

export const MACE4_EXAMPLES = {
  "Left regular band (counterexample)": [
    "% A band (x * x = x) that is left regular (x * y * x = x * y)",
    "% but not right regular (x * y * x = y * x).",
    "assign(domain_size, 3).",
    "",
    "formulas(assumptions).",
    "  (x * y) * z = x * (y * z).",
    "  x * x = x.",
    "  x * (y * x) = x * y.",
    "end_of_list.",
    "",
    "formulas(goals).",
    "  x * (y * x) = y * x.",
    "end_of_list."
  ].join("\n"),
  "Non-abelian group of order 6": [
    "% Is every group of order 6 commutative? Mace4 looks for a counterexample.",
    "assign(domain_size, 6).",
    "",
    "formulas(assumptions).",
    "  (x * y) * z = x * (y * z).",
    "  e * x = x.",
    "  x * e = x.",
    "  x' * x = e.",
    "  x * x' = e.",
    "end_of_list.",
    "",
    "formulas(goals).",
    "  x * y = y * x.",
    "end_of_list."
  ].join("\n"),
  "Commutative, not idempotent": [
    "% A commutative semigroup in which x * x = x fails.",
    "formulas(assumptions).",
    "  (x * y) * z = x * (y * z).",
    "  x * y = y * x.",
    "end_of_list.",
    "",
    "formulas(goals).",
    "  x * x = x.",
    "end_of_list."
  ].join("\n")
};

export const LEAN_EXAMPLES = {
  "Semigroup idempotents": [
    'import Mathlib',
    '',
    '-- In a commutative semigroup, the product of idempotents is idempotent',
    'def IsIdempotent {S : Type*} [Semigroup S] (e : S) : Prop :=',
    '  e * e = e',
    '',
    'theorem mul_idempotent {S : Type*} [CommSemigroup S] (e f : S)',
    '    (he : IsIdempotent e) (hf : IsIdempotent f) :',
    '    IsIdempotent (e * f) := by',
    '  unfold IsIdempotent at *',
    '  calc (e * f) * (e * f) = (e * e) * (f * f) := by rw [mul_assoc, mul_left_comm f, ← mul_assoc]',
    '       _                 = e * f             := by rw [he, hf]'
  ].join("\n"),
  "Inverse elements": [
    'import Mathlib',
    '',
    '-- In an inverse semigroup or group, inverse elements satisfy x*y*x = x and y*x*y = y',
    'def IsInversePair {S : Type*} [Semigroup S] (x y : S) : Prop :=',
    '  x * y * x = x ∧ y * x * y = y',
    '',
    'theorem group_inv_is_inverse_pair {G : Type*} [Group G] (x : G) :',
    '    IsInversePair x (x⁻¹) := by',
    '  constructor',
    '  · simp',
    '  · simp'
  ].join("\n"),
  "Group identity uniqueness": [
    'import Mathlib',
    '',
    '-- In any group, the left identity is strictly unique',
    'theorem group_id_unique {G : Type*} [Group G] (e : G) (h : ∀ x : G, e * x = x) :',
    '    e = 1 := by',
    '  calc e = e * 1 := (mul_one e).symm',
    '       _ = 1     := h 1'
  ].join("\n"),
  "Real inequalities (linarith)": [
    'import Mathlib',
    '',
    '-- Linear arithmetic with real numbers',
    'example (x y : ℝ) (h1 : 2 * x + y ≤ 5) (h2 : y ≥ 1) : x ≤ 2 := by',
    '  linarith'
  ].join("\n"),
  "Computations (#eval)": [
    'import Mathlib',
    '',
    '#eval 2^64 - 1',
    '#eval (List.range 10).map (fun n => n * n)',
    '#check Ring',
    '#check Semigroup'
  ].join("\n")
};

export const TOOLS = {
  gap:     { label: "GAP",     title: "GAP code",      ext: "g",    examples: GAP_EXAMPLES,     codeKey: "gap.code" },
  prover9: { label: "Prover9", title: "Prover9 input", ext: "in",   examples: PROVER9_EXAMPLES, codeKey: "gap.code.prover9" },
  mace4:   { label: "Mace4",   title: "Mace4 input",   ext: "in",   examples: MACE4_EXAMPLES,   codeKey: "gap.code.mace4" },
  lean:    { label: "Lean 4",  title: "Lean 4 code",   ext: "lean", examples: LEAN_EXAMPLES,    codeKey: "gap.code.lean" }
};
