# GAP & Mathematical Provers Playground

A free, serverless, privacy-preserving computational laboratory for [GAP](https://www.gap-system.org/) (Groups, Algorithms, Programming), [Prover9](https://prover9.org/), [Mace4](https://prover9.org/), and [Lean 4](https://lean-lang.org/) with [Mathlib 4](https://leanprover-community.github.io/mathlib4_docs/). Write code in your browser, dispatch runs to isolated cloud runners, and view output in high-precision raw text or typeset LaTeX.

---

## Key Features

- **Four Computational Engines**:
  - **GAP 4.15.1**: Computational discrete algebra, group theory, representation theory, and semigroup theory (with pre-compiled `semigroups`, `digraphs`, `grape`, and `atlasrep`).
  - **Prover9 (LADR)**: Automated first-order theorem proving and equational reasoning.
  - **Mace4 (LADR)**: Finite model generation and counterexample search.
  - **Lean 4 + Mathlib 4**: Interactive formal theorem proving powered by the community `mathlib4` library and `elan` toolchain manager.
- **Run History (Up to 10 Runs)**:
  - Quickly browse, review, and reload past computations and outputs from your current browser session (stored locally in `localStorage`).
- **Continue in Local Prover**:
  - One-click script export with copy-ready native CLI commands (`gap`, `prover9`, `mace4`, `lake`) and zero-install Docker commands (`ghcr.io/gap-system/gap:4.15.1-full`).
- **Scour arXiv & GitHub Public Repos**:
  - Automatically extracts recognized mathematical concepts (e.g. *Alternating Group*, *Structure Description*, *Conjugacy Classes*, *Green's Relations*, *Mathlib*) into clean, natural multi-word phrases.
  - Live preprints preview via the built-in server proxy `/api/arxiv` with automatic fallback to OpenAlex and 1-click deep links to arXiv Mathematics, zbMATH Open, Google Scholar, and GitHub theorem code.
- **Privacy & Presentation / Classroom Mode**:
  - One-click toggle masks repository names and credentials on screen during classroom lectures, recordings, or screen-sharing sessions.
  - Personal Access Tokens reside strictly in your client browser's `localStorage` and communicate directly with GitHub's HTTPS API. No server-side databases or analytics trackers.
- **Tasteful Colophon & Author's Note**:
  - A traditional mathematical colophon documenting the engines, typesetting standards (KaTeX), security guarantees, and carbon-reduction design.
  - Dedicated slot for the maintainer's personal note to students, collaborators, and researchers.
- **Power-Saving OLED Black & Dark Modes**:
  - Pure `#000000` OLED Black theme reduces display power draw on modern laptop screens, OLED monitors, and mobile devices.
- **URL Permalink Sharing**:
  - Click **🔗 Share** to copy a direct link encoding your exact code and tool choice in the URL fragment for zero-friction collaboration.

---

## For Semigroup Theorists

- **Mace4 model viewer**: finite models appear as colored multiplication tables with detected properties (commutative, monoid, band, regular, inverse, group, zero...). *Send to GAP* rebuilds the model as a semigroup.
- **Prove / Refute**: one click runs Prover9, then Mace4 on the same input if there is no proof. Axiom sets (semigroup, band, inverse, nilpotent, ...) can be inserted from the editor.
- **Diagrams**: any Graphviz DOT in the output is drawn as SVG. In GAP, `Dot(x)`, `DotDClassOrder(S)` and `DotCayley(S)` print DOT.
- **GAP notebook**: split code into cells; each run replays the cells in order within one session.
- **Export .tex** and **BibTeX** buttons for results and papers.

## Repository Files

| File | Purpose |
| --- | --- |
| `index.html` | Page markup only |
| `src/main.js` | App wiring: tools, settings, history, GitHub Actions dispatch, output views |
| `src/styles.css` | Styling and the Dark / OLED Black / Light themes |
| `src/examples.js` | Example programs and the `TOOLS` table |
| `src/axioms.js` | Semigroup axiom sets for Prover9 / Mace4 |
| `src/mace4.js` | Mace4 model parser, property analysis, multiplication tables, GAP export, prove/refute verdict |
| `src/dot.js` | Graphviz DOT detection and lazy-loaded Viz.js rendering |
| `src/notebook.js` | GAP notebook cells (replayed as one session) |
| `src/texexport.js` | Export code + output as a `.tex` document |
| `src/latex.js` | GAP-output to LaTeX conversion |
| `src/scour.js`, `src/concepts.js`, `src/bibtex.js` | Research modal, concept detection, BibTeX |
| `src/logos.js`, `src/logos-data.js`, `src/util.js` | Emblem picker and shared helpers |
| `server.js`, `vite.config.js`, `worker.js`, `wrangler.toml`, `arxiv.js` | Hosting and the `/api/arxiv` proxy |
| `.github/workflows/run_gap.yml` | Workflow running GAP, Prover9, Mace4, prove/refute and Lean 4 |

---

## Deployment & Hosting Options

### Option 1: Static Hosting (Cloudflare Pages, GitHub Pages)
You can deploy `index.html` as a purely static site:
- Direct API queries to GitHub Actions work completely client-side.
- If `/api/arxiv` is not hosted on a server, the frontend automatically falls back to the open, CORS-enabled **OpenAlex** research index and provides 1-click search links to arXiv, zbMATH Open, and Google Scholar.

### Option 2: Full-Stack Node.js (Render, Fly.io, Railway, Google Cloud Run)
Run the included production server:
```bash
npm install
npm run build
npm start
```
`server.js` serves the production build on port 3000 and handles the live `/api/arxiv` proxy with automatic Atom XML parsing and caching.

### Option 3: Local Development
```bash
npm install
npm run dev
```
Starts the Vite development server with hot-reload and the `/api/arxiv` proxy active.

---

## GitHub Actions Setup & Token Guide

### Two Connection Methods

#### Method A: Shared Department / Lab Repository
If you are collaborating with the repository owner:
1. Provide your GitHub username to the owner to receive a collaborator invite (**Settings → Collaborators**).
2. Accept the invitation.
3. Generate a fine-grained personal access token selecting that repository.
4. Enter the repository (`owner/repo`) and your token in **Connection settings**, then click **Save settings**.

#### Method B: Independent Fork (Zero Collaboration Needed)
1. Fork this repository to your own personal GitHub account.
2. In your fork, ensure Actions are enabled (**Settings → Actions → General**).
3. Generate a fine-grained token selecting your fork (`your-username/repo-name`).
4. Enter your fork name and token in **Connection settings**.
5. **Public vs. Private Repositories:** If your repository is **public**, standard GitHub-hosted Linux runners are **completely free and unlimited** (0 minute consumption)! The 2,000-minute monthly allotment only counts down when you run actions inside a private repository.

---

### Creating Your Token in 60 Seconds

1. Open GitHub's [**Fine-grained Personal Access Tokens** page](https://github.com/settings/tokens?type=beta).
2. Click **Generate new token**. Name it `Math Playground`.
3. Under **Repository access**, select **Only select repositories** and pick your repository.
4. Under **Permissions → Repository permissions**, configure:
   - **Contents**: `Access: Read and write` *(required to dispatch workflow runs)*
   - **Actions**: `Access: Read-only` *(required to retrieve calculation output)*
   - **Checks**: `Access: Read-only` *(backup result channel)*
5. Click **Generate token**, copy the string, and paste it into the playground's settings.

---

## Lean 4 & Mathlib 4 Toolchain Configuration

If you see an error such as:
> `error: no default toolchain configured. run elan default stable to install & configure the latest Lean 4 stable release.`

This indicates `elan` (the Lean version manager) needs an explicit default toolchain selected. In `.github/workflows/run_gap.yml`, this is automatically resolved:
1. `elan default leanprover/lean4:v4.15.0 2>/dev/null || elan default stable`
2. `elan override set leanprover/lean4:v4.15.0 2>/dev/null || elan override set stable`
3. A self-healing fallback checks the output file; if the error is detected, it runs `elan default stable` and re-executes.
4. The workflow utilizes `actions/cache@v4` on `~/.elan` and prebuilt Mathlib olean files, reducing subsequent Lean run times from minutes to seconds.

---

## Colophon & Maintainer's Note

The application features a built-in **Colophon & Architectural Notes** dialog (accessible from the header button or footer link). It documents:
- **Engines:** GAP 4.15.1, LADR Prover9 & Mace4, and Lean 4 / Mathlib 4.
- **Typesetting:** Real-time KaTeX LaTeX math rendering with auto-rendering of cycles, matrices, and expressions.
- **Privacy Guarantee:** Zero trackers, zero cookies, and client-only token storage.
- **Author's Dedication:** A personal note dedicated to WB: Built with love for my husband, using my coding knowledge alongside Claude and Gemini. A portable space for him to experience the joy of deep algebraic exploration, finite countermodel searches, and interactive theorem proving — right in the palm of his hand.

---

## Credits & License

Designed and maintained by PY. Dedicated to WB. Built on [GAP](https://www.gap-system.org/), [KaTeX](https://katex.org/), [JSZip](https://stuk.github.io/jszip/), [LADR-2026](https://prover9.org/), and [Lean 4 / Mathlib](https://lean-lang.org/).