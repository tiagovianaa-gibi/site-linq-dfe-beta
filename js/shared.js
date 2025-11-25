/* ============================================
   SHARED.JS - Funções Compartilhadas
   ============================================ */

/**
 * Carrega um arquivo JSON
 * VOCÊ SÓ MUDA AQUI: caminho dos arquivos JSON em /data/
 */
export async function loadJSON(path) {
  try {
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`Erro ao carregar ${path}: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Erro ao carregar JSON:', error);
    return null;
  }
}

/**
 * Converte string para slug (sem acentos, com hífens)
 * Ex: "Arroxa o Nó" → "arroxa-o-no"
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

/**
 * Aplica focal point na imagem (foco no rosto)
 * VOCÊ SÓ MUDA AQUI: ajuste focal no JSON (x, y de 0 a 1)
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
    } else {
      link.classList.remove('active');
    }
  });
}

/**
 * Retorna URL da foto da quadrilha
 * Prioridade: foto no JSON → slug automático → placeholder
 * VOCÊ SÓ MUDA AQUI: caminho das fotos em assets/fotos-quadrilhas/
 */
export function getQuadrilhaPhoto(quadrilha, useCapa = false) {
  // Se pedir capa e tiver foto_capa, usa ela
  if (useCapa && quadrilha.foto_capa) {
    return `assets/fotos-quadrilhas/${quadrilha.foto_capa}`;
  }
  
  // Usa foto normal
  if (quadrilha.foto) {
    return `assets/fotos-quadrilhas/${quadrilha.foto}`;
  }
  
  // Fallback: tenta slug
  const slug = quadrilha.slug || slugify(quadrilha.nome);
  if (slug) {
    return `assets/fotos-quadrilhas/${slug}.jpg`;
  }
  
  return 'assets/banners/placeholder.jpg';
}

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


