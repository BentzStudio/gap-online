# GAP & Mathematical Provers Playground

A free, serverless, privacy-preserving computational laboratory for [GAP](https://www.gap-system.org/) (Groups, Algorithms, Programming), [Prover9](https://prover9.org/), [Mace4](https://prover9.org/), and [Lean 4](https://lean-lang.org/) with [Mathlib 4](https://leanprover-community.github.io/mathlib4_docs/). Write code in your browser, dispatch runs to isolated cloud runners, and view output in high-precision raw text or typeset LaTeX.

---

## Key Features

- **Four Computational Engines**:
  - **GAP 4.15.1**: Computational discrete algebra, group theory, representation theory, and semigroup theory (with pre-compiled `semigroups`, `digraphs`, `grape`, and `atlasrep`).
  - **Prover9 (LADR)**: Automated first-order theorem proving and equational reasoning.
  - **Mace4 (LADR)**: Finite model generation and counterexample search.
  - **Lean 4 + Mathlib 4**: Interactive formal theorem proving powered by the community `mathlib4` library and `elan` toolchain manager.
- **Run History (Up to 25 Runs)**:
  - Quickly browse, review, and reload past computations and outputs from your current browser session (stored locally in `localStorage`).
- **Continue in Local Prover**:
  - One-click script export with copy-ready native CLI commands (`gap`, `prover9`, `mace4`, `lake`) and zero-install Docker commands (`ghcr.io/gap-system/gap:4.15.1-full`, `leanprover/lean4`).
- **Scour arXiv & GitHub Public Repos**:
  - Automatically extracts recognized mathematical concepts (e.g. *Alternating Group*, *Structure Description*, *Conjugacy Classes*, *Green's Relations*, *Mathlib*) into clean, natural multi-word phrases.
  - Live preprints preview via the built-in server proxy `/api/arxiv` with automatic fallback to OpenAlex and 1-click deep links to arXiv Mathematics, zbMATH Open, Google Scholar, and GitHub theorem code.
- **Privacy & Presentation / Classroom Mode**:
  - One-click toggle masks repository names and credentials on screen during classroom lectures, recordings, or screen-sharing sessions.
  - Personal Access Tokens reside strictly in your client browser's `localStorage` and communicate directly with GitHub's HTTPS API. No server-side databases or analytics trackers.
- **Tasteful Colophon & Author's Note**:
  - A traditional mathematical colophon documenting the engines, typesetting standards (KaTeX), security guarantees, and carbon-reduction design.
  - Dedicated slot for the maintainer's personal note to students, collaborators, and researchers.
- **Power-Saving OLED Black, Retro Terminal & Display Themes**:
  - Pure `#000000` OLED Black theme reduces display power draw on modern laptop screens, OLED monitors, and mobile devices.
  - High-contrast Retro-SciFi Terminal (Phosphor Green) and Cyber Amber (DEC VT220) modes with zero-runtime-cost CSS scanlines.
  - Clean Light and Slate Dark modes.
- **URL Permalink Sharing**:
  - Click **🔗 Share** to copy a direct link encoding your exact code and tool choice in the URL fragment for zero-friction collaboration.

---

## For Semigroup Theorists

- **Mace4 model viewer**: finite models appear as colored multiplication tables with detected properties (commutative, monoid, band, regular, inverse, group, zero...). *Send to GAP* rebuilds the model as a semigroup.
- **Prove / Refute**: one click runs Prover9, then Mace4 on the same input if there is no proof. Axiom sets (semigroup, band, inverse, nilpotent, ...) can be inserted from the editor.
- **Diagrams**: any Graphviz DOT in the output is drawn as SVG. In GAP, `Dot(x)`, `DotDClassOrder(S)` and `DotCayley(S)` print DOT.
- **GAP notebook**: split code into cells; each run replays the cells in order within one session.
- **Export .tex** and **BibTeX** buttons for results and papers.

---

## Repository Files

| File | Purpose |
| --- | --- |
| `index.html` | Page markup, modals, KaTeX & JSZip CDN dependencies |
| `src/main.js` | App wiring: tools, settings, history, GitHub Actions dispatch, output views |
| `src/styles.css` | Styling, themes (Light, Dark, OLED, Terminal, Amber) and CRT scanlines |
| `src/examples.js` | Example programs and the `TOOLS` table |
| `src/axioms.js` | Semigroup axiom sets for Prover9 / Mace4 |
| `src/mace4.js` | Mace4 model parser, property analysis, multiplication tables, GAP export, prove/refute verdict |
| `src/dot.js` | Graphviz DOT detection and lazy-loaded Viz.js rendering |
| `src/notebook.js` | GAP notebook cells (replayed as one session) |
| `src/texexport.js` | Export code + output as a `.tex` document |
| `src/latex.js` | GAP-output to LaTeX conversion |
| `src/scour.js`, `src/concepts.js`, `src/bibtex.js` | Research modal, concept detection, BibTeX |
| `src/logos.js`, `src/logos-data.js`, `src/util.js` | Emblem picker and shared helpers |
| `server.js`, `vite.config.js`, `worker.js`, `wrangler.toml`, `functions/api/arxiv.js` | Hosting and the `/api/arxiv` proxy |
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
2. Under **Settings → Actions → General**, ensure Actions are enabled on your fork.
3. Generate a personal access token selecting your fork.
4. Enter `your-username/repo-name` and your token in the playground settings.