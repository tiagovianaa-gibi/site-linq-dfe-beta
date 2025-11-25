/* ============================================
   TRANSPARENCIA.JS - Lógica da página de transparência
   ============================================ */

import { setActiveNav } from './shared.js';

/**
 * Inicialização
 */
function init() {
  // Ativa navegação
  setActiveNav();
  
  // VOCÊ SÓ MUDA AQUI: Se quiser carregar de JSON, descomente:
  /*
  import { loadJSON } from './shared.js';
  const documentos = await loadJSON('data/documentos.json') || [];
  renderDocumentos(documentos);
  */
}

init();


