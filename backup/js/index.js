/* ============================================
   INDEX.JS - LÃ³gica da Home
   ============================================ */

import { loadJSON, getQuadrilhaPhoto, applyFocal, slugify } from './shared.js';

let quadrilhas = [];
let parceiros = [];

/**
 * Controles de Ã¡udio do vÃ­deo hero
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
  const posicao = quad.posicao_2025 || quad.posicao;
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
    <div style="display:flex; flex-direction:column; gap:6px;">
      <h3 class="card-title" style="margin:0;">${quad.nome}</h3>
      <div class="card-meta" style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
        <span>${quad.cidade || ''}</span>
        ${posicao ? `<span class="badge ${quad.grupo === 'Acesso' ? 'badge-secondary' : ''}">${posicao}º</span>` : ''}
        <span class="badge ${quad.grupo === 'Especial' ? '' : 'badge-secondary'}">${quad.grupo || ''}</span>
      </div>
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
        <span>${quad.cidade || ''}</span>
        <span class="badge ${quad.grupo === 'Especial' ? '' : 'badge-secondary'}">${quad.grupo || ''}</span>
        ${posicao ? `<span>${posicao}Âº</span>` : ''}
      </div>
    `;
    card.appendChild(body);
  }

  return card;
}

/**
 * Renderiza destaques por grupo (Top 6)
 */
function renderHighlights() {
  const especialGrid = document.getElementById('destaquesEspecial');
  const acessoGrid = document.getElementById('destaquesAcesso');

  if (especialGrid) {
    const especial = quadrilhas
      .filter((q) => q.grupo === 'Especial')
      .sort((a, b) => (b.pontos2025 || 0) - (a.pontos2025 || 0))
      .slice(0, 6);

    especialGrid.innerHTML = '';
    especial.forEach((quad) => {
      especialGrid.appendChild(renderQuadrilhaCard(quad, true));
    });
  }

  if (acessoGrid) {
    const acesso = quadrilhas
      .filter((q) => q.grupo === 'Acesso')
      .sort((a, b) => (b.pontos2025 || 0) - (a.pontos2025 || 0))
      .slice(0, 6);

    acessoGrid.innerHTML = '';
    acesso.forEach((quad) => {
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
  parceiros.forEach((parceiro) => {
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
 * InicializaÃ§Ã£o
 */
async function init() {
  quadrilhas = (await loadJSON('data/quadrilhas.json')) || [];
  parceiros = (await loadJSON('data/parceiros.json')) || [];

  renderHighlights();
  renderParceiros();

  import('./shared.js').then((module) => {
    module.setActiveNav();
  });
}

init();

