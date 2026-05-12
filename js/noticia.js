// js/noticia.js
// Pgina de detalhe de Notícia da LINQ-DFE (site pblico)
// Busca Notícias no Firestore (coleo "noticias") e exibe com layout melhorado

import {
  formatDate,
  sanitizeHTML,
  setActiveNav,
  normalizeImageUrl,
  loadJSON,
} from "./shared.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

if (!window.RUNTIME_CONFIG || !window.RUNTIME_CONFIG.firebase) {
  console.error("Configuracao ausente: crie js/runtime-config.js a partir do example.");
  throw new Error("Configuracao ausente: crie js/runtime-config.js a partir do example.");
}

const firebaseConfig = window.RUNTIME_CONFIG.firebase;
const STATIC_NEWS_MANIFEST = "data/noticias-static-slugs.json";

let firebaseApp = null;
let firestoreDb = null;
let noticiaAtual = null;
let outrasNoticias = [];
let noticiasCache = [];
const staticNoticiasSlugs = new Set();
const CACHE_KEY = "noticiasCacheV1";
const CACHE_TTL = 10 * 60 * 1000; // 10 minutos

const faqItems = [
  {
    question: "O que é a LINQ-DFE?",
    answer:
      "A LINQ-DFE é a Liga Independente de Quadrilhas Juninas do DF e Entorno, responsável por organizar e fortalecer o circuito de quadrilhas.",
  },
  {
    question: "Onde encontro o calendário e resultados do circuito?",
    answer:
      "O calendário, resultados e regulamentos estão reunidos na página do Circuito e nas temporadas anteriores.",
  },
  {
    question: "Como acompanhar as notícias da Liga?",
    answer:
      "Acompanhe as publicações na página de Notícias e no portal oficial da LINQ-DFE.",
  },
];

function buildLeadText(resumo = "") {
  const base =
    resumo ||
    "Atualizações do Circuito de Quadrilhas Juninas da LINQ-DFE para o DF e Entorno.";
  const needsCircuito = !base.toLowerCase().includes("circuito");
  const needsDF = !base.toLowerCase().includes("df");
  const suffix = [
    needsCircuito ? "Circuito de Quadrilhas" : "",
    needsDF ? "DF e Entorno" : "",
  ]
    .filter(Boolean)
    .join(" • ");
  return suffix ? `${base} ${suffix}.` : base;
}

function rememberStaticNoticias(items = []) {
  items.forEach((item) => {
    const slug = String(
      typeof item === "string" ? item : item?.slug || ""
    ).trim();
    if (slug) {
      staticNoticiasSlugs.add(slug);
    }
  });
  return items;
}

async function ensureStaticNoticiasManifest() {
  if (staticNoticiasSlugs.size) return;
  const local = (await loadJSON(STATIC_NEWS_MANIFEST)) || [];
  rememberStaticNoticias(local);
}

function getNoticiaUrl(noticia) {
  const slug = String(noticia?.slug || "").trim();
  if (slug && staticNoticiasSlugs.has(slug)) {
    return `/noticias/${encodeURIComponent(slug)}/`;
  }

  const params = new URLSearchParams();
  if (noticia?.id) {
    params.set("id", noticia.id);
  }
  if (slug) {
    params.set("slug", slug);
  }

  const query = params.toString();
  if (query) {
    return `/noticia.html?${query}`;
  }
  return "/noticias.html";
}

function isLegacyNoticiaRoute(pathname = window.location.pathname || "") {
  return /\/noticia(?:\.html)?$/i.test(pathname);
}

function getSlugFromPath() {
  const match = (window.location.pathname || "").match(
    /\/noticias?\/([^/?#]+?)(?:\/|\.html)?$/
  );
  return match ? match[1] : "";
}

function ensureFirestore() {
  if (firestoreDb) return firestoreDb;
  firebaseApp = firebaseApp || initializeApp(firebaseConfig);
  firestoreDb = getFirestore(firebaseApp);
  return firestoreDb;
}

function readCache() {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const fresh = Date.now() - (parsed?.timestamp || 0) < CACHE_TTL;
    if (!fresh || !Array.isArray(parsed?.items)) return null;
    return parsed.items;
  } catch (e) {
    return null;
  }
}

function writeCache(items) {
  try {
    sessionStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ items, timestamp: Date.now() })
    );
  } catch (e) {
    // ignore
  }
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
  const normalized = normalizeImageUrl(path, path);

  try {
    return new URL(normalized, window.location.href).href;
  } catch (e) {
    return window.location.href;
  }
}

function getCanonicalNoticiaUrl(noticia) {
  try {
    return new URL(getNoticiaUrl(noticia), window.location.origin).href;
  } catch (e) {
    return window.location.href;
  }
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

  const url = getCanonicalNoticiaUrl(noticia);
  const imageUrl = toAbsoluteUrl(
    normalizeImageUrl(noticia.imagemCard || noticia.imagem, "assets/logos/linq-dfe.png")
  );

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
        url: toAbsoluteUrl("assets/logos/linq-dfe.png"),
      },
    },
  };

  ldScript.textContent = JSON.stringify(ldJson);

  const faqId = "ld-json-faq";
  let faqScript = document.getElementById(faqId);
  if (!faqScript) {
    faqScript = document.createElement("script");
    faqScript.type = "application/ld+json";
    faqScript.id = faqId;
    head.appendChild(faqScript);
  }

  const faqJson = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  faqScript.textContent = JSON.stringify(faqJson);
}

function renderNoticia() {
  const contentEl = document.getElementById("noticiaContent");
  const maisNoticiasSection = document.getElementById("noticiaMaisNoticias");
  const relacionadasGrid = document.getElementById("noticiaRelacionadas");

  if (!noticiaAtual) {
    if (contentEl) {
      contentEl.innerHTML =
        "<p>não encontramos esta Notícia. Ela pode ter sido removida ou o link est incorreto.</p>";
    }
    if (maisNoticiasSection) maisNoticiasSection.style.display = "none";
    return;
  }

  const {
    titulo,
    data,
    categoria,
    conteudo,
    imagem,
    imagemCard,
    resumo,
    lead,
    tags,
    imagemHeroFit,
    imagemHeroFocoX,
    imagemHeroFocoY,
  } = noticiaAtual;

  const dataFormatada = data ? formatDate(data) : "";
  const categoriaLabel = categoria || "";
  const metaText = [dataFormatada, categoriaLabel].filter(Boolean).join(" . ");

  const cover = normalizeImageUrl(imagem || imagemCard, "assets/banners/placeholder.jpg");
  const heroFit = imagemHeroFit || "cover";
  const heroPosX = Number.isFinite(imagemHeroFocoX) ? imagemHeroFocoX : 50;
  const heroPosY = Number.isFinite(imagemHeroFocoY) ? imagemHeroFocoY : 35;
  const coverSafe = sanitizeHTML(toAbsoluteUrl(cover));
  const tituloSafe = sanitizeHTML(titulo);

  if (contentEl) {
    const safeResumo = resumo ? sanitizeHTML(resumo) : "";
    const safeLead = lead ? sanitizeHTML(lead) : "";
    const leadText = safeLead || safeResumo;
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
    const leiaTambemHtml = `
      <aside class="noticia-relacionados">
        <h2>Leia também</h2>
        <ul>
          <li><a href="/circuito.html">Circuito de Quadrilhas Juninas</a></li>
          <li><a href="/temporada-2025.html">Ranking e resultados 2025</a></li>
          <li><a href="/quadrilhas.html">Quadrilhas</a></li>
          <li><a href="/noticias.html">Mais notícias</a></li>
          <li><a href="/documentos.html">Documentos oficiais</a></li>
        </ul>
      </aside>
    `;
    const faqHtml = `
      <section class="noticia-faq">
        <h2>Perguntas frequentes</h2>
        ${faqItems
          .map(
            (item) => `
          <div class="faq-item">
            <h3>${sanitizeHTML(item.question)}</h3>
            <p>${sanitizeHTML(item.answer)}</p>
          </div>
        `
          )
          .join("")}
      </section>
    `;

    contentEl.innerHTML = `
      <article class="noticia-page">
        <header class="noticia-hero" style="--capa: url('${coverSafe}'); background-position: ${heroPosX}% ${heroPosY}%; background-size: ${heroFit};">
          <div class="noticia-hero__img">
            <img src="${coverSafe}" alt="${tituloSafe}" loading="lazy"
                 style="object-fit:${heroFit}; object-position:${heroPosX}% ${heroPosY}%;"
                 onerror="this.src='/assets/banners/placeholder.jpg'" />
          </div>
          <div class="noticia-hero__overlay">
            ${metaText ? `<p class="noticia-meta">${metaText}</p>` : ""}
            <h1>${tituloSafe}</h1>
            ${resumoHtml}
            ${htmlTags}
          </div>
        </header>

        <div class="noticia-body noticia-conteudo">
          ${leadText ? `<p class="noticia-lead">${leadText}</p>` : ""}
          ${corpoHtml}
          ${leiaTambemHtml}
          ${faqHtml}
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
          const url = getNoticiaUrl(n);
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
    lead: data.lead || data.paragrafoInicial || "",
    conteudo: data.conteudo || "",
    imagem: data.imagemHeroUrl || data.imagemCapaUrl || data.imagem || "",
    imagemCard:
      data.imagemCardUrl ||
      data.imagemHeroUrl ||
      data.imagemCapaUrl ||
      data.imagem ||
      "",
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
    lead: item.lead || item.paragrafoInicial || "",
    conteudo: item.conteudo || "",
    imagem: item.imagemHeroUrl || item.imagemCapaUrl || item.imagem || "",
    imagemCard:
      item.imagemCardUrl ||
      item.imagemHeroUrl ||
      item.imagemCapaUrl ||
      item.imagem ||
      "",
    imagemHeroFit: item.imagemHeroFit || item.imagemCapaFit || "cover",
    imagemHeroFocoX: Number.isFinite(item.imagemHeroFocoX)
      ? item.imagemHeroFocoX
      : Number.isFinite(item.imagemCapaFocoX)
      ? item.imagemCapaFocoX
      : 50,
    imagemHeroFocoY: Number.isFinite(item.imagemHeroFocoY)
      ? item.imagemHeroFocoY
      : Number.isFinite(item.imagemCapaFocoY)
      ? item.imagemCapaFocoY
      : 35,
    tags: Array.isArray(item.tags) ? item.tags : [],
    categoria: item.categoria || "",
    data: dataIso,
    dataISO: dataIso,
    destaqueHome: !!item.destaqueHome,
    slug: item.slug || "",
  };
}

async function loadNoticiasLocal() {
  const local = (await loadJSON("data/noticias.json")) || [];
  return rememberStaticNoticias(
    local.map(mapJsonNoticia).filter((n) => {
      const status = (n.status || "").toString().toLowerCase();
      return !status || status === "publicada";
    })
  );
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
    console.error("não foi possvel carregar Notícias do Firestore.", error);
    return [];
  }
}

async function fetchNoticiaById(id) {
  if (!id) return null;
  try {
    const db = ensureFirestore();
    const snap = await getDoc(doc(db, "noticias", id));
    if (!snap.exists()) return null;
    const mapped = mapFirestoreNoticia(snap);
    if ((mapped.status || "").toLowerCase() !== "publicada") return null;
    return mapped;
  } catch (err) {
    console.error("Erro ao buscar Notícia por id:", err);
    return null;
  }
}

async function fetchNoticiaBySlug(slug) {
  if (!slug) return null;
  try {
    const items = await fetchNoticias();
    return items.find((item) => item.slug && item.slug === slug) || null;
  } catch (err) {
    console.error("Erro ao buscar Noticia por slug:", err);
    return null;
  }
}

async function loadNoticia() {
  const params = new URLSearchParams(window.location.search);
  const idParam = params.get("id");
  const slugParam = params.get("slug") || getSlugFromPath();

  const contentEl = document.getElementById("noticiaContent");
  if (
    contentEl?.dataset?.static === "true" &&
    !idParam &&
    !params.get("slug")
  ) {
    return;
  }
  if (contentEl) {
    contentEl.innerHTML = "<p>Carregando Notícia...</p>";
  }

  try {
    await ensureStaticNoticiasManifest();

    if (
      slugParam &&
      staticNoticiasSlugs.has(slugParam) &&
      isLegacyNoticiaRoute()
    ) {
      window.location.replace(`/noticias/${encodeURIComponent(slugParam)}/`);
      return;
    }

    const cached = readCache();
    if (cached) {
      noticiasCache = cached;
    }

    if (!noticiasCache.length) {
      noticiasCache = await fetchNoticias();
      if (!noticiasCache.length) {
        noticiasCache = await loadNoticiasLocal();
      }
      writeCache(noticiasCache);
    }

    if (!Array.isArray(noticiasCache) || !noticiasCache.length) {
      if (contentEl) {
        contentEl.innerHTML = "<p>Nenhuma Notícia encontrada.</p>";
      }
      return;
    }

    let encontrada = null;

    if (idParam) {
      encontrada = noticiasCache.find(
        (item) => String(item.id) === String(idParam)
      );
      const freshById = await fetchNoticiaById(idParam);
      if (freshById) {
        encontrada = freshById;
        noticiasCache = [
          freshById,
          ...noticiasCache.filter((item) => item.id !== freshById.id),
        ];
        writeCache(noticiasCache);
      }
    }

    if (!encontrada && slugParam) {
      encontrada = noticiasCache.find(
        (item) => item.slug && item.slug === slugParam
      );
    }

    if (slugParam) {
      const freshBySlug = await fetchNoticiaBySlug(slugParam);
      if (freshBySlug) {
        encontrada = freshBySlug;
        noticiasCache = [
          freshBySlug,
          ...noticiasCache.filter((item) => item.id !== freshBySlug.id),
        ];
        writeCache(noticiasCache);
      }
    }

    if (!encontrada) {
      const localNoticias = await loadNoticiasLocal();
      const localMatch = idParam
        ? localNoticias.find((item) => String(item.id) === String(idParam))
        : localNoticias.find((item) => item.slug && item.slug === slugParam);
      if (localMatch) {
        encontrada = localMatch;
        noticiasCache = [localMatch, ...noticiasCache];
        writeCache(noticiasCache);
      }
    }

    if (!encontrada) {
      if (contentEl) {
        contentEl.innerHTML =
          "<p>não encontramos esta Notícia. Verifique se o link est correto.</p>";
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
    console.error("Erro ao carregar Notícia:", error);
    if (contentEl) {
      contentEl.innerHTML =
        "<p>Erro ao carregar a Notícia. Tente novamente mais tarde.</p>";
    }
  }
}

function init() {
  setActiveNav("noticias");
  loadNoticia();
}

window.addEventListener("DOMContentLoaded", init);
