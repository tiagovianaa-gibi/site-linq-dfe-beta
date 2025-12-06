/* ============================================
   QUADRILHA.JS - Página de perfil da quadrilha
   ============================================ */
import { loadJSON, getQuadrilhaPhoto, applyFocal, setActiveNav } from './shared.js';

/** Lê ?id=123 (prioritário) ou ?slug=... como fallback */
function getKeyFromUrl() {
  const p = new URLSearchParams(window.location.search);
  const id = p.get('id');
  const slug = p.get('slug') || p.get('q');
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

/** Preenche cabeçalho + temporada + ficha */
function renderQuadrilhaInfo(quad, historico) {
  document.title = `${quad.nome} | LINQ-DFE`;

  const coverEl = document.getElementById('quadrilhaCover');
  const nomeEl = document.getElementById('quadrilhaNome');
  const resumoEl = document.getElementById('quadrilhaResumo');
  const cidadeEl = document.getElementById('quadrilhaCidade');
  const grupoEl = document.getElementById('quadrilhaGrupo');
  const instagramEl = document.getElementById('quadrilhaInstagram');
  const pontosEl = document.getElementById('quadrilhaPontos');

  const sobreEl = document.getElementById('quadrilhaSobre');
  const infoListEl = document.getElementById('quadrilhaInfoList');

  const perfil = quad.perfil || {};

  // Capa (usa foto_capa se existir, com focal para rosto)
  if (coverEl) {
    coverEl.src = getQuadrilhaPhoto(quad, true);
    coverEl.alt = quad.nome;
    coverEl.onerror = function () { this.src = 'assets/banners/placeholder.jpg'; };
    coverEl.style.objectFit = 'cover';
    if (quad.focal) {
      applyFocal(coverEl, quad.focal);
    } else {
      coverEl.style.objectPosition = '50% 25%';
    }
  }

  // Título e metadados
  if (nomeEl) nomeEl.textContent = quad.nome;
  if (cidadeEl) cidadeEl.textContent = quad.cidade || '?"';
  if (grupoEl) grupoEl.textContent = quad.grupo || '?"';

  if (instagramEl) {
    if (quad.instagram) {
      instagramEl.textContent = quad.instagram;
      const handle = quad.instagram.startsWith('@') ? quad.instagram.slice(1) : quad.instagram;
      instagramEl.href = `https://instagram.com/${handle}`;
    } else {
      instagramEl.textContent = '?"';
      instagramEl.removeAttribute('href');
    }
  }

  if (pontosEl) {
    const ultimo = historico && historico[0];
    if (ultimo && ultimo.ano) {
      const pontos = (typeof ultimo.total === 'number')
        ? ultimo.total.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
        : (ultimo.total ?? '-');
      const posStr = ultimo.pos ? ` (${ultimo.pos}º lugar)` : '';
      pontosEl.textContent = `${pontos} pts ${ultimo.ano}${posStr}`;
    } else {
      pontosEl.textContent = '?"';
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
      resumoEl.textContent = `${quad.nome} é uma quadrilha junina de ${cidade}, filiada à LINQ-DFE e integrante do Grupo ${grupo}.`;
    }
  }

  // ===== TEMPORADA 2025 (bio + descrição) =====
  if (sobreEl) {
    const partes = [];
    if (perfil.bio) partes.push(`<p>${perfil.bio}</p>`);
    if (perfil.tema_2025) partes.push(`<p><strong>Tema 2025:</strong> ?o${perfil.tema_2025}?.</p>`);
    const desc = perfil.temporada_2025_descricao || '';
    if (desc) partes.push(`<p>${desc}</p>`);
    sobreEl.innerHTML = partes.length ? partes.join('') : '<p>Em breve.</p>';
  }

  // ===== Ficha =====
  if (infoListEl) {
    infoListEl.innerHTML = `
      <li><strong>Cidade / UF:</strong> ${quad.cidade || '?"'}</li>
      <li><strong>Idade do grupo:</strong> ${perfil.idade_grupo || '?"'}</li>
      <li><strong>Elenco aproximado:</strong> ${perfil.elenco_aproximado || '?"'}</li>
      <li><strong>Marcador:</strong> ${perfil.marcador || '?"'}</li>
      <li><strong>Casal de noivos 2025:</strong> ${perfil.casal_noivos_2025 || '?"'}</li>
      <li><strong>Temporada 2025:</strong> ${perfil.tema_2025 ? `?o${perfil.tema_2025}?` : '?"'}</li>
    `;
  }
}

/** Init */
async function init() {
  const { id, slug } = getKeyFromUrl();

  // carrega com cache-buster pra não sofrer com GitHub Pages
  const [quadrilhas, historicoCircuitoRaw] = await Promise.all([
    loadJSON(`data/quadrilhas.json?cb=${Date.now()}`),
    loadJSON(`data/historico_circuito.json?cb=${Date.now()}`),
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
          <p>Quadrilha não encontrada. Volte para <a href="filiadas.html">filiadas</a>.</p>
        </div></section>`;
    }
    return;
  }

  const historico = buildHistorico(quad, historicoCircuito);

  renderQuadrilhaInfo(quad, historico);
  renderHistoricoTable(historico);
  setActiveNav();
}

init();


