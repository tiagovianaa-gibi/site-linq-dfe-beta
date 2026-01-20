/* ============================================
   SHARED.JS - Funções Compartilhadas
   ============================================ */

/**
 * Carrega um arquivo JSON
 * VOCS S" MUDA AQUI: caminho dos arquivos JSON em /data/
 */
export async function loadJSON(path) {
  try {
    const response = await fetch(withRoot(path));
    if (!response.ok) {
      throw new Error(`Erro ao carregar ${path}: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Erro ao carregar JSON:', error);
    return null;
  }
}

const ROOT_URL = new URL("/", window.location.origin).href;

function withRoot(path) {
  if (!path) return path;
  if (path.startsWith("http") || path.startsWith("/")) return path;
  return new URL(path, ROOT_URL).href;
}


/**
 * Converte string para slug (sem acentos, com hífens)
 * Ex: "Arroxa o Nó" ?' "arroxa-o-no"
 */
export function slugify(text) {
  if (!text) return '';
  
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^\w\s-]/g, '') // Remove caracteres especiais
    .replace(/\s+/g, '-') // Espaços para hífens
    .replace(/-+/g, '-') // Múltiplos hífens para um só
    .trim();
}

function normalizeImagePath(value, folder) {
  if (!value) return "";
  if (value.includes("/")) return value;
  if (!folder) return value;
  return `${folder}/${value}`;
}

function hasImageExtension(value) {
  return /\.(png|jpe?g)$/i.test(value || "");
}

export function buildPhotoCandidates(value, folder = "assets/fotos-quadrilhas") {
  if (!value) return [];
  const normalized = normalizeImagePath(value, folder);
  if (hasImageExtension(normalized)) {
    return [withRoot(normalized)];
  }
  return [
    withRoot(`${normalized}.png`),
    withRoot(`${normalized}.jpg`),
    withRoot(`${normalized}.jpeg`),
    { href: new URL('confebraq.html', circuitoLink.href).href, label: 'CONFEBRAQ' },
  ];
}

export function setupImageFallbacks(root = document) {
  const images = root.querySelectorAll("img[data-candidates]");
  images.forEach((img) => {
    const candidates = (img.dataset.candidates || "")
      .split("|")
      .filter(Boolean);
    if (!candidates.length) return;
    let index = 0;
    img.addEventListener("error", () => {
      index += 1;
      if (index < candidates.length) {
        img.src = candidates[index];
        return;
      }
      const fallback = img.dataset.fallback;
      if (fallback) {
        img.src = fallback;
      } else {
        img.style.display = "none";
      }
    });
  });
}

export function applyImageCandidates(img, candidates, fallback) {
  if (!img || !Array.isArray(candidates) || candidates.length === 0) {
    if (img && fallback) img.src = withRoot(fallback);
    return;
  }
  img.dataset.candidates = candidates.join("|");
  if (fallback) img.dataset.fallback = withRoot(fallback);
  img.src = candidates[0];
  setupImageFallbacks(img.parentElement || img);
}

/**
 * Aplica focal point na imagem (foco no rosto)
 * VOCS S" MUDA AQUI: ajuste focal no JSON (x, y de 0 a 1)
 */
export function applyFocal(img, focal) {
  if (!img || !focal) return;
  
  const x = (focal.x || 0.5) * 100;
  const y = (focal.y || 0.18) * 100;
  
  img.style.objectPosition = `${x}% ${y}%`;
  img.style.objectFit = 'cover';
}

/**
 * Define item ativo na navegação
 */
export function setActiveNav() {
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('nav a');
  
  navLinks.forEach(link => {
    const linkPath = new URL(link.href).pathname;
    if (linkPath === currentPath || 
        (currentPath.endsWith('/') && linkPath.endsWith('index.html'))) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    } else {
      link.classList.remove('active');
      link.removeAttribute('aria-current');
    }
  });
}

// ===== Captura de erros globais (pode ser enviada a um webhook/Sentry) =====
const ERROR_LOG_ENDPOINT = window?.ENV_ERROR_WEBHOOK || null;

function reportError(payload) {
  if (!ERROR_LOG_ENDPOINT || typeof fetch !== 'function') return;
  try {
    fetch(ERROR_LOG_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    });
  } catch (_) {
    // ignore
  }
}

window.addEventListener('error', (event) => {
  reportError({
    type: 'error',
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
  });
});

window.addEventListener('unhandledrejection', (event) => {
  reportError({
    type: 'unhandledrejection',
    reason: event.reason ? event.reason.toString() : 'unknown',
  });
});

/**
 * Retorna URL da foto da quadrilha
 * Prioridade: foto no JSON ?' slug automático ?' placeholder
 * VOCS S" MUDA AQUI: caminho das fotos em assets/fotos-quadrilhas/
 */
export function getQuadrilhaPhoto(quadrilha, useCapa = false) {
  // Se pedir capa e tiver foto_capa, usa ela
  if (useCapa && quadrilha.foto_capa) {
    const candidates = buildPhotoCandidates(quadrilha.foto_capa);
    return candidates[0] || withRoot("assets/banners/placeholder.jpg");
  }
  
  // Usa foto normal
  if (quadrilha.foto) {
    const candidates = buildPhotoCandidates(quadrilha.foto);
    return candidates[0] || withRoot("assets/banners/placeholder.jpg");
  }
  
  // Fallback: tenta slug
  const slug = quadrilha.slug || slugify(quadrilha.nome);
  if (slug) {
    const candidates = buildPhotoCandidates(slug);
    return candidates[0] || withRoot("assets/banners/placeholder.jpg");
  }

  return withRoot("assets/banners/placeholder.jpg");
}

export function getQuadrilhaPhotoCandidates(quadrilha, useCapa = false) {
  if (useCapa && quadrilha.foto_capa) return buildPhotoCandidates(quadrilha.foto_capa);
  if (quadrilha.foto) return buildPhotoCandidates(quadrilha.foto);
  const slug = quadrilha.slug || slugify(quadrilha.nome);
  return slug ? buildPhotoCandidates(slug) : [];
}

/**
 * Aplica foco em rosto para cards de destaque (campeãs/destaques)
 */
export function applyFaceCrop(img) {
  if (!img) return;
  img.style.objectFit = 'cover';
  img.style.objectPosition = '50% 30%'; // sobe o foco para preservar rosto
}

/** Dropdown de Quadrilhas no menu principal */
async function initQuadrilhaDropdown(dataUrl) {
  const menu = document.querySelector('.nav-quadrilha-menu');
  const li = menu ? menu.closest('li') : null;
  if (!li || !menu) return;

  // Evita reprocessar
  if (menu.dataset.loaded === 'true') return;

  const data = await loadJSON(dataUrl || 'data/quadrilhas.json');
  if (!Array.isArray(data) || !data.length) {
    menu.innerHTML = '<span class="dropdown-empty">Não foi possível carregar.</span>';
    return;
  }

  const sorted = [...data].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
  menu.innerHTML = sorted
    .map(q => {
      const href = q.slug
         ? `/quadrilha/${q.slug}.html`
        : `/quadrilha.html?id=${q.id}`;
      return `<a href="${href}">${q.nome}</a>`;
    })
    .join('');
  menu.dataset.loaded = 'true';
}

function setupFiliadasDropdown() {
  const filLink = document.querySelector('nav a[href$="quadrilhas.html"]');
  if (!filLink) return;
  const li = filLink.closest('li') || filLink.parentElement;
  if (!li) return;

  // Marca como dropdown e cria container do menu
  li.classList.add('has-dropdown');

  // Evita adicionar duas vezes
  if (!li.querySelector('.nav-quadrilha-menu')) {
    const menu = document.createElement('div');
    menu.className = 'dropdown-menu nav-quadrilha-menu';
    li.appendChild(menu);
  }

  const dataUrl = new URL('data/quadrilhas.json', filLink.href).href;
  initQuadrilhaDropdown(dataUrl);

  setupDropdownClick(li, filLink);
}

function setupCircuitoDropdown() {
  const circuitoLink = document.querySelector('nav a[href$="circuito.html"]');
  if (!circuitoLink) return;
  const li = circuitoLink.closest('li') || circuitoLink.parentElement;
  if (!li) return;

  li.classList.add('has-dropdown');

  if (!li.querySelector('.nav-circuito-menu')) {
    const menu = document.createElement('div');
    menu.className = 'dropdown-menu nav-circuito-menu';
    li.appendChild(menu);
  }

  const baseCircuito = new URL('circuito.html', circuitoLink.href).href;
  const links = [
    { href: baseCircuito, label: 'Circuito de Quadrilhas' },
    { href: new URL('grupo-especial.html', circuitoLink.href).href, label: 'Grupo Especial' },
    { href: new URL('grupo-acesso.html', circuitoLink.href).href, label: 'Grupo de Acesso' },
    { href: new URL('edicoes-anteriores.html', circuitoLink.href).href, label: 'Edições anteriores' },
    { href: new URL('campeoes-circuito.html', circuitoLink.href).href, label: 'Campeãs do Circuito' },
    { href: new URL('confebraq.html', circuitoLink.href).href, label: 'CONFEBRAQ' },
  ];

  const menu = li.querySelector('.nav-circuito-menu');
  menu.innerHTML = links.map(item => `<a href="${item.href}">${item.label}</a>`).join('');

  setupDropdownClick(li, circuitoLink);
}

function setupDropdownClick(li, link) {
  if (!li || !link) return;

  link.setAttribute('aria-haspopup', 'true');
  link.setAttribute('aria-expanded', 'false');

  const positionDropdown = () => {
    const menu = li.querySelector('.dropdown-menu');
    if (!menu) return;

    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    if (!isMobile) {
      menu.style.position = '';
      menu.style.top = '';
      menu.style.left = '';
      menu.style.right = '';
      menu.style.minWidth = '';
      menu.style.maxWidth = '';
      return;
    }

    const rect = link.getBoundingClientRect();
    const padding = 8;
    const minWidth = Math.max(180, Math.ceil(rect.width));
    let left = Math.round(rect.left);
    const maxLeft = window.innerWidth - padding;

    if (left + minWidth > maxLeft) {
      left = Math.max(padding, maxLeft - minWidth);
    }

    menu.style.position = 'fixed';
    menu.style.top = `${Math.round(rect.bottom)}px`;
    menu.style.left = `${left}px`;
    menu.style.right = 'auto';
    menu.style.minWidth = `${minWidth}px`;
    menu.style.maxWidth = `${Math.round(window.innerWidth - left - padding)}px`;
  };

  const openDropdown = (event) => {
    event.preventDefault();
    event.stopPropagation();
    document.querySelectorAll('nav li.has-dropdown.open').forEach((item) => {
      if (item !== li) {
        item.classList.remove('open');
        const itemLink = item.querySelector('a');
        if (itemLink) itemLink.setAttribute('aria-expanded', 'false');
      }
    });
    li.classList.add('open');
    link.setAttribute('aria-expanded', 'true');
    positionDropdown();
  };

  let lastTouchTime = 0;

  link.addEventListener('touchstart', (e) => {
    if (li.classList.contains('open')) return;
    lastTouchTime = Date.now();
    openDropdown(e);
  }, { passive: false });

  link.addEventListener('click', (e) => {
    if (Date.now() - lastTouchTime < 600) return;
    if (!li.classList.contains('open')) {
      openDropdown(e);
      return;
    }
    // Segundo toque/clique segue o link normalmente.
    li.classList.remove('open');
    link.setAttribute('aria-expanded', 'false');
  });

  document.addEventListener('click', (e) => {
    if (!li.contains(e.target)) {
      li.classList.remove('open');
      link.setAttribute('aria-expanded', 'false');
    }
  });

  link.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      li.classList.remove('open');
      link.setAttribute('aria-expanded', 'false');
    }
  });

  window.addEventListener('resize', () => {
    if (li.classList.contains('open')) positionDropdown();
  });

  const nav = link.closest('nav');
  const navList = nav ? nav.querySelector('ul') : null;
  if (navList) {
    navList.addEventListener('scroll', () => {
      if (li.classList.contains('open')) positionDropdown();
    }, { passive: true });
  }
}

// Executa assim que o DOM estiver pronto
const runWhenReady = (fn) => {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fn, { once: true });
  } else {
    fn();
  }
};

function initRankingFilters() {
  const scopes = document.querySelectorAll('[data-ranking-scope]');
  scopes.forEach((scope) => {
    const select = scope.querySelector('[data-ranking-filter] select');
    const panels = Array.from(scope.querySelectorAll('[data-ranking-panel]'));
    if (!select || panels.length === 0) return;

    const updatePanels = () => {
      const value = select.value;
      panels.forEach((panel) => {
        const key = panel.getAttribute('data-ranking-panel');
        const shouldShow = value === 'all' || value === key;
        panel.style.display = shouldShow ? '' : 'none';
      });
    };

    select.addEventListener('change', updatePanels);
    updatePanels();
  });
}

function setupAccessibilityHelpers() {
  const nav = document.querySelector('nav');
  if (nav && !nav.getAttribute('aria-label')) {
    nav.setAttribute('aria-label', 'Navegação principal');
  }

  const main = document.querySelector('main');
  if (main && !main.getAttribute('role')) {
    main.setAttribute('role', 'main');
  }

  const footer = document.querySelector('footer');
  if (footer && !footer.getAttribute('aria-label')) {
    footer.setAttribute('aria-label', 'Rodapé');
  }
}

runWhenReady(setupFiliadasDropdown);
runWhenReady(setupCircuitoDropdown);
runWhenReady(initRankingFilters);
runWhenReady(setupAccessibilityHelpers);

/**
 * Formata data para exibição
 */
export function formatDate(dateString) {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('pt-BR', options);
}

/**
 * Formata data curta (DD/MM/YYYY)
 */
export function formatDateShort(dateString) {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR');
}

/**
 * Sanitiza HTML básico (prevenção XSS)
 */
export function sanitizeHTML(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/**
 * Cria elemento com fallback
 */
export function createElement(tag, className, content) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (content) el.innerHTML = content;
  return el;
}

/**
 * Debounce para otimizar buscas
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Normaliza string para busca (remove acentos, lowercase)
 */
export function normalize(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/**
 * Normaliza uma URL de imagem para uso no site
 * - aceita string ou objeto { url }
 * - converte gs:// para URL https do Firebase Storage
 * - remove barras iniciais para funcionar no GitHub Pages
 * - codifica espa?õos e caracteres especiais
 */
export function normalizeImageUrl(value, fallback = '') {
  let url = value;

  if (url && typeof url === 'object') {
    if (typeof url.url === 'string') {
      url = url.url;
    } else if (typeof url.path === 'string') {
      url = url.path;
    } else if (Array.isArray(url) && url.length) {
      url = url[0];
    }
  }

  url = (url || '').toString().trim();
  if (!url) return fallback;

  // gs://bucket/path/file => https://firebasestorage.googleapis.com/v0/b/bucket/o/path/file?alt=media
  if (/^gs:\/\//i.test(url)) {
    try {
      const withoutScheme = url.replace(/^gs:\/\//i, '');
      const [bucket, ...rest] = withoutScheme.split('/');
      const path = rest.join('/');
      if (bucket && path) {
        return `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeURIComponent(path)}?alt=media`;
      }
    } catch (e) {
      // segue para fallback
    }
  }

  // http/https mant?m como est?
  if (/^https?:\/\//i.test(url)) return url;

  // Remove barra inicial para n?"o quebrar caminho no GitHub Pages
  const clean = url.replace(/^\/+/, '');
  if (!clean) return fallback;

  // Se veio s?ü o nome do arquivo (ex.: "foto.jpg"), presume pasta de noticias
  // para evitar 404 no GitHub Pages quando o Firestore salva apenas o basename
  if (!clean.includes('/') && /\.(jpg|jpeg|png|gif|webp|avif)$/i.test(clean)) {
    return `assets/noticias/${encodeURI(clean)}`;
  }

  // Codifica espa?õos e caracteres especiais sem quebrar slashes
  return encodeURI(clean);
}







