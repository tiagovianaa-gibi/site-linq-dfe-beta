const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const DATA_FILE = path.join(ROOT, "data", "quadrilhas.json");
const QUADRILHA_DIR = path.join(ROOT, "quadrilha");
const BASE_URL = "https://linqdfe.com.br";

const MOJIBAKE_REPLACEMENTS = [
  ["\u00c3\u00a1", "\u00e1"],
  ["\u00c3\u00a0", "\u00e0"],
  ["\u00c3\u00a2", "\u00e2"],
  ["\u00c3\u00a3", "\u00e3"],
  ["\u00c3\u00a4", "\u00e4"],
  ["\u00c3\u00a7", "\u00e7"],
  ["\u00c3\u00a9", "\u00e9"],
  ["\u00c3\u00a8", "\u00e8"],
  ["\u00c3\u00aa", "\u00ea"],
  ["\u00c3\u00ad", "\u00ed"],
  ["\u00c3\u00af", "\u00ef"],
  ["\u00c3\u00b3", "\u00f3"],
  ["\u00c3\u00b4", "\u00f4"],
  ["\u00c3\u00b5", "\u00f5"],
  ["\u00c3\u00ba", "\u00fa"],
  ["\u00c3\u00bc", "\u00fc"],
  ["\u00c3\u0081", "\u00c1"],
  ["\u00c3\u0080", "\u00c0"],
  ["\u00c3\u0082", "\u00c2"],
  ["\u00c3\u0083", "\u00c3"],
  ["\u00c3\u0087", "\u00c7"],
  ["\u00c3\u0089", "\u00c9"],
  ["\u00c3\u008a", "\u00ca"],
  ["\u00c3\u008d", "\u00cd"],
  ["\u00c3\u0093", "\u00d3"],
  ["\u00c3\u0094", "\u00d4"],
  ["\u00c3\u0095", "\u00d5"],
  ["\u00c3\u009a", "\u00da"],
  ["\u00c3\u009c", "\u00dc"],
  ["\u00c2\u00a0", " "],
  ["\u00e2\u0080\u0093", "\u2013"],
  ["\u00e2\u0080\u0094", "\u2014"],
  ["\u00e2\u0080\u0098", "\u2018"],
  ["\u00e2\u0080\u0099", "\u2019"],
  ["\u00e2\u0080\u009c", "\u201c"],
  ["\u00e2\u0080\u009d", "\u201d"],
  ["\u00e2\u0080\u00a6", "\u2026"],
  ["\u00c2\u00ba", "\u00ba"],
  ["\u00c2\u00aa", "\u00aa"],
];

function fixMojibake(text) {
  if (!text) return "";
  if (!/[\u00c2\u00c3\u00e2]/.test(text)) return text;
  let out = text;
  for (const [bad, good] of MOJIBAKE_REPLACEMENTS) {
    out = out.split(bad).join(good);
  }
  return out;
}

function replaceMeta(html, pattern, replacement) {
  const cleaned = html.replace(pattern, "");
  const headClose = /<\/head>/i;
  if (!headClose.test(cleaned)) {
    return cleaned;
  }
  return cleaned.replace(headClose, `${replacement}\n\n</head>`);
}

function updateQuadrilhaPage(filePath, quad) {
  const slug = quad.slug;
  const nome = fixMojibake(quad.nome || "Quadrilha Junina");
  const grupo = fixMojibake(quad.grupo || "");
  const cidadeRaw = fixMojibake(quad.cidade || "");
  const uf = fixMojibake(quad.uf || "");
  const cidade = cidadeRaw.includes("/") || !uf ? cidadeRaw : `${cidadeRaw}/${uf}`;

  const title = `${nome} | Quadrilha Junina | LINQ-DFE`;
  const description = `Perfil oficial da quadrilha ${nome}, de ${cidade}. Grupo ${grupo}. Informacoes, historico e links.`;
  const canonical = `${BASE_URL}/quadrilha/${slug}.html`;

  let html = fs.readFileSync(filePath, "utf8");

  html = html.replace(/<title>.*?<\/title>/i, `<title>${title}</title>`);
  html = replaceMeta(html, /<meta\s+name="description"[^>]*>\s*/gi, `<meta name="description" content="${description}">`);
  html = replaceMeta(html, /<link\s+rel="canonical"[^>]*>\s*/gi, `<link rel="canonical" href="${canonical}">`);
  html = replaceMeta(html, /<meta\s+property="og:title"[^>]*>\s*/gi, `<meta property="og:title" content="${title}">`);
  html = replaceMeta(html, /<meta\s+property="og:description"[^>]*>\s*/gi, `<meta property="og:description" content="${description}">`);
  html = replaceMeta(html, /<meta\s+property="og:url"[^>]*>\s*/gi, `<meta property="og:url" content="${canonical}">`);
  html = replaceMeta(html, /<meta\s+name="twitter:title"[^>]*>\s*/gi, `<meta name="twitter:title" content="${title}">`);
  html = replaceMeta(html, /<meta\s+name="twitter:description"[^>]*>\s*/gi, `<meta name="twitter:description" content="${description}">`);

  fs.writeFileSync(filePath, html, "utf8");
}

function main() {
  if (!fs.existsSync(DATA_FILE)) {
    throw new Error("data/quadrilhas.json not found.");
  }
  const raw = fs.readFileSync(DATA_FILE, "utf8");
  const data = JSON.parse(raw);
  const bySlug = new Map();
  data.forEach((quad) => {
    if (quad && quad.slug) {
      bySlug.set(String(quad.slug), quad);
    }
  });

  if (!fs.existsSync(QUADRILHA_DIR)) {
    throw new Error("quadrilha/ folder not found.");
  }
  const files = fs
    .readdirSync(QUADRILHA_DIR)
    .filter((name) => name.endsWith(".html"));

  files.forEach((name) => {
    const slug = name.replace(/\.html$/i, "");
    const quad = bySlug.get(slug);
    if (!quad) return;
    updateQuadrilhaPage(path.join(QUADRILHA_DIR, name), quad);
  });

  console.log(`Updated ${files.length} quadrilha pages.`);
}

main();
