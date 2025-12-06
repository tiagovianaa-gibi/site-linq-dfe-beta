import { loadJSON, setActiveNav } from "./shared.js";

const SEASONS = [2026, 2025, 2024, 2023, 2022];
const CURRENT_SEASON = 2026;
const TABS = [
  { id: "classificacao", label: "Tabela" },
  { id: "acervo", label: "Acervo" },
];

let quadrilhas = [];
let selectedSeason = CURRENT_SEASON;
let currentTab = "classificacao";
let historico = {}; // historico completo do circuito

function normalizeName(str = "") {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9 ]/gi, "")
    .toLowerCase()
    .trim();
}

document.addEventListener("DOMContentLoaded", init);

async function init() {
  setActiveNav();
  selectedSeason = getSeasonFromURL();
  quadrilhas = (await safeLoad("data/quadrilhas.json", [])) || [];
  historico = (await safeLoad("data/historico_circuito.json", {})) || {};

  renderSeasonTabs();
  await renderSeasonContent(selectedSeason);
}

function getSeasonFromURL() {
  const p = new URLSearchParams(location.search);
  const ano = parseInt(p.get("ano"), 10);
  return SEASONS.includes(ano) ? ano : CURRENT_SEASON;
}

function setSeasonInURL(ano) {
  const p = new URLSearchParams(location.search);
  p.set("ano", ano);
  history.replaceState(null, "", `${location.pathname}?${p.toString()}`);
}

function renderSeasonTabs() {
  const wrap = document.getElementById("seasonTabs");
  wrap.innerHTML = SEASONS.map((ano) => `
    <button class="season-chip ${ano === selectedSeason ? "active" : ""}" data-ano="${ano}">
      ${ano} ${ano === CURRENT_SEASON ? "- em construcao" : ""}
    </button>
  `).join("");

  wrap.querySelectorAll("button").forEach((btn) => {
    btn.addEventListener("click", async () => {
      selectedSeason = parseInt(btn.dataset.ano, 10);
      setSeasonInURL(selectedSeason);
      currentTab = "classificacao";
      renderSeasonTabs();
      await renderSeasonContent(selectedSeason);
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });
}

function renderSeasonHighlights(isCurrent) {
  const box = document.getElementById("seasonHighlights");
  if (!box) return;
  box.className = "grid";
  box.style.gridTemplateColumns = "repeat(auto-fit, minmax(220px, 1fr))";
  const items = [
    {
      title: "Tabela",
      desc: isCurrent
        ? "Acompanhe a tabela oficial desta temporada."
        : "Notas e posicoes finais do ano.",
      link: "#classificacao",
      cta: "Ver tabela",
    },
    {
      title: "Acervo",
      desc: "Fotos e videos do circuito.",
      link: `acervo.html?ano=${selectedSeason}`,
      cta: "Ir para acervo",
    },
  ];

  box.innerHTML = items
    .map(
      (item) => `
      <article class="card" style="padding: var(--spacing-md);">
        <p class="chip">${item.title}</p>
        <p class="muted">${item.desc}</p>
        <a class="btn btn-light" href="${item.link}">${item.cta}</a>
      </article>
    `
    )
    .join("");
}

async function renderSeasonContent(ano) {
  const titleEl = document.getElementById("seasonTitle");
  const subtitleEl = document.getElementById("seasonSubtitle");
  const container = document.getElementById("seasonContent");
  container.innerHTML = "";

  const isCurrent = ano === CURRENT_SEASON;
  titleEl.textContent = `Circuito ${ano}`;
  subtitleEl.textContent = isCurrent
    ? "Temporada em construcao: inscricoes, calendario e comunicados oficiais em um lugar so."
    : "Classificacao final, etapas e acervo desta edicao.";

  renderSeasonHighlights(isCurrent);

  container.appendChild(renderPastTabs(isCurrent));
  await renderPastTabContent(ano, isCurrent);
}

function renderPreSeasonBox() {
  const sec = document.createElement("section");
  sec.className = "notice";
  sec.innerHTML = `
    <h2>${CURRENT_SEASON} vem ai</h2>
    <p>
      Esta temporada esta em fase de organizacao. Aqui voce acompanha inscricoes,
      calendario e informacoes oficiais.
    </p>

    <div class="grid-2">
      <div class="card">
        <h3>Inscricoes ${CURRENT_SEASON}</h3>
        <p>Em breve publicaremos o formulario e os requisitos completos.</p>
        <a class="btn" href="documentos.html">Ver documentos</a>
      </div>

      <div class="card">
        <h3>Calendario oficial</h3>
        <p>As datas e locais das etapas serao atualizados aqui automaticamente.</p>
        <a class="btn" href="#etapas">Ver etapas</a>
      </div>
    </div>
  `;
  return sec;
}

function renderPastTabs(isCurrent) {
  const sec = document.createElement("section");
  sec.className = "past-tabs";
  sec.innerHTML = `
    <div class="tabs">
      ${TABS.map(
        (tab) => `
        <button class="tab-btn ${tab.id === currentTab ? "active" : ""}" data-tab="${tab.id}">
          ${tab.label}
        </button>
      `
      ).join("")}
    </div>
    <div id="pastTabContent"></div>
  `;

  sec.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      currentTab = btn.dataset.tab;
      sec
        .querySelectorAll(".tab-btn")
        .forEach((b) => b.classList.toggle("active", b === btn));
      await renderPastTabContent(selectedSeason, isCurrent);
    });
  });

  return sec;
}

async function renderPastTabContent(ano, isCurrent) {
  const target = document.getElementById("pastTabContent");
  if (!target) return;

  target.innerHTML = "";
  if (currentTab === "classificacao") {
    if (isCurrent) {
      // Para temporada atual, mostra apenas o aviso de pré-temporada
      target.appendChild(renderPreSeasonBox());
    } else {
      target.appendChild(renderRankingTables(ano));
    }
  } else if (currentTab === "acervo") {
    target.appendChild(renderAcervoCard(ano));
  }
}

function renderAcervoCard(ano) {
  const wrap = document.createElement("section");
  wrap.className = "stack";
  wrap.innerHTML = `
    <div class="card">
      <div class="card-body">
        <p class="chip">Acervo</p>
        <h3>Fotos e videos do circuito ${ano}</h3>
        <p class="muted">Acesse a pagina dedicada do acervo para ver galerias e videos de cada ano.</p>
        <a class="btn" href="acervo.html?ano=${ano}">Abrir acervo ${ano}</a>
      </div>
    </div>
  `;
  return wrap;
}

function renderRankingTables(ano) {
  const sec = document.createElement("section");
  sec.id = "classificacao";

  const grupos = ["Especial", "Acesso"];
  const hasHistorico = historico && historico[ano];
  const key = `pontos${ano}`;

  sec.innerHTML = grupos
    .map((grupo) => {
      // ====== 1) Se existe historico nesse ano, usa ele ======
      if (hasHistorico) {
        const grpKey = grupo.toLowerCase(); // "especial" | "acesso"
        let list = (historico[ano][grpKey] || []).slice();

        const rows = list
          .map((item, idx) => {
            const match = quadrilhas.find(
              (q) => normalizeName(q.nome) === normalizeName(item.quadrilha)
            );

            const foto = match?.foto || "";
            const cidade = match?.cidade || item.cidade || "";
            const id = match?.id;

            const pos = item.pos ?? idx + 1;
            const total = Number(item.total ?? item.pontos ?? 0);
            const statusTxt = item.status
              ? ` <small class="muted">(${item.status})</small>`
              : "";

            const imgHtml = foto
              ? `<img src="assets/fotos-quadrilhas/${foto}" alt="${item.quadrilha}"
                   onerror="this.remove()">`
              : "";

            const nomeHtml = `
              ${item.quadrilha}${statusTxt}
              <small class="muted" style="display:block;">${cidade || ""}</small>
            `;

            const quadCell = id
              ? `
                <a href="quadrilha.html?id=${id}" class="table-quad">
                  ${imgHtml}
                  <span>${nomeHtml}</span>
                </a>
              `
              : `
                <div class="table-quad">
                  ${imgHtml}
                  <span>${nomeHtml}</span>
                </div>
              `;

            return `
              <tr>
                <td>${pos}</td>
                <td>${quadCell}</td>
                <td>${total.toFixed(1)}</td>
              </tr>
            `;
          })
          .join("");

        return `
          <div class="card table-card">
            <div class="card-header">
              <span class="chip">${grupo}</span>
              <h3>Classificacao final ${ano}</h3>
            </div>

            ${
              list.length
                ? `
              <div class="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Quadrilha</th>
                      <th>Nota</th>
                    </tr>
                  </thead>
                  <tbody>${rows}</tbody>
                </table>
              </div>
            `
                : `
              <p class="muted">Sem dados cadastrados para ${ano}.</p>
            `
            }
          </div>
        `;
      }

      // ====== 2) Se nao tem historico, cai no modelo atual ======
      const list = quadrilhas
        .filter((q) => (q.grupo || "").toLowerCase().includes(grupo.toLowerCase()))
        .map((q) => ({ ...q, pontos: q[key] }))
        .filter((q) => typeof q.pontos === "number")
        .sort((a, b) => b.pontos - a.pontos);

      const rows = list
        .map((q, idx) => {
          const logoSrc = q.foto
            ? `assets/fotos-quadrilhas/${q.foto}`
            : "assets/logos/placeholder.png";

          return `
            <tr>
              <td>${idx + 1}</td>
              <td>
                <a href="quadrilha.html?id=${q.id}" class="table-quad">
                  <img src="${logoSrc}" alt="${q.nome}" onerror="this.src='assets/logos/placeholder.png'">
                  <span>
                    ${q.nome}
                    <small class="muted" style="display: block;">${q.cidade || ""}</small>
                  </span>
                </a>
              </td>
              <td>${q.pontos.toFixed(1)}</td>
            </tr>
          `;
        })
        .join("");

      return `
        <div class="card table-card">
          <div class="card-header">
            <span class="chip">${grupo}</span>
            <h3>Classificacao final ${ano}</h3>
          </div>

          ${
            list.length
              ? `
            <div class="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Quadrilha</th>
                    <th>Nota</th>
                  </tr>
                </thead>
                <tbody>${rows}</tbody>
              </table>
            </div>
          `
              : `
            <p class="muted">Sem dados de pontuacao cadastrados para ${ano}.</p>
          `
          }
        </div>
      `;
    })
    .join("");

  return sec;
}

async function renderSteps(target, ano, { mode }) {
  // Etapas removidas da pagina para simplificar; somente classificacao e acervo.
}

function renderPastCards() {
  // removido: pagina agora usa apenas as tabs superiores para alternar anos
}

async function safeLoad(url, fallback) {
  try {
    return (await loadJSON(url)) || fallback;
  } catch (e) {
    console.warn("Falha ao carregar:", url, e);
    return fallback;
  }
}

function formatDate(iso) {
  try {
    const d = new Date(iso);
    if (isNaN(d)) return "em breve";
    return d.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return "em breve";
  }
}


