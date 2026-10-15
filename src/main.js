import { $, store, sleep, toBase64, copyText, openModal, closeModal, escapeHtml } from "./util.js";
import { TOOLS } from "./examples.js";
import { latexify } from "./latex.js";
import { initScour } from "./scour.js";
import { initLogos, renderGallery } from "./logos.js";
import { parseMace4Models, analyseModel, modelTableHtml, modelToGap, splitRefuteOutput } from "./mace4.js";
import { renderDotBlocks } from "./dot.js";
import { buildTex, downloadText } from "./texexport.js";
import { AXIOM_SETS, withAxioms } from "./axioms.js";
import { notebook } from "./notebook.js";
import { initGutter } from "./gutter.js";

/* ---- Theme support (Dark / OLED Black / Retro Terminal / Cyber Amber / Light) ---- */
function applyTheme(theme) {
  if (["light", "oled", "terminal", "amber"].includes(theme)) {
    document.documentElement.setAttribute("data-theme", theme);
  } else {
    document.documentElement.removeAttribute("data-theme");
  }
  store.set("gap.theme", theme);
  $("themeSelect").value = theme;
}
let currentTheme = store.get("gap.theme");
if (!currentTheme) {
  currentTheme = window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}
applyTheme(currentTheme);
$("themeSelect").onchange = e => applyTheme(e.target.value);

/* ---- Mobile Tab Switching ---- */
const editorPanel = $("editorPanel");
const outputPanel = $("outputPanel");
const tabBtnEditor = $("tabBtnEditor");
const tabBtnOutput = $("tabBtnOutput");

function showPanel(target) {
  const isEditor = target === "editor";
  editorPanel.classList.toggle("mobile-hidden", !isEditor);
  outputPanel.classList.toggle("mobile-hidden", isEditor);
  for (const [btn, on] of [[tabBtnEditor, isEditor], [tabBtnOutput, !isEditor]]) {
    btn.classList.toggle("active", on);
    btn.setAttribute("aria-selected", String(on));
  }
}
tabBtnEditor.onclick = () => showPanel("editor");
tabBtnOutput.onclick = () => showPanel("output");


/* ---- Privacy & Repo Configuration ---- */
// Stored in localStorage only. No hardcoded personal repository link exposed on website!
let cfg = {
  repo: store.get("gap.repo") || "",
  token: store.get("gap.token") || "",
  mask: store.get("gap.mask") === "true"
};
let lastOutput = null, lastTool = "gap", busy = false;

// Auto-detect only if hosted under custom github.io page and repo is not set
if (!cfg.repo && /\.github\.io$/.test(location.hostname)) {
  const repoName = location.pathname.split("/")[1];
  if (repoName) cfg.repo = location.hostname.replace(".github.io", "") + "/" + repoName;
}

$("repo").value = cfg.repo;
$("token").value = cfg.token;
$("maskMode").checked = cfg.mask;

function applyMaskMode() {
  const isMasked = $("maskMode").checked;
  store.set("gap.mask", isMasked ? "true" : "false");
  $("repo").type = isMasked ? "password" : "text";
  $("toggleMaskBtn").textContent = isMasked ? "🙈" : "👁️";
  $("toggleMaskBtn").title = isMasked ? "Currently masked (Click to reveal)" : "Click to mask";
}
applyMaskMode();

$("maskMode").onchange = applyMaskMode;
$("toggleMaskBtn").onclick = () => {
  $("repo").type = $("repo").type === "password" ? "text" : "password";
  $("toggleMaskBtn").textContent = $("repo").type === "password" ? "🙈" : "👁️";
};

if (!cfg.token || !cfg.repo) {
  $("settings").open = true;
}

$("settingsForm").onsubmit = e => {
  e.preventDefault();
  cfg = {
    repo: $("repo").value.trim(),
    token: $("token").value.trim(),
    mask: $("maskMode").checked
  };
  store.set("gap.repo", cfg.repo);
  store.set("gap.token", cfg.token);
  store.set("gap.mask", cfg.mask ? "true" : "false");
  setStatus("Settings saved locally.", "ok");
  $("settings").open = false;
};

// Tool state & permalink
function loadFromHash() {
  const hash = location.hash.slice(1);
  if (!hash) return false;
  try {
    const params = new URLSearchParams(hash);
    const t = params.get("tool");
    const c = params.get("code");
    if (t && TOOLS[t]) {
      tool = t;
      store.set("gap.tool", tool);
      if (c !== null) {
        store.set(TOOLS[tool].codeKey, c);
        return true;
      }
    }
  } catch (e) {}
  return false;
}

let tool = TOOLS[store.get("gap.tool")] ? store.get("gap.tool") : "gap";
loadFromHash();

function applyTool() {
  const t = TOOLS[tool], names = Object.keys(t.examples), sel = $("examples");
  $("tool").value = tool;
  $("edTitle").textContent = t.title;
  $("code").setAttribute("aria-label", t.title + " editor");
  sel.length = 0;
  for (const name of names) sel.add(new Option(name, name));
  $("code").value = store.get(t.codeKey) || t.examples[names[0]];
  const ladr = tool === "prover9" || tool === "mace4";
  $("axiomSel").hidden = !ladr;
  $("refuteBtn").hidden = !ladr;
  $("notebookBtn").hidden = tool !== "gap";
  if (tool !== "gap" && notebook.isOn()) { $("code").value = notebook.joined(); notebook.setOn(false); }
  if (ladr && $("axiomSel").length === 0) {
    $("axiomSel").add(new Option("＋ Axioms…", ""));
    for (const name of Object.keys(AXIOM_SETS)) $("axiomSel").add(new Option(name, name));
  }
}
applyTool();
$("tool").onchange = () => { tool = $("tool").value; store.set("gap.tool", tool); applyTool(); };
$("examples").onchange = () => {
  $("code").value = TOOLS[tool].examples[$("examples").value];
  store.set(TOOLS[tool].codeKey, $("code").value);
};
$("code").addEventListener("input", () => store.set(TOOLS[tool].codeKey, $("code").value));

// Share Link button
$("shareBtn").onclick = () => {
  const params = new URLSearchParams({ tool, code: $("code").value });
  const shareUrl = location.origin + location.pathname + "#" + params.toString();
  copyText(shareUrl, $("shareBtn")).catch(() => prompt("Copy share link:", shareUrl));
};

// Copy Output button
$("copyOutBtn").onclick = () => { if (lastOutput) copyText(lastOutput, $("copyOutBtn")); };

/* ---- Run History (last 25 runs) ---- */
function getHistory() {
  try { return JSON.parse(store.get("gap.history") || "[]"); } catch { return []; }
}
function saveHistoryItem(item) {
  item.out = item.out.length > 60000 ? item.out.slice(0, 60000) + "\n[output truncated in history]" : item.out;
  const h = getHistory();
  h.unshift(item);
  while (h.length > 25) h.pop();
  store.set("gap.history", JSON.stringify(h));
  updateHistoryDropdown();
}
function updateHistoryDropdown() {
  const h = getHistory();
  const sel = $("historySel");
  sel.length = 0;
  sel.add(new Option(`History (${h.length})`, ""));
  h.forEach((item, idx) => {
    const time = new Date(item.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const label = `#${idx + 1} [${TOOLS[item.tool] ? TOOLS[item.tool].label : item.tool}] ${item.desc} (${time})`;
    sel.add(new Option(label, String(idx)));
  });
}
updateHistoryDropdown();
$("historySel").onchange = () => {
  const val = $("historySel").value;
  if (val === "") return;
  const h = getHistory();
  const item = h[parseInt(val, 10)];
  if (item) {
    if (item.tool && TOOLS[item.tool]) {
      tool = item.tool;
      store.set("gap.tool", tool);
      applyTool();
    }
    $("code").value = item.code;
    store.set(TOOLS[tool].codeKey, item.code);
    lastOutput = item.out;
    lastTool = item.tool;
    render();
    setStatus(`Loaded run #${parseInt(val, 10) + 1} from ${new Date(item.ts).toLocaleTimeString()}.`, "ok");
    showPanel("output");
  }
};

let lastErrorDetails = null;

/** Errors worth reporting (runner failures, timeouts, unreadable output); everything else is a user/setup mistake. */
class ReportableError extends Error {}

/** Remove the repository name and any GitHub links so nothing private reaches a public issue. */
function scrubMessage(msg) {
  let out = String(msg);
  if (cfg.repo) out = out.split(cfg.repo).join("[repository]");
  return out.replace(/https?:\/\/(?:api\.)?github\.com\/\S+/gi, "[GitHub link removed]");
}

function setStatus(msg, kind = "", { reportable = false } = {}) {
  const s = $("status");
  const textEl = $("statusText");
  const reportBtn = $("reportErrorBtn");

  if (textEl) {
    textEl.textContent = msg;
  } else {
    s.textContent = msg;
  }
  s.className = kind;

  if (reportBtn) {
    if (kind === "err" && reportable) {
      lastErrorDetails = { message: scrubMessage(msg), tool, time: new Date().toLocaleString() };
      reportBtn.style.display = "inline-flex";
    } else {
      reportBtn.style.display = "none";
    }
  }
}

function gh(path, opts = {}) {
  return fetch("https://api.github.com/repos/" + cfg.repo + path, {
    ...opts,
    headers: {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      Authorization: "Bearer " + cfg.token,
      ...(opts.headers || {})
    }
  });
}
async function ghJson(path) {
  const r = await gh(path);
  if (!r.ok) throw new Error("GitHub API " + r.status + " on " + path.split("?")[0]);
  return r.json();
}


function render() {
  const gapOutput = lastTool === "gap";
  const out = $("out"), latex = gapOutput && document.querySelector('input[name=fmt]:checked').value === "latex";
  $("fmtset").disabled = !gapOutput;
  $("fmtset").title = gapOutput ? "" : "LaTeX typesetting is only available for GAP output";
  if (lastOutput === null) { $("extras").replaceChildren(); return; }
  out.className = latex ? "latex" : "";
  out.textContent = lastOutput.trim() ? (latex ? latexify(lastOutput) : lastOutput) : "(no output)";
  if (latex && window.renderMathInElement) {
    renderMathInElement(out, {
      delimiters: [
        { left: "$$", right: "$$", display: true }, { left: "\\[", right: "\\]", display: true },
        { left: "\\(", right: "\\)", display: false }, { left: "$", right: "$", display: false }
      ],
      throwOnError: false, ignoredTags: ["script", "noscript", "style", "textarea"]
    });
  }
  renderExtras();
}
document.querySelectorAll("input[name=fmt]").forEach(el => el.addEventListener("change", render));

/* ---- Rich views below the raw output: verdicts, Mace4 models, graph diagrams ---- */
function sendToGap(code) {
  const key = TOOLS.gap.codeKey;
  tool = "gap"; store.set("gap.tool", "gap");
  if (notebook.isOn()) { applyTool(); notebook.addCell(code); }
  else {
    const existing = (store.get(key) || "").trim();
    store.set(key, (existing ? existing + "\n\n" : "") + code);
    applyTool();
  }
  showPanel("editor");
  setStatus("Model sent to the GAP editor. Press Run to analyse it.", "ok");
}

function renderExtras() {
  const ex = $("extras");
  ex.replaceChildren();
  if (lastOutput === null) return;
  const refute = splitRefuteOutput(lastOutput);
  if (refute) {
    const v = document.createElement("div");
    v.className = "verdict " + refute.verdict.kind;
    v.textContent = refute.verdict.text;
    ex.appendChild(v);
  }
  const modelText = refute ? refute.mace : lastOutput;
  const models = /interpretation\(/.test(modelText) ? parseMace4Models(modelText) : [];
  models.slice(0, 5).forEach((m, idx) => {
    const info = analyseModel(m);
    if (!info) return;
    const card = document.createElement("div");
    card.className = "model-card";
    const badges = info.props.map(([t, good]) => `<span class="badge ${good ? "good" : "neg"}">${escapeHtml(t)}</span>`).join("");
    card.innerHTML = `<div class="model-head"><strong>Model ${idx + 1}: order ${info.n}</strong>
      <span><button type="button" class="mini-btn" data-act="gap">→ Send to GAP</button>
      <button type="button" class="mini-btn" data-act="copy">Copy GAP code</button></span></div>
      <div class="badges">${badges}</div><div class="table-scroll">${modelTableHtml(m, info)}</div>`;
    const code = modelToGap(m, info, idx + 1);
    card.querySelector('[data-act="gap"]').onclick = () => sendToGap(code);
    card.querySelector('[data-act="copy"]').onclick = e => copyText(code, e.target);
    ex.appendChild(card);
  });
  if (models.length > 5) ex.insertAdjacentHTML("beforeend", `<div class="dot-status" style="margin:0 14px 10px">Showing the first 5 of ${models.length} models.</div>`);
  renderDotBlocks(lastOutput, ex);
}

async function findRun(title, since, onPoll) {
  const deadline = Date.now() + 90000;
  while (Date.now() < deadline) {
    if (onPoll) onPoll();
    const d = await ghJson("/actions/runs?event=repository_dispatch&per_page=30");
    const hit = d.workflow_runs.find(r => r.display_title === title && new Date(r.created_at) >= since);
    if (hit) return hit;
    await sleep(2500);
  }
  throw new Error("The workflow didn't start within 90 s. Check that .github/workflows/run_gap.yml is on the default branch and Actions is enabled.");
}

async function readArtifact(runId) {
  const list = await ghJson("/actions/runs/" + runId + "/artifacts");
  const art = list.artifacts.find(a => a.name === "gap-output");
  if (!art) throw new Error("no artifact");
  const r = await gh("/actions/artifacts/" + art.id + "/zip");
  if (!r.ok) throw new Error("artifact download " + r.status);
  const zip = await JSZip.loadAsync(await r.blob());
  return zip.file("output.txt").async("string");
}

async function readAnnotation(runId) {
  const jobs = await ghJson("/actions/runs/" + runId + "/jobs");
  for (const job of jobs.jobs) {
    const ann = await ghJson("/check-runs/" + job.id + "/annotations");
    const hit = ann.find(a => a.title === "GAP output");
    if (hit) return hit.message;
  }
  throw new Error("no annotation");
}

async function run(opts = {}) {
  if (busy) return;
  if (!cfg.repo || !cfg.token) {
    $("settings").open = true;
    setStatus("Add your repository and personal access token first.", "err");
    return;
  }
  const useNotebook = notebook.isOn() && tool === "gap";
  const code = useNotebook ? notebook.joined() : $("code").value;
  if (!code.trim()) { setStatus("The editor is empty. Write something first.", "err"); return; }
  const refute = opts.mode === "refute";
  const runTool = tool;                         // what the output is displayed as
  const dispatchTool = refute ? "refute" : tool; // what the workflow runs
  const toolLabel = refute ? "Prover9 + Mace4" : TOOLS[runTool].label;
  const sent = useNotebook ? notebook.compose(opts.upTo) : code;
  const code_b64 = toBase64(sent);
  if (code_b64.length > 60000) { setStatus("Code is too long (limit about 45 KB).", "err"); return; }

  busy = true; $("run").disabled = true;
  showPanel("output"); // Automatically switch view on mobile devices

  const runId = "r" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  const since = new Date(Date.now() - 60000), t0 = Date.now();
  const getElapsed = () => Math.round((Date.now() - t0) / 1000);

  try {
    setStatus("[1/4] Triggering workflow on GitHub Actions…", "running");
    const res = await gh("/dispatches", {
      method: "POST",
      body: JSON.stringify({
        event_type: "run_gap",
        client_payload: { run_id: runId, code_b64, tool: dispatchTool }
      })
    });
    if (res.status === 401) throw new Error("Token rejected (401). Check that the token hasn't expired.");
    if (res.status === 403 || res.status === 404) {
      throw new Error("Access denied (" + res.status + "). Check that your token has 'Contents: read & write' for " + ($("maskMode").checked ? "the target repository" : cfg.repo) + ".");
    }
    if (res.status !== 204) throw new ReportableError("Dispatch failed (" + res.status + ").");

    setStatus(`[2/4] Waiting for GitHub runner to spin up (${getElapsed()}s)…`, "running");
    const found = await findRun("GAP " + runId, since, () => {
      setStatus(`[2/4] Waiting for GitHub runner to spin up (${getElapsed()}s)…`, "running");
    });
    let run = found;
    while (run.status !== "completed") {
      if (Date.now() - t0 > 2400000) throw new ReportableError("Timed out after 40 minutes. Check the Actions tab of your repository.");
      const elapsed = getElapsed();
      if (run.status === "in_progress") {
        setStatus(`[3/4] Executing ${toolLabel} on cloud runner (${elapsed}s)…`, "running");
      } else {
        setStatus(`[2/4] Waiting in runner queue (${elapsed}s)…`, "running");
      }
      await sleep(3000);
      run = await ghJson("/actions/runs/" + found.id);
    }
    const elapsedAtDone = getElapsed();
    setStatus(`[4/4] Fetching & rendering output (${elapsedAtDone}s)…`, "running");
    let text;
    try { text = await readArtifact(run.id); }
    catch (e1) {
      try { text = await readAnnotation(run.id); }
      catch (e2) { throw new ReportableError("Run " + run.conclusion + ", but its output couldn't be read. Open the run: " + run.html_url); }
    }
    if (useNotebook) text = notebook.annotate(text);
    lastOutput = text; lastTool = runTool; render();
    const duration = getElapsed();
    if (run.conclusion && run.conclusion !== "success") {
      setStatus(`The runner finished with "${run.conclusion}", so the output above may be incomplete.`, "err", { reportable: true });
    } else {
      setStatus("Finished in " + duration + " s.", "ok");
    }

    saveHistoryItem({
      tool: runTool,
      code: code,
      desc: (refute ? "[prove/refute] " : "") + (code.trim().split("\n").find(l => l.trim() && !/^\s*[#%]/.test(l)) || code.trim().split("\n")[0]).replace(/^[%#\/\-\s]+/, "").slice(0, 30) || toolLabel,
      out: text,
      ts: Date.now(),
      dur: duration
    });
  } catch (e) {
    setStatus(e.message, "err", { reportable: e instanceof ReportableError });
  } finally {
    busy = false; $("run").disabled = false;
  }
}

/* ---- Feature 1: Continue Calculations Locally Modal ---- */
function getLocalFileDetails() {
  const code = $("code").value;
  const t = TOOLS[tool];
  let filename = "computation." + t.ext;
  if (tool === "lean") filename = "Theorem.lean";
  else if (tool === "prover9" || tool === "mace4") filename = "problem.in";

  let native = "";
  let docker = "";
  if (tool === "gap") {
    native = `gap -q ${filename}`;
    docker = `docker run --rm -it -v "$PWD":/work -w /work ghcr.io/gap-system/gap:4.15.1-full gap -q ${filename}`;
  } else if (tool === "prover9") {
    native = `prover9 -f ${filename} > proof.out`;
    docker = `docker run --rm -it -v "$PWD":/work -w /work ghcr.io/gap-system/gap:4.15.1-full prover9 -f ${filename}`;
  } else if (tool === "mace4") {
    native = `mace4 -c -f ${filename} > model.out`;
    docker = `docker run --rm -it -v "$PWD":/work -w /work ghcr.io/gap-system/gap:4.15.1-full mace4 -c -f ${filename}`;
  } else if (tool === "lean") {
    native = `lake env lean ${filename}`;
    docker = `docker run --rm -it -v "$PWD":/work -w /work leanprover/lean4:v4.15.0 lean ${filename}`;
  }
  return { filename, code, native, docker };
}

function openLocalModal() {
  const details = getLocalFileDetails();
  $("localFilename").textContent = details.filename;
  $("nativeCmd").textContent = details.native;
  $("dockerCmd").textContent = details.docker;
  openModal("localModal");
}
const closeLocalModal = () => closeModal("localModal");

$("localBtn").onclick = openLocalModal;
$("closeLocalModal").onclick = closeLocalModal;
$("dismissLocalModal").onclick = closeLocalModal;

$("downloadScriptBtn").onclick = () => {
  const details = getLocalFileDetails();
  const blob = new Blob([details.code], { type: "text/plain;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = details.filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(a.href);
};

function copyCodeText(targetId, btnId) { copyText($(targetId).textContent, $(btnId)); }
$("copyNativeCmd").onclick = () => copyCodeText("nativeCmd", "copyNativeCmd");
$("copyDockerCmd").onclick = () => copyCodeText("dockerCmd", "copyDockerCmd");



/* ---- Colophon, scour modal, emblem ---- */
initScour({ getTool: () => tool, getCode: () => $("code").value });
initLogos();
initGutter();
$("openColophonBtn").onclick = $("footerColophonBtn").onclick = () => { openModal("colophonModal"); renderGallery(); };
$("closeColophonModal").onclick = $("dismissColophonModal").onclick = () => closeModal("colophonModal");

function shareLink() {
  const code = notebook.isOn() && tool === "gap" ? notebook.joined() : $("code").value;
  return location.origin + location.pathname + "#" + new URLSearchParams({ tool, code }).toString();
}

/** Opt-in checkbox, created here so it needs no extra markup. */
function ensureShareOption() {
  let box = $("reportIncludeLink");
  if (box) return box;
  const label = document.createElement("label");
  label.className = "report-opt";
  label.style.cssText = "display:flex; gap:8px; align-items:flex-start; margin:10px 0; font-size:.85rem;";
  label.innerHTML = '<input type="checkbox" id="reportIncludeLink"><span>Include a link to my current code. It becomes public in the GitHub issue, so leave it off for anything private.</span>';
  $("reportModalDetails").insertAdjacentElement("afterend", label);
  box = $("reportIncludeLink");
  box.addEventListener("change", updateReportLinks);
  return box;
}

function updateReportLinks() {
  if (!lastErrorDetails) return;
  const { message, tool: errTool, time } = lastErrorDetails;
  const toolName = TOOLS[errTool]?.label || errTool.toUpperCase();
  const include = ensureShareOption().checked;

  let codeNote = "_Paste the code that triggered the error here, if you can share it._";
  let link = "";
  if (include) {
    link = shareLink();
    if (encodeURIComponent(link).length > 4000) {
      link = "";
      codeNote = "_The code was too long for a link. Please paste it here._";
    }
  }
  $("reportModalDetails").textContent =
    `Engine: ${toolName}\nTime: ${time}\nError: ${message}` + (link ? "\nShare link: (included)" : "");

  const title = encodeURIComponent(`[Run Error] ${toolName}: ${message.slice(0, 50)}`);
  const body = encodeURIComponent(
    `### Run Error Report\n\n- **Engine**: \`${toolName}\`\n- **Time**: \`${time}\`\n- **Error**: \`${message}\`\n` +
    (link ? `- **Share link**: ${link}\n` : "") +
    `\n### Code\n\n${codeNote}\n\n### What were you trying to do?\n\n`
  );
  $("githubIssueBtn").href = `https://github.com/BentzStudio/gap-online/issues/new?title=${title}&body=${body}`;
}

function openReportModal() {
  if (!lastErrorDetails) return;
  ensureShareOption().checked = false;
  updateReportLinks();
  openModal("reportModal");
}

// Email reporting was removed; hide the old button if the page markup still has it.
$("emailReportBtn")?.remove();

$("reportErrorBtn").onclick = openReportModal;
$("closeReportModal").onclick = $("dismissReportModal").onclick = () => closeModal("reportModal");

document.addEventListener("keydown", e => {
  if (e.key === "Escape") ["localModal", "scourModal", "colophonModal", "reportModal"].forEach(closeModal);
  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); run(); }
});

$("year").textContent = new Date().getFullYear();
$("run").onclick = () => run();
$("refuteBtn").onclick = () => run({ mode: "refute" });
notebook.onRun = upTo => run({ upTo });
$("notebookBtn").onclick = () => {
  if (notebook.isOn()) { $("code").value = notebook.joined(); store.set(TOOLS.gap.codeKey, $("code").value); notebook.setOn(false); }
  else notebook.setOn(true, $("code").value);
};
$("axiomSel").onchange = () => {
  const name = $("axiomSel").value;
  if (!name) return;
  $("code").value = withAxioms($("code").value, name);
  store.set(TOOLS[tool].codeKey, $("code").value);
  $("axiomSel").value = "";
};
$("texBtn").onclick = () => {
  if (lastOutput === null) { setStatus("Run something first; there is no output to export.", "err"); return; }
  const latexMode = lastTool === "gap" && document.querySelector("input[name=fmt]:checked").value === "latex";
  const code = notebook.isOn() && lastTool === "gap" ? notebook.joined() : $("code").value;
  downloadText("session.tex", buildTex({ toolLabel: TOOLS[lastTool]?.label || "Session", code, output: lastOutput, latexMode }), "application/x-tex");
};