/* ============================================
   DIRETORIA.JS - Lógica da página de diretoria
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
  const diretoria = await loadJSON('data/diretoria.json') || [];
  renderDiretoria(diretoria);
  */
}

init();



