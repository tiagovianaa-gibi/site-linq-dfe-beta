/* ============================================
   NOTICIA.JS - Lógica da página de notícia individual
   ============================================ */

import { loadJSON, formatDate, setActiveNav, sanitizeHTML } from './shared.js';

let noticia = null;

/**
 * Carrega notícia por ID
 */
async function loadNoticia() {
  const urlParams = new URLSearchParams(window.location.search);
  const id = parseInt(urlParams.get('id'));
  
  if (!id) {
    document.getElementById('noticiaContent').innerHTML = '<p class="text-center">Notícia não encontrada.</p>';
    return;
  }
  
  const noticias = await loadJSON('data/noticias.json') || [];
  noticia = noticias.find(n => n.id === id);
  
  if (!noticia) {
    document.getElementById('noticiaContent').innerHTML = '<p class="text-center">Notícia não encontrada.</p>';
    return;
  }
  
  renderNoticia();
}

/**
 * Renderiza notícia completa
 */
function renderNoticia() {
  const container = document.getElementById('noticiaContent');
  
  container.innerHTML = `
    <article class="section">
      <div class="container" style="max-width: 800px;">
        <!-- Botão voltar -->
        <a href="noticias.html" style="display: inline-flex; align-items: center; gap: 8px; margin-bottom: var(--spacing-lg); color: var(--accent-primary); text-decoration: none; font-weight: 500;">
          ← Voltar para Notícias
        </a>
        
        <!-- Imagem (se houver) -->
        ${noticia.imagem ? `
          <img src="${noticia.imagem}" alt="${noticia.titulo}" 
               style="width: 100%; max-height: 400px; object-fit: cover; border-radius: var(--border-radius); margin-bottom: var(--spacing-lg); box-shadow: var(--shadow-md);"
               onerror="this.style.display='none'">
        ` : ''}
        
        <!-- Header -->
        <div class="card" style="margin-bottom: var(--spacing-lg);">
          <div class="card-body">
            <h1 style="font-size: 2.5rem; margin-bottom: var(--spacing-md); color: var(--text-primary); line-height: 1.2;">
              ${sanitizeHTML(noticia.titulo)}
            </h1>
            <div class="card-meta" style="margin-bottom: var(--spacing-sm);">
              <span>📅 ${formatDate(noticia.data)}</span>
              ${noticia.tags ? noticia.tags.map(tag => `<span class="badge badge-outline">${tag}</span>`).join('') : ''}
            </div>
            ${noticia.resumo ? `
              <p style="font-size: 1.2rem; color: var(--text-secondary); font-weight: 500; line-height: 1.6;">
                ${sanitizeHTML(noticia.resumo)}
              </p>
            ` : ''}
          </div>
        </div>
        
        <!-- Conteúdo -->
        <div class="card">
          <div class="card-body" style="padding: var(--spacing-xl);">
            <div style="font-size: 1.1rem; line-height: 1.8; color: var(--text-primary);" class="noticia-conteudo">
              ${noticia.conteudo}
            </div>
          </div>
        </div>
        
        <!-- Comentários (em breve) -->
        <div class="card" style="margin-top: var(--spacing-lg); background: var(--bg-primary);">
          <div class="card-body" style="text-align: center;">
            <h3 class="card-title">💬 Comentários</h3>
            <p class="card-text">Sistema de comentários em breve!</p>
            <span class="badge badge-outline">Em breve</span>
          </div>
        </div>
        
        <!-- Botão voltar (final) -->
        <div style="text-align: center; margin-top: var(--spacing-xl);">
          <a href="noticias.html" class="btn">← Voltar para Notícias</a>
        </div>
      </div>
    </article>
  `;
  
  // Atualiza título da página
  document.title = `${noticia.titulo} | LINQ-DFE`;
  
  // Atualiza meta description
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc && noticia.resumo) {
    metaDesc.content = noticia.resumo;
  }
}

/**
 * Inicialização
 */
async function init() {
  await loadNoticia();
  setActiveNav();
}

init();

