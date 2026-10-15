const esc = s => String(s || "").replace(/([&%#])/g, "\\$1");

function bibAuthor(name) {
  name = name.trim();
  if (!name || name.includes(",")) return name;
  const i = name.lastIndexOf(" ");
  return i < 0 ? name : `${name.slice(i + 1)}, ${name.slice(0, i)}`;
}

/** BibTeX @misc entry for a paper result ({title, authors, published, id}). */
export function toBibtex(it) {
  const authors = (it.authors || "").split(",").map(bibAuthor).filter(Boolean);
  const last = (authors[0] || "anon").split(",")[0].toLowerCase().replace(/[^a-z0-9]/g, "") || "anon";
  const year = (it.published || "").slice(0, 4);
  const word = (it.title || "").toLowerCase().replace(/[^a-z0-9 ]/g, "").split(/\s+/).find(w => w.length > 3) || "paper";
  const lines = [`@misc{${last}${year}${word},`];
  if (authors.length) lines.push(`  author = {${authors.map(esc).join(" and ")}},`);
  lines.push(`  title = {{${esc(it.title)}}},`);
  if (year) lines.push(`  year = {${year}},`);
  const id = it.id || it.link || "";
  const ax = id.match(/arxiv\.org\/abs\/([^\s]+?)(?:v\d+)?$/i);
  if (ax) lines.push(`  eprint = {${ax[1]}},`, "  archivePrefix = {arXiv},");
  const doi = id.match(/doi\.org\/(10\.[^\s]+)/i);
  if (doi) lines.push(`  doi = {${doi[1]}},`);
  if (id) lines.push(`  url = {${id}},`);
  lines.push("}");
  return lines.join("\n");
}
