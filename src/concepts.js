export const MATH_CONCEPT_PATTERNS = [
  // Semigroup & Monoid Theory
  { regex: /\b(full\s*transformation\s*monoid|transformation\s*monoid|transformation\s*semigroup)\b/i, term: "Transformation Semigroups", category: "math.GR" },
  { regex: /\b(green['’]?s?\s*(relations|classes|dclass|hclass|rclass|lclass|jclass)|dclasses|hclasses|rclasses|lclasses|jclasses)\b/i, term: "Green's Relations", category: "math.GR" },
  { regex: /\b(inverse\s*semigroup|inversesemigroup|symmetric\s*inverse\s*monoid)\b/i, term: "Inverse Semigroups", category: "math.GR" },
  { regex: /\b(idempotent|idempotents)\b/i, term: "Idempotent Semigroups", category: "math.GR" },
  { regex: /\b(rees\s*matrix|reesmatrix)\b/i, term: "Rees Matrix Semigroups", category: "math.GR" },
  { regex: /\b(regular\s*semigroup|regularsemigroup)\b/i, term: "Regular Semigroups", category: "math.GR" },
  { regex: /\b(monogenic\s*semigroup|monogenic|free\s*semigroup|free\s*monoid)\b/i, term: "Monogenic Semigroups", category: "math.GR" },
  { regex: /\b(krohn[\s-]rhodes)\b/i, term: "Krohn-Rhodes Theory", category: "math.GR" },
  { regex: /\b(semigroup\s*ideal|ideal\s*extension)\b/i, term: "Semigroup Ideals", category: "math.GR" },
  { regex: /\b(band|bands|semilattice|semilattices)\b/i, term: "Bands and Semilattices", category: "math.GR" },
  { regex: /\b(semigroup|semigroups)\b/i, term: "Semigroup Theory", category: "math.GR" },

  // Group Theory
  { regex: /\b(alternating\s*group|alternatinggroup)\b/i, term: "Alternating Groups", category: "math.GR" },
  { regex: /\b(symmetric\s*group|symmetricgroup)\b/i, term: "Symmetric Groups", category: "math.GR" },
  { regex: /\b(conjugacy\s*classes?|conjugacyclasses?)\b/i, term: "Conjugacy Classes", category: "math.GR" },
  { regex: /\b(character\s*table|charactertable|character\s*theory)\b/i, term: "Character Table", category: "math.GR" },
  { regex: /\b(sylow\s*subgroup|sylowsubgroup)\b/i, term: "Sylow Subgroups", category: "math.GR" },
  { regex: /\b(derived\s*subgroup|commutator\s*subgroup)\b/i, term: "Derived Subgroup", category: "math.GR" },
  { regex: /\b(solvable\s*group|issolvable)\b/i, term: "Solvable Groups", category: "math.GR" },
  { regex: /\b(nilpotent\s*group|isnilpotent)\b/i, term: "Nilpotent Groups", category: "math.GR" },
  { regex: /\b(dihedral\s*group|dihedralgroup)\b/i, term: "Dihedral Groups", category: "math.GR" },
  { regex: /\b(quaternion\s*group|quaterniongroup)\b/i, term: "Quaternion Group", category: "math.GR" },
  { regex: /\b(automorphism\s*group|automorphismgroup)\b/i, term: "Automorphism Groups", category: "math.GR" },
  { regex: /\b(simple\s*group|issimplegroup)\b/i, term: "Finite Simple Groups", category: "math.GR" },
  { regex: /\b(permutation\s*group|permutationgroup)\b/i, term: "Permutation Groups", category: "math.GR" },
  { regex: /\b(matrix\s*group|general\s*linear)\b/i, term: "Matrix Groups", category: "math.GR" },
  { regex: /\b(cayley\s*table|cayley\s*graph)\b/i, term: "Cayley Graphs", category: "math.GR" },
  { regex: /\b(centralizer|normalizer|center)\b/i, term: "Centralizer and Center", category: "math.GR" },

  // Logic & Automated Proving
  { regex: /\b(robbins\s*algebra|robbins\s*conjecture|robbins)\b/i, term: "Robbins Algebra", category: "math.LO" },
  { regex: /\b(equational\s*logic|equational\s*theory)\b/i, term: "Equational Logic", category: "math.LO" },
  { regex: /\b(first[\s-]order\s*logic)\b/i, term: "First-Order Logic", category: "math.LO" },
  { regex: /\b(finite\s*model|model\s*finding|counterexample|mace4)\b/i, term: "Finite Model Finding", category: "math.LO" },
  { regex: /\b(resolution|prover9|automated\s*theorem\s*proving)\b/i, term: "Automated Theorem Proving", category: "math.LO" },
  { regex: /\b(distributive\s*lattice|modular\s*lattice|lattice\s*theory)\b/i, term: "Lattice Theory", category: "math.LO" },
  { regex: /\b(boolean\s*algebra|boolean\s*ring)\b/i, term: "Boolean Algebras", category: "math.LO" },

  // Lean 4 & Formalized Math
  { regex: /\b(mathlib|lean\s*4)\b/i, term: "Lean 4 Mathlib", category: "cs.LO" },
  { regex: /\b(commsemigroup|commutative\s*semigroup)\b/i, term: "Commutative Semigroups", category: "math.GR" },
  { regex: /\b(group\s*axioms?|group\s*theory)\b/i, term: "Formalized Group Theory", category: "math.GR" }
];

export const PRESETS_BY_TOOL = {
  gap: [
    { label: "Semigroup Congruences", term: "Semigroup Congruences", cat: "math.GR" },
    { label: "Krohn-Rhodes", term: "Krohn-Rhodes Theory", cat: "math.GR" },
    { label: "Rees Matrix", term: "Rees Matrix Semigroups", cat: "math.GR" },
    { label: "Transformation Semigroups", term: "Transformation Semigroups", cat: "math.GR" },
    { label: "Green's Relations", term: "Green's Relations", cat: "math.GR" },
    { label: "Inverse Semigroups", term: "Inverse Semigroups", cat: "math.GR" },
    { label: "Idempotents", term: "Idempotent Semigroups", cat: "math.GR" },
    { label: "Alternating Groups", term: "Alternating Groups", cat: "math.GR" },
    { label: "Character Table", term: "Character Table", cat: "math.GR" }
  ],
  prover9: [
    { label: "Equational theories of semigroups", term: "Equational Theories of Semigroups", cat: "math.GR" },
    { label: "Finite basis problem", term: "Finite Basis Problem Semigroups", cat: "math.GR" },
    { label: "Robbins Algebra", term: "Robbins Algebra", cat: "math.LO" },
    { label: "Equational Logic", term: "Equational Logic", cat: "math.LO" },
    { label: "Lattice Theory", term: "Lattice Theory", cat: "math.LO" },
    { label: "Automated Proving", term: "Automated Theorem Proving", cat: "math.LO" }
  ],
  mace4: [
    { label: "Finite Models", term: "Finite Model Finding", cat: "math.LO" },
    { label: "Counterexamples", term: "Finite Models and Counterexamples", cat: "math.LO" },
    { label: "Semigroup Bands", term: "Bands and Semilattices", cat: "math.GR" },
    { label: "Equational Theories", term: "Equational Logic", cat: "math.LO" }
  ],
  lean: [
    { label: "Mathlib Semigroups", term: "Commutative Semigroups", cat: "math.GR" },
    { label: "Formalized Algebra", term: "Lean 4 Mathlib", cat: "cs.LO" },
    { label: "Group Axioms", term: "Formalized Group Theory", cat: "math.GR" },
    { label: "Type Theory", term: "Dependent Type Theory", cat: "cs.LO" }
  ]
};

export function detectMathematicalConcepts(code, currentTool) {
  const recognized = [];
  const rawCode = code || "";

  for (const { regex, term, category } of MATH_CONCEPT_PATTERNS) {
    if (regex.test(rawCode)) {
      if (!recognized.some(r => r.term === term)) {
        recognized.push({ term, category });
      }
    }
  }

  if (recognized.length === 0) {
    const presets = PRESETS_BY_TOOL[currentTool] || PRESETS_BY_TOOL.gap;
    return [{ term: presets[0].term, category: presets[0].cat }];
  }

  return recognized;
}
