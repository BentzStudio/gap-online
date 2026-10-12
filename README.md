# GAP Playground

A free, serverless online playground for [GAP](https://www.gap-system.org/) (Groups, Algorithms, Programming). Write GAP code in the browser, run it on GitHub Actions, and read the result on the page as raw text or typeset LaTeX.

**Live site:** `https://fraubentz.github.io/gap-online/`

## How it works

1. **Run** sends your code to the GitHub API as a `repository_dispatch` event.
2. The `run_gap.yml` workflow starts an Ubuntu runner and runs the code in the official full GAP image (`ghcr.io/gap-system/gap`), sandboxed with no network, a memory cap and a 120 s limit.
3. The output is uploaded as an artifact, and the page polls the API, downloads it and shows it. KaTeX typesets any maths in LaTeX mode.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | The whole front end: editor, output, settings |
| `.github/workflows/run_gap.yml` | Runs GAP and publishes the output |

## Setup

1. Put both files in a repository on the default branch.
2. Turn on **Settings → Pages** (deploy from the branch) and make sure **Actions** is enabled.
3. Create a **fine-grained personal access token** limited to this repository, with **Contents: Read and write** and **Actions: Read-only**.
4. Open the site, enter `owner/repo` and the token under **Connection settings**, and click **Save settings**. They are stored only in that browser's local storage.

## Usage

- Press **Run** or Ctrl/⌘ + Enter.
- GAP prints only what you tell it to, so use `Print(...)` or `Display(...)`.
- Load packages with `LoadPackage("semigroups");`.
- In LaTeX mode, text between `$...$` or `$$...$$` is typeset, and `Tex(obj)` prints an object as an equation.

## Notes

- The first run compiles the Semigroups package (several minutes), and the result is cached for later runs. GitHub deletes caches unused for 7 days, so an idle site may rebuild it once.
- To change the GAP version, edit `GAP_IMAGE` in `run_gap.yml`. The package is rebuilt on the next run.
- Anyone who runs code needs a token with write access to the repository, so the site is effectively private to you and your collaborators.
- Treat the token like a password. If it leaks, delete it in GitHub and create a new one.

## Credits

Designed and maintained by PY. Built on [GAP](https://www.gap-system.org/), [KaTeX](https://katex.org/) and [JSZip](https://stuk.github.io/jszip/).
