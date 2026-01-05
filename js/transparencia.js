import { loadJSON, setActiveNav } from "./shared.js";

const grid = document.getElementById("transparenciaGrid");
const selectAno = document.getElementById("filtroAno");
const selectTipo = document.getElementById("filtroTipo");
const empty = document.getElementById("transparenciaEmpty");

let docs = [];

function render() {
  if (!grid) return;
  grid.innerHTML = "";

  let list = [...docs];
  const ano = selectAno?.value || "";
  const tipo = selectTipo?.value || "";

  if (ano) list = list.filter((d) => d.ano === ano);
  if (tipo) {
    if (tipo === "outros") {
      list = list.filter((d) => d.tipo !== "balanco" && d.tipo !== "regulamento");
    } else {
      list = list.filter((d) => d.tipo === tipo);
    }
  }

  if (!list.length) {
    if (empty) empty.classList.remove("hidden");
    return;
  }
  if (empty) empty.classList.add("hidden");

  list.forEach((item) => {
    const card = document.createElement("article");
    card.className = "doc-card";
    card.innerHTML = `
      <div class="doc-card-header">
        <span class="badge">${item.tipo || "Documento"}</span>
        <span class="badge badge-secondary">${item.ano || ""}</span>
      </div>
      <h2 class="doc-card-title">${item.titulo || ""}</h2>
      <p class="doc-card-description">${item.descricao || ""}</p>
      <p class="doc-meta muted">Versão: ${item.versao || "v1"} · Atualizado em: ${item.atualizado_em || "-"}</p>
      <a class="btn" href="${item.arquivo}" target="_blank" rel="noopener">Abrir</a>
    `;
    grid.appendChild(card);
  });
}

function populateFilters() {
  if (!selectAno) return;
  const anos = Array.from(new Set(docs.map((d) => d.ano).filter(Boolean))).sort((a, b) => b.localeCompare(a));
  selectAno.innerHTML = `<option value="">Todos os anos</option>${anos.map((a) => `<option value="${a}">${a}</option>`).join("")}`;
}

async function init() {
  docs = (await loadJSON("data/transparencia.json")) || [];
  populateFilters();
  render();

  if (selectAno) selectAno.addEventListener("change", render);
  if (selectTipo) selectTipo.addEventListener("change", render);

  setActiveNav();
}

init();
