# GAP Playground

A free, serverless online playground for computational algebra and formal proof. Write code in the browser, run it on an isolated GitHub Actions runner, and read the result on the page as raw text or typeset LaTeX.

**Live site:** <https://gap-online.pages.dev/>

## Engines

| Engine | Purpose |
| --- | --- |
| **GAP 4.15.1** | Groups, Algorithms, Programming, with compiled `semigroups`, `digraphs`, `grape` and `atlasrep` |
| **Prover9** | Automated first-order and equational theorem proving (LADR) |
| **Mace4** | Finite model and counterexample search (LADR) |
| **Lean 4 + Mathlib 4** | Interactive theorem proving, installed with the `elan` toolchain manager |

## How it works

1. **Run** sends your code to the GitHub API as a `repository_dispatch` event.
2. A workflow starts a clean Ubuntu runner and runs the chosen engine in a sandbox.
3. The page polls the API, downloads the output and displays it.

Every run executes the whole editor script from top to bottom in a fresh sandbox, so results do not depend on earlier runs.

## Features

- **Output:** raw text or LaTeX typeset with KaTeX, including automatic conversion of GAP results (permutations, matrices, fractions, powers, groups). Copy the output or export code and output as a `.tex` document.
- **Sharing:** the **Share** button copies a link that encodes your code and tool in the URL fragment.
- **Run history:** the last 25 runs and their outputs are kept in your browser and can be reloaded.
- **Continue locally:** download the script and get the matching command-line or Docker command (`gap`, `prover9`, `mace4`, `lake`).
- **Literature search:** concepts detected in your code (for example *Green's relations*) feed searches on arXiv, zbMATH Open, Google Scholar and GitHub, with a live arXiv preview.
- **Themes:** Light, Dark (Slate), OLED Black, Retro Terminal, Cyber Amber, and Classic Nintendo Game Boy (DMG-01).
- **Editor gutter:** pixel-aligned line numbers with row synchronization and horizontal scroll clearance.
- **Error reporting:** if a runner failure or timeout occurs, a pre-filled issue report with scrubbed diagnostics can be opened directly on GitHub, automatically routed to your configured fork or upstream repository.
- **Presentation / Classroom mode:** masks the repository name and token on screen.
- **Colophon:** a short note on the engines, typesetting, security model and the maintainer's dedication.

## For semigroup theorists

- **Interactive Egg-Box Diagrams & Green's Relations:** finite models found by Mace4 include both a colored multiplication table and an interactive **Egg-Box diagram**. The app computes Green's $\mathcal{R}, \mathcal{L}, \mathcal{H}, \mathcal{D}$ equivalences, partitions each $\mathcal{D}$-class into its rows ($\mathcal{R}$-classes) and columns ($\mathcal{L}$-classes), flags regular $\mathcal{D}$-classes, and highlights group $\mathcal{H}$-classes with $\star$ (idempotents).
- **Semigroup Classifications:** automatic detection of orthodox semigroups, completely regular semigroups (unions of groups), Clifford semigroups (semilattices of groups), aperiodic/combinatorial semigroups, bands, semilattices, and inverse semigroups.
- **Quick Snippets Bar:** 1-click insertion of idiomatic semigroup code templates for GAP (`LoadPackage("semigroups");;`, `FullTransformationMonoid`, `SymmetricInverseMonoid`, `GreensDClasses`, `DotDClassOrder`), Prover9, Mace4, and Lean 4 Mathlib.
- **Expanded Axiom Sets:** pre-defined axiom sets for bands (left/right regular, rectangular), regular, orthodox, completely regular, Clifford and inverse semigroups, Brandt semigroups (completely 0-simple inverse semigroups, and $B_2$ by its presentation), null and nilpotent semigroups ($S^2=0$, $S^3=0$, $S^4=0$), and the relation $pq=e$ that defines the bicyclic monoid. Each set states in a comment what it does and does not describe.
- **Mace4 Model Viewer & Send to GAP:** convert any countermodel or finite magma into GAP code with 1 click (`SemigroupByMultiplicationTable`).
- **Prove / Refute:** one click runs Prover9 and, if no proof is found, Mace4 on the same input.
- **Diagrams:** Graphviz DOT in the output is drawn as SVG (e.g. `DotDClassOrder(S)` and `DotCayley(S)`).
- **GAP notebook:** split code into cells; each run replays them in order within one session.
- **Export:** LaTeX `.tex` export (with preloaded Green's relations macros $\mathcal{R}, \mathcal{L}, \mathcal{H}, \mathcal{D}, \mathcal{J}$) and BibTeX export for literature citations.

## Usage

- Press **Run** or Ctrl/⌘ + Enter.
- **GAP:** a statement ending in `;` shows its value and `;;` hides it, as at the GAP prompt. Load packages with `LoadPackage("semigroups");`. `Tex(obj)` prints an object as an equation. Runs stop after 120 seconds.
- **Prover9 / Mace4:** write `formulas(assumptions). ... end_of_list.` and `formulas(goals). ... end_of_list.` Use `assign(domain_size, 6).` to fix the size Mace4 searches.
- **Lean 4:** import modules such as `import Mathlib.Algebra.Group.Basic` or `import Mathlib.Tactic`, then use tactics, `#eval` and `#check`.

## Repository layout

| Path | Purpose |
| --- | --- |
| `index.html` | Page markup, dialogs, and the KaTeX and JSZip dependencies |
| `src/main.js` | Application logic: tools, settings, history, GitHub Actions dispatch, output views |
| `src/styles.css` | Styling and the six selectable themes |
| `src/examples.js`, `src/axioms.js` | Example programs and semigroup axiom sets |
| `src/mace4.js`, `src/dot.js`, `src/notebook.js` | Model viewer and prove/refute verdict, DOT rendering, GAP notebook |
| `src/latex.js`, `src/texexport.js`, `src/bibtex.js` | LaTeX conversion and export |
| `src/scour.js`, `src/concepts.js` | Literature search and concept detection |
| `src/logos.js`, `src/logos-data.js`, `src/util.js` | Emblem picker and shared helpers |
| `server.js`, `vite.config.js`, `worker.js`, `wrangler.toml`, `functions/api/` | Hosting and the `/api/arxiv` proxy |
| `.github/workflows/run_gap.yml` | Workflow that runs GAP, Prover9, Mace4 and Lean 4 |

## Deployment

**Cloudflare Pages (used by the live site).** The live site is deployed straight from this repository to Cloudflare Pages. Configuration lives in `wrangler.toml` and `functions/api/`, which provides the `/api/arxiv` proxy.

**Other static hosts (for example GitHub Pages).** Serve the output of `npm run build` as static files. Dispatching runs works entirely in the browser. Without the `/api/arxiv` proxy, the literature preview falls back to OpenAlex and offers direct search links.

**Node.js server (Render, Fly.io, Railway, Cloud Run).**

```
npm install
npm run build
npm start
```

`server.js` serves the build on port 3000 and provides the `/api/arxiv` proxy with caching.

**Local development.**

```
npm install
npm run dev
```

## Connecting to GitHub

Computations run in a repository you can write to, authorised by a **fine-grained personal access token** limited to that repository with:

- **Contents:** Read and write (sends the run request)
- **Actions:** Read-only (downloads the output)

Some accounts also offer **Checks: Read-only**, which enables an optional backup output channel. It is not required.

Enter `owner/repo` and the token under **Connection settings** and click **Save settings**. There are two ways to get access:

- **Shared repository.** Ask the owner to invite you as a collaborator (Settings → Collaborators), accept the invitation, and create a token for that repository.
- **Your own fork.** Fork this repository, enable Actions on the fork (Settings → Actions → General), and create a token for the fork.

In a **public** repository, GitHub-hosted Linux runners are free. A private repository counts against your monthly Actions minutes.

## Privacy and security

- The token stays in your browser's local storage and is sent only to GitHub's HTTPS API. There is no server-side database.
- Each run uses a clean runner that is discarded afterwards, and code runs sandboxed with a time limit.
- No analytics, ad trackers, telemetry or third-party cookies.
- Zero email scraping exposure: error reporting uses pre-formatted GitHub issues, automatically scrubbing tokens, repository identifiers, and sensitive credentials.
- Treat the token like a password. If it leaks, delete it in GitHub and create a new one.

## Notes

- The first run of each engine builds or downloads its dependencies (Semigroups, Prover9 and Mace4, Mathlib) and caches them, so it is slower. GitHub deletes caches unused for seven days, so an idle site may rebuild them once.
- To change the GAP version, edit the image tag in the workflow.

## Credits

Designed and maintained by PY. Dedicated to WB. Built on [GAP](https://www.gap-system.org/), [Prover9 and Mace4](https://prover9.org/), [Lean 4](https://lean-lang.org/), [Mathlib](https://leanprover-community.github.io/mathlib4_docs/) and [KaTeX](https://katex.org/).