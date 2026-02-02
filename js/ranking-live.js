import { loadJSON, buildPhotoCandidates } from "./shared.js";

const XLSX_URL = "https://cdn.jsdelivr.net/npm/xlsx@0.18.5/+esm";

function normalize(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function parseNumber(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : NaN;
  const str = String(value || "").trim();
  if (!str) return NaN;
  const normalized = str.includes(",") && str.includes(".")
    ? str.replace(/\./g, "").replace(",", ".")
    : str.replace(",", ".");
  const n = Number(normalized);
  return Number.isFinite(n) ? n : NaN;
}

function formatScore(value) {
  return Number(value || 0).toLocaleString("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  });
}

function ext(path) {
  return String(path || "").split(".").pop().toLowerCase();
}

function inferHeader(headers, candidates = []) {
  return headers.find((h) => candidates.some((c) => normalize(h).includes(normalize(c)))) || "";
}

async function readCsv(path) {
  const text = await fetch(path).then((r) => {
    if (!r.ok) throw new Error(`Falha ao carregar ${path}`);
    return r.text();
  });
  const lines = text
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .filter(Boolean);
  if (!lines.length) return [];
  const sep = lines[0].includes(";") ? ";" : ",";
  const headers = lines[0].split(sep).map((x) => x.trim());
  return lines.slice(1).map((line) => {
    const cols = line.split(sep);
    const row = {};
    headers.forEach((h, i) => {
      row[h] = cols[i] ?? "";
    });
    return row;
  });
}

async function readXlsx(path) {
  const XLSX = await import(XLSX_URL);
  const buffer = await fetch(path).then((r) => {
    if (!r.ok) throw new Error(`Falha ao carregar ${path}`);
    return r.arrayBuffer();
  });
  const wb = XLSX.read(buffer, { type: "array" });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  return XLSX.utils.sheet_to_json(sheet, { defval: "" });
}

async function readRows(path) {
  const extension = ext(path);
  if (extension === "csv") return readCsv(path);
  if (extension === "xlsx" || extension === "xls") return readXlsx(path);
  return [];
}

function pickTotal(row, totalHeader, ignoreCandidates) {
  if (totalHeader) {
    return parseNumber(row[totalHeader]);
  }
  const ignore = new Set(
    Object.keys(row).filter((key) =>
      ignoreCandidates.some((c) => normalize(key).includes(normalize(c)))
    )
  );
  const numeric = Object.keys(row).filter((key) => !ignore.has(key)).map((k) => parseNumber(row[k]));
  const valid = numeric.filter((n) => Number.isFinite(n));
  if (!valid.length) return NaN;
  return valid.reduce((a, b) => a + b, 0);
}

function mergeEtapaRows(rows, config) {
  if (!rows.length) return { especial: [], acesso: [] };
  const headers = Object.keys(rows[0]);
  const grupoHeader = inferHeader(headers, config.grupo_candidates || []);
  const quadHeader = inferHeader(headers, config.quadrilha_candidates || []);
  const totalHeader = inferHeader(headers, config.total_candidates || []);
  if (!grupoHeader || !quadHeader) return { especial: [], acesso: [] };

  const groups = { especial: new Map(), acesso: new Map() };
  rows.forEach((row) => {
    const groupRaw = normalize(row[grupoHeader]);
    const key = groupRaw.includes("especial") ? "especial" : groupRaw.includes("acesso") ? "acesso" : "";
    if (!key) return;
    const quadrilha = String(row[quadHeader] || "").trim();
    if (!quadrilha) return;
    const total = pickTotal(row, totalHeader, config.ignore_candidates || []);
    if (!Number.isFinite(total)) return;
    const mapKey = normalize(quadrilha);
    const current = groups[key].get(mapKey) || { quadrilha, total: 0 };
    current.total += total;
    groups[key].set(mapKey, current);
  });

  const toList = (map) =>
    Array.from(map.values())
      .sort((a, b) => b.total - a.total)
      .map((item, idx) => ({ pos: idx + 1, quadrilha: item.quadrilha, total: Number(item.total.toFixed(2)) }));

  return { especial: toList(groups.especial), acesso: toList(groups.acesso) };
}

function mergeAllEtapas(etapas) {
  const merged = { especial: new Map(), acesso: new Map() };
  etapas.forEach((payload) => {
    ["especial", "acesso"].forEach((group) => {
      (payload[group] || []).forEach((row) => {
        const key = normalize(row.quadrilha);
        const current = merged[group].get(key) || { quadrilha: row.quadrilha, total: 0 };
        current.total += row.total;
        merged[group].set(key, current);
      });
    });
  });
  const toList = (map) =>
    Array.from(map.values())
      .sort((a, b) => b.total - a.total)
      .map((item, idx) => ({ pos: idx + 1, quadrilha: item.quadrilha, total: Number(item.total.toFixed(2)) }));
  return { especial: toList(merged.especial), acesso: toList(merged.acesso) };
}

function buildItemHtml(item, quadrilhasMap) {
  const meta = quadrilhasMap.get(normalize(item.quadrilha));
  const nome = meta?.nome || item.quadrilha;
  const slug = meta?.slug || "";
  const href = slug ? `quadrilha/${slug}.html` : "#";
  const candidates = meta?.logo
    ? buildPhotoCandidates(meta.logo, "assets/logos-quadrilhas")
    : buildPhotoCandidates(`${slug || ""}-logo`, "assets/logos-quadrilhas");
  const img = candidates[0] || "assets/banners/placeholder.jpg";
  return `
    <li class="ranking-item">
      <span class="ranking-name">
        <img class="ranking-logo" src="${img}" data-candidates="${candidates.join("|")}" alt="Logo ${nome}">
        <a class="ranking-link" href="${href}">${nome}</a>
      </span>
      <span class="ranking-score">${formatScore(item.total)}</span>
    </li>
  `;
}

function setupLogoFallbacks(root) {
  root.querySelectorAll(".ranking-logo[data-candidates]").forEach((img) => {
    const candidates = (img.dataset.candidates || "").split("|").filter(Boolean);
    let idx = 0;
    img.addEventListener("error", () => {
      idx += 1;
      if (idx < candidates.length) {
        img.src = candidates[idx];
      } else {
        img.style.display = "none";
      }
    });
  });
}

function getYear() {
  const scope = document.querySelector("[data-ranking-year]");
  const year = Number(scope?.dataset?.rankingYear || scope?.getAttribute("data-ranking-year"));
  return Number.isFinite(year) ? year : 2026;
}

async function init() {
  const blocks = Array.from(document.querySelectorAll(".ranking-block[data-group]"));
  if (!blocks.length) return;

  const year = getYear();
  const index = await loadJSON("data/notas/index.json");
  const cfg = index?.temporada_2026?.parse_config || {};
  const etapas = year === 2026 ? index?.temporada_2026?.etapas || [] : [];
  if (!etapas.length) return;

  const etapaRows = [];
  for (const etapa of etapas) {
    if (!etapa?.path) continue;
    const rows = await readRows(etapa.path).catch(() => []);
    if (!rows.length) continue;
    etapaRows.push(mergeEtapaRows(rows, cfg));
  }
  if (!etapaRows.length) return;
  const ranking = mergeAllEtapas(etapaRows);

  const quadrilhas = (await loadJSON("data/quadrilhas.json")) || [];
  const map = new Map(
    quadrilhas.map((q) => [normalize(q.nome), { nome: q.nome, slug: q.slug || "", logo: q.logo || "" }])
  );

  blocks.forEach((block) => {
    const group = normalize(block.dataset.group).includes("especial") ? "especial" : "acesso";
    const list = ranking[group] || [];
    if (!list.length) return;
    const listEl = block.querySelector(".ranking-list");
    if (!listEl) return;
    listEl.innerHTML = list.map((item) => buildItemHtml(item, map)).join("");
    setupLogoFallbacks(listEl);
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    init().catch((err) => console.error("Erro ao atualizar ranking 2026:", err));
  });
} else {
  init().catch((err) => console.error("Erro ao atualizar ranking 2026:", err));
}
