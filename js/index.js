/* ============================================
   INDEX.JS - Lógica da Home
   ============================================ */

import { loadJSON, getQuadrilhaPhoto, applyFocal, slugify } from './shared.js';

let quadrilhas = [];
let parceiros = [];

/**
 * Controles de áudio do vídeo hero
 * VOCÊ SÓ MUDA AQUI: nada, funciona automaticamente
 */
window.ativarSom = function() {
  const video = document.getElementById('heroVideo');
  if (video) {
    video.muted = false;
    document.getElementById('btnAtivarSom').disabled = true;
    document.getElementById('btnAtivarSom').style.display = 'none';
    document.getElementById('btnSilenciar').disabled = false;
    document.getElementById('btnSilenciar').style.display = 'inline-block';
  }
};

window.silenciarSom = function() {
  const video = document.getElementById('heroVideo');
  if (video) {
    video.muted = true;
    document.getElementById('btnSilenciar').disabled = true;
    document.getElementById('btnSilenciar').style.display = 'none';
    document.getElementById('btnAtivarSom').disabled = false;
    document.getElementById('btnAtivarSom').style.display = 'inline-block';
  }
};

/**
 * Renderiza card de quadrilha
 */
function renderQuadrilhaCard(quad, destacado = false) {
  const photo = getQuadrilhaPhoto(quad);
  const slug = slugify(quad.nome);
  
  const card = document.createElement('div');
  card.className = destacado ? 'card quadrilha-card' : 'card quadrilha-card';
  card.onclick = () => window.location.href = `quadrilha.html?id=${quad.id}`;
  
  const img = document.createElement('img');
  img.src = photo;
  img.alt = quad.nome;
  img.className = 'card-image';
  img.onerror = function() {
    this.src = 'assets/banners/placeholder.jpg';
  };
  
  if (quad.focal) {
    applyFocal(img, quad.focal);
  }
  
  const overlay = document.createElement('div');
  overlay.className = 'card-overlay';
  
  overlay.innerHTML = `
    <h3 class="card-title">${quad.nome}</h3>
    <div class="card-meta">
      <span>${quad.cidade}</span>
      <span class="badge ${quad.grupo === 'Especial' ? '' : 'badge-secondary'}">${quad.grupo}</span>
      ${quad.pontos2025 ? `<span>${quad.pontos2025} pts</span>` : ''}
    </div>
  `;
  
  card.appendChild(img);
  if (destacado) {
    card.appendChild(overlay);
  } else {
    const body = document.createElement('div');
    body.className = 'card-body';
    body.innerHTML = `
      <h3 class="card-title">${quad.nome}</h3>
      <div class="card-meta">
        <span>${quad.cidade}</span>
        <span class="badge ${quad.grupo === 'Especial' ? '' : 'badge-secondary'}">${quad.grupo}</span>
      </div>
    `;
    card.appendChild(body);
  }
  
  return card;
}

/**
 * Renderiza campeãs 2025
 */
function renderCampeas() {
  const grid = document.getElementById('campeasGrid');
  if (!grid) return;

  // Encontra as campeãs de 2025 usando as propriedades grupo_2025 e posicao_2025
  const especial = quadrilhas.find(q => q.grupo_2025 === 'especial' && q.posicao_2025 === 1);
  const acesso   = quadrilhas.find(q => q.grupo_2025 === 'acesso' && q.posicao_2025 === 1);

  grid.innerHTML = '';

  function makeChampionCard(quad, label) {
    const card = document.createElement('a'); // Alterado de 'div' para 'a'
    card.className = 'champion-card';
    card.href = `quadrilha.html?id=${quad.id}`; // Define o link diretamente
    // Remove os event listeners, pois a tag <a> já lida com a navegação
    // Remove role="link" e tabIndex=0, pois são implícitos para <a>

    card.innerHTML = `
      <img src="${getQuadrilhaPhoto(quad)}"
           alt="${quad.nome}"
           onerror="this.src='assets/banners/placeholder.jpg'">

      <div class="champion-overlay">
        <h3>🏆 ${quad.nome}</h3>
        <div class="champion-meta">
          <span>${label}</span>
          <span>${quad.pontos2025} pts</span>
        </div>
      </div>
    `;

    return card;
  }

  if (especial) grid.appendChild(makeChampionCard(especial, 'Campeã Especial 2025'));
  if (acesso)   grid.appendChild(makeChampionCard(acesso,   'Campeã Acesso 2025'));
}


/**
 * Renderiza destaques por grupo (Top 6)
 */
function renderHighlights() {
  const especialGrid = document.getElementById('destaquesEspecial');
  const acessoGrid = document.getElementById('destaquesAcesso');
  
  if (especialGrid) {
    const especial = quadrilhas
      .filter(q => q.grupo === 'Especial')
      .sort((a, b) => (b.pontos2025 || 0) - (a.pontos2025 || 0))
      .slice(0, 6);
    
    especialGrid.innerHTML = '';
    especial.forEach(quad => {
      especialGrid.appendChild(renderQuadrilhaCard(quad, true));
    });
  }
  
  if (acessoGrid) {
    const acesso = quadrilhas
      .filter(q => q.grupo === 'Acesso')
      .sort((a, b) => (b.pontos2025 || 0) - (a.pontos2025 || 0))
      .slice(0, 6);
    
    acessoGrid.innerHTML = '';
    acesso.forEach(quad => {
      acessoGrid.appendChild(renderQuadrilhaCard(quad, true));
    });
  }
}

/**
 * Renderiza parceiros
 */
function renderParceiros() {
  const grid = document.getElementById('parceirosGrid');
  if (!grid) return;
  
  grid.innerHTML = '';
  parceiros.forEach(parceiro => {
    const card = document.createElement('div');
    card.className = 'card';
    
    card.innerHTML = `
      <div class="card-body" style="text-align: center;">
        <img src="${parceiro.logo}" alt="${parceiro.nome}" style="max-height: 80px; max-width: 100%; margin-bottom: var(--spacing-sm);" onerror="this.style.display='none'">
        <h3 class="card-title">${parceiro.nome}</h3>
        ${parceiro.url ? `<a href="${parceiro.url}" target="_blank" class="btn btn-outline" style="margin-top: var(--spacing-sm);">Visitar</a>` : ''}
      </div>
    `;
    
    grid.appendChild(card);
  });
}

/**
 * Inicialização
 */
async function init() {
  // Carrega dados
  quadrilhas = await loadJSON('data/quadrilhas.json') || [];
  parceiros = await loadJSON('data/parceiros.json') || [];
  
  // Renderiza seções
  renderCampeas();
  renderHighlights();
  renderParceiros();
  
  // Ativa navegação
  import('./shared.js').then(module => {
    module.setActiveNav();
  });
}

init();
