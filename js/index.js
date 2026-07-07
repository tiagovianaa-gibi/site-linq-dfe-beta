/* ============================================
   INDEX.JS - Lógica da Home
   ============================================ */

import { loadJSON, getQuadrilhaPhoto, applyFocal, slugify } from './shared.js';

let quadrilhas = [];
let parceiros = [];

/**
 * Controles de áudio do vídeo hero
 */
window.ativarSom = function() {
  const video = document.getElementById('heroVideo');
  if (video) {
    ensureHeroVideoLoaded();
    video.muted = false;
    video.play().catch(() => {});
    const btnOn = document.getElementById('btnAtivarSom');
    const btnOff = document.getElementById('btnSilenciar');
    const statusEl = document.getElementById('audioStatus');
    if (btnOn && btnOff) {
      btnOn.disabled = true;
      btnOn.style.display = 'none';
      btnOn.setAttribute('aria-pressed', 'true');
      btnOff.disabled = false;
      btnOff.style.display = 'inline-block';
      btnOff.setAttribute('aria-pressed', 'false');
    }
    if (statusEl) statusEl.textContent = 'Som ativado';
  }
};

window.silenciarSom = function() {
  const video = document.getElementById('heroVideo');
  if (video) {
    video.muted = true;
    const btnOff = document.getElementById('btnSilenciar');
    const btnOn = document.getElementById('btnAtivarSom');
    const statusEl = document.getElementById('audioStatus');
    if (btnOn && btnOff) {
      btnOff.disabled = true;
      btnOff.style.display = 'none';
      btnOff.setAttribute('aria-pressed', 'true');
      btnOn.disabled = false;
      btnOn.style.display = 'inline-block';
      btnOn.setAttribute('aria-pressed', 'false');
    }
    if (statusEl) statusEl.textContent = 'Som silenciado';
  }
};

let heroLoaded = false;
function ensureHeroVideoLoaded() {
  if (heroLoaded) return;
  const video = document.getElementById('heroVideo');
  if (!video) return;
  const source = video.querySelector('source[data-src]');
  if (source && !source.src) {
    source.src = source.getAttribute('data-src');
  }
  heroLoaded = true;
}

function lazyLoadHero() {
  ensureHeroVideoLoaded();
  const video = document.getElementById('heroVideo');
  if (!video) return;
  video.load();
  video.play().catch(() => {
    // autoplay pode ser bloqueado; manter poster
  });
}

/**
 * Renderiza card de quadrilha
 */
function renderQuadrilhaCard(quad, destacado = false) {
  const photo = getQuadrilhaPhoto(quad);
  const posicao = quad.posicao_2026 || quad.posicao;
  const grupoLabel = (() => {
    if (quad.grupo_2026) {
      return quad.grupo_2026.toLowerCase() === 'acesso' ? 'Acesso' : 'Especial';
    }
    return quad.grupo || '';
  })();
  const isAcessoGrupo = grupoLabel.toLowerCase() === 'acesso';
  const card = document.createElement('div');
  card.className = destacado ? 'card quadrilha-card' : 'card quadrilha-card';
  card.onclick = () => {
    const slug = quad.slug || slugify(quad.nome || '');
    const target = `quadrilha/${slug}.html`;
    window.location.href = target;
  };

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
        ${posicao ? `<span class="badge ${isAcessoGrupo ? 'badge-secondary' : ''}">${posicao}</span>` : ''}
        <span class="badge ${isAcessoGrupo ? 'badge-secondary' : ''}">${grupoLabel}</span>
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
        <span class="badge ${isAcessoGrupo ? 'badge-secondary' : ''}">${grupoLabel}</span>
        ${posicao ? `<span>${posicao}º</span>` : ''}
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
      .filter((q) => (q.grupo_2026 ? q.grupo_2026.toLowerCase() === 'especial' : q.grupo === 'Especial'))
      .sort((a, b) => (b.pontos2026 || 0) - (a.pontos2026 || 0))
      .slice(0, 6);

    especialGrid.innerHTML = '';
    especial.forEach((quad) => {
      especialGrid.appendChild(renderQuadrilhaCard(quad, true));
    });
  }

  if (acessoGrid) {
    const acesso = quadrilhas
      .filter((q) => (q.grupo_2026 ? q.grupo_2026.toLowerCase() === 'acesso' : q.grupo === 'Acesso'))
      .sort((a, b) => (b.pontos2026 || 0) - (a.pontos2026 || 0))
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
 * Inicialização
 */
async function init() {
  quadrilhas = (await loadJSON('data/quadrilhas.json')) || [];
  parceiros = (await loadJSON('data/parceiros.json')) || [];

  renderHighlights();
  renderParceiros();

  // Lazy load do vídeo após ocioso ou primeira interação
  if ('requestIdleCallback' in window) {
    requestIdleCallback(lazyLoadHero, { timeout: 2000 });
  } else {
    setTimeout(lazyLoadHero, 1500);
  }
  ['scroll', 'pointerdown', 'keydown'].forEach((evt) => {
    window.addEventListener(evt, lazyLoadHero, { once: true, passive: true });
  });

  import('./shared.js').then((module) => {
    module.setActiveNav();
  });
}

init();
