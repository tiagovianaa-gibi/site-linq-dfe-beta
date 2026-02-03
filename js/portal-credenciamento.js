import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  getDocs,
  setDoc,
  collection,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { loadJSON } from "./shared.js";

if (!window.RUNTIME_CONFIG || !window.RUNTIME_CONFIG.firebase) {
  console.error("Configuracao ausente: crie js/runtime-config.js a partir do example.");
  throw new Error("Configuracao ausente: crie js/runtime-config.js a partir do example.");
}

const firebaseConfig = window.RUNTIME_CONFIG.firebase;

const XLSX_URL = "https://cdn.jsdelivr.net/npm/xlsx@0.18.5/+esm";
const JSPDF_URL = "https://cdn.jsdelivr.net/npm/jspdf@2.5.1/+esm";
const JSZIP_URL = "https://cdn.jsdelivr.net/npm/jszip@3.10.1/+esm";

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const state = {
  user: null,
  perfil: null,
  index: null,
  participants: [],
  presencas: new Map(),
  eventsBound: false,
};

const ui = {
  section: document.getElementById("section-credenciamento"),
  adminCard: document.getElementById("credAdminCard"),
  quadCard: document.getElementById("credQuadCard"),
  presencaCard: document.getElementById("credPresencaCard"),
  perfilChip: document.getElementById("credPerfilChip"),
  perfilHint: document.getElementById("credPerfilHint"),
  etapa: document.getElementById("credEtapaSelect"),
  quadrilha: document.getElementById("credQuadrilhaSelect"),
  adminStatus: document.getElementById("credAdminStatus"),
  importBtn: document.getElementById("credImportListaBtn"),
  loadBtn: document.getElementById("credLoadPresencasBtn"),
  saveBtn: document.getElementById("credSavePresencasBtn"),
  fecharBtn: document.getElementById("credFecharEtapaBtn"),
  actionsGrid: document.getElementById("credActionsGrid"),
  list: document.getElementById("credPresencasLista"),
  markAll: document.getElementById("credMarcarTodosBtn"),
  unmarkAll: document.getElementById("credDesmarcarTodosBtn"),
  quadEtapa: document.getElementById("credQuadEtapaSelect"),
  quadSelect: document.getElementById("credQuadSelect"),
  quadSelectWrap: document.getElementById("credQuadSelectWrap"),
  quadStatus: document.getElementById("credQuadStatus"),
  gerarBtn: document.getElementById("credGerarCertificadosBtn"),
};

function setText(el, text) {
  if (el) el.textContent = text;
}

function statusAdmin(text) {
  setText(ui.adminStatus, text || "");
}

function statusQuad(text) {
  setText(ui.quadStatus, text || "");
}

function normalize(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function slug(value) {
  return normalize(value).replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function escapeHtml(text) {
  return String(text || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function isLigaAdmin() {
  return state.perfil?.papel === "LIGA_ADMIN";
}

function isCredenciamento() {
  return state.perfil?.papel === "CREDENCIAMENTO";
}

function isQuadrilhaAdmin() {
  return state.perfil?.papel === "QUADRILHA_ADMIN";
}

function canUseOperacao() {
  return isLigaAdmin() || isCredenciamento();
}

function canUseCertificados() {
  return isLigaAdmin() || isQuadrilhaAdmin();
}

function setRoleHeader() {
  if (!ui.perfilChip || !ui.perfilHint) return;
  const papel = state.perfil?.papel || "";
  const labels = {
    LIGA_ADMIN: "Adm Liga",
    CREDENCIAMENTO: "Credenciador",
    QUADRILHA_ADMIN: "Quadrilha",
  };

  ui.perfilChip.textContent = labels[papel] || "Perfil";

  if (isLigaAdmin()) {
    ui.perfilHint.textContent = "Acesso completo: operacao da etapa, presenca e certificados.";
    return;
  }
  if (isCredenciamento()) {
    ui.perfilHint.textContent = "Acesso de campo: carregar e salvar presenca por etapa.";
    return;
  }
  if (isQuadrilhaAdmin()) {
    ui.perfilHint.textContent = "Acesso da quadrilha: gerar e baixar certificados em lote.";
    return;
  }
  ui.perfilHint.textContent = "Sem permissao para usar este modulo.";
}

async function loadPerfil(user) {
  const byEmail = user?.email ? doc(db, "users", user.email.toLowerCase()) : null;
  const byUid = user?.uid ? doc(db, "users", user.uid) : null;
  if (byEmail) {
    const snap = await getDoc(byEmail);
    if (snap.exists()) return snap.data();
  }
  if (byUid) {
    const snap = await getDoc(byUid);
    if (snap.exists()) return snap.data();
  }
  return null;
}

function inferHeader(headers, candidates = []) {
  return headers.find((h) => candidates.some((c) => normalize(h).includes(normalize(c)))) || "";
}

async function readRowsFromAsset(path) {
  const extension = String(path || "").split(".").pop().toLowerCase();

  if (extension === "csv") {
    const text = await fetch(path).then((r) => {
      if (!r.ok) throw new Error(`Falha ao carregar ${path}`);
      return r.text();
    });
    const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/).filter(Boolean);
    if (!lines.length) return [];

    const sep = lines[0].includes(";") ? ";" : ",";
    const headers = lines[0].split(sep).map((x) => x.trim());
    return lines.slice(1).map((line) => {
      const cols = line.split(sep);
      const row = {};
      headers.forEach((h, i) => {
        row[h] = cols[i] ?? "";
      });
      return row;
    });
  }

  if (extension === "xlsx" || extension === "xls") {
    const XLSX = await import(XLSX_URL);
    const buffer = await fetch(path).then((r) => {
      if (!r.ok) throw new Error(`Falha ao carregar ${path}`);
      return r.arrayBuffer();
    });
    const workbook = XLSX.read(buffer, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    return XLSX.utils.sheet_to_json(sheet, { defval: "" });
  }

  throw new Error("Formato nao suportado.");
}

function getSelectedEtapa() {
  return ui.etapa?.value || "";
}

function getSelectedQuadrilha() {
  return ui.quadrilha?.value || "";
}

function getEtapaFromIndex(etapaId) {
  return (state.index?.etapas || []).find((e) => e.id === etapaId) || null;
}

function listQuadrilhasForEtapa(etapaId) {
  const etapa = getEtapaFromIndex(etapaId);
  return (etapa?.arquivos || []).map((item) => ({
    id: item.quadrilhaId || slug(item.quadrilhaNome || "quadrilha"),
    nome: item.quadrilhaNome || item.quadrilhaId || "Quadrilha",
    path: item.path || "",
  }));
}

function fillSelect(select, options, selected) {
  if (!select) return;
  select.innerHTML = options.map((o) => `<option value="${o.value}">${o.label}</option>`).join("");
  if (selected && options.some((o) => o.value === selected)) {
    select.value = selected;
  }
}

async function loadIndex() {
  state.index = (await loadJSON("data/credenciamento/index.json")) || { etapas: [] };
}

function setupSelects() {
  const etapas = state.index?.etapas || [];
  const etapaOptions = etapas.length
    ? etapas.map((e) => ({ value: e.id, label: e.nome || e.id }))
    : [{ value: "", label: "Nenhuma etapa no indice" }];

  fillSelect(ui.etapa, etapaOptions, ui.etapa?.value || "");
  fillSelect(ui.quadEtapa, etapaOptions, ui.quadEtapa?.value || "");

  const etapaId = getSelectedEtapa();
  const quadrilhas = listQuadrilhasForEtapa(etapaId);
  const quadOptions = quadrilhas.length
    ? quadrilhas.map((q) => ({ value: q.id, label: q.nome }))
    : [{ value: "", label: "Nenhuma quadrilha mapeada" }];
  fillSelect(ui.quadrilha, quadOptions, ui.quadrilha?.value || "");

  const quadEtapaId = ui.quadEtapa?.value || "";
  const quadEtapaQuadrilhas = listQuadrilhasForEtapa(quadEtapaId);
  const quadDownloadOptions = quadEtapaQuadrilhas.length
    ? quadEtapaQuadrilhas.map((q) => ({ value: q.id, label: q.nome }))
    : [{ value: "", label: "Nenhuma quadrilha mapeada" }];
  fillSelect(ui.quadSelect, quadDownloadOptions, ui.quadSelect?.value || "");

  if (isQuadrilhaAdmin() && state.perfil?.quadrilhaId) {
    ui.quadSelect.value = state.perfil.quadrilhaId;
    ui.quadSelect.disabled = true;
    if (ui.quadSelectWrap) ui.quadSelectWrap.style.display = "none";
  } else if (ui.quadSelectWrap) {
    ui.quadSelectWrap.style.display = "block";
    ui.quadSelect.disabled = false;
  }
}

async function importListaAssets() {
  const etapaId = getSelectedEtapa();
  const quadrilhaId = getSelectedQuadrilha();
  if (!etapaId || !quadrilhaId) {
    statusAdmin("Selecione etapa e quadrilha.");
    return;
  }

  const etapa = getEtapaFromIndex(etapaId);
  const fileEntry = (etapa?.arquivos || []).find((a) => (a.quadrilhaId || "") === quadrilhaId);
  if (!fileEntry?.path) {
    statusAdmin("Arquivo da quadrilha nao mapeado em data/credenciamento/index.json.");
    return;
  }

  try {
    statusAdmin("Importando lista da quadrilha...");
    const rows = await readRowsFromAsset(fileEntry.path);
    if (!rows.length) {
      statusAdmin("Arquivo sem linhas validas.");
      return;
    }

    const headers = Object.keys(rows[0]);
    const cfg = state.index?.import_config || {};
    const nomeHeader = inferHeader(headers, cfg.nome_candidates || ["nome"]);
    const funcaoHeader = inferHeader(headers, cfg.funcao_candidates || ["funcao"]);
    const docHeader = inferHeader(headers, cfg.documento_candidates || ["cpf"]);

    if (!nomeHeader) {
      statusAdmin("Nao foi possivel identificar a coluna de nome.");
      return;
    }

    const etapaRef = doc(db, "etapas", etapaId);
    await setDoc(
      etapaRef,
      {
        id: etapaId,
        nome: etapa?.nome || etapaId,
        data: etapa?.data || null,
        status: etapa?.status || "aberta",
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    const quadRef = doc(db, "etapas", etapaId, "quadrilhas", quadrilhaId);
    await setDoc(
      quadRef,
      {
        id: quadrilhaId,
        nome: fileEntry.quadrilhaNome || quadrilhaId,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    let imported = 0;
    for (const row of rows) {
      const nome = String(row[nomeHeader] || "").trim();
      if (!nome) continue;

      const funcao = funcaoHeader ? String(row[funcaoHeader] || "").trim() : "";
      const documento = docHeader ? String(row[docHeader] || "").trim() : "";
      const pid = slug(`${nome}-${documento || imported}`);

      await setDoc(
        doc(db, "etapas", etapaId, "quadrilhas", quadrilhaId, "participantes", pid),
        {
          id: pid,
          nome,
          funcao: funcao || null,
          documento: documento || null,
          importedAt: serverTimestamp(),
        },
        { merge: true }
      );
      imported += 1;
    }

    statusAdmin(`Lista importada com sucesso: ${imported} participante(s).`);
  } catch (err) {
    console.error("Erro ao importar lista:", err);
    statusAdmin("Falha ao importar lista.");
  }
}

async function loadPresencas() {
  const etapaId = getSelectedEtapa();
  const quadrilhaId = getSelectedQuadrilha();
  if (!etapaId || !quadrilhaId) {
    statusAdmin("Selecione etapa e quadrilha.");
    return;
  }

  try {
    statusAdmin("Carregando lista de presenca...");

    const [partSnap, presSnap] = await Promise.all([
      getDocs(collection(db, "etapas", etapaId, "quadrilhas", quadrilhaId, "participantes")),
      getDocs(collection(db, "etapas", etapaId, "quadrilhas", quadrilhaId, "presencas")),
    ]);

    state.participants = partSnap.docs
      .map((d) => d.data())
      .sort((a, b) => String(a.nome || "").localeCompare(String(b.nome || ""), "pt-BR"));
    state.presencas = new Map(presSnap.docs.map((d) => [d.id, d.data()?.presente === true]));

    if (!state.participants.length) {
      ui.list.innerHTML = '<p class="muted">Nenhum participante importado para esta quadrilha.</p>';
      statusAdmin("Sem participantes.");
      return;
    }

    ui.list.innerHTML = state.participants
      .map((p) => {
        const checked = state.presencas.get(p.id) ? "checked" : "";
        return `
          <label class="cred-presenca-item">
            <input type="checkbox" data-participante-id="${p.id}" ${checked}>
            <span>
              <strong>${escapeHtml(p.nome)}</strong>
              <small class="muted notas-small">${escapeHtml(p.funcao || "Participante")}</small>
            </span>
          </label>
        `;
      })
      .join("");

    statusAdmin(`${state.participants.length} participante(s) carregados.`);
  } catch (err) {
    console.error("Erro ao carregar presenca:", err);
    statusAdmin("Falha ao carregar presenca.");
  }
}

async function savePresencas() {
  const etapaId = getSelectedEtapa();
  const quadrilhaId = getSelectedQuadrilha();
  if (!etapaId || !quadrilhaId) {
    statusAdmin("Selecione etapa e quadrilha.");
    return;
  }

  try {
    const checks = Array.from(ui.list.querySelectorAll("input[type='checkbox'][data-participante-id]"));
    if (!checks.length) {
      statusAdmin("Nenhuma lista carregada.");
      return;
    }

    statusAdmin("Salvando presenca...");

    for (const check of checks) {
      const pid = check.getAttribute("data-participante-id");
      await setDoc(
        doc(db, "etapas", etapaId, "quadrilhas", quadrilhaId, "presencas", pid),
        {
          participanteId: pid,
          presente: check.checked,
          marcadoEm: serverTimestamp(),
          marcadoPor: {
            uid: state.user?.uid || null,
            email: state.user?.email || null,
            papel: state.perfil?.papel || null,
          },
        },
        { merge: true }
      );
    }

    statusAdmin("Presenca salva com sucesso.");
  } catch (err) {
    console.error("Erro ao salvar presenca:", err);
    statusAdmin("Falha ao salvar presenca.");
  }
}

async function fecharEtapa() {
  const etapaId = getSelectedEtapa();
  if (!etapaId) {
    statusAdmin("Selecione uma etapa.");
    return;
  }

  try {
    await setDoc(
      doc(db, "etapas", etapaId),
      {
        status: "fechada",
        fechadaEm: serverTimestamp(),
        fechadaPor: {
          uid: state.user?.uid || null,
          email: state.user?.email || null,
        },
      },
      { merge: true }
    );
    statusAdmin("Etapa fechada.");
  } catch (err) {
    console.error("Erro ao fechar etapa:", err);
    statusAdmin("Falha ao fechar etapa.");
  }
}

function buildCertificateDoc(jsPDF, template, participante, quadrilhaNome, etapaNome, etapaData) {
  const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(22);
  pdf.text(template?.subtitulo || "Certificado de Participacao", 148, 42, { align: "center" });

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(12);
  pdf.text(template?.titulo_evento || "Circuito de Quadrilhas Juninas", 148, 52, { align: "center" });

  pdf.setFontSize(14);
  pdf.text("Certificamos que", 148, 78, { align: "center" });

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(20);
  pdf.text(participante.nome || "Participante", 148, 94, { align: "center" });

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(13);
  pdf.text(`da quadrilha ${quadrilhaNome}`, 148, 108, { align: "center" });
  pdf.text(`participou da etapa ${etapaNome}.`, 148, 118, { align: "center" });
  pdf.text(`Data da etapa: ${etapaData || "--"}`, 148, 128, { align: "center" });
  pdf.text(`Funcao: ${participante.funcao || "Participante"}`, 148, 138, { align: "center" });

  pdf.setFontSize(11);
  pdf.text(template?.assinatura_1 || "LINQ-DFE", 72, 185, { align: "center" });
  pdf.text(template?.assinatura_2 || "Credenciamento", 224, 185, { align: "center" });
  pdf.line(35, 178, 110, 178);
  pdf.line(185, 178, 260, 178);

  return pdf;
}

function safeFilename(text) {
  return slug(text).replace(/[^a-z0-9-]/g, "");
}

async function gerarCertificadosZip() {
  const etapaId = ui.quadEtapa?.value || "";
  const quadrilhaId = ui.quadSelect?.value || "";
  if (!etapaId || !quadrilhaId) {
    statusQuad("Selecione etapa e quadrilha.");
    return;
  }

  try {
    statusQuad("Carregando presencas...");

    const [partSnap, presSnap] = await Promise.all([
      getDocs(collection(db, "etapas", etapaId, "quadrilhas", quadrilhaId, "participantes")),
      getDocs(collection(db, "etapas", etapaId, "quadrilhas", quadrilhaId, "presencas")),
    ]);

    const presentIds = new Set(
      presSnap.docs
        .map((d) => d.data())
        .filter((p) => p?.presente === true)
        .map((p) => p.participanteId)
    );

    const participantes = partSnap.docs.map((d) => d.data()).filter((p) => presentIds.has(p.id));
    if (!participantes.length) {
      statusQuad("Nenhum participante presente para gerar certificado.");
      return;
    }

    statusQuad("Gerando certificados...");

    const [{ jsPDF }, zipModule] = await Promise.all([import(JSPDF_URL), import(JSZIP_URL)]);
    const JSZip = zipModule.default;
    const zip = new JSZip();

    const etapa = getEtapaFromIndex(etapaId);
    const quadrilha = listQuadrilhasForEtapa(etapaId).find((q) => q.id === quadrilhaId);
    const template = state.index?.template || {};

    for (const participante of participantes) {
      const docPdf = buildCertificateDoc(
        jsPDF,
        template,
        participante,
        quadrilha?.nome || quadrilhaId,
        etapa?.nome || etapaId,
        etapa?.data || ""
      );
      const blob = docPdf.output("blob");
      const name = `certificado-${safeFilename(participante.nome)}.pdf`;
      zip.file(name, blob);
    }

    const zipBlob = await zip.generateAsync({ type: "blob" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(zipBlob);
    a.download = `certificados-${safeFilename(etapa?.nome || etapaId)}-${safeFilename(quadrilha?.nome || quadrilhaId)}.zip`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(a.href);

    statusQuad(`${participantes.length} certificado(s) gerados e baixados.`);
  } catch (err) {
    console.error("Erro ao gerar certificados:", err);
    statusQuad("Falha ao gerar certificados.");
  }
}

function toggleTodos(mark) {
  ui.list.querySelectorAll("input[type='checkbox'][data-participante-id]").forEach((el) => {
    el.checked = mark;
  });
}

function applyRoleUI() {
  const showOperacao = canUseOperacao();
  const showCertificados = canUseCertificados();

  if (ui.adminCard) ui.adminCard.style.display = showOperacao ? "block" : "none";
  if (ui.presencaCard) ui.presencaCard.style.display = showOperacao ? "block" : "none";
  if (ui.quadCard) ui.quadCard.style.display = showCertificados ? "block" : "none";

  if (ui.importBtn) ui.importBtn.style.display = isLigaAdmin() ? "" : "none";
  if (ui.fecharBtn) ui.fecharBtn.style.display = isLigaAdmin() ? "" : "none";
  if (ui.actionsGrid) {
    ui.actionsGrid.classList.toggle("cred-actions-grid--cred", isCredenciamento());
  }
}

function bindEvents() {
  if (state.eventsBound) return;
  state.eventsBound = true;

  ui.etapa?.addEventListener("change", setupSelects);
  ui.quadEtapa?.addEventListener("change", setupSelects);
  ui.importBtn?.addEventListener("click", importListaAssets);
  ui.loadBtn?.addEventListener("click", loadPresencas);
  ui.saveBtn?.addEventListener("click", savePresencas);
  ui.fecharBtn?.addEventListener("click", fecharEtapa);
  ui.gerarBtn?.addEventListener("click", gerarCertificadosZip);
  ui.markAll?.addEventListener("click", () => toggleTodos(true));
  ui.unmarkAll?.addEventListener("click", () => toggleTodos(false));

  const navCred = document.querySelector('.portal-nav-link[data-section="credenciamento"]');
  if (navCred) navCred.addEventListener("click", () => statusAdmin(""));
}

async function initForUser() {
  await loadIndex();
  setRoleHeader();
  applyRoleUI();
  setupSelects();
  bindEvents();
}

onAuthStateChanged(auth, async (user) => {
  if (!ui.section) return;
  if (!user) return;

  state.user = user;
  state.perfil = await loadPerfil(user);
  await initForUser();
});
