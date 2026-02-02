// js/portal-app.js





// Lado "logado" do Portal da Liga: verifica usuário, busca papel e controla navegação












































// Y" Mesma config do portal-login.js





const firebaseConfig = {





  apiKey: "AIzaSyCm9ANrGwedzgdvCaSf05-qZsTPJMgrWOA",





  authDomain: "portal-da-liga.firebaseapp.com",





  projectId: "portal-da-liga",





  storageBucket: "portal-da-liga.appspot.com",





  messagingSenderId: "129376570268",





  appId: "1:129376570268:web:b13e414ee188a189869659",





  measurementId: "G-2LS730BX44",





};











const app = initializeApp(firebaseConfig);





const auth = getAuth(app);





const db = getFirestore(app);





const storage = getStorage(app);











// Elementos básicos





const userNameSpan = document.getElementById("portalUserName");





const userRoleTextP = document.getElementById("portalUserRoleText");





const statusCardText = document.getElementById("statusCardText");





const logoutButton = document.getElementById("logoutButton");











// Quadrilhas





const quadrilhaSubtitle = document.getElementById("quadrilhaSubtitle");





const quadrilhaContent = document.getElementById("quadrilhaContent");





const quadrilhaAdminArea = document.getElementById("quadrilhaAdminArea");











// Formulários de administração (quadrilha / usuários)





const quadrilhaForm = document.getElementById("quadrilhaForm");





const quadrilhaFormMessage = document.getElementById("quadrilhaFormMessage");





const userForm = document.getElementById("userForm");





const userFormMessage = document.getElementById("userFormMessage");





const userQuadrilhaSelect = document.getElementById("userQuadrilhaId");





const userQuadrilhaGroup = document.getElementById("userQuadrilhaGroup");





const userPapelSelect = document.getElementById("userPapel");











// DOCUMENTOS





const docSubtitle = document.getElementById("docSubtitle");





const docTableBody = document.getElementById("docTableBody");





const docFiltersCard = document.getElementById("docFiltersCard");





const docFiltroQuadrilha = document.getElementById("docFiltroQuadrilha");





const docFiltroStatus = document.getElementById("docFiltroStatus");





const docFiltroTipo = document.getElementById("docFiltroTipo");





const docAdminArea = document.getElementById("docAdminArea");





const docForm = document.getElementById("docForm");





const docFormMessage = document.getElementById("docFormMessage");





const docIdInput = document.getElementById("docId");





const docQuadrilhaSelect = document.getElementById("docQuadrilhaId");





const docTipoSelect = document.getElementById("docTipo");





const docDataEmissaoInput = document.getElementById("docDataEmissao");





const docDataValidadeInput = document.getElementById("docDataValidade");





const docStatusSelect = document.getElementById("docStatus");





const docObsTextarea = document.getElementById("docObs");





const docFormCancelBtn = document.getElementById("docFormCancelBtn");











// Dashboard widgets





const statDocsOk = document.getElementById("statDocsOk");





const statDocsPend = document.getElementById("statDocsPend");





const statQuadrilhasTotal = document.getElementById("statQuadrilhasTotal");





const statQuadrilhasEspecial = document.getElementById("statQuadrilhasEspecial");





const statQuadrilhasAcesso = document.getElementById("statQuadrilhasAcesso");





const statFinanceiroDebito = document.getElementById("statFinanceiroDebito");











// FINANCEIRO





const finSubtitle = document.getElementById("finSubtitle");





const finTableBody = document.getElementById("finTableBody");





const finTable = finTableBody?.closest("table");





if (finTable) {





  const headerRow = finTable.querySelector("thead tr");





  if (





    headerRow &&





    !Array.from(headerRow.children).some(





      (th) => (th.textContent || "").trim() === "Ações"





    )





  ) {





    const th = document.createElement("th");





    th.textContent = "Ações";





    headerRow.appendChild(th);





  }





}





const finFiltersCard = document.getElementById("finFiltersCard");





const finFiltroQuadrilha = document.getElementById("finFiltroQuadrilha");





const finFiltroAno = document.getElementById("finFiltroAno");





const finFiltroTipo = document.getElementById("finFiltroTipo");





const finFiltroStatus = document.getElementById("finFiltroStatus");





const finAdminArea = document.getElementById("finAdminArea");





const finForm = document.getElementById("finForm");





const finFormMessage = document.getElementById("finFormMessage");





let finFormCancelBtn = document.getElementById("finFormCancelBtn");





const finFormSubmitBtn = finForm





  ? finForm.querySelector("button[type='submit']")





  : null;





const finFormSubmitBtnDefaultLabel =





  finFormSubmitBtn?.textContent?.trim() || "Salvar lançamento";





const finQuadrilhaSelect = document.getElementById("finQuadrilhaId");





const finTipoSelect = document.getElementById("finTipo");





const finAnoInput = document.getElementById("finAno");





const finDescricaoInput = document.getElementById("finDescricao");





const finValorInput = document.getElementById("finValor");





const finStatusSelect = document.getElementById("finStatus");





const finDataVencimentoInput = document.getElementById("finDataVencimento");





const finDataPagamentoInput = document.getElementById("finDataPagamento");





const finObsTextarea = document.getElementById("finObs");





const finChartQuadrilha = document.getElementById("finChartQuadrilha");





const finChartAno = document.getElementById("finChartAno");





const finChartTipo = document.getElementById("finChartTipo");





const finFiltroVencInicio = document.getElementById("finFiltroVencInicio");





const finFiltroVencFim = document.getElementById("finFiltroVencFim");





const finFiltroBusca = document.getElementById("finFiltroBusca");





const finOrdenacao = document.getElementById("finOrdenacao");





const finKpiTotal = document.getElementById("finKpiTotal");





const finKpiPago = document.getElementById("finKpiPago");





const finKpiAPagar = document.getElementById("finKpiAPagar");





const finKpiVencido = document.getElementById("finKpiVencido");





const finKpiInadimplencia = document.getElementById("finKpiInadimplencia");





const finYearChips = document.getElementById("finYearChips");





const finClearFilters = document.getElementById("finClearFilters");











// Pessoas / Elenco





const pessoasSubtitle = document.getElementById("pessoasSubtitle");





const pessoasAdminArea = document.getElementById("pessoasAdminArea");





const pessoasNoAccess = document.getElementById("pessoasNoAccess");





const assembleiaForm = document.getElementById("assembleiaForm");





const assembleiaFormMessage = document.getElementById("assembleiaFormMessage");





const assembleiaTituloInput = document.getElementById("assembleiaTitulo");





const assembleiaDataInput = document.getElementById("assembleiaData");





const assembleiaAtaInput = document.getElementById("assembleiaAtaUrl");





const assembleiaQuadrilhasList = document.getElementById(





  "assembleiaQuadrilhasList"





);





const assembleiasTableBody = document.getElementById("assembleiasTableBody");





const pessoasKpiAssembleias = document.getElementById("pessoasKpiAssembleias");





const pessoasKpiComFalta = document.getElementById("pessoasKpiComFalta");





const pessoasKpiEmRisco = document.getElementById("pessoasKpiEmRisco");





const faltasTableBody = document.getElementById("faltasTableBody");





const votacoesQuadrilhasList = document.getElementById("votacoesQuadrilhasList");





const votacoesTotalManter = document.getElementById("votacoesTotalManter");





const votacoesTotalAlterar = document.getElementById("votacoesTotalAlterar");





const votacoesTotalAbstencao = document.getElementById("votacoesTotalAbstencao");





const votacoesClearAll = document.getElementById("votacoesClearAll");





const faltasToggleBtn = document.getElementById("faltasToggleBtn");





const faltasDashboardBody = document.getElementById("faltasDashboardBody");





let editingAssembleiaId = null;





const assembleiasToggleBtn = document.getElementById("assembleiasToggleBtn");





const assembleiasBody = document.getElementById("assembleiasBody");





const votacoesToggleBtn = document.getElementById("votacoesToggleBtn");





const votacoesBody = document.getElementById("votacoesBody");





const passwordChangeModal = document.getElementById("passwordChangeModal");





const passwordChangeForm = document.getElementById("passwordChangeForm");





const passwordNewInput = document.getElementById("passwordNew");





const passwordConfirmInput = document.getElementById("passwordConfirm");





const passwordChangeMessage = document.getElementById("passwordChangeMessage");





const competicoesRankingBody = document.getElementById("competicoesRankingBody");





const competicoesTotalQuadrilhas = document.getElementById("competicoesTotalQuadrilhas");





const competicoesTotalEtapas = document.getElementById("competicoesTotalEtapas");





const competicoesMaiorTotal = document.getElementById("competicoesMaiorTotal");





const competicoesQuesitosGrid = document.getElementById("competicoesQuesitosGrid");











if (passwordChangeModal) {





  passwordChangeModal.hidden = true;





  passwordChangeModal.setAttribute("hidden", "");





  passwordChangeModal.style.display = "none";





  document.body.classList.remove("portal-modal-open");





}











if (!finFormCancelBtn && finForm) {





  const cancelBtn = document.createElement("button");





  cancelBtn.type = "button";





  cancelBtn.id = "finFormCancelBtn";





  cancelBtn.className = "btn btn-link";





  cancelBtn.style.display = "none";





  cancelBtn.style.marginLeft = "0";





  cancelBtn.textContent = "Cancelar edição";





  if (finFormMessage) {





    finFormMessage.insertAdjacentElement("afterend", cancelBtn);





  } else {





    finForm.appendChild(cancelBtn);





  }





  finFormCancelBtn = cancelBtn;





}











const userRoleLabelSpan = document.getElementById("portalUserRoleLabel");





// NOTÍCIAS





const newsList = document.getElementById("newsList");





const newsForm = document.getElementById("newsForm");





const newsFormMessage = document.getElementById("newsFormMessage");





const newsIdInput = document.getElementById("newsId");





const newsTitleInput =





  document.getElementById("newsTitulo") || document.getElementById("newsTitle");





const newsSummaryInput =





  document.getElementById("newsResumo") || document.getElementById("newsSummary");





const newsCoverInput =





  document.getElementById("newsCoverUrl") || document.getElementById("newsImagem");





const newsImageFileInput =





  document.getElementById("newsImagemFile") || document.getElementById("newsCoverFile");





const newsUploadBtn =





  document.getElementById("newsUploadBtn") || document.getElementById("newsCoverUploadBtn");





const newsUploadStatus =





  document.getElementById("newsUploadStatus") ||





  document.getElementById("newsCoverUploadStatus");





const newsTagsInput = document.getElementById("newsTags");





const newsStatusSelect = document.getElementById("newsStatus");





const newsContentInput =





  document.getElementById("newsConteudo") || document.getElementById("newsContent");





const newsAIKeywordsInput = document.getElementById("newsAIKeywords");





const newsAITypeSelect = document.getElementById("newsAIType");





const newsAIIncludeLinksCheckbox = document.getElementById("newsAIIncludeLinks");





const newsAIBriefInput = document.getElementById("newsAIBrief");





const newsAIGenerateBtn = document.getElementById("newsAIGenerateBtn");





const newsAIRegenerateBtn = document.getElementById("newsAIRegenerateBtn");





const newsAIClearBtn = document.getElementById("newsAIClearBtn");





const newsAIStatus = document.getElementById("newsAIStatus");





// Extras / aliases usados no CRUD de notícias





const newsAdminCard = document.getElementById("newsAdminCard");





const newsSubtitle = document.getElementById("newsSubtitle");





const newsFormTitle = document.getElementById("newsFormTitle");





const newsFormCancelBtn =





  document.getElementById("newsFormCancelBtn") ||





  document.getElementById("newsFormCancel");





const newsDestaqueHomeCheckbox = document.getElementById("newsDestaqueHome");











// Reaproveitando os mesmos inputs com outros nomes





const newsTituloInput = newsTitleInput;





const newsResumoInput = newsSummaryInput;





const newsImagemInput = newsCoverInput;





const newsConteudoTextarea = newsContentInput;

















// Dashboard widgets























// ====== ESTADO EM MEM"RIA ======





let currentUserData = null;





let quadrilhasCache = null;





let documentosCache = null;





let financeiroCache = null;





let noticiasCache = null;





let competicoesCache = null;





let editingFinanceiroId = null;











// Fallback local (teste/offline)





const SAMPLE_QUADRILHAS = [





  {





    id: "arroxa-o-no",





    nome: "Arroxa o Nó",





    sigla: "ARROXA",





    cidade: "Brasília",





    uf: "DF",





    grupo_atual: "ESPECIAL",





  },





  {





    id: "arraia-chapeu-de-palha",





    nome: "Arraiá Chapéu de Palha",





    sigla: "CHAPEU",





    cidade: "Samambaia",





    uf: "DF",





    grupo_atual: "ACESSO",





  },





];











const SAMPLE_DOCS = [





  {





    id: "arroxa-o-no_ESTatuto",





    quadrilhaId: "arroxa-o-no",





    tipo: "ESTATUTO",





    status: "VALIDO",





    dataValidade: "2026-12-31",





    observacoes: "Estatuto vigente",





  },





  {





    id: "arroxa-o-no_ATA",





    quadrilhaId: "arroxa-o-no",





    tipo: "ATA_ELEICAO",





    status: "VALIDO",





    dataValidade: "2026-12-31",





    observacoes: "Diretoria atual registrada",





  },





];

















// ====== FUN?.ES AUXILIARES ======





function setText(el, text) {





  if (el) el.textContent = text;





}











// Escapa caracteres perigosos (XSS)





function escapeHtml(text) {





  if (!text) return "";





  return text





    .replace(/&/g, "&")





    .replace(/</g, "&lt;")





    .replace(/>/g, "&gt;");





}











function sanitizePlainText(text) {





  if (!text) return "";





  return text.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "").replace(/[<>]/g, "");





}











const MOJIBAKE_REPLACEMENTS = [





  ["á", "á"],





  ["à", "à"],





  ["â", "â"],





  ["ã", "ã"],





  ["ä", "ä"],





  ["ç", "ç"],





  ["é", "é"],





  ["è", "è"],





  ["ê", "ê"],





  ["í", "í"],





  ["ï", "ï"],





  ["ó", "ó"],





  ["ô", "ô"],





  ["õ", "õ"],





  ["ú", "ú"],





  ["ü", "ü"],





  ["Á", "Á"],





  ["À", "À"],





  ["Â", "Â"],





  ["Ã", "Ã"],





  ["Ç", "Ç"],





  ["É", "É"],





  ["Ê", "Ê"],





  ["Í", "Í"],





  ["Ó", "Ó"],





  ["Ô", "Ô"],





  ["Õ", "Õ"],





  ["Ú", "Ú"],





  ["Ü", "Ü"],





  [" ", " "],





  ["–", "–"],





  ["—", "—"],





  ["'", "'"],





  ["'", "'"],















  ["…", "…"],





  ["º", "º"],





  ["ª", "ª"],





];











function fixMojibake(text) {
  if (!text) return "";
  const raw = String(text);
  // Only fix when the string looks like UTF-8 decoded as Latin-1/Windows-1252.
  if (!/[???][-¿]/.test(raw)) return raw;
  try {
    const bytes = Uint8Array.from(raw, (char) => char.charCodeAt(0));
    const decoded = new TextDecoder("utf-8").decode(bytes);
    return decoded.replace(/ /g, " ");
  } catch (err) {
    return raw.replace(/ /g, " ");
  }
}











// Converte texto puro em HTML seguro





// - Linha em branco => novo parágrafo





// - Linhas que começam com "## " viram <h2>





function portalTextToHtml(raw) {





  if (!raw) return "";











  const normalized = fixMojibake(raw);





  const lines = normalized.split("\n\n\n");





  const blocks = [];





  let current = [];











  for (const line of lines) {





    const trimmed = line.trim();





    if (!trimmed) {





      if (current.length) {





        blocks.push(current.join(""));





        current = [];





      }





    } else {





      current.push(trimmed);





    }





  }











  if (current.length) {





    blocks.push(current.join(""));





  }











  const linkifyInternal = (text) => {





    return text.replace(





      /(^|\s)(\/[^\s]+?\.html)/g,





      (match, prefix, path) =>





        `${prefix}<a href="${path}">${path}</a>`





    );





  };











  return blocks





    .map((block) => {





      if (block.startsWith("## ")) {





        const text = linkifyInternal(escapeHtml(block.slice(3)));





        return "<h2>" + text + "</h2>";





      }





      return "<p>" + linkifyInternal(escapeHtml(block)) + "</p>";





    })





    .join("");





}











function formatTimestampToPtBR(ts) {





  if (!ts) return "sem data";





  try {





    const d = ts.toDate ? ts.toDate() : new Date(ts);





    return d.toLocaleDateString("pt-BR", {





      day: "2-digit",





      month: "2-digit",





      year: "numeric",





    });





  } catch (e) {





    return "sem data";





  }





}











function parseDateValue(value) {





  if (!value) return null;





  if (typeof value === "object" && value?.toDate) {





    return value.toDate();





  }





  if (typeof value === "string") {





    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);





    if (match) {





      const [, year, month, day] = match;





      return new Date(Number(year), Number(month) - 1, Number(day));





    }





  }





  const parsed = new Date(value);





  if (Number.isNaN(parsed.getTime())) {





    return null;





  }





  return parsed;





}











const currencyFormatter = new Intl.NumberFormat("pt-BR", {





  style: "currency",





  currency: "BRL",





});











function formatCurrencyBR(value) {





  const num = Number(value) || 0;





  return currencyFormatter.format(num);





}











function formatDateForDisplay(value) {





  const dateValue = parseDateValue(value);





  if (!dateValue) return "--";





  const day = String(dateValue.getUTCDate()).padStart(2, "0");





  const month = String(dateValue.getUTCMonth() + 1).padStart(2, "0");





  const year = dateValue.getUTCFullYear();





  return `${day}-${month}-${year}`;





}











function formatDateForInput(value) {





  const dateValue = parseDateValue(value);





  if (!dateValue) return "";





  const day = String(dateValue.getUTCDate()).padStart(2, "0");





  const month = String(dateValue.getUTCMonth() + 1).padStart(2, "0");





  const year = dateValue.getUTCFullYear();





  return `${year}-${month}-${day}`;





}











function parseKeywords(raw) {





  return (raw || "")





    .split(",")





    .map((k) => k.trim())





    .filter(Boolean)





    .slice(0, 12);





}











// Desativa geração por IA no CRUD de notícias





if (newsAIKeywordsInput) {





  const aiSection = newsAIKeywordsInput.closest(".form-group");





  if (aiSection) aiSection.style.display = "none";





}





if (newsAIGenerateBtn) newsAIGenerateBtn.style.display = "none";





if (newsAIRegenerateBtn) newsAIRegenerateBtn.style.display = "none";





if (newsAIClearBtn) newsAIClearBtn.style.display = "none";











// ====== USUÁRIO LOGADO / PERFIL ======





async function loadCurrentUserData(user) {





  // Primeiro tentamos buscar doc pelo e-mail





  let userDocRef = doc(db, "users", user.email);





  let userSnap = await getDoc(userDocRef);











  // Compat: se não existir pelo e-mail, tenta pelo UID (modelo antigo)





  if (!userSnap.exists()) {





    const fallbackRef = doc(db, "users", user.uid);





    const fallbackSnap = await getDoc(fallbackRef);





    if (fallbackSnap.exists()) {





      userDocRef = fallbackRef;





      userSnap = fallbackSnap;





    }





  }











  if (!userSnap.exists()) {





    setText(





      userRoleTextP,





      "Usuário sem perfil cadastrado (coleção 'users'). Fale com a Liga."





    );





    currentUserData = null;





    return null;





  }











  const data = userSnap.data();





  currentUserData = data;











  // Nome no topo





  if (data.nome && userNameSpan) {





    userNameSpan.textContent = data.nome;





  } else if (userNameSpan) {





    userNameSpan.textContent = user.email;





  }











  const papel = data.papel || "SEM_PAPEL";





  let roleName = "Usuário";





  let roleText = "";











  switch (papel) {





    case "LIGA_ADMIN":





      roleName = "Administrador da Liga";





      roleText =





        "Você está logado como Administrador da Liga. Este painel reúne visão geral, documentos e pendências.";





      break;





    case "QUADRILHA_ADMIN":





      roleText =





        "Você está logado como QUADRILHA_ADMIN. Aqui você verá as informações da sua quadrilha.";





      break;





    case "CREDENCIAMENTO":





      roleText =





        "Perfil de credenciamento. Em breve você verá aqui os eventos do dia e o leitor de QR.";





      break;





    case "JURADO":





      roleText =





        "Perfil de jurado. Em breve você verá aqui as etapas e o lançamento de notas.";





      break;





    case "COMUNICACAO_ADMIN":





      roleText =





        "Você está logado como COMUNICACAO_ADMIN. Aqui você cuida das notícias e comunicação digital da Liga.";





      break;





    default:





      roleText =





        "Perfil ainda não configurado. Fale com a Liga para ajustar seu acesso.";





  }











  if (userRoleTextP) {





    userRoleTextP.innerHTML = roleText;





  }











  // Áreas administrativas (quadrilha, docs, financeiro)





  if (quadrilhaAdminArea) {





    quadrilhaAdminArea.style.display = papel === "LIGA_ADMIN" ? "block" : "none";





  }





  if (docAdminArea) {





    docAdminArea.style.display = papel === "LIGA_ADMIN" ? "block" : "none";





  }





  if (finAdminArea) {





    finAdminArea.style.display = papel === "LIGA_ADMIN" ? "block" : "none";





  }











  // Login apenas via Google: não exigir troca de senha.











  return data;





}











// ====== QUADRILHAS ======





async function fetchQuadrilhas(force = false) {





  if (!force && quadrilhasCache) {





    return quadrilhasCache;





  }











  try {





    const snap = await getDocs(collection(db, "quadrilhas"));





    const items = [];











    snap.forEach((docSnap) => {





      items.push({





        id: docSnap.id,





        ...docSnap.data(),





      });





    });











    quadrilhasCache = items.length ? items : SAMPLE_QUADRILHAS.slice();





  } catch (err) {





    console.warn("Falha ao carregar quadrilhas do Firestore, usando fallback local.", err);





    quadrilhasCache = SAMPLE_QUADRILHAS.slice();





  }











  populateQuadrilhaSelects(quadrilhasCache);





  return quadrilhasCache;





}











function renderQuadrilhaCard(q, docStatusLabel) {





  const statusGrupo = q.grupo_atual ? q.grupo_atual : "Sem grupo definido";





  const cidadeUf = [q.cidade, q.uf].filter(Boolean).join(" - ");











  const insta =





    q.instagram && q.instagram.trim() !== ""





      ? `<p class="card-text"><strong>Instagram:</strong> ${q.instagram}</p>`





      : "";











  const documentosLinha = docStatusLabel





    ? `<p class="card-text"><strong>Documentos:</strong> ${docStatusLabel}</p>`





    : `<p class="card-text"><strong>Documentos:</strong> --</p>`;





  const anoFiliacao = `<p class="card-text"><strong>Ano de filiação:</strong> ${





    q.ano_filiacao ? q.ano_filiacao : "—"





  }</p>`;





  const podeEditar = currentUserData?.papel === "LIGA_ADMIN";





  const editBtn = podeEditar





    ? `<button class="btn btn-light btn-sm js-edit-quadrilha" data-id="${q.id}">Editar quadrilha</button>`





    : "";





  const detalhesId = `quadrilha-detalhes-${q.id}`;











  return `





    <div class="card quadrilha-item" data-id="${q.id}">





      <button class="quadrilha-summary" type="button" data-toggle="${detalhesId}">





        <span class="quadrilha-name">${q.nome || q.id}</span>





      </button>





      <div id="${detalhesId}" class="card-body quadrilha-body" hidden>





        <p class="card-text">





          <strong>Sigla:</strong> ${q.sigla || q.id}





        </p>





        <p class="card-text">





          <strong>Localidade:</strong> ${cidadeUf || "?"}





        </p>





        <p class="card-text">





          <strong>Grupo atual:</strong> ${statusGrupo}





        </p>





        ${anoFiliacao}





        ${documentosLinha}





        ${insta}





        ${editBtn}





      </div>





    </div>





  `;





}











function startEditingQuadrilha(q) {





  if (!quadrilhaForm) return;





  const idInput = document.getElementById("qId");





  const originalIdInput = document.getElementById("qOriginalId");





  const nomeInput = document.getElementById("qNome");





  const cidadeInput = document.getElementById("qCidade");





  const ufInput = document.getElementById("qUF");





  const grupoInput = document.getElementById("qGrupo");





  const instagramInput = document.getElementById("qInstagram");





  const anoFiliacaoInput = document.getElementById("qAnoFiliacao");











  if (idInput) {





    idInput.value = (q.sigla || q.id || "").toString();





    idInput.disabled = true;





  }





  if (originalIdInput) originalIdInput.value = q.id || "";





  if (nomeInput) nomeInput.value = q.nome || "";





  if (cidadeInput) cidadeInput.value = q.cidade || "";





  if (ufInput) ufInput.value = q.uf || "";





  if (grupoInput) grupoInput.value = q.grupo_atual || "";





  if (instagramInput) instagramInput.value = q.instagram || "";





  if (anoFiliacaoInput)





    anoFiliacaoInput.value = q.ano_filiacao ? String(q.ano_filiacao) : "";











  if (quadrilhaFormMessage) {





    quadrilhaFormMessage.textContent = "Editando quadrilha selecionada.";





  }





  if (quadrilhaAdminArea) {





    quadrilhaAdminArea.style.display = "block";





  }





  quadrilhaForm.scrollIntoView({ behavior: "smooth", block: "start" });





}











// ====== DOCUMENTOS ======





function mapTipoDocumento(tipo) {





  switch (tipo) {





    case "ESTATUTO":





      return "Estatuto da quadrilha";





    case "ATA_ELEICAO":





      return "Ata de eleição da diretoria";





    default:





      return tipo || "?";





  }





}











function mapStatusDocumento(status) {





  switch (status) {





    case "VALIDO":





      return "Válido";





    case "PENDENTE":





      return "Pendente";





    case "VENCIDO":





      return "Vencido";





    default:





      return status || "?";





  }





}











async function fetchDocumentos() {





  if (documentosCache) return documentosCache;











  try {





    const snap = await getDocs(collection(db, "documentos_quadrilha"));





    const docs = [];





    snap.forEach((docSnap) => {





      docs.push({





        id: docSnap.id,





        ...docSnap.data(),





      });





    });











    documentosCache = docs;





  } catch (err) {





    console.warn("Falha ao carregar documentos do Firestore.", err);





    documentosCache = [];





  }











  return documentosCache;





}











// Monta um mapa: quadrilhaId -> "OK" | "Pendente" | "Sem informação"





function buildDocumentStatusMap(docs) {





  const porQuadrilha = {};











  docs.forEach((d) => {





    const qid = d.quadrilhaId;





    if (!qid) return;











    if (!porQuadrilha[qid]) {





      porQuadrilha[qid] = { estatuto: null, ata: null };





    }











    if (d.tipo === "ESTATUTO") {





      porQuadrilha[qid].estatuto = d;





    }





    if (d.tipo === "ATA_ELEICAO") {





      porQuadrilha[qid].ata = d;





    }





  });











  const statusPorQuadrilha = {};











  Object.keys(porQuadrilha).forEach((qid) => {





    const { estatuto, ata } = porQuadrilha[qid];











    let label;





    if (!estatuto && !ata) {





      label = "Sem informação";





    } else if (!estatuto || !ata) {





      label = "Pendente";





    } else if (





      estatuto.status === "VALIDO" &&





      ata.status === "VALIDO"





    ) {





      label = "OK";





    } else {





      label = "Pendente";





    }











    statusPorQuadrilha[qid] = label;





  });











  return statusPorQuadrilha;





}











function updateDashboardWidgets() {





  // Quadrilhas





  const quadrilhas = quadrilhasCache || [];





  if (statQuadrilhasTotal) setText(statQuadrilhasTotal, quadrilhas.length.toString());





  if (statQuadrilhasEspecial) {





    const countEsp = quadrilhas.filter((q) =>





      (q.grupo_atual || "").toUpperCase().includes("ESPECIAL")





    ).length;





    setText(statQuadrilhasEspecial, countEsp.toString());





  }





  if (statQuadrilhasAcesso) {





    const countAcesso = quadrilhas.filter((q) =>





      (q.grupo_atual || "").toUpperCase().includes("ACESSO")





    ).length;





    setText(statQuadrilhasAcesso, countAcesso.toString());





  }











  // Documentos





  const docs = documentosCache || [];





  const statusMap = buildDocumentStatusMap(docs);





  let ok = 0;





  let pend = 0;





  Object.values(statusMap).forEach((st) => {





    if (st === "OK") ok += 1;





    else pend += 1;





  });





  if (statDocsOk) setText(statDocsOk, ok.toString());





  if (statDocsPend) setText(statDocsPend, pend.toString());











  // Financeiro





  const fin = financeiroCache || [];





  const debitoQuadrilhas = new Set();





  fin.forEach((l) => {





    if (!l?.quadrilhaId) return;





    const statusCalc = getFinanceiroStatus(l);





    if (statusCalc !== "PAGO") {





      debitoQuadrilhas.add(String(l.quadrilhaId));





    }





  });





  if (statFinanceiroDebito) {





    setText(statFinanceiroDebito, debitoQuadrilhas.size.toString());





  }





}











// ====== FINANCEIRO ======





function getFinanceiroStatus(lancamento) {





  const dataPagamento = parseDateValue(lancamento?.dataPagamento);





  if (dataPagamento) return "PAGO";











  const dataVencimento = parseDateValue(lancamento?.dataVencimento);





  if (!dataVencimento) return "A_PAGAR";











  const hoje = new Date();





  const hojeSemHora = new Date(





    hoje.getFullYear(),





    hoje.getMonth(),





    hoje.getDate()





  );





  const vencSemHora = new Date(





    dataVencimento.getFullYear(),





    dataVencimento.getMonth(),





    dataVencimento.getDate()





  );











  if (vencSemHora < hojeSemHora) return "VENCIDO";





  return "A_PAGAR";





}











function mapTipoLancamento(tipo) {





  switch (tipo) {





    case "JOIA":





      return "Joia de filiação";





    case "ANUIDADE":





      return "Anuidade";





    case "REPASSE":





      return "Repasse da Liga";





    default:





      return tipo || "?";





  }





}











function mapStatusLancamento(status) {





  switch (status) {





    case "A_PAGAR":





      return "A pagar";





    case "PAGO":





      return "Pago";





    case "VENCIDO":





      return "Vencido";





    case "ABERTO":





      return "A pagar";





    default:





      return status || "?";





  }





}











function normalizeFinanceiroCompare(value) {





  if (!value) return "";





  return value





    .toString()





    .normalize("NFD")





    .replace(/[̀-ͯ]/g, "")





    .toLowerCase()





    .replace(/[^a-z0-9]+/g, " ")





    .trim();





}











function formatQuadrilhaList(items, limit = 8) {





  if (!items || !items.length) return "";





  const names = items.map((q) => q.nome || q.id || "?");





  if (names.length <= limit) return names.join(", ");





  return `${names.slice(0, limit).join(", ")} e mais ${





    names.length - limit





  }`;





}











function updateFinanceiroStatusSelect() {





  if (!finStatusSelect) return;





  const statusCalc = getFinanceiroStatus({





    dataVencimento: finDataVencimentoInput?.value || null,





    dataPagamento: finDataPagamentoInput?.value || null,





  });





  finStatusSelect.value = statusCalc;





}











// ====== PESSOAS / ASSEMBLEIAS ======





let assembleiasCache = null;





let presencasCache = null;











function formatDateShort(dateStr) {





  if (!dateStr) return "-";





  const d = new Date(dateStr);





  if (Number.isNaN(d.getTime())) return dateStr;





  return d.toLocaleDateString("pt-BR");





}











function getAssembleiaAno(assembleia) {





  const fromField = Number(assembleia?.ano);





  if (Number.isFinite(fromField)) return fromField;





  const parsed = parseDateValue(assembleia?.data);





  return parsed ? parsed.getFullYear() : null;





}

















async function fetchAssembleias() {





  if (assembleiasCache) return assembleiasCache;





  try {





    const q = query(collection(db, "assembleias"), orderBy("data", "desc"));





    const snap = await getDocs(q);





    const items = [];





    snap.forEach((docSnap) => {





      items.push({ id: docSnap.id, ...docSnap.data() });





    });





    assembleiasCache = items;





  } catch (err) {





    console.error("Erro ao carregar assembleias:", err);





    assembleiasCache = [];





  }





  return assembleiasCache;





}











async function fetchPresencas(assembleiaIds) {





  if (presencasCache) return presencasCache;





  if (!assembleiaIds.length) {





    presencasCache = [];





    return presencasCache;





  }





  try {





    const results = [];





    const chunks = [];





    for (let i = 0; i < assembleiaIds.length; i += 10) {





      chunks.push(assembleiaIds.slice(i, i + 10));





    }





    for (const chunk of chunks) {





      const q = query(





        collection(db, "assembleias_presencas"),





        where("assembleiaId", "in", chunk)





      );





      const snap = await getDocs(q);





      snap.forEach((docSnap) => {





        results.push({ id: docSnap.id, ...docSnap.data() });





      });





    }





    presencasCache = results;





  } catch (err) {





    console.error("Erro ao carregar presenças:", err);





    presencasCache = [];





  }





  return presencasCache;





}











async function fetchPresencasByAssembleia(assembleiaId) {





  if (!assembleiaId) return [];





  try {





    const q = query(





      collection(db, "assembleias_presencas"),





      where("assembleiaId", "==", assembleiaId)





    );





    const snap = await getDocs(q);





    const items = [];





    snap.forEach((docSnap) => {





      items.push({ id: docSnap.id, ...docSnap.data() });





    });





    return items;





  } catch (err) {





    console.error("Erro ao carregar presenças da assembleia:", err);





    return [];





  }





}











function populateQuadrilhaSelect(selectEl, quadrilhas) {





  if (!selectEl) return;





  selectEl.innerHTML = '<option value="">Selecione...</option>';





  quadrilhas.forEach((q) => {





    const opt = document.createElement("option");





    opt.value = q.id;





    opt.textContent = q.nome || q.id;





    selectEl.appendChild(opt);





  });





}

















function renderAssembleiasTable(assembleias) {





  if (!assembleiasTableBody) return;





  if (!assembleias.length) {





    assembleiasTableBody.innerHTML =





      '<tr><td colspan="4">Nenhuma assembleia cadastrada.</td></tr>';





    return;





  }





  assembleiasTableBody.innerHTML = assembleias





    .map((a) => {





      const ata = a.ataUrl





        ? `<a href="${a.ataUrl}" target="_blank" rel="noopener">Link</a>`





        : "-";





      return `





        <tr>





          <td>${formatDateShort(a.data)}</td>





          <td>${a.titulo || "-"}</td>





          <td>${ata}</td>





          <td>





            <button class="btn btn-sm btn-light js-assembleia-edit" data-id="${a.id}">Editar</button>





            <button class="btn btn-sm btn-outline js-assembleia-delete" data-id="${a.id}">Excluir</button>





          </td>





        </tr>





      `;





    })





    .join("");





}











function renderAssembleiaQuadrilhasList(quadrilhas) {





  if (!assembleiaQuadrilhasList) return;





  if (!quadrilhas.length) {





    assembleiaQuadrilhasList.innerHTML =





      '<p class="muted">Nenhuma quadrilha encontrada.</p>';





    return;





  }





  const ordenadas = [...quadrilhas].sort((a, b) =>





    (a.nome || a.id || "").localeCompare(b.nome || b.id || "")





  );





  assembleiaQuadrilhasList.innerHTML = ordenadas





    .map(





      (q) => `





        <label class="pessoas-presenca-item">





          <input type="checkbox" value="${q.id}" />





          <span>${q.nome || q.id}</span>





        </label>





      `





    )





    .join("");





}











function getPesoVotacao(anoFiliacao) {





  const currentYear = new Date().getFullYear();





  if (!anoFiliacao || !Number.isFinite(anoFiliacao)) return 1;





  if (anoFiliacao > currentYear) return 1;





  const anos = currentYear - anoFiliacao + 1;





  if (anos <= 5) return 1;





  if (anos <= 10) return 1.5;





  return 2;





}











function renderVotacoesList(quadrilhas) {





  if (!votacoesQuadrilhasList) return;





  if (!quadrilhas.length) {





    votacoesQuadrilhasList.innerHTML =





      '<p class="muted">Nenhuma quadrilha encontrada.</p>';





    return;





  }





  const ordenadas = [...quadrilhas].sort((a, b) =>





    (a.nome || a.id || "").localeCompare(b.nome || b.id || "")





  );





  votacoesQuadrilhasList.innerHTML = ordenadas





    .map((q) => {





      const peso = getPesoVotacao(Number(q.ano_filiacao));





      const weightLabel = `Peso ${peso.toString().replace(".", ",")}`;





      return `





        <div class="votacao-item" data-quadrilha="${q.id}" data-weight="${peso}">





          <div class="votacao-item-header">





            <span>${q.nome || q.id}</span>





            <div class="votacao-item-meta">





              <span class="votacao-weight">${weightLabel}</span>





              <button class="votacao-clear" type="button" data-clear="${q.id}">





                Limpar





              </button>





            </div>





          </div>





          <div class="votacao-actions">





            <label class="is-manter">





              <input type="radio" name="voto_${q.id}" value="manter" />





              Opção 1





            </label>





            <label class="is-alterar">





              <input type="radio" name="voto_${q.id}" value="alterar" />





              Opção 2





            </label>





            <label class="is-abstencao">





              <input type="radio" name="voto_${q.id}" value="abstencao" />





              Abstenção





            </label>





          </div>





        </div>





      `;





    })





    .join("");





}











function updateVotacoesTotals() {





  if (!votacoesQuadrilhasList) return;





  let totalManter = 0;





  let totalAlterar = 0;





  let totalAbstencao = 0;





  const items = votacoesQuadrilhasList.querySelectorAll(".votacao-item");





  items.forEach((item) => {





    const weight = Number(item.dataset.weight) || 1;





    const selected = item.querySelector("input[type='radio']:checked");





    if (!selected) return;





    if (selected.value === "manter") totalManter += weight;





    if (selected.value === "alterar") totalAlterar += weight;





    if (selected.value === "abstencao") totalAbstencao += weight;





  });





  if (votacoesTotalManter) {





    votacoesTotalManter.textContent = totalManter.toLocaleString("pt-BR", {





      minimumFractionDigits: 0,





      maximumFractionDigits: 1,





    });





  }





  if (votacoesTotalAlterar) {





    votacoesTotalAlterar.textContent = totalAlterar.toLocaleString("pt-BR", {





      minimumFractionDigits: 0,





      maximumFractionDigits: 1,





    });





  }





  if (votacoesTotalAbstencao) {





    votacoesTotalAbstencao.textContent = totalAbstencao.toLocaleString("pt-BR", {





      minimumFractionDigits: 0,





      maximumFractionDigits: 1,





    });





  }





}











function buildFaltasResumo(quadrilhas, assembleias, presencas) {





  const assembleiaOrder = [...assembleias].sort((a, b) =>





    String(a.data || "").localeCompare(String(b.data || ""))





  );





  const presencaMap = new Map();





  presencas.forEach((p) => {





    const key = `${p.assembleiaId}_${p.quadrilhaId}`;





    presencaMap.set(key, p);





  });











  const resumo = quadrilhas.map((q) => {





    let alternadas = 0;





    let maxSeguidas = 0;





    let atualSeguidas = 0;











    assembleiaOrder.forEach((a) => {





      const key = `${a.id}_${q.id}`;





      const record = presencaMap.get(key);





      const presente =





        record?.presente === true ||





        (Array.isArray(record?.presentes) && record.presentes.length > 0);





      if (presente) {





        atualSeguidas = 0;





      } else {





        alternadas += 1;





        atualSeguidas += 1;





        if (atualSeguidas > maxSeguidas) maxSeguidas = atualSeguidas;





      }





    });











    const emRisco = maxSeguidas >= 3 || alternadas >= 5;





    const status = emRisco





      ? maxSeguidas >= 3





        ? "Critico"





        : "Alerta"





      : alternadas > 0





      ? "Acompanhamento"





      : "Regular";





    return {





      quadrilhaId: q.id,





      nome: q.nome || q.id,





      alternadas,





      maxSeguidas,





      emRisco,





      status,





    };





  });











  return { resumo, assembleiaOrder };





}











function renderFaltasDashboard(resumo, assembleiasCount) {





  if (pessoasKpiAssembleias) {





    pessoasKpiAssembleias.textContent = assembleiasCount.toString();





  }





  const comFalta = resumo.filter((r) => r.alternadas > 0);





  if (pessoasKpiComFalta) {





    pessoasKpiComFalta.textContent = comFalta.length.toString();





  }





  const emRisco = resumo.filter((r) => r.emRisco);





  if (pessoasKpiEmRisco) {





    pessoasKpiEmRisco.textContent = emRisco.length.toString();





  }





  if (!faltasTableBody) return;





  if (!resumo.length) {





    faltasTableBody.innerHTML = '<tr><td colspan="4">Sem dados.</td></tr>';





    return;





  }





  faltasTableBody.innerHTML = resumo





    .sort((a, b) => {





      if (b.emRisco !== a.emRisco) return b.emRisco - a.emRisco;





      if (b.alternadas !== a.alternadas) return b.alternadas - a.alternadas;





      return (a.nome || "").localeCompare(b.nome || "");





    })





    .map((r) => {





      let badgeClass = "status-ok";





      if (r.emRisco) badgeClass = r.maxSeguidas >= 3 ? "status-critico" : "status-alerta";





      else if (r.alternadas > 0) badgeClass = "status-alerta";





      return `





        <tr>





          <td>${r.nome}</td>





          <td>${r.alternadas}</td>





          <td>${r.maxSeguidas}</td>





          <td><span class="status-pill ${badgeClass}">${r.status}</span></td>





        </tr>





      `;





    })





    .join("");





}











async function loadPessoasForCurrentUser() {





  if (!pessoasAdminArea) return;





  const papel = currentUserData?.papel || "SEM_PAPEL";





  const podeVer = papel === "LIGA_ADMIN";











  pessoasAdminArea.style.display = podeVer ? "block" : "none";





  if (pessoasNoAccess) pessoasNoAccess.style.display = podeVer ? "none" : "block";











  if (!podeVer) return;











  const [quadrilhas, assembleias] = await Promise.all([





    fetchQuadrilhas(),





    fetchAssembleias(),





  ]);











  renderAssembleiaQuadrilhasList(quadrilhas);











  renderVotacoesList(quadrilhas);





  updateVotacoesTotals();











  if (assembleiasTableBody) renderAssembleiasTable(assembleias);





  const assembleiaIds = assembleias.map((a) => a.id);





  const presencas = await fetchPresencas(assembleiaIds);





  const { resumo } = buildFaltasResumo(quadrilhas, assembleias, presencas);





  renderFaltasDashboard(resumo, assembleias.length);











  if (faltasDashboardBody) {





    faltasDashboardBody.classList.add("is-collapsed");





  }





}











function toChartKey(value, fallback = "Sem informação") {





  if (!value && value !== 0) return fallback;





  return String(value).trim() || fallback;





}











function normalizeQuadrilhaKey(value) {





  if (!value && value !== 0) return "";





  return String(value)





    .normalize("NFD")





    .replace(/[̀-ͯ]/g, "")





    .toLowerCase()





    .replace(/[^a-z0-9]+/g, "-")





    .replace(/^-+|-+$/g, "");





}











function getQuadrilhaNomeById(id, mapaQuadrilhas) {





  if (!id) return "";





  const key = normalizeQuadrilhaKey(id);





  return (





    mapaQuadrilhas[id] ||





    mapaQuadrilhas[key] ||





    mapaQuadrilhas[key.replace(/\s+/g, "-")] ||





    id





  );





}











function buildFinanceiroChartData(lancamentos, labelGetter) {





  const map = new Map();





  lancamentos.forEach((l) => {





    const label = toChartKey(labelGetter(l));





    const status = getFinanceiroStatus(l);





    const valor = Number(l.valor) || 0;





    if (!map.has(label)) {





      map.set(label, { label, pago: 0, vencido: 0, aPagar: 0, total: 0 });





    }





    const item = map.get(label);





    if (status === "PAGO") item.pago += valor;





    else if (status === "VENCIDO") item.vencido += valor;





    else item.aPagar += valor;





    item.total += valor;





  });





  return Array.from(map.values()).sort((a, b) => b.total - a.total);





}











function updateFinanceiroKpis(lancamentos) {





  if (!finKpiTotal && !finKpiPago && !finKpiAPagar && !finKpiVencido) return;





  let total = 0;





  let pago = 0;





  let vencido = 0;





  let aPagar = 0;





  lancamentos.forEach((l) => {





    const val = Number(l.valor) || 0;





    total += val;





    const status = getFinanceiroStatus(l);





    if (status === "PAGO") pago += val;





    else if (status === "VENCIDO") vencido += val;





    else aPagar += val;





  });





  if (finKpiTotal) setText(finKpiTotal, formatCurrencyBR(total));





  if (finKpiPago) setText(finKpiPago, formatCurrencyBR(pago));





  if (finKpiAPagar) setText(finKpiAPagar, formatCurrencyBR(aPagar));





  if (finKpiVencido) setText(finKpiVencido, formatCurrencyBR(vencido));





  if (finKpiInadimplencia) {





    const base = total;





    const perc = base ? Math.round((vencido / base) * 100) : 0;





    setText(finKpiInadimplencia, `${perc}%`);





  }





}











function renderFinanceiroChart(container, title, data) {





  if (!container) return;





  if (!data.length) {





    container.innerHTML =





      '<div class="fin-chart-empty">Sem dados para exibir.</div>';





    return;





  }











  const max = Math.max(...data.map((d) => d.total), 1);





  const rows = data





    .map((d) => {





      const pagoPct = (d.pago / max) * 100;





      const vencidoPct = (d.vencido / max) * 100;





      const aPagarPct = (d.aPagar / max) * 100;





      const totalLabel = formatCurrencyBR(d.total);





      return `





        <div class="fin-chart-row">





          <div class="fin-chart-row-label">${d.label}</div>





          <div class="fin-bar" role="img" aria-label="${d.label}: ${totalLabel}">





            <span class="fin-seg fin-seg-pago" style="width:${pagoPct}%" aria-hidden="true"></span>





            <span class="fin-seg fin-seg-vencido" style="width:${vencidoPct}%" aria-hidden="true"></span>





            <span class="fin-seg fin-seg-apagar" style="width:${aPagarPct}%" aria-hidden="true"></span>





          </div>





          <div class="fin-chart-row-value">${totalLabel}</div>





        </div>





      `;





    })





    .join("");











  container.innerHTML = `





    <div class="fin-chart-title">${title}</div>





    <div class="fin-chart-rows">${rows}</div>





  `;





}











function renderFinanceiroCharts(lancamentos, mapaQuadrilhas) {





  if (!finChartQuadrilha && !finChartAno && !finChartTipo) return;











  const byQuadrilha = buildFinanceiroChartData(lancamentos, (l) => {





    return getQuadrilhaNomeById(l.quadrilhaId, mapaQuadrilhas);





  });





  const byQuadrilhaTop = byQuadrilha.slice(0, 10);





  if (byQuadrilha.length > 10) {





    const resto = byQuadrilha.slice(10).reduce(





      (acc, item) => {





        acc.pago += item.pago;





        acc.vencido += item.vencido;





        acc.aPagar += item.aPagar;





        acc.total += item.total;





        return acc;





      },





      { label: "Outras", pago: 0, vencido: 0, aPagar: 0, total: 0 }





    );





    byQuadrilhaTop.push(resto);





  }





  const byAno = buildFinanceiroChartData(lancamentos, (l) => l.ano);





  const byTipo = buildFinanceiroChartData(lancamentos, (l) =>





    mapTipoLancamento(l.tipo)





  );











  renderFinanceiroChart(finChartQuadrilha, "Por quadrilha", byQuadrilhaTop);





  renderFinanceiroChart(finChartAno, "Por ano", byAno);





  renderFinanceiroChart(finChartTipo, "Por tipo de pagamento", byTipo);





}











function applyFinanceiroFilters(lancamentos, mapaQuadrilhas) {





  const filtroQuadrilha = finFiltroQuadrilha?.value || "";





  const filtroAno = finFiltroAno?.value || "";





  const filtroStatus = finFiltroStatus?.value || "";





  const filtroTipo = finFiltroTipo?.value || "";





  const filtroInicio = finFiltroVencInicio?.value || "";





  const filtroFim = finFiltroVencFim?.value || "";





  const busca = (finFiltroBusca?.value || "").trim().toLowerCase();











  const inicioDate = filtroInicio ? parseDateValue(filtroInicio) : null;





  const fimDate = filtroFim ? parseDateValue(filtroFim) : null;











  let visiveis = lancamentos.filter((l) => {





    const okQuadrilha =





      !filtroQuadrilha || l.quadrilhaId === filtroQuadrilha;





    const okAno = !filtroAno || (l.ano && String(l.ano) === String(filtroAno));





    const okStatus =





      !filtroStatus || getFinanceiroStatus(l) === filtroStatus;





    const okTipo = !filtroTipo || l.tipo === filtroTipo;











    let okVenc = true;





    if (inicioDate || fimDate) {





      const venc = parseDateValue(l.dataVencimento);





      if (!venc) okVenc = false;





      if (inicioDate && venc && venc < inicioDate) okVenc = false;





      if (fimDate && venc && venc > fimDate) okVenc = false;





    }











    let okBusca = true;





    if (busca) {





      const nomeQuadrilha = getQuadrilhaNomeById(





        l.quadrilhaId,





        mapaQuadrilhas





      );





      const hay = `${nomeQuadrilha} ${l.descricao || ""} ${l.tipo || ""}`.toLowerCase();





      okBusca = hay.includes(busca);





    }











    return okQuadrilha && okAno && okStatus && okTipo && okVenc && okBusca;





  });











  const ordenar = finOrdenacao?.value || "valor_desc";





  const getValor = (item) => Number(item.valor) || 0;





  const getNomeQuadrilha = (item) =>





    getQuadrilhaNomeById(item.quadrilhaId, mapaQuadrilhas);





  const getVenc = (item) => parseDateValue(item.dataVencimento)?.getTime() || 0;











  visiveis.sort((a, b) => {





    switch (ordenar) {





      case "valor_asc":





        return getValor(a) - getValor(b);





      case "venc_asc":





        return getVenc(a) - getVenc(b);





      case "venc_desc":





        return getVenc(b) - getVenc(a);





      case "quadrilha_asc":





        return getNomeQuadrilha(a).localeCompare(getNomeQuadrilha(b));





      case "valor_desc":





      default:





        return getValor(b) - getValor(a);





    }





  });











  return visiveis;





}











function getMaxAno(lancamentos) {





  const anos = lancamentos





    .map((l) => (l.ano ? Number(l.ano) : null))





    .filter((v) => Number.isFinite(v));





  if (!anos.length) return null;





  return Math.max(...anos).toString();





}











function getSortedAnos(lancamentos) {





  const anosSet = new Set();





  lancamentos.forEach((l) => {





    if (l.ano) anosSet.add(String(l.ano));





  });





  return Array.from(anosSet).sort();





}











function ensureAnoSelecionado(lancamentos) {





  if (!finFiltroAno) return;





  const anos = getSortedAnos(lancamentos);





  if (!anos.length) return;





  if (!finFiltroAno.value) {





    finFiltroAno.value = anos[anos.length - 1];





  }





  updateYearChipsState();





}











function populateAnoOptions(lancamentos) {





  if (!finFiltroAno) return;





  const anos = getSortedAnos(lancamentos);





  const previousAno = finFiltroAno.value;





  finFiltroAno.innerHTML = '<option value="">Todos</option>';





  anos.forEach((ano) => {





    const opt = document.createElement("option");





    opt.value = ano;





    opt.textContent = ano;





    finFiltroAno.appendChild(opt);





  });





  if (previousAno && anos.includes(String(previousAno))) {





    finFiltroAno.value = String(previousAno);





  }





  renderYearChips(anos);





}











function renderYearChips(anos) {





  if (!finYearChips) return;





  finYearChips.innerHTML = anos





    .map(





      (ano) =>





        `<button class="fin-year-chip" type="button" data-year="${ano}">${ano}</button>`





    )





    .join("");





  updateYearChipsState();





}











function updateYearChipsState() {





  if (!finYearChips || !finFiltroAno) return;





  const selected = finFiltroAno.value;





  finYearChips.querySelectorAll(".fin-year-chip").forEach((btn) => {





    btn.classList.toggle("is-active", btn.dataset.year === selected);





  });





}











async function fetchLancamentosFinanceiros() {





  if (financeiroCache) return financeiroCache;











  const snap = await getDocs(collection(db, "financeiro_quadrilha"));





  const itens = [];





  snap.forEach((docSnap) => {





    itens.push({





      id: docSnap.id,





      ...docSnap.data(),





    });





  });











  financeiroCache = itens;





  return itens;





}











function renderFinanceiroRow(l, mapaQuadrilhas, canEdit = false) {





  const nomeQuadrilha =





    getQuadrilhaNomeById(l.quadrilhaId, mapaQuadrilhas) || "?";











  const tipoLabel = mapTipoLancamento(l.tipo);





  const statusLabel = mapStatusLancamento(getFinanceiroStatus(l));





  const ano = l.ano || "?";





  const descricao = l.descricao || "?";





  const valor =





    l.valor !== undefined && l.valor !== null





      ? formatCurrencyBR(l.valor)





      : "--";





  const dataVenc = formatDateForDisplay(l.dataVencimento);





  const dataPag = formatDateForDisplay(l.dataPagamento);





  const actions = canEdit





    ? `<button class="btn btn-sm btn-light js-fin-edit" data-id="${l.id}">Editar</button>`





    : "-";











  return `





    <tr>





      <td>${nomeQuadrilha}</td>





      <td>${ano}</td>





      <td>${tipoLabel}</td>





      <td>${descricao}</td>





      <td>${valor}</td>





      <td>${statusLabel}</td>





      <td>${dataVenc}</td>





      <td>${dataPag}</td>





      <td>${actions}</td>





    </tr>





  `;





}











async function loadFinanceiroForCurrentUser() {





  if (!finTableBody) return;











  finTableBody.innerHTML =





    '<tr><td colspan="9">Carregando lançamentos...</td></tr>';











  try {





    const papel = currentUserData?.papel || "SEM_PAPEL";





    const quadrilhaIdUser = currentUserData?.quadrilhaId || null;





    const canEdit = papel === "LIGA_ADMIN";











    const [lancamentos, quadrilhas] = await Promise.all([





      fetchLancamentosFinanceiros(),





      fetchQuadrilhas(),





    ]);











    const mapaQuadrilhas = {};





    quadrilhas.forEach((q) => {





      const nome = q.nome || q.id;





      mapaQuadrilhas[q.id] = nome;





      mapaQuadrilhas[normalizeQuadrilhaKey(q.nome || q.id)] = nome;





      mapaQuadrilhas[normalizeQuadrilhaKey(q.id)] = nome;





      if (q.sigla) {





        mapaQuadrilhas[normalizeQuadrilhaKey(q.sigla)] = nome;





      }





    });











    const previousTipoFilter = finFiltroTipo?.value || "";





    const tiposSet = new Set();





    lancamentos.forEach((l) => {





      if (l.tipo) tiposSet.add(l.tipo);





    });





    if (finFiltroTipo) {





      const tiposOrdenados = Array.from(tiposSet).sort((a, b) => {





        const labelA = mapTipoLancamento(a) || a || "";





        const labelB = mapTipoLancamento(b) || b || "";





        return labelA.localeCompare(labelB);





      });





      finFiltroTipo.innerHTML = '<option value="">Todos</option>';





      tiposOrdenados.forEach((tipo) => {





        const opt = document.createElement("option");





        opt.value = tipo;





        opt.textContent = mapTipoLancamento(tipo);





        finFiltroTipo.appendChild(opt);





      });





      finFiltroTipo.value = previousTipoFilter;





    }





    const filtroTipo = finFiltroTipo?.value || "";











    let visiveis = [];











    if (papel === "QUADRILHA_ADMIN" && quadrilhaIdUser) {





      // quadrilha vê só seus lançamentos





      if (finFiltersCard) finFiltersCard.style.display = "none";





      if (finSubtitle)





        finSubtitle.textContent = "Financeiro da sua quadrilha.";











      populateAnoOptions(lancamentos);





      ensureAnoSelecionado(lancamentos);











      visiveis = applyFinanceiroFilters(





        lancamentos.filter((l) => l.quadrilhaId === quadrilhaIdUser),





        mapaQuadrilhas





      );





    } else if (papel === "LIGA_ADMIN") {





      // Liga vê todos, com filtros





      if (finFiltersCard) finFiltersCard.style.display = "block";





      if (finSubtitle)





        finSubtitle.textContent = "Financeiro das quadrilhas.";











      populateAnoOptions(lancamentos);





      ensureAnoSelecionado(lancamentos);





      visiveis = applyFinanceiroFilters(lancamentos, mapaQuadrilhas);





    } else {





      if (finFiltersCard) finFiltersCard.style.display = "none";





      if (finSubtitle)





        finSubtitle.textContent =





          "Financeiro (perfil sem acesso detalhado).";





      populateAnoOptions(lancamentos);





      ensureAnoSelecionado(lancamentos);





      visiveis = [];





    }











    if (visiveis.length) {





      const getNomeQuadrilha = (item) =>





        (item.quadrilhaId && mapaQuadrilhas[item.quadrilhaId]) ||





        item.quadrilhaId ||





        "";





      visiveis.sort((a, b) => {





        const nomeA = getNomeQuadrilha(a).toLowerCase();





        const nomeB = getNomeQuadrilha(b).toLowerCase();





        if (nomeA < nomeB) return -1;





        if (nomeA > nomeB) return 1;





        return 0;





      });





    }











    if (!visiveis.length) {





      finTableBody.innerHTML =





        '<tr><td colspan="9">Nenhum lançamento encontrado.</td></tr>';





      renderFinanceiroCharts([], mapaQuadrilhas);





      updateFinanceiroKpis([]);





      return;





    }











    finTableBody.innerHTML = visiveis





      .map((l) => renderFinanceiroRow(l, mapaQuadrilhas, canEdit))





      .join("");





    renderFinanceiroCharts(visiveis, mapaQuadrilhas);





    updateFinanceiroKpis(visiveis);





    updateDashboardWidgets();





  } catch (error) {





    console.error("Erro ao carregar financeiro:", error);





    finTableBody.innerHTML =





      '<tr><td colspan="9">Erro ao carregar financeiro.</td></tr>';





  }





}











function resetFinanceiroFormState(clearMessage = true) {





  if (!finForm) return;





  finForm.reset();





  editingFinanceiroId = null;





  if (finFormCancelBtn) finFormCancelBtn.style.display = "none";





  if (finFormSubmitBtn)





    finFormSubmitBtn.textContent = finFormSubmitBtnDefaultLabel;





  if (clearMessage && finFormMessage) setText(finFormMessage, "");





  updateFinanceiroStatusSelect();





}











function startEditingLancamento(lancamento) {





  if (!finForm || !lancamento) return;





  editingFinanceiroId = lancamento.id || null;





  if (finQuadrilhaSelect)





    finQuadrilhaSelect.value = lancamento.quadrilhaId || "";





  if (finTipoSelect) finTipoSelect.value = lancamento.tipo || "";





  if (finAnoInput) finAnoInput.value = lancamento.ano || "";





  if (finDescricaoInput) finDescricaoInput.value = lancamento.descricao || "";





  if (finValorInput)





    finValorInput.value =





      lancamento.valor !== undefined && lancamento.valor !== null





        ? String(lancamento.valor)





        : "";





  if (finStatusSelect) {





    finStatusSelect.value = getFinanceiroStatus(lancamento);





  }





  if (finDataVencimentoInput)





    finDataVencimentoInput.value = formatDateForInput(





      lancamento.dataVencimento





    );





  if (finDataPagamentoInput)





    finDataPagamentoInput.value = formatDateForInput(





      lancamento.dataPagamento





    );





  if (finObsTextarea) finObsTextarea.value = lancamento.observacoes || "";





  if (finFormCancelBtn) finFormCancelBtn.style.display = "inline-block";





  if (finFormMessage) setText(finFormMessage, "Editando lançamento.");





  if (finFormSubmitBtn) finFormSubmitBtn.textContent = "Salvar alterações";





  updateFinanceiroStatusSelect();





}











if (finFormCancelBtn) {





  finFormCancelBtn.addEventListener("click", () => {





    resetFinanceiroFormState();





  });





}











if (finDataVencimentoInput) {





  finDataVencimentoInput.addEventListener("change", updateFinanceiroStatusSelect);





}





if (finDataPagamentoInput) {





  finDataPagamentoInput.addEventListener("change", updateFinanceiroStatusSelect);





}





if (assembleiaForm) {





  assembleiaForm.addEventListener("submit", async (event) => {





    event.preventDefault();





    if (currentUserData?.papel !== "LIGA_ADMIN") {





      setText(assembleiaFormMessage, "Sem permissão.");





      return;





    }





    const titulo = (assembleiaTituloInput?.value || "").trim();





    const data = assembleiaDataInput?.value || "";





    if (!titulo || !data) {





      setText(assembleiaFormMessage, "Preencha título e data.");





      return;





    }





    const presentesQuadrilhas = Array.from(





      assembleiaQuadrilhasList?.querySelectorAll("input[type='checkbox']") || []





    )





      .filter((el) => el.checked)





      .map((el) => el.value);











    const parsedData = parseDateValue(data);





    const ano = parsedData ? parsedData.getFullYear() : null;





    const payload = {





      titulo,





      data,





      ano: ano || null,





      ataUrl: (assembleiaAtaInput?.value || "").trim() || null,





      createdAt: serverTimestamp(),





    };





    try {





      const assembleiaId = editingAssembleiaId;





      const assembleiaRef = assembleiaId





        ? doc(db, "assembleias", assembleiaId)





        : await addDoc(collection(db, "assembleias"), payload);





      const assembleiaDocId =





        assembleiaId || (assembleiaRef && assembleiaRef.id);





      if (assembleiaId) {





        await setDoc(doc(db, "assembleias", assembleiaId), payload);





      }





      if (assembleiaDocId) {





        const existingPresencas = await fetchPresencasByAssembleia(





          assembleiaDocId





        );





        const presentesSet = new Set(presentesQuadrilhas);





        const ops = [];











        existingPresencas.forEach((p) => {





          if (p?.quadrilhaId && !presentesSet.has(p.quadrilhaId)) {





            ops.push(deleteDoc(doc(db, "assembleias_presencas", p.id)));





          }





        });











        presentesQuadrilhas.forEach((quadrilhaId) => {





          ops.push(





            setDoc(





              doc(





                db,





                "assembleias_presencas",





                `${assembleiaDocId}_${quadrilhaId}`





              ),





              {





                assembleiaId: assembleiaDocId,





                quadrilhaId,





                presente: true,





                updatedAt: serverTimestamp(),





              },





              { merge: true }





            )





          );





        });











        if (ops.length) {





          await Promise.all(ops);





        }





      }





      setText(assembleiaFormMessage, "Assembleia cadastrada.");





      assembleiaForm.reset();





      editingAssembleiaId = null;





      assembleiasCache = null;





      presencasCache = null;





      await loadPessoasForCurrentUser();





    } catch (err) {





      console.error("Erro ao cadastrar assembleia:", err);





      setText(assembleiaFormMessage, "Erro ao cadastrar assembleia.");





    }





  });





}











if (votacoesQuadrilhasList) {





  votacoesQuadrilhasList.addEventListener("change", (event) => {





    if (!event.target.closest("input[type='radio']")) return;





    updateVotacoesTotals();





  });





  votacoesQuadrilhasList.addEventListener("click", (event) => {





    const clearBtn = event.target.closest(".votacao-clear");





    if (!clearBtn) return;





    const quadrilhaId = clearBtn.dataset.clear;





    if (!quadrilhaId) return;





    const radios = votacoesQuadrilhasList.querySelectorAll(





      `input[name="voto_${quadrilhaId}"]`





    );





    radios.forEach((radio) => {





      radio.checked = false;





    });





    updateVotacoesTotals();





  });





}











if (quadrilhaContent) {





  quadrilhaContent.addEventListener("click", (event) => {





    const btn = event.target.closest(".js-edit-quadrilha");





    if (!btn || currentUserData?.papel !== "LIGA_ADMIN") return;





    const id = btn.dataset.id;





    if (!id) return;





    const q = (quadrilhasCache || []).find((item) => item.id === id);





    if (!q) return;





    startEditingQuadrilha(q);





  });





  quadrilhaContent.addEventListener("click", (event) => {





    const toggle = event.target.closest(".quadrilha-summary");





    if (!toggle) return;





    event.preventDefault();





    const targetId = toggle.dataset.toggle;





    if (!targetId) return;





    const target = quadrilhaContent.querySelector(`#${CSS.escape(targetId)}`);





    if (!target) return;











    const isOpen = !target.hasAttribute("hidden");





    const items = quadrilhaContent.querySelectorAll(".quadrilha-item");





    items.forEach((item) => {





      item.classList.remove("is-open");





      const body = item.querySelector(".quadrilha-body");





      if (body) body.setAttribute("hidden", "");





    });





    if (!isOpen) {





      const parent = target.closest(".quadrilha-item");





      if (parent) parent.classList.add("is-open");





      target.removeAttribute("hidden");





    }





  });





}











if (votacoesClearAll) {





  votacoesClearAll.addEventListener("click", () => {





    if (!votacoesQuadrilhasList) return;





    const radios = votacoesQuadrilhasList.querySelectorAll(





      "input[type='radio']"





    );





    radios.forEach((radio) => {





      radio.checked = false;





    });





    updateVotacoesTotals();





  });





}











if (faltasToggleBtn && faltasDashboardBody) {





  faltasToggleBtn.addEventListener("click", () => {





    const isHidden = faltasDashboardBody.classList.toggle("is-collapsed");





    faltasToggleBtn.textContent = isHidden ? "Mostrar" : "Ocultar";





  });





}











if (assembleiasToggleBtn && assembleiasBody) {





  assembleiasToggleBtn.addEventListener("click", () => {





    const isHidden = assembleiasBody.classList.toggle("is-collapsed");





    assembleiasToggleBtn.textContent = isHidden ? "Mostrar" : "Ocultar";





  });





}











if (votacoesToggleBtn && votacoesBody) {





  votacoesToggleBtn.addEventListener("click", () => {





    const isHidden = votacoesBody.classList.toggle("is-collapsed");





    votacoesToggleBtn.textContent = isHidden ? "Mostrar" : "Ocultar";





  });





}











if (assembleiasTableBody) {





  assembleiasTableBody.addEventListener("click", async (event) => {





    const editBtn = event.target.closest(".js-assembleia-edit");





    if (editBtn) {





      if (currentUserData?.papel !== "LIGA_ADMIN") return;





      const id = editBtn.dataset.id;





      if (!id) return;





      const assembleia = (assembleiasCache || []).find((a) => a.id === id);





      if (!assembleia) return;





      if (assembleiaTituloInput) assembleiaTituloInput.value = assembleia.titulo || "";





      if (assembleiaDataInput)





        assembleiaDataInput.value = formatDateForInput(assembleia.data);





      if (assembleiaAtaInput) assembleiaAtaInput.value = assembleia.ataUrl || "";





      if (assembleiaQuadrilhasList) {





        const checks = assembleiaQuadrilhasList.querySelectorAll(





          "input[type='checkbox']"





        );





        checks.forEach((checkbox) => {





          checkbox.checked = false;





        });





        const presencas = await fetchPresencasByAssembleia(id);





        const presentesSet = new Set(





          presencas





            .filter((p) => p.presente === true)





            .map((p) => p.quadrilhaId)





        );





        checks.forEach((checkbox) => {





          if (presentesSet.has(checkbox.value)) checkbox.checked = true;





        });





      }





      editingAssembleiaId = id;





      if (assembleiaFormMessage) {





        assembleiaFormMessage.textContent = "Editando assembleia selecionada.";





      }





      assembleiaForm.scrollIntoView({ behavior: "smooth", block: "start" });





      return;





    }





    const btn = event.target.closest(".js-assembleia-delete");





    if (!btn || currentUserData?.papel !== "LIGA_ADMIN") return;





    const id = btn.dataset.id;





    if (!id) return;





    const confirma = window.confirm("Excluir assembleia?");





    if (!confirma) return;





    try {





      const presencas = await fetchPresencasByAssembleia(id);





      if (presencas.length) {





        await Promise.all(





          presencas.map((p) => deleteDoc(doc(db, "assembleias_presencas", p.id)))





        );





      }





      await deleteDoc(doc(db, "assembleias", id));





      assembleiasCache = null;





      presencasCache = null;





      await loadPessoasForCurrentUser();





    } catch (err) {





      console.error("Erro ao excluir assembleia:", err);





    }





  });





}

















if (finTableBody) {





  finTableBody.addEventListener("click", (event) => {





    const editBtn = event.target.closest(".js-fin-edit");





    if (!editBtn) return;





    if (currentUserData?.papel !== "LIGA_ADMIN") return;





    const id = editBtn.dataset?.id;





    if (!id) return;





    const lancamento = (financeiroCache || []).find((item) => item.id === id);





    if (!lancamento) return;





    startEditingLancamento(lancamento);





  });





}

















// ====== DOCUMENTOS: RENDER E CARREGAMENTO ======





function renderDocumentoRow(d, mapaQuadrilhas, canEdit) {





  const nomeQuadrilha =





    getQuadrilhaNomeById(d.quadrilhaId, mapaQuadrilhas) || "?";





  const tipoLabel = mapTipoDocumento(d.tipo);





  const statusLabel = mapStatusDocumento(d.status);





  const dataValidade = d.dataValidade || "?";





  const obs = d.observacoes || "";





  const actions = canEdit





    ? `





      <button class="btn btn-sm btn-light js-doc-edit" data-id="${d.id}">Editar</button>





      <button class="btn btn-sm btn-outline js-doc-delete" data-id="${d.id}">Excluir</button>





    `





    : "-";











  return `





    <tr>





      <td>${nomeQuadrilha}</td>





      <td>${tipoLabel}</td>





      <td>${statusLabel}</td>





      <td>${dataValidade}</td>





      <td>${obs}</td>





      <td>${actions}</td>





    </tr>





  `;





}











function resetDocForm() {





  if (!docForm) return;





  docForm.reset();





  if (docIdInput) docIdInput.value = "";





  if (docFormMessage) docFormMessage.textContent = "";





  if (docFormCancelBtn) docFormCancelBtn.style.display = "none";





  if (docQuadrilhaSelect) docQuadrilhaSelect.disabled = false;





  if (docTipoSelect) docTipoSelect.disabled = false;





}











function startEditingDocumento(docItem) {





  if (!docForm || !docItem) return;





  if (docIdInput) docIdInput.value = docItem.id || "";





  if (docQuadrilhaSelect) docQuadrilhaSelect.value = docItem.quadrilhaId || "";





  if (docTipoSelect) docTipoSelect.value = docItem.tipo || "";





  if (docDataEmissaoInput) docDataEmissaoInput.value = docItem.dataEmissao || "";





  if (docDataValidadeInput) docDataValidadeInput.value = docItem.dataValidade || "";





  if (docStatusSelect) docStatusSelect.value = docItem.status || "PENDENTE";





  if (docObsTextarea) docObsTextarea.value = docItem.observacoes || "";











  if (docQuadrilhaSelect) docQuadrilhaSelect.disabled = true;





  if (docTipoSelect) docTipoSelect.disabled = true;





  if (docFormCancelBtn) docFormCancelBtn.style.display = "inline-block";





  if (docFormMessage) docFormMessage.textContent = "Editando documento.";





}











if (docFormCancelBtn) {





  docFormCancelBtn.addEventListener("click", () => {





    resetDocForm();





  });





}











async function loadDocumentosForCurrentUser() {





  if (!docTableBody) return;











  docTableBody.innerHTML =





    '<tr><td colspan="6">Carregando documentos...</td></tr>';











  try {





    const papel = currentUserData?.papel || "SEM_PAPEL";





    const quadrilhaIdUser = currentUserData?.quadrilhaId || null;











    const [docs, quadrilhas] = await Promise.all([





      fetchDocumentos(),





      fetchQuadrilhas(),





    ]);











    const mapaQuadrilhas = {};





    quadrilhas.forEach((q) => {





      mapaQuadrilhas[q.id] = q.nome || q.id;





    });











    let visiveis = [];











    const canEdit = papel === "LIGA_ADMIN";











    if (papel === "QUADRILHA_ADMIN" && quadrilhaIdUser) {





      // Quadrilha vê só os próprios docs





      visiveis = docs.filter((d) => d.quadrilhaId === quadrilhaIdUser);





      if (docFiltersCard) docFiltersCard.style.display = "none";





      if (docSubtitle)





        docSubtitle.textContent = "Documentos da sua quadrilha.";





    } else if (papel === "LIGA_ADMIN") {





      // Liga pode filtrar





      if (docFiltersCard) docFiltersCard.style.display = "block";





      if (docSubtitle)





        docSubtitle.textContent = "Documentos das quadrilhas.";











      const filtroQuadrilha = docFiltroQuadrilha?.value || "";





      const filtroStatus = docFiltroStatus?.value || "";





      const filtroTipo = docFiltroTipo?.value || "";











      visiveis = docs.filter((d) => {





        const okQuadrilha =





          !filtroQuadrilha || d.quadrilhaId === filtroQuadrilha;





        const okStatus = !filtroStatus || d.status === filtroStatus;





        const okTipo = !filtroTipo || d.tipo === filtroTipo;





        return okQuadrilha && okStatus && okTipo;





      });





    } else {





      // Outros perfis: por enquanto não veem nada





      if (docFiltersCard) docFiltersCard.style.display = "none";





      if (docSubtitle)





        docSubtitle.textContent =





          "Documentos (perfil sem acesso detalhado).";





      visiveis = [];





    }











    if (!visiveis.length) {





      docTableBody.innerHTML =





        '<tr><td colspan="6">Nenhum documento encontrado.</td></tr>';





      updateDashboardWidgets();





      return;





    }











    docTableBody.innerHTML = visiveis





      .map((d) => renderDocumentoRow(d, mapaQuadrilhas, canEdit))





      .join("");





    updateDashboardWidgets();





  } catch (error) {





    console.error("Erro ao carregar documentos:", error);





    docTableBody.innerHTML =





      '<tr><td colspan="6">Erro ao carregar documentos.</td></tr>';





  }





}











if (docTableBody) {





  docTableBody.addEventListener("click", async (event) => {





    const editBtn = event.target.closest(".js-doc-edit");





    const deleteBtn = event.target.closest(".js-doc-delete");











    if (!editBtn && !deleteBtn) return;











    const papel = currentUserData?.papel || "SEM_PAPEL";





    if (papel !== "LIGA_ADMIN") return;











    const id = (editBtn || deleteBtn)?.dataset?.id;





    if (!id) return;











    const docItem = (documentosCache || []).find((d) => d.id === id);





    if (!docItem) return;











    if (editBtn) {





      startEditingDocumento(docItem);





      return;





    }











    if (deleteBtn) {





      const confirma = window.confirm(





        "Tem certeza que deseja excluir este documento?"





      );





      if (!confirma) return;











      try {





        await deleteDoc(doc(db, "documentos_quadrilha", id));





        documentosCache = null;





        resetDocForm();





        await loadDocumentosForCurrentUser();





        await loadQuadrilhasForCurrentUser();





      } catch (err) {





        console.error("Erro ao excluir documento:", err);





        if (docFormMessage) {





          docFormMessage.textContent = "Erro ao excluir documento.";





        }





      }





    }





  });





}











// ====== QUADRILHAS: CARREGAMENTO DA SEÇÃO ======





async function loadQuadrilhasForCurrentUser() {





  if (!quadrilhaContent || !quadrilhaSubtitle) return;











  quadrilhaContent.innerHTML = "<p>Carregando quadrilhas...</p>";

















  try {





    const papel = currentUserData?.papel || "SEM_PAPEL";





    const quadrilhaIdUser = currentUserData?.quadrilhaId || null;











    const [quadrilhas, docs] = await Promise.all([





      fetchQuadrilhas(),





      fetchDocumentos(),





    ]);











    const docStatusMap = buildDocumentStatusMap(docs);











    if (papel === "QUADRILHA_ADMIN" && quadrilhaIdUser) {





      const q = quadrilhas.find((qq) => qq.id === quadrilhaIdUser);





      quadrilhaSubtitle.textContent = "Informações da sua quadrilha.";











      if (!q) {





        quadrilhaContent.innerHTML =





          "<p>Não encontramos sua quadrilha cadastrada. Fale com a Liga.</p>";





      } else {





        const statusDoc = docStatusMap[quadrilhaIdUser] || "Sem informação";





        quadrilhaContent.innerHTML = renderQuadrilhaCard(q, statusDoc);











        if (statusCardText) {





          statusCardText.textContent =





            "Situação documental da sua quadrilha: " + statusDoc + ".";





        }





      }





    } else {





      // visão da Liga: lista todas as quadrilhas





      quadrilhaSubtitle.textContent =





        "Lista de quadrilhas cadastradas na Liga.";











      if (!quadrilhas.length) {





        quadrilhaContent.innerHTML =





          "<p>Nenhuma quadrilha cadastrada ainda.</p>";





        return;





      }

















      // resumo para o card "Status geral"





      if (statusCardText && papel === "LIGA_ADMIN") {





        const total = quadrilhas.length;





        let ok = 0;





        let pendenteOuSemInfo = 0;











        quadrilhas.forEach((q) => {





          const label = docStatusMap[q.id] || "Sem informação";





          if (label === "OK") ok++;





          else pendenteOuSemInfo++;





        });











        statusCardText.textContent =





          `Quadrilhas com documentos em dia: ${ok} de ${total}. ` +





          `Pendentes ou sem informação: ${pendenteOuSemInfo}.`;





      }











      const ordenadas = [...quadrilhas].sort((a, b) =>





        (a.nome || a.id || "").localeCompare(b.nome || b.id || "")





      );





      quadrilhaContent.innerHTML = ordenadas





        .map((q) => {





          const statusDoc = docStatusMap[q.id] || "Sem informação";





          return renderQuadrilhaCard(q, statusDoc);





        })





        .join("");





    }





  } catch (error) {





    console.error("Erro ao carregar quadrilhas:", error);





    quadrilhaContent.innerHTML =





      "<p>Erro ao carregar quadrilhas. Tente novamente mais tarde.</p>";





  }





}











// ====== POPULAR SELECTS DE QUADRILHA ======





function populateQuadrilhaSelects(quadrilhas) {





  const ordenadas = [...quadrilhas].sort((a, b) =>





    (a.nome || a.id).localeCompare(b.nome || b.id)





  );











  // Select do formulário de usuário





  if (userQuadrilhaSelect) {





    userQuadrilhaSelect.innerHTML = '<option value="">Selecione...</option>';





    ordenadas.forEach((q) => {





      const opt = document.createElement("option");





      opt.value = q.id;





      opt.textContent = `${q.nome || q.id} (${q.id})`;





      userQuadrilhaSelect.appendChild(opt);





    });





  }











  // Select do formulário de documentos





  if (docQuadrilhaSelect) {





    docQuadrilhaSelect.innerHTML = '<option value="">Selecione...</option>';





    ordenadas.forEach((q) => {





      const opt = document.createElement("option");





      opt.value = q.id;





      opt.textContent = `${q.nome || q.id} (${q.id})`;





      docQuadrilhaSelect.appendChild(opt);





    });





  }











  // Filtro de documentos





  if (docFiltroQuadrilha) {





    docFiltroQuadrilha.innerHTML = '<option value="">Todas</option>';





    ordenadas.forEach((q) => {





      const opt = document.createElement("option");





      opt.value = q.id;





      opt.textContent = q.nome || q.id;





      docFiltroQuadrilha.appendChild(opt);





    });





  }











  // Select do formulário financeiro





  if (finQuadrilhaSelect) {





    finQuadrilhaSelect.innerHTML = '<option value="">Selecione...</option>';





    ordenadas.forEach((q) => {





      const opt = document.createElement("option");





      opt.value = q.id;





      opt.textContent = `${q.nome || q.id} (${q.id})`;





      finQuadrilhaSelect.appendChild(opt);





    });





  }











  // Filtro financeiro





  if (finFiltroQuadrilha) {





    finFiltroQuadrilha.innerHTML = '<option value="">Todas</option>';





    ordenadas.forEach((q) => {





      const opt = document.createElement("option");





      opt.value = q.id;





      opt.textContent = q.nome || q.id;





      finFiltroQuadrilha.appendChild(opt);





    });





  }





}











// ====== FORMULÁRIO: CADASTRAR / EDITAR QUADRILHA ======





if (quadrilhaForm) {





  quadrilhaForm.addEventListener("submit", async (event) => {





    event.preventDefault();











    if (!currentUserData || currentUserData.papel !== "LIGA_ADMIN") {





      setText(





        quadrilhaFormMessage,





        "Você não tem permissão para cadastrar quadrilhas."





      );





      return;





    }











    const idInput = document.getElementById("qId");





    const originalIdInput = document.getElementById("qOriginalId");





    const nomeInput = document.getElementById("qNome");





    const cidadeInput = document.getElementById("qCidade");





    const ufInput = document.getElementById("qUF");





    const grupoInput = document.getElementById("qGrupo");





    const instagramInput = document.getElementById("qInstagram");





    const anoFiliacaoInput = document.getElementById("qAnoFiliacao");











    const originalId = (originalIdInput?.value || "").trim();





    const id = originalId || idInput.value.trim().toUpperCase();





    const nome = nomeInput.value.trim();





    const cidade = cidadeInput.value.trim();





    const uf = ufInput.value.trim().toUpperCase();





    const grupo = grupoInput.value;





    const instagram = instagramInput.value.trim();





    const anoFiliacaoRaw = (anoFiliacaoInput?.value || "").trim();





    const anoFiliacao = anoFiliacaoRaw ? Number(anoFiliacaoRaw) : null;











    if (!id || !nome) {





      setText(





        quadrilhaFormMessage,





        "Preencha pelo menos ID/Sigla e Nome da quadrilha."





      );





      return;





    }











    setText(quadrilhaFormMessage, "Salvando quadrilha...");











    try {





      await setDoc(doc(db, "quadrilhas", id), {





        nome,





        sigla: id,





        cidade: cidade || null,





        uf: uf || null,





        grupo_atual: grupo || null,





        instagram: instagram || null,





        ano_filiacao: Number.isFinite(anoFiliacao) ? anoFiliacao : null,





        entidade: "LINQ-DFE",





        ativa: true,





      });











      setText(quadrilhaFormMessage, "Quadrilha salva com sucesso.");





      quadrilhaForm.reset();





      if (idInput) idInput.disabled = false;





      if (originalIdInput) originalIdInput.value = "";











      // Recarrega lista





      quadrilhasCache = null;





      await loadQuadrilhasForCurrentUser();





      if (assembleiaQuadrilhasList || votacoesQuadrilhasList) {





        const quadrilhasAtualizadas = await fetchQuadrilhas(true);





        if (assembleiaQuadrilhasList) {





          renderAssembleiaQuadrilhasList(quadrilhasAtualizadas);





        }





        if (votacoesQuadrilhasList) {





          renderVotacoesList(quadrilhasAtualizadas);





          updateVotacoesTotals();





        }





      }





      if (pessoasAdminArea) {





        await loadPessoasForCurrentUser();





      }





    } catch (err) {





      console.error("Erro ao salvar quadrilha:", err);





      setText(





        quadrilhaFormMessage,





        "Erro ao salvar quadrilha. Tente novamente."





      );





    }





  });





}











// ====== FUN?.ES: PAPEL E QUADRILHA ======





function papelPrecisaQuadrilha(papel) {





  // agora só administrador de quadrilha precisa de quadrilha definida





  return papel === "QUADRILHA_ADMIN";





}











function atualizarVisibilidadeQuadrilhaPorPapel() {





  if (!userPapelSelect) return;





  const papel = userPapelSelect.value;





  const precisa = papelPrecisaQuadrilha(papel);











  if (userQuadrilhaGroup) {





    userQuadrilhaGroup.style.display = precisa ? "block" : "none";





  }











  if (userQuadrilhaSelect) {





    if (precisa) {





      userQuadrilhaSelect.setAttribute("required", "required");





    } else {





      userQuadrilhaSelect.removeAttribute("required");





      userQuadrilhaSelect.value = "";





    }





  }





}











// ====== FORMULÁRIO: VINCULAR USUÁRIO ? QUADRILHA ======





if (userForm) {





  userForm.addEventListener("submit", async (event) => {





    event.preventDefault();











    if (!currentUserData || currentUserData.papel !== "LIGA_ADMIN") {





      setText(





        userFormMessage,





        "Você não tem permissão para gerenciar usuários."





      );





      return;





    }











    const emailInput = document.getElementById("userEmail");





    const nomeInput = document.getElementById("userNome");





    const papelSelect = document.getElementById("userPapel");





    const quadrilhaSelect = document.getElementById("userQuadrilhaId");











    const email = emailInput.value.trim().toLowerCase();





    const nome = nomeInput.value.trim();





    const papel = papelSelect.value;





    const quadrilhaId = quadrilhaSelect.value;











    if (!email || !papel) {





      setText(userFormMessage, "Preencha pelo menos e-mail e papel.");





      return;





    }











    // se o papel precisar de quadrilha, ela passa a ser obrigatória





    if (papelPrecisaQuadrilha(papel) && !quadrilhaId) {





      setText(





        userFormMessage,





        "Selecione a quadrilha para esse papel."





      );





      return;





    }











    setText(userFormMessage, "Salvando usuário...");











      try {





        await setDoc(





          doc(db, "users", email),





          {





            email,





            nome: nome || null,





            papel,





            quadrilhaId: papelPrecisaQuadrilha(papel) ? quadrilhaId : null,





            mustChangePassword: false,





          },





          { merge: true }





        );





        setText(





          userFormMessage,





          "Usuário salvo no Firestore. Agora ele pode entrar com Google (o e-mail precisa estar autorizado)."





        );





        userForm.reset();





        atualizarVisibilidadeQuadrilhaPorPapel();





      } catch (err) {





      if (err?.code === "functions/already-exists") {





        try {





          await setDoc(





            doc(db, "users", email),





            {





              email,





              nome: nome || null,





              papel,





              quadrilhaId: papelPrecisaQuadrilha(papel) ? quadrilhaId : null,





            },





            { merge: true }





          );





            setText(





              userFormMessage,





              "Usuário já existe. Dados atualizados."





            );





          userForm.reset();





          atualizarVisibilidadeQuadrilhaPorPapel();





          return;





        } catch (innerErr) {





          console.error("Erro ao atualizar usuário existente:", innerErr);





        }





      }





      console.error("Erro ao salvar usuário:", err);





      const code = err?.code || "";





      const msg =





        code === "functions/not-found"





          ? "Função não encontrada. É necessário publicar as functions."





          : code === "functions/permission-denied"





          ? "Sem permissão para criar usuários."





          : code === "functions/unauthenticated"





          ? "Sessão expirada. Faça login novamente."





          : "Erro ao salvar usuário. Tente novamente.";





      setText(userFormMessage, msg);





    }





  });





}











// ====== FORMULÁRIO: CADASTRAR / ATUALIZAR DOCUMENTO ======





if (docForm) {





  docForm.addEventListener("submit", async (event) => {





    event.preventDefault();











    if (!currentUserData || currentUserData.papel !== "LIGA_ADMIN") {





      setText(





        docFormMessage,





        "Você não tem permissão para cadastrar documentos."





      );





      return;





    }











    const quadrilhaId = docQuadrilhaSelect.value;





    const tipo = docTipoSelect.value;





    const dataEmissao = docDataEmissaoInput.value || null;





    const dataValidade = docDataValidadeInput.value || null;





    const status = docStatusSelect.value || "PENDENTE";





    const observacoes = (docObsTextarea?.value || "").trim() || null;





    const existingId = docIdInput?.value || "";











    if (!quadrilhaId || !tipo) {





      setText(





        docFormMessage,





        "Selecione a quadrilha e o tipo de documento."





      );





      return;





    }











    setText(docFormMessage, "Salvando documento...");











    try {





      const newDocId = `${quadrilhaId}_${tipo}`;











      if (existingId && existingId !== newDocId) {





        await deleteDoc(doc(db, "documentos_quadrilha", existingId));





      }











      await setDoc(





        doc(db, "documentos_quadrilha", newDocId),





        {





          quadrilhaId,





          tipo,





          status,





          dataEmissao,





          dataValidade,





          observacoes,





        },





        { merge: true }





      );











      setText(docFormMessage, "Documento salvo com sucesso.");





      resetDocForm();





      documentosCache = null;





      await loadDocumentosForCurrentUser();





      await loadQuadrilhasForCurrentUser(); // atualiza status dos cards





    } catch (err) {





      console.error("Erro ao salvar documento:", err);





      setText(





        docFormMessage,





        "Erro ao salvar documento. Tente novamente."





      );





    }





  });





}











// ====== FORMULÁRIO: NOVO LANÇAMENTO FINANCEIRO ======





if (finForm) {





  finForm.addEventListener("submit", async (event) => {





    event.preventDefault();











    if (!currentUserData || currentUserData.papel !== "LIGA_ADMIN") {





      setText(





        finFormMessage,





        "Você não tem permissão para lançar financeiro."





      );





      return;





    }











    const quadrilhaId = finQuadrilhaSelect.value;





    const tipo = finTipoSelect.value;





    const ano = finAnoInput.value;





    const descricao = finDescricaoInput.value.trim();





    const valor = finValorInput.value;





    const dataVencimento = finDataVencimentoInput.value || null;





    const dataPagamento = finDataPagamentoInput.value || null;





    const status = getFinanceiroStatus({ dataVencimento, dataPagamento });





    const observacoes = finObsTextarea.value.trim() || null;











    if (!quadrilhaId || !tipo || !ano || !descricao || !valor) {





      setText(





        finFormMessage,





        "Preencha quadrilha, tipo, ano, descrição e valor."





      );





      return;





    }











    const isEditing = Boolean(editingFinanceiroId);





    setText(





      finFormMessage,





      isEditing ? "Atualizando lançamento..." : "Salvando lançamento..."





    );











    try {





      const payload = {





        quadrilhaId,





        tipo,





        ano,





        descricao,





        valor: Number(valor),





        status,





        dataVencimento,





        dataPagamento,





        observacoes,





      };





      if (isEditing && editingFinanceiroId) {





        await setDoc(





          doc(db, "financeiro_quadrilha", editingFinanceiroId),





          payload,





          { merge: true }





        );





      } else {





        await addDoc(collection(db, "financeiro_quadrilha"), payload);





      }











      setText(





        finFormMessage,





        isEditing





          ? "Lançamento atualizado com sucesso."





          : "Lançamento salvo com sucesso."





      );





      resetFinanceiroFormState(false);





      financeiroCache = null;





      await loadFinanceiroForCurrentUser();





    } catch (err) {





      console.error("Erro ao salvar lançamento financeiro:", err);





      setText(





        finFormMessage,





        "Erro ao salvar lançamento. Tente novamente."





      );





    }





  });





}











// ====== LISTENERS DE FILTRO ======





if (userPapelSelect) {





  userPapelSelect.addEventListener("change", atualizarVisibilidadeQuadrilhaPorPapel);





  atualizarVisibilidadeQuadrilhaPorPapel();





}











if (docFiltroQuadrilha) {





  docFiltroQuadrilha.addEventListener("change", () => {





    loadDocumentosForCurrentUser();





  });





}





if (docFiltroStatus) {





  docFiltroStatus.addEventListener("change", () => {





    loadDocumentosForCurrentUser();





  });





}





if (finFiltroQuadrilha) {





  finFiltroQuadrilha.addEventListener("change", () => {





    loadFinanceiroForCurrentUser();





  });





}





if (finFiltroAno) {





  finFiltroAno.addEventListener("change", () => {





    loadFinanceiroForCurrentUser();





  });





}





if (finFiltroTipo) {





  finFiltroTipo.addEventListener("change", () => {





    loadFinanceiroForCurrentUser();





  });





}





if (finFiltroStatus) {





  finFiltroStatus.addEventListener("change", () => {





    loadFinanceiroForCurrentUser();





  });





}





if (finYearChips) {





  finYearChips.addEventListener("click", (event) => {





    const btn = event.target.closest(".fin-year-chip");





    if (!btn || !finFiltroAno) return;





    finFiltroAno.value = btn.dataset.year || "";





    updateYearChipsState();





    loadFinanceiroForCurrentUser();





  });





}





if (finClearFilters) {





  finClearFilters.addEventListener("click", () => {





    if (finFiltroBusca) finFiltroBusca.value = "";





    if (finFiltroQuadrilha) finFiltroQuadrilha.value = "";





    if (finFiltroTipo) finFiltroTipo.value = "";





    if (finFiltroStatus) finFiltroStatus.value = "";





    if (finFiltroVencInicio) finFiltroVencInicio.value = "";





    if (finFiltroVencFim) finFiltroVencFim.value = "";





    if (finOrdenacao) finOrdenacao.value = "valor_desc";





    loadFinanceiroForCurrentUser();





  });





}





if (finFiltroVencInicio) {





  finFiltroVencInicio.addEventListener("change", () => {





    loadFinanceiroForCurrentUser();





  });





}





if (finFiltroVencFim) {





  finFiltroVencFim.addEventListener("change", () => {





    loadFinanceiroForCurrentUser();





  });





}





if (finFiltroBusca) {





  let finBuscaTimeout = null;





  finFiltroBusca.addEventListener("input", () => {





    if (finBuscaTimeout) window.clearTimeout(finBuscaTimeout);





    finBuscaTimeout = window.setTimeout(() => {





      loadFinanceiroForCurrentUser();





    }, 200);





  });





}





if (finOrdenacao) {





  finOrdenacao.addEventListener("change", () => {





    loadFinanceiroForCurrentUser();





  });





}





if (docFiltroTipo) {





  docFiltroTipo.addEventListener("change", () => {





    loadDocumentosForCurrentUser();





  });





}











if (finFiltroQuadrilha) {





  finFiltroQuadrilha.addEventListener("change", () => {





    loadFinanceiroForCurrentUser();





  });





}





if (finFiltroAno) {





  finFiltroAno.addEventListener("change", () => {





    loadFinanceiroForCurrentUser();





  });





}





if (finFiltroStatus) {





  finFiltroStatus.addEventListener("change", () => {





    loadFinanceiroForCurrentUser();





  });





}





if (finFiltroTipo) {





  finFiltroTipo.addEventListener("change", () => {





    loadFinanceiroForCurrentUser();





  });





}











// ====== NOTÍCIAS: CRUD ======











// Busca todas as notícias e guarda em cache





async function fetchNoticias() {





  if (noticiasCache) return noticiasCache;











  const snap = await getDocs(collection(db, "noticias"));





  const items = [];





  snap.forEach((docSnap) => {





    items.push({





      id: docSnap.id,





      ...docSnap.data(),





    });





  });











  // ordena por dataAtualizacao ou dataCriacao (mais recente primeiro)





  items.sort((a, b) => {





    const da = a.dataAtualizacao || a.dataCriacao || 0;





    const db = b.dataAtualizacao || b.dataCriacao || 0;





    const ta = da?.toMillis ? da.toMillis() : new Date(da).getTime();





    const tb = db?.toMillis ? db.toMillis() : new Date(db).getTime();





    return tb - ta;





  });











  noticiasCache = items;





  return items;





}











function renderNewsItem(n) {





  const titulo = fixMojibake(n.titulo || "(sem título)");





  const resumo = fixMojibake(n.resumo || "");





  const status = n.status || "rascunho";





  const destaque = !!n.destaqueHome;





  const dataRef = n.dataAtualizacao || n.dataCriacao;





  const dataLabel = formatTimestampToPtBR(dataRef);





  const tags = Array.isArray(n.tags) ? n.tags : [];











  return `





    <div class="news-item" data-id="${n.id}">





      <div class="news-item-main">





        <div class="news-item-title">${titulo}</div>





        <div class="news-item-meta">





          <span class="status-pill status-${status}">





            ${status === "publicada" ? "Publicada" : "Rascunho"}





          </span>





          ${destaque ? '<span class="status-pill status-destaque">Destaque na home</span>' : ""}





          <span>Atualizada em: ${dataLabel}</span>





          ${





            tags.length





              ? `<span>Tags: ${tags.join(", ")}</span>`





              : ""





          }





        </div>





        ${





          resumo





            ? `<div class="news-item-meta" style="margin-top:4px;">${resumo}</div>`





            : ""





        }





      </div>





      <div class="news-item-actions">





        <button class="btn btn-sm btn-light js-edit-news" data-id="${n.id}">Editar</button>





        <button class="btn btn-sm btn-outline js-delete-news" data-id="${n.id}">Apagar</button>





      </div>





    </div>





  `;





}











function resetNewsForm() {





  if (!newsForm) return;





  newsForm.reset();





  if (newsIdInput) newsIdInput.value = "";





  if (newsFormTitle) newsFormTitle.textContent = "Nova notícia";





  if (newsFormMessage) newsFormMessage.textContent = "";





  if (newsFormCancelBtn) newsFormCancelBtn.style.display = "none";





}











function startEditingNews(newsId) {





  if (!noticiasCache || !newsForm) return;











  const n = noticiasCache.find((item) => item.id === newsId);





  if (!n) return;











  if (newsIdInput) newsIdInput.value = n.id;





  if (newsTituloInput) newsTituloInput.value = fixMojibake(n.titulo || "");





  if (newsResumoInput) newsResumoInput.value = fixMojibake(n.resumo || "");





  if (newsImagemInput) newsImagemInput.value = n.imagemCapaUrl || "";





  if (newsTagsInput) newsTagsInput.value = Array.isArray(n.tags) ? n.tags.join(", ") : "";





  if (newsStatusSelect)





    newsStatusSelect.value = (n.status || "publicada").toString().toLowerCase();





  if (newsConteudoTextarea) newsConteudoTextarea.value = fixMojibake(n.conteudoBruto || n.conteudo || "");





  if (newsDestaqueHomeCheckbox) newsDestaqueHomeCheckbox.checked = !!n.destaqueHome;











  if (newsFormTitle) newsFormTitle.textContent = "Editar notícia";





  if (newsFormCancelBtn) newsFormCancelBtn.style.display = "inline-block";





  if (newsFormMessage) newsFormMessage.textContent = "";





}











async function loadNoticiasForCurrentUser() {





  if (!newsList) return;











  newsList.innerHTML = "<p>Carregando notícias...</p>";











  try {





    const papel = currentUserData?.papel || "SEM_PAPEL";





    const podeEditar =





      papel === "LIGA_ADMIN" || papel === "COMUNICACAO_ADMIN";











    if (newsAdminCard) {





      newsAdminCard.style.display = podeEditar ? "block" : "none";





    }











    if (newsSubtitle) {





      newsSubtitle.textContent = podeEditar





        ? "Cadastre e edite as notícias que vão aparecer no site da Liga."





        : "Aqui você visualiza as notícias publicadas no site da Liga.";





    }











    const noticias = await fetchNoticias();











    if (!noticias.length) {





      newsList.innerHTML = "<p>Nenhuma notícia cadastrada ainda.</p>";





      return;





    }











    newsList.innerHTML = noticias.map(renderNewsItem).join("");











    // se não pode editar, remove área de ações





    if (!podeEditar) {





      const actions = newsList.querySelectorAll(".news-item-actions");





      actions.forEach((a) => a.remove());





    }





  } catch (err) {





    console.error("Erro ao carregar notícias:", err);





    newsList.innerHTML = "<p>Erro ao carregar notícias.</p>";





  }





}











// Submit do formulário de notícias





if (newsForm) {





  newsForm.addEventListener("submit", async (event) => {





    event.preventDefault();











    const papel = currentUserData?.papel || "SEM_PAPEL";





    const podeEditar =





      papel === "LIGA_ADMIN" || papel === "COMUNICACAO_ADMIN";











    if (!podeEditar) {





      setText(





        newsFormMessage,





        "Você não tem permissão para cadastrar/editar notícias."





      );





      return;





    }











    const id = newsIdInput?.value || "";





    const titulo = fixMojibake((newsTituloInput?.value || "").trim());





    const resumo = fixMojibake((newsResumoInput?.value || "").trim());





    const imagemCapaUrl = (newsImagemInput?.value || "").trim();





    const tagsRaw = (newsTagsInput?.value || "").trim();





    const status = (newsStatusSelect?.value || "publicada").toLowerCase();





    const conteudoRaw = fixMojibake((newsConteudoTextarea?.value || "").trim());





    const destaqueHome = newsDestaqueHomeCheckbox?.checked || false;











    if (!titulo || !conteudoRaw) {





      setText(





        newsFormMessage,





        "Preencha pelo menos o título e o conteúdo."





      );





      return;





    }











    const conteudoHtml = portalTextToHtml(conteudoRaw);











    const tags = tagsRaw





      ? tagsRaw





          .split(",")





          .map((t) => fixMojibake(t.trim()))





          .filter(Boolean)





      : [];











    const autorNome = currentUserData?.nome || null;





    const autorEmail =





      currentUserData?.email || auth.currentUser?.email || null;











    setText(newsFormMessage, "Salvando notícia...");











    try {





      const baseData = {





        titulo,





        resumo: resumo || null,





        imagemCapaUrl: imagemCapaUrl || null,





        tags,





        status,





        conteudo: conteudoHtml,





        conteudoBruto: conteudoRaw,





        destaqueHome,





        autorNome,





        autorEmail,





        dataAtualizacao: serverTimestamp(),





      };











      if (!id) {





        const payload = {





          ...baseData,





          dataCriacao: serverTimestamp(),





        };





        if (status === "publicada") {





          payload.dataPublicacao = serverTimestamp();





        }





        await addDoc(collection(db, "noticias"), payload);





      } else {





        const docRef = doc(db, "noticias", id);





        const snapshot = await getDoc(docRef);





        const existing = snapshot.exists() ? snapshot.data() : {};





        const payload = { ...baseData };





        if (status === "publicada" && !existing?.dataPublicacao) {





          payload.dataPublicacao = serverTimestamp();





        }





        await setDoc(docRef, payload, { merge: true });





      }











      setText(newsFormMessage, "Notícia salva com sucesso.");





      resetNewsForm();





      noticiasCache = null;





      await loadNoticiasForCurrentUser();





    } catch (err) {





      console.error("Erro ao salvar notícia:", err);





      setText(





        newsFormMessage,





        "Erro ao salvar notícia. Tente novamente."





      );





    }





  });





}











// Cancelar edição de notícia





if (newsFormCancelBtn) {





  newsFormCancelBtn.addEventListener("click", () => {





    resetNewsForm();





  });





}











// Clique nos botões de editar/apagar notícia (delegação)





if (newsList) {





  newsList.addEventListener("click", async (event) => {





    const papel = currentUserData?.papel || "SEM_PAPEL";





    const podeEditar =





      papel === "LIGA_ADMIN" || papel === "COMUNICACAO_ADMIN";











    const editBtn = event.target.closest(".js-edit-news");





    const deleteBtn = event.target.closest(".js-delete-news");











    if (editBtn) {





      if (!podeEditar) return;





      const id = editBtn.dataset.id;





      if (id) {





        startEditingNews(id);





      }





      return;





    }











    if (deleteBtn) {





      if (!podeEditar) return;





      const id = deleteBtn.dataset.id;





      if (!id) return;











      const confirma = window.confirm(





        "Tem certeza que deseja apagar esta notícia?"





      );





      if (!confirma) return;











      try {





        await deleteDoc(doc(db, "noticias", id));





        noticiasCache = null;





        await loadNoticiasForCurrentUser();





      } catch (err) {





        console.error("Erro ao apagar notícia:", err);





        alert("Erro ao apagar notícia. Tente novamente.");





      }





    }





  });





}





// ====== NOTÍCIAS ?" HELPERS ======





function mapStatusNoticia(status) {





  if (!status) return "?";





  const s = status.toString().toLowerCase();











  switch (s) {





    case "publicada":





      return "Publicada";





    case "rascunho":





      return "Rascunho";





    default:





      return status;





  }





}

















function slugify(text) {





  return text





    .normalize("NFD")





    .replace(/[̀-ͯ]/g, "") // tira acento





    .toLowerCase()





    .replace(/[^a-z0-9\s-]/g, "")





    .trim()





    .replace(/\s+/g, "-");





}

















// ====== NOTICIAS: UPLOAD DE IMAGEM ======





function setNewsUploadStatus(text) {





  if (newsUploadStatus) newsUploadStatus.textContent = text || "";





}











async function handleNewsImageUpload(file) {





  const papel = currentUserData?.papel || "SEM_PAPEL";





  const podeEditar =





    papel === "LIGA_ADMIN" || papel === "COMUNICACAO_ADMIN";











  if (!podeEditar) {





    setText(





      newsFormMessage,





      "Voce nao tem permissao para enviar imagens."





    );





    return;





  }











  if (!file) {





    setNewsUploadStatus("Selecione um arquivo de imagem.");





    return;





  }











  if (file.size > 5 * 1024 * 1024) {





    setNewsUploadStatus("Imagem maior que 5 MB. Reduza antes de enviar.");





    return;





  }











  try {





    setNewsUploadStatus("Enviando imagem...");





    const titulo = fixMojibake((newsTituloInput?.value || "").trim());





    const slugTexto =





      (titulo && typeof slugify === "function" ? slugify(titulo) : "noticia") ||





      "noticia";





    const uniqueName = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;





    // Usa pasta permitida nas regras do Storage (ex.: news-covers)





    const path = `news-covers/${slugTexto}-${uniqueName}`;











    const fileRef = storageRef(storage, path);





    await uploadBytes(fileRef, file);





    const url = await getDownloadURL(fileRef);











    if (newsImagemInput) newsImagemInput.value = url;





    setNewsUploadStatus("Imagem enviada.");





  } catch (error) {





    console.error("Erro ao enviar imagem:", error);





    setNewsUploadStatus("Erro ao enviar imagem. Tente novamente.");





  }





}











if (newsUploadBtn && newsImageFileInput) {





  newsUploadBtn.addEventListener("click", () => {





    newsImageFileInput.click();





  });





}











if (newsImageFileInput) {





  newsImageFileInput.addEventListener("change", async (event) => {





    const file = event.target.files?.[0];





    if (!file) {





      setNewsUploadStatus("Nenhum arquivo selecionado.");





      return;





    }





    await handleNewsImageUpload(file);





  });





}

















// ====== BOTfO SAIR ======





if (logoutButton) {





  logoutButton.addEventListener("click", async () => {





    try {





      await signOut(auth);





      window.location.href = "portal.html";





    } catch (error) {





      console.error("Erro ao sair:", error);





      alert("Erro ao sair. Tente novamente.");





    }





  });





}











if (passwordChangeForm) {





  passwordChangeForm.addEventListener("submit", async (event) => {





    event.preventDefault();





    if (!auth.currentUser) return;





    const newPass = passwordNewInput?.value || "";





    const confirmPass = passwordConfirmInput?.value || "";





    if (newPass.length < 8) {





      setText(passwordChangeMessage, "A senha precisa ter ao menos 8 caracteres.");





      return;





    }





    if (newPass !== confirmPass) {





      setText(passwordChangeMessage, "As senhas não conferem.");





      return;





    }





    setText(passwordChangeMessage, "Atualizando senha...");





    try {





      await updatePassword(auth.currentUser, newPass);





      const targetEmail = currentUserData?.email || auth.currentUser?.email;





      if (targetEmail) {





        await setDoc(





          doc(db, "users", targetEmail.toLowerCase()),





          {





            mustChangePassword: false,





            passwordChangedAt: serverTimestamp(),





          },





          { merge: true }





        );





      }





      if (currentUserData) currentUserData.mustChangePassword = false;





      if (passwordChangeModal) {





        passwordChangeModal.hidden = true;





        passwordChangeModal.setAttribute("hidden", "");





        passwordChangeModal.style.display = "none";





      }





      document.body.classList.remove("portal-modal-open");





      setText(passwordChangeMessage, "");





    } catch (err) {





      console.error("Erro ao atualizar senha:", err);





      const code = err?.code || "";





      const message =





        code === "auth/requires-recent-login"





          ? "Sessão expirada. Faça logout e entre novamente para atualizar a senha."





          : "Erro ao atualizar senha. Tente novamente.";





      setText(passwordChangeMessage, message);





    }





  });





}











// ====== ON AUTH STATE CHANGED ======





onAuthStateChanged(auth, async (user) => {





  if (!user) {





    window.location.href = "portal.html";





    return;





  }











  try {





        await loadCurrentUserData(user);





    await loadQuadrilhasForCurrentUser();    // já usa documentos





    await loadDocumentosForCurrentUser();





    await loadFinanceiroForCurrentUser();





    await loadNoticiasForCurrentUser();





    await loadPessoasForCurrentUser();





  } catch (error) {





    console.error("Erro ao carregar dados do usuário:", error);





    if (userRoleTextP) {





      userRoleTextP.textContent =





        "Erro ao carregar seus dados. Tente sair e entrar novamente.";





    }





  }





});











// -----------------------------





// Navegação lateral do portal





// -----------------------------











function formatScore(value) {





  if (value === null || value === undefined || Number.isNaN(value)) return "--";





  return Number(value).toLocaleString("pt-BR", {





    minimumFractionDigits: 1,





    maximumFractionDigits: 1,





  });





}











function renderCompeticoesDashboard(data) {





  if (!data) return;











  const ranking = Array.isArray(data.ranking_final) ? data.ranking_final : [];





  const etapas = data.meta?.etapas || (ranking[0] ? Object.keys(ranking[0].etapas || {}) : []);











  if (competicoesTotalQuadrilhas) {





    competicoesTotalQuadrilhas.textContent = String(ranking.length || 0);





  }





  if (competicoesTotalEtapas) {





    competicoesTotalEtapas.textContent = String(etapas.length || 0);





  }





  if (competicoesMaiorTotal) {





    const maxTotal = ranking.reduce((acc, item) => Math.max(acc, Number(item.total || 0)), 0);





    competicoesMaiorTotal.textContent = formatScore(maxTotal);





  }











  if (competicoesRankingBody) {





    competicoesRankingBody.innerHTML = ranking





      .map((item) => {





        const e1 = item.etapas?.[etapas[0]] ?? "--";





        const e2 = item.etapas?.[etapas[1]] ?? "--";





        const e3 = item.etapas?.[etapas[2]] ?? "--";





        const e4 = item.etapas?.[etapas[3]] ?? "--";





        return `





          <tr>





            <td>${item.posicao ?? ""}</td>





            <td>${item.quadrilha || ""}</td>





            <td>${formatScore(item.total)}</td>





            <td>${formatScore(e1)}</td>





            <td>${formatScore(e2)}</td>





            <td>${formatScore(e3)}</td>





            <td>${formatScore(e4)}</td>





          </tr>





        `;





      })





      .join("");





  }











  if (competicoesQuesitosGrid) {





    const quesitos = data.quesitos || {};





    const maxOverall = Object.values(quesitos).reduce((acc, list) => {





      if (!Array.isArray(list) || !list.length) return acc;





      const maxQ = Math.max(...list.map((item) => Number(item.total || 0)));





      return Math.max(acc, maxQ);





    }, 0);











    competicoesQuesitosGrid.innerHTML = Object.entries(quesitos)





      .map(([key, list]) => {





        const items = (Array.isArray(list) ? list.slice() : [])





          .filter((item) => item && item.quadrilha)





          .sort((a, b) => Number(b.total || 0) - Number(a.total || 0))





          .slice(0, 5);





        const top = items[0] || {};





        const topTotal = Number(top.total || 0);





        const pct = maxOverall ? Math.max(8, Math.round((topTotal / maxOverall) * 100)) : 0;





        const label = key.replace(/_/g, " ");











        const listHtml = items





          .map((item, idx) => {





            return `<li><span>${idx + 1}. ${item.quadrilha}</span><strong>${formatScore(item.total)}</strong></li>`;





          })





          .join("");











        return `





          <div class="card competicao-quesito-card">





            <h4 class="card-title">${label}</h4>





            <ul class="competicao-list">${listHtml}</ul>





            <div class="competicao-bar"><span style="width:${pct}%"></span></div>





          </div>





        `;





      })





      .join("");





  }





}











async function loadCompeticoesDashboard() {





  if (competicoesCache) {





    renderCompeticoesDashboard(competicoesCache);





    return;





  }











  try {





    const response = await fetch("data/portal/competicoes/acesso-2022.json");





    if (!response.ok) throw new Error(`HTTP ${response.status}`);





    const data = await response.json();





    competicoesCache = data;





    renderCompeticoesDashboard(data);





  } catch (err) {





    console.error("Erro ao carregar dados de competições:", err);





    if (competicoesRankingBody) {





      competicoesRankingBody.innerHTML = '<tr><td colspan="7">Erro ao carregar dados.</td></tr>';





    }





  }





}











document.addEventListener('DOMContentLoaded', () => {





  const navLinks = document.querySelectorAll('.portal-nav-link');





  const heroLinks = document.querySelectorAll('.js-section-link');





  const sections = document.querySelectorAll('.portal-section');











  function showSection(sectionKey) {





    sections.forEach((section) => {





      const id = section.id || "";





      const key = id.replace("section-", "");











      // mostra só a seção correspondente





      section.style.display = key === sectionKey ? "block" : "none";





    });











    // marca o link ativo no menu





    navLinks.forEach((link) => {





      if (link.dataset.section === sectionKey) {





        link.classList.add("is-active");





      } else {





        link.classList.remove("is-active");





      }





    });





  }











  // estado inicial: dashboard





  showSection("dashboard");











  // clique nas opções do menu





  navLinks.forEach((link) => {





    link.addEventListener("click", () => {





      const key = link.dataset.section;





      if (!key) return;











      showSection(key);





      window.scrollTo({ top: 0, behavior: "smooth" });











      // carregamentos específicos por aba (recarrega sob demanda)





      switch (key) {





        case "quadrilha":





          loadQuadrilhasForCurrentUser();





          break;





        case "documentos":





          loadDocumentosForCurrentUser();





          break;





        case "pessoas":





          loadPessoasForCurrentUser();





          break;





        case "financeiro":





          loadFinanceiroForCurrentUser();





          break;





        case "competicoes":





          loadCompeticoesDashboard();





          break;





        case "noticias":





          loadNoticiasForCurrentUser();





          break;





        default:





          // outras abas, por enquanto, não têm carregamento dinâmico





          break;





      }





    });





  });











  heroLinks.forEach((link) => {





    link.addEventListener("click", (e) => {





      e.preventDefault();





      const key = link.dataset.section;





      if (!key) return;





      showSection(key);





      window.scrollTo({ top: 0, behavior: "smooth" });





    });





  });











  window.portalAppNavigationReady = true;





});

































