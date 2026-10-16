export const MATH_CONCEPT_PATTERNS = [
  // Semigroup & Monoid Theory
  { regex: /(full\s*transformation\s*monoid|transformation\s*monoid|transformation\s*semigroup)/i, term: "Transformation Semigroups", category: "math.GR" },
  { regex: /(green['’]?s?[\s_-]*(relations?|[dhrlj][\s-]*classes?|egg)|[dhrlj]classes|egg[\s-]*box)/i, term: "Green's Relations", category: "math.GR" },
  { regex: /(inverse\s*semigroup|inversesemigroup|symmetric\s*inverse\s*monoid|vagner[\s-]preston)/i, term: "Inverse Semigroups", category: "math.GR" },
  { regex: /(brandt\s*semigroup|reeszeromatrix|rees\s*0\s*matrix)/i, term: "Brandt Semigroups", category: "math.GR" },
  { regex: /(aperiodic\s*semigroup|aperiodic|syntactic\s*monoid)/i, term: "Aperiodic Semigroups", category: "math.GR" },
  { regex: /(orthodox\s*semigroup|completely\s*regular|clifford\s*semigroup)/i, term: "Completely Regular & Orthodox", category: "math.GR" },
  { regex: /(bicyclic\s*monoid|bicyclic)/i, term: "Bicyclic Monoid", category: "math.GR" },
  { regex: /(idempotent|idempotents)/i, term: "Idempotent Semigroups", category: "math.GR" },
  { regex: /(rees\s*matrix|reesmatrix)/i, term: "Rees Matrix Semigroups", category: "math.GR" },
  { regex: /(regular\s*semigroup|regularsemigroup)/i, term: "Regular Semigroups", category: "math.GR" },
  { regex: /(monogenic\s*semigroup|monogenic|free\s*semigroup|free\s*monoid)/i, term: "Monogenic Semigroups", category: "math.GR" },
  { regex: /(krohn[\s-]rhodes)/i, term: "Krohn-Rhodes Theory", category: "math.GR" },
  { regex: /(semigroup\s*ideal|ideal\s*extension)/i, term: "Semigroup Ideals", category: "math.GR" },
  { regex: /\b(bands?|semilattices?)\b/i, term: "Bands and Semilattices", category: "math.GR" },
  { regex: /\b(semigroup|semigroups)\b/i, term: "Semigroup Theory", category: "math.GR" },

  // Group Theory
  { regex: /(alternating\s*group|alternatinggroup)/i, term: "Alternating Groups", category: "math.GR" },
  { regex: /(symmetric\s*group|symmetricgroup)/i, term: "Symmetric Groups", category: "math.GR" },
  { regex: /(conjugacy\s*classes?|conjugacyclasses?)/i, term: "Conjugacy Classes", category: "math.GR" },
  { regex: /(character\s*table|charactertable|character\s*theory)/i, term: "Character Table", category: "math.GR" },
  { regex: /(sylow\s*subgroup|sylowsubgroup)/i, term: "Sylow Subgroups", category: "math.GR" },
  { regex: /(derived\s*subgroup|commutator\s*subgroup)/i, term: "Derived Subgroup", category: "math.GR" },
  { regex: /(solvable\s*group|issolvable)/i, term: "Solvable Groups", category: "math.GR" },
  { regex: /(nilpotent\s*group|isnilpotent)/i, term: "Nilpotent Groups", category: "math.GR" },
  { regex: /(dihedral\s*group|dihedralgroup)/i, term: "Dihedral Groups", category: "math.GR" },
  { regex: /(quaternion\s*group|quaterniongroup)/i, term: "Quaternion Group", category: "math.GR" },
  { regex: /(automorphism\s*group|automorphismgroup)/i, term: "Automorphism Groups", category: "math.GR" },
  { regex: /(simple\s*group|issimplegroup)/i, term: "Finite Simple Groups", category: "math.GR" },
  { regex: /(permutation\s*group|permutationgroup)/i, term: "Permutation Groups", category: "math.GR" },
  { regex: /(matrix\s*group|general\s*linear)/i, term: "Matrix Groups", category: "math.GR" },
  { regex: /(cayley\s*table|cayley\s*graph)/i, term: "Cayley Graphs", category: "math.GR" },
  { regex: /(centralizer|normalizer|\bcentre\(|\bcenter\()/i, term: "Centralizer and Center", category: "math.GR" },

  // Logic & Automated Proving
  { regex: /\b(robbins\s*algebra|robbins\s*conjecture|robbins)\b/i, term: "Robbins Algebra", category: "math.LO" },
  { regex: /(equational\s*logic|equational\s*theory)/i, term: "Equational Logic", category: "math.LO" },
  { regex: /\b(first[\s-]order\s*logic)\b/i, term: "First-Order Logic", category: "math.LO" },
  { regex: /(finite\s*model|model\s*finding|counterexample|mace4)/i, term: "Finite Model Finding", category: "math.LO" },
  { regex: /\b(resolution|prover9|automated\s*theorem\s*proving)\b/i, term: "Automated Theorem Proving", category: "math.LO" },
  { regex: /(distributive\s*lattice|modular\s*lattice|lattice\s*theory)/i, term: "Lattice Theory", category: "math.LO" },
  { regex: /(boolean\s*algebra|boolean\s*ring)/i, term: "Boolean Algebras", category: "math.LO" },

  // Lean 4 & Formalized Math
  { regex: /\b(mathlib|lean\s*4)\b/i, term: "Lean 4 Mathlib", category: "cs.LO" },
  { regex: /(commsemigroup|commutative\s*semigroup)/i, term: "Commutative Semigroups", category: "math.GR" },
  { regex: /(group\s*axioms?|group\s*theory)/i, term: "Formalized Group Theory", category: "math.GR" }
];

export const PRESETS_BY_TOOL = {
  gap: [
    { label: "Egg-Box & Green's Relations", term: "Green's Relations", cat: "math.GR" },
    { label: "Brandt Semigroups", term: "Brandt Semigroups", cat: "math.GR" },
    { label: "Semigroup Congruences", term: "Semigroup Congruences", cat: "math.GR" },
    { label: "Krohn-Rhodes", term: "Krohn-Rhodes Theory", cat: "math.GR" },
    { label: "Rees Matrix", term: "Rees Matrix Semigroups", cat: "math.GR" },
    { label: "Transformation Semigroups", term: "Transformation Semigroups", cat: "math.GR" },
    { label: "Inverse Semigroups", term: "Inverse Semigroups", cat: "math.GR" },
    { label: "Idempotents", term: "Idempotent Semigroups", cat: "math.GR" },
    { label: "Alternating Groups", term: "Alternating Groups", cat: "math.GR" },
    { label: "Character Table", term: "Character Table", cat: "math.GR" }
  ],
  prover9: [
    { label: "Equational theories of semigroups", term: "Equational Theories of Semigroups", cat: "math.GR" },
    { label: "Finite basis problem", term: "Finite Basis Problem Semigroups", cat: "math.GR" },
    { label: "Inverse semigroups", term: "Inverse Semigroups", cat: "math.GR" },
    { label: "Robbins Algebra", term: "Robbins Algebra", cat: "math.LO" },
    { label: "Equational Logic", term: "Equational Logic", cat: "math.LO" },
    { label: "Lattice Theory", term: "Lattice Theory", cat: "math.LO" },
    { label: "Automated Proving", term: "Automated Theorem Proving", cat: "math.LO" }
  ],
  mace4: [
    { label: "Egg-Box Models", term: "Green's Relations", cat: "math.GR" },
    { label: "Brandt Semigroups", term: "Brandt Semigroups", cat: "math.GR" },
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