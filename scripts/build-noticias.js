const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const NOTICIAS_HTML = path.join(ROOT, "noticias.html");
const NOTICIA_TEMPLATE = path.join(ROOT, "noticia.html");
const NOTICIA_DIR = path.join(ROOT, "noticia");
const DATA_FILE = path.join(ROOT, "data", "noticias.json");
const JS_CONFIG_FILES = [
  path.join(ROOT, "js", "noticias.js"),
  path.join(ROOT, "js", "noticia.js"),
];

const TITLE = "Noticias da LINQ-DFE | LINQ-DFE";
const DESCRIPTION =
  "Noticias da LINQ-DFE com agenda, comunicados e bastidores do circuito de quadrilhas juninas do DF e Entorno, atualizacoes oficiais e projetos.";
const CANONICAL = "https://linqdfe.com.br/noticias.html";
const BASE_URL = "https://linqdfe.com.br";
const OG_IMAGE = "https://linqdfe.com.br/assets/logos/linq-dfe.png";

const ORG_JSONLD = {
  "@type": "Organization",
  name: "LINQ-DFE",
  url: "https://linqdfe.com.br/",
  logo: "https://linqdfe.com.br/assets/logos/linq-dfe.png",
  sameAs: ["https://instagram.com/linqdfe"],
};

function readFileSafe(filePath) {
  if (!fs.existsSync(filePath)) return "";
  return fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, "");
}

function updateCharset(html) {
  const pattern = new RegExp("<meta\\s+charset=\"[^\"]*\">", "i");
  const replacement = '<meta charset="utf-8">';
  return pattern.test(html) ? html.replace(pattern, replacement) : insertBeforeHeadClose(html, replacement);
}

function insertBeforeHeadClose(html, snippet) {
  const headClose = new RegExp("<\\/head>", "i");
  if (!headClose.test(html)) {
    throw new Error("Missing </head>.");
  }
  return html.replace(headClose, `${snippet}\n\n</head>`);
}

function updateTitle(html, title) {
  const pattern = new RegExp("<title>.*?<\\/title>", "i");
  const replacement = `<title>${title}</title>`;
  return pattern.test(html) ? html.replace(pattern, replacement) : insertBeforeHeadClose(html, replacement);
}

function updateMeta(html, name, content) {
  const pattern = new RegExp(`<meta\\s+name="${name}"[^>]*>`, "gi");
  const replacement = `<meta name="${name}" content="${content}">`;
  const stripped = html.replace(pattern, "");
  return insertBeforeHeadClose(stripped, replacement);
}

function updateOg(html, property, content) {
  const pattern = new RegExp(`<meta\\s+property="${property}"[^>]*>`, "gi");
  const replacement = `<meta property="${property}" content="${content}">`;
  const stripped = html.replace(pattern, "");
  return insertBeforeHeadClose(stripped, replacement);
}

function updateCanonical(html, href) {
  const pattern = new RegExp('<link\\s+rel="canonical"[^>]*>', "gi");
  const replacement = `<link rel="canonical" href="${href}">`;
  const stripped = html.replace(pattern, "");
  return insertBeforeHeadClose(stripped, replacement);
}

function toSitePath(value, fallback = "") {
  let url = String(value || "").trim();
  if (!url) {
    url = String(fallback || "").trim();
  }
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  if (/^data:/i.test(url)) {
    return toSitePath(fallback, "");
  }

  const clean = encodeURI(url.replace(/^\.?\//, "").replace(/^\/+/, ""));
  if (!clean) return "";
  return `/${clean}`;
}

function toAbsoluteSiteUrl(value, fallback = OG_IMAGE) {
  const normalized = toSitePath(value, fallback);
  if (!normalized) return "";
  if (/^https?:\/\//i.test(normalized)) return normalized;
  return `${BASE_URL}${normalized}`;
}

function slugify(text) {
  if (!text) return "";
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\\s-]/g, "")
    .replace(/\\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

function extractFirebaseConfig() {
  for (const filePath of JS_CONFIG_FILES) {
    const content = readFileSafe(filePath);
    if (!content) continue;
    const apiKeyMatch = content.match(/apiKey:\\s*\"([^\"]+)\"/);
    const projectMatch = content.match(/projectId:\\s*\"([^\"]+)\"/);
    if (apiKeyMatch && projectMatch) {
      return { apiKey: apiKeyMatch[1], projectId: projectMatch[1] };
    }
  }
  return null;
}

function decodeFirestoreValue(value) {
  if (!value || typeof value !== "object") return null;
  if ("stringValue" in value) return value.stringValue;
  if ("booleanValue" in value) return Boolean(value.booleanValue);
  if ("integerValue" in value) return Number(value.integerValue);
  if ("doubleValue" in value) return Number(value.doubleValue);
  if ("timestampValue" in value) return value.timestampValue;
  if ("arrayValue" in value) {
    const values = value.arrayValue.values || [];
    return values.map(decodeFirestoreValue).filter((v) => v != null);
  }
  if ("mapValue" in value) {
    const fields = value.mapValue.fields || {};
    const obj = {};
    Object.keys(fields).forEach((key) => {
      obj[key] = decodeFirestoreValue(fields[key]);
    });
    return obj;
  }
  return null;
}

function toIsoDate(value) {
  if (!value) return "";
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? "" : value.toISOString().slice(0, 10);
  }
  if (typeof value === "object" && typeof value.toDate === "function") {
    const date = value.toDate();
    return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? "" : parsed.toISOString().slice(0, 10);
}

function mapFirestoreItem(data, id) {
  const dataRef = data.dataPublicacao || data.dataAtualizacao || data.dataCriacao || "";
  const dataIso = toIsoDate(dataRef);
  const heroFocoX = Number.isFinite(data.imagemHeroFocoX)
    ? data.imagemHeroFocoX
    : Number.isFinite(data.imagemCapaFocoX)
    ? data.imagemCapaFocoX
    : 50;
  const heroFocoY = Number.isFinite(data.imagemHeroFocoY)
    ? data.imagemHeroFocoY
    : Number.isFinite(data.imagemCapaFocoY)
    ? data.imagemCapaFocoY
    : 35;
  const cardFocoX = Number.isFinite(data.imagemCardFocoX)
    ? data.imagemCardFocoX
    : Number.isFinite(data.imagemHeroFocoX)
    ? data.imagemHeroFocoX
    : Number.isFinite(data.imagemCapaFocoX)
    ? data.imagemCapaFocoX
    : 50;
  const cardFocoY = Number.isFinite(data.imagemCardFocoY)
    ? data.imagemCardFocoY
    : Number.isFinite(data.imagemHeroFocoY)
    ? data.imagemHeroFocoY
    : Number.isFinite(data.imagemCapaFocoY)
    ? data.imagemCapaFocoY
    : 35;

  return {
    id,
    slug: data.slug || slugify(data.titulo || ""),
    titulo: data.titulo || "",
    subtitulo: data.subtitulo || "",
    resumo: data.resumo || "",
    lead: data.lead || data.paragrafoInicial || "",
    conteudo: data.conteudo || data.conteudoBruto || "",
    imagemHeroUrl: data.imagemHeroUrl || data.imagemCapaUrl || data.imagem || "",
    imagemHeroFit: data.imagemHeroFit || data.imagemCapaFit || "cover",
    imagemHeroFocoX: heroFocoX,
    imagemHeroFocoY: heroFocoY,
    imagemCardUrl:
      data.imagemCardUrl ||
      data.imagemHeroUrl ||
      data.imagemCapaUrl ||
      data.imagem ||
      "",
    imagemCardFit: data.imagemCardFit || data.imagemHeroFit || data.imagemCapaFit || "cover",
    imagemCardFocoX: cardFocoX,
    imagemCardFocoY: cardFocoY,
    tags: Array.isArray(data.tags) ? data.tags : [],
    categoria: data.categoria || "",
    data: dataIso,
    status: data.status || "",
  };
}

async function fetchNoticiasFromFirestore() {
  const config = extractFirebaseConfig();
  if (!config) return null;
  const { apiKey, projectId } = config;
  const url =
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/noticias` +
    `?key=${apiKey}`;

  const response = await fetch(url);
  if (!response.ok) {
    console.warn(`Falha ao carregar noticias via REST: ${response.status}`);
    return null;
  }
  const payload = await response.json();
  const docs = Array.isArray(payload.documents) ? payload.documents : [];
  return docs.map((doc) => {
    const fields = doc.fields || {};
    const data = {};
    Object.keys(fields).forEach((key) => {
      data[key] = decodeFirestoreValue(fields[key]);
    });
    const id = doc.name ? doc.name.split("/").pop() : data.id || "";
    return mapFirestoreItem(data, id);
  });
}

async function fetchNoticiasFromAdmin() {
  let admin = null;
  try {
    admin = require("firebase-admin");
  } catch (err) {
    try {
      admin = require(path.join(ROOT, "functions", "node_modules", "firebase-admin"));
    } catch (innerErr) {
      return null;
    }
  }

  try {
    if (!admin.apps.length) {
      const config = extractFirebaseConfig();
      const projectId =
        process.env.FIREBASE_PROJECT_ID ||
        process.env.GOOGLE_CLOUD_PROJECT ||
        config?.projectId ||
        undefined;
      admin.initializeApp(projectId ? { projectId } : {});
    }
    const snap = await admin.firestore().collection("noticias").get();
    return snap.docs.map((docSnap) => mapFirestoreItem(docSnap.data() || {}, docSnap.id));
  } catch (err) {
    console.warn("Falha ao carregar noticias via firebase-admin.", err?.message || err);
    return null;
  }
}

function loadNoticiasLocal() {
  const raw = readFileSafe(DATA_FILE);
  if (!raw) return [];
  try {
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch (err) {
    return [];
  }
}

async function loadNoticias() {
  const adminData = await fetchNoticiasFromAdmin();
  if (adminData && adminData.length) {
    return adminData;
  }
  const remote = await fetchNoticiasFromFirestore();
  if (remote && remote.length) {
    return remote;
  }
  return loadNoticiasLocal();
}

function normalizeNoticias(items) {
  return items
    .filter((n) => {
      const status = String(n.status || "").toLowerCase();
      return !status || status === "publicada";
    })
    .map((n) => {
      const slug = n.slug || slugify(n.titulo || n.id || "");
      return {
        id: n.id || slug,
        slug,
        titulo: n.titulo || "",
        resumo: n.subtitulo || n.resumo || "",
        lead: n.lead || n.paragrafoInicial || "",
        conteudo: n.conteudo || "",
        imagem: n.imagemHeroUrl || n.imagem || "assets/banners/placeholder.jpg",
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
        imagemCard: n.imagemCardUrl || n.imagemHeroUrl || n.imagemCapaUrl || n.imagem || "",
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
        tags: Array.isArray(n.tags) ? n.tags : [],
        categoria: n.categoria || "",
        data: n.data || "",
      };
    })
    .sort((a, b) => (b.data || "").localeCompare(a.data || ""));
}

function toListLink(item) {
  return item.slug
    ? `/noticia/${encodeURIComponent(item.slug)}.html`
    : `/noticia.html?id=${encodeURIComponent(item.id)}`;
}

function buildImageStyle(fit, focoX, focoY) {
  const finalFit = fit || "cover";
  const x = Number.isFinite(focoX) ? focoX : 50;
  const y = Number.isFinite(focoY) ? focoY : 35;
  return `object-fit:${finalFit}; object-position:${x}% ${y}%;`;
}

function buildManchetes(noticias) {
  return noticias.slice(0, 3).map((n) => {
    const href = toListLink(n);
    const img = n.imagemCard || n.imagem || "assets/banners/placeholder.jpg";
    const imgStyle = buildImageStyle(n.imagemCardFit, n.imagemCardFocoX, n.imagemCardFocoY);
    const dataLabel = n.data || "";
    return `
            <article class="card" style="overflow: hidden;">
              <a href="${href}" style="display:block; color: inherit; text-decoration:none;">
                <div style="position: relative; height: 220px; overflow: hidden;">
                  <img src="${img}" alt="${n.titulo}" style="width:100%; height:100%; ${imgStyle}" loading="lazy" onerror="this.src='assets/banners/placeholder.jpg'">
                  <div style="position:absolute; inset:0; background: linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.35) 100%);"></div>
                  <div style="position:absolute; left:0; right:0; bottom:0; padding: var(--spacing-md); color: #fff;">
                    <p style="font-size:0.9rem; opacity:0.9; margin:0 0 6px 0;">${dataLabel}</p>
                    <h3 style="margin:0; font-size:1.1rem; line-height:1.2;">${n.titulo}</h3>
                  </div>
                </div>
              </a>
            </article>
    `.trim();
  }).join("\n\n");
}

function buildLista(noticias) {
  return noticias.map((n) => {
    const href = toListLink(n);
    const img = n.imagemCard || n.imagem || "assets/banners/placeholder.jpg";
    const imgStyle = buildImageStyle(n.imagemCardFit, n.imagemCardFocoX, n.imagemCardFocoY);
    const dataLabel = n.data || "";
    const resumo = n.resumo || "";
    const tags = Array.isArray(n.tags) ? n.tags : [];
    const tagsHtml = tags.length
      ? `<div class="news-card-tags">${tags
          .slice(0, 2)
          .map((t) => `<span class="news-tag">${t}</span>`)
          .join("")}${tags.length > 2 ? `<span class="news-tag news-tag-more">+${tags.length - 2}</span>` : ""}</div>`
      : `<div class="news-card-tags" style="display:none;"></div>`;

    return `
            <article class="card" style="cursor: pointer;">
              <a href="${href}" style="display:block; color: inherit; text-decoration:none;">
                  <div style="display: flex; gap: var(--spacing-md); flex-direction: column;">
                  <div style="width: 100%; height: 180px; border-radius: var(--border-radius); overflow: hidden;">
                    <img src="${img}" alt="${n.titulo}" style="width:100%; height:100%; ${imgStyle}" loading="lazy" onerror="this.src='assets/banners/placeholder.jpg'">
                  </div>
                  <div class="card-body" style="flex: 1;">
                    <div class="card-meta" style="margin-bottom: var(--spacing-sm); font-size: 0.9rem;">
                      ${dataLabel ? `<span>${dataLabel}</span>` : ""}
                    </div>
                    ${tagsHtml}
                    <h3 class="card-title" style="margin-bottom: var(--spacing-xs);">${n.titulo}</h3>
                    <p class="card-text" style="margin-bottom: var(--spacing-sm);">${resumo}</p>
                    <span class="btn btn-light" style="margin-top: auto; align-self:flex-start;">Ler mais</span>
                  </div>
                </div>
              </a>
            </article>
    `.trim();
  }).join("\n\n");
}

function buildItemListJsonLd(items) {
  return JSON.stringify(
    {
      "@context": "https://schema.org",
      "@graph": [
        ORG_JSONLD,
        {
          "@type": "ItemList",
          name: "Noticias da LINQ-DFE",
          itemListOrder: "https://schema.org/ItemListUnordered",
          numberOfItems: items.length,
          itemListElement: items.map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: item.titulo,
            url: `${BASE_URL}${toListLink(item)}`,
          })),
        },
      ],
    },
    null,
    2
  );
}

function injectNoticiasHtml(html, noticias) {
  let next = html;
  next = updateCharset(next);
  next = updateTitle(next, TITLE);
  next = updateMeta(next, "description", DESCRIPTION);
  next = updateMeta(next, "robots", "index,follow");
  next = updateCanonical(next, CANONICAL);
  next = updateOg(next, "og:title", TITLE);
  next = updateOg(next, "og:description", DESCRIPTION);
  next = updateOg(next, "og:type", "website");
  next = updateOg(next, "og:url", CANONICAL);
  next = updateOg(next, "og:image", OG_IMAGE);
  next = updateMeta(next, "twitter:card", "summary_large_image");
  next = updateMeta(next, "twitter:title", TITLE);
  next = updateMeta(next, "twitter:description", DESCRIPTION);
  next = updateMeta(next, "twitter:image", OG_IMAGE);

  const listJsonLd = buildItemListJsonLd(noticias);
  const ldScript = `<script type="application/ld+json">\n${listJsonLd}\n  </script>`;
  const ldPattern = new RegExp('<script type="application\\/ld\\+json">[\\s\\S]*?<\\/script>', "gi");
  next = next.replace(ldPattern, "");
  next = insertBeforeHeadClose(next, ldScript);

  const list = buildLista(noticias);

  const replaceBetweenMarkers = (source, startMarker, endMarker, replacement) => {
    const startIndex = source.indexOf(startMarker);
    const endIndex = source.indexOf(endMarker);
    if (startIndex === -1 || endIndex === -1 || endIndex <= startIndex) {
      return null;
    }
    const before = source.slice(0, startIndex + startMarker.length);
    const after = source.slice(endIndex);
    return `${before}\n${replacement}\n${after}`;
  };

  const listReplacement =
    `<div id="noticiasList" class="grid" style="grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: var(--spacing-md);">` +
    `\n\n${list}\n\n          </div>`;

  const listMarkers = replaceBetweenMarkers(
    next,
    "<!-- noticiasList:start -->",
    "<!-- noticiasList:end -->",
    listReplacement
  );
  if (listMarkers) {
    next = listMarkers;
  } else {
    next = next.replace(
      new RegExp('<div id="noticiasList"[^>]*>[\\s\\S]*?<\\/div>', "i"),
      listReplacement
    );
  }

  return next;
}

function buildNoticiaPage(item) {
  const title = `${item.titulo} | LINQ-DFE`;
  const description = item.resumo || "";
  const canonical = `${BASE_URL}/noticia/${item.slug}.html`;
  const image = toSitePath(item.imagemCard || item.imagem, "/assets/banners/placeholder.jpg");
  const socialImage = toAbsoluteSiteUrl(item.imagemCard || item.imagem, OG_IMAGE);
  const heroFit = item.imagemHeroFit || "cover";
  const heroPosX = Number.isFinite(item.imagemHeroFocoX) ? item.imagemHeroFocoX : 50;
  const heroPosY = Number.isFinite(item.imagemHeroFocoY) ? item.imagemHeroFocoY : 35;
  const lead = item.lead || "";
  const content = item.conteudo || "";

  const ldJson = JSON.stringify(
    {
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      headline: item.titulo,
      description: description,
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": canonical,
      },
      image: [socialImage],
      datePublished: item.data || "",
      dateModified: item.data || "",
      author: {
        "@type": "Organization",
        name: "Liga Independente de Quadrilhas Juninas do DF e Entorno",
      },
      publisher: {
        "@type": "Organization",
        name: "LINQ-DFE",
        logo: {
          "@type": "ImageObject",
          url: "https://linqdfe.com.br/assets/logos/linq-dfe.png",
        },
      },
    },
    null,
    2
  );

  const template = readFileSafe(NOTICIA_TEMPLATE);
  if (!template) {
    throw new Error("noticia.html not found.");
  }

  let html = template;
  html = updateCharset(html);
  html = updateTitle(html, title);
  html = updateMeta(html, "description", description);
  html = updateMeta(html, "robots", "index,follow");
  html = updateCanonical(html, canonical);
  html = updateOg(html, "og:title", title);
  html = updateOg(html, "og:description", description);
  html = updateOg(html, "og:type", "article");
  html = updateOg(html, "og:url", canonical);
  html = updateOg(html, "og:image", socialImage);
  html = updateMeta(html, "twitter:card", "summary_large_image");
  html = updateMeta(html, "twitter:title", title);
  html = updateMeta(html, "twitter:description", description);
  html = updateMeta(html, "twitter:image", socialImage);

  const ldScript = `<script type="application/ld+json">\n${ldJson}\n  </script>`;
  const ldPattern = new RegExp('<script type="application\\/ld\\+json">[\\s\\S]*?<\\/script>', "gi");
  html = html.replace(ldPattern, "");
  html = insertBeforeHeadClose(html, ldScript);

  const articleHtml = `
      <article class="noticia-page">
        <header class="noticia-hero" style="--capa: url('${image}'); background-position: ${heroPosX}% ${heroPosY}%; background-size: ${heroFit};">
          <div class="noticia-hero__img">
            <img src="${image}" alt="${item.titulo}" loading="lazy" style="object-fit:${heroFit}; object-position:${heroPosX}% ${heroPosY}%;" onerror="this.src='/assets/banners/placeholder.jpg'" />
          </div>
          <div class="noticia-hero__overlay">
            ${item.data ? `<p class="noticia-meta">${item.data}</p>` : ""}
            <h1>${item.titulo}</h1>
            ${description ? `<p class="noticia-resumo">${description}</p>` : ""}
          </div>
        </header>

        <div class="noticia-body noticia-conteudo">
          ${lead ? `<p class="noticia-lead">${lead}</p>` : ""}
          ${content}
        </div>
      </article>
  `.trim();

  html = html.replace(
    new RegExp('<div id="noticiaContent">[\\s\\S]*?<\\/div>', "i"),
    `<div id="noticiaContent" data-static="true">\n${articleHtml}\n        </div>`
  );

  return html;
}

async function main() {
  const rawNoticias = await loadNoticias();
  const noticias = normalizeNoticias(rawNoticias);

  if (!fs.existsSync(path.dirname(DATA_FILE))) {
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  }
  fs.writeFileSync(DATA_FILE, JSON.stringify(noticias, null, 2), "utf8");

  if (!fs.existsSync(NOTICIA_DIR)) {
    fs.mkdirSync(NOTICIA_DIR, { recursive: true });
  }

  const listTemplate = readFileSafe(NOTICIAS_HTML);
  if (!listTemplate) {
    throw new Error("noticias.html not found.");
  }
  const listHtml = injectNoticiasHtml(listTemplate, noticias);
  fs.writeFileSync(NOTICIAS_HTML, listHtml, "utf8");

  noticias.forEach((item) => {
    if (!item.slug) return;
    const pageHtml = buildNoticiaPage(item);
    const filePath = path.join(NOTICIA_DIR, `${item.slug}.html`);
    fs.writeFileSync(filePath, pageHtml, "utf8");
  });

  console.log(`Updated ${NOTICIAS_HTML} and ${noticias.length} noticias.`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
