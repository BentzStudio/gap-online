# GAP Playground

A free, serverless online playground for [GAP](https://www.gap-system.org/) (Groups, Algorithms, Programming), [Prover9](https://prover9.org/), [Mace4](https://prover9.org/), and [Lean 4](https://lean-lang.org/) with [Mathlib 4](https://leanprover-community.github.io/mathlib4_docs/). Write code in the browser, run it on GitHub Actions runners, and view results in raw text or typeset LaTeX.

**Live site:** `https://gap-online.pages.dev/`

## Features

- **Multi-Engine Support**: 
  - **GAP**: Computations in algebra, group theory, semigroup theory, and combinatorics (with the compiled `semigroups` package).
  - **Prover9**: Automated first-order theorem proving.
  - **Mace4**: Finite model and counterexample search.
  - **Lean 4 + Mathlib 4**: Interactive formal theorem proving with the complete community mathematics library.
- **Rich Semigroup Presets**:
  - Green's $\mathcal{D}$-classes and egg-box coordinate analysis in transformation monoids ($T_4$).
  - Symmetric inverse monoids ($\mathcal{IS}_4$) and maximal subsemigroups.
  - Left-regular band countermodel searches in Mace4.
  - Formal inverse pair definitions in Lean 4.
- **URL Permalink Sharing**: Click **🔗 Share** to copy a direct link encoding your exact code and tool in the URL hash for easy collaboration.
- **Run History**: Switch between your last 5 runs with code and outputs saved locally in `localStorage`.
- **Output Clipboard Copy**: One-click **📋 Copy** to transfer proof trees, Cayley tables, or LaTeX output directly into papers or Overleaf.
- **LaTeX Math Rendering**: Automatic translation of GAP cycles, matrices, fractions, and group expressions to LaTeX with KaTeX, plus support for `$…$` and `$$…$$` math and `Tex(obj)` display formulas.
- **Light & Dark Mode**: One-click theme toggle with automatic system preference detection and localStorage persistence.
- **Zero-Dependency Frontend**: Pure, single-file HTML, CSS, and vanilla JavaScript using CDN-hosted KaTeX and JSZip. No build tools or node_modules needed for hosting.
- **Automated Caching**: Pre-configured GitHub Actions workflow compiling and caching LADR-2026 binaries, Semigroups kernel modules, and Mathlib oleans for fast runs.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | The complete application: editor, output, settings, themes |
| `.github/workflows/run_gap.yml` | GitHub Actions workflow executing GAP, Prover9, Mace4, and Lean 4 |

## Setup & Collaboration

1. Put `index.html` and `.github/workflows/run_gap.yml` in a GitHub repository on your default branch (`main`).
2. Enable **GitHub Actions** under repository Settings.
3. Turn on **Settings → Pages** (deploy from branch) or link to Cloudflare Pages.
4. Generate a **fine-grained personal access token** limited to this repository with:
   - **Contents**: Read and write (to dispatch run events)
   - **Actions**: Read-only (to download output artifacts)
   - **Checks**: Read-only (backup output channel)
5. Open the playground, expand **Connection settings**, enter `owner/repo` and your token, then click **Save settings**.

## Guide for Mathematicians & Collaborators: Using Your Own GitHub Token

If you are a mathematician, collaborator, or student using this playground, you do **not** need to install GAP, Prover9, Mace4, or Lean 4 locally. Every calculation and formal proof runs on GitHub's cloud compute runners.

Because GitHub powers these runs, GitHub requires users to authenticate with a free GitHub account and a **Personal Access Token (PAT)**. This confirms who is dispatching the job and ensures secure access.

### Two Ways to Connect

#### Option 1: Running on the Shared Repository (`fraubentz/gap-online`)
If you are collaborating with PY (like WB):
1. Share your GitHub username with PY so they can invite you as a collaborator on GitHub (**Settings → Collaborators → Add people**).
2. Open your email or GitHub notifications and click **Accept invitation**.
3. Generate your own fine-grained token targeting `fraubentz/gap-online` (see the step-by-step instructions below).
4. In the playground under **Connection settings**, enter `fraubentz/gap-online` and paste your token. Click **Save settings**.

#### Option 2: Running Independently on Your Own Fork (No Invite Needed)
If you prefer complete independence or have heavy computational workloads:
1. Visit [github.com/fraubentz/gap-online](https://github.com/fraubentz/gap-online) and click **Fork** (top-right).
2. In your fork, ensure Actions are enabled (**Settings → Actions → General**).
3. Generate a personal access token selecting your fork (`your-username/gap-online`).
4. In the playground under **Connection settings**, enter `your-username/gap-online` and paste your token. Click **Save settings**.
5. Every free GitHub account receives **2,000 free Actions runner minutes every month**!

---

### Step-by-Step: Creating a GitHub Token in 60 Seconds

1. Sign in to your account at [github.com](https://github.com).
2. Open the [**Fine-grained Personal Access Tokens** settings page](https://github.com/settings/tokens?type=beta) (or go to your profile icon top-right → **Settings** → **Developer settings** at the bottom of the left sidebar → **Personal access tokens** → **Fine-grained tokens**).
3. Click **Generate new token**.
4. Configure the token details:
   - **Token name**: e.g., `GAP Playground`
   - **Expiration**: Choose 30, 60, 90 days, or a custom duration (GitHub emails a reminder before expiration).
   - **Repository access**: Select **Only select repositories**, then choose `fraubentz/gap-online` (if invited) or your fork (`your-username/gap-online`).
5. Under **Permissions → Repository permissions**, configure these 3 permissions:
   - **Contents**: change to **Access: Read and write** *(required to dispatch computations)*
   - **Actions**: change to **Access: Read-only** *(required to download results)*
   - **Checks**: change to **Access: Read-only** *(backup output channel)*
6. Scroll down and click **Generate token**.
7. Copy the generated token string (starts with `github_pat_...`).
8. Return to the GAP Playground, open **Connection settings**, verify the repository name, paste your token, and click **Save settings**. You are ready to compute!

---

### Security & Privacy Guarantee

- **Local Storage Only**: Your token is saved **exclusively in your own browser's localStorage**.
- **Direct API Calls**: Your browser communicates directly and securely with `https://api.github.com`.
- **Zero Token Leakage**: The token is never transmitted to PY, AI Studio, or any third-party server. Nobody else can ever see or access your token.

## Documentation & Tools

- **GAP**: [Tutorial](https://docs.gap-system.org/doc/tut/chap0_mj.html), [Reference Manual](https://docs.gap-system.org/doc/ref/chap0_mj.html), [Semigroups Manual](https://docs.gap-system.org/pkg/semigroups/doc/chap0.html), and [gap-system.org](https://www.gap-system.org/)
- **Prover9 & Mace4**: [Documentation and manual](https://prover9.org/)
- **Lean 4 & Mathlib**: [Lean 4 Documentation](https://lean-lang.org/) and [Mathlib 4 Docs](https://leanprover-community.github.io/mathlib4_docs/)

## Credits

Designed and maintained by PY. Made for WB, with love. Built on [GAP](https://www.gap-system.org/), [KaTeX](https://katex.org/), [JSZip](https://stuk.github.io/jszip/), [LADR-2026](https://prover9.org/), and [Lean 4 / Mathlib](https://lean-lang.org/).