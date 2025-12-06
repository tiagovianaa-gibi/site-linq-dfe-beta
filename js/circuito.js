import { loadJSON, setActiveNav } from "./shared.js";

const SEASONS = [2026, 2025, 2024, 2023, 2022];
const CURRENT_SEASON = 2026;

let quadrilhas = [];
let selectedSeason = CURRENT_SEASON;
let currentTab = "classificacao";
let historico = {}; // histórico completo do circuito

function normalizeName(str = "") {
  return str
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9 ]/gi, "")
    .toLowerCase()
    .trim();
}


document.addEventListener("DOMContentLoaded", init);

async function init() {
  setActiveNav();
  selectedSeason = getSeasonFromURL();
  quadrilhas = await safeLoad("data/quadrilhas.json", []);
  historico = await safeLoad("data/historico_circuito.json", {});

  renderSeasonTabs();
  renderPastCards();
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
  wrap.innerHTML = SEASONS.map(ano => `
    <button class="season-chip ${ano === selectedSeason ? "active" : ""}" data-ano="${ano}">
      ${ano} ${ano === CURRENT_SEASON ? "• em construção" : ""}
    </button>
  `).join("");

  wrap.querySelectorAll("button").forEach(btn => {
    btn.addEventListener("click", async () => {
      selectedSeason = parseInt(btn.dataset.ano, 10);
      setSeasonInURL(selectedSeason);
      renderSeasonTabs();
      await renderSeasonContent(selectedSeason);
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });
}

async function renderSeasonContent(ano) {
  const titleEl = document.getElementById("seasonTitle");
  const subtitleEl = document.getElementById("seasonSubtitle");
  const container = document.getElementById("seasonContent");
  container.innerHTML = "";

  if (ano === CURRENT_SEASON) {
    titleEl.textContent = `Circuito ${ano}`;
    subtitleEl.textContent = "Temporada em construção. Inscrições abertas e calendário oficial em breve.";

    container.appendChild(renderPreSeasonBox());
    // não mostra a lista de etapas enquanto a temporada está em construção
    return;
  }

  titleEl.textContent = `Circuito ${ano}`;
  subtitleEl.textContent = "Classificação final e etapas desta edição.";

  container.appendChild(renderPastTabs());
  await renderPastTabContent(ano);
}


function renderPreSeasonBox() {
  const sec = document.createElement("section");
  sec.className = "notice";
  sec.innerHTML = `
    <h2>${CURRENT_SEASON} vem aí!</h2>
    <p>
      Esta temporada está em fase de organização. Aqui você acompanha inscrições,
      calendário e informações oficiais.
    </p>

    <div class="grid-2">
      <div class="card">
        <h3>Inscrições ${CURRENT_SEASON}</h3>
        <p>Em breve publicaremos o formulário e os requisitos completos.</p>
        <a class="btn" href="documentos.html">Ver documentos</a>
      </div>

      <div class="card">
        <h3>Calendário oficial</h3>
        <p>As datas e locais das etapas serão atualizados aqui automaticamente.</p>
        <a class="btn" href="#etapas">Ver etapas</a>
      </div>
    </div>
  `;
  return sec;
}

function renderPastTabs() {
  const sec = document.createElement("section");
  sec.className = "past-tabs";
  sec.innerHTML = `
    <div class="tabs">
      <button class="tab-btn active" data-tab="classificacao">Classificação</button>
    </div>
    <div id="pastTabContent"></div>
  `;

  // fixa a aba atual como classificação
  currentTab = "classificacao";

  return sec;
}


async function renderPastTabContent(ano) {
  const target = document.getElementById("pastTabContent");
  if (!target) return;

  target.innerHTML = "";
  // só classificação; o acervo é acessado pela outra página
  target.appendChild(renderRankingTables(ano));
}


function renderRankingTables(ano) {
  const sec = document.createElement("section");
  sec.id = "classificacao";

  const grupos = ["Especial", "Acesso"];
  const hasHistorico = historico && historico[ano];
  const key = `pontos${ano}`;

  sec.innerHTML = grupos.map(grupo => {

    // ====== 1) Se existe histórico nesse ano, usa ele ======
    if (hasHistorico) {
      const grpKey = grupo.toLowerCase(); // "especial" | "acesso"
      let list = (historico[ano][grpKey] || []).slice();

      const rows = list.map((item, idx) => {
        const match = quadrilhas.find(q =>
          normalizeName(q.nome) === normalizeName(item.quadrilha)
        );

        const foto = match?.foto || "";
        const cidade = match?.cidade || item.cidade || "";
        const id = match?.id;

        const pos = item.pos ?? (idx + 1);
        const total = Number(item.total ?? item.pontos ?? 0);
        const statusTxt = item.status ? ` <small class="muted">(${item.status})</small>` : "";

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
            <td>${pos}º</td>
            <td>${quadCell}</td>
            <td>${total.toFixed(1)}</td>
          </tr>
        `;
      }).join("");

      return `
        <div class="card table-card">
          <div class="card-header">
            <span class="chip">${grupo}</span>
            <h3>Classificação final ${ano}</h3>
          </div>

          ${list.length ? `
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
          ` : `
            <p class="muted">Sem dados cadastrados para ${ano}.</p>
          `}
        </div>
      `;
    }

    // ====== 2) Se não tem histórico, cai no modelo atual ======
    const list = quadrilhas
      .filter(q => (q.grupo || "").toLowerCase().includes(grupo.toLowerCase()))
      .map(q => ({ ...q, pontos: q[key] }))
      .filter(q => typeof q.pontos === "number")
      .sort((a, b) => b.pontos - a.pontos);

    const rows = list.map((q, idx) => {
      const logoSrc = q.foto
        ? `assets/fotos-quadrilhas/${q.foto}`
        : 'assets/logos/placeholder.png';

      return `
        <tr>
          <td>${idx + 1}º</td>
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
    }).join("");

    return `
      <div class="card table-card">
        <div class="card-header">
          <span class="chip">${grupo}</span>
          <h3>Classificação final ${ano}</h3>
        </div>

        ${list.length ? `
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
        ` : `
          <p class="muted">Sem dados de pontuação cadastrados para ${ano}.</p>
        `}
      </div>
    `;
  }).join("");

  return sec;
}


async function renderSteps(target, ano, { mode }) {
  const sec = document.createElement("section");
  sec.id = "etapas";
  sec.className = "steps";
  sec.innerHTML = `
    <h2>Etapas ${ano}</h2>
    <div class="steps-list" id="stepsList"></div>
  `;

  target.appendChild(sec);
  const listEl = sec.querySelector("#stepsList");

  const steps = await safeLoad(`data/etapas_${ano}.json`, []);

  if (!steps.length) {
    listEl.innerHTML = `<p class="muted">Calendário ${ano} em breve.</p>`;
    return;
  }

  steps.sort((a, b) => new Date(a.data || "2100-01-01") - new Date(b.data || "2100-01-01"));

  listEl.innerHTML = steps.map(step => {
    const dataTxt = step.data ? formatDate(step.data) : "em breve";
    const cidadeTxt = step.cidade || "em breve";
    const localTxt = step.local || "em breve";

    const acervoBtn = (mode === "past")
      ? `<a class="btn btn-ghost" href="acervo.html?ano=${ano}#${step.id}">Ver acervo desta etapa</a>`
      : "";

    return `
      <article class="card step-card">
        <h3>${step.nome || `${step.id}ª Etapa`}</h3>
        <p class="muted">${dataTxt} • ${cidadeTxt} • ${localTxt}</p>
        ${acervoBtn}
      </article>
    `;
  }).join("");
}

function renderPastCards() {
  const el = document.getElementById("pastCards");
  if (!el) return;

  const past = SEASONS.filter(y => y !== CURRENT_SEASON);

  el.innerHTML = past.map(y => {
    const desc =
      y === 2025 ? "25ª edição realizada de forma independente pelas quadrilhas."
      : "Temporada oficial do circuito.";

    return `
      <article class="card">
        <span class="chip">CIRCUITO ${y}</span>
        <h3>Circuito ${y}</h3>
        <p>${desc}</p>
        <div class="row">
          <a class="btn btn-ghost" href="circuito.html?ano=${y}#classificacao">Ver classificação</a>
          <a class="btn btn-ghost" href="acervo.html?ano=${y}">Ver acervo</a>
        </div>
      </article>
    `;
  }).join("");
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
      year: "numeric"
    });
  } catch {
    return "em breve";
  }
}
