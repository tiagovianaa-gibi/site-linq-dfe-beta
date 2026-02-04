import { loadJSON, slugify, buildPhotoCandidates } from "./shared.js";

const SCORE_DEFAULT = "0,0";

function buildLogoCandidates(item) {
  if (item?.logo) {
    return buildPhotoCandidates(item.logo, "assets/logos-quadrilhas");
  }
  const slug = item?.slug || slugify(item?.nome || "");
  if (!slug) return [];
  return buildPhotoCandidates(`${slug}-logo`, "assets/logos-quadrilhas");
}

function buildList(items) {
  return items
    .map((item) => {
      const slug = item.slug || slugify(item.nome);
      const candidates = buildLogoCandidates(item);
      const href = `quadrilha/${slug}.html`;
      return `
        <li class="ranking-item">
          <span class="ranking-name">
            <img class="ranking-logo" src="${candidates[0]}" data-candidates="${candidates.join("|")}" alt="Logo ${item.nome}">
            <a class="ranking-link" href="${href}">${item.nome}</a>
          </span>
          <span class="ranking-score">${SCORE_DEFAULT}</span>
        </li>
      `;
    })
    .join("");
}

function setupLogoFallbacks(root) {
  const images = root.querySelectorAll(".ranking-logo[data-candidates], .hero-logo[data-candidates]");
  images.forEach((img) => {
    const candidates = (img.dataset.candidates || "").split("|").filter(Boolean);
    let index = 0;
    img.addEventListener("error", () => {
      index += 1;
      if (index < candidates.length) {
        img.src = candidates[index];
      } else {
        img.style.display = "none";
      }
    });
  });
}

function buildLogoWall(items) {
  return items
    .map((item) => {
      const slug = item.slug || slugify(item.nome);
      const candidates = buildLogoCandidates(item);
      const href = `quadrilha/${slug}.html`;
      return `
        <a class="hero-logo-item" href="${href}" aria-label="${item.nome}">
          <img class="hero-logo" src="${candidates[0]}" data-candidates="${candidates.join("|")}" alt="Logo ${item.nome}">
        </a>
      `;
    })
    .join("");
}

async function initRankings() {
  const blocks = document.querySelectorAll(".ranking-block[data-group]");
  const heroWalls = document.querySelectorAll(".hero-logo-wall[data-group]");
  if (!blocks.length && !heroWalls.length) return;

  const data = (await loadJSON("data/quadrilhas.json")) || [];

  blocks.forEach((block) => {
    const group = block.dataset.group || "";
    const listEls = block.querySelectorAll(".ranking-list");
    if (!listEls.length) return;

    const items = data
      .filter((q) => q.grupo === group)
      .slice()
      .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));

    const html = buildList(items);
    listEls.forEach((listEl) => {
      if (listEl.children.length) {
        setupLogoFallbacks(listEl);
        return;
      }
      listEl.innerHTML = html;
      setupLogoFallbacks(listEl);
    });
  });

  heroWalls.forEach((wall) => {
    const group = wall.dataset.group || "";
    const items = data
      .filter((q) => q.grupo === group)
      .slice()
      .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
    if (wall.children.length) {
      setupLogoFallbacks(wall);
      return;
    }
    wall.innerHTML = buildLogoWall(items);
    setupLogoFallbacks(wall);
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initRankings, { once: true });
} else {
  initRankings();
}
