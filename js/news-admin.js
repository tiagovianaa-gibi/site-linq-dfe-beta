import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc,
  addDoc,
  setDoc,
  deleteDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

(() => {
  const root = document.getElementById("section-noticias");
  if (!root) return;

  if (!window.RUNTIME_CONFIG || !window.RUNTIME_CONFIG.firebase) {
  console.error("Configuracao ausente: crie js/runtime-config.js a partir do example.");
  throw new Error("Configuracao ausente: crie js/runtime-config.js a partir do example.");
}

const firebaseConfig = window.RUNTIME_CONFIG.firebase;

  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const storage = getStorage(app);

  const els = {
    tabs: root.querySelectorAll(".news-tab"),
    listPane: document.getElementById("newsListPane"),
    editorPane: document.getElementById("newsEditorPane"),
    addNewBtn: document.getElementById("newsAddNewBtn"),
    reloadBtn: document.getElementById("newsReloadBtn"),
    searchInput: document.getElementById("newsSearchInput"),
    statusFilter: document.getElementById("newsStatusFilter"),
    featuredFilter: document.getElementById("newsFeaturedFilter"),
    sortSelect: document.getElementById("newsSortSelect"),
    bulkAction: document.getElementById("newsBulkAction"),
    bulkApplyBtn: document.getElementById("newsBulkApplyBtn"),
    selectAll: document.getElementById("newsSelectAll"),
    tableBody: document.getElementById("newsTableBody"),
    paginationInfo: document.getElementById("newsPaginationInfo"),
    pageLabel: document.getElementById("newsPageLabel"),
    prevPageBtn: document.getElementById("newsPrevPageBtn"),
    nextPageBtn: document.getElementById("newsNextPageBtn"),
    emptyState: document.getElementById("newsEmptyState"),
    emptyAddBtn: document.getElementById("newsEmptyAddBtn"),
    toastRegion: document.getElementById("newsToastRegion"),
    draftBanner: document.getElementById("newsDraftBanner"),
    draftDismiss: document.getElementById("newsDraftDismiss"),
    deleteModal: document.getElementById("newsDeleteModal"),
    deleteSummary: document.getElementById("newsDeleteSummary"),
    deleteConfirm: document.getElementById("newsDeleteConfirm"),
    previewModal: document.getElementById("newsPreviewModal"),
    previewContent: document.getElementById("newsPreviewContent"),
    previewOpenLink: document.getElementById("newsPreviewOpenLink"),
    editorNewBtn: document.getElementById("newsEditorNewBtn"),
    saveDraftBtn: document.getElementById("newsSaveDraftBtn"),
    previewBtn: document.getElementById("newsPreviewBtn"),
    publishBtn: document.getElementById("newsPublishBtn"),
    draftBadge: document.getElementById("newsDraftBadge"),
    autosaveStatus: document.getElementById("newsAutosaveStatus"),
    editorForm: document.getElementById("newsEditorForm"),
    titleInput: document.getElementById("newsTitleInput"),
    slugDisplay: document.getElementById("newsSlugDisplay"),
    slugEditBtn: document.getElementById("newsSlugEditBtn"),
    slugEditor: document.getElementById("newsSlugEditor"),
    slugInput: document.getElementById("newsSlugInput"),
    slugSaveBtn: document.getElementById("newsSlugSaveBtn"),
    slugCancelBtn: document.getElementById("newsSlugCancelBtn"),
    excerptInput: document.getElementById("newsExcerptInput"),
    leadInput: document.getElementById("newsLeadInput"),
    editorTabs: root.querySelectorAll(".news-editor-tab"),
    editorPanes: root.querySelectorAll(".news-editor-pane"),
    editorToolbar: root.querySelector(".news-editor-toolbar"),
    contentEditor: document.getElementById("newsContentEditor"),
    contentPreview: document.getElementById("newsContentPreview"),
    statusSelect: document.getElementById("newsStatusSelect"),
    visibilitySelect: document.getElementById("newsVisibilitySelect"),
    publishDateInput: document.getElementById("newsPublishDate"),
    coverUrlInput: document.getElementById("newsCoverUrlInput"),
    coverFileInput: document.getElementById("newsCoverFileInput"),
    coverUploadBtn: document.getElementById("newsCoverLoadBtn"),
    coverRemoveBtn: document.getElementById("newsCoverRemoveBtn"),
    coverPreview: document.getElementById("newsCoverPreview"),
    coverFit: document.getElementById("newsCoverFit"),
    coverPosX: document.getElementById("newsCoverPosX"),
    coverPosY: document.getElementById("newsCoverPosY"),
    coverPosXValue: document.getElementById("newsCoverPosXValue"),
    coverPosYValue: document.getElementById("newsCoverPosYValue"),
    cardImageUrlInput: document.getElementById("newsCardImageUrlInput"),
    cardImageFileInput: document.getElementById("newsCardImageFileInput"),
    cardImageLoadBtn: document.getElementById("newsCardImageLoadBtn"),
    cardImageRemoveBtn: document.getElementById("newsCardImageRemoveBtn"),
    cardImagePreview: document.getElementById("newsCardImagePreview"),
    cardImageFit: document.getElementById("newsCardImageFit"),
    cardImagePosX: document.getElementById("newsCardImagePosX"),
    cardImagePosY: document.getElementById("newsCardImagePosY"),
    cardImagePosXValue: document.getElementById("newsCardImagePosXValue"),
    cardImagePosYValue: document.getElementById("newsCardImagePosYValue"),
    tagsInput: document.getElementById("newsTagsInput"),
    tagsList: document.getElementById("newsTagsList"),
    tagsSuggest: document.getElementById("newsTagsSuggest"),
    categories: root.querySelectorAll("[data-category]"),
    featuredToggle: document.getElementById("newsFeaturedToggle"),
    featuredToggleButton: document.getElementById("newsToggleFeaturedBtn"),
    featuredOrderWrap: document.getElementById("newsFeaturedOrderWrap"),
    featuredOrder: document.getElementById("newsFeaturedOrder"),
    metaTitle: document.getElementById("newsMetaTitle"),
    metaDescription: document.getElementById("newsMetaDescription"),
    metaDescriptionCount: document.getElementById("newsMetaDescriptionCount"),
    metaKeywordsInput: document.getElementById("newsMetaKeywordsInput"),
    metaKeywordsList: document.getElementById("newsMetaKeywordsList"),
    autoTitle: document.getElementById("newsAutoTitle"),
    autoSlug: document.getElementById("newsAutoSlug"),
    autoExcerpt: document.getElementById("newsAutoExcerpt"),
    autoMetaTitle: document.getElementById("newsAutoMetaTitle"),
    autoMetaDescription: document.getElementById("newsAutoMetaDescription"),
    seoTitleCheck: document.getElementById("seoTitleCheck"),
    seoDescCheck: document.getElementById("seoDescCheck"),
    seoSlugCheck: document.getElementById("seoSlugCheck"),
    seoImageCheck: document.getElementById("seoImageCheck"),
    seoTagsCheck: document.getElementById("seoTagsCheck"),
  };

  const STORAGE_KEYS = {
    draft: "portal_news_draft_v1",
    tags: "portal_news_tags_v1",
    tab: "portal_news_tab_v1",
  };

  const state = {
    items: [],
    filtered: [],
    page: 1,
    pageSize: 20,
    currentId: null,
    currentSlugManual: false,
    isLoading: false,
    search: "",
    filters: {
      status: "all",
      featured: "all",
    },
    sort: "updated_desc",
    selected: new Set(),
    editorDirty: false,
    autosaveTimer: null,
    lastAutosave: null,
    tags: [],
    keywords: [],
  };

  let heroImageController = null;
  let cardImageController = null;

  const isLocalEnv = ["localhost", "127.0.0.1"].includes(window.location.hostname);
  const MOCK_POSTS = [
    {
      id: "mock-1",
      titulo: "LINQ-DFE abre prazo para filiacao",
      resumo: "Comunicado oficial para novas quadrilhas filiadas.",
      imagemCapaUrl: "",
      tags: ["institucional", "filiacao"],
      status: "publicada",
      conteudo: "<p>Texto de exemplo para o painel.</p>",
      destaqueHome: true,
      dataAtualizacao: new Date(),
      slug: "linq-dfe-abre-prazo-filiacao",
    },
    {
      id: "mock-2",
      titulo: "Calendario de etapas 2026",
      resumo: "Datas preliminares para o circuito.",
      imagemCapaUrl: "",
      tags: ["calendario", "circuito"],
      status: "rascunho",
      conteudo: "<p>Conteudo em rascunho.</p>",
      destaqueHome: false,
      dataAtualizacao: new Date(),
      slug: "calendario-etapas-2026",
    },
  ];

  function slugify(value) {
    if (!value) return "";
    return value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }

  function stripHtml(html) {
    const div = document.createElement("div");
    div.innerHTML = html || "";
    return (div.textContent || "").trim();
  }

  function normalizeAssetPath(value) {
    if (!value) return "";
    if (/^https?:\/\//i.test(value)) return value;
    if (value.startsWith("./") || value.startsWith("/")) return value;
    if (!value.includes("/") && /\.(png|jpe?g|gif|webp|avif)$/i.test(value)) {
      return `./assets/noticias/${value}`;
    }
    return `./${value}`;
  }

  function createImageController({
    urlInput,
    fileInput,
    loadBtn,
    removeBtn,
    preview,
    fitSelect,
    posX,
    posY,
    posXValue,
    posYValue,
    getSlug,
  }) {
    const applyStyle = () => {
      if (!preview) return;
      const fit = fitSelect?.value || "cover";
      const x = Number(posX?.value ?? 50);
      const y = Number(posY?.value ?? 35);
      preview.style.objectFit = fit;
      preview.style.objectPosition = `${x}% ${y}%`;
      if (posXValue) posXValue.textContent = `${x}%`;
      if (posYValue) posYValue.textContent = `${y}%`;
    };

    const setPreview = (url) => {
      if (!preview) return;
      const normalized = normalizeAssetPath(url);
      preview.src = normalized;
      preview.style.display = normalized ? "block" : "none";
      applyStyle();
    };

    const setValues = ({ url = "", fit = "cover", x = 50, y = 35 } = {}) => {
      if (urlInput) urlInput.value = url;
      if (fitSelect) fitSelect.value = fit || "cover";
      if (posX) posX.value = Number.isFinite(x) ? x : 50;
      if (posY) posY.value = Number.isFinite(y) ? y : 35;
      setPreview(url);
    };

    if (urlInput) {
      urlInput.addEventListener("input", () => {
        setPreview(urlInput.value);
        updateSeoChecklist();
        updateAutoDisplay();
      });
    }

    if (loadBtn) {
      loadBtn.addEventListener("click", () => {
        const url = (urlInput?.value || "").trim();
        if (!url) {
          fileInput?.click();
          return;
        }
        setPreview(url);
        updateSeoChecklist();
        updateAutoDisplay();
        showToast("Imagem carregada");
      });
    }

    if (fileInput) {
      fileInput.addEventListener("change", async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        event.target.value = "";
        showToast("Enviando imagem…");
        try {
          const slug = getSlug?.() || "";
          const url = await uploadCoverImage(file, slug);
          if (urlInput) urlInput.value = url;
          setPreview(url);
          updateSeoChecklist();
          updateAutoDisplay();
          showToast("Imagem carregada");
        } catch (err) {
          showToast("Erro ao enviar imagem");
          console.error(err);
        }
      });
    }

    if (removeBtn) {
      removeBtn.addEventListener("click", () => {
        if (urlInput) urlInput.value = "";
        if (preview) preview.style.display = "none";
        updateSeoChecklist();
      });
    }

    if (fitSelect) {
      fitSelect.addEventListener("change", () => {
        applyStyle();
      });
    }

    if (posX) {
      posX.addEventListener("input", () => {
        applyStyle();
      });
    }

    if (posY) {
      posY.addEventListener("input", () => {
        applyStyle();
      });
    }

    return { applyStyle, setPreview, setValues };
  }

  function formatDate(value) {
    if (!value) return "-";
    const date = value.toDate ? value.toDate() : new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function getTimestampValue(value) {
    if (!value) return 0;
    const date = value.toDate ? value.toDate() : value instanceof Date ? value : new Date(value);
    return Number.isNaN(date.getTime()) ? 0 : date.getTime();
  }

  function showToast(message, type = "info") {
    if (!els.toastRegion) return;
    const toast = document.createElement("div");
    toast.className = "news-toast";
    toast.textContent = message;
    if (type === "error") toast.style.background = "#b91c1c";
    els.toastRegion.appendChild(toast);
    setTimeout(() => toast.remove(), 3800);
  }

  function setLoading(flag) {
    state.isLoading = flag;
    if (!els.tableBody) return;
    if (flag) {
      els.tableBody.innerHTML = "";
      for (let i = 0; i < 6; i += 1) {
        const row = document.createElement("tr");
        row.className = "news-skeleton-row";
        row.innerHTML = "<td colspan=\"7\"><div class=\"news-skeleton\"></div></td>";
        els.tableBody.appendChild(row);
      }
    }
  }

  async function listPosts() {
    try {
      const snap = await getDocs(collection(db, "noticias"));
      return snap.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
    } catch (err) {
      if (isLocalEnv) return MOCK_POSTS;
      throw err;
    }
  }

  function mapFromFirestore(raw) {
    const title = raw.titulo || raw.title || "(sem titulo)";
    const slug = raw.slug || slugify(title);
    const heroUrl = raw.imagemHeroUrl || raw.imagemCapaUrl || raw.imagem || "";
    const cardUrl =
      raw.imagemCardUrl ||
      raw.imagemListaUrl ||
      raw.imagemHeroUrl ||
      raw.imagemCapaUrl ||
      raw.imagem ||
      "";
    const heroFit = raw.imagemHeroFit || raw.imagemCapaFit || "cover";
    const cardFit = raw.imagemCardFit || "cover";
    const heroFocoX = Number.isFinite(raw.imagemHeroFocoX)
      ? raw.imagemHeroFocoX
      : Number.isFinite(raw.imagemCapaFocoX)
      ? raw.imagemCapaFocoX
      : 50;
    const heroFocoY = Number.isFinite(raw.imagemHeroFocoY)
      ? raw.imagemHeroFocoY
      : Number.isFinite(raw.imagemCapaFocoY)
      ? raw.imagemCapaFocoY
      : 35;
    const cardFocoX = Number.isFinite(raw.imagemCardFocoX) ? raw.imagemCardFocoX : 50;
    const cardFocoY = Number.isFinite(raw.imagemCardFocoY) ? raw.imagemCardFocoY : 35;
    return {
      id: raw.id,
      title,
      excerpt: raw.subtitulo || raw.resumo || "",
      lead: raw.lead || raw.paragrafoInicial || raw.intro || "",
      coverImageUrl: heroUrl,
      coverImageFit: heroFit,
      coverImageFocalX: heroFocoX,
      coverImageFocalY: heroFocoY,
      cardImageUrl: cardUrl,
      cardImageFit: cardFit,
      cardImageFocalX: cardFocoX,
      cardImageFocalY: cardFocoY,
      tags: Array.isArray(raw.tags) ? raw.tags : [],
      status: (raw.status || "rascunho").toLowerCase(),
      contentHtml: raw.conteudo || "",
      contentText: raw.conteudoBruto || "",
      featuredHome: !!raw.destaqueHome,
      featuredOrder: raw.destaqueOrdem || "",
      updatedAt: raw.dataAtualizacao || raw.updatedAt,
      publishedAt: raw.dataPublicacao || raw.publishedAt,
      createdAt: raw.dataCriacao || raw.createdAt,
      slug,
      visibility: raw.visibilidade || "publica",
      categories: Array.isArray(raw.categorias) ? raw.categorias : [],
      seo: {
        metaTitle: raw.seo?.metaTitle || "",
        metaDescription: raw.seo?.metaDescription || "",
        keywords: Array.isArray(raw.seo?.keywords) ? raw.seo.keywords : [],
      },
    };
  }

  function buildPayload(post) {
    return {
      titulo: post.title,
      resumo: post.excerpt || null,
      subtitulo: post.excerpt || null,
      lead: post.lead || null,
      imagemCapaUrl: post.coverImageUrl || null,
      imagemHeroUrl: post.coverImageUrl || null,
      imagemHeroFit: post.coverImageFit || "cover",
      imagemHeroFocoX: Number.isFinite(post.coverImageFocalX) ? post.coverImageFocalX : 50,
      imagemHeroFocoY: Number.isFinite(post.coverImageFocalY) ? post.coverImageFocalY : 35,
      imagemCardUrl: post.cardImageUrl || null,
      imagemCardFit: post.cardImageFit || "cover",
      imagemCardFocoX: Number.isFinite(post.cardImageFocalX) ? post.cardImageFocalX : 50,
      imagemCardFocoY: Number.isFinite(post.cardImageFocalY) ? post.cardImageFocalY : 35,
      imagemCapaFit: post.coverImageFit || "cover",
      imagemCapaFocoX: Number.isFinite(post.coverImageFocalX) ? post.coverImageFocalX : 50,
      imagemCapaFocoY: Number.isFinite(post.coverImageFocalY) ? post.coverImageFocalY : 35,
      tags: post.tags || [],
      status: post.status || "rascunho",
      conteudo: post.contentHtml || "",
      conteudoBruto: stripHtml(post.contentHtml || ""),
      destaqueHome: !!post.featuredHome,
      destaqueOrdem: post.featuredOrder || null,
      slug: post.slug || "",
      visibilidade: post.visibility || "publica",
      categorias: post.categories || [],
      seo: {
        metaTitle: post.seo?.metaTitle || "",
        metaDescription: post.seo?.metaDescription || "",
        keywords: post.seo?.keywords || [],
      },
      dataAtualizacao: serverTimestamp(),
    };
  }

  async function createPost(payload) {
    const data = {
      ...payload,
      dataCriacao: serverTimestamp(),
    };
    if (payload.status === "publicada") {
      data.dataPublicacao = serverTimestamp();
    }
    const ref = await addDoc(collection(db, "noticias"), data);
    return ref.id;
  }

  async function updatePost(id, payload) {
    const ref = doc(db, "noticias", id);
    const existing = await getDoc(ref);
    const current = existing.exists() ? existing.data() : {};
    const data = { ...payload };
    if (payload.status === "publicada" && !current?.dataPublicacao) {
      data.dataPublicacao = serverTimestamp();
    }
    await setDoc(ref, data, { merge: true });
  }

  async function deletePost(id) {
    await deleteDoc(doc(db, "noticias", id));
  }

  async function uploadCoverImage(file, slugText) {
    const extension = file.name.split(".").pop();
    const unique = `${Date.now()}-${Math.round(Math.random() * 1000)}`;
    const filename = `${slugText || "noticia"}-${unique}.${extension}`;
    const path = `news-covers/${filename}`;
    const ref = storageRef(storage, path);
    await uploadBytes(ref, file);
    return await getDownloadURL(ref);
  }

  function applyFilters(items) {
    const search = state.search.toLowerCase();
    return items
      .filter((item) => {
        if (state.filters.status !== "all" && item.status !== state.filters.status) {
          return false;
        }
        if (state.filters.featured === "featured" && !item.featuredHome) {
          return false;
        }
        if (!search) return true;
        return (
          item.title.toLowerCase().includes(search) ||
          item.excerpt.toLowerCase().includes(search) ||
          item.tags.join(" ").toLowerCase().includes(search)
        );
      })
      .sort((a, b) => {
        switch (state.sort) {
          case "title_asc":
            return a.title.localeCompare(b.title, "pt-BR");
          case "title_desc":
            return b.title.localeCompare(a.title, "pt-BR");
          case "updated_asc":
            return getTimestampValue(a.updatedAt) - getTimestampValue(b.updatedAt);
          default:
            return getTimestampValue(b.updatedAt) - getTimestampValue(a.updatedAt);
        }
      });
  }

  function setSelected(id, checked) {
    if (checked) state.selected.add(id);
    else state.selected.delete(id);
  }

  function renderTable() {
    if (!els.tableBody) return;
    const filtered = applyFilters(state.items);
    state.filtered = filtered;
    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / state.pageSize));
    if (state.page > totalPages) state.page = totalPages;
    const start = (state.page - 1) * state.pageSize;
    const pageItems = filtered.slice(start, start + state.pageSize);

    els.tableBody.innerHTML = "";
    if (!pageItems.length) {
      if (els.emptyState) els.emptyState.hidden = total !== 0;
    } else if (els.emptyState) {
      els.emptyState.hidden = true;
    }

    pageItems.forEach((item) => {
      const tr = document.createElement("tr");
      tr.className = "news-row";
      tr.dataset.id = item.id;
      if (state.selected.has(item.id)) tr.classList.add("is-selected");
      tr.innerHTML = `
        <td><input type=\"checkbox\" data-select-row=\"${item.id}\" ${state.selected.has(item.id) ? "checked" : ""} /></td>
        <td class=\"news-title-cell\">${item.title}</td>
        <td><span class=\"status-pill status-${item.status}\">${item.status}</span></td>
        <td><div class=\"news-tags-cell\">${item.tags.map((tag) => `<span class=\"news-tag-chip\">${tag}</span>`).join("") || "-"}</div></td>
        <td>${formatDate(item.updatedAt)}</td>
        <td>${item.featuredHome ? "Sim" : "Nao"}</td>
        <td>
          <div class=\"news-actions\">
            <button class=\"btn btn-light\" type=\"button\" data-action=\"edit\" data-id=\"${item.id}\">Editar</button>
            <button class=\"btn btn-light\" type=\"button\" data-action=\"view\" data-id=\"${item.id}\">Visualizar</button>
            <button class=\"btn btn-light\" type=\"button\" data-action=\"duplicate\" data-id=\"${item.id}\">Duplicar</button>
            ${item.status !== "publicada" ? `<button class=\"btn\" type=\"button\" data-action=\"publish\" data-id=\"${item.id}\">Publicar</button>` : `<button class=\"btn btn-light\" type=\"button\" disabled>Publicada</button>`}
            <button class=\"btn btn-outline\" type=\"button\" data-action=\"delete\" data-id=\"${item.id}\">Excluir</button>
          </div>
        </td>
      `;
      els.tableBody.appendChild(tr);
    });

    if (els.paginationInfo) {
      els.paginationInfo.textContent = `${total} itens`;
    }
    if (els.pageLabel) {
      els.pageLabel.textContent = `${state.page} / ${totalPages}`;
    }
    if (els.prevPageBtn) els.prevPageBtn.disabled = state.page <= 1;
    if (els.nextPageBtn) els.nextPageBtn.disabled = state.page >= totalPages;
  }

  function updateSlugDisplay(value) {
    if (els.slugDisplay) {
      els.slugDisplay.textContent = `/noticias/${value || ""}`;
    }
    if (els.autoSlug) {
      els.autoSlug.textContent = value ? `/noticias/${value}` : "-";
    }
  }

  function updateAutoDisplay() {
    const title = (els.titleInput?.value || "").trim();
    const slug = (els.slugInput?.value || "").trim();
    const excerpt = (els.excerptInput?.value || "").trim();
    const metaTitle = (els.metaTitle?.value || "").trim();
    const metaDesc = (els.metaDescription?.value || "").trim();

    if (els.autoTitle) els.autoTitle.textContent = title || "-";
    if (els.autoExcerpt) els.autoExcerpt.textContent = excerpt || "-";
    if (els.autoMetaTitle) els.autoMetaTitle.textContent = metaTitle || "-";
    if (els.autoMetaDescription) els.autoMetaDescription.textContent = metaDesc || "-";
    updateSlugDisplay(slug);
  }

  function updateFeaturedButton() {
    if (!els.featuredToggleButton || !els.featuredToggle) return;
    const active = !!els.featuredToggle.checked;
    els.featuredToggleButton.textContent = active
      ? "Remover destaque da home"
      : "Enviar para destaque na home";
    els.featuredToggleButton.setAttribute("aria-pressed", active ? "true" : "false");
    els.featuredToggleButton.classList.toggle("btn-outline", !active);
  }

  function setEditorData(post) {
    state.currentId = post?.id || null;
    state.currentSlugManual = !!post?.slug;
    state.tags = [...(post?.tags || [])];
    state.keywords = [...(post?.seo?.keywords || [])];

    if (els.titleInput) els.titleInput.value = post?.title || "";
    if (els.excerptInput) els.excerptInput.value = post?.excerpt || "";
    if (els.leadInput) els.leadInput.value = post?.lead || "";
    if (els.contentEditor) els.contentEditor.innerHTML = post?.contentHtml || "";
    if (els.statusSelect) els.statusSelect.value = post?.status || "rascunho";
    if (els.visibilitySelect) els.visibilitySelect.value = post?.visibility || "publica";
    if (els.publishDateInput) {
      const date = post?.publishedAt?.toDate ? post.publishedAt.toDate() : post?.publishedAt;
      if (date instanceof Date && !Number.isNaN(date.getTime())) {
        els.publishDateInput.value = date.toISOString().slice(0, 16);
      } else {
        els.publishDateInput.value = "";
      }
    }
    if (heroImageController) {
      heroImageController.setValues({
        url: post?.coverImageUrl || "",
        fit: post?.coverImageFit || "cover",
        x: Number.isFinite(post?.coverImageFocalX) ? post.coverImageFocalX : 50,
        y: Number.isFinite(post?.coverImageFocalY) ? post.coverImageFocalY : 35,
      });
    } else if (els.coverUrlInput) {
      els.coverUrlInput.value = post?.coverImageUrl || "";
    }

    if (cardImageController) {
      cardImageController.setValues({
        url: post?.cardImageUrl || post?.coverImageUrl || "",
        fit: post?.cardImageFit || post?.coverImageFit || "cover",
        x: Number.isFinite(post?.cardImageFocalX)
          ? post.cardImageFocalX
          : Number.isFinite(post?.coverImageFocalX)
          ? post.coverImageFocalX
          : 50,
        y: Number.isFinite(post?.cardImageFocalY)
          ? post.cardImageFocalY
          : Number.isFinite(post?.coverImageFocalY)
          ? post.coverImageFocalY
          : 35,
      });
    } else if (els.cardImageUrlInput) {
      els.cardImageUrlInput.value = post?.cardImageUrl || post?.coverImageUrl || "";
    }
    if (els.featuredToggle) els.featuredToggle.checked = !!post?.featuredHome;
    if (els.featuredOrder) els.featuredOrder.value = post?.featuredOrder || "";
    if (els.featuredOrderWrap) els.featuredOrderWrap.hidden = !post?.featuredHome;
    updateFeaturedButton();
    if (els.metaTitle) els.metaTitle.value = post?.seo?.metaTitle || "";
    if (els.metaDescription) els.metaDescription.value = post?.seo?.metaDescription || "";
    if (els.metaDescriptionCount && els.metaDescription) {
      els.metaDescriptionCount.textContent = `${els.metaDescription.value.length}`;
    }
    if (els.metaKeywordsInput) els.metaKeywordsInput.value = "";
    if (els.slugInput) els.slugInput.value = post?.slug || "";
    updateSlugDisplay(post?.slug || "");

    if (els.categories) {
      els.categories.forEach((input) => {
        input.checked = post?.categories?.includes(input.value) || false;
      });
    }

    renderTags();
    renderKeywords();
    updatePreview();
    updateSeoChecklist();
    updateAutoDisplay();
    updateAutosaveStatus("Autosave desativado");
    updateEditorStatus();
    state.editorDirty = false;
  }

  function updateEditorStatus() {
    const status = els.statusSelect?.value || "rascunho";
    if (els.draftBadge) {
      els.draftBadge.className = `status-pill status-${status}`;
      els.draftBadge.textContent = status;
    }
    if (els.publishBtn) {
      els.publishBtn.textContent = state.currentId ? "Atualizar" : "Publicar";
    }
  }

  function serializeEditor() {
    const title = (els.titleInput?.value || "").trim();
    const slug = (els.slugInput?.value || slugify(title)).trim();
    const contentHtml = els.contentEditor?.innerHTML || "";
    const heroUrl = (els.coverUrlInput?.value || "").trim();
    const heroFit = els.coverFit?.value || "cover";
    const heroPosX = Number(els.coverPosX?.value ?? 50);
    const heroPosY = Number(els.coverPosY?.value ?? 35);
    const cardUrl = (els.cardImageUrlInput?.value || "").trim() || heroUrl;
    const cardFit = els.cardImageFit?.value || heroFit;
    const cardPosX = Number(els.cardImagePosX?.value ?? heroPosX);
    const cardPosY = Number(els.cardImagePosY?.value ?? heroPosY);
    const categories = Array.from(els.categories || [])
      .filter((input) => input.checked)
      .map((input) => input.value);
    return {
      id: state.currentId,
      title,
      slug,
      excerpt: (els.excerptInput?.value || "").trim(),
      lead: (els.leadInput?.value || "").trim(),
      contentHtml,
      status: els.statusSelect?.value || "rascunho",
      visibility: els.visibilitySelect?.value || "publica",
      publishedAt: els.publishDateInput?.value ? new Date(els.publishDateInput.value) : null,
      coverImageUrl: heroUrl,
      coverImageFit: heroFit,
      coverImageFocalX: heroPosX,
      coverImageFocalY: heroPosY,
      cardImageUrl: cardUrl,
      cardImageFit: cardFit,
      cardImageFocalX: cardPosX,
      cardImageFocalY: cardPosY,
      featuredHome: !!els.featuredToggle?.checked,
      featuredOrder: els.featuredOrder?.value || "",
      tags: [...state.tags],
      categories,
      seo: {
        metaTitle: (els.metaTitle?.value || "").trim(),
        metaDescription: (els.metaDescription?.value || "").trim(),
        keywords: [...state.keywords],
      },
    };
  }

  function updatePreview() {
    if (!els.contentPreview || !els.contentEditor) return;
    els.contentPreview.innerHTML = els.contentEditor.innerHTML || "<p>Sem conteudo.</p>";
  }

  function renderTags() {
    if (!els.tagsList) return;
    els.tagsList.innerHTML = state.tags
      .map((tag) => `<span class=\"news-tag-chip\" data-tag=\"${tag}\">${tag}</span>`)
      .join("");
  }

  function renderKeywords() {
    if (!els.metaKeywordsList) return;
    els.metaKeywordsList.innerHTML = state.keywords
      .map((tag) => `<span class=\"news-tag-chip\" data-keyword=\"${tag}\">${tag}</span>`)
      .join("");
  }

  function syncKeywordsFromTags() {
    if (state.keywords.length) return;
    if (!state.tags.length) return;
    state.keywords = [...state.tags];
    renderKeywords();
  }

  function updateSeoChecklist() {
    const titleOk = (els.metaTitle?.value || "").trim().length >= 15;
    const descOk = (els.metaDescription?.value || "").trim().length >= 50;
    const slugOk = (els.slugInput?.value || "").trim().length >= 5;
    const imageOk = (els.coverUrlInput?.value || "").trim().length > 0;
    const tagsOk = state.tags.length > 0;
    toggleCheck(els.seoTitleCheck, titleOk);
    toggleCheck(els.seoDescCheck, descOk);
    toggleCheck(els.seoSlugCheck, slugOk);
    toggleCheck(els.seoImageCheck, imageOk);
    toggleCheck(els.seoTagsCheck, tagsOk);
  }

  function toggleCheck(element, ok) {
    if (!element) return;
    element.classList.toggle("is-ok", ok);
  }

  function markDirty() {
    state.editorDirty = true;
  }

  function updateAutosaveStatus(message) {
    if (els.autosaveStatus) {
      els.autosaveStatus.textContent = message;
    }
  }

  function scheduleAutosave() {
    if (state.autosaveTimer) return;
    state.autosaveTimer = setInterval(() => {
      if (!state.editorDirty) return;
      const payload = serializeEditor();
      const data = { ...payload, savedAt: new Date().toISOString() };
      localStorage.setItem(STORAGE_KEYS.draft, JSON.stringify(data));
      state.editorDirty = false;
      state.lastAutosave = data.savedAt;
      updateAutosaveStatus(`Rascunho salvo as ${new Date(data.savedAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`);
    }, 15000);
  }

  function restoreDraft() {
    const raw = localStorage.getItem(STORAGE_KEYS.draft);
    if (!raw) return;
    try {
      const data = JSON.parse(raw);
      setEditorData({
        ...data,
        id: data.id || null,
        seo: data.seo || { metaTitle: "", metaDescription: "", keywords: [] },
      });
      // Mantem recuperacao do rascunho sem exibir o aviso visual.
      if (els.draftBanner) els.draftBanner.hidden = true;
    } catch (err) {
      console.warn("Draft parse failed", err);
    }
  }

  function clearDraft() {
    localStorage.removeItem(STORAGE_KEYS.draft);
    if (els.draftBanner) els.draftBanner.hidden = true;
  }

  function openModal(modal) {
    if (!modal) return;
    modal.hidden = false;
    const focusable = modal.querySelector("button, a");
    if (focusable) focusable.focus();
  }

  function closeModal(modal) {
    if (!modal) return;
    modal.hidden = true;
  }

  async function loadNews() {
    setLoading(true);
    try {
      const items = await listPosts();
      state.items = items.map(mapFromFirestore);
      state.selected.clear();
      if (els.selectAll) els.selectAll.checked = false;
      renderTable();
    } catch (err) {
      console.error(err);
      showToast("Erro ao carregar noticias", "error");
    } finally {
      setLoading(false);
    }
  }

  async function saveEditor(statusOverride) {
    autoFillFromContent();
    const post = serializeEditor();
    if (!post.title || !post.contentHtml) {
      showToast("Preencha titulo e conteudo", "error");
      return;
    }
    if (statusOverride) post.status = statusOverride;
    const payload = buildPayload(post);
    try {
      if (post.id) {
        await updatePost(post.id, payload);
        showToast("Noticia atualizada");
      } else {
        const newId = await createPost(payload);
        post.id = newId;
        showToast("Noticia criada");
      }
      clearDraft();
      await loadNews();
      const updated = state.items.find((item) => item.id === post.id);
      setEditorData(updated || post);
    } catch (err) {
      console.error(err);
      showToast("Erro ao salvar noticia", "error");
    }
  }

  function openEditorById(id) {
    const post = state.items.find((item) => item.id === id);
    if (!post) return;
    setEditorData(post);
    switchTab("editor");
  }

  function autoFillFromContent() {
    if (!els.contentEditor) return;
    const contentHtml = els.contentEditor.innerHTML || "";
    const text = stripHtml(contentHtml).replace(/\s+/g, " ").trim();
    if (!text) return;

    const title = (els.titleInput?.value || "").trim();

    if (els.excerptInput && !els.excerptInput.value.trim()) {
      let excerptSource = text;
      if (title && excerptSource.startsWith(title)) {
        excerptSource = excerptSource.slice(title.length).trim();
      }
      const excerpt = excerptSource.slice(0, 180).trim();
      els.excerptInput.value = excerpt;
    }

    updateSeoChecklist();
    updateEditorStatus();
    updateAutoDisplay();
  }

  function switchTab(target) {
    if (!els.tabs) return;
    els.tabs.forEach((tab) => {
      const isActive = tab.dataset.target === target;
      tab.classList.toggle("is-active", isActive);
      tab.setAttribute("aria-selected", isActive ? "true" : "false");
    });
    if (els.listPane) els.listPane.classList.toggle("is-active", target === "list");
    if (els.editorPane) els.editorPane.classList.toggle("is-active", target === "editor");
    localStorage.setItem(STORAGE_KEYS.tab, target);
  }

  function applyTabFromStorage() {
    const stored = localStorage.getItem(STORAGE_KEYS.tab);
    if (stored === "editor") {
      switchTab("editor");
    } else {
      switchTab("list");
    }
  }

  function setupTagInput() {
    if (!els.tagsInput) return;
    const history = JSON.parse(localStorage.getItem(STORAGE_KEYS.tags) || "[]");

    const showSuggestions = (value) => {
      if (!els.tagsSuggest) return;
      const query = value.toLowerCase();
      const matches = history.filter((tag) => tag.toLowerCase().includes(query) && !state.tags.includes(tag));
      if (!matches.length) {
        els.tagsSuggest.classList.remove("is-open");
        els.tagsSuggest.innerHTML = "";
        return;
      }
      els.tagsSuggest.innerHTML = matches
        .slice(0, 5)
        .map((tag) => `<div class=\"news-suggest-item\" data-tag=\"${tag}\">${tag}</div>`)
        .join("");
      els.tagsSuggest.classList.add("is-open");
    };

    els.tagsInput.addEventListener("input", (event) => {
      showSuggestions(event.target.value);
      markDirty();
      updateSeoChecklist();
    });

    els.tagsInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === ",") {
        event.preventDefault();
        const value = els.tagsInput.value.replace(/,/g, "").trim();
        if (value && !state.tags.includes(value)) {
          state.tags.push(value);
          history.unshift(value);
          localStorage.setItem(STORAGE_KEYS.tags, JSON.stringify(Array.from(new Set(history))));
          renderTags();
          syncKeywordsFromTags();
          updateSeoChecklist();
        }
        els.tagsInput.value = "";
        els.tagsSuggest.classList.remove("is-open");
      }
    });

    if (els.tagsSuggest) {
      els.tagsSuggest.addEventListener("click", (event) => {
        const tag = event.target.dataset.tag;
        if (!tag) return;
        if (!state.tags.includes(tag)) {
          state.tags.push(tag);
          renderTags();
          syncKeywordsFromTags();
          updateSeoChecklist();
        }
        els.tagsSuggest.classList.remove("is-open");
        els.tagsInput.value = "";
      });
    }
  }

  function setupKeywordInput() {
    if (!els.metaKeywordsInput) return;
    els.metaKeywordsInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === ",") {
        event.preventDefault();
        const value = els.metaKeywordsInput.value.replace(/,/g, "").trim();
        if (value && !state.keywords.includes(value)) {
          state.keywords.push(value);
          renderKeywords();
        }
        els.metaKeywordsInput.value = "";
      }
    });
  }

  function attachEvents() {
    const resetForNew = () => {
      setEditorData({
        title: "",
        excerpt: "",
        lead: "",
        contentHtml: "",
        status: "rascunho",
        visibility: "publica",
        coverImageUrl: "",
        coverImageFit: "cover",
        coverImageFocalX: 50,
        coverImageFocalY: 35,
        cardImageUrl: "",
        cardImageFit: "cover",
        cardImageFocalX: 50,
        cardImageFocalY: 35,
        tags: [],
        categories: [],
        seo: { metaTitle: "", metaDescription: "", keywords: [] },
      });
      state.currentId = null;
      switchTab("editor");
    };

    if (els.addNewBtn) {
      els.addNewBtn.addEventListener("click", () => {
        resetForNew();
      });
    }

    if (els.editorNewBtn) {
      els.editorNewBtn.addEventListener("click", () => {
        resetForNew();
      });
    }

    if (els.emptyAddBtn) {
      els.emptyAddBtn.addEventListener("click", () => {
        resetForNew();
      });
    }

    if (els.reloadBtn) {
      els.reloadBtn.addEventListener("click", () => loadNews());
    }

    if (els.searchInput) {
      let debounceTimer;
      els.searchInput.addEventListener("input", (event) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          state.search = event.target.value.trim();
          state.page = 1;
          renderTable();
        }, 300);
      });
    }

    if (els.statusFilter) {
      els.statusFilter.addEventListener("change", (event) => {
        state.filters.status = event.target.value;
        state.page = 1;
        renderTable();
      });
    }

    if (els.featuredFilter) {
      els.featuredFilter.addEventListener("change", (event) => {
        state.filters.featured = event.target.value;
        state.page = 1;
        renderTable();
      });
    }

    if (els.sortSelect) {
      els.sortSelect.addEventListener("change", (event) => {
        state.sort = event.target.value;
        renderTable();
      });
    }

    if (els.selectAll) {
      els.selectAll.addEventListener("change", (event) => {
        const checked = event.target.checked;
        state.selected.clear();
        if (checked) {
          state.filtered.forEach((item) => state.selected.add(item.id));
        }
        renderTable();
      });
    }

    if (els.tableBody) {
      els.tableBody.addEventListener("click", (event) => {
        const actionBtn = event.target.closest("button[data-action]");
        if (actionBtn) {
          const id = actionBtn.dataset.id;
          const action = actionBtn.dataset.action;
          if (!id) return;
          if (action === "edit") openEditorById(id);
          if (action === "view") openPreview(id);
          if (action === "duplicate") duplicatePost(id);
          if (action === "publish") publishPost(id);
          if (action === "delete") confirmDelete(id);
          event.stopPropagation();
          return;
        }

        const checkbox = event.target.closest("input[data-select-row]");
        if (checkbox) {
          setSelected(checkbox.dataset.selectRow, checkbox.checked);
          renderTable();
          return;
        }
      });
    }

    if (els.bulkApplyBtn) {
      els.bulkApplyBtn.addEventListener("click", async () => {
        const action = els.bulkAction?.value || "";
        if (!action || !state.selected.size) return;
        const ids = Array.from(state.selected);
        if (action === "excluir") {
          confirmDelete(ids);
          return;
        }
        try {
          for (const id of ids) {
            const post = state.items.find((item) => item.id === id);
            if (!post) continue;
            post.status = action === "publicar" ? "publicada" : action === "rascunho" ? "rascunho" : "arquivada";
            await updatePost(id, buildPayload(post));
          }
          showToast("Acoes em massa aplicadas");
          state.selected.clear();
          await loadNews();
        } catch (err) {
          console.error(err);
          showToast("Erro ao aplicar acoes", "error");
        }
      });
    }

    if (els.prevPageBtn) {
      els.prevPageBtn.addEventListener("click", () => {
        state.page = Math.max(1, state.page - 1);
        renderTable();
      });
    }

    if (els.nextPageBtn) {
      els.nextPageBtn.addEventListener("click", () => {
        state.page += 1;
        renderTable();
      });
    }

    if (els.saveDraftBtn) {
      els.saveDraftBtn.addEventListener("click", () => saveEditor("rascunho"));
    }

    if (els.publishBtn) {
      els.publishBtn.addEventListener("click", () => saveEditor(els.statusSelect?.value || "publicada"));
    }

    if (els.previewBtn) {
      els.previewBtn.addEventListener("click", () => openPreview(state.currentId, true));
    }

    if (els.featuredToggleButton) {
      els.featuredToggleButton.addEventListener("click", () => {
        if (!els.featuredToggle) return;
        els.featuredToggle.checked = !els.featuredToggle.checked;
        els.featuredToggle.dispatchEvent(new Event("change", { bubbles: true }));
      });
    }

    if (els.slugEditBtn) {
      els.slugEditBtn.addEventListener("click", () => {
        if (els.slugEditor) els.slugEditor.hidden = false;
        els.slugInput?.focus();
      });
    }

    if (els.slugSaveBtn) {
      els.slugSaveBtn.addEventListener("click", () => {
        const value = slugify(els.slugInput?.value || "");
        if (els.slugInput) els.slugInput.value = value;
        updateSlugDisplay(value);
        state.currentSlugManual = true;
        if (els.slugEditor) els.slugEditor.hidden = true;
        updateSeoChecklist();
        markDirty();
      });
    }

    if (els.slugCancelBtn) {
      els.slugCancelBtn.addEventListener("click", () => {
        if (els.slugEditor) els.slugEditor.hidden = true;
      });
    }

    if (els.titleInput) {
      els.titleInput.addEventListener("input", () => {
        markDirty();
        updateSeoChecklist();
      });
    }

    if (els.slugInput) {
      els.slugInput.addEventListener("input", (event) => {
        state.currentSlugManual = true;
        const value = event.target.value.trim();
        updateSlugDisplay(value);
        updateSeoChecklist();
        markDirty();
      });
    }

    if (els.contentEditor) {
      let fillTimer;
      els.contentEditor.addEventListener("input", () => {
        markDirty();
        updatePreview();
        clearTimeout(fillTimer);
        fillTimer = setTimeout(() => {
          autoFillFromContent();
        }, 400);
      });
    }

    if (els.editorToolbar) {
      els.editorToolbar.addEventListener("click", (event) => {
        const button = event.target.closest("button[data-command]");
        if (!button) return;
        const command = button.dataset.command;
        if (!command) return;
        if (command === "link") {
          const url = window.prompt("URL do link:");
          if (url) document.execCommand("createLink", false, url);
        } else if (command === "h2" || command === "h3") {
          document.execCommand("formatBlock", false, command === "h2" ? "H2" : "H3");
        } else if (command === "ul") {
          document.execCommand("insertUnorderedList");
        } else if (command === "quote") {
          document.execCommand("formatBlock", false, "BLOCKQUOTE");
        } else {
          document.execCommand(command);
        }
        updatePreview();
        markDirty();
      });
    }

    if (els.editorTabs) {
      els.editorTabs.forEach((tab) => {
        tab.addEventListener("click", () => {
          const target = tab.dataset.tab;
          els.editorTabs.forEach((btn) => btn.classList.toggle("is-active", btn === tab));
          els.editorPanes.forEach((pane) => pane.classList.toggle("is-active", pane.dataset.pane === target));
          if (target === "preview") updatePreview();
        });
      });
    }

    if (els.statusSelect) {
      els.statusSelect.addEventListener("change", () => {
        updateEditorStatus();
        markDirty();
      });
    }

    if (els.featuredToggle) {
      els.featuredToggle.addEventListener("change", () => {
        if (els.featuredOrderWrap) els.featuredOrderWrap.hidden = !els.featuredToggle.checked;
        markDirty();
        updateFeaturedButton();
      });
    }

    if (els.metaDescription) {
      els.metaDescription.addEventListener("input", () => {
        if (els.metaDescriptionCount) {
          els.metaDescriptionCount.textContent = `${els.metaDescription.value.length}`;
        }
        updateSeoChecklist();
        updateAutoDisplay();
      });
    }

    if (els.metaTitle) {
      els.metaTitle.addEventListener("input", () => {
        updateSeoChecklist();
        updateAutoDisplay();
      });
    }

    heroImageController = createImageController({
      urlInput: els.coverUrlInput,
      fileInput: els.coverFileInput,
      loadBtn: els.coverUploadBtn,
      removeBtn: els.coverRemoveBtn,
      preview: els.coverPreview,
      fitSelect: els.coverFit,
      posX: els.coverPosX,
      posY: els.coverPosY,
      posXValue: els.coverPosXValue,
      posYValue: els.coverPosYValue,
      getSlug: () => els.slugInput?.value || slugify(els.titleInput?.value || ""),
    });

    cardImageController = createImageController({
      urlInput: els.cardImageUrlInput,
      fileInput: els.cardImageFileInput,
      loadBtn: els.cardImageLoadBtn,
      removeBtn: els.cardImageRemoveBtn,
      preview: els.cardImagePreview,
      fitSelect: els.cardImageFit,
      posX: els.cardImagePosX,
      posY: els.cardImagePosY,
      posXValue: els.cardImagePosXValue,
      posYValue: els.cardImagePosYValue,
      getSlug: () => els.slugInput?.value || slugify(els.titleInput?.value || ""),
    });

    const syncCardFromHero = () => {
      if (!els.cardImageUrlInput || !els.coverUrlInput) return;
      if (els.cardImageUrlInput.value.trim()) return;
      const heroUrl = els.coverUrlInput.value.trim();
      if (!heroUrl) return;
      els.cardImageUrlInput.value = heroUrl;
      if (cardImageController) {
        cardImageController.setValues({
          url: heroUrl,
          fit: els.cardImageFit?.value || els.coverFit?.value || "cover",
          x: Number(els.cardImagePosX?.value ?? 50),
          y: Number(els.cardImagePosY?.value ?? 35),
        });
      }
    };

    if (els.coverUrlInput) {
      els.coverUrlInput.addEventListener("input", syncCardFromHero);
    }
    if (els.coverFileInput) {
      els.coverFileInput.addEventListener("change", syncCardFromHero);
    }

    if (els.tagsList) {
      els.tagsList.addEventListener("click", (event) => {
        const tag = event.target.dataset.tag;
        if (!tag) return;
        state.tags = state.tags.filter((item) => item !== tag);
        renderTags();
        updateSeoChecklist();
      });
    }

    if (els.metaKeywordsList) {
      els.metaKeywordsList.addEventListener("click", (event) => {
        const tag = event.target.dataset.keyword;
        if (!tag) return;
        state.keywords = state.keywords.filter((item) => item !== tag);
        renderKeywords();
      });
    }

    if (els.draftDismiss) {
      els.draftDismiss.addEventListener("click", () => clearDraft());
    }

    if (els.deleteModal) {
      els.deleteModal.addEventListener("click", (event) => {
        if (event.target.matches("[data-modal-close]")) {
          closeModal(els.deleteModal);
        }
      });
    }

    if (els.previewModal) {
      els.previewModal.addEventListener("click", (event) => {
        if (event.target.matches("[data-modal-close]")) {
          closeModal(els.previewModal);
        }
      });
    }

    if (els.tabs) {
      els.tabs.forEach((tab) => {
        tab.addEventListener("click", () => {
          switchTab(tab.dataset.target);
        });
      });
    }
  }

  function confirmDelete(idOrIds) {
    const ids = Array.isArray(idOrIds) ? idOrIds : [idOrIds];
    const first = state.items.find((item) => item.id === ids[0]);
    if (els.deleteSummary) {
      els.deleteSummary.textContent = first
        ? `${first.title} - ${first.excerpt || "Sem resumo"}`
        : "Confirma a exclusao das noticias selecionadas?";
    }
    if (els.deleteConfirm) {
      els.deleteConfirm.onclick = async () => {
        try {
          for (const id of ids) {
            await deletePost(id);
          }
          showToast("Noticia excluida");
          closeModal(els.deleteModal);
          state.selected.clear();
          await loadNews();
        } catch (err) {
          console.error(err);
          showToast("Erro ao excluir", "error");
        }
      };
    }
    openModal(els.deleteModal);
  }

  function openPreview(id, useEditor = false) {
    const post = useEditor ? serializeEditor() : state.items.find((item) => item.id === id);
    if (!post || !els.previewContent) return;
    const title = post.title || "Sem titulo";
    const excerpt = post.excerpt || "";
    const image = post.coverImageUrl;
    const html = post.contentHtml || "<p>Sem conteudo.</p>";
    els.previewContent.innerHTML = `
      ${image ? `<img src=\"${image}\" alt=\"${title}\" style=\"width:100%; border-radius:12px; margin-bottom:12px;\" />` : ""}
      <h2>${title}</h2>
      <p>${excerpt}</p>
      <div>${html}</div>
    `;
    if (els.previewOpenLink) {
      const slug = post.slug || slugify(title);
      els.previewOpenLink.href =
        post.status === "publicada" && slug
          ? `/noticias/${encodeURIComponent(slug)}/`
          : `/noticia.html?slug=${encodeURIComponent(slug)}`;
    }
    openModal(els.previewModal);
  }

  function duplicatePost(id) {
    const post = state.items.find((item) => item.id === id);
    if (!post) return;
    const copy = {
      ...post,
      id: null,
      title: `${post.title} (copia)`,
      slug: `${post.slug}-copia`,
    };
    setEditorData(copy);
    switchTab("editor");
    showToast("Copia criada. Ajuste antes de publicar.");
  }

  async function publishPost(id) {
    const post = state.items.find((item) => item.id === id);
    if (!post) return;
    try {
      post.status = "publicada";
      await updatePost(id, buildPayload(post));
      showToast("Noticia publicada");
      await loadNews();
    } catch (err) {
      console.error(err);
      showToast("Erro ao publicar", "error");
    }
  }

  function init() {
    attachEvents();
    setupTagInput();
    setupKeywordInput();
    scheduleAutosave();
    applyTabFromStorage();
    restoreDraft();
    loadNews();
  }

  init();
})();
