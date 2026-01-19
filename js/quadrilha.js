/* ============================================
   QUADRILHA.JS - Página de perfil da quadrilha
   ============================================ */
import {
  loadJSON,
  getQuadrilhaPhotoCandidates,
  applyImageCandidates,
  applyFocal,
  normalize,
  normalizeImageUrl,
  setActiveNav
} from './shared.js';

/** Lê ?id=123 (prioritário) ou ?slug=... como fallback */
function getKeyFromUrl() {
  const p = new URLSearchParams(window.location.search);
  const id = p.get('id');
  const slugFromQuery = p.get('slug') || p.get('q');
  const slugFromPage = window.__QUADRILHA_SLUG__;
  const slug = slugFromQuery || slugFromPage;
  return { id: id ? Number(id) : null, slug: slug || null };
}

/** Junta histórico próprio + arquivo de anos anteriores */
function buildHistorico(quad, historicoCircuito) {
  const out = [];

  // do próprio objeto
  if (Array.isArray(quad.historico)) {
    quad.historico.forEach(h => {
      out.push({
        ano: h.ano,
        grupo: h.grupo || quad.grupo || null,
        pos: h.pos,
        total: h.pontos ?? h.total ?? null,
      });
    });
  } else if (quad.pontos2025 && quad.posicao_2025) {
    out.push({
      ano: 2025,
      grupo: quad.grupo || null,
      pos: quad.posicao_2025,
      total: quad.pontos2025,
    });
  }

  // 2024-2022 do arquivo
  const anos = [2024, 2023, 2022];
  const hc = historicoCircuito || {};
  anos.forEach(ano => {
    const dataAno = hc[String(ano)];
    if (!dataAno) return;

    ['acesso', 'especial'].forEach(grupoKey => {
      const lista = dataAno[grupoKey];
      if (!Array.isArray(lista)) return;
      const achou = lista.find(item => item.quadrilha === quad.nome);
      if (achou) {
        out.push({
          ano,
          grupo: grupoKey === 'acesso' ? 'Acesso' : 'Especial',
          pos: achou.pos,
          total: achou.total,
          status: achou.status || achou.obs || null,
        });
      }
    });
  });

  // dedup por ano, preferindo quem tem total
  const byYear = new Map();
  out.forEach(h => {
    const ex = byYear.get(h.ano);
    if (!ex || (ex.total == null && h.total != null)) byYear.set(h.ano, h);
  });

  return Array.from(byYear.values()).sort((a, b) => b.ano - a.ano);
}
const historicoNacionalPorSlug = {
  'arroxa-o-no': [
    { ano: 2005, evento: 'CONFEBRAQ', resultado: 'Vice nacional' },
    { ano: 2017, evento: 'CONFEBRAQ', resultado: 'Campe&atilde; nacional' },
    { ano: 2024, evento: 'CONFEBRAQ', resultado: 'Campe&atilde; nacional' },
  ],
  'formiga-da-roca': [
    { ano: 2023, evento: 'CONFEBRAQ', resultado: 'Vice nacional' },
  ],
  'mala-veia': [
    { ano: 2006, evento: 'CONFEBRAQ', resultado: 'Campe&atilde; nacional' },
  ],
  'si-bobia-a-gente-pimba': [
    { ano: 2019, evento: 'CONFEBRAQ', resultado: 'Campe&atilde; nacional' },
  ],
};

const historicoNacionalPorNome = {
  'arroxa o no': historicoNacionalPorSlug['arroxa-o-no'],
  'formiga da roca': historicoNacionalPorSlug['formiga-da-roca'],
  'mala veia': historicoNacionalPorSlug['mala-veia'],
  'si bobia a gente pimba': historicoNacionalPorSlug['si-bobia-a-gente-pimba'],
};

function getHistoricoNacional(quad) {
  if (!quad) return null;
  const slugKey = (quad.slug || '').toLowerCase().trim();
  if (slugKey && historicoNacionalPorSlug[slugKey]) return historicoNacionalPorSlug[slugKey];
  const nomeKey = normalize(quad.nome || '').replace(/\s+/g, ' ').trim();
  return historicoNacionalPorNome[nomeKey] || null;
}
/** Tabela do histórico */
function renderHistoricoTable(historico) {
  const wrapper = document.getElementById('historicoWrapper');
  if (!wrapper) return;

  if (!historico || historico.length === 0) {
    wrapper.innerHTML = '<p class="muted" style="padding:16px;">Essa quadrilha ainda não tem histórico cadastrado no circuito.</p>';
    return;
  }

  const rows = historico.map(h => {
    const pontos = (typeof h.total === 'number')
      ? h.total.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
      : (h.total ?? '-');
    const posStr = h.pos ? `${h.pos}º` : '-';
    const grupoStr = h.grupo || '-';
    return `
      <tr>
        <td>${h.ano}</td>
        <td>${grupoStr}</td>
        <td>${posStr}</td>
        <td>${pontos}</td>
      </tr>
    `;
  }).join('');

  wrapper.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Ano</th>
          <th>Grupo</th>
          <th>Posição</th>
          <th>Pontuação total</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

function renderHistoricoNacional(quad) {
  const historico = getHistoricoNacional(quad);
  if (!historico || historico.length === 0) return;

  const wrapper = document.getElementById('historicoWrapper');
  const referencia = wrapper ? wrapper.closest('section') : null;
  if (!referencia || !referencia.parentElement) return;

  const rows = historico.map(h => `
      <tr>
        <td>${h.ano}</td>
        <td>${h.evento || '-'}</td>
        <td>${h.resultado || '-'}</td>
      </tr>
    `).join('');

  const section = document.createElement('section');
  section.className = 'section';
  section.style.paddingTop = '0';
  section.innerHTML = `
    <h2 class="section-title" style="text-align: left; margin-bottom: 1rem;">Hist&oacute;rico nos Nacionais</h2>
    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Ano</th>
            <th>Evento</th>
            <th>Resultado</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;

  referencia.parentElement.insertBefore(section, referencia.nextSibling);
}

function getPortfolioItems(acervo, quadId, limit = 6) {
  const items = [];
  const data = acervo || {};
  Object.keys(data).forEach((year) => {
    const list = data[year] || [];
    list.forEach((item) => {
      if (String(item.quad_id || '') === String(quadId || '')) {
        items.push({ ...item, year });
      }
    });
  });

  return items
    .sort((a, b) => (b.data || '').localeCompare(a.data || ''))
    .slice(0, limit);
}

function buildPortfolioCard(item) {
  const thumb = normalizeImageUrl(item.thumb || item.arquivo, 'assets/banners/placeholder.jpg');
  const href = normalizeImageUrl(item.arquivo, '#');
  const tipo = (item.tipo || 'arquivo').toUpperCase();
  const titulo = item.titulo || 'Portfólio da quadrilha';
  const descricao = item.descricao || '';
  const botao = item.tipo === 'video'
    ? 'Assistir'
    : item.tipo === 'album'
      ? 'Abrir galeria'
      : item.tipo === 'pdf'
        ? 'Ver documento'
        : 'Ver foto';

  return `
    <article class="media-card">
      <div class="media-thumb">
        <img src="${thumb}" alt="${titulo}" loading="lazy" decoding="async">
        <span class="chip chip-light">${tipo}</span>
      </div>
      <div class="media-body">
        <h3>${titulo}</h3>
        ${descricao ? `<p class="media-desc">${descricao}</p>` : ''}
        <div class="media-actions">
          <a class="btn btn-light btn-sm" href="${href}" target="_blank" rel="noopener">${botao}</a>
        </div>
      </div>
    </article>
  `;
}

function renderLandingSections(quad, acervoItems) {
  const main = document.querySelector('main');
  if (!main) return;

  const container = main.querySelector('.container');
  if (!container) return;

  const instagramHandle = quad.instagram || '';
  const handle = instagramHandle.startsWith('@') ? instagramHandle.slice(1) : instagramHandle;
  const instaUrl = handle ? `https://instagram.com/${handle}` : '';
  const cidade = quad.cidade || '';
  const uf = quad.uf ? `/${quad.uf}` : '';
  const grupo = quad.grupo || '';
  const basePath = window.location.pathname.includes('/quadrilha/') ? '../' : '';

  const ctaSection = `
    <section class="section quadrilha-cta">
      <div class="container">
        <article class="card quadrilha-cta-card">
          <div class="card-body">
            <h2 class="card-title">Contrate a ${quad.nome}</h2>
            <p class="card-text">
              Shows juninos, apresentações culturais e participação em eventos no DF, Entorno e outras cidades.
              Estrutura completa de elenco e produção para festivais, festas públicas e programações privadas.
              ${instaUrl ? 'Chame no Instagram para orçamento e agenda — a quadrilha responde com brevidade.' : ''}
            </p>
            <div class="hero-actions quadrilha-cta-actions">
              ${instaUrl ? `<a class="btn" href="${instaUrl}" target="_blank" rel="noopener">Quero contratar</a>` : ''}
            </div>
          </div>
        </article>
      </div>
    </section>
  `;

  const insertPoint = container.querySelector('.quadrilha-about');
  if (insertPoint) {
    insertPoint.insertAdjacentHTML('afterend', `${ctaSection}`);
  } else {
    main.insertAdjacentHTML('beforeend', `${ctaSection}`);
  }
}


function updateSeoMeta(quad, coverUrl, resumo) {
  const nome = quad.nome || 'Quadrilha Junina';
  const cidade = quad.cidade || '';
  const uf = quad.uf ? `/${quad.uf}` : '';
  const tema = quad.perfil?.tema_2025 ? `Tema 2025: ${quad.perfil.tema_2025}.` : '';
  const description = `${nome} de ${cidade}${uf}. Contrata\u00e7\u00e3o, portf\u00f3lio, equipe, fotos e v\u00eddeos. ${tema}`.trim();

  document.title = `${nome} | LINQ-DFE`;

  const setMeta = (selector, attr, value) => {
    if (!value) return;
    let el = document.head.querySelector(selector);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attr.includes('property') ? 'property' : 'name', attr);
      document.head.appendChild(el);
    }
    el.setAttribute('content', value);
  };

  setMeta('meta[name="description"]', 'description', description);
  setMeta('meta[property="og:title"]', 'og:title', `${nome} | LINQ-DFE`);
  setMeta('meta[property="og:description"]', 'og:description', description);
  setMeta('meta[property="og:type"]', 'og:type', 'website');
  setMeta('meta[property="og:image"]', 'og:image', coverUrl);
  setMeta('meta[property="og:url"]', 'og:url', quad.slug ? `https://linqdfe.com.br/quadrilha/${quad.slug}` : 'https://linqdfe.com.br/quadrilhas.html');
  setMeta('meta[name="twitter:card"]', 'twitter:card', 'summary_large_image');
  setMeta('meta[name="twitter:title"]', 'twitter:title', `${nome} | LINQ-DFE`);
  setMeta('meta[name="twitter:description"]', 'twitter:description', description);
  setMeta('meta[name="twitter:image"]', 'twitter:image', coverUrl);

  const canonical = document.querySelector('link[rel="canonical"]');
  if (canonical && quad.slug) {
    canonical.setAttribute('href', `https://linqdfe.com.br/quadrilha/${quad.slug}`);
  }

  const ldId = 'quadrilha-ld-json';
  let ld = document.getElementById(ldId);
  if (!ld) {
    ld = document.createElement('script');
    ld.type = 'application/ld+json';
    ld.id = ldId;
    document.head.appendChild(ld);
  }

  const instagramHandle = quad.instagram || '';
  const handle = instagramHandle.startsWith('@') ? instagramHandle.slice(1) : instagramHandle;
  const instaUrl = handle ? `https://instagram.com/${handle}` : '';
  const data = {
    '@context': 'https://schema.org',
    '@type': 'DanceGroup',
    name: nome,
    areaServed: cidade ? `${cidade}${uf}` : undefined,
    description: resumo || description,
    url: quad.slug ? `https://linqdfe.com.br/quadrilha/${quad.slug}` : 'https://linqdfe.com.br/quadrilhas.html',
    image: coverUrl,
    sameAs: instaUrl ? [instaUrl] : undefined,
  };

  ld.textContent = JSON.stringify(data);
}
/** Preenche cabeçalho + temporada + ficha */
function renderQuadrilhaInfo(quad, historico) {
  document.title = `${quad.nome} | LINQ-DFE`;

  const coverEl = document.getElementById('quadrilhaCover');
  const nomeEl = document.getElementById('quadrilhaNome');
  const resumoEl = document.getElementById('quadrilhaResumo');
  const cidadeEl = document.getElementById('quadrilhaCidade');
  const grupoEl = document.getElementById('quadrilhaGrupo');
  const instagramEl = document.getElementById('quadrilhaInstagram');

  const sobreEl = document.getElementById('quadrilhaSobre');
  const infoListEl = document.getElementById('quadrilhaInfoList');

  const perfil = quad.perfil || {};
  let coverUrl = normalizeImageUrl('assets/banners/placeholder.jpg', 'assets/banners/placeholder.jpg');

  // Capa (usa foto_capa se existir, com focal para rosto)
  if (coverEl) {
    const candidates = getQuadrilhaPhotoCandidates(quad, true);
    applyImageCandidates(coverEl, candidates, "assets/banners/placeholder.jpg");
    coverUrl = candidates[0] || coverUrl;
    coverEl.alt = quad.nome;
    coverEl.style.objectFit = 'cover';
    if (quad.focal) {
      applyFocal(coverEl, quad.focal);
    } else {
      coverEl.style.objectPosition = '50% 25%';
    }
  }

  // Título e metadados
  if (nomeEl) nomeEl.textContent = quad.nome;
  if (cidadeEl) cidadeEl.textContent = quad.cidade || '—';
  if (grupoEl) grupoEl.textContent = quad.grupo || '—';

  if (instagramEl) {
    if (quad.instagram) {
      instagramEl.textContent = quad.instagram;
      const handle = quad.instagram.startsWith('@') ? quad.instagram.slice(1) : quad.instagram;
      instagramEl.href = `https://instagram.com/${handle}`;
    } else {
      instagramEl.textContent = '—';
      instagramEl.removeAttribute('href');
    }
  }


  // Resumo (primeira frase da bio)
  if (resumoEl) {
    if (perfil.bio) {
      const dot = perfil.bio.indexOf('.');
      resumoEl.textContent = dot > 0 ? perfil.bio.slice(0, dot + 1) : perfil.bio;
    } else {
      const cidade = quad.cidade || '';
      const grupo = quad.grupo || '';
      resumoEl.textContent = `${quad.nome} é uma quadrilha junina de ${cidade}, da LINQ-DFE e integrante do Grupo ${grupo}.`;
    }
  }

  updateSeoMeta(quad, coverUrl, resumoEl ? resumoEl.textContent : '');

  // ===== TEMPORADA 2025 (bio + descrição) =====
  if (sobreEl) {
    const partes = [];
    if (perfil.bio) partes.push(`<p>${perfil.bio}</p>`);
    if (perfil.tema_2025) partes.push(`<p><strong>Tema 2025:</strong> "${perfil.tema_2025}".</p>`);
    const desc = perfil.temporada_2025_descricao || '';
    if (desc) partes.push(`<p>${desc}</p>`);
    sobreEl.innerHTML = partes.length ? partes.join('') : '<p>Em breve.</p>';
  }

  // ===== Ficha =====
  if (infoListEl) {
    infoListEl.innerHTML = `
      <li><strong>Cidade / UF:</strong> ${quad.cidade || '—'}</li>
      <li><strong>Idade do grupo:</strong> ${perfil.idade_grupo || '—'}</li>
      <li><strong>Elenco aproximado:</strong> ${perfil.elenco_aproximado || '—'}</li>
      <li><strong>Marcador:</strong> ${perfil.marcador || '—'}</li>
      <li><strong>Casal de noivos 2025:</strong> ${perfil.casal_noivos_2025 || '—'}</li>
      <li><strong>Temporada 2025:</strong> ${perfil.tema_2025 ? `"${perfil.tema_2025}"` : '—'}</li>
    `;
  }
}

/** Init */
async function init() {
  const { id, slug } = getKeyFromUrl();

  const [quadrilhas, historicoCircuitoRaw, acervoRaw] = await Promise.all([
    loadJSON('data/quadrilhas.json'),
    loadJSON('data/historico_circuito.json'),
    loadJSON('data/acervo.json'),
  ]);

  const lista = quadrilhas || [];
  const historicoCircuito = historicoCircuitoRaw || {};

  let quad = null;
  if (id) {
    quad = lista.find(q => Number(q.id) === id) || null;
  }
  if (!quad && slug) {
    const low = slug.toLowerCase();
    quad = lista.find(q => (q.slug || '').toLowerCase() === low) ||
           lista.find(q => (q.nome || '').toLowerCase() === low) || null;
  }

  if (!quad) {
    const main = document.querySelector('main');
    if (main) {
      main.innerHTML = `
        <section class="section"><div class="container">
          <p>Quadrilha não encontrada. Volte para <a href="/quadrilhas.html">quadrilhas</a>.</p>
        </div></section>`;
    }
    return;
  }

  const historico = buildHistorico(quad, historicoCircuito);
  const acervo = acervoRaw || {};
  const portfolio = getPortfolioItems(acervo, quad.id, 6);

  renderQuadrilhaInfo(quad, historico);
  renderLandingSections(quad, portfolio);
  renderHistoricoTable(historico);
  renderHistoricoNacional(quad);
  setActiveNav();
}

init();

