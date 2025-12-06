// js/noticia.js
// Página de detalhe de notícia da LINQ-DFE (site público)
// Busca notícias no Firestore (coleção "noticias") e exibe com layout melhorado

import { formatDate, sanitizeHTML, setActiveNav } from "./shared.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

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
let noticiaAtual = null;
let outrasNoticias = [];
let noticiasCache = [];

function ensureFirestore() {
  if (firestoreDb) return firestoreDb;
  firebaseApp = firebaseApp || initializeApp(firebaseConfig);
  firestoreDb = getFirestore(firebaseApp);
  return firestoreDb;
}

function extractPlainText(html = "", maxLength = 160) {
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  const text = (tmp.textContent || tmp.innerText || "").trim();
  if (!maxLength || text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "...";
}

function toAbsoluteUrl(path) {
  if (!path) return window.location.href;
  if (/^https?:\/\//i.test(path)) return path;
  const base = window.location.origin.replace(/\/$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return base + normalizedPath;
}

function updateSEO(noticia) {
  if (!noticia) return;

  const siteName = "LINQ-DFE";
  const baseTitle = sanitizeHTML(noticia.titulo || "Notícia");
  const pageTitle = `${baseTitle} | ${siteName}`;

  const resumo =
    noticia.resumo ||
    extractPlainText(noticia.conteudo || "", 180) ||
    "Notícias da Liga Independente de Quadrilhas Juninas do DF e Entorno.";
  const safeDescription = sanitizeHTML(resumo);

  document.title = pageTitle;
  const head = document.head;

  function setOrCreateMeta(selector, attrName, attrValue, content) {
    if (!content) return;
    let meta = head.querySelector(selector);
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute(attrName, attrValue);
      head.appendChild(meta);
    }
    meta.setAttribute("content", content);
  }

  const url = window.location.href;
  const imageUrl = noticia.imagem
    ? toAbsoluteUrl(noticia.imagem)
    : toAbsoluteUrl("/assets/img/share-default-linq.png");

  setOrCreateMeta('meta[name="description"]', "name", "description", safeDescription);

  setOrCreateMeta('meta[property="og:title"]', "property", "og:title", pageTitle);
  setOrCreateMeta(
    'meta[property="og:description"]',
    "property",
    "og:description",
    safeDescription
  );
  setOrCreateMeta("meta[property='og:type']", "property", "og:type", "article");
  setOrCreateMeta("meta[property='og:url']", "property", "og:url", url);
  setOrCreateMeta("meta[property='og:image']", "property", "og:image", imageUrl);
  setOrCreateMeta(
    "meta[property='og:site_name']",
    "property",
    "og:site_name",
    siteName
  );

  setOrCreateMeta(
    'meta[name="twitter:card"]',
    "name",
    "twitter:card",
    "summary_large_image"
  );
  setOrCreateMeta(
    'meta[name="twitter:title"]',
    "name",
    "twitter:title",
    pageTitle
  );
  setOrCreateMeta(
    'meta[name="twitter:description"]',
    "name",
    "twitter:description",
    safeDescription
  );
  setOrCreateMeta(
    'meta[name="twitter:image"]',
    "name",
    "twitter:image",
    imageUrl
  );

  let canonical = head.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.setAttribute("rel", "canonical");
    head.appendChild(canonical);
  }
  canonical.setAttribute("href", url);

  const ldId = "ld-json-noticia";
  let ldScript = document.getElementById(ldId);
  if (!ldScript) {
    ldScript = document.createElement("script");
    ldScript.type = "application/ld+json";
    ldScript.id = ldId;
    head.appendChild(ldScript);
  }

  const dataISO = noticia.dataISO || noticia.data || null;

  const ldJson = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: baseTitle,
    description: safeDescription,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    image: [imageUrl],
    datePublished: dataISO,
    dateModified: dataISO,
    author: {
      "@type": "Organization",
      name: "Liga Independente de Quadrilhas Juninas do DF e Entorno",
    },
    publisher: {
      "@type": "Organization",
      name: siteName,
      logo: {
        "@type": "ImageObject",
        url: toAbsoluteUrl("/assets/img/logo-linqdf.png"),
      },
    },
  };

  ldScript.textContent = JSON.stringify(ldJson);
}

function renderNoticia() {
  const contentEl = document.getElementById("noticiaContent");
  const maisNoticiasSection = document.getElementById("noticiaMaisNoticias");
  const relacionadasGrid = document.getElementById("noticiaRelacionadas");

  if (!noticiaAtual) {
    if (contentEl) {
      contentEl.innerHTML =
        "<p>Não encontramos esta notícia. Ela pode ter sido removida ou o link está incorreto.</p>";
    }
    if (maisNoticiasSection) maisNoticiasSection.style.display = "none";
    return;
  }

  const { titulo, data, categoria, conteudo, imagem, resumo, tags } = noticiaAtual;

  const dataFormatada = data ? formatDate(data) : "";
  const categoriaLabel = categoria || "";
  const metaText = [dataFormatada, categoriaLabel].filter(Boolean).join(" • ");

  const cover = imagem || "assets/banners/placeholder.jpg";
  const coverSafe = sanitizeHTML(cover);
  const tituloSafe = sanitizeHTML(titulo);

  if (contentEl) {
    const safeResumo = resumo ? sanitizeHTML(resumo) : "";
    const htmlTags =
      Array.isArray(tags) && tags.length
        ? `<div class="noticia-tags">
             ${tags
               .map(
                 (tag) =>
                   `<span class="tag-chip">${sanitizeHTML(String(tag))}</span>`
               )
               .join("")}
           </div>`
        : "";

    const resumoHtml = safeResumo
      ? `<p class="noticia-resumo">${safeResumo}</p>`
      : "";

    const corpoHtml = conteudo || "";

    contentEl.innerHTML = `
      <article class="noticia-page">
        <header class="noticia-hero" style="--capa: url('${coverSafe}');">
          <div class="noticia-hero__img">
            <img src="${coverSafe}" alt="${tituloSafe}" loading="lazy" onerror="this.src='assets/banners/placeholder.jpg'" />
          </div>
          <div class="noticia-hero__overlay">
            ${metaText ? `<p class="noticia-meta">${metaText}</p>` : ""}
            <h1>${tituloSafe}</h1>
            ${resumoHtml}
            ${htmlTags}
          </div>
        </header>

        <div class="noticia-body noticia-conteudo">
          ${corpoHtml}
        </div>
      </article>
    `;
  }

  if (maisNoticiasSection && relacionadasGrid) {
    if (!outrasNoticias.length) {
      maisNoticiasSection.style.display = "none";
    } else {
      maisNoticiasSection.style.display = "";
      const itensHtml = outrasNoticias
        .map((n) => {
          const url = `noticia.html?id=${encodeURIComponent(n.id)}`;
          const dataItem = n.data ? formatDate(n.data) : "";
          return `
            <article class="news-card">
              <a href="${url}" class="card">
                <div class="card-body">
                  <h3 class="card-title">${sanitizeHTML(n.titulo)}</h3>
                  ${
                    dataItem
                      ? `<p class="card-meta">${dataItem}</p>`
                      : ""
                  }
                  ${
                    n.resumo
                      ? `<p class="card-text">${sanitizeHTML(n.resumo)}</p>`
                      : ""
                  }
                </div>
              </a>
            </article>
          `;
        })
        .join("");

      relacionadasGrid.innerHTML = itensHtml;
    }
  }

  updateSEO(noticiaAtual);
}

function mapFirestoreNoticia(docSnap) {
  const data = docSnap.data() || {};
  const dataRef =
    data.dataPublicacao || data.dataAtualizacao || data.dataCriacao || null;
  const dataJs =
    dataRef && dataRef.toDate ? dataRef.toDate() : dataRef ? new Date(dataRef) : null;
  const dataIso = dataJs ? dataJs.toISOString() : "";

  return {
    id: docSnap.id,
    titulo: data.titulo || "",
    resumo: data.resumo || "",
    conteudo: data.conteudo || "",
    imagem: data.imagemCapaUrl || data.imagem || "",
    tags: Array.isArray(data.tags) ? data.tags : [],
    categoria: data.categoria || data.category || "",
    data: dataIso,
    dataISO: dataIso,
    destaqueHome: !!data.destaqueHome,
    slug: data.slug || "",
    status: data.status || "",
  };
}

function mapJsonNoticia(item) {
  const dataJs = item.data ? new Date(item.data) : null;
  const dataIso = dataJs ? dataJs.toISOString() : item.data || "";
  return {
    id: item.id,
    titulo: item.titulo || "",
    resumo: item.resumo || "",
    conteudo: item.conteudo || "",
    imagem: item.imagem || "",
    tags: Array.isArray(item.tags) ? item.tags : [],
    categoria: item.categoria || "",
    data: dataIso,
    dataISO: dataIso,
    destaqueHome: !!item.destaqueHome,
    slug: item.slug || "",
  };
}

async function fetchNoticias() {
  try {
    const db = ensureFirestore();
    const snap = await getDocs(collection(db, "noticias"));
    const items = [];
    snap.forEach((docSnap) => items.push(mapFirestoreNoticia(docSnap)));
    return items.filter((n) => {
      const status = (n.status || "").toString().toLowerCase();
      return status === "publicada";
    });
  } catch (error) {
    console.error("Não foi possível carregar notícias do Firestore.", error);
    return [];
  }
}

async function loadNoticia() {
  const params = new URLSearchParams(window.location.search);
  const idParam = params.get("id");
  const slugParam = params.get("slug");

  const contentEl = document.getElementById("noticiaContent");
  if (contentEl) {
    contentEl.innerHTML = "<p>Carregando notícia...</p>";
  }

  try {
    if (!noticiasCache.length) {
      noticiasCache = await fetchNoticias();
    }

    if (!Array.isArray(noticiasCache) || !noticiasCache.length) {
      if (contentEl) {
        contentEl.innerHTML = "<p>Nenhuma notícia encontrada.</p>";
      }
      return;
    }

    let encontrada = null;

    if (idParam) {
      encontrada = noticiasCache.find(
        (item) => String(item.id) === String(idParam)
      );
    }

    if (!encontrada && slugParam) {
      encontrada = noticiasCache.find(
        (item) => item.slug && item.slug === slugParam
      );
    }

    if (!encontrada) {
      if (contentEl) {
        contentEl.innerHTML =
          "<p>Não encontramos esta notícia. Verifique se o link está correto.</p>";
      }
      return;
    }

    noticiaAtual = encontrada;

    outrasNoticias = noticiasCache
      .filter((item) => String(item.id) !== String(encontrada.id))
      .sort((a, b) => {
        const da = a.data ? new Date(a.data).getTime() : 0;
        const db = b.data ? new Date(b.data).getTime() : 0;
        return db - da;
      })
      .slice(0, 4);

    renderNoticia();
  } catch (error) {
    console.error("Erro ao carregar notícia:", error);
    if (contentEl) {
      contentEl.innerHTML =
        "<p>Erro ao carregar a notícia. Tente novamente mais tarde.</p>";
    }
  }
}

function init() {
  setActiveNav("noticias");
  loadNoticia();
}

window.addEventListener("DOMContentLoaded", init);
