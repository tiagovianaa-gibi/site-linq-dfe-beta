/* ============================================
   NOTICIAS.JS - Lógica da página de notícias
   ============================================ */

import { loadJSON, formatDate, setActiveNav, debounce } from './shared.js';

let noticias = [];
let currentSearch = '';

/**
 * Renderiza lista de notícias
 */
function renderNoticias() {
  const container = document.getElementById('noticiasList');
  if (!container) return;
  
  let filtered = [...noticias];
  
  // Busca
  if (currentSearch) {
    const searchLower = currentSearch.toLowerCase();
    filtered = filtered.filter(n => 
      n.titulo.toLowerCase().includes(searchLower) ||
      n.resumo.toLowerCase().includes(searchLower) ||
      (n.tags && n.tags.some(tag => tag.toLowerCase().includes(searchLower)))
    );
  }
  
  // Ordena por data (mais recente primeiro)
  filtered.sort((a, b) => new Date(b.data) - new Date(a.data));
  
  container.innerHTML = '';
  
  if (filtered.length === 0) {
    container.innerHTML = '<p class="text-center" style="padding: var(--spacing-xl);">Nenhuma notícia encontrada.</p>';
    return;
  }
  
  filtered.forEach(noticia => {
    const card = document.createElement('div');
    card.className = 'card';
    card.style.marginBottom = 'var(--spacing-md)';
    card.onclick = () => window.location.href = `noticia.html?id=${noticia.id}`;
    card.style.cursor = 'pointer';
    
    card.innerHTML = `
      <div style="display: flex; gap: var(--spacing-md); flex-wrap: wrap;">
        ${noticia.imagem ? `
          <img src="${noticia.imagem}" alt="${noticia.titulo}" 
               style="width: 200px; height: 150px; object-fit: cover; border-radius: var(--border-radius);" 
               onerror="this.style.display='none'">
        ` : ''}
        <div class="card-body" style="flex: 1; min-width: 250px;">
          <h3 class="card-title">${noticia.titulo}</h3>
          <div class="card-meta" style="margin-bottom: var(--spacing-sm);">
            <span>📅 ${formatDate(noticia.data)}</span>
            ${noticia.tags ? noticia.tags.map(tag => `<span class="badge badge-outline">${tag}</span>`).join('') : ''}
          </div>
          <p class="card-text">${noticia.resumo}</p>
          <a href="noticia.html?id=${noticia.id}" class="btn" style="margin-top: var(--spacing-sm);">Ler mais</a>
        </div>
      </div>
    `;
    
    container.appendChild(card);
  });
}

/**
 * Inicialização
 */
async function init() {
  // Carrega dados
  noticias = await loadJSON('data/noticias.json') || [];
  
  // Renderiza
  renderNoticias();
  
  // Busca
  const searchInput = document.getElementById('searchNoticias');
  if (searchInput) {
    const debouncedSearch = debounce(() => {
      currentSearch = searchInput.value;
      renderNoticias();
    }, 300);
    
    searchInput.addEventListener('input', debouncedSearch);
  }
  
  // Ativa navegação
  setActiveNav();
}

init();


