import { latexify } from "./latex.js";

const verbSafe = s => s.replace(/\\end\{Verbatim\}/g, "\\end {Verbatim}");

/** Build a standalone .tex file from the editor code and the last output. */
export function buildTex({ toolLabel, code, output, latexMode }) {
  const lines = (latexMode ? latexify(output) : output).replace(/\r/g, "").split("\n");
  const parts = [];
  let buf = [];
  const flush = () => {
    const t = buf.join("\n").replace(/\n+$/, "");
    if (t.trim()) parts.push(`\\begin{Verbatim}[fontsize=\\small,breaklines=true]\n${verbSafe(t)}\n\\end{Verbatim}`);
    buf = [];
  };
  for (const line of lines) {
    let m;
    if (latexMode && (m = line.match(/^\$\\displaystyle\s+([\s\S]*)\$$/) || line.match(/^\$\$([\s\S]+)\$\$$/))) {
      flush();
      parts.push(`\\[\n${m[1].trim()}\n\\]`);
    } else buf.push(line);
  }
  flush();

  return `\\documentclass[11pt]{article}
\\usepackage[T1]{fontenc}
\\usepackage{amsmath,amssymb}
\\usepackage{fvextra}
\\usepackage[margin=2.5cm]{geometry}
\\title{${toolLabel} session}
\\date{${new Date().toISOString().slice(0, 10)}}
\\begin{document}
\\maketitle

\\section*{Input}
\\begin{Verbatim}[fontsize=\\small,breaklines=true,numbers=left]
${verbSafe(code.replace(/\s+$/, ""))}
\\end{Verbatim}

\\section*{Output}
${parts.join("\n\n") || "(no output)"}

\\end{document}
`;
}

export function downloadText(filename, text, mime = "text/plain") {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([text], { type: mime }));
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
