/* ============================================
   MAPA.JS - Lógica do mapa com Leaflet
   ============================================
   VOCÊ SÓ MUDA AQUI: nada, funciona automaticamente
*/

import { loadJSON, setActiveNav, debounce } from './shared.js';

let map = null;
let markers = [];
let quadrilhas = [];
let currentFilter = 'all';
let currentSearch = '';

/**
 * Inicializa mapa
 */
function initMap() {
  // Centro do DF
  map = L.map('map').setView([-15.79, -47.87], 10);
  
  // Tile layer (OpenStreetMap)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19
  }).addTo(map);
}

/**
 * Adiciona marcadores agrupados por cidade
 */
function addMarkers() {
  // Remove marcadores existentes
  markers.forEach(marker => map.removeLayer(marker));
  markers = [];
  
  let filtered = [...quadrilhas];
  
  // Filtro por grupo
  if (currentFilter !== 'all') {
    filtered = filtered.filter(q => q.grupo === currentFilter);
  }
  
  // Busca
  if (currentSearch) {
    const searchLower = currentSearch.toLowerCase();
    filtered = filtered.filter(q => 
      q.nome.toLowerCase().includes(searchLower) ||
      q.cidade.toLowerCase().includes(searchLower)
    );
  }
  
  // Agrupa por cidade
  const cidadesMap = new Map();
  filtered.forEach(quad => {
    if (!quad.coords || !quad.coords.lat || !quad.coords.lng) return;
    
    const cidadeKey = quad.cidade;
    if (!cidadesMap.has(cidadeKey)) {
      cidadesMap.set(cidadeKey, {
        cidade: quad.cidade,
        quadrilhas: [],
        coords: { lat: quad.coords.lat, lng: quad.coords.lng }
      });
    }
    cidadesMap.get(cidadeKey).quadrilhas.push(quad);
  });
  
  // Adiciona marcador para cada cidade
  cidadesMap.forEach((cidadeData, cidadeKey) => {
    addCityMarker(cidadeData);
  });
  
  // Ajusta zoom se houver marcadores
  if (markers.length > 0) {
    const group = new L.featureGroup(markers);
    map.fitBounds(group.getBounds().pad(0.1));
  }
}

/**
 * Adiciona marcador de cidade com contagem
 */
function addCityMarker(cidadeData) {
  const count = cidadeData.quadrilhas.length;
  const cidade = cidadeData.cidade;
  
  // Cria ícone com cidade e número
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
    iconAnchor: [0, 0]
  });
  
  // Cria popup com lista de quadrilhas
  const popupContent = createCityPopup(cidadeData);
  
  const marker = L.marker(
    [cidadeData.coords.lat, cidadeData.coords.lng],
    { icon }
  )
    .addTo(map)
    .bindPopup(popupContent, {
      maxWidth: 350,
      className: 'city-popup'
    });
  
  markers.push(marker);
}

/**
 * Cria conteúdo do popup da cidade
 */
function createCityPopup(cidadeData) {
  const cidade = cidadeData.cidade;
  const quads = cidadeData.quadrilhas;
  
  // Ordena por pontos (maior primeiro)
  const sorted = [...quads].sort((a, b) => (b.pontos2025 || 0) - (a.pontos2025 || 0));
  
  let html = `
    <div style="min-width: 280px; max-height: 400px; overflow-y: auto;">
      <h3 style="margin: 0 0 12px 0; color: var(--accent-primary); font-size: 1.2em; border-bottom: 2px solid var(--accent-primary); padding-bottom: 8px;">
        ${cidade}
      </h3>
      <p style="margin: 0 0 12px 0; color: #666; font-size: 0.9em;">
        ${quads.length} ${quads.length === 1 ? 'quadrilha' : 'quadrilhas'}
      </p>
      <div style="display: flex; flex-direction: column; gap: 8px;">
  `;
  
  sorted.forEach((quad, index) => {
    const grupoColor = quad.grupo === 'Especial' ? '#d32f2f' : '#f57c00';
    html += `
      <div style="
        border: 1px solid #e0e0e0;
        border-radius: 6px;
        padding: 10px;
        background: #f9f9f9;
        transition: all 0.2s;
      " onmouseover="this.style.background='#f0f0f0'; this.style.borderColor='${grupoColor}';" 
         onmouseout="this.style.background='#f9f9f9'; this.style.borderColor='#e0e0e0';">
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 6px;">
          <h4 style="margin: 0; font-size: 1em; color: #1a1a1a;">
            ${quad.nome}
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
        <div style="font-size: 0.85em; color: #666; margin-bottom: 8px;">
          ${quad.pontos2025 ? `<strong>Pontos 2025:</strong> ${quad.pontos2025}` : ''}
        </div>
        <a href="quadrilha.html?id=${quad.id}" 
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
          Ver Perfil →
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

/**
 * Filtra mapa
 */
window.filterMapa = function(grupo) {
  currentFilter = grupo;
  
  // Atualiza botões
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  event.target.classList.add('active');
  
  addMarkers();
};

/**
 * Inicialização
 */
async function init() {
  // Inicializa mapa
  initMap();
  
  // Carrega dados
  quadrilhas = await loadJSON('data/quadrilhas.json') || [];
  
  // Adiciona marcadores
  addMarkers();
  
  // Busca
  const searchInput = document.getElementById('searchMapa');
  if (searchInput) {
    const debouncedSearch = debounce(() => {
      currentSearch = searchInput.value;
      addMarkers();
    }, 300);
    
    searchInput.addEventListener('input', debouncedSearch);
  }
  
  // Ativa navegação
  setActiveNav();
}

init();
