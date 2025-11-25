/* ============================================
   FILIADAS.JS - Lógica da página Filiadas
   ============================================ */

import {
  loadJSON,
  getQuadrilhaPhoto,
  applyFocal,
  setActiveNav,
  debounce
} from "./shared.js";

let quadrilhas = [];
let currentFilter = "all";   // 'all' | 'Especial' | 'Acesso'
let currentSearch = "";      // texto do input de busca
let currentCity = "";        // valor selecionado no <select>

/**
 * Filtra quadrilhas por grupo (botões Todas / Especial / Acesso)
 */
window.filterFiliadas = function (grupo) {
  currentFilter = grupo;

  // Atualiza visual dos botões
  document.querySelectorAll(".filter-btn").forEach((btn) => {
    const text = btn.textContent.trim();
    const btnGroup = text === "Todas" ? "all" : text; // mapeia botão "Todas"

    if (btnGroup === currentFilter) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

  renderFiliadas();
};

/**
 * Renderiza grid de filiadas
 */
function renderFiliadas() {
  const grid = document.getElementById("filiadasGrid");
  if (!grid) return;

  let filtered = [...quadrilhas];

  // Filtro por grupo (Especial / Acesso / todos)
  if (currentFilter !== "all") {
    filtered = filtered.filter((q) => q.grupo === currentFilter);
  }

  // Busca por nome ou @
  if (currentSearch) {
    const searchLower = currentSearch.toLowerCase();
    filtered = filtered.filter(
      (q) =>
        q.nome.toLowerCase().includes(searchLower) ||
        (q.instagram || "").toLowerCase().includes(searchLower)
    );
  }

  // Filtro por cidade (select)
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
    const card = document.createElement("div");
    card.className = "card quadrilha-card";
    card.onclick = () => {
      window.location.href = `quadrilha.html?id=${quad.id}`;
    };

    const img = document.createElement("img");
    img.src = getQuadrilhaPhoto(quad);
    img.alt = quad.nome;
    img.className = "card-image";
    img.onerror = function () {
      this.src = "assets/banners/placeholder.jpg";
    };

    if (quad.focal) {
      applyFocal(img, quad.focal);
    }

    const overlay = document.createElement("div");
    overlay.className = "card-overlay";
    overlay.innerHTML = `
      <h3 class="card-title">${quad.nome}</h3>
      <div class="card-meta">
        <span>${quad.cidade || ""}</span>
        <span class="badge ${
          quad.grupo === "Especial" ? "" : "badge-secondary"
        }">${quad.grupo}</span>
        ${quad.instagram ? `<span>${quad.instagram}</span>` : ""}
      </div>
    `;

    card.appendChild(img);
    card.appendChild(overlay);
    grid.appendChild(card);
  });
}

/**
 * Preenche o <select> com a lista de cidades
 */
function populateCityFilter() {
  const select = document.getElementById("cityFilter");
  if (!select) return;

  const cidades = Array.from(
    new Set(
      quadrilhas
        .map((q) => q.cidade)
        .filter(Boolean)
    )
  ).sort((a, b) => a.localeCompare(b, "pt-BR"));

  select.innerHTML = `
    <option value="">Todas as cidades</option>
    ${cidades.map((c) => `<option value="${c}">${c}</option>`).join("")}
  `;

  select.value = currentCity || "";
}

/**
 * Inicialização
 */
async function init() {
  // Carrega dados das quadrilhas
  quadrilhas = (await loadJSON("data/quadrilhas.json")) || [];

  // Monta select de cidades e renderiza grid inicial
  populateCityFilter();
  renderFiliadas();

  // Busca com debounce
  const searchInput = document.getElementById("searchFiliadas");
  if (searchInput) {
    const debouncedSearch = debounce(() => {
      currentSearch = searchInput.value.trim();
      renderFiliadas();
    }, 300);

    searchInput.addEventListener("input", debouncedSearch);
  }

  // Filtro de cidade
  const citySelect = document.getElementById("cityFilter");
  if (citySelect) {
    citySelect.addEventListener("change", () => {
      currentCity = citySelect.value;
      renderFiliadas();
    });
  }

  // Destaca o item "Filiadas" no menu
  setActiveNav();
}

init();
