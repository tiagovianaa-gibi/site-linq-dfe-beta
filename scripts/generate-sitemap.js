const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const BASE_URL = "https://linqdfe.com.br";
const OUTPUT = path.join(ROOT, "sitemap.xml");
const ROBOTS = path.join(ROOT, "robots.txt");

const EXCLUDE_ROOT = new Set([
  "portal.html",
  "portal-dashboard.html",
  "quadrilha.html",
  "noticia.html",
  "filiadas.html",
]);

function listHtmlFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".html"))
    .map((entry) => entry.name);
}

function buildUrl(pathname) {
  if (!pathname || pathname === "/") return `${BASE_URL}/`;
  return `${BASE_URL}/${pathname.replace(new RegExp("^/"), "")}`;
}

function buildUrlEntry(loc, lastmod) {
  return [
    "  <url>",
    `    <loc>${loc}</loc>`,
    `    <lastmod>${lastmod}</lastmod>`,
    "  </url>",
  ].join("\n");
}

function generateSitemap() {
  const now = new Date().toISOString().slice(0, 10);
  const urls = [];

  const rootFiles = listHtmlFiles(ROOT).filter((name) => !EXCLUDE_ROOT.has(name));
  rootFiles.sort();
  rootFiles.forEach((name) => {
    if (name === "index.html") {
      urls.push(buildUrl("/"));
    } else {
      urls.push(buildUrl(name));
    }
  });

  const noticiaFiles = listHtmlFiles(path.join(ROOT, "noticia"));
  noticiaFiles.sort();
  noticiaFiles.forEach((name) => {
    urls.push(buildUrl(`noticia/${name}`));
  });

  const quadrilhaFiles = listHtmlFiles(path.join(ROOT, "quadrilha"));
  quadrilhaFiles.sort();
  quadrilhaFiles.forEach((name) => {
    urls.push(buildUrl(`quadrilha/${name}`));
  });

  const entries = urls.map((loc) => buildUrlEntry(loc, now)).join("\n");
  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    entries,
    "</urlset>",
    "",
  ].join("\n");

  fs.writeFileSync(OUTPUT, xml, "utf8");
}

function updateRobots() {
  const lines = [
    "User-agent: *",
    "Allow: /",
    "Disallow: /portal",
    "Disallow: /portal-dashboard",
    "Disallow: /quadrilha.html",
    "Disallow: /*?slug=",
    "Disallow: /*?",
    "",
    "Sitemap: https://linqdfe.com.br/sitemap.xml",
    "",
  ];

  fs.writeFileSync(ROBOTS, lines.join("\n"), "utf8");
}

generateSitemap();
updateRobots();
console.log("Updated sitemap.xml and robots.txt");
