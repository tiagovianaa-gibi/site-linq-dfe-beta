/* ============================================
   NOTICIAS.JS - Lista de noticias (site publico)
   - Busca do Firestore (colecao "noticias")
   ============================================ */

import { formatDate, setActiveNav, debounce, normalizeImageUrl } from './shared.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import {
  getFirestore,
  collection,
  getDocs,
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

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
let noticias = [];
let currentSearch = '';

function ensureFirestore() {
  if (firestoreDb) return firestoreDb;
  firebaseApp = firebaseApp || initializeApp(firebaseConfig);
  firestoreDb = getFirestore(firebaseApp);
  return firestoreDb;
}

function mapFirestoreNoticia(docSnap) {
  const data = docSnap.data() || {};
  const dataRef =
    data.dataPublicacao || data.dataAtualizacao || data.dataCriacao || null;
  const dataJs =
    dataRef && dataRef.toDate ? dataRef.toDate() : dataRef ? new Date(dataRef) : null;

  return {
    id: docSnap.id,
    titulo: data.titulo || '',
    resumo: data.resumo || '',
    imagem: data.imagemCapaUrl || data.imagem || '',
    tags: Array.isArray(data.tags) ? data.tags : [],
    data: dataJs ? dataJs.toISOString() : '',
    conteudo: data.conteudo || '',
    destaqueHome: !!data.destaqueHome,
    slug: data.slug || '',
    status: data.status || '',
  };
}

async function loadNoticiasData() {
  try {
    const db = ensureFirestore();
    const snap = await getDocs(collection(db, 'noticias'));
    const items = [];
    snap.forEach((docSnap) => items.push(mapFirestoreNoticia(docSnap)));
    // filtra publicadas em qualquer capitalizaÇõÇœo
    return items.filter((n) => {
      const status = (n.status || '').toString().toLowerCase();
      return status === 'publicada';
    });
  } catch (err) {
    console.error('Nao foi possivel carregar noticias do Firestore.', err);
    return [];
  }
}

function getImagem(noticia) {
  return (
    normalizeImageUrl(noticia.imagem, 'assets/banners/placeholder.jpg') ||
    'assets/banners/placeholder.jpg'
  );
}

function renderNoticias() {
  const container = document.getElementById('noticiasList');
  const manchetesGrid = document.getElementById('manchetesGrid');
  const emptyState = document.getElementById('noticiasEmptyState');
  if (!container) return;

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
      card.onclick = () =>
        (window.location.href = `noticia.html?id=${encodeURIComponent(noticia.id)}`);

      const img = getImagem(noticia);
      const dataLabel = formatDate(noticia.data);

      card.innerHTML = `
        <div style="position: relative; height: 220px; overflow: hidden;">
          <img src="${img}" alt="${noticia.titulo || ''}"
               style="width:100%; height:100%; object-fit: cover;" loading="lazy"
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
    return;
  }
  if (emptyState) emptyState.classList.add('hidden');

  filtered.forEach((noticia) => {
    const card = document.createElement('article');
    card.className = 'card';
    card.style.cursor = 'pointer';
    card.onclick = () =>
      (window.location.href = `noticia.html?id=${encodeURIComponent(noticia.id)}`);

    const safeTitulo = noticia.titulo || '';
    const safeResumo = noticia.resumo || '';
    const dataLabel = formatDate(noticia.data);
    const img = getImagem(noticia);
    const tags = Array.isArray(noticia.tags) ? noticia.tags : [];

    card.innerHTML = `
      <div style="display: flex; gap: var(--spacing-md); flex-direction: column;">
        <div style="width: 100%; height: 180px; border-radius: var(--border-radius); overflow: hidden;">
          <img src="${img}" alt="${safeTitulo}"
               style="width:100%; height:100%; object-fit: cover;"
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
          <a href="noticia.html?id=${encodeURIComponent(
            noticia.id
          )}" class="btn btn-light" style="margin-top: auto; align-self:flex-start;">Ler mais</a>
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
}

async function init() {
  noticias = await loadNoticiasData();

  renderNoticias();

  const searchInput = document.getElementById('searchNoticias');
  if (searchInput) {
    const debouncedSearch = debounce(() => {
      currentSearch = searchInput.value;
      renderNoticias();
    }, 300);

    searchInput.addEventListener('input', debouncedSearch);
  }

  setActiveNav();
}

init();
