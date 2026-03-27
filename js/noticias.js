/* ============================================
   NOTICIAS.JS - Lista de noticias (site publico)
   - Busca do Firestore (colecao "noticias")
   ============================================ */

import {
  formatDate,
  setActiveNav,
  debounce,
  normalizeImageUrl,
  loadJSON,
} from './shared.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import { getFirestore, collection, getDocs } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

const hasFirebaseConfig = !!(window.RUNTIME_CONFIG && window.RUNTIME_CONFIG.firebase);
const firebaseConfig = hasFirebaseConfig ? window.RUNTIME_CONFIG.firebase : null;
const STATIC_NEWS_MANIFEST = 'data/noticias-static-slugs.json';

let firebaseApp = null;
let firestoreDb = null;
let noticias = [];
let currentSearch = '';
let lastVisible = null;
let hasMore = false;
const staticNoticiasSlugs = new Set();

const CACHE_KEY = 'noticiasCacheV1';
const CACHE_TTL = 10 * 60 * 1000; // 10 minutos
const PAGE_SIZE = 200; // traz tudo de uma vez

function ensureFirestore() {
  if (!hasFirebaseConfig || !firebaseConfig) return null;
  if (firestoreDb) return firestoreDb;
  firebaseApp = firebaseApp || initializeApp(firebaseConfig);
  firestoreDb = getFirestore(firebaseApp);
  return firestoreDb;
}

function parseDateValue(value) {
  if (!value) return null;
  if (typeof value === 'object' && typeof value.toDate === 'function') {
    return value.toDate();
  }
  if (value instanceof Date) {
    return value;
  }
  if (typeof value === 'string' || typeof value === 'number') {
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

function mapFirestoreNoticia(docSnap) {
  const data = docSnap.data() || {};
  const latestDate = getLatestDate(data.dataPublicacao, data.dataAtualizacao, data.dataCriacao);

  return {
    id: docSnap.id,
    titulo: data.titulo || '',
    resumo: data.resumo || '',
    imagem: data.imagemHeroUrl || data.imagemCapaUrl || data.imagem || '',
    imagemHeroFit: data.imagemHeroFit || data.imagemCapaFit || 'cover',
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
    imagemCard: data.imagemCardUrl || data.imagemHeroUrl || data.imagemCapaUrl || data.imagem || '',
    imagemCardFit: data.imagemCardFit || data.imagemHeroFit || data.imagemCapaFit || 'cover',
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
    tags: Array.isArray(data.tags) ? data.tags : [],
    data: latestDate ? latestDate.toISOString() : '',
    conteudo: data.conteudo || '',
    destaqueHome: !!data.destaqueHome,
    slug: data.slug || '',
    status: data.status || '',
  };
}

async function loadNoticiasData() {
  await ensureStaticNoticiasManifest();

  if (!hasFirebaseConfig) {
    console.warn('Runtime config ausente: carregando noticias apenas do JSON local.');
  }

  // primeiro carrega do JSON local para garantir conteudo estatico
  const localNoticias = (await loadNoticiasLocal()) || [];
  if (localNoticias.length) {
    noticias = localNoticias;
    renderNoticias();
  }

  try {
    let firstPage = await fetchNoticiasPage(true);

    // Busca complementar sem ordenação para trazer docs que não têm dataPublicacao
    const fullFallback = await fetchNoticiasFullFallback();
    if (fullFallback.length) {
      const mapUniq = new Map();
      firstPage.forEach((n) => mapUniq.set(n.id || n.slug, n));
      fullFallback.forEach((n) => mapUniq.set(n.id || n.slug, n));
      firstPage = Array.from(mapUniq.values());
    }

    if (firstPage.length) {
      noticias = firstPage;
    } else if (localNoticias.length) {
      noticias = localNoticias;
    }

    renderNoticias();
  } catch (err) {
    console.error('Nao foi possivel carregar noticias do Firestore.', err);
    if (!noticias.length && localNoticias.length) {
      noticias = localNoticias;
      renderNoticias();
    }
  }
}

function getImagem(noticia) {
  return (
    normalizeImageUrl(noticia.imagemCard || noticia.imagem, 'assets/banners/placeholder.jpg') ||
    'assets/banners/placeholder.jpg'
  );
}

function rememberStaticNoticias(items = []) {
  items.forEach((item) => {
    const slug = String(typeof item === 'string' ? item : item?.slug || '').trim();
    if (slug) {
      staticNoticiasSlugs.add(slug);
    }
  });
  return items;
}

async function ensureStaticNoticiasManifest() {
  if (staticNoticiasSlugs.size) return;
  const slugs = (await loadJSON(STATIC_NEWS_MANIFEST)) || [];
  rememberStaticNoticias(slugs);
}

function getNoticiaUrl(noticia) {
  const slug = String(noticia?.slug || '').trim();
  if (slug) {
    if (staticNoticiasSlugs.has(slug)) {
      return `/noticias/${encodeURIComponent(slug)}/`;
    }
    return `/noticia.html?slug=${encodeURIComponent(slug)}`;
  }
  if (noticia?.id) {
    return `/noticia.html?id=${encodeURIComponent(noticia.id)}`;
  }
  return '/noticias.html';
}

function readCache() {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.items || !Array.isArray(parsed.items)) return null;
    const fresh = Date.now() - (parsed.timestamp || 0) < CACHE_TTL;
    if (!fresh) return null;
    return parsed.items;
  } catch (e) {
    return null;
  }
}

function writeCache(items) {
  try {
    sessionStorage.setItem(
      CACHE_KEY,
      JSON.stringify({
        items,
        timestamp: Date.now(),
      })
    );
  } catch (e) {
    // ignore storage errors
  }
}

function mapJsonNoticia(item) {
  const latestDate = getLatestDate(
    item.dataPublicacao,
    item.dataAtualizacao,
    item.dataCriacao,
    item.updatedAt,
    item.data,
    item.date
  );
  return {
    id: item.id,
    titulo: item.titulo || item.title || '',
    resumo: item.resumo || item.excerpt || '',
    imagem: item.imagemHeroUrl || item.imagemCapaUrl || item.imagem || item.image || item.foto || '',
    imagemHeroFit: item.imagemHeroFit || item.imagemCapaFit || 'cover',
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
    imagemCard: item.imagemCardUrl || item.imagemHeroUrl || item.imagemCapaUrl || item.imagem || item.image || item.foto || '',
    imagemCardFit: item.imagemCardFit || item.imagemHeroFit || item.imagemCapaFit || 'cover',
    imagemCardFocoX: Number.isFinite(item.imagemCardFocoX)
      ? item.imagemCardFocoX
      : Number.isFinite(item.imagemHeroFocoX)
      ? item.imagemHeroFocoX
      : Number.isFinite(item.imagemCapaFocoX)
      ? item.imagemCapaFocoX
      : 50,
    imagemCardFocoY: Number.isFinite(item.imagemCardFocoY)
      ? item.imagemCardFocoY
      : Number.isFinite(item.imagemHeroFocoY)
      ? item.imagemHeroFocoY
      : Number.isFinite(item.imagemCapaFocoY)
      ? item.imagemCapaFocoY
      : 35,
    tags: Array.isArray(item.tags) ? item.tags : [],
    data: latestDate ? latestDate.toISOString() : item.data || item.date || '',
    conteudo: item.conteudo || '',
    destaqueHome: !!item.destaqueHome,
    slug: item.slug || '',
    status: item.status || '',
  };
}

async function loadNoticiasLocal() {
  const local = (await loadJSON('data/noticias.json')) || [];
  return rememberStaticNoticias(
    local
      .map(mapJsonNoticia)
      .filter((n) => {
        const status = (n.status || '').toLowerCase();
        return !status || status === 'publicada';
      })
  );
}

async function fetchNoticiasPage(reset = false) {
  try {
    const db = ensureFirestore();
    if (!db) return [];
    // Busca simples: traz todas as notícias sem depender de campo dataPublicacao
    const snap = await getDocs(collection(db, 'noticias'));

    const docs = snap.docs || [];
    lastVisible = null;
    hasMore = false;

    const items = [];
    docs.forEach((docSnap) => items.push(mapFirestoreNoticia(docSnap)));

    return items.filter((n) => {
      const status = (n.status || '').toString().toLowerCase();
      return !status || status === 'publicada';
    });
  } catch (err) {
    console.error('Nao foi possivel carregar noticias do Firestore.', err);
    hasMore = false;
    return [];
  }
}

async function fetchNoticiasFullFallback() {
  try {
    const db = ensureFirestore();
    if (!db) return [];
    const snap = await getDocs(collection(db, 'noticias'));
    const items = [];
    snap.forEach((docSnap) => items.push(mapFirestoreNoticia(docSnap)));
    hasMore = false;
    return items.filter((n) => {
      const status = (n.status || '').toString().toLowerCase();
      return !status || status === 'publicada';
    });
  } catch (err) {
    console.error('Nao foi possivel carregar noticias (fallback).', err);
    hasMore = false;
    return [];
  }
}

function renderNoticias() {
  const container = document.getElementById('noticiasList');
  const manchetesGrid = document.getElementById('manchetesGrid');
  const emptyState = document.getElementById('noticiasEmptyState');
  const loadMoreBtn = document.getElementById('noticiasLoadMore');
  if (!container) return;

  // Se ainda nao temos dados, mantem o HTML estatico (fallback)
  if (!noticias.length) {
    const hasStaticCards = container.children.length > 0;
    if (emptyState) {
      emptyState.classList.toggle('hidden', hasStaticCards);
    }
    if (loadMoreBtn) loadMoreBtn.style.display = 'none';
    if (!hasStaticCards) {
      container.innerHTML = '';
    }
    return;
  }

  let filtered = [...noticias].sort((a, b) => {
    const da = a.data ? new Date(a.data).getTime() : 0;
    const db = b.data ? new Date(b.data).getTime() : 0;
    return db - da;
  });

  if (currentSearch) {
    const searchLower = currentSearch.toLowerCase();

    filtered = filtered.filter((n) => {
      const titulo = (n.titulo || '').toLowerCase();
      const resumo = (n.resumo || '').toLowerCase();
      const tags = Array.isArray(n.tags) ? n.tags : [];

      return (
        titulo.includes(searchLower) ||
        resumo.includes(searchLower) ||
        tags.some((tag) => (tag || '').toLowerCase().includes(searchLower))
      );
    });
  }

  // Manchetes (top 3 mais recentes)
  if (manchetesGrid) {
    manchetesGrid.innerHTML = '';
    const manchetes = filtered.slice(0, 3);
    manchetes.forEach((noticia) => {
    const card = document.createElement('article');
    card.className = 'card';
    card.style.overflow = 'hidden';
    card.style.cursor = 'pointer';
    const cardUrl = getNoticiaUrl(noticia);
    card.onclick = () => (window.location.href = cardUrl);

      const img = getImagem(noticia);
      const imgStyle = buildImageStyle(noticia.imagemCardFit, noticia.imagemCardFocoX, noticia.imagemCardFocoY);
      const dataLabel = formatDate(noticia.data);

      card.innerHTML = `
        <div style="position: relative; height: 220px; overflow: hidden;">
          <img src="${img}" alt="${noticia.titulo || ''}"
               style="width:100%; height:100%; ${imgStyle}" loading="lazy"
               onerror="this.src='assets/banners/placeholder.jpg'">
          <div style="position:absolute; inset:0; background: linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.35) 100%);"></div>
          <div style="position:absolute; left:0; right:0; bottom:0; padding: var(--spacing-md); color: #fff;">
            <p style="font-size:0.9rem; opacity:0.9; margin:0 0 6px 0;">${dataLabel || ''}</p>
            <h3 style="margin:0; font-size:1.1rem; line-height:1.2;">${noticia.titulo || ''}</h3>
          </div>
        </div>
      `;

      manchetesGrid.appendChild(card);
    });
  }

  // Lista geral
  container.innerHTML = '';
  if (filtered.length === 0) {
    if (emptyState) emptyState.classList.remove('hidden');
    if (loadMoreBtn) loadMoreBtn.style.display = 'none';
    return;
  }
  if (emptyState) emptyState.classList.add('hidden');

  filtered.forEach((noticia) => {
    const card = document.createElement('article');
    card.className = 'card';
    card.style.cursor = 'pointer';
    const cardUrl = getNoticiaUrl(noticia);
    card.onclick = () => (window.location.href = cardUrl);

    const safeTitulo = noticia.titulo || '';
    const safeResumo = noticia.resumo || '';
    const dataLabel = formatDate(noticia.data);
    const img = getImagem(noticia);
    const imgStyle = buildImageStyle(noticia.imagemCardFit, noticia.imagemCardFocoX, noticia.imagemCardFocoY);
    const tags = Array.isArray(noticia.tags) ? noticia.tags : [];

    card.innerHTML = `
      <div style="display: flex; gap: var(--spacing-md); flex-direction: column;">
        <div style="width: 100%; height: 180px; border-radius: var(--border-radius); overflow: hidden;">
          <img src="${img}" alt="${safeTitulo}"
               style="width:100%; height:100%; ${imgStyle}"
               loading="lazy"
               onerror="this.src='assets/banners/placeholder.jpg'">
        </div>
        <div class="card-body" style="flex: 1;">
          <div class="card-meta" style="margin-bottom: var(--spacing-sm); font-size: 0.9rem;">
            ${dataLabel ? `<span>${dataLabel}</span>` : ''}
          </div>
          <div class="news-card-tags"></div>
          <h3 class="card-title" style="margin-bottom: var(--spacing-xs);">${safeTitulo}</h3>
          <p class="card-text" style="margin-bottom: var(--spacing-sm);">${safeResumo}</p>
          <a href="${cardUrl}" class="btn btn-light" style="margin-top: auto; align-self:flex-start;">Ler mais</a>
        </div>
      </div>
    `;

    const tagsContainer = card.querySelector('.news-card-tags');

    if (tags && tags.length && tagsContainer) {
      const maxTags = 2;
      const visibleTags = tags.slice(0, maxTags);

      visibleTags.forEach((tag) => {
        const span = document.createElement('span');
        span.className = 'news-tag';
        span.textContent = (tag || '').trim();
        tagsContainer.appendChild(span);
      });

      if (tags.length > maxTags) {
        const more = document.createElement('span');
        more.className = 'news-tag news-tag-more';
        more.textContent = `+${tags.length - maxTags}`;
        tagsContainer.appendChild(more);
      }
    } else if (tagsContainer) {
      tagsContainer.style.display = 'none';
    }

    container.appendChild(card);
  });

  if (loadMoreBtn) {
    loadMoreBtn.style.display = hasMore ? 'inline-flex' : 'none';
    loadMoreBtn.disabled = !hasMore;
  }
}

function buildImageStyle(fit, focoX, focoY) {
  const finalFit = fit || 'cover';
  const x = Number.isFinite(focoX) ? focoX : 50;
  const y = Number.isFinite(focoY) ? focoY : 35;
  return `object-fit:${finalFit}; object-position:${x}% ${y}%;`;
}

async function init() {
  await loadNoticiasData();

  renderNoticias();

  const searchInput = document.getElementById('searchNoticias');
  if (searchInput) {
    const debouncedSearch = debounce(() => {
      currentSearch = searchInput.value;
      renderNoticias();
    }, 300);

    searchInput.addEventListener('input', debouncedSearch);
  }

  const loadMoreBtn = document.getElementById('noticiasLoadMore');
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', async () => {
      loadMoreBtn.disabled = true;
      let more = await fetchNoticiasPage(false);
      if (!more.length) {
        more = await fetchNoticiasFullFallback();
      }
      if (more && more.length) {
        noticias = noticias.concat(more);
        writeCache(noticias);
        renderNoticias();
      } else {
        hasMore = false;
        renderNoticias();
      }
      loadMoreBtn.disabled = false;
    });
  }

  setActiveNav();
}

init();
