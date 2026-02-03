import { loadJSON, normalizeImageUrl } from "./shared.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", loadHomeNews);

if (!window.RUNTIME_CONFIG || !window.RUNTIME_CONFIG.firebase) {
  console.error("Configuracao ausente: crie js/runtime-config.js a partir do example.");
  throw new Error("Configuracao ausente: crie js/runtime-config.js a partir do example.");
}

const firebaseConfig = window.RUNTIME_CONFIG.firebase;

let firebaseApp = null;
let firestoreDb = null;

function ensureFirestore() {
  if (firestoreDb) return firestoreDb;
  firebaseApp = firebaseApp || initializeApp(firebaseConfig);
  firestoreDb = getFirestore(firebaseApp);
  return firestoreDb;
}

function parseDateValue(value) {
  if (!value) return null;
  if (typeof value === "object" && typeof value.toDate === "function") {
    return value.toDate();
  }
  if (value instanceof Date) {
    return value;
  }
  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  return null;
}

function getLatestDate(...values) {
  return values
    .map(parseDateValue)
    .filter((date) => date)
    .reduce((latest, current) => (!latest || current > latest ? current : latest), null);
}

async function fetchNoticiasFirestore() {
  try {
    const db = ensureFirestore();
    const snap = await getDocs(collection(db, "noticias"));
    const items = [];
    snap.forEach((doc) => {
      const data = doc.data() || {};
      const latestDate = getLatestDate(
        data.dataPublicacao,
        data.dataAtualizacao,
        data.dataCriacao,
        data.updatedAt,
        data.data,
        data.date
      );
      items.push({
        id: doc.id,
        titulo: data.titulo || "",
        resumo: data.resumo || "",
        imagem: data.imagemHeroUrl || data.imagemCapaUrl || data.imagem || "",
        imagemHeroFit: data.imagemHeroFit || data.imagemCapaFit || "cover",
        imagemHeroFocoX: Number.isFinite(data.imagemHeroFocoX)
          ? data.imagemHeroFocoX
          : Number.isFinite(data.imagemCapaFocoX)
          ? data.imagemCapaFocoX
          : 50,
        imagemHeroFocoY: Number.isFinite(data.imagemHeroFocoY)
          ? data.imagemHeroFocoY
          : Number.isFinite(data.imagemCapaFocoY)
          ? data.imagemCapaFocoY
          : 35,
        imagemCard: data.imagemCardUrl || data.imagemHeroUrl || data.imagemCapaUrl || data.imagem || "",
        imagemCardFit: data.imagemCardFit || data.imagemHeroFit || data.imagemCapaFit || "cover",
        imagemCardFocoX: Number.isFinite(data.imagemCardFocoX)
          ? data.imagemCardFocoX
          : Number.isFinite(data.imagemHeroFocoX)
          ? data.imagemHeroFocoX
          : Number.isFinite(data.imagemCapaFocoX)
          ? data.imagemCapaFocoX
          : 50,
        imagemCardFocoY: Number.isFinite(data.imagemCardFocoY)
          ? data.imagemCardFocoY
          : Number.isFinite(data.imagemHeroFocoY)
          ? data.imagemHeroFocoY
          : Number.isFinite(data.imagemCapaFocoY)
          ? data.imagemCapaFocoY
          : 35,
        data: latestDate ? latestDate.toISOString() : "",
        status: data.status || "",
        slug: data.slug || "",
      });
    });
    return items.filter((n) => (n.status || "").toLowerCase() === "publicada");
  } catch (err) {
    console.warn("Falha ao carregar notícias do Firestore, tentando JSON local.", err);
    return null;
  }
}

function mapJsonToNews(jsonList = []) {
  return jsonList.map((n) => {
    const latestDate = getLatestDate(
      n.dataPublicacao,
      n.dataAtualizacao,
      n.dataCriacao,
      n.updatedAt,
      n.data,
      n.date
    );
    return {
      id: n.id,
      titulo: n.titulo || n.title || "",
      resumo: n.resumo || n.excerpt || "",
      imagem: n.imagemHeroUrl || n.imagemCapaUrl || n.imagem || n.image || n.foto || "",
      imagemHeroFit: n.imagemHeroFit || n.imagemCapaFit || "cover",
      imagemHeroFocoX: Number.isFinite(n.imagemHeroFocoX)
        ? n.imagemHeroFocoX
        : Number.isFinite(n.imagemCapaFocoX)
        ? n.imagemCapaFocoX
        : 50,
      imagemHeroFocoY: Number.isFinite(n.imagemHeroFocoY)
        ? n.imagemHeroFocoY
        : Number.isFinite(n.imagemCapaFocoY)
        ? n.imagemCapaFocoY
        : 35,
      imagemCard: n.imagemCardUrl || n.imagemHeroUrl || n.imagemCapaUrl || n.imagem || n.image || n.foto || "",
      imagemCardFit: n.imagemCardFit || n.imagemHeroFit || n.imagemCapaFit || "cover",
      imagemCardFocoX: Number.isFinite(n.imagemCardFocoX)
        ? n.imagemCardFocoX
        : Number.isFinite(n.imagemHeroFocoX)
        ? n.imagemHeroFocoX
        : Number.isFinite(n.imagemCapaFocoX)
        ? n.imagemCapaFocoX
        : 50,
      imagemCardFocoY: Number.isFinite(n.imagemCardFocoY)
        ? n.imagemCardFocoY
        : Number.isFinite(n.imagemHeroFocoY)
        ? n.imagemHeroFocoY
        : Number.isFinite(n.imagemCapaFocoY)
        ? n.imagemCapaFocoY
        : 35,
      data: latestDate ? latestDate.toISOString() : n.data || n.date || "",
      slug: n.slug || "",
    };
  });
}

async function loadHomeNews() {
  const grid = document.getElementById("home-news-list");
  if (!grid) return;

  let noticias = (await fetchNoticiasFirestore()) || [];

  // fallback para JSON local se Firestore falhar
  if (!noticias.length) {
    const jsonLocal = (await loadJSON("data/noticias.json")) || [];
    noticias = mapJsonToNews(jsonLocal);
  }

  // ordena por data decrescente
  noticias.sort((a, b) => {
    const da = new Date(a.data || "2000-01-01").getTime();
    const db = new Date(b.data || "2000-01-01").getTime();
    return db - da;
  });

  const latest = noticias.slice(0, 3);

  if (!latest.length) {
    grid.innerHTML = `<p class="muted">Nenhuma notícia cadastrada ainda.</p>`;
    return;
  }

  grid.innerHTML = latest
    .map((n) => {
      const imgSrc = normalizeImagePath(n.imagemCard || n.imagem || "");
      const imgStyle = buildImageStyle(n.imagemCardFit, n.imagemCardFocoX, n.imagemCardFocoY);
      const imgHtml = imgSrc
        ? `<img src="${imgSrc}" alt="${escapeHtml(n.titulo)}" style="${imgStyle}" onerror="this.closest('.news-card').classList.add('no-image'); this.remove();">`
        : "";

      const dataTxt = n.data ? formatDateBR(n.data) : "";
      const url = n.slug
        ? `noticia.html?slug=${encodeURIComponent(n.slug)}`
        : `noticia.html?id=${encodeURIComponent(n.id || "")}`;

      return `
        <article class="news-card">
          <a href="${url}">
            ${imgHtml}
            <div class="news-card-body">
              ${dataTxt ? `<span class="news-date">${dataTxt}</span>` : ""}
              <h3>${escapeHtml(n.titulo)}</h3>
              ${n.resumo ? `<p>${escapeHtml(n.resumo)}</p>` : ""}
            </div>
          </a>
        </article>
      `;
    })
    .join("");
}

function formatDateBR(isoDate) {
  const d = new Date(isoDate);
  if (isNaN(d)) return "";
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function escapeHtml(str = "") {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function normalizeImagePath(path = "") {
  return normalizeImageUrl(path, "assets/banners/placeholder.jpg");
}

function buildImageStyle(fit, focoX, focoY) {
  const finalFit = fit || "cover";
  const x = Number.isFinite(focoX) ? focoX : 50;
  const y = Number.isFinite(focoY) ? focoY : 35;
  return `object-fit:${finalFit};object-position:${x}% ${y}%;`;
}
