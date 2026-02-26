/* ============================================
   MAPA.JS - Logica do mapa com Leaflet
   ============================================ */

import { loadJSON, setActiveNav, debounce, slugify } from './shared.js';

let map = null;
let markers = [];
let quadrilhas = [];
let currentFilter = 'all';
let currentSearch = '';

function cleanText(str) {
  return (str || '').normalize('NFC').trim();
}

function normalizeSearch(str) {
  return (str || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function getQuadrilhaHref(quad) {
  return `quadrilha/${quad.slug || slugify(quad.nome || '')}.html`;
}

function setActiveFilterButton(grupo) {
  document.querySelectorAll('.filter-btn').forEach((btn) => {
    const text = (btn.textContent || '').trim();
    const btnGroup = text === 'Todas' ? 'all' : text;
    btn.classList.toggle('active', btnGroup === grupo);
  });
}

function renderFallbackList(filtered) {
  const listRoot = document.getElementById('mapaListaFallback');
  const empty = document.getElementById('mapaListaEmpty');
  if (!listRoot) return;

  const cidades = new Map();
  filtered.forEach((quad) => {
    const cidade = cleanText(quad.cidade) || 'Cidade nao informada';
    if (!cidades.has(cidade)) cidades.set(cidade, []);
    cidades.get(cidade).push(quad);
  });

  const orderedCities = Array.from(cidades.keys()).sort((a, b) => a.localeCompare(b, 'pt-BR'));
  if (!orderedCities.length) {
    listRoot.innerHTML = '';
    if (empty) empty.classList.remove('hidden');
    return;
  }

  if (empty) empty.classList.add('hidden');

  listRoot.innerHTML = orderedCities
    .map((cidade) => {
      const items = cidades
        .get(cidade)
        .slice()
        .sort((a, b) => (a.nome || '').localeCompare(b.nome || '', 'pt-BR'));

      const links = items
        .map((quad) => {
          const grupoClass = quad.grupo === 'Especial' ? 'badge' : 'badge badge-secondary';
          return `<li style="display:flex; align-items:center; gap:8px; margin:0 0 6px;">
              <a href="${getQuadrilhaHref(quad)}">${cleanText(quad.nome)}</a>
              <span class="${grupoClass}">${cleanText(quad.grupo) || '-'}</span>
            </li>`;
        })
        .join('');

      return `<article class="card"><div class="card-body">
          <h3 class="card-title" style="margin-bottom:10px;">${cidade}</h3>
          <ul class="link-list" style="display:block;">${links}</ul>
        </div></article>`;
    })
    .join('');
}

function buildFilteredList() {
  let filtered = [...quadrilhas];

  if (currentFilter !== 'all') {
    filtered = filtered.filter((q) => q.grupo === currentFilter);
  }

  if (currentSearch) {
    const searchLower = normalizeSearch(currentSearch);
    filtered = filtered.filter((q) =>
      normalizeSearch(q.nome).includes(searchLower) ||
      normalizeSearch(q.cidade).includes(searchLower)
    );
  }

  return filtered;
}

function initMap() {
  if (!window.L) return;

  map = L.map('map').setView([-15.79, -47.87], 10);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: ' OpenStreetMap contributors',
    maxZoom: 19,
  }).addTo(map);
}

function createCityPopup(cidadeData) {
  const cidade = cleanText(cidadeData.cidade);
  const quads = cidadeData.quadrilhas;

  const sorted = [...quads].sort((a, b) => (b.pontos2025 || 0) - (a.pontos2025 || 0));

  let html = `
    <div style="min-width: 280px; max-height: 400px; overflow-y: auto;">
      <h3 style="margin: 0 0 12px 0; color: var(--accent-primary); font-size: 1.2em; border-bottom: 2px solid var(--accent-primary); padding-bottom: 8px;">
        ${cidade}
      </h3>
      <p style="margin: 0 0 12px 0; color: #666; font-size: 0.9em;">
        ${quads.length} ${quads.length === 1 ? 'quadrilha' : 'quadrilhas'}
      </p>
      <div style="display: flex; flex-direction: column; gap: 6px;">
  `;

  sorted.forEach((quad) => {
    const grupoColor = quad.grupo === 'Especial' ? '#d32f2f' : '#f57c00';
    const nome = cleanText(quad.nome);
    const link = getQuadrilhaHref(quad);
    html += `
      <div style="
        border: 1px solid #e0e0e0;
        border-radius: 6px;
        padding: 8px 10px;
        background: #f9f9f9;
        transition: all 0.2s;
      " onmouseover="this.style.background='#f0f0f0'; this.style.borderColor='${grupoColor}';"
         onmouseout="this.style.background='#f9f9f9'; this.style.borderColor='#e0e0e0';">
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 4px;">
          <h4 style="margin: 0; font-size: 1em; color: #1a1a1a;">
            ${nome}
          </h4>
          <span style="
            background: ${grupoColor};
            color: white;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 0.75em;
            font-weight: bold;
          ">${quad.grupo}</span>
        </div>
        <a href="${link}"
           style="
             display: inline-block;
             padding: 6px 12px;
             background: var(--accent-primary);
             color: white;
             text-decoration: none;
             border-radius: 4px;
             font-size: 0.85em;
             font-weight: 500;
           "
           onmouseover="this.style.background='#b71c1c';"
           onmouseout="this.style.background='var(--accent-primary)';">
          Ver perfil
        </a>
      </div>
    `;
  });

  html += `
      </div>
    </div>
  `;

  return html;
}

function addCityMarker(cidadeData) {
  if (!map || !window.L) return;

  const count = cidadeData.quadrilhas.length;
  const cidade = cleanText(cidadeData.cidade);

  const icon = L.divIcon({
    className: 'custom-marker-city',
    html: `
      <div style="
        background: linear-gradient(135deg, #d32f2f, #f57c00);
        color: white;
        padding: 8px 14px;
        border-radius: 25px;
        font-weight: bold;
        white-space: nowrap;
        box-shadow: 0 3px 6px rgba(0,0,0,0.4);
        cursor: pointer;
        border: 3px solid white;
        text-align: center;
        min-width: 80px;
      ">
        <div style="font-size: 0.9em; margin-bottom: 2px;">${cidade}</div>
        <div style="font-size: 1.3em; line-height: 1;">${count}</div>
      </div>
    `,
    iconSize: [null, null],
    iconAnchor: [0, 0],
  });

  const marker = L.marker([cidadeData.coords.lat, cidadeData.coords.lng], { icon })
    .addTo(map)
    .bindPopup(createCityPopup(cidadeData), {
      maxWidth: 350,
      className: 'city-popup',
    });

  markers.push(marker);
}

function addMarkers(filtered) {
  if (!map || !window.L) return;

  markers.forEach((marker) => map.removeLayer(marker));
  markers = [];

  const cidadesMap = new Map();
  filtered.forEach((quad) => {
    if (!quad.coords || quad.coords.lat == null || quad.coords.lng == null) return;

    const cidadeKey = quad.cidade;
    if (!cidadesMap.has(cidadeKey)) {
      cidadesMap.set(cidadeKey, {
        cidade: quad.cidade,
        quadrilhas: [],
        coords: { lat: quad.coords.lat, lng: quad.coords.lng },
      });
    }
    cidadesMap.get(cidadeKey).quadrilhas.push(quad);
  });

  cidadesMap.forEach((cidadeData) => addCityMarker(cidadeData));

  if (markers.length > 0) {
    const group = new L.featureGroup(markers);
    map.fitBounds(group.getBounds().pad(0.1));
  }
}

function render() {
  const filtered = buildFilteredList();
  renderFallbackList(filtered);
  addMarkers(filtered);
}

window.filterMapa = function filterMapa(grupo) {
  currentFilter = grupo;
  setActiveFilterButton(grupo);
  render();
};

async function init() {
  initMap();

  const excludedSlugs = new Set(['xuva-de-prata', 'traia-veia']);
  const loaded = (await loadJSON('data/quadrilhas.json')) || [];
  quadrilhas = loaded.filter((q) => {
    const slug = (q.slug || slugify(q.nome || '')).toLowerCase();
    return !excludedSlugs.has(slug);
  });
  render();

  const searchInput = document.getElementById('searchMapa');
  if (searchInput) {
    const debouncedSearch = debounce(() => {
      currentSearch = searchInput.value;
      render();
    }, 300);

    searchInput.addEventListener('input', debouncedSearch);
  }

  setActiveNav();
}

init();
