/* Example programs, one short set per tool. They are written as raw template literals, so the
   text below is exactly what appears in the editor (no quote or backslash escaping to maintain).
   Every example is self-contained: it defines everything it uses. */
const src = s => s.trim() + "\n";

export const GAP_EXAMPLES = {
  "Transformation monoid: invariants": src(String.raw`
LoadPackage("semigroups");;
S := Monoid(Transformation([2,3,1,4]), Transformation([2,1,3,4]), Transformation([1,2,3,3]));;
Print("Size: ", Size(S), "\n");
Print("Idempotents: ", NrIdempotents(S), "\n");
Print("R-, L-, H-, D-classes: ", [NrRClasses(S), NrLClasses(S), NrHClasses(S), NrDClasses(S)], "\n");
Print("Regular: ", IsRegularSemigroup(S), "\n");
Print("Inverse: ", IsInverseSemigroup(S), "\n");
`),
  "Green's relations and diagrams": src(String.raw`
# Graphviz DOT printed here is drawn by the page below the output.
LoadPackage("semigroups");;
S := FullTransformationMonoid(3);;
Print("D-classes: ", NrDClasses(S), ", regular: ", Number(GreensDClasses(S), IsRegularDClass), "\n");
Print(DotString(S), "\n");
M := Monoid(Transformation([2,3,1]), Transformation([2,1,3]));;
Print(DotLeftCayleyDigraph(M), "\n");
`),
  "Brandt semigroup B_2 (Rees 0-matrix)": src(String.raw`
LoadPackage("semigroups");;
# B_2 is the Rees 0-matrix semigroup over the trivial group with identity sandwich matrix.
G := Group(());;
B2 := ReesZeroMatrixSemigroup(G, [[(), 0], [0, ()]]);;
Print("Size: ", Size(B2), "\n");
Print("Inverse: ", IsInverseSemigroup(B2), "\n");
Print("Idempotents: ", NrIdempotents(B2), "\n");
Print("D-classes: ", NrDClasses(B2), "\n");
Print("0-simple: ", IsZeroSimpleSemigroup(B2), "\n");
`),
  "Presentations": src(String.raw`
# Monogenic semigroup <a | a^5 = a^3>: index 3, period 2, so 4 elements.
F := FreeSemigroup("a");;
a := F.1;;
S := F / [[a^5, a^3]];;
Print("Size: ", Size(S), "\n");
# Free semilattice on two generators: 3 elements.
F2 := FreeSemigroup("a", "b");;
x := F2.1;; y := F2.2;;
T := F2 / [[x^2, x], [y^2, y], [x*y, y*x]];;
Print("Size: ", Size(T), "\n");
`),
  "Small semigroups library": src(String.raw`
LoadPackage("semigroups");;
if LoadPackage("smallsemi") = fail then
  Print("The smallsemi package is not available on this runner.\n");
else
  Print("Semigroups of order 4 (up to iso/anti-iso): ", NrSmallSemigroups(4), "\n");
  S := SmallSemigroup(4, 10);;
  Print("Idempotents: ", Length(Idempotents(S)), "\n");
  Print("Commutative: ", IsCommutative(S), "\n");
  Print("Regular: ", IsRegularSemigroup(S), "\n");
fi;
`),
  "Small groups": src(String.raw`
for n in [1..12] do
  Print(n, ": ", NrSmallGroups(n), " group(s)\n");
od;
Print(StructureDescription(SmallGroup(12, 3)), "\n");
`),
  "Groups and LaTeX": src(String.raw`
G := AlternatingGroup(5);;
Print("Order: ", Size(G), "\n");
Print("Structure: ", StructureDescription(G), "\n");
Print("Conjugacy classes: ", Length(ConjugacyClasses(G)), "\n");
x := Indeterminate(Rationals, "x");;
Tex((x+1)^3);
`)
};

export const PROVER9_EXAMPLES = {
  "Group: right identity": src(`
% A right identity follows from the left-sided group axioms.
formulas(assumptions).
  (x * y) * z = x * (y * z).
  e * x = x.
  i(x) * x = e.
end_of_list.

formulas(goals).
  x * e = x.
end_of_list.
`),
  "Exponent 2 is abelian": src(`
% Every group in which x * x = e is commutative.
formulas(assumptions).
  (x * y) * z = x * (y * z).
  e * x = x.
  x * e = x.
  x * x = e.
end_of_list.

formulas(goals).
  x * y = y * x.
end_of_list.
`),
  "Inverse semigroup: unique inverses": src(`
% Regular semigroup with commuting idempotents: inverses are unique.
% a, b, c are constants; b and c are both inverses of a.
formulas(assumptions).
  (x * y) * z = x * (y * z).
  (a * b) * a = a.
  (b * a) * b = b.
  (a * c) * a = a.
  (c * a) * c = c.
  (x * x = x & y * y = y) -> x * y = y * x.
end_of_list.

formulas(goals).
  b = c.
end_of_list.
`)
};

export const MACE4_EXAMPLES = {
  "Left regular band (counterexample)": src(`
% A band that is left regular (x * y * x = x * y) but not right regular (x * y * x = y * x).
assign(domain_size, 3).

formulas(assumptions).
  (x * y) * z = x * (y * z).
  x * x = x.
  x * (y * x) = x * y.
end_of_list.

formulas(goals).
  x * (y * x) = y * x.
end_of_list.
`),
  "Brandt semigroup B_2 (order 5)": src(`
% B_2 = <a, b | aba = a, bab = b, a^2 = b^2 = 0>. The last assumption says a and b generate.
assign(domain_size, 5).

formulas(assumptions).
  (x * y) * z = x * (y * z).
  0 * x = 0.
  x * 0 = 0.
  (a * b) * a = a.
  (b * a) * b = b.
  a * a = 0.
  b * b = 0.
  a != 0.
  x = a | x = b | x = a * b | x = b * a | x = 0.
end_of_list.
`),
  "Non-abelian group of order 6": src(`
% Is every group of order 6 commutative? Mace4 looks for a counterexample.
assign(domain_size, 6).

formulas(assumptions).
  (x * y) * z = x * (y * z).
  e * x = x.
  x * e = x.
  i(x) * x = e.
  x * i(x) = e.
end_of_list.

formulas(goals).
  x * y = y * x.
end_of_list.
`)
};

export const LEAN_EXAMPLES = {
  "Product of commuting idempotents": src(`
import Mathlib

def IsIdem {S : Type*} [Semigroup S] (e : S) : Prop :=
  e * e = e

theorem mul_idempotent {S : Type*} [CommSemigroup S] (e f : S)
    (he : IsIdem e) (hf : IsIdem f) :
    IsIdem (e * f) := by
  unfold IsIdem at *
  calc (e * f) * (e * f) = (e * e) * (f * f) := mul_mul_mul_comm e f e f
       _                 = e * f             := by rw [he, hf]
`),
  "Group identity uniqueness": src(`
import Mathlib

-- In any group, a left identity is the identity.
theorem group_id_unique {G : Type*} [Group G] (e : G) (h : ∀ x : G, e * x = x) :
    e = 1 := by
  calc e = e * 1 := (mul_one e).symm
       _ = 1     := h 1
`),
  "Computations (#eval, #check)": src(`
import Mathlib

#eval 2^64 - 1
#eval (List.range 10).map (fun n => n * n)
#check Semigroup
#check CommSemigroup
`)
};

export const TOOLS = {
  gap:     { label: "GAP",     title: "GAP code",      ext: "g",    examples: GAP_EXAMPLES,     codeKey: "gap.code" },
  prover9: { label: "Prover9", title: "Prover9 input", ext: "in",   examples: PROVER9_EXAMPLES, codeKey: "gap.code.prover9" },
  mace4:   { label: "Mace4",   title: "Mace4 input",   ext: "in",   examples: MACE4_EXAMPLES,   codeKey: "gap.code.mace4" },
  lean:    { label: "Lean 4",  title: "Lean 4 code",   ext: "lean", examples: LEAN_EXAMPLES,    codeKey: "gap.code.lean" }
};
