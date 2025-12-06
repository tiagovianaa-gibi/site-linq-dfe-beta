import { loadJSON, applyFocal, setActiveNav } from "./shared.js";

const PLACEHOLDER = "assets/banners/placeholder.jpg";

function formatDateBR(iso){
  if(!iso) return "";
  const [y,m,d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function tryGetThumb(item){
  if(item.thumb) return item.thumb;
  if(item.tipo === "foto") return item.arquivo || PLACEHOLDER;
  if(item.tipo === "video") return item.thumb || PLACEHOLDER;
  return item.thumb || PLACEHOLDER;
}

function renderMediaCard(item, quadrilhasMap){
  const q = item.quad_id != null ? quadrilhasMap.get(String(item.quad_id)) : null;
  const thumb = tryGetThumb(item);
  const tipoLabel = (item.tipo || "arquivo").toUpperCase();

  const card = document.createElement("article");
  card.className = "media-card reveal";

  const imgWrap = document.createElement("div");
  imgWrap.className = "media-thumb";

  const img = document.createElement("img");
  img.src = thumb;
  img.alt = item.titulo || "Item do acervo";
  img.loading = "lazy";
  img.onerror = () => img.src = PLACEHOLDER;
  applyFocal(img, item.focal);
  imgWrap.appendChild(img);

  if(item.tipo === "video"){
    const play = document.createElement("div");
    play.className = "play-badge";
    play.textContent = "-";
    imgWrap.appendChild(play);
  }

  const body = document.createElement("div");
  body.className = "media-body";

  const chip = document.createElement("div");
  chip.className = "chip";
  chip.textContent = tipoLabel;

  const h3 = document.createElement("h3");
  h3.textContent = item.titulo || "Item de acervo";

  const meta = document.createElement("div");
  meta.className = "media-meta muted";
  meta.textContent = [
    item.data ? formatDateBR(item.data) : "",
    q ? `${q.nome} ? ${q.cidade}` : "Liga / Geral"
  ].filter(Boolean).join(" ?" ");

  const desc = document.createElement("p");
  desc.className = "media-desc";
  desc.textContent = item.descricao || "";

  const actions = document.createElement("div");
  actions.className = "media-actions";

  const a = document.createElement("a");
  a.href = item.arquivo || "#";
  a.target = "_blank";
  a.rel = "noopener";
  a.className = "btn btn-light btn-sm";
  a.textContent =
    item.tipo === "album" ? "Abrir galeria" :
    item.tipo === "video" ? "Assistir" :
    item.tipo === "pdf" ? "Ver documento" :
    "Ver arquivo";

  actions.appendChild(a);

  body.appendChild(chip);
  body.appendChild(h3);
  body.appendChild(meta);
  if(item.descricao) body.appendChild(desc);
  body.appendChild(actions);

  card.appendChild(imgWrap);
  card.appendChild(body);

  return card;
}

function renderEtapaSection(etapa, items, quadrilhasMap, isHighlight){
  if(!items.length) return null;

  const wrap = document.createElement("section");
  wrap.className = `etapa-section reveal ${isHighlight ? "etapa-highlight" : ""}`;
  wrap.id = `etapa-section-${etapa.id || "geral"}`;

  const head = document.createElement("div");
  head.className = "etapa-head";

  const title = document.createElement("h2");
  title.textContent = etapa.nome || "Etapa do Circuito";

  const meta = document.createElement("div");
  meta.className = "muted";
  meta.textContent = [
    etapa.data ? formatDateBR(etapa.data) : "",
    etapa.local || "",
    etapa.cidade || ""
  ].filter(Boolean).join(" ? ");

  head.appendChild(title);
  head.appendChild(meta);

  const grid = document.createElement("div");
  grid.className = "media-grid";

  items.forEach(it => grid.appendChild(renderMediaCard(it, quadrilhasMap)));

  wrap.appendChild(head);
  wrap.appendChild(grid);

  return wrap;
}

function autoAssignEtapa(items, etapas){
  if(!etapas?.length) return items;

  const etapasByDate = new Map();
  etapas.forEach(e=>{
    if(e.data) etapasByDate.set(e.data, e);
  });

  return items.map(it=>{
    if(it.etapa_id != null) return it;
    if(it.data && etapasByDate.has(it.data)){
      return { ...it, etapa_id: etapasByDate.get(it.data).id };
    }
    return it;
  });
}

function groupByEtapa(items){
  const map = new Map();
  items.forEach(it=>{
    const key = it.etapa_id == null ? "geral" : String(it.etapa_id);
    if(!map.has(key)) map.set(key, []);
    map.get(key).push(it);
  });
  return map;
}

(async function init(){
  setActiveNav();

  const params = new URLSearchParams(location.search);
  const paramYear = params.get("ano") || params.get("year");
  const paramEtapa = params.get("etapa"); // id da etapa
  const paramQuad = params.get("quad");   // id da quadrilha (opcional)

  const etapaNotice = document.getElementById("etapaNotice");
  const verTudoLink = document.getElementById("verTudoLink");

  const quadrilhas = (await loadJSON("data/quadrilhas.json")) || [];
  const quadrilhasMap = new Map(quadrilhas.map(q=>[String(q.id), q]));

  const acervoAll  = (await loadJSON("data/acervo.json")) || {};
  const years = Object.keys(acervoAll || {}).sort((a,b)=> b.localeCompare(a));

  const yearTabs = document.getElementById("yearTabs");
  const quadFilter = document.getElementById("quadFilter");
  const viewMode = document.getElementById("viewMode");
  const content = document.getElementById("acervoContent");

  let currentYear = (paramYear && years.includes(paramYear)) ? paramYear : (years[0] || "2026");
  let etapaFilterId = paramEtapa ? String(paramEtapa) : "";

  // Tabs de anos
  if(yearTabs){
    yearTabs.innerHTML = years.map(y=>`
      <button class="tab-btn ${y===currentYear?"active":""}" data-year="${y}">
        ${y}
      </button>
    `).join("");
  }

  // Filtro quadrilhas
  if(quadFilter){
    quadrilhas
      .slice()
      .sort((a,b)=> a.nome.localeCompare(b.nome))
      .forEach(q=>{
        const opt = document.createElement("option");
        opt.value = q.id;
        opt.textContent = q.nome;
        quadFilter.appendChild(opt);
      });

    if(paramQuad){
      quadFilter.value = paramQuad;
    }
  }

  // Se veio etapa pela URL, força modo "etapas"
  if(etapaFilterId && viewMode){
    viewMode.value = "etapas";
    etapaNotice.style.display = "block";
    if(verTudoLink) verTudoLink.href = `acervo.html?ano=${currentYear}`;
  }

  async function render(){
    const itemsRaw = (acervoAll[currentYear] || []).slice();

    // Adiciona álbum externo do Drive para 2025
    if (currentYear === "2025" && !itemsRaw.find(it => it.id === "drive-2025")) {
      itemsRaw.unshift({
        id: "drive-2025",
        tipo: "album",
        titulo: "Álbum de Fotos 2025 (Drive)",
        descricao: "Galeria oficial de fotos do Circuito 2025 no Google Drive.",
        data: "2025-12-31",
        arquivo: "https://drive.google.com/drive/folders/16wyFhrqblzjYa8gHuerUU08ENciXo4Dx?usp=sharing",
        thumb: "assets/banners/placeholder.jpg"
      });
    }
    const mode = etapaFilterId ? "etapas" : (viewMode?.value || "todos");
    const etapas = (mode === "etapas")
      ? (await loadJSON(`data/etapas_${currentYear}.json`)) || []
      : [];

    const items = autoAssignEtapa(itemsRaw, etapas);

    const quadId = quadFilter?.value || "";
    let filtered = items.filter(it=>{
      if(!quadId) return true;
      return String(it.quad_id) === String(quadId);
    });

    // aplica filtro por etapa se veio na URL
    if(etapaFilterId){
      filtered = filtered.filter(it => String(it.etapa_id) === etapaFilterId);
    }

    content.innerHTML = "";

    if(mode === "todos" || !etapas.length){
      const grid = document.createElement("div");
      grid.className = "media-grid";

      if(!filtered.length){
        grid.innerHTML = `<div class="muted">Nenhum item encontrado neste ano.</div>`;
      } else {
        filtered
          .sort((a,b)=> (b.data||"").localeCompare(a.data||""))
          .forEach(it => grid.appendChild(renderMediaCard(it, quadrilhasMap)));
      }

      content.appendChild(grid);
      return;
    }

    // modo por etapas
    const byEtapa = groupByEtapa(filtered);
    const ordenadas = etapas.slice().sort((a,b)=> (a.data||"").localeCompare(b.data||""));

  if(etapaFilterId){
    // render apenas a etapa solicitada
    const etapa = ordenadas.find(e => String(e.id) === etapaFilterId);
    if(etapa){
      const list = byEtapa.get(etapaFilterId) || [];
      const sec = renderEtapaSection(etapa, list, quadrilhasMap, true);
      if(sec) content.appendChild(sec);
    } else {
      content.innerHTML = `<div class="muted">Etapa não encontrada neste ano.</div>`;
    }
  } else {
    // render todas as etapas
    let renderedCount = 0;
    ordenadas.forEach(et=>{
      const list = byEtapa.get(String(et.id)) || [];
      const sec = renderEtapaSection(et, list, quadrilhasMap, false);
      if(sec){
        content.appendChild(sec);
        renderedCount++;
      }
    });

    const geral = byEtapa.get("geral") || [];
    if(geral.length){
      const fake = { id:"geral", nome:"Conteúdos gerais da Liga" };
      const sec = renderEtapaSection(fake, geral, quadrilhasMap, false);
      if(sec){
        content.appendChild(sec);
        renderedCount++;
      }
    }

    if(renderedCount === 0){
      content.innerHTML = `<div class="muted">Ainda não há mídia cadastrada para este ano.</div>`;
    }
  }

    // reveal
    const els = document.querySelectorAll(".reveal");
    const obs = new IntersectionObserver((entries)=>{
      entries.forEach(e=>{
        if(e.isIntersecting){
          e.target.classList.add("show");
          obs.unobserve(e.target);
        }
      });
    }, { threshold:.12 });
    els.forEach(el=>obs.observe(el));
  }

  yearTabs?.addEventListener("click", (e)=>{
    const btn = e.target.closest(".tab-btn");
    if(!btn) return;
    currentYear = btn.dataset.year;

    // troca visual das tabs
    yearTabs.querySelectorAll(".tab-btn").forEach(b=> b.classList.toggle("active", b===btn));

    // se estava filtrado por etapa, mantém ano no link "ver tudo"
    if(etapaFilterId && verTudoLink){
      verTudoLink.href = `acervo.html?ano=${currentYear}`;
    }

    render();
  });

  quadFilter?.addEventListener("change", render);
  viewMode?.addEventListener("change", render);

  render();

})();


