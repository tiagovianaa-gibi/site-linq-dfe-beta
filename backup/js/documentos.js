/* ============================================
   DOCUMENTOS.JS - Lógica da página de documentos
   ============================================ */

import { setActiveNav } from './shared.js';

/**
 * Inicialização
 */
function init() {
  // Ativa navegação
  setActiveNav();
  
  // VOC�S S�" MUDA AQUI: Se quiser carregar de JSON, descomente:
  /*
  import { loadJSON } from './shared.js';
  const documentos = await loadJSON('data/documentos.json') || [];
  renderDocumentos(documentos);
  */
}

init();



