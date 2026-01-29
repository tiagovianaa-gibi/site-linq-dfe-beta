// js/portal-app.js
// Lado "logado" do Portal da Liga: verifica usuário, busca papel e controla navegação

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import {
  getFirestore,
  doc,
  getDoc,
  collection,
  getDocs,
  setDoc,
  addDoc,
  deleteDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";
import {
  getFunctions,
  httpsCallable,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-functions.js";


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
const functions = getFunctions(app, "us-central1");
const functionsFallback = getFunctions(app);

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
const statFinanceiroAberto = document.getElementById("statFinanceiroAberto");
const statFinanceiroPago = document.getElementById("statFinanceiroPago");

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
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function sanitizePlainText(text) {
  if (!text) return "";
  return text.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "").replace(/[<>]/g, "");
}

const MOJIBAKE_REPLACEMENTS = [
  ["\u00c3\u00a1", "\u00e1"],
  ["\u00c3\u00a0", "\u00e0"],
  ["\u00c3\u00a2", "\u00e2"],
  ["\u00c3\u00a3", "\u00e3"],
  ["\u00c3\u00a4", "\u00e4"],
  ["\u00c3\u00a7", "\u00e7"],
  ["\u00c3\u00a9", "\u00e9"],
  ["\u00c3\u00a8", "\u00e8"],
  ["\u00c3\u00aa", "\u00ea"],
  ["\u00c3\u00ad", "\u00ed"],
  ["\u00c3\u00af", "\u00ef"],
  ["\u00c3\u00b3", "\u00f3"],
  ["\u00c3\u00b4", "\u00f4"],
  ["\u00c3\u00b5", "\u00f5"],
  ["\u00c3\u00ba", "\u00fa"],
  ["\u00c3\u00bc", "\u00fc"],
  ["\u00c3\u0081", "\u00c1"],
  ["\u00c3\u0080", "\u00c0"],
  ["\u00c3\u0082", "\u00c2"],
  ["\u00c3\u0083", "\u00c3"],
  ["\u00c3\u0087", "\u00c7"],
  ["\u00c3\u0089", "\u00c9"],
  ["\u00c3\u008a", "\u00ca"],
  ["\u00c3\u008d", "\u00cd"],
  ["\u00c3\u0093", "\u00d3"],
  ["\u00c3\u0094", "\u00d4"],
  ["\u00c3\u0095", "\u00d5"],
  ["\u00c3\u009a", "\u00da"],
  ["\u00c3\u009c", "\u00dc"],
  ["\u00c2\u00a0", " "],
  ["\u00e2\u0080\u0093", "\u2013"],
  ["\u00e2\u0080\u0094", "\u2014"],
  ["\u00e2\u0080\u0098", "\u2018"],
  ["\u00e2\u0080\u0099", "\u2019"],
  ["\u00e2\u0080\u009c", "\u201c"],
  ["\u00e2\u0080\u009d", "\u201d"],
  ["\u00e2\u0080\u00a6", "\u2026"],
  ["\u00c2\u00ba", "\u00ba"],
  ["\u00c2\u00aa", "\u00aa"],
];

function fixMojibake(text) {
  if (!text) return "";
  if (!/[\u00c2\u00c3\u00e2]/.test(text)) return text;
  let out = text;
  for (const [bad, good] of MOJIBAKE_REPLACEMENTS) {
    out = out.split(bad).join(good);
  }
  return out;
}

// Converte texto puro em HTML seguro
// - Linha em branco => novo parágrafo
// - Linhas que começam com "## " viram <h2>
function portalTextToHtml(raw) {
  if (!raw) return "";

  const normalized = fixMojibake(raw);
  const lines = normalized.split("\n");
  const blocks = [];
  let current = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      if (current.length) {
        blocks.push(current.join(" "));
        current = [];
      }
    } else {
      current.push(trimmed);
    }
  }

  if (current.length) {
    blocks.push(current.join(" "));
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
    .join("\n\n");
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
  let roleName = "Usu?rio";
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

  return data;
}

// ====== QUADRILHAS ======
async function fetchQuadrilhas() {
  if (quadrilhasCache) {
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

  return `
    <div class="card">
      <div class="card-body">
        <h3 class="card-title">${q.nome || q.id}</h3>
        <p class="card-text">
          <strong>Sigla:</strong> ${q.sigla || q.id}
        </p>
        <p class="card-text">
          <strong>Localidade:</strong> ${cidadeUf || "?"}
        </p>
        <p class="card-text">
          <strong>Grupo atual:</strong> ${statusGrupo}
        </p>
        ${documentosLinha}
        ${insta}
      </div>
    </div>
  `;
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
  let aberto = 0;
  let pago = 0;
  fin.forEach((l) => {
    const val = Number(l.valor) || 0;
    if ((l.status || "").toUpperCase() === "PAGO") pago += val;
    else if ((l.status || "").toUpperCase() === "ABERTO") aberto += val;
  });
  if (statFinanceiroAberto) setText(statFinanceiroAberto, formatCurrencyBR(aberto));
  if (statFinanceiroPago) setText(statFinanceiroPago, formatCurrencyBR(pago));
}

// ====== FINANCEIRO ======
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
    case "ABERTO":
      return "Em aberto";
    case "PAGO":
      return "Pago";
    case "CANCELADO":
      return "Cancelado";
    default:
      return status || "?";
  }
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
    (l.quadrilhaId && mapaQuadrilhas[l.quadrilhaId]) ||
    l.quadrilhaId ||
    "?";

  const tipoLabel = mapTipoLancamento(l.tipo);
  const statusLabel = mapStatusLancamento(l.status);
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
      mapaQuadrilhas[q.id] = q.nome || q.id;
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

      visiveis = lancamentos.filter(
        (l) => l.quadrilhaId === quadrilhaIdUser
      );
    } else if (papel === "LIGA_ADMIN") {
      // Liga vê todos, com filtros
      if (finFiltersCard) finFiltersCard.style.display = "block";
      if (finSubtitle)
        finSubtitle.textContent = "Financeiro das quadrilhas.";

      const filtroQuadrilha = finFiltroQuadrilha?.value || "";
      const filtroAno = finFiltroAno?.value || "";
      const filtroStatus = finFiltroStatus?.value || "";

      visiveis = lancamentos.filter((l) => {
        const okQuadrilha =
          !filtroQuadrilha || l.quadrilhaId === filtroQuadrilha;
        const okAno =
          !filtroAno ||
          (l.ano && String(l.ano) === String(filtroAno));
        const okStatus = !filtroStatus || l.status === filtroStatus;
        const okTipo = !filtroTipo || l.tipo === filtroTipo;
        return okQuadrilha && okAno && okStatus && okTipo;
      });

      // preencher opções de ano no filtro
      if (finFiltroAno) {
        const anosSet = new Set();
        lancamentos.forEach((l) => {
          if (l.ano) anosSet.add(String(l.ano));
        });
        const anosOrdenados = Array.from(anosSet).sort();
        finFiltroAno.innerHTML = '<option value="">Todos</option>';
        anosOrdenados.forEach((ano) => {
          const opt = document.createElement("option");
          opt.value = ano;
          opt.textContent = ano;
          finFiltroAno.appendChild(opt);
        });
      }
    } else {
      if (finFiltersCard) finFiltersCard.style.display = "none";
      if (finSubtitle)
        finSubtitle.textContent =
          "Financeiro (perfil sem acesso detalhado).";
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
      return;
    }

    finTableBody.innerHTML = visiveis
      .map((l) => renderFinanceiroRow(l, mapaQuadrilhas, canEdit))
      .join("");
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
  if (finStatusSelect) finStatusSelect.value = lancamento.status || "ABERTO";
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
}

if (finFormCancelBtn) {
  finFormCancelBtn.addEventListener("click", () => {
    resetFinanceiroFormState();
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
    (d.quadrilhaId && mapaQuadrilhas[d.quadrilhaId]) || d.quadrilhaId || "?";
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

// ====== QUADRILHAS: CARREGAMENTO DA SE?fO ======
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

      quadrilhaContent.innerHTML = quadrilhas
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
    const nomeInput = document.getElementById("qNome");
    const cidadeInput = document.getElementById("qCidade");
    const ufInput = document.getElementById("qUF");
    const grupoInput = document.getElementById("qGrupo");
    const instagramInput = document.getElementById("qInstagram");

    const id = idInput.value.trim().toUpperCase();
    const nome = nomeInput.value.trim();
    const cidade = cidadeInput.value.trim();
    const uf = ufInput.value.trim().toUpperCase();
    const grupo = grupoInput.value;
    const instagram = instagramInput.value.trim();

    if (!id || !nome) {
      setText(
        quadrilhaFormMessage,
        "Preencha pelo menos ID/Sigla e Nome da quadrilha."
      );
      return;
    }

    setText(quadrilhaFormMessage, "Salvando quadrilha...");

    try {
      await setDoc(
        doc(db, "quadrilhas", id),
        {
          nome,
          sigla: id,
          cidade: cidade || null,
          uf: uf || null,
          grupo_atual: grupo || null,
          instagram: instagram || null,
          entidade: "LINQ-DFE",
          ativa: true,
        },
        { merge: true }
      );

      setText(quadrilhaFormMessage, "Quadrilha salva com sucesso.");
      quadrilhaForm.reset();

      // Recarrega lista
      quadrilhasCache = null;
      await loadQuadrilhasForCurrentUser();
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
        },
        { merge: true }
      );

      setText(
        userFormMessage,
        "Usuário salvo/atualizado com sucesso. O login precisa existir no Auth."
      );
      userForm.reset();
      atualizarVisibilidadeQuadrilhaPorPapel();
    } catch (err) {
      console.error("Erro ao salvar usuário:", err);
      setText(
        userFormMessage,
        "Erro ao salvar usuário. Tente novamente."
      );
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

// ====== FORMULÁRIO: NOVO LAN?AMENTO FINANCEIRO ======
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
    const status = finStatusSelect.value;
    const dataVencimento = finDataVencimentoInput.value || null;
    const dataPagamento = finDataPagamentoInput.value || null;
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
  const titulo = fixMojibake(n.titulo || "(sem t\u00edtulo)");
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
    .replace(/[\u0300-\u036f]/g, "") // tira acento
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

      // carregamentos específicos por aba (recarrega sob demanda)
      switch (key) {
        case "quadrilha":
          loadQuadrilhasForCurrentUser();
          break;
        case "documentos":
          loadDocumentosForCurrentUser();
          break;
        case "financeiro":
          loadFinanceiroForCurrentUser();
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
    });
  });

  window.portalAppNavigationReady = true;
});
