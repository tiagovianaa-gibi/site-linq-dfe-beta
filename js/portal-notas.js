import { loadJSON } from "./shared.js";

function renderList(items = []) {
  if (!items.length) return '<p class="muted notas-small">Nenhum arquivo listado.</p>';
  const html = items
    .map(
      (item) =>
        `<li><a class="btn btn-light notas-download-btn" href="${item.path}" target="_blank" rel="noopener">${item.label || item.path}</a></li>`
    )
    .join("");
  return `<ul class="notas-download-list">${html}</ul>`;
}

function renderAccordion(groups = []) {
  if (!groups.length) return '<p class="muted notas-small">Nenhum arquivo listado.</p>';
  return groups
    .map((group, idx) => {
      const openAttr = "";
      return `
        <details class="notas-accordion"${openAttr}>
          <summary>${group.title}</summary>
          <div class="notas-accordion-body">
            ${renderList(group.items || [])}
          </div>
        </details>
      `;
    })
    .join("");
}

function mount(section) {
  const hostHistorico = section.querySelector("#notasDownloadsHistorico");
  const hostDistrito = section.querySelector("#notasDownloadsDistrito");
  const host2026 = section.querySelector("#notasDownloads2026");
  const resumo2026 = section.querySelector("#notasResumo2026");
  if (!hostHistorico || !host2026 || !resumo2026) return;

  loadJSON("data/notas/index.json")
    .then((index) => {
      const downloads = index?.downloads || {};
      const historico = [
        ...(downloads["2022"] || []),
        ...(downloads["2023"] || []),
        ...(downloads["2024"] || []),
        ...(downloads["2025"] || []),
      ];
      hostHistorico.innerHTML = renderAccordion([
        { title: "Temporada 2022", items: downloads["2022"] || [] },
        { title: "Temporada 2023", items: downloads["2023"] || [] },
        { title: "Temporada 2024", items: downloads["2024"] || [] },
        { title: "Temporada 2025", items: downloads["2025"] || [] },
      ]);

      if (hostDistrito) {
        hostDistrito.innerHTML = renderAccordion([
          { title: "Distrito Junino 2025", items: downloads["distrito_junino_2025"] || [] },
        ]);
      }

      const etapas = index?.temporada_2026?.etapas || [];
      const finais = index?.temporada_2026?.final || [];
      host2026.innerHTML = renderAccordion([
        { title: "Etapas 2026", items: etapas },
        { title: "Resultado final 2026", items: finais },
      ]);
      resumo2026.textContent = `${etapas.length} arquivo(s) de etapa e ${finais.length} arquivo(s) final(is) listados para 2026.`;
    })
    .catch((err) => {
      console.error("Erro ao carregar indice de notas:", err);
      hostHistorico.innerHTML = '<p class="muted notas-small">Erro ao carregar arquivos.</p>';
      if (hostDistrito) hostDistrito.innerHTML = '<p class="muted notas-small">Erro ao carregar arquivos.</p>';
      host2026.innerHTML = '<p class="muted notas-small">Erro ao carregar arquivos.</p>';
      resumo2026.textContent = "Nao foi possivel carregar o status de 2026.";
    });
}

function init() {
  const section = document.getElementById("section-notas");
  if (!section) return;
  mount(section);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init, { once: true });
} else {
  init();
}
