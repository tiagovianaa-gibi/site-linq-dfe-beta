/* ============================================
   QUADRILHAS.JS - Página de listagem de quadrilhas
   ============================================ */

import {
  loadJSON,
  getQuadrilhaPhoto,
  applyFocal,
  setActiveNav,
  debounce
} from "./shared.js";

let quadrilhas = [];
let currentFilter = "all"; // 'all' | 'Especial' | 'Acesso'
let currentSearch = "";
let currentCity = "";

window.filterFiliadas = function (grupo) {
  currentFilter = grupo;

  document.querySelectorAll(".filter-btn").forEach((btn) => {
    const text = btn.textContent.trim();
    const btnGroup = text === "Todas" ? "all" : text;
    btn.classList.toggle("active", btnGroup === currentFilter);
  });

  renderQuadrilhas();
};

function renderQuadrilhas() {
  const grid = document.getElementById("filiadasGrid");
  if (!grid) return;

  let filtered = [...quadrilhas];

  if (currentFilter !== "all") {
    filtered = filtered.filter((q) => q.grupo === currentFilter);
  }

  if (currentSearch) {
    const searchLower = currentSearch.toLowerCase();
    filtered = filtered.filter(
      (q) =>
        q.nome.toLowerCase().includes(searchLower) ||
        (q.instagram || "").toLowerCase().includes(searchLower)
    );
  }

  if (currentCity) {
    filtered = filtered.filter((q) => q.cidade === currentCity);
  }

  grid.innerHTML = "";

  if (!filtered.length) {
    grid.innerHTML =
      '<p class="text-center" style="grid-column: 1 / -1; padding: var(--spacing-xl);">Nenhuma quadrilha encontrada.</p>';
    return;
  }

  filtered.forEach((quad) => {
    const slug = quad.slug || "";
    const href = slug ? `quadrilha/${slug}.html` : `quadrilha.html?id=${quad.id}`;

    const card = document.createElement("a");
    card.className = "card quadrilha-card";
    card.href = href;

    const img = document.createElement("img");
    img.src = getQuadrilhaPhoto(quad, true);
    img.alt = quad.nome;
    img.className = "card-image";
    img.loading = "lazy";
    img.onerror = function () {
      this.src = "assets/banners/placeholder.jpg";
    };

    if (quad.focal) {
      applyFocal(img, quad.focal);
    } else {
      img.style.objectPosition = "50% 20%";
    }

    const badgeClass =
      quad.grupo === "Especial" ? "badge" : "badge badge-secondary";

    const overlay = document.createElement("div");
    overlay.className = "card-overlay";
    overlay.innerHTML = `
      <h3 class="card-title">${quad.nome}</h3>
      <div class="card-meta">
        <span>${quad.cidade || ""}</span>
        <span class="${badgeClass}">${quad.grupo}</span>
      </div>
    `;

    card.appendChild(img);
    card.appendChild(overlay);
    grid.appendChild(card);
  });
}

function populateCityFilter() {
  const select = document.getElementById("cityFilter");
  if (!select) return;

  const cidades = Array.from(
    new Set(quadrilhas.map((q) => q.cidade).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b, "pt-BR"));

  select.innerHTML = `
    <option value="">Todas as cidades</option>
    ${cidades.map((c) => `<option value="${c}">${c}</option>`).join("")}
  `;

  select.value = currentCity || "";
}

async function init() {
  quadrilhas = (await loadJSON("data/quadrilhas.json")) || [];

  populateCityFilter();
  renderQuadrilhas();

  const searchInput = document.getElementById("searchFiliadas");
  if (searchInput) {
    const debouncedSearch = debounce(() => {
      currentSearch = searchInput.value.trim();
      renderQuadrilhas();
    }, 300);

    searchInput.addEventListener("input", debouncedSearch);
  }

  const citySelect = document.getElementById("cityFilter");
  if (citySelect) {
    citySelect.addEventListener("change", () => {
      currentCity = citySelect.value;
      renderQuadrilhas();
    });
  }

  setActiveNav();
}

init();
