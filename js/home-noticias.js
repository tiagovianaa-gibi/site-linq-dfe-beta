import { loadJSON } from "./shared.js";

document.addEventListener("DOMContentLoaded", loadHomeNews);

async function loadHomeNews() {
  const grid = document.getElementById("homeNewsGrid");
  if (!grid) return;

  const noticias = (await loadJSON("data/noticias.json")) || [];

  // aceita date OU data (pra não quebrar)
  noticias.sort((a, b) => {
    const da = new Date(a.date || a.data || "2000-01-01");
    const db = new Date(b.date || b.data || "2000-01-01");
    return db - da;
  });

  const latest = noticias.slice(0, 2);

  if (!latest.length) {
    grid.innerHTML = `<p class="muted">Nenhuma notícia cadastrada ainda.</p>`;
    return;
  }

  grid.innerHTML = latest.map(n => {
    const rawImg = n.imagem || n.image || n.foto || "";
let imgSrc = rawImg;

// se vier só o nome do arquivo, prefixa a pasta padrão
if (
  imgSrc &&
  !imgSrc.startsWith("http") &&
  !imgSrc.startsWith("assets/")
) {
  imgSrc = `assets/noticias/${imgSrc}`;
}

    const imgHtml = imgSrc
      ? `<img src="${imgSrc}" alt="${n.title || n.titulo || ""}" onerror="this.remove()">`
      : "";

    const titulo = n.title || n.titulo || "Notícia";
    const resumo = n.excerpt || n.resumo || "";
    const url = n.url || (n.id != null ? `noticia.html?id=${n.id}` : "noticias.html");
    const dataIso = n.date || n.data;
    const dataTxt = dataIso ? formatDateBR(dataIso) : "";

    return `
      <article class="news-card">
        <a href="${url}">
          ${imgHtml}
          <div class="news-card-body">
            ${dataTxt ? `<span class="news-date">${dataTxt}</span>` : ""}
            <h3>${titulo}</h3>
            ${resumo ? `<p>${resumo}</p>` : ""}
          </div>
        </a>
      </article>
    `;
  }).join("");
}

function formatDateBR(isoDate) {
  const d = new Date(isoDate);
  if (isNaN(d)) return "";
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  });
}
