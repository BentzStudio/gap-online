# GAP Playground

A free, serverless online playground for [GAP](https://www.gap-system.org/) (Groups, Algorithms, Programming), [Prover9](https://prover9.org/), [Mace4](https://prover9.org/), and [Lean 4](https://lean-lang.org/) with [Mathlib 4](https://leanprover-community.github.io/mathlib4_docs/). Write code in the browser, run it on GitHub Actions runners, and view results in raw text or typeset LaTeX.

**Live site:** `https://gap-online.pages.dev/`

## Features

- **Multi-Engine Support**: 
  - **GAP**: Computations in algebra, group theory, semigroup theory, and combinatorics.
  - **Prover9**: Automated first-order theorem proving.
  - **Mace4**: Finite model and counterexample search.
  - **Lean 4 + Mathlib 4**: Interactive formal theorem proving with the complete community mathematics library.
- **LaTeX Math Rendering**: Automatic translation of GAP cycles, matrices, fractions, and group expressions to LaTeX with KaTeX, plus support for `$…$` and `$$…$$` math and `Tex(obj)` display formulas.
- **Light & Dark Mode**: One-click theme toggle with automatic system preference detection and localStorage persistence.
- **Zero-Dependency Frontend**: Pure, single-file HTML, CSS, and vanilla JavaScript using CDN-hosted KaTeX and JSZip. No build tools or node_modules needed for hosting.
- **Automated Caching**: Pre-configured GitHub Actions workflow compiling and caching LADR-2026 binaries, Semigroups kernel modules, and Mathlib oleans for fast runs.
- **Dual-Channel Output Fetching**: Downloads results directly from artifact zips with automatic fallback to Check Run annotations.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | The complete application: editor, output, settings, themes |
| `.github/workflows/run_gap.yml` | GitHub Actions workflow executing GAP, Prover9, Mace4, and Lean 4 |

## Setup

1. Put `index.html` and `.github/workflows/run_gap.yml` in a GitHub repository on your default branch (`main`).
2. Enable **GitHub Actions** under repository Settings.
3. Turn on **Settings → Pages** (deploy from branch) or link to Cloudflare Pages.
4. Generate a **fine-grained personal access token** limited to this repository with:
   - **Contents**: Read and write (to dispatch run events)
   - **Actions**: Read-only (to download output artifacts)
   - **Checks**: Read-only (backup output channel)
5. Open the playground, expand **Connection settings**, enter `owner/repo` and your token, then click **Save settings** (stored only in your browser's local storage).

## Usage

- Press **Run** or `Ctrl/⌘ + Enter` to execute.
- Switch the tool dropdown between **GAP**, **Prover9**, **Mace4**, and **Lean 4**.
- In GAP, load packages with `LoadPackage("semigroups");`. A statement ending in `;` displays its value; ending with `;;` hides it.
- In Lean 4, import any module from Mathlib (e.g. `import Mathlib.Algebra.Group.Basic`, `import Mathlib.Tactic`).
- Toggle between **Light mode** and **Dark mode** using the theme button in the header.

## Documentation & Tools

- **GAP**: [Tutorial](https://docs.gap-system.org/doc/tut/chap0_mj.html), [Reference Manual](https://docs.gap-system.org/doc/ref/chap0_mj.html), [Semigroups Manual](https://docs.gap-system.org/pkg/semigroups/doc/chap0.html), and [gap-system.org](https://www.gap-system.org/)
- **Prover9 & Mace4**: [Documentation and manual](https://prover9.org/)
- **Lean 4 & Mathlib**: [Lean 4 Documentation](https://lean-lang.org/) and [Mathlib 4 Docs](https://leanprover-community.github.io/mathlib4_docs/)

## Credits

Designed and maintained by PY. Made for WB, with love. Built on [GAP](https://www.gap-system.org/), [KaTeX](https://katex.org/), [JSZip](https://stuk.github.io/jszip/), [LADR-2026](https://prover9.org/), and [Lean 4 / Mathlib](https://lean-lang.org/).