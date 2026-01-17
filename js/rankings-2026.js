import { loadJSON, slugify } from "./shared.js";

const SCORE_DEFAULT = "0,0";

function buildLogoCandidates(slug) {
  const base = `assets/logos-quadrilhas/${slug}-logo`;
  return [`${base}.png`, `${base}.jpg`, `${base}.jpeg`];
}

function buildList(items) {
  return items
    .map((item) => {
      const slug = item.slug || slugify(item.nome);
      const candidates = buildLogoCandidates(slug);
      const href = slug ? `quadrilha/${slug}.html` : `quadrilha.html?id=${item.id}`;
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
  const images = root.querySelectorAll(".ranking-logo[data-candidates]");
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

async function initRankings() {
  const blocks = document.querySelectorAll(".ranking-block[data-group]");
  if (!blocks.length) return;

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
      listEl.innerHTML = html;
      setupLogoFallbacks(listEl);
    });
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initRankings, { once: true });
} else {
  initRankings();
}
