const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const BASE_URL = "https://linqdfe.com.br";
const EXCLUDE = new Set([
  "quadrilha.html",
  "filiadas.html",
  "noticia.html",
  "portal.html",
  "portal-dashboard.html",
]);

function insertBeforeHeadClose(html, snippet) {
  const headClose = /<\/head>/i;
  if (!headClose.test(html)) return html;
  return html.replace(headClose, `${snippet}\n\n</head>`);
}

function replaceOrInsert(html, pattern, replacement) {
  if (pattern.test(html)) {
    return html.replace(pattern, replacement);
  }
  return insertBeforeHeadClose(html, replacement);
}

function updateFile(filePath, canonical) {
  let html = fs.readFileSync(filePath, "utf8");

  html = replaceOrInsert(
    html,
    /<link\s+rel="canonical"[^>]*>/i,
    `<link rel="canonical" href="${canonical}">`
  );
  html = replaceOrInsert(
    html,
    /<meta\s+property="og:url"[^>]*>/i,
    `<meta property="og:url" content="${canonical}">`
  );

  fs.writeFileSync(filePath, html, "utf8");
}

function main() {
  const files = fs
    .readdirSync(ROOT, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".html"))
    .map((entry) => entry.name)
    .filter((name) => !EXCLUDE.has(name));

  files.forEach((name) => {
    const canonical = name === "index.html" ? `${BASE_URL}/` : `${BASE_URL}/${name}`;
    updateFile(path.join(ROOT, name), canonical);
  });

  console.log(`Updated canonicals for ${files.length} root pages.`);
}

main();
