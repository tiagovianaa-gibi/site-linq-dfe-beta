const previewFrame = document.getElementById('presentation-preview');
const stageRatioSelect = document.getElementById('stage-ratio');
const stageWidthInput = document.getElementById('stage-width');
const stageHeightInput = document.getElementById('stage-height');
const stageWidthValue = document.getElementById('stage-width-value');
const stageHeightValue = document.getElementById('stage-height-value');
const currentSlideLabel = document.getElementById('slide-current');
const quesitosMenu = document.getElementById('quesitos-menu');
const photoControls = document.getElementById('photo-controls');
const goCoverButton = document.getElementById('go-cover');
const reloadPreviewButton = document.getElementById('go-current-preview');

const OPERATOR_STORAGE_KEY = 'trofeu-operator-config-v1';
const SLIDE_TYPE_LABELS = {
  capa: 'Capa',
  quesito: 'Abertura',
  participantes: 'Participantes',
  suspense: 'Suspense',
  vencedor: 'Vencedor',
  'resumo-final': 'Vencedores 2025',
  'entrada-acesso-2026': 'Entrada 2026',
  'grupos-fotos-2026': 'Grupos 2026',
  'parceiros-liga': 'Parceiros',
  agradecimentos: 'Agradecimento'
};

const state = {
  api: null,
  previewWindow: null,
  config: null,
  slides: [],
  currentIndex: 0,
  currentPhotos: [],
  pendingLocalRefreshes: 0
};

function cloneData(data) {
  return JSON.parse(JSON.stringify(data));
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function setStatus(text) {
  currentSlideLabel.textContent = text;
}

function safeNumber(value, fallback) {
  const next = Number(value);
  return Number.isFinite(next) ? next : fallback;
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForPreviewApi(retries = 120) {
  for (let attempt = 0; attempt < retries; attempt += 1) {
    const frameWindow = previewFrame.contentWindow;
    const api = frameWindow?.TrofeuPresentationAPI;
    if (api) {
      return { api, frameWindow };
    }
    await wait(150);
  }

  throw new Error('API da apresentação não carregou.');
}

function formatPercent(value) {
  return `${Math.round(value)}%`;
}

function formatScale(value) {
  return `${Math.round(value)}%`;
}

function buildMenuGroups(slides) {
  const groups = [];
  const lookup = new Map();

  slides.forEach((slide) => {
    const key = slide.quesitoNumero === null ? 'capa' : `quesito-${slide.quesitoNumero}`;
    if (!lookup.has(key)) {
      const title = slide.quesitoNumero === null
        ? 'Geral'
        : `${slide.quesitoNumero}. ${slide.quesitoNome}`;
      const group = { key, title, items: [] };
      lookup.set(key, group);
      groups.push(group);
    }

    lookup.get(key).items.push(slide);
  });

  return groups;
}

function renderMenu() {
  if (!state.slides.length) {
    quesitosMenu.innerHTML = '<p class="empty-state">A apresentação ainda não carregou.</p>';
    return;
  }

  const groups = buildMenuGroups(state.slides);
  quesitosMenu.innerHTML = groups.map((group) => `
    <section class="menu-group">
      <h3 class="menu-group-title">${group.title}</h3>
      <div class="menu-buttons">
        ${group.items.map((item) => `
          <button
            type="button"
            data-slide-index="${item.index}"
            class="${item.index === state.currentIndex ? 'active' : ''}"
          >
            ${SLIDE_TYPE_LABELS[item.tipo] || item.tipo}
          </button>
        `).join('')}
      </div>
    </section>
  `).join('');
}

function updateActiveMenuButton() {
  const buttons = quesitosMenu.querySelectorAll('button[data-slide-index]');
  buttons.forEach((button) => {
    button.classList.toggle('active', Number(button.dataset.slideIndex) === state.currentIndex);
  });
}

function renderStageControls() {
  if (!state.config) return;

  const width = clamp(safeNumber(state.config.stage?.width, 100), 40, 100);
  const height = clamp(safeNumber(state.config.stage?.height, 100), 40, 100);
  const ratio = state.config.stage?.ratio || 'auto';

  stageRatioSelect.value = ratio;
  stageWidthInput.value = String(width);
  stageHeightInput.value = String(height);
  stageWidthValue.textContent = formatPercent(width);
  stageHeightValue.textContent = formatPercent(height);
}

function updateCurrentSlideLabel() {
  const slide = state.slides.find((item) => item.index === state.currentIndex);
  if (!slide) {
    setStatus('Slide atual indisponível.');
    return;
  }

  setStatus(`Slide atual: ${slide.title}`);
}

function createEmptyPhotoState(message) {
  photoControls.innerHTML = `<p class="empty-state">${message}</p>`;
}

function applyConfig(nextConfig, options = {}) {
  if (!state.api) return;

  state.config = cloneData(nextConfig);
  if (!options.skipPreviewApply) {
    state.pendingLocalRefreshes += 1;
    state.config = state.api.applyConfig(state.config);
  }

  renderStageControls();
}

function updateStageConfig(field, value) {
  if (!state.config) return;

  const nextConfig = cloneData(state.config);
  nextConfig.stage = nextConfig.stage || {};
  nextConfig.stage[field] = value;
  applyConfig(nextConfig);
}

function ensurePhotoOverride(nextConfig, key) {
  nextConfig.photos = nextConfig.photos || {};
  nextConfig.photos[key] = nextConfig.photos[key] || {};
  return nextConfig.photos[key];
}

function updatePhotoOverride(key, field, value) {
  if (!state.config) return;

  const nextConfig = cloneData(state.config);
  const override = ensurePhotoOverride(nextConfig, key);

  if (field === 'x' || field === 'y') {
    override[field] = `${value}%`;
  } else if (field === 'scaleX' || field === 'scaleY') {
    override[field] = String(value / 100);
  } else if (field === 'fit') {
    override.fit = value;
  }

  applyConfig(nextConfig);
}

function resetPhotoOverride(key) {
  if (!state.config?.photos?.[key]) return;

  const nextConfig = cloneData(state.config);
  delete nextConfig.photos[key];
  applyConfig(nextConfig);
  renderPhotoControls();
}

function buildSliderField({ label, value, min, max, step, field, format }) {
  return `
    <div class="slider-field">
      <label>
        <span>${label}</span>
        <output>${format(value)}</output>
      </label>
      <input
        type="range"
        min="${min}"
        max="${max}"
        step="${step}"
        value="${value}"
        data-field="${field}"
      />
    </div>
  `;
}

function renderPhotoControls() {
  if (!state.currentPhotos.length) {
    createEmptyPhotoState('Esse slide não tem fotos editáveis.');
    return;
  }

  photoControls.innerHTML = state.currentPhotos.map((photo) => `
    <article class="photo-card" data-photo-key="${photo.key}">
      <h3>${photo.nome}</h3>
      <p class="photo-meta">${photo.grupo} · ${SLIDE_TYPE_LABELS[photo.slideType] || photo.slideType}</p>
      <div class="slider-grid">
        ${buildSliderField({
          label: 'Posição X',
          value: clamp(photo.x, -50, 150),
          min: -50,
          max: 150,
          step: 1,
          field: 'x',
          format: formatPercent
        })}
        ${buildSliderField({
          label: 'Posição Y',
          value: clamp(photo.y, -50, 150),
          min: -50,
          max: 150,
          step: 1,
          field: 'y',
          format: formatPercent
        })}
        ${buildSliderField({
          label: 'Largura',
          value: clamp(photo.scaleX, 50, 180),
          min: 50,
          max: 180,
          step: 1,
          field: 'scaleX',
          format: formatScale
        })}
        ${buildSliderField({
          label: 'Altura',
          value: clamp(photo.scaleY, 50, 180),
          min: 50,
          max: 180,
          step: 1,
          field: 'scaleY',
          format: formatScale
        })}
      </div>
      <label class="control-field">
        <span>Encaixe</span>
        <select data-field="fit">
          <option value="cover" ${photo.fit === 'cover' ? 'selected' : ''}>Preencher</option>
          <option value="contain" ${photo.fit === 'contain' ? 'selected' : ''}>Conter</option>
        </select>
      </label>
      <div class="photo-actions">
        <button type="button" class="reset-btn" data-action="reset">Resetar foto</button>
      </div>
    </article>
  `).join('');
}

function syncFromPreview(detail = null) {
  if (!state.api) return;

  state.config = state.api.getConfig();
  state.currentIndex = detail?.index ?? state.api.getCurrentIndex();
  state.currentPhotos = detail?.photos ?? state.api.getCurrentSlidePhotos();

  updateCurrentSlideLabel();
  updateActiveMenuButton();
  renderStageControls();
  renderPhotoControls();
}

function handlePreviewSlideChange(event) {
  if (!event?.detail) {
    syncFromPreview();
    return;
  }

  state.currentIndex = event.detail.index;
  state.currentPhotos = event.detail.photos || [];

  if (state.pendingLocalRefreshes > 0) {
    state.pendingLocalRefreshes -= 1;
    state.config = state.api.getConfig();
    updateCurrentSlideLabel();
    updateActiveMenuButton();
    renderStageControls();
    return;
  }

  syncFromPreview(event.detail);
}

async function bootPreviewConnection() {
  setStatus('Conectando ao preview...');

  const { api, frameWindow } = await waitForPreviewApi();
  state.api = api;

  if (state.previewWindow && state.previewWindow !== frameWindow) {
    state.previewWindow.removeEventListener('trofeu:slidechange', handlePreviewSlideChange);
  }

  state.previewWindow = frameWindow;
  state.previewWindow.removeEventListener('trofeu:slidechange', handlePreviewSlideChange);
  state.previewWindow.addEventListener('trofeu:slidechange', handlePreviewSlideChange);

  state.slides = state.api.getSlidesMeta();
  renderMenu();
  syncFromPreview();
}

function handleMenuClick(event) {
  const button = event.target.closest('button[data-slide-index]');
  if (!button || !state.api) return;
  state.api.goTo(Number(button.dataset.slideIndex));
}

function handlePhotoControlsInput(event) {
  const input = event.target;
  const card = input.closest('.photo-card');
  if (!card) return;

  const field = input.dataset.field;
  if (!field || field === 'fit') return;

  const value = Number(input.value);
  const output = input.parentElement.querySelector('output');
  if (output) {
    output.textContent = field === 'scaleX' || field === 'scaleY'
      ? formatScale(value)
      : formatPercent(value);
  }

  updatePhotoOverride(card.dataset.photoKey, field, value);
}

function handlePhotoControlsChange(event) {
  const input = event.target;
  const card = input.closest('.photo-card');
  if (!card) return;

  if (input.dataset.field === 'fit') {
    updatePhotoOverride(card.dataset.photoKey, 'fit', input.value);
    return;
  }

  if (input.dataset.action === 'reset') {
    resetPhotoOverride(card.dataset.photoKey);
  }
}

function handleStageControlInput() {
  stageWidthValue.textContent = formatPercent(Number(stageWidthInput.value));
  stageHeightValue.textContent = formatPercent(Number(stageHeightInput.value));
}

function bindEvents() {
  previewFrame.addEventListener('load', () => {
    bootPreviewConnection().catch((error) => {
      setStatus(error.message || 'Não foi possível carregar o preview.');
    });
  });

  quesitosMenu.addEventListener('click', handleMenuClick);
  photoControls.addEventListener('input', handlePhotoControlsInput);
  photoControls.addEventListener('change', handlePhotoControlsChange);
  photoControls.addEventListener('click', handlePhotoControlsChange);

  stageRatioSelect.addEventListener('change', () => {
    updateStageConfig('ratio', stageRatioSelect.value);
  });

  stageWidthInput.addEventListener('input', () => {
    handleStageControlInput();
    updateStageConfig('width', Number(stageWidthInput.value));
  });

  stageHeightInput.addEventListener('input', () => {
    handleStageControlInput();
    updateStageConfig('height', Number(stageHeightInput.value));
  });

  goCoverButton.addEventListener('click', () => {
    state.api?.goTo(0);
  });

  reloadPreviewButton.addEventListener('click', () => {
    previewFrame.contentWindow?.location.reload();
  });

  window.addEventListener('storage', (event) => {
    if (event.key !== OPERATOR_STORAGE_KEY || !state.api) return;
    syncFromPreview();
  });
}

async function init() {
  bindEvents();

  try {
    await bootPreviewConnection();
  } catch (error) {
    setStatus(error.message || 'Não foi possível carregar o preview.');
  }
}

init();
