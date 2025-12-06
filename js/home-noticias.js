import { loadJSON, normalizeImageUrl } from "./shared.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", loadHomeNews);

const firebaseConfig = {
  apiKey: "AIzaSyCm9ANrGwedzgdvCaSf05-qZsTPJMgrWOA",
  authDomain: "portal-da-liga.firebaseapp.com",
  projectId: "portal-da-liga",
  storageBucket: "portal-da-liga.firebasestorage.app",
  messagingSenderId: "129376570268",
  appId: "1:129376570268:web:b13e414ee188a189869659",
  measurementId: "G-2LS730BX44",
};

let firebaseApp = null;
let firestoreDb = null;

function ensureFirestore() {
  if (firestoreDb) return firestoreDb;
  firebaseApp = firebaseApp || initializeApp(firebaseConfig);
  firestoreDb = getFirestore(firebaseApp);
  return firestoreDb;
}

async function fetchNoticiasFirestore() {
  try {
    const db = ensureFirestore();
    const snap = await getDocs(collection(db, "noticias"));
    const items = [];
    snap.forEach((doc) => {
      const data = doc.data() || {};
      const dataRef =
        data.dataPublicacao || data.dataAtualizacao || data.dataCriacao || null;
      const dataJs =
        dataRef && dataRef.toDate ? dataRef.toDate() : dataRef ? new Date(dataRef) : null;
      items.push({
        id: doc.id,
        titulo: data.titulo || "",
        resumo: data.resumo || "",
        imagem: data.imagemCapaUrl || data.imagem || "",
        data: dataJs ? dataJs.toISOString() : "",
        status: data.status || "",
        slug: data.slug || "",
      });
    });
    return items.filter((n) => (n.status || "").toLowerCase() === "publicada");
  } catch (err) {
    console.warn("Falha ao carregar not¡cias do Firestore, tentando JSON local.", err);
    return null;
  }
}

function mapJsonToNews(jsonList = []) {
  return jsonList.map((n) => ({
    id: n.id,
    titulo: n.titulo || n.title || "",
    resumo: n.resumo || n.excerpt || "",
    imagem: n.imagemCapaUrl || n.imagem || n.image || n.foto || "",
    data: n.data || n.date || "",
    slug: n.slug || "",
  }));
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
    grid.innerHTML = `<p class="muted">Nenhuma not¡cia cadastrada ainda.</p>`;
    return;
  }

  grid.innerHTML = latest
    .map((n) => {
      const imgSrc = normalizeImagePath(n.imagem || "");
      const imgHtml = imgSrc
        ? `<img src="${imgSrc}" alt="${escapeHtml(n.titulo)}" onerror="this.closest('.news-card').classList.add('no-image'); this.remove();">`
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


